// index.js
class HttpRequest {
    constructor({ method = 'GET', hostname, path = '/', headers = {}, body = null } = {}) {
        this.method = method;
        this.hostname = hostname;
        this.path = path;
        this.headers = headers;
        this.body = body;
    }

    // Constructs the full URL from hostname and path
    getURL() {
        return `${this.hostname}${this.path}`;
    }

    // Sets a header key to a specific value, converting the key to lowercase
    setHeader(key, value) {
        this.headers[key.toLowerCase()] = value;
    }

    // Retrieves the value of a specified header key, using lowercase key
    getHeader(key) {
        return this.headers[key.toLowerCase()];
    }

    // Removes a header by key, using lowercase transformation
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

    // Sets a header key to a given value, with lowercase key handling
    setHeader(key, value) {
        this.headers[key.toLowerCase()] = value;
    }

    // Fetches the value of a header by key, using lowercase
    getHeader(key) {
        return this.headers[key.toLowerCase()];
    }

    // Removes a header entry by its key, using lowercase conversion
    removeHeader(key) {
        delete this.headers[key.toLowerCase()];
    }

    // Checks if the response is a successful one based on the status code
    isSuccessful() {
        return this.statusCode >= 200 && this.statusCode < 300;
    }
}

// Parses a URL string and returns its components
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
// const { HttpRequest, HttpResponse, parseUrl } = require('path-to-this-file');

// const request = new HttpRequest({
//     method: 'POST',
//     hostname: 'https://example.com',
//     path: '/api',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ key: 'value' })
// });

// const urlComponents = parseUrl('https://example.com:443/path?query=value');
