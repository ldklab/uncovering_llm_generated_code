#!/usr/bin/env node

const fs = require('fs');
const { exec } = require('child_process');

class NpmSimulator {
  constructor() {
    this.packageJsonPath = './package.json';
  }
  
  simulateDelay(duration) {
    return new Promise(resolve => setTimeout(resolve, duration));
  }

  async install() {
    console.log("Simulating package installation...");
    try {
      const packageJson = JSON.parse(fs.readFileSync(this.packageJsonPath, 'utf8'));
      const dependencies = packageJson.dependencies || {};
      for (const dep in dependencies) {
        console.log(`Installing ${dep}...`);
        await this.simulateDelay(1000);
        console.log(`${dep} installed.`);
      }
    } catch (err) {
      console.error('Error reading package.json:', err.message);
    }
  }

  async update() {
    console.log("Updating packages...");
    await this.simulateDelay(2000);
    console.log("All packages updated.");
  }

  run(command) {
    console.log(`Running command: ${command}`);
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing command: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`stderr: ${stderr}`);
      }
      console.log(`Output: ${stdout}`);
    });
  }
}

const simulator = new NpmSimulator();
const [,, command, ...args] = process.argv;

switch(command) {
  case 'install':
    simulator.install().catch(err => console.error(err));
    break;
  case 'update':
    simulator.update().catch(err => console.error(err));
    break;
  case 'run':
    simulator.run(args.join(" "));
    break;
  default:
    console.log('Command not recognized. Available commands: install, update, run');
}
