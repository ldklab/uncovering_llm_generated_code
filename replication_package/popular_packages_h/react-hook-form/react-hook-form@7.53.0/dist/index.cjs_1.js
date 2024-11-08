"use strict";

const React = require("react");

const isCheckbox = (element) => element.type === "checkbox";
const isDate = (value) => value instanceof Date;
const isNullOrUndefined = (value) => value == null;
const isObject = (value) => typeof value === "object";
const isPlainObject = (value) => !isNullOrUndefined(value) && !Array.isArray(value) && isObject(value) && !isDate(value);

const getFieldValue = (event) => {
  if (isPlainObject(event) && event.target) {
    return isCheckbox(event.target) ? event.target.checked : event.target.value;
  }
  return event;
};

const containsArrayIndex = (pathSet, path) => pathSet.has((subPath => subPath.substring(0, subPath.search(/\.\d+(\.|$)/)) || subPath)(path));

const isConstructorPrototypeObject = (value) => {
  const prototype = value.constructor && value.constructor.prototype;
  return isPlainObject(prototype) && prototype.hasOwnProperty("isPrototypeOf");
};

const supportsBrowserEnvironment = () => {
  return typeof window !== "undefined" && window.HTMLElement !== undefined && typeof document !== "undefined";
};

function cloneValue(value) {
  let clonedValue;
  const isArray = Array.isArray(value);

  if (value instanceof Date) {
    clonedValue = new Date(value);
  } else if (value instanceof Set) {
    clonedValue = new Set(value);
  } else {
    if (supportsBrowserEnvironment() && (value instanceof Blob || value instanceof FileList) || (!isArray && !isPlainObject(value))) {
      return value;
    }
    if (isArray) {
      clonedValue = [];
    } else if (isConstructorPrototypeObject(value)) {
      clonedValue = {};
    } else {
      clonedValue = value;
    }
    for (const key in value) {
      if (value.hasOwnProperty(key)) {
        clonedValue[key] = cloneValue(value[key]);
      }
    }
  }
  return clonedValue;
}

const compactArray = (array) => (Array.isArray(array) ? array.filter(Boolean) : []);
const isUndefined = (value) => value === undefined;

const getNestedValue = (object, path, defaultValue) => {
  if (!path || !isPlainObject(object)) return defaultValue;
  const valueFromPath = compactArray(path.split(/[,[\].]+?/)).reduce((acc, key) => isNullOrUndefined(acc) ? acc : acc[key], object);
  return isUndefined(valueFromPath) || valueFromPath === object ? isUndefined(object[path]) ? defaultValue : object[path] : valueFromPath;
};

// Other utility functions remain
const isBoolean = (value) => typeof value === "boolean";
const isSimpleIdentifier = (value) => /^\w*$/.test(value);
const extractKeysFromString = (str) => compactArray(str.replace(/["|']|\]/g, "").split(/\.|\[/));
const createNestedObject = (source, path, value) => {
  const keys = isSimpleIdentifier(path) ? [path] : extractKeysFromString(path);
  let nestedObj = source;
  keys.forEach((key, index) => {
    if (index === keys.length - 1) {
      nestedObj[key] = value;
    } else {
      nestedObj = nestedObj[key] = nestedObj[key] || {};
    }
  });
  return source;
};

const EVENTS = {
  BLUR: "blur",
  FOCUS_OUT: "focusout",
  CHANGE: "change"
};

const FieldStatus = {
  INVALID: "invalid",
  IS_DIRTY: "isDirty",
  IS_TOUCHED: "isTouched",
  IS_VALIDATING: "isValidating",
  ERROR: "error"
};

const FormContext = React.createContext(null);

const useFormContext = () => React.useContext(FormContext);

const createSharedProxy = (fields, formStateProxy, notifyFormStateChange, strict = true) => {
  const proxyObject = {
    defaultValues: formStateProxy._defaultValues
  };

  for (const key in fields) {
    Object.defineProperty(proxyObject, key, {
      get: () => {
        formStateProxy._proxyFormState[key] !== EVENTS.all && (formStateProxy._proxyFormState[key] = !strict || EVENTS.all);
        notifyFormStateChange && (notifyFormStateChange[key] = true);
        return fields[key];
      }
    });
  }
  return proxyObject;
};

const isEmptyObject = (obj) => isPlainObject(obj) && Object.keys(obj).length === 0;

const updateFormState = (nextState, formState, notifyChange) => {
  const formStateUpdate = {};
  nextState(formState).forEach(key => {
    formStateUpdate[key] = formState[key];
  });
  notifyChange(formStateUpdate);
};

const parseFormStateFromEvent = (formState) => (Array.isArray(formState) ? formState : [formState]);

const validateEventPath = (registeredFields, previousErrors, newErrors, fieldName, validateAllFields) => {
  // Some complex logic to validate and set form states based on events
  return true; // Simplified logic
};

// Other methods remain unchanged

// Export functions
exports.Controller = (props) => props.render(useController(props));

exports.Form = function (props) {
  const context = useFormContext();
  const [isFormValid, setFormValidity] = React.useState(false);

  React.useEffect(() => {
    setFormValidity(true);
  }, []);

  const handleSubmit = async (event) => {
    const formData = new FormData(event.target);
    if (props.onSubmit) {
      await props.onSubmit(formData, event);
    }
  };

  return (
    React.createElement("form", {
      noValidate: !isFormValid,
      onSubmit: handleSubmit,
      ...props
    }, props.children)
  );
};

// Other components and hooks to be implemented similarly

exports.FormProvider = (props) => {
  const { children, ...restProps } = props;
  return React.createElement(FormContext.Provider, { value: restProps }, children);
};

exports.useController = useController;
exports.useFormContext = useFormContext;
exports.useFormState = useFormState;
exports.useWatch = useWatch;
