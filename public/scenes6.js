import * as THREE from 'three';
import { label, makeSparks, logo3d, ach } from './common.js';

const MONO = '500 44px "JetBrains Mono", monospace';
const GRN = 0x39d98a, RED = 0xff3b5c, SEEN = new Set();
const mkTex = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return { c, x: c.getContext('2d'), t }; };
const L = (root, t, x, y, z, o) => { const s = label(t, o); s.position.set(x, y, z); root.add(s); return s; };

// Numbered callouts that match the numbered list in the panel.
function markerSet(root, css) {
  const list = [];
  return {
    add(n, x, y) {
      const c = document.createElement('canvas'); c.width = c.height = 96; const x2 = c.getContext('2d');
      x2.beginPath(); x2.arc(48, 48, 40, 0, 7); x2.fillStyle = 'rgba(5,7,11,.92)'; x2.fill(); x2.lineWidth = 5; x2.strokeStyle = css; x2.stroke();
      x2.fillStyle = '#f4efe7'; x2.font = '800 46px Syne, sans-serif'; x2.textAlign = 'center'; x2.textBaseline = 'middle'; x2.fillText(String(n), 48, 52);
      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, depthTest: false })); s.position.set(x, y, 0.8); s.scale.set(0.62, 0.62, 1); s.renderOrder = 10; root.add(s); list[n - 1] = s;
    },
    update(t, hl) { list.forEach((s, i) => { const on = hl === i; s.scale.setScalar(0.62 * (on ? 1.55 + Math.sin(t * 8) * 0.12 : 1)); s.material.opacity = hl < 0 || on ? 1 : 0.45; }); },
  };
}

const KDET = {
  title: 'Kalshi trading system', sub: 'Prediction-market trading bot · PyTorch · built by directing AI agents',
  points: ['A Meta-Learner (a PyTorch neural network) governs the four specialists.', 'Four independent specialist agents, built through multi-prompt iterations.', 'Three execution layers: Arbitrage, Momentum and Reinforcement Learning.', 'Real-time WebSocket data, async Python on a Linux VPS, Telegram for live telemetry.', 'Debugging: fixed AI hallucinations and catastrophic interference with strict prompt constraints, audits and 64-byte memory alignment.'],
  tags: ['PyTorch', 'Python', 'WebSockets', 'Telegram'], note: 'Honest note: the original code was lost. This scene is a reconstruction and every number is simulated.',
};
const SDET = {
  title: 'shorts-engine', sub: 'Automated vertical video (30 to 59 s) where every claim has a source',
  points: ['A six-agent chain: router, evidence retriever, script writer, avatar renderer, audio pipeline, video composer.', 'Evidence adapters: GitHub search, news and a Playwright web scraper.', 'Proof-first: no claim reaches audio or video without a verified source URL.', 'Hard duration gate: output is rejected outside 30.0 to 59.0 seconds.', 'Tests across smoke, unit, integration and end-to-end layers, with CI on GitHub Actions.'],
  tags: ['Python', 'FFmpeg', 'Edge-TTS', 'Playwright', 'Pydantic', 'FastAPI', 'pytest'], note: 'The repository is private for now. This scene is a live demo of the rules, not real output.',
};

