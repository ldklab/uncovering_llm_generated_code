"use strict";

class Dedent {
  constructor(options = {}) {
    this.options = options;
  }

  withOptions(newOptions) {
    return new Dedent({ ...this.options, ...newOptions });
  }

  process(strings, ...values) {
    const raw = typeof strings === "string" ? [strings] : strings.raw;
    const { escapeSpecialCharacters = Array.isArray(strings) } = this.options;
    
    let result = this.interpolate(raw, values, escapeSpecialCharacters);
    result = this.stripIndent(result);
    return this.trimAndEscape(result, escapeSpecialCharacters);
  }

  interpolate(raw, values, escapeSpecialCharacters) {
    let result = "";
    raw.forEach((string, i) => {
      if (escapeSpecialCharacters) {
        string = string.replace(/\\\n[ \t]*/g, "")
                       .replace(/\\`/g, "`")
                       .replace(/\\\$/g, "$")
                       .replace(/\\\{/g, "{");
      }
      result += string + (values[i] || "");
    });
    return result;
  }

  stripIndent(result) {
    const lines = result.split("\n");
    let mindent = null;
    lines.forEach(line => {
      const match = line.match(/^(\s+)\S+/);
      if (match) {
        mindent = mindent == null ? match[1].length : Math.min(mindent, match[1].length);
      }
    });

    if (mindent !== null) {
      const m = mindent;
      return lines.map(line => (line[0] === " " || line[0] === "\t" ? line.slice(m) : line)).join("\n");
    }
    return result;
  }

  trimAndEscape(result, escapeSpecialCharacters) {
    result = result.trim();
    if (escapeSpecialCharacters) {
      result = result.replace(/\\n/g, "\n");
    }
    return result;
  }
}

const dedentInstance = new Dedent();
const dedent = dedentInstance.process.bind(dedentInstance);
dedent.withOptions = dedentInstance.withOptions.bind(dedentInstance);

module.exports = dedent;
module.exports.default = dedent;
