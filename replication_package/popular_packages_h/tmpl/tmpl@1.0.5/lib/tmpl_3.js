// Regular expression to find template placeholders within curly braces
var INTERPOLATE = /{([^{]+?)}/g

// Export a module function that takes a string and data object
module.exports = function(str, data) {
  // Template string for building a function that processes the template
  var tmpl = 'var __p=[],print=function(){__p.push.apply(__p,arguments);};' +
    'with(obj||{}){__p.push(\'' +
    str.replace(/\\/g, '\\\\')  // Escape backslashes
       .replace(/'/g, "\\'")    // Escape single quotes
       .replace(INTERPOLATE, function(match, code) {  // Replace {key} with expression
         return "'," + code.replace(/\\'/g, "'") + ",'"
       })
       .replace(/\r/g, '\\r')   // Escape carriage returns
       .replace(/\n/g, '\\n')   // Escape new lines
       .replace(/\t/g, '\\t')   // Escape tabs
       + "');}return __p.join('');"
  
  // Create a new function from the template string
  var func = new Function('obj', tmpl)
  
  // If data given, execute the function with data, otherwise return the function
  return data ? func(data) : func
}
