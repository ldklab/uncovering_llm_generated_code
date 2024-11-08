const { useState, useCallback } = require('react');

// Custom hook mimicking form logic with validation
function useForm() {
  // State to store form data and error messages
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  // Function to register a form field with validation rules
  const register = (fieldName, validations = {}) => ({
    name: fieldName,
    onChange: (e) => setFormData(prev => ({ ...prev, [fieldName]: e.target.value })),
    onBlur: () => {
      const value = formData[fieldName];
      let error = false;

      // Validation checks for required fields and pattern matching
      if (validations.required && !value) {
        error = 'This field is required.';
      } else if (validations.pattern && !validations.pattern.test(value)) {
        error = 'Invalid format.';
      }

      // Update errors state
      setErrors(prev => ({ ...prev, [fieldName]: error }));
    }
  });

  // Function to handle form submission with validation check
  const handleSubmit = useCallback((onSubmit) => {
    return (e) => {
      e.preventDefault();
      let valid = true;

      // Check for existing validation errors
      for (const key in errors) {
        if (errors[key]) {
          valid = false;
          break;
        }
      }

      // Invoke onSubmit callback if form is valid
      if (valid) {
        onSubmit(formData);
      }
    };
  }, [errors, formData]);

  return { register, handleSubmit, formState: { errors } };
}

// Example component using the custom useForm hook
function FormComponent() {
  const { register, handleSubmit, formState: { errors } } = useForm();

  // Callback to handle form data after submission
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
