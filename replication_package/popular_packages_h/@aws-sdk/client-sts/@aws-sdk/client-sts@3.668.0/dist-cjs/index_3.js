"use strict";

// Helper Functions
const defineProp = Object.defineProperty;
const getOwnPropDesc = Object.getOwnPropertyDescriptor;
const getOwnPropNames = Object.getOwnPropertyNames;
const hasOwnProp = Object.prototype.hasOwnProperty;

const nameFunction = (target, value) => defineProp(target, "name", { value, configurable: true });
const exportModule = (target, all) => {
  for (let name in all)
    if (hasOwnProp.call(all, name))
      defineProp(target, name, { get: all[name], enumerable: true });
};

const copyProps = (to, from, except, desc) => {
  if (from && (typeof from === "object" || typeof from === "function")) {
    for (let key of getOwnPropNames(from))
      if (!hasOwnProp.call(to, key) && key !== except)
        defineProp(to, key, {
          get: () => from[key],
          enumerable: !(desc = getOwnPropDesc(from, key)) || desc.enumerable
        });
  }
  return to;
};

const reExport = (target, mod, secondTarget) => (copyProps(target, mod, "default"), secondTarget && copyProps(secondTarget, mod, "default"));
const toCommonJS = (mod) => copyProps(defineProp({}, "__esModule", { value: true }), mod);

// STS Exports
const src_exports = {};
exportModule(src_exports, {
  AssumeRoleCommand: () => AssumeRoleCommand,
  AssumeRoleWithSAMLCommand: () => AssumeRoleWithSAMLCommand,
  // Other commands...
});

module.exports = toCommonJS(src_exports);

// Import statements
const middlewareEndpoint = require("@smithy/middleware-endpoint");
const middlewareSerde = require("@smithy/middleware-serde");
const stsmiddleware = require("@smithy/smithy-client");
const importEndpointParameters = require("./endpoint/EndpointParameters");

// AWS STS Client
const STSServiceException = class STSServiceException extends stsmiddleware.ServiceException {
  constructor(options) {
    super(options);
    Object.setPrototypeOf(this, STSServiceException.prototype);
  }
};

nameFunction(STSServiceException, "STSServiceException");

const getDefaultRoleAssumer = (stsOptions, stsClientCtor) => {
  let stsClient;
  let sourceCreds;
  return async (creds, params) => {
    sourceCreds = creds;
    if (!stsClient) {
      const {
        logger = stsOptions?.parentClientConfig?.logger,
        region,
        requestHandler = stsOptions?.parentClientConfig?.requestHandler
      } = stsOptions;
      
      const isCompatibleRequestHandler = !isH2(requestHandler);
      stsClient = new stsClientCtor({
        credentialDefaultProvider: () => async () => sourceCreds,
        region,
        requestHandler: isCompatibleRequestHandler ? requestHandler : undefined,
        logger
      });
    }

    const { Credentials, AssumedRoleUser } = await stsClient.send(new AssumeRoleCommand(params));
    if (!Credentials || !Credentials.AccessKeyId || !Credentials.SecretAccessKey) {
      throw new Error(`Invalid response from STS.assumeRole call with role ${params.RoleArn}`);
    }

    return {
      accessKeyId: Credentials.AccessKeyId,
      secretAccessKey: Credentials.SecretAccessKey,
      sessionToken: Credentials.SessionToken,
      expiration: Credentials.Expiration,
      accountId: AssumedRoleUser?.Arn?.split(":")[4]
    };
  };
}

module.exports = toCommonJS({
  getDefaultRoleAssumer,
  STSServiceException,
  AssumeRoleCommand: createAssumeRoleCommand(),
  AssumeRoleWithSAMLCommand: createAssumeRoleWithSAMLCommand(),
  // Other exports...
});
