// Fast CSS Selectors API Engine
(function(global) {
  const DomEngine = {
    _config: {
      IDS_DUPES: true,
      LIVECACHE: true,
      MIXEDCASE: true,
      LOGERRORS: true
    },

    configure(options) {
      Object.assign(this._config, options);
      return this._config;
    },

    ancestor(selector, context, callback) {
      let element = context.parentElement;
      while (element) {
        if (this.match(selector, element)) {
          if (callback) callback(element);
          return element;
        }
        element = element.parentElement;
      }
      return null;
    },

    first(selector, context, callback) {
      const match = this.select(selector, context)[0] || null;
      if (match && callback) callback(match);
      return match;
    },

    match(selector, element, callback) {
      const matches = element.matches || 
                      element.webkitMatchesSelector || 
                      element.mozMatchesSelector || 
                      element.msMatchesSelector;
      const result = matches.call(element, selector);
      if (result && callback) callback(element);
      return result;
    },

    select(selector, context, callback) {
      const results = Array.from(context.querySelectorAll(selector));
      if (callback) results.forEach(callback);
      return results;
    },

    byId(id, from = document) {
      return from.querySelector(`#${id}`);
    },

    byTag(tag, from = document) {
      return Array.from(from.getElementsByTagName(tag));
    },

    byClass(cls, from = document) {
      return Array.from(from.getElementsByClassName(cls));
    },

    registerCombinator(symbol, resolver) {
      console.log(`Registering combinator ${symbol}: ${resolver}`);
    },

    registerOperator(symbol, resolver) {
      console.log(`Registering operator ${symbol}`, resolver);
    },

    registerSelector(name, rexp, func) {
      console.log(`Registering selector ${name}`);
    },
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = DomEngine;
  } else {
    global.DomEngine = DomEngine;
  }
})(typeof window !== 'undefined' ? window : this);

// Usage Example
// DomEngine.select('.example', document, console.log);
