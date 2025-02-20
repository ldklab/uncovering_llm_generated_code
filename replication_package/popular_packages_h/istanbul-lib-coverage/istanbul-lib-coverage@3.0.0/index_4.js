'use strict';

/**
 * This module exports functions to create and manipulate coverage objects.
 * Coverage objects include file coverage, coverage maps, and coverage summaries.
 * It provides functionality to create these objects and also re-export their classes.
 */

const { FileCoverage } = require('./lib/file-coverage');
const { CoverageMap } = require('./lib/coverage-map');
const { CoverageSummary } = require('./lib/coverage-summary');

module.exports = {
    /**
     * Creates a CoverageSummary object.
     * If the provided object is already an instance of CoverageSummary, it is returned.
     * Otherwise, a new instance is created using the provided object.
     *
     * @param {Object} obj An optional argument that is passed to the CoverageSummary constructor.
     * @returns {CoverageSummary}
     */
    createCoverageSummary(obj) {
        return (obj instanceof CoverageSummary) ? obj : new CoverageSummary(obj);
    },

    /**
     * Creates a CoverageMap object.
     * If the provided object is already an instance of CoverageMap, it is returned.
     * Otherwise, a new instance is created using the provided object.
     *
     * @param {Object} obj An optional argument that is passed to the CoverageMap constructor.
     * @returns {CoverageMap}
     */
    createCoverageMap(obj) {
        return (obj instanceof CoverageMap) ? obj : new CoverageMap(obj);
    },

    /**
     * Creates a FileCoverage object.
     * If the provided object is already an instance of FileCoverage, it is returned.
     * Otherwise, a new instance is created using the provided object.
     *
     * @param {Object} obj An optional argument that is passed to the FileCoverage constructor.
     * @returns {FileCoverage}
     */
    createFileCoverage(obj) {
        return (obj instanceof FileCoverage) ? obj : new FileCoverage(obj);
    },

    /** Classes are exported for reuse */
    classes: {
        FileCoverage
    }
};
