#!/usr/bin/env node

const fs = require('fs');
const { exec } = require('child_process');

class NpmSimulator {
  constructor() {
    this.packageJsonPath = './package.json';
    this.nodeModulesPath = './node_modules';
  }

  install() {
    console.log("Simulating package installation...");
    // For each dependency in package.json, pretend to install it
    const packageJson = JSON.parse(fs.readFileSync(this.packageJsonPath, 'utf8'));
    const dependencies = Object.keys(packageJson.dependencies || {});
    
    dependencies.forEach(dep => {
      console.log(`Installing ${dep}...`);
      // Simulate some delay
      setTimeout(() => {
        console.log(`${dep} installed.`);
      }, 1000);
    });
  }

  update() {
    console.log("Updating packages...");
    // Simulate updating each package
    setTimeout(() => {
      console.log("All packages updated.");
    }, 2000);
  }

  run(command) {
    console.log(`Running command: ${command}`);
    // Execute command via child_process
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing command: ${error.message}`);
        return;
      }
      console.log(`Output: ${stdout}`);
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
