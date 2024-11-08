"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

const CJSImportProcessor = require('./CJSImportProcessor').default;
const computeSourceMap = require('./computeSourceMap').default;
const HelperManager = require('./HelperManager');
const identifyShadowedGlobals = require('./identifyShadowedGlobals').default;
const NameManager = require('./NameManager').default;
const Options = require('./Options');
const parser = require('./parser');
const TokenProcessor = require('./TokenProcessor').default;
const RootTransformer = require('./transformers/RootTransformer').default;
const formatTokens = require('./util/formatTokens').default;
const getTSImportedNames = require('./util/getTSImportedNames').default;

function getVersion() {
  return require("../package.json").version;
}
exports.getVersion = getVersion;

function transform(code, options) {
  Options.validateOptions(options);
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
}
exports.transform = transform;

function getFormattedTokens(code, options) {
  const tokens = getSucraseContext(code, options).tokenProcessor.tokens;
  return formatTokens(code, tokens);
}
exports.getFormattedTokens = getFormattedTokens;

function getSucraseContext(code, options) {
  const isJSXEnabled = options.transforms.includes("jsx");
  const isTypeScriptEnabled = options.transforms.includes("typescript");
  const isFlowEnabled = options.transforms.includes("flow");
  const file = parser.parse(code, isJSXEnabled, isTypeScriptEnabled, isFlowEnabled);
  const tokens = file.tokens;
  const scopes = file.scopes;

  const nameManager = new NameManager(code, tokens);
  const helperManager = new HelperManager.HelperManager(nameManager);
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
}
