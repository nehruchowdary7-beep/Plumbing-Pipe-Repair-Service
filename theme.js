/* Runs in <head> before styles to avoid an incorrect-theme flash. */
(() => {
  'use strict';
  const root = document.documentElement;
  const system = window.matchMedia('(prefers-color-scheme: dark)');
  let manualTheme = null;
  try {
    const stored = localStorage.getItem('flowcare-theme');
    if (stored === 'dark' || stored === 'light') manualTheme = stored;
    const dir = localStorage.getItem('flowcare-dir');
    root.dir = dir === 'rtl' ? 'rtl' : 'ltr';
  } catch { root.dir = 'ltr'; }
  root.dataset.theme = manualTheme || (system.matches ? 'dark' : 'light');
  const paths = {
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>',
    moon: '<path d="M20 14a8.3 8.3 0 01-10-10A8.3 8.3 0 1020 14z"/>'
  };
  function updateControls() {
    const dark = root.dataset.theme === 'dark';
    document.querySelectorAll('.theme-control').forEach(button => {
      button.innerHTML = `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">${paths[dark ? 'sun' : 'moon']}</svg>`;
      button.title = dark ? 'Switch to light mode' : 'Switch to dark mode';
      button.setAttribute('aria-label', button.title);
      button.setAttribute('aria-pressed', String(dark));
    });
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = dark ? '#0D1E20' : '#145C60';
  }
  function bindControls() {
    updateControls();
    document.querySelectorAll('.theme-control').forEach(button => {
      button.addEventListener('click', () => {
        manualTheme = root.dataset.theme === 'dark' ? 'light' : 'dark';
        root.dataset.theme = manualTheme;
        try { localStorage.setItem('flowcare-theme', manualTheme); } catch { /* Theme still works for this page. */ }
        updateControls();
      });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bindControls);
  else bindControls();
  system.addEventListener('change', event => {
    if (!manualTheme) { root.dataset.theme = event.matches ? 'dark' : 'light'; updateControls(); }
  });
})();
