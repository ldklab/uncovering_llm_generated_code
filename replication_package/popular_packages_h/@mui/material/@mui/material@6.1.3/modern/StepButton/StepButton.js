'use client';

import * as React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import composeClasses from '@mui/utils/composeClasses';
import { styled } from "../zero-styled/index.js";
import { useDefaultProps } from "../DefaultPropsProvider/index.js";
import ButtonBase from "../ButtonBase/index.js";
import StepLabel from "../StepLabel/index.js";
import isMuiElement from "../utils/isMuiElement.js";
import StepperContext from "../Stepper/StepperContext.js";
import StepContext from "../Step/StepContext.js";
import stepButtonClasses, { getStepButtonUtilityClass } from "./stepButtonClasses.js";
import { jsx as _jsx } from "react/jsx-runtime";
const useUtilityClasses = ownerState => {
  const {
    classes,
    orientation
  } = ownerState;
  const slots = {
    root: ['root', orientation],
    touchRipple: ['touchRipple']
  };
  return composeClasses(slots, getStepButtonUtilityClass, classes);
};
const StepButtonRoot = styled(ButtonBase, {
  name: 'MuiStepButton',
  slot: 'Root',
  overridesResolver: (props, styles) => {
    const {
      ownerState
    } = props;
    return [{
      [`& .${stepButtonClasses.touchRipple}`]: styles.touchRipple
    }, styles.root, styles[ownerState.orientation]];
  }
})({
  width: '100%',
  padding: '24px 16px',
  margin: '-24px -16px',
  boxSizing: 'content-box',
  [`& .${stepButtonClasses.touchRipple}`]: {
    color: 'rgba(0, 0, 0, 0.3)'
  },
  variants: [{
    props: {
      orientation: 'vertical'
    },
    style: {
      justifyContent: 'flex-start',
      padding: '8px',
      margin: '-8px'
    }
  }]
});
const StepButton = /*#__PURE__*/React.forwardRef(function StepButton(inProps, ref) {
  const props = useDefaultProps({
    props: inProps,
    name: 'MuiStepButton'
  });
  const {
    children,
    className,
    icon,
    optional,
    ...other
  } = props;
  const {
    disabled,
    active
  } = React.useContext(StepContext);
  const {
    orientation
  } = React.useContext(StepperContext);
  const ownerState = {
    ...props,
    orientation
  };
  const classes = useUtilityClasses(ownerState);
  const childProps = {
    icon,
    optional
  };
  const child = isMuiElement(children, ['StepLabel']) ? (/*#__PURE__*/React.cloneElement(children, childProps)) : /*#__PURE__*/_jsx(StepLabel, {
    ...childProps,
    children: children
  });
  return /*#__PURE__*/_jsx(StepButtonRoot, {
    focusRipple: true,
    disabled: disabled,
    TouchRippleProps: {
      className: classes.touchRipple
    },
    className: clsx(classes.root, className),
    ref: ref,
    ownerState: ownerState,
    "aria-current": active ? 'step' : undefined,
    ...other,
    children: child
  });
});
process.env.NODE_ENV !== "production" ? StepButton.propTypes /* remove-proptypes */ = {
  // ┌────────────────────────────── Warning ──────────────────────────────┐
  // │ These PropTypes are generated from the TypeScript type definitions. │
  // │    To update them, edit the d.ts file and run `pnpm proptypes`.     │
  // └─────────────────────────────────────────────────────────────────────┘
  /**
   * Can be a `StepLabel` or a node to place inside `StepLabel` as children.
   */
  children: PropTypes.node,
  /**
   * Override or extend the styles applied to the component.
   */
  classes: PropTypes.object,
  /**
   * @ignore
   */
  className: PropTypes.string,
  /**
   * The icon displayed by the step label.
   */
  icon: PropTypes.node,
  /**
   * The optional node to display.
   */
  optional: PropTypes.node,
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool])), PropTypes.func, PropTypes.object])
} : void 0;
export default StepButton;