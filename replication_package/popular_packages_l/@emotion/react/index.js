// This code provides a basic implementation of similar functionalities as @emotion/react

/** @jsx jsx */
import React from 'react';
import ReactDOM from 'react-dom';

// Simplified CSS-in-JS styling function
const css = (styles) => {
  const styleSheet = document.styleSheets[0];
  const className = `jsx-${Math.random().toString(36).substr(2, 5)}`;

  let stylesStr = typeof styles === 'string' ? styles : Object.keys(styles).map(key => `${key}: ${styles[key]};`).join('');

  styleSheet.insertRule(`.${className} { ${stylesStr} }`, styleSheet.cssRules.length);

  return className;
};

// Function to apply global styles
const Global = ({ styles }) => {
  React.useEffect(() => {
    const styleTag = document.createElement("style");
    document.head.appendChild(styleTag);

    const styleSheet = styleTag.sheet;
    let stylesStr = Object.keys(styles)
      .map(selector => `${selector} { ${Object.keys(styles[selector]).map(key => `${key}: ${styles[selector][key]};`).join(' ')} }`)
      .join(' ');

    styleSheet.insertRule(stylesStr, styleSheet.cssRules.length);

    return () => {
      document.head.removeChild(styleTag); // Cleanup global styles to prevent duplication
    };
  }, [styles]);

  return null;
};

// Component for applying css and cx functionalities
const ClassNames = ({ children }) => {
  const cx = (...args) => {
    return args.filter(Boolean).join(' ');
  };

  return children({ css, cx });
};

// JSX pragma compatible function
const jsx = (type, props, ...children) => {
  if (props && props.css) {
    const className = css(props.css);
    return React.createElement(type, { ...props, className: props.className ? `${props.className} ${className}` : className }, ...children);
  }
  return React.createElement(type, props, ...children);
};

// Usage demonstration
ReactDOM.render(
  <div css={{ color: 'hotpink' }}>
    <div
      css={css`
        color: green;
      `}
    />
    <Global
      styles={{
        body: {
          margin: 0,
          padding: 0
        }
      }}
    />
    <ClassNames>
      {({ css, cx }) => (
        <div
          className={cx(
            'some-class',
            css`
              color: yellow;
            `
          )}
        />
      )}
    </ClassNames>
  </div>,
  document.getElementById('root')
);
