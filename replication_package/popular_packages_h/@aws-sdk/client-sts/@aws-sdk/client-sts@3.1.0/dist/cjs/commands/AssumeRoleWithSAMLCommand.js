"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssumeRoleWithSAMLCommand = void 0;
const models_0_1 = require("../models/models_0");
const Aws_query_1 = require("../protocols/Aws_query");
const middleware_serde_1 = require("@aws-sdk/middleware-serde");
const smithy_client_1 = require("@aws-sdk/smithy-client");
/**
 * <p>Returns a set of temporary security credentials for users who have been authenticated
 *          via a SAML authentication response. This operation provides a mechanism for tying an
 *          enterprise identity store or directory to role-based AWS access without user-specific
 *          credentials or configuration. For a comparison of <code>AssumeRoleWithSAML</code> with the
 *          other API operations that produce temporary credentials, see <a href="https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_temp_request.html">Requesting Temporary Security
 *             Credentials</a> and <a href="https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_temp_request.html#stsapi_comparison">Comparing the
 *             AWS STS API operations</a> in the <i>IAM User Guide</i>.</p>
 *          <p>The temporary security credentials returned by this operation consist of an access key
 *          ID, a secret access key, and a security token. Applications can use these temporary
 *          security credentials to sign calls to AWS services.</p>
 *          <p>
 *             <b>Session Duration</b>
 *          </p>
 *          <p>By default, the temporary security credentials created by
 *             <code>AssumeRoleWithSAML</code> last for one hour. However, you can use the optional
 *             <code>DurationSeconds</code> parameter to specify the duration of your session. Your
 *          role session lasts for the duration that you specify, or until the time specified in the
 *          SAML authentication response's <code>SessionNotOnOrAfter</code> value, whichever is
 *          shorter. You can provide a <code>DurationSeconds</code> value from 900 seconds (15 minutes)
 *          up to the maximum session duration setting for the role. This setting can have a value from
 *          1 hour to 12 hours. To learn how to view the maximum value for your role, see <a href="https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_use.html#id_roles_use_view-role-max-session">View the
 *             Maximum Session Duration Setting for a Role</a> in the
 *             <i>IAM User Guide</i>. The maximum session duration limit applies when
 *          you use the <code>AssumeRole*</code> API operations or the <code>assume-role*</code> CLI
 *          commands. However the limit does not apply when you use those operations to create a
 *          console URL. For more information, see <a href="https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_use.html">Using IAM Roles</a> in the
 *             <i>IAM User Guide</i>.</p>
 *          <p>
 *             <b>Permissions</b>
 *          </p>
 *          <p>The temporary security credentials created by <code>AssumeRoleWithSAML</code> can be
 *          used to make API calls to any AWS service with the following exception: you cannot call
 *          the STS <code>GetFederationToken</code> or <code>GetSessionToken</code> API
 *          operations.</p>
 *          <p>(Optional) You can pass inline or managed <a href="https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies.html#policies_session">session policies</a> to
 *          this operation. You can pass a single JSON policy document to use as an inline session
 *          policy. You can also specify up to 10 managed policies to use as managed session policies.
 *          The plain text that you use for both inline and managed session policies can't exceed 2,048
 *          characters. Passing policies to this operation returns new
 *          temporary credentials. The resulting session's permissions are the intersection of the
 *          role's identity-based policy and the session policies. You can use the role's temporary
 *          credentials in subsequent AWS API calls to access resources in the account that owns
 *          the role. You cannot use session policies to grant more permissions than those allowed
 *          by the identity-based policy of the role that is being assumed. For more information, see
 *             <a href="https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies.html#policies_session">Session
 *             Policies</a> in the <i>IAM User Guide</i>.</p>
 *          <p>Calling <code>AssumeRoleWithSAML</code> does not require the use of AWS security
 *          credentials. The identity of the caller is validated by using keys in the metadata document
 *          that is uploaded for the SAML provider entity for your identity provider. </p>
 *          <important>
 *             <p>Calling <code>AssumeRoleWithSAML</code> can result in an entry in your AWS CloudTrail logs.
 *             The entry includes the value in the <code>NameID</code> element of the SAML assertion.
 *             We recommend that you use a <code>NameIDType</code> that is not associated with any
 *             personally identifiable information (PII). For example, you could instead use the
 *             persistent identifier
 *             (<code>urn:oasis:names:tc:SAML:2.0:nameid-format:persistent</code>).</p>
 *          </important>
 *          <p>
 *             <b>Tags</b>
 *          </p>
 *          <p>(Optional) You can configure your IdP to pass attributes into your SAML assertion as
 *          session tags. Each session tag consists of a key name and an associated value. For more
 *          information about session tags, see <a href="https://docs.aws.amazon.com/IAM/latest/UserGuide/id_session-tags.html">Passing Session Tags in STS</a> in the
 *             <i>IAM User Guide</i>.</p>
 *          <p>You can pass up to 50 session tags. The plain text session tag keys can’t exceed 128
 *          characters and the values can’t exceed 256 characters. For these and additional limits, see
 *             <a href="https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_iam-limits.html#reference_iam-limits-entity-length">IAM
 *             and STS Character Limits</a> in the <i>IAM User Guide</i>.</p>
 *
 *          <note>
 *             <p>An AWS conversion compresses the passed session policies and session tags into a
 *             packed binary format that has a separate limit. Your request can fail for this limit
 *             even if your plain text meets the other requirements. The <code>PackedPolicySize</code>
 *             response element indicates by percentage how close the policies and tags for your
 *             request are to the upper size limit.
 *             </p>
 *          </note>
 *
 *          <p>You can pass a session tag with the same key as a tag that is attached to the role. When
 *          you do, session tags override the role's tags with the same key.</p>
 *          <p>An administrator must grant you the permissions necessary to pass session tags. The
 *          administrator can also create granular permissions to allow you to pass only specific
 *          session tags. For more information, see <a href="https://docs.aws.amazon.com/IAM/latest/UserGuide/tutorial_attribute-based-access-control.html">Tutorial: Using Tags
 *             for Attribute-Based Access Control</a> in the
 *          <i>IAM User Guide</i>.</p>
 *          <p>You can set the session tags as transitive. Transitive tags persist during role
 *          chaining. For more information, see <a href="https://docs.aws.amazon.com/IAM/latest/UserGuide/id_session-tags.html#id_session-tags_role-chaining">Chaining Roles
 *             with Session Tags</a> in the <i>IAM User Guide</i>.</p>
 *          <p>
 *             <b>SAML Configuration</b>
 *          </p>
 *          <p>Before your application can call <code>AssumeRoleWithSAML</code>, you must configure
 *          your SAML identity provider (IdP) to issue the claims required by AWS. Additionally, you
 *          must use AWS Identity and Access Management (IAM) to create a SAML provider entity in your AWS account that
 *          represents your identity provider. You must also create an IAM role that specifies this
 *          SAML provider in its trust policy. </p>
 *          <p>For more information, see the following resources:</p>
 *          <ul>
 *             <li>
 *                <p>
 *                   <a href="https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_providers_saml.html">About
 *                   SAML 2.0-based Federation</a> in the <i>IAM User Guide</i>.
 *             </p>
 *             </li>
 *             <li>
 *                <p>
 *                   <a href="https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_providers_create_saml.html">Creating SAML Identity Providers</a> in the
 *                   <i>IAM User Guide</i>. </p>
 *             </li>
 *             <li>
 *                <p>
 *                   <a href="https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_providers_create_saml_relying-party.html">Configuring
 *                   a Relying Party and Claims</a> in the <i>IAM User Guide</i>.
 *             </p>
 *             </li>
 *             <li>
 *                <p>
 *                   <a href="https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_create_for-idp_saml.html">Creating a Role for SAML 2.0 Federation</a> in the
 *                   <i>IAM User Guide</i>. </p>
 *             </li>
 *          </ul>
 */
class AssumeRoleWithSAMLCommand extends smithy_client_1.Command {
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
        const clientName = "STSClient";
        const commandName = "AssumeRoleWithSAMLCommand";
        const handlerExecutionContext = {
            logger,
            clientName,
            commandName,
            inputFilterSensitiveLog: models_0_1.AssumeRoleWithSAMLRequest.filterSensitiveLog,
            outputFilterSensitiveLog: models_0_1.AssumeRoleWithSAMLResponse.filterSensitiveLog,
        };
        const { requestHandler } = configuration;
        return stack.resolve((request) => requestHandler.handle(request.request, options || {}), handlerExecutionContext);
    }
    serialize(input, context) {
        return Aws_query_1.serializeAws_queryAssumeRoleWithSAMLCommand(input, context);
    }
    deserialize(output, context) {
        return Aws_query_1.deserializeAws_queryAssumeRoleWithSAMLCommand(output, context);
    }
}
exports.AssumeRoleWithSAMLCommand = AssumeRoleWithSAMLCommand;
//# sourceMappingURL=AssumeRoleWithSAMLCommand.js.map