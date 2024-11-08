(function(global, factory) {
  if (typeof module === "object" && typeof module.exports === "object") {
    module.exports = factory();
  } else if (typeof define === "function" && define.amd) {
    define([], factory);
  } else {
    global.bowser = factory();
  }
})(typeof window !== "undefined" ? window : this, function() {
  const utils = {
    getFirstMatch: (regex, ua) => ua.match(regex)?.[1] || '',
    getSecondMatch: (regex, ua) => ua.match(regex)?.[2] || '',
    matchAndReturnConst: (regex, ua, constant) => (regex.test(ua) ? constant : undefined),
    compareVersions: (v1, v2) => {
      // Simplified version comparison logic could be added here
    },
    assign: (target, ...sources) => Object.assign(target, ...sources)
  };

  const mappings = {
    BROWSER_ALIASES_MAP: {
      "Amazon Silk": "amazon_silk",
      Chrome: "chrome",
      Safari: "safari",
      // Other mappings...
    },
    BROWSER_MAP: {
      amazon_silk: "Amazon Silk",
      chrome: "Chrome",
      safari: "Safari",
      // Other mappings...
    },
    // Additional mappings for engine, OS, and platforms...
  };

  class Parser {
    constructor(ua) {
      if (!ua) throw new Error("UserAgent parameter can't be empty");
      this.ua = ua;
      this.parsedResult = {};
      this.parse();
    }

    getUA() {
      return this.ua;
    }

    parse() {
      this.parseBrowser();
      this.parseOS();
      this.parsePlatform();
      this.parseEngine();
      return this;
    }

    parseBrowser() {
      this.parsedResult.browser = {
        name: utils.getFirstMatch(/(Chrome|Safari|Firefox)/i, this.ua),
        version: utils.getFirstMatch(/version\/(\d+(\.\d+)?)/i, this.ua)
      };
    }

    // Similar methods: parseOS, parsePlatform, parseEngine

    getResult() {
      return utils.assign({}, this.parsedResult);
    }
  }

  const Bowser = {
    getParser: ua => new Parser(ua),
    parse: ua => new Parser(ua).getResult(),
    // Accessors for different maps
  };

  return Bowser;
});
