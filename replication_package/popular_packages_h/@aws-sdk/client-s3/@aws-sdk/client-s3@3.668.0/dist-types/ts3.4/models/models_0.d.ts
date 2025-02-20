import { ExceptionOptionType as __ExceptionOptionType } from "@smithy/smithy-client";
import { StreamingBlobTypes } from "@smithy/types";
import { S3ServiceException as __BaseException } from "./S3ServiceException";
export interface AbortIncompleteMultipartUpload {
  DaysAfterInitiation?: number;
}
export declare const RequestCharged: {
  readonly requester: "requester";
};
export type RequestCharged =
  (typeof RequestCharged)[keyof typeof RequestCharged];
export interface AbortMultipartUploadOutput {
  RequestCharged?: RequestCharged;
}
export declare const RequestPayer: {
  readonly requester: "requester";
};
export type RequestPayer = (typeof RequestPayer)[keyof typeof RequestPayer];
export interface AbortMultipartUploadRequest {
  Bucket: string | undefined;
  Key: string | undefined;
  UploadId: string | undefined;
  RequestPayer?: RequestPayer;
  ExpectedBucketOwner?: string;
}
export declare class NoSuchUpload extends __BaseException {
  readonly name: "NoSuchUpload";
  readonly $fault: "client";
  constructor(opts: __ExceptionOptionType<NoSuchUpload, __BaseException>);
}
export declare const BucketAccelerateStatus: {
  readonly Enabled: "Enabled";
  readonly Suspended: "Suspended";
};
export type BucketAccelerateStatus =
  (typeof BucketAccelerateStatus)[keyof typeof BucketAccelerateStatus];
export interface AccelerateConfiguration {
  Status?: BucketAccelerateStatus;
}
export declare const Type: {
  readonly AmazonCustomerByEmail: "AmazonCustomerByEmail";
  readonly CanonicalUser: "CanonicalUser";
  readonly Group: "Group";
};
export type Type = (typeof Type)[keyof typeof Type];
export interface Grantee {
  DisplayName?: string;
  EmailAddress?: string;
  ID?: string;
  URI?: string;
  Type: Type | undefined;
}
export declare const Permission: {
  readonly FULL_CONTROL: "FULL_CONTROL";
  readonly READ: "READ";
  readonly READ_ACP: "READ_ACP";
  readonly WRITE: "WRITE";
  readonly WRITE_ACP: "WRITE_ACP";
};
export type Permission = (typeof Permission)[keyof typeof Permission];
export interface Grant {
  Grantee?: Grantee;
  Permission?: Permission;
}
export interface Owner {
  DisplayName?: string;
  ID?: string;
}
export interface AccessControlPolicy {
  Grants?: Grant[];
  Owner?: Owner;
}
export declare const OwnerOverride: {
  readonly Destination: "Destination";
};
export type OwnerOverride = (typeof OwnerOverride)[keyof typeof OwnerOverride];
export interface AccessControlTranslation {
  Owner: OwnerOverride | undefined;
}
export declare const ServerSideEncryption: {
  readonly AES256: "AES256";
  readonly aws_kms: "aws:kms";
  readonly aws_kms_dsse: "aws:kms:dsse";
};
export type ServerSideEncryption =
  (typeof ServerSideEncryption)[keyof typeof ServerSideEncryption];
export interface CompleteMultipartUploadOutput {
  Location?: string;
  Bucket?: string;
  Key?: string;
  Expiration?: string;
  ETag?: string;
  ChecksumCRC32?: string;
  ChecksumCRC32C?: string;
  ChecksumSHA1?: string;
  ChecksumSHA256?: string;
  ServerSideEncryption?: ServerSideEncryption;
  VersionId?: string;
  SSEKMSKeyId?: string;
  BucketKeyEnabled?: boolean;
  RequestCharged?: RequestCharged;
}
export interface CompletedPart {
  ETag?: string;
  ChecksumCRC32?: string;
  ChecksumCRC32C?: string;
  ChecksumSHA1?: string;
  ChecksumSHA256?: string;
  PartNumber?: number;
}
export interface CompletedMultipartUpload {
  Parts?: CompletedPart[];
}
export interface CompleteMultipartUploadRequest {
  Bucket: string | undefined;
  Key: string | undefined;
  MultipartUpload?: CompletedMultipartUpload;
  UploadId: string | undefined;
  ChecksumCRC32?: string;
  ChecksumCRC32C?: string;
  ChecksumSHA1?: string;
  ChecksumSHA256?: string;
  RequestPayer?: RequestPayer;
  ExpectedBucketOwner?: string;
  IfNoneMatch?: string;
  SSECustomerAlgorithm?: string;
  SSECustomerKey?: string;
  SSECustomerKeyMD5?: string;
}
export interface CopyObjectResult {
  ETag?: string;
  LastModified?: Date;
  ChecksumCRC32?: string;
  ChecksumCRC32C?: string;
  ChecksumSHA1?: string;
  ChecksumSHA256?: string;
}
export interface CopyObjectOutput {
  CopyObjectResult?: CopyObjectResult;
  Expiration?: string;
  CopySourceVersionId?: string;
  VersionId?: string;
  ServerSideEncryption?: ServerSideEncryption;
  SSECustomerAlgorithm?: string;
  SSECustomerKeyMD5?: string;
  SSEKMSKeyId?: string;
  SSEKMSEncryptionContext?: string;
  BucketKeyEnabled?: boolean;
  RequestCharged?: RequestCharged;
}
export declare const ObjectCannedACL: {
  readonly authenticated_read: "authenticated-read";
  readonly aws_exec_read: "aws-exec-read";
  readonly bucket_owner_full_control: "bucket-owner-full-control";
  readonly bucket_owner_read: "bucket-owner-read";
  readonly private: "private";
  readonly public_read: "public-read";
  readonly public_read_write: "public-read-write";
};
export type ObjectCannedACL =
  (typeof ObjectCannedACL)[keyof typeof ObjectCannedACL];
export declare const ChecksumAlgorithm: {
  readonly CRC32: "CRC32";
  readonly CRC32C: "CRC32C";
  readonly SHA1: "SHA1";
  readonly SHA256: "SHA256";
};
export type ChecksumAlgorithm =
  (typeof ChecksumAlgorithm)[keyof typeof ChecksumAlgorithm];
export declare const MetadataDirective: {
  readonly COPY: "COPY";
  readonly REPLACE: "REPLACE";
};
export type MetadataDirective =
  (typeof MetadataDirective)[keyof typeof MetadataDirective];
export declare const ObjectLockLegalHoldStatus: {
  readonly OFF: "OFF";
  readonly ON: "ON";
};
export type ObjectLockLegalHoldStatus =
  (typeof ObjectLockLegalHoldStatus)[keyof typeof ObjectLockLegalHoldStatus];
export declare const ObjectLockMode: {
  readonly COMPLIANCE: "COMPLIANCE";
  readonly GOVERNANCE: "GOVERNANCE";
};
export type ObjectLockMode =
  (typeof ObjectLockMode)[keyof typeof ObjectLockMode];
export declare const StorageClass: {
  readonly DEEP_ARCHIVE: "DEEP_ARCHIVE";
  readonly EXPRESS_ONEZONE: "EXPRESS_ONEZONE";
  readonly GLACIER: "GLACIER";
  readonly GLACIER_IR: "GLACIER_IR";
  readonly INTELLIGENT_TIERING: "INTELLIGENT_TIERING";
  readonly ONEZONE_IA: "ONEZONE_IA";
  readonly OUTPOSTS: "OUTPOSTS";
  readonly REDUCED_REDUNDANCY: "REDUCED_REDUNDANCY";
  readonly SNOW: "SNOW";
  readonly STANDARD: "STANDARD";
  readonly STANDARD_IA: "STANDARD_IA";
};
export type StorageClass = (typeof StorageClass)[keyof typeof StorageClass];
export declare const TaggingDirective: {
  readonly COPY: "COPY";
  readonly REPLACE: "REPLACE";
};
export type TaggingDirective =
  (typeof TaggingDirective)[keyof typeof TaggingDirective];
export interface CopyObjectRequest {
  ACL?: ObjectCannedACL;
  Bucket: string | undefined;
  CacheControl?: string;
  ChecksumAlgorithm?: ChecksumAlgorithm;
  ContentDisposition?: string;
  ContentEncoding?: string;
  ContentLanguage?: string;
  ContentType?: string;
  CopySource: string | undefined;
  CopySourceIfMatch?: string;
  CopySourceIfModifiedSince?: Date;
  CopySourceIfNoneMatch?: string;
  CopySourceIfUnmodifiedSince?: Date;
  Expires?: Date;
  GrantFullControl?: string;
  GrantRead?: string;
  GrantReadACP?: string;
  GrantWriteACP?: string;
  Key: string | undefined;
  Metadata?: Record<string, string>;
  MetadataDirective?: MetadataDirective;
  TaggingDirective?: TaggingDirective;
  ServerSideEncryption?: ServerSideEncryption;
  StorageClass?: StorageClass;
  WebsiteRedirectLocation?: string;
  SSECustomerAlgorithm?: string;
  SSECustomerKey?: string;
  SSECustomerKeyMD5?: string;
  SSEKMSKeyId?: string;
  SSEKMSEncryptionContext?: string;
  BucketKeyEnabled?: boolean;
  CopySourceSSECustomerAlgorithm?: string;
  CopySourceSSECustomerKey?: string;
  CopySourceSSECustomerKeyMD5?: string;
  RequestPayer?: RequestPayer;
  Tagging?: string;
  ObjectLockMode?: ObjectLockMode;
  ObjectLockRetainUntilDate?: Date;
  ObjectLockLegalHoldStatus?: ObjectLockLegalHoldStatus;
  ExpectedBucketOwner?: string;
  ExpectedSourceBucketOwner?: string;
}
export declare class ObjectNotInActiveTierError extends __BaseException {
  readonly name: "ObjectNotInActiveTierError";
  readonly $fault: "client";
  constructor(
    opts: __ExceptionOptionType<ObjectNotInActiveTierError, __BaseException>
  );
}
export declare class BucketAlreadyExists extends __BaseException {
  readonly name: "BucketAlreadyExists";
  readonly $fault: "client";
  constructor(
    opts: __ExceptionOptionType<BucketAlreadyExists, __BaseException>
  );
}
export declare class BucketAlreadyOwnedByYou extends __BaseException {
  readonly name: "BucketAlreadyOwnedByYou";
  readonly $fault: "client";
  constructor(
    opts: __ExceptionOptionType<BucketAlreadyOwnedByYou, __BaseException>
  );
}
export interface CreateBucketOutput {
  Location?: string;
}
export declare const BucketCannedACL: {
  readonly authenticated_read: "authenticated-read";
  readonly private: "private";
  readonly public_read: "public-read";
  readonly public_read_write: "public-read-write";
};
export type BucketCannedACL =
  (typeof BucketCannedACL)[keyof typeof BucketCannedACL];
