'use strict';

// Import Mongoose from the local 'lib' directory
const mongoose = require('./lib/');

// Default export for CommonJS import
module.exports = mongoose;

// Additional exports to support import destructuring and ES style module imports
module.exports.default = mongoose;
module.exports.mongoose = mongoose;

// Re-export various properties and utilities provided by Mongoose
const reExportedProperties = [
  'cast', 'STATES', 'setDriver', 'set', 'get', 'createConnection', 'connect', 
  'disconnect', 'startSession', 'pluralize', 'model', 'deleteModel', 'modelNames', 
  'plugin', 'connections', 'version', 'Aggregate', 'Mongoose', 'Schema', 
  'SchemaType', 'SchemaTypes', 'VirtualType', 'Types', 'Query', 'Model', 
  'Document', 'ObjectId', 'isValidObjectId', 'isObjectIdOrHexString', 'syncIndexes', 
  'Decimal128', 'Mixed', 'Date', 'Number', 'Error', 'MongooseError', 'now', 
  'CastError', 'SchemaTypeOptions', 'mongo', 'mquery', 'sanitizeFilter', 'trusted', 
  'skipMiddlewareFunction', 'overwriteMiddlewareResult'
];

for (const property of reExportedProperties) {
  module.exports[property] = mongoose[property];
}

// Connection related properties are not re-exported for ESM
// module.exports.connection = mongoose.connection;
// module.exports.Collection = mongoose.Collection;
// module.exports.Connection = mongoose.Connection;
