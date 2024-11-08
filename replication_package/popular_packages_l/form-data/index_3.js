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
    const fieldData = {
      field,
      value,
      options: typeof options === 'string' ? { filename: options } : options
    };
    this.fields.push(fieldData);
  }

  getHeaders(userHeaders = {}) {
    return {
      ...userHeaders,
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
    const buffers = [];

    this.fields.forEach(field => {
      buffers.push(Buffer.from(`--${this.boundary}\r\n`));
      const header = `Content-Disposition: form-data; name="${field.field}"`;
      
      if (typeof field.value === 'string' || Buffer.isBuffer(field.value)) {
        buffers.push(Buffer.from(`${header}\r\n\r\n`));
        buffers.push(Buffer.isBuffer(field.value) ? field.value : Buffer.from(field.value));
      } else if (field.value instanceof Readable) {
        buffers.push(Buffer.from(`${header}; filename="${field.options.filename || 'unknown'}"\r\n`));
        buffers.push(Buffer.from(`Content-Type: ${field.options.contentType || 'application/octet-stream'}\r\n\r\n`));
        // This might not be correct since `pipe` is used for streaming to a writable not to buffer directly
        // Hence not a simple pipe operation
      }
      buffers.push(Buffer.from('\r\n'));
    });

    buffers.push(Buffer.from(`--${this.boundary}--\r\n`));
    return Buffer.concat(buffers);
  }

  getLength(callback) {
    let length = 0;

    this.fields.forEach(field => {
      if (typeof field.value === 'string' || Buffer.isBuffer(field.value)) {
        length += Buffer.byteLength(field.value);
      } else if (field.value instanceof Readable && field.options.knownLength) {
        length += field.options.knownLength;
      }
    });

    process.nextTick(() => callback(null, length));
  }

  submit(params, callback) {
    const urlParams = typeof params === 'string' ? new URL(params) : params;
    
    const req = http.request({
      method: 'POST',
      hostname: urlParams.host,
      path: urlParams.pathname,
      headers: this.getHeaders(urlParams.headers || {}),
    }, res => {
      callback(null, res);
    });

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
// form.append('field1', 'value1');
// form.submit('http://example.com', (err, res) => {
//   if (err) throw err;
//   console.log('Response received');
// });
