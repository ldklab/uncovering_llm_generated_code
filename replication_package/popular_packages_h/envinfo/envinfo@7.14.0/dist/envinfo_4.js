const os = require('os');
const { exec } = require('child_process');
const path = require('path');

// Helper function to run a shell command
function runCommand(command) {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(error);
                return;
            }
            resolve(stdout.trim());
        });
    });
}

// Functions to get environment details
async function getNodeVersion() {
    return runCommand('node -v');
}

async function getNpmVersion() {
    return runCommand('npm -v');
}

async function getOsDetails() {
    return {
        platform: os.platform(),
        release: os.release(),
        cpus: os.cpus().map(cpu => cpu.model),
    };
}

// Main function to format and print environment information
async function printEnvInfo() {
    try {
        const [nodeVersion, npmVersion, osDetails] = await Promise.all([
            getNodeVersion(),
            getNpmVersion(),
            getOsDetails()
        ]);

        console.log(`Node.js Version: ${nodeVersion}`);
        console.log(`NPM Version: ${npmVersion}`);
        console.log(`OS Details:`, osDetails);
    } catch (error) {
        console.error('Error fetching environment info:', error);
    }
}

// Execute the main function
printEnvInfo();
