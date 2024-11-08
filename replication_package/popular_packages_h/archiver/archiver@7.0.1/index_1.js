const Archiver = require('./lib/core');

const formats = {};

/**
 * Dispenses a new Archiver instance.
 * 
 * @param {String} format - The archive format to use.
 * @param {Object} options - Configuration options for Archiver.
 * @returns {Archiver} - The Archiver instance.
 */
function vending(format, options) {
  return createArchiverInstance(format, options);
}

/**
 * Creates a new Archiver instance.
 * 
 * @param {String} format - The archive format to use.
 * @param {Object} options - Configuration options for Archiver.
 * @returns {Archiver} - The Archiver instance.
 * @throws Will throw an error if the format is not registered.
 */
function createArchiverInstance(format, options) {
  if (formats[format]) {
    const instance = new Archiver(format, options);
    instance.setFormat(format);
    instance.setModule(new formats[format](options));
    return instance;
  } else {
    throw new Error(`create(${format}): format not registered`);
  }
}

vending.create = createArchiverInstance;

/**
 * Registers a format for use with archiver.
 * 
 * @param {String} format - The name of the format.
 * @param {Function} module - The function for archiver to interact with.
 * @throws Will throw an error if the format is already registered, the module is invalid, or missing methods.
 */
function registerFormat(format, module) {
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
}

vending.registerFormat = registerFormat;

/**
 * Check if the format is already registered.
 * 
 * @param {String} format - The name of the format.
 * @returns {boolean} - True if the format is registered, otherwise false.
 */
function isFormatRegistered(format) {
  return Boolean(formats[format]);
}

vending.isRegisteredFormat = isFormatRegistered;

vending.registerFormat('zip', require('./lib/plugins/zip'));
vending.registerFormat('tar', require('./lib/plugins/tar'));
vending.registerFormat('json', require('./lib/plugins/json'));

module.exports = vending;
