// collect-v8-coverage/index.js
const inspector = require('inspector');

class CoverageInstrumenter {
  constructor() {
    this.session = new inspector.Session();
    this.session.connect();
  }

  startInstrumenting() {
    return new Promise((resolve, reject) => {
      this.session.post('Profiler.enable', (err) => {
        if (err) return reject(err);

        const coverageOptions = { callCount: true, detailed: true };
        this.session.post('Profiler.startPreciseCoverage', coverageOptions, (err) => {
          if (err) return reject(err);
          resolve();
        });
      });
    });
  }

  stopInstrumenting() {
    return new Promise((resolve, reject) => {
      this.session.post('Profiler.takePreciseCoverage', (err, result) => {
        if (err) return reject(err);

        this.session.post('Profiler.stopPreciseCoverage', (err) => {
          if (err) return reject(err);

          this.session.post('Profiler.disable', (err) => {
            if (err) return reject(err);
            resolve(result.result);
          });
        });
      });
    });
  }
}

module.exports = { CoverageInstrumenter };
