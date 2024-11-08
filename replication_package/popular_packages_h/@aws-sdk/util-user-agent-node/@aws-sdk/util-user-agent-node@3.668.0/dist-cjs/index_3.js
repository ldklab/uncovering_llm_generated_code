"use strict";

const { defineProperty, getOwnPropertyDescriptor, getOwnPropertyNames } = Object;
const hasOwnProperty = Object.prototype.hasOwnProperty;

// Define the name property of a function for debugging
const nameFunction = (target, value) => defineProperty(target, "name", { value, configurable: true });

// Export specified properties from an object
const exportProperties = (target, all) => {
  for (const name in all) {
    defineProperty(target, name, { get: all[name], enumerable: true });
  }
};

// Copy properties from one object to another, with exclusions
const copyProps = (to, from, except) => {
  if (from && (typeof from === "object" || typeof from === "function")) {
    for (const key of getOwnPropertyNames(from)) {
      if (!hasOwnProperty.call(to, key) && key !== except) {
        defineProperty(to, key, {
          get: () => from[key],
          enumerable: !getOwnPropertyDescriptor(from, key)?.enumerable,
        });
      }
    }
  }
  return to;
};

// Convert the module to CommonJS, adding the __esModule property
const toCommonJS = (mod) => copyProps(defineProperty({}, "__esModule", { value: true }), mod);

// Define and export various utilities and configurations
const src_exports = {};
exportProperties(src_exports, {
  NODE_APP_ID_CONFIG_OPTIONS: () => NODE_APP_ID_CONFIG_OPTIONS,
  UA_APP_ID_ENV_NAME: () => UA_APP_ID_ENV_NAME,
  UA_APP_ID_INI_NAME: () => UA_APP_ID_INI_NAME,
  createDefaultUserAgentProvider: () => createDefaultUserAgentProvider,
  crtAvailability: () => crtAvailability,
  defaultUserAgent: () => defaultUserAgent,
});

module.exports = toCommonJS(src_exports);

const os = require("os");
const process = require("process");

const crtAvailability = { isCrtAvailable: false };

const isCrtAvailable = nameFunction(() => {
  return crtAvailability.isCrtAvailable ? ["md/crt-avail"] : null;
}, "isCrtAvailable");

const createDefaultUserAgentProvider = nameFunction(({ serviceId, clientVersion }) => {
  return async (config) => {
    const sections = [
      ["aws-sdk-js", clientVersion],
      ["ua", "2.1"],
      [`os/${os.platform()}`, os.release()],
      ["lang/js"],
      ["md/nodejs", process.versions.node]
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

    const appId = await config?.userAgentAppId?.call(config);
    return appId ? [...sections, [`app/${appId}`]] : [...sections];
  };
}, "createDefaultUserAgentProvider");

const defaultUserAgent = createDefaultUserAgentProvider;

const { DEFAULT_UA_APP_ID } = require("@aws-sdk/middleware-user-agent");
const UA_APP_ID_ENV_NAME = "AWS_SDK_UA_APP_ID";
const UA_APP_ID_INI_NAME = "sdk-ua-app-id";

const NODE_APP_ID_CONFIG_OPTIONS = {
  environmentVariableSelector: (env) => env[UA_APP_ID_ENV_NAME],
  configFileSelector: (profile) => profile[UA_APP_ID_INI_NAME],
  default: DEFAULT_UA_APP_ID,
};
