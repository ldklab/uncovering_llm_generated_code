const { PassThrough } = require('stream');

class Response extends PassThrough {
  constructor(statusCode, headers, body, url) {
    super();

    this.statusCode = statusCode;
    this.headers = Object.fromEntries(Object.entries(headers).map(([key, value]) => [key.toLowerCase(), value]));
    this.body = body;
    this.url = url;

    process.nextTick(() => {
      this.end(body);
    });
  }
}

module.exports = Response;

// Usage example
const responseExample = new Response(200, { foo: 'bar' }, Buffer.from('Hi!'), 'https://example.com');

console.log(responseExample.statusCode); // 200
console.log(responseExample.headers); // { foo: 'bar' }
console.log(responseExample.body); // <Buffer 48 69 21>
console.log(responseExample.url); // 'https://example.com'

responseExample.pipe(process.stdout); // Hi!
