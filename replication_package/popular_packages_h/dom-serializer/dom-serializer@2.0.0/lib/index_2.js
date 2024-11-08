"use strict";
const { encodeXML, escapeAttribute, escapeText } = require("entities");
const { elementNames, attributeNames } = require("./foreignNames.js");
const ElementType = require("domelementtype");

// Set of tags where content shouldn't be encoded
const unencodedElements = new Set(["style", "script", "xmp", "iframe", "noembed", "noframes", "plaintext", "noscript"]);
// Self-enclosing tags in HTML
const singleTag = new Set(["area", "base", "basefont", "br", "col", "command", "embed", "frame", "hr", "img", "input", "isindex", "keygen", "link", "meta", "param", "source", "track", "wbr"]);

function formatAttributes(attributes, opts) {
    if (!attributes) return;
    const encode = (opts.encodeEntities === false ? replaceQuotes
        : opts.xmlMode || opts.encodeEntities !== "utf8" ? encodeXML
        : escapeAttribute);
    
    return Object.keys(attributes).map(key => {
        let value = attributes[key] || "";
        if (opts.xmlMode === "foreign") {
            key = attributeNames.get(key) || key;
        }
        if (!opts.emptyAttrs && !opts.xmlMode && value === "") return key;
        return `${key}="${encode(value)}"`;
    }).join(" ");
}

function render(node, options = {}) {
    const nodes = Array.isArray(node) ? node : [node];
    return nodes.map(n => renderNode(n, options)).join("");
}

function renderNode(node, options) {
    switch (node.type) {
        case ElementType.Root: return render(node.children, options);
        case ElementType.Doctype:
        case ElementType.Directive: return renderDirective(node);
        case ElementType.Comment: return renderComment(node);
        case ElementType.CDATA: return renderCdata(node);
        case ElementType.Script:
        case ElementType.Style:
        case ElementType.Tag: return renderTag(node, options);
        case ElementType.Text: return renderText(node, options);
    }
}

function renderTag(elem, opts) {
    if (opts.xmlMode === "foreign") {
        elem.name = elementNames.get(elem.name) || elem.name;
        if (elem.parent && ["mi", "mo", "mn", "ms", "mtext", "annotation-xml", "foreignObject", "desc", "title"].includes(elem.parent.name)) {
            opts = { ...opts, xmlMode: false };
        }
    }
    if (!opts.xmlMode && ["svg", "math"].includes(elem.name)) {
        opts = { ...opts, xmlMode: "foreign" };
    }

    let tag = `<${elem.name}`;
    const attribs = formatAttributes(elem.attribs, opts);

    if (attribs) {
        tag += ` ${attribs}`;
    }

    if (elem.children.length === 0 && (opts.xmlMode ? opts.selfClosingTags !== false : opts.selfClosingTags && singleTag.has(elem.name))) {
        if (!opts.xmlMode) tag += " ";
        tag += "/>";
    } else {
        tag += ">";
        if (elem.children.length > 0) tag += render(elem.children, opts);
        if (opts.xmlMode || !singleTag.has(elem.name)) tag += `</${elem.name}>`;
    }

    return tag;
}

function renderDirective(elem) {
    return `<${elem.data}>`;
}

function renderText(elem, opts) {
    let data = elem.data || "";
    if ((opts.encodeEntities !== false && opts.decodeEntities !== false) && (!(opts.xmlMode || !opts.xmlMode && elem.parent && unencodedElements.has(elem.parent.name)))) {
        data = opts.xmlMode || opts.encodeEntities !== "utf8" ? encodeXML(data) : escapeText(data);
    }
    return data;
}

function renderCdata(elem) {
    return `<![CDATA[${elem.children[0].data}]]>`;
}

function renderComment(elem) {
    return `<!--${elem.data}-->`;
}

function replaceQuotes(value) {
    return value.replace(/"/g, "&quot;");
}

module.exports = render;
