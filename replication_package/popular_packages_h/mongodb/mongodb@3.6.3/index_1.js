'use strict';

// Import core functionality and instrumentation
const core = require('./lib/core');
const Instrumentation = require('./lib/apm');

// Import the primary connect function
const mongoClientModule = require('./lib/mongo_client');
const connect = mongoClientModule.connect;

// Attach error classes from core to the connect function for export
Object.assign(connect, {
  MongoError: core.MongoError,
  MongoNetworkError: core.MongoNetworkError,
  MongoTimeoutError: core.MongoTimeoutError,
  MongoServerSelectionError: core.MongoServerSelectionError,
  MongoParseError: core.MongoParseError,
  MongoWriteConcernError: core.MongoWriteConcernError,
  MongoBulkWriteError: require('./lib/bulk/common').BulkWriteError,
  BulkWriteError: require('./lib/bulk/common').BulkWriteError
});

// Attach key classes to the connect function for users to easily interact with MongoDB
Object.assign(connect, {
  Admin: require('./lib/admin'),
  MongoClient: require('./lib/mongo_client'),
  Db: require('./lib/db'),
  Collection: require('./lib/collection'),
  Server: require('./lib/topologies/server'),
  ReplSet: require('./lib/topologies/replset'),
  Mongos: require('./lib/topologies/mongos'),
  ReadPreference: core.ReadPreference,
  GridStore: require('./lib/gridfs/grid_store'),
  Chunk: require('./lib/gridfs/chunk'),
  Logger: core.Logger,
  AggregationCursor: require('./lib/aggregation_cursor'),
  CommandCursor: require('./lib/command_cursor'),
  Cursor: require('./lib/cursor'),
  GridFSBucket: require('./lib/gridfs-stream'),
  CoreServer: core.Server, // Mainly for testing
  CoreConnection: core.Connection // Mainly for testing
});

// Export BSON types by attaching them to the connect function
Object.assign(connect, {
  Binary: core.BSON.Binary,
  Code: core.BSON.Code,
  Map: core.BSON.Map,
  DBRef: core.BSON.DBRef,
  Double: core.BSON.Double,
  Int32: core.BSON.Int32,
  Long: core.BSON.Long,
  MinKey: core.BSON.MinKey,
  MaxKey: core.BSON.MaxKey,
  ObjectID: core.BSON.ObjectID,
  ObjectId: core.BSON.ObjectID,
  Symbol: core.BSON.Symbol,
  Timestamp: core.BSON.Timestamp,
  BSONRegExp: core.BSON.BSONRegExp,
  Decimal128: core.BSON.Decimal128
});

// Connect function can be used directly
connect.connect = connect;

// Instrumentation setup function
connect.instrument = function(options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  const instrumentation = new Instrumentation();
  instrumentation.instrument(connect.MongoClient, callback);
  return instrumentation;
};

// Export the connect function with all attached properties
module.exports = connect;
