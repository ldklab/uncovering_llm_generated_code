// index.js
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

// Basic usage example
const dom = new JSDOM(`<!DOCTYPE html><p>Hello world</p>`);
console.log(dom.window.document.querySelector("p").textContent); // Outputs: "Hello world"

// Customizing jsdom
const customizedDom = new JSDOM(`<!DOCTYPE html><p>Hello world</p>`, {
  url: "https://example.org/",
  referrer: "https://example.com/",
  contentType: "text/html",
  includeNodeLocations: true,
  storageQuota: 10000000
});

console.log(customizedDom.window.location.href); // Outputs: "https://example.org/"
console.log(customizedDom.window.document.referrer); // Outputs: "https://example.com/"

// Script execution example with "dangerously"
const scriptedDom = new JSDOM(`<body>
  <div id="content"></div>
  <script>document.getElementById("content").append(document.createElement("hr"));</script>
</body>`, { runScripts: "dangerously" });

console.log(scriptedDom.window.document.getElementById("content").children.length); // Outputs: 1

// Pretending to be a visual browser
const visualDom = new JSDOM(``, { pretendToBeVisual: true });
visualDom.window.requestAnimationFrame(timestamp => {
  console.log(timestamp > 0); // Outputs: true
});

// Example for subresource loading with custom resource loader
const resourceLoader = new jsdom.ResourceLoader({
  proxy: "http://127.0.0.1:9001",
  strictSSL: false,
  userAgent: "Mozilla/5.0"
});

const resourceDom = new JSDOM(`<!DOCTYPE html><img src="foo.jpg">`, { resources: resourceLoader });
console.log(resourceDom.window.document.querySelector("img").src); // Outputs: the resolved src attribute of the image
