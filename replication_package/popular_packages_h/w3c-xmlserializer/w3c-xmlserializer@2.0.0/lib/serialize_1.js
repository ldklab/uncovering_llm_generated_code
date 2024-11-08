"use strict";

const xmlNameValidator = require("xml-name-validator");
const attributeUtils = require("./attributes");
const { NAMESPACES, VOID_ELEMENTS, NODE_TYPES } = require("./constants");

const XML_CHARACTER = /^(\x09|\x0A|\x0D|[\x20-\uD7FF]|[\uE000-\uFFFD]|(?:[\uD800-\uDBFF][\uDC00-\uDFFF]))*$/;
const PUBID_CHARACTER = /^(\x20|\x0D|\x0A|[a-zA-Z0-9]|[-'()+,./:=?;!*#@$_%])*$/;

function asciiCaseInsensitiveComparison(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; ++i) {
    if ((a.charCodeAt(i) | 32) !== (b.charCodeAt(i) | 32)) return false;
  }
  return true;
}

function gatherNamespaceInfo(element, namespaceMap, prefixMap) {
  let defaultNamespace = null;
  for (const attr of element.attributes) {
    if (attr.namespaceURI === NAMESPACES.XMLNS) {
      if (!attr.prefix) {
        defaultNamespace = attr.value;
        continue;
      }
      let namespaceUri = attr.value;
      if (namespaceUri === NAMESPACES.XML) continue;
      namespaceUri = namespaceUri || "";

      if (namespaceUri in namespaceMap && namespaceMap[namespaceUri].includes(attr.localName)) continue;

      namespaceMap[namespaceUri] = namespaceMap[namespaceUri] || [];
      namespaceMap[namespaceUri].push(attr.localName);
      prefixMap[attr.localName] = namespaceUri;
    }
  }
  return defaultNamespace;
}

function serializeDocType(node, namespace, prefixMap, requireWellFormed) {
  if (requireWellFormed && !PUBID_CHARACTER.test(node.publicId)) {
    throw new Error("XML serialization failed: document type node publicId is not well-formed.");
  }
  if (requireWellFormed && (!XML_CHARACTER.test(node.systemId) || (node.systemId.includes('"') && node.systemId.includes("'")))) {
    throw new Error("XML serialization failed: document type node systemId is not well-formed.");
  }

  let markup = `<!DOCTYPE ${node.name}`;
  if (node.publicId) {
    markup += ` PUBLIC "${node.publicId}"`;
  } else if (node.systemId) {
    markup += " SYSTEM";
  }
  if (node.systemId) {
    markup += ` "${node.systemId}"`;
  }
  return markup + ">";
}

function serializeProcessingInstr(node, namespace, prefixMap, requireWellFormed) {
  if (requireWellFormed && (node.target.includes(":") || asciiCaseInsensitiveComparison(node.target, "xml"))) {
    throw new Error("XML serialization failed: processing instruction node target is not well-formed.");
  }
  if (requireWellFormed && (!XML_CHARACTER.test(node.data) || node.data.includes("?>"))) {
    throw new Error("XML serialization failed: processing instruction node data is not well-formed.");
  }
  return `<?${node.target} ${node.data}?>`;
}

function serializeDocument(node, namespace, prefixMap, requireWellFormed, refs) {
  if (requireWellFormed && !node.documentElement) {
    throw new Error("XML serialization failed: document lacks a document element.");
  }
  return Array.from(node.childNodes).reduce((markup, child) => markup + xmlSerialization(child, namespace, prefixMap, requireWellFormed, refs), "");
}

function serializeDocumentFragment(node, namespace, prefixMap, requireWellFormed, refs) {
  return Array.from(node.childNodes).reduce((markup, child) => markup + xmlSerialization(child, namespace, prefixMap, requireWellFormed, refs), "");
}

function serializeTextNode(node, namespace, prefixMap, requireWellFormed) {
  if (requireWellFormed && !XML_CHARACTER.test(node.data)) {
    throw new Error("XML serialization failed: text node data is not well-formed.");
  }
  return node.data.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function serializeCommentNode(node, namespace, prefixMap, requireWellFormed) {
  if (
    requireWellFormed &&
    (!XML_CHARACTER.test(node.data) || node.data.includes("--") || node.data.endsWith("-"))
  ) {
    throw new Error("XML serialization failed: illegal character sequence found in comment node data.");
  }
  return `<!--${node.data}-->`;
}

function serializeElement(node, namespace, prefixMap, requireWellFormed, refs) {
  if (
    requireWellFormed &&
    (node.localName.includes(":") || !xmlNameValidator.name(node.localName))
  ) {
    throw new Error("XML serialization failed: element node localName is invalid.");
  }

  let markup = "<";
  let qualifiedName = "";
  let omitEndTag = false;
  let skipNamespaceAttr = false;
  const namespaceMap = { ...prefixMap };
  const localPrefixMap = Object.create(null);
  const localDefaultNamespace = gatherNamespaceInfo(node, namespaceMap, localPrefixMap);
  let currentNamespace = namespace;
  const elementNs = node.namespaceURI;

  if (currentNamespace === elementNs) {
    if (localDefaultNamespace) skipNamespaceAttr = true;
    qualifiedName = elementNs === NAMESPACES.XML ? "xml:" + node.localName : node.localName;
    markup += qualifiedName;
  } else {
    let { prefix } = node;
    let preferredPrefix = attributeUtils.preferredPrefixString(namespaceMap, elementNs, prefix);
    if (prefix === "xmlns") {
      if (requireWellFormed) {
        throw new Error("XML serialization failed: element nodes cannot have a prefix of \"xmlns\".");
      }
      preferredPrefix = "xmlns";
    }
    if (preferredPrefix !== null) {
      qualifiedName = preferredPrefix + ":" + node.localName;
      if (localDefaultNamespace !== null && localDefaultNamespace !== NAMESPACES.XML) {
        currentNamespace = localDefaultNamespace || null;
      }
      markup += qualifiedName;
    } else if (prefix !== null) {
      if (prefix in localPrefixMap) {
        prefix = attributeUtils.generatePrefix(namespaceMap, elementNs, refs.prefixIndex++);
      }
      namespaceMap[elementNs] = namespaceMap[elementNs] ? [...namespaceMap[elementNs], prefix] : [prefix];
      qualifiedName = prefix + ":" + node.localName;
      markup += `${qualifiedName} xmlns:${prefix}="${attributeUtils.serializeAttributeValue(elementNs, requireWellFormed)}"`;
      if (localDefaultNamespace !== null) {
        currentNamespace = localDefaultNamespace || null;
      }
    } else if (!localDefaultNamespace || localDefaultNamespace !== elementNs) {
      skipNamespaceAttr = true;
      qualifiedName = node.localName;
      currentNamespace = elementNs;
      markup += `${qualifiedName} xmlns="${attributeUtils.serializeAttributeValue(elementNs, requireWellFormed)}"`;
    } else {
      qualifiedName = node.localName;
      currentNamespace = elementNs;
      markup += qualifiedName;
    }
  }

  markup += attributeUtils.serializeAttributes(node, namespaceMap, localPrefixMap, skipNamespaceAttr, requireWellFormed, refs);

  if (elementNs === NAMESPACES.HTML && node.childNodes.length === 0 && VOID_ELEMENTS.has(node.localName)) {
    markup += " /";
    omitEndTag = true;
  } else if (elementNs !== NAMESPACES.HTML && node.childNodes.length === 0) {
    markup += "/";
    omitEndTag = true;
  }
  markup += ">";

  if (omitEndTag) return markup;

  if (elementNs === NAMESPACES.HTML && node.localName === "template") {
    markup += xmlSerialization(node.content, currentNamespace, namespaceMap, requireWellFormed, refs);
  } else {
    for (const child of node.childNodes) {
      markup += xmlSerialization(child, currentNamespace, namespaceMap, requireWellFormed, refs);
    }
  }
  markup += `</${qualifiedName}>`;
  return markup;
}

function serializeCDATASection(node) {
  return "<![CDATA[" + node.data + "]]>";
}

function xmlSerialization(node, namespace, prefixMap, requireWellFormed, refs) {
  switch (node.nodeType) {
    case NODE_TYPES.ELEMENT_NODE:
      return serializeElement(node, namespace, prefixMap, requireWellFormed, refs);
    case NODE_TYPES.DOCUMENT_NODE:
      return serializeDocument(node, namespace, prefixMap, requireWellFormed, refs);
    case NODE_TYPES.COMMENT_NODE:
      return serializeCommentNode(node, namespace, prefixMap, requireWellFormed);
    case NODE_TYPES.TEXT_NODE:
      return serializeTextNode(node, namespace, prefixMap, requireWellFormed);
    case NODE_TYPES.DOCUMENT_FRAGMENT_NODE:
      return serializeDocumentFragment(node, namespace, prefixMap, requireWellFormed, refs);
    case NODE_TYPES.DOCUMENT_TYPE_NODE:
      return serializeDocType(node, namespace, prefixMap, requireWellFormed);
    case NODE_TYPES.PROCESSING_INSTRUCTION_NODE:
      return serializeProcessingInstr(node, namespace, prefixMap, requireWellFormed);
    case NODE_TYPES.ATTRIBUTE_NODE:
      return ""; // Attributes are captured elsewhere.
    case NODE_TYPES.CDATA_SECTION_NODE:
      return serializeCDATASection(node);
    default:
      throw new TypeError("XML serialization failed: only Nodes can be serialized.");
  }
}

module.exports = (root, { requireWellFormed = false } = {}) => {
  const initialNamespacePrefixMap = Object.create(null);
  initialNamespacePrefixMap["http://www.w3.org/XML/1998/namespace"] = ["xml"];
  return xmlSerialization(root, null, initialNamespacePrefixMap, requireWellFormed, {
    prefixIndex: 1
  });
};
