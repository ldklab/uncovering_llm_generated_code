'use strict';

// Import dependencies
const File = require('./File');
const Formidable = require('./Formidable');

// Import plugins and parsers
const plugins = require('./plugins/index');
const parsers = require('./parsers/index');

// Create a factory function for Formidable that allows use without 'new' keyword
const formidable = (...args) => new Formidable(...args);

// Expose necessary elements through module.exports
module.exports = {
  // The main export function that initializes Formidable
  formidable,
  
  // Direct exports for other functionalities
  File,
  Formidable,
  
  // Alias for Formidable
  IncomingForm: Formidable,

  // Spread parsers directly into the exports
  ...parsers,

  // Explicit parsers export
  parsers,

  // Export default options and enabled plugins from Formidable
  defaultOptions: Formidable.DEFAULT_OPTIONS,
  enabledPlugins: Formidable.DEFAULT_OPTIONS.enabledPlugins,

  // Attach plugins to the export
  plugins: {
    ...plugins,
  },
};
