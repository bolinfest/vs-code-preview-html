// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
var vscode = require('vscode');
var {Server: WebSocketServer} = require('ws');

const previewUri = vscode.Uri.parse('vs-code-html-preview://authority/vs-code-html-preview');

function onDidWebSocketServerStartListening(server, context) {
  // It would be better to find a sanctioned way to get the port.
  var {port} = server._server.address();

  server.on('connection', ws => {
    // Note that message is always a string, never a Buffer.
    ws.on('message', message => {
      if (typeof message === 'string') {
        console.log(`Message received in Extension Host: ${message}`);
        ws.send('Roger that.');
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
  Mouseover the red square to verify inline event handlers work:
  <div style="background-color: red; width: 100px; height: 100px" onmouseover="console.log('in')"></div>
  <a href="command:workbench.action.showCommands">Show command palette (this is an anchor with a <code>command:</code> href</a>
  <p>
  <span id="fakelink" class="fakelink">This uses a hack to invoke a VS Code command.</span>
  <p>
  <span id="fetch" class="fakelink">try calling <code>fetch()</code> (see console)</span>
  <script>var WS_PORT = ${port};</script>
  <script src="file://${context.asAbsolutePath('example.js')}"></script>
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
