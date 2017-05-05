import React from 'react';
import ReactDOM from 'react-dom';
import ConnectionDialog from './ConnectionDialog';
import ConnectingSpinner from './ConnectingSpinner';
import FileSearch from './FileSearch';
import './index.css';


const rootElement = document.getElementById('root');

function showConnectionDialog(ws: WebSocket) {
  function onConnect(host, privateKey, serverCommand) {
    const message = {
      command: 'connect',
      host,
      privateKey,
      serverCommand,
    };
    ws.send(JSON.stringify(message));
    showConnecting();
  }
  ReactDOM.render(<ConnectionDialog onConnect={onConnect} />, rootElement);
}

function showConnecting() {
  ReactDOM.render(<ConnectingSpinner />, rootElement);
}

function main(webSocketPort: number) {
  const ws = new WebSocket(`ws://localhost:${webSocketPort}`);
  ws.onopen = function() {
    ws.onmessage = function(message) {
      const params = JSON.parse(message.data);
      const {command} = params;
      if (command === 'initialized.') {
        showConnectionDialog(ws);
      } else if (command === 'prompt') {
        // TODO(mbolin): Handle onKeyboardInteractive() here.
      } else if (command === 'remote-connection-established') {
        ReactDOM.render(<FileSearch />, rootElement);
      } else if (command === 'remote-connection-failed') {

      }
    };
    ws.send(JSON.stringify({command: 'initialized?'}));
  };
}

const WS_PORT = window.WS_PORT;
main(WS_PORT);
