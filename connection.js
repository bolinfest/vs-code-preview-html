var {SshHandshake} = require('nuclide-proxy/src/client/SshHandshake-entry.js');
var invariant = require('assert');

/**
 * @param ws is a WebSocket client of the WebSocket server created for a
 *     connection UI.
 */
function createConnection(username, host, pathToPrivateKey, remoteServerCommand, ws, searchDirectory) {
  return new Promise((resolve, reject) => {
    const sshHandshake = new SshHandshake({
      onKeyboardInteractive(
        name,
        instructions,
        instructionsLang,
        prompts,
        finish
      ) {
        invariant(prompts.length > 0);
        // TODO(mbolin): Need to listen for responses to prompts. Should be
        // received as an array of strings and passed to finish().
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
