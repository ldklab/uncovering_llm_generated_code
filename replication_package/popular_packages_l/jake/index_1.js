// Simplified build tool for Node.js projects

const { exec } = require('child_process');

// Stores tasks by their names
const tasks = {};

// Function to define a task with dependencies and an action
function task(name, dependencies, action) {
  tasks[name] = { dependencies, action };
}

// Executes a given task by name
function run(taskName) {
  if (!tasks[taskName]) {
    return console.error(`Task ${taskName} not found`);
  }

  const task = tasks[taskName];
  (function execute(deps) {
    if (deps.length === 0) {
      return task.action();
    }

    const dep = deps.shift();
    run(dep);
    execute(deps);
  })([...task.dependencies]);
}

// Register tasks with dependencies
task('build', ['clean'], () => {
  console.log('Building...');
  exec('echo "Building..."', (err) => {
    if (err) console.error('Build failed:', err);
  });
});

task('clean', [], () => {
  console.log('Cleaning...');
  exec('echo "Cleaning..."', (err) => {
    if (err) console.error('Clean failed:', err);
  });
});

// Executes tasks specified in command-line arguments
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Specify a task to run');
} else {
  run(args[0]);
}

module.exports = { task };
