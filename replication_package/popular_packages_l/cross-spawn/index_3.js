const { spawn, spawnSync } = require('child_process');
const path = require('path');
const os = require('os');
const fs = require('fs');

function resolveCommand(command) {
    if (os.platform() === 'win32') {
        const extensions = (process.env.PATHEXT || '.EXE').split(';');
        const cmdPath = path.resolve(process.cwd(), command);

        for (const ext of extensions) {
            const fullPath = cmdPath + ext;
            if (fs.existsSync(fullPath)) {
                return fullPath;
            }
        }
    }
    return command;
}

function crossSpawn(command, args = [], options = {}) {
    const resolvedCommand = resolveCommand(command);
    options.shell = options.hasOwnProperty('shell') ? options.shell : os.platform() === 'win32';

    return spawn(resolvedCommand, args, options);
}

function crossSpawnSync(command, args = [], options = {}) {
    const resolvedCommand = resolveCommand(command);
    options.shell = options.hasOwnProperty('shell') ? options.shell : os.platform() === 'win32';

    return spawnSync(resolvedCommand, args, options);
}

module.exports = { spawn: crossSpawn, sync: crossSpawnSync };

// Usage Example:
// const spawn = require('./my-spawn-module').spawn;
// const child = spawn('npm', ['list', '-g', '--depth=0'], { stdio: 'inherit' });
