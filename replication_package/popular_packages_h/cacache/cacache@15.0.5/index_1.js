'use strict';

const ls = require('./ls.js');
const get = require('./get.js');
const put = require('./put.js');
const rm = require('./rm.js');
const verify = require('./verify.js');
const { clearMemoized } = require('./lib/memoization.js');
const tmp = require('./lib/util/tmp.js');

const moduleExports = {};

// List function and its stream variant
moduleExports.ls = ls;
moduleExports.ls.stream = ls.stream;

// Get function with various subfunctions
moduleExports.get = get;
moduleExports.get.byDigest = get.byDigest;
moduleExports.get.sync = get.sync;
moduleExports.get.sync.byDigest = get.sync.byDigest;
moduleExports.get.stream = get.stream;
moduleExports.get.stream.byDigest = get.stream.byDigest;
moduleExports.get.copy = get.copy;
moduleExports.get.copy.byDigest = get.copy.byDigest;
moduleExports.get.info = get.info;
moduleExports.get.hasContent = get.hasContent;
moduleExports.get.hasContent.sync = get.hasContent.sync;

// Put function and its stream variant
moduleExports.put = put;
moduleExports.put.stream = put.stream;

// Remove function with entry and content deletion capabilities
moduleExports.rm = rm.entry;
moduleExports.rm.all = rm.all;
moduleExports.rm.entry = rm.entry;
moduleExports.rm.content = rm.content;

// Clear memoization cache function
moduleExports.clearMemoized = clearMemoized;

// Temporary directory utilities
moduleExports.tmp = {};
moduleExports.tmp.mkdir = tmp.mkdir;
moduleExports.tmp.withTmp = tmp.withTmp;

// Verification function and its last run record
moduleExports.verify = verify;
moduleExports.verify.lastRun = verify.lastRun;

module.exports = moduleExports;
