const { assign, isFunction } = require('./Utility');
const XMLDOMImplementation = require('./XMLDOMImplementation');
const XMLDocument = require('./XMLDocument');
const XMLDocumentCB = require('./XMLDocumentCB');
const XMLStringWriter = require('./XMLStringWriter');
const XMLStreamWriter = require('./XMLStreamWriter');
const NodeType = require('./NodeType');
const WriterState = require('./WriterState');

module.exports.create = (name, xmldec, doctype, options) => {
  if (!name) throw new Error("Root element needs a name.");
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
};

module.exports.begin = (options, onData, onEnd) => {
  if (isFunction(options)) {
    onEnd = onData;
    onData = options;
    options = {};
  }

  return onData ? new XMLDocumentCB(options, onData, onEnd) : new XMLDocument(options);
};

module.exports.stringWriter = options => new XMLStringWriter(options);

module.exports.streamWriter = (stream, options) => new XMLStreamWriter(stream, options);

module.exports.implementation = new XMLDOMImplementation();

module.exports.nodeType = NodeType;

module.exports.writerState = WriterState;
