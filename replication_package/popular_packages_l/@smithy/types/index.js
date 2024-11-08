typescript
// smithy-types.ts

export type NoUndefined<T> = {
  [P in keyof T]-?: NonNullable<T[P]>;
};

export type AssertiveClient<T> = {
  // Conceptual transformation to remove undefined from properties
  [K in keyof T]: T[K] extends (...args: infer A) => infer R ? (...args: NoUndefined<A>) => NoUndefined<R> : T[K];
};

export type UncheckedClient<T> = {
  // Simulates making output fields non-nullable
  [K in keyof T]: T[K] extends (...args: infer A) => infer R ? (...args: A) => Required<R> : T[K];
};

export type SdkStream<T> = {
  transformToString(): Promise<string>;
} & T;

export type NodeJsClient<T> = {
  [K in keyof T]: T[K] extends (...args: infer A) => infer R
    ? (...args: A) => Promise<SdkStream<Response>>
    : T[K];
};

export type StreamingBlobPayloadOutputTypes = SdkStream<Response>;

// Usage simulation
// In practice, these would be more specific interfaces determined by the AWS SDK.

// Example usage with AWS S3 client
import {
  S3Client,
  GetObjectCommand,
  ListBucketsCommand,
  GetObjectCommandInput,
} from "@aws-sdk/client-s3";
import type { AssertiveClient, UncheckedClient, NoUndefined, NodeJsClient } from "./smithy-types";

// Simulation: AWS S3 client with assertive type checking
const s3a = new S3Client({}) as AssertiveClient<S3Client>;

// Simulation: AWS S3 client with unchecked type checking
const s3b = new S3Client({}) as UncheckedClient<S3Client>;

// Example function usage
async function example() {
  // AssertiveClient example with required input enforcement
  try {
    const getObjectResponse = await s3a.getObject({
      Bucket: "my-bucket",
      Key: "my-key",
    });
  } catch (error) {
    console.error("Error with AssertiveClient:", error);
  }

  // UncheckedClient example with output type narrowing
  const body = await (
    await s3b.getObject({
      Bucket: "my-bucket",
      Key: "my-key",
    })
  ).Body.transformToString();
  console.log("Body as string:", body);

  // Command example with NoUndefined transformation on input
  const getObjectInput: NoUndefined<GetObjectCommandInput> = {
    Bucket: "my-bucket",
    Key: "my-key",
  };
  const s3c = new S3Client({}) as NodeJsClient<S3Client>;
  const commandOutput = await s3c.send(new GetObjectCommand(getObjectInput));
  console.log("Command output body:", await commandOutput.Body.transformToString());
}

example().catch(console.error);
