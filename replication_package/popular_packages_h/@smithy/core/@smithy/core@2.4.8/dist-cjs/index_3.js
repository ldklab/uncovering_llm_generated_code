const { defineProperty, getOwnPropertyDescriptor, getOwnPropertyNames, prototype: { hasOwnProperty } } = Object;
const defineName = (target, value) => defineProperty(target, "name", { value, configurable: true });
const exportModule = (target, all) => {
  for (let name in all) {
    defineProperty(target, name, { get: all[name], enumerable: true });
  }
};
const copyProperties = (to, from, except, desc) => {
  if (from && (typeof from === "object" || typeof from === "function")) {
    for (let key of getOwnPropertyNames(from)) {
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

// src/index.ts
const src_exports = {};
exportModule(src_exports, {
  DefaultIdentityProviderConfig,
  EXPIRATION_MS,
  HttpApiKeyAuthSigner,
  HttpBearerAuthSigner,
  NoAuthSigner,
  RequestBuilder,
  createIsIdentityExpiredFunction,
  createPaginator,
  doesIdentityRequireRefresh,
  getHttpAuthSchemeEndpointRuleSetPlugin,
  getHttpAuthSchemePlugin,
  getHttpSigningPlugin,
  getSmithyContext,
  httpAuthSchemeEndpointRuleSetMiddlewareOptions,
  httpAuthSchemeMiddleware,
  httpAuthSchemeMiddlewareOptions,
  httpSigningMiddleware,
  httpSigningMiddlewareOptions,
  isIdentityExpired,
  memoizeIdentityProvider,
  normalizeProvider,
  requestBuilder
});
module.exports = toCommonJS(src_exports);

// Further modules continue similarly with streamlined function definitions, utilities, and class-based implementations as above
const { util_middleware, middleware_endpoint, middleware_serde, protocol_http, types, smithy_client, middleware_retry } = requireModules();

function convertHttpAuthSchemesToMap(httpAuthSchemes) {
  const map = new Map();
  for (const scheme of httpAuthSchemes) {
    map.set(scheme.schemeId, scheme);
  }
  return map;
}
defineName(convertHttpAuthSchemesToMap, "convertHttpAuthSchemesToMap");

const httpAuthSchemeMiddleware = defineName((config, mwOptions) => (next, context) => async (args) => {
  const options = config.httpAuthSchemeProvider(
    await mwOptions.httpAuthSchemeParametersProvider(config, context, args.input)
  );
  const authSchemes = convertHttpAuthSchemesToMap(config.httpAuthSchemes);
  const smithyContext = util_middleware.getSmithyContext(context);
  const failureReasons = [];
  
  for (const option of options) {
    const scheme = authSchemes.get(option.schemeId);
    if (!scheme) {
      failureReasons.push(`HttpAuthScheme \`${option.schemeId}\` was not enabled for this service.`);
      continue;
    }
    const identityProvider = scheme.identityProvider(await mwOptions.identityProviderConfigProvider(config));
    if (!identityProvider) {
      failureReasons.push(`HttpAuthScheme \`${option.schemeId}\` did not have an IdentityProvider configured.`);
      continue;
    }
    const { identityProperties = {}, signingProperties = {} } = option.propertiesExtractor?.(config, context) || {};
    option.identityProperties = Object.assign(option.identityProperties || {}, identityProperties);
    option.signingProperties = Object.assign(option.signingProperties || {}, signingProperties);

    smithyContext.selectedHttpAuthScheme = {
      httpAuthOption: option,
      identity: await identityProvider(option.identityProperties),
      signer: scheme.signer
    };
    
    break;
  }
  
  if (!smithyContext.selectedHttpAuthScheme) {
    throw new Error(failureReasons.join("\n"));
  }
  return next(args);
}, "httpAuthSchemeMiddleware");

// More similar code continues here

function requireModules() {
  return {
    util_middleware: require("@smithy/util-middleware"),
    middleware_endpoint: require("@smithy/middleware-endpoint"),
    middleware_serde: require("@smithy/middleware-serde"),
    protocol_http: require("@smithy/protocol-http"),
    types: require("@smithy/types"),
    smithy_client: require("@smithy/smithy-client"),
    middleware_retry: require("@smithy/middleware-retry")
  };
}

class DefaultIdentityProviderConfig {
  constructor(config) {
    this.authSchemes = new Map();
    for (const [key, value] of Object.entries(config)) {
      if (value !== undefined) {
        this.authSchemes.set(key, value);
      }
    }
  }
  getIdentityProvider(schemeId) {
    return this.authSchemes.get(schemeId);
  }
}
defineName(DefaultIdentityProviderConfig, "DefaultIdentityProviderConfig");

class HttpApiKeyAuthSigner {
  async sign(httpRequest, identity, signingProperties) {
    // Signing logic with error handling omitted for brevity
  }
}
defineName(HttpApiKeyAuthSigner, "HttpApiKeyAuthSigner");

// More similar class and function implementations
