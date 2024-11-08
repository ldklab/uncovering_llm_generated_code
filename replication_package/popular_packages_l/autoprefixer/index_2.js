const postcss = require('postcss');

// Define a custom PostCSS plugin named 'autoprefixer'
const autoprefixer = postcss.plugin('autoprefixer', (opts = {}) => {
  // Extract browser options from the opts object
  const browsers = opts.browsers || [];
  
  // The main function processes CSS and adds prefixes
  return (root) => {
    root.walkRules(rule => {
      // Iterate over each declaration in the rule
      rule.walkDecls(decl => {
        // Add placeholder prefixing logic for 'color' property with '::placeholder' selector
        if (decl.prop === 'color' && rule.selector.includes('::placeholder')) {
          rule.cloneBefore({ selector: '::-moz-placeholder' });
        }
      });
      
      // Add prefixing logic for media queries with 'min-resolution'
      if (rule.parent && rule.parent.type === 'atrule' && /min-resolution/.test(rule.parent.params)) {
        rule.parent.cloneBefore({ params: rule.parent.params.replace('(min-resolution', '(-webkit-min-device-pixel-ratio') });
      }
    });
  };
});

// Example of input CSS that needs prefixing
const css = `
  ::placeholder {
    color: gray;
  }
  @media (min-resolution: 2dppx) {
    .image {
      background-image: url(image@2x.png);
    }
  }
`;

// Use PostCSS to process the input CSS with the custom autoprefixer plugin
postcss([autoprefixer({ browsers: ['last 2 versions'] })])
  .process(css)
  .then(result => {
    console.log(result.css); // Output the processed CSS
  })
  .catch(error => {
    console.error(error); // Handle any errors that occur during processing
  });

module.exports = autoprefixer; // Export the autoprefixer function
```
