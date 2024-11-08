"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleAuth = exports.auth = void 0;

// Import various authentication related classes and functions
const { GoogleAuth } = require("./auth/googleauth");
const { Compute } = require("./auth/computeclient");
const { GCPEnv } = require("./auth/envDetect");
const { IAMAuth } = require("./auth/iam");
const { IdTokenClient } = require("./auth/idtokenclient");
const { JWTAccess } = require("./auth/jwtaccess");
const { JWT } = require("./auth/jwtclient");
const { CodeChallengeMethod, OAuth2Client } = require("./auth/oauth2client");
const { LoginTicket } = require("./auth/loginticket");
const { UserRefreshClient } = require("./auth/refreshclient");
const { DefaultTransporter } = require("./transporters");

// Export the imported classes and functions
exports.GoogleAuth = GoogleAuth;
exports.Compute = Compute;
exports.GCPEnv = GCPEnv;
exports.IAMAuth = IAMAuth;
exports.IdTokenClient = IdTokenClient;
exports.JWTAccess = JWTAccess;
exports.JWT = JWT;
exports.CodeChallengeMethod = CodeChallengeMethod;
exports.OAuth2Client = OAuth2Client;
exports.LoginTicket = LoginTicket;
exports.UserRefreshClient = UserRefreshClient;
exports.DefaultTransporter = DefaultTransporter;

// Initialize and export an instance of GoogleAuth
const auth = new GoogleAuth();
exports.auth = auth;
