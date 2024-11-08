"use strict";

module.exports = (() => {
  const rulesPath = './rules/';
  const ruleNames = [
    'accessible-emoji',
    'alt-text',
    'anchor-has-content',
    'anchor-is-valid',
    'aria-activedescendant-has-tabindex',
    'aria-props',
    'aria-proptypes',
    'aria-role',
    'aria-unsupported-elements',
    'autocomplete-valid',
    'click-events-have-key-events',
    'control-has-associated-label',
    'heading-has-content',
    'html-has-lang',
    'iframe-has-title',
    'img-redundant-alt',
    'interactive-supports-focus',
    'label-has-associated-control',
    'label-has-for',
    'lang',
    'media-has-caption',
    'mouse-events-have-key-events',
    'no-access-key',
    'no-autofocus',
    'no-distracting-elements',
    'no-interactive-element-to-noninteractive-role',
    'no-noninteractive-element-interactions',
    'no-noninteractive-element-to-interactive-role',
    'no-noninteractive-tabindex',
    'no-onchange',
    'no-redundant-roles',
    'no-static-element-interactions',
    'role-has-required-aria-props',
    'role-supports-aria-props',
    'scope',
    'tabindex-no-positive'
  ];

  const rules = Object.fromEntries(
    ruleNames.map(name => [name, require(`${rulesPath}${name}`)])
  );

  const createConfig = (type, interactiveExtensions = {}) => ({
    plugins: ['jsx-a11y'],
    parserOptions: { ecmaFeatures: { jsx: true } },
    rules: {
      ...Object.fromEntries(ruleNames.map(name => [`jsx-a11y/${name}`, 'error'])),
      'jsx-a11y/control-has-associated-label': ['off', {
        ignoreElements: ['audio', 'canvas', 'embed', 'input', 'textarea', 'tr', 'video'],
        ignoreRoles: ['grid', 'listbox', 'menu', 'menubar', 'radiogroup', 'row', 'tablist', 'toolbar', 'tree', 'treegrid'],
        includeRoles: ['alert', 'dialog']
      }],
      'jsx-a11y/interactive-supports-focus': ['error', { 
        tabbable: ['button', 'checkbox', 'link', 'searchbox', 'spinbutton', 'switch', 'textbox', ...interactiveExtensions.tabbable || []]
      }],
      'jsx-a11y/no-interactive-element-to-noninteractive-role': ['error', { tr: ['none', 'presentation'] }],
      'jsx-a11y/no-noninteractive-element-interactions': ['error', { 
        handlers: ['onClick', 'onError', 'onLoad', 'onMouseDown', 'onMouseUp', 'onKeyPress', 'onKeyDown', 'onKeyUp', ...interactiveExtensions.handlers || []],
        alert: ['onKeyUp', 'onKeyDown', 'onKeyPress'],
        body: ['onError', 'onLoad'],
        dialog: ['onKeyUp', 'onKeyDown', 'onKeyPress'],
        iframe: ['onError', 'onLoad'],
        img: ['onError', 'onLoad']
      }],
      'jsx-a11y/no-noninteractive-element-to-interactive-role': ['error', { 
        ...interactiveExtensions.interactiveRoles || {},
        ul: ['listbox', 'menu', 'menubar', 'radiogroup', 'tablist', 'tree', 'treegrid'],
        ol: ['listbox', 'menu', 'menubar', 'radiogroup', 'tablist', 'tree', 'treegrid'],
        li: ['menuitem', 'option', 'row', 'tab', 'treeitem'],
        table: ['grid'],
        td: ['gridcell']
      }],
      'jsx-a11y/no-noninteractive-tabindex': ['error', { 
        tags: [],
        roles: ['tabpanel'],
        allowExpressionValues: true
      }],
      ...interactiveExtensions.extraRules || {}
    }
  });

  return {
    rules,
    configs: {
      recommended: createConfig('recommended'),
      strict: createConfig('strict', {
        tabbable: ['progressbar', 'slider'],
        extraRules: { 'jsx-a11y/label-has-for': 'error' }
      })
    }
  };
})();
