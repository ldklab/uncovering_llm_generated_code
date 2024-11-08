"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

const { __exportStar } = require("tslib");

const modulesToExport = [
    "./S3Client",
    "./S3",
    "./commands/AbortMultipartUploadCommand",
    "./commands/CompleteMultipartUploadCommand",
    "./commands/CopyObjectCommand",
    "./commands/CreateBucketCommand",
    "./commands/CreateMultipartUploadCommand",
    "./commands/DeleteBucketCommand",
    "./commands/DeleteBucketAnalyticsConfigurationCommand",
    "./commands/DeleteBucketCorsCommand",
    "./commands/DeleteBucketEncryptionCommand",
    "./commands/DeleteBucketIntelligentTieringConfigurationCommand",
    "./commands/DeleteBucketInventoryConfigurationCommand",
    "./commands/DeleteBucketLifecycleCommand",
    "./commands/DeleteBucketMetricsConfigurationCommand",
    "./commands/DeleteBucketOwnershipControlsCommand",
    "./commands/DeleteBucketPolicyCommand",
    "./commands/DeleteBucketReplicationCommand",
    "./commands/DeleteBucketTaggingCommand",
    "./commands/DeleteBucketWebsiteCommand",
    "./commands/DeleteObjectCommand",
    "./commands/DeleteObjectsCommand",
    "./commands/DeleteObjectTaggingCommand",
    "./commands/DeletePublicAccessBlockCommand",
    "./commands/GetBucketAccelerateConfigurationCommand",
    "./commands/GetBucketAclCommand",
    "./commands/GetBucketAnalyticsConfigurationCommand",
    "./commands/GetBucketCorsCommand",
    "./commands/GetBucketEncryptionCommand",
    "./commands/GetBucketIntelligentTieringConfigurationCommand",
    "./commands/GetBucketInventoryConfigurationCommand",
    "./commands/GetBucketLifecycleConfigurationCommand",
    "./commands/GetBucketLocationCommand",
    "./commands/GetBucketLoggingCommand",
    "./commands/GetBucketMetricsConfigurationCommand",
    "./commands/GetBucketNotificationConfigurationCommand",
    "./commands/GetBucketOwnershipControlsCommand",
    "./commands/GetBucketPolicyCommand",
    "./commands/GetBucketPolicyStatusCommand",
    "./commands/GetBucketReplicationCommand",
    "./commands/GetBucketRequestPaymentCommand",
    "./commands/GetBucketTaggingCommand",
    "./commands/GetBucketVersioningCommand",
    "./commands/GetBucketWebsiteCommand",
    "./commands/GetObjectCommand",
    "./commands/GetObjectAclCommand",
    "./commands/GetObjectLegalHoldCommand",
    "./commands/GetObjectLockConfigurationCommand",
    "./commands/GetObjectRetentionCommand",
    "./commands/GetObjectTaggingCommand",
    "./commands/GetObjectTorrentCommand",
    "./commands/GetPublicAccessBlockCommand",
    "./commands/HeadBucketCommand",
    "./waiters/waitForBucketExists",
    "./commands/HeadObjectCommand",
    "./waiters/waitForObjectExists",
    "./commands/ListBucketAnalyticsConfigurationsCommand",
    "./commands/ListBucketIntelligentTieringConfigurationsCommand",
    "./commands/ListBucketInventoryConfigurationsCommand",
    "./commands/ListBucketMetricsConfigurationsCommand",
    "./commands/ListBucketsCommand",
    "./commands/ListMultipartUploadsCommand",
    "./commands/ListObjectsCommand",
    "./commands/ListObjectsV2Command",
    "./pagination/ListObjectsV2Paginator",
    "./commands/ListObjectVersionsCommand",
    "./commands/ListPartsCommand",
    "./pagination/ListPartsPaginator",
    "./commands/PutBucketAccelerateConfigurationCommand",
    "./commands/PutBucketAclCommand",
    "./commands/PutBucketAnalyticsConfigurationCommand",
    "./commands/PutBucketCorsCommand",
    "./commands/PutBucketEncryptionCommand",
    "./commands/PutBucketIntelligentTieringConfigurationCommand",
    "./commands/PutBucketInventoryConfigurationCommand",
    "./commands/PutBucketLifecycleConfigurationCommand",
    "./commands/PutBucketLoggingCommand",
    "./commands/PutBucketMetricsConfigurationCommand",
    "./commands/PutBucketNotificationConfigurationCommand",
    "./commands/PutBucketOwnershipControlsCommand",
    "./commands/PutBucketPolicyCommand",
    "./commands/PutBucketReplicationCommand",
    "./commands/PutBucketRequestPaymentCommand",
    "./commands/PutBucketTaggingCommand",
    "./commands/PutBucketVersioningCommand",
    "./commands/PutBucketWebsiteCommand",
    "./commands/PutObjectCommand",
    "./commands/PutObjectAclCommand",
    "./commands/PutObjectLegalHoldCommand",
    "./commands/PutObjectLockConfigurationCommand",
    "./commands/PutObjectRetentionCommand",
    "./commands/PutObjectTaggingCommand",
    "./commands/PutPublicAccessBlockCommand",
    "./commands/RestoreObjectCommand",
    "./commands/SelectObjectContentCommand",
    "./commands/UploadPartCommand",
    "./commands/UploadPartCopyCommand",
    "./pagination/Interfaces",
    "./models/index"
];

modulesToExport.forEach(module => {
    __exportStar(require(module), exports);
});

//# sourceMappingURL=index.js.map
