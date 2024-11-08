const { defineProperty, getOwnPropertyDescriptor, getOwnPropertyNames } = Object;
const hasOwnProperty = Object.prototype.hasOwnProperty;

const defineName = (target, value) => defineProperty(target, "name", { value, configurable: true });

const exportModule = (target, all) => {
  for (const name in all) {
    defineProperty(target, name, { get: all[name], enumerable: true });
  }
};

const copyProperties = (to, from, except, desc) => {
  if (from && (typeof from === "object" || typeof from === "function")) {
    for (const key of getOwnPropertyNames(from)) {
      if (!hasOwnProperty.call(to, key) && key !== except) {
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

// Exported Functions
const src_exports = {};
exportModule(src_exports, {
  endpointMiddleware: () => endpointMiddleware,
  endpointMiddlewareOptions: () => endpointMiddlewareOptions,
  getEndpointFromInstructions: () => getEndpointFromInstructions,
  getEndpointPlugin: () => getEndpointPlugin,
  resolveEndpointConfig: () => resolveEndpointConfig,
  resolveParams: () => resolveParams,
  toEndpointV1: () => toEndpointV1,
});
module.exports = toCommonJS(src_exports);

// S3 Service Customization
const resolveParamsForS3 = defineName(async (endpointParams) => {
  const bucket = endpointParams?.Bucket || "";
  if (typeof endpointParams.Bucket === "string") {
    endpointParams.Bucket = bucket.replace(/#/g, encodeURIComponent("#")).replace(/\?/g, encodeURIComponent("?"));
  }
  if (isArnBucketName(bucket)) {
    if (endpointParams.ForcePathStyle === true) {
      throw new Error("Path-style addressing cannot be used with ARN buckets");
    }
  } else if (!isDnsCompatibleBucketName(bucket) || bucket.includes(".") && !String(endpointParams.Endpoint).startsWith("http:") || bucket.toLowerCase() !== bucket || bucket.length < 3) {
    endpointParams.ForcePathStyle = true;
  }
  if (endpointParams.DisableMultiRegionAccessPoints) {
    endpointParams.disableMultiRegionAccessPoints = true;
    endpointParams.DisableMRAP = true;
  }
  return endpointParams;
}, "resolveParamsForS3");

const DOMAIN_PATTERN = /^[a-z0-9][a-z0-9\.\-]{1,61}[a-z0-9]$/;
const IP_ADDRESS_PATTERN = /(\d+\.){3}\d+/;
const DOTS_PATTERN = /\.\./;

const isDnsCompatibleBucketName = defineName((bucketName) => {
  return DOMAIN_PATTERN.test(bucketName) && !IP_ADDRESS_PATTERN.test(bucketName) && !DOTS_PATTERN.test(bucketName);
}, "isDnsCompatibleBucketName");

const isArnBucketName = defineName((bucketName) => {
  const [arn, partition, service, , , bucket] = bucketName.split(":");
  const isArn = arn === "arn" && bucketName.split(":").length >= 6;
  const isValidArn = Boolean(isArn && partition && service && bucket);
  if (isArn && !isValidArn) {
    throw new Error(`Invalid ARN: ${bucketName} was an invalid ARN.`);
  }
  return isValidArn;
}, "isArnBucketName");

// Configuration Value Provider
const createConfigValueProvider = defineName((configKey, canonicalEndpointParamKey, config) => {
  const configProvider = defineName(async () => {
    const configValue = config[configKey] ?? config[canonicalEndpointParamKey];
    return typeof configValue === "function" ? configValue() : configValue;
  }, "configProvider");

  if (configKey === "credentialScope" || canonicalEndpointParamKey === "CredentialScope") {
    return async () => {
      const credentials = typeof config.credentials === "function" ? await config.credentials() : config.credentials;
      return credentials?.credentialScope ?? credentials?.CredentialScope;
    };
  }

  if (configKey === "accountId" || canonicalEndpointParamKey === "AccountId") {
    return async () => {
      const credentials = typeof config.credentials === "function" ? await config.credentials() : config.credentials;
      return credentials?.accountId ?? credentials?.AccountId;
    };
  }

  if (configKey === "endpoint" || canonicalEndpointParamKey === "endpoint") {
    return async () => {
      const endpoint = await configProvider();
      if (endpoint && typeof endpoint === "object") {
        if ("url" in endpoint) return endpoint.url.href;
        if ("hostname" in endpoint) {
          const { protocol, hostname, port, path } = endpoint;
          return `${protocol}//${hostname}${port ? ":" + port : ""}${path}`;
        }
      }
      return endpoint;
    };
  }
  return configProvider;
}, "createConfigValueProvider");

// Endpoint Utilities
const getEndpointFromInstructions = defineName(async (commandInput, instructionsSupplier, clientConfig, context) => {
  if (!clientConfig.endpoint) {
    let endpointFromConfig;
    if (clientConfig.serviceConfiguredEndpoint) {
      endpointFromConfig = await clientConfig.serviceConfiguredEndpoint();
    } else {
      endpointFromConfig = await import_getEndpointFromConfig(clientConfig.serviceId);
    }
    if (endpointFromConfig) {
      clientConfig.endpoint = () => Promise.resolve(toEndpointV1(endpointFromConfig));
    }
  }

  const endpointParams = await resolveParams(commandInput, instructionsSupplier, clientConfig);

  if (typeof clientConfig.endpointProvider !== "function") {
    throw new Error("config.endpointProvider is not set.");
  }

  const endpoint = clientConfig.endpointProvider(endpointParams, context);
  return endpoint;
}, "getEndpointFromInstructions");

const resolveParams = defineName(async (commandInput, instructionsSupplier, clientConfig) => {
  const endpointParams = {};
  const instructions = instructionsSupplier?.getEndpointParameterInstructions?.() || {};
  for (const [name, instruction] of Object.entries(instructions)) {
    switch (instruction.type) {
      case "staticContextParams":
        endpointParams[name] = instruction.value;
        break;
      case "contextParams":
        endpointParams[name] = commandInput[instruction.name];
        break;
      case "clientContextParams":
      case "builtInParams":
        endpointParams[name] = await createConfigValueProvider(instruction.name, name, clientConfig)();
        break;
      default:
        throw new Error("Unrecognized endpoint parameter instruction: " + JSON.stringify(instruction));
    }
  }
  if (Object.keys(instructions).length === 0) {
    Object.assign(endpointParams, clientConfig);
  }
  if (String(clientConfig.serviceId).toLowerCase() === "s3") {
    await resolveParamsForS3(endpointParams);
  }
  return endpointParams;
}, "resolveParams");

// Middleware and Plugin for Endpoint
const import_util_middleware = require("@smithy/util-middleware");

const endpointMiddleware = defineName(({ config, instructions }) => {
  return (next, context) => async (args) => {
    const endpoint = await getEndpointFromInstructions(
      args.input,
      { getEndpointParameterInstructions: () => instructions },
      { ...config },
      context
    );
    context.endpointV2 = endpoint;
    context.authSchemes = endpoint.properties?.authSchemes;
    const authScheme = context.authSchemes?.[0];
    if (authScheme) {
      context.signing_region = authScheme.signingRegion;
      context.signing_service = authScheme.signingName;
      const smithyContext = import_util_middleware.getSmithyContext(context);
      const httpAuthOption = smithyContext?.selectedHttpAuthScheme?.httpAuthOption;
      if (httpAuthOption) {
        httpAuthOption.signingProperties = Object.assign(
          httpAuthOption.signingProperties || {},
          {
            signing_region: authScheme.signingRegion,
            signingRegion: authScheme.signingRegion,
            signing_service: authScheme.signingName,
            signingName: authScheme.signingName,
            signingRegionSet: authScheme.signingRegionSet
          },
          authScheme.properties
        );
      }
    }
    return next({ ...args });
  };
}, "endpointMiddleware");

// Plugin for managing endpoints in client stacks
const import_middleware_serde = require("@smithy/middleware-serde");

const endpointMiddlewareOptions = {
  step: "serialize",
  tags: ["ENDPOINT_PARAMETERS", "ENDPOINT_V2", "ENDPOINT"],
  name: "endpointV2Middleware",
  override: true,
  relation: "before",
  toMiddleware: import_middleware_serde.serializerMiddlewareOption.name
};

const getEndpointPlugin = defineName((config, instructions) => ({
  applyToStack: (clientStack) => {
    clientStack.addRelativeTo(
      endpointMiddleware({ config, instructions }),
      endpointMiddlewareOptions
    );
  }
}), "getEndpointPlugin");

// Resolve Endpoint Configuration
const import_getEndpointFromConfig2 = require("./adaptors/getEndpointFromConfig");

const resolveEndpointConfig = defineName((input) => {
  const tls = input.tls ?? true;
  const { endpoint } = input;
  const customEndpointProvider = endpoint != null ? async () => toEndpointV1(await import_util_middleware.normalizeProvider(endpoint)()) : undefined;
  const isCustomEndpoint = !!endpoint;
  const resolvedConfig = {
    ...input,
    endpoint: customEndpointProvider,
    tls,
    isCustomEndpoint,
    useDualstackEndpoint: import_util_middleware.normalizeProvider(input.useDualstackEndpoint ?? false),
    useFipsEndpoint: import_util_middleware.normalizeProvider(input.useFipsEndpoint ?? false)
  };

  let configuredEndpointPromise = undefined;
  resolvedConfig.serviceConfiguredEndpoint = async () => {
    if (input.serviceId && !configuredEndpointPromise) {
      configuredEndpointPromise = import_getEndpointFromConfig2.getEndpointFromConfig(input.serviceId);
    }
    return configuredEndpointPromise;
  };
  return resolvedConfig;
}, "resolveEndpointConfig");
