import { SSOOIDCClient } from "./SSOOIDCClient";
import { CreateTokenCommandInput, CreateTokenCommandOutput } from "./commands/CreateTokenCommand";
import { RegisterClientCommandInput, RegisterClientCommandOutput } from "./commands/RegisterClientCommand";
import { StartDeviceAuthorizationCommandInput, StartDeviceAuthorizationCommandOutput } from "./commands/StartDeviceAuthorizationCommand";
import { HttpHandlerOptions as __HttpHandlerOptions } from "@aws-sdk/types";
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
export declare class SSOOIDC extends SSOOIDCClient {
    /**
     * <p>Creates and returns an access token for the authorized client. The access token issued
     *       will be used to fetch short-term credentials for the assigned roles in the AWS
     *       account.</p>
     */
    createToken(args: CreateTokenCommandInput, options?: __HttpHandlerOptions): Promise<CreateTokenCommandOutput>;
    createToken(args: CreateTokenCommandInput, cb: (err: any, data?: CreateTokenCommandOutput) => void): void;
    createToken(args: CreateTokenCommandInput, options: __HttpHandlerOptions, cb: (err: any, data?: CreateTokenCommandOutput) => void): void;
    /**
     * <p>Registers a client with AWS SSO. This allows clients to initiate device authorization.
     *       The output should be persisted for reuse through many authentication requests.</p>
     */
    registerClient(args: RegisterClientCommandInput, options?: __HttpHandlerOptions): Promise<RegisterClientCommandOutput>;
    registerClient(args: RegisterClientCommandInput, cb: (err: any, data?: RegisterClientCommandOutput) => void): void;
    registerClient(args: RegisterClientCommandInput, options: __HttpHandlerOptions, cb: (err: any, data?: RegisterClientCommandOutput) => void): void;
    /**
     * <p>Initiates device authorization by requesting a pair of verification codes from the authorization service.</p>
     */
    startDeviceAuthorization(args: StartDeviceAuthorizationCommandInput, options?: __HttpHandlerOptions): Promise<StartDeviceAuthorizationCommandOutput>;
    startDeviceAuthorization(args: StartDeviceAuthorizationCommandInput, cb: (err: any, data?: StartDeviceAuthorizationCommandOutput) => void): void;
    startDeviceAuthorization(args: StartDeviceAuthorizationCommandInput, options: __HttpHandlerOptions, cb: (err: any, data?: StartDeviceAuthorizationCommandOutput) => void): void;
}
