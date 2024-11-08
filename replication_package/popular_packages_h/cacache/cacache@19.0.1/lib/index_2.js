'use strict';

const get = require('./get.js');
const put = require('./put.js');
const rm = require('./rm.js');
const verify = require('./verify.js');
const { clearMemoized } = require('./memoization.js');
const tmp = require('./util/tmp.js');
const index = require('./entry-index.js');

const moduleExports = {};

// Organize index-related functionalities
moduleExports.index = {
  compact: index.compact,
  insert: index.insert
};

// Organize list-related functionalities
moduleExports.ls = index.ls;
moduleExports.ls.stream = index.lsStream;

// Organize get-related functionalities
moduleExports.get = {
  ...get,
  byDigest: get.byDigest,
  stream: get.stream,
  stream: {
    byDigest: get.stream.byDigest
  },
  copy: get.copy,
  copy: {
    byDigest: get.copy.byDigest
  },
  info: get.info,
  hasContent: get.hasContent
};

// Organize put-related functionalities
moduleExports.put = {
  ...put,
  stream: put.stream
};

// Organize remove-related functionalities
moduleExports.rm = {
  entry: rm.entry,
  all: rm.all,
  content: rm.content
};

// Memoization function
moduleExports.clearMemoized = clearMemoized;

// Organize temporary-related functionalities
moduleExports.tmp = {
  mkdir: tmp.mkdir,
  withTmp: tmp.withTmp
};

// Organize verification-related functionalities
moduleExports.verify = {
  ...verify,
  lastRun: verify.lastRun
};

// Export the organized module
module.exports = moduleExports;
