"use strict";
const { loadConfig } = require("@aws-sdk/node-config-provider");
const { platform, release } = require("os");
const { env, versions } = require("process");

const UA_APP_ID_ENV_NAME = "AWS_SDK_UA_APP_ID";
const UA_APP_ID_INI_NAME = "sdk-ua-app-id";

/**
 * Function to collect and format runtime metrics into a user agent array.
 * @param {Object} options - Options for user agent, including serviceID and clientVersion.
 * @property {string} [options.serviceId] - The service ID.
 * @property {string} options.clientVersion - The client version.
 * @returns {Function} - Function returning a promise that resolves to a user agent sections array.
 */
const defaultUserAgent = ({ serviceId, clientVersion }) => async () => {
    const sections = [
        ["aws-sdk-js", clientVersion],
        [`os/${platform()}`, release()],
        ["lang/js"],
        ["md/nodejs", versions.node],
    ];

    if (serviceId) {
        sections.push([`api/${serviceId}`, clientVersion]);
    }

    if (env.AWS_EXECUTION_ENV) {
        sections.push([`exec-env/${env.AWS_EXECUTION_ENV}`]);
    }

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

module.exports = {
    UA_APP_ID_ENV_NAME,
    UA_APP_ID_INI_NAME,
    defaultUserAgent,
};
