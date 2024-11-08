"use strict";

const { ENV_PROFILE } = require("@smithy/shared-ini-file-loader");
const { memoize, chain, CredentialsProviderError } = require("@smithy/property-provider");
const { fromEnv, ENV_KEY, ENV_SECRET } = require("@aws-sdk/credential-provider-env");

async function loadModule(moduleName) {
  return (await Promise.resolve().then(() => require(moduleName)));
}

async function remoteProvider(init) {
  try {
    const { ENV_CMDS_FULL_URI, ENV_CMDS_RELATIVE_URI, fromContainerMetadata, fromInstanceMetadata } = await loadModule("@smithy/credential-provider-imds");
    const { fromHttp } = await loadModule("@aws-sdk/credential-provider-http");

    if (process.env[ENV_CMDS_RELATIVE_URI] || process.env[ENV_CMDS_FULL_URI]) {
      init.logger?.debug("@aws-sdk/credential-provider-node - remoteProvider::fromHttp/fromContainerMetadata");
      return chain(fromHttp(init), fromContainerMetadata(init));
    } else if (process.env["AWS_EC2_METADATA_DISABLED"]) {
      return async () => {
        throw new CredentialsProviderError("EC2 Instance Metadata Service access disabled", { logger: init.logger });
      };
    } else {
      init.logger?.debug("@aws-sdk/credential-provider-node - remoteProvider::fromInstanceMetadata");
      return fromInstanceMetadata(init);
    }
  } catch (err) {
    throw new Error('Failed to load remote provider');
  }
}

let multipleCredentialSourceWarningEmitted = false;

function defaultProvider(init = {}) {
  return memoize(
    chain(
      async () => {
        const profile = init.profile ?? process.env[ENV_PROFILE];
        if (profile) {
          const envStaticCredentialsAreSet = process.env[ENV_KEY] && process.env[ENV_SECRET];
          if (envStaticCredentialsAreSet && !multipleCredentialSourceWarningEmitted) {
            const warnFn = init.logger?.warn && init.logger.constructor?.name !== "NoOpLogger" ? init.logger.warn : console.warn;
            warnFn(
              `@aws-sdk/credential-provider-node - defaultProvider::fromEnv WARNING:
    Multiple credential sources detected: 
    Both AWS_PROFILE and the pair AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY static credentials are set.
    This SDK will proceed with the AWS_PROFILE value.
    
    However, a future version may change this behavior to prefer the ENV static credentials.
    Please ensure that your environment only sets either the AWS_PROFILE or the
    AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY pair.
`
            );
            multipleCredentialSourceWarningEmitted = true;
          }
          throw new CredentialsProviderError("AWS_PROFILE is set, skipping fromEnv provider.", { logger: init.logger, tryNextLink: true });
        }

        init.logger?.debug("@aws-sdk/credential-provider-node - defaultProvider::fromEnv");
        return fromEnv(init)();
      },
      async () => {
        init.logger?.debug("@aws-sdk/credential-provider-node - defaultProvider::fromSSO");
        if (!init.ssoStartUrl && !init.ssoAccountId && !init.ssoRegion && !init.ssoRoleName && !init.ssoSession) {
          throw new CredentialsProviderError("Skipping SSO provider in default chain (inputs do not include SSO fields).", { logger: init.logger });
        }
        const { fromSSO } = await loadModule("@aws-sdk/credential-provider-sso");
        return fromSSO(init)();
      },
      async () => {
        init.logger?.debug("@aws-sdk/credential-provider-node - defaultProvider::fromIni");
        const { fromIni } = await loadModule("@aws-sdk/credential-provider-ini");
        return fromIni(init)();
      },
      async () => {
        init.logger?.debug("@aws-sdk/credential-provider-node - defaultProvider::fromProcess");
        const { fromProcess } = await loadModule("@aws-sdk/credential-provider-process");
        return fromProcess(init)();
      },
      async () => {
        init.logger?.debug("@aws-sdk/credential-provider-node - defaultProvider::fromTokenFile");
        const { fromTokenFile } = await loadModule("@aws-sdk/credential-provider-web-identity");
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
  );
}

function credentialsWillNeedRefresh(credentials) {
  return credentials?.expiration !== undefined;
}

function credentialsTreatedAsExpired(credentials) {
  return credentials?.expiration !== undefined && credentials.expiration.getTime() - Date.now() < 300000;
}

module.exports = {
  defaultProvider,
  credentialsWillNeedRefresh,
  credentialsTreatedAsExpired
};
