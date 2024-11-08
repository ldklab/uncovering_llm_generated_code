let source, pos, end,
    openTokenDepth, templateDepth, lastTokenPos, lastSlashWasDivision,
    templateStack, templateStackDepth, openTokenPosStack, openClassPosStack,
    nextBraceIsClass, starExportMap, lastStarExportSpecifier,
    _exports, unsafeGetters, reexports;

function resetState() {
  openTokenDepth = 0;
  templateDepth = -1;
  lastTokenPos = -1;
  lastSlashWasDivision = false;
  templateStack = [];
  templateStackDepth = 0;
  openTokenPosStack = [];
  openClassPosStack = [];
  nextBraceIsClass = false;
  starExportMap = Object.create(null);
  lastStarExportSpecifier = null;

  _exports = new Set();
  unsafeGetters = new Set();
  reexports = new Set();
}

const Import = 0, ExportAssign = 1, ExportStar = 2;

const strictReserved = new Set(['implements', 'interface', 'let', 'package', 'private', 'protected', 'public', 'static', 'yield', 'enum']);

function parseCJS(input, name = '@') {
  resetState();
  try {
    parseSource(input);
  } catch (e) {
    e.message += `\n at ${name}:${input.slice(0, pos).split('\n').length}:${pos - input.lastIndexOf('\n', pos - 1)}`;
    e.loc = pos;
    throw e;
  }
  const result = {
    exports: [..._exports].filter(expt => !unsafeGetters.has(expt)),
    reexports: [...reexports]
  };
  resetState();
  return result;
}

function addExport(name) {
  if (!strictReserved.has(name)) _exports.add(name);
}

function parseSource(cjsSource) {
  source = cjsSource;
  pos = -1;
  end = source.length - 1;
  let ch = 0;

  if (source.startsWith('#!')) {
    pos += 2;
    while (pos++ < end && !isBr(source.charCodeAt(pos))) {}
  }

  while (pos++ < end) {
    ch = source.charCodeAt(pos);

    if (ch === 32 || (ch > 8 && ch < 14)) continue;

    if (openTokenDepth === 0) {
      switch (ch) {
        case 105: // 'i'
          if (source.startsWith('mport', pos + 1)) throwIfImportStatement();
          lastTokenPos = pos;
          continue;
        case 114: // 'r'
          const startPos = pos;
          if (tryParseRequire(Import)) tryBacktrackAddStarExportBinding(startPos - 1);
          lastTokenPos = pos;
          continue;
        case 95: // '_'
          if (source.startsWith('_export', pos + 1) && (keywordStart(pos) || source.charCodeAt(pos - 1) === 46)) {
            pos += 8;
            if (source.startsWith('Star', pos)) pos += 4;
            if (source.charCodeAt(pos) === 40) { // '('
              openTokenPosStack[openTokenDepth++] = lastTokenPos;
              if (source.charCodeAt(++pos) === 114) // 'r'
                tryParseRequire(ExportStar);
            }
          }
          lastTokenPos = pos;
          continue;
      }
    }

    switch (ch) {
      case 101: // 'e'
        if (source.startsWith('xport', pos + 1)) {
          if (source.charCodeAt(pos + 6) === 115) // 's'
            tryParseExportsDotAssign(false);
          else if (openTokenDepth === 0)
            throwIfExportStatement();
        }
        break;
      case 99: // 'c'
        if (source.startsWith('lass', pos + 1) && keywordStart(pos)) nextBraceIsClass = true;
        break;
      case 109: // 'm'
        if (source.startsWith('odule', pos + 1) && keywordStart(pos)) tryParseModuleExportsDotAssign();
        break;
      case 79: // 'O'
        if (source.startsWith('bject', pos + 1) && keywordStart(pos)) tryParseObjectDefineOrKeys(openTokenDepth === 0);
        break;
      case 40: // '('
        openTokenPosStack[openTokenDepth++] = lastTokenPos;
        break;
      case 41: // ')'
        if (openTokenDepth === 0) throw new Error('Unexpected closing bracket.');
        openTokenDepth--;
        break;
      case 123: // '{'
        openClassPosStack[openTokenDepth] = nextBraceIsClass;
        nextBraceIsClass = false;
        openTokenPosStack[openTokenDepth++] = lastTokenPos;
        break;
      case 125: // '}'
        if (openTokenDepth === 0) throw new Error('Unexpected closing brace.');
        if (--openTokenDepth === templateDepth) {
          templateDepth = templateStack[--templateStackDepth];
          templateString();
        } else if (templateDepth !== -1 && openTokenDepth < templateDepth) {
          throw new Error('Unexpected closing brace.');
        }
        break;
      case 39: // '\''
        singleQuoteString();
        break;
      case 34: // '"'
        doubleQuoteString();
        break;
      case 47: // '/'
        const nextCh = source.charCodeAt(pos + 1);
        if (nextCh === 47) { // '//'
          lineComment();
          continue;
        } else if (nextCh === 42) { // '/*'
          blockComment();
          continue;
        } else {
          const lastToken = source.charCodeAt(lastTokenPos);
          if (isExpressionPunctuator(lastToken) || isParenKeyword(openTokenPosStack[openTokenDepth]) || isExpressionTerminator(openTokenPosStack[openTokenDepth]) || isExpressionKeyword(lastTokenPos) || !lastToken) {
            regularExpression();
            lastSlashWasDivision = false;
          } else {
            lastSlashWasDivision = true;
          }
        }
        break;
      case 96: // '`'
        templateString();
        break;
    }
    lastTokenPos = pos;
  }

  if (templateDepth !== -1) throw new Error('Unterminated template.');
  if (openTokenDepth) throw new Error('Unterminated braces.');
}

