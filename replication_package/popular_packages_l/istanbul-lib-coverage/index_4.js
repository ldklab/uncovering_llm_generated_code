// istanbul-lib-coverage.js

// CoverageSummary class handles covered, total, and skipped line stats and calculates percentage
class CoverageSummary {
    constructor() {
        this.total = 0;
        this.covered = 0;
        this.skipped = 0;
        this.pct = 0;
    }

    // Merges another summary into the current object
    merge(summary) {
        this.total += summary.total;
        this.covered += summary.covered;
        this.skipped += summary.skipped;
        this.pct = (this.total > 0) ? (this.covered / this.total) * 100 : 0;
    }
}

// CoverageData class represents the coverage data for a file
class CoverageData {
    constructor(data) {
        this.data = data;
    }

    // Converts raw line data into a coverage summary
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

// CoverageMap class manages multiple file coverages
class CoverageMap {
    constructor(globalCoverageVar) {
        this.coverageMap = globalCoverageVar ? this.createCoverageDataForVar(globalCoverageVar) : {};
    }

    // Merge another coverage map into the current map
    merge(otherCoverageMap) {
        Object.keys(otherCoverageMap.coverageMap).forEach(file => {
            if (this.coverageMap[file]) {
                // Merge lines if file exists in both maps
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

    // Get list of files with coverage data
    files() {
        return Object.keys(this.coverageMap);
    }

    // Get coverage data for a specific file
    fileCoverageFor(file) {
        return this.coverageMap[file];
    }

    // Helper function to create coverage data for each file in a global variable
    createCoverageDataForVar(globalVar) {
        const map = {};
        for (const file in globalVar) {
            map[file] = new CoverageData(globalVar[file]);
        }
        return map;
    }
}

// Factory function to create a new CoverageMap instance
function createCoverageMap(globalCoverageVar) {
    return new CoverageMap(globalCoverageVar);
}

// Factory function to create a new CoverageSummary instance
function createCoverageSummary() {
    return new CoverageSummary();
}

// Exporting the factory functions
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

// Merge a new coverage map into the existing one
map.merge(libCoverage.createCoverageMap(otherCoverageMap));

// Process each file to update the summary
map.files().forEach(function(f) {
    const fc = map.fileCoverageFor(f);
    const s = fc.toSummary();
    summary.merge(s);
});

console.log('Global summary', summary);
