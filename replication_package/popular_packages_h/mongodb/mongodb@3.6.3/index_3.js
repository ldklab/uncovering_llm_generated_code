'use strict';

// Import core module components
const core = require('./lib/core');
const Instrumentation = require('./lib/apm');

// Import the MongoDB connect setup
const { connect: mongoConnect } = require('./lib/mongo_client');

// Enhance the connect object with error classes
Object.assign(mongoConnect, {
  MongoError: core.MongoError,
  MongoNetworkError: core.MongoNetworkError,
  MongoTimeoutError: core.MongoTimeoutError,
  MongoServerSelectionError: core.MongoServerSelectionError,
  MongoParseError: core.MongoParseError,
  MongoWriteConcernError: core.MongoWriteConcernError,
  MongoBulkWriteError: require('./lib/bulk/common').BulkWriteError,
  BulkWriteError: require('./lib/bulk/common').BulkWriteError
});

// Add MongoDB driver class references
Object.assign(mongoConnect, {
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
  CoreServer: core.Server,
  CoreConnection: core.Connection
});

// Export BSON data types
Object.assign(mongoConnect, {
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

// Add connect method
mongoConnect.connect = mongoConnect;

// Define the instrumentation method
mongoConnect.instrument = (options, callback) => {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  const instrumentation = new Instrumentation();
  instrumentation.instrument(mongoConnect.MongoClient, callback);
  return instrumentation;
};

// Export the module
module.exports = mongoConnect;
