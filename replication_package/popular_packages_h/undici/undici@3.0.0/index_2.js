markdown
'use strict'

const Client = require('./lib/core/client');
const errors = require('./lib/core/errors');
const Pool = require('./lib/pool');

const clientMethods = ['./lib/client-request', './lib/client-stream', './lib/client-pipeline', './lib/client-upgrade', './lib/client-connect'];

clientMethods.forEach(method => {
  Client.prototype[method.split('-').pop()] = require(method);
  Pool.prototype[method.split('-').pop()] = require(method);
});

function undici(url, opts) {
  return new Pool(url, opts);
}

undici.Pool = Pool;
undici.Client = Client;
undici.errors = errors;

module.exports = undici;
