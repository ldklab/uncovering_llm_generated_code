"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Doctype = exports.CDATA = exports.Tag = exports.Style = exports.Script = exports.Comment = exports.Directive = exports.Text = exports.Root = exports.isTag = exports.ElementType = void 0;

// Enum representing types of elements in htmlparser2's DOM
var ElementType;
(function (ElementType) {
    ElementType["Root"] = "root"; // Root element of a document
    ElementType["Text"] = "text"; // Text type
    ElementType["Directive"] = "directive"; // Directives <? ... ?>
    ElementType["Comment"] = "comment"; // Comments <!-- ... -->
    ElementType["Script"] = "script"; // <script> tags
    ElementType["Style"] = "style"; // <style> tags
    ElementType["Tag"] = "tag"; // Any tag
    ElementType["CDATA"] = "cdata"; // CDATA <![CDATA[ ... ]]>
    ElementType["Doctype"] = "doctype"; // Doctype <!doctype ...>
})(ElementType = exports.ElementType || (exports.ElementType = {}));

// Function to test if an element is a tag
function isTag(elem) {
    return [ElementType.Tag, ElementType.Script, ElementType.Style].includes(elem.type);
}
exports.isTag = isTag;

// Re-exports for backwards compatibility
exports.Root = ElementType.Root;
exports.Text = ElementType.Text;
exports.Directive = ElementType.Directive;
exports.Comment = ElementType.Comment;
exports.Script = ElementType.Script;
exports.Style = ElementType.Style;
exports.Tag = ElementType.Tag;
exports.CDATA = ElementType.CDATA;
exports.Doctype = ElementType.Doctype;