export declare const DataRedundancy: {
  readonly SingleAvailabilityZone: "SingleAvailabilityZone";
};
export type DataRedundancy =
  (typeof DataRedundancy)[keyof typeof DataRedundancy];
export declare const BucketType: {
  readonly Directory: "Directory";
};
export type BucketType = (typeof BucketType)[keyof typeof BucketType];
export interface BucketInfo {
  DataRedundancy?: DataRedundancy;
  Type?: BucketType;
}
export declare const LocationType: {
  readonly AvailabilityZone: "AvailabilityZone";
};
export type LocationType = (typeof LocationType)[keyof typeof LocationType];
export interface LocationInfo {
  Type?: LocationType;
  Name?: string;
}
export declare const BucketLocationConstraint: {
  readonly EU: "EU";
  readonly af_south_1: "af-south-1";
  readonly ap_east_1: "ap-east-1";
  readonly ap_northeast_1: "ap-northeast-1";
  readonly ap_northeast_2: "ap-northeast-2";
  readonly ap_northeast_3: "ap-northeast-3";
  readonly ap_south_1: "ap-south-1";
  readonly ap_south_2: "ap-south-2";
  readonly ap_southeast_1: "ap-southeast-1";
  readonly ap_southeast_2: "ap-southeast-2";
  readonly ap_southeast_3: "ap-southeast-3";
  readonly ca_central_1: "ca-central-1";
  readonly cn_north_1: "cn-north-1";
  readonly cn_northwest_1: "cn-northwest-1";
  readonly eu_central_1: "eu-central-1";
  readonly eu_north_1: "eu-north-1";
  readonly eu_south_1: "eu-south-1";
  readonly eu_south_2: "eu-south-2";
  readonly eu_west_1: "eu-west-1";
  readonly eu_west_2: "eu-west-2";
  readonly eu_west_3: "eu-west-3";
  readonly me_south_1: "me-south-1";
  readonly sa_east_1: "sa-east-1";
  readonly us_east_2: "us-east-2";
  readonly us_gov_east_1: "us-gov-east-1";
  readonly us_gov_west_1: "us-gov-west-1";
  readonly us_west_1: "us-west-1";
  readonly us_west_2: "us-west-2";
};
export type BucketLocationConstraint =
  (typeof BucketLocationConstraint)[keyof typeof BucketLocationConstraint];
export interface CreateBucketConfiguration {
  LocationConstraint?: BucketLocationConstraint;
  Location?: LocationInfo;
  Bucket?: BucketInfo;
}
export declare const ObjectOwnership: {
  readonly BucketOwnerEnforced: "BucketOwnerEnforced";
  readonly BucketOwnerPreferred: "BucketOwnerPreferred";
  readonly ObjectWriter: "ObjectWriter";
};
export type ObjectOwnership =
  (typeof ObjectOwnership)[keyof typeof ObjectOwnership];
export interface CreateBucketRequest {
  ACL?: BucketCannedACL;
  Bucket: string | undefined;
  CreateBucketConfiguration?: CreateBucketConfiguration;
  GrantFullControl?: string;
  GrantRead?: string;
  GrantReadACP?: string;
  GrantWrite?: string;
  GrantWriteACP?: string;
  ObjectLockEnabledForBucket?: boolean;
  ObjectOwnership?: ObjectOwnership;
}
export interface CreateMultipartUploadOutput {
  AbortDate?: Date;
  AbortRuleId?: string;
  Bucket?: string;
  Key?: string;
  UploadId?: string;
  ServerSideEncryption?: ServerSideEncryption;
  SSECustomerAlgorithm?: string;
  SSECustomerKeyMD5?: string;
  SSEKMSKeyId?: string;
  SSEKMSEncryptionContext?: string;
  BucketKeyEnabled?: boolean;
  RequestCharged?: RequestCharged;
  ChecksumAlgorithm?: ChecksumAlgorithm;
}
export interface CreateMultipartUploadRequest {
  ACL?: ObjectCannedACL;
  Bucket: string | undefined;
  CacheControl?: string;
  ContentDisposition?: string;
  ContentEncoding?: string;
  ContentLanguage?: string;
  ContentType?: string;
  Expires?: Date;
  GrantFullControl?: string;
  GrantRead?: string;
  GrantReadACP?: string;
  GrantWriteACP?: string;
  Key: string | undefined;
  Metadata?: Record<string, string>;
  ServerSideEncryption?: ServerSideEncryption;
  StorageClass?: StorageClass;
  WebsiteRedirectLocation?: string;
  SSECustomerAlgorithm?: string;
  SSECustomerKey?: string;
  SSECustomerKeyMD5?: string;
  SSEKMSKeyId?: string;
  SSEKMSEncryptionContext?: string;
  BucketKeyEnabled?: boolean;
  RequestPayer?: RequestPayer;
  Tagging?: string;
  ObjectLockMode?: ObjectLockMode;
  ObjectLockRetainUntilDate?: Date;
  ObjectLockLegalHoldStatus?: ObjectLockLegalHoldStatus;
  ExpectedBucketOwner?: string;
  ChecksumAlgorithm?: ChecksumAlgorithm;
}
export interface SessionCredentials {
  AccessKeyId: string | undefined;
  SecretAccessKey: string | undefined;
  SessionToken: string | undefined;
  Expiration: Date | undefined;
}
export interface CreateSessionOutput {
  ServerSideEncryption?: ServerSideEncryption;
  SSEKMSKeyId?: string;
  SSEKMSEncryptionContext?: string;
  BucketKeyEnabled?: boolean;
  Credentials: SessionCredentials | undefined;
}
export declare const SessionMode: {
  readonly ReadOnly: "ReadOnly";
  readonly ReadWrite: "ReadWrite";
};
export type SessionMode = (typeof SessionMode)[keyof typeof SessionMode];
export interface CreateSessionRequest {
  SessionMode?: SessionMode;
  Bucket: string | undefined;
  ServerSideEncryption?: ServerSideEncryption;
  SSEKMSKeyId?: string;
  SSEKMSEncryptionContext?: string;
  BucketKeyEnabled?: boolean;
}
export declare class NoSuchBucket extends __BaseException {
  readonly name: "NoSuchBucket";
  readonly $fault: "client";
  constructor(opts: __ExceptionOptionType<NoSuchBucket, __BaseException>);
}
export interface DeleteBucketRequest {
  Bucket: string | undefined;
  ExpectedBucketOwner?: string;
}
export interface DeleteBucketAnalyticsConfigurationRequest {
  Bucket: string | undefined;
  Id: string | undefined;
  ExpectedBucketOwner?: string;
}
export interface DeleteBucketCorsRequest {
  Bucket: string | undefined;
  ExpectedBucketOwner?: string;
}
export interface DeleteBucketEncryptionRequest {
  Bucket: string | undefined;
  ExpectedBucketOwner?: string;
}
export interface DeleteBucketIntelligentTieringConfigurationRequest {
  Bucket: string | undefined;
  Id: string | undefined;
}
export interface DeleteBucketInventoryConfigurationRequest {
  Bucket: string | undefined;
  Id: string | undefined;
  ExpectedBucketOwner?: string;
}
export interface DeleteBucketLifecycleRequest {
  Bucket: string | undefined;
  ExpectedBucketOwner?: string;
}
export interface DeleteBucketMetricsConfigurationRequest {
  Bucket: string | undefined;
  Id: string | undefined;
  ExpectedBucketOwner?: string;
}
export interface DeleteBucketOwnershipControlsRequest {
  Bucket: string | undefined;
  ExpectedBucketOwner?: string;
}
export interface DeleteBucketPolicyRequest {
  Bucket: string | undefined;
  ExpectedBucketOwner?: string;
}
export interface DeleteBucketReplicationRequest {
  Bucket: string | undefined;
  ExpectedBucketOwner?: string;
}
export interface DeleteBucketTaggingRequest {
  Bucket: string | undefined;
  ExpectedBucketOwner?: string;
}
export interface DeleteBucketWebsiteRequest {
  Bucket: string | undefined;
  ExpectedBucketOwner?: string;
}
export interface DeleteObjectOutput {
  DeleteMarker?: boolean;
  VersionId?: string;
  RequestCharged?: RequestCharged;
}
export interface DeleteObjectRequest {
  Bucket: string | undefined;
  Key: string | undefined;
  MFA?: string;
  VersionId?: string;
  RequestPayer?: RequestPayer;
  BypassGovernanceRetention?: boolean;
  ExpectedBucketOwner?: string;
}
export interface DeletedObject {
  Key?: string;
  VersionId?: string;
  DeleteMarker?: boolean;
  DeleteMarkerVersionId?: string;
}
export interface _Error {
  Key?: string;
  VersionId?: string;
  Code?: string;
  Message?: string;
}
export interface DeleteObjectsOutput {
  Deleted?: DeletedObject[];
  RequestCharged?: RequestCharged;
  Errors?: _Error[];
}
export interface ObjectIdentifier {
  Key: string | undefined;
  VersionId?: string;
}
export interface Delete {
  Objects: ObjectIdentifier[] | undefined;
  Quiet?: boolean;
}
export interface DeleteObjectsRequest {
  Bucket: string | undefined;
  Delete: Delete | undefined;
  MFA?: string;
  RequestPayer?: RequestPayer;
  BypassGovernanceRetention?: boolean;
  ExpectedBucketOwner?: string;
  ChecksumAlgorithm?: ChecksumAlgorithm;
}
export interface DeleteObjectTaggingOutput {
  VersionId?: string;
}
export interface DeleteObjectTaggingRequest {
  Bucket: string | undefined;
  Key: string | undefined;
  VersionId?: string;
  ExpectedBucketOwner?: string;
}
export interface DeletePublicAccessBlockRequest {
  Bucket: string | undefined;
  ExpectedBucketOwner?: string;
}
export interface GetBucketAccelerateConfigurationOutput {
  Status?: BucketAccelerateStatus;
  RequestCharged?: RequestCharged;
}
export interface GetBucketAccelerateConfigurationRequest {
  Bucket: string | undefined;
  ExpectedBucketOwner?: string;
  RequestPayer?: RequestPayer;
}
export interface GetBucketAclOutput {
  Owner?: Owner;
  Grants?: Grant[];
}
export interface GetBucketAclRequest {
  Bucket: string | undefined;
  ExpectedBucketOwner?: string;
}
export interface Tag {
  Key: string | undefined;
  Value: string | undefined;
}
export interface AnalyticsAndOperator {
  Prefix?: string;
  Tags?: Tag[];
}
export type AnalyticsFilter =
  | AnalyticsFilter.AndMember
  | AnalyticsFilter.PrefixMember
  | AnalyticsFilter.TagMember
  | AnalyticsFilter.$UnknownMember;
