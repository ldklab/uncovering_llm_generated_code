const jsdom = require("jsdom");
const { JSDOM } = jsdom;

// Basic JSDOM Initialization
const dom = new JSDOM(`<!DOCTYPE html><p>Hello world</p>`);
console.log(dom.window.document.querySelector("p").textContent); // "Hello world"

// JSDOM with Custom Configuration
const customizedDom = new JSDOM(`<!DOCTYPE html><p>Hello world</p>`, {
  url: "https://example.org/",
  referrer: "https://example.com/",
  contentType: "text/html",
  includeNodeLocations: true,
  storageQuota: 10000000
});
console.log(customizedDom.window.location.href); // "https://example.org/"
console.log(customizedDom.window.document.referrer); // "https://example.com/"

// Execute Scripts inside JSDOM
const scriptedDom = new JSDOM(`<body>
  <div id="content"></div>
  <script>document.getElementById("content").appendChild(document.createElement("hr"));</script>
</body>`, { runScripts: "dangerously" });
console.log(scriptedDom.window.document.getElementById("content").children.length); // 1

// Simulate Visual Browser with JSDOM
const visualDom = new JSDOM(``, { pretendToBeVisual: true });
visualDom.window.requestAnimationFrame(timestamp => {
  console.log(timestamp > 0); // true
});

// Custom Resource Loader in JSDOM
const resourceLoader = new jsdom.ResourceLoader({
  proxy: "http://127.0.0.1:9001",
  strictSSL: false,
  userAgent: "Mozilla/5.0"
});
const resourceDom = new JSDOM(`<!DOCTYPE html><img src="foo.jpg">`, { resources: resourceLoader });
console.log(resourceDom.window.document.querySelector("img").src); 
