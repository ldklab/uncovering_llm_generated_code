// Package: htmlparser2-node-types

// Define various node types used in the htmlparser2's DOM representation.
const NodeTypes = Object.freeze({
    ELEMENT_NODE: "ElementNode",            // Represents an HTML element like <div> or <a>.
    TEXT_NODE: "TextNode",                  // Represents text within HTML elements.
    COMMENT_NODE: "CommentNode",            // Represents HTML comments (<!-- comment -->).
    DOCUMENT_NODE: "DocumentNode",          // Represents the entire HTML document.
    DOCUMENT_TYPE_NODE: "DocumentTypeNode", // Represents the document type (e.g., <!DOCTYPE html>).
    PROCESSING_INSTRUCTION_NODE: "ProcessingInstructionNode", // Represents a processing instruction.
    CDATA_SECTION_NODE: "CDataSectionNode", // Represents a CDATA section in XML.
    DOCUMENT_FRAGMENT_NODE: "DocumentFragmentNode", // Represents a minimal document without a parent.
    ATTRIBUTE_NODE: "AttributeNode",        // Represents an element's attribute (e.g., class="myClass").
});

module.exports = NodeTypes;

// Usage Example
const nodeTypes = require('./path/to/htmlparser2-node-types');

// Accessing node types
console.log("An HTML element node type: ", nodeTypes.ELEMENT_NODE);
console.log("A text node type: ", nodeTypes.TEXT_NODE);
console.log("A comment node type: ", nodeTypes.COMMENT_NODE);
