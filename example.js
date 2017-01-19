function runCommand(command) {
  var anchor = document.createElement('a');
  anchor.href = `command:${command}`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  console.log(`tried to run '${command}'`);
}

document.getElementById('fakelink')
  .addEventListener('click', () => runCommand('workbench.action.showCommands'), false);

function tryFetch() {
  var url = 'https://www.google.com';
  fetch(url)
    .then(response => {
      console.log(`is ok? ${response.ok}`);
      // This works as expected, but it muddies the console, so we disable it
      // for now.
      // response.text().then(
      //   text => console.log(`Text of ${url} is: ${text}`),
      //   error => console.error(`Failed to get text() of ${url}: ${error}`)
      // );
    });
}

document.getElementById('fetch')
  .addEventListener('click', tryFetch, false);

var ws = new WebSocket(`ws://localhost:${WS_PORT}`);
ws.onopen = function() {
  ws.onmessage = function(message) {
    console.log(`Message received in Embedded Pane: ${message.data}`);
  };
  ws.send('I have a message for you!');
};
