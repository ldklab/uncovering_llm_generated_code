const fs = require('fs');
const path = require('path');

// ReportContext Definition
class ReportContext {
  constructor(options) {
    this.dir = options.dir || 'reports';
    this.defaultSummarizer = options.defaultSummarizer || 'pkg';
    this.watermarks = options.watermarks || {};
    this.coverageMap = options.coverageMap || {};
  }
}

// Function to create a new Report Context
function createContext(options) {
  return new ReportContext(options);
}

// Report Definition
class Report {
  constructor(type, options) {
    this.type = type;
    this.options = options;
  }
  
  execute(context) {
    const outputData = this.generateReportData(context);
    const outputPath = path.resolve(context.dir, `coverage-report.${this.type}`);
    fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2));
    console.log(`Report written to ${outputPath}`);
  }
  
  generateReportData(context) {
    return {
      summary: `This is a placeholder report for ${this.type}`,
      coverageMap: context.coverageMap,
    };
  }
}

// Function to create a new Report
function create(type, options) {
  return new Report(type, options);
}

// Exporting all relevant functions
module.exports = {
  createContext,
  create,
};
