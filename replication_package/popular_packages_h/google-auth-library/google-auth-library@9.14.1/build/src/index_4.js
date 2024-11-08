"use strict";

const { GoogleAuth } = require("./auth/googleauth");
const { AuthClient, DEFAULT_UNIVERSE } = require("./auth/authclient");
const { Compute } = require("./auth/computeclient");
const { GCPEnv } = require("./auth/envDetect");
const { IAMAuth } = require("./auth/iam");
const { IdTokenClient } = require("./auth/idtokenclient");
const { JWTAccess } = require("./auth/jwtaccess");
const { JWT } = require("./auth/jwtclient");
const { Impersonated } = require("./auth/impersonated");
const { CodeChallengeMethod, OAuth2Client, ClientAuthentication } = require("./auth/oauth2client");
const { LoginTicket } = require("./auth/loginticket");
const { UserRefreshClient } = require("./auth/refreshclient");
const { AwsClient } = require("./auth/awsclient");
const { AwsRequestSigner } = require("./auth/awsrequestsigner");
const { IdentityPoolClient } = require("./auth/identitypoolclient");
const { ExternalAccountClient } = require("./auth/externalclient");
const { BaseExternalAccountClient } = require("./auth/baseexternalclient");
const { DownscopedClient } = require("./auth/downscopedclient");
const { PluggableAuthClient, ExecutableError } = require("./auth/pluggable-auth-client");
const { PassThroughClient } = require("./auth/passthrough");
const { DefaultTransporter } = require("./transporters");

const gcpMetadata = require("gcp-metadata");
const gaxios = require("gaxios");

// Export all modules
exports.GoogleAuth = GoogleAuth;
exports.gcpMetadata = gcpMetadata;
exports.gaxios = gaxios;
exports.AuthClient = AuthClient;
exports.DEFAULT_UNIVERSE = DEFAULT_UNIVERSE;
exports.Compute = Compute;
exports.GCPEnv = GCPEnv;
exports.IAMAuth = IAMAuth;
exports.IdTokenClient = IdTokenClient;
exports.JWTAccess = JWTAccess;
exports.JWT = JWT;
exports.Impersonated = Impersonated;
exports.CodeChallengeMethod = CodeChallengeMethod;
exports.OAuth2Client = OAuth2Client;
exports.ClientAuthentication = ClientAuthentication;
exports.LoginTicket = LoginTicket;
exports.UserRefreshClient = UserRefreshClient;
exports.AwsClient = AwsClient;
exports.AwsRequestSigner = AwsRequestSigner;
exports.IdentityPoolClient = IdentityPoolClient;
exports.ExternalAccountClient = ExternalAccountClient;
exports.BaseExternalAccountClient = BaseExternalAccountClient;
exports.DownscopedClient = DownscopedClient;
exports.PluggableAuthClient = PluggableAuthClient;
exports.ExecutableError = ExecutableError;
exports.PassThroughClient = PassThroughClient;
exports.DefaultTransporter = DefaultTransporter;

// Initialize a default GoogleAuth client
const auth = new GoogleAuth();
exports.auth = auth;
