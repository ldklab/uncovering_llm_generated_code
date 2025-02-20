var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

const src_exports = {};
__export(src_exports, {
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
module.exports = __toCommonJS(src_exports);

const { booleanSelector, SelectorType } = require("@smithy/util-config-provider");
const { normalizeProvider } = require("@smithy/util-middleware");

const ENV_USE_DUALSTACK_ENDPOINT = "AWS_USE_DUALSTACK_ENDPOINT";
const CONFIG_USE_DUALSTACK_ENDPOINT = "use_dualstack_endpoint";
const DEFAULT_USE_DUALSTACK_ENDPOINT = false;
const NODE_USE_DUALSTACK_ENDPOINT_CONFIG_OPTIONS = {
  environmentVariableSelector: env => booleanSelector(env, ENV_USE_DUALSTACK_ENDPOINT, SelectorType.ENV),
  configFileSelector: profile => booleanSelector(profile, CONFIG_USE_DUALSTACK_ENDPOINT, SelectorType.CONFIG),
  default: false
};

const ENV_USE_FIPS_ENDPOINT = "AWS_USE_FIPS_ENDPOINT";
const CONFIG_USE_FIPS_ENDPOINT = "use_fips_endpoint";
const DEFAULT_USE_FIPS_ENDPOINT = false;
const NODE_USE_FIPS_ENDPOINT_CONFIG_OPTIONS = {
  environmentVariableSelector: env => booleanSelector(env, ENV_USE_FIPS_ENDPOINT, SelectorType.ENV),
  configFileSelector: profile => booleanSelector(profile, CONFIG_USE_FIPS_ENDPOINT, SelectorType.CONFIG),
  default: false
};

const resolveCustomEndpointsConfig = __name((input) => {
  const { endpoint, urlParser } = input;
  return {
    ...input,
    tls: input.tls ?? true,
    endpoint: normalizeProvider(typeof endpoint === "string" ? urlParser(endpoint) : endpoint),
    isCustomEndpoint: true,
    useDualstackEndpoint: normalizeProvider(input.useDualstackEndpoint ?? false)
  };
}, "resolveCustomEndpointsConfig");

const getEndpointFromRegion = __name(async (input) => {
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

const resolveEndpointsConfig = __name((input) => {
  const useDualstackEndpoint = normalizeProvider(input.useDualstackEndpoint ?? false);
  const { endpoint, useFipsEndpoint, urlParser } = input;
  return {
    ...input,
    tls: input.tls ?? true,
    endpoint: endpoint ? normalizeProvider(typeof endpoint === "string" ? urlParser(endpoint) : endpoint) : () => getEndpointFromRegion({ ...input, useDualstackEndpoint, useFipsEndpoint }),
    isCustomEndpoint: !!endpoint,
    useDualstackEndpoint
  };
}, "resolveEndpointsConfig");

const REGION_ENV_NAME = "AWS_REGION";
const REGION_INI_NAME = "region";
const NODE_REGION_CONFIG_OPTIONS = {
  environmentVariableSelector: env => env[REGION_ENV_NAME],
  configFileSelector: profile => profile[REGION_INI_NAME],
  default: () => {
    throw new Error("Region is missing");
  }
};
const NODE_REGION_CONFIG_FILE_OPTIONS = {
  preferredFile: "credentials"
};

const isFipsRegion = __name((region) => typeof region === "string" && (region.startsWith("fips-") || region.endsWith("-fips")), "isFipsRegion");

const getRealRegion = __name((region) => isFipsRegion(region) ? ["fips-aws-global", "aws-fips"].includes(region) ? "us-east-1" : region.replace(/fips-(dkr-|prod-)?|-fips/, "") : region, "getRealRegion");

const resolveRegionConfig = __name((input) => {
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
      return isFipsRegion(providedRegion) || (typeof useFipsEndpoint !== "function" ? !!useFipsEndpoint : await useFipsEndpoint());
    }
  };
}, "resolveRegionConfig");

const getHostnameFromVariants = __name((variants = [], { useFipsEndpoint, useDualstackEndpoint }) => {
  return variants.find(
    ({ tags }) => useFipsEndpoint === tags.includes("fips") && useDualstackEndpoint === tags.includes("dualstack")
  )?.hostname;
}, "getHostnameFromVariants");

const getResolvedHostname = __name((resolvedRegion, { regionHostname, partitionHostname }) => {
  return regionHostname || partitionHostname?.replace("{region}", resolvedRegion);
}, "getResolvedHostname");

const getResolvedPartition = __name((region, { partitionHash }) => {
  return Object.keys(partitionHash || {}).find((key) => partitionHash[key].regions.includes(region)) ?? "aws";
}, "getResolvedPartition");

const getResolvedSigningRegion = __name((hostname, { signingRegion, regionRegex, useFipsEndpoint }) => {
  if (signingRegion) {
    return signingRegion;
  }
  if (useFipsEndpoint) {
    const regionRegexJs = regionRegex.replace("\\\\", "\\").replace(/^\^/g, "\\.").replace(/\$$/g, "\\.");
    const matchArray = hostname.match(regionRegexJs);
    return matchArray ? matchArray[0].slice(1, -1) : undefined;
  }
}, "getResolvedSigningRegion");

const getRegionInfo = __name((region, {
  useFipsEndpoint = false,
  useDualstackEndpoint = false,
  signingService,
  regionHash,
  partitionHash
}) => {
  const partition = getResolvedPartition(region, { partitionHash });
  const resolvedRegion = region in regionHash ? region : partitionHash[partition]?.endpoint ?? region;
  const hostnameOptions = { useFipsEndpoint, useDualstackEndpoint };
  const regionHostname = getHostnameFromVariants(regionHash[resolvedRegion]?.variants, hostnameOptions);
  const partitionHostname = getHostnameFromVariants(partitionHash[partition]?.variants, hostnameOptions);
  const hostname = getResolvedHostname(resolvedRegion, { regionHostname, partitionHostname });
  
  if (hostname === undefined) {
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
    ...regionHash[resolvedRegion]?.signingService && { signingService: regionHash[resolvedRegion].signingService }
  };
}, "getRegionInfo");
