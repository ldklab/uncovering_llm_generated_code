(function Export(global, factory) {
  'use strict';

  if (typeof module == 'object' && typeof exports == 'object') {
    module.exports = factory;
  } else if (typeof define == 'function' && define['amd']) {
    define(factory);
  } else {
    global.NW || (global.NW = {});
    global.NW.Dom = factory(global, Export);
  }

})(this, function Factory(global, Export) {

  'use strict';

  const version = 'nwsapi-2.2.13';
  const doc = global.document;
  const root = doc.documentElement;
  const slice = Array.prototype.slice;

  const HSP = '[\\x20\\t]';
  const VSP = '[\\r\\n\\f]';
  const WSP = '[\\x20\\t\\r\\n\\f]';

  const CFG = {
    operators: '[~*^$|]=|=',
    combinators: '[\\x20\\t>+~](?=[^>+~])'
  };

  const NOT = {
    double_enc: '(?=(?:[^"]*["][^"]*["])*[^"]*$)',
    single_enc: "(?=(?:[^']*['][^']*['])*[^']*$)",
    parens_enc: '(?![^\\x28]*\\x29)',
    square_enc: '(?![^\\x5b]*\\x5d)'
  };

  const REX = {
    HasEscapes: new RegExp('\\\\'),
    HexNumbers: new RegExp('^[0-9a-fA-F]'),
    EscOrQuote: new RegExp('^\\\\|[\\x22\\x27]'),
    RegExpChar: new RegExp('(?!\\\\)[\\\\^$.,*+?()[\\]{}|\\/]', 'g'),
    TrimSpaces: new RegExp('^' + WSP + '+|' + WSP + '+$|' + VSP, 'g'),
    SplitGroup: new RegExp('(\\([^)]*\\)|\\[[^[]*\\]|\\\\.|[^,])+', 'g'),
    CommaGroup: new RegExp('(\\s*,\\s*)' + NOT.square_enc + NOT.parens_enc, 'g'),
    FixEscapes: new RegExp('\\\\([0-9a-fA-F]{1,6}' + WSP + '?|.)|([\\x22\\x27])', 'g'),
    CombineWSP: new RegExp('[\\n\\r\\f\\x20]+' + NOT.single_enc + NOT.double_enc, 'g'),
    TabCharWSP: new RegExp('(\\x20?\\t+\\x20?)' + NOT.single_enc + NOT.double_enc, 'g'),
    PseudosWSP: new RegExp('\\s+([-+])\\s+' + NOT.square_enc, 'g')
  };

  const STD = {
    combinator: new RegExp('\\s?([>+~])\\s?', 'g'),
    apimethods: new RegExp('^(?:\\w+|\\*)\\|'),
    namespaces: new RegExp('(\\*|\\w+)\\|\\w+')
  };

  const GROUPS = {
    linguistic: '(dir|lang)(?:\\x28\\s?([-\\w]{2,})\\s?\\x29)',
    logicalsel: '(is|where|matches|not|has)(?:\\x28\\s?(\\[([^\\[\\]]*)\\]|[^()\\[\\]]*|.*)\\s?\\x29)',
    treestruct: '(nth(?:-last)?(?:-child|-of\\-type))(?:\\x28\\s?(even|odd|(?:[-+]?\\d*)(?:n\\s?[-+]?\\s?\\d*)?)\\s?\\x29)',
    locationpc: '(any\\-link|link|visited|target)\\b',
    useraction: '(hover|active|focus\\-within|focus\\-visible|focus)\\b',
    structural: '(root|empty|(?:(?:first|last|only)(?:-child|\\-of\\-type)))\\b',
    inputstate: '(enabled|disabled|read\\-only|read\\-write|placeholder\\-shown|default)\\b',
    inputvalue: '(checked|indeterminate|required|optional|valid|invalid|in\\-range|out\\-of\\-range)\\b',
    pseudo_nop: '(autofill|-webkit\\-autofill)\\b',
    pseudo_sng: '(after|before|first\\-letter|first\\-line)\\b',
    pseudo_dbl: ':(after|before|first\\-letter|first\\-line|selection|placeholder|-webkit-[-a-zA-Z0-9]{2,})\\b'
  };

  const Patterns = {
    treestruct: new RegExp('^:(?:' + GROUPS.treestruct + ')(.*)', 'i'),
    structural: new RegExp('^:(?:' + GROUPS.structural + ')(.*)', 'i'),
    linguistic: new RegExp('^:(?:' + GROUPS.linguistic + ')(.*)', 'i'),
    useraction: new RegExp('^:(?:' + GROUPS.useraction + ')(.*)', 'i'),
    inputstate: new RegExp('^:(?:' + GROUPS.inputstate + ')(.*)', 'i'),
    inputvalue: new RegExp('^:(?:' + GROUPS.inputvalue + ')(.*)', 'i'),
    locationpc: new RegExp('^:(?:' + GROUPS.locationpc + ')(.*)', 'i'),
    logicalsel: new RegExp('^:(?:' + GROUPS.logicalsel + ')(.*)', 'i'),
    pseudo_nop: new RegExp('^:(?:' + GROUPS.pseudo_nop + ')(.*)', 'i'),
    pseudo_sng: new RegExp('^:(?:' + GROUPS.pseudo_sng + ')(.*)', 'i'),
    pseudo_dbl: new RegExp('^:(?:' + GROUPS.pseudo_dbl + ')(.*)', 'i'),
    children: new RegExp('^' + WSP + '?\\>' + WSP + '?(.*)'),
    adjacent: new RegExp('^' + WSP + '?\\+' + WSP + '?(.*)'),
    relative: new RegExp('^' + WSP + '?\\~' + WSP + '?(.*)'),
    ancestor: new RegExp('^' + WSP + '+(.*)'),
    universal: new RegExp('^(\\*)(.*)'),
    namespace: new RegExp('^(\\*|[-\\w]+)?\\|(.*)')
  };

  const RTL = new RegExp('^(?:[\\u0627-\\u064a]|[\\u0591-\\u08ff]|[\\ufb1d-\\ufdfd]|[\\ufe70-\\ufefc])+$');
  const qsNotArgs = 'Not enough arguments';
  const qsInvalid = ' is not a valid selector';

  const reNthElem = new RegExp('(:nth(?:-last)?-child)', 'i');
  const reNthType = new RegExp('(:nth(?:-last)?-of-type)', 'i');
  
  let reOptimizer, reValidator;

  const Config = {
    IDS_DUPES: true,
    LOGERRORS: true,
    VERBOSITY: true
  };

  let NAMESPACE, QUIRKS_MODE, HTML_DOCUMENT;

  const ATTR_STD_OPS = {
    '=': 1, '^=': 1, '$=': 1, '|=': 1, '*=': 1, '~=': 1
  };

  const HTML_TABLE = {
    'accept': 1, 'accept-charset': 1, 'align': 1, 'alink': 1, 'axis': 1,
    'bgcolor': 1, 'charset': 1, 'checked': 1, 'clear': 1, 'codetype': 1, 'color': 1,
    'compact': 1, 'declare': 1, 'defer': 1, 'dir': 1, 'direction': 1, 'disabled': 1,
    'enctype': 1, 'face': 1, 'frame': 1, 'hreflang': 1, 'http-equiv': 1, 'lang': 1,
    'language': 1, 'link': 1, 'media': 1, 'method': 1, 'multiple': 1, 'nohref': 1,
    'noresize': 1, 'noshade': 1, 'nowrap': 1, 'readonly': 1, 'rel': 1, 'rev': 1,
    'rules': 1, 'scope': 1, 'scrolling': 1, 'selected': 1, 'shape': 1, 'target': 1,
    'text': 1, 'type': 1, 'valign': 1, 'valuetype': 1, 'vlink': 1
  };

  const Combinators = {};

  const Selectors = {};

  const Operators = {
    '=': { p1: '^', p2: '$', p3: 'true' },
    '^=': { p1: '^', p2: '', p3: 'true' },
    '$=': { p1: '', p2: '$', p3: 'true' },
    '*=': { p1: '', p2: '', p3: 'true' },
    '|=': { p1: '^', p2: '(-|$)', p3: 'true' },
    '~=': { p1: '(^|\\s)', p2: '(\\s|$)', p3: 'true' }
  };

  const concatCall = function(nodes, callback) {
    let i = 0, l = nodes.length, list = Array(l);
    while (l > i) {
      if (false === callback(list[i] = nodes[i])) break;
      ++i;
    }
    return list;
  };

  const concatList = function(list, nodes) {
    let i = -1, l = nodes.length;
    while (l--) { list[list.length] = nodes[++i]; }
    return list;
  };

  const documentOrder = function(a, b) {
    if (!hasDupes && a === b) {
      hasDupes = true;
      return 0;
    }
    return a.compareDocumentPosition(b) & 4 ? -1 : 1;
  };

  let hasDupes = false;

  const unique = function(nodes) {
    let i = 0, j = -1, l = nodes.length + 1, list = [];
    while (--l) {
      if (nodes[i++] === nodes[i]) continue;
      list[++j] = nodes[i - 1];
    }
    hasDupes = false;
    return list;
  };

  const switchContext = function(context, force) {
    const oldDoc = doc;
    doc = context.ownerDocument || context;
    if (force || oldDoc !== doc) {
      root = doc.documentElement;
      HTML_DOCUMENT = isHTML(doc);
      QUIRKS_MODE = HTML_DOCUMENT && doc.compatMode.indexOf('CSS') < 0;
      NAMESPACE = root && root.namespaceURI;
      Snapshot.doc = doc;
      Snapshot.root = root;
    }
    return (Snapshot.from = context);
  };

  const codePointToUTF16 = function(codePoint) {
    if (codePoint < 1 || codePoint > 0x10ffff || (codePoint > 0xd7ff && codePoint < 0xe000)) {
      return '\\ufffd';
    }
    if (codePoint < 0x10000) {
      const lowHex = '000' + codePoint.toString(16);
      return '\\u' + lowHex.substr(lowHex.length - 4);
    }
    return '\\u' + (((codePoint - 0x10000) >> 0x0a) + 0xd800).toString(16) +
           '\\u' + (((codePoint - 0x10000) % 0x400) + 0xdc00).toString(16);
  };

  const stringFromCodePoint = function(codePoint) {
    if (codePoint < 1 || codePoint > 0x10ffff || (codePoint > 0xd7ff && codePoint < 0xe000)) {
      return '\ufffd';
    }
    if (codePoint < 0x10000) {
      return String.fromCharCode(codePoint);
    }
    return String.fromCodePoint ?
      String.fromCodePoint(codePoint) :
      String.fromCharCode(
        ((codePoint - 0x10000) >> 0x0a) + 0xd800,
        ((codePoint - 0x10000) % 0x400) + 0xdc00);
  };

  const convertEscapes = function(str) {
    return REX.HasEscapes.test(str) ?
      str.replace(REX.FixEscapes,
        function(substring, p1, p2) {
          return p2 ? '\\' + p2 :
            REX.HexNumbers.test(p1) ? codePointToUTF16(parseInt(p1, 16)) :
            REX.EscOrQuote.test(p1) ? substring :
            p1;
        }
      ) : str;
  };

  const unescapeIdentifier = function(str) {
    return REX.HasEscapes.test(str) ?
      str.replace(REX.FixEscapes,
        function(substring, p1, p2) {
          return p2 ? p2 :
            REX.HexNumbers.test(p1) ? stringFromCodePoint(parseInt(p1, 16)) :
            REX.EscOrQuote.test(p1) ? substring :
            p1;
        }
      ) : str;
  };

  const method = {
    '#': 'getElementById',
    '*': 'getElementsByTagNameNS',
    '|': 'getElementsByTagNameNS',
    '.': 'getElementsByClassName'
  };

  const compat = {
    '#': function(c, n) { REX.HasEscapes.test(n) && (n = unescapeIdentifier(n)); return function(e, f) { return byId(n, c); }; },
    '*': function(c, n) { REX.HasEscapes.test(n) && (n = unescapeIdentifier(n)); return function(e, f) { return byTag(n, c); }; },
    '|': function(c, n) { REX.HasEscapes.test(n) && (n = unescapeIdentifier(n)); return function(e, f) { return byTagNS(n, c); }; },
    '.': function(c, n) { REX.HasEscapes.test(n) && (n = unescapeIdentifier(n)); return function(e, f) { return byClass(n, c); }; }
  };

  const byIdRaw = function(id, context) {
    let node = context, nodes = [], next = node.firstElementChild;
    while ((node = next)) {
      node.id == id && (nodes[nodes.length] = node);
      if ((next = node.firstElementChild || node.nextElementSibling)) continue;
      while (!next && (node = node.parentElement) && node !== context) {
        next = node.nextElementSibling;
      }
    }
    return nodes;
  };

  const byId = function(id, context) {
    let e, i, l, nodes, api = method['#'];

    if (Config.IDS_DUPES === false) {
      if (api in context) {
        return (e = context[api](id)) ? [e] : none;
      }
    } else {
      if ('all' in context) {
        if ((e = context.all[id])) {
          if (e.nodeType == 1) return e.getAttribute('id') != id ? [] : [e];
          else if (id == 'length') return (e = context[api](id)) ? [e] : none;
          for (i = 0, l = e.length, nodes = []; l > i; ++i) {
            if (e[i].id == id) nodes[nodes.length] = e[i];
          }
          return nodes && nodes.length ? nodes : [nodes];
        } else return none;
      }
    }

    return byIdRaw(id, context);
  };

  const byTagNS = function(context, tag) {
    return byTag(tag, context);
  };

  const byTag = function(tag, context) {
    let e, nodes, api = method['*'];
    if (api in context) {
      return slice.call(context[api]('*', tag));
    } else {
      if ((e = context.firstElementChild)) {
        tag = tag.toLowerCase();
        if (!(e.nextElementSibling || tag == '*' || e.localName == tag)) {
          return slice.call(e[api]('*', tag));
        } else {
          nodes = [];
          do {
            if (tag == '*' || e.localName == tag) nodes[nodes.length] = e;
            concatList(nodes, e[api]('*', tag));
          } while ((e = e.nextElementSibling));
        }
      } else nodes = none;
    }
    return nodes;
  };

  const byClass = function(cls, context) {
    let e, nodes, api = method['.'], reCls;
    if (api in context) {
      return slice.call(context[api](cls));
    } else {
      if ((e = context.firstElementChild)) {
        reCls = new RegExp('(^|\\s)' + cls + '(\\s|$)', QUIRKS_MODE ? 'i' : '');
        if (!(e.nextElementSibling || reCls.test(e.className))) {
          return slice.call(e[api](cls));
        } else {
          nodes = [];
          do {
            if (reCls.test(e.className)) nodes[nodes.length] = e;
            concatList(nodes, e[api](cls));
          } while ((e = e.nextElementSibling));
        }
      } else nodes = none;
    }
    return nodes;
  };

  const hasAttributeNS = function(e, name) {
    let i, l, attr = e.getAttributeNames();
    name = new RegExp(':?' + name + '$', HTML_DOCUMENT ? 'i' : '');
    for (i = 0, l = attr.length; l > i; ++i) {
      if (name.test(attr[i])) return true;
    }
    return false;
  };

  const nthElement = (function() {
    let idx = 0, len = 0, set = 0, parent = undefined, parents = [], nodes = [];
    return function(element, dir) {
      if (dir == 2) {
        idx = 0; len = 0; set = 0; nodes.length = 0;
        parents.length = 0; parent = undefined;
        return -1;
      }
      let e, i, j, k, l;
      if (parent === element.parentElement) {
        i = set; j = idx; l = len;
      } else {
        l = parents.length;
        parent = element.parentElement;
        for (i = -1, j = 0, k = l - 1; l > j; ++j, --k) {
          if (parents[j] === parent) { i = j; break; }
          if (parents[k] === parent) { i = k; break; }
        }
        if (i < 0) {
          parents[i = l] = parent;
          l = 0; nodes[i] = [];
          e = parent && parent.firstElementChild || element;
          while (e) { nodes[i][l] = e; if (e === element) j = l; e = e.nextElementSibling; ++l; }
          set = i; idx = 0; len = l;
          if (l < 2) return l;
        } else {
          l = nodes[i].length;
          set = i;
        }
      }
      if (element !== nodes[i][j] && element !== nodes[i][j = 0]) {
        for (j = 0, e = nodes[i], k = l - 1; l > j; ++j, --k) {
          if (e[j] === element) { break; }
          if (e[k] === element) { j = k; break; }
        }
      }
      idx = j + 1; len = l;
      return dir ? l - j : idx;
    };
  })();

  const nthOfType = (function() {
    let idx = 0, len = 0, set = 0, parent = undefined, parents = [], nodes = [];
    return function(element, dir) {
      if (dir == 2) {
        idx = 0; len = 0; set = 0; nodes.length = 0;
        parents.length = 0; parent = undefined;
        return -1;
      }
      let e, i, j, k, l, name = element.localName;
      if (nodes[set] && nodes[set][name] && parent === element.parentElement) {
        i = set; j = idx; l = len;
      } else {
        l = parents.length;
        parent = element.parentElement;
        for (i = -1, j = 0, k = l - 1; l > j; ++j, --k) {
          if (parents[j] === parent) { i = j; break; }
          if (parents[k] === parent) { i = k; break; }
        }
        if (i < 0 || !nodes[i][name]) {
          parents[i = l] = parent;
          nodes[i] || (nodes[i] = {});
          l = 0; nodes[i][name] = [];
          e = parent && parent.firstElementChild || element;
          while (e) { if (e === element) j = l; if (e.localName == name) { nodes[i][name][l] = e; ++l; } e = e.nextElementSibling; }
          set = i; idx = j; len = l;
          if (l < 2) return l;
        } else {
          l = nodes[i][name].length;
          set = i;
        }
      }
      if (element !== nodes[i][name][j] && element !== nodes[i][name][j = 0]) {
        for (j = 0, e = nodes[i][name], k = l - 1; l > j; ++j, --k) {
          if (e[j] === element) { break; }
          if (e[k] === element) { j = k; break; }
        }
      }
      idx = j + 1; len = l;
      return dir ? l - j : idx;
    };
  })();

  const isHTML = function(node) {
    const doc = node.ownerDocument || node;
    return doc.nodeType == 9 &&
      'contentType' in doc ?
        doc.contentType.indexOf('/html') > 0 :
        doc.createElement('DiV').localName == 'div';
  };

  const isFocusable = function(node) {
    const doc = node.ownerDocument;
    if (node.contentDocument && node.localName == 'iframe') { return false; }
    if (doc.hasFocus() && node == doc.activeElement) {
      if (node.type || node.href || typeof node.tabIndex == 'number') {
        return true;
      }
    }
    return false;
  };

  const configure = function(option, clear) {
    if (typeof option == 'string') { return !!Config[option]; }
    if (typeof option != 'object') { return Config; }
    for (const i in option) {
      Config[i] = !!option[i];
    }
    if (clear) {
      matchResolvers = { };
      selectResolvers = { };
    }
    setIdentifierSyntax();
    return true;
  };

  const emit = function(message, proto) {
    let err;
    if (Config.VERBOSITY) {
      err = proto ? new proto(message) : new global.DOMException(message, 'SyntaxError');
      throw err;
    }
    if (Config.LOGERRORS && console && console.log) {
      console.log(message);
    }
  };

  const initialize = function(doc) {
    setIdentifierSyntax();
    lastContext = switchContext(doc, true);
  };

  const setIdentifierSyntax = function() {
    const noascii = '[^\\x00-\\x9f]';
    const escaped = '\\\\[^\\r\\n\\f0-9a-fA-F]';
    const unicode = '\\\\[0-9a-fA-F]{1,6}(?:\\r\\n|\\s)?';

    const identifier = '-?(?:[a-zA-Z_-]|' + noascii + '|' + escaped + '|' + unicode + ')' +
        '(?:-{2}|[0-9]|[a-zA-Z_-]|' + noascii + '|' + escaped + '|' + unicode + ')*';

    const pseudonames = '[-\\w]+';
    const pseudoparms = '(?:[-+]?\\d*)(?:n\\s?[-+]?\\s?\\d*)';
    const doublequote = '"[^"\\\\]*(?:\\\\.[^"\\\\]*)*(?:"|$)';
    const singlequote = "'[^'\\\\]*(?:\\\\.[^'\\\\]*)*(?:'|$)";

    const attrparser = identifier + '|' + doublequote + '|' + singlequote;

    const attrvalues = '([\\x22\\x27]?)((?!\\3)*|(?:\\\\?.)*?)(?:\\3|$)';

    const attributes =
      '\\[' +
        '(?:\\*\\|)?' +
        WSP + '?' +
        '(' + identifier + '(?::' + identifier + ')?)' +
        WSP + '?' +
        '(?:' +
          '(' + CFG.operators + ')' + WSP + '?' +
          '(?:' + attrparser + ')' +
        ')?' +
        '(?:' + WSP + '?\\b(i))?' + WSP + '?' +
      '(?:\\]|$)';

    const attrmatcher = attributes.replace(attrparser, attrvalues);

    const pseudoclass =
      '(?:\\x28' + WSP + '*' +
        '(?:' + pseudoparms + '?)?|' +
        '(?:\\*|\\|)|' +
        '(?:' +
          '(?::' + pseudonames +
            '(?:\\x28' + pseudoparms + '?(?:\\x29|$))?|' +
          ')|' +
          '(?:[.#]?' + identifier + ')|' +
          '(?:' + attributes + ')' +
        ')+|' +
        '(?:' + WSP + '?[>+~][^>+~]' + WSP + '?)|' +
        '(?:' + WSP + '?,' + WSP + '?)|' +
        '(?:' + WSP + '?)|' +
        '(?:\\x29|$)' +
      ')*';

    const standardValidator =
      '(?=' + WSP + '?[^>+~(){}<>])' +
      '(?:' +
        '(?:\\*|\\|)|' +
        '(?:[.#]?' + identifier + ')+|' +
        '(?:' + attributes + ')+|' +
        '(?:::?' + pseudonames + pseudoclass + ')|' +
        '(?:' + WSP + '?' + CFG.combinators + WSP + '?)|' +
        '(?:' + WSP + '?,' + WSP + '?)|' +
        '(?:' + WSP + '?)' +
      ')+';

    reOptimizer = new RegExp(
      '(?:([.:#*]?)' +
      '(' + identifier + ')' +
      '(?:' +
        ':[-\\w]+|' +
        '\\[[^\\]]+(?:\\]|$)|' +
        '\\x28[^\\x29]+(?:\\x29|$)' +
      ')*)$');

    reValidator = new RegExp(standardValidator, 'g');

    Patterns.id = new RegExp('^#(' + identifier + ')(.*)');
    Patterns.tagName = new RegExp('^(' + identifier + ')(.*)');
    Patterns.className = new RegExp('^\\.(' + identifier + ')(.*)');
    Patterns.attribute = new RegExp('^(?:' + attrmatcher + ')(.*)');
  };

  const F_INIT = '"use strict";return function Resolver(c,f,x,r)';

  const S_HEAD = 'var e,n,o,j=r.length-1,k=-1';
  const M_HEAD = 'var e,n,o';

  const S_LOOP = 'main:while((e=c[++k]))';
  const N_LOOP = 'main:while((e=c.item(++k)))';
  const M_LOOP = 'e=c;';

  const S_BODY = 'r[++j]=c[k];';
  const N_BODY = 'r[++j]=c.item(k);';
  const M_BODY = '';

  const S_TAIL = 'continue main;';
  const M_TAIL = 'r=true;';

  const S_TEST = 'if(f(c[k])){break main;}';
  const N_TEST = 'if(f(c.item(k))){break main;}';
  const M_TEST = 'f(c);';

  const S_VARS = [];
  const M_VARS = [];

  const compile = function(selector, mode, callback) {
    let factory, token, head = '', loop = '', macro = '', source = '', vars = '';

    switch (mode) {
      case true:
        if (selectLambdas[selector]) { return selectLambdas[selector]; }
        macro = S_BODY + (callback ? S_TEST : '') + S_TAIL;
        head = S_HEAD;
        loop = S_LOOP;
        break;
      case false:
        if (matchLambdas[selector]) { return matchLambdas[selector]; }
        macro = M_BODY + (callback ? M_TEST : '') + M_TAIL;
        head = M_HEAD;
        loop = M_LOOP;
        break;
      case null:
        if (selectLambdas[selector]) { return selectLambdas[selector]; }
        macro = N_BODY + (callback ? N_TEST : '') + S_TAIL;
        head = S_HEAD;
        loop = N_LOOP;
        break;
      default:
        break;
    }

    source = compileSelector(selector, macro, mode, callback);

    loop += mode || mode === null ? '{' + source + '}' : source;

    if (mode || mode === null && selector.includes(':nth')) {
      loop += reNthElem.test(selector) ? 's.nthElement(null, 2);' : '';
      loop += reNthType.test(selector) ? 's.nthOfType(null, 2);' : '';
    }

    if (S_VARS[0] || M_VARS[0]) {
      vars = ',' + (S_VARS.join(',') || M_VARS.join(','));
      S_VARS.length = 0;
      M_VARS.length = 0;
    }

    factory = Function('s', F_INIT + '{' + head + vars + ';' + loop + 'return r;}')(Snapshot);

    return mode || mode === null ? (selectLambdas[selector] = factory) : (matchLambdas[selector] = factory);
  };

  const compileSelector = function(expression, source, mode, callback) {
    let a, b, n, f, k = 0, name, NS, referenceElement,
    compat, expr, match, result, status, symbol, test,
    type, selector = expression, selector_string, vars;

    selector_string = mode ? lastSelected : lastMatched;

    selector = selector.replace(STD.combinator, '$1');

    selector_recursion_label:

    while (selector) {

      ++k;

      symbol = STD.apimethods.test(selector) ? '|' : selector[0];

      switch (symbol) {

        case '*':
          match = selector.match(Patterns.universal);
          break;

        case '#':
          match = selector.match(Patterns.id);
          source = 'if((/^' + match[1] + '$/.test(e.getAttribute("id")))){' + source + '}';
          break;

        case '.':
          match = selector.match(Patterns.className);
          compat = (QUIRKS_MODE ? 'i' : '') + '.test(e.getAttribute("class"))';
          source = 'if((/(^|\\s)' + match[1] + '(\\s|$)/' + compat + ')){' + source + '}';
          break;

        case (/[_a-z]/i.test(symbol) ? symbol : undefined):
          match = selector.match(Patterns.tagName);
          source = 'if((e.localName=="' + match[1] + '")){' + source + '}';
          break;

        case '|':
          match = selector.match(Patterns.namespace);
          if (match[1] == '*') {
            source = 'if(true){' + source + '}';
          } else if (!match[1]) {
            source = 'if((!e.namespaceURI)){' + source + '}';
          } else if (typeof match[1] == 'string' && root.prefix == match[1]) {
            source = 'if((e.namespaceURI=="' + NAMESPACE + '")){' + source + '}';
          } else {
            emit('\'' + selector_string + '\'' + qsInvalid);
          }
          break;

        case '[':
          match = selector.match(Patterns.attribute);
          NS = match[0].match(STD.namespaces);
          name = match[1];
          expr = name.split(':');
          expr = expr.length == 2 ? expr[1] : expr[0];
          if (match[2] && !(test = Operators[match[2]])) {
            emit('\'' + selector_string + '\'' + qsInvalid);
            return '';
          }
          if (match[4] === '') {
            test = match[2] == '~=' ?
              { p1: '^\\s', p2: '+$', p3: 'true' } :
                match[2] in ATTR_STD_OPS && match[2] != '~=' ?
              { p1: '^',    p2: '$',  p3: 'true' } : test;
          } else if (match[2] == '~=' && match[4].includes(' ')) {
            break;
          } else if (match[4]) {
            match[4] = convertEscapes(match[4]).replace(REX.RegExpChar, '\\$&');
          }
          type = match[5] == 'i' || (HTML_DOCUMENT && HTML_TABLE[expr.toLowerCase()]) ? 'i' : '';
          source = 'if((' +
            (!match[2] ? (NS ? 's.hasAttributeNS(e,"' + name + '")' : 'e.hasAttribute&&e.hasAttribute("' + name + '")') :
            !match[4] && ATTR_STD_OPS[match[2]] && match[2] != '~=' ? 'e.getAttribute&&e.getAttribute("' + name + '")==""' :
            '(/' + test.p1 + match[4] + test.p2 + '/' + type + ').test(e.getAttribute&&e.getAttribute("' + name + '"))==' + test.p3) +
            ')){' + source + '}';
          break;

        case '~':
          match = selector.match(Patterns.relative);
          source = 'var N' + k + '=e;while(e&&(e=e.previousElementSibling)){' + source + '}e=N' + k + ';';
          break;
        case '+':
          match = selector.match(Patterns.adjacent);
          source = 'var N' + k + '=e;if(e&&(e=e.previousElementSibling)){' + source + '}e=N' + k + ';';
          break;
        case '\x09':
        case '\x20':
          match = selector.match(Patterns.ancestor);
          source = 'var N' + k + '=e;while(e&&(e=e.parentElement)){' + source + '}e=N' + k + ';';
          break;
        case '>':
          match = selector.match(Patterns.children);
          source = 'var N' + k + '=e;if(e&&(e=e.parentElement)){' + source + '}e=N' + k + ';';
          break;

        case (symbol in Combinators ? symbol : undefined):
          match[match.length - 1] = '*';
          source = Combinators[symbol](match) + source;
          break;

        case ':':
          if ((match = selector.match(Patterns.structural))) {
            match[1] = match[1].toLowerCase();
            switch (match[1]) {
              case 'root':
                source = 'if((e===s.root)){' + source + (mode ? 'break main;' : '') + '}';
                break;
              case 'empty':
                source = 'n=e.firstChild;while(n&&!(/1|3/).test(n.nodeType)){n=n.nextSibling}if(!n){' + source + '}';
                break;

              case 'only-child':
                source = 'if((!e.nextElementSibling&&!e.previousElementSibling)){' + source + '}';
                break;
              case 'last-child':
                source = 'if((!e.nextElementSibling)){' + source + '}';
                break;
              case 'first-child':
                source = 'if((!e.previousElementSibling)){' + source + '}';
                break;

              case 'only-of-type':
                source = 'o=e.localName;' +
                  'n=e;while((n=n.nextElementSibling)&&n.localName!=o);if(!n){' +
                  'n=e;while((n=n.previousElementSibling)&&n.localName!=o);}if(!n){' + source + '}';
                break;
              case 'last-of-type':
                source = 'n=e;o=e.localName;while((n=n.nextElementSibling)&&n.localName!=o);if(!n){' + source + '}';
                break;
              case 'first-of-type':
                source = 'n=e;o=e.localName;while((n=n.previousElementSibling)&&n.localName!=o);if(!n){' + source + '}';
                break;
              default:
                emit('\'' + selector_string + '\'' + qsInvalid);
                break;
            }
          }

          else if ((match = selector.match(Patterns.treestruct))) {
            match[1] = match[1].toLowerCase();
            switch (match[1]) {
              case 'nth-child':
              case 'nth-of-type':
              case 'nth-last-child':
              case 'nth-last-of-type':
                expr = /-of-type/i.test(match[1]);
                if (match[1] && match[2]) {
                  type = /last/i.test(match[1]);
                  if (match[2] == 'n') {
                    source = 'if(true){' + source + '}';
                    break;
                  } else if (match[2] == '1') {
                    test = type ? 'next' : 'previous';
                    source = expr ? 'n=e;o=e.localName;' +
                      'while((n=n.' + test + 'ElementSibling)&&n.localName!=o);if(!n){' + source + '}' :
                      'if(!e.' + test + 'ElementSibling){' + source + '}';
                    break;
                  } else if (match[2] == 'even' || match[2] == '2n0' || match[2] == '2n+0' || match[2] == '2n') {
                    test = 'n%2==0';
                  } else if (match[2] == 'odd'  || match[2] == '2n1' || match[2] == '2n+1') {
                    test = 'n%2==1';
                  } else {
                    f = /n/i.test(match[2]);
                    n = match[2].split('n');
                    a = parseInt(n[0], 10) || 0;
                    b = parseInt(n[1], 10) || 0;
                    if (n[0] == '-') { a = -1; }
                    if (n[0] == '+') { a = +1; }
                    test = (b ? '(n' + (b > 0 ? '-' : '+') + Math.abs(b) + ')' : 'n') + '%' + a + '==0' ;
                    test =
                      a >= +1 ? (f ? 'n>' + (b - 1) + (Math.abs(a) != 1 ? '&&' + test : '') : 'n==' + a) :
                      a <= -1 ? (f ? 'n<' + (b + 1) + (Math.abs(a) != 1 ? '&&' + test : '') : 'n==' + a) :
                      a === 0 ? (n[0] ? 'n==' + b : 'n>' + (b - 1)) : 'false';
                  }
                  expr = expr ? 'OfType' : 'Element';
                  type = type ? 'true' : 'false';
                  source = 'n=s.nth' + expr + '(e,' + type + ');if((' + test + ')){' + source + '}';
                } else {
                  emit('\'' + selector_string + '\'' + qsInvalid);
                }
                break;
              default:
                emit('\'' + selector_string + '\'' + qsInvalid);
                break;
            }
          }

          else if ((match = selector.match(Patterns.logicalsel))) {
            match[1] = match[1].toLowerCase();
            switch (match[1]) {
              case 'is':
              case 'where':
              case 'matches':
                expr = match[2].replace(REX.CommaGroup, ',').replace(REX.TrimSpaces, '');
                source = 'if(s.match("' + expr.replace(/\x22/g, '\\"') + '",e)){' + source + '}';
                break;
              case 'not':
                expr = match[2].replace(REX.CommaGroup, ',').replace(REX.TrimSpaces, '');
                source = 'if(!s.match("' + expr.replace(/\x22/g, '\\"') + '",e)){' + source + '}';
                break;
              case 'has':
                referenceElement = selector_string.split(':')[0];
                expr = match[2].replace(REX.CommaGroup, ',').replace(REX.TrimSpaces, '');
                source = 'if(s.match("' + referenceElement.replace(/\x22/g, '\\"') + '",e) && e.querySelector("'+ expr.replace(/\x22/g, '\\"') +'")){' + source + '}';
                break;
              default:
                emit('\'' + selector_string + '\'' + qsInvalid);
                break;
            }
          }

          else if ((match = selector.match(Patterns.linguistic))) {
            match[1] = match[1].toLowerCase();
            switch (match[1]) {
              case 'dir':
                source = 'var p;if((' +
                  '(/' + match[2] + '/i.test(e.dir))||(p=s.ancestor("[dir]", e))&&' +
                  '(/' + match[2] + '/i.test(p.dir))||(e.dir==""||e.dir=="auto")&&' +
                  '(' + (match[2] == 'ltr' ? '!':'')+ RTL +'.test(e.textContent)))' +
                  '){' + source + '};';
                break;
              case 'lang':
                expr = '(?:^|-)' + match[2] + '(?:-|$)';
                source = 'var p;if((' +
                  '(e.isConnected&&(e.lang==""&&(p=s.ancestor("[lang]",e)))&&' +
                  '(p.lang=="' + match[2] + '")||/'+ expr +'/i.test(e.lang)))' +
                  '){' + source + '};';
                break;
              default:
                emit('\'' + selector_string + '\'' + qsInvalid);
                break;
            }
          }

          else if ((match = selector.match(Patterns.locationpc))) {
            match[1] = match[1].toLowerCase();
            switch (match[1]) {
              case 'any-link':
                source = 'if((/^a|area$/i.test(e.localName)&&e.hasAttribute("href")||e.visited)){' + source + '}';
                break;
              case 'link':
                source = 'if((/^a|area$/i.test(e.localName)&&e.hasAttribute("href"))){' + source + '}';
                break;
              case 'visited':
                source = 'if((/^a|area$/i.test(e.localName)&&e.hasAttribute("href")&&e.visited)){' + source + '}';
                break;
              case 'target':
                source = 'if(((s.doc.compareDocumentPosition(e)&16)&&s.doc.location.hash&&e.id==s.doc.location.hash.slice(1))){' + source + '}';
                break;
              default:
                emit('\'' + selector_string + '\'' + qsInvalid);
                break;
            }
          }

          else if ((match = selector.match(Patterns.useraction))) {
            match[1] = match[1].toLowerCase();
            switch (match[1]) {
              case 'hover':
                source = 'hasFocus' in doc && doc.hasFocus() ?
                  'if((e===s.doc.hoverElement)){' + source + '}' : source;
                break;
              case 'active':
                source = 'hasFocus' in doc && doc.hasFocus() ?
                  'if((e===s.doc.activeElement)){' + source + '}' : source;
                break;
              case 'focus':
                source = 'hasFocus'in doc ?
                  'if(s.isFocusable(e)&&e===s.doc.activeElement){' + source + '}' : source;
                break;
              case 'focus-visible':
                source = 'hasFocus' in doc ?
                  'if(s.isFocusable(e)){' +
                  'n=s.doc.activeElement;if(e!==n){while(e){e=e.parentElement;if(e===n)break;}}}' +
                  'if((e===n&&e.autofocus)){' + source + '}' : source;
                break;
              case 'focus-within':
                source = 'hasFocus' in doc ?
                  'if(s.isFocusable(e)){' +
                  'n=s.doc.activeElement;if(n!==e){while(n){n=n.parentElement;if(n===e)break;}}}' +
                  'if((n===e&&n.autofocus)){' + source + '}' : source;
                break;
              default:
                emit('\'' + selector_string + '\'' + qsInvalid);
                break;
            }
          }

          else if ((match = selector.match(Patterns.inputstate))) {
            match[1] = match[1].toLowerCase();
            switch (match[1]) {
              case 'enabled':
                source = 'if((("form" in e||/^optgroup$/i.test(e.localName))&&"disabled" in e &&e.disabled===false' +
                  ')){' + source + '}';
                break;
              case 'disabled':
                source = 'if((("form" in e||/^optgroup$/i.test(e.localName))&&"disabled" in e)){' +
                  'var x=0,N=[],F=false,L=false;' +
                  'if(!(/^(optgroup|option)$/i.test(e.localName))){' +
                    'n=e.parentElement;' +
                    'while(n){' +
                      'if(n.localName=="fieldset"){' +
                        'N[x++]=n;' +
                        'if(n.disabled===true){' +
                          'F=true;' +
                          'break;' +
                        '}' +
                      '}' +
                      'n=n.parentElement;' +
                    '}' +
                    'for(var x=0;x<N.length;x++){' +
                      'if((n=s.first("legend",N[x]))&&n.contains(e)){' +
                        'L=true;' +
                        'break;' +
                      '}' +
                    '}' +
                  '}' +
                  'if(e.disabled===true||(F&&!L)){' + source + '}}';
                break;
              case 'read-only':
                source =
                  'if((' +
                    '(/^textarea$/i.test(e.localName)&&(e.readOnly||e.disabled))||' +
                    '("|date|datetime-local|email|month|number|password|search|tel|text|time|url|week|".includes("|"+e.type+"|")&&e.readOnly)' +
                  ')){' + source + '}';
                break;
              case 'read-write':
                source =
                  'if((' +
                    '((/^textarea$/i.test(e.localName)&&!e.readOnly&&!e.disabled)||' +
                    '("|date|datetime-local|email|month|number|password|search|tel|text|time|url|week|".includes("|"+e.type+"|")&&!e.readOnly&&!e.disabled))||' +
                    '(e.hasAttribute("contenteditable")||(s.doc.designMode=="on"))' +
                  ')){' + source + '}';
                break;
              case 'placeholder-shown':
                source =
                  'if((' +
                    '(/^input|textarea$/i.test(e.localName))&&e.hasAttribute("placeholder")&&' +
                    '("|textarea|password|number|search|email|text|tel|url|".includes("|"+e.type+"|"))&&' +
                    '(!s.match(":focus",e))' +
                  ')){' + source + '}';
                break;
              case 'default':
                source =
                  'if(("form" in e && e.form)){' +
                    'var x=0;n=[];' +
                    'if(e.type=="image")n=e.form.getElementsByTagName("input");' +
                    'if(e.type=="submit")n=e.form.elements;' +
                    'while(n[x]&&e!==n[x]){' +
                      'if(n[x].type=="image")break;' +
                      'if(n[x].type=="submit")break;' +
                      'x++;' +
                    '}' +
                  '}' +
                  'if((e.form&&(e===n[x]&&"|image|submit|".includes("|"+e.type+"|"))||' +
                    '((/^option$/i.test(e.localName))&&e.defaultSelected)||' +
                    '(("|radio|checkbox|".includes("|"+e.type+"|"))&&e.defaultChecked)' +
                  ')){' + source + '}';
                break;
              default:
                emit('\'' + selector_string + '\'' + qsInvalid);
                break;
            }
          }

          else if ((match = selector.match(Patterns.inputvalue))) {
            match[1] = match[1].toLowerCase();
            switch (match[1]) {
              case 'checked':
                source = 'if((/^input$/i.test(e.localName)&&' +
                  '("|radio|checkbox|".includes("|"+e.type+"|")&&e.checked)||' +
                  '(/^option$/i.test(e.localName)&&(e.selected||e.checked))' +
                  ')){' + source + '}';
                break;
              case 'indeterminate':
                source =
                  'if((/^progress$/i.test(e.localName)&&!e.hasAttribute("value"))||' +
                    '(/^input$/i.test(e.localName)&&("checkbox"==e.type&&e.indeterminate)||' +
                    '("radio"==e.type&&e.name&&!s.first("input[name="+e.name+"]:checked",e.form))' +
                  ')){' + source + '}';
                break;
              case 'required':
                source =
                  'if((/^input|select|textarea$/i.test(e.localName)&&e.required)' +
                  '){' + source + '}';
                break;
              case 'optional':
                source =
                  'if((/^input|select|textarea$/i.test(e.localName)&&!e.required)' +
                  '){' + source + '}';
                break;
              case 'invalid':
                source =
                  'if(((' +
                    '(/^form$/i.test(e.localName)&&!e.noValidate)||' +
                    '(e.willValidate&&!e.formNoValidate))&&!e.checkValidity())||' +
                    '(/^fieldset$/i.test(e.localName)&&s.first(":invalid",e))' +
                  '){' + source + '}';
                break;
              case 'valid':
                source =
                  'if(((' +
                    '(/^form$/i.test(e.localName)&&!e.noValidate)||' +
                    '(e.willValidate&&!e.formNoValidate))&&e.checkValidity())||' +
                    '(/^fieldset$/i.test(e.localName)&&s.first(":valid",e))' +
                  '){' + source + '}';
                break;
              case 'in-range':
                source =
                  'if((/^input$/i.test(e.localName))&&' +
                    '(e.willValidate&&!e.formNoValidate)&&' +
                    '(!e.validity.rangeUnderflow&&!e.validity.rangeOverflow)&&' +
                    '("|date|datetime-local|month|number|range|time|week|".includes("|"+e.type+"|"))&&' +
                    '("range"==e.type||e.getAttribute("min")||e.getAttribute("max"))' +
                  '){' + source + '}';
                break;
              case 'out-of-range':
                source =
                  'if((/^input$/i.test(e.localName))&&' +
                    '(e.willValidate&&!e.formNoValidate)&&' +
                    '(e.validity.rangeUnderflow||e.validity.rangeOverflow)&&' +
                    '("|date|datetime-local|month|number|range|time|week|".includes("|"+e.type+"|"))&&' +
                    '("range"==e.type||e.getAttribute("min")||e.getAttribute("max"))' +
                  '){' + source + '}';
                break;
              default:
                emit('\'' + selector_string + '\'' + qsInvalid);
                break;
            }
          }

          else if ((match = selector.match(Patterns.pseudo_sng))) {
            source = 'if(e.element&&e.type.toLowerCase()=="' +
              ':' + match[0].toLowerCase() + '"){e=e.element;' + source + '}';
          }

          else if ((match = selector.match(Patterns.pseudo_dbl))) {
            source = 'if(e.element&&e.type.toLowerCase()=="' +
              match[0].toLowerCase() + '"){e=e.element;' + source + '}';
          }

          else if ((match = selector.match(Patterns.pseudo_nop))) {
            break;
          }

          else {
            expr = false;
            status = false;

            for (expr in Selectors) {
              if ((match = selector.match(Selectors[expr].Expression))) {
                result = Selectors[expr].Callback(match, source, mode, callback);
                if ('match' in result) { match = result.match; }
                vars = result.modvar;
                if (mode) {
                   vars && S_VARS.indexOf(vars) < 0 && (S_VARS[S_VARS.length] = vars);
                } else {
                   vars && M_VARS.indexOf(vars) < 0 && (M_VARS[M_VARS.length] = vars);
                }
                source = result.source;
                status = result.status;
                if (status) { break; }
              }
            }

            if (!status) {
              emit('unknown pseudo-class selector \'' + selector + '\'');
              return '';
            }

            if (!expr) {
              emit('unknown token in selector \'' + selector + '\'');
              return '';
            }

          }
          break;

      default:
        emit('\'' + selector_string + '\'' + qsInvalid);
        break selector_recursion_label;

      }

      if (!match) {
        emit('\'' + selector_string + '\'' + qsInvalid);
        return '';
      }

      selector = match.pop();
    }

    return source;
  };

  const makeref = function(selectors, element) {
    if (element.nodeType === 9) {
      element = element.documentElement;
    }

    return selectors.replace(/:scope/ig,
      element.localName +
      (element.id ? '#' + element.id : '') +
      (element.className ? '.' + element.classList[0] : ''));
  };

  const ancestor = function _closest(selectors, element, callback) {

    if ((/:scope/i).test(selectors)) {
      selectors = makeref(selectors, element);
    }

    while (element) {
      if (match(selectors, element, callback)) break;
      element = element.parentElement;
    }
    return element;
  };

  const match_assert = function(f, element, callback) {
    for (var i = 0, l = f.length, r = false; l > i; ++i)
      f[i](element, callback, null, false) && (r = true);
    return r;
  };

  const match_collect = function(selectors, callback) {
    for (var i = 0, l = selectors.length, f = []; l > i; ++i)
      f[i] = compile(selectors[i], false, callback);
    return { factory: f };
  };

  const match = function _matches(selectors, element, callback) {

    var expressions, parsed;

    if (element && matchResolvers[selectors]) {
      return match_assert(matchResolvers[selectors].factory, element, callback);
    }

    lastMatched = selectors;

    if (arguments.length === 0) {
      emit(qsNotArgs, TypeError);
      return Config.VERBOSITY ? undefined : false;
    } else if (arguments[0] === '') {
      emit('\'\'' + qsInvalid);
      return Config.VERBOSITY ? undefined : false;
    }

    if (typeof selectors != 'string') {
      selectors = '' + selectors;
    }

    if ((/:scope/i).test(selectors)) {
      selectors = makeref(selectors, element);
    }

    parsed = selectors.
      replace(/\x00|\\$/g, '\ufffd').
      replace(REX.CombineWSP, '\x20').
      replace(REX.PseudosWSP, '$1').
      replace(REX.TabCharWSP, '\t').
      replace(REX.CommaGroup, ',').
      replace(REX.TrimSpaces, '');

    if ((expressions = parsed.match(reValidator)) && expressions.join('') == parsed) {
      expressions = parsed.match(REX.SplitGroup);
      if (parsed[parsed.length - 1] == ',') {
        emit(qsInvalid);
        return Config.VERBOSITY ? undefined : false;
      }
    } else {
      emit('\'' + selectors + '\'' + qsInvalid);
      return Config.VERBOSITY ? undefined : false;
    }

    matchResolvers[selectors] = match_collect(expressions, callback);

    return match_assert(matchResolvers[selectors].factory, element, callback);
  };

  const first = function _querySelector(selectors, context, callback) {
    if (arguments.length === 0) {
      emit(qsNotArgs, TypeError);
    }
    return select(selectors, context,
      typeof callback == 'function' ?
      function firstMatch(element) {
        callback(element);
        return false;
      } :
      function firstMatch() {
        return false;
      }
    )[0] || null;
  };

  const select = function _querySelectorAll(selectors, context, callback) {

    var expressions, nodes = [], parsed, resolver;

    context || (context = doc);

    if (selectors) {
      if ((resolver = selectResolvers[selectors])) {
        if (resolver.context === context && resolver.callback === callback) {
          var f = resolver.factory, h = resolver.htmlset, n = resolver.nodeset;
          if (n.length > 1) {
            for (var i = 0, l = n.length, list; l > i; ++i) {
              list = compat[n[i][0]](context, n[i].slice(1))();
              if (f[i] !== null) {
                f[i](list, callback, context, nodes);
              } else {
                nodes = nodes.concat(list);
              }
            }
            if (l > 1 && nodes.length > 1) {
              nodes.sort(documentOrder);
              hasDupes && (nodes = unique(nodes));
            }
          } else {
            if (f[0]) {
              nodes = f[0](h[0](), callback, context, nodes);
            } else {
              nodes = h[0]();
            }
          }
          if (typeof callback == 'function') {
            nodes = concatCall(nodes, callback);
          }
          return nodes;
        }
      }
    }

    lastSelected = selectors;

    if (arguments.length === 0) {
      emit(qsNotArgs, TypeError);
      return Config.VERBOSITY ? undefined : none;
    } else if (arguments[0] === '') {
      emit('\'\'' + qsInvalid);
      return Config.VERBOSITY ? undefined : none;
    } else if (lastContext !== context) {
      lastContext = switchContext(context);
    }

    if (typeof selectors != 'string') {
      selectors = '' + selectors;
    }

    if ((/:scope/i).test(selectors)) {
      selectors = makeref(selectors, context);
    }

    parsed = selectors.
      replace(/\x00|\\$/g, '\ufffd').
      replace(REX.CombineWSP, '\x20').
      replace(REX.PseudosWSP, '$1').
      replace(REX.TabCharWSP, '\t').
      replace(REX.CommaGroup, ',').
      replace(REX.TrimSpaces, '');

    if ((expressions = parsed.match(reValidator)) && expressions.join('') == parsed) {
      expressions = parsed.match(REX.SplitGroup);
      if (parsed[parsed.length - 1] == ',') {
        emit(qsInvalid);
        return Config.VERBOSITY ? undefined : false;
      }
    } else {
      emit('\'' + selectors + '\'' + qsInvalid);
      return Config.VERBOSITY ? undefined : false;
    }

    selectResolvers[selectors] = collect(expressions, context, callback);

    nodes = selectResolvers[selectors].results;

    if (typeof callback == 'function') {
      nodes = concatCall(nodes, callback);
    }
    return nodes;
  };

  const optimize = function(selector, token) {
    const index = token.index,
    length = token[1].length + token[2].length;
    return selector.slice(0, index) +
      (' >+~'.indexOf(selector.charAt(index - 1)) > -1 ?
        (':['.indexOf(selector.charAt(index + length + 1)) > -1 ?
        '*' : '') : '') + selector.slice(index + length - (token[1] == '*' ? 1 : 0));
  };

  const collect = function(selectors, context, callback) {

    let i, l, seen = {}, token = ['', '*', '*'], optimized = selectors,
    factory = [], htmlset = [], nodeset = [], results = [], type;

    for (i = 0, l = selectors.length; l > i; ++i) {

      if (!seen[selectors[i]] && (seen[selectors[i]] = true)) {
        type = selectors[i].match(reOptimizer);
        if (type && type[1] != ':' && (token = type)) {
          token[1] || (token[1] = '*');
          optimized[i] = optimize(optimized[i], token);
        } else {
          token = ['', '*', '*'];
        }
      }

      nodeset[i] = token[1] + token[2];
      htmlset[i] = compat[token[1]](context, token[2]);
      factory[i] = compile(optimized[i], true, null);

      factory[i] ?
        factory[i](htmlset[i](), callback, context, results) :
        results.concat(htmlset[i]());
    }

    if (l > 1) {
      results.sort(documentOrder);
      hasDupes && (results = unique(results));
    }

    return {
      callback: callback,
      context: context,
      factory: factory,
      htmlset: htmlset,
      nodeset: nodeset,
      results: results
    };

  };

  let _closest, _matches,
  _querySelector, _querySelectorAll,
  _querySelectorDoc, _querySelectorAllDoc;

  const install = function(all) {
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
          method.apply(this, [arguments[0], this,
            typeof arguments[1] == 'function' ? arguments[1] : undefined ]));
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
      document.addEventListener('load', function(e) {
        let c, d, r, s, t = e.target;
        if (/iframe/i.test(t.localName)) {
          c = '(' + Export + ')(this, ' + Factory + ');'; d = t.ownerDocument;
          s = d.createElement('script'); s.textContent = c + 'NW.Dom.install(true)';
          r = d.documentElement; r.removeChild(r.insertBefore(s, r.firstChild));
        }
      }, true);
    }

  };

  const uninstall = function() {
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
      HTMLElement.prototype.querySelectorAll = _querySelector;
    }
    if (_querySelectorAllDoc) {
      Document.prototype.querySelector =
      DocumentFragment.prototype.querySelector = _querySelectorDoc;
      Document.prototype.querySelectorAll =
      DocumentFragment.prototype.querySelectorAll = _querySelectorAllDoc;
    }
  };

  const none = [];

  let lastContext;

  let lastMatched;
  let lastSelected;

  const matchLambdas = {};
  const selectLambdas = {};

  const matchResolvers = {};
  const selectResolvers = {};

  const Snapshot = {

    doc: doc,
    from: doc,
    root: root,

    byTag: byTag,

    first: first,
    match: match,

    ancestor: ancestor,

    nthOfType: nthOfType,
    nthElement: nthElement,

    isFocusable: isFocusable,
    hasAttributeNS: hasAttributeNS
  };

  const Dom = {

    lastMatched: lastMatched,
    lastSelected: lastSelected,

    matchLambdas: matchLambdas,
    selectLambdas: selectLambdas,

    matchResolvers: matchResolvers,
    selectResolvers: selectResolvers,

    CFG: CFG,

    M_BODY: M_BODY,
    S_BODY: S_BODY,
    M_TEST: M_TEST,
    S_TEST: S_TEST,

    byId: byId,
    byTag: byTag,
    byClass: byClass,

    match: match,
    first: first,
    select: select,
    closest: ancestor,

    compile: compile,
    configure: configure,

    emit: emit,
    Config: Config,
    Snapshot: Snapshot,

    Version: version,

    install: install,
    uninstall: uninstall,

    Operators: Operators,
    Selectors: Selectors,

    registerCombinator: function(combinator, resolver) {
      let i = 0, l = combinator.length, symbol;
      for (; l > i; ++i) {
        if (combinator[i] != '=') {
          symbol = combinator[i];
          break;
        }
      }
      if (CFG.combinators.indexOf(symbol) < 0) {
        CFG.combinators = CFG.combinators.replace('](', symbol + '](');
        CFG.combinators = CFG.combinators.replace('])', symbol + '])');
        Combinators[combinator] = resolver;
        setIdentifierSyntax();
      } else {
        console.warn('Warning: the \'' + combinator + '\' combinator is already registered.');
      }
    },

    registerOperator: function(operator, resolver) {
      let i = 0, l = operator.length, symbol;
      for (; l > i; ++i) {
        if (operator[i] != '=') {
          symbol = operator[i];
          break;
        }
      }
      if (CFG.operators.indexOf(symbol) < 0 && !Operators[operator]) {
        CFG.operators = CFG.operators.replace(']=', symbol + ']=');
        Operators[operator] = resolver;
        setIdentifierSyntax();
      } else {
        console.warn('Warning: the \'' + operator + '\' operator is already registered.');
      }
    },

    registerSelector: function(name, rexp, func) {
      Selectors[name] || (Selectors[name] = {
        Expression: rexp,
        Callback: func
      });
    }

  };

  initialize(doc);

  return Dom;

});
