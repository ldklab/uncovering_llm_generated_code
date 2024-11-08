// ua-parser.js
class UAParser {
    constructor(userAgent = '', extensions = []) {
        // Initialize User-Agent string with provided value or browser's user-agent if available
        this.uaString = userAgent || (typeof window !== "undefined" ? window.navigator.userAgent : '');
        this.extensions = extensions;
        // Initialize the result object with default values
        this.result = {
            ua: this.uaString,
            browser: {},
            cpu: {},
            device: {},
            engine: {},
            os: {}
        };
        // In Node.js environment, throw an error if userAgent is not provided
        if (!userAgent && typeof window === 'undefined') {
            throw new Error('User-Agent string is required in Node.js');
        }
        // Parse the userAgent if provided
        if (userAgent) this.parseUA();
    }

    // Parse the user-agent string
    parseUA() {
        // Dummy parsing logic, setting Chrome and Windows if found in the user-agent string
        this.result.browser.name = this.uaString.includes("Chrome") ? 'Chrome' : 'Unknown';
        this.result.os.name = this.uaString.includes("Windows") ? 'Windows' : 'Unknown';
    }

    getResult() {
        return this.result;
    }

    getBrowser() {
        return this.result.browser;
    }

    getCPU() {
        return this.result.cpu;
    }

    getDevice() {
        return this.result.device;
    }

    getEngine() {
        return this.result.engine;
    }

    getOS() {
        return this.result.os;
    }

    getUA() {
        return this.uaString;
    }

    setUA(userAgent) {
        this.uaString = userAgent;
        this.result.ua = userAgent;
        this.parseUA();
        return this;
    }
}

// Facade function for using UAParser without 'new' keyword
function uaParserFacade(userAgent = '', extensions = []) {
    const parser = new UAParser(userAgent, extensions);
    return parser.getResult();
}

module.exports = uaParserFacade;
module.exports.UAParser = UAParser;

// Example Server (Node.js)
const http = require('http');
const UAParser = require('./ua-parser').UAParser;

// Create HTTP server that parses User-Agent from request headers
http.createServer((req, res) => {
    const parser = new UAParser(req.headers['user-agent']);
    res.end(JSON.stringify(parser.getResult(), null, '  ')); // Respond with the parsed result
}).listen(1337, '127.0.0.1');

console.log('Server running at http://127.0.0.1:1337/');
