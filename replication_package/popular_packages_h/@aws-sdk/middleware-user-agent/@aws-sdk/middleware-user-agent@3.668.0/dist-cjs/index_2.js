"use strict";

const { normalizeProvider } = require("@smithy/core");
const { setFeature } = require("@aws-sdk/core");
const { HttpRequest } = require("@smithy/protocol-http");
const { getUserAgentPrefix } = require("@aws-sdk/util-endpoints");

const DEFAULT_UA_APP_ID = undefined;

function isValidUserAgentAppId(appId) {
  if (appId === undefined) return true;
  return typeof appId === "string" && appId.length <= 50;
}

function resolveUserAgentConfig(input) {
  const normalizedAppIdProvider = normalizeProvider(input.userAgentAppId ?? DEFAULT_UA_APP_ID);
  return {
    ...input,
    customUserAgent: typeof input.customUserAgent === "string" ? [[input.customUserAgent]] : input.customUserAgent,
    userAgentAppId: async () => {
      const appId = await normalizedAppIdProvider();
      const logger = input.logger ?? console;
      if (!isValidUserAgentAppId(appId)) {
        if (typeof appId !== "string") {
          logger.warn("userAgentAppId must be a string or undefined.");
        } else if (appId.length > 50) {
          logger.warn("The provided userAgentAppId exceeds the maximum length of 50 characters.");
        }
      }
      return appId;
    }
  };
}

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
    for (const [key, value] of Object.entries(credentials.$source ?? {})) {
      setFeature(context, key, value);
    }
  }
}

const UA_NAME_SEPARATOR = "/";
const UA_NAME_ESCAPE_REGEX = /[^\!\$\%\&\'\*\+\-\.\^\_\`\|\~\d\w]/g;
const UA_VALUE_ESCAPE_REGEX = /[^\!\$\%\&\'\*\+\-\.\^\_\`\|\~\d\w\#]/g;
const UA_ESCAPE_CHAR = "-";

function escapeUserAgent(userAgentPair) {
  const name = userAgentPair[0].split(UA_NAME_SEPARATOR).map(part => part.replace(UA_NAME_ESCAPE_REGEX, UA_ESCAPE_CHAR)).join(UA_NAME_SEPARATOR);
  const version = userAgentPair[1]?.replace(UA_VALUE_ESCAPE_REGEX, UA_ESCAPE_CHAR);
  const prefixSeparatorIndex = name.indexOf(UA_NAME_SEPARATOR);
  const prefix = name.substring(0, prefixSeparatorIndex);
  let uaName = name.substring(prefixSeparatorIndex + 1);
  if (prefix === "api") {
    uaName = uaName.toLowerCase();
  }
  return [prefix, uaName, version].filter(item => item && item.length > 0).reduce((acc, item, index) => {
    switch (index) {
      case 0:
        return item;
      case 1:
        return `${acc}/${item}`;
      default:
        return `${acc}#${item}`;
    }
  }, "");
}

function encodeFeatures(features) {
  const BYTE_LIMIT = 1024;
  let buffer = "";
  for (const key in features) {
    const val = features[key];
    if (buffer.length + val.length + 1 <= BYTE_LIMIT) {
      buffer += buffer.length ? `,${val}` : val;
      continue;
    }
    break;
  }
  return buffer;
}

function userAgentMiddleware(options) {
  return async (next, context) => {
    return async args => {
      const { request } = args;
      if (!HttpRequest.isInstance(request)) {
        return next(args);
      }
      const { headers } = request;
      const userAgent = context?.userAgent?.map(escapeUserAgent) || [];
      const defaultUserAgent = (await options.defaultUserAgentProvider()).map(escapeUserAgent);
      await checkFeatures(context, options, args);
      defaultUserAgent.push(`m/${encodeFeatures({ ...context.__smithy_context?.features, ...context.__aws_sdk_context?.features })}`);
      const customUserAgent = options?.customUserAgent?.map(escapeUserAgent) || [];
      const appId = await options.userAgentAppId();
      if (appId) {
        defaultUserAgent.push(escapeUserAgent([`app/${appId}`]));
      }
      const prefix = getUserAgentPrefix();
      const sdkUserAgentValue = (prefix ? [prefix] : []).concat([...defaultUserAgent, ...userAgent, ...customUserAgent]).join(" ");
      const normalUAValue = [...defaultUserAgent.filter(section => section.startsWith("aws-sdk-")), ...customUserAgent].join(" ");
      if (options.runtime !== "browser") {
        if (normalUAValue) {
          headers["x-amz-user-agent"] = headers["user-agent"] ? `${headers["user-agent"]} ${normalUAValue}` : normalUAValue;
        }
        headers["user-agent"] = sdkUserAgentValue;
      } else {
        headers["x-amz-user-agent"] = sdkUserAgentValue;
      }
      return next({ ...args, request });
    };
  };
}

const getUserAgentMiddlewareOptions = {
  name: "getUserAgentMiddleware",
  step: "build",
  priority: "low",
  tags: ["SET_USER_AGENT", "USER_AGENT"],
  override: true
};

function getUserAgentPlugin(config) {
  return {
    applyToStack: clientStack => {
      clientStack.add(userAgentMiddleware(config), getUserAgentMiddlewareOptions);
    }
  };
}

module.exports = {
  DEFAULT_UA_APP_ID,
  resolveUserAgentConfig,
  userAgentMiddleware,
  getUserAgentMiddlewareOptions,
  getUserAgentPlugin
};
