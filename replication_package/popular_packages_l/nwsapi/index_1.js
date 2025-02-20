// NWSAPI.js - Fast CSS Selectors API Engine

(function(global) {
  
  const NW = {
    Dom: {
      // Configuration settings initialized with default values
      _config: {
        IDS_DUPES: true, // Allow duplicate ids
        LIVECACHE: true, // Enable caching
        MIXEDCASE: true, // Allow mixed case
        LOGERRORS: true  // Log errors
      },

      // Method to configure engine options
      configure(options) {
        // Merge user-provided options with the current config
        Object.assign(this._config, options);
        return this._config;
      },

      // Methods for DOM Selection
      ancestor(selector, context, callback) {
        // Traverse up the DOM tree to find an ancestor matching the selector
        let element = context.parentElement;
        while (element) {
          if (this.match(selector, element)) {
            if (callback) callback(element); // Execute a callback if provided
            return element; // Return the first matching ancestor
          }
          element = element.parentElement;
        }
        return null; // Return null if no matching ancestor is found
      },

      first(selector, context, callback) {
        // Select the first matching element for the given selector
        const match = this.select(selector, context)[0] || null;
        if (match && callback) callback(match); // Execute a callback if provided
        return match; // Return the first matching element or null if none
      },

      match(selector, element, callback) {
        // Check if an element matches a given CSS selector
        const matches = element.matches || element.webkitMatchesSelector || element.mozMatchesSelector || element.msMatchesSelector;
        const result = matches.call(element, selector);
        if (result && callback) callback(element); // Execute a callback if provided
        return result; // Return true if matches, false otherwise
      },

      select(selector, context, callback) {
        // Find all elements in the context that match the selector
        const results = Array.from(context.querySelectorAll(selector));
        if (callback) results.forEach(callback); // Execute a callback for each match if provided
        return results; // Return all matching elements in an array
      },

      // Helper Methods for DOM Manipulation
      byId(id, from = document) {
        // Get element by ID within a given context
        return from.querySelector(`#${id}`);
      },

      byTag(tag, from = document) {
        // Get elements by tag name within a given context
        return Array.from(from.getElementsByTagName(tag));
      },

      byClass(cls, from = document) {
        // Get elements by class name within a given context
        return Array.from(from.getElementsByClassName(cls));
      },

      // Methods to Extend Functionality
      registerCombinator(symbol, resolver) {
        // Register a new combinator by symbol
        console.log(`Registering combinator ${symbol}: ${resolver}`);
      },

      registerOperator(symbol, resolver) {
        // Register a new operator by symbol
        console.log(`Registering operator ${symbol}`, resolver);
      },

      registerSelector(name, rexp, func) {
        // Register a new selector with a specific name and function
        console.log(`Registering selector ${name}`);
      },
    }
  };

  // Export or expose NW.Dom module based on the environment
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = NW.Dom;
  } else {
    global.NW = NW;
  }
  
})(typeof window !== 'undefined' ? window : this);

// Usage Example
// Select and log all elements with the class 'example' in the document
// NW.Dom.select('.example', document, console.log);
