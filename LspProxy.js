const stream = require('stream');
const {LanguageClient} = require('vscode-languageclient');

class LspProxy {
  constructor(connectionWrapper, language /*: string*/, mountDirectory) {
    this._subscriptions = [];

    let pushFunction = null;
    let pushQueue = [];

    const proxyReadStream = new stream.Readable({
      read: function(size) {
        while (pushQueue.length > 0) {
          const chunk = pushQueue[0];
          pushQueue.shift();
          if (!this.push(chunk)) {
            return;
          }
        }
        if (pushQueue.length === 0) {
          pushFunction = this.push.bind(this);
        }
      }
    });

    const readSubscription = connectionWrapper
      .makeObservable(`proxy-${language}-stdout`, {})
      .subscribe(message => {
        if (pushFunction != null) {
          if (!pushFunction(message)) {
            pushFunction = null;
          }
        } else {
          pushQueue.push(message);
        }
      });
    this._subscriptions.push({
      dispose: () => readSubscription.unsubscribe()
    });

    const proxyWriteStream = new stream.Writable({
      write: (chunk, encoding, next) => {
        connectionWrapper.makeRpc(`proxy-${language}-stdin`, {
          message: chunk.toString()
        });
        next();
      }
    });

    const client = new LanguageClient(
      `${language}Proxy`,
      () =>
        Promise.resolve({reader: proxyReadStream, writer: proxyWriteStream}),
      {
        documentSelector: [{language: language, pattern: `${mountDirectory}/**`}],
        uriConverters: {
          code2Protocol: connectionWrapper.uri2Path.bind(connectionWrapper),
          protocol2Code: connectionWrapper.path2Uri.bind(connectionWrapper)
        }
      }
    );

    // A disgusting hack to avoid passing the process ID (which can't be proxied.)
    const pidDescriptor = Object.getOwnPropertyDescriptor(process, 'pid');
    Object.defineProperty(process, 'pid', {value: null});
    this._subscriptions.push(client.start());
    client
      .onReady()
      .then(() => Object.defineProperty(process, 'pid', pidDescriptor));
  }

  dispose() {
    this._subscriptions.forEach(sub => sub.dispose());
    this._subscriptions = [];
  }
}

module.exports = LspProxy;
