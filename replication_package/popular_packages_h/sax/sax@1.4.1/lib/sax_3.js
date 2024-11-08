;(function (sax) {
  const MAX_BUFFER_LENGTH = 64 * 1024;
  const buffers = [
    'comment', 'sgmlDecl', 'textNode', 'tagName',
    'doctype', 'procInstName', 'procInstBody',
    'entity', 'attribName', 'attribValue', 'cdata', 'script'
  ];
  const EVENTS = [
    'text', 'processinginstruction', 'sgmldeclaration',
    'doctype', 'comment', 'opentagstart', 'attribute',
    'opentag', 'closetag', 'opencdata', 'cdata',
    'closecdata', 'error', 'end', 'ready', 'script',
    'opennamespace', 'closenamespace'
  ];

  sax.parser = (strict, opt) => new SAXParser(strict, opt);
  sax.SAXParser = SAXParser;
  sax.SAXStream = SAXStream;
  sax.createStream = createStream;
  sax.MAX_BUFFER_LENGTH = MAX_BUFFER_LENGTH;
  sax.EVENTS = EVENTS;

  function SAXParser(strict, opt = {}) {
    if (!(this instanceof SAXParser)) return new SAXParser(strict, opt);

    this.q = this.c = '';
    this.opt = opt;
    this.tags = [];
    this.closed = this.closedRoot = this.sawRoot = false;
    this.position = this.line = this.column = 0;
    this.bufferCheckPosition = MAX_BUFFER_LENGTH;

    this.configure(strict);
    this.initializeBuffers();

    emit(this, 'onready');
  }

  SAXParser.prototype = {
    end() { this.reset(); return this; },
    write,
    resume() { this.error = null; return this; },
    close() { return this.write(null); },
    flush() { flushBuffers(this); }
  };

  function SAXStream(strict, opt) {
    if (!(this instanceof SAXStream)) return new SAXStream(strict, opt);

    this._parser = new SAXParser(strict, opt);
    this.writable = true;
    this.readable = true;

    streamWraps.forEach((ev) => {
      Object.defineProperty(this, 'on' + ev, {
        get: () => this._parser['on' + ev],
        set: (h) => !h ? (this.removeAllListeners(ev), this._parser['on' + ev] = h, h) : this.on(ev, h),
        enumerable: true,
        configurable: false
      });
    });
  }

  SAXStream.prototype = Object.create(Stream.prototype, {
    constructor: { value: SAXStream }
  });

  function write(chunk) {
    if (this.error) throw this.error;
    if (this.closed) return error(this, 'Cannot write after close. Assign an onready handler.');

    if (chunk === null) return end(this);
    chunk = typeof chunk === 'object' ? chunk.toString() : chunk;

    for (let i = 0, c = ''; (c = charAt(chunk, i++));) {
      this.c = c;

      if (this.trackPosition) {
        this.position++;
        if (c === '\n') this.line++, this.column = 0;
        else this.column++;
      }

      this.processCharacter(c);
    }

    if (this.position >= this.bufferCheckPosition) checkBufferLength(this);
    return this;
  }

  function createStream(strict, opt) {
    return new SAXStream(strict, opt);
  }

  function emit(parser, event, data) {
    parser[event] && parser[event](data);
  }

  // Additional helper functions omitted for brevity...

  // Attach to either the exports object or global context
})(typeof exports === 'undefined' ? this.sax = {} : exports);
