const Archiver = require('./lib/core');

const formats = {};

const vending = function(format, options) {
  return vending.create(format, options);
};

vending.create = function(format, options) {
  if (!formats[format]) {
    throw new Error(`create(${format}): format not registered`);
  }
  const instance = new Archiver(format, options);
  instance.setFormat(format);
  instance.setModule(new formats[format](options));
  return instance;
};

vending.registerFormat = function(format, module) {
  if (formats[format]) {
    throw new Error(`register(${format}): format already registered`);
  }

  if (typeof module !== 'function') {
    throw new Error(`register(${format}): format module invalid`);
  }

  if (typeof module.prototype.append !== 'function' || typeof module.prototype.finalize !== 'function') {
    throw new Error(`register(${format}): format module missing methods`);
  }

  formats[format] = module;
};

vending.isRegisteredFormat = function(format) {
  return Boolean(formats[format]);
};

vending.registerFormat('zip', require('./lib/plugins/zip'));
vending.registerFormat('tar', require('./lib/plugins/tar'));
vending.registerFormat('json', require('./lib/plugins/json'));

module.exports = vending;
