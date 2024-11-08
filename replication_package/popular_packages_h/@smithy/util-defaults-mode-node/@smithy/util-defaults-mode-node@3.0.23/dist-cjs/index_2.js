const { loadConfig } = require('@smithy/node-config-provider');
const { memoize } = require('@smithy/property-provider');
const { NODE_REGION_CONFIG_OPTIONS } = require('@smithy/config-resolver');

const AWS_EXECUTION_ENV = "AWS_EXECUTION_ENV";
const AWS_REGION_ENV = "AWS_REGION";
const AWS_DEFAULT_REGION_ENV = "AWS_DEFAULT_REGION";
const ENV_IMDS_DISABLED = "AWS_EC2_METADATA_DISABLED";
const DEFAULTS_MODE_OPTIONS = ["in-region", "cross-region", "mobile", "standard", "legacy"];
const IMDS_REGION_PATH = "/latest/meta-data/placement/region";

const resolveDefaultsModeConfig = ({
  region = loadConfig(NODE_REGION_CONFIG_OPTIONS),
  defaultsMode = loadConfig(NODE_DEFAULTS_MODE_CONFIG_OPTIONS)
} = {}) => memoize(async () => {
  const mode = typeof defaultsMode === "function" ? await defaultsMode() : defaultsMode;
  if (!mode) return "legacy";
  switch (mode.toLowerCase()) {
    case "auto":
      return resolveNodeDefaultsModeAuto(region);
    case "in-region":
    case "cross-region":
    case "mobile":
    case "standard":
    case "legacy":
      return Promise.resolve(mode.toLocaleLowerCase());
    default:
      throw new Error(
        `Invalid parameter for "defaultsMode", expect ${DEFAULTS_MODE_OPTIONS.join(", ")}, got ${mode}`
      );
  }
});

const resolveNodeDefaultsModeAuto = async (clientRegion) => {
  if (clientRegion) {
    const resolvedRegion = typeof clientRegion === "function" ? await clientRegion() : clientRegion;
    const inferredRegion = await inferPhysicalRegion();
    if (!inferredRegion) return "standard";
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
      const { getInstanceMetadataEndpoint, httpRequest } = require('@smithy/credential-provider-imds');
      const endpoint = await getInstanceMetadataEndpoint();
      return (await httpRequest({ ...endpoint, path: IMDS_REGION_PATH })).toString();
    } catch (e) {
      return undefined;
    }
  }
};

module.exports = { resolveDefaultsModeConfig };
