import { S3ClientResolvedConfig, ServiceInputTypes, ServiceOutputTypes } from "../S3Client";
import { DeletePublicAccessBlockRequest } from "../models/models_0";
import { Command as $Command } from "@aws-sdk/smithy-client";
import { Handler, MiddlewareStack, HttpHandlerOptions as __HttpHandlerOptions, MetadataBearer as __MetadataBearer } from "@aws-sdk/types";
export declare type DeletePublicAccessBlockCommandInput = DeletePublicAccessBlockRequest;
export declare type DeletePublicAccessBlockCommandOutput = __MetadataBearer;
/**
 * <p>Removes the <code>PublicAccessBlock</code> configuration for an Amazon S3 bucket. To use this
 *          operation, you must have the <code>s3:PutBucketPublicAccessBlock</code> permission. For
 *          more information about permissions, see <a href="https://docs.aws.amazon.com/AmazonS3/latest/dev/using-with-s3-actions.html#using-with-s3-actions-related-to-bucket-subresources">Permissions Related to Bucket Subresource Operations</a> and <a href="https://docs.aws.amazon.com/AmazonS3/latest/dev/s3-access-control.html">Managing Access Permissions to Your Amazon S3
 *             Resources</a>.</p>
 *
 *          <p>The following operations are related to <code>DeletePublicAccessBlock</code>:</p>
 *          <ul>
 *             <li>
 *                <p>
 *                   <a href="https://docs.aws.amazon.com/AmazonS3/latest/dev/access-control-block-public-access.html">Using Amazon S3 Block
 *                   Public Access</a>
 *                </p>
 *             </li>
 *             <li>
 *                <p>
 *                   <a href="https://docs.aws.amazon.com/AmazonS3/latest/API/API_GetPublicAccessBlock.html">GetPublicAccessBlock</a>
 *                </p>
 *             </li>
 *             <li>
 *                <p>
 *                   <a href="https://docs.aws.amazon.com/AmazonS3/latest/API/API_PutPublicAccessBlock.html">PutPublicAccessBlock</a>
 *                </p>
 *             </li>
 *             <li>
 *                <p>
 *                   <a href="https://docs.aws.amazon.com/AmazonS3/latest/API/API_GetBucketPolicyStatus.html">GetBucketPolicyStatus</a>
 *                </p>
 *             </li>
 *          </ul>
 */
export declare class DeletePublicAccessBlockCommand extends $Command<DeletePublicAccessBlockCommandInput, DeletePublicAccessBlockCommandOutput, S3ClientResolvedConfig> {
    readonly input: DeletePublicAccessBlockCommandInput;
    constructor(input: DeletePublicAccessBlockCommandInput);
    /**
     * @internal
     */
    resolveMiddleware(clientStack: MiddlewareStack<ServiceInputTypes, ServiceOutputTypes>, configuration: S3ClientResolvedConfig, options?: __HttpHandlerOptions): Handler<DeletePublicAccessBlockCommandInput, DeletePublicAccessBlockCommandOutput>;
    private serialize;
    private deserialize;
}
