// Explanation: This Node.js module defines and exports an object called NodeTypes, which represents different kinds of nodes that can be found in an HTML document as parsed by the htmlparser2 library. Each property in this object corresponds to a specific type of node, represented by a string. These node types can be used to identify and work with different parts of the DOM when parsing HTML content.

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

// Example usage of the NodeTypes module
const nodeTypes = require('./path-to-htmlparser2-node-types');

// Demonstrating how to access node types
console.log("An HTML element node type: ", nodeTypes.ELEMENT_NODE);
console.log("A text node type: ", nodeTypes.TEXT_NODE);
console.log("A comment node type: ", nodeTypes.COMMENT_NODE);
