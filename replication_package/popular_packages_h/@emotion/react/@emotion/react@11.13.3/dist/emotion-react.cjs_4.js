'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const emotionElement = require('./emotion-element-b1930563.cjs.js');
const React = require('react');
const utils = require('@emotion/utils');
const useInsertionEffectWithFallbacks = require('@emotion/use-insertion-effect-with-fallbacks');
const serialize = require('@emotion/serialize');

function _interopNamespace(e) {
  if (e && e.__esModule) return e;
  const n = Object.create(null);
  if (e) {
    Object.keys(e).forEach(k => {
      if (k !== 'default') {
        const d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : { enumerable: true, get: () => e[k] });
      }
    });
  }
  n["default"] = e;
  return Object.freeze(n);
}

const React__namespace = _interopNamespace(React);

const jsx = (type, props, ...args) => {
  if (props == null || !emotionElement.hasOwn.call(props, 'css')) {
    return React__namespace.createElement(type, props, ...args);
  }
  return React__namespace.createElement(emotionElement.Emotion, emotionElement.createEmotionProps(type, props), ...args);
};

const Global = emotionElement.withEmotionCache((props, cache) => {
  const { styles } = props;
  const serialized = serialize.serializeStyles([styles], undefined, React__namespace.useContext(emotionElement.ThemeContext));

  if (!emotionElement.isBrowser) {
    let { name, styles: serializedStyles, next } = serialized;
    while (next !== undefined) {
      name += ' ' + next.name;
      serializedStyles += next.styles;
      next = next.next;
    }
    const shouldCache = cache.compat === true;
    const rules = cache.insert("", { name, styles: serializedStyles }, cache.sheet, shouldCache);
    if (shouldCache) return null;
    return React__namespace.createElement("style", {
      "data-emotion": `${cache.key}-global ${name}`,
      dangerouslySetInnerHTML: { __html: rules },
      nonce: cache.sheet.nonce,
    });
  }

  const sheetRef = React__namespace.useRef();
  useInsertionEffectWithFallbacks.useInsertionEffectWithLayoutFallback(() => {
    const key = `${cache.key}-global`;
    const sheet = new cache.sheet.constructor({
      key,
      nonce: cache.sheet.nonce,
      container: cache.sheet.container,
      speedy: cache.sheet.isSpeedy,
    });
    const node = document.querySelector(`style[data-emotion="${key} ${serialized.name}"]`);
    if (cache.sheet.tags.length) sheet.before = cache.sheet.tags[0];
    if (node !== null) {
      node.setAttribute('data-emotion', key);
      sheet.hydrate([node]);
    }
    sheetRef.current = [sheet, !!node];
    return () => sheet.flush();
  }, [cache]);

  useInsertionEffectWithFallbacks.useInsertionEffectWithLayoutFallback(() => {
    const [sheet, rehydrating] = sheetRef.current;
    if (rehydrating) {
      sheetRef.current[1] = false;
      return;
    }
    if (serialized.next) utils.insertStyles(cache, serialized.next, true);
    sheet.flush();
    cache.insert("", serialized, sheet, false);
  }, [cache, serialized.name]);

  return null;
});

function css(...args) {
  return serialize.serializeStyles(args);
}

const keyframes = (...args) => {
  const insertable = css(...args);
  const name = `animation-${insertable.name}`;
  return {
    name,
    styles: `@keyframes ${name}{${insertable.styles}}`,
    anim: 1,
    toString() {
      return `_EMO_${this.name}_${this.styles}_EMO_`;
    },
  };
};

const classnames = (args) => {
  let cls = '';
  args.forEach(arg => {
    if (!arg) return;
    const toAdd = Array.isArray(arg) ?
      classnames(arg) :
      (typeof arg === 'object' ?
        Object.keys(arg).filter(k => arg[k]).join(' ') :
        arg);
    if (toAdd) cls && (cls += ' '), cls += toAdd;
  });
  return cls;
};

function merge(registered, css, className) {
  const registeredStyles = [];
  const rawClassName = utils.getRegisteredStyles(registered, registeredStyles, className);
  if (registeredStyles.length < 2) return className;
  return rawClassName + css(registeredStyles);
}

const Insertion = ({ cache, serializedArr }) => {
  const rules = useInsertionEffectWithFallbacks.useInsertionEffectAlwaysWithSyncFallback(() => {
    let rules = '';
    serializedArr.forEach(({ name, styles }) =>
      rules += !emotionElement.isBrowser ? utils.insertStyles(cache, { name, styles }, false) || '' : ''
    );
    return rules;
  });

  if (!emotionElement.isBrowser && rules) {
    const serializedNames = serializedArr.map(s => s.name).join(' ');
    return React__namespace.createElement("style", {
      "data-emotion": `${cache.key} ${serializedNames}`,
      dangerouslySetInnerHTML: { __html: rules },
      nonce: cache.sheet.nonce,
    });
  }
  return null;
};

const ClassNames = emotionElement.withEmotionCache((props, cache) => {
  let hasRendered = false;
  const serializedArr = [];
  const css = (...args) => {
    if (hasRendered && emotionElement.isDevelopment) throw new Error('css can only be used during render');
    const serialized = serialize.serializeStyles(args, cache.registered);
    serializedArr.push(serialized);
    utils.registerStyles(cache, serialized, false);
    return `${cache.key}-${serialized.name}`;
  };
  const cx = (...args) => {
    if (hasRendered && emotionElement.isDevelopment) throw new Error('cx can only be used during render');
    return merge(cache.registered, css, classnames(args));
  };

  const content = { css, cx, theme: React__namespace.useContext(emotionElement.ThemeContext) };
  const ele = props.children(content);
  hasRendered = true;
  return React__namespace.createElement(React__namespace.Fragment, null,
    React__namespace.createElement(Insertion, { cache, serializedArr }),
    ele
  );
});

exports.CacheProvider = emotionElement.CacheProvider;
exports.ThemeContext = emotionElement.ThemeContext;
exports.ThemeProvider = emotionElement.ThemeProvider;
exports.__unsafe_useEmotionCache = emotionElement.__unsafe_useEmotionCache;
exports.useTheme = emotionElement.useTheme;
Object.defineProperty(exports, 'withEmotionCache', {
  enumerable: true,
  get: () => emotionElement.withEmotionCache,
});
exports.withTheme = emotionElement.withTheme;
exports.ClassNames = ClassNames;
exports.Global = Global;
exports.createElement = jsx;
exports.css = css;
exports.jsx = jsx;
exports.keyframes = keyframes;
