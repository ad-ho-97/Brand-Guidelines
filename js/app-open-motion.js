/* App-open motion — shared controller.
   Pairs with css/app-open-motion.css. Markup contract:
     .screen[data-state]  root, states: idle | press | open | exit (loop dissolve)
       .app-icon          tappable Headout icon
       .app-back          back arrow inside the opened app
   Usage: const m = AppOpenMotion.init(screenEl); m.start(); m.loop = true; */
window.AppOpenMotion = (() => {
  const sleep = (t) => new Promise(r => setTimeout(r, t));

  function init(screen) {
    const root = document.documentElement;
    const icon = screen.querySelector('.app-icon');
    const back = screen.querySelector('.app-back');

    const speed = () => parseFloat(getComputedStyle(root).getPropertyValue('--speed')) || 1;
    const ms = (base) => base * speed();
    const state = () => screen.dataset.state;
    const set = (s) => { screen.dataset.state = s; };

    // ?state=open / ?state=press — jump straight to a state (QA screenshots)
    const qs = new URLSearchParams(location.search);
    const forced = qs.get('state');
    if (forced) {
      // durations are calc()'d on :root, so the override has to live there too
      root.style.setProperty('--speed', qs.get('speed') || '0');
      requestAnimationFrame(() => requestAnimationFrame(() => set(forced)));
    }
    // ?shine=<ms> — freeze the shimmer band at that point of its cycle (QA)
    if (qs.get('shine')) {
      const band = screen.querySelector('.shield-shine-band');
      band.style.animationDuration = '3400ms';
      band.style.animationDelay = `-${qs.get('shine')}ms`;
      band.style.animationPlayState = 'paused';
    }

    // --- direct interaction (pointer-driven: press → release → open) ---
    icon.addEventListener('pointerdown', (e) => {
      if (state() !== 'idle') return;
      icon.setPointerCapture(e.pointerId);
      set('press');
    });
    icon.addEventListener('pointerup', () => { if (state() === 'press') set('open'); });
    icon.addEventListener('pointercancel', () => { if (state() === 'press') set('idle'); });
    icon.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (state() === 'idle') set('open'); }
    });
    back.addEventListener('click', () => { if (state() === 'open') set('idle'); });

    // --- scripted playback (loop on the landing page, Play/Loop on the demo page) ---
    // One cycle ≈ 22 s; the ticket screen holds for a full 20 s. The exit is a dissolve back to the home screen (data-state="exit"),
    // never the reverse morph, and the rest beat before the next tap is the longest "still"
    // so a loop reads as tap → ticket → settle → pause, not to-and-fro.
    // Weighting: the ticket is the message, so it gets the longest beat (20s). The home screen is only
    // the set-up, so it rests just long enough to read as "a phone" (~1.5s visible in total: half the dissolve + rest + press + the start of the morph) before the next tap.
    // Exit is 600ms so the dissolve reads as a reset rather than a cut, without lingering on the home screen.
    const T = { firstRest: 1200, rest: 830, press: 120, open: 520, hold: 20000, exit: 600 };
    const api = { loop: false, playing: false, set, state, timings: T,
                  setSpeed: (v) => root.style.setProperty('--speed', v) };
    const reduceMotion = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    let token = 0, first = true;
    async function runOnce(myToken) {
      set('idle');
      await sleep(ms(first ? T.firstRest : T.rest));   // long breath between loops; short on page load
      first = false;
      if (myToken !== token) return;
      set('press');
      await sleep(ms(T.press));
      if (myToken !== token) return;
      set('open');
      await sleep(ms(T.open + T.hold));
      if (myToken !== token) return;
      set('exit');
      await sleep(ms(T.exit));
      if (myToken !== token) return;
      set('idle');                           // visually identical to the end of exit; re-arms the tap
    }
    api.start = async () => {
      if (reduceMotion) { set('open'); api.playing = false; return; }   // show the payoff, don't cycle
      const myToken = ++token;
      api.playing = true;
      do { await runOnce(myToken); } while (api.loop && myToken === token);
      if (myToken === token) api.playing = false;
    };
    api.stop = () => { token++; api.playing = false; };

    // Don't animate to nobody: pause while the tab is hidden or the phone is scrolled away,
    // resume the loop when it comes back.
    const resume = () => { if (api.loop && !api.playing) api.start(); };
    document.addEventListener('visibilitychange', () => { document.hidden ? api.stop() : resume(); });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([e]) => { e.isIntersecting ? resume() : api.stop(); }, { threshold: 0.25 }).observe(screen);
    }
    return api;
  }

  /* Wires the standard demo controls (#play, #loop, [data-speed], Space key). */
  function bindControls(api, scope = document) {
    const play = scope.querySelector('#play');
    const loop = scope.querySelector('#loop');
    play.addEventListener('click', api.start);
    loop.addEventListener('change', () => {
      api.loop = loop.checked;
      if (loop.checked && !api.playing) api.start();
      if (!loop.checked) api.stop();
    });
    window.addEventListener('keydown', (e) => {
      if (e.key === ' ' && e.target === document.body) { e.preventDefault(); api.start(); }
    });
    scope.querySelectorAll('[data-speed]').forEach(btn => {
      btn.addEventListener('click', () => {
        scope.querySelectorAll('[data-speed]').forEach(b => b.setAttribute('aria-pressed', 'false'));
        btn.setAttribute('aria-pressed', 'true');
        api.setSpeed(btn.dataset.speed);
      });
    });
  }

  /* Lets a parent page drive the motion when this page is embedded in an iframe:
       frame.contentWindow.postMessage({ type: 'app-open-motion', cmd, value }, '*')
     cmd: 'start' | 'stop' | 'loop' (value: bool) | 'speed' (value: number) | 'state' (value: idle|press|open) */
  function bindMessages(api) {
    window.addEventListener('message', (e) => {
      const m = e.data;
      if (!m || m.type !== 'app-open-motion') return;
      switch (m.cmd) {
        case 'start': api.start(); break;
        case 'stop':  api.stop(); break;
        case 'loop':
          api.loop = !!m.value;
          if (api.loop && !api.playing) api.start();
          if (!api.loop) api.stop();
          break;
        case 'speed': api.setSpeed(m.value); break;
        case 'state': api.set(m.value); break;
      }
    });
  }

  return { init, bindControls, bindMessages };
})();
