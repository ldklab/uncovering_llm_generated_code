'use strict';

/**
 * Generates a user-agent string for AWS SDK requests in a Node.js environment.
 * The string includes the AWS SDK identifier, the Node.js version, and the operating system.
 * @returns {string} - The constructed user-agent string.
 */
function buildUserAgent() {
    const sdkName = 'aws-sdk-js-node'; // AWS SDK identification for Node.js
    const sdkVersion = '1.0.0'; // Placeholder for the AWS SDK version
    const nodeJsVersion = process.version; // Retrieves the Node.js version, e.g., v14.17.0
    const operatingSystem = process.platform; // Identifies the OS platform, e.g., linux, darwin, win32
    const architecture = process.arch; // CPU architecture type, e.g., x64, arm64

    return `${sdkName}/${sdkVersion} Node/${nodeJsVersion} OS/${operatingSystem} Arch/${architecture}`;
}

module.exports = {
    buildUserAgent
};

// Example execution (though noted as not recommended in the documentation)
if (require.main === module) {
    console.log(buildUserAgent());
}
