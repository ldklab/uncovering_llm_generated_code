import { SSOOIDCClientResolvedConfig, ServiceInputTypes, ServiceOutputTypes } from "../SSOOIDCClient";
import { StartDeviceAuthorizationRequest, StartDeviceAuthorizationResponse } from "../models/models_0";
import { Command as $Command } from "@aws-sdk/smithy-client";
import { Handler, MiddlewareStack, HttpHandlerOptions as __HttpHandlerOptions, MetadataBearer as __MetadataBearer } from "@aws-sdk/types";
export declare type StartDeviceAuthorizationCommandInput = StartDeviceAuthorizationRequest;
export declare type StartDeviceAuthorizationCommandOutput = StartDeviceAuthorizationResponse & __MetadataBearer;
/**
 * <p>Initiates device authorization by requesting a pair of verification codes from the authorization service.</p>
 */
export declare class StartDeviceAuthorizationCommand extends $Command<StartDeviceAuthorizationCommandInput, StartDeviceAuthorizationCommandOutput, SSOOIDCClientResolvedConfig> {
    readonly input: StartDeviceAuthorizationCommandInput;
    constructor(input: StartDeviceAuthorizationCommandInput);
    /**
     * @internal
     */
    resolveMiddleware(clientStack: MiddlewareStack<ServiceInputTypes, ServiceOutputTypes>, configuration: SSOOIDCClientResolvedConfig, options?: __HttpHandlerOptions): Handler<StartDeviceAuthorizationCommandInput, StartDeviceAuthorizationCommandOutput>;
    private serialize;
    private deserialize;
}
