// Tools: overlay, career-as-git, patch notes, live self-test suite,
// shareable card (rendered on the visitor's device), 6-second clip recorder, "reachable now".
const $ = (s) => document.querySelector(s);
const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

export function overlay(title, html, wide = false, kick = '') {
  let o = $('#ov');
  if (!o) { o = document.createElement('div'); o.id = 'ov'; document.body.appendChild(o); }
  o.innerHTML = `<div class="box${wide ? ' wide' : ''}" role="dialog" aria-label="${esc(title)}"><button class="x" aria-label="Close">×</button><div class="ov-head">${kick ? `<span class="ov-kick">${kick}</span>` : ''}<h3>${title}</h3></div><div class="body">${html}</div></div>`;
  o.classList.add('on');
  o.querySelector('.x').onclick = closeOverlay;
  o.onclick = (e) => { if (e.target === o) closeOverlay(); };
  return o.querySelector('.body');
}
export const closeOverlay = () => $('#ov')?.classList.remove('on');

// ---------------------------------------------------------------- career as a git repo
const COMMITS = [
  ['c05', '05/2027 planned', 'HEAD', 'feat: M.S. Data Science and AI at University of Central Missouri (in progress)', [1, 1, 1, 1, 1, 1], 'Now: AI agents directed with constraints and audits. Kalshi rebuilt as a simulator. shorts-engine, a six-agent proof-first pipeline.'],
  ['c04', '05/2025', '', 'chore: wrap up automation testing roles', [1, 0, 0, 1, 1, 0], 'Two years of automation testing behind him.'],
  ['c03', '12/2024', '', 'feat: join VSquare IT Inc. as Automation Tester', [1, 0, 0, 1, 1, 0], 'Java, Selenium WebDriver, regression and smoke testing, JIRA.'],
  ['c02', '12/2023', '', 'feat: B.S. Computer Science, cum laude, 3.51 GPA, Dean’s List', [1, 0, 0, 1, 1, 0], 'University of Central Missouri.'],
  ['c01', '02/2023', '', 'feat: join ICloud Technologies as Automation Tester', [0, 0, 0, 1, 1, 0], 'Manual and automated testing, Selenium, Cypress, smoke tests.'],
];
export function gitLog(app) {
  const rows = COMMITS.map((c, i) => {
    const m = /^(\w+): (.*)$/.exec(c[3]) || ['', 'feat', c[3]];
    const dots = app.CL.map((r, k) => `<s class="${c[4][k] ? 'on' : ''}" style="--d:${r.css}" title="${esc(r.name)}"></s>`).join('');
    return `<li data-i="${i}" class="${c[2] ? 'head' : ''}"><span class="g-node"></span><div class="g-card"><div class="g-top"><b>${c[0]}</b><i>${c[1]}</i>${c[2] ? '<u>HEAD</u>' : ''}<span class="g-go">check out →</span></div><div class="g-msg"><em class="t-${m[1]}">${m[1]}</em>${esc(m[2])}</div><p>${esc(c[5])}</p><div class="g-dots">${dots}<small>${c[4].filter(Boolean).length} of ${c[4].length} regions existed</small></div></div></li>`;
  }).join('');
  const b = overlay('Career, as a git log', `<p class="mute">Click a commit to check it out. The model rewinds to what existed then. Only dated facts from the resume are shown; undated work lives in HEAD.</p><ul class="git">${rows}</ul><p class="mute g-foot"><b>git status</b> Kalshi (reconstructed, simulated numbers) · shorts-engine (private repo)</p>`, false, '$ git log --oneline');
  b.querySelectorAll('li').forEach((li) => (li.onclick = () => {
    const c = COMMITS[+li.dataset.i]; app.setActive(c[4]); closeOverlay();
    if (app.mode() === 'scene') app.home();
    app.achieve('timetravel');
    app.toast(c[2] ? 'Back at HEAD: the full model' : `Checked out ${c[1]}: ${c[4].filter(Boolean).length} of ${c[4].length} regions existed`);
  }));
}

export function patchNotes() {
  const R = [
    ['v3.0', '05/2027', 'planned', ['Added: M.S. Data Science and AI complete']],
    ['v2.0', 'now', 'Data and AI', ['Added: AI agents, directed with constraints, audits and regression checks', 'Added: Kalshi trading system, rebuilt as a simulator (numbers are simulated)', 'Added: shorts-engine, six agents, proof-first', 'Changed: now builds with PyTorch and Python']],
    ['v1.5', '12/2023', '', ['Added: B.S. Computer Science, cum laude, 3.51 GPA']],
    ['v1.0', '02/2023', 'Automation Tester', ['Added: Selenium, Cypress, TestNG, Postman, JIRA', 'Fixed: regressions, before they shipped']],
  ];
  const html = R.map((r, i) => `<section class="pn${i === 1 ? ' cur' : ''}"><div class="pn-h"><span class="pn-v">${r[0]}</span><i>${r[1]}</i>${r[2] ? `<u>${esc(r[2])}</u>` : ''}</div><ul>${r[3].map((t) => { const [k, ...v] = t.split(': '); return `<li><em class="t-${k.toLowerCase()}">${k}</em><span>${esc(v.join(': '))}</span></li>`; }).join('')}</ul></section>`).join('');
  overlay('What changed in the model', `<div class="patch">${html}</div>`, false, 'Patch notes');
}

