const fixer = require("./fixer");
const makeWarning = require("./make_warning");

const fieldsToFix = ['name', 'version', 'description', 'repository', 'modules', 
                     'scripts', 'files', 'bin', 'man', 'bugs', 'keywords', 
                     'readme', 'homepage', 'license'];
const otherThingsToFix = ['dependencies', 'people', 'typos'];

const thingsToFix = fieldsToFix.map(field => ucFirst(field) + "Field")
                               .concat(otherThingsToFix);

function normalize(data, warn, strict) {
  if (warn === true) {
    warn = null;
    strict = true;
  }
  strict = strict || false;
  if (!warn || data.private) {
    warn = function() {};
  }

  if (data.scripts &&
      data.scripts.install === "node-gyp rebuild" &&
      !data.scripts.preinstall) {
    data.gypfile = true;
  }

  fixer.warn = function() {
    warn(makeWarning.apply(null, arguments));
  };
  
  thingsToFix.forEach(thingName => {
    const fixMethodName = "fix" + ucFirst(thingName);
    if (typeof fixer[fixMethodName] === 'function') {
      fixer[fixMethodName](data, strict);
    }
  });

  data._id = `${data.name}@${data.version}`;
}

function ucFirst(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

module.exports = normalize;
normalize.fixer = fixer;
