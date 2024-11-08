'use strict';

const { Session } = require('inspector');
const { promisify } = require('util');

class CoverageInstrumenter {
  constructor() {
    this.session = new Session();
    this.postSession = promisify(this.session.post.bind(this.session));
  }

  async startInstrumenting() {
    // Connect the session
    this.session.connect();
    // Enable the Profiler
    await this.postSession('Profiler.enable');
    // Start collecting coverage with detailed call metrics
    await this.postSession('Profiler.startPreciseCoverage', {
      callCount: true,
      detailed: true,
    });
  }

  async stopInstrumenting() {
    // Collect precise coverage data
    const { result } = await this.postSession('Profiler.takePreciseCoverage');
    // Stop and disable the profilers
    await this.postSession('Profiler.stopPreciseCoverage');
    await this.postSession('Profiler.disable');
    // Return the coverage data
    return result;
  }
}

module.exports.CoverageInstrumenter = CoverageInstrumenter;
