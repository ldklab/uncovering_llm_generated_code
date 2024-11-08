"use strict";

import SourceMap from "./source-map.js";
import Printer from "./printer.js";

function normalizeOptions(code, opts) {
  const format = {
    auxiliaryCommentBefore: opts.auxiliaryCommentBefore,
    auxiliaryCommentAfter: opts.auxiliaryCommentAfter,
    shouldPrintComment: opts.shouldPrintComment,
    retainLines: opts.retainLines,
    retainFunctionParens: opts.retainFunctionParens,
    comments: opts.comments ?? true,
    compact: opts.compact,
    minified: opts.minified,
    concise: opts.concise,
    indent: {
      adjustMultilineComment: true,
      style: "  "
    },
    jsescOption: {
      quotes: "double",
      wrap: true,
      minimal: false,
      ...opts.jsescOption
    },
    topicToken: opts.topicToken,
    importAttributesKeyword: opts.importAttributesKeyword,
    decoratorsBeforeExport: opts.decoratorsBeforeExport,
    jsescOptionJSON: opts.jsonCompatibleStrings,
    recordAndTupleSyntaxType: opts.recordAndTupleSyntaxType ?? "hash",
  };

  if (format.minified) {
    format.compact = true;
    format.shouldPrintComment = format.shouldPrintComment || (() => format.comments);
  } else {
    format.shouldPrintComment = format.shouldPrintComment || (value => 
      format.comments || value.includes("@license") || value.includes("@preserve")
    );
  }

  if (format.compact === "auto") {
    format.compact = typeof code === "string" && code.length > 500000;
    if (format.compact) {
      console.error(`[BABEL] Note: The code generator has deoptimised the styling of ${opts.filename} as it exceeds the max of 500KB.`);
    }
  }

  if (format.compact) {
    format.indent.adjustMultilineComment = false;
  }

  if (format.auxiliaryCommentBefore && !format.shouldPrintComment(format.auxiliaryCommentBefore)) {
    format.auxiliaryCommentBefore = undefined;
  }
  if (format.auxiliaryCommentAfter && !format.shouldPrintComment(format.auxiliaryCommentAfter)) {
    format.auxiliaryCommentAfter = undefined;
  }

  return format;
}

class CodeGenerator {
  constructor(ast, opts = {}, code) {
    this._ast = ast;
    this._format = normalizeOptions(code, opts);
    this._map = opts.sourceMaps ? new SourceMap(opts, code) : null;
  }

  generate() {
    const printer = new Printer(this._format, this._map);
    return printer.generate(this._ast);
  }
}

function generate(ast, opts = {}, code) {
  const format = normalizeOptions(code, opts);
  const map = opts.sourceMaps ? new SourceMap(opts, code) : null;
  const printer = new Printer(format, map);
  return printer.generate(ast);
}

export { CodeGenerator, generate as default };

//# sourceMappingURL=index.js.map
