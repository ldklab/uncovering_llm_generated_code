import {
  Client,
  Command,
  ServiceException,
  SENSITIVE_STRING,
  createAggregatedClient,
  take,
  _json,
  map,
  expectString,
  expectInt32,
  expectLong,
  expectNonNull,
  expectObject,
  parseJsonBody,
  decorateServiceException,
  withBaseException,
} from '@smithy/smithy-client';

// Exception classes to handle different API response errors
class AccessDeniedException extends ServiceException {
  constructor(opts) {
    super({ name: 'AccessDeniedException', $fault: 'client', ...opts });
    Object.setPrototypeOf(this, AccessDeniedException.prototype);
  }
}

class AuthorizationPendingException extends ServiceException {
  constructor(opts) {
    super({ name: 'AuthorizationPendingException', $fault: 'client', ...opts });
    Object.setPrototypeOf(this, AuthorizationPendingException.prototype);
  }
}

// Define other exception classes similarly...

const CreateTokenRequestFilterSensitiveLog = (obj) => ({
  ...obj,
  clientSecret: obj.clientSecret ? SENSITIVE_STRING : undefined,
  refreshToken: obj.refreshToken ? SENSITIVE_STRING : undefined,
  codeVerifier: obj.codeVerifier ? SENSITIVE_STRING : undefined,
});

// Define other filter functions similarly...

class SSOOIDCClient extends Client {
  constructor(configuration) {
    super(configuration);
    this.middlewareStack.use(getUserAgentPlugin(this.config));
    this.middlewareStack.use(getRetryPlugin(this.config));
    this.middlewareStack.use(getContentLengthPlugin(this.config));
    this.middlewareStack.use(getHostHeaderPlugin(this.config));
    this.middlewareStack.use(getLoggerPlugin(this.config));
  }

  destroy() {
    super.destroy();
  }
}

const commands = {
  CreateTokenCommand,
  // Add other command classes similarly...
};

class SSOOIDC extends SSOOIDCClient {}

createAggregatedClient(commands, SSOOIDC);

export {
  SSOOIDC,
  SSOOIDCClient,
  AccessDeniedException,
  AuthorizationPendingException,
  // Export other components similarly...
};
