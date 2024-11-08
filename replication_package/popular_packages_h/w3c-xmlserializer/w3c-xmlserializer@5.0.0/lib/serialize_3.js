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
  for (const attr of element.attributes) {
    if (attr.namespaceURI === NAMESPACES.XMLNS) {
      if (attr.prefix === null) {
        defaultNamespaceAttrValue = attr.value;
        continue;
      }
      let nsDefinition = attr.value === null ? "" : attr.value;
      if (nsDefinition === NAMESPACES.XML) continue;

      map[nsDefinition] ??= [];
      if (!map[nsDefinition].includes(attr.localName)) {
        map[nsDefinition].push(attr.localName);
        prefixMap[attr.localName] = nsDefinition;
      }
    }
  }
  return defaultNamespaceAttrValue;
}

function serializeDocumentType(node, namespace, prefixMap, requireWellFormed) {
  if (requireWellFormed) {
    if (!PUBID_CHAR.test(node.publicId)) {
      throw new Error("Invalid publicId in document type.");
    }
    if (!XML_CHAR.test(node.systemId) || (node.systemId.includes('"') && node.systemId.includes("'"))) {
      throw new Error("Invalid systemId in document type.");
    }
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
  return `${markup}>`;
}

function serializeProcessingInstruction(node, namespace, prefixMap, requireWellFormed) {
  if (requireWellFormed) {
    if (node.target.includes(":") || asciiCaseInsensitiveMatch(node.target, "xml")) {
      throw new Error("Invalid target in processing instruction.");
    }
    if (!XML_CHAR.test(node.data) || node.data.includes("?>")) {
      throw new Error("Invalid data in processing instruction.");
    }
  }
  return `<?${node.target} ${node.data}?>`;
}

function serializeDocument(node, namespace, prefixMap, requireWellFormed, refs) {
  if (requireWellFormed && !node.documentElement) {
    throw new Error("Document must have a document element.");
  }
  return Array.from(node.childNodes).map(child =>
    xmlSerialization(child, namespace, prefixMap, requireWellFormed, refs)
  ).join("");
}

function serializeDocumentFragment(node, namespace, prefixMap, requireWellFormed, refs) {
  return Array.from(node.childNodes).map(child =>
    xmlSerialization(child, namespace, prefixMap, requireWellFormed, refs)
  ).join("");
}

function serializeText(node, namespace, prefixMap, requireWellFormed) {
  if (requireWellFormed && !XML_CHAR.test(node.data)) {
    throw new Error("Invalid text node data.");
  }
  return node.data.replace(/&/ug, "&amp;").replace(/</ug, "&lt;").replace(/>/ug, "&gt;");
}

function serializeComment(node, namespace, prefixMap, requireWellFormed) {
  if (requireWellFormed) {
    if (!XML_CHAR.test(node.data) || node.data.includes("--") || node.data.endsWith("-")) {
      throw new Error("Invalid comment node data.");
    }
  }
  return `<!--${node.data}-->`;
}

function serializeElement(node, namespace, prefixMap, requireWellFormed, refs) {
  if (requireWellFormed) {
    if (node.localName.includes(":") || !xnv.name(node.localName)) {
      throw new Error("Invalid element node localName.");
    }
  }

  let markup = "<";
  const map = { ...prefixMap };
  const localPrefixesMap = Object.create(null);
  const localDefaultNamespace = recordNamespaceInformation(node, map, localPrefixesMap);
  let inheritedNs = namespace;
  const ns = node.namespaceURI;

  const prefixInfo = getElementPrefixInfo(ns, inheritedNs, node, localDefaultNamespace, map);
  const { qualifiedName, ignoreNamespaceDefinitionAttr, inheritedNsResult } = prefixInfo;

  markup += qualifiedName + attributeUtils.serializeAttributes(
    node, map, localPrefixesMap, ignoreNamespaceDefinitionAttr, requireWellFormed, refs
  );

  const isVoid = ns === NAMESPACES.HTML && VOID_ELEMENTS.has(node.localName);
  if (isVoid && !node.childNodes.length) {
    return markup + " />";
  } else if (!isVoid && !node.childNodes.length && ns !== NAMESPACES.HTML) {
    return markup + "/>";
  }

  markup += ">";
  inheritedNs = inheritedNsResult;

  const nodeContent = ns === NAMESPACES.HTML && node.localName === "template" ? node.content : node;
  Array.from(nodeContent.childNodes).forEach(child => {
    markup += xmlSerialization(child, inheritedNs, map, requireWellFormed, refs);
  });

  return markup + `</${qualifiedName}>`;
}

function getElementPrefixInfo(ns, inheritedNs, node, localDefaultNamespace, map) {
  let ignoreNamespaceDefinitionAttr = false;
  let qualifiedName = "";
  let inheritedNsResult = inheritedNs;

  if (inheritedNs === ns) {
    ignoreNamespaceDefinitionAttr = localDefaultNamespace !== null;
    if (ns === NAMESPACES.XML) {
      qualifiedName = `xml:${node.localName}`;
    } else {
      qualifiedName = node.localName;
    }
  } else {
    let candidatePrefix = attributeUtils.preferredPrefixString(map, ns, node.prefix);
    if (node.prefix === "xmlns") throw new Error("Invalid prefix 'xmlns' in element node.");

    if (candidatePrefix !== null) {
      qualifiedName = `${candidatePrefix}:${node.localName}`;
    } else if (node.prefix !== null) {
      qualifiedName = resolvePrefixForElement(node, ns, map);
    } else if (localDefaultNamespace === null || localDefaultNamespace !== ns) {
      qualifiedName = assignNamespaceForElement(node, ns, map, true);
      inheritedNsResult = ns;
    } else {
      qualifiedName = node.localName;
      inheritedNsResult = ns;
    }
  }

  return { qualifiedName, ignoreNamespaceDefinitionAttr, inheritedNsResult };
}

function resolvePrefixForElement(node, ns, map) {
  let prefix = node.prefix;
  if (prefix in map && map[prefix].includes(node.localName)) {
    prefix = attributeUtils.generatePrefix(map, ns, 1); // Assuming initial index is 1
  }
  map[ns].push(prefix);
  return `${prefix}:${node.localName} xmlns:${prefix}="${attributeUtils.serializeAttributeValue(ns, true)}"`;
}

function assignNamespaceForElement(node, ns, map, ignoreNamespace) {
  return node.localName + (!ignoreNamespace ? ` xmlns="${attributeUtils.serializeAttributeValue(ns, true)}"` : "");
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
      throw new TypeError("Only Nodes can be serialized.");
  }
}

module.exports = (root, { requireWellFormed = false } = {}) => {
  const namespacePrefixMap = { "http://www.w3.org/XML/1998/namespace": ["xml"] };
  return xmlSerialization(root, null, namespacePrefixMap, requireWellFormed, { prefixIndex: 1 });
};
