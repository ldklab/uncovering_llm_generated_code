


import XHTMLEntities from "../parser/plugins/jsx/xhtml";
import {TokenType as tt} from "../parser/tokenizer/types";
import {charCodes} from "../parser/util/charcodes";

import getJSXPragmaInfo, {} from "../util/getJSXPragmaInfo";

import Transformer from "./Transformer";

const HEX_NUMBER = /^[\da-fA-F]+$/;
const DECIMAL_NUMBER = /^\d+$/;

export default class JSXTransformer extends Transformer {
  __init() {this.lastLineNumber = 1}
  __init2() {this.lastIndex = 0}
  __init3() {this.filenameVarName = null}
  

  constructor(
     rootTransformer,
     tokens,
     importProcessor,
     nameManager,
     options,
  ) {
    super();this.rootTransformer = rootTransformer;this.tokens = tokens;this.importProcessor = importProcessor;this.nameManager = nameManager;this.options = options;JSXTransformer.prototype.__init.call(this);JSXTransformer.prototype.__init2.call(this);JSXTransformer.prototype.__init3.call(this);;
    this.jsxPragmaInfo = getJSXPragmaInfo(options);
  }

  process() {
    if (this.tokens.matches1(tt.jsxTagStart)) {
      this.processJSXTag();
      return true;
    }
    return false;
  }

  getPrefixCode() {
    if (this.filenameVarName) {
      return `const ${this.filenameVarName} = ${JSON.stringify(this.options.filePath || "")};`;
    } else {
      return "";
    }
  }

  /**
   * Lazily calculate line numbers to avoid unneeded work. We assume this is always called in
   * increasing order by index.
   */
  getLineNumberForIndex(index) {
    const code = this.tokens.code;
    while (this.lastIndex < index && this.lastIndex < code.length) {
      if (code[this.lastIndex] === "\n") {
        this.lastLineNumber++;
      }
      this.lastIndex++;
    }
    return this.lastLineNumber;
  }

  getFilenameVarName() {
    if (!this.filenameVarName) {
      this.filenameVarName = this.nameManager.claimFreeName("_jsxFileName");
    }
    return this.filenameVarName;
  }

  processProps(firstTokenStart) {
    const lineNumber = this.getLineNumberForIndex(firstTokenStart);
    const devProps = this.options.production
      ? ""
      : `__self: this, __source: {fileName: ${this.getFilenameVarName()}, lineNumber: ${lineNumber}}`;
    if (!this.tokens.matches1(tt.jsxName) && !this.tokens.matches1(tt.braceL)) {
      if (devProps) {
        this.tokens.appendCode(`, {${devProps}}`);
      } else {
        this.tokens.appendCode(`, null`);
      }
      return;
    }
    this.tokens.appendCode(`, {`);
    while (true) {
      if (this.tokens.matches2(tt.jsxName, tt.eq)) {
        this.processPropKeyName();
        this.tokens.replaceToken(": ");
        if (this.tokens.matches1(tt.braceL)) {
          this.tokens.replaceToken("");
          this.rootTransformer.processBalancedCode();
          this.tokens.replaceToken("");
        } else if (this.tokens.matches1(tt.jsxTagStart)) {
          this.processJSXTag();
        } else {
          this.processStringPropValue();
        }
      } else if (this.tokens.matches1(tt.jsxName)) {
        this.processPropKeyName();
        this.tokens.appendCode(": true");
      } else if (this.tokens.matches1(tt.braceL)) {
        this.tokens.replaceToken("");
        this.rootTransformer.processBalancedCode();
        this.tokens.replaceToken("");
      } else {
        break;
      }
      this.tokens.appendCode(",");
    }
    if (devProps) {
      this.tokens.appendCode(` ${devProps}}`);
    } else {
      this.tokens.appendCode("}");
    }
  }

  processPropKeyName() {
    const keyName = this.tokens.identifierName();
    if (keyName.includes("-")) {
      this.tokens.replaceToken(`'${keyName}'`);
    } else {
      this.tokens.copyToken();
    }
  }

  processStringPropValue() {
    const token = this.tokens.currentToken();
    const valueCode = this.tokens.code.slice(token.start + 1, token.end - 1);
    const replacementCode = formatJSXTextReplacement(valueCode);
    const literalCode = formatJSXStringValueLiteral(valueCode);
    this.tokens.replaceToken(literalCode + replacementCode);
  }

