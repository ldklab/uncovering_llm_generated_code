// index.js
import { createElement, useState } from './react';
import { createRoot } from './react-dom';

function Counter() {
  const [count, setCount] = useState(0);
  return createElement(
    'div',
    null,
    createElement('h1', null, count),
    createElement(
      'button',
      {
        onClick: () => setCount(count + 1)
      },
      'Increment'
    )
  );
}

function App() {
  return createElement(Counter, null);
}

const rootNode = document.getElementById('root');
const root = createRoot(rootNode);

root.render(createElement(App, null));

// react.js
export function useState(initialValue) {
  let _val = initialValue; // hold state in function closure
  function state() {
    // state function prototype
    return _val;
  }
  function setState(newVal) {
    // setState function prototype
    _val = newVal;
    // re-render the component
  }
  return [state, setState];
}

export function createElement(type, props, ...children) {
  // Structure the virtual DOM element
  return { type, props: props || {}, children };
}

// react-dom.js
export function createRoot(container) {
  return {
    render(element) {
      container.innerHTML = ''; // Clear container for fresh render
      const renderedElement = renderElement(element);
      container.appendChild(renderedElement);
    },
  };
}

function renderElement(node) {
  if (typeof node === 'string' || typeof node === 'number') {
    return document.createTextNode(node);
  }

  const { type, props, children } = node;

  if (typeof type === 'function') {
    return renderElement(type(props));
  }

  const domElement = document.createElement(type);

  for (let [name, value] of Object.entries(props)) {
    if (name.startsWith('on') && name.toLowerCase() in window) {
      domElement.addEventListener(name.toLowerCase().substr(2), value);
    } else {
      domElement.setAttribute(name, value);
    }
  }

  for (let child of children) {
    domElement.appendChild(renderElement(child));
  }

  return domElement;
}
