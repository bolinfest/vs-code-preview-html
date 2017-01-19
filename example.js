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
