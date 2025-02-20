"use strict";

Object.defineProperty(exports, "__esModule", { value: true });

/** Types of elements found in htmlparser2's DOM */
var ElementType = {
    /** Type for the root element of a document */
    Root: "root",
    /** Type for Text */
    Text: "text",
    /** Type for <? ... ?> */
    Directive: "directive",
    /** Type for <!-- ... --> */
    Comment: "comment",
    /** Type for <script> tags */
    Script: "script",
    /** Type for <style> tags */
    Style: "style",
    /** Type for Any tag */
    Tag: "tag",
    /** Type for <![CDATA[ ... ]]> */
    CDATA: "cdata",
    /** Type for <!doctype ...> */
    Doctype: "doctype"
};
exports.ElementType = ElementType;

/**
 * Tests whether an element is a tag or not.
 *
 * @param elem Element to test
 */
function isTag(elem) {
    return (elem.type === ElementType.Tag ||
        elem.type === ElementType.Script ||
        elem.type === ElementType.Style);
}
exports.isTag = isTag;

// Exports for backwards compatibility
exports.Root = ElementType.Root;
exports.Text = ElementType.Text;
exports.Directive = ElementType.Directive;
exports.Comment = ElementType.Comment;
exports.Script = ElementType.Script;
exports.Style = ElementType.Style;
exports.Tag = ElementType.Tag;
exports.CDATA = ElementType.CDATA;
exports.Doctype = ElementType.Doctype;
