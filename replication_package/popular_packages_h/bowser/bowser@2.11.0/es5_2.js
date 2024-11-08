(function(root, factory) {
    if (typeof exports === 'object' && typeof module === 'object') {
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof exports === 'object') {
        exports.bowser = factory();
    } else {
        root.bowser = factory();
    }
})(this, function() {
    const BROWSER_ALIASES_MAP = {
        "Amazon Silk": "amazon_silk",
        "Android Browser": "android",
        // ... other browsers
    };

    const BROWSER_MAP = { 
        amazon_silk: "Amazon Silk", 
        android: "Android Browser", 
        // ... other browsers
    };

    const PLATFORMS_MAP = {
        tablet: "tablet", 
        mobile: "mobile", 
        desktop: "desktop", 
        tv: "tv"
    };

    const OS_MAP = { 
        WindowsPhone: "Windows Phone",
        Windows: "Windows",
        // ... other OS
    };

    const ENGINE_MAP = { 
        EdgeHTML: "EdgeHTML", 
        Blink: "Blink", 
        // ... other engines
    };

    // Helper functions
    const utils = {
        getFirstMatch(regex, ua) {
            const match = ua.match(regex);
            return (match && match.length > 0 && match[1]) || "";
        },
        getSecondMatch(regex, ua) {
            const match = ua.match(regex);
            return (match && match.length > 1 && match[2]) || "";
        },
        // ... other utility functions
    };

    // Main class for parsing
    class Parser {
        constructor(ua, skipParsing) {
            this._ua = ua;
            this.parsedResult = {};
            if (!skipParsing) this.parse();
        }

        // Parsing functions for browser, OS, platform etc.
        parse() {
            this.parseBrowser();
            this.parseOS();
            this.parsePlatform();
            this.parseEngine();
            return this;
        }
        
        // Example browser parsing
        parseBrowser() {
            const browser = BROWSER_ALIASES_MAP[this.getUA()];
            this.parsedResult.browser = {
                name: browser || "unknown",
                version: utils.getFirstMatch(/version\/(\d+(\.?_?\d+)+)/i, this.getUA())
            };
            return this.parsedResult.browser;
        }
        
        getUA() {
            return this._ua;
        }

        // ... Remaining getter, parsing and utility methods
    }

    const Bowser = {
        getParser: (uaString, skipParsing = false) => {
            if (typeof uaString !== 'string') throw new Error("UserAgent should be a string");
            return new Parser(uaString, skipParsing);
        },
        parse: (uaString) => {
            return new Parser(uaString).getResult();
        },
        BROWSER_MAP,
        ENGINE_MAP,
        OS_MAP,
        PLATFORMS_MAP
    };

    return Bowser;
});
