import * as esprima from 'esprima';

class ModuleLoader {
  constructor() {
    this.modules = {};
  }

  require(moduleId) {
    if (this.modules[moduleId]) {
      return this.modules[moduleId].exports;
    }

    const module = (this.modules[moduleId] = {
      exports: {},
    });

    this.modules[moduleId].code.call(
      module.exports,
      module,
      module.exports,
      this.require.bind(this)
    );

    return module.exports;
  }
}

const moduleLoader = new ModuleLoader();

export function parse(code, options, delegate) {
  // function implementation
}

export function parseModule(code, options, delegate) {
  const parsingOptions = options || {};
  parsingOptions.sourceType = 'module';
  return parse(code, parsingOptions, delegate);
}

export function parseScript(code, options, delegate) {
  const parsingOptions = options || {};
  parsingOptions.sourceType = 'script';
  return parse(code, parsingOptions, delegate);
}

export function tokenize(code, options, delegate) {
  const tokenizer = new esprima.Tokenizer(code, options);
  let tokens = [];
  try {
    while (true) {
      let token = tokenizer.getNextToken();
      if (!token) break;
      if (delegate) {
        token = delegate(token);
      }
      tokens.push(token);
    }
  } catch (e) {
    tokenizer.errorHandler.tolerate(e);
  }
  if (tokenizer.errorHandler.tolerant) {
    tokens.errors = tokenizer.errors();
  }
  return tokens;
}

export const Syntax = esprima.Syntax;
export const version = '4.0.1';
