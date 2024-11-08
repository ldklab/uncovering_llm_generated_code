const Lexer = require('./Lexer.js');
const Parser = require('./Parser.js');
const Tokenizer = require('./Tokenizer.js');
const Renderer = require('./Renderer.js');
const TextRenderer = require('./TextRenderer.js');
const Slugger = require('./Slugger.js');
const { merge, checkSanitizeDeprecation, escape } = require('./helpers.js');
const { getDefaults, changeDefaults, defaults } = require('./defaults.js');

function marked(src, opt, callback) {
  if (typeof src !== 'string') {
    throw new Error(`marked(): Expected string but got ${Object.prototype.toString.call(src)}`);
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

function processAsync(src, opt, callback) {
  const highlight = opt.highlight;
  let tokens;
  try {
    tokens = Lexer.lex(src, opt);
  } catch (e) {
    return callback(e);
  }

  const done = (err) => {
    if (err) return callback(err);
    try {
      const parsedOutput = Parser.parse(tokens, opt);
      return callback(null, parsedOutput);
    } catch (e) {
      return callback(e);
    }
  };

  if (!highlight || highlight.length < 3) return done();

  delete opt.highlight;
  if (!tokens.length) return done();

  let pending = 0;
  marked.walkTokens(tokens, (token) => {
    if (token.type === 'code') {
      pending++;
      setTimeout(() => {
        highlight(token.text, token.lang, (err, code) => {
          if (err) return done(err);
          if (code != null && code !== token.text) {
            token.text = code;
            token.escaped = true;
          }
          pending--;
          if (pending === 0) done();
        });
      }, 0);
    }
  });

  if (pending === 0) done();
}

function processSync(src, opt) {
  try {
    const tokens = Lexer.lex(src, opt);
    if (opt.walkTokens) {
      marked.walkTokens(tokens, opt.walkTokens);
    }
    return Parser.parse(tokens, opt);
  } catch (e) {
    handleError(e, opt);
  }
}

function handleError(e, opt) {
  e.message += '\nPlease report this to https://github.com/markedjs/marked.';
  if (opt.silent) {
    return `<p>An error occurred:</p><pre>${escape(e.message, true)}</pre>`;
  }
  throw e;
}

marked.options =
marked.setOptions = function(opt) {
  merge(marked.defaults, opt);
  changeDefaults(marked.defaults);
  return marked;
};

marked.getDefaults = getDefaults;
marked.defaults = defaults;

marked.use = function(extension) {
  const opts = merge({}, extension);
  applyRendererExtension(extension, opts);
  applyTokenizerExtension(extension, opts);
  applyWalkTokensExtension(extension, opts);
  marked.setOptions(opts);
};

function applyRendererExtension(extension, opts) {
  if (extension.renderer) {
    const renderer = marked.defaults.renderer || new Renderer();
    for (const prop in extension.renderer) {
      const prevRenderer = renderer[prop];
      renderer[prop] = (...args) => {
        let ret = extension.renderer[prop].apply(renderer, args);
        if (ret === false) {
          ret = prevRenderer.apply(renderer, args);
        }
        return ret;
      };
    }
    opts.renderer = renderer;
  }
}

function applyTokenizerExtension(extension, opts) {
  if (extension.tokenizer) {
    const tokenizer = marked.defaults.tokenizer || new Tokenizer();
    for (const prop in extension.tokenizer) {
      const prevTokenizer = tokenizer[prop];
      tokenizer[prop] = (...args) => {
        let ret = extension.tokenizer[prop].apply(tokenizer, args);
        if (ret === false) {
          ret = prevTokenizer.apply(tokenizer, args);
        }
        return ret;
      };
    }
    opts.tokenizer = tokenizer;
  }
}

function applyWalkTokensExtension(extension, opts) {
  if (extension.walkTokens) {
    const walkTokens = marked.defaults.walkTokens;
    opts.walkTokens = (token) => {
      extension.walkTokens(token);
      if (walkTokens) {
        walkTokens(token);
      }
    };
  }
}

marked.walkTokens = function(tokens, callback) {
  for (const token of tokens) {
    callback(token);
    handleTokenType(token, callback);
  }
};

function handleTokenType(token, callback) {
  switch (token.type) {
    case 'table': {
      iterateTableTokens(token, callback);
      break;
    }
    case 'list': {
      marked.walkTokens(token.items, callback);
      break;
    }
    default: {
      if (token.tokens) {
        marked.walkTokens(token.tokens, callback);
      }
    }
  }
}

function iterateTableTokens(token, callback) {
  for (const cell of token.tokens.header) {
    marked.walkTokens(cell, callback);
  }
  for (const row of token.tokens.cells) {
    for (const cell of row) {
      marked.walkTokens(cell, callback);
    }
  }
}

marked.parseInline = function(src, opt) {
  if (typeof src !== 'string') {
    throw new Error(`marked.parseInline(): Expected string but got ${Object.prototype.toString.call(src)}`);
  }

  opt = merge({}, marked.defaults, opt || {});
  checkSanitizeDeprecation(opt);

  try {
    const tokens = Lexer.lexInline(src, opt);
    if (opt.walkTokens) {
      marked.walkTokens(tokens, opt.walkTokens);
    }
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
