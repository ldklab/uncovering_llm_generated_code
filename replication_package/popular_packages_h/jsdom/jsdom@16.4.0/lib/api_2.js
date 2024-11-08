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
let sharedFragmentDocument = null;

class JSDOM {
  constructor(input, options = {}) {
    const mimeType = new MIMEType(options.contentType || "text/html");
    const { html, encoding } = JSDOM.normalizeHTML(input, mimeType);
    options = JSDOM.transformOptions(options, encoding, mimeType);
    
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
      throw new Error("Location information was not saved. Use includeNodeLocations during creation.");
    }
    return idlUtils.implForWrapper(node).sourceCodeLocation;
  }
  
  getInternalVMContext() {
    if (!vm.isContext(this[windowSymbol])) {
      throw new TypeError("This jsdom was not configured to allow script running. Use the runScripts option.");
    }
    return this[windowSymbol];
  }
  
  reconfigure(settings) {
    if (settings.windowTop) {
      this[windowSymbol]._top = settings.windowTop;
    }
    
    if (settings.url) {
      const document = idlUtils.implForWrapper(this[windowSymbol]._document);
      const url = new URL(settings.url);
      document._URL = url;
      document._origin = url.origin;
    }
  }
  
  static fragment(string = "") {
    if (!sharedFragmentDocument) sharedFragmentDocument = (new JSDOM()).window.document;
    const template = sharedFragmentDocument.createElement("template");
    template.innerHTML = string;
    return template.content;
  }
  
  static fromURL(url, options = {}) {
    return Promise.resolve()
      .then(() => {
        const parsedURL = new URL(url);
        const originalHash = parsedURL.hash;
        parsedURL.hash = "";
        url = parsedURL.href;
        
        options = JSDOM.normalizeFromURLOptions(options);
        
        const resourceLoader = JSDOM.resourcesToResourceLoader(options.resources);
        const loader = resourceLoader instanceof NoOpResourceLoader ? new ResourceLoader() : resourceLoader;
        
        const req = loader.fetch(url, {
          accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          cookieJar: options.cookieJar,
          referrer: options.referrer
        });
        
        return req.then(body => {
          const res = req.response;
          options = {
            ...options,
            url: req.href + originalHash,
            contentType: res.headers["content-type"],
            referrer: req.getHeader("referer")
          };
          return new JSDOM(body, options);
        });
      });
  }
  
  static async fromFile(filename, options = {}) {
    options = JSDOM.normalizeFromFileOptions(filename, options);
    const buffer = await fs.readFile(filename);
    return new JSDOM(buffer, options);
  }
  
  static normalizeFromURLOptions(options) {
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
  
  static normalizeFromFileOptions(filename, options) {
    const normalized = { ...options };
    if (!normalized.contentType) {
      const extname = path.extname(filename);
      if ([".xhtml", ".xht", ".xml"].includes(extname)) {
        normalized.contentType = "application/xhtml+xml";
      }
    }
    
    if (!normalized.url) {
      normalized.url = new URL("file:" + path.resolve(filename));
    }
    return normalized;
  }
  
  static transformOptions(options, encoding, mimeType) {
    const transformed = {
      windowOptions: {
        url: "about:blank",
        referrer: "",
        contentType: mimeType.essence,
        parsingMode: mimeType.isHTML() ? "html" : "xml",
        parseOptions: { sourceCodeLocationInfo: false, scriptingEnabled: false },
        runScripts: undefined,
        encoding,
        pretendToBeVisual: false,
        storageQuota: 5000000
      },
      beforeParse() {}
    };
    
    if (!mimeType.isHTML() && !mimeType.isXML()) {
      throw new RangeError(`Invalid content type: "${options.contentType}"`);
    }
    
    if (options.url !== undefined) {
      transformed.windowOptions.url = new URL(options.url).href;
    }
    
    if (options.referrer !== undefined) {
      transformed.windowOptions.referrer = new URL(options.referrer).href;
    }
    
    if (options.includeNodeLocations) {
      if (transformed.windowOptions.parsingMode === "xml") {
        throw new TypeError("Cannot set includeNodeLocations with an XML content type");
      }
      transformed.windowOptions.parseOptions.sourceCodeLocationInfo = true;
    }
    
    transformed.windowOptions.cookieJar = options.cookieJar || new CookieJar();
    transformed.windowOptions.virtualConsole = options.virtualConsole || new VirtualConsole().sendTo(console);
    
    if (!(transformed.windowOptions.virtualConsole instanceof VirtualConsole)) {
      throw new TypeError("virtualConsole must be a VirtualConsole instance");
    }
    
    transformed.windowOptions.resourceLoader = JSDOM.resourcesToResourceLoader(options.resources);
    
    if (options.runScripts !== undefined) {
      transformed.windowOptions.runScripts = String(options.runScripts);
      if (transformed.windowOptions.runScripts === "dangerously") {
        transformed.windowOptions.parseOptions.scriptingEnabled = true;
      } else if (transformed.windowOptions.runScripts !== "outside-only") {
        throw new RangeError(`runScripts must be "dangerously" or "outside-only"`);
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
  
  static normalizeHTML(html = "", mimeType) {
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
  
  static resourcesToResourceLoader(resources) {
    if (resources === undefined) return new NoOpResourceLoader();
    if (resources === "usable") return new ResourceLoader();
    if (!(resources instanceof ResourceLoader)) {
      throw new TypeError("resources must be a ResourceLoader instance");
    }
    return resources;
  }
}

exports.JSDOM = JSDOM;
exports.VirtualConsole = VirtualConsole;
exports.CookieJar = CookieJar;
exports.ResourceLoader = ResourceLoader;
exports.toughCookie = toughCookie;
