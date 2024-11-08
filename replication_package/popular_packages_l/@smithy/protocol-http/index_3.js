// index.js
class HttpRequest {
    constructor({ method = 'GET', hostname, path = '/', headers = {}, body = null } = {}) {
        this.method = method;
        this.hostname = hostname;
        this.path = path;
        this.headers = headers;
        this.body = body;
    }

    getURL() {
        return `${this.hostname}${this.path}`;
    }

    setHeader(key, value) {
        this.headers[key.toLowerCase()] = value;
    }

    getHeader(key) {
        return this.headers[key.toLowerCase()];
    }

    removeHeader(key) {
        delete this.headers[key.toLowerCase()];
    }
}

class HttpResponse {
    constructor({ statusCode = 200, headers = {}, body = null } = {}) {
        this.statusCode = statusCode;
        this.headers = headers;
        this.body = body;
    }

    setHeader(key, value) {
        this.headers[key.toLowerCase()] = value;
    }

    getHeader(key) {
        return this.headers[key.toLowerCase()];
    }

    removeHeader(key) {
        delete this.headers[key.toLowerCase()];
    }

    isSuccessful() {
        return this.statusCode >= 200 && this.statusCode < 300;
    }
}

function parseUrl(url) {
    try {
        const parsedUrl = new URL(url);
        return {
            protocol: parsedUrl.protocol,
            hostname: parsedUrl.hostname,
            port: parsedUrl.port,
            pathname: parsedUrl.pathname,
            search: parsedUrl.search
        };
    } catch (error) {
        throw new Error("Invalid URL");
    }
}

module.exports = { HttpRequest, HttpResponse, parseUrl };

// Usage Example:
// const { HttpRequest, HttpResponse, parseUrl } = require('@smithy/protocol-http');

// const request = new HttpRequest({
//     method: 'POST',
//     hostname: 'https://example.com',
//     path: '/api',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ key: 'value' })
// });

// const urlComponents = parseUrl('https://example.com:443/path?query=value');
