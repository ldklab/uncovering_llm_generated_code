const fs = require('fs');
const imageType = require('image-type');
const util = require('util');

class ImageProcessor {
  constructor() {
    this.concurrencyLimit = 100;
    this.disabledImageTypes = new Set();
    this.disableFileSystem = false;
  }

  setConcurrencyLimit(limit) {
    this.concurrencyLimit = limit;
  }

  disableImageTypes(types) {
    types.forEach(type => this.disabledImageTypes.add(type));
  }

  toggleFileSystemAccess(isDisabled) {
    this.disableFileSystem = isDisabled;
  }

  extractImageDimensions(buffer) {
    const type = imageType(buffer);
    if (!type || this.disabledImageTypes.has(type.ext)) {
      throw new Error('Unsupported or disabled image type');
    }

    const width = buffer[0] % 100; 
    const height = buffer[1] % 100; 

    return { width, height };
  }

  determineSize(input, callback) {
    if (Buffer.isBuffer(input)) {
      try {
        const dimensions = this.extractImageDimensions(input);
        if (callback) callback(null, dimensions);
        return dimensions;
      } catch (err) {
        if (callback) callback(err, null);
        else throw err;
      }
    } else {
      if (this.disableFileSystem) {
        const error = new Error('File system reads are disabled');
        if (callback) return callback(error);
        throw error;
      }

      fs.readFile(input, (err, buffer) => {
        if (err) return callback ? callback(err) : Promise.reject(err);
        this.determineSize(buffer, callback);
      });
    }
  }

  determineSizePromise(input) {
    return new Promise((resolve, reject) => {
      this.determineSize(input, (err, dimensions) => {
        if (err) reject(err);
        resolve(dimensions);
      });
    });
  }

  determineSizeAsync(input) {
    if (typeof input !== 'string') {
      const error = new Error('Asynchronous operation requires a file path');
      return Promise.reject(error);
    }

    return util.promisify(this.determineSize.bind(this))(input);
  }
}

const imageProcessor = new ImageProcessor();

module.exports = imageProcessor;
