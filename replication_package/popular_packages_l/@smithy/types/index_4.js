typescript
// smithy-types.ts

/*
The code defines TypeScript utility types and interfaces to transform and ensure types 
on clients, specifically in the context of AWS SDK clients.

1. `NoUndefined<T>`: Converts all properties of a given type `T` to be non-optional and 
   non-nullable, ensuring none of them are `undefined`.

2. `AssertiveClient<T>`: Modifies a client interface by transforming its methods such that 
   they only accept non-optional, non-nullable arguments, and return non-nullable results. 

3. `UncheckedClient<T>`: Modifies a client interface such that the outputs of its methods 
   have all fields required (non-nullable), simulating a client interface with unchecked
   input but certain output fields.

4. `SdkStream<T>`: An interface for a streaming response that can be transformed into a 
   string, while extending type `T`.

5. `NodeJsClient<T>`: Modifies a client interface so the methods return a promise that 
   resolves to an `SdkStream<Response>`, indicating a streaming response common in SDKs.

6. `StreamingBlobPayloadOutputTypes`: Alias for `SdkStream<Response>` indicating a type 
   used for streaming outputs.

The example usage demonstrates how these interfaces might be applied to AWS SDK clients, 
simulating changes to the client's method signatures to enforce strict runtime behavior 
based on TypeScript type transformations.
*/

// Define utility types

type NoUndefined<T> = {
  [P in keyof T]-?: NonNullable<T[P]>;
};

type AssertiveClient<T> = {
  [K in keyof T]: T[K] extends (...args: infer A) => infer R ? (...args: NoUndefined<A>) => NoUndefined<R> : T[K];
};

type UncheckedClient<T> = {
  [K in keyof T]: T[K] extends (...args: infer A) => infer R ? (...args: A) => Required<R> : T[K];
};

type SdkStream<T> = {
  transformToString(): Promise<string>;
} & T;

type NodeJsClient<T> = {
  [K in keyof T]: T[K] extends (...args: infer A) => infer R ? (...args: A) => Promise<SdkStream<Response>> : T[K];
};

type StreamingBlobPayloadOutputTypes = SdkStream<Response>;

// Usage Example

import {
  S3Client,
  GetObjectCommand,
  ListBucketsCommand,
  GetObjectCommandInput,
} from "@aws-sdk/client-s3";

// Simulation of using the transformed client interfaces with AWS SDK

// Simulation: S3Client with assertive type checking, ensuring inputs are non-nullable
const s3a = new S3Client({}) as AssertiveClient<S3Client>;

// Simulation: S3Client with unchecked type checking, making outputs non-nullable
const s3b = new S3Client({}) as UncheckedClient<S3Client>;

// Example function demonstrating usage of transformed clients
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
