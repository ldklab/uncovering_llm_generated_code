// package.json
{
  "name": "basic-handlebars",
  "version": "1.0.0",
  "description": "A basic implementation of Handlebars-like templating engine.",
  "main": "index.js",
  "dependencies": {},
  "devDependencies": {},
  "scripts": {
    "test": "node test.js"
  },
  "author": "Your Name",
  "license": "MIT"
}

// index.js
class BasicTemplateEngine {
  constructor() {
    this.helpers = {};
  }

  compile(template) {
    return (context) => this.renderTemplate(template, context);
  }

  renderTemplate(template, context) {
    return template.replace(/\{\{(\w+)\}\}/g, (_, prop) => this.resolveProperty(context, prop));
  }

  resolveProperty(context, prop) {
    return context[prop] ?? '';
  }

  registerHelper(name, fn) {
    this.helpers[name] = fn;
  }

  applyHelpers(template, context) {
    return template.replace(/\{\{#(\w+) (.+?)\}\}(.*?)\{\{\/\1\}\}/gs, (_, helper, args, content) => {
      return this.helpers[helper] ? this.helpers[helper](JSON.parse(args), content, context) : _;
    });
  }
}

module.exports = BasicTemplateEngine;

// test.js
const BasicTemplateEngine = require('./index');

const templateSource = "<p>Hello, my name is {{name}}. I am from {{hometown}}.</p>";
const contextData = { name: "Alan", hometown: "Somewhere, TX" };

const engine = new BasicTemplateEngine();
const compiledTemplate = engine.compile(templateSource);
const output = compiledTemplate(contextData);

console.log(output); 
// Expected Output:
// <p>Hello, my name is Alan. I am from Somewhere, TX.</p>
