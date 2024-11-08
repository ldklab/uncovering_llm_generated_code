// browserParser.js

class BrowserParser {
  constructor(userAgent) {
    this.userAgent = userAgent.toLowerCase();
    this.parsedResult = this._parseUserAgent();
  }

  _parseUserAgent() {
    const ua = this.userAgent;

    const regexMatch = (regexes) => {
      for (const { name, regex } of regexes) {
        const match = regex.exec(ua);
        if (match) {
          return { name, version: match[1]?.replace('_', '.') || '' };
        }
      }
      return { name: 'unknown', version: '' };
    };

    const browserRegexes = [
      { name: 'chrome', regex: /chrome\/([\d.]+)/ },
      { name: 'firefox', regex: /firefox\/([\d.]+)/ },
      { name: 'safari', regex: /version\/([\d.]+).*safari/ },
      { name: 'internet explorer', regex: /msie ([\d.]+)/ },
      { name: 'opera', regex: /opera\/([\d.]+)/ },
    ];

    const osRegexes = [
      { name: 'windows', regex: /windows nt ([\d.]+)/ },
      { name: 'macos', regex: /mac os x ([\d_]+)/ },
      { name: 'linux', regex: /linux/ },
    ];

    const platformRegexes = [
      { type: 'desktop', regex: /(win|mac|linux)/ },
      { type: 'mobile', regex: /(iphone|android|mobile)/ },
    ];

    const engineRegexes = [
      { name: 'trident', regex: /trident\/([\d.]+)/ },
      { name: 'webkit', regex: /webkit\/([\d.]+)/ },
      { name: 'gecko', regex: /gecko\/([\d.]+)/ },
    ];

    const browser = regexMatch(browserRegexes);
    const os = regexMatch(osRegexes);
    const platform = regexMatch(platformRegexes);
    const engine = regexMatch(engineRegexes);

    if (os.name === 'macos') {
      os.versionName = this._getMacOSVersionName(os.version);
    }

    return { browser, os, platform, engine };
  }

  _getMacOSVersionName(version) {
    const versionMap = {
      '10.15': 'Catalina',
      '10.14': 'Mojave',
      // ...other versions
    };
    return versionMap[version] || 'unknown';
  }

  getBrowserName() {
    return this.parsedResult.browser.name;
  }

  getBrowser() {
    return this.parsedResult.browser;
  }

  satisfies(conditions = {}) {
    const { browser } = this.parsedResult;

    const versionComparator = (version, condition) => {
      const [operator, conditionVersion] = [condition.charAt(0), condition.slice(1)];
      return (
        (operator === '>' && version > conditionVersion) ||
        (operator === '<' && version < conditionVersion) ||
        (operator === '=' && version === conditionVersion) ||
        (operator === '~' && version.startsWith(conditionVersion))
      );
    };

    const conditionsMet = (type, availableVersion) =>
      Object.entries(conditions[type] || {}).some(
        ([name, condition]) =>
          browser.name.includes(name) && versionComparator(availableVersion, condition)
      );

    return (
      ['windows', 'macos', 'mobile', 'desktop', 'browser'].some((type) =>
        conditionsMet(type, browser.version)
      )
    );
  }

  static getParser(userAgent) {
    return new BrowserParser(userAgent);
  }

  static parse(userAgent) {
    return new BrowserParser(userAgent).parsedResult;
  }
}

module.exports = BrowserParser;
