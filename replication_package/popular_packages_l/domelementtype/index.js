// Package: htmlparser2-node-types

// Define all the node types in htmlparser2's DOM.
const NodeTypes = {
    ELEMENT_NODE: "ElementNode",            // Represents an HTML element (like <div> or <a>).
    TEXT_NODE: "TextNode",                  // Represents the text content within elements.
    COMMENT_NODE: "CommentNode",            // Represents an HTML comment (<!-- comment -->).
    DOCUMENT_NODE: "DocumentNode",          // Represents the entire HTML document.
    DOCUMENT_TYPE_NODE: "DocumentTypeNode", // Represents the type of document (e.g., <!DOCTYPE html>).
    PROCESSING_INSTRUCTION_NODE: "ProcessingInstructionNode", // Represents a processing instruction.
    CDATA_SECTION_NODE: "CDataSectionNode", // Represents a CDATA section in XML.
    DOCUMENT_FRAGMENT_NODE: "DocumentFragmentNode", // Represents a minimal document object with no parent.
    ATTRIBUTE_NODE: "AttributeNode",        // Represents an attribute of an element (e.g., class="myClass").
};

module.exports = NodeTypes;

// Usage Example
const nodeTypes = require('htmlparser2-node-types');

// Accessing node types
console.log("An HTML element node type: ", nodeTypes.ELEMENT_NODE);
console.log("A text node type: ", nodeTypes.TEXT_NODE);
console.log("A comment node type: ", nodeTypes.COMMENT_NODE);
