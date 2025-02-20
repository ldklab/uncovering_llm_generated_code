"use strict";

// Define property-related utility functions
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// Export functions and helpers for module export
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};

var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// Exported symbols
var src_exports = {};
__export(src_exports, {
  AccessDeniedException: () => AccessDeniedException,
  AuthorizationPendingException: () => AuthorizationPendingException,
  CreateTokenCommand: () => CreateTokenCommand,
  CreateTokenRequestFilter: () => CreateTokenRequestFilter,
  CreateTokenResponseFilter: () => CreateTokenResponseFilter,
  CreateTokenWithIAMCommand: () => CreateTokenWithIAMCommand,
  CreateTokenWithIAMRequestFilter: () => CreateTokenWithIAMRequestFilter,
  CreateTokenWithIAMResponseFilter: () => CreateTokenWithIAMResponseFilter,
  ExpiredTokenException: () => ExpiredTokenException,
  InternalServerException: () => InternalServerException,
  InvalidClientException: () => InvalidClientException,
  InvalidClientMetadataException: () => InvalidClientMetadataException,
  InvalidGrantException: () => InvalidGrantException,
  InvalidRedirectUriException: () => InvalidRedirectUriException,
  InvalidRequestException: () => InvalidRequestException,
  InvalidRequestRegionException: () => InvalidRequestRegionException,
  InvalidScopeException: () => InvalidScopeException,
  RegisterClientCommand: () => RegisterClientCommand,
  RegisterClientResponseFilter: () => RegisterClientResponseFilter,
  SSOOIDC: () => SSOOIDC,
  SSOOIDCClient: () => SSOOIDCClient,
  SSOOIDCServiceException: () => SSOOIDCServiceException,
  SlowDownException: () => SlowDownException,
  StartDeviceAuthorizationCommand: () => StartDeviceAuthorizationCommand,
  StartDeviceAuthorizationRequestFilter: () => StartDeviceAuthorizationRequestFilter,
  UnauthorizedClientException: () => UnauthorizedClientException,
  UnsupportedGrantTypeException: () => UnsupportedGrantTypeException,
  __Client: () => import_smithy_client.Client
});
module.exports = __toCommonJS(src_exports);

// Import middleware and configuration dependencies
var import_middleware_host_header = require("@aws-sdk/middleware-host-header");
var import_middleware_logger = require("@aws-sdk/middleware-logger");
var import_middleware_recursion_detection = require("@aws-sdk/middleware-recursion-detection");
var import_middleware_user_agent = require("@aws-sdk/middleware-user-agent");
var import_config_resolver = require("@smithy/config-resolver");
var import_core = require("@smithy/core");
var import_middleware_content_length = require("@smithy/middleware-content-length");
var import_middleware_endpoint = require("@smithy/middleware-endpoint");
var import_middleware_retry = require("@smithy/middleware-retry");

var import_httpAuthSchemeProvider = require("./auth/httpAuthSchemeProvider");

// Define endpoint parameters resolver
var resolveClientEndpointParameters = __name((options) => {
  return {
    ...options,
    useDualstackEndpoint: options.useDualstackEndpoint ?? false,
    useFipsEndpoint: options.useFipsEndpoint ?? false,
    defaultSigningName: "sso-oauth"
  };
}, "resolveClientEndpointParameters");

var commonParams = {
  UseFIPS: { type: "builtInParams", name: "useFipsEndpoint" },
  Endpoint: { type: "builtInParams", name: "endpoint" },
  Region: { type: "builtInParams", name: "region" },
  UseDualStack: { type: "builtInParams", name: "useDualstackEndpoint" }
};

// Import runtime configuration
var import_runtimeConfig = require("././runtimeConfig");

// Import region config resolver
var import_region_config_resolver = require("@aws-sdk/region-config-resolver");
var import_protocol_http = require("@smithy/protocol-http");
var import_smithy_client = require("@smithy/smithy-client");

// Define HTTP authentication configuration
var getHttpAuthExtensionConfiguration = __name((runtimeConfig) => {
  const _httpAuthSchemes = runtimeConfig.httpAuthSchemes;
  let _httpAuthSchemeProvider = runtimeConfig.httpAuthSchemeProvider;
  let _credentials = runtimeConfig.credentials;
  return {
    setHttpAuthScheme(httpAuthScheme) {
      const index = _httpAuthSchemes.findIndex((scheme) => scheme.schemeId === httpAuthScheme.schemeId);
      if (index === -1) {
        _httpAuthSchemes.push(httpAuthScheme);
      } else {
        _httpAuthSchemes.splice(index, 1, httpAuthScheme);
      }
    },
    httpAuthSchemes() {
      return _httpAuthSchemes;
    },
    setHttpAuthSchemeProvider(httpAuthSchemeProvider) {
      _httpAuthSchemeProvider = httpAuthSchemeProvider;
    },
    httpAuthSchemeProvider() {
      return _httpAuthSchemeProvider;
    },
    setCredentials(credentials) {
      _credentials = credentials;
    },
    credentials() {
      return _credentials;
    }
  };
}, "getHttpAuthExtensionConfiguration");

