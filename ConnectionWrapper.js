const {EventEmitter} = require('events');
const {Observable} = require('rxjs');
const vscode = require('vscode');

class ConnectionWrapper {
  constructor(
    connection /*: WebSocketTransport */,
    searchDirectory /*: string */,
    mountDirectory /*: string */
  ) {
    this._connection = connection;
    this._searchDirectory = searchDirectory;
    this._mountDirectory = mountDirectory;
    this._nextId = 0;
    this._emitter = new EventEmitter();

    const observable = connection.onMessage();
    observable.subscribe({
      // Must use arrow function so that `this` is bound correctly.
      next: value => {
        const response = JSON.parse(value);
        this._emitter.emit(response.id, response);
      },
      error(err) {
        console.error('Error received in ConnectionWrapper', err);
      },
      complete() {
        console.error('ConnectionWrapper completed()?');
      }
    });
  }

  /**
   * This is for an RPC that expects a response.
   */
  makeRpc(method /*: string */, params /*: Object*/) /*: Promise */ {
    const id = (this._nextId++).toString(16);
    const promise = new Promise((resolve, reject) => {
      this._emitter.once(id, response => {
        if (response.error == null) {
          resolve(response.result);
        } else {
          reject(response.error);
        }
      });
    });

    const payload = {id, method, params};
    // Note that for the LSP, we would also need to send a header.
    this._connection.send(JSON.stringify(payload));
    return promise;
  }

  makeObservable(method /*: string */, params /*: Object*/) /*: Observable */ {
    return Observable.create(observer => {
      const id = (this._nextId++).toString(16);
      const payload = {id, method, params};
      this._connection.send(JSON.stringify(payload));
      // TODO: dispose of emitter subscription
      // TODO: send unsubscribe message
      this._emitter.on(id, response => {
        if (response.error != null) {
          observer.error(response.error);
        } else if (response.complete != null) {
          observer.complete();
        } else {
          observer.next(response.message);
        }
      });
    });
  }

  dispose() {
    this._emitter.removeAllListeners();
  }

  path2Uri(path /*: string*/) {
    // path should start with file://
    const uri = vscode.Uri.parse(path);
    return vscode.Uri.parse(
      'file://' + uri.path.replace(this._searchDirectory, this._mountDirectory)
    );
  }

  uri2Path(uri /*: vscode.Uri*/) {
    return uri.path.replace(this._mountDirectory, this._searchDirectory);
  }
}

exports.ConnectionWrapper = ConnectionWrapper;
