"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

const { Admin } = require("./admin");
const { OrderedBulkOperation } = require("./bulk/ordered");
const { UnorderedBulkOperation } = require("./bulk/unordered");
const { ChangeStream } = require("./change_stream");
const { Collection } = require("./collection");
const { AbstractCursor } = require("./cursor/abstract_cursor");
const { AggregationCursor } = require("./cursor/aggregation_cursor");
const { FindCursor } = require("./cursor/find_cursor");
const { ListCollectionsCursor } = require("./cursor/list_collections_cursor");
const { ListIndexesCursor } = require("./cursor/list_indexes_cursor");
const { Db } = require("./db");
const { GridFSBucket } = require("./gridfs");
const { GridFSBucketReadStream } = require("./gridfs/download");
const { GridFSBucketWriteStream } = require("./gridfs/upload");
const { MongoClient } = require("./mongo_client");
const { CancellationToken } = require("./mongo_types");
const { ClientSession } = require("./sessions");
const { BSON, Binary, BSONRegExp, BSONSymbol, BSONType, Code, DBRef, Decimal128, Double, Int32, Long, MaxKey, MinKey, ObjectId, Timestamp, UUID } = require("./bson");
const { MongoBulkWriteError } = require("./bulk/common");
const { ClientEncryption } = require("./client-side-encryption/client_encryption");
const { ChangeStreamCursor } = require("./cursor/change_stream_cursor");
const { 
    MongoAPIError, MongoAWSError, MongoAzureError, MongoBatchReExecutionError, MongoChangeStreamError, MongoCompatibilityError, MongoCursorExhaustedError, MongoCursorInUseError,
    MongoDecompressionError, MongoDriverError, MongoError, MongoExpiredSessionError, MongoGCPError, MongoGridFSChunkError, MongoGridFSStreamError, MongoInvalidArgumentError,
    MongoKerberosError, MongoMissingCredentialsError, MongoMissingDependencyError, MongoNetworkError, MongoNetworkTimeoutError, MongoNotConnectedError, MongoOIDCError, MongoParseError,
    MongoRuntimeError, MongoServerClosedError, MongoServerError, MongoServerSelectionError, MongoSystemError, MongoTailableCursorError, MongoTopologyClosedError, MongoTransactionError,
    MongoUnexpectedServerResponseError, MongoWriteConcernError
} = require("./error");
const { configureExplicitResourceManagement } = require("./resource_management");
const { BatchType } = require("./bulk/common");
const { AutoEncryptionLoggerLevel } = require("./client-side-encryption/auto_encrypter");
const { GSSAPICanonicalizationValue } = require("./cmap/auth/gssapi");
const { AuthMechanism } = require("./cmap/auth/providers");
const { Compressor } = require("./cmap/wire_protocol/compression");
const { CURSOR_FLAGS } = require("./cursor/abstract_cursor");
const { MongoErrorLabel } = require("./error");
const { ExplainVerbosity } = require("./explain");
const { ServerApiVersion } = require("./mongo_client");
const { ReturnDocument } = require("./operations/find_and_modify");
const { ProfilingLevel } = require("./operations/set_profiling_level");
const { ReadConcernLevel, ReadConcern } = require("./read_concern");
const { ReadPreferenceMode, ReadPreference } = require("./read_preference");
const { ServerType, TopologyType } = require("./sdam/common");
const { WriteConcern } = require("./write_concern");
const { CommandFailedEvent, CommandStartedEvent, CommandSucceededEvent } = require("./cmap/command_monitoring_events");
const { 
    ConnectionCheckedInEvent, ConnectionCheckedOutEvent, ConnectionCheckOutFailedEvent, ConnectionCheckOutStartedEvent, 
    ConnectionClosedEvent, ConnectionCreatedEvent, ConnectionPoolClearedEvent, ConnectionPoolClosedEvent, ConnectionPoolCreatedEvent,
    ConnectionPoolMonitoringEvent, ConnectionPoolReadyEvent, ConnectionReadyEvent
} = require("./cmap/connection_pool_events");
const { 
    ServerClosedEvent, ServerDescriptionChangedEvent, ServerHeartbeatFailedEvent, ServerHeartbeatStartedEvent, ServerHeartbeatSucceededEvent, 
    ServerOpeningEvent, TopologyClosedEvent, TopologyDescriptionChangedEvent, TopologyOpeningEvent 
} = require("./sdam/events");
const { 
    ServerSelectionEvent, ServerSelectionFailedEvent, ServerSelectionStartedEvent, ServerSelectionSucceededEvent, WaitingForSuitableServerEvent 
} = require("./sdam/server_selection_events");
const { SrvPollingEvent } = require("./sdam/srv_polling");
const { 
    MongoCryptAzureKMSRequestError, MongoCryptCreateDataKeyError, MongoCryptCreateEncryptedCollectionError, 
    MongoCryptError, MongoCryptInvalidArgumentError, MongoCryptKMSRequestNetworkTimeoutError 
} = require("./client-side-encryption/errors");
const { MongoClientAuthProviders } = require("./mongo_client_auth_providers");

