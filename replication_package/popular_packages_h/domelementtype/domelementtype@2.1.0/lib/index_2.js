"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

/**
 * Checks if the provided element is a tag (tag, script, or style).
 *
 * @param {Object} elem - The element to check.
 * @returns {boolean} - True if the element is a tag, otherwise false.
 */
function isTag(elem) {
    return elem.type === "tag" || elem.type === "script" || elem.type === "style";
}
exports.isTag = isTag;

// Export types for backward compatibility
exports.Root = "root";
exports.Text = "text";
exports.Directive = "directive";
exports.Comment = "comment";
exports.Script = "script";
exports.Style = "style";
exports.Tag = "tag";
exports.CDATA = "cdata";
exports.Doctype = "doctype";
