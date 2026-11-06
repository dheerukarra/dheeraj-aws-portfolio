// UI systems: explorer badges, command palette (Ctrl+K), terminal (~) that drives the world, shortcuts, Konami.
import { overlay, closeOverlay, gitLog, patchNotes, selfTest, cardTool, recordClip, reach } from './tools.js';

const $ = (s) => document.querySelector(s);
export const ACH = {
  fault: ['First fault', 'Broke the model', 'On the home globe, click a region to break it.'],
  cleaner: ['Trainer', 'Trained a neural network', "Open Master's from the Education globe and click to train a fresh model."],
  cartographer: ['Pathfinder', 'Ran a graph algorithm', "Open Bachelor's from the Education globe and click to try another algorithm."],
  gatekeeper: ['Gatekeeper', 'Rejected a hallucination', 'In AI agents, press "Play: be the audit gate" and reject a red packet.'],
  drk: ['Regression master', 'Passed every test', 'In Testing, let a full run finish and every bug get fixed.'],
  sharpshooter: ['Sharpshooter', 'Shot all six games', 'In Hobby, click every game sphere.'],
  projects: ['Two for two', 'Explored both projects', 'Open both Kalshi and shorts-engine from the Projects globe.'],
  tester: ['QA on QA', 'Ran the self-test suite', 'Press Ctrl K and run the self-test suite.'],
  card: ['Collector', 'Made a card', 'Press Ctrl K and make your fault-injector card.'],
  clip: ['Director', 'Recorded a clip', 'Press Ctrl K and record a clip.'],
  timetravel: ['Time traveller', 'Checked out a commit', 'Press Ctrl K, open the career git log and click a commit.'],
  konami: ['Old school', 'Entered the Konami code', 'A famous 1986 cheat code: four arrow keys, then more arrows, then B and A.'],
  hired: ['Hired', 'sudo hire dheeraj', 'Open the terminal and try asking nicely, with sudo.'],
  terminal: ['Hacker', 'Opened the terminal', 'On the home screen, press the ~ key.'],
  all: ['Completionist', 'Visited every scene', 'Visit all six regions of the home globe.'],
};
// gentle hints that appear after lingering in a scene without its badge
const NUDGE = { 1: ['gatekeeper', 'AI agents: press "Play: be the audit gate" and reject a red packet.'], 3: ['drk', 'Testing: wait for a full run to finish and every bug to be fixed.'], 5: ['sharpshooter', 'Hobby: click every game sphere.'], 6: ['cleaner', "Master's: click to train a fresh model."], 7: ['cartographer', "Bachelor's: click to run another graph algorithm."], 8: ['projects', 'Projects: open the other project too.'], 9: ['projects', 'Projects: open the other project too.'] };
const HUBHINTS = ['fault', 'terminal', 'hired', 'konami', 'tester', 'card', 'clip', 'timetravel', 'all'];
export const CERTS = [['Smart Supply Chain Management', 'IIM Mumbai'], ['What is Data Science', 'IBM, Coursera'], ['Python Certification', 'freeCodeCamp'], ['Intro to Programming', 'Kaggle']];
const load = (k) => { try { return JSON.parse(localStorage.getItem(k) || '[]'); } catch { return []; } };
const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify([...v])); } catch { /* storage may be blocked */ } };
const SCENES = { atom: 10, skillatom: 10, vault: 11, certifications: 11, certs: 11, certificates: 11, kalshi: 8, shorts: 9, shortsengine: 9, ms: 6, masters: 6, master: 6, bs: 7, bachelors: 7, bachelor: 7, ds: 0, edu: 0, education: 0, ai: 1, projects: 2, pr: 2, qa: 3, testing: 3, skills: 4, sk: 4, creds: 4, credentials: 4, hobby: 5, gaming: 5, games: 5, gaming: 5 };

