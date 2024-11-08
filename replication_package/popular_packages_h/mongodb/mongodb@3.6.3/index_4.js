'use strict';

// Import core functionalities and Instrumentation for monitoring
const core = require('./lib/core');
const Instrumentation = require('./lib/apm');

// Set up the connect function using mongo_client
const { connect: mongoConnect } = require('./lib/mongo_client');

// Augment the connect function with error classes
const errorClasses = [
  'MongoError', 'MongoNetworkError', 'MongoTimeoutError',
  'MongoServerSelectionError', 'MongoParseError', 'MongoWriteConcernError'
];
errorClasses.forEach(errorClass => {
  mongoConnect[errorClass] = core[errorClass];
});
mongoConnect.MongoBulkWriteError = require('./lib/bulk/common').BulkWriteError;
mongoConnect.BulkWriteError = mongoConnect.MongoBulkWriteError;

// Augment the connect function with driver classes
const driverClasses = {
  Admin: './lib/admin',
  MongoClient: './lib/mongo_client',
  Db: './lib/db',
  Collection: './lib/collection',
  Server: './lib/topologies/server',
  ReplSet: './lib/topologies/replset',
  Mongos: './lib/topologies/mongos',
  GridStore: './lib/gridfs/grid_store',
  Chunk: './lib/gridfs/chunk',
  AggregationCursor: './lib/aggregation_cursor',
  CommandCursor: './lib/command_cursor',
  Cursor: './lib/cursor',
  GridFSBucket: './lib/gridfs-stream',
  CoreServer: core.Server,   // For testing purposes only
  CoreConnection: core.Connection
};
Object.entries(driverClasses).forEach(([key, path]) => {
  mongoConnect[key] = require(path);
});

// Include BSON types
const bsonTypes = [
  'Binary', 'Code', 'Map', 'DBRef', 'Double', 'Int32', 'Long', 'MinKey', 'MaxKey',
  'ObjectID', 'Symbol', 'Timestamp', 'BSONRegExp', 'Decimal128'
];
bsonTypes.forEach(type => {
  mongoConnect[type] = core.BSON[type];
});
mongoConnect.ObjectId = mongoConnect.ObjectID;

// Assign helper methods
mongoConnect.ReadPreference = core.ReadPreference;
mongoConnect.Logger = core.Logger;

// Add connect method to its own export object
mongoConnect.connect = mongoConnect;

// Instrumentation functionality
mongoConnect.instrument = function(options, callback) {
  if (typeof options === 'function') [callback, options] = [options, {}];

  const instrumentation = new Instrumentation();
  instrumentation.instrument(mongoConnect.MongoClient, callback);
  return instrumentation;
};

// Export the connect function with all augmentations
module.exports = mongoConnect;
