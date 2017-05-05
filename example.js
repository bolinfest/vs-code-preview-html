function $(id) {
  return document.getElementById(id);
}

var ws = new WebSocket(`ws://localhost:${WS_PORT}`);
ws.onopen = function() {
  ws.onmessage = function(message) {
    const params = JSON.parse(message.data);
    const {command} = params;
    if (command === 'initialized.') {
      $('connect-submit').disabled = false;
    } else if (command === 'prompt') {
      // TODO(mbolin): Handle onKeyboardInteractive() here.
    } else if (command === 'remote-connection-established') {
      document.body.innerText = 'Connected!';
    } else if (command === 'remote-connection-failed') {
      document.body.innerText = 'FAILED: ' + params.error;
    }
  };
  ws.send(JSON.stringify({command: 'initialized?'}));
};

function tryToConnect() {
  const message = {
    command: 'connect',
    host: $('connect-host').value,
    privateKey: $('connect-private-key').value,
    serverCommand: $('connect-server-command').value,
  };
  ws.send(JSON.stringify(message));
}
