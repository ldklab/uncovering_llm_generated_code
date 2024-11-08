(function (exports) {
  // Define SAX Parser Constants and Parameters
  exports.SAXParser = SAXParser;
  exports.SAXStream = SAXStream;
  exports.createStream = createStream;
  exports.MAX_BUFFER_LENGTH = 64 * 1024;

  const buffers = [
    'comment', 'sgmlDecl', 'textNode', 'tagName', 'doctype',
    'procInstName', 'procInstBody', 'entity', 'attribName',
    'attribValue', 'cdata', 'script'
  ];

  const events = [
    'text', 'processinginstruction', 'sgmldeclaration', 'doctype',
    'comment', 'opentagstart', 'attribute', 'opentag', 'closetag',
    'opencdata', 'cdata', 'closecdata', 'error', 'end', 'ready',
    'script', 'opennamespace', 'closenamespace'
  ];

  // SAXParser Constructor
  function SAXParser(strict, opt) {
    if (!(this instanceof SAXParser)) {
      return new SAXParser(strict, opt);
    }
    this.strict = !!strict;
    this.opt = opt || {};
    this.tags = [];
    this.ns = this.opt.xmlns ? Object.create(rootNS) : null;
    this.state = STATES.BEGIN;
    this.attribList = [];
    this.bufferCheckPosition = exports.MAX_BUFFER_LENGTH;
    this.trackPosition = this.opt.position !== false;
    initSAXParserState(this);
    emit(this, 'onready');
  }
  
  // SAXParser Prototype and Functions
  SAXParser.prototype = {
    end() { end(this); },
    write: writeData,
    resume() { this.error = null; return this; },
    close() { return this.write(null); },
    flush() { flushBuffers(this); }
  };

  // SAXStream Constructor and Prototype
  const Stream = require('stream').Stream || function () {};
  function SAXStream(strict, opt) {
    if (!(this instanceof SAXStream)) {
      return new SAXStream(strict, opt);
    }
    Stream.call(this);
    this._parser = new SAXParser(strict, opt);
    this.writable = true;
    this.readable = true;
    this._decoder = null;
    this._parser.onend = () => this.emit('end');
    this._parser.onerror = (er) => {
      this.emit('error', er);
      this._parser.error = null;
    };

    events.forEach((ev) => {
      if (ev !== 'error' && ev !== 'end') {
        Object.defineProperty(this, 'on' + ev, {
          get() { return this._parser['on' + ev]; },
          set(h) {
            if (!h) {
              this.removeAllListeners(ev);
              this._parser['on' + ev] = h;
              return h;
            }
            this.on(ev, h);
          },
          enumerable: true
        });
      }
    });
  }

  SAXStream.prototype = Object.create(Stream.prototype, {
    constructor: { value: SAXStream }
  });

  // SAXStream.prototype.write method
  SAXStream.prototype.write = function (data) {
    if (Buffer.isBuffer(data)) {
      if (!this._decoder) {
        const SD = require('string_decoder').StringDecoder;
        this._decoder = new SD('utf8');
      }
      data = this._decoder.write(data);
    }
    this._parser.write(data.toString());
    this.emit('data', data);
    return true;
  };

  SAXStream.prototype.end = function (chunk) {
    if (chunk && chunk.length) this.write(chunk);
    this._parser.end();
    return true;
  };

  SAXStream.prototype.on = function (ev, handler) {
    if (!this._parser['on' + ev] && events.includes(ev)) {
      this._parser['on' + ev] = function () {
        const args = Array.prototype.slice.call(arguments);
        args.unshift(ev);
        this.emit(...args);
      };
    }
    return Stream.prototype.on.call(this, ev, handler);
  };

  function initSAXParserState(parser) {
    clearBuffers(parser);
    parser.q = parser.c = '';
    parser.closed = parser.closedRoot = parser.sawRoot = false;
    parser.tag = parser.error = null;
    if (parser.trackPosition) {
      parser.position = parser.line = parser.column = 0;
    }
  }

  // Additional utility functions like clearBuffers, flushBuffers, etc.

  const STATES = {
    BEGIN: 0, BEGIN_WHITESPACE: 1, TEXT: 2, TEXT_ENTITY: 3,
    OPEN_WAKA: 4, SGML_DECL: 5, SGML_DECL_QUOTED: 6, DOCTYPE: 7,
    DOCTYPE_QUOTED: 8, DOCTYPE_DTD: 9, DOCTYPE_DTD_QUOTED: 10,
    COMMENT_STARTING: 11, COMMENT: 12, COMMENT_ENDING: 13, COMMENT_ENDED: 14,
    CDATA: 15, CDATA_ENDING: 16, CDATA_ENDING_2: 17, PROC_INST: 18,
    PROC_INST_BODY: 19, PROC_INST_ENDING: 20, OPEN_TAG: 21, OPEN_TAG_SLASH: 22,
    ATTRIB: 23, ATTRIB_NAME: 24, ATTRIB_NAME_SAW_WHITE: 25, ATTRIB_VALUE: 26,
    ATTRIB_VALUE_QUOTED: 27, ATTRIB_VALUE_CLOSED: 28, ATTRIB_VALUE_UNQUOTED: 29,
    ATTRIB_VALUE_ENTITY_Q: 30, ATTRIB_VALUE_ENTITY_U: 31, CLOSE_TAG: 32,
    CLOSE_TAG_SAW_WHITE: 33, SCRIPT: 34, SCRIPT_ENDING: 35
  };

  // Additional utility functions like emit, emitNode, etc.

  const rootNS = {
    xml: 'http://www.w3.org/XML/1998/namespace',
    xmlns: 'http://www.w3.org/2000/xmlns/'
  };

  // Function to handle data write to the parser
  function writeData(chunk) {
    const parser = this;
    if (parser.error) throw parser.error;
    if (parser.closed) return error(parser, 'Cannot write after close.');
    if (chunk === null) return end(parser);

    chunk = chunk.toString();
    for (let i = 0, c; (c = charAt(chunk, i)); i++) {
      parser.c = c;
      if (parser.trackPosition) {
        parser.position++;
        if (c === '\n') {
          parser.line++;
          parser.column = 0;
        } else {
          parser.column++;
        }
      }

      // Handle state transitions
      switch (parser.state) {
        case STATES.BEGIN:
          if (c === '\uFEFF') continue;
          beginWhiteSpace(parser, c);
          break;
        
        // Additional case handlers for different parser states
        // ...
        
        default:
          throw new Error('Unknown state: ' + parser.state);
      }

      // Buffer length checking
      if (parser.position >= parser.bufferCheckPosition) {
        checkBufferLength(parser);
      }
    }
    return parser;
  }

  // Helper functions like charAt, beginWhiteSpace, checkBufferLength, etc.
  // Additional code for XML entity handling and other utilities

})(typeof exports === 'undefined' ? this.sax = {} : exports);
