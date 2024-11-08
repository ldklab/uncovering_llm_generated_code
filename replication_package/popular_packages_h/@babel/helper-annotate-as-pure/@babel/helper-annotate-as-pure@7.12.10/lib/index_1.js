"use strict";

import * as t from "@babel/types";

const PURE_ANNOTATION = "#__PURE__";

function isPureAnnotated(node) {
  return !!node.leadingComments && node.leadingComments.some(comment => /[@#]__PURE__/.test(comment.value));
}

export default function annotateAsPure(pathOrNode) {
  const node = pathOrNode.node || pathOrNode;

  if (!isPureAnnotated(node)) {
    t.addComment(node, "leading", PURE_ANNOTATION);
  }
}
