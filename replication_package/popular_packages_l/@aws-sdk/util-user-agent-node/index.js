// @aws-sdk/util-user-agent-node/index.js

'use strict';

/**
 * Generates a user-agent string for AWS SDK requests in a Node.js environment.
 * The string includes the AWS SDK identifier, the Node.js version, and the operating system.
 * @returns {string} - The constructed user-agent string.
 */
function generateUserAgent() {
    const sdkIdentifier = 'aws-sdk-js-node'; // Identifier for AWS SDK in Node.js
    const sdkVersion = '1.0.0'; // Placeholder for SDK version
    const nodeVersion = process.version; // Node.js version, e.g., v14.17.0
    const platform = process.platform; // OS platform, e.g., linux, darwin, win32
    const arch = process.arch; // CPU architecture, e.g., x64, arm64

    return `${sdkIdentifier}/${sdkVersion} Node/${nodeVersion} OS/${platform} Arch/${arch}`;
}

module.exports = {
    generateUserAgent
};

// Usage (although discouraged as per the README)
if (require.main === module) {
    console.log(generateUserAgent());
}
