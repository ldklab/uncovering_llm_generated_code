"use strict";
function assign(target, ...sources) {
    for (let source of sources) {
        for (let key in source) {
            if (Object.prototype.hasOwnProperty.call(source, key)) {
                target[key] = source[key];
            }
        }
    }
    return target;
}

function createBinding(o, m, k, k2 = k) {
    Object.defineProperty(o, k2, { enumerable: true, get: () => m[k] });
}

function setModuleDefault(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}

function importStar(mod) {
    if (mod && mod.__esModule) return mod;
    let result = {};
    if (mod != null) for (let k in mod) createBinding(result, mod, k);
    setModuleDefault(result, mod);
    return result;
}

const ElementType = importStar(require("domelementtype"));
const { encodeXML } = require("entities");
const foreignNames = require("./foreignNames");

const unencodedElements = new Set(["style", "script", "xmp", "iframe", "noembed", "noframes", "plaintext", "noscript"]);

function formatAttributes(attributes, opts) {
    if (!attributes) return;
    
    return Object.keys(attributes)
        .map(key => {
            let value = attributes[key] || "";
            if (opts.xmlMode === "foreign") key = foreignNames.attributeNames.get(key) || key;
            if (!opts.emptyAttrs && !opts.xmlMode && value === "") return key;
            return `${key}="${opts.decodeEntities ? encodeXML(value) : value.replace(/"/g, "&quot;")}"`;
        })
        .join(" ");
}

const singleTag = new Set([
    "area", "base", "basefont", "br", "col", "command", "embed", 
    "frame", "hr", "img", "input", "isindex", "keygen", "link", 
    "meta", "param", "source", "track", "wbr"
]);

function render(node, options = {}) {
    const nodes = Array.isArray(node) || node.cheerio ? node : [node];
    return nodes.map(n => renderNode(n, options)).join('');
}

exports.default = render;

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

const foreignModeIntegrationPoints = new Set(["mi", "mo", "mn", "ms", "mtext", "annotation-xml", "foreignObject", "desc", "title"]);
const foreignElements = new Set(["svg", "math"]);

function renderTag(elem, opts) {
    if (opts.xmlMode === "foreign") {
        elem.name = foreignNames.elementNames.get(elem.name) || elem.name;
        if (elem.parent && foreignModeIntegrationPoints.has(elem.parent.name)) {
            opts = { ...opts, xmlMode: false };
        }
    } else if (!opts.xmlMode && foreignElements.has(elem.name)) {
        opts = { ...opts, xmlMode: "foreign" };
    }

    let tag = `<${elem.name}`;
    const attribs = formatAttributes(elem.attribs, opts);
    if (attribs) tag += ` ${attribs}`;
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