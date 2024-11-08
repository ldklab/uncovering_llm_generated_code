import { parseAst, parseAstAsync } from 'rollup/parseAst';
import { i as isInNodeModules, a as arraify } from './chunks/dep-CDnG8rE7.js';
import {
  b as build,
  g as buildErrorMessage,
  k as createFilter,
  v as createLogger,
  c as createServer,
  d as defineConfig,
  h as fetchModule,
  f as formatPostcssSourceMap,
  x as isFileServingAllowed,
  l as loadConfigFromFile,
  y as loadEnv,
  j as mergeAlias,
  m as mergeConfig,
  n as normalizePath,
  o as optimizeDeps,
  e as preprocessCSS,
  p as preview,
  r as resolveConfig,
  z as resolveEnvPrefix,
  q as rollupVersion,
  w as searchForWorkspaceRoot,
  u as send,
  s as sortUserPlugins,
  t as transformWithEsbuild
} from './chunks/dep-CDnG8rE7.js';
import { VERSION as version } from './constants.js';
import { version as esbuildVersion } from 'esbuild';
import { existsSync, readFileSync } from 'node:fs';
import { ViteRuntime, ESModulesRunner } from 'vite/runtime';

// Regular expression to detect CSS file requests
const CSS_LANGS_RE = /\.(css|less|sass|scss|styl|stylus|pcss|postcss|sss)(?:$|\?)/;
const isCSSRequest = (request) => CSS_LANGS_RE.test(request);

// Class for caching vendor chunk information
class SplitVendorChunkCache {
  constructor() {
    this.cache = new Map();
  }
  reset() {
    this.cache.clear();
  }
}

// Function to split vendor chunks
function splitVendorChunk(options = {}) {
  const cache = options.cache ?? new SplitVendorChunkCache();
  return (id, { getModuleInfo }) => {
    if (isInNodeModules(id) && !isCSSRequest(id) && staticImportedByEntry(id, getModuleInfo, cache.cache)) {
      return "vendor";
    }
  };
}

// Function to check if a module is statically imported by an entry
function staticImportedByEntry(id, getModuleInfo, cache, importStack = []) {
  if (cache.has(id)) {
    return cache.get(id);
  }
  if (importStack.includes(id)) {
    cache.set(id, false);
    return false;
  }
  const mod = getModuleInfo(id);
  if (!mod) {
    cache.set(id, false);
    return false;
  }
  if (mod.isEntry) {
    cache.set(id, true);
    return true;
  }
  const result = mod.importers.some(
    (importer) => staticImportedByEntry(importer, getModuleInfo, cache, [...importStack, id])
  );
  cache.set(id, result);
  return result;
}

// Vite plugin to handle vendor chunk splitting
function splitVendorChunkPlugin() {
  const caches = [];
  function createSplitVendorChunk(output, config) {
    const cache = new SplitVendorChunkCache();
    caches.push(cache);
    const build = config.build ?? {};
    const format = output?.format;
    if (!build.ssr && !build.lib && format !== "umd" && format !== "iife") {
      return splitVendorChunk({ cache });
    }
  }
  return {
    name: "vite:split-vendor-chunk",
    config(config) {
      let outputs = config?.build?.rollupOptions?.output;
      if (outputs) {
        outputs = arraify(outputs);
        for (const output of outputs) {
          const viteManualChunks = createSplitVendorChunk(output, config);
          if (viteManualChunks) {
            if (typeof output.manualChunks === "function") {
              const userManualChunks = output.manualChunks;
              output.manualChunks = (id, api) => {
                return userManualChunks(id, api) ?? viteManualChunks(id, api);
              };
            } else {
              console.warn(
                "(!) the `splitVendorChunk` plugin doesn't have any effect when using the object form of `build.rollupOptions.output.manualChunks`. Consider using the function form instead."
              );
            }
          } else {
            output.manualChunks = viteManualChunks;
          }
        }
      } else {
        return {
          build: {
            rollupOptions: {
              output: {
                manualChunks: createSplitVendorChunk({}, config)
              }
            }
          }
        };
      }
    },
    buildStart() {
      caches.forEach((cache) => cache.reset());
    }
  };
}

// Class to handle communication for HMR between client and server
class ServerHMRBroadcasterClient {
  constructor(hmrChannel) {
    this.hmrChannel = hmrChannel;
  }
  send(...args) {
    const event = args[0];
    const data = args[1];
    if (typeof event !== "string") {
      throw new Error("Cannot send non-custom events from the client to the server.");
    }
    this.hmrChannel.send({ type: "custom", event, data });
  }
}

// Class to connect server-side HMR
class ServerHMRConnector {
  constructor(server) {
    this.handlers = [];
    this.hmrChannel = server.hot?.channels.find(c => c.name === "ssr");
    if (!this.hmrChannel) {
      throw new Error("Your version of Vite doesn't support HMR during SSR. Please, use Vite 5.1 or higher.");
    }
    this.hmrClient = new ServerHMRBroadcasterClient(this.hmrChannel);
    this.hmrChannel.api.outsideEmitter.on("send", (payload) => {
      this.handlers.forEach((listener) => listener(payload));
    });
    this.connected = false;
  }
  isReady() {
    return this.connected;
  }
  send(message) {
    const payload = JSON.parse(message);
    this.hmrChannel.api.innerEmitter.emit(payload.event, payload.data, this.hmrClient);
  }
  onUpdate(handler) {
    this.handlers.push(handler);
    handler({ type: "connected" });
    this.connected = true;
  }
}

// Create HMR options based on configurations
function createHMROptions(server, options) {
  if (server.config.server.hmr === false || options.hmr === false) {
    return false;
  }
  const connection = new ServerHMRConnector(server);
  return {
    connection,
    logger: options.hmr?.logger
  };
}

// Source map retrieval functions
const prepareStackTrace = {
  retrieveFile(id) {
    return existsSync(id) ? readFileSync(id, "utf-8") : undefined;
  }
};

// Resolve sourcemap options
function resolveSourceMapOptions(options) {
  if (options.sourcemapInterceptor) {
    if (options.sourcemapInterceptor === "prepareStackTrace") return prepareStackTrace;
    if (typeof options.sourcemapInterceptor === "object") {
      return { ...prepareStackTrace, ...options.sourcemapInterceptor };
    }
    return options.sourcemapInterceptor;
  }
  if (typeof process !== "undefined" && "setSourceMapsEnabled" in process) {
    return "node";
  }
  return prepareStackTrace;
}

// Create Vite runtime with configuration
async function createViteRuntime(server, options = {}) {
  const hmr = createHMROptions(server, options);
  return new ViteRuntime({
    ...options,
    root: server.config.root,
    fetchModule: server.ssrFetchModule,
    hmr,
    sourcemapInterceptor: resolveSourceMapOptions(options)
  }, options.runner ?? new ESModulesRunner());
}

export {
  ServerHMRConnector,
  createViteRuntime,
  isCSSRequest,
  splitVendorChunk,
  splitVendorChunkPlugin
};
