'use strict';

const File = require('./File');  // Importing the File module.
const Formidable = require('./Formidable');  // Importing the Formidable class or module.

// Importing required plugin and parser modules.
const plugins = require('./plugins/index');
const parsers = require('./parsers/index');

// Function to create an instance of Formidable without needing the 'new' keyword.
const formidable = (...args) => new Formidable(...args);

module.exports = Object.assign(formidable, {
  // Exporting File and Formidable constructors.
  File,
  Formidable,
  formidable, // Function to create Formidable instances.

  // Setting Formidable as IncomingForm for backward compatibility.
  IncomingForm: Formidable,

  // Adding parsers and exposing them separately as well.
  ...parsers,
  parsers,

  // Adding some default options from Formidable.
  defaultOptions: Formidable.DEFAULT_OPTIONS,
  enabledPlugins: Formidable.DEFAULT_OPTIONS.enabledPlugins,

  // Including the plugins object with all the modules.
  plugins: {
    ...plugins,
  },
});
