// bowser.js

class BrowserParser {
  constructor(userAgent) {
    this.userAgent = userAgent.toLowerCase();
    this.parsedResult = this.parseUserAgent();
  }

  parseUserAgent() {
    const ua = this.userAgent;
    const regexGroups = {
      browsers: [
        { name: 'chrome', regex: /chrome\/([\d.]+)/ },
        { name: 'firefox', regex: /firefox\/([\d.]+)/ },
        { name: 'safari', regex: /version\/([\d.]+).*safari/ },
        { name: 'internet explorer', regex: /msie ([\d.]+)/ },
        { name: 'opera', regex: /opera\/([\d.]+)/ },
      ],
      os: [
        { name: 'windows', regex: /windows nt ([\d.]+)/ },
        { name: 'macos', regex: /mac os x ([\d_]+)/ },
        { name: 'linux', regex: /linux/ },
      ],
      platforms: [
        { type: 'desktop', regex: /(win|mac|linux)/ },
        { type: 'mobile', regex: /(iphone|android|mobile)/ },
      ],
      engines: [
        { name: 'trident', regex: /trident\/([\d.]+)/ },
        { name: 'webkit', regex: /webkit\/([\d.]+)/ },
        { name: 'gecko', regex: /gecko\/([\d.]+)/ },
      ]
    };

    const parse = (array) => {
      for (let item of array) {
        const match = item.regex.exec(ua);
        if (match) return { name: item.name || item.type, version: (match[1] || '').replace('_', '.') };
      }
      return null;
    };

    const browser = parse(regexGroups.browsers) || { name: 'unknown', version: '' };
    const os = parse(regexGroups.os) || { name: 'unknown', version: '' };
    const platform = parse(regexGroups.platforms) || { type: 'unknown' };
    const engine = parse(regexGroups.engines) || { name: 'unknown', version: '' };

    if (os.name === 'macos') {
      os.versionName = this.getMacOSVersionName(os.version);
    }

    return { browser, os, platform, engine };
  }

  getMacOSVersionName(version) {
    return {
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
    }[version] || 'unknown';
  }

  getBrowserName() {
    return this.parsedResult.browser.name;
  }

  getBrowser() {
    return this.parsedResult.browser;
  }

  satisfies(conditions = {}) {
    const { browser } = this.parsedResult;

    const checkVersion = (version, condition) => {
      const operator = condition[0];
      const targetVersion = condition.slice(1);
      switch (operator) {
        case '>': return version > targetVersion;
        case '<': return version < targetVersion;
        case '=': return version === targetVersion;
        case '~': return version.startsWith(targetVersion);
        default: return false;
      }
    };

    const checkConditions = (conditions, type) => {
      for (const name in conditions[type] || {}) {
        if (browser.name.includes(name) && checkVersion(browser.version, conditions[type][name])) {
          return true;
        }
      }
      return false;
    };

    return (
      checkConditions(conditions, 'windows') || 
      checkConditions(conditions, 'macos') || 
      checkConditions(conditions, 'mobile') || 
      checkConditions(conditions, 'desktop') || 
      checkConditions(conditions, 'browser')
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
