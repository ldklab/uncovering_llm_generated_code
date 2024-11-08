(function(global, factory) {
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    factory(exports);
  } else if (typeof define === 'function' && define.amd) {
    define(['exports'], factory);
  } else {
    global = global || self;
    factory(global.acorn = {});
  }
}(this, function(exports) {
  'use strict';

  // Define reserved words for ECMAScript versions
  const reservedWords = {
    3: "abstract boolean byte char ... volatile",
    5: "class enum extends super const export import",
    6: "enum",
    strict: "implements interface let package private protected ... yield",
    strictBind: "eval arguments"
  };

  // Define keywords for ECMAScript versions
  const ecma5AndLessKeywords = "break case catch continue debugger ... void delete new in this";
  const keywords = {
    5: ecma5AndLessKeywords,
    "5module": `${ecma5AndLessKeywords} export import`,
    6: `${ecma5AndLessKeywords} const class extends export import super`
  };

  const keywordRelationalOperator = /^in(stanceof)?$/;

  const nonASCIIidentifierStartChars = "\xaa\xb5\uba\0xc0-\0xd6\u0d8-\0xf6...";
  const nonASCIIidentifierChars = "\u200c\u200d...";

  const nonASCIIidentifierStart = new RegExp(`[${nonASCIIidentifierStartChars}]`);
  const nonASCIIidentifier = new RegExp(`[${nonASCIIidentifierStartChars}${nonASCIIidentifierChars}]`);
  nonASCIIidentifierStartChars = nonASCIIidentifierChars = null;

  const astralIdentifierStartCodes = [0,11,2,25,2,18,2,1,...];
  const astralIdentifierCodes = [509,0,227,0,150,4,...];

  function isInAstralSet(code, set) {
    let pos = 0x10000;
    for (let i = 0; i < set.length; i += 2) {
      pos += set[i];
      if (pos > code) return false;
      pos += set[i + 1];
      if (pos >= code) return true;
    }
  }

  function isIdentifierStart(code, astral) {
    if (code < 65) return code === 36;
    if (code < 91) return true;
    if (code < 97) return code === 95;
    if (code < 123) return true;
    if (code <= 0xffff) return code >= 0xaa && nonASCIIidentifierStart.test(String.fromCharCode(code));
    if (astral === false) return false;
    return isInAstralSet(code, astralIdentifierStartCodes);
  }

  function isIdentifierChar(code, astral) {
    if (code < 48) return code === 36;
    if (code < 58) return true;
    if (code < 65) return false;
    if (code < 91) return true;
    if (code < 97) return code === 95;
    if (code < 123) return true;
    if (code <= 0xffff) return code >= 0xaa && nonASCIIidentifier.test(String.fromCharCode(code));
    if (astral === false) return false;
    return isInAstralSet(code, astralIdentifierStartCodes) || isInAstralSet(code, astralIdentifierCodes);
  }

  class TokenType {
    constructor(label, conf = {}) {
      this.label = label;
      this.keyword = conf.keyword;
      this.beforeExpr = !!conf.beforeExpr;
      this.startsExpr = !!conf.startsExpr;
      this.isLoop = !!conf.isLoop;
      this.isAssign = !!conf.isAssign;
      this.prefix = !!conf.prefix;
      this.postfix = !!conf.postfix;
      this.binop = conf.binop || null;
      this.updateContext = null;
    }
  }

  function binop(name, prec) {
    return new TokenType(name, {beforeExpr: true, binop: prec});
  }

  const beforeExpr = {beforeExpr: true}, startsExpr = {startsExpr: true};

  const keywords$1 = {};

  function kw(name, options = {}) {
    options.keyword = name;
    return keywords$1[name] = new TokenType(name, options);
  }

  const types = {
    num: new TokenType("num", startsExpr),
    regexp: new TokenType("regexp", startsExpr),
    string: new TokenType("string", startsExpr),
    name: new TokenType("name", startsExpr),
    eof: new TokenType("eof"),
    bracketL: new TokenType("[", {beforeExpr: true, startsExpr: true}),
    bracketR: new TokenType("]"),
    braceL: new TokenType("{", {beforeExpr: true, startsExpr: true}),
    braceR: new TokenType("}"),
    parenL: new TokenType("(", {beforeExpr: true, startsExpr: true}),
    parenR: new TokenType(")"),
    comma: new TokenType(",", beforeExpr),
    semi: new TokenType(";", beforeExpr),
    colon: new TokenType(":", beforeExpr),
    dot: new TokenType("."),
    question: new TokenType("?", beforeExpr),
    arrow: new TokenType("=>", beforeExpr),
    template: new TokenType("template"),
    invalidTemplate: new TokenType("invalidTemplate"),
    ellipsis: new TokenType("...", beforeExpr),
    backQuote: new TokenType("`", startsExpr),
    dollarBraceL: new TokenType("${", {beforeExpr: true, startsExpr: true}),
    eq: new TokenType("=", {beforeExpr: true, isAssign: true}),
    assign: new TokenType("_=", {beforeExpr: true, isAssign: true}),
    incDec: new TokenType("++/--", {prefix: true, postfix: true, startsExpr: true}),
    prefix: new TokenType("!/~", {beforeExpr: true, prefix: true, startsExpr: true}),
    logicalOR: binop("||", 1),
    logicalAND: binop("&&", 2),
    bitwiseOR: binop("|", 3),
    bitwiseXOR: binop("^", 4),
    bitwiseAND: binop("&", 5),
    equality: binop("==/!=/===/!==", 6),
    relational: binop("</>/<=/>=", 7),
    bitShift: binop("<</>>/>>>", 8),
    plusMin: new TokenType("+/-", {beforeExpr: true, binop: 9, prefix: true, startsExpr: true}),
    modulo: binop("%", 10),
    star: binop("*", 10),
    slash: binop("/", 10),
    starstar: new TokenType("**", {beforeExpr: true}),
    _break: kw("break"),
    _case: kw("case", beforeExpr),
    _catch: kw("catch"),
    _continue: kw("continue"),
    _debugger: kw("debugger"),
    _default: kw("default", beforeExpr),
    _do: kw("do", {isLoop: true, beforeExpr: true}),
    _else: kw("else", beforeExpr),
    _finally: kw("finally"),
    _for: kw("for", {isLoop: true}),
    _function: kw("function", startsExpr),
    _if: kw("if"),
    _return: kw("return", beforeExpr),
    _switch: kw("switch"),
    _throw: kw("throw", beforeExpr),
    _try: kw("try"),
    _var: kw("var"),
    _const: kw("const"),
    _while: kw("while", {isLoop: true}),
    _with: kw("with"),
    _new: kw("new", {beforeExpr: true, startsExpr: true}),
    _this: kw("this", startsExpr),
    _super: kw("super", startsExpr),
    _class: kw("class", startsExpr),
    _extends: kw("extends", beforeExpr),
    _export: kw("export"),
    _import: kw("import", startsExpr),
    _null: kw("null", startsExpr),
    _true: kw("true", startsExpr),
    _false: kw("false", startsExpr),
    _in: kw("in", {beforeExpr: true, binop: 7}),
    _instanceof: kw("instanceof", {beforeExpr: true, binop: 7}),
    _typeof: kw("typeof", {beforeExpr: true, prefix: true, startsExpr: true}),
    _void: kw("void", {beforeExpr: true, prefix: true, startsExpr: true}),
    _delete: kw("delete", {beforeExpr: true, prefix: true, startsExpr: true})
  };

  const lineBreak = /\r\n?|\n|\u2028|\u2029/;
  const lineBreakG = new RegExp(lineBreak.source, "g");

  function isNewLine(code, ecma2019String) {
    return code === 10 || code === 13 || (!ecma2019String && (code === 0x2028 || code === 0x2029));
  }

  const nonASCIIwhitespace = /[\u1680\u2000-\u200a\u202f\u205f\u3000\ufeff]/;
  const skipWhiteSpace = /(?:\s|\/\/.*|\/\*[^]*?\*\/)*/g;

  const { hasOwnProperty, toString } = Object.prototype;

  function has(obj, propName) {
    return hasOwnProperty.call(obj, propName);
  }

  const isArray = Array.isArray || (obj => toString.call(obj) === "[object Array]");

  function wordsRegexp(words) {
    return new RegExp(`^(?:${words.replace(/ /g, "|")})$`);
  }

  const Position = function(line, col) {
    this.line = line;
    this.column = col;
  };

  Position.prototype.offset = function(n) {
    return new Position(this.line, this.column + n);
  };

  const SourceLocation = function(p, start, end) {
    this.start = start;
    this.end = end;
    if (p.sourceFile !== null) this.source = p.sourceFile;
  };

  function getLineInfo(input, offset) {
    for (let line = 1, cur = 0;;) {
      lineBreakG.lastIndex = cur;
      const match = lineBreakG.exec(input);
      if (match && match.index < offset) {
        ++line;
        cur = match.index + match[0].length;
      } else {
        return new Position(line, offset - cur);
      }
    }
  }

  const defaultOptions = {
    ecmaVersion: 9,
    sourceType: "script",
    onInsertedSemicolon: null,
    onTrailingComma: null,
    allowReserved: null,
    allowReturnOutsideFunction: false,
    allowImportExportEverywhere: false,
    allowAwaitOutsideFunction: false,
    allowHashBang: false,
    locations: false,
    onToken: null,
    onComment: null,
    ranges: false,
    program: null,
    sourceFile: null,
    directSourceFile: null,
    preserveParens: false
  };

  function getOptions(opts) {
    const options = {};

    for (let opt in defaultOptions) {
      options[opt] = opts && has(opts, opt) ? opts[opt] : defaultOptions[opt];
    }

    if (options.ecmaVersion >= 2015) {
      options.ecmaVersion -= 2009;
    }

    if (options.allowReserved == null) {
      options.allowReserved = options.ecmaVersion < 5;
    }

    if (isArray(options.onToken)) {
      const tokens = options.onToken;
      options.onToken = token => tokens.push(token);
    }
    if (isArray(options.onComment)) {
      options.onComment = pushComment(options, options.onComment);
    }

    return options;
  }

  function pushComment(options, array) {
    return function(block, text, start, end, startLoc, endLoc) {
      const comment = {
        type: block ? "Block" : "Line",
        value: text,
        start: start,
        end: end
      };
      if (options.locations) comment.loc = new SourceLocation(this, startLoc, endLoc);
      if (options.ranges) comment.range = [start, end];
      array.push(comment);
    };
  }

  const SCOPE_TOP = 1,
      SCOPE_FUNCTION = 2,
      SCOPE_VAR = SCOPE_TOP | SCOPE_FUNCTION,
      SCOPE_ASYNC = 4,
      SCOPE_GENERATOR = 8,
      SCOPE_ARROW = 16,
      SCOPE_SIMPLE_CATCH = 32,
      SCOPE_SUPER = 64,
      SCOPE_DIRECT_SUPER = 128;

  function functionFlags(async, generator) {
    return SCOPE_FUNCTION | (async ? SCOPE_ASYNC : 0) | (generator ? SCOPE_GENERATOR : 0);
  }

  const BIND_NONE = 0,
      BIND_VAR = 1,
      BIND_LEXICAL = 2,
      BIND_FUNCTION = 3,
      BIND_SIMPLE_CATCH = 4,
      BIND_OUTSIDE = 5;

  class Parser {
    constructor(options, input, startPos) {
      this.options = options = getOptions(options);
      this.sourceFile = options.sourceFile;
      this.keywords = wordsRegexp(keywords[options.ecmaVersion >= 6 ? 6 : options.sourceType === "module" ? "5module" : 5]);
      let reserved = "";
      if (options.allowReserved !== true) {
        for (let v = options.ecmaVersion;; v--)
          if (reserved = reservedWords[v]) break;
        if (options.sourceType === "module") reserved += " await";
      }
      this.reservedWords = wordsRegexp(reserved);
      const reservedStrict = (reserved ? reserved + " " : "") + reservedWords.strict;
      this.reservedWordsStrict = wordsRegexp(reservedStrict);
      this.reservedWordsStrictBind = wordsRegexp(reservedStrict + " " + reservedWords.strictBind);
      this.input = String(input);

      this.containsEsc = false;

      if (startPos) {
        this.pos = startPos;
        this.lineStart = this.input.lastIndexOf("\n", startPos - 1) + 1;
        this.curLine = this.input.slice(0, this.lineStart).split(lineBreak).length;
      } else {
        this.pos = this.lineStart = 0;
        this.curLine = 1;
      }

      this.type = types.eof;
      this.value = null;
      this.start = this.end = this.pos;
      this.startLoc = this.endLoc = this.curPosition();

      this.lastTokEndLoc = this.lastTokStartLoc = null;
      this.lastTokStart = this.lastTokEnd = this.pos;

      this.context = this.initialContext();
      this.exprAllowed = true;

      this.inModule = options.sourceType === "module";
      this.strict = this.inModule || this.strictDirective(this.pos);

      this.potentialArrowAt = -1;

      this.yieldPos = this.awaitPos = this.awaitIdentPos = 0;
      this.labels = [];
      this.undefinedExports = {};

      if (this.pos === 0 && options.allowHashBang && this.input.slice(0, 2) === "#!")
        this.skipLineComment(2);

      this.scopeStack = [];
      this.enterScope(SCOPE_TOP);

      this.regexpState = null;
    }

    parse() {
      const node = this.options.program || this.startNode();
      this.nextToken();
      return this.parseTopLevel(node);
    }

    static extend(...plugins) {
      let cls = this;
      for (let i = 0; i < plugins.length; i++) cls = plugins[i](cls);
      return cls;
    }

    static parse(input, options) {
      return new this(options, input).parse();
    }

    static parseExpressionAt(input, pos, options) {
      const parser = new this(options, input, pos);
      parser.nextToken();
      return parser.parseExpression();
    }

    static tokenizer(input, options) {
      return new this(options, input);
    }

    parseTopLevel(node) {
      const exports = {};
      if (!node.body) node.body = [];
      while (this.type !== types.eof) {
        const stmt = this.parseStatement(null, true, exports);
        node.body.push(stmt);
      }
      if (this.inModule)
        Object.keys(this.undefinedExports).forEach(name => {
          this.raiseRecoverable(this.undefinedExports[name].start, `Export '${name}' is not defined`);
        });
      this.adaptDirectivePrologue(node.body);
      this.next();
      node.sourceType = this.options.sourceType;
      return this.finishNode(node, "Program");
    }

    isLet(context) {
      if (this.options.ecmaVersion < 6 || !this.isContextual("let")) return false;
      skipWhiteSpace.lastIndex = this.pos;
      const skip = skipWhiteSpace.exec(this.input);
      const next = this.pos + skip[0].length, nextCh = this.input.charCodeAt(next);
      if (nextCh === 91) return true;
      if (context) return false;
      if (nextCh === 123) return true;
      if (isIdentifierStart(nextCh, true)) {
        let pos = next + 1;
        while (isIdentifierChar(this.input.charCodeAt(pos), true)) ++pos;
        const ident = this.input.slice(next, pos);
        if (!keywordRelationalOperator.test(ident)) return true;
      }
      return false;
    }

    isAsyncFunction() {
      if (this.options.ecmaVersion < 8 || !this.isContextual("async"))
        return false;
      skipWhiteSpace.lastIndex = this.pos;
      const skip = skipWhiteSpace.exec(this.input);
      const next = this.pos + skip[0].length;
      return !lineBreak.test(this.input.slice(this.pos, next)) &&
        this.input.slice(next, next + 8) === "function" &&
        (next + 8 === this.input.length || !isIdentifierChar(this.input.charAt(next + 8)));
    }

    parseStatement(context, topLevel, exports) {
      let starttype = this.type, node = this.startNode(), kind;

      if (this.isLet(context)) {
        starttype = types._var;
        kind = "let";
      }

      switch (starttype) {
      case types._break: case types._continue: return this.parseBreakContinueStatement(node, starttype.keyword);
      case types._debugger: return this.parseDebuggerStatement(node);
      case types._do: return this.parseDoStatement(node);
      case types._for: return this.parseForStatement(node);
      case types._function:
        if ((context && (this.strict || context !== "if" && context !== "label")) && this.options.ecmaVersion >= 6) this.unexpected();
        return this.parseFunctionStatement(node, false, !context);
      case types._class:
        if (context) this.unexpected();
        return this.parseClass(node, true);
      case types._if: return this.parseIfStatement(node);
      case types._return: return this.parseReturnStatement(node);
      case types._switch: return this.parseSwitchStatement(node);
      case types._throw: return this.parseThrowStatement(node);
      case types._try: return this.parseTryStatement(node);
      case types._const: case types._var:
        kind = kind || this.value;
        if (context && kind !== "var") this.unexpected();
        return this.parseVarStatement(node, kind);
      case types._while: return this.parseWhileStatement(node);
      case types._with: return this.parseWithStatement(node);
      case types.braceL: return this.parseBlock(true, node);
      case types.semi: return this.parseEmptyStatement(node);
      case types._export:
      case types._import:
        if (this.options.ecmaVersion > 10 && starttype === types._import) {
          skipWhiteSpace.lastIndex = this.pos;
          const skip = skipWhiteSpace.exec(this.input);
          const next = this.pos + skip[0].length, nextCh = this.input.charCodeAt(next);
          if (nextCh === 40) return this.parseExpressionStatement(node, this.parseExpression());
        }

        if (!this.options.allowImportExportEverywhere) {
          if (!topLevel)
            this.raise(this.start, "'import' and 'export' may only appear at the top level");
          if (!this.inModule)
            this.raise(this.start, "'import' and 'export' may appear only with 'sourceType: module'");
        }
        return starttype === types._import ? this.parseImport(node) : this.parseExport(node, exports);
      default:
        if (this.isAsyncFunction()) {
          if (context) this.unexpected();
          this.next();
          return this.parseFunctionStatement(node, true, !context);
        }

        const maybeName = this.value, expr = this.parseExpression();
        if (starttype === types.name && expr.type === "Identifier" && this.eat(types.colon))
          return this.parseLabeledStatement(node, maybeName, expr, context);
        else return this.parseExpressionStatement(node, expr);
      }
    }

    parseBreakContinueStatement(node, keyword) {
      const isBreak = keyword === "break";
      this.next();
      if (this.eat(types.semi) || this.insertSemicolon()) node.label = null;
      else if (this.type !== types.name) this.unexpected();
      else {
        node.label = this.parseIdent();
        this.semicolon();
      }

      let i = 0;
      for (; i < this.labels.length; ++i) {
        const lab = this.labels[i];
        if (node.label == null || lab.name === node.label.name) {
          if (lab.kind != null && (isBreak || lab.kind === "loop")) break;
          if (node.label && isBreak) break;
        }
      }
      if (i === this.labels.length) this.raise(node.start, `Unsyntactic ${keyword}`);
      return this.finishNode(node, isBreak ? "BreakStatement" : "ContinueStatement");
    }

    parseDebuggerStatement(node) {
      this.next();
      this.semicolon();
      return this.finishNode(node, "DebuggerStatement");
    }

    parseDoStatement(node) {
      this.next();
      this.labels.push(loopLabel);
      node.body = this.parseStatement("do");
      this.labels.pop();
      this.expect(types._while);
      node.test = this.parseParenExpression();
      if (this.options.ecmaVersion >= 6)
        this.eat(types.semi);
      else
        this.semicolon();
      return this.finishNode(node, "DoWhileStatement");
    }

    parseForStatement(node) {
      this.next();
      const awaitAt = (this.options.ecmaVersion >= 9 && (this.inAsync || (!this.inFunction && this.options.allowAwaitOutsideFunction)) && this.eatContextual("await")) ? this.lastTokStart : -1;
      this.labels.push(loopLabel);
      this.enterScope(0);
      this.expect(types.parenL);
      if (this.type === types.semi) {
        if (awaitAt > -1) this.unexpected(awaitAt);
        return this.parseFor(node, null);
      }
      const isLet = this.isLet();
      if (this.type === types._var || this.type === types._const || isLet) {
        const init$1 = this.startNode(), kind = isLet ? "let" : this.value;
        this.next();
        this.parseVar(init$1, true, kind);
        this.finishNode(init$1, "VariableDeclaration");
        if ((this.type === types._in || (this.options.ecmaVersion >= 6 && this.isContextual("of"))) && init$1.declarations.length === 1) {
          if (this.options.ecmaVersion >= 9) {
            if (this.type === types._in) {
              if (awaitAt > -1) this.unexpected(awaitAt);
            } else node.await = awaitAt > -1;
          }
          return this.parseForIn(node, init$1);
        }
        if (awaitAt > -1) this.unexpected(awaitAt);
        return this.parseFor(node, init$1);
      }
      const refDestructuringErrors = new DestructuringErrors;
      const init = this.parseExpression(true, refDestructuringErrors);
      if (this.type === types._in || (this.options.ecmaVersion >= 6 && this.isContextual("of"))) {
        if (this.options.ecmaVersion >= 9) {
          if (this.type === types._in) {
            if (awaitAt > -1) this.unexpected(awaitAt);
          } else node.await = awaitAt > -1;
        }
        this.toAssignable(init, false, refDestructuringErrors);
        this.checkLVal(init);
        return this.parseForIn(node, init);
      } else {
        this.checkExpressionErrors(refDestructuringErrors, true);
      }
      if (awaitAt > -1) this.unexpected(awaitAt);
      return this.parseFor(node, init);
    }

    parseFunctionStatement(node, isAsync, declarationPosition) {
      this.next();
      return this.parseFunction(node, FUNC_STATEMENT | (declarationPosition ? 0 : FUNC_HANGING_STATEMENT), false, isAsync);
    }

    parseIfStatement(node) {
      this.next();
      node.test = this.parseParenExpression();
      node.consequent = this.parseStatement("if");
      node.alternate = this.eat(types._else) ? this.parseStatement("if") : null;
      return this.finishNode(node, "IfStatement");
    }

    parseReturnStatement(node) {
      if (!this.inFunction && !this.options.allowReturnOutsideFunction)
        this.raise(this.start, "'return' outside of function");
      this.next();

      if (this.eat(types.semi) || this.insertSemicolon()) node.argument = null;
      else { node.argument = this.parseExpression(); this.semicolon(); }
      return this.finishNode(node, "ReturnStatement");
    }

    parseSwitchStatement(node) {
      this.next();
      node.discriminant = this.parseParenExpression();
      node.cases = [];
      this.expect(types.braceL);
      this.labels.push(switchLabel);
      this.enterScope(0);

      let cur;
      for (let sawDefault = false; this.type !== types.braceR;) {
        if (this.type === types._case || this.type === types._default) {
          const isCase = this.type === types._case;
          if (cur) this.finishNode(cur, "SwitchCase");
          node.cases.push(cur = this.startNode());
          cur.consequent = [];
          this.next();
          if (isCase) {
            cur.test = this.parseExpression();
          } else {
            if (sawDefault) this.raiseRecoverable(this.lastTokStart, "Multiple default clauses");
            sawDefault = true;
            cur.test = null;
          }
          this.expect(types.colon);
        } else {
          if (!cur) this.unexpected();
          cur.consequent.push(this.parseStatement(null));
        }
      }
      this.exitScope();
      if (cur) this.finishNode(cur, "SwitchCase");
      this.next(); // Closing brace
      this.labels.pop();
      return this.finishNode(node, "SwitchStatement");
    }

    parseThrowStatement(node) {
      this.next();
      if (lineBreak.test(this.input.slice(this.lastTokEnd, this.start)))
        this.raise(this.lastTokEnd, "Illegal newline after throw");
      node.argument = this.parseExpression();
      this.semicolon();
      return this.finishNode(node, "ThrowStatement");
    }

    static parseTopLevel(node) {
      const exports = {};
      if (!node.body) node.body = [];
      while (this.type !== types.eof) {
        const stmt = this.parseStatement(null, true, exports);
        node.body.push(stmt);
      }
      if (this.inModule)
        Object.keys(this.undefinedExports).forEach(name => {
          this.raiseRecoverable(this.undefinedExports[name].start, `Export '${name}' is not defined`);
        });
      this.adaptDirectivePrologue(node.body);
      this.next();
      node.sourceType = this.options.sourceType;
      return this.finishNode(node, "Program");
    }

    static parseExpression(noIn, refDestructuringErrors) {
      const startPos = this.start, startLoc = this.startLoc;
      let expr = this.parseMaybeAssign(noIn, refDestructuringErrors);
      if (this.type === types.comma) {
        const node = this.startNodeAt(startPos, startLoc);
        node.expressions = [expr];
        while (this.eat(types.comma)) node.expressions.push(this.parseMaybeAssign(noIn, refDestructuringErrors));
        return this.finishNode(node, "SequenceExpression");
      }
      return expr;
    }

    parseWhileStatement(node) {
      this.next();
      node.test = this.parseParenExpression();
      this.labels.push(loopLabel);
      node.body = this.parseStatement("while");
      this.labels.pop();
      return this.finishNode(node, "WhileStatement");
    }

    parseWithStatement(node) {
      if (this.strict) this.raise(this.start, "'with' in strict mode");
      this.next();
      node.object = this.parseParenExpression();
      node.body = this.parseStatement("with");
      return this.finishNode(node, "WithStatement");
    }

    parseEmptyStatement(node) {
      this.next();
      return this.finishNode(node, "EmptyStatement");
    }

    parseExpressionStatement(node, expr) {
      node.expression = expr;
      this.semicolon();
      return this.finishNode(node, "ExpressionStatement");
    }

    parseVarStatement(node, kind) {
      this.next();
      this.parseVar(node, false, kind);
      this.semicolon();
      return this.finishNode(node, "VariableDeclaration");
    }

    parseBlock(createNewLexicalScope = true, node = this.startNode()) {
      node.body = [];
      this.expect(types.braceL);
      if (createNewLexicalScope) this.enterScope(0);
      while (!this.eat(types.braceR)) {
        const stmt = this.parseStatement(null);
        node.body.push(stmt);
      }
      if (createNewLexicalScope) this.exitScope();
      return this.finishNode(node, "BlockStatement");
    }

    parseLabeledStatement(node, maybeName, expr, context) {
      for (let i = 0, list = this.labels; i < list.length; i++) {
        const label = list[i];
        if (label.name === maybeName)
          this.raise(expr.start, `Label '${maybeName}' is already declared`);
      }
      const kind = this.type.isLoop ? "loop" : this.type === types._switch ? "switch" : null;
      for (let i = this.labels.length - 1; i >= 0; i--) {
        const label = this.labels[i];
        if (label.statementStart === node.start) {
          label.statementStart = this.start;
          label.kind = kind;
        } else break;
      }
      this.labels.push({name: maybeName, kind, statementStart: this.start});
      node.body = this.parseStatement(context ? context.indexOf("label") === -1 ? `${context}label` : context : "label");
      this.labels.pop();
      node.label = expr;
      return this.finishNode(node, "LabeledStatement");
    }
  }

  class DestructuringErrors {
    constructor() {
      this.shorthandAssign =
      this.trailingComma =
      this.parenthesizedAssign =
      this.parenthesizedBind =
      this.doubleProto =
        -1;
    }
  }

  Parser.prototype.checkPatternErrors = function(refDestructuringErrors, isAssign) {
    if (!refDestructuringErrors) return;
    if (refDestructuringErrors.trailingComma > -1)
      this.raiseRecoverable(refDestructuringErrors.trailingComma, "Comma is not permitted after the rest element");
    const parens = isAssign ? refDestructuringErrors.parenthesizedAssign : refDestructuringErrors.parenthesizedBind;
    if (parens > -1) this.raiseRecoverable(parens, "Parenthesized pattern");
  };

  Parser.prototype.checkExpressionErrors = function(refDestructuringErrors, andThrow) {
    if (!refDestructuringErrors) return false;
    const shorthandAssign = refDestructuringErrors.shorthandAssign;
    const doubleProto = refDestructuringErrors.doubleProto;
    if (!andThrow) return shorthandAssign >= 0 || doubleProto >= 0;
    if (shorthandAssign >= 0)
      this.raise(shorthandAssign, "Shorthand property assignments are valid only in destructuring patterns");
    if (doubleProto >= 0)
      this.raiseRecoverable(doubleProto, "Redefinition of __proto__ property");
  };

  Parser.prototype.checkYieldAwaitInDefaultParams = function() {
    if (this.yieldPos && (!this.awaitPos || this.yieldPos < this.awaitPos))
      this.raise(this.yieldPos, "Yield expression cannot be a default value");
    if (this.awaitPos)
      this.raise(this.awaitPos, "Await expression cannot be a default value");
  };

  Parser.prototype.isSimpleAssignTarget = function(expr) {
    if (expr.type === "ParenthesizedExpression")
      return this.isSimpleAssignTarget(expr.expression);
    return expr.type === "Identifier" || expr.type === "MemberExpression";
  };

  Parser.prototype.toAssignable = function(node, isBinding, refDestructuringErrors) {
    if (this.options.ecmaVersion >= 6 && node) {
      switch (node.type) {
      case "Identifier":
        if (this.inAsync && node.name === "await")
          this.raise(node.start, "Cannot use 'await' as identifier inside an async function");
        break;
      case "ObjectPattern":
      case "ArrayPattern":
      case "RestElement":
        break;
      case "ObjectExpression":
        node.type = "ObjectPattern";
        if (refDestructuringErrors) this.checkPatternErrors(refDestructuringErrors, true);
        node.properties.forEach(prop => this.toAssignable(prop, isBinding));
        break;
      case "Property":
        if (node.kind !== "init") this.raise(node.key.start, "Object pattern can't contain getter or setter");
        this.toAssignable(node.value, isBinding);
        break;
      case "ArrayExpression":
        node.type = "ArrayPattern";
        if (refDestructuringErrors) this.checkPatternErrors(refDestructuringErrors, true);
        this.toAssignableList(node.elements, isBinding);
        break;
      case "SpreadElement":
        node.type = "RestElement";
        this.toAssignable(node.argument, isBinding);
        break;
      case "AssignmentExpression":
        if (node.operator !== "=") this.raise(node.left.end, "Only '=' operator can be used for specifying default value.");
        node.type = "AssignmentPattern";
        delete node.operator;
        this.toAssignable(node.left, isBinding);
        break;
      case "AssignmentPattern":
        break;
      case "ParenthesizedExpression":
        this.toAssignable(node.expression, isBinding, refDestructuringErrors);
        break;
      case "MemberExpression":
        if (!isBinding) break;
      default:
        this.raise(node.start, "Assigning to rvalue");
      }
    } else if (refDestructuringErrors) this.checkPatternErrors(refDestructuringErrors, true);
    return node;
  };

  Parser.prototype.toAssignableList = function(exprList, isBinding) {
    const end = exprList.length;
    for (let i = 0; i < end; i++) {
      const elt = exprList[i];
      if (elt) this.toAssignable(elt, isBinding);
    }
    if (end) {
      const last = exprList[end - 1];
      if (this.options.ecmaVersion === 6 && isBinding && last && last.type === "RestElement" && last.argument.type !== "Identifier")
        this.unexpected(last.argument.start);
    }
    return exprList;
  };

  Parser.prototype.parseSpread = function(refDestructuringErrors) {
    const node = this.startNode();
    this.next();
    node.argument = this.parseMaybeAssign(false, refDestructuringErrors);
    return this.finishNode(node, "SpreadElement");
  };

  Parser.prototype.parseRestBinding = function() {
    const node = this.startNode();
    this.next();
    if (this.options.ecmaVersion === 6 && this.type !== types.name)
      this.unexpected();
    node.argument = this.parseBindingAtom();
    return this.finishNode(node, "RestElement");
  };

  Parser.prototype.parseBindingAtom = function() {
    if (this.options.ecmaVersion >= 6) {
      switch (this.type) {
      case types.bracketL:
        const arrayNode = this.startNode();
        this.next();
        arrayNode.elements = this.parseBindingList(types.bracketR, true, true);
        return this.finishNode(arrayNode, "ArrayPattern");
      case types.braceL:
        return this.parseObj(true);
      }
    }
    return this.parseIdent();
  };

  Parser.prototype.parseBindingList = function(close, allowEmpty, allowTrailingComma) {
    const elts = [], first = true;
    while (!this.eat(close)) {
      if (first) first = false;
      else this.expect(types.comma);
      if (allowEmpty && this.type === types.comma) {
        elts.push(null);
      } else if (allowTrailingComma && this.afterTrailingComma(close)) {
        break;
      } else if (this.type === types.ellipsis) {
        const rest = this.parseRestBinding();
        this.parseBindingListItem(rest);
        elts.push(rest);
        if (this.type === types.comma) this.raise(this.start, "Comma is not permitted after the rest element");
        this.expect(close);
        break;
      } else {
        const elem = this.parseMaybeDefault(this.start, this.startLoc);
        this.parseBindingListItem(elem);
        elts.push(elem);
      }
    }
    return elts;
  };

  Parser.prototype.parseBindingListItem = function(param) {
    return param;
  };

  Parser.prototype.parseMaybeDefault = function(startPos, startLoc, left) {
    left = left || this.parseBindingAtom();
    if (this.options.ecmaVersion < 6 || !this.eat(types.eq)) return left;
    const node = this.startNodeAt(startPos, startLoc);
    node.left = left;
    node.right = this.parseMaybeAssign();
    return this.finishNode(node, "AssignmentPattern");
  };

  Parser.prototype.checkLVal = function(expr, bindingType = BIND_NONE, checkClashes) {
    switch (expr.type) {
    case "Identifier":
      if (bindingType === BIND_LEXICAL && expr.name === "let")
        this.raiseRecoverable(expr.start, "let is disallowed as a lexically bound name");
      if (this.strict && this.reservedWordsStrictBind.test(expr.name))
        this.raiseRecoverable(expr.start, `${bindingType ? "Binding" : "Assigning to"} ${expr.name} in strict mode`);
      if (checkClashes) {
        if (has(checkClashes, expr.name))
          this.raiseRecoverable(expr.start, "Argument name clash");
        checkClashes[expr.name] = true;
      }
      if (bindingType !== BIND_NONE && bindingType !== BIND_OUTSIDE) this.declareName(expr.name, bindingType, expr.start);
      break;
    case "MemberExpression":
      if (bindingType) this.raiseRecoverable(expr.start, "Binding member expression");
      break;
    case "ObjectPattern":
      expr.properties.forEach(prop => this.checkLVal(prop, bindingType, checkClashes));
      break;
    case "Property":
      this.checkLVal(expr.value, bindingType, checkClashes);
      break;
    case "ArrayPattern":
      expr.elements.forEach(elem => {
        if (elem) this.checkLVal(elem, bindingType, checkClashes);
      });
      break;
    case "AssignmentPattern":
      this.checkLVal(expr.left, bindingType, checkClashes);
      break;
    case "RestElement":
      this.checkLVal(expr.argument, bindingType, checkClashes);
      break;
    case "ParenthesizedExpression":
      this.checkLVal(expr.expression, bindingType, checkClashes);
      break;
    default:
      this.raise(expr.start, `${bindingType ? "Binding" : "Assigning to"} rvalue`);
    }
  };

  Parser.prototype.checkPropClash = function(prop, propHash, refDestructuringErrors) {
    if (this.options.ecmaVersion >= 9 && prop.type === "SpreadElement")
      return;
    if (this.options.ecmaVersion >= 6 && (prop.computed || prop.method || prop.shorthand))
      return;
    const key = prop.key;
    let name;
    switch (key.type) {
    case "Identifier": name = key.name; break;
    case "Literal": name = String(key.value); break;
    default: return;
    }
    const kind = prop.kind;
    if (this.options.ecmaVersion >= 6) {
      if (name === "__proto__" && kind === "init") {
        if (propHash.proto) {
          if (refDestructuringErrors && refDestructuringErrors.doubleProto < 0) refDestructuringErrors.doubleProto = key.start;
          else this.raiseRecoverable(key.start, "Redefinition of __proto__ property");
        }
        propHash.proto = true;
      }
      return;
    }
    name = `$${name}`;
    let other = propHash[name];
    if (other) {
      let redefinition;
      if (kind === "init") {
        redefinition = this.strict && other.init || other.get || other.set;
      } else {
        redefinition = other.init || other[kind];
      }
      if (redefinition)
        this.raiseRecoverable(key.start, "Redefinition of property");
    } else {
      other = propHash[name] = {
        init: false,
        get: false,
        set: false
      };
    }
    other[kind] = true;
  };

  Parser.prototype.parseExpression = function(noIn, refDestructuringErrors) {
    const startPos = this.start, startLoc = this.startLoc;
    let expr = this.parseMaybeAssign(noIn, refDestructuringErrors);
    if (this.type === types.comma) {
      const node = this.startNodeAt(startPos, startLoc);
      node.expressions = [expr];
      while (this.eat(types.comma)) node.expressions.push(this.parseMaybeAssign(noIn, refDestructuringErrors));
      return this.finishNode(node, "SequenceExpression");
    }
    return expr;
  };

  Parser.prototype.parseMaybeAssign = function(noIn, refDestructuringErrors, afterLeftParse) {
    if (this.isContextual("yield")) {
      if (this.inGenerator) return this.parseYield(noIn);
      else this.exprAllowed = false;
    }

    let ownDestructuringErrors = false, oldParenAssign = -1, oldTrailingComma = -1, oldShorthandAssign = -1;
    if (refDestructuringErrors) {
      oldParenAssign = refDestructuringErrors.parenthesizedAssign;
      oldTrailingComma = refDestructuringErrors.trailingComma;
      oldShorthandAssign = refDestructuringErrors.shorthandAssign;
      refDestructuringErrors.parenthesizedAssign = refDestructuringErrors.trailingComma = refDestructuringErrors.shorthandAssign = -1;
    } else {
      refDestructuringErrors = new DestructuringErrors;
      ownDestructuringErrors = true;
    }

    const startPos = this.start, startLoc = this.startLoc;
    if (this.type === types.parenL || this.type === types.name)
      this.potentialArrowAt = this.start;
    let left = this.parseMaybeConditional(noIn, refDestructuringErrors);
    if (afterLeftParse) left = afterLeftParse.call(this, left, startPos, startLoc);
    if (this.type.isAssign) {
      const node = this.startNodeAt(startPos, startLoc);
      node.operator = this.value;
      node.left = this.type === types.eq ? this.toAssignable(left, false, refDestructuringErrors) : left;
      if (!ownDestructuringErrors) Object.assign(refDestructuringErrors, new DestructuringErrors());
      refDestructuringErrors.shorthandAssign = -1; 
      this.checkLVal(left);
      this.next();
      node.right = this.parseMaybeAssign(noIn);
      return this.finishNode(node, "AssignmentExpression");
    } else {
      if (ownDestructuringErrors) this.checkExpressionErrors(refDestructuringErrors, true);
    }
    if (oldParenAssign > -1) refDestructuringErrors.parenthesizedAssign = oldParenAssign;
    if (oldTrailingComma > -1) refDestructuringErrors.trailingComma = oldTrailingComma;
    if (oldShorthandAssign > -1) refDestructuringErrors.shorthandAssign = oldShorthandAssign;
    return left;
  };

  // Other methods of the Parser class follow...

  exports.Parser = Parser;
  exports.parse = Parser.parse;
  exports.tokenizer = Parser.tokenizer;
}));
