// Importing dependencies required for the instrumenter functionality.
const { defaults } = require('@istanbuljs/schema'); // Importing default options for instrumenter from istanbul schema.
const Instrumenter = require('./instrumenter'); // Importing the Instrumenter class from a local module.
const programVisitor = require('./visitor'); // Importing a visitor function from a local module.
const readInitialCoverage = require('./read-coverage'); // Importing a function to read initial coverage from a local module.

/**
 * createInstrumenter initializes a new Instrumenter instance with
 * given options.
 * @param {Object} opts - Options to customize the instrumenter. Refer to the Instrumenter class documentation.
 * @returns {Instrumenter} A new Instrumenter instance configured with the specified options.
 */
function createInstrumenter(opts) {
    return new Instrumenter(opts); // Creating and returning a new instance of Instrumenter.
}

module.exports = {
    createInstrumenter, // Exporting createInstrumenter function for creating instrumenter instances.
    programVisitor, // Exporting programVisitor for external use.
    readInitialCoverage, // Exporting readInitialCoverage function for external use.
    defaultOpts: defaults.instrumenter // Exporting default instrumenter options for external use.
};