var resolveHttpAuthRuntimeConfig = __name((config) => {
  return {
    httpAuthSchemes: config.httpAuthSchemes(),
    httpAuthSchemeProvider: config.httpAuthSchemeProvider(),
    credentials: config.credentials()
  };
}, "resolveHttpAuthRuntimeConfig");

// Define functions for partial object mapping and runtime extensions resolution
var asPartial = __name((t) => t, "asPartial");

var resolveRuntimeExtensions = __name((runtimeConfig, extensions) => {
  const extensionConfiguration = {
    ...asPartial(import_region_config_resolver.getAwsRegionExtensionConfiguration(runtimeConfig)),
    ...asPartial(import_smithy_client.getDefaultExtensionConfiguration(runtimeConfig)),
    ...asPartial(import_protocol_http.getHttpHandlerExtensionConfiguration(runtimeConfig)),
    ...asPartial(getHttpAuthExtensionConfiguration(runtimeConfig))
  };
  extensions.forEach((extension) => extension.configure(extensionConfiguration));
  return {
    ...runtimeConfig,
    ...import_region_config_resolver.resolveAwsRegionExtensionConfiguration(extensionConfiguration),
    ...import_smithy_client.resolveDefaultRuntimeConfig(extensionConfiguration),
    ...import_protocol_http.resolveHttpHandlerRuntimeConfig(extensionConfiguration),
    ...resolveHttpAuthRuntimeConfig(extensionConfiguration)
  };
}, "resolveRuntimeExtensions");

// Define client class
var SSOOIDCClient = class extends import_smithy_client.Client {
  constructor(...[configuration]) {
    const _config_0 = import_runtimeConfig.getRuntimeConfig(configuration || {});
    const _config_1 = resolveClientEndpointParameters(_config_0);
    const _config_2 = import_middleware_user_agent.resolveUserAgentConfig(_config_1);
    const _config_3 = import_middleware_retry.resolveRetryConfig(_config_2);
    const _config_4 = import_config_resolver.resolveRegionConfig(_config_3);
    const _config_5 = import_middleware_host_header.resolveHostHeaderConfig(_config_4);
    const _config_6 = import_middleware_endpoint.resolveEndpointConfig(_config_5);
    const _config_7 = import_httpAuthSchemeProvider.resolveHttpAuthSchemeConfig(_config_6);
    const _config_8 = resolveRuntimeExtensions(_config_7, (configuration == null ? void 0 : configuration.extensions) || []);
    super(_config_8);
    this.config = _config_8;
    this.middlewareStack.use(import_middleware_user_agent.getUserAgentPlugin(this.config));
    this.middlewareStack.use(import_middleware_retry.getRetryPlugin(this.config));
    this.middlewareStack.use(import_middleware_content_length.getContentLengthPlugin(this.config));
    this.middlewareStack.use(import_middleware_host_header.getHostHeaderPlugin(this.config));
    this.middlewareStack.use(import_middleware_logger.getLoggerPlugin(this.config));
    this.middlewareStack.use(import_middleware_recursion_detection.getRecursionDetectionPlugin(this.config));
    this.middlewareStack.use(
      import_core.getHttpAuthSchemeEndpointRuleSetPlugin(this.config, {
        httpAuthSchemeParametersProvider: import_httpAuthSchemeProvider.defaultSSOOIDCHttpAuthSchemeParametersProvider,
        identityProviderConfigProvider: async (config) => new import_core.DefaultIdentityProviderConfig({
          "aws.auth#sigv4": config.credentials
        })
      })
    );
    this.middlewareStack.use(import_core.getHttpSigningPlugin(this.config));
  }
  // Destroy method to clean up resources
  destroy() {
    super.destroy();
  }
};

// Define exceptions for service errors 
var SSOOIDCServiceException = class extends import_smithy_client.ServiceException {
  constructor(options) {
    super(options);
    Object.setPrototypeOf(this, SSOOIDCServiceException.prototype);
  }
};

var AccessDeniedException = class extends SSOOIDCServiceException {
  constructor(opts) {
    super({
      name: "AccessDeniedException",
      $fault: "client",
      ...opts
    });
    this.name = "AccessDeniedException";
    this.$fault = "client";
    Object.setPrototypeOf(this, AccessDeniedException.prototype);
    this.error = opts.error;
    this.error_description = opts.error_description;
  }
};

