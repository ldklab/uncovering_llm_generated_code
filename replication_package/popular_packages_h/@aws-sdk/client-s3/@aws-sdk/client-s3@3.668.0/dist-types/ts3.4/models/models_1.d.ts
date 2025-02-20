import { ExceptionOptionType as __ExceptionOptionType } from "@smithy/smithy-client";
import { StreamingBlobTypes } from "@smithy/types";
import {
  AccessControlPolicy,
  BucketVersioningStatus,
  ChecksumAlgorithm,
  ErrorDocument,
  Grant,
  IndexDocument,
  NotificationConfiguration,
  ObjectCannedACL,
  ObjectLockConfiguration,
  ObjectLockLegalHold,
  ObjectLockLegalHoldStatus,
  ObjectLockMode,
  ObjectLockRetention,
  OwnershipControls,
  Payer,
  PublicAccessBlockConfiguration,
  RedirectAllRequestsTo,
  ReplicationConfiguration,
  ReplicationStatus,
  RequestCharged,
  RequestPayer,
  RoutingRule,
  ServerSideEncryption,
  StorageClass,
  Tag,
} from "./models_0";
import { S3ServiceException as __BaseException } from "./S3ServiceException";
export interface PutBucketNotificationConfigurationRequest {
  Bucket: string | undefined;
  NotificationConfiguration: NotificationConfiguration | undefined;
  ExpectedBucketOwner?: string;
  SkipDestinationValidation?: boolean;
}
export interface PutBucketOwnershipControlsRequest {
  Bucket: string | undefined;
  ContentMD5?: string;
  ExpectedBucketOwner?: string;
  OwnershipControls: OwnershipControls | undefined;
}
export interface PutBucketPolicyRequest {
  Bucket: string | undefined;
  ContentMD5?: string;
  ChecksumAlgorithm?: ChecksumAlgorithm;
  ConfirmRemoveSelfBucketAccess?: boolean;
  Policy: string | undefined;
  ExpectedBucketOwner?: string;
}
export interface PutBucketReplicationRequest {
  Bucket: string | undefined;
  ContentMD5?: string;
  ChecksumAlgorithm?: ChecksumAlgorithm;
  ReplicationConfiguration: ReplicationConfiguration | undefined;
  Token?: string;
  ExpectedBucketOwner?: string;
}
export interface RequestPaymentConfiguration {
  Payer: Payer | undefined;
}
export interface PutBucketRequestPaymentRequest {
  Bucket: string | undefined;
  ContentMD5?: string;
  ChecksumAlgorithm?: ChecksumAlgorithm;
  RequestPaymentConfiguration: RequestPaymentConfiguration | undefined;
  ExpectedBucketOwner?: string;
}
export interface Tagging {
  TagSet: Tag[] | undefined;
}
export interface PutBucketTaggingRequest {
  Bucket: string | undefined;
  ContentMD5?: string;
  ChecksumAlgorithm?: ChecksumAlgorithm;
  Tagging: Tagging | undefined;
  ExpectedBucketOwner?: string;
}
export declare const MFADelete: {
  readonly Disabled: "Disabled";
  readonly Enabled: "Enabled";
};
export type MFADelete = (typeof MFADelete)[keyof typeof MFADelete];
export interface VersioningConfiguration {
  MFADelete?: MFADelete;
  Status?: BucketVersioningStatus;
}
export interface PutBucketVersioningRequest {
  Bucket: string | undefined;
  ContentMD5?: string;
  ChecksumAlgorithm?: ChecksumAlgorithm;
  MFA?: string;
  VersioningConfiguration: VersioningConfiguration | undefined;
  ExpectedBucketOwner?: string;
}
export interface WebsiteConfiguration {
  ErrorDocument?: ErrorDocument;
  IndexDocument?: IndexDocument;
  RedirectAllRequestsTo?: RedirectAllRequestsTo;
  RoutingRules?: RoutingRule[];
}
export interface PutBucketWebsiteRequest {
  Bucket: string | undefined;
  ContentMD5?: string;
  ChecksumAlgorithm?: ChecksumAlgorithm;
  WebsiteConfiguration: WebsiteConfiguration | undefined;
  ExpectedBucketOwner?: string;
}
export interface PutObjectOutput {
  Expiration?: string;
  ETag?: string;
  ChecksumCRC32?: string;
  ChecksumCRC32C?: string;
  ChecksumSHA1?: string;
  ChecksumSHA256?: string;
  ServerSideEncryption?: ServerSideEncryption;
  VersionId?: string;
  SSECustomerAlgorithm?: string;
  SSECustomerKeyMD5?: string;
  SSEKMSKeyId?: string;
  SSEKMSEncryptionContext?: string;
  BucketKeyEnabled?: boolean;
  RequestCharged?: RequestCharged;
}
export interface PutObjectRequest {
  ACL?: ObjectCannedACL;
  Body?: StreamingBlobTypes;
  Bucket: string | undefined;
  CacheControl?: string;
  ContentDisposition?: string;
  ContentEncoding?: string;
  ContentLanguage?: string;
  ContentLength?: number;
  ContentMD5?: string;
  ContentType?: string;
  ChecksumAlgorithm?: ChecksumAlgorithm;
  ChecksumCRC32?: string;
  ChecksumCRC32C?: string;
  ChecksumSHA1?: string;
  ChecksumSHA256?: string;
  Expires?: Date;
  IfNoneMatch?: string;
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
}
export interface PutObjectAclOutput {
  RequestCharged?: RequestCharged;
}
export interface PutObjectAclRequest {
  ACL?: ObjectCannedACL;
  AccessControlPolicy?: AccessControlPolicy;
  Bucket: string | undefined;
  ContentMD5?: string;
  ChecksumAlgorithm?: ChecksumAlgorithm;
  GrantFullControl?: string;
  GrantRead?: string;
  GrantReadACP?: string;
  GrantWrite?: string;
  GrantWriteACP?: string;
  Key: string | undefined;
  RequestPayer?: RequestPayer;
  VersionId?: string;
  ExpectedBucketOwner?: string;
}
export interface PutObjectLegalHoldOutput {
  RequestCharged?: RequestCharged;
}
export interface PutObjectLegalHoldRequest {
  Bucket: string | undefined;
  Key: string | undefined;
  LegalHold?: ObjectLockLegalHold;
  RequestPayer?: RequestPayer;
  VersionId?: string;
  ContentMD5?: string;
  ChecksumAlgorithm?: ChecksumAlgorithm;
  ExpectedBucketOwner?: string;
}
export interface PutObjectLockConfigurationOutput {
  RequestCharged?: RequestCharged;
}
export interface PutObjectLockConfigurationRequest {
  Bucket: string | undefined;
  ObjectLockConfiguration?: ObjectLockConfiguration;
  RequestPayer?: RequestPayer;
  Token?: string;
  ContentMD5?: string;
  ChecksumAlgorithm?: ChecksumAlgorithm;
  ExpectedBucketOwner?: string;
}
export interface PutObjectRetentionOutput {
  RequestCharged?: RequestCharged;
}
export interface PutObjectRetentionRequest {
  Bucket: string | undefined;
  Key: string | undefined;
  Retention?: ObjectLockRetention;
  RequestPayer?: RequestPayer;
  VersionId?: string;
  BypassGovernanceRetention?: boolean;
  ContentMD5?: string;
  ChecksumAlgorithm?: ChecksumAlgorithm;
  ExpectedBucketOwner?: string;
}
export interface PutObjectTaggingOutput {
  VersionId?: string;
}
export interface PutObjectTaggingRequest {
  Bucket: string | undefined;
  Key: string | undefined;
  VersionId?: string;
  ContentMD5?: string;
  ChecksumAlgorithm?: ChecksumAlgorithm;
  Tagging: Tagging | undefined;
  ExpectedBucketOwner?: string;
  RequestPayer?: RequestPayer;
}
export interface PutPublicAccessBlockRequest {
  Bucket: string | undefined;
  ContentMD5?: string;
  ChecksumAlgorithm?: ChecksumAlgorithm;
  PublicAccessBlockConfiguration: PublicAccessBlockConfiguration | undefined;
  ExpectedBucketOwner?: string;
}
export declare class ObjectAlreadyInActiveTierError extends __BaseException {
  readonly name: "ObjectAlreadyInActiveTierError";
  readonly $fault: "client";
  constructor(
    opts: __ExceptionOptionType<ObjectAlreadyInActiveTierError, __BaseException>
  );
}
export interface RestoreObjectOutput {
  RequestCharged?: RequestCharged;
  RestoreOutputPath?: string;
}
export declare const Tier: {
  readonly Bulk: "Bulk";
  readonly Expedited: "Expedited";
  readonly Standard: "Standard";
};
export type Tier = (typeof Tier)[keyof typeof Tier];
export interface GlacierJobParameters {
  Tier: Tier | undefined;
}
export interface Encryption {
  EncryptionType: ServerSideEncryption | undefined;
  KMSKeyId?: string;
  KMSContext?: string;
}
export interface MetadataEntry {
  Name?: string;
  Value?: string;
}
export interface S3Location {
  BucketName: string | undefined;
  Prefix: string | undefined;
  Encryption?: Encryption;
  CannedACL?: ObjectCannedACL;
  AccessControlList?: Grant[];
  Tagging?: Tagging;
  UserMetadata?: MetadataEntry[];
  StorageClass?: StorageClass;
}
export interface OutputLocation {
  S3?: S3Location;
}
export declare const ExpressionType: {
  readonly SQL: "SQL";
};
export type ExpressionType =
  (typeof ExpressionType)[keyof typeof ExpressionType];
