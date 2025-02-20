import { S3ClientResolvedConfig, ServiceInputTypes, ServiceOutputTypes } from "../S3Client";
import { GetBucketPolicyOutput, GetBucketPolicyRequest } from "../models/models_0";
import { Command as $Command } from "@aws-sdk/smithy-client";
import { Handler, MiddlewareStack, HttpHandlerOptions as __HttpHandlerOptions, MetadataBearer as __MetadataBearer } from "@aws-sdk/types";
export declare type GetBucketPolicyCommandInput = GetBucketPolicyRequest;
export declare type GetBucketPolicyCommandOutput = GetBucketPolicyOutput & __MetadataBearer;
/**
 * <p>Returns the policy of a specified bucket. If you are using an identity other than the
 *          root user of the AWS account that owns the bucket, the calling identity must have the
 *             <code>GetBucketPolicy</code> permissions on the specified bucket and belong to the
 *          bucket owner's account in order to use this operation.</p>
 *
 *          <p>If you don't have <code>GetBucketPolicy</code> permissions, Amazon S3 returns a <code>403
 *             Access Denied</code> error. If you have the correct permissions, but you're not using an
 *          identity that belongs to the bucket owner's account, Amazon S3 returns a <code>405 Method Not
 *             Allowed</code> error.</p>
 *
 *          <important>
 *             <p>As a security precaution, the root user of the AWS account that owns a bucket can
 *             always use this operation, even if the policy explicitly denies the root user the
 *             ability to perform this action.</p>
 *          </important>
 *
 *          <p>For more information about bucket policies, see <a href="https://docs.aws.amazon.com/AmazonS3/latest/dev/using-iam-policies.html">Using Bucket Policies and User
 *             Policies</a>.</p>
 *
 *          <p>The following operation is related to <code>GetBucketPolicy</code>:</p>
 *          <ul>
 *             <li>
 *                <p>
 *                   <a href="https://docs.aws.amazon.com/AmazonS3/latest/API/API_GetObject.html">GetObject</a>
 *                </p>
 *             </li>
 *          </ul>
 */
export declare class GetBucketPolicyCommand extends $Command<GetBucketPolicyCommandInput, GetBucketPolicyCommandOutput, S3ClientResolvedConfig> {
    readonly input: GetBucketPolicyCommandInput;
    constructor(input: GetBucketPolicyCommandInput);
    /**
     * @internal
     */
    resolveMiddleware(clientStack: MiddlewareStack<ServiceInputTypes, ServiceOutputTypes>, configuration: S3ClientResolvedConfig, options?: __HttpHandlerOptions): Handler<GetBucketPolicyCommandInput, GetBucketPolicyCommandOutput>;
    private serialize;
    private deserialize;
}
