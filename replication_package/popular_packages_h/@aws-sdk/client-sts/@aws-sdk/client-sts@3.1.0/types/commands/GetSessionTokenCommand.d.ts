import { STSClientResolvedConfig, ServiceInputTypes, ServiceOutputTypes } from "../STSClient";
import { GetSessionTokenRequest, GetSessionTokenResponse } from "../models/models_0";
import { Command as $Command } from "@aws-sdk/smithy-client";
import { Handler, MiddlewareStack, HttpHandlerOptions as __HttpHandlerOptions, MetadataBearer as __MetadataBearer } from "@aws-sdk/types";
export declare type GetSessionTokenCommandInput = GetSessionTokenRequest;
export declare type GetSessionTokenCommandOutput = GetSessionTokenResponse & __MetadataBearer;
/**
 * <p>Returns a set of temporary credentials for an AWS account or IAM user. The
 *          credentials consist of an access key ID, a secret access key, and a security token.
 *          Typically, you use <code>GetSessionToken</code> if you want to use MFA to protect
 *          programmatic calls to specific AWS API operations like Amazon EC2 <code>StopInstances</code>.
 *          MFA-enabled IAM users would need to call <code>GetSessionToken</code> and submit an MFA
 *          code that is associated with their MFA device. Using the temporary security credentials
 *          that are returned from the call, IAM users can then make programmatic calls to API
 *          operations that require MFA authentication. If you do not supply a correct MFA code, then
 *          the API returns an access denied error. For a comparison of <code>GetSessionToken</code>
 *          with the other API operations that produce temporary credentials, see <a href="https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_temp_request.html">Requesting
 *             Temporary Security Credentials</a> and <a href="https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_temp_request.html#stsapi_comparison">Comparing the
 *             AWS STS API operations</a> in the <i>IAM User Guide</i>.</p>
 *          <p>
 *             <b>Session Duration</b>
 *          </p>
 *          <p>The <code>GetSessionToken</code> operation must be called by using the long-term AWS
 *          security credentials of the AWS account root user or an IAM user. Credentials that are
 *          created by IAM users are valid for the duration that you specify. This duration can range
 *          from 900 seconds (15 minutes) up to a maximum of 129,600 seconds (36 hours), with a default
 *          of 43,200 seconds (12 hours). Credentials based on account credentials can range from 900
 *          seconds (15 minutes) up to 3,600 seconds (1 hour), with a default of 1 hour. </p>
 *          <p>
 *             <b>Permissions</b>
 *          </p>
 *          <p>The temporary security credentials created by <code>GetSessionToken</code> can be used
 *          to make API calls to any AWS service with the following exceptions:</p>
 *          <ul>
 *             <li>
 *                <p>You cannot call any IAM API operations unless MFA authentication information is
 *                included in the request.</p>
 *             </li>
 *             <li>
 *                <p>You cannot call any STS API <i>except</i>
 *                   <code>AssumeRole</code> or <code>GetCallerIdentity</code>.</p>
 *             </li>
 *          </ul>
 *          <note>
 *             <p>We recommend that you do not call <code>GetSessionToken</code> with AWS account
 *             root user credentials. Instead, follow our <a href="https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html#create-iam-users">best practices</a> by
 *             creating one or more IAM users, giving them the necessary permissions, and using IAM
 *             users for everyday interaction with AWS. </p>
 *          </note>
 *          <p>The credentials that are returned by <code>GetSessionToken</code> are based on
 *          permissions associated with the user whose credentials were used to call the operation. If
 *             <code>GetSessionToken</code> is called using AWS account root user credentials, the
 *          temporary credentials have root user permissions. Similarly, if
 *             <code>GetSessionToken</code> is called using the credentials of an IAM user, the
 *          temporary credentials have the same permissions as the IAM user. </p>
 *          <p>For more information about using <code>GetSessionToken</code> to create temporary
 *          credentials, go to <a href="https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_temp_request.html#api_getsessiontoken">Temporary
 *             Credentials for Users in Untrusted Environments</a> in the
 *             <i>IAM User Guide</i>. </p>
 */
export declare class GetSessionTokenCommand extends $Command<GetSessionTokenCommandInput, GetSessionTokenCommandOutput, STSClientResolvedConfig> {
    readonly input: GetSessionTokenCommandInput;
    constructor(input: GetSessionTokenCommandInput);
    /**
     * @internal
     */
    resolveMiddleware(clientStack: MiddlewareStack<ServiceInputTypes, ServiceOutputTypes>, configuration: STSClientResolvedConfig, options?: __HttpHandlerOptions): Handler<GetSessionTokenCommandInput, GetSessionTokenCommandOutput>;
    private serialize;
    private deserialize;
}