function tryBacktrackAddStarExportBinding(bPos) {
  while (source.charCodeAt(bPos) === 32 && bPos >= 0) bPos--; // skip spaces
  if (source.charCodeAt(bPos) === 61) { // '='
    bPos--;
    while (source.charCodeAt(bPos) === 32 && bPos >= 0) bPos--;
    let identifierStart = false;
    const idEnd = bPos;
    while (bPos >= 0 && isIdentifierChar(codePointAtLast(bPos), true)) {
      identifierStart = isIdentifierStart(codePointAtLast(bPos), true);
      bPos -= codePointLen(codePointAtLast(bPos));
    }
    if (identifierStart && source.charCodeAt(bPos) === 32) {
      const starExportId = source.slice(bPos + 1, idEnd + 1);
      while (source.charCodeAt(bPos) === 32 && bPos >= 0) bPos--;
      if (source.charCodeAt(bPos) === 114 && source.startsWith('va', bPos - 2) || source.startsWith('le', bPos - 2) || source.startsWith('cons', bPos - 4)) {
        starExportMap[starExportId] = lastStarExportSpecifier;
      }
    }
  }
}

function tryParseModuleExportsDotAssign() {
  pos += 6;
  const revertPos = pos - 1;
  let ch = commentWhitespace();
  if (ch === 46) { // '.'
    pos++;
    ch = commentWhitespace();
    if (ch === 101 && source.startsWith('xports', pos + 1)) {
      tryParseExportsDotAssign(true);
      return;
    }
  }
  pos = revertPos;
}

function tryParseExportsDotAssign(assign) {
  pos += 7;
  const revertPos = pos - 1;
  let ch = commentWhitespace();
  switch (ch) {
    case 46: // '.'
      pos++;
      ch = commentWhitespace();
      const startPos = pos;
      if (identifier()) {
        const endPos = pos;
        ch = commentWhitespace();
        if (ch === 61) { // '='
          addExport(source.slice(startPos, endPos));
          return;
        }
      }
      break;
    case 91: // '['
      pos++;
      ch = commentWhitespace();
      if (ch === 39 || ch === 34) { // '\'' or '"'
        pos++;
        const startPos = pos;
        if (identifier() && source.charCodeAt(pos) === ch) {
          const endPos = pos++;
          ch = commentWhitespace();
          if (ch !== 93) break; // ']'
          pos++;
          ch = commentWhitespace();
          if (ch !== 61) break; // '='
          addExport(source.slice(startPos, endPos));
        }
      }
      break;
    case 61: // '='
      if (assign) {
        if (reexports.size) reexports = new Set();
        pos++;
        ch = commentWhitespace();
        if (ch === 123) { // '{'
          tryParseLiteralExports();
          return;
        }
        if (ch === 114) // 'r'
          tryParseRequire(ExportAssign);
      }
  }
  pos = revertPos;
}

function tryParseRequire(requireType) {
  const revertPos = pos;
  if (source.startsWith('equire', pos + 1)) {
    pos += 7;
    let ch = commentWhitespace();
    if (ch === 40) { // '('
      pos++;
      ch = commentWhitespace();
      const reexportStart = pos + 1;
      if (ch === 39) { // '\''
        singleQuoteString();
      } else if (ch === 34) { // '"'
        doubleQuoteString();
      } else {
        pos = revertPos;
        return false;
      }
      const reexportEnd = pos++;
      ch = commentWhitespace();
      if (ch === 41) { // ')'
        switch (requireType) {
          case ExportAssign:
            reexports.add(source.slice(reexportStart, reexportEnd));
            return true;
          case ExportStar:
            reexports.add(source.slice(reexportStart, reexportEnd));
            return true;
          default:
            lastStarExportSpecifier = source.slice(reexportStart, reexportEnd);
            return true;
        }
      }
    }
  }
  pos = revertPos;
  return false;
}

