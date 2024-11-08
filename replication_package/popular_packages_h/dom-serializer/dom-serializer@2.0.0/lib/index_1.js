"use strict";

const { Object.assign, defineProperty, getOwnPropertyDescriptor } = Object;
const { encodeXML, escapeAttribute, escapeText } = require("entities");
const ElementType = require("domelementtype");
const { attributeNames, elementNames } = require("./foreignNames.js");

const unencodedElements = new Set([
    "style",
    "script",
    "xmp",
    "iframe",
    "noembed",
    "noframes",
    "plaintext",
    "noscript",
]);

const singleTag = new Set([
    "area",
    "base",
    "basefont",
    "br",
    "col",
    "command",
    "embed",
    "frame",
    "hr",
    "img",
    "input",
    "isindex",
    "keygen",
    "link",
    "meta",
    "param",
    "source",
    "track",
    "wbr",
]);

function replaceQuotes(value) {
    return value.replace(/"/g, "&quot;");
}

function formatAttributes(attributes, opts) {
    if (!attributes) return;

    const encode = opts.encodeEntities === false || opts.decodeEntities === false
        ? replaceQuotes
        : opts.xmlMode || opts.encodeEntities !== "utf8"
            ? encodeXML
            : escapeAttribute;

    return Object.keys(attributes)
        .map(key => {
            let value = attributes[key] || "";
            if (opts.xmlMode === "foreign") {
                key = attributeNames.get(key) || key;
            }
            if (!opts.emptyAttrs && !opts.xmlMode && value === "") {
                return key;
            }
            return `${key}="${encode(value)}"`;
        })
        .join(" ");
}

function render(node, options = {}) {
    const nodes = Array.isArray(node) ? node : [node];
    return nodes.map(n => renderNode(n, options)).join("");
}

exports.render = render;
exports.default = render;

function renderNode(node, options) {
    switch (node.type) {
        case ElementType.Root:
            return render(node.children, options);
        case ElementType.Doctype:
        case ElementType.Directive:
            return renderDirective(node);
        case ElementType.Comment:
            return renderComment(node);
        case ElementType.CDATA:
            return renderCdata(node);
        case ElementType.Script:
        case ElementType.Style:
        case ElementType.Tag:
            return renderTag(node, options);
        case ElementType.Text:
            return renderText(node, options);
    }
}

const foreignModeIntegrationPoints = new Set([
    "mi", "mo", "mn", "ms", "mtext", "annotation-xml", "foreignObject", "desc", "title"
]);

const foreignElements = new Set(["svg", "math"]);

function renderTag(elem, opts) {
    const updatedOpts = { ...opts };

    if (opts.xmlMode === "foreign") {
        elem.name = elementNames.get(elem.name) || elem.name;
        if (elem.parent && foreignModeIntegrationPoints.has(elem.parent.name)) {
            updatedOpts.xmlMode = false;
        }
    }

    if (!opts.xmlMode && foreignElements.has(elem.name)) {
        updatedOpts.xmlMode = "foreign";
    }

    let tag = `<${elem.name}`;
    const attribs = formatAttributes(elem.attribs, opts);

    if (attribs) {
        tag += ` ${attribs}`;
    }

    if (elem.children.length === 0 && (
        (opts.xmlMode && opts.selfClosingTags !== false) ||
        (opts.selfClosingTags && singleTag.has(elem.name))
    )) {
        if (!opts.xmlMode) {
            tag += " ";
        }
        tag += "/>";
    } else {
        tag += ">";
        if (elem.children.length > 0) {
            tag += render(elem.children, updatedOpts);
        }
        if (opts.xmlMode || !singleTag.has(elem.name)) {
            tag += `</${elem.name}>`;
        }
    }

    return tag;
}

function renderDirective(elem) {
    return `<${elem.data}>`;
}

function renderText(elem, opts) {
    const data = elem.data || "";
    if ((opts.encodeEntities !== false || opts.decodeEntities !== false) &&
        (!(opts.xmlMode || !opts.xmlMode && elem.parent && unencodedElements.has(elem.parent.name)))) {
        return opts.xmlMode || opts.encodeEntities !== "utf8"
            ? encodeXML(data)
            : escapeText(data);
    }
    return data;
}

function renderCdata(elem) {
    return `<![CDATA[${elem.children[0].data}]]>`;
}

function renderComment(elem) {
    return `<!--${elem.data}-->`;
}
