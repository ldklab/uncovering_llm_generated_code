// utils.js

// Utility function to determine if a property exists in a JSX element's properties list
function hasProp(props, prop, options = { ignoreCase: true }) {
  const compare = options.ignoreCase
    ? name => name.toLowerCase() === prop.toLowerCase()
    : name => name === prop;

  return props.some(attribute => 
    attribute.type === 'JSXAttribute' && compare(attribute.name.name));
}

// Check if any from a list of props exist on a JSX element
function hasAnyProp(props, propList, options) {
  return propList.some(prop => hasProp(props, prop, options));
}

// Check if all given props exist on a JSX element
function hasEveryProp(props, propList, options) {
  return propList.every(prop => hasProp(props, prop, options));
}

// Retrieve a specific prop object, if it exists
function getProp(props, prop, options = { ignoreCase: true }) {
  return props.find(attribute => 
    attribute.type === 'JSXAttribute' && (
      options.ignoreCase
        ? attribute.name.name.toLowerCase() === prop.toLowerCase()
        : attribute.name.name === prop
    ));
}

// Get the type of a JSX element, i.e., the tag name
function elementType(node) {
  return node.openingElement.name.name;
}

// Get the actual value of a prop, supporting expression containers
function getPropValue(prop) {
  return prop?.value?.expression ? prop.value.expression.value : prop?.value?.value;
}

// Get the literal value of a prop, if applicable
function getLiteralPropValue(prop) {
  if (!prop || !prop.value) return undefined;
  if (prop.value.type === 'Literal') return prop.value.value;
  if (prop.value.type === 'JSXExpressionContainer' && prop.value.expression.type === 'Literal') {
    return prop.value.expression.value;
  }
  return undefined;
}

// Extract and return the name of the prop
function propName(prop) {
  return prop?.name?.name;
}

// Predefined list of common JSX event handler names
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

// Categorize event handlers by type for organized access
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