var AuthorizationPendingException = class extends SSOOIDCServiceException {
  constructor(opts) {
    super({
      name: "AuthorizationPendingException",
      $fault: "client",
      ...opts
    });
    this.name = "AuthorizationPendingException";
    this.$fault = "client";
    Object.setPrototypeOf(this, AuthorizationPendingException.prototype);
    this.error = opts.error;
    this.error_description = opts.error_description;
  }
};

var ExpiredTokenException = class extends SSOOIDCServiceException {
  constructor(opts) {
    super({
      name: "ExpiredTokenException",
      $fault: "client",
      ...opts
    });
    this.name = "ExpiredTokenException";
    this.$fault = "client";
    Object.setPrototypeOf(this, ExpiredTokenException.prototype);
    this.error = opts.error;
    this.error_description = opts.error_description;
  }
};

var InternalServerException = class extends SSOOIDCServiceException {
  constructor(opts) {
    super({
      name: "InternalServerException",
      $fault: "server",
      ...opts
    });
    this.name = "InternalServerException";
    this.$fault = "server";
    Object.setPrototypeOf(this, InternalServerException.prototype);
    this.error = opts.error;
    this.error_description = opts.error_description;
  }
};

var InvalidClientException = class extends SSOOIDCServiceException {
  constructor(opts) {
    super({
      name: "InvalidClientException",
      $fault: "client",
      ...opts
    });
    this.name = "InvalidClientException";
    this.$fault = "client";
    Object.setPrototypeOf(this, InvalidClientException.prototype);
    this.error = opts.error;
    this.error_description = opts.error_description;
  }
};

var InvalidGrantException = class extends SSOOIDCServiceException {
  constructor(opts) {
    super({
      name: "InvalidGrantException",
      $fault: "client",
      ...opts
    });
    this.name = "InvalidGrantException";
    this.$fault = "client";
    Object.setPrototypeOf(this, InvalidGrantException.prototype);
    this.error = opts.error;
    this.error_description = opts.error_description;
  }
};

var InvalidRequestException = class extends SSOOIDCServiceException {
  constructor(opts) {
    super({
      name: "InvalidRequestException",
      $fault: "client",
      ...opts
    });
    this.name = "InvalidRequestException";
    this.$fault = "client";
    Object.setPrototypeOf(this, InvalidRequestException.prototype);
    this.error = opts.error;
    this.error_description = opts.error_description;
  }
};

var InvalidRequestRegionException = class extends SSOOIDCServiceException {
  constructor(opts) {
    super({
      name: "InvalidRequestRegionException",
      $fault: "client",
      ...opts
    });
    this.name = "InvalidRequestRegionException";
    this.$fault = "client";
    Object.setPrototypeOf(this, InvalidRequestRegionException.prototype);
    this.error = opts.error;
    this.error_description = opts.error_description;
    this.endpoint = opts.endpoint;
    this.region = opts.region;
  }
};

var InvalidScopeException = class extends SSOOIDCServiceException {
  constructor(opts) {
    super({
      name: "InvalidScopeException",
      $fault: "client",
      ...opts
    });
    this.name = "InvalidScopeException";
    this.$fault = "client";
    Object.setPrototypeOf(this, InvalidScopeException.prototype);
    this.error = opts.error;
    this.error_description = opts.error_description;
  }
};

var SlowDownException = class extends SSOOIDCServiceException {
  constructor(opts) {
    super({
      name: "SlowDownException",
      $fault: "client",
      ...opts
    });
    this.name = "SlowDownException";
    this.$fault = "client";
    Object.setPrototypeOf(this, SlowDownException.prototype);
    this.error = opts.error;
    this.error_description = opts.error_description;
  }
};

var UnauthorizedClientException = class extends SSOOIDCServiceException {
  constructor(opts) {
    super({
      name: "UnauthorizedClientException",
      $fault: "client",
      ...opts
    });
    this.name = "UnauthorizedClientException";
    this.$fault = "client";
    Object.setPrototypeOf(this, UnauthorizedClientException.prototype);
    this.error = opts.error;
    this.error_description = opts.error_description;
  }
};

var UnsupportedGrantTypeException = class extends SSOOIDCServiceException {
  constructor(opts) {
    super({
      name: "UnsupportedGrantTypeException",
      $fault: "client",
      ...opts
    });
    this.name = "UnsupportedGrantTypeException";
    this.$fault = "client";
    Object.setPrototypeOf(this, UnsupportedGrantTypeException.prototype);
    this.error = opts.error;
    this.error_description = opts.error_description;
  }
};

var InvalidClientMetadataException = class extends SSOOIDCServiceException {
  constructor(opts) {
    super({
      name: "InvalidClientMetadataException",
      $fault: "client",
      ...opts
    });
    this.name = "InvalidClientMetadataException";
    this.$fault = "client";
    Object.setPrototypeOf(this, InvalidClientMetadataException.prototype);
    this.error = opts.error;
    this.error_description = opts.error_description;
  }
};

