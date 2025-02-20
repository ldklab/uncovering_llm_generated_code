"use strict";

const defineProperty = Object.defineProperty;
const getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
const getOwnPropertyNames = Object.getOwnPropertyNames;
const hasOwnProp = Object.prototype.hasOwnProperty;

const defineName = (target, value) => defineProperty(target, "name", { value, configurable: true });
const exportModule = (target, all) => {
  for (const name in all) {
    defineProperty(target, name, { get: all[name], enumerable: true });
  }
};

const copyProperties = (to, from, except, desc) => {
  if (from && (typeof from === "object" || typeof from === "function")) {
    for (const key of getOwnPropertyNames(from)) {
      if (!hasOwnProp.call(to, key) && key !== except) {
        defineProperty(to, key, {
          get: () => from[key],
          enumerable: !(desc = getOwnPropertyDescriptor(from, key)) || desc.enumerable
        });
      }
    }
  }
  return to;
};

const toCommonJS = (mod) => copyProperties(defineProperty({}, "__esModule", { value: true }), mod);

// src/index.ts
const srcExports = {};
exportModule(srcExports, {
  NODE_REGION_CONFIG_FILE_OPTIONS: () => NODE_REGION_CONFIG_FILE_OPTIONS,
  NODE_REGION_CONFIG_OPTIONS: () => NODE_REGION_CONFIG_OPTIONS,
  REGION_ENV_NAME: () => REGION_ENV_NAME,
  REGION_INI_NAME: () => REGION_INI_NAME,
  getAwsRegionExtensionConfiguration: () => getAwsRegionExtensionConfiguration,
  resolveAwsRegionExtensionConfiguration: () => resolveAwsRegionExtensionConfiguration,
  resolveRegionConfig: () => resolveRegionConfig
});
module.exports = toCommonJS(srcExports);

// src/extensions/index.ts
const getAwsRegionExtensionConfiguration = defineName((runtimeConfig) => {
  let runtimeConfigRegion = defineName(async () => {
    if (runtimeConfig.region === undefined) {
      throw new Error("Region is missing from runtimeConfig");
    }
    const region = runtimeConfig.region;
    if (typeof region === "string") {
      return region;
    }
    return region();
  }, "runtimeConfigRegion");

  return {
    setRegion(region) {
      runtimeConfigRegion = region;
    },
    region() {
      return runtimeConfigRegion;
    }
  };
}, "getAwsRegionExtensionConfiguration");

const resolveAwsRegionExtensionConfiguration = defineName((awsRegionExtensionConfiguration) => ({
  region: awsRegionExtensionConfiguration.region()
}), "resolveAwsRegionExtensionConfiguration");

// src/regionConfig/config.ts
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

// src/regionConfig/isFipsRegion.ts
const isFipsRegion = defineName((region) => typeof region === "string" && 
  (region.startsWith("fips-") || region.endsWith("-fips")), "isFipsRegion");

// src/regionConfig/getRealRegion.ts
const getRealRegion = defineName((region) => isFipsRegion(region) ? 
  ["fips-aws-global", "aws-fips"].includes(region) ? "us-east-1" 
  : region.replace(/fips-(dkr-|prod-)?|-fips/, "") : region, "getRealRegion");

// src/regionConfig/resolveRegionConfig.ts
const resolveRegionConfig = defineName((input) => {
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

0 && (module.exports = {
  getAwsRegionExtensionConfiguration,
  resolveAwsRegionExtensionConfiguration,
  REGION_ENV_NAME,
  REGION_INI_NAME,
  NODE_REGION_CONFIG_OPTIONS,
  NODE_REGION_CONFIG_FILE_OPTIONS,
  resolveRegionConfig
});
