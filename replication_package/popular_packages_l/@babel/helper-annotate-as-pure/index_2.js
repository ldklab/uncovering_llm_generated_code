const PURE_ANNOTATION = "#__PURE__";

/**
 * Add a `#__PURE__` annotation comment to a Babel AST node or path.
 *
 * @param {object} nodeOrPath - The Babel node or path object to annotate.
 */
function annotateAsPure(nodeOrPath) {
  const node = nodeOrPath.node || nodeOrPath;
  node.leadingComments = node.leadingComments || [];

  const hasPureAnnotation = node.leadingComments.some(
    comment => comment.value.includes(PURE_ANNOTATION)
  );

  if (!hasPureAnnotation) {
    node.leadingComments.push({
      type: "CommentBlock",
      value: ` ${PURE_ANNOTATION} `
    });
  }
}

module.exports = annotateAsPure;
