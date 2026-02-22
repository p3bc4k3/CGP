/* ============================================================
   DELONCA CONSULTING — app.js
   Navigation, scroll reveal, simulators, FAQ, forms
   ============================================================ */

'use strict';

// ── Sticky nav ──────────────────────────────────────────────
const nav = document.getElementById('main-nav');
if (nav) {
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });
}

// ── Burger menu ─────────────────────────────────────────────
const burger = document.getElementById('nav-burger');
const mobileMenu = document.getElementById('nav-mobile');
if (burger && mobileMenu) {
  burger.addEventListener('click', () => {
    const open = burger.classList.toggle('open');
    mobileMenu.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open);
  });
  // Close on link click
  mobileMenu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      burger.classList.remove('open');
      mobileMenu.classList.remove('open');
      burger.setAttribute('aria-expanded', false);
    });
  });
  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target) && !mobileMenu.contains(e.target)) {
      burger.classList.remove('open');
      mobileMenu.classList.remove('open');
      burger.setAttribute('aria-expanded', false);
    }
  });
}

// ── Active nav link ──────────────────────────────────────────
(function () {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(a => {
    const href = a.getAttribute('href');
    if (href === path || (path === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });
})();

// ── Scroll reveal ────────────────────────────────────────────
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ── FAQ accordion ────────────────────────────────────────────
document.querySelectorAll('.faq-item').forEach(item => {
  const btn = item.querySelector('.faq-question');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const wasOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
    if (!wasOpen) item.classList.add('open');
  });
});

// ── Format currency ──────────────────────────────────────────
function formatEuro(n, decimals = 0) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency', currency: 'EUR', maximumFractionDigits: decimals
  }).format(n);
}

function formatNum(n, decimals = 0) {
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: decimals }).format(n);
}

// ── SIMULATOR A — Intérêts composés ─────────────────────────
(function () {
  const el = document.getElementById('sim-compound');
  if (!el) return;

  const inputs = {
    capital:   el.querySelector('#ic-capital'),
    mensuel:   el.querySelector('#ic-mensuel'),
    rendement: el.querySelector('#ic-rendement'),
    duree:     el.querySelector('#ic-duree'),
  };
  const displays = {
    rendement: el.querySelector('#ic-rendement-val'),
    duree:     el.querySelector('#ic-duree-val'),
  };
  const resultVal = el.querySelector('#ic-result');
  const gainVal   = el.querySelector('#ic-gain');
  const apportVal = el.querySelector('#ic-apport');
  const canvas    = el.querySelector('#ic-chart');

  function calc() {
    const C  = parseFloat(inputs.capital.value)   || 0;
    const M  = parseFloat(inputs.mensuel.value)    || 0;
    const r  = parseFloat(inputs.rendement.value)  / 100;
    const n  = parseInt(inputs.duree.value);
    const rm = r / 12;
    const months = n * 12;

    let total = C;
    for (let i = 0; i < months; i++) {
      total = total * (1 + rm) + M;
    }

    const apportTotal = C + M * months;
    const gain = total - apportTotal;

    resultVal.textContent = formatEuro(total);
    gainVal.textContent   = formatEuro(gain);
    apportVal.textContent = formatEuro(apportTotal);

    if (displays.rendement) displays.rendement.textContent = r * 100 + ' %';
    if (displays.duree)     displays.duree.textContent = n + ' ans';

    drawChart(canvas, apportTotal, gain);
  }

  function drawChart(c, apport, gain) {
    if (!c) return;
    const ctx = c.getContext('2d');
    const W = c.width = c.offsetWidth * window.devicePixelRatio;
    const H = c.height = 160 * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    const w = c.offsetWidth, h = 160;

    const total = apport + gain;
    const pct = apport / total;

    ctx.clearRect(0, 0, w, h);

    // Bar background
    const bx = 0, by = 40, bw = w, bh = 20;
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, 6); ctx.fill();

    // Apport bar
    const apportW = pct * bw;
    ctx.fillStyle = 'rgba(201,168,76,0.4)';
    ctx.beginPath(); ctx.roundRect(bx, by, apportW, bh, [6, 0, 0, 6]); ctx.fill();

    // Gain bar
    const gainW = bw - apportW;
    const grd = ctx.createLinearGradient(apportW, 0, bw, 0);
    grd.addColorStop(0, '#C9A84C');
    grd.addColorStop(1, '#E2C47A');
    ctx.fillStyle = grd;
    ctx.beginPath(); ctx.roundRect(apportW, by, gainW, bh, [0, 6, 6, 0]); ctx.fill();

    // Labels
    ctx.font = '12px Outfit, sans-serif';
    ctx.fillStyle = 'rgba(138,143,168,0.8)';
    ctx.fillText('Versements', 4, 32);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#C9A84C';
    ctx.fillText('Intérêts générés', w - 4, 32);
    ctx.textAlign = 'left';

    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font = '11px Outfit, sans-serif';
    ctx.fillText(Math.round(pct * 100) + ' %', 6, by + bh + 18);
    ctx.textAlign = 'right';
    ctx.fillStyle = 'rgba(201,168,76,0.9)';
    ctx.fillText(Math.round((1 - pct) * 100) + ' %', w - 6, by + bh + 18);
    ctx.textAlign = 'left';
  }

  Object.values(inputs).forEach(i => i && i.addEventListener('input', calc));
  calc();
})();