var InvalidRedirectUriException = class extends SSOOIDCServiceException {
  constructor(opts) {
    super({
      name: "InvalidRedirectUriException",
      $fault: "client",
      ...opts
    });
    this.name = "InvalidRedirectUriException";
    this.$fault = "client";
    Object.setPrototypeOf(this, InvalidRedirectUriException.prototype);
    this.error = opts.error;
    this.error_description = opts.error_description;
  }
};

// Define filter functions for handling sensitive log data
var CreateTokenRequestFilter = __name((obj) => ({
  ...obj,
  ...obj.clientSecret && { clientSecret: import_smithy_client.SENSITIVE_STRING },
  ...obj.refreshToken && { refreshToken: import_smithy_client.SENSITIVE_STRING },
  ...obj.codeVerifier && { codeVerifier: import_smithy_client.SENSITIVE_STRING }
}), "CreateTokenRequestFilter");

var CreateTokenResponseFilter = __name((obj) => ({
  ...obj,
  ...obj.accessToken && { accessToken: import_smithy_client.SENSITIVE_STRING },
  ...obj.refreshToken && { refreshToken: import_smithy_client.SENSITIVE_STRING },
  ...obj.idToken && { idToken: import_smithy_client.SENSITIVE_STRING }
}), "CreateTokenResponseFilter");

var CreateTokenWithIAMRequestFilter = __name((obj) => ({
  ...obj,
  ...obj.refreshToken && { refreshToken: import_smithy_client.SENSITIVE_STRING },
  ...obj.assertion && { assertion: import_smithy_client.SENSITIVE_STRING },
  ...obj.subjectToken && { subjectToken: import_smithy_client.SENSITIVE_STRING },
  ...obj.codeVerifier && { codeVerifier: import_smithy_client.SENSITIVE_STRING }
}), "CreateTokenWithIAMRequestFilter");

var CreateTokenWithIAMResponseFilter = __name((obj) => ({
  ...obj,
  ...obj.accessToken && { accessToken: import_smithy_client.SENSITIVE_STRING },
  ...obj.refreshToken && { refreshToken: import_smithy_client.SENSITIVE_STRING },
  ...obj.idToken && { idToken: import_smithy_client.SENSITIVE_STRING }
}), "CreateTokenWithIAMResponseFilter");

var RegisterClientResponseFilter = __name((obj) => ({
  ...obj,
  ...obj.clientSecret && { clientSecret: import_smithy_client.SENSITIVE_STRING }
}), "RegisterClientResponseFilter");

var StartDeviceAuthorizationRequestFilter = __name((obj) => ({
  ...obj,
  ...obj.clientSecret && { clientSecret: import_smithy_client.SENSITIVE_STRING }
}), "StartDeviceAuthorizationRequestFilter");

// Define serialization and deserialization for commands
var se_CreateTokenCommand = __name(async (input, context) => {
  const b = import_core.requestBuilder(input, context);
  const headers = {"content-type": "application/json"};
  b.bp("/token");
  let body = JSON.stringify(import_smithy_client.take(input, {
    clientId: [],
    clientSecret: [],
    code: [],
    codeVerifier: [],
    deviceCode: [],
    grantType: [],
    redirectUri: [],
    refreshToken: [],
    scope: (_) => import_smithy_client._json(_)
  }));
  b.m("POST").h(headers).b(body);
  return b.build();
}, "se_CreateTokenCommand");

var se_CreateTokenWithIAMCommand = __name(async (input, context) => {
  const b = import_core.requestBuilder(input, context);
  const headers = {"content-type": "application/json"};
  b.bp("/token");
  const query = import_smithy_client.map({[_ai]: [, "t"]});
  let body = JSON.stringify(import_smithy_client.take(input, {
    assertion: [],
    clientId: [],
    code: [],
    codeVerifier: [],
    grantType: [],
    redirectUri: [],
    refreshToken: [],
    requestedTokenType: [],
    scope: (_) => import_smithy_client._json(_),
    subjectToken: [],
    subjectTokenType: []
  }));
  b.m("POST").h(headers).q(query).b(body);
  return b.build();
}, "se_CreateTokenWithIAMCommand");

var se_RegisterClientCommand = __name(async (input, context) => {
  const b = import_core.requestBuilder(input, context);
  const headers = {"content-type": "application/json"};
  b.bp("/client/register");
  let body = JSON.stringify(import_smithy_client.take(input, {
    clientName: [],
    clientType: [],
    entitledApplicationArn: [],
    grantTypes: (_) => import_smithy_client._json(_),
    issuerUrl: [],
    redirectUris: (_) => import_smithy_client._json(_),
    scopes: (_) => import_smithy_client._json(_)
  }));
  b.m("POST").h(headers).b(body);
  return b.build();
}, "se_RegisterClientCommand");

