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
  const node = nodeOrPath.node || nodeOrPath;
  if (!node.leadingComments) {
    node.leadingComments = [];
  }

  // Check if the PURE_ANNOTATION already exists to prevent duplicates
  if (!node.leadingComments.some(comment => comment.value.includes(PURE_ANNOTATION))) {
    node.leadingComments.push({
      type: "CommentBlock",
      value: ` ${PURE_ANNOTATION} `
    });
  }
}

module.exports = annotateAsPure;
