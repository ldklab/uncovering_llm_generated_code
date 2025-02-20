import { S3ClientResolvedConfig, ServiceInputTypes, ServiceOutputTypes } from "../S3Client";
import { GetObjectRetentionOutput, GetObjectRetentionRequest } from "../models/models_0";
import { Command as $Command } from "@aws-sdk/smithy-client";
import { Handler, MiddlewareStack, HttpHandlerOptions as __HttpHandlerOptions, MetadataBearer as __MetadataBearer } from "@aws-sdk/types";
export declare type GetObjectRetentionCommandInput = GetObjectRetentionRequest;
export declare type GetObjectRetentionCommandOutput = GetObjectRetentionOutput & __MetadataBearer;
/**
 * <p>Retrieves an object's retention settings. For more information, see <a href="https://docs.aws.amazon.com/AmazonS3/latest/dev/object-lock.html">Locking Objects</a>.</p>
 *          <p>This action is not supported by Amazon S3 on Outposts.</p>
 */
export declare class GetObjectRetentionCommand extends $Command<GetObjectRetentionCommandInput, GetObjectRetentionCommandOutput, S3ClientResolvedConfig> {
    readonly input: GetObjectRetentionCommandInput;
    constructor(input: GetObjectRetentionCommandInput);
    /**
     * @internal
     */
    resolveMiddleware(clientStack: MiddlewareStack<ServiceInputTypes, ServiceOutputTypes>, configuration: S3ClientResolvedConfig, options?: __HttpHandlerOptions): Handler<GetObjectRetentionCommandInput, GetObjectRetentionCommandOutput>;
    private serialize;
    private deserialize;
}
