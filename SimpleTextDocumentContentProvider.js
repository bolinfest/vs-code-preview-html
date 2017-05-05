class SimpleTextDocumentContentProvider {
  constructor(connection) {
    // connection is a WebSocketTransport from nuclide-proxy.
    this._connection = connection;
  }

  provideTextDocumentContent(uri/*: vscode.Uri*/)/*: string | Promise<string> */ {
    // TODO(mbolin): Fetch the contents via _connection.
    return '<!doctype html><html><body>I am HTML content!</body></html>';
  }
}

exports.SimpleTextDocumentContentProvider = SimpleTextDocumentContentProvider;
