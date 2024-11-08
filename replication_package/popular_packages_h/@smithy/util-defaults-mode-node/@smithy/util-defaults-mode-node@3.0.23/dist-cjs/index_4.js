const { create, defineProperty, getOwnPropertyDescriptor, getOwnPropertyNames, getPrototypeOf } = Object;
const { hasOwnProperty } = Object.prototype;

const defineName = (target, value) => defineProperty(target, "name", { value, configurable: true });

const exportModule = (target, all) => {
  for (const name in all) {
    defineProperty(target, name, { get: all[name], enumerable: true });
  }
};

const copyProperties = (to, from, except, desc) => {
  if (from && (typeof from === "object" || typeof from === "function")) {
    for (let key of getOwnPropertyNames(from)) {
      if (!hasOwnProperty.call(to, key) && key !== except) {
        defineProperty(to, key, { 
          get: () => from[key], 
          enumerable: !(desc = getOwnPropertyDescriptor(from, key)) || desc.enumerable 
        });
      }
    }
  }
  return to;
};

const toESM = (mod, isNodeMode, target) => (
  target = mod != null ? create(getPrototypeOf(mod)) : {}, 
  copyProperties(isNodeMode || !mod || !mod.__esModule ? defineProperty(target, "default", { value: mod, enumerable: true }) : target, mod)
);

const toCommonJS = (mod) => copyProperties(defineProperty({}, "__esModule", { value: true }), mod);

// Define constants
const AWS_EXECUTION_ENV = "AWS_EXECUTION_ENV";
const AWS_REGION_ENV = "AWS_REGION";
const AWS_DEFAULT_REGION_ENV = "AWS_DEFAULT_REGION";
const ENV_IMDS_DISABLED = "AWS_EC2_METADATA_DISABLED";
const DEFAULTS_MODE_OPTIONS = ["in-region", "cross-region", "mobile", "standard", "legacy"];
const IMDS_REGION_PATH = "/latest/meta-data/placement/region";

const AWS_DEFAULTS_MODE_ENV = "AWS_DEFAULTS_MODE";
const AWS_DEFAULTS_MODE_CONFIG = "defaults_mode";

const NODE_DEFAULTS_MODE_CONFIG_OPTIONS = {
  environmentVariableSelector: (env) => env[AWS_DEFAULTS_MODE_ENV],
  configFileSelector: (profile) => profile[AWS_DEFAULTS_MODE_CONFIG],
  default: "legacy"
};

// Import necessary modules
const { NODE_REGION_CONFIG_OPTIONS } = require("@smithy/config-resolver");
const { loadConfig } = require("@smithy/node-config-provider");
const { memoize } = require("@smithy/property-provider");

// Resolve Defaults Mode Config function
const resolveDefaultsModeConfig = /* @__PURE__ */ defineName(({
  region = loadConfig(NODE_REGION_CONFIG_OPTIONS),
  defaultsMode = loadConfig(NODE_DEFAULTS_MODE_CONFIG_OPTIONS)
} = {}) => memoize(async () => {
  const mode = typeof defaultsMode === "function" ? await defaultsMode() : defaultsMode;
  switch (mode?.toLowerCase()) {
    case "auto":
      return resolveNodeDefaultsModeAuto(region);
    case "in-region":
    case "cross-region":
    case "mobile":
    case "standard":
    case "legacy":
      return Promise.resolve(mode?.toLowerCase());
    default:
      throw new Error(`Invalid parameter for "defaultsMode", expect ${DEFAULTS_MODE_OPTIONS.join(", ")}, got ${mode}`);
  }
}), "resolveDefaultsModeConfig");

const resolveNodeDefaultsModeAuto = /* @__PURE__ */ defineName(async (clientRegion) => {
  if (clientRegion) {
    const resolvedRegion = typeof clientRegion === "function" ? await clientRegion() : clientRegion;
    const inferredRegion = await inferPhysicalRegion();
    return resolvedRegion === inferredRegion ? "in-region" : "cross-region";
  }
  return "standard";
}, "resolveNodeDefaultsModeAuto");

const inferPhysicalRegion = /* @__PURE__ */ defineName(async () => {
  if (process.env[AWS_EXECUTION_ENV] && (process.env[AWS_REGION_ENV] || process.env[AWS_DEFAULT_REGION_ENV])) {
    return process.env[AWS_REGION_ENV] ?? process.env[AWS_DEFAULT_REGION_ENV];
  }
  if (!process.env[ENV_IMDS_DISABLED]) {
    try {
      const { getInstanceMetadataEndpoint, httpRequest } = await import("@smithy/credential-provider-imds");
      const endpoint = await getInstanceMetadataEndpoint();
      return (await httpRequest({ ...endpoint, path: IMDS_REGION_PATH })).toString();
    } catch (e) {}
  }
}, "inferPhysicalRegion");

// Export module
const src_exports = {};
exportModule(src_exports, {
  resolveDefaultsModeConfig: () => resolveDefaultsModeConfig
});
module.exports = toCommonJS(src_exports);
