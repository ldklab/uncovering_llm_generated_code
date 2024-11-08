const { 
  defineProperty, 
  getOwnPropertyDescriptor, 
  getOwnPropertyNames, 
  prototype: { hasOwnProperty } 
} = Object;

const setFunctionName = (fn, name) => defineProperty(fn, 'name', { value: name, configurable: true });

const exportModule = (target, methods) => {
  for (const name in methods) {
    defineProperty(target, name, { get: methods[name], enumerable: true });
  }
};

const copyProperties = (to, from, except) => {
  if (from && (typeof from === 'object' || typeof from === 'function')) {
    for (const key of getOwnPropertyNames(from)) {
      if (!hasOwnProperty.call(to, key) && key !== except) {
        defineProperty(to, key, { 
          get: () => from[key], 
          enumerable: !(getOwnPropertyDescriptor(from, key) || {}).enumerable
        });
      }
    }
  }
  return to;
};

const toCommonJS = (mod) => copyProperties(defineProperty({}, '__esModule', { value: true }), mod);

const { CredentialsProviderError, memoize, chain, fromStatic } = require("@smithy/property-provider");
const { getProfileName, loadSharedConfigFiles } = require("@smithy/shared-ini-file-loader");

const getSelectorName = (functionString) => {
  try {
    const constants = new Set((functionString.match(/([A-Z_]){3,}/g) || []));
    ['CONFIG', 'CONFIG_PREFIX_SEPARATOR', 'ENV'].forEach(value => constants.delete(value));
    return Array.from(constants).join(', ');
  } catch {
    return functionString;
  }
};

const fromEnv = setFunctionName(async (envVarSelector, logger) => {
  try {
    const config = envVarSelector(process.env);
    if (config === undefined) throw new Error();
    return config;
  } catch (e) {
    throw new CredentialsProviderError(
      e.message || `Not found in ENV: ${getSelectorName(envVarSelector.toString())}`,
      { logger }
    );
  }
}, 'fromEnv');

const fromSharedConfigFiles = setFunctionName(async (configSelector, options = {}) => {
  const { preferredFile = 'config', ...init } = options;
  const profile = getProfileName(init);
  const { configFile, credentialsFile } = await loadSharedConfigFiles(init);
  const profileData = {
    ...credentialsFile[profile] || {},
    ...configFile[profile] || {}
  };
  
  if (preferredFile === 'config') {
    Object.assign(profileData, configFile[profile] || {});
  } else {
    Object.assign(profileData, credentialsFile[profile] || {});
  }

  try {
    const cfgFile = preferredFile === 'config' ? configFile : credentialsFile;
    const configValue = configSelector(profileData, cfgFile);
    if (configValue === undefined) throw new Error();
    return configValue;
  } catch (e) {
    throw new CredentialsProviderError(
      e.message || `Not found in config files with profile [${profile}]: ${getSelectorName(configSelector.toString())}`,
      { logger: init.logger }
    );
  }
}, 'fromSharedConfigFiles');

const isFunction = setFunctionName(func => typeof func === 'function', 'isFunction');

const fromStaticConfig = setFunctionName(defaultValue =>
  isFunction(defaultValue) ? async () => await defaultValue() : fromStatic(defaultValue)
, 'fromStaticConfig');

const loadConfig = setFunctionName(({ environmentVariableSelector, configFileSelector, default: defaultValue }, configuration = {}) => 
  memoize(chain(
    fromEnv(environmentVariableSelector),
    fromSharedConfigFiles(configFileSelector, configuration),
    fromStaticConfig(defaultValue)
  ))
, 'loadConfig');

module.exports = toCommonJS({ loadConfig });
