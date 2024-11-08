node
"use strict";

const { loadConfig } = require("@aws-sdk/node-config-provider");
const { platform, release } = require("os");
const { env, versions } = require("process");

const UA_APP_ID_ENV_NAME = "AWS_SDK_UA_APP_ID";
const UA_APP_ID_INI_NAME = "sdk-ua-app-id";

/**
 * Constructs a user agent string with runtime metadata for AWS SDK.
 * It includes SDK, OS, language, and optionally API and environment metadata.
 */
const defaultUserAgent = ({ serviceId, clientVersion }) => async () => {
  const sections = [
    // SDK metadata
    ["aws-sdk-js", clientVersion],
    // OS metadata
    [`os/${platform()}`, release()],
    // Language metadata
    ["lang/js"],
    ["md/nodejs", `${versions.node}`],
  ];

  if (serviceId) {
    // Include API metadata if serviceId is provided
    sections.push([`api/${serviceId}`, clientVersion]);
  }

  if (env.AWS_EXECUTION_ENV) {
    // Include execution environment metadata if available
    sections.push([`exec-env/${env.AWS_EXECUTION_ENV}`]);
  }

  // Retrieve application ID from environment or configuration
  const appId = await loadConfig({
    environmentVariableSelector: (env) => env[UA_APP_ID_ENV_NAME],
    configFileSelector: (profile) => profile[UA_APP_ID_INI_NAME],
    default: undefined,
  })();

  if (appId) {
    // Include application ID metadata if available
    sections.push([`app/${appId}`]);
  }

  return sections;
};

module.exports = {
  UA_APP_ID_ENV_NAME,
  UA_APP_ID_INI_NAME,
  defaultUserAgent
};