function throwIfImportStatement() {
  const startPos = pos;
  pos += 6;
  const ch = commentWhitespace();
  if (ch === 40) { // '('
    openTokenPosStack[openTokenDepth++] = startPos;
  } else if (ch === 46 || ch === 34 || ch === 39 || ch === 123 || ch === 42 || ch < startPos + 6) {
    if (openTokenDepth === 0) throw new Error('Unexpected import statement in CJS module.');
  }
}

function throwIfExportStatement() {
  pos += 6;
  const curPos = pos;
  const ch = commentWhitespace();
  if (pos === curPos && !isPunctuator(ch)) return;
  throw new Error('Unexpected export statement in CJS module.');
}

function commentWhitespace() {
  let ch;
  do {
    ch = source.charCodeAt(pos);
    if (ch === 47) { // '/'
      const nextCh = source.charCodeAt(pos + 1);
      if (nextCh === 47) lineComment();
      else if (nextCh === 42) blockComment();
      else return ch;
    } else if (!isBrOrWs(ch)) {
      return ch;
    }
  } while (pos++ < end);
  return ch;
}

function singleQuoteString() {
  while (pos++ < end) {
    let ch = source.charCodeAt(pos);
    if (ch === 39) return; // '\''
    if (ch === 92) { // '\\'
      ch = source.charCodeAt(++pos);
      if (ch === 13 && source.charCodeAt(pos + 1) === 10) pos++;
    } else if (isBr(ch)) {
      break;
    }
  }
  throw new Error('Unterminated string.');
}

function doubleQuoteString() {
  while (pos++ < end) {
    let ch = source.charCodeAt(pos);
    if (ch === 34) return; // '"'
    if (ch === 92) { // '\\'
      ch = source.charCodeAt(++pos);
      if (ch === 13 && source.charCodeAt(pos + 1) === 10) pos++;
    } else if (isBr(ch)) {
      break;
    }
  }
  throw new Error('Unterminated string.');
}

function regularExpression() {
  while (pos++ < end) {
    let ch = source.charCodeAt(pos);
    if (ch === 47) return; // '/'
    if (ch === 91) {
      ch = regexCharacterClass();
    } else if (ch === 92) {
      pos++;
    } else if (isBr(ch)) {
      break;
    }
  }
  throw new Error('Syntax error reading regular expression.');
}

function regexCharacterClass() {
  while (pos++ < end) {
    let ch = source.charCodeAt(pos);
    if (ch === 93) return ch; // ']'
    if (ch === 92) pos++;
    else if (isBr(ch)) break;
  }
  throw new Error('Syntax error reading regular expression class.');
}

function templateString() {
  while (pos++ < end) {
    const ch = source.charCodeAt(pos);
    if (ch === 36 && source.charCodeAt(pos + 1) === 123) { // '${'
      pos++;
      templateStack[templateStackDepth++] = templateDepth;
      templateDepth = ++openTokenDepth;
      return;
    }
    if (ch === 96) return; // '`'
    if (ch === 92) pos++;
  }
  syntaxError();
}

function lineComment() {
  while (pos++ < end) {
    const ch = source.charCodeAt(pos);
    if (ch === 10 || ch === 13) return;
  }
}

function blockComment() {
  pos++;
  while (pos++ < end) {
    const ch = source.charCodeAt(pos);
    if (ch === 42 && source.charCodeAt(pos + 1) === 47) { // '*/'
      pos++;
      return;
    }
  }
}

function isBr(c) {
  return c === 13 || c === 10;
}

function isBrOrWs(c) {
  return (c > 8 && c < 14) || (c === 32 || c === 160);
}

function keywordStart(pos) {
  return pos === 0 || isBrOrWsOrPunctuatorNotDot(source.charCodeAt(pos - 1));
}

function isPunctuator(ch) {
  return ch === 33 || ch === 37 || ch === 38 || (ch > 39 && ch < 48) || (ch > 57 && ch < 64) || ch === 91 || ch === 93 || ch === 94 || (ch > 122 && ch < 127);
}

function identifier() {
  const ch = source.codePointAt(pos);
  if (!isIdentifierStart(ch, true)) return false;
  pos += codePointLen(ch);
  while (true) {
    const ch = source.codePointAt(pos);
    if (isIdentifierChar(ch, true)) {
      pos += codePointLen(ch);
    } else if (ch === 92) return false; // '\'
    else break;
  }
  return true;
}

function codePointLen(ch) {
  if (ch < 0x10000) return 1;
  return 2;
}

function codePointAtLast(bPos) {
  const ch = source.charCodeAt(bPos);
  if ((ch & 0xFC00) === 0xDC00)
    return (((source.charCodeAt(bPos - 1) & 0x3FF) << 10) | (ch & 0x3FF)) + 0x10000;
  return ch;
}

const initPromise = Promise.resolve();

module.exports.init = () => initPromise;
module.exports.parse = parseCJS;
