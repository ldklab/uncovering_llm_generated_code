// ua-parser.js
class UAParser {
    constructor(userAgent = '', extensions = []) {
        this.uaString = userAgent || (typeof window !== "undefined" ? window.navigator.userAgent : '');
        this.extensions = extensions;
        this.result = {
            ua: this.uaString,
            browser: {},
            cpu: {},
            device: {},
            engine: {},
            os: {}
        };
        if (!userAgent && typeof window === 'undefined') {
            throw new Error('User-Agent string is required in Node.js');
        }
        if (userAgent) this.parseUA();
    }

    parseUA() {
        // Example parsing logic (to be replaced by real parsing regex and logic)
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

// If not using new keyword
function uaParserFacade(userAgent = '', extensions = []) {
    const parser = new UAParser(userAgent, extensions);
    return parser.getResult();
}

module.exports = uaParserFacade;
module.exports.UAParser = UAParser;

// Example Server (Node.js)
const http = require('http');
const UAParser = require('./ua-parser').UAParser;

http.createServer((req, res) => {
    const parser = new UAParser(req.headers['user-agent']);
    res.end(JSON.stringify(parser.getResult(), null, '  '));
}).listen(1337, '127.0.0.1');

console.log('Server running at http://127.0.0.1:1337/');

