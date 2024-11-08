"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = annotateAsPure;

const { addComment } = require("@babel/types");

const PURE_ANNOTATION = "#__PURE__";

const isPureAnnotated = node => {
  const { leadingComments } = node;
  return !!leadingComments && leadingComments.some(comment => /[@#]__PURE__/.test(comment.value));
};

function annotateAsPure(pathOrNode) {
  const node = pathOrNode.node || pathOrNode;
  if (!isPureAnnotated(node)) {
    addComment(node, "leading", PURE_ANNOTATION);
  }
}
