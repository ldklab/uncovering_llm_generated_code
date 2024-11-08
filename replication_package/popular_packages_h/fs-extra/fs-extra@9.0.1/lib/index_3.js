'use strict';

const fs = require('fs');
const fsExports = require('./fs');
const copySync = require('./copy-sync');
const copy = require('./copy');
const empty = require('./empty');
const ensure = require('./ensure');
const json = require('./json');
const mkdirs = require('./mkdirs');
const moveSync = require('./move-sync');
const move = require('./move');
const output = require('./output');
const pathExists = require('./path-exists');
const remove = require('./remove');

const moduleExports = {
  ...fsExports,
  ...copySync,
  ...copy,
  ...empty,
  ...ensure,
  ...json,
  ...mkdirs,
  ...moveSync,
  ...move,
  ...output,
  ...pathExists,
  ...remove
};

if (Object.getOwnPropertyDescriptor(fs, 'promises')) {
  Object.defineProperty(moduleExports, 'promises', {
    get() {
      return fs.promises;
    }
  });
}

module.exports = moduleExports;
