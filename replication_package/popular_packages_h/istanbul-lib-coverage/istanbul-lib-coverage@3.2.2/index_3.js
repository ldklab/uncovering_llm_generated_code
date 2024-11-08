'use strict';

const { FileCoverage } = require('./lib/file-coverage');
const { CoverageMap } = require('./lib/coverage-map');
const { CoverageSummary } = require('./lib/coverage-summary');

const createCoverageSummary = (obj) => {
    return obj instanceof CoverageSummary ? obj : new CoverageSummary(obj);
};

const createCoverageMap = (obj) => {
    return obj instanceof CoverageMap ? obj : new CoverageMap(obj);
};

const createFileCoverage = (obj) => {
    return obj instanceof FileCoverage ? obj : new FileCoverage(obj);
};

module.exports = {
    createCoverageSummary,
    createCoverageMap,
    createFileCoverage,
    classes: {
        FileCoverage
    }
};
