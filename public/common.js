import * as THREE from 'three';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';

export const rs = () => Math.random() * 2 - 1;
export const ach = (k) => window.dispatchEvent(new CustomEvent('ach', { detail: k }));

export const CL = [
  { id: 'ds', n: '01', name: 'Education', col: 0x5ec8ff, css: '#5ec8ff', dir: [1, 0, 0],
    body: "Master's\nM.S. in Data Science and AI\n\nBachelor's\nB.S. in Computer Science",
    html: "<span class=\"hd\">Master's</span>\nM.S. in Data Science and AI\n\n<span class=\"hd\">Bachelor's</span>\nB.S. in Computer Science",
    hint: 'Drag to spin · click a half of the globe to step inside', tags: [] },
  { id: 'ai', n: '02', name: 'AI agents', col: 0xa58bff, css: '#a58bff', dir: [-1, 0, 0],
    body: 'I direct AI coding agents instead of trusting them: constraints in, audits and regression checks on the way out. Claude Code, Cursor, Ollama, Gemini CLI, Kimi Code CLI.',
    hint: 'Click to send a hallucination through the pipeline', tags: ['Claude Code', 'Cursor', 'Ollama', 'Gemini CLI', 'Prompting'] },
  { id: 'pr', n: '03', name: 'Projects', col: 0xff6a1f, css: '#ff6a1f', dir: [0, 0, 1],
    body: 'Kalshi: a PyTorch trading system with 4 specialist agents governed by a Meta-Learner. The original code was lost, so this is a reconstruction and every number is simulated. shorts-engine: a six-agent, proof-first video pipeline.',
    html: "<span class=\"hd\">Kalshi</span>\nPrediction-market trading bot built by directing AI agents\n\n<span class=\"hd\">shorts-engine</span>\nAutomated vertical video where every claim has a source",
    hint: 'Drag to spin · click a half of the globe to step inside', tags: [] },
  { id: 'qa', n: '04', name: 'Testing', col: 0x7bd88f, css: '#7bd88f', dir: [0, 0, -1],
    body: 'Two years as an automation tester at VSquare IT and ICloud Technologies. Java, Selenium, Cypress, TestNG, Postman and JIRA. The discipline behind everything else.',
    hint: 'Click to trigger a regression run', tags: ['Selenium', 'Cypress', 'TestNG', 'Postman', 'JIRA'] },
  { id: 'sk', n: '05', name: 'Skills and certifications', col: 0xf4c95d, css: '#f4c95d', dir: [0, 1, 0],
    body: 'Skills: 41 skills. Certifications: 4 completed courses.',
    html: "<span class=\"hd\">Skills</span>\n41 skills, each on its own orbit\n\n<span class=\"hd\">Certifications</span>\n4 completed courses",
    hint: 'Drag to spin · click a half of the globe to step inside', tags: [] },
  { id: 'hb', n: '06', name: 'Hobby', col: 0xff4d8d, css: '#ff4d8d', dir: [0, -1, 0],
    body: 'Gaming is my hobby. A gaming PC, a PS5 and a Meta Quest 3S. Valorant, CS2, Rocket League, Overwatch 2, GTA V, Rainbow Six and more.',
    hint: 'Click a game to shoot it · click a rig to power it up', tags: ['Valorant', 'CS2', 'Rocket League', 'Overwatch 2', 'GTA V', 'Rainbow Six'] },
];
// the globe spins around its vertical axis, so a region on a pole is almost never facing the visitor (Hobby was hard to reach).
// Spread the six regions over two latitudes, 60 degrees apart in longitude, so every one rotates through the front.
CL.forEach((c, i) => { const th = (i * Math.PI) / 3, la = (i % 2 ? -1 : 1) * 0.3; c.dir = [Math.cos(la) * Math.cos(th), Math.sin(la), Math.cos(la) * Math.sin(th)]; });
CL.forEach(c => (c.v = new THREE.Vector3(...c.dir).normalize()));

// Scenes inside Education. Not globe regions: reached from the Education globe, the palette or the terminal.
export const SUB = [
  { id: 'ms', n: '', name: "Master's", col: 0x5ec8ff, css: '#5ec8ff',
    body: 'M.S. in Data Science and AI.',
    hint: 'Click: train a fresh model on new data', tags: [] },
  { id: 'bs', n: '', name: "Bachelor's", col: 0xff7ab8, css: '#ff7ab8',
    body: 'B.S. in Computer Science.',
    hint: 'Click: next algorithm on a new route', tags: [] },
  { id: 'ka', n: '', name: 'Kalshi', col: 0xff6a1f, css: '#ff6a1f',
    body: 'Prediction-market trading bot built by directing AI agents.',
    hint: 'Hover the list to find each part', tags: [] },
  { id: 'se', n: '', name: 'shorts-engine', col: 0xa58bff, css: '#a58bff',
    body: 'Automated vertical video where every claim has a source.',
    hint: 'Hover the list to find each part', tags: [] },
  { id: 'sa', n: '', name: 'Skills', col: 0xf4c95d, css: '#f4c95d',
    body: '41 skills, each on its own orbit around the core.',
    hint: 'Hover a skill to single it out · click to excite the atom', tags: [] },
  { id: 'cv', n: '', name: 'Certifications', col: 0x4de0c8, css: '#4de0c8',
    body: 'Four completed courses.',
    hint: 'Hover a coin to flip it', tags: [] },
];

export const fontsReady = () =>
  Promise.all([
    document.fonts.load('700 72px Syne'),
    document.fonts.load('800 72px Syne'),
    document.fonts.load('500 44px "JetBrains Mono"'),
  ]).catch(() => {});