// ---------------------------------------------------------------- how this site is hosted (AWS)
export function awsInfo() {
  const row = (title, text) => `<section class="pn"><div class="pn-h"><span class="pn-v">${title}</span></div><ul><li><span>${text}</span></li></ul></section>`;
  overlay('How this site is hosted', `<div class="patch">${
    row('Hosting', 'AWS Amplify Hosting in us-east-1. The site is served over HTTPS through the Amplify CDN.')
    + row('Deploys', 'Amplify is connected to the public GitHub repo. Every push to the main branch redeploys the site automatically.')
    + row('Build', 'None. The site is plain static files (HTML and JavaScript). <code>amplify.yml</code> publishes the <code>public/</code> folder as is.')
    + row('Source', '<a href="https://github.com/dheerukarra/dheeraj-aws-portfolio" target="_blank" rel="noopener" style="color:var(--acc)">github.com/dheerukarra/dheeraj-aws-portfolio</a>')
  }</div>`, false, 'Built on AWS');
}

// ---------------------------------------------------------------- live self-test (real checks)
const lum = (hex) => { const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4))); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
export async function selfTest(app) {
  const body = overlay('Run the suite on this page', '<div class="st-top"><div class="st-ring" style="--p:0"><b>0</b><small>of 12</small></div><div class="st-txt"><h4>Running live checks…</h4><p>Real checks, run in your browser right now. Nothing is faked.</p><div class="st-bar"><i></i></div></div></div><ul class="tests"></ul><p class="sum mute"></p>', true, 'Live self-test');
  const ul = body.querySelector('ul'), sum = body.querySelector('.sum'), ring = body.querySelector('.st-ring'), bar = body.querySelector('.st-bar i'), head = body.querySelector('.st-txt h4');
  const links = [...document.querySelectorAll('a[href]')], badLinks = links.filter((a) => !a.getAttribute('href'));
  const ext = links.filter((a) => /^https?:/.test(a.href) && a.target === '_blank'), noRel = ext.filter((a) => !/noopener/.test(a.rel));
  const btns = [...document.querySelectorAll('button')].filter((b) => getComputedStyle(b).display !== 'none'), noName = btns.filter((b) => !(b.textContent || b.getAttribute('aria-label') || '').trim());
  const nav = performance.getEntriesByType('navigation')[0], res = performance.getEntriesByType('resource');
  const js = res.filter((r) => r.name.endsWith('.js') || r.initiatorType === 'script').reduce((s, r) => s + (r.transferSize || 0), 0);
  const gl = app.R.getContext(), maxT = gl.getParameter(gl.MAX_TEXTURE_SIZE);
  let icons = false; try { icons = (await fetch('./icons.json')).ok; } catch { icons = false; }
  const T = [
    ['links have a destination', badLinks.length === 0, `${links.length} links, ${badLinks.length} empty`],
    ['external links use rel=noopener', noRel.length === 0, `${ext.length} external, ${noRel.length} missing`],
    ['buttons have accessible names', noName.length === 0, `${btns.length} buttons, ${noName.length} unnamed`],
    ['3D canvas is labelled for screen readers', !!app.cv.getAttribute('aria-label'), app.cv.getAttribute('aria-label') || 'missing'],
    ['body text contrast >= 4.5:1', ratio('#f4efe7', '#05070b') >= 4.5, ratio('#f4efe7', '#05070b').toFixed(1) + ':1'],
    ['muted text contrast >= 4.5:1', ratio('#8b93a7', '#05070b') >= 4.5, ratio('#8b93a7', '#05070b').toFixed(1) + ':1'],
    ['page has lang and title', !!document.documentElement.lang && !!document.title, document.documentElement.lang + ' · ' + document.title.slice(0, 28)],
    ['loaded fast (DOMContentLoaded < 3 s)', nav ? nav.domContentLoadedEventEnd < 3000 : true, nav ? (nav.domContentLoadedEventEnd / 1000).toFixed(2) + ' s' : 'n/a'],
    ['script payload under 1.5 MB', js < 1.5e6, (js / 1e6).toFixed(2) + ' MB'],
    ['WebGL2 context available', typeof WebGL2RenderingContext !== 'undefined' && gl instanceof WebGL2RenderingContext, 'max texture ' + maxT],
    ['reduced-motion preference is honoured', app.reduced !== undefined, app.reduced ? 'reduced' : 'full motion'],
    ['logo data loads', icons, icons ? 'icons.json 200' : 'failed'],
  ];
  let pass = 0, done = 0;
  ring.querySelector('small').textContent = 'of ' + T.length;
  for (const [n, ok, v] of T) {
    await new Promise((r) => setTimeout(r, 170));
    const li = document.createElement('li'); li.className = ok ? 'ok' : 'bad'; li.innerHTML = `<b>${ok ? '✓' : '✗'}</b><span>${esc(n)}</span><i title="${esc(v)}">${esc(v.length > 36 ? v.slice(0, 34) + '…' : v)}</i>`; ul.appendChild(li); if (ok) pass++; done++;
    ring.style.setProperty('--p', (pass / T.length) * 100); ring.querySelector('b').textContent = pass; bar.style.width = (done / T.length) * 100 + '%';
  }
  const all = pass === T.length; ring.classList.add(all ? 'all' : 'part'); head.textContent = all ? 'All checks passed' : `${T.length - pass} check${T.length - pass > 1 ? 's' : ''} failed`;
  sum.innerHTML = `<b>${pass} / ${T.length} passed</b> · measured on this device just now.`;
  app.achieve('tester');
}

