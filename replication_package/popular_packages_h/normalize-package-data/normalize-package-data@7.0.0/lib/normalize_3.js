module.exports = normalize;

const fixer = require('./fixer');
normalize.fixer = fixer;

const makeWarning = require('./make_warning');

const fieldsToFix = ['name', 'version', 'description', 'repository', 'modules', 'scripts',
  'files', 'bin', 'man', 'bugs', 'keywords', 'readme', 'homepage', 'license'];
const otherThingsToFix = ['dependencies', 'people', 'typos'];

let thingsToFix = fieldsToFix.map(fieldName => `${ucFirst(fieldName)}Field`);
thingsToFix = thingsToFix.concat(otherThingsToFix);

function normalize(data, warn, strict) {
  if (warn === true) {
    warn = null;
    strict = true;
  }
  strict = strict || false;

  if (!warn || data.private) {
    warn = () => {};
  }

  if (data.scripts && data.scripts.install === 'node-gyp rebuild' && !data.scripts.preinstall) {
    data.gypfile = true;
  }

  fixer.warn = (...args) => {
    warn(makeWarning(...args));
  };

  thingsToFix.forEach(thingName => {
    fixer['fix' + ucFirst(thingName)](data, strict);
  });

  data._id = `${data.name}@${data.version}`;
}

function ucFirst(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
