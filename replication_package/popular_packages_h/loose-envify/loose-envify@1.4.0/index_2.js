'use strict';

const looseEnvify = require('./loose-envify');
const envTransformed = looseEnvify(process.env);

module.exports = envTransformed;
