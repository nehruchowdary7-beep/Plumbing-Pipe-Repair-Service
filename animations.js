/* Lightweight progressive motion. Links/forms keep their native behavior. */
(() => {
  'use strict';
  const main = document.querySelector('main');
  if (!main) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const desktop = matchMedia('(min-width: 992px)');
  const targets = [...main.querySelectorAll('[data-reveal], .mini-card, .compact-service, .editorial-article')];
  const photos = [...main.querySelectorAll('[data-parallax]')];
  const counters = [...main.querySelectorAll('[data-counter]')];
  let observer;
  let photoObserver;
  let frame = 0;
  const active = new Set();
  const countFrames = new Map();
  function wrapHeadlines() {
    main.querySelectorAll('[data-text-reveal]').forEach(heading => {
      if (heading.dataset.prepared) return;
      heading.setAttribute('aria-label', heading.textContent.replace(/\s+/g,' ').trim());
      const walker = document.createTreeWalker(heading, NodeFilter.SHOW_TEXT);
      const textNodes = [];
      while (walker.nextNode()) textNodes.push(walker.currentNode);
      let index = 0;
      textNodes.forEach(node => {
        const fragment = document.createDocumentFragment();
        node.textContent.split(/(\s+)/).forEach(word => {
          if (!word) return;
          if (/^\s+$/.test(word)) { fragment.append(document.createTextNode(word)); return; }
          const span = document.createElement('span');
          span.className = 'headline-word'; span.textContent = word;
          span.style.setProperty('--word-delay', `${Math.min(index++ * 55,440)}ms`);
          span.setAttribute('aria-hidden','true'); fragment.append(span);
        });
        node.replaceWith(fragment);
      });
      heading.dataset.prepared = 'true';
    });
  }
  function count(element) {
    if (element.dataset.counted || reduced.matches) return;
    element.dataset.counted = 'true';
    const target = Number(element.dataset.counter);
    if (!Number.isFinite(target)) return;
    element.setAttribute('aria-label',String(target));
    const start = performance.now();
    const tick = time => {
      const fraction = Math.min((time-start)/800,1);
      element.textContent = Math.round(target*(1-Math.pow(1-fraction,3)));
      if (fraction<1) countFrames.set(element,requestAnimationFrame(tick));
      else countFrames.delete(element);
    };
    countFrames.set(element,requestAnimationFrame(tick));
  }
  function reveal(element) {
    element.classList.add('is-revealed');
    element.querySelectorAll('[data-counter]').forEach(count);
  }
  function updatePhotos() {
    frame = 0;
    if (reduced.matches || !desktop.matches) return;
    active.forEach(photo => {
      const bounds = photo.getBoundingClientRect();
      const movement = Math.max(-14,Math.min(14,(innerHeight/2-bounds.top-bounds.height/2)*.035));
      photo.style.setProperty('--photo-offset',`${movement.toFixed(2)}px`);
    });
  }
  function schedule() {
    if (!frame && !reduced.matches && desktop.matches) frame = requestAnimationFrame(updatePhotos);
  }
  function stop() {
    observer?.disconnect(); photoObserver?.disconnect(); active.clear();
    cancelAnimationFrame(frame); frame=0;
    countFrames.forEach(id=>cancelAnimationFrame(id)); countFrames.clear();
    main.classList.remove('motion-enabled');
    targets.forEach(reveal);
    photos.forEach(photo=>photo.style.removeProperty('--photo-offset'));
    counters.forEach(element=>element.textContent=element.dataset.counter);
  }
  function start() {
    if (reduced.matches || !('IntersectionObserver' in window)) { stop(); return; }
    wrapHeadlines(); main.classList.add('motion-enabled');
    observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { if(entry.isIntersecting) { reveal(entry.target); observer.unobserve(entry.target); } });
    }, {threshold:.025,rootMargin:'0px 0px 25px 0px'});
    targets.forEach((element,index)=> {
      element.style.setProperty('--reveal-delay',`${index%3*45}ms`);
      observer.observe(element);
      element.addEventListener('focusin',()=>reveal(element),{once:true});
    });
    photoObserver = new IntersectionObserver(entries=> {
      entries.forEach(entry=>entry.isIntersecting?active.add(entry.target):active.delete(entry.target)); schedule();
    });
    photos.forEach(photo=>photoObserver.observe(photo));
  }
  document.addEventListener('click',event=> {
    const link = event.target.closest('a[href]');
    if (!link) return;
    const url = new URL(link.href,location.href);
    if (url.origin!==location.origin || url.pathname!==location.pathname || !url.hash) return;
    let destination;
    try { destination=document.getElementById(decodeURIComponent(url.hash.slice(1))); } catch { return; }
    if(destination?.matches('details')) destination.open = true;
    if(destination) targets.filter(element=>element.contains(destination)||destination.contains(element)).forEach(reveal);
  });
  window.addEventListener('scroll',schedule,{passive:true});
  window.addEventListener('resize',schedule,{passive:true});
  window.addEventListener('pageshow',event=>{if(event.persisted)targets.forEach(reveal);});
  window.addEventListener('beforeprint',stop);
  reduced.addEventListener('change',()=>{stop();if(!reduced.matches)start();});
  desktop.addEventListener('change',()=>{photos.forEach(photo=>photo.style.removeProperty('--photo-offset'));schedule();});
  start();
  if (location.hash) {
    try { const destination = document.getElementById(decodeURIComponent(location.hash.slice(1))); if (destination?.matches('details')) destination.open = true; } catch { /* Invalid fragments must not block content. */ }
  }
})();
