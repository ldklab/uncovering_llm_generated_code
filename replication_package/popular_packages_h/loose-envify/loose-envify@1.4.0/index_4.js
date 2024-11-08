'use strict';

const looseEnvify = require('./loose-envify');

// Execute looseEnvify with process.env and export the result
module.exports = looseEnvify(process.env);
