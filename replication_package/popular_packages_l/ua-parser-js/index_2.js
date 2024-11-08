// ua-parser.js
const http = require('http');

class UAParser {
    constructor(userAgent = '', extensions = []) {
        if (!userAgent && typeof window === 'undefined') {
            throw new Error('User-Agent string is required in Node.js');
        }

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

        if (userAgent) {
            this.parseUA();
        }
    }

    parseUA() {
        // Simple example logic for basic browser and OS detection
        this.result.browser.name = this.uaString.includes("Chrome") ? 'Chrome' : 'Unknown';
        this.result.os.name = this.uaString.includes("Windows") ? 'Windows' : 'Unknown';
    }

    // Methods to retrieve parsed components
    getResult() { return this.result; }
    getBrowser() { return this.result.browser; }
    getCPU() { return this.result.cpu; }
    getDevice() { return this.result.device; }
    getEngine() { return this.result.engine; }
    getOS() { return this.result.os; }
    getUA() { return this.uaString; }

    setUA(userAgent) {
        this.uaString = userAgent;
        this.result.ua = userAgent;
        this.parseUA();
        return this;
    }
}

// Alternative usage without new keyword
function uaParserFacade(userAgent = '', extensions = []) {
    const parser = new UAParser(userAgent, extensions);
    return parser.getResult();
}

module.exports = uaParserFacade;
module.exports.UAParser = UAParser;

// Example HTTP Server setup
http.createServer((req, res) => {
    const parser = new UAParser(req.headers['user-agent']);
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify(parser.getResult(), null, 2));
}).listen(1337, '127.0.0.1');

console.log('Server running at http://127.0.0.1:1337/');
