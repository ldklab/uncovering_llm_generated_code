'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const emotionElement = require('./emotion-element-b1930563.cjs.js');
const React = require('react');
const utils = require('@emotion/utils');
const useInsertionEffectWithFallbacks = require('@emotion/use-insertion-effect-with-fallbacks');
const serialize = require('@emotion/serialize');

function _interopNamespace(e) {
  if (e && e.__esModule) return e;
  const namespace = Object.create(null);
  if (e) {
    Object.keys(e).forEach((key) => {
      if (key !== 'default') {
        const descriptor = Object.getOwnPropertyDescriptor(e, key);
        Object.defineProperty(namespace, key, descriptor.get ? descriptor : {
          enumerable: true,
          get: () => e[key],
        });
      }
    });
  }
  namespace.default = e;
  return Object.freeze(namespace);
}

const ReactNamespace = /*#__PURE__*/_interopNamespace(React);

const jsx = function(type, props) {
  const args = arguments;
  
  if (!props || !emotionElement.hasOwn.call(props, 'css')) {
    return ReactNamespace.createElement.apply(undefined, args);
  }

  const createElementArgArray = Array(args.length);
  createElementArgArray[0] = emotionElement.Emotion;
  createElementArgArray[1] = emotionElement.createEmotionProps(type, props);

  for (let i = 2; i < args.length; i++) {
    createElementArgArray[i] = args[i];
  }

  return ReactNamespace.createElement.apply(null, createElementArgArray);
};

const Global = emotionElement.withEmotionCache((props, cache) => {
  const { styles } = props;
  const serialized = serialize.serializeStyles([styles], undefined, ReactNamespace.useContext(emotionElement.ThemeContext));

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
    const rules = cache.insert("", { name: serializedNames, styles: serializedStyles }, cache.sheet, shouldCache);

    if (shouldCache) {
      return null;
    }

    return /*#__PURE__*/ReactNamespace.createElement("style", {
      "data-emotion": cache.key + "-global " + serializedNames,
      dangerouslySetInnerHTML: { __html: rules },
      nonce: cache.sheet.nonce,
    });
  }

  const { useRef } = ReactNamespace;
  const sheetRef = useRef();

  useInsertionEffectWithFallbacks.useInsertionEffectWithLayoutFallback(() => {
    const key = cache.key + "-global";
    const sheet = new cache.sheet.constructor({
      key: key,
      nonce: cache.sheet.nonce,
      container: cache.sheet.container,
      speedy: cache.sheet.isSpeedy
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
    return () => {
      sheet.flush();
    };
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
      const element = sheet.tags[sheet.tags.length - 1].nextElementSibling;
      sheet.before = element;
      sheet.flush();
    }

    cache.insert("", serialized, sheet, false);
  }, [cache, serialized.name]);

  return null;
});

function css() {
  return serialize.serializeStyles(arguments);
}

const keyframes = function() {
  const insertable = css.apply(void 0, arguments);
  const name = "animation-" + insertable.name;
  return {
    name: name,
    styles: "@keyframes " + name + "{" + insertable.styles + "}",
    anim: 1,
    toString: function() {
      return "_EMO_" + this.name + "_" + this.styles + "_EMO_";
    }
  };
};

const classnames = function(args) {
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
          toAdd = Object.keys(arg).filter(k => arg[k] && k).join(' ');
        }
        break;
      default:
        toAdd = arg;
    }

    if (toAdd) {
      cls = cls.length ? cls + ' ' + toAdd : toAdd;
    }
  });

  return cls;
};

function merge(registered, css, className) {
  const registeredStyles = [];
  const rawClassName = utils.getRegisteredStyles(registered, registeredStyles, className);

  if (registeredStyles.length < 2) {
    return className;
  }

  return rawClassName + css(registeredStyles);
}

const Insertion = ({ cache, serializedArr }) => {
  const rules = useInsertionEffectWithFallbacks.useInsertionEffectAlwaysWithSyncFallback(() => {
    let rules = '';
    serializedArr.forEach(serialized => {
      const res = utils.insertStyles(cache, serialized, false);
      if (!emotionElement.isBrowser && res !== undefined) {
        rules += res;
      }
    });

    if (!emotionElement.isBrowser) {
      return rules;
    }
  });

  if (!emotionElement.isBrowser && rules.length !== 0) {
    return /*#__PURE__*/ReactNamespace.createElement("style", {
      "data-emotion": cache.key + " " + serializedArr.map(serialized => serialized.name).join(' '),
      dangerouslySetInnerHTML: { __html: rules },
      nonce: cache.sheet.nonce,
    });
  }

  return null;
};

const ClassNames = emotionElement.withEmotionCache((props, cache) => {
  let hasRendered = false;
  const serializedArr = [];

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

  const content = { css, cx, theme: ReactNamespace.useContext(emotionElement.ThemeContext) };
  const element = props.children(content);
  hasRendered = true;

  return /*#__PURE__*/ReactNamespace.createElement(ReactNamespace.Fragment, null, /*#__PURE__*/ReactNamespace.createElement(Insertion, { cache, serializedArr }), element);
});

exports.CacheProvider = emotionElement.CacheProvider;
exports.ThemeContext = emotionElement.ThemeContext;
exports.ThemeProvider = emotionElement.ThemeProvider;
exports.__unsafe_useEmotionCache = emotionElement.__unsafe_useEmotionCache;
exports.useTheme = emotionElement.useTheme;
Object.defineProperty(exports, 'withEmotionCache', { enumerable: true, get: () => emotionElement.withEmotionCache });
exports.withTheme = emotionElement.withTheme;
exports.ClassNames = ClassNames;
exports.Global = Global;
exports.createElement = jsx;
exports.css = css;
exports.jsx = jsx;
exports.keyframes = keyframes;
