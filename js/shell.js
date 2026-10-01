(function () {
  /* ─── Navigation ─────────────────────────────────── */
  // Every sweep leads with Purps and merges into the section's own colour, [purps, colour]
  const LOAD_COLORS = {
    overview:    ['#8000FF', '#B266FF'], // Purps → light Purps (landing)
    logo:        ['#8000FF', '#00C4EB'], // Purps → Ocean Blue
    color:       ['#8000FF', '#FE3394'], // Purps → Candy (pink)
    typography:  ['#8000FF', '#15D676'], // Purps → Okay Green
    layout:      ['#8000FF', '#FFE900'], // Purps → Hola Yellow
    motion:      ['#8000FF', '#FFBC00'], // Purps → Joy Mustard
    iconography: ['#8000FF', '#FF9D7C']  // Purps → Peachy Orange
  };

  /* ─── Cross-page navigation: sweep transition, then a real page load ───
     Replaces the old SPA navigate()/doNavigate() DOM-swap pair now that
     each page is its own physical file. Same-page hash links are left to
     native browser anchor scrolling (no sweep, no interception). */
  var PAGE_BY_PATH = {
    '/': 'overview',
    '/logo': 'logo',
    '/color': 'color',
    '/typography': 'typography',
    '/layout': 'layout',
    '/motion': 'motion',
    '/iconography': 'iconography'
  };
  function normalizePath(path) {
    if (path === '/') return '/';
    return path.replace(/\/+$/, '');
  }
  document.addEventListener('click', function (e) {
    if (e.defaultPrevented) return;
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest('a[href]');
    if (!a) return;
    if (a.target === '_blank' || a.hasAttribute('download') || a.rel === 'external') return;

    var url;
    try { url = new URL(a.href, window.location.href); } catch (err) { return; }
    if (url.origin !== window.location.origin) return;

    var fromPath = normalizePath(window.location.pathname);
    var toPath = normalizePath(url.pathname);
    if (toPath === fromPath) return; // same page — native anchor scroll, no sweep

    e.preventDefault();
    var page = PAGE_BY_PATH[toPath] || 'overview';
    var loader = document.getElementById('page-loader');
    if (!loader) { window.location.href = a.href; return; }
    var c = LOAD_COLORS[page] || LOAD_COLORS.overview;
    loader.style.setProperty('--l1', c[0]);
    loader.style.setProperty('--l2', c[1]);
    loader.classList.remove('sweep');
    void loader.offsetWidth; // reflow
    loader.classList.add('sweep');
    setTimeout(function () { window.location.href = a.href; }, 616);
  });

  /* ─── Mobile menu ─────────────────────────────────── */
  function toggleMobileMenu(force) {
    const open = typeof force === 'boolean' ? force : !document.body.classList.contains('menu-open');
    document.body.classList.toggle('menu-open', open);
    const b = document.getElementById('m-burger');
    if (b) { b.setAttribute('aria-expanded', String(open)); b.setAttribute('aria-label', open ? 'Close menu' : 'Open menu'); }
  }
  // Close the sheet when a nav link is tapped
  document.addEventListener('click', e => {
    if (document.body.classList.contains('menu-open') && e.target.closest('.sidebar') && e.target.closest('a, .nav-parent')) toggleMobileMenu(false);
  });
  window.addEventListener('resize', () => { if (innerWidth > 1023) toggleMobileMenu(false); });

  /* ─── Pixel-canvas scaler ────────────────────────────
     Native-text sections are laid out in a fixed 1254px
     design space (exact Figma coordinates) and scaled to
     fit the container so proportions stay pixel-perfect. */
  function scalePxCanvases() {
    document.querySelectorAll('.px-wrap').forEach(wrap => {
      const canvas = wrap.querySelector('.px-canvas');
      if (!canvas) return;
      const designW = parseFloat(canvas.dataset.w || '1254');
      const designH = parseFloat(canvas.dataset.h || '506');
      const w = wrap.clientWidth;
      if (!w) return; // hidden page — rescaled on navigate
      const s = Math.min(w / designW, 1);
      canvas.style.transform = 'scale(' + s + ')';
      wrap.style.height = (designH * s) + 'px';
    });
  }
  window.addEventListener('resize', scalePxCanvases);

  /* ─── Section toggles ────────────────────────────── */
  function toggleSection(id) {
    const items = document.getElementById('items-' + id);
    const chevron = document.getElementById('chevron-' + id);
    if (!items) return;
    const isOpen = items.style.display !== 'none';
    items.style.display = isOpen ? 'none' : '';
    if (chevron) chevron.classList.toggle('open', !isOpen);
  }

  /* ─── Active child link highlight on scroll ──────── */
  function updateActiveChild() {
    const scroll = (document.getElementById('main-scroll').scrollTop || window.scrollY) + 140;
    const sections = document.querySelectorAll('.page.active [id]');
    let active = null;
    sections.forEach(s => {
      if (s.offsetTop <= scroll) active = s.id;
    });
    document.querySelectorAll('.nav-child').forEach(a => {
      const href = a.getAttribute('href') || '';
      a.classList.toggle('active', active != null && href.endsWith('#' + active));
    });
  }
  document.getElementById('main-scroll').addEventListener('scroll', updateActiveChild, { passive: true });
  window.addEventListener('scroll', updateActiveChild, { passive: true });

  window.addEventListener('DOMContentLoaded', () => {
    scalePxCanvases();

    // Graceful fallback for expired Figma image links
    document.querySelectorAll('.fig-sec img').forEach(img => {
      img.addEventListener('error', () => {
        const d = document.createElement('div');
        d.className = 'img-missing';
        d.textContent = (img.alt || 'Section image') + ' — this image link has expired. Ask Claude to re-export it from Figma.';
        img.replaceWith(d);
      });
    });
  });

  window.toggleMobileMenu = toggleMobileMenu;
  window.toggleSection = toggleSection;
  window.scalePxCanvases = scalePxCanvases;
})();
