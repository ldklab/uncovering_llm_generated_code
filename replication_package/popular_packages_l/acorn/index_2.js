// acorn.js

class SyntaxError extends Error {
  constructor(message, pos, loc) {
    super(message);
    this.pos = pos;
    this.loc = loc;
  }
}

class Parser {
  static Options = {
    ecmaVersion: 2020,
    sourceType: "script",
  };

  static parse(input, options = {}) {
    const opts = { ...Parser.Options, ...options };
    console.log(`Parsing with ECMAScript version ${opts.ecmaVersion}...`);
    if (input.includes("error")) {
      throw new SyntaxError("Unexpected token", 5, { line: 1, column: 5 });
    }
    return { type: "Program", body: [{ type: "ExpressionStatement", expression: { type: "Literal", value: 1 } }] };
  }

  static parseExpressionAt(input, offset, options) {
    return this.parse(input.slice(offset), options);
  }

  static tokenizer(input, options) {
    let current = 0;
    const tokens = [];

    while (current < input.length) {
      let char = input[current];

      if (char === ' ') {
        current++;
        continue;
      }

      if (/[a-zA-Z]/.test(char)) {
        let value = '';
        while (/[a-zA-Z]/.test(char)) {
          value += char;
          char = input[++current];
        }
        tokens.push({ type: 'name', value });
        continue;
      }

      if (/\d/.test(char)) {
        let value = '';
        while (/\d/.test(char)) {
          value += char;
          char = input[++current];
        }
        tokens.push({ type: 'number', value });
        continue;
      }

      throw new Error(`Unexpected character: ${char}`);
    }

    tokens.push({ type: 'eof' });
    return {
      getToken: function () {
        return tokens.shift();
      }
    };
  }

  static getLineInfo(input, offset) {
    const lines = input.split('\n');
    let pos = 0;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (pos + line.length >= offset) {
        return { line: i + 1, column: offset - pos };
      }
      pos += line.length + 1;
    }
  }

  static extend(...plugins) {
    class ExtendedParser extends Parser {
      constructor() {
        super();
        plugins.forEach(plugin => plugin(this));
      }
    }
    return ExtendedParser;
  }
}

class Acorn {
  static parse = Parser.parse;
  static parseExpressionAt = Parser.parseExpressionAt;
  static tokenizer = Parser.tokenizer;
  static getLineInfo = Parser.getLineInfo;
  static Parser = Parser;
}

module.exports = Acorn;
