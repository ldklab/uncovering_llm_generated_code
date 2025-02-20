import { S3ClientResolvedConfig, ServiceInputTypes, ServiceOutputTypes } from "../S3Client";
import { GetBucketRequestPaymentOutput, GetBucketRequestPaymentRequest } from "../models/models_0";
import { Command as $Command } from "@aws-sdk/smithy-client";
import { Handler, MiddlewareStack, HttpHandlerOptions as __HttpHandlerOptions, MetadataBearer as __MetadataBearer } from "@aws-sdk/types";
export declare type GetBucketRequestPaymentCommandInput = GetBucketRequestPaymentRequest;
export declare type GetBucketRequestPaymentCommandOutput = GetBucketRequestPaymentOutput & __MetadataBearer;
/**
 * <p>Returns the request payment configuration of a bucket. To use this version of the
 *          operation, you must be the bucket owner. For more information, see <a href="https://docs.aws.amazon.com/AmazonS3/latest/dev/RequesterPaysBuckets.html">Requester Pays Buckets</a>.</p>
 *
 *          <p>The following operations are related to <code>GetBucketRequestPayment</code>:</p>
 *          <ul>
 *             <li>
 *                <p>
 *                   <a href="https://docs.aws.amazon.com/AmazonS3/latest/API/API_ListObjects.html">ListObjects</a>
 *                </p>
 *             </li>
 *          </ul>
 */
export declare class GetBucketRequestPaymentCommand extends $Command<GetBucketRequestPaymentCommandInput, GetBucketRequestPaymentCommandOutput, S3ClientResolvedConfig> {
    readonly input: GetBucketRequestPaymentCommandInput;
    constructor(input: GetBucketRequestPaymentCommandInput);
    /**
     * @internal
     */
    resolveMiddleware(clientStack: MiddlewareStack<ServiceInputTypes, ServiceOutputTypes>, configuration: S3ClientResolvedConfig, options?: __HttpHandlerOptions): Handler<GetBucketRequestPaymentCommandInput, GetBucketRequestPaymentCommandOutput>;
    private serialize;
    private deserialize;
}
