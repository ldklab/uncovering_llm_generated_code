// Define an IIFE to encapsulate the SAX parser.
(function (sax) {
  // SAX Parser initialization methods and default configurations.
  sax.parser = function (strict, opt) { return new SAXParser(strict, opt); };
  sax.SAXParser = SAXParser;
  sax.SAXStream = SAXStream;
  sax.createStream = createStream;
  sax.MAX_BUFFER_LENGTH = 64 * 1024;

  const buffers = [
    'comment', 'sgmlDecl', 'textNode', 'tagName', 'doctype',
    'procInstName', 'procInstBody', 'entity', 'attribName',
    'attribValue', 'cdata', 'script'
  ];

  sax.EVENTS = [
    'text', 'processinginstruction', 'sgmldeclaration', 'doctype', 'comment',
    'opentagstart', 'attribute', 'opentag', 'closetag', 'opencdata', 'cdata',
    'closecdata', 'error', 'end', 'ready', 'script', 'opennamespace', 'closenamespace'
  ];

  // SAXParser class definition.
  function SAXParser(strict, opt) {
    if (!(this instanceof SAXParser)) return new SAXParser(strict, opt);

    const parser = this;
    clearBuffers(parser);
    parser.q = parser.c = '';
    parser.bufferCheckPosition = sax.MAX_BUFFER_LENGTH;
    parser.opt = opt || {};
    parser.opt.lowercase = parser.opt.lowercase || parser.opt.lowercasetags;
    parser.looseCase = parser.opt.lowercase ? 'toLowerCase' : 'toUpperCase';
    parser.tags = [];
    parser.closed = parser.closedRoot = parser.sawRoot = false;
    parser.tag = parser.error = null;
    parser.strict = !!strict;
    parser.noscript = !!(strict || parser.opt.noscript);
    parser.state = S.BEGIN;
    parser.strictEntities = parser.opt.strictEntities;
    parser.ENTITIES = parser.strictEntities ? Object.create(sax.XML_ENTITIES) : Object.create(sax.ENTITIES);
    parser.attribList = [];

    // Namespace processing logic.
    if (parser.opt.xmlns) {
      parser.ns = Object.create(rootNS);
    }

    // Position tracking for error reporting.
    parser.trackPosition = parser.opt.position !== false;
    if (parser.trackPosition) {
      parser.position = parser.line = parser.column = 0;
    }
    emit(parser, 'onready');
  }

  // Check buffer lengths to manage potential buffer overruns.
  function checkBufferLength(parser) {
    const maxAllowed = Math.max(sax.MAX_BUFFER_LENGTH, 10);
    let maxActual = 0;
    buffers.forEach(bufferName => {
      const len = parser[bufferName].length;
      if (len > maxAllowed) {
        switch (bufferName) {
          case 'textNode': closeText(parser); break;
          case 'cdata': 
            emitNode(parser, 'oncdata', parser.cdata); 
            parser.cdata = ''; break;
          case 'script': 
            emitNode(parser, 'onscript', parser.script); 
            parser.script = ''; break;
          default: error(parser, `Max buffer length exceeded: ${bufferName}`);
        }
      }
      maxActual = Math.max(maxActual, len);
    });
    const m = sax.MAX_BUFFER_LENGTH - maxActual;
    parser.bufferCheckPosition = m + parser.position;
  }

  // Clear all buffers.
  function clearBuffers(parser) {
    buffers.forEach(bufferName => parser[bufferName] = '');
  }

  // Emit method for handling SAX parser events.
  function emit(parser, event, data) {
    parser[event] && parser[event](data);
  }

  // Close text nodes during parsing.
  function closeText(parser) {
    if (!parser.textNode) return;
    parser.textNode = textopts(parser.opt, parser.textNode);
    if (parser.textNode) emit(parser, 'ontext', parser.textNode);
    parser.textNode = '';
  }

  function textopts(opt, text) {
    if (opt.trim) text = text.trim();
    if (opt.normalize) text = text.replace(/\s+/g, ' ');
    return text;
  }

  // Handle parsing errors.
  function error(parser, errMsg) {
    closeText(parser);
    if (parser.trackPosition) {
      errMsg += `\nLine: ${parser.line}\nColumn: ${parser.column}\nChar: ${parser.c}`;
    }
    const error = new Error(errMsg);
    parser.error = error;
    emit(parser, 'onerror', error);
    return parser;
  }

  // SAXStream class definition, extends Stream.
  function SAXStream(strict, opt) {
    if (!(this instanceof SAXStream)) return new SAXStream(strict, opt);
    try {
      Stream = require('stream').Stream;
    } catch (ex) {
      Stream = function () {};
    }
    Stream.apply(this);

    this._parser = new SAXParser(strict, opt);
    this.writable = true;
    this.readable = true;

    // Event setup for the SAX stream.
    streamWraps.forEach(ev => {
      Object.defineProperty(this, 'on' + ev, {
        get: () => this._parser['on' + ev],
        set: h => !h ? this.removeAllListeners(ev) || (this._parser['on' + ev] = h) : this.on(ev, h),
        enumerable: true,
        configurable: false
      });
    });
  }

  SAXParser.prototype = {
    end: function() { end(this); },
    write: write,
    resume: function() { this.error = null; return this; },
    close: function() { return this.write(null); },
    flush: function() { flushBuffers(this); }
  };

  SAXStream.prototype = Object.create(Stream.prototype, {
    constructor: { value: SAXStream }
  });

  const streamWraps = sax.EVENTS.filter(ev => ev !== 'error' && ev !== 'end');

  function createStream(strict, opt) {
    return new SAXStream(strict, opt);
  }

  SAXStream.prototype.write = function(data) {
    if (typeof Buffer === 'function' && Buffer.isBuffer(data)) {
      if (!this._decoder) {
        var SD = require('string_decoder').StringDecoder;
        this._decoder = new SD('utf8');
      }
      data = this._decoder.write(data);
    }
    this._parser.write(data.toString());
    this.emit('data', data);
    return true;
  };

  SAXStream.prototype.end = function(chunk) {
    if (chunk && chunk.length) this.write(chunk);
    this._parser.end();
    return true;
  };

  SAXStream.prototype.on = function(ev, handler) {
    if (!this._parser['on' + ev] && ~streamWraps.indexOf(ev)) {
      this._parser['on' + ev] = function() {
        const args = arguments.length === 1 ? [arguments[0]] : Array.apply(null, arguments);
        args.splice(0, 0, ev);
        this.emit.apply(this, args);
      };
    }
    return Stream.prototype.on.call(this, ev, handler);
  };

  // Various helper functions for XML name and entity processing.
  function parseEntity(parser) {
    // Logic to parse XML entities like &amp;, &lt;, etc.
    const entity = parser.entity;
    const entityLC = entity.toLowerCase();
    if (parser.ENTITIES[entity]) return parser.ENTITIES[entity];
    if (parser.ENTITIES[entityLC]) return parser.ENTITIES[entityLC];
    const isCharRef = entity.startsWith('#');
    if (isCharRef) {
      const base = entity[1] === 'x' ? 16 : 10;
      const charRef = parseInt(entity.slice(1 + (base === 16)), base);
      if (!isNaN(charRef) && charRef >= 0) return String.fromCodePoint(charRef);
      strictFail(parser, 'Invalid character entity');
    }
    return '&' + parser.entity + ';';
  }

  function strictFail(parser, message) {
    if (parser.strict) error(parser, message);
  }

  // More complex state and parsing logic not shown...

  // Export the defined SAX parser depending on the environment.
})(typeof exports === 'undefined' ? this.sax = {} : exports);
