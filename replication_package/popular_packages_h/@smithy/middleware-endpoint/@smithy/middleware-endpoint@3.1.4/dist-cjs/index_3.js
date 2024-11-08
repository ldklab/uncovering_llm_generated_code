const defineProperty = Object.defineProperty;
const getOwnPropDesc = Object.getOwnPropertyDescriptor;
const getOwnPropNames = Object.getOwnPropertyNames;
const hasOwnProp = Object.prototype.hasOwnProperty;

const defineName = (target, value) => defineProperty(target, "name", { value, configurable: true });

const exportModule = (target, definitions) => {
  for (const name in definitions) {
    defineProperty(target, name, { get: definitions[name], enumerable: true });
  }
};

const copyProps = (target, source, exclude, desc) => {
  if (source && (typeof source === "object" || typeof source === "function")) {
    for (let key of getOwnPropNames(source)) {
      if (!hasOwnProp.call(target, key) && key !== exclude) {
        defineProperty(target, key, { get: () => source[key], enumerable: !(desc = getOwnPropDesc(source, key)) || desc.enumerable });
      }
    }
  }
  return target;
};

const toCommonJS = (mod) => copyProps(defineProperty({}, "__esModule", { value: true }), mod);

// src/index.ts
const srcExports = {};
exportModule(srcExports, {
  endpointMiddleware: () => endpointMiddleware,
  endpointMiddlewareOptions: () => endpointMiddlewareOptions,
  getEndpointFromInstructions: () => getEndpointFromInstructions,
  getEndpointPlugin: () => getEndpointPlugin,
  resolveEndpointConfig: () => resolveEndpointConfig,
  resolveParams: () => resolveParams,
  toEndpointV1: () => toEndpointV1
});
module.exports = toCommonJS(srcExports);

// src/service-customizations/s3.ts
const resolveParamsForS3 = defineName(async (endpointParams) => {
  const bucket = endpointParams?.Bucket || "";
  if (typeof endpointParams.Bucket === "string") {
    endpointParams.Bucket = bucket.replace(/#/g, encodeURIComponent("#")).replace(/\?/g, encodeURIComponent("?"));
  }
  if (isArnBucketName(bucket)) {
    if (endpointParams.ForcePathStyle) {
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

// src/adaptors/createConfigValueProvider.ts
const createConfigValueProvider = defineName((configKey, canonicalEndpointParamKey, config) => {
  const configProvider = defineName(async () => {
    const configValue = config[configKey] ?? config[canonicalEndpointParamKey];
    if (typeof configValue === "function") {
      return configValue();
    }
    return configValue;
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
        if ("url" in endpoint) {
          return endpoint.url.href;
        }
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

// src/adaptors/getEndpointFromInstructions.ts
const { getEndpointFromConfig } = require("./adaptors/getEndpointFromConfig");

// src/adaptors/toEndpointV1.ts
const { parseUrl } = require("@smithy/url-parser");
const toEndpointV1 = defineName((endpoint) => {
  if (typeof endpoint === "object") {
    if ("url" in endpoint) {
      return parseUrl(endpoint.url);
    }
    return endpoint;
  }
  return parseUrl(endpoint);
}, "toEndpointV1");

// src/adaptors/getEndpointFromInstructions.ts
const getEndpointFromInstructions = defineName(async (commandInput, instructionsSupplier, clientConfig, context) => {
  if (!clientConfig.endpoint) {
    let endpointFromConfig;
    if (clientConfig.serviceConfiguredEndpoint) {
      endpointFromConfig = await clientConfig.serviceConfiguredEndpoint();
    } else {
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

// src/endpointMiddleware.ts
const { getSmithyContext } = require("@smithy/util-middleware");
const endpointMiddleware = defineName(({ config, instructions }) => {
  return (next, context) => async (args) => {
    const endpoint = await getEndpointFromInstructions(
      args.input,
      {
        getEndpointParameterInstructions() {
          return instructions;
        }
      },
      { ...config },
      context
    );
    context.endpointV2 = endpoint;
    context.authSchemes = endpoint.properties?.authSchemes;
    const authScheme = context.authSchemes?.[0];
    if (authScheme) {
      context["signing_region"] = authScheme.signingRegion;
      context["signing_service"] = authScheme.signingName;
      const smithyContext = getSmithyContext(context);
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

// src/getEndpointPlugin.ts
const { serializerMiddlewareOption } = require("@smithy/middleware-serde");
const endpointMiddlewareOptions = {
  step: "serialize",
  tags: ["ENDPOINT_PARAMETERS", "ENDPOINT_V2", "ENDPOINT"],
  name: "endpointV2Middleware",
  override: true,
  relation: "before",
  toMiddleware: serializerMiddlewareOption.name
};
const getEndpointPlugin = defineName((config, instructions) => ({
  applyToStack: (clientStack) => {
    clientStack.addRelativeTo(
      endpointMiddleware({ config, instructions }),
      endpointMiddlewareOptions
    );
  }
}), "getEndpointPlugin");

// src/resolveEndpointConfig.ts
const { normalizeProvider } = require("@smithy/util-middleware");
const resolveEndpointConfig = defineName((input) => {
  const tls = input.tls ?? true;
  const { endpoint } = input;
  const customEndpointProvider = endpoint ? async () => toEndpointV1(await normalizeProvider(endpoint)()) : undefined;
  const isCustomEndpoint = !!endpoint;
  const resolvedConfig = {
    ...input,
    endpoint: customEndpointProvider,
    tls,
    isCustomEndpoint,
    useDualstackEndpoint: normalizeProvider(input.useDualstackEndpoint ?? false),
    useFipsEndpoint: normalizeProvider(input.useFipsEndpoint ?? false)
  };
  let configuredEndpointPromise = undefined;
  resolvedConfig.serviceConfiguredEndpoint = async () => {
    if (input.serviceId && !configuredEndpointPromise) {
      configuredEndpointPromise = getEndpointFromConfig(input.serviceId);
    }
    return configuredEndpointPromise;
  };
  return resolvedConfig;
}, "resolveEndpointConfig");

// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getEndpointFromInstructions,
  resolveParams,
  toEndpointV1,
  endpointMiddleware,
  endpointMiddlewareOptions,
  getEndpointPlugin,
  resolveEndpointConfig
});
