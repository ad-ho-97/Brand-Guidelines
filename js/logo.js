(function () {
  function toggleClearspaceGrid() {
    const gridOn  = document.getElementById('cs-grid-on');
    const gridOff = document.getElementById('cs-grid-off');
    const btn     = document.getElementById('clearspace-toggle-btn');
    const isOn    = gridOn.style.display !== 'none';
    gridOn.style.display  = isOn ? 'none' : '';
    gridOff.style.display = isOn ? '' : 'none';
    btn.classList.toggle('off', isOn);
    btn.setAttribute('aria-checked', String(!isOn));
  }

  function toggleConstructionGrid() {
    const gridOn  = document.getElementById('ic-grid-on');
    const gridOff = document.getElementById('ic-grid-off');
    const btn     = document.getElementById('ic-toggle-btn');
    const isOn    = gridOn.style.display !== 'none';
    gridOn.style.display  = isOn ? 'none' : '';
    gridOff.style.display = isOn ? '' : 'none';
    btn.classList.toggle('off', isOn);
    btn.setAttribute('aria-checked', String(!isOn));
  }

  window.toggleClearspaceGrid = toggleClearspaceGrid;
  window.toggleConstructionGrid = toggleConstructionGrid;
})();
