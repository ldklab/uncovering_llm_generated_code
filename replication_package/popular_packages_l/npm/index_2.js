#!/usr/bin/env node

const fs = require('fs');
const { exec } = require('child_process');

class NpmSimulator {
  constructor() {
    this.packageJsonPath = './package.json';
    this.nodeModulesPath = './node_modules';
  }

  simulateDelay(message, duration) {
    return new Promise(resolve => {
      console.log(message);
      setTimeout(resolve, duration);
    });
  }

  async install() {
    console.log("Simulating package installation...");
    try {
      const packageJson = JSON.parse(fs.readFileSync(this.packageJsonPath, 'utf8'));
      const dependencies = Object.keys(packageJson.dependencies || {});
      
      for (const dep of dependencies) {
        await this.simulateDelay(`Installing ${dep}...`, 1000);
        console.log(`${dep} installed.`);
      }
    } catch (error) {
      console.error("Error reading package.json:", error.message);
    }
  }

  async update() {
    console.log("Updating packages...");
    await this.simulateDelay("All packages updated.", 2000);
  }

  run(command) {
    console.log(`Running command: ${command}`);
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing command: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`Command error output: ${stderr}`);
        return;
      }
      console.log(`Output: ${stdout}`);
    });
  }
}

const simulator = new NpmSimulator();
const [,, command, ...args] = process.argv;

async function main() {
  switch(command) {
    case 'install':
      await simulator.install();
      break;
    case 'update':
      await simulator.update();
      break;
    case 'run':
      simulator.run(args.join(" "));
      break;
    default:
      console.log('Command not recognized. Available commands: install, update, run');
  }
}

main();
