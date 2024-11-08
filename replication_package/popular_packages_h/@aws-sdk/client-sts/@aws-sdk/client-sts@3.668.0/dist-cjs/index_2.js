"use strict";

// Utility functions for object property manipulation
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;

// Function for defining object properties with configurable names
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// Function for exporting properties of an object
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// Function to copy properties from one object to another, with exceptions
var __copyProps = (to, from, except, desc) => {
  if (from && (typeof from === "object" || typeof from === "function")) {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};

// Re-export function for CommonJS modules
var __reExport = (target, mod, secondTarget) => (__copyProps(target, mod, "default"), secondTarget && __copyProps(secondTarget, mod, "default"));

// Convert module to CommonJS module
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// Main export object
var src_exports = {};

// Export various AWS STS commands and functions
__export(src_exports, {
  AssumeRoleCommand: () => AssumeRoleCommand,
  AssumeRoleResponseFilterSensitiveLog: () => AssumeRoleResponseFilterSensitiveLog,
  AssumeRoleWithSAMLCommand: () => AssumeRoleWithSAMLCommand,
  AssumeRoleWithSAMLRequestFilterSensitiveLog: () => AssumeRoleWithSAMLRequestFilterSensitiveLog,
  AssumeRoleWithSAMLResponseFilterSensitiveLog: () => AssumeRoleWithSAMLResponseFilterSensitiveLog,
  AssumeRoleWithWebIdentityCommand: () => AssumeRoleWithWebIdentityCommand,
  AssumeRoleWithWebIdentityRequestFilterSensitiveLog: () => AssumeRoleWithWebIdentityRequestFilterSensitiveLog,
  AssumeRoleWithWebIdentityResponseFilterSensitiveLog: () => AssumeRoleWithWebIdentityResponseFilterSensitiveLog,
  ClientInputEndpointParameters: () => import_EndpointParameters9.ClientInputEndpointParameters,
  CredentialsFilterSensitiveLog: () => CredentialsFilterSensitiveLog,
  DecodeAuthorizationMessageCommand: () => DecodeAuthorizationMessageCommand,
  ExpiredTokenException: () => ExpiredTokenException,
  GetAccessKeyInfoCommand: () => GetAccessKeyInfoCommand,
  GetCallerIdentityCommand: () => GetCallerIdentityCommand,
  GetFederationTokenCommand: () => GetFederationTokenCommand,
  GetFederationTokenResponseFilterSensitiveLog: () => GetFederationTokenResponseFilterSensitiveLog,
  GetSessionTokenCommand: () => GetSessionTokenCommand,
  GetSessionTokenResponseFilterSensitiveLog: () => GetSessionTokenResponseFilterSensitiveLog,
  IDPCommunicationErrorException: () => IDPCommunicationErrorException,
  IDPRejectedClaimException: () => IDPRejectedClaimException,
  InvalidAuthorizationMessageException: () => InvalidAuthorizationMessageException,
  InvalidIdentityTokenException: () => InvalidIdentityTokenException,
  MalformedPolicyDocumentException: () => MalformedPolicyDocumentException,
  PackedPolicyTooLargeException: () => PackedPolicyTooLargeException,
  RegionDisabledException: () => RegionDisabledException,
  STS: () => STS,
  STSServiceException: () => STSServiceException,
  decorateDefaultCredentialProvider: () => decorateDefaultCredentialProvider,
  getDefaultRoleAssumer: () => getDefaultRoleAssumer2,
  getDefaultRoleAssumerWithWebIdentity: () => getDefaultRoleAssumerWithWebIdentity2
});

// Export the module
module.exports = __toCommonJS(src_exports);

// Re-Export from another module for STSClient
__reExport(src_exports, require("././STSClient"), module.exports);

// Core imports for STS client setup
var import_middleware_endpoint = require("@smithy/middleware-endpoint");
var import_middleware_serde = require("@smithy/middleware-serde");
var import_EndpointParameters = require("./endpoint/EndpointParameters");

// Import exceptions from the client
var import_smithy_client = require("@smithy/smithy-client");

// Base service exception class for STS Service
var _STSServiceException = class extends import_smithy_client.ServiceException {
  constructor(options) {
    super(options);
    Object.setPrototypeOf(this, _STSServiceException.prototype);
  }
};
__name(_STSServiceException, "STSServiceException");

// Export the base exception class
var STSServiceException = _STSServiceException;

// Define and export various STS exceptions
var _ExpiredTokenException = class extends STSServiceException {
  constructor(opts) {
    super({
      name: "ExpiredTokenException",
      $fault: "client",
      ...opts
    });
    this.name = "ExpiredTokenException";
    this.$fault = "client";
    Object.setPrototypeOf(this, _ExpiredTokenException.prototype);
  }
};
__name(_ExpiredTokenException, "ExpiredTokenException");
var ExpiredTokenException = _ExpiredTokenException;

var _MalformedPolicyDocumentException = class extends STSServiceException {
  constructor(opts) {
    super({
      name: "MalformedPolicyDocumentException",
      $fault: "client",
      ...opts
    });
    this.name = "MalformedPolicyDocumentException";
    this.$fault = "client";
    Object.setPrototypeOf(this, _MalformedPolicyDocumentException.prototype);
  }
};
__name(_MalformedPolicyDocumentException, "MalformedPolicyDocumentException");
var MalformedPolicyDocumentException = _MalformedPolicyDocumentException;

var _PackedPolicyTooLargeException = class extends STSServiceException {
  constructor(opts) {
    super({
      name: "PackedPolicyTooLargeException",
      $fault: "client",
      ...opts
    });
    this.name = "PackedPolicyTooLargeException";
    this.$fault = "client";
    Object.setPrototypeOf(this, _PackedPolicyTooLargeException.prototype);
  }
};
__name(_PackedPolicyTooLargeException, "PackedPolicyTooLargeException");
var PackedPolicyTooLargeException = _PackedPolicyTooLargeException;

var _RegionDisabledException = class extends STSServiceException {
  constructor(opts) {
    super({
      name: "RegionDisabledException",
      $fault: "client",
      ...opts
    });
    this.name = "RegionDisabledException";
    this.$fault = "client";
    Object.setPrototypeOf(this, _RegionDisabledException.prototype);
  }
};
__name(_RegionDisabledException, "RegionDisabledException");
var RegionDisabledException = _RegionDisabledException;

// Further custom STS exceptions
var _IDPRejectedClaimException = class extends STSServiceException {
  constructor(opts) {
    super({
      name: "IDPRejectedClaimException",
      $fault: "client",
      ...opts
    });
    this.name = "IDPRejectedClaimException";
    this.$fault = "client";
    Object.setPrototypeOf(this, _IDPRejectedClaimException.prototype);
  }
};
__name(_IDPRejectedClaimException, "IDPRejectedClaimException");
var IDPRejectedClaimException = _IDPRejectedClaimException;

var _InvalidIdentityTokenException = class extends STSServiceException {
  constructor(opts) {
    super({
      name: "InvalidIdentityTokenException",
      $fault: "client",
      ...opts
    });
    this.name = "InvalidIdentityTokenException";
    this.$fault = "client";
    Object.setPrototypeOf(this, _InvalidIdentityTokenException.prototype);
  }
};
__name(_InvalidIdentityTokenException, "InvalidIdentityTokenException");
var InvalidIdentityTokenException = _InvalidIdentityTokenException;

var _IDPCommunicationErrorException = class extends STSServiceException {
  constructor(opts) {
    super({
      name: "IDPCommunicationErrorException",
      $fault: "client",
      ...opts
    });
    this.name = "IDPCommunicationErrorException";
    this.$fault = "client";
    Object.setPrototypeOf(this, _IDPCommunicationErrorException.prototype);
  }
};
__name(_IDPCommunicationErrorException, "IDPCommunicationErrorException");
var IDPCommunicationErrorException = _IDPCommunicationErrorException;

var _InvalidAuthorizationMessageException = class extends STSServiceException {
  constructor(opts) {
    super({
      name: "InvalidAuthorizationMessageException",
      $fault: "client",
      ...opts
    });
    this.name = "InvalidAuthorizationMessageException";
    this.$fault = "client";
    Object.setPrototypeOf(this, _InvalidAuthorizationMessageException.prototype);
  }
};
__name(_InvalidAuthorizationMessageException, "InvalidAuthorizationMessageException");
var InvalidAuthorizationMessageException = _InvalidAuthorizationMessageException;

// Functions dealing with sensitive logging
var CredentialsFilterSensitiveLog = __name((obj) => ({
  ...obj,
  ...obj.SecretAccessKey && { SecretAccessKey: import_smithy_client.SENSITIVE_STRING }
}), "CredentialsFilterSensitiveLog");

var AssumeRoleResponseFilterSensitiveLog = __name((obj) => ({
  ...obj,
  ...obj.Credentials && { Credentials: CredentialsFilterSensitiveLog(obj.Credentials) }
}), "AssumeRoleResponseFilterSensitiveLog");

var AssumeRoleWithSAMLRequestFilterSensitiveLog = __name((obj) => ({
  ...obj,
  ...obj.SAMLAssertion && { SAMLAssertion: import_smithy_client.SENSITIVE_STRING }
}), "AssumeRoleWithSAMLRequestFilterSensitiveLog");

var AssumeRoleWithSAMLResponseFilterSensitiveLog = __name((obj) => ({
  ...obj,
  ...obj.Credentials && { Credentials: CredentialsFilterSensitiveLog(obj.Credentials) }
}), "AssumeRoleWithSAMLResponseFilterSensitiveLog");

var AssumeRoleWithWebIdentityRequestFilterSensitiveLog = __name((obj) => ({
  ...obj,
  ...obj.WebIdentityToken && { WebIdentityToken: import_smithy_client.SENSITIVE_STRING }
}), "AssumeRoleWithWebIdentityRequestFilterSensitiveLog");

var AssumeRoleWithWebIdentityResponseFilterSensitiveLog = __name((obj) => ({
  ...obj,
  ...obj.Credentials && { Credentials: CredentialsFilterSensitiveLog(obj.Credentials) }
}), "AssumeRoleWithWebIdentityResponseFilterSensitiveLog");

var GetFederationTokenResponseFilterSensitiveLog = __name((obj) => ({
  ...obj,
  ...obj.Credentials && { Credentials: CredentialsFilterSensitiveLog(obj.Credentials) }
}), "GetFederationTokenResponseFilterSensitiveLog");

var GetSessionTokenResponseFilterSensitiveLog = __name((obj) => ({
  ...obj,
  ...obj.Credentials && { Credentials: CredentialsFilterSensitiveLog(obj.Credentials) }
}), "GetSessionTokenResponseFilterSensitiveLog");

// Protocols and HTTP Imports
var import_core = require("@aws-sdk/core");
var import_protocol_http = require("@smithy/protocol-http");

// Functionality for building STS Commands (Serialization)
var se_AssumeRoleCommand = __name(async (input, context) => {
  const headers = SHARED_HEADERS;
  let body;
  body = buildFormUrlencodedString({
    ...se_AssumeRoleRequest(input, context),
    [_A]: _AR,
    [_V]: _
  });
  return buildHttpRpcRequest(context, headers, "/", void 0, body);
}, "se_AssumeRoleCommand");

var se_AssumeRoleWithSAMLCommand = __name(async (input, context) => {
  const headers = SHARED_HEADERS;
  let body;
  body = buildFormUrlencodedString({
    ...se_AssumeRoleWithSAMLRequest(input, context),
    [_A]: _ARWSAML,
    [_V]: _
  });
  return buildHttpRpcRequest(context, headers, "/", void 0, body);
}, "se_AssumeRoleWithSAMLCommand");

var se_AssumeRoleWithWebIdentityCommand = __name(async (input, context) => {
  const headers = SHARED_HEADERS;
  let body;
  body = buildFormUrlencodedString({
    ...se_AssumeRoleWithWebIdentityRequest(input, context),
    [_A]: _ARWWI,
    [_V]: _
  });
  return buildHttpRpcRequest(context, headers, "/", void 0, body);
}, "se_AssumeRoleWithWebIdentityCommand");

var se_DecodeAuthorizationMessageCommand = __name(async (input, context) => {
  const headers = SHARED_HEADERS;
  let body;
  body = buildFormUrlencodedString({
    ...se_DecodeAuthorizationMessageRequest(input, context),
    [_A]: _DAM,
    [_V]: _
  });
  return buildHttpRpcRequest(context, headers, "/", void 0, body);
}, "se_DecodeAuthorizationMessageCommand");

var se_GetAccessKeyInfoCommand = __name(async (input, context) => {
  const headers = SHARED_HEADERS;
  let body;
  body = buildFormUrlencodedString({
    ...se_GetAccessKeyInfoRequest(input, context),
    [_A]: _GAKI,
    [_V]: _
  });
  return buildHttpRpcRequest(context, headers, "/", void 0, body);
}, "se_GetAccessKeyInfoCommand");

var se_GetCallerIdentityCommand = __name(async (input, context) => {
  const headers = SHARED_HEADERS;
  let body;
  body = buildFormUrlencodedString({
    ...se_GetCallerIdentityRequest(input, context),
    [_A]: _GCI,
    [_V]: _
  });
  return buildHttpRpcRequest(context, headers, "/", void 0, body);
}, "se_GetCallerIdentityCommand");

var se_GetFederationTokenCommand = __name(async (input, context) => {
  const headers = SHARED_HEADERS;
  let body;
  body = buildFormUrlencodedString({
    ...se_GetFederationTokenRequest(input, context),
    [_A]: _GFT,
    [_V]: _
  });
  return buildHttpRpcRequest(context, headers, "/", void 0, body);
}, "se_GetFederationTokenCommand");

var se_GetSessionTokenCommand = __name(async (input, context) => {
  const headers = SHARED_HEADERS;
  let body;
  body = buildFormUrlencodedString({
    ...se_GetSessionTokenRequest(input, context),
    [_A]: _GST,
    [_V]: _
  });
  return buildHttpRpcRequest(context, headers, "/", void 0, body);
}, "se_GetSessionTokenCommand");

// Functionality for parsing STS Commands' Responses (Deserialization)
var de_AssumeRoleCommand = __name(async (output, context) => {
  if (output.statusCode >= 300) {
    return de_CommandError(output, context);
  }
  const data = await import_core.parseXmlBody(output.body, context);
  let contents = {};
  contents = de_AssumeRoleResponse(data.AssumeRoleResult, context);
  const response = {
    $metadata: deserializeMetadata(output),
    ...contents
  };
  return response;
}, "de_AssumeRoleCommand");

var de_AssumeRoleWithSAMLCommand = __name(async (output, context) => {
  if (output.statusCode >= 300) {
    return de_CommandError(output, context);
  }
  const data = await import_core.parseXmlBody(output.body, context);
  let contents = {};
  contents = de_AssumeRoleWithSAMLResponse(data.AssumeRoleWithSAMLResult, context);
  const response = {
    $metadata: deserializeMetadata(output),
    ...contents
  };
  return response;
}, "de_AssumeRoleWithSAMLCommand");

var de_AssumeRoleWithWebIdentityCommand = __name(async (output, context) => {
  if (output.statusCode >= 300) {
    return de_CommandError(output, context);
  }
  const data = await import_core.parseXmlBody(output.body, context);
  let contents = {};
  contents = de_AssumeRoleWithWebIdentityResponse(data.AssumeRoleWithWebIdentityResult, context);
  const response = {
    $metadata: deserializeMetadata(output),
    ...contents
  };
  return response;
}, "de_AssumeRoleWithWebIdentityCommand");

var de_DecodeAuthorizationMessageCommand = __name(async (output, context) => {
  if (output.statusCode >= 300) {
    return de_CommandError(output, context);
  }
  const data = await import_core.parseXmlBody(output.body, context);
  let contents = {};
  contents = de_DecodeAuthorizationMessageResponse(data.DecodeAuthorizationMessageResult, context);
  const response = {
    $metadata: deserializeMetadata(output),
    ...contents
  };
  return response;
}, "de_DecodeAuthorizationMessageCommand");

var de_GetAccessKeyInfoCommand = __name(async (output, context) => {
  if (output.statusCode >= 300) {
    return de_CommandError(output, context);
  }
  const data = await import_core.parseXmlBody(output.body, context);
  let contents = {};
  contents = de_GetAccessKeyInfoResponse(data.GetAccessKeyInfoResult, context);
  const response = {
    $metadata: deserializeMetadata(output),
    ...contents
  };
  return response;
}, "de_GetAccessKeyInfoCommand");

var de_GetCallerIdentityCommand = __name(async (output, context) => {
  if (output.statusCode >= 300) {
    return de_CommandError(output, context);
  }
  const data = await import_core.parseXmlBody(output.body, context);
  let contents = {};
  contents = de_GetCallerIdentityResponse(data.GetCallerIdentityResult, context);
  const response = {
    $metadata: deserializeMetadata(output),
    ...contents
  };
  return response;
}, "de_GetCallerIdentityCommand");

var de_GetFederationTokenCommand = __name(async (output, context) => {
  if (output.statusCode >= 300) {
    return de_CommandError(output, context);
  }
  const data = await import_core.parseXmlBody(output.body, context);
  let contents = {};
  contents = de_GetFederationTokenResponse(data.GetFederationTokenResult, context);
  const response = {
    $metadata: deserializeMetadata(output),
    ...contents
  };
  return response;
}, "de_GetFederationTokenCommand");

var de_GetSessionTokenCommand = __name(async (output, context) => {
  if (output.statusCode >= 300) {
    return de_CommandError(output, context);
  }
  const data = await import_core.parseXmlBody(output.body, context);
  let contents = {};
  contents = de_GetSessionTokenResponse(data.GetSessionTokenResult, context);
  const response = {
    $metadata: deserializeMetadata(output),
    ...contents
  };
  return response;
}, "de_GetSessionTokenCommand");

// Error handling for deserialization process
var de_CommandError = __name(async (output, context) => {
  const parsedOutput = {
    ...output,
    body: await import_core.parseXmlErrorBody(output.body, context)
  };
  const errorCode = loadQueryErrorCode(output, parsedOutput.body);
  switch (errorCode) {
    case "ExpiredTokenException":
    case "com.amazonaws.sts#ExpiredTokenException":
      throw await de_ExpiredTokenExceptionRes(parsedOutput, context);
    case "MalformedPolicyDocument":
    case "com.amazonaws.sts#MalformedPolicyDocumentException":
      throw await de_MalformedPolicyDocumentExceptionRes(parsedOutput, context);
    case "PackedPolicyTooLarge":
    case "com.amazonaws.sts#PackedPolicyTooLargeException":
      throw await de_PackedPolicyTooLargeExceptionRes(parsedOutput, context);
    case "RegionDisabledException":
    case "com.amazonaws.sts#RegionDisabledException":
      throw await de_RegionDisabledExceptionRes(parsedOutput, context);
    case "IDPRejectedClaim":
    case "com.amazonaws.sts#IDPRejectedClaimException":
      throw await de_IDPRejectedClaimExceptionRes(parsedOutput, context);
    case "InvalidIdentityToken":
    case "com.amazonaws.sts#InvalidIdentityTokenException":
      throw await de_InvalidIdentityTokenExceptionRes(parsedOutput, context);
    case "IDPCommunicationError":
    case "com.amazonaws.sts#IDPCommunicationErrorException":
      throw await de_IDPCommunicationErrorExceptionRes(parsedOutput, context);
    case "InvalidAuthorizationMessageException":
    case "com.amazonaws.sts#InvalidAuthorizationMessageException":
      throw await de_InvalidAuthorizationMessageExceptionRes(parsedOutput, context);
    default:
      const parsedBody = parsedOutput.body;
      return throwDefaultError({
        output,
        parsedBody: parsedBody.Error,
        errorCode
      });
  }
}, "de_CommandError");

// Specific error deserialization for ExpiredTokenException
var de_ExpiredTokenExceptionRes = __name(async (parsedOutput, context) => {
  const body = parsedOutput.body;
  const deserialized = de_ExpiredTokenException(body.Error, context);
  const exception = new ExpiredTokenException({
    $metadata: deserializeMetadata(parsedOutput),
    ...deserialized
  });
  return import_smithy_client.decorateServiceException(exception, body);
}, "de_ExpiredTokenExceptionRes");

// Specific error deserialization for IDPCommunicationErrorException
var de_IDPCommunicationErrorExceptionRes = __name(async (parsedOutput, context) => {
  const body = parsedOutput.body;
  const deserialized = de_IDPCommunicationErrorException(body.Error, context);
  const exception = new IDPCommunicationErrorException({
    $metadata: deserializeMetadata(parsedOutput),
    ...deserialized
  });
  return import_smithy_client.decorateServiceException(exception, body);
}, "de_IDPCommunicationErrorExceptionRes");

// Specific error deserialization for IDPRejectedClaimException
var de_IDPRejectedClaimExceptionRes = __name(async (parsedOutput, context) => {
  const body = parsedOutput.body;
  const deserialized = de_IDPRejectedClaimException(body.Error, context);
  const exception = new IDPRejectedClaimException({
    $metadata: deserializeMetadata(parsedOutput),
    ...deserialized
  });
  return import_smithy_client.decorateServiceException(exception, body);
}, "de_IDPRejectedClaimExceptionRes");

// Specific error deserialization for InvalidAuthorizationMessageException
var de_InvalidAuthorizationMessageExceptionRes = __name(async (parsedOutput, context) => {
  const body = parsedOutput.body;
  const deserialized = de_InvalidAuthorizationMessageException(body.Error, context);
  const exception = new InvalidAuthorizationMessageException({
    $metadata: deserializeMetadata(parsedOutput),
    ...deserialized
  });
  return import_smithy_client.decorateServiceException(exception, body);
}, "de_InvalidAuthorizationMessageExceptionRes");

// Specific error deserialization for InvalidIdentityTokenException
var de_InvalidIdentityTokenExceptionRes = __name(async (parsedOutput, context) => {
  const body = parsedOutput.body;
  const deserialized = de_InvalidIdentityTokenException(body.Error, context);
  const exception = new InvalidIdentityTokenException({
    $metadata: deserializeMetadata(parsedOutput),
    ...deserialized
  });
  return import_smithy_client.decorateServiceException(exception, body);
}, "de_InvalidIdentityTokenExceptionRes");

// Specific error deserialization for MalformedPolicyDocumentException
var de_MalformedPolicyDocumentExceptionRes = __name(async (parsedOutput, context) => {
  const body = parsedOutput.body;
  const deserialized = de_MalformedPolicyDocumentException(body.Error, context);
  const exception = new MalformedPolicyDocumentException({
    $metadata: deserializeMetadata(parsedOutput),
    ...deserialized
  });
  return import_smithy_client.decorateServiceException(exception, body);
}, "de_MalformedPolicyDocumentExceptionRes");

// Specific error deserialization for PackedPolicyTooLargeException
var de_PackedPolicyTooLargeExceptionRes = __name(async (parsedOutput, context) => {
  const body = parsedOutput.body;
  const deserialized = de_PackedPolicyTooLargeException(body.Error, context);
  const exception = new PackedPolicyTooLargeException({
    $metadata: deserializeMetadata(parsedOutput),
    ...deserialized
  });
  return import_smithy_client.decorateServiceException(exception, body);
}, "de_PackedPolicyTooLargeExceptionRes");

// Specific error deserialization for RegionDisabledException
var de_RegionDisabledExceptionRes = __name(async (parsedOutput, context) => {
  const body = parsedOutput.body;
  const deserialized = de_RegionDisabledException(body.Error, context);
  const exception = new RegionDisabledException({
    $metadata: deserializeMetadata(parsedOutput),
    ...deserialized
  });
  return import_smithy_client.decorateServiceException(exception, body);
}, "de_RegionDisabledExceptionRes");

// Serialization request builders for various STS requests
var se_AssumeRoleRequest = __name((input, context) => {
  var _a, _b, _c, _d;
  const entries = {};
  if (input.RoleArn != null) {
    entries.RoleArn = input.RoleArn;
  }
  if (input.RoleSessionName != null) {
    entries.RoleSessionName = input.RoleSessionName;
  }
  if (input.PolicyArns != null) {
    const memberEntries = se_policyDescriptorListType(input.PolicyArns, context);
    if (((_a = input.PolicyArns) == null ? void 0 : _a.length) === 0) {
      entries.PolicyArns = [];
    }
    Object.entries(memberEntries).forEach(([key, value]) => {
      const loc = `PolicyArns.${key}`;
      entries[loc] = value;
    });
  }
  if (input.Policy != null) {
    entries.Policy = input.Policy;
  }
  if (input.DurationSeconds != null) {
    entries.DurationSeconds = input.DurationSeconds;
  }
  if (input.Tags != null) {
    const memberEntries = se_tagListType(input.Tags, context);
    if (((_b = input.Tags) == null ? void 0 : _b.length) === 0) {
      entries.Tags = [];
    }
    Object.entries(memberEntries).forEach(([key, value]) => {
      const loc = `Tags.${key}`;
      entries[loc] = value;
    });
  }
  if (input.TransitiveTagKeys != null) {
    const memberEntries = se_tagKeyListType(input.TransitiveTagKeys, context);
    if (((_c = input.TransitiveTagKeys) == null ? void 0 : _c.length) === 0) {
      entries.TransitiveTagKeys = [];
    }
    Object.entries(memberEntries).forEach(([key, value]) => {
      const loc = `TransitiveTagKeys.${key}`;
      entries[loc] = value;
    });
  }
  if (input.ExternalId != null) {
    entries.ExternalId = input.ExternalId;
  }
  if (input.SerialNumber != null) {
    entries.SerialNumber = input.SerialNumber;
  }
  if (input.TokenCode != null) {
    entries.TokenCode = input.TokenCode;
  }
  if (input.SourceIdentity != null) {
    entries.SourceIdentity = input.SourceIdentity;
  }
  if (input.ProvidedContexts != null) {
    const memberEntries = se_ProvidedContextsListType(input.ProvidedContexts, context);
    if (((_d = input.ProvidedContexts) == null ? void 0 : _d.length) === 0) {
      entries.ProvidedContexts = [];
    }
    Object.entries(memberEntries).forEach(([key, value]) => {
      const loc = `ProvidedContexts.${key}`;
      entries[loc] = value;
    });
  }
  return entries;
}, "se_AssumeRoleRequest");

var se_AssumeRoleWithSAMLRequest = __name((input, context) => {
  var _a;
  const entries = {};
  if (input.RoleArn != null) {
    entries.RoleArn = input.RoleArn;
  }
  if (input.PrincipalArn != null) {
    entries.PrincipalArn = input.PrincipalArn;
  }
  if (input.SAMLAssertion != null) {
    entries.SAMLAssertion = input.SAMLAssertion;
  }
  if (input.PolicyArns != null) {
    const memberEntries = se_policyDescriptorListType(input.PolicyArns, context);
    if (((_a = input.PolicyArns) == null ? void 0 : _a.length) === 0) {
      entries.PolicyArns = [];
    }
    Object.entries(memberEntries).forEach(([key, value]) => {
      const loc = `PolicyArns.${key}`;
      entries[loc] = value;
    });
  }
  if (input.Policy != null) {
    entries.Policy = input.Policy;
  }
  if (input.DurationSeconds != null) {
    entries.DurationSeconds = input.DurationSeconds;
  }
  return entries;
}, "se_AssumeRoleWithSAMLRequest");

var se_AssumeRoleWithWebIdentityRequest = __name((input, context) => {
  var _a;
  const entries = {};
  if (input.RoleArn != null) {
    entries.RoleArn = input.RoleArn;
  }
  if (input.RoleSessionName != null) {
    entries.RoleSessionName = input.RoleSessionName;
  }
  if (input.WebIdentityToken != null) {
    entries.WebIdentityToken = input.WebIdentityToken;
  }
  if (input.ProviderId != null) {
    entries.ProviderId = input.ProviderId;
  }
  if (input.PolicyArns != null) {
    const memberEntries = se_policyDescriptorListType(input.PolicyArns, context);
    if (((_a = input.PolicyArns) == null ? void 0 : _a.length) === 0) {
      entries.PolicyArns = [];
    }
    Object.entries(memberEntries).forEach(([key, value]) => {
      const loc = `PolicyArns.${key}`;
      entries[loc] = value;
    });
  }
  if (input.Policy != null) {
    entries.Policy = input.Policy;
  }
  if (input.DurationSeconds != null) {
    entries.DurationSeconds = input.DurationSeconds;
  }
  return entries;
}, "se_AssumeRoleWithWebIdentityRequest");

var se_DecodeAuthorizationMessageRequest = __name((input, context) => {
  const entries = {};
  if (input.EncodedMessage != null) {
    entries.EncodedMessage = input.EncodedMessage;
  }
  return entries;
}, "se_DecodeAuthorizationMessageRequest");

var se_GetAccessKeyInfoRequest = __name((input, context) => {
  const entries = {};
  if (input.AccessKeyId != null) {
    entries.AccessKeyId = input.AccessKeyId;
  }
  return entries;
}, "se_GetAccessKeyInfoRequest");

var se_GetCallerIdentityRequest = __name((input, context) => {
  const entries = {};
  return entries;
}, "se_GetCallerIdentityRequest");

var se_GetFederationTokenRequest = __name((input, context) => {
  var _a, _b;
  const entries = {};
  if (input.Name != null) {
    entries.Name = input.Name;
  }
  if (input.Policy != null) {
    entries.Policy = input.Policy;
  }
  if (input.PolicyArns != null) {
    const memberEntries = se_policyDescriptorListType(input.PolicyArns, context);
    if (((_a = input.PolicyArns) == null ? void 0 : _a.length) === 0) {
      entries.PolicyArns = [];
    }
    Object.entries(memberEntries).forEach(([key, value]) => {
      const loc = `PolicyArns.${key}`;
      entries[loc] = value;
    });
  }
  if (input.DurationSeconds != null) {
    entries.DurationSeconds = input.DurationSeconds;
  }
  if (input.Tags != null) {
    const memberEntries = se_tagListType(input.Tags, context);
    if (((_b = input.Tags) == null ? void 0 : _b.length) === 0) {
      entries.Tags = [];
    }
    Object.entries(memberEntries).forEach(([key, value]) => {
      const loc = `Tags.${key}`;
      entries[loc] = value;
    });
  }
  return entries;
}, "se_GetFederationTokenRequest");

var se_GetSessionTokenRequest = __name((input, context) => {
  const entries = {};
  if (input.DurationSeconds != null) {
    entries.DurationSeconds = input.DurationSeconds;
  }
  if (input.SerialNumber != null) {
    entries.SerialNumber = input.SerialNumber;
  }
  if (input.TokenCode != null) {
    entries.TokenCode = input.TokenCode;
  }
  return entries;
}, "se_GetSessionTokenRequest");

// Serialization helpers for various types
var se_policyDescriptorListType = __name((input, context) => {
  const entries = {};
  let counter = 1;
  for (const entry of input) {
    if (entry === null) {
      continue;
    }
    const memberEntries = se_PolicyDescriptorType(entry, context);
    Object.entries(memberEntries).forEach(([key, value]) => {
      entries[`member.${counter}.${key}`] = value;
    });
    counter++;
  }
  return entries;
}, "se_policyDescriptorListType");

var se_PolicyDescriptorType = __name((input, context) => {
  const entries = {};
  if (input.arn != null) {
    entries.arn = input.arn;
  }
  return entries;
}, "se_PolicyDescriptorType");

var se_ProvidedContext = __name((input, context) => {
  const entries = {};
  if (input.ProviderArn != null) {
    entries.ProviderArn = input.ProviderArn;
  }
  if (input.ContextAssertion != null) {
    entries.ContextAssertion = input.ContextAssertion;
  }
  return entries;
}, "se_ProvidedContext");

var se_ProvidedContextsListType = __name((input, context) => {
  const entries = {};
  let counter = 1;
  for (const entry of input) {
    if (entry === null) {
      continue;
    }
    const memberEntries = se_ProvidedContext(entry, context);
    Object.entries(memberEntries).forEach(([key, value]) => {
      entries[`member.${counter}.${key}`] = value;
    });
    counter++;
  }
  return entries;
}, "se_ProvidedContextsListType");

var se_Tag = __name((input, context) => {
  const entries = {};
  if (input.Key != null) {
    entries.Key = input.Key;
  }
  if (input.Value != null) {
    entries.Value = input.Value;
  }
  return entries;
}, "se_Tag");

var se_tagKeyListType = __name((input, context) => {
  const entries = {};
  let counter = 1;
  for (const entry of input) {
    if (entry === null) {
      continue;
    }
    entries[`member.${counter}`] = entry;
    counter++;
  }
  return entries;
}, "se_tagKeyListType");

var se_tagListType = __name((input, context) => {
  const entries = {};
  let counter = 1;
  for (const entry of input) {
    if (entry === null) {
      continue;
    }
    const memberEntries = se_Tag(entry, context);
    Object.entries(memberEntries).forEach(([key, value]) => {
      entries[`member.${counter}.${key}`] = value;
    });
    counter++;
  }
  return entries;
}, "se_tagListType");

// Deserialization helpers for various types
var de_AssumedRoleUser = __name((output, context) => {
  const contents = {};
  if (output.AssumedRoleId != null) {
    contents.AssumedRoleId = import_smithy_client.expectString(output.AssumedRoleId);
  }
  if (output.Arn != null) {
    contents.Arn = import_smithy_client.expectString(output.Arn);
  }
  return contents;
}, "de_AssumedRoleUser");

var de_AssumeRoleResponse = __name((output, context) => {
  const contents = {};
  if (output.Credentials != null) {
    contents.Credentials = de_Credentials(output.Credentials, context);
  }
  if (output.AssumedRoleUser != null) {
    contents.AssumedRoleUser = de_AssumedRoleUser(output.AssumedRoleUser, context);
  }
  if (output.PackedPolicySize != null) {
    contents.PackedPolicySize = import_smithy_client.strictParseInt32(output.PackedPolicySize);
  }
  if (output.SourceIdentity != null) {
    contents.SourceIdentity = import_smithy_client.expectString(output.SourceIdentity);
  }
  return contents;
}, "de_AssumeRoleResponse");

var de_AssumeRoleWithSAMLResponse = __name((output, context) => {
  const contents = {};
  if (output.Credentials != null) {
    contents.Credentials = de_Credentials(output.Credentials, context);
  }
  if (output.AssumedRoleUser != null) {
    contents.AssumedRoleUser = de_AssumedRoleUser(output.AssumedRoleUser, context);
  }
  if (output.PackedPolicySize != null) {
    contents.PackedPolicySize = import_smithy_client.strictParseInt32(output.PackedPolicySize);
  }
  if (output.Subject != null) {
    contents.Subject = import_smithy_client.expectString(output.Subject);
  }
  if (output.SubjectType != null) {
    contents.SubjectType = import_smithy_client.expectString(output.SubjectType);
  }
  if (output.Issuer != null) {
    contents.Issuer = import_smithy_client.expectString(output.Issuer);
  }
  if (output.Audience != null) {
    contents.Audience = import_smithy_client.expectString(output.Audience);
  }
  if (output.NameQualifier != null) {
    contents.NameQualifier = import_smithy_client.expectString(output.NameQualifier);
  }
  if (output.SourceIdentity != null) {
    contents.SourceIdentity = import_smithy_client.expectString(output.SourceIdentity);
  }
  return contents;
}, "de_AssumeRoleWithSAMLResponse");

var de_AssumeRoleWithWebIdentityResponse = __name((output, context) => {
  const contents = {};
  if (output.Credentials != null) {
    contents.Credentials = de_Credentials(output.Credentials, context);
  }
  if (output.SubjectFromWebIdentityToken != null) {
    contents.SubjectFromWebIdentityToken = import_smithy_client.expectString(output.SubjectFromWebIdentityToken);
  }
  if (output.AssumedRoleUser != null) {
    contents.AssumedRoleUser = de_AssumedRoleUser(output.AssumedRoleUser, context);
  }
  if (output.PackedPolicySize != null) {
    contents.PackedPolicySize = import_smithy_client.strictParseInt32(output.PackedPolicySize);
  }
  if (output.Provider != null) {
    contents.Provider = import_smithy_client.expectString(output.Provider);
  }
  if (output.Audience != null) {
    contents.Audience = import_smithy_client.expectString(output.Audience);
  }
  if (output.SourceIdentity != null) {
    contents.SourceIdentity = import_smithy_client.expectString(output.SourceIdentity);
  }
  return contents;
}, "de_AssumeRoleWithWebIdentityResponse");

var de_Credentials = __name((output, context) => {
  const contents = {};
  if (output.AccessKeyId != null) {
    contents.AccessKeyId = import_smithy_client.expectString(output.AccessKeyId);
  }
  if (output.SecretAccessKey != null) {
    contents.SecretAccessKey = import_smithy_client.expectString(output.SecretAccessKey);
  }
  if (output.SessionToken != null) {
    contents.SessionToken = import_smithy_client.expectString(output.SessionToken);
  }
  if (output.Expiration != null) {
    contents.Expiration = import_smithy_client.expectNonNull(import_smithy_client.parseRfc3339DateTimeWithOffset(output.Expiration));
  }
  return contents;
}, "de_Credentials");

var de_DecodeAuthorizationMessageResponse = __name((output, context) => {
  const contents = {};
  if (output.DecodedMessage != null) {
    contents.DecodedMessage = import_smithy_client.expectString(output.DecodedMessage);
  }
  return contents;
}, "de_DecodeAuthorizationMessageResponse");

var de_ExpiredTokenException = __name((output, context) => {
  const contents = {};
  if (output.message != null) {
    contents.message = import_smithy_client.expectString(output.message);
  }
  return contents;
}, "de_ExpiredTokenException");

var de_FederatedUser = __name((output, context) => {
  const contents = {};
  if (output.FederatedUserId != null) {
    contents.FederatedUserId = import_smithy_client.expectString(output.FederatedUserId);
  }
  if (output.Arn != null) {
    contents.Arn = import_smithy_client.expectString(output.Arn);
  }
  return contents;
}, "de_FederatedUser");

var de_GetAccessKeyInfoResponse = __name((output, context) => {
  const contents = {};
  if (output.Account != null) {
    contents.Account = import_smithy_client.expectString(output.Account);
  }
  return contents;
}, "de_GetAccessKeyInfoResponse");

var de_GetCallerIdentityResponse = __name((output, context) => {
  const contents = {};
  if (output.UserId != null) {
    contents.UserId = import_smithy_client.expectString(output.UserId);
  }
  if (output.Account != null) {
    contents.Account = import_smithy_client.expectString(output.Account);
  }
  if (output.Arn != null) {
    contents.Arn = import_smithy_client.expectString(output.Arn);
  }
  return contents;
}, "de_GetCallerIdentityResponse");

var de_GetFederationTokenResponse = __name((output, context) => {
  const contents = {};
  if (output.Credentials != null) {
    contents.Credentials = de_Credentials(output.Credentials, context);
  }
  if (output.FederatedUser != null) {
    contents.FederatedUser = de_FederatedUser(output.FederatedUser, context);
  }
  if (output.PackedPolicySize != null) {
    contents.PackedPolicySize = import_smithy_client.strictParseInt32(output.PackedPolicySize);
  }
  return contents;
}, "de_GetFederationTokenResponse");

var de_GetSessionTokenResponse = __name((output, context) => {
  const contents = {};
  if (output.Credentials != null) {
    contents.Credentials = de_Credentials(output.Credentials, context);
  }
  return contents;
}, "de_GetSessionTokenResponse");

var de_IDPCommunicationErrorException = __name((output, context) => {
  const contents = {};
  if (output.message != null) {
    contents.message = import_smithy_client.expectString(output.message);
  }
  return contents;
}, "de_IDPCommunicationErrorException");

var de_IDPRejectedClaimException = __name((output, context) => {
  const contents = {};
  if (output.message != null) {
    contents.message = import_smithy_client.expectString(output.message);
  }
  return contents;
}, "de_IDPRejectedClaimException");

var de_InvalidAuthorizationMessageException = __name((output, context) => {
  const contents = {};
  if (output.message != null) {
    contents.message = import_smithy_client.expectString(output.message);
  }
  return contents;
}, "de_InvalidAuthorizationMessageException");

var de_InvalidIdentityTokenException = __name((output, context) => {
  const contents = {};
  if (output.message != null) {
    contents.message = import_smithy_client.expectString(output.message);
  }
  return contents;
}, "de_InvalidIdentityTokenException");

var de_MalformedPolicyDocumentException = __name((output, context) => {
  const contents = {};
  if (output.message != null) {
    contents.message = import_smithy_client.expectString(output.message);
  }
  return contents;
}, "de_MalformedPolicyDocumentException");

var de_PackedPolicyTooLargeException = __name((output, context) => {
  const contents = {};
  if (output.message != null) {
    contents.message = import_smithy_client.expectString(output.message);
  }
  return contents;
}, "de_PackedPolicyTooLargeException");

var de_RegionDisabledException = __name((output, context) => {
  const contents = {};
  if (output.message != null) {
    contents.message = import_smithy_client.expectString(output.message);
  }
  return contents;
}, "de_RegionDisabledException");

// Helper function to deserialize metadata from HTTP output
var deserializeMetadata = __name((output) => ({
  httpStatusCode: output.statusCode,
  requestId: output.headers["x-amzn-requestid"] ?? output.headers["x-amzn-request-id"] ?? output.headers["x-amz-request-id"],
  extendedRequestId: output.headers["x-amz-id-2"],
  cfId: output.headers["x-amz-cf-id"]
}), "deserializeMetadata");

// Default error throwing function
var throwDefaultError = import_smithy_client.withBaseException(STSServiceException);

// Function to build HTTP request using RPC method
var buildHttpRpcRequest = __name(async (context, headers, path, resolvedHostname, body) => {
  const { hostname, protocol = "https", port, path: basePath } = await context.endpoint();
  const contents = {
    protocol,
    hostname,
    port,
    method: "POST",
    path: basePath.endsWith("/") ? basePath.slice(0, -1) + path : basePath + path,
    headers
  };
  if (resolvedHostname !== void 0) {
    contents.hostname = resolvedHostname;
  }
  if (body !== void 0) {
    contents.body = body;
  }
  return new import_protocol_http.HttpRequest(contents);
}, "buildHttpRpcRequest");

// Shared headers for HTTP requests
var SHARED_HEADERS = {
  "content-type": "application/x-www-form-urlencoded"
};

// Constants used in the module
var _ = "2011-06-15";
var _A = "Action";
var _AKI = "AccessKeyId";
var _AR = "AssumeRole";
var _ARI = "AssumedRoleId";
var _ARU = "AssumedRoleUser";
var _ARWSAML = "AssumeRoleWithSAML";
var _ARWWI = "AssumeRoleWithWebIdentity";
var _Ac = "Account";
var _Ar = "Arn";
var _Au = "Audience";
var _C = "Credentials";
var _CA = "ContextAssertion";
var _DAM = "DecodeAuthorizationMessage";
var _DM = "DecodedMessage";
var _DS = "DurationSeconds";
var _E = "Expiration";
var _EI = "ExternalId";
var _EM = "EncodedMessage";
var _FU = "FederatedUser";
var _FUI = "FederatedUserId";
var _GAKI = "GetAccessKeyInfo";
var _GCI = "GetCallerIdentity";
var _GFT = "GetFederationToken";
var _GST = "GetSessionToken";
var _I = "Issuer";
var _K = "Key";
var _N = "Name";
var _NQ = "NameQualifier";
var _P = "Policy";
var _PA = "PolicyArns";
var _PAr = "PrincipalArn";
var _PAro = "ProviderArn";
var _PC = "ProvidedContexts";
var _PI = "ProviderId";
var _PPS = "PackedPolicySize";
var _Pr = "Provider";
var _RA = "RoleArn";
var _RSN = "RoleSessionName";
var _S = "Subject";
var _SAK = "SecretAccessKey";
var _SAMLA = "SAMLAssertion";
var _SFWIT = "SubjectFromWebIdentityToken";
var _SI = "SourceIdentity";
var _SN = "SerialNumber";
var _ST = "SubjectType";
var _STe = "SessionToken";
var _T = "Tags";
var _TC = "TokenCode";
var _TTK = "TransitiveTagKeys";
var _UI = "UserId";
var _V = "Version";
var _Va = "Value";
var _WIT = "WebIdentityToken";
var _a = "arn";
var _m = "message";

// Function to build a URL-encoded string from form entries
var buildFormUrlencodedString = __name((formEntries) => Object.entries(formEntries).map(([key, value]) => import_smithy_client.extendedEncodeURIComponent(key) + "=" + import_smithy_client.extendedEncodeURIComponent(value)).join("&"), "buildFormUrlencodedString");

// Error code parser for query responses
var loadQueryErrorCode = __name((output, data) => {
  var _a;
  if ((data.Error?.Code) !== void 0) {
    return data.Error.Code;
  }
  if (output.statusCode == 404) {
    return "NotFound";
  }
}, "loadQueryErrorCode");

// Assume role commands specific to AWS STS
var _AssumeRoleCommand = class extends import_smithy_client.Command.classBuilder().ep(import_EndpointParameters.commonParams).m(function(Command, cs, config, o) {
  return [
    import_middleware_serde.getSerdePlugin(config, this.serialize, this.deserialize),
    import_middleware_endpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())
  ];
}).s("AWSSecurityTokenServiceV20110615", "AssumeRole", {}).n("STSClient", "AssumeRoleCommand").f(void 0, AssumeRoleResponseFilterSensitiveLog).ser(se_AssumeRoleCommand).de(de_AssumeRoleCommand).build() {};
__name(_AssumeRoleCommand, "AssumeRoleCommand");
var AssumeRoleCommand = _AssumeRoleCommand;

