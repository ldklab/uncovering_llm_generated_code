"use strict";

const { isValidHostLabel, isIpAddress, customEndpointFunctions } = require("@smithy/util-endpoints");

const exportFunctions = (target, functions) => {
  Object.keys(functions).forEach((name) => {
    Object.defineProperty(target, name, {
      get: functions[name],
      enumerable: true
    });
  });
};

const copyProperties = (to, from) => {
  Object.getOwnPropertyNames(from)
    .filter((key) => !Object.hasOwn(to, key))
    .forEach((key) => {
      const descriptor = Object.getOwnPropertyDescriptor(from, key);
      Object.defineProperty(to, key, { get: () => from[key], enumerable: descriptor?.enumerable });
    });
  return to;
};

const toCommonJS = (mod) => copyProperties(Object.defineProperty({}, "__esModule", { value: true }), mod);

// AWS Endpoint Utilities
const partitions = require("./partitions.json");

let selectedPartitionsInfo = partitions;
let selectedUserAgentPrefix = "";

const partition = (value) => {
  const { partitions } = selectedPartitionsInfo;
  for (const partition of partitions) {
    const { regions, outputs } = partition;
    if (regions[value]) {
      return { ...outputs, ...regions[value] };
    }
  }

  for (const partition of partitions) {
    const { regionRegex, outputs } = partition;
    if (new RegExp(regionRegex).test(value)) {
      return { ...outputs };
    }
  }

  const defaultPartition = partitions.find((p) => p.id === "aws");
  if (!defaultPartition) {
    throw new Error("Unknown region and default partition missing.");
  }
  return { ...defaultPartition.outputs };
};

const parseArn = (value) => {
  const segments = value.split(":");
  if (segments.length < 6) return null;
  const [arn, partition, service, region, accountId, ...resourcePath] = segments;
  if (arn !== "arn" || !partition || !service || !resourcePath.join(":")) return null;
  return {
    partition,
    service,
    region,
    accountId,
    resourceId: resourcePath.join(":").split("/")
  };
};

const isVirtualHostableS3Bucket = (value, allowSubDomains = false) => {
  if (allowSubDomains) {
    return value.split('.').every(label => isVirtualHostableS3Bucket(label));
  }

  if (!isValidHostLabel(value) || value.length < 3 || value.length > 63 || value !== value.toLowerCase() || isIpAddress(value)) {
    return false;
  }
  return true;
};

const setPartitionInfo = (partitionsInfo, userAgentPrefix = "") => {
  selectedPartitionsInfo = partitionsInfo;
  selectedUserAgentPrefix = userAgentPrefix;
};

const useDefaultPartitionInfo = () => setPartitionInfo(partitions, "");

const getUserAgentPrefix = () => selectedUserAgentPrefix;

// Exporting utilities
const awsEndpointFunctions = {
  isVirtualHostableS3Bucket,
  parseArn,
  partition
};

customEndpointFunctions.aws = awsEndpointFunctions;

// Export Module
module.exports = toCommonJS({
  awsEndpointFunctions,
  partition,
  setPartitionInfo,
  useDefaultPartitionInfo,
  getUserAgentPrefix
});
