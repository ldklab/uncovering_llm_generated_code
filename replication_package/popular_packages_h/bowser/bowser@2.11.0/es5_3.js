(function (global, factory) {
    if (typeof exports === 'object' && typeof module !== 'undefined') {
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else {
        global.bowser = factory();
    }
}(this, (function () {
    'use strict';

    const BROWSER_ALIASES_MAP = {
        "Amazon Silk": "amazon_silk",
        "Android Browser": "android",
        // ... other browser aliases
    };

    const BROWSER_MAP = {
        "amazon_silk": "Amazon Silk",
        "android": "Android Browser",
        // ... other browser names
    };

    function getFirstMatch(regex, uaString) {
        const match = uaString.match(regex);
        return (match && match.length > 0 && match[1]) || '';
    }

    function BrowserParser(uaString) {
        this.uaString = uaString;
        this.result = this.parse();
    }

    BrowserParser.prototype.parse = function () {
        const browser = this.parseBrowser();
        const os = this.parseOS();
        // Perform additional parsing logic if necessary
        return { browser, os };
    };

    BrowserParser.prototype.parseBrowser = function () {
        let browser = { name: getFirstMatch(/(?:chrome|crios|crmo)\/(\d+(\.?_?\d+)+)/i, this.uaString) ? "Chrome" : "Unknown" };
        const version = getFirstMatch(/(?:chrome|crios|crmo)\/(\d+(\.?_?\d+)+)/i, this.uaString);
        if (version) {
            browser.version = version;
        }
        return browser;
    };

    BrowserParser.prototype.parseOS = function () {
        // Similar logic to extract the OS name and version
        return {};
    };

    BrowserParser.prototype.getResult = function () {
        return this.result;
    };

    function parse(uaString) {
        return (new BrowserParser(uaString)).getResult();
    }

    return { parse };

})));
