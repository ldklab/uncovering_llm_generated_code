"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = annotateAsPure;

const { addComment } = require("@babel/types");

const PURE_ANNOTATION = "#__PURE__";

// Helper function to check if the node already has the PURE annotation
const isPureAnnotated = ({ leadingComments }) => 
  !!leadingComments && leadingComments.some(comment => /[@#]__PURE__/.test(comment.value));

// Main function to annotate node as PURE
function annotateAsPure(pathOrNode) {
  // Try to get the node from pathOrNode, in case pathOrNode is a path object
  const node = pathOrNode["node"] || pathOrNode;
  
  // If the node already has the PURE annotation, exit the function
  if (isPureAnnotated(node)) {
    return;
  }
  
  // Add a leading comment with the PURE annotation
  addComment(node, "leading", PURE_ANNOTATION);
}

//# sourceMappingURL=index.js.map
