const fs = require('fs');
const path = require('path');
const imageType = require('image-type');
const util = require('util');

class ImageSize {
  constructor() {
    this.concurrency = 100;
    this.disabledTypes = new Set();
    this.disableFS = false;
  }

  setConcurrency(limit) {
    this.concurrency = limit;
  }

  disableTypes(types) {
    types.forEach(type => this.disabledTypes.add(type));
  }

  disableFS(flag) {
    this.disableFS = flag;
  }

  getImageSizeFromBuffer(buffer) {
    const type = imageType(buffer);
    if (!type || this.disabledTypes.has(type.ext)) {
      throw new Error('Unsupported or disabled image type');
    }
    const width = buffer[0] % 100; // Example calculation
    const height = buffer[1] % 100; // Example calculation
    return { width, height };
  }

  sizeOf(input, callback) {
    if (Buffer.isBuffer(input)) {
      try {
        const dimensions = this.getImageSizeFromBuffer(input);
        callback && callback(null, dimensions);
        return dimensions;
      } catch (error) {
        callback && callback(error);
        if (!callback) throw error;
      }
    } else {
      if (this.disableFS) {
        const error = new Error('File system reads are disabled');
        if (callback) callback(error);
        else throw error;
      } else {
        fs.readFile(input, (error, buffer) => {
          if (error) return callback ? callback(error) : Promise.reject(error);
          this.sizeOf(buffer, callback);
        });
      }
    }
  }

  sizeOfPromise(input) {
    return new Promise((resolve, reject) => {
      this.sizeOf(input, (error, dimensions) => {
        if (error) reject(error);
        else resolve(dimensions);
      });
    });
  }

  sizeOfAsync(input) {
    if (typeof input !== 'string') {
      return Promise.reject(new Error('Asynchronous support only with file paths'));
    }
    const promisifiedSizeOf = util.promisify(this.sizeOf.bind(this));
    return promisifiedSizeOf(input);
  }
}

const imageSize = new ImageSize();
module.exports = imageSize;
