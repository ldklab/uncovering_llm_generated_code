const fs = require('fs');
const imageType = require('image-type');
const util = require('util');

class ImageSize {
  constructor() {
    this.concurrency = 100;
    this.disabledTypes = new Set();
    this.disableFileSystemAccess = false;
  }

  setConcurrency(limit) {
    this.concurrency = limit;
  }

  disableTypes(types) {
    types.forEach(type => this.disabledTypes.add(type));
  }

  disableFileSystem(readFromFs) {
    this.disableFileSystemAccess = readFromFs;
  }

  getImageSizeFromBuffer(buffer) {
    const type = imageType(buffer);
    if (!type || this.disabledTypes.has(type.ext)) {
      throw new Error('Unsupported or disabled image type');
    }

    // Placeholder logic for illustration purposes
    const width = buffer[0] % 100; 
    const height = buffer[1] % 100; 

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
      if (this.disableFileSystemAccess) {
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
        else resolve(dimensions);
      });
    });
  }

  sizeOfAsync(input) {
    if (typeof input !== 'string') {
      return Promise.reject(new Error('Asynchronous support only with file paths'));
    }

    return util.promisify(this.sizeOf.bind(this))(input);
  }
}

const imageSize = new ImageSize();

module.exports = imageSize;
