"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultProvider = exports.ENV_IMDS_DISABLED = void 0;

const { fromEnv } = require("@aws-sdk/credential-provider-env");
const { ENV_CMDS_FULL_URI, ENV_CMDS_RELATIVE_URI, fromContainerMetadata, fromInstanceMetadata, RemoteProviderInit } = require("@aws-sdk/credential-provider-imds");
const { ENV_PROFILE, fromIni, FromIniInit } = require("@aws-sdk/credential-provider-ini");
const { fromProcess, FromProcessInit } = require("@aws-sdk/credential-provider-process");
const { chain, memoize, ProviderError } = require("@aws-sdk/property-provider");
const { CredentialProvider } = require("@aws-sdk/types");

exports.ENV_IMDS_DISABLED = "AWS_EC2_METADATA_DISABLED";

/**
 * Creates a credential provider that will attempt to find credentials from the
 * following sources (listed in order of precedence):
 *   * Environment variables exposed via `process.env`
 *   * Shared credentials and config ini files
 *   * The EC2/ECS Instance Metadata Service
 *
 * The default credential provider will invoke one provider at a time and only
 * continue to the next if no credentials have been located. For example, if
 * the process finds values defined via the `AWS_ACCESS_KEY_ID` and
 * `AWS_SECRET_ACCESS_KEY` environment variables, the files at
 * `~/.aws/credentials` and `~/.aws/config` will not be read, nor will any
 * messages be sent to the Instance Metadata Service.
 *
 * @param init                  Configuration that is passed to each individual
 *                              provider
 *
 * @see fromEnv                 The function used to source credentials from
 *                              environment variables
 * @see fromIni                 The function used to source credentials from INI
 *                              files
 * @see fromProcess             The functionality used to sources credentials
 *                              from credential_process in INI files
 * @see fromInstanceMetadata    The functionality used to source credentials
 *                              from the EC2 Instance Metadata Service
 * @see fromContainerMetadata   The functionality used to source credentials
 *                              from the ECS Container Metadata Service
 */
function defaultProvider(init = {}) {
    const { profile = process.env[ENV_PROFILE] } = init;
    const providerChain = profile
        ? chain(fromIni(init), fromProcess(init))
        : chain(fromEnv(), fromIni(init), fromProcess(init), remoteProvider(init));

    return memoize(
        providerChain,
        (credentials) => credentials.expiration !== undefined && credentials.expiration.getTime() - Date.now() < 300000,
        (credentials) => credentials.expiration !== undefined
    );
}

exports.defaultProvider = defaultProvider;

function remoteProvider(init) {
    if (process.env[ENV_CMDS_RELATIVE_URI] || process.env[ENV_CMDS_FULL_URI]) {
        return fromContainerMetadata(init);
    }

    if (process.env[exports.ENV_IMDS_DISABLED]) {
        return () => Promise.reject(new ProviderError("EC2 Instance Metadata Service access disabled"));
    }

    return fromInstanceMetadata(init);
}
