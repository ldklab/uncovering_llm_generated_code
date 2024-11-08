"use strict";

// Constants for region configuration
const REGION_ENV_NAME = "AWS_REGION";
const REGION_INI_NAME = "region";
const NODE_REGION_CONFIG_OPTIONS = {
  environmentVariableSelector: env => env[REGION_ENV_NAME],
  configFileSelector: profile => profile[REGION_INI_NAME],
  default: () => { throw new Error("Region is missing"); }
};
const NODE_REGION_CONFIG_FILE_OPTIONS = {
  preferredFile: "credentials"
};

// Utility to detect FIPS region
function isFipsRegion(region) {
  return typeof region === "string" && (region.startsWith("fips-") || region.endsWith("-fips"));
}

// Utility to get the real AWS region, handling FIPS modifications
function getRealRegion(region) {
  if (!isFipsRegion(region)) return region;
  return ["fips-aws-global", "aws-fips"].includes(region) ? "us-east-1" : region.replace(/fips-(dkr-|prod-)?|-fips/, "");
}

// Function to get AWS region extension configuration
function getAwsRegionExtensionConfiguration(runtimeConfig) {
  let runtimeConfigRegion = async () => {
    if (runtimeConfig.region === undefined) throw new Error("Region is missing from runtimeConfig");
    const region = runtimeConfig.region;
    return typeof region === "string" ? region : region();
  };

  return {
    setRegion(region) { runtimeConfigRegion = region; },
    region() { return runtimeConfigRegion; }
  };
}

// Function to resolve AWS region extension configuration
function resolveAwsRegionExtensionConfiguration(awsRegionExtensionConfiguration) {
  return { region: awsRegionExtensionConfiguration.region() };
}

// Function to resolve region configuration
function resolveRegionConfig(input) {
  const { region, useFipsEndpoint } = input;
  if (!region) throw new Error("Region is missing");

  return {
    ...input,
    region: async () => {
      if (typeof region === "string") return getRealRegion(region);
      const providedRegion = await region();
      return getRealRegion(providedRegion);
    },
    useFipsEndpoint: async () => {
      const providedRegion = typeof region === "string" ? region : await region();
      return isFipsRegion(providedRegion) || (typeof useFipsEndpoint !== "function"
        ? Promise.resolve(!!useFipsEndpoint) : useFipsEndpoint());
    }
  };
}

// Export all functions and constants
module.exports = {
  getAwsRegionExtensionConfiguration,
  resolveAwsRegionExtensionConfiguration,
  REGION_ENV_NAME,
  REGION_INI_NAME,
  NODE_REGION_CONFIG_OPTIONS,
  NODE_REGION_CONFIG_FILE_OPTIONS,
  resolveRegionConfig
};
