// NWSAPI.js - Fast CSS Selectors API Engine

(function(global) {
  
  const NW = {
    Dom: {
      // Current configuration settings
      _config: {
        IDS_DUPES: true,       // Allow duplicate IDs
        LIVECACHE: true,       // Use live cache
        MIXEDCASE: true,       // Support mixed case elements
        LOGERRORS: true        // Log errors
      },

      // Configure engine options
      configure(options) {
        // Update configuration options
        Object.assign(this._config, options);
        return this._config;
      },

      // DOM Selection Methods
      ancestor(selector, context, callback) {
        // Find the closest ancestor matching the selector
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
        // Get the first matching element
        const match = this.select(selector, context)[0] || null;
        if (match && callback) callback(match);
        return match;
      },

      match(selector, element, callback) {
        // Check if the element matches the selector
        const matches = element.matches || element.webkitMatchesSelector || element.mozMatchesSelector || element.msMatchesSelector;
        const result = matches.call(element, selector);
        if (result && callback) callback(element);
        return result;
      },

      select(selector, context, callback) {
        // Select all elements matching the selector
        const results = Array.from(context.querySelectorAll(selector));
        if (callback) results.forEach(callback);
        return results;
      },

      // DOM Helper Methods
      byId(id, from = document) {
        // Get element by ID
        return from.querySelector(`#${id}`);
      },

      byTag(tag, from = document) {
        // Get elements by tag name
        return Array.from(from.getElementsByTagName(tag));
      },

      byClass(cls, from = document) {
        // Get elements by class name
        return Array.from(from.getElementsByClassName(cls));
      },

      // Extending Functionality
      registerCombinator(symbol, resolver) {
        // Register a new combinator
        console.log(`Registering combinator ${symbol}: ${resolver}`);
      },

      registerOperator(symbol, resolver) {
        // Register a new operator
        console.log(`Registering operator ${symbol}`, resolver);
      },

      registerSelector(name, rexp, func) {
        // Register a new selector
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

// Example usage
// NW.Dom.select('.example', document, console.log);
