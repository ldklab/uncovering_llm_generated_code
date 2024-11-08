// simpleBuildTool.js - A basic build automation tool for Node.js

const { exec } = require('child_process');

// Storage for defined tasks
const taskList = {};

// Function to define a new task
function defineTask(name, dependencies, action) {
  taskList[name] = { dependencies, action };
}

// Function to execute a specified task
function executeTask(taskName) {
  if (!taskList[taskName]) {
    console.error(`No such task: ${taskName}`);
    return;
  }

  const { dependencies, action } = taskList[taskName];

  function runDependencies(deps) {
    if (deps.length === 0) {
      action();
    } else {
      const currentDep = deps.shift();
      executeTask(currentDep);
      runDependencies(deps);
    }
  }

  runDependencies([...dependencies]);
}

// Define example tasks
defineTask('build', ['clean'], () => {
  console.log('Building the project...');
  exec('echo "Building..."', (err) => {
    if (err) console.error('Build process failed!', err);
  });
});

defineTask('clean', [], () => {
  console.log('Performing project cleanup...');
  exec('echo "Cleaning..."', (err) => {
    if (err) console.error('Cleanup process failed!', err);
  });
});

// Extract command-line arguments to execute tasks
const tasksToRun = process.argv.slice(2);
if (tasksToRun.length === 0) {
  console.error('No task specified to run');
} else {
  executeTask(tasksToRun[0]);
}

module.exports = { defineTask };
