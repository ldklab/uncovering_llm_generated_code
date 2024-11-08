import { __assign, __awaiter, __generator } from "tslib";
import { HttpRequest as __HttpRequest } from "@aws-sdk/protocol-http";
export var serializeAws_restJson1CreateTokenCommand = function (input, context) { return __awaiter(void 0, void 0, void 0, function () {
    var headers, resolvedPath, body, _a, hostname, _b, protocol, port;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                headers = {
                    "content-type": "application/json",
                };
                resolvedPath = "/token";
                body = JSON.stringify(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign({}, (input.clientId !== undefined && input.clientId !== null && { clientId: input.clientId })), (input.clientSecret !== undefined && input.clientSecret !== null && { clientSecret: input.clientSecret })), (input.code !== undefined && input.code !== null && { code: input.code })), (input.deviceCode !== undefined && input.deviceCode !== null && { deviceCode: input.deviceCode })), (input.grantType !== undefined && input.grantType !== null && { grantType: input.grantType })), (input.redirectUri !== undefined && input.redirectUri !== null && { redirectUri: input.redirectUri })), (input.refreshToken !== undefined && input.refreshToken !== null && { refreshToken: input.refreshToken })), (input.scope !== undefined &&
                    input.scope !== null && { scope: serializeAws_restJson1Scopes(input.scope, context) })));
                return [4 /*yield*/, context.endpoint()];
            case 1:
                _a = _c.sent(), hostname = _a.hostname, _b = _a.protocol, protocol = _b === void 0 ? "https" : _b, port = _a.port;
                return [2 /*return*/, new __HttpRequest({
                        protocol: protocol,
                        hostname: hostname,
                        port: port,
                        method: "POST",
                        headers: headers,
                        path: resolvedPath,
                        body: body,
                    })];
        }
    });
}); };
export var serializeAws_restJson1RegisterClientCommand = function (input, context) { return __awaiter(void 0, void 0, void 0, function () {
    var headers, resolvedPath, body, _a, hostname, _b, protocol, port;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                headers = {
                    "content-type": "application/json",
                };
                resolvedPath = "/client/register";
                body = JSON.stringify(__assign(__assign(__assign({}, (input.clientName !== undefined && input.clientName !== null && { clientName: input.clientName })), (input.clientType !== undefined && input.clientType !== null && { clientType: input.clientType })), (input.scopes !== undefined &&
                    input.scopes !== null && { scopes: serializeAws_restJson1Scopes(input.scopes, context) })));
                return [4 /*yield*/, context.endpoint()];
            case 1:
                _a = _c.sent(), hostname = _a.hostname, _b = _a.protocol, protocol = _b === void 0 ? "https" : _b, port = _a.port;
                return [2 /*return*/, new __HttpRequest({
                        protocol: protocol,
                        hostname: hostname,
                        port: port,
                        method: "POST",
                        headers: headers,
                        path: resolvedPath,
                        body: body,
                    })];
        }
    });
}); };
export var serializeAws_restJson1StartDeviceAuthorizationCommand = function (input, context) { return __awaiter(void 0, void 0, void 0, function () {
    var headers, resolvedPath, body, _a, hostname, _b, protocol, port;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                headers = {
                    "content-type": "application/json",
                };
                resolvedPath = "/device_authorization";
                body = JSON.stringify(__assign(__assign(__assign({}, (input.clientId !== undefined && input.clientId !== null && { clientId: input.clientId })), (input.clientSecret !== undefined && input.clientSecret !== null && { clientSecret: input.clientSecret })), (input.startUrl !== undefined && input.startUrl !== null && { startUrl: input.startUrl })));
                return [4 /*yield*/, context.endpoint()];
            case 1:
                _a = _c.sent(), hostname = _a.hostname, _b = _a.protocol, protocol = _b === void 0 ? "https" : _b, port = _a.port;
                return [2 /*return*/, new __HttpRequest({
                        protocol: protocol,
                        hostname: hostname,
                        port: port,
                        method: "POST",
                        headers: headers,
                        path: resolvedPath,
                        body: body,
                    })];
        }
    });
}); };
export var deserializeAws_restJson1CreateTokenCommand = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var contents, data;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (output.statusCode !== 200 && output.statusCode >= 300) {
                    return [2 /*return*/, deserializeAws_restJson1CreateTokenCommandError(output, context)];
                }
                contents = {
                    $metadata: deserializeMetadata(output),
                    accessToken: undefined,
                    expiresIn: undefined,
                    idToken: undefined,
                    refreshToken: undefined,
                    tokenType: undefined,
                };
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                data = _a.sent();
                if (data.accessToken !== undefined && data.accessToken !== null) {
                    contents.accessToken = data.accessToken;
                }
                if (data.expiresIn !== undefined && data.expiresIn !== null) {
                    contents.expiresIn = data.expiresIn;
                }
                if (data.idToken !== undefined && data.idToken !== null) {
                    contents.idToken = data.idToken;
                }
                if (data.refreshToken !== undefined && data.refreshToken !== null) {
                    contents.refreshToken = data.refreshToken;
                }
                if (data.tokenType !== undefined && data.tokenType !== null) {
                    contents.tokenType = data.tokenType;
                }
                return [2 /*return*/, Promise.resolve(contents)];
        }
    });
}); };
var deserializeAws_restJson1CreateTokenCommandError = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var parsedOutput, _a, response, errorCode, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, parsedBody, message;
    var _p;
    return __generator(this, function (_q) {
        switch (_q.label) {
            case 0:
                _a = [__assign({}, output)];
                _p = {};
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                parsedOutput = __assign.apply(void 0, _a.concat([(_p.body = _q.sent(), _p)]));
                errorCode = "UnknownError";
                errorCode = loadRestJsonErrorCode(output, parsedOutput.body);
                _b = errorCode;
                switch (_b) {
                    case "AccessDeniedException": return [3 /*break*/, 2];
                    case "com.amazonaws.ssooidc#AccessDeniedException": return [3 /*break*/, 2];
                    case "AuthorizationPendingException": return [3 /*break*/, 4];
                    case "com.amazonaws.ssooidc#AuthorizationPendingException": return [3 /*break*/, 4];
                    case "ExpiredTokenException": return [3 /*break*/, 6];
                    case "com.amazonaws.ssooidc#ExpiredTokenException": return [3 /*break*/, 6];
                    case "InternalServerException": return [3 /*break*/, 8];
                    case "com.amazonaws.ssooidc#InternalServerException": return [3 /*break*/, 8];
                    case "InvalidClientException": return [3 /*break*/, 10];
                    case "com.amazonaws.ssooidc#InvalidClientException": return [3 /*break*/, 10];
                    case "InvalidGrantException": return [3 /*break*/, 12];
                    case "com.amazonaws.ssooidc#InvalidGrantException": return [3 /*break*/, 12];
                    case "InvalidRequestException": return [3 /*break*/, 14];
                    case "com.amazonaws.ssooidc#InvalidRequestException": return [3 /*break*/, 14];
                    case "InvalidScopeException": return [3 /*break*/, 16];
                    case "com.amazonaws.ssooidc#InvalidScopeException": return [3 /*break*/, 16];
                    case "SlowDownException": return [3 /*break*/, 18];
                    case "com.amazonaws.ssooidc#SlowDownException": return [3 /*break*/, 18];
                    case "UnauthorizedClientException": return [3 /*break*/, 20];
                    case "com.amazonaws.ssooidc#UnauthorizedClientException": return [3 /*break*/, 20];
                    case "UnsupportedGrantTypeException": return [3 /*break*/, 22];
                    case "com.amazonaws.ssooidc#UnsupportedGrantTypeException": return [3 /*break*/, 22];
                }
                return [3 /*break*/, 24];
            case 2:
                _c = [{}];
                return [4 /*yield*/, deserializeAws_restJson1AccessDeniedExceptionResponse(parsedOutput, context)];
            case 3:
                response = __assign.apply(void 0, [__assign.apply(void 0, _c.concat([(_q.sent())])), { name: errorCode, $metadata: deserializeMetadata(output) }]);
                return [3 /*break*/, 25];
            case 4:
                _d = [{}];
                return [4 /*yield*/, deserializeAws_restJson1AuthorizationPendingExceptionResponse(parsedOutput, context)];
            case 5:
                response = __assign.apply(void 0, [__assign.apply(void 0, _d.concat([(_q.sent())])), { name: errorCode, $metadata: deserializeMetadata(output) }]);
                return [3 /*break*/, 25];
            case 6:
                _e = [{}];
                return [4 /*yield*/, deserializeAws_restJson1ExpiredTokenExceptionResponse(parsedOutput, context)];
            case 7:
                response = __assign.apply(void 0, [__assign.apply(void 0, _e.concat([(_q.sent())])), { name: errorCode, $metadata: deserializeMetadata(output) }]);
                return [3 /*break*/, 25];
            case 8:
                _f = [{}];
                return [4 /*yield*/, deserializeAws_restJson1InternalServerExceptionResponse(parsedOutput, context)];
            case 9:
                response = __assign.apply(void 0, [__assign.apply(void 0, _f.concat([(_q.sent())])), { name: errorCode, $metadata: deserializeMetadata(output) }]);
                return [3 /*break*/, 25];
            case 10:
                _g = [{}];
                return [4 /*yield*/, deserializeAws_restJson1InvalidClientExceptionResponse(parsedOutput, context)];
            case 11:
                response = __assign.apply(void 0, [__assign.apply(void 0, _g.concat([(_q.sent())])), { name: errorCode, $metadata: deserializeMetadata(output) }]);
                return [3 /*break*/, 25];
            case 12:
                _h = [{}];
                return [4 /*yield*/, deserializeAws_restJson1InvalidGrantExceptionResponse(parsedOutput, context)];
            case 13:
                response = __assign.apply(void 0, [__assign.apply(void 0, _h.concat([(_q.sent())])), { name: errorCode, $metadata: deserializeMetadata(output) }]);
                return [3 /*break*/, 25];
            case 14:
                _j = [{}];
                return [4 /*yield*/, deserializeAws_restJson1InvalidRequestExceptionResponse(parsedOutput, context)];
            case 15:
                response = __assign.apply(void 0, [__assign.apply(void 0, _j.concat([(_q.sent())])), { name: errorCode, $metadata: deserializeMetadata(output) }]);
                return [3 /*break*/, 25];
            case 16:
                _k = [{}];
                return [4 /*yield*/, deserializeAws_restJson1InvalidScopeExceptionResponse(parsedOutput, context)];
            case 17:
                response = __assign.apply(void 0, [__assign.apply(void 0, _k.concat([(_q.sent())])), { name: errorCode, $metadata: deserializeMetadata(output) }]);
                return [3 /*break*/, 25];
            case 18:
                _l = [{}];
                return [4 /*yield*/, deserializeAws_restJson1SlowDownExceptionResponse(parsedOutput, context)];
            case 19:
                response = __assign.apply(void 0, [__assign.apply(void 0, _l.concat([(_q.sent())])), { name: errorCode, $metadata: deserializeMetadata(output) }]);
                return [3 /*break*/, 25];
            case 20:
                _m = [{}];
                return [4 /*yield*/, deserializeAws_restJson1UnauthorizedClientExceptionResponse(parsedOutput, context)];
            case 21:
                response = __assign.apply(void 0, [__assign.apply(void 0, _m.concat([(_q.sent())])), { name: errorCode, $metadata: deserializeMetadata(output) }]);
                return [3 /*break*/, 25];
            case 22:
                _o = [{}];
                return [4 /*yield*/, deserializeAws_restJson1UnsupportedGrantTypeExceptionResponse(parsedOutput, context)];
            case 23:
                response = __assign.apply(void 0, [__assign.apply(void 0, _o.concat([(_q.sent())])), { name: errorCode, $metadata: deserializeMetadata(output) }]);
                return [3 /*break*/, 25];
            case 24:
                parsedBody = parsedOutput.body;
                errorCode = parsedBody.code || parsedBody.Code || errorCode;
                response = __assign(__assign({}, parsedBody), { name: "" + errorCode, message: parsedBody.message || parsedBody.Message || errorCode, $fault: "client", $metadata: deserializeMetadata(output) });
                _q.label = 25;
            case 25:
                message = response.message || response.Message || errorCode;
                response.message = message;
                delete response.Message;
                return [2 /*return*/, Promise.reject(Object.assign(new Error(message), response))];
        }
    });
}); };
export var deserializeAws_restJson1RegisterClientCommand = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var contents, data;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (output.statusCode !== 200 && output.statusCode >= 300) {
                    return [2 /*return*/, deserializeAws_restJson1RegisterClientCommandError(output, context)];
                }
                contents = {
                    $metadata: deserializeMetadata(output),
                    authorizationEndpoint: undefined,
                    clientId: undefined,
                    clientIdIssuedAt: undefined,
                    clientSecret: undefined,
                    clientSecretExpiresAt: undefined,
                    tokenEndpoint: undefined,
                };
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                data = _a.sent();
                if (data.authorizationEndpoint !== undefined && data.authorizationEndpoint !== null) {
                    contents.authorizationEndpoint = data.authorizationEndpoint;
                }
                if (data.clientId !== undefined && data.clientId !== null) {
                    contents.clientId = data.clientId;
                }
                if (data.clientIdIssuedAt !== undefined && data.clientIdIssuedAt !== null) {
                    contents.clientIdIssuedAt = data.clientIdIssuedAt;
                }
                if (data.clientSecret !== undefined && data.clientSecret !== null) {
                    contents.clientSecret = data.clientSecret;
                }
                if (data.clientSecretExpiresAt !== undefined && data.clientSecretExpiresAt !== null) {
                    contents.clientSecretExpiresAt = data.clientSecretExpiresAt;
                }
                if (data.tokenEndpoint !== undefined && data.tokenEndpoint !== null) {
                    contents.tokenEndpoint = data.tokenEndpoint;
                }
                return [2 /*return*/, Promise.resolve(contents)];
        }
    });
}); };
var deserializeAws_restJson1RegisterClientCommandError = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var parsedOutput, _a, response, errorCode, _b, _c, _d, _e, _f, parsedBody, message;
    var _g;
    return __generator(this, function (_h) {
        switch (_h.label) {
            case 0:
                _a = [__assign({}, output)];
                _g = {};
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                parsedOutput = __assign.apply(void 0, _a.concat([(_g.body = _h.sent(), _g)]));
                errorCode = "UnknownError";
                errorCode = loadRestJsonErrorCode(output, parsedOutput.body);
                _b = errorCode;
                switch (_b) {
                    case "InternalServerException": return [3 /*break*/, 2];
                    case "com.amazonaws.ssooidc#InternalServerException": return [3 /*break*/, 2];
                    case "InvalidClientMetadataException": return [3 /*break*/, 4];
                    case "com.amazonaws.ssooidc#InvalidClientMetadataException": return [3 /*break*/, 4];
                    case "InvalidRequestException": return [3 /*break*/, 6];
                    case "com.amazonaws.ssooidc#InvalidRequestException": return [3 /*break*/, 6];
                    case "InvalidScopeException": return [3 /*break*/, 8];
                    case "com.amazonaws.ssooidc#InvalidScopeException": return [3 /*break*/, 8];
                }
                return [3 /*break*/, 10];
            case 2:
                _c = [{}];
                return [4 /*yield*/, deserializeAws_restJson1InternalServerExceptionResponse(parsedOutput, context)];
            case 3:
                response = __assign.apply(void 0, [__assign.apply(void 0, _c.concat([(_h.sent())])), { name: errorCode, $metadata: deserializeMetadata(output) }]);
                return [3 /*break*/, 11];
            case 4:
                _d = [{}];
                return [4 /*yield*/, deserializeAws_restJson1InvalidClientMetadataExceptionResponse(parsedOutput, context)];
            case 5:
                response = __assign.apply(void 0, [__assign.apply(void 0, _d.concat([(_h.sent())])), { name: errorCode, $metadata: deserializeMetadata(output) }]);
                return [3 /*break*/, 11];
            case 6:
                _e = [{}];
                return [4 /*yield*/, deserializeAws_restJson1InvalidRequestExceptionResponse(parsedOutput, context)];
            case 7:
                response = __assign.apply(void 0, [__assign.apply(void 0, _e.concat([(_h.sent())])), { name: errorCode, $metadata: deserializeMetadata(output) }]);
                return [3 /*break*/, 11];
            case 8:
                _f = [{}];
                return [4 /*yield*/, deserializeAws_restJson1InvalidScopeExceptionResponse(parsedOutput, context)];
            case 9:
                response = __assign.apply(void 0, [__assign.apply(void 0, _f.concat([(_h.sent())])), { name: errorCode, $metadata: deserializeMetadata(output) }]);
                return [3 /*break*/, 11];
            case 10:
                parsedBody = parsedOutput.body;
                errorCode = parsedBody.code || parsedBody.Code || errorCode;
                response = __assign(__assign({}, parsedBody), { name: "" + errorCode, message: parsedBody.message || parsedBody.Message || errorCode, $fault: "client", $metadata: deserializeMetadata(output) });
                _h.label = 11;
            case 11:
                message = response.message || response.Message || errorCode;
                response.message = message;
                delete response.Message;
                return [2 /*return*/, Promise.reject(Object.assign(new Error(message), response))];
        }
    });
}); };
export var deserializeAws_restJson1StartDeviceAuthorizationCommand = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var contents, data;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (output.statusCode !== 200 && output.statusCode >= 300) {
                    return [2 /*return*/, deserializeAws_restJson1StartDeviceAuthorizationCommandError(output, context)];
                }
                contents = {
                    $metadata: deserializeMetadata(output),
                    deviceCode: undefined,
                    expiresIn: undefined,
                    interval: undefined,
                    userCode: undefined,
                    verificationUri: undefined,
                    verificationUriComplete: undefined,
                };
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                data = _a.sent();
                if (data.deviceCode !== undefined && data.deviceCode !== null) {
                    contents.deviceCode = data.deviceCode;
                }
                if (data.expiresIn !== undefined && data.expiresIn !== null) {
                    contents.expiresIn = data.expiresIn;
                }
                if (data.interval !== undefined && data.interval !== null) {
                    contents.interval = data.interval;
                }
                if (data.userCode !== undefined && data.userCode !== null) {
                    contents.userCode = data.userCode;
                }
                if (data.verificationUri !== undefined && data.verificationUri !== null) {
                    contents.verificationUri = data.verificationUri;
                }
                if (data.verificationUriComplete !== undefined && data.verificationUriComplete !== null) {
                    contents.verificationUriComplete = data.verificationUriComplete;
                }
                return [2 /*return*/, Promise.resolve(contents)];
        }
    });
}); };
var deserializeAws_restJson1StartDeviceAuthorizationCommandError = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var parsedOutput, _a, response, errorCode, _b, _c, _d, _e, _f, _g, parsedBody, message;
    var _h;
    return __generator(this, function (_j) {
        switch (_j.label) {
            case 0:
                _a = [__assign({}, output)];
                _h = {};
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                parsedOutput = __assign.apply(void 0, _a.concat([(_h.body = _j.sent(), _h)]));
                errorCode = "UnknownError";
                errorCode = loadRestJsonErrorCode(output, parsedOutput.body);
                _b = errorCode;
                switch (_b) {
                    case "InternalServerException": return [3 /*break*/, 2];
                    case "com.amazonaws.ssooidc#InternalServerException": return [3 /*break*/, 2];
                    case "InvalidClientException": return [3 /*break*/, 4];
                    case "com.amazonaws.ssooidc#InvalidClientException": return [3 /*break*/, 4];
                    case "InvalidRequestException": return [3 /*break*/, 6];
                    case "com.amazonaws.ssooidc#InvalidRequestException": return [3 /*break*/, 6];
                    case "SlowDownException": return [3 /*break*/, 8];
                    case "com.amazonaws.ssooidc#SlowDownException": return [3 /*break*/, 8];
                    case "UnauthorizedClientException": return [3 /*break*/, 10];
                    case "com.amazonaws.ssooidc#UnauthorizedClientException": return [3 /*break*/, 10];
                }
                return [3 /*break*/, 12];
            case 2:
                _c = [{}];
                return [4 /*yield*/, deserializeAws_restJson1InternalServerExceptionResponse(parsedOutput, context)];
            case 3:
                response = __assign.apply(void 0, [__assign.apply(void 0, _c.concat([(_j.sent())])), { name: errorCode, $metadata: deserializeMetadata(output) }]);
                return [3 /*break*/, 13];
            case 4:
                _d = [{}];
                return [4 /*yield*/, deserializeAws_restJson1InvalidClientExceptionResponse(parsedOutput, context)];
            case 5:
                response = __assign.apply(void 0, [__assign.apply(void 0, _d.concat([(_j.sent())])), { name: errorCode, $metadata: deserializeMetadata(output) }]);
                return [3 /*break*/, 13];
            case 6:
                _e = [{}];
                return [4 /*yield*/, deserializeAws_restJson1InvalidRequestExceptionResponse(parsedOutput, context)];
            case 7:
                response = __assign.apply(void 0, [__assign.apply(void 0, _e.concat([(_j.sent())])), { name: errorCode, $metadata: deserializeMetadata(output) }]);
                return [3 /*break*/, 13];
            case 8:
                _f = [{}];
                return [4 /*yield*/, deserializeAws_restJson1SlowDownExceptionResponse(parsedOutput, context)];
            case 9:
                response = __assign.apply(void 0, [__assign.apply(void 0, _f.concat([(_j.sent())])), { name: errorCode, $metadata: deserializeMetadata(output) }]);
                return [3 /*break*/, 13];
            case 10:
                _g = [{}];
                return [4 /*yield*/, deserializeAws_restJson1UnauthorizedClientExceptionResponse(parsedOutput, context)];
            case 11:
                response = __assign.apply(void 0, [__assign.apply(void 0, _g.concat([(_j.sent())])), { name: errorCode, $metadata: deserializeMetadata(output) }]);
                return [3 /*break*/, 13];
            case 12:
                parsedBody = parsedOutput.body;
                errorCode = parsedBody.code || parsedBody.Code || errorCode;
                response = __assign(__assign({}, parsedBody), { name: "" + errorCode, message: parsedBody.message || parsedBody.Message || errorCode, $fault: "client", $metadata: deserializeMetadata(output) });
                _j.label = 13;
            case 13:
                message = response.message || response.Message || errorCode;
                response.message = message;
                delete response.Message;
                return [2 /*return*/, Promise.reject(Object.assign(new Error(message), response))];
        }
    });
}); };
var deserializeAws_restJson1AccessDeniedExceptionResponse = function (parsedOutput, context) { return __awaiter(void 0, void 0, void 0, function () {
    var contents, data;
    return __generator(this, function (_a) {
        contents = {
            name: "AccessDeniedException",
            $fault: "client",
            $metadata: deserializeMetadata(parsedOutput),
            error: undefined,
            error_description: undefined,
        };
        data = parsedOutput.body;
        if (data.error !== undefined && data.error !== null) {
            contents.error = data.error;
        }
        if (data.error_description !== undefined && data.error_description !== null) {
            contents.error_description = data.error_description;
        }
        return [2 /*return*/, contents];
    });
}); };
var deserializeAws_restJson1AuthorizationPendingExceptionResponse = function (parsedOutput, context) { return __awaiter(void 0, void 0, void 0, function () {
    var contents, data;
    return __generator(this, function (_a) {
        contents = {
            name: "AuthorizationPendingException",
            $fault: "client",
            $metadata: deserializeMetadata(parsedOutput),
            error: undefined,
            error_description: undefined,
        };
        data = parsedOutput.body;
        if (data.error !== undefined && data.error !== null) {
            contents.error = data.error;
        }
        if (data.error_description !== undefined && data.error_description !== null) {
            contents.error_description = data.error_description;
        }
        return [2 /*return*/, contents];
    });
}); };
var deserializeAws_restJson1ExpiredTokenExceptionResponse = function (parsedOutput, context) { return __awaiter(void 0, void 0, void 0, function () {
    var contents, data;
    return __generator(this, function (_a) {
        contents = {
            name: "ExpiredTokenException",
            $fault: "client",
            $metadata: deserializeMetadata(parsedOutput),
            error: undefined,
            error_description: undefined,
        };
        data = parsedOutput.body;
        if (data.error !== undefined && data.error !== null) {
            contents.error = data.error;
        }
        if (data.error_description !== undefined && data.error_description !== null) {
            contents.error_description = data.error_description;
        }
        return [2 /*return*/, contents];
    });
}); };
var deserializeAws_restJson1InternalServerExceptionResponse = function (parsedOutput, context) { return __awaiter(void 0, void 0, void 0, function () {
    var contents, data;
    return __generator(this, function (_a) {
        contents = {
            name: "InternalServerException",
            $fault: "server",
            $metadata: deserializeMetadata(parsedOutput),
            error: undefined,
            error_description: undefined,
        };
        data = parsedOutput.body;
        if (data.error !== undefined && data.error !== null) {
            contents.error = data.error;
        }
        if (data.error_description !== undefined && data.error_description !== null) {
            contents.error_description = data.error_description;
        }
        return [2 /*return*/, contents];
    });
}); };
var deserializeAws_restJson1InvalidClientExceptionResponse = function (parsedOutput, context) { return __awaiter(void 0, void 0, void 0, function () {
    var contents, data;
    return __generator(this, function (_a) {
        contents = {
            name: "InvalidClientException",
            $fault: "client",
            $metadata: deserializeMetadata(parsedOutput),
            error: undefined,
            error_description: undefined,
        };
        data = parsedOutput.body;
        if (data.error !== undefined && data.error !== null) {
            contents.error = data.error;
        }
        if (data.error_description !== undefined && data.error_description !== null) {
            contents.error_description = data.error_description;
        }
        return [2 /*return*/, contents];
    });
}); };
var deserializeAws_restJson1InvalidClientMetadataExceptionResponse = function (parsedOutput, context) { return __awaiter(void 0, void 0, void 0, function () {
    var contents, data;
    return __generator(this, function (_a) {
        contents = {
            name: "InvalidClientMetadataException",
            $fault: "client",
            $metadata: deserializeMetadata(parsedOutput),
            error: undefined,
            error_description: undefined,
        };
        data = parsedOutput.body;
        if (data.error !== undefined && data.error !== null) {
            contents.error = data.error;
        }
        if (data.error_description !== undefined && data.error_description !== null) {
            contents.error_description = data.error_description;
        }
        return [2 /*return*/, contents];
    });
}); };
var deserializeAws_restJson1InvalidGrantExceptionResponse = function (parsedOutput, context) { return __awaiter(void 0, void 0, void 0, function () {
    var contents, data;
    return __generator(this, function (_a) {
        contents = {
            name: "InvalidGrantException",
            $fault: "client",
            $metadata: deserializeMetadata(parsedOutput),
            error: undefined,
            error_description: undefined,
        };
        data = parsedOutput.body;
        if (data.error !== undefined && data.error !== null) {
            contents.error = data.error;
        }
        if (data.error_description !== undefined && data.error_description !== null) {
            contents.error_description = data.error_description;
        }
        return [2 /*return*/, contents];
    });
}); };
var deserializeAws_restJson1InvalidRequestExceptionResponse = function (parsedOutput, context) { return __awaiter(void 0, void 0, void 0, function () {
    var contents, data;
    return __generator(this, function (_a) {
        contents = {
            name: "InvalidRequestException",
            $fault: "client",
            $metadata: deserializeMetadata(parsedOutput),
            error: undefined,
            error_description: undefined,
        };
        data = parsedOutput.body;
        if (data.error !== undefined && data.error !== null) {
            contents.error = data.error;
        }
        if (data.error_description !== undefined && data.error_description !== null) {
            contents.error_description = data.error_description;
        }
        return [2 /*return*/, contents];
    });
}); };
var deserializeAws_restJson1InvalidScopeExceptionResponse = function (parsedOutput, context) { return __awaiter(void 0, void 0, void 0, function () {
    var contents, data;
    return __generator(this, function (_a) {
        contents = {
            name: "InvalidScopeException",
            $fault: "client",
            $metadata: deserializeMetadata(parsedOutput),
            error: undefined,
            error_description: undefined,
        };
        data = parsedOutput.body;
        if (data.error !== undefined && data.error !== null) {
            contents.error = data.error;
        }
        if (data.error_description !== undefined && data.error_description !== null) {
            contents.error_description = data.error_description;
        }
        return [2 /*return*/, contents];
    });
}); };
var deserializeAws_restJson1SlowDownExceptionResponse = function (parsedOutput, context) { return __awaiter(void 0, void 0, void 0, function () {
    var contents, data;
    return __generator(this, function (_a) {
        contents = {
            name: "SlowDownException",
            $fault: "client",
            $metadata: deserializeMetadata(parsedOutput),
            error: undefined,
            error_description: undefined,
        };
        data = parsedOutput.body;
        if (data.error !== undefined && data.error !== null) {
            contents.error = data.error;
        }
        if (data.error_description !== undefined && data.error_description !== null) {
            contents.error_description = data.error_description;
        }
        return [2 /*return*/, contents];
    });
}); };
var deserializeAws_restJson1UnauthorizedClientExceptionResponse = function (parsedOutput, context) { return __awaiter(void 0, void 0, void 0, function () {
    var contents, data;
    return __generator(this, function (_a) {
        contents = {
            name: "UnauthorizedClientException",
            $fault: "client",
            $metadata: deserializeMetadata(parsedOutput),
            error: undefined,
            error_description: undefined,
        };
        data = parsedOutput.body;
        if (data.error !== undefined && data.error !== null) {
            contents.error = data.error;
        }
        if (data.error_description !== undefined && data.error_description !== null) {
            contents.error_description = data.error_description;
        }
        return [2 /*return*/, contents];
    });
}); };
var deserializeAws_restJson1UnsupportedGrantTypeExceptionResponse = function (parsedOutput, context) { return __awaiter(void 0, void 0, void 0, function () {
    var contents, data;
    return __generator(this, function (_a) {
        contents = {
            name: "UnsupportedGrantTypeException",
            $fault: "client",
            $metadata: deserializeMetadata(parsedOutput),
            error: undefined,
            error_description: undefined,
        };
        data = parsedOutput.body;
        if (data.error !== undefined && data.error !== null) {
            contents.error = data.error;
        }
        if (data.error_description !== undefined && data.error_description !== null) {
            contents.error_description = data.error_description;
        }
        return [2 /*return*/, contents];
    });
}); };
var serializeAws_restJson1Scopes = function (input, context) {
    return input
        .filter(function (e) { return e != null; })
        .map(function (entry) {
        if (entry === null) {
            return null;
        }
        return entry;
    });
};
var deserializeMetadata = function (output) {
    var _a;
    return ({
        httpStatusCode: output.statusCode,
        requestId: (_a = output.headers["x-amzn-requestid"]) !== null && _a !== void 0 ? _a : output.headers["x-amzn-request-id"],
        extendedRequestId: output.headers["x-amz-id-2"],
        cfId: output.headers["x-amz-cf-id"],
    });
};
// Collect low-level response body stream to Uint8Array.
var collectBody = function (streamBody, context) {
    if (streamBody === void 0) { streamBody = new Uint8Array(); }
    if (streamBody instanceof Uint8Array) {
        return Promise.resolve(streamBody);
    }
    return context.streamCollector(streamBody) || Promise.resolve(new Uint8Array());
};
// Encode Uint8Array data into string with utf-8.
var collectBodyString = function (streamBody, context) {
    return collectBody(streamBody, context).then(function (body) { return context.utf8Encoder(body); });
};
var isSerializableHeaderValue = function (value) {
    return value !== undefined &&
        value !== null &&
        value !== "" &&
        (!Object.getOwnPropertyNames(value).includes("length") || value.length != 0) &&
        (!Object.getOwnPropertyNames(value).includes("size") || value.size != 0);
};
var parseBody = function (streamBody, context) {
    return collectBodyString(streamBody, context).then(function (encoded) {
        if (encoded.length) {
            return JSON.parse(encoded);
        }
        return {};
    });
};
/**
 * Load an error code for the aws.rest-json-1.1 protocol.
 */
var loadRestJsonErrorCode = function (output, data) {
    var findKey = function (object, key) { return Object.keys(object).find(function (k) { return k.toLowerCase() === key.toLowerCase(); }); };
    var sanitizeErrorCode = function (rawValue) {
        var cleanValue = rawValue;
        if (cleanValue.indexOf(":") >= 0) {
            cleanValue = cleanValue.split(":")[0];
        }
        if (cleanValue.indexOf("#") >= 0) {
            cleanValue = cleanValue.split("#")[1];
        }
        return cleanValue;
    };
    var headerKey = findKey(output.headers, "x-amzn-errortype");
    if (headerKey !== undefined) {
        return sanitizeErrorCode(output.headers[headerKey]);
    }
    if (data.code !== undefined) {
        return sanitizeErrorCode(data.code);
    }
    if (data["__type"] !== undefined) {
        return sanitizeErrorCode(data["__type"]);
    }
    return "";
};
//# sourceMappingURL=Aws_restJson1.js.map