var se_StartDeviceAuthorizationCommand = __name(async (input, context) => {
  const b = import_core.requestBuilder(input, context);
  const headers = {"content-type": "application/json"};
  b.bp("/device_authorization");
  let body = JSON.stringify(import_smithy_client.take(input, {
    clientId: [],
    clientSecret: [],
    startUrl: []
  }));
  b.m("POST").h(headers).b(body);
  return b.build();
}, "se_StartDeviceAuthorizationCommand");

var de_CreateTokenCommand = __name(async (output, context) => {
  if (output.statusCode !== 200 && output.statusCode >= 300) {
    return de_CommandError(output, context);
  }
  const contents = import_smithy_client.map({
    $metadata: deserializeMetadata(output)
  });
  const data = import_smithy_client.expectNonNull(import_smithy_client.expectObject(await import_core2.parseJsonBody(output.body, context)), "body");
  const doc = import_smithy_client.take(data, {
    accessToken: import_smithy_client.expectString,
    expiresIn: import_smithy_client.expectInt32,
    idToken: import_smithy_client.expectString,
    refreshToken: import_smithy_client.expectString,
    tokenType: import_smithy_client.expectString
  });
  Object.assign(contents, doc);
  return contents;
}, "de_CreateTokenCommand");

var de_CreateTokenWithIAMCommand = __name(async (output, context) => {
  if (output.statusCode !== 200 && output.statusCode >= 300) {
    return de_CommandError(output, context);
  }
  const contents = import_smithy_client.map({
    $metadata: deserializeMetadata(output)
  });
  const data = import_smithy_client.expectNonNull(import_smithy_client.expectObject(await import_core2.parseJsonBody(output.body, context)), "body");
  const doc = import_smithy_client.take(data, {
    accessToken: import_smithy_client.expectString,
    expiresIn: import_smithy_client.expectInt32,
    idToken: import_smithy_client.expectString,
    issuedTokenType: import_smithy_client.expectString,
    refreshToken: import_smithy_client.expectString,
    scope: import_smithy_client._json,
    tokenType: import_smithy_client.expectString
  });
  Object.assign(contents, doc);
  return contents;
}, "de_CreateTokenWithIAMCommand");

var de_RegisterClientCommand = __name(async (output, context) => {
  if (output.statusCode !== 200 && output.statusCode >= 300) {
    return de_CommandError(output, context);
  }
  const contents = import_smithy_client.map({
    $metadata: deserializeMetadata(output)
  });
  const data = import_smithy_client.expectNonNull(import_smithy_client.expectObject(await import_core2.parseJsonBody(output.body, context)), "body");
  const doc = import_smithy_client.take(data, {
    authorizationEndpoint: import_smithy_client.expectString,
    clientId: import_smithy_client.expectString,
    clientIdIssuedAt: import_smithy_client.expectLong,
    clientSecret: import_smithy_client.expectString,
    clientSecretExpiresAt: import_smithy_client.expectLong,
    tokenEndpoint: import_smithy_client.expectString
  });
  Object.assign(contents, doc);
  return contents;
}, "de_RegisterClientCommand");

var de_StartDeviceAuthorizationCommand = __name(async (output, context) => {
  if (output.statusCode !== 200 && output.statusCode >= 300) {
    return de_CommandError(output, context);
  }
  const contents = import_smithy_client.map({
    $metadata: deserializeMetadata(output)
  });
  const data = import_smithy_client.expectNonNull(import_smithy_client.expectObject(await import_core2.parseJsonBody(output.body, context)), "body");
  const doc = import_smithy_client.take(data, {
    deviceCode: import_smithy_client.expectString,
    expiresIn: import_smithy_client.expectInt32,
    interval: import_smithy_client.expectInt32,
    userCode: import_smithy_client.expectString,
    verificationUri: import_smithy_client.expectString,
    verificationUriComplete: import_smithy_client.expectString
  });
  Object.assign(contents, doc);
  return contents;
}, "de_StartDeviceAuthorizationCommand");

