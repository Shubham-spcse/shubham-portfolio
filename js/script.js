/**
 * ================================================================
 *  portfolio — script.js
 *  Shubham Prajapati | shubham-spcse.github.io
 * ================================================================
 *
 *  TABLE OF CONTENTS
 *  -----------------
 *  1.  Utility helpers
 *  2.  Loader
 *  3.  Scroll progress bar
 *  4.  Navbar — scroll state
 *  5.  Hamburger menu
 *  6.  Active nav link highlight
 *  7.  Theme toggle (dark / light)
 *  8.  Back to Top button
 *  9.  Scroll reveal (IntersectionObserver)
 *  10. Counter animation
 *  11. Typing / typewriter effect
 *  12. Contact form — validation + Formspree submit
 *  13. Keyboard & accessibility helpers
 *  14. Copyright year
 *  15. Init
 * ================================================================
 */

'use strict';

/* ================================================================
   1. UTILITY HELPERS
================================================================ */

/**
 * Shorthand querySelector — returns null if not found.
 * @param {string} sel
 * @param {Document|Element} [ctx=document]
 */
const $ = (sel, ctx = document) => ctx.querySelector(sel);

/**
 * Shorthand querySelectorAll — returns a real Array.
 * @param {string} sel
 * @param {Document|Element} [ctx=document]
 */
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/**
 * Add one or more event listeners to an element safely.
 * Does nothing if el is null / undefined.
 */
function on(el, events, handler, options) {
  if (!el) return;
  events.split(' ').forEach(ev => el.addEventListener(ev, handler, options));
}

/** Clamp a number between min and max. */
const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

/** Check if user prefers reduced motion. */
const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;


/* ================================================================
   2. LOADER
================================================================ */

function initLoader() {
  const loader = $('#loader');
  if (!loader) return;

  // Minimum display time so the bar animation completes
  const minDisplay = 900;
  const start      = performance.now();

  function hide() {
    const elapsed = performance.now() - start;
    const delay   = Math.max(0, minDisplay - elapsed);

    setTimeout(() => {
      loader.classList.add('hidden');          // CSS handles opacity + visibility
      loader.addEventListener('transitionend', () => loader.remove(), { once: true });
    }, delay);
  }

  if (document.readyState === 'complete') {
    hide();
  } else {
    window.addEventListener('load', hide, { once: true });
  }
}


/* ================================================================
   3. SCROLL PROGRESS BAR
================================================================ */

function initScrollProgress() {
  const bar = $('#scroll-progress');
  if (!bar) return;

  function update() {
    const scrolled  = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct       = docHeight > 0 ? (scrolled / docHeight) * 100 : 0;

    // Drive the CSS custom property — the bar width is set in CSS via var(--scroll-pct)
    document.documentElement.style.setProperty('--scroll-pct', `${clamp(pct, 0, 100)}%`);
  }

  on(window, 'scroll', update, { passive: true });
  update(); // set initial state
}


/* ================================================================
   4. NAVBAR — SCROLL STATE
================================================================ */

function initNavbarScroll() {
  const navbar = $('.navbar');
  if (!navbar) return;

  const THRESHOLD = 60;

  function update() {
    navbar.classList.toggle('scrolled', window.scrollY > THRESHOLD);
  }

  on(window, 'scroll', update, { passive: true });
  update();
}


/* ================================================================
   5. HAMBURGER MENU
================================================================ */

