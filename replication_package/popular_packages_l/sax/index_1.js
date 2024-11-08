const EventEmitter = require('events');

class SAXParser extends EventEmitter {
  constructor(strict, options = {}) {
    super();
    this.strict = strict || false;
    this.opt = options;
    this.reset();
  }

  reset() {
    this.line = 1;
    this.column = 0;
    this.position = 0;
    this.error = null;
    this.closed = false;
  }

  write(data) {
    try {
      this.parse(data);
      return this;
    } catch (err) {
      this.emit('error', err);
    }
  }

  close() {
    this.closed = true;
    this.emit('end');
  }

  parse(data) {
    let match;
    const tagOpen = /<([^>\/\s]+)[^>]*>/g;
    const tagClose = /<\/([^>]+)>/g;
    const textMatch = />([^<]+)</g;
    const commentMatch = /<!--(.*?)-->/g;
    const attrMatch = /(\w+)=["']?((?:.(?!["']?\s+(?:\S+)=|["']))+.)["']?/g;

    while ((match = tagOpen.exec(data))) {
      const tagName = match[1];
      this.emit('opentagstart', { name: tagName, attributes: {} });
      
      const attributes = {};
      let attr;
      while ((attr = attrMatch.exec(match[0]))) {
        attributes[attr[1]] = attr[2];
        this.emit('attribute', { name: attr[1], value: attr[2] });
      }
      this.emit('opentag', { name: tagName, attributes });
    }

    while ((match = tagClose.exec(data))) {
      const tagName = match[1];
      this.emit('closetag', tagName);
    }

    while ((match = textMatch.exec(data))) {
      const text = match[1].trim();
      if (text) this.emit('text', text);
    }

    while ((match = commentMatch.exec(data))) {
      this.emit('comment', match[1].trim());
    }
  }
}

function parser(strict, opt = {}) {
  return new SAXParser(strict, opt);
}

function createStream(strict, opt = {}) {
  const parser = new SAXParser(strict, opt);
  const stream = new EventEmitter();
  stream.write = (data) => parser.write(data);
  stream.end = () => parser.close();

  stream.pipe = function (dest) {
    this.on('data', (data) => dest.write(data));
    return dest;
  };

  parser.on('end', () => stream.emit('end'));
  parser.on('error', (e) => stream.emit('error', e));
  
  return stream;
}

module.exports = { parser, createStream };