export declare namespace AnalyticsFilter {
  interface PrefixMember {
    Prefix: string;
    Tag?: never;
    And?: never;
    $unknown?: never;
  }
  interface TagMember {
    Prefix?: never;
    Tag: Tag;
    And?: never;
    $unknown?: never;
  }
  interface AndMember {
    Prefix?: never;
    Tag?: never;
    And: AnalyticsAndOperator;
    $unknown?: never;
  }
  interface $UnknownMember {
    Prefix?: never;
    Tag?: never;
    And?: never;
    $unknown: [string, any];
  }
  interface Visitor<T> {
    Prefix: (value: string) => T;
    Tag: (value: Tag) => T;
    And: (value: AnalyticsAndOperator) => T;
    _: (name: string, value: any) => T;
  }
  const visit: <T>(value: AnalyticsFilter, visitor: Visitor<T>) => T;
}
export declare const AnalyticsS3ExportFileFormat: {
  readonly CSV: "CSV";
};
export type AnalyticsS3ExportFileFormat =
  (typeof AnalyticsS3ExportFileFormat)[keyof typeof AnalyticsS3ExportFileFormat];
export interface AnalyticsS3BucketDestination {
  Format: AnalyticsS3ExportFileFormat | undefined;
  BucketAccountId?: string;
  Bucket: string | undefined;
  Prefix?: string;
}
export interface AnalyticsExportDestination {
  S3BucketDestination: AnalyticsS3BucketDestination | undefined;
}
export declare const StorageClassAnalysisSchemaVersion: {
  readonly V_1: "V_1";
};
export type StorageClassAnalysisSchemaVersion =
  (typeof StorageClassAnalysisSchemaVersion)[keyof typeof StorageClassAnalysisSchemaVersion];
export interface StorageClassAnalysisDataExport {
  OutputSchemaVersion: StorageClassAnalysisSchemaVersion | undefined;
  Destination: AnalyticsExportDestination | undefined;
}
export interface StorageClassAnalysis {
  DataExport?: StorageClassAnalysisDataExport;
}
export interface AnalyticsConfiguration {
  Id: string | undefined;
  Filter?: AnalyticsFilter;
  StorageClassAnalysis: StorageClassAnalysis | undefined;
}
export interface GetBucketAnalyticsConfigurationOutput {
  AnalyticsConfiguration?: AnalyticsConfiguration;
}
export interface GetBucketAnalyticsConfigurationRequest {
  Bucket: string | undefined;
  Id: string | undefined;
  ExpectedBucketOwner?: string;
}
export interface CORSRule {
  ID?: string;
  AllowedHeaders?: string[];
  AllowedMethods: string[] | undefined;
  AllowedOrigins: string[] | undefined;
  ExposeHeaders?: string[];
  MaxAgeSeconds?: number;
}
export interface GetBucketCorsOutput {
  CORSRules?: CORSRule[];
}
export interface GetBucketCorsRequest {
  Bucket: string | undefined;
  ExpectedBucketOwner?: string;
}
export interface ServerSideEncryptionByDefault {
  SSEAlgorithm: ServerSideEncryption | undefined;
  KMSMasterKeyID?: string;
}
export interface ServerSideEncryptionRule {
  ApplyServerSideEncryptionByDefault?: ServerSideEncryptionByDefault;
  BucketKeyEnabled?: boolean;
}
export interface ServerSideEncryptionConfiguration {
  Rules: ServerSideEncryptionRule[] | undefined;
}
export interface GetBucketEncryptionOutput {
  ServerSideEncryptionConfiguration?: ServerSideEncryptionConfiguration;
}
export interface GetBucketEncryptionRequest {
  Bucket: string | undefined;
  ExpectedBucketOwner?: string;
}
export interface IntelligentTieringAndOperator {
  Prefix?: string;
  Tags?: Tag[];
}
export interface IntelligentTieringFilter {
  Prefix?: string;
  Tag?: Tag;
  And?: IntelligentTieringAndOperator;
}
export declare const IntelligentTieringStatus: {
  readonly Disabled: "Disabled";
  readonly Enabled: "Enabled";
};
export type IntelligentTieringStatus =
  (typeof IntelligentTieringStatus)[keyof typeof IntelligentTieringStatus];
export declare const IntelligentTieringAccessTier: {
  readonly ARCHIVE_ACCESS: "ARCHIVE_ACCESS";
  readonly DEEP_ARCHIVE_ACCESS: "DEEP_ARCHIVE_ACCESS";
};
export type IntelligentTieringAccessTier =
  (typeof IntelligentTieringAccessTier)[keyof typeof IntelligentTieringAccessTier];
export interface Tiering {
  Days: number | undefined;
  AccessTier: IntelligentTieringAccessTier | undefined;
}
export interface IntelligentTieringConfiguration {
  Id: string | undefined;
  Filter?: IntelligentTieringFilter;
  Status: IntelligentTieringStatus | undefined;
  Tierings: Tiering[] | undefined;
}
export interface GetBucketIntelligentTieringConfigurationOutput {
  IntelligentTieringConfiguration?: IntelligentTieringConfiguration;
}
export interface GetBucketIntelligentTieringConfigurationRequest {
  Bucket: string | undefined;
  Id: string | undefined;
}
export interface SSEKMS {
  KeyId: string | undefined;
}
export interface SSES3 {}
export interface InventoryEncryption {
  SSES3?: SSES3;
  SSEKMS?: SSEKMS;
}
export declare const InventoryFormat: {
  readonly CSV: "CSV";
  readonly ORC: "ORC";
  readonly Parquet: "Parquet";
};
export type InventoryFormat =
  (typeof InventoryFormat)[keyof typeof InventoryFormat];
export interface InventoryS3BucketDestination {
  AccountId?: string;
  Bucket: string | undefined;
  Format: InventoryFormat | undefined;
  Prefix?: string;
  Encryption?: InventoryEncryption;
}
export interface InventoryDestination {
  S3BucketDestination: InventoryS3BucketDestination | undefined;
}
export interface InventoryFilter {
  Prefix: string | undefined;
}
export declare const InventoryIncludedObjectVersions: {
  readonly All: "All";
  readonly Current: "Current";
};
export type InventoryIncludedObjectVersions =
  (typeof InventoryIncludedObjectVersions)[keyof typeof InventoryIncludedObjectVersions];
export declare const InventoryOptionalField: {
  readonly BucketKeyStatus: "BucketKeyStatus";
  readonly ChecksumAlgorithm: "ChecksumAlgorithm";
  readonly ETag: "ETag";
  readonly EncryptionStatus: "EncryptionStatus";
  readonly IntelligentTieringAccessTier: "IntelligentTieringAccessTier";
  readonly IsMultipartUploaded: "IsMultipartUploaded";
  readonly LastModifiedDate: "LastModifiedDate";
  readonly ObjectAccessControlList: "ObjectAccessControlList";
  readonly ObjectLockLegalHoldStatus: "ObjectLockLegalHoldStatus";
  readonly ObjectLockMode: "ObjectLockMode";
  readonly ObjectLockRetainUntilDate: "ObjectLockRetainUntilDate";
  readonly ObjectOwner: "ObjectOwner";
  readonly ReplicationStatus: "ReplicationStatus";
  readonly Size: "Size";
  readonly StorageClass: "StorageClass";
};
export type InventoryOptionalField =
  (typeof InventoryOptionalField)[keyof typeof InventoryOptionalField];
export declare const InventoryFrequency: {
  readonly Daily: "Daily";
  readonly Weekly: "Weekly";
};
export type InventoryFrequency =
  (typeof InventoryFrequency)[keyof typeof InventoryFrequency];
