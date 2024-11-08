"use strict";
const path = require("path");
const { promises: fs } = require("fs");
const vm = require("vm");
const toughCookie = require("tough-cookie");
const sniffHTMLEncoding = require("html-encoding-sniffer");
const { URL } = require("whatwg-url");
const whatwgEncoding = require("whatwg-encoding");
const MIMEType = require("whatwg-mimetype");
const idlUtils = require("./jsdom/living/generated/utils.js");
const VirtualConsole = require("./jsdom/virtual-console.js");
const { createWindow } = require("./jsdom/browser/Window.js");
const { parseIntoDocument } = require("./jsdom/browser/parser");
const { fragmentSerialization } = require("./jsdom/living/domparsing/serialization.js");
const ResourceLoader = require("./jsdom/browser/resources/resource-loader.js");
const NoOpResourceLoader = require("./jsdom/browser/resources/no-op-resource-loader.js");

class CookieJar extends toughCookie.CookieJar {
  constructor(store, options) {
    super(store, { looseMode: true, ...options });
  }
}

const windowSymbol = Symbol("window");
let sharedFragmentDocument = null;

class JSDOM {
  constructor(input = "", options = {}) {
    const mimeType = new MIMEType(options.contentType || "text/html");
    const { html, encoding } = normalizeHTML(input, mimeType);

    options = transformOptions(options, encoding, mimeType);

    this[windowSymbol] = createWindow(options.windowOptions);

    const documentImpl = idlUtils.implForWrapper(this[windowSymbol]._document);
    options.beforeParse(this[windowSymbol]._globalProxy);

    parseIntoDocument(html, documentImpl);
    documentImpl.close();
  }

  get window() {
    return this[windowSymbol]._globalProxy;
  }

  get virtualConsole() {
    return this[windowSymbol]._virtualConsole;
  }

  get cookieJar() {
    return idlUtils.implForWrapper(this[windowSymbol]._document)._cookieJar;
  }

  serialize() {
    return fragmentSerialization(idlUtils.implForWrapper(this[windowSymbol]._document), { requireWellFormed: false });
  }

  nodeLocation(node) {
    const documentImpl = idlUtils.implForWrapper(this[windowSymbol]._document);
    if (!documentImpl._parseOptions.sourceCodeLocationInfo) {
      throw new Error("Location information was not saved for this jsdom.");
    }
    return idlUtils.implForWrapper(node).sourceCodeLocation;
  }

  getInternalVMContext() {
    if (!vm.isContext(this[windowSymbol])) {
      throw new TypeError("This jsdom was not configured to allow script running.");
    }
    return this[windowSymbol];
  }

  reconfigure(settings) {
    const windowObject = this[windowSymbol];
    if ("windowTop" in settings) {
      windowObject._top = settings.windowTop;
    }
    if ("url" in settings) {
      const documentImpl = idlUtils.implForWrapper(windowObject._document);

      const url = new URL(settings.url);
      documentImpl._URL = url;
      documentImpl._origin = url.origin;
      windowObject._sessionHistory.currentEntry.url = url;
    }
  }

  static fragment(string = "") {
    if (!sharedFragmentDocument) {
      sharedFragmentDocument = (new JSDOM()).window.document;
    }
    const template = sharedFragmentDocument.createElement("template");
    template.innerHTML = string;
    return template.content;
  }

  static fromURL(url, options = {}) {
    return Promise.resolve().then(() => {
      const parsedURL = new URL(url);
      const originalHash = parsedURL.hash;
      parsedURL.hash = "";
      const href = parsedURL.href;

      options = normalizeFromURLOptions(options);
      const resourceLoader = resourcesToResourceLoader(options.resources);
      const loader = resourceLoader.constructor === NoOpResourceLoader ? new ResourceLoader() : resourceLoader;

      return loader.fetch(href, {
        accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        cookieJar: options.cookieJar,
        referrer: options.referrer
      }).then(body => {
        const res = loader.response;
        const newOptions = {
          url: loader.href + originalHash,
          contentType: res.headers["content-type"],
          referrer: loader.getHeader("referer") || undefined
        };
        return new JSDOM(body, { ...options, ...newOptions });
      });
    });
  }

  static async fromFile(filename, options = {}) {
    options = normalizeFromFileOptions(filename, options);
    const buffer = await fs.readFile(filename);
    return new JSDOM(buffer, options);
  }
}

