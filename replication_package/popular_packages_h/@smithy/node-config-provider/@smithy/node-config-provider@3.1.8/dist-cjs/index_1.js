// Utility functions for property manipulation
const defineProperty = Object.defineProperty;
const getOwnPropDescriptor = Object.getOwnPropertyDescriptor;
const getOwnPropNames = Object.getOwnPropertyNames;
const hasOwnProp = Object.prototype.hasOwnProperty;

// Helper to set function names
const setName = (fn, name) => defineProperty(fn, "name", { value: name, configurable: true });

// Module and property export utilities
const exportProps = (target, sources) => {
  for (const key in sources) {
    defineProperty(target, key, { get: sources[key], enumerable: true });
  }
};

const copyProperties = (target, source, exclude) => {
  if (source && (typeof source === 'object' || typeof source === 'function')) {
    for (const key of getOwnPropNames(source)) {
      if (!hasOwnProp.call(target, key) && key !== exclude) {
        defineProperty(target, key, {
          get: () => source[key],
          enumerable: !(desc = getOwnPropDescriptor(source, key)) || desc.enumerable,
        });
      }
    }
  }
  return target;
};

const toCommonJS = (module) => copyProperties(defineProperty({}, "__esModule", { value: true }), module);

// Configuration utilities
const { CredentialsProviderError, memoize, chain, fromStatic } = require("@smithy/property-provider");
const { getProfileName, loadSharedConfigFiles } = require("@smithy/shared-ini-file-loader");

// Extracts possible configuration constants
function extractConfigConstants(fnStr) {
  try {
    const constants = new Set((fnStr.match(/([A-Z_]{3,})/g) || []));
    constants.delete("CONFIG");
    constants.delete("CONFIG_PREFIX_SEPARATOR");
    constants.delete("ENV");
    return Array.from(constants).join(", ");
  } catch {
    return fnStr;
  }
}
setName(extractConfigConstants, "extractConfigConstants");

// Load from environment variables
const fromEnv = setName((envSelector, logger) => async () => {
  try {
    const config = envSelector(process.env);
    if (config === undefined) throw new Error();
    return config;
  } catch (error) {
    throw new CredentialsProviderError(
      error.message || `Not found in ENV: ${extractConfigConstants(envSelector.toString())}`,
      { logger }
    );
  }
}, "fromEnv");

// Load from shared config files
const fromSharedConfigFiles = setName((configSelector, options = {}) => async () => {
  const { preferredFile = "config", ...init } = options;
  const profileName = getProfileName(init);
  const { configFile, credentialsFile } = await loadSharedConfigFiles(init);
  
  const combinedProfile = preferredFile === "config"
    ? { ...credentialsFile[profileName], ...configFile[profileName] }
    : { ...configFile[profileName], ...credentialsFile[profileName] };

  try {
    const config = configSelector(combinedProfile, preferredFile === "config" ? configFile : credentialsFile);
    if (config === undefined) throw new Error();
    return config;
  } catch (error) {
    throw new CredentialsProviderError(
      error.message || `Not found in config files w/ profile [${profileName}]: ${extractConfigConstants(configSelector.toString())}`,
      { logger: init.logger }
    );
  }
}, "fromSharedConfigFiles");

// Load static configuration or resolve function for dynamic value
const isFunction = setName((func) => typeof func === "function", "isFunction");
const fromStaticValue = setName((defaultValue) => isFunction(defaultValue)
  ? async () => await defaultValue()
  : fromStatic(defaultValue), "fromStaticValue");

// Master loader function combining all methods
const loadConfiguration = setName(({ environmentVariableSelector, configFileSelector, default: defaultValue }, configuration = {}) =>
  memoize(
    chain(
      fromEnv(environmentVariableSelector),
      fromSharedConfigFiles(configFileSelector, configuration),
      fromStaticValue(defaultValue)
    )
  ), "loadConfiguration");

// Export the main configuration loading function
const configExports = { loadConfiguration };
module.exports = toCommonJS(configExports);
