// collect-v8-coverage/index.js
const inspector = require('inspector');

class CoverageInstrumenter {
  constructor() {
    this.session = new inspector.Session();
    this.session.connect();
  }

  async startInstrumenting() {
    try {
      await this.sendCommand('Profiler.enable');
      await this.sendCommand('Profiler.startPreciseCoverage', { callCount: true, detailed: true });
    } catch (error) {
      throw error;
    }
  }

  async stopInstrumenting() {
    try {
      const coverage = await this.sendCommand('Profiler.takePreciseCoverage');
      await this.sendCommand('Profiler.stopPreciseCoverage');
      await this.sendCommand('Profiler.disable');
      return coverage.result;
    } catch (error) {
      throw error;
    }
  }

  sendCommand(method, params = {}) {
    return new Promise((resolve, reject) => {
      this.session.post(method, params, (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result);
      });
    });
  }
}

module.exports = { CoverageInstrumenter };
