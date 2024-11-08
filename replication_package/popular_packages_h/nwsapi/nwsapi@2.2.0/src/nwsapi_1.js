(function Export(global, factory) {
  'use strict';

  if (typeof module === 'object' && typeof exports === 'object') {
    module.exports = factory;
  } else if (typeof define === 'function' && define.amd) {
    define(factory);
  } else {
    global.NW || (global.NW = {});
    global.NW.Dom = factory(global, Export);
  }
})(this, function Factory(global, Export) {
  const version = 'nwsapi-2.2.0';
  const doc = global.document;
  const root = doc.documentElement;
  const slice = Array.prototype.slice;
  const WSP = '[\\x20\\t\\r\\n\\f]';
  const CFG = {
    operators: '[~*^$|]=|=',
    combinators: '[\\x20\\t>+~](?=[^>+~])',
  };

  const Patterns = {
    linguistic: new RegExp('^:(dir|lang)\\(([-\\w]{2,})\\)'),
    structural: new RegExp('^:(root|empty|first-child|last-child|only-child|first-of-type|last-of-type|only-of-type)'),
    treestruct: new RegExp('^:(nth(?:-last)?(?:-child|-of-type))\\((even|odd|([-+]?\\d*)(?:n[-+]?\\d*?)?)\\)'),
  };

  const configure = (options) => {
    if (typeof options !== 'object') return;
    Object.assign(Config, options);
  };

  const compileSelector = (expression) => {
    let source = '';
    if (Patterns.structural.test(expression)) {
      source += '/* Handle structural pseudo-classes */';
    } else if (Patterns.treestruct.test(expression)) {
      source += '/* Handle nth-based pseudo-classes */';
    } else if (Patterns.linguistic.test(expression)) {
      source += '/* Handle linguistic pseudo-classes */';
    } else {
      source += '/* Handle other selectors */';
    }
    return source;
  };

  const byId = (id, context = doc) => {
    return context.getElementById(id) ? [context.getElementById(id)] : [];
  };

  const byTag = (tag, context = doc) => {
    return slice.call(context.getElementsByTagName(tag));
  };

  const byClass = (cls, context = doc) => {
    return slice.call(context.getElementsByClassName(cls));
  };

  const match = (selectors, element) => {
    const source = compileSelector(selectors);
    return Function('e', source)(element);
  };

  const select = (selectors, context = doc) => {
    const source = compileSelector(selectors);
    const nodeList = slice.call(context.querySelectorAll(selectors));
    return nodeList.filter(new Function('e', `return ${source}`));
  };

  const first = (selectors, context = doc) => {
    return select(selectors, context)[0] || null;
  };

  const ancestor = (selectors, element) => {
    while (element && !match(selectors, element)) {
      element = element.parentElement;
    }
    return element;
  };

  const Dom = {
    CFG,
    byId,
    byTag,
    byClass,
    match,
    first,
    select,
    closest: ancestor,
    configure,
    Version: version,
  };

  return Dom;
});
