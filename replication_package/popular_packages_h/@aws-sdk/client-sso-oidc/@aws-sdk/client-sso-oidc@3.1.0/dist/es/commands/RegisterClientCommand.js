import { __extends } from "tslib";
import { RegisterClientRequest, RegisterClientResponse } from "../models/models_0";
import { deserializeAws_restJson1RegisterClientCommand, serializeAws_restJson1RegisterClientCommand, } from "../protocols/Aws_restJson1";
import { getSerdePlugin } from "@aws-sdk/middleware-serde";
import { Command as $Command } from "@aws-sdk/smithy-client";
/**
 * <p>Registers a client with AWS SSO. This allows clients to initiate device authorization.
 *       The output should be persisted for reuse through many authentication requests.</p>
 */
var RegisterClientCommand = /** @class */ (function (_super) {
    __extends(RegisterClientCommand, _super);
    // Start section: command_properties
    // End section: command_properties
    function RegisterClientCommand(input) {
        var _this = 
        // Start section: command_constructor
        _super.call(this) || this;
        _this.input = input;
        return _this;
        // End section: command_constructor
    }
    /**
     * @internal
     */
    RegisterClientCommand.prototype.resolveMiddleware = function (clientStack, configuration, options) {
        this.middlewareStack.use(getSerdePlugin(configuration, this.serialize, this.deserialize));
        var stack = clientStack.concat(this.middlewareStack);
        var logger = configuration.logger;
        var clientName = "SSOOIDCClient";
        var commandName = "RegisterClientCommand";
        var handlerExecutionContext = {
            logger: logger,
            clientName: clientName,
            commandName: commandName,
            inputFilterSensitiveLog: RegisterClientRequest.filterSensitiveLog,
            outputFilterSensitiveLog: RegisterClientResponse.filterSensitiveLog,
        };
        var requestHandler = configuration.requestHandler;
        return stack.resolve(function (request) {
            return requestHandler.handle(request.request, options || {});
        }, handlerExecutionContext);
    };
    RegisterClientCommand.prototype.serialize = function (input, context) {
        return serializeAws_restJson1RegisterClientCommand(input, context);
    };
    RegisterClientCommand.prototype.deserialize = function (output, context) {
        return deserializeAws_restJson1RegisterClientCommand(output, context);
    };
    return RegisterClientCommand;
}($Command));
export { RegisterClientCommand };
//# sourceMappingURL=RegisterClientCommand.js.map