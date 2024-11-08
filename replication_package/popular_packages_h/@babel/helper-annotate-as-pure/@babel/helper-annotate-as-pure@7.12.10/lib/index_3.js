"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = annotateAsPure;

const t = require("@babel/types");

function annotateAsPure(pathOrNode) {
  const node = pathOrNode.node || pathOrNode;

  const alreadyAnnotated = node.leadingComments && node.leadingComments.some(comment => /[@#]__PURE__/.test(comment.value));

  if (alreadyAnnotated) {
    return;
  }

  t.addComment(node, "leading", "#__PURE__");
}