// AssumeRoleWithSAML command for AWS STS
var import_EndpointParameters2 = require("./endpoint/EndpointParameters");
var _AssumeRoleWithSAMLCommand = class extends import_smithy_client.Command.classBuilder().ep(import_EndpointParameters2.commonParams).m(function(Command, cs, config, o) {
  return [
    import_middleware_serde.getSerdePlugin(config, this.serialize, this.deserialize),
    import_middleware_endpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())
  ];
}).s("AWSSecurityTokenServiceV20110615", "AssumeRoleWithSAML", {}).n("STSClient", "AssumeRoleWithSAMLCommand").f(AssumeRoleWithSAMLRequestFilterSensitiveLog, AssumeRoleWithSAMLResponseFilterSensitiveLog).ser(se_AssumeRoleWithSAMLCommand).de(de_AssumeRoleWithSAMLCommand).build() {};
__name(_AssumeRoleWithSAMLCommand, "AssumeRoleWithSAMLCommand");
var AssumeRoleWithSAMLCommand = _AssumeRoleWithSAMLCommand;

// AssumeRoleWithWebIdentity command for AWS STS
var import_EndpointParameters3 = require("./endpoint/EndpointParameters");
var _AssumeRoleWithWebIdentityCommand = class extends import_smithy_client.Command.classBuilder().ep(import_EndpointParameters3.commonParams).m(function(Command, cs, config, o) {
  return [
    import_middleware_serde.getSerdePlugin(config, this.serialize, this.deserialize),
    import_middleware_endpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())
  ];
}).s("AWSSecurityTokenServiceV20110615", "AssumeRoleWithWebIdentity", {}).n("STSClient", "AssumeRoleWithWebIdentityCommand").f(AssumeRoleWithWebIdentityRequestFilterSensitiveLog, AssumeRoleWithWebIdentityResponseFilterSensitiveLog).ser(se_AssumeRoleWithWebIdentityCommand).de(de_AssumeRoleWithWebIdentityCommand).build() {};
__name(_AssumeRoleWithWebIdentityCommand, "AssumeRoleWithWebIdentityCommand");
var AssumeRoleWithWebIdentityCommand = _AssumeRoleWithWebIdentityCommand;

