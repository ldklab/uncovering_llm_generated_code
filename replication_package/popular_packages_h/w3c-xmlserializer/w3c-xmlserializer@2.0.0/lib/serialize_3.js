"use strict";

const xnv = require("xml-name-validator");
const attributeUtils = require("./attributes");
const { NAMESPACES, VOID_ELEMENTS, NODE_TYPES } = require("./constants");

const XML_CHAR = /^(\x09|\x0A|\x0D|[\x20-\uD7FF]|[\uE000-\uFFFD]|(?:[\uD800-\uDBFF][\uDC00-\uDFFF]))*$/;
const PUBID_CHAR = /^(\x20|\x0D|\x0A|[a-zA-Z0-9]|[-'()+,./:=?;!*#@$_%])*$/;

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
      if (attr.prefix === null) {
        defaultNamespaceAttrValue = attr.value;
        return;
      }
      let namespaceDefinition = attr.value || "";
      if (namespaceDefinition === NAMESPACES.XML) return;
      if (!(namespaceDefinition in map)) map[namespaceDefinition] = [];
      if (!map[namespaceDefinition].includes(attr.localName))
        map[namespaceDefinition].push(attr.localName);
      prefixMap[attr.localName] = namespaceDefinition;
    }
  });
  return defaultNamespaceAttrValue;
}

function serializeDocumentType(node, namespace, prefixMap, requireWellFormed) {
  if (requireWellFormed) {
    if (!PUBID_CHAR.test(node.publicId)) throw new Error("Failed to serialize XML: document type node publicId is not well-formed.");
    if (!XML_CHAR.test(node.systemId) || (node.systemId.includes('"') && node.systemId.includes("'")))
      throw new Error("Failed to serialize XML: document type node systemId is not well-formed.");
  }
  let markup = `<!DOCTYPE ${node.name}`;
  if (node.publicId) markup += ` PUBLIC "${node.publicId}"`;
  else if (node.systemId) markup += " SYSTEM";
  if (node.systemId) markup += ` "${node.systemId}"`;
  return markup + ">";
}

function serializeProcessingInstruction(node, namespace, prefixMap, requireWellFormed) {
  if (requireWellFormed) {
    if (node.target.includes(":") || asciiCaseInsensitiveMatch(node.target, "xml"))
      throw new Error("Failed to serialize XML: processing instruction node target is not well-formed.");
    if (!XML_CHAR.test(node.data) || node.data.includes("?>"))
      throw new Error("Failed to serialize XML: processing instruction node data is not well-formed.");
  }
  return `<?${node.target} ${node.data}?>`;
}

function serializeDocument(node, namespace, prefixMap, requireWellFormed, refs) {
  if (requireWellFormed && node.documentElement === null)
    throw new Error("Failed to serialize XML: document does not have a document element.");
  return Array.from(node.childNodes).map(child => xmlSerialization(child, namespace, prefixMap, requireWellFormed, refs)).join("");
}

function serializeDocumentFragment(node, namespace, prefixMap, requireWellFormed, refs) {
  return Array.from(node.childNodes).map(child => xmlSerialization(child, namespace, prefixMap, requireWellFormed, refs)).join("");
}