function initHamburger() {
  const toggle = $('#nav-toggle');
  const menu   = $('#nav-links');
  if (!toggle || !menu) return;

  function open() {
    menu.classList.add('open');
    toggle.classList.add('open');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden'; // prevent bg scroll on mobile
  }

  function close() {
    menu.classList.remove('open');
    toggle.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  function toggle_() {
    menu.classList.contains('open') ? close() : open();
  }

  on(toggle, 'click', toggle_);

  // Close on nav link click
  $$('a', menu).forEach(link => on(link, 'click', close));

  // Close when clicking outside the menu
  on(document, 'click', e => {
    if (menu.classList.contains('open') &&
        !menu.contains(e.target) &&
        !toggle.contains(e.target)) {
      close();
    }
  });

  // Close on Escape key
  on(document, 'keydown', e => {
    if (e.key === 'Escape' && menu.classList.contains('open')) close();
  });
}


/* ================================================================
   6. ACTIVE NAV LINK HIGHLIGHT
================================================================ */

function initActiveNav() {
  const sections = $$('section[id]');
  const links    = $$('.nav-links a');
  if (!sections.length || !links.length) return;

  // Use IntersectionObserver for performance
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      const id      = entry.target.getAttribute('id');
      const current = $(`.nav-links a[href="#${id}"]`);

      links.forEach(l => l.classList.remove('active'));
      if (current) current.classList.add('active');
    });
  }, {
    rootMargin: '-40% 0px -55% 0px', // trigger when section is centred in viewport
    threshold: 0,
  });

  sections.forEach(sec => observer.observe(sec));
}


/* ================================================================
   7. THEME TOGGLE (DARK / LIGHT)
================================================================ */

function initTheme() {
  const btn  = $('#theme-toggle');
  const icon = $('#theme-icon');
  if (!btn) return;

  const STORAGE_KEY = 'sp-theme';

  function applyTheme(theme) {
    if (theme === 'light') {
      document.body.classList.add('light');
      if (icon) {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
      }
    } else {
      document.body.classList.remove('light');
      if (icon) {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
      }
    }
  }

  function toggleTheme() {
    const isDark = !document.body.classList.contains('light');
    const next   = isDark ? 'light' : 'dark';
    applyTheme(next);
    localStorage.setItem(STORAGE_KEY, next);
  }

  // Restore saved preference (or respect OS preference)
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    applyTheme(saved);
  } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
    applyTheme('light');
  }

  on(btn, 'click', toggleTheme);

  // Also listen for OS theme changes at runtime
  window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', e => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      applyTheme(e.matches ? 'light' : 'dark');
    }
  });
}


/* ================================================================
   8. BACK TO TOP BUTTON
================================================================ */

function initBackToTop() {
  const btn = $('#back-to-top');
  if (!btn) return;

  const SHOW_AFTER = 400; // px

  function update() {
    btn.classList.toggle('visible', window.scrollY > SHOW_AFTER);
  }

  on(window, 'scroll', update, { passive: true });

  on(btn, 'click', () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  });

  update();
}


/* ================================================================
   9. SCROLL REVEAL
================================================================ */

function initScrollReveal() {
  const els = $$('.reveal');
  if (!els.length) return;

  // If user prefers reduced motion, just show everything immediately
  if (prefersReducedMotion()) {
    els.forEach(el => el.classList.add('active'));
    return;
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target); // fire once
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  els.forEach(el => observer.observe(el));
}


/* ================================================================
   10. COUNTER ANIMATION
================================================================ */

function animateCounter(el) {
  if (prefersReducedMotion()) {
    el.textContent = Number(el.dataset.target).toLocaleString();
    return;
  }

  const target   = Number(el.dataset.target);
  const duration = 1800; // ms
  const start    = performance.now();

  // Ease-out cubic
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

  function frame(now) {
    const elapsed  = now - start;
    const progress = clamp(elapsed / duration, 0, 1);
    const value    = Math.round(easeOut(progress) * target);

    el.textContent = value.toLocaleString();

    if (progress < 1) {
      requestAnimationFrame(frame);
    } else {
      el.textContent = target.toLocaleString();
    }
  }

  requestAnimationFrame(frame);
}

function initCounters() {
  const counters = $$('.counter');
  if (!counters.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target); // run once
      }
    });
  }, { threshold: 0.6 });

  counters.forEach(el => observer.observe(el));
}


