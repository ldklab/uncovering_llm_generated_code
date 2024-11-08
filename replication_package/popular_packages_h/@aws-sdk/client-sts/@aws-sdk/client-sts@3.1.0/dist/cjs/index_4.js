"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

const { __exportStar } = require("tslib");

__exportStar(require("./STSClient"), exports);
__exportStar(require("./STS"), exports);
__exportStar(require("./commands/AssumeRoleCommand"), exports);
__exportStar(require("./commands/AssumeRoleWithSAMLCommand"), exports);
__exportStar(require("./commands/AssumeRoleWithWebIdentityCommand"), exports);
__exportStar(require("./commands/DecodeAuthorizationMessageCommand"), exports);
__exportStar(require("./commands/GetAccessKeyInfoCommand"), exports);
__exportStar(require("./commands/GetCallerIdentityCommand"), exports);
__exportStar(require("./commands/GetFederationTokenCommand"), exports);
__exportStar(require("./commands/GetSessionTokenCommand"), exports);
__exportStar(require("./models/index"), exports);
