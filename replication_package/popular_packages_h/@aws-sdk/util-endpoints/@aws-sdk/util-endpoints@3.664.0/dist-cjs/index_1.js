"use strict";

const { objectHasOwn, defineProp, getOwnPropNames, getOwnPropDesc, copyProperties, toCommonJS } = require('object-utils');
const importUtilEndpoints = require("@smithy/util-endpoints");

const exportFunctions = (target, all) => {
  for (const name in all) {
    defineProp(target, name, { get: all[name], enumerable: true });
  }
};

let partitionInfo = require('./partitions.json');
let userAgentPrefix = "";

// Define and export various utilities
const { 
  ConditionObject, 
  DeprecatedObject, 
  EndpointError, 
  EndpointObject, 
  EndpointObjectHeaders, 
  EndpointObjectProperties, 
  EndpointParams, 
  EndpointResolverOptions, 
  EndpointRuleObject, 
  ErrorRuleObject, 
  EvaluateOptions, 
  Expression, 
  FunctionArgv, 
  FunctionObject, 
  FunctionReturn, 
  ParameterObject, 
  ReferenceObject, 
  ReferenceRecord, 
  RuleSetObject, 
  RuleSetRules, 
  TreeRuleObject, 
  isIpAddress,
  resolveEndpoint 
} = importUtilEndpoints;

const srcExports = {};
exportFunctions(srcExports, {
  ConditionObject,
  DeprecatedObject,
  EndpointError,
  EndpointObject,
  EndpointObjectHeaders,
  EndpointObjectProperties,
  EndpointParams,
  EndpointResolverOptions,
  EndpointRuleObject,
  ErrorRuleObject,
  EvaluateOptions,
  Expression,
  FunctionArgv,
  FunctionObject,
  FunctionReturn,
  ParameterObject,
  ReferenceObject,
  ReferenceRecord,
  RuleSetObject,
  RuleSetRules,
  TreeRuleObject,
  awsEndpointFunctions,
  getUserAgentPrefix,
  isIpAddress,
  partition,
  resolveEndpoint,
  setPartitionInfo,
  useDefaultPartitionInfo
});

// AWS functions
const isVirtualHostableS3Bucket = (value, allowSubDomains = false) => {
  if (allowSubDomains) {
    return value.split(".").every(isVirtualHostableS3Bucket);
  }
  return importUtilEndpoints.isValidHostLabel(value) && value.length >= 3 && value.length <= 63 && value.toLowerCase() === value && !importUtilEndpoints.isIpAddress(value);
};

const parseArn = (arnValue) => {
  const segments = arnValue.split(":");
  if (segments.length < 6) return null;
  const [arn, partition, service, region, accountId, ...resourcePath] = segments;
  if (arn !== "arn" || !partition || !service || !resourcePath.join(":")) return null;
  const resourceId = resourcePath.flatMap(r => r.split("/"));
  return { partition, service, region, accountId, resourceId };
};

const partition = (regionValue) => {
  const { partitions } = partitionInfo;
  for (const partition of partitions) {
    const { regions, outputs } = partition;
    if (regions[regionValue]) {
      return { ...outputs, ...regions[regionValue] };
    }
  }
  for (const partition of partitions) {
    const { regionRegex, outputs } = partition;
    if (new RegExp(regionRegex).test(regionValue)) {
      return { ...outputs };
    }
  }
  const defaultPartition = partitions.find(p => p.id === "aws");
  if (!defaultPartition) throw new Error("Region not found in partitions, and no default 'aws' partition exists.");
  return { ...defaultPartition.outputs };
};

const setPartitionInfo = (newPartitionInfo, userPrefix = "") => {
  partitionInfo = newPartitionInfo;
  userAgentPrefix = userPrefix;
};

const useDefaultPartitionInfo = () => setPartitionInfo(require('./partitions.json'), "");

const getUserAgentPrefix = () => userAgentPrefix;

const awsEndpointFunctions = {
  isVirtualHostableS3Bucket,
  parseArn,
  partition
};

importUtilEndpoints.customEndpointFunctions.aws = awsEndpointFunctions;

module.exports = toCommonJS(srcExports);
