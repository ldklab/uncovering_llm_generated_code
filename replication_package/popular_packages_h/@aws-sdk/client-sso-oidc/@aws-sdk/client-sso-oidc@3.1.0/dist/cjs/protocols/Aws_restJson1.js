"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deserializeAws_restJson1StartDeviceAuthorizationCommand = exports.deserializeAws_restJson1RegisterClientCommand = exports.deserializeAws_restJson1CreateTokenCommand = exports.serializeAws_restJson1StartDeviceAuthorizationCommand = exports.serializeAws_restJson1RegisterClientCommand = exports.serializeAws_restJson1CreateTokenCommand = void 0;
const protocol_http_1 = require("@aws-sdk/protocol-http");
const serializeAws_restJson1CreateTokenCommand = async (input, context) => {
    const headers = {
        "content-type": "application/json",
    };
    let resolvedPath = "/token";
    let body;
    body = JSON.stringify({
        ...(input.clientId !== undefined && input.clientId !== null && { clientId: input.clientId }),
        ...(input.clientSecret !== undefined && input.clientSecret !== null && { clientSecret: input.clientSecret }),
        ...(input.code !== undefined && input.code !== null && { code: input.code }),
        ...(input.deviceCode !== undefined && input.deviceCode !== null && { deviceCode: input.deviceCode }),
        ...(input.grantType !== undefined && input.grantType !== null && { grantType: input.grantType }),
        ...(input.redirectUri !== undefined && input.redirectUri !== null && { redirectUri: input.redirectUri }),
        ...(input.refreshToken !== undefined && input.refreshToken !== null && { refreshToken: input.refreshToken }),
        ...(input.scope !== undefined &&
            input.scope !== null && { scope: serializeAws_restJson1Scopes(input.scope, context) }),
    });
    const { hostname, protocol = "https", port } = await context.endpoint();
    return new protocol_http_1.HttpRequest({
        protocol,
        hostname,
        port,
        method: "POST",
        headers,
        path: resolvedPath,
        body,
    });
};
exports.serializeAws_restJson1CreateTokenCommand = serializeAws_restJson1CreateTokenCommand;
const serializeAws_restJson1RegisterClientCommand = async (input, context) => {
    const headers = {
        "content-type": "application/json",
    };
    let resolvedPath = "/client/register";
    let body;
    body = JSON.stringify({
        ...(input.clientName !== undefined && input.clientName !== null && { clientName: input.clientName }),
        ...(input.clientType !== undefined && input.clientType !== null && { clientType: input.clientType }),
        ...(input.scopes !== undefined &&
            input.scopes !== null && { scopes: serializeAws_restJson1Scopes(input.scopes, context) }),
    });
    const { hostname, protocol = "https", port } = await context.endpoint();
    return new protocol_http_1.HttpRequest({
        protocol,
        hostname,
        port,
        method: "POST",
        headers,
        path: resolvedPath,
        body,
    });
};
exports.serializeAws_restJson1RegisterClientCommand = serializeAws_restJson1RegisterClientCommand;
const serializeAws_restJson1StartDeviceAuthorizationCommand = async (input, context) => {
    const headers = {
        "content-type": "application/json",
    };
    let resolvedPath = "/device_authorization";
    let body;
    body = JSON.stringify({
        ...(input.clientId !== undefined && input.clientId !== null && { clientId: input.clientId }),
        ...(input.clientSecret !== undefined && input.clientSecret !== null && { clientSecret: input.clientSecret }),
        ...(input.startUrl !== undefined && input.startUrl !== null && { startUrl: input.startUrl }),
    });
    const { hostname, protocol = "https", port } = await context.endpoint();
    return new protocol_http_1.HttpRequest({
        protocol,
        hostname,
        port,
        method: "POST",
        headers,
        path: resolvedPath,
        body,
    });
};
exports.serializeAws_restJson1StartDeviceAuthorizationCommand = serializeAws_restJson1StartDeviceAuthorizationCommand;
const deserializeAws_restJson1CreateTokenCommand = async (output, context) => {
    if (output.statusCode !== 200 && output.statusCode >= 300) {
        return deserializeAws_restJson1CreateTokenCommandError(output, context);
    }
    const contents = {
        $metadata: deserializeMetadata(output),
        accessToken: undefined,
        expiresIn: undefined,
        idToken: undefined,
        refreshToken: undefined,
        tokenType: undefined,
    };
    const data = await parseBody(output.body, context);
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
    return Promise.resolve(contents);
};
exports.deserializeAws_restJson1CreateTokenCommand = deserializeAws_restJson1CreateTokenCommand;
const deserializeAws_restJson1CreateTokenCommandError = async (output, context) => {
    const parsedOutput = {
        ...output,
        body: await parseBody(output.body, context),
    };
    let response;
    let errorCode = "UnknownError";
    errorCode = loadRestJsonErrorCode(output, parsedOutput.body);
    switch (errorCode) {
        case "AccessDeniedException":
        case "com.amazonaws.ssooidc#AccessDeniedException":
            response = {
                ...(await deserializeAws_restJson1AccessDeniedExceptionResponse(parsedOutput, context)),
                name: errorCode,
                $metadata: deserializeMetadata(output),
            };
            break;
        case "AuthorizationPendingException":
        case "com.amazonaws.ssooidc#AuthorizationPendingException":
            response = {
                ...(await deserializeAws_restJson1AuthorizationPendingExceptionResponse(parsedOutput, context)),
                name: errorCode,
                $metadata: deserializeMetadata(output),
            };
            break;
        case "ExpiredTokenException":
        case "com.amazonaws.ssooidc#ExpiredTokenException":
            response = {
                ...(await deserializeAws_restJson1ExpiredTokenExceptionResponse(parsedOutput, context)),
                name: errorCode,
                $metadata: deserializeMetadata(output),
            };
            break;
        case "InternalServerException":
        case "com.amazonaws.ssooidc#InternalServerException":
            response = {
                ...(await deserializeAws_restJson1InternalServerExceptionResponse(parsedOutput, context)),
                name: errorCode,
                $metadata: deserializeMetadata(output),
            };
            break;
        case "InvalidClientException":
        case "com.amazonaws.ssooidc#InvalidClientException":
            response = {
                ...(await deserializeAws_restJson1InvalidClientExceptionResponse(parsedOutput, context)),
                name: errorCode,
                $metadata: deserializeMetadata(output),
            };
            break;
        case "InvalidGrantException":
        case "com.amazonaws.ssooidc#InvalidGrantException":
            response = {
                ...(await deserializeAws_restJson1InvalidGrantExceptionResponse(parsedOutput, context)),
                name: errorCode,
                $metadata: deserializeMetadata(output),
            };
            break;
        case "InvalidRequestException":
        case "com.amazonaws.ssooidc#InvalidRequestException":
            response = {
                ...(await deserializeAws_restJson1InvalidRequestExceptionResponse(parsedOutput, context)),
                name: errorCode,
                $metadata: deserializeMetadata(output),
            };
            break;
        case "InvalidScopeException":
        case "com.amazonaws.ssooidc#InvalidScopeException":
            response = {
                ...(await deserializeAws_restJson1InvalidScopeExceptionResponse(parsedOutput, context)),
                name: errorCode,
                $metadata: deserializeMetadata(output),
            };
            break;
        case "SlowDownException":
        case "com.amazonaws.ssooidc#SlowDownException":
            response = {
                ...(await deserializeAws_restJson1SlowDownExceptionResponse(parsedOutput, context)),
                name: errorCode,
                $metadata: deserializeMetadata(output),
            };
            break;
        case "UnauthorizedClientException":
        case "com.amazonaws.ssooidc#UnauthorizedClientException":
            response = {
                ...(await deserializeAws_restJson1UnauthorizedClientExceptionResponse(parsedOutput, context)),
                name: errorCode,
                $metadata: deserializeMetadata(output),
            };
            break;
        case "UnsupportedGrantTypeException":
        case "com.amazonaws.ssooidc#UnsupportedGrantTypeException":
            response = {
                ...(await deserializeAws_restJson1UnsupportedGrantTypeExceptionResponse(parsedOutput, context)),
                name: errorCode,
                $metadata: deserializeMetadata(output),
            };
            break;
        default:
            const parsedBody = parsedOutput.body;
            errorCode = parsedBody.code || parsedBody.Code || errorCode;
            response = {
                ...parsedBody,
                name: `${errorCode}`,
                message: parsedBody.message || parsedBody.Message || errorCode,
                $fault: "client",
                $metadata: deserializeMetadata(output),
            };
    }
    const message = response.message || response.Message || errorCode;
    response.message = message;
    delete response.Message;
    return Promise.reject(Object.assign(new Error(message), response));
};
const deserializeAws_restJson1RegisterClientCommand = async (output, context) => {
    if (output.statusCode !== 200 && output.statusCode >= 300) {
        return deserializeAws_restJson1RegisterClientCommandError(output, context);
    }
    const contents = {
        $metadata: deserializeMetadata(output),
        authorizationEndpoint: undefined,
        clientId: undefined,
        clientIdIssuedAt: undefined,
        clientSecret: undefined,
        clientSecretExpiresAt: undefined,
        tokenEndpoint: undefined,
    };
    const data = await parseBody(output.body, context);
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
    return Promise.resolve(contents);
};
exports.deserializeAws_restJson1RegisterClientCommand = deserializeAws_restJson1RegisterClientCommand;
const deserializeAws_restJson1RegisterClientCommandError = async (output, context) => {
    const parsedOutput = {
        ...output,
        body: await parseBody(output.body, context),
    };
    let response;
    let errorCode = "UnknownError";
    errorCode = loadRestJsonErrorCode(output, parsedOutput.body);
    switch (errorCode) {
        case "InternalServerException":
        case "com.amazonaws.ssooidc#InternalServerException":
            response = {
                ...(await deserializeAws_restJson1InternalServerExceptionResponse(parsedOutput, context)),
                name: errorCode,
                $metadata: deserializeMetadata(output),
            };
            break;
        case "InvalidClientMetadataException":
        case "com.amazonaws.ssooidc#InvalidClientMetadataException":
            response = {
                ...(await deserializeAws_restJson1InvalidClientMetadataExceptionResponse(parsedOutput, context)),
                name: errorCode,
                $metadata: deserializeMetadata(output),
            };
            break;
        case "InvalidRequestException":
        case "com.amazonaws.ssooidc#InvalidRequestException":
            response = {
                ...(await deserializeAws_restJson1InvalidRequestExceptionResponse(parsedOutput, context)),
                name: errorCode,
                $metadata: deserializeMetadata(output),
            };
            break;
        case "InvalidScopeException":
        case "com.amazonaws.ssooidc#InvalidScopeException":
            response = {
                ...(await deserializeAws_restJson1InvalidScopeExceptionResponse(parsedOutput, context)),
                name: errorCode,
                $metadata: deserializeMetadata(output),
            };
            break;
        default:
            const parsedBody = parsedOutput.body;
            errorCode = parsedBody.code || parsedBody.Code || errorCode;
            response = {
                ...parsedBody,
                name: `${errorCode}`,
                message: parsedBody.message || parsedBody.Message || errorCode,
                $fault: "client",
                $metadata: deserializeMetadata(output),
            };
    }
    const message = response.message || response.Message || errorCode;
    response.message = message;
    delete response.Message;
    return Promise.reject(Object.assign(new Error(message), response));
};
const deserializeAws_restJson1StartDeviceAuthorizationCommand = async (output, context) => {
    if (output.statusCode !== 200 && output.statusCode >= 300) {
        return deserializeAws_restJson1StartDeviceAuthorizationCommandError(output, context);
    }
    const contents = {
        $metadata: deserializeMetadata(output),
        deviceCode: undefined,
        expiresIn: undefined,
        interval: undefined,
        userCode: undefined,
        verificationUri: undefined,
        verificationUriComplete: undefined,
    };
    const data = await parseBody(output.body, context);
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
    return Promise.resolve(contents);
};
exports.deserializeAws_restJson1StartDeviceAuthorizationCommand = deserializeAws_restJson1StartDeviceAuthorizationCommand;
const deserializeAws_restJson1StartDeviceAuthorizationCommandError = async (output, context) => {
    const parsedOutput = {
        ...output,
        body: await parseBody(output.body, context),
    };
    let response;
    let errorCode = "UnknownError";
    errorCode = loadRestJsonErrorCode(output, parsedOutput.body);
    switch (errorCode) {
        case "InternalServerException":
        case "com.amazonaws.ssooidc#InternalServerException":
            response = {
                ...(await deserializeAws_restJson1InternalServerExceptionResponse(parsedOutput, context)),
                name: errorCode,
                $metadata: deserializeMetadata(output),
            };
            break;
        case "InvalidClientException":
        case "com.amazonaws.ssooidc#InvalidClientException":
            response = {
                ...(await deserializeAws_restJson1InvalidClientExceptionResponse(parsedOutput, context)),
                name: errorCode,
                $metadata: deserializeMetadata(output),
            };
            break;
        case "InvalidRequestException":
        case "com.amazonaws.ssooidc#InvalidRequestException":
            response = {
                ...(await deserializeAws_restJson1InvalidRequestExceptionResponse(parsedOutput, context)),
                name: errorCode,
                $metadata: deserializeMetadata(output),
            };
            break;
        case "SlowDownException":
        case "com.amazonaws.ssooidc#SlowDownException":
            response = {
                ...(await deserializeAws_restJson1SlowDownExceptionResponse(parsedOutput, context)),
                name: errorCode,
                $metadata: deserializeMetadata(output),
            };
            break;
        case "UnauthorizedClientException":
        case "com.amazonaws.ssooidc#UnauthorizedClientException":
            response = {
                ...(await deserializeAws_restJson1UnauthorizedClientExceptionResponse(parsedOutput, context)),
                name: errorCode,
                $metadata: deserializeMetadata(output),
            };
            break;
        default:
            const parsedBody = parsedOutput.body;
            errorCode = parsedBody.code || parsedBody.Code || errorCode;
            response = {
                ...parsedBody,
                name: `${errorCode}`,
                message: parsedBody.message || parsedBody.Message || errorCode,
                $fault: "client",
                $metadata: deserializeMetadata(output),
            };
    }
    const message = response.message || response.Message || errorCode;
    response.message = message;
    delete response.Message;
    return Promise.reject(Object.assign(new Error(message), response));
};
const deserializeAws_restJson1AccessDeniedExceptionResponse = async (parsedOutput, context) => {
    const contents = {
        name: "AccessDeniedException",
        $fault: "client",
        $metadata: deserializeMetadata(parsedOutput),
        error: undefined,
        error_description: undefined,
    };
    const data = parsedOutput.body;
    if (data.error !== undefined && data.error !== null) {
        contents.error = data.error;
    }
    if (data.error_description !== undefined && data.error_description !== null) {
        contents.error_description = data.error_description;
    }
    return contents;
};
const deserializeAws_restJson1AuthorizationPendingExceptionResponse = async (parsedOutput, context) => {
    const contents = {
        name: "AuthorizationPendingException",
        $fault: "client",
        $metadata: deserializeMetadata(parsedOutput),
        error: undefined,
        error_description: undefined,
    };
    const data = parsedOutput.body;
    if (data.error !== undefined && data.error !== null) {
        contents.error = data.error;
    }
    if (data.error_description !== undefined && data.error_description !== null) {
        contents.error_description = data.error_description;
    }
    return contents;
};
const deserializeAws_restJson1ExpiredTokenExceptionResponse = async (parsedOutput, context) => {
    const contents = {
        name: "ExpiredTokenException",
        $fault: "client",
        $metadata: deserializeMetadata(parsedOutput),
        error: undefined,
        error_description: undefined,
    };
    const data = parsedOutput.body;
    if (data.error !== undefined && data.error !== null) {
        contents.error = data.error;
    }
    if (data.error_description !== undefined && data.error_description !== null) {
        contents.error_description = data.error_description;
    }
    return contents;
};
const deserializeAws_restJson1InternalServerExceptionResponse = async (parsedOutput, context) => {
    const contents = {
        name: "InternalServerException",
        $fault: "server",
        $metadata: deserializeMetadata(parsedOutput),
        error: undefined,
        error_description: undefined,
    };
    const data = parsedOutput.body;
    if (data.error !== undefined && data.error !== null) {
        contents.error = data.error;
    }
    if (data.error_description !== undefined && data.error_description !== null) {
        contents.error_description = data.error_description;
    }
    return contents;
};
const deserializeAws_restJson1InvalidClientExceptionResponse = async (parsedOutput, context) => {
    const contents = {
        name: "InvalidClientException",
        $fault: "client",
        $metadata: deserializeMetadata(parsedOutput),
        error: undefined,
        error_description: undefined,
    };
    const data = parsedOutput.body;
    if (data.error !== undefined && data.error !== null) {
        contents.error = data.error;
    }
    if (data.error_description !== undefined && data.error_description !== null) {
        contents.error_description = data.error_description;
    }
    return contents;
};
const deserializeAws_restJson1InvalidClientMetadataExceptionResponse = async (parsedOutput, context) => {
    const contents = {
        name: "InvalidClientMetadataException",
        $fault: "client",
        $metadata: deserializeMetadata(parsedOutput),
        error: undefined,
        error_description: undefined,
    };
    const data = parsedOutput.body;
    if (data.error !== undefined && data.error !== null) {
        contents.error = data.error;
    }
    if (data.error_description !== undefined && data.error_description !== null) {
        contents.error_description = data.error_description;
    }
    return contents;
};
const deserializeAws_restJson1InvalidGrantExceptionResponse = async (parsedOutput, context) => {
    const contents = {
        name: "InvalidGrantException",
        $fault: "client",
        $metadata: deserializeMetadata(parsedOutput),
        error: undefined,
        error_description: undefined,
    };
    const data = parsedOutput.body;
    if (data.error !== undefined && data.error !== null) {
        contents.error = data.error;
    }
    if (data.error_description !== undefined && data.error_description !== null) {
        contents.error_description = data.error_description;
    }
    return contents;
};
const deserializeAws_restJson1InvalidRequestExceptionResponse = async (parsedOutput, context) => {
    const contents = {
        name: "InvalidRequestException",
        $fault: "client",
        $metadata: deserializeMetadata(parsedOutput),
        error: undefined,
        error_description: undefined,
    };
    const data = parsedOutput.body;
    if (data.error !== undefined && data.error !== null) {
        contents.error = data.error;
    }
    if (data.error_description !== undefined && data.error_description !== null) {
        contents.error_description = data.error_description;
    }
    return contents;
};
const deserializeAws_restJson1InvalidScopeExceptionResponse = async (parsedOutput, context) => {
    const contents = {
        name: "InvalidScopeException",
        $fault: "client",
        $metadata: deserializeMetadata(parsedOutput),
        error: undefined,
        error_description: undefined,
    };
    const data = parsedOutput.body;
    if (data.error !== undefined && data.error !== null) {
        contents.error = data.error;
    }
    if (data.error_description !== undefined && data.error_description !== null) {
        contents.error_description = data.error_description;
    }
    return contents;
};
const deserializeAws_restJson1SlowDownExceptionResponse = async (parsedOutput, context) => {
    const contents = {
        name: "SlowDownException",
        $fault: "client",
        $metadata: deserializeMetadata(parsedOutput),
        error: undefined,
        error_description: undefined,
    };
    const data = parsedOutput.body;
    if (data.error !== undefined && data.error !== null) {
        contents.error = data.error;
    }
    if (data.error_description !== undefined && data.error_description !== null) {
        contents.error_description = data.error_description;
    }
    return contents;
};
const deserializeAws_restJson1UnauthorizedClientExceptionResponse = async (parsedOutput, context) => {
    const contents = {
        name: "UnauthorizedClientException",
        $fault: "client",
        $metadata: deserializeMetadata(parsedOutput),
        error: undefined,
        error_description: undefined,
    };
    const data = parsedOutput.body;
    if (data.error !== undefined && data.error !== null) {
        contents.error = data.error;
    }
    if (data.error_description !== undefined && data.error_description !== null) {
        contents.error_description = data.error_description;
    }
    return contents;
};
const deserializeAws_restJson1UnsupportedGrantTypeExceptionResponse = async (parsedOutput, context) => {
    const contents = {
        name: "UnsupportedGrantTypeException",
        $fault: "client",
        $metadata: deserializeMetadata(parsedOutput),
        error: undefined,
        error_description: undefined,
    };
    const data = parsedOutput.body;
    if (data.error !== undefined && data.error !== null) {
        contents.error = data.error;
    }
    if (data.error_description !== undefined && data.error_description !== null) {
        contents.error_description = data.error_description;
    }
    return contents;
};
const serializeAws_restJson1Scopes = (input, context) => {
    return input
        .filter((e) => e != null)
        .map((entry) => {
        if (entry === null) {
            return null;
        }
        return entry;
    });
};
const deserializeMetadata = (output) => {
    var _a;
    return ({
        httpStatusCode: output.statusCode,
        requestId: (_a = output.headers["x-amzn-requestid"]) !== null && _a !== void 0 ? _a : output.headers["x-amzn-request-id"],
        extendedRequestId: output.headers["x-amz-id-2"],
        cfId: output.headers["x-amz-cf-id"],
    });
};
// Collect low-level response body stream to Uint8Array.
const collectBody = (streamBody = new Uint8Array(), context) => {
    if (streamBody instanceof Uint8Array) {
        return Promise.resolve(streamBody);
    }
    return context.streamCollector(streamBody) || Promise.resolve(new Uint8Array());
};
// Encode Uint8Array data into string with utf-8.
const collectBodyString = (streamBody, context) => collectBody(streamBody, context).then((body) => context.utf8Encoder(body));
const isSerializableHeaderValue = (value) => value !== undefined &&
    value !== null &&
    value !== "" &&
    (!Object.getOwnPropertyNames(value).includes("length") || value.length != 0) &&
    (!Object.getOwnPropertyNames(value).includes("size") || value.size != 0);
const parseBody = (streamBody, context) => collectBodyString(streamBody, context).then((encoded) => {
    if (encoded.length) {
        return JSON.parse(encoded);
    }
    return {};
});
/**
 * Load an error code for the aws.rest-json-1.1 protocol.
 */
const loadRestJsonErrorCode = (output, data) => {
    const findKey = (object, key) => Object.keys(object).find((k) => k.toLowerCase() === key.toLowerCase());
    const sanitizeErrorCode = (rawValue) => {
        let cleanValue = rawValue;
        if (cleanValue.indexOf(":") >= 0) {
            cleanValue = cleanValue.split(":")[0];
        }
        if (cleanValue.indexOf("#") >= 0) {
            cleanValue = cleanValue.split("#")[1];
        }
        return cleanValue;
    };
    const headerKey = findKey(output.headers, "x-amzn-errortype");
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