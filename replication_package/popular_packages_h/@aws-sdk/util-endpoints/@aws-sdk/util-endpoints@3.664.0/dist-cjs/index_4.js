"use strict";

const { getOwnPropertyNames, getOwnPropertyDescriptor, defineProperty } = Object;
const { hasOwnProperty } = Object.prototype;

function defineName(target, value) {
  defineProperty(target, "name", { value, configurable: true });
}

function exportModule(target, all) {
  for (const name in all) {
    defineProperty(target, name, { get: all[name], enumerable: true });
  }
}

function copyProperties(to, from, except, desc) {
  if (from && (typeof from === "object" || typeof from === "function")) {
    for (const key of getOwnPropertyNames(from)) {
      if (!hasOwnProperty.call(to, key) && key !== except) {
        defineProperty(to, key, {
          get: () => from[key],
          enumerable: !(desc = getOwnPropertyDescriptor(from, key)) || desc.enumerable,
        });
      }
    }
  }
  return to;
}

function toCommonJS(mod) {
  return copyProperties(defineProperty({}, "__esModule", { value: true }), mod);
}

// src/index.ts
const src_exports = {};
exportModule(src_exports, {
  ConditionObject: () => import_util_endpoints.ConditionObject,
  DeprecatedObject: () => import_util_endpoints.DeprecatedObject,
  EndpointError: () => import_util_endpoints.EndpointError,
  EndpointObject: () => import_util_endpoints.EndpointObject,
  EndpointObjectHeaders: () => import_util_endpoints.EndpointObjectHeaders,
  EndpointObjectProperties: () => import_util_endpoints.EndpointObjectProperties,
  EndpointParams: () => import_util_endpoints.EndpointParams,
  EndpointResolverOptions: () => import_util_endpoints.EndpointResolverOptions,
  EndpointRuleObject: () => import_util_endpoints.EndpointRuleObject,
  ErrorRuleObject: () => import_util_endpoints.ErrorRuleObject,
  EvaluateOptions: () => import_util_endpoints.EvaluateOptions,
  Expression: () => import_util_endpoints.Expression,
  FunctionArgv: () => import_util_endpoints.FunctionArgv,
  FunctionObject: () => import_util_endpoints.FunctionObject,
  FunctionReturn: () => import_util_endpoints.FunctionReturn,
  ParameterObject: () => import_util_endpoints.ParameterObject,
  ReferenceObject: () => import_util_endpoints.ReferenceObject,
  ReferenceRecord: () => import_util_endpoints.ReferenceRecord,
  RuleSetObject: () => import_util_endpoints.RuleSetObject,
  RuleSetRules: () => import_util_endpoints.RuleSetRules,
  TreeRuleObject: () => import_util_endpoints.TreeRuleObject,
  awsEndpointFunctions: () => awsEndpointFunctions,
  getUserAgentPrefix: () => getUserAgentPrefix,
  isIpAddress: () => import_util_endpoints.isIpAddress,
  partition: () => partition,
  resolveEndpoint: () => import_util_endpoints.resolveEndpoint,
  setPartitionInfo: () => setPartitionInfo,
  useDefaultPartitionInfo: () => useDefaultPartitionInfo
});
module.exports = toCommonJS(src_exports);

// src/aws.ts

// src/lib/aws/isVirtualHostableS3Bucket.ts

// src/lib/isIpAddress.ts
const import_util_endpoints = require("@smithy/util-endpoints");

// src/lib/aws/isVirtualHostableS3Bucket.ts
const isVirtualHostableS3Bucket = defineName((value, allowSubDomains = false) => {
  if (allowSubDomains) {
    for (const label of value.split(".")) {
      if (!isVirtualHostableS3Bucket(label)) {
        return false;
      }
    }
    return true;
  }
  if (!import_util_endpoints.isValidHostLabel(value)) {
    return false;
  }

  if (value.length < 3 || value.length > 63) {
    return false;
  }

  if (value !== value.toLowerCase()) {
    return false;
  }

  if (import_util_endpoints.isIpAddress(value)) {
    return false;
  }
  
  return true;
}, "isVirtualHostableS3Bucket");

// src/lib/aws/parseArn.ts
const ARN_DELIMITER = ":";
const RESOURCE_DELIMITER = "/";
const parseArn = defineName((value) => {
  const segments = value.split(ARN_DELIMITER);
  if (segments.length < 6) return null;
  
  const [arn, partition, service, region, accountId, ...resourcePath] = segments;
  if (arn !== "arn" || partition === "" || service === "" || resourcePath.join(ARN_DELIMITER) === "") return null;
  
  const resourceId = resourcePath.map((resource) => resource.split(RESOURCE_DELIMITER)).flat();
  return { partition, service, region, accountId, resourceId };
}, "parseArn");

// src/lib/aws/partitions.json
const partitions_default = {
  partitions: [
    {
      id: "aws",
      outputs: {
        dnsSuffix: "amazonaws.com",
        dualStackDnsSuffix: "api.aws",
        implicitGlobalRegion: "us-east-1",
        name: "aws",
        supportsDualStack: true,
        supportsFIPS: true
      },
      regionRegex: "^(us|eu|ap|sa|ca|me|af|il|mx)\\-\\w+\\-\\d+$",
      regions: {
        "af-south-1": { description: "Africa (Cape Town)" },
        "ap-east-1": { description: "Asia Pacific (Hong Kong)" },
        // Other regions are omitted for brevity
      }
    },
    // Other partitions like "aws-cn", "aws-us-gov" are omitted for brevity
  ],
  version: "1.1"
};

// src/lib/aws/partition.ts
let selectedPartitionsInfo = partitions_default;
let selectedUserAgentPrefix = "";

const partition = defineName((value) => {
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
  const DEFAULT_PARTITION = partitions.find(p => p.id === "aws");
  if (!DEFAULT_PARTITION) {
    throw new Error("Default partition 'aws' not found.");
  }
  return { ...DEFAULT_PARTITION.outputs };
}, "partition");

const setPartitionInfo = defineName((partitionsInfo, userAgentPrefix = "") => {
  selectedPartitionsInfo = partitionsInfo;
  selectedUserAgentPrefix = userAgentPrefix;
}, "setPartitionInfo");

const useDefaultPartitionInfo = defineName(() => {
  setPartitionInfo(partitions_default, "");
}, "useDefaultPartitionInfo");

const getUserAgentPrefix = defineName(() => selectedUserAgentPrefix, "getUserAgentPrefix");

// src/aws.ts
const awsEndpointFunctions = {
  isVirtualHostableS3Bucket,
  parseArn,
  partition
};
import_util_endpoints.customEndpointFunctions.aws = awsEndpointFunctions;

// src/resolveEndpoint.ts

// src/types/EndpointError.ts

// src/types/EndpointRuleObject.ts

// src/types/ErrorRuleObject.ts

// src/types/RuleSetObject.ts

// src/types/TreeRuleObject.ts

// src/types/shared.ts

0 && (module.exports = {
  awsEndpointFunctions,
  partition,
  setPartitionInfo,
  useDefaultPartitionInfo,
  getUserAgentPrefix,
  isIpAddress,
  resolveEndpoint,
  EndpointError
});
