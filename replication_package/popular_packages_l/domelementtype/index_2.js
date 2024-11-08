// This code defines the various types of nodes that can be present in an HTML document as parsed by the htmlparser2 library. These node types are specified as properties of a JavaScript object named NodeTypes, with a descriptive string value assigned to each. Here is the rewritten code:

// Define the various node types that can exist within the DOM structure as parsed by the htmlparser2 library.
const NodeTypes = {
    // A node representing an HTML element, such as <div> or <a>.
    ELEMENT_NODE: "ElementNode",            
    // A node for text within an element.
    TEXT_NODE: "TextNode",
    // A node for HTML comments in the form <!-- comment -->.
    COMMENT_NODE: "CommentNode",
    // A node representing the entire document.
    DOCUMENT_NODE: "DocumentNode",
    // A node for specifying the document type, like <!DOCTYPE html>.
    DOCUMENT_TYPE_NODE: "DocumentTypeNode", 
    // A node for processing instructions, typically not used in HTML.
    PROCESSING_INSTRUCTION_NODE: "ProcessingInstructionNode",
    // A node for a CDATA section, used in XML.
    CDATA_SECTION_NODE: "CDataSectionNode",
    // A node suitable for a minimal document with no parent.
    DOCUMENT_FRAGMENT_NODE: "DocumentFragmentNode",
    // A node type for attributes belonging to elements, such as class="myClass".
    ATTRIBUTE_NODE: "AttributeNode",
};

// Export the NodeTypes object so it can be required and used in other modules.
module.exports = NodeTypes;

// Example to demonstrate the usage of NodeTypes
const nodeTypes = require('htmlparser2-node-types');

// Log to the console various node types to exemplify their usage.
console.log("An HTML element node type: ", nodeTypes.ELEMENT_NODE);
console.log("A text node type: ", nodeTypes.TEXT_NODE);
console.log("A comment node type: ", nodeTypes.COMMENT_NODE);
