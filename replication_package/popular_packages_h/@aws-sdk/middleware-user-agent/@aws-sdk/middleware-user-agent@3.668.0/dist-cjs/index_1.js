"use strict";

// Utility functions to define properties and manage object properties
const defineProperty = Object.defineProperty;
const getPropertyDescriptor = Object.getOwnPropertyDescriptor;
const getPropertyNames = Object.getOwnPropertyNames;
const hasOwnProperty = Object.prototype.hasOwnProperty;

const setName = (target, value) => defineProperty(target, "name", { value, configurable: true });

const exportModule = (target, all) => {
  for (const name in all) {
    defineProperty(target, name, { get: all[name], enumerable: true });
  }
};

const copyObjectProperties = (to, from, except, desc) => {
  if (from && (typeof from === "object" || typeof from === "function")) {
    for (let key of getPropertyNames(from)) {
      if (!hasOwnProperty.call(to, key) && key !== except) {
        defineProperty(
          to, 
          key, 
          { get: () => from[key], enumerable: !(desc = getPropertyDescriptor(from, key)) || desc.enumerable }
        );
      }
    }
  }
  return to;
};

const toCommonJS = (mod) => copyObjectProperties(defineProperty({}, "__esModule", { value: true }), mod);

// Module for exporting user agent utilities
const srcExports = {};
exportModule(srcExports, {
  DEFAULT_UA_APP_ID: () => DEFAULT_UA_APP_ID,
  getUserAgentMiddlewareOptions: () => getUserAgentMiddlewareOptions,
  getUserAgentPlugin: () => getUserAgentPlugin,
  resolveUserAgentConfig: () => resolveUserAgentConfig,
  userAgentMiddleware: () => userAgentMiddleware
});

module.exports = toCommonJS(srcExports);

// Configuration functions and utilities
const { normalizeProvider } = require("@smithy/core");

let DEFAULT_UA_APP_ID = undefined;

function isValidUserAgentAppId(appId) {
  if (appId === undefined) {
    return true;
  }
  return typeof appId === "string" && appId.length <= 50;
}
setName(isValidUserAgentAppId, "isValidUserAgentAppId");

