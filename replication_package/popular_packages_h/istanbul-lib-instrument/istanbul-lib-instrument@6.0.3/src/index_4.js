const istanbulSchema = require('@istanbuljs/schema');
const InstrumenterModule = require('./instrumenter');
const visitorFunction = require('./visitor');
const initialCoverageReader = require('./read-coverage');

/**
 * createInstrumenter initializes a new instrumenter using the
 * provided options.
 * @param {Object} options - Configuration options for the instrumenter.
 * Refer to the Instrumenter class documentation for details.
 */
function createInstrumenter(options) {
    return new InstrumenterModule(options);
}

module.exports = {
    createInstrumenter,
    programVisitor: visitorFunction,
    readInitialCoverage: initialCoverageReader,
    defaultOpts: istanbulSchema.defaults.instrumenter
};
