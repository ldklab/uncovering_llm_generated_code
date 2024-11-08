"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Doctype = exports.CDATA = exports.Tag = exports.Style = exports.Script = exports.Comment = exports.Directive = exports.Text = exports.Root = exports.isTag = void 0;

/**
 * Checks if a given element is a tag element (tag, script, or style).
 *
 * @param elem The element to check
 * @returns Boolean indicating if the element is a tag
 */
function isTag(elem) {
    // Check if the element type is either "tag", "script" or "style".
    return ["tag", "script", "style"].includes(elem.type);
}
exports.isTag = isTag;

// Define and export constants for element types for backward compatibility.
exports.Root = "root";        // Type for the root element
exports.Text = "text";        // Type for text nodes
exports.Directive = "directive"; // Type for directive nodes (<? ... ?>)
exports.Comment = "comment";  // Type for comment nodes (<!-- ... -->)
exports.Script = "script";    // Type for <script> elements
exports.Style = "style";      // Type for <style> elements
exports.Tag = "tag";          // Type for generic tags
exports.CDATA = "cdata";      // Type for CDATA sections (<![CDATA[ ... ]]>)
exports.Doctype = "doctype";  // Type for doctype declarations (<!doctype ...>)
