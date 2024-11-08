"use strict";

const { hasOwnProperty, getOwnPropertyNames, getOwnPropertyDescriptor, defineProperty } = Object;

function __name(target, value) {
  return defineProperty(target, "name", { value, configurable: true });
}

function __export(target, all) {
  for (const name in all)
    defineProperty(target, name, { get: all[name], enumerable: true });
}

function __copyProps(to, from, except, desc) {
  if (from && (typeof from === "object" || typeof from === "function")) {
    for (const key of getOwnPropertyNames(from))
      if (!hasOwnProperty.call(to, key) && key !== except)
        defineProperty(to, key, {
          get: () => from[key],
          enumerable: !(desc = getOwnPropertyDescriptor(from, key)) || desc.enumerable,
        });
  }
  return to;
}

function __toCommonJS(mod) {
  return __copyProps(defineProperty({}, "__esModule", { value: true }), mod);
}

const src_exports = {};
__export(src_exports, {
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
module.exports = __toCommonJS(src_exports);

const import_util_endpoints = require("@smithy/util-endpoints");

const isVirtualHostableS3Bucket = __name((value, allowSubDomains = false) => {
  if (allowSubDomains) {
    return value.split('.').every(label => isVirtualHostableS3Bucket(label));
  }
  return import_util_endpoints.isValidHostLabel(value) &&
    value.length >= 3 &&
    value.length <= 63 &&
    value === value.toLowerCase() &&
    !import_util_endpoints.isIpAddress(value);
}, "isVirtualHostableS3Bucket");

const ARN_DELIMITER = ":";
const RESOURCE_DELIMITER = "/";
const parseArn = __name(value => {
  const segments = value.split(ARN_DELIMITER);
  if (segments.length < 6) return null;
  const [arn, partition, service, region, accountId, ...resourcePath] = segments;
  if (arn !== "arn" || partition === "" || service === "" || resourcePath.join(ARN_DELIMITER) === "")
    return null;
  return {
    partition,
    service,
    region,
    accountId,
    resourceId: resourcePath.map(resource => resource.split(RESOURCE_DELIMITER)).flat()
  };
}, "parseArn");

const partitions_default = {
  partitions: [
    {
      id: "aws",
      outputs: { dnsSuffix: "amazonaws.com", dualStackDnsSuffix: "api.aws", implicitGlobalRegion: "us-east-1", name: "aws", supportsDualStack: true, supportsFIPS: true },
      regionRegex: "^(us|eu|ap|sa|ca|me|af|il|mx)\\-\\w+\\-\\d+$",
      regions: {
        "af-south-1": { description: "Africa (Cape Town)" },
        "ap-east-1": { description: "Asia Pacific (Hong Kong)" },
        "ap-northeast-1": { description: "Asia Pacific (Tokyo)" },
        "ap-northeast-2": { description: "Asia Pacific (Seoul)" },
        "ap-northeast-3": { description: "Asia Pacific (Osaka)" },
        "ap-south-1": { description: "Asia Pacific (Mumbai)" },
        "ap-south-2": { description: "Asia Pacific (Hyderabad)" },
        "ap-southeast-1": { description: "Asia Pacific (Singapore)" },
        "ap-southeast-2": { description: "Asia Pacific (Sydney)" },
        "ap-southeast-3": { description: "Asia Pacific (Jakarta)" },
        "ap-southeast-4": { description: "Asia Pacific (Melbourne)" },
        "ap-southeast-5": { description: "Asia Pacific (Malaysia)" },
        "aws-global": { description: "AWS Standard global region" },
        "ca-central-1": { description: "Canada (Central)" },
        "ca-west-1": { description: "Canada West (Calgary)" },
        "eu-central-1": { description: "Europe (Frankfurt)" },
        "eu-central-2": { description: "Europe (Zurich)" },
        "eu-north-1": { description: "Europe (Stockholm)" },
        "eu-south-1": { description: "Europe (Milan)" },
        "eu-south-2": { description: "Europe (Spain)" },
        "eu-west-1": { description: "Europe (Ireland)" },
        "eu-west-2": { description: "Europe (London)" },
        "eu-west-3": { description: "Europe (Paris)" },
        "il-central-1": { description: "Israel (Tel Aviv)" },
        "me-central-1": { description: "Middle East (UAE)" },
        "me-south-1": { description: "Middle East (Bahrain)" },
        "sa-east-1": { description: "South America (Sao Paulo)" },
        "us-east-1": { description: "US East (N. Virginia)" },
        "us-east-2": { description: "US East (Ohio)" },
        "us-west-1": { description: "US West (N. California)" },
        "us-west-2": { description: "US West (Oregon)" }
      }
    },
    {
      id: "aws-cn",
      outputs: { dnsSuffix: "amazonaws.com.cn", dualStackDnsSuffix: "api.amazonwebservices.com.cn", implicitGlobalRegion: "cn-northwest-1", name: "aws-cn", supportsDualStack: true, supportsFIPS: true },
      regionRegex: "^cn\\-\\w+\\-\\d+$",
      regions: {
        "aws-cn-global": { description: "AWS China global region" },
        "cn-north-1": { description: "China (Beijing)" },
        "cn-northwest-1": { description: "China (Ningxia)" }
      }
    },
    {
      id: "aws-us-gov",
      outputs: { dnsSuffix: "amazonaws.com", dualStackDnsSuffix: "api.aws", implicitGlobalRegion: "us-gov-west-1", name: "aws-us-gov", supportsDualStack: true, supportsFIPS: true },
      regionRegex: "^us\\-gov\\-\\w+\\-\\d+$",
      regions: {
        "aws-us-gov-global": { description: "AWS GovCloud (US) global region" },
        "us-gov-east-1": { description: "AWS GovCloud (US-East)" },
        "us-gov-west-1": { description: "AWS GovCloud (US-West)" }
      }
    },
    {
      id: "aws-iso",
      outputs: { dnsSuffix: "c2s.ic.gov", dualStackDnsSuffix: "c2s.ic.gov", implicitGlobalRegion: "us-iso-east-1", name: "aws-iso", supportsDualStack: false, supportsFIPS: true },
      regionRegex: "^us\\-iso\\-\\w+\\-\\d+$",
      regions: {
        "aws-iso-global": { description: "AWS ISO (US) global region" },
        "us-iso-east-1": { description: "US ISO East" },
        "us-iso-west-1": { description: "US ISO WEST" }
      }
    },
    {
      id: "aws-iso-b",
      outputs: { dnsSuffix: "sc2s.sgov.gov", dualStackDnsSuffix: "sc2s.sgov.gov", implicitGlobalRegion: "us-isob-east-1", name: "aws-iso-b", supportsDualStack: false, supportsFIPS: true },
      regionRegex: "^us\\-isob\\-\\w+\\-\\d+$",
      regions: {
        "aws-iso-b-global": { description: "AWS ISOB (US) global region" },
        "us-isob-east-1": { description: "US ISOB East (Ohio)" }
      }
    },
    {
      id: "aws-iso-e",
      outputs: { dnsSuffix: "cloud.adc-e.uk", dualStackDnsSuffix: "cloud.adc-e.uk", implicitGlobalRegion: "eu-isoe-west-1", name: "aws-iso-e", supportsDualStack: false, supportsFIPS: true },
      regionRegex: "^eu\\-isoe\\-\\w+\\-\\d+$",
      regions: {
        "eu-isoe-west-1": { description: "EU ISOE West" }
      }
    },
    {
      id: "aws-iso-f",
      outputs: { dnsSuffix: "csp.hci.ic.gov", dualStackDnsSuffix: "csp.hci.ic.gov", implicitGlobalRegion: "us-isof-south-1", name: "aws-iso-f", supportsDualStack: false, supportsFIPS: true },
      regionRegex: "^us\\-isof\\-\\w+\\-\\d+$",
      regions: {}
    }
  ],
  version: "1.1"
};

let selectedPartitionsInfo = partitions_default;
let selectedUserAgentPrefix = "";

const partition = __name(value => {
  for (const { outputs, regions, regionRegex } of selectedPartitionsInfo.partitions) {
    if (regions[value]) {
      return { ...outputs, ...regions[value] };
    }
    if (new RegExp(regionRegex).test(value)) {
      return { ...outputs };
    }
  }
  const awsPartition = selectedPartitionsInfo.partitions.find(p => p.id === "aws");
  if (!awsPartition) {
    throw new Error("Provided region was not found in the partition array or regex, and default partition with id 'aws' doesn't exist.");
  }
  return { ...awsPartition.outputs };
}, "partition");

const setPartitionInfo = __name((partitionsInfo, userAgentPrefix = "") => {
  selectedPartitionsInfo = partitionsInfo;
  selectedUserAgentPrefix = userAgentPrefix;
}, "setPartitionInfo");

const useDefaultPartitionInfo = __name(() => {
  setPartitionInfo(partitions_default, "");
}, "useDefaultPartitionInfo");

const getUserAgentPrefix = __name(() => selectedUserAgentPrefix, "getUserAgentPrefix");

const awsEndpointFunctions = { isVirtualHostableS3Bucket, parseArn, partition };
import_util_endpoints.customEndpointFunctions.aws = awsEndpointFunctions;
