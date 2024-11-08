// Importing various components from the './lib' directory
const core = require('./lib/core');
const isCore = require('./lib/is-core');
const sync = require('./lib/sync');

// Creating an async object and assigning the imported components to it
const async = {
  core,
  isCore,
  sync,
};

// Exporting the async object as a module
module.exports = async;
