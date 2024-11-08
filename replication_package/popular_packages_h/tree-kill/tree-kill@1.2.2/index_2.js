'use strict';

const { spawn, exec } = require('child_process');

module.exports = function (pid, signal, callback) {
    if (typeof signal === 'function') {
        callback = signal;
        signal = undefined;
    }

    pid = parseInt(pid, 10);
    if (isNaN(pid)) {
        const error = new Error("pid must be a number");
        if (callback) return callback(error);
        throw error;
    }

    const tree = { [pid]: [] };
    const pidsToProcess = { [pid]: 1 };

    const platformHandlers = {
        win32: () => exec(`taskkill /pid ${pid} /T /F`, callback),
        darwin: () => buildProcessTree(pid, tree, pidsToProcess, spawnChildProcessesListMac, () => killAll(tree, signal, callback)),
        // sunos: () => buildProcessTreeSunOS(pid, tree, pidsToProcess, () => killAll(tree, signal, callback)),
        default: () => buildProcessTree(pid, tree, pidsToProcess, spawnChildProcessesListLinux, () => killAll(tree, signal, callback))
    };

    (platformHandlers[process.platform] || platformHandlers.default)();
};

function killAll(tree, signal, callback) {
    const killed = {};
    try {
        for (const pid in tree) {
            tree[pid].forEach(pidpid => {
                if (!killed[pidpid]) {
                    killPid(pidpid, signal);
                    killed[pidpid] = 1;
                }
            });
            if (!killed[pid]) {
                killPid(pid, signal);
                killed[pid] = 1;
            }
        }
    } catch (err) {
        if (callback) return callback(err);
        throw err;
    }
    if (callback) return callback();
}

function killPid(pid, signal) {
    try {
        process.kill(parseInt(pid, 10), signal);
    } catch (err) {
        if (err.code !== 'ESRCH') throw err;
    }
}

function buildProcessTree(parentPid, tree, pidsToProcess, spawnChildProcessesList, cb) {
    const ps = spawnChildProcessesList(parentPid);
    let allData = '';
    ps.stdout.on('data', data => {
        allData += data.toString('ascii');
    });

    ps.on('close', (code) => {
        delete pidsToProcess[parentPid];

        if (code !== 0 && Object.keys(pidsToProcess).length === 0) {
            cb();
            return;
        }

        allData.match(/\d+/g).forEach(pid => {
            pid = parseInt(pid, 10);
            if (!tree[parentPid].includes(pid)) {
                tree[parentPid].push(pid);
                tree[pid] = [];
                pidsToProcess[pid] = 1;
                buildProcessTree(pid, tree, pidsToProcess, spawnChildProcessesList, cb);
            }
        });
    });
}

function spawnChildProcessesListMac(parentPid) {
    return spawn('pgrep', ['-P', parentPid]);
}

function spawnChildProcessesListLinux(parentPid) {
    return spawn('ps', ['-o', 'pid', '--no-headers', '--ppid', parentPid]);
}
