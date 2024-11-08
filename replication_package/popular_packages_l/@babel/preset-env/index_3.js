const { exec } = require('child_process');

// Command to install Babel packages as development dependencies
const installCommand = 'npm install --save-dev @babel/core @babel/cli @babel/preset-env';

// Execute the command
exec(installCommand, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error executing command: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`Shell error: ${stderr}`);
    return;
  }
  console.log(`Command Output:\n${stdout}`);
});