// DecodeAuthorizationMessage command for AWS STS
var import_EndpointParameters4 = require("./endpoint/EndpointParameters");
var _DecodeAuthorizationMessageCommand = class extends import_smithy_client.Command.classBuilder().ep(import_EndpointParameters4.commonParams).m(function(Command, cs, config, o) {
  return [
    import_middleware_serde.getSerdePlugin(config, this.serialize, this.deserialize),
    import_middleware_endpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())
  ];
}).s("AWSSecurityTokenServiceV20110615", "DecodeAuthorizationMessage", {}).n("STSClient", "DecodeAuthorizationMessageCommand").f(void 0, void 0).ser(se_DecodeAuthorizationMessageCommand).de(de_DecodeAuthorizationMessageCommand).build() {};
__name(_DecodeAuthorizationMessageCommand, "DecodeAuthorizationMessageCommand");
var DecodeAuthorizationMessageCommand = _DecodeAuthorizationMessageCommand;

// GetAccessKeyInfo command for AWS STS
var import_EndpointParameters5 = require("./endpoint/EndpointParameters");
var _GetAccessKeyInfoCommand = class extends import_smithy_client.Command.classBuilder().ep(import_EndpointParameters5.commonParams).m(function(Command, cs, config, o) {
  return [
    import_middleware_serde.getSerdePlugin(config, this.serialize, this.deserialize),
    import_middleware_endpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())
  ];
}).s("AWSSecurityTokenServiceV20110615", "GetAccessKeyInfo", {}).n("STSClient", "GetAccessKeyInfoCommand").f(void 0, void 0).ser(se_GetAccessKeyInfoCommand).de(de_GetAccessKeyInfoCommand).build() {};
__name(_GetAccessKeyInfoCommand, "GetAccessKeyInfoCommand");
var GetAccessKeyInfoCommand = _GetAccessKeyInfoCommand;

