"use strict";

import SourceMap from "./source-map.js";
import Printer from "./printer.js";

// Normalize options for code generation
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
      style: "  "
    },
    jsescOption: {
      quotes: "double",
      wrap: true,
      minimal: false,
      ...opts.jsescOption
    },
    topicToken: opts.topicToken,
    importAttributesKeyword: opts.importAttributesKeyword
  };

  // Handle decorators and record/tuple syntax type
  format.decoratorsBeforeExport = opts.decoratorsBeforeExport;
  format.jsescOption.json = opts.jsonCompatibleStrings;
  format.recordAndTupleSyntaxType = opts.recordAndTupleSyntaxType ?? "hash";

  // Determine compactness and comment printing
  if (format.minified) {
    format.compact = true;
    format.shouldPrintComment = format.shouldPrintComment || (() => format.comments);
  } else {
    format.shouldPrintComment = format.shouldPrintComment || (value => format.comments || value.includes("@license") || value.includes("@preserve"));
  }

  // Handle auto compact based on code length
  if (format.compact === "auto") {
    format.compact = typeof code === "string" && code.length > 500000;
    if (format.compact) {
      console.error("[BABEL] Note: The code generator has deoptimized the styling of " + `${opts.filename} as it exceeds the max of ${"500KB"}.`);
    }
  }

  if (format.compact) {
    format.indent.adjustMultilineComment = false;
  }

  // Manage auxiliary comments based on shouldPrintComment logic
  const { auxiliaryCommentBefore, auxiliaryCommentAfter, shouldPrintComment } = format;
  if (auxiliaryCommentBefore && !shouldPrintComment(auxiliaryCommentBefore)) {
    format.auxiliaryCommentBefore = undefined;
  }
  if (auxiliaryCommentAfter && !shouldPrintComment(auxiliaryCommentAfter)) {
    format.auxiliaryCommentAfter = undefined;
  }

  return format;
}

// Class representing a code generator
export class CodeGenerator {
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

// Default export function for generating code
export default function generate(ast, opts = {}, code) {
  const format = normalizeOptions(code, opts);
  const map = opts.sourceMaps ? new SourceMap(opts, code) : null;
  const printer = new Printer(format, map);
  return printer.generate(ast);
}
