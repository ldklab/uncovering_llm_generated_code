(function (sax) {
  function SAXParser(strict, opt) {
    if (!(this instanceof SAXParser)) return new SAXParser(strict, opt);
    clearBuffers(this);
    this.q = this.c = '';
    this.bufferCheckPosition = sax.MAX_BUFFER_LENGTH;
    this.opt = opt || {};
    this.opt.lowercase = this.opt.lowercase || this.opt.lowercasetags;
    this.looseCase = this.opt.lowercase ? 'toLowerCase' : 'toUpperCase';
    this.tags = [];
    this.closed = this.closedRoot = this.sawRoot = false;
    this.tag = this.error = null;
    this.strict = !!strict;
    this.noscript = !!(strict || this.opt.noscript);
    this.state = S.BEGIN;
    this.strictEntities = this.opt.strictEntities;
    this.ENTITIES = this.strictEntities ? Object.create(sax.XML_ENTITIES) : Object.create(sax.ENTITIES);
    this.attribList = [];

    if (this.opt.xmlns) {
      this.ns = Object.create(rootNS);
    }

    this.trackPosition = this.opt.position !== false;
    if (this.trackPosition) {
      this.position = this.line = this.column = 0;
    }
    emit(this, 'onready');
  }

  function SAXStream(strict, opt) {
    if (!(this instanceof SAXStream)) {
      return new SAXStream(strict, opt);
    }

    this._parser = new SAXParser(strict, opt);
    this.writable = true;
    this.readable = true;

    var me = this;
    this._parser.onend = function () {
      me.emit('end');
    }

    this._parser.onerror = function (er) {
      me.emit('error', er);
      me._parser.error = null;
    }

    this._decoder = null;
    streamWraps.forEach(function (ev) {
      Object.defineProperty(me, 'on' + ev, {
        get: function () {
          return me._parser['on' + ev]
        },
        set: function (h) {
          if (!h) {
            me.removeAllListeners(ev);
            me._parser['on' + ev] = h;
            return h;
          }
          me.on(ev, h);
        },
        enumerable: true,
        configurable: false
      });
    });
  }

  function createStream(strict, opt) {
    return new SAXStream(strict, opt);
  }

  function emit(parser, event, data) {
    parser[event] && parser[event](data);
  }

  function emitNode(parser, nodeType, data) {
    if (parser.textNode) closeText(parser);
    emit(parser, nodeType, data);
  }

  function closeText(parser) {
    parser.textNode = textopts(parser.opt, parser.textNode);
    if (parser.textNode) emit(parser, 'ontext', parser.textNode);
    parser.textNode = '';
  }

  function textopts(opt, text) {
    if (opt.trim) text = text.trim();
    if (opt.normalize) text = text.replace(/\s+/g, ' ');
    return text;
  }

  function error(parser, er) {
    closeText(parser);
    if (parser.trackPosition) {
      er += '\nLine: ' + parser.line + '\nColumn: ' + parser.column + '\nChar: ' + parser.c;
    }
    er = new Error(er);
    parser.error = er;
    emit(parser, 'onerror', er);
    return parser;
  }

  function end(parser) {
    if (parser.sawRoot && !parser.closedRoot) strictFail(parser, 'Unclosed root tag');
    if ((parser.state !== S.BEGIN) && (parser.state !== S.BEGIN_WHITESPACE) && (parser.state !== S.TEXT)) {
      error(parser, 'Unexpected end');
    }
    closeText(parser);
    parser.c = '';
    parser.closed = true;
    emit(parser, 'onend');
    SAXParser.call(parser, parser.strict, parser.opt);
    return parser;
  }

  function checkBufferLength(parser) {
    var maxAllowed = Math.max(sax.MAX_BUFFER_LENGTH, 10);
    var maxActual = 0;
    buffers.forEach(function (buf) {
      var len = parser[buf].length;
      if (len > maxAllowed) handleBufferOverflow(parser, buf);
      maxActual = Math.max(maxActual, len);
    });
    parser.bufferCheckPosition = sax.MAX_BUFFER_LENGTH - maxActual + parser.position;
  }

  function handleBufferOverflow(parser, bufferType) {
    switch (bufferType) {
      case 'textNode':
        closeText(parser);
        break;
      case 'cdata':
        emitNode(parser, 'oncdata', parser.cdata);
        parser.cdata = '';
        break;
      case 'script':
        emitNode(parser, 'onscript', parser.script);
        parser.script = '';
        break;
      default:
        error(parser, 'Max buffer length exceeded: ' + bufferType);
    }
  }

  function clearBuffers(parser) {
    buffers.forEach(function (bufferType) {
      parser[bufferType] = '';
    });
  }

  function flushBuffers(parser) {
    closeText(parser);
    if (parser.cdata !== '') {
      emitNode(parser, 'oncdata', parser.cdata);
      parser.cdata = '';
    }
    if (parser.script !== '') {
      emitNode(parser, 'onscript', parser.script);
      parser.script = '';
    }
  }

  var Stream;
  try {
    Stream = require('stream').Stream;
  } catch (ex) {
    Stream = function () {};
  }

  var streamWraps = sax.EVENTS.filter(function (ev) {
    return ev !== 'error' && ev !== 'end';
  });

  SAXStream.prototype = Object.create(Stream.prototype, {
    constructor: {
      value: SAXStream
    }
  });

  SAXStream.prototype.write = function (data) {
    if (typeof Buffer === 'function' && typeof Buffer.isBuffer === 'function' && Buffer.isBuffer(data)) {
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

  SAXStream.prototype.end = function (chunk) {
    if (chunk && chunk.length) {
      this.write(chunk);
    }
    this._parser.end();
    return true;
  };

  SAXStream.prototype.on = function (ev, handler) {
    var me = this;
    if (!me._parser['on' + ev] && streamWraps.indexOf(ev) !== -1) {
      me._parser['on' + ev] = function () {
        var args = arguments.length === 1 ? [arguments[0]] : Array.apply(null, arguments);
        args.splice(0, 0, ev);
        me.emit.apply(me, args);
      };
    }

    return Stream.prototype.on.call(me, ev, handler);
  };

  sax.parser = function (strict, opt) { return new SAXParser(strict, opt) };
  sax.SAXParser = SAXParser;
  sax.SAXStream = SAXStream;
  sax.createStream = createStream;
  sax.MAX_BUFFER_LENGTH = 64 * 1024;

  var buffers = [
    'comment', 'sgmlDecl', 'textNode', 'tagName', 'doctype',
    'procInstName', 'procInstBody', 'entity', 'attribName',
    'attribValue', 'cdata', 'script'
  ];

  sax.EVENTS = [
    'text', 'processinginstruction', 'sgmldeclaration', 'doctype',
    'comment', 'opentagstart', 'attribute', 'opentag', 'closetag',
    'opencdata', 'cdata', 'closecdata', 'error', 'end', 'ready',
    'script', 'opennamespace', 'closenamespace'
  ];

  sax.XML_ENTITIES = {
    'amp': '&', 'gt': '>', 'lt': '<', 'quot': '"', 'apos': "'"
  };

  sax.ENTITIES = {
    'amp': '&', 'gt': '>', 'lt': '<', 'quot': '"', 'apos': "'",
    'AElig': 198, 'Aacute': 193, 'Acirc': 194, 'Agrave': 192,
    ...
    'diams': 9830
  };

  Object.keys(sax.ENTITIES).forEach(function (key) {
    var e = sax.ENTITIES[key];
    var s = typeof e === 'number' ? String.fromCharCode(e) : e;
    sax.ENTITIES[key] = s;
  });

  var CDATA = '[CDATA[';
  var DOCTYPE = 'DOCTYPE';
  var XML_NAMESPACE = 'http://www.w3.org/XML/1998/namespace';
  var XMLNS_NAMESPACE = 'http://www.w3.org/2000/xmlns/';
  var rootNS = { xml: XML_NAMESPACE, xmlns: XMLNS_NAMESPACE };

  var nameStart = /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/;
  var nameBody = /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040.\d-]/;

  var S = 0;
  sax.STATE = {
    BEGIN: S++, BEGIN_WHITESPACE: S++, TEXT: S++, TEXT_ENTITY: S++, OPEN_WAKA: S++,
    SGML_DECL: S++, SGML_DECL_QUOTED: S++, DOCTYPE: S++, DOCTYPE_QUOTED: S++,
    DOCTYPE_DTD: S++, DOCTYPE_DTD_QUOTED: S++, COMMENT_STARTING: S++, COMMENT: S++,
    COMMENT_ENDING: S++, COMMENT_ENDED: S++, CDATA: S++, CDATA_ENDING: S++, CDATA_ENDING_2: S++,
    PROC_INST: S++, PROC_INST_BODY: S++, PROC_INST_ENDING: S++, OPEN_TAG: S++, OPEN_TAG_SLASH: S++,
    ATTRIB: S++, ATTRIB_NAME: S++, ATTRIB_NAME_SAW_WHITE: S++, ATTRIB_VALUE: S++,
    ATTRIB_VALUE_QUOTED: S++, ATTRIB_VALUE_CLOSED: S++, ATTRIB_VALUE_UNQUOTED: S++,
    ATTRIB_VALUE_ENTITY_Q: S++, ATTRIB_VALUE_ENTITY_U: S++, CLOSE_TAG: S++, CLOSE_TAG_SAW_WHITE: S++,
    SCRIPT: S++, SCRIPT_ENDING: S++
  };

  if (!Object.create) {
    Object.create = function (o) {
      function F() {}
      F.prototype = o;
      return new F();
    };
  }

  if (!Object.keys) {
    Object.keys = function (o) {
      var a = [];
      for (var i in o) if (o.hasOwnProperty(i)) a.push(i);
      return a;
    };
  }

  /*! http://mths.be/fromcodepoint v0.1.0 by @mathias */
  if (!String.fromCodePoint) {
    (function () {
      var stringFromCharCode = String.fromCharCode;
      var floor = Math.floor;
      var fromCodePoint = function () {
        var MAX_SIZE = 0x4000;
        var codeUnits = [];
        var highSurrogate;
        var lowSurrogate;
        var index = -1;
        var length = arguments.length;
        if (!length) {
          return '';
        }
        var result = '';
        while (++index < length) {
          var codePoint = Number(arguments[index]);
          if (!isFinite(codePoint) || codePoint < 0 || codePoint > 0x10FFFF || floor(codePoint) !== codePoint) {
            throw RangeError('Invalid code point: ' + codePoint);
          }
          if (codePoint <= 0xFFFF) {
            codeUnits.push(codePoint);
          } else {
            codePoint -= 0x10000;
            highSurrogate = (codePoint >> 10) + 0xD800;
            lowSurrogate = (codePoint % 0x400) + 0xDC00;
            codeUnits.push(highSurrogate, lowSurrogate);
          }
          if (index + 1 === length || codeUnits.length > MAX_SIZE) {
            result += stringFromCharCode.apply(null, codeUnits);
            codeUnits.length = 0;
          }
        }
        return result;
      };
      if (Object.defineProperty) {
        Object.defineProperty(String, 'fromCodePoint', {
          value: fromCodePoint,
          configurable: true,
          writable: true
        });
      } else {
        String.fromCodePoint = fromCodePoint;
      }
    }());
  }
})(typeof exports === 'undefined' ? this.sax = {} : exports);
