// tree-kill.js
const { exec } = require('child_process');

function treeKill(pid, signal = 'SIGTERM', callback) {
  if (typeof signal === 'function') {
    callback = signal;
    signal = 'SIGTERM';
  }

  if (typeof callback !== 'function') {
    callback = function() {};
  }

  // Sanitize input to avoid code injection vulnerability
  pid = parseInt(pid, 10);
  if (isNaN(pid)) {
    return process.nextTick(() => callback(new Error('Invalid PID')));
  }

  const platform = process.platform;
  let cmd;

  if (platform === 'win32') {
    // Windows command to kill a process tree
    cmd = `taskkill /pid ${pid} /T /F`;
  } else if (platform === 'darwin') {
    // MacOS command to find and kill child processes
    cmd = `pgrep -P ${pid} | xargs kill -s ${signal}`;
  } else if (platform === 'linux') {
    // Linux command to find and kill child processes
    cmd = `ps -o pid --no-headers --ppid ${pid} | xargs kill -s ${signal}`;
  } else {
    return process.nextTick(() => callback(new Error('Unsupported platform')));
  }

  exec(cmd, (err, stdout, stderr) => {
    if (err) {
      return callback(err);
    }
    exec(`kill -s ${signal} ${pid}`, callback);
  });
}

module.exports = treeKill;

// CLI Interface
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.error('Usage: tree-kill <pid> [signal]');
    process.exit(1);
  }

  const pid = args[0];
  const signal = args[1] || 'SIGTERM';

  treeKill(pid, signal, (err) => {
    if (err) {
      console.error(`Failed to kill process tree with PID ${pid}:`, err);
      process.exit(1);
    } else {
      console.log(`Successfully killed process tree with PID ${pid}`);
    }
  });
}
