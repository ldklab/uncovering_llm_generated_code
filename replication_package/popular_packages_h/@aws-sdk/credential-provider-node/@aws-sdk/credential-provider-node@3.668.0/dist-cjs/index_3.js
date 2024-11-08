"use strict";

// Helpers for property and module operations
const __create = Object.create;
const __defProp = Object.defineProperty;
const __getOwnPropDesc = Object.getOwnPropertyDescriptor;
const __getOwnPropNames = Object.getOwnPropertyNames;
const __getProtoOf = Object.getPrototypeOf;
const __hasOwnProp = Object.prototype.hasOwnProperty;
const __name = (target, value) => __defProp(target, "name", { value, configurable: true });

const __export = (target, all) => {
  for (const name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

const __copyProps = (to, from, except, desc) => {
  if (from && (typeof from === "object" || typeof from === "function")) {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};

const __toESM = (mod, isNodeMode, target) => (
  target = mod != null ? __create(__getProtoOf(mod)) : {},
  __copyProps(
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  )
);

const __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// Exported module
const src_exports = {};
__export(src_exports, {
  credentialsTreatedAsExpired: () => credentialsTreatedAsExpired,
  credentialsWillNeedRefresh: () => credentialsWillNeedRefresh,
  defaultProvider: () => defaultProvider
});
module.exports = __toCommonJS(src_exports);

const import_credential_provider_env = require("@aws-sdk/credential-provider-env");
const import_shared_ini_file_loader = require("@smithy/shared-ini-file-loader");
const import_property_provider = require("@smithy/property-provider");

const ENV_IMDS_DISABLED = "AWS_EC2_METADATA_DISABLED";

// Remote provider function definition
const remoteProvider = __name(async (init) => {
  const { ENV_CMDS_FULL_URI, ENV_CMDS_RELATIVE_URI, fromContainerMetadata, fromInstanceMetadata } = await Promise.resolve().then(() => __toESM(require("@smithy/credential-provider-imds")));
  
  if (process.env[ENV_CMDS_RELATIVE_URI] || process.env[ENV_CMDS_FULL_URI]) {
    init.logger?.debug("@aws-sdk/credential-provider-node - remoteProvider::fromHttp/fromContainerMetadata");
    const { fromHttp } = await Promise.resolve().then(() => __toESM(require("@aws-sdk/credential-provider-http")));
    return import_property_provider.chain(fromHttp(init), fromContainerMetadata(init));
  }
  
  if (process.env[ENV_IMDS_DISABLED]) {
    return async () => {
      throw new import_property_provider.CredentialsProviderError("EC2 Instance Metadata Service access disabled", { logger: init.logger });
    };
  }
  
  init.logger?.debug("@aws-sdk/credential-provider-node - remoteProvider::fromInstanceMetadata");
  return fromInstanceMetadata(init);
}, "remoteProvider");

// Default provider function definition
let multipleCredentialSourceWarningEmitted = false;

const defaultProvider = __name((init = {}) => import_property_provider.memoize(
  import_property_provider.chain(
    async () => {
      const profile = init.profile ?? process.env[import_shared_ini_file_loader.ENV_PROFILE];
      
      if (profile) {
        const envStaticCredentialsAreSet = process.env[import_credential_provider_env.ENV_KEY] && process.env[import_credential_provider_env.ENV_SECRET];
        
        if (envStaticCredentialsAreSet && !multipleCredentialSourceWarningEmitted) {
          const warnFn = init.logger?.warn && (init.logger?.constructor?.name !== "NoOpLogger") ? init.logger.warn : console.warn;
          
          warnFn(
            `@aws-sdk/credential-provider-node - defaultProvider::fromEnv WARNING:
            Multiple credential sources detected: 
            Both AWS_PROFILE and the pair AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY static credentials are set.
            This SDK will proceed with the AWS_PROFILE value.
            
            However, a future version may change this behavior to prefer the ENV static credentials.
            Please ensure that your environment only sets either the AWS_PROFILE or the
            AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY pair.`
          );
          
          multipleCredentialSourceWarningEmitted = true;
        }
        
        throw new import_property_provider.CredentialsProviderError("AWS_PROFILE is set, skipping fromEnv provider.", {
          logger: init.logger,
          tryNextLink: true
        });
      }
      
      init.logger?.debug("@aws-sdk/credential-provider-node - defaultProvider::fromEnv");
      return import_credential_provider_env.fromEnv(init)();
    },
    async () => {
      init.logger?.debug("@aws-sdk/credential-provider-node - defaultProvider::fromSSO");
      
      if (!init.ssoStartUrl && !init.ssoAccountId && !init.ssoRegion && !init.ssoRoleName && !init.ssoSession) {
        throw new import_property_provider.CredentialsProviderError(
          "Skipping SSO provider in default chain (inputs do not include SSO fields).",
          { logger: init.logger }
        );
      }
      
      const { fromSSO } = await Promise.resolve().then(() => __toESM(require("@aws-sdk/credential-provider-sso")));
      return fromSSO(init)();
    },
    async () => {
      init.logger?.debug("@aws-sdk/credential-provider-node - defaultProvider::fromIni");
      const { fromIni } = await Promise.resolve().then(() => __toESM(require("@aws-sdk/credential-provider-ini")));
      return fromIni(init)();
    },
    async () => {
      init.logger?.debug("@aws-sdk/credential-provider-node - defaultProvider::fromProcess");
      const { fromProcess } = await Promise.resolve().then(() => __toESM(require("@aws-sdk/credential-provider-process")));
      return fromProcess(init)();
    },
    async () => {
      init.logger?.debug("@aws-sdk/credential-provider-node - defaultProvider::fromTokenFile");
      const { fromTokenFile } = await Promise.resolve().then(() => __toESM(require("@aws-sdk/credential-provider-web-identity")));
      return fromTokenFile(init)();
    },
    async () => {
      init.logger?.debug("@aws-sdk/credential-provider-node - defaultProvider::remoteProvider");
      return (await remoteProvider(init))();
    },
    async () => {
      throw new import_property_provider.CredentialsProviderError("Could not load credentials from any providers", {
        tryNextLink: false,
        logger: init.logger
      });
    }
  ),
  credentialsTreatedAsExpired,
  credentialsWillNeedRefresh
), "defaultProvider");

// Credential status functions definition
const credentialsWillNeedRefresh = __name((credentials) => credentials?.expiration !== undefined, "credentialsWillNeedRefresh");
const credentialsTreatedAsExpired = __name((credentials) => credentials?.expiration !== undefined && credentials.expiration.getTime() - Date.now() < 3e5, "credentialsTreatedAsExpired");
