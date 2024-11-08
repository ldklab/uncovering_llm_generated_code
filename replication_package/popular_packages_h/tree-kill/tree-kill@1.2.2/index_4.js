'use strict';

const { spawn, exec } = require('child_process');

module.exports = function terminateProcessTree(pid, signal, callback) {
    if (typeof signal === 'function' && callback === undefined) {
        callback = signal;
        signal = undefined;
    }

    pid = parseInt(pid);
    if (Number.isNaN(pid)) {
        if (callback) return callback(new Error("pid must be a number"));
        throw new Error("pid must be a number");
    }

    const tree = { [pid]: [] };
    const pendingProcesses = { [pid]: 1 };

    switch (process.platform) {
        case 'win32':
            exec(`taskkill /pid ${pid} /T /F`, callback);
            break;
        case 'darwin':
            manageProcessTree(pid, tree, pendingProcesses, (parentPid) => spawn('pgrep', ['-P', parentPid]), () => completeTermination(tree, signal, callback));
            break;
        default:
            manageProcessTree(pid, tree, pendingProcesses, (parentPid) => spawn('ps', ['-o', 'pid', '--no-headers', '--ppid', parentPid]), () => completeTermination(tree, signal, callback));
            break;
    }
};

function completeTermination(processTree, signal, callback) {
    const terminated = {};

    try {
        for (const [parent, children] of Object.entries(processTree)) {
            [...children, parent].forEach((processId) => {
                if (!terminated[processId]) {
                    terminateProcess(processId, signal);
                    terminated[processId] = 1;
                }
            });
        }
    } catch (error) {
        if (callback) return callback(error);
        throw error;
    }

    if (callback) return callback();
}

function terminateProcess(pid, signal) {
    try {
        process.kill(parseInt(pid, 10), signal);
    } catch (error) {
        if (error.code !== 'ESRCH') throw error;
    }
}

function manageProcessTree(parentPid, processTree, pendingProcesses, listChildProcesses, onCompletion) {
    const processList = listChildProcesses(parentPid);
    let outputData = '';

    processList.stdout.on('data', (data) => {
        outputData += data.toString('ascii');
    });

    processList.on('close', (exitCode) => {
        delete pendingProcesses[parentPid];

        if (exitCode !== 0) {
            if (Object.keys(pendingProcesses).length === 0) {
                onCompletion();
            }
            return;
        }

        outputData.match(/\d+/g).forEach((pid) => {
            const numericPid = parseInt(pid, 10);
            processTree[parentPid].push(numericPid);
            processTree[numericPid] = [];
            pendingProcesses[numericPid] = 1;
            manageProcessTree(numericPid, processTree, pendingProcesses, listChildProcesses, onCompletion);
        });
    });
}
