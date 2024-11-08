"use strict";
const { create, defineProperty: defProp, getOwnPropertyDescriptor: getOwnPropDesc, getOwnPropertyNames: getOwnPropNames, getPrototypeOf: getProtoOf, prototype: { hasOwnProperty: hasOwnProp } } = Object;

const nameFunction = (target, value) => defProp(target, "name", { value, configurable: true });
const exportModule = (target, definitions) => {
  for (const name in definitions) {
    defProp(target, name, { get: definitions[name], enumerable: true });
  }
};

const copyProperties = (to, from, except, desc) => {
  if (from && (typeof from === "object" || typeof from === "function")) {
    for (const key of getOwnPropNames(from)) {
      if (!hasOwnProp.call(to, key) && key !== except) {
        defProp(to, key, { get: () => from[key], enumerable: !(desc = getOwnPropDesc(from, key)) || desc.enumerable });
      }
    }
  }
  return to;
};

const toESM = (mod, isNodeMode, target) => (
  target = mod != null ? create(getProtoOf(mod)) : {},
  copyProperties(
    isNodeMode || !mod || !mod.__esModule ? defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  )
);

const toCommonJS = (mod) => copyProperties(defProp({}, "__esModule", { value: true }), mod);

// src/index.js
const src_exports = {};
exportModule(src_exports, {
  credentialsTreatedAsExpired: () => credentialsTreatedAsExpired,
  credentialsWillNeedRefresh: () => credentialsWillNeedRefresh,
  defaultProvider: () => defaultProvider
});
module.exports = toCommonJS(src_exports);

// src/defaultProvider.js
const { fromEnv: fromEnvProvider } = require("@aws-sdk/credential-provider-env");
const { ENV_PROFILE } = require("@smithy/shared-ini-file-loader");
const { chain, memoize, CredentialsProviderError } = require("@smithy/property-provider");

const ENV_IMDS_DISABLED = "AWS_EC2_METADATA_DISABLED";
const remoteProvider = nameFunction(async (init) => {
  const { ENV_CMDS_FULL_URI, ENV_CMDS_RELATIVE_URI, fromContainerMetadata, fromInstanceMetadata } = await Promise.resolve().then(() => toESM(require("@smithy/credential-provider-imds")));
  if (process.env[ENV_CMDS_RELATIVE_URI] || process.env[ENV_CMDS_FULL_URI]) {
    init.logger?.debug("@aws-sdk/credential-provider-node - remoteProvider::fromHttp/fromContainerMetadata");
    const { fromHttp } = await Promise.resolve().then(() => toESM(require("@aws-sdk/credential-provider-http")));
    return chain(fromHttp(init), fromContainerMetadata(init));
  }
  if (process.env[ENV_IMDS_DISABLED]) {
    return async () => {
      throw new CredentialsProviderError("EC2 Instance Metadata Service access disabled", { logger: init.logger });
    };
  }
  init.logger?.debug("@aws-sdk/credential-provider-node - remoteProvider::fromInstanceMetadata");
  return fromInstanceMetadata(init);
}, "remoteProvider");

// src/defaultProvider.js
let multipleCredentialSourceWarningEmitted = false;
const defaultProvider = nameFunction((init = {}) => memoize(
  chain(
    async () => {
      const profile = init.profile ?? process.env[ENV_PROFILE];
      if (profile) {
        const envStaticCredentialsAreSet = process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY;
        if (envStaticCredentialsAreSet && !multipleCredentialSourceWarningEmitted) {
          const warnFn = init.logger?.warn ?? console.warn;
          warnFn(
            `WARNING: Multiple credential sources detected: AWS_PROFILE and AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY are both set. Using AWS_PROFILE for now, but behavior may change in future to prefer ENV static credentials.`
          );
          multipleCredentialSourceWarningEmitted = true;
        }
        throw new CredentialsProviderError("AWS_PROFILE is set, skipping fromEnv provider.", { logger: init.logger, tryNextLink: true });
      }
      init.logger?.debug("@aws-sdk/credential-provider-node - defaultProvider::fromEnv");
      return fromEnvProvider(init)();
    },
    async () => {
      init.logger?.debug("@aws-sdk/credential-provider-node - defaultProvider::fromSSO");
      const { ssoStartUrl, ssoAccountId, ssoRegion, ssoRoleName, ssoSession } = init;
      if (!ssoStartUrl && !ssoAccountId && !ssoRegion && !ssoRoleName && !ssoSession) {
        throw new CredentialsProviderError("Skipping SSO provider (inputs do not include SSO fields).", { logger: init.logger });
      }
      const { fromSSO } = await Promise.resolve().then(() => toESM(require("@aws-sdk/credential-provider-sso")));
      return fromSSO(init)();
    },
    async () => {
      init.logger?.debug("@aws-sdk/credential-provider-node - defaultProvider::fromIni");
      const { fromIni } = await Promise.resolve().then(() => toESM(require("@aws-sdk/credential-provider-ini")));
      return fromIni(init)();
    },
    async () => {
      init.logger?.debug("@aws-sdk/credential-provider-node - defaultProvider::fromProcess");
      const { fromProcess } = await Promise.resolve().then(() => toESM(require("@aws-sdk/credential-provider-process")));
      return fromProcess(init)();
    },
    async () => {
      init.logger?.debug("@aws-sdk/credential-provider-node - defaultProvider::fromTokenFile");
      const { fromTokenFile } = await Promise.resolve().then(() => toESM(require("@aws-sdk/credential-provider-web-identity")));
      return fromTokenFile(init)();
    },
    async () => {
      init.logger?.debug("@aws-sdk/credential-provider-node - defaultProvider::remoteProvider");
      return (await remoteProvider(init))();
    },
    async () => {
      throw new CredentialsProviderError("Could not load credentials from any providers", { tryNextLink: false, logger: init.logger });
    }
  ),
  credentialsTreatedAsExpired,
  credentialsWillNeedRefresh
), "defaultProvider");

const credentialsWillNeedRefresh = nameFunction((credentials) => credentials?.expiration !== undefined, "credentialsWillNeedRefresh");

const credentialsTreatedAsExpired = nameFunction((credentials) => credentials?.expiration !== undefined && credentials.expiration.getTime() - Date.now() < 300000, "credentialsTreatedAsExpired");
