'use strict';

const { Session } = require('inspector');
const { promisify } = require('util');

class CoverageInstrumenter {
  constructor() {
    this.session = new Session();
    this.postSession = promisify(this.session.post.bind(this.session));
  }

  async startInstrumenting() {
    this.session.connect();  // Establish connection to start inspecting
    await this.postSession('Profiler.enable');  // Enable the Profiler
    await this.postSession('Profiler.startPreciseCoverage', {  // Start detailed coverage
      callCount: true,
      detailed: true,
    });
  }

  async stopInstrumenting() {
    // Capture the coverage data collected during instrumentation
    const { result } = await this.postSession('Profiler.takePreciseCoverage');
    await this.postSession('Profiler.stopPreciseCoverage');  // Stop coverage collection
    await this.postSession('Profiler.disable');  // Disable the Profiler
    return result;  // Return the collected coverage data
  }
}

module.exports.CoverageInstrumenter = CoverageInstrumenter;  // Export the class
