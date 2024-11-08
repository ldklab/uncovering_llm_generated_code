"use strict";

Object.defineProperty(exports, "__esModule", { value: true });

// Import and export MongoDB administrative classes
const { Admin } = require("./admin");
exports.Admin = Admin;

// Import and export bulk operations
const { OrderedBulkOperation } = require("./bulk/ordered");
exports.OrderedBulkOperation = OrderedBulkOperation;

const { UnorderedBulkOperation } = require("./bulk/unordered");
exports.UnorderedBulkOperation = UnorderedBulkOperation;

// Import and export change stream functionality
const { ChangeStream } = require("./change_stream");
exports.ChangeStream = ChangeStream;

// Import and export collection operations
const { Collection } = require("./collection");
exports.Collection = Collection;

// Import and export cursor-related classes
const { AbstractCursor } = require("./cursor/abstract_cursor");
exports.AbstractCursor = AbstractCursor;

const { AggregationCursor } = require("./cursor/aggregation_cursor");
exports.AggregationCursor = AggregationCursor;

const { FindCursor } = require("./cursor/find_cursor");
exports.FindCursor = FindCursor;

const { ListCollectionsCursor } = require("./cursor/list_collections_cursor");
exports.ListCollectionsCursor = ListCollectionsCursor;

const { ListIndexesCursor } = require("./cursor/list_indexes_cursor");
exports.ListIndexesCursor = ListIndexesCursor;

// Import and export database operations
const { Db } = require("./db");
exports.Db = Db;

// Import and export GridFS handling
const { GridFSBucket } = require("./gridfs");
exports.GridFSBucket = GridFSBucket;

const { GridFSBucketReadStream } = require("./gridfs/download");
exports.GridFSBucketReadStream = GridFSBucketReadStream;

const { GridFSBucketWriteStream } = require("./gridfs/upload");
exports.GridFSBucketWriteStream = GridFSBucketWriteStream;

// Import and export MongoClient class
const { MongoClient } = require("./mongo_client");
exports.MongoClient = MongoClient;

// Import and export session-related classes
const { CancellationToken } = require("./mongo_types");
exports.CancellationToken = CancellationToken;

const { ClientSession } = require("./sessions");
exports.ClientSession = ClientSession;

// Import and export BSON-related types
const {
    BSON, Binary, BSONRegExp, BSONSymbol, BSONType, Code, DBRef,
    Decimal128, Double, Int32, Long, MaxKey, MinKey, ObjectId, Timestamp, UUID
} = require("./bson");
Object.assign(exports, {
    BSON, Binary, BSONRegExp, BSONSymbol, BSONType, Code, DBRef,
    Decimal128, Double, Int32, Long, MaxKey, MinKey, ObjectId, Timestamp, UUID
});

// Import and export client-side encryption
const { ClientEncryption } = require("./client-side-encryption/client_encryption");
exports.ClientEncryption = ClientEncryption;

// Import and export change stream cursor
const { ChangeStreamCursor } = require("./cursor/change_stream_cursor");
exports.ChangeStreamCursor = ChangeStreamCursor;

// Import and export error handling
const errorModule = require("./error");
Object.assign(exports, errorModule);

// Import and export resource management
const { configureExplicitResourceManagement } = require("./resource_management");
exports.configureExplicitResourceManagement = configureExplicitResourceManagement;

// Import and export enums
const { BatchType } = require("./bulk/common");
exports.BatchType = BatchType;

const { AutoEncryptionLoggerLevel } = require("./client-side-encryption/auto_encrypter");
exports.AutoEncryptionLoggerLevel = AutoEncryptionLoggerLevel;

const { GSSAPICanonicalizationValue } = require("./cmap/auth/gssapi");
exports.GSSAPICanonicalizationValue = GSSAPICanonicalizationValue;

const { AuthMechanism } = require("./cmap/auth/providers");
exports.AuthMechanism = AuthMechanism;

const { Compressor } = require("./cmap/wire_protocol/compression");
exports.Compressor = Compressor;

const { CURSOR_FLAGS } = require("./cursor/abstract_cursor");
exports.CURSOR_FLAGS = CURSOR_FLAGS;

const { MongoErrorLabel } = require("./error");
exports.MongoErrorLabel = MongoErrorLabel;

const { ExplainVerbosity } = require("./explain");
exports.ExplainVerbosity = ExplainVerbosity;

const { ServerApiVersion } = require("./mongo_client");
exports.ServerApiVersion = ServerApiVersion;

const { ReturnDocument } = require("./operations/find_and_modify");
exports.ReturnDocument = ReturnDocument;

const { ProfilingLevel } = require("./operations/set_profiling_level");
exports.ProfilingLevel = ProfilingLevel;

const { ReadConcernLevel } = require("./read_concern");
exports.ReadConcernLevel = ReadConcernLevel;

const { ReadPreferenceMode } = require("./read_preference");
exports.ReadPreferenceMode = ReadPreferenceMode;

// Import and export server and topology types
const { ServerType, TopologyType } = require("./sdam/common");
exports.ServerType = ServerType;
exports.TopologyType = TopologyType;

// Import and export helper classes
const { ReadConcern } = require("./read_concern");
exports.ReadConcern = ReadConcern;

const { ReadPreference } = require("./read_preference");
exports.ReadPreference = ReadPreference;

const { WriteConcern } = require("./write_concern");
exports.WriteConcern = WriteConcern;

// Import and export events
const commandMonitoringEventsModule = require("./cmap/command_monitoring_events");
Object.assign(exports, commandMonitoringEventsModule);

const connectionPoolEventsModule = require("./cmap/connection_pool_events");
Object.assign(exports, connectionPoolEventsModule);

const sdamEventsModule = require("./sdam/events");
Object.assign(exports, sdamEventsModule);

const serverSelectionEventsModule = require("./sdam/server_selection_events");
Object.assign(exports, serverSelectionEventsModule);

const { SrvPollingEvent } = require("./sdam/srv_polling");
exports.SrvPollingEvent = SrvPollingEvent;

const clientEncryptionErrorsModule = require("./client-side-encryption/errors");
Object.assign(exports, clientEncryptionErrorsModule);

// Import and export authentication providers
const { MongoClientAuthProviders } = require("./mongo_client_auth_providers");
exports.MongoClientAuthProviders = MongoClientAuthProviders;
