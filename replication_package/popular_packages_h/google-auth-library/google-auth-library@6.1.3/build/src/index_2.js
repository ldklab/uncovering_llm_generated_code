"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleAuth = exports.auth = void 0;

// Copyright 2017 Google LLC
// Licensed under the Apache License, Version 2.0
// See the License for specific terms at http://www.apache.org/licenses/LICENSE-2.0

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

const auth = new GoogleAuth();
exports.auth = auth;
