(function (root, factory) {
  'use strict';
  // UMD pattern supporting AMD, CommonJS/Node.js, and browser globals
  if (typeof define === 'function' && define.amd) {
    define('error-stack-parser', ['stackframe'], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory(require('stackframe'));
  } else {
    root.ErrorStackParser = factory(root.StackFrame);
  }
}(this, function (StackFrame) {
  'use strict';

  // Regular expressions for different browser stack formats
  const FIREFOX_SAFARI_STACK_REGEXP = /(^|@)\S+:\d+/;
  const CHROME_IE_STACK_REGEXP = /^\s*at .*(\S+:\d+|\(native\))/m;
  const SAFARI_NATIVE_CODE_REGEXP = /^(eval@)?(\[native code])?$/;

  const ErrorStackParser = {
    parse(error) {
      if (typeof error.stacktrace !== 'undefined' || typeof error['opera#sourceloc'] !== 'undefined') {
        return this.parseOpera(error);
      } else if (error.stack && error.stack.match(CHROME_IE_STACK_REGEXP)) {
        return this.parseV8OrIE(error);
      } else if (error.stack) {
        return this.parseFFOrSafari(error);
      } else {
        throw new Error('Cannot parse given Error object');
      }
    },

    extractLocation(urlLike) {
      if (!urlLike.includes(':')) {
        return [urlLike];
      }
      const regExp = /(.+?)(?::(\d+))?(?::(\d+))?$/;
      const parts = regExp.exec(urlLike.replace(/[()]/g, ''));
      return [parts[1], parts[2] || undefined, parts[3] || undefined];
    },

    parseV8OrIE(error) {
      const filtered = error.stack.split('\n').filter(line => line.match(CHROME_IE_STACK_REGEXP));

      return filtered.map(line => {
        if (line.includes('(eval ')) {
          line = line.replace(/eval code/g, 'eval').replace(/(\(eval at [^()]*)|(\),.*$)/g, '');
        }
        const sanitizedLine = line.replace(/^\s+/, '').replace(/\(eval code/g, '(');
        const location = sanitizedLine.match(/ (\((.+):(\d+):(\d+)\)$)/);
        const cleanedLine = location ? sanitizedLine.replace(location[0], '') : sanitizedLine;
        const tokens = cleanedLine.split(/\s+/).slice(1);
        const locationParts = this.extractLocation(location ? location[1] : tokens.pop());
        return new StackFrame({
          functionName: tokens.join(' ') || undefined,
          fileName: ['eval', '<anonymous>'].includes(locationParts[0]) ? undefined : locationParts[0],
          lineNumber: locationParts[1],
          columnNumber: locationParts[2],
          source: line
        });
      });
    },

    parseFFOrSafari(error) {
      const filtered = error.stack.split('\n').filter(line => !line.match(SAFARI_NATIVE_CODE_REGEXP));

      return filtered.map(line => {
        if (line.includes(' > eval')) {
          line = line.replace(/ line (\d+)(?: > eval line \d+)* > eval:\d+:\d+/g, ':$1');
        }
        if (!line.includes('@') && !line.includes(':')) {
          return new StackFrame({ functionName: line });
        } else {
          const functionNameRegex = /((.*".+"[^@]*)?[^@]*)(?:@)/;
          const matches = line.match(functionNameRegex);
          const locationParts = this.extractLocation(line.replace(functionNameRegex, ''));
          return new StackFrame({
            functionName: matches && matches[1] || undefined,
            fileName: locationParts[0],
            lineNumber: locationParts[1],
            columnNumber: locationParts[2],
            source: line
          });
        }
      });
    },

    parseOpera(error) {
      if (!error.stacktrace || (error.message.includes('\n') &&
          error.message.split('\n').length > error.stacktrace.split('\n').length)) {
        return this.parseOpera9(error);
      } else if (!error.stack) {
        return this.parseOpera10(error);
      } else {
        return this.parseOpera11(error);
      }
    },

    parseOpera9(error) {
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

    parseOpera10(error) {
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

    parseOpera11(error) {
      const filtered = error.stack.split('\n').filter(line => line.match(FIREFOX_SAFARI_STACK_REGEXP) && !line.match(/^Error created at/));

      return filtered.map(line => {
        const tokens = line.split('@');
        const locationParts = this.extractLocation(tokens.pop());
        const functionCall = tokens.shift() || '';
        const functionName = functionCall.replace(/<anonymous function(: (\w+))?>/, '$2').replace(/\([^)]*\)/g, '') || undefined;
        const argsRaw = functionCall.match(/\(([^)]*)\)/) ? functionCall.replace(/^[^(]+\(([^)]*)\)$/, '$1') : undefined;
        const args = (argsRaw === undefined || argsRaw === '[arguments not available]') ? undefined : argsRaw.split(',');

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

  return ErrorStackParser;
}));
