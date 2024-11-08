'use strict';

const { FileCoverage } = require('./lib/file-coverage');
const { CoverageMap } = require('./lib/coverage-map');
const { CoverageSummary } = require('./lib/coverage-summary');

function createInstance(definition, obj) {
    if (obj && obj instanceof definition) {
        return obj;
    }
    return new definition(obj);
}

module.exports = {
    createCoverageSummary(obj) {
        return createInstance(CoverageSummary, obj);
    },
    createCoverageMap(obj) {
        return createInstance(CoverageMap, obj);
    },
    createFileCoverage(obj) {
        return createInstance(FileCoverage, obj);
    },
    classes: {
        FileCoverage
    }
};
