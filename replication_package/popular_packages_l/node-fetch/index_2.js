// Revised Implementation of fetch-like functionality with Node.js core modules

import http from 'node:http';
import https from 'node:https';
import { Readable } from 'node:stream';
import { TextDecoder } from 'node:util';

class FetchError extends Error {
  constructor(message, type, systemError) {
    super(message);
    this.type = type;
    if (systemError) {
      this.code = this.errno = systemError.code;
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
  constructor(body) {
    this.body = body;
    this.bodyUsed = false;
  }

  async _consumeBody() {
    if (this.bodyUsed) {
      throw new TypeError('Body has already been used');
    }
    this.bodyUsed = true;
    if (this.body instanceof Readable) {
      return new Promise((resolve, reject) => {
        const chunks = [];
        this.body.on('data', (chunk) => chunks.push(chunk));
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
    for (const [key, value] of Object.entries(init)) {
      this.map[key.toLowerCase()] = [value.toString()];
    }
  }

  get(name) {
    const entries = this.map[name.toLowerCase()];
    return entries ? entries.join(', ') : null;
  }

  set(name, value) {
    this.map[name.toLowerCase()] = [value];
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
    const requestOptions = {
      method: options.method || 'GET',
      headers: headers.raw(),
      agent: options.agent
    };

    const req = protocol.request(parsedURL, requestOptions, (res) => {
      const responseBody = new Readable();
      res.on('data', (chunk) => responseBody.push(chunk));
      res.on('end', () => responseBody.push(null));

      const responseOpts = {
        status: res.statusCode,
        statusText: res.statusMessage,
        headers: new Headers(res.headers)
      };

      resolve(new Response(responseBody, responseOpts));
    });

    req.on('error', (err) => {
      reject(new FetchError(`Fetch to ${url} failed: ${err.message}`, 'system', err));
    });

    if (options.body) {
      if (options.body instanceof Readable) {
        options.body.pipe(req);
      } else {
        req.write(options.body);
      }
    }

    req.end();
  });
}

export { fetch, Headers, Request, Response, FetchError, AbortError };
