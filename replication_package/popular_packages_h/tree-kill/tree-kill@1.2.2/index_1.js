'use strict';

const { spawn, exec } = require('child_process');

module.exports = function (pid, signal, callback) {
    if (typeof signal === 'function' && callback === undefined) {
        callback = signal;
        signal = undefined;
    }

    pid = parseInt(pid);
    if (Number.isNaN(pid)) {
        if (callback) {
            return callback(new Error("pid must be a number"));
        } else {
            throw new Error("pid must be a number");
        }
    }

    const tree = { [pid]: [] };
    const pidsToProcess = { [pid]: 1 };

    const platformActions = {
        win32: () => exec(`taskkill /pid ${pid} /T /F`, callback),
        darwin: () => findProcessTreeAndKill(pid, tree, pidsToProcess, spawnPgrep, () => killAll(tree, signal, callback)),
        default: () => findProcessTreeAndKill(pid, tree, pidsToProcess, spawnPs, () => killAll(tree, signal, callback)),
    };

    (platformActions[process.platform] || platformActions.default)();
};

function killAll(tree, signal, callback) {
    const killed = {};
    try {
        Object.keys(tree).forEach((pid) => {
            tree[pid].forEach((childPid) => {
                if (!killed[childPid]) {
                    killPid(childPid, signal);
                    killed[childPid] = 1;
                }
            });
            if (!killed[pid]) {
                killPid(pid, signal);
                killed[pid] = 1;
            }
        });
    } catch (err) {
        return callback ? callback(err) : throw err;
    }
    if (callback) callback();
}

function killPid(pid, signal) {
    try {
        process.kill(parseInt(pid, 10), signal);
    } catch (err) {
        if (err.code !== 'ESRCH') throw err;
    }
}

function findProcessTreeAndKill(parentPid, tree, pidsToProcess, spawnProcessListFn, cb) {
    const processList = spawnProcessListFn(parentPid);
    let dataString = '';

    processList.stdout.on('data', (data) => {
        dataString += data.toString('ascii');
    });

    processList.on('close', (code) => {
        delete pidsToProcess[parentPid];

        if (code !== 0) {
            if (Object.keys(pidsToProcess).length === 0) cb();
            return;
        }

        dataString.match(/\d+/g).forEach((pid) => {
            pid = parseInt(pid, 10);
            tree[parentPid].push(pid);
            tree[pid] = [];
            pidsToProcess[pid] = 1;
            findProcessTreeAndKill(pid, tree, pidsToProcess, spawnProcessListFn, cb);
        });
    });
}

function spawnPgrep(parentPid) {
    return spawn('pgrep', ['-P', parentPid]);
}

function spawnPs(parentPid) {
    return spawn('ps', ['-o', 'pid', '--no-headers', '--ppid', parentPid]);
}
