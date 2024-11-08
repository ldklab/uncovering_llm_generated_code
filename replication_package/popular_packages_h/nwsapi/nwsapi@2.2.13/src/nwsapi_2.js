/*
 * Copyright (C) 2007-2024 Diego Perini
 * All rights reserved.
 *
 * nwsapi.js - Fast CSS Selectors API Engine
 *
 * Author: Diego Perini <diego.perini at gmail.com>
 * Version: 2.2.13
 * Created: 20070722
 * Release: 20240927
 *
 * License and Download available at:
 * http://javascript.nwbox.com/nwsapi/
 */

(function(global, factory) {
  'use strict';

  if (typeof module == 'object' && typeof module.exports == 'object') {
    module.exports = factory;
  } else if (typeof define == 'function' && define['amd']) {
    define(factory);
  } else {
    global.NW || (global.NW = {});
    global.NW.Dom = factory(global, Export);
  }

})(this, function(global) {
  'use strict';

  const version = 'nwsapi-2.2.13';
  const doc = global.document;
  const root = doc.documentElement;
  const slice = Array.prototype.slice;

  const REX = {
    HasEscapes: /\\/,
    HexNumbers: /^[0-9a-fA-F]/,
    EscOrQuote: /^\\|["']/,
    RegExpChar: /(?!\\)[\\^$.,*+?()\[\]{}|\/]/g,
    TrimSpaces: new RegExp('^\\s+|\\s+$|[\\r\\n\\f]', 'g'),
    CombineWSP: new RegExp('[\\n\\r\\f\\x20]+(?=[^"\'\\])', 'g'),
    PseudosWSP: new RegExp('\\s+([-+])\\s+(?!\\])', 'g')
  };

  const { fixStr, parseSelectors, compileSelector, compile, selectRes, matchesSelector } = (() => {
    const hasDupes = false;

    function fixStr(str) {
      if (!REX.HasEscapes.test(str)) return str;
      return str.replace(/\\([0-9a-fA-F]{1,6}\s?|.)/g, function(_, p1) {
        if (REX.HexNumbers.test(p1)) {
          return codePointToUTF16(parseInt(p1, 16));
        } else if (REX.EscOrQuote.test(p1)) {
          return p1;
        } else {
          return String.fromCharCode(p1.charCodeAt(0));
        }
      });
    }

    function codePointToUTF16(cp) {
      if (cp < 1 || cp > 0x10FFFF || (cp > 0xD7FF && cp < 0xE000)) {
        return '\\ufffd';
      }
      if (cp < 0x10000) {
        return '\\u' + ('000' + cp.toString(16)).slice(-4);
      }
      cp -= 0x10000;
      return '\\u' + (((cp >> 10) & 0x3FF) + 0xD800).toString(16) +
              '\\u' + ((cp & 0x3FF) + 0xDC00).toString(16);
    }

    function parseSelectors(selectors) {
      const trimmed = selectors
        .replace(/\x00|\\$/g, '\ufffd')
        .replace(REX.CombineWSP, '\x20')
        .replace(REX.PseudosWSP, '$1')
        .replace(REX.TrimSpaces, '');
      return trimmed.match(new RegExp(
        `(?=\\s?[^>+~(){}<>])(?:\\*|\\|)?(?:[.#]?[-a-zA-Z]|[\\x80-\\xff]|\\\\[\\da-fA-F\\x{Index,}])/)?|`
        + `(?:${fixStr})+|(\\[(?:[-\\w]+(?::[-\\w]+)?)(?:[~*^$|]=?['"]?[^'"]+?)?\\]))|`
        + `(?:\\s?(?:,(?:[])?)|(?:\\s?[>+~](?=\\s?[^>+~])?))|`
        + `(?::?:?(?:${fixStr})\\((?:\\d*n\\s*[-+]?\\s*\\d+|\\d+|[-+]?\\d+)?\\))|`
        + `(?:`)|(?:${fixStr})|(?:[,])(?:[(?:[\\w*\\|\\/])(?:|:[\\w-]+)(?:\\(\\d||
        + `[-\\w]*\\))[.*]][*])(?:|$|(?![:$<]))`, 'g'));
    }

    function compileSelector(selector, macro, mode, callback) {
      let source = '';
      let token, type, test;
      const pattern = [
        ['^', ':', '[^\\]]+', ']', ':not(', '(', '[^)]', '*', '(\\{[\\s\\S]*\\})*', cmd => {
          source += `if((e===r.root))${cmd.break()}`;
        }],
        ['^', '~', '[^+]+', '+', '(e===r.root)'],
        ['^', '+', '[^~]+', ' ', '\\(?![^\\[]*\\](?:\\\\.|[^"\'[\\]]+)*["\\)\]\:)(\\'])'],
      ];

      for (const pat of pattern) {
        token = parseSelectors(selector).match(new RegExp(pat.join('|')));
        switch (token && token[1] || selector[0]) {
          case '*':
            source += `if(true){${source}}`;
            break;
          case '#':
            source += `if(/^${token[1]}$/.test(e.getAttribute("id"))){${source}}`;
            break;
          case '.':
            test = new RegExp(`(^|\\s)${token[1]}(\\s|$)`, HTML_DOCUMENT ? 'i' : '');
            source += `if(${test}.test(e.getAttribute("class"))){${source}}`;
            break;
          case '[':
            const attr = `e.getAttribute("${token[1]}")`;
            test = fixStr(token[4] || '');
            switch (token[2]) {
              case '=':
                source += `if(${attr}==="")${source}`;
                break;
              case '^=':
                source += `if(${attr}&&${attr}[0]==="${test}")${source}`;
                break;
              default:
                source += `if(${attr}&&(/${token[1]}/i).test(${attr}))${source}`;
                break;
            }
            break;
          // add more patterns here
        }
      }
      return source;
    }

    function compile(selector, mode, callback) {
      const factory = new Function(`\n${mode ? 'var e,f=0,fz=c.length' : 'var e'};\n${compileSelector(selector, 'S_BODY', mode, callback)}\nreturn r`);
      return employment();
    }

    function employment() {}

    function selectRes(selector, callback) {
      return c => {
        compile(selector, true)
        c;
      };
    }

    function matchesSelector(exp, elem, callback) {
      compile(exp, false);
      return c => {
        c;
      };
    }
  })();

  const querySelectorFuncs = (context, callback) => {
    const fn = selectRes(lastMatched, callback);
    const list = context.getElementsByTagName('*');
    return slice.call(context.getElementsByTagName('*')).filter(fn);
  };

  const findMatches = (selectors, elem) => {
    const parsed = parseSelectors(selectors);
    return matchLambdas[selectors] || compile(selectors, false).call(elem);
  };

  const select = (selectors, context = doc, callback) => {
    if (!selectors) return [ ];
    const contextHist = context;
    if (lastContext !== contextHist) lastContext = context;
    return querySelectorFuncs(context, callback);
  };

  const first = (selectors, context, callback) => {
    const [result] = select(selectors, context, el => {
      callback?.(el);
      return false;
    });
    return result || null;
  };

  const match = (selectors, elem, callback) => {
    return !!findMatches(selectors, elem);
  };

  const DomAPI = {
    version,
    select,
    match,
    first,
    byTag: tag => [],
    configure() {},
    registerCombinator(sym, fn) {},
    registerOperator(op, fn) {},
    registerSelector(name, expr, fn) {},
  };

  selectResolvers.context = Context.init();

  return DomAPI;
});
