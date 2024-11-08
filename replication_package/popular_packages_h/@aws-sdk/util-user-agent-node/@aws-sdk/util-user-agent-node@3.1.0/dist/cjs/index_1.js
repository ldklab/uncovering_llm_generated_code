"use strict";

// Import necessary packages for configuration and process information
const { loadConfig } = require("@aws-sdk/node-config-provider");
const { platform, release } = require("os");
const { env, versions } = require("process");

// Export constant names for environment and ini configuration
const UA_APP_ID_ENV_NAME = "AWS_SDK_UA_APP_ID";
const UA_APP_ID_INI_NAME = "sdk-ua-app-id";

// Define the defaultUserAgent function to generate a user agent metadata
const defaultUserAgent = ({ serviceId, clientVersion }) => {
    return async () => {
        // Initialize metadata sections for user agent
        const sections = [
            ["aws-sdk-js", clientVersion],     // SDK metadata
            [`os/${platform()}`, release()],   // OS metadata
            ["lang/js"],                       // Language metadata
            ["md/nodejs", versions.node]       // Node.js version
        ];

        // Add API metadata if serviceId is provided
        if (serviceId) {
            sections.push([`api/${serviceId}`, clientVersion]);
        }

        // Add execution environment metadata if available
        if (env.AWS_EXECUTION_ENV) {
            sections.push([`exec-env/${env.AWS_EXECUTION_ENV}`]);
        }

        // Load additional app ID config and append to metadata
        const appId = await loadConfig({
            environmentVariableSelector: (env) => env[UA_APP_ID_ENV_NAME],
            configFileSelector: (profile) => profile[UA_APP_ID_INI_NAME],
            default: undefined,
        })();

        if (appId) {
            sections.push([`app/${appId}`]);
        }

        return sections;
    };
};

// Export the constants and the function
module.exports = {
    UA_APP_ID_ENV_NAME,
    UA_APP_ID_INI_NAME,
    defaultUserAgent
};
