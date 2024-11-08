"use strict";

const REGION_ENV_NAME = "AWS_REGION";
const REGION_INI_NAME = "region";

const NODE_REGION_CONFIG_OPTIONS = {
  environmentVariableSelector: (env) => env[REGION_ENV_NAME],
  configFileSelector: (profile) => profile[REGION_INI_NAME],
  default: () => { throw new Error("Region is missing"); }
};

const NODE_REGION_CONFIG_FILE_OPTIONS = {
  preferredFile: "credentials"
};

function isFipsRegion(region) {
  return typeof region === "string" &&
    (region.startsWith("fips-") || region.endsWith("-fips"));
}

function getRealRegion(region) {
  if (isFipsRegion(region)) {
    return ["fips-aws-global", "aws-fips"].includes(region) ? "us-east-1" : region.replace(/fips-(dkr-|prod-)?|-fips/, "");
  }
  return region;
}

function getAwsRegionExtensionConfiguration(runtimeConfig) {
  let runtimeConfigRegion = async () => {
    if (runtimeConfig.region === undefined) {
      throw new Error("Region is missing from runtimeConfig");
    }
    const region = runtimeConfig.region;
    return typeof region === "string" ? region : region();
  };

  return {
    setRegion: (region) => { runtimeConfigRegion = region; },
    region: () => runtimeConfigRegion,
  };
}

function resolveAwsRegionExtensionConfiguration(awsRegionExtensionConfiguration) {
  return {
    region: awsRegionExtensionConfiguration.region()
  };
}

function resolveRegionConfig(input) {
  const { region, useFipsEndpoint } = input;
  if (!region) throw new Error("Region is missing");

  return {
    ...input,
    region: async () => {
      const resolvedRegion = typeof region === "string" ? region : await region();
      return getRealRegion(resolvedRegion);
    },
    useFipsEndpoint: async () => {
      const resolvedRegion = typeof region === "string" ? region : await region();
      return isFipsRegion(resolvedRegion) ? true : (typeof useFipsEndpoint !== "function" ? !!useFipsEndpoint : useFipsEndpoint());
    }
  };
}

module.exports = {
  getAwsRegionExtensionConfiguration,
  resolveAwsRegionExtensionConfiguration,
  resolveRegionConfig,
  REGION_ENV_NAME,
  REGION_INI_NAME,
  NODE_REGION_CONFIG_OPTIONS,
  NODE_REGION_CONFIG_FILE_OPTIONS
};
