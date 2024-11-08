import { SSOOIDCClientResolvedConfig, ServiceInputTypes, ServiceOutputTypes } from "../SSOOIDCClient";
import { CreateTokenRequest, CreateTokenResponse } from "../models/models_0";
import { Command as $Command } from "@aws-sdk/smithy-client";
import { Handler, MiddlewareStack, HttpHandlerOptions as __HttpHandlerOptions, MetadataBearer as __MetadataBearer } from "@aws-sdk/types";
export declare type CreateTokenCommandInput = CreateTokenRequest;
export declare type CreateTokenCommandOutput = CreateTokenResponse & __MetadataBearer;
/**
 * <p>Creates and returns an access token for the authorized client. The access token issued
 *       will be used to fetch short-term credentials for the assigned roles in the AWS
 *       account.</p>
 */
export declare class CreateTokenCommand extends $Command<CreateTokenCommandInput, CreateTokenCommandOutput, SSOOIDCClientResolvedConfig> {
    readonly input: CreateTokenCommandInput;
    constructor(input: CreateTokenCommandInput);
    /**
     * @internal
     */
    resolveMiddleware(clientStack: MiddlewareStack<ServiceInputTypes, ServiceOutputTypes>, configuration: SSOOIDCClientResolvedConfig, options?: __HttpHandlerOptions): Handler<CreateTokenCommandInput, CreateTokenCommandOutput>;
    private serialize;
    private deserialize;
}
