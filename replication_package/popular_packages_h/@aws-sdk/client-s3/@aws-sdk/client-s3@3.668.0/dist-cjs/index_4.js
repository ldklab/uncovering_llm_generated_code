"use strict";

const { Client, createAggregatedClient, withBaseException } = require("@smithy/smithy-client");
const { getRuntimeConfig } = require("./runtimeConfig");
const { getAwsRegionExtensionConfiguration, resolveAwsRegionExtensionConfiguration } = require("@aws-sdk/region-config-resolver");
const { resolveDefaultRuntimeConfig } = require("@smithy/smithy-client");
const { resolveHttpHandlerRuntimeConfig, getHttpHandlerExtensionConfiguration } = require("@smithy/protocol-http");
const { resolveRetryConfig, getRetryPlugin } = require("@smithy/middleware-retry");
const { resolveHostHeaderConfig, getHostHeaderPlugin } = require("@aws-sdk/middleware-host-header");
const { resolveFlexibleChecksumsConfig, getFlexibleChecksumsPlugin } = require("@aws-sdk/middleware-flexible-checksums");
const { getSerdePlugin } = require("@aws-sdk/middleware-serde");
const { getSsecPlugin } = require("@aws-sdk/middleware-ssec");
const { resolveUserAgentConfig, getUserAgentPlugin } = require("@aws-sdk/middleware-user-agent");
const { createPaginator } = require("@smithy/core");
const { createWaiter, checkExceptions } = require("@smithy/util-waiter");
const { resolveS3Config, getValidateBucketNamePlugin, getS3ExpiresMiddlewarePlugin } = require("@aws-sdk/middleware-sdk-s3");
const { getHttpAuthExtensionConfiguration, resolveHttpAuthRuntimeConfig } = require("./auth/httpAuthExtensionConfiguration");

class S3Client extends Client {
  constructor(configuration) {
    const baseConfig = getRuntimeConfig(configuration || {});
    const configEndpoint = resolveClientEndpointParameters(baseConfig);
    const configUserAgent = resolveUserAgentConfig(configEndpoint);
    const configChecksums = resolveFlexibleChecksumsConfig(configUserAgent);
    const configRetry = resolveRetryConfig(configChecksums);
    const configRegion = resolveRegionConfig(configRetry);
    const configHostHeader = resolveHostHeaderConfig(configRegion);
    const configHttpHandler = resolveHttpHandlerRuntimeConfig(configHostHeader);
    const configHttpAuth = resolveHttpAuthRuntimeConfig(configHttpHandler);
    super(configHttpAuth);
    this.config = configHttpAuth;
    this.middlewareStack.use(getUserAgentPlugin(this.config));
    this.middlewareStack.use(getRetryPlugin(this.config));
    this.middlewareStack.use(getFlexibleChecksumsPlugin(this.config));
    this.middlewareStack.use(getSsecPlugin(this.config));
  }

  destroy() {
    super.destroy();
  }
}

const commands = {
  // Import and setup all commands here. Each command utilizes S3Client with configs.
  // e.g., AbortMultipartUploadCommand, PutObjectCommand, etc.

  AbortMultipartUploadCommand: createCommandHandler(se_AbortMultipartUploadCommand, de_AbortMultipartUploadCommand, "AbortMultipartUpload"),
  // Place all other command imports here...
};

const paginateListBuckets = createPaginator(S3Client, commands.ListBucketsCommand, "ContinuationToken");

const resolveRuntimeExtensions = (runtimeConfig, extensions) => {
  const extensionConfiguration = {
    ...getAwsRegionExtensionConfiguration(runtimeConfig),
    ...getDefaultExtensionConfiguration(runtimeConfig),
    ...getHttpHandlerExtensionConfiguration(runtimeConfig),
    ...getHttpAuthExtensionConfiguration(runtimeConfig),
  };
  extensions.forEach((extension) => extension.configure(extensionConfiguration));
  return {
    ...runtimeConfig,
    ...resolveAwsRegionExtensionConfiguration(extensionConfiguration),
    ...resolveDefaultRuntimeConfig(extensionConfiguration),
    ...resolveHttpHandlerRuntimeConfig(extensionConfiguration),
    ...resolveHttpAuthRuntimeConfig(extensionConfiguration),
  };
};

const checkState = async (client, input) => {
  let reason;
  try {
    const result = await client.send(new commands.HeadBucketCommand(input));
    reason = result;
    return { state: import_util_waiter.WaiterState.SUCCESS, reason };
  } catch (exception) {
    reason = exception;
    if (exception.name && exception.name == "NotFound") {
      return { state: import_util_waiter.WaiterState.RETRY, reason };
    }
  }
  return { state: import_util_waiter.WaiterState.RETRY, reason };
};

const waitForBucketExists = (params, input) => createWaiter({ minDelay: 5, maxDelay: 120, ...params }, input, checkState);

module.exports = {
  S3Client,
  commands,
  paginateListBuckets,
  waitForBucketExists,
  // Export other helpers, commands, paginations, and waiters as needed.
};
