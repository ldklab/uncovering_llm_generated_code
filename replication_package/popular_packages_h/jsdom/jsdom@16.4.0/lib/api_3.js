"use strict";
const path = require("path");
const fs = require("fs").promises;
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
let sharedFragmentDoc = null;

class JSDOM {
  constructor(input, options = {}) {
    const mimeType = new MIMEType(options.contentType || "text/html");
    const { html, encoding } = normalizeHTMLInput(input, mimeType);

    options = processOptions(options, encoding, mimeType);

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
    const doc = idlUtils.implForWrapper(this[windowSymbol]._document);
    if (!doc._parseOptions.sourceCodeLocationInfo) {
      throw new Error("Include node locations option not enabled.");
    }
    return idlUtils.implForWrapper(node).sourceCodeLocation;
  }

  getInternalVMContext() {
    if (!vm.isContext(this[windowSymbol])) {
      throw new TypeError("Script running was not allowed. Use the runScripts option.");
    }
    return this[windowSymbol];
  }

  reconfigure(settings) {
    if (settings.windowTop) {
      this[windowSymbol]._top = settings.windowTop;
    }

    if (settings.url) {
      const doc = idlUtils.implForWrapper(this[windowSymbol]._document);
      const url = new URL(settings.url);
      doc._URL = url;
      doc._origin = url.origin;
    }
  }

  static fragment(string = "") {
    if (!sharedFragmentDoc) {
      sharedFragmentDoc = (new JSDOM()).window.document;
    }
    const template = sharedFragmentDoc.createElement("template");
    template.innerHTML = string;
    return template.content;
  }

  static fromURL(url, options = {}) {
    return Promise.resolve().then(async () => {
      const parsedURL = new URL(url);
      const originalHash = parsedURL.hash;
      parsedURL.hash = "";
      url = parsedURL.href;

      options = processURLResourceOptions(options);

      const resourceLoader = determineResourceLoader(options.resources);
      const fetchReq = resourceLoader.fetch(url, {
        accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        cookieJar: options.cookieJar,
        referrer: options.referrer
      });

      const body = await fetchReq;
      const res = fetchReq.response;

      options = {
        ...options,
        url: fetchReq.href + originalHash,
        contentType: res.headers["content-type"],
        referrer: fetchReq.getHeader("referer")
      };

      return new JSDOM(body, options);
    });
  }

  static async fromFile(filename, options = {}) {
    options = processFileOptions(filename, options);
    const buffer = await fs.readFile(filename);
    return new JSDOM(buffer, options);
  }
}

function processURLResourceOptions(options) {
  if (options.url || options.contentType) {
    throw new TypeError("Invalid options for fromURL method.");
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

function processFileOptions(filename, options) {
  const normalized = { ...options };
  if (!normalized.contentType) {
    const ext = path.extname(filename);
    normalized.contentType = (ext === ".xhtml" || ext === ".xht" || ext === ".xml") ? "application/xhtml+xml" : "text/html";
  }
  if (!normalized.url) {
    normalized.url = new URL("file:" + path.resolve(filename));
  }
  return normalized;
}

function processOptions(options, encoding, mimeType) {
  const defaultOptions = {
    windowOptions: {
      url: "about:blank",
      referrer: "",
      contentType: "text/html",
      parsingMode: "html",
      parseOptions: {
        sourceCodeLocationInfo: false,
        scriptingEnabled: false
      },
      encoding,
      pretendToBeVisual: false,
      storageQuota: 5000000
    },
    beforeParse() {}
  };

  if (!mimeType.isHTML() && !mimeType.isXML()) {
    throw new RangeError(`Unsupported content type: "${options.contentType}"`);
  }

  const windowOpts = defaultOptions.windowOptions;
  windowOpts.contentType = mimeType.essence;
  windowOpts.parsingMode = mimeType.isHTML() ? "html" : "xml";

  if (options.url) windowOpts.url = new URL(options.url).href;
  if (options.referrer) windowOpts.referrer = new URL(options.referrer).href;
  if (options.includeNodeLocations && windowOpts.parsingMode === "xml") {
    throw new TypeError("Node locations can't be included in XML.");
  }

  windowOpts.cookieJar = options.cookieJar || new CookieJar();
  windowOpts.virtualConsole = options.virtualConsole || new VirtualConsole().sendTo(console);

  if (!(windowOpts.virtualConsole instanceof VirtualConsole)) {
    throw new TypeError("Invalid virtualConsole instance.");
  }

  windowOpts.resourceLoader = determineResourceLoader(options.resources);
  if (options.runScripts) {
    windowOpts.runScripts = String(options.runScripts);
    if (windowOpts.runScripts === "dangerously") {
      windowOpts.parseOptions.scriptingEnabled = true;
    } else if (windowOpts.runScripts !== "outside-only") {
      throw new RangeError("Invalid runScripts option.");
    }
  }

  if (options.beforeParse) Object.assign(defaultOptions, { beforeParse: options.beforeParse });
  if (options.pretendToBeVisual !== undefined) windowOpts.pretendToBeVisual = Boolean(options.pretendToBeVisual);
  if (options.storageQuota !== undefined) windowOpts.storageQuota = Number(options.storageQuota);

  return defaultOptions;
}

function normalizeHTMLInput(html = "", mimeType) {
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

function determineResourceLoader(resources) {
  if (!resources) return new NoOpResourceLoader();
  if (resources === "usable") return new ResourceLoader();
  if (!(resources instanceof ResourceLoader)) {
    throw new TypeError("Invalid resource loader instance.");
  }
  return resources;
}

exports.JSDOM = JSDOM;
exports.VirtualConsole = VirtualConsole;
exports.CookieJar = CookieJar;
exports.ResourceLoader = ResourceLoader;
exports.toughCookie = toughCookie;
