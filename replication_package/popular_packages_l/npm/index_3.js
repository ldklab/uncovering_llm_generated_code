#!/usr/bin/env node

const fs = require('fs');
const { exec } = require('child_process');

class NpmSimulator {
  constructor() {
    this.packageJsonPath = './package.json';
  }

  async simulateDelay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async install() {
    console.log("Simulating package installation...");
    const packageJson = JSON.parse(fs.readFileSync(this.packageJsonPath, 'utf8'));
    const dependencies = Object.keys(packageJson.dependencies || {});

    for (const dep of dependencies) {
      console.log(`Installing ${dep}...`);
      await this.simulateDelay(1000);
      console.log(`${dep} installed.`);
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
      console.log(`Output: ${stdout}`);
      if (stderr) {
        console.error(`Errors: ${stderr}`);
      }
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
