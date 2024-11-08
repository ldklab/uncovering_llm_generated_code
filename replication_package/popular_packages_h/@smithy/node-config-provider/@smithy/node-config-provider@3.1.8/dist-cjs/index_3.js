const { defineProperty, getOwnPropertyDescriptor, getOwnPropertyNames } = Object;
const { hasOwnProperty } = Object.prototype;

const setFunctionName = (target, name) => defineProperty(target, 'name', { value: name, configurable: true });

const exportFunctions = (target, fns) => {
  for (const [name, fn] of Object.entries(fns)) {
    defineProperty(target, name, { get: fn, enumerable: true });
  }
};

const copyProps = (to, from, except) => {
  if (from && (typeof from === 'object' || typeof from === 'function')) {
    for (const key of getOwnPropertyNames(from)) {
      if (!hasOwnProperty.call(to, key) && key !== except) {
        const desc = getOwnPropertyDescriptor(from, key);
        defineProperty(to, key, {
          get: () => from[key],
          enumerable: !desc || desc.enumerable,
        });
      }
    }
  }
  return to;
};

const convertToCommonJS = (mod) => {
  return copyProps(defineProperty({}, '__esModule', { value: true }), mod);
};

// src/index.ts
const src_exports = {};
exportFunctions(src_exports, {
  loadConfig: () => loadConfig,
});
module.exports = convertToCommonJS(src_exports);

// src/getSelectorName.ts
function getSelectorName(functionString) {
  try {
    const constants = new Set(Array.from(functionString.match(/([A-Z_]){3,}/g) ?? []));
    ['CONFIG', 'CONFIG_PREFIX_SEPARATOR', 'ENV'].forEach((constant) => constants.delete(constant));
    return [...constants].join(', ');
  } catch {
    return functionString;
  }
}
setFunctionName(getSelectorName, 'getSelectorName');

// src/fromEnv.ts
const { CredentialsProviderError } = require('@smithy/property-provider');

const fromEnv = setFunctionName((envVarSelector, logger) => async () => {
  try {
    const config = envVarSelector(process.env);
    if (config === undefined) throw new Error();
    return config;
  } catch (e) {
    const errorMessage = e.message || `Not found in ENV: ${getSelectorName(envVarSelector.toString())}`;
    throw new CredentialsProviderError(errorMessage, { logger });
  }
}, 'fromEnv');

// src/fromSharedConfigFiles.ts
const { getProfileName, loadSharedConfigFiles } = require('@smithy/shared-ini-file-loader');

const fromSharedConfigFiles = setFunctionName((configSelector, { preferredFile = 'config', ...init } = {}) => async () => {
  const profile = getProfileName(init);
  const { configFile, credentialsFile } = await loadSharedConfigFiles(init);
  const mergedProfile = preferredFile === 'config'
    ? { ...credentialsFile[profile], ...configFile[profile] }
    : { ...configFile[profile], ...credentialsFile[profile] };
  try {
    const cfgFile = preferredFile === 'config' ? configFile : credentialsFile;
    const configValue = configSelector(mergedProfile, cfgFile);
    if (configValue === undefined) throw new Error();
    return configValue;
  } catch (e) {
    const errorMessage = e.message || `Not found in config files w/ profile [${profile}]: ${getSelectorName(configSelector.toString())}`;
    throw new CredentialsProviderError(errorMessage, { logger: init.logger });
  }
}, 'fromSharedConfigFiles');

// src/fromStatic.ts
const isFunction = setFunctionName((func) => typeof func === 'function', 'isFunction');

const { fromStatic } = require('@smithy/property-provider');
const fromStatic = setFunctionName((defaultValue) => {
  return isFunction(defaultValue) ? async () => await defaultValue() : fromStatic(defaultValue);
}, 'fromStatic');

// src/configLoader.ts
const { memoize, chain } = require('@smithy/property-provider');

const loadConfig = setFunctionName(({ environmentVariableSelector, configFileSelector, default: defaultValue }, configuration = {}) => {
  return memoize(chain(
    fromEnv(environmentVariableSelector),
    fromSharedConfigFiles(configFileSelector, configuration),
    fromStatic(defaultValue)
  ));
}, 'loadConfig');
