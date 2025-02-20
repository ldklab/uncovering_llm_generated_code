import { S3ClientResolvedConfig, ServiceInputTypes, ServiceOutputTypes } from "../S3Client";
import { DeleteObjectTaggingOutput, DeleteObjectTaggingRequest } from "../models/models_0";
import { Command as $Command } from "@aws-sdk/smithy-client";
import { Handler, MiddlewareStack, HttpHandlerOptions as __HttpHandlerOptions, MetadataBearer as __MetadataBearer } from "@aws-sdk/types";
export declare type DeleteObjectTaggingCommandInput = DeleteObjectTaggingRequest;
export declare type DeleteObjectTaggingCommandOutput = DeleteObjectTaggingOutput & __MetadataBearer;
/**
 * <p>Removes the entire tag set from the specified object. For more information about
 *          managing object tags, see <a href="https://docs.aws.amazon.com/AmazonS3/latest/dev/object-tagging.html"> Object
 *             Tagging</a>.</p>
 *
 *          <p>To use this operation, you must have permission to perform the
 *             <code>s3:DeleteObjectTagging</code> action.</p>
 *
 *          <p>To delete tags of a specific object version, add the <code>versionId</code> query
 *          parameter in the request. You will need permission for the
 *             <code>s3:DeleteObjectVersionTagging</code> action.</p>
 *
 *          <p>The following operations are related to
 *          <code>DeleteBucketMetricsConfiguration</code>:</p>
 *          <ul>
 *             <li>
 *                <p>
 *                   <a href="https://docs.aws.amazon.com/AmazonS3/latest/API/API_PutObjectTagging.html">PutObjectTagging</a>
 *                </p>
 *             </li>
 *             <li>
 *                <p>
 *                   <a href="https://docs.aws.amazon.com/AmazonS3/latest/API/API_GetObjectTagging.html">GetObjectTagging</a>
 *                </p>
 *             </li>
 *          </ul>
 */
export declare class DeleteObjectTaggingCommand extends $Command<DeleteObjectTaggingCommandInput, DeleteObjectTaggingCommandOutput, S3ClientResolvedConfig> {
    readonly input: DeleteObjectTaggingCommandInput;
    constructor(input: DeleteObjectTaggingCommandInput);
    /**
     * @internal
     */
    resolveMiddleware(clientStack: MiddlewareStack<ServiceInputTypes, ServiceOutputTypes>, configuration: S3ClientResolvedConfig, options?: __HttpHandlerOptions): Handler<DeleteObjectTaggingCommandInput, DeleteObjectTaggingCommandOutput>;
    private serialize;
    private deserialize;
}
