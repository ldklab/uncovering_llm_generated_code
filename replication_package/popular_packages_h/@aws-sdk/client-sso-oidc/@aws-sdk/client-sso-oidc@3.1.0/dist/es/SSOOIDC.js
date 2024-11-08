import { __extends } from "tslib";
import { SSOOIDCClient } from "./SSOOIDCClient";
import { CreateTokenCommand } from "./commands/CreateTokenCommand";
import { RegisterClientCommand, } from "./commands/RegisterClientCommand";
import { StartDeviceAuthorizationCommand, } from "./commands/StartDeviceAuthorizationCommand";
/**
 * <p>AWS Single Sign-On (SSO) OpenID Connect (OIDC) is a web service that enables a client
 *       (such as AWS CLI or a native application) to register with AWS SSO. The service also
 *       enables the client to fetch the user’s access token upon successful authentication and
 *       authorization with AWS SSO. This service conforms with the OAuth 2.0 based implementation of
 *       the device authorization grant standard (<a href="https://tools.ietf.org/html/rfc8628">https://tools.ietf.org/html/rfc8628</a>).</p>
 *
 *          <p>For general information about AWS SSO, see <a href="https://docs.aws.amazon.com/singlesignon/latest/userguide/what-is.html">What is AWS
 *         Single Sign-On?</a> in the <i>AWS SSO User Guide</i>.</p>
 *
 *          <p>This API reference guide describes the AWS SSO OIDC operations that you can call
 *       programatically and includes detailed information on data types and errors.</p>
 *
 *          <note>
 *             <p>AWS provides SDKs that consist of libraries and sample code for various programming
 *         languages and platforms such as Java, Ruby, .Net, iOS, and Android. The SDKs provide a
 *         convenient way to create programmatic access to AWS SSO and other AWS services. For more
 *         information about the AWS SDKs, including how to download and install them, see <a href="http://aws.amazon.com/tools/">Tools for Amazon Web Services</a>.</p>
 *          </note>
 */
var SSOOIDC = /** @class */ (function (_super) {
    __extends(SSOOIDC, _super);
    function SSOOIDC() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SSOOIDC.prototype.createToken = function (args, optionsOrCb, cb) {
        var command = new CreateTokenCommand(args);
        if (typeof optionsOrCb === "function") {
            this.send(command, optionsOrCb);
        }
        else if (typeof cb === "function") {
            if (typeof optionsOrCb !== "object")
                throw new Error("Expect http options but get " + typeof optionsOrCb);
            this.send(command, optionsOrCb || {}, cb);
        }
        else {
            return this.send(command, optionsOrCb);
        }
    };
    SSOOIDC.prototype.registerClient = function (args, optionsOrCb, cb) {
        var command = new RegisterClientCommand(args);
        if (typeof optionsOrCb === "function") {
            this.send(command, optionsOrCb);
        }
        else if (typeof cb === "function") {
            if (typeof optionsOrCb !== "object")
                throw new Error("Expect http options but get " + typeof optionsOrCb);
            this.send(command, optionsOrCb || {}, cb);
        }
        else {
            return this.send(command, optionsOrCb);
        }
    };
    SSOOIDC.prototype.startDeviceAuthorization = function (args, optionsOrCb, cb) {
        var command = new StartDeviceAuthorizationCommand(args);
        if (typeof optionsOrCb === "function") {
            this.send(command, optionsOrCb);
        }
        else if (typeof cb === "function") {
            if (typeof optionsOrCb !== "object")
                throw new Error("Expect http options but get " + typeof optionsOrCb);
            this.send(command, optionsOrCb || {}, cb);
        }
        else {
            return this.send(command, optionsOrCb);
        }
    };
    return SSOOIDC;
}(SSOOIDCClient));
export { SSOOIDC };
//# sourceMappingURL=SSOOIDC.js.map