"use strict";
const React = require("react");
const { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo, Fragment } = React;

// Utility functions
const isTypeCheckbox = (element) => element.type === "checkbox";
const isInstanceOfDate = (value) => value instanceof Date;
const isNullUndefined = (value) => value == null;
const isObject = (obj) => obj && typeof obj === "object" && !Array.isArray(obj);

const isObjectValue = (value) => !isNullUndefined(value) && !Array.isArray(value) && isObject(value) && !isInstanceOfDate(value);
const getTargetValue = (event) => isObjectValue(event) && event.target ? (isTypeCheckbox(event.target) ? event.target.checked : event.target.value) : event;
const deepCopy = (data) => JSON.parse(JSON.stringify(data));

// Form state hooks and functions
const formContext = createContext(null);
const useFormContext = () => useContext(formContext);

function useFormControl(name, { control, disabled, exact }) {
  const [formState, setFormState] = useState(control._formState);
  const isMounted = useRef(true);

  useEffect(() => {
    const subscription = control._subjects.state.subscribe({
      next: (newState) => {
        if (isMounted.current && matchesNamePattern(name, newState.name, exact)) {
          updateFormState(newState);
          setFormState({ ...control._formState, ...newState });
        }
      },
    });

    return () => {
      isMounted.current = false;
      subscription.unsubscribe();
    };
  }, [name, control, exact]);

  function matchesNamePattern(currentName, targetName, exactMatch) {
    return !exactMatch || currentName === targetName || targetName.startsWith(`${currentName}.`);
  }

  function updateFormState(updates) {
    // Update the form state with the new changes
  }

  return formState;
}

function useForm({ mode = "onSubmit", reValidateMode = "onChange", shouldFocusError = true, defaultValues = {} }) {
  const initialState = {
    isDirty: false,
    isValidating: false,
    isValid: false,
    errors: {},
    values: defaultValues,
  };

  const [formState, setFormState] = useState(initialState);

  const control = {
    _formState: initialState,
    _subjects: {
      state: new Subject(),
      values: new Subject(),
      array: new Subject(),
    },
    _getWatch: (name, defaultValue) => (name ? formState.values[name] : defaultValue),
    setValue: (name, value) => {
      formState.values[name] = value;
      control._subjects.values.next({ name, values: formState.values });
    },
  };

  useEffect(() => {
    const formStateSubscription = control._subjects.state.subscribe({
      next: (newState) => {
        setFormState({ ...formState, ...newState });
      },
    });

    return () => formStateSubscription.unsubscribe();
  }, [control]);

  return { formState, control };
}

function FormProvider({ children, control }) {
  return <formContext.Provider value={control}>{children}</formContext.Provider>;
}

function useController(props) {
  const { control, name, rules } = props;
  const { isValidating, errors } = useFormControl(name, { control });

  const error = errors[name];
  const isDirty = !!Object.keys(errors).find((errorName) => errorName.includes(name));

  return {
    field: {
      ...control.register(name, rules),
      error,
      isDirty,
      isValidating,
    },
    formState: control._formState,
  };
}

function Subject() {
  let observers = [];

  return {
    next: (value) => observers.forEach((observer) => observer.next(value)),
    subscribe: (observer) => {
      observers.push(observer);
      return {
        unsubscribe: () => {
          observers = observers.filter((sub) => sub !== observer);
        },
      };
    },
  };
}

module.exports = {
  useForm,
  FormProvider,
  useController,
  useFormContext,
};