/* ================================================================
   11. TYPING / TYPEWRITER EFFECT
================================================================ */

function initTyping() {
  const el = $('#typing-text');
  if (!el || prefersReducedMotion()) {
    if (el) el.textContent = 'Software Engineer';
    return;
  }

  const roles = [
    'Software Engineer',
    'Java Developer',
    'DSA Enthusiast',
    'GATE 2026 Qualified',
    'Problem Solver',
    'Full-Stack Developer',
  ];

  let roleIdx  = 0;
  let charIdx  = 0;
  let deleting = false;
  let timer    = null;

  const SPEEDS = {
    type:    115,   // ms per character while typing
    delete:  60,    // ms per character while deleting
    pause:   2000,  // ms pause after full word is typed
    next:    380,   // ms pause before typing next word
  };

  function tick() {
    const word = roles[roleIdx];

    if (deleting) {
      charIdx--;
      el.textContent = word.slice(0, charIdx);

      if (charIdx === 0) {
        deleting = false;
        roleIdx  = (roleIdx + 1) % roles.length;
        timer    = setTimeout(tick, SPEEDS.next);
        return;
      }
      timer = setTimeout(tick, SPEEDS.delete);

    } else {
      charIdx++;
      el.textContent = word.slice(0, charIdx);

      if (charIdx === word.length) {
        deleting = true;
        timer    = setTimeout(tick, SPEEDS.pause);
        return;
      }
      timer = setTimeout(tick, SPEEDS.type);
    }
  }

  // Start typing after a short delay (feels more natural after page load)
  timer = setTimeout(tick, 600);

  // Clean up if the page is about to be unloaded
  window.addEventListener('pagehide', () => clearTimeout(timer));
}


/* ================================================================
   12. CONTACT FORM — VALIDATION + FORMSPREE SUBMIT
================================================================ */

