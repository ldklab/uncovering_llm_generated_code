// index.mjs
import { request as httpRequest } from 'node:http';
import { request as httpsRequest } from 'node:https';
import { Readable } from 'node:stream';

class FetchError extends Error {
  constructor(message, type, systemError) {
    super(message);
    this.name = 'FetchError';
    this.type = type;
    if (systemError) {
      this.code = systemError.code;
      this.erroredAt = systemError.erroredAt || null;
    }
  }
}

class AbortError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AbortError';
    this.type = 'aborted';
  }
}

class Body {
  constructor(body = null) {
    this.body = body;
    this.bodyUsed = false;
  }

  async _consumeBody() {
    if (this.bodyUsed) throw new TypeError('Already read');
    this.bodyUsed = true;

    if (this.body instanceof Readable) {
      return new Promise((resolve, reject) => {
        const chunks = [];
        this.body.on('data', (chunk) => chunks.push(chunk));
        this.body.on('end', () => resolve(Buffer.concat(chunks)));
        this.body.on('error', reject);
      });
    }
    return Buffer.isBuffer(this.body) ? this.body : Buffer.alloc(0);
  }

  async text() {
    const buffer = await this._consumeBody();
    return buffer.toString('utf-8');
  }

  async json() {
    return JSON.parse(await this.text());
  }
}

class Headers {
  constructor(headers = {}) {
    this.map = {};
    Object.entries(headers).forEach(([key, value]) => {
      this.map[key.toLowerCase()] = [value.toString()];
    });
  }

  get(name) {
    const values = this.map[name.toLowerCase()];
    return values ? values.join(', ') : null;
  }

  set(name, value) {
    this.map[name.toLowerCase()] = [value.toString()];
  }

  raw() {
    return this.map;
  }
}

class Request extends Body {
  constructor(url, { method = 'GET', headers = {}, body = null } = {}) {
    super(body);
    this.url = url;
    this.method = method;
    this.headers = new Headers(headers);
  }
}

class Response extends Body {
  constructor(body = null, { status = 200, statusText = '', headers = {} } = {}) {
    super(body);
    this.status = status;
    this.statusText = statusText;
    this.headers = new Headers(headers);
  }

  get ok() {
    return this.status >= 200 && this.status < 300;
  }
}

function fetch(url, options = {}) {
  return new Promise((resolve, reject) => {
    try {
      const urlObj = new URL(url);
      const isHttps = urlObj.protocol === 'https:';
      const requestFunction = isHttps ? httpsRequest : httpRequest;

      const headers = new Headers(options.headers);
      const req = requestFunction(
        url,
        {
          method: options.method || 'GET',
          headers: headers.raw(),
        },
        (res) => {
          const body = new Readable();
          res.on('data', (chunk) => body.push(chunk));
          res.on('end', () => body.push(null));

          resolve(new Response(body, {
            status: res.statusCode,
            statusText: res.statusMessage,
            headers: res.headers,
          }));
        }
      );

      req.on('error', (err) => reject(new FetchError(`Request failed: ${err.message}`, 'system', err)));

      if (options.body) {
        if (options.body instanceof Readable) {
          options.body.pipe(req);
        } else {
          req.write(options.body);
        }
      }

      req.end();
    } catch (error) {
      reject(error);
    }
  });
}

export { fetch, Headers, Request, Response, FetchError, AbortError };
