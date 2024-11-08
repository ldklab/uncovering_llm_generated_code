"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");

// Export the STS client and main STS functionality
tslib_1.__exportStar(require("./STSClient"), exports);
tslib_1.__exportStar(require("./STS"), exports);

// Export various command functionalities related to AWS STS operations
tslib_1.__exportStar(require("./commands/AssumeRoleCommand"), exports);
tslib_1.__exportStar(require("./commands/AssumeRoleWithSAMLCommand"), exports);
tslib_1.__exportStar(require("./commands/AssumeRoleWithWebIdentityCommand"), exports);
tslib_1.__exportStar(require("./commands/DecodeAuthorizationMessageCommand"), exports);
tslib_1.__exportStar(require("./commands/GetAccessKeyInfoCommand"), exports);
tslib_1.__exportStar(require("./commands/GetCallerIdentityCommand"), exports);
tslib_1.__exportStar(require("./commands/GetFederationTokenCommand"), exports);
tslib_1.__exportStar(require("./commands/GetSessionTokenCommand"), exports);

// Export all models related to STS operations
tslib_1.__exportStar(require("./models/index"), exports);
//# sourceMappingURL=index.js.map