export function label(text, { size = 0.5, color = '#f4efe7', font = '700 72px Syne, sans-serif' } = {}) {
  // `size` is the sprite height, but the glyphs only fill px/120 of it. Floor the real text height so nothing is unreadable.
  const px = +(/(\d+)px/.exec(font) || [0, 72])[1];
  size = Math.max(size, (0.27 * 120) / px);
  const c = document.createElement('canvas');
  const x = c.getContext('2d');
  x.font = font;
  const w = Math.ceil(x.measureText(text).width) + 40;
  const h = 120;
  c.width = w;
  c.height = h;
  x.font = font;
  x.fillStyle = color;
  x.textBaseline = 'middle';
  x.fillText(text, 20, h / 2 + 2);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, depthWrite: false }));
  s.scale.set((w / h) * size, size, 1);
  return s;
}

export function makeSparks(parent, N = 700) {
  const g = new THREE.BufferGeometry();
  const P = new Float32Array(N * 3), V = new Float32Array(N * 3), Cc = new Float32Array(N * 3), L = new Float32Array(N);
  for (let i = 0; i < N; i++) P[i * 3 + 1] = -999;
  g.setAttribute('position', new THREE.BufferAttribute(P, 3));
  g.setAttribute('color', new THREE.BufferAttribute(Cc, 3));
  const pts = new THREE.Points(g, new THREE.PointsMaterial({ size: 0.08, vertexColors: true, transparent: true, opacity: 0.95, depthWrite: false, blending: THREE.AdditiveBlending }));
  pts.frustumCulled = false;
  parent.add(pts);
  let k = 0;
  const col = new THREE.Color();
  return {
    burst(p, color, n = 120, spd = 5) {
      col.set(color);
      for (let j = 0; j < n; j++) {
        const i = k++ % N;
        P.set([p.x, p.y, p.z], i * 3);
        const d = new THREE.Vector3(rs(), rs(), rs()).normalize().multiplyScalar(1 + Math.random() * spd);
        V.set([d.x, d.y, d.z], i * 3);
        Cc.set([col.r, col.g, col.b], i * 3);
        L[i] = 0.5 + Math.random();
      }
      g.attributes.color.needsUpdate = true;
    },
    update(dt) {
      for (let i = 0; i < N; i++) {
        if (L[i] > 0) {
          L[i] -= dt;
          V[i * 3 + 1] -= 2.5 * dt;
          P[i * 3] += V[i * 3] * dt;
          P[i * 3 + 1] += V[i * 3 + 1] * dt;
          P[i * 3 + 2] += V[i * 3 + 2] * dt;
          if (L[i] <= 0) P[i * 3 + 1] = -999;
        }
      }
      g.attributes.position.needsUpdate = true;
    },
  };
}

// ---- typed/scrambled 3D label: call .reveal(k) with k in 0..1
export function typedLabel(text, { size = 0.6, color = '#f4efe7', font = '800 72px Syne, sans-serif' } = {}) {
  const c = document.createElement('canvas'), x = c.getContext('2d');
  x.font = font;
  const w = Math.ceil(x.measureText(text).width) + 40, h = 120;
  c.width = w; c.height = h;
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, depthWrite: false }));
  s.scale.set((w / h) * size, size, 1);
  const G = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<>/{}#%';
  let last = -1;
  s.reveal = (k) => {
    const n = Math.floor(k * text.length * 1.2);
    if (n === last && k < 1) return; last = n;
    x.clearRect(0, 0, w, h); x.font = font; x.fillStyle = color; x.textBaseline = 'middle';
    let out = '';
    for (let i = 0; i < text.length; i++) out += i < n - 2 || text[i] === ' ' ? text[i] : i < n ? G[(Math.random() * G.length) | 0] : '';
    x.fillText(k >= 1 ? text : out, 20, h / 2 + 2); t.needsUpdate = true;
  };
  s.reveal(0);
  return s;
}

// ---- real brand logos as flat extruded meshes (simple-icons paths)
let ICONS = null;
const iconsP = () => (ICONS ||= fetch('./icons.json').then((r) => r.json()).catch(() => ({})));
const svgLoader = new SVGLoader();
export function logo3d(key, size = 0.7, tint) {
  const g = new THREE.Group();
  iconsP().then((icons) => {
    const ic = icons[key]; if (!ic) return;
    const data = svgLoader.parse(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="${ic.d}"/></svg>`);
    const col = new THREE.Color(tint ?? '#' + ic.hex);
    if (col.getHSL({}).l < 0.28) col.offsetHSL(0, 0, 0.3);
    const mat = new THREE.MeshBasicMaterial({ color: col, side: THREE.DoubleSide });
    for (const p of data.paths) for (const sh of SVGLoader.createShapes(p)) {
      const geo = new THREE.ExtrudeGeometry(sh, { depth: 1.6, bevelEnabled: false });
      const m = new THREE.Mesh(geo, mat); g.add(m);
    }
    const s = size / 24; g.children.forEach((m) => { m.position.set(-12, 12, -0.8); });
    g.scale.set(s, -s, s);
  });
  return g;
}

// 5x7 pixel font for a few letters (used by the testing grid to spell initials)
export const FONT5 = {
  D: ['1110 ', '1   1', '1   1', '1   1', '1   1', '1   1', '1110 '],
  R: ['1111 ', '1   1', '1   1', '1111 ', '1 1  ', '1  1 ', '1   1'],
  K: ['1   1', '1  1 ', '1 1  ', '11   ', '1 1  ', '1  1 ', '1   1'],
};
