const { assign, isFunction } = require('./Utility');

const XMLDOMImplementation = require('./XMLDOMImplementation');
const XMLDocument = require('./XMLDocument');
const XMLDocumentCB = require('./XMLDocumentCB');
const XMLStringWriter = require('./XMLStringWriter');
const XMLStreamWriter = require('./XMLStreamWriter');
const NodeType = require('./NodeType');
const WriterState = require('./WriterState');

module.exports = {
  create(name, xmldec = {}, doctype = {}, options = {}) {
    if (name == null) {
      throw new Error("Root element needs a name.");
    }
    const opts = assign({}, xmldec, doctype, options);
    const doc = new XMLDocument(opts);
    const root = doc.element(name);

    if (!opts.headless) {
      doc.declaration(opts);
      if (opts.pubID || opts.sysID) {
        doc.dtd(opts);
      }
    }
    
    return root;
  },

  begin(options = {}, onData, onEnd) {
    if (isFunction(options)) {
      [onData, onEnd] = [options, onData];
      options = {};
    }
    return onData ? new XMLDocumentCB(options, onData, onEnd) : new XMLDocument(options);
  },

  stringWriter(options = {}) {
    return new XMLStringWriter(options);
  },

  streamWriter(stream, options = {}) {
    return new XMLStreamWriter(stream, options);
  },

  implementation: new XMLDOMImplementation(),
  nodeType: NodeType,
  writerState: WriterState
};
