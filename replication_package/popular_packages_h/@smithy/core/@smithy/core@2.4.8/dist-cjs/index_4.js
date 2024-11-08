const { defineProperty, getOwnPropertyDescriptor, getOwnPropertyNames, hasOwnProperty } = Object;
const __name = (target, value) => defineProperty(target, "name", { value, configurable: true });
const __export = (target, all) => {
  for (const name in all) defineProperty(target, name, { get: all[name], enumerable: true });
};
const __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (const key of getOwnPropertyNames(from))
      if (!hasOwnProperty.call(to, key) && key !== except)
        defineProperty(to, key, { get: () => from[key], enumerable: !(desc = getOwnPropertyDescriptor(from, key)) || desc.enumerable });
  }
  return to;
};
const __toCommonJS = (mod) => __copyProps(defineProperty({}, "__esModule", { value: true }), mod);

// Exported Module
const src_exports = {};
const exportedFunctions = {
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
  getSmithyContext: getSmithyContext3,
  httpAuthSchemeEndpointRuleSetMiddlewareOptions,
  httpAuthSchemeMiddleware,
  httpAuthSchemeMiddlewareOptions,
  httpSigningMiddleware,
  httpSigningMiddlewareOptions,
  isIdentityExpired,
  memoizeIdentityProvider,
  normalizeProvider,
  requestBuilder
};
__export(src_exports, exportedFunctions);
module.exports = __toCommonJS(src_exports);

// Dependencies
const { getSmithyContext: smithyContextUtil } = require("@smithy/util-middleware");
const { endpointMiddlewareOptions: endpointOpts } = require("@smithy/middleware-endpoint");
const { serializerMiddlewareOption } = require("@smithy/middleware-serde");
const { retryMiddlewareOptions } = require("@smithy/middleware-retry");
const { HttpRequest } = require("@smithy/protocol-http");
const { resolvedPath } = require("@smithy/smithy-client");
const { HttpApiKeyAuthLocation, SMITHY_CONTEXT_KEY } = require("@smithy/types");

// Middlewares
function convertHttpAuthSchemesToMap(httpAuthSchemes) {
  const map = new Map();
  for (const scheme of httpAuthSchemes) map.set(scheme.schemeId, scheme);
  return map;
}
__name(convertHttpAuthSchemesToMap, "convertHttpAuthSchemesToMap");

