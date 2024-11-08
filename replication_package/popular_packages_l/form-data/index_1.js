const fs = require('fs');
const http = require('http');
const { Readable } = require('stream');

class FormData {
  constructor(options = {}) {
    this.fields = [];
    this.boundary = '--------------------------' + Math.random().toString().substr(2);
    this.options = options;
  }

  append(field, value, options = {}) {
    if (typeof options === 'string') {
      options = { filename: options };
    }
    this.fields.push({ field, value, options });
  }

  getHeaders(customHeaders = {}) {
    return {
      ...customHeaders,
      'Content-Type': `multipart/form-data; boundary=${this.boundary}`
    };
  }

  getBoundary() {
    return this.boundary;
  }

  setBoundary(boundary) {
    this.boundary = boundary;
  }

  getBuffer() {
    const buffers = this.fields.map(field => {
      const parts = [];
      parts.push(Buffer.from(`--${this.boundary}\r\n`));
      if (typeof field.value === 'string' || Buffer.isBuffer(field.value)) {
        parts.push(Buffer.from(`Content-Disposition: form-data; name="${field.field}"\r\n\r\n`));
        parts.push(Buffer.from(field.value));
      } else if (field.value instanceof Readable) {
        parts.push(Buffer.from(`Content-Disposition: form-data; name="${field.field}"; filename="${field.options.filename || 'unknown'}"\r\n`));
        parts.push(Buffer.from(`Content-Type: ${field.options.contentType || 'application/octet-stream'}\r\n\r\n`));
        field.value.pipe(Buffer.from(field.value.read()));
      }
      parts.push(Buffer.from('\r\n'));
      return Buffer.concat(parts);
    });
    buffers.push(Buffer.from(`--${this.boundary}--\r\n`));
    return Buffer.concat(buffers);
  }

  getLength(callback) {
    const length = this.fields.reduce((acc, field) => {
      if (typeof field.value === 'string' || Buffer.isBuffer(field.value)) {
        return acc + Buffer.byteLength(field.value);
      } else if (field.value instanceof Readable && field.options.knownLength) {
        return acc + field.options.knownLength;
      }
      return acc;
    }, 0);
    process.nextTick(() => callback(null, length));
  }

  submit(params, callback) {
    if (typeof params === 'string') {
      params = new URL(params);
    }
    
    const options = {
      method: 'POST',
      hostname: params.hostname,
      path: params.pathname,
      headers: this.getHeaders(params.headers || {}),
    };
    
    const req = http.request(options, (res) => callback(null, res));
    req.on('error', callback);
    this.pipe(req);
    req.end();
  }

  pipe(destination) {
    destination.write(this.getBuffer());
  }
}

module.exports = FormData;

// Usage example:
// const form = new FormData();
// form.append('exampleField', 'exampleValue');
// form.submit('http://example.com', (err, res) => {
//   if (err) throw err;
//   console.log('Response received');
// });
