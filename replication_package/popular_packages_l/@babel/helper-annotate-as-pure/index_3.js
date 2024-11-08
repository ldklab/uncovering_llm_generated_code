// @babel/helper-annotate-as-pure/index.js

const PURE_ANNOTATION = "#__PURE__";

/**
 * Adds a `#__PURE__` annotation comment to a Babel AST node or path.
 *
 * Purpose: To signal that a function is free of side effects.
 *
 * @param {object} nodeOrPath - The AST node or path to annotate.
 * @returns {void}
 */
function annotateAsPure(nodeOrPath) {
  const node = nodeOrPath.node || nodeOrPath; // Extracting the node

  node.leadingComments = node.leadingComments || []; // Initialize if missing

  // Avoid duplicate annotations
  const hasPureAnnotation = node.leadingComments.some(comment => 
    comment.value.includes(PURE_ANNOTATION)
  );

  // Add PURE annotation if not already present
  if (!hasPureAnnotation) {
    node.leadingComments.push({
      type: "CommentBlock",
      value: ` ${PURE_ANNOTATION} `
    });
  }
}

module.exports = annotateAsPure;
