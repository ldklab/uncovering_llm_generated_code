import { S3ClientResolvedConfig, ServiceInputTypes, ServiceOutputTypes } from "../S3Client";
import { PutBucketWebsiteRequest } from "../models/models_0";
import { Command as $Command } from "@aws-sdk/smithy-client";
import { Handler, MiddlewareStack, HttpHandlerOptions as __HttpHandlerOptions, MetadataBearer as __MetadataBearer } from "@aws-sdk/types";
export declare type PutBucketWebsiteCommandInput = PutBucketWebsiteRequest;
export declare type PutBucketWebsiteCommandOutput = __MetadataBearer;
/**
 * <p>Sets the configuration of the website that is specified in the <code>website</code>
 *          subresource. To configure a bucket as a website, you can add this subresource on the bucket
 *          with website configuration information such as the file name of the index document and any
 *          redirect rules. For more information, see <a href="https://docs.aws.amazon.com/AmazonS3/latest/dev/WebsiteHosting.html">Hosting Websites on Amazon S3</a>.</p>
 *
 *          <p>This PUT operation requires the <code>S3:PutBucketWebsite</code> permission. By default,
 *          only the bucket owner can configure the website attached to a bucket; however, bucket
 *          owners can allow other users to set the website configuration by writing a bucket policy
 *          that grants them the <code>S3:PutBucketWebsite</code> permission.</p>
 *
 *          <p>To redirect all website requests sent to the bucket's website endpoint, you add a
 *          website configuration with the following elements. Because all requests are sent to another
 *          website, you don't need to provide index document name for the bucket.</p>
 *          <ul>
 *             <li>
 *                <p>
 *                   <code>WebsiteConfiguration</code>
 *                </p>
 *             </li>
 *             <li>
 *                <p>
 *                   <code>RedirectAllRequestsTo</code>
 *                </p>
 *             </li>
 *             <li>
 *                <p>
 *                   <code>HostName</code>
 *                </p>
 *             </li>
 *             <li>
 *                <p>
 *                   <code>Protocol</code>
 *                </p>
 *             </li>
 *          </ul>
 *
 *          <p>If you want granular control over redirects, you can use the following elements to add
 *          routing rules that describe conditions for redirecting requests and information about the
 *          redirect destination. In this case, the website configuration must provide an index
 *          document for the bucket, because some requests might not be redirected. </p>
 *          <ul>
 *             <li>
 *                <p>
 *                   <code>WebsiteConfiguration</code>
 *                </p>
 *             </li>
 *             <li>
 *                <p>
 *                   <code>IndexDocument</code>
 *                </p>
 *             </li>
 *             <li>
 *                <p>
 *                   <code>Suffix</code>
 *                </p>
 *             </li>
 *             <li>
 *                <p>
 *                   <code>ErrorDocument</code>
 *                </p>
 *             </li>
 *             <li>
 *                <p>
 *                   <code>Key</code>
 *                </p>
 *             </li>
 *             <li>
 *                <p>
 *                   <code>RoutingRules</code>
 *                </p>
 *             </li>
 *             <li>
 *                <p>
 *                   <code>RoutingRule</code>
 *                </p>
 *             </li>
 *             <li>
 *                <p>
 *                   <code>Condition</code>
 *                </p>
 *             </li>
 *             <li>
 *                <p>
 *                   <code>HttpErrorCodeReturnedEquals</code>
 *                </p>
 *             </li>
 *             <li>
 *                <p>
 *                   <code>KeyPrefixEquals</code>
 *                </p>
 *             </li>
 *             <li>
 *                <p>
 *                   <code>Redirect</code>
 *                </p>
 *             </li>
 *             <li>
 *                <p>
 *                   <code>Protocol</code>
 *                </p>
 *             </li>
 *             <li>
 *                <p>
 *                   <code>HostName</code>
 *                </p>
 *             </li>
 *             <li>
 *                <p>
 *                   <code>ReplaceKeyPrefixWith</code>
 *                </p>
 *             </li>
 *             <li>
 *                <p>
 *                   <code>ReplaceKeyWith</code>
 *                </p>
 *             </li>
 *             <li>
 *                <p>
 *                   <code>HttpRedirectCode</code>
 *                </p>
 *             </li>
 *          </ul>
 *
 *          <p>Amazon S3 has a limitation of 50 routing rules per website configuration. If you require more
 *          than 50 routing rules, you can use object redirect. For more information, see <a href="https://docs.aws.amazon.com/AmazonS3/latest/dev/how-to-page-redirect.html">Configuring an
 *             Object Redirect</a> in the <i>Amazon Simple Storage Service Developer Guide</i>.</p>
 */
export declare class PutBucketWebsiteCommand extends $Command<PutBucketWebsiteCommandInput, PutBucketWebsiteCommandOutput, S3ClientResolvedConfig> {
    readonly input: PutBucketWebsiteCommandInput;
    constructor(input: PutBucketWebsiteCommandInput);
    /**
     * @internal
     */
    resolveMiddleware(clientStack: MiddlewareStack<ServiceInputTypes, ServiceOutputTypes>, configuration: S3ClientResolvedConfig, options?: __HttpHandlerOptions): Handler<PutBucketWebsiteCommandInput, PutBucketWebsiteCommandOutput>;
    private serialize;
    private deserialize;
}
