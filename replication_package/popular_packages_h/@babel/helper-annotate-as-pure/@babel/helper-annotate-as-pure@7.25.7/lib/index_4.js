"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = annotateAsPure;

var babelTypes = require("@babel/types");
const {
  addComment
} = babelTypes;

const PURE_ANNOTATION = "#__PURE__";

// Function to check if a node has been already annotated as PURE
const isPureAnnotated = ({
  leadingComments
}) => {
  // Check if there are any leading comments and if any matches the PURE Annotation pattern
  return !!leadingComments && leadingComments.some(comment => /[@#]__PURE__/.test(comment.value));
};

// Function to add PURE annotation to a node or path
function annotateAsPure(pathOrNode) {
  // Retrieve the actual node from pathOrNode
  const node = pathOrNode["node"] || pathOrNode;

  // If it is already annotated as PURE, do nothing
  if (isPureAnnotated(node)) {
    return;
  }

  // Add the PURE annotation as a leading comment to the node
  addComment(node, "leading", PURE_ANNOTATION);
}

//# sourceMappingURL=index.js.map
