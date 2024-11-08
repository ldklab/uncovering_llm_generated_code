const EventEmitter = require('events');

class SimpleSAXParser extends EventEmitter {
  constructor(strictMode = false, options = {}) {
    super();
    this.strictMode = strictMode;
    this.options = options;
    this.resetParserState();
  }

  resetParserState() {
    this.currentLine = 1;
    this.currentColumn = 0;
    this.currentPosition = 0;
    this.currentError = null;
    this.isClosed = false;
  }

  processDataChunk(dataChunk) {
    try {
      this.simulateParsing(dataChunk);
      return this;
    } catch (parseError) {
      this.emit('error', parseError);
    }
  }

  finishParsing() {
    this.isClosed = true;
    this.emit('end');
  }

  simulateParsing(inputData) {
    let regexMatch;
    const tagStartPattern = /<([^>\/\s]+)[^>]*>/g;
    const tagEndPattern = /<\/([^>]+)>/g;
    const textContentPattern = />([^<]+)</g;
    const commentPattern = /<!--(.*?)-->/g;
    const attributePattern = /(\w+)=["']?((?:.(?!["']?\s+(?:\S+)=|["']))+.)["']?/g;
    
    while ((regexMatch = tagStartPattern.exec(inputData))) {
      const tagName = regexMatch[1];
      this.emit('opentagstart', { name: tagName, attributes: {} });

      const tagAttributes = {};
      let attributeMatch;
      while ((attributeMatch = attributePattern.exec(regexMatch[0]))) {
        tagAttributes[attributeMatch[1]] = attributeMatch[2];
        this.emit('attribute', { name: attributeMatch[1], value: attributeMatch[2] });
      }
      this.emit('opentag', { name: tagName, attributes: tagAttributes });
    }

    while ((regexMatch = tagEndPattern.exec(inputData))) {
      const tagName = regexMatch[1];
      this.emit('closetag', tagName);
    }

    while ((regexMatch = textContentPattern.exec(inputData))) {
      const textContent = regexMatch[1].trim();
      if (textContent) {
        this.emit('text', textContent);
      }
    }

    while ((regexMatch = commentPattern.exec(inputData))) {
      this.emit('comment', regexMatch[1].trim());
    }
  }
}

function createParser(strictMode = false, options = {}) {
  return new SimpleSAXParser(strictMode, options);
}

function initializeStream(strictMode = false, options = {}) {
  const saxParser = new SimpleSAXParser(strictMode, options);
  
  const streamInterface = new EventEmitter();
  streamInterface.write = (dataChunk) => saxParser.processDataChunk(dataChunk);
  streamInterface.end = () => saxParser.finishParsing();

  streamInterface.pipe = function (destination) {
    this.on('data', (data) => destination.write(data));
    return destination;
  };

  saxParser.on('end', () => streamInterface.emit('end'));
  saxParser.on('error', (error) => streamInterface.emit('error', error));
  
  return streamInterface;
}

module.exports = { createParser, initializeStream };
