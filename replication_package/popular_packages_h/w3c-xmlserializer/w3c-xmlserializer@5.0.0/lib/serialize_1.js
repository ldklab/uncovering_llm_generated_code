"use strict";

const xnv = require("xml-name-validator");
const attributeUtils = require("./attributes");
const { NAMESPACES, VOID_ELEMENTS, NODE_TYPES } = require("./constants");

const XML_CHAR = /^(\x09|\x0A|\x0D|[\x20-\uD7FF]|[\uE000-\uFFFD]|[\u{10000}-\u{10FFFF}])*$/u;
const PUBID_CHAR = /^(\x20|\x0D|\x0A|[a-zA-Z0-9]|[-'()+,./:=?;!*#@$_%])*$/u;

function asciiCaseInsensitiveMatch(a, b) {
  if (a.length !== b.length) return false;

  for (let i = 0; i < a.length; ++i) {
    if ((a.charCodeAt(i) | 32) !== (b.charCodeAt(i) | 32)) return false;
  }
  return true;
}

function recordNamespaceInformation(element, map, prefixMap) {
  let defaultNamespaceAttrValue = null;
  element.attributes.forEach(attr => {
    if (attr.namespaceURI === NAMESPACES.XMLNS) {
      if (!attr.prefix) defaultNamespaceAttrValue = attr.value;
      else {
        let nsDef = attr.value || "";
        if (nsDef === NAMESPACES.XML) return;

        if (!(nsDef in map)) map[nsDef] = [];
        if (!map[nsDef].includes(attr.localName)) {
          map[nsDef].push(attr.localName);
          prefixMap[attr.localName] = nsDef;
        }
      }
    }
  });
  return defaultNamespaceAttrValue;
}

function serializeDocumentType(node, namespace, prefixMap, requireWellFormed) {
  if (requireWellFormed && !PUBID_CHAR.test(node.publicId)) {
    throw new Error("Invalid publicId.");
  }
  if (requireWellFormed && (!XML_CHAR.test(node.systemId) || /['"]/.test(node.systemId))) {
    throw new Error("Invalid systemId.");
  }

  return `<!DOCTYPE ${node.name}${node.publicId ? ` PUBLIC "${node.publicId}"` : node.systemId ? " SYSTEM" : ""}${node.systemId ? ` "${node.systemId}"` : ""}>`;
}

function serializeProcessingInstruction(node, namespace, prefixMap, requireWellFormed) {
  if (requireWellFormed && (node.target.includes(":") || asciiCaseInsensitiveMatch(node.target, "xml"))) {
    throw new Error("Invalid processing instruction target.");
  }
  if (requireWellFormed && (!XML_CHAR.test(node.data) || node.data.includes("?>"))) {
    throw new Error("Invalid processing instruction data.");
  }
  return `<?${node.target} ${node.data}?>`;
}

function serializeDocument(node, namespace, prefixMap, requireWellFormed, refs) {
  if (requireWellFormed && !node.documentElement) {
    throw new Error("Document lacks document element.");
  }

  return Array.from(node.childNodes)
    .map(child => xmlSerialization(child, namespace, prefixMap, requireWellFormed, refs))
    .join("");
}

function serializeDocumentFragment(node, namespace, prefixMap, requireWellFormed, refs) {
  return Array.from(node.childNodes)
    .map(child => xmlSerialization(child, namespace, prefixMap, requireWellFormed, refs))
    .join("");
}

function serializeText(node, namespace, prefixMap, requireWellFormed) {
  if (requireWellFormed && !XML_CHAR.test(node.data)) {
    throw new Error("Invalid text node.");
  }
  return node.data.replace(/&/ug, "&amp;").replace(/</ug, "&lt;").replace(/>/ug, "&gt;");
}

function serializeComment(node, namespace, prefixMap, requireWellFormed) {
  if (requireWellFormed && !XML_CHAR.test(node.data)) {
    throw new Error("Invalid comment node.");
  }
  if (requireWellFormed && (node.data.includes("--") || node.data.endsWith("-"))) {
    throw new Error("Invalid placement of hyphens in comment.");
  }
  return `<!--${node.data}-->`;
}

function serializeElement(node, namespace, prefixMap, requireWellFormed, refs) {
  if (requireWellFormed && (node.localName.includes(":") || !xnv.name(node.localName))) {
    throw new Error("Invalid element localName.");
  }
  let markup = "<", qualifiedName = "", skipEndTag = false, ignoreNamespaceDefinitionAttr = false;
  const map = { ...prefixMap }, localPrefixesMap = Object.create(null);
  const localDefaultNamespace = recordNamespaceInformation(node, map, localPrefixesMap);
  let inheritedNs = namespace;
  const ns = node.namespaceURI;

  if (inheritedNs === ns) {
    if (localDefaultNamespace !== null) ignoreNamespaceDefinitionAttr = true;
    qualifiedName = ns === NAMESPACES.XML ? `xml:${node.localName}` : node.localName;
    markup += qualifiedName;
  } else {
    let { prefix } = node, candidatePrefix = attributeUtils.preferredPrefixString(map, ns, prefix);
    if (prefix === "xmlns" && requireWellFormed) {
      throw new Error("Invalid prefix `xmlns`.");
    }
    candidatePrefix = candidatePrefix ?? (prefix || attributeUtils.generatePrefix(map, ns, refs.prefixIndex++));
    
    if (!candidatePrefix || localPrefixesMap[candidatePrefix]) {
      ignoreNamespaceDefinitionAttr = true;
      qualifiedName = node.localName;
      markup += `${qualifiedName} xmlns="${attributeUtils.serializeAttributeValue(ns, requireWellFormed)}"`;
    } else {
      qualifiedName = `${candidatePrefix}:${node.localName}`;
      markup += `${qualifiedName} xmlns:${candidatePrefix}="${attributeUtils.serializeAttributeValue(ns, requireWellFormed)}"`;
      if (map[ns]) map[ns].push(candidatePrefix);
      else map[ns] = [candidatePrefix];
    }

    inheritedNs = localDefaultNamespace ? (localDefaultNamespace || null) : ns;
  }

  markup += attributeUtils.serializeAttributes(node, map, localPrefixesMap, ignoreNamespaceDefinitionAttr, requireWellFormed, refs);

  if (ns === NAMESPACES.HTML && !node.childNodes.length && VOID_ELEMENTS.has(node.localName)) {
    markup += " /";
    skipEndTag = true;
  } else if (ns !== NAMESPACES.HTML && !node.childNodes.length) {
    markup += "/";
    skipEndTag = true;
  }
  markup += ">";

  if (!skipEndTag) {
    markup += ns === NAMESPACES.HTML && node.localName === "template" ?
      xmlSerialization(node.content, inheritedNs, map, requireWellFormed, refs) :
      Array.from(node.childNodes).map(child => xmlSerialization(child, inheritedNs, map, requireWellFormed, refs)).join("");
    markup += `</${qualifiedName}>`;
  }

  return markup;
}

function serializeCDATASection(node) {
  return `<![CDATA[${node.data}]]>`;
}

function xmlSerialization(node, namespace, prefixMap, requireWellFormed, refs) {
  switch (node.nodeType) {
    case NODE_TYPES.ELEMENT_NODE:
      return serializeElement(node, namespace, prefixMap, requireWellFormed, refs);
    case NODE_TYPES.DOCUMENT_NODE:
      return serializeDocument(node, namespace, prefixMap, requireWellFormed, refs);
    case NODE_TYPES.COMMENT_NODE:
      return serializeComment(node, namespace, prefixMap, requireWellFormed);
    case NODE_TYPES.TEXT_NODE:
      return serializeText(node, namespace, prefixMap, requireWellFormed);
    case NODE_TYPES.DOCUMENT_FRAGMENT_NODE:
      return serializeDocumentFragment(node, namespace, prefixMap, requireWellFormed, refs);
    case NODE_TYPES.DOCUMENT_TYPE_NODE:
      return serializeDocumentType(node, namespace, prefixMap, requireWellFormed);
    case NODE_TYPES.PROCESSING_INSTRUCTION_NODE:
      return serializeProcessingInstruction(node, namespace, prefixMap, requireWellFormed);
    case NODE_TYPES.CDATA_SECTION_NODE:
      return serializeCDATASection(node);
    default:
      throw new TypeError("Invalid node type for serialization.");
  }
}

module.exports = (root, { requireWellFormed = false } = {}) => {
  const namespacePrefixMap = Object.create(null);
  namespacePrefixMap[NAMESPACES.XML] = ["xml"];
  return xmlSerialization(root, null, namespacePrefixMap, requireWellFormed, { prefixIndex: 1 });
};
