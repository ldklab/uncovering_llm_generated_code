const { defaults } = require('@istanbuljs/schema');
const Instrumenter = require('./instrumenter');
const programVisitor = require('./visitor');
const readInitialCoverage = require('./read-coverage');

/**
 * Factory function to create an instrumenter with the given options.
 * @param {Object} opts - Options for the instrumenter.
 * @returns {Instrumenter} New instrumenter instance initialized with options.
 */
function createInstrumenter(opts) {
    return new Instrumenter(opts);
}

module.exports = {
    createInstrumenter,
    programVisitor,
    readInitialCoverage,
    defaultOpts: defaults.instrumenter
};
