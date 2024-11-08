// Utility functions for managing object properties and exports
const defineProperty = Object.defineProperty;
const getPropertyDescriptor = Object.getOwnPropertyDescriptor;
const getOwnPropertyNames = Object.getOwnPropertyNames;
const hasOwnProperty = Object.prototype.hasOwnProperty;

// Function to name a target entity
const nameFunction = (target, value) => defineProperty(target, "name", { value, configurable: true });

// Export utility
const exportModule = (target, source) => {
  Object.keys(source).forEach(name => {
    defineProperty(target, name, { get: source[name], enumerable: true });
  });
};

// Copy properties between modules
const copyProperties = (to, from, except) => {
  if (from && (typeof from === "object" || typeof from === "function")) {
    getOwnPropertyNames(from).forEach(key => {
      if (!hasOwnProperty.call(to, key) && key !== except) {
        defineProperty(to, key, {
          get: () => from[key],
          enumerable: !getPropertyDescriptor(from, key) || getPropertyDescriptor(from, key).enumerable
        });
      }
    });
  }
  return to;
};

// Convert module to CommonJS format
const toCommonJS = (mod) => copyProperties(defineProperty({}, "__esModule", { value: true }), mod);

// Exportable module structure
const src_exports = {};
exportModule(src_exports, {
  endpointMiddleware: () => endpointMiddleware,
  endpointMiddlewareOptions: () => endpointMiddlewareOptions,
  getEndpointFromInstructions: () => getEndpointFromInstructions,
  getEndpointPlugin: () => getEndpointPlugin,
  resolveEndpointConfig: () => resolveEndpointConfig,
  resolveParams: () => resolveParams,
  toEndpointV1: () => toEndpointV1
});
module.exports = toCommonJS(src_exports);

