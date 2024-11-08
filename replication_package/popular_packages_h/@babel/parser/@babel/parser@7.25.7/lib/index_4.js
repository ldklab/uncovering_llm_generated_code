'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

const RESERVED_WORDS = new Set(["break", "case", "catch", "continue", "debugger", "default", "do", "else", "finally", "for", "function", "if", "return", "switch", "throw", "try", "var", "const", "while", "with", "new", "this", "super", "class", "extends", "export", "import", "null", "true", "false", "in", "instanceof", "typeof", "void", "delete"]);

class Parser {
  constructor() {
    this.tokens = [];
    this.currentToken = null;
  }
  
  parseProgram() {
    this.nextToken();
    const program = {
      type: "Program",
      body: []
    };
    
    while (!this.isEOF()) {
      program.body.push(this.parseStatement());
    }
    
    return program;
  }

  parseStatement() {
    switch (this.currentToken.type) {
      case 'let':
      case 'const':
      case 'var':
        return this.parseVariableDeclaration();
      case 'function':
        return this.parseFunctionDeclaration();
      case 'if':
        return this.parseIfStatement();
      default:
        return this.parseExpressionStatement();
    }
  }

  parseVariableDeclaration() {
    const declaration = {
      type: "VariableDeclaration",
      declarations: []
    };
    this.nextToken(); // Advance past 'let', 'const', or 'var'
    while (!this.isPunctuation(";")) {
      declaration.declarations.push(this.parseVariableDeclarator());
    }
    this.nextToken(); // Advance past ';'
    return declaration;
  }

  parseVariableDeclarator() {
    const declarator = {
      type: "VariableDeclarator",
      id: this.parseIdentifier()
    };
    this.nextToken(); // Advance past identifier

    if (this.isPunctuation("=")) {
      this.nextToken(); // Advance past '='
      declarator.init = this.parseExpression();
    }

    return declarator;
  }

  parseFunctionDeclaration() {
    this.nextToken(); // Advance past 'function'
    const id = this.parseIdentifier();
    this.nextToken();
    const params = [];
    this.expectPunctuation("(");
    while (!this.isPunctuation(")")) {
      params.push(this.parseIdentifier());
      this.nextToken();
      if (!this.isPunctuation(")")) this.expectPunctuation(",");
    }
    this.expectPunctuation(")");
    const body = this.parseBlockStatement();
    return { type: "FunctionDeclaration", id, params, body };
  }

  parseBlockStatement() {
    this.expectPunctuation("{");
    const body = [];
    while (!this.isPunctuation("}")) {
      body.push(this.parseStatement());
    }
    this.expectPunctuation("}");
    return { type: "BlockStatement", body };
  }

  parseIfStatement() {
    this.nextToken(); // Advance past 'if'
    this.expectPunctuation("(");
    const test = this.parseExpression();
    this.expectPunctuation(")");
    const consequent = this.parseBlockStatement();
    let alternate = null;
    if (this.isKeyword("else")) {
      this.nextToken(); // Advance past 'else'
      alternate = this.parseBlockStatement();
    }
    return { type: "IfStatement", test, consequent, alternate };
  }

  parseExpressionStatement() {
    const expression = this.parseExpression();
    this.expectPunctuation(";");
    return { type: "ExpressionStatement", expression };
  }

  parseExpression() {
    // Simplified single-token expressions
    return { type: "Identifier", name: this.currentToken.value };
  }

  parseIdentifier() {
    if (RESERVED_WORDS.has(this.currentToken.value)) {
      throw new Error(`Unexpected reserved word: ${this.currentToken.value}`);
    }
    return { type: "Identifier", name: this.currentToken.value };
  }

  nextToken() {
    // Move to the next token
    this.currentToken = this.tokens.shift();
  }

  isEOF() {
    return this.currentToken === undefined;
  }

  isKeyword(keyword) {
    return this.currentToken && this.currentToken.type === "keyword" && this.currentToken.value === keyword;
  }

  isPunctuation(punc) {
    return this.currentToken && this.currentToken.type === "punctuation" && this.currentToken.value === punc;
  }

  expectPunctuation(punc) {
    if (!this.isPunctuation(punc)) {
      throw new Error(`Expected punctuation: ${punc}`);
    }
    this.nextToken();
  }
}

exports.Parser = Parser;