export interface InventorySchedule {
  Frequency: InventoryFrequency | undefined;
}
export interface InventoryConfiguration {
  Destination: InventoryDestination | undefined;
  IsEnabled: boolean | undefined;
  Filter?: InventoryFilter;
  Id: string | undefined;
  IncludedObjectVersions: InventoryIncludedObjectVersions | undefined;
  OptionalFields?: InventoryOptionalField[];
  Schedule: InventorySchedule | undefined;
}
export interface GetBucketInventoryConfigurationOutput {
  InventoryConfiguration?: InventoryConfiguration;
}
export interface GetBucketInventoryConfigurationRequest {
  Bucket: string | undefined;
  Id: string | undefined;
  ExpectedBucketOwner?: string;
}
export interface LifecycleExpiration {
  Date?: Date;
  Days?: number;
  ExpiredObjectDeleteMarker?: boolean;
}
export interface LifecycleRuleAndOperator {
  Prefix?: string;
  Tags?: Tag[];
  ObjectSizeGreaterThan?: number;
  ObjectSizeLessThan?: number;
}
export type LifecycleRuleFilter =
  | LifecycleRuleFilter.AndMember
  | LifecycleRuleFilter.ObjectSizeGreaterThanMember
  | LifecycleRuleFilter.ObjectSizeLessThanMember
  | LifecycleRuleFilter.PrefixMember
  | LifecycleRuleFilter.TagMember
  | LifecycleRuleFilter.$UnknownMember;
export declare namespace LifecycleRuleFilter {
  interface PrefixMember {
    Prefix: string;
    Tag?: never;
    ObjectSizeGreaterThan?: never;
    ObjectSizeLessThan?: never;
    And?: never;
    $unknown?: never;
  }
  interface TagMember {
    Prefix?: never;
    Tag: Tag;
    ObjectSizeGreaterThan?: never;
    ObjectSizeLessThan?: never;
    And?: never;
    $unknown?: never;
  }
  interface ObjectSizeGreaterThanMember {
    Prefix?: never;
    Tag?: never;
    ObjectSizeGreaterThan: number;
    ObjectSizeLessThan?: never;
    And?: never;
    $unknown?: never;
  }
  interface ObjectSizeLessThanMember {
    Prefix?: never;
    Tag?: never;
    ObjectSizeGreaterThan?: never;
    ObjectSizeLessThan: number;
    And?: never;
    $unknown?: never;
  }
  interface AndMember {
    Prefix?: never;
    Tag?: never;
    ObjectSizeGreaterThan?: never;
    ObjectSizeLessThan?: never;
    And: LifecycleRuleAndOperator;
    $unknown?: never;
  }
  interface $UnknownMember {
    Prefix?: never;
    Tag?: never;
    ObjectSizeGreaterThan?: never;
    ObjectSizeLessThan?: never;
    And?: never;
    $unknown: [string, any];
  }
  interface Visitor<T> {
    Prefix: (value: string) => T;
    Tag: (value: Tag) => T;
    ObjectSizeGreaterThan: (value: number) => T;
    ObjectSizeLessThan: (value: number) => T;
    And: (value: LifecycleRuleAndOperator) => T;
    _: (name: string, value: any) => T;
  }
  const visit: <T>(value: LifecycleRuleFilter, visitor: Visitor<T>) => T;
}
export interface NoncurrentVersionExpiration {
  NoncurrentDays?: number;
  NewerNoncurrentVersions?: number;
}
export declare const TransitionStorageClass: {
  readonly DEEP_ARCHIVE: "DEEP_ARCHIVE";
  readonly GLACIER: "GLACIER";
  readonly GLACIER_IR: "GLACIER_IR";
  readonly INTELLIGENT_TIERING: "INTELLIGENT_TIERING";
  readonly ONEZONE_IA: "ONEZONE_IA";
  readonly STANDARD_IA: "STANDARD_IA";
};
export type TransitionStorageClass =
  (typeof TransitionStorageClass)[keyof typeof TransitionStorageClass];
export interface NoncurrentVersionTransition {
  NoncurrentDays?: number;
  StorageClass?: TransitionStorageClass;
  NewerNoncurrentVersions?: number;
}
export declare const ExpirationStatus: {
  readonly Disabled: "Disabled";
  readonly Enabled: "Enabled";
};
export type ExpirationStatus =
  (typeof ExpirationStatus)[keyof typeof ExpirationStatus];
export interface Transition {
  Date?: Date;
  Days?: number;
  StorageClass?: TransitionStorageClass;
}
export interface LifecycleRule {
  Expiration?: LifecycleExpiration;
  ID?: string;
  Prefix?: string;
  Filter?: LifecycleRuleFilter;
  Status: ExpirationStatus | undefined;
  Transitions?: Transition[];
  NoncurrentVersionTransitions?: NoncurrentVersionTransition[];
  NoncurrentVersionExpiration?: NoncurrentVersionExpiration;
  AbortIncompleteMultipartUpload?: AbortIncompleteMultipartUpload;
}
export declare const TransitionDefaultMinimumObjectSize: {
  readonly all_storage_classes_128K: "all_storage_classes_128K";
  readonly varies_by_storage_class: "varies_by_storage_class";
};
export type TransitionDefaultMinimumObjectSize =
  (typeof TransitionDefaultMinimumObjectSize)[keyof typeof TransitionDefaultMinimumObjectSize];
export interface GetBucketLifecycleConfigurationOutput {
  Rules?: LifecycleRule[];
  TransitionDefaultMinimumObjectSize?: TransitionDefaultMinimumObjectSize;
}
export interface GetBucketLifecycleConfigurationRequest {
  Bucket: string | undefined;
  ExpectedBucketOwner?: string;
}
export interface GetBucketLocationOutput {
  LocationConstraint?: BucketLocationConstraint;
}
export interface GetBucketLocationRequest {
  Bucket: string | undefined;
  ExpectedBucketOwner?: string;
}
export declare const BucketLogsPermission: {
  readonly FULL_CONTROL: "FULL_CONTROL";
  readonly READ: "READ";
  readonly WRITE: "WRITE";
};
export type BucketLogsPermission =
  (typeof BucketLogsPermission)[keyof typeof BucketLogsPermission];
export interface TargetGrant {
  Grantee?: Grantee;
  Permission?: BucketLogsPermission;
}
export declare const PartitionDateSource: {
  readonly DeliveryTime: "DeliveryTime";
  readonly EventTime: "EventTime";
};
export type PartitionDateSource =
  (typeof PartitionDateSource)[keyof typeof PartitionDateSource];
export interface PartitionedPrefix {
  PartitionDateSource?: PartitionDateSource;
}
export interface SimplePrefix {}
export interface TargetObjectKeyFormat {
  SimplePrefix?: SimplePrefix;
  PartitionedPrefix?: PartitionedPrefix;
}
export interface LoggingEnabled {
  TargetBucket: string | undefined;
  TargetGrants?: TargetGrant[];
  TargetPrefix: string | undefined;
  TargetObjectKeyFormat?: TargetObjectKeyFormat;
}
export interface GetBucketLoggingOutput {
  LoggingEnabled?: LoggingEnabled;
}
export interface GetBucketLoggingRequest {
  Bucket: string | undefined;
  ExpectedBucketOwner?: string;
}
export interface MetricsAndOperator {
  Prefix?: string;
  Tags?: Tag[];
  AccessPointArn?: string;
}
export type MetricsFilter =
  | MetricsFilter.AccessPointArnMember
  | MetricsFilter.AndMember
  | MetricsFilter.PrefixMember
  | MetricsFilter.TagMember
  | MetricsFilter.$UnknownMember;
export declare namespace MetricsFilter {
  interface PrefixMember {
    Prefix: string;
    Tag?: never;
    AccessPointArn?: never;
    And?: never;
    $unknown?: never;
  }
  interface TagMember {
    Prefix?: never;
    Tag: Tag;
    AccessPointArn?: never;
    And?: never;
    $unknown?: never;
  }
  interface AccessPointArnMember {
    Prefix?: never;
    Tag?: never;
    AccessPointArn: string;
    And?: never;
    $unknown?: never;
  }
  interface AndMember {
    Prefix?: never;
    Tag?: never;
    AccessPointArn?: never;
    And: MetricsAndOperator;
    $unknown?: never;
  }
  interface $UnknownMember {
    Prefix?: never;
    Tag?: never;
    AccessPointArn?: never;
    And?: never;
    $unknown: [string, any];
  }
  interface Visitor<T> {
    Prefix: (value: string) => T;
    Tag: (value: Tag) => T;
    AccessPointArn: (value: string) => T;
    And: (value: MetricsAndOperator) => T;
    _: (name: string, value: any) => T;
  }
  const visit: <T>(value: MetricsFilter, visitor: Visitor<T>) => T;
}
export interface MetricsConfiguration {
  Id: string | undefined;
  Filter?: MetricsFilter;
}
export interface GetBucketMetricsConfigurationOutput {
  MetricsConfiguration?: MetricsConfiguration;
}
export interface GetBucketMetricsConfigurationRequest {
  Bucket: string | undefined;
  Id: string | undefined;
  ExpectedBucketOwner?: string;
}
export interface GetBucketNotificationConfigurationRequest {
  Bucket: string | undefined;
  ExpectedBucketOwner?: string;
}
export interface EventBridgeConfiguration {}
export declare const Event: {
  readonly s3_IntelligentTiering: "s3:IntelligentTiering";
  readonly s3_LifecycleExpiration_: "s3:LifecycleExpiration:*";
  readonly s3_LifecycleExpiration_Delete: "s3:LifecycleExpiration:Delete";
  readonly s3_LifecycleExpiration_DeleteMarkerCreated: "s3:LifecycleExpiration:DeleteMarkerCreated";
  readonly s3_LifecycleTransition: "s3:LifecycleTransition";
  readonly s3_ObjectAcl_Put: "s3:ObjectAcl:Put";
  readonly s3_ObjectCreated_: "s3:ObjectCreated:*";
  readonly s3_ObjectCreated_CompleteMultipartUpload: "s3:ObjectCreated:CompleteMultipartUpload";
  readonly s3_ObjectCreated_Copy: "s3:ObjectCreated:Copy";
  readonly s3_ObjectCreated_Post: "s3:ObjectCreated:Post";
  readonly s3_ObjectCreated_Put: "s3:ObjectCreated:Put";
  readonly s3_ObjectRemoved_: "s3:ObjectRemoved:*";
  readonly s3_ObjectRemoved_Delete: "s3:ObjectRemoved:Delete";
  readonly s3_ObjectRemoved_DeleteMarkerCreated: "s3:ObjectRemoved:DeleteMarkerCreated";
  readonly s3_ObjectRestore_: "s3:ObjectRestore:*";
  readonly s3_ObjectRestore_Completed: "s3:ObjectRestore:Completed";
  readonly s3_ObjectRestore_Delete: "s3:ObjectRestore:Delete";
  readonly s3_ObjectRestore_Post: "s3:ObjectRestore:Post";
  readonly s3_ObjectTagging_: "s3:ObjectTagging:*";
  readonly s3_ObjectTagging_Delete: "s3:ObjectTagging:Delete";
  readonly s3_ObjectTagging_Put: "s3:ObjectTagging:Put";
  readonly s3_ReducedRedundancyLostObject: "s3:ReducedRedundancyLostObject";
  readonly s3_Replication_: "s3:Replication:*";
  readonly s3_Replication_OperationFailedReplication: "s3:Replication:OperationFailedReplication";
  readonly s3_Replication_OperationMissedThreshold: "s3:Replication:OperationMissedThreshold";
  readonly s3_Replication_OperationNotTracked: "s3:Replication:OperationNotTracked";
  readonly s3_Replication_OperationReplicatedAfterThreshold: "s3:Replication:OperationReplicatedAfterThreshold";
};
export type Event = (typeof Event)[keyof typeof Event];
export declare const FilterRuleName: {
  readonly prefix: "prefix";
  readonly suffix: "suffix";
};
export type FilterRuleName =
  (typeof FilterRuleName)[keyof typeof FilterRuleName];