// GetCallerIdentity command for AWS STS
var import_EndpointParameters6 = require("./endpoint/EndpointParameters");
var _GetCallerIdentityCommand = class extends import_smithy_client.Command.classBuilder().ep(import_EndpointParameters6.commonParams).m(function(Command, cs, config, o) {
  return [
    import_middleware_serde.getSerdePlugin(config, this.serialize, this.deserialize),
    import_middleware_endpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())
  ];
}).s("AWSSecurityTokenServiceV20110615", "GetCallerIdentity", {}).n("STSClient", "GetCallerIdentityCommand").f(void 0, void 0).ser(se_GetCallerIdentityCommand).de(de_GetCallerIdentityCommand).build() {};
__name(_GetCallerIdentityCommand, "GetCallerIdentityCommand");
var GetCallerIdentityCommand = _GetCallerIdentityCommand;

// GetFederationToken command for AWS STS
var import_EndpointParameters7 = require("./endpoint/EndpointParameters");
var _GetFederationTokenCommand = class extends import_smithy_client.Command.classBuilder().ep(import_EndpointParameters7.commonParams).m(function(Command, cs, config, o) {
  return [
    import_middleware_serde.getSerdePlugin(config, this.serialize, this.deserialize),
    import_middleware_endpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())
  ];
}).s("AWSSecurityTokenServiceV20110615", "GetFederationToken", {}).n("STSClient", "GetFederationTokenCommand").f(void 0, GetFederationTokenResponseFilterSensitiveLog).ser(se_GetFederationTokenCommand).de(de_GetFederationTokenCommand).build() {};
__name(_GetFederationTokenCommand, "GetFederationTokenCommand");
var GetFederationTokenCommand = _GetFederationTokenCommand;

