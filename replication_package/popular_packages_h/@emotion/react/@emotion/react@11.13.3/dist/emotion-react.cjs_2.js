'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const emotion = require('./emotion-element-b1930563.cjs.js');
const React = require('react');
const emotionUtils = require('@emotion/utils');
const useInsertionEffect = require('@emotion/use-insertion-effect-with-fallbacks');
const serializeStyles = require('@emotion/serialize');

function createInteropNamespace(e) {
  if (e && e.__esModule) return e;
  const n = {};
  if (e) {
    Object.keys(e).forEach((k) => {
      if (k !== 'default') {
        const d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d ? d : { enumerable: true, get: () => e[k] });
      }
    });
  }
  n["default"] = e;
  return Object.freeze(n);
}

const ReactNamespace = createInteropNamespace(React);

const jsx = (type, props, ...children) => {
  if (!props || !emotion.hasOwn.call(props, 'css')) {
    return ReactNamespace.createElement(type, props, ...children);
  }
  const emotionProps = emotion.createEmotionProps(type, props);
  return ReactNamespace.createElement(emotion.Emotion, emotionProps, ...children);
};

const Global = emotion.withEmotionCache((props, cache) => {
  const styles = props.styles;
  const serialized = serializeStyles.serializeStyles([styles], undefined, ReactNamespace.useContext(emotion.ThemeContext));

  if (!emotion.isBrowser) {
    let serializedNames = serialized.name;
    let serializedStyles = serialized.styles;
    let next = serialized.next;
    while (next) {
      serializedNames += ' ' + next.name;
      serializedStyles += next.styles;
      next = next.next;
    }
    const rules = cache.insert("", {
      name: serializedNames,
      styles: serializedStyles
    }, cache.sheet, cache.compat);
    if (cache.compat) return null;
    return ReactNamespace.createElement("style", {
      "data-emotion": `${cache.key}-global ${serializedNames}`,
      dangerouslySetInnerHTML: { __html: rules },
      nonce: cache.sheet.nonce
    });
  }

  const sheetRef = ReactNamespace.useRef();
  useInsertionEffect.useInsertionEffectWithLayoutFallback(() => {
    const sheet = new cache.sheet.constructor({
      key: `${cache.key}-global`,
      nonce: cache.sheet.nonce,
      container: cache.sheet.container,
      speedy: cache.sheet.isSpeedy
    });
    const rehydrating = false;
    const node = document.querySelector(`style[data-emotion="${cache.key}-global ${serialized.name}"]`);
    
    if (cache.sheet.tags.length) {
      sheet.before = cache.sheet.tags[0];
    }
    
    if (node) {
      node.setAttribute('data-emotion', cache.key + '-global');
      sheet.hydrate([node]);
    }

    sheetRef.current = [sheet, false];
    return () => sheet.flush();
  }, [cache]);

  useInsertionEffect.useInsertionEffectWithLayoutFallback(() => {
    const [sheet, rehydrating] = sheetRef.current;
    if (rehydrating) {
      sheetRef.current[1] = false;
      return;
    }
    if (serialized.next) {
      emotionUtils.insertStyles(cache, serialized.next, true);
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

function css(...args) {
  return serializeStyles.serializeStyles(args);
}

const keyframes = (...args) => {
  const insertable = css(...args);
  const name = "animation-" + insertable.name;
  return {
    name,
    styles: `@keyframes ${name} {${insertable.styles}}`,
    anim: 1,
    toString() {
      return `_EMO_${this.name}_${this.styles}_EMO_`;
    }
  };
};

const classnames = (args) => {
  const cls = args.reduce((acc, arg) => {
    if (!arg) return acc;
    if (typeof arg === 'object') {
      const toAdd = Array.isArray(arg) ? classnames(arg) : Object.keys(arg).filter(key => arg[key]).join(' ');
      return acc + (acc && toAdd ? ' ' : '') + toAdd;
    }
    return acc + (acc && arg ? ' ' : '') + arg;
  }, '');
  return cls;
};

function merge(registered, cssFn, className) {
  const registeredStyles = [];
  const rawClassName = emotionUtils.getRegisteredStyles(registered, registeredStyles, className);
  return registeredStyles.length < 2 ? className : rawClassName + cssFn(registeredStyles);
}

const Insertion = ({ cache, serializedArr }) => {
  const rules = useInsertionEffect.useInsertionEffectAlwaysWithSyncFallback(() => {
    let rules = '';
    serializedArr.forEach(serialized => {
      const res = emotionUtils.insertStyles(cache, serialized, false);
      rules += res ? res : '';
    });
    return emotion.isBrowser ? null : rules;
  });

  if (!emotion.isBrowser && rules.length) {
    return ReactNamespace.createElement("style", {
      "data-emotion": `${cache.key} ${serializedArr.map(s => s.name).join(' ')}`,
      dangerouslySetInnerHTML: { __html: rules },
      nonce: cache.sheet.nonce
    });
  }

  return null;
};

const ClassNames = emotion.withEmotionCache(({ children }, cache) => {
  let hasRendered = false;
  const serializedArr = [];

  const css = (...args) => {
    if (hasRendered) {
      throw new Error('css can only be used during render');
    }
    const serialized = serializeStyles.serializeStyles(args, cache.registered);
    serializedArr.push(serialized);
    emotionUtils.registerStyles(cache, serialized, false);
    return cache.key + "-" + serialized.name;
  };

  const cx = (...args) => {
    if (hasRendered) {
      throw new Error('cx can only be used during render');
    }
    return merge(cache.registered, css, classnames(args));
  };

  const content = {
    css,
    cx,
    theme: ReactNamespace.useContext(emotion.ThemeContext)
  };

  const ele = children(content);
  hasRendered = true;

  return ReactNamespace.createElement(ReactNamespace.Fragment, null, 
    ReactNamespace.createElement(Insertion, { cache, serializedArr }), 
    ele
  );
});

exports.CacheProvider = emotion.CacheProvider;
exports.ThemeContext = emotion.ThemeContext;
exports.ThemeProvider = emotion.ThemeProvider;
exports.__unsafe_useEmotionCache = emotion.__unsafe_useEmotionCache;
exports.useTheme = emotion.useTheme;
exports.withEmotionCache = emotion.withEmotionCache;
exports.withTheme = emotion.withTheme;
exports.ClassNames = ClassNames;
exports.Global = Global;
exports.createElement = jsx;
exports.css = css;
exports.jsx = jsx;
exports.keyframes = keyframes;
