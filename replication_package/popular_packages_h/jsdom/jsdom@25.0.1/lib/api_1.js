"use strict";
const path = require("path");
const fs = require("fs").promises;
const { CookieJar: ToughCookieJar } = require("tough-cookie");
const { parse: parseURL, serializeURLOrigin } = require("whatwg-url");
const { decode: decodeEncoding } = require("whatwg-encoding");
const sniffHTMLEncoding = require("html-encoding-sniffer");
const { URL } = require("whatwg-url");
const MIMEType = require("whatwg-mimetype");

const idlUtils = require("./jsdom/living/generated/utils.js");
const VirtualConsole = require("./jsdom/virtual-console.js");
const { createWindow } = require("./jsdom/browser/Window.js");
const { parseIntoDocument } = require("./jsdom/browser/parser");
const { fragmentSerialization } = require("./jsdom/living/domparsing/serialization.js");
const ResourceLoader = require("./jsdom/browser/resources/resource-loader.js");
const NoOpResourceLoader = require("./jsdom/browser/resources/no-op-resource-loader.js");

class CookieJar extends ToughCookieJar {
  constructor(store, options) {
    super(store, { looseMode: true, ...options });
  }
}

class JSDOM {
  constructor(input = "", options = {}) {
    const mimeType = new MIMEType(options.contentType ?? "text/html");
    const { html, encoding } = normalizeHTML(input, mimeType);

    options = transformOptions(options, encoding, mimeType);
    this._window = createWindow(options.windowOptions);

    const documentImpl = idlUtils.implForWrapper(this._window._document);
    options.beforeParse(this._window._globalProxy);
    parseIntoDocument(html, documentImpl);
    documentImpl.close();
  }

  get window() {
    return this._window._globalProxy;
  }

  get virtualConsole() {
    return this._window._virtualConsole;
  }

  get cookieJar() {
    return idlUtils.implForWrapper(this._window._document)._cookieJar;
  }

  serialize() {
    return fragmentSerialization(idlUtils.implForWrapper(this._window._document), { requireWellFormed: false });
  }

  nodeLocation(node) {
    if (!idlUtils.implForWrapper(this._window._document)._parseOptions.sourceCodeLocationInfo) {
      throw new Error("Location information not saved. Enable includeNodeLocations during creation.");
    }
    return idlUtils.implForWrapper(node).sourceCodeLocation;
  }

  getInternalVMContext() {
    if (!vm.isContext(this._window)) {
      throw new TypeError("Script running not configured. Use the runScripts option.");
    }
    return this._window;
  }

  reconfigure(settings) {
    if ("windowTop" in settings) {
      this._window._top = settings.windowTop;
    }
    if ("url" in settings) {
      const document = idlUtils.implForWrapper(this._window._document);
      const url = parseURL(settings.url);
      if (!url) throw new TypeError(`Could not parse "${settings.url}" as a URL`);
      document._URL = url;
      document._origin = serializeURLOrigin(document._URL);
      this._window._sessionHistory.currentEntry.url = url;
    }
  }

  static fragment(string = "") {
    if (!sharedFragmentDocument) {
      sharedFragmentDocument = new JSDOM().window.document;
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
      url = parsedURL.href;

      options = normalizeFromURLOptions(options);
      const resourceLoader = resourcesToResourceLoader(options.resources);
      const resourceLoaderForInitialRequest = resourceLoader.constructor === NoOpResourceLoader
        ? new ResourceLoader()
        : resourceLoader;

      const req = resourceLoaderForInitialRequest.fetch(url, {
        accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        cookieJar: options.cookieJar,
        referrer: options.referrer
      });

      return req.then(body => {
        const res = req.response;
        options = { ...options, url: req.href + originalHash, contentType: res.headers["content-type"], referrer: req.getHeader("referer") ?? undefined };
        return new JSDOM(body, options);
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
  if (options.cookieJar === undefined) {
    normalized.cookieJar = new CookieJar();
  }
  return normalized;
}

function normalizeFromFileOptions(filename, options) {
  const normalized = { ...options };
  if (normalized.contentType === undefined) {
    const extname = path.extname(filename);
    if ([".xhtml", ".xht", ".xml"].includes(extname)) {
      normalized.contentType = "application/xhtml+xml";
    }
  }
  if (normalized.url === undefined) {
    normalized.url = new URL("file:" + path.resolve(filename));
  }
  return normalized;
}

function transformOptions(options, encoding, mimeType) {
  const defaults = {
    windowOptions: {
      url: "about:blank",
      referrer: "",
      contentType: "text/html",
      parsingMode: "html",
      parseOptions: { sourceCodeLocationInfo: false, scriptingEnabled: false },
      encoding,
      pretendToBeVisual: false,
      storageQuota: 5000000,
    },
    beforeParse() {},
  };

  const transformed = { ...defaults };

  if (!mimeType.isHTML() && !mimeType.isXML()) {
    throw new RangeError(`The content type "${options.contentType}" is not HTML or XML`);
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
      throw new TypeError("Cannot set includeNodeLocations to true with an XML content type");
    }
    transformed.windowOptions.parseOptions.sourceCodeLocationInfo = true;
  }
  transformed.windowOptions.cookieJar = options.cookieJar ?? new CookieJar();
  transformed.windowOptions.virtualConsole = options.virtualConsole ?? new VirtualConsole().sendTo(console);

  if (!(transformed.windowOptions.virtualConsole instanceof VirtualConsole)) {
    throw new TypeError("virtualConsole must be an instance of VirtualConsole");
  }

  transformed.windowOptions.resourceLoader = resourcesToResourceLoader(options.resources);

  if (options.runScripts !== undefined) {
    const runScripts = String(options.runScripts);
    if (runScripts === "dangerously") {
      transformed.windowOptions.parseOptions.scriptingEnabled = true;
    } else if (runScripts !== "outside-only") {
      throw new RangeError(`runScripts must be undefined, "dangerously", or "outside-only"`);
    }
    transformed.windowOptions.runScripts = runScripts;
  }

  transformed.windowOptions.pretendToBeVisual = Boolean(options.pretendToBeVisual);
  transformed.windowOptions.storageQuota = Number(options.storageQuota);

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
      transportLayerEncodingLabel: mimeType.parameters.get("charset"),
    });
    html = decodeEncoding(html, encoding);
  } else {
    html = String(html);
  }

  return { html, encoding };
}

function resourcesToResourceLoader(resources) {
  switch (resources) {
    case undefined:
      return new NoOpResourceLoader();
    case "usable":
      return new ResourceLoader();
    default:
      if (!(resources instanceof ResourceLoader)) {
        throw new TypeError("resources must be an instance of ResourceLoader");
      }
      return resources;
  }
}

exports.JSDOM = JSDOM;
exports.VirtualConsole = VirtualConsole;
exports.CookieJar = CookieJar;
exports.ResourceLoader = ResourceLoader;
exports.toughCookie = toughCookie;
