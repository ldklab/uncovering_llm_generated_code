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
    constructor(globalCoverageVar) {
        this.coverageMap = globalCoverageVar || {};
    }

    merge(otherCoverageMap) {
        Object.keys(otherCoverageMap.coverageMap).forEach(file => {
            if (this.coverageMap[file]) {
                // Merging logic if file exists in both maps.
                const data = this.coverageMap[file].data;
                const otherData = otherCoverageMap.coverageMap[file].data;

                Object.keys(otherData.lines).forEach(line => {
                    data.lines[line] = (data.lines[line] || 0) + otherData.lines[line];
                });
            } else {
                this.coverageMap[file] = otherCoverageMap.coverageMap[file];
            }
        });
    }

    files() {
        return Object.keys(this.coverageMap);
    }

    fileCoverageFor(file) {
        return this.coverageMap[file];
    }
}

function createCoverageMap(globalCoverageVar) {
    const map = new CoverageMap(globalCoverageVar);
    for (const file in globalCoverageVar) {
        map.coverageMap[file] = new CoverageData(globalCoverageVar[file]);
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
var libCoverage = require('./istanbul-lib-coverage');
var globalCoverageVar = {
    'file1.js': { lines: { 1: 1, 2: 0, 3: 1 } },
    'file2.js': { lines: { 1: 0, 2: 1 } }
};

var otherCoverageMap = {
    'file1.js': { lines: { 1: 0, 2: 1 } }
};

var map = libCoverage.createCoverageMap(globalCoverageVar);
var summary = libCoverage.createCoverageSummary();

map.merge(libCoverage.createCoverageMap(otherCoverageMap));

map.files().forEach(function(f) {
    var fc = map.fileCoverageFor(f),
        s = fc.toSummary();
    summary.merge(s);
});

console.log('Global summary', summary);