export declare const CompressionType: {
  readonly BZIP2: "BZIP2";
  readonly GZIP: "GZIP";
  readonly NONE: "NONE";
};
export type CompressionType =
  (typeof CompressionType)[keyof typeof CompressionType];
export declare const FileHeaderInfo: {
  readonly IGNORE: "IGNORE";
  readonly NONE: "NONE";
  readonly USE: "USE";
};
export type FileHeaderInfo =
  (typeof FileHeaderInfo)[keyof typeof FileHeaderInfo];
export interface CSVInput {
  FileHeaderInfo?: FileHeaderInfo;
  Comments?: string;
  QuoteEscapeCharacter?: string;
  RecordDelimiter?: string;
  FieldDelimiter?: string;
  QuoteCharacter?: string;
  AllowQuotedRecordDelimiter?: boolean;
}
export declare const JSONType: {
  readonly DOCUMENT: "DOCUMENT";
  readonly LINES: "LINES";
};
export type JSONType = (typeof JSONType)[keyof typeof JSONType];
export interface JSONInput {
  Type?: JSONType;
}
export interface ParquetInput {}
export interface InputSerialization {
  CSV?: CSVInput;
  CompressionType?: CompressionType;
  JSON?: JSONInput;
  Parquet?: ParquetInput;
}
export declare const QuoteFields: {
  readonly ALWAYS: "ALWAYS";
  readonly ASNEEDED: "ASNEEDED";
};
export type QuoteFields = (typeof QuoteFields)[keyof typeof QuoteFields];
export interface CSVOutput {
  QuoteFields?: QuoteFields;
  QuoteEscapeCharacter?: string;
  RecordDelimiter?: string;
  FieldDelimiter?: string;
  QuoteCharacter?: string;
}
export interface JSONOutput {
  RecordDelimiter?: string;
}
export interface OutputSerialization {
  CSV?: CSVOutput;
  JSON?: JSONOutput;
}
export interface SelectParameters {
  InputSerialization: InputSerialization | undefined;
  ExpressionType: ExpressionType | undefined;
  Expression: string | undefined;
  OutputSerialization: OutputSerialization | undefined;
}
export declare const RestoreRequestType: {
  readonly SELECT: "SELECT";
};
export type RestoreRequestType =
  (typeof RestoreRequestType)[keyof typeof RestoreRequestType];
