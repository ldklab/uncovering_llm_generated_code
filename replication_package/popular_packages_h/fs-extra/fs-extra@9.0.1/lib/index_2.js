'use strict'

const fs = require('fs')
const fsUtils = {
  // Collect and combine all utilities from different modules.
  ...require('./fs'),
  ...require('./copy-sync'),
  ...require('./copy'),
  ...require('./empty'),
  ...require('./ensure'),
  ...require('./json'),
  ...require('./mkdirs'),
  ...require('./move-sync'),
  ...require('./move'),
  ...require('./output'),
  ...require('./path-exists'),
  ...require('./remove'),
}

// Define the 'promises' property dynamically to avoid premature ExperimentalWarning.
if (Object.getOwnPropertyDescriptor(fs, 'promises')) {
  Object.defineProperty(fsUtils, 'promises', {
    get () {
      return fs.promises
    }
  })
}

module.exports = fsUtils
