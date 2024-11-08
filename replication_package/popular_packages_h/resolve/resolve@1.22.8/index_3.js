const async = require('./lib/async');
const core = require('./lib/core');
const isCore = require('./lib/is-core');
const sync = require('./lib/sync');

async.core = core;
async.isCore = isCore;
async.sync = sync;

module.exports = async;
