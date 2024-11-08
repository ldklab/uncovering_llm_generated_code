'use strict'

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
  },
  ls: index.ls,
  get: {
    ...get, // spread syntax to include all properties of get
    byDigest: get.byDigest,
    stream: get.stream,
    copy: get.copy,
    info: get.info,
    hasContent: get.hasContent,
  },
  put: put,
  rm: {
    entry: rm.entry,
    all: rm.all,
    content: rm.content,
  },
  clearMemoized: clearMemoized,
  tmp: {
    mkdir: tmp.mkdir,
    withTmp: tmp.withTmp,
  },
  verify: {
    ...verify, // spread syntax to include all properties of verify
    lastRun: verify.lastRun,
  }
};
