const Archiver = require('./lib/core');

class Vending {
  constructor() {
    this.formats = {};
  }
  
  create(format, options) {
    if (this.formats[format]) {
      const instance = new Archiver(format, options);
      instance.setFormat(format);
      instance.setModule(new this.formats[format](options));
      return instance;
    } else {
      throw new Error(`create(${format}): format not registered`);
    }
  }

  registerFormat(format, module) {
    if (this.formats[format]) {
      throw new Error(`register(${format}): format already registered`);
    }

    if (typeof module !== 'function') {
      throw new Error(`register(${format}): format module invalid`);
    }

    const requiredMethods = ['append', 'finalize'];
    for (const method of requiredMethods) {
      if (typeof module.prototype[method] !== 'function') {
        throw new Error(`register(${format}): format module missing ${method} method`);
      }
    }

    this.formats[format] = module;
  }

  isRegisteredFormat(format) {
    return !!this.formats[format];
  }
}

const vending = new Vending();
vending.registerFormat('zip', require('./lib/plugins/zip'));
vending.registerFormat('tar', require('./lib/plugins/tar'));
vending.registerFormat('json', require('./lib/plugins/json'));

module.exports = vending;
