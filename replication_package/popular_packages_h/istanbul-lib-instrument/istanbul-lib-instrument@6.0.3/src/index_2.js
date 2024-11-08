const { defaults } = require('@istanbuljs/schema');
const Instrumenter = require('./instrumenter');
const programVisitor = require('./visitor');
const readInitialCoverage = require('./read-coverage');

/**
 * Initializes an Instrumenter instance with the given options.
 * 
 * @param {Object} opts - Configuration options for the Instrumenter.
 * @returns {Instrumenter} A new Instrumenter instance.
 */
function createInstrumenter(opts) {
    return new Instrumenter(opts);
}

// Export the module's functionalities
module.exports = {
    createInstrumenter,
    programVisitor,
    readInitialCoverage,
    defaultOpts: defaults.instrumenter
};
