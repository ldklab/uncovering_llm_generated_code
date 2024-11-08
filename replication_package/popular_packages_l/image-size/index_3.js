const fs = require('fs').promises;
const imageType = require('image-type');

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

    const width = buffer[0] % 100; // Placeholder logic
    const height = buffer[1] % 100; // Placeholder logic

    return { width, height };
  }

  async sizeOf(input, callback) {
    try {
      let dimensions;
      if (Buffer.isBuffer(input)) {
        dimensions = this.getImageSizeFromBuffer(input);
      } else {
        if (this.disableFS) {
          throw new Error('File system reads are disabled');
        }
        const buffer = await fs.readFile(input);
        dimensions = this.getImageSizeFromBuffer(buffer);
      }

      if (callback) callback(null, dimensions);
      return dimensions;
    } catch (err) {
      if (callback) callback(err, null);
      throw err;
    }
  }

  sizeOfPromise(input) {
    return new Promise((resolve, reject) => {
      this.sizeOf(input)
        .then(dimensions => resolve(dimensions))
        .catch(err => reject(err));
    });
  }

  async sizeOfAsync(input) {
    if (typeof input !== 'string') {
      throw new Error('Asynchronous support only with file paths');
    }
    return this.sizeOf(input);
  }
}

const imageSize = new ImageSize();

module.exports = imageSize;
