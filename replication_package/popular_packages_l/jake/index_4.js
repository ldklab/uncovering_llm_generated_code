// simpleBuild.js - A simple build automation tool for Node.js

const { exec } = require('child_process');

// Task storage
const tasks = {};

// Define a task with dependencies and an action
function defineTask(name, dependencies = [], action) {
  tasks[name] = { dependencies, action };
}

// Execute a given task by name
function executeTask(taskName) {
  const task = tasks[taskName];
  if (!task) {
    console.error(`Task ${taskName} not found`);
    return;
  }

  const { dependencies, action } = task;
  
  (function runDependencies(deps) {
    if (deps.length === 0) {
      action();
    } else {
      const currentDependency = deps.shift();
      executeTask(currentDependency);
      runDependencies(deps);
    }
  })([...dependencies]);
}

// Define example tasks
defineTask('build', ['clean'], () => {
  console.log('Building the project...');
  exec('echo "Building..."', (err) => {
    if (err) console.error('Error in build process', err);
  });
});

defineTask('clean', [], () => {
  console.log('Cleaning the project...');
  exec('echo "Cleaning..."', (err) => {
    if (err) console.error('Error in clean process', err);
  });
});

// Execute the specified task from command-line arguments
const [defaultTask] = process.argv.slice(2);
if (!defaultTask) {
  console.error('No task specified');
} else {
  executeTask(defaultTask);
}

module.exports = { defineTask };
