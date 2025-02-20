let source, pos, end;
let openTokenDepth, templateDepth, lastTokenPos, lastSlashWasDivision;
let templateStack, templateStackDepth, openTokenPosStack, openClassPosStack;
let nextBraceIsClass, starExportMap, lastStarExportSpecifier;
let _exports, unsafeGetters, reexports;

function resetState() {
  openTokenDepth = 0;
  templateDepth = -1;
  lastTokenPos = -1;
  lastSlashWasDivision = false;
  templateStack = new Array(1024);
  templateStackDepth = 0;
  openTokenPosStack = new Array(1024);
  openClassPosStack = new Array(1024);
  nextBraceIsClass = false;
  starExportMap = Object.create(null);
  lastStarExportSpecifier = null;

  _exports = new Set();
  unsafeGetters = new Set();
  reexports = new Set();
}

const Import = 0;
const ExportAssign = 1;
const ExportStar = 2;

const strictReserved = new Set([
  'implements', 'interface', 'let', 'package', 'private', 
  'protected', 'public', 'static', 'yield', 'enum'
]);

function parseCJS(source, name = '@') {
  resetState();
  try {
    parseSource(source);
  } catch (e) {
    e.message += `\n  at ${name}:${source.slice(0, pos).split('\n').length}:${pos - source.lastIndexOf('\n', pos - 1)}`;
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

  if (source.charCodeAt(0) === 35 /*#*/ && source.charCodeAt(1) === 33 /*!*/) {
    if (source.length === 2) return true;
    pos += 2;
    while (pos++ < end) {
      ch = source.charCodeAt(pos);
      if (ch === 10 /*\n*/ || ch === 13 /*\r*/) break;
    }
  }

  while (pos++ < end) {
    ch = source.charCodeAt(pos);

    if (ch === 32 || ch < 14 && ch > 8) continue;

    if (openTokenDepth === 0) {
      switch (ch) {
        case 105 /*i*/:
          if (source.startsWith('mport', pos + 1) && keywordStart(pos)) {
            throwIfImportStatement();
          }
          lastTokenPos = pos;
          continue;
        case 114 /*r*/:
          const startPos = pos;
          if (tryParseRequire(Import) && keywordStart(startPos)) {
            tryBacktrackAddStarExportBinding(startPos - 1);
          }
          lastTokenPos = pos;
          continue;
        case 95 /*_*/:
          if (source.startsWith('_export', pos + 1) && 
            (keywordStart(pos) || source.charCodeAt(pos - 1) === 46 /*.*/)) {
            pos += 8;
            if (source.startsWith('Star', pos)) pos += 4;
            if (source.charCodeAt(pos) === 40 /*(*/) {
              openTokenPosStack[openTokenDepth++] = lastTokenPos;
              if (source.charCodeAt(++pos) === 114 /*r*/) {
                tryParseRequire(ExportStar);
              }
            }
          }
          lastTokenPos = pos;
          continue;
      }
    }

    switch (ch) {
      case 101 /*e*/:
        if (source.startsWith('xport', pos + 1) && keywordStart(pos)) {
          if (source.charCodeAt(pos + 6) === 115 /*s*/) {
            tryParseExportsDotAssign(false);
          } else if (openTokenDepth === 0) {
            throwIfExportStatement();
          }
        }
        break;
      case 99 /*c*/:
        if (keywordStart(pos) && 
          source.startsWith('lass', pos + 1) && 
          isBrOrWs(source.charCodeAt(pos + 5))) {
          nextBraceIsClass = true;
        }
        break;
      case 109 /*m*/:
        if (source.startsWith('odule', pos + 1) && keywordStart(pos)) {
          tryParseModuleExportsDotAssign();
        }
        break;
      case 79 /*O*/:
        if (source.startsWith('bject', pos + 1) && keywordStart(pos)) {
          tryParseObjectDefineOrKeys(openTokenDepth === 0);
        }
        break;
      case 40 /*(*/:
        openTokenPosStack[openTokenDepth++] = lastTokenPos;
        break;
      case 41 /*)*/:
        if (openTokenDepth === 0) {
          throw new Error('Unexpected closing bracket.');
        }
        openTokenDepth--;
        break;
      case 123 /*{*/:
        openClassPosStack[openTokenDepth] = nextBraceIsClass;
        nextBraceIsClass = false;
        openTokenPosStack[openTokenDepth++] = lastTokenPos;
        break;
      case 125 /*}*/:
        if (openTokenDepth === 0) {
          throw new Error('Unexpected closing brace.');
        }
        if (openTokenDepth-- === templateDepth) {
          templateDepth = templateStack[--templateStackDepth];
          templateString();
        } else {
          if (templateDepth !== -1 && openTokenDepth < templateDepth) {
            throw new Error('Unexpected closing brace.');
          }
        }
        break;
      case 39 /*'*/:
        singleQuoteString();
        break;
      case 34 /*"*/:
        doubleQuoteString();
        break;
      case 47 /*/*/: {
        const next_ch = source.charCodeAt(pos + 1);
        if (next_ch === 47 /*/*/) {
          lineComment();
          continue;
        } else if (next_ch === 42 /***/) {
          blockComment();
          continue;
        } else {
          const lastToken = source.charCodeAt(lastTokenPos);
          if (isExpressionPunctuator(lastToken) &&
              !(lastToken === 46 /*.*/ && 
                (source.charCodeAt(lastTokenPos - 1) >= 48 /*0*/ && 
                 source.charCodeAt(lastTokenPos - 1) <= 57 /*9*/)) &&
              !(lastToken === 43 /*+*/ && source.charCodeAt(lastTokenPos - 1) === 43 /*+*/) && 
              !(lastToken === 45 /*-*/ && source.charCodeAt(lastTokenPos - 1) === 45 /*-*/) ||
              lastToken === 41 /*)*/ && isParenKeyword(openTokenPosStack[openTokenDepth]) ||
              lastToken === 125 /*}*/ && 
              (isExpressionTerminator(openTokenPosStack[openTokenDepth]) || openClassPosStack[openTokenDepth]) ||
              lastToken === 47 /*/*/ && lastSlashWasDivision ||
              isExpressionKeyword(lastTokenPos) ||
              !lastToken) {
            regularExpression();
            lastSlashWasDivision = false;
          } else {
            lastSlashWasDivision = true;
          }
        }
        break;
      }
      case 96 /*`*/:
        templateString();
        break;
    }
    lastTokenPos = pos;
  }

  if (templateDepth !== -1) {
    throw new Error('Unterminated template.');
  }

  if (openTokenDepth) {
    throw new Error('Unterminated braces.');
  }
}

function tryBacktrackAddStarExportBinding(bPos) {
  while (source.charCodeAt(bPos) === 32 /* */ && bPos >= 0) bPos--;
  if (source.charCodeAt(bPos) === 61 /*=*/) {
    bPos--;
    while (source.charCodeAt(bPos) === 32 /* */ && bPos >= 0) bPos--;
    let codePoint;
    const id_end = bPos;
    let identifierStart = false;
    while ((codePoint = codePointAtLast(bPos)) && bPos >= 0) {
      if (codePoint === 92 /*\*/) return;
      if (!isIdentifierChar(codePoint, true)) break;
      identifierStart = isIdentifierStart(codePoint, true);
      bPos -= codePointLen(codePoint);
    }
    if (identifierStart && source.charCodeAt(bPos) === 32 /* */) {
      const starExportId = source.slice(bPos + 1, id_end + 1);
      while (source.charCodeAt(bPos) === 32 /* */ && bPos >= 0) bPos--;
      switch (source.charCodeAt(bPos)) {
        case 114 /*r*/:
          if (!source.startsWith('va', bPos - 2)) return;
          break;
        case 116 /*t*/:
          if (!source.startsWith('le', bPos - 2) && !source.startsWith('cons', bPos - 4)) return;
          break;
        default: return;
      }
      starExportMap[starExportId] = lastStarExportSpecifier;
    }
  }
}

// ... Remaining functions continue, following the similar structure ...

// Module Exports
module.exports.init = () => Promise.resolve();
module.exports.parse = parseCJS;
