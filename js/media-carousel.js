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
    let lbSlides = [], lbIndex = 0;

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

    function openLightbox(slides, index) {
      lbSlides = slides; lbIndex = index;
      renderLightbox();
      lb.classList.add('on'); lb.setAttribute('aria-hidden', 'false');
    }
    function renderLightbox() {
      lbStage.innerHTML = '';
      lbStage.appendChild(mediaEl(lbSlides[lbIndex], false));
      lbPrev.disabled = lbIndex <= 0;
      lbNext.disabled = lbIndex >= lbSlides.length - 1;
    }
    function closeLightbox() { lb.classList.remove('on'); lb.setAttribute('aria-hidden', 'true'); lbStage.innerHTML = ''; }
    lbPrev.addEventListener('click', () => { if (lbIndex > 0) { lbIndex--; renderLightbox(); } });
    lbNext.addEventListener('click', () => { if (lbIndex < lbSlides.length - 1) { lbIndex++; renderLightbox(); } });
    lbClose.addEventListener('click', closeLightbox);
    lb.addEventListener('click', e => { if (e.target === lb) closeLightbox(); });
    document.addEventListener('keydown', e => {
      if (!lb.classList.contains('on')) return;
      if (e.key === 'Escape') closeLightbox();
      else if (e.key === 'ArrowLeft') lbPrev.click();
      else if (e.key === 'ArrowRight') lbNext.click();
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
      slides.forEach(s => {
        const sl = document.createElement('div'); sl.className = 'mcar-slide';
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
        d.addEventListener('click', () => go(i));
        dots.appendChild(d);
        return d;
      });
      car.append(prev, next, expand, dots);

      function go(i) {
        idx = Math.max(0, Math.min(i, slides.length - 1));
        track.style.transform = 'translateX(' + (-idx * 100) + '%)';
        dotBtns.forEach((d, k) => d.classList.toggle('on', k === idx));
        const wrap = !!car.dataset.auto;
        prev.disabled = !wrap && idx === 0;
        next.disabled = !wrap && idx === slides.length - 1;
      }
      prev.addEventListener('click', () => { go(car.dataset.auto ? (idx - 1 + slides.length) % slides.length : idx - 1); userTouched(); });
      next.addEventListener('click', () => { go(car.dataset.auto ? (idx + 1) % slides.length : idx + 1); userTouched(); });
      dotBtns.forEach(d => d.addEventListener('click', userTouched));
      expand.addEventListener('click', () => openLightbox(slides, idx));
      go(0);

      // Optional auto-play: data-auto="ms". Wraps around, pauses on hover and after
      // any manual input (resumes after 3 cycles), and only runs while on screen.
      const autoMs = parseInt(car.dataset.auto || '0', 10);
      let hover = false, holdUntil = 0, visible = true;
      function userTouched() { holdUntil = performance.now() + autoMs * 3; }
      if (autoMs > 0 && slides.length > 1) {
        car.addEventListener('mouseenter', () => { hover = true; });
        car.addEventListener('mouseleave', () => { hover = false; });
        if ('IntersectionObserver' in window) new IntersectionObserver(es => { visible = es[0].isIntersecting; }, { threshold: 0.3 }).observe(car);
        setInterval(() => {
          if (hover || !visible || document.hidden || performance.now() < holdUntil) return;
          go((idx + 1) % slides.length);
        }, autoMs);
      }
    });
  })();
})();
