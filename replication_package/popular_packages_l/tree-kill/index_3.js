// tree-kill.js
const { exec } = require('child_process');

function treeKill(pid, signal = 'SIGTERM', callback = function() {}) {
  if (typeof signal === 'function') {
    callback = signal;
    signal = 'SIGTERM';
  }

  pid = parseInt(pid, 10);
  if (isNaN(pid)) {
    return process.nextTick(() => callback(new Error('Invalid PID')));
  }

  const platform = process.platform;
  let cmd;

  switch (platform) {
    case 'win32':
      cmd = `taskkill /pid ${pid} /T /F`;
      break;
    case 'darwin':
      cmd = `pgrep -P ${pid} | xargs kill -s ${signal}`;
      break;
    case 'linux':
      cmd = `ps -o pid --no-headers --ppid ${pid} | xargs kill -s ${signal}`;
      break;
    default:
      return process.nextTick(() => callback(new Error('Unsupported platform')));
  }

  exec(cmd, (err) => {
    if (err) {
      return callback(err);
    }
    exec(`kill -s ${signal} ${pid}`, callback);
  });
}

module.exports = treeKill;

// CLI Interface
if (require.main === module) {
  const [pid, signal = 'SIGTERM'] = process.argv.slice(2);
  if (!pid) {
    console.error('Usage: tree-kill <pid> [signal]');
    process.exit(1);
  }

  treeKill(pid, signal, (err) => {
    if (err) {
      console.error(`Failed to kill process tree with PID ${pid}:`, err);
      process.exit(1);
    } else {
      console.log(`Successfully killed process tree with PID ${pid}`);
    }
  });
}
