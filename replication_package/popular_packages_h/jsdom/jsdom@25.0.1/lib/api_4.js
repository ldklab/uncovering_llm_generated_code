"use strict";
const path = require("path");
const { promises: fs } = require("fs");
const vm = require("vm");
const toughCookie = require("tough-cookie");
const sniffHTMLEncoding = require("html-encoding-sniffer");
const { URL } = require("whatwg-url");
const { decode } = require("whatwg-encoding");
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

const window = Symbol("window");
let sharedFragmentDocument = null;

class JSDOM {
  constructor(input = "", options = {}) {
    const mimeType = new MIMEType(options.contentType || "text/html");
    const { html, encoding } = normalizeHTML(input, mimeType);

    options = transformOptions(options, encoding, mimeType);
    this[window] = createWindow(options.windowOptions);
    const documentImpl = idlUtils.implForWrapper(this[window]._document);
    
    options.beforeParse(this[window]._globalProxy);
    parseIntoDocument(html, documentImpl);
    documentImpl.close();
  }

  get window() {
    return this[window]._globalProxy;
  }

  get virtualConsole() {
    return this[window]._virtualConsole;
  }

  get cookieJar() {
    return idlUtils.implForWrapper(this[window]._document)._cookieJar;
  }

  serialize() {
    return fragmentSerialization(idlUtils.implForWrapper(this[window]._document), { requireWellFormed: false });
  }

  nodeLocation(node) {
    const docImpl = idlUtils.implForWrapper(this[window]._document);
    if (!docImpl._parseOptions.sourceCodeLocationInfo) {
      throw new Error("Location info not available. Set includeNodeLocations.");
    }
    return idlUtils.implForWrapper(node).sourceCodeLocation;
  }

  getInternalVMContext() {
    if (!vm.isContext(this[window])) {
      throw new TypeError("Script running not enabled. Use runScripts option.");
    }
    return this[window];
  }

  reconfigure(settings) {
    if ("windowTop" in settings) this[window]._top = settings.windowTop;
    if ("url" in settings) {
      const document = idlUtils.implForWrapper(this[window]._document);
      const url = new URL(settings.url);
      document._URL = url;
      document._origin = document._URL.origin;
      this[window]._sessionHistory.currentEntry.url = url;
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
    return Promise.resolve().then(async () => {
      const parsedURL = new URL(url);
      const originalHash = parsedURL.hash;
      parsedURL.hash = "";
      url = parsedURL.href;

      options = normalizeFromURLOptions(options);
      const resourceLoader = resourcesToResourceLoader(options.resources);
      const loaderForInitialRequest = resourceLoader instanceof NoOpResourceLoader ?
                                       new ResourceLoader() : resourceLoader;

      const req = loaderForInitialRequest.fetch(url, {
        accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        cookieJar: options.cookieJar,
        referrer: options.referrer
      });

      const body = await req;
      const res = req.response;
      
      const newOptions = {
        ...options,
        url: req.href + originalHash,
        contentType: res.headers.get("content-type"),
        referrer: req.getHeader("referer") || undefined
      };
      
      return new JSDOM(body, newOptions);
    });
  }

  static async fromFile(filename, options = {}) {
    const normalizedOptions = normalizeFromFileOptions(filename, options);
    const buffer = await fs.readFile(filename);
    return new JSDOM(buffer, normalizedOptions);
  }
}

function normalizeFromURLOptions(options) {
  if (options.url !== undefined) {
    throw new TypeError("Cannot supply a url option when using fromURL");
  }
  if (options.contentType !== undefined) {
    throw new TypeError("Cannot supply a contentType option when using fromURL");
  }

  const normalized = { ...options };

  if (options.referrer !== undefined) {
    normalized.referrer = new URL(options.referrer).href;
  }

  normalized.cookieJar = options.cookieJar || new CookieJar();
  return normalized;
}

function normalizeFromFileOptions(filename, options) {
  const normalized = { ...options };

  if (normalized.contentType === undefined) {
    const extname = path.extname(filename).toLowerCase();
    if (extname === ".xhtml" || extname === ".xht" || extname === ".xml") {
      normalized.contentType = "application/xhtml+xml";
    }
  }

  if (normalized.url === undefined) {
    normalized.url = new URL("file:" + path.resolve(filename)).href;
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
      parseOptions: { sourceCodeLocationInfo: false, scriptingEnabled: false },
      runScripts: undefined,
      encoding,
      pretendToBeVisual: false,
      storageQuota: 5000000,
      resourceLoader: undefined,
      virtualConsole: undefined,
      cookieJar: undefined
    },
    beforeParse() { }
  };

  if (!mimeType.isHTML() && !mimeType.isXML()) {
    throw new RangeError(`Invalid content type "${options.contentType}"`);
  }

  transformed.windowOptions.contentType = mimeType.essence;
  transformed.windowOptions.parsingMode = mimeType.isHTML() ? "html" : "xml";

  if (options.url !== undefined) {
    transformed.windowOptions.url = new URL(options.url).href;
  }

  if (options.referrer !== undefined) {
    transformed.windowOptions.referrer = new URL(options.referrer).href;
  }

  if (options.includeNodeLocations) {
    if (transformed.windowOptions.parsingMode === "xml") {
      throw new TypeError("Cannot include node locations with XML content type");
    }
    transformed.windowOptions.parseOptions = { sourceCodeLocationInfo: true };
  }

  transformed.windowOptions.cookieJar = options.cookieJar || new CookieJar();
  transformed.windowOptions.virtualConsole = options.virtualConsole || new VirtualConsole().sendTo(console);

  if (!(transformed.windowOptions.virtualConsole instanceof VirtualConsole)) {
    throw new TypeError("virtualConsole must be a VirtualConsole instance");
  }

  transformed.windowOptions.resourceLoader = resourcesToResourceLoader(options.resources);

  if (options.runScripts !== undefined) {
    transformed.windowOptions.runScripts = String(options.runScripts);
    if (transformed.windowOptions.runScripts === "dangerously") {
      transformed.windowOptions.parseOptions.scriptingEnabled = true;
    } else if (transformed.windowOptions.runScripts !== "outside-only") {
      throw new RangeError(`runScripts must be undefined, "dangerously", or "outside-only"`);
    }
  }

  if (options.beforeParse !== undefined) {
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
    html = decode(html, encoding);
  } else {
    html = String(html);
  }

  return { html, encoding };
}

function resourcesToResourceLoader(resources) {
  if (resources === undefined) {
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
