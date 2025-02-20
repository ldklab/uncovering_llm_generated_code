import { S3Client } from "../S3Client";
import { HeadBucketCommandInput } from "../commands/HeadBucketCommand";
import { WaiterConfiguration, WaiterResult } from "@aws-sdk/util-waiter";
/**
 *
 *  @param params : Waiter configuration options.
 *  @param input : the input to HeadBucketCommand for polling.
 */
export declare const waitForBucketExists: (params: WaiterConfiguration<S3Client>, input: HeadBucketCommandInput) => Promise<WaiterResult>;
