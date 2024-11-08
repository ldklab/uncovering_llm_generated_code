"use strict";

// Utility functions for property and module management
var defineProperty = Object.defineProperty;
var getPropertyDescriptor = Object.getOwnPropertyDescriptor;
var getPropertyNames = Object.getOwnPropertyNames;
var hasOwn = Object.prototype.hasOwnProperty;

// Define and export properties
var exportModule = (target, all) => {
  for (var name in all) 
    defineProperty(target, name, { get: all[name], enumerable: true });
};

// Copy properties, handling exceptions and descriptors
var copyProperties = (to, from, exception, desc) => {
  if (from && (typeof from === "object" || typeof from === "function")) {
    for (let key of getPropertyNames(from))
      if (!hasOwn.call(to, key) && key !== exception)
        defineProperty(to, key, { get: () => from[key], enumerable: !(desc = getPropertyDescriptor(from, key)) || desc.enumerable });
  }
  return to;
};

// Prepare CommonJS exports
var toCommonJS = (mod) => copyProperties(defineProperty({}, "__esModule", { value: true }), mod);

// SSO OIDC Exports
var ssoExports = {};
exportModule(ssoExports, {
  AccessDeniedException: () => AccessDeniedException,
  AuthorizationPendingException: () => AuthorizationPendingException,
  CreateTokenCommand: () => CreateTokenCommand,
  // ... [other exports] ...
  SSOOIDCClient: () => SSOOIDCClient,
  SSOOIDCServiceException: () => SSOOIDCServiceException,
  StartDeviceAuthorizationCommand: () => StartDeviceAuthorizationCommand,
  // ... [other exports] ...
});

module.exports = toCommonJS(ssoExports);

// Import necessary AWS SDK plugins and configurations
const { Client } = require("@smithy/smithy-client");
const { resolveRegionConfig } = require("@smithy/config-resolver");
const { resolveUserAgentConfig } = require("@aws-sdk/middleware-user-agent");
// ... [other required imports] ...

// SSOOIDCClient class definition
class SSOOIDCClient extends Client {
  constructor(configuration) {
    const config0 = getRuntimeConfig(configuration || {});
    const config1 = resolveClientEndpointParameters(config0);
    const config2 = resolveUserAgentConfig(config1);
    const config3 = resolveRetryConfig(config2);
    const config4 = resolveRegionConfig(config3);
    const config5 = resolveHostHeaderConfig(config4);
    const config6 = resolveEndpointConfig(config5);
    const config7 = resolveHttpAuthSchemeConfig(config6);
    const finalConfig = resolveRuntimeExtensions(config7, configuration?.extensions || []);

    super(finalConfig);
    this.config = finalConfig;

    // Middleware stack configurations
    this.middlewareStack.use(getUserAgentPlugin(this.config));
    // ... [additional middleware plugins] ...
  }

  destroy() {
    super.destroy();
  }
}

// Define and export additional components and commands
class SSOOIDCServiceException extends ServiceException {
  constructor(options) {
    super(options);
    Object.setPrototypeOf(this, SSOOIDCServiceException.prototype);
  }
}

class AccessDeniedException extends SSOOIDCServiceException {
  constructor(options) {
    super({ name: "AccessDeniedException", $fault: "client", ...options });
    this.name = "AccessDeniedException";
    this.$fault = "client";
    Object.setPrototypeOf(this, AccessDeniedException.prototype);
  }
}

// Further command implementations, exception classes, and serialization/deserialization logic
class CreateTokenCommand extends Command {
  // ... [command implementation] ...
}

// ... [other commands and classes] ...

0 && (module.exports = {
  SSOOIDCClient,
  AccessDeniedException,
  CreateTokenCommand,
  // ... [other exports] ...
});
