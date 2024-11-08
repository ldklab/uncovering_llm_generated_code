typescript
// smithy-types.ts

// This type ensures there are no undefined properties in the given type T.
export type NoUndefined<T> = {
  [P in keyof T]-?: NonNullable<T[P]>;
};

// Defines a client type that transforms method arguments and return types to ensure 
// no undefined values. It's for clients where undefined properties are not allowed.
export type AssertiveClient<T> = {
  [K in keyof T]: T[K] extends (...args: infer A) => infer R ? (...args: NoUndefined<A>) => NoUndefined<R> : T[K];
};

// Represents a client type that requires fields to be non-nullable in the output, 
// effectively treating response properties as being present.
export type UncheckedClient<T> = {
  [K in keyof T]: T[K] extends (...args: infer A) => infer R ? (...args: A) => Required<R> : T[K];
};

// This type extends any type T with a method `transformToString` to convert the stream to a string.
export type SdkStream<T> = {
  transformToString(): Promise<string>;
} & T;

// Statement representing a client where methods return promises for SdkStream types, 
// suitable for Node.js environments.
export type NodeJsClient<T> = {
  [K in keyof T]: T[K] extends (...args: infer A) => infer R
    ? (...args: A) => Promise<SdkStream<Response>>
    : T[K];
};

// Type used to represent outputs that contain streaming blob payloads.
export type StreamingBlobPayloadOutputTypes = SdkStream<Response>;

// Practical usage examples with AWS S3 client
import {
  S3Client,
  GetObjectCommand,
  GetObjectCommandInput,
} from "@aws-sdk/client-s3";
import type { AssertiveClient, UncheckedClient, NoUndefined, NodeJsClient } from "./smithy-types";

// Example of an S3 client with strict input type enforcement
const s3a = new S3Client({}) as AssertiveClient<S3Client>;

// Example of an S3 client with relaxed output type enforcement
const s3b = new S3Client({}) as UncheckedClient<S3Client>;

async function example() {
  try {
    // Using the AssertiveClient to enforce input types
    const getObjectResponse = await s3a.getObject({
      Bucket: "my-bucket",
      Key: "my-key",
    });
  } catch (error) {
    console.error("Error with AssertiveClient:", error);
  }

  // Using the UncheckedClient to work with transformed output
  const body = await (
    await s3b.getObject({
      Bucket: "my-bucket",
      Key: "my-key",
    })
  ).Body.transformToString();
  console.log("Body as string:", body);

  // Demonstrating NoUndefined input type usage
  const getObjectInput: NoUndefined<GetObjectCommandInput> = {
    Bucket: "my-bucket",
    Key: "my-key",
  };
  const s3c = new S3Client({}) as NodeJsClient<S3Client>;
  const commandOutput = await s3c.send(new GetObjectCommand(getObjectInput));
  console.log("Command output body:", await commandOutput.Body.transformToString());
}

example().catch(console.error);
