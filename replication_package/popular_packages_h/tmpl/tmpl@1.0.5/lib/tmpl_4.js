// A regular expression to match placeholder patterns like {variableName}.
var INTERPOLATE = /{([^{]+?)}/g

// Export a function that takes in a template string and optional data.
module.exports = function(templateString, data) {
  // Define the initial part of the template processing function,
  // starting with an empty array and a print function to push values.
  var templateFunctionBody = 'var __p=[],print=function(){__p.push.apply(__p,arguments);};' +
    // Use "with" to bind provided data (if any) to template execution context
    'with(obj||{}){__p.push(\'' +
    // Perform several replacements to manage escape characters and inject evaluated JavaScript for placeholders within the template.
    templateString.replace(/\\/g, '\\\\')   // Escape backslashes.
                  .replace(/'/g, "\\'")     // Escape single quotes.
                  .replace(INTERPOLATE, function(match, code) {
                    // Replace placeholders with injected code.
                    return "'," + code.replace(/\\'/g, "'") + ",'"
                  })
                  .replace(/\r/g, '\\r')    // Replace carriage returns with \\r.
                  .replace(/\n/g, '\\n')    // Replace new lines with \\n.
                  .replace(/\t/g, '\\t')    // Replace tabs with \\t.
    + "');}return __p.join('');"           // End of the function to join all pieces from the array.
  
  // Create and return a JavaScript function generated from the dynamic code.
  var generatedFunction = new Function('obj', templateFunctionBody)

  // If data is provided, execute the function with the data, otherwise return the function itself.
  return data ? generatedFunction(data) : generatedFunction
}
