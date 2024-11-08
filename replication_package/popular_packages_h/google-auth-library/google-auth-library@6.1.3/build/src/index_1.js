"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleAuth = exports.auth = void 0;

// Import necessary authentication components
const { GoogleAuth } = require("./auth/googleauth");
exports.GoogleAuth = GoogleAuth;

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

const { CodeChallengeMethod, OAuth2Client } = require("./auth/oauth2client");
exports.CodeChallengeMethod = CodeChallengeMethod;
exports.OAuth2Client = OAuth2Client;

const { LoginTicket } = require("./auth/loginticket");
exports.LoginTicket = LoginTicket;

const { UserRefreshClient } = require("./auth/refreshclient");
exports.UserRefreshClient = UserRefreshClient;

const { DefaultTransporter } = require("./transporters");
exports.DefaultTransporter = DefaultTransporter;

// Initialize and export a new instance of GoogleAuth
const auth = new GoogleAuth();
exports.auth = auth;
