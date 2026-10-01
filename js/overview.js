(function () {
  /* NOTE: the ring-stage 3D carousel, custom cursor, Brand/Inspiration
     toggle, and Three.js blimp below are referenced in CSS/JS but have
     no corresponding markup in the current page — moved verbatim from
     the original file without alteration; see the site-split plan for
     the full note on this. */
  let currentPage = 'overview';

  /* ─── Landing header: Brand / Inspiration toggle ────── */
  function setOverviewView(view) {
    const brandBtn  = document.getElementById('ov-toggle-brand');
    const inspBtn   = document.getElementById('ov-toggle-inspiration');
    const brandView = document.getElementById('ov-view-brand');
    const inspView  = document.getElementById('ov-view-inspiration');
    const isBrand   = view === 'brand';
    brandBtn.classList.toggle('active', isBrand);
    inspBtn.classList.toggle('active', !isBrand);
    brandBtn.setAttribute('aria-selected', String(isBrand));
    inspBtn.setAttribute('aria-selected', String(!isBrand));
    brandView.style.display = isBrand ? '' : 'none';
    inspView.style.display  = isBrand ? 'none' : '';
  }

  /* ─── Ring landing (k95-style orbital carousel) ─────
     Three rings of cards (top / middle / bottom) orbit the 3D blimp on a
     shared cylinder. Scroll spins the cylinder in card-sized steps and it
     settles with one middle-ring card at the front, which grows into the
     featured card. A custom cursor (dot + pill) rides the stage.        */
  const RING_ROWS = {
    mid: [
      { src: 'assets/images/cv-purps-on-white.png',    label: 'Primary logo',         cat: 'Logo',       page: 'logo',       anchor: 'primary-logo' },
      { src: 'assets/images/type-halyard-display.jpg', label: 'Halyard Display',      cat: 'Typography', page: 'typography', anchor: 'our-typeface' },
      { src: 'assets/images/purps-use-jeep.jpg',       label: 'Purps in use',         cat: 'Colour',     page: 'color',      anchor: 'color-purps-in-use' },
      { src: 'assets/images/logo-action-1.jpg',        label: 'Logo in action',       cat: 'Logo',       page: 'logo',       anchor: 'logo-in-action' },
      { src: 'assets/images/combo-pink-top.jpg',       label: 'Suggested combinations', cat: 'Colour',   page: 'color',      anchor: 'color-combinations' },
      { src: 'assets/images/type-setting.jpg',         label: 'Type setting',         cat: 'Typography', page: 'typography', anchor: 'type-setting' },
      { src: 'assets/images/app-tile-avatars.png',     label: 'App tile & avatars',   cat: 'Logo',       page: 'logo',       anchor: 'app-tile' },
      { src: 'assets/images/alignment-3.jpg',          label: 'Brand in the wild',    cat: 'Typography', page: 'typography', anchor: 'typo-alignment' },
      { src: 'assets/images/cv-white-on-image.jpg',    label: 'Colour variants',      cat: 'Logo',       page: 'logo',       anchor: 'colour-variants' },
      { src: 'assets/images/cobrand-lockup.jpg',       label: 'Co-brand lockup',      cat: 'Logo',       page: 'logo',       anchor: 'co-brand-lockup' }
    ],
    top: [
      { src: 'assets/images/combo-green-bot.jpg',      label: 'Green mood',           cat: 'Colour',     page: 'color',      anchor: 'color-combinations' },
      { src: 'assets/images/alignment-5.jpg',          label: 'App empty states',     cat: 'Typography', page: 'typography', anchor: 'typo-alignment' },
      { src: 'assets/images/purps-use-pocketguide.jpg',label: 'Pocket guide',         cat: 'Colour',     page: 'color',      anchor: 'color-purps-in-use' },
      { src: 'assets/images/minsize-digital.jpg',      label: 'Minimum size',         cat: 'Logo',       page: 'logo',       anchor: 'minimum-size' },
      { src: 'assets/images/alignment-1.jpg',          label: 'YouTube channel',      cat: 'Typography', page: 'typography', anchor: 'typo-alignment' }
    ],
    bottom: [
      { src: 'assets/images/combo-yellow-top.jpg',     label: 'Yellow mood',          cat: 'Colour',     page: 'color',      anchor: 'color-combinations' },
      { src: 'assets/images/alignment-4.jpg',          label: 'Homies Day',           cat: 'Typography', page: 'typography', anchor: 'typo-alignment' },
      { src: 'assets/images/cv-white-on-purps.png',    label: 'White on Purps',       cat: 'Logo',       page: 'logo',       anchor: 'colour-variants' },
      { src: 'assets/images/alignment-6.jpg',          label: 'Dex keynote',          cat: 'Typography', page: 'typography', anchor: 'typo-alignment' },
      { src: 'assets/images/type-halyard-text.jpg',    label: 'Halyard Text',         cat: 'Typography', page: 'typography', anchor: 'our-typeface' }
    ]
  };
  const RING_TOTAL = RING_ROWS.mid.length + RING_ROWS.top.length + RING_ROWS.bottom.length;
  const MID_STEP = 360 / RING_ROWS.mid.length;

  let ringAngle = 0, ringTarget = 0, ringIntro = 0;
  let mouseX = 0, mouseY = 0;
  const ringEls = [];            // { el, phi, row(-1/0/1), sizeMul, data, midIndex }
  let featuredEl = null, featuredData = null;
  let lastWheelAt = 0, snapped = true;

  function ringGo(data) {
    navigate(data.page);
    if (data.anchor) setTimeout(() => {
      const t = document.getElementById(data.anchor);
      if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
  }
  function angleFromFront(phi) { return ((phi + ringAngle) % 360 + 540) % 360 - 180; }

  function makeCard(c, row, phi) {
    const el = document.createElement('div');
    el.className = 'c3d';
    el.setAttribute('role', 'button');
    el.setAttribute('tabindex', '0');
    el.setAttribute('aria-label', c.label + ' — ' + c.cat);
    el.innerHTML = '<div class="rc-inner"><img src="' + c.src + '" alt="" draggable="false" /></div>';
    const go = () => {
      if (el === featuredEl) { ringGo(c); return; }
      // Any other card: spin the ring so it comes to the front
      ringTarget = ringAngle - angleFromFront(phi);
      if (row !== 0) ringTarget = Math.round(ringTarget / MID_STEP) * MID_STEP;
      snapped = true;
    };
    el.addEventListener('click', go);
    el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
    return el;
  }

  function buildRing() {
    const cyl = document.getElementById('r3-cyl');
    if (!cyl || ringEls.length) return;
    const rows = [['mid', 0, 1.0], ['top', -1, 0.62], ['bottom', 1, 0.62]];
    rows.forEach(([key, row, sizeMul]) => {
      const list = RING_ROWS[key], n = list.length;
      list.forEach((c, i) => {
        // middle ring starts with card 0 at the front; outer rings are offset half a step
        const phi = -(i * 360 / n) + (row === 0 ? 0 : 180 / n);
        const el = makeCard(c, row, phi);
        cyl.appendChild(el);
        ringEls.push({ el, phi, row, sizeMul, data: c, midIndex: row === 0 ? i : -1 });
      });
    });
  }

  let lastLayoutKey = '';
  function ringFrame() {
    if (currentPage === 'overview' && ringEls.length) {
      const stage = document.getElementById('ring-stage');
      const w = stage.clientWidth, h = stage.clientHeight;

      // Snap to the nearest middle-ring card once the wheel goes quiet
      if (!snapped && performance.now() - lastWheelAt > 140) {
        ringTarget = Math.round(ringTarget / MID_STEP) * MID_STEP;
        snapped = true;
      }
      ringAngle += (ringTarget - ringAngle) * 0.075;   // eased follow (the k95 "weight")
      ringIntro += (1 - ringIntro) * 0.04;
      const ease = 1 - Math.pow(1 - ringIntro, 3);

      const R = Math.min(h * 0.80, w * 0.40);           // cylinder radius
      const Re = R * ease;
      const cwMid = Math.max(84, Math.min(150, R * 0.30)); // portrait card width (mid ring)
      const chMid = cwMid * 1.33;
      const featScale = (h * 0.54) / chMid;             // featured card fills ~54% of the stage height

      const layoutKey = w + 'x' + h + '@' + (ease < 0.999 ? ease.toFixed(3) : '1');
      if (layoutKey !== lastLayoutKey) {
        lastLayoutKey = layoutKey;
        stage.style.setProperty('--feat-scale', featScale.toFixed(3));
        ringEls.forEach(c => {
          const cw = cwMid * c.sizeMul, ch = cw * 1.33;
          const y = c.row * (R * 0.60);
          c.el.style.width = cw + 'px';
          c.el.style.height = ch + 'px';
          c.el.style.marginLeft = (-cw / 2) + 'px';
          c.el.style.marginTop = (-ch / 2) + 'px';
          c.el.style.opacity = Math.min(1, ease * 1.3);
          c.el.style.transform = 'rotateY(' + c.phi + 'deg) translateZ(' + Re + 'px) translateY(' + y + 'px)';
        });
      }

      document.getElementById('r3-cyl').style.transform = 'rotateY(' + ringAngle + 'deg)';
      document.getElementById('r3-world').style.transform =
        'rotateX(' + (mouseY * -3) + 'deg) rotateY(' + (mouseX * 4) + 'deg)';

      // Featured card: the middle-ring card at the front, once the ring has settled
      const settled = Math.abs(ringTarget - ringAngle) < 2.5 && ease > 0.95;
      let front = null, bestD = 1e9;
      ringEls.forEach(c => {
        if (c.row !== 0) return;
        const d = Math.abs(angleFromFront(c.phi));
        if (d < bestD) { bestD = d; front = c; }
      });
      const nextFeatured = (settled && front && bestD < MID_STEP * 0.45) ? front : null;
      if ((nextFeatured && nextFeatured.el) !== featuredEl) {
        if (featuredEl) featuredEl.classList.remove('featured');
        featuredEl = nextFeatured ? nextFeatured.el : null;
        featuredData = nextFeatured ? nextFeatured.data : null;
        if (featuredEl) featuredEl.classList.add('featured');
        stage.classList.toggle('has-featured', !!featuredEl);
      }
      // Cards passing behind the blimp fade a touch so the centre stays readable
      ringEls.forEach(c => {
        const a = Math.abs(angleFromFront(c.phi));
        c.el.style.opacity = ease < 0.999 ? Math.min(1, ease * 1.3) : (a > 150 ? 0.45 : 1);
      });

      const counter = document.getElementById('ring-counter');
      if (counter && front) counter.textContent = String(front.midIndex + 1).padStart(2, '0') + ' / ' + String(RING_ROWS.mid.length).padStart(2, '0') + '  ·  ' + front.data.label;
    }
    requestAnimationFrame(ringFrame);
  }

  const ringStage = document.getElementById('ring-stage');
  if (ringStage) {
    ringStage.addEventListener('wheel', e => {
      e.preventDefault();
      ringTarget += e.deltaY * 0.08;
      lastWheelAt = performance.now(); snapped = false;
    }, { passive: false });
    let lastTouchY = null;
    ringStage.addEventListener('touchstart', e => { lastTouchY = e.touches[0].clientY; }, { passive: true });
    ringStage.addEventListener('touchmove', e => {
      if (lastTouchY !== null) {
        ringTarget += (lastTouchY - e.touches[0].clientY) * 0.25;
        lastTouchY = e.touches[0].clientY;
        lastWheelAt = performance.now(); snapped = false;
      }
    }, { passive: true });
    ringStage.addEventListener('touchend', () => { lastTouchY = null; });
    window.addEventListener('keydown', e => {
      if (currentPage !== 'overview') return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { ringTarget = Math.round(ringTarget / MID_STEP) * MID_STEP + MID_STEP; snapped = true; }
      if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   { ringTarget = Math.round(ringTarget / MID_STEP) * MID_STEP - MID_STEP; snapped = true; }
      if (e.key === 'Enter' && featuredData && document.activeElement === document.body) ringGo(featuredData);
    });

    /* Custom cursor: yellow dot + pill. Pill says SCROLL, or the card's name over the featured card. */
    const cur = document.getElementById('k-cursor');
    const curDot = cur && cur.querySelector('.k-dot');
    const curPill = cur && cur.querySelector('.k-pill');
    let cx = 0, cy = 0, dx = 0, dy = 0, tx = 0, ty = 0, inside = false, overFeatured = false;
    ringStage.addEventListener('mousemove', e => {
      const r = ringStage.getBoundingClientRect();
      mouseX = (e.clientX - r.left) / r.width - 0.5;
      mouseY = (e.clientY - r.top) / r.height - 0.5;
      tx = e.clientX; ty = e.clientY;
      if (!inside) { inside = true; cx = dx = tx; cy = dy = ty; cur && cur.classList.add('on'); }
      const hit = e.target.closest && e.target.closest('.c3d.featured');
      const nowOver = !!hit;
      if (nowOver !== overFeatured) {
        overFeatured = nowOver;
        cur && cur.classList.toggle('over', nowOver);
        if (curPill) curPill.innerHTML = nowOver && featuredData
          ? '<span class="k-arrow">&#8599;</span><span class="k-text"><b>' + featuredData.label + '</b><small>' + featuredData.cat + '</small></span>'
          : '<span class="k-text">Scroll</span>';
      }
    });
    ringStage.addEventListener('mouseleave', () => { inside = false; cur && cur.classList.remove('on'); });
    (function cursorTick() {
      dx += (tx - dx) * 0.55; dy += (ty - dy) * 0.55;   // dot: snappy
      cx += (tx - cx) * 0.16; cy += (ty - cy) * 0.16;   // pill: trails
      if (curDot)  curDot.style.transform  = 'translate(' + dx + 'px,' + dy + 'px) translate(-50%,-50%)';
      if (curPill) curPill.style.transform = 'translate(' + (cx + 22) + 'px,' + cy + 'px) translate(0,-50%)';
      requestAnimationFrame(cursorTick);
    })();
  }

  /* ─── Hero intro: lines rise in on load / re-entry ── */
  function playHeroIntro() {
    const hero = document.getElementById('ov-hero');
    if (!hero) return;
    const inner = document.getElementById('ov-hero-inner');
    if (inner) { inner.style.transform = ''; inner.style.opacity = ''; }
    const cue = document.getElementById('ov-scroll-cue');
    if (cue) cue.style.opacity = '';
    hero.classList.remove('intro-done');
    void hero.offsetWidth; // force reflow so the animation replays
    setTimeout(() => hero.classList.add('intro-done'), 60);
  }

  /* ─── Pinned hero: scale + fade as tiles scroll over ─ */
  const mainScrollEl = document.getElementById('main-scroll');
  function heroParallax() {
    if (currentPage !== 'overview') return;
    const inner = document.getElementById('ov-hero-inner');
    const cue = document.getElementById('ov-scroll-cue');
    if (!inner) return;
    const st = mainScrollEl.scrollTop || window.scrollY || 0;
    const p = Math.min(st / (window.innerHeight * 0.85), 1);
    inner.style.transform = 'scale(' + (1 - 0.08 * p) + ') translateY(' + (-36 * p) + 'px)';
    inner.style.opacity = String(1 - 0.9 * p);
    if (cue) cue.style.opacity = String(Math.max(0, 1 - p * 2.5));
  }
  mainScrollEl.addEventListener('scroll', heroParallax, { passive: true });
  window.addEventListener('scroll', heroParallax, { passive: true });

  /* ─── Tile scroll animations ─────────────────────── */
  function triggerBentoAnimations() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('bento-visible');
        }
      });
    }, { threshold: 0.05 });
    document.querySelectorAll('.bento-card').forEach(c => observer.observe(c));
  }

  window.addEventListener('DOMContentLoaded', () => {
    buildRing();
    requestAnimationFrame(ringFrame);
  });

  /* ─── Keyboard support for landing cards ─────────── */
  document.querySelectorAll('.bento-card').forEach(card => {
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); card.click(); }
    });
  });
})();
