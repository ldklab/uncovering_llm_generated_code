import { __assign, __extends } from "tslib";
import { ClientDefaultValues as __ClientDefaultValues } from "./runtimeConfig";
import { resolveEndpointsConfig, resolveRegionConfig, } from "@aws-sdk/config-resolver";
import { getContentLengthPlugin } from "@aws-sdk/middleware-content-length";
import { getHostHeaderPlugin, resolveHostHeaderConfig, } from "@aws-sdk/middleware-host-header";
import { getLoggerPlugin } from "@aws-sdk/middleware-logger";
import { getRetryPlugin, resolveRetryConfig } from "@aws-sdk/middleware-retry";
import { resolveAwsAuthConfig } from "@aws-sdk/middleware-signing";
import { getUserAgentPlugin, resolveUserAgentConfig, } from "@aws-sdk/middleware-user-agent";
import { Client as __Client, } from "@aws-sdk/smithy-client";
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
var SSOOIDCClient = /** @class */ (function (_super) {
    __extends(SSOOIDCClient, _super);
    function SSOOIDCClient(configuration) {
        var _this = this;
        var _config_0 = __assign(__assign({}, __ClientDefaultValues), configuration);
        var _config_1 = resolveRegionConfig(_config_0);
        var _config_2 = resolveEndpointsConfig(_config_1);
        var _config_3 = resolveAwsAuthConfig(_config_2);
        var _config_4 = resolveRetryConfig(_config_3);
        var _config_5 = resolveHostHeaderConfig(_config_4);
        var _config_6 = resolveUserAgentConfig(_config_5);
        _this = _super.call(this, _config_6) || this;
        _this.config = _config_6;
        _this.middlewareStack.use(getRetryPlugin(_this.config));
        _this.middlewareStack.use(getContentLengthPlugin(_this.config));
        _this.middlewareStack.use(getHostHeaderPlugin(_this.config));
        _this.middlewareStack.use(getLoggerPlugin(_this.config));
        _this.middlewareStack.use(getUserAgentPlugin(_this.config));
        return _this;
    }
    SSOOIDCClient.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
    };
    return SSOOIDCClient;
}(__Client));
export { SSOOIDCClient };
//# sourceMappingURL=SSOOIDCClient.js.map