// ---------------------------------------------------------------- KALSHI: A SIMULATED TRADING SYSTEM, LIVE
// A Meta-Learner core collects votes from four agents and fires orders into a simulated order book.
// A guardrail ring catches "hallucinated" signals. Everything on screen is simulated.
export function kalshiScene() {
  const root = new THREE.Group(), sp = makeSparks(root, 500), mk = markerSet(root, '#ff6a1f');
  const CORE = new THREE.Vector3(-4.0, 0.8, 0), PANEL = new THREE.Vector3(3.2, 1.0, 0), TG = new THREE.Vector3(5.2, 4.5, 0), AC = [0xff6a1f, 0xffc766, 0xa58bff, 0x5ec8ff];
  const shell = new THREE.Mesh(new THREE.IcosahedronGeometry(1.05, 1), new THREE.MeshBasicMaterial({ color: 0xffb27a, wireframe: true, transparent: true, opacity: 0.8 })); shell.position.copy(CORE);
  const core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.62, 3), new THREE.MeshBasicMaterial({ color: 0xffe6cc })); core.position.copy(CORE);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.55, 0.03, 8, 90), new THREE.MeshBasicMaterial({ color: GRN, transparent: true, opacity: 0.8 })); ring.position.copy(CORE); ring.rotation.x = Math.PI / 2.4;
  root.add(shell, core, ring);
  L(root, 'KALSHI TRADING SYSTEM', 0, 4.7, 0, { size: 0.55 });
  L(root, 'META-LEARNER', CORE.x, CORE.y + 2.05, 0, { size: 0.3, color: '#ffb27a', font: MONO });
  L(root, 'WEBSOCKET FEED', CORE.x, -3.3, 0, { size: 0.3, color: '#5ec8ff', font: MONO });
  L(root, 'ARBITRAGE · MOMENTUM · RL', 2.2, -3.6, 0, { size: 0.3, color: '#ff9a5c', font: MONO });
  L(root, 'simulated data · original code lost', 0, -4.45, 0, { size: 0.3, color: '#ff3b5c', font: MONO });
  const tgIcon = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.5, 3), new THREE.MeshBasicMaterial({ color: 0x5ec8ff })); tgIcon.position.copy(TG); tgIcon.rotation.z = -Math.PI / 2; root.add(tgIcon);
  const tgLbl = L(root, 'TELEGRAM', TG.x + 0.1, TG.y - 0.65, 0, { size: 0.3, color: '#5ec8ff', font: MONO });
  // agents orbit the core
  const agents = AC.map((c, i) => { const m = new THREE.Mesh(new THREE.OctahedronGeometry(0.3, 0), new THREE.MeshBasicMaterial({ color: c })); root.add(m); return { m, a: (i * Math.PI) / 2, next: 0.8 + i * 0.5 }; });
  const beamPos = new Float32Array(4 * 6), beamG = new THREE.BufferGeometry(); beamG.setAttribute('position', new THREE.BufferAttribute(beamPos, 3));
  const beams = new THREE.LineSegments(beamG, new THREE.LineBasicMaterial({ color: 0xff6a1f, transparent: true, opacity: 0.4 })); beams.frustumCulled = false; root.add(beams);
  // websocket feed: dots streaming into the core
  const FN = 90, fp = new Float32Array(FN * 3), fs = Array.from({ length: FN }, () => ({ k: Math.random(), v: 0.15 + Math.random() * 0.25, y: (Math.random() - 0.5) * 6.5 }));
  const fg = new THREE.BufferGeometry(); fg.setAttribute('position', new THREE.BufferAttribute(fp, 3));
  const feed = new THREE.Points(fg, new THREE.PointsMaterial({ color: 0x5ec8ff, size: 0.09, transparent: true, opacity: 0.8, depthWrite: false, blending: THREE.AdditiveBlending })); feed.frustumCulled = false; root.add(feed);
  // order book + equity holograms
  const bk = mkTex(512, 512), eqT = mkTex(512, 128);
  const book = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 4.6), new THREE.MeshBasicMaterial({ map: bk.t, transparent: true })); book.position.copy(PANEL); root.add(book);
  const eqM = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 1.15), new THREE.MeshBasicMaterial({ map: eqT.t, transparent: true })); eqM.position.set(PANEL.x, -2.3, 0); root.add(eqM);
  const scan = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 0.04), new THREE.MeshBasicMaterial({ color: 0xff6a1f, transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending, depthWrite: false })); root.add(scan);
  mk.add(1, CORE.x, 2.9); mk.add(2, -6.9, 2.3); mk.add(3, -0.3, -3.6); mk.add(4, -6.9, -2.4); mk.add(5, -2.2, 2.0);

  // simulation
  let price = 50, fair = 50, e1 = 50, e2 = 50, equity = 0, pos = 0, tick = 0, acc = 0, decideT = 2.4, votes = [], trades = 0, rej = 0, flash = 0, rflash = 0, tflash = 0, hl = -1, counted = false;
  const hist = Array(120).fill(50), eq = Array(160).fill(0), fills = [], bs = Array(24).fill(0.5), as = Array(24).fill(0.5);
  const pk = Array.from({ length: 28 }, () => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 10), new THREE.MeshBasicMaterial({ color: 0xffffff })); m.visible = false; root.add(m); return { m, a: new THREE.Vector3(), b: new THREE.Vector3(), t: 1, dur: 1, kind: '', dir: 0 }; });
  const fire = (a, b, color, dur, kind, dir) => { const q = pk.find((p) => !p.m.visible); if (!q) return; q.a.copy(a); q.b.copy(b); q.t = 0; q.dur = dur; q.kind = kind; q.dir = dir; q.m.material.color.set(color); q.m.visible = true; };
  const nz = () => Math.random() - 0.5;
  const signal = (i) => { const d = fair - price, mo = e1 - e2, v = i === 0 ? d + nz() * 0.8 : i === 1 ? mo + nz() * 0.3 : i === 2 ? 0.5 * d + mo + nz() * 0.8 : 0.3 * d + 0.6 * mo + nz() * 0.6; return v === 0 ? 1 : Math.sign(v); };
  const arrive = (p) => {
    if (p.kind === 'sig') { votes.push(p.dir); flash = 1; }
    else if (p.kind === 'bad') { rej++; rflash = 1; sp.burst(p.b, 0xff2bd6, 40, 3); }
    else if (p.kind === 'order') { price += p.dir * 1.1; pos = p.dir; trades++; fills.push({ k: tick, side: p.dir }); if (fills.length > 12) fills.shift(); sp.burst(PANEL, p.dir > 0 ? GRN : RED, 90, 4); fire(PANEL, TG, 0x5ec8ff, 0.9, 'tg', 0); }
    else if (p.kind === 'tg') tflash = 1;
  };
  const priceTick = () => {
    const old = price; price += nz() * 0.35 + (fair - price) * 0.03; fair += nz() * 0.12; price = Math.max(25, Math.min(75, price)); fair = Math.max(30, Math.min(70, fair));
    e1 += (price - e1) * 0.25; e2 += (price - e2) * 0.06; hist.push(price); hist.shift(); tick++;
    if (tick % 4 === 0) { equity += pos * (price - old) * 2.2; eq.push(equity); eq.shift(); }
    for (let i = 0; i < 24; i++) { const base = Math.pow(1 - i / 24, 0.8); bs[i] += (base * (0.35 + Math.random() * 0.65) - bs[i]) * 0.35; as[i] += (base * (0.35 + Math.random() * 0.65) - as[i]) * 0.35; }
  };
  const draw = () => {
    const c = bk.x; c.fillStyle = 'rgba(8,10,16,.9)'; c.fillRect(0, 0, 512, 512); c.strokeStyle = '#ff6a1f'; c.lineWidth = 3; c.strokeRect(2, 2, 508, 508);
    c.fillStyle = '#ffb27a'; c.font = '500 26px "JetBrains Mono", monospace'; c.fillText('ORDER BOOK · SIMULATED', 20, 44); c.fillStyle = '#f4efe7'; c.fillText('MID ' + price.toFixed(1), 340, 44);
    for (let i = 0; i < 24; i++) { c.fillStyle = 'rgba(57,217,138,.8)'; c.fillRect(250 - (i + 1) * 10, 250 - bs[i] * 150, 8, bs[i] * 150); c.fillStyle = 'rgba(255,59,92,.8)'; c.fillRect(262 + i * 10, 250 - as[i] * 150, 8, as[i] * 150); }
    c.strokeStyle = 'rgba(255,255,255,.25)'; c.beginPath(); c.moveTo(256, 80); c.lineTo(256, 255); c.stroke();
    const mn = Math.min(...hist) - 0.5, mx = Math.max(...hist) + 0.5, Y = (v) => 480 - ((v - mn) / (mx - mn)) * 170;
    c.strokeStyle = '#ffd2a8'; c.lineWidth = 3; c.beginPath(); hist.forEach((v, i) => { const x = 20 + i * (472 / 119); i ? c.lineTo(x, Y(v)) : c.moveTo(x, Y(v)); }); c.stroke();
    fills.forEach((f) => { const idx = tick - f.k; if (idx >= 120) return; const x = 20 + (119 - idx) * (472 / 119), y = Y(hist[119 - idx]); c.fillStyle = f.side > 0 ? '#39d98a' : '#ff3b5c'; c.beginPath(); c.moveTo(x, y + (f.side > 0 ? -22 : 22)); c.lineTo(x - 9, y + (f.side > 0 ? -4 : 4)); c.lineTo(x + 9, y + (f.side > 0 ? -4 : 4)); c.fill(); });
    bk.t.needsUpdate = true;
    const e = eqT.x; e.fillStyle = 'rgba(8,10,16,.9)'; e.fillRect(0, 0, 512, 128); e.strokeStyle = '#ff6a1f'; e.lineWidth = 3; e.strokeRect(2, 2, 508, 124); e.fillStyle = '#ffb27a'; e.font = '500 22px "JetBrains Mono", monospace'; e.fillText('P&L · SIMULATED', 16, 30);
    const lo = Math.min(...eq, -1), hi = Math.max(...eq, 1); e.strokeStyle = equity >= 0 ? '#39d98a' : '#ff3b5c'; e.lineWidth = 3; e.beginPath(); eq.forEach((v, i) => { const x = 16 + i * (480 / 159), y = 112 - ((v - lo) / (hi - lo)) * 64; i ? e.lineTo(x, y) : e.moveTo(x, y); }); e.stroke(); eqT.t.needsUpdate = true;
  };

  return {
    root, vo: 0.2, floor: -4.9, pool: 1.6, cam: { pos: new THREE.Vector3(0, 0.5, 16.5), look: new THREE.Vector3(0, 0.2, 0) },
    highlight: (n) => { hl = n; }, detail: () => KDET,
    hintFor: () => 'Click: fire a burst of signals · hover the list to find each part',
    click() { agents.forEach((a, i) => { a.next = 0.05 + i * 0.12; }); decideT = 1.6; sp.burst(CORE, 0xff6a1f, 80, 5); },
    update(t, dt, p) {
      if (!counted) { counted = true; SEEN.add('k'); if (SEEN.size === 2) ach('projects'); }
      acc += dt; while (acc > 0.1) { acc -= 0.1; priceTick(); draw(); }
      agents.forEach((a, i) => {
        a.a += dt * (0.25 + i * 0.05); const r = 2.6 * (hl === 1 ? 1.15 : 1); a.m.position.set(CORE.x + Math.cos(a.a) * r, CORE.y + Math.sin(a.a) * r * 0.58, Math.sin(a.a) * 1.2); a.m.rotation.y = t * 1.5; a.m.rotation.x = t;
        a.m.scale.setScalar((1 + Math.sin(t * 3 + i) * 0.1) * (hl === 1 ? 1.5 : 1)); beamPos.set([a.m.position.x, a.m.position.y, a.m.position.z, CORE.x, CORE.y, CORE.z], i * 6);
        if (t >= a.next) {
          a.next = t + 1.1 + Math.random() * 0.9; const bad = Math.random() < 0.1, dir = signal(i), ang = a.m.position.clone().sub(CORE).normalize();
          if (bad) fire(a.m.position, CORE.clone().addScaledVector(ang, 1.55), 0xff2bd6, 0.7, 'bad', 0); else fire(a.m.position, CORE, dir > 0 ? GRN : RED, 0.8, 'sig', dir);
        }
      });
      beamG.attributes.position.needsUpdate = true;
      decideT -= dt; if (decideT <= 0) { decideT = 2.6; const net = votes.reduce((s, v) => s + v, 0); votes = []; if (Math.abs(net) >= 2) fire(CORE, PANEL, net > 0 ? GRN : RED, 0.9, 'order', Math.sign(net)); }
      for (const q of pk) if (q.m.visible) { q.t += dt / q.dur; q.m.position.lerpVectors(q.a, q.b, Math.min(1, q.t)); if (q.t >= 1) { q.m.visible = false; arrive(q); } }
      flash *= Math.exp(-5 * dt); rflash *= Math.exp(-4 * dt); tflash *= Math.exp(-3 * dt);
      core.scale.setScalar((1 + flash * 0.35) * (hl === 0 ? 1.3 : 1)); shell.rotation.y = t * 0.6; shell.rotation.x = t * 0.3; ring.rotation.z = t * 0.5; ring.material.opacity = 0.55 + rflash * 0.45 + (hl === 4 ? 0.3 : 0);
      ring.scale.setScalar(1 + rflash * 0.12); tgIcon.scale.setScalar(1 + tflash * 0.8); tgLbl.material.opacity = 0.6 + tflash * 0.4; beams.material.opacity = 0.25 + flash * 0.4;
      fs.forEach((f, i) => { f.k += dt * f.v; if (f.k > 1) { f.k = 0; f.y = (Math.random() - 0.5) * 6.5; } const s = f.k * f.k * (3 - 2 * f.k); fp.set([-8.2 + f.k * (CORE.x + 8.2), f.y + (CORE.y - f.y) * s, 0], i * 3); });
      fg.attributes.position.needsUpdate = true;
      scan.position.set(PANEL.x, PANEL.y + (((t * 0.3) % 1) - 0.5) * 4.6, 0.02);
      mk.update(t, hl); root.rotation.y = p.x * 0.05; root.rotation.x = -p.y * 0.03; sp.update(dt);
    },
    stat() { return 'simulated · ' + trades + ' orders · ' + rej + ' hallucinations blocked'; },
  };
}

