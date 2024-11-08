'use strict';

// Import core functionality and error classes
const core = require('./lib/core');
const Instrumentation = require('./lib/apm');

// Import the MongoDB client and its connect function
const { connect } = require('./lib/mongo_client');

// Attach error classes to connect
connect.MongoError = core.MongoError;
connect.MongoNetworkError = core.MongoNetworkError;
connect.MongoTimeoutError = core.MongoTimeoutError;
connect.MongoServerSelectionError = core.MongoServerSelectionError;
connect.MongoParseError = core.MongoParseError;
connect.MongoWriteConcernError = core.MongoWriteConcernError;
connect.MongoBulkWriteError = require('./lib/bulk/common').BulkWriteError;
connect.BulkWriteError = connect.MongoBulkWriteError;

// Export MongoDB driver classes and utilities via connect
connect.Admin = require('./lib/admin');
connect.MongoClient = require('./lib/mongo_client');
connect.Db = require('./lib/db');
connect.Collection = require('./lib/collection');
connect.Server = require('./lib/topologies/server');
connect.ReplSet = require('./lib/topologies/replset');
connect.Mongos = require('./lib/topologies/mongos');
connect.ReadPreference = core.ReadPreference;
connect.GridStore = require('./lib/gridfs/grid_store');
connect.Chunk = require('./lib/gridfs/chunk');
connect.Logger = core.Logger;
connect.AggregationCursor = require('./lib/aggregation_cursor');
connect.CommandCursor = require('./lib/command_cursor');
connect.Cursor = require('./lib/cursor');
connect.GridFSBucket = require('./lib/gridfs-stream');

// Core classes for additional use cases like testing
connect.CoreServer = core.Server;
connect.CoreConnection = core.Connection;

// Export BSON data types to be used with MongoDB
const { BSON } = core;
connect.Binary = BSON.Binary;
connect.Code = BSON.Code;
connect.Map = BSON.Map;
connect.DBRef = BSON.DBRef;
connect.Double = BSON.Double;
connect.Int32 = BSON.Int32;
connect.Long = BSON.Long;
connect.MinKey = BSON.MinKey;
connect.MaxKey = BSON.MaxKey;
connect.ObjectID = BSON.ObjectID;
connect.ObjectId = BSON.ObjectID;
connect.Symbol = BSON.Symbol;
connect.Timestamp = BSON.Timestamp;
connect.BSONRegExp = BSON.BSONRegExp;
connect.Decimal128 = BSON.Decimal128;

// Attach the connect method to the exported object
connect.connect = connect;

// Implement the instrumentation functionality
connect.instrument = function(options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  
  const instrumentation = new Instrumentation();
  instrumentation.instrument(connect.MongoClient, callback);
  return instrumentation;
};

// Export the connect function with all attached properties and methods
module.exports = connect;
