module.exports = normalize;

const fixer = require("./fixer");
normalize.fixer = fixer;

const makeWarning = require("./make_warning");

const fieldsToFix = [
  "name", "version", "description", "repository", "modules", "scripts",
  "files", "bin", "man", "bugs", "keywords", "readme", "homepage", "license"
];
const otherThingsToFix = ["dependencies", "people", "typos"];

const thingsToFix = fieldsToFix.map((fieldName) => {
  return ucFirst(fieldName) + "Field";
}).concat(otherThingsToFix);

function normalize(data, warn, strict) {
  if (warn === true) {
    warn = null;
    strict = true;
  }
  strict = strict || false;
  warn = (!warn || data.private) ? (msg) => {} : warn;

  if (
    data.scripts &&
    data.scripts.install === "node-gyp rebuild" &&
    !data.scripts.preinstall
  ) {
    data.gypfile = true;
  }

  fixer.warn = function() {
    warn(makeWarning.apply(null, arguments));
  };

  thingsToFix.forEach((thingName) => {
    fixer["fix" + ucFirst(thingName)](data, strict);
  });

  data._id = `${data.name}@${data.version}`;
}

function ucFirst(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
