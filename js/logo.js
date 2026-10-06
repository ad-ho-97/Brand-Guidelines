(function () {
  function toggleClearspaceGrid() {
    const wrap   = document.getElementById('cs-figure');
    const btn    = document.getElementById('clearspace-toggle-btn');
    const isActive = wrap.classList.contains('is-grid-active');
    wrap.classList.toggle('is-grid-active', !isActive);
    btn.classList.toggle('off', isActive);
    btn.setAttribute('aria-checked', String(!isActive));
  }

  function toggleConstructionGrid() {
    const wrap   = document.getElementById('ic-figure');
    const btn    = document.getElementById('ic-toggle-btn');
    const isActive = wrap.classList.contains('is-grid-active');
    wrap.classList.toggle('is-grid-active', !isActive);
    btn.classList.toggle('off', isActive);
    btn.setAttribute('aria-checked', String(!isActive));
  }

  window.toggleClearspaceGrid = toggleClearspaceGrid;
  window.toggleConstructionGrid = toggleConstructionGrid;
})();