// GetSessionToken command for AWS STS
var import_EndpointParameters8 = require("./endpoint/EndpointParameters");
var _GetSessionTokenCommand = class extends import_smithy_client.Command.classBuilder().ep(import_EndpointParameters8.commonParams).m(function(Command, cs, config, o) {
  return [
    import_middleware_serde.getSerdePlugin(config, this.serialize, this.deserialize),
    import_middleware_endpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())
  ];
}).s("AWSSecurityTokenServiceV20110615", "GetSessionToken", {}).n("STSClient", "GetSessionTokenCommand").f(void 0, GetSessionTokenResponseFilterSensitiveLog).ser(se_GetSessionTokenCommand).de(de_GetSessionTokenCommand).build() {};
__name(_GetSessionTokenCommand, "GetSessionTokenCommand");
var GetSessionTokenCommand = _GetSessionTokenCommand;

// Client instantiation and setup
var import_STSClient = require("././STSClient");
var commands = {
  AssumeRoleCommand,
  AssumeRoleWithSAMLCommand,
  AssumeRoleWithWebIdentityCommand,
  DecodeAuthorizationMessageCommand,
  GetAccessKeyInfoCommand,
  GetCallerIdentityCommand,
  GetFederationTokenCommand,
  GetSessionTokenCommand
};

