// package.json
{
  "name": "material-ui-custom-manager",
  "version": "1.0.0",
  "description": "Custom manager for handling Material UI installation and information",
  "main": "index.js",
  "scripts": {
    "install-material-ui": "node install-material-ui.js",
    "open-docs": "node open-docs.js"
  },
  "author": "Your Name",
  "license": "MIT",
  "dependencies": {
    "open": "^8.4.0"
  }
}

// install-material-ui.js
const { exec } = require('child_process');

exec('npm install @mui/material @emotion/react @emotion/styled', (error, stdout, stderr) => {
    if (error) {
        console.error(`Error installing Material UI: ${error.message}`);
        return;
    }
    if (stderr) {
        console.error(`Installation stderr: ${stderr}`);
        return;
    }
    console.log(`Installation stdout: ${stdout}`);
});

// open-docs.js
const open = require('open');

open('https://mui.com/material-ui/').then(() => {
    console.log('Material UI documentation opened in browser.');
}).catch((error) => {
    console.error(`Error opening documentation: ${error.message}`);
});
