// acorn.js

class SyntaxError extends Error {
  constructor(message, pos, loc) {
    super(message);
    this.pos = pos;
    this.loc = loc;
  }
}

class Parser {
  // Default ECMAScript and source type settings
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
    let currentIndex = 0;
    const tokens = [];

    while (currentIndex < input.length) {
      let currentChar = input[currentIndex];

      if (currentChar === ' ') {
        currentIndex++;
        continue;
      }

      if (/[a-zA-Z]/.test(currentChar)) {
        let identifier = '';
        while (/[a-zA-Z]/.test(currentChar)) {
          identifier += currentChar;
          currentChar = input[++currentIndex];
        }
        tokens.push({ type: 'name', value: identifier });
        continue;
      }

      if (/\d/.test(currentChar)) {
        let numberValue = '';
        while (/\d/.test(currentChar)) {
          numberValue += currentChar;
          currentChar = input[++currentIndex];
        }
        tokens.push({ type: 'number', value: numberValue });
        continue;
      }

      throw new Error(`Unexpected character: ${currentChar}`);
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
    let position = 0;
    for (let lineNumber = 0; lineNumber < lines.length; lineNumber++) {
      const line = lines[lineNumber];
      if (position + line.length >= offset) {
        return { line: lineNumber + 1, column: offset - position };
      }
      position += line.length + 1;
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
