const { Readable } = require('stream');
const lowercaseKeys = require('lowercase-keys');

class Response extends Readable {
  constructor(statusCode, headers, body, url) {
    super();
    this.validateInputs(statusCode, headers, body, url);
    this.statusCode = statusCode;
    this.headers = lowercaseKeys(headers); // Ensures headers' keys are lowercase
    this.body = body;
    this.url = url;
  }

  validateInputs(statusCode, headers, body, url) {
    if (typeof statusCode !== 'number') {
      throw new TypeError('Argument `statusCode` should be a number');
    }
    if (typeof headers !== 'object' || headers === null) {
      throw new TypeError('Argument `headers` should be an object');
    }
    if (!(body instanceof Buffer)) {
      throw new TypeError('Argument `body` should be a buffer');
    }
    if (typeof url !== 'string') {
      throw new TypeError('Argument `url` should be a string');
    }
  }

  _read() {
    this.push(this.body);
    this.push(null); // Signify completion
  }
}

module.exports = Response;
