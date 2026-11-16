/* Colour + Typography page behaviours (ported from the Netlify build).
   Every block checks for its element first, so this file is safe on any page.
   Shell behaviours (nav, index rail, mobile sheet) live in logo.js. */
(function () {
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var C = '../assets/color/', T = '../assets/typography/';

  /* ─── Media carousels ─── */
  var CAROUSELS = {
    purps: [
      { type: 'image', src: C + 'purps-use-hero.jpg', alt: 'Headout tote bag on the street' },
      { type: 'video', src: C + 'purps-use-tabs.mp4', alt: 'Headout app tabs in Purps' },
      { type: 'image', src: C + 'purps-use-suitcase.jpg', alt: 'Traveller with a Headout-branded suitcase' },
      { type: 'image', src: C + 'purps-use-jeep.jpg', alt: 'Headout-branded SUV on a desert dune safari' },
      { type: 'image', src: C + 'purps-use-pocketguide.jpg', alt: 'Headout Purps pocket guide in a jacket pocket' },
      { type: 'video', src: C + 'purps-use-appicon-loop.mp4', alt: 'Headout app icon animation' },
      { type: 'video', src: C + 'purps-use-3.mp4', alt: 'Purps in a Headout campaign' }
    ],
    secondary: [
      { type: 'video', src: C + 'secondary-use-1.mp4', alt: 'Secondary colours in use, example 1' },
      { type: 'video', src: C + 'secondary-use-2.mp4', alt: 'Secondary colours in use, example 2' },
      { type: 'video', src: C + 'secondary-use-3.mp4', alt: 'Secondary colours in use, example 3' },
      { type: 'video', src: C + 'secondary-use-4.mp4', alt: 'Secondary colours in use, example 4' },
      { type: 'video', src: C + 'secondary-use-5.mp4', alt: 'Secondary colours in use, example 5' }
    ],
    alignment: [
      { type: 'image', src: T + 'alignment-5.jpg', alt: 'Left-aligned headline and body copy' },
      { type: 'image', src: T + 'alignment-3.jpg', alt: 'Alignment example' },
      { type: 'image', src: T + 'alignment-1.jpg', alt: 'Alignment example' },
      { type: 'image', src: T + 'alignment-4.jpg', alt: 'Alignment example' },
      { type: 'image', src: T + 'alignment-2.jpg', alt: 'Alignment example' },
      { type: 'image', src: T + 'alignment-6.jpg', alt: 'Alignment example' }
    ]
  };

  var ICON = {
    prev: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M15 5l-7 7 7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    next: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9 5l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    expand: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    close: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
  };

  function mediaEl(s, cover) {
    var el;
    if (s.type === 'video') {
      el = document.createElement('video');
      el.muted = true; el.loop = true; el.playsInline = true; el.preload = 'metadata';
      if (!reduceMotion) el.autoplay = true;
      el.src = s.src; el.setAttribute('aria-label', s.alt || '');
    } else {
      el = document.createElement('img');
      el.src = s.src; el.alt = s.alt || ''; el.loading = 'lazy'; el.decoding = 'async';
    }
    el.style.objectFit = cover ? 'cover' : 'contain';
    return el;
  }

  var cars = document.querySelectorAll('.mcar[data-carousel]');
  if (cars.length) {
    // Lightbox (one per page)
    var lb = document.createElement('div');
    lb.className = 'mcar-lightbox'; lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-modal', 'true'); lb.setAttribute('aria-label', 'Expanded media');
    lb.innerHTML = '<button class="mlb-close" type="button" aria-label="Close">' + ICON.close + '</button>' +
      '<button class="mlb-nav prev" type="button" aria-label="Previous">' + ICON.prev + '</button>' +
      '<div class="mlb-stage"></div>' +
      '<button class="mlb-nav next" type="button" aria-label="Next">' + ICON.next + '</button>';
    document.body.appendChild(lb);
    var lbStage = lb.querySelector('.mlb-stage'), lbPrev = lb.querySelector('.prev'), lbNext = lb.querySelector('.next'), lbClose = lb.querySelector('.mlb-close');
    var lbSlides = [], lbIdx = 0, lbReturn = null;
    function lbRender() {
      lbStage.innerHTML = ''; lbStage.appendChild(mediaEl(lbSlides[lbIdx], false));
      lbPrev.disabled = lbIdx <= 0; lbNext.disabled = lbIdx >= lbSlides.length - 1;
    }
    var lbClearT;
    function lbOpen(slides, i, from) {
      clearTimeout(lbClearT);
      lbSlides = slides; lbIdx = i; lbReturn = from; lbRender();
      // Grow out of the carousel it came from: origin = carousel centre, in stage coordinates
      var src = from && from.closest('.mcar');
      if (src) {
        lb.classList.add('measuring');
        var r = src.getBoundingClientRect(), st = lbStage.getBoundingClientRect();
        lb.classList.remove('measuring');
        lbStage.style.transformOrigin = (r.left + r.width / 2 - st.left) + 'px ' + (r.top + r.height / 2 - st.top) + 'px';
      }
      lb.classList.add('on'); lbClose.focus();
    }
    function lbShut() {
      lb.classList.remove('on');
      clearTimeout(lbClearT);
      lbClearT = setTimeout(function () { lbStage.innerHTML = ''; }, 160);   // keep the media visible while it fades out
      if (lbReturn) lbReturn.focus();
    }
    lbPrev.addEventListener('click', function () { if (lbIdx > 0) { lbIdx--; lbRender(); } });
    lbNext.addEventListener('click', function () { if (lbIdx < lbSlides.length - 1) { lbIdx++; lbRender(); } });
    lbClose.addEventListener('click', lbShut);
    lb.addEventListener('click', function (e) { if (e.target === lb) lbShut(); });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('on')) return;
      if (e.key === 'Escape') lbShut();
      else if (e.key === 'ArrowLeft') lbPrev.click();
      else if (e.key === 'ArrowRight') lbNext.click();
      else if (e.key === 'Tab') { // keep focus inside the dialog
        var f = [lbClose, lbPrev, lbNext].filter(function (b) { return !b.disabled; });
        var i = f.indexOf(document.activeElement);
        e.preventDefault(); f[(i + (e.shiftKey ? f.length - 1 : 1)) % f.length].focus();
      }
    });

    cars.forEach(function (car) {
      var slides = CAROUSELS[car.dataset.carousel] || [];
      if (!slides.length) return;
      var label = car.getAttribute('aria-label') || 'Media';
      car.setAttribute('role', 'region'); car.setAttribute('aria-roledescription', 'carousel');
      var idx = 0, wrap = !!car.dataset.auto;
      var track = document.createElement('div'); track.className = 'mcar-track';
      slides.forEach(function (s, i) {
        var sl = document.createElement('div'); sl.className = 'mcar-slide';
        sl.setAttribute('role', 'group'); sl.setAttribute('aria-roledescription', 'slide'); sl.setAttribute('aria-label', (i + 1) + ' of ' + slides.length);
        sl.appendChild(mediaEl(s, true)); track.appendChild(sl);
      });
      function btn(cls, html, aria) { var b = document.createElement('button'); b.type = 'button'; b.className = cls; b.innerHTML = html; b.setAttribute('aria-label', aria); return b; }
      var prev = btn('mcar-btn prev', ICON.prev, 'Previous slide');
      var next = btn('mcar-btn next', ICON.next, 'Next slide');
      var expand = btn('mcar-expand', ICON.expand, 'Expand ' + label.toLowerCase());
      var dots = document.createElement('div'); dots.className = 'mcar-dots';
      var dotBtns = slides.map(function (_, i) {
        var d = btn('', '', 'Slide ' + (i + 1));
        d.addEventListener('click', function () { go(i); touched(); });
        dots.appendChild(d); return d;
      });
      car.append(track, prev, next, expand, dots);
      var vids = track.querySelectorAll('video');
      function go(i) {
        idx = Math.max(0, Math.min(i, slides.length - 1));
        track.style.transform = 'translateX(' + (-idx * 100) + '%)';
        dotBtns.forEach(function (d, k) { d.setAttribute('aria-current', String(k === idx)); });
        track.querySelectorAll('.mcar-slide').forEach(function (s, k) { s.inert = k !== idx; });
        prev.disabled = !wrap && idx === 0; next.disabled = !wrap && idx === slides.length - 1;
      }
      prev.addEventListener('click', function () { go(wrap ? (idx - 1 + slides.length) % slides.length : idx - 1); touched(); });
      next.addEventListener('click', function () { go(wrap ? (idx + 1) % slides.length : idx + 1); touched(); });
      expand.addEventListener('click', function () { lbOpen(slides, idx, expand); });
      // swipe
      var x0 = null;
      car.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') x0 = e.clientX; });
      car.addEventListener('pointerup', function (e) { if (x0 === null) return; var dx = e.clientX - x0; x0 = null; if (Math.abs(dx) > 40) (dx < 0 ? next : prev).click(); });
      go(0);
      // optional autoplay: data-auto="ms" — pauses on hover/focus, after input, off-screen, and for reduced motion
      var ms = parseInt(car.dataset.auto || '0', 10), hover = false, hold = 0, vis = true;
      function touched() { hold = performance.now() + ms * 3; }
      if (ms > 0 && slides.length > 1 && !reduceMotion) {
        ['mouseenter', 'focusin'].forEach(function (ev) { car.addEventListener(ev, function () { hover = true; }); });
        ['mouseleave', 'focusout'].forEach(function (ev) { car.addEventListener(ev, function () { hover = false; }); });
        if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { vis = es[0].isIntersecting; }, { threshold: 0.3 }).observe(car);
        setInterval(function () { if (!hover && vis && !document.hidden && performance.now() >= hold) go((idx + 1) % slides.length); }, ms);
      }
      // only play videos while the carousel is on screen
      if (vids.length && 'IntersectionObserver' in window && !reduceMotion) {
        new IntersectionObserver(function (es) { vids.forEach(function (v) { es[0].isIntersecting ? v.play().catch(function () {}) : v.pause(); }); }, { threshold: 0.1 }).observe(car);
      }
    });
  }

  /* ─── Colour decks ─── */
  function lum(hex) { var n = parseInt(hex.slice(1), 16); return (0.2126 * ((n >> 16) & 255) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255)) / 255; }
  var live = document.createElement('p');
  live.setAttribute('role', 'status'); live.setAttribute('aria-live', 'polite');
  live.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)';
  document.body.appendChild(live);
  // Swap text through a short blur so it reads as one label changing, not two words jumping
  function swapText(el, text) {
    if (reduceMotion) { el.textContent = text; return; }
    clearTimeout(el._s); el.classList.add('is-swapping');
    el._s = setTimeout(function () { el.textContent = text; el.classList.remove('is-swapping'); }, 110);
  }
  function copyHex(card, c) {
    var span = card.querySelector('.hex');
    function done() { swapText(span, 'Copied ✓'); live.textContent = c.n + ' ' + c.h + ' copied'; clearTimeout(span._t); span._t = setTimeout(function () { swapText(span, c.h); }, 1200); }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(c.h).then(done, done); else done();
  }
  function buildDeck(id, colors, cardW) {
    var deck = document.getElementById(id); if (!deck) return;
    var cl = document.createElement('div'); cl.className = 'deck-cluster'; deck.appendChild(cl);
    var n = colors.length, step = n > 1 ? (100 - cardW) / (n - 1) : 0;
    var cards = colors.map(function (c, i) {
      var card = document.createElement('button');
      card.type = 'button';
      card.className = 'deck-card' + (lum(c.h) > 0.88 ? ' lite' : '');
      card.style.left = (i * step).toFixed(3) + '%'; card.style.width = cardW + '%'; card.style.background = c.h;
      card.setAttribute('aria-label', c.n + ', ' + c.h + '. Copy hex');
      card.innerHTML = '<span class="dk-info" style="color:' + (lum(c.h) > 0.6 ? '#111111' : '#FFFFFF') + '"><span class="nm">' + c.n + '</span><span class="dk-right"><span class="hex">' + c.h + '</span><span class="hint">Click to copy</span></span></span>';
      card.addEventListener('click', function () { copyHex(card, c); });
      cl.appendChild(card); return card;
    });
    function lift(card) { if (reduceMotion) return; cards.forEach(function (c) { c.style.transform = 'translateY(-20px)'; }); card.style.transform = 'translateY(-96px) rotate(-0.6deg)'; }
    function drop() { cards.forEach(function (c) { c.style.transform = ''; }); }
    cards.forEach(function (card) { card.addEventListener('mouseenter', function () { lift(card); }); card.addEventListener('focus', function () { lift(card); }); });
    cl.addEventListener('mouseleave', drop); cl.addEventListener('focusout', function (e) { if (!cl.contains(e.relatedTarget)) drop(); });
  }
  buildDeck('deck-primary', [{ n: 'Purps', h: '#8000FF' }, { n: 'White', h: '#FFFFFF' }, { n: 'Slate Black', h: '#111111' }], 66);
  buildDeck('deck-secondary', [{ n: 'Pink', h: '#FE3394' }, { n: 'Green', h: '#15D676' }, { n: 'Blue', h: '#00D5FF' }, { n: 'Yellow', h: '#FFE900' }, { n: 'Orange', h: '#FF7B00' }], 32);

  /* ─── Suggested combinations tool ─── */
  var field = document.getElementById('ct-field');
  if (field) {
    var dot = document.getElementById('ct-dot'), cardT = document.getElementById('ct-card-top'), cardB = document.getElementById('ct-card-bot');
    var layers = field.querySelectorAll('.ct-state');
    var VERTS = [
      { x: 0.3016, y: 0.4994, tint: '#8000FF', name: 'Purps',  key: 'purps' },
      { x: 0.3839, y: 0.3570, tint: '#FE3394', name: 'Pink',   key: 'pink' },
      { x: 0.6218, y: 0.3570, tint: '#FF7B00', name: 'Orange', key: 'orange' },
      { x: 0.7034, y: 0.4994, tint: '#FFE900', name: 'Yellow', key: 'yellow' },
      { x: 0.6218, y: 0.6430, tint: '#15D676', name: 'Green',  key: 'green' },
      { x: 0.3839, y: 0.6430, tint: '#00D5FF', name: 'Blue',   key: 'blue' }
    ];
    VERTS.forEach(function (v) { ['top', 'bot'].forEach(function (p) { var im = new Image(); im.src = C + 'combo-' + v.key + '-' + p + '.jpg'; }); });
    var BRIGHT = { 3: 1, 4: 1 };
    var target = 0, shown = -1, cx = VERTS[0].x, cy = VERTS[0].y;
    // New image fades in over the old one through a light blur; the old layers are cleared once it lands
    function setCard(card, src, alt, delay) {
      if (card.dataset.src === src) return;
      var first = !card.dataset.src; card.dataset.src = src;
      var im = new Image(); im.src = src; im.alt = alt;
      if (first || reduceMotion) { card.innerHTML = ''; card.appendChild(im); return; }
      im.className = 'is-new'; im.style.transitionDelay = (delay || 0) + 'ms';
      card.appendChild(im);
      requestAnimationFrame(function () { requestAnimationFrame(function () { im.classList.remove('is-new'); }); });
      clearTimeout(card._clr);
      card._clr = setTimeout(function () {
        Array.prototype.slice.call(card.querySelectorAll('img')).forEach(function (x) { if (x !== card.lastElementChild) x.remove(); });
      }, 380 + (delay || 0));
    }
    function show(i) {
      layers.forEach(function (l, k) { l.classList.toggle('on', k === i); });
      field.classList.toggle('bright', !!BRIGHT[i]);
      var v = VERTS[i];
      cardT.style.setProperty('--tint', v.tint); cardB.style.setProperty('--tint', v.tint);
      setCard(cardT, C + 'combo-' + v.key + '-top.jpg', 'Headout work themed in ' + v.name);
      setCard(cardB, C + 'combo-' + v.key + '-bot.jpg', 'Headout work themed in ' + v.name, 60);
      dot.setAttribute('aria-valuenow', String(i + 1)); dot.setAttribute('aria-valuetext', v.name);
      shown = i;
    }
    function nearest(px, py) { var b = 0, bd = Infinity; VERTS.forEach(function (v, i) { var d = (px - v.x) * (px - v.x) + (py - v.y) * (py - v.y); if (d < bd) { bd = d; b = i; } }); return b; }
    var TRAVEL = reduceMotion ? 1 : 450, DWELL = 2200;
    function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
    function easeBack(t) { var c1 = 1.4, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); }
    // Keep a dragged point inside the hexagon: pull it toward the centre onto the nearest edge (pixel space)
    var HX = VERTS.reduce(function (a, v) { return a + v.x; }, 0) / 6, HY = VERTS.reduce(function (a, v) { return a + v.y; }, 0) / 6;
    function clampHex(px, py) {
      var dx = (px - HX) * fw, dy = (py - HY) * fh, best = 1;
      for (var i = 0; i < 6; i++) {
        var a = VERTS[i], b = VERTS[(i + 1) % 6];
        var ax = (a.x - HX) * fw, ay = (a.y - HY) * fh, ex = (b.x - a.x) * fw, ey = (b.y - a.y) * fh;
        var den = dx * ey - dy * ex; if (Math.abs(den) < 1e-6) continue;
        var t = (ax * ey - ay * ex) / den, u = (ax * dy - ay * dx) / den;   // ray param, edge param
        if (t > 0 && u >= 0 && u <= 1 && t < best) best = t;
      }
      return { x: HX + (px - HX) * best, y: HY + (py - HY) * best };
    }
    function pulse() { if (!reduceMotion && dot.animate) dot.animate([{ scale: 1 }, { scale: 1.15 }, { scale: 1 }], { duration: 260, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' }); }
    var touched = false;   // once someone picks a mood, autoplay waits until the tool leaves view
    var tween = null, tweenTarget = -1, nextAuto = performance.now() + DWELL, vis = true, dragging = false, userPaused = false;
    var fw = 0, fh = 0;
    function measure() { var r = field.getBoundingClientRect(); fw = r.width; fh = r.height; }
    measure(); if ('ResizeObserver' in window) new ResizeObserver(measure).observe(field);
    function place() { dot.style.transform = 'translate3d(' + (cx * fw).toFixed(2) + 'px,' + (cy * fh).toFixed(2) + 'px,0)'; }
    function setTarget(i, byUser) { target = i; if (byUser) { nextAuto = performance.now() + TRAVEL + DWELL; } }
    function frame(now) {
      if (vis && !dragging && !tween && !reduceMotion && !userPaused && !touched && now >= nextAuto) { target = (target + 1) % 6; nextAuto = now + TRAVEL + DWELL; }
      if (!dragging && target !== tweenTarget) { tween = { x0: cx, y0: cy, x1: VERTS[target].x, y1: VERTS[target].y, t0: now, dur: TRAVEL, fn: ease }; tweenTarget = target; }
      if (tween && !dragging) {
        var p = Math.min(1, (now - tween.t0) / tween.dur), e = tween.fn(p);
        cx = tween.x0 + (tween.x1 - tween.x0) * e; cy = tween.y0 + (tween.y1 - tween.y0) * e;
        if (p >= 1) { tween = null; pulse(); }
        place();
      }
      if (target !== shown && (!tween || now - tween.t0 > 16)) show(target);
      requestAnimationFrame(frame);
    }
    dot.setAttribute('aria-valuemin', '1'); dot.setAttribute('aria-valuemax', '6');
    show(0); place(); tweenTarget = 0; requestAnimationFrame(frame);
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { vis = es[0].isIntersecting; if (vis) nextAuto = performance.now() + DWELL; else touched = false; }, { threshold: 0.25 }).observe(field);
    // While dragging, the dot follows the finger (inside the hex) and the mood follows the nearest point
    var grabDX = 0, grabDY = 0;   // where on the dot it was grabbed, so it doesn't jump to centre under the cursor
    function pick(e) {
      var r = field.getBoundingClientRect(), q = clampHex((e.clientX - r.left) / r.width - grabDX, (e.clientY - r.top) / r.height - grabDY);
      tween = null; cx = q.x; cy = q.y; place();
      var n = nearest(cx, cy); setTarget(n, true); tweenTarget = n;
    }
    // On release, settle onto the point with a slight overshoot
    function settle() {
      var v = VERTS[target];
      if (Math.abs((cx - v.x) * fw) < 1 && Math.abs((cy - v.y) * fh) < 1) { cx = v.x; cy = v.y; place(); tween = null; tweenTarget = target; return; }   // a click, not a drag: stay put
      if (reduceMotion) { cx = VERTS[target].x; cy = VERTS[target].y; place(); return; }
      tween = { x0: cx, y0: cy, x1: VERTS[target].x, y1: VERTS[target].y, t0: performance.now(), dur: 380, fn: easeBack };
      tweenTarget = target;
    }
    // Grab the dot to drag it; press anywhere else and it glides to the nearest mood
    field.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      touched = true;
      if (e.target === dot) {
        var r0 = field.getBoundingClientRect();
        grabDX = (e.clientX - r0.left) / r0.width - cx; grabDY = (e.clientY - r0.top) / r0.height - cy;
        dragging = true; field.classList.add('is-dragging'); pick(e);
        if (field.setPointerCapture) field.setPointerCapture(e.pointerId);
        e.preventDefault();
      } else {
        var r = field.getBoundingClientRect(), q = clampHex((e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height);
        setTarget(nearest(q.x, q.y), true);
      }
    });
    field.addEventListener('pointermove', function (e) { if (dragging) { pick(e); e.preventDefault(); } });
    function release() { if (dragging) { dragging = false; field.classList.remove('is-dragging'); settle(); nextAuto = performance.now() + DWELL; } }
    window.addEventListener('pointerup', release); window.addEventListener('pointercancel', release);
    // keyboard focus pauses autoplay so screen-reader and keyboard users aren't moved under them
    dot.addEventListener('focus', function () { userPaused = true; });
    dot.addEventListener('blur', function () { userPaused = false; nextAuto = performance.now() + DWELL; });
    dot.addEventListener('keydown', function (e) {
      touched = true;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') setTarget((target + 1) % 6, true);
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') setTarget((target + 5) % 6, true);
      else if (e.key === 'Home') setTarget(0, true);
      else if (e.key === 'End') setTarget(5, true);
      else return;
      e.preventDefault();
    });
  }
})();

