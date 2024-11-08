"use strict";

// Utility functions for property management
const defineProperty = Object.defineProperty;
const getPropertyDescriptor = Object.getOwnPropertyDescriptor;
const getPropertyNames = Object.getOwnPropertyNames;
const hasOwnProperty = Object.prototype.hasOwnProperty;

// Function to set function name metadata
const setName = (target, value) => defineProperty(target, "name", { value, configurable: true });

// Function to export multiple properties
const exportAll = (target, all) => {
  for (let name in all)
    defineProperty(target, name, { get: all[name], enumerable: true });
};

// Function to copy properties between objects
const copyProperties = (to, from, except, descriptor) => {
  if (from && (typeof from === "object" || typeof from === "function")) {
    for (let key of getPropertyNames(from))
      if (!hasOwnProperty.call(to, key) && key !== except)
        defineProperty(to, key, { get: () => from[key], enumerable: !(descriptor = getPropertyDescriptor(from, key)) || descriptor.enumerable });
  }
  return to;
};

// Function to convert CommonJS module to ES module
const toCommonJS = (mod) => copyProperties(defineProperty({}, "__esModule", { value: true }), mod);

// Exported APIs
const exports = {};
exportAll(exports, {
  DEFAULT_UA_APP_ID: () => DEFAULT_UA_APP_ID,
  resolveUserAgentConfig: () => resolveUserAgentConfig,
  userAgentMiddleware: () => userAgentMiddleware,
  getUserAgentMiddlewareOptions: () => getUserAgentMiddlewareOptions,
  getUserAgentPlugin: () => getUserAgentPlugin
});
module.exports = toCommonJS(exports);

// Import required modules
const core = require("@smithy/core");
const { setFeature } = require("@aws-sdk/core");
const { HttpRequest } = require("@smithy/protocol-http");
const { getUserAgentPrefix } = require("@aws-sdk/util-endpoints");

// Constants for user-agent processing
const USER_AGENT = "user-agent";
const X_AMZ_USER_AGENT = "x-amz-user-agent";
const SPACE = " ";
const BYTE_LIMIT = 1024;

// Default app ID
let DEFAULT_UA_APP_ID;

// Validate user-agent application ID
function isValidUserAgentAppId(appId) {
  if (appId === void 0) {
    return true;
  }
  return typeof appId === "string" && appId.length <= 50;
}
setName(isValidUserAgentAppId, "isValidUserAgentAppId");

// Resolve user-agent configuration
function resolveUserAgentConfig(input) {
  const normalizedAppIdProvider = core.normalizeProvider(input.userAgentAppId ?? DEFAULT_UA_APP_ID);
  return {
    ...input,
    customUserAgent: typeof input.customUserAgent === "string" ? [[input.customUserAgent]] : input.customUserAgent,
    userAgentAppId: async () => {
      const appId = await normalizedAppIdProvider();
      if (!isValidUserAgentAppId(appId)) {
        const logger = input.logger && input.logger.constructor.name !== "NoOpLogger" ? input.logger : console;
        if (typeof appId !== "string") {
          logger?.warn("userAgentAppId must be a string or undefined.");
        } else if (appId.length > 50) {
          logger?.warn("The provided userAgentAppId exceeds the maximum length of 50 characters.");
        }
      }
      return appId;
    }
  };
}
setName(resolveUserAgentConfig, "resolveUserAgentConfig");

// Check for features and manage state context
async function checkFeatures(context, config, args) {
  const request = args.request;
  if (typeof config.accountIdEndpointMode === "function") {
    const mode = await config.accountIdEndpointMode?.();
    if (mode) {
      setFeature(context, `ACCOUNT_ID_MODE_${mode.toUpperCase()}`, mode.charAt(0).toUpperCase());
    }
  }
  const identity = context.__smithy_context?.selectedHttpAuthScheme?.identity;
  if (identity?.$source) {
    const credentials = identity;
    if (credentials.accountId) {
      setFeature(context, "RESOLVED_ACCOUNT_ID", "T");
    }
    for (const [key, value] of Object.entries(credentials.$source ?? {})) {
      setFeature(context, key, value);
    }
  }
}
setName(checkFeatures, "checkFeatures");