function normalizeFromURLOptions(options) {
  if (options.url || options.contentType) {
    throw new TypeError("Invalid options for fromURL");
  }
  const normalized = { ...options };
  if (options.referrer) {
    normalized.referrer = new URL(options.referrer).href;
  }
  if (!options.cookieJar) {
    normalized.cookieJar = new CookieJar();
  }
  return normalized;
}

function normalizeFromFileOptions(filename, options) {
  const normalized = { ...options };
  if (!normalized.contentType) {
    const ext = path.extname(filename);
    if (ext === ".xhtml" || ext === ".xht" || ext === ".xml") {
      normalized.contentType = "application/xhtml+xml";
    }
  }
  if (!normalized.url) {
    normalized.url = new URL(`file:${path.resolve(filename)}`);
  }
  return normalized;
}

function transformOptions(options, encoding, mimeType) {
  const transformed = {
    windowOptions: {
      url: "about:blank",
      referrer: "",
      contentType: "text/html",
      parsingMode: "html",
      parseOptions: {
        sourceCodeLocationInfo: false,
        scriptingEnabled: false
      },
      runScripts: undefined,
      encoding,
      pretendToBeVisual: false,
      storageQuota: 5000000,
      resourceLoader: undefined,
      virtualConsole: undefined,
      cookieJar: undefined
    },
    beforeParse() {}
  };

  if (!mimeType.isHTML() && !mimeType.isXML()) {
    throw new RangeError(`Content type "${options.contentType}" is not valid`);
  }

  transformed.windowOptions.contentType = mimeType.essence;
  transformed.windowOptions.parsingMode = mimeType.isHTML() ? "html" : "xml";

  if (options.url) {
    transformed.windowOptions.url = new URL(options.url).href;
  }
  if (options.referrer) {
    transformed.windowOptions.referrer = new URL(options.referrer).href;
  }
  if (options.includeNodeLocations) {
    if (transformed.windowOptions.parsingMode === "xml") {
      throw new TypeError("Cannot includeNodeLocations with XML");
    }
    transformed.windowOptions.parseOptions.sourceCodeLocationInfo = true;
  }
  transformed.windowOptions.cookieJar = options.cookieJar || new CookieJar();
  transformed.windowOptions.virtualConsole = options.virtualConsole || (new VirtualConsole()).sendTo(console);

  if (!(transformed.windowOptions.virtualConsole instanceof VirtualConsole)) {
    throw new TypeError("Invalid virtualConsole option");
  }
  
  transformed.windowOptions.resourceLoader = resourcesToResourceLoader(options.resources);

  if (options.runScripts !== undefined) {
    transformed.windowOptions.runScripts = String(options.runScripts);
    if (transformed.windowOptions.runScripts === "dangerously") {
      transformed.windowOptions.parseOptions.scriptingEnabled = true;
    } else if (transformed.windowOptions.runScripts !== "outside-only") {
      throw new RangeError("Invalid runScripts option");
    }
  }

  if (options.beforeParse) {
    transformed.beforeParse = options.beforeParse;
  }
  if (options.pretendToBeVisual !== undefined) {
    transformed.windowOptions.pretendToBeVisual = Boolean(options.pretendToBeVisual);
  }
  if (options.storageQuota !== undefined) {
    transformed.windowOptions.storageQuota = Number(options.storageQuota);
  }

  return transformed;
}

function normalizeHTML(html, mimeType) {
  let encoding = "UTF-8";

  if (ArrayBuffer.isView(html)) {
    html = Buffer.from(html.buffer, html.byteOffset, html.byteLength);
  } else if (html instanceof ArrayBuffer) {
    html = Buffer.from(html);
  }

  if (Buffer.isBuffer(html)) {
    encoding = sniffHTMLEncoding(html, {
      defaultEncoding: mimeType.isXML() ? "UTF-8" : "windows-1252",
      transportLayerEncodingLabel: mimeType.parameters.get("charset")
    });
    html = whatwgEncoding.decode(html, encoding);
  } else {
    html = String(html);
  }

  return { html, encoding };
}

function resourcesToResourceLoader(resources) {
  if (!resources) {
    return new NoOpResourceLoader();
  }
  if (resources === "usable") {
    return new ResourceLoader();
  }
  if (!(resources instanceof ResourceLoader)) {
    throw new TypeError("resources must be an instance of ResourceLoader");
  }
  return resources;
}

exports.JSDOM = JSDOM;
exports.VirtualConsole = VirtualConsole;
exports.CookieJar = CookieJar;
exports.ResourceLoader = ResourceLoader;
exports.toughCookie = toughCookie;
