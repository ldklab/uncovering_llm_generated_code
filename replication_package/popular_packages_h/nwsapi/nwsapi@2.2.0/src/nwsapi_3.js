(function Export(global, factory) {
  'use strict';

  if (typeof module === 'object' && typeof exports === 'object') {
    module.exports = factory;
  } else if (typeof define === 'function' && define.amd) {
    define(factory);
  } else {
    global.NW || (global.NW = {});
    global.NW.Dom = factory(global);
  }

})(this, function Factory(global) {

  var version = 'nwsapi-2.2.0',
      doc = global.document,
      root = doc.documentElement,
      slice = Array.prototype.slice,
      matchRes = {}, selectRes = {}, matchCache = {}, selectCache = {}, hasDupes = false,
      nonHTML = [], HTML_DOC = false, QUIRKS_MODE = false, NAMESPACE;
      
  var CFG = { operators: '[~*^$|]=|=', combinators: '[\\x20\\t>+~](?=[^>+~])' };

  var REX = {
    HasEscapes: /\\/, HexNumbers: /^[0-9a-fA-F]/, 
    EscOrQuote: /^\\|["']/, RegExpChar: /(?:(?!\\)[\\^$.*+?()[\\]{}|/])/g,
    TrimSpaces: /[\r\n\f]|^[\x20\t\r\n\f]+|[\x20\t\r\n\f]+$/g,
    CommaGroup: /(\s*,\s*)/g, SplitGroup: /((?:\\x28[^\\x29]*\\x29|\[[^\]]*\]|\\.|[^,])+)/g
  };

  function domSetup(doc) {
    root = doc.documentElement;
    HTML_DOC = root && doc.contentType.indexOf('/html') > 0;
    QUIRKS_MODE = HTML_DOC && doc.compatMode.indexOf('CSS') < 0;
  }

  function configure(options, clear) {
    for (var opt in options) {
      options.hasOwnProperty(opt) && (CFG[opt] = options[opt]);
    }
    if (clear) matchCache = selectCache = {};
    return true;
  }

  function byId(id, context) {
    return context.getElementById(id) ? [context.getElementById(id)] : [];
  }
  
  function byTag(tag, context) {
    return slice.call(context.getElementsByTagName(tag));
  }
  
  function byClass(cls, context) {
    return slice.call(context.getElementsByClassName(cls));
  }

  function match(selector, element, callback) {
    if (!element || typeof selector !== 'string') return false;
    if (selectCache[selector]) return matchExecuter(selectCache[selector], element, callback);
    return compile(selector, element, callback, false);
  }

  function first(selector, context, callback) {
    return select(selector, context, function(e) { callback(e); return false; })[0] || null;
  }

  function select(selector, context, callback) {
    if (!context || typeof selector !== 'string') return [];
    if (selectCache[selector]) return selectExecuter(selectCache[selector].factory, context, callback);
    return compile(selector, context, callback, true);
  }

  function compile(selector, context, callback, isSelect) {
    var selectors = selector.split(','), i, selGroup = [];
    for (i = 0; i < selectors.length; i++) {
      if (isSelect) {
        if (!selectCache[selectors[i]]) {
          selectCache[selectors[i]] = parseSelector(selectors[i]);
        }
        selGroup.push(selectCache[selectors[i]].factory);
      } else {
        if (!matchCache[selectors[i]]) {
          matchCache[selectors[i]] = parseSelector(selectors[i]);
        }
        selGroup.push(matchCache[selectors[i]].factory);
      }
    }
    return isSelect ? selectExecuter(selGroup, context, callback) : matchExecuter(selGroup, context, callback);
  }

  function parseSelector(selector) {
    // Parse and compile selector here
    return {
      factory: function(context, callback) {
        // Execute compiled selector logic here
      },
      context: context
    };
  }

  function matchExecuter(factory, element, callback) {
    for (var i = 0, l = factory.length; i < l; i++) {
      if (factory[i](element, callback)) return true;
    }
    return false;
  }

  function selectExecuter(factory, context, callback) {
    var nodes = [], i, j, l, f, results;
    for (i = 0, l = factory.length; i < l; i++) {
      f = factory[i];
      results = f(context, callback);
      for (j = 0; j < results.length; j++) {
        nodes.push(results[j]);
      }
    }
    if (nodes.length > 1) {
      nodes = unique(nodes);
    }
    if (typeof callback === 'function') {
      for (i = 0, l = nodes.length; i < l; i++) {
        callback(nodes[i]);
      }
    }
    return nodes;
  }

  function unique(nodes) {
    nodes.sort(function(a, b) { return a.compareDocumentPosition(b) & 4 ? -1 : 1; });
    for (var i = 1, j = 0; i < nodes.length; i++) {
      if (nodes[i] !== nodes[j]) {
        nodes[++j] = nodes[i];
      }
    }
    nodes.length = j + 1;
    return nodes;
  }

  domSetup(doc);

  return {
    configure: configure,
    byId: byId,
    byTag: byTag,
    byClass: byClass,
    match: match,
    first: first,
    select: select,
    version: version
  };

});
