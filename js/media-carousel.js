(function () {
  /* ─── Colour "in use" media carousels ──────────────
     Populate these arrays later with the uploaded assets. Each slide:
       { type: 'image', src: 'my-photo.jpg', alt: '...' }
       { type: 'video', src: 'my-clip.mp4', poster: 'thumb.jpg' }
     Leave an array empty to show the black placeholder.            */
  const CAROUSELS = {
    purps: [
      { type: 'image', src: 'assets/images/purps-use-hero.jpg', alt: 'Headout tote bag on the street' },
      { type: 'video', src: 'assets/video/purps-use-tabs.mp4' },
      { type: 'image', src: 'assets/images/purps-use-suitcase.jpg', alt: 'Traveller with a Headout-branded suitcase' },
      { type: 'image', src: 'assets/images/purps-use-jeep.jpg', alt: 'Headout-branded SUV on a desert dune safari' },
      { type: 'image', src: 'assets/images/purps-use-pocketguide.jpg', alt: 'Headout Purps pocket guide in a jacket pocket' },
      { type: 'video', src: 'assets/video/purps-use-appicon-loop.mp4' },
      { type: 'video', src: 'assets/video/purps-use-3.mp4' }
    ],
    logoaction: [
      { type: 'image', src: 'assets/images/logo-action-1.jpg', alt: 'Friends on a New York street, one in a Headout varsity jacket' },
      { type: 'image', src: 'assets/images/logo-action-2.jpg', alt: 'Headout flag held up at the Trevi Fountain' },
      { type: 'image', src: 'assets/images/logo-action-3.jpg', alt: 'Speaker at a Headout-branded podium' }
    ],
    secondary: [
      { type: 'video', src: 'assets/video/secondary-use-1.mp4' },
      { type: 'video', src: 'assets/video/secondary-use-2.mp4' },
      { type: 'video', src: 'assets/video/secondary-use-3.mp4' },
      { type: 'video', src: 'assets/video/secondary-use-4.mp4' },
      { type: 'video', src: 'assets/video/secondary-use-5.mp4' }
    ],
    typesetting: [],
    alignment: [
      { type: 'image', src: 'assets/images/alignment-5.jpg' },
      { type: 'image', src: 'assets/images/alignment-3.jpg' },
      { type: 'image', src: 'assets/images/alignment-1.jpg' },
      { type: 'image', src: 'assets/images/alignment-4.jpg' },
      { type: 'image', src: 'assets/images/alignment-2.jpg' },
      { type: 'image', src: 'assets/images/alignment-6.jpg' }
    ]
  };

  (function initCarousels() {
    const lb      = document.getElementById('mcar-lightbox');
    const lbStage = document.getElementById('mlb-stage');
    const lbPrev  = document.getElementById('mlb-prev');
    const lbNext  = document.getElementById('mlb-next');
    const lbClose = document.getElementById('mlb-close');
    let lbSlides = [], lbIndex = 0, lbTrigger = null;

    function mediaEl(slide, cover) {
      if (slide.type === 'video') {
        const v = document.createElement('video');
        v.src = slide.src; v.muted = true; v.loop = true; v.playsInline = true; v.autoplay = true;
        if (slide.poster) v.poster = slide.poster;
        v.style.objectFit = cover ? 'cover' : 'contain';
        return v;
      }
      const img = document.createElement('img');
      img.src = slide.src; img.alt = slide.alt || '';
      img.style.objectFit = cover ? 'cover' : 'contain';
      return img;
    }

    function openLightbox(slides, index, trigger) {
      lbSlides = slides; lbIndex = index; lbTrigger = trigger || document.activeElement;
      renderLightbox();
      lb.classList.add('on'); lb.setAttribute('aria-hidden', 'false');
      lbClose.focus();
    }
    function renderLightbox() {
      lbStage.innerHTML = '';
      lbStage.appendChild(mediaEl(lbSlides[lbIndex], false));
      lbPrev.disabled = lbIndex <= 0;
      lbNext.disabled = lbIndex >= lbSlides.length - 1;
    }
    function closeLightbox() {
      lb.classList.remove('on'); lb.setAttribute('aria-hidden', 'true'); lbStage.innerHTML = '';
      if (lbTrigger && typeof lbTrigger.focus === 'function') lbTrigger.focus();
      lbTrigger = null;
    }
    lbPrev.addEventListener('click', () => { if (lbIndex > 0) { lbIndex--; renderLightbox(); } });
    lbNext.addEventListener('click', () => { if (lbIndex < lbSlides.length - 1) { lbIndex++; renderLightbox(); } });
    lbClose.addEventListener('click', closeLightbox);
    lb.addEventListener('click', e => { if (e.target === lb) closeLightbox(); });
    document.addEventListener('keydown', e => {
      if (!lb.classList.contains('on')) return;
      if (e.key === 'Escape') { closeLightbox(); return; }
      if (e.key === 'ArrowLeft') { lbPrev.click(); return; }
      if (e.key === 'ArrowRight') { lbNext.click(); return; }
      // Focus trap: Tab/Shift+Tab cycle between the three controls while the dialog is open.
      if (e.key === 'Tab') {
        const focusable = [lbClose, lbPrev, lbNext].filter(el => !el.disabled);
        const first = focusable[0], last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });

    document.querySelectorAll('.mcar[data-carousel]').forEach(car => {
      const slides = CAROUSELS[car.dataset.carousel] || [];
      car.innerHTML = '';

      if (!slides.length) {
        car.innerHTML =
          '<div class="mcar-empty">' +
            '<svg viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" stroke-width="1.6"/><path d="M3 15l5-5 4 4 3-3 6 6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><circle cx="8.5" cy="9" r="1.5" fill="currentColor"/></svg>' +
            'Images &amp; videos coming soon' +
          '</div>';
        return;
      }

      let idx = 0;
      const track = document.createElement('div'); track.className = 'mcar-track';
      slides.forEach((s, i) => {
        const sl = document.createElement('div'); sl.className = 'mcar-slide';
        sl.setAttribute('role', 'group');
        sl.setAttribute('aria-roledescription', 'slide');
        sl.setAttribute('aria-label', (i + 1) + ' of ' + slides.length);
        sl.appendChild(mediaEl(s, true));
        track.appendChild(sl);
      });
      car.appendChild(track);

      const prev = document.createElement('button'); prev.className = 'mcar-btn prev'; prev.setAttribute('aria-label','Previous');
      prev.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M15 5l-7 7 7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      const next = document.createElement('button'); next.className = 'mcar-btn next'; next.setAttribute('aria-label','Next');
      next.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M9 5l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      const expand = document.createElement('button'); expand.className = 'mcar-expand'; expand.setAttribute('aria-label','Expand');
      expand.innerHTML = '<svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      const dots = document.createElement('div'); dots.className = 'mcar-dots';
      const dotBtns = slides.map((_, i) => {
        const d = document.createElement('button');
        d.setAttribute('aria-label', 'Go to slide ' + (i + 1) + ' of ' + slides.length);
        d.addEventListener('click', () => { go(i); userTouched(); });
        dots.appendChild(d);
        return d;
      });
      car.append(prev, next, expand, dots);

      // Manual navigation always has a clear start and end — it never wraps,
      // even on an auto-rotating carousel (carousel.md: "never loop it automatically").
      function go(i) {
        idx = Math.max(0, Math.min(i, slides.length - 1));
        track.style.transform = 'translateX(' + (-idx * 100) + '%)';
        dotBtns.forEach((d, k) => d.classList.toggle('on', k === idx));
        prev.disabled = idx === 0;
        next.disabled = idx === slides.length - 1;
      }
      prev.addEventListener('click', () => { go(idx - 1); userTouched(); });
      next.addEventListener('click', () => { go(idx + 1); userTouched(); });
      expand.addEventListener('click', () => openLightbox(slides, idx, expand));
      go(0);

      // Optional auto-play: data-auto="ms". The *autoplay timer* loops back to the
      // first slide (a slideshow), but manual Prev/Next/dots above still stop at the
      // real ends. Pauses on hover, on keyboard focus inside the carousel, and after
      // any manual input (resumes after 3 cycles); only runs while on screen; carries
      // its own stop/restart control (carousel.md: auto-rotation needs all three).
      const autoMs = parseInt(car.dataset.auto || '0', 10);
      let hover = false, focused = false, paused = false, holdUntil = 0, visible = true;
      function userTouched() { holdUntil = performance.now() + autoMs * 3; }
      if (autoMs > 0 && slides.length > 1) {
        car.addEventListener('mouseenter', () => { hover = true; });
        car.addEventListener('mouseleave', () => { hover = false; });
        car.addEventListener('focusin', () => { focused = true; });
        car.addEventListener('focusout', () => { focused = false; });
        if ('IntersectionObserver' in window) new IntersectionObserver(es => { visible = es[0].isIntersecting; }, { threshold: 0.3 }).observe(car);

        const playPause = document.createElement('button');
        playPause.className = 'mcar-playpause';
        const pauseIcon = '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>';
        const playIcon  = '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M7 5l12 7-12 7V5z"/></svg>';
        playPause.innerHTML = pauseIcon;
        playPause.setAttribute('aria-label', 'Pause autoplay');
        playPause.setAttribute('aria-pressed', 'false');
        playPause.addEventListener('click', () => {
          paused = !paused;
          playPause.innerHTML = paused ? playIcon : pauseIcon;
          playPause.setAttribute('aria-label', paused ? 'Resume autoplay' : 'Pause autoplay');
          playPause.setAttribute('aria-pressed', String(paused));
        });
        car.appendChild(playPause);

        setInterval(() => {
          if (paused || hover || focused || !visible || document.hidden || performance.now() < holdUntil) return;
          go(idx + 1 >= slides.length ? 0 : idx + 1);
        }, autoMs);
      }
    });
  })();
})();
