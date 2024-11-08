"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Doctype = exports.CDATA = exports.Tag = exports.Style = exports.Script = exports.Comment = exports.Directive = exports.Text = exports.Root = exports.isTag = void 0;

/**
 * Tests whether an element is a tag, script, or style.
 *
 * @param elem - Element to test.
 * @returns {boolean} - True if the element is a tag, script or style.
 */
function isTag(elem) {
    return (
        elem.type === exports.Tag ||
        elem.type === exports.Script ||
        elem.type === exports.Style
    );
}
exports.isTag = isTag;

// Constants representing node types
/** Type for the root element of a document */
const Root = "root";
/** Type for Text */
const Text = "text";
/** Type for <? ... ?> */
const Directive = "directive";
/** Type for <!-- ... --> */
const Comment = "comment";
/** Type for <script> tags */
const Script = "script";
/** Type for <style> tags */
const Style = "style";
/** Type for Any tag */
const Tag = "tag";
/** Type for <![CDATA[ ... ]]> */
const CDATA = "cdata";
/** Type for <!doctype ...> */
const Doctype = "doctype";

// Exporting constants
exports.Root = Root;
exports.Text = Text;
exports.Directive = Directive;
exports.Comment = Comment;
exports.Script = Script;
exports.Style = Style;
exports.Tag = Tag;
exports.CDATA = CDATA;
exports.Doctype = Doctype;
