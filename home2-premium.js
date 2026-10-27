/**
 * FlowCare Home 2 - Interactive Card Tilt & Magnetic Buttons
 * - 3D Card Hover Tilt Effect & Magnetic Button Interaction
 */
(() => {
  'use strict';

  // 1. 3D Card Hover Tilt for Mini Cards & Service Cards
  const tiltCards = document.querySelectorAll('.compact-service, .mini-card');
  if (window.matchMedia('(pointer: fine)').matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    tiltCards.forEach(card => {
      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -5;
        const rotateY = ((x - centerX) / centerX) * 5;

        card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-5px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  // 2. Subtle Magnetic Pull on Buttons
  const magneticBtns = document.querySelectorAll('.btn-primary, .btn-secondary, .header-cta');
  if (window.matchMedia('(pointer: fine)').matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    magneticBtns.forEach(btn => {
      btn.addEventListener('mousemove', e => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.16}px, ${y * 0.16 - 3}px) scale(1.02)`;
      });

      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
      });
    });
  }
})();
