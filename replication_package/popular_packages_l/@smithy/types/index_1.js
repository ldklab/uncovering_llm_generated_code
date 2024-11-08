typescript
// smithy-types.ts

export type NoUndefined<T> = {
  [P in keyof T]-?: NonNullable<T[P]>;
};

export type AssertiveClient<T> = {
  [K in keyof T]: T[K] extends (...args: infer A) => infer R ? (...args: NoUndefined<A>) => NoUndefined<R> : T[K];
};

export type UncheckedClient<T> = {
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

// Example interfaces for type simulation
import {
  S3Client,
  GetObjectCommand,
  ListBucketsCommand,
  GetObjectCommandInput,
} from "@aws-sdk/client-s3";
import type { AssertiveClient, UncheckedClient, NoUndefined, NodeJsClient } from "./smithy-types";

const s3a = new S3Client({}) as AssertiveClient<S3Client>;

const s3b = new S3Client({}) as UncheckedClient<S3Client>;

async function example() {  
  try {
    const getObjectResponse = await s3a.getObject({
      Bucket: "my-bucket",
      Key: "my-key",
    });
  } catch (error) {
    console.error("Error with AssertiveClient:", error);
  }

  const body = await (
    await s3b.getObject({
      Bucket: "my-bucket",
      Key: "my-key",
    })
  ).Body.transformToString();
  console.log("Body as string:", body);

  const getObjectInput: NoUndefined<GetObjectCommandInput> = {
    Bucket: "my-bucket",
    Key: "my-key",
  };
  const s3c = new S3Client({}) as NodeJsClient<S3Client>;
  const commandOutput = await s3c.send(new GetObjectCommand(getObjectInput));
  console.log("Command output body:", await commandOutput.Body.transformToString());
}

example().catch(console.error);