export interface FilterRule {
  Name?: FilterRuleName;
  Value?: string;
}
export interface S3KeyFilter {
  FilterRules?: FilterRule[];
}
export interface NotificationConfigurationFilter {
  Key?: S3KeyFilter;
}
export interface LambdaFunctionConfiguration {
  Id?: string;
  LambdaFunctionArn: string | undefined;
  Events: Event[] | undefined;
  Filter?: NotificationConfigurationFilter;
}
export interface QueueConfiguration {
  Id?: string;
  QueueArn: string | undefined;
  Events: Event[] | undefined;
  Filter?: NotificationConfigurationFilter;
}
export interface TopicConfiguration {
  Id?: string;
  TopicArn: string | undefined;
  Events: Event[] | undefined;
  Filter?: NotificationConfigurationFilter;
}
export interface NotificationConfiguration {
  TopicConfigurations?: TopicConfiguration[];
  QueueConfigurations?: QueueConfiguration[];
  LambdaFunctionConfigurations?: LambdaFunctionConfiguration[];
  EventBridgeConfiguration?: EventBridgeConfiguration;
}
export interface OwnershipControlsRule {
  ObjectOwnership: ObjectOwnership | undefined;
}
export interface OwnershipControls {
  Rules: OwnershipControlsRule[] | undefined;
}
export interface GetBucketOwnershipControlsOutput {
  OwnershipControls?: OwnershipControls;
}
export interface GetBucketOwnershipControlsRequest {
  Bucket: string | undefined;
  ExpectedBucketOwner?: string;
}
export interface GetBucketPolicyOutput {
  Policy?: string;
}
export interface GetBucketPolicyRequest {
  Bucket: string | undefined;
  ExpectedBucketOwner?: string;
}
export interface PolicyStatus {
  IsPublic?: boolean;
}
export interface GetBucketPolicyStatusOutput {
  PolicyStatus?: PolicyStatus;
}
export interface GetBucketPolicyStatusRequest {
  Bucket: string | undefined;
  ExpectedBucketOwner?: string;
}
export declare const DeleteMarkerReplicationStatus: {
  readonly Disabled: "Disabled";
  readonly Enabled: "Enabled";
};
export type DeleteMarkerReplicationStatus =
  (typeof DeleteMarkerReplicationStatus)[keyof typeof DeleteMarkerReplicationStatus];
export interface DeleteMarkerReplication {
  Status?: DeleteMarkerReplicationStatus;
}
export interface EncryptionConfiguration {
  ReplicaKmsKeyID?: string;
}
export interface ReplicationTimeValue {
  Minutes?: number;
}
export declare const MetricsStatus: {
  readonly Disabled: "Disabled";
  readonly Enabled: "Enabled";
};
export type MetricsStatus = (typeof MetricsStatus)[keyof typeof MetricsStatus];
export interface Metrics {
  Status: MetricsStatus | undefined;
  EventThreshold?: ReplicationTimeValue;
}
export declare const ReplicationTimeStatus: {
  readonly Disabled: "Disabled";
  readonly Enabled: "Enabled";
};
export type ReplicationTimeStatus =
  (typeof ReplicationTimeStatus)[keyof typeof ReplicationTimeStatus];
export interface ReplicationTime {
  Status: ReplicationTimeStatus | undefined;
  Time: ReplicationTimeValue | undefined;
}
export interface Destination {
  Bucket: string | undefined;
  Account?: string;
  StorageClass?: StorageClass;
  AccessControlTranslation?: AccessControlTranslation;
  EncryptionConfiguration?: EncryptionConfiguration;
  ReplicationTime?: ReplicationTime;
  Metrics?: Metrics;
}
export declare const ExistingObjectReplicationStatus: {
  readonly Disabled: "Disabled";
  readonly Enabled: "Enabled";
};
export type ExistingObjectReplicationStatus =
  (typeof ExistingObjectReplicationStatus)[keyof typeof ExistingObjectReplicationStatus];
export interface ExistingObjectReplication {
  Status: ExistingObjectReplicationStatus | undefined;
}
export interface ReplicationRuleAndOperator {
  Prefix?: string;
  Tags?: Tag[];
}
export type ReplicationRuleFilter =
  | ReplicationRuleFilter.AndMember
  | ReplicationRuleFilter.PrefixMember
  | ReplicationRuleFilter.TagMember
  | ReplicationRuleFilter.$UnknownMember;
export declare namespace ReplicationRuleFilter {
  interface PrefixMember {
    Prefix: string;
    Tag?: never;
    And?: never;
    $unknown?: never;
  }
  interface TagMember {
    Prefix?: never;
    Tag: Tag;
    And?: never;
    $unknown?: never;
  }
  interface AndMember {
    Prefix?: never;
    Tag?: never;
    And: ReplicationRuleAndOperator;
    $unknown?: never;
  }
  interface $UnknownMember {
    Prefix?: never;
    Tag?: never;
    And?: never;
    $unknown: [string, any];
  }
  interface Visitor<T> {
    Prefix: (value: string) => T;
    Tag: (value: Tag) => T;
    And: (value: ReplicationRuleAndOperator) => T;
    _: (name: string, value: any) => T;
  }
  const visit: <T>(value: ReplicationRuleFilter, visitor: Visitor<T>) => T;
}
export declare const ReplicaModificationsStatus: {
  readonly Disabled: "Disabled";
  readonly Enabled: "Enabled";
};
export type ReplicaModificationsStatus =
  (typeof ReplicaModificationsStatus)[keyof typeof ReplicaModificationsStatus];
export interface ReplicaModifications {
  Status: ReplicaModificationsStatus | undefined;
}
export declare const SseKmsEncryptedObjectsStatus: {
  readonly Disabled: "Disabled";
  readonly Enabled: "Enabled";
};
export type SseKmsEncryptedObjectsStatus =
  (typeof SseKmsEncryptedObjectsStatus)[keyof typeof SseKmsEncryptedObjectsStatus];
export interface SseKmsEncryptedObjects {
  Status: SseKmsEncryptedObjectsStatus | undefined;
}
export interface SourceSelectionCriteria {
  SseKmsEncryptedObjects?: SseKmsEncryptedObjects;
  ReplicaModifications?: ReplicaModifications;
}
export declare const ReplicationRuleStatus: {
  readonly Disabled: "Disabled";
  readonly Enabled: "Enabled";
};
export type ReplicationRuleStatus =
  (typeof ReplicationRuleStatus)[keyof typeof ReplicationRuleStatus];
export interface ReplicationRule {
  ID?: string;
  Priority?: number;
  Prefix?: string;
  Filter?: ReplicationRuleFilter;
  Status: ReplicationRuleStatus | undefined;
  SourceSelectionCriteria?: SourceSelectionCriteria;
  ExistingObjectReplication?: ExistingObjectReplication;
  Destination: Destination | undefined;
  DeleteMarkerReplication?: DeleteMarkerReplication;
}
export interface ReplicationConfiguration {
  Role: string | undefined;
  Rules: ReplicationRule[] | undefined;
}
export interface GetBucketReplicationOutput {
  ReplicationConfiguration?: ReplicationConfiguration;
}
export interface GetBucketReplicationRequest {
  Bucket: string | undefined;
  ExpectedBucketOwner?: string;
}
export declare const Payer: {
  readonly BucketOwner: "BucketOwner";
  readonly Requester: "Requester";
};
export type Payer = (typeof Payer)[keyof typeof Payer];
export interface GetBucketRequestPaymentOutput {
  Payer?: Payer;
}
export interface GetBucketRequestPaymentRequest {
  Bucket: string | undefined;
  ExpectedBucketOwner?: string;
}
export interface GetBucketTaggingOutput {
  TagSet: Tag[] | undefined;
}
export interface GetBucketTaggingRequest {
  Bucket: string | undefined;
  ExpectedBucketOwner?: string;
}
export declare const MFADeleteStatus: {
  readonly Disabled: "Disabled";
  readonly Enabled: "Enabled";
};
export type MFADeleteStatus =
  (typeof MFADeleteStatus)[keyof typeof MFADeleteStatus];
