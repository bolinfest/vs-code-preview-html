class SimpleTextDocumentContentProvider {
  constructor(connectionWrapper) {
    this._connectionWrapper = connectionWrapper;
  }

  provideTextDocumentContent(uri/*: vscode.Uri*/)/*: string | Promise<string> */ {
    // Due to the construction of the vscode.Uri, uri.path is the absolute path
    // on the remote matchine.
    return this._connectionWrapper.makeRpc(
      'get-file-contents',
      {path: uri.path}
    ).then(response => response.contents);
  }
}

exports.SimpleTextDocumentContentProvider = SimpleTextDocumentContentProvider;