Object.defineProperty(exports, "Admin", { enumerable: true, get: function () { return Admin; } });
Object.defineProperty(exports, "OrderedBulkOperation", { enumerable: true, get: function () { return OrderedBulkOperation; } });
Object.defineProperty(exports, "UnorderedBulkOperation", { enumerable: true, get: function () { return UnorderedBulkOperation; } });
Object.defineProperty(exports, "ChangeStream", { enumerable: true, get: function () { return ChangeStream; } });
Object.defineProperty(exports, "Collection", { enumerable: true, get: function () { return Collection; } });
Object.defineProperty(exports, "AbstractCursor", { enumerable: true, get: function () { return AbstractCursor; } });
Object.defineProperty(exports, "AggregationCursor", { enumerable: true, get: function () { return AggregationCursor; } });
Object.defineProperty(exports, "FindCursor", { enumerable: true, get: function () { return FindCursor; } });
Object.defineProperty(exports, "ListCollectionsCursor", { enumerable: true, get: function () { return ListCollectionsCursor; } });
Object.defineProperty(exports, "ListIndexesCursor", { enumerable: true, get: function () { return ListIndexesCursor; } });
Object.defineProperty(exports, "Db", { enumerable: true, get: function () { return Db; } });
Object.defineProperty(exports, "GridFSBucket", { enumerable: true, get: function () { return GridFSBucket; } });
Object.defineProperty(exports, "GridFSBucketReadStream", { enumerable: true, get: function () { return GridFSBucketReadStream; } });
Object.defineProperty(exports, "GridFSBucketWriteStream", { enumerable: true, get: function () { return GridFSBucketWriteStream; } });
Object.defineProperty(exports, "MongoClient", { enumerable: true, get: function () { return MongoClient; } });
Object.defineProperty(exports, "CancellationToken", { enumerable: true, get: function () { return CancellationToken; } });
Object.defineProperty(exports, "ClientSession", { enumerable: true, get: function () { return ClientSession; } });
Object.defineProperty(exports, "BSON", { enumerable: true, get: function () { return BSON; } });
Object.defineProperty(exports, "Binary", { enumerable: true, get: function () { return Binary; } });
Object.defineProperty(exports, "BSONRegExp", { enumerable: true, get: function () { return BSONRegExp; } });
Object.defineProperty(exports, "BSONSymbol", { enumerable: true, get: function () { return BSONSymbol; } });
Object.defineProperty(exports, "BSONType", { enumerable: true, get: function () { return BSONType; } });
Object.defineProperty(exports, "Code", { enumerable: true, get: function () { return Code; } });
Object.defineProperty(exports, "DBRef", { enumerable: true, get: function () { return DBRef; } });
Object.defineProperty(exports, "Decimal128", { enumerable: true, get: function () { return Decimal128; } });
Object.defineProperty(exports, "Double", { enumerable: true, get: function () { return Double; } });
Object.defineProperty(exports, "Int32", { enumerable: true, get: function () { return Int32; } });
Object.defineProperty(exports, "Long", { enumerable: true, get: function () { return Long; } });
Object.defineProperty(exports, "MaxKey", { enumerable: true, get: function () { return MaxKey; } });
Object.defineProperty(exports, "MinKey", { enumerable: true, get: function () { return MinKey; } });
Object.defineProperty(exports, "ObjectId", { enumerable: true, get: function () { return ObjectId; } });
Object.defineProperty(exports, "Timestamp", { enumerable: true, get: function () { return Timestamp; } });
Object.defineProperty(exports, "UUID", { enumerable: true, get: function () { return UUID; } });
Object.defineProperty(exports, "MongoBulkWriteError", { enumerable: true, get: function () { return MongoBulkWriteError; } });
Object.defineProperty(exports, "ClientEncryption", { enumerable: true, get: function () { return ClientEncryption; } });
Object.defineProperty(exports, "ChangeStreamCursor", { enumerable: true, get: function () { return ChangeStreamCursor; } });
Object.defineProperty(exports, "MongoAPIError", { enumerable: true, get: function () { return MongoAPIError; } });
Object.defineProperty(exports, "MongoAWSError", { enumerable: true, get: function () { return MongoAWSError; } });
Object.defineProperty(exports, "MongoAzureError", { enumerable: true, get: function () { return MongoAzureError; } });
Object.defineProperty(exports, "MongoBatchReExecutionError", { enumerable: true, get: function () { return MongoBatchReExecutionError; } });
Object.defineProperty(exports, "MongoChangeStreamError", { enumerable: true, get: function () { return MongoChangeStreamError; } });
Object.defineProperty(exports, "MongoCompatibilityError", { enumerable: true, get: function () { return MongoCompatibilityError; } });
Object.defineProperty(exports, "MongoCursorExhaustedError", { enumerable: true, get: function () { return MongoCursorExhaustedError; } });
Object.defineProperty(exports, "MongoCursorInUseError", { enumerable: true, get: function () { return MongoCursorInUseError; } });
Object.defineProperty(exports, "MongoDecompressionError", { enumerable: true, get: function () { return MongoDecompressionError; } });
Object.defineProperty(exports, "MongoDriverError", { enumerable: true, get: function () { return MongoDriverError; } });
Object.defineProperty(exports, "MongoError", { enumerable: true, get: function () { return MongoError; } });
Object.defineProperty(exports, "MongoExpiredSessionError", { enumerable: true, get: function () { return MongoExpiredSessionError; } });
Object.defineProperty(exports, "MongoGCPError", { enumerable: true, get: function () { return MongoGCPError; } });
Object.defineProperty(exports, "MongoGridFSChunkError", { enumerable: true, get: function () { return MongoGridFSChunkError; } });
Object.defineProperty(exports, "MongoGridFSStreamError", { enumerable: true, get: function () { return MongoGridFSStreamError; } });
Object.defineProperty(exports, "MongoInvalidArgumentError", { enumerable: true, get: function () { return MongoInvalidArgumentError; } });
Object.defineProperty(exports, "MongoKerberosError", { enumerable: true, get: function () { return MongoKerberosError; } });
Object.defineProperty(exports, "MongoMissingCredentialsError", { enumerable: true, get: function () { return MongoMissingCredentialsError; } });
Object.defineProperty(exports, "MongoMissingDependencyError", { enumerable: true, get: function () { return MongoMissingDependencyError; } });
Object.defineProperty(exports, "MongoNetworkError", { enumerable: true, get: function () { return MongoNetworkError; } });
Object.defineProperty(exports, "MongoNetworkTimeoutError", { enumerable: true, get: function () { return MongoNetworkTimeoutError; } });
Object.defineProperty(exports, "MongoNotConnectedError", { enumerable: true, get: function () { return MongoNotConnectedError; } });
Object.defineProperty(exports, "MongoOIDCError", { enumerable: true, get: function () { return MongoOIDCError; } });
Object.defineProperty(exports, "MongoParseError", { enumerable: true, get: function () { return MongoParseError; } });
Object.defineProperty(exports, "MongoRuntimeError", { enumerable: true, get: function () { return MongoRuntimeError; } });
Object.defineProperty(exports, "MongoServerClosedError", { enumerable: true, get: function () { return MongoServerClosedError; } });
Object.defineProperty(exports, "MongoServerError", { enumerable: true, get: function () { return MongoServerError; } });
Object.defineProperty(exports, "MongoServerSelectionError", { enumerable: true, get: function () { return MongoServerSelectionError; } });
Object.defineProperty(exports, "MongoSystemError", { enumerable: true, get: function () { return MongoSystemError; } });
Object.defineProperty(exports, "MongoTailableCursorError", { enumerable: true, get: function () { return MongoTailableCursorError; } });
Object.defineProperty(exports, "MongoTopologyClosedError", { enumerable: true, get: function () { return MongoTopologyClosedError; } });
Object.defineProperty(exports, "MongoTransactionError", { enumerable: true, get: function () { return MongoTransactionError; } });
Object.defineProperty(exports, "MongoUnexpectedServerResponseError", { enumerable: true, get: function () { return MongoUnexpectedServerResponseError; } });
Object.defineProperty(exports, "MongoWriteConcernError", { enumerable: true, get: function () { return MongoWriteConcernError; } });
Object.defineProperty(exports, "configureExplicitResourceManagement", { enumerable: true, get: function () { return configureExplicitResourceManagement; } });
Object.defineProperty(exports, "BatchType", { enumerable: true, get: function () { return BatchType; } });
Object.defineProperty(exports, "AutoEncryptionLoggerLevel", { enumerable: true, get: function () { return AutoEncryptionLoggerLevel; } });
Object.defineProperty(exports, "GSSAPICanonicalizationValue", { enumerable: true, get: function () { return GSSAPICanonicalizationValue; } });
Object.defineProperty(exports, "AuthMechanism", { enumerable: true, get: function () { return AuthMechanism; } });
Object.defineProperty(exports, "Compressor", { enumerable: true, get: function () { return Compressor; } });
Object.defineProperty(exports, "CURSOR_FLAGS", { enumerable: true, get: function () { return CURSOR_FLAGS; } });
Object.defineProperty(exports, "MongoErrorLabel", { enumerable: true, get: function () { return MongoErrorLabel; } });
Object.defineProperty(exports, "ExplainVerbosity", { enumerable: true, get: function () { return ExplainVerbosity; } });
Object.defineProperty(exports, "ServerApiVersion", { enumerable: true, get: function () { return ServerApiVersion; } });
Object.defineProperty(exports, "ReturnDocument", { enumerable: true, get: function () { return ReturnDocument; } });
Object.defineProperty(exports, "ProfilingLevel", { enumerable: true, get: function () { return ProfilingLevel; } });
Object.defineProperty(exports, "ReadConcernLevel", { enumerable: true, get: function () { return ReadConcernLevel; } });
Object.defineProperty(exports, "ReadPreferenceMode", { enumerable: true, get: function () { return ReadPreferenceMode; } });
Object.defineProperty(exports, "ServerType", { enumerable: true, get: function () { return ServerType; } });
Object.defineProperty(exports, "TopologyType", { enumerable: true, get: function () { return TopologyType; } });
Object.defineProperty(exports, "ReadConcern", { enumerable: true, get: function () { return ReadConcern; } });
Object.defineProperty(exports, "ReadPreference", { enumerable: true, get: function () { return ReadPreference; } });
Object.defineProperty(exports, "WriteConcern", { enumerable: true, get: function () { return WriteConcern; } });
Object.defineProperty(exports, "CommandFailedEvent", { enumerable: true, get: function () { return CommandFailedEvent; } });
Object.defineProperty(exports, "CommandStartedEvent", { enumerable: true, get: function () { return CommandStartedEvent; } });
Object.defineProperty(exports, "CommandSucceededEvent", { enumerable: true, get: function () { return CommandSucceededEvent; } });
Object.defineProperty(exports, "ConnectionCheckedInEvent", { enumerable: true, get: function () { return ConnectionCheckedInEvent; } });
Object.defineProperty(exports, "ConnectionCheckedOutEvent", { enumerable: true, get: function () { return ConnectionCheckedOutEvent; } });
Object.defineProperty(exports, "ConnectionCheckOutFailedEvent", { enumerable: true, get: function () { return ConnectionCheckOutFailedEvent; } });
Object.defineProperty(exports, "ConnectionCheckOutStartedEvent", { enumerable: true, get: function () { return ConnectionCheckOutStartedEvent; } });
Object.defineProperty(exports, "ConnectionClosedEvent", { enumerable: true, get: function () { return ConnectionClosedEvent; } });
Object.defineProperty(exports, "ConnectionCreatedEvent", { enumerable: true, get: function () { return ConnectionCreatedEvent; } });
Object.defineProperty(exports, "ConnectionPoolClearedEvent", { enumerable: true, get: function () { return ConnectionPoolClearedEvent; } });
Object.defineProperty(exports, "ConnectionPoolClosedEvent", { enumerable: true, get: function () { return ConnectionPoolClosedEvent; } });
Object.defineProperty(exports, "ConnectionPoolCreatedEvent", { enumerable: true, get: function () { return ConnectionPoolCreatedEvent; } });
Object.defineProperty(exports, "ConnectionPoolMonitoringEvent", { enumerable: true, get: function () { return ConnectionPoolMonitoringEvent; } });
Object.defineProperty(exports, "ConnectionPoolReadyEvent", { enumerable: true, get: function () { return ConnectionPoolReadyEvent; } });
Object.defineProperty(exports, "ConnectionReadyEvent", { enumerable: true, get: function () { return ConnectionReadyEvent; } });
Object.defineProperty(exports, "ServerClosedEvent", { enumerable: true, get: function () { return ServerClosedEvent; } });
Object.defineProperty(exports, "ServerDescriptionChangedEvent", { enumerable: true, get: function () { return ServerDescriptionChangedEvent; } });
Object.defineProperty(exports, "ServerHeartbeatFailedEvent", { enumerable: true, get: function () { return ServerHeartbeatFailedEvent; } });
Object.defineProperty(exports, "ServerHeartbeatStartedEvent", { enumerable: true, get: function () { return ServerHeartbeatStartedEvent; } });
Object.defineProperty(exports, "ServerHeartbeatSucceededEvent", { enumerable: true, get: function () { return ServerHeartbeatSucceededEvent; } });
Object.defineProperty(exports, "ServerOpeningEvent", { enumerable: true, get: function () { return ServerOpeningEvent; } });
Object.defineProperty(exports, "TopologyClosedEvent", { enumerable: true, get: function () { return TopologyClosedEvent; } });
Object.defineProperty(exports, "TopologyDescriptionChangedEvent", { enumerable: true, get: function () { return TopologyDescriptionChangedEvent; } });
Object.defineProperty(exports, "TopologyOpeningEvent", { enumerable: true, get: function () { return TopologyOpeningEvent; } });
Object.defineProperty(exports, "ServerSelectionEvent", { enumerable: true, get: function () { return ServerSelectionEvent; } });
Object.defineProperty(exports, "ServerSelectionFailedEvent", { enumerable: true, get: function () { return ServerSelectionFailedEvent; } });
Object.defineProperty(exports, "ServerSelectionStartedEvent", { enumerable: true, get: function () { return ServerSelectionStartedEvent; } });
Object.defineProperty(exports, "ServerSelectionSucceededEvent", { enumerable: true, get: function () { return ServerSelectionSucceededEvent; } });
Object.defineProperty(exports, "WaitingForSuitableServerEvent", { enumerable: true, get: function () { return WaitingForSuitableServerEvent; } });
Object.defineProperty(exports, "SrvPollingEvent", { enumerable: true, get: function () { return SrvPollingEvent; } });
Object.defineProperty(exports, "MongoCryptAzureKMSRequestError", { enumerable: true, get: function () { return MongoCryptAzureKMSRequestError; } });
Object.defineProperty(exports, "MongoCryptCreateDataKeyError", { enumerable: true, get: function () { return MongoCryptCreateDataKeyError; } });
Object.defineProperty(exports, "MongoCryptCreateEncryptedCollectionError", { enumerable: true, get: function () { return MongoCryptCreateEncryptedCollectionError; } });
Object.defineProperty(exports, "MongoCryptError", { enumerable: true, get: function () { return MongoCryptError; } });
Object.defineProperty(exports, "MongoCryptInvalidArgumentError", { enumerable: true, get: function () { return MongoCryptInvalidArgumentError; } });
Object.defineProperty(exports, "MongoCryptKMSRequestNetworkTimeoutError", { enumerable: true, get: function () { return MongoCryptKMSRequestNetworkTimeoutError; } });
Object.defineProperty(exports, "MongoClientAuthProviders", { enumerable: true, get: function () { return MongoClientAuthProviders; } });
