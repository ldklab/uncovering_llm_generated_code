const Lexer = require('./Lexer.js');
const Parser = require('./Parser.js');
const Tokenizer = require('./Tokenizer.js');
const Renderer = require('./Renderer.js');
const TextRenderer = require('./TextRenderer.js');
const Slugger = require('./Slugger.js');
const { merge, checkSanitizeDeprecation, escape } = require('./helpers.js');
const { getDefaults, changeDefaults, defaults } = require('./defaults.js');

function marked(src, opt, callback) {
  if (typeof src === 'undefined' || src === null || typeof src !== 'string') {
    throw new Error(`marked(): invalid input parameter: ${Object.prototype.toString.call(src)}, string expected`);
  }

  if (typeof opt === 'function') {
    callback = opt;
    opt = null;
  }

  opt = merge({}, marked.defaults, opt || {});
  checkSanitizeDeprecation(opt);

  if (callback) {
    processAsync(src, opt, callback);
    return;
  }

  return processSync(src, opt);
}

function processSync(src, opt) {
  try {
    const tokens = Lexer.lex(src, opt);
    if (opt.walkTokens) marked.walkTokens(tokens, opt.walkTokens);
    return Parser.parse(tokens, opt);
  } catch (e) {
    handleError(e, opt);
  }
}

function processAsync(src, opt, callback) {
  const highlight = opt.highlight;
  let tokens;
  try {
    tokens = Lexer.lex(src, opt);
  } catch (e) {
    return callback(e);
  }
  handleAsyncHighlight(tokens, callback, highlight, opt);
}

function handleAsyncHighlight(tokens, callback, highlight, opt) {
  const done = (err) => {
    if (!err) {
      try {
        const out = Parser.parse(tokens, opt);
        return callback(null, out);
      } catch (e) {
        err = e;
      }
    }
    return callback(err);
  };

  if (!highlight || highlight.length < 3) return done();

  delete opt.highlight;

  let pending = 0;
  marked.walkTokens(tokens, (token) => {
    if (token.type === 'code') {
      pending++;
      highlightCodeAsync(token, highlight, done, () => {
        pending--;
        if (pending === 0) done();
      });
    }
  });

  if (pending === 0) done();
}

function highlightCodeAsync(token, highlight, done, decrementPending) {
  setTimeout(() => {
    highlight(token.text, token.lang, (err, code) => {
      if (err) return done(err);
      if (code !== null && code !== token.text) {
        token.text = code;
        token.escaped = true;
      }
      decrementPending();
    });
  }, 0);
}

function handleError(e, opt) {
  e.message += '\nPlease report this to https://github.com/markedjs/marked.';
  if (opt.silent) {
    return `<p>An error occurred:</p><pre>${escape(e.message, true)}</pre>`;
  }
  throw e;
}

marked.setOptions = function(opt) {
  merge(marked.defaults, opt);
  changeDefaults(marked.defaults);
  return marked;
};

marked.getDefaults = getDefaults;

marked.defaults = defaults;

marked.use = function(extension) {
  const opts = merge({}, extension);
  applyExtension(extension, opts);
  marked.setOptions(opts);
};

function applyExtension(extension, opts) {
  if (extension.renderer) {
    extendRenderer(extension, opts);
  }
  if (extension.tokenizer) {
    extendTokenizer(extension, opts);
  }
  if (extension.walkTokens) {
    const walkTokens = marked.defaults.walkTokens;
    opts.walkTokens = (token) => {
      extension.walkTokens(token);
      if (walkTokens) walkTokens(token);
    };
  }
}

function extendRenderer(extension, opts) {
  const renderer = marked.defaults.renderer || new Renderer();
  for (const prop in extension.renderer) {
    const prevRenderer = renderer[prop];
    renderer[prop] = (...args) => {
      let ret = extension.renderer[prop].apply(renderer, args);
      return ret === false ? prevRenderer.apply(renderer, args) : ret;
    };
  }
  opts.renderer = renderer;
}

function extendTokenizer(extension, opts) {
  const tokenizer = marked.defaults.tokenizer || new Tokenizer();
  for (const prop in extension.tokenizer) {
    const prevTokenizer = tokenizer[prop];
    tokenizer[prop] = (...args) => {
      let ret = extension.tokenizer[prop].apply(tokenizer, args);
      return ret === false ? prevTokenizer.apply(tokenizer, args) : ret;
    };
  }
  opts.tokenizer = tokenizer;
}

marked.walkTokens = function(tokens, callback) {
  for (const token of tokens) {
    callback(token);
    if (token.type in { table: 1, list: 1 }) {
      marked.walkTokens(token.tokens?.header || token.items || [], callback);
      for (const group of token.tokens?.cells || []) {
        marked.walkTokens(group, callback);
      }
    } else if (token.tokens) {
      marked.walkTokens(token.tokens, callback);
    }
  }
};

marked.parseInline = function(src, opt) {
  if (typeof src === 'undefined' || src === null || typeof src !== 'string') {
    throw new Error(`marked.parseInline(): invalid input parameter: ${Object.prototype.toString.call(src)}, string expected`);
  }

  opt = merge({}, marked.defaults, opt || {});
  checkSanitizeDeprecation(opt);

  try {
    const tokens = Lexer.lexInline(src, opt);
    if (opt.walkTokens) marked.walkTokens(tokens, opt.walkTokens);
    return Parser.parseInline(tokens, opt);
  } catch (e) {
    handleError(e, opt);
  }
};

marked.Parser = Parser;
marked.parser = Parser.parse;

marked.Renderer = Renderer;
marked.TextRenderer = TextRenderer;

marked.Lexer = Lexer;
marked.lexer = Lexer.lex;

marked.Tokenizer = Tokenizer;

marked.Slugger = Slugger;

marked.parse = marked;

module.exports = marked;
