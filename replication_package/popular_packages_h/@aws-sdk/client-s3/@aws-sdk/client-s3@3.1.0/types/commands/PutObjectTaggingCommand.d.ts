import { S3ClientResolvedConfig, ServiceInputTypes, ServiceOutputTypes } from "../S3Client";
import { PutObjectTaggingOutput, PutObjectTaggingRequest } from "../models/models_0";
import { Command as $Command } from "@aws-sdk/smithy-client";
import { Handler, MiddlewareStack, HttpHandlerOptions as __HttpHandlerOptions, MetadataBearer as __MetadataBearer } from "@aws-sdk/types";
export declare type PutObjectTaggingCommandInput = PutObjectTaggingRequest;
export declare type PutObjectTaggingCommandOutput = PutObjectTaggingOutput & __MetadataBearer;
/**
 * <p>Sets the supplied tag-set to an object that already exists in a bucket.</p>
 *          <p>A tag is a key-value pair. You can associate tags with an object by sending a PUT
 *          request against the tagging subresource that is associated with the object. You can
 *          retrieve tags by sending a GET request. For more information, see <a href="https://docs.aws.amazon.com/AmazonS3/latest/API/API_GetObjectTagging.html">GetObjectTagging</a>.</p>
 *
 *          <p>For tagging-related restrictions related to characters and encodings, see <a href="https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/allocation-tag-restrictions.html">Tag
 *             Restrictions</a>. Note that Amazon S3 limits the maximum number of tags to 10 tags per
 *          object.</p>
 *
 *          <p>To use this operation, you must have permission to perform the
 *             <code>s3:PutObjectTagging</code> action. By default, the bucket owner has this
 *          permission and can grant this permission to others.</p>
 *
 *          <p>To put tags of any other version, use the <code>versionId</code> query parameter. You
 *          also need permission for the <code>s3:PutObjectVersionTagging</code> action.</p>
 *
 *          <p>For information about the Amazon S3 object tagging feature, see <a href="https://docs.aws.amazon.com/AmazonS3/latest/dev/object-tagging.html">Object Tagging</a>.</p>
 *
 *
 *          <p class="title">
 *             <b>Special Errors</b>
 *          </p>
 *          <ul>
 *             <li>
 *                <ul>
 *                   <li>
 *                      <p>
 *                         <i>Code: InvalidTagError </i>
 *                      </p>
 *                   </li>
 *                   <li>
 *                      <p>
 *                         <i>Cause: The tag provided was not a valid tag. This error can occur
 *                         if the tag did not pass input validation. For more information, see <a href="https://docs.aws.amazon.com/AmazonS3/latest/dev/object-tagging.html">Object Tagging</a>.</i>
 *                      </p>
 *                   </li>
 *                </ul>
 *             </li>
 *             <li>
 *                <ul>
 *                   <li>
 *                      <p>
 *                         <i>Code: MalformedXMLError </i>
 *                      </p>
 *                   </li>
 *                   <li>
 *                      <p>
 *                         <i>Cause: The XML provided does not match the schema.</i>
 *                      </p>
 *                   </li>
 *                </ul>
 *             </li>
 *             <li>
 *                <ul>
 *                   <li>
 *                      <p>
 *                         <i>Code: OperationAbortedError </i>
 *                      </p>
 *                   </li>
 *                   <li>
 *                      <p>
 *                         <i>Cause: A conflicting conditional operation is currently in
 *                         progress against this resource. Please try again.</i>
 *                      </p>
 *                   </li>
 *                </ul>
 *             </li>
 *             <li>
 *                <ul>
 *                   <li>
 *                      <p>
 *                         <i>Code: InternalError</i>
 *                      </p>
 *                   </li>
 *                   <li>
 *                      <p>
 *                         <i>Cause: The service was unable to apply the provided tag to the
 *                         object.</i>
 *                      </p>
 *                   </li>
 *                </ul>
 *             </li>
 *          </ul>
 *
 *
 *
 *
 *
 *
 *          <p class="title">
 *             <b>Related Resources</b>
 *          </p>
 *          <ul>
 *             <li>
 *                <p>
 *                   <a href="https://docs.aws.amazon.com/AmazonS3/latest/API/API_GetObjectTagging.html">GetObjectTagging</a>
 *                </p>
 *             </li>
 *          </ul>
 */
export declare class PutObjectTaggingCommand extends $Command<PutObjectTaggingCommandInput, PutObjectTaggingCommandOutput, S3ClientResolvedConfig> {
    readonly input: PutObjectTaggingCommandInput;
    constructor(input: PutObjectTaggingCommandInput);
    /**
     * @internal
     */
    resolveMiddleware(clientStack: MiddlewareStack<ServiceInputTypes, ServiceOutputTypes>, configuration: S3ClientResolvedConfig, options?: __HttpHandlerOptions): Handler<PutObjectTaggingCommandInput, PutObjectTaggingCommandOutput>;
    private serialize;
    private deserialize;
}