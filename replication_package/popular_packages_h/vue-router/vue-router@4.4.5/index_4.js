'use strict';

const env = process.env.NODE_ENV;
const prodFile = './dist/vue-router.prod.cjs';
const devFile = './dist/vue-router.cjs';
const fileToExport = (env === 'production') ? prodFile : devFile;

module.exports = require(fileToExport);
