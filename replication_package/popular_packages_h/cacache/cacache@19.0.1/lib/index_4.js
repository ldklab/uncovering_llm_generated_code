'use strict';

const get = require('./get.js');
const put = require('./put.js');
const rm = require('./rm.js');
const verify = require('./verify.js');
const { clearMemoized } = require('./memoization.js');
const tmp = require('./util/tmp.js');
const index = require('./entry-index.js');

module.exports = {
  index: {
    compact: index.compact,
    insert: index.insert,
    ls: index.ls,
    lsStream: index.lsStream
  },
  get: {
    ...get,
    byDigest: get.byDigest,
    stream: get.stream,
    streamByDigest: get.stream.byDigest,
    copy: get.copy,
    copyByDigest: get.copy.byDigest,
    info: get.info,
    hasContent: get.hasContent
  },
  put: {
    ...put,
    stream: put.stream
  },
  rm: {
    entry: rm.entry,
    all: rm.all,
    content: rm.content
  },
  clearMemoized,
  tmp: {
    mkdir: tmp.mkdir,
    withTmp: tmp.withTmp
  },
  verify: {
    ...verify,
    lastRun: verify.lastRun
  }
};
