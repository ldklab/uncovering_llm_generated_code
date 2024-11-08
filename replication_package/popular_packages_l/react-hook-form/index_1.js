const { useState, useCallback } = require('react');

function useForm() {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  const register = (fieldName, validations = {}) => ({
    name: fieldName,
    onChange: (e) => {
      setFormData(prev => ({ ...prev, [fieldName]: e.target.value }));
    },
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
      let isValid = true;

      for (const key in errors) {
        if (errors[key]) {
          isValid = false;
          break;
        }
      }

      if (isValid) {
        onSubmit(formData);
      }
    };
  }, [errors, formData]);

  return { register, handleSubmit, formState: { errors } };
}

function FormComponent() {
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = (submittedData) => {
    console.log('Submitted Data:', submittedData);
  };

  return (
    `<form onSubmit=${handleSubmit(onSubmit)}>
      <input ${register('firstName').name} onChange=${register('firstName').onChange} onBlur=${register('firstName').onBlur} placeholder="First Name" />
      <input ${register('lastName', { required: true }).name} onChange=${register('lastName').onChange} onBlur=${register('lastName').onBlur} placeholder="Last Name" />
      ${errors.lastName ? '<p>Last name is required.</p>' : ''}
      <input ${register('age', { pattern: /\d+/ }).name} onChange=${register('age').onChange} onBlur=${register('age').onBlur} placeholder="Age" />
      ${errors.age ? '<p>Please enter a valid number for age.</p>' : ''}
      <button type="submit">Submit</button>
    </form>`
  );
}

module.exports = { useForm, FormComponent };
