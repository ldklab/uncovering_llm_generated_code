"use strict";

// Exporting ESLint configurations for jsx-a11y rules
/* eslint-disable global-require */
module.exports = {
  rules: Object.fromEntries([
    'accessible-emoji', 'alt-text', 'anchor-has-content', 'anchor-is-valid',
    'aria-activedescendant-has-tabindex', 'aria-props', 'aria-proptypes',
    'aria-role', 'aria-unsupported-elements', 'autocomplete-valid',
    'click-events-have-key-events', 'control-has-associated-label', 
    'heading-has-content', 'html-has-lang', 'iframe-has-title', 
    'img-redundant-alt', 'interactive-supports-focus', 
    'label-has-associated-control', 'label-has-for', 'lang', 
    'media-has-caption', 'mouse-events-have-key-events', 'no-access-key', 
    'no-autofocus', 'no-distracting-elements', 
    'no-interactive-element-to-noninteractive-role', 
    'no-noninteractive-element-interactions', 
    'no-noninteractive-element-to-interactive-role', 'no-noninteractive-tabindex', 
    'no-onchange', 'no-redundant-roles', 'no-static-element-interactions', 
    'role-has-required-aria-props', 'role-supports-aria-props', 'scope', 
    'tabindex-no-positive'
  ].map(rule => [rule, require(`./rules/${rule}`)])),

  configs: {
    recommended: {
      plugins: ['jsx-a11y'],
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      },
      rules: {
        'jsx-a11y/accessible-emoji': 'error',
        'jsx-a11y/alt-text': 'error',
        'jsx-a11y/anchor-has-content': 'error',
        'jsx-a11y/anchor-is-valid': 'error',
        'jsx-a11y/aria-activedescendant-has-tabindex': 'error',
        'jsx-a11y/aria-props': 'error',
        'jsx-a11y/aria-proptypes': 'error',
        'jsx-a11y/aria-role': 'error',
        'jsx-a11y/aria-unsupported-elements': 'error',
        'jsx-a11y/autocomplete-valid': 'error',
        'jsx-a11y/click-events-have-key-events': 'error',
        'jsx-a11y/control-has-associated-label': ['off', {
          ignoreElements: ['audio', 'canvas', 'embed', 'input', 'textarea', 'tr', 'video'],
          ignoreRoles: ['grid', 'listbox', 'menu', 'menubar', 'radiogroup', 'row', 'tablist', 'toolbar', 'tree', 'treegrid'],
          includeRoles: ['alert', 'dialog']
        }],
        'jsx-a11y/heading-has-content': 'error',
        'jsx-a11y/html-has-lang': 'error',
        'jsx-a11y/iframe-has-title': 'error',
        'jsx-a11y/img-redundant-alt': 'error',
        'jsx-a11y/interactive-supports-focus': ['error', {
          tabbable: ['button', 'checkbox', 'link', 'searchbox', 'spinbutton', 'switch', 'textbox']
        }],
        'jsx-a11y/label-has-associated-control': 'error',
        'jsx-a11y/label-has-for': 'off',
        'jsx-a11y/media-has-caption': 'error',
        'jsx-a11y/mouse-events-have-key-events': 'error',
        'jsx-a11y/no-access-key': 'error',
        'jsx-a11y/no-autofocus': 'error',
        'jsx-a11y/no-distracting-elements': 'error',
        'jsx-a11y/no-interactive-element-to-noninteractive-role': ['error', {
          tr: ['none', 'presentation']
        }],
        'jsx-a11y/no-noninteractive-element-interactions': ['error', {
          handlers: ['onClick', 'onError', 'onLoad', 'onMouseDown', 'onMouseUp', 'onKeyPress', 'onKeyDown', 'onKeyUp'],
          alert: ['onKeyUp', 'onKeyDown', 'onKeyPress'],
          body: ['onError', 'onLoad'],
          dialog: ['onKeyUp', 'onKeyDown', 'onKeyPress'],
          iframe: ['onError', 'onLoad'],
          img: ['onError', 'onLoad']
        }],
        'jsx-a11y/no-noninteractive-element-to-interactive-role': ['error', {
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
        'jsx-a11y/no-onchange': 'error',
        'jsx-a11y/no-redundant-roles': 'error',
        'jsx-a11y/no-static-element-interactions': ['error', {
          allowExpressionValues: true,
          handlers: ['onClick', 'onMouseDown', 'onMouseUp', 'onKeyPress', 'onKeyDown', 'onKeyUp']
        }],
        'jsx-a11y/role-has-required-aria-props': 'error',
        'jsx-a11y/role-supports-aria-props': 'error',
        'jsx-a11y/scope': 'error',
        'jsx-a11y/tabindex-no-positive': 'error'
      }
    },
    strict: {
      plugins: ['jsx-a11y'],
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      },
      rules: {
        'jsx-a11y/accessible-emoji': 'error',
        'jsx-a11y/alt-text': 'error',
        'jsx-a11y/anchor-has-content': 'error',
        'jsx-a11y/anchor-is-valid': 'error',
        'jsx-a11y/aria-activedescendant-has-tabindex': 'error',
        'jsx-a11y/aria-props': 'error',
        'jsx-a11y/aria-proptypes': 'error',
        'jsx-a11y/aria-role': 'error',
        'jsx-a11y/aria-unsupported-elements': 'error',
        'jsx-a11y/autocomplete-valid': 'error',
        'jsx-a11y/click-events-have-key-events': 'error',
        'jsx-a11y/control-has-associated-label': ['off', {
          ignoreElements: ['audio', 'canvas', 'embed', 'input', 'textarea', 'tr', 'video'],
          ignoreRoles: ['grid', 'listbox', 'menu', 'menubar', 'radiogroup', 'row', 'tablist', 'toolbar', 'tree', 'treegrid'],
          includeRoles: ['alert', 'dialog']
        }],
        'jsx-a11y/heading-has-content': 'error',
        'jsx-a11y/html-has-lang': 'error',
        'jsx-a11y/iframe-has-title': 'error',
        'jsx-a11y/img-redundant-alt': 'error',
        'jsx-a11y/interactive-supports-focus': ['error', {
          tabbable: ['button', 'checkbox', 'link', 'progressbar', 'searchbox', 'slider', 'spinbutton', 'switch', 'textbox']
        }],
        'jsx-a11y/label-has-for': 'error',
        'jsx-a11y/label-has-associated-control': 'error',
        'jsx-a11y/media-has-caption': 'error',
        'jsx-a11y/mouse-events-have-key-events': 'error',
        'jsx-a11y/no-access-key': 'error',
        'jsx-a11y/no-autofocus': 'error',
        'jsx-a11y/no-distracting-elements': 'error',
        'jsx-a11y/no-interactive-element-to-noninteractive-role': 'error',
        'jsx-a11y/no-noninteractive-element-interactions': ['error', {
          body: ['onError', 'onLoad'],
          iframe: ['onError', 'onLoad'],
          img: ['onError', 'onLoad']
        }],
        'jsx-a11y/no-noninteractive-element-to-interactive-role': 'error',
        'jsx-a11y/no-noninteractive-tabindex': 'error',
        'jsx-a11y/no-onchange': 'error',
        'jsx-a11y/no-redundant-roles': 'error',
        'jsx-a11y/no-static-element-interactions': 'error',
        'jsx-a11y/role-has-required-aria-props': 'error',
        'jsx-a11y/role-supports-aria-props': 'error',
        'jsx-a11y/scope': 'error',
        'jsx-a11y/tabindex-no-positive': 'error'
      }
    }
  }
};
