"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true,
});
exports.default = annotateAsPure;

var _t = require("@babel/types");
const { addComment } = _t;
const PURE_ANNOTATION = "#__PURE__";

// Function to check if a node is already annotated as PURE
const isPureAnnotated = ({ leadingComments }) =>
  !!leadingComments &&
  leadingComments.some((comment) => /[@#]__PURE__/.test(comment.value));

// Function to annotate a node as PURE if not already annotated
function annotateAsPure(pathOrNode) {
  const node = pathOrNode["node"] || pathOrNode;
  
  // If the node is already annotated as PURE, return without adding again
  if (isPureAnnotated(node)) {
    return;
  }

  // Add a PURE annotation as a leading comment to the node
  addComment(node, "leading", PURE_ANNOTATION);
}

//# sourceMappingURL=index.js.map
