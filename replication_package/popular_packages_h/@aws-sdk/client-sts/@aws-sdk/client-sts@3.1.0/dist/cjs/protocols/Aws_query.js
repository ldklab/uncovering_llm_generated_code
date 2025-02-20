"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deserializeAws_queryGetSessionTokenCommand = exports.deserializeAws_queryGetFederationTokenCommand = exports.deserializeAws_queryGetCallerIdentityCommand = exports.deserializeAws_queryGetAccessKeyInfoCommand = exports.deserializeAws_queryDecodeAuthorizationMessageCommand = exports.deserializeAws_queryAssumeRoleWithWebIdentityCommand = exports.deserializeAws_queryAssumeRoleWithSAMLCommand = exports.deserializeAws_queryAssumeRoleCommand = exports.serializeAws_queryGetSessionTokenCommand = exports.serializeAws_queryGetFederationTokenCommand = exports.serializeAws_queryGetCallerIdentityCommand = exports.serializeAws_queryGetAccessKeyInfoCommand = exports.serializeAws_queryDecodeAuthorizationMessageCommand = exports.serializeAws_queryAssumeRoleWithWebIdentityCommand = exports.serializeAws_queryAssumeRoleWithSAMLCommand = exports.serializeAws_queryAssumeRoleCommand = void 0;
const protocol_http_1 = require("@aws-sdk/protocol-http");
const smithy_client_1 = require("@aws-sdk/smithy-client");
const fast_xml_parser_1 = require("fast-xml-parser");
const serializeAws_queryAssumeRoleCommand = async (input, context) => {
    const headers = {
        "content-type": "application/x-www-form-urlencoded",
    };
    let body;
    body = buildFormUrlencodedString({
        ...serializeAws_queryAssumeRoleRequest(input, context),
        Action: "AssumeRole",
        Version: "2011-06-15",
    });
    return buildHttpRpcRequest(context, headers, "/", undefined, body);
};
exports.serializeAws_queryAssumeRoleCommand = serializeAws_queryAssumeRoleCommand;
const serializeAws_queryAssumeRoleWithSAMLCommand = async (input, context) => {
    const headers = {
        "content-type": "application/x-www-form-urlencoded",
    };
    let body;
    body = buildFormUrlencodedString({
        ...serializeAws_queryAssumeRoleWithSAMLRequest(input, context),
        Action: "AssumeRoleWithSAML",
        Version: "2011-06-15",
    });
    return buildHttpRpcRequest(context, headers, "/", undefined, body);
};
exports.serializeAws_queryAssumeRoleWithSAMLCommand = serializeAws_queryAssumeRoleWithSAMLCommand;
const serializeAws_queryAssumeRoleWithWebIdentityCommand = async (input, context) => {
    const headers = {
        "content-type": "application/x-www-form-urlencoded",
    };
    let body;
    body = buildFormUrlencodedString({
        ...serializeAws_queryAssumeRoleWithWebIdentityRequest(input, context),
        Action: "AssumeRoleWithWebIdentity",
        Version: "2011-06-15",
    });
    return buildHttpRpcRequest(context, headers, "/", undefined, body);
};
exports.serializeAws_queryAssumeRoleWithWebIdentityCommand = serializeAws_queryAssumeRoleWithWebIdentityCommand;
const serializeAws_queryDecodeAuthorizationMessageCommand = async (input, context) => {
    const headers = {
        "content-type": "application/x-www-form-urlencoded",
    };
    let body;
    body = buildFormUrlencodedString({
        ...serializeAws_queryDecodeAuthorizationMessageRequest(input, context),
        Action: "DecodeAuthorizationMessage",
        Version: "2011-06-15",
    });
    return buildHttpRpcRequest(context, headers, "/", undefined, body);
};
exports.serializeAws_queryDecodeAuthorizationMessageCommand = serializeAws_queryDecodeAuthorizationMessageCommand;
const serializeAws_queryGetAccessKeyInfoCommand = async (input, context) => {
    const headers = {
        "content-type": "application/x-www-form-urlencoded",
    };
    let body;
    body = buildFormUrlencodedString({
        ...serializeAws_queryGetAccessKeyInfoRequest(input, context),
        Action: "GetAccessKeyInfo",
        Version: "2011-06-15",
    });
    return buildHttpRpcRequest(context, headers, "/", undefined, body);
};
exports.serializeAws_queryGetAccessKeyInfoCommand = serializeAws_queryGetAccessKeyInfoCommand;
const serializeAws_queryGetCallerIdentityCommand = async (input, context) => {
    const headers = {
        "content-type": "application/x-www-form-urlencoded",
    };
    let body;
    body = buildFormUrlencodedString({
        ...serializeAws_queryGetCallerIdentityRequest(input, context),
        Action: "GetCallerIdentity",
        Version: "2011-06-15",
    });
    return buildHttpRpcRequest(context, headers, "/", undefined, body);
};
exports.serializeAws_queryGetCallerIdentityCommand = serializeAws_queryGetCallerIdentityCommand;
const serializeAws_queryGetFederationTokenCommand = async (input, context) => {
    const headers = {
        "content-type": "application/x-www-form-urlencoded",
    };
    let body;
    body = buildFormUrlencodedString({
        ...serializeAws_queryGetFederationTokenRequest(input, context),
        Action: "GetFederationToken",
        Version: "2011-06-15",
    });
    return buildHttpRpcRequest(context, headers, "/", undefined, body);
};
exports.serializeAws_queryGetFederationTokenCommand = serializeAws_queryGetFederationTokenCommand;
const serializeAws_queryGetSessionTokenCommand = async (input, context) => {
    const headers = {
        "content-type": "application/x-www-form-urlencoded",
    };
    let body;
    body = buildFormUrlencodedString({
        ...serializeAws_queryGetSessionTokenRequest(input, context),
        Action: "GetSessionToken",
        Version: "2011-06-15",
    });
    return buildHttpRpcRequest(context, headers, "/", undefined, body);
};
exports.serializeAws_queryGetSessionTokenCommand = serializeAws_queryGetSessionTokenCommand;
const deserializeAws_queryAssumeRoleCommand = async (output, context) => {
    if (output.statusCode >= 300) {
        return deserializeAws_queryAssumeRoleCommandError(output, context);
    }
    const data = await parseBody(output.body, context);
    let contents = {};
    contents = deserializeAws_queryAssumeRoleResponse(data.AssumeRoleResult, context);
    const response = {
        $metadata: deserializeMetadata(output),
        ...contents,
    };
    return Promise.resolve(response);
};
exports.deserializeAws_queryAssumeRoleCommand = deserializeAws_queryAssumeRoleCommand;
const deserializeAws_queryAssumeRoleCommandError = async (output, context) => {
    const parsedOutput = {
        ...output,
        body: await parseBody(output.body, context),
    };
    let response;
    let errorCode = "UnknownError";
    errorCode = loadQueryErrorCode(output, parsedOutput.body);
    switch (errorCode) {
        case "ExpiredTokenException":
        case "com.amazonaws.sts#ExpiredTokenException":
            response = {
                ...(await deserializeAws_queryExpiredTokenExceptionResponse(parsedOutput, context)),
                name: errorCode,
                $metadata: deserializeMetadata(output),
            };
            break;
        case "MalformedPolicyDocumentException":
        case "com.amazonaws.sts#MalformedPolicyDocumentException":
            response = {
                ...(await deserializeAws_queryMalformedPolicyDocumentExceptionResponse(parsedOutput, context)),
                name: errorCode,
                $metadata: deserializeMetadata(output),
            };
            break;
        case "PackedPolicyTooLargeException":
        case "com.amazonaws.sts#PackedPolicyTooLargeException":
            response = {
                ...(await deserializeAws_queryPackedPolicyTooLargeExceptionResponse(parsedOutput, context)),
                name: errorCode,
                $metadata: deserializeMetadata(output),
            };
            break;
        case "RegionDisabledException":
        case "com.amazonaws.sts#RegionDisabledException":
            response = {
                ...(await deserializeAws_queryRegionDisabledExceptionResponse(parsedOutput, context)),
                name: errorCode,
                $metadata: deserializeMetadata(output),
            };
            break;
        default:
            const parsedBody = parsedOutput.body;
            errorCode = parsedBody.Error.code || parsedBody.Error.Code || errorCode;
            response = {
                ...parsedBody.Error,
                name: `${errorCode}`,
                message: parsedBody.Error.message || parsedBody.Error.Message || errorCode,
                $fault: "client",
                $metadata: deserializeMetadata(output),
            };
    }
    const message = response.message || response.Message || errorCode;
    response.message = message;
    delete response.Message;
    return Promise.reject(Object.assign(new Error(message), response));
};
const deserializeAws_queryAssumeRoleWithSAMLCommand = async (output, context) => {
    if (output.statusCode >= 300) {
        return deserializeAws_queryAssumeRoleWithSAMLCommandError(output, context);
    }
    const data = await parseBody(output.body, context);
    let contents = {};
    contents = deserializeAws_queryAssumeRoleWithSAMLResponse(data.AssumeRoleWithSAMLResult, context);
    const response = {
        $metadata: deserializeMetadata(output),
        ...contents,
    };
    return Promise.resolve(response);
};
exports.deserializeAws_queryAssumeRoleWithSAMLCommand = deserializeAws_queryAssumeRoleWithSAMLCommand;
const deserializeAws_queryAssumeRoleWithSAMLCommandError = async (output, context) => {
    const parsedOutput = {
        ...output,
        body: await parseBody(output.body, context),
    };
    let response;
    let errorCode = "UnknownError";
    errorCode = loadQueryErrorCode(output, parsedOutput.body);
    switch (errorCode) {
        case "ExpiredTokenException":
        case "com.amazonaws.sts#ExpiredTokenException":
            response = {
                ...(await deserializeAws_queryExpiredTokenExceptionResponse(parsedOutput, context)),
                name: errorCode,
                $metadata: deserializeMetadata(output),
            };
            break;
        case "IDPRejectedClaimException":
        case "com.amazonaws.sts#IDPRejectedClaimException":
            response = {
                ...(await deserializeAws_queryIDPRejectedClaimExceptionResponse(parsedOutput, context)),
                name: errorCode,
                $metadata: deserializeMetadata(output),
            };
            break;
        case "InvalidIdentityTokenException":
        case "com.amazonaws.sts#InvalidIdentityTokenException":
            response = {
                ...(await deserializeAws_queryInvalidIdentityTokenExceptionResponse(parsedOutput, context)),
                name: errorCode,
                $metadata: deserializeMetadata(output),
            };
            break;
        case "MalformedPolicyDocumentException":
        case "com.amazonaws.sts#MalformedPolicyDocumentException":
            response = {
                ...(await deserializeAws_queryMalformedPolicyDocumentExceptionResponse(parsedOutput, context)),
                name: errorCode,
                $metadata: deserializeMetadata(output),
            };
            break;
        case "PackedPolicyTooLargeException":
        case "com.amazonaws.sts#PackedPolicyTooLargeException":
            response = {
                ...(await deserializeAws_queryPackedPolicyTooLargeExceptionResponse(parsedOutput, context)),
                name: errorCode,
                $metadata: deserializeMetadata(output),
            };
            break;
        case "RegionDisabledException":
        case "com.amazonaws.sts#RegionDisabledException":
            response = {
                ...(await deserializeAws_queryRegionDisabledExceptionResponse(parsedOutput, context)),
                name: errorCode,
                $metadata: deserializeMetadata(output),
            };
            break;
        default:
            const parsedBody = parsedOutput.body;
            errorCode = parsedBody.Error.code || parsedBody.Error.Code || errorCode;
            response = {
                ...parsedBody.Error,
                name: `${errorCode}`,
                message: parsedBody.Error.message || parsedBody.Error.Message || errorCode,
                $fault: "client",
                $metadata: deserializeMetadata(output),
            };
    }
    const message = response.message || response.Message || errorCode;
    response.message = message;
    delete response.Message;
    return Promise.reject(Object.assign(new Error(message), response));
};
const deserializeAws_queryAssumeRoleWithWebIdentityCommand = async (output, context) => {
    if (output.statusCode >= 300) {
        return deserializeAws_queryAssumeRoleWithWebIdentityCommandError(output, context);
    }
    const data = await parseBody(output.body, context);
    let contents = {};
    contents = deserializeAws_queryAssumeRoleWithWebIdentityResponse(data.AssumeRoleWithWebIdentityResult, context);
    const response = {
        $metadata: deserializeMetadata(output),
        ...contents,
    };
    return Promise.resolve(response);
};
exports.deserializeAws_queryAssumeRoleWithWebIdentityCommand = deserializeAws_queryAssumeRoleWithWebIdentityCommand;
const deserializeAws_queryAssumeRoleWithWebIdentityCommandError = async (output, context) => {
    const parsedOutput = {
        ...output,
        body: await parseBody(output.body, context),
    };
    let response;
    let errorCode = "UnknownError";
    errorCode = loadQueryErrorCode(output, parsedOutput.body);
    switch (errorCode) {
        case "ExpiredTokenException":
        case "com.amazonaws.sts#ExpiredTokenException":
            response = {
                ...(await deserializeAws_queryExpiredTokenExceptionResponse(parsedOutput, context)),
                name: errorCode,
                $metadata: deserializeMetadata(output),
            };
            break;
        case "IDPCommunicationErrorException":
        case "com.amazonaws.sts#IDPCommunicationErrorException":
            response = {
                ...(await deserializeAws_queryIDPCommunicationErrorExceptionResponse(parsedOutput, context)),
                name: errorCode,
                $metadata: deserializeMetadata(output),
            };
            break;
        case "IDPRejectedClaimException":
        case "com.amazonaws.sts#IDPRejectedClaimException":
            response = {
                ...(await deserializeAws_queryIDPRejectedClaimExceptionResponse(parsedOutput, context)),
                name: errorCode,
                $metadata: deserializeMetadata(output),
            };
            break;
        case "InvalidIdentityTokenException":
        case "com.amazonaws.sts#InvalidIdentityTokenException":
            response = {
                ...(await deserializeAws_queryInvalidIdentityTokenExceptionResponse(parsedOutput, context)),
                name: errorCode,
                $metadata: deserializeMetadata(output),
            };
            break;
        case "MalformedPolicyDocumentException":
        case "com.amazonaws.sts#MalformedPolicyDocumentException":
            response = {
                ...(await deserializeAws_queryMalformedPolicyDocumentExceptionResponse(parsedOutput, context)),
                name: errorCode,
                $metadata: deserializeMetadata(output),
            };
            break;
        case "PackedPolicyTooLargeException":
        case "com.amazonaws.sts#PackedPolicyTooLargeException":
            response = {
                ...(await deserializeAws_queryPackedPolicyTooLargeExceptionResponse(parsedOutput, context)),
                name: errorCode,
                $metadata: deserializeMetadata(output),
            };
            break;
        case "RegionDisabledException":
        case "com.amazonaws.sts#RegionDisabledException":
            response = {
                ...(await deserializeAws_queryRegionDisabledExceptionResponse(parsedOutput, context)),
                name: errorCode,
                $metadata: deserializeMetadata(output),
            };
            break;
        default:
            const parsedBody = parsedOutput.body;
            errorCode = parsedBody.Error.code || parsedBody.Error.Code || errorCode;
            response = {
                ...parsedBody.Error,
                name: `${errorCode}`,
                message: parsedBody.Error.message || parsedBody.Error.Message || errorCode,
                $fault: "client",
                $metadata: deserializeMetadata(output),
            };
    }
    const message = response.message || response.Message || errorCode;
    response.message = message;
    delete response.Message;
    return Promise.reject(Object.assign(new Error(message), response));
};
const deserializeAws_queryDecodeAuthorizationMessageCommand = async (output, context) => {
    if (output.statusCode >= 300) {
        return deserializeAws_queryDecodeAuthorizationMessageCommandError(output, context);
    }
    const data = await parseBody(output.body, context);
    let contents = {};
    contents = deserializeAws_queryDecodeAuthorizationMessageResponse(data.DecodeAuthorizationMessageResult, context);
    const response = {
        $metadata: deserializeMetadata(output),
        ...contents,
    };
    return Promise.resolve(response);
};
exports.deserializeAws_queryDecodeAuthorizationMessageCommand = deserializeAws_queryDecodeAuthorizationMessageCommand;
const deserializeAws_queryDecodeAuthorizationMessageCommandError = async (output, context) => {
    const parsedOutput = {
        ...output,
        body: await parseBody(output.body, context),
    };
    let response;
    let errorCode = "UnknownError";
    errorCode = loadQueryErrorCode(output, parsedOutput.body);
    switch (errorCode) {
        case "InvalidAuthorizationMessageException":
        case "com.amazonaws.sts#InvalidAuthorizationMessageException":
            response = {
                ...(await deserializeAws_queryInvalidAuthorizationMessageExceptionResponse(parsedOutput, context)),
                name: errorCode,
                $metadata: deserializeMetadata(output),
            };
            break;
        default:
            const parsedBody = parsedOutput.body;
            errorCode = parsedBody.Error.code || parsedBody.Error.Code || errorCode;
            response = {
                ...parsedBody.Error,
                name: `${errorCode}`,
                message: parsedBody.Error.message || parsedBody.Error.Message || errorCode,
                $fault: "client",
                $metadata: deserializeMetadata(output),
            };
    }
    const message = response.message || response.Message || errorCode;
    response.message = message;
    delete response.Message;
    return Promise.reject(Object.assign(new Error(message), response));
};
const deserializeAws_queryGetAccessKeyInfoCommand = async (output, context) => {
    if (output.statusCode >= 300) {
        return deserializeAws_queryGetAccessKeyInfoCommandError(output, context);
    }
    const data = await parseBody(output.body, context);
    let contents = {};
    contents = deserializeAws_queryGetAccessKeyInfoResponse(data.GetAccessKeyInfoResult, context);
    const response = {
        $metadata: deserializeMetadata(output),
        ...contents,
    };
    return Promise.resolve(response);
};
exports.deserializeAws_queryGetAccessKeyInfoCommand = deserializeAws_queryGetAccessKeyInfoCommand;
const deserializeAws_queryGetAccessKeyInfoCommandError = async (output, context) => {
    const parsedOutput = {
        ...output,
        body: await parseBody(output.body, context),
    };
    let response;
    let errorCode = "UnknownError";
    errorCode = loadQueryErrorCode(output, parsedOutput.body);
    switch (errorCode) {
        default:
            const parsedBody = parsedOutput.body;
            errorCode = parsedBody.Error.code || parsedBody.Error.Code || errorCode;
            response = {
                ...parsedBody.Error,
                name: `${errorCode}`,
                message: parsedBody.Error.message || parsedBody.Error.Message || errorCode,
                $fault: "client",
                $metadata: deserializeMetadata(output),
            };
    }
    const message = response.message || response.Message || errorCode;
    response.message = message;
    delete response.Message;
    return Promise.reject(Object.assign(new Error(message), response));
};
const deserializeAws_queryGetCallerIdentityCommand = async (output, context) => {
    if (output.statusCode >= 300) {
        return deserializeAws_queryGetCallerIdentityCommandError(output, context);
    }
    const data = await parseBody(output.body, context);
    let contents = {};
    contents = deserializeAws_queryGetCallerIdentityResponse(data.GetCallerIdentityResult, context);
    const response = {
        $metadata: deserializeMetadata(output),
        ...contents,
    };
    return Promise.resolve(response);
};
exports.deserializeAws_queryGetCallerIdentityCommand = deserializeAws_queryGetCallerIdentityCommand;
const deserializeAws_queryGetCallerIdentityCommandError = async (output, context) => {
    const parsedOutput = {
        ...output,
        body: await parseBody(output.body, context),
    };
    let response;
    let errorCode = "UnknownError";
    errorCode = loadQueryErrorCode(output, parsedOutput.body);
    switch (errorCode) {
        default:
            const parsedBody = parsedOutput.body;
            errorCode = parsedBody.Error.code || parsedBody.Error.Code || errorCode;
            response = {
                ...parsedBody.Error,
                name: `${errorCode}`,
                message: parsedBody.Error.message || parsedBody.Error.Message || errorCode,
                $fault: "client",
                $metadata: deserializeMetadata(output),
            };
    }
    const message = response.message || response.Message || errorCode;
    response.message = message;
    delete response.Message;
    return Promise.reject(Object.assign(new Error(message), response));
};
const deserializeAws_queryGetFederationTokenCommand = async (output, context) => {
    if (output.statusCode >= 300) {
        return deserializeAws_queryGetFederationTokenCommandError(output, context);
    }
    const data = await parseBody(output.body, context);
    let contents = {};
    contents = deserializeAws_queryGetFederationTokenResponse(data.GetFederationTokenResult, context);
    const response = {
        $metadata: deserializeMetadata(output),
        ...contents,
    };
    return Promise.resolve(response);
};
exports.deserializeAws_queryGetFederationTokenCommand = deserializeAws_queryGetFederationTokenCommand;
const deserializeAws_queryGetFederationTokenCommandError = async (output, context) => {
    const parsedOutput = {
        ...output,
        body: await parseBody(output.body, context),
    };
    let response;
    let errorCode = "UnknownError";
    errorCode = loadQueryErrorCode(output, parsedOutput.body);
    switch (errorCode) {
        case "MalformedPolicyDocumentException":
        case "com.amazonaws.sts#MalformedPolicyDocumentException":
            response = {
                ...(await deserializeAws_queryMalformedPolicyDocumentExceptionResponse(parsedOutput, context)),
                name: errorCode,
                $metadata: deserializeMetadata(output),
            };
            break;
        case "PackedPolicyTooLargeException":
        case "com.amazonaws.sts#PackedPolicyTooLargeException":
            response = {
                ...(await deserializeAws_queryPackedPolicyTooLargeExceptionResponse(parsedOutput, context)),
                name: errorCode,
                $metadata: deserializeMetadata(output),
            };
            break;
        case "RegionDisabledException":
        case "com.amazonaws.sts#RegionDisabledException":
            response = {
                ...(await deserializeAws_queryRegionDisabledExceptionResponse(parsedOutput, context)),
                name: errorCode,
                $metadata: deserializeMetadata(output),
            };
            break;
        default:
            const parsedBody = parsedOutput.body;
            errorCode = parsedBody.Error.code || parsedBody.Error.Code || errorCode;
            response = {
                ...parsedBody.Error,
                name: `${errorCode}`,
                message: parsedBody.Error.message || parsedBody.Error.Message || errorCode,
                $fault: "client",
                $metadata: deserializeMetadata(output),
            };
    }
    const message = response.message || response.Message || errorCode;
    response.message = message;
    delete response.Message;
    return Promise.reject(Object.assign(new Error(message), response));
};
const deserializeAws_queryGetSessionTokenCommand = async (output, context) => {
    if (output.statusCode >= 300) {
        return deserializeAws_queryGetSessionTokenCommandError(output, context);
    }
    const data = await parseBody(output.body, context);
    let contents = {};
    contents = deserializeAws_queryGetSessionTokenResponse(data.GetSessionTokenResult, context);
    const response = {
        $metadata: deserializeMetadata(output),
        ...contents,
    };
    return Promise.resolve(response);
};
exports.deserializeAws_queryGetSessionTokenCommand = deserializeAws_queryGetSessionTokenCommand;
const deserializeAws_queryGetSessionTokenCommandError = async (output, context) => {
    const parsedOutput = {
        ...output,
        body: await parseBody(output.body, context),
    };
    let response;
    let errorCode = "UnknownError";
    errorCode = loadQueryErrorCode(output, parsedOutput.body);
    switch (errorCode) {
        case "RegionDisabledException":
        case "com.amazonaws.sts#RegionDisabledException":
            response = {
                ...(await deserializeAws_queryRegionDisabledExceptionResponse(parsedOutput, context)),
                name: errorCode,
                $metadata: deserializeMetadata(output),
            };
            break;
        default:
            const parsedBody = parsedOutput.body;
            errorCode = parsedBody.Error.code || parsedBody.Error.Code || errorCode;
            response = {
                ...parsedBody.Error,
                name: `${errorCode}`,
                message: parsedBody.Error.message || parsedBody.Error.Message || errorCode,
                $fault: "client",
                $metadata: deserializeMetadata(output),
            };
    }
    const message = response.message || response.Message || errorCode;
    response.message = message;
    delete response.Message;
    return Promise.reject(Object.assign(new Error(message), response));
};
const deserializeAws_queryExpiredTokenExceptionResponse = async (parsedOutput, context) => {
    const body = parsedOutput.body;
    const deserialized = deserializeAws_queryExpiredTokenException(body.Error, context);
    const contents = {
        name: "ExpiredTokenException",
        $fault: "client",
        $metadata: deserializeMetadata(parsedOutput),
        ...deserialized,
    };
    return contents;
};
const deserializeAws_queryIDPCommunicationErrorExceptionResponse = async (parsedOutput, context) => {
    const body = parsedOutput.body;
    const deserialized = deserializeAws_queryIDPCommunicationErrorException(body.Error, context);
    const contents = {
        name: "IDPCommunicationErrorException",
        $fault: "client",
        $metadata: deserializeMetadata(parsedOutput),
        ...deserialized,
    };
    return contents;
};
const deserializeAws_queryIDPRejectedClaimExceptionResponse = async (parsedOutput, context) => {
    const body = parsedOutput.body;
    const deserialized = deserializeAws_queryIDPRejectedClaimException(body.Error, context);
    const contents = {
        name: "IDPRejectedClaimException",
        $fault: "client",
        $metadata: deserializeMetadata(parsedOutput),
        ...deserialized,
    };
    return contents;
};
const deserializeAws_queryInvalidAuthorizationMessageExceptionResponse = async (parsedOutput, context) => {
    const body = parsedOutput.body;
    const deserialized = deserializeAws_queryInvalidAuthorizationMessageException(body.Error, context);
    const contents = {
        name: "InvalidAuthorizationMessageException",
        $fault: "client",
        $metadata: deserializeMetadata(parsedOutput),
        ...deserialized,
    };
    return contents;
};
const deserializeAws_queryInvalidIdentityTokenExceptionResponse = async (parsedOutput, context) => {
    const body = parsedOutput.body;
    const deserialized = deserializeAws_queryInvalidIdentityTokenException(body.Error, context);
    const contents = {
        name: "InvalidIdentityTokenException",
        $fault: "client",
        $metadata: deserializeMetadata(parsedOutput),
        ...deserialized,
    };
    return contents;
};
const deserializeAws_queryMalformedPolicyDocumentExceptionResponse = async (parsedOutput, context) => {
    const body = parsedOutput.body;
    const deserialized = deserializeAws_queryMalformedPolicyDocumentException(body.Error, context);
    const contents = {
        name: "MalformedPolicyDocumentException",
        $fault: "client",
        $metadata: deserializeMetadata(parsedOutput),
        ...deserialized,
    };
    return contents;
};
const deserializeAws_queryPackedPolicyTooLargeExceptionResponse = async (parsedOutput, context) => {
    const body = parsedOutput.body;
    const deserialized = deserializeAws_queryPackedPolicyTooLargeException(body.Error, context);
    const contents = {
        name: "PackedPolicyTooLargeException",
        $fault: "client",
        $metadata: deserializeMetadata(parsedOutput),
        ...deserialized,
    };
    return contents;
};
const deserializeAws_queryRegionDisabledExceptionResponse = async (parsedOutput, context) => {
    const body = parsedOutput.body;
    const deserialized = deserializeAws_queryRegionDisabledException(body.Error, context);
    const contents = {
        name: "RegionDisabledException",
        $fault: "client",
        $metadata: deserializeMetadata(parsedOutput),
        ...deserialized,
    };
    return contents;
};
const serializeAws_queryAssumeRoleRequest = (input, context) => {
    const entries = {};
    if (input.RoleArn !== undefined && input.RoleArn !== null) {
        entries["RoleArn"] = input.RoleArn;
    }
    if (input.RoleSessionName !== undefined && input.RoleSessionName !== null) {
        entries["RoleSessionName"] = input.RoleSessionName;
    }
    if (input.PolicyArns !== undefined && input.PolicyArns !== null) {
        const memberEntries = serializeAws_querypolicyDescriptorListType(input.PolicyArns, context);
        Object.entries(memberEntries).forEach(([key, value]) => {
            const loc = `PolicyArns.${key}`;
            entries[loc] = value;
        });
    }
    if (input.Policy !== undefined && input.Policy !== null) {
        entries["Policy"] = input.Policy;
    }
    if (input.DurationSeconds !== undefined && input.DurationSeconds !== null) {
        entries["DurationSeconds"] = input.DurationSeconds;
    }
    if (input.Tags !== undefined && input.Tags !== null) {
        const memberEntries = serializeAws_querytagListType(input.Tags, context);
        Object.entries(memberEntries).forEach(([key, value]) => {
            const loc = `Tags.${key}`;
            entries[loc] = value;
        });
    }
    if (input.TransitiveTagKeys !== undefined && input.TransitiveTagKeys !== null) {
        const memberEntries = serializeAws_querytagKeyListType(input.TransitiveTagKeys, context);
        Object.entries(memberEntries).forEach(([key, value]) => {
            const loc = `TransitiveTagKeys.${key}`;
            entries[loc] = value;
        });
    }
    if (input.ExternalId !== undefined && input.ExternalId !== null) {
        entries["ExternalId"] = input.ExternalId;
    }
    if (input.SerialNumber !== undefined && input.SerialNumber !== null) {
        entries["SerialNumber"] = input.SerialNumber;
    }
    if (input.TokenCode !== undefined && input.TokenCode !== null) {
        entries["TokenCode"] = input.TokenCode;
    }
    return entries;
};
const serializeAws_queryAssumeRoleWithSAMLRequest = (input, context) => {
    const entries = {};
    if (input.RoleArn !== undefined && input.RoleArn !== null) {
        entries["RoleArn"] = input.RoleArn;
    }
    if (input.PrincipalArn !== undefined && input.PrincipalArn !== null) {
        entries["PrincipalArn"] = input.PrincipalArn;
    }
    if (input.SAMLAssertion !== undefined && input.SAMLAssertion !== null) {
        entries["SAMLAssertion"] = input.SAMLAssertion;
    }
    if (input.PolicyArns !== undefined && input.PolicyArns !== null) {
        const memberEntries = serializeAws_querypolicyDescriptorListType(input.PolicyArns, context);
        Object.entries(memberEntries).forEach(([key, value]) => {
            const loc = `PolicyArns.${key}`;
            entries[loc] = value;
        });
    }
    if (input.Policy !== undefined && input.Policy !== null) {
        entries["Policy"] = input.Policy;
    }
    if (input.DurationSeconds !== undefined && input.DurationSeconds !== null) {
        entries["DurationSeconds"] = input.DurationSeconds;
    }
    return entries;
};
const serializeAws_queryAssumeRoleWithWebIdentityRequest = (input, context) => {
    const entries = {};
    if (input.RoleArn !== undefined && input.RoleArn !== null) {
        entries["RoleArn"] = input.RoleArn;
    }
    if (input.RoleSessionName !== undefined && input.RoleSessionName !== null) {
        entries["RoleSessionName"] = input.RoleSessionName;
    }
    if (input.WebIdentityToken !== undefined && input.WebIdentityToken !== null) {
        entries["WebIdentityToken"] = input.WebIdentityToken;
    }
    if (input.ProviderId !== undefined && input.ProviderId !== null) {
        entries["ProviderId"] = input.ProviderId;
    }
    if (input.PolicyArns !== undefined && input.PolicyArns !== null) {
        const memberEntries = serializeAws_querypolicyDescriptorListType(input.PolicyArns, context);
        Object.entries(memberEntries).forEach(([key, value]) => {
            const loc = `PolicyArns.${key}`;
            entries[loc] = value;
        });
    }
    if (input.Policy !== undefined && input.Policy !== null) {
        entries["Policy"] = input.Policy;
    }
    if (input.DurationSeconds !== undefined && input.DurationSeconds !== null) {
        entries["DurationSeconds"] = input.DurationSeconds;
    }
    return entries;
};
const serializeAws_queryDecodeAuthorizationMessageRequest = (input, context) => {
    const entries = {};
    if (input.EncodedMessage !== undefined && input.EncodedMessage !== null) {
        entries["EncodedMessage"] = input.EncodedMessage;
    }
    return entries;
};
const serializeAws_queryGetAccessKeyInfoRequest = (input, context) => {
    const entries = {};
    if (input.AccessKeyId !== undefined && input.AccessKeyId !== null) {
        entries["AccessKeyId"] = input.AccessKeyId;
    }
    return entries;
};
const serializeAws_queryGetCallerIdentityRequest = (input, context) => {
    const entries = {};
    return entries;
};
const serializeAws_queryGetFederationTokenRequest = (input, context) => {
    const entries = {};
    if (input.Name !== undefined && input.Name !== null) {
        entries["Name"] = input.Name;
    }
    if (input.Policy !== undefined && input.Policy !== null) {
        entries["Policy"] = input.Policy;
    }
    if (input.PolicyArns !== undefined && input.PolicyArns !== null) {
        const memberEntries = serializeAws_querypolicyDescriptorListType(input.PolicyArns, context);
        Object.entries(memberEntries).forEach(([key, value]) => {
            const loc = `PolicyArns.${key}`;
            entries[loc] = value;
        });
    }
    if (input.DurationSeconds !== undefined && input.DurationSeconds !== null) {
        entries["DurationSeconds"] = input.DurationSeconds;
    }
    if (input.Tags !== undefined && input.Tags !== null) {
        const memberEntries = serializeAws_querytagListType(input.Tags, context);
        Object.entries(memberEntries).forEach(([key, value]) => {
            const loc = `Tags.${key}`;
            entries[loc] = value;
        });
    }
    return entries;
};
const serializeAws_queryGetSessionTokenRequest = (input, context) => {
    const entries = {};
    if (input.DurationSeconds !== undefined && input.DurationSeconds !== null) {
        entries["DurationSeconds"] = input.DurationSeconds;
    }
    if (input.SerialNumber !== undefined && input.SerialNumber !== null) {
        entries["SerialNumber"] = input.SerialNumber;
    }
    if (input.TokenCode !== undefined && input.TokenCode !== null) {
        entries["TokenCode"] = input.TokenCode;
    }
    return entries;
};
const serializeAws_querypolicyDescriptorListType = (input, context) => {
    const entries = {};
    let counter = 1;
    for (let entry of input) {
        if (entry === null) {
            continue;
        }
        const memberEntries = serializeAws_queryPolicyDescriptorType(entry, context);
        Object.entries(memberEntries).forEach(([key, value]) => {
            entries[`member.${counter}.${key}`] = value;
        });
        counter++;
    }
    return entries;
};
const serializeAws_queryPolicyDescriptorType = (input, context) => {
    const entries = {};
    if (input.arn !== undefined && input.arn !== null) {
        entries["arn"] = input.arn;
    }
    return entries;
};
const serializeAws_queryTag = (input, context) => {
    const entries = {};
    if (input.Key !== undefined && input.Key !== null) {
        entries["Key"] = input.Key;
    }
    if (input.Value !== undefined && input.Value !== null) {
        entries["Value"] = input.Value;
    }
    return entries;
};
const serializeAws_querytagKeyListType = (input, context) => {
    const entries = {};
    let counter = 1;
    for (let entry of input) {
        if (entry === null) {
            continue;
        }
        entries[`member.${counter}`] = entry;
        counter++;
    }
    return entries;
};
const serializeAws_querytagListType = (input, context) => {
    const entries = {};
    let counter = 1;
    for (let entry of input) {
        if (entry === null) {
            continue;
        }
        const memberEntries = serializeAws_queryTag(entry, context);
        Object.entries(memberEntries).forEach(([key, value]) => {
            entries[`member.${counter}.${key}`] = value;
        });
        counter++;
    }
    return entries;
};
const deserializeAws_queryAssumedRoleUser = (output, context) => {
    let contents = {
        AssumedRoleId: undefined,
        Arn: undefined,
    };
    if (output["AssumedRoleId"] !== undefined) {
        contents.AssumedRoleId = output["AssumedRoleId"];
    }
    if (output["Arn"] !== undefined) {
        contents.Arn = output["Arn"];
    }
    return contents;
};
const deserializeAws_queryAssumeRoleResponse = (output, context) => {
    let contents = {
        Credentials: undefined,
        AssumedRoleUser: undefined,
        PackedPolicySize: undefined,
    };
    if (output["Credentials"] !== undefined) {
        contents.Credentials = deserializeAws_queryCredentials(output["Credentials"], context);
    }
    if (output["AssumedRoleUser"] !== undefined) {
        contents.AssumedRoleUser = deserializeAws_queryAssumedRoleUser(output["AssumedRoleUser"], context);
    }
    if (output["PackedPolicySize"] !== undefined) {
        contents.PackedPolicySize = parseInt(output["PackedPolicySize"]);
    }
    return contents;
};
const deserializeAws_queryAssumeRoleWithSAMLResponse = (output, context) => {
    let contents = {
        Credentials: undefined,
        AssumedRoleUser: undefined,
        PackedPolicySize: undefined,
        Subject: undefined,
        SubjectType: undefined,
        Issuer: undefined,
        Audience: undefined,
        NameQualifier: undefined,
    };
    if (output["Credentials"] !== undefined) {
        contents.Credentials = deserializeAws_queryCredentials(output["Credentials"], context);
    }
    if (output["AssumedRoleUser"] !== undefined) {
        contents.AssumedRoleUser = deserializeAws_queryAssumedRoleUser(output["AssumedRoleUser"], context);
    }
    if (output["PackedPolicySize"] !== undefined) {
        contents.PackedPolicySize = parseInt(output["PackedPolicySize"]);
    }
    if (output["Subject"] !== undefined) {
        contents.Subject = output["Subject"];
    }
    if (output["SubjectType"] !== undefined) {
        contents.SubjectType = output["SubjectType"];
    }
    if (output["Issuer"] !== undefined) {
        contents.Issuer = output["Issuer"];
    }
    if (output["Audience"] !== undefined) {
        contents.Audience = output["Audience"];
    }
    if (output["NameQualifier"] !== undefined) {
        contents.NameQualifier = output["NameQualifier"];
    }
    return contents;
};
const deserializeAws_queryAssumeRoleWithWebIdentityResponse = (output, context) => {
    let contents = {
        Credentials: undefined,
        SubjectFromWebIdentityToken: undefined,
        AssumedRoleUser: undefined,
        PackedPolicySize: undefined,
        Provider: undefined,
        Audience: undefined,
    };
    if (output["Credentials"] !== undefined) {
        contents.Credentials = deserializeAws_queryCredentials(output["Credentials"], context);
    }
    if (output["SubjectFromWebIdentityToken"] !== undefined) {
        contents.SubjectFromWebIdentityToken = output["SubjectFromWebIdentityToken"];
    }
    if (output["AssumedRoleUser"] !== undefined) {
        contents.AssumedRoleUser = deserializeAws_queryAssumedRoleUser(output["AssumedRoleUser"], context);
    }
    if (output["PackedPolicySize"] !== undefined) {
        contents.PackedPolicySize = parseInt(output["PackedPolicySize"]);
    }
    if (output["Provider"] !== undefined) {
        contents.Provider = output["Provider"];
    }
    if (output["Audience"] !== undefined) {
        contents.Audience = output["Audience"];
    }
    return contents;
};
const deserializeAws_queryCredentials = (output, context) => {
    let contents = {
        AccessKeyId: undefined,
        SecretAccessKey: undefined,
        SessionToken: undefined,
        Expiration: undefined,
    };
    if (output["AccessKeyId"] !== undefined) {
        contents.AccessKeyId = output["AccessKeyId"];
    }
    if (output["SecretAccessKey"] !== undefined) {
        contents.SecretAccessKey = output["SecretAccessKey"];
    }
    if (output["SessionToken"] !== undefined) {
        contents.SessionToken = output["SessionToken"];
    }
    if (output["Expiration"] !== undefined) {
        contents.Expiration = new Date(output["Expiration"]);
    }
    return contents;
};
const deserializeAws_queryDecodeAuthorizationMessageResponse = (output, context) => {
    let contents = {
        DecodedMessage: undefined,
    };
    if (output["DecodedMessage"] !== undefined) {
        contents.DecodedMessage = output["DecodedMessage"];
    }
    return contents;
};
const deserializeAws_queryExpiredTokenException = (output, context) => {
    let contents = {
        message: undefined,
    };
    if (output["message"] !== undefined) {
        contents.message = output["message"];
    }
    return contents;
};
const deserializeAws_queryFederatedUser = (output, context) => {
    let contents = {
        FederatedUserId: undefined,
        Arn: undefined,
    };
    if (output["FederatedUserId"] !== undefined) {
        contents.FederatedUserId = output["FederatedUserId"];
    }
    if (output["Arn"] !== undefined) {
        contents.Arn = output["Arn"];
    }
    return contents;
};
const deserializeAws_queryGetAccessKeyInfoResponse = (output, context) => {
    let contents = {
        Account: undefined,
    };
    if (output["Account"] !== undefined) {
        contents.Account = output["Account"];
    }
    return contents;
};
const deserializeAws_queryGetCallerIdentityResponse = (output, context) => {
    let contents = {
        UserId: undefined,
        Account: undefined,
        Arn: undefined,
    };
    if (output["UserId"] !== undefined) {
        contents.UserId = output["UserId"];
    }
    if (output["Account"] !== undefined) {
        contents.Account = output["Account"];
    }
    if (output["Arn"] !== undefined) {
        contents.Arn = output["Arn"];
    }
    return contents;
};
const deserializeAws_queryGetFederationTokenResponse = (output, context) => {
    let contents = {
        Credentials: undefined,
        FederatedUser: undefined,
        PackedPolicySize: undefined,
    };
    if (output["Credentials"] !== undefined) {
        contents.Credentials = deserializeAws_queryCredentials(output["Credentials"], context);
    }
    if (output["FederatedUser"] !== undefined) {
        contents.FederatedUser = deserializeAws_queryFederatedUser(output["FederatedUser"], context);
    }
    if (output["PackedPolicySize"] !== undefined) {
        contents.PackedPolicySize = parseInt(output["PackedPolicySize"]);
    }
    return contents;
};
const deserializeAws_queryGetSessionTokenResponse = (output, context) => {
    let contents = {
        Credentials: undefined,
    };
    if (output["Credentials"] !== undefined) {
        contents.Credentials = deserializeAws_queryCredentials(output["Credentials"], context);
    }
    return contents;
};
const deserializeAws_queryIDPCommunicationErrorException = (output, context) => {
    let contents = {
        message: undefined,
    };
    if (output["message"] !== undefined) {
        contents.message = output["message"];
    }
    return contents;
};
const deserializeAws_queryIDPRejectedClaimException = (output, context) => {
    let contents = {
        message: undefined,
    };
    if (output["message"] !== undefined) {
        contents.message = output["message"];
    }
    return contents;
};
const deserializeAws_queryInvalidAuthorizationMessageException = (output, context) => {
    let contents = {
        message: undefined,
    };
    if (output["message"] !== undefined) {
        contents.message = output["message"];
    }
    return contents;
};
const deserializeAws_queryInvalidIdentityTokenException = (output, context) => {
    let contents = {
        message: undefined,
    };
    if (output["message"] !== undefined) {
        contents.message = output["message"];
    }
    return contents;
};
const deserializeAws_queryMalformedPolicyDocumentException = (output, context) => {
    let contents = {
        message: undefined,
    };
    if (output["message"] !== undefined) {
        contents.message = output["message"];
    }
    return contents;
};
const deserializeAws_queryPackedPolicyTooLargeException = (output, context) => {
    let contents = {
        message: undefined,
    };
    if (output["message"] !== undefined) {
        contents.message = output["message"];
    }
    return contents;
};
const deserializeAws_queryRegionDisabledException = (output, context) => {
    let contents = {
        message: undefined,
    };
    if (output["message"] !== undefined) {
        contents.message = output["message"];
    }
    return contents;
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
const buildHttpRpcRequest = async (context, headers, path, resolvedHostname, body) => {
    const { hostname, protocol = "https", port } = await context.endpoint();
    const contents = {
        protocol,
        hostname,
        port,
        method: "POST",
        path,
        headers,
    };
    if (resolvedHostname !== undefined) {
        contents.hostname = resolvedHostname;
    }
    if (body !== undefined) {
        contents.body = body;
    }
    return new protocol_http_1.HttpRequest(contents);
};
const decodeEscapedXML = (str) => str
    .replace(/&amp;/g, "&")
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&gt;/g, ">")
    .replace(/&lt;/g, "<");
