const { defineProperty: defProp, getOwnPropertyDescriptor: getOwnPropDesc, getOwnPropertyNames: getOwnPropNames } = Object;
const hasOwnProp = Object.prototype.hasOwnProperty;

const setName = (target, value) => defProp(target, "name", { value, configurable: true });
const exportProperties = (target, all) => {
  for (const name in all)
    defProp(target, name, { get: all[name], enumerable: true });
};

const copyProperties = (to, from, except, desc) => {
  if (from && (typeof from === "object" || typeof from === "function")) {
    for (const key of getOwnPropNames(from)) {
      if (!hasOwnProp.call(to, key) && key !== except) {
        defProp(to, key, { get: () => from[key], enumerable: !(desc = getOwnPropDesc(from, key)) || desc.enumerable });
      }
    }
  }
  return to;
};

const toCommonJS = (mod) => copyProperties(defProp({}, "__esModule", { value: true }), mod);

// src/index.js
const srcExports = {};
exportProperties(srcExports, {
  loadConfig: () => loadConfig
});
module.exports = toCommonJS(srcExports);

// src/configLoader.js

// src/fromEnv.js
const { CredentialsProviderError } = require("@smithy/property-provider");

// src/getSelectorName.js
function getSelectorName(functionString) {
  try {
    const constants = new Set((functionString.match(/([A-Z_]){3,}/g) || []));
    constants.delete("CONFIG");
    constants.delete("CONFIG_PREFIX_SEPARATOR");
    constants.delete("ENV");
    return Array.from(constants).join(", ");
  } catch (e) {
    return functionString;
  }
}
setName(getSelectorName, "getSelectorName");

// src/fromEnv.js
const fromEnv = setName((envVarSelector, logger) => async () => {
  try {
    const config = envVarSelector(process.env);
    if (config === undefined) {
      throw new Error();
    }
    return config;
  } catch (e) {
    throw new CredentialsProviderError(
      e.message || `Not found in ENV: ${getSelectorName(envVarSelector.toString())}`,
      { logger }
    );
  }
}, "fromEnv");

// src/fromSharedConfigFiles.js
const { getProfileName, loadSharedConfigFiles } = require("@smithy/shared-ini-file-loader");

const fromSharedConfigFiles = setName((configSelector, { preferredFile = "config", ...init } = {}) => async () => {
  const profile = getProfileName(init);
  const { configFile, credentialsFile } = await loadSharedConfigFiles(init);
  const profileFromCredentials = credentialsFile[profile] || {};
  const profileFromConfig = configFile[profile] || {};
  const mergedProfile = preferredFile === "config" ? { ...profileFromCredentials, ...profileFromConfig } : { ...profileFromConfig, ...profileFromCredentials };

  try {
    const cfgFile = preferredFile === "config" ? configFile : credentialsFile;
    const configValue = configSelector(mergedProfile, cfgFile);
    if (configValue === undefined) {
      throw new Error();
    }
    return configValue;
  } catch (e) {
    throw new CredentialsProviderError(
      e.message || `Not found in config files w/ profile [${profile}]: ${getSelectorName(configSelector.toString())}`,
      { logger: init.logger }
    );
  }
}, "fromSharedConfigFiles");

// src/fromStatic.js
const isFunction = setName((func) => typeof func === "function", "isFunction");

const fromStatic = setName((defaultValue) => isFunction(defaultValue) ? async () => await defaultValue() : require("@smithy/property-provider").fromStatic(defaultValue), "fromStatic");

// src/configLoader.js
const loadConfig = setName(({ environmentVariableSelector, configFileSelector, default: defaultValue }, configuration = {}) => require("@smithy/property-provider").memoize(
  require("@smithy/property-provider").chain(
    fromEnv(environmentVariableSelector),
    fromSharedConfigFiles(configFileSelector, configuration),
    fromStatic(defaultValue)
  )
), "loadConfig");

// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  loadConfig
});
