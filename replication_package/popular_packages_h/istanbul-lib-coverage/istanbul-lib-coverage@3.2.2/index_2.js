'use strict';

// Import the necessary classes from the corresponding files.
const { FileCoverage } = require('./lib/file-coverage');
const { CoverageMap } = require('./lib/coverage-map');
const { CoverageSummary } = require('./lib/coverage-summary');

// Define the module exports for creating coverage-related objects.
module.exports = {
    // Create or return an existing CoverageSummary instance.
    createCoverageSummary(obj) {
        return obj instanceof CoverageSummary ? obj : new CoverageSummary(obj);
    },
    // Create or return an existing CoverageMap instance.
    createCoverageMap(obj) {
        return obj instanceof CoverageMap ? obj : new CoverageMap(obj);
    },
    // Create or return an existing FileCoverage instance.
    createFileCoverage(obj) {
        return obj instanceof FileCoverage ? obj : new FileCoverage(obj);
    }
};

// Export the FileCoverage class for reuse.
module.exports.classes = {
    FileCoverage
};
