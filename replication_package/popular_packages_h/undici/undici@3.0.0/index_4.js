'use strict';

const Client = require('./lib/core/client');
const errors = require('./lib/core/errors');
const Pool = require('./lib/pool');

function extendWithMethods(targetPrototype, methods) {
  for (const [name, method] of Object.entries(methods)) {
    targetPrototype[name] = method;
  }
}

const clientMethods = {
  request: require('./lib/client-request'),
  stream: require('./lib/client-stream'),
  pipeline: require('./lib/client-pipeline'),
  upgrade: require('./lib/client-upgrade'),
  connect: require('./lib/client-connect')
};

extendWithMethods(Client.prototype, clientMethods);
extendWithMethods(Pool.prototype, clientMethods);

function undici(url, opts) {
  return new Pool(url, opts);
}

undici.Pool = Pool;
undici.Client = Client;
undici.errors = errors;

module.exports = undici;
