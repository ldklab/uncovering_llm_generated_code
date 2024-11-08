"use strict";

const xmlNameValidator = require("xml-name-validator");
const attributeUtils = require("./attributes");
const { NAMESPACES, VOID_ELEMENTS, NODE_TYPES } = require("./constants");

const XML_CHAR_REGEX = /^(\x09|\x0A|\x0D|[\x20-\uD7FF]|[\uE000-\uFFFD]|[\u{10000}-\u{10FFFF}])*$/u;
const PUBID_CHAR_REGEX = /^(\x20|\x0D|\x0A|[a-zA-Z0-9]|[-'()+,./:=?;!*#@$_%])*$/u;

function isAsciiCaseInsensitiveMatch(str1, str2) {
  if (str1.length !== str2.length) return false;
  for (let i = 0; i < str1.length; ++i) {
    if ((str1.charCodeAt(i) | 32) !== (str2.charCodeAt(i) | 32)) return false;
  }
  return true;
}

function gatherNamespaceInfo(element, map, prefixMap) {
  let defaultNSValue = null;
  element.attributes.forEach(attr => {
    if (attr.namespaceURI === NAMESPACES.XMLNS) {
      if (attr.prefix === null) {
        defaultNSValue = attr.value;
        return;
      }

      let namespaceDef = attr.value;
      if (namespaceDef === NAMESPACES.XML) return;
      if (namespaceDef === null) namespaceDef = "";

      if (namespaceDef in map && map[namespaceDef].includes(attr.localName)) return;

      if (!(namespaceDef in map)) map[namespaceDef] = [];
      map[namespaceDef].push(attr.localName);
      prefixMap[attr.localName] = namespaceDef;
    }
  });
  return defaultNSValue;
}

function serializeDocType(node, namespace, prefixMap, requireWellFormed) {
  if (requireWellFormed && !PUBID_CHAR_REGEX.test(node.publicId)) {
    throw new Error("Failed to serialize XML: document type node publicId is not well-formed.");
  }
  if (requireWellFormed && (!XML_CHAR_REGEX.test(node.systemId) || (node.systemId.includes('"') && node.systemId.includes("'")))) {
    throw new Error("Failed to serialize XML: document type node systemId is not well-formed.");
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

function serializeProcInstruction(node, namespace, prefixMap, requireWellFormed) {
  if (requireWellFormed && (node.target.includes(":") || isAsciiCaseInsensitiveMatch(node.target, "xml"))) {
    throw new Error("Failed to serialize XML: processing instruction node target is not well-formed.");
  }
  if (requireWellFormed && (!XML_CHAR_REGEX.test(node.data) || node.data.includes("?>"))) {
    throw new Error("Failed to serialize XML: processing instruction node data is not well-formed.");
  }
  return `<?${node.target} ${node.data}?>`;
}

function serializeDoc(node, namespace, prefixMap, requireWellFormed, refs) {
  if (requireWellFormed && !node.documentElement) {
    throw new Error("Failed to serialize XML: document does not have a document element.");
  }
  return Array.from(node.childNodes).reduce((acc, child) => {
    return acc + xmlSerializeNode(child, namespace, prefixMap, requireWellFormed, refs);
  }, '');
}

function serializeDocFragment(node, namespace, prefixMap, requireWellFormed, refs) {
  return Array.from(node.childNodes).reduce((markup, child) => {
    return markup + xmlSerializeNode(child, namespace, prefixMap, requireWellFormed, refs);
  }, '');
}

function serializeTextNode(node, namespace, prefixMap, requireWellFormed) {
  if (requireWellFormed && !XML_CHAR_REGEX.test(node.data)) {
    throw new Error("Failed to serialize XML: text node data is not well-formed.");
  }
  return node.data
    .replace(/&/ug, "&amp;")
    .replace(/</ug, "&lt;")
    .replace(/>/ug, "&gt;");
}

function serializeCommentNode(node, namespace, prefixMap, requireWellFormed) {
  if (requireWellFormed && !XML_CHAR_REGEX.test(node.data)) {
    throw new Error("Failed to serialize XML: comment node data is not well-formed.");
  }
  if (requireWellFormed && (node.data.includes("--") || node.data.endsWith("-"))) {
    throw new Error("Failed to serialize XML: found hyphens in illegal places in comment node data.");
  }
  return `<!--${node.data}-->`;
}

function serializeElementNode(node, namespace, prefixMap, requireWellFormed, refs) {
  if (requireWellFormed && (node.localName.includes(":") || !xmlNameValidator.name(node.localName))) {
    throw new Error("Failed to serialize XML: element node localName is not a valid XML name.");
  }

  let markup = "<";
  let qualifiedName = "";
  let skipEndTag = false;
  let ignoreNSDefAttr = false;
  const currentMap = { ...prefixMap };
  const localPrefixMap = Object.create(null);
  const localDefaultNS = gatherNamespaceInfo(node, currentMap, localPrefixMap);
  let inheritedNS = namespace;
  const elementNS = node.namespaceURI;

  if (inheritedNS === elementNS) {
    if (localDefaultNS !== null) ignoreNSDefAttr = true;
    if (elementNS === NAMESPACES.XML) {
      qualifiedName = `xml:${node.localName}`;
    } else {
      qualifiedName = node.localName;
    }
    markup += qualifiedName;
  } else {
    let prefix = node.prefix;
    let candidatePrefix = attributeUtils.preferredPrefixString(currentMap, elementNS, prefix);

    if (prefix === "xmlns") {
      if (requireWellFormed) throw new Error("Failed to serialize XML: element nodes can't have a prefix of \"xmlns\".");
      candidatePrefix = "xmlns"
    }

    if (candidatePrefix !== null) {
      qualifiedName = `${candidatePrefix}:${node.localName}`;

      if (localDefaultNS !== null && localDefaultNS !== NAMESPACES.XML) {
        inheritedNS = localDefaultNS === "" ? null : localDefaultNS;
      }

      markup += qualifiedName;
    } else if (prefix !== null) {
      if (prefix in localPrefixMap) prefix = attributeUtils.generatePrefix(currentMap, elementNS, refs.prefixIndex++);

      if (elementNS in currentMap) {
        currentMap[elementNS].push(prefix);
      } else {
        currentMap[elementNS] = [prefix];
      }

      qualifiedName = `${prefix}:${node.localName}`;
      markup += `${qualifiedName} xmlns:${prefix}="${attributeUtils.serializeAttributeValue(elementNS, requireWellFormed)}"`;

      if (localDefaultNS !== null) inheritedNS = localDefaultNS === "" ? null : localDefaultNS;
    } else if (localDefaultNS === null || localDefaultNS !== elementNS) {
      ignoreNSDefAttr = true;
      qualifiedName = node.localName;
      inheritedNS = elementNS;
      markup += `${qualifiedName} xmlns="${attributeUtils.serializeAttributeValue(elementNS, requireWellFormed)}"`;
    } else {
      qualifiedName = node.localName;
      inheritedNS = elementNS;
      markup += qualifiedName;
    }
  }

  markup += attributeUtils.serializeAttributes(node, currentMap, localPrefixMap, ignoreNSDefAttr, requireWellFormed, refs);

  if (elementNS === NAMESPACES.HTML && node.childNodes.length === 0 && VOID_ELEMENTS.has(node.localName)) {
    markup += " /";
    skipEndTag = true;
  } else if (elementNS !== NAMESPACES.HTML && node.childNodes.length === 0) {
    markup += "/";
    skipEndTag = true;
  }
  markup += ">";

  if (skipEndTag) return markup;

  if (elementNS === NAMESPACES.HTML && node.localName === "template") {
    markup += xmlSerializeNode(node.content, inheritedNS, currentMap, requireWellFormed, refs);
  } else {
    node.childNodes.forEach(child => {
      markup += xmlSerializeNode(child, inheritedNS, currentMap, requireWellFormed, refs);
    });
  }

  markup += `</${qualifiedName}>`;
  return markup;
}

function serializeCDATASectionNode(node) {
  return `<![CDATA[${node.data}]]>`;
}

function xmlSerializeNode(node, namespace, prefixMap, requireWellFormed, refs) {
  switch (node.nodeType) {
    case NODE_TYPES.ELEMENT_NODE:
      return serializeElementNode(node, namespace, prefixMap, requireWellFormed, refs);
    case NODE_TYPES.DOCUMENT_NODE:
      return serializeDoc(node, namespace, prefixMap, requireWellFormed, refs);
    case NODE_TYPES.COMMENT_NODE:
      return serializeCommentNode(node, namespace, prefixMap, requireWellFormed);
    case NODE_TYPES.TEXT_NODE:
      return serializeTextNode(node, namespace, prefixMap, requireWellFormed);
    case NODE_TYPES.DOCUMENT_FRAGMENT_NODE:
      return serializeDocFragment(node, namespace, prefixMap, requireWellFormed, refs);
    case NODE_TYPES.DOCUMENT_TYPE_NODE:
      return serializeDocType(node, namespace, prefixMap, requireWellFormed);
    case NODE_TYPES.PROCESSING_INSTRUCTION_NODE:
      return serializeProcInstruction(node, namespace, prefixMap, requireWellFormed);
    case NODE_TYPES.ATTRIBUTE_NODE:
      return ""; // Attributes are handled within elements
    case NODE_TYPES.CDATA_SECTION_NODE:
      return serializeCDATASectionNode(node);
    default:
      throw new TypeError("Failed to serialize XML: only Nodes can be serialized.");
  }
}

module.exports = (root, options = { requireWellFormed: false }) => {
  const namespacePrefixMap = Object.create(null);
  namespacePrefixMap["http://www.w3.org/XML/1998/namespace"] = ["xml"];
  return xmlSerializeNode(root, null, namespacePrefixMap, options.requireWellFormed, { prefixIndex: 1 });
};
