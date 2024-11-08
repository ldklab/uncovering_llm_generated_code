"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = annotateAsPure;

// Importing all Babel type utilities
var t = require("@babel/types");

// PURE annotation comment
const PURE_ANNOTATION = "#__PURE__";

// Helper function to check if a node has a pure annotation
function isPureAnnotated(node) {
  const leadingComments = node.leadingComments;
  return !!leadingComments && leadingComments.some(comment => /[@#]__PURE__/.test(comment.value));
}

// Main function to annotate a node as pure
function annotateAsPure(pathOrNode) {
  const node = pathOrNode.node || pathOrNode;

  // Check if already annotated before adding the annotation
  if (isPureAnnotated(node)) {
    return;
  }

  // Add the PURE annotation if not present
  t.addComment(node, "leading", PURE_ANNOTATION);
}
