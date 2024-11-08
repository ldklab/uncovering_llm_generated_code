"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

// Export the GoogleAuth class
const { GoogleAuth } = require("./auth/googleauth");
exports.GoogleAuth = GoogleAuth;

// Export common dependencies
exports.gcpMetadata = require("gcp-metadata");
exports.gaxios = require("gaxios");

// Export authentication clients and utilities
const { AuthClient, DEFAULT_UNIVERSE } = require("./auth/authclient");
exports.AuthClient = AuthClient;
exports.DEFAULT_UNIVERSE = DEFAULT_UNIVERSE;

const { Compute } = require("./auth/computeclient");
exports.Compute = Compute;

const { GCPEnv } = require("./auth/envDetect");
exports.GCPEnv = GCPEnv;

const { IAMAuth } = require("./auth/iam");
exports.IAMAuth = IAMAuth;

const { IdTokenClient } = require("./auth/idtokenclient");
exports.IdTokenClient = IdTokenClient;

const { JWTAccess } = require("./auth/jwtaccess");
exports.JWTAccess = JWTAccess;

const { JWT } = require("./auth/jwtclient");
exports.JWT = JWT;

const { Impersonated } = require("./auth/impersonated");
exports.Impersonated = Impersonated;

const { CodeChallengeMethod, OAuth2Client, ClientAuthentication } = require("./auth/oauth2client");
exports.CodeChallengeMethod = CodeChallengeMethod;
exports.OAuth2Client = OAuth2Client;
exports.ClientAuthentication = ClientAuthentication;

const { LoginTicket } = require("./auth/loginticket");
exports.LoginTicket = LoginTicket;

const { UserRefreshClient } = require("./auth/refreshclient");
exports.UserRefreshClient = UserRefreshClient;

const { AwsClient } = require("./auth/awsclient");
exports.AwsClient = AwsClient;

const { AwsRequestSigner } = require("./auth/awsrequestsigner");
exports.AwsRequestSigner = AwsRequestSigner;

const { IdentityPoolClient } = require("./auth/identitypoolclient");
exports.IdentityPoolClient = IdentityPoolClient;

const { ExternalAccountClient } = require("./auth/externalclient");
exports.ExternalAccountClient = ExternalAccountClient;

const { BaseExternalAccountClient } = require("./auth/baseexternalclient");
exports.BaseExternalAccountClient = BaseExternalAccountClient;

const { DownscopedClient } = require("./auth/downscopedclient");
exports.DownscopedClient = DownscopedClient;

const { PluggableAuthClient, ExecutableError } = require("./auth/pluggable-auth-client");
exports.PluggableAuthClient = PluggableAuthClient;
exports.ExecutableError = ExecutableError;

const { PassThroughClient } = require("./auth/passthrough");
exports.PassThroughClient = PassThroughClient;

const { DefaultTransporter } = require("./transporters");
exports.DefaultTransporter = DefaultTransporter;

// Instantiate and export an auth object
exports.auth = new GoogleAuth();