/* Scale fixed-width embeds to their container (keeps the tool's desktop layout on small screens) */
(function () {
  var boxes = document.querySelectorAll('.embed-scaled[data-embed-width]');
  if (!boxes.length) return;
  function fit(box) {
    var w = +box.dataset.embedWidth, h = +box.dataset.embedHeight, f = box.querySelector('iframe');
    var cw = box.clientWidth;
    if (cw >= w) { box.style.removeProperty('--embed-scale'); f.style.width = '100%'; f.style.height = h + 'px'; box.style.height = h + 'px'; return; }
    var k = cw / w;
    f.style.width = w + 'px'; f.style.height = h + 'px';
    box.style.setProperty('--embed-scale', k); box.style.height = Math.round(h * k) + 'px';
  }
  boxes.forEach(function (b) { fit(b); if ('ResizeObserver' in window) new ResizeObserver(function () { fit(b); }).observe(b); });
})();

/* ─── Layout page: grid demo + portal adaptation selector ─── */
(function () {
  var demo = document.querySelector('.grid-demo');
  if (demo) {
    var live = demo.querySelector('.gd-live'), canvas = demo.querySelector('.gd-canvas');
    var radios = Array.prototype.slice.call(demo.querySelectorAll('[role="radio"]'));
    var names = { 2: 'Two', 4: 'Four', 6: 'Six', 8: 'Eight', 10: 'Ten', modular: 'Modular' };
    function render(v) {
      demo.dataset.cols = v;
      var n = v === 'modular' ? 24 : +v;
      live.style.setProperty('--cols', v === 'modular' ? 6 : v);
      live.innerHTML = new Array(n + 1).join('<span></span>');
      radios.forEach(function (r) { var on = r.dataset.cols === String(v); r.setAttribute('aria-checked', String(on)); r.tabIndex = on ? 0 : -1; });
      canvas.setAttribute('aria-label', v === 'modular' ? 'Modular grid of six columns and four rows inside the page margins' : names[v] + '-column grid inside the page margins');
    }
    radios.forEach(function (r, i) {
      r.addEventListener('click', function () { render(r.dataset.cols === 'modular' ? 'modular' : +r.dataset.cols); });
      r.addEventListener('keydown', function (e) {
        var d = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
        if (!d) return; e.preventDefault();
        var t = radios[(i + d + radios.length) % radios.length]; t.click(); t.focus();
      });
    });
    var sw = demo.querySelector('[data-anatomy]');
    sw.addEventListener('click', function () { var on = sw.getAttribute('aria-checked') !== 'true'; sw.setAttribute('aria-checked', String(on)); demo.classList.toggle('show-anatomy', on); });
    render(2);
  }

  var opts = document.querySelector('.adapt-options');
  if (opts) {
    var tabs = Array.prototype.slice.call(opts.querySelectorAll('[role="tab"]')), name = document.querySelector('.adapt-name');
    function pick(i, focus) {
      tabs.forEach(function (t, k) { t.setAttribute('aria-selected', String(k === i)); t.tabIndex = k === i ? 0 : -1; });
      name.textContent = tabs[i].dataset.shape; if (focus) tabs[i].focus();
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { pick(i); });
      t.addEventListener('keydown', function (e) {
        var d = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 0;
        if (e.key === 'Home') { e.preventDefault(); pick(0, true); } else if (e.key === 'End') { e.preventDefault(); pick(tabs.length - 1, true); }
        else if (d) { e.preventDefault(); pick((i + d + tabs.length) % tabs.length, true); }
      });
    });
  }
})();

