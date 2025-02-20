"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

/**
 * Enum for different types of elements found in an HTML-like DOM structure.
 */
const ElementType = {
    /** Type for the root element of a document */
    Root: "root",
    /** Type for Text */
    Text: "text",
    /** Type for processing directives <? ... ?> */
    Directive: "directive",
    /** Type for comments <!-- ... --> */
    Comment: "comment",
    /** Type for <script> tags */
    Script: "script",
    /** Type for <style> tags */
    Style: "style",
    /** Type for any generic tag */
    Tag: "tag",
    /** Type for CDATA sections <![CDATA[ ... ]]> */
    CDATA: "cdata",
    /** Type for doctype declarations <!doctype ...> */
    Doctype: "doctype"
};
exports.ElementType = ElementType;

/**
 * Determines whether a given element is considered a 'tag' in HTML (includes standard tags, script, and style).
 *
 * @param elem - The element to test.
 * @returns {boolean} - True if the element is a Tag, Script, or Style element type.
 */
function isTag(elem) {
    return elem.type === ElementType.Tag || elem.type === ElementType.Script || elem.type === ElementType.Style;
}
exports.isTag = isTag;

// Exports for backward compatibility, mapping specific types to ElementType
exports.Root = ElementType.Root;
exports.Text = ElementType.Text;
exports.Directive = ElementType.Directive;
exports.Comment = ElementType.Comment;
exports.Script = ElementType.Script;
exports.Style = ElementType.Style;
exports.Tag = ElementType.Tag;
exports.CDATA = ElementType.CDATA;
exports.Doctype = ElementType.Doctype;
