// utils.js
function declarePluginDefinition(plugin) {
  return (babelApi, pluginConfig, pluginDirectory) => {
    if (!babelApi.assertVersion) {
      throw new Error('Babel 7+ is required. Ensure api.assertVersion is available.');
    }
    
    babelApi.assertVersion(7);

    return plugin(babelApi, pluginConfig || {}, pluginDirectory);
  };
}

function validatePluginOptions(options, validationSchema) {
  const validationErrors = [];
  for (const property in validationSchema) {
    if (Object.prototype.hasOwnProperty.call(validationSchema, property)) {
      const validationResult = validationSchema[property](options[property]);
      if (validationResult !== true) {
        validationErrors.push(validationResult);
      }
    }
  }
  
  if (validationErrors.length > 0) {
    throw new Error(`Invalid options detected:\n${validationErrors.join('\n')}`);
  }
}

function createPluginUtilities() {
  return {
    declare: declarePluginDefinition,
    validateOptions: validatePluginOptions,
  };
}

module.exports = createPluginUtilities();