// Extend base STS client
var _STS = class extends import_STSClient.STSClient {
};
__name(_STS, "STS");
var STS = _STS;

// Create aggregated client for commands
import_smithy_client.createAggregatedClient(commands, STS);

// Utilities for default role assumers in the STS client
var import_client = require("@aws-sdk/core/client");
var ASSUME_ROLE_DEFAULT_REGION = "us-east-1";

// Parsing assumed role user to extract account ID
var getAccountIdFromAssumedRoleUser = __name((assumedRoleUser) => {
  if (typeof (assumedRoleUser?.Arn) === "string") {
    const arnComponents = assumedRoleUser.Arn.split(":");
    if (arnComponents.length > 4 && arnComponents[4] !== "") {
      return arnComponents[4];
    }
  }
  return void 0;
}, "getAccountIdFromAssumedRoleUser");

// Resolve AWS region settings
var resolveRegion = __name(async (_region, _parentRegion, credentialProviderLogger) => {
  var _a;
  const region = typeof _region === "function" ? await _region() : _region;
  const parentRegion = typeof _parentRegion === "function" ? await _parentRegion() : _parentRegion;
  credentialProviderLogger?.debug?.(
    "@aws-sdk/client-sts::resolveRegion",
    "accepting first of:",
    `${region} (provider)`,
    `${parentRegion} (parent client)`,
    `${ASSUME_ROLE_DEFAULT_REGION} (STS default)`
  );
  return region ?? parentRegion ?? ASSUME_ROLE_DEFAULT_REGION;
}, "resolveRegion");

