(function Export(global, factory) {
  'use strict';

  if (typeof module == 'object' && typeof exports == 'object') {
    module.exports = factory;
  } else if (typeof define == 'function' && define.amd) {
    define(factory);
  } else {
    global.NW || (global.NW = {});
    global.NW.Dom = factory(global, Export);
  }

})(this, function Factory(global, Export) {

  var doc = global.document;
  var root = doc.documentElement;

  var CFG = {
    operators: '[~*^$|]=|=',
    combinators: '[\\x20\\t>+~](?=[^>+~])'
  };

  var Patterns = {
    treestruct: RegExp('^:(nth(?:-last)?(?:-child|-of-type))(?:\\((even|odd|(?:[-+]?\\d*)(?:n[-+]?\\d*)?)\\)|)', 'i'),
    id: RegExp('^#([\\w-]+)(.*)'),
    className: RegExp('^\\.([\\w-]+)(.*)'),
    tagName: RegExp('^([\\w-]+)(.*)'),
    universal: RegExp('^\\*(.*)'),
    namespace: RegExp('^(\\w+|\\*)?\\|(.*)')
  };

  var documentOrder = function(a, b) {
    return a.compareDocumentPosition(b) & 4 ? -1 : 1;
  };

  var hasDupes = false;

  var unique = function(nodes) {
    var list = [];
    for (var i = 0; i < nodes.length; i++) {
      if (nodes[i] !== nodes[i + 1]) {
        list.push(nodes[i]);
      }
    }
    hasDupes = false;
    return list;
  };

  var byId = function(id, context) {
    if ('getElementById' in context) {
      var e = context.getElementById(id);
      return e ? [e] : [];
    }
    return [];
  };

  var byTag = function(tag, context) {
    if ('getElementsByTagName' in context) {
      return Array.prototype.slice.call(context.getElementsByTagName(tag));
    }
    return [];
  };

  var byClass = function(cls, context) {
    if ('getElementsByClassName' in context) {
      return Array.prototype.slice.call(context.getElementsByClassName(cls));
    }
    return [];
  };

  var configure = function(option) {
    if (typeof option == 'string') {
      return !! CFG[option];
    }
    if (typeof option != 'object') {
      return CFG;
    }
    for (var i in option) {
      CFG[i] = !! option[i];
    }
    return true;
  };

  var match = function _matches(selectors, element) {
    var expressions = selectors.match(new RegExp(CFG.combinators, 'g'));
    for (var i = 0; i < expressions.length; i++) {
      var expr = expressions[i];
      if (element.matches(expr)) {
        return true;
      }
    }
    return false;
  };

  var first = function _querySelector(selectors, context) {
    return select(selectors, context())[0] || null;
  };

  var select = function _querySelectorAll(selectors, context) {
    context = context || doc;
    var expressions = selectors.match(new RegExp(CFG.combinators, 'g'));
    var results = [];
    for (var i = 0; i < expressions.length; i++) {
      var expr = expressions[i];
      results = results.concat(Array.prototype.slice.call(context.querySelectorAll(expr)));
    }
    results.sort(documentOrder);
    hasDupes && (results = unique(results));
    return results;
  };

  // Initialize
  (function initialize() {})();

  return {
    byId: byId,
    byTag: byTag,
    byClass: byClass,
    configure: configure,
    match: match,
    first: first,
    select: select
  };
});