  /**
   * Process the first part of a tag, before any props.
   */
  processTagIntro() {
    // Walk forward until we see one of these patterns:
    // jsxName to start the first prop, preceded by another jsxName to end the tag name.
    // jsxName to start the first prop, preceded by greaterThan to end the type argument.
    // [open brace] to start the first prop.
    // [jsxTagEnd] to end the open-tag.
    // [slash, jsxTagEnd] to end the self-closing tag.
    let introEnd = this.tokens.currentIndex() + 1;
    while (
      this.tokens.tokens[introEnd].isType ||
      (!this.tokens.matches2AtIndex(introEnd - 1, tt.jsxName, tt.jsxName) &&
        !this.tokens.matches2AtIndex(introEnd - 1, tt.greaterThan, tt.jsxName) &&
        !this.tokens.matches1AtIndex(introEnd, tt.braceL) &&
        !this.tokens.matches1AtIndex(introEnd, tt.jsxTagEnd) &&
        !this.tokens.matches2AtIndex(introEnd, tt.slash, tt.jsxTagEnd))
    ) {
      introEnd++;
    }
    if (introEnd === this.tokens.currentIndex() + 1) {
      const tagName = this.tokens.identifierName();
      if (startsWithLowerCase(tagName)) {
        this.tokens.replaceToken(`'${tagName}'`);
      }
    }
    while (this.tokens.currentIndex() < introEnd) {
      this.rootTransformer.processToken();
    }
  }

  processChildren() {
    while (true) {
      if (this.tokens.matches2(tt.jsxTagStart, tt.slash)) {
        // Closing tag, so no more children.
        return;
      }
      if (this.tokens.matches1(tt.braceL)) {
        if (this.tokens.matches2(tt.braceL, tt.braceR)) {
          // Empty interpolations and comment-only interpolations are allowed
          // and don't create an extra child arg.
          this.tokens.replaceToken("");
          this.tokens.replaceToken("");
        } else {
          // Interpolated expression.
          this.tokens.replaceToken(", ");
          this.rootTransformer.processBalancedCode();
          this.tokens.replaceToken("");
        }
      } else if (this.tokens.matches1(tt.jsxTagStart)) {
        // Child JSX element
        this.tokens.appendCode(", ");
        this.processJSXTag();
      } else if (this.tokens.matches1(tt.jsxText)) {
        this.processChildTextElement();
      } else {
        throw new Error("Unexpected token when processing JSX children.");
      }
    }
  }

  processChildTextElement() {
    const token = this.tokens.currentToken();
    const valueCode = this.tokens.code.slice(token.start, token.end);
    const replacementCode = formatJSXTextReplacement(valueCode);
    const literalCode = formatJSXTextLiteral(valueCode);
    if (literalCode === '""') {
      this.tokens.replaceToken(replacementCode);
    } else {
      this.tokens.replaceToken(`, ${literalCode}${replacementCode}`);
    }
  }

  processJSXTag() {
    const {jsxPragmaInfo} = this;
    const resolvedPragmaBaseName = this.importProcessor
      ? this.importProcessor.getIdentifierReplacement(jsxPragmaInfo.base) || jsxPragmaInfo.base
      : jsxPragmaInfo.base;
    const firstTokenStart = this.tokens.currentToken().start;
    // First tag is always jsxTagStart.
    this.tokens.replaceToken(`${resolvedPragmaBaseName}${jsxPragmaInfo.suffix}(`);

    if (this.tokens.matches1(tt.jsxTagEnd)) {
      // Fragment syntax.
      const resolvedFragmentPragmaBaseName = this.importProcessor
        ? this.importProcessor.getIdentifierReplacement(jsxPragmaInfo.fragmentBase) ||
          jsxPragmaInfo.fragmentBase
        : jsxPragmaInfo.fragmentBase;
      this.tokens.replaceToken(
        `${resolvedFragmentPragmaBaseName}${jsxPragmaInfo.fragmentSuffix}, null`,
      );
      // Tag with children.
      this.processChildren();
      while (!this.tokens.matches1(tt.jsxTagEnd)) {
        this.tokens.replaceToken("");
      }
      this.tokens.replaceToken(")");
    } else {
      // Normal open tag or self-closing tag.
      this.processTagIntro();
      this.processProps(firstTokenStart);

      if (this.tokens.matches2(tt.slash, tt.jsxTagEnd)) {
        // Self-closing tag.
        this.tokens.replaceToken("");
        this.tokens.replaceToken(")");
      } else if (this.tokens.matches1(tt.jsxTagEnd)) {
        this.tokens.replaceToken("");
        // Tag with children.
        this.processChildren();
        while (!this.tokens.matches1(tt.jsxTagEnd)) {
          this.tokens.replaceToken("");
        }
        this.tokens.replaceToken(")");
      } else {
        throw new Error("Expected either /> or > at the end of the tag.");
      }
    }
  }
}