const httpAuthSchemeMiddleware = __name((config, mwOptions) => (next, context) => async (args) => {
  let { httpAuthSchemeProvider, httpAuthSchemes } = config;
  let options = httpAuthSchemeProvider(await mwOptions.httpAuthSchemeParametersProvider(config, context, args.input));
  const authSchemeMap = convertHttpAuthSchemesToMap(httpAuthSchemes);
  let smithyContext = smithyContextUtil(context);
  let failureReasons = [];
  
  for (const option of options) {
    const scheme = authSchemeMap.get(option.schemeId);
    if (!scheme) {
      failureReasons.push(`HttpAuthScheme \`${option.schemeId}\` was not enabled for this service.`);
      continue;
    }
    const identityProvider = scheme.identityProvider(await mwOptions.identityProviderConfigProvider(config));
    if (!identityProvider) {
      failureReasons.push(`HttpAuthScheme \`${option.schemeId}\` did not have an IdentityProvider configured.`);
      continue;
    }
    const { identityProperties = {}, signingProperties = {} } = (option.propertiesExtractor?.(option, context) || {});
    option.identityProperties = { ...option.identityProperties, ...identityProperties };
    option.signingProperties = { ...option.signingProperties, ...signingProperties };
    
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

const getHttpAuthSchemeEndpointRuleSetPlugin = __name((config, { httpAuthSchemeParametersProvider, identityProviderConfigProvider }) => ({
  applyToStack: (clientStack) => {
    clientStack.addRelativeTo(
      httpAuthSchemeMiddleware(config, { httpAuthSchemeParametersProvider, identityProviderConfigProvider }), 
      {
        step: "serialize",
        tags: ["HTTP_AUTH_SCHEME"],
        name: "httpAuthSchemeMiddleware",
        override: true,
        relation: "before",
        toMiddleware: endpointOpts.name
      }
    );
  }
}), "getHttpAuthSchemeEndpointRuleSetPlugin");

// Signing Middlewares
const httpSigningMiddleware = __name((config) => (next, context) => async (args) => {
  if (!HttpRequest.isInstance(args.request)) return next(args);

  let smithyContext = smithyContextUtil(context);
  let scheme = smithyContext.selectedHttpAuthScheme;
  if (!scheme) throw new Error(`No HttpAuthScheme was selected: unable to sign request`);

  let { httpAuthOption: { signingProperties = {} }, identity, signer } = scheme;
  try {
    let signedRequest = await signer.sign(args.request, identity, signingProperties);
    let responseOutput = await next({ ...args, request: signedRequest });

    (signer.successHandler || (() => {}))(responseOutput.response, signingProperties);
    return responseOutput;
  } catch (error) {
    throw (signer.errorHandler || ((e) => e))(signingProperties, error);
  }
}, "httpSigningMiddleware");

const getHttpSigningPlugin = __name((config) => ({
  applyToStack: (clientStack) => {
    clientStack.addRelativeTo(httpSigningMiddleware(config), {
      step: "finalizeRequest",
      tags: ["HTTP_SIGNING"],
      name: "httpSigningMiddleware",
      aliases: ["apiKeyMiddleware", "tokenMiddleware", "awsAuthMiddleware"],
      override: true,
      relation: "after",
      toMiddleware: retryMiddlewareOptions.name
    });
  }
}), "getHttpSigningPlugin");

// Identity and Auth
class DefaultIdentityProviderConfig {
  constructor(config) {
    this.authSchemes = new Map();
    for (const [key, value] of Object.entries(config)) {
      if (value !== undefined) this.authSchemes.set(key, value);
    }
  }
  getIdentityProvider(schemeId) {
    return this.authSchemes.get(schemeId);
  }
}

class HttpApiKeyAuthSigner {
  async sign(httpRequest, identity, signingProperties) {
    if (!signingProperties) throw new Error("Missing signing properties for `apiKey`.");
    if (!signingProperties.name) throw new Error("Missing `name` signing property for `apiKey`.");
    if (!signingProperties.in) throw new Error("Missing `in` signing property for `apiKey`.");
    if (!identity.apiKey) throw new Error("Undefined `apiKey` for signing request.");

    const clonedRequest = HttpRequest.clone(httpRequest);
    if (signingProperties.in === HttpApiKeyAuthLocation.QUERY) {
      clonedRequest.query[signingProperties.name] = identity.apiKey;
    } else if (signingProperties.in === HttpApiKeyAuthLocation.HEADER) {
      clonedRequest.headers[signingProperties.name] = signingProperties.scheme
        ? `${signingProperties.scheme} ${identity.apiKey}`
        : identity.apiKey;
    } else {
      throw new Error(`'apiKey' location must be 'query' or 'header', not '${signingProperties.in}'.`);
    }
    return clonedRequest;
  }
}

class HttpBearerAuthSigner {
  async sign(httpRequest, identity) {
    if (!identity.token) throw new Error("Token is undefined for signing request with `Bearer`.");
    const clonedRequest = HttpRequest.clone(httpRequest);
    clonedRequest.headers["Authorization"] = `Bearer ${identity.token}`;
    return clonedRequest;
  }
}

class NoAuthSigner {
  async sign(httpRequest) {
    return httpRequest;
  }
}

// Memoization and Expiration
const createIsIdentityExpiredFunction = (expirationMs) => (identity) => 
  doesIdentityRequireRefresh(identity) && identity.expiration.getTime() - Date.now() < expirationMs;

const EXPIRATION_MS = 300000; // 5 minutes
const isIdentityExpired = createIsIdentityExpiredFunction(EXPIRATION_MS);

const doesIdentityRequireRefresh = (identity) => identity.expiration !== undefined;

const memoizeIdentityProvider = (provider, isExpired, requiresRefresh) => {
  if (provider === undefined) return;

  const normalizedProvider = typeof provider !== 'function' ? async () => Promise.resolve(provider) : provider;
  let resolved;
  let pending;
  let hasResult = false;
  let isConstant = false;

  const coalesceProvider = async (options) => {
    if (!pending) pending = normalizedProvider(options);
    try {
      resolved = await pending;
      hasResult = true;
      isConstant = false;
    } finally {
      pending = void 0;
    }
    return resolved;
  };

  if (isExpired === undefined) {
    return async (options) => {
      if (!hasResult || (options?.forceRefresh)) resolved = await coalesceProvider(options);
      return resolved;
    };
  }

  return async (options) => {
    if (!hasResult || (options?.forceRefresh)) resolved = await coalesceProvider(options);

    if (isConstant) return resolved;
    if (!requiresRefresh(resolved)) {
      isConstant = true;
      return resolved;
    }

    if (isExpired(resolved)) {
      await coalesceProvider(options);
      return resolved;
    }

    return resolved;
  };
};

// Utilities and Miscellaneous
const getSmithyContext3 = (context) => context[SMITHY_CONTEXT_KEY] || (context[SMITHY_CONTEXT_KEY] = {});

const normalizeProvider = (input) => {
  if (typeof input === 'function') return input;
  const promisified = Promise.resolve(input);
  return () => promisified;
};

// Request Building
function requestBuilder(input, context) {
  return new RequestBuilder(input, context);
}

class RequestBuilder {
  constructor(input, context) {
    this.input = input;
    this.context = context;
    this.query = {};
    this.method = "";
    this.headers = {};
    this.path = "";
    this.body = null;
    this.hostname = "";
    this.resolvePathStack = [];
  }

  async build() {
    const { hostname, protocol = "https", port, path: basePath } = await this.context.endpoint();
    this.path = basePath;
    for (const resolvePath of this.resolvePathStack) resolvePath(this.path);

    return new HttpRequest({
      protocol,
      hostname: this.hostname || hostname,
      port,
      method: this.method,
      path: this.path,
      query: this.query,
      body: this.body,
      headers: this.headers
    });
  }

  hn(hostname) {
    this.hostname = hostname;
    return this;
  }

  bp(uriLabel) {
    this.resolvePathStack.push((basePath) => {
      this.path = `${(basePath?.endsWith("/") ? basePath.slice(0, -1) : basePath) || ""}${uriLabel}`;
    });
    return this;
  }

  p(memberName, labelValueProvider, uriLabel, isGreedyLabel) {
    this.resolvePathStack.push((path) => {
      this.path = resolvedPath(path, this.input, memberName, labelValueProvider, uriLabel, isGreedyLabel);
    });
    return this;
  }

  h(headers) {
    this.headers = headers;
    return this;
  }

  q(query) {
    this.query = query;
    return this;
  }

  b(body) {
    this.body = body;
    return this;
  }

  m(method) {
    this.method = method;
    return this;
  }
}

// Pagination
const makePagedClientRequest = async (CommandCtor, client, input, ...args) => {
  return client.send(new CommandCtor(input), ...args);
};

function createPaginator(ClientCtor, CommandCtor, inputTokenName, outputTokenName, pageSizeTokenName) {
  return async function* paginateOperation(config, input, ...additionalArguments) {
    let token = config.startingToken || undefined;
    let hasNext = true;
    let page;

    while (hasNext) {
      input[inputTokenName] = token;
      if (pageSizeTokenName) input[pageSizeTokenName] = input[pageSizeTokenName] ?? config.pageSize;

      if (config.client instanceof ClientCtor) {
        page = await makePagedClientRequest(CommandCtor, config.client, input, ...additionalArguments);
      } else {
        throw new Error(`Invalid client, expected instance of ${ClientCtor.name}`);
      }

      yield page;

      const prevToken = token;
      token = get(page, outputTokenName);
      hasNext = !!(token && (!config.stopOnSameToken || token !== prevToken));
    }
  };
}

const get = (fromObject, path) => {
  let cursor = fromObject;
  const pathComponents = path.split(".");
  for (const step of pathComponents) {
    if (!cursor || typeof cursor !== "object") return undefined;
    cursor = cursor[step];
  }
  return cursor;
};

0 && (module.exports = {
  createPaginator,
  httpAuthSchemeMiddleware,
  httpAuthSchemeEndpointRuleSetMiddlewareOptions,
  getHttpAuthSchemeEndpointRuleSetPlugin,
  httpAuthSchemeMiddlewareOptions,
  getHttpAuthSchemePlugin,
  httpSigningMiddleware,
  httpSigningMiddlewareOptions,
  getHttpSigningPlugin,
  DefaultIdentityProviderConfig,
  HttpApiKeyAuthSigner,
  HttpBearerAuthSigner,
  NoAuthSigner,
  createIsIdentityExpiredFunction,
  EXPIRATION_MS,
  isIdentityExpired,
  doesIdentityRequireRefresh,
  memoizeIdentityProvider,
  getSmithyContext,
  normalizeProvider,
  requestBuilder,
  RequestBuilder
});
