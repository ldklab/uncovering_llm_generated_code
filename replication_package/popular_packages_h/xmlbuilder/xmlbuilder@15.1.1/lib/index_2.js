const { assign, isFunction } = require('./Utility');
const XMLDOMImplementation = require('./XMLDOMImplementation');
const XMLDocument = require('./XMLDocument');
const XMLDocumentCB = require('./XMLDocumentCB');
const XMLStringWriter = require('./XMLStringWriter');
const XMLStreamWriter = require('./XMLStreamWriter');
const NodeType = require('./NodeType');
const WriterState = require('./WriterState');

module.exports = {
  create: function(name, xmldec, doctype, options) {
    if (!name) {
      throw new Error("Root element needs a name.");
    }
    options = assign({}, xmldec, doctype, options);
    const doc = new XMLDocument(options);
    const root = doc.element(name);
    
    if (!options.headless) {
      doc.declaration(options);
      if (options.pubID || options.sysID) {
        doc.dtd(options);
      }
    }
    return root;
  },
  
  begin: function(options, onData, onEnd) {
    if (isFunction(options)) {
      [onData, onEnd] = [options, onData];
      options = {};
    }
    return onData ? new XMLDocumentCB(options, onData, onEnd) : new XMLDocument(options);
  },
  
  stringWriter: function(options) {
    return new XMLStringWriter(options);
  },
  
  streamWriter: function(stream, options) {
    return new XMLStreamWriter(stream, options);
  },
  
  implementation: new XMLDOMImplementation(),
  
  nodeType: NodeType,
  
  writerState: WriterState
};
