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
  for (let attr of element.attributes) {
    if (attr.namespaceURI !== NAMESPACES.XMLNS) continue;
    if (!attr.prefix) {
      defaultNamespaceAttrValue = attr.value;
      continue;
    }
    let namespaceDefinition = attr.value || "";
    if (namespaceDefinition === NAMESPACES.XML) continue;

    if (!(namespaceDefinition in map)) map[namespaceDefinition] = [];
    map[namespaceDefinition].push(attr.localName);
    prefixMap[attr.localName] = namespaceDefinition;
  }
  return defaultNamespaceAttrValue;
}

function serializeDocumentType(node, namespace, prefixMap, requireWellFormed) {
  if (requireWellFormed && !PUBID_CHAR.test(node.publicId))
    throw new Error("Failed to serialize XML: document type node publicId is not well-formed.");
  if (requireWellFormed && (!XML_CHAR.test(node.systemId) || (node.systemId.includes('"') && node.systemId.includes("'"))))
    throw new Error("Failed to serialize XML: document type node systemId is not well-formed.");
  
  let markup = `<!DOCTYPE ${node.name}`;
  if (node.publicId) markup += ` PUBLIC "${node.publicId}"`;
  else if (node.systemId) markup += " SYSTEM";
  if (node.systemId) markup += ` "${node.systemId}"`;
  return markup + ">";
}

function serializeProcessingInstruction(node, namespace, prefixMap, requireWellFormed) {
  if (requireWellFormed && (node.target.includes(":") || asciiCaseInsensitiveMatch(node.target, "xml")))
    throw new Error("Failed to serialize XML: processing instruction node target is not well-formed.");
  if (requireWellFormed && (!XML_CHAR.test(node.data) || node.data.includes("?>")))
    throw new Error("Failed to serialize XML: processing instruction node data is not well-formed.");
  return `<?${node.target} ${node.data}?>`;
}

function serializeDocument(node, namespace, prefixMap, requireWellFormed, refs) {
  if (requireWellFormed && !node.documentElement)
    throw new Error("Failed to serialize XML: document does not have a document element.");
  return Array.from(node.childNodes).reduce(
    (markup, child) => markup + xmlSerialization(child, namespace, prefixMap, requireWellFormed, refs),
    ""
  );
}

function serializeDocumentFragment(node, namespace, prefixMap, requireWellFormed, refs) {
  return Array.from(node.childNodes).reduce(
    (markup, child) => markup + xmlSerialization(child, namespace, prefixMap, requireWellFormed, refs),
    ""
  );
}

function serializeText(node, namespace, prefixMap, requireWellFormed) {
  if (requireWellFormed && !XML_CHAR.test(node.data))
    throw new Error("Failed to serialize XML: text node data is not well-formed.");
  return node.data.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function serializeComment(node, namespace, prefixMap, requireWellFormed) {
  if (requireWellFormed && !XML_CHAR.test(node.data))
    throw new Error("Failed to serialize XML: comment node data is not well-formed.");
  if (requireWellFormed && (node.data.includes("--") || node.data.endsWith("-")))
    throw new Error("Failed to serialize XML: found hyphens in illegal places in comment node data.");
  return `<!--${node.data}-->`;
}

function serializeElement(node, namespace, prefixMap, requireWellFormed, refs) {
  if (requireWellFormed && (node.localName.includes(":") || !xnv.name(node.localName)))
    throw new Error("Failed to serialize XML: element node localName is not a valid XML name.");
  
  const map = { ...prefixMap };
  const localPrefixesMap = Object.create(null);
  const localDefaultNamespace = recordNamespaceInformation(node, map, localPrefixesMap);
  let inheritedNs = namespace;
  const ns = node.namespaceURI;
  let qualifiedName, markup = "<", skipEndTag = false, ignoreNamespaceDefinitionAttr = false;

  // Determine the qualified name and append it to markup
  ({ qualifiedName, markup, inheritedNs, ignoreNamespaceDefinitionAttr } = determineQualifiedNameAndMarkup(
    node,
    ns,
    inheritedNs,
    map,
    localPrefixesMap,
    localDefaultNamespace,
    markup,
    requireWellFormed
  ));

  // Serialize attributes
  markup += attributeUtils.serializeAttributes(node, map, localPrefixesMap, ignoreNamespaceDefinitionAttr, requireWellFormed, refs);

  // Check for void elements
  if (ns === NAMESPACES.HTML && VOID_ELEMENTS.has(node.localName) && node.childNodes.length === 0) {
    markup += " /";
    skipEndTag = true;
  } else if (ns !== NAMESPACES.HTML && node.childNodes.length === 0) {
    markup += "/";
    skipEndTag = true;
  }
  markup += ">";

  if (!skipEndTag) {
    // Serialize child nodes
    markup = serializeChildNodes(node, ns, inheritedNs, map, requireWellFormed, refs, markup);
  } else {
    return markup;
  }

  markup += `</${qualifiedName}>`;
  return markup;
}

function serializeCDATASection(node) {
  return "<![CDATA[" + node.data + "]]>";
}

function determineQualifiedNameAndMarkup(node, ns, inheritedNs, map, localPrefixesMap, localDefaultNamespace, markup, requireWellFormed) {
  let qualifiedName = "";
  let ignoreNamespaceDefinitionAttr = false;

  if (inheritedNs === ns) {
    if (localDefaultNamespace !== null) ignoreNamespaceDefinitionAttr = true;
    if (ns === NAMESPACES.XML) qualifiedName = "xml:" + node.localName;
    else qualifiedName = node.localName;
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
      if (localDefaultNamespace !== null && localDefaultNamespace !== NAMESPACES.XML)
        inheritedNs = localDefaultNamespace === "" ? null : localDefaultNamespace;
      markup += qualifiedName;
    } else if (prefix !== null) {
      if (prefix in localPrefixesMap) {
        prefix = attributeUtils.generatePrefix(map, ns, refs.prefixIndex++);
      }
      if (map[ns]) map[ns].push(prefix);
      else map[ns] = [prefix];
      qualifiedName = prefix + ":" + node.localName;
      markup += `${qualifiedName} xmlns:${prefix}="${attributeUtils.serializeAttributeValue(ns, requireWellFormed)}"`;
      if (localDefaultNamespace !== null) inheritedNs = localDefaultNamespace === "" ? null : localDefaultNamespace;
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
  return { qualifiedName, markup, inheritedNs, ignoreNamespaceDefinitionAttr };
}

function serializeChildNodes(node, ns, inheritedNs, map, requireWellFormed, refs, markup) {
  if (ns === NAMESPACES.HTML && node.localName === "template") {
    markup += xmlSerialization(node.content, inheritedNs, map, requireWellFormed, refs);
  } else {
    for (const child of node.childNodes) {
      markup += xmlSerialization(child, inheritedNs, map, requireWellFormed, refs);
    }
  }
  return markup;
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
  namespacePrefixMap[NAMESPACES.XML] = ["xml"];
  return xmlSerialization(root, null, namespacePrefixMap, requireWellFormed, { prefixIndex: 1 });
};
