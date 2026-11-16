(function () {
  'use strict';
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ─── Grid switches (Icon construction, Logo clearspace) ─── */
  document.querySelectorAll('.switch[data-target]').forEach(function (sw) {
    sw.addEventListener('click', function () {
      var on = sw.getAttribute('aria-checked') !== 'true';
      sw.setAttribute('aria-checked', String(on));
      document.getElementById(sw.dataset.target).classList.toggle('is-grid-active', on);
    });
  });


  /* ─── Tile ⇄ avatar morph ───
     Radius morphs 22.33% → 50% (both from the Figma art) while the art crossfades
     under a soft blur; a brief squash on the wrapper makes it feel like one object
     changing shape rather than two images swapping. Interruptible: the radius is a
     CSS transition, so rapid toggling retargets from wherever it is. */
  function morphTile(el, shape) {
    el.dataset.shape = shape;
    el.setAttribute('aria-label', shape === 'avatar' ? 'Headout circular avatar' : 'Headout app tile');
    if (reduceMotion.matches) return;
    el.getAnimations().forEach(function (a) { if (a.id === 'squash') a.cancel(); });
    var a = el.animate(
      [
        { transform: 'scale(1)', easing: 'cubic-bezier(0.23, 1, 0.32, 1)' },
        { transform: 'scale(0.95)', offset: 0.28, easing: 'cubic-bezier(0.34, 1.4, 0.64, 1)' },
        { transform: 'scale(1)' }
      ],
      { duration: 320 }
    );
    a.id = 'squash';
  }

  /* ─── Segmented tabs (App tile and avatars) ─── */
  document.querySelectorAll('[role="tablist"].segmented').forEach(function (list) {
    var tabs = Array.prototype.slice.call(list.querySelectorAll('[role="tab"]'));
    list.style.setProperty('--count', tabs.length);
    function select(i, focus) {
      var prev = list.dataset.index | 0;
      tabs.forEach(function (t, j) {
        var on = i === j;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
      });
      // Panels: hide all, then show the selected one (two tabs may share a panel).
      tabs.forEach(function (t) { document.getElementById(t.getAttribute('aria-controls')).hidden = true; });
      var panel = document.getElementById(tabs[i].getAttribute('aria-controls'));
      panel.hidden = false;
      panel.setAttribute('aria-labelledby', tabs[i].id);
      var morph = panel.querySelector('.tile-morph');
      if (morph && i !== prev) morphTile(morph, i === 1 ? 'avatar' : 'tile');
      list.dataset.index = i;
      list.style.setProperty('--index', i);
      if (focus) tabs[i].focus();
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { select(i); });
      t.addEventListener('keydown', function (e) {
        var n = tabs.length;
        if (e.key === 'ArrowRight') { e.preventDefault(); select((i + 1) % n, true); }
        if (e.key === 'ArrowLeft')  { e.preventDefault(); select((i - 1 + n) % n, true); }
        if (e.key === 'Home') { e.preventDefault(); select(0, true); }
        if (e.key === 'End')  { e.preventDefault(); select(n - 1, true); }
      });
    });
  });


  /* ─── Coverflow (Our suggested combinations) ───
     Smart-animate equivalent: 300ms cubic-bezier(.23,1,.32,1), transform + opacity only.
     Click a side slide, ←/→ keys, or swipe (distance OR velocity > 0.11px/ms). */
  document.querySelectorAll('.coverflow').forEach(function (cf) {
    var slides = Array.prototype.slice.call(cf.querySelectorAll('.cf-slide'));
    var dots = Array.prototype.slice.call(cf.querySelectorAll('.cf-dot'));
    var status = cf.querySelector('.cf-status');
    var n = slides.length, active = 0;

    /* Deck variant (.is-stack): every card is placed from its distance to the front card, which can be
       fractional while dragging. Each step back: 15% across, deeper, 16% smaller, 12° turn, 8° fan. */
    var stack = cf.classList.contains('is-stack');
    function layoutStack(frac, instant) {
      var w = slides[0].offsetWidth || 1;
      slides.forEach(function (s, i) {
        var rel = i - active; if (rel > n / 2) rel -= n; if (rel < -n / 2) rel += n;
        rel -= frac;
        var ax = Math.abs(rel);
        // A card wrapping from one end of the deck to the other jumps instead of sweeping behind
        var jump = !instant && s._rel !== undefined && Math.abs(rel - s._rel) > n / 2;
        if (jump) s.style.transition = 'none';
        s._rel = rel;
        s.style.setProperty('--x', (rel * 0.15 * w).toFixed(1) + 'px');
        s.style.setProperty('--tz', (-ax * 0.6 * w).toFixed(1) + 'px');
        s.style.setProperty('--ry', (-rel * 12).toFixed(2) + 'deg');
        s.style.setProperty('--rz', (rel * 8).toFixed(2) + 'deg');
        s.style.setProperty('--s', Math.max(0.4, 1 - ax * 0.16).toFixed(4));
        s.style.setProperty('--dim', (Math.min(ax, 1) * 0.4).toFixed(3));
        s.style.opacity = ax <= 2 ? '1' : Math.max(0, 3 - ax).toFixed(3);
        s.style.zIndex = String(100 - Math.round(ax * 10));
        if (jump) { void s.offsetWidth; s.style.transition = ''; }
      });
    }
    if (stack && 'ResizeObserver' in window) new ResizeObserver(function () { layoutStack(0, true); }).observe(cf);

    function render() {
      slides.forEach(function (s, i) {
        // Any number of slides: the neighbours sit either side, the rest wait hidden behind the centre
        var pos = i === active ? 'center' : (i === (active + 1) % n ? 'right' : (i === (active - 1 + n) % n ? 'left' : 'hidden'));
        // Coming out of hiding: appear in place with a fade instead of travelling across the stage
        if (!stack && s.dataset.pos === 'hidden' && pos !== 'hidden' && !reduceMotion.matches) {
          s.style.transition = 'opacity 250ms ease';
          clearTimeout(s._unhide);
          s._unhide = setTimeout(function () { s.style.transition = ''; }, 300);
        }
        s.dataset.pos = pos;
        s.tabIndex = pos === 'left' || pos === 'right' ? 0 : -1;
        s.setAttribute('aria-hidden', pos === 'hidden' ? 'true' : 'false');
        var m = s.querySelector('img, video'), label = m.alt || m.getAttribute('aria-label') || '';
        s.setAttribute('aria-label', pos === 'center' ? label : (pos === 'right' ? 'Next: ' : 'Previous: ') + label);
      });
      dots.forEach(function (d, i) { d.setAttribute('aria-current', String(i === active)); });
      if (stack) layoutStack(0);
      syncVideos();
      if (status) status.textContent = 'Slide ' + (active + 1) + ' of ' + n;
    }
    /* Only the centre slide's video plays (from the start when it arrives); the rest stay paused */
    var cfVisible = false;
    function syncVideos() {
      slides.forEach(function (s, i) {
        var v = s.querySelector('video'); if (!v) return;
        if (i === active && cfVisible && !reduceMotion.matches && !document.hidden) {
          if (v.paused) { var pr = v.play(); if (pr && pr.catch) pr.catch(function () {}); }
        } else if (!v.paused || v.currentTime) { v.pause(); if (i !== active) v.currentTime = 0; }
      });
    }
    if (slides.some(function (s) { return s.querySelector('video'); })) {
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (es) { cfVisible = es[0].isIntersecting; syncVideos(); }, { threshold: 0.25 }).observe(cf);
      } else cfVisible = true;
      document.addEventListener('visibilitychange', syncVideos);
    }

    function go(delta) {
      // The slide leaving one side for the other would otherwise travel across the
      // whole stage behind the centre. Jump it instead, then fade + scale it in.
      var wrapping = n === 3 && !stack ? slides[delta > 0 ? (active - 1 + n) % n : (active + 1) % n] : null;
      active = (active + delta + n) % n;
      if (reduceMotion.matches) {
        cf.animate([{ opacity: 0.6 }, { opacity: 1 }], { duration: 150, easing: 'ease' });
        render();
        return;
      }
      if (!wrapping) { render(); return; }
      wrapping.style.transition = 'none';
      wrapping.classList.add('is-entering');
      render();
      void wrapping.offsetWidth;
      wrapping.style.transition = '';
      wrapping.classList.remove('is-entering');
      wrapping.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, delay: 100, easing: 'ease-out', fill: 'backwards' });
    }

    dots.forEach(function (d, i) {
      if (d.tagName !== 'BUTTON') return;
      d.addEventListener('click', function () {
        if (cf.dataset.dragged === '1' || i === active) return;
        var delta = i - active;
        if (delta > n / 2) delta -= n; else if (delta < -n / 2) delta += n;
        go(delta);
      });
    });

    slides.forEach(function (s) {
      s.addEventListener('click', function () {
        if (cf.dataset.dragged === '1') return;
        if (s.dataset.pos === 'right') go(1);
        else if (s.dataset.pos === 'left') go(-1);
      });
    });
    cf.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
      if (e.key === 'ArrowLeft')  { e.preventDefault(); go(-1); }
    });

    /* Drag / swipe on the stage */
    var startX = 0, startT = 0, dx = 0, dragging = false, pointerId = null;
    var step = 1, sideS = .68, sideDim = .55, sideRy = 0;
    function measure() {
      // Distance from centre to a side slide, and the side's resting scale/dim, read from CSS
      var side = slides.filter(function (s) { return s.dataset.pos === 'left' || s.dataset.pos === 'right'; })[0];
      var cs = getComputedStyle(side);
      step = Math.abs(parseFloat(cs.getPropertyValue('--x')) / 100 * side.offsetWidth) || 1;
      sideS = parseFloat(cs.getPropertyValue('--s')) || .68;
      sideDim = parseFloat(cs.getPropertyValue('--dim')) || .55;
      sideRy = Math.abs(parseFloat(cs.getPropertyValue('--ry'))) || 0;   // 3D variant: side cards are turned
    }
    // Blend scale + dim with drag progress so the incoming slide grows under the finger
    function setDrag(px, on) {
      if (stack) {   // the deck re-fans continuously: half a card width of drag = one card
        slides.forEach(function (s) { s.classList.toggle('is-dragging', on); });
        layoutStack(on ? Math.max(-1.5, Math.min(1.5, -px / (slides[0].offsetWidth * 0.5))) : 0, true);
        return;
      }
      var p = Math.max(-1, Math.min(1, px / step)), a = Math.abs(p);
      slides.forEach(function (s) {
        s.classList.toggle('is-dragging', on);
        if (!on) {
          ['--drag', '--s', '--dim', '--p', '--ry'].forEach(function (k) { s.style.removeProperty(k); });
          return;
        }
        s.style.setProperty('--drag', px + 'px');
        s.style.setProperty('--p', p.toFixed(3));
        var pos = s.dataset.pos;
        var incoming = (p < 0 && pos === 'right') || (p > 0 && pos === 'left');
        if (pos === 'center') {
          s.style.setProperty('--s', (1 - (1 - sideS) * a).toFixed(4));
          s.style.setProperty('--dim', (sideDim * a).toFixed(3));
          if (sideRy) s.style.setProperty('--ry', (Math.sign(p) * sideRy * a).toFixed(2) + 'deg');
        } else if (incoming) {
          if (sideRy) s.style.setProperty('--ry', (-Math.sign(p) * sideRy * (1 - a)).toFixed(2) + 'deg');
          s.style.setProperty('--s', (sideS + (1 - sideS) * a).toFixed(4));
          s.style.setProperty('--dim', (sideDim * (1 - a)).toFixed(3));
        } else {
          s.style.removeProperty('--s'); s.style.removeProperty('--dim'); s.style.removeProperty('--ry');
        }
      });
    }
    // Follow the finger 1:1 up to 40% of the stage, then add friction instead of a hard stop
    function rubber(d) {
      var limit = cf.clientWidth * 0.4, a = Math.abs(d);
      return a <= limit ? d : Math.sign(d) * (limit + (a - limit) * 0.3);
    }
    cf.addEventListener('pointerdown', function (e) {
      if (dragging || (e.pointerType === 'mouse' && e.button !== 0)) return;
      dragging = true; pointerId = e.pointerId; startX = e.clientX; startT = performance.now(); dx = 0;
      cf.dataset.dragged = '0';
    });
    cf.addEventListener('pointermove', function (e) {
      if (!dragging || e.pointerId !== pointerId) return;
      dx = e.clientX - startX;
      if (Math.abs(dx) > 6 && cf.dataset.dragged !== '1') {
        cf.dataset.dragged = '1';
        cf.setPointerCapture(pointerId);
        measure();
      }
      if (cf.dataset.dragged === '1' && !reduceMotion.matches) setDrag(rubber(dx), true);
    });
    function end() {
      if (!dragging) return;
      dragging = false;
      var dt = Math.max(performance.now() - startT, 1);
      var velocity = Math.abs(dx) / dt;
      setDrag(0, false);
      if (cf.dataset.dragged === '1' && (Math.abs(dx) > cf.clientWidth * 0.15 || velocity > 0.11)) {
        // A hard flick lands faster: 300ms at rest, down to 180ms
        var dur = Math.round(Math.max(180, Math.min(300, 300 - velocity * 200)));
        cf.style.setProperty('--cf-dur', dur + 'ms');
        clearTimeout(cf._durT);
        cf._durT = setTimeout(function () { cf.style.removeProperty('--cf-dur'); }, dur + 50);
        go(dx < 0 ? 1 : -1);
      }
      setTimeout(function () { cf.dataset.dragged = '0'; }, 0);
    }
    cf.addEventListener('pointerup', end);
    cf.addEventListener('pointercancel', end);

    /* Autoplay — off for reduced motion. The active dot's fill is the clock, so pausing
       (hover, keyboard focus, press, off-screen, hidden tab) is just animation-play-state,
       and a manual change restarts the fill on the new dot. */
    if (!reduceMotion.matches && n > 1) {
      cf.classList.add('is-autoplay');
      cf.addEventListener('animationend', function (e) {
        if (e.animationName !== 'cf-progress') return;
        if (status) status.setAttribute('aria-live', 'off'); // don't narrate auto-advances
        go(1);
        if (status) setTimeout(function () { status.setAttribute('aria-live', 'polite'); }, 0);
      });
      cf.addEventListener('pointerdown', function () { cf.classList.add('is-held'); });
      ['pointerup', 'pointercancel'].forEach(function (t) {
        cf.addEventListener(t, function () { cf.classList.remove('is-held'); });
      });
      document.addEventListener('visibilitychange', function () {
        cf.classList.toggle('is-held', document.hidden);
      });
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (entries) {
          entries.forEach(function (en) { cf.classList.toggle('in-view', en.isIntersecting); });
        }, { threshold: 0.6 }).observe(cf);
      } else cf.classList.add('in-view');
    }

    render();

    /* First reveal — side slides fan out from behind the centre, once */
    if (!stack && !reduceMotion.matches && 'IntersectionObserver' in window && n > 1) {
      cf.classList.add('is-intro');
      var introIO = new IntersectionObserver(function (entries) {
        if (!entries[0].isIntersecting) return;
        introIO.disconnect();
        var i = 0;
        slides.forEach(function (s) {
          if (s.dataset.pos === 'center') return;
          s.style.transition = 'transform 450ms var(--ease-out, cubic-bezier(.23,1,.32,1)) ' + (i++ * 60) + 'ms';
        });
        void cf.offsetWidth;
        cf.classList.remove('is-intro');
        setTimeout(function () { slides.forEach(function (s) { s.style.transition = ''; }); }, 600);
      }, { threshold: 0.4 });
      introIO.observe(cf);
    }
  });

  /* ─── Active section tracking (index rail + mobile section bar) ─── */
  var sections = Array.prototype.slice.call(document.querySelectorAll('[data-index]'));
  var railMarks = Array.prototype.slice.call(document.querySelectorAll('.index-rail span'));
  var popLinks = Array.prototype.slice.call(document.querySelectorAll('.index-pop a'));
  var sheetLinks = Array.prototype.slice.call(document.querySelectorAll('.m-sheet-list a'));
  var sectionLabel = document.querySelector('.m-section-label');
  var pageLabel = sectionLabel ? sectionLabel.textContent : '';   // page name shown above the first section

  function setActive(id) {
    sections.forEach(function (s, i) {
      var on = s.id === id;
      if (railMarks[i]) railMarks[i].classList.toggle('is-active', on);
    });
    popLinks.concat(sheetLinks).forEach(function (a) {
      a.setAttribute('aria-current', String(a.getAttribute('href') === '#' + id));
    });
    var match = sections.filter(function (s) { return s.id === id; })[0];
    var ov = document.querySelector('.m-sheet-list a[href="#main"]');
    if (ov) ov.setAttribute('aria-current', String(!match));
    if (sectionLabel && !match) sectionLabel.textContent = pageLabel;
    if (sectionLabel && match) sectionLabel.textContent = pageLabel + ' · ' + match.dataset.index;
  }
  /* While a jump is in flight, the indicator holds the destination instead of
     ticking through every section the scroll passes. */
  var jumpLock = false, jumpStart = 0, jumpTimer;
  function endJump() { jumpLock = false; clearTimeout(jumpTimer); }
  window.addEventListener('scrollend', function () {
    if (jumpLock && performance.now() - jumpStart > 120) endJump(); // ignore the instant hop's own scrollend
  });

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      if (jumpLock) return;
      entries.forEach(function (en) { if (en.isIntersecting) setActive(en.target.id); });
    }, { rootMargin: '-30% 0px -60% 0px' });
    sections.forEach(function (s) { io.observe(s); });
    var firstSection = sections[0], lastSection = sections[sections.length - 1], edgeTicking = false;
    window.addEventListener('scroll', function () {
      if (edgeTicking) return; edgeTicking = true;
      requestAnimationFrame(function () {
        edgeTicking = false;
        if (jumpLock) return;
        var docEl = document.documentElement;
        if (firstSection && firstSection.getBoundingClientRect().top > window.innerHeight * 0.4) setActive(null);
        // Short final sections can never reach the tracking band — claim them at the bottom
        else if (lastSection && window.scrollY + window.innerHeight >= docEl.scrollHeight - 2) setActive(lastSection.id);
      });
    }, { passive: true });
  }

  /* In-page jumps: long distances hop instantly to just short of the target, then
     glide the last stretch, so a far jump lands in ~300ms instead of a long tour. */
  document.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;
    var hash = a.getAttribute('href');
    if (hash.length < 2) return;
    var el = document.getElementById(hash.slice(1));
    if (!el) return;
    e.preventDefault();

    var margin = parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
    var maxY = document.documentElement.scrollHeight - window.innerHeight;
    var top = Math.max(0, Math.min(maxY, el.getBoundingClientRect().top + window.scrollY - margin));
    var dist = top - window.scrollY;

    var isSection = sections.indexOf(el) !== -1;
    setActive(isSection ? el.id : null);
    jumpLock = true; jumpStart = performance.now();
    clearTimeout(jumpTimer); jumpTimer = setTimeout(endJump, 1000); // fallback where scrollend is unsupported
    history.replaceState(null, '', hash);

    if (reduceMotion.matches) { window.scrollTo({ top: top, behavior: 'instant' }); return; }
    var LAND = 200;
    if (Math.abs(dist) > window.innerHeight * 1.5) {
      window.scrollTo({ top: top - Math.sign(dist) * LAND, behavior: 'instant' });
      requestAnimationFrame(function () { window.scrollTo({ top: top, behavior: 'smooth' }); });
    } else {
      window.scrollTo({ top: top, behavior: 'smooth' });
    }
  });

  /* Index popover: ↑/↓ moves, Enter follows link (native), Esc closes */
  var pop = document.querySelector('.index-pop');
  if (pop) {
    pop.addEventListener('keydown', function (e) {
      var i = popLinks.indexOf(document.activeElement);
      if (e.key === 'ArrowDown') { e.preventDefault(); popLinks[Math.min(i + 1, popLinks.length - 1)].focus(); }
      if (e.key === 'ArrowUp')   { e.preventDefault(); popLinks[Math.max(i - 1, 0)].focus(); }
      if (e.key === 'Escape')    { document.activeElement.blur(); }
    });
  }

  /* Mobile overlays: ☰ opens the pages drawer, section bar opens the swipe sheet */
  var scrim = document.querySelector('.m-scrim');
  var drawer = document.getElementById('m-drawer');
  var sheet = document.getElementById('m-sheet');
  var burger = document.querySelector('.m-burger');
  var toggle = document.querySelector('.m-section');
  var mHeader = document.querySelector('.m-header');
  var behind = [mHeader, document.getElementById('main'), document.querySelector('.sidebar'), document.querySelector('.index')].filter(Boolean);
  var current = null, opener = null;

  function setBehindInert(on) { behind.forEach(function (el) { el.inert = on; }); }
  function closeAll() {
    if (!current) return;
    var panel = current.panel;
    panel.classList.remove('is-open', 'is-dragging');
    panel.style.transform = '';
    panel.inert = true;
    current.btn.setAttribute('aria-expanded', 'false');
    scrim.classList.remove('is-open');
    document.body.classList.remove('m-locked');
    setBehindInert(false);
    if (opener) opener.focus({ preventScroll: true });
    current = null;
  }
  function open(panel, btn) {
    closeAll();
    current = { panel: panel, btn: btn }; opener = btn;
    panel.inert = false;
    panel.classList.add('is-open');
    btn.setAttribute('aria-expanded', 'true');
    scrim.classList.add('is-open');
    document.body.classList.add('m-locked');
    setBehindInert(true);
    var row = panel.querySelector('.m-row[aria-current="true"], .m-row[aria-current="page"]');
    if (row) row.scrollIntoView({ block: 'center' });
    var focusTarget = panel.querySelector('.m-close');
    if (focusTarget) focusTarget.focus({ preventScroll: true });
  }

  /* Drag-to-dismiss shared by sheet (down) and drawer (right).
     Flick (>0.11px/ms) or 25% of the panel dismisses; dragging the wrong way meets friction. */
  function swipeToDismiss(panel, axis, canStart) {
    var id = null, start = 0, d = 0, t0 = 0, moved = false, suppressUntil = 0;
    panel.addEventListener('click', function (ev) {
      if (ev.timeStamp < suppressUntil) { ev.preventDefault(); ev.stopPropagation(); }
    }, true);
    function size() { return axis === 'y' ? panel.offsetHeight : panel.offsetWidth; }
    function apply(v) { panel.style.transform = axis === 'y' ? 'translateY(' + v + 'px)' : 'translateX(' + v + 'px)'; }
    panel.addEventListener('pointerdown', function (e) {
      if (id !== null || !panel.classList.contains('is-open')) return; // ignore extra fingers
      if (e.target.closest('.m-close')) return;
      if (canStart && !canStart(e)) return;
      id = e.pointerId; start = axis === 'y' ? e.clientY : e.clientX; d = 0; t0 = e.timeStamp; moved = false;
    });
    panel.addEventListener('pointermove', function (e) {
      if (e.pointerId !== id) return;
      var raw = (axis === 'y' ? e.clientY : e.clientX) - start;
      if (!moved && Math.abs(raw) < 6) return;
      if (!moved) { moved = true; panel.classList.add('is-dragging'); panel.setPointerCapture(id); }
      d = raw >= 0 ? raw : -Math.sqrt(-raw) * 2; // friction past the open position
      apply(d);
    });
    function end(e) {
      if (e.pointerId !== id) return;
      id = null;
      if (!moved) return;
      suppressUntil = e.timeStamp + 350;
      panel.classList.remove('is-dragging');
      var v = d / Math.max(1, e.timeStamp - t0);
      if (d > 0 && (d > size() * 0.25 || v > 0.11)) closeAll();
      else panel.style.transform = '';
    }
    panel.addEventListener('pointerup', end);
    panel.addEventListener('pointercancel', end);
  }

  if (scrim && drawer && sheet && toggle) {
    if (burger) burger.addEventListener('click', function () { open(drawer, burger); });
    toggle.addEventListener('click', function () { open(sheet, toggle); });
    scrim.addEventListener('click', closeAll);
    document.querySelectorAll('.m-close').forEach(function (b) { b.addEventListener('click', closeAll); });
    sheet.addEventListener('click', function (e) { if (e.target.closest('a')) { opener = null; closeAll(); } });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeAll(); });

    var list = sheet.querySelector('.m-sheet-list');
    swipeToDismiss(sheet, 'y', function (e) { return !(list.contains(e.target) && list.scrollTop > 0); });
    swipeToDismiss(drawer, 'x');

    /* Locked rows: explain instead of a dead tap */
    var toast = drawer.querySelector('.m-toast'), toastTimer;
    drawer.addEventListener('click', function (e) {
      if (!e.target.closest('.m-row.is-locked') || !toast) return;
      toast.textContent = 'Headout employees only · Sign in to view';
      toast.classList.add('is-shown');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(function () { toast.classList.remove('is-shown'); }, 2400);
    });

    /* Close overlays when growing past the breakpoints they belong to */
    matchMedia('(min-width: 1241px)').addEventListener('change', function (m) { if (m.matches) closeAll(); });
    matchMedia('(min-width: 861px)').addEventListener('change', function (m) { if (m.matches && current && current.panel === drawer) closeAll(); });
  }

  /* Mobile: hide the top bar while scrolling down, bring it back on scroll up */
  if (mHeader) {
    var lastY = window.scrollY, ticking = false, mobile = matchMedia('(max-width: 860px)');
    window.addEventListener('scroll', function () {
      if (ticking) return; ticking = true;
      requestAnimationFrame(function () {
        var y = window.scrollY, dy = y - lastY;
        if (!mobile.matches || y < 120 || current) mHeader.classList.remove('is-collapsed');
        else if (dy > 6) mHeader.classList.add('is-collapsed');
        else if (dy < -6) mHeader.classList.remove('is-collapsed');
        lastY = y; ticking = false;
      });
    }, { passive: true });
  }

  /* Desktop: locked nav items show their tooltip on tap too */
  document.querySelectorAll('.nav-item.is-locked').forEach(function (el) {
    el.addEventListener('click', function () {
      el.classList.add('is-tip-open');
      setTimeout(function () { el.classList.remove('is-tip-open'); }, 2400);
    });
  });

  /* Hovering a section heading previews its tick on the index rail */
  sections.forEach(function (s, i) {
    var h = s.querySelector('h2, h3');
    if (!h || !railMarks[i]) return;
    h.addEventListener('mouseenter', function () { railMarks[i].classList.add('is-hover'); });
    h.addEventListener('mouseleave', function () { railMarks[i].classList.remove('is-hover'); });
  });

  /* Pause decorative videos for reduced-motion users */
  if (reduceMotion.matches) {
    document.querySelectorAll('video[autoplay]').forEach(function (v) { v.removeAttribute('autoplay'); v.pause(); });
  }
  /* Only play videos that are on screen — resume where they left off when they return */
  else if ('IntersectionObserver' in window) {
    var vio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var v = en.target;
        if (en.isIntersecting) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
        else v.pause();
      });
    }, { rootMargin: '200px 0px' });
    document.querySelectorAll('video[autoplay]').forEach(function (v) { vio.observe(v); });
  }
})();

/* Download CTA: swap arrow → check for 1.5s after click */
document.querySelectorAll('.banner .btn').forEach(function (b) {
  var t;
  b.addEventListener('click', function () {
    b.classList.add('is-done'); clearTimeout(t);
    t = setTimeout(function () { b.classList.remove('is-done'); }, 1500);
  });
});
