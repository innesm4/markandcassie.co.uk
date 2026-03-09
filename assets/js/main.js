/* ============================================
   MARK & CASSIE - 18.04.26
   Over-engineered wedding JS.
   ============================================ */

(function () {
  'use strict';

  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const TOUCH = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const WEDDING = new Date('2026-04-18T13:00:00+01:00');

  /* -------------------------------------------------------
     COUNTDOWN
     ------------------------------------------------------- */
  function tick() {
    const diff = WEDDING - Date.now();
    if (diff <= 0) {
      const c = document.getElementById('countdown');
      const d = document.getElementById('countdown-done');
      if (c) c.hidden = true;
      if (d) d.hidden = false;
      if (!REDUCED && typeof confetti === 'function') {
        confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 } });
      }
      return;
    }
    const s = Math.floor(diff / 1000);
    setDigits('countdown-days',  String(Math.floor(s / 86400)).padStart(2, '0'));
    setDigits('countdown-hours', String(Math.floor((s % 86400) / 3600)).padStart(2, '0'));
    setDigits('countdown-mins',  String(Math.floor((s % 3600) / 60)).padStart(2, '0'));
    setDigits('countdown-secs',  String(s % 60).padStart(2, '0'));
  }

  function setDigits(id, val) {
    const el = document.getElementById(id);
    if (!el) return;
    const digits = el.querySelectorAll('.flip-digit');
    digits.forEach((d, i) => {
      const ch = val[i] || '0';
      if (d.textContent !== ch) {
        if (!REDUCED) {
          d.style.transform = 'translateY(-100%)';
          d.style.opacity = '0';
          requestAnimationFrame(() => {
            d.textContent = ch;
            d.style.transition = 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease';
            d.style.transform = 'translateY(0)';
            d.style.opacity = '1';
          });
        } else {
          d.textContent = ch;
        }
      }
    });
  }

  tick();
  setInterval(tick, 1000);

  /* -------------------------------------------------------
     CONFETTI - page load
     ------------------------------------------------------- */
  if (!REDUCED && typeof confetti === 'function') {
    const colors = ['#d4202c', '#0066a4', '#f5e642', '#1a9e3f', '#e8861a', '#7b4fa0', '#17a6d4'];
    setTimeout(() => confetti({ particleCount: 80, spread: 70, origin: { y: 0.3, x: 0.25 }, colors, ticks: 130 }), 500);
    setTimeout(() => confetti({ particleCount: 60, spread: 80, origin: { y: 0.2, x: 0.75 }, colors, ticks: 130 }), 800);
  }

  /* -------------------------------------------------------
     CONFETTI - on element click
     ------------------------------------------------------- */
  function pop(e) {
    if (REDUCED || typeof confetti !== 'function') return;
    const r = (e.currentTarget || e.target).getBoundingClientRect();
    confetti({
      particleCount: 35, spread: 55, ticks: 80,
      origin: { x: (r.left + r.width / 2) / innerWidth, y: (r.top + r.height / 2) / innerHeight },
      colors: ['#d4202c', '#f5e642', '#0066a4', '#1a9e3f'],
    });
  }

  const mapsBtn = document.getElementById('maps-btn');
  if (mapsBtn) mapsBtn.addEventListener('click', pop);

  /* -------------------------------------------------------
     SCROLL PROGRESS BAR
     ------------------------------------------------------- */
  const progressFill = document.getElementById('scroll-progress-fill');
  const progressLabel = document.querySelector('.scroll-progress-label');

  if (progressFill) {
    window.addEventListener('scroll', () => {
      const scrollTop = document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = Math.min((scrollTop / scrollHeight) * 100, 100);
      progressFill.style.width = pct + '%';

      if (progressLabel) {
        if (pct > 95) {
          progressLabel.classList.add('visible');
        } else {
          progressLabel.classList.remove('visible');
        }
      }
    }, { passive: true });
  }

  /* -------------------------------------------------------
     GSAP
     ------------------------------------------------------- */
  if (!REDUCED && typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    // Animate [data-animate] elements
    document.querySelectorAll('[data-animate]').forEach(el => {
      const delay = parseFloat(el.dataset.delay) || 0;
      const isLeft = el.dataset.animate === 'fade-left';
      const from = { opacity: 0, ...(isLeft ? { x: 80 } : { y: 50 }) };
      const to = { opacity: 1, x: 0, y: 0, duration: 0.9, delay, ease: 'power3.out' };

      if (el.closest('.hero')) {
        gsap.fromTo(el, from, to);
      } else {
        gsap.fromTo(el, from, { ...to, scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
      }
    });

    // Parallax photo strip
    document.querySelectorAll('.polaroid').forEach((p, i) => {
      gsap.to(p, {
        y: -15 - i * 12,
        ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1.2 },
      });
    });

    // Static confetti pieces drift slowly
    document.querySelectorAll('.confetti-piece').forEach(p => {
      gsap.to(p, {
        y: 30 + Math.random() * 40,
        rotation: '+=90',
        ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 },
      });
    });

    // Title deed gentle float
    const deed = document.querySelector('.title-deed');
    if (deed) {
      gsap.to(deed, { y: -8, duration: 3.5, repeat: -1, yoyo: true, ease: 'sine.inOut' });
    }

    // 3D tilt on hover - all cards
    const tiltTargets = document.querySelectorAll('.monopoly-card, .title-deed, .stationery-card, .chance-card');
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

    // Maps button bounce
    if (mapsBtn) {
      mapsBtn.addEventListener('mouseenter', () => gsap.to(mapsBtn, { scale: 1.06, duration: 0.25, ease: 'back.out(4)' }));
      mapsBtn.addEventListener('mouseleave', () => gsap.to(mapsBtn, { scale: 1, duration: 0.35, ease: 'power2.out' }));
    }

    // Ring icon subtle rock
    const ring = document.getElementById('ring-icon');
    if (ring) {
      gsap.to(ring, { rotation: 6, duration: 1, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 0.8 });
    }

    // Typewriter effect on deed times
    const deedRows = document.querySelectorAll('.deed-typewriter');
    if (deedRows.length) {
      deedRows.forEach(dd => {
        const fullText = dd.textContent;
        dd.textContent = '';
        dd.dataset.fullText = fullText;
      });

      ScrollTrigger.create({
        trigger: '#deed-list',
        start: 'top 80%',
        once: true,
        onEnter: () => {
          deedRows.forEach((dd, idx) => {
            const text = dd.dataset.fullText;
            let charIdx = 0;
            setTimeout(() => {
              dd.classList.add('typing');
              const interval = setInterval(() => {
                dd.textContent = text.slice(0, ++charIdx);
                if (charIdx >= text.length) {
                  clearInterval(interval);
                  dd.classList.remove('typing');
                  dd.classList.add('typed');
                }
              }, 60);
            }, idx * 400);
          });
        },
      });
    }

  } else {
    // Reduced motion fallback - show everything
    document.querySelectorAll('[data-animate]').forEach(el => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
  }

  /* -------------------------------------------------------
     3D DICE (with doubles detection)
     ------------------------------------------------------- */
  const scene = document.getElementById('dice-scene');
  const d1 = document.getElementById('dice-1');
  const d2 = document.getElementById('dice-2');
  const doublesMsg = document.getElementById('doubles-msg');

  const FACES = [
    'rotateX(0) rotateY(0)',
    'rotateX(0) rotateY(180deg)',
    'rotateX(0) rotateY(-90deg)',
    'rotateX(0) rotateY(90deg)',
    'rotateX(-90deg) rotateY(0)',
    'rotateX(90deg) rotateY(0)',
  ];

  function roll() {
    if (!d1 || !d2) return;
    const f1 = Math.floor(Math.random() * 6);
    const f2 = Math.floor(Math.random() * 6);

    [d1, d2].forEach((die, i) => {
      die.style.transition = 'none';
      die.style.transform = `rotateX(${720 + Math.random() * 360}deg) rotateY(${720 + Math.random() * 360}deg)`;
      requestAnimationFrame(() => requestAnimationFrame(() => {
        die.style.transition = `transform ${1.1 + i * 0.2}s cubic-bezier(0.23, 1, 0.32, 1)`;
        die.style.transform = FACES[i === 0 ? f1 : f2];
      }));
    });
    pop({ currentTarget: scene });

    // Doubles check
    if (f1 === f2 && doublesMsg) {
      setTimeout(() => {
        doublesMsg.hidden = false;
        doublesMsg.style.animation = 'none';
        doublesMsg.offsetHeight; // reflow
        doublesMsg.style.animation = '';
        if (!REDUCED && typeof confetti === 'function') {
          confetti({ particleCount: 200, spread: 120, origin: { y: 0.8 }, colors: ['#d4202c', '#0066a4', '#f5e642', '#1a9e3f', '#e8861a', '#7b4fa0'] });
        }
        setTimeout(() => { doublesMsg.hidden = true; }, 2500);
      }, 1300);
    }
  }

  if (scene) scene.addEventListener('click', roll);

  /* -------------------------------------------------------
     CURSOR PARTICLES (desktop only)
     ------------------------------------------------------- */
  if (!REDUCED && !TOUCH) {
    const cvs = document.getElementById('particle-canvas');
    if (cvs) {
      const ctx = cvs.getContext('2d');
      let parts = [];
      const colors = ['#d4202c', '#0066a4', '#f5e642', '#1a9e3f', '#e8861a'];

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

  /* -------------------------------------------------------
     CHANCE CARD
     ------------------------------------------------------- */
  const chanceCard = document.getElementById('chance-card');
  const chanceMsg = document.getElementById('chance-message');

  // Placeholder messages - Mark can customize these!
  const CHANCE_MESSAGES = [
    "Advance to the dance floor. Do not pass the bar. Do not collect a drink.",
    "You have won second prize in a beauty contest. First prize goes to the bride.",
    "Bank error in your favour. Collect one free drink.",
    "Go directly to the photo booth. Do not pass GO.",
    "It is your turn to make a speech. Just kidding.",
    "Community Chest: You remembered to use the map link. Well done.",
    "Pay a fine of one dance with the groom.",
    "Your satnav has failed you. Lose one turn.",
    "Advance to Logie Country House. Collect memories.",
    "You have been elected Chairman of the Ceilidh. Lead the next dance.",
    "Get out of the ceremony free. (Just kidding, sit down.)",
    "Bank pays you a dividend of cake.",
  ];
  let chanceIdx = Math.floor(Math.random() * CHANCE_MESSAGES.length);

  if (chanceCard && chanceMsg) {
    chanceCard.addEventListener('click', () => {
      chanceMsg.textContent = CHANCE_MESSAGES[chanceIdx];
      chanceIdx = (chanceIdx + 1) % CHANCE_MESSAGES.length;
      chanceCard.classList.toggle('flipped');
      pop({ currentTarget: chanceCard });
    });
  }

  /* -------------------------------------------------------
     CONFETTI CANNON + PARTY MODE
     ------------------------------------------------------- */
  const cannonBtn = document.getElementById('cannon-btn');
  let holdTimer = null;
  let partyActive = false;

  function fireCannon() {
    if (REDUCED || typeof confetti !== 'function') return;
    const colors = ['#d4202c', '#0066a4', '#f5e642', '#1a9e3f', '#e8861a', '#7b4fa0', '#17a6d4'];
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6, x: 0.5 }, colors });
    setTimeout(() => confetti({ particleCount: 80, angle: 60, spread: 55, origin: { x: 0 }, colors }), 150);
    setTimeout(() => confetti({ particleCount: 80, angle: 120, spread: 55, origin: { x: 1 }, colors }), 300);
    setTimeout(() => confetti({ particleCount: 120, spread: 100, origin: { y: 0.4, x: 0.5 }, colors, ticks: 200 }), 450);
    setTimeout(() => confetti({ particleCount: 60, angle: 90, spread: 160, origin: { y: 0.6 }, colors, startVelocity: 45 }), 600);
  }

  function startPartyMode() {
    if (REDUCED || partyActive) return;
    partyActive = true;
    document.body.classList.add('party-mode');

    const colors = ['#d4202c', '#0066a4', '#f5e642', '#1a9e3f', '#e8861a', '#7b4fa0', '#17a6d4'];
    let partyConfetti;

    // Continuous confetti streams
    function partyLoop() {
      if (!partyActive) return;
      confetti({ particleCount: 5, angle: 60, spread: 40, origin: { x: 0, y: Math.random() }, colors, ticks: 100 });
      confetti({ particleCount: 5, angle: 120, spread: 40, origin: { x: 1, y: Math.random() }, colors, ticks: 100 });
      confetti({ particleCount: 3, spread: 80, origin: { x: Math.random(), y: 0 }, colors, ticks: 80, gravity: 1.5 });
      partyConfetti = requestAnimationFrame(partyLoop);
    }
    partyLoop();

    // Page vibrate
    let vibeInterval;
    if (!TOUCH) {
      vibeInterval = setInterval(() => {
        const x = (Math.random() - 0.5) * 4;
        const y = (Math.random() - 0.5) * 4;
        document.body.style.transform = `translate(${x}px, ${y}px)`;
      }, 50);
    }

    // Auto-roll dice
    const diceInterval = setInterval(() => {
      if (partyActive) roll();
    }, 1500);

    // End after 5 seconds
    setTimeout(() => {
      partyActive = false;
      document.body.classList.remove('party-mode');
      document.body.style.transform = '';
      cancelAnimationFrame(partyConfetti);
      clearInterval(vibeInterval);
      clearInterval(diceInterval);

      // One final massive burst
      confetti({ particleCount: 300, spread: 180, origin: { y: 0.5 }, colors, startVelocity: 50, ticks: 300 });
    }, 5000);
  }

  if (cannonBtn) {
    // Tap = cannon, hold 2s = party mode
    cannonBtn.addEventListener('mousedown', () => {
      holdTimer = setTimeout(startPartyMode, 2000);
    });
    cannonBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      holdTimer = setTimeout(startPartyMode, 2000);
    }, { passive: false });

    const cancelHold = () => {
      if (holdTimer) { clearTimeout(holdTimer); holdTimer = null; }
    };

    cannonBtn.addEventListener('mouseup', () => {
      if (!partyActive) { cancelHold(); fireCannon(); }
      else { cancelHold(); }
    });
    cannonBtn.addEventListener('touchend', () => {
      if (!partyActive) { cancelHold(); fireCannon(); }
      else { cancelHold(); }
    });
    cannonBtn.addEventListener('mouseleave', cancelHold);
  }

  /* -------------------------------------------------------
     SHAKE TO CONFETTI (mobile)
     ------------------------------------------------------- */
  if (TOUCH && !REDUCED && typeof confetti === 'function') {
    let shakeTimeout;
    let lastX = 0, lastY = 0, lastZ = 0;
    let shakeCount = 0;
    const SHAKE_THRESHOLD = 25;

    function handleMotion(e) {
      const acc = e.accelerationIncludingGravity;
      if (!acc) return;

      const dx = Math.abs(acc.x - lastX);
      const dy = Math.abs(acc.y - lastY);
      const dz = Math.abs(acc.z - lastZ);

      if (dx + dy + dz > SHAKE_THRESHOLD) {
        shakeCount++;
        if (shakeCount > 3) {
          shakeCount = 0;
          const colors = ['#d4202c', '#0066a4', '#f5e642', '#1a9e3f', '#e8861a', '#7b4fa0'];
          confetti({ particleCount: 100, spread: 90, origin: { y: 0.5 }, colors });
          confetti({ particleCount: 60, angle: 60, spread: 55, origin: { x: 0 }, colors });
          confetti({ particleCount: 60, angle: 120, spread: 55, origin: { x: 1 }, colors });
        }
      }

      lastX = acc.x; lastY = acc.y; lastZ = acc.z;
      clearTimeout(shakeTimeout);
      shakeTimeout = setTimeout(() => { shakeCount = 0; }, 500);
    }

    // Request permission on iOS 13+
    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
      document.addEventListener('click', function requestMotion() {
        DeviceMotionEvent.requestPermission().then(state => {
          if (state === 'granted') window.addEventListener('devicemotion', handleMotion);
        }).catch(() => {});
        document.removeEventListener('click', requestMotion);
      }, { once: true });
    } else if (typeof DeviceMotionEvent !== 'undefined') {
      window.addEventListener('devicemotion', handleMotion);
    }
  }

  /* -------------------------------------------------------
     EASTER EGG: ALPACA (3x ring click)
     ------------------------------------------------------- */
  const ringEE = document.getElementById('ring-icon');
  const alpaca = document.getElementById('alpaca-easter-egg');
  let alpacaTimer, clicks = 0;

  if (ringEE && alpaca) {
    ringEE.addEventListener('click', () => {
      if (++clicks >= 3) {
        alpaca.classList.add('alpaca-peek');
        clearTimeout(alpacaTimer);
        alpacaTimer = setTimeout(() => alpaca.classList.remove('alpaca-peek'), 3500);
        clicks = 0;
      }
    });
  }

  /* -------------------------------------------------------
     EASTER EGG: KONAMI CODE
     ------------------------------------------------------- */
  const K = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','KeyB','KeyA'];
  let ki = 0;

  document.addEventListener('keydown', e => {
    if (e.code === K[ki]) { if (++ki === K.length) { ki = 0; konamiGo(); } }
    else ki = 0;
  });

  function konamiGo() {
    if (REDUCED) return;
    const end = Date.now() + 3000;
    (function f() {
      confetti({ particleCount: 7, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#d4202c','#0066a4','#f5e642','#1a9e3f','#e8861a','#7b4fa0'] });
      confetti({ particleCount: 7, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#d4202c','#0066a4','#f5e642','#1a9e3f','#e8861a','#7b4fa0'] });
      if (Date.now() < end) requestAnimationFrame(f);
    })();
    if (alpaca) {
      alpaca.classList.add('alpaca-peek');
      clearTimeout(alpacaTimer);
      alpacaTimer = setTimeout(() => alpaca.classList.remove('alpaca-peek'), 5000);
    }
  }

  /* -------------------------------------------------------
     CONFETTI RAIN - gentle falling pieces on venue section
     ------------------------------------------------------- */
  if (!REDUCED) {
    const rainCvs = document.getElementById('confetti-rain');
    if (rainCvs) {
      const rCtx = rainCvs.getContext('2d');
      const rainColors = ['#d4202c', '#0066a4', '#f5e642', '#1a9e3f', '#e8861a', '#7b4fa0', '#17a6d4'];
      let rainParts = [];
      let rainActive = false;

      function resizeRain() {
        const rect = rainCvs.parentElement.getBoundingClientRect();
        rainCvs.width = rect.width;
        rainCvs.height = rect.height;
      }
      resizeRain();
      addEventListener('resize', resizeRain);

      function spawnRain() {
        if (rainParts.length < 40) {
          rainParts.push({
            x: Math.random() * rainCvs.width,
            y: -10,
            vx: (Math.random() - 0.5) * 0.6,
            vy: 0.8 + Math.random() * 1.2,
            rot: Math.random() * 6.28,
            rotV: (Math.random() - 0.5) * 0.04,
            size: 4 + Math.random() * 6,
            color: rainColors[Math.floor(Math.random() * rainColors.length)],
            shape: Math.random() > 0.5 ? 'rect' : 'circle',
          });
        }
      }

      function drawRain() {
        if (!rainActive) return;
        rCtx.clearRect(0, 0, rainCvs.width, rainCvs.height);
        if (Math.random() > 0.7) spawnRain();

        for (let i = rainParts.length - 1; i >= 0; i--) {
          const p = rainParts[i];
          p.x += p.vx;
          p.y += p.vy;
          p.rot += p.rotV;
          p.vx += (Math.random() - 0.5) * 0.05;

          if (p.y > rainCvs.height + 10) { rainParts.splice(i, 1); continue; }

          rCtx.save();
          rCtx.globalAlpha = 0.6;
          rCtx.fillStyle = p.color;
          rCtx.translate(p.x, p.y);
          rCtx.rotate(p.rot);
          if (p.shape === 'circle') {
            rCtx.beginPath();
            rCtx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
            rCtx.fill();
          } else {
            rCtx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
          }
          rCtx.restore();
        }
        requestAnimationFrame(drawRain);
      }

      if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.create({
          trigger: '#venue',
          start: 'top 80%',
          end: 'bottom 20%',
          onEnter: () => { rainActive = true; drawRain(); },
          onLeave: () => { rainActive = false; },
          onEnterBack: () => { rainActive = true; drawRain(); },
          onLeaveBack: () => { rainActive = false; },
        });
      }
    }
  }

  /* -------------------------------------------------------
     HASH SCROLL
     ------------------------------------------------------- */
  if (location.hash === '#directions') {
    setTimeout(() => {
      const el = document.getElementById('directions');
      if (el) el.scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth' });
    }, 100);
  }

})();