export interface RestoreRequest {
  Days?: number;
  GlacierJobParameters?: GlacierJobParameters;
  Type?: RestoreRequestType;
  Tier?: Tier;
  Description?: string;
  SelectParameters?: SelectParameters;
  OutputLocation?: OutputLocation;
}
export interface RestoreObjectRequest {
  Bucket: string | undefined;
  Key: string | undefined;
  VersionId?: string;
  RestoreRequest?: RestoreRequest;
  RequestPayer?: RequestPayer;
  ChecksumAlgorithm?: ChecksumAlgorithm;
  ExpectedBucketOwner?: string;
}
export interface ContinuationEvent {}
export interface EndEvent {}
export interface Progress {
  BytesScanned?: number;
  BytesProcessed?: number;
  BytesReturned?: number;
}
export interface ProgressEvent {
  Details?: Progress;
}
export interface RecordsEvent {
  Payload?: Uint8Array;
}
export interface Stats {
  BytesScanned?: number;
  BytesProcessed?: number;
  BytesReturned?: number;
}
export interface StatsEvent {
  Details?: Stats;
}
export type SelectObjectContentEventStream =
  | SelectObjectContentEventStream.ContMember
  | SelectObjectContentEventStream.EndMember
  | SelectObjectContentEventStream.ProgressMember
  | SelectObjectContentEventStream.RecordsMember
  | SelectObjectContentEventStream.StatsMember
  | SelectObjectContentEventStream.$UnknownMember;
