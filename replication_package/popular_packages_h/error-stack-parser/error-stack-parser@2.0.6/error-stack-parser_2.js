(function (root, factory) {
  'use strict';
  
  if (typeof define === 'function' && define.amd) {
    define('error-stack-parser', ['stackframe'], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory(require('stackframe'));
  } else {
    root.ErrorStackParser = factory(root.StackFrame);
  }
}(this, function ErrorStackParser(StackFrame) {
  'use strict';

  const FIREFOX_SAFARI_STACK_REGEXP = /(^|@)\S+:\d+/;
  const CHROME_IE_STACK_REGEXP = /^\s*at .*(\S+:\d+|\(native\))/m;
  const SAFARI_NATIVE_CODE_REGEXP = /^(eval@)?(\[native code])?$/;

  return {
    parse: function (error) {
      if (error.stacktrace || error['opera#sourceloc']) {
        return this.parseOpera(error);
      } else if (error.stack && CHROME_IE_STACK_REGEXP.test(error.stack)) {
        return this.parseV8OrIE(error);
      } else if (error.stack) {
        return this.parseFFOrSafari(error);
      } else {
        throw new Error('Cannot parse given Error object');
      }
    },

    extractLocation: function (urlLike) {
      if (!urlLike.includes(':')) return [urlLike];
      const parts = /(.+?)(?::(\d+))?(?::(\d+))?$/.exec(urlLike.replace(/[()]/g, ''));
      return [parts[1], parts[2] || undefined, parts[3] || undefined];
    },

    parseV8OrIE: function (error) {
      const lines = error.stack.split('\n').filter(line => CHROME_IE_STACK_REGEXP.test(line));
      
      return lines.map(line => {
        if (line.includes('(eval ')) {
          line = line.replace(/eval code/g, 'eval').replace(/(\(eval at [^()]*)|(\),.*$)/g, '');
        }
        let sanitizedLine = line.replace(/^\s+/, '').replace(/\(eval/g, '(');
        const location = sanitizedLine.match(/ (\((.+):(\d+):(\d+)\)$)/);
        sanitizedLine = location ? sanitizedLine.replace(location[0], '') : sanitizedLine;
        const tokens = sanitizedLine.split(/\s+/).slice(1);
        const locationParts = this.extractLocation(location ? location[1] : tokens.pop());
        const functionName = tokens.join(' ') || undefined;
        const fileName = ['eval', '<anonymous>'].indexOf(locationParts[0]) > -1 ? undefined : locationParts[0];

        return new StackFrame({
          functionName,
          fileName,
          lineNumber: locationParts[1],
          columnNumber: locationParts[2],
          source: line
        });
      });
    },

    parseFFOrSafari: function (error) {
      const lines = error.stack.split('\n').filter(line => !SAFARI_NATIVE_CODE_REGEXP.test(line));
      
      return lines.map(line => {
        if (line.includes(' > eval')) {
          line = line.replace(/ line (\d+)(?: > eval line \d+)* > eval:\d+:\d+/g, ':$1');
        }
        if (!line.includes('@') && !line.includes(':')) {
          return new StackFrame({ functionName: line });
        } else {
          const matches = line.match(/((.*".+"[^@]*)?[^@]*)(?:@)/);
          const functionName = matches ? matches[1] : undefined;
          const locationParts = this.extractLocation(line.replace(/((.*".+"[^@]*)?[^@]*)(?:@)/, ''));
          
          return new StackFrame({
            functionName,
            fileName: locationParts[0],
            lineNumber: locationParts[1],
            columnNumber: locationParts[2],
            source: line
          });
        }
      });
    },

    parseOpera: function (error) {
      if (!error.stacktrace || (error.message.includes('\n') && error.message.split('\n').length > error.stacktrace.split('\n').length)) {
        return this.parseOpera9(error);
      } else if (!error.stack) {
        return this.parseOpera10(error);
      } else {
        return this.parseOpera11(error);
      }
    },

    parseOpera9: function (error) {
      const lineRE = /Line (\d+).*script (?:in )?(\S+)/i;
      const lines = error.message.split('\n');
      const result = [];

      for (let i = 2; i < lines.length; i += 2) {
        const match = lineRE.exec(lines[i]);
        if (match) {
          result.push(new StackFrame({
            fileName: match[2],
            lineNumber: match[1],
            source: lines[i]
          }));
        }
      }

      return result;
    },

    parseOpera10: function (error) {
      const lineRE = /Line (\d+).*script (?:in )?(\S+)(?:: In function (\S+))?$/i;
      const lines = error.stacktrace.split('\n');
      const result = [];

      for (let i = 0; i < lines.length; i += 2) {
        const match = lineRE.exec(lines[i]);
        if (match) {
          result.push(new StackFrame({
            functionName: match[3] || undefined,
            fileName: match[2],
            lineNumber: match[1],
            source: lines[i]
          }));
        }
      }

      return result;
    },

    parseOpera11: function (error) {
      const lines = error.stack.split('\n').filter(line => FIREFOX_SAFARI_STACK_REGEXP.test(line) && !line.startsWith('Error created at'));
      
      return lines.map(line => {
        const tokens = line.split('@');
        const locationParts = this.extractLocation(tokens.pop());
        const functionCall = (tokens.shift() || '').replace(/<anonymous function(: (\w+))?>/, '$2');
        const functionName = functionCall.replace(/\([^)]*\)/g, '') || undefined;
        const argsRaw = functionCall.match(/\(([^)]*)\)/) ? functionCall.replace(/^[^(]+\(([^)]*)\)$/, '$1') : undefined;
        const args = !(argsRaw && argsRaw !== '[arguments not available]') ? undefined : argsRaw.split(',');

        return new StackFrame({
          functionName,
          args,
          fileName: locationParts[0],
          lineNumber: locationParts[1],
          columnNumber: locationParts[2],
          source: line
        });
      });
    }
  };
}));
