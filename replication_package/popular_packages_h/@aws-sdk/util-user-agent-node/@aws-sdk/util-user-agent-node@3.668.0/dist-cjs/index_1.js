"use strict";

const os = require("os");
const process = require("process");
const { DEFAULT_UA_APP_ID } = require("@aws-sdk/middleware-user-agent");

// Helper function to define properties
const defineProperty = (target, key, descriptor) => Object.defineProperty(target, key, descriptor);

// Export utility to manage module exports
const exportModule = (exports, definitions) => {
  for (const [key, getter] of Object.entries(definitions)) {
    defineProperty(exports, key, { get: getter, enumerable: true });
  }
};

// Function to copy properties excluding a specific property
const copyProperties = (to, from, excludeKey) => {
  if (from && (typeof from === "object" || typeof from === "function")) {
    Object.getOwnPropertyNames(from).forEach(key => {
      if (!Object.prototype.hasOwnProperty.call(to, key) && key !== excludeKey) {
        const desc = Object.getOwnPropertyDescriptor(from, key);
        defineProperty(to, key, { get: () => from[key], enumerable: desc ? desc.enumerable : true });
      }
    });
  }
  return to;
};

// Convert a module to a CommonJS export format (ES Module compatibility)
const toCommonJS = module => copyProperties(defineProperty({}, "__esModule", { value: true }), module);

// Define exports
const exports = {};

// Some constant and function definitions
const NODE_APP_ID_CONFIG_OPTIONS = {
  environmentVariableSelector: env => env["AWS_SDK_UA_APP_ID"],
  configFileSelector: profile => profile["sdk-ua-app-id"],
  default: DEFAULT_UA_APP_ID
};

const crtAvailability = { isCrtAvailable: false };

const isCrtAvailable = () => crtAvailability.isCrtAvailable ? ["md/crt-avail"] : null;

const createDefaultUserAgentProvider = ({ serviceId, clientVersion }) => async (config) => {
  const sections = [
    ["aws-sdk-js", clientVersion],
    ["ua", "2.1"],
    [`os/${os.platform()}`, os.release()],
    ["lang/js"],
    ["md/nodejs", process.versions.node]
  ];

  const crtAvailable = isCrtAvailable();
  if (crtAvailable) sections.push(crtAvailable);

  if (serviceId) sections.push([`api/${serviceId}`, clientVersion]);

  if (process.env.AWS_EXECUTION_ENV) {
    sections.push([`exec-env/${process.env.AWS_EXECUTION_ENV}`]);
  }

  const appId = await config?.userAgentAppId?.();
  return appId ? [...sections, [`app/${appId}`]] : sections;
};

// Assign defaultUserAgent and exports
const defaultUserAgent = createDefaultUserAgentProvider;
exportModule(exports, {
  NODE_APP_ID_CONFIG_OPTIONS: () => NODE_APP_ID_CONFIG_OPTIONS,
  UA_APP_ID_ENV_NAME: () => "AWS_SDK_UA_APP_ID",
  UA_APP_ID_INI_NAME: () => "sdk-ua-app-id",
  createDefaultUserAgentProvider: () => createDefaultUserAgentProvider,
  crtAvailability: () => crtAvailability,
  defaultUserAgent: () => defaultUserAgent
});

// Export module
module.exports = toCommonJS(exports);
