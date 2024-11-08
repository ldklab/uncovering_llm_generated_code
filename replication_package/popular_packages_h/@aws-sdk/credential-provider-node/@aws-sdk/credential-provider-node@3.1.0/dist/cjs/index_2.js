"use strict";
import { 
  fromEnv 
} from "@aws-sdk/credential-provider-env";
import { 
  ENV_CMDS_FULL_URI, 
  ENV_CMDS_RELATIVE_URI, 
  fromContainerMetadata, 
  fromInstanceMetadata, 
  RemoteProviderInit 
} from "@aws-sdk/credential-provider-imds";
import { 
  ENV_PROFILE, 
  fromIni, 
  FromIniInit 
} from "@aws-sdk/credential-provider-ini";
import {
  fromProcess, 
  FromProcessInit 
} from "@aws-sdk/credential-provider-process";
import { chain, memoize, ProviderError } from "@aws-sdk/property-provider";
import { CredentialProvider } from "@aws-sdk/types";

export const ENV_IMDS_DISABLED = "AWS_EC2_METADATA_DISABLED";

/**
 * Default credential provider, sourcing credentials from environment variables,
 * INI files, instance metadata, or process execution.
 *
 * @param init Configuration for providers.
 */
export function defaultProvider(
  init: FromIniInit & RemoteProviderInit & FromProcessInit = {}
): CredentialProvider {
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

function remoteProvider(init: RemoteProviderInit): CredentialProvider {
  if (process.env[ENV_CMDS_RELATIVE_URI] || process.env[ENV_CMDS_FULL_URI]) {
    return fromContainerMetadata(init);
  }

  if (process.env[ENV_IMDS_DISABLED]) {
    return () =>
      Promise.reject(
        new ProviderError("EC2 Instance Metadata Service access disabled")
      );
  }

  return fromInstanceMetadata(init);
}
