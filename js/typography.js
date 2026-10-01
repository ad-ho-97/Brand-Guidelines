  /* ─── Type scale (eevee named text styles) ─────────── */
  (function typeScale() {
    const list = document.getElementById('tsc-list');
    if (!list) return;
    // [name, family, size, weight, lineHeight, letterSpacing, sample]
    const GROUPS = [
      ['Display', 'var(--hd)', [
        ['display.extraLarge', 75, 500, 90, 0.8, 'Home to the world’s best experiences'],
        ['display.large',      60, 500, 72, 0.8, 'Home to the world’s best experiences'],
        ['display.medium',     48, 500, 54, 0.6, 'Home to the world’s best experiences'],
        ['display.regular',    36, 500, 44, 0.6, 'Home to the world’s best experiences'],
        ['display.small',      30, 500, 38, 0.4, 'Home to the world’s best experiences'],
        ['display.xs',         24, 500, 28, 0.4, 'Home to the world’s best experiences']
      ]],
      ['Heading (Halyard Text · 600)', 'var(--ht)', [
        ['heading.large',   24, 600, 28, 0, 'Skip the line, not the moment'],
        ['heading.medium',  21, 600, 28, 0, 'Skip the line, not the moment'],
        ['heading.regular', 18, 600, 24, 0, 'Skip the line, not the moment'],
        ['heading.small',   15, 600, 20, 0, 'Skip the line, not the moment']
      ]],
      ['Subheading (500)', 'var(--ht)', [
        ['subheading.large',   16, 500, 20, 0, 'Curated experiences, everywhere you go'],
        ['subheading.regular', 14, 500, 20, 0, 'Curated experiences, everywhere you go'],
        ['subheading.small',   12, 500, 16, 0, 'Curated experiences, everywhere you go']
      ]],
      ['CTA (500)', 'var(--ht)', [
        ['cta.large',   18, 500, 24, 0, 'Book now'],
        ['cta.regular', 16, 500, 20, 0, 'Book now'],
        ['cta.small',   14, 500, 20, 0, 'Book now']
      ]],
      ['UI label (Light 300 · heavy 500)', 'var(--ht)', [
        ['ui.label.large',        17, 300, 20, 0, 'Select your date and time'],
        ['ui.label.medium',       15, 300, 20, 0, 'Select your date and time'],
        ['ui.label.regular',      14, 300, 16, 0, 'Select your date and time'],
        ['ui.label.small',        12, 300, 16, 0, 'Select your date and time'],
        ['ui.label.regular.heavy',14, 500, 16, 0, 'Select your date and time']
      ]],
      ['Paragraph (Light 300)', 'var(--ht)', [
        ['para.large',   17, 300, 28, 0, 'Headout is the easiest way to discover and book incredible things to do wherever you are.'],
        ['para.medium',  15, 300, 24, 0, 'Headout is the easiest way to discover and book incredible things to do wherever you are.'],
        ['para.regular', 14, 300, 20, 0, 'Headout is the easiest way to discover and book incredible things to do wherever you are.'],
        ['para.small',   12, 300, 20, 0, 'Headout is the easiest way to discover and book incredible things to do wherever you are.'],
        ['para.quote',   14, 300, 20, 0, '“The best few hours of our whole trip.”'],
        ['para.caption', 12, 500, 16, 0, 'All prices include taxes and fees']
      ]],
      ['Tags (500 · uppercase)', 'var(--ht)', [
        ['tags.medium',  14, 500, 16, 0.4, 'Best seller'],
        ['tags.regular', 12, 500, 12, 0.4, 'Best seller'],
        ['tags.small',   10, 500, 12, 0.4, 'Best seller']
      ]],
      ['Table', 'var(--ht)', [
        ['table.large',   18, 300, 20, 0, 'Adult · €25.55'],
        ['table.regular', 16, 300, 16, 0, 'Adult · €25.55'],
        ['table.small',   14, 300, 16, 0, 'Adult · €25.55']
      ]]
    ];
    const frag = document.createDocumentFragment();
    GROUPS.forEach(([label, fam, rows]) => {
      const gl = document.createElement('div'); gl.className = 'tsc-group-lab'; gl.textContent = label;
      frag.appendChild(gl);
      rows.forEach(([nm, size, w, lh, ls, sample]) => {
        const row = document.createElement('div'); row.className = 'tsc-row';
        const s = document.createElement('div'); s.className = 'tsc-sample';
        s.textContent = sample;
        s.style.fontFamily = fam; s.style.fontWeight = w;
        s.style.fontSize = size + 'px'; s.style.lineHeight = lh + 'px';
        s.style.letterSpacing = ls + 'px';
        if (label.startsWith('Tags')) s.style.textTransform = 'capitalize';
        const spec = document.createElement('div'); spec.className = 'tsc-spec';
        spec.innerHTML = '<span class="nm">' + nm + '</span><br>' +
          size + '/' + lh + ' · ' + w + (ls ? ' · ' + ls + 'px' : '');
        row.append(s, spec); frag.appendChild(row);
      });
    });
    list.appendChild(frag);
  })();