/**
 * Spec for identifiers: https://tc39.github.io/ecma262/#prod-IdentifierStart.
 *
 * Really only treat anything starting with a-z as tag names.  `_`, `$`, `é`
 * should be treated as copmonent names
 */
export function startsWithLowerCase(s) {
  const firstChar = s.charCodeAt(0);
  return firstChar >= charCodes.lowercaseA && firstChar <= charCodes.lowercaseZ;
}

/**
 * Turn the given jsxText string into a JS string literal. Leading and trailing
 * whitespace on lines is removed, except immediately after the open-tag and
 * before the close-tag. Empty lines are completely removed, and spaces are
 * added between lines after that.
 *
 * We use JSON.stringify to introduce escape characters as necessary, and trim
 * the start and end of each line and remove blank lines.
 */
function formatJSXTextLiteral(text) {
  let result = "";
  let whitespace = "";

  let isInInitialLineWhitespace = false;
  let seenNonWhitespace = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === " " || c === "\t" || c === "\r") {
      if (!isInInitialLineWhitespace) {
        whitespace += c;
      }
    } else if (c === "\n") {
      whitespace = "";
      isInInitialLineWhitespace = true;
    } else {
      if (seenNonWhitespace && isInInitialLineWhitespace) {
        result += " ";
      }
      result += whitespace;
      whitespace = "";
      if (c === "&") {
        const {entity, newI} = processEntity(text, i + 1);
        i = newI - 1;
        result += entity;
      } else {
        result += c;
      }
      seenNonWhitespace = true;
      isInInitialLineWhitespace = false;
    }
  }
  if (!isInInitialLineWhitespace) {
    result += whitespace;
  }
  return JSON.stringify(result);
}

/**
 * Produce the code that should be printed after the JSX text string literal,
 * with most content removed, but all newlines preserved and all spacing at the
 * end preserved.
 */
function formatJSXTextReplacement(text) {
  let numNewlines = 0;
  let numSpaces = 0;
  for (const c of text) {
    if (c === "\n") {
      numNewlines++;
      numSpaces = 0;
    } else if (c === " ") {
      numSpaces++;
    }
  }
  return "\n".repeat(numNewlines) + " ".repeat(numSpaces);
}

/**
 * Format a string in the value position of a JSX prop.
 *
 * Use the same implementation as convertAttribute from
 * babel-helper-builder-react-jsx.
 */
function formatJSXStringValueLiteral(text) {
  let result = "";
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === "\n") {
      if (/\s/.test(text[i + 1])) {
        result += " ";
        while (i < text.length && /\s/.test(text[i + 1])) {
          i++;
        }
      } else {
        result += "\n";
      }
    } else if (c === "&") {
      const {entity, newI} = processEntity(text, i + 1);
      result += entity;
      i = newI - 1;
    } else {
      result += c;
    }
  }
  return JSON.stringify(result);
}

/**
 * Modified from jsxReadString in Babylon.
 */
function processEntity(text, indexAfterAmpersand) {
  let str = "";
  let count = 0;
  let entity;
  let i = indexAfterAmpersand;

  while (i < text.length && count++ < 10) {
    const ch = text[i];
    i++;
    if (ch === ";") {
      if (str[0] === "#") {
        if (str[1] === "x") {
          str = str.substr(2);
          if (HEX_NUMBER.test(str)) {
            entity = String.fromCodePoint(parseInt(str, 16));
          }
        } else {
          str = str.substr(1);
          if (DECIMAL_NUMBER.test(str)) {
            entity = String.fromCodePoint(parseInt(str, 10));
          }
        }
      } else {
        entity = XHTMLEntities[str];
      }
      break;
    }
    str += ch;
  }
  if (!entity) {
    return {entity: "&", newI: indexAfterAmpersand};
  }
  return {entity, newI: i};
}
