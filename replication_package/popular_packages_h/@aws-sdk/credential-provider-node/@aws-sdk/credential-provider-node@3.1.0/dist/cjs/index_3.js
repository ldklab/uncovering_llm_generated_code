"use strict";
const { fromEnv } = require("@aws-sdk/credential-provider-env");
const { ENV_CMDS_FULL_URI, ENV_CMDS_RELATIVE_URI, fromContainerMetadata, fromInstanceMetadata, RemoteProviderInit } = require("@aws-sdk/credential-provider-imds");
const { ENV_PROFILE, fromIni, FromIniInit } = require("@aws-sdk/credential-provider-ini");
const { fromProcess, FromProcessInit } = require("@aws-sdk/credential-provider-process");
const { chain, memoize, ProviderError } = require("@aws-sdk/property-provider");
const { CredentialProvider } = require("@aws-sdk/types");

exports.ENV_IMDS_DISABLED = "AWS_EC2_METADATA_DISABLED";

/**
 * Creates and returns a default chain of AWS credential providers.
 * The providers are checked in order of priority:
 *   1. Environment variables
 *   2. Shared credentials and config ini files
 *   3. EC2/ECS Instance Metadata Service
 *
 * @param {FromIniInit & RemoteProviderInit & FromProcessInit} [init={}]
 * @return {CredentialProvider} Credential provider
 */
function defaultProvider(init = {}) {
  const { profile = process.env[ENV_PROFILE] } = init;

  const providerChain = profile
    ? chain(fromIni(init), fromProcess(init))
    : chain(fromEnv(), fromIni(init), fromProcess(init), remoteProvider(init));

  return memoize(
    providerChain,
    (credentials) =>
      credentials.expiration !== undefined &&
      credentials.expiration.getTime() - Date.now() < 300000,
    (credentials) => credentials.expiration !== undefined
  );
}
exports.defaultProvider = defaultProvider;

/**
 * Returns a remote AWS credential provider.
 *
 * @param {RemoteProviderInit} init
 * @return {CredentialProvider} Provider instance
 */
function remoteProvider(init) {
  if (process.env[ENV_CMDS_RELATIVE_URI] || process.env[ENV_CMDS_FULL_URI]) {
    return fromContainerMetadata(init);
  }
  if (process.env[exports.ENV_IMDS_DISABLED]) {
    return () => Promise.reject(new ProviderError("EC2 Instance Metadata Service access disabled"));
  }
  return fromInstanceMetadata(init);
}
