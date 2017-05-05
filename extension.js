// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
var vscode = require('vscode');
var {Server: WebSocketServer} = require('ws');
var {createConnection} = require('./connection');

const previewUri = vscode.Uri.parse('vs-code-html-preview://authority/vs-code-html-preview');

function onDidWebSocketServerStartListening(server, context) {
  // It would be better to find a sanctioned way to get the port.
  var {port} = server._server.address();

  server.on('connection', ws => {
    // This is a WebSocketTransport from nuclide-proxy.
    var connection = null;

    // Note that message is always a string, never a Buffer.
    ws.on('message', message => {
      if (typeof message === 'string') {
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
            ws.send(JSON.stringify({command: 'remote-connection-established'}));
          }).catch(error => {
            ws.send(JSON.stringify({command: 'remote-connection-failed', error: String(error)}));
          });
        }
      } else {
        console.error(`Unhandled message type: ${typeof message}`);
      }
    });
  });

  var textDocumentContentProvider = {
    provideTextDocumentContent(uri/*: vscode.Uri*/)/*: string*/ {
      return `
<!doctype html>
<html>
<head>
  <style>
  .fakelink {
    cursor: pointer;
    text-decoration: underline;
  }
  </style>
</head>
<body>
  <script>var WS_PORT = ${port};</script>
  <script src="file://${context.asAbsolutePath('example.js')}"></script>
  <div id="contents">
    <div>Connect to a remote server</div>
    <form onsubmit="tryToConnect()">
      <div>
        Host: <input id="connect-host" value="localhost" size="75">
      </div>
      <div>
        Private Key: <input id="connect-private-key" value="~/.ssh/test_id_rsa" size="75">
      </div>
      <div>
        Remote Server Command: <input id="connect-server-command" value="/usr/local/bin/node /Users/mbolin/fbsource/fbobjc/Tools/Nuclide/modules/nuclide-proxy/src/server/cli-entry.js" size="75">
      </div>
      <div>
        <input type="submit" id="connect-submit" value="Connect" disabled>
      </div>
    </form>
  </div>
</body>
</html>
      `;
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
function deactivate() {
}
exports.deactivate = deactivate;
