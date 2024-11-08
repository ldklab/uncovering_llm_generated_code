// NWSAPI.js - Fast CSS Selectors API Engine

(function(global) {
  
  const NW = {
    Dom: {
      // Current configuration settings
      _config: {
        IDS_DUPES: true,
        LIVECACHE: true,
        MIXEDCASE: true,
        LOGERRORS: true
      },

      // Configure engine options
      configure(options) {
        Object.assign(this._config, options);
        return this._config;
      },

      // DOM Selection Methods
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
        const matches = element.matches || element.webkitMatchesSelector || element.mozMatchesSelector || element.msMatchesSelector;
        const result = matches.call(element, selector);
        if (result && callback) callback(element);
        return result;
      },

      select(selector, context, callback) {
        const results = Array.from(context.querySelectorAll(selector));
        if (callback) results.forEach(callback);
        return results;
      },

      // DOM Helper Methods
      byId(id, from = document) {
        return from.querySelector(`#${id}`);
      },

      byTag(tag, from = document) {
        return Array.from(from.getElementsByTagName(tag));
      },

      byClass(cls, from = document) {
        return Array.from(from.getElementsByClassName(cls));
      },

      // Extending Functionality
      registerCombinator(symbol, resolver) {
        // Implementation to register a new combinator
        console.log(`Registering combinator ${symbol}: ${resolver}`);
      },

      registerOperator(symbol, resolver) {
        // Implementation to register a new operator
        console.log(`Registering operator ${symbol}`, resolver);
      },

      registerSelector(name, rexp, func) {
        // Implementation to register a new selector
        console.log(`Registering selector ${name}`);
      },

    }
  };

  // Expose NW.Dom module to the global object
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = NW.Dom;
  } else {
    global.NW = NW;
  }
  
})(typeof window !== 'undefined' ? window : this);

// Usage Example
// NW.Dom.select('.example', document, console.log);
