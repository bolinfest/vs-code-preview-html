var {SshHandshake} = require('nuclide-proxy/src/client/SshHandshake-entry.js');
var invariant = require('assert');

/**
 * @param ws is a WebSocket client of the WebSocket server created for a
 *     connection UI.
 */
function createConnection(username, host, pathToPrivateKey, remoteServerCommand, ws) {
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
        const {prompt, echo} = prompts[0];
        // TODO(mbolin): Use ws for prompt.
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
      cwd: 'This is currently unused',
      remoteServerCommand,
      password: '', // Should probably be nullable because of the authMethod.
      displayTitle: 'used when serializing the connection',
    });
  });  
}

exports.createConnection = createConnection;