export declare const BucketVersioningStatus: {
  readonly Enabled: "Enabled";
  readonly Suspended: "Suspended";
};
export type BucketVersioningStatus =
  (typeof BucketVersioningStatus)[keyof typeof BucketVersioningStatus];
export interface GetBucketVersioningOutput {
  Status?: BucketVersioningStatus;
  MFADelete?: MFADeleteStatus;
}
export interface GetBucketVersioningRequest {
  Bucket: string | undefined;
  ExpectedBucketOwner?: string;
}
export interface ErrorDocument {
  Key: string | undefined;
}
export interface IndexDocument {
  Suffix: string | undefined;
}
export declare const Protocol: {
  readonly http: "http";
  readonly https: "https";
};
export type Protocol = (typeof Protocol)[keyof typeof Protocol];
export interface RedirectAllRequestsTo {
  HostName: string | undefined;
  Protocol?: Protocol;
}
export interface Condition {
  HttpErrorCodeReturnedEquals?: string;
  KeyPrefixEquals?: string;
}
export interface Redirect {
  HostName?: string;
  HttpRedirectCode?: string;
  Protocol?: Protocol;
  ReplaceKeyPrefixWith?: string;
  ReplaceKeyWith?: string;
}
export interface RoutingRule {
  Condition?: Condition;
  Redirect: Redirect | undefined;
}
export interface GetBucketWebsiteOutput {
  RedirectAllRequestsTo?: RedirectAllRequestsTo;
  IndexDocument?: IndexDocument;
  ErrorDocument?: ErrorDocument;
  RoutingRules?: RoutingRule[];
}
export interface GetBucketWebsiteRequest {
  Bucket: string | undefined;
  ExpectedBucketOwner?: string;
}
export declare const ReplicationStatus: {
  readonly COMPLETE: "COMPLETE";
  readonly COMPLETED: "COMPLETED";
  readonly FAILED: "FAILED";
  readonly PENDING: "PENDING";
  readonly REPLICA: "REPLICA";
};
export type ReplicationStatus =
  (typeof ReplicationStatus)[keyof typeof ReplicationStatus];
export interface GetObjectOutput {
  Body?: StreamingBlobTypes;
  DeleteMarker?: boolean;
  AcceptRanges?: string;
  Expiration?: string;
  Restore?: string;
  LastModified?: Date;
  ContentLength?: number;
  ETag?: string;
  ChecksumCRC32?: string;
  ChecksumCRC32C?: string;
  ChecksumSHA1?: string;
  ChecksumSHA256?: string;
  MissingMeta?: number;
  VersionId?: string;
  CacheControl?: string;
  ContentDisposition?: string;
  ContentEncoding?: string;
  ContentLanguage?: string;
  ContentRange?: string;
  ContentType?: string;
  Expires?: Date;
  ExpiresString?: string;
  WebsiteRedirectLocation?: string;
  ServerSideEncryption?: ServerSideEncryption;
  Metadata?: Record<string, string>;
  SSECustomerAlgorithm?: string;
  SSECustomerKeyMD5?: string;
  SSEKMSKeyId?: string;
  BucketKeyEnabled?: boolean;
  StorageClass?: StorageClass;
  RequestCharged?: RequestCharged;
  ReplicationStatus?: ReplicationStatus;
  PartsCount?: number;
  TagCount?: number;
  ObjectLockMode?: ObjectLockMode;
  ObjectLockRetainUntilDate?: Date;
  ObjectLockLegalHoldStatus?: ObjectLockLegalHoldStatus;
}
export declare const ChecksumMode: {
  readonly ENABLED: "ENABLED";
};
export type ChecksumMode = (typeof ChecksumMode)[keyof typeof ChecksumMode];
export interface GetObjectRequest {
  Bucket: string | undefined;
  IfMatch?: string;
  IfModifiedSince?: Date;
  IfNoneMatch?: string;
  IfUnmodifiedSince?: Date;
  Key: string | undefined;
  Range?: string;
  ResponseCacheControl?: string;
  ResponseContentDisposition?: string;
  ResponseContentEncoding?: string;
  ResponseContentLanguage?: string;
  ResponseContentType?: string;
  ResponseExpires?: Date;
  VersionId?: string;
  SSECustomerAlgorithm?: string;
  SSECustomerKey?: string;
  SSECustomerKeyMD5?: string;
  RequestPayer?: RequestPayer;
  PartNumber?: number;
  ExpectedBucketOwner?: string;
  ChecksumMode?: ChecksumMode;
}
export declare class InvalidObjectState extends __BaseException {
  readonly name: "InvalidObjectState";
  readonly $fault: "client";
  StorageClass?: StorageClass;
  AccessTier?: IntelligentTieringAccessTier;
  constructor(opts: __ExceptionOptionType<InvalidObjectState, __BaseException>);
}
export declare class NoSuchKey extends __BaseException {
  readonly name: "NoSuchKey";
  readonly $fault: "client";
  constructor(opts: __ExceptionOptionType<NoSuchKey, __BaseException>);
}
export interface GetObjectAclOutput {
  Owner?: Owner;
  Grants?: Grant[];
  RequestCharged?: RequestCharged;
}
export interface GetObjectAclRequest {
  Bucket: string | undefined;
  Key: string | undefined;
  VersionId?: string;
  RequestPayer?: RequestPayer;
  ExpectedBucketOwner?: string;
}
export interface Checksum {
  ChecksumCRC32?: string;
  ChecksumCRC32C?: string;
  ChecksumSHA1?: string;
  ChecksumSHA256?: string;
}
export interface ObjectPart {
  PartNumber?: number;
  Size?: number;
  ChecksumCRC32?: string;
  ChecksumCRC32C?: string;
  ChecksumSHA1?: string;
  ChecksumSHA256?: string;
}
export interface GetObjectAttributesParts {
  TotalPartsCount?: number;
  PartNumberMarker?: string;
  NextPartNumberMarker?: string;
  MaxParts?: number;
  IsTruncated?: boolean;
  Parts?: ObjectPart[];
}
export interface GetObjectAttributesOutput {
  DeleteMarker?: boolean;
  LastModified?: Date;
  VersionId?: string;
  RequestCharged?: RequestCharged;
  ETag?: string;
  Checksum?: Checksum;
  ObjectParts?: GetObjectAttributesParts;
  StorageClass?: StorageClass;
  ObjectSize?: number;
}
export declare const ObjectAttributes: {
  readonly CHECKSUM: "Checksum";
  readonly ETAG: "ETag";
  readonly OBJECT_PARTS: "ObjectParts";
  readonly OBJECT_SIZE: "ObjectSize";
  readonly STORAGE_CLASS: "StorageClass";
};
export type ObjectAttributes =
  (typeof ObjectAttributes)[keyof typeof ObjectAttributes];
export interface GetObjectAttributesRequest {
  Bucket: string | undefined;
  Key: string | undefined;
  VersionId?: string;
  MaxParts?: number;
  PartNumberMarker?: string;
  SSECustomerAlgorithm?: string;
  SSECustomerKey?: string;
  SSECustomerKeyMD5?: string;
  RequestPayer?: RequestPayer;
  ExpectedBucketOwner?: string;
  ObjectAttributes: ObjectAttributes[] | undefined;
}
export interface ObjectLockLegalHold {
  Status?: ObjectLockLegalHoldStatus;
}
export interface GetObjectLegalHoldOutput {
  LegalHold?: ObjectLockLegalHold;
}
export interface GetObjectLegalHoldRequest {
  Bucket: string | undefined;
  Key: string | undefined;
  VersionId?: string;
  RequestPayer?: RequestPayer;
  ExpectedBucketOwner?: string;
}
export declare const ObjectLockEnabled: {
  readonly Enabled: "Enabled";
};
export type ObjectLockEnabled =
  (typeof ObjectLockEnabled)[keyof typeof ObjectLockEnabled];
export declare const ObjectLockRetentionMode: {
  readonly COMPLIANCE: "COMPLIANCE";
  readonly GOVERNANCE: "GOVERNANCE";
};
export type ObjectLockRetentionMode =
  (typeof ObjectLockRetentionMode)[keyof typeof ObjectLockRetentionMode];
