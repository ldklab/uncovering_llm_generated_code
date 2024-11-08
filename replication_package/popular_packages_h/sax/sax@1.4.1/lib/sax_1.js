;((sax = {}) => {
  class SAXParser {
    static MAX_BUFFER_LENGTH = 64 * 1024;

    constructor(strict, opt) {
      if (!(this instanceof SAXParser)) {
        return new SAXParser(strict, opt);
      }
      this.q = this.c = '';
      this.bufferCheckPosition = SAXParser.MAX_BUFFER_LENGTH;
      this.opt = opt || {};
      this.opt.lowercase = this.opt.lowercase || this.opt.lowercasetags;
      this.looseCase = this.opt.lowercase ? 'toLowerCase' : 'toUpperCase';
      this.resetStates();
      emit(this, 'onready');
    }

    resetStates() {
      this.tags = [];
      this.closed = this.closedRoot = this.sawRoot = false;
      this.tag = this.error = null;
      this.strict = !!this.strict;
      this.state = S.BEGIN;
      this.attribList = [];
      this.trackPosition = this.opt.position !== false;
      if (this.trackPosition) {
        this.position = this.line = this.column = 0;
      }
    }

    write(chunk) {
      const data = chunk;
      if (this.error) throw this.error;
      if (this.closed) return error(this, 'Cannot write after close. Assign an onready handler.');
      if (data === null) return end(this);
      if (typeof data === 'object') chunk = data.toString();
      
      let i = 0;
      let c = '';
      while (true) {
        c = charAt(chunk, i++);
        this.c = c;

        if (!c) break;
        this.trackPosition && updatePosition(this, c);
        parseCharacter(this, c);
      }
      
      this.position >= this.bufferCheckPosition && checkBufferLength(this);
      return this;
    }

    flush() {
      closeText(this);
      ['cdata', 'script'].forEach(buff => {
        if (this[buff] !== '') {
          emitNode(this, `on${buff}`, this[buff]);
          this[buff] = '';
        }
      });
    }
  }

  class SAXStream extends Stream {
    constructor(strict, opt) {
      super();
      this._parser = new SAXParser(strict, opt);
      this.writable = this.readable = true;
      
      this._parser.onend = () => this.emit('end');
      this._parser.onerror = (er) => {
        this.emit('error', er);
        this._parser.error = null;
      };
      
      streamWraps.forEach(ev => {
        Object.defineProperty(this, `on${ev}`, {
          get: () => this._parser[`on${ev}`],
          set: (h) => {
            !h ? this.removeAllListeners(ev) : this.on(ev, h);
            this._parser[`on${ev}`] = h;
            return h;
          },
          enumerable: true,
          configurable: false
        });
      });
    }

    write(data) {
      const decoder = new require('string_decoder').StringDecoder('utf8');
      this._parser.write(decoder.write(data));
      this.emit('data', data);
      return true;
    }

    end(chunk) {
      chunk && chunk.length && this.write(chunk);
      this._parser.end();
      return true;
    }
  }

  const emit = (parser, event, data) => parser[event] && parser[event](data);
  const checkBufferLength = parser => { /* check logic */ };
  const charAt = (chunk, i) => (i < chunk.length) ? chunk.charAt(i) : '';
  const emitNode = (parser, nodeType, data) => { /* emit node logic */ };
  const closeText = parser => { /* close text logic */ };
  const error = (parser, message) => { /* handle error logic */ };
  const parseCharacter = (parser, c) => { /* parse character logic */ };
  const updatePosition = (parser, c) => { /* update position logic */ };
  const streamWraps = sax.EVENTS.filter(ev => ev !== 'error' && ev !== 'end');

  const S = {
    // Define states
  };
  
  sax.parser = (strict, opt) => new SAXParser(strict, opt);
  sax.SAXParser = SAXParser;
  sax.SAXStream = SAXStream;
  sax.createStream = (strict, opt) => new SAXStream(strict, opt);
})(typeof exports === 'undefined' ? this.sax = {} : exports);
