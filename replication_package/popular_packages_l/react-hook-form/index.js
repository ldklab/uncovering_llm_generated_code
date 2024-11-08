const { useState, useCallback } = require('react');

// Simplified mock of `useForm` hook
function useForm() {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  const register = (fieldName, validations = {}) => ({
    name: fieldName,
    onChange: (e) => setFormData(prev => ({ ...prev, [fieldName]: e.target.value })),
    onBlur: () => {
      const value = formData[fieldName];
      let error = false;

      if (validations.required && !value) {
        error = 'This field is required.';
      } else if (validations.pattern && !validations.pattern.test(value)) {
        error = 'Invalid format.';
      }

      setErrors(prev => ({ ...prev, [fieldName]: error }));
    }
  });

  const handleSubmit = useCallback((onSubmit) => {
    return (e) => {
      e.preventDefault();
      let valid = true;

      for (const key in errors) {
        if (errors[key]) {
          valid = false;
          break;
        }
      }

      if (valid) {
        onSubmit(formData);
      }
    };
  }, [errors, formData]);

  return { register, handleSubmit, formState: { errors } };
}

// Example of using the `useForm` in a simplified React component
function FormComponent() {
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = (data) => {
    console.log('Submitted Data: ', data);
  };

  return (
    `<form onSubmit=${handleSubmit(onSubmit)}>
        <input ${register('firstName').name} />
        <input ${register('lastName', { required: true }).name} />
        ${errors.lastName ? '<p>Last name is required.</p>' : ''}
        <input ${register('age', { pattern: /\d+/ }).name} />
        ${errors.age ? '<p>Please enter a number for age.</p>' : ''}
        <button type="submit">Submit</button>
     </form>`
  );
}

module.exports = { useForm, FormComponent };
