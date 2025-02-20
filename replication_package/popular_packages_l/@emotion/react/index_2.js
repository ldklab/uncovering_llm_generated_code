jsx
// This code provides a basic implementation of CSS-in-JS styling functionalities using React.

// Import necessary React libraries
import React from 'react';
import ReactDOM from 'react-dom';

// Function to generate and apply CSS styles dynamically
const css = (styles) => {
  const styleSheet = document.styleSheets[0];
  const className = `jsx-${Math.random().toString(36).substr(2, 5)}`;

  const stylesStr = typeof styles === 'string' ? styles : 
    Object.keys(styles).map(key => `${key}: ${styles[key]};`).join('');

  styleSheet.insertRule(`.${className} { ${stylesStr} }`, styleSheet.cssRules.length);

  return className;
};

// Component to apply global CSS styles 
const Global = ({ styles }) => {
  React.useEffect(() => {
    const styleTag = document.createElement('style');
    document.head.appendChild(styleTag);
    const styleSheet = styleTag.sheet;

    const stylesStr = Object.keys(styles)
      .map(selector => 
        `${selector} { ${Object.keys(styles[selector]).map(key => `${key}: ${styles[selector][key]};`).join(' ')} }`
      ).join(' ');

    styleSheet.insertRule(stylesStr, styleSheet.cssRules.length);

    // Cleanup the style element from the document head after component unmount
    return () => {
      document.head.removeChild(styleTag);
    };
  }, [styles]);

  return null;
};

// Component to handle class composition and other styling utilities
const ClassNames = ({ children }) => {
  const cx = (...args) => {
    return args.filter(Boolean).join(' ');
  };

  return children({ css, cx });
};

// JSX function to extend React.createElement for CSS integration
const jsx = (type, props, ...children) => {
  if (props && props.css) {
    const className = css(props.css);
    return React.createElement(
      type, 
      { ...props, className: props.className ? `${props.className} ${className}` : className }, 
      ...children
    );
  }
  return React.createElement(type, props, ...children);
};

// Example usage of the extended JSX with styles
ReactDOM.render(
  <div css={{ color: 'hotpink' }}>
    <div css={css`color: green;`} />
    <Global styles={{ body: { margin: 0, padding: 0 } }} />
    <ClassNames>
      {({ css, cx }) => (
        <div className={cx('some-class', css`color: yellow;`)} />
      )}
    </ClassNames>
  </div>,
  document.getElementById('root')
);
