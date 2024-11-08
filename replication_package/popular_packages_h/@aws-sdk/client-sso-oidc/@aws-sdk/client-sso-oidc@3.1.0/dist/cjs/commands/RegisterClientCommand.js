"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterClientCommand = void 0;
const models_0_1 = require("../models/models_0");
const Aws_restJson1_1 = require("../protocols/Aws_restJson1");
const middleware_serde_1 = require("@aws-sdk/middleware-serde");
const smithy_client_1 = require("@aws-sdk/smithy-client");
/**
 * <p>Registers a client with AWS SSO. This allows clients to initiate device authorization.
 *       The output should be persisted for reuse through many authentication requests.</p>
 */
class RegisterClientCommand extends smithy_client_1.Command {
    // Start section: command_properties
    // End section: command_properties
    constructor(input) {
        // Start section: command_constructor
        super();
        this.input = input;
        // End section: command_constructor
    }
    /**
     * @internal
     */
    resolveMiddleware(clientStack, configuration, options) {
        this.middlewareStack.use(middleware_serde_1.getSerdePlugin(configuration, this.serialize, this.deserialize));
        const stack = clientStack.concat(this.middlewareStack);
        const { logger } = configuration;
        const clientName = "SSOOIDCClient";
        const commandName = "RegisterClientCommand";
        const handlerExecutionContext = {
            logger,
            clientName,
            commandName,
            inputFilterSensitiveLog: models_0_1.RegisterClientRequest.filterSensitiveLog,
            outputFilterSensitiveLog: models_0_1.RegisterClientResponse.filterSensitiveLog,
        };
        const { requestHandler } = configuration;
        return stack.resolve((request) => requestHandler.handle(request.request, options || {}), handlerExecutionContext);
    }
    serialize(input, context) {
        return Aws_restJson1_1.serializeAws_restJson1RegisterClientCommand(input, context);
    }
    deserialize(output, context) {
        return Aws_restJson1_1.deserializeAws_restJson1RegisterClientCommand(output, context);
    }
}
exports.RegisterClientCommand = RegisterClientCommand;
//# sourceMappingURL=RegisterClientCommand.js.map