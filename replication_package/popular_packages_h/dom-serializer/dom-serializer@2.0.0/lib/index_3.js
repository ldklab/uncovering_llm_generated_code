"use strict";

const __assign = Object.assign || function (t) {
    for (let i = 1, n = arguments.length; i < n; i++) {
        let s = arguments[i];
        for (let p in s) if (Object.prototype.hasOwnProperty.call(s, p)) {
            t[p] = s[p];
        }
    }
    return t;
};

const __createBinding = Object.create ? (o, m, k, k2 = k) => {
    let desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: () => m[k] };
    }
    Object.defineProperty(o, k2, desc);
} : (o, m, k, k2 = k) => {
    o[k2] = m[k];
};

const __setModuleDefault = Object.create ? (o, v) => {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
} : (o, v) => {
    o["default"] = v;
};

const __importStar = (mod) => {
    if (mod && mod.__esModule) return mod;
    const result = {};
    if (mod != null) for (const k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};

const ElementType = __importStar(require("domelementtype"));
const { encodeXML, escapeAttribute, escapeText } = require("entities");
const { attributeNames, elementNames } = require("./foreignNames.js");

const unencodedElements = new Set(["style", "script", "xmp", "iframe", "noembed", "noframes", "plaintext", "noscript"]);

function replaceQuotes(value) {
    return value.replace(/"/g, "&quot;");
}

function formatAttributes(attributes, opts) {
    if (!attributes) return;
    const encode = opts.encodeEntities === false ? replaceQuotes : opts.xmlMode || opts.encodeEntities !== "utf8" ? encodeXML : escapeAttribute;
    return Object.keys(attributes)
        .map((key) => {
            let value = attributes[key] || "";
            if (opts.xmlMode === "foreign") {
                key = attributeNames.get(key) || key;
            }
            return opts.emptyAttrs || opts.xmlMode || value ? `${key}="${encode(value)}"` : key;
        })
        .join(" ");
}

const singleTag = new Set(["area", "base", "basefont", "br", "col", "command", "embed", "frame", "hr", "img", "input", "isindex", "keygen", "link", "meta", "param", "source", "track", "wbr"]);

function render(node, options = {}) {
    const nodes = Array.isArray(node) ? node : [node];
    return nodes.map(n => renderNode(n, options)).join("");
}
exports.render = render;
exports.default = render;

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

const foreignModeIntegrationPoints = new Set(["mi", "mo", "mn", "ms", "mtext", "annotation-xml", "foreignObject", "desc", "title"]);
const foreignElements = new Set(["svg", "math"]);

function renderTag(elem, opts) {
    if (opts.xmlMode === "foreign") {
        elem.name = elementNames.get(elem.name) || elem.name;
        if (elem.parent && foreignModeIntegrationPoints.has(elem.parent.name)) {
            opts = { ...opts, xmlMode: false };
        }
    }
    if (!opts.xmlMode && foreignElements.has(elem.name)) {
        opts = { ...opts, xmlMode: "foreign" };
    }
    let tag = `<${elem.name}`;
    const attribs = formatAttributes(elem.attribs, opts);
    if (attribs) {
        tag += ` ${attribs}`;
    }
    if (elem.children.length === 0 && (opts.xmlMode ? opts.selfClosingTags !== false : opts.selfClosingTags && singleTag.has(elem.name))) {
        tag += opts.xmlMode ? `/>` : ` />`;
    } else {
        tag += `>`;
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
    if (opts.encodeEntities !== false && !(!opts.xmlMode && elem.parent && unencodedElements.has(elem.parent.name))) {
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
