"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializeAws_restXmlGetPublicAccessBlockCommand = exports.serializeAws_restXmlGetObjectTorrentCommand = exports.serializeAws_restXmlGetObjectTaggingCommand = exports.serializeAws_restXmlGetObjectRetentionCommand = exports.serializeAws_restXmlGetObjectLockConfigurationCommand = exports.serializeAws_restXmlGetObjectLegalHoldCommand = exports.serializeAws_restXmlGetObjectAclCommand = exports.serializeAws_restXmlGetObjectCommand = exports.serializeAws_restXmlGetBucketWebsiteCommand = exports.serializeAws_restXmlGetBucketVersioningCommand = exports.serializeAws_restXmlGetBucketTaggingCommand = exports.serializeAws_restXmlGetBucketRequestPaymentCommand = exports.serializeAws_restXmlGetBucketReplicationCommand = exports.serializeAws_restXmlGetBucketPolicyStatusCommand = exports.serializeAws_restXmlGetBucketPolicyCommand = exports.serializeAws_restXmlGetBucketOwnershipControlsCommand = exports.serializeAws_restXmlGetBucketNotificationConfigurationCommand = exports.serializeAws_restXmlGetBucketMetricsConfigurationCommand = exports.serializeAws_restXmlGetBucketLoggingCommand = exports.serializeAws_restXmlGetBucketLocationCommand = exports.serializeAws_restXmlGetBucketLifecycleConfigurationCommand = exports.serializeAws_restXmlGetBucketInventoryConfigurationCommand = exports.serializeAws_restXmlGetBucketIntelligentTieringConfigurationCommand = exports.serializeAws_restXmlGetBucketEncryptionCommand = exports.serializeAws_restXmlGetBucketCorsCommand = exports.serializeAws_restXmlGetBucketAnalyticsConfigurationCommand = exports.serializeAws_restXmlGetBucketAclCommand = exports.serializeAws_restXmlGetBucketAccelerateConfigurationCommand = exports.serializeAws_restXmlDeletePublicAccessBlockCommand = exports.serializeAws_restXmlDeleteObjectTaggingCommand = exports.serializeAws_restXmlDeleteObjectsCommand = exports.serializeAws_restXmlDeleteObjectCommand = exports.serializeAws_restXmlDeleteBucketWebsiteCommand = exports.serializeAws_restXmlDeleteBucketTaggingCommand = exports.serializeAws_restXmlDeleteBucketReplicationCommand = exports.serializeAws_restXmlDeleteBucketPolicyCommand = exports.serializeAws_restXmlDeleteBucketOwnershipControlsCommand = exports.serializeAws_restXmlDeleteBucketMetricsConfigurationCommand = exports.serializeAws_restXmlDeleteBucketLifecycleCommand = exports.serializeAws_restXmlDeleteBucketInventoryConfigurationCommand = exports.serializeAws_restXmlDeleteBucketIntelligentTieringConfigurationCommand = exports.serializeAws_restXmlDeleteBucketEncryptionCommand = exports.serializeAws_restXmlDeleteBucketCorsCommand = exports.serializeAws_restXmlDeleteBucketAnalyticsConfigurationCommand = exports.serializeAws_restXmlDeleteBucketCommand = exports.serializeAws_restXmlCreateMultipartUploadCommand = exports.serializeAws_restXmlCreateBucketCommand = exports.serializeAws_restXmlCopyObjectCommand = exports.serializeAws_restXmlCompleteMultipartUploadCommand = exports.serializeAws_restXmlAbortMultipartUploadCommand = void 0;
exports.deserializeAws_restXmlDeleteBucketEncryptionCommand = exports.deserializeAws_restXmlDeleteBucketCorsCommand = exports.deserializeAws_restXmlDeleteBucketAnalyticsConfigurationCommand = exports.deserializeAws_restXmlDeleteBucketCommand = exports.deserializeAws_restXmlCreateMultipartUploadCommand = exports.deserializeAws_restXmlCreateBucketCommand = exports.deserializeAws_restXmlCopyObjectCommand = exports.deserializeAws_restXmlCompleteMultipartUploadCommand = exports.deserializeAws_restXmlAbortMultipartUploadCommand = exports.serializeAws_restXmlUploadPartCopyCommand = exports.serializeAws_restXmlUploadPartCommand = exports.serializeAws_restXmlSelectObjectContentCommand = exports.serializeAws_restXmlRestoreObjectCommand = exports.serializeAws_restXmlPutPublicAccessBlockCommand = exports.serializeAws_restXmlPutObjectTaggingCommand = exports.serializeAws_restXmlPutObjectRetentionCommand = exports.serializeAws_restXmlPutObjectLockConfigurationCommand = exports.serializeAws_restXmlPutObjectLegalHoldCommand = exports.serializeAws_restXmlPutObjectAclCommand = exports.serializeAws_restXmlPutObjectCommand = exports.serializeAws_restXmlPutBucketWebsiteCommand = exports.serializeAws_restXmlPutBucketVersioningCommand = exports.serializeAws_restXmlPutBucketTaggingCommand = exports.serializeAws_restXmlPutBucketRequestPaymentCommand = exports.serializeAws_restXmlPutBucketReplicationCommand = exports.serializeAws_restXmlPutBucketPolicyCommand = exports.serializeAws_restXmlPutBucketOwnershipControlsCommand = exports.serializeAws_restXmlPutBucketNotificationConfigurationCommand = exports.serializeAws_restXmlPutBucketMetricsConfigurationCommand = exports.serializeAws_restXmlPutBucketLoggingCommand = exports.serializeAws_restXmlPutBucketLifecycleConfigurationCommand = exports.serializeAws_restXmlPutBucketInventoryConfigurationCommand = exports.serializeAws_restXmlPutBucketIntelligentTieringConfigurationCommand = exports.serializeAws_restXmlPutBucketEncryptionCommand = exports.serializeAws_restXmlPutBucketCorsCommand = exports.serializeAws_restXmlPutBucketAnalyticsConfigurationCommand = exports.serializeAws_restXmlPutBucketAclCommand = exports.serializeAws_restXmlPutBucketAccelerateConfigurationCommand = exports.serializeAws_restXmlListPartsCommand = exports.serializeAws_restXmlListObjectVersionsCommand = exports.serializeAws_restXmlListObjectsV2Command = exports.serializeAws_restXmlListObjectsCommand = exports.serializeAws_restXmlListMultipartUploadsCommand = exports.serializeAws_restXmlListBucketsCommand = exports.serializeAws_restXmlListBucketMetricsConfigurationsCommand = exports.serializeAws_restXmlListBucketInventoryConfigurationsCommand = exports.serializeAws_restXmlListBucketIntelligentTieringConfigurationsCommand = exports.serializeAws_restXmlListBucketAnalyticsConfigurationsCommand = exports.serializeAws_restXmlHeadObjectCommand = exports.serializeAws_restXmlHeadBucketCommand = void 0;
exports.deserializeAws_restXmlListObjectsCommand = exports.deserializeAws_restXmlListMultipartUploadsCommand = exports.deserializeAws_restXmlListBucketsCommand = exports.deserializeAws_restXmlListBucketMetricsConfigurationsCommand = exports.deserializeAws_restXmlListBucketInventoryConfigurationsCommand = exports.deserializeAws_restXmlListBucketIntelligentTieringConfigurationsCommand = exports.deserializeAws_restXmlListBucketAnalyticsConfigurationsCommand = exports.deserializeAws_restXmlHeadObjectCommand = exports.deserializeAws_restXmlHeadBucketCommand = exports.deserializeAws_restXmlGetPublicAccessBlockCommand = exports.deserializeAws_restXmlGetObjectTorrentCommand = exports.deserializeAws_restXmlGetObjectTaggingCommand = exports.deserializeAws_restXmlGetObjectRetentionCommand = exports.deserializeAws_restXmlGetObjectLockConfigurationCommand = exports.deserializeAws_restXmlGetObjectLegalHoldCommand = exports.deserializeAws_restXmlGetObjectAclCommand = exports.deserializeAws_restXmlGetObjectCommand = exports.deserializeAws_restXmlGetBucketWebsiteCommand = exports.deserializeAws_restXmlGetBucketVersioningCommand = exports.deserializeAws_restXmlGetBucketTaggingCommand = exports.deserializeAws_restXmlGetBucketRequestPaymentCommand = exports.deserializeAws_restXmlGetBucketReplicationCommand = exports.deserializeAws_restXmlGetBucketPolicyStatusCommand = exports.deserializeAws_restXmlGetBucketPolicyCommand = exports.deserializeAws_restXmlGetBucketOwnershipControlsCommand = exports.deserializeAws_restXmlGetBucketNotificationConfigurationCommand = exports.deserializeAws_restXmlGetBucketMetricsConfigurationCommand = exports.deserializeAws_restXmlGetBucketLoggingCommand = exports.deserializeAws_restXmlGetBucketLocationCommand = exports.deserializeAws_restXmlGetBucketLifecycleConfigurationCommand = exports.deserializeAws_restXmlGetBucketInventoryConfigurationCommand = exports.deserializeAws_restXmlGetBucketIntelligentTieringConfigurationCommand = exports.deserializeAws_restXmlGetBucketEncryptionCommand = exports.deserializeAws_restXmlGetBucketCorsCommand = exports.deserializeAws_restXmlGetBucketAnalyticsConfigurationCommand = exports.deserializeAws_restXmlGetBucketAclCommand = exports.deserializeAws_restXmlGetBucketAccelerateConfigurationCommand = exports.deserializeAws_restXmlDeletePublicAccessBlockCommand = exports.deserializeAws_restXmlDeleteObjectTaggingCommand = exports.deserializeAws_restXmlDeleteObjectsCommand = exports.deserializeAws_restXmlDeleteObjectCommand = exports.deserializeAws_restXmlDeleteBucketWebsiteCommand = exports.deserializeAws_restXmlDeleteBucketTaggingCommand = exports.deserializeAws_restXmlDeleteBucketReplicationCommand = exports.deserializeAws_restXmlDeleteBucketPolicyCommand = exports.deserializeAws_restXmlDeleteBucketOwnershipControlsCommand = exports.deserializeAws_restXmlDeleteBucketMetricsConfigurationCommand = exports.deserializeAws_restXmlDeleteBucketLifecycleCommand = exports.deserializeAws_restXmlDeleteBucketInventoryConfigurationCommand = exports.deserializeAws_restXmlDeleteBucketIntelligentTieringConfigurationCommand = void 0;
exports.deserializeAws_restXmlUploadPartCopyCommand = exports.deserializeAws_restXmlUploadPartCommand = exports.deserializeAws_restXmlSelectObjectContentCommand = exports.deserializeAws_restXmlRestoreObjectCommand = exports.deserializeAws_restXmlPutPublicAccessBlockCommand = exports.deserializeAws_restXmlPutObjectTaggingCommand = exports.deserializeAws_restXmlPutObjectRetentionCommand = exports.deserializeAws_restXmlPutObjectLockConfigurationCommand = exports.deserializeAws_restXmlPutObjectLegalHoldCommand = exports.deserializeAws_restXmlPutObjectAclCommand = exports.deserializeAws_restXmlPutObjectCommand = exports.deserializeAws_restXmlPutBucketWebsiteCommand = exports.deserializeAws_restXmlPutBucketVersioningCommand = exports.deserializeAws_restXmlPutBucketTaggingCommand = exports.deserializeAws_restXmlPutBucketRequestPaymentCommand = exports.deserializeAws_restXmlPutBucketReplicationCommand = exports.deserializeAws_restXmlPutBucketPolicyCommand = exports.deserializeAws_restXmlPutBucketOwnershipControlsCommand = exports.deserializeAws_restXmlPutBucketNotificationConfigurationCommand = exports.deserializeAws_restXmlPutBucketMetricsConfigurationCommand = exports.deserializeAws_restXmlPutBucketLoggingCommand = exports.deserializeAws_restXmlPutBucketLifecycleConfigurationCommand = exports.deserializeAws_restXmlPutBucketInventoryConfigurationCommand = exports.deserializeAws_restXmlPutBucketIntelligentTieringConfigurationCommand = exports.deserializeAws_restXmlPutBucketEncryptionCommand = exports.deserializeAws_restXmlPutBucketCorsCommand = exports.deserializeAws_restXmlPutBucketAnalyticsConfigurationCommand = exports.deserializeAws_restXmlPutBucketAclCommand = exports.deserializeAws_restXmlPutBucketAccelerateConfigurationCommand = exports.deserializeAws_restXmlListPartsCommand = exports.deserializeAws_restXmlListObjectVersionsCommand = exports.deserializeAws_restXmlListObjectsV2Command = void 0;
const models_0_1 = require("../models/models_0");
const protocol_http_1 = require("@aws-sdk/protocol-http");
const smithy_client_1 = require("@aws-sdk/smithy-client");
const xml_builder_1 = require("@aws-sdk/xml-builder");
const fast_xml_parser_1 = require("fast-xml-parser");
const serializeAws_restXmlAbortMultipartUploadCommand = async (input, context) => {
    const headers = {
        ...(isSerializableHeaderValue(input.RequestPayer) && { "x-amz-request-payer": input.RequestPayer }),
        ...(isSerializableHeaderValue(input.ExpectedBucketOwner) && {
            "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
        }),
    };
    let resolvedPath = "/{Bucket}/{Key+}";
    if (input.Bucket !== undefined) {
        const labelValue = input.Bucket;
        if (labelValue.length <= 0) {
            throw new Error("Empty value provided for input HTTP label: Bucket.");
        }
        resolvedPath = resolvedPath.replace("{Bucket}", smithy_client_1.extendedEncodeURIComponent(labelValue));
    }
    else {
        throw new Error("No value provided for input HTTP label: Bucket.");
    }
    if (input.Key !== undefined) {
        const labelValue = input.Key;
        if (labelValue.length <= 0) {
            throw new Error("Empty value provided for input HTTP label: Key.");
        }
        resolvedPath = resolvedPath.replace("{Key+}", labelValue
            .split("/")
            .map((segment) => smithy_client_1.extendedEncodeURIComponent(segment))
            .join("/"));
    }
    else {
        throw new Error("No value provided for input HTTP label: Key.");
    }
    const query = {
        "x-id": "AbortMultipartUpload",
        ...(input.UploadId !== undefined && { uploadId: input.UploadId }),
    };
    let body;
    const { hostname, protocol = "https", port } = await context.endpoint();
    return new protocol_http_1.HttpRequest({
        protocol,
        hostname,
        port,
        method: "DELETE",
        headers,
        path: resolvedPath,
        query,
        body,
    });
};
exports.serializeAws_restXmlAbortMultipartUploadCommand = serializeAws_restXmlAbortMultipartUploadCommand;
const serializeAws_restXmlCompleteMultipartUploadCommand = async (input, context) => {
    const headers = {
        "content-type": "application/xml",
        ...(isSerializableHeaderValue(input.RequestPayer) && { "x-amz-request-payer": input.RequestPayer }),
        ...(isSerializableHeaderValue(input.ExpectedBucketOwner) && {
            "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
        }),
    };
    let resolvedPath = "/{Bucket}/{Key+}";
    if (input.Bucket !== undefined) {
        const labelValue = input.Bucket;
        if (labelValue.length <= 0) {
            throw new Error("Empty value provided for input HTTP label: Bucket.");
        }
        resolvedPath = resolvedPath.replace("{Bucket}", smithy_client_1.extendedEncodeURIComponent(labelValue));
    }
    else {
        throw new Error("No value provided for input HTTP label: Bucket.");
    }
    if (input.Key !== undefined) {
        const labelValue = input.Key;
        if (labelValue.length <= 0) {
            throw new Error("Empty value provided for input HTTP label: Key.");
        }
        resolvedPath = resolvedPath.replace("{Key+}", labelValue
            .split("/")
            .map((segment) => smithy_client_1.extendedEncodeURIComponent(segment))
            .join("/"));
    }
    else {
        throw new Error("No value provided for input HTTP label: Key.");
    }
    const query = {
        ...(input.UploadId !== undefined && { uploadId: input.UploadId }),
    };
    let body;
    let contents;
    if (input.MultipartUpload !== undefined) {
        contents = serializeAws_restXmlCompletedMultipartUpload(input.MultipartUpload, context);
        body = '<?xml version="1.0" encoding="UTF-8"?>';
        contents.addAttribute("xmlns", "http://s3.amazonaws.com/doc/2006-03-01/");
        body += contents.toString();
    }
    const { hostname, protocol = "https", port } = await context.endpoint();
    return new protocol_http_1.HttpRequest({
        protocol,
        hostname,
        port,
        method: "POST",
        headers,
        path: resolvedPath,
        query,
        body,
    });
};
exports.serializeAws_restXmlCompleteMultipartUploadCommand = serializeAws_restXmlCompleteMultipartUploadCommand;
const serializeAws_restXmlCopyObjectCommand = async (input, context) => {
    const headers = {
        ...(isSerializableHeaderValue(input.ACL) && { "x-amz-acl": input.ACL }),
        ...(isSerializableHeaderValue(input.CacheControl) && { "Cache-Control": input.CacheControl }),
        ...(isSerializableHeaderValue(input.ContentDisposition) && { "Content-Disposition": input.ContentDisposition }),
        ...(isSerializableHeaderValue(input.ContentEncoding) && { "Content-Encoding": input.ContentEncoding }),
        ...(isSerializableHeaderValue(input.ContentLanguage) && { "Content-Language": input.ContentLanguage }),
        ...(isSerializableHeaderValue(input.ContentType) && { "Content-Type": input.ContentType }),
        ...(isSerializableHeaderValue(input.CopySource) && { "x-amz-copy-source": input.CopySource }),
        ...(isSerializableHeaderValue(input.CopySourceIfMatch) && {
            "x-amz-copy-source-if-match": input.CopySourceIfMatch,
        }),
        ...(isSerializableHeaderValue(input.CopySourceIfModifiedSince) && {
            "x-amz-copy-source-if-modified-since": smithy_client_1.dateToUtcString(input.CopySourceIfModifiedSince).toString(),
        }),
        ...(isSerializableHeaderValue(input.CopySourceIfNoneMatch) && {
            "x-amz-copy-source-if-none-match": input.CopySourceIfNoneMatch,
        }),
        ...(isSerializableHeaderValue(input.CopySourceIfUnmodifiedSince) && {
            "x-amz-copy-source-if-unmodified-since": smithy_client_1.dateToUtcString(input.CopySourceIfUnmodifiedSince).toString(),
        }),
        ...(isSerializableHeaderValue(input.Expires) && { Expires: smithy_client_1.dateToUtcString(input.Expires).toString() }),
        ...(isSerializableHeaderValue(input.GrantFullControl) && { "x-amz-grant-full-control": input.GrantFullControl }),
        ...(isSerializableHeaderValue(input.GrantRead) && { "x-amz-grant-read": input.GrantRead }),
        ...(isSerializableHeaderValue(input.GrantReadACP) && { "x-amz-grant-read-acp": input.GrantReadACP }),
        ...(isSerializableHeaderValue(input.GrantWriteACP) && { "x-amz-grant-write-acp": input.GrantWriteACP }),
        ...(isSerializableHeaderValue(input.MetadataDirective) && { "x-amz-metadata-directive": input.MetadataDirective }),
        ...(isSerializableHeaderValue(input.TaggingDirective) && { "x-amz-tagging-directive": input.TaggingDirective }),
        ...(isSerializableHeaderValue(input.ServerSideEncryption) && {
            "x-amz-server-side-encryption": input.ServerSideEncryption,
        }),
        ...(isSerializableHeaderValue(input.StorageClass) && { "x-amz-storage-class": input.StorageClass }),
        ...(isSerializableHeaderValue(input.WebsiteRedirectLocation) && {
            "x-amz-website-redirect-location": input.WebsiteRedirectLocation,
        }),
        ...(isSerializableHeaderValue(input.SSECustomerAlgorithm) && {
            "x-amz-server-side-encryption-customer-algorithm": input.SSECustomerAlgorithm,
        }),
        ...(isSerializableHeaderValue(input.SSECustomerKey) && {
            "x-amz-server-side-encryption-customer-key": input.SSECustomerKey,
        }),
        ...(isSerializableHeaderValue(input.SSECustomerKeyMD5) && {
            "x-amz-server-side-encryption-customer-key-MD5": input.SSECustomerKeyMD5,
        }),
        ...(isSerializableHeaderValue(input.SSEKMSKeyId) && {
            "x-amz-server-side-encryption-aws-kms-key-id": input.SSEKMSKeyId,
        }),
        ...(isSerializableHeaderValue(input.SSEKMSEncryptionContext) && {
            "x-amz-server-side-encryption-context": input.SSEKMSEncryptionContext,
        }),
        ...(isSerializableHeaderValue(input.BucketKeyEnabled) && {
            "x-amz-server-side-encryption-bucket-key-enabled": input.BucketKeyEnabled.toString(),
        }),
        ...(isSerializableHeaderValue(input.CopySourceSSECustomerAlgorithm) && {
            "x-amz-copy-source-server-side-encryption-customer-algorithm": input.CopySourceSSECustomerAlgorithm,
        }),
        ...(isSerializableHeaderValue(input.CopySourceSSECustomerKey) && {
            "x-amz-copy-source-server-side-encryption-customer-key": input.CopySourceSSECustomerKey,
        }),
        ...(isSerializableHeaderValue(input.CopySourceSSECustomerKeyMD5) && {
            "x-amz-copy-source-server-side-encryption-customer-key-MD5": input.CopySourceSSECustomerKeyMD5,
        }),
        ...(isSerializableHeaderValue(input.RequestPayer) && { "x-amz-request-payer": input.RequestPayer }),
        ...(isSerializableHeaderValue(input.Tagging) && { "x-amz-tagging": input.Tagging }),
        ...(isSerializableHeaderValue(input.ObjectLockMode) && { "x-amz-object-lock-mode": input.ObjectLockMode }),
        ...(isSerializableHeaderValue(input.ObjectLockRetainUntilDate) && {
            "x-amz-object-lock-retain-until-date": (input.ObjectLockRetainUntilDate.toISOString().split(".")[0] + "Z").toString(),
        }),
        ...(isSerializableHeaderValue(input.ObjectLockLegalHoldStatus) && {
            "x-amz-object-lock-legal-hold": input.ObjectLockLegalHoldStatus,
        }),
        ...(isSerializableHeaderValue(input.ExpectedBucketOwner) && {
            "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
        }),
        ...(isSerializableHeaderValue(input.ExpectedSourceBucketOwner) && {
            "x-amz-source-expected-bucket-owner": input.ExpectedSourceBucketOwner,
        }),
        ...(input.Metadata !== undefined &&
            Object.keys(input.Metadata).reduce((acc, suffix) => {
                acc["x-amz-meta-" + suffix] = input.Metadata[suffix];
                return acc;
            }, {})),
    };
    let resolvedPath = "/{Bucket}/{Key+}";
    if (input.Bucket !== undefined) {
        const labelValue = input.Bucket;
        if (labelValue.length <= 0) {
            throw new Error("Empty value provided for input HTTP label: Bucket.");
        }
        resolvedPath = resolvedPath.replace("{Bucket}", smithy_client_1.extendedEncodeURIComponent(labelValue));
    }
    else {
        throw new Error("No value provided for input HTTP label: Bucket.");
    }
    if (input.Key !== undefined) {
        const labelValue = input.Key;
        if (labelValue.length <= 0) {
            throw new Error("Empty value provided for input HTTP label: Key.");
        }
        resolvedPath = resolvedPath.replace("{Key+}", labelValue
            .split("/")
            .map((segment) => smithy_client_1.extendedEncodeURIComponent(segment))
            .join("/"));
    }
    else {
        throw new Error("No value provided for input HTTP label: Key.");
    }
    const query = {
        "x-id": "CopyObject",
    };
    let body;
    const { hostname, protocol = "https", port } = await context.endpoint();
    return new protocol_http_1.HttpRequest({
        protocol,
        hostname,
        port,
        method: "PUT",
        headers,
        path: resolvedPath,
        query,
        body,
    });
};
exports.serializeAws_restXmlCopyObjectCommand = serializeAws_restXmlCopyObjectCommand;
const serializeAws_restXmlCreateBucketCommand = async (input, context) => {
    const headers = {
        "content-type": "application/xml",
        ...(isSerializableHeaderValue(input.ACL) && { "x-amz-acl": input.ACL }),
        ...(isSerializableHeaderValue(input.GrantFullControl) && { "x-amz-grant-full-control": input.GrantFullControl }),
        ...(isSerializableHeaderValue(input.GrantRead) && { "x-amz-grant-read": input.GrantRead }),
        ...(isSerializableHeaderValue(input.GrantReadACP) && { "x-amz-grant-read-acp": input.GrantReadACP }),
        ...(isSerializableHeaderValue(input.GrantWrite) && { "x-amz-grant-write": input.GrantWrite }),
        ...(isSerializableHeaderValue(input.GrantWriteACP) && { "x-amz-grant-write-acp": input.GrantWriteACP }),
        ...(isSerializableHeaderValue(input.ObjectLockEnabledForBucket) && {
            "x-amz-bucket-object-lock-enabled": input.ObjectLockEnabledForBucket.toString(),
        }),
    };
    let resolvedPath = "/{Bucket}";
    if (input.Bucket !== undefined) {
        const labelValue = input.Bucket;
        if (labelValue.length <= 0) {
            throw new Error("Empty value provided for input HTTP label: Bucket.");
        }
        resolvedPath = resolvedPath.replace("{Bucket}", smithy_client_1.extendedEncodeURIComponent(labelValue));
    }
    else {
        throw new Error("No value provided for input HTTP label: Bucket.");
    }
    let body;
    let contents;
    if (input.CreateBucketConfiguration !== undefined) {
        contents = serializeAws_restXmlCreateBucketConfiguration(input.CreateBucketConfiguration, context);
        body = '<?xml version="1.0" encoding="UTF-8"?>';
        contents.addAttribute("xmlns", "http://s3.amazonaws.com/doc/2006-03-01/");
        body += contents.toString();
    }
    const { hostname, protocol = "https", port } = await context.endpoint();
    return new protocol_http_1.HttpRequest({
        protocol,
        hostname,
        port,
        method: "PUT",
        headers,
        path: resolvedPath,
        body,
    });
};
exports.serializeAws_restXmlCreateBucketCommand = serializeAws_restXmlCreateBucketCommand;
const serializeAws_restXmlCreateMultipartUploadCommand = async (input, context) => {
    const headers = {
        ...(isSerializableHeaderValue(input.ACL) && { "x-amz-acl": input.ACL }),
        ...(isSerializableHeaderValue(input.CacheControl) && { "Cache-Control": input.CacheControl }),
        ...(isSerializableHeaderValue(input.ContentDisposition) && { "Content-Disposition": input.ContentDisposition }),
        ...(isSerializableHeaderValue(input.ContentEncoding) && { "Content-Encoding": input.ContentEncoding }),
        ...(isSerializableHeaderValue(input.ContentLanguage) && { "Content-Language": input.ContentLanguage }),
        ...(isSerializableHeaderValue(input.ContentType) && { "Content-Type": input.ContentType }),
        ...(isSerializableHeaderValue(input.Expires) && { Expires: smithy_client_1.dateToUtcString(input.Expires).toString() }),
        ...(isSerializableHeaderValue(input.GrantFullControl) && { "x-amz-grant-full-control": input.GrantFullControl }),
        ...(isSerializableHeaderValue(input.GrantRead) && { "x-amz-grant-read": input.GrantRead }),
        ...(isSerializableHeaderValue(input.GrantReadACP) && { "x-amz-grant-read-acp": input.GrantReadACP }),
        ...(isSerializableHeaderValue(input.GrantWriteACP) && { "x-amz-grant-write-acp": input.GrantWriteACP }),
        ...(isSerializableHeaderValue(input.ServerSideEncryption) && {
            "x-amz-server-side-encryption": input.ServerSideEncryption,
        }),
        ...(isSerializableHeaderValue(input.StorageClass) && { "x-amz-storage-class": input.StorageClass }),
        ...(isSerializableHeaderValue(input.WebsiteRedirectLocation) && {
            "x-amz-website-redirect-location": input.WebsiteRedirectLocation,
        }),
        ...(isSerializableHeaderValue(input.SSECustomerAlgorithm) && {
            "x-amz-server-side-encryption-customer-algorithm": input.SSECustomerAlgorithm,
        }),
        ...(isSerializableHeaderValue(input.SSECustomerKey) && {
            "x-amz-server-side-encryption-customer-key": input.SSECustomerKey,
        }),
        ...(isSerializableHeaderValue(input.SSECustomerKeyMD5) && {
            "x-amz-server-side-encryption-customer-key-MD5": input.SSECustomerKeyMD5,
        }),
        ...(isSerializableHeaderValue(input.SSEKMSKeyId) && {
            "x-amz-server-side-encryption-aws-kms-key-id": input.SSEKMSKeyId,
        }),
        ...(isSerializableHeaderValue(input.SSEKMSEncryptionContext) && {
            "x-amz-server-side-encryption-context": input.SSEKMSEncryptionContext,
        }),
        ...(isSerializableHeaderValue(input.BucketKeyEnabled) && {
            "x-amz-server-side-encryption-bucket-key-enabled": input.BucketKeyEnabled.toString(),
        }),
        ...(isSerializableHeaderValue(input.RequestPayer) && { "x-amz-request-payer": input.RequestPayer }),
        ...(isSerializableHeaderValue(input.Tagging) && { "x-amz-tagging": input.Tagging }),
        ...(isSerializableHeaderValue(input.ObjectLockMode) && { "x-amz-object-lock-mode": input.ObjectLockMode }),
        ...(isSerializableHeaderValue(input.ObjectLockRetainUntilDate) && {
            "x-amz-object-lock-retain-until-date": (input.ObjectLockRetainUntilDate.toISOString().split(".")[0] + "Z").toString(),
        }),
        ...(isSerializableHeaderValue(input.ObjectLockLegalHoldStatus) && {
            "x-amz-object-lock-legal-hold": input.ObjectLockLegalHoldStatus,
        }),
        ...(isSerializableHeaderValue(input.ExpectedBucketOwner) && {
            "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
        }),
        ...(input.Metadata !== undefined &&
            Object.keys(input.Metadata).reduce((acc, suffix) => {
                acc["x-amz-meta-" + suffix] = input.Metadata[suffix];
                return acc;
            }, {})),
    };
    let resolvedPath = "/{Bucket}/{Key+}";
    if (input.Bucket !== undefined) {
        const labelValue = input.Bucket;
        if (labelValue.length <= 0) {
            throw new Error("Empty value provided for input HTTP label: Bucket.");
        }
        resolvedPath = resolvedPath.replace("{Bucket}", smithy_client_1.extendedEncodeURIComponent(labelValue));
    }
    else {
        throw new Error("No value provided for input HTTP label: Bucket.");
    }
    if (input.Key !== undefined) {
        const labelValue = input.Key;
        if (labelValue.length <= 0) {
            throw new Error("Empty value provided for input HTTP label: Key.");
        }
        resolvedPath = resolvedPath.replace("{Key+}", labelValue
            .split("/")
            .map((segment) => smithy_client_1.extendedEncodeURIComponent(segment))
            .join("/"));
    }
    else {
        throw new Error("No value provided for input HTTP label: Key.");
    }
    const query = {
        uploads: "",
    };
    let body;
    const { hostname, protocol = "https", port } = await context.endpoint();
    return new protocol_http_1.HttpRequest({
        protocol,
        hostname,
        port,
        method: "POST",
        headers,
        path: resolvedPath,
        query,
        body,
    });
};
exports.serializeAws_restXmlCreateMultipartUploadCommand = serializeAws_restXmlCreateMultipartUploadCommand;
const serializeAws_restXmlDeleteBucketCommand = async (input, context) => {
    const headers = {
        ...(isSerializableHeaderValue(input.ExpectedBucketOwner) && {
            "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
        }),
    };
    let resolvedPath = "/{Bucket}";
    if (input.Bucket !== undefined) {
        const labelValue = input.Bucket;
        if (labelValue.length <= 0) {
            throw new Error("Empty value provided for input HTTP label: Bucket.");
        }
        resolvedPath = resolvedPath.replace("{Bucket}", smithy_client_1.extendedEncodeURIComponent(labelValue));
    }
    else {
        throw new Error("No value provided for input HTTP label: Bucket.");
    }
    let body;
    const { hostname, protocol = "https", port } = await context.endpoint();
    return new protocol_http_1.HttpRequest({
        protocol,
        hostname,
        port,
        method: "DELETE",
        headers,
        path: resolvedPath,
        body,
    });
};
exports.serializeAws_restXmlDeleteBucketCommand = serializeAws_restXmlDeleteBucketCommand;
const serializeAws_restXmlDeleteBucketAnalyticsConfigurationCommand = async (input, context) => {
    const headers = {
        ...(isSerializableHeaderValue(input.ExpectedBucketOwner) && {
            "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
        }),
    };
    let resolvedPath = "/{Bucket}";
    if (input.Bucket !== undefined) {
        const labelValue = input.Bucket;
        if (labelValue.length <= 0) {
            throw new Error("Empty value provided for input HTTP label: Bucket.");
        }
        resolvedPath = resolvedPath.replace("{Bucket}", smithy_client_1.extendedEncodeURIComponent(labelValue));
    }
    else {
        throw new Error("No value provided for input HTTP label: Bucket.");
    }
    const query = {
        analytics: "",
        ...(input.Id !== undefined && { id: input.Id }),
    };
    let body;
    const { hostname, protocol = "https", port } = await context.endpoint();
    return new protocol_http_1.HttpRequest({
        protocol,
        hostname,
        port,
        method: "DELETE",
        headers,
        path: resolvedPath,
        query,
        body,
    });
};
exports.serializeAws_restXmlDeleteBucketAnalyticsConfigurationCommand = serializeAws_restXmlDeleteBucketAnalyticsConfigurationCommand;
const serializeAws_restXmlDeleteBucketCorsCommand = async (input, context) => {
    const headers = {
        ...(isSerializableHeaderValue(input.ExpectedBucketOwner) && {
            "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
        }),
    };
    let resolvedPath = "/{Bucket}";
    if (input.Bucket !== undefined) {
        const labelValue = input.Bucket;
        if (labelValue.length <= 0) {
            throw new Error("Empty value provided for input HTTP label: Bucket.");
        }
        resolvedPath = resolvedPath.replace("{Bucket}", smithy_client_1.extendedEncodeURIComponent(labelValue));
    }
    else {
        throw new Error("No value provided for input HTTP label: Bucket.");
    }
    const query = {
        cors: "",
    };
    let body;
    const { hostname, protocol = "https", port } = await context.endpoint();
    return new protocol_http_1.HttpRequest({
        protocol,
        hostname,
        port,
        method: "DELETE",
        headers,
        path: resolvedPath,
        query,
        body,
    });
};
exports.serializeAws_restXmlDeleteBucketCorsCommand = serializeAws_restXmlDeleteBucketCorsCommand;
const serializeAws_restXmlDeleteBucketEncryptionCommand = async (input, context) => {
    const headers = {
        ...(isSerializableHeaderValue(input.ExpectedBucketOwner) && {
            "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
        }),
    };
    let resolvedPath = "/{Bucket}";
    if (input.Bucket !== undefined) {
        const labelValue = input.Bucket;
        if (labelValue.length <= 0) {
            throw new Error("Empty value provided for input HTTP label: Bucket.");
        }
        resolvedPath = resolvedPath.replace("{Bucket}", smithy_client_1.extendedEncodeURIComponent(labelValue));
    }
    else {
        throw new Error("No value provided for input HTTP label: Bucket.");
    }
    const query = {
        encryption: "",
    };
    let body;
    const { hostname, protocol = "https", port } = await context.endpoint();
    return new protocol_http_1.HttpRequest({
        protocol,
        hostname,
        port,
        method: "DELETE",
        headers,
        path: resolvedPath,
        query,
        body,
    });
};
exports.serializeAws_restXmlDeleteBucketEncryptionCommand = serializeAws_restXmlDeleteBucketEncryptionCommand;
const serializeAws_restXmlDeleteBucketIntelligentTieringConfigurationCommand = async (input, context) => {
    const headers = {};
    let resolvedPath = "/{Bucket}";
    if (input.Bucket !== undefined) {
        const labelValue = input.Bucket;
        if (labelValue.length <= 0) {
            throw new Error("Empty value provided for input HTTP label: Bucket.");
        }
        resolvedPath = resolvedPath.replace("{Bucket}", smithy_client_1.extendedEncodeURIComponent(labelValue));
    }
    else {
        throw new Error("No value provided for input HTTP label: Bucket.");
    }
    const query = {
        "intelligent-tiering": "",
        ...(input.Id !== undefined && { id: input.Id }),
    };
    let body;
    const { hostname, protocol = "https", port } = await context.endpoint();
    return new protocol_http_1.HttpRequest({
        protocol,
        hostname,
        port,
        method: "DELETE",
        headers,
        path: resolvedPath,
        query,
        body,
    });
};
exports.serializeAws_restXmlDeleteBucketIntelligentTieringConfigurationCommand = serializeAws_restXmlDeleteBucketIntelligentTieringConfigurationCommand;
const serializeAws_restXmlDeleteBucketInventoryConfigurationCommand = async (input, context) => {
    const headers = {
        ...(isSerializableHeaderValue(input.ExpectedBucketOwner) && {
            "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
        }),
    };
    let resolvedPath = "/{Bucket}";
    if (input.Bucket !== undefined) {
        const labelValue = input.Bucket;
        if (labelValue.length <= 0) {
            throw new Error("Empty value provided for input HTTP label: Bucket.");
        }
        resolvedPath = resolvedPath.replace("{Bucket}", smithy_client_1.extendedEncodeURIComponent(labelValue));
    }
    else {
        throw new Error("No value provided for input HTTP label: Bucket.");
    }
    const query = {
        inventory: "",
        ...(input.Id !== undefined && { id: input.Id }),
    };
    let body;
    const { hostname, protocol = "https", port } = await context.endpoint();
    return new protocol_http_1.HttpRequest({
        protocol,
        hostname,
        port,
        method: "DELETE",
        headers,
        path: resolvedPath,
        query,
        body,
    });
};
exports.serializeAws_restXmlDeleteBucketInventoryConfigurationCommand = serializeAws_restXmlDeleteBucketInventoryConfigurationCommand;
const serializeAws_restXmlDeleteBucketLifecycleCommand = async (input, context) => {
    const headers = {
        ...(isSerializableHeaderValue(input.ExpectedBucketOwner) && {
            "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
        }),
    };
    let resolvedPath = "/{Bucket}";
    if (input.Bucket !== undefined) {
        const labelValue = input.Bucket;
        if (labelValue.length <= 0) {
            throw new Error("Empty value provided for input HTTP label: Bucket.");
        }
        resolvedPath = resolvedPath.replace("{Bucket}", smithy_client_1.extendedEncodeURIComponent(labelValue));
    }
    else {
        throw new Error("No value provided for input HTTP label: Bucket.");
    }
    const query = {
        lifecycle: "",
    };
    let body;
    const { hostname, protocol = "https", port } = await context.endpoint();
    return new protocol_http_1.HttpRequest({
        protocol,
        hostname,
        port,
        method: "DELETE",
        headers,
        path: resolvedPath,
        query,
        body,
    });
};
exports.serializeAws_restXmlDeleteBucketLifecycleCommand = serializeAws_restXmlDeleteBucketLifecycleCommand;
const serializeAws_restXmlDeleteBucketMetricsConfigurationCommand = async (input, context) => {
    const headers = {
        ...(isSerializableHeaderValue(input.ExpectedBucketOwner) && {
            "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
        }),
    };
    let resolvedPath = "/{Bucket}";
    if (input.Bucket !== undefined) {
        const labelValue = input.Bucket;
        if (labelValue.length <= 0) {
            throw new Error("Empty value provided for input HTTP label: Bucket.");
        }
        resolvedPath = resolvedPath.replace("{Bucket}", smithy_client_1.extendedEncodeURIComponent(labelValue));
    }
    else {
        throw new Error("No value provided for input HTTP label: Bucket.");
    }
    const query = {
        metrics: "",
        ...(input.Id !== undefined && { id: input.Id }),
    };
    let body;
    const { hostname, protocol = "https", port } = await context.endpoint();
    return new protocol_http_1.HttpRequest({
        protocol,
        hostname,
        port,
        method: "DELETE",
        headers,
        path: resolvedPath,
        query,
        body,
    });
};
exports.serializeAws_restXmlDeleteBucketMetricsConfigurationCommand = serializeAws_restXmlDeleteBucketMetricsConfigurationCommand;
const serializeAws_restXmlDeleteBucketOwnershipControlsCommand = async (input, context) => {
    const headers = {
        ...(isSerializableHeaderValue(input.ExpectedBucketOwner) && {
            "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
        }),
    };
    let resolvedPath = "/{Bucket}";
    if (input.Bucket !== undefined) {
        const labelValue = input.Bucket;
        if (labelValue.length <= 0) {
            throw new Error("Empty value provided for input HTTP label: Bucket.");
        }
        resolvedPath = resolvedPath.replace("{Bucket}", smithy_client_1.extendedEncodeURIComponent(labelValue));
    }
    else {
        throw new Error("No value provided for input HTTP label: Bucket.");
    }
    const query = {
        ownershipControls: "",
    };
    let body;
    const { hostname, protocol = "https", port } = await context.endpoint();
    return new protocol_http_1.HttpRequest({
        protocol,
        hostname,
        port,
        method: "DELETE",
        headers,
        path: resolvedPath,
        query,
        body,
    });
};
exports.serializeAws_restXmlDeleteBucketOwnershipControlsCommand = serializeAws_restXmlDeleteBucketOwnershipControlsCommand;
const serializeAws_restXmlDeleteBucketPolicyCommand = async (input, context) => {
    const headers = {
        ...(isSerializableHeaderValue(input.ExpectedBucketOwner) && {
            "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
        }),
    };
    let resolvedPath = "/{Bucket}";
    if (input.Bucket !== undefined) {
        const labelValue = input.Bucket;
        if (labelValue.length <= 0) {
            throw new Error("Empty value provided for input HTTP label: Bucket.");
        }
        resolvedPath = resolvedPath.replace("{Bucket}", smithy_client_1.extendedEncodeURIComponent(labelValue));
    }
    else {
        throw new Error("No value provided for input HTTP label: Bucket.");
    }
    const query = {
        policy: "",
    };
    let body;
    const { hostname, protocol = "https", port } = await context.endpoint();
    return new protocol_http_1.HttpRequest({
        protocol,
        hostname,
        port,
        method: "DELETE",
        headers,
        path: resolvedPath,
        query,
        body,
    });
};
exports.serializeAws_restXmlDeleteBucketPolicyCommand = serializeAws_restXmlDeleteBucketPolicyCommand;
const serializeAws_restXmlDeleteBucketReplicationCommand = async (input, context) => {
    const headers = {
        ...(isSerializableHeaderValue(input.ExpectedBucketOwner) && {
            "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
        }),
    };
    let resolvedPath = "/{Bucket}";
    if (input.Bucket !== undefined) {
        const labelValue = input.Bucket;
        if (labelValue.length <= 0) {
            throw new Error("Empty value provided for input HTTP label: Bucket.");
        }
        resolvedPath = resolvedPath.replace("{Bucket}", smithy_client_1.extendedEncodeURIComponent(labelValue));
    }
    else {
        throw new Error("No value provided for input HTTP label: Bucket.");
    }
    const query = {
        replication: "",
    };
    let body;
    const { hostname, protocol = "https", port } = await context.endpoint();
    return new protocol_http_1.HttpRequest({
        protocol,
        hostname,
        port,
        method: "DELETE",
        headers,
        path: resolvedPath,
        query,
        body,
    });
};
exports.serializeAws_restXmlDeleteBucketReplicationCommand = serializeAws_restXmlDeleteBucketReplicationCommand;
const serializeAws_restXmlDeleteBucketTaggingCommand = async (input, context) => {
    const headers = {
        ...(isSerializableHeaderValue(input.ExpectedBucketOwner) && {
            "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
        }),
    };
    let resolvedPath = "/{Bucket}";
    if (input.Bucket !== undefined) {
        const labelValue = input.Bucket;
        if (labelValue.length <= 0) {
            throw new Error("Empty value provided for input HTTP label: Bucket.");
        }
        resolvedPath = resolvedPath.replace("{Bucket}", smithy_client_1.extendedEncodeURIComponent(labelValue));
    }
    else {
        throw new Error("No value provided for input HTTP label: Bucket.");
    }
    const query = {
        tagging: "",
    };
    let body;
    const { hostname, protocol = "https", port } = await context.endpoint();
    return new protocol_http_1.HttpRequest({
        protocol,
        hostname,
        port,
        method: "DELETE",
        headers,
        path: resolvedPath,
        query,
        body,
    });
};
exports.serializeAws_restXmlDeleteBucketTaggingCommand = serializeAws_restXmlDeleteBucketTaggingCommand;
const serializeAws_restXmlDeleteBucketWebsiteCommand = async (input, context) => {
    const headers = {
        ...(isSerializableHeaderValue(input.ExpectedBucketOwner) && {
            "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
        }),
    };
    let resolvedPath = "/{Bucket}";
    if (input.Bucket !== undefined) {
        const labelValue = input.Bucket;
        if (labelValue.length <= 0) {
            throw new Error("Empty value provided for input HTTP label: Bucket.");
        }
        resolvedPath = resolvedPath.replace("{Bucket}", smithy_client_1.extendedEncodeURIComponent(labelValue));
    }
    else {
        throw new Error("No value provided for input HTTP label: Bucket.");
    }
    const query = {
        website: "",
    };
    let body;
    const { hostname, protocol = "https", port } = await context.endpoint();
    return new protocol_http_1.HttpRequest({
        protocol,
        hostname,
        port,
        method: "DELETE",
        headers,
        path: resolvedPath,
        query,
        body,
    });
};
exports.serializeAws_restXmlDeleteBucketWebsiteCommand = serializeAws_restXmlDeleteBucketWebsiteCommand;
const serializeAws_restXmlDeleteObjectCommand = async (input, context) => {
    const headers = {
        ...(isSerializableHeaderValue(input.MFA) && { "x-amz-mfa": input.MFA }),
        ...(isSerializableHeaderValue(input.RequestPayer) && { "x-amz-request-payer": input.RequestPayer }),
        ...(isSerializableHeaderValue(input.BypassGovernanceRetention) && {
            "x-amz-bypass-governance-retention": input.BypassGovernanceRetention.toString(),
        }),
        ...(isSerializableHeaderValue(input.ExpectedBucketOwner) && {
            "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
        }),
    };
    let resolvedPath = "/{Bucket}/{Key+}";
    if (input.Bucket !== undefined) {
        const labelValue = input.Bucket;
        if (labelValue.length <= 0) {
            throw new Error("Empty value provided for input HTTP label: Bucket.");
        }
        resolvedPath = resolvedPath.replace("{Bucket}", smithy_client_1.extendedEncodeURIComponent(labelValue));
    }
    else {
        throw new Error("No value provided for input HTTP label: Bucket.");
    }
    if (input.Key !== undefined) {
        const labelValue = input.Key;
        if (labelValue.length <= 0) {
            throw new Error("Empty value provided for input HTTP label: Key.");
        }
        resolvedPath = resolvedPath.replace("{Key+}", labelValue
            .split("/")
            .map((segment) => smithy_client_1.extendedEncodeURIComponent(segment))
            .join("/"));
    }
    else {
        throw new Error("No value provided for input HTTP label: Key.");
    }
    const query = {
        "x-id": "DeleteObject",
        ...(input.VersionId !== undefined && { versionId: input.VersionId }),
    };
    let body;
    const { hostname, protocol = "https", port } = await context.endpoint();
    return new protocol_http_1.HttpRequest({
        protocol,
        hostname,
        port,
        method: "DELETE",
        headers,
        path: resolvedPath,
        query,
        body,
    });
};
exports.serializeAws_restXmlDeleteObjectCommand = serializeAws_restXmlDeleteObjectCommand;
const serializeAws_restXmlDeleteObjectsCommand = async (input, context) => {
    const headers = {
        "content-type": "application/xml",
        ...(isSerializableHeaderValue(input.MFA) && { "x-amz-mfa": input.MFA }),
        ...(isSerializableHeaderValue(input.RequestPayer) && { "x-amz-request-payer": input.RequestPayer }),
        ...(isSerializableHeaderValue(input.BypassGovernanceRetention) && {
            "x-amz-bypass-governance-retention": input.BypassGovernanceRetention.toString(),
        }),
        ...(isSerializableHeaderValue(input.ExpectedBucketOwner) && {
            "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
        }),
    };
    let resolvedPath = "/{Bucket}";
    if (input.Bucket !== undefined) {
        const labelValue = input.Bucket;
        if (labelValue.length <= 0) {
            throw new Error("Empty value provided for input HTTP label: Bucket.");
        }
        resolvedPath = resolvedPath.replace("{Bucket}", smithy_client_1.extendedEncodeURIComponent(labelValue));
    }
    else {
        throw new Error("No value provided for input HTTP label: Bucket.");
    }
    const query = {
        delete: "",
    };
    let body;
    let contents;
    if (input.Delete !== undefined) {
        contents = serializeAws_restXmlDelete(input.Delete, context);
        body = '<?xml version="1.0" encoding="UTF-8"?>';
        contents.addAttribute("xmlns", "http://s3.amazonaws.com/doc/2006-03-01/");
        body += contents.toString();
    }
    const { hostname, protocol = "https", port } = await context.endpoint();
    return new protocol_http_1.HttpRequest({
        protocol,
        hostname,
        port,
        method: "POST",
        headers,
        path: resolvedPath,
        query,
        body,
    });
};
exports.serializeAws_restXmlDeleteObjectsCommand = serializeAws_restXmlDeleteObjectsCommand;
const serializeAws_restXmlDeleteObjectTaggingCommand = async (input, context) => {
    const headers = {
        ...(isSerializableHeaderValue(input.ExpectedBucketOwner) && {
            "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
        }),
    };
    let resolvedPath = "/{Bucket}/{Key+}";
    if (input.Bucket !== undefined) {
        const labelValue = input.Bucket;
        if (labelValue.length <= 0) {
            throw new Error("Empty value provided for input HTTP label: Bucket.");
        }
        resolvedPath = resolvedPath.replace("{Bucket}", smithy_client_1.extendedEncodeURIComponent(labelValue));
    }
    else {
        throw new Error("No value provided for input HTTP label: Bucket.");
    }
    if (input.Key !== undefined) {
        const labelValue = input.Key;
        if (labelValue.length <= 0) {
            throw new Error("Empty value provided for input HTTP label: Key.");
        }
        resolvedPath = resolvedPath.replace("{Key+}", labelValue
            .split("/")
            .map((segment) => smithy_client_1.extendedEncodeURIComponent(segment))
            .join("/"));
    }
    else {
        throw new Error("No value provided for input HTTP label: Key.");
    }
    const query = {
        tagging: "",
        ...(input.VersionId !== undefined && { versionId: input.VersionId }),
    };
    let body;
    const { hostname, protocol = "https", port } = await context.endpoint();
    return new protocol_http_1.HttpRequest({
        protocol,
        hostname,
        port,
        method: "DELETE",
        headers,
        path: resolvedPath,
        query,
        body,
    });
};
exports.serializeAws_restXmlDeleteObjectTaggingCommand = serializeAws_restXmlDeleteObjectTaggingCommand;
const serializeAws_restXmlDeletePublicAccessBlockCommand = async (input, context) => {
    const headers = {
        ...(isSerializableHeaderValue(input.ExpectedBucketOwner) && {
            "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
        }),
    };
    let resolvedPath = "/{Bucket}";
    if (input.Bucket !== undefined) {
        const labelValue = input.Bucket;
        if (labelValue.length <= 0) {
            throw new Error("Empty value provided for input HTTP label: Bucket.");
        }
        resolvedPath = resolvedPath.replace("{Bucket}", smithy_client_1.extendedEncodeURIComponent(labelValue));
    }
    else {
        throw new Error("No value provided for input HTTP label: Bucket.");
    }
    const query = {
        publicAccessBlock: "",
    };
    let body;
    const { hostname, protocol = "https", port } = await context.endpoint();
    return new protocol_http_1.HttpRequest({
        protocol,
        hostname,
        port,
        method: "DELETE",
        headers,
        path: resolvedPath,
        query,
        body,
    });
};
exports.serializeAws_restXmlDeletePublicAccessBlockCommand = serializeAws_restXmlDeletePublicAccessBlockCommand;
const serializeAws_restXmlGetBucketAccelerateConfigurationCommand = async (input, context) => {
    const headers = {
        ...(isSerializableHeaderValue(input.ExpectedBucketOwner) && {
            "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
        }),
    };
    let resolvedPath = "/{Bucket}";
    if (input.Bucket !== undefined) {
        const labelValue = input.Bucket;
        if (labelValue.length <= 0) {
            throw new Error("Empty value provided for input HTTP label: Bucket.");
        }
        resolvedPath = resolvedPath.replace("{Bucket}", smithy_client_1.extendedEncodeURIComponent(labelValue));
    }
    else {
        throw new Error("No value provided for input HTTP label: Bucket.");
    }
    const query = {
        accelerate: "",
    };
    let body;
    const { hostname, protocol = "https", port } = await context.endpoint();
    return new protocol_http_1.HttpRequest({
        protocol,
        hostname,
        port,
        method: "GET",
        headers,
        path: resolvedPath,
        query,
        body,
    });
};
exports.serializeAws_restXmlGetBucketAccelerateConfigurationCommand = serializeAws_restXmlGetBucketAccelerateConfigurationCommand;
const serializeAws_restXmlGetBucketAclCommand = async (input, context) => {
    const headers = {
        ...(isSerializableHeaderValue(input.ExpectedBucketOwner) && {
            "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
        }),
    };
    let resolvedPath = "/{Bucket}";
    if (input.Bucket !== undefined) {
        const labelValue = input.Bucket;
        if (labelValue.length <= 0) {
            throw new Error("Empty value provided for input HTTP label: Bucket.");
        }
        resolvedPath = resolvedPath.replace("{Bucket}", smithy_client_1.extendedEncodeURIComponent(labelValue));
    }
    else {
        throw new Error("No value provided for input HTTP label: Bucket.");
    }
    const query = {
        acl: "",
    };
    let body;
    const { hostname, protocol = "https", port } = await context.endpoint();
    return new protocol_http_1.HttpRequest({
        protocol,
        hostname,
        port,
        method: "GET",
        headers,
        path: resolvedPath,
        query,
        body,
    });
};
exports.serializeAws_restXmlGetBucketAclCommand = serializeAws_restXmlGetBucketAclCommand;
const serializeAws_restXmlGetBucketAnalyticsConfigurationCommand = async (input, context) => {
    const headers = {
        ...(isSerializableHeaderValue(input.ExpectedBucketOwner) && {
            "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
        }),
    };
    let resolvedPath = "/{Bucket}";
    if (input.Bucket !== undefined) {
        const labelValue = input.Bucket;
        if (labelValue.length <= 0) {
            throw new Error("Empty value provided for input HTTP label: Bucket.");
        }
        resolvedPath = resolvedPath.replace("{Bucket}", smithy_client_1.extendedEncodeURIComponent(labelValue));
    }
    else {
        throw new Error("No value provided for input HTTP label: Bucket.");
    }
    const query = {
        analytics: "",
        "x-id": "GetBucketAnalyticsConfiguration",
        ...(input.Id !== undefined && { id: input.Id }),
    };
    let body;
    const { hostname, protocol = "https", port } = await context.endpoint();
    return new protocol_http_1.HttpRequest({
        protocol,
        hostname,
        port,
        method: "GET",
        headers,
        path: resolvedPath,
        query,
        body,
    });
};
exports.serializeAws_restXmlGetBucketAnalyticsConfigurationCommand = serializeAws_restXmlGetBucketAnalyticsConfigurationCommand;
const serializeAws_restXmlGetBucketCorsCommand = async (input, context) => {
    const headers = {
        ...(isSerializableHeaderValue(input.ExpectedBucketOwner) && {
            "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
        }),
    };
    let resolvedPath = "/{Bucket}";
    if (input.Bucket !== undefined) {
        const labelValue = input.Bucket;
        if (labelValue.length <= 0) {
            throw new Error("Empty value provided for input HTTP label: Bucket.");
        }
        resolvedPath = resolvedPath.replace("{Bucket}", smithy_client_1.extendedEncodeURIComponent(labelValue));
    }
    else {
        throw new Error("No value provided for input HTTP label: Bucket.");
    }
    const query = {
        cors: "",
    };
    let body;
    const { hostname, protocol = "https", port } = await context.endpoint();
    return new protocol_http_1.HttpRequest({
        protocol,
        hostname,
        port,
        method: "GET",
        headers,
        path: resolvedPath,
        query,
        body,
    });
};
exports.serializeAws_restXmlGetBucketCorsCommand = serializeAws_restXmlGetBucketCorsCommand;
const serializeAws_restXmlGetBucketEncryptionCommand = async (input, context) => {
    const headers = {
        ...(isSerializableHeaderValue(input.ExpectedBucketOwner) && {
            "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
        }),
    };
    let resolvedPath = "/{Bucket}";
    if (input.Bucket !== undefined) {
        const labelValue = input.Bucket;
        if (labelValue.length <= 0) {
            throw new Error("Empty value provided for input HTTP label: Bucket.");
        }
        resolvedPath = resolvedPath.replace("{Bucket}", smithy_client_1.extendedEncodeURIComponent(labelValue));
    }
    else {
        throw new Error("No value provided for input HTTP label: Bucket.");
    }
    const query = {
        encryption: "",
    };
    let body;
    const { hostname, protocol = "https", port } = await context.endpoint();
    return new protocol_http_1.HttpRequest({
        protocol,
        hostname,
        port,
        method: "GET",
        headers,
        path: resolvedPath,
        query,
        body,
    });
};
exports.serializeAws_restXmlGetBucketEncryptionCommand = serializeAws_restXmlGetBucketEncryptionCommand;
const serializeAws_restXmlGetBucketIntelligentTieringConfigurationCommand = async (input, context) => {
    const headers = {};
    let resolvedPath = "/{Bucket}";
    if (input.Bucket !== undefined) {
        const labelValue = input.Bucket;
        if (labelValue.length <= 0) {
            throw new Error("Empty value provided for input HTTP label: Bucket.");
        }
        resolvedPath = resolvedPath.replace("{Bucket}", smithy_client_1.extendedEncodeURIComponent(labelValue));
    }
    else {
        throw new Error("No value provided for input HTTP label: Bucket.");
    }
    const query = {
        "intelligent-tiering": "",
        "x-id": "GetBucketIntelligentTieringConfiguration",
        ...(input.Id !== undefined && { id: input.Id }),
    };
    let body;
    const { hostname, protocol = "https", port } = await context.endpoint();
    return new protocol_http_1.HttpRequest({
        protocol,
        hostname,
        port,
        method: "GET",
        headers,
        path: resolvedPath,
        query,
        body,
    });
};
exports.serializeAws_restXmlGetBucketIntelligentTieringConfigurationCommand = serializeAws_restXmlGetBucketIntelligentTieringConfigurationCommand;
const serializeAws_restXmlGetBucketInventoryConfigurationCommand = async (input, context) => {
    const headers = {
        ...(isSerializableHeaderValue(input.ExpectedBucketOwner) && {
            "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
        }),
    };
    let resolvedPath = "/{Bucket}";
    if (input.Bucket !== undefined) {
        const labelValue = input.Bucket;
        if (labelValue.length <= 0) {
            throw new Error("Empty value provided for input HTTP label: Bucket.");
        }
        resolvedPath = resolvedPath.replace("{Bucket}", smithy_client_1.extendedEncodeURIComponent(labelValue));
    }
    else {
        throw new Error("No value provided for input HTTP label: Bucket.");
    }
    const query = {
        inventory: "",
        "x-id": "GetBucketInventoryConfiguration",
        ...(input.Id !== undefined && { id: input.Id }),
    };
    let body;
    const { hostname, protocol = "https", port } = await context.endpoint();
    return new protocol_http_1.HttpRequest({
        protocol,
        hostname,
        port,
        method: "GET",
        headers,
        path: resolvedPath,
        query,
        body,
    });
};
exports.serializeAws_restXmlGetBucketInventoryConfigurationCommand = serializeAws_restXmlGetBucketInventoryConfigurationCommand;
const serializeAws_restXmlGetBucketLifecycleConfigurationCommand = async (input, context) => {
    const headers = {
        ...(isSerializableHeaderValue(input.ExpectedBucketOwner) && {
            "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
        }),
    };
    let resolvedPath = "/{Bucket}";
    if (input.Bucket !== undefined) {
        const labelValue = input.Bucket;
        if (labelValue.length <= 0) {
            throw new Error("Empty value provided for input HTTP label: Bucket.");
        }
        resolvedPath = resolvedPath.replace("{Bucket}", smithy_client_1.extendedEncodeURIComponent(labelValue));
    }
    else {
        throw new Error("No value provided for input HTTP label: Bucket.");
    }
    const query = {
        lifecycle: "",
    };
    let body;
    const { hostname, protocol = "https", port } = await context.endpoint();
    return new protocol_http_1.HttpRequest({
        protocol,
        hostname,
        port,
        method: "GET",
        headers,
        path: resolvedPath,
        query,
        body,
    });
};
exports.serializeAws_restXmlGetBucketLifecycleConfigurationCommand = serializeAws_restXmlGetBucketLifecycleConfigurationCommand;
const serializeAws_restXmlGetBucketLocationCommand = async (input, context) => {
    const headers = {
        ...(isSerializableHeaderValue(input.ExpectedBucketOwner) && {
            "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
        }),
    };
    let resolvedPath = "/{Bucket}";
    if (input.Bucket !== undefined) {
        const labelValue = input.Bucket;
        if (labelValue.length <= 0) {
            throw new Error("Empty value provided for input HTTP label: Bucket.");
        }
        resolvedPath = resolvedPath.replace("{Bucket}", smithy_client_1.extendedEncodeURIComponent(labelValue));
    }
    else {
        throw new Error("No value provided for input HTTP label: Bucket.");
    }
    const query = {
        location: "",
    };
    let body;
    const { hostname, protocol = "https", port } = await context.endpoint();
    return new protocol_http_1.HttpRequest({
        protocol,
        hostname,
        port,
        method: "GET",
        headers,
        path: resolvedPath,
        query,
        body,
    });
};
exports.serializeAws_restXmlGetBucketLocationCommand = serializeAws_restXmlGetBucketLocationCommand;
const serializeAws_restXmlGetBucketLoggingCommand = async (input, context) => {
    const headers = {
        ...(isSerializableHeaderValue(input.ExpectedBucketOwner) && {
            "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
        }),
    };
    let resolvedPath = "/{Bucket}";
    if (input.Bucket !== undefined) {
        const labelValue = input.Bucket;
        if (labelValue.length <= 0) {
            throw new Error("Empty value provided for input HTTP label: Bucket.");
        }
        resolvedPath = resolvedPath.replace("{Bucket}", smithy_client_1.extendedEncodeURIComponent(labelValue));
    }
    else {
        throw new Error("No value provided for input HTTP label: Bucket.");
    }
    const query = {
        logging: "",
    };
    let body;
    const { hostname, protocol = "https", port } = await context.endpoint();
    return new protocol_http_1.HttpRequest({
        protocol,
        hostname,
        port,
        method: "GET",
        headers,
        path: resolvedPath,
        query,
        body,
    });
};
exports.serializeAws_restXmlGetBucketLoggingCommand = serializeAws_restXmlGetBucketLoggingCommand;
const serializeAws_restXmlGetBucketMetricsConfigurationCommand = async (input, context) => {
    const headers = {
        ...(isSerializableHeaderValue(input.ExpectedBucketOwner) && {
            "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
        }),
    };
    let resolvedPath = "/{Bucket}";
    if (input.Bucket !== undefined) {
        const labelValue = input.Bucket;
        if (labelValue.length <= 0) {
            throw new Error("Empty value provided for input HTTP label: Bucket.");
        }
        resolvedPath = resolvedPath.replace("{Bucket}", smithy_client_1.extendedEncodeURIComponent(labelValue));
    }
    else {
        throw new Error("No value provided for input HTTP label: Bucket.");
    }
    const query = {
        metrics: "",
        "x-id": "GetBucketMetricsConfiguration",
        ...(input.Id !== undefined && { id: input.Id }),
    };
    let body;
    const { hostname, protocol = "https", port } = await context.endpoint();
    return new protocol_http_1.HttpRequest({
        protocol,
        hostname,
        port,
        method: "GET",
        headers,
        path: resolvedPath,
        query,
        body,
    });
};
exports.serializeAws_restXmlGetBucketMetricsConfigurationCommand = serializeAws_restXmlGetBucketMetricsConfigurationCommand;
const serializeAws_restXmlGetBucketNotificationConfigurationCommand = async (input, context) => {
    const headers = {
        ...(isSerializableHeaderValue(input.ExpectedBucketOwner) && {
            "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
        }),
    };
    let resolvedPath = "/{Bucket}";
    if (input.Bucket !== undefined) {
        const labelValue = input.Bucket;
        if (labelValue.length <= 0) {
            throw new Error("Empty value provided for input HTTP label: Bucket.");
        }
        resolvedPath = resolvedPath.replace("{Bucket}", smithy_client_1.extendedEncodeURIComponent(labelValue));
    }
    else {
        throw new Error("No value provided for input HTTP label: Bucket.");
    }
    const query = {
        notification: "",
    };
    let body;
    const { hostname, protocol = "https", port } = await context.endpoint();
    return new protocol_http_1.HttpRequest({
        protocol,
        hostname,
        port,
        method: "GET",
        headers,
        path: resolvedPath,
        query,
        body,
    });
};
exports.serializeAws_restXmlGetBucketNotificationConfigurationCommand = serializeAws_restXmlGetBucketNotificationConfigurationCommand;
const serializeAws_restXmlGetBucketOwnershipControlsCommand = async (input, context) => {
    const headers = {
        ...(isSerializableHeaderValue(input.ExpectedBucketOwner) && {
            "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
        }),
    };
    let resolvedPath = "/{Bucket}";
    if (input.Bucket !== undefined) {
        const labelValue = input.Bucket;
        if (labelValue.length <= 0) {
            throw new Error("Empty value provided for input HTTP label: Bucket.");
        }
        resolvedPath = resolvedPath.replace("{Bucket}", smithy_client_1.extendedEncodeURIComponent(labelValue));
    }
    else {
        throw new Error("No value provided for input HTTP label: Bucket.");
    }
    const query = {
        ownershipControls: "",
    };
    let body;
    const { hostname, protocol = "https", port } = await context.endpoint();
    return new protocol_http_1.HttpRequest({
        protocol,
        hostname,
        port,
        method: "GET",
        headers,
        path: resolvedPath,
        query,
        body,
    });
};
exports.serializeAws_restXmlGetBucketOwnershipControlsCommand = serializeAws_restXmlGetBucketOwnershipControlsCommand;
const serializeAws_restXmlGetBucketPolicyCommand = async (input, context) => {
    const headers = {
        ...(isSerializableHeaderValue(input.ExpectedBucketOwner) && {
            "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
        }),
    };
    let resolvedPath = "/{Bucket}";
    if (input.Bucket !== undefined) {
        const labelValue = input.Bucket;
        if (labelValue.length <= 0) {
            throw new Error("Empty value provided for input HTTP label: Bucket.");
        }
        resolvedPath = resolvedPath.replace("{Bucket}", smithy_client_1.extendedEncodeURIComponent(labelValue));
    }
    else {
        throw new Error("No value provided for input HTTP label: Bucket.");
    }
    const query = {
        policy: "",
    };
    let body;
    const { hostname, protocol = "https", port } = await context.endpoint();
    return new protocol_http_1.HttpRequest({
        protocol,
        hostname,
        port,
        method: "GET",
        headers,
        path: resolvedPath,
        query,
        body,
    });
};
exports.serializeAws_restXmlGetBucketPolicyCommand = serializeAws_restXmlGetBucketPolicyCommand;
const serializeAws_restXmlGetBucketPolicyStatusCommand = async (input, context) => {
    const headers = {
        ...(isSerializableHeaderValue(input.ExpectedBucketOwner) && {
            "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
        }),
    };
    let resolvedPath = "/{Bucket}";
    if (input.Bucket !== undefined) {
        const labelValue = input.Bucket;
        if (labelValue.length <= 0) {
            throw new Error("Empty value provided for input HTTP label: Bucket.");
        }
        resolvedPath = resolvedPath.replace("{Bucket}", smithy_client_1.extendedEncodeURIComponent(labelValue));
    }
    else {
        throw new Error("No value provided for input HTTP label: Bucket.");
    }
    const query = {
        policyStatus: "",
    };
    let body;
    const { hostname, protocol = "https", port } = await context.endpoint();
    return new protocol_http_1.HttpRequest({
        protocol,
        hostname,
        port,
        method: "GET",
        headers,
        path: resolvedPath,
        query,
        body,
    });
};
exports.serializeAws_restXmlGetBucketPolicyStatusCommand = serializeAws_restXmlGetBucketPolicyStatusCommand;
const serializeAws_restXmlGetBucketReplicationCommand = async (input, context) => {
    const headers = {
        ...(isSerializableHeaderValue(input.ExpectedBucketOwner) && {
            "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
        }),
    };
    let resolvedPath = "/{Bucket}";
    if (input.Bucket !== undefined) {
        const labelValue = input.Bucket;
        if (labelValue.length <= 0) {
            throw new Error("Empty value provided for input HTTP label: Bucket.");
        }
        resolvedPath = resolvedPath.replace("{Bucket}", smithy_client_1.extendedEncodeURIComponent(labelValue));
    }
    else {
        throw new Error("No value provided for input HTTP label: Bucket.");
    }
    const query = {
        replication: "",
    };
    let body;
    const { hostname, protocol = "https", port } = await context.endpoint();
    return new protocol_http_1.HttpRequest({
        protocol,
        hostname,
        port,
        method: "GET",
        headers,
        path: resolvedPath,
        query,
        body,
    });
};
exports.serializeAws_restXmlGetBucketReplicationCommand = serializeAws_restXmlGetBucketReplicationCommand;
const serializeAws_restXmlGetBucketRequestPaymentCommand = async (input, context) => {
    const headers = {
        ...(isSerializableHeaderValue(input.ExpectedBucketOwner) && {
            "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
        }),
    };
    let resolvedPath = "/{Bucket}";
    if (input.Bucket !== undefined) {
        const labelValue = input.Bucket;
        if (labelValue.length <= 0) {
            throw new Error("Empty value provided for input HTTP label: Bucket.");
        }
        resolvedPath = resolvedPath.replace("{Bucket}", smithy_client_1.extendedEncodeURIComponent(labelValue));
    }
    else {
        throw new Error("No value provided for input HTTP label: Bucket.");
    }
    const query = {
        requestPayment: "",
    };
    let body;
    const { hostname, protocol = "https", port } = await context.endpoint();
    return new protocol_http_1.HttpRequest({
        protocol,
        hostname,
        port,
        method: "GET",
        headers,
        path: resolvedPath,
        query,
        body,
    });
};
exports.serializeAws_restXmlGetBucketRequestPaymentCommand = serializeAws_restXmlGetBucketRequestPaymentCommand;
const serializeAws_restXmlGetBucketTaggingCommand = async (input, context) => {
    const headers = {
        ...(isSerializableHeaderValue(input.ExpectedBucketOwner) && {
            "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
        }),
    };
    let resolvedPath = "/{Bucket}";
    if (input.Bucket !== undefined) {
        const labelValue = input.Bucket;
        if (labelValue.length <= 0) {
            throw new Error("Empty value provided for input HTTP label: Bucket.");
        }
        resolvedPath = resolvedPath.replace("{Bucket}", smithy_client_1.extendedEncodeURIComponent(labelValue));
    }
    else {
        throw new Error("No value provided for input HTTP label: Bucket.");
    }
    const query = {
        tagging: "",
    };
    let body;
    const { hostname, protocol = "https", port } = await context.endpoint();
    return new protocol_http_1.HttpRequest({
        protocol,
        hostname,
        port,
        method: "GET",
        headers,
        path: resolvedPath,
        query,
        body,
    });
};
exports.serializeAws_restXmlGetBucketTaggingCommand = serializeAws_restXmlGetBucketTaggingCommand;
const serializeAws_restXmlGetBucketVersioningCommand = async (input, context) => {
    const headers = {
        ...(isSerializableHeaderValue(input.ExpectedBucketOwner) && {
            "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
        }),
    };
    let resolvedPath = "/{Bucket}";
    if (input.Bucket !== undefined) {
        const labelValue = input.Bucket;
        if (labelValue.length <= 0) {
            throw new Error("Empty value provided for input HTTP label: Bucket.");
        }
        resolvedPath = resolvedPath.replace("{Bucket}", smithy_client_1.extendedEncodeURIComponent(labelValue));
    }
    else {
        throw new Error("No value provided for input HTTP label: Bucket.");
    }
    const query = {
        versioning: "",
    };
    let body;
    const { hostname, protocol = "https", port } = await context.endpoint();
    return new protocol_http_1.HttpRequest({
        protocol,
        hostname,
        port,
        method: "GET",
        headers,
        path: resolvedPath,
        query,
        body,
    });
};
exports.serializeAws_restXmlGetBucketVersioningCommand = serializeAws_restXmlGetBucketVersioningCommand;
const serializeAws_restXmlGetBucketWebsiteCommand = async (input, context) => {
    const headers = {
        ...(isSerializableHeaderValue(input.ExpectedBucketOwner) && {
            "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
        }),
    };
    let resolvedPath = "/{Bucket}";
    if (input.Bucket !== undefined) {
        const labelValue = input.Bucket;
        if (labelValue.length <= 0) {
            throw new Error("Empty value provided for input HTTP label: Bucket.");
        }
        resolvedPath = resolvedPath.replace("{Bucket}", smithy_client_1.extendedEncodeURIComponent(labelValue));
    }
    else {
        throw new Error("No value provided for input HTTP label: Bucket.");
    }
    const query = {
        website: "",
    };
    let body;
    const { hostname, protocol = "https", port } = await context.endpoint();
    return new protocol_http_1.HttpRequest({
        protocol,
        hostname,
        port,
        method: "GET",
        headers,
        path: resolvedPath,
        query,
        body,
    });
};
exports.serializeAws_restXmlGetBucketWebsiteCommand = serializeAws_restXmlGetBucketWebsiteCommand;
const serializeAws_restXmlGetObjectCommand = async (input, context) => {
    const headers = {
        ...(isSerializableHeaderValue(input.IfMatch) && { "If-Match": input.IfMatch }),
        ...(isSerializableHeaderValue(input.IfModifiedSince) && {
            "If-Modified-Since": smithy_client_1.dateToUtcString(input.IfModifiedSince).toString(),
        }),
        ...(isSerializableHeaderValue(input.IfNoneMatch) && { "If-None-Match": input.IfNoneMatch }),
        ...(isSerializableHeaderValue(input.IfUnmodifiedSince) && {
            "If-Unmodified-Since": smithy_client_1.dateToUtcString(input.IfUnmodifiedSince).toString(),
        }),
        ...(isSerializableHeaderValue(input.Range) && { Range: input.Range }),
        ...(isSerializableHeaderValue(input.SSECustomerAlgorithm) && {
            "x-amz-server-side-encryption-customer-algorithm": input.SSECustomerAlgorithm,
        }),
        ...(isSerializableHeaderValue(input.SSECustomerKey) && {
            "x-amz-server-side-encryption-customer-key": input.SSECustomerKey,
        }),
        ...(isSerializableHeaderValue(input.SSECustomerKeyMD5) && {
            "x-amz-server-side-encryption-customer-key-MD5": input.SSECustomerKeyMD5,
        }),
        ...(isSerializableHeaderValue(input.RequestPayer) && { "x-amz-request-payer": input.RequestPayer }),
        ...(isSerializableHeaderValue(input.ExpectedBucketOwner) && {
            "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
        }),
    };
    let resolvedPath = "/{Bucket}/{Key+}";
    if (input.Bucket !== undefined) {
        const labelValue = input.Bucket;
        if (labelValue.length <= 0) {
            throw new Error("Empty value provided for input HTTP label: Bucket.");
        }
        resolvedPath = resolvedPath.replace("{Bucket}", smithy_client_1.extendedEncodeURIComponent(labelValue));
    }
    else {
        throw new Error("No value provided for input HTTP label: Bucket.");
    }
    if (input.Key !== undefined) {
        const labelValue = input.Key;
        if (labelValue.length <= 0) {
            throw new Error("Empty value provided for input HTTP label: Key.");
        }
        resolvedPath = resolvedPath.replace("{Key+}", labelValue
            .split("/")
            .map((segment) => smithy_client_1.extendedEncodeURIComponent(segment))
            .join("/"));
    }
    else {
        throw new Error("No value provided for input HTTP label: Key.");
    }
    const query = {
        "x-id": "GetObject",
        ...(input.ResponseCacheControl !== undefined && { "response-cache-control": input.ResponseCacheControl }),
        ...(input.ResponseContentDisposition !== undefined && {
            "response-content-disposition": input.ResponseContentDisposition,
        }),
        ...(input.ResponseContentEncoding !== undefined && { "response-content-encoding": input.ResponseContentEncoding }),
        ...(input.ResponseContentLanguage !== undefined && { "response-content-language": input.ResponseContentLanguage }),
        ...(input.ResponseContentType !== undefined && { "response-content-type": input.ResponseContentType }),
        ...(input.ResponseExpires !== undefined && {
            "response-expires": (input.ResponseExpires.toISOString().split(".")[0] + "Z").toString(),
        }),
        ...(input.VersionId !== undefined && { versionId: input.VersionId }),
        ...(input.PartNumber !== undefined && { partNumber: input.PartNumber.toString() }),
    };
    let body;
    const { hostname, protocol = "https", port } = await context.endpoint();
    return new protocol_http_1.HttpRequest({
        protocol,
        hostname,
        port,
        method: "GET",
        headers,
        path: resolvedPath,
        query,
        body,
    });
};
exports.serializeAws_restXmlGetObjectCommand = serializeAws_restXmlGetObjectCommand;
const serializeAws_restXmlGetObjectAclCommand = async (input, context) => {
    const headers = {
        ...(isSerializableHeaderValue(input.RequestPayer) && { "x-amz-request-payer": input.RequestPayer }),
        ...(isSerializableHeaderValue(input.ExpectedBucketOwner) && {
            "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
        }),
    };
    let resolvedPath = "/{Bucket}/{Key+}";
    if (input.Bucket !== undefined) {
        const labelValue = input.Bucket;
        if (labelValue.length <= 0) {
            throw new Error("Empty value provided for input HTTP label: Bucket.");
        }
        resolvedPath = resolvedPath.replace("{Bucket}", smithy_client_1.extendedEncodeURIComponent(labelValue));
    }
    else {
        throw new Error("No value provided for input HTTP label: Bucket.");
    }
    if (input.Key !== undefined) {
        const labelValue = input.Key;
        if (labelValue.length <= 0) {
            throw new Error("Empty value provided for input HTTP label: Key.");
        }
        resolvedPath = resolvedPath.replace("{Key+}", labelValue
            .split("/")
            .map((segment) => smithy_client_1.extendedEncodeURIComponent(segment))
            .join("/"));
    }
    else {
        throw new Error("No value provided for input HTTP label: Key.");
    }
    const query = {
        acl: "",
        ...(input.VersionId !== undefined && { versionId: input.VersionId }),
    };
    let body;
    const { hostname, protocol = "https", port } = await context.endpoint();
    return new protocol_http_1.HttpRequest({
        protocol,
        hostname,
        port,
        method: "GET",
        headers,
        path: resolvedPath,
        query,
        body,
    });
};
exports.serializeAws_restXmlGetObjectAclCommand = serializeAws_restXmlGetObjectAclCommand;
const serializeAws_restXmlGetObjectLegalHoldCommand = async (input, context) => {
    const headers = {
        ...(isSerializableHeaderValue(input.RequestPayer) && { "x-amz-request-payer": input.RequestPayer }),
        ...(isSerializableHeaderValue(input.ExpectedBucketOwner) && {
            "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
        }),
    };
    let resolvedPath = "/{Bucket}/{Key+}";
    if (input.Bucket !== undefined) {
        const labelValue = input.Bucket;
        if (labelValue.length <= 0) {
            throw new Error("Empty value provided for input HTTP label: Bucket.");
        }
        resolvedPath = resolvedPath.replace("{Bucket}", smithy_client_1.extendedEncodeURIComponent(labelValue));
    }
    else {
        throw new Error("No value provided for input HTTP label: Bucket.");
    }
    if (input.Key !== undefined) {
        const labelValue = input.Key;
        if (labelValue.length <= 0) {
            throw new Error("Empty value provided for input HTTP label: Key.");
        }
        resolvedPath = resolvedPath.replace("{Key+}", labelValue
            .split("/")
            .map((segment) => smithy_client_1.extendedEncodeURIComponent(segment))
            .join("/"));
    }
    else {
        throw new Error("No value provided for input HTTP label: Key.");
    }
    const query = {
        "legal-hold": "",
        ...(input.VersionId !== undefined && { versionId: input.VersionId }),
    };
    let body;
    const { hostname, protocol = "https", port } = await context.endpoint();
    return new protocol_http_1.HttpRequest({
        protocol,
        hostname,
        port,
        method: "GET",
        headers,
        path: resolvedPath,
        query,
        body,
    });
};
exports.serializeAws_restXmlGetObjectLegalHoldCommand = serializeAws_restXmlGetObjectLegalHoldCommand;
const serializeAws_restXmlGetObjectLockConfigurationCommand = async (input, context) => {
    const headers = {
        ...(isSerializableHeaderValue(input.ExpectedBucketOwner) && {
            "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
        }),
    };
    let resolvedPath = "/{Bucket}";
    if (input.Bucket !== undefined) {
        const labelValue = input.Bucket;
        if (labelValue.length <= 0) {
            throw new Error("Empty value provided for input HTTP label: Bucket.");
        }
        resolvedPath = resolvedPath.replace("{Bucket}", smithy_client_1.extendedEncodeURIComponent(labelValue));
    }
    else {
        throw new Error("No value provided for input HTTP label: Bucket.");
    }
    const query = {
        "object-lock": "",
    };
    let body;
    const { hostname, protocol = "https", port } = await context.endpoint();
    return new protocol_http_1.HttpRequest({
        protocol,
        hostname,
        port,
        method: "GET",
        headers,
        path: resolvedPath,
        query,
        body,
    });
};
exports.serializeAws_restXmlGetObjectLockConfigurationCommand = serializeAws_restXmlGetObjectLockConfigurationCommand;
const serializeAws_restXmlGetObjectRetentionCommand = async (input, context) => {
    const headers = {
        ...(isSerializableHeaderValue(input.RequestPayer) && { "x-amz-request-payer": input.RequestPayer }),
        ...(isSerializableHeaderValue(input.ExpectedBucketOwner) && {
            "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
        }),
    };
    let resolvedPath = "/{Bucket}/{Key+}";
    if (input.Bucket !== undefined) {
        const labelValue = input.Bucket;
        if (labelValue.length <= 0) {
            throw new Error("Empty value provided for input HTTP label: Bucket.");
        }
        resolvedPath = resolvedPath.replace("{Bucket}", smithy_client_1.extendedEncodeURIComponent(labelValue));
    }
    else {
        throw new Error("No value provided for input HTTP label: Bucket.");
    }
    if (input.Key !== undefined) {
        const labelValue = input.Key;
        if (labelValue.length <= 0) {
            throw new Error("Empty value provided for input HTTP label: Key.");
        }
        resolvedPath = resolvedPath.replace("{Key+}", labelValue
            .split("/")
            .map((segment) => smithy_client_1.extendedEncodeURIComponent(segment))
            .join("/"));
    }
    else {
        throw new Error("No value provided for input HTTP label: Key.");
    }
    const query = {
        retention: "",
        ...(input.VersionId !== undefined && { versionId: input.VersionId }),
    };
    let body;
    const { hostname, protocol = "https", port } = await context.endpoint();
    return new protocol_http_1.HttpRequest({
        protocol,
        hostname,
        port,
        method: "GET",
        headers,
        path: resolvedPath,
        query,
        body,
    });
};
exports.serializeAws_restXmlGetObjectRetentionCommand = serializeAws_restXmlGetObjectRetentionCommand;
const serializeAws_restXmlGetObjectTaggingCommand = async (input, context) => {
    const headers = {
        ...(isSerializableHeaderValue(input.ExpectedBucketOwner) && {
            "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
        }),
    };
    let resolvedPath = "/{Bucket}/{Key+}";
    if (input.Bucket !== undefined) {
        const labelValue = input.Bucket;
        if (labelValue.length <= 0) {
            throw new Error("Empty value provided for input HTTP label: Bucket.");
        }
        resolvedPath = resolvedPath.replace("{Bucket}", smithy_client_1.extendedEncodeURIComponent(labelValue));
    }
    else {
        throw new Error("No value provided for input HTTP label: Bucket.");
    }
    if (input.Key !== undefined) {
        const labelValue = input.Key;
        if (labelValue.length <= 0) {
            throw new Error("Empty value provided for input HTTP label: Key.");
        }
        resolvedPath = resolvedPath.replace("{Key+}", labelValue
            .split("/")
            .map((segment) => smithy_client_1.extendedEncodeURIComponent(segment))
            .join("/"));
    }
    else {
        throw new Error("No value provided for input HTTP label: Key.");
    }
    const query = {
        tagging: "",
        ...(input.VersionId !== undefined && { versionId: input.VersionId }),
    };
    let body;
    const { hostname, protocol = "https", port } = await context.endpoint();
    return new protocol_http_1.HttpRequest({
        protocol,
        hostname,
        port,
        method: "GET",
        headers,
        path: resolvedPath,
        query,
        body,
    });
};
exports.serializeAws_restXmlGetObjectTaggingCommand = serializeAws_restXmlGetObjectTaggingCommand;
const serializeAws_restXmlGetObjectTorrentCommand = async (input, context) => {
    const headers = {
        ...(isSerializableHeaderValue(input.RequestPayer) && { "x-amz-request-payer": input.RequestPayer }),
        ...(isSerializableHeaderValue(input.ExpectedBucketOwner) && {
            "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
        }),
    };
    let resolvedPath = "/{Bucket}/{Key+}";
    if (input.Bucket !== undefined) {
        const labelValue = input.Bucket;
        if (labelValue.length <= 0) {
            throw new Error("Empty value provided for input HTTP label: Bucket.");
        }
        resolvedPath = resolvedPath.replace("{Bucket}", smithy_client_1.extendedEncodeURIComponent(labelValue));
    }
    else {
        throw new Error("No value provided for input HTTP label: Bucket.");
    }
    if (input.Key !== undefined) {
        const labelValue = input.Key;
        if (labelValue.length <= 0) {
            throw new Error("Empty value provided for input HTTP label: Key.");
        }
        resolvedPath = resolvedPath.replace("{Key+}", labelValue
            .split("/")
            .map((segment) => smithy_client_1.extendedEncodeURIComponent(segment))
            .join("/"));
    }
    else {
        throw new Error("No value provided for input HTTP label: Key.");
    }
    const query = {
        torrent: "",
    };
    let body;
    const { hostname, protocol = "https", port } = await context.endpoint();
    return new protocol_http_1.HttpRequest({
        protocol,
        hostname,
        port,
        method: "GET",
        headers,
        path: resolvedPath,
        query,
        body,
    });
};
exports.serializeAws_restXmlGetObjectTorrentCommand = serializeAws_restXmlGetObjectTorrentCommand;
const serializeAws_restXmlGetPublicAccessBlockCommand = async (input, context) => {
    const headers = {
        ...(isSerializableHeaderValue(input.ExpectedBucketOwner) && {
            "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
        }),
    };
    let resolvedPath = "/{Bucket}";
    if (input.Bucket !== undefined) {
        const labelValue = input.Bucket;
        if (labelValue.length <= 0) {
            throw new Error("Empty value provided for input HTTP label: Bucket.");
        }
        resolvedPath = resolvedPath.replace("{Bucket}", smithy_client_1.extendedEncodeURIComponent(labelValue));
    }
    else {
        throw new Error("No value provided for input HTTP label: Bucket.");
    }
    const query = {
        publicAccessBlock: "",
    };
    let body;
    const { hostname, protocol = "https", port } = await context.endpoint();
    return new protocol_http_1.HttpRequest({
        protocol,
        hostname,
        port,
        method: "GET",
        headers,
        path: resolvedPath,
        query,
        body,
    });
};
exports.serializeAws_restXmlGetPublicAccessBlockCommand = serializeAws_restXmlGetPublicAccessBlockCommand;
const serializeAws_restXmlHeadBucketCommand = async (input, context) => {
    const headers = {
        ...(isSerializableHeaderValue(input.ExpectedBucketOwner) && {
            "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
        }),
    };
    let resolvedPath = "/{Bucket}";
    if (input.Bucket !== undefined) {
        const labelValue = input.Bucket;
        if (labelValue.length <= 0) {
            throw new Error("Empty value provided for input HTTP label: Bucket.");
        }
        resolvedPath = resolvedPath.replace("{Bucket}", smithy_client_1.extendedEncodeURIComponent(labelValue));
    }
    else {
        throw new Error("No value provided for input HTTP label: Bucket.");
    }
    let body;
    const { hostname, protocol = "https", port } = await context.endpoint();
    return new protocol_http_1.HttpRequest({
        protocol,
        hostname,
        port,
        method: "HEAD",
        headers,
        path: resolvedPath,
        body,
    });
};
exports.serializeAws_restXmlHeadBucketCommand = serializeAws_restXmlHeadBucketCommand;
const serializeAws_restXmlHeadObjectCommand = async (input, context) => {
    const headers = {
        ...(isSerializableHeaderValue(input.IfMatch) && { "If-Match": input.IfMatch }),
        ...(isSerializableHeaderValue(input.IfModifiedSince) && {
            "If-Modified-Since": smithy_client_1.dateToUtcString(input.IfModifiedSince).toString(),
        }),
        ...(isSerializableHeaderValue(input.IfNoneMatch) && { "If-None-Match": input.IfNoneMatch }),
        ...(isSerializableHeaderValue(input.IfUnmodifiedSince) && {
            "If-Unmodified-Since": smithy_client_1.dateToUtcString(input.IfUnmodifiedSince).toString(),
        }),
        ...(isSerializableHeaderValue(input.Range) && { Range: input.Range }),
        ...(isSerializableHeaderValue(input.SSECustomerAlgorithm) && {
            "x-amz-server-side-encryption-customer-algorithm": input.SSECustomerAlgorithm,
        }),
        ...(isSerializableHeaderValue(input.SSECustomerKey) && {
            "x-amz-server-side-encryption-customer-key": input.SSECustomerKey,
        }),
        ...(isSerializableHeaderValue(input.SSECustomerKeyMD5) && {
            "x-amz-server-side-encryption-customer-key-MD5": input.SSECustomerKeyMD5,
        }),
        ...(isSerializableHeaderValue(input.RequestPayer) && { "x-amz-request-payer": input.RequestPayer }),
        ...(isSerializableHeaderValue(input.ExpectedBucketOwner) && {
            "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
        }),
    };
    let resolvedPath = "/{Bucket}/{Key+}";
    if (input.Bucket !== undefined) {
        const labelValue = input.Bucket;
        if (labelValue.length <= 0) {
            throw new Error("Empty value provided for input HTTP label: Bucket.");
        }
        resolvedPath = resolvedPath.replace("{Bucket}", smithy_client_1.extendedEncodeURIComponent(labelValue));
    }
    else {
        throw new Error("No value provided for input HTTP label: Bucket.");
    }
    if (input.Key !== undefined) {
        const labelValue = input.Key;
        if (labelValue.length <= 0) {
            throw new Error("Empty value provided for input HTTP label: Key.");
        }
        resolvedPath = resolvedPath.replace("{Key+}", labelValue
            .split("/")
            .map((segment) => smithy_client_1.extendedEncodeURIComponent(segment))
            .join("/"));
    }
    else {
        throw new Error("No value provided for input HTTP label: Key.");
    }
    const query = {
        ...(input.VersionId !== undefined && { versionId: input.VersionId }),
        ...(input.PartNumber !== undefined && { partNumber: input.PartNumber.toString() }),
    };
    let body;
    const { hostname, protocol = "https", port } = await context.endpoint();
    return new protocol_http_1.HttpRequest({
        protocol,
        hostname,
        port,
        method: "HEAD",
        headers,
        path: resolvedPath,
        query,
        body,
    });
};
exports.serializeAws_restXmlHeadObjectCommand = serializeAws_restXmlHeadObjectCommand;
const serializeAws_restXmlListBucketAnalyticsConfigurationsCommand = async (input, context) => {
    const headers = {
        ...(isSerializableHeaderValue(input.ExpectedBucketOwner) && {
            "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
        }),
    };
    let resolvedPath = "/{Bucket}";
    if (input.Bucket !== undefined) {
        const labelValue = input.Bucket;
        if (labelValue.length <= 0) {
            throw new Error("Empty value provided for input HTTP label: Bucket.");
        }
        resolvedPath = resolvedPath.replace("{Bucket}", smithy_client_1.extendedEncodeURIComponent(labelValue));
    }
    else {
        throw new Error("No value provided for input HTTP label: Bucket.");
    }
    const query = {
        analytics: "",
        "x-id": "ListBucketAnalyticsConfigurations",
        ...(input.ContinuationToken !== undefined && { "continuation-token": input.ContinuationToken }),
    };
    let body;
    const { hostname, protocol = "https", port } = await context.endpoint();
    return new protocol_http_1.HttpRequest({
        protocol,
        hostname,
        port,
        method: "GET",
        headers,
        path: resolvedPath,
        query,
        body,
    });
};
exports.serializeAws_restXmlListBucketAnalyticsConfigurationsCommand = serializeAws_restXmlListBucketAnalyticsConfigurationsCommand;
const serializeAws_restXmlListBucketIntelligentTieringConfigurationsCommand = async (input, context) => {
    const headers = {};
    let resolvedPath = "/{Bucket}";
    if (input.Bucket !== undefined) {
        const labelValue = input.Bucket;
        if (labelValue.length <= 0) {
            throw new Error("Empty value provided for input HTTP label: Bucket.");
        }
        resolvedPath = resolvedPath.replace("{Bucket}", smithy_client_1.extendedEncodeURIComponent(labelValue));
    }
    else {
        throw new Error("No value provided for input HTTP label: Bucket.");
    }
    const query = {
        "intelligent-tiering": "",
        "x-id": "ListBucketIntelligentTieringConfigurations",
        ...(input.ContinuationToken !== undefined && { "continuation-token": input.ContinuationToken }),
    };
    let body;
    const { hostname, protocol = "https", port } = await context.endpoint();
    return new protocol_http_1.HttpRequest({
        protocol,
        hostname,
        port,
        method: "GET",
        headers,
        path: resolvedPath,
        query,
        body,
    });
};
exports.serializeAws_restXmlListBucketIntelligentTieringConfigurationsCommand = serializeAws_restXmlListBucketIntelligentTieringConfigurationsCommand;
const serializeAws_restXmlListBucketInventoryConfigurationsCommand = async (input, context) => {
    const headers = {
        ...(isSerializableHeaderValue(input.ExpectedBucketOwner) && {
            "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
        }),
    };
    let resolvedPath = "/{Bucket}";
    if (input.Bucket !== undefined) {
        const labelValue = input.Bucket;
        if (labelValue.length <= 0) {
            throw new Error("Empty value provided for input HTTP label: Bucket.");
        }
        resolvedPath = resolvedPath.replace("{Bucket}", smithy_client_1.extendedEncodeURIComponent(labelValue));
    }
    else {
        throw new Error("No value provided for input HTTP label: Bucket.");
    }
    const query = {
        inventory: "",
        "x-id": "ListBucketInventoryConfigurations",
        ...(input.ContinuationToken !== undefined && { "continuation-token": input.ContinuationToken }),
    };
    let body;
    const { hostname, protocol = "https", port } = await context.endpoint();
    return new protocol_http_1.HttpRequest({
        protocol,
        hostname,
        port,
        method: "GET",
        headers,
        path: resolvedPath,
        query,
        body,
    });
};
exports.serializeAws_restXmlListBucketInventoryConfigurationsCommand = serializeAws_restXmlListBucketInventoryConfigurationsCommand;
const serializeAws_restXmlListBucketMetricsConfigurationsCommand = async (input, context) => {
    const headers = {
        ...(isSerializableHeaderValue(input.ExpectedBucketOwner) && {
            "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
        }),
    };
    let resolvedPath = "/{Bucket}";
    if (input.Bucket !== undefined) {
        const labelValue = input.Bucket;
        if (labelValue.length <= 0) {
            throw new Error("Empty value provided for input HTTP label: Bucket.");
        }
        resolvedPath = resolvedPath.replace("{Bucket}", smithy_client_1.extendedEncodeURIComponent(labelValue));
    }
    else {
        throw new Error("No value provided for input HTTP label: Bucket.");
    }
    const query = {
        metrics: "",
        "x-id": "ListBucketMetricsConfigurations",
        ...(input.ContinuationToken !== undefined && { "continuation-token": input.ContinuationToken }),
    };
    let body;
    const { hostname, protocol = "https", port } = await context.endpoint();
    return new protocol_http_1.HttpRequest({
        protocol,
        hostname,
        port,
        method: "GET",
        headers,
        path: resolvedPath,
        query,
        body,
    });
};
exports.serializeAws_restXmlListBucketMetricsConfigurationsCommand = serializeAws_restXmlListBucketMetricsConfigurationsCommand;
const serializeAws_restXmlListBucketsCommand = async (input, context) => {
    const headers = {};
    let resolvedPath = "/";
    let body;
    body = "";
    const { hostname, protocol = "https", port } = await context.endpoint();
    return new protocol_http_1.HttpRequest({
        protocol,
        hostname,
        port,
        method: "GET",
        headers,
        path: resolvedPath,
        body,
    });
};
exports.serializeAws_restXmlListBucketsCommand = serializeAws_restXmlListBucketsCommand;
const serializeAws_restXmlListMultipartUploadsCommand = async (input, context) => {
    const headers = {
        ...(isSerializableHeaderValue(input.ExpectedBucketOwner) && {
            "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
        }),
    };
    let resolvedPath = "/{Bucket}";
    if (input.Bucket !== undefined) {
        const labelValue = input.Bucket;
        if (labelValue.length <= 0) {
            throw new Error("Empty value provided for input HTTP label: Bucket.");
        }
        resolvedPath = resolvedPath.replace("{Bucket}", smithy_client_1.extendedEncodeURIComponent(labelValue));
    }
    else {
        throw new Error("No value provided for input HTTP label: Bucket.");
    }
    const query = {
        uploads: "",
        ...(input.Delimiter !== undefined && { delimiter: input.Delimiter }),
        ...(input.EncodingType !== undefined && { "encoding-type": input.EncodingType }),
        ...(input.KeyMarker !== undefined && { "key-marker": input.KeyMarker }),
        ...(input.MaxUploads !== undefined && { "max-uploads": input.MaxUploads.toString() }),
        ...(input.Prefix !== undefined && { prefix: input.Prefix }),
        ...(input.UploadIdMarker !== undefined && { "upload-id-marker": input.UploadIdMarker }),
    };
    let body;
    const { hostname, protocol = "https", port } = await context.endpoint();
    return new protocol_http_1.HttpRequest({
        protocol,
        hostname,
        port,
        method: "GET",
        headers,
        path: resolvedPath,
        query,
        body,
    });
};
exports.serializeAws_restXmlListMultipartUploadsCommand = serializeAws_restXmlListMultipartUploadsCommand;
const serializeAws_restXmlListObjectsCommand = async (input, context) => {
    const headers = {
        ...(isSerializableHeaderValue(input.RequestPayer) && { "x-amz-request-payer": input.RequestPayer }),
        ...(isSerializableHeaderValue(input.ExpectedBucketOwner) && {
            "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
        }),
    };
    let resolvedPath = "/{Bucket}";
    if (input.Bucket !== undefined) {
        const labelValue = input.Bucket;
        if (labelValue.length <= 0) {
            throw new Error("Empty value provided for input HTTP label: Bucket.");
        }
        resolvedPath = resolvedPath.replace("{Bucket}", smithy_client_1.extendedEncodeURIComponent(labelValue));
    }
    else {
        throw new Error("No value provided for input HTTP label: Bucket.");
    }
    const query = {
        ...(input.Delimiter !== undefined && { delimiter: input.Delimiter }),
        ...(input.EncodingType !== undefined && { "encoding-type": input.EncodingType }),
        ...(input.Marker !== undefined && { marker: input.Marker }),
        ...(input.MaxKeys !== undefined && { "max-keys": input.MaxKeys.toString() }),
        ...(input.Prefix !== undefined && { prefix: input.Prefix }),
    };
    let body;
    const { hostname, protocol = "https", port } = await context.endpoint();
    return new protocol_http_1.HttpRequest({
        protocol,
        hostname,
        port,
        method: "GET",
        headers,
        path: resolvedPath,
        query,
        body,
    });
};
exports.serializeAws_restXmlListObjectsCommand = serializeAws_restXmlListObjectsCommand;
const serializeAws_restXmlListObjectsV2Command = async (input, context) => {
    const headers = {
        ...(isSerializableHeaderValue(input.RequestPayer) && { "x-amz-request-payer": input.RequestPayer }),
        ...(isSerializableHeaderValue(input.ExpectedBucketOwner) && {
            "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
        }),
    };
    let resolvedPath = "/{Bucket}";
    if (input.Bucket !== undefined) {
        const labelValue = input.Bucket;
        if (labelValue.length <= 0) {
            throw new Error("Empty value provided for input HTTP label: Bucket.");
        }
        resolvedPath = resolvedPath.replace("{Bucket}", smithy_client_1.extendedEncodeURIComponent(labelValue));
    }
    else {
        throw new Error("No value provided for input HTTP label: Bucket.");
    }
    const query = {
        "list-type": "2",
        ...(input.Delimiter !== undefined && { delimiter: input.Delimiter }),
        ...(input.EncodingType !== undefined && { "encoding-type": input.EncodingType }),
        ...(input.MaxKeys !== undefined && { "max-keys": input.MaxKeys.toString() }),
        ...(input.Prefix !== undefined && { prefix: input.Prefix }),
        ...(input.ContinuationToken !== undefined && { "continuation-token": input.ContinuationToken }),
        ...(input.FetchOwner !== undefined && { "fetch-owner": input.FetchOwner.toString() }),
        ...(input.StartAfter !== undefined && { "start-after": input.StartAfter }),
    };
    let body;
    const { hostname, protocol = "https", port } = await context.endpoint();
    return new protocol_http_1.HttpRequest({
        protocol,
        hostname,
        port,
        method: "GET",
        headers,
        path: resolvedPath,
        query,
        body,
    });
};
exports.serializeAws_restXmlListObjectsV2Command = serializeAws_restXmlListObjectsV2Command;
const serializeAws_restXmlListObjectVersionsCommand = async (input, context) => {
    const headers = {
        ...(isSerializableHeaderValue(input.ExpectedBucketOwner) && {
            "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
        }),
    };
    let resolvedPath = "/{Bucket}";
    if (input.Bucket !== undefined) {
        const labelValue = input.Bucket;
        if (labelValue.length <= 0) {
            throw new Error("Empty value provided for input HTTP label: Bucket.");
        }
        resolvedPath = resolvedPath.replace("{Bucket}", smithy_client_1.extendedEncodeURIComponent(labelValue));
    }
    else {
        throw new Error("No value provided for input HTTP label: Bucket.");
    }
    const query = {
        versions: "",
        ...(input.Delimiter !== undefined && { delimiter: input.Delimiter }),
        ...(input.EncodingType !== undefined && { "encoding-type": input.EncodingType }),
        ...(input.KeyMarker !== undefined && { "key-marker": input.KeyMarker }),
        ...(input.MaxKeys !== undefined && { "max-keys": input.MaxKeys.toString() }),
        ...(input.Prefix !== undefined && { prefix: input.Prefix }),
        ...(input.VersionIdMarker !== undefined && { "version-id-marker": input.VersionIdMarker }),
    };
    let body;
    const { hostname, protocol = "https", port } = await context.endpoint();
    return new protocol_http_1.HttpRequest({
        protocol,
        hostname,
        port,
        method: "GET",
        headers,
        path: resolvedPath,
        query,
        body,
    });
};
exports.serializeAws_restXmlListObjectVersionsCommand = serializeAws_restXmlListObjectVersionsCommand;
const serializeAws_restXmlListPartsCommand = async (input, context) => {
    const headers = {
        ...(isSerializableHeaderValue(input.RequestPayer) && { "x-amz-request-payer": input.RequestPayer }),
        ...(isSerializableHeaderValue(input.ExpectedBucketOwner) && {
            "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
        }),
    };
    let resolvedPath = "/{Bucket}/{Key+}";
    if (input.Bucket !== undefined) {
        const labelValue = input.Bucket;
        if (labelValue.length <= 0) {
            throw new Error("Empty value provided for input HTTP label: Bucket.");
        }
        resolvedPath = resolvedPath.replace("{Bucket}", smithy_client_1.extendedEncodeURIComponent(labelValue));
    }
    else {
        throw new Error("No value provided for input HTTP label: Bucket.");
    }
    if (input.Key !== undefined) {
        const labelValue = input.Key;
        if (labelValue.length <= 0) {
            throw new Error("Empty value provided for input HTTP label: Key.");
        }
        resolvedPath = resolvedPath.replace("{Key+}", labelValue
            .split("/")
            .map((segment) => smithy_client_1.extendedEncodeURIComponent(segment))
            .join("/"));
    }
    else {
        throw new Error("No value provided for input HTTP label: Key.");
    }
    const query = {
        "x-id": "ListParts",
        ...(input.MaxParts !== undefined && { "max-parts": input.MaxParts.toString() }),
        ...(input.PartNumberMarker !== undefined && { "part-number-marker": input.PartNumberMarker }),
        ...(input.UploadId !== undefined && { uploadId: input.UploadId }),
    };
    let body;
    const { hostname, protocol = "https", port } = await context.endpoint();
    return new protocol_http_1.HttpRequest({
        protocol,
        hostname,
        port,
        method: "GET",
        headers,
        path: resolvedPath,
        query,
        body,
    });
};
exports.serializeAws_restXmlListPartsCommand = serializeAws_restXmlListPartsCommand;
const serializeAws_restXmlPutBucketAccelerateConfigurationCommand = async (input, context) => {
    const headers = {
        "content-type": "application/xml",
        ...(isSerializableHeaderValue(input.ExpectedBucketOwner) && {
            "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
        }),
    };
    let resolvedPath = "/{Bucket}";
    if (input.Bucket !== undefined) {
        const labelValue = input.Bucket;
        if (labelValue.length <= 0) {
            throw new Error("Empty value provided for input HTTP label: Bucket.");
        }
        resolvedPath = resolvedPath.replace("{Bucket}", smithy_client_1.extendedEncodeURIComponent(labelValue));
    }
    else {
        throw new Error("No value provided for input HTTP label: Bucket.");
    }
    const query = {
        accelerate: "",
    };
    let body;
    let contents;
    if (input.AccelerateConfiguration !== undefined) {
        contents = serializeAws_restXmlAccelerateConfiguration(input.AccelerateConfiguration, context);
        body = '<?xml version="1.0" encoding="UTF-8"?>';
        contents.addAttribute("xmlns", "http://s3.amazonaws.com/doc/2006-03-01/");
        body += contents.toString();
    }
    const { hostname, protocol = "https", port } = await context.endpoint();
    return new protocol_http_1.HttpRequest({
        protocol,
        hostname,
        port,
        method: "PUT",
        headers,
        path: resolvedPath,
        query,
        body,
    });
};
exports.serializeAws_restXmlPutBucketAccelerateConfigurationCommand = serializeAws_restXmlPutBucketAccelerateConfigurationCommand;
const serializeAws_restXmlPutBucketAclCommand = async (input, context) => {
    const headers = {
        "content-type": "application/xml",
        ...(isSerializableHeaderValue(input.ACL) && { "x-amz-acl": input.ACL }),
        ...(isSerializableHeaderValue(input.ContentMD5) && { "Content-MD5": input.ContentMD5 }),
        ...(isSerializableHeaderValue(input.GrantFullControl) && { "x-amz-grant-full-control": input.GrantFullControl }),
        ...(isSerializableHeaderValue(input.GrantRead) && { "x-amz-grant-read": input.GrantRead }),
        ...(isSerializableHeaderValue(input.GrantReadACP) && { "x-amz-grant-read-acp": input.GrantReadACP }),
        ...(isSerializableHeaderValue(input.GrantWrite) && { "x-amz-grant-write": input.GrantWrite }),
        ...(isSerializableHeaderValue(input.GrantWriteACP) && { "x-amz-grant-write-acp": input.GrantWriteACP }),
        ...(isSerializableHeaderValue(input.ExpectedBucketOwner) && {
            "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
        }),
    };
    let resolvedPath = "/{Bucket}";
    if (input.Bucket !== undefined) {
        const labelValue = input.Bucket;
        if (labelValue.length <= 0) {
            throw new Error("Empty value provided for input HTTP label: Bucket.");
        }
        resolvedPath = resolvedPath.replace("{Bucket}", smithy_client_1.extendedEncodeURIComponent(labelValue));
    }
    else {
        throw new Error("No value provided for input HTTP label: Bucket.");
    }
    const query = {
        acl: "",
    };
    let body;
    let contents;
    if (input.AccessControlPolicy !== undefined) {
        contents = serializeAws_restXmlAccessControlPolicy(input.AccessControlPolicy, context);
        body = '<?xml version="1.0" encoding="UTF-8"?>';
        contents.addAttribute("xmlns", "http://s3.amazonaws.com/doc/2006-03-01/");
        body += contents.toString();
    }
    const { hostname, protocol = "https", port } = await context.endpoint();
    return new protocol_http_1.HttpRequest({
        protocol,
        hostname,
        port,
        method: "PUT",
        headers,
        path: resolvedPath,
        query,
        body,
    });
};
exports.serializeAws_restXmlPutBucketAclCommand = serializeAws_restXmlPutBucketAclCommand;
const serializeAws_restXmlPutBucketAnalyticsConfigurationCommand = async (input, context) => {
    const headers = {
        "content-type": "application/xml",
        ...(isSerializableHeaderValue(input.ExpectedBucketOwner) && {
            "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
        }),
    };
    let resolvedPath = "/{Bucket}";
    if (input.Bucket !== undefined) {
        const labelValue = input.Bucket;
        if (labelValue.length <= 0) {
            throw new Error("Empty value provided for input HTTP label: Bucket.");
        }
        resolvedPath = resolvedPath.replace("{Bucket}", smithy_client_1.extendedEncodeURIComponent(labelValue));
    }
    else {
        throw new Error("No value provided for input HTTP label: Bucket.");
    }
    const query = {
        analytics: "",
        ...(input.Id !== undefined && { id: input.Id }),
    };
    let body;
    let contents;
    if (input.AnalyticsConfiguration !== undefined) {
        contents = serializeAws_restXmlAnalyticsConfiguration(input.AnalyticsConfiguration, context);
        body = '<?xml version="1.0" encoding="UTF-8"?>';
        contents.addAttribute("xmlns", "http://s3.amazonaws.com/doc/2006-03-01/");
        body += contents.toString();
    }
    const { hostname, protocol = "https", port } = await context.endpoint();
    return new protocol_http_1.HttpRequest({
        protocol,
        hostname,
        port,
        method: "PUT",
        headers,
        path: resolvedPath,
        query,
        body,
    });
};
exports.serializeAws_restXmlPutBucketAnalyticsConfigurationCommand = serializeAws_restXmlPutBucketAnalyticsConfigurationCommand;
const serializeAws_restXmlPutBucketCorsCommand = async (input, context) => {
    const headers = {
        "content-type": "application/xml",
        ...(isSerializableHeaderValue(input.ContentMD5) && { "Content-MD5": input.ContentMD5 }),
        ...(isSerializableHeaderValue(input.ExpectedBucketOwner) && {
            "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
        }),
    };
    let resolvedPath = "/{Bucket}";
    if (input.Bucket !== undefined) {
        const labelValue = input.Bucket;
        if (labelValue.length <= 0) {
            throw new Error("Empty value provided for input HTTP label: Bucket.");
        }
        resolvedPath = resolvedPath.replace("{Bucket}", smithy_client_1.extendedEncodeURIComponent(labelValue));
    }
    else {
        throw new Error("No value provided for input HTTP label: Bucket.");
    }
    const query = {
        cors: "",
    };
    let body;
    let contents;
    if (input.CORSConfiguration !== undefined) {
        contents = serializeAws_restXmlCORSConfiguration(input.CORSConfiguration, context);
        body = '<?xml version="1.0" encoding="UTF-8"?>';
        contents.addAttribute("xmlns", "http://s3.amazonaws.com/doc/2006-03-01/");
        body += contents.toString();
    }
    const { hostname, protocol = "https", port } = await context.endpoint();
    return new protocol_http_1.HttpRequest({
        protocol,
        hostname,
        port,
        method: "PUT",
        headers,
        path: resolvedPath,
        query,
        body,
    });
};
exports.serializeAws_restXmlPutBucketCorsCommand = serializeAws_restXmlPutBucketCorsCommand;
const serializeAws_restXmlPutBucketEncryptionCommand = async (input, context) => {
    const headers = {
        "content-type": "application/xml",
        ...(isSerializableHeaderValue(input.ContentMD5) && { "Content-MD5": input.ContentMD5 }),
        ...(isSerializableHeaderValue(input.ExpectedBucketOwner) && {
            "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
        }),
    };
    let resolvedPath = "/{Bucket}";
    if (input.Bucket !== undefined) {
        const labelValue = input.Bucket;
        if (labelValue.length <= 0) {
            throw new Error("Empty value provided for input HTTP label: Bucket.");
        }
        resolvedPath = resolvedPath.replace("{Bucket}", smithy_client_1.extendedEncodeURIComponent(labelValue));
    }
    else {
        throw new Error("No value provided for input HTTP label: Bucket.");
    }
    const query = {
        encryption: "",
    };
    let body;
    let contents;
    if (input.ServerSideEncryptionConfiguration !== undefined) {
        contents = serializeAws_restXmlServerSideEncryptionConfiguration(input.ServerSideEncryptionConfiguration, context);
        body = '<?xml version="1.0" encoding="UTF-8"?>';
        contents.addAttribute("xmlns", "http://s3.amazonaws.com/doc/2006-03-01/");
        body += contents.toString();
    }
    const { hostname, protocol = "https", port } = await context.endpoint();
    return new protocol_http_1.HttpRequest({
        protocol,
        hostname,
        port,
        method: "PUT",
        headers,
        path: resolvedPath,
        query,
        body,
    });
};
exports.serializeAws_restXmlPutBucketEncryptionCommand = serializeAws_restXmlPutBucketEncryptionCommand;
const serializeAws_restXmlPutBucketIntelligentTieringConfigurationCommand = async (input, context) => {
    const headers = {
        "content-type": "application/xml",
    };
    let resolvedPath = "/{Bucket}";
    if (input.Bucket !== undefined) {
        const labelValue = input.Bucket;
        if (labelValue.length <= 0) {
            throw new Error("Empty value provided for input HTTP label: Bucket.");
        }
        resolvedPath = resolvedPath.replace("{Bucket}", smithy_client_1.extendedEncodeURIComponent(labelValue));
    }
    else {
        throw new Error("No value provided for input HTTP label: Bucket.");
    }
    const query = {
        "intelligent-tiering": "",
        ...(input.Id !== undefined && { id: input.Id }),
    };
    let body;
    let contents;
    if (input.IntelligentTieringConfiguration !== undefined) {
        contents = serializeAws_restXmlIntelligentTieringConfiguration(input.IntelligentTieringConfiguration, context);
        body = '<?xml version="1.0" encoding="UTF-8"?>';
        contents.addAttribute("xmlns", "http://s3.amazonaws.com/doc/2006-03-01/");
        body += contents.toString();
    }
    const { hostname, protocol = "https", port } = await context.endpoint();
    return new protocol_http_1.HttpRequest({
        protocol,
        hostname,
        port,
        method: "PUT",
        headers,
        path: resolvedPath,
        query,
        body,
    });
};
exports.serializeAws_restXmlPutBucketIntelligentTieringConfigurationCommand = serializeAws_restXmlPutBucketIntelligentTieringConfigurationCommand;
const serializeAws_restXmlPutBucketInventoryConfigurationCommand = async (input, context) => {
    const headers = {
        "content-type": "application/xml",
        ...(isSerializableHeaderValue(input.ExpectedBucketOwner) && {
            "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
        }),
    };
    let resolvedPath = "/{Bucket}";
    if (input.Bucket !== undefined) {
        const labelValue = input.Bucket;
        if (labelValue.length <= 0) {
            throw new Error("Empty value provided for input HTTP label: Bucket.");
        }
        resolvedPath = resolvedPath.replace("{Bucket}", smithy_client_1.extendedEncodeURIComponent(labelValue));
    }
    else {
        throw new Error("No value provided for input HTTP label: Bucket.");
    }
    const query = {
        inventory: "",
        ...(input.Id !== undefined && { id: input.Id }),
    };
    let body;
    let contents;
    if (input.InventoryConfiguration !== undefined) {
        contents = serializeAws_restXmlInventoryConfiguration(input.InventoryConfiguration, context);
        body = '<?xml version="1.0" encoding="UTF-8"?>';
        contents.addAttribute("xmlns", "http://s3.amazonaws.com/doc/2006-03-01/");
        body += contents.toString();
    }
    const { hostname, protocol = "https", port } = await context.endpoint();
    return new protocol_http_1.HttpRequest({
        protocol,
        hostname,
        port,
        method: "PUT",
        headers,
        path: resolvedPath,
        query,
        body,
    });
};
exports.serializeAws_restXmlPutBucketInventoryConfigurationCommand = serializeAws_restXmlPutBucketInventoryConfigurationCommand;
const serializeAws_restXmlPutBucketLifecycleConfigurationCommand = async (input, context) => {
    const headers = {
        "content-type": "application/xml",
        ...(isSerializableHeaderValue(input.ExpectedBucketOwner) && {
            "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
        }),
    };
    let resolvedPath = "/{Bucket}";
    if (input.Bucket !== undefined) {
        const labelValue = input.Bucket;
        if (labelValue.length <= 0) {
            throw new Error("Empty value provided for input HTTP label: Bucket.");
        }
        resolvedPath = resolvedPath.replace("{Bucket}", smithy_client_1.extendedEncodeURIComponent(labelValue));
    }
    else {
        throw new Error("No value provided for input HTTP label: Bucket.");
    }
    const query = {
        lifecycle: "",
    };
    let body;
    let contents;
    if (input.LifecycleConfiguration !== undefined) {
        contents = serializeAws_restXmlBucketLifecycleConfiguration(input.LifecycleConfiguration, context);
        body = '<?xml version="1.0" encoding="UTF-8"?>';
        contents.addAttribute("xmlns", "http://s3.amazonaws.com/doc/2006-03-01/");
        body += contents.toString();
    }
    const { hostname, protocol = "https", port } = await context.endpoint();
    return new protocol_http_1.HttpRequest({
        protocol,
        hostname,
        port,
        method: "PUT",
        headers,
        path: resolvedPath,
        query,
        body,
    });
};
exports.serializeAws_restXmlPutBucketLifecycleConfigurationCommand = serializeAws_restXmlPutBucketLifecycleConfigurationCommand;
const serializeAws_restXmlPutBucketLoggingCommand = async (input, context) => {
    const headers = {
        "content-type": "application/xml",
        ...(isSerializableHeaderValue(input.ContentMD5) && { "Content-MD5": input.ContentMD5 }),
        ...(isSerializableHeaderValue(input.ExpectedBucketOwner) && {
            "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
        }),
    };
    let resolvedPath = "/{Bucket}";
    if (input.Bucket !== undefined) {
        const labelValue = input.Bucket;
        if (labelValue.length <= 0) {
            throw new Error("Empty value provided for input HTTP label: Bucket.");
        }
        resolvedPath = resolvedPath.replace("{Bucket}", smithy_client_1.extendedEncodeURIComponent(labelValue));
    }
    else {
        throw new Error("No value provided for input HTTP label: Bucket.");
    }
    const query = {
        logging: "",
    };
    let body;
    let contents;
    if (input.BucketLoggingStatus !== undefined) {
        contents = serializeAws_restXmlBucketLoggingStatus(input.BucketLoggingStatus, context);
        body = '<?xml version="1.0" encoding="UTF-8"?>';
        contents.addAttribute("xmlns", "http://s3.amazonaws.com/doc/2006-03-01/");
        body += contents.toString();
    }
    const { hostname, protocol = "https", port } = await context.endpoint();
    return new protocol_http_1.HttpRequest({
        protocol,
        hostname,
        port,
        method: "PUT",
        headers,
        path: resolvedPath,
        query,
        body,
    });
};
exports.serializeAws_restXmlPutBucketLoggingCommand = serializeAws_restXmlPutBucketLoggingCommand;
const serializeAws_restXmlPutBucketMetricsConfigurationCommand = async (input, context) => {
    const headers = {
        "content-type": "application/xml",
        ...(isSerializableHeaderValue(input.ExpectedBucketOwner) && {
            "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
        }),
    };
    let resolvedPath = "/{Bucket}";
    if (input.Bucket !== undefined) {
        const labelValue = input.Bucket;
        if (labelValue.length <= 0) {
            throw new Error("Empty value provided for input HTTP label: Bucket.");
        }
        resolvedPath = resolvedPath.replace("{Bucket}", smithy_client_1.extendedEncodeURIComponent(labelValue));
    }
    else {
        throw new Error("No value provided for input HTTP label: Bucket.");
    }
    const query = {
        metrics: "",
        ...(input.Id !== undefined && { id: input.Id }),
    };
    let body;
    let contents;
    if (input.MetricsConfiguration !== undefined) {
        contents = serializeAws_restXmlMetricsConfiguration(input.MetricsConfiguration, context);
        body = '<?xml version="1.0" encoding="UTF-8"?>';
        contents.addAttribute("xmlns", "http://s3.amazonaws.com/doc/2006-03-01/");
        body += contents.toString();
    }
    const { hostname, protocol = "https", port } = await context.endpoint();
    return new protocol_http_1.HttpRequest({
        protocol,
        hostname,
        port,
        method: "PUT",
        headers,
        path: resolvedPath,
        query,
        body,
    });
};
exports.serializeAws_restXmlPutBucketMetricsConfigurationCommand = serializeAws_restXmlPutBucketMetricsConfigurationCommand;
const serializeAws_restXmlPutBucketNotificationConfigurationCommand = async (input, context) => {
    const headers = {
        "content-type": "application/xml",
        ...(isSerializableHeaderValue(input.ExpectedBucketOwner) && {
            "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
        }),
    };
    let resolvedPath = "/{Bucket}";
    if (input.Bucket !== undefined) {
        const labelValue = input.Bucket;
        if (labelValue.length <= 0) {
            throw new Error("Empty value provided for input HTTP label: Bucket.");
        }
        resolvedPath = resolvedPath.replace("{Bucket}", smithy_client_1.extendedEncodeURIComponent(labelValue));
    }
    else {
        throw new Error("No value provided for input HTTP label: Bucket.");
    }
    const query = {
        notification: "",
    };
    let body;
    let contents;
    if (input.NotificationConfiguration !== undefined) {
        contents = serializeAws_restXmlNotificationConfiguration(input.NotificationConfiguration, context);
        body = '<?xml version="1.0" encoding="UTF-8"?>';
        contents.addAttribute("xmlns", "http://s3.amazonaws.com/doc/2006-03-01/");
        body += contents.toString();
    }
    const { hostname, protocol = "https", port } = await context.endpoint();
    return new protocol_http_1.HttpRequest({
        protocol,
        hostname,
        port,
        method: "PUT",
        headers,
        path: resolvedPath,
        query,
        body,
    });
};
exports.serializeAws_restXmlPutBucketNotificationConfigurationCommand = serializeAws_restXmlPutBucketNotificationConfigurationCommand;
const serializeAws_restXmlPutBucketOwnershipControlsCommand = async (input, context) => {
    const headers = {
        "content-type": "application/xml",
        ...(isSerializableHeaderValue(input.ContentMD5) && { "Content-MD5": input.ContentMD5 }),
        ...(isSerializableHeaderValue(input.ExpectedBucketOwner) && {
            "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
        }),
    };
    let resolvedPath = "/{Bucket}";
    if (input.Bucket !== undefined) {
        const labelValue = input.Bucket;
        if (labelValue.length <= 0) {
            throw new Error("Empty value provided for input HTTP label: Bucket.");
        }
        resolvedPath = resolvedPath.replace("{Bucket}", smithy_client_1.extendedEncodeURIComponent(labelValue));
    }
    else {
        throw new Error("No value provided for input HTTP label: Bucket.");
    }
    const query = {
        ownershipControls: "",
    };
    let body;
    let contents;
    if (input.OwnershipControls !== undefined) {
        contents = serializeAws_restXmlOwnershipControls(input.OwnershipControls, context);
        body = '<?xml version="1.0" encoding="UTF-8"?>';
        contents.addAttribute("xmlns", "http://s3.amazonaws.com/doc/2006-03-01/");
        body += contents.toString();
    }
    const { hostname, protocol = "https", port } = await context.endpoint();
    return new protocol_http_1.HttpRequest({
        protocol,
        hostname,
        port,
        method: "PUT",
        headers,
        path: resolvedPath,
        query,
        body,
    });
};
exports.serializeAws_restXmlPutBucketOwnershipControlsCommand = serializeAws_restXmlPutBucketOwnershipControlsCommand;
const serializeAws_restXmlPutBucketPolicyCommand = async (input, context) => {
    const headers = {
        "content-type": "text/plain",
        ...(isSerializableHeaderValue(input.ContentMD5) && { "Content-MD5": input.ContentMD5 }),
        ...(isSerializableHeaderValue(input.ConfirmRemoveSelfBucketAccess) && {
            "x-amz-confirm-remove-self-bucket-access": input.ConfirmRemoveSelfBucketAccess.toString(),
        }),
        ...(isSerializableHeaderValue(input.ExpectedBucketOwner) && {
            "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
        }),
    };
    let resolvedPath = "/{Bucket}";
    if (input.Bucket !== undefined) {
        const labelValue = input.Bucket;
        if (labelValue.length <= 0) {
            throw new Error("Empty value provided for input HTTP label: Bucket.");
        }
        resolvedPath = resolvedPath.replace("{Bucket}", smithy_client_1.extendedEncodeURIComponent(labelValue));
    }
    else {
        throw new Error("No value provided for input HTTP label: Bucket.");
    }
    const query = {
        policy: "",
    };
    let body;
    let contents;
    if (input.Policy !== undefined) {
        contents = input.Policy;
        body = contents;
    }
    const { hostname, protocol = "https", port } = await context.endpoint();
    return new protocol_http_1.HttpRequest({
        protocol,
        hostname,
        port,
        method: "PUT",
        headers,
        path: resolvedPath,
        query,
        body,
    });
};
exports.serializeAws_restXmlPutBucketPolicyCommand = serializeAws_restXmlPutBucketPolicyCommand;
const serializeAws_restXmlPutBucketReplicationCommand = async (input, context) => {
    const headers = {
        "content-type": "application/xml",
        ...(isSerializableHeaderValue(input.ContentMD5) && { "Content-MD5": input.ContentMD5 }),
        ...(isSerializableHeaderValue(input.Token) && { "x-amz-bucket-object-lock-token": input.Token }),
        ...(isSerializableHeaderValue(input.ExpectedBucketOwner) && {
            "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
        }),
    };
    let resolvedPath = "/{Bucket}";
    if (input.Bucket !== undefined) {
        const labelValue = input.Bucket;
        if (labelValue.length <= 0) {
            throw new Error("Empty value provided for input HTTP label: Bucket.");
        }
        resolvedPath = resolvedPath.replace("{Bucket}", smithy_client_1.extendedEncodeURIComponent(labelValue));
    }
    else {
        throw new Error("No value provided for input HTTP label: Bucket.");
    }
    const query = {
        replication: "",
    };
    let body;
    let contents;
    if (input.ReplicationConfiguration !== undefined) {
        contents = serializeAws_restXmlReplicationConfiguration(input.ReplicationConfiguration, context);
        body = '<?xml version="1.0" encoding="UTF-8"?>';
        contents.addAttribute("xmlns", "http://s3.amazonaws.com/doc/2006-03-01/");
        body += contents.toString();
    }
    const { hostname, protocol = "https", port } = await context.endpoint();
    return new protocol_http_1.HttpRequest({
        protocol,
        hostname,
        port,
        method: "PUT",
        headers,
        path: resolvedPath,
        query,
        body,
    });
};
exports.serializeAws_restXmlPutBucketReplicationCommand = serializeAws_restXmlPutBucketReplicationCommand;
const serializeAws_restXmlPutBucketRequestPaymentCommand = async (input, context) => {
    const headers = {
        "content-type": "application/xml",
        ...(isSerializableHeaderValue(input.ContentMD5) && { "Content-MD5": input.ContentMD5 }),
        ...(isSerializableHeaderValue(input.ExpectedBucketOwner) && {
            "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
        }),
    };
    let resolvedPath = "/{Bucket}";
    if (input.Bucket !== undefined) {
        const labelValue = input.Bucket;
        if (labelValue.length <= 0) {
            throw new Error("Empty value provided for input HTTP label: Bucket.");
        }
        resolvedPath = resolvedPath.replace("{Bucket}", smithy_client_1.extendedEncodeURIComponent(labelValue));
    }
    else {
        throw new Error("No value provided for input HTTP label: Bucket.");
    }
    const query = {
        requestPayment: "",
    };
    let body;
    let contents;
    if (input.RequestPaymentConfiguration !== undefined) {
        contents = serializeAws_restXmlRequestPaymentConfiguration(input.RequestPaymentConfiguration, context);
        body = '<?xml version="1.0" encoding="UTF-8"?>';
        contents.addAttribute("xmlns", "http://s3.amazonaws.com/doc/2006-03-01/");
        body += contents.toString();
    }
    const { hostname, protocol = "https", port } = await context.endpoint();
    return new protocol_http_1.HttpRequest({
        protocol,
        hostname,
        port,
        method: "PUT",
        headers,
        path: resolvedPath,
        query,
        body,
    });
};
exports.serializeAws_restXmlPutBucketRequestPaymentCommand = serializeAws_restXmlPutBucketRequestPaymentCommand;
const serializeAws_restXmlPutBucketTaggingCommand = async (input, context) => {
    const headers = {
        "content-type": "application/xml",
        ...(isSerializableHeaderValue(input.ContentMD5) && { "Content-MD5": input.ContentMD5 }),
        ...(isSerializableHeaderValue(input.ExpectedBucketOwner) && {
            "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
        }),
    };
    let resolvedPath = "/{Bucket}";
    if (input.Bucket !== undefined) {
        const labelValue = input.Bucket;
        if (labelValue.length <= 0) {
            throw new Error("Empty value provided for input HTTP label: Bucket.");
        }
        resolvedPath = resolvedPath.replace("{Bucket}", smithy_client_1.extendedEncodeURIComponent(labelValue));
    }
    else {
        throw new Error("No value provided for input HTTP label: Bucket.");
    }
    const query = {
        tagging: "",
    };
    let body;
    let contents;
    if (input.Tagging !== undefined) {
        contents = serializeAws_restXmlTagging(input.Tagging, context);
        body = '<?xml version="1.0" encoding="UTF-8"?>';
        contents.addAttribute("xmlns", "http://s3.amazonaws.com/doc/2006-03-01/");
        body += contents.toString();
    }
    const { hostname, protocol = "https", port } = await context.endpoint();
    return new protocol_http_1.HttpRequest({
        protocol,
        hostname,
        port,
        method: "PUT",
        headers,
        path: resolvedPath,
        query,
        body,
    });
};
exports.serializeAws_restXmlPutBucketTaggingCommand = serializeAws_restXmlPutBucketTaggingCommand;
const serializeAws_restXmlPutBucketVersioningCommand = async (input, context) => {
    const headers = {
        "content-type": "application/xml",
        ...(isSerializableHeaderValue(input.ContentMD5) && { "Content-MD5": input.ContentMD5 }),
        ...(isSerializableHeaderValue(input.MFA) && { "x-amz-mfa": input.MFA }),
        ...(isSerializableHeaderValue(input.ExpectedBucketOwner) && {
            "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
        }),
    };
    let resolvedPath = "/{Bucket}";
    if (input.Bucket !== undefined) {
        const labelValue = input.Bucket;
        if (labelValue.length <= 0) {
            throw new Error("Empty value provided for input HTTP label: Bucket.");
        }
        resolvedPath = resolvedPath.replace("{Bucket}", smithy_client_1.extendedEncodeURIComponent(labelValue));
    }
    else {
        throw new Error("No value provided for input HTTP label: Bucket.");
    }
    const query = {
        versioning: "",
    };
    let body;
    let contents;
    if (input.VersioningConfiguration !== undefined) {
        contents = serializeAws_restXmlVersioningConfiguration(input.VersioningConfiguration, context);
        body = '<?xml version="1.0" encoding="UTF-8"?>';
        contents.addAttribute("xmlns", "http://s3.amazonaws.com/doc/2006-03-01/");
        body += contents.toString();
    }
    const { hostname, protocol = "https", port } = await context.endpoint();
    return new protocol_http_1.HttpRequest({
        protocol,
        hostname,
        port,
        method: "PUT",
        headers,
        path: resolvedPath,
        query,
        body,
    });
};
exports.serializeAws_restXmlPutBucketVersioningCommand = serializeAws_restXmlPutBucketVersioningCommand;
const serializeAws_restXmlPutBucketWebsiteCommand = async (input, context) => {
    const headers = {
        "content-type": "application/xml",
        ...(isSerializableHeaderValue(input.ContentMD5) && { "Content-MD5": input.ContentMD5 }),
        ...(isSerializableHeaderValue(input.ExpectedBucketOwner) && {
            "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
        }),
    };
    let resolvedPath = "/{Bucket}";
    if (input.Bucket !== undefined) {
        const labelValue = input.Bucket;
        if (labelValue.length <= 0) {
            throw new Error("Empty value provided for input HTTP label: Bucket.");
        }
        resolvedPath = resolvedPath.replace("{Bucket}", smithy_client_1.extendedEncodeURIComponent(labelValue));
    }
    else {
        throw new Error("No value provided for input HTTP label: Bucket.");
    }
    const query = {
        website: "",
    };
    let body;
    let contents;
    if (input.WebsiteConfiguration !== undefined) {
        contents = serializeAws_restXmlWebsiteConfiguration(input.WebsiteConfiguration, context);
        body = '<?xml version="1.0" encoding="UTF-8"?>';
        contents.addAttribute("xmlns", "http://s3.amazonaws.com/doc/2006-03-01/");
        body += contents.toString();
    }
    const { hostname, protocol = "https", port } = await context.endpoint();
    return new protocol_http_1.HttpRequest({
        protocol,
        hostname,
        port,
        method: "PUT",
        headers,
        path: resolvedPath,
        query,
        body,
    });
};
exports.serializeAws_restXmlPutBucketWebsiteCommand = serializeAws_restXmlPutBucketWebsiteCommand;
const serializeAws_restXmlPutObjectCommand = async (input, context) => {
    const headers = {
        "content-type": "application/octet-stream",
        ...(isSerializableHeaderValue(input.ACL) && { "x-amz-acl": input.ACL }),
        ...(isSerializableHeaderValue(input.CacheControl) && { "Cache-Control": input.CacheControl }),
        ...(isSerializableHeaderValue(input.ContentDisposition) && { "Content-Disposition": input.ContentDisposition }),
        ...(isSerializableHeaderValue(input.ContentEncoding) && { "Content-Encoding": input.ContentEncoding }),
        ...(isSerializableHeaderValue(input.ContentLanguage) && { "Content-Language": input.ContentLanguage }),
        ...(isSerializableHeaderValue(input.ContentLength) && { "Content-Length": input.ContentLength.toString() }),
        ...(isSerializableHeaderValue(input.ContentMD5) && { "Content-MD5": input.ContentMD5 }),
        ...(isSerializableHeaderValue(input.ContentType) && { "Content-Type": input.ContentType }),
        ...(isSerializableHeaderValue(input.Expires) && { Expires: smithy_client_1.dateToUtcString(input.Expires).toString() }),
        ...(isSerializableHeaderValue(input.GrantFullControl) && { "x-amz-grant-full-control": input.GrantFullControl }),
        ...(isSerializableHeaderValue(input.GrantRead) && { "x-amz-grant-read": input.GrantRead }),
        ...(isSerializableHeaderValue(input.GrantReadACP) && { "x-amz-grant-read-acp": input.GrantReadACP }),
        ...(isSerializableHeaderValue(input.GrantWriteACP) && { "x-amz-grant-write-acp": input.GrantWriteACP }),
        ...(isSerializableHeaderValue(input.ServerSideEncryption) && {
            "x-amz-server-side-encryption": input.ServerSideEncryption,
        }),
        ...(isSerializableHeaderValue(input.StorageClass) && { "x-amz-storage-class": input.StorageClass }),
        ...(isSerializableHeaderValue(input.WebsiteRedirectLocation) && {
            "x-amz-website-redirect-location": input.WebsiteRedirectLocation,
        }),
        ...(isSerializableHeaderValue(input.SSECustomerAlgorithm) && {
            "x-amz-server-side-encryption-customer-algorithm": input.SSECustomerAlgorithm,
        }),
        ...(isSerializableHeaderValue(input.SSECustomerKey) && {
            "x-amz-server-side-encryption-customer-key": input.SSECustomerKey,
        }),
        ...(isSerializableHeaderValue(input.SSECustomerKeyMD5) && {
            "x-amz-server-side-encryption-customer-key-MD5": input.SSECustomerKeyMD5,
        }),
        ...(isSerializableHeaderValue(input.SSEKMSKeyId) && {
            "x-amz-server-side-encryption-aws-kms-key-id": input.SSEKMSKeyId,
        }),
        ...(isSerializableHeaderValue(input.SSEKMSEncryptionContext) && {
            "x-amz-server-side-encryption-context": input.SSEKMSEncryptionContext,
        }),
        ...(isSerializableHeaderValue(input.BucketKeyEnabled) && {
            "x-amz-server-side-encryption-bucket-key-enabled": input.BucketKeyEnabled.toString(),
        }),
        ...(isSerializableHeaderValue(input.RequestPayer) && { "x-amz-request-payer": input.RequestPayer }),
        ...(isSerializableHeaderValue(input.Tagging) && { "x-amz-tagging": input.Tagging }),
        ...(isSerializableHeaderValue(input.ObjectLockMode) && { "x-amz-object-lock-mode": input.ObjectLockMode }),
        ...(isSerializableHeaderValue(input.ObjectLockRetainUntilDate) && {
            "x-amz-object-lock-retain-until-date": (input.ObjectLockRetainUntilDate.toISOString().split(".")[0] + "Z").toString(),
        }),
        ...(isSerializableHeaderValue(input.ObjectLockLegalHoldStatus) && {
            "x-amz-object-lock-legal-hold": input.ObjectLockLegalHoldStatus,
        }),
        ...(isSerializableHeaderValue(input.ExpectedBucketOwner) && {
            "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
        }),
        ...(input.Metadata !== undefined &&
            Object.keys(input.Metadata).reduce((acc, suffix) => {
                acc["x-amz-meta-" + suffix] = input.Metadata[suffix];
                return acc;
            }, {})),
    };
    let resolvedPath = "/{Bucket}/{Key+}";
    if (input.Bucket !== undefined) {
        const labelValue = input.Bucket;
        if (labelValue.length <= 0) {
            throw new Error("Empty value provided for input HTTP label: Bucket.");
        }
        resolvedPath = resolvedPath.replace("{Bucket}", smithy_client_1.extendedEncodeURIComponent(labelValue));
    }
    else {
        throw new Error("No value provided for input HTTP label: Bucket.");
    }
    if (input.Key !== undefined) {
        const labelValue = input.Key;
        if (labelValue.length <= 0) {
            throw new Error("Empty value provided for input HTTP label: Key.");
        }
        resolvedPath = resolvedPath.replace("{Key+}", labelValue
            .split("/")
            .map((segment) => smithy_client_1.extendedEncodeURIComponent(segment))
            .join("/"));
    }
    else {
        throw new Error("No value provided for input HTTP label: Key.");
    }
    const query = {
        "x-id": "PutObject",
    };
    let body;
    let contents;
    if (input.Body !== undefined) {
        contents = input.Body;
        body = contents;
    }
    const { hostname, protocol = "https", port } = await context.endpoint();
    return new protocol_http_1.HttpRequest({
        protocol,
        hostname,
        port,
        method: "PUT",
        headers,
        path: resolvedPath,
        query,
        body,
    });
};
exports.serializeAws_restXmlPutObjectCommand = serializeAws_restXmlPutObjectCommand;
const serializeAws_restXmlPutObjectAclCommand = async (input, context) => {
    const headers = {
        "content-type": "application/xml",
        ...(isSerializableHeaderValue(input.ACL) && { "x-amz-acl": input.ACL }),
        ...(isSerializableHeaderValue(input.ContentMD5) && { "Content-MD5": input.ContentMD5 }),
        ...(isSerializableHeaderValue(input.GrantFullControl) && { "x-amz-grant-full-control": input.GrantFullControl }),
        ...(isSerializableHeaderValue(input.GrantRead) && { "x-amz-grant-read": input.GrantRead }),
        ...(isSerializableHeaderValue(input.GrantReadACP) && { "x-amz-grant-read-acp": input.GrantReadACP }),
        ...(isSerializableHeaderValue(input.GrantWrite) && { "x-amz-grant-write": input.GrantWrite }),
        ...(isSerializableHeaderValue(input.GrantWriteACP) && { "x-amz-grant-write-acp": input.GrantWriteACP }),
        ...(isSerializableHeaderValue(input.RequestPayer) && { "x-amz-request-payer": input.RequestPayer }),
        ...(isSerializableHeaderValue(input.ExpectedBucketOwner) && {
            "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
        }),
    };
    let resolvedPath = "/{Bucket}/{Key+}";
    if (input.Bucket !== undefined) {
        const labelValue = input.Bucket;
        if (labelValue.length <= 0) {
            throw new Error("Empty value provided for input HTTP label: Bucket.");
        }
        resolvedPath = resolvedPath.replace("{Bucket}", smithy_client_1.extendedEncodeURIComponent(labelValue));
    }
    else {
        throw new Error("No value provided for input HTTP label: Bucket.");
    }
    if (input.Key !== undefined) {
        const labelValue = input.Key;
        if (labelValue.length <= 0) {
            throw new Error("Empty value provided for input HTTP label: Key.");
        }
        resolvedPath = resolvedPath.replace("{Key+}", labelValue
            .split("/")
            .map((segment) => smithy_client_1.extendedEncodeURIComponent(segment))
            .join("/"));
    }
    else {
        throw new Error("No value provided for input HTTP label: Key.");
    }
    const query = {
        acl: "",
        ...(input.VersionId !== undefined && { versionId: input.VersionId }),
    };
    let body;
    let contents;
    if (input.AccessControlPolicy !== undefined) {
        contents = serializeAws_restXmlAccessControlPolicy(input.AccessControlPolicy, context);
        body = '<?xml version="1.0" encoding="UTF-8"?>';
        contents.addAttribute("xmlns", "http://s3.amazonaws.com/doc/2006-03-01/");
        body += contents.toString();
    }
    const { hostname, protocol = "https", port } = await context.endpoint();
    return new protocol_http_1.HttpRequest({
        protocol,
        hostname,
        port,
        method: "PUT",
        headers,
        path: resolvedPath,
        query,
        body,
    });
};
exports.serializeAws_restXmlPutObjectAclCommand = serializeAws_restXmlPutObjectAclCommand;
const serializeAws_restXmlPutObjectLegalHoldCommand = async (input, context) => {
    const headers = {
        "content-type": "application/xml",
        ...(isSerializableHeaderValue(input.RequestPayer) && { "x-amz-request-payer": input.RequestPayer }),
        ...(isSerializableHeaderValue(input.ContentMD5) && { "Content-MD5": input.ContentMD5 }),
        ...(isSerializableHeaderValue(input.ExpectedBucketOwner) && {
            "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
        }),
    };
    let resolvedPath = "/{Bucket}/{Key+}";
    if (input.Bucket !== undefined) {
        const labelValue = input.Bucket;
        if (labelValue.length <= 0) {
            throw new Error("Empty value provided for input HTTP label: Bucket.");
        }
        resolvedPath = resolvedPath.replace("{Bucket}", smithy_client_1.extendedEncodeURIComponent(labelValue));
    }
    else {
        throw new Error("No value provided for input HTTP label: Bucket.");
    }
    if (input.Key !== undefined) {
        const labelValue = input.Key;
        if (labelValue.length <= 0) {
            throw new Error("Empty value provided for input HTTP label: Key.");
        }
        resolvedPath = resolvedPath.replace("{Key+}", labelValue
            .split("/")
            .map((segment) => smithy_client_1.extendedEncodeURIComponent(segment))
            .join("/"));
    }
    else {
        throw new Error("No value provided for input HTTP label: Key.");
    }
    const query = {
        "legal-hold": "",
        ...(input.VersionId !== undefined && { versionId: input.VersionId }),
    };
    let body;
    let contents;
    if (input.LegalHold !== undefined) {
        contents = serializeAws_restXmlObjectLockLegalHold(input.LegalHold, context);
        body = '<?xml version="1.0" encoding="UTF-8"?>';
        contents.addAttribute("xmlns", "http://s3.amazonaws.com/doc/2006-03-01/");
        body += contents.toString();
    }
    const { hostname, protocol = "https", port } = await context.endpoint();
    return new protocol_http_1.HttpRequest({
        protocol,
        hostname,
        port,
        method: "PUT",
        headers,
        path: resolvedPath,
        query,
        body,
    });
};
exports.serializeAws_restXmlPutObjectLegalHoldCommand = serializeAws_restXmlPutObjectLegalHoldCommand;
const serializeAws_restXmlPutObjectLockConfigurationCommand = async (input, context) => {
    const headers = {
        "content-type": "application/xml",
        ...(isSerializableHeaderValue(input.RequestPayer) && { "x-amz-request-payer": input.RequestPayer }),
        ...(isSerializableHeaderValue(input.Token) && { "x-amz-bucket-object-lock-token": input.Token }),
        ...(isSerializableHeaderValue(input.ContentMD5) && { "Content-MD5": input.ContentMD5 }),
        ...(isSerializableHeaderValue(input.ExpectedBucketOwner) && {
            "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
        }),
    };
    let resolvedPath = "/{Bucket}";
    if (input.Bucket !== undefined) {
        const labelValue = input.Bucket;
        if (labelValue.length <= 0) {
            throw new Error("Empty value provided for input HTTP label: Bucket.");
        }
        resolvedPath = resolvedPath.replace("{Bucket}", smithy_client_1.extendedEncodeURIComponent(labelValue));
    }
    else {
        throw new Error("No value provided for input HTTP label: Bucket.");
    }
    const query = {
        "object-lock": "",
    };
    let body;
    let contents;
    if (input.ObjectLockConfiguration !== undefined) {
        contents = serializeAws_restXmlObjectLockConfiguration(input.ObjectLockConfiguration, context);
        body = '<?xml version="1.0" encoding="UTF-8"?>';
        contents.addAttribute("xmlns", "http://s3.amazonaws.com/doc/2006-03-01/");
        body += contents.toString();
    }
    const { hostname, protocol = "https", port } = await context.endpoint();
    return new protocol_http_1.HttpRequest({
        protocol,
        hostname,
        port,
        method: "PUT",
        headers,
        path: resolvedPath,
        query,
        body,
    });
};
exports.serializeAws_restXmlPutObjectLockConfigurationCommand = serializeAws_restXmlPutObjectLockConfigurationCommand;
const serializeAws_restXmlPutObjectRetentionCommand = async (input, context) => {
    const headers = {
        "content-type": "application/xml",
        ...(isSerializableHeaderValue(input.RequestPayer) && { "x-amz-request-payer": input.RequestPayer }),
        ...(isSerializableHeaderValue(input.BypassGovernanceRetention) && {
            "x-amz-bypass-governance-retention": input.BypassGovernanceRetention.toString(),
        }),
        ...(isSerializableHeaderValue(input.ContentMD5) && { "Content-MD5": input.ContentMD5 }),
        ...(isSerializableHeaderValue(input.ExpectedBucketOwner) && {
            "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
        }),
    };
    let resolvedPath = "/{Bucket}/{Key+}";
    if (input.Bucket !== undefined) {
        const labelValue = input.Bucket;
        if (labelValue.length <= 0) {
            throw new Error("Empty value provided for input HTTP label: Bucket.");
        }
        resolvedPath = resolvedPath.replace("{Bucket}", smithy_client_1.extendedEncodeURIComponent(labelValue));
    }
    else {
        throw new Error("No value provided for input HTTP label: Bucket.");
    }
    if (input.Key !== undefined) {
        const labelValue = input.Key;
        if (labelValue.length <= 0) {
            throw new Error("Empty value provided for input HTTP label: Key.");
        }
        resolvedPath = resolvedPath.replace("{Key+}", labelValue
            .split("/")
            .map((segment) => smithy_client_1.extendedEncodeURIComponent(segment))
            .join("/"));
    }
    else {
        throw new Error("No value provided for input HTTP label: Key.");
    }
    const query = {
        retention: "",
        ...(input.VersionId !== undefined && { versionId: input.VersionId }),
    };
    let body;
    let contents;
    if (input.Retention !== undefined) {
        contents = serializeAws_restXmlObjectLockRetention(input.Retention, context);
        body = '<?xml version="1.0" encoding="UTF-8"?>';
        contents.addAttribute("xmlns", "http://s3.amazonaws.com/doc/2006-03-01/");
        body += contents.toString();
    }
    const { hostname, protocol = "https", port } = await context.endpoint();
    return new protocol_http_1.HttpRequest({
        protocol,
        hostname,
        port,
        method: "PUT",
        headers,
        path: resolvedPath,
        query,
        body,
    });
};
exports.serializeAws_restXmlPutObjectRetentionCommand = serializeAws_restXmlPutObjectRetentionCommand;
const serializeAws_restXmlPutObjectTaggingCommand = async (input, context) => {
    const headers = {
        "content-type": "application/xml",
        ...(isSerializableHeaderValue(input.ContentMD5) && { "Content-MD5": input.ContentMD5 }),
        ...(isSerializableHeaderValue(input.ExpectedBucketOwner) && {
            "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
        }),
    };
    let resolvedPath = "/{Bucket}/{Key+}";
    if (input.Bucket !== undefined) {
        const labelValue = input.Bucket;
        if (labelValue.length <= 0) {
            throw new Error("Empty value provided for input HTTP label: Bucket.");
        }
        resolvedPath = resolvedPath.replace("{Bucket}", smithy_client_1.extendedEncodeURIComponent(labelValue));
    }
    else {
        throw new Error("No value provided for input HTTP label: Bucket.");
    }
    if (input.Key !== undefined) {
        const labelValue = input.Key;
        if (labelValue.length <= 0) {
            throw new Error("Empty value provided for input HTTP label: Key.");
        }
        resolvedPath = resolvedPath.replace("{Key+}", labelValue
            .split("/")
            .map((segment) => smithy_client_1.extendedEncodeURIComponent(segment))
            .join("/"));
    }
    else {
        throw new Error("No value provided for input HTTP label: Key.");
    }
    const query = {
        tagging: "",
        ...(input.VersionId !== undefined && { versionId: input.VersionId }),
    };
    let body;
    let contents;
    if (input.Tagging !== undefined) {
        contents = serializeAws_restXmlTagging(input.Tagging, context);
        body = '<?xml version="1.0" encoding="UTF-8"?>';
        contents.addAttribute("xmlns", "http://s3.amazonaws.com/doc/2006-03-01/");
        body += contents.toString();
    }
    const { hostname, protocol = "https", port } = await context.endpoint();
    return new protocol_http_1.HttpRequest({
        protocol,
        hostname,
        port,
        method: "PUT",
        headers,
        path: resolvedPath,
        query,
        body,
    });
};
exports.serializeAws_restXmlPutObjectTaggingCommand = serializeAws_restXmlPutObjectTaggingCommand;
const serializeAws_restXmlPutPublicAccessBlockCommand = async (input, context) => {
    const headers = {
        "content-type": "application/xml",
        ...(isSerializableHeaderValue(input.ContentMD5) && { "Content-MD5": input.ContentMD5 }),
        ...(isSerializableHeaderValue(input.ExpectedBucketOwner) && {
            "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
        }),
    };
    let resolvedPath = "/{Bucket}";
    if (input.Bucket !== undefined) {
        const labelValue = input.Bucket;
        if (labelValue.length <= 0) {
            throw new Error("Empty value provided for input HTTP label: Bucket.");
        }
        resolvedPath = resolvedPath.replace("{Bucket}", smithy_client_1.extendedEncodeURIComponent(labelValue));
    }
    else {
        throw new Error("No value provided for input HTTP label: Bucket.");
    }
    const query = {
        publicAccessBlock: "",
    };
    let body;
    let contents;
    if (input.PublicAccessBlockConfiguration !== undefined) {
        contents = serializeAws_restXmlPublicAccessBlockConfiguration(input.PublicAccessBlockConfiguration, context);
        body = '<?xml version="1.0" encoding="UTF-8"?>';
        contents.addAttribute("xmlns", "http://s3.amazonaws.com/doc/2006-03-01/");
        body += contents.toString();
    }
    const { hostname, protocol = "https", port } = await context.endpoint();
    return new protocol_http_1.HttpRequest({
        protocol,
        hostname,
        port,
        method: "PUT",
        headers,
        path: resolvedPath,
        query,
        body,
    });
};
exports.serializeAws_restXmlPutPublicAccessBlockCommand = serializeAws_restXmlPutPublicAccessBlockCommand;
const serializeAws_restXmlRestoreObjectCommand = async (input, context) => {
    const headers = {
        "content-type": "application/xml",
        ...(isSerializableHeaderValue(input.RequestPayer) && { "x-amz-request-payer": input.RequestPayer }),
        ...(isSerializableHeaderValue(input.ExpectedBucketOwner) && {
            "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
        }),
    };
    let resolvedPath = "/{Bucket}/{Key+}";
    if (input.Bucket !== undefined) {
        const labelValue = input.Bucket;
        if (labelValue.length <= 0) {
            throw new Error("Empty value provided for input HTTP label: Bucket.");
        }
        resolvedPath = resolvedPath.replace("{Bucket}", smithy_client_1.extendedEncodeURIComponent(labelValue));
    }
    else {
        throw new Error("No value provided for input HTTP label: Bucket.");
    }
    if (input.Key !== undefined) {
        const labelValue = input.Key;
        if (labelValue.length <= 0) {
            throw new Error("Empty value provided for input HTTP label: Key.");
        }
        resolvedPath = resolvedPath.replace("{Key+}", labelValue
            .split("/")
            .map((segment) => smithy_client_1.extendedEncodeURIComponent(segment))
            .join("/"));
    }
    else {
        throw new Error("No value provided for input HTTP label: Key.");
    }
    const query = {
        restore: "",
        ...(input.VersionId !== undefined && { versionId: input.VersionId }),
    };
    let body;
    let contents;
    if (input.RestoreRequest !== undefined) {
        contents = serializeAws_restXmlRestoreRequest(input.RestoreRequest, context);
        body = '<?xml version="1.0" encoding="UTF-8"?>';
        contents.addAttribute("xmlns", "http://s3.amazonaws.com/doc/2006-03-01/");
        body += contents.toString();
    }
    const { hostname, protocol = "https", port } = await context.endpoint();
    return new protocol_http_1.HttpRequest({
        protocol,
        hostname,
        port,
        method: "POST",
        headers,
        path: resolvedPath,
        query,
        body,
    });
};
exports.serializeAws_restXmlRestoreObjectCommand = serializeAws_restXmlRestoreObjectCommand;
const serializeAws_restXmlSelectObjectContentCommand = async (input, context) => {
    const headers = {
        "content-type": "application/xml",
        ...(isSerializableHeaderValue(input.SSECustomerAlgorithm) && {
            "x-amz-server-side-encryption-customer-algorithm": input.SSECustomerAlgorithm,
        }),
        ...(isSerializableHeaderValue(input.SSECustomerKey) && {
            "x-amz-server-side-encryption-customer-key": input.SSECustomerKey,
        }),
        ...(isSerializableHeaderValue(input.SSECustomerKeyMD5) && {
            "x-amz-server-side-encryption-customer-key-MD5": input.SSECustomerKeyMD5,
        }),
        ...(isSerializableHeaderValue(input.ExpectedBucketOwner) && {
            "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
        }),
    };
    let resolvedPath = "/{Bucket}/{Key+}";
    if (input.Bucket !== undefined) {
        const labelValue = input.Bucket;
        if (labelValue.length <= 0) {
            throw new Error("Empty value provided for input HTTP label: Bucket.");
        }
        resolvedPath = resolvedPath.replace("{Bucket}", smithy_client_1.extendedEncodeURIComponent(labelValue));
    }
    else {
        throw new Error("No value provided for input HTTP label: Bucket.");
    }
    if (input.Key !== undefined) {
        const labelValue = input.Key;
        if (labelValue.length <= 0) {
            throw new Error("Empty value provided for input HTTP label: Key.");
        }
        resolvedPath = resolvedPath.replace("{Key+}", labelValue
            .split("/")
            .map((segment) => smithy_client_1.extendedEncodeURIComponent(segment))
            .join("/"));
    }
    else {
        throw new Error("No value provided for input HTTP label: Key.");
    }
    const query = {
        select: "",
        "select-type": "2",
    };
    let body;
    body = '<?xml version="1.0" encoding="UTF-8"?>';
    const bodyNode = new xml_builder_1.XmlNode("SelectObjectContentRequest");
    bodyNode.addAttribute("xmlns", "http://s3.amazonaws.com/doc/2006-03-01/");
    if (input.Expression !== undefined) {
        const node = new xml_builder_1.XmlNode("Expression").addChildNode(new xml_builder_1.XmlText(input.Expression)).withName("Expression");
        bodyNode.addChildNode(node);
    }
    if (input.ExpressionType !== undefined) {
        const node = new xml_builder_1.XmlNode("ExpressionType")
            .addChildNode(new xml_builder_1.XmlText(input.ExpressionType))
            .withName("ExpressionType");
        bodyNode.addChildNode(node);
    }
    if (input.InputSerialization !== undefined) {
        const node = serializeAws_restXmlInputSerialization(input.InputSerialization, context).withName("InputSerialization");
        bodyNode.addChildNode(node);
    }
    if (input.OutputSerialization !== undefined) {
        const node = serializeAws_restXmlOutputSerialization(input.OutputSerialization, context).withName("OutputSerialization");
        bodyNode.addChildNode(node);
    }
    if (input.RequestProgress !== undefined) {
        const node = serializeAws_restXmlRequestProgress(input.RequestProgress, context).withName("RequestProgress");
        bodyNode.addChildNode(node);
    }
    if (input.ScanRange !== undefined) {
        const node = serializeAws_restXmlScanRange(input.ScanRange, context).withName("ScanRange");
        bodyNode.addChildNode(node);
    }
    body += bodyNode.toString();
    const { hostname, protocol = "https", port } = await context.endpoint();
    return new protocol_http_1.HttpRequest({
        protocol,
        hostname,
        port,
        method: "POST",
        headers,
        path: resolvedPath,
        query,
        body,
    });
};
exports.serializeAws_restXmlSelectObjectContentCommand = serializeAws_restXmlSelectObjectContentCommand;
const serializeAws_restXmlUploadPartCommand = async (input, context) => {
    const headers = {
        "content-type": "application/octet-stream",
        ...(isSerializableHeaderValue(input.ContentLength) && { "Content-Length": input.ContentLength.toString() }),
        ...(isSerializableHeaderValue(input.ContentMD5) && { "Content-MD5": input.ContentMD5 }),
        ...(isSerializableHeaderValue(input.SSECustomerAlgorithm) && {
            "x-amz-server-side-encryption-customer-algorithm": input.SSECustomerAlgorithm,
        }),
        ...(isSerializableHeaderValue(input.SSECustomerKey) && {
            "x-amz-server-side-encryption-customer-key": input.SSECustomerKey,
        }),
        ...(isSerializableHeaderValue(input.SSECustomerKeyMD5) && {
            "x-amz-server-side-encryption-customer-key-MD5": input.SSECustomerKeyMD5,
        }),
        ...(isSerializableHeaderValue(input.RequestPayer) && { "x-amz-request-payer": input.RequestPayer }),
        ...(isSerializableHeaderValue(input.ExpectedBucketOwner) && {
            "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
        }),
    };
    let resolvedPath = "/{Bucket}/{Key+}";
    if (input.Bucket !== undefined) {
        const labelValue = input.Bucket;
        if (labelValue.length <= 0) {
            throw new Error("Empty value provided for input HTTP label: Bucket.");
        }
        resolvedPath = resolvedPath.replace("{Bucket}", smithy_client_1.extendedEncodeURIComponent(labelValue));
    }
    else {
        throw new Error("No value provided for input HTTP label: Bucket.");
    }
    if (input.Key !== undefined) {
        const labelValue = input.Key;
        if (labelValue.length <= 0) {
            throw new Error("Empty value provided for input HTTP label: Key.");
        }
        resolvedPath = resolvedPath.replace("{Key+}", labelValue
            .split("/")
            .map((segment) => smithy_client_1.extendedEncodeURIComponent(segment))
            .join("/"));
    }
    else {
        throw new Error("No value provided for input HTTP label: Key.");
    }
    const query = {
        "x-id": "UploadPart",
        ...(input.PartNumber !== undefined && { partNumber: input.PartNumber.toString() }),
        ...(input.UploadId !== undefined && { uploadId: input.UploadId }),
    };
    let body;
    let contents;
    if (input.Body !== undefined) {
        contents = input.Body;
        body = contents;
    }
    const { hostname, protocol = "https", port } = await context.endpoint();
    return new protocol_http_1.HttpRequest({
        protocol,
        hostname,
        port,
        method: "PUT",
        headers,
        path: resolvedPath,
        query,
        body,
    });
};
exports.serializeAws_restXmlUploadPartCommand = serializeAws_restXmlUploadPartCommand;
const serializeAws_restXmlUploadPartCopyCommand = async (input, context) => {
    const headers = {
        ...(isSerializableHeaderValue(input.CopySource) && { "x-amz-copy-source": input.CopySource }),
        ...(isSerializableHeaderValue(input.CopySourceIfMatch) && {
            "x-amz-copy-source-if-match": input.CopySourceIfMatch,
        }),
        ...(isSerializableHeaderValue(input.CopySourceIfModifiedSince) && {
            "x-amz-copy-source-if-modified-since": smithy_client_1.dateToUtcString(input.CopySourceIfModifiedSince).toString(),
        }),
        ...(isSerializableHeaderValue(input.CopySourceIfNoneMatch) && {
            "x-amz-copy-source-if-none-match": input.CopySourceIfNoneMatch,
        }),
        ...(isSerializableHeaderValue(input.CopySourceIfUnmodifiedSince) && {
            "x-amz-copy-source-if-unmodified-since": smithy_client_1.dateToUtcString(input.CopySourceIfUnmodifiedSince).toString(),
        }),
        ...(isSerializableHeaderValue(input.CopySourceRange) && { "x-amz-copy-source-range": input.CopySourceRange }),
        ...(isSerializableHeaderValue(input.SSECustomerAlgorithm) && {
            "x-amz-server-side-encryption-customer-algorithm": input.SSECustomerAlgorithm,
        }),
        ...(isSerializableHeaderValue(input.SSECustomerKey) && {
            "x-amz-server-side-encryption-customer-key": input.SSECustomerKey,
        }),
        ...(isSerializableHeaderValue(input.SSECustomerKeyMD5) && {
            "x-amz-server-side-encryption-customer-key-MD5": input.SSECustomerKeyMD5,
        }),
        ...(isSerializableHeaderValue(input.CopySourceSSECustomerAlgorithm) && {
            "x-amz-copy-source-server-side-encryption-customer-algorithm": input.CopySourceSSECustomerAlgorithm,
        }),
        ...(isSerializableHeaderValue(input.CopySourceSSECustomerKey) && {
            "x-amz-copy-source-server-side-encryption-customer-key": input.CopySourceSSECustomerKey,
        }),
        ...(isSerializableHeaderValue(input.CopySourceSSECustomerKeyMD5) && {
            "x-amz-copy-source-server-side-encryption-customer-key-MD5": input.CopySourceSSECustomerKeyMD5,
        }),
        ...(isSerializableHeaderValue(input.RequestPayer) && { "x-amz-request-payer": input.RequestPayer }),
        ...(isSerializableHeaderValue(input.ExpectedBucketOwner) && {
            "x-amz-expected-bucket-owner": input.ExpectedBucketOwner,
        }),
        ...(isSerializableHeaderValue(input.ExpectedSourceBucketOwner) && {
            "x-amz-source-expected-bucket-owner": input.ExpectedSourceBucketOwner,
        }),
    };
    let resolvedPath = "/{Bucket}/{Key+}";
    if (input.Bucket !== undefined) {
        const labelValue = input.Bucket;
        if (labelValue.length <= 0) {
            throw new Error("Empty value provided for input HTTP label: Bucket.");
        }
        resolvedPath = resolvedPath.replace("{Bucket}", smithy_client_1.extendedEncodeURIComponent(labelValue));
    }
    else {
        throw new Error("No value provided for input HTTP label: Bucket.");
    }
    if (input.Key !== undefined) {
        const labelValue = input.Key;
        if (labelValue.length <= 0) {
            throw new Error("Empty value provided for input HTTP label: Key.");
        }
        resolvedPath = resolvedPath.replace("{Key+}", labelValue
            .split("/")
            .map((segment) => smithy_client_1.extendedEncodeURIComponent(segment))
            .join("/"));
    }
    else {
        throw new Error("No value provided for input HTTP label: Key.");
    }
    const query = {
        "x-id": "UploadPartCopy",
        ...(input.PartNumber !== undefined && { partNumber: input.PartNumber.toString() }),
        ...(input.UploadId !== undefined && { uploadId: input.UploadId }),
    };
    let body;
    const { hostname, protocol = "https", port } = await context.endpoint();
    return new protocol_http_1.HttpRequest({
        protocol,
        hostname,
        port,
        method: "PUT",
        headers,
        path: resolvedPath,
        query,
        body,
    });
};
exports.serializeAws_restXmlUploadPartCopyCommand = serializeAws_restXmlUploadPartCopyCommand;
const deserializeAws_restXmlAbortMultipartUploadCommand = async (output, context) => {
    if (output.statusCode !== 204 && output.statusCode >= 300) {
        return deserializeAws_restXmlAbortMultipartUploadCommandError(output, context);
    }
    const contents = {
        $metadata: deserializeMetadata(output),
        RequestCharged: undefined,
    };
    if (output.headers["x-amz-request-charged"] !== undefined) {
        contents.RequestCharged = output.headers["x-amz-request-charged"];
    }
    await collectBody(output.body, context);
    return Promise.resolve(contents);
};
exports.deserializeAws_restXmlAbortMultipartUploadCommand = deserializeAws_restXmlAbortMultipartUploadCommand;
const deserializeAws_restXmlAbortMultipartUploadCommandError = async (output, context) => {
    const parsedOutput = {
        ...output,
        body: await parseBody(output.body, context),
    };
    let response;
    let errorCode = "UnknownError";
    errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
    switch (errorCode) {
        case "NoSuchUpload":
        case "com.amazonaws.s3#NoSuchUpload":
            response = {
                ...(await deserializeAws_restXmlNoSuchUploadResponse(parsedOutput, context)),
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
const deserializeAws_restXmlCompleteMultipartUploadCommand = async (output, context) => {
    if (output.statusCode !== 200 && output.statusCode >= 300) {
        return deserializeAws_restXmlCompleteMultipartUploadCommandError(output, context);
    }
    const contents = {
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
    const data = await parseBody(output.body, context);
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
    return Promise.resolve(contents);
};
exports.deserializeAws_restXmlCompleteMultipartUploadCommand = deserializeAws_restXmlCompleteMultipartUploadCommand;
const deserializeAws_restXmlCompleteMultipartUploadCommandError = async (output, context) => {
    const parsedOutput = {
        ...output,
        body: await parseBody(output.body, context),
    };
    let response;
    let errorCode = "UnknownError";
    errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
    switch (errorCode) {
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
const deserializeAws_restXmlCopyObjectCommand = async (output, context) => {
    if (output.statusCode !== 200 && output.statusCode >= 300) {
        return deserializeAws_restXmlCopyObjectCommandError(output, context);
    }
    const contents = {
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
    const data = await parseBody(output.body, context);
    contents.CopyObjectResult = deserializeAws_restXmlCopyObjectResult(data, context);
    return Promise.resolve(contents);
};
exports.deserializeAws_restXmlCopyObjectCommand = deserializeAws_restXmlCopyObjectCommand;
const deserializeAws_restXmlCopyObjectCommandError = async (output, context) => {
    const parsedOutput = {
        ...output,
        body: await parseBody(output.body, context),
    };
    let response;
    let errorCode = "UnknownError";
    errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
    switch (errorCode) {
        case "ObjectNotInActiveTierError":
        case "com.amazonaws.s3#ObjectNotInActiveTierError":
            response = {
                ...(await deserializeAws_restXmlObjectNotInActiveTierErrorResponse(parsedOutput, context)),
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
const deserializeAws_restXmlCreateBucketCommand = async (output, context) => {
    if (output.statusCode !== 200 && output.statusCode >= 300) {
        return deserializeAws_restXmlCreateBucketCommandError(output, context);
    }
    const contents = {
        $metadata: deserializeMetadata(output),
        Location: undefined,
    };
    if (output.headers["location"] !== undefined) {
        contents.Location = output.headers["location"];
    }
    await collectBody(output.body, context);
    return Promise.resolve(contents);
};
exports.deserializeAws_restXmlCreateBucketCommand = deserializeAws_restXmlCreateBucketCommand;
const deserializeAws_restXmlCreateBucketCommandError = async (output, context) => {
    const parsedOutput = {
        ...output,
        body: await parseBody(output.body, context),
    };
    let response;
    let errorCode = "UnknownError";
    errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
    switch (errorCode) {
        case "BucketAlreadyExists":
        case "com.amazonaws.s3#BucketAlreadyExists":
            response = {
                ...(await deserializeAws_restXmlBucketAlreadyExistsResponse(parsedOutput, context)),
                name: errorCode,
                $metadata: deserializeMetadata(output),
            };
            break;
        case "BucketAlreadyOwnedByYou":
        case "com.amazonaws.s3#BucketAlreadyOwnedByYou":
            response = {
                ...(await deserializeAws_restXmlBucketAlreadyOwnedByYouResponse(parsedOutput, context)),
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
const deserializeAws_restXmlCreateMultipartUploadCommand = async (output, context) => {
    if (output.statusCode !== 200 && output.statusCode >= 300) {
        return deserializeAws_restXmlCreateMultipartUploadCommandError(output, context);
    }
    const contents = {
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
    const data = await parseBody(output.body, context);
    if (data["Bucket"] !== undefined) {
        contents.Bucket = data["Bucket"];
    }
    if (data["Key"] !== undefined) {
        contents.Key = data["Key"];
    }
    if (data["UploadId"] !== undefined) {
        contents.UploadId = data["UploadId"];
    }
    return Promise.resolve(contents);
};
exports.deserializeAws_restXmlCreateMultipartUploadCommand = deserializeAws_restXmlCreateMultipartUploadCommand;
const deserializeAws_restXmlCreateMultipartUploadCommandError = async (output, context) => {
    const parsedOutput = {
        ...output,
        body: await parseBody(output.body, context),
    };
    let response;
    let errorCode = "UnknownError";
    errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
    switch (errorCode) {
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
const deserializeAws_restXmlDeleteBucketCommand = async (output, context) => {
    if (output.statusCode !== 204 && output.statusCode >= 300) {
        return deserializeAws_restXmlDeleteBucketCommandError(output, context);
    }
    const contents = {
        $metadata: deserializeMetadata(output),
    };
    await collectBody(output.body, context);
    return Promise.resolve(contents);
};
exports.deserializeAws_restXmlDeleteBucketCommand = deserializeAws_restXmlDeleteBucketCommand;
const deserializeAws_restXmlDeleteBucketCommandError = async (output, context) => {
    const parsedOutput = {
        ...output,
        body: await parseBody(output.body, context),
    };
    let response;
    let errorCode = "UnknownError";
    errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
    switch (errorCode) {
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
const deserializeAws_restXmlDeleteBucketAnalyticsConfigurationCommand = async (output, context) => {
    if (output.statusCode !== 204 && output.statusCode >= 300) {
        return deserializeAws_restXmlDeleteBucketAnalyticsConfigurationCommandError(output, context);
    }
    const contents = {
        $metadata: deserializeMetadata(output),
    };
    await collectBody(output.body, context);
    return Promise.resolve(contents);
};
exports.deserializeAws_restXmlDeleteBucketAnalyticsConfigurationCommand = deserializeAws_restXmlDeleteBucketAnalyticsConfigurationCommand;
const deserializeAws_restXmlDeleteBucketAnalyticsConfigurationCommandError = async (output, context) => {
    const parsedOutput = {
        ...output,
        body: await parseBody(output.body, context),
    };
    let response;
    let errorCode = "UnknownError";
    errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
    switch (errorCode) {
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
const deserializeAws_restXmlDeleteBucketCorsCommand = async (output, context) => {
    if (output.statusCode !== 204 && output.statusCode >= 300) {
        return deserializeAws_restXmlDeleteBucketCorsCommandError(output, context);
    }
    const contents = {
        $metadata: deserializeMetadata(output),
    };
    await collectBody(output.body, context);
    return Promise.resolve(contents);
};
exports.deserializeAws_restXmlDeleteBucketCorsCommand = deserializeAws_restXmlDeleteBucketCorsCommand;
const deserializeAws_restXmlDeleteBucketCorsCommandError = async (output, context) => {
    const parsedOutput = {
        ...output,
        body: await parseBody(output.body, context),
    };
    let response;
    let errorCode = "UnknownError";
    errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
    switch (errorCode) {
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
const deserializeAws_restXmlDeleteBucketEncryptionCommand = async (output, context) => {
    if (output.statusCode !== 204 && output.statusCode >= 300) {
        return deserializeAws_restXmlDeleteBucketEncryptionCommandError(output, context);
    }
    const contents = {
        $metadata: deserializeMetadata(output),
    };
    await collectBody(output.body, context);
    return Promise.resolve(contents);
};
exports.deserializeAws_restXmlDeleteBucketEncryptionCommand = deserializeAws_restXmlDeleteBucketEncryptionCommand;
const deserializeAws_restXmlDeleteBucketEncryptionCommandError = async (output, context) => {
    const parsedOutput = {
        ...output,
        body: await parseBody(output.body, context),
    };
    let response;
    let errorCode = "UnknownError";
    errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
    switch (errorCode) {
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
const deserializeAws_restXmlDeleteBucketIntelligentTieringConfigurationCommand = async (output, context) => {
    if (output.statusCode !== 204 && output.statusCode >= 300) {
        return deserializeAws_restXmlDeleteBucketIntelligentTieringConfigurationCommandError(output, context);
    }
    const contents = {
        $metadata: deserializeMetadata(output),
    };
    await collectBody(output.body, context);
    return Promise.resolve(contents);
};
exports.deserializeAws_restXmlDeleteBucketIntelligentTieringConfigurationCommand = deserializeAws_restXmlDeleteBucketIntelligentTieringConfigurationCommand;
const deserializeAws_restXmlDeleteBucketIntelligentTieringConfigurationCommandError = async (output, context) => {
    const parsedOutput = {
        ...output,
        body: await parseBody(output.body, context),
    };
    let response;
    let errorCode = "UnknownError";
    errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
    switch (errorCode) {
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
const deserializeAws_restXmlDeleteBucketInventoryConfigurationCommand = async (output, context) => {
    if (output.statusCode !== 204 && output.statusCode >= 300) {
        return deserializeAws_restXmlDeleteBucketInventoryConfigurationCommandError(output, context);
    }
    const contents = {
        $metadata: deserializeMetadata(output),
    };
    await collectBody(output.body, context);
    return Promise.resolve(contents);
};
exports.deserializeAws_restXmlDeleteBucketInventoryConfigurationCommand = deserializeAws_restXmlDeleteBucketInventoryConfigurationCommand;
const deserializeAws_restXmlDeleteBucketInventoryConfigurationCommandError = async (output, context) => {
    const parsedOutput = {
        ...output,
        body: await parseBody(output.body, context),
    };
    let response;
    let errorCode = "UnknownError";
    errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
    switch (errorCode) {
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
const deserializeAws_restXmlDeleteBucketLifecycleCommand = async (output, context) => {
    if (output.statusCode !== 204 && output.statusCode >= 300) {
        return deserializeAws_restXmlDeleteBucketLifecycleCommandError(output, context);
    }
    const contents = {
        $metadata: deserializeMetadata(output),
    };
    await collectBody(output.body, context);
    return Promise.resolve(contents);
};
exports.deserializeAws_restXmlDeleteBucketLifecycleCommand = deserializeAws_restXmlDeleteBucketLifecycleCommand;
const deserializeAws_restXmlDeleteBucketLifecycleCommandError = async (output, context) => {
    const parsedOutput = {
        ...output,
        body: await parseBody(output.body, context),
    };
    let response;
    let errorCode = "UnknownError";
    errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
    switch (errorCode) {
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
const deserializeAws_restXmlDeleteBucketMetricsConfigurationCommand = async (output, context) => {
    if (output.statusCode !== 204 && output.statusCode >= 300) {
        return deserializeAws_restXmlDeleteBucketMetricsConfigurationCommandError(output, context);
    }
    const contents = {
        $metadata: deserializeMetadata(output),
    };
    await collectBody(output.body, context);
    return Promise.resolve(contents);
};
exports.deserializeAws_restXmlDeleteBucketMetricsConfigurationCommand = deserializeAws_restXmlDeleteBucketMetricsConfigurationCommand;
const deserializeAws_restXmlDeleteBucketMetricsConfigurationCommandError = async (output, context) => {
    const parsedOutput = {
        ...output,
        body: await parseBody(output.body, context),
    };
    let response;
    let errorCode = "UnknownError";
    errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
    switch (errorCode) {
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
const deserializeAws_restXmlDeleteBucketOwnershipControlsCommand = async (output, context) => {
    if (output.statusCode !== 204 && output.statusCode >= 300) {
        return deserializeAws_restXmlDeleteBucketOwnershipControlsCommandError(output, context);
    }
    const contents = {
        $metadata: deserializeMetadata(output),
    };
    await collectBody(output.body, context);
    return Promise.resolve(contents);
};
exports.deserializeAws_restXmlDeleteBucketOwnershipControlsCommand = deserializeAws_restXmlDeleteBucketOwnershipControlsCommand;
const deserializeAws_restXmlDeleteBucketOwnershipControlsCommandError = async (output, context) => {
    const parsedOutput = {
        ...output,
        body: await parseBody(output.body, context),
    };
    let response;
    let errorCode = "UnknownError";
    errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
    switch (errorCode) {
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
const deserializeAws_restXmlDeleteBucketPolicyCommand = async (output, context) => {
    if (output.statusCode !== 204 && output.statusCode >= 300) {
        return deserializeAws_restXmlDeleteBucketPolicyCommandError(output, context);
    }
    const contents = {
        $metadata: deserializeMetadata(output),
    };
    await collectBody(output.body, context);
    return Promise.resolve(contents);
};
exports.deserializeAws_restXmlDeleteBucketPolicyCommand = deserializeAws_restXmlDeleteBucketPolicyCommand;
const deserializeAws_restXmlDeleteBucketPolicyCommandError = async (output, context) => {
    const parsedOutput = {
        ...output,
        body: await parseBody(output.body, context),
    };
    let response;
    let errorCode = "UnknownError";
    errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
    switch (errorCode) {
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
const deserializeAws_restXmlDeleteBucketReplicationCommand = async (output, context) => {
    if (output.statusCode !== 204 && output.statusCode >= 300) {
        return deserializeAws_restXmlDeleteBucketReplicationCommandError(output, context);
    }
    const contents = {
        $metadata: deserializeMetadata(output),
    };
    await collectBody(output.body, context);
    return Promise.resolve(contents);
};
exports.deserializeAws_restXmlDeleteBucketReplicationCommand = deserializeAws_restXmlDeleteBucketReplicationCommand;
const deserializeAws_restXmlDeleteBucketReplicationCommandError = async (output, context) => {
    const parsedOutput = {
        ...output,
        body: await parseBody(output.body, context),
    };
    let response;
    let errorCode = "UnknownError";
    errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
    switch (errorCode) {
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
const deserializeAws_restXmlDeleteBucketTaggingCommand = async (output, context) => {
    if (output.statusCode !== 204 && output.statusCode >= 300) {
        return deserializeAws_restXmlDeleteBucketTaggingCommandError(output, context);
    }
    const contents = {
        $metadata: deserializeMetadata(output),
    };
    await collectBody(output.body, context);
    return Promise.resolve(contents);
};
exports.deserializeAws_restXmlDeleteBucketTaggingCommand = deserializeAws_restXmlDeleteBucketTaggingCommand;
const deserializeAws_restXmlDeleteBucketTaggingCommandError = async (output, context) => {
    const parsedOutput = {
        ...output,
        body: await parseBody(output.body, context),
    };
    let response;
    let errorCode = "UnknownError";
    errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
    switch (errorCode) {
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
const deserializeAws_restXmlDeleteBucketWebsiteCommand = async (output, context) => {
    if (output.statusCode !== 204 && output.statusCode >= 300) {
        return deserializeAws_restXmlDeleteBucketWebsiteCommandError(output, context);
    }
    const contents = {
        $metadata: deserializeMetadata(output),
    };
    await collectBody(output.body, context);
    return Promise.resolve(contents);
};
exports.deserializeAws_restXmlDeleteBucketWebsiteCommand = deserializeAws_restXmlDeleteBucketWebsiteCommand;
const deserializeAws_restXmlDeleteBucketWebsiteCommandError = async (output, context) => {
    const parsedOutput = {
        ...output,
        body: await parseBody(output.body, context),
    };
    let response;
    let errorCode = "UnknownError";
    errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
    switch (errorCode) {
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
const deserializeAws_restXmlDeleteObjectCommand = async (output, context) => {
    if (output.statusCode !== 204 && output.statusCode >= 300) {
        return deserializeAws_restXmlDeleteObjectCommandError(output, context);
    }
    const contents = {
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
    await collectBody(output.body, context);
    return Promise.resolve(contents);
};
exports.deserializeAws_restXmlDeleteObjectCommand = deserializeAws_restXmlDeleteObjectCommand;
const deserializeAws_restXmlDeleteObjectCommandError = async (output, context) => {
    const parsedOutput = {
        ...output,
        body: await parseBody(output.body, context),
    };
    let response;
    let errorCode = "UnknownError";
    errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
    switch (errorCode) {
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
const deserializeAws_restXmlDeleteObjectsCommand = async (output, context) => {
    if (output.statusCode !== 200 && output.statusCode >= 300) {
        return deserializeAws_restXmlDeleteObjectsCommandError(output, context);
    }
    const contents = {
        $metadata: deserializeMetadata(output),
        Deleted: undefined,
        Errors: undefined,
        RequestCharged: undefined,
    };
    if (output.headers["x-amz-request-charged"] !== undefined) {
        contents.RequestCharged = output.headers["x-amz-request-charged"];
    }
    const data = await parseBody(output.body, context);
    if (data.Deleted === "") {
        contents.Deleted = [];
    }
    if (data["Deleted"] !== undefined) {
        contents.Deleted = deserializeAws_restXmlDeletedObjects(smithy_client_1.getArrayIfSingleItem(data["Deleted"]), context);
    }
    if (data.Error === "") {
        contents.Errors = [];
    }
    if (data["Error"] !== undefined) {
        contents.Errors = deserializeAws_restXmlErrors(smithy_client_1.getArrayIfSingleItem(data["Error"]), context);
    }
    return Promise.resolve(contents);
};
exports.deserializeAws_restXmlDeleteObjectsCommand = deserializeAws_restXmlDeleteObjectsCommand;
const deserializeAws_restXmlDeleteObjectsCommandError = async (output, context) => {
    const parsedOutput = {
        ...output,
        body: await parseBody(output.body, context),
    };
    let response;
    let errorCode = "UnknownError";
    errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
    switch (errorCode) {
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
const deserializeAws_restXmlDeleteObjectTaggingCommand = async (output, context) => {
    if (output.statusCode !== 204 && output.statusCode >= 300) {
        return deserializeAws_restXmlDeleteObjectTaggingCommandError(output, context);
    }
    const contents = {
        $metadata: deserializeMetadata(output),
        VersionId: undefined,
    };
    if (output.headers["x-amz-version-id"] !== undefined) {
        contents.VersionId = output.headers["x-amz-version-id"];
    }
    await collectBody(output.body, context);
    return Promise.resolve(contents);
};
exports.deserializeAws_restXmlDeleteObjectTaggingCommand = deserializeAws_restXmlDeleteObjectTaggingCommand;
const deserializeAws_restXmlDeleteObjectTaggingCommandError = async (output, context) => {
    const parsedOutput = {
        ...output,
        body: await parseBody(output.body, context),
    };
    let response;
    let errorCode = "UnknownError";
    errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
    switch (errorCode) {
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
const deserializeAws_restXmlDeletePublicAccessBlockCommand = async (output, context) => {
    if (output.statusCode !== 204 && output.statusCode >= 300) {
        return deserializeAws_restXmlDeletePublicAccessBlockCommandError(output, context);
    }
    const contents = {
        $metadata: deserializeMetadata(output),
    };
    await collectBody(output.body, context);
    return Promise.resolve(contents);
};
exports.deserializeAws_restXmlDeletePublicAccessBlockCommand = deserializeAws_restXmlDeletePublicAccessBlockCommand;
const deserializeAws_restXmlDeletePublicAccessBlockCommandError = async (output, context) => {
    const parsedOutput = {
        ...output,
        body: await parseBody(output.body, context),
    };
    let response;
    let errorCode = "UnknownError";
    errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
    switch (errorCode) {
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
const deserializeAws_restXmlGetBucketAccelerateConfigurationCommand = async (output, context) => {
    if (output.statusCode !== 200 && output.statusCode >= 300) {
        return deserializeAws_restXmlGetBucketAccelerateConfigurationCommandError(output, context);
    }
    const contents = {
        $metadata: deserializeMetadata(output),
        Status: undefined,
    };
    const data = await parseBody(output.body, context);
    if (data["Status"] !== undefined) {
        contents.Status = data["Status"];
    }
    return Promise.resolve(contents);
};
exports.deserializeAws_restXmlGetBucketAccelerateConfigurationCommand = deserializeAws_restXmlGetBucketAccelerateConfigurationCommand;
const deserializeAws_restXmlGetBucketAccelerateConfigurationCommandError = async (output, context) => {
    const parsedOutput = {
        ...output,
        body: await parseBody(output.body, context),
    };
    let response;
    let errorCode = "UnknownError";
    errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
    switch (errorCode) {
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
const deserializeAws_restXmlGetBucketAclCommand = async (output, context) => {
    if (output.statusCode !== 200 && output.statusCode >= 300) {
        return deserializeAws_restXmlGetBucketAclCommandError(output, context);
    }
    const contents = {
        $metadata: deserializeMetadata(output),
        Grants: undefined,
        Owner: undefined,
    };
    const data = await parseBody(output.body, context);
    if (data.AccessControlList === "") {
        contents.Grants = [];
    }
    if (data["AccessControlList"] !== undefined && data["AccessControlList"]["Grant"] !== undefined) {
        contents.Grants = deserializeAws_restXmlGrants(smithy_client_1.getArrayIfSingleItem(data["AccessControlList"]["Grant"]), context);
    }
    if (data["Owner"] !== undefined) {
        contents.Owner = deserializeAws_restXmlOwner(data["Owner"], context);
    }
    return Promise.resolve(contents);
};
exports.deserializeAws_restXmlGetBucketAclCommand = deserializeAws_restXmlGetBucketAclCommand;
const deserializeAws_restXmlGetBucketAclCommandError = async (output, context) => {
    const parsedOutput = {
        ...output,
        body: await parseBody(output.body, context),
    };
    let response;
    let errorCode = "UnknownError";
    errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
    switch (errorCode) {
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
const deserializeAws_restXmlGetBucketAnalyticsConfigurationCommand = async (output, context) => {
    if (output.statusCode !== 200 && output.statusCode >= 300) {
        return deserializeAws_restXmlGetBucketAnalyticsConfigurationCommandError(output, context);
    }
    const contents = {
        $metadata: deserializeMetadata(output),
        AnalyticsConfiguration: undefined,
    };
    const data = await parseBody(output.body, context);
    contents.AnalyticsConfiguration = deserializeAws_restXmlAnalyticsConfiguration(data, context);
    return Promise.resolve(contents);
};
exports.deserializeAws_restXmlGetBucketAnalyticsConfigurationCommand = deserializeAws_restXmlGetBucketAnalyticsConfigurationCommand;
const deserializeAws_restXmlGetBucketAnalyticsConfigurationCommandError = async (output, context) => {
    const parsedOutput = {
        ...output,
        body: await parseBody(output.body, context),
    };
    let response;
    let errorCode = "UnknownError";
    errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
    switch (errorCode) {
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
const deserializeAws_restXmlGetBucketCorsCommand = async (output, context) => {
    if (output.statusCode !== 200 && output.statusCode >= 300) {
        return deserializeAws_restXmlGetBucketCorsCommandError(output, context);
    }
    const contents = {
        $metadata: deserializeMetadata(output),
        CORSRules: undefined,
    };
    const data = await parseBody(output.body, context);
    if (data.CORSRule === "") {
        contents.CORSRules = [];
    }
    if (data["CORSRule"] !== undefined) {
        contents.CORSRules = deserializeAws_restXmlCORSRules(smithy_client_1.getArrayIfSingleItem(data["CORSRule"]), context);
    }
    return Promise.resolve(contents);
};
exports.deserializeAws_restXmlGetBucketCorsCommand = deserializeAws_restXmlGetBucketCorsCommand;
const deserializeAws_restXmlGetBucketCorsCommandError = async (output, context) => {
    const parsedOutput = {
        ...output,
        body: await parseBody(output.body, context),
    };
    let response;
    let errorCode = "UnknownError";
    errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
    switch (errorCode) {
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
const deserializeAws_restXmlGetBucketEncryptionCommand = async (output, context) => {
    if (output.statusCode !== 200 && output.statusCode >= 300) {
        return deserializeAws_restXmlGetBucketEncryptionCommandError(output, context);
    }
    const contents = {
        $metadata: deserializeMetadata(output),
        ServerSideEncryptionConfiguration: undefined,
    };
    const data = await parseBody(output.body, context);
    contents.ServerSideEncryptionConfiguration = deserializeAws_restXmlServerSideEncryptionConfiguration(data, context);
    return Promise.resolve(contents);
};
exports.deserializeAws_restXmlGetBucketEncryptionCommand = deserializeAws_restXmlGetBucketEncryptionCommand;
const deserializeAws_restXmlGetBucketEncryptionCommandError = async (output, context) => {
    const parsedOutput = {
        ...output,
        body: await parseBody(output.body, context),
    };
    let response;
    let errorCode = "UnknownError";
    errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
    switch (errorCode) {
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
const deserializeAws_restXmlGetBucketIntelligentTieringConfigurationCommand = async (output, context) => {
    if (output.statusCode !== 200 && output.statusCode >= 300) {
        return deserializeAws_restXmlGetBucketIntelligentTieringConfigurationCommandError(output, context);
    }
    const contents = {
        $metadata: deserializeMetadata(output),
        IntelligentTieringConfiguration: undefined,
    };
    const data = await parseBody(output.body, context);
    contents.IntelligentTieringConfiguration = deserializeAws_restXmlIntelligentTieringConfiguration(data, context);
    return Promise.resolve(contents);
};
exports.deserializeAws_restXmlGetBucketIntelligentTieringConfigurationCommand = deserializeAws_restXmlGetBucketIntelligentTieringConfigurationCommand;
const deserializeAws_restXmlGetBucketIntelligentTieringConfigurationCommandError = async (output, context) => {
    const parsedOutput = {
        ...output,
        body: await parseBody(output.body, context),
    };
    let response;
    let errorCode = "UnknownError";
    errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
    switch (errorCode) {
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
const deserializeAws_restXmlGetBucketInventoryConfigurationCommand = async (output, context) => {
    if (output.statusCode !== 200 && output.statusCode >= 300) {
        return deserializeAws_restXmlGetBucketInventoryConfigurationCommandError(output, context);
    }
    const contents = {
        $metadata: deserializeMetadata(output),
        InventoryConfiguration: undefined,
    };
    const data = await parseBody(output.body, context);
    contents.InventoryConfiguration = deserializeAws_restXmlInventoryConfiguration(data, context);
    return Promise.resolve(contents);
};
exports.deserializeAws_restXmlGetBucketInventoryConfigurationCommand = deserializeAws_restXmlGetBucketInventoryConfigurationCommand;
const deserializeAws_restXmlGetBucketInventoryConfigurationCommandError = async (output, context) => {
    const parsedOutput = {
        ...output,
        body: await parseBody(output.body, context),
    };
    let response;
    let errorCode = "UnknownError";
    errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
    switch (errorCode) {
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
const deserializeAws_restXmlGetBucketLifecycleConfigurationCommand = async (output, context) => {
    if (output.statusCode !== 200 && output.statusCode >= 300) {
        return deserializeAws_restXmlGetBucketLifecycleConfigurationCommandError(output, context);
    }
    const contents = {
        $metadata: deserializeMetadata(output),
        Rules: undefined,
    };
    const data = await parseBody(output.body, context);
    if (data.Rule === "") {
        contents.Rules = [];
    }
    if (data["Rule"] !== undefined) {
        contents.Rules = deserializeAws_restXmlLifecycleRules(smithy_client_1.getArrayIfSingleItem(data["Rule"]), context);
    }
    return Promise.resolve(contents);
};
exports.deserializeAws_restXmlGetBucketLifecycleConfigurationCommand = deserializeAws_restXmlGetBucketLifecycleConfigurationCommand;
const deserializeAws_restXmlGetBucketLifecycleConfigurationCommandError = async (output, context) => {
    const parsedOutput = {
        ...output,
        body: await parseBody(output.body, context),
    };
    let response;
    let errorCode = "UnknownError";
    errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
    switch (errorCode) {
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
const deserializeAws_restXmlGetBucketLocationCommand = async (output, context) => {
    if (output.statusCode !== 200 && output.statusCode >= 300) {
        return deserializeAws_restXmlGetBucketLocationCommandError(output, context);
    }
    const contents = {
        $metadata: deserializeMetadata(output),
        LocationConstraint: undefined,
    };
    const data = await parseBody(output.body, context);
    if (data["LocationConstraint"] !== undefined) {
        contents.LocationConstraint = data["LocationConstraint"];
    }
    return Promise.resolve(contents);
};
exports.deserializeAws_restXmlGetBucketLocationCommand = deserializeAws_restXmlGetBucketLocationCommand;
const deserializeAws_restXmlGetBucketLocationCommandError = async (output, context) => {
    const parsedOutput = {
        ...output,
        body: await parseBody(output.body, context),
    };
    let response;
    let errorCode = "UnknownError";
    errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
    switch (errorCode) {
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
const deserializeAws_restXmlGetBucketLoggingCommand = async (output, context) => {
    if (output.statusCode !== 200 && output.statusCode >= 300) {
        return deserializeAws_restXmlGetBucketLoggingCommandError(output, context);
    }
    const contents = {
        $metadata: deserializeMetadata(output),
        LoggingEnabled: undefined,
    };
    const data = await parseBody(output.body, context);
    if (data["LoggingEnabled"] !== undefined) {
        contents.LoggingEnabled = deserializeAws_restXmlLoggingEnabled(data["LoggingEnabled"], context);
    }
    return Promise.resolve(contents);
};
exports.deserializeAws_restXmlGetBucketLoggingCommand = deserializeAws_restXmlGetBucketLoggingCommand;
const deserializeAws_restXmlGetBucketLoggingCommandError = async (output, context) => {
    const parsedOutput = {
        ...output,
        body: await parseBody(output.body, context),
    };
    let response;
    let errorCode = "UnknownError";
    errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
    switch (errorCode) {
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
const deserializeAws_restXmlGetBucketMetricsConfigurationCommand = async (output, context) => {
    if (output.statusCode !== 200 && output.statusCode >= 300) {
        return deserializeAws_restXmlGetBucketMetricsConfigurationCommandError(output, context);
    }
    const contents = {
        $metadata: deserializeMetadata(output),
        MetricsConfiguration: undefined,
    };
    const data = await parseBody(output.body, context);
    contents.MetricsConfiguration = deserializeAws_restXmlMetricsConfiguration(data, context);
    return Promise.resolve(contents);
};
exports.deserializeAws_restXmlGetBucketMetricsConfigurationCommand = deserializeAws_restXmlGetBucketMetricsConfigurationCommand;
const deserializeAws_restXmlGetBucketMetricsConfigurationCommandError = async (output, context) => {
    const parsedOutput = {
        ...output,
        body: await parseBody(output.body, context),
    };
    let response;
    let errorCode = "UnknownError";
    errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
    switch (errorCode) {
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
const deserializeAws_restXmlGetBucketNotificationConfigurationCommand = async (output, context) => {
    if (output.statusCode !== 200 && output.statusCode >= 300) {
        return deserializeAws_restXmlGetBucketNotificationConfigurationCommandError(output, context);
    }
    const contents = {
        $metadata: deserializeMetadata(output),
        LambdaFunctionConfigurations: undefined,
        QueueConfigurations: undefined,
        TopicConfigurations: undefined,
    };
    const data = await parseBody(output.body, context);
    if (data.CloudFunctionConfiguration === "") {
        contents.LambdaFunctionConfigurations = [];
    }
    if (data["CloudFunctionConfiguration"] !== undefined) {
        contents.LambdaFunctionConfigurations = deserializeAws_restXmlLambdaFunctionConfigurationList(smithy_client_1.getArrayIfSingleItem(data["CloudFunctionConfiguration"]), context);
    }
    if (data.QueueConfiguration === "") {
        contents.QueueConfigurations = [];
    }
    if (data["QueueConfiguration"] !== undefined) {
        contents.QueueConfigurations = deserializeAws_restXmlQueueConfigurationList(smithy_client_1.getArrayIfSingleItem(data["QueueConfiguration"]), context);
    }
    if (data.TopicConfiguration === "") {
        contents.TopicConfigurations = [];
    }
    if (data["TopicConfiguration"] !== undefined) {
        contents.TopicConfigurations = deserializeAws_restXmlTopicConfigurationList(smithy_client_1.getArrayIfSingleItem(data["TopicConfiguration"]), context);
    }
    return Promise.resolve(contents);
};
exports.deserializeAws_restXmlGetBucketNotificationConfigurationCommand = deserializeAws_restXmlGetBucketNotificationConfigurationCommand;
const deserializeAws_restXmlGetBucketNotificationConfigurationCommandError = async (output, context) => {
    const parsedOutput = {
        ...output,
        body: await parseBody(output.body, context),
    };
    let response;
    let errorCode = "UnknownError";
    errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
    switch (errorCode) {
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
const deserializeAws_restXmlGetBucketOwnershipControlsCommand = async (output, context) => {
    if (output.statusCode !== 200 && output.statusCode >= 300) {
        return deserializeAws_restXmlGetBucketOwnershipControlsCommandError(output, context);
    }
    const contents = {
        $metadata: deserializeMetadata(output),
        OwnershipControls: undefined,
    };
    const data = await parseBody(output.body, context);
    contents.OwnershipControls = deserializeAws_restXmlOwnershipControls(data, context);
    return Promise.resolve(contents);
};
exports.deserializeAws_restXmlGetBucketOwnershipControlsCommand = deserializeAws_restXmlGetBucketOwnershipControlsCommand;
const deserializeAws_restXmlGetBucketOwnershipControlsCommandError = async (output, context) => {
    const parsedOutput = {
        ...output,
        body: await parseBody(output.body, context),
    };
    let response;
    let errorCode = "UnknownError";
    errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
    switch (errorCode) {
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
const deserializeAws_restXmlGetBucketPolicyCommand = async (output, context) => {
    if (output.statusCode !== 200 && output.statusCode >= 300) {
        return deserializeAws_restXmlGetBucketPolicyCommandError(output, context);
    }
    const contents = {
        $metadata: deserializeMetadata(output),
        Policy: undefined,
    };
    const data = await parseBody(output.body, context);
    if (data["Policy"] !== undefined) {
        contents.Policy = data["Policy"];
    }
    return Promise.resolve(contents);
};
exports.deserializeAws_restXmlGetBucketPolicyCommand = deserializeAws_restXmlGetBucketPolicyCommand;
const deserializeAws_restXmlGetBucketPolicyCommandError = async (output, context) => {
    const parsedOutput = {
        ...output,
        body: await parseBody(output.body, context),
    };
    let response;
    let errorCode = "UnknownError";
    errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
    switch (errorCode) {
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
const deserializeAws_restXmlGetBucketPolicyStatusCommand = async (output, context) => {
    if (output.statusCode !== 200 && output.statusCode >= 300) {
        return deserializeAws_restXmlGetBucketPolicyStatusCommandError(output, context);
    }
    const contents = {
        $metadata: deserializeMetadata(output),
        PolicyStatus: undefined,
    };
    const data = await parseBody(output.body, context);
    contents.PolicyStatus = deserializeAws_restXmlPolicyStatus(data, context);
    return Promise.resolve(contents);
};
exports.deserializeAws_restXmlGetBucketPolicyStatusCommand = deserializeAws_restXmlGetBucketPolicyStatusCommand;
const deserializeAws_restXmlGetBucketPolicyStatusCommandError = async (output, context) => {
    const parsedOutput = {
        ...output,
        body: await parseBody(output.body, context),
    };
    let response;
    let errorCode = "UnknownError";
    errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
    switch (errorCode) {
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
const deserializeAws_restXmlGetBucketReplicationCommand = async (output, context) => {
    if (output.statusCode !== 200 && output.statusCode >= 300) {
        return deserializeAws_restXmlGetBucketReplicationCommandError(output, context);
    }
    const contents = {
        $metadata: deserializeMetadata(output),
        ReplicationConfiguration: undefined,
    };
    const data = await parseBody(output.body, context);
    contents.ReplicationConfiguration = deserializeAws_restXmlReplicationConfiguration(data, context);
    return Promise.resolve(contents);
};
exports.deserializeAws_restXmlGetBucketReplicationCommand = deserializeAws_restXmlGetBucketReplicationCommand;
const deserializeAws_restXmlGetBucketReplicationCommandError = async (output, context) => {
    const parsedOutput = {
        ...output,
        body: await parseBody(output.body, context),
    };
    let response;
    let errorCode = "UnknownError";
    errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
    switch (errorCode) {
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
const deserializeAws_restXmlGetBucketRequestPaymentCommand = async (output, context) => {
    if (output.statusCode !== 200 && output.statusCode >= 300) {
        return deserializeAws_restXmlGetBucketRequestPaymentCommandError(output, context);
    }
    const contents = {
        $metadata: deserializeMetadata(output),
        Payer: undefined,
    };
    const data = await parseBody(output.body, context);
    if (data["Payer"] !== undefined) {
        contents.Payer = data["Payer"];
    }
    return Promise.resolve(contents);
};
exports.deserializeAws_restXmlGetBucketRequestPaymentCommand = deserializeAws_restXmlGetBucketRequestPaymentCommand;
const deserializeAws_restXmlGetBucketRequestPaymentCommandError = async (output, context) => {
    const parsedOutput = {
        ...output,
        body: await parseBody(output.body, context),
    };
    let response;
    let errorCode = "UnknownError";
    errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
    switch (errorCode) {
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
const deserializeAws_restXmlGetBucketTaggingCommand = async (output, context) => {
    if (output.statusCode !== 200 && output.statusCode >= 300) {
        return deserializeAws_restXmlGetBucketTaggingCommandError(output, context);
    }
    const contents = {
        $metadata: deserializeMetadata(output),
        TagSet: undefined,
    };
    const data = await parseBody(output.body, context);
    if (data.TagSet === "") {
        contents.TagSet = [];
    }
    if (data["TagSet"] !== undefined && data["TagSet"]["Tag"] !== undefined) {
        contents.TagSet = deserializeAws_restXmlTagSet(smithy_client_1.getArrayIfSingleItem(data["TagSet"]["Tag"]), context);
    }
    return Promise.resolve(contents);
};
exports.deserializeAws_restXmlGetBucketTaggingCommand = deserializeAws_restXmlGetBucketTaggingCommand;
const deserializeAws_restXmlGetBucketTaggingCommandError = async (output, context) => {
    const parsedOutput = {
        ...output,
        body: await parseBody(output.body, context),
    };
    let response;
    let errorCode = "UnknownError";
    errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
    switch (errorCode) {
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
const deserializeAws_restXmlGetBucketVersioningCommand = async (output, context) => {
    if (output.statusCode !== 200 && output.statusCode >= 300) {
        return deserializeAws_restXmlGetBucketVersioningCommandError(output, context);
    }
    const contents = {
        $metadata: deserializeMetadata(output),
        MFADelete: undefined,
        Status: undefined,
    };
    const data = await parseBody(output.body, context);
    if (data["MfaDelete"] !== undefined) {
        contents.MFADelete = data["MfaDelete"];
    }
    if (data["Status"] !== undefined) {
        contents.Status = data["Status"];
    }
    return Promise.resolve(contents);
};
exports.deserializeAws_restXmlGetBucketVersioningCommand = deserializeAws_restXmlGetBucketVersioningCommand;
const deserializeAws_restXmlGetBucketVersioningCommandError = async (output, context) => {
    const parsedOutput = {
        ...output,
        body: await parseBody(output.body, context),
    };
    let response;
    let errorCode = "UnknownError";
    errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
    switch (errorCode) {
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
const deserializeAws_restXmlGetBucketWebsiteCommand = async (output, context) => {
    if (output.statusCode !== 200 && output.statusCode >= 300) {
        return deserializeAws_restXmlGetBucketWebsiteCommandError(output, context);
    }
    const contents = {
        $metadata: deserializeMetadata(output),
        ErrorDocument: undefined,
        IndexDocument: undefined,
        RedirectAllRequestsTo: undefined,
        RoutingRules: undefined,
    };
    const data = await parseBody(output.body, context);
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
        contents.RoutingRules = deserializeAws_restXmlRoutingRules(smithy_client_1.getArrayIfSingleItem(data["RoutingRules"]["RoutingRule"]), context);
    }
    return Promise.resolve(contents);
};
exports.deserializeAws_restXmlGetBucketWebsiteCommand = deserializeAws_restXmlGetBucketWebsiteCommand;
const deserializeAws_restXmlGetBucketWebsiteCommandError = async (output, context) => {
    const parsedOutput = {
        ...output,
        body: await parseBody(output.body, context),
    };
    let response;
    let errorCode = "UnknownError";
    errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
    switch (errorCode) {
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
const deserializeAws_restXmlGetObjectCommand = async (output, context) => {
    if (output.statusCode !== 200 && output.statusCode >= 300) {
        return deserializeAws_restXmlGetObjectCommandError(output, context);
    }
    const contents = {
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
    Object.keys(output.headers).forEach((header) => {
        if (contents.Metadata === undefined) {
            contents.Metadata = {};
        }
        if (header.startsWith("x-amz-meta-")) {
            contents.Metadata[header.substring(11)] = output.headers[header];
        }
    });
    const data = output.body;
    contents.Body = data;
    return Promise.resolve(contents);
};
exports.deserializeAws_restXmlGetObjectCommand = deserializeAws_restXmlGetObjectCommand;
const deserializeAws_restXmlGetObjectCommandError = async (output, context) => {
    const parsedOutput = {
        ...output,
        body: await parseBody(output.body, context),
    };
    let response;
    let errorCode = "UnknownError";
    errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
    switch (errorCode) {
        case "InvalidObjectState":
        case "com.amazonaws.s3#InvalidObjectState":
            response = {
                ...(await deserializeAws_restXmlInvalidObjectStateResponse(parsedOutput, context)),
                name: errorCode,
                $metadata: deserializeMetadata(output),
            };
            break;
        case "NoSuchKey":
        case "com.amazonaws.s3#NoSuchKey":
            response = {
                ...(await deserializeAws_restXmlNoSuchKeyResponse(parsedOutput, context)),
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
const deserializeAws_restXmlGetObjectAclCommand = async (output, context) => {
    if (output.statusCode !== 200 && output.statusCode >= 300) {
        return deserializeAws_restXmlGetObjectAclCommandError(output, context);
    }
    const contents = {
        $metadata: deserializeMetadata(output),
        Grants: undefined,
        Owner: undefined,
        RequestCharged: undefined,
    };
    if (output.headers["x-amz-request-charged"] !== undefined) {
        contents.RequestCharged = output.headers["x-amz-request-charged"];
    }
    const data = await parseBody(output.body, context);
    if (data.AccessControlList === "") {
        contents.Grants = [];
    }
    if (data["AccessControlList"] !== undefined && data["AccessControlList"]["Grant"] !== undefined) {
        contents.Grants = deserializeAws_restXmlGrants(smithy_client_1.getArrayIfSingleItem(data["AccessControlList"]["Grant"]), context);
    }
    if (data["Owner"] !== undefined) {
        contents.Owner = deserializeAws_restXmlOwner(data["Owner"], context);
    }
    return Promise.resolve(contents);
};
exports.deserializeAws_restXmlGetObjectAclCommand = deserializeAws_restXmlGetObjectAclCommand;
const deserializeAws_restXmlGetObjectAclCommandError = async (output, context) => {
    const parsedOutput = {
        ...output,
        body: await parseBody(output.body, context),
    };
    let response;
    let errorCode = "UnknownError";
    errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
    switch (errorCode) {
        case "NoSuchKey":
        case "com.amazonaws.s3#NoSuchKey":
            response = {
                ...(await deserializeAws_restXmlNoSuchKeyResponse(parsedOutput, context)),
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
const deserializeAws_restXmlGetObjectLegalHoldCommand = async (output, context) => {
    if (output.statusCode !== 200 && output.statusCode >= 300) {
        return deserializeAws_restXmlGetObjectLegalHoldCommandError(output, context);
    }
    const contents = {
        $metadata: deserializeMetadata(output),
        LegalHold: undefined,
    };
    const data = await parseBody(output.body, context);
    contents.LegalHold = deserializeAws_restXmlObjectLockLegalHold(data, context);
    return Promise.resolve(contents);
};
exports.deserializeAws_restXmlGetObjectLegalHoldCommand = deserializeAws_restXmlGetObjectLegalHoldCommand;
const deserializeAws_restXmlGetObjectLegalHoldCommandError = async (output, context) => {
    const parsedOutput = {
        ...output,
        body: await parseBody(output.body, context),
    };
    let response;
    let errorCode = "UnknownError";
    errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
    switch (errorCode) {
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
const deserializeAws_restXmlGetObjectLockConfigurationCommand = async (output, context) => {
    if (output.statusCode !== 200 && output.statusCode >= 300) {
        return deserializeAws_restXmlGetObjectLockConfigurationCommandError(output, context);
    }
    const contents = {
        $metadata: deserializeMetadata(output),
        ObjectLockConfiguration: undefined,
    };
    const data = await parseBody(output.body, context);
    contents.ObjectLockConfiguration = deserializeAws_restXmlObjectLockConfiguration(data, context);
    return Promise.resolve(contents);
};
exports.deserializeAws_restXmlGetObjectLockConfigurationCommand = deserializeAws_restXmlGetObjectLockConfigurationCommand;
const deserializeAws_restXmlGetObjectLockConfigurationCommandError = async (output, context) => {
    const parsedOutput = {
        ...output,
        body: await parseBody(output.body, context),
    };
    let response;
    let errorCode = "UnknownError";
    errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
    switch (errorCode) {
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
const deserializeAws_restXmlGetObjectRetentionCommand = async (output, context) => {
    if (output.statusCode !== 200 && output.statusCode >= 300) {
        return deserializeAws_restXmlGetObjectRetentionCommandError(output, context);
    }
    const contents = {
        $metadata: deserializeMetadata(output),
        Retention: undefined,
    };
    const data = await parseBody(output.body, context);
    contents.Retention = deserializeAws_restXmlObjectLockRetention(data, context);
    return Promise.resolve(contents);
};
exports.deserializeAws_restXmlGetObjectRetentionCommand = deserializeAws_restXmlGetObjectRetentionCommand;
const deserializeAws_restXmlGetObjectRetentionCommandError = async (output, context) => {
    const parsedOutput = {
        ...output,
        body: await parseBody(output.body, context),
    };
    let response;
    let errorCode = "UnknownError";
    errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
    switch (errorCode) {
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
const deserializeAws_restXmlGetObjectTaggingCommand = async (output, context) => {
    if (output.statusCode !== 200 && output.statusCode >= 300) {
        return deserializeAws_restXmlGetObjectTaggingCommandError(output, context);
    }
    const contents = {
        $metadata: deserializeMetadata(output),
        TagSet: undefined,
        VersionId: undefined,
    };
    if (output.headers["x-amz-version-id"] !== undefined) {
        contents.VersionId = output.headers["x-amz-version-id"];
    }
    const data = await parseBody(output.body, context);
    if (data.TagSet === "") {
        contents.TagSet = [];
    }
    if (data["TagSet"] !== undefined && data["TagSet"]["Tag"] !== undefined) {
        contents.TagSet = deserializeAws_restXmlTagSet(smithy_client_1.getArrayIfSingleItem(data["TagSet"]["Tag"]), context);
    }
    return Promise.resolve(contents);
};
exports.deserializeAws_restXmlGetObjectTaggingCommand = deserializeAws_restXmlGetObjectTaggingCommand;
const deserializeAws_restXmlGetObjectTaggingCommandError = async (output, context) => {
    const parsedOutput = {
        ...output,
        body: await parseBody(output.body, context),
    };
    let response;
    let errorCode = "UnknownError";
    errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
    switch (errorCode) {
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
const deserializeAws_restXmlGetObjectTorrentCommand = async (output, context) => {
    if (output.statusCode !== 200 && output.statusCode >= 300) {
        return deserializeAws_restXmlGetObjectTorrentCommandError(output, context);
    }
    const contents = {
        $metadata: deserializeMetadata(output),
        Body: undefined,
        RequestCharged: undefined,
    };
    if (output.headers["x-amz-request-charged"] !== undefined) {
        contents.RequestCharged = output.headers["x-amz-request-charged"];
    }
    const data = output.body;
    contents.Body = data;
    return Promise.resolve(contents);
};
exports.deserializeAws_restXmlGetObjectTorrentCommand = deserializeAws_restXmlGetObjectTorrentCommand;
const deserializeAws_restXmlGetObjectTorrentCommandError = async (output, context) => {
    const parsedOutput = {
        ...output,
        body: await parseBody(output.body, context),
    };
    let response;
    let errorCode = "UnknownError";
    errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
    switch (errorCode) {
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
const deserializeAws_restXmlGetPublicAccessBlockCommand = async (output, context) => {
    if (output.statusCode !== 200 && output.statusCode >= 300) {
        return deserializeAws_restXmlGetPublicAccessBlockCommandError(output, context);
    }
    const contents = {
        $metadata: deserializeMetadata(output),
        PublicAccessBlockConfiguration: undefined,
    };
    const data = await parseBody(output.body, context);
    contents.PublicAccessBlockConfiguration = deserializeAws_restXmlPublicAccessBlockConfiguration(data, context);
    return Promise.resolve(contents);
};
exports.deserializeAws_restXmlGetPublicAccessBlockCommand = deserializeAws_restXmlGetPublicAccessBlockCommand;
const deserializeAws_restXmlGetPublicAccessBlockCommandError = async (output, context) => {
    const parsedOutput = {
        ...output,
        body: await parseBody(output.body, context),
    };
    let response;
    let errorCode = "UnknownError";
    errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
    switch (errorCode) {
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
const deserializeAws_restXmlHeadBucketCommand = async (output, context) => {
    if (output.statusCode !== 200 && output.statusCode >= 300) {
        return deserializeAws_restXmlHeadBucketCommandError(output, context);
    }
    const contents = {
        $metadata: deserializeMetadata(output),
    };
    await collectBody(output.body, context);
    return Promise.resolve(contents);
};
exports.deserializeAws_restXmlHeadBucketCommand = deserializeAws_restXmlHeadBucketCommand;
const deserializeAws_restXmlHeadBucketCommandError = async (output, context) => {
    const parsedOutput = {
        ...output,
        body: await parseBody(output.body, context),
    };
    let response;
    let errorCode = "UnknownError";
    errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
    switch (errorCode) {
        case "NoSuchBucket":
        case "com.amazonaws.s3#NoSuchBucket":
            response = {
                ...(await deserializeAws_restXmlNoSuchBucketResponse(parsedOutput, context)),
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
const deserializeAws_restXmlHeadObjectCommand = async (output, context) => {
    if (output.statusCode !== 200 && output.statusCode >= 300) {
        return deserializeAws_restXmlHeadObjectCommandError(output, context);
    }
    const contents = {
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
    Object.keys(output.headers).forEach((header) => {
        if (contents.Metadata === undefined) {
            contents.Metadata = {};
        }
        if (header.startsWith("x-amz-meta-")) {
            contents.Metadata[header.substring(11)] = output.headers[header];
        }
    });
    await collectBody(output.body, context);
    return Promise.resolve(contents);
};
exports.deserializeAws_restXmlHeadObjectCommand = deserializeAws_restXmlHeadObjectCommand;
const deserializeAws_restXmlHeadObjectCommandError = async (output, context) => {
    const parsedOutput = {
        ...output,
        body: await parseBody(output.body, context),
    };
    let response;
    let errorCode = "UnknownError";
    errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
    switch (errorCode) {
        case "NoSuchKey":
        case "com.amazonaws.s3#NoSuchKey":
            response = {
                ...(await deserializeAws_restXmlNoSuchKeyResponse(parsedOutput, context)),
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
const deserializeAws_restXmlListBucketAnalyticsConfigurationsCommand = async (output, context) => {
    if (output.statusCode !== 200 && output.statusCode >= 300) {
        return deserializeAws_restXmlListBucketAnalyticsConfigurationsCommandError(output, context);
    }
    const contents = {
        $metadata: deserializeMetadata(output),
        AnalyticsConfigurationList: undefined,
        ContinuationToken: undefined,
        IsTruncated: undefined,
        NextContinuationToken: undefined,
    };
    const data = await parseBody(output.body, context);
    if (data.AnalyticsConfiguration === "") {
        contents.AnalyticsConfigurationList = [];
    }
    if (data["AnalyticsConfiguration"] !== undefined) {
        contents.AnalyticsConfigurationList = deserializeAws_restXmlAnalyticsConfigurationList(smithy_client_1.getArrayIfSingleItem(data["AnalyticsConfiguration"]), context);
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
    return Promise.resolve(contents);
};
exports.deserializeAws_restXmlListBucketAnalyticsConfigurationsCommand = deserializeAws_restXmlListBucketAnalyticsConfigurationsCommand;
const deserializeAws_restXmlListBucketAnalyticsConfigurationsCommandError = async (output, context) => {
    const parsedOutput = {
        ...output,
        body: await parseBody(output.body, context),
    };
    let response;
    let errorCode = "UnknownError";
    errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
    switch (errorCode) {
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
const deserializeAws_restXmlListBucketIntelligentTieringConfigurationsCommand = async (output, context) => {
    if (output.statusCode !== 200 && output.statusCode >= 300) {
        return deserializeAws_restXmlListBucketIntelligentTieringConfigurationsCommandError(output, context);
    }
    const contents = {
        $metadata: deserializeMetadata(output),
        ContinuationToken: undefined,
        IntelligentTieringConfigurationList: undefined,
        IsTruncated: undefined,
        NextContinuationToken: undefined,
    };
    const data = await parseBody(output.body, context);
    if (data["ContinuationToken"] !== undefined) {
        contents.ContinuationToken = data["ContinuationToken"];
    }
    if (data.IntelligentTieringConfiguration === "") {
        contents.IntelligentTieringConfigurationList = [];
    }
    if (data["IntelligentTieringConfiguration"] !== undefined) {
        contents.IntelligentTieringConfigurationList = deserializeAws_restXmlIntelligentTieringConfigurationList(smithy_client_1.getArrayIfSingleItem(data["IntelligentTieringConfiguration"]), context);
    }
    if (data["IsTruncated"] !== undefined) {
        contents.IsTruncated = data["IsTruncated"] == "true";
    }
    if (data["NextContinuationToken"] !== undefined) {
        contents.NextContinuationToken = data["NextContinuationToken"];
    }
    return Promise.resolve(contents);
};
exports.deserializeAws_restXmlListBucketIntelligentTieringConfigurationsCommand = deserializeAws_restXmlListBucketIntelligentTieringConfigurationsCommand;
const deserializeAws_restXmlListBucketIntelligentTieringConfigurationsCommandError = async (output, context) => {
    const parsedOutput = {
        ...output,
        body: await parseBody(output.body, context),
    };
    let response;
    let errorCode = "UnknownError";
    errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
    switch (errorCode) {
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
const deserializeAws_restXmlListBucketInventoryConfigurationsCommand = async (output, context) => {
    if (output.statusCode !== 200 && output.statusCode >= 300) {
        return deserializeAws_restXmlListBucketInventoryConfigurationsCommandError(output, context);
    }
    const contents = {
        $metadata: deserializeMetadata(output),
        ContinuationToken: undefined,
        InventoryConfigurationList: undefined,
        IsTruncated: undefined,
        NextContinuationToken: undefined,
    };
    const data = await parseBody(output.body, context);
    if (data["ContinuationToken"] !== undefined) {
        contents.ContinuationToken = data["ContinuationToken"];
    }
    if (data.InventoryConfiguration === "") {
        contents.InventoryConfigurationList = [];
    }
    if (data["InventoryConfiguration"] !== undefined) {
        contents.InventoryConfigurationList = deserializeAws_restXmlInventoryConfigurationList(smithy_client_1.getArrayIfSingleItem(data["InventoryConfiguration"]), context);
    }
    if (data["IsTruncated"] !== undefined) {
        contents.IsTruncated = data["IsTruncated"] == "true";
    }
    if (data["NextContinuationToken"] !== undefined) {
        contents.NextContinuationToken = data["NextContinuationToken"];
    }
    return Promise.resolve(contents);
};
exports.deserializeAws_restXmlListBucketInventoryConfigurationsCommand = deserializeAws_restXmlListBucketInventoryConfigurationsCommand;
const deserializeAws_restXmlListBucketInventoryConfigurationsCommandError = async (output, context) => {
    const parsedOutput = {
        ...output,
        body: await parseBody(output.body, context),
    };
    let response;
    let errorCode = "UnknownError";
    errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
    switch (errorCode) {
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
const deserializeAws_restXmlListBucketMetricsConfigurationsCommand = async (output, context) => {
    if (output.statusCode !== 200 && output.statusCode >= 300) {
        return deserializeAws_restXmlListBucketMetricsConfigurationsCommandError(output, context);
    }
    const contents = {
        $metadata: deserializeMetadata(output),
        ContinuationToken: undefined,
        IsTruncated: undefined,
        MetricsConfigurationList: undefined,
        NextContinuationToken: undefined,
    };
    const data = await parseBody(output.body, context);
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
        contents.MetricsConfigurationList = deserializeAws_restXmlMetricsConfigurationList(smithy_client_1.getArrayIfSingleItem(data["MetricsConfiguration"]), context);
    }
    if (data["NextContinuationToken"] !== undefined) {
        contents.NextContinuationToken = data["NextContinuationToken"];
    }
    return Promise.resolve(contents);
};
exports.deserializeAws_restXmlListBucketMetricsConfigurationsCommand = deserializeAws_restXmlListBucketMetricsConfigurationsCommand;
const deserializeAws_restXmlListBucketMetricsConfigurationsCommandError = async (output, context) => {
    const parsedOutput = {
        ...output,
        body: await parseBody(output.body, context),
    };
    let response;
    let errorCode = "UnknownError";
    errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
    switch (errorCode) {
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
const deserializeAws_restXmlListBucketsCommand = async (output, context) => {
    if (output.statusCode !== 200 && output.statusCode >= 300) {
        return deserializeAws_restXmlListBucketsCommandError(output, context);
    }
    const contents = {
        $metadata: deserializeMetadata(output),
        Buckets: undefined,
        Owner: undefined,
    };
    const data = await parseBody(output.body, context);
    if (data.Buckets === "") {
        contents.Buckets = [];
    }
    if (data["Buckets"] !== undefined && data["Buckets"]["Bucket"] !== undefined) {
        contents.Buckets = deserializeAws_restXmlBuckets(smithy_client_1.getArrayIfSingleItem(data["Buckets"]["Bucket"]), context);
    }
    if (data["Owner"] !== undefined) {
        contents.Owner = deserializeAws_restXmlOwner(data["Owner"], context);
    }
    return Promise.resolve(contents);
};
exports.deserializeAws_restXmlListBucketsCommand = deserializeAws_restXmlListBucketsCommand;
const deserializeAws_restXmlListBucketsCommandError = async (output, context) => {
    const parsedOutput = {
        ...output,
        body: await parseBody(output.body, context),
    };
    let response;
    let errorCode = "UnknownError";
    errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
    switch (errorCode) {
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
const deserializeAws_restXmlListMultipartUploadsCommand = async (output, context) => {
    if (output.statusCode !== 200 && output.statusCode >= 300) {
        return deserializeAws_restXmlListMultipartUploadsCommandError(output, context);
    }
    const contents = {
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
    const data = await parseBody(output.body, context);
    if (data["Bucket"] !== undefined) {
        contents.Bucket = data["Bucket"];
    }
    if (data.CommonPrefixes === "") {
        contents.CommonPrefixes = [];
    }
    if (data["CommonPrefixes"] !== undefined) {
        contents.CommonPrefixes = deserializeAws_restXmlCommonPrefixList(smithy_client_1.getArrayIfSingleItem(data["CommonPrefixes"]), context);
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
        contents.Uploads = deserializeAws_restXmlMultipartUploadList(smithy_client_1.getArrayIfSingleItem(data["Upload"]), context);
    }
    return Promise.resolve(contents);
};
exports.deserializeAws_restXmlListMultipartUploadsCommand = deserializeAws_restXmlListMultipartUploadsCommand;
const deserializeAws_restXmlListMultipartUploadsCommandError = async (output, context) => {
    const parsedOutput = {
        ...output,
        body: await parseBody(output.body, context),
    };
    let response;
    let errorCode = "UnknownError";
    errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
    switch (errorCode) {
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
const deserializeAws_restXmlListObjectsCommand = async (output, context) => {
    if (output.statusCode !== 200 && output.statusCode >= 300) {
        return deserializeAws_restXmlListObjectsCommandError(output, context);
    }
    const contents = {
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
    const data = await parseBody(output.body, context);
    if (data.CommonPrefixes === "") {
        contents.CommonPrefixes = [];
    }
    if (data["CommonPrefixes"] !== undefined) {
        contents.CommonPrefixes = deserializeAws_restXmlCommonPrefixList(smithy_client_1.getArrayIfSingleItem(data["CommonPrefixes"]), context);
    }
    if (data.Contents === "") {
        contents.Contents = [];
    }
    if (data["Contents"] !== undefined) {
        contents.Contents = deserializeAws_restXmlObjectList(smithy_client_1.getArrayIfSingleItem(data["Contents"]), context);
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
    return Promise.resolve(contents);
};
exports.deserializeAws_restXmlListObjectsCommand = deserializeAws_restXmlListObjectsCommand;
const deserializeAws_restXmlListObjectsCommandError = async (output, context) => {
    const parsedOutput = {
        ...output,
        body: await parseBody(output.body, context),
    };
    let response;
    let errorCode = "UnknownError";
    errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
    switch (errorCode) {
        case "NoSuchBucket":
        case "com.amazonaws.s3#NoSuchBucket":
            response = {
                ...(await deserializeAws_restXmlNoSuchBucketResponse(parsedOutput, context)),
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
const deserializeAws_restXmlListObjectsV2Command = async (output, context) => {
    if (output.statusCode !== 200 && output.statusCode >= 300) {
        return deserializeAws_restXmlListObjectsV2CommandError(output, context);
    }
    const contents = {
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
    const data = await parseBody(output.body, context);
    if (data.CommonPrefixes === "") {
        contents.CommonPrefixes = [];
    }
    if (data["CommonPrefixes"] !== undefined) {
        contents.CommonPrefixes = deserializeAws_restXmlCommonPrefixList(smithy_client_1.getArrayIfSingleItem(data["CommonPrefixes"]), context);
    }
    if (data.Contents === "") {
        contents.Contents = [];
    }
    if (data["Contents"] !== undefined) {
        contents.Contents = deserializeAws_restXmlObjectList(smithy_client_1.getArrayIfSingleItem(data["Contents"]), context);
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
    return Promise.resolve(contents);
};
exports.deserializeAws_restXmlListObjectsV2Command = deserializeAws_restXmlListObjectsV2Command;
const deserializeAws_restXmlListObjectsV2CommandError = async (output, context) => {
    const parsedOutput = {
        ...output,
        body: await parseBody(output.body, context),
    };
    let response;
    let errorCode = "UnknownError";
    errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
    switch (errorCode) {
        case "NoSuchBucket":
        case "com.amazonaws.s3#NoSuchBucket":
            response = {
                ...(await deserializeAws_restXmlNoSuchBucketResponse(parsedOutput, context)),
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
const deserializeAws_restXmlListObjectVersionsCommand = async (output, context) => {
    if (output.statusCode !== 200 && output.statusCode >= 300) {
        return deserializeAws_restXmlListObjectVersionsCommandError(output, context);
    }
    const contents = {
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
    const data = await parseBody(output.body, context);
    if (data.CommonPrefixes === "") {
        contents.CommonPrefixes = [];
    }
    if (data["CommonPrefixes"] !== undefined) {
        contents.CommonPrefixes = deserializeAws_restXmlCommonPrefixList(smithy_client_1.getArrayIfSingleItem(data["CommonPrefixes"]), context);
    }
    if (data.DeleteMarker === "") {
        contents.DeleteMarkers = [];
    }
    if (data["DeleteMarker"] !== undefined) {
        contents.DeleteMarkers = deserializeAws_restXmlDeleteMarkers(smithy_client_1.getArrayIfSingleItem(data["DeleteMarker"]), context);
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
        contents.Versions = deserializeAws_restXmlObjectVersionList(smithy_client_1.getArrayIfSingleItem(data["Version"]), context);
    }
    return Promise.resolve(contents);
};
exports.deserializeAws_restXmlListObjectVersionsCommand = deserializeAws_restXmlListObjectVersionsCommand;
const deserializeAws_restXmlListObjectVersionsCommandError = async (output, context) => {
    const parsedOutput = {
        ...output,
        body: await parseBody(output.body, context),
    };
    let response;
    let errorCode = "UnknownError";
    errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
    switch (errorCode) {
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
const deserializeAws_restXmlListPartsCommand = async (output, context) => {
    if (output.statusCode !== 200 && output.statusCode >= 300) {
        return deserializeAws_restXmlListPartsCommandError(output, context);
    }
    const contents = {
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
    const data = await parseBody(output.body, context);
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
        contents.Parts = deserializeAws_restXmlParts(smithy_client_1.getArrayIfSingleItem(data["Part"]), context);
    }
    if (data["StorageClass"] !== undefined) {
        contents.StorageClass = data["StorageClass"];
    }
    if (data["UploadId"] !== undefined) {
        contents.UploadId = data["UploadId"];
    }
    return Promise.resolve(contents);
};
exports.deserializeAws_restXmlListPartsCommand = deserializeAws_restXmlListPartsCommand;
const deserializeAws_restXmlListPartsCommandError = async (output, context) => {
    const parsedOutput = {
        ...output,
        body: await parseBody(output.body, context),
    };
    let response;
    let errorCode = "UnknownError";
    errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
    switch (errorCode) {
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
const deserializeAws_restXmlPutBucketAccelerateConfigurationCommand = async (output, context) => {
    if (output.statusCode !== 200 && output.statusCode >= 300) {
        return deserializeAws_restXmlPutBucketAccelerateConfigurationCommandError(output, context);
    }
    const contents = {
        $metadata: deserializeMetadata(output),
    };
    await collectBody(output.body, context);
    return Promise.resolve(contents);
};
exports.deserializeAws_restXmlPutBucketAccelerateConfigurationCommand = deserializeAws_restXmlPutBucketAccelerateConfigurationCommand;
const deserializeAws_restXmlPutBucketAccelerateConfigurationCommandError = async (output, context) => {
    const parsedOutput = {
        ...output,
        body: await parseBody(output.body, context),
    };
    let response;
    let errorCode = "UnknownError";
    errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
    switch (errorCode) {
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
const deserializeAws_restXmlPutBucketAclCommand = async (output, context) => {
    if (output.statusCode !== 200 && output.statusCode >= 300) {
        return deserializeAws_restXmlPutBucketAclCommandError(output, context);
    }
    const contents = {
        $metadata: deserializeMetadata(output),
    };
    await collectBody(output.body, context);
    return Promise.resolve(contents);
};
exports.deserializeAws_restXmlPutBucketAclCommand = deserializeAws_restXmlPutBucketAclCommand;
const deserializeAws_restXmlPutBucketAclCommandError = async (output, context) => {
    const parsedOutput = {
        ...output,
        body: await parseBody(output.body, context),
    };
    let response;
    let errorCode = "UnknownError";
    errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
    switch (errorCode) {
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
const deserializeAws_restXmlPutBucketAnalyticsConfigurationCommand = async (output, context) => {
    if (output.statusCode !== 200 && output.statusCode >= 300) {
        return deserializeAws_restXmlPutBucketAnalyticsConfigurationCommandError(output, context);
    }
    const contents = {
        $metadata: deserializeMetadata(output),
    };
    await collectBody(output.body, context);
    return Promise.resolve(contents);
};
exports.deserializeAws_restXmlPutBucketAnalyticsConfigurationCommand = deserializeAws_restXmlPutBucketAnalyticsConfigurationCommand;
const deserializeAws_restXmlPutBucketAnalyticsConfigurationCommandError = async (output, context) => {
    const parsedOutput = {
        ...output,
        body: await parseBody(output.body, context),
    };
    let response;
    let errorCode = "UnknownError";
    errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
    switch (errorCode) {
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
const deserializeAws_restXmlPutBucketCorsCommand = async (output, context) => {
    if (output.statusCode !== 200 && output.statusCode >= 300) {
        return deserializeAws_restXmlPutBucketCorsCommandError(output, context);
    }
    const contents = {
        $metadata: deserializeMetadata(output),
    };
    await collectBody(output.body, context);
    return Promise.resolve(contents);
};
exports.deserializeAws_restXmlPutBucketCorsCommand = deserializeAws_restXmlPutBucketCorsCommand;
const deserializeAws_restXmlPutBucketCorsCommandError = async (output, context) => {
    const parsedOutput = {
        ...output,
        body: await parseBody(output.body, context),
    };
    let response;
    let errorCode = "UnknownError";
    errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
    switch (errorCode) {
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
const deserializeAws_restXmlPutBucketEncryptionCommand = async (output, context) => {
    if (output.statusCode !== 200 && output.statusCode >= 300) {
        return deserializeAws_restXmlPutBucketEncryptionCommandError(output, context);
    }
    const contents = {
        $metadata: deserializeMetadata(output),
    };
    await collectBody(output.body, context);
    return Promise.resolve(contents);
};
exports.deserializeAws_restXmlPutBucketEncryptionCommand = deserializeAws_restXmlPutBucketEncryptionCommand;
const deserializeAws_restXmlPutBucketEncryptionCommandError = async (output, context) => {
    const parsedOutput = {
        ...output,
        body: await parseBody(output.body, context),
    };
    let response;
    let errorCode = "UnknownError";
    errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
    switch (errorCode) {
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
const deserializeAws_restXmlPutBucketIntelligentTieringConfigurationCommand = async (output, context) => {
    if (output.statusCode !== 200 && output.statusCode >= 300) {
        return deserializeAws_restXmlPutBucketIntelligentTieringConfigurationCommandError(output, context);
    }
    const contents = {
        $metadata: deserializeMetadata(output),
    };
    await collectBody(output.body, context);
    return Promise.resolve(contents);
};
exports.deserializeAws_restXmlPutBucketIntelligentTieringConfigurationCommand = deserializeAws_restXmlPutBucketIntelligentTieringConfigurationCommand;
const deserializeAws_restXmlPutBucketIntelligentTieringConfigurationCommandError = async (output, context) => {
    const parsedOutput = {
        ...output,
        body: await parseBody(output.body, context),
    };
    let response;
    let errorCode = "UnknownError";
    errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
    switch (errorCode) {
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
const deserializeAws_restXmlPutBucketInventoryConfigurationCommand = async (output, context) => {
    if (output.statusCode !== 200 && output.statusCode >= 300) {
        return deserializeAws_restXmlPutBucketInventoryConfigurationCommandError(output, context);
    }
    const contents = {
        $metadata: deserializeMetadata(output),
    };
    await collectBody(output.body, context);
    return Promise.resolve(contents);
};
exports.deserializeAws_restXmlPutBucketInventoryConfigurationCommand = deserializeAws_restXmlPutBucketInventoryConfigurationCommand;
const deserializeAws_restXmlPutBucketInventoryConfigurationCommandError = async (output, context) => {
    const parsedOutput = {
        ...output,
        body: await parseBody(output.body, context),
    };
    let response;
    let errorCode = "UnknownError";
    errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
    switch (errorCode) {
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
const deserializeAws_restXmlPutBucketLifecycleConfigurationCommand = async (output, context) => {
    if (output.statusCode !== 200 && output.statusCode >= 300) {
        return deserializeAws_restXmlPutBucketLifecycleConfigurationCommandError(output, context);
    }
    const contents = {
        $metadata: deserializeMetadata(output),
    };
    await collectBody(output.body, context);
    return Promise.resolve(contents);
};
exports.deserializeAws_restXmlPutBucketLifecycleConfigurationCommand = deserializeAws_restXmlPutBucketLifecycleConfigurationCommand;
const deserializeAws_restXmlPutBucketLifecycleConfigurationCommandError = async (output, context) => {
    const parsedOutput = {
        ...output,
        body: await parseBody(output.body, context),
    };
    let response;
    let errorCode = "UnknownError";
    errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
    switch (errorCode) {
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
const deserializeAws_restXmlPutBucketLoggingCommand = async (output, context) => {
    if (output.statusCode !== 200 && output.statusCode >= 300) {
        return deserializeAws_restXmlPutBucketLoggingCommandError(output, context);
    }
    const contents = {
        $metadata: deserializeMetadata(output),
    };
    await collectBody(output.body, context);
    return Promise.resolve(contents);
};
exports.deserializeAws_restXmlPutBucketLoggingCommand = deserializeAws_restXmlPutBucketLoggingCommand;
const deserializeAws_restXmlPutBucketLoggingCommandError = async (output, context) => {
    const parsedOutput = {
        ...output,
        body: await parseBody(output.body, context),
    };
    let response;
    let errorCode = "UnknownError";
    errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
    switch (errorCode) {
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
const deserializeAws_restXmlPutBucketMetricsConfigurationCommand = async (output, context) => {
    if (output.statusCode !== 200 && output.statusCode >= 300) {
        return deserializeAws_restXmlPutBucketMetricsConfigurationCommandError(output, context);
    }
    const contents = {
        $metadata: deserializeMetadata(output),
    };
    await collectBody(output.body, context);
    return Promise.resolve(contents);
};
exports.deserializeAws_restXmlPutBucketMetricsConfigurationCommand = deserializeAws_restXmlPutBucketMetricsConfigurationCommand;
const deserializeAws_restXmlPutBucketMetricsConfigurationCommandError = async (output, context) => {
    const parsedOutput = {
        ...output,
        body: await parseBody(output.body, context),
    };
    let response;
    let errorCode = "UnknownError";
    errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
    switch (errorCode) {
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
const deserializeAws_restXmlPutBucketNotificationConfigurationCommand = async (output, context) => {
    if (output.statusCode !== 200 && output.statusCode >= 300) {
        return deserializeAws_restXmlPutBucketNotificationConfigurationCommandError(output, context);
    }
    const contents = {
        $metadata: deserializeMetadata(output),
    };
    await collectBody(output.body, context);
    return Promise.resolve(contents);
};
exports.deserializeAws_restXmlPutBucketNotificationConfigurationCommand = deserializeAws_restXmlPutBucketNotificationConfigurationCommand;
const deserializeAws_restXmlPutBucketNotificationConfigurationCommandError = async (output, context) => {
    const parsedOutput = {
        ...output,
        body: await parseBody(output.body, context),
    };
    let response;
    let errorCode = "UnknownError";
    errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
    switch (errorCode) {
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
const deserializeAws_restXmlPutBucketOwnershipControlsCommand = async (output, context) => {
    if (output.statusCode !== 200 && output.statusCode >= 300) {
        return deserializeAws_restXmlPutBucketOwnershipControlsCommandError(output, context);
    }
    const contents = {
        $metadata: deserializeMetadata(output),
    };
    await collectBody(output.body, context);
    return Promise.resolve(contents);
};
exports.deserializeAws_restXmlPutBucketOwnershipControlsCommand = deserializeAws_restXmlPutBucketOwnershipControlsCommand;
const deserializeAws_restXmlPutBucketOwnershipControlsCommandError = async (output, context) => {
    const parsedOutput = {
        ...output,
        body: await parseBody(output.body, context),
    };
    let response;
    let errorCode = "UnknownError";
    errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
    switch (errorCode) {
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
const deserializeAws_restXmlPutBucketPolicyCommand = async (output, context) => {
    if (output.statusCode !== 200 && output.statusCode >= 300) {
        return deserializeAws_restXmlPutBucketPolicyCommandError(output, context);
    }
    const contents = {
        $metadata: deserializeMetadata(output),
    };
    await collectBody(output.body, context);
    return Promise.resolve(contents);
};
exports.deserializeAws_restXmlPutBucketPolicyCommand = deserializeAws_restXmlPutBucketPolicyCommand;
const deserializeAws_restXmlPutBucketPolicyCommandError = async (output, context) => {
    const parsedOutput = {
        ...output,
        body: await parseBody(output.body, context),
    };
    let response;
    let errorCode = "UnknownError";
    errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
    switch (errorCode) {
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
const deserializeAws_restXmlPutBucketReplicationCommand = async (output, context) => {
    if (output.statusCode !== 200 && output.statusCode >= 300) {
        return deserializeAws_restXmlPutBucketReplicationCommandError(output, context);
    }
    const contents = {
        $metadata: deserializeMetadata(output),
    };
    await collectBody(output.body, context);
    return Promise.resolve(contents);
};
exports.deserializeAws_restXmlPutBucketReplicationCommand = deserializeAws_restXmlPutBucketReplicationCommand;
const deserializeAws_restXmlPutBucketReplicationCommandError = async (output, context) => {
    const parsedOutput = {
        ...output,
        body: await parseBody(output.body, context),
    };
    let response;
    let errorCode = "UnknownError";
    errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
    switch (errorCode) {
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
const deserializeAws_restXmlPutBucketRequestPaymentCommand = async (output, context) => {
    if (output.statusCode !== 200 && output.statusCode >= 300) {
        return deserializeAws_restXmlPutBucketRequestPaymentCommandError(output, context);
    }
    const contents = {
        $metadata: deserializeMetadata(output),
    };
    await collectBody(output.body, context);
    return Promise.resolve(contents);
};
exports.deserializeAws_restXmlPutBucketRequestPaymentCommand = deserializeAws_restXmlPutBucketRequestPaymentCommand;
const deserializeAws_restXmlPutBucketRequestPaymentCommandError = async (output, context) => {
    const parsedOutput = {
        ...output,
        body: await parseBody(output.body, context),
    };
    let response;
    let errorCode = "UnknownError";
    errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
    switch (errorCode) {
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
const deserializeAws_restXmlPutBucketTaggingCommand = async (output, context) => {
    if (output.statusCode !== 200 && output.statusCode >= 300) {
        return deserializeAws_restXmlPutBucketTaggingCommandError(output, context);
    }
    const contents = {
        $metadata: deserializeMetadata(output),
    };
    await collectBody(output.body, context);
    return Promise.resolve(contents);
};
exports.deserializeAws_restXmlPutBucketTaggingCommand = deserializeAws_restXmlPutBucketTaggingCommand;
const deserializeAws_restXmlPutBucketTaggingCommandError = async (output, context) => {
    const parsedOutput = {
        ...output,
        body: await parseBody(output.body, context),
    };
    let response;
    let errorCode = "UnknownError";
    errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
    switch (errorCode) {
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
const deserializeAws_restXmlPutBucketVersioningCommand = async (output, context) => {
    if (output.statusCode !== 200 && output.statusCode >= 300) {
        return deserializeAws_restXmlPutBucketVersioningCommandError(output, context);
    }
    const contents = {
        $metadata: deserializeMetadata(output),
    };
    await collectBody(output.body, context);
    return Promise.resolve(contents);
};
exports.deserializeAws_restXmlPutBucketVersioningCommand = deserializeAws_restXmlPutBucketVersioningCommand;
const deserializeAws_restXmlPutBucketVersioningCommandError = async (output, context) => {
    const parsedOutput = {
        ...output,
        body: await parseBody(output.body, context),
    };
    let response;
    let errorCode = "UnknownError";
    errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
    switch (errorCode) {
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
const deserializeAws_restXmlPutBucketWebsiteCommand = async (output, context) => {
    if (output.statusCode !== 200 && output.statusCode >= 300) {
        return deserializeAws_restXmlPutBucketWebsiteCommandError(output, context);
    }
    const contents = {
        $metadata: deserializeMetadata(output),
    };
    await collectBody(output.body, context);
    return Promise.resolve(contents);
};
exports.deserializeAws_restXmlPutBucketWebsiteCommand = deserializeAws_restXmlPutBucketWebsiteCommand;
const deserializeAws_restXmlPutBucketWebsiteCommandError = async (output, context) => {
    const parsedOutput = {
        ...output,
        body: await parseBody(output.body, context),
    };
    let response;
    let errorCode = "UnknownError";
    errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
    switch (errorCode) {
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
const deserializeAws_restXmlPutObjectCommand = async (output, context) => {
    if (output.statusCode !== 200 && output.statusCode >= 300) {
        return deserializeAws_restXmlPutObjectCommandError(output, context);
    }
    const contents = {
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
    await collectBody(output.body, context);
    return Promise.resolve(contents);
};
exports.deserializeAws_restXmlPutObjectCommand = deserializeAws_restXmlPutObjectCommand;
const deserializeAws_restXmlPutObjectCommandError = async (output, context) => {
    const parsedOutput = {
        ...output,
        body: await parseBody(output.body, context),
    };
    let response;
    let errorCode = "UnknownError";
    errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
    switch (errorCode) {
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
const deserializeAws_restXmlPutObjectAclCommand = async (output, context) => {
    if (output.statusCode !== 200 && output.statusCode >= 300) {
        return deserializeAws_restXmlPutObjectAclCommandError(output, context);
    }
    const contents = {
        $metadata: deserializeMetadata(output),
        RequestCharged: undefined,
    };
    if (output.headers["x-amz-request-charged"] !== undefined) {
        contents.RequestCharged = output.headers["x-amz-request-charged"];
    }
    await collectBody(output.body, context);
    return Promise.resolve(contents);
};
exports.deserializeAws_restXmlPutObjectAclCommand = deserializeAws_restXmlPutObjectAclCommand;
const deserializeAws_restXmlPutObjectAclCommandError = async (output, context) => {
    const parsedOutput = {
        ...output,
        body: await parseBody(output.body, context),
    };
    let response;
    let errorCode = "UnknownError";
    errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
    switch (errorCode) {
        case "NoSuchKey":
        case "com.amazonaws.s3#NoSuchKey":
            response = {
                ...(await deserializeAws_restXmlNoSuchKeyResponse(parsedOutput, context)),
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
const deserializeAws_restXmlPutObjectLegalHoldCommand = async (output, context) => {
    if (output.statusCode !== 200 && output.statusCode >= 300) {
        return deserializeAws_restXmlPutObjectLegalHoldCommandError(output, context);
    }
    const contents = {
        $metadata: deserializeMetadata(output),
        RequestCharged: undefined,
    };
    if (output.headers["x-amz-request-charged"] !== undefined) {
        contents.RequestCharged = output.headers["x-amz-request-charged"];
    }
    await collectBody(output.body, context);
    return Promise.resolve(contents);
};
exports.deserializeAws_restXmlPutObjectLegalHoldCommand = deserializeAws_restXmlPutObjectLegalHoldCommand;
const deserializeAws_restXmlPutObjectLegalHoldCommandError = async (output, context) => {
    const parsedOutput = {
        ...output,
        body: await parseBody(output.body, context),
    };
    let response;
    let errorCode = "UnknownError";
    errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
    switch (errorCode) {
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
const deserializeAws_restXmlPutObjectLockConfigurationCommand = async (output, context) => {
    if (output.statusCode !== 200 && output.statusCode >= 300) {
        return deserializeAws_restXmlPutObjectLockConfigurationCommandError(output, context);
    }
    const contents = {
        $metadata: deserializeMetadata(output),
        RequestCharged: undefined,
    };
    if (output.headers["x-amz-request-charged"] !== undefined) {
        contents.RequestCharged = output.headers["x-amz-request-charged"];
    }
    await collectBody(output.body, context);
    return Promise.resolve(contents);
};
exports.deserializeAws_restXmlPutObjectLockConfigurationCommand = deserializeAws_restXmlPutObjectLockConfigurationCommand;
const deserializeAws_restXmlPutObjectLockConfigurationCommandError = async (output, context) => {
    const parsedOutput = {
        ...output,
        body: await parseBody(output.body, context),
    };
    let response;
    let errorCode = "UnknownError";
    errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
    switch (errorCode) {
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
const deserializeAws_restXmlPutObjectRetentionCommand = async (output, context) => {
    if (output.statusCode !== 200 && output.statusCode >= 300) {
        return deserializeAws_restXmlPutObjectRetentionCommandError(output, context);
    }
    const contents = {
        $metadata: deserializeMetadata(output),
        RequestCharged: undefined,
    };
    if (output.headers["x-amz-request-charged"] !== undefined) {
        contents.RequestCharged = output.headers["x-amz-request-charged"];
    }
    await collectBody(output.body, context);
    return Promise.resolve(contents);
};
exports.deserializeAws_restXmlPutObjectRetentionCommand = deserializeAws_restXmlPutObjectRetentionCommand;
const deserializeAws_restXmlPutObjectRetentionCommandError = async (output, context) => {
    const parsedOutput = {
        ...output,
        body: await parseBody(output.body, context),
    };
    let response;
    let errorCode = "UnknownError";
    errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
    switch (errorCode) {
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
const deserializeAws_restXmlPutObjectTaggingCommand = async (output, context) => {
    if (output.statusCode !== 200 && output.statusCode >= 300) {
        return deserializeAws_restXmlPutObjectTaggingCommandError(output, context);
    }
    const contents = {
        $metadata: deserializeMetadata(output),
        VersionId: undefined,
    };
    if (output.headers["x-amz-version-id"] !== undefined) {
        contents.VersionId = output.headers["x-amz-version-id"];
    }
    await collectBody(output.body, context);
    return Promise.resolve(contents);
};
exports.deserializeAws_restXmlPutObjectTaggingCommand = deserializeAws_restXmlPutObjectTaggingCommand;
const deserializeAws_restXmlPutObjectTaggingCommandError = async (output, context) => {
    const parsedOutput = {
        ...output,
        body: await parseBody(output.body, context),
    };
    let response;
    let errorCode = "UnknownError";
    errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
    switch (errorCode) {
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
const deserializeAws_restXmlPutPublicAccessBlockCommand = async (output, context) => {
    if (output.statusCode !== 200 && output.statusCode >= 300) {
        return deserializeAws_restXmlPutPublicAccessBlockCommandError(output, context);
    }
    const contents = {
        $metadata: deserializeMetadata(output),
    };
    await collectBody(output.body, context);
    return Promise.resolve(contents);
};
exports.deserializeAws_restXmlPutPublicAccessBlockCommand = deserializeAws_restXmlPutPublicAccessBlockCommand;
const deserializeAws_restXmlPutPublicAccessBlockCommandError = async (output, context) => {
    const parsedOutput = {
        ...output,
        body: await parseBody(output.body, context),
    };
    let response;
    let errorCode = "UnknownError";
    errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
    switch (errorCode) {
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
const deserializeAws_restXmlRestoreObjectCommand = async (output, context) => {
    if (output.statusCode !== 200 && output.statusCode >= 300) {
        return deserializeAws_restXmlRestoreObjectCommandError(output, context);
    }
    const contents = {
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
    await collectBody(output.body, context);
    return Promise.resolve(contents);
};
exports.deserializeAws_restXmlRestoreObjectCommand = deserializeAws_restXmlRestoreObjectCommand;
const deserializeAws_restXmlRestoreObjectCommandError = async (output, context) => {
    const parsedOutput = {
        ...output,
        body: await parseBody(output.body, context),
    };
    let response;
    let errorCode = "UnknownError";
    errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
    switch (errorCode) {
        case "ObjectAlreadyInActiveTierError":
        case "com.amazonaws.s3#ObjectAlreadyInActiveTierError":
            response = {
                ...(await deserializeAws_restXmlObjectAlreadyInActiveTierErrorResponse(parsedOutput, context)),
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
const deserializeAws_restXmlSelectObjectContentCommand = async (output, context) => {
    if (output.statusCode !== 200 && output.statusCode >= 300) {
        return deserializeAws_restXmlSelectObjectContentCommandError(output, context);
    }
    const contents = {
        $metadata: deserializeMetadata(output),
        Payload: undefined,
    };
    const data = context.eventStreamMarshaller.deserialize(output.body, async (event) => {
        const eventName = Object.keys(event)[0];
        const eventHeaders = Object.entries(event[eventName].headers).reduce((accummulator, curr) => {
            accummulator[curr[0]] = curr[1].value;
            return accummulator;
        }, {});
        const eventMessage = {
            headers: eventHeaders,
            body: event[eventName].body,
        };
        const parsedEvent = {
            [eventName]: eventMessage,
        };
        return await deserializeAws_restXmlSelectObjectContentEventStream_event(parsedEvent, context);
    });
    contents.Payload = data;
    return Promise.resolve(contents);
};
exports.deserializeAws_restXmlSelectObjectContentCommand = deserializeAws_restXmlSelectObjectContentCommand;
const deserializeAws_restXmlSelectObjectContentCommandError = async (output, context) => {
    const parsedOutput = {
        ...output,
        body: await parseBody(output.body, context),
    };
    let response;
    let errorCode = "UnknownError";
    errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
    switch (errorCode) {
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
const deserializeAws_restXmlUploadPartCommand = async (output, context) => {
    if (output.statusCode !== 200 && output.statusCode >= 300) {
        return deserializeAws_restXmlUploadPartCommandError(output, context);
    }
    const contents = {
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
    await collectBody(output.body, context);
    return Promise.resolve(contents);
};
exports.deserializeAws_restXmlUploadPartCommand = deserializeAws_restXmlUploadPartCommand;
const deserializeAws_restXmlUploadPartCommandError = async (output, context) => {
    const parsedOutput = {
        ...output,
        body: await parseBody(output.body, context),
    };
    let response;
    let errorCode = "UnknownError";
    errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
    switch (errorCode) {
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
const deserializeAws_restXmlUploadPartCopyCommand = async (output, context) => {
    if (output.statusCode !== 200 && output.statusCode >= 300) {
        return deserializeAws_restXmlUploadPartCopyCommandError(output, context);
    }
    const contents = {
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
    const data = await parseBody(output.body, context);
    contents.CopyPartResult = deserializeAws_restXmlCopyPartResult(data, context);
    return Promise.resolve(contents);
};
exports.deserializeAws_restXmlUploadPartCopyCommand = deserializeAws_restXmlUploadPartCopyCommand;
const deserializeAws_restXmlUploadPartCopyCommandError = async (output, context) => {
    const parsedOutput = {
        ...output,
        body: await parseBody(output.body, context),
    };
    let response;
    let errorCode = "UnknownError";
    errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
    switch (errorCode) {
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
const deserializeAws_restXmlSelectObjectContentEventStream_event = async (output, context) => {
    if (output["Records"] !== undefined) {
        return {
            Records: await deserializeAws_restXmlRecordsEvent_event(output["Records"], context),
        };
    }
    if (output["Stats"] !== undefined) {
        return {
            Stats: await deserializeAws_restXmlStatsEvent_event(output["Stats"], context),
        };
    }
    if (output["Progress"] !== undefined) {
        return {
            Progress: await deserializeAws_restXmlProgressEvent_event(output["Progress"], context),
        };
    }
    if (output["Cont"] !== undefined) {
        return {
            Cont: await deserializeAws_restXmlContinuationEvent_event(output["Cont"], context),
        };
    }
    if (output["End"] !== undefined) {
        return {
            End: await deserializeAws_restXmlEndEvent_event(output["End"], context),
        };
    }
    return { $unknown: output };
};
const deserializeAws_restXmlContinuationEvent_event = async (output, context) => {
    let contents = {};
    return contents;
};
const deserializeAws_restXmlEndEvent_event = async (output, context) => {
    let contents = {};
    return contents;
};
const deserializeAws_restXmlProgressEvent_event = async (output, context) => {
    let contents = {};
    contents.Details = await parseBody(output.body, context);
    return contents;
};
const deserializeAws_restXmlRecordsEvent_event = async (output, context) => {
    let contents = {};
    contents.Payload = output.body;
    return contents;
};
const deserializeAws_restXmlStatsEvent_event = async (output, context) => {
    let contents = {};
    contents.Details = await parseBody(output.body, context);
    return contents;
};
const deserializeAws_restXmlBucketAlreadyExistsResponse = async (parsedOutput, context) => {
    const contents = {
        name: "BucketAlreadyExists",
        $fault: "client",
        $metadata: deserializeMetadata(parsedOutput),
    };
    const data = parsedOutput.body;
    return contents;
};
const deserializeAws_restXmlBucketAlreadyOwnedByYouResponse = async (parsedOutput, context) => {
    const contents = {
        name: "BucketAlreadyOwnedByYou",
        $fault: "client",
        $metadata: deserializeMetadata(parsedOutput),
    };
    const data = parsedOutput.body;
    return contents;
};
const deserializeAws_restXmlInvalidObjectStateResponse = async (parsedOutput, context) => {
    const contents = {
        name: "InvalidObjectState",
        $fault: "client",
        $metadata: deserializeMetadata(parsedOutput),
        AccessTier: undefined,
        StorageClass: undefined,
    };
    const data = parsedOutput.body;
    if (data["AccessTier"] !== undefined) {
        contents.AccessTier = data["AccessTier"];
    }
    if (data["StorageClass"] !== undefined) {
        contents.StorageClass = data["StorageClass"];
    }
    return contents;
};
const deserializeAws_restXmlNoSuchBucketResponse = async (parsedOutput, context) => {
    const contents = {
        name: "NoSuchBucket",
        $fault: "client",
        $metadata: deserializeMetadata(parsedOutput),
    };
    const data = parsedOutput.body;
    return contents;
};
const deserializeAws_restXmlNoSuchKeyResponse = async (parsedOutput, context) => {
    const contents = {
        name: "NoSuchKey",
        $fault: "client",
        $metadata: deserializeMetadata(parsedOutput),
    };
    const data = parsedOutput.body;
    return contents;
};
const deserializeAws_restXmlNoSuchUploadResponse = async (parsedOutput, context) => {
    const contents = {
        name: "NoSuchUpload",
        $fault: "client",
        $metadata: deserializeMetadata(parsedOutput),
    };
    const data = parsedOutput.body;
    return contents;
};
const deserializeAws_restXmlObjectAlreadyInActiveTierErrorResponse = async (parsedOutput, context) => {
    const contents = {
        name: "ObjectAlreadyInActiveTierError",
        $fault: "client",
        $metadata: deserializeMetadata(parsedOutput),
    };
    const data = parsedOutput.body;
    return contents;
};
const deserializeAws_restXmlObjectNotInActiveTierErrorResponse = async (parsedOutput, context) => {
    const contents = {
        name: "ObjectNotInActiveTierError",
        $fault: "client",
        $metadata: deserializeMetadata(parsedOutput),
    };
    const data = parsedOutput.body;
    return contents;
};
const serializeAws_restXmlAbortIncompleteMultipartUpload = (input, context) => {
    const bodyNode = new xml_builder_1.XmlNode("AbortIncompleteMultipartUpload");
    if (input.DaysAfterInitiation !== undefined && input.DaysAfterInitiation !== null) {
        const node = new xml_builder_1.XmlNode("DaysAfterInitiation")
            .addChildNode(new xml_builder_1.XmlText(String(input.DaysAfterInitiation)))
            .withName("DaysAfterInitiation");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
const serializeAws_restXmlAccelerateConfiguration = (input, context) => {
    const bodyNode = new xml_builder_1.XmlNode("AccelerateConfiguration");
    if (input.Status !== undefined && input.Status !== null) {
        const node = new xml_builder_1.XmlNode("BucketAccelerateStatus").addChildNode(new xml_builder_1.XmlText(input.Status)).withName("Status");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
const serializeAws_restXmlAccessControlPolicy = (input, context) => {
    const bodyNode = new xml_builder_1.XmlNode("AccessControlPolicy");
    if (input.Grants !== undefined && input.Grants !== null) {
        const nodes = serializeAws_restXmlGrants(input.Grants, context);
        const containerNode = new xml_builder_1.XmlNode("AccessControlList");
        nodes.map((node) => {
            containerNode.addChildNode(node);
        });
        bodyNode.addChildNode(containerNode);
    }
    if (input.Owner !== undefined && input.Owner !== null) {
        const node = serializeAws_restXmlOwner(input.Owner, context).withName("Owner");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
const serializeAws_restXmlAccessControlTranslation = (input, context) => {
    const bodyNode = new xml_builder_1.XmlNode("AccessControlTranslation");
    if (input.Owner !== undefined && input.Owner !== null) {
        const node = new xml_builder_1.XmlNode("OwnerOverride").addChildNode(new xml_builder_1.XmlText(input.Owner)).withName("Owner");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
const serializeAws_restXmlAllowedHeaders = (input, context) => {
    return input
        .filter((e) => e != null)
        .map((entry) => {
        if (entry === null) {
            return null;
        }
        const node = new xml_builder_1.XmlNode("AllowedHeader").addChildNode(new xml_builder_1.XmlText(entry));
        return node.withName("member");
    });
};
const serializeAws_restXmlAllowedMethods = (input, context) => {
    return input
        .filter((e) => e != null)
        .map((entry) => {
        if (entry === null) {
            return null;
        }
        const node = new xml_builder_1.XmlNode("AllowedMethod").addChildNode(new xml_builder_1.XmlText(entry));
        return node.withName("member");
    });
};
const serializeAws_restXmlAllowedOrigins = (input, context) => {
    return input
        .filter((e) => e != null)
        .map((entry) => {
        if (entry === null) {
            return null;
        }
        const node = new xml_builder_1.XmlNode("AllowedOrigin").addChildNode(new xml_builder_1.XmlText(entry));
        return node.withName("member");
    });
};
const serializeAws_restXmlAnalyticsAndOperator = (input, context) => {
    const bodyNode = new xml_builder_1.XmlNode("AnalyticsAndOperator");
    if (input.Prefix !== undefined && input.Prefix !== null) {
        const node = new xml_builder_1.XmlNode("Prefix").addChildNode(new xml_builder_1.XmlText(input.Prefix)).withName("Prefix");
        bodyNode.addChildNode(node);
    }
    if (input.Tags !== undefined && input.Tags !== null) {
        const nodes = serializeAws_restXmlTagSet(input.Tags, context);
        nodes.map((node) => {
            node = node.withName("Tag");
            bodyNode.addChildNode(node);
        });
    }
    return bodyNode;
};
const serializeAws_restXmlAnalyticsConfiguration = (input, context) => {
    const bodyNode = new xml_builder_1.XmlNode("AnalyticsConfiguration");
    if (input.Id !== undefined && input.Id !== null) {
        const node = new xml_builder_1.XmlNode("AnalyticsId").addChildNode(new xml_builder_1.XmlText(input.Id)).withName("Id");
        bodyNode.addChildNode(node);
    }
    if (input.Filter !== undefined && input.Filter !== null) {
        const node = serializeAws_restXmlAnalyticsFilter(input.Filter, context).withName("Filter");
        bodyNode.addChildNode(node);
    }
    if (input.StorageClassAnalysis !== undefined && input.StorageClassAnalysis !== null) {
        const node = serializeAws_restXmlStorageClassAnalysis(input.StorageClassAnalysis, context).withName("StorageClassAnalysis");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
const serializeAws_restXmlAnalyticsExportDestination = (input, context) => {
    const bodyNode = new xml_builder_1.XmlNode("AnalyticsExportDestination");
    if (input.S3BucketDestination !== undefined && input.S3BucketDestination !== null) {
        const node = serializeAws_restXmlAnalyticsS3BucketDestination(input.S3BucketDestination, context).withName("S3BucketDestination");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
const serializeAws_restXmlAnalyticsFilter = (input, context) => {
    const bodyNode = new xml_builder_1.XmlNode("AnalyticsFilter");
    models_0_1.AnalyticsFilter.visit(input, {
        Prefix: (value) => {
            const node = new xml_builder_1.XmlNode("Prefix").addChildNode(new xml_builder_1.XmlText(value)).withName("Prefix");
            bodyNode.addChildNode(node);
        },
        Tag: (value) => {
            const node = serializeAws_restXmlTag(value, context).withName("Tag");
            bodyNode.addChildNode(node);
        },
        And: (value) => {
            const node = serializeAws_restXmlAnalyticsAndOperator(value, context).withName("And");
            bodyNode.addChildNode(node);
        },
        _: (name, value) => {
            if (!(value instanceof xml_builder_1.XmlNode || value instanceof xml_builder_1.XmlText)) {
                throw new Error("Unable to serialize unknown union members in XML.");
            }
            bodyNode.addChildNode(new xml_builder_1.XmlNode(name).addChildNode(value));
        },
    });
    return bodyNode;
};
const serializeAws_restXmlAnalyticsS3BucketDestination = (input, context) => {
    const bodyNode = new xml_builder_1.XmlNode("AnalyticsS3BucketDestination");
    if (input.Format !== undefined && input.Format !== null) {
        const node = new xml_builder_1.XmlNode("AnalyticsS3ExportFileFormat")
            .addChildNode(new xml_builder_1.XmlText(input.Format))
            .withName("Format");
        bodyNode.addChildNode(node);
    }
    if (input.BucketAccountId !== undefined && input.BucketAccountId !== null) {
        const node = new xml_builder_1.XmlNode("AccountId")
            .addChildNode(new xml_builder_1.XmlText(input.BucketAccountId))
            .withName("BucketAccountId");
        bodyNode.addChildNode(node);
    }
    if (input.Bucket !== undefined && input.Bucket !== null) {
        const node = new xml_builder_1.XmlNode("BucketName").addChildNode(new xml_builder_1.XmlText(input.Bucket)).withName("Bucket");
        bodyNode.addChildNode(node);
    }
    if (input.Prefix !== undefined && input.Prefix !== null) {
        const node = new xml_builder_1.XmlNode("Prefix").addChildNode(new xml_builder_1.XmlText(input.Prefix)).withName("Prefix");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
const serializeAws_restXmlBucketLifecycleConfiguration = (input, context) => {
    const bodyNode = new xml_builder_1.XmlNode("BucketLifecycleConfiguration");
    if (input.Rules !== undefined && input.Rules !== null) {
        const nodes = serializeAws_restXmlLifecycleRules(input.Rules, context);
        nodes.map((node) => {
            node = node.withName("Rule");
            bodyNode.addChildNode(node);
        });
    }
    return bodyNode;
};
const serializeAws_restXmlBucketLoggingStatus = (input, context) => {
    const bodyNode = new xml_builder_1.XmlNode("BucketLoggingStatus");
    if (input.LoggingEnabled !== undefined && input.LoggingEnabled !== null) {
        const node = serializeAws_restXmlLoggingEnabled(input.LoggingEnabled, context).withName("LoggingEnabled");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
const serializeAws_restXmlCompletedMultipartUpload = (input, context) => {
    const bodyNode = new xml_builder_1.XmlNode("CompletedMultipartUpload");
    if (input.Parts !== undefined && input.Parts !== null) {
        const nodes = serializeAws_restXmlCompletedPartList(input.Parts, context);
        nodes.map((node) => {
            node = node.withName("Part");
            bodyNode.addChildNode(node);
        });
    }
    return bodyNode;
};
const serializeAws_restXmlCompletedPart = (input, context) => {
    const bodyNode = new xml_builder_1.XmlNode("CompletedPart");
    if (input.ETag !== undefined && input.ETag !== null) {
        const node = new xml_builder_1.XmlNode("ETag").addChildNode(new xml_builder_1.XmlText(input.ETag)).withName("ETag");
        bodyNode.addChildNode(node);
    }
    if (input.PartNumber !== undefined && input.PartNumber !== null) {
        const node = new xml_builder_1.XmlNode("PartNumber")
            .addChildNode(new xml_builder_1.XmlText(String(input.PartNumber)))
            .withName("PartNumber");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
const serializeAws_restXmlCompletedPartList = (input, context) => {
    return input
        .filter((e) => e != null)
        .map((entry) => {
        if (entry === null) {
            return null;
        }
        const node = serializeAws_restXmlCompletedPart(entry, context);
        return node.withName("member");
    });
};
const serializeAws_restXmlCondition = (input, context) => {
    const bodyNode = new xml_builder_1.XmlNode("Condition");
    if (input.HttpErrorCodeReturnedEquals !== undefined && input.HttpErrorCodeReturnedEquals !== null) {
        const node = new xml_builder_1.XmlNode("HttpErrorCodeReturnedEquals")
            .addChildNode(new xml_builder_1.XmlText(input.HttpErrorCodeReturnedEquals))
            .withName("HttpErrorCodeReturnedEquals");
        bodyNode.addChildNode(node);
    }
    if (input.KeyPrefixEquals !== undefined && input.KeyPrefixEquals !== null) {
        const node = new xml_builder_1.XmlNode("KeyPrefixEquals")
            .addChildNode(new xml_builder_1.XmlText(input.KeyPrefixEquals))
            .withName("KeyPrefixEquals");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
const serializeAws_restXmlCORSConfiguration = (input, context) => {
    const bodyNode = new xml_builder_1.XmlNode("CORSConfiguration");
    if (input.CORSRules !== undefined && input.CORSRules !== null) {
        const nodes = serializeAws_restXmlCORSRules(input.CORSRules, context);
        nodes.map((node) => {
            node = node.withName("CORSRule");
            bodyNode.addChildNode(node);
        });
    }
    return bodyNode;
};
const serializeAws_restXmlCORSRule = (input, context) => {
    const bodyNode = new xml_builder_1.XmlNode("CORSRule");
    if (input.AllowedHeaders !== undefined && input.AllowedHeaders !== null) {
        const nodes = serializeAws_restXmlAllowedHeaders(input.AllowedHeaders, context);
        nodes.map((node) => {
            node = node.withName("AllowedHeader");
            bodyNode.addChildNode(node);
        });
    }
    if (input.AllowedMethods !== undefined && input.AllowedMethods !== null) {
        const nodes = serializeAws_restXmlAllowedMethods(input.AllowedMethods, context);
        nodes.map((node) => {
            node = node.withName("AllowedMethod");
            bodyNode.addChildNode(node);
        });
    }
    if (input.AllowedOrigins !== undefined && input.AllowedOrigins !== null) {
        const nodes = serializeAws_restXmlAllowedOrigins(input.AllowedOrigins, context);
        nodes.map((node) => {
            node = node.withName("AllowedOrigin");
            bodyNode.addChildNode(node);
        });
    }
    if (input.ExposeHeaders !== undefined && input.ExposeHeaders !== null) {
        const nodes = serializeAws_restXmlExposeHeaders(input.ExposeHeaders, context);
        nodes.map((node) => {
            node = node.withName("ExposeHeader");
            bodyNode.addChildNode(node);
        });
    }
    if (input.MaxAgeSeconds !== undefined && input.MaxAgeSeconds !== null) {
        const node = new xml_builder_1.XmlNode("MaxAgeSeconds")
            .addChildNode(new xml_builder_1.XmlText(String(input.MaxAgeSeconds)))
            .withName("MaxAgeSeconds");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
const serializeAws_restXmlCORSRules = (input, context) => {
    return input
        .filter((e) => e != null)
        .map((entry) => {
        if (entry === null) {
            return null;
        }
        const node = serializeAws_restXmlCORSRule(entry, context);
        return node.withName("member");
    });
};
const serializeAws_restXmlCreateBucketConfiguration = (input, context) => {
    const bodyNode = new xml_builder_1.XmlNode("CreateBucketConfiguration");
    if (input.LocationConstraint !== undefined && input.LocationConstraint !== null) {
        const node = new xml_builder_1.XmlNode("BucketLocationConstraint")
            .addChildNode(new xml_builder_1.XmlText(input.LocationConstraint))
            .withName("LocationConstraint");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
const serializeAws_restXmlCSVInput = (input, context) => {
    const bodyNode = new xml_builder_1.XmlNode("CSVInput");
    if (input.FileHeaderInfo !== undefined && input.FileHeaderInfo !== null) {
        const node = new xml_builder_1.XmlNode("FileHeaderInfo")
            .addChildNode(new xml_builder_1.XmlText(input.FileHeaderInfo))
            .withName("FileHeaderInfo");
        bodyNode.addChildNode(node);
    }
    if (input.Comments !== undefined && input.Comments !== null) {
        const node = new xml_builder_1.XmlNode("Comments").addChildNode(new xml_builder_1.XmlText(input.Comments)).withName("Comments");
        bodyNode.addChildNode(node);
    }
    if (input.QuoteEscapeCharacter !== undefined && input.QuoteEscapeCharacter !== null) {
        const node = new xml_builder_1.XmlNode("QuoteEscapeCharacter")
            .addChildNode(new xml_builder_1.XmlText(input.QuoteEscapeCharacter))
            .withName("QuoteEscapeCharacter");
        bodyNode.addChildNode(node);
    }
    if (input.RecordDelimiter !== undefined && input.RecordDelimiter !== null) {
        const node = new xml_builder_1.XmlNode("RecordDelimiter")
            .addChildNode(new xml_builder_1.XmlText(input.RecordDelimiter))
            .withName("RecordDelimiter");
        bodyNode.addChildNode(node);
    }
    if (input.FieldDelimiter !== undefined && input.FieldDelimiter !== null) {
        const node = new xml_builder_1.XmlNode("FieldDelimiter")
            .addChildNode(new xml_builder_1.XmlText(input.FieldDelimiter))
            .withName("FieldDelimiter");
        bodyNode.addChildNode(node);
    }
    if (input.QuoteCharacter !== undefined && input.QuoteCharacter !== null) {
        const node = new xml_builder_1.XmlNode("QuoteCharacter")
            .addChildNode(new xml_builder_1.XmlText(input.QuoteCharacter))
            .withName("QuoteCharacter");
        bodyNode.addChildNode(node);
    }
    if (input.AllowQuotedRecordDelimiter !== undefined && input.AllowQuotedRecordDelimiter !== null) {
        const node = new xml_builder_1.XmlNode("AllowQuotedRecordDelimiter")
            .addChildNode(new xml_builder_1.XmlText(String(input.AllowQuotedRecordDelimiter)))
            .withName("AllowQuotedRecordDelimiter");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
const serializeAws_restXmlCSVOutput = (input, context) => {
    const bodyNode = new xml_builder_1.XmlNode("CSVOutput");
    if (input.QuoteFields !== undefined && input.QuoteFields !== null) {
        const node = new xml_builder_1.XmlNode("QuoteFields").addChildNode(new xml_builder_1.XmlText(input.QuoteFields)).withName("QuoteFields");
        bodyNode.addChildNode(node);
    }
    if (input.QuoteEscapeCharacter !== undefined && input.QuoteEscapeCharacter !== null) {
        const node = new xml_builder_1.XmlNode("QuoteEscapeCharacter")
            .addChildNode(new xml_builder_1.XmlText(input.QuoteEscapeCharacter))
            .withName("QuoteEscapeCharacter");
        bodyNode.addChildNode(node);
    }
    if (input.RecordDelimiter !== undefined && input.RecordDelimiter !== null) {
        const node = new xml_builder_1.XmlNode("RecordDelimiter")
            .addChildNode(new xml_builder_1.XmlText(input.RecordDelimiter))
            .withName("RecordDelimiter");
        bodyNode.addChildNode(node);
    }
    if (input.FieldDelimiter !== undefined && input.FieldDelimiter !== null) {
        const node = new xml_builder_1.XmlNode("FieldDelimiter")
            .addChildNode(new xml_builder_1.XmlText(input.FieldDelimiter))
            .withName("FieldDelimiter");
        bodyNode.addChildNode(node);
    }
    if (input.QuoteCharacter !== undefined && input.QuoteCharacter !== null) {
        const node = new xml_builder_1.XmlNode("QuoteCharacter")
            .addChildNode(new xml_builder_1.XmlText(input.QuoteCharacter))
            .withName("QuoteCharacter");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
const serializeAws_restXmlDefaultRetention = (input, context) => {
    const bodyNode = new xml_builder_1.XmlNode("DefaultRetention");
    if (input.Mode !== undefined && input.Mode !== null) {
        const node = new xml_builder_1.XmlNode("ObjectLockRetentionMode").addChildNode(new xml_builder_1.XmlText(input.Mode)).withName("Mode");
        bodyNode.addChildNode(node);
    }
    if (input.Days !== undefined && input.Days !== null) {
        const node = new xml_builder_1.XmlNode("Days").addChildNode(new xml_builder_1.XmlText(String(input.Days))).withName("Days");
        bodyNode.addChildNode(node);
    }
    if (input.Years !== undefined && input.Years !== null) {
        const node = new xml_builder_1.XmlNode("Years").addChildNode(new xml_builder_1.XmlText(String(input.Years))).withName("Years");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
const serializeAws_restXmlDelete = (input, context) => {
    const bodyNode = new xml_builder_1.XmlNode("Delete");
    if (input.Objects !== undefined && input.Objects !== null) {
        const nodes = serializeAws_restXmlObjectIdentifierList(input.Objects, context);
        nodes.map((node) => {
            node = node.withName("Object");
            bodyNode.addChildNode(node);
        });
    }
    if (input.Quiet !== undefined && input.Quiet !== null) {
        const node = new xml_builder_1.XmlNode("Quiet").addChildNode(new xml_builder_1.XmlText(String(input.Quiet))).withName("Quiet");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
const serializeAws_restXmlDeleteMarkerReplication = (input, context) => {
    const bodyNode = new xml_builder_1.XmlNode("DeleteMarkerReplication");
    if (input.Status !== undefined && input.Status !== null) {
        const node = new xml_builder_1.XmlNode("DeleteMarkerReplicationStatus")
            .addChildNode(new xml_builder_1.XmlText(input.Status))
            .withName("Status");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
const serializeAws_restXmlDestination = (input, context) => {
    const bodyNode = new xml_builder_1.XmlNode("Destination");
    if (input.Bucket !== undefined && input.Bucket !== null) {
        const node = new xml_builder_1.XmlNode("BucketName").addChildNode(new xml_builder_1.XmlText(input.Bucket)).withName("Bucket");
        bodyNode.addChildNode(node);
    }
    if (input.Account !== undefined && input.Account !== null) {
        const node = new xml_builder_1.XmlNode("AccountId").addChildNode(new xml_builder_1.XmlText(input.Account)).withName("Account");
        bodyNode.addChildNode(node);
    }
    if (input.StorageClass !== undefined && input.StorageClass !== null) {
        const node = new xml_builder_1.XmlNode("StorageClass").addChildNode(new xml_builder_1.XmlText(input.StorageClass)).withName("StorageClass");
        bodyNode.addChildNode(node);
    }
    if (input.AccessControlTranslation !== undefined && input.AccessControlTranslation !== null) {
        const node = serializeAws_restXmlAccessControlTranslation(input.AccessControlTranslation, context).withName("AccessControlTranslation");
        bodyNode.addChildNode(node);
    }
    if (input.EncryptionConfiguration !== undefined && input.EncryptionConfiguration !== null) {
        const node = serializeAws_restXmlEncryptionConfiguration(input.EncryptionConfiguration, context).withName("EncryptionConfiguration");
        bodyNode.addChildNode(node);
    }
    if (input.ReplicationTime !== undefined && input.ReplicationTime !== null) {
        const node = serializeAws_restXmlReplicationTime(input.ReplicationTime, context).withName("ReplicationTime");
        bodyNode.addChildNode(node);
    }
    if (input.Metrics !== undefined && input.Metrics !== null) {
        const node = serializeAws_restXmlMetrics(input.Metrics, context).withName("Metrics");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
const serializeAws_restXmlEncryption = (input, context) => {
    const bodyNode = new xml_builder_1.XmlNode("Encryption");
    if (input.EncryptionType !== undefined && input.EncryptionType !== null) {
        const node = new xml_builder_1.XmlNode("ServerSideEncryption")
            .addChildNode(new xml_builder_1.XmlText(input.EncryptionType))
            .withName("EncryptionType");
        bodyNode.addChildNode(node);
    }
    if (input.KMSKeyId !== undefined && input.KMSKeyId !== null) {
        const node = new xml_builder_1.XmlNode("SSEKMSKeyId").addChildNode(new xml_builder_1.XmlText(input.KMSKeyId)).withName("KMSKeyId");
        bodyNode.addChildNode(node);
    }
    if (input.KMSContext !== undefined && input.KMSContext !== null) {
        const node = new xml_builder_1.XmlNode("KMSContext").addChildNode(new xml_builder_1.XmlText(input.KMSContext)).withName("KMSContext");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
const serializeAws_restXmlEncryptionConfiguration = (input, context) => {
    const bodyNode = new xml_builder_1.XmlNode("EncryptionConfiguration");
    if (input.ReplicaKmsKeyID !== undefined && input.ReplicaKmsKeyID !== null) {
        const node = new xml_builder_1.XmlNode("ReplicaKmsKeyID")
            .addChildNode(new xml_builder_1.XmlText(input.ReplicaKmsKeyID))
            .withName("ReplicaKmsKeyID");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
const serializeAws_restXmlErrorDocument = (input, context) => {
    const bodyNode = new xml_builder_1.XmlNode("ErrorDocument");
    if (input.Key !== undefined && input.Key !== null) {
        const node = new xml_builder_1.XmlNode("ObjectKey").addChildNode(new xml_builder_1.XmlText(input.Key)).withName("Key");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
const serializeAws_restXmlEventList = (input, context) => {
    return input
        .filter((e) => e != null)
        .map((entry) => {
        if (entry === null) {
            return null;
        }
        const node = new xml_builder_1.XmlNode("Event").addChildNode(new xml_builder_1.XmlText(entry));
        return node.withName("member");
    });
};
const serializeAws_restXmlExistingObjectReplication = (input, context) => {
    const bodyNode = new xml_builder_1.XmlNode("ExistingObjectReplication");
    if (input.Status !== undefined && input.Status !== null) {
        const node = new xml_builder_1.XmlNode("ExistingObjectReplicationStatus")
            .addChildNode(new xml_builder_1.XmlText(input.Status))
            .withName("Status");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
const serializeAws_restXmlExposeHeaders = (input, context) => {
    return input
        .filter((e) => e != null)
        .map((entry) => {
        if (entry === null) {
            return null;
        }
        const node = new xml_builder_1.XmlNode("ExposeHeader").addChildNode(new xml_builder_1.XmlText(entry));
        return node.withName("member");
    });
};
const serializeAws_restXmlFilterRule = (input, context) => {
    const bodyNode = new xml_builder_1.XmlNode("FilterRule");
    if (input.Name !== undefined && input.Name !== null) {
        const node = new xml_builder_1.XmlNode("FilterRuleName").addChildNode(new xml_builder_1.XmlText(input.Name)).withName("Name");
        bodyNode.addChildNode(node);
    }
    if (input.Value !== undefined && input.Value !== null) {
        const node = new xml_builder_1.XmlNode("FilterRuleValue").addChildNode(new xml_builder_1.XmlText(input.Value)).withName("Value");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
const serializeAws_restXmlFilterRuleList = (input, context) => {
    return input
        .filter((e) => e != null)
        .map((entry) => {
        if (entry === null) {
            return null;
        }
        const node = serializeAws_restXmlFilterRule(entry, context);
        return node.withName("member");
    });
};
const serializeAws_restXmlGlacierJobParameters = (input, context) => {
    const bodyNode = new xml_builder_1.XmlNode("GlacierJobParameters");
    if (input.Tier !== undefined && input.Tier !== null) {
        const node = new xml_builder_1.XmlNode("Tier").addChildNode(new xml_builder_1.XmlText(input.Tier)).withName("Tier");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
const serializeAws_restXmlGrant = (input, context) => {
    const bodyNode = new xml_builder_1.XmlNode("Grant");
    if (input.Grantee !== undefined && input.Grantee !== null) {
        const node = serializeAws_restXmlGrantee(input.Grantee, context).withName("Grantee");
        bodyNode.addChildNode(node);
    }
    if (input.Permission !== undefined && input.Permission !== null) {
        const node = new xml_builder_1.XmlNode("Permission").addChildNode(new xml_builder_1.XmlText(input.Permission)).withName("Permission");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
const serializeAws_restXmlGrantee = (input, context) => {
    const bodyNode = new xml_builder_1.XmlNode("Grantee");
    if (input.DisplayName !== undefined && input.DisplayName !== null) {
        const node = new xml_builder_1.XmlNode("DisplayName").addChildNode(new xml_builder_1.XmlText(input.DisplayName)).withName("DisplayName");
        bodyNode.addChildNode(node);
    }
    if (input.EmailAddress !== undefined && input.EmailAddress !== null) {
        const node = new xml_builder_1.XmlNode("EmailAddress").addChildNode(new xml_builder_1.XmlText(input.EmailAddress)).withName("EmailAddress");
        bodyNode.addChildNode(node);
    }
    if (input.ID !== undefined && input.ID !== null) {
        const node = new xml_builder_1.XmlNode("ID").addChildNode(new xml_builder_1.XmlText(input.ID)).withName("ID");
        bodyNode.addChildNode(node);
    }
    if (input.URI !== undefined && input.URI !== null) {
        const node = new xml_builder_1.XmlNode("URI").addChildNode(new xml_builder_1.XmlText(input.URI)).withName("URI");
        bodyNode.addChildNode(node);
    }
    if (input.Type !== undefined && input.Type !== null) {
        bodyNode.addAttribute("xsi:type", input.Type);
    }
    return bodyNode;
};
const serializeAws_restXmlGrants = (input, context) => {
    return input
        .filter((e) => e != null)
        .map((entry) => {
        if (entry === null) {
            return null;
        }
        const node = serializeAws_restXmlGrant(entry, context);
        return node.withName("Grant");
    });
};
const serializeAws_restXmlIndexDocument = (input, context) => {
    const bodyNode = new xml_builder_1.XmlNode("IndexDocument");
    if (input.Suffix !== undefined && input.Suffix !== null) {
        const node = new xml_builder_1.XmlNode("Suffix").addChildNode(new xml_builder_1.XmlText(input.Suffix)).withName("Suffix");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
const serializeAws_restXmlInputSerialization = (input, context) => {
    const bodyNode = new xml_builder_1.XmlNode("InputSerialization");
    if (input.CSV !== undefined && input.CSV !== null) {
        const node = serializeAws_restXmlCSVInput(input.CSV, context).withName("CSV");
        bodyNode.addChildNode(node);
    }
    if (input.CompressionType !== undefined && input.CompressionType !== null) {
        const node = new xml_builder_1.XmlNode("CompressionType")
            .addChildNode(new xml_builder_1.XmlText(input.CompressionType))
            .withName("CompressionType");
        bodyNode.addChildNode(node);
    }
    if (input.JSON !== undefined && input.JSON !== null) {
        const node = serializeAws_restXmlJSONInput(input.JSON, context).withName("JSON");
        bodyNode.addChildNode(node);
    }
    if (input.Parquet !== undefined && input.Parquet !== null) {
        const node = serializeAws_restXmlParquetInput(input.Parquet, context).withName("Parquet");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
const serializeAws_restXmlIntelligentTieringAndOperator = (input, context) => {
    const bodyNode = new xml_builder_1.XmlNode("IntelligentTieringAndOperator");
    if (input.Prefix !== undefined && input.Prefix !== null) {
        const node = new xml_builder_1.XmlNode("Prefix").addChildNode(new xml_builder_1.XmlText(input.Prefix)).withName("Prefix");
        bodyNode.addChildNode(node);
    }
    if (input.Tags !== undefined && input.Tags !== null) {
        const nodes = serializeAws_restXmlTagSet(input.Tags, context);
        nodes.map((node) => {
            node = node.withName("Tag");
            bodyNode.addChildNode(node);
        });
    }
    return bodyNode;
};
const serializeAws_restXmlIntelligentTieringConfiguration = (input, context) => {
    const bodyNode = new xml_builder_1.XmlNode("IntelligentTieringConfiguration");
    if (input.Id !== undefined && input.Id !== null) {
        const node = new xml_builder_1.XmlNode("IntelligentTieringId").addChildNode(new xml_builder_1.XmlText(input.Id)).withName("Id");
        bodyNode.addChildNode(node);
    }
    if (input.Filter !== undefined && input.Filter !== null) {
        const node = serializeAws_restXmlIntelligentTieringFilter(input.Filter, context).withName("Filter");
        bodyNode.addChildNode(node);
    }
    if (input.Status !== undefined && input.Status !== null) {
        const node = new xml_builder_1.XmlNode("IntelligentTieringStatus").addChildNode(new xml_builder_1.XmlText(input.Status)).withName("Status");
        bodyNode.addChildNode(node);
    }
    if (input.Tierings !== undefined && input.Tierings !== null) {
        const nodes = serializeAws_restXmlTieringList(input.Tierings, context);
        nodes.map((node) => {
            node = node.withName("Tiering");
            bodyNode.addChildNode(node);
        });
    }
    return bodyNode;
};
const serializeAws_restXmlIntelligentTieringFilter = (input, context) => {
    const bodyNode = new xml_builder_1.XmlNode("IntelligentTieringFilter");
    if (input.Prefix !== undefined && input.Prefix !== null) {
        const node = new xml_builder_1.XmlNode("Prefix").addChildNode(new xml_builder_1.XmlText(input.Prefix)).withName("Prefix");
        bodyNode.addChildNode(node);
    }
    if (input.Tag !== undefined && input.Tag !== null) {
        const node = serializeAws_restXmlTag(input.Tag, context).withName("Tag");
        bodyNode.addChildNode(node);
    }
    if (input.And !== undefined && input.And !== null) {
        const node = serializeAws_restXmlIntelligentTieringAndOperator(input.And, context).withName("And");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
const serializeAws_restXmlInventoryConfiguration = (input, context) => {
    const bodyNode = new xml_builder_1.XmlNode("InventoryConfiguration");
    if (input.Destination !== undefined && input.Destination !== null) {
        const node = serializeAws_restXmlInventoryDestination(input.Destination, context).withName("Destination");
        bodyNode.addChildNode(node);
    }
    if (input.IsEnabled !== undefined && input.IsEnabled !== null) {
        const node = new xml_builder_1.XmlNode("IsEnabled").addChildNode(new xml_builder_1.XmlText(String(input.IsEnabled))).withName("IsEnabled");
        bodyNode.addChildNode(node);
    }
    if (input.Filter !== undefined && input.Filter !== null) {
        const node = serializeAws_restXmlInventoryFilter(input.Filter, context).withName("Filter");
        bodyNode.addChildNode(node);
    }
    if (input.Id !== undefined && input.Id !== null) {
        const node = new xml_builder_1.XmlNode("InventoryId").addChildNode(new xml_builder_1.XmlText(input.Id)).withName("Id");
        bodyNode.addChildNode(node);
    }
    if (input.IncludedObjectVersions !== undefined && input.IncludedObjectVersions !== null) {
        const node = new xml_builder_1.XmlNode("InventoryIncludedObjectVersions")
            .addChildNode(new xml_builder_1.XmlText(input.IncludedObjectVersions))
            .withName("IncludedObjectVersions");
        bodyNode.addChildNode(node);
    }
    if (input.OptionalFields !== undefined && input.OptionalFields !== null) {
        const nodes = serializeAws_restXmlInventoryOptionalFields(input.OptionalFields, context);
        const containerNode = new xml_builder_1.XmlNode("OptionalFields");
        nodes.map((node) => {
            containerNode.addChildNode(node);
        });
        bodyNode.addChildNode(containerNode);
    }
    if (input.Schedule !== undefined && input.Schedule !== null) {
        const node = serializeAws_restXmlInventorySchedule(input.Schedule, context).withName("Schedule");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
const serializeAws_restXmlInventoryDestination = (input, context) => {
    const bodyNode = new xml_builder_1.XmlNode("InventoryDestination");
    if (input.S3BucketDestination !== undefined && input.S3BucketDestination !== null) {
        const node = serializeAws_restXmlInventoryS3BucketDestination(input.S3BucketDestination, context).withName("S3BucketDestination");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
const serializeAws_restXmlInventoryEncryption = (input, context) => {
    const bodyNode = new xml_builder_1.XmlNode("InventoryEncryption");
    if (input.SSES3 !== undefined && input.SSES3 !== null) {
        const node = serializeAws_restXmlSSES3(input.SSES3, context).withName("SSE-S3");
        bodyNode.addChildNode(node);
    }
    if (input.SSEKMS !== undefined && input.SSEKMS !== null) {
        const node = serializeAws_restXmlSSEKMS(input.SSEKMS, context).withName("SSE-KMS");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
const serializeAws_restXmlInventoryFilter = (input, context) => {
    const bodyNode = new xml_builder_1.XmlNode("InventoryFilter");
    if (input.Prefix !== undefined && input.Prefix !== null) {
        const node = new xml_builder_1.XmlNode("Prefix").addChildNode(new xml_builder_1.XmlText(input.Prefix)).withName("Prefix");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
const serializeAws_restXmlInventoryOptionalFields = (input, context) => {
    return input
        .filter((e) => e != null)
        .map((entry) => {
        if (entry === null) {
            return null;
        }
        const node = new xml_builder_1.XmlNode("InventoryOptionalField").addChildNode(new xml_builder_1.XmlText(entry));
        return node.withName("Field");
    });
};
const serializeAws_restXmlInventoryS3BucketDestination = (input, context) => {
    const bodyNode = new xml_builder_1.XmlNode("InventoryS3BucketDestination");
    if (input.AccountId !== undefined && input.AccountId !== null) {
        const node = new xml_builder_1.XmlNode("AccountId").addChildNode(new xml_builder_1.XmlText(input.AccountId)).withName("AccountId");
        bodyNode.addChildNode(node);
    }
    if (input.Bucket !== undefined && input.Bucket !== null) {
        const node = new xml_builder_1.XmlNode("BucketName").addChildNode(new xml_builder_1.XmlText(input.Bucket)).withName("Bucket");
        bodyNode.addChildNode(node);
    }
    if (input.Format !== undefined && input.Format !== null) {
        const node = new xml_builder_1.XmlNode("InventoryFormat").addChildNode(new xml_builder_1.XmlText(input.Format)).withName("Format");
        bodyNode.addChildNode(node);
    }
    if (input.Prefix !== undefined && input.Prefix !== null) {
        const node = new xml_builder_1.XmlNode("Prefix").addChildNode(new xml_builder_1.XmlText(input.Prefix)).withName("Prefix");
        bodyNode.addChildNode(node);
    }
    if (input.Encryption !== undefined && input.Encryption !== null) {
        const node = serializeAws_restXmlInventoryEncryption(input.Encryption, context).withName("Encryption");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
const serializeAws_restXmlInventorySchedule = (input, context) => {
    const bodyNode = new xml_builder_1.XmlNode("InventorySchedule");
    if (input.Frequency !== undefined && input.Frequency !== null) {
        const node = new xml_builder_1.XmlNode("InventoryFrequency").addChildNode(new xml_builder_1.XmlText(input.Frequency)).withName("Frequency");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
const serializeAws_restXmlJSONInput = (input, context) => {
    const bodyNode = new xml_builder_1.XmlNode("JSONInput");
    if (input.Type !== undefined && input.Type !== null) {
        const node = new xml_builder_1.XmlNode("JSONType").addChildNode(new xml_builder_1.XmlText(input.Type)).withName("Type");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
const serializeAws_restXmlJSONOutput = (input, context) => {
    const bodyNode = new xml_builder_1.XmlNode("JSONOutput");
    if (input.RecordDelimiter !== undefined && input.RecordDelimiter !== null) {
        const node = new xml_builder_1.XmlNode("RecordDelimiter")
            .addChildNode(new xml_builder_1.XmlText(input.RecordDelimiter))
            .withName("RecordDelimiter");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
const serializeAws_restXmlLambdaFunctionConfiguration = (input, context) => {
    const bodyNode = new xml_builder_1.XmlNode("LambdaFunctionConfiguration");
    if (input.Id !== undefined && input.Id !== null) {
        const node = new xml_builder_1.XmlNode("NotificationId").addChildNode(new xml_builder_1.XmlText(input.Id)).withName("Id");
        bodyNode.addChildNode(node);
    }
    if (input.LambdaFunctionArn !== undefined && input.LambdaFunctionArn !== null) {
        const node = new xml_builder_1.XmlNode("LambdaFunctionArn")
            .addChildNode(new xml_builder_1.XmlText(input.LambdaFunctionArn))
            .withName("CloudFunction");
        bodyNode.addChildNode(node);
    }
    if (input.Events !== undefined && input.Events !== null) {
        const nodes = serializeAws_restXmlEventList(input.Events, context);
        nodes.map((node) => {
            node = node.withName("Event");
            bodyNode.addChildNode(node);
        });
    }
    if (input.Filter !== undefined && input.Filter !== null) {
        const node = serializeAws_restXmlNotificationConfigurationFilter(input.Filter, context).withName("Filter");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
const serializeAws_restXmlLambdaFunctionConfigurationList = (input, context) => {
    return input
        .filter((e) => e != null)
        .map((entry) => {
        if (entry === null) {
            return null;
        }
        const node = serializeAws_restXmlLambdaFunctionConfiguration(entry, context);
        return node.withName("member");
    });
};
const serializeAws_restXmlLifecycleExpiration = (input, context) => {
    const bodyNode = new xml_builder_1.XmlNode("LifecycleExpiration");
    if (input.Date !== undefined && input.Date !== null) {
        const node = new xml_builder_1.XmlNode("Date")
            .addChildNode(new xml_builder_1.XmlText(input.Date.toISOString().split(".")[0] + "Z"))
            .withName("Date");
        bodyNode.addChildNode(node);
    }
    if (input.Days !== undefined && input.Days !== null) {
        const node = new xml_builder_1.XmlNode("Days").addChildNode(new xml_builder_1.XmlText(String(input.Days))).withName("Days");
        bodyNode.addChildNode(node);
    }
    if (input.ExpiredObjectDeleteMarker !== undefined && input.ExpiredObjectDeleteMarker !== null) {
        const node = new xml_builder_1.XmlNode("ExpiredObjectDeleteMarker")
            .addChildNode(new xml_builder_1.XmlText(String(input.ExpiredObjectDeleteMarker)))
            .withName("ExpiredObjectDeleteMarker");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
const serializeAws_restXmlLifecycleRule = (input, context) => {
    const bodyNode = new xml_builder_1.XmlNode("LifecycleRule");
    if (input.Expiration !== undefined && input.Expiration !== null) {
        const node = serializeAws_restXmlLifecycleExpiration(input.Expiration, context).withName("Expiration");
        bodyNode.addChildNode(node);
    }
    if (input.ID !== undefined && input.ID !== null) {
        const node = new xml_builder_1.XmlNode("ID").addChildNode(new xml_builder_1.XmlText(input.ID)).withName("ID");
        bodyNode.addChildNode(node);
    }
    if (input.Prefix !== undefined && input.Prefix !== null) {
        const node = new xml_builder_1.XmlNode("Prefix").addChildNode(new xml_builder_1.XmlText(input.Prefix)).withName("Prefix");
        bodyNode.addChildNode(node);
    }
    if (input.Filter !== undefined && input.Filter !== null) {
        const node = serializeAws_restXmlLifecycleRuleFilter(input.Filter, context).withName("Filter");
        bodyNode.addChildNode(node);
    }
    if (input.Status !== undefined && input.Status !== null) {
        const node = new xml_builder_1.XmlNode("ExpirationStatus").addChildNode(new xml_builder_1.XmlText(input.Status)).withName("Status");
        bodyNode.addChildNode(node);
    }
    if (input.Transitions !== undefined && input.Transitions !== null) {
        const nodes = serializeAws_restXmlTransitionList(input.Transitions, context);
        nodes.map((node) => {
            node = node.withName("Transition");
            bodyNode.addChildNode(node);
        });
    }
    if (input.NoncurrentVersionTransitions !== undefined && input.NoncurrentVersionTransitions !== null) {
        const nodes = serializeAws_restXmlNoncurrentVersionTransitionList(input.NoncurrentVersionTransitions, context);
        nodes.map((node) => {
            node = node.withName("NoncurrentVersionTransition");
            bodyNode.addChildNode(node);
        });
    }
    if (input.NoncurrentVersionExpiration !== undefined && input.NoncurrentVersionExpiration !== null) {
        const node = serializeAws_restXmlNoncurrentVersionExpiration(input.NoncurrentVersionExpiration, context).withName("NoncurrentVersionExpiration");
        bodyNode.addChildNode(node);
    }
    if (input.AbortIncompleteMultipartUpload !== undefined && input.AbortIncompleteMultipartUpload !== null) {
        const node = serializeAws_restXmlAbortIncompleteMultipartUpload(input.AbortIncompleteMultipartUpload, context).withName("AbortIncompleteMultipartUpload");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
const serializeAws_restXmlLifecycleRuleAndOperator = (input, context) => {
    const bodyNode = new xml_builder_1.XmlNode("LifecycleRuleAndOperator");
    if (input.Prefix !== undefined && input.Prefix !== null) {
        const node = new xml_builder_1.XmlNode("Prefix").addChildNode(new xml_builder_1.XmlText(input.Prefix)).withName("Prefix");
        bodyNode.addChildNode(node);
    }
    if (input.Tags !== undefined && input.Tags !== null) {
        const nodes = serializeAws_restXmlTagSet(input.Tags, context);
        nodes.map((node) => {
            node = node.withName("Tag");
            bodyNode.addChildNode(node);
        });
    }
    return bodyNode;
};
const serializeAws_restXmlLifecycleRuleFilter = (input, context) => {
    const bodyNode = new xml_builder_1.XmlNode("LifecycleRuleFilter");
    models_0_1.LifecycleRuleFilter.visit(input, {
        Prefix: (value) => {
            const node = new xml_builder_1.XmlNode("Prefix").addChildNode(new xml_builder_1.XmlText(value)).withName("Prefix");
            bodyNode.addChildNode(node);
        },
        Tag: (value) => {
            const node = serializeAws_restXmlTag(value, context).withName("Tag");
            bodyNode.addChildNode(node);
        },
        And: (value) => {
            const node = serializeAws_restXmlLifecycleRuleAndOperator(value, context).withName("And");
            bodyNode.addChildNode(node);
        },
        _: (name, value) => {
            if (!(value instanceof xml_builder_1.XmlNode || value instanceof xml_builder_1.XmlText)) {
                throw new Error("Unable to serialize unknown union members in XML.");
            }
            bodyNode.addChildNode(new xml_builder_1.XmlNode(name).addChildNode(value));
        },
    });
    return bodyNode;
};
const serializeAws_restXmlLifecycleRules = (input, context) => {
    return input
        .filter((e) => e != null)
        .map((entry) => {
        if (entry === null) {
            return null;
        }
        const node = serializeAws_restXmlLifecycleRule(entry, context);
        return node.withName("member");
    });
};
const serializeAws_restXmlLoggingEnabled = (input, context) => {
    const bodyNode = new xml_builder_1.XmlNode("LoggingEnabled");
    if (input.TargetBucket !== undefined && input.TargetBucket !== null) {
        const node = new xml_builder_1.XmlNode("TargetBucket").addChildNode(new xml_builder_1.XmlText(input.TargetBucket)).withName("TargetBucket");
        bodyNode.addChildNode(node);
    }
    if (input.TargetGrants !== undefined && input.TargetGrants !== null) {
        const nodes = serializeAws_restXmlTargetGrants(input.TargetGrants, context);
        const containerNode = new xml_builder_1.XmlNode("TargetGrants");
        nodes.map((node) => {
            containerNode.addChildNode(node);
        });
        bodyNode.addChildNode(containerNode);
    }
    if (input.TargetPrefix !== undefined && input.TargetPrefix !== null) {
        const node = new xml_builder_1.XmlNode("TargetPrefix").addChildNode(new xml_builder_1.XmlText(input.TargetPrefix)).withName("TargetPrefix");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
const serializeAws_restXmlMetadataEntry = (input, context) => {
    const bodyNode = new xml_builder_1.XmlNode("MetadataEntry");
    if (input.Name !== undefined && input.Name !== null) {
        const node = new xml_builder_1.XmlNode("MetadataKey").addChildNode(new xml_builder_1.XmlText(input.Name)).withName("Name");
        bodyNode.addChildNode(node);
    }
    if (input.Value !== undefined && input.Value !== null) {
        const node = new xml_builder_1.XmlNode("MetadataValue").addChildNode(new xml_builder_1.XmlText(input.Value)).withName("Value");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
const serializeAws_restXmlMetrics = (input, context) => {
    const bodyNode = new xml_builder_1.XmlNode("Metrics");
    if (input.Status !== undefined && input.Status !== null) {
        const node = new xml_builder_1.XmlNode("MetricsStatus").addChildNode(new xml_builder_1.XmlText(input.Status)).withName("Status");
        bodyNode.addChildNode(node);
    }
    if (input.EventThreshold !== undefined && input.EventThreshold !== null) {
        const node = serializeAws_restXmlReplicationTimeValue(input.EventThreshold, context).withName("EventThreshold");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
const serializeAws_restXmlMetricsAndOperator = (input, context) => {
    const bodyNode = new xml_builder_1.XmlNode("MetricsAndOperator");
    if (input.Prefix !== undefined && input.Prefix !== null) {
        const node = new xml_builder_1.XmlNode("Prefix").addChildNode(new xml_builder_1.XmlText(input.Prefix)).withName("Prefix");
        bodyNode.addChildNode(node);
    }
    if (input.Tags !== undefined && input.Tags !== null) {
        const nodes = serializeAws_restXmlTagSet(input.Tags, context);
        nodes.map((node) => {
            node = node.withName("Tag");
            bodyNode.addChildNode(node);
        });
    }
    return bodyNode;
};
const serializeAws_restXmlMetricsConfiguration = (input, context) => {
    const bodyNode = new xml_builder_1.XmlNode("MetricsConfiguration");
    if (input.Id !== undefined && input.Id !== null) {
        const node = new xml_builder_1.XmlNode("MetricsId").addChildNode(new xml_builder_1.XmlText(input.Id)).withName("Id");
        bodyNode.addChildNode(node);
    }
    if (input.Filter !== undefined && input.Filter !== null) {
        const node = serializeAws_restXmlMetricsFilter(input.Filter, context).withName("Filter");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
const serializeAws_restXmlMetricsFilter = (input, context) => {
    const bodyNode = new xml_builder_1.XmlNode("MetricsFilter");
    models_0_1.MetricsFilter.visit(input, {
        Prefix: (value) => {
            const node = new xml_builder_1.XmlNode("Prefix").addChildNode(new xml_builder_1.XmlText(value)).withName("Prefix");
            bodyNode.addChildNode(node);
        },
        Tag: (value) => {
            const node = serializeAws_restXmlTag(value, context).withName("Tag");
            bodyNode.addChildNode(node);
        },
        And: (value) => {
            const node = serializeAws_restXmlMetricsAndOperator(value, context).withName("And");
            bodyNode.addChildNode(node);
        },
        _: (name, value) => {
            if (!(value instanceof xml_builder_1.XmlNode || value instanceof xml_builder_1.XmlText)) {
                throw new Error("Unable to serialize unknown union members in XML.");
            }
            bodyNode.addChildNode(new xml_builder_1.XmlNode(name).addChildNode(value));
        },
    });
    return bodyNode;
};
const serializeAws_restXmlNoncurrentVersionExpiration = (input, context) => {
    const bodyNode = new xml_builder_1.XmlNode("NoncurrentVersionExpiration");
    if (input.NoncurrentDays !== undefined && input.NoncurrentDays !== null) {
        const node = new xml_builder_1.XmlNode("Days")
            .addChildNode(new xml_builder_1.XmlText(String(input.NoncurrentDays)))
            .withName("NoncurrentDays");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
const serializeAws_restXmlNoncurrentVersionTransition = (input, context) => {
    const bodyNode = new xml_builder_1.XmlNode("NoncurrentVersionTransition");
    if (input.NoncurrentDays !== undefined && input.NoncurrentDays !== null) {
        const node = new xml_builder_1.XmlNode("Days")
            .addChildNode(new xml_builder_1.XmlText(String(input.NoncurrentDays)))
            .withName("NoncurrentDays");
        bodyNode.addChildNode(node);
    }
    if (input.StorageClass !== undefined && input.StorageClass !== null) {
        const node = new xml_builder_1.XmlNode("TransitionStorageClass")
            .addChildNode(new xml_builder_1.XmlText(input.StorageClass))
            .withName("StorageClass");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
const serializeAws_restXmlNoncurrentVersionTransitionList = (input, context) => {
    return input
        .filter((e) => e != null)
        .map((entry) => {
        if (entry === null) {
            return null;
        }
        const node = serializeAws_restXmlNoncurrentVersionTransition(entry, context);
        return node.withName("member");
    });
};
const serializeAws_restXmlNotificationConfiguration = (input, context) => {
    const bodyNode = new xml_builder_1.XmlNode("NotificationConfiguration");
    if (input.TopicConfigurations !== undefined && input.TopicConfigurations !== null) {
        const nodes = serializeAws_restXmlTopicConfigurationList(input.TopicConfigurations, context);
        nodes.map((node) => {
            node = node.withName("TopicConfiguration");
            bodyNode.addChildNode(node);
        });
    }
    if (input.QueueConfigurations !== undefined && input.QueueConfigurations !== null) {
        const nodes = serializeAws_restXmlQueueConfigurationList(input.QueueConfigurations, context);
        nodes.map((node) => {
            node = node.withName("QueueConfiguration");
            bodyNode.addChildNode(node);
        });
    }
    if (input.LambdaFunctionConfigurations !== undefined && input.LambdaFunctionConfigurations !== null) {
        const nodes = serializeAws_restXmlLambdaFunctionConfigurationList(input.LambdaFunctionConfigurations, context);
        nodes.map((node) => {
            node = node.withName("CloudFunctionConfiguration");
            bodyNode.addChildNode(node);
        });
    }
    return bodyNode;
};
const serializeAws_restXmlNotificationConfigurationFilter = (input, context) => {
    const bodyNode = new xml_builder_1.XmlNode("NotificationConfigurationFilter");
    if (input.Key !== undefined && input.Key !== null) {
        const node = serializeAws_restXmlS3KeyFilter(input.Key, context).withName("S3Key");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
const serializeAws_restXmlObjectIdentifier = (input, context) => {
    const bodyNode = new xml_builder_1.XmlNode("ObjectIdentifier");
    if (input.Key !== undefined && input.Key !== null) {
        const node = new xml_builder_1.XmlNode("ObjectKey").addChildNode(new xml_builder_1.XmlText(input.Key)).withName("Key");
        bodyNode.addChildNode(node);
    }
    if (input.VersionId !== undefined && input.VersionId !== null) {
        const node = new xml_builder_1.XmlNode("ObjectVersionId").addChildNode(new xml_builder_1.XmlText(input.VersionId)).withName("VersionId");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
const serializeAws_restXmlObjectIdentifierList = (input, context) => {
    return input
        .filter((e) => e != null)
        .map((entry) => {
        if (entry === null) {
            return null;
        }
        const node = serializeAws_restXmlObjectIdentifier(entry, context);
        return node.withName("member");
    });
};
const serializeAws_restXmlObjectLockConfiguration = (input, context) => {
    const bodyNode = new xml_builder_1.XmlNode("ObjectLockConfiguration");
    if (input.ObjectLockEnabled !== undefined && input.ObjectLockEnabled !== null) {
        const node = new xml_builder_1.XmlNode("ObjectLockEnabled")
            .addChildNode(new xml_builder_1.XmlText(input.ObjectLockEnabled))
            .withName("ObjectLockEnabled");
        bodyNode.addChildNode(node);
    }
    if (input.Rule !== undefined && input.Rule !== null) {
        const node = serializeAws_restXmlObjectLockRule(input.Rule, context).withName("Rule");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
const serializeAws_restXmlObjectLockLegalHold = (input, context) => {
    const bodyNode = new xml_builder_1.XmlNode("ObjectLockLegalHold");
    if (input.Status !== undefined && input.Status !== null) {
        const node = new xml_builder_1.XmlNode("ObjectLockLegalHoldStatus")
            .addChildNode(new xml_builder_1.XmlText(input.Status))
            .withName("Status");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
const serializeAws_restXmlObjectLockRetention = (input, context) => {
    const bodyNode = new xml_builder_1.XmlNode("ObjectLockRetention");
    if (input.Mode !== undefined && input.Mode !== null) {
        const node = new xml_builder_1.XmlNode("ObjectLockRetentionMode").addChildNode(new xml_builder_1.XmlText(input.Mode)).withName("Mode");
        bodyNode.addChildNode(node);
    }
    if (input.RetainUntilDate !== undefined && input.RetainUntilDate !== null) {
        const node = new xml_builder_1.XmlNode("Date")
            .addChildNode(new xml_builder_1.XmlText(input.RetainUntilDate.toISOString().split(".")[0] + "Z"))
            .withName("RetainUntilDate");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
const serializeAws_restXmlObjectLockRule = (input, context) => {
    const bodyNode = new xml_builder_1.XmlNode("ObjectLockRule");
    if (input.DefaultRetention !== undefined && input.DefaultRetention !== null) {
        const node = serializeAws_restXmlDefaultRetention(input.DefaultRetention, context).withName("DefaultRetention");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
const serializeAws_restXmlOutputLocation = (input, context) => {
    const bodyNode = new xml_builder_1.XmlNode("OutputLocation");
    if (input.S3 !== undefined && input.S3 !== null) {
        const node = serializeAws_restXmlS3Location(input.S3, context).withName("S3");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
const serializeAws_restXmlOutputSerialization = (input, context) => {
    const bodyNode = new xml_builder_1.XmlNode("OutputSerialization");
    if (input.CSV !== undefined && input.CSV !== null) {
        const node = serializeAws_restXmlCSVOutput(input.CSV, context).withName("CSV");
        bodyNode.addChildNode(node);
    }
    if (input.JSON !== undefined && input.JSON !== null) {
        const node = serializeAws_restXmlJSONOutput(input.JSON, context).withName("JSON");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
const serializeAws_restXmlOwner = (input, context) => {
    const bodyNode = new xml_builder_1.XmlNode("Owner");
    if (input.DisplayName !== undefined && input.DisplayName !== null) {
        const node = new xml_builder_1.XmlNode("DisplayName").addChildNode(new xml_builder_1.XmlText(input.DisplayName)).withName("DisplayName");
        bodyNode.addChildNode(node);
    }
    if (input.ID !== undefined && input.ID !== null) {
        const node = new xml_builder_1.XmlNode("ID").addChildNode(new xml_builder_1.XmlText(input.ID)).withName("ID");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
const serializeAws_restXmlOwnershipControls = (input, context) => {
    const bodyNode = new xml_builder_1.XmlNode("OwnershipControls");
    if (input.Rules !== undefined && input.Rules !== null) {
        const nodes = serializeAws_restXmlOwnershipControlsRules(input.Rules, context);
        nodes.map((node) => {
            node = node.withName("Rule");
            bodyNode.addChildNode(node);
        });
    }
    return bodyNode;
};
const serializeAws_restXmlOwnershipControlsRule = (input, context) => {
    const bodyNode = new xml_builder_1.XmlNode("OwnershipControlsRule");
    if (input.ObjectOwnership !== undefined && input.ObjectOwnership !== null) {
        const node = new xml_builder_1.XmlNode("ObjectOwnership")
            .addChildNode(new xml_builder_1.XmlText(input.ObjectOwnership))
            .withName("ObjectOwnership");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
const serializeAws_restXmlOwnershipControlsRules = (input, context) => {
    return input
        .filter((e) => e != null)
        .map((entry) => {
        if (entry === null) {
            return null;
        }
        const node = serializeAws_restXmlOwnershipControlsRule(entry, context);
        return node.withName("member");
    });
};
const serializeAws_restXmlParquetInput = (input, context) => {
    const bodyNode = new xml_builder_1.XmlNode("ParquetInput");
    return bodyNode;
};
const serializeAws_restXmlPublicAccessBlockConfiguration = (input, context) => {
    const bodyNode = new xml_builder_1.XmlNode("PublicAccessBlockConfiguration");
    if (input.BlockPublicAcls !== undefined && input.BlockPublicAcls !== null) {
        const node = new xml_builder_1.XmlNode("Setting")
            .addChildNode(new xml_builder_1.XmlText(String(input.BlockPublicAcls)))
            .withName("BlockPublicAcls");
        bodyNode.addChildNode(node);
    }
    if (input.IgnorePublicAcls !== undefined && input.IgnorePublicAcls !== null) {
        const node = new xml_builder_1.XmlNode("Setting")
            .addChildNode(new xml_builder_1.XmlText(String(input.IgnorePublicAcls)))
            .withName("IgnorePublicAcls");
        bodyNode.addChildNode(node);
    }
    if (input.BlockPublicPolicy !== undefined && input.BlockPublicPolicy !== null) {
        const node = new xml_builder_1.XmlNode("Setting")
            .addChildNode(new xml_builder_1.XmlText(String(input.BlockPublicPolicy)))
            .withName("BlockPublicPolicy");
        bodyNode.addChildNode(node);
    }
    if (input.RestrictPublicBuckets !== undefined && input.RestrictPublicBuckets !== null) {
        const node = new xml_builder_1.XmlNode("Setting")
            .addChildNode(new xml_builder_1.XmlText(String(input.RestrictPublicBuckets)))
            .withName("RestrictPublicBuckets");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
const serializeAws_restXmlQueueConfiguration = (input, context) => {
    const bodyNode = new xml_builder_1.XmlNode("QueueConfiguration");
    if (input.Id !== undefined && input.Id !== null) {
        const node = new xml_builder_1.XmlNode("NotificationId").addChildNode(new xml_builder_1.XmlText(input.Id)).withName("Id");
        bodyNode.addChildNode(node);
    }
    if (input.QueueArn !== undefined && input.QueueArn !== null) {
        const node = new xml_builder_1.XmlNode("QueueArn").addChildNode(new xml_builder_1.XmlText(input.QueueArn)).withName("Queue");
        bodyNode.addChildNode(node);
    }
    if (input.Events !== undefined && input.Events !== null) {
        const nodes = serializeAws_restXmlEventList(input.Events, context);
        nodes.map((node) => {
            node = node.withName("Event");
            bodyNode.addChildNode(node);
        });
    }
    if (input.Filter !== undefined && input.Filter !== null) {
        const node = serializeAws_restXmlNotificationConfigurationFilter(input.Filter, context).withName("Filter");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
const serializeAws_restXmlQueueConfigurationList = (input, context) => {
    return input
        .filter((e) => e != null)
        .map((entry) => {
        if (entry === null) {
            return null;
        }
        const node = serializeAws_restXmlQueueConfiguration(entry, context);
        return node.withName("member");
    });
};
const serializeAws_restXmlRedirect = (input, context) => {
    const bodyNode = new xml_builder_1.XmlNode("Redirect");
    if (input.HostName !== undefined && input.HostName !== null) {
        const node = new xml_builder_1.XmlNode("HostName").addChildNode(new xml_builder_1.XmlText(input.HostName)).withName("HostName");
        bodyNode.addChildNode(node);
    }
    if (input.HttpRedirectCode !== undefined && input.HttpRedirectCode !== null) {
        const node = new xml_builder_1.XmlNode("HttpRedirectCode")
            .addChildNode(new xml_builder_1.XmlText(input.HttpRedirectCode))
            .withName("HttpRedirectCode");
        bodyNode.addChildNode(node);
    }
    if (input.Protocol !== undefined && input.Protocol !== null) {
        const node = new xml_builder_1.XmlNode("Protocol").addChildNode(new xml_builder_1.XmlText(input.Protocol)).withName("Protocol");
        bodyNode.addChildNode(node);
    }
    if (input.ReplaceKeyPrefixWith !== undefined && input.ReplaceKeyPrefixWith !== null) {
        const node = new xml_builder_1.XmlNode("ReplaceKeyPrefixWith")
            .addChildNode(new xml_builder_1.XmlText(input.ReplaceKeyPrefixWith))
            .withName("ReplaceKeyPrefixWith");
        bodyNode.addChildNode(node);
    }
    if (input.ReplaceKeyWith !== undefined && input.ReplaceKeyWith !== null) {
        const node = new xml_builder_1.XmlNode("ReplaceKeyWith")
            .addChildNode(new xml_builder_1.XmlText(input.ReplaceKeyWith))
            .withName("ReplaceKeyWith");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
const serializeAws_restXmlRedirectAllRequestsTo = (input, context) => {
    const bodyNode = new xml_builder_1.XmlNode("RedirectAllRequestsTo");
    if (input.HostName !== undefined && input.HostName !== null) {
        const node = new xml_builder_1.XmlNode("HostName").addChildNode(new xml_builder_1.XmlText(input.HostName)).withName("HostName");
        bodyNode.addChildNode(node);
    }
    if (input.Protocol !== undefined && input.Protocol !== null) {
        const node = new xml_builder_1.XmlNode("Protocol").addChildNode(new xml_builder_1.XmlText(input.Protocol)).withName("Protocol");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
const serializeAws_restXmlReplicaModifications = (input, context) => {
    const bodyNode = new xml_builder_1.XmlNode("ReplicaModifications");
    if (input.Status !== undefined && input.Status !== null) {
        const node = new xml_builder_1.XmlNode("ReplicaModificationsStatus")
            .addChildNode(new xml_builder_1.XmlText(input.Status))
            .withName("Status");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
const serializeAws_restXmlReplicationConfiguration = (input, context) => {
    const bodyNode = new xml_builder_1.XmlNode("ReplicationConfiguration");
    if (input.Role !== undefined && input.Role !== null) {
        const node = new xml_builder_1.XmlNode("Role").addChildNode(new xml_builder_1.XmlText(input.Role)).withName("Role");
        bodyNode.addChildNode(node);
    }
    if (input.Rules !== undefined && input.Rules !== null) {
        const nodes = serializeAws_restXmlReplicationRules(input.Rules, context);
        nodes.map((node) => {
            node = node.withName("Rule");
            bodyNode.addChildNode(node);
        });
    }
    return bodyNode;
};
const serializeAws_restXmlReplicationRule = (input, context) => {
    const bodyNode = new xml_builder_1.XmlNode("ReplicationRule");
    if (input.ID !== undefined && input.ID !== null) {
        const node = new xml_builder_1.XmlNode("ID").addChildNode(new xml_builder_1.XmlText(input.ID)).withName("ID");
        bodyNode.addChildNode(node);
    }
    if (input.Priority !== undefined && input.Priority !== null) {
        const node = new xml_builder_1.XmlNode("Priority").addChildNode(new xml_builder_1.XmlText(String(input.Priority))).withName("Priority");
        bodyNode.addChildNode(node);
    }
    if (input.Prefix !== undefined && input.Prefix !== null) {
        const node = new xml_builder_1.XmlNode("Prefix").addChildNode(new xml_builder_1.XmlText(input.Prefix)).withName("Prefix");
        bodyNode.addChildNode(node);
    }
    if (input.Filter !== undefined && input.Filter !== null) {
        const node = serializeAws_restXmlReplicationRuleFilter(input.Filter, context).withName("Filter");
        bodyNode.addChildNode(node);
    }
    if (input.Status !== undefined && input.Status !== null) {
        const node = new xml_builder_1.XmlNode("ReplicationRuleStatus").addChildNode(new xml_builder_1.XmlText(input.Status)).withName("Status");
        bodyNode.addChildNode(node);
    }
    if (input.SourceSelectionCriteria !== undefined && input.SourceSelectionCriteria !== null) {
        const node = serializeAws_restXmlSourceSelectionCriteria(input.SourceSelectionCriteria, context).withName("SourceSelectionCriteria");
        bodyNode.addChildNode(node);
    }
    if (input.ExistingObjectReplication !== undefined && input.ExistingObjectReplication !== null) {
        const node = serializeAws_restXmlExistingObjectReplication(input.ExistingObjectReplication, context).withName("ExistingObjectReplication");
        bodyNode.addChildNode(node);
    }
    if (input.Destination !== undefined && input.Destination !== null) {
        const node = serializeAws_restXmlDestination(input.Destination, context).withName("Destination");
        bodyNode.addChildNode(node);
    }
    if (input.DeleteMarkerReplication !== undefined && input.DeleteMarkerReplication !== null) {
        const node = serializeAws_restXmlDeleteMarkerReplication(input.DeleteMarkerReplication, context).withName("DeleteMarkerReplication");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
const serializeAws_restXmlReplicationRuleAndOperator = (input, context) => {
    const bodyNode = new xml_builder_1.XmlNode("ReplicationRuleAndOperator");
    if (input.Prefix !== undefined && input.Prefix !== null) {
        const node = new xml_builder_1.XmlNode("Prefix").addChildNode(new xml_builder_1.XmlText(input.Prefix)).withName("Prefix");
        bodyNode.addChildNode(node);
    }
    if (input.Tags !== undefined && input.Tags !== null) {
        const nodes = serializeAws_restXmlTagSet(input.Tags, context);
        nodes.map((node) => {
            node = node.withName("Tag");
            bodyNode.addChildNode(node);
        });
    }
    return bodyNode;
};
const serializeAws_restXmlReplicationRuleFilter = (input, context) => {
    const bodyNode = new xml_builder_1.XmlNode("ReplicationRuleFilter");
    models_0_1.ReplicationRuleFilter.visit(input, {
        Prefix: (value) => {
            const node = new xml_builder_1.XmlNode("Prefix").addChildNode(new xml_builder_1.XmlText(value)).withName("Prefix");
            bodyNode.addChildNode(node);
        },
        Tag: (value) => {
            const node = serializeAws_restXmlTag(value, context).withName("Tag");
            bodyNode.addChildNode(node);
        },
        And: (value) => {
            const node = serializeAws_restXmlReplicationRuleAndOperator(value, context).withName("And");
            bodyNode.addChildNode(node);
        },
        _: (name, value) => {
            if (!(value instanceof xml_builder_1.XmlNode || value instanceof xml_builder_1.XmlText)) {
                throw new Error("Unable to serialize unknown union members in XML.");
            }
            bodyNode.addChildNode(new xml_builder_1.XmlNode(name).addChildNode(value));
        },
    });
    return bodyNode;
};
const serializeAws_restXmlReplicationRules = (input, context) => {
    return input
        .filter((e) => e != null)
        .map((entry) => {
        if (entry === null) {
            return null;
        }
        const node = serializeAws_restXmlReplicationRule(entry, context);
        return node.withName("member");
    });
};
const serializeAws_restXmlReplicationTime = (input, context) => {
    const bodyNode = new xml_builder_1.XmlNode("ReplicationTime");
    if (input.Status !== undefined && input.Status !== null) {
        const node = new xml_builder_1.XmlNode("ReplicationTimeStatus").addChildNode(new xml_builder_1.XmlText(input.Status)).withName("Status");
        bodyNode.addChildNode(node);
    }
    if (input.Time !== undefined && input.Time !== null) {
        const node = serializeAws_restXmlReplicationTimeValue(input.Time, context).withName("Time");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
const serializeAws_restXmlReplicationTimeValue = (input, context) => {
    const bodyNode = new xml_builder_1.XmlNode("ReplicationTimeValue");
    if (input.Minutes !== undefined && input.Minutes !== null) {
        const node = new xml_builder_1.XmlNode("Minutes").addChildNode(new xml_builder_1.XmlText(String(input.Minutes))).withName("Minutes");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
const serializeAws_restXmlRequestPaymentConfiguration = (input, context) => {
    const bodyNode = new xml_builder_1.XmlNode("RequestPaymentConfiguration");
    if (input.Payer !== undefined && input.Payer !== null) {
        const node = new xml_builder_1.XmlNode("Payer").addChildNode(new xml_builder_1.XmlText(input.Payer)).withName("Payer");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
const serializeAws_restXmlRequestProgress = (input, context) => {
    const bodyNode = new xml_builder_1.XmlNode("RequestProgress");
    if (input.Enabled !== undefined && input.Enabled !== null) {
        const node = new xml_builder_1.XmlNode("EnableRequestProgress")
            .addChildNode(new xml_builder_1.XmlText(String(input.Enabled)))
            .withName("Enabled");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
const serializeAws_restXmlRestoreRequest = (input, context) => {
    const bodyNode = new xml_builder_1.XmlNode("RestoreRequest");
    if (input.Days !== undefined && input.Days !== null) {
        const node = new xml_builder_1.XmlNode("Days").addChildNode(new xml_builder_1.XmlText(String(input.Days))).withName("Days");
        bodyNode.addChildNode(node);
    }
    if (input.GlacierJobParameters !== undefined && input.GlacierJobParameters !== null) {
        const node = serializeAws_restXmlGlacierJobParameters(input.GlacierJobParameters, context).withName("GlacierJobParameters");
        bodyNode.addChildNode(node);
    }
    if (input.Type !== undefined && input.Type !== null) {
        const node = new xml_builder_1.XmlNode("RestoreRequestType").addChildNode(new xml_builder_1.XmlText(input.Type)).withName("Type");
        bodyNode.addChildNode(node);
    }
    if (input.Tier !== undefined && input.Tier !== null) {
        const node = new xml_builder_1.XmlNode("Tier").addChildNode(new xml_builder_1.XmlText(input.Tier)).withName("Tier");
        bodyNode.addChildNode(node);
    }
    if (input.Description !== undefined && input.Description !== null) {
        const node = new xml_builder_1.XmlNode("Description").addChildNode(new xml_builder_1.XmlText(input.Description)).withName("Description");
        bodyNode.addChildNode(node);
    }
    if (input.SelectParameters !== undefined && input.SelectParameters !== null) {
        const node = serializeAws_restXmlSelectParameters(input.SelectParameters, context).withName("SelectParameters");
        bodyNode.addChildNode(node);
    }
    if (input.OutputLocation !== undefined && input.OutputLocation !== null) {
        const node = serializeAws_restXmlOutputLocation(input.OutputLocation, context).withName("OutputLocation");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
const serializeAws_restXmlRoutingRule = (input, context) => {
    const bodyNode = new xml_builder_1.XmlNode("RoutingRule");
    if (input.Condition !== undefined && input.Condition !== null) {
        const node = serializeAws_restXmlCondition(input.Condition, context).withName("Condition");
        bodyNode.addChildNode(node);
    }
    if (input.Redirect !== undefined && input.Redirect !== null) {
        const node = serializeAws_restXmlRedirect(input.Redirect, context).withName("Redirect");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
const serializeAws_restXmlRoutingRules = (input, context) => {
    return input
        .filter((e) => e != null)
        .map((entry) => {
        if (entry === null) {
            return null;
        }
        const node = serializeAws_restXmlRoutingRule(entry, context);
        return node.withName("RoutingRule");
    });
};
const serializeAws_restXmlS3KeyFilter = (input, context) => {
    const bodyNode = new xml_builder_1.XmlNode("S3KeyFilter");
    if (input.FilterRules !== undefined && input.FilterRules !== null) {
        const nodes = serializeAws_restXmlFilterRuleList(input.FilterRules, context);
        nodes.map((node) => {
            node = node.withName("FilterRule");
            bodyNode.addChildNode(node);
        });
    }
    return bodyNode;
};
const serializeAws_restXmlS3Location = (input, context) => {
    const bodyNode = new xml_builder_1.XmlNode("S3Location");
    if (input.BucketName !== undefined && input.BucketName !== null) {
        const node = new xml_builder_1.XmlNode("BucketName").addChildNode(new xml_builder_1.XmlText(input.BucketName)).withName("BucketName");
        bodyNode.addChildNode(node);
    }
    if (input.Prefix !== undefined && input.Prefix !== null) {
        const node = new xml_builder_1.XmlNode("LocationPrefix").addChildNode(new xml_builder_1.XmlText(input.Prefix)).withName("Prefix");
        bodyNode.addChildNode(node);
    }
    if (input.Encryption !== undefined && input.Encryption !== null) {
        const node = serializeAws_restXmlEncryption(input.Encryption, context).withName("Encryption");
        bodyNode.addChildNode(node);
    }
    if (input.CannedACL !== undefined && input.CannedACL !== null) {
        const node = new xml_builder_1.XmlNode("ObjectCannedACL").addChildNode(new xml_builder_1.XmlText(input.CannedACL)).withName("CannedACL");
        bodyNode.addChildNode(node);
    }
    if (input.AccessControlList !== undefined && input.AccessControlList !== null) {
        const nodes = serializeAws_restXmlGrants(input.AccessControlList, context);
        const containerNode = new xml_builder_1.XmlNode("AccessControlList");
        nodes.map((node) => {
            containerNode.addChildNode(node);
        });
        bodyNode.addChildNode(containerNode);
    }
    if (input.Tagging !== undefined && input.Tagging !== null) {
        const node = serializeAws_restXmlTagging(input.Tagging, context).withName("Tagging");
        bodyNode.addChildNode(node);
    }
    if (input.UserMetadata !== undefined && input.UserMetadata !== null) {
        const nodes = serializeAws_restXmlUserMetadata(input.UserMetadata, context);
        const containerNode = new xml_builder_1.XmlNode("UserMetadata");
        nodes.map((node) => {
            containerNode.addChildNode(node);
        });
        bodyNode.addChildNode(containerNode);
    }
    if (input.StorageClass !== undefined && input.StorageClass !== null) {
        const node = new xml_builder_1.XmlNode("StorageClass").addChildNode(new xml_builder_1.XmlText(input.StorageClass)).withName("StorageClass");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
const serializeAws_restXmlScanRange = (input, context) => {
    const bodyNode = new xml_builder_1.XmlNode("ScanRange");
    if (input.Start !== undefined && input.Start !== null) {
        const node = new xml_builder_1.XmlNode("Start").addChildNode(new xml_builder_1.XmlText(String(input.Start))).withName("Start");
        bodyNode.addChildNode(node);
    }
    if (input.End !== undefined && input.End !== null) {
        const node = new xml_builder_1.XmlNode("End").addChildNode(new xml_builder_1.XmlText(String(input.End))).withName("End");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
const serializeAws_restXmlSelectParameters = (input, context) => {
    const bodyNode = new xml_builder_1.XmlNode("SelectParameters");
    if (input.InputSerialization !== undefined && input.InputSerialization !== null) {
        const node = serializeAws_restXmlInputSerialization(input.InputSerialization, context).withName("InputSerialization");
        bodyNode.addChildNode(node);
    }
    if (input.ExpressionType !== undefined && input.ExpressionType !== null) {
        const node = new xml_builder_1.XmlNode("ExpressionType")
            .addChildNode(new xml_builder_1.XmlText(input.ExpressionType))
            .withName("ExpressionType");
        bodyNode.addChildNode(node);
    }
    if (input.Expression !== undefined && input.Expression !== null) {
        const node = new xml_builder_1.XmlNode("Expression").addChildNode(new xml_builder_1.XmlText(input.Expression)).withName("Expression");
        bodyNode.addChildNode(node);
    }
    if (input.OutputSerialization !== undefined && input.OutputSerialization !== null) {
        const node = serializeAws_restXmlOutputSerialization(input.OutputSerialization, context).withName("OutputSerialization");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
const serializeAws_restXmlServerSideEncryptionByDefault = (input, context) => {
    const bodyNode = new xml_builder_1.XmlNode("ServerSideEncryptionByDefault");
    if (input.SSEAlgorithm !== undefined && input.SSEAlgorithm !== null) {
        const node = new xml_builder_1.XmlNode("ServerSideEncryption")
            .addChildNode(new xml_builder_1.XmlText(input.SSEAlgorithm))
            .withName("SSEAlgorithm");
        bodyNode.addChildNode(node);
    }
    if (input.KMSMasterKeyID !== undefined && input.KMSMasterKeyID !== null) {
        const node = new xml_builder_1.XmlNode("SSEKMSKeyId")
            .addChildNode(new xml_builder_1.XmlText(input.KMSMasterKeyID))
            .withName("KMSMasterKeyID");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
const serializeAws_restXmlServerSideEncryptionConfiguration = (input, context) => {
    const bodyNode = new xml_builder_1.XmlNode("ServerSideEncryptionConfiguration");
    if (input.Rules !== undefined && input.Rules !== null) {
        const nodes = serializeAws_restXmlServerSideEncryptionRules(input.Rules, context);
        nodes.map((node) => {
            node = node.withName("Rule");
            bodyNode.addChildNode(node);
        });
    }
    return bodyNode;
};
const serializeAws_restXmlServerSideEncryptionRule = (input, context) => {
    const bodyNode = new xml_builder_1.XmlNode("ServerSideEncryptionRule");
    if (input.ApplyServerSideEncryptionByDefault !== undefined && input.ApplyServerSideEncryptionByDefault !== null) {
        const node = serializeAws_restXmlServerSideEncryptionByDefault(input.ApplyServerSideEncryptionByDefault, context).withName("ApplyServerSideEncryptionByDefault");
        bodyNode.addChildNode(node);
    }
    if (input.BucketKeyEnabled !== undefined && input.BucketKeyEnabled !== null) {
        const node = new xml_builder_1.XmlNode("BucketKeyEnabled")
            .addChildNode(new xml_builder_1.XmlText(String(input.BucketKeyEnabled)))
            .withName("BucketKeyEnabled");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
const serializeAws_restXmlServerSideEncryptionRules = (input, context) => {
    return input
        .filter((e) => e != null)
        .map((entry) => {
        if (entry === null) {
            return null;
        }
        const node = serializeAws_restXmlServerSideEncryptionRule(entry, context);
        return node.withName("member");
    });
};
const serializeAws_restXmlSourceSelectionCriteria = (input, context) => {
    const bodyNode = new xml_builder_1.XmlNode("SourceSelectionCriteria");
    if (input.SseKmsEncryptedObjects !== undefined && input.SseKmsEncryptedObjects !== null) {
        const node = serializeAws_restXmlSseKmsEncryptedObjects(input.SseKmsEncryptedObjects, context).withName("SseKmsEncryptedObjects");
        bodyNode.addChildNode(node);
    }
    if (input.ReplicaModifications !== undefined && input.ReplicaModifications !== null) {
        const node = serializeAws_restXmlReplicaModifications(input.ReplicaModifications, context).withName("ReplicaModifications");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
const serializeAws_restXmlSSEKMS = (input, context) => {
    const bodyNode = new xml_builder_1.XmlNode("SSE-KMS");
    if (input.KeyId !== undefined && input.KeyId !== null) {
        const node = new xml_builder_1.XmlNode("SSEKMSKeyId").addChildNode(new xml_builder_1.XmlText(input.KeyId)).withName("KeyId");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
const serializeAws_restXmlSseKmsEncryptedObjects = (input, context) => {
    const bodyNode = new xml_builder_1.XmlNode("SseKmsEncryptedObjects");
    if (input.Status !== undefined && input.Status !== null) {
        const node = new xml_builder_1.XmlNode("SseKmsEncryptedObjectsStatus")
            .addChildNode(new xml_builder_1.XmlText(input.Status))
            .withName("Status");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
const serializeAws_restXmlSSES3 = (input, context) => {
    const bodyNode = new xml_builder_1.XmlNode("SSE-S3");
    return bodyNode;
};
const serializeAws_restXmlStorageClassAnalysis = (input, context) => {
    const bodyNode = new xml_builder_1.XmlNode("StorageClassAnalysis");
    if (input.DataExport !== undefined && input.DataExport !== null) {
        const node = serializeAws_restXmlStorageClassAnalysisDataExport(input.DataExport, context).withName("DataExport");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
const serializeAws_restXmlStorageClassAnalysisDataExport = (input, context) => {
    const bodyNode = new xml_builder_1.XmlNode("StorageClassAnalysisDataExport");
    if (input.OutputSchemaVersion !== undefined && input.OutputSchemaVersion !== null) {
        const node = new xml_builder_1.XmlNode("StorageClassAnalysisSchemaVersion")
            .addChildNode(new xml_builder_1.XmlText(input.OutputSchemaVersion))
            .withName("OutputSchemaVersion");
        bodyNode.addChildNode(node);
    }
    if (input.Destination !== undefined && input.Destination !== null) {
        const node = serializeAws_restXmlAnalyticsExportDestination(input.Destination, context).withName("Destination");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
const serializeAws_restXmlTag = (input, context) => {
    const bodyNode = new xml_builder_1.XmlNode("Tag");
    if (input.Key !== undefined && input.Key !== null) {
        const node = new xml_builder_1.XmlNode("ObjectKey").addChildNode(new xml_builder_1.XmlText(input.Key)).withName("Key");
        bodyNode.addChildNode(node);
    }
    if (input.Value !== undefined && input.Value !== null) {
        const node = new xml_builder_1.XmlNode("Value").addChildNode(new xml_builder_1.XmlText(input.Value)).withName("Value");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
const serializeAws_restXmlTagging = (input, context) => {
    const bodyNode = new xml_builder_1.XmlNode("Tagging");
    if (input.TagSet !== undefined && input.TagSet !== null) {
        const nodes = serializeAws_restXmlTagSet(input.TagSet, context);
        const containerNode = new xml_builder_1.XmlNode("TagSet");
        nodes.map((node) => {
            containerNode.addChildNode(node);
        });
        bodyNode.addChildNode(containerNode);
    }
    return bodyNode;
};
const serializeAws_restXmlTagSet = (input, context) => {
    return input
        .filter((e) => e != null)
        .map((entry) => {
        if (entry === null) {
            return null;
        }
        const node = serializeAws_restXmlTag(entry, context);
        return node.withName("Tag");
    });
};
const serializeAws_restXmlTargetGrant = (input, context) => {
    const bodyNode = new xml_builder_1.XmlNode("TargetGrant");
    if (input.Grantee !== undefined && input.Grantee !== null) {
        const node = serializeAws_restXmlGrantee(input.Grantee, context).withName("Grantee");
        bodyNode.addChildNode(node);
    }
    if (input.Permission !== undefined && input.Permission !== null) {
        const node = new xml_builder_1.XmlNode("BucketLogsPermission")
            .addChildNode(new xml_builder_1.XmlText(input.Permission))
            .withName("Permission");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
const serializeAws_restXmlTargetGrants = (input, context) => {
    return input
        .filter((e) => e != null)
        .map((entry) => {
        if (entry === null) {
            return null;
        }
        const node = serializeAws_restXmlTargetGrant(entry, context);
        return node.withName("Grant");
    });
};
const serializeAws_restXmlTiering = (input, context) => {
    const bodyNode = new xml_builder_1.XmlNode("Tiering");
    if (input.Days !== undefined && input.Days !== null) {
        const node = new xml_builder_1.XmlNode("IntelligentTieringDays")
            .addChildNode(new xml_builder_1.XmlText(String(input.Days)))
            .withName("Days");
        bodyNode.addChildNode(node);
    }
    if (input.AccessTier !== undefined && input.AccessTier !== null) {
        const node = new xml_builder_1.XmlNode("IntelligentTieringAccessTier")
            .addChildNode(new xml_builder_1.XmlText(input.AccessTier))
            .withName("AccessTier");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
const serializeAws_restXmlTieringList = (input, context) => {
    return input
        .filter((e) => e != null)
        .map((entry) => {
        if (entry === null) {
            return null;
        }
        const node = serializeAws_restXmlTiering(entry, context);
        return node.withName("member");
    });
};
const serializeAws_restXmlTopicConfiguration = (input, context) => {
    const bodyNode = new xml_builder_1.XmlNode("TopicConfiguration");
    if (input.Id !== undefined && input.Id !== null) {
        const node = new xml_builder_1.XmlNode("NotificationId").addChildNode(new xml_builder_1.XmlText(input.Id)).withName("Id");
        bodyNode.addChildNode(node);
    }
    if (input.TopicArn !== undefined && input.TopicArn !== null) {
        const node = new xml_builder_1.XmlNode("TopicArn").addChildNode(new xml_builder_1.XmlText(input.TopicArn)).withName("Topic");
        bodyNode.addChildNode(node);
    }
    if (input.Events !== undefined && input.Events !== null) {
        const nodes = serializeAws_restXmlEventList(input.Events, context);
        nodes.map((node) => {
            node = node.withName("Event");
            bodyNode.addChildNode(node);
        });
    }
    if (input.Filter !== undefined && input.Filter !== null) {
        const node = serializeAws_restXmlNotificationConfigurationFilter(input.Filter, context).withName("Filter");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
const serializeAws_restXmlTopicConfigurationList = (input, context) => {
    return input
        .filter((e) => e != null)
        .map((entry) => {
        if (entry === null) {
            return null;
        }
        const node = serializeAws_restXmlTopicConfiguration(entry, context);
        return node.withName("member");
    });
};
const serializeAws_restXmlTransition = (input, context) => {
    const bodyNode = new xml_builder_1.XmlNode("Transition");
    if (input.Date !== undefined && input.Date !== null) {
        const node = new xml_builder_1.XmlNode("Date")
            .addChildNode(new xml_builder_1.XmlText(input.Date.toISOString().split(".")[0] + "Z"))
            .withName("Date");
        bodyNode.addChildNode(node);
    }
    if (input.Days !== undefined && input.Days !== null) {
        const node = new xml_builder_1.XmlNode("Days").addChildNode(new xml_builder_1.XmlText(String(input.Days))).withName("Days");
        bodyNode.addChildNode(node);
    }
    if (input.StorageClass !== undefined && input.StorageClass !== null) {
        const node = new xml_builder_1.XmlNode("TransitionStorageClass")
            .addChildNode(new xml_builder_1.XmlText(input.StorageClass))
            .withName("StorageClass");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
const serializeAws_restXmlTransitionList = (input, context) => {
    return input
        .filter((e) => e != null)
        .map((entry) => {
        if (entry === null) {
            return null;
        }
        const node = serializeAws_restXmlTransition(entry, context);
        return node.withName("member");
    });
};
const serializeAws_restXmlUserMetadata = (input, context) => {
    return input
        .filter((e) => e != null)
        .map((entry) => {
        if (entry === null) {
            return null;
        }
        const node = serializeAws_restXmlMetadataEntry(entry, context);
        return node.withName("MetadataEntry");
    });
};
const serializeAws_restXmlVersioningConfiguration = (input, context) => {
    const bodyNode = new xml_builder_1.XmlNode("VersioningConfiguration");
    if (input.MFADelete !== undefined && input.MFADelete !== null) {
        const node = new xml_builder_1.XmlNode("MFADelete").addChildNode(new xml_builder_1.XmlText(input.MFADelete)).withName("MfaDelete");
        bodyNode.addChildNode(node);
    }
    if (input.Status !== undefined && input.Status !== null) {
        const node = new xml_builder_1.XmlNode("BucketVersioningStatus").addChildNode(new xml_builder_1.XmlText(input.Status)).withName("Status");
        bodyNode.addChildNode(node);
    }
    return bodyNode;
};
const serializeAws_restXmlWebsiteConfiguration = (input, context) => {
    const bodyNode = new xml_builder_1.XmlNode("WebsiteConfiguration");
    if (input.ErrorDocument !== undefined && input.ErrorDocument !== null) {
        const node = serializeAws_restXmlErrorDocument(input.ErrorDocument, context).withName("ErrorDocument");
        bodyNode.addChildNode(node);
    }
    if (input.IndexDocument !== undefined && input.IndexDocument !== null) {
        const node = serializeAws_restXmlIndexDocument(input.IndexDocument, context).withName("IndexDocument");
        bodyNode.addChildNode(node);
    }
    if (input.RedirectAllRequestsTo !== undefined && input.RedirectAllRequestsTo !== null) {
        const node = serializeAws_restXmlRedirectAllRequestsTo(input.RedirectAllRequestsTo, context).withName("RedirectAllRequestsTo");
        bodyNode.addChildNode(node);
    }
    if (input.RoutingRules !== undefined && input.RoutingRules !== null) {
        const nodes = serializeAws_restXmlRoutingRules(input.RoutingRules, context);
        const containerNode = new xml_builder_1.XmlNode("RoutingRules");
        nodes.map((node) => {
            containerNode.addChildNode(node);
        });
        bodyNode.addChildNode(containerNode);
    }
    return bodyNode;
};
const deserializeAws_restXmlAbortIncompleteMultipartUpload = (output, context) => {
    let contents = {
        DaysAfterInitiation: undefined,
    };
    if (output["DaysAfterInitiation"] !== undefined) {
        contents.DaysAfterInitiation = parseInt(output["DaysAfterInitiation"]);
    }
    return contents;
};
const deserializeAws_restXmlAccessControlTranslation = (output, context) => {
    let contents = {
        Owner: undefined,
    };
    if (output["Owner"] !== undefined) {
        contents.Owner = output["Owner"];
    }
    return contents;
};
const deserializeAws_restXmlAllowedHeaders = (output, context) => {
    return (output || [])
        .filter((e) => e != null)
        .map((entry) => {
        if (entry === null) {
            return null;
        }
        return entry;
    });
};
const deserializeAws_restXmlAllowedMethods = (output, context) => {
    return (output || [])
        .filter((e) => e != null)
        .map((entry) => {
        if (entry === null) {
            return null;
        }
        return entry;
    });
};
const deserializeAws_restXmlAllowedOrigins = (output, context) => {
    return (output || [])
        .filter((e) => e != null)
        .map((entry) => {
        if (entry === null) {
            return null;
        }
        return entry;
    });
};
const deserializeAws_restXmlAnalyticsAndOperator = (output, context) => {
    let contents = {
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
        contents.Tags = deserializeAws_restXmlTagSet(smithy_client_1.getArrayIfSingleItem(output["Tag"]), context);
    }
    return contents;
};
const deserializeAws_restXmlAnalyticsConfiguration = (output, context) => {
    let contents = {
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
const deserializeAws_restXmlAnalyticsConfigurationList = (output, context) => {
    return (output || [])
        .filter((e) => e != null)
        .map((entry) => {
        if (entry === null) {
            return null;
        }
        return deserializeAws_restXmlAnalyticsConfiguration(entry, context);
    });
};
const deserializeAws_restXmlAnalyticsExportDestination = (output, context) => {
    let contents = {
        S3BucketDestination: undefined,
    };
    if (output["S3BucketDestination"] !== undefined) {
        contents.S3BucketDestination = deserializeAws_restXmlAnalyticsS3BucketDestination(output["S3BucketDestination"], context);
    }
    return contents;
};
const deserializeAws_restXmlAnalyticsFilter = (output, context) => {
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
const deserializeAws_restXmlAnalyticsS3BucketDestination = (output, context) => {
    let contents = {
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
const deserializeAws_restXmlBucket = (output, context) => {
    let contents = {
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
const deserializeAws_restXmlBuckets = (output, context) => {
    return (output || [])
        .filter((e) => e != null)
        .map((entry) => {
        if (entry === null) {
            return null;
        }
        return deserializeAws_restXmlBucket(entry, context);
    });
};
const deserializeAws_restXmlCommonPrefix = (output, context) => {
    let contents = {
        Prefix: undefined,
    };
    if (output["Prefix"] !== undefined) {
        contents.Prefix = output["Prefix"];
    }
    return contents;
};
const deserializeAws_restXmlCommonPrefixList = (output, context) => {
    return (output || [])
        .filter((e) => e != null)
        .map((entry) => {
        if (entry === null) {
            return null;
        }
        return deserializeAws_restXmlCommonPrefix(entry, context);
    });
};
const deserializeAws_restXmlCondition = (output, context) => {
    let contents = {
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
const deserializeAws_restXmlCopyObjectResult = (output, context) => {
    let contents = {
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
const deserializeAws_restXmlCopyPartResult = (output, context) => {
    let contents = {
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
const deserializeAws_restXmlCORSRule = (output, context) => {
    let contents = {
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
        contents.AllowedHeaders = deserializeAws_restXmlAllowedHeaders(smithy_client_1.getArrayIfSingleItem(output["AllowedHeader"]), context);
    }
    if (output.AllowedMethod === "") {
        contents.AllowedMethods = [];
    }
    if (output["AllowedMethod"] !== undefined) {
        contents.AllowedMethods = deserializeAws_restXmlAllowedMethods(smithy_client_1.getArrayIfSingleItem(output["AllowedMethod"]), context);
    }
    if (output.AllowedOrigin === "") {
        contents.AllowedOrigins = [];
    }
    if (output["AllowedOrigin"] !== undefined) {
        contents.AllowedOrigins = deserializeAws_restXmlAllowedOrigins(smithy_client_1.getArrayIfSingleItem(output["AllowedOrigin"]), context);
    }
    if (output.ExposeHeader === "") {
        contents.ExposeHeaders = [];
    }
    if (output["ExposeHeader"] !== undefined) {
        contents.ExposeHeaders = deserializeAws_restXmlExposeHeaders(smithy_client_1.getArrayIfSingleItem(output["ExposeHeader"]), context);
    }
    if (output["MaxAgeSeconds"] !== undefined) {
        contents.MaxAgeSeconds = parseInt(output["MaxAgeSeconds"]);
    }
    return contents;
};
const deserializeAws_restXmlCORSRules = (output, context) => {
    return (output || [])
        .filter((e) => e != null)
        .map((entry) => {
        if (entry === null) {
            return null;
        }
        return deserializeAws_restXmlCORSRule(entry, context);
    });
};
const deserializeAws_restXmlDefaultRetention = (output, context) => {
    let contents = {
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
const deserializeAws_restXmlDeletedObject = (output, context) => {
    let contents = {
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
const deserializeAws_restXmlDeletedObjects = (output, context) => {
    return (output || [])
        .filter((e) => e != null)
        .map((entry) => {
        if (entry === null) {
            return null;
        }
        return deserializeAws_restXmlDeletedObject(entry, context);
    });
};
const deserializeAws_restXmlDeleteMarkerEntry = (output, context) => {
    let contents = {
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
const deserializeAws_restXmlDeleteMarkerReplication = (output, context) => {
    let contents = {
        Status: undefined,
    };
    if (output["Status"] !== undefined) {
        contents.Status = output["Status"];
    }
    return contents;
};
const deserializeAws_restXmlDeleteMarkers = (output, context) => {
    return (output || [])
        .filter((e) => e != null)
        .map((entry) => {
        if (entry === null) {
            return null;
        }
        return deserializeAws_restXmlDeleteMarkerEntry(entry, context);
    });
};
const deserializeAws_restXmlDestination = (output, context) => {
    let contents = {
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
const deserializeAws_restXmlEncryptionConfiguration = (output, context) => {
    let contents = {
        ReplicaKmsKeyID: undefined,
    };
    if (output["ReplicaKmsKeyID"] !== undefined) {
        contents.ReplicaKmsKeyID = output["ReplicaKmsKeyID"];
    }
    return contents;
};
const deserializeAws_restXml_Error = (output, context) => {
    let contents = {
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
const deserializeAws_restXmlErrorDocument = (output, context) => {
    let contents = {
        Key: undefined,
    };
    if (output["Key"] !== undefined) {
        contents.Key = output["Key"];
    }
    return contents;
};
const deserializeAws_restXmlErrors = (output, context) => {
    return (output || [])
        .filter((e) => e != null)
        .map((entry) => {
        if (entry === null) {
            return null;
        }
        return deserializeAws_restXml_Error(entry, context);
    });
};
const deserializeAws_restXmlEventList = (output, context) => {
    return (output || [])
        .filter((e) => e != null)
        .map((entry) => {
        if (entry === null) {
            return null;
        }
        return entry;
    });
};
const deserializeAws_restXmlExistingObjectReplication = (output, context) => {
    let contents = {
        Status: undefined,
    };
    if (output["Status"] !== undefined) {
        contents.Status = output["Status"];
    }
    return contents;
};
const deserializeAws_restXmlExposeHeaders = (output, context) => {
    return (output || [])
        .filter((e) => e != null)
        .map((entry) => {
        if (entry === null) {
            return null;
        }
        return entry;
    });
};
const deserializeAws_restXmlFilterRule = (output, context) => {
    let contents = {
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
const deserializeAws_restXmlFilterRuleList = (output, context) => {
    return (output || [])
        .filter((e) => e != null)
        .map((entry) => {
        if (entry === null) {
            return null;
        }
        return deserializeAws_restXmlFilterRule(entry, context);
    });
};
const deserializeAws_restXmlGrant = (output, context) => {
    let contents = {
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
const deserializeAws_restXmlGrantee = (output, context) => {
    let contents = {
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
const deserializeAws_restXmlGrants = (output, context) => {
    return (output || [])
        .filter((e) => e != null)
        .map((entry) => {
        if (entry === null) {
            return null;
        }
        return deserializeAws_restXmlGrant(entry, context);
    });
};
const deserializeAws_restXmlIndexDocument = (output, context) => {
    let contents = {
        Suffix: undefined,
    };
    if (output["Suffix"] !== undefined) {
        contents.Suffix = output["Suffix"];
    }
    return contents;
};
const deserializeAws_restXmlInitiator = (output, context) => {
    let contents = {
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
const deserializeAws_restXmlIntelligentTieringAndOperator = (output, context) => {
    let contents = {
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
        contents.Tags = deserializeAws_restXmlTagSet(smithy_client_1.getArrayIfSingleItem(output["Tag"]), context);
    }
    return contents;
};
const deserializeAws_restXmlIntelligentTieringConfiguration = (output, context) => {
    let contents = {
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
        contents.Tierings = deserializeAws_restXmlTieringList(smithy_client_1.getArrayIfSingleItem(output["Tiering"]), context);
    }
    return contents;
};
const deserializeAws_restXmlIntelligentTieringConfigurationList = (output, context) => {
    return (output || [])
        .filter((e) => e != null)
        .map((entry) => {
        if (entry === null) {
            return null;
        }
        return deserializeAws_restXmlIntelligentTieringConfiguration(entry, context);
    });
};
const deserializeAws_restXmlIntelligentTieringFilter = (output, context) => {
    let contents = {
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
const deserializeAws_restXmlInventoryConfiguration = (output, context) => {
    let contents = {
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
        contents.OptionalFields = deserializeAws_restXmlInventoryOptionalFields(smithy_client_1.getArrayIfSingleItem(output["OptionalFields"]["Field"]), context);
    }
    if (output["Schedule"] !== undefined) {
        contents.Schedule = deserializeAws_restXmlInventorySchedule(output["Schedule"], context);
    }
    return contents;
};
const deserializeAws_restXmlInventoryConfigurationList = (output, context) => {
    return (output || [])
        .filter((e) => e != null)
        .map((entry) => {
        if (entry === null) {
            return null;
        }
        return deserializeAws_restXmlInventoryConfiguration(entry, context);
    });
};
const deserializeAws_restXmlInventoryDestination = (output, context) => {
    let contents = {
        S3BucketDestination: undefined,
    };
    if (output["S3BucketDestination"] !== undefined) {
        contents.S3BucketDestination = deserializeAws_restXmlInventoryS3BucketDestination(output["S3BucketDestination"], context);
    }
    return contents;
};
const deserializeAws_restXmlInventoryEncryption = (output, context) => {
    let contents = {
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
const deserializeAws_restXmlInventoryFilter = (output, context) => {
    let contents = {
        Prefix: undefined,
    };
    if (output["Prefix"] !== undefined) {
        contents.Prefix = output["Prefix"];
    }
    return contents;
};
const deserializeAws_restXmlInventoryOptionalFields = (output, context) => {
    return (output || [])
        .filter((e) => e != null)
        .map((entry) => {
        if (entry === null) {
            return null;
        }
        return entry;
    });
};
const deserializeAws_restXmlInventoryS3BucketDestination = (output, context) => {
    let contents = {
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
const deserializeAws_restXmlInventorySchedule = (output, context) => {
    let contents = {
        Frequency: undefined,
    };
    if (output["Frequency"] !== undefined) {
        contents.Frequency = output["Frequency"];
    }
    return contents;
};
const deserializeAws_restXmlLambdaFunctionConfiguration = (output, context) => {
    let contents = {
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
        contents.Events = deserializeAws_restXmlEventList(smithy_client_1.getArrayIfSingleItem(output["Event"]), context);
    }
    if (output["Filter"] !== undefined) {
        contents.Filter = deserializeAws_restXmlNotificationConfigurationFilter(output["Filter"], context);
    }
    return contents;
};
const deserializeAws_restXmlLambdaFunctionConfigurationList = (output, context) => {
    return (output || [])
        .filter((e) => e != null)
        .map((entry) => {
        if (entry === null) {
            return null;
        }
        return deserializeAws_restXmlLambdaFunctionConfiguration(entry, context);
    });
};
const deserializeAws_restXmlLifecycleExpiration = (output, context) => {
    let contents = {
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
const deserializeAws_restXmlLifecycleRule = (output, context) => {
    let contents = {
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
        contents.Transitions = deserializeAws_restXmlTransitionList(smithy_client_1.getArrayIfSingleItem(output["Transition"]), context);
    }
    if (output.NoncurrentVersionTransition === "") {
        contents.NoncurrentVersionTransitions = [];
    }
    if (output["NoncurrentVersionTransition"] !== undefined) {
        contents.NoncurrentVersionTransitions = deserializeAws_restXmlNoncurrentVersionTransitionList(smithy_client_1.getArrayIfSingleItem(output["NoncurrentVersionTransition"]), context);
    }
    if (output["NoncurrentVersionExpiration"] !== undefined) {
        contents.NoncurrentVersionExpiration = deserializeAws_restXmlNoncurrentVersionExpiration(output["NoncurrentVersionExpiration"], context);
    }
    if (output["AbortIncompleteMultipartUpload"] !== undefined) {
        contents.AbortIncompleteMultipartUpload = deserializeAws_restXmlAbortIncompleteMultipartUpload(output["AbortIncompleteMultipartUpload"], context);
    }
    return contents;
};
const deserializeAws_restXmlLifecycleRuleAndOperator = (output, context) => {
    let contents = {
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
        contents.Tags = deserializeAws_restXmlTagSet(smithy_client_1.getArrayIfSingleItem(output["Tag"]), context);
    }
    return contents;
};
const deserializeAws_restXmlLifecycleRuleFilter = (output, context) => {
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
const deserializeAws_restXmlLifecycleRules = (output, context) => {
    return (output || [])
        .filter((e) => e != null)
        .map((entry) => {
        if (entry === null) {
            return null;
        }
        return deserializeAws_restXmlLifecycleRule(entry, context);
    });
};
const deserializeAws_restXmlLoggingEnabled = (output, context) => {
    let contents = {
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
        contents.TargetGrants = deserializeAws_restXmlTargetGrants(smithy_client_1.getArrayIfSingleItem(output["TargetGrants"]["Grant"]), context);
    }
    if (output["TargetPrefix"] !== undefined) {
        contents.TargetPrefix = output["TargetPrefix"];
    }
    return contents;
};
const deserializeAws_restXmlMetrics = (output, context) => {
    let contents = {
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
const deserializeAws_restXmlMetricsAndOperator = (output, context) => {
    let contents = {
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
        contents.Tags = deserializeAws_restXmlTagSet(smithy_client_1.getArrayIfSingleItem(output["Tag"]), context);
    }
    return contents;
};
const deserializeAws_restXmlMetricsConfiguration = (output, context) => {
    let contents = {
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
const deserializeAws_restXmlMetricsConfigurationList = (output, context) => {
    return (output || [])
        .filter((e) => e != null)
        .map((entry) => {
        if (entry === null) {
            return null;
        }
        return deserializeAws_restXmlMetricsConfiguration(entry, context);
    });
};
const deserializeAws_restXmlMetricsFilter = (output, context) => {
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
const deserializeAws_restXmlMultipartUpload = (output, context) => {
    let contents = {
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
const deserializeAws_restXmlMultipartUploadList = (output, context) => {
    return (output || [])
        .filter((e) => e != null)
        .map((entry) => {
        if (entry === null) {
            return null;
        }
        return deserializeAws_restXmlMultipartUpload(entry, context);
    });
};
const deserializeAws_restXmlNoncurrentVersionExpiration = (output, context) => {
    let contents = {
        NoncurrentDays: undefined,
    };
    if (output["NoncurrentDays"] !== undefined) {
        contents.NoncurrentDays = parseInt(output["NoncurrentDays"]);
    }
    return contents;
};
const deserializeAws_restXmlNoncurrentVersionTransition = (output, context) => {
    let contents = {
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
const deserializeAws_restXmlNoncurrentVersionTransitionList = (output, context) => {
    return (output || [])
        .filter((e) => e != null)
        .map((entry) => {
        if (entry === null) {
            return null;
        }
        return deserializeAws_restXmlNoncurrentVersionTransition(entry, context);
    });
};
const deserializeAws_restXmlNotificationConfigurationFilter = (output, context) => {
    let contents = {
        Key: undefined,
    };
    if (output["S3Key"] !== undefined) {
        contents.Key = deserializeAws_restXmlS3KeyFilter(output["S3Key"], context);
    }
    return contents;
};
const deserializeAws_restXml_Object = (output, context) => {
    let contents = {
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
const deserializeAws_restXmlObjectList = (output, context) => {
    return (output || [])
        .filter((e) => e != null)
        .map((entry) => {
        if (entry === null) {
            return null;
        }
        return deserializeAws_restXml_Object(entry, context);
    });
};
const deserializeAws_restXmlObjectLockConfiguration = (output, context) => {
    let contents = {
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
const deserializeAws_restXmlObjectLockLegalHold = (output, context) => {
    let contents = {
        Status: undefined,
    };
    if (output["Status"] !== undefined) {
        contents.Status = output["Status"];
    }
    return contents;
};
const deserializeAws_restXmlObjectLockRetention = (output, context) => {
    let contents = {
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
const deserializeAws_restXmlObjectLockRule = (output, context) => {
    let contents = {
        DefaultRetention: undefined,
    };
    if (output["DefaultRetention"] !== undefined) {
        contents.DefaultRetention = deserializeAws_restXmlDefaultRetention(output["DefaultRetention"], context);
    }
    return contents;
};
const deserializeAws_restXmlObjectVersion = (output, context) => {
    let contents = {
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
const deserializeAws_restXmlObjectVersionList = (output, context) => {
    return (output || [])
        .filter((e) => e != null)
        .map((entry) => {
        if (entry === null) {
            return null;
        }
        return deserializeAws_restXmlObjectVersion(entry, context);
    });
};
const deserializeAws_restXmlOwner = (output, context) => {
    let contents = {
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
const deserializeAws_restXmlOwnershipControls = (output, context) => {
    let contents = {
        Rules: undefined,
    };
    if (output.Rule === "") {
        contents.Rules = [];
    }
    if (output["Rule"] !== undefined) {
        contents.Rules = deserializeAws_restXmlOwnershipControlsRules(smithy_client_1.getArrayIfSingleItem(output["Rule"]), context);
    }
    return contents;
};
const deserializeAws_restXmlOwnershipControlsRule = (output, context) => {
    let contents = {
        ObjectOwnership: undefined,
    };
    if (output["ObjectOwnership"] !== undefined) {
        contents.ObjectOwnership = output["ObjectOwnership"];
    }
    return contents;
};
const deserializeAws_restXmlOwnershipControlsRules = (output, context) => {
    return (output || [])
        .filter((e) => e != null)
        .map((entry) => {
        if (entry === null) {
            return null;
        }
        return deserializeAws_restXmlOwnershipControlsRule(entry, context);
    });
};
const deserializeAws_restXmlPart = (output, context) => {
    let contents = {
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
const deserializeAws_restXmlParts = (output, context) => {
    return (output || [])
        .filter((e) => e != null)
        .map((entry) => {
        if (entry === null) {
            return null;
        }
        return deserializeAws_restXmlPart(entry, context);
    });
};
const deserializeAws_restXmlPolicyStatus = (output, context) => {
    let contents = {
        IsPublic: undefined,
    };
    if (output["IsPublic"] !== undefined) {
        contents.IsPublic = output["IsPublic"] == "true";
    }
    return contents;
};
const deserializeAws_restXmlPublicAccessBlockConfiguration = (output, context) => {
    let contents = {
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
const deserializeAws_restXmlQueueConfiguration = (output, context) => {
    let contents = {
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
        contents.Events = deserializeAws_restXmlEventList(smithy_client_1.getArrayIfSingleItem(output["Event"]), context);
    }
    if (output["Filter"] !== undefined) {
        contents.Filter = deserializeAws_restXmlNotificationConfigurationFilter(output["Filter"], context);
    }
    return contents;
};
const deserializeAws_restXmlQueueConfigurationList = (output, context) => {
    return (output || [])
        .filter((e) => e != null)
        .map((entry) => {
        if (entry === null) {
            return null;
        }
        return deserializeAws_restXmlQueueConfiguration(entry, context);
    });
};
const deserializeAws_restXmlRedirect = (output, context) => {
    let contents = {
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
const deserializeAws_restXmlRedirectAllRequestsTo = (output, context) => {
    let contents = {
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
const deserializeAws_restXmlReplicaModifications = (output, context) => {
    let contents = {
        Status: undefined,
    };
    if (output["Status"] !== undefined) {
        contents.Status = output["Status"];
    }
    return contents;
};
const deserializeAws_restXmlReplicationConfiguration = (output, context) => {
    let contents = {
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
        contents.Rules = deserializeAws_restXmlReplicationRules(smithy_client_1.getArrayIfSingleItem(output["Rule"]), context);
    }
    return contents;
};
const deserializeAws_restXmlReplicationRule = (output, context) => {
    let contents = {
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
const deserializeAws_restXmlReplicationRuleAndOperator = (output, context) => {
    let contents = {
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
        contents.Tags = deserializeAws_restXmlTagSet(smithy_client_1.getArrayIfSingleItem(output["Tag"]), context);
    }
    return contents;
};
const deserializeAws_restXmlReplicationRuleFilter = (output, context) => {
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
const deserializeAws_restXmlReplicationRules = (output, context) => {
    return (output || [])
        .filter((e) => e != null)
        .map((entry) => {
        if (entry === null) {
            return null;
        }
        return deserializeAws_restXmlReplicationRule(entry, context);
    });
};
const deserializeAws_restXmlReplicationTime = (output, context) => {
    let contents = {
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
const deserializeAws_restXmlReplicationTimeValue = (output, context) => {
    let contents = {
        Minutes: undefined,
    };
    if (output["Minutes"] !== undefined) {
        contents.Minutes = parseInt(output["Minutes"]);
    }
    return contents;
};
const deserializeAws_restXmlRoutingRule = (output, context) => {
    let contents = {
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
const deserializeAws_restXmlRoutingRules = (output, context) => {
    return (output || [])
        .filter((e) => e != null)
        .map((entry) => {
        if (entry === null) {
            return null;
        }
        return deserializeAws_restXmlRoutingRule(entry, context);
    });
};
const deserializeAws_restXmlS3KeyFilter = (output, context) => {
    let contents = {
        FilterRules: undefined,
    };
    if (output.FilterRule === "") {
        contents.FilterRules = [];
    }
    if (output["FilterRule"] !== undefined) {
        contents.FilterRules = deserializeAws_restXmlFilterRuleList(smithy_client_1.getArrayIfSingleItem(output["FilterRule"]), context);
    }
    return contents;
};
const deserializeAws_restXmlServerSideEncryptionByDefault = (output, context) => {
    let contents = {
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
const deserializeAws_restXmlServerSideEncryptionConfiguration = (output, context) => {
    let contents = {
        Rules: undefined,
    };
    if (output.Rule === "") {
        contents.Rules = [];
    }
    if (output["Rule"] !== undefined) {
        contents.Rules = deserializeAws_restXmlServerSideEncryptionRules(smithy_client_1.getArrayIfSingleItem(output["Rule"]), context);
    }
    return contents;
};
const deserializeAws_restXmlServerSideEncryptionRule = (output, context) => {
    let contents = {
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
const deserializeAws_restXmlServerSideEncryptionRules = (output, context) => {
    return (output || [])
        .filter((e) => e != null)
        .map((entry) => {
        if (entry === null) {
            return null;
        }
        return deserializeAws_restXmlServerSideEncryptionRule(entry, context);
    });
};
const deserializeAws_restXmlSourceSelectionCriteria = (output, context) => {
    let contents = {
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
const deserializeAws_restXmlSSEKMS = (output, context) => {
    let contents = {
        KeyId: undefined,
    };
    if (output["KeyId"] !== undefined) {
        contents.KeyId = output["KeyId"];
    }
    return contents;
};
const deserializeAws_restXmlSseKmsEncryptedObjects = (output, context) => {
    let contents = {
        Status: undefined,
    };
    if (output["Status"] !== undefined) {
        contents.Status = output["Status"];
    }
    return contents;
};
const deserializeAws_restXmlSSES3 = (output, context) => {
    let contents = {};
    return contents;
};
const deserializeAws_restXmlStorageClassAnalysis = (output, context) => {
    let contents = {
        DataExport: undefined,
    };
    if (output["DataExport"] !== undefined) {
        contents.DataExport = deserializeAws_restXmlStorageClassAnalysisDataExport(output["DataExport"], context);
    }
    return contents;
};
const deserializeAws_restXmlStorageClassAnalysisDataExport = (output, context) => {
    let contents = {
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
const deserializeAws_restXmlTag = (output, context) => {
    let contents = {
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
const deserializeAws_restXmlTagSet = (output, context) => {
    return (output || [])
        .filter((e) => e != null)
        .map((entry) => {
        if (entry === null) {
            return null;
        }
        return deserializeAws_restXmlTag(entry, context);
    });
};
const deserializeAws_restXmlTargetGrant = (output, context) => {
    let contents = {
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
const deserializeAws_restXmlTargetGrants = (output, context) => {
    return (output || [])
        .filter((e) => e != null)
        .map((entry) => {
        if (entry === null) {
            return null;
        }
        return deserializeAws_restXmlTargetGrant(entry, context);
    });
};
const deserializeAws_restXmlTiering = (output, context) => {
    let contents = {
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
const deserializeAws_restXmlTieringList = (output, context) => {
    return (output || [])
        .filter((e) => e != null)
        .map((entry) => {
        if (entry === null) {
            return null;
        }
        return deserializeAws_restXmlTiering(entry, context);
    });
};
const deserializeAws_restXmlTopicConfiguration = (output, context) => {
    let contents = {
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
        contents.Events = deserializeAws_restXmlEventList(smithy_client_1.getArrayIfSingleItem(output["Event"]), context);
    }
    if (output["Filter"] !== undefined) {
        contents.Filter = deserializeAws_restXmlNotificationConfigurationFilter(output["Filter"], context);
    }
    return contents;
};
const deserializeAws_restXmlTopicConfigurationList = (output, context) => {
    return (output || [])
        .filter((e) => e != null)
        .map((entry) => {
        if (entry === null) {
            return null;
        }
        return deserializeAws_restXmlTopicConfiguration(entry, context);
    });
};
const deserializeAws_restXmlTransition = (output, context) => {
    let contents = {
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
const deserializeAws_restXmlTransitionList = (output, context) => {
    return (output || [])
        .filter((e) => e != null)
        .map((entry) => {
        if (entry === null) {
            return null;
        }
        return deserializeAws_restXmlTransition(entry, context);
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
const loadRestXmlErrorCode = (output, data) => {
    if (data.Code !== undefined) {
        return data.Code;
    }
    if (output.statusCode == 404) {
        return "NotFound";
    }
    return "";
};
//# sourceMappingURL=Aws_restXml.js.map