// ── SIMULATOR B — Coût de l'inaction ────────────────────────
(function () {
  const el = document.getElementById('sim-inaction');
  if (!el) return;

  const capital  = el.querySelector('#ci-capital');
  const duree    = el.querySelector('#ci-duree');
  const dureeVal = el.querySelector('#ci-duree-val');
  const r1Result = el.querySelector('#ci-r1');
  const r5Result = el.querySelector('#ci-r5');
  const deltaResult = el.querySelector('#ci-delta');

  function calc() {
    const C = parseFloat(capital.value) || 0;
    const n = parseInt(duree.value);
    if (dureeVal) dureeVal.textContent = n + ' ans';

    const v1 = C * Math.pow(1.01, n);
    const v5 = C * Math.pow(1.05, n);

    r1Result.textContent    = formatEuro(v1);
    r5Result.textContent    = formatEuro(v5);
    deltaResult.textContent = formatEuro(v5 - v1);
  }

  [capital, duree].forEach(i => i && i.addEventListener('input', calc));
  calc();
})();

// ── SIMULATOR C — Mini audit budget ─────────────────────────
(function () {
  const el = document.getElementById('sim-budget');
  if (!el) return;

  const revenus  = el.querySelector('#ab-revenus');
  const charges  = el.querySelector('#ab-charges');
  const scoreEl  = el.querySelector('#ab-score');
  const tauxEl   = el.querySelector('#ab-taux');
  const msgEl    = el.querySelector('#ab-msg');

  function calc() {
    const R = parseFloat(revenus.value) || 0;
    const C = parseFloat(charges.value) || 0;
    const epargne = R - C;
    const taux = R > 0 ? (epargne / R) * 100 : 0;
    const tauxClamped = Math.max(0, Math.min(taux, 100));

    tauxEl.textContent = tauxClamped.toFixed(1) + ' %';

    let score, msg;
    if (tauxClamped < 0) {
      score = 'Critique'; msg = 'Vos dépenses dépassent vos revenus. Un rééquilibrage urgent est nécessaire.';
    } else if (tauxClamped < 5) {
      score = 'Fragile'; msg = 'Votre capacité d\'épargne est très limitée. Quelques ajustements peuvent changer la donne.';
    } else if (tauxClamped < 15) {
      score = 'Correct'; msg = 'Vous épargnez, c\'est bien. Mais il reste une marge d\'optimisation notable.';
    } else if (tauxClamped < 25) {
      score = 'Solide'; msg = 'Très bonne capacité d\'épargne. L\'enjeu devient l\'allocation : où mettre cet argent ?';
    } else {
      score = 'Excellent'; msg = 'Capacité d\'épargne remarquable. Une stratégie structurée peut maximiser l\'effet de levier.';
    }

    scoreEl.textContent = score;
    if (msgEl) msgEl.textContent = msg;
  }

  [revenus, charges].forEach(i => i && i.addEventListener('input', calc));
  calc();
})();

