#!/usr/bin/env node

const fs = require('fs');
const { exec } = require('child_process');

class NpmSimulator {
  constructor() {
    this.packageJsonPath = './package.json';
  }

  install() {
    console.log("Simulating package installation...");
    try {
      const packageJson = JSON.parse(fs.readFileSync(this.packageJsonPath, 'utf8'));
      const dependencies = Object.keys(packageJson.dependencies || {});
      
      dependencies.forEach(dep => {
        console.log(`Installing ${dep}...`);
        setTimeout(() => {
          console.log(`${dep} installed.`);
        }, 1000);
      });
    } catch (error) {
      console.error('Error reading package.json:', error.message);
    }
  }

  update() {
    console.log("Updating packages...");
    setTimeout(() => {
      console.log("All packages updated.");
    }, 2000);
  }

  run(command) {
    if (!command) {
      console.log('No command provided to run.');
      return;
    }

    console.log(`Running command: ${command}`);
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing command: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`Error: ${stderr}`);
      }
      if (stdout) {
        console.log(`Output: ${stdout}`);
      }
    });
  }
}

// CLI Interface
const simulator = new NpmSimulator();
const [,, command, ...args] = process.argv;

switch(command) {
  case 'install':
    simulator.install();
    break;
  case 'update':
    simulator.update();
    break;
  case 'run':
    simulator.run(args.join(" "));
    break;
  default:
    console.log('Command not recognized. Available commands: install, update, run');
}