const parseBody = (streamBody, context) => collectBodyString(streamBody, context).then((encoded) => {
    if (encoded.length) {
        const parsedObj = fast_xml_parser_1.parse(encoded, {
            attributeNamePrefix: "",
            ignoreAttributes: false,
            parseNodeValue: false,
            tagValueProcessor: (val, tagName) => decodeEscapedXML(val),
        });
        const textNodeName = "#text";
        const key = Object.keys(parsedObj)[0];
        const parsedObjToReturn = parsedObj[key];
        if (parsedObjToReturn[textNodeName]) {
            parsedObjToReturn[key] = parsedObjToReturn[textNodeName];
            delete parsedObjToReturn[textNodeName];
        }
        return smithy_client_1.getValueFromTextNode(parsedObjToReturn);
    }
    return {};
});
const buildFormUrlencodedString = (formEntries) => Object.entries(formEntries)
    .map(([key, value]) => smithy_client_1.extendedEncodeURIComponent(key) + "=" + smithy_client_1.extendedEncodeURIComponent(value))
    .join("&");
const loadQueryErrorCode = (output, data) => {
    if (data.Error.Code !== undefined) {
        return data.Error.Code;
    }
    if (output.statusCode == 404) {
        return "NotFound";
    }
    return "";
};
//# sourceMappingURL=Aws_query.js.map