// Encode user-agent features up to byte limits
function encodeFeatures(features) {
  let buffer = "";
  for (const key in features) {
    const val = features[key];
    if (buffer.length + val.length + 1 <= BYTE_LIMIT) {
      buffer = buffer.length ? `${buffer},${val}` : val;
    } else {
      break;
    }
  }
  return buffer;
}
setName(encodeFeatures, "encodeFeatures");

// Middleware for user-agent manipulation
const userAgentMiddleware = setName((options) => (next, context) => async (args) => {
  const { request } = args;
  if (!HttpRequest.isInstance(request)) {
    return next(args);
  }
  const { headers } = request;
  
  const userAgent = context.userAgent?.map(escapeUserAgent) || [];
  const defaultUserAgent = (await options.defaultUserAgentProvider()).map(escapeUserAgent);
  
  await checkFeatures(context, options, args);
  
  const awsContext = context;
  defaultUserAgent.push(
    `m/${encodeFeatures(
      { ...awsContext.__smithy_context?.features, ...awsContext.__aws_sdk_context?.features }
    )}`
  );
  
  const customUserAgent = options.customUserAgent?.map(escapeUserAgent) || [];
  const appId = await options.userAgentAppId();
  if (appId) {
    defaultUserAgent.push(escapeUserAgent([`app/${appId}`]));
  }
  
  const prefix = getUserAgentPrefix();
  const sdkUserAgentValue = [...(prefix ? [prefix] : []), ...defaultUserAgent, ...userAgent, ...customUserAgent].join(SPACE);
  
  const normalUAValue = [
    ...defaultUserAgent.filter((section) => section.startsWith("aws-sdk-")),
    ...customUserAgent
  ].join(SPACE);
  
  if (options.runtime !== "browser") {
    if (normalUAValue) {
      headers[X_AMZ_USER_AGENT] = headers[X_AMZ_USER_AGENT] ? `${headers[USER_AGENT]} ${normalUAValue}` : normalUAValue;
    }
    headers[USER_AGENT] = sdkUserAgentValue;
  } else {
    headers[X_AMZ_USER_AGENT] = sdkUserAgentValue;
  }
  return next({ ...args, request });
}, "userAgentMiddleware");

// Escape user-agent elements for safe HTTP headers
const escapeUserAgent = setName((userAgentPair) => {
  const [namePart, versionPart] = userAgentPair;
  const name = namePart.split("/").map(part => part.replace(/[^\!\$\%\&\'\*\+\-\.\^\_\`\|\~\d\w]/g, "-")).join("/");
  const version = versionPart?.replace(/[^\!\$\%\&\'\*\+\-\.\^\_\`\|\~\d\w\#]/g, "-");
  const prefixSeparatorIndex = name.indexOf("/");
  const prefix = name.substring(0, prefixSeparatorIndex);
  let uaName = name.substring(prefixSeparatorIndex + 1);
  
  if (prefix === "api") {
    uaName = uaName.toLowerCase();
  }
  
  return [prefix, uaName, version].filter(item => item && item.length > 0).reduce((acc, item, index) => {
    return index === 0 ? item : `${acc}${index === 1 ? "/" : "#"}${item}`;
  }, "");
}, "escapeUserAgent");

// Options for user-agent middleware
const getUserAgentMiddlewareOptions = {
  name: "getUserAgentMiddleware",
  step: "build",
  priority: "low",
  tags: ["SET_USER_AGENT", "USER_AGENT"],
  override: true
};

// Plugin for integrating user-agent middleware
const getUserAgentPlugin = setName((config) => ({
  applyToStack: (clientStack) => {
    clientStack.add(userAgentMiddleware(config), getUserAgentMiddlewareOptions);
  }
}), "getUserAgentPlugin");