// Function to get default role assumer
var getDefaultRoleAssumer = __name((stsOptions, stsClientCtor) => {
  let stsClient;
  let closureSourceCreds;
  return async (sourceCreds, params) => {
    var _a, _b, _c;
    closureSourceCreds = sourceCreds;
    if (!stsClient) {
      const {
        logger = stsOptions?.parentClientConfig?.logger,
        region,
        requestHandler = stsOptions?.parentClientConfig?.requestHandler,
        credentialProviderLogger
      } = stsOptions;
      const resolvedRegion = await resolveRegion(
        region,
        stsOptions?.parentClientConfig?.region,
        credentialProviderLogger
      );
      const isCompatibleRequestHandler = !isH2(requestHandler);
      stsClient = new stsClientCtor({
        credentialDefaultProvider: () => async () => closureSourceCreds,
        region: resolvedRegion,
        requestHandler: isCompatibleRequestHandler ? requestHandler : void 0,
        logger
      });
    }
    const { Credentials, AssumedRoleUser } = await stsClient.send(new AssumeRoleCommand(params));
    if (!Credentials || !Credentials.AccessKeyId || !Credentials.SecretAccessKey) {
      throw new Error(`Invalid response from STS.assumeRole call with role ${params.RoleArn}`);
    }
    const accountId = getAccountIdFromAssumedRoleUser(AssumedRoleUser);
    const credentials = {
      accessKeyId: Credentials.AccessKeyId,
      secretAccessKey: Credentials.SecretAccessKey,
      sessionToken: Credentials.SessionToken,
      expiration: Credentials.Expiration,
      ...Credentials.CredentialScope && { credentialScope: Credentials.CredentialScope },
      ...accountId && { accountId }
    };
    import_client.setCredentialFeature(credentials, "CREDENTIALS_STS_ASSUME_ROLE", "i");
    return credentials;
  };
}, "getDefaultRoleAssumer");

