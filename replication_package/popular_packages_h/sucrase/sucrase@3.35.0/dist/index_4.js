"use strict";

const { default: CJSImportProcessor } = require('./CJSImportProcessor');
const { default: computeSourceMap } = require('./computeSourceMap');
const { HelperManager } = require('./HelperManager');
const { default: identifyShadowedGlobals } = require('./identifyShadowedGlobals');
const { default: NameManager } = require('./NameManager');
const Options = require('./Options');
const { parse } = require('./parser');
const { default: TokenProcessor } = require('./TokenProcessor');
const { default: RootTransformer } = require('./transformers/RootTransformer');
const { default: formatTokens } = require('./util/formatTokens');
const { default: getTSImportedNames } = require('./util/getTSImportedNames');

function getVersion() {
  // istanbul ignore next 
  return "3.35.0";
}

function transform(code, options) {
  Options.validateOptions(options);
  const sucraseContext = getSucraseContext(code, options);
  const transformer = new RootTransformer(
    sucraseContext,
    options.transforms,
    Boolean(options.enableLegacyBabel5ModuleInterop),
    options
  );
  const transformerResult = transformer.transform();
  let result = { code: transformerResult.code };

  if (options.sourceMapOptions) {
    if (!options.filePath) {
      throw new Error("filePath must be specified when generating a source map.");
    }
    result = {
      ...result,
      sourceMap: computeSourceMap(
        transformerResult,
        options.filePath,
        options.sourceMapOptions,
        code,
        sucraseContext.tokenProcessor.tokens
      ),
    };
  }
  return result;
}

function getFormattedTokens(code, options) {
  const tokens = getSucraseContext(code, options).tokenProcessor.tokens;
  return formatTokens(code, tokens);
}

function getSucraseContext(code, options) {
  const isJSXEnabled = options.transforms.includes("jsx");
  const isTypeScriptEnabled = options.transforms.includes("typescript");
  const isFlowEnabled = options.transforms.includes("flow");
  const disableESTransforms = options.disableESTransforms === true;
  const file = parse(code, isJSXEnabled, isTypeScriptEnabled, isFlowEnabled);
  const tokens = file.tokens;
  const scopes = file.scopes;

  const nameManager = new NameManager(code, tokens);
  const helperManager = new HelperManager(nameManager);
  const tokenProcessor = new TokenProcessor(
    code,
    tokens,
    isFlowEnabled,
    disableESTransforms,
    helperManager
  );

  const enableLegacyTypeScriptModuleInterop = Boolean(options.enableLegacyTypeScriptModuleInterop);
  let importProcessor = null;

  if (options.transforms.includes("imports")) {
    importProcessor = new CJSImportProcessor(
      nameManager,
      tokenProcessor,
      enableLegacyTypeScriptModuleInterop,
      options,
      options.transforms.includes("typescript"),
      Boolean(options.keepUnusedImports),
      helperManager
    );
    importProcessor.preprocessTokens();
    identifyShadowedGlobals(tokenProcessor, scopes, importProcessor.getGlobalNames());
    if (options.transforms.includes("typescript") && !options.keepUnusedImports) {
      importProcessor.pruneTypeOnlyImports();
    }
  } else if (options.transforms.includes("typescript") && !options.keepUnusedImports) {
    identifyShadowedGlobals(tokenProcessor, scopes, getTSImportedNames(tokenProcessor));
  }

  return { tokenProcessor, scopes, nameManager, importProcessor, helperManager };
}

module.exports = { getVersion, transform, getFormattedTokens };