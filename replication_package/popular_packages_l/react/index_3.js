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
  let _val = initialValue;
  function state() {
    return _val;
  }
  function setState(newVal) {
    _val = newVal;
    // In a real app this would trigger re-render
  }
  return [state, setState];
}

export function createElement(type, props, ...children) {
  return { type, props: props || {}, children };
}

// react-dom.js
export function createRoot(container) {
  return {
    render(element) {
      container.innerHTML = '';
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

  for (const [name, value] of Object.entries(props)) {
    if (name.startsWith('on') && name.toLowerCase() in window) {
      const eventType = name.toLowerCase().substring(2);
      domElement.addEventListener(eventType, value);
    } else {
      domElement.setAttribute(name, value);
    }
  }

  for (const child of children) {
    domElement.appendChild(renderElement(child));
  }

  return domElement;
}
