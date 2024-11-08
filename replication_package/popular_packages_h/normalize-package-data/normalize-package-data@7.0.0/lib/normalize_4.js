const fixer = require('./fixer')
const makeWarning = require('./make_warning')

const fieldsToFix = ['name', 'version', 'description', 'repository', 'modules', 'scripts',
  'files', 'bin', 'man', 'bugs', 'keywords', 'readme', 'homepage', 'license']
const otherThingsToFix = ['dependencies', 'people', 'typos']

const thingsToFix = [...fieldsToFix.map(fieldName => ucFirst(fieldName) + 'Field'), ...otherThingsToFix]

function normalize(data, warn, strict) {
  if (warn === true) {
    strict = true
    warn = null
  }
  strict = strict || false
  warn = (!warn || data.private) ? () => {} : warn

  if (data.scripts && data.scripts.install === 'node-gyp rebuild' && !data.scripts.preinstall) {
    data.gypfile = true
  }
  
  fixer.warn = (...args) => {
    warn(makeWarning(...args))
  }
  
  thingsToFix.forEach(thingName => {
    const fixMethod = `fix${ucFirst(thingName)}`
    fixer[fixMethod](data, strict)
  })
  
  data._id = `${data.name}@${data.version}`
}

function ucFirst(string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

module.exports = normalize
normalize.fixer = fixer
