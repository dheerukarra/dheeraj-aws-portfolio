// Text and motion effects used by the home screen: kinetic name, scramble-decode,
// typed boot lines, custom cursor, and the real-logo tech tape.

export function splitName(root) {
  root.querySelectorAll('.ln').forEach((ln) => {
    const t = ln.textContent;
    ln.textContent = '';
    [...t].forEach((c, i) => {
      const s = document.createElement('span');
      s.className = 'ch';
      s.textContent = c === ' ' ? ' ' : c;
      s.style.setProperty('--i', i);
      ln.appendChild(s);
    });
  });
  return [...root.querySelectorAll('.ch')];
}

export function scramble(el, text, { dur = 1300, delay = 0 } = {}) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<>/\\{}[]#%&*';
  const start = performance.now() + delay;
  (function tick() {
    const k = Math.min(1, (performance.now() - start) / dur);
    if (k < 0) return requestAnimationFrame(tick);
    let out = '';
    for (let i = 0; i < text.length; i++) out += i / text.length < k || text[i] === ' ' || text[i] === '·' ? text[i] : chars[(Math.random() * chars.length) | 0];
    el.textContent = out;
    if (k < 1) requestAnimationFrame(tick);
  })();
}

// Types lines into a <pre>. Each line: [text, className?]. Resolves when done.
export function typeLines(el, lines, cps = 55) {
  let cancelled = false;
  const p = new Promise((res) => {
    let li = 0;
    const next = () => {
      if (cancelled) return res();
      if (li >= lines.length) return setTimeout(res, 200);
      const [text, cls] = lines[li++];
      const span = document.createElement('span');
      if (cls) span.className = cls;
      el.appendChild(span);
      let i = 0;
      const step = () => {
        if (cancelled) return res();
        span.textContent = text.slice(0, ++i);
        if (i < text.length) setTimeout(step, 1000 / cps);
        else { el.appendChild(document.createTextNode('\n')); setTimeout(next, 40); }
      };
      step();
    };
    next();
  });
  p.cancel = () => { cancelled = true; };
  return p;
}

// Letters lift, tilt and warm toward orange as the pointer nears them.
export function kinetic(letters) {
  let base = [];
  const measure = () => { base = letters.map((el) => { const r = el.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }); };
  let px = -999, py = -999, on = false;
  addEventListener('pointermove', (e) => { px = e.clientX; py = e.clientY; });
  addEventListener('resize', () => { if (on) { letters.forEach((l) => (l.style.transform = '')); measure(); } });
  return {
    start() { on = true; measure(); },
    update() {
      if (!on) return;
      letters.forEach((el, i) => {
        const [cx, cy] = base[i];
        const k = Math.max(0, 1 - Math.hypot(px - cx, py - cy) / 230);
        el.style.transform = k > 0.01 ? `translateY(${-k * 16}px) rotate(${(px - cx) * k * 0.035}deg) scale(${1 + k * 0.1})` : '';
        el.style.color = k > 0.01 ? `color-mix(in srgb,#ff6a1f ${Math.round(k * 75)}%,#f4efe7)` : '';
      });
    },
  };
}

export function cursor(el, getLabel) {
  let x = innerWidth / 2, y = innerHeight / 2, tx = x, ty = y;
  addEventListener('pointermove', (e) => { tx = e.clientX; ty = e.clientY; });
  (function loop() {
    x += (tx - x) * 0.22; y += (ty - y) * 0.22;
    el.style.transform = `translate(${x}px,${y}px)`;
    const l = getLabel();
    if (el.dataset.t !== l) el.dataset.t = l;
    requestAnimationFrame(loop);
  })();
}

export async function buildTape(el) {
  const names = { python: 'Python', pytorch: 'PyTorch', pandas: 'Pandas', numpy: 'NumPy', tableau: 'Tableau', selenium: 'Selenium', cypress: 'Cypress', openjdk: 'Java', postgresql: 'PostgreSQL', mysql: 'MySQL', mongodb: 'MongoDB', git: 'Git', github: 'GitHub', anthropic: 'Claude', ollama: 'Ollama', googlegemini: 'Gemini', postman: 'Postman', jira: 'JIRA', oracle: 'Oracle', html5: 'HTML', css3: 'CSS', bootstrap: 'Bootstrap' };
  let icons = {};
  try { icons = await (await fetch('./icons.json')).json(); } catch { return; }
  const item = (k) => { const ic = icons[k]; if (!ic || !names[k]) return ''; return `<span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="${ic.d}" fill="#${ic.hex}"/></svg>${names[k]}</span>`; };
  const row = Object.keys(names).map(item).join('');
  el.innerHTML = `<div class="track">${row}${row}</div>`;
}
