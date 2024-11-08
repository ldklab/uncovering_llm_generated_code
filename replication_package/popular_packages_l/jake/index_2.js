// simpleBuildTool.js - A basic build automation script for Node.js

const { exec } = require('child_process');

// Object to store tasks
const taskRegistry = {};

// Function to define a task
function defineTask(taskName, dependencies, action) {
  taskRegistry[taskName] = { dependencies, action };
}

// Function to run a specific task
function runTask(taskName) {
  const task = taskRegistry[taskName];
  if (!task) {
    console.error(`Task ${taskName} does not exist`);
    return;
  }

  (function executeDependencies(dependencies) {
    if (dependencies.length === 0) {
      task.action();
    } else {
      const dependency = dependencies.shift();
      runTask(dependency);
      executeDependencies(dependencies);
    }
  })([...task.dependencies]);
}

// Example task: 'build', depends on 'clean'
defineTask('build', ['clean'], () => {
  console.log('Starting the build process...');
  exec('echo "Executing build..."', (error) => {
    if (error) {
      console.error('Error during build!', error);
    }
  });
});

// Example task: 'clean', no dependencies
defineTask('clean', [], () => {
  console.log('Commencing cleanup...');
  exec('echo "Running cleanup..."', (error) => {
    if (error) {
      console.error('Error during cleanup!', error);
    }
  });
});

// Parse command-line arguments to initiate task execution
const commandLineArgs = process.argv.slice(2);
const taskToRun = commandLineArgs[0];
if (!taskToRun) {
  console.error('Task name is required');
} else {
  runTask(taskToRun);
}

module.exports = { defineTask };
