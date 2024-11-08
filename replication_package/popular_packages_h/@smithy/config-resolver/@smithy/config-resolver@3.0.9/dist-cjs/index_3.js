const { booleanSelector, SelectorType } = require('@smithy/util-config-provider');
const { normalizeProvider } = require('@smithy/util-middleware');

const defineProperty = Object.defineProperty;
const getOwnPropDesc = Object.getOwnPropertyDescriptor;
const getOwnPropNames = Object.getOwnPropertyNames;
const hasOwnProperty = Object.prototype.hasOwnProperty;

const setName = (target, value) => defineProperty(target, 'name', { value, configurable: true });
const exportModule = (target, allProps) => {
  for (let name in allProps) {
    defineProperty(target, name, { get: allProps[name], enumerable: true });
  }
};

const copyProperties = (destination, source, except, desc) => {
  if ((source && typeof source === 'object') || typeof source === 'function') {
    for (let key of getOwnPropNames(source)) {
      if (!hasOwnProperty.call(destination, key) && key !== except) {
        defineProperty(destination, key, {
          get: () => source[key],
          enumerable: !(desc = getOwnPropDesc(source, key)) || desc.enumerable
        });
      }
    }
  }
  return destination;
};

const toCommonJS = (mod) => copyProperties(defineProperty({}, '__esModule', { value: true }), mod);

const src_exports = {};

exportModule(src_exports, {
  CONFIG_USE_DUALSTACK_ENDPOINT: () => CONFIG_USE_DUALSTACK_ENDPOINT,
  CONFIG_USE_FIPS_ENDPOINT: () => CONFIG_USE_FIPS_ENDPOINT,
  DEFAULT_USE_DUALSTACK_ENDPOINT: () => DEFAULT_USE_DUALSTACK_ENDPOINT,
  DEFAULT_USE_FIPS_ENDPOINT: () => DEFAULT_USE_FIPS_ENDPOINT,
  ENV_USE_DUALSTACK_ENDPOINT: () => ENV_USE_DUALSTACK_ENDPOINT,
  ENV_USE_FIPS_ENDPOINT: () => ENV_USE_FIPS_ENDPOINT,
  NODE_REGION_CONFIG_FILE_OPTIONS: () => NODE_REGION_CONFIG_FILE_OPTIONS,
  NODE_REGION_CONFIG_OPTIONS: () => NODE_REGION_CONFIG_OPTIONS,
  NODE_USE_DUALSTACK_ENDPOINT_CONFIG_OPTIONS: () => NODE_USE_DUALSTACK_ENDPOINT_CONFIG_OPTIONS,
  NODE_USE_FIPS_ENDPOINT_CONFIG_OPTIONS: () => NODE_USE_FIPS_ENDPOINT_CONFIG_OPTIONS,
  REGION_ENV_NAME: () => REGION_ENV_NAME,
  REGION_INI_NAME: () => REGION_INI_NAME,
  getRegionInfo: () => getRegionInfo,
  resolveCustomEndpointsConfig: () => resolveCustomEndpointsConfig,
  resolveEndpointsConfig: () => resolveEndpointsConfig,
  resolveRegionConfig: () => resolveRegionConfig
});

module.exports = toCommonJS(src_exports);

const ENV_USE_DUALSTACK_ENDPOINT = 'AWS_USE_DUALSTACK_ENDPOINT';
const CONFIG_USE_DUALSTACK_ENDPOINT = 'use_dualstack_endpoint';
const DEFAULT_USE_DUALSTACK_ENDPOINT = false;

const NODE_USE_DUALSTACK_ENDPOINT_CONFIG_OPTIONS = {
  environmentVariableSelector: (env) => booleanSelector(env, ENV_USE_DUALSTACK_ENDPOINT, SelectorType.ENV),
  configFileSelector: (profile) => booleanSelector(profile, CONFIG_USE_DUALSTACK_ENDPOINT, SelectorType.CONFIG),
  default: false
};

const ENV_USE_FIPS_ENDPOINT = 'AWS_USE_FIPS_ENDPOINT';
const CONFIG_USE_FIPS_ENDPOINT = 'use_fips_endpoint';
const DEFAULT_USE_FIPS_ENDPOINT = false;

const NODE_USE_FIPS_ENDPOINT_CONFIG_OPTIONS = {
  environmentVariableSelector: (env) => booleanSelector(env, ENV_USE_FIPS_ENDPOINT, SelectorType.ENV),
  configFileSelector: (profile) => booleanSelector(profile, CONFIG_USE_FIPS_ENDPOINT, SelectorType.CONFIG),
  default: false
};

const resolveCustomEndpointsConfig = setName((input) => {
  const { endpoint, urlParser } = input;
  return {
    ...input,
    tls: input.tls ?? true,
    endpoint: normalizeProvider(typeof endpoint === 'string' ? urlParser(endpoint) : endpoint),
    isCustomEndpoint: true,
    useDualstackEndpoint: normalizeProvider(input.useDualstackEndpoint ?? false)
  };
}, "resolveCustomEndpointsConfig");

const getEndpointFromRegion = setName(async (input) => {
  const { tls = true } = input;
  const region = await input.region();
  if (!/^([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9])$/.test(region)) {
    throw new Error('Invalid region in client config');
  }
  const useDualstackEndpoint = await input.useDualstackEndpoint();
  const useFipsEndpoint = await input.useFipsEndpoint();
  const { hostname } = await input.regionInfoProvider(region, { useDualstackEndpoint, useFipsEndpoint }) ?? {};
  if (!hostname) {
    throw new Error('Cannot resolve hostname from client config');
  }
  return input.urlParser(`${tls ? 'https:' : 'http:'}//${hostname}`);
}, "getEndpointFromRegion");

