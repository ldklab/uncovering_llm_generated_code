import { S3ClientResolvedConfig, ServiceInputTypes, ServiceOutputTypes } from "../S3Client";
import { GetObjectTorrentOutput, GetObjectTorrentRequest } from "../models/models_0";
import { Command as $Command } from "@aws-sdk/smithy-client";
import { Handler, MiddlewareStack, HttpHandlerOptions as __HttpHandlerOptions, MetadataBearer as __MetadataBearer } from "@aws-sdk/types";
export declare type GetObjectTorrentCommandInput = GetObjectTorrentRequest;
export declare type GetObjectTorrentCommandOutput = GetObjectTorrentOutput & __MetadataBearer;
/**
 * <p>Returns torrent files from a bucket. BitTorrent can save you bandwidth when you're
 *          distributing large files. For more information about BitTorrent, see <a href="https://docs.aws.amazon.com/AmazonS3/latest/dev/S3Torrent.html">Using BitTorrent with Amazon S3</a>.</p>
 *          <note>
 *             <p>You can get torrent only for objects that are less than 5 GB in size, and that are
 *             not encrypted using server-side encryption with a customer-provided encryption
 *             key.</p>
 *          </note>
 *          <p>To use GET, you must have READ access to the object.</p>
 *          <p>This action is not supported by Amazon S3 on Outposts.</p>
 *          <p>The following operation is related to <code>GetObjectTorrent</code>:</p>
 *          <ul>
 *             <li>
 *                <p>
 *                   <a href="https://docs.aws.amazon.com/AmazonS3/latest/API/API_GetObject.html">GetObject</a>
 *                </p>
 *             </li>
 *          </ul>
 */
export declare class GetObjectTorrentCommand extends $Command<GetObjectTorrentCommandInput, GetObjectTorrentCommandOutput, S3ClientResolvedConfig> {
    readonly input: GetObjectTorrentCommandInput;
    constructor(input: GetObjectTorrentCommandInput);
    /**
     * @internal
     */
    resolveMiddleware(clientStack: MiddlewareStack<ServiceInputTypes, ServiceOutputTypes>, configuration: S3ClientResolvedConfig, options?: __HttpHandlerOptions): Handler<GetObjectTorrentCommandInput, GetObjectTorrentCommandOutput>;
    private serialize;
    private deserialize;
}
