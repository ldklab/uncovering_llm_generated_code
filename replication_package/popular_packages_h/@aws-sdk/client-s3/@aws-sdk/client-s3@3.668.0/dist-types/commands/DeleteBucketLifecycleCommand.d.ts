import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import { DeleteBucketLifecycleRequest } from "../models/models_0";
import { S3ClientResolvedConfig, ServiceInputTypes, ServiceOutputTypes } from "../S3Client";
/**
 * @public
 */
export type { __MetadataBearer };
export { $Command };
/**
 * @public
 *
 * The input for {@link DeleteBucketLifecycleCommand}.
 */
export interface DeleteBucketLifecycleCommandInput extends DeleteBucketLifecycleRequest {
}
/**
 * @public
 *
 * The output of {@link DeleteBucketLifecycleCommand}.
 */
export interface DeleteBucketLifecycleCommandOutput extends __MetadataBearer {
}
declare const DeleteBucketLifecycleCommand_base: {
    new (input: DeleteBucketLifecycleCommandInput): import("@smithy/smithy-client").CommandImpl<DeleteBucketLifecycleCommandInput, DeleteBucketLifecycleCommandOutput, S3ClientResolvedConfig, ServiceInputTypes, ServiceOutputTypes>;
    new (__0_0: DeleteBucketLifecycleCommandInput): import("@smithy/smithy-client").CommandImpl<DeleteBucketLifecycleCommandInput, DeleteBucketLifecycleCommandOutput, S3ClientResolvedConfig, ServiceInputTypes, ServiceOutputTypes>;
    getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
/**
 * <note>
 *             <p>This operation is not supported by directory buckets.</p>
 *          </note>
 *          <p>Deletes the lifecycle configuration from the specified bucket. Amazon S3 removes all the
 *          lifecycle configuration rules in the lifecycle subresource associated with the bucket. Your
 *          objects never expire, and Amazon S3 no longer automatically deletes any objects on the basis of
 *          rules contained in the deleted lifecycle configuration.</p>
 *          <p>To use this operation, you must have permission to perform the
 *             <code>s3:PutLifecycleConfiguration</code> action. By default, the bucket owner has this
 *          permission and the bucket owner can grant this permission to others.</p>
 *          <p>There is usually some time lag before lifecycle configuration deletion is fully
 *          propagated to all the Amazon S3 systems.</p>
 *          <p>For more information about the object expiration, see <a href="https://docs.aws.amazon.com/AmazonS3/latest/dev/intro-lifecycle-rules.html#intro-lifecycle-rules-actions">Elements to Describe Lifecycle Actions</a>.</p>
 *          <p>Related actions include:</p>
 *          <ul>
 *             <li>
 *                <p>
 *                   <a href="https://docs.aws.amazon.com/AmazonS3/latest/API/API_PutBucketLifecycleConfiguration.html">PutBucketLifecycleConfiguration</a>
 *                </p>
 *             </li>
 *             <li>
 *                <p>
 *                   <a href="https://docs.aws.amazon.com/AmazonS3/latest/API/API_GetBucketLifecycleConfiguration.html">GetBucketLifecycleConfiguration</a>
 *                </p>
 *             </li>
 *          </ul>
 * @example
 * Use a bare-bones client and the command you need to make an API call.
 * ```javascript
 * import { S3Client, DeleteBucketLifecycleCommand } from "@aws-sdk/client-s3"; // ES Modules import
 * // const { S3Client, DeleteBucketLifecycleCommand } = require("@aws-sdk/client-s3"); // CommonJS import
 * const client = new S3Client(config);
 * const input = { // DeleteBucketLifecycleRequest
 *   Bucket: "STRING_VALUE", // required
 *   ExpectedBucketOwner: "STRING_VALUE",
 * };
 * const command = new DeleteBucketLifecycleCommand(input);
 * const response = await client.send(command);
 * // {};
 *
 * ```
 *
 * @param DeleteBucketLifecycleCommandInput - {@link DeleteBucketLifecycleCommandInput}
 * @returns {@link DeleteBucketLifecycleCommandOutput}
 * @see {@link DeleteBucketLifecycleCommandInput} for command's `input` shape.
 * @see {@link DeleteBucketLifecycleCommandOutput} for command's `response` shape.
 * @see {@link S3ClientResolvedConfig | config} for S3Client's `config` shape.
 *
 * @throws {@link S3ServiceException}
 * <p>Base exception class for all service exceptions from S3 service.</p>
 *
 * @public
 * @example To delete lifecycle configuration on a bucket.
 * ```javascript
 * // The following example deletes lifecycle configuration on a bucket.
 * const input = {
 *   "Bucket": "examplebucket"
 * };
 * const command = new DeleteBucketLifecycleCommand(input);
 * await client.send(command);
 * // example id: to-delete-lifecycle-configuration-on-a-bucket-1483043310583
 * ```
 *
 */
export declare class DeleteBucketLifecycleCommand extends DeleteBucketLifecycleCommand_base {
    /** @internal type navigation helper, not in runtime. */
    protected static __types: {
        api: {
            input: DeleteBucketLifecycleRequest;
            output: {};
        };
        sdk: {
            input: DeleteBucketLifecycleCommandInput;
            output: DeleteBucketLifecycleCommandOutput;
        };
    };
}
