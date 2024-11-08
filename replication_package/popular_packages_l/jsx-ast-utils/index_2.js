// utils.js

// Check if a prop exists on a JSX element
function hasProp(attributes, propName, options = { ignoreCase: true }) {
  return attributes.some(attr => {
    if (attr.type !== 'JSXAttribute') return false;
    const name = attr.name.name;
    return options.ignoreCase ? name.toLowerCase() === propName.toLowerCase() : name === propName;
  });
}

// Check if any of the props from a list exist on a JSX element
function hasAnyProp(attributes, propNames, options = { ignoreCase: true }) {
  return propNames.some(propName => hasProp(attributes, propName, options));
}

// Check if every prop from a list exists on a JSX element
function hasEveryProp(attributes, propNames, options = { ignoreCase: true }) {
  return propNames.every(propName => hasProp(attributes, propName, options));
}

// Get a specific prop as a JSXAttribute object if it exists
function getProp(attributes, propName, options = { ignoreCase: true }) {
  return attributes.find(attr => {
    if (attr.type !== 'JSXAttribute') return false;
    const name = attr.name.name;
    return options.ignoreCase ? name.toLowerCase() === propName.toLowerCase() : name === propName;
  });
}

// Return the tag name of a JSX element
function elementType(node) {
  return node.openingElement.name.name;
}

// Return the value of a specific prop
function getPropValue(prop) {
  if (!prop || !prop.value) return undefined;
  return prop.value.expression ? prop.value.expression.value : prop.value.value;
}

// Return the literal value of a prop if available
function getLiteralPropValue(prop) {
  if (!prop || !prop.value) return undefined;
  const { type, value, expression } = prop.value;
  if (type === 'Literal') return value;
  if (type === 'JSXExpressionContainer' && expression.type === 'Literal') return expression.value;
  return undefined;
}

// Retrieve the name of a prop
function propName(prop) {
  return prop.name ? prop.name.name : undefined;
}

// List of common JSX event handler names
const eventHandlers = [
  'onCopy', 'onCut', 'onPaste', 'onCompositionEnd', 'onCompositionStart', 'onCompositionUpdate',
  'onKeyDown', 'onKeyPress', 'onKeyUp', 'onFocus', 'onBlur', 'onChange', 'onInput', 'onSubmit',
  'onClick', 'onContextMenu', 'onDblClick', 'onDoubleClick', 'onDrag', 'onDragEnd', 'onDragEnter',
  'onDragExit', 'onDragLeave', 'onDragOver', 'onDragStart', 'onDrop', 'onMouseDown', 'onMouseEnter',
  'onMouseLeave', 'onMouseMove', 'onMouseOut', 'onMouseOver', 'onMouseUp', 'onSelect', 'onTouchCancel',
  'onTouchEnd', 'onTouchMove', 'onTouchStart', 'onScroll', 'onWheel', 'onAbort', 'onCanPlay',
  'onCanPlayThrough', 'onDurationChange', 'onEmptied', 'onEncrypted', 'onEnded', 'onError',
  'onLoadedData', 'onLoadedMetadata', 'onLoadStart', 'onPause', 'onPlay', 'onPlaying',
  'onProgress', 'onRateChange', 'onSeeked', 'onSeeking', 'onStalled', 'onSuspend', 'onTimeUpdate',
  'onVolumeChange', 'onWaiting', 'onLoad', 'onError', 'onAnimationStart', 'onAnimationEnd',
  'onAnimationIteration', 'onTransitionEnd'
];

const eventHandlersByType = {
  clipboard: ['onCopy', 'onCut', 'onPaste'],
  composition: ['onCompositionEnd', 'onCompositionStart', 'onCompositionUpdate'],
  keyboard: ['onKeyDown', 'onKeyPress', 'onKeyUp'],
  focus: ['onFocus', 'onBlur'],
  form: ['onChange', 'onInput', 'onSubmit'],
  mouse: [
    'onClick', 'onContextMenu', 'onDblClick', 'onDoubleClick', 'onDrag', 'onDragEnd', 'onDragEnter',
    'onDragExit', 'onDragLeave', 'onDragOver', 'onDragStart', 'onDrop', 'onMouseDown', 'onMouseEnter',
    'onMouseLeave', 'onMouseMove', 'onMouseOut', 'onMouseOver', 'onMouseUp'
  ],
  selection: ['onSelect'],
  touch: ['onTouchCancel', 'onTouchEnd', 'onTouchMove', 'onTouchStart'],
  ui: ['onScroll'],
  wheel: ['onWheel'],
  media: [
    'onAbort', 'onCanPlay', 'onCanPlayThrough', 'onDurationChange', 'onEmptied', 'onEncrypted',
    'onEnded', 'onError', 'onLoadedData', 'onLoadedMetadata', 'onLoadStart', 'onPause', 'onPlay',
    'onPlaying', 'onProgress', 'onRateChange', 'onSeeked', 'onSeeking', 'onStalled', 'onSuspend',
    'onTimeUpdate', 'onVolumeChange', 'onWaiting'
  ],
  image: ['onLoad', 'onError'],
  animation: ['onAnimationStart', 'onAnimationEnd', 'onAnimationIteration'],
  transition: ['onTransitionEnd'],
};

module.exports = {
  hasProp,
  hasAnyProp,
  hasEveryProp,
  getProp,
  elementType,
  getPropValue,
  getLiteralPropValue,
  propName,
  eventHandlers,
  eventHandlersByType
};
