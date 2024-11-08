// Importing individual modules
const apiModule = require('./api');
const cssModule = require('./css');
const l10nModule = require('./l10n');

// Exporting the imported modules as a single module
module.exports = {
  api: apiModule,
  css: cssModule,
  l10n: l10nModule,
};