export declare namespace SelectObjectContentEventStream {
  interface RecordsMember {
    Records: RecordsEvent;
    Stats?: never;
    Progress?: never;
    Cont?: never;
    End?: never;
    $unknown?: never;
  }
  interface StatsMember {
    Records?: never;
    Stats: StatsEvent;
    Progress?: never;
    Cont?: never;
    End?: never;
    $unknown?: never;
  }
  interface ProgressMember {
    Records?: never;
    Stats?: never;
    Progress: ProgressEvent;
    Cont?: never;
    End?: never;
    $unknown?: never;
  }
  interface ContMember {
    Records?: never;
    Stats?: never;
    Progress?: never;
    Cont: ContinuationEvent;
    End?: never;
    $unknown?: never;
  }
  interface EndMember {
    Records?: never;
    Stats?: never;
    Progress?: never;
    Cont?: never;
    End: EndEvent;
    $unknown?: never;
  }
  interface $UnknownMember {
    Records?: never;
    Stats?: never;
    Progress?: never;
    Cont?: never;
    End?: never;
    $unknown: [string, any];
  }
  interface Visitor<T> {
    Records: (value: RecordsEvent) => T;
    Stats: (value: StatsEvent) => T;
    Progress: (value: ProgressEvent) => T;
    Cont: (value: ContinuationEvent) => T;
    End: (value: EndEvent) => T;
    _: (name: string, value: any) => T;
  }
  const visit: <T>(
    value: SelectObjectContentEventStream,
    visitor: Visitor<T>
  ) => T;
}
export interface SelectObjectContentOutput {
  Payload?: AsyncIterable<SelectObjectContentEventStream>;
}
export interface RequestProgress {
  Enabled?: boolean;
}
export interface ScanRange {
  Start?: number;
  End?: number;
}
export interface SelectObjectContentRequest {
  Bucket: string | undefined;
  Key: string | undefined;
  SSECustomerAlgorithm?: string;
  SSECustomerKey?: string;
  SSECustomerKeyMD5?: string;
  Expression: string | undefined;
  ExpressionType: ExpressionType | undefined;
  RequestProgress?: RequestProgress;
  InputSerialization: InputSerialization | undefined;
  OutputSerialization: OutputSerialization | undefined;
  ScanRange?: ScanRange;
  ExpectedBucketOwner?: string;
}
export interface UploadPartOutput {
  ServerSideEncryption?: ServerSideEncryption;
  ETag?: string;
  ChecksumCRC32?: string;
  ChecksumCRC32C?: string;
  ChecksumSHA1?: string;
  ChecksumSHA256?: string;
  SSECustomerAlgorithm?: string;
  SSECustomerKeyMD5?: string;
  SSEKMSKeyId?: string;
  BucketKeyEnabled?: boolean;
  RequestCharged?: RequestCharged;
}
export interface UploadPartRequest {
  Body?: StreamingBlobTypes;
  Bucket: string | undefined;
  ContentLength?: number;
  ContentMD5?: string;
  ChecksumAlgorithm?: ChecksumAlgorithm;
  ChecksumCRC32?: string;
  ChecksumCRC32C?: string;
  ChecksumSHA1?: string;
  ChecksumSHA256?: string;
  Key: string | undefined;
  PartNumber: number | undefined;
  UploadId: string | undefined;
  SSECustomerAlgorithm?: string;
  SSECustomerKey?: string;
  SSECustomerKeyMD5?: string;
  RequestPayer?: RequestPayer;
  ExpectedBucketOwner?: string;
}
export interface CopyPartResult {
  ETag?: string;
  LastModified?: Date;
  ChecksumCRC32?: string;
  ChecksumCRC32C?: string;
  ChecksumSHA1?: string;
  ChecksumSHA256?: string;
}
export interface UploadPartCopyOutput {
  CopySourceVersionId?: string;
  CopyPartResult?: CopyPartResult;
  ServerSideEncryption?: ServerSideEncryption;
  SSECustomerAlgorithm?: string;
  SSECustomerKeyMD5?: string;
  SSEKMSKeyId?: string;
  BucketKeyEnabled?: boolean;
  RequestCharged?: RequestCharged;
}
export interface UploadPartCopyRequest {
  Bucket: string | undefined;
  CopySource: string | undefined;
  CopySourceIfMatch?: string;
  CopySourceIfModifiedSince?: Date;
  CopySourceIfNoneMatch?: string;
  CopySourceIfUnmodifiedSince?: Date;
  CopySourceRange?: string;
  Key: string | undefined;
  PartNumber: number | undefined;
  UploadId: string | undefined;
  SSECustomerAlgorithm?: string;
  SSECustomerKey?: string;
  SSECustomerKeyMD5?: string;
  CopySourceSSECustomerAlgorithm?: string;
  CopySourceSSECustomerKey?: string;
  CopySourceSSECustomerKeyMD5?: string;
  RequestPayer?: RequestPayer;
  ExpectedBucketOwner?: string;
  ExpectedSourceBucketOwner?: string;
}
export interface WriteGetObjectResponseRequest {
  RequestRoute: string | undefined;
  RequestToken: string | undefined;
  Body?: StreamingBlobTypes;
  StatusCode?: number;
  ErrorCode?: string;
  ErrorMessage?: string;
  AcceptRanges?: string;
  CacheControl?: string;
  ContentDisposition?: string;
  ContentEncoding?: string;
  ContentLanguage?: string;
  ContentLength?: number;
  ContentRange?: string;
  ContentType?: string;
  ChecksumCRC32?: string;
  ChecksumCRC32C?: string;
  ChecksumSHA1?: string;
  ChecksumSHA256?: string;
  DeleteMarker?: boolean;
  ETag?: string;
  Expires?: Date;
  Expiration?: string;
  LastModified?: Date;
  MissingMeta?: number;
  Metadata?: Record<string, string>;
  ObjectLockMode?: ObjectLockMode;
  ObjectLockLegalHoldStatus?: ObjectLockLegalHoldStatus;
  ObjectLockRetainUntilDate?: Date;
  PartsCount?: number;
  ReplicationStatus?: ReplicationStatus;
  RequestCharged?: RequestCharged;
  Restore?: string;
  ServerSideEncryption?: ServerSideEncryption;
  SSECustomerAlgorithm?: string;
  SSEKMSKeyId?: string;
  SSECustomerKeyMD5?: string;
  StorageClass?: StorageClass;
  TagCount?: number;
  VersionId?: string;
  BucketKeyEnabled?: boolean;
}
export declare const PutObjectOutputFilterSensitiveLog: (
  obj: PutObjectOutput
) => any;
export declare const PutObjectRequestFilterSensitiveLog: (
  obj: PutObjectRequest
) => any;
export declare const EncryptionFilterSensitiveLog: (obj: Encryption) => any;
export declare const S3LocationFilterSensitiveLog: (obj: S3Location) => any;
export declare const OutputLocationFilterSensitiveLog: (
  obj: OutputLocation
) => any;
export declare const RestoreRequestFilterSensitiveLog: (
  obj: RestoreRequest
) => any;
export declare const RestoreObjectRequestFilterSensitiveLog: (
  obj: RestoreObjectRequest
) => any;
export declare const SelectObjectContentEventStreamFilterSensitiveLog: (
  obj: SelectObjectContentEventStream
) => any;
export declare const SelectObjectContentOutputFilterSensitiveLog: (
  obj: SelectObjectContentOutput
) => any;
export declare const SelectObjectContentRequestFilterSensitiveLog: (
  obj: SelectObjectContentRequest
) => any;
export declare const UploadPartOutputFilterSensitiveLog: (
  obj: UploadPartOutput
) => any;
export declare const UploadPartRequestFilterSensitiveLog: (
  obj: UploadPartRequest
) => any;
export declare const UploadPartCopyOutputFilterSensitiveLog: (
  obj: UploadPartCopyOutput
) => any;
export declare const UploadPartCopyRequestFilterSensitiveLog: (
  obj: UploadPartCopyRequest
) => any;
export declare const WriteGetObjectResponseRequestFilterSensitiveLog: (
  obj: WriteGetObjectResponseRequest
) => any;