// Handle command errors by throwing specific exceptions
var de_CommandError = __name(async (output, context) => {
  const parsedOutput = {
    ...output,
    body: await import_core2.parseJsonErrorBody(output.body, context)
  };
  const errorCode = import_core2.loadRestJsonErrorCode(parsedOutput.body);
  switch (errorCode) {
    case "AccessDeniedException":
      throw await de_AccessDeniedExceptionRes(parsedOutput, context);
    case "AuthorizationPendingException":
      throw await de_AuthorizationPendingExceptionRes(parsedOutput, context);
    case "ExpiredTokenException":
      throw await de_ExpiredTokenExceptionRes(parsedOutput, context);
    case "InternalServerException":
      throw await de_InternalServerExceptionRes(parsedOutput, context);
    case "InvalidClientException":
      throw await de_InvalidClientExceptionRes(parsedOutput, context);
    case "InvalidGrantException":
      throw await de_InvalidGrantExceptionRes(parsedOutput, context);
    case "InvalidRequestException":
      throw await de_InvalidRequestExceptionRes(parsedOutput, context);
    case "InvalidScopeException":
      throw await de_InvalidScopeExceptionRes(parsedOutput, context);
    case "SlowDownException":
      throw await de_SlowDownExceptionRes(parsedOutput, context);
    case "UnauthorizedClientException":
      throw await de_UnauthorizedClientExceptionRes(parsedOutput, context);
    case "UnsupportedGrantTypeException":
      throw await de_UnsupportedGrantTypeExceptionRes(parsedOutput, context);
    case "InvalidRequestRegionException":
      throw await de_InvalidRequestRegionExceptionRes(parsedOutput, context);
    case "InvalidClientMetadataException":
      throw await de_InvalidClientMetadataExceptionRes(parsedOutput, context);
    case "InvalidRedirectUriException":
      throw await de_InvalidRedirectUriExceptionRes(parsedOutput, context);
    default:
      return throwDefaultError({
        output,
        parsedBody: parsedOutput.body,
        errorCode
      });
  }
}, "de_CommandError");

var throwDefaultError = import_smithy_client.withBaseException(SSOOIDCServiceException);
var de_AccessDeniedExceptionRes = __name(async (parsedOutput, context) => {
  const contents = import_smithy_client.map({});
  const data = parsedOutput.body;
  const doc = import_smithy_client.take(data, {
    error: import_smithy_client.expectString,
    error_description: import_smithy_client.expectString
  });
  Object.assign(contents, doc);
  const exception = new AccessDeniedException({
    $metadata: deserializeMetadata(parsedOutput),
    ...contents
  });
  return import_smithy_client.decorateServiceException(exception, parsedOutput.body);
}, "de_AccessDeniedExceptionRes");

var de_AuthorizationPendingExceptionRes = __name(async (parsedOutput, context) => {
  const contents = import_smithy_client.map({});
  const data = parsedOutput.body;
  const doc = import_smithy_client.take(data, {
    error: import_smithy_client.expectString,
    error_description: import_smithy_client.expectString
  });
  Object.assign(contents, doc);
  const exception = new AuthorizationPendingException({
    $metadata: deserializeMetadata(parsedOutput),
    ...contents
  });
  return import_smithy_client.decorateServiceException(exception, parsedOutput.body);
}, "de_AuthorizationPendingExceptionRes");

var de_ExpiredTokenExceptionRes = __name(async (parsedOutput, context) => {
  const contents = import_smithy_client.map({});
  const data = parsedOutput.body;
  const doc = import_smithy_client.take(data, {
    error: import_smithy_client.expectString,
    error_description: import_smithy_client.expectString
  });
  Object.assign(contents, doc);
  const exception = new ExpiredTokenException({
    $metadata: deserializeMetadata(parsedOutput),
    ...contents
  });
  return import_smithy_client.decorateServiceException(exception, parsedOutput.body);
}, "de_ExpiredTokenExceptionRes");

var de_InternalServerExceptionRes = __name(async (parsedOutput, context) => {
  const contents = import_smithy_client.map({});
  const data = parsedOutput.body;
  const doc = import_smithy_client.take(data, {
    error: import_smithy_client.expectString,
    error_description: import_smithy_client.expectString
  });
  Object.assign(contents, doc);
  const exception = new InternalServerException({
    $metadata: deserializeMetadata(parsedOutput),
    ...contents
  });
  return import_smithy_client.decorateServiceException(exception, parsedOutput.body);
}, "de_InternalServerExceptionRes");

var de_InvalidClientExceptionRes = __name(async (parsedOutput, context) => {
  const contents = import_smithy_client.map({});
  const data = parsedOutput.body;
  const doc = import_smithy_client.take(data, {
    error: import_smithy_client.expectString,
    error_description: import_smithy_client.expectString
  });
  Object.assign(contents, doc);
  const exception = new InvalidClientException({
    $metadata: deserializeMetadata(parsedOutput),
    ...contents
  });
  return import_smithy_client.decorateServiceException(exception, parsedOutput.body);
}, "de_InvalidClientExceptionRes");

