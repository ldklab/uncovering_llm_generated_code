'use strict'

const ls = require('./ls.js')
const get = require('./get.js')
const put = require('./put.js')
const rm = require('./rm.js')
const verify = require('./verify.js')
const { clearMemoized } = require('./lib/memoization.js')
const tmp = require('./lib/util/tmp.js')

// Exporting the functionalities for external use
module.exports = {
  // List functionality and its streaming variant
  ls: Object.assign(ls, {
    stream: ls.stream,
  }),

  // Get functionality with various variations
  get: Object.assign(get, {
    byDigest: get.byDigest,
    sync: Object.assign(get.sync, {
      byDigest: get.sync.byDigest,
    }),
    stream: Object.assign(get.stream, {
      byDigest: get.stream.byDigest,
    }),
    copy: Object.assign(get.copy, {
      byDigest: get.copy.byDigest,
    }),
    info: get.info,
    hasContent: Object.assign(get.hasContent, {
      sync: get.hasContent.sync,
    }),
  }),

  // Put functionality and its streaming variant
  put: Object.assign(put, {
    stream: put.stream,
  }),

  // Remove functionality with specific and general removal methods
  rm: Object.assign(rm.entry, {
    all: rm.all,
    entry: rm.entry,
    content: rm.content,
  }),

  // Functionality to clear memoized data
  clearMemoized: clearMemoized,

  // Temporary directory management functionality
  tmp: {
    mkdir: tmp.mkdir,
    withTmp: tmp.withTmp,
  },

  // Verification functionality and its last run status
  verify: Object.assign(verify, {
    lastRun: verify.lastRun,
  }),
}