// Get default role assumer with web identity
var getDefaultRoleAssumerWithWebIdentity = __name((stsOptions, stsClientCtor) => {
  let stsClient;
  return async (params) => {
    var _a, _b, _c;
    if (!stsClient) {
      const {
        logger = stsOptions?.parentClientConfig?.logger,
        region,
        requestHandler = stsOptions?.parentClientConfig?.requestHandler,
        credentialProviderLogger
      } = stsOptions;
      const resolvedRegion = await resolveRegion(
        region,
        stsOptions?.parentClientConfig?.region,
        credentialProviderLogger
      );
      const isCompatibleRequestHandler = !isH2(requestHandler);
      stsClient = new stsClientCtor({
        region: resolvedRegion,
        requestHandler: isCompatibleRequestHandler ? requestHandler : void 0,
        logger
      });
    }
    const { Credentials, AssumedRoleUser } = await stsClient.send(new AssumeRoleWithWebIdentityCommand(params));
    if (!Credentials || !Credentials.AccessKeyId || !Credentials.SecretAccessKey) {
      throw new Error(`Invalid response from STS.assumeRoleWithWebIdentity call with role ${params.RoleArn}`);
    }
    const accountId = getAccountIdFromAssumedRoleUser(AssumedRoleUser);
    const credentials = {
      accessKeyId: Credentials.AccessKeyId,
      secretAccessKey: Credentials.SecretAccessKey,
      sessionToken: Credentials.SessionToken,
      expiration: Credentials.Expiration,
      ...Credentials.CredentialScope && { credentialScope: Credentials.CredentialScope },
      ...accountId && { accountId }
    };
    if (accountId) {
      import_client.setCredentialFeature(credentials, "RESOLVED_ACCOUNT_ID", "T");
    }
    import_client.setCredentialFeature(credentials, "CREDENTIALS_STS_ASSUME_ROLE_WEB_ID", "k");
    return credentials;
  };
}, "getDefaultRoleAssumerWithWebIdentity");

// Check if request handler is H2 compatible
var isH2 = __name((requestHandler) => {
  var _a;
  return requestHandler?.metadata?.handlerProtocol === "h2";
}, "isH2");

// Function to get a customizable STS client constructor
var getCustomizableStsClientCtor = __name((baseCtor, customizations) => {
  if (!customizations)
    return baseCtor;
  else
    return class extends baseCtor {
      constructor(config) {
        super(config);
        for (const customization of customizations) {
          this.middlewareStack.use(customization);
        }
      }
    };
}, "getCustomizableStsClientCtor");

// Function to get the default role assumer
var getDefaultRoleAssumer2 = __name((stsOptions = {}, stsPlugins) => getDefaultRoleAssumer(stsOptions, getCustomizableStsClientCtor(import_STSClient2.STSClient, stsPlugins)), "getDefaultRoleAssumer");

// Function to get the default role assumer with web identity
var getDefaultRoleAssumerWithWebIdentity2 = __name((stsOptions = {}, stsPlugins) => getDefaultRoleAssumerWithWebIdentity(stsOptions, getCustomizableStsClientCtor(import_STSClient2.STSClient, stsPlugins)), "getDefaultRoleAssumerWithWebIdentity");

// Function to decorate the default credential provider
var decorateDefaultCredentialProvider = __name((provider) => (input) => provider({
  roleAssumer: getDefaultRoleAssumer2(input),
  roleAssumerWithWebIdentity: getDefaultRoleAssumerWithWebIdentity2(input),
  ...input
}), "decorateDefaultCredentialProvider");
