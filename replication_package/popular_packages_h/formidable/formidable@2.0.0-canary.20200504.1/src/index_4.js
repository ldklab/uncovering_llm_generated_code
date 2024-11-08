'use strict';

const File = require('./File');
const Formidable = require('./Formidable');

const plugins = require('./plugins/index');
const parsers = require('./parsers/index');

// Create a wrapper function for Formidable to allow usage without `new` keyword
// Enables usage like `const formidable.IncomingForm = formidable` if needed
const formidable = (...args) => new Formidable(...args);

// Export an object that includes the wrapper function and other members
module.exports = Object.assign(formidable, {
  // Module exports
  File,                // Export the `File` class
  Formidable,          // Export the `Formidable` class
  formidable,          // Export the wrapper function for ease of use

  // Alias for creating new instances of Formidable
  IncomingForm: Formidable,

  // Spread in and export parsers
  ...parsers,          // Add all parser functions to the exports
  parsers,             // Explicitly export parsers as a grouped object

  // Other configs and options
  defaultOptions: Formidable.DEFAULT_OPTIONS,             // Default options for Formidable
  enabledPlugins: Formidable.DEFAULT_OPTIONS.enabledPlugins, // Default enabled plugins

  // Include and export plugins
  plugins: {
    ...plugins,        // Add all plugin modules to the exports
  },
});
