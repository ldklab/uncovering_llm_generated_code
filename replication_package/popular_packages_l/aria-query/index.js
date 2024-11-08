markdown
// package.json
{
  "name": "aria-query",
  "version": "1.0.0",
  "description": "Programmatic access to the WAI-ARIA 1.2 Roles Model",
  "main": "index.js",
  "scripts": {
    "build": "node ./scripts/breakUpAriaJSON.js"
  },
  "author": "A11yance",
  "license": "MIT",
  "dependencies": {}
}

// src/etc/roles.json (Simplified)
{
  "alert": {
    "requiredProps": {},
    "props": {
      "aria-live": "assertive"
    },
    "abstract": false,
    "childrenPresentational": false,
    "baseConcepts": [],
    "relatedConcepts": [{"module": "XForms", "concept": {"name": "alert"}}],
    "superClass": [["roletype", "structure", "section"]]
  }
  // Additional roles can be added here as needed
}

// scripts/breakUpAriaJSON.js
const fs = require('fs');
const path = require('path');

const roles = require('./roles.json');

fs.writeFileSync(
  path.join(__dirname, '../src/etc/roles.js'),
  `module.exports = ${JSON.stringify(roles, null, 2)};`
);
console.log('Generated roles.js from roles.json');

// index.js
const rolesData = require('./src/etc/roles');

class MapLike {
  constructor(data) {
    this.data = data;
  }

  entries() {
    return Object.entries(this.data);
  }

  get(key) {
    return this.data[key] || null;
  }

  has(key) {
    return this.data.hasOwnProperty(key);
  }

  keys() {
    return Object.keys(this.data);
  }

  values() {
    return Object.values(this.data);
  }
}

const roles = new MapLike(rolesData);

// Example usage
console.log(roles.get('alert'));

module.exports = {
  roles
};

// src/etc/elementsRoles.js and roleElements.js would contain similar data structures and logic.
