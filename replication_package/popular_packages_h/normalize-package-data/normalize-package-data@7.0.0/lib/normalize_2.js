module.exports = normalize;

var fixer = require('./fixer');
normalize.fixer = fixer;

var makeWarning = require('./make_warning');

var fieldsToFix = ['name', 'version', 'description', 'repository', 'modules', 'scripts',
  'files', 'bin', 'man', 'bugs', 'keywords', 'readme', 'homepage', 'license'];

var otherThingsToFix = ['dependencies', 'people', 'typos'];

var thingsToFix = fieldsToFix.map(fieldName => ucFirst(fieldName) + 'Field')
  .concat(otherThingsToFix);

function normalize(data, warn, strict) {
  if (warn === true) {
    warn = null;
    strict = true;
  }
  if (!strict) {
    strict = false;
  }
  if (!warn || data.private) {
    warn = () => { /* noop */ };
  }

  if (data.scripts &&
      data.scripts.install === 'node-gyp rebuild' &&
      !data.scripts.preinstall) {
    data.gypfile = true;
  }

  fixer.warn = (...args) => {
    warn(makeWarning(...args));
  };

  thingsToFix.forEach(thingName => {
    fixer['fix' + ucFirst(thingName)](data, strict);
  });

  data._id = data.name + '@' + data.version;
}

function ucFirst(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