var de_InvalidClientMetadataExceptionRes = __name(async (parsedOutput, context) => {
  const contents = import_smithy_client.map({});
  const data = parsedOutput.body;
  const doc = import_smithy_client.take(data, {
    error: import_smithy_client.expectString,
    error_description: import_smithy_client.expectString
  });
  Object.assign(contents, doc);
  const exception = new InvalidClientMetadataException({
    $metadata: deserializeMetadata(parsedOutput),
    ...contents
  });
  return import_smithy_client.decorateServiceException(exception, parsedOutput.body);
}, "de_InvalidClientMetadataExceptionRes");

var de_InvalidGrantExceptionRes = __name(async (parsedOutput, context) => {
  const contents = import_smithy_client.map({});
  const data = parsedOutput.body;
  const doc = import_smithy_client.take(data, {
    error: import_smithy_client.expectString,
    error_description: import_smithy_client.expectString
  });
  Object.assign(contents, doc);
  const exception = new InvalidGrantException({
    $metadata: deserializeMetadata(parsedOutput),
    ...contents
  });
  return import_smithy_client.decorateServiceException(exception, parsedOutput.body);
}, "de_InvalidGrantExceptionRes");

var de_InvalidRedirectUriExceptionRes = __name(async (parsedOutput, context) => {
  const contents = import_smithy_client.map({});
  const data = parsedOutput.body;
  const doc = import_smithy_client.take(data, {
    error: import_smithy_client.expectString,
    error_description: import_smithy_client.expectString
  });
  Object.assign(contents, doc);
  const exception = new InvalidRedirectUriException({
    $metadata: deserializeMetadata(parsedOutput),
    ...contents
  });
  return import_smithy_client.decorateServiceException(exception, parsedOutput.body);
}, "de_InvalidRedirectUriExceptionRes");

var de_InvalidRequestExceptionRes = __name(async (parsedOutput, context) => {
  const contents = import_smithy_client.map({});
  const data = parsedOutput.body;
  const doc = import_smithy_client.take(data, {
    error: import_smithy_client.expectString,
    error_description: import_smithy_client.expectString
  });
  Object.assign(contents, doc);
  const exception = new InvalidRequestException({
    $metadata: deserializeMetadata(parsedOutput),
    ...contents
  });
  return import_smithy_client.decorateServiceException(exception, parsedOutput.body);
}, "de_InvalidRequestExceptionRes");

var de_InvalidRequestRegionExceptionRes = __name(async (parsedOutput, context) => {
  const contents = import_smithy_client.map({});
  const data = parsedOutput.body;
  const doc = import_smithy_client.take(data, {
    endpoint: import_smithy_client.expectString,
    error: import_smithy_client.expectString,
    error_description: import_smithy_client.expectString,
    region: import_smithy_client.expectString
  });
  Object.assign(contents, doc);
  const exception = new InvalidRequestRegionException({
    $metadata: deserializeMetadata(parsedOutput),
    ...contents
  });
  return import_smithy_client.decorateServiceException(exception, parsedOutput.body);
}, "de_InvalidRequestRegionExceptionRes");

var de_InvalidScopeExceptionRes = __name(async (parsedOutput, context) => {
  const contents = import_smithy_client.map({});
  const data = parsedOutput.body;
  const doc = import_smithy_client.take(data, {
    error: import_smithy_client.expectString,
    error_description: import_smithy_client.expectString
  });
  Object.assign(contents, doc);
  const exception = new InvalidScopeException({
    $metadata: deserializeMetadata(parsedOutput),
    ...contents
  });
  return import_smithy_client.decorateServiceException(exception, parsedOutput.body);
}, "de_InvalidScopeExceptionRes");

var de_SlowDownExceptionRes = __name(async (parsedOutput, context) => {
  const contents = import_smithy_client.map({});
  const data = parsedOutput.body;
  const doc = import_smithy_client.take(data, {
    error: import_smithy_client.expectString,
    error_description: import_smithy_client.expectString
  });
  Object.assign(contents, doc);
  const exception = new SlowDownException({
    $metadata: deserializeMetadata(parsedOutput),
    ...contents
  });
  return import_smithy_client.decorateServiceException(exception, parsedOutput.body);
}, "de_SlowDownExceptionRes");

var de_UnauthorizedClientExceptionRes = __name(async (parsedOutput, context) => {
  const contents = import_smithy_client.map({});
  const data = parsedOutput.body;
  const doc = import_smithy_client.take(data, {
    error: import_smithy_client.expectString,
    error_description: import_smithy_client.expectString
  });
  Object.assign(contents, doc);
  const exception = new UnauthorizedClientException({
    $metadata: deserializeMetadata(parsedOutput),
    ...contents
  });
  return import_smithy_client.decorateServiceException(exception, parsedOutput.body);
}, "de_UnauthorizedClientExceptionRes");

