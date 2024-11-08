const tmpl = require('tmpl');

class BaseError extends Error {
  toString() {
    return this.message;
  }
}

function makeError(name, defaultMessageStr, defaultData = {}) {
  const defaultMessage = tmpl(defaultMessageStr || '');

  if (defaultData.proto && !(defaultData.proto instanceof BaseError)) {
    throw new Error('The custom "proto" must be an Error created via makeError');
  }

  class CustomError extends (defaultData.proto || BaseError) {
    constructor(message, data = {}) {
      super();

      if (typeof message !== 'string' && !data) {
        data = message;
        message = null;
      }

      this.name = name;
      this.data = { ...defaultData, ...data };
      this.message = typeof message === 'string' ? tmpl(message, this.data) : defaultMessage(this.data);

      const er = new Error();
      this.stack = er.stack;
      if (this.stack) {
        if (typeof Components !== 'undefined') {
          this.stack = this.stack.substring(this.stack.indexOf('\n') + 2);
        } else if (typeof chrome !== 'undefined' || typeof process !== 'undefined') {
          this.stack = this.stack.replace(/\n[^\n]*/, '').replace(/\n[^\n]*/, '');
          this.stack = `${this.name}${this.message ? `: ${this.message}` : ''}${this.stack.substring(5)}`;
        }
      }

      if ('fileName' in er) this.fileName = er.fileName;
      if ('lineNumber' in er) this.lineNumber = er.lineNumber;
    }
  }

  delete defaultData.proto;

  return CustomError;
}

module.exports = makeError;
