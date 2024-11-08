// istanbul-lib-coverage.js

class CoverageSummary {
    constructor() {
        this.total = 0;
        this.covered = 0;
        this.skipped = 0;
        this.pct = 0;
    }

    merge(summary) {
        this.total += summary.total;
        this.covered += summary.covered;
        this.skipped += summary.skipped;
        this.pct = (this.total > 0) ? (this.covered / this.total) * 100 : 0;
    }
}

class CoverageData {
    constructor(data) {
        this.data = data;
    }

    toSummary() {
        const summary = new CoverageSummary();
        const { lines } = this.data;

        summary.total = Object.keys(lines).length;
        summary.covered = Object.values(lines).filter(n => n > 0).length;
        summary.skipped = summary.total - summary.covered;
        summary.pct = (summary.covered / summary.total) * 100 || 0;

        return summary;
    }
}

class CoverageMap {
    constructor(initialCoverage = {}) {
        this.coverageMap = initialCoverage;
    }

    merge(anotherCoverageMap) {
        for (const file in anotherCoverageMap.coverageMap) {
            if (this.coverageMap[file]) {
                const existingData = this.coverageMap[file].data;
                const newData = anotherCoverageMap.coverageMap[file].data;

                for (const line in newData.lines) {
                    existingData.lines[line] = (existingData.lines[line] || 0) + newData.lines[line];
                }
            } else {
                this.coverageMap[file] = anotherCoverageMap.coverageMap[file];
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
    const coverageMap = new CoverageMap();
    for (const file in coverageData) {
        coverageMap.coverageMap[file] = new CoverageData(coverageData[file]);
    }
    return coverageMap;
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
const initialCoverage = {
    'file1.js': { lines: { 1: 1, 2: 0, 3: 1 } },
    'file2.js': { lines: { 1: 0, 2: 1 } }
};

const additionalCoverage = {
    'file1.js': { lines: { 1: 0, 2: 1 } }
};

const coverageMap = libCoverage.createCoverageMap(initialCoverage);
const coverageSummary = libCoverage.createCoverageSummary();

const otherCoverageMap = libCoverage.createCoverageMap(additionalCoverage);
coverageMap.merge(otherCoverageMap);

coverageMap.files().forEach(file => {
    const fileCoverage = coverageMap.fileCoverageFor(file);
    const fileSummary = fileCoverage.toSummary();
    coverageSummary.merge(fileSummary);
});

console.log('Global summary:', coverageSummary);
