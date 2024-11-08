"use strict";
const { GoogleAuth } = require("./auth/googleauth");
const gcpMetadata = require("gcp-metadata");
const gaxios = require("gaxios");
const { AuthClient, DEFAULT_UNIVERSE } = require("./auth/authclient");
const { Compute } = require("./auth/computeclient");
const { GCPEnv } = require("./auth/envDetect");
const { IAMAuth } = require("./auth/iam");
const { IdTokenClient } = require("./auth/idtokenclient");
const { JWTAccess } = require("./auth/jwtaccess");
const { JWT } = require("./auth/jwtclient");
const { Impersonated } = require("./auth/impersonated");
const {
  CodeChallengeMethod,
  OAuth2Client,
  ClientAuthentication,
} = require("./auth/oauth2client");
const { LoginTicket } = require("./auth/loginticket");
const { UserRefreshClient } = require("./auth/refreshclient");
const { AwsClient } = require("./auth/awsclient");
const { AwsRequestSigner } = require("./auth/awsrequestsigner");
const { IdentityPoolClient } = require("./auth/identitypoolclient");
const {
  ExternalAccountClient,
} = require("./auth/externalclient");
const {
  BaseExternalAccountClient,
} = require("./auth/baseexternalclient");
const { DownscopedClient } = require("./auth/downscopedclient");
const {
  PluggableAuthClient,
  ExecutableError,
} = require("./auth/pluggable-auth-client");
const { PassThroughClient } = require("./auth/passthrough");
const { DefaultTransporter } = require("./transporters");

const auth = new GoogleAuth();

module.exports = {
  GoogleAuth,
  auth,
  gcpMetadata,
  gaxios,
  AuthClient,
  DEFAULT_UNIVERSE,
  Compute,
  GCPEnv,
  IAMAuth,
  IdTokenClient,
  JWTAccess,
  JWT,
  Impersonated,
  CodeChallengeMethod,
  OAuth2Client,
  ClientAuthentication,
  LoginTicket,
  UserRefreshClient,
  AwsClient,
  AwsRequestSigner,
  IdentityPoolClient,
  ExternalAccountClient,
  BaseExternalAccountClient,
  DownscopedClient,
  PluggableAuthClient,
  ExecutableError,
  PassThroughClient,
  DefaultTransporter,
};
