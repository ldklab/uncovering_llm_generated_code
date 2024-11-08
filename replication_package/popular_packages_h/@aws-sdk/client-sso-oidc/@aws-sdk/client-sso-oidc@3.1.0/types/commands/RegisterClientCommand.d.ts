import { SSOOIDCClientResolvedConfig, ServiceInputTypes, ServiceOutputTypes } from "../SSOOIDCClient";
import { RegisterClientRequest, RegisterClientResponse } from "../models/models_0";
import { Command as $Command } from "@aws-sdk/smithy-client";
import { Handler, MiddlewareStack, HttpHandlerOptions as __HttpHandlerOptions, MetadataBearer as __MetadataBearer } from "@aws-sdk/types";
export declare type RegisterClientCommandInput = RegisterClientRequest;
export declare type RegisterClientCommandOutput = RegisterClientResponse & __MetadataBearer;
/**
 * <p>Registers a client with AWS SSO. This allows clients to initiate device authorization.
 *       The output should be persisted for reuse through many authentication requests.</p>
 */
export declare class RegisterClientCommand extends $Command<RegisterClientCommandInput, RegisterClientCommandOutput, SSOOIDCClientResolvedConfig> {
    readonly input: RegisterClientCommandInput;
    constructor(input: RegisterClientCommandInput);
    /**
     * @internal
     */
    resolveMiddleware(clientStack: MiddlewareStack<ServiceInputTypes, ServiceOutputTypes>, configuration: SSOOIDCClientResolvedConfig, options?: __HttpHandlerOptions): Handler<RegisterClientCommandInput, RegisterClientCommandOutput>;
    private serialize;
    private deserialize;
}
