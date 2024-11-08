// fetchAPI.mjs
import http from 'node:http';
import https from 'node:https';
import { Readable } from 'node:stream';

class FetchError extends Error {
  constructor(message, type, systemError = null) {
    super(message);
    this.type = type;
    if (systemError) {
      this.code = systemError.code;
      this.erroredAt = systemError.erroredAt;
    }
  }
}

class AbortError extends Error {
  constructor(message) {
    super(message);
    this.type = 'aborted';
  }
}

class Body {
  constructor(body = null) {
    this.body = body;
    this.bodyUsed = false;
  }

  async _consumeBody() {
    if (this.bodyUsed) throw new TypeError('Body has already been used');
    this.bodyUsed = true;

    if (this.body instanceof Readable) {
      return new Promise((resolve, reject) => {
        const chunks = [];
        this.body.on('data', chunk => chunks.push(chunk));
        this.body.on('end', () => resolve(Buffer.concat(chunks)));
        this.body.on('error', reject);
      });
    }
    return this.body || Buffer.alloc(0);
  }

  async text() {
    const buffer = await this._consumeBody();
    return buffer.toString('utf-8');
  }

  async json() {
    const text = await this.text();
    return JSON.parse(text);
  }
}

class Headers {
  constructor(init = {}) {
    this.map = {};
    Object.entries(init).forEach(([key, value]) => {
      this.map[key.toLowerCase()] = [value.toString()];
    });
  }

  get(name) {
    const entries = this.map[name.toLowerCase()];
    return entries ? entries.join(', ') : null;
  }

  set(name, value) {
    this.map[name.toLowerCase()] = [value.toString()];
  }

  raw() {
    return this.map;
  }
}

class Request extends Body {
  constructor(input, options = {}) {
    super(options.body);
    this.url = input;
    this.method = options.method || 'GET';
    this.headers = new Headers(options.headers);
  }
}

class Response extends Body {
  constructor(body, options = {}) {
    super(body);
    this.status = options.status || 200;
    this.statusText = options.statusText || '';
    this.headers = new Headers(options.headers);
  }

  get ok() {
    return this.status >= 200 && this.status < 300;
  }
}

function fetch(url, options = {}) {
  return new Promise((resolve, reject) => {
    const parsedURL = new URL(url);
    const protocol = parsedURL.protocol === 'http:' ? http : https;

    const headers = new Headers(options.headers);
    const request = protocol.request(url, {
      method: options.method || 'GET',
      headers: headers.raw(),
      agent: options.agent
    }, (res) => {
      const body = new Readable();
      res.on('data', (chunk) => body.push(chunk));
      res.on('end', () => body.push(null));

      const responseOptions = {
        status: res.statusCode,
        statusText: res.statusMessage,
        headers: res.headers,
      };

      if (options.size && body.size > options.size) {
        reject(new FetchError(`content size at ${url} over limit: ${options.size}`, 'max-size'));
      } else {
        resolve(new Response(body, responseOptions));
      }
    });

    request.on('error', (err) => {
      reject(new FetchError(`request to ${url} failed, reason: ${err.message}`, 'system', err));
    });

    if (options.body) {
      if (options.body instanceof Readable) {
        options.body.pipe(request);
      } else {
        request.write(options.body);
      }
    }

    request.end();
  });
}

export { fetch, Headers, Request, Response, FetchError, AbortError };
