/**
 * Archiver Vending Module
 *
 * @ignore
 * @license [MIT]{@link https://github.com/archiverjs/node-archiver/blob/master/LICENSE}
 * @copyright (c) 2012-2014 Chris Talkington, contributors.
 */
const Archiver = require('./lib/core');

const formats = {};

/**
 * Dispenses a new Archiver instance.
 *
 * @param  {String} format The archive format to use.
 * @param  {Object} options Options for the Archiver
 * @return {Archiver} 
 */
const vending = (format, options) => vending.create(format, options);

/**
 * Creates a new Archiver instance with the given format and options.
 *
 * @param  {String} format The archive format to use.
 * @param  {Object} options Options for the Archiver
 * @return {Archiver}
 */
vending.create = (format, options) => {
  const Module = formats[format];
  if (Module) {
    const instance = new Archiver(format, options);
    instance.setFormat(format);
    instance.setModule(new Module(options));
    return instance;
  } else {
    throw new Error(`create(${format}): format not registered`);
  }
};

/**
 * Registers a new format for use with archiver.
 *
 * @param  {String} format The name of the format.
 * @param  {Function} module The function for archiver to interact with.
 */
vending.registerFormat = (format, module) => {
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

/**
 * Checks if the format is already registered.
 * 
 * @param {String} format The name of the format.
 * @return {boolean} 
 */
vending.isRegisteredFormat = (format) => !!formats[format];

// Register default formats
vending.registerFormat('zip', require('./lib/plugins/zip'));
vending.registerFormat('tar', require('./lib/plugins/tar'));
vending.registerFormat('json', require('./lib/plugins/json'));

module.exports = vending;
