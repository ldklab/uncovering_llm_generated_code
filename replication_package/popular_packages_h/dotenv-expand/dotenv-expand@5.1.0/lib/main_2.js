'use strict'

const dotenvExpand = function (config) {
  // Determines the base environment object based on the config setting
  const environment = config.ignoreProcessEnv ? {} : process.env

  // Handles interpolation of variables within the environment variables
  const interpolate = (envValue) => {
    const matches = envValue.match(/(.?\${?(?:[a-zA-Z0-9_]+)?}?)/g) || []

    return matches.reduce((newEnv, match) => {
      const parts = /(.?)\${?([a-zA-Z0-9_]+)?}?/g.exec(match)
      const prefix = parts[1]

      let value, replacePart

      if (prefix === '\\') {
        // If the match is escaped with a backslash
        replacePart = parts[0]
        value = replacePart.replace('\\$', '$')
      } else {
        // Retrieve the variable's actual value
        const key = parts[2]
        replacePart = parts[0].substring(prefix.length)

        // Choose the value from process.env or use the parsed value from the config
        value = environment.hasOwnProperty(key) ? environment[key] : (config.parsed[key] || '')

        // Recursively interpolate to handle nested variables
        value = interpolate(value)
      }

      // Replace the variable with its value
      return newEnv.replace(replacePart, value)
    }, envValue)
  }

  // Iterate through the parsed environmental variables and replace any placeholders
  for (const configKey in config.parsed) {
    const value = environment.hasOwnProperty(configKey) ? environment[configKey] : config.parsed[configKey]
    config.parsed[configKey] = interpolate(value)
  }

  // Update the environment object with the expanded variables
  for (const processKey in config.parsed) {
    environment[processKey] = config.parsed[processKey]
  }

  // Return the updated configuration
  return config
}

module.exports = dotenvExpand