export function initUI(app) {
  const got = new Set(load('dr_ach')), visited = new Set(load('dr_vis'));
  const toasts = document.createElement('div'); toasts.id = 'toasts'; document.body.appendChild(toasts);
  app.toast = (html, ach) => { const t = document.createElement('div'); t.className = 'toast' + (ach ? ' ach' : ''); t.innerHTML = html; toasts.appendChild(t); setTimeout(() => t.classList.add('out'), ach ? 4600 : 3200); setTimeout(() => t.remove(), ach ? 5200 : 3800); };
  const TOTAL = Object.keys(ACH).length;
  app.achieve = (k) => { if (got.has(k) || !ACH[k]) return; got.add(k); save('dr_ach', got); achCount(); app.toast(badgeCard(k), true); if (got.size === TOTAL) setTimeout(celebrate, 2400); };
  app.onScene = (i) => { term(false); palOpen(false); clearTimeout(nudgeT); const N = NUDGE[i]; if (N && !got.has(N[0]) && !nudged.has('s' + i)) nudgeT = setTimeout(() => { if (app.cur() === i && !got.has(N[0])) { nudged.add('s' + i); app.toast(hintCard(N[1]), true); } }, 26000); visited.add(i); save('dr_vis', visited); if ([...visited].filter((v) => v < app.CL.length).length >= app.CL.length) app.achieve('all'); };
  app.stats = () => ({ ach: got.size, visited: visited.size });
  addEventListener('ach', (e) => app.achieve(e.detail));
  reach($('#reach'));

  const achB = $('#achb'), achCount = () => { if (achB) achB.textContent = `Badges ${got.size}/${TOTAL}`; };
  achCount();
  // ---- badge visuals: a faceted gem per badge, tinted by its position in the collection
  let gid = 0; const keys = Object.keys(ACH);
  const hue = (k) => (keys.indexOf(k) * 47 + 8) % 360;
  function gemSvg(k, on = true) {
    const h = hue(k), c1 = `hsl(${h} 88% 66%)`, c2 = `hsl(${(h + 36) % 360} 80% 42%)`, id = 'g' + gid++;
    if (!on) return `<svg viewBox="0 0 64 64" aria-hidden="true"><polygon points="32,5 54,22 32,58 10,22" fill="rgba(255,255,255,.03)" stroke="rgba(255,255,255,.28)" stroke-width="1.5" stroke-dasharray="3 3"/><path d="M10 22H54M32 5V58M20 22L32 58M44 22L32 58" stroke="rgba(255,255,255,.14)" fill="none"/><rect x="25" y="29" width="14" height="11" rx="2" fill="rgba(255,255,255,.38)"/><path d="M28 29v-3a4 4 0 0 1 8 0v3" stroke="rgba(255,255,255,.38)" stroke-width="2" fill="none"/></svg>`;
    return `<svg viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff"/><stop offset=".35" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs><polygon points="32,5 54,22 32,58 10,22" fill="url(#${id})"/><polygon points="32,5 44,22 20,22" fill="rgba(255,255,255,.45)"/><polygon points="10,22 20,22 32,58" fill="rgba(0,0,0,.22)"/><polygon points="54,22 44,22 32,58" fill="rgba(255,255,255,.08)"/><polygon points="20,22 44,22 32,58" fill="rgba(255,255,255,.16)"/><path d="M10 22H54" stroke="rgba(255,255,255,.55)"/><polygon points="32,5 54,22 32,58 10,22" fill="none" stroke="rgba(255,255,255,.6)" stroke-width="1.2" stroke-linejoin="round"/></svg>`;
  }
  const BULB = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/></svg>';
  function badgeCard(k) {
    return `<div class="bt" style="--c:hsl(${hue(k)} 88% 62%);--p:${Math.round((got.size / TOTAL) * 100)}"><div class="bt-gem">${gemSvg(k)}<s></s><s></s><s></s><s></s><s></s><s></s></div><div class="bt-body"><span class="bt-kick">New badge unlocked</span><strong>${ACH[k][0]}</strong><i>${ACH[k][1]}</i></div><div class="bt-ring"><b>${got.size}</b><small>/${TOTAL}</small></div><span class="tbar"></span></div>`;
  }
  function hintCard(text) {
    return `<div class="bt hint" style="--c:#5ec8ff"><div class="bt-ico">${BULB}</div><div class="bt-body"><span class="bt-kick">Badge hint</span><i>${text}</i></div><span class="tbar"></span></div>`;
  }
  const achList = () => {
    if (document.getElementById('bdg')) return;
    const pct = Math.round((got.size / TOTAL) * 100);
    const tiles = keys.map((k) => { const on = got.has(k), v = ACH[k]; return `<div class="bd-tile ${on ? 'on' : 'lock'}" style="--c:hsl(${hue(k)} 88% 62%)"><div class="bd-gem">${gemSvg(k, on)}</div><h4>${v[0]}</h4><p>${on ? v[1] : '<em>Clue</em> ' + v[2]}</p><span class="bd-tag">${on ? 'Unlocked' : 'Locked'}</span></div>`; }).join('');
    const d = document.createElement('div'); d.id = 'bdg';
    d.innerHTML = `<div class="bd-box"><button class="bd-x" aria-label="Close">\u00d7</button><div class="bd-head"><div class="bd-ring" style="--p:${pct}"><b>${got.size}</b><small>of ${TOTAL}</small></div><div><span class="bd-kick">Explorer badges</span><h2>Your collection</h2><p>Earned by exploring this site, and saved on this device only. Locked badges come with a clue.</p></div></div><div class="bd-grid">${tiles}</div></div>`;
    document.body.appendChild(d); requestAnimationFrame(() => d.classList.add('in'));
    const close = () => { d.classList.remove('in'); setTimeout(() => d.remove(), 260); };
    d.querySelector('.bd-x').onclick = close; d.addEventListener('pointerdown', (e) => { if (e.target === d) close(); });
  };
  const MAIL = 'dheerajreddy.karra@gmail.com';
  // mailto: does nothing without a desktop mail client, so copy the address and open a Gmail compose tab
  const hello = (btn) => {
    try { navigator.clipboard?.writeText(MAIL); } catch { /* clipboard blocked: the address is shown on screen */ }
    window.open('https://mail.google.com/mail/?view=cm&fs=1&to=' + MAIL + '&su=' + encodeURIComponent('Hello from your portfolio'), '_blank', 'noopener');
    if (btn && btn.textContent) btn.textContent = 'Address copied ✓'; else app.toast(`Email address copied: ${MAIL}`);
  };
  function celebrate() {
    if (document.getElementById('cong')) return; document.getElementById('bdg')?.remove();
    const d = document.createElement('div'); d.id = 'cong';
    const cols = ['#ff6a1f', '#5ec8ff', '#a58bff', '#7bd88f', '#f4c95d', '#ff7ab8']; let cf = '';
    for (let i = 0; i < 80; i++) cf += `<span class="cf" style="left:${Math.random() * 100}%;background:${cols[i % cols.length]};animation-duration:${2.8 + Math.random() * 2.8}s;animation-delay:${Math.random() * 2}s"></span>`;
    const strip = keys.map((k, i) => `<span style="--c:hsl(${hue(k)} 88% 62%);animation-delay:${1 + i * 0.07}s">${gemSvg(k)}</span>`).join('');
    d.innerHTML = cf + `<div class="cg-box"><button class="cg-x" id="cclose" aria-label="Close">\u00d7</button><div class="cg-stage"><i></i><i></i><i></i><div class="cg-gem">${gemSvg('all')}</div></div><span class="cg-kick">All ${TOTAL} badges collected</span><h2>Congratulations!</h2><p>You found every badge on this site, which means you really explored it. Thank you for taking the time.</p><div class="cg-strip">${strip}</div><div class="cg-cta"><button class="cg-btn" id="chello">Say hello</button><button class="cg-btn ghost" id="ckeep">Keep exploring</button></div><div class="cg-mail">${MAIL}</div></div>`;
    document.body.appendChild(d); const close = () => d.remove(); d.querySelector('#cclose').onclick = close; d.querySelector('#ckeep').onclick = close; d.querySelector('#chello').onclick = (e) => hello(e.currentTarget); d.addEventListener('pointerdown', (e) => { if (e.target === d) close(); });
  }
  // gentle hints when someone lingers without finding the badge
  let nudgeT = 0, hubIdle = 0, hubShown = 0; const nudged = new Set();
  setInterval(() => {
    if (app.mode() !== 'hub' || document.getElementById('cong')) { hubIdle = 0; return; }
    hubIdle += 5; if (hubIdle < 40 || hubShown >= 4) return; hubIdle = 0;
    const k = HUBHINTS.find((x) => !got.has(x) && !nudged.has(x)); if (!k) return; nudged.add(k); hubShown++; app.toast(hintCard(ACH[k][2]), true);
  }, 5000);
  achB?.addEventListener('click', () => { if (app.mode() === 'hub') achList(); });

  const go = (i) => { if (app.mode() === 'scene' || app.mode() === 'hub') app.enter(i); };
  const A = {
    sound: () => app.toggleSound(), home: () => app.mode() === 'scene' && app.home(),
    test: () => selfTest(app), git: () => gitLog(app), patch: patchNotes, card: () => cardTool(app), clip: () => recordClip(app), ach: achList,
    break: (i) => app.mode() === 'hub' && app.breakRegion(i ?? ((Math.random() * app.CL.length) | 0)), heal: () => app.heal(),
  };
  const CMDS = [
    ...app.META.map((m, i) => ({ t: 'Go to ' + m.name, f: () => go(i) })),
    { t: 'Go home: the model', f: A.home }, { t: 'Career as a git log (time travel)', f: A.git }, { t: 'Patch notes', f: A.patch },
    { t: 'Run the self-test suite on this page', f: A.test }, 
    { t: 'Explorer badges', f: A.ach }, { t: 'Make my fault-injector card', f: A.card }, { t: 'Record a 6 second clip', f: A.clip },
    { t: 'Toggle sound', f: A.sound }, { t: 'Open the terminal', f: () => term(true) },
    { t: 'Email Dheeraj', f: () => hello() },
    { t: 'LinkedIn', f: () => window.open('https://www.linkedin.com/in/dheeraj-reddy-karra', '_blank', 'noopener') },
    { t: 'GitHub', f: () => window.open('https://github.com/dheerukarra', '_blank', 'noopener') },
  ];

  const pal = document.createElement('div'); pal.id = 'pal'; pal.innerHTML = '<div class="pbox"><button class="px" id="pclose" aria-label="Close command palette">\u00d7</button><div class="psearch"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg><input id="pin" placeholder="Type a command or a place…" autocomplete="off" aria-label="Command palette"></div><ul id="pls"></ul><div class="pfoot"><span><kbd>↑↓</kbd> move</span><span><kbd>↵</kbd> run</span><span><kbd>esc</kbd> close</span><span><kbd>1-5</kbd> jump</span><span><kbd>~</kbd> terminal</span></div></div>'; document.body.appendChild(pal);
  $('#pclose').addEventListener('click', () => palOpen(false));
  let sel = 0, list = CMDS;
  const kind = (t) => (/^Go /.test(t) ? ['→', 'go'] : /^(Email|LinkedIn|GitHub)/.test(t) ? ['↗', 'ext'] : /badges/i.test(t) ? ['◆', 'bdg'] : ['▶', 'act']);
  const render = () => { $('#pls').innerHTML = list.map((c, i) => { const [g, k] = kind(c.t); return `<li class="${i === sel ? 'on' : ''}" data-i="${i}"><span class="pi ${k}">${g}</span><span class="pt">${c.t}</span><kbd>↵</kbd></li>`; }).join('') || '<li class="none">No match. Try another word.</li>'; $('#pls').querySelectorAll('li[data-i]').forEach((li) => (li.onclick = () => run(+li.dataset.i))); };
  const run = (i) => { const c = list[i]; if (!c) return; palOpen(false); c.f(); };
  const palOpen = (on) => { if (on && app.mode() !== 'hub') return; pal.classList.toggle('on', on); if (on) { $('#pin').value = ''; list = CMDS; sel = 0; render(); setTimeout(() => $('#pin').focus(), 30); } };
  $('#pin').addEventListener('input', (e) => { const q = e.target.value.toLowerCase(); list = CMDS.filter((c) => c.t.toLowerCase().includes(q)); sel = 0; render(); });
  $('#pin').addEventListener('keydown', (e) => { if (e.key === 'ArrowDown') { sel = Math.min(list.length - 1, sel + 1); render(); e.preventDefault(); } else if (e.key === 'ArrowUp') { sel = Math.max(0, sel - 1); render(); e.preventDefault(); } else if (e.key === 'Enter') run(sel); });
  
  $('#palb').onclick = () => palOpen(true);

  const T = document.createElement('div'); T.id = 'term'; T.innerHTML = '<button class="tx" id="tclose" aria-label="Close terminal">\u00d7</button><div id="tout" aria-live="polite"></div><div class="tin"><span>dheeraj@model:~$</span><input id="tcmd" autocomplete="off" spellcheck="false" aria-label="Terminal input"></div>'; document.body.appendChild(T);
  $('#tclose').addEventListener('click', () => term(false));
  const out = (s, c = '') => { const d = document.createElement('div'); d.className = c; d.innerHTML = s; $('#tout').appendChild(d); $('#tout').scrollTop = 1e6; };
  const term = (on) => { if (on && app.mode() !== 'hub') return; T.classList.toggle('on', on); if (on) { app.achieve('terminal'); if (!$('#tout').children.length) out('model shell v1 · type <b>help</b>', 'mute'); setTimeout(() => $('#tcmd').focus(), 40); } };
  const region = (s) => SCENES[(s || '').toLowerCase().replace(/[^a-z]/g, '')];
  const CMD = {
    help: () => out('whoami · ls · cat &lt;region&gt; · enter &lt;edu|ai|projects|qa|skills|hobby&gt; · home · break [region] · heal · git · patch · test · sound · card · clip · badges · clear · exit'),
    whoami: () => out('Dheeraj Reddy Karra · M.S. Data Science and AI · automation tester turned AI engineer'),
    ls: () => out('education/ \u00a0ai-agents/ \u00a0projects/ \u00a0testing/ \u00a0skills-and-certifications/ \u00a0hobby/'),
    cat: (a) => { const i = region(a); if (i === undefined) out('cat: no such region. try: edu ai projects qa skills hobby', 'bad'); else out(app.META[i].body); },
    enter: (a) => { const i = region(a); if (i === undefined) out('enter: unknown region', 'bad'); else { out('entering ' + app.META[i].name + '…'); term(false); go(i); } },
    home: () => { A.home(); out('back at the model'); },
    break: (a) => { if (app.mode() !== 'hub') return out('break works from the model view. type: home', 'bad'); const i = region(a); A.break(i !== undefined && i < 4 ? i : undefined); out('fault injected'); },
    heal: () => { A.heal(); out('retraining… loss falling'); },
    git: () => { term(false); A.git(); }, patch: () => { term(false); A.patch(); }, test: () => { term(false); A.test(); },
    sound: () => A.sound(), card: () => { term(false); A.card(); }, clip: () => { term(false); A.clip(); }, ach: () => { term(false); A.ach(); }, badges: () => { term(false); A.ach(); },
    clear: () => { $('#tout').innerHTML = ''; }, exit: () => term(false),
  };
  $('#tcmd').addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return; const v = e.target.value.trim(); e.target.value = ''; if (!v) return; out('<span class="pr">$</span> ' + v.replace(/</g, '&lt;'));
    if (/^sudo\s+hire\s+dheeraj/i.test(v)) { out('permission granted. <b>dheerajreddy.karra@gmail.com</b>', 'ok'); app.achieve('hired'); return; }
    if (/^sudo/i.test(v)) return out('nice try. only one sudo command works here.', 'bad');
    const [c, ...r] = v.split(/\s+/); const f = CMD[c.toLowerCase()]; if (f) f(r.join(' ')); else out(`${c}: command not found. try <b>help</b>`, 'bad');
  });
  $('#termb').addEventListener('click', (e) => { e.preventDefault(); term(true); });

  const typing = () => ['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName);
  const KON = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a']; let ki = 0;
  addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); palOpen(true); return; }
    if (e.key === 'Escape') { closeOverlay(); document.getElementById('cong')?.remove(); document.getElementById('bdg')?.remove(); return; }
    if (typing()) return;
    ki = e.key.toLowerCase() === KON[ki].toLowerCase() ? ki + 1 : e.key === 'ArrowUp' ? 1 : 0;
    if (ki === KON.length) { ki = 0; app.toast('Old school. +30 lives.'); app.achieve('konami'); return; }
    if (e.key === '`' || e.key === '~') { e.preventDefault(); term(true); }
    else if (e.key === '/' || e.key === '?') { e.preventDefault(); palOpen(true); }
    else if (/^[1-6]$/.test(e.key)) go(+e.key - 1);
    else if (e.key === ' ' && app.mode() === 'hub') { e.preventDefault(); A.break(); }
    else if (e.key.toLowerCase() === 'h') A.heal();
  });
}
