'use strict';

// Import modules for handling file and form data
const File = require('./File');
const Formidable = require('./Formidable');

// Import plugins and parsers from their directories
const plugins = require('./plugins/index');
const parsers = require('./parsers/index');

// Allow instantiation of Formidable without the `new` keyword
const formidableInstance = (...args) => new Formidable(...args);

// Export a customized object with properties for file handling, form handling, parsers, and plugins
module.exports = Object.assign(formidableInstance, {
  File,              // File module
  Formidable,        // Formidable class
  formidable: formidableInstance, // Instance of Formidable

  // Formidable class is also accessible through the alias IncomingForm
  IncomingForm: Formidable,

  // Spread all parser modules into this object, also attach them under `parsers` key
  ...parsers,
  parsers,

  // Provide default options and enabled plugins from the Formidable class definition
  defaultOptions: Formidable.DEFAULT_OPTIONS,
  enabledPlugins: Formidable.DEFAULT_OPTIONS.enabledPlugins,

  // Spread all plugin modules into a `plugins` property
  plugins: {
    ...plugins,
  },
});
