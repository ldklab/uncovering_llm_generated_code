(function(global, factory) {
    if (typeof exports === 'object' && typeof module === 'object') {
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof exports === 'object') {
        exports.browserDetector = factory();
    } else {
        global.browserDetector = factory();
    }
})(this, function() {
    const BROWSER_MAP = {
        chrome: "Chrome",
        firefox: "Firefox",
        safari: "Safari",
        edge: "Microsoft Edge",
        ie: "Internet Explorer",
    };

    const OS_MAP = {
        Windows: "Windows",
        MacOS: "macOS",
        iOS: "iOS",
        Android: "Android",
        Linux: "Linux",
    };

    function detectBrowser(userAgent) {
        for (let name in BROWSER_MAP) {
            if (userAgent.toLowerCase().includes(name)) {
                return { name: BROWSER_MAP[name], version: /version\/([\d.]+)/.exec(userAgent) ? /version\/([\d.]+)/.exec(userAgent)[1] : "unknown" };
            }
        }
        return { name: "unknown", version: "unknown" };
    }

    function detectOS(userAgent) {
        for (let name in OS_MAP) {
            if (userAgent.toLowerCase().includes(name.toLowerCase())) {
                return { name: OS_MAP[name], version: "unknown" };
            }
        }
        return { name: "unknown", version: "unknown" };
    }

    function parseUserAgent(userAgent) {
        if (typeof userAgent !== 'string') {
            throw new Error("UserAgent should be a string");
        }
        return {
            browser: detectBrowser(userAgent),
            os: detectOS(userAgent),
        };
    }

    return {
        parse: parseUserAgent,
    };
});
