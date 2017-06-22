const child_process = require('child_process');
const fs = require('fs');
const invariant = require('assert');

// Limit the number of results that are sent back to the client.
const MAX_RESULTS = 20;

// Apparently the way are dynamically require()'ing this file from NuclideServer.js
// prvents us from using `export default function`, so we have to use the more
// well-defined equivalent, `module.exports = function()`.
/**
 * @param {LauncherParameters} launcherParams is the type from
 *     big-dig/src/server/NuclideServer.
 * @return {Promise<void>} Note that this function must return a Promise to
 *     satisfy the contract of parseArgsAndRunMain().
 */
module.exports = function launch(launcherParams) {
  const {serverParams, webSocketServer} = launcherParams;
  const {searchDirectory} = serverParams;
  webSocketServer.on('connection', socket => {
    socket.on('message', data => {
      // For now, we assume that everything is JSON-RPC like without a header.
      const message = JSON.parse(data);
      const {id, method, params} = message;
      if (method === 'do-file-search') {
        const findArgs = ['.', '-type', 'f'];
        const query = params.query.trim();
        if (query) {
          findArgs.push('-iname', `*${query}*`);
        }
        child_process.execFile(
          'find',
          findArgs,
          {cwd: searchDirectory},
          (error, stdout, stderr) => {
            if (error == null) {
              const lines = stdout.toString().split('\n').slice(0, MAX_RESULTS);
              // Trim lines and return non-empty ones.
              // Each resulting line should be a path relative to `searchDirectory`.
              const results = lines.
                map(line => {
                  let lineNoWhitespace = line.trim();
                  if (lineNoWhitespace.startsWith('./')) {
                    lineNoWhitespace = lineNoWhitespace.substring(2);
                  }
                  return lineNoWhitespace;
                }).
                filter(line => line.length > 0);
              socket.send(
                JSON.stringify({
                  id,
                  result: {
                    results,
                  },
                })
              );
            } else {
              socket.send(
                JSON.stringify({
                  id,
                  error: String(error),
                })
              );
            }
          }
        );
      } else if (method === 'get-file-contents') {
        const {path} = params;
        readFileAsString(path).then(contents => {
          socket.send(
            JSON.stringify({
              id,
              result: {
                contents,
              },
            })
          );
        });
      }
    });
  });

  return Promise.resolve();
};

/**
 * @param {string} file
 * @param {=string} encoding
 * @return {Promise<string>}
 */
function readFileAsString(file, encoding = 'utf8') {
  return new Promise((resolve, reject) => {
    fs.readFile(file, {encoding}, (error, data) => {
      if (error == null) {
        invariant(typeof data === 'string');
        resolve(data);
      } else {
        reject(error);
      }
    });
  });
}
