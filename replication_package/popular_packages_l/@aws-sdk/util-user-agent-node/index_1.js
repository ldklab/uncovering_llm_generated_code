'use strict';

/**
 * Generates a user-agent string for AWS SDK requests in a Node.js environment.
 * This string consists of the AWS SDK identifier, Node.js version, operating system platform, and CPU architecture.
 * @returns {string} - The constructed user-agent string.
 */
function createUserAgentString() {
    const sdkLabel = 'aws-sdk-js-node'; // Identifier for the AWS SDK in Node.js
    const versionIdentifier = '1.0.0'; // Placeholder for the SDK version
    const nodeJsVersion = process.version; // Node.js version, e.g., v14.17.0
    const osPlatform = process.platform; // Operating system platform, e.g., linux, darwin, win32
    const cpuArchitecture = process.arch; // CPU architecture, e.g., x64, arm64

    return `${sdkLabel}/${versionIdentifier} Node/${nodeJsVersion} OS/${osPlatform} Arch/${cpuArchitecture}`;
}

module.exports = {
    createUserAgentString
};

// Conditional export for direct execution
if (require.main === module) {
    console.log(createUserAgentString());
}
