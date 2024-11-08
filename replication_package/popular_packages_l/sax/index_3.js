const EventEmitter = require('events');

class SAXParser extends EventEmitter {
  constructor(strict = false, options = {}) {
    super();
    this.strict = strict;
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
    } catch (err) {
      this.emit('error', err);
    }
    return this;
  }

  close() {
    this.closed = true;
    this.emit('end');
  }

  parse(data) {
    const tagOpen = /<([^>\/\s]+)[^>]*>/g;
    const tagClose = /<\/([^>]+)>/g;
    const textExtract = />([^<]+)</g;
    const commentExtract = /<!--(.*?)-->/g;
    const attrExtract = /(\w+)=["']?((?:.(?!["']?\s+(?:\S+)=|["']))+.)["']?/g;

    let match;
    while ((match = tagOpen.exec(data))) {
      const tagName = match[1];
      this.emit('opentagstart', { name: tagName, attributes: {} });

      const attributes = {};
      let attr;
      while ((attr = attrExtract.exec(match[0]))) {
        attributes[attr[1]] = attr[2];
        this.emit('attribute', { name: attr[1], value: attr[2] });
      }
      
      this.emit('opentag', { name: tagName, attributes });
    }

    while ((match = tagClose.exec(data))) {
      this.emit('closetag', match[1]);
    }

    while ((match = textExtract.exec(data))) {
      const text = match[1].trim();
      if (text) this.emit('text', text);
    }

    while ((match = commentExtract.exec(data))) {
      this.emit('comment', match[1].trim());
    }
  }
}

function parser(strict = false, opt = {}) {
  return new SAXParser(strict, opt);
}

function createStream(strict = false, opt = {}) {
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
