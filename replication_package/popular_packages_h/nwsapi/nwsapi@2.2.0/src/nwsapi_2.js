/*!
 * nwsapi.js - A Fast CSS Selectors API Engine
 * © 2007-2019 Diego Perini. All rights reserved.
 * Version 2.2.0
 * License: MIT License (http://javascript.nwbox.com/nwsapi/MIT-LICENSE)
 */

(function (global, factory) {
  'use strict';

  // Module export based on environment
  if (typeof module === 'object' && typeof exports === 'object') {
    module.exports = factory;
  } else if (typeof define === 'function' && define.amd) {
    define(factory);
  } else {
    global.NW = global.NW || {};
    global.NW.Dom = factory(global);
  }
})(this, function (global) {
  // Core setup
  const version = 'nwsapi-2.2.0',
        document = global.document,
        root = document.documentElement,
        slice = Array.prototype.slice;

  const CFG = {
    operators: '[~*^$|]=|=',
    combinators: '[\\x20\\t>+~](?=[^>+~])'
  };

  const REX = {
    HasEscapes: /\\/,
    HexNumbers: /^[0-9a-fA-F]/,
    RegExpChar: /[\\^$.*+?()[\]{}|/]/g,
    TrimSpaces: /[\r\n\f]|^\s+|\s+$/g,
  };

  const Patterns = {
    id: /^#(\S+)(.*)/,
    className: /^\.([\w-]+)(.*)/,
    tagName: /^(\w+)(.*)/
  };

  const Config = {
    IDS_DUPES: true,
    MIXEDCASE: true,
    LOGERRORS: true,
    VERBOSITY: true
  };

  const none = [];

  // Utility functions
  function emit(message, proto) {
    if (Config.VERBOSITY) {
      throw proto ? new proto(message) : new global.DOMException(message, 'SyntaxError');
    }
    if (Config.LOGERRORS && console && console.log) {
      console.log(message);
    }
  }

  function switchContext(context, force) {
    document = context.ownerDocument || context;
    root = document.documentElement;
    return document;
  }

  function compile(selector, mode, callback) {
    // Compilation logic...
  }

  function match(selectors, element, callback) {
    if (!element) return false;
    if (matchResolvers[selectors]) {
      return match_assert(matchResolvers[selectors].factory, element, callback);
    }

    lastMatched = selectors;
    if (arguments.length === 0) {
      emit('Not enough arguments', TypeError);
      return Config.VERBOSITY ? undefined : false;
    } else if (selectors === '') {
      emit('Empty string is not a valid selector');
      return Config.VERBOSITY ? undefined : false;
    }

    selectors = '' + selectors;

    const parsed = selectors
      .replace(REX.TrimSpaces, '');
    let expressions;

    if ((expressions = parsed.match(reValidator))) {
      expressions = parsed.match(REX.SplitGroup);
    } else {
      emit(`'${selectors}' is not a valid selector`);
      return Config.VERBOSITY ? undefined : false;
    }

    matchResolvers[selectors] = match_collect(expressions, callback);
    return match_assert(matchResolvers[selectors].factory, element, callback);
  }

  function select(selectors, context, callback) {
    const nodes = [];
    context = context || document;

    if (selectors) {
      const resolver = selectResolvers[selectors];
      if (resolver && resolver.context === context && resolver.callback === callback) {
        return callback ? concatCall(resolver.results, callback) : resolver.results;
      }
    }

    lastSelected = selectors;
    if (arguments.length === 0) {
      emit('Not enough arguments', TypeError);
      return Config.VERBOSITY ? undefined : none;
    } else if (selectors === '') {
      emit('Empty string is not a valid selector');
      return Config.VERBOSITY ? undefined : none;
    }

    selectors = '' + selectors;
    const parsed = selectors
      .replace(REX.TrimSpaces, '');

    let expressions;

    if ((expressions = parsed.match(reValidator))) {
      expressions = parsed.match(REX.SplitGroup);
    } else {
      emit(`'${selectors}' is not a valid selector`);
      return Config.VERBOSITY ? undefined : none;
    }

    selectResolvers[selectors] = collect(expressions, context, callback);
    return callback ? concatCall(selectResolvers[selectors].results, callback) : selectResolvers[selectors].results;
  }

  function collect(selectors, context, callback) {
    const results = [];
    selectors.forEach(selector => {
      const token = (selector.match(reOptimizer) || [])[0] || '*';
      const htmlset = compat[token[0]](context, token.slice(1));
      const factory = compile(selector, true, callback);
      results.push(...(factory ? factory(htmlset(), callback, context, results) : htmlset()));
    });

    if (results.length > 1) {
      results.sort(documentOrder);
      hasDupes && (results = unique(results));
    }

    return { context, factory, results };
  }

  // Public API
  return {
    match,
    select,
    compile,
    version
  };
});