var de_UnsupportedGrantTypeExceptionRes = __name(async (parsedOutput, context) => {
  const contents = import_smithy_client.map({});
  const data = parsedOutput.body;
  const doc = import_smithy_client.take(data, {
    error: import_smithy_client.expectString,
    error_description: import_smithy_client.expectString
  });
  Object.assign(contents, doc);
  const exception = new UnsupportedGrantTypeException({
    $metadata: deserializeMetadata(parsedOutput),
    ...contents
  });
  return import_smithy_client.decorateServiceException(exception, parsedOutput.body);
}, "de_UnsupportedGrantTypeExceptionRes");

// Helper function for metadata deserialization
var deserializeMetadata = __name((output) => ({
  httpStatusCode: output.statusCode,
  requestId: output.headers["x-amzn-requestid"] ?? output.headers["x-amzn-request-id"] ?? output.headers["x-amz-request-id"],
  extendedRequestId: output.headers["x-amz-id-2"],
  cfId: output.headers["x-amz-cf-id"]
}), "deserializeMetadata");

var _ai = "aws_iam";

// Define Commands
var CreateTokenCommand = class extends import_smithy_client.Command.classBuilder().ep(commonParams).m(function(Command, cs, config, o) {
  return [
    import_middleware_serde.getSerdePlugin(config, this.serialize, this.deserialize),
    import_middleware_endpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())
  ];
}).s("AWSSSOOIDCService", "CreateToken", {}).n("SSOOIDCClient", "CreateTokenCommand").f(CreateTokenRequestFilter, CreateTokenResponseFilter).ser(se_CreateTokenCommand).de(de_CreateTokenCommand).build() {};

var CreateTokenWithIAMCommand = class extends import_smithy_client.Command.classBuilder().ep(commonParams).m(function(Command, cs, config, o) {
  return [
    import_middleware_serde.getSerdePlugin(config, this.serialize, this.deserialize),
    import_middleware_endpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())
  ];
}).s("AWSSSOOIDCService", "CreateTokenWithIAM", {}).n("SSOOIDCClient", "CreateTokenWithIAMCommand").f(CreateTokenWithIAMRequestFilter, CreateTokenWithIAMResponseFilter).ser(se_CreateTokenWithIAMCommand).de(de_CreateTokenWithIAMCommand).build() {};

var RegisterClientCommand = class extends import_smithy_client.Command.classBuilder().ep(commonParams).m(function(Command, cs, config, o) {
  return [
    import_middleware_serde.getSerdePlugin(config, this.serialize, this.deserialize),
    import_middleware_endpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())
  ];
}).s("AWSSSOOIDCService", "RegisterClient", {}).n("SSOOIDCClient", "RegisterClientCommand").f(void 0, RegisterClientResponseFilter).ser(se_RegisterClientCommand).de(de_RegisterClientCommand).build() {};

var StartDeviceAuthorizationCommand = class extends import_smithy_client.Command.classBuilder().ep(commonParams).m(function(Command, cs, config, o) {
  return [
    import_middleware_serde.getSerdePlugin(config, this.serialize, this.deserialize),
    import_middleware_endpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())
  ];
}).s("AWSSSOOIDCService", "StartDeviceAuthorization", {}).n("SSOOIDCClient", "StartDeviceAuthorizationCommand").f(StartDeviceAuthorizationRequestFilter, void 0).ser(se_StartDeviceAuthorizationCommand).de(de_StartDeviceAuthorizationCommand).build() {};

// Define SSOOIDC class
var SSOOIDC = class extends SSOOIDCClient {
};

// Create aggregated client
import_smithy_client.createAggregatedClient({
  CreateTokenCommand,
  CreateTokenWithIAMCommand,
  RegisterClientCommand,
  StartDeviceAuthorizationCommand
}, SSOOIDC);

// Export annotations for ESM
0 && (module.exports = {
  SSOOIDCServiceException,
  __Client,
  SSOOIDCClient,
  SSOOIDC,
  $Command,
  CreateTokenCommand,
  CreateTokenWithIAMCommand,
  RegisterClientCommand,
  StartDeviceAuthorizationCommand,
  AccessDeniedException,
  AuthorizationPendingException,
  ExpiredTokenException,
  InternalServerException,
  InvalidClientException,
  InvalidGrantException,
  InvalidRequestException,
  InvalidScopeException,
  SlowDownException,
  UnauthorizedClientException,
  UnsupportedGrantTypeException,
  InvalidRequestRegionException,
  InvalidClientMetadataException,
  InvalidRedirectUriException,
  CreateTokenRequestFilter,
  CreateTokenResponseFilter,
  CreateTokenWithIAMRequestFilter,
  CreateTokenWithIAMResponseFilter,
  RegisterClientResponseFilter,
  StartDeviceAuthorizationRequestFilter
});
