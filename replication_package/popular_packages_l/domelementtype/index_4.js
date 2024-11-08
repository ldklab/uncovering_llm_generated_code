// This Node.js module defines and exports an object containing various node types used in the DOM structure parsed by the htmlparser2 library. Each key in the object represents a different node type found within HTML and XML documents, providing human-readable names corresponding to specific components such as elements, text, and comments. The module can be used to reference these node types in other parts of an application or library working with HTML parsing or DOM manipulation.

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

// Export the NodeTypes object so it can be used in other files.
module.exports = NodeTypes;

// Example usage of the exported NodeTypes object:
const nodeTypes = require('htmlparser2-node-types');

// Logs to the console descriptions of different HTML node types.
console.log("An HTML element node type: ", nodeTypes.ELEMENT_NODE);
console.log("A text node type: ", nodeTypes.TEXT_NODE);
console.log("A comment node type: ", nodeTypes.COMMENT_NODE);
