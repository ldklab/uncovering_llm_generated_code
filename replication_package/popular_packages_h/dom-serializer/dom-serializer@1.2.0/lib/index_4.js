"use strict";

// Utility to merge properties of objects
var __assign = (this && this.__assign) || Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];
        for (var key in source) {
            if (Object.prototype.hasOwnProperty.call(source, key)) {
                target[key] = source[key];
            }
        }
    }
    return target;
};

// Create property bindings on object
var __createBinding = (this && this.__createBinding) || (Object.create ? function (o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
} : function (o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
});

// Set default module exports
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? function (o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
} : function (o, v) {
    o["default"] = v;
});

// Import module dependencies
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};

// Actual rendering function and associated helpers begin below

var ElementType = __importStar(require("domelementtype"));
var entities_1 = require("entities");
var foreignNames_1 = require("./foreignNames");

var unencodedElements = new Set([
    "style", "script", "xmp", "iframe", "noembed", "noframes", "plaintext", "noscript"
]);

function formatAttributes(attributes, opts) {
    if (!attributes) return;
    return Object.keys(attributes).map(function (key) {
        var value = attributes[key] || "";
        if (opts.xmlMode === "foreign") {
            key = foreignNames_1.attributeNames.get(key) || key;
        }
        if (!opts.emptyAttrs && !opts.xmlMode && value === "") {
            return key;
        }
        return key + '="' + (opts.decodeEntities ? entities_1.encodeXML(value) : value.replace(/"/g, '&quot;')) + '"';
    }).join(" ");
}

var singleTag = new Set([
    "area", "base", "basefont", "br", "col", "command", "embed", 
    "frame", "hr", "img", "input", "isindex", "keygen", 
    "link", "meta", "param", "source", "track", "wbr"
]);

function render(node, options = {}) {
    var nodes = Array.isArray(node) || node.cheerio ? node : [node];
    return nodes.map(n => renderNode(n, options)).join("");
}

exports.default = render;

function renderNode(node, options) {
    switch (node.type) {
        case ElementType.Root: return render(node.children, options);
        case ElementType.Directive:
        case ElementType.Doctype: return renderDirective(node);
        case ElementType.Comment: return renderComment(node);
        case ElementType.CDATA: return renderCdata(node);
        case ElementType.Script:
        case ElementType.Style:
        case ElementType.Tag: return renderTag(node, options);
        case ElementType.Text: return renderText(node, options);
        default: return '';
    }
}

var foreignModeIntegrationPoints = new Set([
    "mi", "mo", "mn", "ms", "mtext", 
    "annotation-xml", "foreignObject", "desc", "title"
]);

var foreignElements = new Set(["svg", "math"]);

function renderTag(elem, opts) {
    if (opts.xmlMode === "foreign") {
        elem.name = foreignNames_1.elementNames.get(elem.name) || elem.name;
        if (elem.parent && foreignModeIntegrationPoints.has(elem.parent.name)) {
            opts = __assign(__assign({}, opts), { xmlMode: false });
        }
    }
    if (!opts.xmlMode && foreignElements.has(elem.name)) {
        opts = __assign(__assign({}, opts), { xmlMode: "foreign" });
    }
    var tag = "<" + elem.name;
    var attribs = formatAttributes(elem.attribs, opts);
    if (attribs) {
        tag += " " + attribs;
    }
    if (elem.children.length === 0 && (opts.xmlMode ? opts.selfClosingTags !== false : opts.selfClosingTags && singleTag.has(elem.name))) {
        tag += "/>";
    } else {
        tag += ">";
        if (elem.children.length > 0) {
            tag += render(elem.children, opts);
        }
        if (opts.xmlMode || !singleTag.has(elem.name)) {
            tag += "</" + elem.name + ">";
        }
    }
    return tag;
}

function renderDirective(elem) {
    return "<" + elem.data + ">";
}

function renderText(elem, opts) {
    var data = elem.data || "";
    if (opts.decodeEntities && !(elem.parent && unencodedElements.has(elem.parent.name))) {
        data = entities_1.encodeXML(data);
    }
    return data;
}

function renderCdata(elem) {
    return "<![CDATA[" + elem.children[0].data + "]]>";
}

function renderComment(elem) {
    return "<!--" + elem.data + "-->";
}
