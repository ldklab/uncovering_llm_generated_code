'use strict';

// Import required modules
const { FileCoverage } = require('./lib/file-coverage');
const { CoverageMap } = require('./lib/coverage-map');
const { CoverageSummary } = require('./lib/coverage-summary');

// Export the API
module.exports = {
    // Create a new or return existing CoverageSummary object
    createCoverageSummary(obj) {
        return obj instanceof CoverageSummary ? obj : new CoverageSummary(obj);
    },

    // Create a new or return existing CoverageMap object
    createCoverageMap(obj) {
        return obj instanceof CoverageMap ? obj : new CoverageMap(obj);
    },

    // Create a new or return existing FileCoverage object
    createFileCoverage(obj) {
        return obj instanceof FileCoverage ? obj : new FileCoverage(obj);
    },

    // Export FileCoverage class for reuse
    classes: {
        FileCoverage
    }
};
