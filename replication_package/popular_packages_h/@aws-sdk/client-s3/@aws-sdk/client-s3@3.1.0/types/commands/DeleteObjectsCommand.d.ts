import { S3ClientResolvedConfig, ServiceInputTypes, ServiceOutputTypes } from "../S3Client";
import { DeleteObjectsOutput, DeleteObjectsRequest } from "../models/models_0";
import { Command as $Command } from "@aws-sdk/smithy-client";
import { Handler, MiddlewareStack, HttpHandlerOptions as __HttpHandlerOptions, MetadataBearer as __MetadataBearer } from "@aws-sdk/types";
export declare type DeleteObjectsCommandInput = DeleteObjectsRequest;
export declare type DeleteObjectsCommandOutput = DeleteObjectsOutput & __MetadataBearer;
/**
 * <p>This operation enables you to delete multiple objects from a bucket using a single HTTP
 *          request. If you know the object keys that you want to delete, then this operation provides
 *          a suitable alternative to sending individual delete requests, reducing per-request
 *          overhead.</p>
 *
 *          <p>The request contains a list of up to 1000 keys that you want to delete. In the XML, you
 *          provide the object key names, and optionally, version IDs if you want to delete a specific
 *          version of the object from a versioning-enabled bucket. For each key, Amazon S3 performs a
 *          delete operation and returns the result of that delete, success, or failure, in the
 *          response. Note that if the object specified in the request is not found, Amazon S3 returns the
 *          result as deleted.</p>
 *
 *          <p> The operation supports two modes for the response: verbose and quiet. By default, the
 *          operation uses verbose mode in which the response includes the result of deletion of each
 *          key in your request. In quiet mode the response includes only keys where the delete
 *          operation encountered an error. For a successful deletion, the operation does not return
 *          any information about the delete in the response body.</p>
 *
 *          <p>When performing this operation on an MFA Delete enabled bucket, that attempts to delete
 *          any versioned objects, you must include an MFA token. If you do not provide one, the entire
 *          request will fail, even if there are non-versioned objects you are trying to delete. If you
 *          provide an invalid token, whether there are versioned keys in the request or not, the
 *          entire Multi-Object Delete request will fail. For information about MFA Delete, see <a href="https://docs.aws.amazon.com/AmazonS3/latest/dev/Versioning.html#MultiFactorAuthenticationDelete"> MFA
 *          Delete</a>.</p>
 *
 *          <p>Finally, the Content-MD5 header is required for all Multi-Object Delete requests. Amazon
 *          S3 uses the header value to ensure that your request body has not been altered in
 *          transit.</p>
 *
 *          <p>The following operations are related to <code>DeleteObjects</code>:</p>
 *          <ul>
 *             <li>
 *                <p>
 *                   <a href="https://docs.aws.amazon.com/AmazonS3/latest/API/API_CreateMultipartUpload.html">CreateMultipartUpload</a>
 *                </p>
 *             </li>
 *             <li>
 *                <p>
 *                   <a href="https://docs.aws.amazon.com/AmazonS3/latest/API/API_UploadPart.html">UploadPart</a>
 *                </p>
 *             </li>
 *             <li>
 *                <p>
 *                   <a href="https://docs.aws.amazon.com/AmazonS3/latest/API/API_CompleteMultipartUpload.html">CompleteMultipartUpload</a>
 *                </p>
 *             </li>
 *             <li>
 *                <p>
 *                   <a href="https://docs.aws.amazon.com/AmazonS3/latest/API/API_ListParts.html">ListParts</a>
 *                </p>
 *             </li>
 *             <li>
 *                <p>
 *                   <a href="https://docs.aws.amazon.com/AmazonS3/latest/API/API_AbortMultipartUpload.html">AbortMultipartUpload</a>
 *                </p>
 *             </li>
 *          </ul>
 */
export declare class DeleteObjectsCommand extends $Command<DeleteObjectsCommandInput, DeleteObjectsCommandOutput, S3ClientResolvedConfig> {
    readonly input: DeleteObjectsCommandInput;
    constructor(input: DeleteObjectsCommandInput);
    /**
     * @internal
     */
    resolveMiddleware(clientStack: MiddlewareStack<ServiceInputTypes, ServiceOutputTypes>, configuration: S3ClientResolvedConfig, options?: __HttpHandlerOptions): Handler<DeleteObjectsCommandInput, DeleteObjectsCommandOutput>;
    private serialize;
    private deserialize;
}
