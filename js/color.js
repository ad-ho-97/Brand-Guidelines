  /* ─── Suggested combinations: colour-blend tool ───────
     Drag the dot; the field blends 6 brand moods by inverse-distance
     weighting to hexagon-vertex anchors, and eases each frame so the
     colour glides as smoothly as the reference video.               */
  (function comboTool() {
    const field = document.getElementById('ct-field');
    if (!field) return;
    const dot   = document.getElementById('ct-dot');
    const cardT = document.getElementById('ct-card-top');
    const cardB = document.getElementById('ct-card-bot');
    const layers = field.querySelectorAll('.ct-state');

    // The 6 hexagon vertices (from the Figma SVG) — the ONLY 6 states.
    // Each vertex maps to one Figma artwork layer + its brand tint. The dot
    // snaps between them and the layers crossfade; no in-between mixes.
    // Positions inset ~72% toward each hexagon vertex, so the dot rests
    // INSIDE the hexagon (matching Figma) rather than on its outer corner.
    const VERTS = [
      { x: 0.3016, y: 0.4994, tint: '#8000FF' }, // left         → Purps  (layer 1)
      { x: 0.3839, y: 0.3570, tint: '#FE3394' }, // top-left     → Pink   (layer 2)
      { x: 0.6218, y: 0.3570, tint: '#FF7B00' }, // top-right    → Orange (layer 3)
      { x: 0.7034, y: 0.4994, tint: '#FFE900' }, // right        → Yellow (layer 4)
      { x: 0.6218, y: 0.6430, tint: '#15D676' }, // bottom-right → Green  (layer 5)
      { x: 0.3839, y: 0.6430, tint: '#00D5FF' }  // bottom-left  → Blue   (layer 6)
    ];

    let target = 0, shown = -1;
    let cx = VERTS[0].x, cy = VERTS[0].y;   // eased dot position

    function nearestVertex(px, py) {
      let best = 0, bd = Infinity;
      for (let i = 0; i < 6; i++) {
        const dx = px - VERTS[i].x, dy = py - VERTS[i].y, d = dx*dx + dy*dy;
        if (d < bd) { bd = d; best = i; }
      }
      return best;
    }

    // Per-mood media for the two cards (index matches VERTS). null = placeholder.
    const MOOD_MEDIA = [
      {     // 0 Purps
        top: { type: 'image', src: 'assets/images/combo-purps-top.jpg' },
        bot: { type: 'image', src: 'assets/images/combo-purps-bot.jpg' }
      },
      {     // 1 Candy (pink)
        top: { type: 'image', src: 'assets/images/combo-pink-top.jpg' },
        bot: { type: 'image', src: 'assets/images/combo-pink-bot.jpg' }
      },
      {     // 2 Orange
        top: { type: 'image', src: 'assets/images/combo-orange-top.jpg' },
        bot: { type: 'image', src: 'assets/images/combo-orange-bot.jpg' }
      },
      {     // 3 Yellow
        top: { type: 'image', src: 'assets/images/combo-yellow-top.jpg' },
        bot: { type: 'image', src: 'assets/images/combo-yellow-bot.jpg' }
      },
      {     // 4 Green
        top: { type: 'image', src: 'assets/images/combo-green-top.jpg' },
        bot: { type: 'image', src: 'assets/images/combo-green-bot.jpg' }
      },
      {     // 5 Blue
        top: { type: 'image', src: 'assets/images/combo-blue-top.jpg' },
        bot: { type: 'image', src: 'assets/images/combo-blue-bot.jpg' }
      }
    ];
    function setCard(card, media) {
      const key = media ? media.type + ':' + media.src : '';
      if (card.dataset.media === key) return;      // unchanged → no DOM churn
      card.dataset.media = key;
      if (media) {
        card.classList.add('has-media');
        card.innerHTML = media.type === 'video'
          ? '<video class="ct-card-media" src="' + media.src + '" autoplay loop muted playsinline></video>'
          : '<img class="ct-card-media" src="' + media.src + '" alt="" />';
      } else {
        card.classList.remove('has-media');
        card.innerHTML = '<span class="ct-card-tag">Image coming soon</span>';
      }
    }

    // Warm the cache: decode all mood images up front so a swap never stalls a frame
    MOOD_MEDIA.forEach(m => [m.top, m.bot].forEach(x => {
      if (x && x.type === 'image') { const im = new Image(); im.src = x.src; if (im.decode) im.decode().catch(() => {}); }
    }));
    const BRIGHT = new Set([3, 4]); // Yellow, Green — light fields need a darker-keyed glass
    function show(i) {
      layers.forEach((l, k) => l.classList.toggle('on', k === i));
      field.dataset.mood = i;
      field.classList.toggle('bright', BRIGHT.has(i));
      cardT.style.setProperty('--tint', VERTS[i].tint);
      cardB.style.setProperty('--tint', VERTS[i].tint);
      const m = MOOD_MEDIA[i] || {};
      setCard(cardT, m.top);
      setCard(cardB, m.bot);
      shown = i;
    }

    // ── Motion: the dot travels vertex → vertex on a fixed-duration eased tween
    //    (TRAVEL ms), then dwells. Auto-play walks the six corners in order;
    //    any manual drag/keyboard input takes over and auto-play resumes after
    //    keeps going: a manual nudge just restarts the dwell timer from that corner.
    //    Auto-advance is held only while the pointer is actually down. Paused off-screen.
    const TRAVEL = 450, DWELL = 2200;
    const easeInOut = t => t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t + 2, 3) / 2;
    let tween = null;               // { x0, y0, x1, y1, t0 }
    let tweenTarget = -1;
    let nextAutoAt = performance.now() + DWELL, visible = true, dragging = false;

    function setTarget(i, byUser) {
      target = i;
      if (byUser) nextAutoAt = performance.now() + TRAVEL + DWELL;   // restart the dwell from here
    }

    let fw = 0, fh = 0;
    function measure() { const r = field.getBoundingClientRect(); fw = r.width; fh = r.height; }
    measure();
    window.addEventListener('resize', measure, { passive: true });
    if ('ResizeObserver' in window) new ResizeObserver(measure).observe(field);   // page may be hidden at load
    function placeDot() { if (!fw) measure(); dot.style.transform = 'translate3d(' + (cx * fw).toFixed(2) + 'px,' + (cy * fh).toFixed(2) + 'px,0)'; }

    let pendingShow = -1;
    function frame(now) {
      // Auto-play: advance to the next corner after the dwell, once the dot has arrived
      if (visible && !dragging && !tween && now >= nextAutoAt) {
        target = (target + 1) % 6;
        nextAutoAt = now + TRAVEL + DWELL;
      }
      // Start a new tween whenever the target changes
      if (target !== tweenTarget) {
        tween = { x0: cx, y0: cy, x1: VERTS[target].x, y1: VERTS[target].y, t0: now };
        tweenTarget = target;
        pendingShow = target;            // theme swap runs a frame later, off the tween's first frame
      }
      if (tween) {
        const p = Math.min(1, (now - tween.t0) / TRAVEL), e = easeInOut(p);
        cx = tween.x0 + (tween.x1 - tween.x0) * e;
        cy = tween.y0 + (tween.y1 - tween.y0) * e;
        if (p >= 1) tween = null;
        placeDot();
      }
      requestAnimationFrame(frame);
      if (pendingShow >= 0 && (!tween || now - tween.t0 > 16)) {
        const i = pendingShow; pendingShow = -1;
        if (i !== shown) show(i);
      }
    }
    show(0);
    placeDot();
    tweenTarget = 0;
    requestAnimationFrame(frame);

    // Only auto-play while the tool is on screen
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(es => { visible = es[0].isIntersecting; if (visible) nextAutoAt = performance.now() + DWELL; },
        { threshold: 0.25 }).observe(field);
    }

    function pick(e) {
      const r = field.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      setTarget(nearestVertex(px, py), true);
    }
    field.addEventListener('pointerdown', e => { dragging = true; pick(e); field.setPointerCapture && field.setPointerCapture(e.pointerId); e.preventDefault(); });
    field.addEventListener('pointermove', e => { if (dragging) { pick(e); e.preventDefault(); } });
    window.addEventListener('pointerup', () => { if (dragging) { dragging = false; nextAutoAt = performance.now() + DWELL; } });
    dot.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown')      setTarget((target + 1) % 6, true);
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp')    setTarget((target + 5) % 6, true);
      else return;
      e.preventDefault();
    });
  })();

  /* ─── Colour decks: Dropbox-style stacked cards ─────────────
     Overlapping top-rounded cards in a flat band. Hovering pulls
     the card up out of the stack (translateY + slight tilt) with
     a soft falloff lift on its neighbours. */
  (function () {
    function lum(hex) {
      const n = parseInt(hex.slice(1), 16);
      return (0.2126 * ((n >> 16) & 255) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255)) / 255;
    }
    const ink = h => (lum(h) > 0.6 ? '#111111' : '#FFFFFF');

    const PRIMARY = [
      { n: 'Purps',       h: '#8000FF' },
      { n: 'White',       h: '#FFFFFF' },
      { n: 'Slate Black', h: '#111111' }
    ];

    /* Secondary palette: Purps + five hues as single swatches (no shade ramps) */
    const SECONDARY_SINGLE = [
      { n: 'Pink',   h: '#FE3394' },
      { n: 'Green',  h: '#15D676' },
      { n: 'Blue',   h: '#00D5FF' },
      { n: 'Yellow', h: '#FFE900' },
      { n: 'Orange', h: '#FF7B00' }
    ];

    /* Playground / tertiary ramps — hexes approximated from swatch reference */
    const PLAYGROUND = [
      { n: 'Purps',   s: ['#FAF5FF', '#F4EBFF', '#EDE0FF', '#E5D5FF', '#DECBFF', '#D6C0FF', '#CFB5FF', '#C7AAFF', '#B995FF', '#A97CFF', '#9A62FF', '#8000FF', '#6E00DB', '#5C00B8', '#30005C', '#150028'] },
      { n: 'Candy',   s: ['#FFF1F7', '#FFE4F0', '#F963AC', '#F23D96', '#EC2C8B', '#D62478', '#B21C60', '#5C0E30'] },
      { n: 'Pale',    s: ['#FBEFE8', '#F3D3C4', '#EFC4B1', '#DCA99B', '#C69590', '#9E7370'] },
      { n: 'Orange',  s: ['#FDECDE', '#FBE0CB', '#F6C6A4', '#F1A87C', '#E29066', '#D07E55', '#B26445'] },
      { n: 'Yellow',  s: ['#FFFBE1', '#FEF7C5', '#FBEA60', '#F9E040', '#F0D23C', '#D7BB3D', '#A9932E'] },
      { n: 'Mustard', s: ['#FDF4DD', '#FAE8BE', '#F4D075', '#F0BB4C', '#E5AB40', '#D29C37', '#B38128'] },
      { n: 'Green 1', s: ['#F8FCE4', '#F1F8CA', '#E2F187', '#CBE562', '#B6D458', '#9ABA4D', '#6F8936'] },
      { n: 'Green 2', s: ['#EFFBF4', '#D9F4E3', '#B6EDCC', '#82E4AB', '#52D78D', '#31AA6A', '#218B55', '#155D39'] },
      { n: 'Blue 1',  s: ['#EDFBFD', '#C2F1FA', '#66D7EC', '#58BFDD', '#4EAAC7', '#4494AD', '#35798E', '#1F4D5C'] },
      { n: 'Blue 2',  s: ['#C4D3FC', '#91AFF9', '#567AF0', '#3156E8', '#2445DA', '#1D3ABD', '#152674'] },
      { n: 'Red',     s: ['#FDEAE8', '#FAD9D5', '#E99D94', '#E16C5E', '#E13424', '#CC2B1E', '#B12519', '#60160D'] }
    ];

    /* click-to-copy hex with a brief "Copied!" flash */
    function copyHex(card, hex) {
      const span = card.querySelector('.hex');
      const done = () => {
        if (!span) return;
        span.textContent = 'Copied!';
        clearTimeout(span._t);
        span._t = setTimeout(() => { span.textContent = hex; }, 900);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(hex).then(done, done);
      } else {
        const ta = document.createElement('textarea');
        ta.value = hex; document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); } catch (e) {}
        document.body.removeChild(ta); done();
      }
    }

    /* groups: [{lab, colors:[{n,h}]}] — each group renders as its own
       mini-stack (cluster), so families read as clear categories */
    function buildDeck(id, groups, opt) {
      const deck = document.getElementById(id);
      if (!deck) return;
      const gap = opt.gap || 0;
      deck.style.display = 'flex';
      deck.style.gap = gap + 'px';
      let labsRow = null;
      if (groups.some(g => g.lab)) {
        labsRow = document.createElement('div');
        labsRow.className = 'deck-cluster-labs';
        labsRow.style.gap = gap + 'px';
        deck.parentNode.appendChild(labsRow);
      }
      groups.forEach(g => {
        const cl = document.createElement('div');
        cl.className = 'deck-cluster';
        deck.appendChild(cl);
        if (labsRow) {
          const lb = document.createElement('div');
          lb.className = 'deck-cluster-lab';
          lb.textContent = g.lab || '';
          labsRow.appendChild(lb);
        }
        const n = g.colors.length;
        const step = n > 1 ? (100 - opt.cardW) / (n - 1) : 0;
        const cards = g.colors.map((c, i) => {
          const card = document.createElement('div');
          card.className = 'deck-card' + (lum(c.h) > 0.88 ? ' lite' : '') + (opt.slim ? ' slim' : '');
          card.style.left = (i * step).toFixed(3) + '%';
          card.style.width = opt.cardW + '%';
          card.style.background = c.h;
          card.innerHTML =
            '<div class="dk-info" style="color:' + ink(c.h) + '">' +
              '<span class="nm">' + c.n + '</span>' +
              '<span class="hex">' + c.h + '</span>' +
            '</div>';
          card.addEventListener('click', () => copyHex(card, c.h));
          cl.appendChild(card);
          return card;
        });
        cards.forEach((card, i) => {
          card.addEventListener('mouseenter', () => {
            // Dropbox mechanic (verified from their live code): the hovered card
            // lifts high so its TOP (name+hex) floats above the strip; the others
            // lift a little. NO z-index change and NO width change — so in the
            // strip zone the later cards keep covering, and nothing gets hidden.
            cards.forEach((c) => { c.style.transform = 'translateY(-20px)'; });
            card.style.transform = 'translateY(-96px) rotate(-0.6deg)';
          });
          card.addEventListener('mouseleave', () => {
            card.style.transform = '';
          });
        });
        cl.addEventListener('mouseleave', () => {
          cards.forEach(c => { c.style.transform = ''; });
          clearTimeout(deck._zt);
          deck._zt = setTimeout(() => cards.forEach(c => { c.style.zIndex = ''; }), 500);
        });
      });
    }

    buildDeck('deck-primary', [{ colors: PRIMARY }], { cardW: 66 });

    /* secondary: Purps + five secondary hues as single cards,
       same interaction as primary (tints/shades removed) */
    buildDeck('deck-secondary', [{ colors: SECONDARY_SINGLE }], { cardW: 32, grow: 1.6 });
  })();
