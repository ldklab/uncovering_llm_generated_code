'use strict';

const Client = require('./lib/core/client');
const errors = require('./lib/core/errors');
const Pool = require('./lib/pool');

// Extend Client prototype with various methods
Object.assign(Client.prototype, {
  request: require('./lib/client-request'),
  stream: require('./lib/client-stream'),
  pipeline: require('./lib/client-pipeline'),
  upgrade: require('./lib/client-upgrade'),
  connect: require('./lib/client-connect')
});

// Extend Pool prototype with the same methods as Client
Object.assign(Pool.prototype, {
  request: require('./lib/client-request'),
  stream: require('./lib/client-stream'),
  pipeline: require('./lib/client-pipeline'),
  upgrade: require('./lib/client-upgrade'),
  connect: require('./lib/client-connect')
});

// Main undici function creating a new Pool
function undici(url, opts) {
  return new Pool(url, opts);
}

// Attach Pool, Client, and errors to undici function
undici.Pool = Pool;
undici.Client = Client;
undici.errors = errors;

// Export the undici module
module.exports = undici;
