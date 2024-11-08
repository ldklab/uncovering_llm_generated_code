"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = generateFromAST;
exports.CodeGenerator = CodeGenerator;

const SourceMap = require("./source-map").default;
const Printer = require("./printer").default;

class Generator extends Printer {
  constructor(ast, options = {}, code) {
    const formatOptions = configureFormat(code, options);
    const sourceMap = options.sourceMaps ? new SourceMap(options, code) : null;
    super(formatOptions, sourceMap);
    this.ast = ast;
  }

  generate() {
    return super.generate(this.ast);
  }
}

function configureFormat(code, options) {
  const format = {
    auxiliaryCommentBefore: options.auxiliaryCommentBefore,
    auxiliaryCommentAfter: options.auxiliaryCommentAfter,
    shouldPrintComment: options.shouldPrintComment,
    retainLines: options.retainLines,
    retainFunctionParens: options.retainFunctionParens,
    comments: options.comments != null ? options.comments : true,
    compact: options.compact,
    minified: options.minified,
    concise: options.concise,
    indent: {
      adjustMultilineComment: true,
      style: "  ",
      base: 0
    },
    decoratorsBeforeExport: !!options.decoratorsBeforeExport,
    jsescOption: {
      quotes: "double",
      wrap: true,
      ...options.jsescOption
    },
    recordAndTupleSyntaxType: options.recordAndTupleSyntaxType
  };

  format.jsonCompatibleStrings = options.jsonCompatibleStrings;

  if (format.minified) {
    format.compact = true;
    format.shouldPrintComment = format.shouldPrintComment || (() => format.comments);
  } else {
    format.shouldPrintComment = format.shouldPrintComment || ((value) => {
      return format.comments || value.includes("@license") || value.includes("@preserve");
    });
  }

  if (format.compact === "auto") {
    format.compact = code.length > 500000;

    if (format.compact) {
      console.error(`[BABEL] Note: The code generator has deoptimized the styling of ${options.filename} as it exceeds the max of 500KB.`);
    }
  }

  if (format.compact) {
    format.indent.adjustMultilineComment = false;
  }

  return format;
}

class CodeGenerator {
  constructor(ast, options, code) {
    this.generator = new Generator(ast, options, code);
  }

  generate() {
    return this.generator.generate();
  }
}

function generateFromAST(ast, options, code) {
  const generator = new Generator(ast, options, code);
  return generator.generate();
}