// ── SIMULATOR D — Locatif simplifié ─────────────────────────
(function () {
  const el = document.getElementById('sim-locatif');
  if (!el) return;

  const prix    = el.querySelector('#lo-prix');
  const apport  = el.querySelector('#lo-apport');
  const loyer   = el.querySelector('#lo-loyer');
  const taux    = el.querySelector('#lo-taux');
  const cashEl  = el.querySelector('#lo-cashflow');
  const yieldEl = el.querySelector('#lo-yield');
  const effortEl = el.querySelector('#lo-effort');

  function calc() {
    const P = parseFloat(prix.value) || 0;
    const A = parseFloat(apport.value) || 0;
    const L = parseFloat(loyer.value) || 0;
    const T = parseFloat(taux.value) / 100 || 0.035;
    const dureeAns = 20;

    const emprunt = P - A;
    const rm = T / 12;
    const n = dureeAns * 12;
    let mensualite = 0;
    if (emprunt > 0 && rm > 0) {
      mensualite = emprunt * (rm * Math.pow(1 + rm, n)) / (Math.pow(1 + rm, n) - 1);
    }

    const chargesEstim = L * 0.1; // ~10% charges
    const cashflow = L - mensualite - chargesEstim;
    const rendBrut = P > 0 ? (L * 12 / P) * 100 : 0;

    cashEl.textContent  = formatEuro(cashflow);
    yieldEl.textContent = rendBrut.toFixed(2) + ' %';
    effortEl.textContent = formatEuro(mensualite);

    // Color cashflow
    cashEl.style.color = cashflow >= 0 ? '#C9A84C' : '#EF6060';
  }

  [prix, apport, loyer, taux].forEach(i => i && i.addEventListener('input', calc));
  calc();
})();

// ── Contact form (Web3Forms) ──────────────────────────────────
(function () {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const submitBtn = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Validation
    const errors = validateForm(form);
    if (errors.length > 0) {
      showErrors(form, errors);
      return;
    }

    // Bouton en état "chargement"
    const originalBtnText = submitBtn ? submitBtn.innerHTML : '';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '⏳ Envoi en cours…';
    }

    try {
      const formData = new FormData(form);
      const object = {};
      formData.forEach((val, key) => { object[key] = val; });

      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(object)
      });

      const result = await response.json();

      if (result.success) {
        // Succès : masquer le formulaire, afficher la confirmation
        form.style.display = 'none';
        const success = document.getElementById('form-success');
        if (success) success.style.display = 'block';
      } else {
        throw new Error(result.message || 'Erreur lors de l\'envoi.');
      }
    } catch (err) {
      // Erreur : remettre le bouton et afficher un message
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
      }
      showGlobalError(form, '❌ Une erreur est survenue. Veuillez réessayer ou m\'écrire directement à jean.delonca@gmail.com');
      console.error('Form error:', err);
    }
  });

  function validateForm(form) {
    const errors = [];
    const nom   = form.querySelector('#f-nom');
    const email = form.querySelector('#f-email');
    const rgpd  = form.querySelector('#f-rgpd');

    if (!nom || !nom.value.trim()) errors.push({ field: nom, msg: 'Votre nom est requis.' });
    if (!email || !email.value.trim()) {
      errors.push({ field: email, msg: 'Votre email est requis.' });
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
      errors.push({ field: email, msg: 'Email invalide.' });
    }
    if (rgpd && !rgpd.checked) errors.push({ field: rgpd, msg: 'Vous devez accepter la politique de confidentialité.' });
    return errors;
  }

  function showErrors(form, errors) {
    form.querySelectorAll('.field-error').forEach(e => e.remove());
    form.querySelectorAll('.form-input, .form-select, .form-textarea').forEach(i => {
      i.style.borderColor = '';
    });
    errors.forEach(({ field, msg }) => {
      if (!field) return;
      field.style.borderColor = '#EF6060';
      const err = document.createElement('p');
      err.className = 'field-error';
      err.style.cssText = 'color:#EF6060;font-size:0.78rem;margin-top:4px;';
      err.textContent = msg;
      field.parentNode.appendChild(err);
    });
    if (errors[0]?.field) errors[0].field.focus();
  }

  function showGlobalError(form, msg) {
    form.querySelectorAll('.global-error').forEach(e => e.remove());
    const err = document.createElement('p');
    err.className = 'global-error';
    err.style.cssText = 'color:#EF6060;font-size:0.88rem;margin-bottom:16px;padding:12px;background:rgba(239,96,96,0.08);border-radius:8px;';
    err.textContent = msg;
    form.insertBefore(err, form.firstChild);
  }
})();

// ── Numbers counter animation ────────────────────────────────
function animateCounter(el) {
  const target = parseFloat(el.dataset.target) || 0;
  const duration = 1600;
  const start = performance.now();

  function update(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = target * eased;

    if (el.dataset.format === 'percent') {
      el.textContent = value.toFixed(0) + ' %';
    } else if (el.dataset.suffix) {
      el.textContent = value.toFixed(el.dataset.decimals || 0) + el.dataset.suffix;
    } else {
      el.textContent = formatNum(value, el.dataset.decimals || 0);
    }

    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.counter').forEach(el => counterObserver.observe(el));
