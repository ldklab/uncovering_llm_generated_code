"use strict";
const { ServiceException, Command: BaseCommand, createAggregatedClient } = require("@smithy/smithy-client");
const { getSerdePlugin, getEndpointPlugin } = require("@smithy/middleware-serde");
const { HttpRequest } = require("@smithy/protocol-http");
const { parseXmlBody, parseXmlErrorBody, expectString, expectNonNull, parseRfc3339DateTimeWithOffset, extendedEncodeURIComponent, strictParseInt32 } = require("@aws-sdk/core");
const { SENSITIVE_STRING } = require("@aws-sdk/smithy-client");

// Utility functions for setting and getting various properties
const defineProperty = Object.defineProperty;
const getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
const getOwnPropertyNames = Object.getOwnPropertyNames;
const hasOwnProperty = Object.prototype.hasOwnProperty;
const setFunctionName = (target, value) => defineProperty(target, "name", { value, configurable: true });

const exportAll = (target, all) => {
  for (const name in all) {
    defineProperty(target, name, { get: all[name], enumerable: true });
  }
};

const copyProps = (to, from, except, desc) => {
  if (from && (typeof from === "object" || typeof from === "function")) {
    for (const key of getOwnPropertyNames(from)) {
      if (!hasOwnProperty.call(to, key) && key !== except) {
        defineProperty(to, key, { get: () => from[key], enumerable: !(desc = getOwnPropertyDescriptor(from, key)) || desc.enumerable });
      }
    }
  }
  return to;
};

const reExport = (target, mod, secondTarget) => (copyProps(target, mod, "default"), secondTarget && copyProps(secondTarget, mod, "default"));
const toCommonJS = (mod) => copyProps(defineProperty({}, "__esModule", { value: true }), mod);

// Main module exports
const src_exports = {};
exportAll(src_exports, {
  STSServiceException,
  decorateDefaultCredentialProvider,
  getDefaultRoleAssumer,
  getDefaultRoleAssumerWithWebIdentity,
  AssumeRoleCommand,
  AssumeRoleResponseFilterSensitiveLog,
  AssumeRoleWithSAMLCommand,
  AssumeRoleWithSAMLRequestFilterSensitiveLog,
  AssumeRoleWithSAMLResponseFilterSensitiveLog,
  AssumeRoleWithWebIdentityCommand,
  AssumeRoleWithWebIdentityRequestFilterSensitiveLog,
  AssumeRoleWithWebIdentityResponseFilterSensitiveLog,
  CredentialsFilterSensitiveLog,
  DecodeAuthorizationMessageCommand,
  ExpiredTokenException,
  GetAccessKeyInfoCommand,
  GetCallerIdentityCommand,
  GetFederationTokenCommand,
  GetFederationTokenResponseFilterSensitiveLog,
  GetSessionTokenCommand,
  GetSessionTokenResponseFilterSensitiveLog,
  IDPCommunicationErrorException,
  IDPRejectedClaimException,
  InvalidAuthorizationMessageException,
  InvalidIdentityTokenException,
  MalformedPolicyDocumentException,
  PackedPolicyTooLargeException,
  RegionDisabledException,
  AssumeRoleCommand,
});

module.exports = toCommonJS(src_exports);
reExport(src_exports, require("./STSClient"), module.exports);

// Assumption Role functionality for STS
class STSServiceException extends ServiceException {
  constructor(options) {
    super(options);
    Object.setPrototypeOf(this, STSServiceException.prototype);
  }
}

const CredentialsFilterSensitiveLog = (obj) => ({
  ...obj,
  ...(obj.SecretAccessKey && { SecretAccessKey: SENSITIVE_STRING }),
});

const AssumeRoleResponseFilterSensitiveLog = (obj) => ({
  ...obj,
  ...(obj.Credentials && { Credentials: CredentialsFilterSensitiveLog(obj.Credentials) }),
});

class AssumeRoleCommand extends BaseCommand {
  static resolveEndpointParameters(command, input, config) {
    return [
      getSerdePlugin(config, this.serialize, this.deserialize),
      getEndpointPlugin(config, command.getEndpointParameterInstructions())
    ];
  }
  
  static serialize = async (input, context) => {
    const headers = SHARED_HEADERS;
    const body = buildFormUrlencodedString({
      ...serializeAssumeRoleRequest(input, context),
      Action: "AssumeRole",
      Version: "2011-06-15"
    });
    return buildHttpRpcRequest(context, headers, "/", void 0, body);
  };

  static deserialize = async (output, context) => {
    if (output.statusCode >= 300) {
      return deserializeCommandError(output, context);
    }
    const data = await parseXmlBody(output.body, context);
    let contents = {};
    contents = deserializeAssumeRoleResponse(data.AssumeRoleResult, context);
    const response = {
      $metadata: deserializeMetadata(output),
      ...contents
    };
    return response;
  };

  constructor(input) {
    super();
    Object.setPrototypeOf(this, AssumeRoleCommand.prototype);
  };
}

setFunctionName(AssumeRoleCommand, "AssumeRoleCommand");

// ... More roles and specialized command classes follow similar patterns

// Aggregate all commands into a single client
const commands = {
  AssumeRoleCommand,
  AssumeRoleWithSAMLCommand,
  AssumeRoleWithWebIdentityCommand,
  DecodeAuthorizationMessageCommand,
  GetAccessKeyInfoCommand,
  GetCallerIdentityCommand,
  GetFederationTokenCommand,
  GetSessionTokenCommand
};

