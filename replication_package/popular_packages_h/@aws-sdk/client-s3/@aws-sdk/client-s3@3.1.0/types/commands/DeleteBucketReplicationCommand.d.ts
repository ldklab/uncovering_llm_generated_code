import { S3ClientResolvedConfig, ServiceInputTypes, ServiceOutputTypes } from "../S3Client";
import { DeleteBucketReplicationRequest } from "../models/models_0";
import { Command as $Command } from "@aws-sdk/smithy-client";
import { Handler, MiddlewareStack, HttpHandlerOptions as __HttpHandlerOptions, MetadataBearer as __MetadataBearer } from "@aws-sdk/types";
export declare type DeleteBucketReplicationCommandInput = DeleteBucketReplicationRequest;
export declare type DeleteBucketReplicationCommandOutput = __MetadataBearer;
/**
 * <p> Deletes the replication configuration from the bucket.</p>
 *          <p>To use this operation, you must have permissions to perform the
 *             <code>s3:PutReplicationConfiguration</code> action. The bucket owner has these
 *          permissions by default and can grant it to others. For more information about permissions,
 *          see <a href="https://docs.aws.amazon.com/AmazonS3/latest/dev/using-with-s3-actions.html#using-with-s3-actions-related-to-bucket-subresources">Permissions Related to Bucket Subresource Operations</a> and <a href="https://docs.aws.amazon.com/AmazonS3/latest/dev/s3-access-control.html">Managing Access Permissions to Your Amazon S3
 *             Resources</a>. </p>
 *          <note>
 *             <p>It can take a while for the deletion of a replication configuration to fully
 *             propagate.</p>
 *          </note>
 *
 *          <p> For information about replication configuration, see <a href=" https://docs.aws.amazon.com/AmazonS3/latest/dev/replication.html">Replication</a> in the <i>Amazon S3 Developer
 *             Guide</i>. </p>
 *
 *          <p>The following operations are related to <code>DeleteBucketReplication</code>:</p>
 *          <ul>
 *             <li>
 *                <p>
 *                   <a href="https://docs.aws.amazon.com/AmazonS3/latest/API/API_PutBucketReplication.html">PutBucketReplication</a>
 *                </p>
 *             </li>
 *             <li>
 *                <p>
 *                   <a href="https://docs.aws.amazon.com/AmazonS3/latest/API/API_GetBucketReplication.html">GetBucketReplication</a>
 *                </p>
 *             </li>
 *          </ul>
 */
export declare class DeleteBucketReplicationCommand extends $Command<DeleteBucketReplicationCommandInput, DeleteBucketReplicationCommandOutput, S3ClientResolvedConfig> {
    readonly input: DeleteBucketReplicationCommandInput;
    constructor(input: DeleteBucketReplicationCommandInput);
    /**
     * @internal
     */
    resolveMiddleware(clientStack: MiddlewareStack<ServiceInputTypes, ServiceOutputTypes>, configuration: S3ClientResolvedConfig, options?: __HttpHandlerOptions): Handler<DeleteBucketReplicationCommandInput, DeleteBucketReplicationCommandOutput>;
    private serialize;
    private deserialize;
}