export interface DefaultRetention {
  Mode?: ObjectLockRetentionMode;
  Days?: number;
  Years?: number;
}
export interface ObjectLockRule {
  DefaultRetention?: DefaultRetention;
}
export interface ObjectLockConfiguration {
  ObjectLockEnabled?: ObjectLockEnabled;
  Rule?: ObjectLockRule;
}
export interface GetObjectLockConfigurationOutput {
  ObjectLockConfiguration?: ObjectLockConfiguration;
}
export interface GetObjectLockConfigurationRequest {
  Bucket: string | undefined;
  ExpectedBucketOwner?: string;
}
export interface ObjectLockRetention {
  Mode?: ObjectLockRetentionMode;
  RetainUntilDate?: Date;
}
export interface GetObjectRetentionOutput {
  Retention?: ObjectLockRetention;
}
export interface GetObjectRetentionRequest {
  Bucket: string | undefined;
  Key: string | undefined;
  VersionId?: string;
  RequestPayer?: RequestPayer;
  ExpectedBucketOwner?: string;
}
export interface GetObjectTaggingOutput {
  VersionId?: string;
  TagSet: Tag[] | undefined;
}
export interface GetObjectTaggingRequest {
  Bucket: string | undefined;
  Key: string | undefined;
  VersionId?: string;
  ExpectedBucketOwner?: string;
  RequestPayer?: RequestPayer;
}
export interface GetObjectTorrentOutput {
  Body?: StreamingBlobTypes;
  RequestCharged?: RequestCharged;
}
export interface GetObjectTorrentRequest {
  Bucket: string | undefined;
  Key: string | undefined;
  RequestPayer?: RequestPayer;
  ExpectedBucketOwner?: string;
}
export interface PublicAccessBlockConfiguration {
  BlockPublicAcls?: boolean;
  IgnorePublicAcls?: boolean;
  BlockPublicPolicy?: boolean;
  RestrictPublicBuckets?: boolean;
}
export interface GetPublicAccessBlockOutput {
  PublicAccessBlockConfiguration?: PublicAccessBlockConfiguration;
}
export interface GetPublicAccessBlockRequest {
  Bucket: string | undefined;
  ExpectedBucketOwner?: string;
}
export interface HeadBucketOutput {
  BucketLocationType?: LocationType;
  BucketLocationName?: string;
  BucketRegion?: string;
  AccessPointAlias?: boolean;
}
export interface HeadBucketRequest {
  Bucket: string | undefined;
  ExpectedBucketOwner?: string;
}
export declare class NotFound extends __BaseException {
  readonly name: "NotFound";
  readonly $fault: "client";
  constructor(opts: __ExceptionOptionType<NotFound, __BaseException>);
}
export declare const ArchiveStatus: {
  readonly ARCHIVE_ACCESS: "ARCHIVE_ACCESS";
  readonly DEEP_ARCHIVE_ACCESS: "DEEP_ARCHIVE_ACCESS";
};
export type ArchiveStatus = (typeof ArchiveStatus)[keyof typeof ArchiveStatus];
export interface HeadObjectOutput {
  DeleteMarker?: boolean;
  AcceptRanges?: string;
  Expiration?: string;
  Restore?: string;
  ArchiveStatus?: ArchiveStatus;
  LastModified?: Date;
  ContentLength?: number;
  ChecksumCRC32?: string;
  ChecksumCRC32C?: string;
  ChecksumSHA1?: string;
  ChecksumSHA256?: string;
  ETag?: string;
  MissingMeta?: number;
  VersionId?: string;
  CacheControl?: string;
  ContentDisposition?: string;
  ContentEncoding?: string;
  ContentLanguage?: string;
  ContentType?: string;
  Expires?: Date;
  ExpiresString?: string;
  WebsiteRedirectLocation?: string;
  ServerSideEncryption?: ServerSideEncryption;
  Metadata?: Record<string, string>;
  SSECustomerAlgorithm?: string;
  SSECustomerKeyMD5?: string;
  SSEKMSKeyId?: string;
  BucketKeyEnabled?: boolean;
  StorageClass?: StorageClass;
  RequestCharged?: RequestCharged;
  ReplicationStatus?: ReplicationStatus;
  PartsCount?: number;
  ObjectLockMode?: ObjectLockMode;
  ObjectLockRetainUntilDate?: Date;
  ObjectLockLegalHoldStatus?: ObjectLockLegalHoldStatus;
}
export interface HeadObjectRequest {
  Bucket: string | undefined;
  IfMatch?: string;
  IfModifiedSince?: Date;
  IfNoneMatch?: string;
  IfUnmodifiedSince?: Date;
  Key: string | undefined;
  Range?: string;
  ResponseCacheControl?: string;
  ResponseContentDisposition?: string;
  ResponseContentEncoding?: string;
  ResponseContentLanguage?: string;
  ResponseContentType?: string;
  ResponseExpires?: Date;
  VersionId?: string;
  SSECustomerAlgorithm?: string;
  SSECustomerKey?: string;
  SSECustomerKeyMD5?: string;
  RequestPayer?: RequestPayer;
  PartNumber?: number;
  ExpectedBucketOwner?: string;
  ChecksumMode?: ChecksumMode;
}
export interface ListBucketAnalyticsConfigurationsOutput {
  IsTruncated?: boolean;
  ContinuationToken?: string;
  NextContinuationToken?: string;
  AnalyticsConfigurationList?: AnalyticsConfiguration[];
}
export interface ListBucketAnalyticsConfigurationsRequest {
  Bucket: string | undefined;
  ContinuationToken?: string;
  ExpectedBucketOwner?: string;
}
export interface ListBucketIntelligentTieringConfigurationsOutput {
  IsTruncated?: boolean;
  ContinuationToken?: string;
  NextContinuationToken?: string;
  IntelligentTieringConfigurationList?: IntelligentTieringConfiguration[];
}
export interface ListBucketIntelligentTieringConfigurationsRequest {
  Bucket: string | undefined;
  ContinuationToken?: string;
}
export interface ListBucketInventoryConfigurationsOutput {
  ContinuationToken?: string;
  InventoryConfigurationList?: InventoryConfiguration[];
  IsTruncated?: boolean;
  NextContinuationToken?: string;
}
export interface ListBucketInventoryConfigurationsRequest {
  Bucket: string | undefined;
  ContinuationToken?: string;
  ExpectedBucketOwner?: string;
}
export interface ListBucketMetricsConfigurationsOutput {
  IsTruncated?: boolean;
  ContinuationToken?: string;
  NextContinuationToken?: string;
  MetricsConfigurationList?: MetricsConfiguration[];
}
export interface ListBucketMetricsConfigurationsRequest {
  Bucket: string | undefined;
  ContinuationToken?: string;
  ExpectedBucketOwner?: string;
}
export interface Bucket {
  Name?: string;
  CreationDate?: Date;
}
export interface ListBucketsOutput {
  Buckets?: Bucket[];
  Owner?: Owner;
  ContinuationToken?: string;
}
export interface ListBucketsRequest {
  MaxBuckets?: number;
  ContinuationToken?: string;
}
export interface ListDirectoryBucketsOutput {
  Buckets?: Bucket[];
  ContinuationToken?: string;
}
export interface ListDirectoryBucketsRequest {
  ContinuationToken?: string;
  MaxDirectoryBuckets?: number;
}
export interface CommonPrefix {
  Prefix?: string;
}
export declare const EncodingType: {
  readonly url: "url";
};
export type EncodingType = (typeof EncodingType)[keyof typeof EncodingType];
export interface Initiator {
  ID?: string;
  DisplayName?: string;
}
export interface MultipartUpload {
  UploadId?: string;
  Key?: string;
  Initiated?: Date;
  StorageClass?: StorageClass;
  Owner?: Owner;
  Initiator?: Initiator;
  ChecksumAlgorithm?: ChecksumAlgorithm;
}
export interface ListMultipartUploadsOutput {
  Bucket?: string;
  KeyMarker?: string;
  UploadIdMarker?: string;
  NextKeyMarker?: string;
  Prefix?: string;
  Delimiter?: string;
  NextUploadIdMarker?: string;
  MaxUploads?: number;
  IsTruncated?: boolean;
  Uploads?: MultipartUpload[];
  CommonPrefixes?: CommonPrefix[];
  EncodingType?: EncodingType;
  RequestCharged?: RequestCharged;
}
export interface ListMultipartUploadsRequest {
  Bucket: string | undefined;
  Delimiter?: string;
  EncodingType?: EncodingType;
  KeyMarker?: string;
  MaxUploads?: number;
  Prefix?: string;
  UploadIdMarker?: string;
  ExpectedBucketOwner?: string;
  RequestPayer?: RequestPayer;
}
export interface RestoreStatus {
  IsRestoreInProgress?: boolean;
  RestoreExpiryDate?: Date;
}
export declare const ObjectStorageClass: {
  readonly DEEP_ARCHIVE: "DEEP_ARCHIVE";
  readonly EXPRESS_ONEZONE: "EXPRESS_ONEZONE";
  readonly GLACIER: "GLACIER";
  readonly GLACIER_IR: "GLACIER_IR";
  readonly INTELLIGENT_TIERING: "INTELLIGENT_TIERING";
  readonly ONEZONE_IA: "ONEZONE_IA";
  readonly OUTPOSTS: "OUTPOSTS";
  readonly REDUCED_REDUNDANCY: "REDUCED_REDUNDANCY";
  readonly SNOW: "SNOW";
  readonly STANDARD: "STANDARD";
  readonly STANDARD_IA: "STANDARD_IA";
};
export type ObjectStorageClass =
  (typeof ObjectStorageClass)[keyof typeof ObjectStorageClass];
export interface _Object {
  Key?: string;
  LastModified?: Date;
  ETag?: string;
  ChecksumAlgorithm?: ChecksumAlgorithm[];
  Size?: number;
  StorageClass?: ObjectStorageClass;
  Owner?: Owner;
  RestoreStatus?: RestoreStatus;
}
export interface ListObjectsOutput {
  IsTruncated?: boolean;
  Marker?: string;
  NextMarker?: string;
  Contents?: _Object[];
  Name?: string;
  Prefix?: string;
  Delimiter?: string;
  MaxKeys?: number;
  CommonPrefixes?: CommonPrefix[];
  EncodingType?: EncodingType;
  RequestCharged?: RequestCharged;
}
export declare const OptionalObjectAttributes: {
  readonly RESTORE_STATUS: "RestoreStatus";
};
export type OptionalObjectAttributes =
  (typeof OptionalObjectAttributes)[keyof typeof OptionalObjectAttributes];
export interface ListObjectsRequest {
  Bucket: string | undefined;
  Delimiter?: string;
  EncodingType?: EncodingType;
  Marker?: string;
  MaxKeys?: number;
  Prefix?: string;
  RequestPayer?: RequestPayer;
  ExpectedBucketOwner?: string;
  OptionalObjectAttributes?: OptionalObjectAttributes[];
}
export interface ListObjectsV2Output {
  IsTruncated?: boolean;
  Contents?: _Object[];
  Name?: string;
  Prefix?: string;
  Delimiter?: string;
  MaxKeys?: number;
  CommonPrefixes?: CommonPrefix[];
  EncodingType?: EncodingType;
  KeyCount?: number;
  ContinuationToken?: string;
  NextContinuationToken?: string;
  StartAfter?: string;
  RequestCharged?: RequestCharged;
}
export interface ListObjectsV2Request {
  Bucket: string | undefined;
  Delimiter?: string;
  EncodingType?: EncodingType;
  MaxKeys?: number;
  Prefix?: string;
  ContinuationToken?: string;
  FetchOwner?: boolean;
  StartAfter?: string;
  RequestPayer?: RequestPayer;
  ExpectedBucketOwner?: string;
  OptionalObjectAttributes?: OptionalObjectAttributes[];
}
export interface DeleteMarkerEntry {
  Owner?: Owner;
  Key?: string;
  VersionId?: string;
  IsLatest?: boolean;
  LastModified?: Date;
}
export declare const ObjectVersionStorageClass: {
  readonly STANDARD: "STANDARD";
};
export type ObjectVersionStorageClass =
  (typeof ObjectVersionStorageClass)[keyof typeof ObjectVersionStorageClass];
