"use strict";
// Define and export types of elements found in htmlparser2's DOM
var ElementType;
(function (ElementType) {
    ElementType["Root"] = "root"; // Root element
    ElementType["Text"] = "text"; // Text element
    ElementType["Directive"] = "directive"; // <? ... ?> directive
    ElementType["Comment"] = "comment"; // <!-- ... --> comment
    ElementType["Script"] = "script"; // <script> tag
    ElementType["Style"] = "style"; // <style> tag
    ElementType["Tag"] = "tag"; // Any tag
    ElementType["CDATA"] = "cdata"; // <![CDATA[ ... ]]> section
    ElementType["Doctype"] = "doctype"; // <!doctype ...> declaration
})(ElementType || (ElementType = {}));

// Export ElementType for external use
exports.ElementType = ElementType;

// Function to check if the element is a tag
function isTag(elem) {
    return (elem.type === ElementType.Tag ||
        elem.type === ElementType.Script ||
        elem.type === ElementType.Style);
}
exports.isTag = isTag;

// Export ElementType values for backwards compatibility
exports.Root = ElementType.Root;
exports.Text = ElementType.Text;
exports.Directive = ElementType.Directive;
exports.Comment = ElementType.Comment;
exports.Script = ElementType.Script;
exports.Style = ElementType.Style;
exports.Tag = ElementType.Tag;
exports.CDATA = ElementType.CDATA;
exports.Doctype = ElementType.Doctype;
