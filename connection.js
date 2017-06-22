var {SshHandshake} = require('big-dig/src/client/SshHandshake');
var invariant = require('assert');

/**
 * @param ws is a WebSocket client of the WebSocket server created for a
 *     connection UI.
 */
function createConnection(username, host, pathToPrivateKey, remoteServerCommand, ws, searchDirectory) {
  return new Promise((resolve, reject) => {
    let lastFinishCallback;

    function onFinish(responses) {
      lastFinishCallback(responses);
    }

    const sshHandshake = new SshHandshake({
      onKeyboardInteractive(
        name,
        instructions,
        instructionsLang,
        prompts,
        finish
      ) {
        invariant(prompts.length > 0);
        lastFinishCallback = finish;

        // TODO: Remove this listener, when appropriate.
        ws.on('message', message => {
          if (typeof message !== 'string') {
            console.error(`Unhandled message type: ${typeof message}`);
            return;
          }

          const params = JSON.parse(message);
          if (params.command === 'keyboard-interactive-responses') {
            lastFinishCallback(params.responses);
          }
        });

        ws.send(JSON.stringify({
          command: 'prompt',
          prompts,
        }));
      },

      onWillConnect() {},

      onDidConnect(connection, config) {
        resolve(connection);
      },

      onError(errorType, error, config) {
        reject(error);
      },
    });

    sshHandshake.connect({
      host,
      sshPort: 22,
      username,
      pathToPrivateKey,
      authMethod: 'PRIVATE_KEY',
      remoteServerCommand,
      remoteServerCustomParams: {
        searchDirectory,
      },
      password: '', // Should probably be nullable because of the authMethod.
    });
  });
}

exports.createConnection = createConnection;
