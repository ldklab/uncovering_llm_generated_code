markdown
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
class BasicHandlebars {
  constructor() {
    this.helpers = {};
  }

  compile(template) {
    return (context) => this.render(template, context);
  }

  render(template, context) {
    let rendered = template.replace(/\{\{(\w+)\}\}/g, (match, prop) => {
      return this.resolvePath(context, prop);
    });

    rendered = this.applyHelpers(rendered, context);
    return rendered;
  }

  resolvePath(context, prop) {
    return context[prop] ?? '';
  }

  registerHelper(name, fn) {
    this.helpers[name] = fn;
  }

  applyHelpers(template, context) {
    return template.replace(/\{\{#(\w+) (.+?)\}\}(.*?)\{\{\/\1\}\}/gs, (match, helper, args, inner) => {
      if (this.helpers[helper]) {
        return this.helpers[helper](JSON.parse(args), inner, context);
      }
      return match;
    });
  }
}

module.exports = BasicHandlebars;

// test.js
const BasicHandlebars = require('./index');

const source = "<p>Hello, my name is {{name}}. I am from {{hometown}}.</p>";
const data = { name: "Alan", hometown: "Somewhere, TX" };

const handlebars = new BasicHandlebars();
const template = handlebars.compile(source);
const result = template(data);

console.log(result); 
// Expected Output:
// <p>Hello, my name is Alan. I am from Somewhere, TX.</p>