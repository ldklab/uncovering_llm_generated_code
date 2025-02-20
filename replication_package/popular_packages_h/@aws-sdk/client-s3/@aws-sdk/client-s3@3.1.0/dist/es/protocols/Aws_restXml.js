import { __assign, __awaiter, __generator } from "tslib";
import { AnalyticsFilter, LifecycleRuleFilter, MetricsFilter, ReplicationRuleFilter, } from "../models/models_0";
import { HttpRequest as __HttpRequest } from "@aws-sdk/protocol-http";
import { dateToUtcString as __dateToUtcString, extendedEncodeURIComponent as __extendedEncodeURIComponent, getArrayIfSingleItem as __getArrayIfSingleItem, getValueFromTextNode as __getValueFromTextNode, } from "@aws-sdk/smithy-client";
import { XmlNode as __XmlNode, XmlText as __XmlText } from "@aws-sdk/xml-builder";
import { parse as xmlParse } from "fast-xml-parser";
export var serializeAws_restXmlAbortMultipartUploadCommand = function (input, context) { return __awaiter(void 0, void 0, void 0, function () {
    var headers, resolvedPath, labelValue, labelValue, query, body, _a, hostname, _b, protocol, port;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                headers = __assign(__assign({}, (isSerializableHeaderValue(input.RequestPayer) && { "x-amz-request-payer": input.RequestPayer })), (isSerializableHeaderValue(input.ExpectedBucketOwner) && {
                    "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
                }));
                resolvedPath = "/{Bucket}/{Key+}";
                if (input.Bucket !== undefined) {
                    labelValue = input.Bucket;
                    if (labelValue.length <= 0) {
                        throw new Error("Empty value provided for input HTTP label: Bucket.");
                    }
                    resolvedPath = resolvedPath.replace("{Bucket}", __extendedEncodeURIComponent(labelValue));
                }
                else {
                    throw new Error("No value provided for input HTTP label: Bucket.");
                }
                if (input.Key !== undefined) {
                    labelValue = input.Key;
                    if (labelValue.length <= 0) {
                        throw new Error("Empty value provided for input HTTP label: Key.");
                    }
                    resolvedPath = resolvedPath.replace("{Key+}", labelValue
                        .split("/")
                        .map(function (segment) { return __extendedEncodeURIComponent(segment); })
                        .join("/"));
                }
                else {
                    throw new Error("No value provided for input HTTP label: Key.");
                }
                query = __assign({ "x-id": "AbortMultipartUpload" }, (input.UploadId !== undefined && { uploadId: input.UploadId }));
                return [4 /*yield*/, context.endpoint()];
            case 1:
                _a = _c.sent(), hostname = _a.hostname, _b = _a.protocol, protocol = _b === void 0 ? "https" : _b, port = _a.port;
                return [2 /*return*/, new __HttpRequest({
                        protocol: protocol,
                        hostname: hostname,
                        port: port,
                        method: "DELETE",
                        headers: headers,
                        path: resolvedPath,
                        query: query,
                        body: body,
                    })];
        }
    });
}); };
export var serializeAws_restXmlCompleteMultipartUploadCommand = function (input, context) { return __awaiter(void 0, void 0, void 0, function () {
    var headers, resolvedPath, labelValue, labelValue, query, body, contents, _a, hostname, _b, protocol, port;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                headers = __assign(__assign({ "content-type": "application/xml" }, (isSerializableHeaderValue(input.RequestPayer) && { "x-amz-request-payer": input.RequestPayer })), (isSerializableHeaderValue(input.ExpectedBucketOwner) && {
                    "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
                }));
                resolvedPath = "/{Bucket}/{Key+}";
                if (input.Bucket !== undefined) {
                    labelValue = input.Bucket;
                    if (labelValue.length <= 0) {
                        throw new Error("Empty value provided for input HTTP label: Bucket.");
                    }
                    resolvedPath = resolvedPath.replace("{Bucket}", __extendedEncodeURIComponent(labelValue));
                }
                else {
                    throw new Error("No value provided for input HTTP label: Bucket.");
                }
                if (input.Key !== undefined) {
                    labelValue = input.Key;
                    if (labelValue.length <= 0) {
                        throw new Error("Empty value provided for input HTTP label: Key.");
                    }
                    resolvedPath = resolvedPath.replace("{Key+}", labelValue
                        .split("/")
                        .map(function (segment) { return __extendedEncodeURIComponent(segment); })
                        .join("/"));
                }
                else {
                    throw new Error("No value provided for input HTTP label: Key.");
                }
                query = __assign({}, (input.UploadId !== undefined && { uploadId: input.UploadId }));
                if (input.MultipartUpload !== undefined) {
                    contents = serializeAws_restXmlCompletedMultipartUpload(input.MultipartUpload, context);
                    body = '<?xml version="1.0" encoding="UTF-8"?>';
                    contents.addAttribute("xmlns", "http://s3.amazonaws.com/doc/2006-03-01/");
                    body += contents.toString();
                }
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
                        query: query,
                        body: body,
                    })];
        }
    });
}); };
export var serializeAws_restXmlCopyObjectCommand = function (input, context) { return __awaiter(void 0, void 0, void 0, function () {
    var headers, resolvedPath, labelValue, labelValue, query, body, _a, hostname, _b, protocol, port;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                headers = __assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign({}, (isSerializableHeaderValue(input.ACL) && { "x-amz-acl": input.ACL })), (isSerializableHeaderValue(input.CacheControl) && { "Cache-Control": input.CacheControl })), (isSerializableHeaderValue(input.ContentDisposition) && { "Content-Disposition": input.ContentDisposition })), (isSerializableHeaderValue(input.ContentEncoding) && { "Content-Encoding": input.ContentEncoding })), (isSerializableHeaderValue(input.ContentLanguage) && { "Content-Language": input.ContentLanguage })), (isSerializableHeaderValue(input.ContentType) && { "Content-Type": input.ContentType })), (isSerializableHeaderValue(input.CopySource) && { "x-amz-copy-source": input.CopySource })), (isSerializableHeaderValue(input.CopySourceIfMatch) && {
                    "x-amz-copy-source-if-match": input.CopySourceIfMatch,
                })), (isSerializableHeaderValue(input.CopySourceIfModifiedSince) && {
                    "x-amz-copy-source-if-modified-since": __dateToUtcString(input.CopySourceIfModifiedSince).toString(),
                })), (isSerializableHeaderValue(input.CopySourceIfNoneMatch) && {
                    "x-amz-copy-source-if-none-match": input.CopySourceIfNoneMatch,
                })), (isSerializableHeaderValue(input.CopySourceIfUnmodifiedSince) && {
                    "x-amz-copy-source-if-unmodified-since": __dateToUtcString(input.CopySourceIfUnmodifiedSince).toString(),
                })), (isSerializableHeaderValue(input.Expires) && { Expires: __dateToUtcString(input.Expires).toString() })), (isSerializableHeaderValue(input.GrantFullControl) && { "x-amz-grant-full-control": input.GrantFullControl })), (isSerializableHeaderValue(input.GrantRead) && { "x-amz-grant-read": input.GrantRead })), (isSerializableHeaderValue(input.GrantReadACP) && { "x-amz-grant-read-acp": input.GrantReadACP })), (isSerializableHeaderValue(input.GrantWriteACP) && { "x-amz-grant-write-acp": input.GrantWriteACP })), (isSerializableHeaderValue(input.MetadataDirective) && { "x-amz-metadata-directive": input.MetadataDirective })), (isSerializableHeaderValue(input.TaggingDirective) && { "x-amz-tagging-directive": input.TaggingDirective })), (isSerializableHeaderValue(input.ServerSideEncryption) && {
                    "x-amz-server-side-encryption": input.ServerSideEncryption,
                })), (isSerializableHeaderValue(input.StorageClass) && { "x-amz-storage-class": input.StorageClass })), (isSerializableHeaderValue(input.WebsiteRedirectLocation) && {
                    "x-amz-website-redirect-location": input.WebsiteRedirectLocation,
                })), (isSerializableHeaderValue(input.SSECustomerAlgorithm) && {
                    "x-amz-server-side-encryption-customer-algorithm": input.SSECustomerAlgorithm,
                })), (isSerializableHeaderValue(input.SSECustomerKey) && {
                    "x-amz-server-side-encryption-customer-key": input.SSECustomerKey,
                })), (isSerializableHeaderValue(input.SSECustomerKeyMD5) && {
                    "x-amz-server-side-encryption-customer-key-MD5": input.SSECustomerKeyMD5,
                })), (isSerializableHeaderValue(input.SSEKMSKeyId) && {
                    "x-amz-server-side-encryption-aws-kms-key-id": input.SSEKMSKeyId,
                })), (isSerializableHeaderValue(input.SSEKMSEncryptionContext) && {
                    "x-amz-server-side-encryption-context": input.SSEKMSEncryptionContext,
                })), (isSerializableHeaderValue(input.BucketKeyEnabled) && {
                    "x-amz-server-side-encryption-bucket-key-enabled": input.BucketKeyEnabled.toString(),
                })), (isSerializableHeaderValue(input.CopySourceSSECustomerAlgorithm) && {
                    "x-amz-copy-source-server-side-encryption-customer-algorithm": input.CopySourceSSECustomerAlgorithm,
                })), (isSerializableHeaderValue(input.CopySourceSSECustomerKey) && {
                    "x-amz-copy-source-server-side-encryption-customer-key": input.CopySourceSSECustomerKey,
                })), (isSerializableHeaderValue(input.CopySourceSSECustomerKeyMD5) && {
                    "x-amz-copy-source-server-side-encryption-customer-key-MD5": input.CopySourceSSECustomerKeyMD5,
                })), (isSerializableHeaderValue(input.RequestPayer) && { "x-amz-request-payer": input.RequestPayer })), (isSerializableHeaderValue(input.Tagging) && { "x-amz-tagging": input.Tagging })), (isSerializableHeaderValue(input.ObjectLockMode) && { "x-amz-object-lock-mode": input.ObjectLockMode })), (isSerializableHeaderValue(input.ObjectLockRetainUntilDate) && {
                    "x-amz-object-lock-retain-until-date": (input.ObjectLockRetainUntilDate.toISOString().split(".")[0] + "Z").toString(),
                })), (isSerializableHeaderValue(input.ObjectLockLegalHoldStatus) && {
                    "x-amz-object-lock-legal-hold": input.ObjectLockLegalHoldStatus,
                })), (isSerializableHeaderValue(input.ExpectedBucketOwner) && {
                    "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
                })), (isSerializableHeaderValue(input.ExpectedSourceBucketOwner) && {
                    "x-amz-source-expected-bucket-owner": input.ExpectedSourceBucketOwner,
                })), (input.Metadata !== undefined &&
                    Object.keys(input.Metadata).reduce(function (acc, suffix) {
                        acc["x-amz-meta-" + suffix] = input.Metadata[suffix];
                        return acc;
                    }, {})));
                resolvedPath = "/{Bucket}/{Key+}";
                if (input.Bucket !== undefined) {
                    labelValue = input.Bucket;
                    if (labelValue.length <= 0) {
                        throw new Error("Empty value provided for input HTTP label: Bucket.");
                    }
                    resolvedPath = resolvedPath.replace("{Bucket}", __extendedEncodeURIComponent(labelValue));
                }
                else {
                    throw new Error("No value provided for input HTTP label: Bucket.");
                }
                if (input.Key !== undefined) {
                    labelValue = input.Key;
                    if (labelValue.length <= 0) {
                        throw new Error("Empty value provided for input HTTP label: Key.");
                    }
                    resolvedPath = resolvedPath.replace("{Key+}", labelValue
                        .split("/")
                        .map(function (segment) { return __extendedEncodeURIComponent(segment); })
                        .join("/"));
                }
                else {
                    throw new Error("No value provided for input HTTP label: Key.");
                }
                query = {
                    "x-id": "CopyObject",
                };
                return [4 /*yield*/, context.endpoint()];
            case 1:
                _a = _c.sent(), hostname = _a.hostname, _b = _a.protocol, protocol = _b === void 0 ? "https" : _b, port = _a.port;
                return [2 /*return*/, new __HttpRequest({
                        protocol: protocol,
                        hostname: hostname,
                        port: port,
                        method: "PUT",
                        headers: headers,
                        path: resolvedPath,
                        query: query,
                        body: body,
                    })];
        }
    });
}); };
export var serializeAws_restXmlCreateBucketCommand = function (input, context) { return __awaiter(void 0, void 0, void 0, function () {
    var headers, resolvedPath, labelValue, body, contents, _a, hostname, _b, protocol, port;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                headers = __assign(__assign(__assign(__assign(__assign(__assign(__assign({ "content-type": "application/xml" }, (isSerializableHeaderValue(input.ACL) && { "x-amz-acl": input.ACL })), (isSerializableHeaderValue(input.GrantFullControl) && { "x-amz-grant-full-control": input.GrantFullControl })), (isSerializableHeaderValue(input.GrantRead) && { "x-amz-grant-read": input.GrantRead })), (isSerializableHeaderValue(input.GrantReadACP) && { "x-amz-grant-read-acp": input.GrantReadACP })), (isSerializableHeaderValue(input.GrantWrite) && { "x-amz-grant-write": input.GrantWrite })), (isSerializableHeaderValue(input.GrantWriteACP) && { "x-amz-grant-write-acp": input.GrantWriteACP })), (isSerializableHeaderValue(input.ObjectLockEnabledForBucket) && {
                    "x-amz-bucket-object-lock-enabled": input.ObjectLockEnabledForBucket.toString(),
                }));
                resolvedPath = "/{Bucket}";
                if (input.Bucket !== undefined) {
                    labelValue = input.Bucket;
                    if (labelValue.length <= 0) {
                        throw new Error("Empty value provided for input HTTP label: Bucket.");
                    }
                    resolvedPath = resolvedPath.replace("{Bucket}", __extendedEncodeURIComponent(labelValue));
                }
                else {
                    throw new Error("No value provided for input HTTP label: Bucket.");
                }
                if (input.CreateBucketConfiguration !== undefined) {
                    contents = serializeAws_restXmlCreateBucketConfiguration(input.CreateBucketConfiguration, context);
                    body = '<?xml version="1.0" encoding="UTF-8"?>';
                    contents.addAttribute("xmlns", "http://s3.amazonaws.com/doc/2006-03-01/");
                    body += contents.toString();
                }
                return [4 /*yield*/, context.endpoint()];
            case 1:
                _a = _c.sent(), hostname = _a.hostname, _b = _a.protocol, protocol = _b === void 0 ? "https" : _b, port = _a.port;
                return [2 /*return*/, new __HttpRequest({
                        protocol: protocol,
                        hostname: hostname,
                        port: port,
                        method: "PUT",
                        headers: headers,
                        path: resolvedPath,
                        body: body,
                    })];
        }
    });
}); };
export var serializeAws_restXmlCreateMultipartUploadCommand = function (input, context) { return __awaiter(void 0, void 0, void 0, function () {
    var headers, resolvedPath, labelValue, labelValue, query, body, _a, hostname, _b, protocol, port;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                headers = __assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign({}, (isSerializableHeaderValue(input.ACL) && { "x-amz-acl": input.ACL })), (isSerializableHeaderValue(input.CacheControl) && { "Cache-Control": input.CacheControl })), (isSerializableHeaderValue(input.ContentDisposition) && { "Content-Disposition": input.ContentDisposition })), (isSerializableHeaderValue(input.ContentEncoding) && { "Content-Encoding": input.ContentEncoding })), (isSerializableHeaderValue(input.ContentLanguage) && { "Content-Language": input.ContentLanguage })), (isSerializableHeaderValue(input.ContentType) && { "Content-Type": input.ContentType })), (isSerializableHeaderValue(input.Expires) && { Expires: __dateToUtcString(input.Expires).toString() })), (isSerializableHeaderValue(input.GrantFullControl) && { "x-amz-grant-full-control": input.GrantFullControl })), (isSerializableHeaderValue(input.GrantRead) && { "x-amz-grant-read": input.GrantRead })), (isSerializableHeaderValue(input.GrantReadACP) && { "x-amz-grant-read-acp": input.GrantReadACP })), (isSerializableHeaderValue(input.GrantWriteACP) && { "x-amz-grant-write-acp": input.GrantWriteACP })), (isSerializableHeaderValue(input.ServerSideEncryption) && {
                    "x-amz-server-side-encryption": input.ServerSideEncryption,
                })), (isSerializableHeaderValue(input.StorageClass) && { "x-amz-storage-class": input.StorageClass })), (isSerializableHeaderValue(input.WebsiteRedirectLocation) && {
                    "x-amz-website-redirect-location": input.WebsiteRedirectLocation,
                })), (isSerializableHeaderValue(input.SSECustomerAlgorithm) && {
                    "x-amz-server-side-encryption-customer-algorithm": input.SSECustomerAlgorithm,
                })), (isSerializableHeaderValue(input.SSECustomerKey) && {
                    "x-amz-server-side-encryption-customer-key": input.SSECustomerKey,
                })), (isSerializableHeaderValue(input.SSECustomerKeyMD5) && {
                    "x-amz-server-side-encryption-customer-key-MD5": input.SSECustomerKeyMD5,
                })), (isSerializableHeaderValue(input.SSEKMSKeyId) && {
                    "x-amz-server-side-encryption-aws-kms-key-id": input.SSEKMSKeyId,
                })), (isSerializableHeaderValue(input.SSEKMSEncryptionContext) && {
                    "x-amz-server-side-encryption-context": input.SSEKMSEncryptionContext,
                })), (isSerializableHeaderValue(input.BucketKeyEnabled) && {
                    "x-amz-server-side-encryption-bucket-key-enabled": input.BucketKeyEnabled.toString(),
                })), (isSerializableHeaderValue(input.RequestPayer) && { "x-amz-request-payer": input.RequestPayer })), (isSerializableHeaderValue(input.Tagging) && { "x-amz-tagging": input.Tagging })), (isSerializableHeaderValue(input.ObjectLockMode) && { "x-amz-object-lock-mode": input.ObjectLockMode })), (isSerializableHeaderValue(input.ObjectLockRetainUntilDate) && {
                    "x-amz-object-lock-retain-until-date": (input.ObjectLockRetainUntilDate.toISOString().split(".")[0] + "Z").toString(),
                })), (isSerializableHeaderValue(input.ObjectLockLegalHoldStatus) && {
                    "x-amz-object-lock-legal-hold": input.ObjectLockLegalHoldStatus,
                })), (isSerializableHeaderValue(input.ExpectedBucketOwner) && {
                    "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
                })), (input.Metadata !== undefined &&
                    Object.keys(input.Metadata).reduce(function (acc, suffix) {
                        acc["x-amz-meta-" + suffix] = input.Metadata[suffix];
                        return acc;
                    }, {})));
                resolvedPath = "/{Bucket}/{Key+}";
                if (input.Bucket !== undefined) {
                    labelValue = input.Bucket;
                    if (labelValue.length <= 0) {
                        throw new Error("Empty value provided for input HTTP label: Bucket.");
                    }
                    resolvedPath = resolvedPath.replace("{Bucket}", __extendedEncodeURIComponent(labelValue));
                }
                else {
                    throw new Error("No value provided for input HTTP label: Bucket.");
                }
                if (input.Key !== undefined) {
                    labelValue = input.Key;
                    if (labelValue.length <= 0) {
                        throw new Error("Empty value provided for input HTTP label: Key.");
                    }
                    resolvedPath = resolvedPath.replace("{Key+}", labelValue
                        .split("/")
                        .map(function (segment) { return __extendedEncodeURIComponent(segment); })
                        .join("/"));
                }
                else {
                    throw new Error("No value provided for input HTTP label: Key.");
                }
                query = {
                    uploads: "",
                };
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
                        query: query,
                        body: body,
                    })];
        }
    });
}); };
export var serializeAws_restXmlDeleteBucketCommand = function (input, context) { return __awaiter(void 0, void 0, void 0, function () {
    var headers, resolvedPath, labelValue, body, _a, hostname, _b, protocol, port;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                headers = __assign({}, (isSerializableHeaderValue(input.ExpectedBucketOwner) && {
                    "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
                }));
                resolvedPath = "/{Bucket}";
                if (input.Bucket !== undefined) {
                    labelValue = input.Bucket;
                    if (labelValue.length <= 0) {
                        throw new Error("Empty value provided for input HTTP label: Bucket.");
                    }
                    resolvedPath = resolvedPath.replace("{Bucket}", __extendedEncodeURIComponent(labelValue));
                }
                else {
                    throw new Error("No value provided for input HTTP label: Bucket.");
                }
                return [4 /*yield*/, context.endpoint()];
            case 1:
                _a = _c.sent(), hostname = _a.hostname, _b = _a.protocol, protocol = _b === void 0 ? "https" : _b, port = _a.port;
                return [2 /*return*/, new __HttpRequest({
                        protocol: protocol,
                        hostname: hostname,
                        port: port,
                        method: "DELETE",
                        headers: headers,
                        path: resolvedPath,
                        body: body,
                    })];
        }
    });
}); };
export var serializeAws_restXmlDeleteBucketAnalyticsConfigurationCommand = function (input, context) { return __awaiter(void 0, void 0, void 0, function () {
    var headers, resolvedPath, labelValue, query, body, _a, hostname, _b, protocol, port;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                headers = __assign({}, (isSerializableHeaderValue(input.ExpectedBucketOwner) && {
                    "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
                }));
                resolvedPath = "/{Bucket}";
                if (input.Bucket !== undefined) {
                    labelValue = input.Bucket;
                    if (labelValue.length <= 0) {
                        throw new Error("Empty value provided for input HTTP label: Bucket.");
                    }
                    resolvedPath = resolvedPath.replace("{Bucket}", __extendedEncodeURIComponent(labelValue));
                }
                else {
                    throw new Error("No value provided for input HTTP label: Bucket.");
                }
                query = __assign({ analytics: "" }, (input.Id !== undefined && { id: input.Id }));
                return [4 /*yield*/, context.endpoint()];
            case 1:
                _a = _c.sent(), hostname = _a.hostname, _b = _a.protocol, protocol = _b === void 0 ? "https" : _b, port = _a.port;
                return [2 /*return*/, new __HttpRequest({
                        protocol: protocol,
                        hostname: hostname,
                        port: port,
                        method: "DELETE",
                        headers: headers,
                        path: resolvedPath,
                        query: query,
                        body: body,
                    })];
        }
    });
}); };
export var serializeAws_restXmlDeleteBucketCorsCommand = function (input, context) { return __awaiter(void 0, void 0, void 0, function () {
    var headers, resolvedPath, labelValue, query, body, _a, hostname, _b, protocol, port;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                headers = __assign({}, (isSerializableHeaderValue(input.ExpectedBucketOwner) && {
                    "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
                }));
                resolvedPath = "/{Bucket}";
                if (input.Bucket !== undefined) {
                    labelValue = input.Bucket;
                    if (labelValue.length <= 0) {
                        throw new Error("Empty value provided for input HTTP label: Bucket.");
                    }
                    resolvedPath = resolvedPath.replace("{Bucket}", __extendedEncodeURIComponent(labelValue));
                }
                else {
                    throw new Error("No value provided for input HTTP label: Bucket.");
                }
                query = {
                    cors: "",
                };
                return [4 /*yield*/, context.endpoint()];
            case 1:
                _a = _c.sent(), hostname = _a.hostname, _b = _a.protocol, protocol = _b === void 0 ? "https" : _b, port = _a.port;
                return [2 /*return*/, new __HttpRequest({
                        protocol: protocol,
                        hostname: hostname,
                        port: port,
                        method: "DELETE",
                        headers: headers,
                        path: resolvedPath,
                        query: query,
                        body: body,
                    })];
        }
    });
}); };
export var serializeAws_restXmlDeleteBucketEncryptionCommand = function (input, context) { return __awaiter(void 0, void 0, void 0, function () {
    var headers, resolvedPath, labelValue, query, body, _a, hostname, _b, protocol, port;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                headers = __assign({}, (isSerializableHeaderValue(input.ExpectedBucketOwner) && {
                    "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
                }));
                resolvedPath = "/{Bucket}";
                if (input.Bucket !== undefined) {
                    labelValue = input.Bucket;
                    if (labelValue.length <= 0) {
                        throw new Error("Empty value provided for input HTTP label: Bucket.");
                    }
                    resolvedPath = resolvedPath.replace("{Bucket}", __extendedEncodeURIComponent(labelValue));
                }
                else {
                    throw new Error("No value provided for input HTTP label: Bucket.");
                }
                query = {
                    encryption: "",
                };
                return [4 /*yield*/, context.endpoint()];
            case 1:
                _a = _c.sent(), hostname = _a.hostname, _b = _a.protocol, protocol = _b === void 0 ? "https" : _b, port = _a.port;
                return [2 /*return*/, new __HttpRequest({
                        protocol: protocol,
                        hostname: hostname,
                        port: port,
                        method: "DELETE",
                        headers: headers,
                        path: resolvedPath,
                        query: query,
                        body: body,
                    })];
        }
    });
}); };
export var serializeAws_restXmlDeleteBucketIntelligentTieringConfigurationCommand = function (input, context) { return __awaiter(void 0, void 0, void 0, function () {
    var headers, resolvedPath, labelValue, query, body, _a, hostname, _b, protocol, port;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                headers = {};
                resolvedPath = "/{Bucket}";
                if (input.Bucket !== undefined) {
                    labelValue = input.Bucket;
                    if (labelValue.length <= 0) {
                        throw new Error("Empty value provided for input HTTP label: Bucket.");
                    }
                    resolvedPath = resolvedPath.replace("{Bucket}", __extendedEncodeURIComponent(labelValue));
                }
                else {
                    throw new Error("No value provided for input HTTP label: Bucket.");
                }
                query = __assign({ "intelligent-tiering": "" }, (input.Id !== undefined && { id: input.Id }));
                return [4 /*yield*/, context.endpoint()];
            case 1:
                _a = _c.sent(), hostname = _a.hostname, _b = _a.protocol, protocol = _b === void 0 ? "https" : _b, port = _a.port;
                return [2 /*return*/, new __HttpRequest({
                        protocol: protocol,
                        hostname: hostname,
                        port: port,
                        method: "DELETE",
                        headers: headers,
                        path: resolvedPath,
                        query: query,
                        body: body,
                    })];
        }
    });
}); };
export var serializeAws_restXmlDeleteBucketInventoryConfigurationCommand = function (input, context) { return __awaiter(void 0, void 0, void 0, function () {
    var headers, resolvedPath, labelValue, query, body, _a, hostname, _b, protocol, port;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                headers = __assign({}, (isSerializableHeaderValue(input.ExpectedBucketOwner) && {
                    "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
                }));
                resolvedPath = "/{Bucket}";
                if (input.Bucket !== undefined) {
                    labelValue = input.Bucket;
                    if (labelValue.length <= 0) {
                        throw new Error("Empty value provided for input HTTP label: Bucket.");
                    }
                    resolvedPath = resolvedPath.replace("{Bucket}", __extendedEncodeURIComponent(labelValue));
                }
                else {
                    throw new Error("No value provided for input HTTP label: Bucket.");
                }
                query = __assign({ inventory: "" }, (input.Id !== undefined && { id: input.Id }));
                return [4 /*yield*/, context.endpoint()];
            case 1:
                _a = _c.sent(), hostname = _a.hostname, _b = _a.protocol, protocol = _b === void 0 ? "https" : _b, port = _a.port;
                return [2 /*return*/, new __HttpRequest({
                        protocol: protocol,
                        hostname: hostname,
                        port: port,
                        method: "DELETE",
                        headers: headers,
                        path: resolvedPath,
                        query: query,
                        body: body,
                    })];
        }
    });
}); };
export var serializeAws_restXmlDeleteBucketLifecycleCommand = function (input, context) { return __awaiter(void 0, void 0, void 0, function () {
    var headers, resolvedPath, labelValue, query, body, _a, hostname, _b, protocol, port;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                headers = __assign({}, (isSerializableHeaderValue(input.ExpectedBucketOwner) && {
                    "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
                }));
                resolvedPath = "/{Bucket}";
                if (input.Bucket !== undefined) {
                    labelValue = input.Bucket;
                    if (labelValue.length <= 0) {
                        throw new Error("Empty value provided for input HTTP label: Bucket.");
                    }
                    resolvedPath = resolvedPath.replace("{Bucket}", __extendedEncodeURIComponent(labelValue));
                }
                else {
                    throw new Error("No value provided for input HTTP label: Bucket.");
                }
                query = {
                    lifecycle: "",
                };
                return [4 /*yield*/, context.endpoint()];
            case 1:
                _a = _c.sent(), hostname = _a.hostname, _b = _a.protocol, protocol = _b === void 0 ? "https" : _b, port = _a.port;
                return [2 /*return*/, new __HttpRequest({
                        protocol: protocol,
                        hostname: hostname,
                        port: port,
                        method: "DELETE",
                        headers: headers,
                        path: resolvedPath,
                        query: query,
                        body: body,
                    })];
        }
    });
}); };
export var serializeAws_restXmlDeleteBucketMetricsConfigurationCommand = function (input, context) { return __awaiter(void 0, void 0, void 0, function () {
    var headers, resolvedPath, labelValue, query, body, _a, hostname, _b, protocol, port;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                headers = __assign({}, (isSerializableHeaderValue(input.ExpectedBucketOwner) && {
                    "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
                }));
                resolvedPath = "/{Bucket}";
                if (input.Bucket !== undefined) {
                    labelValue = input.Bucket;
                    if (labelValue.length <= 0) {
                        throw new Error("Empty value provided for input HTTP label: Bucket.");
                    }
                    resolvedPath = resolvedPath.replace("{Bucket}", __extendedEncodeURIComponent(labelValue));
                }
                else {
                    throw new Error("No value provided for input HTTP label: Bucket.");
                }
                query = __assign({ metrics: "" }, (input.Id !== undefined && { id: input.Id }));
                return [4 /*yield*/, context.endpoint()];
            case 1:
                _a = _c.sent(), hostname = _a.hostname, _b = _a.protocol, protocol = _b === void 0 ? "https" : _b, port = _a.port;
                return [2 /*return*/, new __HttpRequest({
                        protocol: protocol,
                        hostname: hostname,
                        port: port,
                        method: "DELETE",
                        headers: headers,
                        path: resolvedPath,
                        query: query,
                        body: body,
                    })];
        }
    });
}); };
export var serializeAws_restXmlDeleteBucketOwnershipControlsCommand = function (input, context) { return __awaiter(void 0, void 0, void 0, function () {
    var headers, resolvedPath, labelValue, query, body, _a, hostname, _b, protocol, port;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                headers = __assign({}, (isSerializableHeaderValue(input.ExpectedBucketOwner) && {
                    "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
                }));
                resolvedPath = "/{Bucket}";
                if (input.Bucket !== undefined) {
                    labelValue = input.Bucket;
                    if (labelValue.length <= 0) {
                        throw new Error("Empty value provided for input HTTP label: Bucket.");
                    }
                    resolvedPath = resolvedPath.replace("{Bucket}", __extendedEncodeURIComponent(labelValue));
                }
                else {
                    throw new Error("No value provided for input HTTP label: Bucket.");
                }
                query = {
                    ownershipControls: "",
                };
                return [4 /*yield*/, context.endpoint()];
            case 1:
                _a = _c.sent(), hostname = _a.hostname, _b = _a.protocol, protocol = _b === void 0 ? "https" : _b, port = _a.port;
                return [2 /*return*/, new __HttpRequest({
                        protocol: protocol,
                        hostname: hostname,
                        port: port,
                        method: "DELETE",
                        headers: headers,
                        path: resolvedPath,
                        query: query,
                        body: body,
                    })];
        }
    });
}); };
export var serializeAws_restXmlDeleteBucketPolicyCommand = function (input, context) { return __awaiter(void 0, void 0, void 0, function () {
    var headers, resolvedPath, labelValue, query, body, _a, hostname, _b, protocol, port;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                headers = __assign({}, (isSerializableHeaderValue(input.ExpectedBucketOwner) && {
                    "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
                }));
                resolvedPath = "/{Bucket}";
                if (input.Bucket !== undefined) {
                    labelValue = input.Bucket;
                    if (labelValue.length <= 0) {
                        throw new Error("Empty value provided for input HTTP label: Bucket.");
                    }
                    resolvedPath = resolvedPath.replace("{Bucket}", __extendedEncodeURIComponent(labelValue));
                }
                else {
                    throw new Error("No value provided for input HTTP label: Bucket.");
                }
                query = {
                    policy: "",
                };
                return [4 /*yield*/, context.endpoint()];
            case 1:
                _a = _c.sent(), hostname = _a.hostname, _b = _a.protocol, protocol = _b === void 0 ? "https" : _b, port = _a.port;
                return [2 /*return*/, new __HttpRequest({
                        protocol: protocol,
                        hostname: hostname,
                        port: port,
                        method: "DELETE",
                        headers: headers,
                        path: resolvedPath,
                        query: query,
                        body: body,
                    })];
        }
    });
}); };
export var serializeAws_restXmlDeleteBucketReplicationCommand = function (input, context) { return __awaiter(void 0, void 0, void 0, function () {
    var headers, resolvedPath, labelValue, query, body, _a, hostname, _b, protocol, port;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                headers = __assign({}, (isSerializableHeaderValue(input.ExpectedBucketOwner) && {
                    "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
                }));
                resolvedPath = "/{Bucket}";
                if (input.Bucket !== undefined) {
                    labelValue = input.Bucket;
                    if (labelValue.length <= 0) {
                        throw new Error("Empty value provided for input HTTP label: Bucket.");
                    }
                    resolvedPath = resolvedPath.replace("{Bucket}", __extendedEncodeURIComponent(labelValue));
                }
                else {
                    throw new Error("No value provided for input HTTP label: Bucket.");
                }
                query = {
                    replication: "",
                };
                return [4 /*yield*/, context.endpoint()];
            case 1:
                _a = _c.sent(), hostname = _a.hostname, _b = _a.protocol, protocol = _b === void 0 ? "https" : _b, port = _a.port;
                return [2 /*return*/, new __HttpRequest({
                        protocol: protocol,
                        hostname: hostname,
                        port: port,
                        method: "DELETE",
                        headers: headers,
                        path: resolvedPath,
                        query: query,
                        body: body,
                    })];
        }
    });
}); };
export var serializeAws_restXmlDeleteBucketTaggingCommand = function (input, context) { return __awaiter(void 0, void 0, void 0, function () {
    var headers, resolvedPath, labelValue, query, body, _a, hostname, _b, protocol, port;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                headers = __assign({}, (isSerializableHeaderValue(input.ExpectedBucketOwner) && {
                    "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
                }));
                resolvedPath = "/{Bucket}";
                if (input.Bucket !== undefined) {
                    labelValue = input.Bucket;
                    if (labelValue.length <= 0) {
                        throw new Error("Empty value provided for input HTTP label: Bucket.");
                    }
                    resolvedPath = resolvedPath.replace("{Bucket}", __extendedEncodeURIComponent(labelValue));
                }
                else {
                    throw new Error("No value provided for input HTTP label: Bucket.");
                }
                query = {
                    tagging: "",
                };
                return [4 /*yield*/, context.endpoint()];
            case 1:
                _a = _c.sent(), hostname = _a.hostname, _b = _a.protocol, protocol = _b === void 0 ? "https" : _b, port = _a.port;
                return [2 /*return*/, new __HttpRequest({
                        protocol: protocol,
                        hostname: hostname,
                        port: port,
                        method: "DELETE",
                        headers: headers,
                        path: resolvedPath,
                        query: query,
                        body: body,
                    })];
        }
    });
}); };
export var serializeAws_restXmlDeleteBucketWebsiteCommand = function (input, context) { return __awaiter(void 0, void 0, void 0, function () {
    var headers, resolvedPath, labelValue, query, body, _a, hostname, _b, protocol, port;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                headers = __assign({}, (isSerializableHeaderValue(input.ExpectedBucketOwner) && {
                    "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
                }));
                resolvedPath = "/{Bucket}";
                if (input.Bucket !== undefined) {
                    labelValue = input.Bucket;
                    if (labelValue.length <= 0) {
                        throw new Error("Empty value provided for input HTTP label: Bucket.");
                    }
                    resolvedPath = resolvedPath.replace("{Bucket}", __extendedEncodeURIComponent(labelValue));
                }
                else {
                    throw new Error("No value provided for input HTTP label: Bucket.");
                }
                query = {
                    website: "",
                };
                return [4 /*yield*/, context.endpoint()];
            case 1:
                _a = _c.sent(), hostname = _a.hostname, _b = _a.protocol, protocol = _b === void 0 ? "https" : _b, port = _a.port;
                return [2 /*return*/, new __HttpRequest({
                        protocol: protocol,
                        hostname: hostname,
                        port: port,
                        method: "DELETE",
                        headers: headers,
                        path: resolvedPath,
                        query: query,
                        body: body,
                    })];
        }
    });
}); };
export var serializeAws_restXmlDeleteObjectCommand = function (input, context) { return __awaiter(void 0, void 0, void 0, function () {
    var headers, resolvedPath, labelValue, labelValue, query, body, _a, hostname, _b, protocol, port;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                headers = __assign(__assign(__assign(__assign({}, (isSerializableHeaderValue(input.MFA) && { "x-amz-mfa": input.MFA })), (isSerializableHeaderValue(input.RequestPayer) && { "x-amz-request-payer": input.RequestPayer })), (isSerializableHeaderValue(input.BypassGovernanceRetention) && {
                    "x-amz-bypass-governance-retention": input.BypassGovernanceRetention.toString(),
                })), (isSerializableHeaderValue(input.ExpectedBucketOwner) && {
                    "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
                }));
                resolvedPath = "/{Bucket}/{Key+}";
                if (input.Bucket !== undefined) {
                    labelValue = input.Bucket;
                    if (labelValue.length <= 0) {
                        throw new Error("Empty value provided for input HTTP label: Bucket.");
                    }
                    resolvedPath = resolvedPath.replace("{Bucket}", __extendedEncodeURIComponent(labelValue));
                }
                else {
                    throw new Error("No value provided for input HTTP label: Bucket.");
                }
                if (input.Key !== undefined) {
                    labelValue = input.Key;
                    if (labelValue.length <= 0) {
                        throw new Error("Empty value provided for input HTTP label: Key.");
                    }
                    resolvedPath = resolvedPath.replace("{Key+}", labelValue
                        .split("/")
                        .map(function (segment) { return __extendedEncodeURIComponent(segment); })
                        .join("/"));
                }
                else {
                    throw new Error("No value provided for input HTTP label: Key.");
                }
                query = __assign({ "x-id": "DeleteObject" }, (input.VersionId !== undefined && { versionId: input.VersionId }));
                return [4 /*yield*/, context.endpoint()];
            case 1:
                _a = _c.sent(), hostname = _a.hostname, _b = _a.protocol, protocol = _b === void 0 ? "https" : _b, port = _a.port;
                return [2 /*return*/, new __HttpRequest({
                        protocol: protocol,
                        hostname: hostname,
                        port: port,
                        method: "DELETE",
                        headers: headers,
                        path: resolvedPath,
                        query: query,
                        body: body,
                    })];
        }
    });
}); };
export var serializeAws_restXmlDeleteObjectsCommand = function (input, context) { return __awaiter(void 0, void 0, void 0, function () {
    var headers, resolvedPath, labelValue, query, body, contents, _a, hostname, _b, protocol, port;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                headers = __assign(__assign(__assign(__assign({ "content-type": "application/xml" }, (isSerializableHeaderValue(input.MFA) && { "x-amz-mfa": input.MFA })), (isSerializableHeaderValue(input.RequestPayer) && { "x-amz-request-payer": input.RequestPayer })), (isSerializableHeaderValue(input.BypassGovernanceRetention) && {
                    "x-amz-bypass-governance-retention": input.BypassGovernanceRetention.toString(),
                })), (isSerializableHeaderValue(input.ExpectedBucketOwner) && {
                    "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
                }));
                resolvedPath = "/{Bucket}";
                if (input.Bucket !== undefined) {
                    labelValue = input.Bucket;
                    if (labelValue.length <= 0) {
                        throw new Error("Empty value provided for input HTTP label: Bucket.");
                    }
                    resolvedPath = resolvedPath.replace("{Bucket}", __extendedEncodeURIComponent(labelValue));
                }
                else {
                    throw new Error("No value provided for input HTTP label: Bucket.");
                }
                query = {
                    delete: "",
                };
                if (input.Delete !== undefined) {
                    contents = serializeAws_restXmlDelete(input.Delete, context);
                    body = '<?xml version="1.0" encoding="UTF-8"?>';
                    contents.addAttribute("xmlns", "http://s3.amazonaws.com/doc/2006-03-01/");
                    body += contents.toString();
                }
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
                        query: query,
                        body: body,
                    })];
        }
    });
}); };
export var serializeAws_restXmlDeleteObjectTaggingCommand = function (input, context) { return __awaiter(void 0, void 0, void 0, function () {
    var headers, resolvedPath, labelValue, labelValue, query, body, _a, hostname, _b, protocol, port;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                headers = __assign({}, (isSerializableHeaderValue(input.ExpectedBucketOwner) && {
                    "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
                }));
                resolvedPath = "/{Bucket}/{Key+}";
                if (input.Bucket !== undefined) {
                    labelValue = input.Bucket;
                    if (labelValue.length <= 0) {
                        throw new Error("Empty value provided for input HTTP label: Bucket.");
                    }
                    resolvedPath = resolvedPath.replace("{Bucket}", __extendedEncodeURIComponent(labelValue));
                }
                else {
                    throw new Error("No value provided for input HTTP label: Bucket.");
                }
                if (input.Key !== undefined) {
                    labelValue = input.Key;
                    if (labelValue.length <= 0) {
                        throw new Error("Empty value provided for input HTTP label: Key.");
                    }
                    resolvedPath = resolvedPath.replace("{Key+}", labelValue
                        .split("/")
                        .map(function (segment) { return __extendedEncodeURIComponent(segment); })
                        .join("/"));
                }
                else {
                    throw new Error("No value provided for input HTTP label: Key.");
                }
                query = __assign({ tagging: "" }, (input.VersionId !== undefined && { versionId: input.VersionId }));
                return [4 /*yield*/, context.endpoint()];
            case 1:
                _a = _c.sent(), hostname = _a.hostname, _b = _a.protocol, protocol = _b === void 0 ? "https" : _b, port = _a.port;
                return [2 /*return*/, new __HttpRequest({
                        protocol: protocol,
                        hostname: hostname,
                        port: port,
                        method: "DELETE",
                        headers: headers,
                        path: resolvedPath,
                        query: query,
                        body: body,
                    })];
        }
    });
}); };
export var serializeAws_restXmlDeletePublicAccessBlockCommand = function (input, context) { return __awaiter(void 0, void 0, void 0, function () {
    var headers, resolvedPath, labelValue, query, body, _a, hostname, _b, protocol, port;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                headers = __assign({}, (isSerializableHeaderValue(input.ExpectedBucketOwner) && {
                    "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
                }));
                resolvedPath = "/{Bucket}";
                if (input.Bucket !== undefined) {
                    labelValue = input.Bucket;
                    if (labelValue.length <= 0) {
                        throw new Error("Empty value provided for input HTTP label: Bucket.");
                    }
                    resolvedPath = resolvedPath.replace("{Bucket}", __extendedEncodeURIComponent(labelValue));
                }
                else {
                    throw new Error("No value provided for input HTTP label: Bucket.");
                }
                query = {
                    publicAccessBlock: "",
                };
                return [4 /*yield*/, context.endpoint()];
            case 1:
                _a = _c.sent(), hostname = _a.hostname, _b = _a.protocol, protocol = _b === void 0 ? "https" : _b, port = _a.port;
                return [2 /*return*/, new __HttpRequest({
                        protocol: protocol,
                        hostname: hostname,
                        port: port,
                        method: "DELETE",
                        headers: headers,
                        path: resolvedPath,
                        query: query,
                        body: body,
                    })];
        }
    });
}); };
export var serializeAws_restXmlGetBucketAccelerateConfigurationCommand = function (input, context) { return __awaiter(void 0, void 0, void 0, function () {
    var headers, resolvedPath, labelValue, query, body, _a, hostname, _b, protocol, port;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                headers = __assign({}, (isSerializableHeaderValue(input.ExpectedBucketOwner) && {
                    "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
                }));
                resolvedPath = "/{Bucket}";
                if (input.Bucket !== undefined) {
                    labelValue = input.Bucket;
                    if (labelValue.length <= 0) {
                        throw new Error("Empty value provided for input HTTP label: Bucket.");
                    }
                    resolvedPath = resolvedPath.replace("{Bucket}", __extendedEncodeURIComponent(labelValue));
                }
                else {
                    throw new Error("No value provided for input HTTP label: Bucket.");
                }
                query = {
                    accelerate: "",
                };
                return [4 /*yield*/, context.endpoint()];
            case 1:
                _a = _c.sent(), hostname = _a.hostname, _b = _a.protocol, protocol = _b === void 0 ? "https" : _b, port = _a.port;
                return [2 /*return*/, new __HttpRequest({
                        protocol: protocol,
                        hostname: hostname,
                        port: port,
                        method: "GET",
                        headers: headers,
                        path: resolvedPath,
                        query: query,
                        body: body,
                    })];
        }
    });
}); };
export var serializeAws_restXmlGetBucketAclCommand = function (input, context) { return __awaiter(void 0, void 0, void 0, function () {
    var headers, resolvedPath, labelValue, query, body, _a, hostname, _b, protocol, port;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                headers = __assign({}, (isSerializableHeaderValue(input.ExpectedBucketOwner) && {
                    "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
                }));
                resolvedPath = "/{Bucket}";
                if (input.Bucket !== undefined) {
                    labelValue = input.Bucket;
                    if (labelValue.length <= 0) {
                        throw new Error("Empty value provided for input HTTP label: Bucket.");
                    }
                    resolvedPath = resolvedPath.replace("{Bucket}", __extendedEncodeURIComponent(labelValue));
                }
                else {
                    throw new Error("No value provided for input HTTP label: Bucket.");
                }
                query = {
                    acl: "",
                };
                return [4 /*yield*/, context.endpoint()];
            case 1:
                _a = _c.sent(), hostname = _a.hostname, _b = _a.protocol, protocol = _b === void 0 ? "https" : _b, port = _a.port;
                return [2 /*return*/, new __HttpRequest({
                        protocol: protocol,
                        hostname: hostname,
                        port: port,
                        method: "GET",
                        headers: headers,
                        path: resolvedPath,
                        query: query,
                        body: body,
                    })];
        }
    });
}); };
export var serializeAws_restXmlGetBucketAnalyticsConfigurationCommand = function (input, context) { return __awaiter(void 0, void 0, void 0, function () {
    var headers, resolvedPath, labelValue, query, body, _a, hostname, _b, protocol, port;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                headers = __assign({}, (isSerializableHeaderValue(input.ExpectedBucketOwner) && {
                    "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
                }));
                resolvedPath = "/{Bucket}";
                if (input.Bucket !== undefined) {
                    labelValue = input.Bucket;
                    if (labelValue.length <= 0) {
                        throw new Error("Empty value provided for input HTTP label: Bucket.");
                    }
                    resolvedPath = resolvedPath.replace("{Bucket}", __extendedEncodeURIComponent(labelValue));
                }
                else {
                    throw new Error("No value provided for input HTTP label: Bucket.");
                }
                query = __assign({ analytics: "", "x-id": "GetBucketAnalyticsConfiguration" }, (input.Id !== undefined && { id: input.Id }));
                return [4 /*yield*/, context.endpoint()];
            case 1:
                _a = _c.sent(), hostname = _a.hostname, _b = _a.protocol, protocol = _b === void 0 ? "https" : _b, port = _a.port;
                return [2 /*return*/, new __HttpRequest({
                        protocol: protocol,
                        hostname: hostname,
                        port: port,
                        method: "GET",
                        headers: headers,
                        path: resolvedPath,
                        query: query,
                        body: body,
                    })];
        }
    });
}); };
export var serializeAws_restXmlGetBucketCorsCommand = function (input, context) { return __awaiter(void 0, void 0, void 0, function () {
    var headers, resolvedPath, labelValue, query, body, _a, hostname, _b, protocol, port;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                headers = __assign({}, (isSerializableHeaderValue(input.ExpectedBucketOwner) && {
                    "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
                }));
                resolvedPath = "/{Bucket}";
                if (input.Bucket !== undefined) {
                    labelValue = input.Bucket;
                    if (labelValue.length <= 0) {
                        throw new Error("Empty value provided for input HTTP label: Bucket.");
                    }
                    resolvedPath = resolvedPath.replace("{Bucket}", __extendedEncodeURIComponent(labelValue));
                }
                else {
                    throw new Error("No value provided for input HTTP label: Bucket.");
                }
                query = {
                    cors: "",
                };
                return [4 /*yield*/, context.endpoint()];
            case 1:
                _a = _c.sent(), hostname = _a.hostname, _b = _a.protocol, protocol = _b === void 0 ? "https" : _b, port = _a.port;
                return [2 /*return*/, new __HttpRequest({
                        protocol: protocol,
                        hostname: hostname,
                        port: port,
                        method: "GET",
                        headers: headers,
                        path: resolvedPath,
                        query: query,
                        body: body,
                    })];
        }
    });
}); };
export var serializeAws_restXmlGetBucketEncryptionCommand = function (input, context) { return __awaiter(void 0, void 0, void 0, function () {
    var headers, resolvedPath, labelValue, query, body, _a, hostname, _b, protocol, port;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                headers = __assign({}, (isSerializableHeaderValue(input.ExpectedBucketOwner) && {
                    "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
                }));
                resolvedPath = "/{Bucket}";
                if (input.Bucket !== undefined) {
                    labelValue = input.Bucket;
                    if (labelValue.length <= 0) {
                        throw new Error("Empty value provided for input HTTP label: Bucket.");
                    }
                    resolvedPath = resolvedPath.replace("{Bucket}", __extendedEncodeURIComponent(labelValue));
                }
                else {
                    throw new Error("No value provided for input HTTP label: Bucket.");
                }
                query = {
                    encryption: "",
                };
                return [4 /*yield*/, context.endpoint()];
            case 1:
                _a = _c.sent(), hostname = _a.hostname, _b = _a.protocol, protocol = _b === void 0 ? "https" : _b, port = _a.port;
                return [2 /*return*/, new __HttpRequest({
                        protocol: protocol,
                        hostname: hostname,
                        port: port,
                        method: "GET",
                        headers: headers,
                        path: resolvedPath,
                        query: query,
                        body: body,
                    })];
        }
    });
}); };
export var serializeAws_restXmlGetBucketIntelligentTieringConfigurationCommand = function (input, context) { return __awaiter(void 0, void 0, void 0, function () {
    var headers, resolvedPath, labelValue, query, body, _a, hostname, _b, protocol, port;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                headers = {};
                resolvedPath = "/{Bucket}";
                if (input.Bucket !== undefined) {
                    labelValue = input.Bucket;
                    if (labelValue.length <= 0) {
                        throw new Error("Empty value provided for input HTTP label: Bucket.");
                    }
                    resolvedPath = resolvedPath.replace("{Bucket}", __extendedEncodeURIComponent(labelValue));
                }
                else {
                    throw new Error("No value provided for input HTTP label: Bucket.");
                }
                query = __assign({ "intelligent-tiering": "", "x-id": "GetBucketIntelligentTieringConfiguration" }, (input.Id !== undefined && { id: input.Id }));
                return [4 /*yield*/, context.endpoint()];
            case 1:
                _a = _c.sent(), hostname = _a.hostname, _b = _a.protocol, protocol = _b === void 0 ? "https" : _b, port = _a.port;
                return [2 /*return*/, new __HttpRequest({
                        protocol: protocol,
                        hostname: hostname,
                        port: port,
                        method: "GET",
                        headers: headers,
                        path: resolvedPath,
                        query: query,
                        body: body,
                    })];
        }
    });
}); };
export var serializeAws_restXmlGetBucketInventoryConfigurationCommand = function (input, context) { return __awaiter(void 0, void 0, void 0, function () {
    var headers, resolvedPath, labelValue, query, body, _a, hostname, _b, protocol, port;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                headers = __assign({}, (isSerializableHeaderValue(input.ExpectedBucketOwner) && {
                    "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
                }));
                resolvedPath = "/{Bucket}";
                if (input.Bucket !== undefined) {
                    labelValue = input.Bucket;
                    if (labelValue.length <= 0) {
                        throw new Error("Empty value provided for input HTTP label: Bucket.");
                    }
                    resolvedPath = resolvedPath.replace("{Bucket}", __extendedEncodeURIComponent(labelValue));
                }
                else {
                    throw new Error("No value provided for input HTTP label: Bucket.");
                }
                query = __assign({ inventory: "", "x-id": "GetBucketInventoryConfiguration" }, (input.Id !== undefined && { id: input.Id }));
                return [4 /*yield*/, context.endpoint()];
            case 1:
                _a = _c.sent(), hostname = _a.hostname, _b = _a.protocol, protocol = _b === void 0 ? "https" : _b, port = _a.port;
                return [2 /*return*/, new __HttpRequest({
                        protocol: protocol,
                        hostname: hostname,
                        port: port,
                        method: "GET",
                        headers: headers,
                        path: resolvedPath,
                        query: query,
                        body: body,
                    })];
        }
    });
}); };
export var serializeAws_restXmlGetBucketLifecycleConfigurationCommand = function (input, context) { return __awaiter(void 0, void 0, void 0, function () {
    var headers, resolvedPath, labelValue, query, body, _a, hostname, _b, protocol, port;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                headers = __assign({}, (isSerializableHeaderValue(input.ExpectedBucketOwner) && {
                    "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
                }));
                resolvedPath = "/{Bucket}";
                if (input.Bucket !== undefined) {
                    labelValue = input.Bucket;
                    if (labelValue.length <= 0) {
                        throw new Error("Empty value provided for input HTTP label: Bucket.");
                    }
                    resolvedPath = resolvedPath.replace("{Bucket}", __extendedEncodeURIComponent(labelValue));
                }
                else {
                    throw new Error("No value provided for input HTTP label: Bucket.");
                }
                query = {
                    lifecycle: "",
                };
                return [4 /*yield*/, context.endpoint()];
            case 1:
                _a = _c.sent(), hostname = _a.hostname, _b = _a.protocol, protocol = _b === void 0 ? "https" : _b, port = _a.port;
                return [2 /*return*/, new __HttpRequest({
                        protocol: protocol,
                        hostname: hostname,
                        port: port,
                        method: "GET",
                        headers: headers,
                        path: resolvedPath,
                        query: query,
                        body: body,
                    })];
        }
    });
}); };
export var serializeAws_restXmlGetBucketLocationCommand = function (input, context) { return __awaiter(void 0, void 0, void 0, function () {
    var headers, resolvedPath, labelValue, query, body, _a, hostname, _b, protocol, port;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                headers = __assign({}, (isSerializableHeaderValue(input.ExpectedBucketOwner) && {
                    "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
                }));
                resolvedPath = "/{Bucket}";
                if (input.Bucket !== undefined) {
                    labelValue = input.Bucket;
                    if (labelValue.length <= 0) {
                        throw new Error("Empty value provided for input HTTP label: Bucket.");
                    }
                    resolvedPath = resolvedPath.replace("{Bucket}", __extendedEncodeURIComponent(labelValue));
                }
                else {
                    throw new Error("No value provided for input HTTP label: Bucket.");
                }
                query = {
                    location: "",
                };
                return [4 /*yield*/, context.endpoint()];
            case 1:
                _a = _c.sent(), hostname = _a.hostname, _b = _a.protocol, protocol = _b === void 0 ? "https" : _b, port = _a.port;
                return [2 /*return*/, new __HttpRequest({
                        protocol: protocol,
                        hostname: hostname,
                        port: port,
                        method: "GET",
                        headers: headers,
                        path: resolvedPath,
                        query: query,
                        body: body,
                    })];
        }
    });
}); };
export var serializeAws_restXmlGetBucketLoggingCommand = function (input, context) { return __awaiter(void 0, void 0, void 0, function () {
    var headers, resolvedPath, labelValue, query, body, _a, hostname, _b, protocol, port;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                headers = __assign({}, (isSerializableHeaderValue(input.ExpectedBucketOwner) && {
                    "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
                }));
                resolvedPath = "/{Bucket}";
                if (input.Bucket !== undefined) {
                    labelValue = input.Bucket;
                    if (labelValue.length <= 0) {
                        throw new Error("Empty value provided for input HTTP label: Bucket.");
                    }
                    resolvedPath = resolvedPath.replace("{Bucket}", __extendedEncodeURIComponent(labelValue));
                }
                else {
                    throw new Error("No value provided for input HTTP label: Bucket.");
                }
                query = {
                    logging: "",
                };
                return [4 /*yield*/, context.endpoint()];
            case 1:
                _a = _c.sent(), hostname = _a.hostname, _b = _a.protocol, protocol = _b === void 0 ? "https" : _b, port = _a.port;
                return [2 /*return*/, new __HttpRequest({
                        protocol: protocol,
                        hostname: hostname,
                        port: port,
                        method: "GET",
                        headers: headers,
                        path: resolvedPath,
                        query: query,
                        body: body,
                    })];
        }
    });
}); };
export var serializeAws_restXmlGetBucketMetricsConfigurationCommand = function (input, context) { return __awaiter(void 0, void 0, void 0, function () {
    var headers, resolvedPath, labelValue, query, body, _a, hostname, _b, protocol, port;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                headers = __assign({}, (isSerializableHeaderValue(input.ExpectedBucketOwner) && {
                    "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
                }));
                resolvedPath = "/{Bucket}";
                if (input.Bucket !== undefined) {
                    labelValue = input.Bucket;
                    if (labelValue.length <= 0) {
                        throw new Error("Empty value provided for input HTTP label: Bucket.");
                    }
                    resolvedPath = resolvedPath.replace("{Bucket}", __extendedEncodeURIComponent(labelValue));
                }
                else {
                    throw new Error("No value provided for input HTTP label: Bucket.");
                }
                query = __assign({ metrics: "", "x-id": "GetBucketMetricsConfiguration" }, (input.Id !== undefined && { id: input.Id }));
                return [4 /*yield*/, context.endpoint()];
            case 1:
                _a = _c.sent(), hostname = _a.hostname, _b = _a.protocol, protocol = _b === void 0 ? "https" : _b, port = _a.port;
                return [2 /*return*/, new __HttpRequest({
                        protocol: protocol,
                        hostname: hostname,
                        port: port,
                        method: "GET",
                        headers: headers,
                        path: resolvedPath,
                        query: query,
                        body: body,
                    })];
        }
    });
}); };
export var serializeAws_restXmlGetBucketNotificationConfigurationCommand = function (input, context) { return __awaiter(void 0, void 0, void 0, function () {
    var headers, resolvedPath, labelValue, query, body, _a, hostname, _b, protocol, port;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                headers = __assign({}, (isSerializableHeaderValue(input.ExpectedBucketOwner) && {
                    "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
                }));
                resolvedPath = "/{Bucket}";
                if (input.Bucket !== undefined) {
                    labelValue = input.Bucket;
                    if (labelValue.length <= 0) {
                        throw new Error("Empty value provided for input HTTP label: Bucket.");
                    }
                    resolvedPath = resolvedPath.replace("{Bucket}", __extendedEncodeURIComponent(labelValue));
                }
                else {
                    throw new Error("No value provided for input HTTP label: Bucket.");
                }
                query = {
                    notification: "",
                };
                return [4 /*yield*/, context.endpoint()];
            case 1:
                _a = _c.sent(), hostname = _a.hostname, _b = _a.protocol, protocol = _b === void 0 ? "https" : _b, port = _a.port;
                return [2 /*return*/, new __HttpRequest({
                        protocol: protocol,
                        hostname: hostname,
                        port: port,
                        method: "GET",
                        headers: headers,
                        path: resolvedPath,
                        query: query,
                        body: body,
                    })];
        }
    });
}); };
export var serializeAws_restXmlGetBucketOwnershipControlsCommand = function (input, context) { return __awaiter(void 0, void 0, void 0, function () {
    var headers, resolvedPath, labelValue, query, body, _a, hostname, _b, protocol, port;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                headers = __assign({}, (isSerializableHeaderValue(input.ExpectedBucketOwner) && {
                    "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
                }));
                resolvedPath = "/{Bucket}";
                if (input.Bucket !== undefined) {
                    labelValue = input.Bucket;
                    if (labelValue.length <= 0) {
                        throw new Error("Empty value provided for input HTTP label: Bucket.");
                    }
                    resolvedPath = resolvedPath.replace("{Bucket}", __extendedEncodeURIComponent(labelValue));
                }
                else {
                    throw new Error("No value provided for input HTTP label: Bucket.");
                }
                query = {
                    ownershipControls: "",
                };
                return [4 /*yield*/, context.endpoint()];
            case 1:
                _a = _c.sent(), hostname = _a.hostname, _b = _a.protocol, protocol = _b === void 0 ? "https" : _b, port = _a.port;
                return [2 /*return*/, new __HttpRequest({
                        protocol: protocol,
                        hostname: hostname,
                        port: port,
                        method: "GET",
                        headers: headers,
                        path: resolvedPath,
                        query: query,
                        body: body,
                    })];
        }
    });
}); };
export var serializeAws_restXmlGetBucketPolicyCommand = function (input, context) { return __awaiter(void 0, void 0, void 0, function () {
    var headers, resolvedPath, labelValue, query, body, _a, hostname, _b, protocol, port;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                headers = __assign({}, (isSerializableHeaderValue(input.ExpectedBucketOwner) && {
                    "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
                }));
                resolvedPath = "/{Bucket}";
                if (input.Bucket !== undefined) {
                    labelValue = input.Bucket;
                    if (labelValue.length <= 0) {
                        throw new Error("Empty value provided for input HTTP label: Bucket.");
                    }
                    resolvedPath = resolvedPath.replace("{Bucket}", __extendedEncodeURIComponent(labelValue));
                }
                else {
                    throw new Error("No value provided for input HTTP label: Bucket.");
                }
                query = {
                    policy: "",
                };
                return [4 /*yield*/, context.endpoint()];
            case 1:
                _a = _c.sent(), hostname = _a.hostname, _b = _a.protocol, protocol = _b === void 0 ? "https" : _b, port = _a.port;
                return [2 /*return*/, new __HttpRequest({
                        protocol: protocol,
                        hostname: hostname,
                        port: port,
                        method: "GET",
                        headers: headers,
                        path: resolvedPath,
                        query: query,
                        body: body,
                    })];
        }
    });
}); };
export var serializeAws_restXmlGetBucketPolicyStatusCommand = function (input, context) { return __awaiter(void 0, void 0, void 0, function () {
    var headers, resolvedPath, labelValue, query, body, _a, hostname, _b, protocol, port;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                headers = __assign({}, (isSerializableHeaderValue(input.ExpectedBucketOwner) && {
                    "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
                }));
                resolvedPath = "/{Bucket}";
                if (input.Bucket !== undefined) {
                    labelValue = input.Bucket;
                    if (labelValue.length <= 0) {
                        throw new Error("Empty value provided for input HTTP label: Bucket.");
                    }
                    resolvedPath = resolvedPath.replace("{Bucket}", __extendedEncodeURIComponent(labelValue));
                }
                else {
                    throw new Error("No value provided for input HTTP label: Bucket.");
                }
                query = {
                    policyStatus: "",
                };
                return [4 /*yield*/, context.endpoint()];
            case 1:
                _a = _c.sent(), hostname = _a.hostname, _b = _a.protocol, protocol = _b === void 0 ? "https" : _b, port = _a.port;
                return [2 /*return*/, new __HttpRequest({
                        protocol: protocol,
                        hostname: hostname,
                        port: port,
                        method: "GET",
                        headers: headers,
                        path: resolvedPath,
                        query: query,
                        body: body,
                    })];
        }
    });
}); };
export var serializeAws_restXmlGetBucketReplicationCommand = function (input, context) { return __awaiter(void 0, void 0, void 0, function () {
    var headers, resolvedPath, labelValue, query, body, _a, hostname, _b, protocol, port;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                headers = __assign({}, (isSerializableHeaderValue(input.ExpectedBucketOwner) && {
                    "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
                }));
                resolvedPath = "/{Bucket}";
                if (input.Bucket !== undefined) {
                    labelValue = input.Bucket;
                    if (labelValue.length <= 0) {
                        throw new Error("Empty value provided for input HTTP label: Bucket.");
                    }
                    resolvedPath = resolvedPath.replace("{Bucket}", __extendedEncodeURIComponent(labelValue));
                }
                else {
                    throw new Error("No value provided for input HTTP label: Bucket.");
                }
                query = {
                    replication: "",
                };
                return [4 /*yield*/, context.endpoint()];
            case 1:
                _a = _c.sent(), hostname = _a.hostname, _b = _a.protocol, protocol = _b === void 0 ? "https" : _b, port = _a.port;
                return [2 /*return*/, new __HttpRequest({
                        protocol: protocol,
                        hostname: hostname,
                        port: port,
                        method: "GET",
                        headers: headers,
                        path: resolvedPath,
                        query: query,
                        body: body,
                    })];
        }
    });
}); };
export var serializeAws_restXmlGetBucketRequestPaymentCommand = function (input, context) { return __awaiter(void 0, void 0, void 0, function () {
    var headers, resolvedPath, labelValue, query, body, _a, hostname, _b, protocol, port;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                headers = __assign({}, (isSerializableHeaderValue(input.ExpectedBucketOwner) && {
                    "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
                }));
                resolvedPath = "/{Bucket}";
                if (input.Bucket !== undefined) {
                    labelValue = input.Bucket;
                    if (labelValue.length <= 0) {
                        throw new Error("Empty value provided for input HTTP label: Bucket.");
                    }
                    resolvedPath = resolvedPath.replace("{Bucket}", __extendedEncodeURIComponent(labelValue));
                }
                else {
                    throw new Error("No value provided for input HTTP label: Bucket.");
                }
                query = {
                    requestPayment: "",
                };
                return [4 /*yield*/, context.endpoint()];
            case 1:
                _a = _c.sent(), hostname = _a.hostname, _b = _a.protocol, protocol = _b === void 0 ? "https" : _b, port = _a.port;
                return [2 /*return*/, new __HttpRequest({
                        protocol: protocol,
                        hostname: hostname,
                        port: port,
                        method: "GET",
                        headers: headers,
                        path: resolvedPath,
                        query: query,
                        body: body,
                    })];
        }
    });
}); };
export var serializeAws_restXmlGetBucketTaggingCommand = function (input, context) { return __awaiter(void 0, void 0, void 0, function () {
    var headers, resolvedPath, labelValue, query, body, _a, hostname, _b, protocol, port;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                headers = __assign({}, (isSerializableHeaderValue(input.ExpectedBucketOwner) && {
                    "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
                }));
                resolvedPath = "/{Bucket}";
                if (input.Bucket !== undefined) {
                    labelValue = input.Bucket;
                    if (labelValue.length <= 0) {
                        throw new Error("Empty value provided for input HTTP label: Bucket.");
                    }
                    resolvedPath = resolvedPath.replace("{Bucket}", __extendedEncodeURIComponent(labelValue));
                }
                else {
                    throw new Error("No value provided for input HTTP label: Bucket.");
                }
                query = {
                    tagging: "",
                };
                return [4 /*yield*/, context.endpoint()];
            case 1:
                _a = _c.sent(), hostname = _a.hostname, _b = _a.protocol, protocol = _b === void 0 ? "https" : _b, port = _a.port;
                return [2 /*return*/, new __HttpRequest({
                        protocol: protocol,
                        hostname: hostname,
                        port: port,
                        method: "GET",
                        headers: headers,
                        path: resolvedPath,
                        query: query,
                        body: body,
                    })];
        }
    });
}); };
export var serializeAws_restXmlGetBucketVersioningCommand = function (input, context) { return __awaiter(void 0, void 0, void 0, function () {
    var headers, resolvedPath, labelValue, query, body, _a, hostname, _b, protocol, port;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                headers = __assign({}, (isSerializableHeaderValue(input.ExpectedBucketOwner) && {
                    "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
                }));
                resolvedPath = "/{Bucket}";
                if (input.Bucket !== undefined) {
                    labelValue = input.Bucket;
                    if (labelValue.length <= 0) {
                        throw new Error("Empty value provided for input HTTP label: Bucket.");
                    }
                    resolvedPath = resolvedPath.replace("{Bucket}", __extendedEncodeURIComponent(labelValue));
                }
                else {
                    throw new Error("No value provided for input HTTP label: Bucket.");
                }
                query = {
                    versioning: "",
                };
                return [4 /*yield*/, context.endpoint()];
            case 1:
                _a = _c.sent(), hostname = _a.hostname, _b = _a.protocol, protocol = _b === void 0 ? "https" : _b, port = _a.port;
                return [2 /*return*/, new __HttpRequest({
                        protocol: protocol,
                        hostname: hostname,
                        port: port,
                        method: "GET",
                        headers: headers,
                        path: resolvedPath,
                        query: query,
                        body: body,
                    })];
        }
    });
}); };
export var serializeAws_restXmlGetBucketWebsiteCommand = function (input, context) { return __awaiter(void 0, void 0, void 0, function () {
    var headers, resolvedPath, labelValue, query, body, _a, hostname, _b, protocol, port;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                headers = __assign({}, (isSerializableHeaderValue(input.ExpectedBucketOwner) && {
                    "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
                }));
                resolvedPath = "/{Bucket}";
                if (input.Bucket !== undefined) {
                    labelValue = input.Bucket;
                    if (labelValue.length <= 0) {
                        throw new Error("Empty value provided for input HTTP label: Bucket.");
                    }
                    resolvedPath = resolvedPath.replace("{Bucket}", __extendedEncodeURIComponent(labelValue));
                }
                else {
                    throw new Error("No value provided for input HTTP label: Bucket.");
                }
                query = {
                    website: "",
                };
                return [4 /*yield*/, context.endpoint()];
            case 1:
                _a = _c.sent(), hostname = _a.hostname, _b = _a.protocol, protocol = _b === void 0 ? "https" : _b, port = _a.port;
                return [2 /*return*/, new __HttpRequest({
                        protocol: protocol,
                        hostname: hostname,
                        port: port,
                        method: "GET",
                        headers: headers,
                        path: resolvedPath,
                        query: query,
                        body: body,
                    })];
        }
    });
}); };
export var serializeAws_restXmlGetObjectCommand = function (input, context) { return __awaiter(void 0, void 0, void 0, function () {
    var headers, resolvedPath, labelValue, labelValue, query, body, _a, hostname, _b, protocol, port;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                headers = __assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign({}, (isSerializableHeaderValue(input.IfMatch) && { "If-Match": input.IfMatch })), (isSerializableHeaderValue(input.IfModifiedSince) && {
                    "If-Modified-Since": __dateToUtcString(input.IfModifiedSince).toString(),
                })), (isSerializableHeaderValue(input.IfNoneMatch) && { "If-None-Match": input.IfNoneMatch })), (isSerializableHeaderValue(input.IfUnmodifiedSince) && {
                    "If-Unmodified-Since": __dateToUtcString(input.IfUnmodifiedSince).toString(),
                })), (isSerializableHeaderValue(input.Range) && { Range: input.Range })), (isSerializableHeaderValue(input.SSECustomerAlgorithm) && {
                    "x-amz-server-side-encryption-customer-algorithm": input.SSECustomerAlgorithm,
                })), (isSerializableHeaderValue(input.SSECustomerKey) && {
                    "x-amz-server-side-encryption-customer-key": input.SSECustomerKey,
                })), (isSerializableHeaderValue(input.SSECustomerKeyMD5) && {
                    "x-amz-server-side-encryption-customer-key-MD5": input.SSECustomerKeyMD5,
                })), (isSerializableHeaderValue(input.RequestPayer) && { "x-amz-request-payer": input.RequestPayer })), (isSerializableHeaderValue(input.ExpectedBucketOwner) && {
                    "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
                }));
                resolvedPath = "/{Bucket}/{Key+}";
                if (input.Bucket !== undefined) {
                    labelValue = input.Bucket;
                    if (labelValue.length <= 0) {
                        throw new Error("Empty value provided for input HTTP label: Bucket.");
                    }
                    resolvedPath = resolvedPath.replace("{Bucket}", __extendedEncodeURIComponent(labelValue));
                }
                else {
                    throw new Error("No value provided for input HTTP label: Bucket.");
                }
                if (input.Key !== undefined) {
                    labelValue = input.Key;
                    if (labelValue.length <= 0) {
                        throw new Error("Empty value provided for input HTTP label: Key.");
                    }
                    resolvedPath = resolvedPath.replace("{Key+}", labelValue
                        .split("/")
                        .map(function (segment) { return __extendedEncodeURIComponent(segment); })
                        .join("/"));
                }
                else {
                    throw new Error("No value provided for input HTTP label: Key.");
                }
                query = __assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign({ "x-id": "GetObject" }, (input.ResponseCacheControl !== undefined && { "response-cache-control": input.ResponseCacheControl })), (input.ResponseContentDisposition !== undefined && {
                    "response-content-disposition": input.ResponseContentDisposition,
                })), (input.ResponseContentEncoding !== undefined && { "response-content-encoding": input.ResponseContentEncoding })), (input.ResponseContentLanguage !== undefined && { "response-content-language": input.ResponseContentLanguage })), (input.ResponseContentType !== undefined && { "response-content-type": input.ResponseContentType })), (input.ResponseExpires !== undefined && {
                    "response-expires": (input.ResponseExpires.toISOString().split(".")[0] + "Z").toString(),
                })), (input.VersionId !== undefined && { versionId: input.VersionId })), (input.PartNumber !== undefined && { partNumber: input.PartNumber.toString() }));
                return [4 /*yield*/, context.endpoint()];
            case 1:
                _a = _c.sent(), hostname = _a.hostname, _b = _a.protocol, protocol = _b === void 0 ? "https" : _b, port = _a.port;
                return [2 /*return*/, new __HttpRequest({
                        protocol: protocol,
                        hostname: hostname,
                        port: port,
                        method: "GET",
                        headers: headers,
                        path: resolvedPath,
                        query: query,
                        body: body,
                    })];
        }
    });
}); };
export var serializeAws_restXmlGetObjectAclCommand = function (input, context) { return __awaiter(void 0, void 0, void 0, function () {
    var headers, resolvedPath, labelValue, labelValue, query, body, _a, hostname, _b, protocol, port;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                headers = __assign(__assign({}, (isSerializableHeaderValue(input.RequestPayer) && { "x-amz-request-payer": input.RequestPayer })), (isSerializableHeaderValue(input.ExpectedBucketOwner) && {
                    "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
                }));
                resolvedPath = "/{Bucket}/{Key+}";
                if (input.Bucket !== undefined) {
                    labelValue = input.Bucket;
                    if (labelValue.length <= 0) {
                        throw new Error("Empty value provided for input HTTP label: Bucket.");
                    }
                    resolvedPath = resolvedPath.replace("{Bucket}", __extendedEncodeURIComponent(labelValue));
                }
                else {
                    throw new Error("No value provided for input HTTP label: Bucket.");
                }
                if (input.Key !== undefined) {
                    labelValue = input.Key;
                    if (labelValue.length <= 0) {
                        throw new Error("Empty value provided for input HTTP label: Key.");
                    }
                    resolvedPath = resolvedPath.replace("{Key+}", labelValue
                        .split("/")
                        .map(function (segment) { return __extendedEncodeURIComponent(segment); })
                        .join("/"));
                }
                else {
                    throw new Error("No value provided for input HTTP label: Key.");
                }
                query = __assign({ acl: "" }, (input.VersionId !== undefined && { versionId: input.VersionId }));
                return [4 /*yield*/, context.endpoint()];
            case 1:
                _a = _c.sent(), hostname = _a.hostname, _b = _a.protocol, protocol = _b === void 0 ? "https" : _b, port = _a.port;
                return [2 /*return*/, new __HttpRequest({
                        protocol: protocol,
                        hostname: hostname,
                        port: port,
                        method: "GET",
                        headers: headers,
                        path: resolvedPath,
                        query: query,
                        body: body,
                    })];
        }
    });
}); };
export var serializeAws_restXmlGetObjectLegalHoldCommand = function (input, context) { return __awaiter(void 0, void 0, void 0, function () {
    var headers, resolvedPath, labelValue, labelValue, query, body, _a, hostname, _b, protocol, port;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                headers = __assign(__assign({}, (isSerializableHeaderValue(input.RequestPayer) && { "x-amz-request-payer": input.RequestPayer })), (isSerializableHeaderValue(input.ExpectedBucketOwner) && {
                    "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
                }));
                resolvedPath = "/{Bucket}/{Key+}";
                if (input.Bucket !== undefined) {
                    labelValue = input.Bucket;
                    if (labelValue.length <= 0) {
                        throw new Error("Empty value provided for input HTTP label: Bucket.");
                    }
                    resolvedPath = resolvedPath.replace("{Bucket}", __extendedEncodeURIComponent(labelValue));
                }
                else {
                    throw new Error("No value provided for input HTTP label: Bucket.");
                }
                if (input.Key !== undefined) {
                    labelValue = input.Key;
                    if (labelValue.length <= 0) {
                        throw new Error("Empty value provided for input HTTP label: Key.");
                    }
                    resolvedPath = resolvedPath.replace("{Key+}", labelValue
                        .split("/")
                        .map(function (segment) { return __extendedEncodeURIComponent(segment); })
                        .join("/"));
                }
                else {
                    throw new Error("No value provided for input HTTP label: Key.");
                }
                query = __assign({ "legal-hold": "" }, (input.VersionId !== undefined && { versionId: input.VersionId }));
                return [4 /*yield*/, context.endpoint()];
            case 1:
                _a = _c.sent(), hostname = _a.hostname, _b = _a.protocol, protocol = _b === void 0 ? "https" : _b, port = _a.port;
                return [2 /*return*/, new __HttpRequest({
                        protocol: protocol,
                        hostname: hostname,
                        port: port,
                        method: "GET",
                        headers: headers,
                        path: resolvedPath,
                        query: query,
                        body: body,
                    })];
        }
    });
}); };
export var serializeAws_restXmlGetObjectLockConfigurationCommand = function (input, context) { return __awaiter(void 0, void 0, void 0, function () {
    var headers, resolvedPath, labelValue, query, body, _a, hostname, _b, protocol, port;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                headers = __assign({}, (isSerializableHeaderValue(input.ExpectedBucketOwner) && {
                    "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
                }));
                resolvedPath = "/{Bucket}";
                if (input.Bucket !== undefined) {
                    labelValue = input.Bucket;
                    if (labelValue.length <= 0) {
                        throw new Error("Empty value provided for input HTTP label: Bucket.");
                    }
                    resolvedPath = resolvedPath.replace("{Bucket}", __extendedEncodeURIComponent(labelValue));
                }
                else {
                    throw new Error("No value provided for input HTTP label: Bucket.");
                }
                query = {
                    "object-lock": "",
                };
                return [4 /*yield*/, context.endpoint()];
            case 1:
                _a = _c.sent(), hostname = _a.hostname, _b = _a.protocol, protocol = _b === void 0 ? "https" : _b, port = _a.port;
                return [2 /*return*/, new __HttpRequest({
                        protocol: protocol,
                        hostname: hostname,
                        port: port,
                        method: "GET",
                        headers: headers,
                        path: resolvedPath,
                        query: query,
                        body: body,
                    })];
        }
    });
}); };
export var serializeAws_restXmlGetObjectRetentionCommand = function (input, context) { return __awaiter(void 0, void 0, void 0, function () {
    var headers, resolvedPath, labelValue, labelValue, query, body, _a, hostname, _b, protocol, port;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                headers = __assign(__assign({}, (isSerializableHeaderValue(input.RequestPayer) && { "x-amz-request-payer": input.RequestPayer })), (isSerializableHeaderValue(input.ExpectedBucketOwner) && {
                    "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
                }));
                resolvedPath = "/{Bucket}/{Key+}";
                if (input.Bucket !== undefined) {
                    labelValue = input.Bucket;
                    if (labelValue.length <= 0) {
                        throw new Error("Empty value provided for input HTTP label: Bucket.");
                    }
                    resolvedPath = resolvedPath.replace("{Bucket}", __extendedEncodeURIComponent(labelValue));
                }
                else {
                    throw new Error("No value provided for input HTTP label: Bucket.");
                }
                if (input.Key !== undefined) {
                    labelValue = input.Key;
                    if (labelValue.length <= 0) {
                        throw new Error("Empty value provided for input HTTP label: Key.");
                    }
                    resolvedPath = resolvedPath.replace("{Key+}", labelValue
                        .split("/")
                        .map(function (segment) { return __extendedEncodeURIComponent(segment); })
                        .join("/"));
                }
                else {
                    throw new Error("No value provided for input HTTP label: Key.");
                }
                query = __assign({ retention: "" }, (input.VersionId !== undefined && { versionId: input.VersionId }));
                return [4 /*yield*/, context.endpoint()];
            case 1:
                _a = _c.sent(), hostname = _a.hostname, _b = _a.protocol, protocol = _b === void 0 ? "https" : _b, port = _a.port;
                return [2 /*return*/, new __HttpRequest({
                        protocol: protocol,
                        hostname: hostname,
                        port: port,
                        method: "GET",
                        headers: headers,
                        path: resolvedPath,
                        query: query,
                        body: body,
                    })];
        }
    });
}); };
export var serializeAws_restXmlGetObjectTaggingCommand = function (input, context) { return __awaiter(void 0, void 0, void 0, function () {
    var headers, resolvedPath, labelValue, labelValue, query, body, _a, hostname, _b, protocol, port;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                headers = __assign({}, (isSerializableHeaderValue(input.ExpectedBucketOwner) && {
                    "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
                }));
                resolvedPath = "/{Bucket}/{Key+}";
                if (input.Bucket !== undefined) {
                    labelValue = input.Bucket;
                    if (labelValue.length <= 0) {
                        throw new Error("Empty value provided for input HTTP label: Bucket.");
                    }
                    resolvedPath = resolvedPath.replace("{Bucket}", __extendedEncodeURIComponent(labelValue));
                }
                else {
                    throw new Error("No value provided for input HTTP label: Bucket.");
                }
                if (input.Key !== undefined) {
                    labelValue = input.Key;
                    if (labelValue.length <= 0) {
                        throw new Error("Empty value provided for input HTTP label: Key.");
                    }
                    resolvedPath = resolvedPath.replace("{Key+}", labelValue
                        .split("/")
                        .map(function (segment) { return __extendedEncodeURIComponent(segment); })
                        .join("/"));
                }
                else {
                    throw new Error("No value provided for input HTTP label: Key.");
                }
                query = __assign({ tagging: "" }, (input.VersionId !== undefined && { versionId: input.VersionId }));
                return [4 /*yield*/, context.endpoint()];
            case 1:
                _a = _c.sent(), hostname = _a.hostname, _b = _a.protocol, protocol = _b === void 0 ? "https" : _b, port = _a.port;
                return [2 /*return*/, new __HttpRequest({
                        protocol: protocol,
                        hostname: hostname,
                        port: port,
                        method: "GET",
                        headers: headers,
                        path: resolvedPath,
                        query: query,
                        body: body,
                    })];
        }
    });
}); };
export var serializeAws_restXmlGetObjectTorrentCommand = function (input, context) { return __awaiter(void 0, void 0, void 0, function () {
    var headers, resolvedPath, labelValue, labelValue, query, body, _a, hostname, _b, protocol, port;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                headers = __assign(__assign({}, (isSerializableHeaderValue(input.RequestPayer) && { "x-amz-request-payer": input.RequestPayer })), (isSerializableHeaderValue(input.ExpectedBucketOwner) && {
                    "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
                }));
                resolvedPath = "/{Bucket}/{Key+}";
                if (input.Bucket !== undefined) {
                    labelValue = input.Bucket;
                    if (labelValue.length <= 0) {
                        throw new Error("Empty value provided for input HTTP label: Bucket.");
                    }
                    resolvedPath = resolvedPath.replace("{Bucket}", __extendedEncodeURIComponent(labelValue));
                }
                else {
                    throw new Error("No value provided for input HTTP label: Bucket.");
                }
                if (input.Key !== undefined) {
                    labelValue = input.Key;
                    if (labelValue.length <= 0) {
                        throw new Error("Empty value provided for input HTTP label: Key.");
                    }
                    resolvedPath = resolvedPath.replace("{Key+}", labelValue
                        .split("/")
                        .map(function (segment) { return __extendedEncodeURIComponent(segment); })
                        .join("/"));
                }
                else {
                    throw new Error("No value provided for input HTTP label: Key.");
                }
                query = {
                    torrent: "",
                };
                return [4 /*yield*/, context.endpoint()];
            case 1:
                _a = _c.sent(), hostname = _a.hostname, _b = _a.protocol, protocol = _b === void 0 ? "https" : _b, port = _a.port;
                return [2 /*return*/, new __HttpRequest({
                        protocol: protocol,
                        hostname: hostname,
                        port: port,
                        method: "GET",
                        headers: headers,
                        path: resolvedPath,
                        query: query,
                        body: body,
                    })];
        }
    });
}); };
export var serializeAws_restXmlGetPublicAccessBlockCommand = function (input, context) { return __awaiter(void 0, void 0, void 0, function () {
    var headers, resolvedPath, labelValue, query, body, _a, hostname, _b, protocol, port;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                headers = __assign({}, (isSerializableHeaderValue(input.ExpectedBucketOwner) && {
                    "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
                }));
                resolvedPath = "/{Bucket}";
                if (input.Bucket !== undefined) {
                    labelValue = input.Bucket;
                    if (labelValue.length <= 0) {
                        throw new Error("Empty value provided for input HTTP label: Bucket.");
                    }
                    resolvedPath = resolvedPath.replace("{Bucket}", __extendedEncodeURIComponent(labelValue));
                }
                else {
                    throw new Error("No value provided for input HTTP label: Bucket.");
                }
                query = {
                    publicAccessBlock: "",
                };
                return [4 /*yield*/, context.endpoint()];
            case 1:
                _a = _c.sent(), hostname = _a.hostname, _b = _a.protocol, protocol = _b === void 0 ? "https" : _b, port = _a.port;
                return [2 /*return*/, new __HttpRequest({
                        protocol: protocol,
                        hostname: hostname,
                        port: port,
                        method: "GET",
                        headers: headers,
                        path: resolvedPath,
                        query: query,
                        body: body,
                    })];
        }
    });
}); };
export var serializeAws_restXmlHeadBucketCommand = function (input, context) { return __awaiter(void 0, void 0, void 0, function () {
    var headers, resolvedPath, labelValue, body, _a, hostname, _b, protocol, port;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                headers = __assign({}, (isSerializableHeaderValue(input.ExpectedBucketOwner) && {
                    "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
                }));
                resolvedPath = "/{Bucket}";
                if (input.Bucket !== undefined) {
                    labelValue = input.Bucket;
                    if (labelValue.length <= 0) {
                        throw new Error("Empty value provided for input HTTP label: Bucket.");
                    }
                    resolvedPath = resolvedPath.replace("{Bucket}", __extendedEncodeURIComponent(labelValue));
                }
                else {
                    throw new Error("No value provided for input HTTP label: Bucket.");
                }
                return [4 /*yield*/, context.endpoint()];
            case 1:
                _a = _c.sent(), hostname = _a.hostname, _b = _a.protocol, protocol = _b === void 0 ? "https" : _b, port = _a.port;
                return [2 /*return*/, new __HttpRequest({
                        protocol: protocol,
                        hostname: hostname,
                        port: port,
                        method: "HEAD",
                        headers: headers,
                        path: resolvedPath,
                        body: body,
                    })];
        }
    });
}); };
export var serializeAws_restXmlHeadObjectCommand = function (input, context) { return __awaiter(void 0, void 0, void 0, function () {
    var headers, resolvedPath, labelValue, labelValue, query, body, _a, hostname, _b, protocol, port;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                headers = __assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign({}, (isSerializableHeaderValue(input.IfMatch) && { "If-Match": input.IfMatch })), (isSerializableHeaderValue(input.IfModifiedSince) && {
                    "If-Modified-Since": __dateToUtcString(input.IfModifiedSince).toString(),
                })), (isSerializableHeaderValue(input.IfNoneMatch) && { "If-None-Match": input.IfNoneMatch })), (isSerializableHeaderValue(input.IfUnmodifiedSince) && {
                    "If-Unmodified-Since": __dateToUtcString(input.IfUnmodifiedSince).toString(),
                })), (isSerializableHeaderValue(input.Range) && { Range: input.Range })), (isSerializableHeaderValue(input.SSECustomerAlgorithm) && {
                    "x-amz-server-side-encryption-customer-algorithm": input.SSECustomerAlgorithm,
                })), (isSerializableHeaderValue(input.SSECustomerKey) && {
                    "x-amz-server-side-encryption-customer-key": input.SSECustomerKey,
                })), (isSerializableHeaderValue(input.SSECustomerKeyMD5) && {
                    "x-amz-server-side-encryption-customer-key-MD5": input.SSECustomerKeyMD5,
                })), (isSerializableHeaderValue(input.RequestPayer) && { "x-amz-request-payer": input.RequestPayer })), (isSerializableHeaderValue(input.ExpectedBucketOwner) && {
                    "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
                }));
                resolvedPath = "/{Bucket}/{Key+}";
                if (input.Bucket !== undefined) {
                    labelValue = input.Bucket;
                    if (labelValue.length <= 0) {
                        throw new Error("Empty value provided for input HTTP label: Bucket.");
                    }
                    resolvedPath = resolvedPath.replace("{Bucket}", __extendedEncodeURIComponent(labelValue));
                }
                else {
                    throw new Error("No value provided for input HTTP label: Bucket.");
                }
                if (input.Key !== undefined) {
                    labelValue = input.Key;
                    if (labelValue.length <= 0) {
                        throw new Error("Empty value provided for input HTTP label: Key.");
                    }
                    resolvedPath = resolvedPath.replace("{Key+}", labelValue
                        .split("/")
                        .map(function (segment) { return __extendedEncodeURIComponent(segment); })
                        .join("/"));
                }
                else {
                    throw new Error("No value provided for input HTTP label: Key.");
                }
                query = __assign(__assign({}, (input.VersionId !== undefined && { versionId: input.VersionId })), (input.PartNumber !== undefined && { partNumber: input.PartNumber.toString() }));
                return [4 /*yield*/, context.endpoint()];
            case 1:
                _a = _c.sent(), hostname = _a.hostname, _b = _a.protocol, protocol = _b === void 0 ? "https" : _b, port = _a.port;
                return [2 /*return*/, new __HttpRequest({
                        protocol: protocol,
                        hostname: hostname,
                        port: port,
                        method: "HEAD",
                        headers: headers,
                        path: resolvedPath,
                        query: query,
                        body: body,
                    })];
        }
    });
}); };
export var serializeAws_restXmlListBucketAnalyticsConfigurationsCommand = function (input, context) { return __awaiter(void 0, void 0, void 0, function () {
    var headers, resolvedPath, labelValue, query, body, _a, hostname, _b, protocol, port;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                headers = __assign({}, (isSerializableHeaderValue(input.ExpectedBucketOwner) && {
                    "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
                }));
                resolvedPath = "/{Bucket}";
                if (input.Bucket !== undefined) {
                    labelValue = input.Bucket;
                    if (labelValue.length <= 0) {
                        throw new Error("Empty value provided for input HTTP label: Bucket.");
                    }
                    resolvedPath = resolvedPath.replace("{Bucket}", __extendedEncodeURIComponent(labelValue));
                }
                else {
                    throw new Error("No value provided for input HTTP label: Bucket.");
                }
                query = __assign({ analytics: "", "x-id": "ListBucketAnalyticsConfigurations" }, (input.ContinuationToken !== undefined && { "continuation-token": input.ContinuationToken }));
                return [4 /*yield*/, context.endpoint()];
            case 1:
                _a = _c.sent(), hostname = _a.hostname, _b = _a.protocol, protocol = _b === void 0 ? "https" : _b, port = _a.port;
                return [2 /*return*/, new __HttpRequest({
                        protocol: protocol,
                        hostname: hostname,
                        port: port,
                        method: "GET",
                        headers: headers,
                        path: resolvedPath,
                        query: query,
                        body: body,
                    })];
        }
    });
}); };
export var serializeAws_restXmlListBucketIntelligentTieringConfigurationsCommand = function (input, context) { return __awaiter(void 0, void 0, void 0, function () {
    var headers, resolvedPath, labelValue, query, body, _a, hostname, _b, protocol, port;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                headers = {};
                resolvedPath = "/{Bucket}";
                if (input.Bucket !== undefined) {
                    labelValue = input.Bucket;
                    if (labelValue.length <= 0) {
                        throw new Error("Empty value provided for input HTTP label: Bucket.");
                    }
                    resolvedPath = resolvedPath.replace("{Bucket}", __extendedEncodeURIComponent(labelValue));
                }
                else {
                    throw new Error("No value provided for input HTTP label: Bucket.");
                }
                query = __assign({ "intelligent-tiering": "", "x-id": "ListBucketIntelligentTieringConfigurations" }, (input.ContinuationToken !== undefined && { "continuation-token": input.ContinuationToken }));
                return [4 /*yield*/, context.endpoint()];
            case 1:
                _a = _c.sent(), hostname = _a.hostname, _b = _a.protocol, protocol = _b === void 0 ? "https" : _b, port = _a.port;
                return [2 /*return*/, new __HttpRequest({
                        protocol: protocol,
                        hostname: hostname,
                        port: port,
                        method: "GET",
                        headers: headers,
                        path: resolvedPath,
                        query: query,
                        body: body,
                    })];
        }
    });
}); };
export var serializeAws_restXmlListBucketInventoryConfigurationsCommand = function (input, context) { return __awaiter(void 0, void 0, void 0, function () {
    var headers, resolvedPath, labelValue, query, body, _a, hostname, _b, protocol, port;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                headers = __assign({}, (isSerializableHeaderValue(input.ExpectedBucketOwner) && {
                    "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
                }));
                resolvedPath = "/{Bucket}";
                if (input.Bucket !== undefined) {
                    labelValue = input.Bucket;
                    if (labelValue.length <= 0) {
                        throw new Error("Empty value provided for input HTTP label: Bucket.");
                    }
                    resolvedPath = resolvedPath.replace("{Bucket}", __extendedEncodeURIComponent(labelValue));
                }
                else {
                    throw new Error("No value provided for input HTTP label: Bucket.");
                }
                query = __assign({ inventory: "", "x-id": "ListBucketInventoryConfigurations" }, (input.ContinuationToken !== undefined && { "continuation-token": input.ContinuationToken }));
                return [4 /*yield*/, context.endpoint()];
            case 1:
                _a = _c.sent(), hostname = _a.hostname, _b = _a.protocol, protocol = _b === void 0 ? "https" : _b, port = _a.port;
                return [2 /*return*/, new __HttpRequest({
                        protocol: protocol,
                        hostname: hostname,
                        port: port,
                        method: "GET",
                        headers: headers,
                        path: resolvedPath,
                        query: query,
                        body: body,
                    })];
        }
    });
}); };
export var serializeAws_restXmlListBucketMetricsConfigurationsCommand = function (input, context) { return __awaiter(void 0, void 0, void 0, function () {
    var headers, resolvedPath, labelValue, query, body, _a, hostname, _b, protocol, port;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                headers = __assign({}, (isSerializableHeaderValue(input.ExpectedBucketOwner) && {
                    "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
                }));
                resolvedPath = "/{Bucket}";
                if (input.Bucket !== undefined) {
                    labelValue = input.Bucket;
                    if (labelValue.length <= 0) {
                        throw new Error("Empty value provided for input HTTP label: Bucket.");
                    }
                    resolvedPath = resolvedPath.replace("{Bucket}", __extendedEncodeURIComponent(labelValue));
                }
                else {
                    throw new Error("No value provided for input HTTP label: Bucket.");
                }
                query = __assign({ metrics: "", "x-id": "ListBucketMetricsConfigurations" }, (input.ContinuationToken !== undefined && { "continuation-token": input.ContinuationToken }));
                return [4 /*yield*/, context.endpoint()];
            case 1:
                _a = _c.sent(), hostname = _a.hostname, _b = _a.protocol, protocol = _b === void 0 ? "https" : _b, port = _a.port;
                return [2 /*return*/, new __HttpRequest({
                        protocol: protocol,
                        hostname: hostname,
                        port: port,
                        method: "GET",
                        headers: headers,
                        path: resolvedPath,
                        query: query,
                        body: body,
                    })];
        }
    });
}); };
export var serializeAws_restXmlListBucketsCommand = function (input, context) { return __awaiter(void 0, void 0, void 0, function () {
    var headers, resolvedPath, body, _a, hostname, _b, protocol, port;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                headers = {};
                resolvedPath = "/";
                body = "";
                return [4 /*yield*/, context.endpoint()];
            case 1:
                _a = _c.sent(), hostname = _a.hostname, _b = _a.protocol, protocol = _b === void 0 ? "https" : _b, port = _a.port;
                return [2 /*return*/, new __HttpRequest({
                        protocol: protocol,
                        hostname: hostname,
                        port: port,
                        method: "GET",
                        headers: headers,
                        path: resolvedPath,
                        body: body,
                    })];
        }
    });
}); };
export var serializeAws_restXmlListMultipartUploadsCommand = function (input, context) { return __awaiter(void 0, void 0, void 0, function () {
    var headers, resolvedPath, labelValue, query, body, _a, hostname, _b, protocol, port;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                headers = __assign({}, (isSerializableHeaderValue(input.ExpectedBucketOwner) && {
                    "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
                }));
                resolvedPath = "/{Bucket}";
                if (input.Bucket !== undefined) {
                    labelValue = input.Bucket;
                    if (labelValue.length <= 0) {
                        throw new Error("Empty value provided for input HTTP label: Bucket.");
                    }
                    resolvedPath = resolvedPath.replace("{Bucket}", __extendedEncodeURIComponent(labelValue));
                }
                else {
                    throw new Error("No value provided for input HTTP label: Bucket.");
                }
                query = __assign(__assign(__assign(__assign(__assign(__assign({ uploads: "" }, (input.Delimiter !== undefined && { delimiter: input.Delimiter })), (input.EncodingType !== undefined && { "encoding-type": input.EncodingType })), (input.KeyMarker !== undefined && { "key-marker": input.KeyMarker })), (input.MaxUploads !== undefined && { "max-uploads": input.MaxUploads.toString() })), (input.Prefix !== undefined && { prefix: input.Prefix })), (input.UploadIdMarker !== undefined && { "upload-id-marker": input.UploadIdMarker }));
                return [4 /*yield*/, context.endpoint()];
            case 1:
                _a = _c.sent(), hostname = _a.hostname, _b = _a.protocol, protocol = _b === void 0 ? "https" : _b, port = _a.port;
                return [2 /*return*/, new __HttpRequest({
                        protocol: protocol,
                        hostname: hostname,
                        port: port,
                        method: "GET",
                        headers: headers,
                        path: resolvedPath,
                        query: query,
                        body: body,
                    })];
        }
    });
}); };
export var serializeAws_restXmlListObjectsCommand = function (input, context) { return __awaiter(void 0, void 0, void 0, function () {
    var headers, resolvedPath, labelValue, query, body, _a, hostname, _b, protocol, port;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                headers = __assign(__assign({}, (isSerializableHeaderValue(input.RequestPayer) && { "x-amz-request-payer": input.RequestPayer })), (isSerializableHeaderValue(input.ExpectedBucketOwner) && {
                    "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
                }));
                resolvedPath = "/{Bucket}";
                if (input.Bucket !== undefined) {
                    labelValue = input.Bucket;
                    if (labelValue.length <= 0) {
                        throw new Error("Empty value provided for input HTTP label: Bucket.");
                    }
                    resolvedPath = resolvedPath.replace("{Bucket}", __extendedEncodeURIComponent(labelValue));
                }
                else {
                    throw new Error("No value provided for input HTTP label: Bucket.");
                }
                query = __assign(__assign(__assign(__assign(__assign({}, (input.Delimiter !== undefined && { delimiter: input.Delimiter })), (input.EncodingType !== undefined && { "encoding-type": input.EncodingType })), (input.Marker !== undefined && { marker: input.Marker })), (input.MaxKeys !== undefined && { "max-keys": input.MaxKeys.toString() })), (input.Prefix !== undefined && { prefix: input.Prefix }));
                return [4 /*yield*/, context.endpoint()];
            case 1:
                _a = _c.sent(), hostname = _a.hostname, _b = _a.protocol, protocol = _b === void 0 ? "https" : _b, port = _a.port;
                return [2 /*return*/, new __HttpRequest({
                        protocol: protocol,
                        hostname: hostname,
                        port: port,
                        method: "GET",
                        headers: headers,
                        path: resolvedPath,
                        query: query,
                        body: body,
                    })];
        }
    });
}); };
export var serializeAws_restXmlListObjectsV2Command = function (input, context) { return __awaiter(void 0, void 0, void 0, function () {
    var headers, resolvedPath, labelValue, query, body, _a, hostname, _b, protocol, port;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                headers = __assign(__assign({}, (isSerializableHeaderValue(input.RequestPayer) && { "x-amz-request-payer": input.RequestPayer })), (isSerializableHeaderValue(input.ExpectedBucketOwner) && {
                    "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
                }));
                resolvedPath = "/{Bucket}";
                if (input.Bucket !== undefined) {
                    labelValue = input.Bucket;
                    if (labelValue.length <= 0) {
                        throw new Error("Empty value provided for input HTTP label: Bucket.");
                    }
                    resolvedPath = resolvedPath.replace("{Bucket}", __extendedEncodeURIComponent(labelValue));
                }
                else {
                    throw new Error("No value provided for input HTTP label: Bucket.");
                }
                query = __assign(__assign(__assign(__assign(__assign(__assign(__assign({ "list-type": "2" }, (input.Delimiter !== undefined && { delimiter: input.Delimiter })), (input.EncodingType !== undefined && { "encoding-type": input.EncodingType })), (input.MaxKeys !== undefined && { "max-keys": input.MaxKeys.toString() })), (input.Prefix !== undefined && { prefix: input.Prefix })), (input.ContinuationToken !== undefined && { "continuation-token": input.ContinuationToken })), (input.FetchOwner !== undefined && { "fetch-owner": input.FetchOwner.toString() })), (input.StartAfter !== undefined && { "start-after": input.StartAfter }));
                return [4 /*yield*/, context.endpoint()];
            case 1:
                _a = _c.sent(), hostname = _a.hostname, _b = _a.protocol, protocol = _b === void 0 ? "https" : _b, port = _a.port;
                return [2 /*return*/, new __HttpRequest({
                        protocol: protocol,
                        hostname: hostname,
                        port: port,
                        method: "GET",
                        headers: headers,
                        path: resolvedPath,
                        query: query,
                        body: body,
                    })];
        }
    });
}); };
export var serializeAws_restXmlListObjectVersionsCommand = function (input, context) { return __awaiter(void 0, void 0, void 0, function () {
    var headers, resolvedPath, labelValue, query, body, _a, hostname, _b, protocol, port;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                headers = __assign({}, (isSerializableHeaderValue(input.ExpectedBucketOwner) && {
                    "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
                }));
                resolvedPath = "/{Bucket}";
                if (input.Bucket !== undefined) {
                    labelValue = input.Bucket;
                    if (labelValue.length <= 0) {
                        throw new Error("Empty value provided for input HTTP label: Bucket.");
                    }
                    resolvedPath = resolvedPath.replace("{Bucket}", __extendedEncodeURIComponent(labelValue));
                }
                else {
                    throw new Error("No value provided for input HTTP label: Bucket.");
                }
                query = __assign(__assign(__assign(__assign(__assign(__assign({ versions: "" }, (input.Delimiter !== undefined && { delimiter: input.Delimiter })), (input.EncodingType !== undefined && { "encoding-type": input.EncodingType })), (input.KeyMarker !== undefined && { "key-marker": input.KeyMarker })), (input.MaxKeys !== undefined && { "max-keys": input.MaxKeys.toString() })), (input.Prefix !== undefined && { prefix: input.Prefix })), (input.VersionIdMarker !== undefined && { "version-id-marker": input.VersionIdMarker }));
                return [4 /*yield*/, context.endpoint()];
            case 1:
                _a = _c.sent(), hostname = _a.hostname, _b = _a.protocol, protocol = _b === void 0 ? "https" : _b, port = _a.port;
                return [2 /*return*/, new __HttpRequest({
                        protocol: protocol,
                        hostname: hostname,
                        port: port,
                        method: "GET",
                        headers: headers,
                        path: resolvedPath,
                        query: query,
                        body: body,
                    })];
        }
    });
}); };
export var serializeAws_restXmlListPartsCommand = function (input, context) { return __awaiter(void 0, void 0, void 0, function () {
    var headers, resolvedPath, labelValue, labelValue, query, body, _a, hostname, _b, protocol, port;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                headers = __assign(__assign({}, (isSerializableHeaderValue(input.RequestPayer) && { "x-amz-request-payer": input.RequestPayer })), (isSerializableHeaderValue(input.ExpectedBucketOwner) && {
                    "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
                }));
                resolvedPath = "/{Bucket}/{Key+}";
                if (input.Bucket !== undefined) {
                    labelValue = input.Bucket;
                    if (labelValue.length <= 0) {
                        throw new Error("Empty value provided for input HTTP label: Bucket.");
                    }
                    resolvedPath = resolvedPath.replace("{Bucket}", __extendedEncodeURIComponent(labelValue));
                }
                else {
                    throw new Error("No value provided for input HTTP label: Bucket.");
                }
                if (input.Key !== undefined) {
                    labelValue = input.Key;
                    if (labelValue.length <= 0) {
                        throw new Error("Empty value provided for input HTTP label: Key.");
                    }
                    resolvedPath = resolvedPath.replace("{Key+}", labelValue
                        .split("/")
                        .map(function (segment) { return __extendedEncodeURIComponent(segment); })
                        .join("/"));
                }
                else {
                    throw new Error("No value provided for input HTTP label: Key.");
                }
                query = __assign(__assign(__assign({ "x-id": "ListParts" }, (input.MaxParts !== undefined && { "max-parts": input.MaxParts.toString() })), (input.PartNumberMarker !== undefined && { "part-number-marker": input.PartNumberMarker })), (input.UploadId !== undefined && { uploadId: input.UploadId }));
                return [4 /*yield*/, context.endpoint()];
            case 1:
                _a = _c.sent(), hostname = _a.hostname, _b = _a.protocol, protocol = _b === void 0 ? "https" : _b, port = _a.port;
                return [2 /*return*/, new __HttpRequest({
                        protocol: protocol,
                        hostname: hostname,
                        port: port,
                        method: "GET",
                        headers: headers,
                        path: resolvedPath,
                        query: query,
                        body: body,
                    })];
        }
    });
}); };
export var serializeAws_restXmlPutBucketAccelerateConfigurationCommand = function (input, context) { return __awaiter(void 0, void 0, void 0, function () {
    var headers, resolvedPath, labelValue, query, body, contents, _a, hostname, _b, protocol, port;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                headers = __assign({ "content-type": "application/xml" }, (isSerializableHeaderValue(input.ExpectedBucketOwner) && {
                    "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
                }));
                resolvedPath = "/{Bucket}";
                if (input.Bucket !== undefined) {
                    labelValue = input.Bucket;
                    if (labelValue.length <= 0) {
                        throw new Error("Empty value provided for input HTTP label: Bucket.");
                    }
                    resolvedPath = resolvedPath.replace("{Bucket}", __extendedEncodeURIComponent(labelValue));
                }
                else {
                    throw new Error("No value provided for input HTTP label: Bucket.");
                }
                query = {
                    accelerate: "",
                };
                if (input.AccelerateConfiguration !== undefined) {
                    contents = serializeAws_restXmlAccelerateConfiguration(input.AccelerateConfiguration, context);
                    body = '<?xml version="1.0" encoding="UTF-8"?>';
                    contents.addAttribute("xmlns", "http://s3.amazonaws.com/doc/2006-03-01/");
                    body += contents.toString();
                }
                return [4 /*yield*/, context.endpoint()];
            case 1:
                _a = _c.sent(), hostname = _a.hostname, _b = _a.protocol, protocol = _b === void 0 ? "https" : _b, port = _a.port;
                return [2 /*return*/, new __HttpRequest({
                        protocol: protocol,
                        hostname: hostname,
                        port: port,
                        method: "PUT",
                        headers: headers,
                        path: resolvedPath,
                        query: query,
                        body: body,
                    })];
        }
    });
}); };
export var serializeAws_restXmlPutBucketAclCommand = function (input, context) { return __awaiter(void 0, void 0, void 0, function () {
    var headers, resolvedPath, labelValue, query, body, contents, _a, hostname, _b, protocol, port;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                headers = __assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign({ "content-type": "application/xml" }, (isSerializableHeaderValue(input.ACL) && { "x-amz-acl": input.ACL })), (isSerializableHeaderValue(input.ContentMD5) && { "Content-MD5": input.ContentMD5 })), (isSerializableHeaderValue(input.GrantFullControl) && { "x-amz-grant-full-control": input.GrantFullControl })), (isSerializableHeaderValue(input.GrantRead) && { "x-amz-grant-read": input.GrantRead })), (isSerializableHeaderValue(input.GrantReadACP) && { "x-amz-grant-read-acp": input.GrantReadACP })), (isSerializableHeaderValue(input.GrantWrite) && { "x-amz-grant-write": input.GrantWrite })), (isSerializableHeaderValue(input.GrantWriteACP) && { "x-amz-grant-write-acp": input.GrantWriteACP })), (isSerializableHeaderValue(input.ExpectedBucketOwner) && {
                    "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
                }));
                resolvedPath = "/{Bucket}";
                if (input.Bucket !== undefined) {
                    labelValue = input.Bucket;
                    if (labelValue.length <= 0) {
                        throw new Error("Empty value provided for input HTTP label: Bucket.");
                    }
                    resolvedPath = resolvedPath.replace("{Bucket}", __extendedEncodeURIComponent(labelValue));
                }
                else {
                    throw new Error("No value provided for input HTTP label: Bucket.");
                }
                query = {
                    acl: "",
                };
                if (input.AccessControlPolicy !== undefined) {
                    contents = serializeAws_restXmlAccessControlPolicy(input.AccessControlPolicy, context);
                    body = '<?xml version="1.0" encoding="UTF-8"?>';
                    contents.addAttribute("xmlns", "http://s3.amazonaws.com/doc/2006-03-01/");
                    body += contents.toString();
                }
                return [4 /*yield*/, context.endpoint()];
            case 1:
                _a = _c.sent(), hostname = _a.hostname, _b = _a.protocol, protocol = _b === void 0 ? "https" : _b, port = _a.port;
                return [2 /*return*/, new __HttpRequest({
                        protocol: protocol,
                        hostname: hostname,
                        port: port,
                        method: "PUT",
                        headers: headers,
                        path: resolvedPath,
                        query: query,
                        body: body,
                    })];
        }
    });
}); };
export var serializeAws_restXmlPutBucketAnalyticsConfigurationCommand = function (input, context) { return __awaiter(void 0, void 0, void 0, function () {
    var headers, resolvedPath, labelValue, query, body, contents, _a, hostname, _b, protocol, port;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                headers = __assign({ "content-type": "application/xml" }, (isSerializableHeaderValue(input.ExpectedBucketOwner) && {
                    "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
                }));
                resolvedPath = "/{Bucket}";
                if (input.Bucket !== undefined) {
                    labelValue = input.Bucket;
                    if (labelValue.length <= 0) {
                        throw new Error("Empty value provided for input HTTP label: Bucket.");
                    }
                    resolvedPath = resolvedPath.replace("{Bucket}", __extendedEncodeURIComponent(labelValue));
                }
                else {
                    throw new Error("No value provided for input HTTP label: Bucket.");
                }
                query = __assign({ analytics: "" }, (input.Id !== undefined && { id: input.Id }));
                if (input.AnalyticsConfiguration !== undefined) {
                    contents = serializeAws_restXmlAnalyticsConfiguration(input.AnalyticsConfiguration, context);
                    body = '<?xml version="1.0" encoding="UTF-8"?>';
                    contents.addAttribute("xmlns", "http://s3.amazonaws.com/doc/2006-03-01/");
                    body += contents.toString();
                }
                return [4 /*yield*/, context.endpoint()];
            case 1:
                _a = _c.sent(), hostname = _a.hostname, _b = _a.protocol, protocol = _b === void 0 ? "https" : _b, port = _a.port;
                return [2 /*return*/, new __HttpRequest({
                        protocol: protocol,
                        hostname: hostname,
                        port: port,
                        method: "PUT",
                        headers: headers,
                        path: resolvedPath,
                        query: query,
                        body: body,
                    })];
        }
    });
}); };
export var serializeAws_restXmlPutBucketCorsCommand = function (input, context) { return __awaiter(void 0, void 0, void 0, function () {
    var headers, resolvedPath, labelValue, query, body, contents, _a, hostname, _b, protocol, port;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                headers = __assign(__assign({ "content-type": "application/xml" }, (isSerializableHeaderValue(input.ContentMD5) && { "Content-MD5": input.ContentMD5 })), (isSerializableHeaderValue(input.ExpectedBucketOwner) && {
                    "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
                }));
                resolvedPath = "/{Bucket}";
                if (input.Bucket !== undefined) {
                    labelValue = input.Bucket;
                    if (labelValue.length <= 0) {
                        throw new Error("Empty value provided for input HTTP label: Bucket.");
                    }
                    resolvedPath = resolvedPath.replace("{Bucket}", __extendedEncodeURIComponent(labelValue));
                }
                else {
                    throw new Error("No value provided for input HTTP label: Bucket.");
                }
                query = {
                    cors: "",
                };
                if (input.CORSConfiguration !== undefined) {
                    contents = serializeAws_restXmlCORSConfiguration(input.CORSConfiguration, context);
                    body = '<?xml version="1.0" encoding="UTF-8"?>';
                    contents.addAttribute("xmlns", "http://s3.amazonaws.com/doc/2006-03-01/");
                    body += contents.toString();
                }
                return [4 /*yield*/, context.endpoint()];
            case 1:
                _a = _c.sent(), hostname = _a.hostname, _b = _a.protocol, protocol = _b === void 0 ? "https" : _b, port = _a.port;
                return [2 /*return*/, new __HttpRequest({
                        protocol: protocol,
                        hostname: hostname,
                        port: port,
                        method: "PUT",
                        headers: headers,
                        path: resolvedPath,
                        query: query,
                        body: body,
                    })];
        }
    });
}); };
export var serializeAws_restXmlPutBucketEncryptionCommand = function (input, context) { return __awaiter(void 0, void 0, void 0, function () {
    var headers, resolvedPath, labelValue, query, body, contents, _a, hostname, _b, protocol, port;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                headers = __assign(__assign({ "content-type": "application/xml" }, (isSerializableHeaderValue(input.ContentMD5) && { "Content-MD5": input.ContentMD5 })), (isSerializableHeaderValue(input.ExpectedBucketOwner) && {
                    "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
                }));
                resolvedPath = "/{Bucket}";
                if (input.Bucket !== undefined) {
                    labelValue = input.Bucket;
                    if (labelValue.length <= 0) {
                        throw new Error("Empty value provided for input HTTP label: Bucket.");
                    }
                    resolvedPath = resolvedPath.replace("{Bucket}", __extendedEncodeURIComponent(labelValue));
                }
                else {
                    throw new Error("No value provided for input HTTP label: Bucket.");
                }
                query = {
                    encryption: "",
                };
                if (input.ServerSideEncryptionConfiguration !== undefined) {
                    contents = serializeAws_restXmlServerSideEncryptionConfiguration(input.ServerSideEncryptionConfiguration, context);
                    body = '<?xml version="1.0" encoding="UTF-8"?>';
                    contents.addAttribute("xmlns", "http://s3.amazonaws.com/doc/2006-03-01/");
                    body += contents.toString();
                }
                return [4 /*yield*/, context.endpoint()];
            case 1:
                _a = _c.sent(), hostname = _a.hostname, _b = _a.protocol, protocol = _b === void 0 ? "https" : _b, port = _a.port;
                return [2 /*return*/, new __HttpRequest({
                        protocol: protocol,
                        hostname: hostname,
                        port: port,
                        method: "PUT",
                        headers: headers,
                        path: resolvedPath,
                        query: query,
                        body: body,
                    })];
        }
    });
}); };
export var serializeAws_restXmlPutBucketIntelligentTieringConfigurationCommand = function (input, context) { return __awaiter(void 0, void 0, void 0, function () {
    var headers, resolvedPath, labelValue, query, body, contents, _a, hostname, _b, protocol, port;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                headers = {
                    "content-type": "application/xml",
                };
                resolvedPath = "/{Bucket}";
                if (input.Bucket !== undefined) {
                    labelValue = input.Bucket;
                    if (labelValue.length <= 0) {
                        throw new Error("Empty value provided for input HTTP label: Bucket.");
                    }
                    resolvedPath = resolvedPath.replace("{Bucket}", __extendedEncodeURIComponent(labelValue));
                }
                else {
                    throw new Error("No value provided for input HTTP label: Bucket.");
                }
                query = __assign({ "intelligent-tiering": "" }, (input.Id !== undefined && { id: input.Id }));
                if (input.IntelligentTieringConfiguration !== undefined) {
                    contents = serializeAws_restXmlIntelligentTieringConfiguration(input.IntelligentTieringConfiguration, context);
                    body = '<?xml version="1.0" encoding="UTF-8"?>';
                    contents.addAttribute("xmlns", "http://s3.amazonaws.com/doc/2006-03-01/");
                    body += contents.toString();
                }
                return [4 /*yield*/, context.endpoint()];
            case 1:
                _a = _c.sent(), hostname = _a.hostname, _b = _a.protocol, protocol = _b === void 0 ? "https" : _b, port = _a.port;
                return [2 /*return*/, new __HttpRequest({
                        protocol: protocol,
                        hostname: hostname,
                        port: port,
                        method: "PUT",
                        headers: headers,
                        path: resolvedPath,
                        query: query,
                        body: body,
                    })];
        }
    });
}); };
export var serializeAws_restXmlPutBucketInventoryConfigurationCommand = function (input, context) { return __awaiter(void 0, void 0, void 0, function () {
    var headers, resolvedPath, labelValue, query, body, contents, _a, hostname, _b, protocol, port;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                headers = __assign({ "content-type": "application/xml" }, (isSerializableHeaderValue(input.ExpectedBucketOwner) && {
                    "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
                }));
                resolvedPath = "/{Bucket}";
                if (input.Bucket !== undefined) {
                    labelValue = input.Bucket;
                    if (labelValue.length <= 0) {
                        throw new Error("Empty value provided for input HTTP label: Bucket.");
                    }
                    resolvedPath = resolvedPath.replace("{Bucket}", __extendedEncodeURIComponent(labelValue));
                }
                else {
                    throw new Error("No value provided for input HTTP label: Bucket.");
                }
                query = __assign({ inventory: "" }, (input.Id !== undefined && { id: input.Id }));
                if (input.InventoryConfiguration !== undefined) {
                    contents = serializeAws_restXmlInventoryConfiguration(input.InventoryConfiguration, context);
                    body = '<?xml version="1.0" encoding="UTF-8"?>';
                    contents.addAttribute("xmlns", "http://s3.amazonaws.com/doc/2006-03-01/");
                    body += contents.toString();
                }
                return [4 /*yield*/, context.endpoint()];
            case 1:
                _a = _c.sent(), hostname = _a.hostname, _b = _a.protocol, protocol = _b === void 0 ? "https" : _b, port = _a.port;
                return [2 /*return*/, new __HttpRequest({
                        protocol: protocol,
                        hostname: hostname,
                        port: port,
                        method: "PUT",
                        headers: headers,
                        path: resolvedPath,
                        query: query,
                        body: body,
                    })];
        }
    });
}); };
export var serializeAws_restXmlPutBucketLifecycleConfigurationCommand = function (input, context) { return __awaiter(void 0, void 0, void 0, function () {
    var headers, resolvedPath, labelValue, query, body, contents, _a, hostname, _b, protocol, port;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                headers = __assign({ "content-type": "application/xml" }, (isSerializableHeaderValue(input.ExpectedBucketOwner) && {
                    "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
                }));
                resolvedPath = "/{Bucket}";
                if (input.Bucket !== undefined) {
                    labelValue = input.Bucket;
                    if (labelValue.length <= 0) {
                        throw new Error("Empty value provided for input HTTP label: Bucket.");
                    }
                    resolvedPath = resolvedPath.replace("{Bucket}", __extendedEncodeURIComponent(labelValue));
                }
                else {
                    throw new Error("No value provided for input HTTP label: Bucket.");
                }
                query = {
                    lifecycle: "",
                };
                if (input.LifecycleConfiguration !== undefined) {
                    contents = serializeAws_restXmlBucketLifecycleConfiguration(input.LifecycleConfiguration, context);
                    body = '<?xml version="1.0" encoding="UTF-8"?>';
                    contents.addAttribute("xmlns", "http://s3.amazonaws.com/doc/2006-03-01/");
                    body += contents.toString();
                }
                return [4 /*yield*/, context.endpoint()];
            case 1:
                _a = _c.sent(), hostname = _a.hostname, _b = _a.protocol, protocol = _b === void 0 ? "https" : _b, port = _a.port;
                return [2 /*return*/, new __HttpRequest({
                        protocol: protocol,
                        hostname: hostname,
                        port: port,
                        method: "PUT",
                        headers: headers,
                        path: resolvedPath,
                        query: query,
                        body: body,
                    })];
        }
    });
}); };
export var serializeAws_restXmlPutBucketLoggingCommand = function (input, context) { return __awaiter(void 0, void 0, void 0, function () {
    var headers, resolvedPath, labelValue, query, body, contents, _a, hostname, _b, protocol, port;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                headers = __assign(__assign({ "content-type": "application/xml" }, (isSerializableHeaderValue(input.ContentMD5) && { "Content-MD5": input.ContentMD5 })), (isSerializableHeaderValue(input.ExpectedBucketOwner) && {
                    "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
                }));
                resolvedPath = "/{Bucket}";
                if (input.Bucket !== undefined) {
                    labelValue = input.Bucket;
                    if (labelValue.length <= 0) {
                        throw new Error("Empty value provided for input HTTP label: Bucket.");
                    }
                    resolvedPath = resolvedPath.replace("{Bucket}", __extendedEncodeURIComponent(labelValue));
                }
                else {
                    throw new Error("No value provided for input HTTP label: Bucket.");
                }
                query = {
                    logging: "",
                };
                if (input.BucketLoggingStatus !== undefined) {
                    contents = serializeAws_restXmlBucketLoggingStatus(input.BucketLoggingStatus, context);
                    body = '<?xml version="1.0" encoding="UTF-8"?>';
                    contents.addAttribute("xmlns", "http://s3.amazonaws.com/doc/2006-03-01/");
                    body += contents.toString();
                }
                return [4 /*yield*/, context.endpoint()];
            case 1:
                _a = _c.sent(), hostname = _a.hostname, _b = _a.protocol, protocol = _b === void 0 ? "https" : _b, port = _a.port;
                return [2 /*return*/, new __HttpRequest({
                        protocol: protocol,
                        hostname: hostname,
                        port: port,
                        method: "PUT",
                        headers: headers,
                        path: resolvedPath,
                        query: query,
                        body: body,
                    })];
        }
    });
}); };
export var serializeAws_restXmlPutBucketMetricsConfigurationCommand = function (input, context) { return __awaiter(void 0, void 0, void 0, function () {
    var headers, resolvedPath, labelValue, query, body, contents, _a, hostname, _b, protocol, port;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                headers = __assign({ "content-type": "application/xml" }, (isSerializableHeaderValue(input.ExpectedBucketOwner) && {
                    "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
                }));
                resolvedPath = "/{Bucket}";
                if (input.Bucket !== undefined) {
                    labelValue = input.Bucket;
                    if (labelValue.length <= 0) {
                        throw new Error("Empty value provided for input HTTP label: Bucket.");
                    }
                    resolvedPath = resolvedPath.replace("{Bucket}", __extendedEncodeURIComponent(labelValue));
                }
                else {
                    throw new Error("No value provided for input HTTP label: Bucket.");
                }
                query = __assign({ metrics: "" }, (input.Id !== undefined && { id: input.Id }));
                if (input.MetricsConfiguration !== undefined) {
                    contents = serializeAws_restXmlMetricsConfiguration(input.MetricsConfiguration, context);
                    body = '<?xml version="1.0" encoding="UTF-8"?>';
                    contents.addAttribute("xmlns", "http://s3.amazonaws.com/doc/2006-03-01/");
                    body += contents.toString();
                }
                return [4 /*yield*/, context.endpoint()];
            case 1:
                _a = _c.sent(), hostname = _a.hostname, _b = _a.protocol, protocol = _b === void 0 ? "https" : _b, port = _a.port;
                return [2 /*return*/, new __HttpRequest({
                        protocol: protocol,
                        hostname: hostname,
                        port: port,
                        method: "PUT",
                        headers: headers,
                        path: resolvedPath,
                        query: query,
                        body: body,
                    })];
        }
    });
}); };
export var serializeAws_restXmlPutBucketNotificationConfigurationCommand = function (input, context) { return __awaiter(void 0, void 0, void 0, function () {
    var headers, resolvedPath, labelValue, query, body, contents, _a, hostname, _b, protocol, port;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                headers = __assign({ "content-type": "application/xml" }, (isSerializableHeaderValue(input.ExpectedBucketOwner) && {
                    "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
                }));
                resolvedPath = "/{Bucket}";
                if (input.Bucket !== undefined) {
                    labelValue = input.Bucket;
                    if (labelValue.length <= 0) {
                        throw new Error("Empty value provided for input HTTP label: Bucket.");
                    }
                    resolvedPath = resolvedPath.replace("{Bucket}", __extendedEncodeURIComponent(labelValue));
                }
                else {
                    throw new Error("No value provided for input HTTP label: Bucket.");
                }
                query = {
                    notification: "",
                };
                if (input.NotificationConfiguration !== undefined) {
                    contents = serializeAws_restXmlNotificationConfiguration(input.NotificationConfiguration, context);
                    body = '<?xml version="1.0" encoding="UTF-8"?>';
                    contents.addAttribute("xmlns", "http://s3.amazonaws.com/doc/2006-03-01/");
                    body += contents.toString();
                }
                return [4 /*yield*/, context.endpoint()];
            case 1:
                _a = _c.sent(), hostname = _a.hostname, _b = _a.protocol, protocol = _b === void 0 ? "https" : _b, port = _a.port;
                return [2 /*return*/, new __HttpRequest({
                        protocol: protocol,
                        hostname: hostname,
                        port: port,
                        method: "PUT",
                        headers: headers,
                        path: resolvedPath,
                        query: query,
                        body: body,
                    })];
        }
    });
}); };
export var serializeAws_restXmlPutBucketOwnershipControlsCommand = function (input, context) { return __awaiter(void 0, void 0, void 0, function () {
    var headers, resolvedPath, labelValue, query, body, contents, _a, hostname, _b, protocol, port;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                headers = __assign(__assign({ "content-type": "application/xml" }, (isSerializableHeaderValue(input.ContentMD5) && { "Content-MD5": input.ContentMD5 })), (isSerializableHeaderValue(input.ExpectedBucketOwner) && {
                    "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
                }));
                resolvedPath = "/{Bucket}";
                if (input.Bucket !== undefined) {
                    labelValue = input.Bucket;
                    if (labelValue.length <= 0) {
                        throw new Error("Empty value provided for input HTTP label: Bucket.");
                    }
                    resolvedPath = resolvedPath.replace("{Bucket}", __extendedEncodeURIComponent(labelValue));
                }
                else {
                    throw new Error("No value provided for input HTTP label: Bucket.");
                }
                query = {
                    ownershipControls: "",
                };
                if (input.OwnershipControls !== undefined) {
                    contents = serializeAws_restXmlOwnershipControls(input.OwnershipControls, context);
                    body = '<?xml version="1.0" encoding="UTF-8"?>';
                    contents.addAttribute("xmlns", "http://s3.amazonaws.com/doc/2006-03-01/");
                    body += contents.toString();
                }
                return [4 /*yield*/, context.endpoint()];
            case 1:
                _a = _c.sent(), hostname = _a.hostname, _b = _a.protocol, protocol = _b === void 0 ? "https" : _b, port = _a.port;
                return [2 /*return*/, new __HttpRequest({
                        protocol: protocol,
                        hostname: hostname,
                        port: port,
                        method: "PUT",
                        headers: headers,
                        path: resolvedPath,
                        query: query,
                        body: body,
                    })];
        }
    });
}); };
export var serializeAws_restXmlPutBucketPolicyCommand = function (input, context) { return __awaiter(void 0, void 0, void 0, function () {
    var headers, resolvedPath, labelValue, query, body, contents, _a, hostname, _b, protocol, port;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                headers = __assign(__assign(__assign({ "content-type": "text/plain" }, (isSerializableHeaderValue(input.ContentMD5) && { "Content-MD5": input.ContentMD5 })), (isSerializableHeaderValue(input.ConfirmRemoveSelfBucketAccess) && {
                    "x-amz-confirm-remove-self-bucket-access": input.ConfirmRemoveSelfBucketAccess.toString(),
                })), (isSerializableHeaderValue(input.ExpectedBucketOwner) && {
                    "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
                }));
                resolvedPath = "/{Bucket}";
                if (input.Bucket !== undefined) {
                    labelValue = input.Bucket;
                    if (labelValue.length <= 0) {
                        throw new Error("Empty value provided for input HTTP label: Bucket.");
                    }
                    resolvedPath = resolvedPath.replace("{Bucket}", __extendedEncodeURIComponent(labelValue));
                }
                else {
                    throw new Error("No value provided for input HTTP label: Bucket.");
                }
                query = {
                    policy: "",
                };
                if (input.Policy !== undefined) {
                    contents = input.Policy;
                    body = contents;
                }
                return [4 /*yield*/, context.endpoint()];
            case 1:
                _a = _c.sent(), hostname = _a.hostname, _b = _a.protocol, protocol = _b === void 0 ? "https" : _b, port = _a.port;
                return [2 /*return*/, new __HttpRequest({
                        protocol: protocol,
                        hostname: hostname,
                        port: port,
                        method: "PUT",
                        headers: headers,
                        path: resolvedPath,
                        query: query,
                        body: body,
                    })];
        }
    });
}); };
export var serializeAws_restXmlPutBucketReplicationCommand = function (input, context) { return __awaiter(void 0, void 0, void 0, function () {
    var headers, resolvedPath, labelValue, query, body, contents, _a, hostname, _b, protocol, port;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                headers = __assign(__assign(__assign({ "content-type": "application/xml" }, (isSerializableHeaderValue(input.ContentMD5) && { "Content-MD5": input.ContentMD5 })), (isSerializableHeaderValue(input.Token) && { "x-amz-bucket-object-lock-token": input.Token })), (isSerializableHeaderValue(input.ExpectedBucketOwner) && {
                    "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
                }));
                resolvedPath = "/{Bucket}";
                if (input.Bucket !== undefined) {
                    labelValue = input.Bucket;
                    if (labelValue.length <= 0) {
                        throw new Error("Empty value provided for input HTTP label: Bucket.");
                    }
                    resolvedPath = resolvedPath.replace("{Bucket}", __extendedEncodeURIComponent(labelValue));
                }
                else {
                    throw new Error("No value provided for input HTTP label: Bucket.");
                }
                query = {
                    replication: "",
                };
                if (input.ReplicationConfiguration !== undefined) {
                    contents = serializeAws_restXmlReplicationConfiguration(input.ReplicationConfiguration, context);
                    body = '<?xml version="1.0" encoding="UTF-8"?>';
                    contents.addAttribute("xmlns", "http://s3.amazonaws.com/doc/2006-03-01/");
                    body += contents.toString();
                }
                return [4 /*yield*/, context.endpoint()];
            case 1:
                _a = _c.sent(), hostname = _a.hostname, _b = _a.protocol, protocol = _b === void 0 ? "https" : _b, port = _a.port;
                return [2 /*return*/, new __HttpRequest({
                        protocol: protocol,
                        hostname: hostname,
                        port: port,
                        method: "PUT",
                        headers: headers,
                        path: resolvedPath,
                        query: query,
                        body: body,
                    })];
        }
    });
}); };
export var serializeAws_restXmlPutBucketRequestPaymentCommand = function (input, context) { return __awaiter(void 0, void 0, void 0, function () {
    var headers, resolvedPath, labelValue, query, body, contents, _a, hostname, _b, protocol, port;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                headers = __assign(__assign({ "content-type": "application/xml" }, (isSerializableHeaderValue(input.ContentMD5) && { "Content-MD5": input.ContentMD5 })), (isSerializableHeaderValue(input.ExpectedBucketOwner) && {
                    "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
                }));
                resolvedPath = "/{Bucket}";
                if (input.Bucket !== undefined) {
                    labelValue = input.Bucket;
                    if (labelValue.length <= 0) {
                        throw new Error("Empty value provided for input HTTP label: Bucket.");
                    }
                    resolvedPath = resolvedPath.replace("{Bucket}", __extendedEncodeURIComponent(labelValue));
                }
                else {
                    throw new Error("No value provided for input HTTP label: Bucket.");
                }
                query = {
                    requestPayment: "",
                };
                if (input.RequestPaymentConfiguration !== undefined) {
                    contents = serializeAws_restXmlRequestPaymentConfiguration(input.RequestPaymentConfiguration, context);
                    body = '<?xml version="1.0" encoding="UTF-8"?>';
                    contents.addAttribute("xmlns", "http://s3.amazonaws.com/doc/2006-03-01/");
                    body += contents.toString();
                }
                return [4 /*yield*/, context.endpoint()];
            case 1:
                _a = _c.sent(), hostname = _a.hostname, _b = _a.protocol, protocol = _b === void 0 ? "https" : _b, port = _a.port;
                return [2 /*return*/, new __HttpRequest({
                        protocol: protocol,
                        hostname: hostname,
                        port: port,
                        method: "PUT",
                        headers: headers,
                        path: resolvedPath,
                        query: query,
                        body: body,
                    })];
        }
    });
}); };
export var serializeAws_restXmlPutBucketTaggingCommand = function (input, context) { return __awaiter(void 0, void 0, void 0, function () {
    var headers, resolvedPath, labelValue, query, body, contents, _a, hostname, _b, protocol, port;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                headers = __assign(__assign({ "content-type": "application/xml" }, (isSerializableHeaderValue(input.ContentMD5) && { "Content-MD5": input.ContentMD5 })), (isSerializableHeaderValue(input.ExpectedBucketOwner) && {
                    "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
                }));
                resolvedPath = "/{Bucket}";
                if (input.Bucket !== undefined) {
                    labelValue = input.Bucket;
                    if (labelValue.length <= 0) {
                        throw new Error("Empty value provided for input HTTP label: Bucket.");
                    }
                    resolvedPath = resolvedPath.replace("{Bucket}", __extendedEncodeURIComponent(labelValue));
                }
                else {
                    throw new Error("No value provided for input HTTP label: Bucket.");
                }
                query = {
                    tagging: "",
                };
                if (input.Tagging !== undefined) {
                    contents = serializeAws_restXmlTagging(input.Tagging, context);
                    body = '<?xml version="1.0" encoding="UTF-8"?>';
                    contents.addAttribute("xmlns", "http://s3.amazonaws.com/doc/2006-03-01/");
                    body += contents.toString();
                }
                return [4 /*yield*/, context.endpoint()];
            case 1:
                _a = _c.sent(), hostname = _a.hostname, _b = _a.protocol, protocol = _b === void 0 ? "https" : _b, port = _a.port;
                return [2 /*return*/, new __HttpRequest({
                        protocol: protocol,
                        hostname: hostname,
                        port: port,
                        method: "PUT",
                        headers: headers,
                        path: resolvedPath,
                        query: query,
                        body: body,
                    })];
        }
    });
}); };
export var serializeAws_restXmlPutBucketVersioningCommand = function (input, context) { return __awaiter(void 0, void 0, void 0, function () {
    var headers, resolvedPath, labelValue, query, body, contents, _a, hostname, _b, protocol, port;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                headers = __assign(__assign(__assign({ "content-type": "application/xml" }, (isSerializableHeaderValue(input.ContentMD5) && { "Content-MD5": input.ContentMD5 })), (isSerializableHeaderValue(input.MFA) && { "x-amz-mfa": input.MFA })), (isSerializableHeaderValue(input.ExpectedBucketOwner) && {
                    "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
                }));
                resolvedPath = "/{Bucket}";
                if (input.Bucket !== undefined) {
                    labelValue = input.Bucket;
                    if (labelValue.length <= 0) {
                        throw new Error("Empty value provided for input HTTP label: Bucket.");
                    }
                    resolvedPath = resolvedPath.replace("{Bucket}", __extendedEncodeURIComponent(labelValue));
                }
                else {
                    throw new Error("No value provided for input HTTP label: Bucket.");
                }
                query = {
                    versioning: "",
                };
                if (input.VersioningConfiguration !== undefined) {
                    contents = serializeAws_restXmlVersioningConfiguration(input.VersioningConfiguration, context);
                    body = '<?xml version="1.0" encoding="UTF-8"?>';
                    contents.addAttribute("xmlns", "http://s3.amazonaws.com/doc/2006-03-01/");
                    body += contents.toString();
                }
                return [4 /*yield*/, context.endpoint()];
            case 1:
                _a = _c.sent(), hostname = _a.hostname, _b = _a.protocol, protocol = _b === void 0 ? "https" : _b, port = _a.port;
                return [2 /*return*/, new __HttpRequest({
                        protocol: protocol,
                        hostname: hostname,
                        port: port,
                        method: "PUT",
                        headers: headers,
                        path: resolvedPath,
                        query: query,
                        body: body,
                    })];
        }
    });
}); };
export var serializeAws_restXmlPutBucketWebsiteCommand = function (input, context) { return __awaiter(void 0, void 0, void 0, function () {
    var headers, resolvedPath, labelValue, query, body, contents, _a, hostname, _b, protocol, port;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                headers = __assign(__assign({ "content-type": "application/xml" }, (isSerializableHeaderValue(input.ContentMD5) && { "Content-MD5": input.ContentMD5 })), (isSerializableHeaderValue(input.ExpectedBucketOwner) && {
                    "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
                }));
                resolvedPath = "/{Bucket}";
                if (input.Bucket !== undefined) {
                    labelValue = input.Bucket;
                    if (labelValue.length <= 0) {
                        throw new Error("Empty value provided for input HTTP label: Bucket.");
                    }
                    resolvedPath = resolvedPath.replace("{Bucket}", __extendedEncodeURIComponent(labelValue));
                }
                else {
                    throw new Error("No value provided for input HTTP label: Bucket.");
                }
                query = {
                    website: "",
                };
                if (input.WebsiteConfiguration !== undefined) {
                    contents = serializeAws_restXmlWebsiteConfiguration(input.WebsiteConfiguration, context);
                    body = '<?xml version="1.0" encoding="UTF-8"?>';
                    contents.addAttribute("xmlns", "http://s3.amazonaws.com/doc/2006-03-01/");
                    body += contents.toString();
                }
                return [4 /*yield*/, context.endpoint()];
            case 1:
                _a = _c.sent(), hostname = _a.hostname, _b = _a.protocol, protocol = _b === void 0 ? "https" : _b, port = _a.port;
                return [2 /*return*/, new __HttpRequest({
                        protocol: protocol,
                        hostname: hostname,
                        port: port,
                        method: "PUT",
                        headers: headers,
                        path: resolvedPath,
                        query: query,
                        body: body,
                    })];
        }
    });
}); };
export var serializeAws_restXmlPutObjectCommand = function (input, context) { return __awaiter(void 0, void 0, void 0, function () {
    var headers, resolvedPath, labelValue, labelValue, query, body, contents, _a, hostname, _b, protocol, port;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                headers = __assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign({ "content-type": "application/octet-stream" }, (isSerializableHeaderValue(input.ACL) && { "x-amz-acl": input.ACL })), (isSerializableHeaderValue(input.CacheControl) && { "Cache-Control": input.CacheControl })), (isSerializableHeaderValue(input.ContentDisposition) && { "Content-Disposition": input.ContentDisposition })), (isSerializableHeaderValue(input.ContentEncoding) && { "Content-Encoding": input.ContentEncoding })), (isSerializableHeaderValue(input.ContentLanguage) && { "Content-Language": input.ContentLanguage })), (isSerializableHeaderValue(input.ContentLength) && { "Content-Length": input.ContentLength.toString() })), (isSerializableHeaderValue(input.ContentMD5) && { "Content-MD5": input.ContentMD5 })), (isSerializableHeaderValue(input.ContentType) && { "Content-Type": input.ContentType })), (isSerializableHeaderValue(input.Expires) && { Expires: __dateToUtcString(input.Expires).toString() })), (isSerializableHeaderValue(input.GrantFullControl) && { "x-amz-grant-full-control": input.GrantFullControl })), (isSerializableHeaderValue(input.GrantRead) && { "x-amz-grant-read": input.GrantRead })), (isSerializableHeaderValue(input.GrantReadACP) && { "x-amz-grant-read-acp": input.GrantReadACP })), (isSerializableHeaderValue(input.GrantWriteACP) && { "x-amz-grant-write-acp": input.GrantWriteACP })), (isSerializableHeaderValue(input.ServerSideEncryption) && {
                    "x-amz-server-side-encryption": input.ServerSideEncryption,
                })), (isSerializableHeaderValue(input.StorageClass) && { "x-amz-storage-class": input.StorageClass })), (isSerializableHeaderValue(input.WebsiteRedirectLocation) && {
                    "x-amz-website-redirect-location": input.WebsiteRedirectLocation,
                })), (isSerializableHeaderValue(input.SSECustomerAlgorithm) && {
                    "x-amz-server-side-encryption-customer-algorithm": input.SSECustomerAlgorithm,
                })), (isSerializableHeaderValue(input.SSECustomerKey) && {
                    "x-amz-server-side-encryption-customer-key": input.SSECustomerKey,
                })), (isSerializableHeaderValue(input.SSECustomerKeyMD5) && {
                    "x-amz-server-side-encryption-customer-key-MD5": input.SSECustomerKeyMD5,
                })), (isSerializableHeaderValue(input.SSEKMSKeyId) && {
                    "x-amz-server-side-encryption-aws-kms-key-id": input.SSEKMSKeyId,
                })), (isSerializableHeaderValue(input.SSEKMSEncryptionContext) && {
                    "x-amz-server-side-encryption-context": input.SSEKMSEncryptionContext,
                })), (isSerializableHeaderValue(input.BucketKeyEnabled) && {
                    "x-amz-server-side-encryption-bucket-key-enabled": input.BucketKeyEnabled.toString(),
                })), (isSerializableHeaderValue(input.RequestPayer) && { "x-amz-request-payer": input.RequestPayer })), (isSerializableHeaderValue(input.Tagging) && { "x-amz-tagging": input.Tagging })), (isSerializableHeaderValue(input.ObjectLockMode) && { "x-amz-object-lock-mode": input.ObjectLockMode })), (isSerializableHeaderValue(input.ObjectLockRetainUntilDate) && {
                    "x-amz-object-lock-retain-until-date": (input.ObjectLockRetainUntilDate.toISOString().split(".")[0] + "Z").toString(),
                })), (isSerializableHeaderValue(input.ObjectLockLegalHoldStatus) && {
                    "x-amz-object-lock-legal-hold": input.ObjectLockLegalHoldStatus,
                })), (isSerializableHeaderValue(input.ExpectedBucketOwner) && {
                    "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
                })), (input.Metadata !== undefined &&
                    Object.keys(input.Metadata).reduce(function (acc, suffix) {
                        acc["x-amz-meta-" + suffix] = input.Metadata[suffix];
                        return acc;
                    }, {})));
                resolvedPath = "/{Bucket}/{Key+}";
                if (input.Bucket !== undefined) {
                    labelValue = input.Bucket;
                    if (labelValue.length <= 0) {
                        throw new Error("Empty value provided for input HTTP label: Bucket.");
                    }
                    resolvedPath = resolvedPath.replace("{Bucket}", __extendedEncodeURIComponent(labelValue));
                }
                else {
                    throw new Error("No value provided for input HTTP label: Bucket.");
                }
                if (input.Key !== undefined) {
                    labelValue = input.Key;
                    if (labelValue.length <= 0) {
                        throw new Error("Empty value provided for input HTTP label: Key.");
                    }
                    resolvedPath = resolvedPath.replace("{Key+}", labelValue
                        .split("/")
                        .map(function (segment) { return __extendedEncodeURIComponent(segment); })
                        .join("/"));
                }
                else {
                    throw new Error("No value provided for input HTTP label: Key.");
                }
                query = {
                    "x-id": "PutObject",
                };
                if (input.Body !== undefined) {
                    contents = input.Body;
                    body = contents;
                }
                return [4 /*yield*/, context.endpoint()];
            case 1:
                _a = _c.sent(), hostname = _a.hostname, _b = _a.protocol, protocol = _b === void 0 ? "https" : _b, port = _a.port;
                return [2 /*return*/, new __HttpRequest({
                        protocol: protocol,
                        hostname: hostname,
                        port: port,
                        method: "PUT",
                        headers: headers,
                        path: resolvedPath,
                        query: query,
                        body: body,
                    })];
        }
    });
}); };
export var serializeAws_restXmlPutObjectAclCommand = function (input, context) { return __awaiter(void 0, void 0, void 0, function () {
    var headers, resolvedPath, labelValue, labelValue, query, body, contents, _a, hostname, _b, protocol, port;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                headers = __assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign({ "content-type": "application/xml" }, (isSerializableHeaderValue(input.ACL) && { "x-amz-acl": input.ACL })), (isSerializableHeaderValue(input.ContentMD5) && { "Content-MD5": input.ContentMD5 })), (isSerializableHeaderValue(input.GrantFullControl) && { "x-amz-grant-full-control": input.GrantFullControl })), (isSerializableHeaderValue(input.GrantRead) && { "x-amz-grant-read": input.GrantRead })), (isSerializableHeaderValue(input.GrantReadACP) && { "x-amz-grant-read-acp": input.GrantReadACP })), (isSerializableHeaderValue(input.GrantWrite) && { "x-amz-grant-write": input.GrantWrite })), (isSerializableHeaderValue(input.GrantWriteACP) && { "x-amz-grant-write-acp": input.GrantWriteACP })), (isSerializableHeaderValue(input.RequestPayer) && { "x-amz-request-payer": input.RequestPayer })), (isSerializableHeaderValue(input.ExpectedBucketOwner) && {
                    "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
                }));
                resolvedPath = "/{Bucket}/{Key+}";
                if (input.Bucket !== undefined) {
                    labelValue = input.Bucket;
                    if (labelValue.length <= 0) {
                        throw new Error("Empty value provided for input HTTP label: Bucket.");
                    }
                    resolvedPath = resolvedPath.replace("{Bucket}", __extendedEncodeURIComponent(labelValue));
                }
                else {
                    throw new Error("No value provided for input HTTP label: Bucket.");
                }
                if (input.Key !== undefined) {
                    labelValue = input.Key;
                    if (labelValue.length <= 0) {
                        throw new Error("Empty value provided for input HTTP label: Key.");
                    }
                    resolvedPath = resolvedPath.replace("{Key+}", labelValue
                        .split("/")
                        .map(function (segment) { return __extendedEncodeURIComponent(segment); })
                        .join("/"));
                }
                else {
                    throw new Error("No value provided for input HTTP label: Key.");
                }
                query = __assign({ acl: "" }, (input.VersionId !== undefined && { versionId: input.VersionId }));
                if (input.AccessControlPolicy !== undefined) {
                    contents = serializeAws_restXmlAccessControlPolicy(input.AccessControlPolicy, context);
                    body = '<?xml version="1.0" encoding="UTF-8"?>';
                    contents.addAttribute("xmlns", "http://s3.amazonaws.com/doc/2006-03-01/");
                    body += contents.toString();
                }
                return [4 /*yield*/, context.endpoint()];
            case 1:
                _a = _c.sent(), hostname = _a.hostname, _b = _a.protocol, protocol = _b === void 0 ? "https" : _b, port = _a.port;
                return [2 /*return*/, new __HttpRequest({
                        protocol: protocol,
                        hostname: hostname,
                        port: port,
                        method: "PUT",
                        headers: headers,
                        path: resolvedPath,
                        query: query,
                        body: body,
                    })];
        }
    });
}); };
export var serializeAws_restXmlPutObjectLegalHoldCommand = function (input, context) { return __awaiter(void 0, void 0, void 0, function () {
    var headers, resolvedPath, labelValue, labelValue, query, body, contents, _a, hostname, _b, protocol, port;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                headers = __assign(__assign(__assign({ "content-type": "application/xml" }, (isSerializableHeaderValue(input.RequestPayer) && { "x-amz-request-payer": input.RequestPayer })), (isSerializableHeaderValue(input.ContentMD5) && { "Content-MD5": input.ContentMD5 })), (isSerializableHeaderValue(input.ExpectedBucketOwner) && {
                    "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
                }));
                resolvedPath = "/{Bucket}/{Key+}";
                if (input.Bucket !== undefined) {
                    labelValue = input.Bucket;
                    if (labelValue.length <= 0) {
                        throw new Error("Empty value provided for input HTTP label: Bucket.");
                    }
                    resolvedPath = resolvedPath.replace("{Bucket}", __extendedEncodeURIComponent(labelValue));
                }
                else {
                    throw new Error("No value provided for input HTTP label: Bucket.");
                }
                if (input.Key !== undefined) {
                    labelValue = input.Key;
                    if (labelValue.length <= 0) {
                        throw new Error("Empty value provided for input HTTP label: Key.");
                    }
                    resolvedPath = resolvedPath.replace("{Key+}", labelValue
                        .split("/")
                        .map(function (segment) { return __extendedEncodeURIComponent(segment); })
                        .join("/"));
                }
                else {
                    throw new Error("No value provided for input HTTP label: Key.");
                }
                query = __assign({ "legal-hold": "" }, (input.VersionId !== undefined && { versionId: input.VersionId }));
                if (input.LegalHold !== undefined) {
                    contents = serializeAws_restXmlObjectLockLegalHold(input.LegalHold, context);
                    body = '<?xml version="1.0" encoding="UTF-8"?>';
                    contents.addAttribute("xmlns", "http://s3.amazonaws.com/doc/2006-03-01/");
                    body += contents.toString();
                }
                return [4 /*yield*/, context.endpoint()];
            case 1:
                _a = _c.sent(), hostname = _a.hostname, _b = _a.protocol, protocol = _b === void 0 ? "https" : _b, port = _a.port;
                return [2 /*return*/, new __HttpRequest({
                        protocol: protocol,
                        hostname: hostname,
                        port: port,
                        method: "PUT",
                        headers: headers,
                        path: resolvedPath,
                        query: query,
                        body: body,
                    })];
        }
    });
}); };
export var serializeAws_restXmlPutObjectLockConfigurationCommand = function (input, context) { return __awaiter(void 0, void 0, void 0, function () {
    var headers, resolvedPath, labelValue, query, body, contents, _a, hostname, _b, protocol, port;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                headers = __assign(__assign(__assign(__assign({ "content-type": "application/xml" }, (isSerializableHeaderValue(input.RequestPayer) && { "x-amz-request-payer": input.RequestPayer })), (isSerializableHeaderValue(input.Token) && { "x-amz-bucket-object-lock-token": input.Token })), (isSerializableHeaderValue(input.ContentMD5) && { "Content-MD5": input.ContentMD5 })), (isSerializableHeaderValue(input.ExpectedBucketOwner) && {
                    "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
                }));
                resolvedPath = "/{Bucket}";
                if (input.Bucket !== undefined) {
                    labelValue = input.Bucket;
                    if (labelValue.length <= 0) {
                        throw new Error("Empty value provided for input HTTP label: Bucket.");
                    }
                    resolvedPath = resolvedPath.replace("{Bucket}", __extendedEncodeURIComponent(labelValue));
                }
                else {
                    throw new Error("No value provided for input HTTP label: Bucket.");
                }
                query = {
                    "object-lock": "",
                };
                if (input.ObjectLockConfiguration !== undefined) {
                    contents = serializeAws_restXmlObjectLockConfiguration(input.ObjectLockConfiguration, context);
                    body = '<?xml version="1.0" encoding="UTF-8"?>';
                    contents.addAttribute("xmlns", "http://s3.amazonaws.com/doc/2006-03-01/");
                    body += contents.toString();
                }
                return [4 /*yield*/, context.endpoint()];
            case 1:
                _a = _c.sent(), hostname = _a.hostname, _b = _a.protocol, protocol = _b === void 0 ? "https" : _b, port = _a.port;
                return [2 /*return*/, new __HttpRequest({
                        protocol: protocol,
                        hostname: hostname,
                        port: port,
                        method: "PUT",
                        headers: headers,
                        path: resolvedPath,
                        query: query,
                        body: body,
                    })];
        }
    });
}); };
export var serializeAws_restXmlPutObjectRetentionCommand = function (input, context) { return __awaiter(void 0, void 0, void 0, function () {
    var headers, resolvedPath, labelValue, labelValue, query, body, contents, _a, hostname, _b, protocol, port;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                headers = __assign(__assign(__assign(__assign({ "content-type": "application/xml" }, (isSerializableHeaderValue(input.RequestPayer) && { "x-amz-request-payer": input.RequestPayer })), (isSerializableHeaderValue(input.BypassGovernanceRetention) && {
                    "x-amz-bypass-governance-retention": input.BypassGovernanceRetention.toString(),
                })), (isSerializableHeaderValue(input.ContentMD5) && { "Content-MD5": input.ContentMD5 })), (isSerializableHeaderValue(input.ExpectedBucketOwner) && {
                    "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
                }));
                resolvedPath = "/{Bucket}/{Key+}";
                if (input.Bucket !== undefined) {
                    labelValue = input.Bucket;
                    if (labelValue.length <= 0) {
                        throw new Error("Empty value provided for input HTTP label: Bucket.");
                    }
                    resolvedPath = resolvedPath.replace("{Bucket}", __extendedEncodeURIComponent(labelValue));
                }
                else {
                    throw new Error("No value provided for input HTTP label: Bucket.");
                }
                if (input.Key !== undefined) {
                    labelValue = input.Key;
                    if (labelValue.length <= 0) {
                        throw new Error("Empty value provided for input HTTP label: Key.");
                    }
                    resolvedPath = resolvedPath.replace("{Key+}", labelValue
                        .split("/")
                        .map(function (segment) { return __extendedEncodeURIComponent(segment); })
                        .join("/"));
                }
                else {
                    throw new Error("No value provided for input HTTP label: Key.");
                }
                query = __assign({ retention: "" }, (input.VersionId !== undefined && { versionId: input.VersionId }));
                if (input.Retention !== undefined) {
                    contents = serializeAws_restXmlObjectLockRetention(input.Retention, context);
                    body = '<?xml version="1.0" encoding="UTF-8"?>';
                    contents.addAttribute("xmlns", "http://s3.amazonaws.com/doc/2006-03-01/");
                    body += contents.toString();
                }
                return [4 /*yield*/, context.endpoint()];
            case 1:
                _a = _c.sent(), hostname = _a.hostname, _b = _a.protocol, protocol = _b === void 0 ? "https" : _b, port = _a.port;
                return [2 /*return*/, new __HttpRequest({
                        protocol: protocol,
                        hostname: hostname,
                        port: port,
                        method: "PUT",
                        headers: headers,
                        path: resolvedPath,
                        query: query,
                        body: body,
                    })];
        }
    });
}); };
export var serializeAws_restXmlPutObjectTaggingCommand = function (input, context) { return __awaiter(void 0, void 0, void 0, function () {
    var headers, resolvedPath, labelValue, labelValue, query, body, contents, _a, hostname, _b, protocol, port;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                headers = __assign(__assign({ "content-type": "application/xml" }, (isSerializableHeaderValue(input.ContentMD5) && { "Content-MD5": input.ContentMD5 })), (isSerializableHeaderValue(input.ExpectedBucketOwner) && {
                    "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
                }));
                resolvedPath = "/{Bucket}/{Key+}";
                if (input.Bucket !== undefined) {
                    labelValue = input.Bucket;
                    if (labelValue.length <= 0) {
                        throw new Error("Empty value provided for input HTTP label: Bucket.");
                    }
                    resolvedPath = resolvedPath.replace("{Bucket}", __extendedEncodeURIComponent(labelValue));
                }
                else {
                    throw new Error("No value provided for input HTTP label: Bucket.");
                }
                if (input.Key !== undefined) {
                    labelValue = input.Key;
                    if (labelValue.length <= 0) {
                        throw new Error("Empty value provided for input HTTP label: Key.");
                    }
                    resolvedPath = resolvedPath.replace("{Key+}", labelValue
                        .split("/")
                        .map(function (segment) { return __extendedEncodeURIComponent(segment); })
                        .join("/"));
                }
                else {
                    throw new Error("No value provided for input HTTP label: Key.");
                }
                query = __assign({ tagging: "" }, (input.VersionId !== undefined && { versionId: input.VersionId }));
                if (input.Tagging !== undefined) {
                    contents = serializeAws_restXmlTagging(input.Tagging, context);
                    body = '<?xml version="1.0" encoding="UTF-8"?>';
                    contents.addAttribute("xmlns", "http://s3.amazonaws.com/doc/2006-03-01/");
                    body += contents.toString();
                }
                return [4 /*yield*/, context.endpoint()];
            case 1:
                _a = _c.sent(), hostname = _a.hostname, _b = _a.protocol, protocol = _b === void 0 ? "https" : _b, port = _a.port;
                return [2 /*return*/, new __HttpRequest({
                        protocol: protocol,
                        hostname: hostname,
                        port: port,
                        method: "PUT",
                        headers: headers,
                        path: resolvedPath,
                        query: query,
                        body: body,
                    })];
        }
    });
}); };
export var serializeAws_restXmlPutPublicAccessBlockCommand = function (input, context) { return __awaiter(void 0, void 0, void 0, function () {
    var headers, resolvedPath, labelValue, query, body, contents, _a, hostname, _b, protocol, port;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                headers = __assign(__assign({ "content-type": "application/xml" }, (isSerializableHeaderValue(input.ContentMD5) && { "Content-MD5": input.ContentMD5 })), (isSerializableHeaderValue(input.ExpectedBucketOwner) && {
                    "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
                }));
                resolvedPath = "/{Bucket}";
                if (input.Bucket !== undefined) {
                    labelValue = input.Bucket;
                    if (labelValue.length <= 0) {
                        throw new Error("Empty value provided for input HTTP label: Bucket.");
                    }
                    resolvedPath = resolvedPath.replace("{Bucket}", __extendedEncodeURIComponent(labelValue));
                }
                else {
                    throw new Error("No value provided for input HTTP label: Bucket.");
                }
                query = {
                    publicAccessBlock: "",
                };
                if (input.PublicAccessBlockConfiguration !== undefined) {
                    contents = serializeAws_restXmlPublicAccessBlockConfiguration(input.PublicAccessBlockConfiguration, context);
                    body = '<?xml version="1.0" encoding="UTF-8"?>';
                    contents.addAttribute("xmlns", "http://s3.amazonaws.com/doc/2006-03-01/");
                    body += contents.toString();
                }
                return [4 /*yield*/, context.endpoint()];
            case 1:
                _a = _c.sent(), hostname = _a.hostname, _b = _a.protocol, protocol = _b === void 0 ? "https" : _b, port = _a.port;
                return [2 /*return*/, new __HttpRequest({
                        protocol: protocol,
                        hostname: hostname,
                        port: port,
                        method: "PUT",
                        headers: headers,
                        path: resolvedPath,
                        query: query,
                        body: body,
                    })];
        }
    });
}); };
export var serializeAws_restXmlRestoreObjectCommand = function (input, context) { return __awaiter(void 0, void 0, void 0, function () {
    var headers, resolvedPath, labelValue, labelValue, query, body, contents, _a, hostname, _b, protocol, port;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                headers = __assign(__assign({ "content-type": "application/xml" }, (isSerializableHeaderValue(input.RequestPayer) && { "x-amz-request-payer": input.RequestPayer })), (isSerializableHeaderValue(input.ExpectedBucketOwner) && {
                    "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
                }));
                resolvedPath = "/{Bucket}/{Key+}";
                if (input.Bucket !== undefined) {
                    labelValue = input.Bucket;
                    if (labelValue.length <= 0) {
                        throw new Error("Empty value provided for input HTTP label: Bucket.");
                    }
                    resolvedPath = resolvedPath.replace("{Bucket}", __extendedEncodeURIComponent(labelValue));
                }
                else {
                    throw new Error("No value provided for input HTTP label: Bucket.");
                }
                if (input.Key !== undefined) {
                    labelValue = input.Key;
                    if (labelValue.length <= 0) {
                        throw new Error("Empty value provided for input HTTP label: Key.");
                    }
                    resolvedPath = resolvedPath.replace("{Key+}", labelValue
                        .split("/")
                        .map(function (segment) { return __extendedEncodeURIComponent(segment); })
                        .join("/"));
                }
                else {
                    throw new Error("No value provided for input HTTP label: Key.");
                }
                query = __assign({ restore: "" }, (input.VersionId !== undefined && { versionId: input.VersionId }));
                if (input.RestoreRequest !== undefined) {
                    contents = serializeAws_restXmlRestoreRequest(input.RestoreRequest, context);
                    body = '<?xml version="1.0" encoding="UTF-8"?>';
                    contents.addAttribute("xmlns", "http://s3.amazonaws.com/doc/2006-03-01/");
                    body += contents.toString();
                }
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
                        query: query,
                        body: body,
                    })];
        }
    });
}); };
export var serializeAws_restXmlSelectObjectContentCommand = function (input, context) { return __awaiter(void 0, void 0, void 0, function () {
    var headers, resolvedPath, labelValue, labelValue, query, body, bodyNode, node, node, node, node, node, node, _a, hostname, _b, protocol, port;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                headers = __assign(__assign(__assign(__assign({ "content-type": "application/xml" }, (isSerializableHeaderValue(input.SSECustomerAlgorithm) && {
                    "x-amz-server-side-encryption-customer-algorithm": input.SSECustomerAlgorithm,
                })), (isSerializableHeaderValue(input.SSECustomerKey) && {
                    "x-amz-server-side-encryption-customer-key": input.SSECustomerKey,
                })), (isSerializableHeaderValue(input.SSECustomerKeyMD5) && {
                    "x-amz-server-side-encryption-customer-key-MD5": input.SSECustomerKeyMD5,
                })), (isSerializableHeaderValue(input.ExpectedBucketOwner) && {
                    "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
                }));
                resolvedPath = "/{Bucket}/{Key+}";
                if (input.Bucket !== undefined) {
                    labelValue = input.Bucket;
                    if (labelValue.length <= 0) {
                        throw new Error("Empty value provided for input HTTP label: Bucket.");
                    }
                    resolvedPath = resolvedPath.replace("{Bucket}", __extendedEncodeURIComponent(labelValue));
                }
                else {
                    throw new Error("No value provided for input HTTP label: Bucket.");
                }
                if (input.Key !== undefined) {
                    labelValue = input.Key;
                    if (labelValue.length <= 0) {
                        throw new Error("Empty value provided for input HTTP label: Key.");
                    }
                    resolvedPath = resolvedPath.replace("{Key+}", labelValue
                        .split("/")
                        .map(function (segment) { return __extendedEncodeURIComponent(segment); })
                        .join("/"));
                }
                else {
                    throw new Error("No value provided for input HTTP label: Key.");
                }
                query = {
                    select: "",
                    "select-type": "2",
                };
                body = '<?xml version="1.0" encoding="UTF-8"?>';
                bodyNode = new __XmlNode("SelectObjectContentRequest");
                bodyNode.addAttribute("xmlns", "http://s3.amazonaws.com/doc/2006-03-01/");
                if (input.Expression !== undefined) {
                    node = new __XmlNode("Expression").addChildNode(new __XmlText(input.Expression)).withName("Expression");
                    bodyNode.addChildNode(node);
                }
                if (input.ExpressionType !== undefined) {
                    node = new __XmlNode("ExpressionType")
                        .addChildNode(new __XmlText(input.ExpressionType))
                        .withName("ExpressionType");
                    bodyNode.addChildNode(node);
                }
                if (input.InputSerialization !== undefined) {
                    node = serializeAws_restXmlInputSerialization(input.InputSerialization, context).withName("InputSerialization");
                    bodyNode.addChildNode(node);
                }
                if (input.OutputSerialization !== undefined) {
                    node = serializeAws_restXmlOutputSerialization(input.OutputSerialization, context).withName("OutputSerialization");
                    bodyNode.addChildNode(node);
                }
                if (input.RequestProgress !== undefined) {
                    node = serializeAws_restXmlRequestProgress(input.RequestProgress, context).withName("RequestProgress");
                    bodyNode.addChildNode(node);
                }
                if (input.ScanRange !== undefined) {
                    node = serializeAws_restXmlScanRange(input.ScanRange, context).withName("ScanRange");
                    bodyNode.addChildNode(node);
                }
                body += bodyNode.toString();
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
                        query: query,
                        body: body,
                    })];
        }
    });
}); };
export var serializeAws_restXmlUploadPartCommand = function (input, context) { return __awaiter(void 0, void 0, void 0, function () {
    var headers, resolvedPath, labelValue, labelValue, query, body, contents, _a, hostname, _b, protocol, port;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                headers = __assign(__assign(__assign(__assign(__assign(__assign(__assign({ "content-type": "application/octet-stream" }, (isSerializableHeaderValue(input.ContentLength) && { "Content-Length": input.ContentLength.toString() })), (isSerializableHeaderValue(input.ContentMD5) && { "Content-MD5": input.ContentMD5 })), (isSerializableHeaderValue(input.SSECustomerAlgorithm) && {
                    "x-amz-server-side-encryption-customer-algorithm": input.SSECustomerAlgorithm,
                })), (isSerializableHeaderValue(input.SSECustomerKey) && {
                    "x-amz-server-side-encryption-customer-key": input.SSECustomerKey,
                })), (isSerializableHeaderValue(input.SSECustomerKeyMD5) && {
                    "x-amz-server-side-encryption-customer-key-MD5": input.SSECustomerKeyMD5,
                })), (isSerializableHeaderValue(input.RequestPayer) && { "x-amz-request-payer": input.RequestPayer })), (isSerializableHeaderValue(input.ExpectedBucketOwner) && {
                    "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
                }));
                resolvedPath = "/{Bucket}/{Key+}";
                if (input.Bucket !== undefined) {
                    labelValue = input.Bucket;
                    if (labelValue.length <= 0) {
                        throw new Error("Empty value provided for input HTTP label: Bucket.");
                    }
                    resolvedPath = resolvedPath.replace("{Bucket}", __extendedEncodeURIComponent(labelValue));
                }
                else {
                    throw new Error("No value provided for input HTTP label: Bucket.");
                }
                if (input.Key !== undefined) {
                    labelValue = input.Key;
                    if (labelValue.length <= 0) {
                        throw new Error("Empty value provided for input HTTP label: Key.");
                    }
                    resolvedPath = resolvedPath.replace("{Key+}", labelValue
                        .split("/")
                        .map(function (segment) { return __extendedEncodeURIComponent(segment); })
                        .join("/"));
                }
                else {
                    throw new Error("No value provided for input HTTP label: Key.");
                }
                query = __assign(__assign({ "x-id": "UploadPart" }, (input.PartNumber !== undefined && { partNumber: input.PartNumber.toString() })), (input.UploadId !== undefined && { uploadId: input.UploadId }));
                if (input.Body !== undefined) {
                    contents = input.Body;
                    body = contents;
                }
                return [4 /*yield*/, context.endpoint()];
            case 1:
                _a = _c.sent(), hostname = _a.hostname, _b = _a.protocol, protocol = _b === void 0 ? "https" : _b, port = _a.port;
                return [2 /*return*/, new __HttpRequest({
                        protocol: protocol,
                        hostname: hostname,
                        port: port,
                        method: "PUT",
                        headers: headers,
                        path: resolvedPath,
                        query: query,
                        body: body,
                    })];
        }
    });
}); };
export var serializeAws_restXmlUploadPartCopyCommand = function (input, context) { return __awaiter(void 0, void 0, void 0, function () {
    var headers, resolvedPath, labelValue, labelValue, query, body, _a, hostname, _b, protocol, port;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                headers = __assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign({}, (isSerializableHeaderValue(input.CopySource) && { "x-amz-copy-source": input.CopySource })), (isSerializableHeaderValue(input.CopySourceIfMatch) && {
                    "x-amz-copy-source-if-match": input.CopySourceIfMatch,
                })), (isSerializableHeaderValue(input.CopySourceIfModifiedSince) && {
                    "x-amz-copy-source-if-modified-since": __dateToUtcString(input.CopySourceIfModifiedSince).toString(),
                })), (isSerializableHeaderValue(input.CopySourceIfNoneMatch) && {
                    "x-amz-copy-source-if-none-match": input.CopySourceIfNoneMatch,
                })), (isSerializableHeaderValue(input.CopySourceIfUnmodifiedSince) && {
                    "x-amz-copy-source-if-unmodified-since": __dateToUtcString(input.CopySourceIfUnmodifiedSince).toString(),
                })), (isSerializableHeaderValue(input.CopySourceRange) && { "x-amz-copy-source-range": input.CopySourceRange })), (isSerializableHeaderValue(input.SSECustomerAlgorithm) && {
                    "x-amz-server-side-encryption-customer-algorithm": input.SSECustomerAlgorithm,
                })), (isSerializableHeaderValue(input.SSECustomerKey) && {
                    "x-amz-server-side-encryption-customer-key": input.SSECustomerKey,
                })), (isSerializableHeaderValue(input.SSECustomerKeyMD5) && {
                    "x-amz-server-side-encryption-customer-key-MD5": input.SSECustomerKeyMD5,
                })), (isSerializableHeaderValue(input.CopySourceSSECustomerAlgorithm) && {
                    "x-amz-copy-source-server-side-encryption-customer-algorithm": input.CopySourceSSECustomerAlgorithm,
                })), (isSerializableHeaderValue(input.CopySourceSSECustomerKey) && {
                    "x-amz-copy-source-server-side-encryption-customer-key": input.CopySourceSSECustomerKey,
                })), (isSerializableHeaderValue(input.CopySourceSSECustomerKeyMD5) && {
                    "x-amz-copy-source-server-side-encryption-customer-key-MD5": input.CopySourceSSECustomerKeyMD5,
                })), (isSerializableHeaderValue(input.RequestPayer) && { "x-amz-request-payer": input.RequestPayer })), (isSerializableHeaderValue(input.ExpectedBucketOwner) && {
                    "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
                })), (isSerializableHeaderValue(input.ExpectedSourceBucketOwner) && {
                    "x-amz-source-expected-bucket-owner": input.ExpectedSourceBucketOwner,
                }));
                resolvedPath = "/{Bucket}/{Key+}";
                if (input.Bucket !== undefined) {
                    labelValue = input.Bucket;
                    if (labelValue.length <= 0) {
                        throw new Error("Empty value provided for input HTTP label: Bucket.");
                    }
                    resolvedPath = resolvedPath.replace("{Bucket}", __extendedEncodeURIComponent(labelValue));
                }
                else {
                    throw new Error("No value provided for input HTTP label: Bucket.");
                }
                if (input.Key !== undefined) {
                    labelValue = input.Key;
                    if (labelValue.length <= 0) {
                        throw new Error("Empty value provided for input HTTP label: Key.");
                    }
                    resolvedPath = resolvedPath.replace("{Key+}", labelValue
                        .split("/")
                        .map(function (segment) { return __extendedEncodeURIComponent(segment); })
                        .join("/"));
                }
                else {
                    throw new Error("No value provided for input HTTP label: Key.");
                }
                query = __assign(__assign({ "x-id": "UploadPartCopy" }, (input.PartNumber !== undefined && { partNumber: input.PartNumber.toString() })), (input.UploadId !== undefined && { uploadId: input.UploadId }));
                return [4 /*yield*/, context.endpoint()];
            case 1:
                _a = _c.sent(), hostname = _a.hostname, _b = _a.protocol, protocol = _b === void 0 ? "https" : _b, port = _a.port;
                return [2 /*return*/, new __HttpRequest({
                        protocol: protocol,
                        hostname: hostname,
                        port: port,
                        method: "PUT",
                        headers: headers,
                        path: resolvedPath,
                        query: query,
                        body: body,
                    })];
        }
    });
}); };
export var deserializeAws_restXmlAbortMultipartUploadCommand = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var contents;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (output.statusCode !== 204 && output.statusCode >= 300) {
                    return [2 /*return*/, deserializeAws_restXmlAbortMultipartUploadCommandError(output, context)];
                }
                contents = {
                    $metadata: deserializeMetadata(output),
                    RequestCharged: undefined,
                };
                if (output.headers["x-amz-request-charged"] !== undefined) {
                    contents.RequestCharged = output.headers["x-amz-request-charged"];
                }
                return [4 /*yield*/, collectBody(output.body, context)];
            case 1:
                _a.sent();
                return [2 /*return*/, Promise.resolve(contents)];
        }
    });
}); };
var deserializeAws_restXmlAbortMultipartUploadCommandError = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var parsedOutput, _a, response, errorCode, _b, _c, parsedBody, message;
    var _d;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                _a = [__assign({}, output)];
                _d = {};
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                parsedOutput = __assign.apply(void 0, _a.concat([(_d.body = _e.sent(), _d)]));
                errorCode = "UnknownError";
                errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
                _b = errorCode;
                switch (_b) {
                    case "NoSuchUpload": return [3 /*break*/, 2];
                    case "com.amazonaws.s3#NoSuchUpload": return [3 /*break*/, 2];
                }
                return [3 /*break*/, 4];
            case 2:
                _c = [{}];
                return [4 /*yield*/, deserializeAws_restXmlNoSuchUploadResponse(parsedOutput, context)];
            case 3:
                response = __assign.apply(void 0, [__assign.apply(void 0, _c.concat([(_e.sent())])), { name: errorCode, $metadata: deserializeMetadata(output) }]);
                return [3 /*break*/, 5];
            case 4:
                parsedBody = parsedOutput.body;
                errorCode = parsedBody.code || parsedBody.Code || errorCode;
                response = __assign(__assign({}, parsedBody), { name: "" + errorCode, message: parsedBody.message || parsedBody.Message || errorCode, $fault: "client", $metadata: deserializeMetadata(output) });
                _e.label = 5;
            case 5:
                message = response.message || response.Message || errorCode;
                response.message = message;
                delete response.Message;
                return [2 /*return*/, Promise.reject(Object.assign(new Error(message), response))];
        }
    });
}); };
export var deserializeAws_restXmlCompleteMultipartUploadCommand = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var contents, data;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (output.statusCode !== 200 && output.statusCode >= 300) {
                    return [2 /*return*/, deserializeAws_restXmlCompleteMultipartUploadCommandError(output, context)];
                }
                contents = {
                    $metadata: deserializeMetadata(output),
                    Bucket: undefined,
                    BucketKeyEnabled: undefined,
                    ETag: undefined,
                    Expiration: undefined,
                    Key: undefined,
                    Location: undefined,
                    RequestCharged: undefined,
                    SSEKMSKeyId: undefined,
                    ServerSideEncryption: undefined,
                    VersionId: undefined,
                };
                if (output.headers["x-amz-expiration"] !== undefined) {
                    contents.Expiration = output.headers["x-amz-expiration"];
                }
                if (output.headers["x-amz-server-side-encryption"] !== undefined) {
                    contents.ServerSideEncryption = output.headers["x-amz-server-side-encryption"];
                }
                if (output.headers["x-amz-version-id"] !== undefined) {
                    contents.VersionId = output.headers["x-amz-version-id"];
                }
                if (output.headers["x-amz-server-side-encryption-aws-kms-key-id"] !== undefined) {
                    contents.SSEKMSKeyId = output.headers["x-amz-server-side-encryption-aws-kms-key-id"];
                }
                if (output.headers["x-amz-server-side-encryption-bucket-key-enabled"] !== undefined) {
                    contents.BucketKeyEnabled = output.headers["x-amz-server-side-encryption-bucket-key-enabled"] === "true";
                }
                if (output.headers["x-amz-request-charged"] !== undefined) {
                    contents.RequestCharged = output.headers["x-amz-request-charged"];
                }
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                data = _a.sent();
                if (data["Bucket"] !== undefined) {
                    contents.Bucket = data["Bucket"];
                }
                if (data["ETag"] !== undefined) {
                    contents.ETag = data["ETag"];
                }
                if (data["Key"] !== undefined) {
                    contents.Key = data["Key"];
                }
                if (data["Location"] !== undefined) {
                    contents.Location = data["Location"];
                }
                return [2 /*return*/, Promise.resolve(contents)];
        }
    });
}); };
var deserializeAws_restXmlCompleteMultipartUploadCommandError = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var parsedOutput, _a, response, errorCode, parsedBody, message;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _a = [__assign({}, output)];
                _b = {};
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                parsedOutput = __assign.apply(void 0, _a.concat([(_b.body = _c.sent(), _b)]));
                errorCode = "UnknownError";
                errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
                switch (errorCode) {
                    default:
                        parsedBody = parsedOutput.body;
                        errorCode = parsedBody.code || parsedBody.Code || errorCode;
                        response = __assign(__assign({}, parsedBody), { name: "" + errorCode, message: parsedBody.message || parsedBody.Message || errorCode, $fault: "client", $metadata: deserializeMetadata(output) });
                }
                message = response.message || response.Message || errorCode;
                response.message = message;
                delete response.Message;
                return [2 /*return*/, Promise.reject(Object.assign(new Error(message), response))];
        }
    });
}); };
export var deserializeAws_restXmlCopyObjectCommand = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var contents, data;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (output.statusCode !== 200 && output.statusCode >= 300) {
                    return [2 /*return*/, deserializeAws_restXmlCopyObjectCommandError(output, context)];
                }
                contents = {
                    $metadata: deserializeMetadata(output),
                    BucketKeyEnabled: undefined,
                    CopyObjectResult: undefined,
                    CopySourceVersionId: undefined,
                    Expiration: undefined,
                    RequestCharged: undefined,
                    SSECustomerAlgorithm: undefined,
                    SSECustomerKeyMD5: undefined,
                    SSEKMSEncryptionContext: undefined,
                    SSEKMSKeyId: undefined,
                    ServerSideEncryption: undefined,
                    VersionId: undefined,
                };
                if (output.headers["x-amz-expiration"] !== undefined) {
                    contents.Expiration = output.headers["x-amz-expiration"];
                }
                if (output.headers["x-amz-copy-source-version-id"] !== undefined) {
                    contents.CopySourceVersionId = output.headers["x-amz-copy-source-version-id"];
                }
                if (output.headers["x-amz-version-id"] !== undefined) {
                    contents.VersionId = output.headers["x-amz-version-id"];
                }
                if (output.headers["x-amz-server-side-encryption"] !== undefined) {
                    contents.ServerSideEncryption = output.headers["x-amz-server-side-encryption"];
                }
                if (output.headers["x-amz-server-side-encryption-customer-algorithm"] !== undefined) {
                    contents.SSECustomerAlgorithm = output.headers["x-amz-server-side-encryption-customer-algorithm"];
                }
                if (output.headers["x-amz-server-side-encryption-customer-key-md5"] !== undefined) {
                    contents.SSECustomerKeyMD5 = output.headers["x-amz-server-side-encryption-customer-key-md5"];
                }
                if (output.headers["x-amz-server-side-encryption-aws-kms-key-id"] !== undefined) {
                    contents.SSEKMSKeyId = output.headers["x-amz-server-side-encryption-aws-kms-key-id"];
                }
                if (output.headers["x-amz-server-side-encryption-context"] !== undefined) {
                    contents.SSEKMSEncryptionContext = output.headers["x-amz-server-side-encryption-context"];
                }
                if (output.headers["x-amz-server-side-encryption-bucket-key-enabled"] !== undefined) {
                    contents.BucketKeyEnabled = output.headers["x-amz-server-side-encryption-bucket-key-enabled"] === "true";
                }
                if (output.headers["x-amz-request-charged"] !== undefined) {
                    contents.RequestCharged = output.headers["x-amz-request-charged"];
                }
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                data = _a.sent();
                contents.CopyObjectResult = deserializeAws_restXmlCopyObjectResult(data, context);
                return [2 /*return*/, Promise.resolve(contents)];
        }
    });
}); };
var deserializeAws_restXmlCopyObjectCommandError = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var parsedOutput, _a, response, errorCode, _b, _c, parsedBody, message;
    var _d;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                _a = [__assign({}, output)];
                _d = {};
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                parsedOutput = __assign.apply(void 0, _a.concat([(_d.body = _e.sent(), _d)]));
                errorCode = "UnknownError";
                errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
                _b = errorCode;
                switch (_b) {
                    case "ObjectNotInActiveTierError": return [3 /*break*/, 2];
                    case "com.amazonaws.s3#ObjectNotInActiveTierError": return [3 /*break*/, 2];
                }
                return [3 /*break*/, 4];
            case 2:
                _c = [{}];
                return [4 /*yield*/, deserializeAws_restXmlObjectNotInActiveTierErrorResponse(parsedOutput, context)];
            case 3:
                response = __assign.apply(void 0, [__assign.apply(void 0, _c.concat([(_e.sent())])), { name: errorCode, $metadata: deserializeMetadata(output) }]);
                return [3 /*break*/, 5];
            case 4:
                parsedBody = parsedOutput.body;
                errorCode = parsedBody.code || parsedBody.Code || errorCode;
                response = __assign(__assign({}, parsedBody), { name: "" + errorCode, message: parsedBody.message || parsedBody.Message || errorCode, $fault: "client", $metadata: deserializeMetadata(output) });
                _e.label = 5;
            case 5:
                message = response.message || response.Message || errorCode;
                response.message = message;
                delete response.Message;
                return [2 /*return*/, Promise.reject(Object.assign(new Error(message), response))];
        }
    });
}); };
export var deserializeAws_restXmlCreateBucketCommand = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var contents;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (output.statusCode !== 200 && output.statusCode >= 300) {
                    return [2 /*return*/, deserializeAws_restXmlCreateBucketCommandError(output, context)];
                }
                contents = {
                    $metadata: deserializeMetadata(output),
                    Location: undefined,
                };
                if (output.headers["location"] !== undefined) {
                    contents.Location = output.headers["location"];
                }
                return [4 /*yield*/, collectBody(output.body, context)];
            case 1:
                _a.sent();
                return [2 /*return*/, Promise.resolve(contents)];
        }
    });
}); };
var deserializeAws_restXmlCreateBucketCommandError = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var parsedOutput, _a, response, errorCode, _b, _c, _d, parsedBody, message;
    var _e;
    return __generator(this, function (_f) {
        switch (_f.label) {
            case 0:
                _a = [__assign({}, output)];
                _e = {};
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                parsedOutput = __assign.apply(void 0, _a.concat([(_e.body = _f.sent(), _e)]));
                errorCode = "UnknownError";
                errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
                _b = errorCode;
                switch (_b) {
                    case "BucketAlreadyExists": return [3 /*break*/, 2];
                    case "com.amazonaws.s3#BucketAlreadyExists": return [3 /*break*/, 2];
                    case "BucketAlreadyOwnedByYou": return [3 /*break*/, 4];
                    case "com.amazonaws.s3#BucketAlreadyOwnedByYou": return [3 /*break*/, 4];
                }
                return [3 /*break*/, 6];
            case 2:
                _c = [{}];
                return [4 /*yield*/, deserializeAws_restXmlBucketAlreadyExistsResponse(parsedOutput, context)];
            case 3:
                response = __assign.apply(void 0, [__assign.apply(void 0, _c.concat([(_f.sent())])), { name: errorCode, $metadata: deserializeMetadata(output) }]);
                return [3 /*break*/, 7];
            case 4:
                _d = [{}];
                return [4 /*yield*/, deserializeAws_restXmlBucketAlreadyOwnedByYouResponse(parsedOutput, context)];
            case 5:
                response = __assign.apply(void 0, [__assign.apply(void 0, _d.concat([(_f.sent())])), { name: errorCode, $metadata: deserializeMetadata(output) }]);
                return [3 /*break*/, 7];
            case 6:
                parsedBody = parsedOutput.body;
                errorCode = parsedBody.code || parsedBody.Code || errorCode;
                response = __assign(__assign({}, parsedBody), { name: "" + errorCode, message: parsedBody.message || parsedBody.Message || errorCode, $fault: "client", $metadata: deserializeMetadata(output) });
                _f.label = 7;
            case 7:
                message = response.message || response.Message || errorCode;
                response.message = message;
                delete response.Message;
                return [2 /*return*/, Promise.reject(Object.assign(new Error(message), response))];
        }
    });
}); };
export var deserializeAws_restXmlCreateMultipartUploadCommand = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var contents, data;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (output.statusCode !== 200 && output.statusCode >= 300) {
                    return [2 /*return*/, deserializeAws_restXmlCreateMultipartUploadCommandError(output, context)];
                }
                contents = {
                    $metadata: deserializeMetadata(output),
                    AbortDate: undefined,
                    AbortRuleId: undefined,
                    Bucket: undefined,
                    BucketKeyEnabled: undefined,
                    Key: undefined,
                    RequestCharged: undefined,
                    SSECustomerAlgorithm: undefined,
                    SSECustomerKeyMD5: undefined,
                    SSEKMSEncryptionContext: undefined,
                    SSEKMSKeyId: undefined,
                    ServerSideEncryption: undefined,
                    UploadId: undefined,
                };
                if (output.headers["x-amz-abort-date"] !== undefined) {
                    contents.AbortDate = new Date(output.headers["x-amz-abort-date"]);
                }
                if (output.headers["x-amz-abort-rule-id"] !== undefined) {
                    contents.AbortRuleId = output.headers["x-amz-abort-rule-id"];
                }
                if (output.headers["x-amz-server-side-encryption"] !== undefined) {
                    contents.ServerSideEncryption = output.headers["x-amz-server-side-encryption"];
                }
                if (output.headers["x-amz-server-side-encryption-customer-algorithm"] !== undefined) {
                    contents.SSECustomerAlgorithm = output.headers["x-amz-server-side-encryption-customer-algorithm"];
                }
                if (output.headers["x-amz-server-side-encryption-customer-key-md5"] !== undefined) {
                    contents.SSECustomerKeyMD5 = output.headers["x-amz-server-side-encryption-customer-key-md5"];
                }
                if (output.headers["x-amz-server-side-encryption-aws-kms-key-id"] !== undefined) {
                    contents.SSEKMSKeyId = output.headers["x-amz-server-side-encryption-aws-kms-key-id"];
                }
                if (output.headers["x-amz-server-side-encryption-context"] !== undefined) {
                    contents.SSEKMSEncryptionContext = output.headers["x-amz-server-side-encryption-context"];
                }
                if (output.headers["x-amz-server-side-encryption-bucket-key-enabled"] !== undefined) {
                    contents.BucketKeyEnabled = output.headers["x-amz-server-side-encryption-bucket-key-enabled"] === "true";
                }
                if (output.headers["x-amz-request-charged"] !== undefined) {
                    contents.RequestCharged = output.headers["x-amz-request-charged"];
                }
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                data = _a.sent();
                if (data["Bucket"] !== undefined) {
                    contents.Bucket = data["Bucket"];
                }
                if (data["Key"] !== undefined) {
                    contents.Key = data["Key"];
                }
                if (data["UploadId"] !== undefined) {
                    contents.UploadId = data["UploadId"];
                }
                return [2 /*return*/, Promise.resolve(contents)];
        }
    });
}); };
var deserializeAws_restXmlCreateMultipartUploadCommandError = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var parsedOutput, _a, response, errorCode, parsedBody, message;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _a = [__assign({}, output)];
                _b = {};
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                parsedOutput = __assign.apply(void 0, _a.concat([(_b.body = _c.sent(), _b)]));
                errorCode = "UnknownError";
                errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
                switch (errorCode) {
                    default:
                        parsedBody = parsedOutput.body;
                        errorCode = parsedBody.code || parsedBody.Code || errorCode;
                        response = __assign(__assign({}, parsedBody), { name: "" + errorCode, message: parsedBody.message || parsedBody.Message || errorCode, $fault: "client", $metadata: deserializeMetadata(output) });
                }
                message = response.message || response.Message || errorCode;
                response.message = message;
                delete response.Message;
                return [2 /*return*/, Promise.reject(Object.assign(new Error(message), response))];
        }
    });
}); };
export var deserializeAws_restXmlDeleteBucketCommand = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var contents;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (output.statusCode !== 204 && output.statusCode >= 300) {
                    return [2 /*return*/, deserializeAws_restXmlDeleteBucketCommandError(output, context)];
                }
                contents = {
                    $metadata: deserializeMetadata(output),
                };
                return [4 /*yield*/, collectBody(output.body, context)];
            case 1:
                _a.sent();
                return [2 /*return*/, Promise.resolve(contents)];
        }
    });
}); };
var deserializeAws_restXmlDeleteBucketCommandError = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var parsedOutput, _a, response, errorCode, parsedBody, message;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _a = [__assign({}, output)];
                _b = {};
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                parsedOutput = __assign.apply(void 0, _a.concat([(_b.body = _c.sent(), _b)]));
                errorCode = "UnknownError";
                errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
                switch (errorCode) {
                    default:
                        parsedBody = parsedOutput.body;
                        errorCode = parsedBody.code || parsedBody.Code || errorCode;
                        response = __assign(__assign({}, parsedBody), { name: "" + errorCode, message: parsedBody.message || parsedBody.Message || errorCode, $fault: "client", $metadata: deserializeMetadata(output) });
                }
                message = response.message || response.Message || errorCode;
                response.message = message;
                delete response.Message;
                return [2 /*return*/, Promise.reject(Object.assign(new Error(message), response))];
        }
    });
}); };
export var deserializeAws_restXmlDeleteBucketAnalyticsConfigurationCommand = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var contents;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (output.statusCode !== 204 && output.statusCode >= 300) {
                    return [2 /*return*/, deserializeAws_restXmlDeleteBucketAnalyticsConfigurationCommandError(output, context)];
                }
                contents = {
                    $metadata: deserializeMetadata(output),
                };
                return [4 /*yield*/, collectBody(output.body, context)];
            case 1:
                _a.sent();
                return [2 /*return*/, Promise.resolve(contents)];
        }
    });
}); };
var deserializeAws_restXmlDeleteBucketAnalyticsConfigurationCommandError = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var parsedOutput, _a, response, errorCode, parsedBody, message;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _a = [__assign({}, output)];
                _b = {};
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                parsedOutput = __assign.apply(void 0, _a.concat([(_b.body = _c.sent(), _b)]));
                errorCode = "UnknownError";
                errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
                switch (errorCode) {
                    default:
                        parsedBody = parsedOutput.body;
                        errorCode = parsedBody.code || parsedBody.Code || errorCode;
                        response = __assign(__assign({}, parsedBody), { name: "" + errorCode, message: parsedBody.message || parsedBody.Message || errorCode, $fault: "client", $metadata: deserializeMetadata(output) });
                }
                message = response.message || response.Message || errorCode;
                response.message = message;
                delete response.Message;
                return [2 /*return*/, Promise.reject(Object.assign(new Error(message), response))];
        }
    });
}); };
export var deserializeAws_restXmlDeleteBucketCorsCommand = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var contents;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (output.statusCode !== 204 && output.statusCode >= 300) {
                    return [2 /*return*/, deserializeAws_restXmlDeleteBucketCorsCommandError(output, context)];
                }
                contents = {
                    $metadata: deserializeMetadata(output),
                };
                return [4 /*yield*/, collectBody(output.body, context)];
            case 1:
                _a.sent();
                return [2 /*return*/, Promise.resolve(contents)];
        }
    });
}); };
var deserializeAws_restXmlDeleteBucketCorsCommandError = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var parsedOutput, _a, response, errorCode, parsedBody, message;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _a = [__assign({}, output)];
                _b = {};
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                parsedOutput = __assign.apply(void 0, _a.concat([(_b.body = _c.sent(), _b)]));
                errorCode = "UnknownError";
                errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
                switch (errorCode) {
                    default:
                        parsedBody = parsedOutput.body;
                        errorCode = parsedBody.code || parsedBody.Code || errorCode;
                        response = __assign(__assign({}, parsedBody), { name: "" + errorCode, message: parsedBody.message || parsedBody.Message || errorCode, $fault: "client", $metadata: deserializeMetadata(output) });
                }
                message = response.message || response.Message || errorCode;
                response.message = message;
                delete response.Message;
                return [2 /*return*/, Promise.reject(Object.assign(new Error(message), response))];
        }
    });
}); };
export var deserializeAws_restXmlDeleteBucketEncryptionCommand = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var contents;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (output.statusCode !== 204 && output.statusCode >= 300) {
                    return [2 /*return*/, deserializeAws_restXmlDeleteBucketEncryptionCommandError(output, context)];
                }
                contents = {
                    $metadata: deserializeMetadata(output),
                };
                return [4 /*yield*/, collectBody(output.body, context)];
            case 1:
                _a.sent();
                return [2 /*return*/, Promise.resolve(contents)];
        }
    });
}); };
var deserializeAws_restXmlDeleteBucketEncryptionCommandError = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var parsedOutput, _a, response, errorCode, parsedBody, message;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _a = [__assign({}, output)];
                _b = {};
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                parsedOutput = __assign.apply(void 0, _a.concat([(_b.body = _c.sent(), _b)]));
                errorCode = "UnknownError";
                errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
                switch (errorCode) {
                    default:
                        parsedBody = parsedOutput.body;
                        errorCode = parsedBody.code || parsedBody.Code || errorCode;
                        response = __assign(__assign({}, parsedBody), { name: "" + errorCode, message: parsedBody.message || parsedBody.Message || errorCode, $fault: "client", $metadata: deserializeMetadata(output) });
                }
                message = response.message || response.Message || errorCode;
                response.message = message;
                delete response.Message;
                return [2 /*return*/, Promise.reject(Object.assign(new Error(message), response))];
        }
    });
}); };
export var deserializeAws_restXmlDeleteBucketIntelligentTieringConfigurationCommand = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var contents;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (output.statusCode !== 204 && output.statusCode >= 300) {
                    return [2 /*return*/, deserializeAws_restXmlDeleteBucketIntelligentTieringConfigurationCommandError(output, context)];
                }
                contents = {
                    $metadata: deserializeMetadata(output),
                };
                return [4 /*yield*/, collectBody(output.body, context)];
            case 1:
                _a.sent();
                return [2 /*return*/, Promise.resolve(contents)];
        }
    });
}); };
var deserializeAws_restXmlDeleteBucketIntelligentTieringConfigurationCommandError = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var parsedOutput, _a, response, errorCode, parsedBody, message;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _a = [__assign({}, output)];
                _b = {};
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                parsedOutput = __assign.apply(void 0, _a.concat([(_b.body = _c.sent(), _b)]));
                errorCode = "UnknownError";
                errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
                switch (errorCode) {
                    default:
                        parsedBody = parsedOutput.body;
                        errorCode = parsedBody.code || parsedBody.Code || errorCode;
                        response = __assign(__assign({}, parsedBody), { name: "" + errorCode, message: parsedBody.message || parsedBody.Message || errorCode, $fault: "client", $metadata: deserializeMetadata(output) });
                }
                message = response.message || response.Message || errorCode;
                response.message = message;
                delete response.Message;
                return [2 /*return*/, Promise.reject(Object.assign(new Error(message), response))];
        }
    });
}); };
export var deserializeAws_restXmlDeleteBucketInventoryConfigurationCommand = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var contents;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (output.statusCode !== 204 && output.statusCode >= 300) {
                    return [2 /*return*/, deserializeAws_restXmlDeleteBucketInventoryConfigurationCommandError(output, context)];
                }
                contents = {
                    $metadata: deserializeMetadata(output),
                };
                return [4 /*yield*/, collectBody(output.body, context)];
            case 1:
                _a.sent();
                return [2 /*return*/, Promise.resolve(contents)];
        }
    });
}); };
var deserializeAws_restXmlDeleteBucketInventoryConfigurationCommandError = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var parsedOutput, _a, response, errorCode, parsedBody, message;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _a = [__assign({}, output)];
                _b = {};
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                parsedOutput = __assign.apply(void 0, _a.concat([(_b.body = _c.sent(), _b)]));
                errorCode = "UnknownError";
                errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
                switch (errorCode) {
                    default:
                        parsedBody = parsedOutput.body;
                        errorCode = parsedBody.code || parsedBody.Code || errorCode;
                        response = __assign(__assign({}, parsedBody), { name: "" + errorCode, message: parsedBody.message || parsedBody.Message || errorCode, $fault: "client", $metadata: deserializeMetadata(output) });
                }
                message = response.message || response.Message || errorCode;
                response.message = message;
                delete response.Message;
                return [2 /*return*/, Promise.reject(Object.assign(new Error(message), response))];
        }
    });
}); };
export var deserializeAws_restXmlDeleteBucketLifecycleCommand = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var contents;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (output.statusCode !== 204 && output.statusCode >= 300) {
                    return [2 /*return*/, deserializeAws_restXmlDeleteBucketLifecycleCommandError(output, context)];
                }
                contents = {
                    $metadata: deserializeMetadata(output),
                };
                return [4 /*yield*/, collectBody(output.body, context)];
            case 1:
                _a.sent();
                return [2 /*return*/, Promise.resolve(contents)];
        }
    });
}); };
var deserializeAws_restXmlDeleteBucketLifecycleCommandError = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var parsedOutput, _a, response, errorCode, parsedBody, message;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _a = [__assign({}, output)];
                _b = {};
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                parsedOutput = __assign.apply(void 0, _a.concat([(_b.body = _c.sent(), _b)]));
                errorCode = "UnknownError";
                errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
                switch (errorCode) {
                    default:
                        parsedBody = parsedOutput.body;
                        errorCode = parsedBody.code || parsedBody.Code || errorCode;
                        response = __assign(__assign({}, parsedBody), { name: "" + errorCode, message: parsedBody.message || parsedBody.Message || errorCode, $fault: "client", $metadata: deserializeMetadata(output) });
                }
                message = response.message || response.Message || errorCode;
                response.message = message;
                delete response.Message;
                return [2 /*return*/, Promise.reject(Object.assign(new Error(message), response))];
        }
    });
}); };
export var deserializeAws_restXmlDeleteBucketMetricsConfigurationCommand = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var contents;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (output.statusCode !== 204 && output.statusCode >= 300) {
                    return [2 /*return*/, deserializeAws_restXmlDeleteBucketMetricsConfigurationCommandError(output, context)];
                }
                contents = {
                    $metadata: deserializeMetadata(output),
                };
                return [4 /*yield*/, collectBody(output.body, context)];
            case 1:
                _a.sent();
                return [2 /*return*/, Promise.resolve(contents)];
        }
    });
}); };
var deserializeAws_restXmlDeleteBucketMetricsConfigurationCommandError = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var parsedOutput, _a, response, errorCode, parsedBody, message;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _a = [__assign({}, output)];
                _b = {};
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                parsedOutput = __assign.apply(void 0, _a.concat([(_b.body = _c.sent(), _b)]));
                errorCode = "UnknownError";
                errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
                switch (errorCode) {
                    default:
                        parsedBody = parsedOutput.body;
                        errorCode = parsedBody.code || parsedBody.Code || errorCode;
                        response = __assign(__assign({}, parsedBody), { name: "" + errorCode, message: parsedBody.message || parsedBody.Message || errorCode, $fault: "client", $metadata: deserializeMetadata(output) });
                }
                message = response.message || response.Message || errorCode;
                response.message = message;
                delete response.Message;
                return [2 /*return*/, Promise.reject(Object.assign(new Error(message), response))];
        }
    });
}); };
export var deserializeAws_restXmlDeleteBucketOwnershipControlsCommand = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var contents;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (output.statusCode !== 204 && output.statusCode >= 300) {
                    return [2 /*return*/, deserializeAws_restXmlDeleteBucketOwnershipControlsCommandError(output, context)];
                }
                contents = {
                    $metadata: deserializeMetadata(output),
                };
                return [4 /*yield*/, collectBody(output.body, context)];
            case 1:
                _a.sent();
                return [2 /*return*/, Promise.resolve(contents)];
        }
    });
}); };
var deserializeAws_restXmlDeleteBucketOwnershipControlsCommandError = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var parsedOutput, _a, response, errorCode, parsedBody, message;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _a = [__assign({}, output)];
                _b = {};
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                parsedOutput = __assign.apply(void 0, _a.concat([(_b.body = _c.sent(), _b)]));
                errorCode = "UnknownError";
                errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
                switch (errorCode) {
                    default:
                        parsedBody = parsedOutput.body;
                        errorCode = parsedBody.code || parsedBody.Code || errorCode;
                        response = __assign(__assign({}, parsedBody), { name: "" + errorCode, message: parsedBody.message || parsedBody.Message || errorCode, $fault: "client", $metadata: deserializeMetadata(output) });
                }
                message = response.message || response.Message || errorCode;
                response.message = message;
                delete response.Message;
                return [2 /*return*/, Promise.reject(Object.assign(new Error(message), response))];
        }
    });
}); };
export var deserializeAws_restXmlDeleteBucketPolicyCommand = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var contents;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (output.statusCode !== 204 && output.statusCode >= 300) {
                    return [2 /*return*/, deserializeAws_restXmlDeleteBucketPolicyCommandError(output, context)];
                }
                contents = {
                    $metadata: deserializeMetadata(output),
                };
                return [4 /*yield*/, collectBody(output.body, context)];
            case 1:
                _a.sent();
                return [2 /*return*/, Promise.resolve(contents)];
        }
    });
}); };
var deserializeAws_restXmlDeleteBucketPolicyCommandError = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var parsedOutput, _a, response, errorCode, parsedBody, message;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _a = [__assign({}, output)];
                _b = {};
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                parsedOutput = __assign.apply(void 0, _a.concat([(_b.body = _c.sent(), _b)]));
                errorCode = "UnknownError";
                errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
                switch (errorCode) {
                    default:
                        parsedBody = parsedOutput.body;
                        errorCode = parsedBody.code || parsedBody.Code || errorCode;
                        response = __assign(__assign({}, parsedBody), { name: "" + errorCode, message: parsedBody.message || parsedBody.Message || errorCode, $fault: "client", $metadata: deserializeMetadata(output) });
                }
                message = response.message || response.Message || errorCode;
                response.message = message;
                delete response.Message;
                return [2 /*return*/, Promise.reject(Object.assign(new Error(message), response))];
        }
    });
}); };
export var deserializeAws_restXmlDeleteBucketReplicationCommand = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var contents;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (output.statusCode !== 204 && output.statusCode >= 300) {
                    return [2 /*return*/, deserializeAws_restXmlDeleteBucketReplicationCommandError(output, context)];
                }
                contents = {
                    $metadata: deserializeMetadata(output),
                };
                return [4 /*yield*/, collectBody(output.body, context)];
            case 1:
                _a.sent();
                return [2 /*return*/, Promise.resolve(contents)];
        }
    });
}); };
var deserializeAws_restXmlDeleteBucketReplicationCommandError = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var parsedOutput, _a, response, errorCode, parsedBody, message;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _a = [__assign({}, output)];
                _b = {};
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                parsedOutput = __assign.apply(void 0, _a.concat([(_b.body = _c.sent(), _b)]));
                errorCode = "UnknownError";
                errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
                switch (errorCode) {
                    default:
                        parsedBody = parsedOutput.body;
                        errorCode = parsedBody.code || parsedBody.Code || errorCode;
                        response = __assign(__assign({}, parsedBody), { name: "" + errorCode, message: parsedBody.message || parsedBody.Message || errorCode, $fault: "client", $metadata: deserializeMetadata(output) });
                }
                message = response.message || response.Message || errorCode;
                response.message = message;
                delete response.Message;
                return [2 /*return*/, Promise.reject(Object.assign(new Error(message), response))];
        }
    });
}); };
export var deserializeAws_restXmlDeleteBucketTaggingCommand = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var contents;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (output.statusCode !== 204 && output.statusCode >= 300) {
                    return [2 /*return*/, deserializeAws_restXmlDeleteBucketTaggingCommandError(output, context)];
                }
                contents = {
                    $metadata: deserializeMetadata(output),
                };
                return [4 /*yield*/, collectBody(output.body, context)];
            case 1:
                _a.sent();
                return [2 /*return*/, Promise.resolve(contents)];
        }
    });
}); };
var deserializeAws_restXmlDeleteBucketTaggingCommandError = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var parsedOutput, _a, response, errorCode, parsedBody, message;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _a = [__assign({}, output)];
                _b = {};
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                parsedOutput = __assign.apply(void 0, _a.concat([(_b.body = _c.sent(), _b)]));
                errorCode = "UnknownError";
                errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
                switch (errorCode) {
                    default:
                        parsedBody = parsedOutput.body;
                        errorCode = parsedBody.code || parsedBody.Code || errorCode;
                        response = __assign(__assign({}, parsedBody), { name: "" + errorCode, message: parsedBody.message || parsedBody.Message || errorCode, $fault: "client", $metadata: deserializeMetadata(output) });
                }
                message = response.message || response.Message || errorCode;
                response.message = message;
                delete response.Message;
                return [2 /*return*/, Promise.reject(Object.assign(new Error(message), response))];
        }
    });
}); };
export var deserializeAws_restXmlDeleteBucketWebsiteCommand = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var contents;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (output.statusCode !== 204 && output.statusCode >= 300) {
                    return [2 /*return*/, deserializeAws_restXmlDeleteBucketWebsiteCommandError(output, context)];
                }
                contents = {
                    $metadata: deserializeMetadata(output),
                };
                return [4 /*yield*/, collectBody(output.body, context)];
            case 1:
                _a.sent();
                return [2 /*return*/, Promise.resolve(contents)];
        }
    });
}); };
var deserializeAws_restXmlDeleteBucketWebsiteCommandError = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var parsedOutput, _a, response, errorCode, parsedBody, message;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _a = [__assign({}, output)];
                _b = {};
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                parsedOutput = __assign.apply(void 0, _a.concat([(_b.body = _c.sent(), _b)]));
                errorCode = "UnknownError";
                errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
                switch (errorCode) {
                    default:
                        parsedBody = parsedOutput.body;
                        errorCode = parsedBody.code || parsedBody.Code || errorCode;
                        response = __assign(__assign({}, parsedBody), { name: "" + errorCode, message: parsedBody.message || parsedBody.Message || errorCode, $fault: "client", $metadata: deserializeMetadata(output) });
                }
                message = response.message || response.Message || errorCode;
                response.message = message;
                delete response.Message;
                return [2 /*return*/, Promise.reject(Object.assign(new Error(message), response))];
        }
    });
}); };
export var deserializeAws_restXmlDeleteObjectCommand = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var contents;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (output.statusCode !== 204 && output.statusCode >= 300) {
                    return [2 /*return*/, deserializeAws_restXmlDeleteObjectCommandError(output, context)];
                }
                contents = {
                    $metadata: deserializeMetadata(output),
                    DeleteMarker: undefined,
                    RequestCharged: undefined,
                    VersionId: undefined,
                };
                if (output.headers["x-amz-delete-marker"] !== undefined) {
                    contents.DeleteMarker = output.headers["x-amz-delete-marker"] === "true";
                }
                if (output.headers["x-amz-version-id"] !== undefined) {
                    contents.VersionId = output.headers["x-amz-version-id"];
                }
                if (output.headers["x-amz-request-charged"] !== undefined) {
                    contents.RequestCharged = output.headers["x-amz-request-charged"];
                }
                return [4 /*yield*/, collectBody(output.body, context)];
            case 1:
                _a.sent();
                return [2 /*return*/, Promise.resolve(contents)];
        }
    });
}); };
var deserializeAws_restXmlDeleteObjectCommandError = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var parsedOutput, _a, response, errorCode, parsedBody, message;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _a = [__assign({}, output)];
                _b = {};
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                parsedOutput = __assign.apply(void 0, _a.concat([(_b.body = _c.sent(), _b)]));
                errorCode = "UnknownError";
                errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
                switch (errorCode) {
                    default:
                        parsedBody = parsedOutput.body;
                        errorCode = parsedBody.code || parsedBody.Code || errorCode;
                        response = __assign(__assign({}, parsedBody), { name: "" + errorCode, message: parsedBody.message || parsedBody.Message || errorCode, $fault: "client", $metadata: deserializeMetadata(output) });
                }
                message = response.message || response.Message || errorCode;
                response.message = message;
                delete response.Message;
                return [2 /*return*/, Promise.reject(Object.assign(new Error(message), response))];
        }
    });
}); };
export var deserializeAws_restXmlDeleteObjectsCommand = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var contents, data;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (output.statusCode !== 200 && output.statusCode >= 300) {
                    return [2 /*return*/, deserializeAws_restXmlDeleteObjectsCommandError(output, context)];
                }
                contents = {
                    $metadata: deserializeMetadata(output),
                    Deleted: undefined,
                    Errors: undefined,
                    RequestCharged: undefined,
                };
                if (output.headers["x-amz-request-charged"] !== undefined) {
                    contents.RequestCharged = output.headers["x-amz-request-charged"];
                }
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                data = _a.sent();
                if (data.Deleted === "") {
                    contents.Deleted = [];
                }
                if (data["Deleted"] !== undefined) {
                    contents.Deleted = deserializeAws_restXmlDeletedObjects(__getArrayIfSingleItem(data["Deleted"]), context);
                }
                if (data.Error === "") {
                    contents.Errors = [];
                }
                if (data["Error"] !== undefined) {
                    contents.Errors = deserializeAws_restXmlErrors(__getArrayIfSingleItem(data["Error"]), context);
                }
                return [2 /*return*/, Promise.resolve(contents)];
        }
    });
}); };
var deserializeAws_restXmlDeleteObjectsCommandError = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var parsedOutput, _a, response, errorCode, parsedBody, message;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _a = [__assign({}, output)];
                _b = {};
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                parsedOutput = __assign.apply(void 0, _a.concat([(_b.body = _c.sent(), _b)]));
                errorCode = "UnknownError";
                errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
                switch (errorCode) {
                    default:
                        parsedBody = parsedOutput.body;
                        errorCode = parsedBody.code || parsedBody.Code || errorCode;
                        response = __assign(__assign({}, parsedBody), { name: "" + errorCode, message: parsedBody.message || parsedBody.Message || errorCode, $fault: "client", $metadata: deserializeMetadata(output) });
                }
                message = response.message || response.Message || errorCode;
                response.message = message;
                delete response.Message;
                return [2 /*return*/, Promise.reject(Object.assign(new Error(message), response))];
        }
    });
}); };
export var deserializeAws_restXmlDeleteObjectTaggingCommand = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var contents;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (output.statusCode !== 204 && output.statusCode >= 300) {
                    return [2 /*return*/, deserializeAws_restXmlDeleteObjectTaggingCommandError(output, context)];
                }
                contents = {
                    $metadata: deserializeMetadata(output),
                    VersionId: undefined,
                };
                if (output.headers["x-amz-version-id"] !== undefined) {
                    contents.VersionId = output.headers["x-amz-version-id"];
                }
                return [4 /*yield*/, collectBody(output.body, context)];
            case 1:
                _a.sent();
                return [2 /*return*/, Promise.resolve(contents)];
        }
    });
}); };
var deserializeAws_restXmlDeleteObjectTaggingCommandError = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var parsedOutput, _a, response, errorCode, parsedBody, message;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _a = [__assign({}, output)];
                _b = {};
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                parsedOutput = __assign.apply(void 0, _a.concat([(_b.body = _c.sent(), _b)]));
                errorCode = "UnknownError";
                errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
                switch (errorCode) {
                    default:
                        parsedBody = parsedOutput.body;
                        errorCode = parsedBody.code || parsedBody.Code || errorCode;
                        response = __assign(__assign({}, parsedBody), { name: "" + errorCode, message: parsedBody.message || parsedBody.Message || errorCode, $fault: "client", $metadata: deserializeMetadata(output) });
                }
                message = response.message || response.Message || errorCode;
                response.message = message;
                delete response.Message;
                return [2 /*return*/, Promise.reject(Object.assign(new Error(message), response))];
        }
    });
}); };
export var deserializeAws_restXmlDeletePublicAccessBlockCommand = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var contents;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (output.statusCode !== 204 && output.statusCode >= 300) {
                    return [2 /*return*/, deserializeAws_restXmlDeletePublicAccessBlockCommandError(output, context)];
                }
                contents = {
                    $metadata: deserializeMetadata(output),
                };
                return [4 /*yield*/, collectBody(output.body, context)];
            case 1:
                _a.sent();
                return [2 /*return*/, Promise.resolve(contents)];
        }
    });
}); };
var deserializeAws_restXmlDeletePublicAccessBlockCommandError = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var parsedOutput, _a, response, errorCode, parsedBody, message;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _a = [__assign({}, output)];
                _b = {};
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                parsedOutput = __assign.apply(void 0, _a.concat([(_b.body = _c.sent(), _b)]));
                errorCode = "UnknownError";
                errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
                switch (errorCode) {
                    default:
                        parsedBody = parsedOutput.body;
                        errorCode = parsedBody.code || parsedBody.Code || errorCode;
                        response = __assign(__assign({}, parsedBody), { name: "" + errorCode, message: parsedBody.message || parsedBody.Message || errorCode, $fault: "client", $metadata: deserializeMetadata(output) });
                }
                message = response.message || response.Message || errorCode;
                response.message = message;
                delete response.Message;
                return [2 /*return*/, Promise.reject(Object.assign(new Error(message), response))];
        }
    });
}); };
export var deserializeAws_restXmlGetBucketAccelerateConfigurationCommand = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var contents, data;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (output.statusCode !== 200 && output.statusCode >= 300) {
                    return [2 /*return*/, deserializeAws_restXmlGetBucketAccelerateConfigurationCommandError(output, context)];
                }
                contents = {
                    $metadata: deserializeMetadata(output),
                    Status: undefined,
                };
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                data = _a.sent();
                if (data["Status"] !== undefined) {
                    contents.Status = data["Status"];
                }
                return [2 /*return*/, Promise.resolve(contents)];
        }
    });
}); };
var deserializeAws_restXmlGetBucketAccelerateConfigurationCommandError = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var parsedOutput, _a, response, errorCode, parsedBody, message;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _a = [__assign({}, output)];
                _b = {};
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                parsedOutput = __assign.apply(void 0, _a.concat([(_b.body = _c.sent(), _b)]));
                errorCode = "UnknownError";
                errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
                switch (errorCode) {
                    default:
                        parsedBody = parsedOutput.body;
                        errorCode = parsedBody.code || parsedBody.Code || errorCode;
                        response = __assign(__assign({}, parsedBody), { name: "" + errorCode, message: parsedBody.message || parsedBody.Message || errorCode, $fault: "client", $metadata: deserializeMetadata(output) });
                }
                message = response.message || response.Message || errorCode;
                response.message = message;
                delete response.Message;
                return [2 /*return*/, Promise.reject(Object.assign(new Error(message), response))];
        }
    });
}); };
export var deserializeAws_restXmlGetBucketAclCommand = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var contents, data;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (output.statusCode !== 200 && output.statusCode >= 300) {
                    return [2 /*return*/, deserializeAws_restXmlGetBucketAclCommandError(output, context)];
                }
                contents = {
                    $metadata: deserializeMetadata(output),
                    Grants: undefined,
                    Owner: undefined,
                };
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                data = _a.sent();
                if (data.AccessControlList === "") {
                    contents.Grants = [];
                }
                if (data["AccessControlList"] !== undefined && data["AccessControlList"]["Grant"] !== undefined) {
                    contents.Grants = deserializeAws_restXmlGrants(__getArrayIfSingleItem(data["AccessControlList"]["Grant"]), context);
                }
                if (data["Owner"] !== undefined) {
                    contents.Owner = deserializeAws_restXmlOwner(data["Owner"], context);
                }
                return [2 /*return*/, Promise.resolve(contents)];
        }
    });
}); };
var deserializeAws_restXmlGetBucketAclCommandError = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var parsedOutput, _a, response, errorCode, parsedBody, message;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _a = [__assign({}, output)];
                _b = {};
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                parsedOutput = __assign.apply(void 0, _a.concat([(_b.body = _c.sent(), _b)]));
                errorCode = "UnknownError";
                errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
                switch (errorCode) {
                    default:
                        parsedBody = parsedOutput.body;
                        errorCode = parsedBody.code || parsedBody.Code || errorCode;
                        response = __assign(__assign({}, parsedBody), { name: "" + errorCode, message: parsedBody.message || parsedBody.Message || errorCode, $fault: "client", $metadata: deserializeMetadata(output) });
                }
                message = response.message || response.Message || errorCode;
                response.message = message;
                delete response.Message;
                return [2 /*return*/, Promise.reject(Object.assign(new Error(message), response))];
        }
    });
}); };
export var deserializeAws_restXmlGetBucketAnalyticsConfigurationCommand = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var contents, data;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (output.statusCode !== 200 && output.statusCode >= 300) {
                    return [2 /*return*/, deserializeAws_restXmlGetBucketAnalyticsConfigurationCommandError(output, context)];
                }
                contents = {
                    $metadata: deserializeMetadata(output),
                    AnalyticsConfiguration: undefined,
                };
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                data = _a.sent();
                contents.AnalyticsConfiguration = deserializeAws_restXmlAnalyticsConfiguration(data, context);
                return [2 /*return*/, Promise.resolve(contents)];
        }
    });
}); };
var deserializeAws_restXmlGetBucketAnalyticsConfigurationCommandError = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var parsedOutput, _a, response, errorCode, parsedBody, message;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _a = [__assign({}, output)];
                _b = {};
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                parsedOutput = __assign.apply(void 0, _a.concat([(_b.body = _c.sent(), _b)]));
                errorCode = "UnknownError";
                errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
                switch (errorCode) {
                    default:
                        parsedBody = parsedOutput.body;
                        errorCode = parsedBody.code || parsedBody.Code || errorCode;
                        response = __assign(__assign({}, parsedBody), { name: "" + errorCode, message: parsedBody.message || parsedBody.Message || errorCode, $fault: "client", $metadata: deserializeMetadata(output) });
                }
                message = response.message || response.Message || errorCode;
                response.message = message;
                delete response.Message;
                return [2 /*return*/, Promise.reject(Object.assign(new Error(message), response))];
        }
    });
}); };
export var deserializeAws_restXmlGetBucketCorsCommand = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var contents, data;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (output.statusCode !== 200 && output.statusCode >= 300) {
                    return [2 /*return*/, deserializeAws_restXmlGetBucketCorsCommandError(output, context)];
                }
                contents = {
                    $metadata: deserializeMetadata(output),
                    CORSRules: undefined,
                };
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                data = _a.sent();
                if (data.CORSRule === "") {
                    contents.CORSRules = [];
                }
                if (data["CORSRule"] !== undefined) {
                    contents.CORSRules = deserializeAws_restXmlCORSRules(__getArrayIfSingleItem(data["CORSRule"]), context);
                }
                return [2 /*return*/, Promise.resolve(contents)];
        }
    });
}); };
var deserializeAws_restXmlGetBucketCorsCommandError = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var parsedOutput, _a, response, errorCode, parsedBody, message;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _a = [__assign({}, output)];
                _b = {};
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                parsedOutput = __assign.apply(void 0, _a.concat([(_b.body = _c.sent(), _b)]));
                errorCode = "UnknownError";
                errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
                switch (errorCode) {
                    default:
                        parsedBody = parsedOutput.body;
                        errorCode = parsedBody.code || parsedBody.Code || errorCode;
                        response = __assign(__assign({}, parsedBody), { name: "" + errorCode, message: parsedBody.message || parsedBody.Message || errorCode, $fault: "client", $metadata: deserializeMetadata(output) });
                }
                message = response.message || response.Message || errorCode;
                response.message = message;
                delete response.Message;
                return [2 /*return*/, Promise.reject(Object.assign(new Error(message), response))];
        }
    });
}); };
export var deserializeAws_restXmlGetBucketEncryptionCommand = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var contents, data;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (output.statusCode !== 200 && output.statusCode >= 300) {
                    return [2 /*return*/, deserializeAws_restXmlGetBucketEncryptionCommandError(output, context)];
                }
                contents = {
                    $metadata: deserializeMetadata(output),
                    ServerSideEncryptionConfiguration: undefined,
                };
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                data = _a.sent();
                contents.ServerSideEncryptionConfiguration = deserializeAws_restXmlServerSideEncryptionConfiguration(data, context);
                return [2 /*return*/, Promise.resolve(contents)];
        }
    });
}); };
var deserializeAws_restXmlGetBucketEncryptionCommandError = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var parsedOutput, _a, response, errorCode, parsedBody, message;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _a = [__assign({}, output)];
                _b = {};
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                parsedOutput = __assign.apply(void 0, _a.concat([(_b.body = _c.sent(), _b)]));
                errorCode = "UnknownError";
                errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
                switch (errorCode) {
                    default:
                        parsedBody = parsedOutput.body;
                        errorCode = parsedBody.code || parsedBody.Code || errorCode;
                        response = __assign(__assign({}, parsedBody), { name: "" + errorCode, message: parsedBody.message || parsedBody.Message || errorCode, $fault: "client", $metadata: deserializeMetadata(output) });
                }
                message = response.message || response.Message || errorCode;
                response.message = message;
                delete response.Message;
                return [2 /*return*/, Promise.reject(Object.assign(new Error(message), response))];
        }
    });
}); };
export var deserializeAws_restXmlGetBucketIntelligentTieringConfigurationCommand = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var contents, data;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (output.statusCode !== 200 && output.statusCode >= 300) {
                    return [2 /*return*/, deserializeAws_restXmlGetBucketIntelligentTieringConfigurationCommandError(output, context)];
                }
                contents = {
                    $metadata: deserializeMetadata(output),
                    IntelligentTieringConfiguration: undefined,
                };
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                data = _a.sent();
                contents.IntelligentTieringConfiguration = deserializeAws_restXmlIntelligentTieringConfiguration(data, context);
                return [2 /*return*/, Promise.resolve(contents)];
        }
    });
}); };
var deserializeAws_restXmlGetBucketIntelligentTieringConfigurationCommandError = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var parsedOutput, _a, response, errorCode, parsedBody, message;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _a = [__assign({}, output)];
                _b = {};
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                parsedOutput = __assign.apply(void 0, _a.concat([(_b.body = _c.sent(), _b)]));
                errorCode = "UnknownError";
                errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
                switch (errorCode) {
                    default:
                        parsedBody = parsedOutput.body;
                        errorCode = parsedBody.code || parsedBody.Code || errorCode;
                        response = __assign(__assign({}, parsedBody), { name: "" + errorCode, message: parsedBody.message || parsedBody.Message || errorCode, $fault: "client", $metadata: deserializeMetadata(output) });
                }
                message = response.message || response.Message || errorCode;
                response.message = message;
                delete response.Message;
                return [2 /*return*/, Promise.reject(Object.assign(new Error(message), response))];
        }
    });
}); };
export var deserializeAws_restXmlGetBucketInventoryConfigurationCommand = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var contents, data;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (output.statusCode !== 200 && output.statusCode >= 300) {
                    return [2 /*return*/, deserializeAws_restXmlGetBucketInventoryConfigurationCommandError(output, context)];
                }
                contents = {
                    $metadata: deserializeMetadata(output),
                    InventoryConfiguration: undefined,
                };
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                data = _a.sent();
                contents.InventoryConfiguration = deserializeAws_restXmlInventoryConfiguration(data, context);
                return [2 /*return*/, Promise.resolve(contents)];
        }
    });
}); };
var deserializeAws_restXmlGetBucketInventoryConfigurationCommandError = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var parsedOutput, _a, response, errorCode, parsedBody, message;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _a = [__assign({}, output)];
                _b = {};
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                parsedOutput = __assign.apply(void 0, _a.concat([(_b.body = _c.sent(), _b)]));
                errorCode = "UnknownError";
                errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
                switch (errorCode) {
                    default:
                        parsedBody = parsedOutput.body;
                        errorCode = parsedBody.code || parsedBody.Code || errorCode;
                        response = __assign(__assign({}, parsedBody), { name: "" + errorCode, message: parsedBody.message || parsedBody.Message || errorCode, $fault: "client", $metadata: deserializeMetadata(output) });
                }
                message = response.message || response.Message || errorCode;
                response.message = message;
                delete response.Message;
                return [2 /*return*/, Promise.reject(Object.assign(new Error(message), response))];
        }
    });
}); };
export var deserializeAws_restXmlGetBucketLifecycleConfigurationCommand = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var contents, data;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (output.statusCode !== 200 && output.statusCode >= 300) {
                    return [2 /*return*/, deserializeAws_restXmlGetBucketLifecycleConfigurationCommandError(output, context)];
                }
                contents = {
                    $metadata: deserializeMetadata(output),
                    Rules: undefined,
                };
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                data = _a.sent();
                if (data.Rule === "") {
                    contents.Rules = [];
                }
                if (data["Rule"] !== undefined) {
                    contents.Rules = deserializeAws_restXmlLifecycleRules(__getArrayIfSingleItem(data["Rule"]), context);
                }
                return [2 /*return*/, Promise.resolve(contents)];
        }
    });
}); };
var deserializeAws_restXmlGetBucketLifecycleConfigurationCommandError = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var parsedOutput, _a, response, errorCode, parsedBody, message;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _a = [__assign({}, output)];
                _b = {};
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                parsedOutput = __assign.apply(void 0, _a.concat([(_b.body = _c.sent(), _b)]));
                errorCode = "UnknownError";
                errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
                switch (errorCode) {
                    default:
                        parsedBody = parsedOutput.body;
                        errorCode = parsedBody.code || parsedBody.Code || errorCode;
                        response = __assign(__assign({}, parsedBody), { name: "" + errorCode, message: parsedBody.message || parsedBody.Message || errorCode, $fault: "client", $metadata: deserializeMetadata(output) });
                }
                message = response.message || response.Message || errorCode;
                response.message = message;
                delete response.Message;
                return [2 /*return*/, Promise.reject(Object.assign(new Error(message), response))];
        }
    });
}); };
export var deserializeAws_restXmlGetBucketLocationCommand = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var contents, data;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (output.statusCode !== 200 && output.statusCode >= 300) {
                    return [2 /*return*/, deserializeAws_restXmlGetBucketLocationCommandError(output, context)];
                }
                contents = {
                    $metadata: deserializeMetadata(output),
                    LocationConstraint: undefined,
                };
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                data = _a.sent();
                if (data["LocationConstraint"] !== undefined) {
                    contents.LocationConstraint = data["LocationConstraint"];
                }
                return [2 /*return*/, Promise.resolve(contents)];
        }
    });
}); };
var deserializeAws_restXmlGetBucketLocationCommandError = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var parsedOutput, _a, response, errorCode, parsedBody, message;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _a = [__assign({}, output)];
                _b = {};
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                parsedOutput = __assign.apply(void 0, _a.concat([(_b.body = _c.sent(), _b)]));
                errorCode = "UnknownError";
                errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
                switch (errorCode) {
                    default:
                        parsedBody = parsedOutput.body;
                        errorCode = parsedBody.code || parsedBody.Code || errorCode;
                        response = __assign(__assign({}, parsedBody), { name: "" + errorCode, message: parsedBody.message || parsedBody.Message || errorCode, $fault: "client", $metadata: deserializeMetadata(output) });
                }
                message = response.message || response.Message || errorCode;
                response.message = message;
                delete response.Message;
                return [2 /*return*/, Promise.reject(Object.assign(new Error(message), response))];
        }
    });
}); };
export var deserializeAws_restXmlGetBucketLoggingCommand = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var contents, data;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (output.statusCode !== 200 && output.statusCode >= 300) {
                    return [2 /*return*/, deserializeAws_restXmlGetBucketLoggingCommandError(output, context)];
                }
                contents = {
                    $metadata: deserializeMetadata(output),
                    LoggingEnabled: undefined,
                };
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                data = _a.sent();
                if (data["LoggingEnabled"] !== undefined) {
                    contents.LoggingEnabled = deserializeAws_restXmlLoggingEnabled(data["LoggingEnabled"], context);
                }
                return [2 /*return*/, Promise.resolve(contents)];
        }
    });
}); };
var deserializeAws_restXmlGetBucketLoggingCommandError = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var parsedOutput, _a, response, errorCode, parsedBody, message;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _a = [__assign({}, output)];
                _b = {};
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                parsedOutput = __assign.apply(void 0, _a.concat([(_b.body = _c.sent(), _b)]));
                errorCode = "UnknownError";
                errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
                switch (errorCode) {
                    default:
                        parsedBody = parsedOutput.body;
                        errorCode = parsedBody.code || parsedBody.Code || errorCode;
                        response = __assign(__assign({}, parsedBody), { name: "" + errorCode, message: parsedBody.message || parsedBody.Message || errorCode, $fault: "client", $metadata: deserializeMetadata(output) });
                }
                message = response.message || response.Message || errorCode;
                response.message = message;
                delete response.Message;
                return [2 /*return*/, Promise.reject(Object.assign(new Error(message), response))];
        }
    });
}); };
export var deserializeAws_restXmlGetBucketMetricsConfigurationCommand = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var contents, data;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (output.statusCode !== 200 && output.statusCode >= 300) {
                    return [2 /*return*/, deserializeAws_restXmlGetBucketMetricsConfigurationCommandError(output, context)];
                }
                contents = {
                    $metadata: deserializeMetadata(output),
                    MetricsConfiguration: undefined,
                };
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                data = _a.sent();
                contents.MetricsConfiguration = deserializeAws_restXmlMetricsConfiguration(data, context);
                return [2 /*return*/, Promise.resolve(contents)];
        }
    });
}); };
var deserializeAws_restXmlGetBucketMetricsConfigurationCommandError = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var parsedOutput, _a, response, errorCode, parsedBody, message;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _a = [__assign({}, output)];
                _b = {};
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                parsedOutput = __assign.apply(void 0, _a.concat([(_b.body = _c.sent(), _b)]));
                errorCode = "UnknownError";
                errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
                switch (errorCode) {
                    default:
                        parsedBody = parsedOutput.body;
                        errorCode = parsedBody.code || parsedBody.Code || errorCode;
                        response = __assign(__assign({}, parsedBody), { name: "" + errorCode, message: parsedBody.message || parsedBody.Message || errorCode, $fault: "client", $metadata: deserializeMetadata(output) });
                }
                message = response.message || response.Message || errorCode;
                response.message = message;
                delete response.Message;
                return [2 /*return*/, Promise.reject(Object.assign(new Error(message), response))];
        }
    });
}); };
export var deserializeAws_restXmlGetBucketNotificationConfigurationCommand = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var contents, data;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (output.statusCode !== 200 && output.statusCode >= 300) {
                    return [2 /*return*/, deserializeAws_restXmlGetBucketNotificationConfigurationCommandError(output, context)];
                }
                contents = {
                    $metadata: deserializeMetadata(output),
                    LambdaFunctionConfigurations: undefined,
                    QueueConfigurations: undefined,
                    TopicConfigurations: undefined,
                };
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                data = _a.sent();
                if (data.CloudFunctionConfiguration === "") {
                    contents.LambdaFunctionConfigurations = [];
                }
                if (data["CloudFunctionConfiguration"] !== undefined) {
                    contents.LambdaFunctionConfigurations = deserializeAws_restXmlLambdaFunctionConfigurationList(__getArrayIfSingleItem(data["CloudFunctionConfiguration"]), context);
                }
                if (data.QueueConfiguration === "") {
                    contents.QueueConfigurations = [];
                }
                if (data["QueueConfiguration"] !== undefined) {
                    contents.QueueConfigurations = deserializeAws_restXmlQueueConfigurationList(__getArrayIfSingleItem(data["QueueConfiguration"]), context);
                }
                if (data.TopicConfiguration === "") {
                    contents.TopicConfigurations = [];
                }
                if (data["TopicConfiguration"] !== undefined) {
                    contents.TopicConfigurations = deserializeAws_restXmlTopicConfigurationList(__getArrayIfSingleItem(data["TopicConfiguration"]), context);
                }
                return [2 /*return*/, Promise.resolve(contents)];
        }
    });
}); };
var deserializeAws_restXmlGetBucketNotificationConfigurationCommandError = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var parsedOutput, _a, response, errorCode, parsedBody, message;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _a = [__assign({}, output)];
                _b = {};
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                parsedOutput = __assign.apply(void 0, _a.concat([(_b.body = _c.sent(), _b)]));
                errorCode = "UnknownError";
                errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
                switch (errorCode) {
                    default:
                        parsedBody = parsedOutput.body;
                        errorCode = parsedBody.code || parsedBody.Code || errorCode;
                        response = __assign(__assign({}, parsedBody), { name: "" + errorCode, message: parsedBody.message || parsedBody.Message || errorCode, $fault: "client", $metadata: deserializeMetadata(output) });
                }
                message = response.message || response.Message || errorCode;
                response.message = message;
                delete response.Message;
                return [2 /*return*/, Promise.reject(Object.assign(new Error(message), response))];
        }
    });
}); };
export var deserializeAws_restXmlGetBucketOwnershipControlsCommand = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var contents, data;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (output.statusCode !== 200 && output.statusCode >= 300) {
                    return [2 /*return*/, deserializeAws_restXmlGetBucketOwnershipControlsCommandError(output, context)];
                }
                contents = {
                    $metadata: deserializeMetadata(output),
                    OwnershipControls: undefined,
                };
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                data = _a.sent();
                contents.OwnershipControls = deserializeAws_restXmlOwnershipControls(data, context);
                return [2 /*return*/, Promise.resolve(contents)];
        }
    });
}); };
var deserializeAws_restXmlGetBucketOwnershipControlsCommandError = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var parsedOutput, _a, response, errorCode, parsedBody, message;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _a = [__assign({}, output)];
                _b = {};
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                parsedOutput = __assign.apply(void 0, _a.concat([(_b.body = _c.sent(), _b)]));
                errorCode = "UnknownError";
                errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
                switch (errorCode) {
                    default:
                        parsedBody = parsedOutput.body;
                        errorCode = parsedBody.code || parsedBody.Code || errorCode;
                        response = __assign(__assign({}, parsedBody), { name: "" + errorCode, message: parsedBody.message || parsedBody.Message || errorCode, $fault: "client", $metadata: deserializeMetadata(output) });
                }
                message = response.message || response.Message || errorCode;
                response.message = message;
                delete response.Message;
                return [2 /*return*/, Promise.reject(Object.assign(new Error(message), response))];
        }
    });
}); };
export var deserializeAws_restXmlGetBucketPolicyCommand = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var contents, data;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (output.statusCode !== 200 && output.statusCode >= 300) {
                    return [2 /*return*/, deserializeAws_restXmlGetBucketPolicyCommandError(output, context)];
                }
                contents = {
                    $metadata: deserializeMetadata(output),
                    Policy: undefined,
                };
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                data = _a.sent();
                if (data["Policy"] !== undefined) {
                    contents.Policy = data["Policy"];
                }
                return [2 /*return*/, Promise.resolve(contents)];
        }
    });
}); };
var deserializeAws_restXmlGetBucketPolicyCommandError = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var parsedOutput, _a, response, errorCode, parsedBody, message;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _a = [__assign({}, output)];
                _b = {};
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                parsedOutput = __assign.apply(void 0, _a.concat([(_b.body = _c.sent(), _b)]));
                errorCode = "UnknownError";
                errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
                switch (errorCode) {
                    default:
                        parsedBody = parsedOutput.body;
                        errorCode = parsedBody.code || parsedBody.Code || errorCode;
                        response = __assign(__assign({}, parsedBody), { name: "" + errorCode, message: parsedBody.message || parsedBody.Message || errorCode, $fault: "client", $metadata: deserializeMetadata(output) });
                }
                message = response.message || response.Message || errorCode;
                response.message = message;
                delete response.Message;
                return [2 /*return*/, Promise.reject(Object.assign(new Error(message), response))];
        }
    });
}); };
export var deserializeAws_restXmlGetBucketPolicyStatusCommand = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var contents, data;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (output.statusCode !== 200 && output.statusCode >= 300) {
                    return [2 /*return*/, deserializeAws_restXmlGetBucketPolicyStatusCommandError(output, context)];
                }
                contents = {
                    $metadata: deserializeMetadata(output),
                    PolicyStatus: undefined,
                };
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                data = _a.sent();
                contents.PolicyStatus = deserializeAws_restXmlPolicyStatus(data, context);
                return [2 /*return*/, Promise.resolve(contents)];
        }
    });
}); };
var deserializeAws_restXmlGetBucketPolicyStatusCommandError = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var parsedOutput, _a, response, errorCode, parsedBody, message;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _a = [__assign({}, output)];
                _b = {};
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                parsedOutput = __assign.apply(void 0, _a.concat([(_b.body = _c.sent(), _b)]));
                errorCode = "UnknownError";
                errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
                switch (errorCode) {
                    default:
                        parsedBody = parsedOutput.body;
                        errorCode = parsedBody.code || parsedBody.Code || errorCode;
                        response = __assign(__assign({}, parsedBody), { name: "" + errorCode, message: parsedBody.message || parsedBody.Message || errorCode, $fault: "client", $metadata: deserializeMetadata(output) });
                }
                message = response.message || response.Message || errorCode;
                response.message = message;
                delete response.Message;
                return [2 /*return*/, Promise.reject(Object.assign(new Error(message), response))];
        }
    });
}); };
export var deserializeAws_restXmlGetBucketReplicationCommand = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var contents, data;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (output.statusCode !== 200 && output.statusCode >= 300) {
                    return [2 /*return*/, deserializeAws_restXmlGetBucketReplicationCommandError(output, context)];
                }
                contents = {
                    $metadata: deserializeMetadata(output),
                    ReplicationConfiguration: undefined,
                };
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                data = _a.sent();
                contents.ReplicationConfiguration = deserializeAws_restXmlReplicationConfiguration(data, context);
                return [2 /*return*/, Promise.resolve(contents)];
        }
    });
}); };
var deserializeAws_restXmlGetBucketReplicationCommandError = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var parsedOutput, _a, response, errorCode, parsedBody, message;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _a = [__assign({}, output)];
                _b = {};
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                parsedOutput = __assign.apply(void 0, _a.concat([(_b.body = _c.sent(), _b)]));
                errorCode = "UnknownError";
                errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
                switch (errorCode) {
                    default:
                        parsedBody = parsedOutput.body;
                        errorCode = parsedBody.code || parsedBody.Code || errorCode;
                        response = __assign(__assign({}, parsedBody), { name: "" + errorCode, message: parsedBody.message || parsedBody.Message || errorCode, $fault: "client", $metadata: deserializeMetadata(output) });
                }
                message = response.message || response.Message || errorCode;
                response.message = message;
                delete response.Message;
                return [2 /*return*/, Promise.reject(Object.assign(new Error(message), response))];
        }
    });
}); };
export var deserializeAws_restXmlGetBucketRequestPaymentCommand = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var contents, data;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (output.statusCode !== 200 && output.statusCode >= 300) {
                    return [2 /*return*/, deserializeAws_restXmlGetBucketRequestPaymentCommandError(output, context)];
                }
                contents = {
                    $metadata: deserializeMetadata(output),
                    Payer: undefined,
                };
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                data = _a.sent();
                if (data["Payer"] !== undefined) {
                    contents.Payer = data["Payer"];
                }
                return [2 /*return*/, Promise.resolve(contents)];
        }
    });
}); };
var deserializeAws_restXmlGetBucketRequestPaymentCommandError = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var parsedOutput, _a, response, errorCode, parsedBody, message;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _a = [__assign({}, output)];
                _b = {};
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                parsedOutput = __assign.apply(void 0, _a.concat([(_b.body = _c.sent(), _b)]));
                errorCode = "UnknownError";
                errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
                switch (errorCode) {
                    default:
                        parsedBody = parsedOutput.body;
                        errorCode = parsedBody.code || parsedBody.Code || errorCode;
                        response = __assign(__assign({}, parsedBody), { name: "" + errorCode, message: parsedBody.message || parsedBody.Message || errorCode, $fault: "client", $metadata: deserializeMetadata(output) });
                }
                message = response.message || response.Message || errorCode;
                response.message = message;
                delete response.Message;
                return [2 /*return*/, Promise.reject(Object.assign(new Error(message), response))];
        }
    });
}); };
export var deserializeAws_restXmlGetBucketTaggingCommand = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var contents, data;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (output.statusCode !== 200 && output.statusCode >= 300) {
                    return [2 /*return*/, deserializeAws_restXmlGetBucketTaggingCommandError(output, context)];
                }
                contents = {
                    $metadata: deserializeMetadata(output),
                    TagSet: undefined,
                };
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                data = _a.sent();
                if (data.TagSet === "") {
                    contents.TagSet = [];
                }
                if (data["TagSet"] !== undefined && data["TagSet"]["Tag"] !== undefined) {
                    contents.TagSet = deserializeAws_restXmlTagSet(__getArrayIfSingleItem(data["TagSet"]["Tag"]), context);
                }
                return [2 /*return*/, Promise.resolve(contents)];
        }
    });
}); };
var deserializeAws_restXmlGetBucketTaggingCommandError = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var parsedOutput, _a, response, errorCode, parsedBody, message;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _a = [__assign({}, output)];
                _b = {};
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                parsedOutput = __assign.apply(void 0, _a.concat([(_b.body = _c.sent(), _b)]));
                errorCode = "UnknownError";
                errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
                switch (errorCode) {
                    default:
                        parsedBody = parsedOutput.body;
                        errorCode = parsedBody.code || parsedBody.Code || errorCode;
                        response = __assign(__assign({}, parsedBody), { name: "" + errorCode, message: parsedBody.message || parsedBody.Message || errorCode, $fault: "client", $metadata: deserializeMetadata(output) });
                }
                message = response.message || response.Message || errorCode;
                response.message = message;
                delete response.Message;
                return [2 /*return*/, Promise.reject(Object.assign(new Error(message), response))];
        }
    });
}); };
export var deserializeAws_restXmlGetBucketVersioningCommand = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var contents, data;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (output.statusCode !== 200 && output.statusCode >= 300) {
                    return [2 /*return*/, deserializeAws_restXmlGetBucketVersioningCommandError(output, context)];
                }
                contents = {
                    $metadata: deserializeMetadata(output),
                    MFADelete: undefined,
                    Status: undefined,
                };
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                data = _a.sent();
                if (data["MfaDelete"] !== undefined) {
                    contents.MFADelete = data["MfaDelete"];
                }
                if (data["Status"] !== undefined) {
                    contents.Status = data["Status"];
                }
                return [2 /*return*/, Promise.resolve(contents)];
        }
    });
}); };
var deserializeAws_restXmlGetBucketVersioningCommandError = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var parsedOutput, _a, response, errorCode, parsedBody, message;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _a = [__assign({}, output)];
                _b = {};
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                parsedOutput = __assign.apply(void 0, _a.concat([(_b.body = _c.sent(), _b)]));
                errorCode = "UnknownError";
                errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
                switch (errorCode) {
                    default:
                        parsedBody = parsedOutput.body;
                        errorCode = parsedBody.code || parsedBody.Code || errorCode;
                        response = __assign(__assign({}, parsedBody), { name: "" + errorCode, message: parsedBody.message || parsedBody.Message || errorCode, $fault: "client", $metadata: deserializeMetadata(output) });
                }
                message = response.message || response.Message || errorCode;
                response.message = message;
                delete response.Message;
                return [2 /*return*/, Promise.reject(Object.assign(new Error(message), response))];
        }
    });
}); };
export var deserializeAws_restXmlGetBucketWebsiteCommand = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var contents, data;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (output.statusCode !== 200 && output.statusCode >= 300) {
                    return [2 /*return*/, deserializeAws_restXmlGetBucketWebsiteCommandError(output, context)];
                }
                contents = {
                    $metadata: deserializeMetadata(output),
                    ErrorDocument: undefined,
                    IndexDocument: undefined,
                    RedirectAllRequestsTo: undefined,
                    RoutingRules: undefined,
                };
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                data = _a.sent();
                if (data["ErrorDocument"] !== undefined) {
                    contents.ErrorDocument = deserializeAws_restXmlErrorDocument(data["ErrorDocument"], context);
                }
                if (data["IndexDocument"] !== undefined) {
                    contents.IndexDocument = deserializeAws_restXmlIndexDocument(data["IndexDocument"], context);
                }
                if (data["RedirectAllRequestsTo"] !== undefined) {
                    contents.RedirectAllRequestsTo = deserializeAws_restXmlRedirectAllRequestsTo(data["RedirectAllRequestsTo"], context);
                }
                if (data.RoutingRules === "") {
                    contents.RoutingRules = [];
                }
                if (data["RoutingRules"] !== undefined && data["RoutingRules"]["RoutingRule"] !== undefined) {
                    contents.RoutingRules = deserializeAws_restXmlRoutingRules(__getArrayIfSingleItem(data["RoutingRules"]["RoutingRule"]), context);
                }
                return [2 /*return*/, Promise.resolve(contents)];
        }
    });
}); };
var deserializeAws_restXmlGetBucketWebsiteCommandError = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var parsedOutput, _a, response, errorCode, parsedBody, message;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _a = [__assign({}, output)];
                _b = {};
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                parsedOutput = __assign.apply(void 0, _a.concat([(_b.body = _c.sent(), _b)]));
                errorCode = "UnknownError";
                errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
                switch (errorCode) {
                    default:
                        parsedBody = parsedOutput.body;
                        errorCode = parsedBody.code || parsedBody.Code || errorCode;
                        response = __assign(__assign({}, parsedBody), { name: "" + errorCode, message: parsedBody.message || parsedBody.Message || errorCode, $fault: "client", $metadata: deserializeMetadata(output) });
                }
                message = response.message || response.Message || errorCode;
                response.message = message;
                delete response.Message;
                return [2 /*return*/, Promise.reject(Object.assign(new Error(message), response))];
        }
    });
}); };
export var deserializeAws_restXmlGetObjectCommand = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var contents, data;
    return __generator(this, function (_a) {
        if (output.statusCode !== 200 && output.statusCode >= 300) {
            return [2 /*return*/, deserializeAws_restXmlGetObjectCommandError(output, context)];
        }
        contents = {
            $metadata: deserializeMetadata(output),
            AcceptRanges: undefined,
            Body: undefined,
            BucketKeyEnabled: undefined,
            CacheControl: undefined,
            ContentDisposition: undefined,
            ContentEncoding: undefined,
            ContentLanguage: undefined,
            ContentLength: undefined,
            ContentRange: undefined,
            ContentType: undefined,
            DeleteMarker: undefined,
            ETag: undefined,
            Expiration: undefined,
            Expires: undefined,
            LastModified: undefined,
            Metadata: undefined,
            MissingMeta: undefined,
            ObjectLockLegalHoldStatus: undefined,
            ObjectLockMode: undefined,
            ObjectLockRetainUntilDate: undefined,
            PartsCount: undefined,
            ReplicationStatus: undefined,
            RequestCharged: undefined,
            Restore: undefined,
            SSECustomerAlgorithm: undefined,
            SSECustomerKeyMD5: undefined,
            SSEKMSKeyId: undefined,
            ServerSideEncryption: undefined,
            StorageClass: undefined,
            TagCount: undefined,
            VersionId: undefined,
            WebsiteRedirectLocation: undefined,
        };
        if (output.headers["x-amz-delete-marker"] !== undefined) {
            contents.DeleteMarker = output.headers["x-amz-delete-marker"] === "true";
        }
        if (output.headers["accept-ranges"] !== undefined) {
            contents.AcceptRanges = output.headers["accept-ranges"];
        }
        if (output.headers["x-amz-expiration"] !== undefined) {
            contents.Expiration = output.headers["x-amz-expiration"];
        }
        if (output.headers["x-amz-restore"] !== undefined) {
            contents.Restore = output.headers["x-amz-restore"];
        }
        if (output.headers["last-modified"] !== undefined) {
            contents.LastModified = new Date(output.headers["last-modified"]);
        }
        if (output.headers["content-length"] !== undefined) {
            contents.ContentLength = parseInt(output.headers["content-length"], 10);
        }
        if (output.headers["etag"] !== undefined) {
            contents.ETag = output.headers["etag"];
        }
        if (output.headers["x-amz-missing-meta"] !== undefined) {
            contents.MissingMeta = parseInt(output.headers["x-amz-missing-meta"], 10);
        }
        if (output.headers["x-amz-version-id"] !== undefined) {
            contents.VersionId = output.headers["x-amz-version-id"];
        }
        if (output.headers["cache-control"] !== undefined) {
            contents.CacheControl = output.headers["cache-control"];
        }
        if (output.headers["content-disposition"] !== undefined) {
            contents.ContentDisposition = output.headers["content-disposition"];
        }
        if (output.headers["content-encoding"] !== undefined) {
            contents.ContentEncoding = output.headers["content-encoding"];
        }
        if (output.headers["content-language"] !== undefined) {
            contents.ContentLanguage = output.headers["content-language"];
        }
        if (output.headers["content-range"] !== undefined) {
            contents.ContentRange = output.headers["content-range"];
        }
        if (output.headers["content-type"] !== undefined) {
            contents.ContentType = output.headers["content-type"];
        }
        if (output.headers["expires"] !== undefined) {
            contents.Expires = new Date(output.headers["expires"]);
        }
        if (output.headers["x-amz-website-redirect-location"] !== undefined) {
            contents.WebsiteRedirectLocation = output.headers["x-amz-website-redirect-location"];
        }
        if (output.headers["x-amz-server-side-encryption"] !== undefined) {
            contents.ServerSideEncryption = output.headers["x-amz-server-side-encryption"];
        }
        if (output.headers["x-amz-server-side-encryption-customer-algorithm"] !== undefined) {
            contents.SSECustomerAlgorithm = output.headers["x-amz-server-side-encryption-customer-algorithm"];
        }
        if (output.headers["x-amz-server-side-encryption-customer-key-md5"] !== undefined) {
            contents.SSECustomerKeyMD5 = output.headers["x-amz-server-side-encryption-customer-key-md5"];
        }
        if (output.headers["x-amz-server-side-encryption-aws-kms-key-id"] !== undefined) {
            contents.SSEKMSKeyId = output.headers["x-amz-server-side-encryption-aws-kms-key-id"];
        }
        if (output.headers["x-amz-server-side-encryption-bucket-key-enabled"] !== undefined) {
            contents.BucketKeyEnabled = output.headers["x-amz-server-side-encryption-bucket-key-enabled"] === "true";
        }
        if (output.headers["x-amz-storage-class"] !== undefined) {
            contents.StorageClass = output.headers["x-amz-storage-class"];
        }
        if (output.headers["x-amz-request-charged"] !== undefined) {
            contents.RequestCharged = output.headers["x-amz-request-charged"];
        }
        if (output.headers["x-amz-replication-status"] !== undefined) {
            contents.ReplicationStatus = output.headers["x-amz-replication-status"];
        }
        if (output.headers["x-amz-mp-parts-count"] !== undefined) {
            contents.PartsCount = parseInt(output.headers["x-amz-mp-parts-count"], 10);
        }
        if (output.headers["x-amz-tagging-count"] !== undefined) {
            contents.TagCount = parseInt(output.headers["x-amz-tagging-count"], 10);
        }
        if (output.headers["x-amz-object-lock-mode"] !== undefined) {
            contents.ObjectLockMode = output.headers["x-amz-object-lock-mode"];
        }
        if (output.headers["x-amz-object-lock-retain-until-date"] !== undefined) {
            contents.ObjectLockRetainUntilDate = new Date(output.headers["x-amz-object-lock-retain-until-date"]);
        }
        if (output.headers["x-amz-object-lock-legal-hold"] !== undefined) {
            contents.ObjectLockLegalHoldStatus = output.headers["x-amz-object-lock-legal-hold"];
        }
        Object.keys(output.headers).forEach(function (header) {
            if (contents.Metadata === undefined) {
                contents.Metadata = {};
            }
            if (header.startsWith("x-amz-meta-")) {
                contents.Metadata[header.substring(11)] = output.headers[header];
            }
        });
        data = output.body;
        contents.Body = data;
        return [2 /*return*/, Promise.resolve(contents)];
    });
}); };
var deserializeAws_restXmlGetObjectCommandError = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var parsedOutput, _a, response, errorCode, _b, _c, _d, parsedBody, message;
    var _e;
    return __generator(this, function (_f) {
        switch (_f.label) {
            case 0:
                _a = [__assign({}, output)];
                _e = {};
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                parsedOutput = __assign.apply(void 0, _a.concat([(_e.body = _f.sent(), _e)]));
                errorCode = "UnknownError";
                errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
                _b = errorCode;
                switch (_b) {
                    case "InvalidObjectState": return [3 /*break*/, 2];
                    case "com.amazonaws.s3#InvalidObjectState": return [3 /*break*/, 2];
                    case "NoSuchKey": return [3 /*break*/, 4];
                    case "com.amazonaws.s3#NoSuchKey": return [3 /*break*/, 4];
                }
                return [3 /*break*/, 6];
            case 2:
                _c = [{}];
                return [4 /*yield*/, deserializeAws_restXmlInvalidObjectStateResponse(parsedOutput, context)];
            case 3:
                response = __assign.apply(void 0, [__assign.apply(void 0, _c.concat([(_f.sent())])), { name: errorCode, $metadata: deserializeMetadata(output) }]);
                return [3 /*break*/, 7];
            case 4:
                _d = [{}];
                return [4 /*yield*/, deserializeAws_restXmlNoSuchKeyResponse(parsedOutput, context)];
            case 5:
                response = __assign.apply(void 0, [__assign.apply(void 0, _d.concat([(_f.sent())])), { name: errorCode, $metadata: deserializeMetadata(output) }]);
                return [3 /*break*/, 7];
            case 6:
                parsedBody = parsedOutput.body;
                errorCode = parsedBody.code || parsedBody.Code || errorCode;
                response = __assign(__assign({}, parsedBody), { name: "" + errorCode, message: parsedBody.message || parsedBody.Message || errorCode, $fault: "client", $metadata: deserializeMetadata(output) });
                _f.label = 7;
            case 7:
                message = response.message || response.Message || errorCode;
                response.message = message;
                delete response.Message;
                return [2 /*return*/, Promise.reject(Object.assign(new Error(message), response))];
        }
    });
}); };
export var deserializeAws_restXmlGetObjectAclCommand = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var contents, data;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (output.statusCode !== 200 && output.statusCode >= 300) {
                    return [2 /*return*/, deserializeAws_restXmlGetObjectAclCommandError(output, context)];
                }
                contents = {
                    $metadata: deserializeMetadata(output),
                    Grants: undefined,
                    Owner: undefined,
                    RequestCharged: undefined,
                };
                if (output.headers["x-amz-request-charged"] !== undefined) {
                    contents.RequestCharged = output.headers["x-amz-request-charged"];
                }
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                data = _a.sent();
                if (data.AccessControlList === "") {
                    contents.Grants = [];
                }
                if (data["AccessControlList"] !== undefined && data["AccessControlList"]["Grant"] !== undefined) {
                    contents.Grants = deserializeAws_restXmlGrants(__getArrayIfSingleItem(data["AccessControlList"]["Grant"]), context);
                }
                if (data["Owner"] !== undefined) {
                    contents.Owner = deserializeAws_restXmlOwner(data["Owner"], context);
                }
                return [2 /*return*/, Promise.resolve(contents)];
        }
    });
}); };
var deserializeAws_restXmlGetObjectAclCommandError = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var parsedOutput, _a, response, errorCode, _b, _c, parsedBody, message;
    var _d;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                _a = [__assign({}, output)];
                _d = {};
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                parsedOutput = __assign.apply(void 0, _a.concat([(_d.body = _e.sent(), _d)]));
                errorCode = "UnknownError";
                errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
                _b = errorCode;
                switch (_b) {
                    case "NoSuchKey": return [3 /*break*/, 2];
                    case "com.amazonaws.s3#NoSuchKey": return [3 /*break*/, 2];
                }
                return [3 /*break*/, 4];
            case 2:
                _c = [{}];
                return [4 /*yield*/, deserializeAws_restXmlNoSuchKeyResponse(parsedOutput, context)];
            case 3:
                response = __assign.apply(void 0, [__assign.apply(void 0, _c.concat([(_e.sent())])), { name: errorCode, $metadata: deserializeMetadata(output) }]);
                return [3 /*break*/, 5];
            case 4:
                parsedBody = parsedOutput.body;
                errorCode = parsedBody.code || parsedBody.Code || errorCode;
                response = __assign(__assign({}, parsedBody), { name: "" + errorCode, message: parsedBody.message || parsedBody.Message || errorCode, $fault: "client", $metadata: deserializeMetadata(output) });
                _e.label = 5;
            case 5:
                message = response.message || response.Message || errorCode;
                response.message = message;
                delete response.Message;
                return [2 /*return*/, Promise.reject(Object.assign(new Error(message), response))];
        }
    });
}); };
export var deserializeAws_restXmlGetObjectLegalHoldCommand = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var contents, data;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (output.statusCode !== 200 && output.statusCode >= 300) {
                    return [2 /*return*/, deserializeAws_restXmlGetObjectLegalHoldCommandError(output, context)];
                }
                contents = {
                    $metadata: deserializeMetadata(output),
                    LegalHold: undefined,
                };
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                data = _a.sent();
                contents.LegalHold = deserializeAws_restXmlObjectLockLegalHold(data, context);
                return [2 /*return*/, Promise.resolve(contents)];
        }
    });
}); };
var deserializeAws_restXmlGetObjectLegalHoldCommandError = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var parsedOutput, _a, response, errorCode, parsedBody, message;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _a = [__assign({}, output)];
                _b = {};
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                parsedOutput = __assign.apply(void 0, _a.concat([(_b.body = _c.sent(), _b)]));
                errorCode = "UnknownError";
                errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
                switch (errorCode) {
                    default:
                        parsedBody = parsedOutput.body;
                        errorCode = parsedBody.code || parsedBody.Code || errorCode;
                        response = __assign(__assign({}, parsedBody), { name: "" + errorCode, message: parsedBody.message || parsedBody.Message || errorCode, $fault: "client", $metadata: deserializeMetadata(output) });
                }
                message = response.message || response.Message || errorCode;
                response.message = message;
                delete response.Message;
                return [2 /*return*/, Promise.reject(Object.assign(new Error(message), response))];
        }
    });
}); };
export var deserializeAws_restXmlGetObjectLockConfigurationCommand = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var contents, data;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (output.statusCode !== 200 && output.statusCode >= 300) {
                    return [2 /*return*/, deserializeAws_restXmlGetObjectLockConfigurationCommandError(output, context)];
                }
                contents = {
                    $metadata: deserializeMetadata(output),
                    ObjectLockConfiguration: undefined,
                };
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                data = _a.sent();
                contents.ObjectLockConfiguration = deserializeAws_restXmlObjectLockConfiguration(data, context);
                return [2 /*return*/, Promise.resolve(contents)];
        }
    });
}); };
var deserializeAws_restXmlGetObjectLockConfigurationCommandError = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var parsedOutput, _a, response, errorCode, parsedBody, message;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _a = [__assign({}, output)];
                _b = {};
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                parsedOutput = __assign.apply(void 0, _a.concat([(_b.body = _c.sent(), _b)]));
                errorCode = "UnknownError";
                errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
                switch (errorCode) {
                    default:
                        parsedBody = parsedOutput.body;
                        errorCode = parsedBody.code || parsedBody.Code || errorCode;
                        response = __assign(__assign({}, parsedBody), { name: "" + errorCode, message: parsedBody.message || parsedBody.Message || errorCode, $fault: "client", $metadata: deserializeMetadata(output) });
                }
                message = response.message || response.Message || errorCode;
                response.message = message;
                delete response.Message;
                return [2 /*return*/, Promise.reject(Object.assign(new Error(message), response))];
        }
    });
}); };
export var deserializeAws_restXmlGetObjectRetentionCommand = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var contents, data;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (output.statusCode !== 200 && output.statusCode >= 300) {
                    return [2 /*return*/, deserializeAws_restXmlGetObjectRetentionCommandError(output, context)];
                }
                contents = {
                    $metadata: deserializeMetadata(output),
                    Retention: undefined,
                };
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                data = _a.sent();
                contents.Retention = deserializeAws_restXmlObjectLockRetention(data, context);
                return [2 /*return*/, Promise.resolve(contents)];
        }
    });
}); };
var deserializeAws_restXmlGetObjectRetentionCommandError = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var parsedOutput, _a, response, errorCode, parsedBody, message;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _a = [__assign({}, output)];
                _b = {};
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                parsedOutput = __assign.apply(void 0, _a.concat([(_b.body = _c.sent(), _b)]));
                errorCode = "UnknownError";
                errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
                switch (errorCode) {
                    default:
                        parsedBody = parsedOutput.body;
                        errorCode = parsedBody.code || parsedBody.Code || errorCode;
                        response = __assign(__assign({}, parsedBody), { name: "" + errorCode, message: parsedBody.message || parsedBody.Message || errorCode, $fault: "client", $metadata: deserializeMetadata(output) });
                }
                message = response.message || response.Message || errorCode;
                response.message = message;
                delete response.Message;
                return [2 /*return*/, Promise.reject(Object.assign(new Error(message), response))];
        }
    });
}); };
export var deserializeAws_restXmlGetObjectTaggingCommand = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var contents, data;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (output.statusCode !== 200 && output.statusCode >= 300) {
                    return [2 /*return*/, deserializeAws_restXmlGetObjectTaggingCommandError(output, context)];
                }
                contents = {
                    $metadata: deserializeMetadata(output),
                    TagSet: undefined,
                    VersionId: undefined,
                };
                if (output.headers["x-amz-version-id"] !== undefined) {
                    contents.VersionId = output.headers["x-amz-version-id"];
                }
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                data = _a.sent();
                if (data.TagSet === "") {
                    contents.TagSet = [];
                }
                if (data["TagSet"] !== undefined && data["TagSet"]["Tag"] !== undefined) {
                    contents.TagSet = deserializeAws_restXmlTagSet(__getArrayIfSingleItem(data["TagSet"]["Tag"]), context);
                }
                return [2 /*return*/, Promise.resolve(contents)];
        }
    });
}); };
var deserializeAws_restXmlGetObjectTaggingCommandError = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var parsedOutput, _a, response, errorCode, parsedBody, message;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _a = [__assign({}, output)];
                _b = {};
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                parsedOutput = __assign.apply(void 0, _a.concat([(_b.body = _c.sent(), _b)]));
                errorCode = "UnknownError";
                errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
                switch (errorCode) {
                    default:
                        parsedBody = parsedOutput.body;
                        errorCode = parsedBody.code || parsedBody.Code || errorCode;
                        response = __assign(__assign({}, parsedBody), { name: "" + errorCode, message: parsedBody.message || parsedBody.Message || errorCode, $fault: "client", $metadata: deserializeMetadata(output) });
                }
                message = response.message || response.Message || errorCode;
                response.message = message;
                delete response.Message;
                return [2 /*return*/, Promise.reject(Object.assign(new Error(message), response))];
        }
    });
}); };
export var deserializeAws_restXmlGetObjectTorrentCommand = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var contents, data;
    return __generator(this, function (_a) {
        if (output.statusCode !== 200 && output.statusCode >= 300) {
            return [2 /*return*/, deserializeAws_restXmlGetObjectTorrentCommandError(output, context)];
        }
        contents = {
            $metadata: deserializeMetadata(output),
            Body: undefined,
            RequestCharged: undefined,
        };
        if (output.headers["x-amz-request-charged"] !== undefined) {
            contents.RequestCharged = output.headers["x-amz-request-charged"];
        }
        data = output.body;
        contents.Body = data;
        return [2 /*return*/, Promise.resolve(contents)];
    });
}); };
var deserializeAws_restXmlGetObjectTorrentCommandError = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var parsedOutput, _a, response, errorCode, parsedBody, message;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _a = [__assign({}, output)];
                _b = {};
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                parsedOutput = __assign.apply(void 0, _a.concat([(_b.body = _c.sent(), _b)]));
                errorCode = "UnknownError";
                errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
                switch (errorCode) {
                    default:
                        parsedBody = parsedOutput.body;
                        errorCode = parsedBody.code || parsedBody.Code || errorCode;
                        response = __assign(__assign({}, parsedBody), { name: "" + errorCode, message: parsedBody.message || parsedBody.Message || errorCode, $fault: "client", $metadata: deserializeMetadata(output) });
                }
                message = response.message || response.Message || errorCode;
                response.message = message;
                delete response.Message;
                return [2 /*return*/, Promise.reject(Object.assign(new Error(message), response))];
        }
    });
}); };
export var deserializeAws_restXmlGetPublicAccessBlockCommand = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var contents, data;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (output.statusCode !== 200 && output.statusCode >= 300) {
                    return [2 /*return*/, deserializeAws_restXmlGetPublicAccessBlockCommandError(output, context)];
                }
                contents = {
                    $metadata: deserializeMetadata(output),
                    PublicAccessBlockConfiguration: undefined,
                };
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                data = _a.sent();
                contents.PublicAccessBlockConfiguration = deserializeAws_restXmlPublicAccessBlockConfiguration(data, context);
                return [2 /*return*/, Promise.resolve(contents)];
        }
    });
}); };
var deserializeAws_restXmlGetPublicAccessBlockCommandError = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var parsedOutput, _a, response, errorCode, parsedBody, message;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _a = [__assign({}, output)];
                _b = {};
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                parsedOutput = __assign.apply(void 0, _a.concat([(_b.body = _c.sent(), _b)]));
                errorCode = "UnknownError";
                errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
                switch (errorCode) {
                    default:
                        parsedBody = parsedOutput.body;
                        errorCode = parsedBody.code || parsedBody.Code || errorCode;
                        response = __assign(__assign({}, parsedBody), { name: "" + errorCode, message: parsedBody.message || parsedBody.Message || errorCode, $fault: "client", $metadata: deserializeMetadata(output) });
                }
                message = response.message || response.Message || errorCode;
                response.message = message;
                delete response.Message;
                return [2 /*return*/, Promise.reject(Object.assign(new Error(message), response))];
        }
    });
}); };
export var deserializeAws_restXmlHeadBucketCommand = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var contents;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (output.statusCode !== 200 && output.statusCode >= 300) {
                    return [2 /*return*/, deserializeAws_restXmlHeadBucketCommandError(output, context)];
                }
                contents = {
                    $metadata: deserializeMetadata(output),
                };
                return [4 /*yield*/, collectBody(output.body, context)];
            case 1:
                _a.sent();
                return [2 /*return*/, Promise.resolve(contents)];
        }
    });
}); };
var deserializeAws_restXmlHeadBucketCommandError = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var parsedOutput, _a, response, errorCode, _b, _c, parsedBody, message;
    var _d;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                _a = [__assign({}, output)];
                _d = {};
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                parsedOutput = __assign.apply(void 0, _a.concat([(_d.body = _e.sent(), _d)]));
                errorCode = "UnknownError";
                errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
                _b = errorCode;
                switch (_b) {
                    case "NoSuchBucket": return [3 /*break*/, 2];
                    case "com.amazonaws.s3#NoSuchBucket": return [3 /*break*/, 2];
                }
                return [3 /*break*/, 4];
            case 2:
                _c = [{}];
                return [4 /*yield*/, deserializeAws_restXmlNoSuchBucketResponse(parsedOutput, context)];
            case 3:
                response = __assign.apply(void 0, [__assign.apply(void 0, _c.concat([(_e.sent())])), { name: errorCode, $metadata: deserializeMetadata(output) }]);
                return [3 /*break*/, 5];
            case 4:
                parsedBody = parsedOutput.body;
                errorCode = parsedBody.code || parsedBody.Code || errorCode;
                response = __assign(__assign({}, parsedBody), { name: "" + errorCode, message: parsedBody.message || parsedBody.Message || errorCode, $fault: "client", $metadata: deserializeMetadata(output) });
                _e.label = 5;
            case 5:
                message = response.message || response.Message || errorCode;
                response.message = message;
                delete response.Message;
                return [2 /*return*/, Promise.reject(Object.assign(new Error(message), response))];
        }
    });
}); };
export var deserializeAws_restXmlHeadObjectCommand = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var contents;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (output.statusCode !== 200 && output.statusCode >= 300) {
                    return [2 /*return*/, deserializeAws_restXmlHeadObjectCommandError(output, context)];
                }
                contents = {
                    $metadata: deserializeMetadata(output),
                    AcceptRanges: undefined,
                    ArchiveStatus: undefined,
                    BucketKeyEnabled: undefined,
                    CacheControl: undefined,
                    ContentDisposition: undefined,
                    ContentEncoding: undefined,
                    ContentLanguage: undefined,
                    ContentLength: undefined,
                    ContentType: undefined,
                    DeleteMarker: undefined,
                    ETag: undefined,
                    Expiration: undefined,
                    Expires: undefined,
                    LastModified: undefined,
                    Metadata: undefined,
                    MissingMeta: undefined,
                    ObjectLockLegalHoldStatus: undefined,
                    ObjectLockMode: undefined,
                    ObjectLockRetainUntilDate: undefined,
                    PartsCount: undefined,
                    ReplicationStatus: undefined,
                    RequestCharged: undefined,
                    Restore: undefined,
                    SSECustomerAlgorithm: undefined,
                    SSECustomerKeyMD5: undefined,
                    SSEKMSKeyId: undefined,
                    ServerSideEncryption: undefined,
                    StorageClass: undefined,
                    VersionId: undefined,
                    WebsiteRedirectLocation: undefined,
                };
                if (output.headers["x-amz-delete-marker"] !== undefined) {
                    contents.DeleteMarker = output.headers["x-amz-delete-marker"] === "true";
                }
                if (output.headers["accept-ranges"] !== undefined) {
                    contents.AcceptRanges = output.headers["accept-ranges"];
                }
                if (output.headers["x-amz-expiration"] !== undefined) {
                    contents.Expiration = output.headers["x-amz-expiration"];
                }
                if (output.headers["x-amz-restore"] !== undefined) {
                    contents.Restore = output.headers["x-amz-restore"];
                }
                if (output.headers["x-amz-archive-status"] !== undefined) {
                    contents.ArchiveStatus = output.headers["x-amz-archive-status"];
                }
                if (output.headers["last-modified"] !== undefined) {
                    contents.LastModified = new Date(output.headers["last-modified"]);
                }
                if (output.headers["content-length"] !== undefined) {
                    contents.ContentLength = parseInt(output.headers["content-length"], 10);
                }
                if (output.headers["etag"] !== undefined) {
                    contents.ETag = output.headers["etag"];
                }
                if (output.headers["x-amz-missing-meta"] !== undefined) {
                    contents.MissingMeta = parseInt(output.headers["x-amz-missing-meta"], 10);
                }
                if (output.headers["x-amz-version-id"] !== undefined) {
                    contents.VersionId = output.headers["x-amz-version-id"];
                }
                if (output.headers["cache-control"] !== undefined) {
                    contents.CacheControl = output.headers["cache-control"];
                }
                if (output.headers["content-disposition"] !== undefined) {
                    contents.ContentDisposition = output.headers["content-disposition"];
                }
                if (output.headers["content-encoding"] !== undefined) {
                    contents.ContentEncoding = output.headers["content-encoding"];
                }
                if (output.headers["content-language"] !== undefined) {
                    contents.ContentLanguage = output.headers["content-language"];
                }
                if (output.headers["content-type"] !== undefined) {
                    contents.ContentType = output.headers["content-type"];
                }
                if (output.headers["expires"] !== undefined) {
                    contents.Expires = new Date(output.headers["expires"]);
                }
                if (output.headers["x-amz-website-redirect-location"] !== undefined) {
                    contents.WebsiteRedirectLocation = output.headers["x-amz-website-redirect-location"];
                }
                if (output.headers["x-amz-server-side-encryption"] !== undefined) {
                    contents.ServerSideEncryption = output.headers["x-amz-server-side-encryption"];
                }
                if (output.headers["x-amz-server-side-encryption-customer-algorithm"] !== undefined) {
                    contents.SSECustomerAlgorithm = output.headers["x-amz-server-side-encryption-customer-algorithm"];
                }
                if (output.headers["x-amz-server-side-encryption-customer-key-md5"] !== undefined) {
                    contents.SSECustomerKeyMD5 = output.headers["x-amz-server-side-encryption-customer-key-md5"];
                }
                if (output.headers["x-amz-server-side-encryption-aws-kms-key-id"] !== undefined) {
                    contents.SSEKMSKeyId = output.headers["x-amz-server-side-encryption-aws-kms-key-id"];
                }
                if (output.headers["x-amz-server-side-encryption-bucket-key-enabled"] !== undefined) {
                    contents.BucketKeyEnabled = output.headers["x-amz-server-side-encryption-bucket-key-enabled"] === "true";
                }
                if (output.headers["x-amz-storage-class"] !== undefined) {
                    contents.StorageClass = output.headers["x-amz-storage-class"];
                }
                if (output.headers["x-amz-request-charged"] !== undefined) {
                    contents.RequestCharged = output.headers["x-amz-request-charged"];
                }
                if (output.headers["x-amz-replication-status"] !== undefined) {
                    contents.ReplicationStatus = output.headers["x-amz-replication-status"];
                }
                if (output.headers["x-amz-mp-parts-count"] !== undefined) {
                    contents.PartsCount = parseInt(output.headers["x-amz-mp-parts-count"], 10);
                }
                if (output.headers["x-amz-object-lock-mode"] !== undefined) {
                    contents.ObjectLockMode = output.headers["x-amz-object-lock-mode"];
                }
                if (output.headers["x-amz-object-lock-retain-until-date"] !== undefined) {
                    contents.ObjectLockRetainUntilDate = new Date(output.headers["x-amz-object-lock-retain-until-date"]);
                }
                if (output.headers["x-amz-object-lock-legal-hold"] !== undefined) {
                    contents.ObjectLockLegalHoldStatus = output.headers["x-amz-object-lock-legal-hold"];
                }
                Object.keys(output.headers).forEach(function (header) {
                    if (contents.Metadata === undefined) {
                        contents.Metadata = {};
                    }
                    if (header.startsWith("x-amz-meta-")) {
                        contents.Metadata[header.substring(11)] = output.headers[header];
                    }
                });
                return [4 /*yield*/, collectBody(output.body, context)];
            case 1:
                _a.sent();
                return [2 /*return*/, Promise.resolve(contents)];
        }
    });
}); };
var deserializeAws_restXmlHeadObjectCommandError = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var parsedOutput, _a, response, errorCode, _b, _c, parsedBody, message;
    var _d;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                _a = [__assign({}, output)];
                _d = {};
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                parsedOutput = __assign.apply(void 0, _a.concat([(_d.body = _e.sent(), _d)]));
                errorCode = "UnknownError";
                errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
                _b = errorCode;
                switch (_b) {
                    case "NoSuchKey": return [3 /*break*/, 2];
                    case "com.amazonaws.s3#NoSuchKey": return [3 /*break*/, 2];
                }
                return [3 /*break*/, 4];
            case 2:
                _c = [{}];
                return [4 /*yield*/, deserializeAws_restXmlNoSuchKeyResponse(parsedOutput, context)];
            case 3:
                response = __assign.apply(void 0, [__assign.apply(void 0, _c.concat([(_e.sent())])), { name: errorCode, $metadata: deserializeMetadata(output) }]);
                return [3 /*break*/, 5];
            case 4:
                parsedBody = parsedOutput.body;
                errorCode = parsedBody.code || parsedBody.Code || errorCode;
                response = __assign(__assign({}, parsedBody), { name: "" + errorCode, message: parsedBody.message || parsedBody.Message || errorCode, $fault: "client", $metadata: deserializeMetadata(output) });
                _e.label = 5;
            case 5:
                message = response.message || response.Message || errorCode;
                response.message = message;
                delete response.Message;
                return [2 /*return*/, Promise.reject(Object.assign(new Error(message), response))];
        }
    });
}); };
export var deserializeAws_restXmlListBucketAnalyticsConfigurationsCommand = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var contents, data;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (output.statusCode !== 200 && output.statusCode >= 300) {
                    return [2 /*return*/, deserializeAws_restXmlListBucketAnalyticsConfigurationsCommandError(output, context)];
                }
                contents = {
                    $metadata: deserializeMetadata(output),
                    AnalyticsConfigurationList: undefined,
                    ContinuationToken: undefined,
                    IsTruncated: undefined,
                    NextContinuationToken: undefined,
                };
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                data = _a.sent();
                if (data.AnalyticsConfiguration === "") {
                    contents.AnalyticsConfigurationList = [];
                }
                if (data["AnalyticsConfiguration"] !== undefined) {
                    contents.AnalyticsConfigurationList = deserializeAws_restXmlAnalyticsConfigurationList(__getArrayIfSingleItem(data["AnalyticsConfiguration"]), context);
                }
                if (data["ContinuationToken"] !== undefined) {
                    contents.ContinuationToken = data["ContinuationToken"];
                }
                if (data["IsTruncated"] !== undefined) {
                    contents.IsTruncated = data["IsTruncated"] == "true";
                }
                if (data["NextContinuationToken"] !== undefined) {
                    contents.NextContinuationToken = data["NextContinuationToken"];
                }
                return [2 /*return*/, Promise.resolve(contents)];
        }
    });
}); };
var deserializeAws_restXmlListBucketAnalyticsConfigurationsCommandError = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var parsedOutput, _a, response, errorCode, parsedBody, message;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _a = [__assign({}, output)];
                _b = {};
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                parsedOutput = __assign.apply(void 0, _a.concat([(_b.body = _c.sent(), _b)]));
                errorCode = "UnknownError";
                errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
                switch (errorCode) {
                    default:
                        parsedBody = parsedOutput.body;
                        errorCode = parsedBody.code || parsedBody.Code || errorCode;
                        response = __assign(__assign({}, parsedBody), { name: "" + errorCode, message: parsedBody.message || parsedBody.Message || errorCode, $fault: "client", $metadata: deserializeMetadata(output) });
                }
                message = response.message || response.Message || errorCode;
                response.message = message;
                delete response.Message;
                return [2 /*return*/, Promise.reject(Object.assign(new Error(message), response))];
        }
    });
}); };
export var deserializeAws_restXmlListBucketIntelligentTieringConfigurationsCommand = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var contents, data;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (output.statusCode !== 200 && output.statusCode >= 300) {
                    return [2 /*return*/, deserializeAws_restXmlListBucketIntelligentTieringConfigurationsCommandError(output, context)];
                }
                contents = {
                    $metadata: deserializeMetadata(output),
                    ContinuationToken: undefined,
                    IntelligentTieringConfigurationList: undefined,
                    IsTruncated: undefined,
                    NextContinuationToken: undefined,
                };
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                data = _a.sent();
                if (data["ContinuationToken"] !== undefined) {
                    contents.ContinuationToken = data["ContinuationToken"];
                }
                if (data.IntelligentTieringConfiguration === "") {
                    contents.IntelligentTieringConfigurationList = [];
                }
                if (data["IntelligentTieringConfiguration"] !== undefined) {
                    contents.IntelligentTieringConfigurationList = deserializeAws_restXmlIntelligentTieringConfigurationList(__getArrayIfSingleItem(data["IntelligentTieringConfiguration"]), context);
                }
                if (data["IsTruncated"] !== undefined) {
                    contents.IsTruncated = data["IsTruncated"] == "true";
                }
                if (data["NextContinuationToken"] !== undefined) {
                    contents.NextContinuationToken = data["NextContinuationToken"];
                }
                return [2 /*return*/, Promise.resolve(contents)];
        }
    });
}); };
var deserializeAws_restXmlListBucketIntelligentTieringConfigurationsCommandError = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var parsedOutput, _a, response, errorCode, parsedBody, message;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _a = [__assign({}, output)];
                _b = {};
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                parsedOutput = __assign.apply(void 0, _a.concat([(_b.body = _c.sent(), _b)]));
                errorCode = "UnknownError";
                errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
                switch (errorCode) {
                    default:
                        parsedBody = parsedOutput.body;
                        errorCode = parsedBody.code || parsedBody.Code || errorCode;
                        response = __assign(__assign({}, parsedBody), { name: "" + errorCode, message: parsedBody.message || parsedBody.Message || errorCode, $fault: "client", $metadata: deserializeMetadata(output) });
                }
                message = response.message || response.Message || errorCode;
                response.message = message;
                delete response.Message;
                return [2 /*return*/, Promise.reject(Object.assign(new Error(message), response))];
        }
    });
}); };
export var deserializeAws_restXmlListBucketInventoryConfigurationsCommand = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var contents, data;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (output.statusCode !== 200 && output.statusCode >= 300) {
                    return [2 /*return*/, deserializeAws_restXmlListBucketInventoryConfigurationsCommandError(output, context)];
                }
                contents = {
                    $metadata: deserializeMetadata(output),
                    ContinuationToken: undefined,
                    InventoryConfigurationList: undefined,
                    IsTruncated: undefined,
                    NextContinuationToken: undefined,
                };
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                data = _a.sent();
                if (data["ContinuationToken"] !== undefined) {
                    contents.ContinuationToken = data["ContinuationToken"];
                }
                if (data.InventoryConfiguration === "") {
                    contents.InventoryConfigurationList = [];
                }
                if (data["InventoryConfiguration"] !== undefined) {
                    contents.InventoryConfigurationList = deserializeAws_restXmlInventoryConfigurationList(__getArrayIfSingleItem(data["InventoryConfiguration"]), context);
                }
                if (data["IsTruncated"] !== undefined) {
                    contents.IsTruncated = data["IsTruncated"] == "true";
                }
                if (data["NextContinuationToken"] !== undefined) {
                    contents.NextContinuationToken = data["NextContinuationToken"];
                }
                return [2 /*return*/, Promise.resolve(contents)];
        }
    });
}); };
var deserializeAws_restXmlListBucketInventoryConfigurationsCommandError = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var parsedOutput, _a, response, errorCode, parsedBody, message;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _a = [__assign({}, output)];
                _b = {};
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                parsedOutput = __assign.apply(void 0, _a.concat([(_b.body = _c.sent(), _b)]));
                errorCode = "UnknownError";
                errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
                switch (errorCode) {
                    default:
                        parsedBody = parsedOutput.body;
                        errorCode = parsedBody.code || parsedBody.Code || errorCode;
                        response = __assign(__assign({}, parsedBody), { name: "" + errorCode, message: parsedBody.message || parsedBody.Message || errorCode, $fault: "client", $metadata: deserializeMetadata(output) });
                }
                message = response.message || response.Message || errorCode;
                response.message = message;
                delete response.Message;
                return [2 /*return*/, Promise.reject(Object.assign(new Error(message), response))];
        }
    });
}); };
export var deserializeAws_restXmlListBucketMetricsConfigurationsCommand = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var contents, data;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (output.statusCode !== 200 && output.statusCode >= 300) {
                    return [2 /*return*/, deserializeAws_restXmlListBucketMetricsConfigurationsCommandError(output, context)];
                }
                contents = {
                    $metadata: deserializeMetadata(output),
                    ContinuationToken: undefined,
                    IsTruncated: undefined,
                    MetricsConfigurationList: undefined,
                    NextContinuationToken: undefined,
                };
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                data = _a.sent();
                if (data["ContinuationToken"] !== undefined) {
                    contents.ContinuationToken = data["ContinuationToken"];
                }
                if (data["IsTruncated"] !== undefined) {
                    contents.IsTruncated = data["IsTruncated"] == "true";
                }
                if (data.MetricsConfiguration === "") {
                    contents.MetricsConfigurationList = [];
                }
                if (data["MetricsConfiguration"] !== undefined) {
                    contents.MetricsConfigurationList = deserializeAws_restXmlMetricsConfigurationList(__getArrayIfSingleItem(data["MetricsConfiguration"]), context);
                }
                if (data["NextContinuationToken"] !== undefined) {
                    contents.NextContinuationToken = data["NextContinuationToken"];
                }
                return [2 /*return*/, Promise.resolve(contents)];
        }
    });
}); };
var deserializeAws_restXmlListBucketMetricsConfigurationsCommandError = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var parsedOutput, _a, response, errorCode, parsedBody, message;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _a = [__assign({}, output)];
                _b = {};
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                parsedOutput = __assign.apply(void 0, _a.concat([(_b.body = _c.sent(), _b)]));
                errorCode = "UnknownError";
                errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
                switch (errorCode) {
                    default:
                        parsedBody = parsedOutput.body;
                        errorCode = parsedBody.code || parsedBody.Code || errorCode;
                        response = __assign(__assign({}, parsedBody), { name: "" + errorCode, message: parsedBody.message || parsedBody.Message || errorCode, $fault: "client", $metadata: deserializeMetadata(output) });
                }
                message = response.message || response.Message || errorCode;
                response.message = message;
                delete response.Message;
                return [2 /*return*/, Promise.reject(Object.assign(new Error(message), response))];
        }
    });
}); };
export var deserializeAws_restXmlListBucketsCommand = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var contents, data;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (output.statusCode !== 200 && output.statusCode >= 300) {
                    return [2 /*return*/, deserializeAws_restXmlListBucketsCommandError(output, context)];
                }
                contents = {
                    $metadata: deserializeMetadata(output),
                    Buckets: undefined,
                    Owner: undefined,
                };
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                data = _a.sent();
                if (data.Buckets === "") {
                    contents.Buckets = [];
                }
                if (data["Buckets"] !== undefined && data["Buckets"]["Bucket"] !== undefined) {
                    contents.Buckets = deserializeAws_restXmlBuckets(__getArrayIfSingleItem(data["Buckets"]["Bucket"]), context);
                }
                if (data["Owner"] !== undefined) {
                    contents.Owner = deserializeAws_restXmlOwner(data["Owner"], context);
                }
                return [2 /*return*/, Promise.resolve(contents)];
        }
    });
}); };
var deserializeAws_restXmlListBucketsCommandError = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var parsedOutput, _a, response, errorCode, parsedBody, message;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _a = [__assign({}, output)];
                _b = {};
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                parsedOutput = __assign.apply(void 0, _a.concat([(_b.body = _c.sent(), _b)]));
                errorCode = "UnknownError";
                errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
                switch (errorCode) {
                    default:
                        parsedBody = parsedOutput.body;
                        errorCode = parsedBody.code || parsedBody.Code || errorCode;
                        response = __assign(__assign({}, parsedBody), { name: "" + errorCode, message: parsedBody.message || parsedBody.Message || errorCode, $fault: "client", $metadata: deserializeMetadata(output) });
                }
                message = response.message || response.Message || errorCode;
                response.message = message;
                delete response.Message;
                return [2 /*return*/, Promise.reject(Object.assign(new Error(message), response))];
        }
    });
}); };
export var deserializeAws_restXmlListMultipartUploadsCommand = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var contents, data;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (output.statusCode !== 200 && output.statusCode >= 300) {
                    return [2 /*return*/, deserializeAws_restXmlListMultipartUploadsCommandError(output, context)];
                }
                contents = {
                    $metadata: deserializeMetadata(output),
                    Bucket: undefined,
                    CommonPrefixes: undefined,
                    Delimiter: undefined,
                    EncodingType: undefined,
                    IsTruncated: undefined,
                    KeyMarker: undefined,
                    MaxUploads: undefined,
                    NextKeyMarker: undefined,
                    NextUploadIdMarker: undefined,
                    Prefix: undefined,
                    UploadIdMarker: undefined,
                    Uploads: undefined,
                };
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                data = _a.sent();
                if (data["Bucket"] !== undefined) {
                    contents.Bucket = data["Bucket"];
                }
                if (data.CommonPrefixes === "") {
                    contents.CommonPrefixes = [];
                }
                if (data["CommonPrefixes"] !== undefined) {
                    contents.CommonPrefixes = deserializeAws_restXmlCommonPrefixList(__getArrayIfSingleItem(data["CommonPrefixes"]), context);
                }
                if (data["Delimiter"] !== undefined) {
                    contents.Delimiter = data["Delimiter"];
                }
                if (data["EncodingType"] !== undefined) {
                    contents.EncodingType = data["EncodingType"];
                }
                if (data["IsTruncated"] !== undefined) {
                    contents.IsTruncated = data["IsTruncated"] == "true";
                }
                if (data["KeyMarker"] !== undefined) {
                    contents.KeyMarker = data["KeyMarker"];
                }
                if (data["MaxUploads"] !== undefined) {
                    contents.MaxUploads = parseInt(data["MaxUploads"]);
                }
                if (data["NextKeyMarker"] !== undefined) {
                    contents.NextKeyMarker = data["NextKeyMarker"];
                }
                if (data["NextUploadIdMarker"] !== undefined) {
                    contents.NextUploadIdMarker = data["NextUploadIdMarker"];
                }
                if (data["Prefix"] !== undefined) {
                    contents.Prefix = data["Prefix"];
                }
                if (data["UploadIdMarker"] !== undefined) {
                    contents.UploadIdMarker = data["UploadIdMarker"];
                }
                if (data.Upload === "") {
                    contents.Uploads = [];
                }
                if (data["Upload"] !== undefined) {
                    contents.Uploads = deserializeAws_restXmlMultipartUploadList(__getArrayIfSingleItem(data["Upload"]), context);
                }
                return [2 /*return*/, Promise.resolve(contents)];
        }
    });
}); };
var deserializeAws_restXmlListMultipartUploadsCommandError = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var parsedOutput, _a, response, errorCode, parsedBody, message;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _a = [__assign({}, output)];
                _b = {};
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                parsedOutput = __assign.apply(void 0, _a.concat([(_b.body = _c.sent(), _b)]));
                errorCode = "UnknownError";
                errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
                switch (errorCode) {
                    default:
                        parsedBody = parsedOutput.body;
                        errorCode = parsedBody.code || parsedBody.Code || errorCode;
                        response = __assign(__assign({}, parsedBody), { name: "" + errorCode, message: parsedBody.message || parsedBody.Message || errorCode, $fault: "client", $metadata: deserializeMetadata(output) });
                }
                message = response.message || response.Message || errorCode;
                response.message = message;
                delete response.Message;
                return [2 /*return*/, Promise.reject(Object.assign(new Error(message), response))];
        }
    });
}); };
export var deserializeAws_restXmlListObjectsCommand = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var contents, data;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (output.statusCode !== 200 && output.statusCode >= 300) {
                    return [2 /*return*/, deserializeAws_restXmlListObjectsCommandError(output, context)];
                }
                contents = {
                    $metadata: deserializeMetadata(output),
                    CommonPrefixes: undefined,
                    Contents: undefined,
                    Delimiter: undefined,
                    EncodingType: undefined,
                    IsTruncated: undefined,
                    Marker: undefined,
                    MaxKeys: undefined,
                    Name: undefined,
                    NextMarker: undefined,
                    Prefix: undefined,
                };
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                data = _a.sent();
                if (data.CommonPrefixes === "") {
                    contents.CommonPrefixes = [];
                }
                if (data["CommonPrefixes"] !== undefined) {
                    contents.CommonPrefixes = deserializeAws_restXmlCommonPrefixList(__getArrayIfSingleItem(data["CommonPrefixes"]), context);
                }
                if (data.Contents === "") {
                    contents.Contents = [];
                }
                if (data["Contents"] !== undefined) {
                    contents.Contents = deserializeAws_restXmlObjectList(__getArrayIfSingleItem(data["Contents"]), context);
                }
                if (data["Delimiter"] !== undefined) {
                    contents.Delimiter = data["Delimiter"];
                }
                if (data["EncodingType"] !== undefined) {
                    contents.EncodingType = data["EncodingType"];
                }
                if (data["IsTruncated"] !== undefined) {
                    contents.IsTruncated = data["IsTruncated"] == "true";
                }
                if (data["Marker"] !== undefined) {
                    contents.Marker = data["Marker"];
                }
                if (data["MaxKeys"] !== undefined) {
                    contents.MaxKeys = parseInt(data["MaxKeys"]);
                }
                if (data["Name"] !== undefined) {
                    contents.Name = data["Name"];
                }
                if (data["NextMarker"] !== undefined) {
                    contents.NextMarker = data["NextMarker"];
                }
                if (data["Prefix"] !== undefined) {
                    contents.Prefix = data["Prefix"];
                }
                return [2 /*return*/, Promise.resolve(contents)];
        }
    });
}); };
var deserializeAws_restXmlListObjectsCommandError = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var parsedOutput, _a, response, errorCode, _b, _c, parsedBody, message;
    var _d;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                _a = [__assign({}, output)];
                _d = {};
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                parsedOutput = __assign.apply(void 0, _a.concat([(_d.body = _e.sent(), _d)]));
                errorCode = "UnknownError";
                errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
                _b = errorCode;
                switch (_b) {
                    case "NoSuchBucket": return [3 /*break*/, 2];
                    case "com.amazonaws.s3#NoSuchBucket": return [3 /*break*/, 2];
                }
                return [3 /*break*/, 4];
            case 2:
                _c = [{}];
                return [4 /*yield*/, deserializeAws_restXmlNoSuchBucketResponse(parsedOutput, context)];
            case 3:
                response = __assign.apply(void 0, [__assign.apply(void 0, _c.concat([(_e.sent())])), { name: errorCode, $metadata: deserializeMetadata(output) }]);
                return [3 /*break*/, 5];
            case 4:
                parsedBody = parsedOutput.body;
                errorCode = parsedBody.code || parsedBody.Code || errorCode;
                response = __assign(__assign({}, parsedBody), { name: "" + errorCode, message: parsedBody.message || parsedBody.Message || errorCode, $fault: "client", $metadata: deserializeMetadata(output) });
                _e.label = 5;
            case 5:
                message = response.message || response.Message || errorCode;
                response.message = message;
                delete response.Message;
                return [2 /*return*/, Promise.reject(Object.assign(new Error(message), response))];
        }
    });
}); };
export var deserializeAws_restXmlListObjectsV2Command = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var contents, data;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (output.statusCode !== 200 && output.statusCode >= 300) {
                    return [2 /*return*/, deserializeAws_restXmlListObjectsV2CommandError(output, context)];
                }
                contents = {
                    $metadata: deserializeMetadata(output),
                    CommonPrefixes: undefined,
                    Contents: undefined,
                    ContinuationToken: undefined,
                    Delimiter: undefined,
                    EncodingType: undefined,
                    IsTruncated: undefined,
                    KeyCount: undefined,
                    MaxKeys: undefined,
                    Name: undefined,
                    NextContinuationToken: undefined,
                    Prefix: undefined,
                    StartAfter: undefined,
                };
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                data = _a.sent();
                if (data.CommonPrefixes === "") {
                    contents.CommonPrefixes = [];
                }
                if (data["CommonPrefixes"] !== undefined) {
                    contents.CommonPrefixes = deserializeAws_restXmlCommonPrefixList(__getArrayIfSingleItem(data["CommonPrefixes"]), context);
                }
                if (data.Contents === "") {
                    contents.Contents = [];
                }
                if (data["Contents"] !== undefined) {
                    contents.Contents = deserializeAws_restXmlObjectList(__getArrayIfSingleItem(data["Contents"]), context);
                }
                if (data["ContinuationToken"] !== undefined) {
                    contents.ContinuationToken = data["ContinuationToken"];
                }
                if (data["Delimiter"] !== undefined) {
                    contents.Delimiter = data["Delimiter"];
                }
                if (data["EncodingType"] !== undefined) {
                    contents.EncodingType = data["EncodingType"];
                }
                if (data["IsTruncated"] !== undefined) {
                    contents.IsTruncated = data["IsTruncated"] == "true";
                }
                if (data["KeyCount"] !== undefined) {
                    contents.KeyCount = parseInt(data["KeyCount"]);
                }
                if (data["MaxKeys"] !== undefined) {
                    contents.MaxKeys = parseInt(data["MaxKeys"]);
                }
                if (data["Name"] !== undefined) {
                    contents.Name = data["Name"];
                }
                if (data["NextContinuationToken"] !== undefined) {
                    contents.NextContinuationToken = data["NextContinuationToken"];
                }
                if (data["Prefix"] !== undefined) {
                    contents.Prefix = data["Prefix"];
                }
                if (data["StartAfter"] !== undefined) {
                    contents.StartAfter = data["StartAfter"];
                }
                return [2 /*return*/, Promise.resolve(contents)];
        }
    });
}); };
var deserializeAws_restXmlListObjectsV2CommandError = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var parsedOutput, _a, response, errorCode, _b, _c, parsedBody, message;
    var _d;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                _a = [__assign({}, output)];
                _d = {};
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                parsedOutput = __assign.apply(void 0, _a.concat([(_d.body = _e.sent(), _d)]));
                errorCode = "UnknownError";
                errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
                _b = errorCode;
                switch (_b) {
                    case "NoSuchBucket": return [3 /*break*/, 2];
                    case "com.amazonaws.s3#NoSuchBucket": return [3 /*break*/, 2];
                }
                return [3 /*break*/, 4];
            case 2:
                _c = [{}];
                return [4 /*yield*/, deserializeAws_restXmlNoSuchBucketResponse(parsedOutput, context)];
            case 3:
                response = __assign.apply(void 0, [__assign.apply(void 0, _c.concat([(_e.sent())])), { name: errorCode, $metadata: deserializeMetadata(output) }]);
                return [3 /*break*/, 5];
            case 4:
                parsedBody = parsedOutput.body;
                errorCode = parsedBody.code || parsedBody.Code || errorCode;
                response = __assign(__assign({}, parsedBody), { name: "" + errorCode, message: parsedBody.message || parsedBody.Message || errorCode, $fault: "client", $metadata: deserializeMetadata(output) });
                _e.label = 5;
            case 5:
                message = response.message || response.Message || errorCode;
                response.message = message;
                delete response.Message;
                return [2 /*return*/, Promise.reject(Object.assign(new Error(message), response))];
        }
    });
}); };
export var deserializeAws_restXmlListObjectVersionsCommand = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var contents, data;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (output.statusCode !== 200 && output.statusCode >= 300) {
                    return [2 /*return*/, deserializeAws_restXmlListObjectVersionsCommandError(output, context)];
                }
                contents = {
                    $metadata: deserializeMetadata(output),
                    CommonPrefixes: undefined,
                    DeleteMarkers: undefined,
                    Delimiter: undefined,
                    EncodingType: undefined,
                    IsTruncated: undefined,
                    KeyMarker: undefined,
                    MaxKeys: undefined,
                    Name: undefined,
                    NextKeyMarker: undefined,
                    NextVersionIdMarker: undefined,
                    Prefix: undefined,
                    VersionIdMarker: undefined,
                    Versions: undefined,
                };
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                data = _a.sent();
                if (data.CommonPrefixes === "") {
                    contents.CommonPrefixes = [];
                }
                if (data["CommonPrefixes"] !== undefined) {
                    contents.CommonPrefixes = deserializeAws_restXmlCommonPrefixList(__getArrayIfSingleItem(data["CommonPrefixes"]), context);
                }
                if (data.DeleteMarker === "") {
                    contents.DeleteMarkers = [];
                }
                if (data["DeleteMarker"] !== undefined) {
                    contents.DeleteMarkers = deserializeAws_restXmlDeleteMarkers(__getArrayIfSingleItem(data["DeleteMarker"]), context);
                }
                if (data["Delimiter"] !== undefined) {
                    contents.Delimiter = data["Delimiter"];
                }
                if (data["EncodingType"] !== undefined) {
                    contents.EncodingType = data["EncodingType"];
                }
                if (data["IsTruncated"] !== undefined) {
                    contents.IsTruncated = data["IsTruncated"] == "true";
                }
                if (data["KeyMarker"] !== undefined) {
                    contents.KeyMarker = data["KeyMarker"];
                }
                if (data["MaxKeys"] !== undefined) {
                    contents.MaxKeys = parseInt(data["MaxKeys"]);
                }
                if (data["Name"] !== undefined) {
                    contents.Name = data["Name"];
                }
                if (data["NextKeyMarker"] !== undefined) {
                    contents.NextKeyMarker = data["NextKeyMarker"];
                }
                if (data["NextVersionIdMarker"] !== undefined) {
                    contents.NextVersionIdMarker = data["NextVersionIdMarker"];
                }
                if (data["Prefix"] !== undefined) {
                    contents.Prefix = data["Prefix"];
                }
                if (data["VersionIdMarker"] !== undefined) {
                    contents.VersionIdMarker = data["VersionIdMarker"];
                }
                if (data.Version === "") {
                    contents.Versions = [];
                }
                if (data["Version"] !== undefined) {
                    contents.Versions = deserializeAws_restXmlObjectVersionList(__getArrayIfSingleItem(data["Version"]), context);
                }
                return [2 /*return*/, Promise.resolve(contents)];
        }
    });
}); };
var deserializeAws_restXmlListObjectVersionsCommandError = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var parsedOutput, _a, response, errorCode, parsedBody, message;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _a = [__assign({}, output)];
                _b = {};
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                parsedOutput = __assign.apply(void 0, _a.concat([(_b.body = _c.sent(), _b)]));
                errorCode = "UnknownError";
                errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
                switch (errorCode) {
                    default:
                        parsedBody = parsedOutput.body;
                        errorCode = parsedBody.code || parsedBody.Code || errorCode;
                        response = __assign(__assign({}, parsedBody), { name: "" + errorCode, message: parsedBody.message || parsedBody.Message || errorCode, $fault: "client", $metadata: deserializeMetadata(output) });
                }
                message = response.message || response.Message || errorCode;
                response.message = message;
                delete response.Message;
                return [2 /*return*/, Promise.reject(Object.assign(new Error(message), response))];
        }
    });
}); };
export var deserializeAws_restXmlListPartsCommand = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var contents, data;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (output.statusCode !== 200 && output.statusCode >= 300) {
                    return [2 /*return*/, deserializeAws_restXmlListPartsCommandError(output, context)];
                }
                contents = {
                    $metadata: deserializeMetadata(output),
                    AbortDate: undefined,
                    AbortRuleId: undefined,
                    Bucket: undefined,
                    Initiator: undefined,
                    IsTruncated: undefined,
                    Key: undefined,
                    MaxParts: undefined,
                    NextPartNumberMarker: undefined,
                    Owner: undefined,
                    PartNumberMarker: undefined,
                    Parts: undefined,
                    RequestCharged: undefined,
                    StorageClass: undefined,
                    UploadId: undefined,
                };
                if (output.headers["x-amz-abort-date"] !== undefined) {
                    contents.AbortDate = new Date(output.headers["x-amz-abort-date"]);
                }
                if (output.headers["x-amz-abort-rule-id"] !== undefined) {
                    contents.AbortRuleId = output.headers["x-amz-abort-rule-id"];
                }
                if (output.headers["x-amz-request-charged"] !== undefined) {
                    contents.RequestCharged = output.headers["x-amz-request-charged"];
                }
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                data = _a.sent();
                if (data["Bucket"] !== undefined) {
                    contents.Bucket = data["Bucket"];
                }
                if (data["Initiator"] !== undefined) {
                    contents.Initiator = deserializeAws_restXmlInitiator(data["Initiator"], context);
                }
                if (data["IsTruncated"] !== undefined) {
                    contents.IsTruncated = data["IsTruncated"] == "true";
                }
                if (data["Key"] !== undefined) {
                    contents.Key = data["Key"];
                }
                if (data["MaxParts"] !== undefined) {
                    contents.MaxParts = parseInt(data["MaxParts"]);
                }
                if (data["NextPartNumberMarker"] !== undefined) {
                    contents.NextPartNumberMarker = data["NextPartNumberMarker"];
                }
                if (data["Owner"] !== undefined) {
                    contents.Owner = deserializeAws_restXmlOwner(data["Owner"], context);
                }
                if (data["PartNumberMarker"] !== undefined) {
                    contents.PartNumberMarker = data["PartNumberMarker"];
                }
                if (data.Part === "") {
                    contents.Parts = [];
                }
                if (data["Part"] !== undefined) {
                    contents.Parts = deserializeAws_restXmlParts(__getArrayIfSingleItem(data["Part"]), context);
                }
                if (data["StorageClass"] !== undefined) {
                    contents.StorageClass = data["StorageClass"];
                }
                if (data["UploadId"] !== undefined) {
                    contents.UploadId = data["UploadId"];
                }
                return [2 /*return*/, Promise.resolve(contents)];
        }
    });
}); };
var deserializeAws_restXmlListPartsCommandError = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var parsedOutput, _a, response, errorCode, parsedBody, message;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _a = [__assign({}, output)];
                _b = {};
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                parsedOutput = __assign.apply(void 0, _a.concat([(_b.body = _c.sent(), _b)]));
                errorCode = "UnknownError";
                errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
                switch (errorCode) {
                    default:
                        parsedBody = parsedOutput.body;
                        errorCode = parsedBody.code || parsedBody.Code || errorCode;
                        response = __assign(__assign({}, parsedBody), { name: "" + errorCode, message: parsedBody.message || parsedBody.Message || errorCode, $fault: "client", $metadata: deserializeMetadata(output) });
                }
                message = response.message || response.Message || errorCode;
                response.message = message;
                delete response.Message;
                return [2 /*return*/, Promise.reject(Object.assign(new Error(message), response))];
        }
    });
}); };
export var deserializeAws_restXmlPutBucketAccelerateConfigurationCommand = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var contents;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (output.statusCode !== 200 && output.statusCode >= 300) {
                    return [2 /*return*/, deserializeAws_restXmlPutBucketAccelerateConfigurationCommandError(output, context)];
                }
                contents = {
                    $metadata: deserializeMetadata(output),
                };
                return [4 /*yield*/, collectBody(output.body, context)];
            case 1:
                _a.sent();
                return [2 /*return*/, Promise.resolve(contents)];
        }
    });
}); };
var deserializeAws_restXmlPutBucketAccelerateConfigurationCommandError = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var parsedOutput, _a, response, errorCode, parsedBody, message;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _a = [__assign({}, output)];
                _b = {};
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                parsedOutput = __assign.apply(void 0, _a.concat([(_b.body = _c.sent(), _b)]));
                errorCode = "UnknownError";
                errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
                switch (errorCode) {
                    default:
                        parsedBody = parsedOutput.body;
                        errorCode = parsedBody.code || parsedBody.Code || errorCode;
                        response = __assign(__assign({}, parsedBody), { name: "" + errorCode, message: parsedBody.message || parsedBody.Message || errorCode, $fault: "client", $metadata: deserializeMetadata(output) });
                }
                message = response.message || response.Message || errorCode;
                response.message = message;
                delete response.Message;
                return [2 /*return*/, Promise.reject(Object.assign(new Error(message), response))];
        }
    });
}); };
export var deserializeAws_restXmlPutBucketAclCommand = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var contents;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (output.statusCode !== 200 && output.statusCode >= 300) {
                    return [2 /*return*/, deserializeAws_restXmlPutBucketAclCommandError(output, context)];
                }
                contents = {
                    $metadata: deserializeMetadata(output),
                };
                return [4 /*yield*/, collectBody(output.body, context)];
            case 1:
                _a.sent();
                return [2 /*return*/, Promise.resolve(contents)];
        }
    });
}); };
var deserializeAws_restXmlPutBucketAclCommandError = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var parsedOutput, _a, response, errorCode, parsedBody, message;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _a = [__assign({}, output)];
                _b = {};
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                parsedOutput = __assign.apply(void 0, _a.concat([(_b.body = _c.sent(), _b)]));
                errorCode = "UnknownError";
                errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
                switch (errorCode) {
                    default:
                        parsedBody = parsedOutput.body;
                        errorCode = parsedBody.code || parsedBody.Code || errorCode;
                        response = __assign(__assign({}, parsedBody), { name: "" + errorCode, message: parsedBody.message || parsedBody.Message || errorCode, $fault: "client", $metadata: deserializeMetadata(output) });
                }
                message = response.message || response.Message || errorCode;
                response.message = message;
                delete response.Message;
                return [2 /*return*/, Promise.reject(Object.assign(new Error(message), response))];
        }
    });
}); };
export var deserializeAws_restXmlPutBucketAnalyticsConfigurationCommand = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var contents;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (output.statusCode !== 200 && output.statusCode >= 300) {
                    return [2 /*return*/, deserializeAws_restXmlPutBucketAnalyticsConfigurationCommandError(output, context)];
                }
                contents = {
                    $metadata: deserializeMetadata(output),
                };
                return [4 /*yield*/, collectBody(output.body, context)];
            case 1:
                _a.sent();
                return [2 /*return*/, Promise.resolve(contents)];
        }
    });
}); };
var deserializeAws_restXmlPutBucketAnalyticsConfigurationCommandError = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var parsedOutput, _a, response, errorCode, parsedBody, message;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _a = [__assign({}, output)];
                _b = {};
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                parsedOutput = __assign.apply(void 0, _a.concat([(_b.body = _c.sent(), _b)]));
                errorCode = "UnknownError";
                errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
                switch (errorCode) {
                    default:
                        parsedBody = parsedOutput.body;
                        errorCode = parsedBody.code || parsedBody.Code || errorCode;
                        response = __assign(__assign({}, parsedBody), { name: "" + errorCode, message: parsedBody.message || parsedBody.Message || errorCode, $fault: "client", $metadata: deserializeMetadata(output) });
                }
                message = response.message || response.Message || errorCode;
                response.message = message;
                delete response.Message;
                return [2 /*return*/, Promise.reject(Object.assign(new Error(message), response))];
        }
    });
}); };
export var deserializeAws_restXmlPutBucketCorsCommand = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var contents;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (output.statusCode !== 200 && output.statusCode >= 300) {
                    return [2 /*return*/, deserializeAws_restXmlPutBucketCorsCommandError(output, context)];
                }
                contents = {
                    $metadata: deserializeMetadata(output),
                };
                return [4 /*yield*/, collectBody(output.body, context)];
            case 1:
                _a.sent();
                return [2 /*return*/, Promise.resolve(contents)];
        }
    });
}); };
var deserializeAws_restXmlPutBucketCorsCommandError = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var parsedOutput, _a, response, errorCode, parsedBody, message;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _a = [__assign({}, output)];
                _b = {};
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                parsedOutput = __assign.apply(void 0, _a.concat([(_b.body = _c.sent(), _b)]));
                errorCode = "UnknownError";
                errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
                switch (errorCode) {
                    default:
                        parsedBody = parsedOutput.body;
                        errorCode = parsedBody.code || parsedBody.Code || errorCode;
                        response = __assign(__assign({}, parsedBody), { name: "" + errorCode, message: parsedBody.message || parsedBody.Message || errorCode, $fault: "client", $metadata: deserializeMetadata(output) });
                }
                message = response.message || response.Message || errorCode;
                response.message = message;
                delete response.Message;
                return [2 /*return*/, Promise.reject(Object.assign(new Error(message), response))];
        }
    });
}); };
export var deserializeAws_restXmlPutBucketEncryptionCommand = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var contents;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (output.statusCode !== 200 && output.statusCode >= 300) {
                    return [2 /*return*/, deserializeAws_restXmlPutBucketEncryptionCommandError(output, context)];
                }
                contents = {
                    $metadata: deserializeMetadata(output),
                };
                return [4 /*yield*/, collectBody(output.body, context)];
            case 1:
                _a.sent();
                return [2 /*return*/, Promise.resolve(contents)];
        }
    });
}); };
var deserializeAws_restXmlPutBucketEncryptionCommandError = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var parsedOutput, _a, response, errorCode, parsedBody, message;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _a = [__assign({}, output)];
                _b = {};
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                parsedOutput = __assign.apply(void 0, _a.concat([(_b.body = _c.sent(), _b)]));
                errorCode = "UnknownError";
                errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
                switch (errorCode) {
                    default:
                        parsedBody = parsedOutput.body;
                        errorCode = parsedBody.code || parsedBody.Code || errorCode;
                        response = __assign(__assign({}, parsedBody), { name: "" + errorCode, message: parsedBody.message || parsedBody.Message || errorCode, $fault: "client", $metadata: deserializeMetadata(output) });
                }
                message = response.message || response.Message || errorCode;
                response.message = message;
                delete response.Message;
                return [2 /*return*/, Promise.reject(Object.assign(new Error(message), response))];
        }
    });
}); };
export var deserializeAws_restXmlPutBucketIntelligentTieringConfigurationCommand = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var contents;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (output.statusCode !== 200 && output.statusCode >= 300) {
                    return [2 /*return*/, deserializeAws_restXmlPutBucketIntelligentTieringConfigurationCommandError(output, context)];
                }
                contents = {
                    $metadata: deserializeMetadata(output),
                };
                return [4 /*yield*/, collectBody(output.body, context)];
            case 1:
                _a.sent();
                return [2 /*return*/, Promise.resolve(contents)];
        }
    });
}); };
var deserializeAws_restXmlPutBucketIntelligentTieringConfigurationCommandError = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var parsedOutput, _a, response, errorCode, parsedBody, message;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _a = [__assign({}, output)];
                _b = {};
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                parsedOutput = __assign.apply(void 0, _a.concat([(_b.body = _c.sent(), _b)]));
                errorCode = "UnknownError";
                errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
                switch (errorCode) {
                    default:
                        parsedBody = parsedOutput.body;
                        errorCode = parsedBody.code || parsedBody.Code || errorCode;
                        response = __assign(__assign({}, parsedBody), { name: "" + errorCode, message: parsedBody.message || parsedBody.Message || errorCode, $fault: "client", $metadata: deserializeMetadata(output) });
                }
                message = response.message || response.Message || errorCode;
                response.message = message;
                delete response.Message;
                return [2 /*return*/, Promise.reject(Object.assign(new Error(message), response))];
        }
    });
}); };
export var deserializeAws_restXmlPutBucketInventoryConfigurationCommand = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var contents;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (output.statusCode !== 200 && output.statusCode >= 300) {
                    return [2 /*return*/, deserializeAws_restXmlPutBucketInventoryConfigurationCommandError(output, context)];
                }
                contents = {
                    $metadata: deserializeMetadata(output),
                };
                return [4 /*yield*/, collectBody(output.body, context)];
            case 1:
                _a.sent();
                return [2 /*return*/, Promise.resolve(contents)];
        }
    });
}); };
var deserializeAws_restXmlPutBucketInventoryConfigurationCommandError = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var parsedOutput, _a, response, errorCode, parsedBody, message;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _a = [__assign({}, output)];
                _b = {};
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                parsedOutput = __assign.apply(void 0, _a.concat([(_b.body = _c.sent(), _b)]));
                errorCode = "UnknownError";
                errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
                switch (errorCode) {
                    default:
                        parsedBody = parsedOutput.body;
                        errorCode = parsedBody.code || parsedBody.Code || errorCode;
                        response = __assign(__assign({}, parsedBody), { name: "" + errorCode, message: parsedBody.message || parsedBody.Message || errorCode, $fault: "client", $metadata: deserializeMetadata(output) });
                }
                message = response.message || response.Message || errorCode;
                response.message = message;
                delete response.Message;
                return [2 /*return*/, Promise.reject(Object.assign(new Error(message), response))];
        }
    });
}); };
export var deserializeAws_restXmlPutBucketLifecycleConfigurationCommand = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var contents;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (output.statusCode !== 200 && output.statusCode >= 300) {
                    return [2 /*return*/, deserializeAws_restXmlPutBucketLifecycleConfigurationCommandError(output, context)];
                }
                contents = {
                    $metadata: deserializeMetadata(output),
                };
                return [4 /*yield*/, collectBody(output.body, context)];
            case 1:
                _a.sent();
                return [2 /*return*/, Promise.resolve(contents)];
        }
    });
}); };
var deserializeAws_restXmlPutBucketLifecycleConfigurationCommandError = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var parsedOutput, _a, response, errorCode, parsedBody, message;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _a = [__assign({}, output)];
                _b = {};
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                parsedOutput = __assign.apply(void 0, _a.concat([(_b.body = _c.sent(), _b)]));
                errorCode = "UnknownError";
                errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
                switch (errorCode) {
                    default:
                        parsedBody = parsedOutput.body;
                        errorCode = parsedBody.code || parsedBody.Code || errorCode;
                        response = __assign(__assign({}, parsedBody), { name: "" + errorCode, message: parsedBody.message || parsedBody.Message || errorCode, $fault: "client", $metadata: deserializeMetadata(output) });
                }
                message = response.message || response.Message || errorCode;
                response.message = message;
                delete response.Message;
                return [2 /*return*/, Promise.reject(Object.assign(new Error(message), response))];
        }
    });
}); };
export var deserializeAws_restXmlPutBucketLoggingCommand = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var contents;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (output.statusCode !== 200 && output.statusCode >= 300) {
                    return [2 /*return*/, deserializeAws_restXmlPutBucketLoggingCommandError(output, context)];
                }
                contents = {
                    $metadata: deserializeMetadata(output),
                };
                return [4 /*yield*/, collectBody(output.body, context)];
            case 1:
                _a.sent();
                return [2 /*return*/, Promise.resolve(contents)];
        }
    });
}); };
var deserializeAws_restXmlPutBucketLoggingCommandError = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var parsedOutput, _a, response, errorCode, parsedBody, message;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _a = [__assign({}, output)];
                _b = {};
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                parsedOutput = __assign.apply(void 0, _a.concat([(_b.body = _c.sent(), _b)]));
                errorCode = "UnknownError";
                errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
                switch (errorCode) {
                    default:
                        parsedBody = parsedOutput.body;
                        errorCode = parsedBody.code || parsedBody.Code || errorCode;
                        response = __assign(__assign({}, parsedBody), { name: "" + errorCode, message: parsedBody.message || parsedBody.Message || errorCode, $fault: "client", $metadata: deserializeMetadata(output) });
                }
                message = response.message || response.Message || errorCode;
                response.message = message;
                delete response.Message;
                return [2 /*return*/, Promise.reject(Object.assign(new Error(message), response))];
        }
    });
}); };
export var deserializeAws_restXmlPutBucketMetricsConfigurationCommand = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var contents;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (output.statusCode !== 200 && output.statusCode >= 300) {
                    return [2 /*return*/, deserializeAws_restXmlPutBucketMetricsConfigurationCommandError(output, context)];
                }
                contents = {
                    $metadata: deserializeMetadata(output),
                };
                return [4 /*yield*/, collectBody(output.body, context)];
            case 1:
                _a.sent();
                return [2 /*return*/, Promise.resolve(contents)];
        }
    });
}); };
var deserializeAws_restXmlPutBucketMetricsConfigurationCommandError = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var parsedOutput, _a, response, errorCode, parsedBody, message;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _a = [__assign({}, output)];
                _b = {};
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                parsedOutput = __assign.apply(void 0, _a.concat([(_b.body = _c.sent(), _b)]));
                errorCode = "UnknownError";
                errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
                switch (errorCode) {
                    default:
                        parsedBody = parsedOutput.body;
                        errorCode = parsedBody.code || parsedBody.Code || errorCode;
                        response = __assign(__assign({}, parsedBody), { name: "" + errorCode, message: parsedBody.message || parsedBody.Message || errorCode, $fault: "client", $metadata: deserializeMetadata(output) });
                }
                message = response.message || response.Message || errorCode;
                response.message = message;
                delete response.Message;
                return [2 /*return*/, Promise.reject(Object.assign(new Error(message), response))];
        }
    });
}); };
export var deserializeAws_restXmlPutBucketNotificationConfigurationCommand = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var contents;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (output.statusCode !== 200 && output.statusCode >= 300) {
                    return [2 /*return*/, deserializeAws_restXmlPutBucketNotificationConfigurationCommandError(output, context)];
                }
                contents = {
                    $metadata: deserializeMetadata(output),
                };
                return [4 /*yield*/, collectBody(output.body, context)];
            case 1:
                _a.sent();
                return [2 /*return*/, Promise.resolve(contents)];
        }
    });
}); };
var deserializeAws_restXmlPutBucketNotificationConfigurationCommandError = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var parsedOutput, _a, response, errorCode, parsedBody, message;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _a = [__assign({}, output)];
                _b = {};
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                parsedOutput = __assign.apply(void 0, _a.concat([(_b.body = _c.sent(), _b)]));
                errorCode = "UnknownError";
                errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
                switch (errorCode) {
                    default:
                        parsedBody = parsedOutput.body;
                        errorCode = parsedBody.code || parsedBody.Code || errorCode;
                        response = __assign(__assign({}, parsedBody), { name: "" + errorCode, message: parsedBody.message || parsedBody.Message || errorCode, $fault: "client", $metadata: deserializeMetadata(output) });
                }
                message = response.message || response.Message || errorCode;
                response.message = message;
                delete response.Message;
                return [2 /*return*/, Promise.reject(Object.assign(new Error(message), response))];
        }
    });
}); };
export var deserializeAws_restXmlPutBucketOwnershipControlsCommand = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var contents;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (output.statusCode !== 200 && output.statusCode >= 300) {
                    return [2 /*return*/, deserializeAws_restXmlPutBucketOwnershipControlsCommandError(output, context)];
                }
                contents = {
                    $metadata: deserializeMetadata(output),
                };
                return [4 /*yield*/, collectBody(output.body, context)];
            case 1:
                _a.sent();
                return [2 /*return*/, Promise.resolve(contents)];
        }
    });
}); };
var deserializeAws_restXmlPutBucketOwnershipControlsCommandError = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var parsedOutput, _a, response, errorCode, parsedBody, message;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _a = [__assign({}, output)];
                _b = {};
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                parsedOutput = __assign.apply(void 0, _a.concat([(_b.body = _c.sent(), _b)]));
                errorCode = "UnknownError";
                errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
                switch (errorCode) {
                    default:
                        parsedBody = parsedOutput.body;
                        errorCode = parsedBody.code || parsedBody.Code || errorCode;
                        response = __assign(__assign({}, parsedBody), { name: "" + errorCode, message: parsedBody.message || parsedBody.Message || errorCode, $fault: "client", $metadata: deserializeMetadata(output) });
                }
                message = response.message || response.Message || errorCode;
                response.message = message;
                delete response.Message;
                return [2 /*return*/, Promise.reject(Object.assign(new Error(message), response))];
        }
    });
}); };
export var deserializeAws_restXmlPutBucketPolicyCommand = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var contents;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (output.statusCode !== 200 && output.statusCode >= 300) {
                    return [2 /*return*/, deserializeAws_restXmlPutBucketPolicyCommandError(output, context)];
                }
                contents = {
                    $metadata: deserializeMetadata(output),
                };
                return [4 /*yield*/, collectBody(output.body, context)];
            case 1:
                _a.sent();
                return [2 /*return*/, Promise.resolve(contents)];
        }
    });
}); };
var deserializeAws_restXmlPutBucketPolicyCommandError = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var parsedOutput, _a, response, errorCode, parsedBody, message;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _a = [__assign({}, output)];
                _b = {};
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                parsedOutput = __assign.apply(void 0, _a.concat([(_b.body = _c.sent(), _b)]));
                errorCode = "UnknownError";
                errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
                switch (errorCode) {
                    default:
                        parsedBody = parsedOutput.body;
                        errorCode = parsedBody.code || parsedBody.Code || errorCode;
                        response = __assign(__assign({}, parsedBody), { name: "" + errorCode, message: parsedBody.message || parsedBody.Message || errorCode, $fault: "client", $metadata: deserializeMetadata(output) });
                }
                message = response.message || response.Message || errorCode;
                response.message = message;
                delete response.Message;
                return [2 /*return*/, Promise.reject(Object.assign(new Error(message), response))];
        }
    });
}); };
export var deserializeAws_restXmlPutBucketReplicationCommand = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var contents;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (output.statusCode !== 200 && output.statusCode >= 300) {
                    return [2 /*return*/, deserializeAws_restXmlPutBucketReplicationCommandError(output, context)];
                }
                contents = {
                    $metadata: deserializeMetadata(output),
                };
                return [4 /*yield*/, collectBody(output.body, context)];
            case 1:
                _a.sent();
                return [2 /*return*/, Promise.resolve(contents)];
        }
    });
}); };
var deserializeAws_restXmlPutBucketReplicationCommandError = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var parsedOutput, _a, response, errorCode, parsedBody, message;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _a = [__assign({}, output)];
                _b = {};
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                parsedOutput = __assign.apply(void 0, _a.concat([(_b.body = _c.sent(), _b)]));
                errorCode = "UnknownError";
                errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
                switch (errorCode) {
                    default:
                        parsedBody = parsedOutput.body;
                        errorCode = parsedBody.code || parsedBody.Code || errorCode;
                        response = __assign(__assign({}, parsedBody), { name: "" + errorCode, message: parsedBody.message || parsedBody.Message || errorCode, $fault: "client", $metadata: deserializeMetadata(output) });
                }
                message = response.message || response.Message || errorCode;
                response.message = message;
                delete response.Message;
                return [2 /*return*/, Promise.reject(Object.assign(new Error(message), response))];
        }
    });
}); };
export var deserializeAws_restXmlPutBucketRequestPaymentCommand = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var contents;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (output.statusCode !== 200 && output.statusCode >= 300) {
                    return [2 /*return*/, deserializeAws_restXmlPutBucketRequestPaymentCommandError(output, context)];
                }
                contents = {
                    $metadata: deserializeMetadata(output),
                };
                return [4 /*yield*/, collectBody(output.body, context)];
            case 1:
                _a.sent();
                return [2 /*return*/, Promise.resolve(contents)];
        }
    });
}); };
var deserializeAws_restXmlPutBucketRequestPaymentCommandError = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var parsedOutput, _a, response, errorCode, parsedBody, message;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _a = [__assign({}, output)];
                _b = {};
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                parsedOutput = __assign.apply(void 0, _a.concat([(_b.body = _c.sent(), _b)]));
                errorCode = "UnknownError";
                errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
                switch (errorCode) {
                    default:
                        parsedBody = parsedOutput.body;
                        errorCode = parsedBody.code || parsedBody.Code || errorCode;
                        response = __assign(__assign({}, parsedBody), { name: "" + errorCode, message: parsedBody.message || parsedBody.Message || errorCode, $fault: "client", $metadata: deserializeMetadata(output) });
                }
                message = response.message || response.Message || errorCode;
                response.message = message;
                delete response.Message;
                return [2 /*return*/, Promise.reject(Object.assign(new Error(message), response))];
        }
    });
}); };
export var deserializeAws_restXmlPutBucketTaggingCommand = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var contents;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (output.statusCode !== 200 && output.statusCode >= 300) {
                    return [2 /*return*/, deserializeAws_restXmlPutBucketTaggingCommandError(output, context)];
                }
                contents = {
                    $metadata: deserializeMetadata(output),
                };
                return [4 /*yield*/, collectBody(output.body, context)];
            case 1:
                _a.sent();
                return [2 /*return*/, Promise.resolve(contents)];
        }
    });
}); };
var deserializeAws_restXmlPutBucketTaggingCommandError = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var parsedOutput, _a, response, errorCode, parsedBody, message;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _a = [__assign({}, output)];
                _b = {};
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                parsedOutput = __assign.apply(void 0, _a.concat([(_b.body = _c.sent(), _b)]));
                errorCode = "UnknownError";
                errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
                switch (errorCode) {
                    default:
                        parsedBody = parsedOutput.body;
                        errorCode = parsedBody.code || parsedBody.Code || errorCode;
                        response = __assign(__assign({}, parsedBody), { name: "" + errorCode, message: parsedBody.message || parsedBody.Message || errorCode, $fault: "client", $metadata: deserializeMetadata(output) });
                }
                message = response.message || response.Message || errorCode;
                response.message = message;
                delete response.Message;
                return [2 /*return*/, Promise.reject(Object.assign(new Error(message), response))];
        }
    });
}); };
export var deserializeAws_restXmlPutBucketVersioningCommand = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var contents;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (output.statusCode !== 200 && output.statusCode >= 300) {
                    return [2 /*return*/, deserializeAws_restXmlPutBucketVersioningCommandError(output, context)];
                }
                contents = {
                    $metadata: deserializeMetadata(output),
                };
                return [4 /*yield*/, collectBody(output.body, context)];
            case 1:
                _a.sent();
                return [2 /*return*/, Promise.resolve(contents)];
        }
    });
}); };
var deserializeAws_restXmlPutBucketVersioningCommandError = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var parsedOutput, _a, response, errorCode, parsedBody, message;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _a = [__assign({}, output)];
                _b = {};
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                parsedOutput = __assign.apply(void 0, _a.concat([(_b.body = _c.sent(), _b)]));
                errorCode = "UnknownError";
                errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
                switch (errorCode) {
                    default:
                        parsedBody = parsedOutput.body;
                        errorCode = parsedBody.code || parsedBody.Code || errorCode;
                        response = __assign(__assign({}, parsedBody), { name: "" + errorCode, message: parsedBody.message || parsedBody.Message || errorCode, $fault: "client", $metadata: deserializeMetadata(output) });
                }
                message = response.message || response.Message || errorCode;
                response.message = message;
                delete response.Message;
                return [2 /*return*/, Promise.reject(Object.assign(new Error(message), response))];
        }
    });
}); };
export var deserializeAws_restXmlPutBucketWebsiteCommand = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var contents;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (output.statusCode !== 200 && output.statusCode >= 300) {
                    return [2 /*return*/, deserializeAws_restXmlPutBucketWebsiteCommandError(output, context)];
                }
                contents = {
                    $metadata: deserializeMetadata(output),
                };
                return [4 /*yield*/, collectBody(output.body, context)];
            case 1:
                _a.sent();
                return [2 /*return*/, Promise.resolve(contents)];
        }
    });
}); };
var deserializeAws_restXmlPutBucketWebsiteCommandError = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var parsedOutput, _a, response, errorCode, parsedBody, message;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _a = [__assign({}, output)];
                _b = {};
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                parsedOutput = __assign.apply(void 0, _a.concat([(_b.body = _c.sent(), _b)]));
                errorCode = "UnknownError";
                errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
                switch (errorCode) {
                    default:
                        parsedBody = parsedOutput.body;
                        errorCode = parsedBody.code || parsedBody.Code || errorCode;
                        response = __assign(__assign({}, parsedBody), { name: "" + errorCode, message: parsedBody.message || parsedBody.Message || errorCode, $fault: "client", $metadata: deserializeMetadata(output) });
                }
                message = response.message || response.Message || errorCode;
                response.message = message;
                delete response.Message;
                return [2 /*return*/, Promise.reject(Object.assign(new Error(message), response))];
        }
    });
}); };
export var deserializeAws_restXmlPutObjectCommand = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var contents;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (output.statusCode !== 200 && output.statusCode >= 300) {
                    return [2 /*return*/, deserializeAws_restXmlPutObjectCommandError(output, context)];
                }
                contents = {
                    $metadata: deserializeMetadata(output),
                    BucketKeyEnabled: undefined,
                    ETag: undefined,
                    Expiration: undefined,
                    RequestCharged: undefined,
                    SSECustomerAlgorithm: undefined,
                    SSECustomerKeyMD5: undefined,
                    SSEKMSEncryptionContext: undefined,
                    SSEKMSKeyId: undefined,
                    ServerSideEncryption: undefined,
                    VersionId: undefined,
                };
                if (output.headers["x-amz-expiration"] !== undefined) {
                    contents.Expiration = output.headers["x-amz-expiration"];
                }
                if (output.headers["etag"] !== undefined) {
                    contents.ETag = output.headers["etag"];
                }
                if (output.headers["x-amz-server-side-encryption"] !== undefined) {
                    contents.ServerSideEncryption = output.headers["x-amz-server-side-encryption"];
                }
                if (output.headers["x-amz-version-id"] !== undefined) {
                    contents.VersionId = output.headers["x-amz-version-id"];
                }
                if (output.headers["x-amz-server-side-encryption-customer-algorithm"] !== undefined) {
                    contents.SSECustomerAlgorithm = output.headers["x-amz-server-side-encryption-customer-algorithm"];
                }
                if (output.headers["x-amz-server-side-encryption-customer-key-md5"] !== undefined) {
                    contents.SSECustomerKeyMD5 = output.headers["x-amz-server-side-encryption-customer-key-md5"];
                }
                if (output.headers["x-amz-server-side-encryption-aws-kms-key-id"] !== undefined) {
                    contents.SSEKMSKeyId = output.headers["x-amz-server-side-encryption-aws-kms-key-id"];
                }
                if (output.headers["x-amz-server-side-encryption-context"] !== undefined) {
                    contents.SSEKMSEncryptionContext = output.headers["x-amz-server-side-encryption-context"];
                }
                if (output.headers["x-amz-server-side-encryption-bucket-key-enabled"] !== undefined) {
                    contents.BucketKeyEnabled = output.headers["x-amz-server-side-encryption-bucket-key-enabled"] === "true";
                }
                if (output.headers["x-amz-request-charged"] !== undefined) {
                    contents.RequestCharged = output.headers["x-amz-request-charged"];
                }
                return [4 /*yield*/, collectBody(output.body, context)];
            case 1:
                _a.sent();
                return [2 /*return*/, Promise.resolve(contents)];
        }
    });
}); };
var deserializeAws_restXmlPutObjectCommandError = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var parsedOutput, _a, response, errorCode, parsedBody, message;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _a = [__assign({}, output)];
                _b = {};
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                parsedOutput = __assign.apply(void 0, _a.concat([(_b.body = _c.sent(), _b)]));
                errorCode = "UnknownError";
                errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
                switch (errorCode) {
                    default:
                        parsedBody = parsedOutput.body;
                        errorCode = parsedBody.code || parsedBody.Code || errorCode;
                        response = __assign(__assign({}, parsedBody), { name: "" + errorCode, message: parsedBody.message || parsedBody.Message || errorCode, $fault: "client", $metadata: deserializeMetadata(output) });
                }
                message = response.message || response.Message || errorCode;
                response.message = message;
                delete response.Message;
                return [2 /*return*/, Promise.reject(Object.assign(new Error(message), response))];
        }
    });
}); };
export var deserializeAws_restXmlPutObjectAclCommand = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var contents;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (output.statusCode !== 200 && output.statusCode >= 300) {
                    return [2 /*return*/, deserializeAws_restXmlPutObjectAclCommandError(output, context)];
                }
                contents = {
                    $metadata: deserializeMetadata(output),
                    RequestCharged: undefined,
                };
                if (output.headers["x-amz-request-charged"] !== undefined) {
                    contents.RequestCharged = output.headers["x-amz-request-charged"];
                }
                return [4 /*yield*/, collectBody(output.body, context)];
            case 1:
                _a.sent();
                return [2 /*return*/, Promise.resolve(contents)];
        }
    });
}); };
var deserializeAws_restXmlPutObjectAclCommandError = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var parsedOutput, _a, response, errorCode, _b, _c, parsedBody, message;
    var _d;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                _a = [__assign({}, output)];
                _d = {};
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                parsedOutput = __assign.apply(void 0, _a.concat([(_d.body = _e.sent(), _d)]));
                errorCode = "UnknownError";
                errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
                _b = errorCode;
                switch (_b) {
                    case "NoSuchKey": return [3 /*break*/, 2];
                    case "com.amazonaws.s3#NoSuchKey": return [3 /*break*/, 2];
                }
                return [3 /*break*/, 4];
            case 2:
                _c = [{}];
                return [4 /*yield*/, deserializeAws_restXmlNoSuchKeyResponse(parsedOutput, context)];
            case 3:
                response = __assign.apply(void 0, [__assign.apply(void 0, _c.concat([(_e.sent())])), { name: errorCode, $metadata: deserializeMetadata(output) }]);
                return [3 /*break*/, 5];
            case 4:
                parsedBody = parsedOutput.body;
                errorCode = parsedBody.code || parsedBody.Code || errorCode;
                response = __assign(__assign({}, parsedBody), { name: "" + errorCode, message: parsedBody.message || parsedBody.Message || errorCode, $fault: "client", $metadata: deserializeMetadata(output) });
                _e.label = 5;
            case 5:
                message = response.message || response.Message || errorCode;
                response.message = message;
                delete response.Message;
                return [2 /*return*/, Promise.reject(Object.assign(new Error(message), response))];
        }
    });
}); };
export var deserializeAws_restXmlPutObjectLegalHoldCommand = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var contents;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (output.statusCode !== 200 && output.statusCode >= 300) {
                    return [2 /*return*/, deserializeAws_restXmlPutObjectLegalHoldCommandError(output, context)];
                }
                contents = {
                    $metadata: deserializeMetadata(output),
                    RequestCharged: undefined,
                };
                if (output.headers["x-amz-request-charged"] !== undefined) {
                    contents.RequestCharged = output.headers["x-amz-request-charged"];
                }
                return [4 /*yield*/, collectBody(output.body, context)];
            case 1:
                _a.sent();
                return [2 /*return*/, Promise.resolve(contents)];
        }
    });
}); };
var deserializeAws_restXmlPutObjectLegalHoldCommandError = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var parsedOutput, _a, response, errorCode, parsedBody, message;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _a = [__assign({}, output)];
                _b = {};
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                parsedOutput = __assign.apply(void 0, _a.concat([(_b.body = _c.sent(), _b)]));
                errorCode = "UnknownError";
                errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
                switch (errorCode) {
                    default:
                        parsedBody = parsedOutput.body;
                        errorCode = parsedBody.code || parsedBody.Code || errorCode;
                        response = __assign(__assign({}, parsedBody), { name: "" + errorCode, message: parsedBody.message || parsedBody.Message || errorCode, $fault: "client", $metadata: deserializeMetadata(output) });
                }
                message = response.message || response.Message || errorCode;
                response.message = message;
                delete response.Message;
                return [2 /*return*/, Promise.reject(Object.assign(new Error(message), response))];
        }
    });
}); };
export var deserializeAws_restXmlPutObjectLockConfigurationCommand = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var contents;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (output.statusCode !== 200 && output.statusCode >= 300) {
                    return [2 /*return*/, deserializeAws_restXmlPutObjectLockConfigurationCommandError(output, context)];
                }
                contents = {
                    $metadata: deserializeMetadata(output),
                    RequestCharged: undefined,
                };
                if (output.headers["x-amz-request-charged"] !== undefined) {
                    contents.RequestCharged = output.headers["x-amz-request-charged"];
                }
                return [4 /*yield*/, collectBody(output.body, context)];
            case 1:
                _a.sent();
                return [2 /*return*/, Promise.resolve(contents)];
        }
    });
}); };
var deserializeAws_restXmlPutObjectLockConfigurationCommandError = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var parsedOutput, _a, response, errorCode, parsedBody, message;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _a = [__assign({}, output)];
                _b = {};
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                parsedOutput = __assign.apply(void 0, _a.concat([(_b.body = _c.sent(), _b)]));
                errorCode = "UnknownError";
                errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
                switch (errorCode) {
                    default:
                        parsedBody = parsedOutput.body;
                        errorCode = parsedBody.code || parsedBody.Code || errorCode;
                        response = __assign(__assign({}, parsedBody), { name: "" + errorCode, message: parsedBody.message || parsedBody.Message || errorCode, $fault: "client", $metadata: deserializeMetadata(output) });
                }
                message = response.message || response.Message || errorCode;
                response.message = message;
                delete response.Message;
                return [2 /*return*/, Promise.reject(Object.assign(new Error(message), response))];
        }
    });
}); };
export var deserializeAws_restXmlPutObjectRetentionCommand = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var contents;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (output.statusCode !== 200 && output.statusCode >= 300) {
                    return [2 /*return*/, deserializeAws_restXmlPutObjectRetentionCommandError(output, context)];
                }
                contents = {
                    $metadata: deserializeMetadata(output),
                    RequestCharged: undefined,
                };
                if (output.headers["x-amz-request-charged"] !== undefined) {
                    contents.RequestCharged = output.headers["x-amz-request-charged"];
                }
                return [4 /*yield*/, collectBody(output.body, context)];
            case 1:
                _a.sent();
                return [2 /*return*/, Promise.resolve(contents)];
        }
    });
}); };
var deserializeAws_restXmlPutObjectRetentionCommandError = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var parsedOutput, _a, response, errorCode, parsedBody, message;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _a = [__assign({}, output)];
                _b = {};
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                parsedOutput = __assign.apply(void 0, _a.concat([(_b.body = _c.sent(), _b)]));
                errorCode = "UnknownError";
                errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
                switch (errorCode) {
                    default:
                        parsedBody = parsedOutput.body;
                        errorCode = parsedBody.code || parsedBody.Code || errorCode;
                        response = __assign(__assign({}, parsedBody), { name: "" + errorCode, message: parsedBody.message || parsedBody.Message || errorCode, $fault: "client", $metadata: deserializeMetadata(output) });
                }
                message = response.message || response.Message || errorCode;
                response.message = message;
                delete response.Message;
                return [2 /*return*/, Promise.reject(Object.assign(new Error(message), response))];
        }
    });
}); };
export var deserializeAws_restXmlPutObjectTaggingCommand = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var contents;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (output.statusCode !== 200 && output.statusCode >= 300) {
                    return [2 /*return*/, deserializeAws_restXmlPutObjectTaggingCommandError(output, context)];
                }
                contents = {
                    $metadata: deserializeMetadata(output),
                    VersionId: undefined,
                };
                if (output.headers["x-amz-version-id"] !== undefined) {
                    contents.VersionId = output.headers["x-amz-version-id"];
                }
                return [4 /*yield*/, collectBody(output.body, context)];
            case 1:
                _a.sent();
                return [2 /*return*/, Promise.resolve(contents)];
        }
    });
}); };
var deserializeAws_restXmlPutObjectTaggingCommandError = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var parsedOutput, _a, response, errorCode, parsedBody, message;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _a = [__assign({}, output)];
                _b = {};
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                parsedOutput = __assign.apply(void 0, _a.concat([(_b.body = _c.sent(), _b)]));
                errorCode = "UnknownError";
                errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
                switch (errorCode) {
                    default:
                        parsedBody = parsedOutput.body;
                        errorCode = parsedBody.code || parsedBody.Code || errorCode;
                        response = __assign(__assign({}, parsedBody), { name: "" + errorCode, message: parsedBody.message || parsedBody.Message || errorCode, $fault: "client", $metadata: deserializeMetadata(output) });
                }
                message = response.message || response.Message || errorCode;
                response.message = message;
                delete response.Message;
                return [2 /*return*/, Promise.reject(Object.assign(new Error(message), response))];
        }
    });
}); };
export var deserializeAws_restXmlPutPublicAccessBlockCommand = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var contents;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (output.statusCode !== 200 && output.statusCode >= 300) {
                    return [2 /*return*/, deserializeAws_restXmlPutPublicAccessBlockCommandError(output, context)];
                }
                contents = {
                    $metadata: deserializeMetadata(output),
                };
                return [4 /*yield*/, collectBody(output.body, context)];
            case 1:
                _a.sent();
                return [2 /*return*/, Promise.resolve(contents)];
        }
    });
}); };
var deserializeAws_restXmlPutPublicAccessBlockCommandError = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var parsedOutput, _a, response, errorCode, parsedBody, message;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _a = [__assign({}, output)];
                _b = {};
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                parsedOutput = __assign.apply(void 0, _a.concat([(_b.body = _c.sent(), _b)]));
                errorCode = "UnknownError";
                errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
                switch (errorCode) {
                    default:
                        parsedBody = parsedOutput.body;
                        errorCode = parsedBody.code || parsedBody.Code || errorCode;
                        response = __assign(__assign({}, parsedBody), { name: "" + errorCode, message: parsedBody.message || parsedBody.Message || errorCode, $fault: "client", $metadata: deserializeMetadata(output) });
                }
                message = response.message || response.Message || errorCode;
                response.message = message;
                delete response.Message;
                return [2 /*return*/, Promise.reject(Object.assign(new Error(message), response))];
        }
    });
}); };
export var deserializeAws_restXmlRestoreObjectCommand = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var contents;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (output.statusCode !== 200 && output.statusCode >= 300) {
                    return [2 /*return*/, deserializeAws_restXmlRestoreObjectCommandError(output, context)];
                }
                contents = {
                    $metadata: deserializeMetadata(output),
                    RequestCharged: undefined,
                    RestoreOutputPath: undefined,
                };
                if (output.headers["x-amz-request-charged"] !== undefined) {
                    contents.RequestCharged = output.headers["x-amz-request-charged"];
                }
                if (output.headers["x-amz-restore-output-path"] !== undefined) {
                    contents.RestoreOutputPath = output.headers["x-amz-restore-output-path"];
                }
                return [4 /*yield*/, collectBody(output.body, context)];
            case 1:
                _a.sent();
                return [2 /*return*/, Promise.resolve(contents)];
        }
    });
}); };
var deserializeAws_restXmlRestoreObjectCommandError = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var parsedOutput, _a, response, errorCode, _b, _c, parsedBody, message;
    var _d;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                _a = [__assign({}, output)];
                _d = {};
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                parsedOutput = __assign.apply(void 0, _a.concat([(_d.body = _e.sent(), _d)]));
                errorCode = "UnknownError";
                errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
                _b = errorCode;
                switch (_b) {
                    case "ObjectAlreadyInActiveTierError": return [3 /*break*/, 2];
                    case "com.amazonaws.s3#ObjectAlreadyInActiveTierError": return [3 /*break*/, 2];
                }
                return [3 /*break*/, 4];
            case 2:
                _c = [{}];
                return [4 /*yield*/, deserializeAws_restXmlObjectAlreadyInActiveTierErrorResponse(parsedOutput, context)];
            case 3:
                response = __assign.apply(void 0, [__assign.apply(void 0, _c.concat([(_e.sent())])), { name: errorCode, $metadata: deserializeMetadata(output) }]);
                return [3 /*break*/, 5];
            case 4:
                parsedBody = parsedOutput.body;
                errorCode = parsedBody.code || parsedBody.Code || errorCode;
                response = __assign(__assign({}, parsedBody), { name: "" + errorCode, message: parsedBody.message || parsedBody.Message || errorCode, $fault: "client", $metadata: deserializeMetadata(output) });
                _e.label = 5;
            case 5:
                message = response.message || response.Message || errorCode;
                response.message = message;
                delete response.Message;
                return [2 /*return*/, Promise.reject(Object.assign(new Error(message), response))];
        }
    });
}); };
export var deserializeAws_restXmlSelectObjectContentCommand = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var contents, data;
    return __generator(this, function (_a) {
        if (output.statusCode !== 200 && output.statusCode >= 300) {
            return [2 /*return*/, deserializeAws_restXmlSelectObjectContentCommandError(output, context)];
        }
        contents = {
            $metadata: deserializeMetadata(output),
            Payload: undefined,
        };
        data = context.eventStreamMarshaller.deserialize(output.body, function (event) { return __awaiter(void 0, void 0, void 0, function () {
            var eventName, eventHeaders, eventMessage, parsedEvent;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        eventName = Object.keys(event)[0];
                        eventHeaders = Object.entries(event[eventName].headers).reduce(function (accummulator, curr) {
                            accummulator[curr[0]] = curr[1].value;
                            return accummulator;
                        }, {});
                        eventMessage = {
                            headers: eventHeaders,
                            body: event[eventName].body,
                        };
                        parsedEvent = (_a = {},
                            _a[eventName] = eventMessage,
                            _a);
                        return [4 /*yield*/, deserializeAws_restXmlSelectObjectContentEventStream_event(parsedEvent, context)];
                    case 1: return [2 /*return*/, _b.sent()];
                }
            });
        }); });
        contents.Payload = data;
        return [2 /*return*/, Promise.resolve(contents)];
    });
}); };
var deserializeAws_restXmlSelectObjectContentCommandError = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var parsedOutput, _a, response, errorCode, parsedBody, message;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _a = [__assign({}, output)];
                _b = {};
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                parsedOutput = __assign.apply(void 0, _a.concat([(_b.body = _c.sent(), _b)]));
                errorCode = "UnknownError";
                errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
                switch (errorCode) {
                    default:
                        parsedBody = parsedOutput.body;
                        errorCode = parsedBody.code || parsedBody.Code || errorCode;
                        response = __assign(__assign({}, parsedBody), { name: "" + errorCode, message: parsedBody.message || parsedBody.Message || errorCode, $fault: "client", $metadata: deserializeMetadata(output) });
                }
                message = response.message || response.Message || errorCode;
                response.message = message;
                delete response.Message;
                return [2 /*return*/, Promise.reject(Object.assign(new Error(message), response))];
        }
    });
}); };
export var deserializeAws_restXmlUploadPartCommand = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var contents;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (output.statusCode !== 200 && output.statusCode >= 300) {
                    return [2 /*return*/, deserializeAws_restXmlUploadPartCommandError(output, context)];
                }
                contents = {
                    $metadata: deserializeMetadata(output),
                    BucketKeyEnabled: undefined,
                    ETag: undefined,
                    RequestCharged: undefined,
                    SSECustomerAlgorithm: undefined,
                    SSECustomerKeyMD5: undefined,
                    SSEKMSKeyId: undefined,
                    ServerSideEncryption: undefined,
                };
                if (output.headers["x-amz-server-side-encryption"] !== undefined) {
                    contents.ServerSideEncryption = output.headers["x-amz-server-side-encryption"];
                }
                if (output.headers["etag"] !== undefined) {
                    contents.ETag = output.headers["etag"];
                }
                if (output.headers["x-amz-server-side-encryption-customer-algorithm"] !== undefined) {
                    contents.SSECustomerAlgorithm = output.headers["x-amz-server-side-encryption-customer-algorithm"];
                }
                if (output.headers["x-amz-server-side-encryption-customer-key-md5"] !== undefined) {
                    contents.SSECustomerKeyMD5 = output.headers["x-amz-server-side-encryption-customer-key-md5"];
                }
                if (output.headers["x-amz-server-side-encryption-aws-kms-key-id"] !== undefined) {
                    contents.SSEKMSKeyId = output.headers["x-amz-server-side-encryption-aws-kms-key-id"];
                }
                if (output.headers["x-amz-server-side-encryption-bucket-key-enabled"] !== undefined) {
                    contents.BucketKeyEnabled = output.headers["x-amz-server-side-encryption-bucket-key-enabled"] === "true";
                }
                if (output.headers["x-amz-request-charged"] !== undefined) {
                    contents.RequestCharged = output.headers["x-amz-request-charged"];
                }
                return [4 /*yield*/, collectBody(output.body, context)];
            case 1:
                _a.sent();
                return [2 /*return*/, Promise.resolve(contents)];
        }
    });
}); };
var deserializeAws_restXmlUploadPartCommandError = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var parsedOutput, _a, response, errorCode, parsedBody, message;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _a = [__assign({}, output)];
                _b = {};
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                parsedOutput = __assign.apply(void 0, _a.concat([(_b.body = _c.sent(), _b)]));
                errorCode = "UnknownError";
                errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
                switch (errorCode) {
                    default:
                        parsedBody = parsedOutput.body;
                        errorCode = parsedBody.code || parsedBody.Code || errorCode;
                        response = __assign(__assign({}, parsedBody), { name: "" + errorCode, message: parsedBody.message || parsedBody.Message || errorCode, $fault: "client", $metadata: deserializeMetadata(output) });
                }
                message = response.message || response.Message || errorCode;
                response.message = message;
                delete response.Message;
                return [2 /*return*/, Promise.reject(Object.assign(new Error(message), response))];
        }
    });
}); };
export var deserializeAws_restXmlUploadPartCopyCommand = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var contents, data;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (output.statusCode !== 200 && output.statusCode >= 300) {
                    return [2 /*return*/, deserializeAws_restXmlUploadPartCopyCommandError(output, context)];
                }
                contents = {
                    $metadata: deserializeMetadata(output),
                    BucketKeyEnabled: undefined,
                    CopyPartResult: undefined,
                    CopySourceVersionId: undefined,
                    RequestCharged: undefined,
                    SSECustomerAlgorithm: undefined,
                    SSECustomerKeyMD5: undefined,
                    SSEKMSKeyId: undefined,
                    ServerSideEncryption: undefined,
                };
                if (output.headers["x-amz-copy-source-version-id"] !== undefined) {
                    contents.CopySourceVersionId = output.headers["x-amz-copy-source-version-id"];
                }
                if (output.headers["x-amz-server-side-encryption"] !== undefined) {
                    contents.ServerSideEncryption = output.headers["x-amz-server-side-encryption"];
                }
                if (output.headers["x-amz-server-side-encryption-customer-algorithm"] !== undefined) {
                    contents.SSECustomerAlgorithm = output.headers["x-amz-server-side-encryption-customer-algorithm"];
                }
                if (output.headers["x-amz-server-side-encryption-customer-key-md5"] !== undefined) {
                    contents.SSECustomerKeyMD5 = output.headers["x-amz-server-side-encryption-customer-key-md5"];
                }
                if (output.headers["x-amz-server-side-encryption-aws-kms-key-id"] !== undefined) {
                    contents.SSEKMSKeyId = output.headers["x-amz-server-side-encryption-aws-kms-key-id"];
                }
                if (output.headers["x-amz-server-side-encryption-bucket-key-enabled"] !== undefined) {
                    contents.BucketKeyEnabled = output.headers["x-amz-server-side-encryption-bucket-key-enabled"] === "true";
                }
                if (output.headers["x-amz-request-charged"] !== undefined) {
                    contents.RequestCharged = output.headers["x-amz-request-charged"];
                }
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                data = _a.sent();
                contents.CopyPartResult = deserializeAws_restXmlCopyPartResult(data, context);
                return [2 /*return*/, Promise.resolve(contents)];
        }
    });
}); };
var deserializeAws_restXmlUploadPartCopyCommandError = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var parsedOutput, _a, response, errorCode, parsedBody, message;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _a = [__assign({}, output)];
                _b = {};
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                parsedOutput = __assign.apply(void 0, _a.concat([(_b.body = _c.sent(), _b)]));
                errorCode = "UnknownError";
                errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
                switch (errorCode) {
                    default:
                        parsedBody = parsedOutput.body;
                        errorCode = parsedBody.code || parsedBody.Code || errorCode;
                        response = __assign(__assign({}, parsedBody), { name: "" + errorCode, message: parsedBody.message || parsedBody.Message || errorCode, $fault: "client", $metadata: deserializeMetadata(output) });
                }
                message = response.message || response.Message || errorCode;
                response.message = message;
                delete response.Message;
                return [2 /*return*/, Promise.reject(Object.assign(new Error(message), response))];
        }
    });
}); };
var deserializeAws_restXmlSelectObjectContentEventStream_event = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, _b, _c, _d, _e;
    return __generator(this, function (_f) {
        switch (_f.label) {
            case 0:
                if (!(output["Records"] !== undefined)) return [3 /*break*/, 2];
                _a = {};
                return [4 /*yield*/, deserializeAws_restXmlRecordsEvent_event(output["Records"], context)];
            case 1: return [2 /*return*/, (_a.Records = _f.sent(),
                    _a)];
            case 2:
                if (!(output["Stats"] !== undefined)) return [3 /*break*/, 4];
                _b = {};
                return [4 /*yield*/, deserializeAws_restXmlStatsEvent_event(output["Stats"], context)];
            case 3: return [2 /*return*/, (_b.Stats = _f.sent(),
                    _b)];
            case 4:
                if (!(output["Progress"] !== undefined)) return [3 /*break*/, 6];
                _c = {};
                return [4 /*yield*/, deserializeAws_restXmlProgressEvent_event(output["Progress"], context)];
            case 5: return [2 /*return*/, (_c.Progress = _f.sent(),
                    _c)];
            case 6:
                if (!(output["Cont"] !== undefined)) return [3 /*break*/, 8];
                _d = {};
                return [4 /*yield*/, deserializeAws_restXmlContinuationEvent_event(output["Cont"], context)];
            case 7: return [2 /*return*/, (_d.Cont = _f.sent(),
                    _d)];
            case 8:
                if (!(output["End"] !== undefined)) return [3 /*break*/, 10];
                _e = {};
                return [4 /*yield*/, deserializeAws_restXmlEndEvent_event(output["End"], context)];
            case 9: return [2 /*return*/, (_e.End = _f.sent(),
                    _e)];
            case 10: return [2 /*return*/, { $unknown: output }];
        }
    });
}); };
var deserializeAws_restXmlContinuationEvent_event = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var contents;
    return __generator(this, function (_a) {
        contents = {};
        return [2 /*return*/, contents];
    });
}); };
var deserializeAws_restXmlEndEvent_event = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var contents;
    return __generator(this, function (_a) {
        contents = {};
        return [2 /*return*/, contents];
    });
}); };
var deserializeAws_restXmlProgressEvent_event = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var contents, _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                contents = {};
                _a = contents;
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                _a.Details = _b.sent();
                return [2 /*return*/, contents];
        }
    });
}); };
var deserializeAws_restXmlRecordsEvent_event = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var contents;
    return __generator(this, function (_a) {
        contents = {};
        contents.Payload = output.body;
        return [2 /*return*/, contents];
    });
}); };
var deserializeAws_restXmlStatsEvent_event = function (output, context) { return __awaiter(void 0, void 0, void 0, function () {
    var contents, _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                contents = {};
                _a = contents;
                return [4 /*yield*/, parseBody(output.body, context)];
            case 1:
                _a.Details = _b.sent();
                return [2 /*return*/, contents];
        }
    });
}); };
var deserializeAws_restXmlBucketAlreadyExistsResponse = function (parsedOutput, context) { return __awaiter(void 0, void 0, void 0, function () {
    var contents, data;
    return __generator(this, function (_a) {
        contents = {
            name: "BucketAlreadyExists",
            $fault: "client",
            $metadata: deserializeMetadata(parsedOutput),
        };
        data = parsedOutput.body;
        return [2 /*return*/, contents];
    });
}); };
var deserializeAws_restXmlBucketAlreadyOwnedByYouResponse = function (parsedOutput, context) { return __awaiter(void 0, void 0, void 0, function () {
    var contents, data;
    return __generator(this, function (_a) {
        contents = {
            name: "BucketAlreadyOwnedByYou",
            $fault: "client",
            $metadata: deserializeMetadata(parsedOutput),
        };
        data = parsedOutput.body;
        return [2 /*return*/, contents];
    });
}); };
var deserializeAws_restXmlInvalidObjectStateResponse = function (parsedOutput, context) { return __awaiter(void 0, void 0, void 0, function () {
    var contents, data;
    return __generator(this, function (_a) {
        contents = {
            name: "InvalidObjectState",
            $fault: "client",
            $metadata: deserializeMetadata(parsedOutput),
            AccessTier: undefined,
            StorageClass: undefined,
        };
        data = parsedOutput.body;
        if (data["AccessTier"] !== undefined) {
            contents.AccessTier = data["AccessTier"];
        }
        if (data["StorageClass"] !== undefined) {
            contents.StorageClass = data["StorageClass"];
        }
        return [2 /*return*/, contents];
    });
}); };
var deserializeAws_restXmlNoSuchBucketResponse = function (parsedOutput, context) { return __awaiter(void 0, void 0, void 0, function () {
    var contents, data;
    return __generator(this, function (_a) {
        contents = {
            name: "NoSuchBucket",
            $fault: "client",
            $metadata: deserializeMetadata(parsedOutput),
        };
        data = parsedOutput.body;
        return [2 /*return*/, contents];
    });
}); };
var deserializeAws_restXmlNoSuchKeyResponse = function (parsedOutput, context) { return __awaiter(void 0, void 0, void 0, function () {
    var contents, data;
    return __generator(this, function (_a) {
        contents = {
            name: "NoSuchKey",
            $fault: "client",
            $metadata: deserializeMetadata(parsedOutput),
        };
        data = parsedOutput.body;
        return [2 /*return*/, contents];
    });
}); };
var deserializeAws_restXmlNoSuchUploadResponse = function (parsedOutput, context) { return __awaiter(void 0, void 0, void 0, function () {
    var contents, data;
    return __generator(this, function (_a) {
        contents = {
            name: "NoSuchUpload",
            $fault: "client",
            $metadata: deserializeMetadata(parsedOutput),
        };
        data = parsedOutput.body;
        return [2 /*return*/, contents];
    });
}); };
var deserializeAws_restXmlObjectAlreadyInActiveTierErrorResponse = function (parsedOutput, context) { return __awaiter(void 0, void 0, void 0, function () {
    var contents, data;
    return __generator(this, function (_a) {
        contents = {
            name: "ObjectAlreadyInActiveTierError",
            $fault: "client",
            $metadata: deserializeMetadata(parsedOutput),
        };
        data = parsedOutput.body;
        return [2 /*return*/, contents];
    });
}); };
var deserializeAws_restXmlObjectNotInActiveTierErrorResponse = function (parsedOutput, context) { return __awaiter(void 0, void 0, void 0, function () {
    var contents, data;
    return __generator(this, function (_a) {
        contents = {
            name: "ObjectNotInActiveTierError",
            $fault: "client",
            $metadata: deserializeMetadata(parsedOutput),
        };
        data = parsedOutput.body;
        return [2 /*return*/, contents];
    });
}); };
var serializeAws_restXmlAbortIncompleteMultipartUpload = function (input, context) {
    var bodyNode = new __XmlNode("AbortIncompleteMultipartUpload");
    if (input.DaysAfterInitiation !== undefined && input.DaysAfterInitiation !== null) {
        var node = new __XmlNode("DaysAfterInitiation")
            .addChildNode(new __XmlText(String(input.DaysAfterInitiation)))
            .withName("DaysAfterInitiation");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
var serializeAws_restXmlAccelerateConfiguration = function (input, context) {
    var bodyNode = new __XmlNode("AccelerateConfiguration");
    if (input.Status !== undefined && input.Status !== null) {
        var node = new __XmlNode("BucketAccelerateStatus").addChildNode(new __XmlText(input.Status)).withName("Status");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
var serializeAws_restXmlAccessControlPolicy = function (input, context) {
    var bodyNode = new __XmlNode("AccessControlPolicy");
    if (input.Grants !== undefined && input.Grants !== null) {
        var nodes = serializeAws_restXmlGrants(input.Grants, context);
        var containerNode_1 = new __XmlNode("AccessControlList");
        nodes.map(function (node) {
            containerNode_1.addChildNode(node);
        });
        bodyNode.addChildNode(containerNode_1);
    }
    if (input.Owner !== undefined && input.Owner !== null) {
        var node = serializeAws_restXmlOwner(input.Owner, context).withName("Owner");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
var serializeAws_restXmlAccessControlTranslation = function (input, context) {
    var bodyNode = new __XmlNode("AccessControlTranslation");
    if (input.Owner !== undefined && input.Owner !== null) {
        var node = new __XmlNode("OwnerOverride").addChildNode(new __XmlText(input.Owner)).withName("Owner");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
var serializeAws_restXmlAllowedHeaders = function (input, context) {
    return input
        .filter(function (e) { return e != null; })
        .map(function (entry) {
        if (entry === null) {
            return null;
        }
        var node = new __XmlNode("AllowedHeader").addChildNode(new __XmlText(entry));
        return node.withName("member");
    });
};
var serializeAws_restXmlAllowedMethods = function (input, context) {
    return input
        .filter(function (e) { return e != null; })
        .map(function (entry) {
        if (entry === null) {
            return null;
        }
        var node = new __XmlNode("AllowedMethod").addChildNode(new __XmlText(entry));
        return node.withName("member");
    });
};
var serializeAws_restXmlAllowedOrigins = function (input, context) {
    return input
        .filter(function (e) { return e != null; })
        .map(function (entry) {
        if (entry === null) {
            return null;
        }
        var node = new __XmlNode("AllowedOrigin").addChildNode(new __XmlText(entry));
        return node.withName("member");
    });
};
var serializeAws_restXmlAnalyticsAndOperator = function (input, context) {
    var bodyNode = new __XmlNode("AnalyticsAndOperator");
    if (input.Prefix !== undefined && input.Prefix !== null) {
        var node = new __XmlNode("Prefix").addChildNode(new __XmlText(input.Prefix)).withName("Prefix");
        bodyNode.addChildNode(node);
    }
    if (input.Tags !== undefined && input.Tags !== null) {
        var nodes = serializeAws_restXmlTagSet(input.Tags, context);
        nodes.map(function (node) {
            node = node.withName("Tag");
            bodyNode.addChildNode(node);
        });
    }
    return bodyNode;
};
var serializeAws_restXmlAnalyticsConfiguration = function (input, context) {
    var bodyNode = new __XmlNode("AnalyticsConfiguration");
    if (input.Id !== undefined && input.Id !== null) {
        var node = new __XmlNode("AnalyticsId").addChildNode(new __XmlText(input.Id)).withName("Id");
        bodyNode.addChildNode(node);
    }
    if (input.Filter !== undefined && input.Filter !== null) {
        var node = serializeAws_restXmlAnalyticsFilter(input.Filter, context).withName("Filter");
        bodyNode.addChildNode(node);
    }
    if (input.StorageClassAnalysis !== undefined && input.StorageClassAnalysis !== null) {
        var node = serializeAws_restXmlStorageClassAnalysis(input.StorageClassAnalysis, context).withName("StorageClassAnalysis");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
var serializeAws_restXmlAnalyticsExportDestination = function (input, context) {
    var bodyNode = new __XmlNode("AnalyticsExportDestination");
    if (input.S3BucketDestination !== undefined && input.S3BucketDestination !== null) {
        var node = serializeAws_restXmlAnalyticsS3BucketDestination(input.S3BucketDestination, context).withName("S3BucketDestination");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
var serializeAws_restXmlAnalyticsFilter = function (input, context) {
    var bodyNode = new __XmlNode("AnalyticsFilter");
    AnalyticsFilter.visit(input, {
        Prefix: function (value) {
            var node = new __XmlNode("Prefix").addChildNode(new __XmlText(value)).withName("Prefix");
            bodyNode.addChildNode(node);
        },
        Tag: function (value) {
            var node = serializeAws_restXmlTag(value, context).withName("Tag");
            bodyNode.addChildNode(node);
        },
        And: function (value) {
            var node = serializeAws_restXmlAnalyticsAndOperator(value, context).withName("And");
            bodyNode.addChildNode(node);
        },
        _: function (name, value) {
            if (!(value instanceof __XmlNode || value instanceof __XmlText)) {
                throw new Error("Unable to serialize unknown union members in XML.");
            }
            bodyNode.addChildNode(new __XmlNode(name).addChildNode(value));
        },
    });
    return bodyNode;
};
var serializeAws_restXmlAnalyticsS3BucketDestination = function (input, context) {
    var bodyNode = new __XmlNode("AnalyticsS3BucketDestination");
    if (input.Format !== undefined && input.Format !== null) {
        var node = new __XmlNode("AnalyticsS3ExportFileFormat")
            .addChildNode(new __XmlText(input.Format))
            .withName("Format");
        bodyNode.addChildNode(node);
    }
    if (input.BucketAccountId !== undefined && input.BucketAccountId !== null) {
        var node = new __XmlNode("AccountId")
            .addChildNode(new __XmlText(input.BucketAccountId))
            .withName("BucketAccountId");
        bodyNode.addChildNode(node);
    }
    if (input.Bucket !== undefined && input.Bucket !== null) {
        var node = new __XmlNode("BucketName").addChildNode(new __XmlText(input.Bucket)).withName("Bucket");
        bodyNode.addChildNode(node);
    }
    if (input.Prefix !== undefined && input.Prefix !== null) {
        var node = new __XmlNode("Prefix").addChildNode(new __XmlText(input.Prefix)).withName("Prefix");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
var serializeAws_restXmlBucketLifecycleConfiguration = function (input, context) {
    var bodyNode = new __XmlNode("BucketLifecycleConfiguration");
    if (input.Rules !== undefined && input.Rules !== null) {
        var nodes = serializeAws_restXmlLifecycleRules(input.Rules, context);
        nodes.map(function (node) {
            node = node.withName("Rule");
            bodyNode.addChildNode(node);
        });
    }
    return bodyNode;
};
var serializeAws_restXmlBucketLoggingStatus = function (input, context) {
    var bodyNode = new __XmlNode("BucketLoggingStatus");
    if (input.LoggingEnabled !== undefined && input.LoggingEnabled !== null) {
        var node = serializeAws_restXmlLoggingEnabled(input.LoggingEnabled, context).withName("LoggingEnabled");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
var serializeAws_restXmlCompletedMultipartUpload = function (input, context) {
    var bodyNode = new __XmlNode("CompletedMultipartUpload");
    if (input.Parts !== undefined && input.Parts !== null) {
        var nodes = serializeAws_restXmlCompletedPartList(input.Parts, context);
        nodes.map(function (node) {
            node = node.withName("Part");
            bodyNode.addChildNode(node);
        });
    }
    return bodyNode;
};
var serializeAws_restXmlCompletedPart = function (input, context) {
    var bodyNode = new __XmlNode("CompletedPart");
    if (input.ETag !== undefined && input.ETag !== null) {
        var node = new __XmlNode("ETag").addChildNode(new __XmlText(input.ETag)).withName("ETag");
        bodyNode.addChildNode(node);
    }
    if (input.PartNumber !== undefined && input.PartNumber !== null) {
        var node = new __XmlNode("PartNumber")
            .addChildNode(new __XmlText(String(input.PartNumber)))
            .withName("PartNumber");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
var serializeAws_restXmlCompletedPartList = function (input, context) {
    return input
        .filter(function (e) { return e != null; })
        .map(function (entry) {
        if (entry === null) {
            return null;
        }
        var node = serializeAws_restXmlCompletedPart(entry, context);
        return node.withName("member");
    });
};
var serializeAws_restXmlCondition = function (input, context) {
    var bodyNode = new __XmlNode("Condition");
    if (input.HttpErrorCodeReturnedEquals !== undefined && input.HttpErrorCodeReturnedEquals !== null) {
        var node = new __XmlNode("HttpErrorCodeReturnedEquals")
            .addChildNode(new __XmlText(input.HttpErrorCodeReturnedEquals))
            .withName("HttpErrorCodeReturnedEquals");
        bodyNode.addChildNode(node);
    }
    if (input.KeyPrefixEquals !== undefined && input.KeyPrefixEquals !== null) {
        var node = new __XmlNode("KeyPrefixEquals")
            .addChildNode(new __XmlText(input.KeyPrefixEquals))
            .withName("KeyPrefixEquals");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
var serializeAws_restXmlCORSConfiguration = function (input, context) {
    var bodyNode = new __XmlNode("CORSConfiguration");
    if (input.CORSRules !== undefined && input.CORSRules !== null) {
        var nodes = serializeAws_restXmlCORSRules(input.CORSRules, context);
        nodes.map(function (node) {
            node = node.withName("CORSRule");
            bodyNode.addChildNode(node);
        });
    }
    return bodyNode;
};
var serializeAws_restXmlCORSRule = function (input, context) {
    var bodyNode = new __XmlNode("CORSRule");
    if (input.AllowedHeaders !== undefined && input.AllowedHeaders !== null) {
        var nodes = serializeAws_restXmlAllowedHeaders(input.AllowedHeaders, context);
        nodes.map(function (node) {
            node = node.withName("AllowedHeader");
            bodyNode.addChildNode(node);
        });
    }
    if (input.AllowedMethods !== undefined && input.AllowedMethods !== null) {
        var nodes = serializeAws_restXmlAllowedMethods(input.AllowedMethods, context);
        nodes.map(function (node) {
            node = node.withName("AllowedMethod");
            bodyNode.addChildNode(node);
        });
    }
    if (input.AllowedOrigins !== undefined && input.AllowedOrigins !== null) {
        var nodes = serializeAws_restXmlAllowedOrigins(input.AllowedOrigins, context);
        nodes.map(function (node) {
            node = node.withName("AllowedOrigin");
            bodyNode.addChildNode(node);
        });
    }
    if (input.ExposeHeaders !== undefined && input.ExposeHeaders !== null) {
        var nodes = serializeAws_restXmlExposeHeaders(input.ExposeHeaders, context);
        nodes.map(function (node) {
            node = node.withName("ExposeHeader");
            bodyNode.addChildNode(node);
        });
    }
    if (input.MaxAgeSeconds !== undefined && input.MaxAgeSeconds !== null) {
        var node = new __XmlNode("MaxAgeSeconds")
            .addChildNode(new __XmlText(String(input.MaxAgeSeconds)))
            .withName("MaxAgeSeconds");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
var serializeAws_restXmlCORSRules = function (input, context) {
    return input
        .filter(function (e) { return e != null; })
        .map(function (entry) {
        if (entry === null) {
            return null;
        }
        var node = serializeAws_restXmlCORSRule(entry, context);
        return node.withName("member");
    });
};
var serializeAws_restXmlCreateBucketConfiguration = function (input, context) {
    var bodyNode = new __XmlNode("CreateBucketConfiguration");
    if (input.LocationConstraint !== undefined && input.LocationConstraint !== null) {
        var node = new __XmlNode("BucketLocationConstraint")
            .addChildNode(new __XmlText(input.LocationConstraint))
            .withName("LocationConstraint");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
var serializeAws_restXmlCSVInput = function (input, context) {
    var bodyNode = new __XmlNode("CSVInput");
    if (input.FileHeaderInfo !== undefined && input.FileHeaderInfo !== null) {
        var node = new __XmlNode("FileHeaderInfo")
            .addChildNode(new __XmlText(input.FileHeaderInfo))
            .withName("FileHeaderInfo");
        bodyNode.addChildNode(node);
    }
    if (input.Comments !== undefined && input.Comments !== null) {
        var node = new __XmlNode("Comments").addChildNode(new __XmlText(input.Comments)).withName("Comments");
        bodyNode.addChildNode(node);
    }
    if (input.QuoteEscapeCharacter !== undefined && input.QuoteEscapeCharacter !== null) {
        var node = new __XmlNode("QuoteEscapeCharacter")
            .addChildNode(new __XmlText(input.QuoteEscapeCharacter))
            .withName("QuoteEscapeCharacter");
        bodyNode.addChildNode(node);
    }
    if (input.RecordDelimiter !== undefined && input.RecordDelimiter !== null) {
        var node = new __XmlNode("RecordDelimiter")
            .addChildNode(new __XmlText(input.RecordDelimiter))
            .withName("RecordDelimiter");
        bodyNode.addChildNode(node);
    }
    if (input.FieldDelimiter !== undefined && input.FieldDelimiter !== null) {
        var node = new __XmlNode("FieldDelimiter")
            .addChildNode(new __XmlText(input.FieldDelimiter))
            .withName("FieldDelimiter");
        bodyNode.addChildNode(node);
    }
    if (input.QuoteCharacter !== undefined && input.QuoteCharacter !== null) {
        var node = new __XmlNode("QuoteCharacter")
            .addChildNode(new __XmlText(input.QuoteCharacter))
            .withName("QuoteCharacter");
        bodyNode.addChildNode(node);
    }
    if (input.AllowQuotedRecordDelimiter !== undefined && input.AllowQuotedRecordDelimiter !== null) {
        var node = new __XmlNode("AllowQuotedRecordDelimiter")
            .addChildNode(new __XmlText(String(input.AllowQuotedRecordDelimiter)))
            .withName("AllowQuotedRecordDelimiter");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
var serializeAws_restXmlCSVOutput = function (input, context) {
    var bodyNode = new __XmlNode("CSVOutput");
    if (input.QuoteFields !== undefined && input.QuoteFields !== null) {
        var node = new __XmlNode("QuoteFields").addChildNode(new __XmlText(input.QuoteFields)).withName("QuoteFields");
        bodyNode.addChildNode(node);
    }
    if (input.QuoteEscapeCharacter !== undefined && input.QuoteEscapeCharacter !== null) {
        var node = new __XmlNode("QuoteEscapeCharacter")
            .addChildNode(new __XmlText(input.QuoteEscapeCharacter))
            .withName("QuoteEscapeCharacter");
        bodyNode.addChildNode(node);
    }
    if (input.RecordDelimiter !== undefined && input.RecordDelimiter !== null) {
        var node = new __XmlNode("RecordDelimiter")
            .addChildNode(new __XmlText(input.RecordDelimiter))
            .withName("RecordDelimiter");
        bodyNode.addChildNode(node);
    }
    if (input.FieldDelimiter !== undefined && input.FieldDelimiter !== null) {
        var node = new __XmlNode("FieldDelimiter")
            .addChildNode(new __XmlText(input.FieldDelimiter))
            .withName("FieldDelimiter");
        bodyNode.addChildNode(node);
    }
    if (input.QuoteCharacter !== undefined && input.QuoteCharacter !== null) {
        var node = new __XmlNode("QuoteCharacter")
            .addChildNode(new __XmlText(input.QuoteCharacter))
            .withName("QuoteCharacter");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
var serializeAws_restXmlDefaultRetention = function (input, context) {
    var bodyNode = new __XmlNode("DefaultRetention");
    if (input.Mode !== undefined && input.Mode !== null) {
        var node = new __XmlNode("ObjectLockRetentionMode").addChildNode(new __XmlText(input.Mode)).withName("Mode");
        bodyNode.addChildNode(node);
    }
    if (input.Days !== undefined && input.Days !== null) {
        var node = new __XmlNode("Days").addChildNode(new __XmlText(String(input.Days))).withName("Days");
        bodyNode.addChildNode(node);
    }
    if (input.Years !== undefined && input.Years !== null) {
        var node = new __XmlNode("Years").addChildNode(new __XmlText(String(input.Years))).withName("Years");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
var serializeAws_restXmlDelete = function (input, context) {
    var bodyNode = new __XmlNode("Delete");
    if (input.Objects !== undefined && input.Objects !== null) {
        var nodes = serializeAws_restXmlObjectIdentifierList(input.Objects, context);
        nodes.map(function (node) {
            node = node.withName("Object");
            bodyNode.addChildNode(node);
        });
    }
    if (input.Quiet !== undefined && input.Quiet !== null) {
        var node = new __XmlNode("Quiet").addChildNode(new __XmlText(String(input.Quiet))).withName("Quiet");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
var serializeAws_restXmlDeleteMarkerReplication = function (input, context) {
    var bodyNode = new __XmlNode("DeleteMarkerReplication");
    if (input.Status !== undefined && input.Status !== null) {
        var node = new __XmlNode("DeleteMarkerReplicationStatus")
            .addChildNode(new __XmlText(input.Status))
            .withName("Status");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
var serializeAws_restXmlDestination = function (input, context) {
    var bodyNode = new __XmlNode("Destination");
    if (input.Bucket !== undefined && input.Bucket !== null) {
        var node = new __XmlNode("BucketName").addChildNode(new __XmlText(input.Bucket)).withName("Bucket");
        bodyNode.addChildNode(node);
    }
    if (input.Account !== undefined && input.Account !== null) {
        var node = new __XmlNode("AccountId").addChildNode(new __XmlText(input.Account)).withName("Account");
        bodyNode.addChildNode(node);
    }
    if (input.StorageClass !== undefined && input.StorageClass !== null) {
        var node = new __XmlNode("StorageClass").addChildNode(new __XmlText(input.StorageClass)).withName("StorageClass");
        bodyNode.addChildNode(node);
    }
    if (input.AccessControlTranslation !== undefined && input.AccessControlTranslation !== null) {
        var node = serializeAws_restXmlAccessControlTranslation(input.AccessControlTranslation, context).withName("AccessControlTranslation");
        bodyNode.addChildNode(node);
    }
    if (input.EncryptionConfiguration !== undefined && input.EncryptionConfiguration !== null) {
        var node = serializeAws_restXmlEncryptionConfiguration(input.EncryptionConfiguration, context).withName("EncryptionConfiguration");
        bodyNode.addChildNode(node);
    }
    if (input.ReplicationTime !== undefined && input.ReplicationTime !== null) {
        var node = serializeAws_restXmlReplicationTime(input.ReplicationTime, context).withName("ReplicationTime");
        bodyNode.addChildNode(node);
    }
    if (input.Metrics !== undefined && input.Metrics !== null) {
        var node = serializeAws_restXmlMetrics(input.Metrics, context).withName("Metrics");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
var serializeAws_restXmlEncryption = function (input, context) {
    var bodyNode = new __XmlNode("Encryption");
    if (input.EncryptionType !== undefined && input.EncryptionType !== null) {
        var node = new __XmlNode("ServerSideEncryption")
            .addChildNode(new __XmlText(input.EncryptionType))
            .withName("EncryptionType");
        bodyNode.addChildNode(node);
    }
    if (input.KMSKeyId !== undefined && input.KMSKeyId !== null) {
        var node = new __XmlNode("SSEKMSKeyId").addChildNode(new __XmlText(input.KMSKeyId)).withName("KMSKeyId");
        bodyNode.addChildNode(node);
    }
    if (input.KMSContext !== undefined && input.KMSContext !== null) {
        var node = new __XmlNode("KMSContext").addChildNode(new __XmlText(input.KMSContext)).withName("KMSContext");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
var serializeAws_restXmlEncryptionConfiguration = function (input, context) {
    var bodyNode = new __XmlNode("EncryptionConfiguration");
    if (input.ReplicaKmsKeyID !== undefined && input.ReplicaKmsKeyID !== null) {
        var node = new __XmlNode("ReplicaKmsKeyID")
            .addChildNode(new __XmlText(input.ReplicaKmsKeyID))
            .withName("ReplicaKmsKeyID");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
var serializeAws_restXmlErrorDocument = function (input, context) {
    var bodyNode = new __XmlNode("ErrorDocument");
    if (input.Key !== undefined && input.Key !== null) {
        var node = new __XmlNode("ObjectKey").addChildNode(new __XmlText(input.Key)).withName("Key");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
var serializeAws_restXmlEventList = function (input, context) {
    return input
        .filter(function (e) { return e != null; })
        .map(function (entry) {
        if (entry === null) {
            return null;
        }
        var node = new __XmlNode("Event").addChildNode(new __XmlText(entry));
        return node.withName("member");
    });
};
var serializeAws_restXmlExistingObjectReplication = function (input, context) {
    var bodyNode = new __XmlNode("ExistingObjectReplication");
    if (input.Status !== undefined && input.Status !== null) {
        var node = new __XmlNode("ExistingObjectReplicationStatus")
            .addChildNode(new __XmlText(input.Status))
            .withName("Status");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
var serializeAws_restXmlExposeHeaders = function (input, context) {
    return input
        .filter(function (e) { return e != null; })
        .map(function (entry) {
        if (entry === null) {
            return null;
        }
        var node = new __XmlNode("ExposeHeader").addChildNode(new __XmlText(entry));
        return node.withName("member");
    });
};
var serializeAws_restXmlFilterRule = function (input, context) {
    var bodyNode = new __XmlNode("FilterRule");
    if (input.Name !== undefined && input.Name !== null) {
        var node = new __XmlNode("FilterRuleName").addChildNode(new __XmlText(input.Name)).withName("Name");
        bodyNode.addChildNode(node);
    }
    if (input.Value !== undefined && input.Value !== null) {
        var node = new __XmlNode("FilterRuleValue").addChildNode(new __XmlText(input.Value)).withName("Value");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
var serializeAws_restXmlFilterRuleList = function (input, context) {
    return input
        .filter(function (e) { return e != null; })
        .map(function (entry) {
        if (entry === null) {
            return null;
        }
        var node = serializeAws_restXmlFilterRule(entry, context);
        return node.withName("member");
    });
};
var serializeAws_restXmlGlacierJobParameters = function (input, context) {
    var bodyNode = new __XmlNode("GlacierJobParameters");
    if (input.Tier !== undefined && input.Tier !== null) {
        var node = new __XmlNode("Tier").addChildNode(new __XmlText(input.Tier)).withName("Tier");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
var serializeAws_restXmlGrant = function (input, context) {
    var bodyNode = new __XmlNode("Grant");
    if (input.Grantee !== undefined && input.Grantee !== null) {
        var node = serializeAws_restXmlGrantee(input.Grantee, context).withName("Grantee");
        bodyNode.addChildNode(node);
    }
    if (input.Permission !== undefined && input.Permission !== null) {
        var node = new __XmlNode("Permission").addChildNode(new __XmlText(input.Permission)).withName("Permission");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
var serializeAws_restXmlGrantee = function (input, context) {
    var bodyNode = new __XmlNode("Grantee");
    if (input.DisplayName !== undefined && input.DisplayName !== null) {
        var node = new __XmlNode("DisplayName").addChildNode(new __XmlText(input.DisplayName)).withName("DisplayName");
        bodyNode.addChildNode(node);
    }
    if (input.EmailAddress !== undefined && input.EmailAddress !== null) {
        var node = new __XmlNode("EmailAddress").addChildNode(new __XmlText(input.EmailAddress)).withName("EmailAddress");
        bodyNode.addChildNode(node);
    }
    if (input.ID !== undefined && input.ID !== null) {
        var node = new __XmlNode("ID").addChildNode(new __XmlText(input.ID)).withName("ID");
        bodyNode.addChildNode(node);
    }
    if (input.URI !== undefined && input.URI !== null) {
        var node = new __XmlNode("URI").addChildNode(new __XmlText(input.URI)).withName("URI");
        bodyNode.addChildNode(node);
    }
    if (input.Type !== undefined && input.Type !== null) {
        bodyNode.addAttribute("xsi:type", input.Type);
    }
    return bodyNode;
};
var serializeAws_restXmlGrants = function (input, context) {
    return input
        .filter(function (e) { return e != null; })
        .map(function (entry) {
        if (entry === null) {
            return null;
        }
        var node = serializeAws_restXmlGrant(entry, context);
        return node.withName("Grant");
    });
};
var serializeAws_restXmlIndexDocument = function (input, context) {
    var bodyNode = new __XmlNode("IndexDocument");
    if (input.Suffix !== undefined && input.Suffix !== null) {
        var node = new __XmlNode("Suffix").addChildNode(new __XmlText(input.Suffix)).withName("Suffix");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
var serializeAws_restXmlInputSerialization = function (input, context) {
    var bodyNode = new __XmlNode("InputSerialization");
    if (input.CSV !== undefined && input.CSV !== null) {
        var node = serializeAws_restXmlCSVInput(input.CSV, context).withName("CSV");
        bodyNode.addChildNode(node);
    }
    if (input.CompressionType !== undefined && input.CompressionType !== null) {
        var node = new __XmlNode("CompressionType")
            .addChildNode(new __XmlText(input.CompressionType))
            .withName("CompressionType");
        bodyNode.addChildNode(node);
    }
    if (input.JSON !== undefined && input.JSON !== null) {
        var node = serializeAws_restXmlJSONInput(input.JSON, context).withName("JSON");
        bodyNode.addChildNode(node);
    }
    if (input.Parquet !== undefined && input.Parquet !== null) {
        var node = serializeAws_restXmlParquetInput(input.Parquet, context).withName("Parquet");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
var serializeAws_restXmlIntelligentTieringAndOperator = function (input, context) {
    var bodyNode = new __XmlNode("IntelligentTieringAndOperator");
    if (input.Prefix !== undefined && input.Prefix !== null) {
        var node = new __XmlNode("Prefix").addChildNode(new __XmlText(input.Prefix)).withName("Prefix");
        bodyNode.addChildNode(node);
    }
    if (input.Tags !== undefined && input.Tags !== null) {
        var nodes = serializeAws_restXmlTagSet(input.Tags, context);
        nodes.map(function (node) {
            node = node.withName("Tag");
            bodyNode.addChildNode(node);
        });
    }
    return bodyNode;
};
var serializeAws_restXmlIntelligentTieringConfiguration = function (input, context) {
    var bodyNode = new __XmlNode("IntelligentTieringConfiguration");
    if (input.Id !== undefined && input.Id !== null) {
        var node = new __XmlNode("IntelligentTieringId").addChildNode(new __XmlText(input.Id)).withName("Id");
        bodyNode.addChildNode(node);
    }
    if (input.Filter !== undefined && input.Filter !== null) {
        var node = serializeAws_restXmlIntelligentTieringFilter(input.Filter, context).withName("Filter");
        bodyNode.addChildNode(node);
    }
    if (input.Status !== undefined && input.Status !== null) {
        var node = new __XmlNode("IntelligentTieringStatus").addChildNode(new __XmlText(input.Status)).withName("Status");
        bodyNode.addChildNode(node);
    }
    if (input.Tierings !== undefined && input.Tierings !== null) {
        var nodes = serializeAws_restXmlTieringList(input.Tierings, context);
        nodes.map(function (node) {
            node = node.withName("Tiering");
            bodyNode.addChildNode(node);
        });
    }
    return bodyNode;
};
var serializeAws_restXmlIntelligentTieringFilter = function (input, context) {
    var bodyNode = new __XmlNode("IntelligentTieringFilter");
    if (input.Prefix !== undefined && input.Prefix !== null) {
        var node = new __XmlNode("Prefix").addChildNode(new __XmlText(input.Prefix)).withName("Prefix");
        bodyNode.addChildNode(node);
    }
    if (input.Tag !== undefined && input.Tag !== null) {
        var node = serializeAws_restXmlTag(input.Tag, context).withName("Tag");
        bodyNode.addChildNode(node);
    }
    if (input.And !== undefined && input.And !== null) {
        var node = serializeAws_restXmlIntelligentTieringAndOperator(input.And, context).withName("And");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
var serializeAws_restXmlInventoryConfiguration = function (input, context) {
    var bodyNode = new __XmlNode("InventoryConfiguration");
    if (input.Destination !== undefined && input.Destination !== null) {
        var node = serializeAws_restXmlInventoryDestination(input.Destination, context).withName("Destination");
        bodyNode.addChildNode(node);
    }
    if (input.IsEnabled !== undefined && input.IsEnabled !== null) {
        var node = new __XmlNode("IsEnabled").addChildNode(new __XmlText(String(input.IsEnabled))).withName("IsEnabled");
        bodyNode.addChildNode(node);
    }
    if (input.Filter !== undefined && input.Filter !== null) {
        var node = serializeAws_restXmlInventoryFilter(input.Filter, context).withName("Filter");
        bodyNode.addChildNode(node);
    }
    if (input.Id !== undefined && input.Id !== null) {
        var node = new __XmlNode("InventoryId").addChildNode(new __XmlText(input.Id)).withName("Id");
        bodyNode.addChildNode(node);
    }
    if (input.IncludedObjectVersions !== undefined && input.IncludedObjectVersions !== null) {
        var node = new __XmlNode("InventoryIncludedObjectVersions")
            .addChildNode(new __XmlText(input.IncludedObjectVersions))
            .withName("IncludedObjectVersions");
        bodyNode.addChildNode(node);
    }
    if (input.OptionalFields !== undefined && input.OptionalFields !== null) {
        var nodes = serializeAws_restXmlInventoryOptionalFields(input.OptionalFields, context);
        var containerNode_2 = new __XmlNode("OptionalFields");
        nodes.map(function (node) {
            containerNode_2.addChildNode(node);
        });
        bodyNode.addChildNode(containerNode_2);
    }
    if (input.Schedule !== undefined && input.Schedule !== null) {
        var node = serializeAws_restXmlInventorySchedule(input.Schedule, context).withName("Schedule");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
var serializeAws_restXmlInventoryDestination = function (input, context) {
    var bodyNode = new __XmlNode("InventoryDestination");
    if (input.S3BucketDestination !== undefined && input.S3BucketDestination !== null) {
        var node = serializeAws_restXmlInventoryS3BucketDestination(input.S3BucketDestination, context).withName("S3BucketDestination");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
var serializeAws_restXmlInventoryEncryption = function (input, context) {
    var bodyNode = new __XmlNode("InventoryEncryption");
    if (input.SSES3 !== undefined && input.SSES3 !== null) {
        var node = serializeAws_restXmlSSES3(input.SSES3, context).withName("SSE-S3");
        bodyNode.addChildNode(node);
    }
    if (input.SSEKMS !== undefined && input.SSEKMS !== null) {
        var node = serializeAws_restXmlSSEKMS(input.SSEKMS, context).withName("SSE-KMS");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
var serializeAws_restXmlInventoryFilter = function (input, context) {
    var bodyNode = new __XmlNode("InventoryFilter");
    if (input.Prefix !== undefined && input.Prefix !== null) {
        var node = new __XmlNode("Prefix").addChildNode(new __XmlText(input.Prefix)).withName("Prefix");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
var serializeAws_restXmlInventoryOptionalFields = function (input, context) {
    return input
        .filter(function (e) { return e != null; })
        .map(function (entry) {
        if (entry === null) {
            return null;
        }
        var node = new __XmlNode("InventoryOptionalField").addChildNode(new __XmlText(entry));
        return node.withName("Field");
    });
};
var serializeAws_restXmlInventoryS3BucketDestination = function (input, context) {
    var bodyNode = new __XmlNode("InventoryS3BucketDestination");
    if (input.AccountId !== undefined && input.AccountId !== null) {
        var node = new __XmlNode("AccountId").addChildNode(new __XmlText(input.AccountId)).withName("AccountId");
        bodyNode.addChildNode(node);
    }
    if (input.Bucket !== undefined && input.Bucket !== null) {
        var node = new __XmlNode("BucketName").addChildNode(new __XmlText(input.Bucket)).withName("Bucket");
        bodyNode.addChildNode(node);
    }
    if (input.Format !== undefined && input.Format !== null) {
        var node = new __XmlNode("InventoryFormat").addChildNode(new __XmlText(input.Format)).withName("Format");
        bodyNode.addChildNode(node);
    }
    if (input.Prefix !== undefined && input.Prefix !== null) {
        var node = new __XmlNode("Prefix").addChildNode(new __XmlText(input.Prefix)).withName("Prefix");
        bodyNode.addChildNode(node);
    }
    if (input.Encryption !== undefined && input.Encryption !== null) {
        var node = serializeAws_restXmlInventoryEncryption(input.Encryption, context).withName("Encryption");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
var serializeAws_restXmlInventorySchedule = function (input, context) {
    var bodyNode = new __XmlNode("InventorySchedule");
    if (input.Frequency !== undefined && input.Frequency !== null) {
        var node = new __XmlNode("InventoryFrequency").addChildNode(new __XmlText(input.Frequency)).withName("Frequency");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
var serializeAws_restXmlJSONInput = function (input, context) {
    var bodyNode = new __XmlNode("JSONInput");
    if (input.Type !== undefined && input.Type !== null) {
        var node = new __XmlNode("JSONType").addChildNode(new __XmlText(input.Type)).withName("Type");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
var serializeAws_restXmlJSONOutput = function (input, context) {
    var bodyNode = new __XmlNode("JSONOutput");
    if (input.RecordDelimiter !== undefined && input.RecordDelimiter !== null) {
        var node = new __XmlNode("RecordDelimiter")
            .addChildNode(new __XmlText(input.RecordDelimiter))
            .withName("RecordDelimiter");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
var serializeAws_restXmlLambdaFunctionConfiguration = function (input, context) {
    var bodyNode = new __XmlNode("LambdaFunctionConfiguration");
    if (input.Id !== undefined && input.Id !== null) {
        var node = new __XmlNode("NotificationId").addChildNode(new __XmlText(input.Id)).withName("Id");
        bodyNode.addChildNode(node);
    }
    if (input.LambdaFunctionArn !== undefined && input.LambdaFunctionArn !== null) {
        var node = new __XmlNode("LambdaFunctionArn")
            .addChildNode(new __XmlText(input.LambdaFunctionArn))
            .withName("CloudFunction");
        bodyNode.addChildNode(node);
    }
    if (input.Events !== undefined && input.Events !== null) {
        var nodes = serializeAws_restXmlEventList(input.Events, context);
        nodes.map(function (node) {
            node = node.withName("Event");
            bodyNode.addChildNode(node);
        });
    }
    if (input.Filter !== undefined && input.Filter !== null) {
        var node = serializeAws_restXmlNotificationConfigurationFilter(input.Filter, context).withName("Filter");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
var serializeAws_restXmlLambdaFunctionConfigurationList = function (input, context) {
    return input
        .filter(function (e) { return e != null; })
        .map(function (entry) {
        if (entry === null) {
            return null;
        }
        var node = serializeAws_restXmlLambdaFunctionConfiguration(entry, context);
        return node.withName("member");
    });
};
var serializeAws_restXmlLifecycleExpiration = function (input, context) {
    var bodyNode = new __XmlNode("LifecycleExpiration");
    if (input.Date !== undefined && input.Date !== null) {
        var node = new __XmlNode("Date")
            .addChildNode(new __XmlText(input.Date.toISOString().split(".")[0] + "Z"))
            .withName("Date");
        bodyNode.addChildNode(node);
    }
    if (input.Days !== undefined && input.Days !== null) {
        var node = new __XmlNode("Days").addChildNode(new __XmlText(String(input.Days))).withName("Days");
        bodyNode.addChildNode(node);
    }
    if (input.ExpiredObjectDeleteMarker !== undefined && input.ExpiredObjectDeleteMarker !== null) {
        var node = new __XmlNode("ExpiredObjectDeleteMarker")
            .addChildNode(new __XmlText(String(input.ExpiredObjectDeleteMarker)))
            .withName("ExpiredObjectDeleteMarker");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
var serializeAws_restXmlLifecycleRule = function (input, context) {
    var bodyNode = new __XmlNode("LifecycleRule");
    if (input.Expiration !== undefined && input.Expiration !== null) {
        var node = serializeAws_restXmlLifecycleExpiration(input.Expiration, context).withName("Expiration");
        bodyNode.addChildNode(node);
    }
    if (input.ID !== undefined && input.ID !== null) {
        var node = new __XmlNode("ID").addChildNode(new __XmlText(input.ID)).withName("ID");
        bodyNode.addChildNode(node);
    }
    if (input.Prefix !== undefined && input.Prefix !== null) {
        var node = new __XmlNode("Prefix").addChildNode(new __XmlText(input.Prefix)).withName("Prefix");
        bodyNode.addChildNode(node);
    }
    if (input.Filter !== undefined && input.Filter !== null) {
        var node = serializeAws_restXmlLifecycleRuleFilter(input.Filter, context).withName("Filter");
        bodyNode.addChildNode(node);
    }
    if (input.Status !== undefined && input.Status !== null) {
        var node = new __XmlNode("ExpirationStatus").addChildNode(new __XmlText(input.Status)).withName("Status");
        bodyNode.addChildNode(node);
    }
    if (input.Transitions !== undefined && input.Transitions !== null) {
        var nodes = serializeAws_restXmlTransitionList(input.Transitions, context);
        nodes.map(function (node) {
            node = node.withName("Transition");
            bodyNode.addChildNode(node);
        });
    }
    if (input.NoncurrentVersionTransitions !== undefined && input.NoncurrentVersionTransitions !== null) {
        var nodes = serializeAws_restXmlNoncurrentVersionTransitionList(input.NoncurrentVersionTransitions, context);
        nodes.map(function (node) {
            node = node.withName("NoncurrentVersionTransition");
            bodyNode.addChildNode(node);
        });
    }
    if (input.NoncurrentVersionExpiration !== undefined && input.NoncurrentVersionExpiration !== null) {
        var node = serializeAws_restXmlNoncurrentVersionExpiration(input.NoncurrentVersionExpiration, context).withName("NoncurrentVersionExpiration");
        bodyNode.addChildNode(node);
    }
    if (input.AbortIncompleteMultipartUpload !== undefined && input.AbortIncompleteMultipartUpload !== null) {
        var node = serializeAws_restXmlAbortIncompleteMultipartUpload(input.AbortIncompleteMultipartUpload, context).withName("AbortIncompleteMultipartUpload");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
var serializeAws_restXmlLifecycleRuleAndOperator = function (input, context) {
    var bodyNode = new __XmlNode("LifecycleRuleAndOperator");
    if (input.Prefix !== undefined && input.Prefix !== null) {
        var node = new __XmlNode("Prefix").addChildNode(new __XmlText(input.Prefix)).withName("Prefix");
        bodyNode.addChildNode(node);
    }
    if (input.Tags !== undefined && input.Tags !== null) {
        var nodes = serializeAws_restXmlTagSet(input.Tags, context);
        nodes.map(function (node) {
            node = node.withName("Tag");
            bodyNode.addChildNode(node);
        });
    }
    return bodyNode;
};
var serializeAws_restXmlLifecycleRuleFilter = function (input, context) {
    var bodyNode = new __XmlNode("LifecycleRuleFilter");
    LifecycleRuleFilter.visit(input, {
        Prefix: function (value) {
            var node = new __XmlNode("Prefix").addChildNode(new __XmlText(value)).withName("Prefix");
            bodyNode.addChildNode(node);
        },
        Tag: function (value) {
            var node = serializeAws_restXmlTag(value, context).withName("Tag");
            bodyNode.addChildNode(node);
        },
        And: function (value) {
            var node = serializeAws_restXmlLifecycleRuleAndOperator(value, context).withName("And");
            bodyNode.addChildNode(node);
        },
        _: function (name, value) {
            if (!(value instanceof __XmlNode || value instanceof __XmlText)) {
                throw new Error("Unable to serialize unknown union members in XML.");
            }
            bodyNode.addChildNode(new __XmlNode(name).addChildNode(value));
        },
    });
    return bodyNode;
};
var serializeAws_restXmlLifecycleRules = function (input, context) {
    return input
        .filter(function (e) { return e != null; })
        .map(function (entry) {
        if (entry === null) {
            return null;
        }
        var node = serializeAws_restXmlLifecycleRule(entry, context);
        return node.withName("member");
    });
};
var serializeAws_restXmlLoggingEnabled = function (input, context) {
    var bodyNode = new __XmlNode("LoggingEnabled");
    if (input.TargetBucket !== undefined && input.TargetBucket !== null) {
        var node = new __XmlNode("TargetBucket").addChildNode(new __XmlText(input.TargetBucket)).withName("TargetBucket");
        bodyNode.addChildNode(node);
    }
    if (input.TargetGrants !== undefined && input.TargetGrants !== null) {
        var nodes = serializeAws_restXmlTargetGrants(input.TargetGrants, context);
        var containerNode_3 = new __XmlNode("TargetGrants");
        nodes.map(function (node) {
            containerNode_3.addChildNode(node);
        });
        bodyNode.addChildNode(containerNode_3);
    }
    if (input.TargetPrefix !== undefined && input.TargetPrefix !== null) {
        var node = new __XmlNode("TargetPrefix").addChildNode(new __XmlText(input.TargetPrefix)).withName("TargetPrefix");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
var serializeAws_restXmlMetadataEntry = function (input, context) {
    var bodyNode = new __XmlNode("MetadataEntry");
    if (input.Name !== undefined && input.Name !== null) {
        var node = new __XmlNode("MetadataKey").addChildNode(new __XmlText(input.Name)).withName("Name");
        bodyNode.addChildNode(node);
    }
    if (input.Value !== undefined && input.Value !== null) {
        var node = new __XmlNode("MetadataValue").addChildNode(new __XmlText(input.Value)).withName("Value");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
var serializeAws_restXmlMetrics = function (input, context) {
    var bodyNode = new __XmlNode("Metrics");
    if (input.Status !== undefined && input.Status !== null) {
        var node = new __XmlNode("MetricsStatus").addChildNode(new __XmlText(input.Status)).withName("Status");
        bodyNode.addChildNode(node);
    }
    if (input.EventThreshold !== undefined && input.EventThreshold !== null) {
        var node = serializeAws_restXmlReplicationTimeValue(input.EventThreshold, context).withName("EventThreshold");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
var serializeAws_restXmlMetricsAndOperator = function (input, context) {
    var bodyNode = new __XmlNode("MetricsAndOperator");
    if (input.Prefix !== undefined && input.Prefix !== null) {
        var node = new __XmlNode("Prefix").addChildNode(new __XmlText(input.Prefix)).withName("Prefix");
        bodyNode.addChildNode(node);
    }
    if (input.Tags !== undefined && input.Tags !== null) {
        var nodes = serializeAws_restXmlTagSet(input.Tags, context);
        nodes.map(function (node) {
            node = node.withName("Tag");
            bodyNode.addChildNode(node);
        });
    }
    return bodyNode;
};
var serializeAws_restXmlMetricsConfiguration = function (input, context) {
    var bodyNode = new __XmlNode("MetricsConfiguration");
    if (input.Id !== undefined && input.Id !== null) {
        var node = new __XmlNode("MetricsId").addChildNode(new __XmlText(input.Id)).withName("Id");
        bodyNode.addChildNode(node);
    }
    if (input.Filter !== undefined && input.Filter !== null) {
        var node = serializeAws_restXmlMetricsFilter(input.Filter, context).withName("Filter");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
var serializeAws_restXmlMetricsFilter = function (input, context) {
    var bodyNode = new __XmlNode("MetricsFilter");
    MetricsFilter.visit(input, {
        Prefix: function (value) {
            var node = new __XmlNode("Prefix").addChildNode(new __XmlText(value)).withName("Prefix");
            bodyNode.addChildNode(node);
        },
        Tag: function (value) {
            var node = serializeAws_restXmlTag(value, context).withName("Tag");
            bodyNode.addChildNode(node);
        },
        And: function (value) {
            var node = serializeAws_restXmlMetricsAndOperator(value, context).withName("And");
            bodyNode.addChildNode(node);
        },
        _: function (name, value) {
            if (!(value instanceof __XmlNode || value instanceof __XmlText)) {
                throw new Error("Unable to serialize unknown union members in XML.");
            }
            bodyNode.addChildNode(new __XmlNode(name).addChildNode(value));
        },
    });
    return bodyNode;
};
var serializeAws_restXmlNoncurrentVersionExpiration = function (input, context) {
    var bodyNode = new __XmlNode("NoncurrentVersionExpiration");
    if (input.NoncurrentDays !== undefined && input.NoncurrentDays !== null) {
        var node = new __XmlNode("Days")
            .addChildNode(new __XmlText(String(input.NoncurrentDays)))
            .withName("NoncurrentDays");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
var serializeAws_restXmlNoncurrentVersionTransition = function (input, context) {
    var bodyNode = new __XmlNode("NoncurrentVersionTransition");
    if (input.NoncurrentDays !== undefined && input.NoncurrentDays !== null) {
        var node = new __XmlNode("Days")
            .addChildNode(new __XmlText(String(input.NoncurrentDays)))
            .withName("NoncurrentDays");
        bodyNode.addChildNode(node);
    }
    if (input.StorageClass !== undefined && input.StorageClass !== null) {
        var node = new __XmlNode("TransitionStorageClass")
            .addChildNode(new __XmlText(input.StorageClass))
            .withName("StorageClass");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
var serializeAws_restXmlNoncurrentVersionTransitionList = function (input, context) {
    return input
        .filter(function (e) { return e != null; })
        .map(function (entry) {
        if (entry === null) {
            return null;
        }
        var node = serializeAws_restXmlNoncurrentVersionTransition(entry, context);
        return node.withName("member");
    });
};
var serializeAws_restXmlNotificationConfiguration = function (input, context) {
    var bodyNode = new __XmlNode("NotificationConfiguration");
    if (input.TopicConfigurations !== undefined && input.TopicConfigurations !== null) {
        var nodes = serializeAws_restXmlTopicConfigurationList(input.TopicConfigurations, context);
        nodes.map(function (node) {
            node = node.withName("TopicConfiguration");
            bodyNode.addChildNode(node);
        });
    }
    if (input.QueueConfigurations !== undefined && input.QueueConfigurations !== null) {
        var nodes = serializeAws_restXmlQueueConfigurationList(input.QueueConfigurations, context);
        nodes.map(function (node) {
            node = node.withName("QueueConfiguration");
            bodyNode.addChildNode(node);
        });
    }
    if (input.LambdaFunctionConfigurations !== undefined && input.LambdaFunctionConfigurations !== null) {
        var nodes = serializeAws_restXmlLambdaFunctionConfigurationList(input.LambdaFunctionConfigurations, context);
        nodes.map(function (node) {
            node = node.withName("CloudFunctionConfiguration");
            bodyNode.addChildNode(node);
        });
    }
    return bodyNode;
};
var serializeAws_restXmlNotificationConfigurationFilter = function (input, context) {
    var bodyNode = new __XmlNode("NotificationConfigurationFilter");
    if (input.Key !== undefined && input.Key !== null) {
        var node = serializeAws_restXmlS3KeyFilter(input.Key, context).withName("S3Key");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
var serializeAws_restXmlObjectIdentifier = function (input, context) {
    var bodyNode = new __XmlNode("ObjectIdentifier");
    if (input.Key !== undefined && input.Key !== null) {
        var node = new __XmlNode("ObjectKey").addChildNode(new __XmlText(input.Key)).withName("Key");
        bodyNode.addChildNode(node);
    }
    if (input.VersionId !== undefined && input.VersionId !== null) {
        var node = new __XmlNode("ObjectVersionId").addChildNode(new __XmlText(input.VersionId)).withName("VersionId");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
var serializeAws_restXmlObjectIdentifierList = function (input, context) {
    return input
        .filter(function (e) { return e != null; })
        .map(function (entry) {
        if (entry === null) {
            return null;
        }
        var node = serializeAws_restXmlObjectIdentifier(entry, context);
        return node.withName("member");
    });
};
var serializeAws_restXmlObjectLockConfiguration = function (input, context) {
    var bodyNode = new __XmlNode("ObjectLockConfiguration");
    if (input.ObjectLockEnabled !== undefined && input.ObjectLockEnabled !== null) {
        var node = new __XmlNode("ObjectLockEnabled")
            .addChildNode(new __XmlText(input.ObjectLockEnabled))
            .withName("ObjectLockEnabled");
        bodyNode.addChildNode(node);
    }
    if (input.Rule !== undefined && input.Rule !== null) {
        var node = serializeAws_restXmlObjectLockRule(input.Rule, context).withName("Rule");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
var serializeAws_restXmlObjectLockLegalHold = function (input, context) {
    var bodyNode = new __XmlNode("ObjectLockLegalHold");
    if (input.Status !== undefined && input.Status !== null) {
        var node = new __XmlNode("ObjectLockLegalHoldStatus")
            .addChildNode(new __XmlText(input.Status))
            .withName("Status");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
var serializeAws_restXmlObjectLockRetention = function (input, context) {
    var bodyNode = new __XmlNode("ObjectLockRetention");
    if (input.Mode !== undefined && input.Mode !== null) {
        var node = new __XmlNode("ObjectLockRetentionMode").addChildNode(new __XmlText(input.Mode)).withName("Mode");
        bodyNode.addChildNode(node);
    }
    if (input.RetainUntilDate !== undefined && input.RetainUntilDate !== null) {
        var node = new __XmlNode("Date")
            .addChildNode(new __XmlText(input.RetainUntilDate.toISOString().split(".")[0] + "Z"))
            .withName("RetainUntilDate");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
var serializeAws_restXmlObjectLockRule = function (input, context) {
    var bodyNode = new __XmlNode("ObjectLockRule");
    if (input.DefaultRetention !== undefined && input.DefaultRetention !== null) {
        var node = serializeAws_restXmlDefaultRetention(input.DefaultRetention, context).withName("DefaultRetention");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
var serializeAws_restXmlOutputLocation = function (input, context) {
    var bodyNode = new __XmlNode("OutputLocation");
    if (input.S3 !== undefined && input.S3 !== null) {
        var node = serializeAws_restXmlS3Location(input.S3, context).withName("S3");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
var serializeAws_restXmlOutputSerialization = function (input, context) {
    var bodyNode = new __XmlNode("OutputSerialization");
    if (input.CSV !== undefined && input.CSV !== null) {
        var node = serializeAws_restXmlCSVOutput(input.CSV, context).withName("CSV");
        bodyNode.addChildNode(node);
    }
    if (input.JSON !== undefined && input.JSON !== null) {
        var node = serializeAws_restXmlJSONOutput(input.JSON, context).withName("JSON");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
var serializeAws_restXmlOwner = function (input, context) {
    var bodyNode = new __XmlNode("Owner");
    if (input.DisplayName !== undefined && input.DisplayName !== null) {
        var node = new __XmlNode("DisplayName").addChildNode(new __XmlText(input.DisplayName)).withName("DisplayName");
        bodyNode.addChildNode(node);
    }
    if (input.ID !== undefined && input.ID !== null) {
        var node = new __XmlNode("ID").addChildNode(new __XmlText(input.ID)).withName("ID");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
var serializeAws_restXmlOwnershipControls = function (input, context) {
    var bodyNode = new __XmlNode("OwnershipControls");
    if (input.Rules !== undefined && input.Rules !== null) {
        var nodes = serializeAws_restXmlOwnershipControlsRules(input.Rules, context);
        nodes.map(function (node) {
            node = node.withName("Rule");
            bodyNode.addChildNode(node);
        });
    }
    return bodyNode;
};
var serializeAws_restXmlOwnershipControlsRule = function (input, context) {
    var bodyNode = new __XmlNode("OwnershipControlsRule");
    if (input.ObjectOwnership !== undefined && input.ObjectOwnership !== null) {
        var node = new __XmlNode("ObjectOwnership")
            .addChildNode(new __XmlText(input.ObjectOwnership))
            .withName("ObjectOwnership");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
var serializeAws_restXmlOwnershipControlsRules = function (input, context) {
    return input
        .filter(function (e) { return e != null; })
        .map(function (entry) {
        if (entry === null) {
            return null;
        }
        var node = serializeAws_restXmlOwnershipControlsRule(entry, context);
        return node.withName("member");
    });
};
var serializeAws_restXmlParquetInput = function (input, context) {
    var bodyNode = new __XmlNode("ParquetInput");
    return bodyNode;
};
var serializeAws_restXmlPublicAccessBlockConfiguration = function (input, context) {
    var bodyNode = new __XmlNode("PublicAccessBlockConfiguration");
    if (input.BlockPublicAcls !== undefined && input.BlockPublicAcls !== null) {
        var node = new __XmlNode("Setting")
            .addChildNode(new __XmlText(String(input.BlockPublicAcls)))
            .withName("BlockPublicAcls");
        bodyNode.addChildNode(node);
    }
    if (input.IgnorePublicAcls !== undefined && input.IgnorePublicAcls !== null) {
        var node = new __XmlNode("Setting")
            .addChildNode(new __XmlText(String(input.IgnorePublicAcls)))
            .withName("IgnorePublicAcls");
        bodyNode.addChildNode(node);
    }
    if (input.BlockPublicPolicy !== undefined && input.BlockPublicPolicy !== null) {
        var node = new __XmlNode("Setting")
            .addChildNode(new __XmlText(String(input.BlockPublicPolicy)))
            .withName("BlockPublicPolicy");
        bodyNode.addChildNode(node);
    }
    if (input.RestrictPublicBuckets !== undefined && input.RestrictPublicBuckets !== null) {
        var node = new __XmlNode("Setting")
            .addChildNode(new __XmlText(String(input.RestrictPublicBuckets)))
            .withName("RestrictPublicBuckets");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
var serializeAws_restXmlQueueConfiguration = function (input, context) {
    var bodyNode = new __XmlNode("QueueConfiguration");
    if (input.Id !== undefined && input.Id !== null) {
        var node = new __XmlNode("NotificationId").addChildNode(new __XmlText(input.Id)).withName("Id");
        bodyNode.addChildNode(node);
    }
    if (input.QueueArn !== undefined && input.QueueArn !== null) {
        var node = new __XmlNode("QueueArn").addChildNode(new __XmlText(input.QueueArn)).withName("Queue");
        bodyNode.addChildNode(node);
    }
    if (input.Events !== undefined && input.Events !== null) {
        var nodes = serializeAws_restXmlEventList(input.Events, context);
        nodes.map(function (node) {
            node = node.withName("Event");
            bodyNode.addChildNode(node);
        });
    }
    if (input.Filter !== undefined && input.Filter !== null) {
        var node = serializeAws_restXmlNotificationConfigurationFilter(input.Filter, context).withName("Filter");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
var serializeAws_restXmlQueueConfigurationList = function (input, context) {
    return input
        .filter(function (e) { return e != null; })
        .map(function (entry) {
        if (entry === null) {
            return null;
        }
        var node = serializeAws_restXmlQueueConfiguration(entry, context);
        return node.withName("member");
    });
};
var serializeAws_restXmlRedirect = function (input, context) {
    var bodyNode = new __XmlNode("Redirect");
    if (input.HostName !== undefined && input.HostName !== null) {
        var node = new __XmlNode("HostName").addChildNode(new __XmlText(input.HostName)).withName("HostName");
        bodyNode.addChildNode(node);
    }
    if (input.HttpRedirectCode !== undefined && input.HttpRedirectCode !== null) {
        var node = new __XmlNode("HttpRedirectCode")
            .addChildNode(new __XmlText(input.HttpRedirectCode))
            .withName("HttpRedirectCode");
        bodyNode.addChildNode(node);
    }
    if (input.Protocol !== undefined && input.Protocol !== null) {
        var node = new __XmlNode("Protocol").addChildNode(new __XmlText(input.Protocol)).withName("Protocol");
        bodyNode.addChildNode(node);
    }
    if (input.ReplaceKeyPrefixWith !== undefined && input.ReplaceKeyPrefixWith !== null) {
        var node = new __XmlNode("ReplaceKeyPrefixWith")
            .addChildNode(new __XmlText(input.ReplaceKeyPrefixWith))
            .withName("ReplaceKeyPrefixWith");
        bodyNode.addChildNode(node);
    }
    if (input.ReplaceKeyWith !== undefined && input.ReplaceKeyWith !== null) {
        var node = new __XmlNode("ReplaceKeyWith")
            .addChildNode(new __XmlText(input.ReplaceKeyWith))
            .withName("ReplaceKeyWith");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
var serializeAws_restXmlRedirectAllRequestsTo = function (input, context) {
    var bodyNode = new __XmlNode("RedirectAllRequestsTo");
    if (input.HostName !== undefined && input.HostName !== null) {
        var node = new __XmlNode("HostName").addChildNode(new __XmlText(input.HostName)).withName("HostName");
        bodyNode.addChildNode(node);
    }
    if (input.Protocol !== undefined && input.Protocol !== null) {
        var node = new __XmlNode("Protocol").addChildNode(new __XmlText(input.Protocol)).withName("Protocol");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
var serializeAws_restXmlReplicaModifications = function (input, context) {
    var bodyNode = new __XmlNode("ReplicaModifications");
    if (input.Status !== undefined && input.Status !== null) {
        var node = new __XmlNode("ReplicaModificationsStatus")
            .addChildNode(new __XmlText(input.Status))
            .withName("Status");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
var serializeAws_restXmlReplicationConfiguration = function (input, context) {
    var bodyNode = new __XmlNode("ReplicationConfiguration");
    if (input.Role !== undefined && input.Role !== null) {
        var node = new __XmlNode("Role").addChildNode(new __XmlText(input.Role)).withName("Role");
        bodyNode.addChildNode(node);
    }
    if (input.Rules !== undefined && input.Rules !== null) {
        var nodes = serializeAws_restXmlReplicationRules(input.Rules, context);
        nodes.map(function (node) {
            node = node.withName("Rule");
            bodyNode.addChildNode(node);
        });
    }
    return bodyNode;
};
var serializeAws_restXmlReplicationRule = function (input, context) {
    var bodyNode = new __XmlNode("ReplicationRule");
    if (input.ID !== undefined && input.ID !== null) {
        var node = new __XmlNode("ID").addChildNode(new __XmlText(input.ID)).withName("ID");
        bodyNode.addChildNode(node);
    }
    if (input.Priority !== undefined && input.Priority !== null) {
        var node = new __XmlNode("Priority").addChildNode(new __XmlText(String(input.Priority))).withName("Priority");
        bodyNode.addChildNode(node);
    }
    if (input.Prefix !== undefined && input.Prefix !== null) {
        var node = new __XmlNode("Prefix").addChildNode(new __XmlText(input.Prefix)).withName("Prefix");
        bodyNode.addChildNode(node);
    }
    if (input.Filter !== undefined && input.Filter !== null) {
        var node = serializeAws_restXmlReplicationRuleFilter(input.Filter, context).withName("Filter");
        bodyNode.addChildNode(node);
    }
    if (input.Status !== undefined && input.Status !== null) {
        var node = new __XmlNode("ReplicationRuleStatus").addChildNode(new __XmlText(input.Status)).withName("Status");
        bodyNode.addChildNode(node);
    }
    if (input.SourceSelectionCriteria !== undefined && input.SourceSelectionCriteria !== null) {
        var node = serializeAws_restXmlSourceSelectionCriteria(input.SourceSelectionCriteria, context).withName("SourceSelectionCriteria");
        bodyNode.addChildNode(node);
    }
    if (input.ExistingObjectReplication !== undefined && input.ExistingObjectReplication !== null) {
        var node = serializeAws_restXmlExistingObjectReplication(input.ExistingObjectReplication, context).withName("ExistingObjectReplication");
        bodyNode.addChildNode(node);
    }
    if (input.Destination !== undefined && input.Destination !== null) {
        var node = serializeAws_restXmlDestination(input.Destination, context).withName("Destination");
        bodyNode.addChildNode(node);
    }
    if (input.DeleteMarkerReplication !== undefined && input.DeleteMarkerReplication !== null) {
        var node = serializeAws_restXmlDeleteMarkerReplication(input.DeleteMarkerReplication, context).withName("DeleteMarkerReplication");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
var serializeAws_restXmlReplicationRuleAndOperator = function (input, context) {
    var bodyNode = new __XmlNode("ReplicationRuleAndOperator");
    if (input.Prefix !== undefined && input.Prefix !== null) {
        var node = new __XmlNode("Prefix").addChildNode(new __XmlText(input.Prefix)).withName("Prefix");
        bodyNode.addChildNode(node);
    }
    if (input.Tags !== undefined && input.Tags !== null) {
        var nodes = serializeAws_restXmlTagSet(input.Tags, context);
        nodes.map(function (node) {
            node = node.withName("Tag");
            bodyNode.addChildNode(node);
        });
    }
    return bodyNode;
};
var serializeAws_restXmlReplicationRuleFilter = function (input, context) {
    var bodyNode = new __XmlNode("ReplicationRuleFilter");
    ReplicationRuleFilter.visit(input, {
        Prefix: function (value) {
            var node = new __XmlNode("Prefix").addChildNode(new __XmlText(value)).withName("Prefix");
            bodyNode.addChildNode(node);
        },
        Tag: function (value) {
            var node = serializeAws_restXmlTag(value, context).withName("Tag");
            bodyNode.addChildNode(node);
        },
        And: function (value) {
            var node = serializeAws_restXmlReplicationRuleAndOperator(value, context).withName("And");
            bodyNode.addChildNode(node);
        },
        _: function (name, value) {
            if (!(value instanceof __XmlNode || value instanceof __XmlText)) {
                throw new Error("Unable to serialize unknown union members in XML.");
            }
            bodyNode.addChildNode(new __XmlNode(name).addChildNode(value));
        },
    });
    return bodyNode;
};
var serializeAws_restXmlReplicationRules = function (input, context) {
    return input
        .filter(function (e) { return e != null; })
        .map(function (entry) {
        if (entry === null) {
            return null;
        }
        var node = serializeAws_restXmlReplicationRule(entry, context);
        return node.withName("member");
    });
};
var serializeAws_restXmlReplicationTime = function (input, context) {
    var bodyNode = new __XmlNode("ReplicationTime");
    if (input.Status !== undefined && input.Status !== null) {
        var node = new __XmlNode("ReplicationTimeStatus").addChildNode(new __XmlText(input.Status)).withName("Status");
        bodyNode.addChildNode(node);
    }
    if (input.Time !== undefined && input.Time !== null) {
        var node = serializeAws_restXmlReplicationTimeValue(input.Time, context).withName("Time");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
var serializeAws_restXmlReplicationTimeValue = function (input, context) {
    var bodyNode = new __XmlNode("ReplicationTimeValue");
    if (input.Minutes !== undefined && input.Minutes !== null) {
        var node = new __XmlNode("Minutes").addChildNode(new __XmlText(String(input.Minutes))).withName("Minutes");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
var serializeAws_restXmlRequestPaymentConfiguration = function (input, context) {
    var bodyNode = new __XmlNode("RequestPaymentConfiguration");
    if (input.Payer !== undefined && input.Payer !== null) {
        var node = new __XmlNode("Payer").addChildNode(new __XmlText(input.Payer)).withName("Payer");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
var serializeAws_restXmlRequestProgress = function (input, context) {
    var bodyNode = new __XmlNode("RequestProgress");
    if (input.Enabled !== undefined && input.Enabled !== null) {
        var node = new __XmlNode("EnableRequestProgress")
            .addChildNode(new __XmlText(String(input.Enabled)))
            .withName("Enabled");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
var serializeAws_restXmlRestoreRequest = function (input, context) {
    var bodyNode = new __XmlNode("RestoreRequest");
    if (input.Days !== undefined && input.Days !== null) {
        var node = new __XmlNode("Days").addChildNode(new __XmlText(String(input.Days))).withName("Days");
        bodyNode.addChildNode(node);
    }
    if (input.GlacierJobParameters !== undefined && input.GlacierJobParameters !== null) {
        var node = serializeAws_restXmlGlacierJobParameters(input.GlacierJobParameters, context).withName("GlacierJobParameters");
        bodyNode.addChildNode(node);
    }
    if (input.Type !== undefined && input.Type !== null) {
        var node = new __XmlNode("RestoreRequestType").addChildNode(new __XmlText(input.Type)).withName("Type");
        bodyNode.addChildNode(node);
    }
    if (input.Tier !== undefined && input.Tier !== null) {
        var node = new __XmlNode("Tier").addChildNode(new __XmlText(input.Tier)).withName("Tier");
        bodyNode.addChildNode(node);
    }
    if (input.Description !== undefined && input.Description !== null) {
        var node = new __XmlNode("Description").addChildNode(new __XmlText(input.Description)).withName("Description");
        bodyNode.addChildNode(node);
    }
    if (input.SelectParameters !== undefined && input.SelectParameters !== null) {
        var node = serializeAws_restXmlSelectParameters(input.SelectParameters, context).withName("SelectParameters");
        bodyNode.addChildNode(node);
    }
    if (input.OutputLocation !== undefined && input.OutputLocation !== null) {
        var node = serializeAws_restXmlOutputLocation(input.OutputLocation, context).withName("OutputLocation");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
var serializeAws_restXmlRoutingRule = function (input, context) {
    var bodyNode = new __XmlNode("RoutingRule");
    if (input.Condition !== undefined && input.Condition !== null) {
        var node = serializeAws_restXmlCondition(input.Condition, context).withName("Condition");
        bodyNode.addChildNode(node);
    }
    if (input.Redirect !== undefined && input.Redirect !== null) {
        var node = serializeAws_restXmlRedirect(input.Redirect, context).withName("Redirect");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
var serializeAws_restXmlRoutingRules = function (input, context) {
    return input
        .filter(function (e) { return e != null; })
        .map(function (entry) {
        if (entry === null) {
            return null;
        }
        var node = serializeAws_restXmlRoutingRule(entry, context);
        return node.withName("RoutingRule");
    });
};
var serializeAws_restXmlS3KeyFilter = function (input, context) {
    var bodyNode = new __XmlNode("S3KeyFilter");
    if (input.FilterRules !== undefined && input.FilterRules !== null) {
        var nodes = serializeAws_restXmlFilterRuleList(input.FilterRules, context);
        nodes.map(function (node) {
            node = node.withName("FilterRule");
            bodyNode.addChildNode(node);
        });
    }
    return bodyNode;
};
var serializeAws_restXmlS3Location = function (input, context) {
    var bodyNode = new __XmlNode("S3Location");
    if (input.BucketName !== undefined && input.BucketName !== null) {
        var node = new __XmlNode("BucketName").addChildNode(new __XmlText(input.BucketName)).withName("BucketName");
        bodyNode.addChildNode(node);
    }
    if (input.Prefix !== undefined && input.Prefix !== null) {
        var node = new __XmlNode("LocationPrefix").addChildNode(new __XmlText(input.Prefix)).withName("Prefix");
        bodyNode.addChildNode(node);
    }
    if (input.Encryption !== undefined && input.Encryption !== null) {
        var node = serializeAws_restXmlEncryption(input.Encryption, context).withName("Encryption");
        bodyNode.addChildNode(node);
    }
    if (input.CannedACL !== undefined && input.CannedACL !== null) {
        var node = new __XmlNode("ObjectCannedACL").addChildNode(new __XmlText(input.CannedACL)).withName("CannedACL");
        bodyNode.addChildNode(node);
    }
    if (input.AccessControlList !== undefined && input.AccessControlList !== null) {
        var nodes = serializeAws_restXmlGrants(input.AccessControlList, context);
        var containerNode_4 = new __XmlNode("AccessControlList");
        nodes.map(function (node) {
            containerNode_4.addChildNode(node);
        });
        bodyNode.addChildNode(containerNode_4);
    }
    if (input.Tagging !== undefined && input.Tagging !== null) {
        var node = serializeAws_restXmlTagging(input.Tagging, context).withName("Tagging");
        bodyNode.addChildNode(node);
    }
    if (input.UserMetadata !== undefined && input.UserMetadata !== null) {
        var nodes = serializeAws_restXmlUserMetadata(input.UserMetadata, context);
        var containerNode_5 = new __XmlNode("UserMetadata");
        nodes.map(function (node) {
            containerNode_5.addChildNode(node);
        });
        bodyNode.addChildNode(containerNode_5);
    }
    if (input.StorageClass !== undefined && input.StorageClass !== null) {
        var node = new __XmlNode("StorageClass").addChildNode(new __XmlText(input.StorageClass)).withName("StorageClass");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
var serializeAws_restXmlScanRange = function (input, context) {
    var bodyNode = new __XmlNode("ScanRange");
    if (input.Start !== undefined && input.Start !== null) {
        var node = new __XmlNode("Start").addChildNode(new __XmlText(String(input.Start))).withName("Start");
        bodyNode.addChildNode(node);
    }
    if (input.End !== undefined && input.End !== null) {
        var node = new __XmlNode("End").addChildNode(new __XmlText(String(input.End))).withName("End");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
var serializeAws_restXmlSelectParameters = function (input, context) {
    var bodyNode = new __XmlNode("SelectParameters");
    if (input.InputSerialization !== undefined && input.InputSerialization !== null) {
        var node = serializeAws_restXmlInputSerialization(input.InputSerialization, context).withName("InputSerialization");
        bodyNode.addChildNode(node);
    }
    if (input.ExpressionType !== undefined && input.ExpressionType !== null) {
        var node = new __XmlNode("ExpressionType")
            .addChildNode(new __XmlText(input.ExpressionType))
            .withName("ExpressionType");
        bodyNode.addChildNode(node);
    }
    if (input.Expression !== undefined && input.Expression !== null) {
        var node = new __XmlNode("Expression").addChildNode(new __XmlText(input.Expression)).withName("Expression");
        bodyNode.addChildNode(node);
    }
    if (input.OutputSerialization !== undefined && input.OutputSerialization !== null) {
        var node = serializeAws_restXmlOutputSerialization(input.OutputSerialization, context).withName("OutputSerialization");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
var serializeAws_restXmlServerSideEncryptionByDefault = function (input, context) {
    var bodyNode = new __XmlNode("ServerSideEncryptionByDefault");
    if (input.SSEAlgorithm !== undefined && input.SSEAlgorithm !== null) {
        var node = new __XmlNode("ServerSideEncryption")
            .addChildNode(new __XmlText(input.SSEAlgorithm))
            .withName("SSEAlgorithm");
        bodyNode.addChildNode(node);
    }
    if (input.KMSMasterKeyID !== undefined && input.KMSMasterKeyID !== null) {
        var node = new __XmlNode("SSEKMSKeyId")
            .addChildNode(new __XmlText(input.KMSMasterKeyID))
            .withName("KMSMasterKeyID");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
var serializeAws_restXmlServerSideEncryptionConfiguration = function (input, context) {
    var bodyNode = new __XmlNode("ServerSideEncryptionConfiguration");
    if (input.Rules !== undefined && input.Rules !== null) {
        var nodes = serializeAws_restXmlServerSideEncryptionRules(input.Rules, context);
        nodes.map(function (node) {
            node = node.withName("Rule");
            bodyNode.addChildNode(node);
        });
    }
    return bodyNode;
};
var serializeAws_restXmlServerSideEncryptionRule = function (input, context) {
    var bodyNode = new __XmlNode("ServerSideEncryptionRule");
    if (input.ApplyServerSideEncryptionByDefault !== undefined && input.ApplyServerSideEncryptionByDefault !== null) {
        var node = serializeAws_restXmlServerSideEncryptionByDefault(input.ApplyServerSideEncryptionByDefault, context).withName("ApplyServerSideEncryptionByDefault");
        bodyNode.addChildNode(node);
    }
    if (input.BucketKeyEnabled !== undefined && input.BucketKeyEnabled !== null) {
        var node = new __XmlNode("BucketKeyEnabled")
            .addChildNode(new __XmlText(String(input.BucketKeyEnabled)))
            .withName("BucketKeyEnabled");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
var serializeAws_restXmlServerSideEncryptionRules = function (input, context) {
    return input
        .filter(function (e) { return e != null; })
        .map(function (entry) {
        if (entry === null) {
            return null;
        }
        var node = serializeAws_restXmlServerSideEncryptionRule(entry, context);
        return node.withName("member");
    });
};
var serializeAws_restXmlSourceSelectionCriteria = function (input, context) {
    var bodyNode = new __XmlNode("SourceSelectionCriteria");
    if (input.SseKmsEncryptedObjects !== undefined && input.SseKmsEncryptedObjects !== null) {
        var node = serializeAws_restXmlSseKmsEncryptedObjects(input.SseKmsEncryptedObjects, context).withName("SseKmsEncryptedObjects");
        bodyNode.addChildNode(node);
    }
    if (input.ReplicaModifications !== undefined && input.ReplicaModifications !== null) {
        var node = serializeAws_restXmlReplicaModifications(input.ReplicaModifications, context).withName("ReplicaModifications");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
var serializeAws_restXmlSSEKMS = function (input, context) {
    var bodyNode = new __XmlNode("SSE-KMS");
    if (input.KeyId !== undefined && input.KeyId !== null) {
        var node = new __XmlNode("SSEKMSKeyId").addChildNode(new __XmlText(input.KeyId)).withName("KeyId");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
var serializeAws_restXmlSseKmsEncryptedObjects = function (input, context) {
    var bodyNode = new __XmlNode("SseKmsEncryptedObjects");
    if (input.Status !== undefined && input.Status !== null) {
        var node = new __XmlNode("SseKmsEncryptedObjectsStatus")
            .addChildNode(new __XmlText(input.Status))
            .withName("Status");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
var serializeAws_restXmlSSES3 = function (input, context) {
    var bodyNode = new __XmlNode("SSE-S3");
    return bodyNode;
};
var serializeAws_restXmlStorageClassAnalysis = function (input, context) {
    var bodyNode = new __XmlNode("StorageClassAnalysis");
    if (input.DataExport !== undefined && input.DataExport !== null) {
        var node = serializeAws_restXmlStorageClassAnalysisDataExport(input.DataExport, context).withName("DataExport");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
var serializeAws_restXmlStorageClassAnalysisDataExport = function (input, context) {
    var bodyNode = new __XmlNode("StorageClassAnalysisDataExport");
    if (input.OutputSchemaVersion !== undefined && input.OutputSchemaVersion !== null) {
        var node = new __XmlNode("StorageClassAnalysisSchemaVersion")
            .addChildNode(new __XmlText(input.OutputSchemaVersion))
            .withName("OutputSchemaVersion");
        bodyNode.addChildNode(node);
    }
    if (input.Destination !== undefined && input.Destination !== null) {
        var node = serializeAws_restXmlAnalyticsExportDestination(input.Destination, context).withName("Destination");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
var serializeAws_restXmlTag = function (input, context) {
    var bodyNode = new __XmlNode("Tag");
    if (input.Key !== undefined && input.Key !== null) {
        var node = new __XmlNode("ObjectKey").addChildNode(new __XmlText(input.Key)).withName("Key");
        bodyNode.addChildNode(node);
    }
    if (input.Value !== undefined && input.Value !== null) {
        var node = new __XmlNode("Value").addChildNode(new __XmlText(input.Value)).withName("Value");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
var serializeAws_restXmlTagging = function (input, context) {
    var bodyNode = new __XmlNode("Tagging");
    if (input.TagSet !== undefined && input.TagSet !== null) {
        var nodes = serializeAws_restXmlTagSet(input.TagSet, context);
        var containerNode_6 = new __XmlNode("TagSet");
        nodes.map(function (node) {
            containerNode_6.addChildNode(node);
        });
        bodyNode.addChildNode(containerNode_6);
    }
    return bodyNode;
};
var serializeAws_restXmlTagSet = function (input, context) {
    return input
        .filter(function (e) { return e != null; })
        .map(function (entry) {
        if (entry === null) {
            return null;
        }
        var node = serializeAws_restXmlTag(entry, context);
        return node.withName("Tag");
    });
};
var serializeAws_restXmlTargetGrant = function (input, context) {
    var bodyNode = new __XmlNode("TargetGrant");
    if (input.Grantee !== undefined && input.Grantee !== null) {
        var node = serializeAws_restXmlGrantee(input.Grantee, context).withName("Grantee");
        bodyNode.addChildNode(node);
    }
    if (input.Permission !== undefined && input.Permission !== null) {
        var node = new __XmlNode("BucketLogsPermission")
            .addChildNode(new __XmlText(input.Permission))
            .withName("Permission");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
var serializeAws_restXmlTargetGrants = function (input, context) {
    return input
        .filter(function (e) { return e != null; })
        .map(function (entry) {
        if (entry === null) {
            return null;
        }
        var node = serializeAws_restXmlTargetGrant(entry, context);
        return node.withName("Grant");
    });
};
var serializeAws_restXmlTiering = function (input, context) {
    var bodyNode = new __XmlNode("Tiering");
    if (input.Days !== undefined && input.Days !== null) {
        var node = new __XmlNode("IntelligentTieringDays")
            .addChildNode(new __XmlText(String(input.Days)))
            .withName("Days");
        bodyNode.addChildNode(node);
    }
    if (input.AccessTier !== undefined && input.AccessTier !== null) {
        var node = new __XmlNode("IntelligentTieringAccessTier")
            .addChildNode(new __XmlText(input.AccessTier))
            .withName("AccessTier");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
var serializeAws_restXmlTieringList = function (input, context) {
    return input
        .filter(function (e) { return e != null; })
        .map(function (entry) {
        if (entry === null) {
            return null;
        }
        var node = serializeAws_restXmlTiering(entry, context);
        return node.withName("member");
    });
};
var serializeAws_restXmlTopicConfiguration = function (input, context) {
    var bodyNode = new __XmlNode("TopicConfiguration");
    if (input.Id !== undefined && input.Id !== null) {
        var node = new __XmlNode("NotificationId").addChildNode(new __XmlText(input.Id)).withName("Id");
        bodyNode.addChildNode(node);
    }
    if (input.TopicArn !== undefined && input.TopicArn !== null) {
        var node = new __XmlNode("TopicArn").addChildNode(new __XmlText(input.TopicArn)).withName("Topic");
        bodyNode.addChildNode(node);
    }
    if (input.Events !== undefined && input.Events !== null) {
        var nodes = serializeAws_restXmlEventList(input.Events, context);
        nodes.map(function (node) {
            node = node.withName("Event");
            bodyNode.addChildNode(node);
        });
    }
    if (input.Filter !== undefined && input.Filter !== null) {
        var node = serializeAws_restXmlNotificationConfigurationFilter(input.Filter, context).withName("Filter");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
var serializeAws_restXmlTopicConfigurationList = function (input, context) {
    return input
        .filter(function (e) { return e != null; })
        .map(function (entry) {
        if (entry === null) {
            return null;
        }
        var node = serializeAws_restXmlTopicConfiguration(entry, context);
        return node.withName("member");
    });
};
var serializeAws_restXmlTransition = function (input, context) {
    var bodyNode = new __XmlNode("Transition");
    if (input.Date !== undefined && input.Date !== null) {
        var node = new __XmlNode("Date")
            .addChildNode(new __XmlText(input.Date.toISOString().split(".")[0] + "Z"))
            .withName("Date");
        bodyNode.addChildNode(node);
    }
    if (input.Days !== undefined && input.Days !== null) {
        var node = new __XmlNode("Days").addChildNode(new __XmlText(String(input.Days))).withName("Days");
        bodyNode.addChildNode(node);
    }
    if (input.StorageClass !== undefined && input.StorageClass !== null) {
        var node = new __XmlNode("TransitionStorageClass")
            .addChildNode(new __XmlText(input.StorageClass))
            .withName("StorageClass");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
var serializeAws_restXmlTransitionList = function (input, context) {
    return input
        .filter(function (e) { return e != null; })
        .map(function (entry) {
        if (entry === null) {
            return null;
        }
        var node = serializeAws_restXmlTransition(entry, context);
        return node.withName("member");
    });
};
var serializeAws_restXmlUserMetadata = function (input, context) {
    return input
        .filter(function (e) { return e != null; })
        .map(function (entry) {
        if (entry === null) {
            return null;
        }
        var node = serializeAws_restXmlMetadataEntry(entry, context);
        return node.withName("MetadataEntry");
    });
};
var serializeAws_restXmlVersioningConfiguration = function (input, context) {
    var bodyNode = new __XmlNode("VersioningConfiguration");
    if (input.MFADelete !== undefined && input.MFADelete !== null) {
        var node = new __XmlNode("MFADelete").addChildNode(new __XmlText(input.MFADelete)).withName("MfaDelete");
        bodyNode.addChildNode(node);
    }
    if (input.Status !== undefined && input.Status !== null) {
        var node = new __XmlNode("BucketVersioningStatus").addChildNode(new __XmlText(input.Status)).withName("Status");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
var serializeAws_restXmlWebsiteConfiguration = function (input, context) {
    var bodyNode = new __XmlNode("WebsiteConfiguration");
    if (input.ErrorDocument !== undefined && input.ErrorDocument !== null) {
        var node = serializeAws_restXmlErrorDocument(input.ErrorDocument, context).withName("ErrorDocument");
        bodyNode.addChildNode(node);
    }
    if (input.IndexDocument !== undefined && input.IndexDocument !== null) {
        var node = serializeAws_restXmlIndexDocument(input.IndexDocument, context).withName("IndexDocument");
        bodyNode.addChildNode(node);
    }
    if (input.RedirectAllRequestsTo !== undefined && input.RedirectAllRequestsTo !== null) {
        var node = serializeAws_restXmlRedirectAllRequestsTo(input.RedirectAllRequestsTo, context).withName("RedirectAllRequestsTo");
        bodyNode.addChildNode(node);
    }
    if (input.RoutingRules !== undefined && input.RoutingRules !== null) {
        var nodes = serializeAws_restXmlRoutingRules(input.RoutingRules, context);
        var containerNode_7 = new __XmlNode("RoutingRules");
        nodes.map(function (node) {
            containerNode_7.addChildNode(node);
        });
        bodyNode.addChildNode(containerNode_7);
    }
    return bodyNode;
};
var deserializeAws_restXmlAbortIncompleteMultipartUpload = function (output, context) {
    var contents = {
        DaysAfterInitiation: undefined,
    };
    if (output["DaysAfterInitiation"] !== undefined) {
        contents.DaysAfterInitiation = parseInt(output["DaysAfterInitiation"]);
    }
    return contents;
};
var deserializeAws_restXmlAccessControlTranslation = function (output, context) {
    var contents = {
        Owner: undefined,
    };
    if (output["Owner"] !== undefined) {
        contents.Owner = output["Owner"];
    }
    return contents;
};
var deserializeAws_restXmlAllowedHeaders = function (output, context) {
    return (output || [])
        .filter(function (e) { return e != null; })
        .map(function (entry) {
        if (entry === null) {
            return null;
        }
        return entry;
    });
};
var deserializeAws_restXmlAllowedMethods = function (output, context) {
    return (output || [])
        .filter(function (e) { return e != null; })
        .map(function (entry) {
        if (entry === null) {
            return null;
        }
        return entry;
    });
};
var deserializeAws_restXmlAllowedOrigins = function (output, context) {
    return (output || [])
        .filter(function (e) { return e != null; })
        .map(function (entry) {
        if (entry === null) {
            return null;
        }
        return entry;
    });
};
var deserializeAws_restXmlAnalyticsAndOperator = function (output, context) {
    var contents = {
        Prefix: undefined,
        Tags: undefined,
    };
    if (output["Prefix"] !== undefined) {
        contents.Prefix = output["Prefix"];
    }
    if (output.Tag === "") {
        contents.Tags = [];
    }
    if (output["Tag"] !== undefined) {
        contents.Tags = deserializeAws_restXmlTagSet(__getArrayIfSingleItem(output["Tag"]), context);
    }
    return contents;
};
var deserializeAws_restXmlAnalyticsConfiguration = function (output, context) {
    var contents = {
        Id: undefined,
        Filter: undefined,
        StorageClassAnalysis: undefined,
    };
    if (output["Id"] !== undefined) {
        contents.Id = output["Id"];
    }
    if (output["Filter"] !== undefined) {
        contents.Filter = deserializeAws_restXmlAnalyticsFilter(output["Filter"], context);
    }
    if (output["StorageClassAnalysis"] !== undefined) {
        contents.StorageClassAnalysis = deserializeAws_restXmlStorageClassAnalysis(output["StorageClassAnalysis"], context);
    }
    return contents;
};
var deserializeAws_restXmlAnalyticsConfigurationList = function (output, context) {
    return (output || [])
        .filter(function (e) { return e != null; })
        .map(function (entry) {
        if (entry === null) {
            return null;
        }
        return deserializeAws_restXmlAnalyticsConfiguration(entry, context);
    });
};
var deserializeAws_restXmlAnalyticsExportDestination = function (output, context) {
    var contents = {
        S3BucketDestination: undefined,
    };
    if (output["S3BucketDestination"] !== undefined) {
        contents.S3BucketDestination = deserializeAws_restXmlAnalyticsS3BucketDestination(output["S3BucketDestination"], context);
    }
    return contents;
};
var deserializeAws_restXmlAnalyticsFilter = function (output, context) {
    if (output["Prefix"] !== undefined) {
        return {
            Prefix: output["Prefix"],
        };
    }
    if (output["Tag"] !== undefined) {
        return {
            Tag: deserializeAws_restXmlTag(output["Tag"], context),
        };
    }
    if (output["And"] !== undefined) {
        return {
            And: deserializeAws_restXmlAnalyticsAndOperator(output["And"], context),
        };
    }
    return { $unknown: Object.entries(output)[0] };
};
var deserializeAws_restXmlAnalyticsS3BucketDestination = function (output, context) {
    var contents = {
        Format: undefined,
        BucketAccountId: undefined,
        Bucket: undefined,
        Prefix: undefined,
    };
    if (output["Format"] !== undefined) {
        contents.Format = output["Format"];
    }
    if (output["BucketAccountId"] !== undefined) {
        contents.BucketAccountId = output["BucketAccountId"];
    }
    if (output["Bucket"] !== undefined) {
        contents.Bucket = output["Bucket"];
    }
    if (output["Prefix"] !== undefined) {
        contents.Prefix = output["Prefix"];
    }
    return contents;
};
var deserializeAws_restXmlBucket = function (output, context) {
    var contents = {
        Name: undefined,
        CreationDate: undefined,
    };
    if (output["Name"] !== undefined) {
        contents.Name = output["Name"];
    }
    if (output["CreationDate"] !== undefined) {
        contents.CreationDate = new Date(output["CreationDate"]);
    }
    return contents;
};
var deserializeAws_restXmlBuckets = function (output, context) {
    return (output || [])
        .filter(function (e) { return e != null; })
        .map(function (entry) {
        if (entry === null) {
            return null;
        }
        return deserializeAws_restXmlBucket(entry, context);
    });
};
var deserializeAws_restXmlCommonPrefix = function (output, context) {
    var contents = {
        Prefix: undefined,
    };
    if (output["Prefix"] !== undefined) {
        contents.Prefix = output["Prefix"];
    }
    return contents;
};
var deserializeAws_restXmlCommonPrefixList = function (output, context) {
    return (output || [])
        .filter(function (e) { return e != null; })
        .map(function (entry) {
        if (entry === null) {
            return null;
        }
        return deserializeAws_restXmlCommonPrefix(entry, context);
    });
};
var deserializeAws_restXmlCondition = function (output, context) {
    var contents = {
        HttpErrorCodeReturnedEquals: undefined,
        KeyPrefixEquals: undefined,
    };
    if (output["HttpErrorCodeReturnedEquals"] !== undefined) {
        contents.HttpErrorCodeReturnedEquals = output["HttpErrorCodeReturnedEquals"];
    }
    if (output["KeyPrefixEquals"] !== undefined) {
        contents.KeyPrefixEquals = output["KeyPrefixEquals"];
    }
    return contents;
};
var deserializeAws_restXmlCopyObjectResult = function (output, context) {
    var contents = {
        ETag: undefined,
        LastModified: undefined,
    };
    if (output["ETag"] !== undefined) {
        contents.ETag = output["ETag"];
    }
    if (output["LastModified"] !== undefined) {
        contents.LastModified = new Date(output["LastModified"]);
    }
    return contents;
};
var deserializeAws_restXmlCopyPartResult = function (output, context) {
    var contents = {
        ETag: undefined,
        LastModified: undefined,
    };
    if (output["ETag"] !== undefined) {
        contents.ETag = output["ETag"];
    }
    if (output["LastModified"] !== undefined) {
        contents.LastModified = new Date(output["LastModified"]);
    }
    return contents;
};
var deserializeAws_restXmlCORSRule = function (output, context) {
    var contents = {
        AllowedHeaders: undefined,
        AllowedMethods: undefined,
        AllowedOrigins: undefined,
        ExposeHeaders: undefined,
        MaxAgeSeconds: undefined,
    };
    if (output.AllowedHeader === "") {
        contents.AllowedHeaders = [];
    }
    if (output["AllowedHeader"] !== undefined) {
        contents.AllowedHeaders = deserializeAws_restXmlAllowedHeaders(__getArrayIfSingleItem(output["AllowedHeader"]), context);
    }
    if (output.AllowedMethod === "") {
        contents.AllowedMethods = [];
    }
    if (output["AllowedMethod"] !== undefined) {
        contents.AllowedMethods = deserializeAws_restXmlAllowedMethods(__getArrayIfSingleItem(output["AllowedMethod"]), context);
    }
    if (output.AllowedOrigin === "") {
        contents.AllowedOrigins = [];
    }
    if (output["AllowedOrigin"] !== undefined) {
        contents.AllowedOrigins = deserializeAws_restXmlAllowedOrigins(__getArrayIfSingleItem(output["AllowedOrigin"]), context);
    }
    if (output.ExposeHeader === "") {
        contents.ExposeHeaders = [];
    }
    if (output["ExposeHeader"] !== undefined) {
        contents.ExposeHeaders = deserializeAws_restXmlExposeHeaders(__getArrayIfSingleItem(output["ExposeHeader"]), context);
    }
    if (output["MaxAgeSeconds"] !== undefined) {
        contents.MaxAgeSeconds = parseInt(output["MaxAgeSeconds"]);
    }
    return contents;
};
var deserializeAws_restXmlCORSRules = function (output, context) {
    return (output || [])
        .filter(function (e) { return e != null; })
        .map(function (entry) {
        if (entry === null) {
            return null;
        }
        return deserializeAws_restXmlCORSRule(entry, context);
    });
};
var deserializeAws_restXmlDefaultRetention = function (output, context) {
    var contents = {
        Mode: undefined,
        Days: undefined,
        Years: undefined,
    };
    if (output["Mode"] !== undefined) {
        contents.Mode = output["Mode"];
    }
    if (output["Days"] !== undefined) {
        contents.Days = parseInt(output["Days"]);
    }
    if (output["Years"] !== undefined) {
        contents.Years = parseInt(output["Years"]);
    }
    return contents;
};
var deserializeAws_restXmlDeletedObject = function (output, context) {
    var contents = {
        Key: undefined,
        VersionId: undefined,
        DeleteMarker: undefined,
        DeleteMarkerVersionId: undefined,
    };
    if (output["Key"] !== undefined) {
        contents.Key = output["Key"];
    }
    if (output["VersionId"] !== undefined) {
        contents.VersionId = output["VersionId"];
    }
    if (output["DeleteMarker"] !== undefined) {
        contents.DeleteMarker = output["DeleteMarker"] == "true";
    }
    if (output["DeleteMarkerVersionId"] !== undefined) {
        contents.DeleteMarkerVersionId = output["DeleteMarkerVersionId"];
    }
    return contents;
};
var deserializeAws_restXmlDeletedObjects = function (output, context) {
    return (output || [])
        .filter(function (e) { return e != null; })
        .map(function (entry) {
        if (entry === null) {
            return null;
        }
        return deserializeAws_restXmlDeletedObject(entry, context);
    });
};
var deserializeAws_restXmlDeleteMarkerEntry = function (output, context) {
    var contents = {
        Owner: undefined,
        Key: undefined,
        VersionId: undefined,
        IsLatest: undefined,
        LastModified: undefined,
    };
    if (output["Owner"] !== undefined) {
        contents.Owner = deserializeAws_restXmlOwner(output["Owner"], context);
    }
    if (output["Key"] !== undefined) {
        contents.Key = output["Key"];
    }
    if (output["VersionId"] !== undefined) {
        contents.VersionId = output["VersionId"];
    }
    if (output["IsLatest"] !== undefined) {
        contents.IsLatest = output["IsLatest"] == "true";
    }
    if (output["LastModified"] !== undefined) {
        contents.LastModified = new Date(output["LastModified"]);
    }
    return contents;
};
var deserializeAws_restXmlDeleteMarkerReplication = function (output, context) {
    var contents = {
        Status: undefined,
    };
    if (output["Status"] !== undefined) {
        contents.Status = output["Status"];
    }
    return contents;
};
var deserializeAws_restXmlDeleteMarkers = function (output, context) {
    return (output || [])
        .filter(function (e) { return e != null; })
        .map(function (entry) {
        if (entry === null) {
            return null;
        }
        return deserializeAws_restXmlDeleteMarkerEntry(entry, context);
    });
};
var deserializeAws_restXmlDestination = function (output, context) {
    var contents = {
        Bucket: undefined,
        Account: undefined,
        StorageClass: undefined,
        AccessControlTranslation: undefined,
        EncryptionConfiguration: undefined,
        ReplicationTime: undefined,
        Metrics: undefined,
    };
    if (output["Bucket"] !== undefined) {
        contents.Bucket = output["Bucket"];
    }
    if (output["Account"] !== undefined) {
        contents.Account = output["Account"];
    }
    if (output["StorageClass"] !== undefined) {
        contents.StorageClass = output["StorageClass"];
    }
    if (output["AccessControlTranslation"] !== undefined) {
        contents.AccessControlTranslation = deserializeAws_restXmlAccessControlTranslation(output["AccessControlTranslation"], context);
    }
    if (output["EncryptionConfiguration"] !== undefined) {
        contents.EncryptionConfiguration = deserializeAws_restXmlEncryptionConfiguration(output["EncryptionConfiguration"], context);
    }
    if (output["ReplicationTime"] !== undefined) {
        contents.ReplicationTime = deserializeAws_restXmlReplicationTime(output["ReplicationTime"], context);
    }
    if (output["Metrics"] !== undefined) {
        contents.Metrics = deserializeAws_restXmlMetrics(output["Metrics"], context);
    }
    return contents;
};
var deserializeAws_restXmlEncryptionConfiguration = function (output, context) {
    var contents = {
        ReplicaKmsKeyID: undefined,
    };
    if (output["ReplicaKmsKeyID"] !== undefined) {
        contents.ReplicaKmsKeyID = output["ReplicaKmsKeyID"];
    }
    return contents;
};
var deserializeAws_restXml_Error = function (output, context) {
    var contents = {
        Key: undefined,
        VersionId: undefined,
        Code: undefined,
        Message: undefined,
    };
    if (output["Key"] !== undefined) {
        contents.Key = output["Key"];
    }
    if (output["VersionId"] !== undefined) {
        contents.VersionId = output["VersionId"];
    }
    if (output["Code"] !== undefined) {
        contents.Code = output["Code"];
    }
    if (output["Message"] !== undefined) {
        contents.Message = output["Message"];
    }
    return contents;
};
var deserializeAws_restXmlErrorDocument = function (output, context) {
    var contents = {
        Key: undefined,
    };
    if (output["Key"] !== undefined) {
        contents.Key = output["Key"];
    }
    return contents;
};
var deserializeAws_restXmlErrors = function (output, context) {
    return (output || [])
        .filter(function (e) { return e != null; })
        .map(function (entry) {
        if (entry === null) {
            return null;
        }
        return deserializeAws_restXml_Error(entry, context);
    });
};
var deserializeAws_restXmlEventList = function (output, context) {
    return (output || [])
        .filter(function (e) { return e != null; })
        .map(function (entry) {
        if (entry === null) {
            return null;
        }
        return entry;
    });
};
var deserializeAws_restXmlExistingObjectReplication = function (output, context) {
    var contents = {
        Status: undefined,
    };
    if (output["Status"] !== undefined) {
        contents.Status = output["Status"];
    }
    return contents;
};
var deserializeAws_restXmlExposeHeaders = function (output, context) {
    return (output || [])
        .filter(function (e) { return e != null; })
        .map(function (entry) {
        if (entry === null) {
            return null;
        }
        return entry;
    });
};
var deserializeAws_restXmlFilterRule = function (output, context) {
    var contents = {
        Name: undefined,
        Value: undefined,
    };
    if (output["Name"] !== undefined) {
        contents.Name = output["Name"];
    }
    if (output["Value"] !== undefined) {
        contents.Value = output["Value"];
    }
    return contents;
};
var deserializeAws_restXmlFilterRuleList = function (output, context) {
    return (output || [])
        .filter(function (e) { return e != null; })
        .map(function (entry) {
        if (entry === null) {
            return null;
        }
        return deserializeAws_restXmlFilterRule(entry, context);
    });
};
var deserializeAws_restXmlGrant = function (output, context) {
    var contents = {
        Grantee: undefined,
        Permission: undefined,
    };
    if (output["Grantee"] !== undefined) {
        contents.Grantee = deserializeAws_restXmlGrantee(output["Grantee"], context);
    }
    if (output["Permission"] !== undefined) {
        contents.Permission = output["Permission"];
    }
    return contents;
};
var deserializeAws_restXmlGrantee = function (output, context) {
    var contents = {
        DisplayName: undefined,
        EmailAddress: undefined,
        ID: undefined,
        URI: undefined,
        Type: undefined,
    };
    if (output["DisplayName"] !== undefined) {
        contents.DisplayName = output["DisplayName"];
    }
    if (output["EmailAddress"] !== undefined) {
        contents.EmailAddress = output["EmailAddress"];
    }
    if (output["ID"] !== undefined) {
        contents.ID = output["ID"];
    }
    if (output["URI"] !== undefined) {
        contents.URI = output["URI"];
    }
    if (output["xsi:type"] !== undefined) {
        contents.Type = output["xsi:type"];
    }
    return contents;
};
var deserializeAws_restXmlGrants = function (output, context) {
    return (output || [])
        .filter(function (e) { return e != null; })
        .map(function (entry) {
        if (entry === null) {
            return null;
        }
        return deserializeAws_restXmlGrant(entry, context);
    });
};
var deserializeAws_restXmlIndexDocument = function (output, context) {
    var contents = {
        Suffix: undefined,
    };
    if (output["Suffix"] !== undefined) {
        contents.Suffix = output["Suffix"];
    }
    return contents;
};
var deserializeAws_restXmlInitiator = function (output, context) {
    var contents = {
        ID: undefined,
        DisplayName: undefined,
    };
    if (output["ID"] !== undefined) {
        contents.ID = output["ID"];
    }
    if (output["DisplayName"] !== undefined) {
        contents.DisplayName = output["DisplayName"];
    }
    return contents;
};
var deserializeAws_restXmlIntelligentTieringAndOperator = function (output, context) {
    var contents = {
        Prefix: undefined,
        Tags: undefined,
    };
    if (output["Prefix"] !== undefined) {
        contents.Prefix = output["Prefix"];
    }
    if (output.Tag === "") {
        contents.Tags = [];
    }
    if (output["Tag"] !== undefined) {
        contents.Tags = deserializeAws_restXmlTagSet(__getArrayIfSingleItem(output["Tag"]), context);
    }
    return contents;
};
var deserializeAws_restXmlIntelligentTieringConfiguration = function (output, context) {
    var contents = {
        Id: undefined,
        Filter: undefined,
        Status: undefined,
        Tierings: undefined,
    };
    if (output["Id"] !== undefined) {
        contents.Id = output["Id"];
    }
    if (output["Filter"] !== undefined) {
        contents.Filter = deserializeAws_restXmlIntelligentTieringFilter(output["Filter"], context);
    }
    if (output["Status"] !== undefined) {
        contents.Status = output["Status"];
    }
    if (output.Tiering === "") {
        contents.Tierings = [];
    }
    if (output["Tiering"] !== undefined) {
        contents.Tierings = deserializeAws_restXmlTieringList(__getArrayIfSingleItem(output["Tiering"]), context);
    }
    return contents;
};
var deserializeAws_restXmlIntelligentTieringConfigurationList = function (output, context) {
    return (output || [])
        .filter(function (e) { return e != null; })
        .map(function (entry) {
        if (entry === null) {
            return null;
        }
        return deserializeAws_restXmlIntelligentTieringConfiguration(entry, context);
    });
};
var deserializeAws_restXmlIntelligentTieringFilter = function (output, context) {
    var contents = {
        Prefix: undefined,
        Tag: undefined,
        And: undefined,
    };
    if (output["Prefix"] !== undefined) {
        contents.Prefix = output["Prefix"];
    }
    if (output["Tag"] !== undefined) {
        contents.Tag = deserializeAws_restXmlTag(output["Tag"], context);
    }
    if (output["And"] !== undefined) {
        contents.And = deserializeAws_restXmlIntelligentTieringAndOperator(output["And"], context);
    }
    return contents;
};
var deserializeAws_restXmlInventoryConfiguration = function (output, context) {
    var contents = {
        Destination: undefined,
        IsEnabled: undefined,
        Filter: undefined,
        Id: undefined,
        IncludedObjectVersions: undefined,
        OptionalFields: undefined,
        Schedule: undefined,
    };
    if (output["Destination"] !== undefined) {
        contents.Destination = deserializeAws_restXmlInventoryDestination(output["Destination"], context);
    }
    if (output["IsEnabled"] !== undefined) {
        contents.IsEnabled = output["IsEnabled"] == "true";
    }
    if (output["Filter"] !== undefined) {
        contents.Filter = deserializeAws_restXmlInventoryFilter(output["Filter"], context);
    }
    if (output["Id"] !== undefined) {
        contents.Id = output["Id"];
    }
    if (output["IncludedObjectVersions"] !== undefined) {
        contents.IncludedObjectVersions = output["IncludedObjectVersions"];
    }
    if (output.OptionalFields === "") {
        contents.OptionalFields = [];
    }
    if (output["OptionalFields"] !== undefined && output["OptionalFields"]["Field"] !== undefined) {
        contents.OptionalFields = deserializeAws_restXmlInventoryOptionalFields(__getArrayIfSingleItem(output["OptionalFields"]["Field"]), context);
    }
    if (output["Schedule"] !== undefined) {
        contents.Schedule = deserializeAws_restXmlInventorySchedule(output["Schedule"], context);
    }
    return contents;
};
var deserializeAws_restXmlInventoryConfigurationList = function (output, context) {
    return (output || [])
        .filter(function (e) { return e != null; })
        .map(function (entry) {
        if (entry === null) {
            return null;
        }
        return deserializeAws_restXmlInventoryConfiguration(entry, context);
    });
};
var deserializeAws_restXmlInventoryDestination = function (output, context) {
    var contents = {
        S3BucketDestination: undefined,
    };
    if (output["S3BucketDestination"] !== undefined) {
        contents.S3BucketDestination = deserializeAws_restXmlInventoryS3BucketDestination(output["S3BucketDestination"], context);
    }
    return contents;
};
var deserializeAws_restXmlInventoryEncryption = function (output, context) {
    var contents = {
        SSES3: undefined,
        SSEKMS: undefined,
    };
    if (output["SSE-S3"] !== undefined) {
        contents.SSES3 = deserializeAws_restXmlSSES3(output["SSE-S3"], context);
    }
    if (output["SSE-KMS"] !== undefined) {
        contents.SSEKMS = deserializeAws_restXmlSSEKMS(output["SSE-KMS"], context);
    }
    return contents;
};
var deserializeAws_restXmlInventoryFilter = function (output, context) {
    var contents = {
        Prefix: undefined,
    };
    if (output["Prefix"] !== undefined) {
        contents.Prefix = output["Prefix"];
    }
    return contents;
};
var deserializeAws_restXmlInventoryOptionalFields = function (output, context) {
    return (output || [])
        .filter(function (e) { return e != null; })
        .map(function (entry) {
        if (entry === null) {
            return null;
        }
        return entry;
    });
};
var deserializeAws_restXmlInventoryS3BucketDestination = function (output, context) {
    var contents = {
        AccountId: undefined,
        Bucket: undefined,
        Format: undefined,
        Prefix: undefined,
        Encryption: undefined,
    };
    if (output["AccountId"] !== undefined) {
        contents.AccountId = output["AccountId"];
    }
    if (output["Bucket"] !== undefined) {
        contents.Bucket = output["Bucket"];
    }
    if (output["Format"] !== undefined) {
        contents.Format = output["Format"];
    }
    if (output["Prefix"] !== undefined) {
        contents.Prefix = output["Prefix"];
    }
    if (output["Encryption"] !== undefined) {
        contents.Encryption = deserializeAws_restXmlInventoryEncryption(output["Encryption"], context);
    }
    return contents;
};
var deserializeAws_restXmlInventorySchedule = function (output, context) {
    var contents = {
        Frequency: undefined,
    };
    if (output["Frequency"] !== undefined) {
        contents.Frequency = output["Frequency"];
    }
    return contents;
};
var deserializeAws_restXmlLambdaFunctionConfiguration = function (output, context) {
    var contents = {
        Id: undefined,
        LambdaFunctionArn: undefined,
        Events: undefined,
        Filter: undefined,
    };
    if (output["Id"] !== undefined) {
        contents.Id = output["Id"];
    }
    if (output["CloudFunction"] !== undefined) {
        contents.LambdaFunctionArn = output["CloudFunction"];
    }
    if (output.Event === "") {
        contents.Events = [];
    }
    if (output["Event"] !== undefined) {
        contents.Events = deserializeAws_restXmlEventList(__getArrayIfSingleItem(output["Event"]), context);
    }
    if (output["Filter"] !== undefined) {
        contents.Filter = deserializeAws_restXmlNotificationConfigurationFilter(output["Filter"], context);
    }
    return contents;
};
var deserializeAws_restXmlLambdaFunctionConfigurationList = function (output, context) {
    return (output || [])
        .filter(function (e) { return e != null; })
        .map(function (entry) {
        if (entry === null) {
            return null;
        }
        return deserializeAws_restXmlLambdaFunctionConfiguration(entry, context);
    });
};
var deserializeAws_restXmlLifecycleExpiration = function (output, context) {
    var contents = {
        Date: undefined,
        Days: undefined,
        ExpiredObjectDeleteMarker: undefined,
    };
    if (output["Date"] !== undefined) {
        contents.Date = new Date(output["Date"]);
    }
    if (output["Days"] !== undefined) {
        contents.Days = parseInt(output["Days"]);
    }
    if (output["ExpiredObjectDeleteMarker"] !== undefined) {
        contents.ExpiredObjectDeleteMarker = output["ExpiredObjectDeleteMarker"] == "true";
    }
    return contents;
};
var deserializeAws_restXmlLifecycleRule = function (output, context) {
    var contents = {
        Expiration: undefined,
        ID: undefined,
        Prefix: undefined,
        Filter: undefined,
        Status: undefined,
        Transitions: undefined,
        NoncurrentVersionTransitions: undefined,
        NoncurrentVersionExpiration: undefined,
        AbortIncompleteMultipartUpload: undefined,
    };
    if (output["Expiration"] !== undefined) {
        contents.Expiration = deserializeAws_restXmlLifecycleExpiration(output["Expiration"], context);
    }
    if (output["ID"] !== undefined) {
        contents.ID = output["ID"];
    }
    if (output["Prefix"] !== undefined) {
        contents.Prefix = output["Prefix"];
    }
    if (output["Filter"] !== undefined) {
        contents.Filter = deserializeAws_restXmlLifecycleRuleFilter(output["Filter"], context);
    }
    if (output["Status"] !== undefined) {
        contents.Status = output["Status"];
    }
    if (output.Transition === "") {
        contents.Transitions = [];
    }
    if (output["Transition"] !== undefined) {
        contents.Transitions = deserializeAws_restXmlTransitionList(__getArrayIfSingleItem(output["Transition"]), context);
    }
    if (output.NoncurrentVersionTransition === "") {
        contents.NoncurrentVersionTransitions = [];
    }
    if (output["NoncurrentVersionTransition"] !== undefined) {
        contents.NoncurrentVersionTransitions = deserializeAws_restXmlNoncurrentVersionTransitionList(__getArrayIfSingleItem(output["NoncurrentVersionTransition"]), context);
    }
    if (output["NoncurrentVersionExpiration"] !== undefined) {
        contents.NoncurrentVersionExpiration = deserializeAws_restXmlNoncurrentVersionExpiration(output["NoncurrentVersionExpiration"], context);
    }
    if (output["AbortIncompleteMultipartUpload"] !== undefined) {
        contents.AbortIncompleteMultipartUpload = deserializeAws_restXmlAbortIncompleteMultipartUpload(output["AbortIncompleteMultipartUpload"], context);
    }
    return contents;
};
var deserializeAws_restXmlLifecycleRuleAndOperator = function (output, context) {
    var contents = {
        Prefix: undefined,
        Tags: undefined,
    };
    if (output["Prefix"] !== undefined) {
        contents.Prefix = output["Prefix"];
    }
    if (output.Tag === "") {
        contents.Tags = [];
    }
    if (output["Tag"] !== undefined) {
        contents.Tags = deserializeAws_restXmlTagSet(__getArrayIfSingleItem(output["Tag"]), context);
    }
    return contents;
};
var deserializeAws_restXmlLifecycleRuleFilter = function (output, context) {
    if (output["Prefix"] !== undefined) {
        return {
            Prefix: output["Prefix"],
        };
    }
    if (output["Tag"] !== undefined) {
        return {
            Tag: deserializeAws_restXmlTag(output["Tag"], context),
        };
    }
    if (output["And"] !== undefined) {
        return {
            And: deserializeAws_restXmlLifecycleRuleAndOperator(output["And"], context),
        };
    }
    return { $unknown: Object.entries(output)[0] };
};
var deserializeAws_restXmlLifecycleRules = function (output, context) {
    return (output || [])
        .filter(function (e) { return e != null; })
        .map(function (entry) {
        if (entry === null) {
            return null;
        }
        return deserializeAws_restXmlLifecycleRule(entry, context);
    });
};
var deserializeAws_restXmlLoggingEnabled = function (output, context) {
    var contents = {
        TargetBucket: undefined,
        TargetGrants: undefined,
        TargetPrefix: undefined,
    };
    if (output["TargetBucket"] !== undefined) {
        contents.TargetBucket = output["TargetBucket"];
    }
    if (output.TargetGrants === "") {
        contents.TargetGrants = [];
    }
    if (output["TargetGrants"] !== undefined && output["TargetGrants"]["Grant"] !== undefined) {
        contents.TargetGrants = deserializeAws_restXmlTargetGrants(__getArrayIfSingleItem(output["TargetGrants"]["Grant"]), context);
    }
    if (output["TargetPrefix"] !== undefined) {
        contents.TargetPrefix = output["TargetPrefix"];
    }
    return contents;
};
var deserializeAws_restXmlMetrics = function (output, context) {
    var contents = {
        Status: undefined,
        EventThreshold: undefined,
    };
    if (output["Status"] !== undefined) {
        contents.Status = output["Status"];
    }
    if (output["EventThreshold"] !== undefined) {
        contents.EventThreshold = deserializeAws_restXmlReplicationTimeValue(output["EventThreshold"], context);
    }
    return contents;
};
var deserializeAws_restXmlMetricsAndOperator = function (output, context) {
    var contents = {
        Prefix: undefined,
        Tags: undefined,
    };
    if (output["Prefix"] !== undefined) {
        contents.Prefix = output["Prefix"];
    }
    if (output.Tag === "") {
        contents.Tags = [];
    }
    if (output["Tag"] !== undefined) {
        contents.Tags = deserializeAws_restXmlTagSet(__getArrayIfSingleItem(output["Tag"]), context);
    }
    return contents;
};
var deserializeAws_restXmlMetricsConfiguration = function (output, context) {
    var contents = {
        Id: undefined,
        Filter: undefined,
    };
    if (output["Id"] !== undefined) {
        contents.Id = output["Id"];
    }
    if (output["Filter"] !== undefined) {
        contents.Filter = deserializeAws_restXmlMetricsFilter(output["Filter"], context);
    }
    return contents;
};
var deserializeAws_restXmlMetricsConfigurationList = function (output, context) {
    return (output || [])
        .filter(function (e) { return e != null; })
        .map(function (entry) {
        if (entry === null) {
            return null;
        }
        return deserializeAws_restXmlMetricsConfiguration(entry, context);
    });
};
var deserializeAws_restXmlMetricsFilter = function (output, context) {
    if (output["Prefix"] !== undefined) {
        return {
            Prefix: output["Prefix"],
        };
    }
    if (output["Tag"] !== undefined) {
        return {
            Tag: deserializeAws_restXmlTag(output["Tag"], context),
        };
    }
    if (output["And"] !== undefined) {
        return {
            And: deserializeAws_restXmlMetricsAndOperator(output["And"], context),
        };
    }
    return { $unknown: Object.entries(output)[0] };
};
var deserializeAws_restXmlMultipartUpload = function (output, context) {
    var contents = {
        UploadId: undefined,
        Key: undefined,
        Initiated: undefined,
        StorageClass: undefined,
        Owner: undefined,
        Initiator: undefined,
    };
    if (output["UploadId"] !== undefined) {
        contents.UploadId = output["UploadId"];
    }
    if (output["Key"] !== undefined) {
        contents.Key = output["Key"];
    }
    if (output["Initiated"] !== undefined) {
        contents.Initiated = new Date(output["Initiated"]);
    }
    if (output["StorageClass"] !== undefined) {
        contents.StorageClass = output["StorageClass"];
    }
    if (output["Owner"] !== undefined) {
        contents.Owner = deserializeAws_restXmlOwner(output["Owner"], context);
    }
    if (output["Initiator"] !== undefined) {
        contents.Initiator = deserializeAws_restXmlInitiator(output["Initiator"], context);
    }
    return contents;
};
var deserializeAws_restXmlMultipartUploadList = function (output, context) {
    return (output || [])
        .filter(function (e) { return e != null; })
        .map(function (entry) {
        if (entry === null) {
            return null;
        }
        return deserializeAws_restXmlMultipartUpload(entry, context);
    });
};
var deserializeAws_restXmlNoncurrentVersionExpiration = function (output, context) {
    var contents = {
        NoncurrentDays: undefined,
    };
    if (output["NoncurrentDays"] !== undefined) {
        contents.NoncurrentDays = parseInt(output["NoncurrentDays"]);
    }
    return contents;
};
var deserializeAws_restXmlNoncurrentVersionTransition = function (output, context) {
    var contents = {
        NoncurrentDays: undefined,
        StorageClass: undefined,
    };
    if (output["NoncurrentDays"] !== undefined) {
        contents.NoncurrentDays = parseInt(output["NoncurrentDays"]);
    }
    if (output["StorageClass"] !== undefined) {
        contents.StorageClass = output["StorageClass"];
    }
    return contents;
};
var deserializeAws_restXmlNoncurrentVersionTransitionList = function (output, context) {
    return (output || [])
        .filter(function (e) { return e != null; })
        .map(function (entry) {
        if (entry === null) {
            return null;
        }
        return deserializeAws_restXmlNoncurrentVersionTransition(entry, context);
    });
};
var deserializeAws_restXmlNotificationConfigurationFilter = function (output, context) {
    var contents = {
        Key: undefined,
    };
    if (output["S3Key"] !== undefined) {
        contents.Key = deserializeAws_restXmlS3KeyFilter(output["S3Key"], context);
    }
    return contents;
};
var deserializeAws_restXml_Object = function (output, context) {
    var contents = {
        Key: undefined,
        LastModified: undefined,
        ETag: undefined,
        Size: undefined,
        StorageClass: undefined,
        Owner: undefined,
    };
    if (output["Key"] !== undefined) {
        contents.Key = output["Key"];
    }
    if (output["LastModified"] !== undefined) {
        contents.LastModified = new Date(output["LastModified"]);
    }
    if (output["ETag"] !== undefined) {
        contents.ETag = output["ETag"];
    }
    if (output["Size"] !== undefined) {
        contents.Size = parseInt(output["Size"]);
    }
    if (output["StorageClass"] !== undefined) {
        contents.StorageClass = output["StorageClass"];
    }
    if (output["Owner"] !== undefined) {
        contents.Owner = deserializeAws_restXmlOwner(output["Owner"], context);
    }
    return contents;
};
var deserializeAws_restXmlObjectList = function (output, context) {
    return (output || [])
        .filter(function (e) { return e != null; })
        .map(function (entry) {
        if (entry === null) {
            return null;
        }
        return deserializeAws_restXml_Object(entry, context);
    });
};
var deserializeAws_restXmlObjectLockConfiguration = function (output, context) {
    var contents = {
        ObjectLockEnabled: undefined,
        Rule: undefined,
    };
    if (output["ObjectLockEnabled"] !== undefined) {
        contents.ObjectLockEnabled = output["ObjectLockEnabled"];
    }
    if (output["Rule"] !== undefined) {
        contents.Rule = deserializeAws_restXmlObjectLockRule(output["Rule"], context);
    }
    return contents;
};
var deserializeAws_restXmlObjectLockLegalHold = function (output, context) {
    var contents = {
        Status: undefined,
    };
    if (output["Status"] !== undefined) {
        contents.Status = output["Status"];
    }
    return contents;
};
var deserializeAws_restXmlObjectLockRetention = function (output, context) {
    var contents = {
        Mode: undefined,
        RetainUntilDate: undefined,
    };
    if (output["Mode"] !== undefined) {
        contents.Mode = output["Mode"];
    }
    if (output["RetainUntilDate"] !== undefined) {
        contents.RetainUntilDate = new Date(output["RetainUntilDate"]);
    }
    return contents;
};
var deserializeAws_restXmlObjectLockRule = function (output, context) {
    var contents = {
        DefaultRetention: undefined,
    };
    if (output["DefaultRetention"] !== undefined) {
        contents.DefaultRetention = deserializeAws_restXmlDefaultRetention(output["DefaultRetention"], context);
    }
    return contents;
};
var deserializeAws_restXmlObjectVersion = function (output, context) {
    var contents = {
        ETag: undefined,
        Size: undefined,
        StorageClass: undefined,
        Key: undefined,
        VersionId: undefined,
        IsLatest: undefined,
        LastModified: undefined,
        Owner: undefined,
    };
    if (output["ETag"] !== undefined) {
        contents.ETag = output["ETag"];
    }
    if (output["Size"] !== undefined) {
        contents.Size = parseInt(output["Size"]);
    }
    if (output["StorageClass"] !== undefined) {
        contents.StorageClass = output["StorageClass"];
    }
    if (output["Key"] !== undefined) {
        contents.Key = output["Key"];
    }
    if (output["VersionId"] !== undefined) {
        contents.VersionId = output["VersionId"];
    }
    if (output["IsLatest"] !== undefined) {
        contents.IsLatest = output["IsLatest"] == "true";
    }
    if (output["LastModified"] !== undefined) {
        contents.LastModified = new Date(output["LastModified"]);
    }
    if (output["Owner"] !== undefined) {
        contents.Owner = deserializeAws_restXmlOwner(output["Owner"], context);
    }
    return contents;
};
var deserializeAws_restXmlObjectVersionList = function (output, context) {
    return (output || [])
        .filter(function (e) { return e != null; })
        .map(function (entry) {
        if (entry === null) {
            return null;
        }
        return deserializeAws_restXmlObjectVersion(entry, context);
    });
};
var deserializeAws_restXmlOwner = function (output, context) {
    var contents = {
        DisplayName: undefined,
        ID: undefined,
    };
    if (output["DisplayName"] !== undefined) {
        contents.DisplayName = output["DisplayName"];
    }
    if (output["ID"] !== undefined) {
        contents.ID = output["ID"];
    }
    return contents;
};
var deserializeAws_restXmlOwnershipControls = function (output, context) {
    var contents = {
        Rules: undefined,
    };
    if (output.Rule === "") {
        contents.Rules = [];
    }
    if (output["Rule"] !== undefined) {
        contents.Rules = deserializeAws_restXmlOwnershipControlsRules(__getArrayIfSingleItem(output["Rule"]), context);
    }
    return contents;
};
var deserializeAws_restXmlOwnershipControlsRule = function (output, context) {
    var contents = {
        ObjectOwnership: undefined,
    };
    if (output["ObjectOwnership"] !== undefined) {
        contents.ObjectOwnership = output["ObjectOwnership"];
    }
    return contents;
};
var deserializeAws_restXmlOwnershipControlsRules = function (output, context) {
    return (output || [])
        .filter(function (e) { return e != null; })
        .map(function (entry) {
        if (entry === null) {
            return null;
        }
        return deserializeAws_restXmlOwnershipControlsRule(entry, context);
    });
};
var deserializeAws_restXmlPart = function (output, context) {
    var contents = {
        PartNumber: undefined,
        LastModified: undefined,
        ETag: undefined,
        Size: undefined,
    };
    if (output["PartNumber"] !== undefined) {
        contents.PartNumber = parseInt(output["PartNumber"]);
    }
    if (output["LastModified"] !== undefined) {
        contents.LastModified = new Date(output["LastModified"]);
    }
    if (output["ETag"] !== undefined) {
        contents.ETag = output["ETag"];
    }
    if (output["Size"] !== undefined) {
        contents.Size = parseInt(output["Size"]);
    }
    return contents;
};
var deserializeAws_restXmlParts = function (output, context) {
    return (output || [])
        .filter(function (e) { return e != null; })
        .map(function (entry) {
        if (entry === null) {
            return null;
        }
        return deserializeAws_restXmlPart(entry, context);
    });
};
var deserializeAws_restXmlPolicyStatus = function (output, context) {
    var contents = {
        IsPublic: undefined,
    };
    if (output["IsPublic"] !== undefined) {
        contents.IsPublic = output["IsPublic"] == "true";
    }
    return contents;
};
var deserializeAws_restXmlPublicAccessBlockConfiguration = function (output, context) {
    var contents = {
        BlockPublicAcls: undefined,
        IgnorePublicAcls: undefined,
        BlockPublicPolicy: undefined,
        RestrictPublicBuckets: undefined,
    };
    if (output["BlockPublicAcls"] !== undefined) {
        contents.BlockPublicAcls = output["BlockPublicAcls"] == "true";
    }
    if (output["IgnorePublicAcls"] !== undefined) {
        contents.IgnorePublicAcls = output["IgnorePublicAcls"] == "true";
    }
    if (output["BlockPublicPolicy"] !== undefined) {
        contents.BlockPublicPolicy = output["BlockPublicPolicy"] == "true";
    }
    if (output["RestrictPublicBuckets"] !== undefined) {
        contents.RestrictPublicBuckets = output["RestrictPublicBuckets"] == "true";
    }
    return contents;
};
var deserializeAws_restXmlQueueConfiguration = function (output, context) {
    var contents = {
        Id: undefined,
        QueueArn: undefined,
        Events: undefined,
        Filter: undefined,
    };
    if (output["Id"] !== undefined) {
        contents.Id = output["Id"];
    }
    if (output["Queue"] !== undefined) {
        contents.QueueArn = output["Queue"];
    }
    if (output.Event === "") {
        contents.Events = [];
    }
    if (output["Event"] !== undefined) {
        contents.Events = deserializeAws_restXmlEventList(__getArrayIfSingleItem(output["Event"]), context);
    }
    if (output["Filter"] !== undefined) {
        contents.Filter = deserializeAws_restXmlNotificationConfigurationFilter(output["Filter"], context);
    }
    return contents;
};
var deserializeAws_restXmlQueueConfigurationList = function (output, context) {
    return (output || [])
        .filter(function (e) { return e != null; })
        .map(function (entry) {
        if (entry === null) {
            return null;
        }
        return deserializeAws_restXmlQueueConfiguration(entry, context);
    });
};
var deserializeAws_restXmlRedirect = function (output, context) {
    var contents = {
        HostName: undefined,
        HttpRedirectCode: undefined,
        Protocol: undefined,
        ReplaceKeyPrefixWith: undefined,
        ReplaceKeyWith: undefined,
    };
    if (output["HostName"] !== undefined) {
        contents.HostName = output["HostName"];
    }
    if (output["HttpRedirectCode"] !== undefined) {
        contents.HttpRedirectCode = output["HttpRedirectCode"];
    }
    if (output["Protocol"] !== undefined) {
        contents.Protocol = output["Protocol"];
    }
    if (output["ReplaceKeyPrefixWith"] !== undefined) {
        contents.ReplaceKeyPrefixWith = output["ReplaceKeyPrefixWith"];
    }
    if (output["ReplaceKeyWith"] !== undefined) {
        contents.ReplaceKeyWith = output["ReplaceKeyWith"];
    }
    return contents;
};
var deserializeAws_restXmlRedirectAllRequestsTo = function (output, context) {
    var contents = {
        HostName: undefined,
        Protocol: undefined,
    };
    if (output["HostName"] !== undefined) {
        contents.HostName = output["HostName"];
    }
    if (output["Protocol"] !== undefined) {
        contents.Protocol = output["Protocol"];
    }
    return contents;
};
var deserializeAws_restXmlReplicaModifications = function (output, context) {
    var contents = {
        Status: undefined,
    };
    if (output["Status"] !== undefined) {
        contents.Status = output["Status"];
    }
    return contents;
};
var deserializeAws_restXmlReplicationConfiguration = function (output, context) {
    var contents = {
        Role: undefined,
        Rules: undefined,
    };
    if (output["Role"] !== undefined) {
        contents.Role = output["Role"];
    }
    if (output.Rule === "") {
        contents.Rules = [];
    }
    if (output["Rule"] !== undefined) {
        contents.Rules = deserializeAws_restXmlReplicationRules(__getArrayIfSingleItem(output["Rule"]), context);
    }
    return contents;
};
var deserializeAws_restXmlReplicationRule = function (output, context) {
    var contents = {
        ID: undefined,
        Priority: undefined,
        Prefix: undefined,
        Filter: undefined,
        Status: undefined,
        SourceSelectionCriteria: undefined,
        ExistingObjectReplication: undefined,
        Destination: undefined,
        DeleteMarkerReplication: undefined,
    };
    if (output["ID"] !== undefined) {
        contents.ID = output["ID"];
    }
    if (output["Priority"] !== undefined) {
        contents.Priority = parseInt(output["Priority"]);
    }
    if (output["Prefix"] !== undefined) {
        contents.Prefix = output["Prefix"];
    }
    if (output["Filter"] !== undefined) {
        contents.Filter = deserializeAws_restXmlReplicationRuleFilter(output["Filter"], context);
    }
    if (output["Status"] !== undefined) {
        contents.Status = output["Status"];
    }
    if (output["SourceSelectionCriteria"] !== undefined) {
        contents.SourceSelectionCriteria = deserializeAws_restXmlSourceSelectionCriteria(output["SourceSelectionCriteria"], context);
    }
    if (output["ExistingObjectReplication"] !== undefined) {
        contents.ExistingObjectReplication = deserializeAws_restXmlExistingObjectReplication(output["ExistingObjectReplication"], context);
    }
    if (output["Destination"] !== undefined) {
        contents.Destination = deserializeAws_restXmlDestination(output["Destination"], context);
    }
    if (output["DeleteMarkerReplication"] !== undefined) {
        contents.DeleteMarkerReplication = deserializeAws_restXmlDeleteMarkerReplication(output["DeleteMarkerReplication"], context);
    }
    return contents;
};
var deserializeAws_restXmlReplicationRuleAndOperator = function (output, context) {
    var contents = {
        Prefix: undefined,
        Tags: undefined,
    };
    if (output["Prefix"] !== undefined) {
        contents.Prefix = output["Prefix"];
    }
    if (output.Tag === "") {
        contents.Tags = [];
    }
    if (output["Tag"] !== undefined) {
        contents.Tags = deserializeAws_restXmlTagSet(__getArrayIfSingleItem(output["Tag"]), context);
    }
    return contents;
};
var deserializeAws_restXmlReplicationRuleFilter = function (output, context) {
    if (output["Prefix"] !== undefined) {
        return {
            Prefix: output["Prefix"],
        };
    }
    if (output["Tag"] !== undefined) {
        return {
            Tag: deserializeAws_restXmlTag(output["Tag"], context),
        };
    }
    if (output["And"] !== undefined) {
        return {
            And: deserializeAws_restXmlReplicationRuleAndOperator(output["And"], context),
        };
    }
    return { $unknown: Object.entries(output)[0] };
};
var deserializeAws_restXmlReplicationRules = function (output, context) {
    return (output || [])
        .filter(function (e) { return e != null; })
        .map(function (entry) {
        if (entry === null) {
            return null;
        }
        return deserializeAws_restXmlReplicationRule(entry, context);
    });
};
var deserializeAws_restXmlReplicationTime = function (output, context) {
    var contents = {
        Status: undefined,
        Time: undefined,
    };
    if (output["Status"] !== undefined) {
        contents.Status = output["Status"];
    }
    if (output["Time"] !== undefined) {
        contents.Time = deserializeAws_restXmlReplicationTimeValue(output["Time"], context);
    }
    return contents;
};
var deserializeAws_restXmlReplicationTimeValue = function (output, context) {
    var contents = {
        Minutes: undefined,
    };
    if (output["Minutes"] !== undefined) {
        contents.Minutes = parseInt(output["Minutes"]);
    }
    return contents;
};
var deserializeAws_restXmlRoutingRule = function (output, context) {
    var contents = {
        Condition: undefined,
        Redirect: undefined,
    };
    if (output["Condition"] !== undefined) {
        contents.Condition = deserializeAws_restXmlCondition(output["Condition"], context);
    }
    if (output["Redirect"] !== undefined) {
        contents.Redirect = deserializeAws_restXmlRedirect(output["Redirect"], context);
    }
    return contents;
};
var deserializeAws_restXmlRoutingRules = function (output, context) {
    return (output || [])
        .filter(function (e) { return e != null; })
        .map(function (entry) {
        if (entry === null) {
            return null;
        }
        return deserializeAws_restXmlRoutingRule(entry, context);
    });
};
var deserializeAws_restXmlS3KeyFilter = function (output, context) {
    var contents = {
        FilterRules: undefined,
    };
    if (output.FilterRule === "") {
        contents.FilterRules = [];
    }
    if (output["FilterRule"] !== undefined) {
        contents.FilterRules = deserializeAws_restXmlFilterRuleList(__getArrayIfSingleItem(output["FilterRule"]), context);
    }
    return contents;
};
var deserializeAws_restXmlServerSideEncryptionByDefault = function (output, context) {
    var contents = {
        SSEAlgorithm: undefined,
        KMSMasterKeyID: undefined,
    };
    if (output["SSEAlgorithm"] !== undefined) {
        contents.SSEAlgorithm = output["SSEAlgorithm"];
    }
    if (output["KMSMasterKeyID"] !== undefined) {
        contents.KMSMasterKeyID = output["KMSMasterKeyID"];
    }
    return contents;
};
var deserializeAws_restXmlServerSideEncryptionConfiguration = function (output, context) {
    var contents = {
        Rules: undefined,
    };
    if (output.Rule === "") {
        contents.Rules = [];
    }
    if (output["Rule"] !== undefined) {
        contents.Rules = deserializeAws_restXmlServerSideEncryptionRules(__getArrayIfSingleItem(output["Rule"]), context);
    }
    return contents;
};
var deserializeAws_restXmlServerSideEncryptionRule = function (output, context) {
    var contents = {
        ApplyServerSideEncryptionByDefault: undefined,
        BucketKeyEnabled: undefined,
    };
    if (output["ApplyServerSideEncryptionByDefault"] !== undefined) {
        contents.ApplyServerSideEncryptionByDefault = deserializeAws_restXmlServerSideEncryptionByDefault(output["ApplyServerSideEncryptionByDefault"], context);
    }
    if (output["BucketKeyEnabled"] !== undefined) {
        contents.BucketKeyEnabled = output["BucketKeyEnabled"] == "true";
    }
    return contents;
};
var deserializeAws_restXmlServerSideEncryptionRules = function (output, context) {
    return (output || [])
        .filter(function (e) { return e != null; })
        .map(function (entry) {
        if (entry === null) {
            return null;
        }
        return deserializeAws_restXmlServerSideEncryptionRule(entry, context);
    });
};
var deserializeAws_restXmlSourceSelectionCriteria = function (output, context) {
    var contents = {
        SseKmsEncryptedObjects: undefined,
        ReplicaModifications: undefined,
    };
    if (output["SseKmsEncryptedObjects"] !== undefined) {
        contents.SseKmsEncryptedObjects = deserializeAws_restXmlSseKmsEncryptedObjects(output["SseKmsEncryptedObjects"], context);
    }
    if (output["ReplicaModifications"] !== undefined) {
        contents.ReplicaModifications = deserializeAws_restXmlReplicaModifications(output["ReplicaModifications"], context);
    }
    return contents;
};
var deserializeAws_restXmlSSEKMS = function (output, context) {
    var contents = {
        KeyId: undefined,
    };
    if (output["KeyId"] !== undefined) {
        contents.KeyId = output["KeyId"];
    }
    return contents;
};
var deserializeAws_restXmlSseKmsEncryptedObjects = function (output, context) {
    var contents = {
        Status: undefined,
    };
    if (output["Status"] !== undefined) {
        contents.Status = output["Status"];
    }
    return contents;
};
var deserializeAws_restXmlSSES3 = function (output, context) {
    var contents = {};
    return contents;
};
var deserializeAws_restXmlStorageClassAnalysis = function (output, context) {
    var contents = {
        DataExport: undefined,
    };
    if (output["DataExport"] !== undefined) {
        contents.DataExport = deserializeAws_restXmlStorageClassAnalysisDataExport(output["DataExport"], context);
    }
    return contents;
};
var deserializeAws_restXmlStorageClassAnalysisDataExport = function (output, context) {
    var contents = {
        OutputSchemaVersion: undefined,
        Destination: undefined,
    };
    if (output["OutputSchemaVersion"] !== undefined) {
        contents.OutputSchemaVersion = output["OutputSchemaVersion"];
    }
    if (output["Destination"] !== undefined) {
        contents.Destination = deserializeAws_restXmlAnalyticsExportDestination(output["Destination"], context);
    }
    return contents;
};
var deserializeAws_restXmlTag = function (output, context) {
    var contents = {
        Key: undefined,
        Value: undefined,
    };
    if (output["Key"] !== undefined) {
        contents.Key = output["Key"];
    }
    if (output["Value"] !== undefined) {
        contents.Value = output["Value"];
    }
    return contents;
};
var deserializeAws_restXmlTagSet = function (output, context) {
    return (output || [])
        .filter(function (e) { return e != null; })
        .map(function (entry) {
        if (entry === null) {
            return null;
        }
        return deserializeAws_restXmlTag(entry, context);
    });
};
var deserializeAws_restXmlTargetGrant = function (output, context) {
    var contents = {
        Grantee: undefined,
        Permission: undefined,
    };
    if (output["Grantee"] !== undefined) {
        contents.Grantee = deserializeAws_restXmlGrantee(output["Grantee"], context);
    }
    if (output["Permission"] !== undefined) {
        contents.Permission = output["Permission"];
    }
    return contents;
};
var deserializeAws_restXmlTargetGrants = function (output, context) {
    return (output || [])
        .filter(function (e) { return e != null; })
        .map(function (entry) {
        if (entry === null) {
            return null;
        }
        return deserializeAws_restXmlTargetGrant(entry, context);
    });
};
var deserializeAws_restXmlTiering = function (output, context) {
    var contents = {
        Days: undefined,
        AccessTier: undefined,
    };
    if (output["Days"] !== undefined) {
        contents.Days = parseInt(output["Days"]);
    }
    if (output["AccessTier"] !== undefined) {
        contents.AccessTier = output["AccessTier"];
    }
    return contents;
};
var deserializeAws_restXmlTieringList = function (output, context) {
    return (output || [])
        .filter(function (e) { return e != null; })
        .map(function (entry) {
        if (entry === null) {
            return null;
        }
        return deserializeAws_restXmlTiering(entry, context);
    });
};
var deserializeAws_restXmlTopicConfiguration = function (output, context) {
    var contents = {
        Id: undefined,
        TopicArn: undefined,
        Events: undefined,
        Filter: undefined,
    };
    if (output["Id"] !== undefined) {
        contents.Id = output["Id"];
    }
    if (output["Topic"] !== undefined) {
        contents.TopicArn = output["Topic"];
    }
    if (output.Event === "") {
        contents.Events = [];
    }
    if (output["Event"] !== undefined) {
        contents.Events = deserializeAws_restXmlEventList(__getArrayIfSingleItem(output["Event"]), context);
    }
    if (output["Filter"] !== undefined) {
        contents.Filter = deserializeAws_restXmlNotificationConfigurationFilter(output["Filter"], context);
    }
    return contents;
};
var deserializeAws_restXmlTopicConfigurationList = function (output, context) {
    return (output || [])
        .filter(function (e) { return e != null; })
        .map(function (entry) {
        if (entry === null) {
            return null;
        }
        return deserializeAws_restXmlTopicConfiguration(entry, context);
    });
};
var deserializeAws_restXmlTransition = function (output, context) {
    var contents = {
        Date: undefined,
        Days: undefined,
        StorageClass: undefined,
    };
    if (output["Date"] !== undefined) {
        contents.Date = new Date(output["Date"]);
    }
    if (output["Days"] !== undefined) {
        contents.Days = parseInt(output["Days"]);
    }
    if (output["StorageClass"] !== undefined) {
        contents.StorageClass = output["StorageClass"];
    }
    return contents;
};
var deserializeAws_restXmlTransitionList = function (output, context) {
    return (output || [])
        .filter(function (e) { return e != null; })
        .map(function (entry) {
        if (entry === null) {
            return null;
        }
        return deserializeAws_restXmlTransition(entry, context);
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
var decodeEscapedXML = function (str) {
    return str
        .replace(/&amp;/g, "&")
        .replace(/&apos;/g, "'")
        .replace(/&quot;/g, '"')
        .replace(/&gt;/g, ">")
        .replace(/&lt;/g, "<");
};
var parseBody = function (streamBody, context) {
    return collectBodyString(streamBody, context).then(function (encoded) {
        if (encoded.length) {
            var parsedObj = xmlParse(encoded, {
                attributeNamePrefix: "",
                ignoreAttributes: false,
                parseNodeValue: false,
                tagValueProcessor: function (val, tagName) { return decodeEscapedXML(val); },
            });
            var textNodeName = "#text";
            var key = Object.keys(parsedObj)[0];
            var parsedObjToReturn = parsedObj[key];
            if (parsedObjToReturn[textNodeName]) {
                parsedObjToReturn[key] = parsedObjToReturn[textNodeName];
                delete parsedObjToReturn[textNodeName];
            }
            return __getValueFromTextNode(parsedObjToReturn);
        }
        return {};
    });
};
var loadRestXmlErrorCode = function (output, data) {
    if (data.Code !== undefined) {
        return data.Code;
    }
    if (output.statusCode == 404) {
        return "NotFound";
    }
    return "";
};
//# sourceMappingURL=Aws_restXml.js.map