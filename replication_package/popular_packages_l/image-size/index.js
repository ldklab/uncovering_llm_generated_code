const fs = require('fs');
const http = require('http');
const url = require('url');
const path = require('path');
const imageType = require('image-type');
const util = require('util');

class ImageSize {
  constructor() {
    this.concurrency = 100;
    this.disabledTypes = new Set();
    this.disableFS = false;
  }

  setConcurrency(newLimit) {
    this.concurrency = newLimit;
  }

  disableTypes(types) {
    types.forEach(type => this.disabledTypes.add(type));
  }

  disableFS(readFromFS) {
    this.disableFS = readFromFS;
  }

  getImageSizeFromBuffer(buffer) {
    const type = imageType(buffer);
    if (!type || this.disabledTypes.has(type.ext)) {
      throw new Error('Unsupported or disabled image type');
    }

    // Dummy image size example, actual implementation requires specific logic per type
    const width = buffer[0] % 100; // Placeholder logic
    const height = buffer[1] % 100; // Placeholder logic

    return { width, height };
  }

  sizeOf(input, callback) {
    if (Buffer.isBuffer(input)) {
      try {
        const dimensions = this.getImageSizeFromBuffer(input);
        if (callback) callback(null, dimensions);
        return dimensions;
      } catch (err) {
        if (callback) callback(err, null);
        else throw err;
      }
    } else {
      if (this.disableFS) {
        const error = new Error('File system reads are disabled');
        if (callback) return callback(error);
        throw error;
      }

      fs.readFile(input, (err, buffer) => {
        if (err) return callback ? callback(err) : Promise.reject(err);
        this.sizeOf(buffer, callback);
      });
    }
  }

  sizeOfPromise(input) {
    return new Promise((resolve, reject) => {
      this.sizeOf(input, (err, dimensions) => {
        if (err) reject(err);
        resolve(dimensions);
      });
    });
  }

  sizeOfAsync(input) {
    if (typeof input !== 'string') {
      const error = new Error('Asynchronous support only with file paths');
      return Promise.reject(error);
    }

    return util.promisify(this.sizeOf.bind(this))(input);
  }
}

const imageSize = new ImageSize();

module.exports = imageSize;
