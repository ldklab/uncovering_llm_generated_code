const { loadConfig } = require("@smithy/node-config-provider");
const { memoize } = require("@smithy/property-provider");
const { NODE_REGION_CONFIG_OPTIONS } = require("@smithy/config-resolver");

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

const resolveDefaultsModeConfig = ({
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
    case void 0:
      return Promise.resolve("legacy");
    default:
      throw new Error(`Invalid parameter for "defaultsMode", expect ${DEFAULTS_MODE_OPTIONS.join(", ")}, got ${mode}`);
  }
});

const resolveNodeDefaultsModeAuto = async (clientRegion) => {
  if (clientRegion) {
    const resolvedRegion = typeof clientRegion === "function" ? await clientRegion() : clientRegion;
    const inferredRegion = await inferPhysicalRegion();
    if (!inferredRegion) {
      return "standard";
    }
    return resolvedRegion === inferredRegion ? "in-region" : "cross-region";
  }
  return "standard";
};

const inferPhysicalRegion = async () => {
  if (process.env[AWS_EXECUTION_ENV] && (process.env[AWS_REGION_ENV] || process.env[AWS_DEFAULT_REGION_ENV])) {
    return process.env[AWS_REGION_ENV] ?? process.env[AWS_DEFAULT_REGION_ENV];
  }
  if (!process.env[ENV_IMDS_DISABLED]) {
    try {
      const { getInstanceMetadataEndpoint, httpRequest } = await require("@smithy/credential-provider-imds");
      const endpoint = await getInstanceMetadataEndpoint();
      return (await httpRequest({ ...endpoint, path: IMDS_REGION_PATH })).toString().trim();
    } catch (e) {
      // Handle errors silently
    }
  }
};

module.exports = { resolveDefaultsModeConfig };
