// browserParser.js

class BrowserParser {
  constructor(userAgent) {
    this.userAgent = userAgent.toLowerCase();
    this.parsedResult = this.parseUserAgent();
  }

  parseUserAgent() {
    const ua = this.userAgent;
    const definitions = {
      browsers: [
        { name: 'chrome', pattern: /chrome\/([\d.]+)/ },
        { name: 'firefox', pattern: /firefox\/([\d.]+)/ },
        { name: 'safari', pattern: /version\/([\d.]+).*safari/ },
        { name: 'internet explorer', pattern: /msie ([\d.]+)/ },
        { name: 'opera', pattern: /opera\/([\d.]+)/ },
      ],
      operatingSystems: [
        { name: 'windows', pattern: /windows nt ([\d.]+)/ },
        { name: 'macos', pattern: /mac os x ([\d_]+)/ },
        { name: 'linux', pattern: /linux/ },
      ],
      platforms: [
        { type: 'desktop', pattern: /(win|mac|linux)/ },
        { type: 'mobile', pattern: /(iphone|android|mobile)/ },
      ],
      engines: [
        { name: 'trident', pattern: /trident\/([\d.]+)/ },
        { name: 'webkit', pattern: /webkit\/([\d.]+)/ },
        { name: 'gecko', pattern: /gecko\/([\d.]+)/ },
      ],
    };

    const findMatch = (group) => {
      for (let item of group) {
        const match = item.pattern.exec(ua);
        if (match) return { name: item.name || item.type, version: match[1].replace('_', '.') };
      }
      return null;
    };

    const browser = findMatch(definitions.browsers) || { name: 'unknown', version: '' };
    const os = findMatch(definitions.operatingSystems) || { name: 'unknown', version: '' };
    const platform = findMatch(definitions.platforms) || { type: 'unknown' };
    const engine = findMatch(definitions.engines) || { name: 'unknown', version: '' };

    if (os.name === 'macos') {
      os.versionName = this.getMacOSVersionName(os.version);
    }

    return { browser, os, platform, engine };
  }

  getMacOSVersionName(version) {
    const macVersions = {
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
    return macVersions[version] || 'unknown';
  }

  getBrowserName() {
    return this.parsedResult.browser.name;
  }

  getBrowser() {
    return this.parsedResult.browser;
  }

  satisfies(conditions = {}) {
    const { browser } = this.parsedResult;

    const versionCheck = (version, condition) => {
      const [operator, ...vParts] = condition.split(/(?=\d)/);
      const targetVersion = vParts.join('');
      switch (operator) {
        case '>': return version > targetVersion;
        case '<': return version < targetVersion;
        case '=': return version === targetVersion;
        case '~': return version.startsWith(targetVersion);
        default: return false;
      }
    };

    return Object.entries(conditions).some(([type, checks]) =>
      Object.entries(checks).some(([name, condition]) =>
        browser.name.includes(name) && versionCheck(browser.version, condition)
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
