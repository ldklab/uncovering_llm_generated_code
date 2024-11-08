// collect-v8-coverage/index.js
const inspector = require('inspector');
const fs = require('fs');

class CoverageInstrumenter {
  constructor() {
    this.session = new inspector.Session();
    this.session.connect();
  }

  async startInstrumenting() {
    try {
      await this.postSession('Profiler.enable');
      await this.postSession('Profiler.startPreciseCoverage', { callCount: true, detailed: true });
    } catch (error) {
      throw new Error('Failed to start instrumenting: ' + error.message);
    }
  }

  async stopInstrumenting() {
    try {
      const result = await this.postSession('Profiler.takePreciseCoverage');
      await this.postSession('Profiler.stopPreciseCoverage');
      await this.postSession('Profiler.disable');
      return result.result;
    } catch (error) {
      throw new Error('Failed to stop instrumenting: ' + error.message);
    }
  }

  postSession(method, params = {}) {
    return new Promise((resolve, reject) => {
      this.session.post(method, params, (err, res) => {
        if (err) {
          return reject(err);
        }
        resolve(res);
      });
    });
  }
}

module.exports = { CoverageInstrumenter };
