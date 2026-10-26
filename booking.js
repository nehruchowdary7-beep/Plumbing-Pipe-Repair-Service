/* Frontend-only requests: explicit local storage, export and delete. No fetch or email send. */
(() => {
  'use strict';
  const validate = window.FlowCareValidation;
  document.querySelectorAll('[data-booking-form]').forEach(form => {
    let savedRequest = null;
    const storageKey = form.dataset.storageKey || 'flowcare-request';
    const status = form.querySelector('.form-status');
    const actions = form.querySelector('.request-actions');
    const today = new Date();
    form.elements.date.min = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
    const params = new URLSearchParams(location.search);
    if ([...form.elements.service.options].some(option => option.value === params.get('service'))) form.elements.service.value = params.get('service');
    if (params.get('priority') === 'urgent') form.elements.priority.value = 'urgent';
    try {
      const stored = JSON.parse(localStorage.getItem(storageKey) || 'null');
      if (stored && typeof stored === 'object' && !Array.isArray(stored)) {
        savedRequest = stored;
        status.textContent = 'A previous demo request is saved on this device. Download it or delete it below.';
        actions.hidden = false;
      }
    } catch { /* Invalid or blocked storage must not prevent a new request. */ }
    form.addEventListener('submit', event => {
      event.preventDefault();
      if (!validate.check(form)) { status.textContent = 'Please correct the marked fields before saving.'; return; }
      savedRequest = Object.fromEntries(new FormData(form));
      savedRequest.savedAt = new Date().toISOString();
      savedRequest.status = 'DEMONSTRATION ONLY — not submitted to a server or confirmed';
      try {
        localStorage.setItem(storageKey, JSON.stringify(savedRequest));
        status.textContent = 'Demo request saved on this device only. No server submission, confirmed booking or emergency dispatch has occurred.';
      } catch {
        status.textContent = 'Browser storage is unavailable. You can download your demo request now. Nothing was submitted to a server.';
      }
      actions.hidden = false;
    });
    form.querySelector('[data-export-request]').addEventListener('click', () => {
      if (!savedRequest) return;
      const file = new Blob([JSON.stringify(savedRequest, null, 2)], {type: 'application/json'});
      const url = URL.createObjectURL(file);
      const link = document.createElement('a');
      link.href = url; link.download = `${storageKey}.json`; link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    });
    form.querySelector('[data-clear-request]').addEventListener('click', () => {
      try { localStorage.removeItem(storageKey); } catch {
        status.textContent = 'Your browser prevented removal from storage. Clear this site’s data in browser settings.';
        return;
      }
      savedRequest = null; form.reset(); validate.clear(form); actions.hidden = true;
      status.textContent = 'Saved demo request deleted from this device.';
    });
  });
  document.querySelectorAll('[data-contact-form]').forEach(form => form.addEventListener('submit', event => {
    event.preventDefault();
    if (!validate.check(form)) return;
    form.querySelector('.form-status').textContent = 'Message fields validated. This is a demonstration: no message was sent or saved. Use your configured business contact method after launch.';
  }));
})();
