'use strict';

const looseEnvify = require('./loose-envify');

module.exports = looseEnvify(process.env);
