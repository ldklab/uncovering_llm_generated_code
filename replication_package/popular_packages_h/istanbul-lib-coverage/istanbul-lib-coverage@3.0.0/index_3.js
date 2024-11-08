/*
 Copyright 2012-2015, Yahoo Inc.
 Licensed under the New BSD License.
 */

'use strict';

// Import required classes from their respective modules
const { FileCoverage } = require('./lib/file-coverage');
const { CoverageMap } = require('./lib/coverage-map');
const { CoverageSummary } = require('./lib/coverage-summary');

// Export the functions and classes
module.exports = {
    // Creates and returns a CoverageSummary instance
    createCoverageSummary(obj) {
        return (obj && obj instanceof CoverageSummary) ? obj : new CoverageSummary(obj);
    },
    
    // Creates and returns a CoverageMap instance
    createCoverageMap(obj) {
        return (obj && obj instanceof CoverageMap) ? obj : new CoverageMap(obj);
    },
    
    // Creates and returns a FileCoverage instance
    createFileCoverage(obj) {
        return (obj && obj instanceof FileCoverage) ? obj : new FileCoverage(obj);
    },
    
    // Export classes for reuse
    classes: {
        FileCoverage
    }
};
