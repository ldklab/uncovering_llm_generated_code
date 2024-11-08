'use strict';

const { Session } = require('inspector');
const { promisify } = require('util');

class CoverageInstrumenter {
  constructor() {
    this.session = new Session();
    this.postSession = promisify(this.session.post.bind(this.session));
  }

  async startInstrumenting() {
    this.session.connect();
    await this.postSession('Profiler.enable');
    await this.postSession('Profiler.startPreciseCoverage', { callCount: true, detailed: true });
  }

  async stopInstrumenting() {
    const { result } = await this.postSession('Profiler.takePreciseCoverage');
    await this.postSession('Profiler.stopPreciseCoverage');
    await this.postSession('Profiler.disable');

    if (process.platform === 'win32') {
      result.forEach(res => {
        if (res.url.startsWith('file:////')) {
          res.url = 'file://' + res.url.slice('file:////'.length);
        }
      });
    }

    return result;
  }
}

module.exports.CoverageInstrumenter = CoverageInstrumenter;
