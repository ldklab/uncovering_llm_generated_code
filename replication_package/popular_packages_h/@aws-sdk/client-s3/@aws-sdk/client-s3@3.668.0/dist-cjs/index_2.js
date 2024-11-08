"use strict";

const {
  Command,
  Client,
  createAggregatedClient,
  withBaseException,
  serializeDateTime,
  expectString,
  expectObject,
  expectBoolean,
  expectInt32,
  expectNonNull,
  expectNonNullWithType,
  strictParseLong,
  map,
} = require("some-sdk-client"); // Import necessary components from SDK.

const { XmlNode, XmlText, parseXmlBody, parseXmlErrorBody, mapSerializer, parseRfc7231DateTime } = require("xml-helper-utils");

const S3ServiceException = class extends ServiceException {
  constructor(options) {
    super(options);
    Object.setPrototypeOf(this, new.target.prototype);
  }
};

// Utility functions

const deserializeMetadata = (output) => ({
  httpStatusCode: output.statusCode,
  requestId: output.headers["x-amzn-requestid"] ?? output.headers["x-amzn-request-id"] ?? output.headers["x-amz-request-id"],
  extendedRequestId: output.headers["x-amz-id-2"],
  cfId: output.headers["x-amz-cf-id"],
});

// Commands definition
class AbortMultipartUploadCommand extends Command {
  static getEndpointParameterInstructions() {
    return {
      ...commonParams,
      Bucket: { type: "contextParams", name: "Bucket" },
      Key: { type: "contextParams", name: "Key" },
    };
  }
}

class CreateMultipartUploadCommand extends Command {
  static getEndpointParameterInstructions() {
    return {
      ...commonParams,
      Bucket: { type: "contextParams", name: "Bucket" },
      Key: { type: "contextParams", name: "Key" },
    };
  }
}

// More commands here ...

// Serialize functions
const se_AbortMultipartUploadCommand = async (input, context) => {
  const headers = map({}, isSerializableHeaderValue, {
    "x-amz-bucket": input.Bucket,
    "x-amz-key": input.Key,
  });
  return {
    method: "DELETE",
    headers,
    path: `/${input.Key}`,
    queryParams: {
      uploadId: input.UploadId,
    },
  };
};

const se_CreateMultipartUploadCommand = async (input, context) => {
  const headers = map({}, isSerializableHeaderValue, {
    "x-amz-acl": input.ACL,
    "x-amz-bucket": input.Bucket,
    "x-amz-key": input.Key,
  });
  return {
    method: "POST",
    headers,
    path: `/${input.Key}?uploads`,
  };
};

// Deserialize functions
const de_AbortMultipartUploadCommand = async (output, context) => {
  if (output.statusCode !== 204 && output.statusCode >= 300) {
    return de_CommandError(output, context);
  }
  return { $metadata: deserializeMetadata(output) };
};

const de_CreateMultipartUploadCommand = async (output, context) => {
  if (output.statusCode !== 200 && output.statusCode >= 300) {
    return de_CommandError(output, context);
  }
  const data = expectNonNull(await parseXmlBody(output.body, context));
  return {
    ...map(data),
    $metadata: deserializeMetadata(output),
  };
};

// Handle errors
const de_CommandError = async (output, context) => {
  const parsedOutput = { ...output, body: await parseXmlErrorBody(output.body, context) };
  const errorCode = loadRestXmlErrorCode(output, parsedOutput.body);

  switch (errorCode) {
    case "NoSuchUpload":
      throw await de_NoSuchUploadRes(parsedOutput, context);
    default:
      const parsedBody = parsedOutput.body;
      return throwDefaultError({ output, parsedBody, errorCode });
  }
};

const throwDefaultError = withBaseException(S3ServiceException);

// Pagination utilities

const paginateListBuckets = createPaginator(S3Client, ListBucketsCommand, "ContinuationToken", "ContinuationToken", "MaxBuckets");
const paginateListDirectoryBuckets = createPaginator(S3Client, ListDirectoryBucketsCommand, "ContinuationToken", "ContinuationToken", "MaxDirectoryBuckets");

// Waiter configurations

const checkState = async (client, input) => {
  let reason;
  try {
    const result = await client.send(new HeadBucketCommand(input));
    reason = result;
    return { state: WaiterState.SUCCESS, reason };
  } catch (exception) {
    reason = exception;
    if (exception.name === "NotFound") {
      return { state: WaiterState.RETRY, reason };
    }
  }
  return { state: WaiterState.RETRY, reason };
};

const waitForBucketExists = async (params, input) => {
  return createWaiter({ minDelay: 5, maxDelay: 120 }, input, checkState);
};

// Export commands and utilities

module.exports = {
  S3ServiceException,
  AbortMultipartUploadCommand,
  CreateMultipartUploadCommand,
  se_AbortMultipartUploadCommand,
  se_CreateMultipartUploadCommand,
  de_AbortMultipartUploadCommand,
  de_CreateMultipartUploadCommand,
  paginateListBuckets,
  paginateListDirectoryBuckets,
  waitForBucketExists,
};
