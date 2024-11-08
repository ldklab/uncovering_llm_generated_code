// jake.js - A simple build automation tool for Node.js

const { exec } = require('child_process');
const fs = require('fs');

// Task storage
const tasks = {};

// Define a Jake task
function task(name, dependencies, action) {
  tasks[name] = { dependencies, action };
}

// Run the provided task
function run(taskName) {
  if (!tasks[taskName]) {
    console.error(`Task ${taskName} not found`);
    return;
  }

  const task = tasks[taskName];

  (function execute(deps) {
    if (deps.length === 0) {
      task.action();
    } else {
      const dep = deps.shift();
      run(dep);
      execute(deps);
    }
  })([...task.dependencies]);
}

// Example task definition
task('build', ['clean'], () => {
  console.log('Building the project...');
  // Simulate build with a shell command
  exec('echo "Building..."', (err) => {
    if (err) console.error('Build failed!', err);
  });
});

task('clean', [], () => {
  console.log('Cleaning the project...');
  // Simulate cleaning with a shell command
  exec('echo "Cleaning..."', (err) => {
    if (err) console.error('Clean failed!', err);
  });
});

// Read command-line arguments to run the task
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('No task specified');
} else {
  run(args[0]);
}

module.exports = { task };