/* ─── Iconography: icon-style tabs ─── */
(function () {
  var list = document.querySelector('.styles-tabs'); if (!list) return;
  var tabs = Array.prototype.slice.call(list.querySelectorAll('[role="tab"]'));
  var panel = document.getElementById('st-panel'), rule = panel.querySelector('.st-rule'), used = panel.querySelector('.st-used'), prev = document.querySelector('.st-preview');
  var DATA = [
    ['Our default. Use stroke icons for navigation, actions and inline information across the product. They stay light and let the content lead.', 'Used in: navbar, lists, inputs, buttons, posters & decks', 'Stroke icons in use — e.g. navbar, list rows, inputs'],
    ['Use filled icons to show an active or selected state, like the current tab in the navbar, and at small sizes where a stroke gets too thin to read.', 'Used in: active tabs, selected states, small badges', 'Filled icons in use — e.g. active navbar tab, selected states'],
    ['Stroke icons with a colour accent, and fully coloured icons. These are our most recognisable treatments, so save them for moments that build trust and help people decide: value props like booking protection and trip support, descriptor icons on product pages, and boosters like “660K+ booked this”. Boosters are customised Hugeicons too. Keep the accent to one small detail and stay within the set palette.', 'Used in: trust strips, value props, descriptor rows, boosters, landing pages, banners', 'Mixed & multicolour icons in use — e.g. trust strip, value props'],
    ['Animated icons mark moments worth noticing, like a confirmed booking or a category change. In value-prop animations, Hugeicons become the building blocks: a calendar that checks itself off, a price badge with drop arrows. Use motion only where the icon is the main feedback, and keep it short.', 'Used in: success screens, value-prop animations, category icons, rollovers', 'Motion — success screen or value-prop animation (“Book anytime”, “Best price, always”)']
  ];
  function pick(i, focus) {
    tabs.forEach(function (t, k) { t.setAttribute('aria-selected', String(k === i)); t.tabIndex = k === i ? 0 : -1; });
    rule.textContent = DATA[i][0]; used.textContent = DATA[i][1]; prev.textContent = DATA[i][2];
    panel.setAttribute('aria-labelledby', tabs[i].id);
    if (focus) tabs[i].focus();
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { pick(i); });
    t.addEventListener('keydown', function (e) {
      var d = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 0;
      if (e.key === 'Home') { e.preventDefault(); pick(0, true); } else if (e.key === 'End') { e.preventDefault(); pick(tabs.length - 1, true); }
      else if (d) { e.preventDefault(); pick((i + d + tabs.length) % tabs.length, true); }
    });
  });
})();
