"use strict";

// Utility functions to define properties and handle module exports
const defineProperty = Object.defineProperty;
const getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
const getOwnPropertyNames = Object.getOwnPropertyNames;
const hasOwnProperty = Object.prototype.hasOwnProperty;

const setFunctionName = (fn, name) => defineProperty(fn, "name", { value: name, configurable: true });

const exportModule = (target, exports) => {
  for (const name in exports) {
    defineProperty(target, name, { get: exports[name], enumerable: true });
  }
};

const copyProperties = (to, from, exclude, desc) => {
  if (from && (typeof from === "object" || typeof from === "function")) {
    for (const key of getOwnPropertyNames(from)) {
      if (!hasOwnProperty.call(to, key) && key !== exclude) {
        defineProperty(to, key, { get: () => from[key], enumerable: !(desc = getOwnPropertyDescriptor(from, key)) || desc.enumerable });
      }
    }
  }
  return to;
};

const toCommonJS = (mod) => copyProperties(defineProperty({}, "__esModule", { value: true }), mod);

// Exporting necessary entities and configurations
const srcExports = {};
exportModule(srcExports, {
  NODE_REGION_CONFIG_FILE_OPTIONS,
  NODE_REGION_CONFIG_OPTIONS,
  REGION_ENV_NAME,
  REGION_INI_NAME,
  getAwsRegionExtensionConfiguration,
  resolveAwsRegionExtensionConfiguration,
  resolveRegionConfig,
});
module.exports = toCommonJS(srcExports);

// Extension to get AWS region configuration
const getAwsRegionExtensionConfiguration = setFunctionName((runtimeConfig) => {
  let runtimeConfigRegion = setFunctionName(async () => {
    if (runtimeConfig.region === undefined) {
      throw new Error("Region is missing from runtimeConfig");
    }
    const { region } = runtimeConfig;
    return typeof region === "string" ? region : region();
  }, "runtimeConfigRegion");

  return {
    setRegion(region) {
      runtimeConfigRegion = region;
    },
    region() {
      return runtimeConfigRegion;
    },
  };
}, "getAwsRegionExtensionConfiguration");

// Resolving AWS region extension configuration
const resolveAwsRegionExtensionConfiguration = setFunctionName((awsRegionExtensionConfiguration) => {
  return { region: awsRegionExtensionConfiguration.region() };
}, "resolveAwsRegionExtensionConfiguration");

// Region-related constants and options
const REGION_ENV_NAME = "AWS_REGION";
const REGION_INI_NAME = "region";
const NODE_REGION_CONFIG_OPTIONS = {
  environmentVariableSelector: (env) => env[REGION_ENV_NAME],
  configFileSelector: (profile) => profile[REGION_INI_NAME],
  default: () => { throw new Error("Region is missing"); },
};
const NODE_REGION_CONFIG_FILE_OPTIONS = { preferredFile: "credentials" };

// Function to check if a region is a FIPS region
const isFipsRegion = setFunctionName((region) => {
  return typeof region === "string" && (region.startsWith("fips-") || region.endsWith("-fips"));
}, "isFipsRegion");

// Get "real" AWS region from potentially FIPS regions
const getRealRegion = setFunctionName((region) => {
  if (isFipsRegion(region)) {
    return ["fips-aws-global", "aws-fips"].includes(region) ? "us-east-1" : region.replace(/fips-(dkr-|prod-)?|-fips/, "");
  }
  return region;
}, "getRealRegion");

// Resolve AWS region configuration:
const resolveRegionConfig = setFunctionName((input) => {
  const { region, useFipsEndpoint } = input;
  if (!region) {
    throw new Error("Region is missing");
  }
  return {
    ...input,
    region: async () => {
      const resolvedRegion = typeof region === "string" ? region : await region();
      return getRealRegion(resolvedRegion);
    },
    useFipsEndpoint: async () => {
      const resolvedRegion = typeof region === "string" ? region : await region();
      if (isFipsRegion(resolvedRegion)) {
        return true;
      }
      return typeof useFipsEndpoint !== "function" ? !!useFipsEndpoint : await useFipsEndpoint();
    }
  };
}, "resolveRegionConfig");
