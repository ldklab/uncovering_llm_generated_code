const fixer = require("./fixer");
const makeWarning = require("./make_warning");

function normalize(data, warn, strict) {
  warn = warn === true ? null : warn;
  strict = typeof strict === 'undefined' ? false : strict;
  if (!warn || data.private) warn = () => {};

  if (data.scripts?.install === "node-gyp rebuild" && !data.scripts.preinstall) {
    data.gypfile = true;
  }

  fixer.warn = (...args) => warn(makeWarning(...args));

  const fieldsToFix = [
    'name', 'version', 'description', 'repository', 'modules', 'scripts',
    'files', 'bin', 'man', 'bugs', 'keywords', 'readme', 'homepage', 'license'
  ];

  const otherThingsToFix = ['dependencies', 'people', 'typos'];

  const thingsToFix = [
    ...fieldsToFix.map(fieldName => `${ucFirst(fieldName)}Field`),
    ...otherThingsToFix
  ];

  thingsToFix.forEach(thingName => {
    fixer[`fix${ucFirst(thingName)}`](data, strict);
  });

  data._id = `${data.name}@${data.version}`;
}

function ucFirst(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

normalize.fixer = fixer;

module.exports = normalize;
