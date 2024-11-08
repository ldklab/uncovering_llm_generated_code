// bowser.js

class BrowserParser {
  constructor(userAgent) {
    this.userAgent = userAgent.toLowerCase();
    this.parsedResult = this.parseUserAgent();
  }

  parseUserAgent() {
    const ua = this.userAgent;
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

    const parseWithRegexes = (regexes) => {
      for (let item of regexes) {
        const match = item.regex.exec(ua);
        if (match) {
          return { name: item.name, version: match[1].replace('_', '.') };
        }
      }
      return null;
    };

    const browser = parseWithRegexes(browserRegexes) || { name: 'unknown', version: '' };
    const os = parseWithRegexes(osRegexes) || { name: 'unknown', version: '' };
    const platform = parseWithRegexes(platformRegexes) || { type: 'unknown' };
    const engine = parseWithRegexes(engineRegexes) || { name: 'unknown', version: '' };

    if (os.name === 'macos') {
      os.versionName = this.getMacOSVersionName(os.version);
    }

    return { browser, os, platform, engine };
  }

  getMacOSVersionName(version) {
    const versionMap = {
      '10.15': 'Catalina',
      '10.14': 'Mojave',
      '10.13': 'High Sierra',
      '10.12': 'Sierra',
      '10.11': 'El Capitan',
      '10.10': 'Yosemite',
      '10.9': 'Mavericks',
      '10.8': 'Mountain Lion',
      '10.7': 'Lion',
      '10.6': 'Snow Leopard',
      '10.5': 'Leopard',
      '10.4': 'Tiger',
      '10.3': 'Panther',
      '10.2': 'Jaguar',
      '10.1': 'Puma',
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
    const { browser, os, platform } = this.parsedResult;

    const checkVersion = (name, version, condition) => {
      const operator = condition[0];
      const targetVersion = condition.slice(1);
      switch (operator) {
        case '>':
          return version > targetVersion;
        case '<':
          return version < targetVersion;
        case '=':
          return version === targetVersion;
        case '~':
          return version.startsWith(targetVersion);
        default:
          return false;
      }
    };

    const checkConditions = (conditions, type, availableVersion) => {
      return Object.keys(conditions[type] || {}).some((name) => {
        return (
          browser.name.includes(name) &&
          checkVersion(name, availableVersion, conditions[type][name])
        );
      });
    };

    return (
      checkConditions(conditions, 'windows', browser.version) ||
      checkConditions(conditions, 'macos', browser.version) ||
      checkConditions(conditions, 'mobile', browser.version) ||
      checkConditions(conditions, 'desktop', browser.version) ||
      checkConditions(conditions, 'browser', browser.version)
    );
  }

  static getParser(userAgent) {
    return new BrowserParser(userAgent);
  }

  static parse(userAgent) {
    const parser = new BrowserParser(userAgent);
    return parser.parsedResult;
  }
}

module.exports = BrowserParser;
