import { parseAst, parseAstAsync } from 'rollup/parseAst';
import { isInNodeModules, arraify } from './chunks/dep-CDnG8rE7.js';
import { existsSync, readFileSync } from 'node:fs';
import { ViteRuntime, ESModulesRunner } from 'vite/runtime';

export { 
  parseAst, 
  parseAstAsync,
  build,
  buildErrorMessage,
  createFilter,
  createLogger,
  createServer,
  defineConfig,
  fetchModule,
  formatPostcssSourceMap,
  isFileServingAllowed,
  loadConfigFromFile,
  loadEnv,
  mergeAlias,
  mergeConfig,
  normalizePath,
  optimizeDeps,
  preprocessCSS,
  preview,
  resolveConfig,
  resolveEnvPrefix,
  rollupVersion,
  searchForWorkspaceRoot,
  send,
  sortUserPlugins,
  transformWithEsbuild,
} from './chunks/dep-CDnG8rE7.js';

export { VERSION as version } from './constants.js';
export { version as esbuildVersion } from 'esbuild';

// Regular expression to identify CSS-related file requests
const CSS_LANGS_RE = /\.(css|less|sass|scss|styl|stylus|pcss|postcss|sss)(?:$|\?)/;
const isCSSRequest = (request) => CSS_LANGS_RE.test(request);

// Cache class for managing vendor chunk splitting
class SplitVendorChunkCache {
  constructor() {
    this.cache = new Map();
  }
  reset() {
    this.cache = new Map();
  }
}

// Function to determine vendor chunks in build
function splitVendorChunk(options = {}) {
  const cache = options.cache ?? new SplitVendorChunkCache();
  return (id, { getModuleInfo }) => {
    if (isInNodeModules(id) && !isCSSRequest(id) && staticImportedByEntry(id, getModuleInfo, cache.cache)) {
      return "vendor";
    }
  };
}

// Helper function to check if a module is statically imported by an entry point
function staticImportedByEntry(id, getModuleInfo, cache, importStack = []) {
  if (cache.has(id)) return cache.get(id);
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
  const result = mod.importers.some(importer =>
    staticImportedByEntry(importer, getModuleInfo, cache, importStack.concat(id))
  );
  cache.set(id, result);
  return result;
}

// Plugin to integrate vendor chunk splitting in build process
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
            output.manualChunks = typeof output.manualChunks === "function"
              ? (id, api) => output.manualChunks(id, api) ?? viteManualChunks(id, api)
              : viteManualChunks;
          }
        }
      } else {
        return {
          build: {
            rollupOptions: {
              output: {
                manualChunks: createSplitVendorChunk({}, config),
              },
            },
          },
        };
      }
    },
    buildStart() {
      caches.forEach(cache => cache.reset());
    },
  };
}

// Class managing the client-side of server HMR
class ServerHMRBroadcasterClient {
  constructor(hmrChannel) {
    this.hmrChannel = hmrChannel;
  }
  send(...args) {
    const payload = typeof args[0] === "string"
      ? { type: "custom", event: args[0], data: args[1] }
      : args[0];
    if (payload.type !== "custom") {
      throw new Error("Cannot send non-custom events from the client to the server.");
    }
    this.hmrChannel.send(payload);
  }
}

// Class managing server-side HMR connections
class ServerHMRConnector {
  handlers = [];
  hmrChannel;
  hmrClient;
  connected = false;

  constructor(server) {
    const hmrChannel = server.hot?.channels.find(c => c.name === "ssr");
    if (!hmrChannel) {
      throw new Error("Your version of Vite doesn't support HMR during SSR. Please, use Vite 5.1 or higher.");
    }
    this.hmrClient = new ServerHMRBroadcasterClient(hmrChannel);
    hmrChannel.api.outsideEmitter.on("send", payload => {
      this.handlers.forEach(listener => listener(payload));
    });
    this.hmrChannel = hmrChannel;
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

// Create HMR options based on server configuration
function createHMROptions(server, options) {
  if (server.config.server.hmr === false || options.hmr === false) return false;
  const connection = new ServerHMRConnector(server);
  return {
    connection,
    logger: options.hmr?.logger
  };
}

// Object for stack trace preparation
const prepareStackTrace = {
  retrieveFile(id) {
    if (existsSync(id)) {
      return readFileSync(id, "utf-8");
    }
  }
};

// Resolve source map options based on configurations
function resolveSourceMapOptions(options) {
  if (options.sourcemapInterceptor != null) {
    if (options.sourcemapInterceptor === "prepareStackTrace") {
      return prepareStackTrace;
    }
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

// Create Vite runtime environment incorporating HMR and source map handling
async function createViteRuntime(server, options = {}) {
  const hmr = createHMROptions(server, options);
  return new ViteRuntime(
    {
      ...options,
      root: server.config.root,
      fetchModule: server.ssrFetchModule,
      hmr,
      sourcemapInterceptor: resolveSourceMapOptions(options)
    },
    options.runner || new ESModulesRunner()
  );
}

export {
  ServerHMRConnector,
  createViteRuntime,
  isCSSRequest,
  splitVendorChunk,
  splitVendorChunkPlugin
};
