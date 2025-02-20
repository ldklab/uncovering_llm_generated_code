import { __extends } from "tslib";
import { GetObjectLegalHoldOutput, GetObjectLegalHoldRequest } from "../models/models_0";
import { deserializeAws_restXmlGetObjectLegalHoldCommand, serializeAws_restXmlGetObjectLegalHoldCommand, } from "../protocols/Aws_restXml";
import { getBucketEndpointPlugin } from "@aws-sdk/middleware-bucket-endpoint";
import { getSerdePlugin } from "@aws-sdk/middleware-serde";
import { Command as $Command } from "@aws-sdk/smithy-client";
/**
 * <p>Gets an object's current Legal Hold status. For more information, see <a href="https://docs.aws.amazon.com/AmazonS3/latest/dev/object-lock.html">Locking Objects</a>.</p>
 *          <p>This action is not supported by Amazon S3 on Outposts.</p>
 */
var GetObjectLegalHoldCommand = /** @class */ (function (_super) {
    __extends(GetObjectLegalHoldCommand, _super);
    // Start section: command_properties
    // End section: command_properties
    function GetObjectLegalHoldCommand(input) {
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
    GetObjectLegalHoldCommand.prototype.resolveMiddleware = function (clientStack, configuration, options) {
        this.middlewareStack.use(getSerdePlugin(configuration, this.serialize, this.deserialize));
        this.middlewareStack.use(getBucketEndpointPlugin(configuration));
        var stack = clientStack.concat(this.middlewareStack);
        var logger = configuration.logger;
        var clientName = "S3Client";
        var commandName = "GetObjectLegalHoldCommand";
        var handlerExecutionContext = {
            logger: logger,
            clientName: clientName,
            commandName: commandName,
            inputFilterSensitiveLog: GetObjectLegalHoldRequest.filterSensitiveLog,
            outputFilterSensitiveLog: GetObjectLegalHoldOutput.filterSensitiveLog,
        };
        var requestHandler = configuration.requestHandler;
        return stack.resolve(function (request) {
            return requestHandler.handle(request.request, options || {});
        }, handlerExecutionContext);
    };
    GetObjectLegalHoldCommand.prototype.serialize = function (input, context) {
        return serializeAws_restXmlGetObjectLegalHoldCommand(input, context);
    };
    GetObjectLegalHoldCommand.prototype.deserialize = function (output, context) {
        return deserializeAws_restXmlGetObjectLegalHoldCommand(output, context);
    };
    return GetObjectLegalHoldCommand;
}($Command));
export { GetObjectLegalHoldCommand };
//# sourceMappingURL=GetObjectLegalHoldCommand.js.map