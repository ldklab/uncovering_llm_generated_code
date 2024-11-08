(() => {
  function extendStatics(d, b) {
    extendStatics = Object.setPrototypeOf ||
      (({ __proto__: [] } instanceof Array) && ((d, b) => { d.__proto__ = b; })) ||
      ((d, b) => { for (let p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; });
    return extendStatics(d, b);
  }

  const __extends = (d, b) => {
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : ((__.prototype = b.prototype), new __());
  };

  const __assign = (...args) => Object.assign ? Object.assign(...args) : args.reduce((acc, obj) => ({ ...acc, ...obj }), {});

  const __rest = (s, e) => {
    let t = {};
    for (let p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function") {
      for (let i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
        if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
      }
    }
    return t;
  };

  class PlatformBrowser {
    constructor() { /* Browser-specific initialization */ }

    static createElement(tagName, doc = document) {
      return doc.createElement(tagName);
    }

    static addEventListener(target, event, callback) {
      target.addEventListener(event, callback, false);
      return () => target.removeEventListener(event, callback, false);
    }

    static sanitizeHTML(html) {
      const div = document.createElement('div');
      div.innerHTML = html;
      const sanitized = div.textContent || div.innerText || '';
      div.remove();
      return sanitized;
    }

    static setDocumentTitle(title) {
      document.title = title;
    }
  }

  // Export to global scope (simplified export approach)
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = PlatformBrowser;
  } else if (typeof define === 'function' && define.amd) {
    define('PlatformBrowser', [], () => PlatformBrowser);
  } else {
    window.PlatformBrowser = PlatformBrowser;
  }
})();
