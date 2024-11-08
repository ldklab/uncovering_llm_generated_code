const os = require('os');
const path = require('path');
const { exec } = require('child_process');

function getOSInfo() {
    const platform = os.platform();
    const release = os.release();
    return `Operating System: ${platform}, Version: ${release}`;
}

function getNodeInfo() {
    return new Promise((resolve, reject) => {
        exec('node -v', (error, stdout) => {
            if (error) {
                return reject('Node.js version could not be determined');
            }
            resolve(`Node.js Version: ${stdout.trim()}`);
        });
    });
}

function getNpmInfo() {
    return new Promise((resolve, reject) => {
        exec('npm -v', (error, stdout) => {
            if (error) {
                return reject('npm version could not be determined');
            }
            resolve(`npm Version: ${stdout.trim()}`);
        });
    });
}

function collectEnvironmentInfo(callback) {
    Promise.all([getOSInfo(), getNodeInfo(), getNpmInfo()])
        .then(results => {
            callback(null, results.join('\n'));
        })
        .catch(err => callback(err, null));
}

module.exports = { collectEnvironmentInfo };

// Sample usage:
collectEnvironmentInfo((error, info) => {
    if (error) {
        console.error('Error collecting environment info:', error);
    } else {
        console.log('Environment Information:\n', info);
    }
});
