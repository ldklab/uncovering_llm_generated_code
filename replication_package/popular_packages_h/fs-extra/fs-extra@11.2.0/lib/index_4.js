'use strict'

const fs = require('./fs');
const copy = require('./copy');
const empty = require('./empty');
const ensure = require('./ensure');
const json = require('./json');
const mkdirs = require('./mkdirs');
const move = require('./move');
const outputFile = require('./output-file');
const pathExists = require('./path-exists');
const remove = require('./remove');

module.exports = {
  // Export promiseified graceful-fs:
  ...fs,
  // Export extra methods:
  ...copy,
  ...empty,
  ...ensure,
  ...json,
  ...mkdirs,
  ...move,
  ...outputFile,
  ...pathExists,
  ...remove
}
