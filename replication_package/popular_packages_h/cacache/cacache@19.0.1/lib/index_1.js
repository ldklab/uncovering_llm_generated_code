'use strict';

const get = require('./get.js');
const put = require('./put.js');
const rm = require('./rm.js');
const verify = require('./verify.js');
const { clearMemoized } = require('./memoization.js');
const tmp = require('./util/tmp.js');
const index = require('./entry-index.js');

const exports = {};

// Index Operations
exports.index = {
  compact: index.compact,
  insert: index.insert,
  ls: index.ls,
  lsStream: index.lsStream
};

// Retrieval Operations
exports.get = {
  ...get,
  byDigest: get.byDigest,
  stream: get.stream,
  streamByDigest: get.stream.byDigest,
  copy: get.copy,
  copyByDigest: get.copy.byDigest,
  info: get.info,
  hasContent: get.hasContent
};

// Storage Operations
exports.put = {
  ...put,
  stream: put.stream
};

// Removal Operations
exports.rm = {
  entry: rm.entry,
  all: rm.all,
  content: rm.content
};

// Memoization Management
exports.clearMemoized = clearMemoized;

// Temporary File Utilities
exports.tmp = {
  mkdir: tmp.mkdir,
  withTmp: tmp.withTmp
};

// Verification Operations
exports.verify = {
  ...verify,
  lastRun: verify.lastRun
};

module.exports = exports;
