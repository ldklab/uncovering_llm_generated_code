// bowser.js

class BrowserParser {
  constructor(userAgent) {
    this.userAgent = userAgent.toLowerCase();
    this.parsedResult = this.parseUserAgent();
  }

  parseUserAgent() {
    const ua = this.userAgent;
    
    const parseDetails = (regexes) => {
      for (let { name, regex } of regexes) {
        const match = regex.exec(ua);
        if (match) {
          return { name, version: match[1].replace('_', '.') };
        }
      }
      return { name: 'unknown', version: '' };
    };

    const parsePlatform = (regexes) => {
      for (let { type, regex } of regexes) {
        if (regex.test(ua)) return { type };
      }
      return { type: 'unknown' };
    };

    const browserRegexes = [
      { name: 'chrome', regex: /chrome\/([\d.]+)/ },
      { name: 'firefox', regex: /firefox\/([\d.]+)/ },
      { name: 'safari', regex: /version\/([\d.]+).*safari/ },
      { name: 'internet explorer', regex: /msie ([\d.]+)/ },
      { name: 'opera', regex: /opera\/([\d.]+)/ }
    ];
    
    const osRegexes = [
      { name: 'windows', regex: /windows nt ([\d.]+)/ },
      { name: 'macos', regex: /mac os x ([\d_]+)/ },
      { name: 'linux', regex: /linux/ }
    ];
    
    const platformRegexes = [
      { type: 'desktop', regex: /(win|mac|linux)/ },
      { type: 'mobile', regex: /(iphone|android|mobile)/ }
    ];
    
    const engineRegexes = [
      { name: 'trident', regex: /trident\/([\d.]+)/ },
      { name: 'webkit', regex: /webkit\/([\d.]+)/ },
      { name: 'gecko', regex: /gecko\/([\d.]+)/ }
    ];
    
    const browser = parseDetails(browserRegexes);
    const os = parseDetails(osRegexes);
    const platform = parsePlatform(platformRegexes);
    const engine = parseDetails(engineRegexes);
    
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
      '10.1': 'Puma'
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
    
    const checkVersionMatch = (name, currentVersion, condition) => {
      const operator = condition[0];
      const targetVersion = condition.slice(1);
      switch (operator) {
        case '>':
          return currentVersion > targetVersion;
        case '<':
          return currentVersion < targetVersion;
        case '=':
          return currentVersion === targetVersion;
        case '~':
          return currentVersion.startsWith(targetVersion);
        default:
          return false;
      }
    };

    const conditionCheck = (typeConditions, type) => {
      return Object.entries(typeConditions[type] || {}).some(([name, condition]) => 
        browser.name.includes(name) && checkVersionMatch(name, browser.version, condition)
      );
    };

    return ['browser', 'windows', 'macos', 'mobile', 'desktop'].some(type =>
      conditionCheck(conditions, type)
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
