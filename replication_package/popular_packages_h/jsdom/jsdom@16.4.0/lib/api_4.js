"use strict";
const path = require("path");
const fs = require("fs").promises;
const vm = require("vm");
const toughCookie = require("tough-cookie");
const sniffHTMLEncoding = require("html-encoding-sniffer");
const whatwgEncoding = require("whatwg-encoding");
const { URL } = require("whatwg-url");
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
  constructor(input, options = {}) {
    const mimeType = new MIMEType(options.contentType || "text/html");
    const { html, encoding } = this._normalizeHTML(input, mimeType);

    options = this._transformOptions(options, encoding, mimeType);

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
      throw new Error("Location information was not saved for this jsdom. Use includeNodeLocations during creation.");
    }
    return idlUtils.implForWrapper(node).sourceCodeLocation;
  }

  getInternalVMContext() {
    if (!vm.isContext(this[window])) {
      throw new TypeError("This jsdom was not configured to allow script running. Use the runScripts option during creation.");
    }
    return this[window];
  }

  reconfigure(settings) {
    if ("windowTop" in settings) {
      this[window]._top = settings.windowTop;
    }
    if ("url" in settings) {
      const document = idlUtils.implForWrapper(this[window]._document);
      const url = new URL(settings.url);
      document._URL = url;
      document._origin = url.origin;
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

  static async fromURL(url, options = {}) {
    const { normalizedOptions, parsedURL, resourceLoaderForInitialRequest } = JSDOM._prepareFromURL(url, options);

    const response = await resourceLoaderForInitialRequest.fetch(parsedURL.href, {
      accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      cookieJar: normalizedOptions.cookieJar,
      referrer: normalizedOptions.referrer
    });

    const res = response.response;
    const finalOptions = {
      ...normalizedOptions,
      url: response.href + parsedURL.originalHash,
      contentType: res.headers["content-type"],
      referrer: response.getHeader("referer")
    };

    return new JSDOM(response.body, finalOptions);
  }

  static async fromFile(filename, options = {}) {
    options = JSDOM._normalizeFromFileOptions(filename, options);
    const buffer = await fs.readFile(filename);
    return new JSDOM(buffer, options);
  }

  _normalizeHTML(html = "", mimeType) {
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

  _transformOptions(options, encoding, mimeType) {
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
      throw new RangeError(`The given content type of "${options.contentType}" was not a HTML or XML content type`);
    }

    transformed.windowOptions.contentType = mimeType.essence;
    transformed.windowOptions.parsingMode = mimeType.isHTML() ? "html" : "xml";

    if (options.url !== undefined) {
      transformed.windowOptions.url = String(new URL(options.url));
    }

    if (options.referrer !== undefined) {
      transformed.windowOptions.referrer = String(new URL(options.referrer));
    }

    if (options.includeNodeLocations) {
      if (transformed.windowOptions.parsingMode === "xml") {
        throw new TypeError("Cannot set includeNodeLocations to true with an XML content type");
      }
      transformed.windowOptions.parseOptions = { sourceCodeLocationInfo: true };
    }

    transformed.windowOptions.cookieJar = options.cookieJar || new CookieJar();

    transformed.windowOptions.virtualConsole = options.virtualConsole || (new VirtualConsole()).sendTo(console);

    if (!(transformed.windowOptions.virtualConsole instanceof VirtualConsole)) {
      throw new TypeError("virtualConsole must be an instance of VirtualConsole");
    }

    transformed.windowOptions.resourceLoader = JSDOM._resourcesToResourceLoader(options.resources);

    if (options.runScripts !== undefined) {
      transformed.windowOptions.runScripts = options.runScripts;
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

  static _prepareFromURL(url, options = {}) {
    const parsedURL = new URL(url);
    const originalHash = parsedURL.hash;
    parsedURL.hash = "";

    const normalizedOptions = JSDOM._normalizeFromURLOptions(options);
    const resourceLoader = JSDOM._resourcesToResourceLoader(normalizedOptions.resources);
    const resourceLoaderForInitialRequest = resourceLoader instanceof NoOpResourceLoader ?
      new ResourceLoader() : resourceLoader;

    parsedURL.originalHash = originalHash;
    return { normalizedOptions, parsedURL, resourceLoaderForInitialRequest };
  }

  static _normalizeFromURLOptions(options) {
    if (options.url !== undefined || options.contentType !== undefined) {
      throw new TypeError("Cannot supply a url or contentType option when using fromURL");
    }

    const normalized = { ...options, referrer: options.referrer ? String(new URL(options.referrer)) : undefined };
    normalized.cookieJar = options.cookieJar || new CookieJar();

    return normalized;
  }

  static _normalizeFromFileOptions(filename, options) {
    const normalized = { ...options };
    const extname = path.extname(filename);

    if (!normalized.contentType && [".xhtml", ".xht", ".xml"].includes(extname)) {
      normalized.contentType = "application/xhtml+xml";
    }

    if (!normalized.url) {
      normalized.url = String(new URL("file:" + path.resolve(filename)));
    }

    return normalized;
  }

  static _resourcesToResourceLoader(resources) {
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
}

exports.JSDOM = JSDOM;
exports.VirtualConsole = VirtualConsole;
exports.CookieJar = CookieJar;
exports.ResourceLoader = ResourceLoader;
exports.toughCookie = toughCookie;
