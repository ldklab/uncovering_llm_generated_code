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
  const version = 'nwsapi-2.2.13';
  const doc = global.document;
  const root = doc.documentElement;
  const slice = Array.prototype.slice;

  const REGEX = {
    HEX_NUMBERS: /^[0-9a-fA-F]/,
    ESC_OR_QUOTE: /^\\|["']/,
    REGEXP_CHAR: /(?!\\)[\\^$.,*+?()[\]{}|]/g,
    TRIM_SPACES: /^\s+|\s+$/g,
    SPLIT_GROUP: /(\([^)]*\)|\[[^[\]]*\]|\\.|[^,])+/g,
    COMMA_GROUP: /(\s*,\s*)(?![^[\]]*)(?![^()]*\))/g,
    FIX_ESCAPES: /\\([0-9a-fA-F]{1,6}\s?|.)|(["'])/g,
    COMBINE_WS: /[ \n\r\f]+(?![^\']*\'[^\']*$)(?![^\"]*\"[^\"]*$)/g,
    TAB_CHAR_WS: /(\s?\t+\s?)(?![^\']*\'[^\']*$)(?![^\"]*\"[^\"]*$)/g,
    PSEUDOS_WS: /\s+([-+])\s+(?![^[\]]*)/g
  };

  const GROUPS = {
    LINGUISTIC: '(dir|lang)(?:\(\s?([-\\w]{2,})\s?\))',
    LOGICAL_SEL: '(is|where|matches|not|has)(?:\(\s?(\[([^[\]]*)\]|[^\(){}[\]]*|.*)\s?\))',
    TREE_STRUCT: '(nth(?:-last)?(?:-child|-of-type))(?:\(\s?(even|odd|(?:[-+]?\\d*)(?:n\s?[-+]?\\d*)?)\s?\))',
    LOCATION_PC: '(any-link|link|visited|target)\\b',
    USER_ACTION: '(hover|active|focus-within|focus-visible|focus)\\b',
    STRUCTURAL: '(root|empty|(?:(?:first|last|only)(?:-child|-of-type)))\\b',
    INPUT_STATE: '(enabled|disabled|read-only|read-write|placeholder-shown|default)\\b',
    INPUT_VALUE: '(checked|indeterminate|required|optional|valid|invalid|in-range|out-of-range)\\b',
    PSEUDO_NOP: '(autofill|-webkit-autofill)\\b',
    PSEUDO_SNG: '(after|before|first-letter|first-line)\\b',
    PSEUDO_DBL: ':(?:after|before|first-letter|first-line|selection|placeholder|-webkit-[-a-zA-Z0-9]{2,})\\b'
  };

  const Patterns = {
    TREESTRUCT: new RegExp(`^:(?:${GROUPS.TREE_STRUCT})(.*)`, 'i'),
    STRUCTURAL: new RegExp(`^:(?:${GROUPS.STRUCTURAL})(.*)`, 'i'),
    LINGUISTIC: new RegExp(`^:(?:${GROUPS.LINGUISTIC})(.*)`, 'i'),
    USER_ACTION: new RegExp(`^:(?:${GROUPS.USER_ACTION})(.*)`, 'i'),
    INPUT_STATE: new RegExp(`^:(?:${GROUPS.INPUT_STATE})(.*)`, 'i'),
    INPUT_VALUE: new RegExp(`^:(?:${GROUPS.INPUT_VALUE})(.*)`, 'i'),
    LOCATION_PC: new RegExp(`^:(?:${GROUPS.LOCATION_PC})(.*)`, 'i'),
    LOGICAL_SEL: new RegExp(`^:(?:${GROUPS.LOGICAL_SEL})(.*)`, 'i'),
    PSEUDO_NOP: new RegExp(`^:(?:${GROUPS.PSEUDO_NOP})(.*)`, 'i'),
    PSEUDO_SNG: new RegExp(`^:(?:${GROUPS.PSEUDO_SNG})(.*)`, 'i'),
    PSEUDO_DBL: new RegExp(`^:(?:${GROUPS.PSEUDO_DBL})(.*)`, 'i'),
    CHILDREN: new RegExp(`^\\s?\\>\\s?(.*)`),
    ADJACENT: new RegExp(`^\\s?\\+\\s?(.*)`),
    RELATIVE: new RegExp(`^\\s?\\~\\s?(.*)`),
    ANCESTOR: new RegExp(`^\\s+(.*)`),
    UNIVERSAL: new RegExp('^(\\*)(.*)'),
    NAMESPACE: new RegExp('^(\\*|[-\\w]+)?\\|(.*)')
  };

  const RTL_PATTERN = /^(?:[\u0627-\u064a]|[\u0591-\u08ff]|[\ufb1d-\ufdfd]|[\ufe70-\ufefc])+$/;
  let hasDupes = false;

  function emit(message, proto) {
    if (CFG.VERBOSITY) {
      const err = proto ? new proto(message) : new global.DOMException(message, 'SyntaxError');
      throw err;
    }
    if (CFG.LOGERRORS && console && console.log) {
      console.log(message);
    }
  }

  function configure(option, clear) {
    if (typeof option === 'string') return !!CFG[option];
    if (typeof option !== 'object') return CFG;
    Object.keys(option).forEach(i => CFG[i] = !!option[i]);
    if (clear) {
      matchResolvers = {};
      selectResolvers = {};
    }
    setIdentifierSyntax();
    return true;
  }

  function install(all) {
    _closest = Element.prototype.closest;
    _matches = Element.prototype.matches;

    _querySelector = Element.prototype.querySelector;
    _querySelectorAll = Element.prototype.querySelectorAll;

    _querySelectorDoc = Document.prototype.querySelector;
    _querySelectorAllDoc = Document.prototype.querySelectorAll;

    function parseQSArgs() {
      const method = arguments[arguments.length - 1];
      return (
        arguments.length < 2 ?
          method.apply(this, []) :
          arguments.length < 3 ?
            method.apply(this, [arguments[0], this]) :
            method.apply(this, [
              arguments[0], this,
              typeof arguments[1] == 'function' ? arguments[1] : undefined
            ])
      );
    }

    Element.prototype.closest =
      HTMLElement.prototype.closest =
      function closest() {
        return parseQSArgs.apply(this, [].slice.call(arguments).concat(ancestor));
      };

    Element.prototype.matches =
      HTMLElement.prototype.matches =
      function matches() {
        return parseQSArgs.apply(this, [].slice.call(arguments).concat(match));
      };

    Element.prototype.querySelector =
      HTMLElement.prototype.querySelector =
      function querySelector() {
        return parseQSArgs.apply(this, [].slice.call(arguments).concat(first));
      };

    Element.prototype.querySelectorAll =
      HTMLElement.prototype.querySelectorAll =
      function querySelectorAll() {
        return parseQSArgs.apply(this, [].slice.call(arguments).concat(select));
      };

    Document.prototype.querySelector =
      DocumentFragment.prototype.querySelector =
      function querySelector() {
        return parseQSArgs.apply(this, [].slice.call(arguments).concat(first));
      };

    Document.prototype.querySelectorAll =
      DocumentFragment.prototype.querySelectorAll =
      function querySelectorAll() {
        return parseQSArgs.apply(this, [].slice.call(arguments).concat(select));
      };

    if (all) {
      document.addEventListener('load', function (e) {
        const iframe = e.target;
        if (/iframe/i.test(iframe.localName)) {
          const code = `(${Export})(this, ${Factory});`;
          const script = iframe.ownerDocument.createElement('script');
          script.textContent = `${code}NW.Dom.install(true)`;
          const docElement = iframe.ownerDocument.documentElement;
          docElement.removeChild(docElement.insertBefore(script, docElement.firstChild));
        }
      }, true);
    }
  }

  function uninstall() {
    if (_closest) {
      Element.prototype.closest = _closest;
      HTMLElement.prototype.closest = _closest;
    }
    if (_matches) {
      Element.prototype.matches = _matches;
      HTMLElement.prototype.matches = _matches;
    }
    if (_querySelector) {
      Element.prototype.querySelector =
      HTMLElement.prototype.querySelector = _querySelector;
      Element.prototype.querySelectorAll =
      HTMLElement.prototype.querySelector = _querySelectorAll;
    }
    if (_querySelectorAllDoc) {
      Document.prototype.querySelector =
      DocumentFragment.prototype.querySelector = _querySelectorDoc;
      Document.prototype.querySelectorAll =
      DocumentFragment.prototype.querySelectorAll = _querySelectorAllDoc;
    }
  }

  const none = [];
  
  // The rest of the library code goes here...
  
  return {
    version,
    configure,
    install,
    uninstall
  };
});