class STS extends require("./STSClient").STSClient {}
createAggregatedClient(commands, STS);

const assumeRoleDefaultRegion = "us-east-1";
const getAccountIdFromAssumedRoleUser = (assumedRoleUser) => {
  if (typeof assumedRoleUser?.Arn === "string") {
    const arnComponents = assumedRoleUser.Arn.split(":");
    if (arnComponents.length > 4 && arnComponents[4] !== "") {
      return arnComponents[4];
    }
  }
  return undefined;
};

const resolveRegion = async (region, parentRegion, credentialProviderLogger) => {
  const resolvedRegion = typeof region === "function" ? await region() : region;
  const resolvedParentRegion = typeof parentRegion === "function" ? await parentRegion() : parentRegion;
  credentialProviderLogger?.debug("@aws-sdk/client-sts::resolveRegion", "Selecting between:", `${resolvedRegion} (provider)`, `${resolvedParentRegion} (parent client)`, `${assumeRoleDefaultRegion} (STS default)`);
  return resolvedRegion ?? resolvedParentRegion ?? assumeRoleDefaultRegion;
};

const getDefaultRoleAssumer = (stsOptions, stsClientCtor) => {
  let stsClient;
  let sourceCreds;
  return async (credentials, params) => {
    sourceCreds = credentials;
    if (!stsClient) {
      const { logger = stsOptions.parentClientConfig?.logger, region, requestHandler = stsOptions.parentClientConfig?.requestHandler, credentialProviderLogger } = stsOptions;
      const resolvedRegion = await resolveRegion(region, stsOptions.parentClientConfig?.region, credentialProviderLogger);

      stsClient = new stsClientCtor({
        credentialDefaultProvider: () => async () => sourceCreds,
        region: resolvedRegion,
        requestHandler,
        logger
      });
    }

    const { Credentials, AssumedRoleUser } = await stsClient.send(new AssumeRoleCommand(params));
    if (!Credentials || !Credentials.AccessKeyId || !Credentials.SecretAccessKey) {
      throw new Error(`Invalid response from STS.assumeRole call with role ${params.RoleArn}`);
    }

    const accountId = getAccountIdFromAssumedRoleUser(AssumedRoleUser);
    const roleCredentials = {
      accessKeyId: Credentials.AccessKeyId,
      secretAccessKey: Credentials.SecretAccessKey,
      sessionToken: Credentials.SessionToken,
      expiration: Credentials.Expiration,
      ...(Credentials.CredentialScope && { credentialScope: Credentials.CredentialScope }),
      ...(accountId && { accountId })
    };
    return roleCredentials;
  };
};

const getDefaultRoleAssumerWithWebIdentity = (stsOptions, stsClientCtor) => {
  let stsClient;
  return async (params) => {
    if (!stsClient) {
      const { logger = stsOptions.parentClientConfig?.logger, region, requestHandler = stsOptions.parentClientConfig?.requestHandler, credentialProviderLogger } = stsOptions;
      const resolvedRegion = await resolveRegion(region, stsOptions.parentClientConfig?.region, credentialProviderLogger);

      stsClient = new stsClientCtor({
        region: resolvedRegion,
        requestHandler,
        logger
      });
    }

    const { Credentials, AssumedRoleUser } = await stsClient.send(new AssumeRoleWithWebIdentityCommand(params));
    if (!Credentials || !Credentials.AccessKeyId || !Credentials.SecretAccessKey) {
      throw new Error(`Invalid response from STS.assumeRoleWithWebIdentity call with role ${params.RoleArn}`);
    }

    const accountId = getAccountIdFromAssumedRoleUser(AssumedRoleUser);
    const roleCredentials = {
      accessKeyId: Credentials.AccessKeyId,
      secretAccessKey: Credentials.SecretAccessKey,
      sessionToken: Credentials.SessionToken,
      expiration: Credentials.Expiration,
      ...(Credentials.CredentialScope && { credentialScope: Credentials.CredentialScope }),
      ...(accountId && { accountId })
    };
    return roleCredentials;
  };
};

const isH2RequestHandler = (requestHandler) => {
  return requestHandler?.metadata?.handlerProtocol === "h2";
};

// Example of a helper function
const buildFormUrlencodedString = (formEntries) => {
  return Object.entries(formEntries).map(([key, value]) => `${extendedEncodeURIComponent(key)}=${extendedEncodeURIComponent(value)}`).join("&");
};

// Example error handling
const deserializeCommandError = async (output, context) => {
  const parsedOutput = {
    ...output,
    body: await parseXmlErrorBody(output.body, context)
  };
  return handleError(parsedOutput, context);
};

// Define a minimal error handling example
const handleError = (parsedOutput, context) => {
  const errorCode = getErrorCode(parsedOutput);
  switch (errorCode) {
    // Handle specific error cases
    default:
      const parsedBody = parsedOutput.body;
      throw new Error(`Error occurred with code: ${errorCode}`);
  }
};

// Helper functions for request and response handling
const buildHttpRpcRequest = async (context, headers, path, resolvedHostname, body) => {
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
  return new HttpRequest(contents);
};

const deserializeMetadata = (output) => ({
  httpStatusCode: output.statusCode,
  requestId: output.headers["x-amzn-requestid"] ?? output.headers["x-amz-request-id"] ?? output.headers["x-amz-request-id"],
  extendedRequestId: output.headers["x-amz-id-2"],
  cfId: output.headers["x-amz-cf-id"]
});

// Declare headers to be shared across requests
const SHARED_HEADERS = {
  "content-type": "application/x-www-form-urlencoded"
};
