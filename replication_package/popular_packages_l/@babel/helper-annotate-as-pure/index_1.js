// @babel/helper-annotate-as-pure/index.js

const PURE_ANNOTATION = "#__PURE__";

/**
 * Annotates a given path or node with a `#__PURE__` comment. This helps tools
 * like minifiers to detect side-effect-free functions.
 *
 * @param {object} nodeOrPath - Babel AST node or path to annotate.
 * @returns {void}
 */
function annotateAsPure(nodeOrPath) {
  const node = nodeOrPath.node || nodeOrPath; // Ensure we have the actual node
  if (!node.leadingComments) {
    node.leadingComments = []; // Initialize leadingComments array if undefined
  }

  // Add PURE_ANNOTATION if it doesn't already exist in leadingComments
  if (!node.leadingComments.some(comment => comment.value.includes(PURE_ANNOTATION))) {
    node.leadingComments.push({
      type: "CommentBlock",
      value: ` ${PURE_ANNOTATION} `
    });
  }
}

module.exports = annotateAsPure;
