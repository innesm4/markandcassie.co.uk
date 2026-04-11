/* ============================================
   HONEYMOON FUND - Mark & Cassie
   Lightweight JS for the honeymoon page.
   ============================================ */

(function () {
  'use strict';

  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const TOUCH = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  /* -------------------------------------------------------
     CONFETTI - on card click
     ------------------------------------------------------- */
  function pop(e) {
    if (REDUCED || typeof confetti !== 'function') return;
    const r = (e.currentTarget || e.target).getBoundingClientRect();
    confetti({
      particleCount: 40, spread: 60, ticks: 80,
      origin: { x: (r.left + r.width / 2) / innerWidth, y: (r.top + r.height / 2) / innerHeight },
      colors: ['#d4202c', '#f5e642', '#0066a4', '#1a9e3f', '#e8861a', '#17a6d4'],
    });
  }

  document.querySelectorAll('.activity-card').forEach(card => {
    card.addEventListener('click', pop);
  });

  /* -------------------------------------------------------
     CONFETTI - page load
     ------------------------------------------------------- */
  if (!REDUCED && typeof confetti === 'function') {
    const colors = ['#48c9b0', '#87ceeb', '#f5e642', '#e8861a', '#17a6d4', '#0066a4'];
    setTimeout(() => confetti({ particleCount: 50, spread: 70, origin: { y: 0.3, x: 0.3 }, colors, ticks: 120 }), 600);
    setTimeout(() => confetti({ particleCount: 40, spread: 80, origin: { y: 0.25, x: 0.7 }, colors, ticks: 120 }), 900);
  }

  /* -------------------------------------------------------
     GSAP ANIMATIONS
     ------------------------------------------------------- */
  if (!REDUCED && typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    // Animate [data-animate] elements
    document.querySelectorAll('[data-animate]').forEach(el => {
      const delay = parseFloat(el.dataset.delay) || 0;
      const isLeft = el.dataset.animate === 'fade-left';
      const from = { opacity: 0, ...(isLeft ? { x: 80 } : { y: 50 }) };
      const to = { opacity: 1, x: 0, y: 0, duration: 0.9, delay, ease: 'power3.out' };

      if (el.closest('.honeymoon-hero')) {
        gsap.fromTo(el, from, to);
      } else {
        gsap.fromTo(el, from, { ...to, scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
      }
    });

    // Map card gentle float
    const mapCard = document.querySelector('.map-card');
    if (mapCard) {
      gsap.to(mapCard, { y: -6, duration: 3.5, repeat: -1, yoyo: true, ease: 'sine.inOut' });
    }

    // 3D tilt on hover - activity cards + map card
    const tiltTargets = document.querySelectorAll('.activity-card, .map-card');
    tiltTargets.forEach(card => {
      card.style.transformStyle = 'preserve-3d';
      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const rx = ((e.clientY - rect.top) / rect.height - 0.5) * -8;
        const ry = ((e.clientX - rect.left) / rect.width - 0.5) * 8;
        gsap.to(card, { rotateX: rx, rotateY: ry, scale: 1.025, duration: 0.35, ease: 'power2.out', transformPerspective: 700 });
      });
      card.addEventListener('mouseleave', () => {
        gsap.to(card, { rotateX: 0, rotateY: 0, scale: 1, duration: 0.5, ease: 'elastic.out(1, 0.5)' });
      });
    });

    // Back link bounce
    const backLink = document.querySelector('.back-link');
    if (backLink) {
      backLink.addEventListener('mouseenter', () => gsap.to(backLink, { x: -4, duration: 0.25, ease: 'back.out(4)' }));
      backLink.addEventListener('mouseleave', () => gsap.to(backLink, { x: 0, duration: 0.35, ease: 'power2.out' }));
    }

    // Confetti pieces drift
    document.querySelectorAll('.confetti-piece').forEach(p => {
      gsap.to(p, {
        y: 30 + Math.random() * 40,
        rotation: '+=90',
        ease: 'none',
        scrollTrigger: { trigger: '.honeymoon-hero', start: 'top top', end: 'bottom top', scrub: 1 },
      });
    });

  } else {
    // Reduced motion fallback
    document.querySelectorAll('[data-animate]').forEach(el => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
  }

  /* -------------------------------------------------------
     CURSOR PARTICLES (desktop only)
     ------------------------------------------------------- */
  if (!REDUCED && !TOUCH) {
    const cvs = document.getElementById('particle-canvas');
    if (cvs) {
      const ctx = cvs.getContext('2d');
      let parts = [];
      const colors = ['#48c9b0', '#87ceeb', '#e8d5b7', '#f5e642', '#17a6d4'];

      const resize = () => { cvs.width = innerWidth; cvs.height = innerHeight; };
      resize();
      addEventListener('resize', resize);

      document.addEventListener('mousemove', e => {
        if (Math.random() > 0.55) {
          parts.push({
            x: e.clientX, y: e.clientY,
            vx: (Math.random() - 0.5) * 1.8,
            vy: (Math.random() - 0.5) * 1.8 - 0.8,
            life: 1, decay: 0.018 + Math.random() * 0.015,
            size: 2 + Math.random() * 3.5, rot: Math.random() * 6.28,
            color: colors[Math.floor(Math.random() * colors.length)],
          });
        }
      });

      (function loop() {
        ctx.clearRect(0, 0, cvs.width, cvs.height);
        for (let i = parts.length - 1; i >= 0; i--) {
          const p = parts[i];
          p.x += p.vx; p.y += p.vy; p.vy += 0.035; p.life -= p.decay; p.rot += 0.05;
          if (p.life <= 0) { parts.splice(i, 1); continue; }
          ctx.save();
          ctx.globalAlpha = p.life * 0.55;
          ctx.fillStyle = p.color;
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
          ctx.restore();
        }
        if (parts.length > 80) parts.splice(0, parts.length - 80);
        requestAnimationFrame(loop);
      })();
    }
  }

})();
