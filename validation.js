/* Accessible client validation shared by booking, contact and account demos. */
(() => {
  'use strict';
  const fieldsFor = form => [...form.querySelectorAll('input, select, textarea')];
  function check(form) {
    form.querySelectorAll('.field-error').forEach(error => error.remove());
    const errors = [];
    fieldsFor(form).forEach((field, index) => {
      field.setCustomValidity('');
      field.removeAttribute('aria-invalid');
      field.removeAttribute('aria-describedby');
      const label = field.closest('label');
      const labelText = label ? [...label.childNodes].filter(node => node.nodeType === Node.TEXT_NODE).map(node => node.textContent.trim()).join(' ').trim() : '';
      if (labelText) field.setAttribute('aria-label', labelText);
      if (!field.id) field.id = `${form.id || 'form'}-${field.name || index}`;
      if (field.type !== 'checkbox' && field.required && !field.value.trim()) {
        field.setCustomValidity('Please complete this field.');
      }
      if (field.name === 'phone' && field.value && !/^\+?[\d\s()-]{7,25}$/.test(field.value.trim())) {
        field.setCustomValidity('Enter a valid phone number using 7–25 digits, spaces, +, brackets or hyphens.');
      }
      if (field.type === 'date' && field.value && field.min && field.value < field.min) {
        field.setCustomValidity('Choose today or a future date.');
      }
      if (field.type === 'checkbox' && field.required && !field.checked) {
        field.setCustomValidity('Please acknowledge the demonstration notice.');
      }
      if (!field.checkValidity()) {
        const error = document.createElement('span');
        error.className = 'field-error';
        error.id = `${field.id}-error`;
        error.textContent = field.validationMessage;
        field.setAttribute('aria-invalid', 'true');
        field.setAttribute('aria-describedby', error.id);
        field.closest('label')?.append(error);
        errors.push({ field, message: field.validationMessage });
      }
    });
    const summary = form.querySelector('.form-error-summary');
    if (summary) {
      summary.replaceChildren();
      summary.hidden = errors.length === 0;
      if (errors.length) {
        const intro = document.createElement('strong');
        intro.textContent = `Please correct ${errors.length} field${errors.length === 1 ? '' : 's'} below.`;
        summary.append(intro);
        const list = document.createElement('ul');
        errors.forEach(({field,message}) => {
          const item = document.createElement('li');
          const link = document.createElement('a');
          link.href = `#${field.id}`;
          link.textContent = `${field.closest('label')?.firstChild?.textContent?.trim() || field.name}: ${message}`;
          link.addEventListener('click', () => field.focus());
          item.append(link); list.append(item);
        });
        summary.append(list);
      }
    }
    if (errors.length) errors[0].field.focus();
    return errors.length === 0;
  }
  function clear(form) {
    form.querySelectorAll('.field-error').forEach(error => error.remove());
    fieldsFor(form).forEach(field => { field.setCustomValidity(''); field.removeAttribute('aria-invalid'); field.removeAttribute('aria-describedby'); });
    const summary = form.querySelector('.form-error-summary');
    if (summary) { summary.hidden = true; summary.replaceChildren(); }
  }
  document.addEventListener('input', event => {
    const field = event.target;
    if (field.matches('input, select, textarea')) field.setCustomValidity('');
  });
  window.FlowCareValidation = Object.freeze({ check, clear });
})();
