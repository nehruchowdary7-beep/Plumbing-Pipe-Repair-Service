/* Shared navigation, direction, contact configuration and retained account demos. */
(() => {
  'use strict';
  const root = document.documentElement;
  const config = window.FlowCareConfig;
  // Preserve inbound links to the former booking location.
  if (location.pathname.endsWith('/contact.html') && location.hash === '#booking') {
    location.replace('book-now.html' + location.search + '#booking');
    return;
  }
  const menu = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.site-nav');
  // Manage home dropdown toggles for all instances on the page
  const homeItems = document.querySelectorAll('.home-nav-item');
  homeItems.forEach(homeItem => {
    const homeToggle = homeItem.querySelector('.home-menu-toggle');
    const homeSubmenu = homeItem.querySelector('.home-submenu');
    if (!homeToggle || !homeSubmenu) return;

    function closeHome(restoreFocus = false) {
      homeToggle.setAttribute('aria-expanded', 'false');
      homeSubmenu.hidden = true;
      if (restoreFocus) homeToggle.focus();
    }
    function openHome() {
      homeToggle.setAttribute('aria-expanded', 'true');
      homeSubmenu.hidden = false;
    }

    homeToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isExpanded = homeToggle.getAttribute('aria-expanded') === 'true';
      isExpanded ? closeHome() : openHome();
    });

    homeItem.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        closeHome(true);
      } else if ((event.key === 'ArrowDown' || event.key === 'ArrowUp') && event.target === homeToggle) {
        event.preventDefault();
        openHome();
        const links = homeSubmenu.querySelectorAll('a');
        links[event.key === 'ArrowDown' ? 0 : links.length - 1]?.focus();
      }
    });

    homeItem.addEventListener('focusout', event => {
      if (!homeItem.contains(event.relatedTarget)) closeHome();
    });
  });

  document.addEventListener('click', event => {
    homeItems.forEach(homeItem => {
      if (!event.composedPath().includes(homeItem)) {
        const homeToggle = homeItem.querySelector('.home-menu-toggle');
        const homeSubmenu = homeItem.querySelector('.home-submenu');
        if (homeToggle && homeSubmenu) {
          homeToggle.setAttribute('aria-expanded', 'false');
          homeSubmenu.hidden = true;
        }
      }
    });
  });

  function closeMenu(restoreFocus = false) {
    closeHome();
    if (!menu || !nav) return;
    menu.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-label', 'Open navigation');
    menu.innerHTML = '<span aria-hidden="true">☰</span>';
    nav.classList.remove('is-open');
    if (restoreFocus) menu.focus();
  }
  menu?.addEventListener('click', event => {
    // The icon is replaced below. Stop bubbling before its detached span can look like an outside click.
    event.stopPropagation();
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    menu.innerHTML = `<span aria-hidden="true">${open ? '×' : '☰'}</span>`;
    nav.classList.toggle('is-open', open);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu?.getAttribute('aria-expanded') === 'true') closeMenu(true);
  });
  document.addEventListener('click', event => {
    const header = document.getElementById('site-header');
    if (header && !event.composedPath().includes(header)) closeMenu();
  });
  nav?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => closeMenu()));
  window.matchMedia('(min-width: 1281px)').addEventListener('change', event => { if (event.matches) closeMenu(); });
  function updateDirection() {
    document.querySelectorAll('.direction-control').forEach(button => {
      button.title = root.dir === 'rtl' ? 'Switch to left-to-right layout' : 'Switch to right-to-left layout';
      button.setAttribute('aria-label', button.title);
      button.setAttribute('aria-pressed', String(root.dir === 'rtl'));
    });
  }
  updateDirection();
  document.querySelectorAll('.direction-control').forEach(button => button.addEventListener('click', () => {
    root.dir = root.dir === 'rtl' ? 'ltr' : 'rtl';
    try { localStorage.setItem('flowcare-dir', root.dir); } catch { /* Direction remains usable on this page. */ }
    updateDirection();
  }));
  document.querySelectorAll('[data-year]').forEach(item => { item.textContent = new Date().getFullYear(); });
  document.querySelectorAll('[data-business]').forEach(item => {
    const key = item.dataset.business;
    const value = key === 'hours' ? config.operatingHours : key === 'phone' ? config.phoneDisplay : config[key];
    if (value) item.textContent = value;
  });
  document.querySelectorAll('[data-business-email]').forEach(link => {
    link.textContent = config.email; link.href = `mailto:${config.email}`;
  });
  const emergencyPhone = config.emergencyPhone.replace(/[\s()-]/g, '');
  if (/^\+\d{7,15}$/.test(emergencyPhone)) {
    document.querySelectorAll('[data-emergency-call]').forEach(link => {
      link.href = `tel:${emergencyPhone}`;
      link.setAttribute('aria-label', `Call emergency plumbing: ${config.emergencyPhone}`);
    });
  }
  // Motion is handled by the dedicated animations.js module.
  document.querySelectorAll('.show-password').forEach(button => button.addEventListener('click', () => {
    const input = button.previousElementSibling;
    const show = input.type === 'password'; input.type = show ? 'text' : 'password';
    button.textContent = show ? 'Hide' : 'Show';
    button.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
  }));
  document.querySelectorAll('.auth-form').forEach(form => form.addEventListener('submit', event => {
    event.preventDefault();
    if (!window.FlowCareValidation.check(form)) return;
    form.querySelector('[role="status"]').textContent = 'Fields validated. Authentication is not connected. No account was created and no credentials were stored.';
    form.elements.password.value = '';
  }));
  document.querySelectorAll('[data-select-service]').forEach(link => {
    link.addEventListener('click', () => {
      const select = document.querySelector('#booking-form select[name="service"]');
      if (select) {
        select.value = link.dataset.selectService;
        select.dispatchEvent(new Event('change', {bubbles: true}));
      }
      document.querySelectorAll('[data-select-service]').forEach(item => item.removeAttribute('aria-current'));
      link.setAttribute('aria-current', 'true');
    });
  });
  const blogSearch = document.querySelector('[data-blog-search]');
  if (blogSearch) blogSearch.addEventListener('input', () => {
    const query = blogSearch.value.trim().toLocaleLowerCase();
    let matches = 0;
    document.querySelectorAll('[data-blog-article]').forEach(article => {
      article.hidden = !article.textContent.toLocaleLowerCase().includes(query);
      if (!article.hidden) matches += 1;
    });
    document.querySelector('[data-blog-status]').textContent = `${matches} article${matches === 1 ? '' : 's'} found.`;
  });
})();