// ---------------------------------------------------------------- SHORTS-ENGINE: PROOF-FIRST VIDEO PIPELINE, LIVE
// Claims flow through six agents. At the evidence stage a claim with no source is rejected and falls away.
// A finished video must pass a 30 to 59 second gate. This is a live demo of the rules, not real output.
export function shortsScene() {
  const root = new THREE.Group(), sp = makeSparks(root, 400), mk = markerSet(root, '#a58bff');
  const VIO = 0xa58bff, AMB = 0xffc766, NAMES = ['ROUTER', 'EVIDENCE', 'SCRIPT', 'AVATAR', 'AUDIO', 'COMPOSE'], SX0 = -4.8, DX = 1.6, PHONE = new THREE.Vector3(5.2, 0.9, 0), EV = 1;
  const st = NAMES.map((n, i) => ({ p: new THREE.Vector3(SX0 + i * DX, 0.3 + Math.sin(i * 0.7) * 0.45, 0) }));
  const boxes = st.map((s, i) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.9, 0.9), new THREE.MeshBasicMaterial({ color: 0x1b1730 })); m.position.copy(s.p); root.add(m);
    const e = new THREE.LineSegments(new THREE.EdgesGeometry(m.geometry), new THREE.LineBasicMaterial({ color: i === EV ? AMB : VIO })); e.position.copy(s.p); root.add(e);
    L(root, NAMES[i], s.p.x, s.p.y - 0.95, 0, { size: 0.3, color: '#c9ccd6', font: MONO }); return m;
  });
  root.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([...st.map((s) => s.p), PHONE]), new THREE.LineBasicMaterial({ color: VIO, transparent: true, opacity: 0.35 })));
  L(root, 'SHORTS-ENGINE · PROOF-FIRST', 0.2, 4.6, 0, { size: 0.55 });
  L(root, 'no source, no claim', 0.2, 3.95, 0, { size: 0.3, color: '#8b93a7', font: MONO });
  // evidence adapters
  const EVP = st[EV].p, AD = [['GITHUB', -1.5, 0], ['NEWS', 0, 0.3], ['WEB', 1.5, 0]].map(([n, dx, dy]) => ({ n, p: new THREE.Vector3(EVP.x + dx, 2.45 + dy, 0) }));
  AD.forEach((a, i) => {
    if (i === 0) { const lg = logo3d('github', 0.5); lg.position.copy(a.p); root.add(lg); } else { const m = new THREE.Mesh(new THREE.SphereGeometry(0.2, 14, 14), new THREE.MeshBasicMaterial({ color: AMB })); m.position.copy(a.p); root.add(m); }
    L(root, a.n, a.p.x, a.p.y + 0.55, 0, { size: 0.3, color: '#ffc766', font: MONO });
    root.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([a.p, EVP]), new THREE.LineBasicMaterial({ color: AMB, transparent: true, opacity: 0.3 })));
  });
  const rejLbl = L(root, 'NO SOURCE · REJECTED', EVP.x, -1.9, 0, { size: 0.3, color: '#ff3b5c', font: MONO }); rejLbl.material.opacity = 0;
  // phone + duration gauge
  const ph = mkTex(180, 320), gg = mkTex(256, 256);
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(1.25, 2.22), new THREE.MeshBasicMaterial({ map: ph.t })); screen.position.copy(PHONE); root.add(screen);
  const frame = new THREE.LineSegments(new THREE.EdgesGeometry(screen.geometry), new THREE.LineBasicMaterial({ color: 0xf4efe7 })); frame.position.copy(PHONE); root.add(frame);
  const gauge = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 2.2), new THREE.MeshBasicMaterial({ map: gg.t, transparent: true })); gauge.position.set(PHONE.x, -2.1, 0); root.add(gauge);
  // tests row
  const TESTS = ['SMOKE', 'UNIT', 'INTEGRATION', 'E2E'].map((n, i) => L(root, n, [-3.6, -1.5, 0.9, 3.2][i], -3.7, 0, { size: 0.3, color: '#a58bff', font: MONO }));
  L(root, 'CI ON GITHUB ACTIONS', -0.2, -4.5, 0, { size: 0.3, color: '#8b93a7', font: MONO });
  mk.add(1, SX0 - 0.2, 1.9); mk.add(2, EVP.x + 2.5, 3.0); mk.add(3, EVP.x, -1.3); mk.add(4, PHONE.x - 1.6, -0.8); mk.add(5, -5.2, -3.7);

  // claims
  const CN = 22, inst = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.44, 0.3), new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide }), CN), stamp = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.16, 0.16), new THREE.MeshBasicMaterial({ color: 0xffffff }), CN);
  inst.frustumCulled = stamp.frustumCulled = false; root.add(inst, stamp);
  const cs = Array.from({ length: CN }, () => ({ s: -1, st: 0, y: 0, vy: 0, on: false, dec: false }));
  let spawn = 0, nClaims = 0, nOk = 0, nRej = 0, vids = 0, vidOk = 0, prog = 0, needle = 0, target = 0, result = '', flashR = 0, counted = false, hl = -1;
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), eu = new THREE.Euler(), sc = new THREE.Vector3(), ps = new THREE.Vector3(), col = new THREE.Color(), tmp = new THREE.Vector3(), tiny = new THREE.Vector3(0.001, 0.001, 0.001);
  const PTS = [...st.map((x) => x.p), PHONE];
  const pathPos = (s, out) => { const i = Math.max(0, Math.min(5, Math.floor(s))), f = Math.max(0, Math.min(1, s - i)); return out.lerpVectors(PTS[i], PTS[i + 1], f); };
  const compose = () => { const d = 18 + Math.random() * 52; target = d; vids++; const ok = d >= 30 && d <= 59; if (ok) vidOk++; result = ok ? 'PASS' : 'REJECT'; sp.burst(PHONE, ok ? GRN : RED, 120, 5); };
  let fT = 0;
  const drawPhone = (t) => {
    const cx = ph.x, g = cx.createLinearGradient(0, 0, 180, 320); g.addColorStop(0, '#1c212c'); g.addColorStop(1, '#0c0f14'); cx.fillStyle = g; cx.fillRect(0, 0, 180, 320);
    const W = ['EVERY', 'CLAIM', 'HAS', 'A', 'SOURCE'], hi = Math.floor(t * 1.7) % (W.length + 2); cx.textAlign = 'center'; cx.font = '800 30px Syne, sans-serif';
    W.forEach((w, i) => { cx.fillStyle = i === hi ? '#a58bff' : i < hi ? '#f4efe7' : '#4a5163'; cx.fillText(w, 90, 70 + i * 44); });
    cx.fillStyle = '#2a2f3b'; cx.fillRect(14, 290, 152, 8); cx.fillStyle = '#39d98a'; cx.fillRect(14, 290, 152 * Math.min(1, prog), 8); ph.t.needsUpdate = true;
    const c = gg.x; c.clearRect(0, 0, 256, 256); c.fillStyle = 'rgba(8,10,16,.85)'; c.fillRect(0, 0, 256, 256); c.strokeStyle = '#2a2f3b'; c.lineWidth = 3; c.strokeRect(2, 2, 252, 252);
    const A = (v) => Math.PI + (v / 70) * Math.PI; c.lineWidth = 14; c.strokeStyle = '#2a2f3b'; c.beginPath(); c.arc(128, 168, 84, A(0), A(70)); c.stroke(); c.strokeStyle = '#39d98a'; c.beginPath(); c.arc(128, 168, 84, A(30), A(59)); c.stroke();
    c.strokeStyle = '#f4efe7'; c.lineWidth = 4; c.beginPath(); c.moveTo(128, 168); c.lineTo(128 + Math.cos(A(needle)) * 76, 168 + Math.sin(A(needle)) * 76); c.stroke();
    c.fillStyle = '#8b93a7'; c.font = '500 20px "JetBrains Mono", monospace'; c.textAlign = 'center'; c.fillText('30', 52, 200); c.fillText('59 s', 214, 200); c.fillText('DURATION GATE', 128, 34);
    c.fillStyle = result === 'PASS' ? '#39d98a' : result === 'REJECT' ? '#ff3b5c' : '#8b93a7'; c.font = '700 36px "JetBrains Mono", monospace'; c.fillText(result ? needle.toFixed(1) + ' s' : '-- s', 128, 222); c.font = '600 24px "JetBrains Mono", monospace'; c.fillText(result || 'WAITING', 128, 248);
    gg.t.needsUpdate = true;
  };

  return {
    root, vo: 0.2, floor: -4.9, pool: 1.6, cam: { pos: new THREE.Vector3(0.2, 0.7, 16.8), look: new THREE.Vector3(0.2, 0.2, 0) },
    highlight: (n) => { hl = n; }, detail: () => SDET,
    hintFor: () => 'Click: send a burst of claims · hover the list to find each part',
    click() { for (let k = 0; k < 4; k++) setTimeout(() => { spawn = 0; }, k * 180); sp.burst(st[0].p, VIO, 60, 4); },
    update(t, dt, p) {
      if (!counted) { counted = true; SEEN.add('s'); if (SEEN.size === 2) ach('projects'); }
      spawn -= dt; if (spawn <= 0) { const c = cs.find((x) => !x.on); if (c) { Object.assign(c, { s: 0, st: 0, y: 0, vy: 0, on: true, dec: false }); nClaims++; } spawn = 0.85; }
      let k = 0;
      cs.forEach((c) => {
        if (c.on) {
          c.s += dt * 0.55;
          if (!c.dec && c.s >= EV) { c.dec = true; if (Math.random() < 0.3) { c.st = 2; c.vy = 1.2; nRej++; flashR = 1; sp.burst(st[EV].p, RED, 40, 3); } else { c.st = 1; nOk++; } }
          if (c.st === 2) { c.vy -= 6 * dt; c.y += c.vy * dt; if (c.y < -3) c.on = false; }
          if (c.s >= 6) { c.on = false; prog += 0.12; if (prog >= 1) { prog = 0; compose(); } }
        }
        if (c.on) { pathPos(Math.min(c.s, 6), ps); ps.y += 0.7 + c.y; sc.set(1, 1, 1); } else { ps.set(0, -99, 0); sc.copy(tiny); }
        q.setFromEuler(eu.set(0, 0, c.st === 2 ? c.y * 1.4 : 0)); m4.compose(ps, q, sc); inst.setMatrixAt(k, m4);
        col.setHex(c.st === 2 ? RED : c.st === 1 ? GRN : 0xcfd6e6); inst.setColorAt(k, col);
        tmp.copy(ps); tmp.y += 0.28; m4.compose(tmp, q, c.on && c.st === 1 ? sc : tiny); stamp.setMatrixAt(k, m4); stamp.setColorAt(k, col.setHex(GRN)); k++;
      });
      inst.instanceMatrix.needsUpdate = stamp.instanceMatrix.needsUpdate = true; inst.instanceColor.needsUpdate = stamp.instanceColor.needsUpdate = true;
      flashR *= Math.exp(-3 * dt); rejLbl.material.opacity = Math.min(1, flashR * 1.3);
      needle += (target - needle) * Math.min(1, dt * 4);
      boxes.forEach((b, i) => { b.rotation.y = Math.sin(t * 0.7 + i) * 0.25; b.scale.setScalar(hl === 0 ? 1.18 : 1); });
      const ti = Math.floor(t / 1.1) % 4; TESTS.forEach((l, i) => { l.material.opacity = Math.min(1, (i === ti ? 1 : 0.35) + (hl === 4 ? 0.3 : 0)); });
      fT += dt; if (fT > 0.1) { fT = 0; drawPhone(t); }
      mk.update(t, hl); root.rotation.y = p.x * 0.05; root.rotation.x = -p.y * 0.03; sp.update(dt);
    },
    stat() { return nClaims + ' claims · ' + nOk + ' sourced · ' + nRej + ' rejected (no source) · ' + vidOk + '/' + vids + ' videos passed the gate'; },
  };
}
