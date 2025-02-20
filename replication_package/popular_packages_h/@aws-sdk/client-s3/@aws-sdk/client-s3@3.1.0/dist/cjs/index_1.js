"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

// Import tslib to use its __exportStar helper for re-exporting modules
const tslib_1 = require("tslib");

// Re-export all exports from various modules related to S3 client operations
tslib_1.__exportStar(require("./S3Client"), exports);
tslib_1.__exportStar(require("./S3"), exports);

// Commands related to multipart upload operations
tslib_1.__exportStar(require("./commands/AbortMultipartUploadCommand"), exports);
tslib_1.__exportStar(require("./commands/CompleteMultipartUploadCommand"), exports);
tslib_1.__exportStar(require("./commands/CreateMultipartUploadCommand"), exports);
tslib_1.__exportStar(require("./commands/UploadPartCommand"), exports);
tslib_1.__exportStar(require("./commands/UploadPartCopyCommand"), exports);
tslib_1.__exportStar(require("./commands/ListPartsCommand"), exports);

// Commands related to bucket management
tslib_1.__exportStar(require("./commands/CreateBucketCommand"), exports);
tslib_1.__exportStar(require("./commands/DeleteBucketCommand"), exports);
tslib_1.__exportStar(require("./commands/ListBucketsCommand"), exports);

// Commands related to object operations
tslib_1.__exportStar(require("./commands/GetObjectCommand"), exports);
tslib_1.__exportStar(require("./commands/DeleteObjectCommand"), exports);
tslib_1.__exportStar(require("./commands/PutObjectCommand"), exports);
tslib_1.__exportStar(require("./commands/CopyObjectCommand"), exports);
tslib_1.__exportStar(require("./commands/RestoreObjectCommand"), exports);

// Commands for setting and getting bucket configurations
tslib_1.__exportStar(require("./commands/PutBucketAclCommand"), exports);
tslib_1.__exportStar(require("./commands/GetBucketAclCommand"), exports);
tslib_1.__exportStar(require("./commands/PutBucketPolicyCommand"), exports);
tslib_1.__exportStar(require("./commands/GetBucketPolicyCommand"), exports);

// Commands for listing objects and versions
tslib_1.__exportStar(require("./commands/ListObjectsCommand"), exports);
tslib_1.__exportStar(require("./commands/ListObjectsV2Command"), exports);
tslib_1.__exportStar(require("./commands/ListObjectVersionsCommand"), exports);

// Waiters for handling asynchronous operations
tslib_1.__exportStar(require("./waiters/waitForBucketExists"), exports);
tslib_1.__exportStar(require("./waiters/waitForObjectExists"), exports);

// Re-export interfaces and models
tslib_1.__exportStar(require("./pagination/Interfaces"), exports);
tslib_1.__exportStar(require("./models/index"), exports);
