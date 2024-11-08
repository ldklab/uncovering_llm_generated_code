'use strict';

const looseEnvify = require('./loose-envify');
const environmentVariables = process.env;
const transformedEnv = looseEnvify(environmentVariables);

module.exports = transformedEnv;
