"use strict";

const CJSImportProcessor = require('./CJSImportProcessor');
const computeSourceMap = require('./computeSourceMap');
const { HelperManager } = require('./HelperManager');
const identifyShadowedGlobals = require('./identifyShadowedGlobals');
const NameManager = require('./NameManager');
const { validateOptions } = require('./Options');
const { parse } = require('./parser');
const TokenProcessor = require('./TokenProcessor');
const RootTransformer = require('./transformers/RootTransformer');
const formatTokens = require('./util/formatTokens');
const getTSImportedNames = require('./util/getTSImportedNames');

exports.getVersion = function getVersion() {
  return require("../package.json").version;
};

exports.transform = function transform(code, options) {
  validateOptions(options);
  try {
    const sucraseContext = getSucraseContext(code, options);
    const transformer = new RootTransformer(
      sucraseContext,
      options.transforms,
      Boolean(options.enableLegacyBabel5ModuleInterop),
      options
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

exports.getFormattedTokens = function getFormattedTokens(code, options) {
  const tokens = getSucraseContext(code, options).tokenProcessor.tokens;
  return formatTokens(code, tokens);
};

function getSucraseContext(code, options) {
  const isJSXEnabled = options.transforms.includes("jsx");
  const isTypeScriptEnabled = options.transforms.includes("typescript");
  const isFlowEnabled = options.transforms.includes("flow");
  const file = parse(code, isJSXEnabled, isTypeScriptEnabled, isFlowEnabled);
  const tokens = file.tokens;
  const scopes = file.scopes;

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
      isTypeScriptEnabled,
      helperManager
    );
    importProcessor.preprocessTokens();
    identifyShadowedGlobals(tokenProcessor, scopes, importProcessor.getGlobalNames());
    if (isTypeScriptEnabled) {
      importProcessor.pruneTypeOnlyImports();
    }
  } else if (isTypeScriptEnabled) {
    identifyShadowedGlobals(tokenProcessor, scopes, getTSImportedNames(tokenProcessor));
  }
  return { tokenProcessor, scopes, nameManager, importProcessor, helperManager };
}