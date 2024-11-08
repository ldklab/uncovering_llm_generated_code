"use strict";

import SourceMap from "./source-map";
import Printer from "./printer";

class Generator extends Printer {
  constructor(ast, options = {}, code) {
    const config = normalizeOptions(code, options);
    const sourceMap = options.sourceMaps ? new SourceMap(options, code) : null;
    super(config, sourceMap);
    this.ast = ast;
  }

  generate() {
    return super.generate(this.ast);
  }
}

function normalizeOptions(code, options) {
  const config = {
    auxiliaryCommentBefore: options.auxiliaryCommentBefore,
    auxiliaryCommentAfter: options.auxiliaryCommentAfter,
    shouldPrintComment: options.shouldPrintComment,
    retainLines: options.retainLines,
    retainFunctionParens: options.retainFunctionParens,
    comments: options.comments == null || options.comments,
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
      ...{
        quotes: "double",
        wrap: true
      },
      ...options.jsescOption
    },
    recordAndTupleSyntaxType: options.recordAndTupleSyntaxType,
    jsonCompatibleStrings: options.jsonCompatibleStrings
  };

  if (config.minified) {
    config.compact = true;
    config.shouldPrintComment = config.shouldPrintComment || (() => config.comments);
  } else {
    config.shouldPrintComment = config.shouldPrintComment || (value => config.comments || value.includes("@license") || value.includes("@preserve"));
  }

  if (config.compact === "auto") {
    config.compact = code.length > 500000;
    if (config.compact) {
      console.error(`[BABEL] Note: The code generator has deoptimized the styling of ${options.filename} as it exceeds the max of 500KB.`);
    }
  }

  if (config.compact) {
    config.indent.adjustMultilineComment = false;
  }

  return config;
}

class CodeGenerator {
  constructor(ast, options, code) {
    this.generator = new Generator(ast, options, code);
  }

  generate() {
    return this.generator.generate();
  }
}

export { CodeGenerator };
export default function generateCode(ast, options, code) {
  const generator = new Generator(ast, options, code);
  return generator.generate();
}
