"use strict";

import SourceMap from "./source-map";
import Printer from "./printer";

class Generator extends Printer {
  constructor(ast, opts = {}, code) {
    const format = normalizeOptions(code, opts);
    const map = opts.sourceMaps ? new SourceMap(opts, code) : null;
    super(format, map);
    this.ast = ast;
  }

  generate() {
    return super.generate(this.ast);
  }
}

function normalizeOptions(code, opts) {
  const format = {
    auxiliaryCommentBefore: opts.auxiliaryCommentBefore,
    auxiliaryCommentAfter: opts.auxiliaryCommentAfter,
    shouldPrintComment: opts.shouldPrintComment,
    retainLines: opts.retainLines,
    retainFunctionParens: opts.retainFunctionParens,
    comments: opts.comments == null || opts.comments,
    compact: opts.compact,
    minified: opts.minified,
    concise: opts.concise,
    indent: {
      adjustMultilineComment: true,
      style: "  ",
      base: 0
    },
    decoratorsBeforeExport: !!opts.decoratorsBeforeExport,
    jsescOption: {
      quotes: "double",
      wrap: true,
      ...opts.jsescOption
    },
    recordAndTupleSyntaxType: opts.recordAndTupleSyntaxType,
    jsonCompatibleStrings: opts.jsonCompatibleStrings
  };

  if (format.minified) {
    format.compact = true;
    format.shouldPrintComment = format.shouldPrintComment || (() => format.comments);
  } else {
    format.shouldPrintComment = format.shouldPrintComment || (value => format.comments || value.includes("@license") || value.includes("@preserve"));
  }

  if (format.compact === "auto") {
    format.compact = code.length > 500000;
    if (format.compact) {
      console.error(`[BABEL] Note: The code generator has deoptimised the styling of ${opts.filename} as it exceeds the max of 500KB.`);
    }
  }

  if (format.compact) {
    format.indent.adjustMultilineComment = false;
  }

  return format;
}

class CodeGenerator {
  constructor(ast, opts, code) {
    this._generator = new Generator(ast, opts, code);
  }

  generate() {
    return this._generator.generate();
  }
}

export function _default(ast, opts, code) {
  const gen = new Generator(ast, opts, code);
  return gen.generate();
}

export default _default;
export { CodeGenerator };
