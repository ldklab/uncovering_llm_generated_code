'use strict';

/**
 * Constructs a user-agent string for AWS SDK connections in a Node.js environment.
 * This string includes identifiers for the AWS SDK, Node.js environment, OS platform, and CPU architecture.
 * @returns {string} A user-agent string formatted with SDK information.
 */
function createUserAgent() {
    const awsSdkIdentifier = 'aws-sdk-js-node'; // Identifier for AWS SDK for Node.js
    const awsSdkVersion = '1.0.0'; // Version of AWS SDK being used
    const nodeJsVersion = process.version; // Current version of Node.js
    const operatingSystem = process.platform; // Current operating system platform
    const cpuArchitecture = process.arch; // Current CPU architecture

    return `${awsSdkIdentifier}/${awsSdkVersion} Node/${nodeJsVersion} OS/${operatingSystem} Arch/${cpuArchitecture}`;
}

module.exports = {
    createUserAgent
};

// When module is executed directly, log user agent string to console
if (require.main === module) {
    console.log(createUserAgent());
}
