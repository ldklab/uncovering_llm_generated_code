const PURE_ANNOTATION = "#__PURE__";

/**
 * Adds a pure annotation comment (`#__PURE__`) to a specified Babel AST node or path.
 * This assists tools like minifiers in recognizing functions with no side effects.
 *
 * @param {object} nodeOrPath - The Babel AST node or path that requires annotation.
 */
function annotateAsPure(nodeOrPath) {
  const node = nodeOrPath.node || nodeOrPath;

  // Initialize leadingComments if it doesn't exist
  node.leadingComments = node.leadingComments || [];

  // Add the PURE_ANNOTATION if not already present
  const isAnnotated = node.leadingComments.some(comment => comment.value.includes(PURE_ANNOTATION));
  
  if (!isAnnotated) {
    node.leadingComments.push({
      type: "CommentBlock",
      value: ` ${PURE_ANNOTATION} `
    });
  }
}

module.exports = annotateAsPure;
