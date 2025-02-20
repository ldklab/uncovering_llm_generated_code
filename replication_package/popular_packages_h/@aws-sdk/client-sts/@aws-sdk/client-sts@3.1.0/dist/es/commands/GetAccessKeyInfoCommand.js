import { __extends } from "tslib";
import { GetAccessKeyInfoRequest, GetAccessKeyInfoResponse } from "../models/models_0";
import { deserializeAws_queryGetAccessKeyInfoCommand, serializeAws_queryGetAccessKeyInfoCommand, } from "../protocols/Aws_query";
import { getSerdePlugin } from "@aws-sdk/middleware-serde";
import { getAwsAuthPlugin } from "@aws-sdk/middleware-signing";
import { Command as $Command } from "@aws-sdk/smithy-client";
/**
 * <p>Returns the account identifier for the specified access key ID.</p>
 *          <p>Access keys consist of two parts: an access key ID (for example,
 *             <code>AKIAIOSFODNN7EXAMPLE</code>) and a secret access key (for example,
 *             <code>wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY</code>). For more information about
 *          access keys, see <a href="https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html">Managing Access Keys for IAM
 *             Users</a> in the <i>IAM User Guide</i>.</p>
 *          <p>When you pass an access key ID to this operation, it returns the ID of the AWS account
 *          to which the keys belong. Access key IDs beginning with <code>AKIA</code> are long-term
 *          credentials for an IAM user or the AWS account root user. Access key IDs beginning with
 *             <code>ASIA</code> are temporary credentials that are created using STS operations. If
 *          the account in the response belongs to you, you can sign in as the root user and review
 *          your root user access keys. Then, you can pull a <a href="https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_getting-report.html">credentials report</a> to
 *          learn which IAM user owns the keys. To learn who requested the temporary credentials for
 *          an <code>ASIA</code> access key, view the STS events in your <a href="https://docs.aws.amazon.com/IAM/latest/UserGuide/cloudtrail-integration.html">CloudTrail logs</a> in the
 *             <i>IAM User Guide</i>.</p>
 *          <p>This operation does not indicate the state of the access key. The key might be active,
 *          inactive, or deleted. Active keys might not have permissions to perform an operation.
 *          Providing a deleted access key might return an error that the key doesn't exist.</p>
 */
var GetAccessKeyInfoCommand = /** @class */ (function (_super) {
    __extends(GetAccessKeyInfoCommand, _super);
    // Start section: command_properties
    // End section: command_properties
    function GetAccessKeyInfoCommand(input) {
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
    GetAccessKeyInfoCommand.prototype.resolveMiddleware = function (clientStack, configuration, options) {
        this.middlewareStack.use(getSerdePlugin(configuration, this.serialize, this.deserialize));
        this.middlewareStack.use(getAwsAuthPlugin(configuration));
        var stack = clientStack.concat(this.middlewareStack);
        var logger = configuration.logger;
        var clientName = "STSClient";
        var commandName = "GetAccessKeyInfoCommand";
        var handlerExecutionContext = {
            logger: logger,
            clientName: clientName,
            commandName: commandName,
            inputFilterSensitiveLog: GetAccessKeyInfoRequest.filterSensitiveLog,
            outputFilterSensitiveLog: GetAccessKeyInfoResponse.filterSensitiveLog,
        };
        var requestHandler = configuration.requestHandler;
        return stack.resolve(function (request) {
            return requestHandler.handle(request.request, options || {});
        }, handlerExecutionContext);
    };
    GetAccessKeyInfoCommand.prototype.serialize = function (input, context) {
        return serializeAws_queryGetAccessKeyInfoCommand(input, context);
    };
    GetAccessKeyInfoCommand.prototype.deserialize = function (output, context) {
        return deserializeAws_queryGetAccessKeyInfoCommand(output, context);
    };
    return GetAccessKeyInfoCommand;
}($Command));
export { GetAccessKeyInfoCommand };
//# sourceMappingURL=GetAccessKeyInfoCommand.js.map