// S3-specific configurations and utility functions
const resolveParamsForS3 = nameFunction(async (endpointParams) => {
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

// Patterns for DNS compatibility checks
const DOMAIN_PATTERN = /^[a-z0-9][a-z0-9\.\-]{1,61}[a-z0-9]$/;
const IP_ADDRESS_PATTERN = /(\d+\.){3}\d+/;
const DOTS_PATTERN = /\.\./;

// Checks if a bucket name is DNS compatible
const isDnsCompatibleBucketName = nameFunction((bucketName) => {
  return DOMAIN_PATTERN.test(bucketName) && !IP_ADDRESS_PATTERN.test(bucketName) && !DOTS_PATTERN.test(bucketName);
}, "isDnsCompatibleBucketName");

// Checks if the bucket name is in ARN format
const isArnBucketName = nameFunction((bucketName) => {
  const [arn, partition, service, , , bucket] = bucketName.split(":");
  const isArn = arn === "arn" && bucketName.split(":").length >= 6;
  const isValidArn = Boolean(isArn && partition && service && bucket);
  if (isArn && !isValidArn) {
    throw new Error(`Invalid ARN: ${bucketName} was an invalid ARN.`);
  }
  return isValidArn;
}, "isArnBucketName");

// Adapter to create dynamic configuration value providers
const createConfigValueProvider = nameFunction((configKey, canonicalEndpointParamKey, config) => {
  const configProvider = nameFunction(async () => {
    const configValue = config[configKey] ?? config[canonicalEndpointParamKey];
    return typeof configValue === "function" ? configValue() : configValue;
  }, "configProvider");

  // Special handling for certain keys
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

// Adapter function to convert endpoints to version 1
const toEndpointV1 = nameFunction((endpoint) => {
  const { parseUrl } = require("@smithy/url-parser");
  if (typeof endpoint === "object") {
    if ("url" in endpoint) return parseUrl(endpoint.url);
    return endpoint;
  }
  return parseUrl(endpoint);
}, "toEndpointV1");

// Adapter function to acquire endpoint instructions
const getEndpointFromInstructions = nameFunction(async (commandInput, instructionsSupplier, clientConfig, context) => {
  if (!clientConfig.endpoint) {
    let endpointFromConfig;
    if (clientConfig.serviceConfiguredEndpoint) {
      endpointFromConfig = await clientConfig.serviceConfiguredEndpoint();
    } else {
      const { getEndpointFromConfig } = require("./adaptors/getEndpointFromConfig");
      endpointFromConfig = await getEndpointFromConfig(clientConfig.serviceId);
    }
    if (endpointFromConfig) {
      clientConfig.endpoint = () => Promise.resolve(toEndpointV1(endpointFromConfig));
    }
  }
  const endpointParams = await resolveParams(commandInput, instructionsSupplier, clientConfig);
  if (typeof clientConfig.endpointProvider !== "function") {
    throw new Error("config.endpointProvider is not set.");
  }
  return clientConfig.endpointProvider(endpointParams, context);
}, "getEndpointFromInstructions");

// Resolves parameter instructions
const resolveParams = nameFunction(async (commandInput, instructionsSupplier, clientConfig) => {
  const instructions = instructionsSupplier?.getEndpointParameterInstructions?.() || {};
  const endpointParams = {};
  
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

// Middleware for endpoint handling
const endpointMiddleware = nameFunction(({ config, instructions }) => {
  return (next, context) => async (args) => {
    const endpoint = await getEndpointFromInstructions(args.input, {
        getEndpointParameterInstructions() {
          return instructions;
        }
      }, 
      { ...config }, 
      context
    );
    context.endpointV2 = endpoint;
    const authScheme = context.authSchemes?.[0];
    if (authScheme) {
      context.signing_region = authScheme.signingRegion;
      context.signing_service = authScheme.signingName;
      const smithyContext = require("@smithy/util-middleware").getSmithyContext(context);
      const httpAuthOption = smithyContext?.selectedHttpAuthScheme?.httpAuthOption;
      if (httpAuthOption) {
        httpAuthOption.signingProperties = {
          ...httpAuthOption.signingProperties,
          signing_region: authScheme.signingRegion,
          signingRegion: authScheme.signingRegion,
          signing_service: authScheme.signingName,
          signingName: authScheme.signingName,
          signingRegionSet: authScheme.signingRegionSet,
          ...authScheme.properties
        };
      }
    }
    return next({ ...args });
  };
}, "endpointMiddleware");

// Options for the endpoint middleware
const endpointMiddlewareOptions = {
  step: "serialize",
  tags: ["ENDPOINT_PARAMETERS", "ENDPOINT_V2", "ENDPOINT"],
  name: "endpointV2Middleware",
  override: true,
  relation: "before",
  toMiddleware: require("@smithy/middleware-serde").serializerMiddlewareOption.name
};

// Plugin to integrate endpoint logic
const getEndpointPlugin = nameFunction((config, instructions) => ({
  applyToStack: (clientStack) => {
    clientStack.addRelativeTo(endpointMiddleware({ config, instructions }), endpointMiddlewareOptions);
  }
}), "getEndpointPlugin");

// Resolve endpoint configuration
const resolveEndpointConfig = nameFunction((input) => {
  const tls = input.tls ?? true;
  const { endpoint } = input;
  const customEndpointProvider = endpoint ? async () => toEndpointV1(await require("@smithy/util-middleware").normalizeProvider(endpoint)()) : undefined;
  const isCustomEndpoint = !!endpoint;

  const resolvedConfig = {
    ...input,
    endpoint: customEndpointProvider,
    tls,
    isCustomEndpoint,
    useDualstackEndpoint: require("@smithy/util-middleware").normalizeProvider(input.useDualstackEndpoint ?? false),
    useFipsEndpoint: require("@smithy/util-middleware").normalizeProvider(input.useFipsEndpoint ?? false)
  };

  let configuredEndpointPromise;
  resolvedConfig.serviceConfiguredEndpoint = async () => {
    if (input.serviceId && !configuredEndpointPromise) {
      configuredEndpointPromise = require("./adaptors/getEndpointFromConfig").getEndpointFromConfig(input.serviceId);
    }
    return configuredEndpointPromise;
  };

  return resolvedConfig;
}, "resolveEndpointConfig");

// Annotate the CommonJS export names for ESM import in node
0 && (module.exports = {
  getEndpointFromInstructions,
  resolveParams,
  toEndpointV1,
  endpointMiddleware,
  endpointMiddlewareOptions,
  getEndpointPlugin,
  resolveEndpointConfig
});
