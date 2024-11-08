"use strict";
const path = require("path");
const fs = require("fs").promises;
const vm = require("vm");
const { CookieJar: ToughCookieJar } = require("tough-cookie");
const sniffHTMLEncoding = require("html-encoding-sniffer");
const { parseURL, serializeURLOrigin } = require("whatwg-url");
const { decode } = require("whatwg-encoding");
const { URL } = require("whatwg-url");
const MIMEType = require("whatwg-mimetype");
const utils = require("./jsdom/living/generated/utils.js");
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

const windowSymbol = Symbol("window");
let sharedFragmentDoc = null;

class JSDOM {
  constructor(input, options = {}) {
    const mimeType = new MIMEType(options.contentType || "text/html");
    const { html, encoding } = processHTML(input, mimeType);
    options = prepareOptions(options, encoding, mimeType);

    this[windowSymbol] = createWindow(options.windowOptions);
    const documentImpl = utils.implForWrapper(this[windowSymbol]._document);

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
    return utils.implForWrapper(this[windowSymbol]._document)._cookieJar;
  }

  serialize() {
    return fragmentSerialization(utils.implForWrapper(this[windowSymbol]._document), { requireWellFormed: false });
  }

  nodeLocation(node) {
    if (!utils.implForWrapper(this[windowSymbol]._document)._parseOptions.sourceCodeLocationInfo) {
      throw new Error("Location information was not saved for this jsdom. Use includeNodeLocations during creation.");
    }
    return utils.implForWrapper(node).sourceCodeLocation;
  }

  getInternalVMContext() {
    if (!vm.isContext(this[windowSymbol])) {
      throw new TypeError("This jsdom was not configured to allow script running. Use the runScripts option during creation.");
    }
    return this[windowSymbol];
  }

  reconfigure(settings) {
    if (settings.windowTop) {
      this[windowSymbol]._top = settings.windowTop;
    }
    if (settings.url) {
      const document = utils.implForWrapper(this[windowSymbol]._document);
      const url = parseURL(settings.url);
      if (!url) throw new TypeError(`Could not parse "${settings.url}" as a URL`);
      document._URL = url;
      document._origin = serializeURLOrigin(document._URL);
    }
  }

  static fragment(str = "") {
    if (!sharedFragmentDoc) {
      sharedFragmentDoc = (new JSDOM()).window.document;
    }
    const template = sharedFragmentDoc.createElement("template");
    template.innerHTML = str;
    return template.content;
  }

  static fromURL(url, options = {}) {
    return Promise.resolve().then(() => {
      const parsedURL = new URL(url);
      const originalHash = parsedURL.hash;
      parsedURL.hash = "";
      url = parsedURL.href;

      options = validateURLOptions(options);

      const resourceLoader = toResourceLoader(options.resources);
      const loaderForRequest = resourceLoader instanceof NoOpResourceLoader ? new ResourceLoader() : resourceLoader;

      const request = loaderForRequest.fetch(url, {
        accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        cookieJar: options.cookieJar,
        referrer: options.referrer
      });

      return request.then(body => {
        const res = request.response;
        options = {
          ...options,
          url: request.href + originalHash,
          contentType: res.headers["content-type"],
          referrer: request.getHeader("referer")
        };
        return new JSDOM(body, options);
      });
    });
  }

  static async fromFile(filename, options = {}) {
    options = validateFileOptions(filename, options);
    const buffer = await fs.readFile(filename);
    return new JSDOM(buffer, options);
  }
}

function validateURLOptions(options) {
  if (options.url) throw new TypeError("Cannot supply a url option when using fromURL");
  if (options.contentType) throw new TypeError("Cannot supply a contentType option when using fromURL");

  const normalized = { ...options };

  if (options.referrer) {
    normalized.referrer = (new URL(options.referrer)).href;
  }
  if (!options.cookieJar) {
    normalized.cookieJar = new CookieJar();
  }

  return normalized;
}

function validateFileOptions(filename, options) {
  const normalized = { ...options };

  if (!normalized.contentType) {
    const ext = path.extname(filename);
    if ([".xhtml", ".xht", ".xml"].includes(ext)) {
      normalized.contentType = "application/xhtml+xml";
    }
  }
  if (!normalized.url) {
    normalized.url = new URL("file:" + path.resolve(filename));
  }

  return normalized;
}

function prepareOptions(options, encoding, mimeType) {
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
    beforeParse: () => {}
  };

  if (!mimeType.isHTML() && !mimeType.isXML()) {
    throw new RangeError(`The given content type of "${options.contentType}" was not a HTML or XML content type`);
  }

  transformed.windowOptions.contentType = mimeType.essence;
  transformed.windowOptions.parsingMode = mimeType.isHTML() ? "html" : "xml";

  if (options.url) {
    transformed.windowOptions.url = (new URL(options.url)).href;
  }
  if (options.referrer) {
    transformed.windowOptions.referrer = (new URL(options.referrer)).href;
  }

  if (options.includeNodeLocations) {
    if (transformed.windowOptions.parsingMode === "xml") {
      throw new TypeError("Cannot set includeNodeLocations to true with an XML content type");
    }
    transformed.windowOptions.parseOptions.sourceCodeLocationInfo = true;
  }
  
  transformed.windowOptions.cookieJar = options.cookieJar || new CookieJar();
  transformed.windowOptions.virtualConsole = options.virtualConsole || new VirtualConsole().sendTo(console);

  if (!(transformed.windowOptions.virtualConsole instanceof VirtualConsole)) {
    throw new TypeError("virtualConsole must be an instance of VirtualConsole");
  }

  transformed.windowOptions.resourceLoader = toResourceLoader(options.resources);

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

function processHTML(html = "", mimeType) {
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

function toResourceLoader(resources) {
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
