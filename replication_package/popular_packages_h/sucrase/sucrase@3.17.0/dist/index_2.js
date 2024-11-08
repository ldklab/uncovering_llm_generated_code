"use strict";

const fs = require('fs');
const path = require('path');
const CJSImportProcessor = require('./CJSImportProcessor').default;
const computeSourceMap = require('./computeSourceMap').default;
const { HelperManager } = require('./HelperManager');
const identifyShadowedGlobals = require('./identifyShadowedGlobals').default;
const NameManager = require('./NameManager').default;
const { validateOptions } = require('./Options');
const { parse } = require('./parser');
const TokenProcessor = require('./TokenProcessor').default;
const RootTransformer = require('./transformers/RootTransformer').default;
const formatTokens = require('./util/formatTokens').default;
const getTSImportedNames = require('./util/getTSImportedNames').default;

const getVersion = () => {
  return JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8')).version;
};

const transform = (code, options) => {
  validateOptions(options);
  try {
    const sucraseContext = getSucraseContext(code, options);
    const transformer = new RootTransformer(
      sucraseContext,
      options.transforms,
      Boolean(options.enableLegacyBabel5ModuleInterop),
      options,
    );
    let result = { code: transformer.transform() };
    if (options.sourceMapOptions) {
      if (!options.filePath) {
        throw new Error("filePath must be specified when generating a source map.");
      }
      result = {
        ...result,
        sourceMap: computeSourceMap(result.code, options.filePath, options.sourceMapOptions),
      };
    }
    return result;
  } catch (e) {
    if (options.filePath) {
      e.message = `Error transforming ${options.filePath}: ${e.message}`;
    }
    throw e;
  }
};

const getFormattedTokens = (code, options) => {
  const tokens = getSucraseContext(code, options).tokenProcessor.tokens;
  return formatTokens(code, tokens);
};

const getSucraseContext = (code, options) => {
  const isJSXEnabled = options.transforms.includes("jsx");
  const isTypeScriptEnabled = options.transforms.includes("typescript");
  const isFlowEnabled = options.transforms.includes("flow");
  const file = parse(code, isJSXEnabled, isTypeScriptEnabled, isFlowEnabled);
  const { tokens, scopes } = file;

  const nameManager = new NameManager(code, tokens);
  const helperManager = new HelperManager(nameManager);
  const tokenProcessor = new TokenProcessor(code, tokens, isFlowEnabled, helperManager);
  const enableLegacyTypeScriptModuleInterop = Boolean(options.enableLegacyTypeScriptModuleInterop);

  let importProcessor = null;
  if (options.transforms.includes("imports")) {
    importProcessor = new CJSImportProcessor(
      nameManager,
      tokenProcessor,
      enableLegacyTypeScriptModuleInterop,
      options,
      options.transforms.includes("typescript"),
      helperManager,
    );
    importProcessor.preprocessTokens();
    identifyShadowedGlobals(tokenProcessor, scopes, importProcessor.getGlobalNames());
    if (options.transforms.includes("typescript")) {
      importProcessor.pruneTypeOnlyImports();
    }
  } else if (options.transforms.includes("typescript")) {
    identifyShadowedGlobals(tokenProcessor, scopes, getTSImportedNames(tokenProcessor));
  }
  return { tokenProcessor, scopes, nameManager, importProcessor, helperManager };
};

exports.getVersion = getVersion;
exports.transform = transform;
exports.getFormattedTokens = getFormattedTokens;
