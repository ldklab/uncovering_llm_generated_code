"use strict";

// Utility functions and variable setups for property handling and module exporting
const defineProperty = Object.defineProperty;
const getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
const getOwnPropertyNames = Object.getOwnPropertyNames;
const hasOwnProperty = Object.prototype.hasOwnProperty;

const setFunctionName = (target, name) => defineProperty(target, "name", { value: name, configurable: true });
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

// Exports object for module processing
const exports = {};
exportModule(exports, {
  DEFAULT_UA_APP_ID: () => DEFAULT_UA_APP_ID,
  getUserAgentMiddlewareOptions: () => getUserAgentMiddlewareOptions,
  getUserAgentPlugin: () => getUserAgentPlugin,
  resolveUserAgentConfig: () => resolveUserAgentConfig,
  userAgentMiddleware: () => userAgentMiddleware
});
module.exports = toCommonJS(exports);

// Configuration logic
const { normalizeProvider } = require("@smithy/core");
let DEFAULT_UA_APP_ID = undefined;

function isValidUserAgentAppId(appId) {
  return appId === undefined || (typeof appId === "string" && appId.length <= 50);
}
setFunctionName(isValidUserAgentAppId, "isValidUserAgentAppId");

function resolveUserAgentConfig(input) {
  const normalizedAppIdProvider = normalizeProvider(input.userAgentAppId ?? DEFAULT_UA_APP_ID);
  return {
    ...input,
    customUserAgent: typeof input.customUserAgent === "string" ? [[input.customUserAgent]] : input.customUserAgent,
    userAgentAppId: async () => {
      const appId = await normalizedAppIdProvider();
      if (!isValidUserAgentAppId(appId)) {
        const logger = (input.logger && input.logger.constructor && input.logger.constructor.name === "NoOpLogger") ? console : input.logger;
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
setFunctionName(resolveUserAgentConfig, "resolveUserAgentConfig");

// Middleware processing logic
const { HttpRequest } = require("@smithy/protocol-http");
const { getUserAgentPrefix } = require("@aws-sdk/util-endpoints");

async function checkFeatures(context, config, args) {
  const { request } = args;

  if (typeof config.accountIdEndpointMode === "function") {
    const mode = await config.accountIdEndpointMode?.();
    if (mode) {
      context[`ACCOUNT_ID_MODE_${mode.toUpperCase()}`] = mode[0].toUpperCase();
    }
  }

  const identity = context?.__smithy_context?.selectedHttpAuthScheme?.identity;
  if (identity?.$source) {
    if (identity.accountId) {
      context["RESOLVED_ACCOUNT_ID"] = "T";
    }
    for (const [key, value] of Object.entries(identity.$source ?? {})) {
      context[key] = value;
    }
  }
}
setFunctionName(checkFeatures, "checkFeatures");

// Constants
const USER_AGENT = "user-agent";
const X_AMZ_USER_AGENT = "x-amz-user-agent";
const SPACE = " ";
const UA_NAME_SEPARATOR = "/";
const UA_NAME_ESCAPE_REGEX = /[^\!\$\%\&\'\*\+\-\.\^\_\`\|\~\d\w]/g;
const UA_VALUE_ESCAPE_REGEX = /[^\!\$\%\&\'\*\+\-\.\^\_\`\|\~\d\w\#]/g;
const UA_ESCAPE_CHAR = "-";

// Feature encoding logic
const BYTE_LIMIT = 1024;
function encodeFeatures(features) {
  let buffer = "";
  for (const key in features) {
    const val = features[key];
    if (buffer.length + val.length + 1 <= BYTE_LIMIT) {
      buffer += buffer.length ? `,${val}` : val;
    } else break;
  }
  return buffer;
}
setFunctionName(encodeFeatures, "encodeFeatures");

// User-Agent middleware
const userAgentMiddleware = (options) => (next, context) => async (args) => {
  const { request } = args;
  
  if (!HttpRequest.isInstance(request)) {
    return next(args);
  }

  const { headers } = request;
  const userAgent = context?.userAgent?.map(escapeUserAgent) || [];
  const defaultUserAgent = (await options.defaultUserAgentProvider()).map(escapeUserAgent);

  await checkFeatures(context, options, args);

  const awsContext = context;
  defaultUserAgent.push(`m/${encodeFeatures({ ...context.__smithy_context?.features, ...awsContext.__aws_sdk_context?.features })}`);

  const customUserAgent = options?.customUserAgent?.map(escapeUserAgent) || [];
  const appId = await options.userAgentAppId();

  if (appId) {
    defaultUserAgent.push(escapeUserAgent([`app/${appId}`]));
  }

  const prefix = getUserAgentPrefix();
  const userAgentValue = (prefix ? [prefix] : []).concat([...defaultUserAgent, ...userAgent, ...customUserAgent]).join(SPACE);
  const normalUAValue = [...defaultUserAgent.filter(section => section.startsWith("aws-sdk-")), ...customUserAgent].join(SPACE);

  if (options.runtime !== "browser") {
    if (normalUAValue) {
      headers[X_AMZ_USER_AGENT] = headers[X_AMZ_USER_AGENT] ? `${headers[USER_AGENT]} ${normalUAValue}` : normalUAValue;
    }
    headers[USER_AGENT] = userAgentValue;
  } else {
    headers[X_AMZ_USER_AGENT] = userAgentValue;
  }

  return next({ ...args, request });
};
setFunctionName(userAgentMiddleware, "userAgentMiddleware");

function escapeUserAgent([name, version]) {
  const escapedName = name.split(UA_NAME_SEPARATOR)
    .map(part => part.replace(UA_NAME_ESCAPE_REGEX, UA_ESCAPE_CHAR))
    .join(UA_NAME_SEPARATOR);

  const escapedVersion = version?.replace(UA_VALUE_ESCAPE_REGEX, UA_ESCAPE_CHAR);

  const prefixSeparatorIndex = escapedName.indexOf(UA_NAME_SEPARATOR);
  const prefix = escapedName.substring(0, prefixSeparatorIndex);
  let uaName = escapedName.substring(prefixSeparatorIndex + 1);

  if (prefix === "api") {
    uaName = uaName.toLowerCase();
  }

  return [prefix, uaName, escapedVersion]
    .filter(item => item && item.length > 0)
    .reduce((acc, item, index) => index === 0 ? item : index === 1 ? `${acc}/${item}` : `${acc}#${item}`, "");
}
setFunctionName(escapeUserAgent, "escapeUserAgent");

// Middleware options
const getUserAgentMiddlewareOptions = {
  name: "getUserAgentMiddleware",
  step: "build",
  priority: "low",
  tags: ["SET_USER_AGENT", "USER_AGENT"],
  override: true
};

// Plugin setup
const getUserAgentPlugin = (config) => ({
  applyToStack: (clientStack) => {
    clientStack.add(userAgentMiddleware(config), getUserAgentMiddlewareOptions);
  }
});
setFunctionName(getUserAgentPlugin, "getUserAgentPlugin");

// Export for ESM import in Node.js
0 && (module.exports = { DEFAULT_UA_APP_ID, resolveUserAgentConfig, userAgentMiddleware, getUserAgentMiddlewareOptions, getUserAgentPlugin });