const resolveEndpointsConfig = setName((input) => {
  const useDualstackEndpoint = normalizeProvider(input.useDualstackEndpoint ?? false);
  const { endpoint, useFipsEndpoint, urlParser } = input;
  return {
    ...input,
    tls: input.tls ?? true,
    endpoint: endpoint ? normalizeProvider(typeof endpoint === 'string' ? urlParser(endpoint) : endpoint) : () => getEndpointFromRegion({ ...input, useDualstackEndpoint, useFipsEndpoint }),
    isCustomEndpoint: !!endpoint,
    useDualstackEndpoint
  };
}, "resolveEndpointsConfig");

const REGION_ENV_NAME = 'AWS_REGION';
const REGION_INI_NAME = 'region';

const NODE_REGION_CONFIG_OPTIONS = {
  environmentVariableSelector: (env) => env[REGION_ENV_NAME],
  configFileSelector: (profile) => profile[REGION_INI_NAME],
  default: () => { throw new Error('Region is missing'); }
};

const NODE_REGION_CONFIG_FILE_OPTIONS = {
  preferredFile: 'credentials'
};

const isFipsRegion = setName((region) => typeof region === 'string' && (region.startsWith('fips-') || region.endsWith('-fips')), "isFipsRegion");

const getRealRegion = setName((region) => 
  isFipsRegion(region) ? 
      ['fips-aws-global', 'aws-fips'].includes(region) ? 
        'us-east-1' : region.replace(/fips-(dkr-|prod-)?|-fips/, '') : region, 
"getRealRegion");

const resolveRegionConfig = setName((input) => {
  const { region, useFipsEndpoint } = input;
  if (!region) {
    throw new Error('Region is missing');
  }
  return {
    ...input,
    region: async () => {
      if (typeof region === 'string') {
        return getRealRegion(region);
      }
      const providedRegion = await region();
      return getRealRegion(providedRegion);
    },
    useFipsEndpoint: async () => {
      const providedRegion = typeof region === 'string' ? region : await region();
      if (isFipsRegion(providedRegion)) {
        return true;
      }
      return typeof useFipsEndpoint !== 'function' ? Promise.resolve(!!useFipsEndpoint) : useFipsEndpoint();
    }
  };
}, "resolveRegionConfig");

const getHostnameFromVariants = setName((variants = [], { useFipsEndpoint, useDualstackEndpoint }) => {
  var _a;
  return (_a = variants.find(
    ({ tags }) => useFipsEndpoint === tags.includes('fips') && useDualstackEndpoint === tags.includes('dualstack')
  ))?.hostname;
}, "getHostnameFromVariants");

const getResolvedHostname = setName((resolvedRegion, { regionHostname, partitionHostname }) => {
  return regionHostname ? regionHostname : partitionHostname ? partitionHostname.replace('{region}', resolvedRegion) : undefined;
}, "getResolvedHostname");

const getResolvedPartition = setName((region, { partitionHash }) => {
  return Object.keys(partitionHash || {}).find((key) => partitionHash[key].regions.includes(region)) ?? 'aws';
}, "getResolvedPartition");

const getResolvedSigningRegion = setName((hostname, { signingRegion, regionRegex, useFipsEndpoint }) => {
  if (signingRegion) {
    return signingRegion;
  } else if (useFipsEndpoint) {
    const regionRegexJs = regionRegex.replace('\\\\', '\\').replace(/^\^/g, '\\.').replace(/\$$/g, '\\.');
    const regionRegexmatchArray = hostname.match(regionRegexJs);
    if (regionRegexmatchArray) {
      return regionRegexmatchArray[0].slice(1, -1);
    }
  }
}, "getResolvedSigningRegion");

const getRegionInfo = setName((region, {
  useFipsEndpoint = false,
  useDualstackEndpoint = false,
  signingService,
  regionHash,
  partitionHash
}) => {
  const partition = getResolvedPartition(region, { partitionHash });
  const resolvedRegion = region in regionHash ? region : (partitionHash[partition]?.endpoint) ?? region;
  const hostnameOptions = { useFipsEndpoint, useDualstackEndpoint };
  const regionHostname = getHostnameFromVariants(regionHash[resolvedRegion]?.variants, hostnameOptions);
  const partitionHostname = getHostnameFromVariants(partitionHash[partition]?.variants, hostnameOptions);
  const hostname = getResolvedHostname(resolvedRegion, { regionHostname, partitionHostname });
  if (!hostname) {
    throw new Error(`Endpoint resolution failed for: ${JSON.stringify({ resolvedRegion, useFipsEndpoint, useDualstackEndpoint })}`);
  }
  const signingRegion = getResolvedSigningRegion(hostname, {
    signingRegion: regionHash[resolvedRegion]?.signingRegion,
    regionRegex: partitionHash[partition].regionRegex,
    useFipsEndpoint
  });
  return {
    partition,
    signingService,
    hostname,
    ...signingRegion && { signingRegion },
    ...regionHash[resolvedRegion]?.signingService && {
      signingService: regionHash[resolvedRegion].signingService
    }
  };
}, "getRegionInfo");
