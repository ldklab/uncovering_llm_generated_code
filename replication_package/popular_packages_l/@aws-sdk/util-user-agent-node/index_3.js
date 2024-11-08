'use strict';

/**
 * Generates a user-agent string for AWS SDK requests in a Node.js environment.
 * This string includes indicators of the environment such as the SDK identifier,
 * Node.js version, operating system, and CPU architecture.
 * @returns {string} - The constructed user-agent string.
 */
function generateUserAgent() {
    const sdkIdentifier = 'aws-sdk-js-node'; // Identifier for AWS SDK in Node.js
    const sdkVersion = '1.0.0'; // Placeholder for SDK version
    const nodeVersion = process.version; // Current Node.js version
    const platform = process.platform; // Operating System platform
    const arch = process.arch; // CPU architecture

    return `${sdkIdentifier}/${sdkVersion} Node/${nodeVersion} OS/${platform} Arch/${arch}`;
}

// Exporting the function for use in other modules
module.exports = {
    generateUserAgent
};

// Conditional execution to display the user-agent if this script is run directly
if (require.main === module) {
    console.log(generateUserAgent());
}
