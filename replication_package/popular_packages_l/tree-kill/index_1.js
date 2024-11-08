// tree-kill.js
const { exec } = require('child_process');

function treeKill(pid, signal = 'SIGTERM', callback) {
  if (typeof signal === 'function') {
    callback = signal;
    signal = 'SIGTERM';
  }
  
  if (typeof callback !== 'function') {
    callback = () => {};
  }

  pid = parseInt(pid, 10);
  if (isNaN(pid)) {
    return process.nextTick(() => callback(new Error('Invalid PID')));
  }

  const commands = {
    win32: `taskkill /pid ${pid} /T /F`,
    darwin: `pgrep -P ${pid} | xargs kill -s ${signal}`,
    linux: `ps -o pid --no-headers --ppid ${pid} | xargs kill -s ${signal}`,
  };

  const cmd = commands[process.platform];
  if (!cmd) {
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
      console.error(`Failed to kill process tree with PID ${pid}:`, err.message);
      process.exit(1);
    } else {
      console.log(`Successfully killed process tree with PID ${pid}`);
    }
  });
}