function resolveUserAgentConfig(input) {
  const normalizedAppIdProvider = normalizeProvider(input.userAgentAppId ?? DEFAULT_UA_APP_ID);
  return {
    ...input,
    customUserAgent: typeof input.customUserAgent === "string" ? [[input.customUserAgent]] : input.customUserAgent,
    userAgentAppId: async () => {
      const appId = await normalizedAppIdProvider();
      if (!isValidUserAgentAppId(appId)) {
        const logger = input.logger && input.logger.constructor?.name !== "NoOpLogger" ? input.logger : console;
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

// User agent middleware implementation
const { HttpRequest } = require("@smithy/protocol-http");
const { getUserAgentPrefix } = require("@aws-sdk/util-endpoints");

const userAgentMiddleware = setName((options) => (next, context) => async (args) => {
  const { request } = args;
  if (!HttpRequest.isInstance(request)) {
    return next(args);
  }
  const { headers } = request;
  const userAgent = (context.userAgent?.map(escapeUserAgent) || []);
  const defaultUserAgent = (await options.defaultUserAgentProvider()).map(escapeUserAgent);
  await checkFeatures(context, options, args);
  
  const awsContext = context;

  defaultUserAgent.push(`m/${encodeFeatures({ ...(context.__smithy_context?.features || {}), ...(awsContext.__aws_sdk_context?.features || {}) })}`);

  const customUserAgent = (options.customUserAgent?.map(escapeUserAgent) || []);
  const appId = await options.userAgentAppId();
  if (appId) {
    defaultUserAgent.push(escapeUserAgent([`app/${appId}`]));
  }

  const prefix = getUserAgentPrefix();
  const sdkUserAgentValue = [prefix ? [prefix] : [], ...defaultUserAgent, ...userAgent, ...customUserAgent].join(" ");
  const normalUAValue = [...defaultUserAgent.filter((section) => section.startsWith("aws-sdk-")), ...customUserAgent].join(" ");

  if (options.runtime !== "browser") {
    if (normalUAValue) {
      headers["x-amz-user-agent"] = headers["x-amz-user-agent"] ? `${headers["user-agent"]} ${normalUAValue}` : normalUAValue;
    }
    headers["user-agent"] = sdkUserAgentValue;
  } else {
    headers["x-amz-user-agent"] = sdkUserAgentValue;
  }
  return next({
    ...args,
    request
  });
}, "userAgentMiddleware");

// Helper function to escape user agent information
const escapeUserAgent = setName((userAgentPair) => {
  const [namePart, version] = userAgentPair;
  const nameEscaped = namePart.split("/").map(part => part.replace(/[^\!\$\%\&\'\*\+\-\.\^\_\`\|\~\d\w]/g, "-")).join("/");
  const versionEscaped = version?.replace(/[^\!\$\%\&\'\*\+\-\.\^\_\`\|\~\d\w\#]/g, "-");
  const prefixSeparatorIndex = nameEscaped.indexOf("/");
  const prefix = nameEscaped.substring(0, prefixSeparatorIndex);
  let uaName = nameEscaped.substring(prefixSeparatorIndex + 1);
  if (prefix === "api") {
    uaName = uaName.toLowerCase();
  }
  return [prefix, uaName, versionEscaped].filter(item => item).reduce((acc, item, index) => {
    return index === 0 ? item : index === 1 ? `${acc}/${item}` : `${acc}#${item}`;
  }, "");
}, "escapeUserAgent");

// Feature checking function
const { setFeature } = require("@aws-sdk/core");

async function checkFeatures(context, config, args) {
  const request = args.request;
  if (typeof config.accountIdEndpointMode === "function") {
    switch (await config.accountIdEndpointMode?.()) {
      case "disabled":
        setFeature(context, "ACCOUNT_ID_MODE_DISABLED", "Q");
        break;
      case "preferred":
        setFeature(context, "ACCOUNT_ID_MODE_PREFERRED", "P");
        break;
      case "required":
        setFeature(context, "ACCOUNT_ID_MODE_REQUIRED", "R");
        break;
    }
  }
  const identity = context.__smithy_context?.selectedHttpAuthScheme?.identity;
  if (identity?.$source) {
    const credentials = identity;
    if (credentials.accountId) {
      setFeature(context, "RESOLVED_ACCOUNT_ID", "T");
    }
    for (const [key, value] of Object.entries(credentials.$source || {})) {
      setFeature(context, key, value);
    }
  }
}
setName(checkFeatures, "checkFeatures");

// Constants for user agent management
const USER_AGENT = "user-agent";
const X_AMZ_USER_AGENT = "x-amz-user-agent";
const SPACE = " ";
const UA_NAME_SEPARATOR = "/";
const UA_NAME_ESCAPE_REGEX = /[^\!\$\%\&\'\*\+\-\.\^\_\`\|\~\d\w]/g;
const UA_VALUE_ESCAPE_REGEX = /[^\!\$\%\&\'\*\+\-\.\^\_\`\|\~\d\w\#]/g;
const UA_ESCAPE_CHAR = "-";

// Encoding features with byte limitation
const BYTE_LIMIT = 1024;

function encodeFeatures(features) {
  let buffer = "";
  for (const key in features) {
    const val = features[key];
    if (buffer.length + val.length + 1 <= BYTE_LIMIT) {
      if (buffer.length) {
        buffer += "," + val;
      } else {
        buffer += val;
      }
      continue;
    }
    break;
  }
  return buffer;
}
setName(encodeFeatures, "encodeFeatures");

// Options for user agent middleware
const getUserAgentMiddlewareOptions = {
  name: "getUserAgentMiddleware",
  step: "build",
  priority: "low",
  tags: ["SET_USER_AGENT", "USER_AGENT"],
  override: true
};

// Plugin for integrating the middleware into the client's stack
const getUserAgentPlugin = setName((config) => ({
  applyToStack: (clientStack) => {
    clientStack.add(userAgentMiddleware(config), getUserAgentMiddlewareOptions);
  }
}), "getUserAgentPlugin");
