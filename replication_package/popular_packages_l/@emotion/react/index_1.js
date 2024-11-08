// This code provides a simplified implementation of CSS-in-JS for React applications without external libraries.
// It mimics functionalities like emotion's `css`, `Global`, and `ClassNames`.

import React from 'react';
import ReactDOM from 'react-dom/client';

// Function to generate a random class name and inject styles into the document's first stylesheet
const css = (styles) => {
  const className = `jsx-${Math.random().toString(36).substr(2, 5)}`;
  const styleStr = typeof styles === 'string'
    ? styles
    : Object.entries(styles).map(([key, value]) => `${key}: ${value};`).join(' ');

  const styleSheet = document.styleSheets[0];
  if (styleSheet) {
    styleSheet.insertRule(`.${className} { ${styleStr} }`, styleSheet.cssRules.length);
  }

  return className;
};

// Component to apply global styles via a <style> tag in the document head
const Global = ({ styles }) => {
  React.useEffect(() => {
    const styleTag = document.createElement('style');
    document.head.appendChild(styleTag);
    const styleSheet = styleTag.sheet;

    const globalStyles = Object.entries(styles)
      .map(([selector, styleObj]) =>
        `${selector} { ${Object.entries(styleObj).map(([key, value]) => `${key}: ${value};`).join(' ')} }`
      )
      .join(' ');

    styleSheet.insertRule(globalStyles, styleSheet.cssRules.length);

    return () => {
      document.head.removeChild(styleTag);
    };
  }, [styles]);

  return null;
};

// Component to allow child components to easily construct class names with `css` and `cx`
const ClassNames = ({ children }) => {
  const cx = (...args) => args.filter(Boolean).join(' ');

  return children({ css, cx });
};

// JSX pragma compatible function for handling JSX elements and props, particularly `css`
const jsx = (type, props, ...children) => {
  if (props && props.css) {
    const className = css(props.css);
    return React.createElement(type, { ...props, className: props.className ? `${props.className} ${className}` : className }, ...children);
  }

  return React.createElement(type, props, ...children);
};

// Main render function using the above implementations
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <div css={{ color: 'hotpink' }}>
    <div css={css`color: green;`} />
    <Global styles={{ body: { margin: 0, padding: 0 } }} />
    <ClassNames>
      {({ css, cx }) => (
        <div className={cx(
          'some-class',
          css`color: yellow;`
        )} />
      )}
    </ClassNames>
  </div>
);
