'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const emotionElement = require('./emotion-element-b1930563.cjs.js');
const React = require('react');
const utils = require('@emotion/utils');
const useInsertionEffectWithFallbacks = require('@emotion/use-insertion-effect-with-fallbacks');
const serialize = require('@emotion/serialize');

function _interopNamespace(e) {
  let n = Object.create(null);
  if (e && e.__esModule) return e;
  if (e) {
    Object.keys(e).forEach(k => {
      if (k === 'default') return;
      let d = Object.getOwnPropertyDescriptor(e, k);
      Object.defineProperty(n, k, d ? d : {
        enumerable: true,
        get: () => e[k]
      });
    });
  }
  n["default"] = e;
  return Object.freeze(n);
}

const React__namespace = /*#__PURE__*/_interopNamespace(React);

const jsx = (type, props) => {
  let args = arguments;

  if (props == null || !emotionElement.hasOwn.call(props, 'css')) {
    return React__namespace.createElement.apply(undefined, args);
  }

  let argsLength = args.length;
  let createElementArgArray = new Array(argsLength);
  createElementArgArray[0] = emotionElement.Emotion;
  createElementArgArray[1] = emotionElement.createEmotionProps(type, props);

  for (let i = 2; i < argsLength; i++) {
    createElementArgArray[i] = args[i];
  }

  return React__namespace.createElement.apply(null, createElementArgArray);
};

const Global = emotionElement.withEmotionCache(function (props, cache) {
  const styles = props.styles;
  const serialized = serialize.serializeStyles([styles], undefined, React__namespace.useContext(emotionElement.ThemeContext));

  if (!emotionElement.isBrowser) {
    let serializedNames = serialized.name;
    let serializedStyles = serialized.styles;
    let next = serialized.next;

    while (next !== undefined) {
      serializedNames += ' ' + next.name;
      serializedStyles += next.styles;
      next = next.next;
    }

    const shouldCache = cache.compat === true;
    const rules = cache.insert("", {
      name: serializedNames,
      styles: serializedStyles
    }, cache.sheet, shouldCache);

    if (shouldCache) return null;

    return React__namespace.createElement("style", {
      "data-emotion": cache.key + "-global " + serializedNames,
      dangerouslySetInnerHTML: { __html: rules },
      nonce: cache.sheet.nonce
    });
  }

  const sheetRef = React__namespace.useRef();
  useInsertionEffectWithFallbacks.useInsertionEffectWithLayoutFallback(() => {
    const key = cache.key + "-global";
    const sheet = new cache.sheet.constructor({
      key, nonce: cache.sheet.nonce, container: cache.sheet.container, speedy: cache.sheet.isSpeedy
    });
    let rehydrating = false;
    const node = document.querySelector(`style[data-emotion="${key} ${serialized.name}"]`);

    if (cache.sheet.tags.length) {
      sheet.before = cache.sheet.tags[0];
    }

    if (node !== null) {
      rehydrating = true;
      node.setAttribute('data-emotion', key);
      sheet.hydrate([node]);
    }

    sheetRef.current = [sheet, rehydrating];
    return () => sheet.flush();
  }, [cache]);

  useInsertionEffectWithFallbacks.useInsertionEffectWithLayoutFallback(() => {
    const [sheet, rehydrating] = sheetRef.current;

    if (rehydrating) {
      sheetRef.current[1] = false;
      return;
    }

    if (serialized.next !== undefined) {
      utils.insertStyles(cache, serialized.next, true);
    }

    if (sheet.tags.length) {
      sheet.before = sheet.tags[sheet.tags.length - 1].nextElementSibling;
      sheet.flush();
    }

    cache.insert("", serialized, sheet, false);
  }, [cache, serialized.name]);

  return null;
});

function css() {
  return serialize.serializeStyles(arguments);
}

const keyframes = function keyframes() {
  const insertable = css.apply(void 0, arguments);
  const name = "animation-" + insertable.name;
  return {
    name: name,
    styles: `@keyframes ${name}{${insertable.styles}}`,
    anim: 1,
    toString: function () {
      return `_EMO_${this.name}_${this.styles}_EMO_`;
    }
  };
};

const classnames = function classnames(args) {
  let cls = '';
  args.forEach(arg => {
    if (arg == null) return;
    let toAdd;
    switch (typeof arg) {
      case 'boolean':
        break;
      case 'object':
        if (Array.isArray(arg)) {
          toAdd = classnames(arg);
        } else {
          toAdd = '';
          for (let k in arg) {
            if (arg[k] && k) {
              if (toAdd) toAdd += ' ';
              toAdd += k;
            }
          }
        }
        break;
      default:
        toAdd = arg;
    }
    if (toAdd) {
      if (cls) cls += ' ';
      cls += toAdd;
    }
  });
  return cls;
};

function merge(registered, css, className) {
  let registeredStyles = [];
  let rawClassName = utils.getRegisteredStyles(registered, registeredStyles, className);

  if (registeredStyles.length < 2) {
    return className;
  }

  return rawClassName + css(registeredStyles);
}

const Insertion = function Insertion({_ref}) {
  const cache = _ref.cache, serializedArr = _ref.serializedArr;
  const rules = useInsertionEffectWithFallbacks.useInsertionEffectAlwaysWithSyncFallback(() => {
    let rules = '';

    for (let i = 0; i < serializedArr.length; i++) {
      const res = utils.insertStyles(cache, serializedArr[i], false);

      if (!emotionElement.isBrowser && res !== undefined) {
        rules += res;
      }
    }

    if (!emotionElement.isBrowser) {
      return rules;
    }
  });

  if (!emotionElement.isBrowser && rules.length !== 0) {
    return React__namespace.createElement("style", {
      "data-emotion": cache.key + " " + serializedArr.map(serialized => serialized.name).join(' '),
      dangerouslySetInnerHTML: { __html: rules },
      nonce: cache.sheet.nonce
    });
  }

  return null;
};

const ClassNames = emotionElement.withEmotionCache(function (props, cache) {
  let hasRendered = false;
  let serializedArr = [];

  const css = function css() {
    if (hasRendered && emotionElement.isDevelopment) {
      throw new Error('css can only be used during render');
    }
    const serialized = serialize.serializeStyles(arguments, cache.registered);
    serializedArr.push(serialized);
    utils.registerStyles(cache, serialized, false);
    return cache.key + "-" + serialized.name;
  };

  const cx = function cx() {
    if (hasRendered && emotionElement.isDevelopment) {
      throw new Error('cx can only be used during render');
    }
    return merge(cache.registered, css, classnames(arguments));
  };

  const content = { css, cx, theme: React__namespace.useContext(emotionElement.ThemeContext) };
  const ele = props.children(content);
  hasRendered = true;
  return React__namespace.createElement(React__namespace.Fragment, null, React__namespace.createElement(Insertion, { cache, serializedArr }), ele);
});

exports.CacheProvider = emotionElement.CacheProvider;
exports.ThemeContext = emotionElement.ThemeContext;
exports.ThemeProvider = emotionElement.ThemeProvider;
exports.__unsafe_useEmotionCache = emotionElement.__unsafe_useEmotionCache;
exports.useTheme = emotionElement.useTheme;
exports.withEmotionCache = emotionElement.withEmotionCache;
exports.withTheme = emotionElement.withTheme;
exports.ClassNames = ClassNames;
exports.Global = Global;
exports.createElement = jsx;
exports.css = css;
exports.jsx = jsx;
exports.keyframes = keyframes;
