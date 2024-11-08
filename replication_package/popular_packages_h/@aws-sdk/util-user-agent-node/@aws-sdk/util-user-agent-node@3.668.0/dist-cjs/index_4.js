"use strict";

const os = require("os");
const process = require("process");
const { DEFAULT_UA_APP_ID } = require("@aws-sdk/middleware-user-agent");

const UA_APP_ID_ENV_NAME = "AWS_SDK_UA_APP_ID";
const UA_APP_ID_INI_NAME = "sdk-ua-app-id";

const NODE_APP_ID_CONFIG_OPTIONS = {
  environmentVariableSelector: (env) => env[UA_APP_ID_ENV_NAME],
  configFileSelector: (profile) => profile[UA_APP_ID_INI_NAME],
  default: DEFAULT_UA_APP_ID
};

const crtAvailability = {
  isCrtAvailable: false
};

const isCrtAvailable = () => {
  return crtAvailability.isCrtAvailable ? ["md/crt-avail"] : null;
};

const createDefaultUserAgentProvider = ({ serviceId, clientVersion }) => async (config) => {
  const sections = [
    ["aws-sdk-js", clientVersion],
    ["ua", "2.1"],
    [`os/${os.platform()}`, os.release()],
    ["lang/js"],
    ["md/nodejs", `${process.versions.node}`]
  ];

  const crtAvailable = isCrtAvailable();
  if (crtAvailable) {
    sections.push(crtAvailable);
  }
  
  if (serviceId) {
    sections.push([`api/${serviceId}`, clientVersion]);
  }
  
  if (process.env.AWS_EXECUTION_ENV) {
    sections.push([`exec-env/${process.env.AWS_EXECUTION_ENV}`]);
  }
  
  const appId = await (config?.userAgentAppId?.());
  const resolvedUserAgent = appId ? [...sections, [`app/${appId}`]] : [...sections];
  return resolvedUserAgent;
};

const defaultUserAgent = createDefaultUserAgentProvider;

module.exports = {
  NODE_APP_ID_CONFIG_OPTIONS,
  UA_APP_ID_ENV_NAME,
  UA_APP_ID_INI_NAME,
  createDefaultUserAgentProvider,
  crtAvailability,
  defaultUserAgent
};
