/* ============================================================
   DELONCA CONSULTING — app.js
   Navigation, scroll reveal, simulators, FAQ
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
  mobileMenu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      burger.classList.remove('open');
      mobileMenu.classList.remove('open');
      burger.setAttribute('aria-expanded', false);
    });
  });
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

// taux Livret A à mettre à jour si évolution officielle
const LIVRET_A_RATE = 0.015;

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

  const capitalDisplayEl = el.querySelector('#ic-capital-display');
  const resultVal        = el.querySelector('#ic-result');
  const gainVal          = el.querySelector('#ic-gain');
  const apportVal        = el.querySelector('#ic-apport');
  const gainPctEl        = el.querySelector('#ic-gain-pct');
  const phraseEl         = el.querySelector('#ic-phrase');

  let icChart = null;

  function calc() {
    const C  = parseFloat(inputs.capital.value)   || 0;
    const M  = parseFloat(inputs.mensuel.value)    || 0;
    const r  = parseFloat(inputs.rendement.value)  / 100;
    const n  = parseInt(inputs.duree.value);
    const rm = r / 12;

    // Build year-by-year data
    const compoundData = [C];
    const linearData   = [C];
    let running = C;
    for (let y = 1; y <= n; y++) {
      for (let m = 0; m < 12; m++) {
        running = running * (1 + rm) + M;
      }
      compoundData.push(running);
      linearData.push(C + M * y * 12);
    }

    const total       = running;
    const apportTotal = C + M * n * 12;
    const gain        = total - apportTotal;
    const gainPct     = total > 0 ? (gain / total) * 100 : 0;

    if (capitalDisplayEl) capitalDisplayEl.textContent = formatEuro(C);
    resultVal.textContent = formatEuro(total);
    gainVal.textContent   = formatEuro(gain);
    apportVal.textContent = formatEuro(apportTotal);
    if (gainPctEl) gainPctEl.textContent = gainPct.toFixed(0) + ' %';
    if (phraseEl) {
      phraseEl.textContent = `Sur ${formatEuro(total)} finaux, ${formatEuro(apportTotal)} proviennent de vos versements et ${formatEuro(gain)} des intérêts composés.`;
    }

    if (displays.rendement) displays.rendement.textContent = (r * 100) + ' %';
    if (displays.duree)     displays.duree.textContent = n + ' ans';

    drawChart(n, linearData, compoundData);
  }

  function drawChart(n, linearData, compoundData) {
    const canvas = el.querySelector('#ic-chart');
    if (!canvas || typeof Chart === 'undefined') return;

    const labels = Array.from({ length: n + 1 }, (_, i) => i);

    if (icChart) {
      icChart.data.labels = labels;
      icChart.data.datasets[0].data = linearData;
      icChart.data.datasets[1].data = compoundData;
      icChart.update();
      return;
    }

    icChart = new Chart(canvas, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Capital versé',
            data: linearData,
            borderColor: 'rgba(138,143,168,0.55)',
            backgroundColor: 'transparent',
            borderWidth: 2,
            pointRadius: 0,
            tension: 0,
          },
          {
            label: 'Capital avec intérêts composés',
            data: compoundData,
            borderColor: '#C9A84C',
            backgroundColor: 'rgba(201,168,76,0.07)',
            borderWidth: 2.5,
            pointRadius: 0,
            tension: 0.3,
            fill: true,
          }
        ]
      },
      options: {
        animation: { duration: 500 },
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: {
              color: 'rgba(234,230,220,0.7)',
              font: { family: 'Outfit, sans-serif', size: 11 },
              boxWidth: 12,
            }
          },
          tooltip: {
            callbacks: {
              label: (ctx) => ' ' + ctx.dataset.label + ' : ' + formatEuro(ctx.parsed.y)
            }
          }
        },
        scales: {
          x: {
            title: { display: true, text: 'Années', color: 'rgba(138,143,168,0.7)', font: { size: 10 } },
            ticks: { color: 'rgba(138,143,168,0.7)', font: { family: 'Outfit, sans-serif', size: 10 } },
            grid: { color: 'rgba(255,255,255,0.04)' }
          },
          y: {
            ticks: {
              color: 'rgba(138,143,168,0.7)',
              font: { family: 'Outfit, sans-serif', size: 10 },
              callback: (v) => new Intl.NumberFormat('fr-FR', {
                notation: 'compact', maximumSignificantDigits: 3
              }).format(v) + ' €'
            },
            grid: { color: 'rgba(255,255,255,0.04)' }
          }
        }
      }
    });
  }

  Object.values(inputs).forEach(i => i && i.addEventListener('input', calc));
  calc();
})();

// ── SIMULATOR B — Inflation vs Épargne ──────────────────────
(function () {
  const el = document.getElementById('sim-inflation');
  if (!el) return;

  const inputs = {
    capital: el.querySelector('#inf-capital'),
    taux:    el.querySelector('#inf-taux'),
    duree:   el.querySelector('#inf-duree'),
  };
  const displays = {
    taux:  el.querySelector('#inf-taux-val'),
    duree: el.querySelector('#inf-duree-val'),
  };

  const nominalEl = el.querySelector('#inf-nominal');
  const reelEl    = el.querySelector('#inf-reel');
  const perteEl   = el.querySelector('#inf-perte');

  let infChart = null;

  function calc() {
    const C   = parseFloat(inputs.capital.value) || 0;
    const inf = parseFloat(inputs.taux.value) / 100;
    const n   = parseInt(inputs.duree.value);

    if (displays.taux)  displays.taux.textContent  = (inf * 100).toFixed(1) + ' %';
    if (displays.duree) displays.duree.textContent = n + ' ans';

    const reelFinal = C / Math.pow(1 + inf, n);
    const perte     = C - reelFinal;
    const pertePct  = C > 0 ? (perte / C) * 100 : 0;

    if (nominalEl) nominalEl.textContent = formatEuro(C);
    if (reelEl)    reelEl.textContent    = formatEuro(reelFinal);
    if (perteEl)   perteEl.textContent   = '−' + formatEuro(perte) + ' (−' + pertePct.toFixed(0) + ' %)';

    const nominalData = Array.from({ length: n + 1 }, () => C);
    const reelData    = Array.from({ length: n + 1 }, (_, y) => C / Math.pow(1 + inf, y));

    drawChart(n, nominalData, reelData);
  }

  function drawChart(n, nominalData, reelData) {
    const canvas = el.querySelector('#inf-chart');
    if (!canvas || typeof Chart === 'undefined') return;

    const labels = Array.from({ length: n + 1 }, (_, i) => i);

    if (infChart) {
      infChart.data.labels = labels;
      infChart.data.datasets[0].data = nominalData;
      infChart.data.datasets[1].data = reelData;
      infChart.update();
      return;
    }

    infChart = new Chart(canvas, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Valeur nominale',
            data: nominalData,
            borderColor: 'rgba(138,143,168,0.55)',
            backgroundColor: 'transparent',
            borderWidth: 2,
            borderDash: [5, 4],
            pointRadius: 0,
            tension: 0,
          },
          {
            label: 'Pouvoir d\'achat réel',
            data: reelData,
            borderColor: '#EF6060',
            backgroundColor: 'rgba(239,96,96,0.07)',
            borderWidth: 2.5,
            pointRadius: 0,
            tension: 0.2,
            fill: true,
          }
        ]
      },
      options: {
        animation: { duration: 500 },
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: {
              color: 'rgba(234,230,220,0.7)',
              font: { family: 'Outfit, sans-serif', size: 11 },
              boxWidth: 12,
            }
          },
          tooltip: {
            callbacks: {
              label: (ctx) => ' ' + ctx.dataset.label + ' : ' + formatEuro(ctx.parsed.y)
            }
          }
        },
        scales: {
          x: {
            title: { display: true, text: 'Années', color: 'rgba(138,143,168,0.7)', font: { size: 10 } },
            ticks: { color: 'rgba(138,143,168,0.7)', font: { family: 'Outfit, sans-serif', size: 10 } },
            grid: { color: 'rgba(255,255,255,0.04)' }
          },
          y: {
            ticks: {
              color: 'rgba(138,143,168,0.7)',
              font: { family: 'Outfit, sans-serif', size: 10 },
              callback: (v) => new Intl.NumberFormat('fr-FR', {
                notation: 'compact', maximumSignificantDigits: 3
              }).format(v) + ' €'
            },
            grid: { color: 'rgba(255,255,255,0.04)' }
          }
        }
      }
    });
  }

  Object.values(inputs).forEach(i => i && i.addEventListener('input', calc));
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

  const prix     = el.querySelector('#lo-prix');
  const apport   = el.querySelector('#lo-apport');
  const loyer    = el.querySelector('#lo-loyer');
  const taux     = el.querySelector('#lo-taux');
  const cashEl   = el.querySelector('#lo-cashflow');
  const yieldEl  = el.querySelector('#lo-yield');
  const effortEl = el.querySelector('#lo-effort');

  function calc() {
    const P = parseFloat(prix.value)   || 0;
    const A = parseFloat(apport.value) || 0;
    const L = parseFloat(loyer.value)  || 0;
    const T = parseFloat(taux.value) / 100 || 0.035;
    const dureeAns = 20;

    const emprunt = P - A;
    const rm = T / 12;
    const n  = dureeAns * 12;
    let mensualite = 0;
    if (emprunt > 0 && rm > 0) {
      mensualite = emprunt * (rm * Math.pow(1 + rm, n)) / (Math.pow(1 + rm, n) - 1);
    }

    const chargesEstim = L * 0.1;
    const cashflow  = L - mensualite - chargesEstim;
    const rendBrut  = P > 0 ? (L * 12 / P) * 100 : 0;

    cashEl.textContent   = formatEuro(cashflow);
    yieldEl.textContent  = rendBrut.toFixed(2) + ' %';
    effortEl.textContent = formatEuro(mensualite);

    cashEl.style.color = cashflow >= 0 ? '#C9A84C' : '#EF6060';
  }

  [prix, apport, loyer, taux].forEach(i => i && i.addEventListener('input', calc));
  calc();
})();

// ── Numbers counter animation ────────────────────────────────
function animateCounter(el) {
  const target   = parseFloat(el.dataset.target) || 0;
  const duration = 1600;
  const start    = performance.now();

  function update(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased    = 1 - Math.pow(1 - progress, 3);
    const value    = target * eased;

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