function serializeText(node, namespace, prefixMap, requireWellFormed) {
  if (requireWellFormed && !XML_CHAR.test(node.data))
    throw new Error("Failed to serialize XML: text node data is not well-formed.");
  return node.data.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function serializeComment(node, namespace, prefixMap, requireWellFormed) {
  if (requireWellFormed) {
    if (!XML_CHAR.test(node.data))
      throw new Error("Failed to serialize XML: comment node data is not well-formed.");
    if (node.data.includes("--") || node.data.endsWith("-"))
      throw new Error("Failed to serialize XML: found hyphens in illegal places in comment node data.");
  }
  return `<!--${node.data}-->`;
}

function serializeElement(node, namespace, prefixMap, requireWellFormed, refs) {
  if (requireWellFormed && (node.localName.includes(":") || !xnv.name(node.localName)))
    throw new Error("Failed to serialize XML: element node localName is not a valid XML name.");
  
  let markup = "<", qualifiedName = "", skipEndTag = false, ignoreNamespaceDefinitionAttr = false;
  const map = { ...prefixMap }, localPrefixesMap = Object.create(null);
  const localDefaultNamespace = recordNamespaceInformation(node, map, localPrefixesMap);
  const ns = node.namespaceURI;
  let inheritedNs = namespace;

  if (inheritedNs === ns) {
    if (localDefaultNamespace !== null) ignoreNamespaceDefinitionAttr = true;
    qualifiedName = ns === NAMESPACES.XML ? "xml:" + node.localName : node.localName;
    markup += qualifiedName;
  } else {
    let { prefix } = node;
    let candidatePrefix = attributeUtils.preferredPrefixString(map, ns, prefix);
    if (prefix === "xmlns") {
      if (requireWellFormed) throw new Error("Failed to serialize XML: element nodes can't have a prefix of \"xmlns\".");
      candidatePrefix = "xmlns";
    }
    if (candidatePrefix !== null) {
      qualifiedName = candidatePrefix + ":" + node.localName;
      markup += qualifiedName;
      if (localDefaultNamespace !== null && localDefaultNamespace !== NAMESPACES.XML)
        inheritedNs = localDefaultNamespace || null;
    } else if (prefix !== null) {
      if (prefix in localPrefixesMap) prefix = attributeUtils.generatePrefix(map, ns, refs.prefixIndex++);
      map[ns] = map[ns] || [];
      map[ns].push(prefix);
      qualifiedName = prefix + ":" + node.localName;
      markup += `${qualifiedName} xmlns:${prefix}="${attributeUtils.serializeAttributeValue(ns, requireWellFormed)}"`;
    } else if (localDefaultNamespace === null || localDefaultNamespace !== ns) {
      ignoreNamespaceDefinitionAttr = true;
      qualifiedName = node.localName;
      inheritedNs = ns;
      markup += `${qualifiedName} xmlns="${attributeUtils.serializeAttributeValue(ns, requireWellFormed)}"`;
    } else {
      qualifiedName = node.localName;
      inheritedNs = ns;
      markup += qualifiedName;
    }
  }
  
  markup += attributeUtils.serializeAttributes(node, map, localPrefixesMap, ignoreNamespaceDefinitionAttr, requireWellFormed, refs);
  if ((ns === NAMESPACES.HTML && !node.childNodes.length && VOID_ELEMENTS.has(node.localName)) || (ns !== NAMESPACES.HTML && !node.childNodes.length)) {
    markup += ns === NAMESPACES.HTML ? " /" : "/";
    skipEndTag = true;
  }
  markup += ">";
  
  if (!skipEndTag) {
    if (ns === NAMESPACES.HTML && node.localName === "template") {
      markup += xmlSerialization(node.content, inheritedNs, map, requireWellFormed, refs);
    } else {
      node.childNodes.forEach(child => {
        markup += xmlSerialization(child, inheritedNs, map, requireWellFormed, refs);
      });
    }
    markup += `</${qualifiedName}>`;
  }
  
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
      return serializeComment(node, namespace, prefixMap, requireWellFormed);
    case NODE_TYPES.TEXT_NODE:
      return serializeText(node, namespace, prefixMap, requireWellFormed);
    case NODE_TYPES.DOCUMENT_FRAGMENT_NODE:
      return serializeDocumentFragment(node, namespace, prefixMap, requireWellFormed, refs);
    case NODE_TYPES.DOCUMENT_TYPE_NODE:
      return serializeDocumentType(node, namespace, prefixMap, requireWellFormed);
    case NODE_TYPES.PROCESSING_INSTRUCTION_NODE:
      return serializeProcessingInstruction(node, namespace, prefixMap, requireWellFormed);
    case NODE_TYPES.ATTRIBUTE_NODE:
      return "";
    case NODE_TYPES.CDATA_SECTION_NODE:
      return serializeCDATASection(node);
    default:
      throw new TypeError("Failed to serialize XML: only Nodes can be serialized.");
  }
}

module.exports = (root, { requireWellFormed = false } = {}) => {
  const namespacePrefixMap = Object.create(null);
  namespacePrefixMap["http://www.w3.org/XML/1998/namespace"] = ["xml"];
  return xmlSerialization(root, null, namespacePrefixMap, requireWellFormed, { prefixIndex: 1 });
};