function initContactForm() {
  const form = $('#contact-form');
  if (!form) return;

  const nameInput    = $('#name',          form);
  const emailInput   = $('#email',         form);
  const msgInput     = $('#message',       form);
  const nameError    = $('#name-error',    form);
  const emailError   = $('#email-error',   form);
  const msgError     = $('#message-error', form);
  const submitBtn    = $('#submit-btn',    form);
  const btnText      = $('#btn-text',      form);
  const btnLoading   = $('#btn-loading',   form);
  const successBox   = $('#form-success',  form);

  // ── Validators ──────────────────────────────────────────────

  function isValidEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
  }

  function showError(input, span, msg) {
    if (input)  input.classList.add('error');
    if (span)   span.textContent = msg;
  }

  function clearError(input, span) {
    if (input)  input.classList.remove('error');
    if (span)   span.textContent = '';
  }

  function validateAll() {
    let valid = true;

    // Name
    if (!nameInput?.value.trim()) {
      showError(nameInput, nameError, 'Please enter your name.');
      valid = false;
    } else {
      clearError(nameInput, nameError);
    }

    // Email
    if (!emailInput?.value.trim()) {
      showError(emailInput, emailError, 'Please enter your email.');
      valid = false;
    } else if (!isValidEmail(emailInput.value)) {
      showError(emailInput, emailError, 'Please enter a valid email address.');
      valid = false;
    } else {
      clearError(emailInput, emailError);
    }

    // Message
    if (!msgInput?.value.trim()) {
      showError(msgInput, msgError, 'Please enter a message.');
      valid = false;
    } else if (msgInput.value.trim().length < 10) {
      showError(msgInput, msgError, 'Message must be at least 10 characters.');
      valid = false;
    } else {
      clearError(msgInput, msgError);
    }

    return valid;
  }

  // ── Real-time inline validation (on blur) ───────────────────

  on(nameInput, 'blur', () => {
    nameInput.value.trim()
      ? clearError(nameInput, nameError)
      : showError(nameInput, nameError, 'Please enter your name.');
  });

  on(emailInput, 'blur', () => {
    if (!emailInput.value.trim()) {
      showError(emailInput, emailError, 'Please enter your email.');
    } else if (!isValidEmail(emailInput.value)) {
      showError(emailInput, emailError, 'Please enter a valid email address.');
    } else {
      clearError(emailInput, emailError);
    }
  });

  on(msgInput, 'blur', () => {
    if (!msgInput.value.trim()) {
      showError(msgInput, msgError, 'Please enter a message.');
    } else if (msgInput.value.trim().length < 10) {
      showError(msgInput, msgError, 'Message must be at least 10 characters.');
    } else {
      clearError(msgInput, msgError);
    }
  });

  // Clear error as user types
  [nameInput, emailInput, msgInput].forEach(input => {
    on(input, 'input', () => {
      if (input?.classList.contains('error')) {
        input.classList.remove('error');
      }
    });
  });

  // ── Submit ───────────────────────────────────────────────────

  function setLoading(loading) {
    if (!submitBtn) return;
    submitBtn.disabled = loading;
    if (btnText)    btnText.style.display    = loading ? 'none'         : 'inline-flex';
    if (btnLoading) btnLoading.style.display = loading ? 'inline-flex'  : 'none';
  }

  function showSuccess() {
    if (!successBox) return;
    successBox.style.display = 'flex';
    // Scroll success message into view on mobile
    successBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    setTimeout(() => { successBox.style.display = 'none'; }, 6000);
  }

  on(form, 'submit', async e => {
    e.preventDefault();

    if (!validateAll()) return;

    // Check if Formspree ID has been replaced
    const action = form.getAttribute('action') || '';
    if (action.includes('YOUR_FORM_ID')) {
      // Dev fallback: just show success without a real request
      console.warn('[Contact] Formspree URL not configured — showing mock success.');
      setLoading(true);
      await new Promise(r => setTimeout(r, 1000));
      setLoading(false);
      showSuccess();
      form.reset();
      return;
    }

    // Real Formspree submission
    setLoading(true);

    try {
      const data = new FormData(form);
      const res  = await fetch(action, {
        method:  'POST',
        body:    data,
        headers: { 'Accept': 'application/json' },
      });

      if (res.ok) {
        setLoading(false);
        showSuccess();
        form.reset();
        // Clear all inline errors
        [nameInput, emailInput, msgInput].forEach(inp => clearError(inp, null));
        [nameError, emailError, msgError].forEach(span => { if (span) span.textContent = ''; });
      } else {
        const json = await res.json().catch(() => ({}));
        throw new Error(json?.errors?.[0]?.message || 'Server error');
      }
    } catch (err) {
      console.error('[Contact] Submit error:', err);
      setLoading(false);
      if (msgError) {
        msgError.textContent = '⚠ Something went wrong. Please email me directly.';
        msgError.style.color = '#f87171';
      }
    }
  });
}


/* ================================================================
   13. KEYBOARD & ACCESSIBILITY HELPERS
================================================================ */

function initA11y() {
  // Make logo click scroll to top
  const logo = $('.logo');
  on(logo, 'click keydown', e => {
    if (e.type === 'click' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    }
  });

  // Add tabindex so logo is focusable
  if (logo) logo.setAttribute('tabindex', '0');

  // Trap no focus issues — skip-link friendly scroll padding is set in CSS
}


/* ================================================================
   14. COPYRIGHT YEAR
================================================================ */

function initYear() {
  const el = $('#year');
  if (el) el.textContent = new Date().getFullYear();
}


/* ================================================================
   15. INIT — wire everything up
================================================================ */

(function init() {
  initLoader();
  initScrollProgress();
  initNavbarScroll();
  initHamburger();
  initActiveNav();
  initTheme();
  initBackToTop();
  initScrollReveal();
  initCounters();
  initTyping();
  initContactForm();
  initA11y();
  initYear();
})();