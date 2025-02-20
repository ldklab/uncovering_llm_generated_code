import { S3ClientResolvedConfig, ServiceInputTypes, ServiceOutputTypes } from "../S3Client";
import { GetBucketLoggingOutput, GetBucketLoggingRequest } from "../models/models_0";
import { Command as $Command } from "@aws-sdk/smithy-client";
import { Handler, MiddlewareStack, HttpHandlerOptions as __HttpHandlerOptions, MetadataBearer as __MetadataBearer } from "@aws-sdk/types";
export declare type GetBucketLoggingCommandInput = GetBucketLoggingRequest;
export declare type GetBucketLoggingCommandOutput = GetBucketLoggingOutput & __MetadataBearer;
/**
 * <p>Returns the logging status of a bucket and the permissions users have to view and modify
 *          that status. To use GET, you must be the bucket owner.</p>
 *
 *          <p>The following operations are related to <code>GetBucketLogging</code>:</p>
 *          <ul>
 *             <li>
 *                <p>
 *                   <a href="https://docs.aws.amazon.com/AmazonS3/latest/API/API_CreateBucket.html">CreateBucket</a>
 *                </p>
 *             </li>
 *             <li>
 *                <p>
 *                   <a href="https://docs.aws.amazon.com/AmazonS3/latest/API/API_PutBucketLogging.html">PutBucketLogging</a>
 *                </p>
 *             </li>
 *          </ul>
 */
export declare class GetBucketLoggingCommand extends $Command<GetBucketLoggingCommandInput, GetBucketLoggingCommandOutput, S3ClientResolvedConfig> {
    readonly input: GetBucketLoggingCommandInput;
    constructor(input: GetBucketLoggingCommandInput);
    /**
     * @internal
     */
    resolveMiddleware(clientStack: MiddlewareStack<ServiceInputTypes, ServiceOutputTypes>, configuration: S3ClientResolvedConfig, options?: __HttpHandlerOptions): Handler<GetBucketLoggingCommandInput, GetBucketLoggingCommandOutput>;
    private serialize;
    private deserialize;
}
