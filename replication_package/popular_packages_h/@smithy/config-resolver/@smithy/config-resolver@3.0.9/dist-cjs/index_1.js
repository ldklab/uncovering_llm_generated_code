// Utility functions for property and module management
const defineProperty = Object.defineProperty;
const getPropertyDescriptor = Object.getOwnPropertyDescriptor;
const getPropertyNames = Object.getOwnPropertyNames;
const hasProperty = Object.prototype.hasOwnProperty;
const setFunctionName = (target, value) => defineProperty(target, "name", { value, configurable: true });
const exportModule = (target, all) => {
  for (let name in all) {
    defineProperty(target, name, { get: all[name], enumerable: true });
  }
};
const copyProperties = (to, from, except, desc) => {
  if ((from && typeof from === "object") || typeof from === "function") {
    for (let key of getPropertyNames(from)) {
      if (!hasProperty.call(to, key) && key !== except) {
        defineProperty(to, key, { 
          get: () => from[key], 
          enumerable: !(desc = getPropertyDescriptor(from, key)) || desc.enumerable 
        });
      }
    }
  }
  return to;
};
const toCommonJS = (mod) => copyProperties(defineProperty({}, "__esModule", { value: true }), mod);

// Module exports
const srcExports = {};
exportModule(srcExports, {
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
module.exports = toCommonJS(srcExports);

// Dualstack endpoint configuration
const { booleanSelector, SelectorType } = require("@smithy/util-config-provider");
const ENV_USE_DUALSTACK_ENDPOINT = "AWS_USE_DUALSTACK_ENDPOINT";
const CONFIG_USE_DUALSTACK_ENDPOINT = "use_dualstack_endpoint";
const DEFAULT_USE_DUALSTACK_ENDPOINT = false;
const NODE_USE_DUALSTACK_ENDPOINT_CONFIG_OPTIONS = {
  environmentVariableSelector: (env) => booleanSelector(env, ENV_USE_DUALSTACK_ENDPOINT, SelectorType.ENV),
  configFileSelector: (profile) => booleanSelector(profile, CONFIG_USE_DUALSTACK_ENDPOINT, SelectorType.CONFIG),
  default: false
};

// FIPS endpoint configuration
const ENV_USE_FIPS_ENDPOINT = "AWS_USE_FIPS_ENDPOINT";
const CONFIG_USE_FIPS_ENDPOINT = "use_fips_endpoint";
const DEFAULT_USE_FIPS_ENDPOINT = false;
const NODE_USE_FIPS_ENDPOINT_CONFIG_OPTIONS = {
  environmentVariableSelector: (env) => booleanSelector(env, ENV_USE_FIPS_ENDPOINT, SelectorType.ENV),
  configFileSelector: (profile) => booleanSelector(profile, CONFIG_USE_FIPS_ENDPOINT, SelectorType.CONFIG),
  default: false
};

// Custom endpoint resolution
const { normalizeProvider } = require("@smithy/util-middleware");
const resolveCustomEndpointsConfig = /* @__PURE__ */ setFunctionName((input) => {
  const { endpoint, urlParser } = input;
  return {
    ...input,
    tls: input.tls ?? true,
    endpoint: normalizeProvider(typeof endpoint === "string" ? urlParser(endpoint) : endpoint),
    isCustomEndpoint: true,
    useDualstackEndpoint: normalizeProvider(input.useDualstackEndpoint ?? false)
  };
}, "resolveCustomEndpointsConfig");

// Endpoints from region
const getEndpointFromRegion = /* @__PURE__ */ setFunctionName(async (input) => {
  const { tls = true } = input;
  const region = await input.region();
  const dnsHostRegex = new RegExp(/^([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9])$/);
  if (!dnsHostRegex.test(region)) {
    throw new Error("Invalid region in client config");
  }
  const useDualstackEndpoint = await input.useDualstackEndpoint();
  const useFipsEndpoint = await input.useFipsEndpoint();
  const { hostname } = await input.regionInfoProvider(region, { useDualstackEndpoint, useFipsEndpoint }) ?? {};
  if (!hostname) {
    throw new Error("Cannot resolve hostname from client config");
  }
  return input.urlParser(`${tls ? "https:" : "http:"}//${hostname}`);
}, "getEndpointFromRegion");

// Resolve endpoints
const resolveEndpointsConfig = /* @__PURE__ */ setFunctionName((input) => {
  const useDualstackEndpoint = normalizeProvider(input.useDualstackEndpoint ?? false);
  const { endpoint, useFipsEndpoint, urlParser } = input;
  return {
    ...input,
    tls: input.tls ?? true,
    endpoint: endpoint ? normalizeProvider(typeof endpoint === "string" ? urlParser(endpoint) : endpoint) 
             : () => getEndpointFromRegion({ ...input, useDualstackEndpoint, useFipsEndpoint }),
    isCustomEndpoint: !!endpoint,
    useDualstackEndpoint
  };
}, "resolveEndpointsConfig");

// Region config extraction
const REGION_ENV_NAME = "AWS_REGION";
const REGION_INI_NAME = "region";
const NODE_REGION_CONFIG_OPTIONS = {
  environmentVariableSelector: (env) => env[REGION_ENV_NAME],
  configFileSelector: (profile) => profile[REGION_INI_NAME],
  default: () => {
    throw new Error("Region is missing");
  }
};
const NODE_REGION_CONFIG_FILE_OPTIONS = {
  preferredFile: "credentials"
};

// FIPS region verification
const isFipsRegion = /* @__PURE__ */ setFunctionName((region) => typeof region === "string" && (region.startsWith("fips-") || region.endsWith("-fips")), "isFipsRegion");

// Real region determination
const getRealRegion = /* @__PURE__ */ setFunctionName((region) => {
  return isFipsRegion(region) ? ["fips-aws-global", "aws-fips"].includes(region) ? "us-east-1" : region.replace(/fips-(dkr-|prod-)?|-fips/, "") : region;
}, "getRealRegion");

// Resolve region
const resolveRegionConfig = /* @__PURE__ */ setFunctionName((input) => {
  const { region, useFipsEndpoint } = input;
  if (!region) {
    throw new Error("Region is missing");
  }
  return {
    ...input,
    region: async () => {
      if (typeof region === "string") {
        return getRealRegion(region);
      }
      const providedRegion = await region();
      return getRealRegion(providedRegion);
    },
    useFipsEndpoint: async () => {
      const providedRegion = typeof region === "string" ? region : await region();
      if (isFipsRegion(providedRegion)) {
        return true;
      }
      return typeof useFipsEndpoint !== "function" ? Promise.resolve(!!useFipsEndpoint) : useFipsEndpoint();
    }
  };
}, "resolveRegionConfig");

// Hostname resolution from region info
const getHostnameFromVariants = /* @__PURE__ */ setFunctionName((variants = [], { useFipsEndpoint, useDualstackEndpoint }) => {
  return variants.find(
    ({ tags }) => useFipsEndpoint === tags.includes("fips") && useDualstackEndpoint === tags.includes("dualstack")
  )?.hostname;
}, "getHostnameFromVariants");

const getResolvedHostname = /* @__PURE__ */ setFunctionName((resolvedRegion, { regionHostname, partitionHostname }) => {
  return regionHostname ? regionHostname : partitionHostname ? partitionHostname.replace("{region}", resolvedRegion) : undefined;
}, "getResolvedHostname");

const getResolvedPartition = /* @__PURE__ */ setFunctionName((region, { partitionHash }) => {
  return Object.keys(partitionHash || {}).find((key) => partitionHash[key].regions.includes(region)) ?? "aws";
}, "getResolvedPartition");

const getResolvedSigningRegion = /* @__PURE__ */ setFunctionName((hostname, { signingRegion, regionRegex, useFipsEndpoint }) => {
  if (signingRegion) {
    return signingRegion;
  } else if (useFipsEndpoint) {
    const regionRegexJs = regionRegex.replace("\\\\", "\\").replace(/^\^/g, "\\.").replace(/\$$/g, "\\.");
    const matchArray = hostname.match(regionRegexJs);
    if (matchArray) {
      return matchArray[0].slice(1, -1);
    }
  }
}, "getResolvedSigningRegion");

// Get region info
const getRegionInfo = /* @__PURE__ */ setFunctionName((region, {
  useFipsEndpoint = false,
  useDualstackEndpoint = false,
  signingService,
  regionHash,
  partitionHash
}) => {
  const partition = getResolvedPartition(region, { partitionHash });
  const resolvedRegion = region in regionHash ? region : partitionHash[partition]?.endpoint || region;
  const hostnameOptions = { useFipsEndpoint, useDualstackEndpoint };
  const regionHostname = getHostnameFromVariants(regionHash[resolvedRegion]?.variants, hostnameOptions);
  const partitionHostname = getHostnameFromVariants(partitionHash[partition]?.variants, hostnameOptions);
  const hostname = getResolvedHostname(resolvedRegion, { regionHostname, partitionHostname });
  if (!hostname) {
    throw new Error(`Endpoint resolution failed for: ${{ resolvedRegion, useFipsEndpoint, useDualstackEndpoint }}`);
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
    ...(signingRegion && { signingRegion }),
    ...(regionHash[resolvedRegion]?.signingService && { signingService: regionHash[resolvedRegion].signingService })
  };
}, "getRegionInfo");
