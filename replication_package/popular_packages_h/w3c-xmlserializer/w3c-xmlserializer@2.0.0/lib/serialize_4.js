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
  for (const attr of element.attributes) {
    if (attr.namespaceURI === NAMESPACES.XMLNS) {
      if (!attr.prefix) {
        defaultNamespaceAttrValue = attr.value;
        continue;
      }
      let namespaceDefinition = attr.value || "";
      if (namespaceDefinition === NAMESPACES.XML) continue;
      if (!map[namespaceDefinition]) map[namespaceDefinition] = [];
      if (!map[namespaceDefinition].includes(attr.localName)) {
        map[namespaceDefinition].push(attr.localName);
        prefixMap[attr.localName] = namespaceDefinition;
      }
    }
  }
  return defaultNamespaceAttrValue;
}

function serializeDocumentType(node, namespace, prefixMap, requireWellFormed) {
  if (requireWellFormed && !PUBID_CHAR.test(node.publicId)) {
    throw new Error("Unwell-formed: invalid publicId.");
  }
  if (requireWellFormed && (!XML_CHAR.test(node.systemId) || (node.systemId.includes('"') && node.systemId.includes("'")))) {
    throw new Error("Unwell-formed: invalid systemId.");
  }
  let markup = `<!DOCTYPE ${node.name}`;
  if (node.publicId) markup += ` PUBLIC "${node.publicId}"`;
  else if (node.systemId) markup += " SYSTEM";
  if (node.systemId) markup += ` "${node.systemId}"`;
  return markup + ">";
}

function serializeProcessingInstruction(node, namespace, prefixMap, requireWellFormed) {
  if (requireWellFormed && (node.target.includes(":") || asciiCaseInsensitiveMatch(node.target, "xml"))) {
    throw new Error("Unwell-formed: invalid processing instruction target.");
  }
  if (requireWellFormed && (!XML_CHAR.test(node.data) || node.data.includes("?>"))) {
    throw new Error("Unwell-formed: invalid processing instruction data.");
  }
  return `<?${node.target} ${node.data}?>`;
}

function serializeDocument(node, namespace, prefixMap, requireWellFormed, refs) {
  if (requireWellFormed && !node.documentElement) {
    throw new Error("Unwell-formed: document without document element.");
  }
  return Array.from(node.childNodes).reduce((doc, child) => 
    doc + xmlSerialization(child, namespace, prefixMap, requireWellFormed, refs), "");
}

function serializeDocumentFragment(node, namespace, prefixMap, requireWellFormed, refs) {
  return Array.from(node.childNodes).reduce((markup, child) => 
    markup + xmlSerialization(child, namespace, prefixMap, requireWellFormed, refs), "");
}

function serializeText(node, namespace, prefixMap, requireWellFormed) {
  if (requireWellFormed && !XML_CHAR.test(node.data)) {
    throw new Error("Unwell-formed: invalid text node data.");
  }
  return node.data.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function serializeComment(node, namespace, prefixMap, requireWellFormed) {
  if (requireWellFormed && (!XML_CHAR.test(node.data) || node.data.includes("--") || node.data.endsWith("-"))) {
    throw new Error("Unwell-formed: invalid comment node data.");
  }
  return `<!--${node.data}-->`;
}

function serializeElement(node, namespace, prefixMap, requireWellFormed, refs) {
  if (requireWellFormed && (node.localName.includes(":") || !xnv.name(node.localName))) {
    throw new Error("Unwell-formed: invalid element localName.");
  }
  let markup = "<";
  const map = { ...prefixMap };
  const localPrefixesMap = Object.create(null);
  const localDefaultNamespace = recordNamespaceInformation(node, map, localPrefixesMap);
  let inheritedNs = namespace;
  const ns = node.namespaceURI;
  let qualifiedName;

  if (inheritedNs === ns) {
    if (localDefaultNamespace !== null) ignoreNamespaceDefinitionAttr = true;
    qualifiedName = ns === NAMESPACES.XML ? "xml:" + node.localName : node.localName;
    markup += qualifiedName;
  } else {
    let { prefix } = node;
    let candidatePrefix = attributeUtils.preferredPrefixString(map, ns, prefix);
    if (prefix === "xmlns") {
      if (requireWellFormed) throw new Error("Unwell-formed: 'xmlns' as prefix.");
      candidatePrefix = "xmlns";
    }
    if (candidatePrefix) {
      qualifiedName = `${candidatePrefix}:${node.localName}`;
      markup += qualifiedName;
    } else if (prefix) {
      if (localPrefixesMap[prefix]) prefix = attributeUtils.generatePrefix(map, ns, refs.prefixIndex++);
      if (!map[ns]) map[ns] = [];
      map[ns].push(prefix);
      qualifiedName = `${prefix}:${node.localName}`;
      markup += `${qualifiedName} xmlns:${prefix}="${attributeUtils.serializeAttributeValue(ns, requireWellFormed)}"`;
    } else {
      if (localDefaultNamespace === null || localDefaultNamespace !== ns) ignoreNamespaceDefinitionAttr = true;
      qualifiedName = node.localName;
      inheritedNs = ns;
      markup += `${qualifiedName} xmlns="${attributeUtils.serializeAttributeValue(ns, requireWellFormed)}"`;
    }
  }

  markup += attributeUtils.serializeAttributes(node, map, localPrefixesMap, ignoreNamespaceDefinitionAttr, requireWellFormed, refs);

  const isHTMLVoidElement = ns === NAMESPACES.HTML && !node.childNodes.length && VOID_ELEMENTS.has(node.localName);
  if (isHTMLVoidElement || (!isHTMLVoidElement && !node.childNodes.length)) {
    markup += " />";
  } else {
    markup += ">";
    if (ns === NAMESPACES.HTML && node.localName === "template") {
      markup += xmlSerialization(node.content, inheritedNs, map, requireWellFormed, refs);
    } else {
      for (const child of node.childNodes) {
        markup += xmlSerialization(child, inheritedNs, map, requireWellFormed, refs);
      }
    }
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
    case NODE_TYPES.ATTRIBUTE_NODE:
      return "";
    case NODE_TYPES.CDATA_SECTION_NODE:
      return serializeCDATASection(node);
    default:
      throw new Error("Unserializable node type.");
  }
}

module.exports = (root, { requireWellFormed = false } = {}) => {
  const namespacePrefixMap = { "http://www.w3.org/XML/1998/namespace": ["xml"] };
  return xmlSerialization(root, null, namespacePrefixMap, requireWellFormed, { prefixIndex: 1 });
};
