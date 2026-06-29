/* ============================================================
   NTSL — script.js  |  Global JS for all pages
   ============================================================ */

'use strict';

/* ── Nav scroll effect ── */
(function () {
  const nav = document.querySelector('.nav');
  if (!nav) return;
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 20);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ── Mobile burger ── */
(function () {
  const burger  = document.getElementById('navBurger');
  const mobile  = document.getElementById('navMobile');
  if (!burger || !mobile) return;
  burger.addEventListener('click', () => {
    const open = mobile.classList.toggle('open');
    burger.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });
  // close on link click
  mobile.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      mobile.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
})();

/* ── Active nav link ── */
(function () {
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav__link').forEach(a => {
    const href = a.getAttribute('href');
    if (href === page || (page === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });
})();

/* ── Scroll reveal ── */
(function () {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } });
  }, { threshold: 0.12 });
  els.forEach(el => io.observe(el));
})();

/* ── Hero Particle Canvas ── */
(function () {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];
  const mouse = { x: -9999, y: -9999 };

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
    buildParticles();
  }

  function buildParticles() {
    const count = Math.min(Math.floor(W * H / 7500), 130);
    particles = Array.from({ length: count }, () => ({
      x:  Math.random() * W,
      y:  Math.random() * H,
      vx: (Math.random() - .5) * .35,
      vy: (Math.random() - .5) * .35,
      r:  Math.random() * 1.8 + .8,
      op: Math.random() * .35 + .1,
      node: Math.random() > .65,
    }));
  }

  canvas.addEventListener('mousemove', e => {
    const r = canvas.getBoundingClientRect();
    mouse.x = e.clientX - r.left;
    mouse.y = e.clientY - r.top;
  });
  canvas.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999; });
  canvas.addEventListener('touchmove', e => {
    const t = e.touches[0];
    const r = canvas.getBoundingClientRect();
    mouse.x = t.clientX - r.left;
    mouse.y = t.clientY - r.top;
  }, { passive: true });

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Background gradient
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, '#F8F9FF');
    bg.addColorStop(1, '#EDF2FF');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Update particles
    for (const p of particles) {
      const dx = mouse.x - p.x, dy = mouse.y - p.y;
      const d  = Math.sqrt(dx * dx + dy * dy);
      if (d < 130) { p.vx -= (dx / d) * .045; p.vy -= (dy / d) * .045; }
      p.vx *= .98; p.vy *= .98;
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
    }

    // Connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < 125) {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(37,99,235,${(1 - d / 125) * .13})`;
          ctx.lineWidth = .6;
          ctx.stroke();
        }
      }
    }

    // Dots
    for (const p of particles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.node ? p.r + 1 : p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.node
        ? `rgba(37,99,235,${p.op * .9})`
        : `rgba(10,15,46,${p.op * .3})`;
      ctx.fill();
    }

    // Mouse glow
    if (mouse.x > 0 && mouse.x < W) {
      const mg = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 110);
      mg.addColorStop(0, 'rgba(37,99,235,0.07)');
      mg.addColorStop(1, 'transparent');
      ctx.fillStyle = mg;
      ctx.fillRect(0, 0, W, H);
    }

    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  resize();
  draw();
})();

/* ── Counter animation (stat cards) ── */
(function () {
  const cards = document.querySelectorAll('.stat-card__num');
  if (!cards.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el  = e.target;
      const raw = el.dataset.count;
      if (!raw) return;
      const target = parseInt(raw, 10);
      let   cur    = 0;
      const step   = Math.ceil(target / 40);
      const tick   = () => {
        cur = Math.min(cur + step, target);
        el.querySelector('.count-val').textContent = cur;
        if (cur < target) requestAnimationFrame(tick);
      };
      tick();
      io.unobserve(el);
    });
  }, { threshold: .5 });
  cards.forEach(c => io.observe(c));
})();

/* ── Contact form ── */
(function () {
  const form = document.getElementById('contactForm');
  if (!form) return;
  const toast = document.getElementById('formToast');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = form.querySelector('.btn-primary');
    btn.textContent = 'Sending…';
    btn.disabled = true;
    // Simulate async send
    setTimeout(() => {
      form.reset();
      btn.textContent = 'Send Message →';
      btn.disabled = false;
      if (toast) {
        toast.classList.add('toast--show');
        setTimeout(() => toast.classList.remove('toast--show'), 4000);
      }
    }, 1200);
  });
})();
