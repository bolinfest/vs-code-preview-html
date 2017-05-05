const invariant = require('assert');
const vscode = require('vscode');
const {Server: WebSocketServer} = require('ws');
const {createConnection} = require('./connection');
const {ConnectionWrapper} = require('./ConnectionWrapper');
const {SimpleTextDocumentContentProvider} = require('./SimpleTextDocumentContentProvider');

const previewUri = vscode.Uri.parse('vs-code-html-preview://authority/vs-code-html-preview');

// TODO(mbolin): Make this configurable via the connection dialog.
const searchDirectory = '/data/users/mbolin/fbsource';

function onDidWebSocketServerStartListening(server, context) {
  // It would be better to find a sanctioned way to get the port.
  const {port} = server._server.address();

  server.on('connection', ws => {
    // This is a WebSocketTransport from nuclide-proxy.
    let connection;
    let connectionWrapper;
    let simpleContentProvider;

    // Note that message is always a string, never a Buffer.
    ws.on('message', message => {
      if (typeof message !== 'string') {
        console.error(`Unhandled message type: ${typeof message}`);
      }

      const params = JSON.parse(message);
      console.info(`Message received in Extension Host: ${JSON.stringify(message, null, 2)}`);
      const {command} = params;
      if (command === 'initialized?') {
        ws.send(JSON.stringify({command: 'initialized.'}));
      } else if (command === 'connect') {
        const {host, privateKey, serverCommand} = params;
        const pathToPrivateKey = privateKey.startsWith('~')
          ? privateKey.replace('~', process.env.HOME)
          : privateKey;

        const username = process.env.USER;
        createConnection(
          username,
          host,
          pathToPrivateKey,
          serverCommand,
          ws
        ).then(webSocketTransport => {
          connection = webSocketTransport;
          connectionWrapper = new ConnectionWrapper(connection);

          context.subscriptions.push(connectionWrapper);
          context.subscriptions.push({dispose() {connection.close()}});

          simpleContentProvider = new SimpleTextDocumentContentProvider(connectionWrapper);
          context.subscriptions.push(
            vscode.workspace.registerTextDocumentContentProvider(
              'nuclide',
              simpleContentProvider)
          );

          ws.send(JSON.stringify({command: 'remote-connection-established'}));
        }).catch(error => {
          ws.send(JSON.stringify({command: 'remote-connection-failed', error: String(error)}));
        });
      } else if (command === 'remote-file-search-query') {
        const {query} = params;
        console.info(`${command} for ${query}`);
        connectionWrapper.makeRpc('do-file-search', {query}).then(
          response => {
            ws.send(JSON.stringify({
              command: 'remote-file-search-results',
              query,
              results: response.results,
            }));
          }
        );
      } else if (command === 'remote-file-search-open') {
        const {file} = params;
        const address = connection.getAddress();
        const remotePath = `${searchDirectory}/${file}`;
        const uri = `${address.replace(/^wss?:/, 'nuclide:')}${remotePath}`;
        vscode.workspace.openTextDocument(vscode.Uri.parse(uri)).then(
          textDocument => vscode.window.showTextDocument(textDocument),
          error => console.error(`Failed to open text document for uri '${uri}'`, error));
      } else {
        console.error(`Unhandled command: ${command}`);
      }
    });
  });

  const textDocumentContentProvider = {
    // Note that this is rendered as HTML because it is used with the
    // `vscode.previewHtml` command.
    provideTextDocumentContent(uri/*: vscode.Uri*/)/*: string*/ {
      return `
<!doctype html>
<html>
<head>
  <link rel="STYLESHEET" type="text/css" href="file://${context.asAbsolutePath('file-opener-ui/build/out.css')}">
</head>
<body>
  <div id="root"></div>
  <script>var WS_PORT = ${port};</script>
  <script src="file://${context.asAbsolutePath('file-opener-ui/build/out.js')}"></script>
</body>
</html>
      `
    },
  };
  context.subscriptions.push(
    vscode.workspace.registerTextDocumentContentProvider(
      'vs-code-html-preview',
      textDocumentContentProvider)
  );
}

function activate(context) {
  console.log('Congratulations, your extension "vs-code-preview-html" is now active!');

  var promise = new Promise((resolve, reject) => {
    // Note that one drawback to the current implementation is that no
    // authentication is done on the WebSocket, so any user on the local host
    // can connect to it.
    var server = new WebSocketServer({port: 0});
    server.on('listening', () => {
      onDidWebSocketServerStartListening(server, context);
      resolve();
    });

    context.subscriptions.push(
      new vscode.Disposable(() => {
        server.close();      
      })
    );

    // Note that the following code relies on the second argument to
    // registerCommand() being executed asynchronously because `promise` has not
    // been assigned yet.
    var disposable = vscode.commands.registerCommand('extension.testPreviewHtmlCommunication', function () {
      promise.then(() => {
        vscode.commands.executeCommand(
          'vscode.previewHtml',
          previewUri,
          vscode.ViewColumn.Two,
          'My Window'
        ).then(null, error => console.error(error));
      });
    });

    context.subscriptions.push(disposable);
  });
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}
exports.deactivate = deactivate;
