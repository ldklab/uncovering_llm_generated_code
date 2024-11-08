'use strict';

const { spawn, exec } = require('child_process');

module.exports = function (pid, signal, callback) {
    if (typeof signal === 'function' && callback === undefined) {
        callback = signal;
        signal = undefined;
    }

    pid = Number(pid);
    if (isNaN(pid)) {
        const error = new Error("pid must be a number");
        return callback ? callback(error) : throw error;
    }

    const tree = { [pid]: [] };
    const pidsToProcess = { [pid]: 1 };

    switch (process.platform) {
    case 'win32':
        exec(`taskkill /pid ${pid} /T /F`, callback);
        break;
    case 'darwin':
        buildProcessTree(pid, tree, pidsToProcess, ppid => spawn('pgrep', ['-P', ppid]), () => {
            killAll(tree, signal, callback);
        });
        break;
    default:
        buildProcessTree(pid, tree, pidsToProcess, ppid => spawn('ps', ['-o', 'pid', '--no-headers', '--ppid', ppid]), () => {
            killAll(tree, signal, callback);
        });
        break;
    }
};

function killAll(tree, signal, callback) {
    const killed = {};
    try {
        for (const [pid, children] of Object.entries(tree)) {
            children.forEach(childPid => {
                if (!killed[childPid]) {
                    killPid(childPid, signal);
                    killed[childPid] = true;
                }
            });
            if (!killed[pid]) {
                killPid(pid, signal);
                killed[pid] = true;
            }
        }
    } catch (err) {
        return callback ? callback(err) : throw err;
    }
    if (callback) callback();
}

function killPid(pid, signal) {
    try {
        process.kill(Number(pid), signal);
    } catch (err) {
        if (err.code !== 'ESRCH') throw err;
    }
}

function buildProcessTree(parentPid, tree, pidsToProcess, spawnChildProcessesList, cb) {
    const ps = spawnChildProcessesList(parentPid);
    let allData = '';

    ps.stdout.on('data', data => allData += data.toString());
    ps.on('close', code => {
        delete pidsToProcess[parentPid];
        if (code !== 0 && Object.keys(pidsToProcess).length === 0) return cb();

        const matches = allData.match(/\d+/g) || [];
        for (const childPid of matches.map(Number)) {
            tree[parentPid].push(childPid);
            tree[childPid] = [];
            pidsToProcess[childPid] = 1;
            buildProcessTree(childPid, tree, pidsToProcess, spawnChildProcessesList, cb);
        }
    });
}
