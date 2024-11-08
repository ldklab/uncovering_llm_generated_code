"use strict";

// Utility functions for object operations
var __assign = Object.assign || function(target, ...sources) {
    sources.forEach(source => {
        for (let key in source) {
            if (Object.prototype.hasOwnProperty.call(source, key))
                target[key] = source[key];
        }
    });
    return target;
};

var __createBinding = (o, m, k, k2) => {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: () => m[k] });
};

var __setModuleDefault = (o, v) => {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
};

var __importStar = (mod) => {
    if (mod && mod.__esModule) return mod;
    let result = {};
    if (mod != null) {
        for (let k in mod) {
            if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
                __createBinding(result, mod, k);
        }
    }
    __setModuleDefault(result, mod);
    return result;
};

// Module imports
var ElementType = __importStar(require("domelementtype"));
var { encodeXML } = require("entities");
var { attributeNames, elementNames } = require("./foreignNames");

// Constants for specific HTML elements
var unencodedElements = new Set(["style", "script", "xmp", "iframe", "noembed", "noframes", "plaintext", "noscript"]);
var singleTag = new Set(["area", "base", "basefont", "br", "col", "command", "embed", "frame", "hr", "img", "input", "isindex", "keygen", "link", "meta", "param", "source", "track", "wbr"]);

// Format attributes into a string
function formatAttributes(attributes, opts) {
    if (!attributes) return;
    return Object.keys(attributes)
        .map(key => {
            let value = attributes[key] ?? "";
            if (opts.xmlMode === "foreign") {
                key = attributeNames.get(key) ?? key;
            }
            if (!opts.emptyAttrs && !opts.xmlMode && value === "") {
                return key;
            }
            return `${key}="${opts.decodeEntities ? encodeXML(value) : value.replace(/"/g, "&quot;")}"`;
        })
        .join(" ");
}

// Main render function to convert nodes to string
function render(node, options = {}) {
    let nodes = Array.isArray(node) || node.cheerio ? node : [node];
    let output = "";
    for (let i = 0; i < nodes.length; i++) {
        output += renderNode(nodes[i], options);
    }
    return output;
}
exports.default = render;

// Helper rendering functions for specific node types
function renderNode(node, options) {
    switch (node.type) {
        case ElementType.Root:
            return render(node.children, options);
        case ElementType.Directive:
        case ElementType.Doctype:
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

var foreignModeIntegrationPoints = new Set(["mi", "mo", "mn", "ms", "mtext", "annotation-xml", "foreignObject", "desc", "title"]);
var foreignElements = new Set(["svg", "math"]);

function renderTag(elem, opts) {
    if (opts.xmlMode === "foreign") {
        elem.name = elementNames.get(elem.name) ?? elem.name;
        if (elem.parent && foreignModeIntegrationPoints.has(elem.parent.name)) {
            opts = { ...opts, xmlMode: false };
        }
    }
    if (!opts.xmlMode && foreignElements.has(elem.name)) {
        opts = { ...opts, xmlMode: "foreign" };
    }
    let tag = `<${elem.name}`;
    let attribs = formatAttributes(elem.attribs, opts);
    if (attribs) tag += ` ${attribs}`;

    if (elem.children.length === 0 &&
        (opts.xmlMode ? opts.selfClosingTags !== false : opts.selfClosingTags && singleTag.has(elem.name))) {
        if (!opts.xmlMode) tag += " ";
        tag += "/>";
    } else {
        tag += ">";
        if (elem.children.length > 0) {
            tag += render(elem.children, opts);
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
    let data = elem.data || "";
    if (opts.decodeEntities && !(elem.parent && unencodedElements.has(elem.parent.name))) {
        data = encodeXML(data);
    }
    return data;
}

function renderCdata(elem) {
    return `<![CDATA[${elem.children[0].data}]]>`;
}

function renderComment(elem) {
    return `<!--${elem.data}-->`;
}