// ---------------------------------------------------------------- shareable card (rendered locally)
export function cardTool(app) {
  const b = overlay('Your fault-injector card', '<p class="mute">Type a name. The card is drawn on this device and never uploaded.</p><input id="cn" maxlength="24" placeholder="Your name" autocomplete="off"><div class="row"><button id="cg">Create card</button></div><canvas id="cc" width="540" height="675" style="width:100%;max-width:340px;display:none;margin-top:14px;border:1px solid #2a2f3b"></canvas><div class="row"><a id="cd" style="display:none">Download PNG</a></div>', false, 'Share card');
  b.querySelector('#cg').onclick = () => {
    const name = (b.querySelector('#cn').value || 'Visitor').trim().slice(0, 24), c = b.querySelector('#cc'), x = c.getContext('2d'); c.style.display = 'block';
    x.fillStyle = '#05070b'; x.fillRect(0, 0, 540, 675);
    const g = x.createRadialGradient(270, 300, 10, 270, 300, 300); g.addColorStop(0, 'rgba(255,106,31,.35)'); g.addColorStop(1, 'rgba(5,7,11,0)'); x.fillStyle = g; x.fillRect(0, 0, 540, 675);
    x.strokeStyle = 'rgba(255,255,255,.07)'; for (let i = 0; i < 540; i += 30) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, 675); x.stroke(); } for (let i = 0; i < 675; i += 30) { x.beginPath(); x.moveTo(0, i); x.lineTo(540, i); x.stroke(); }
    ['#5ec8ff', '#a58bff', '#ff6a1f', '#7bd88f'].forEach((col, i) => { x.strokeStyle = col; x.lineWidth = 2; x.beginPath(); x.arc(270, 290, 120 + i * 14, i * 1.57 + 0.3, i * 1.57 + 1.3); x.stroke(); });
    x.fillStyle = '#ff6a1f'; x.beginPath(); x.arc(270, 290, 44, 0, 7); x.fill();
    x.fillStyle = '#98a0b3'; x.font = '500 15px monospace'; x.textAlign = 'center'; x.fillText('FAULT INJECTOR', 270, 70);
    x.fillStyle = '#f4efe7'; x.font = '800 40px Syne, sans-serif'; x.fillText(name.toUpperCase(), 270, 510);
    const st = app.stats(); x.fillStyle = '#98a0b3'; x.font = '500 15px monospace'; x.fillText(`${st.ach} badges · ${st.visited}/${app.CL.length} scenes`, 270, 548);
    x.fillStyle = '#ff6a1f'; x.fillText('dheeraj reddy karra · m.s. data science and ai', 270, 620);
    const d = b.querySelector('#cd'); d.href = c.toDataURL('image/png'); d.download = 'fault-injector-card.png'; d.style.display = 'inline-block'; app.achieve('card');
  };
}

// ---------------------------------------------------------------- 6-second clip (canvas capture, local)
export function recordClip(app) {
  if (!window.MediaRecorder || !app.cv.captureStream) { app.toast('Recording is not supported in this browser'); return; }
  const stream = app.cv.captureStream(30), rec = new MediaRecorder(stream, { mimeType: MediaRecorder.isTypeSupported('video/webm;codecs=vp9') ? 'video/webm;codecs=vp9' : 'video/webm', videoBitsPerSecond: 6e6 }), chunks = [];
  rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
  rec.onstop = () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(chunks, { type: 'video/webm' })); a.download = 'break-the-model.webm'; a.click(); app.toast('Clip saved to your downloads'); app.achieve('clip'); };
  rec.start(); app.toast('Recording 6 seconds…');
  if (app.mode() === 'hub') setTimeout(() => app.breakRegion((Math.random() * 4) | 0), 1200);
  setTimeout(() => rec.stop(), 6000);
}

// ---------------------------------------------------------------- reachable now (visitor clock only)
export function reach(el) {
  const f = () => {
    const p = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: 'America/Chicago', hour: 'numeric', minute: '2-digit', hour12: false, weekday: 'short' }).formatToParts(new Date()).map((x) => [x.type, x.value]));
    const h = +p.hour % 24, on = !['Sat', 'Sun'].includes(p.weekday) && h >= 9 && h < 18;
    el.innerHTML = `<b style="color:${on ? '#7bd88f' : '#ff9a5c'}">●</b> ${on ? 'online now' : 'away'} · CT ${p.hour}:${p.minute}`;
  };
  f(); setInterval(f, 30000);
}