export interface ObjectVersion {
  ETag?: string;
  ChecksumAlgorithm?: ChecksumAlgorithm[];
  Size?: number;
  StorageClass?: ObjectVersionStorageClass;
  Key?: string;
  VersionId?: string;
  IsLatest?: boolean;
  LastModified?: Date;
  Owner?: Owner;
  RestoreStatus?: RestoreStatus;
}
export interface ListObjectVersionsOutput {
  IsTruncated?: boolean;
  KeyMarker?: string;
  VersionIdMarker?: string;
  NextKeyMarker?: string;
  NextVersionIdMarker?: string;
  Versions?: ObjectVersion[];
  DeleteMarkers?: DeleteMarkerEntry[];
  Name?: string;
  Prefix?: string;
  Delimiter?: string;
  MaxKeys?: number;
  CommonPrefixes?: CommonPrefix[];
  EncodingType?: EncodingType;
  RequestCharged?: RequestCharged;
}
export interface ListObjectVersionsRequest {
  Bucket: string | undefined;
  Delimiter?: string;
  EncodingType?: EncodingType;
  KeyMarker?: string;
  MaxKeys?: number;
  Prefix?: string;
  VersionIdMarker?: string;
  ExpectedBucketOwner?: string;
  RequestPayer?: RequestPayer;
  OptionalObjectAttributes?: OptionalObjectAttributes[];
}
export interface Part {
  PartNumber?: number;
  LastModified?: Date;
  ETag?: string;
  Size?: number;
  ChecksumCRC32?: string;
  ChecksumCRC32C?: string;
  ChecksumSHA1?: string;
  ChecksumSHA256?: string;
}
export interface ListPartsOutput {
  AbortDate?: Date;
  AbortRuleId?: string;
  Bucket?: string;
  Key?: string;
  UploadId?: string;
  PartNumberMarker?: string;
  NextPartNumberMarker?: string;
  MaxParts?: number;
  IsTruncated?: boolean;
  Parts?: Part[];
  Initiator?: Initiator;
  Owner?: Owner;
  StorageClass?: StorageClass;
  RequestCharged?: RequestCharged;
  ChecksumAlgorithm?: ChecksumAlgorithm;
}
export interface ListPartsRequest {
  Bucket: string | undefined;
  Key: string | undefined;
  MaxParts?: number;
  PartNumberMarker?: string;
  UploadId: string | undefined;
  RequestPayer?: RequestPayer;
  ExpectedBucketOwner?: string;
  SSECustomerAlgorithm?: string;
  SSECustomerKey?: string;
  SSECustomerKeyMD5?: string;
}
export interface PutBucketAccelerateConfigurationRequest {
  Bucket: string | undefined;
  AccelerateConfiguration: AccelerateConfiguration | undefined;
  ExpectedBucketOwner?: string;
  ChecksumAlgorithm?: ChecksumAlgorithm;
}
export interface PutBucketAclRequest {
  ACL?: BucketCannedACL;
  AccessControlPolicy?: AccessControlPolicy;
  Bucket: string | undefined;
  ContentMD5?: string;
  ChecksumAlgorithm?: ChecksumAlgorithm;
  GrantFullControl?: string;
  GrantRead?: string;
  GrantReadACP?: string;
  GrantWrite?: string;
  GrantWriteACP?: string;
  ExpectedBucketOwner?: string;
}
export interface PutBucketAnalyticsConfigurationRequest {
  Bucket: string | undefined;
  Id: string | undefined;
  AnalyticsConfiguration: AnalyticsConfiguration | undefined;
  ExpectedBucketOwner?: string;
}
export interface CORSConfiguration {
  CORSRules: CORSRule[] | undefined;
}
export interface PutBucketCorsRequest {
  Bucket: string | undefined;
  CORSConfiguration: CORSConfiguration | undefined;
  ContentMD5?: string;
  ChecksumAlgorithm?: ChecksumAlgorithm;
  ExpectedBucketOwner?: string;
}
export interface PutBucketEncryptionRequest {
  Bucket: string | undefined;
  ContentMD5?: string;
  ChecksumAlgorithm?: ChecksumAlgorithm;
  ServerSideEncryptionConfiguration:
    | ServerSideEncryptionConfiguration
    | undefined;
  ExpectedBucketOwner?: string;
}
export interface PutBucketIntelligentTieringConfigurationRequest {
  Bucket: string | undefined;
  Id: string | undefined;
  IntelligentTieringConfiguration: IntelligentTieringConfiguration | undefined;
}
export interface PutBucketInventoryConfigurationRequest {
  Bucket: string | undefined;
  Id: string | undefined;
  InventoryConfiguration: InventoryConfiguration | undefined;
  ExpectedBucketOwner?: string;
}
export interface PutBucketLifecycleConfigurationOutput {
  TransitionDefaultMinimumObjectSize?: TransitionDefaultMinimumObjectSize;
}
export interface BucketLifecycleConfiguration {
  Rules: LifecycleRule[] | undefined;
}
export interface PutBucketLifecycleConfigurationRequest {
  Bucket: string | undefined;
  ChecksumAlgorithm?: ChecksumAlgorithm;
  LifecycleConfiguration?: BucketLifecycleConfiguration;
  ExpectedBucketOwner?: string;
  TransitionDefaultMinimumObjectSize?: TransitionDefaultMinimumObjectSize;
}
export interface BucketLoggingStatus {
  LoggingEnabled?: LoggingEnabled;
}
export interface PutBucketLoggingRequest {
  Bucket: string | undefined;
  BucketLoggingStatus: BucketLoggingStatus | undefined;
  ContentMD5?: string;
  ChecksumAlgorithm?: ChecksumAlgorithm;
  ExpectedBucketOwner?: string;
}
export interface PutBucketMetricsConfigurationRequest {
  Bucket: string | undefined;
  Id: string | undefined;
  MetricsConfiguration: MetricsConfiguration | undefined;
  ExpectedBucketOwner?: string;
}
export declare const CompleteMultipartUploadOutputFilterSensitiveLog: (
  obj: CompleteMultipartUploadOutput
) => any;
export declare const CompleteMultipartUploadRequestFilterSensitiveLog: (
  obj: CompleteMultipartUploadRequest
) => any;
export declare const CopyObjectOutputFilterSensitiveLog: (
  obj: CopyObjectOutput
) => any;
export declare const CopyObjectRequestFilterSensitiveLog: (
  obj: CopyObjectRequest
) => any;
export declare const CreateMultipartUploadOutputFilterSensitiveLog: (
  obj: CreateMultipartUploadOutput
) => any;
export declare const CreateMultipartUploadRequestFilterSensitiveLog: (
  obj: CreateMultipartUploadRequest
) => any;
export declare const SessionCredentialsFilterSensitiveLog: (
  obj: SessionCredentials
) => any;
export declare const CreateSessionOutputFilterSensitiveLog: (
  obj: CreateSessionOutput
) => any;
export declare const CreateSessionRequestFilterSensitiveLog: (
  obj: CreateSessionRequest
) => any;
export declare const ServerSideEncryptionByDefaultFilterSensitiveLog: (
  obj: ServerSideEncryptionByDefault
) => any;
export declare const ServerSideEncryptionRuleFilterSensitiveLog: (
  obj: ServerSideEncryptionRule
) => any;
export declare const ServerSideEncryptionConfigurationFilterSensitiveLog: (
  obj: ServerSideEncryptionConfiguration
) => any;
export declare const GetBucketEncryptionOutputFilterSensitiveLog: (
  obj: GetBucketEncryptionOutput
) => any;
export declare const SSEKMSFilterSensitiveLog: (obj: SSEKMS) => any;
export declare const InventoryEncryptionFilterSensitiveLog: (
  obj: InventoryEncryption
) => any;
export declare const InventoryS3BucketDestinationFilterSensitiveLog: (
  obj: InventoryS3BucketDestination
) => any;
export declare const InventoryDestinationFilterSensitiveLog: (
  obj: InventoryDestination
) => any;
export declare const InventoryConfigurationFilterSensitiveLog: (
  obj: InventoryConfiguration
) => any;
export declare const GetBucketInventoryConfigurationOutputFilterSensitiveLog: (
  obj: GetBucketInventoryConfigurationOutput
) => any;
export declare const GetObjectOutputFilterSensitiveLog: (
  obj: GetObjectOutput
) => any;
export declare const GetObjectRequestFilterSensitiveLog: (
  obj: GetObjectRequest
) => any;
export declare const GetObjectAttributesRequestFilterSensitiveLog: (
  obj: GetObjectAttributesRequest
) => any;
export declare const GetObjectTorrentOutputFilterSensitiveLog: (
  obj: GetObjectTorrentOutput
) => any;
export declare const HeadObjectOutputFilterSensitiveLog: (
  obj: HeadObjectOutput
) => any;
export declare const HeadObjectRequestFilterSensitiveLog: (
  obj: HeadObjectRequest
) => any;
export declare const ListBucketInventoryConfigurationsOutputFilterSensitiveLog: (
  obj: ListBucketInventoryConfigurationsOutput
) => any;
export declare const ListPartsRequestFilterSensitiveLog: (
  obj: ListPartsRequest
) => any;
export declare const PutBucketEncryptionRequestFilterSensitiveLog: (
  obj: PutBucketEncryptionRequest
) => any;
export declare const PutBucketInventoryConfigurationRequestFilterSensitiveLog: (
  obj: PutBucketInventoryConfigurationRequest
) => any;
