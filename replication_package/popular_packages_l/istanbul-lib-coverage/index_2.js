// Refactored istanbul-lib-coverage.js

class CoverageSummary {
    constructor() {
        this.total = 0;
        this.covered = 0;
        this.skipped = 0;
        this.pct = 0;
    }

    merge(other) {
        this.total += other.total;
        this.covered += other.covered;
        this.skipped += other.skipped;
        this.pct = this.total ? (this.covered / this.total) * 100 : 0;
    }
}

class CoverageData {
    constructor(data) {
        this.data = data;
    }

    toSummary() {
        const summary = new CoverageSummary();
        const lines = this.data.lines;

        summary.total = Object.keys(lines).length;
        summary.covered = Object.values(lines).filter(value => value > 0).length;
        summary.skipped = summary.total - summary.covered;
        summary.pct = summary.covered ? (summary.covered / summary.total) * 100 : 0;

        return summary;
    }
}

class CoverageMap {
    constructor(coverageData) {
        this.coverageMap = coverageData || {};
    }

    merge(otherMap) {
        for (const file in otherMap.coverageMap) {
            if (this.coverageMap[file]) {
                const currentLines = this.coverageMap[file].data.lines;
                const otherLines = otherMap.coverageMap[file].data.lines;

                for (const line in otherLines) {
                    currentLines[line] = (currentLines[line] || 0) + otherLines[line];
                }
            } else {
                this.coverageMap[file] = otherMap.coverageMap[file];
            }
        }
    }

    files() {
        return Object.keys(this.coverageMap);
    }

    fileCoverageFor(file) {
        return this.coverageMap[file];
    }
}

function createCoverageMap(coverageData) {
    const map = new CoverageMap(coverageData);
    for (const file in coverageData) {
        map.coverageMap[file] = new CoverageData(coverageData[file]);
    }
    return map;
}

function createCoverageSummary() {
    return new CoverageSummary();
}

module.exports = {
    createCoverageMap,
    createCoverageSummary
};

// Example usage
const libCoverage = require('./istanbul-lib-coverage');
const globalCoverageVar = {
    'file1.js': { lines: { 1: 1, 2: 0, 3: 1 } },
    'file2.js': { lines: { 1: 0, 2: 1 } }
};

const otherCoverageMap = {
    'file1.js': { lines: { 1: 0, 2: 1 } }
};

const map = libCoverage.createCoverageMap(globalCoverageVar);
const summary = libCoverage.createCoverageSummary();

map.merge(libCoverage.createCoverageMap(otherCoverageMap));

map.files().forEach(file => {
    const fileCoverage = map.fileCoverageFor(file);
    const fileSummary = fileCoverage.toSummary();
    summary.merge(fileSummary);
});

console.log('Global summary', summary);
