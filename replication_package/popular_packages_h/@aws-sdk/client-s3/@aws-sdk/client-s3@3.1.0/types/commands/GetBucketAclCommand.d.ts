import { S3ClientResolvedConfig, ServiceInputTypes, ServiceOutputTypes } from "../S3Client";
import { GetBucketAclOutput, GetBucketAclRequest } from "../models/models_0";
import { Command as $Command } from "@aws-sdk/smithy-client";
import { Handler, MiddlewareStack, HttpHandlerOptions as __HttpHandlerOptions, MetadataBearer as __MetadataBearer } from "@aws-sdk/types";
export declare type GetBucketAclCommandInput = GetBucketAclRequest;
export declare type GetBucketAclCommandOutput = GetBucketAclOutput & __MetadataBearer;
/**
 * <p>This implementation of the <code>GET</code> operation uses the <code>acl</code>
 *          subresource to return the access control list (ACL) of a bucket. To use <code>GET</code> to
 *          return the ACL of the bucket, you must have <code>READ_ACP</code> access to the bucket. If
 *             <code>READ_ACP</code> permission is granted to the anonymous user, you can return the
 *          ACL of the bucket without using an authorization header.</p>
 *
 *          <p class="title">
 *             <b>Related Resources</b>
 *          </p>
 *          <ul>
 *             <li>
 *                <p>
 *                   <a href="https://docs.aws.amazon.com/AmazonS3/latest/API/API_ListObjects.html">ListObjects</a>
 *                </p>
 *             </li>
 *          </ul>
 */
export declare class GetBucketAclCommand extends $Command<GetBucketAclCommandInput, GetBucketAclCommandOutput, S3ClientResolvedConfig> {
    readonly input: GetBucketAclCommandInput;
    constructor(input: GetBucketAclCommandInput);
    /**
     * @internal
     */
    resolveMiddleware(clientStack: MiddlewareStack<ServiceInputTypes, ServiceOutputTypes>, configuration: S3ClientResolvedConfig, options?: __HttpHandlerOptions): Handler<GetBucketAclCommandInput, GetBucketAclCommandOutput>;
    private serialize;
    private deserialize;
}
