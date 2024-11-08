'use strict';

const Client = require('./lib/core/client');
const errors = require('./lib/core/errors');
const Pool = require('./lib/pool');

const clientExtensions = [
  { method: 'request', module: './lib/client-request' },
  { method: 'stream', module: './lib/client-stream' },
  { method: 'pipeline', module: './lib/client-pipeline' },
  { method: 'upgrade', module: './lib/client-upgrade' },
  { method: 'connect', module: './lib/client-connect' }
];

clientExtensions.forEach(({ method, module }) => {
  const methodImplementation = require(module);
  Client.prototype[method] = methodImplementation;
  Pool.prototype[method] = methodImplementation;
});

function undici(url, opts) {
  return new Pool(url, opts);
}

undici.Pool = Pool;
undici.Client = Client;
undici.errors = errors;

module.exports = undici;
