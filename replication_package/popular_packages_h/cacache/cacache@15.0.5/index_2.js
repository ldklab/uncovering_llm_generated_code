'use strict';

const ls = require('./ls.js');
const get = require('./get.js');
const put = require('./put.js');
const rm = require('./rm.js');
const verify = require('./verify.js');
const { clearMemoized } = require('./lib/memoization.js');
const tmp = require('./lib/util/tmp.js');

const exportedFunctions = {
  ls: {
    ...ls,
    stream: ls.stream,
  },
  get: {
    ...get,
    byDigest: get.byDigest,
    sync: get.sync,
    syncByDigest: get.sync.byDigest,
    stream: get.stream,
    streamByDigest: get.stream.byDigest,
    copy: get.copy,
    copyByDigest: get.copy.byDigest,
    info: get.info,
    hasContent: get.hasContent,
    hasContentSync: get.hasContent.sync,
  },
  put: {
    ...put,
    stream: put.stream,
  },
  rm: {
    entry: rm.entry,
    all: rm.all,
    entryAlias: rm.entry,
    content: rm.content,
  },
  verify: {
    ...verify,
    lastRun: verify.lastRun,
  },
  clearMemoized,
  tmp: {
    mkdir: tmp.mkdir,
    withTmp: tmp.withTmp,
  },
};

module.exports = exportedFunctions;
