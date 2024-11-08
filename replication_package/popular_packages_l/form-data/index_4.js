const fs = require('fs');
const http = require('http');
const { Readable } = require('stream');

class FormData {
  constructor(options = {}) {
    this.fields = [];
    this.boundary = '--------------------------' + Math.random().toString().substring(2);
    this.options = options;
  }

  append(name, value, options = {}) {
    const fieldOptions = typeof options === 'string' ? { filename: options } : options;
    this.fields.push({ name, value, options: fieldOptions });
  }

  getHeaders(customHeaders = {}) {
    return {
      ...customHeaders,
      'Content-Type': `multipart/form-data; boundary=${this.boundary}`
    };
  }

  getBuffer() {
    const buffers = [];
    this.fields.forEach(({ name, value, options }) => {
      buffers.push(Buffer.from(`--${this.boundary}\r\n`));
      if (typeof value === 'string' || Buffer.isBuffer(value)) {
        buffers.push(Buffer.from(`Content-Disposition: form-data; name="${name}"\r\n\r\n`));
        buffers.push(Buffer.from(value));
      } else if (value instanceof Readable) {
        const filename = options.filename || 'unknown';
        const contentType = options.contentType || 'application/octet-stream';
        buffers.push(Buffer.from(`Content-Disposition: form-data; name="${name}"; filename="${filename}"\r\n`));
        buffers.push(Buffer.from(`Content-Type: ${contentType}\r\n\r\n`));
      }
      buffers.push(Buffer.from('\r\n'));
    });
    buffers.push(Buffer.from(`--${this.boundary}--\r\n`));
    return Buffer.concat(buffers);
  }

  getLength(callback) {
    let length = 0;
    this.fields.forEach(({ value, options }) => {
      if (typeof value === 'string' || Buffer.isBuffer(value)) {
        length += Buffer.byteLength(value);
      } else if (value instanceof Readable && options.knownLength) {
        length += options.knownLength;
      }
    });
    process.nextTick(() => callback(null, length));
  }

  submit(url, callback) {
    const { hostname, path } = new URL(url);
    const req = http.request({
      method: 'POST',
      hostname,
      path,
      headers: this.getHeaders()
    }, (res) => callback(null, res));

    req.on('error', callback);
    req.write(this.getBuffer());
    req.end();
  }
}

module.exports = FormData;

// Example usage:
// const form = new FormData();
// form.append('myField', 'myValue');
// form.submit('http://example.org/upload', (err, res) => {
//   if (err) throw err;
//   console.log('Upload complete:', res.statusCode);
// });
