import * as THREE from 'three';
import { label, makeSparks, logo3d } from './common.js';

const MONO = '500 44px "JetBrains Mono", monospace';
// logo3d draws one logo-height below its anchor; lift it back so it sits centred on the anchor
const lg = (k, s) => { const w = new THREE.Group(), l = logo3d(k, s); l.position.y = s; w.add(l); return w; };
const std = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, flatShading: true, roughness: 0.82, metalness: 0.05, ...o });
const box = (w, h, d, mat, x = 0, y = 0, z = 0) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); return m; };
const tex = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return { c, x: c.getContext('2d'), t }; };

// ---------------------------------------------------------------- CERTIFICATIONS: FOUR FLOATING ISLANDS
// One small lit world per certification. Drag to spin the cluster, hover an island to lift it and wake it up,
// click to celebrate. Each island's props nod to what the course is about.
const CERTS = [
  { t: ['Smart Supply Chain', 'Management'], full: 'Smart Supply Chain Management', i: 'IIM Mumbai', mono: 'IIM', col: 0xf4c95d, top: 0x6fae8a, rock: 0x5b4a3a },
  { t: ['What is', 'Data Science'], full: 'What is Data Science', i: 'IBM, Coursera', logo: 'coursera', col: 0x4a8bff, top: 0x3d5a8c, rock: 0x2c3550 },
  { t: ['Python', 'Certification'], full: 'Python Certification', i: 'freeCodeCamp', logo: 'freecodecamp', col: 0x4de08c, top: 0x4f9a63, rock: 0x3d4a3a },
  { t: ['Intro to', 'Programming'], full: 'Intro to Programming', i: 'Kaggle', logo: 'kaggle', col: 0x20beff, top: 0x3f7f9a, rock: 0x2d4552 },
];
const PX = [-5.7, -1.9, 1.9, 5.7], PY = [0.5, -0.45, 0.35, -0.4], PZ = [0, -1.6, -1.6, 0];
const hexPts = (r) => Array.from({ length: 7 }, (_, i) => new THREE.Vector3(Math.sin((i / 6) * 6.2832) * r, 0, Math.cos((i / 6) * 6.2832) * r));

export function vaultScene() {
  const root = new THREE.Group(), sp = makeSparks(root, 500), N = CERTS.length, hex = (c) => '#' + new THREE.Color(c).getHexString();
  root.add(new THREE.AmbientLight(0x9aa6c8, 1.0));
  const key = new THREE.DirectionalLight(0xfff0dc, 2.2); key.position.set(4, 9, 7); root.add(key);
  const rim = new THREE.DirectionalLight(0x8b7cff, 1.4); rim.position.set(-6, 3, -5); root.add(rim);
  const qr = new THREE.Quaternion(), pv = new THREE.Vector3();

  const islands = CERTS.map((c, i) => {
    const wrap = new THREE.Group(); wrap.position.set(PX[i], PY[i], PZ[i]); root.add(wrap);
    const g = new THREE.Group(); wrap.add(g);
    const top = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.5, 0.3, 6), std(c.top)); top.position.y = -0.15; g.add(top);
    const trim = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(hexPts(1.6)), new THREE.LineBasicMaterial({ color: c.col, transparent: true, opacity: 0.9 })); trim.position.y = 0.005; g.add(trim);
    const cone = new THREE.Mesh(new THREE.ConeGeometry(1.5, 2.1, 6, 1), std(c.rock)); cone.rotation.x = Math.PI; cone.position.y = -1.35; g.add(cone);
    const rocks = [0, 1, 2].map((k) => { const m = new THREE.Mesh(new THREE.IcosahedronGeometry(0.16 + k * 0.05, 0), std(c.rock)); m.userData.k = k; g.add(m); return m; });
    const mats = [top.material, cone.material];
    const props = new THREE.Group(); g.add(props);
    // flag with the issuer
    const fc = tex(256, 128), fx = fc.x; fx.fillStyle = hex(c.col); fx.fillRect(0, 0, 256, 128); fx.fillStyle = '#0b0f18'; fx.font = '800 44px Syne, sans-serif'; fx.textAlign = 'center'; fx.textBaseline = 'middle'; fx.fillText(c.i.length > 12 ? c.i.split(',')[0] : c.i, 128, 66); fc.t.needsUpdate = true;
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.5, 8), std(0xd9d9d9)); pole.position.set(1.1, 0.75, -0.95); props.add(pole);
    const flag = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.4), new THREE.MeshBasicMaterial({ map: fc.t, side: THREE.DoubleSide })); flag.position.set(1.5, 1.28, -0.95); props.add(flag);
    // floating label stack (billboard)
    const lab = new THREE.Group(); lab.position.set(0, 1.95, 0); wrap.add(lab);
    const mark = new THREE.Group(); mark.position.y = 1.95; lab.add(mark);
    if (c.logo) mark.add(lg(c.logo, 0.8)); else mark.add(label(c.mono, { size: 0.8, color: hex(c.col), font: '800 72px Syne, sans-serif' }));
    const ts = c.t.map((ln, k) => { const l = label(ln, { size: 0.5 }); l.position.set(0, 1.25 - k * 0.55, 0); l.material.depthTest = false; l.renderOrder = 6; lab.add(l); return l; });
    const il = label(c.i, { size: 0.3, color: hex(c.col), font: MONO }); il.position.set(0, 0.05, 0); il.material.depthTest = false; il.renderOrder = 6; lab.add(il);
    return { wrap, g, props, mats, rocks, flag, lab, mark, ts, il, ph: i * 1.9, f: 0, spin: 0, lift: 0, anim: null, baseY: PY[i], c };
  });

  // ---- 0: supply chain harbour: containers, a gantry crane, a cargo ship sailing around the island
  {
    const I = islands[0], P = I.props, pal = [0xe4572e, 0x29b6f6, 0xffc145, 0x6bd36b, 0xb86bff];
    [[-0.95, 0.14, -0.4, 0.2], [-0.95, 0.42, -0.4, 0.2], [-0.55, 0.14, -0.6, -0.1], [0.85, 0.14, 0.55, 0.3], [0.85, 0.42, 0.55, 0.3], [0.5, 0.14, 0.75, 0.1], [-0.2, 0.14, 0.95, 0.4]].forEach(([x, y, z, r], k) => { const b = box(0.52, 0.28, 0.26, std(pal[k % 5]), x, y, z); b.rotation.y = r; P.add(b); });
    const legM = std(0x3a3f4c); [[-0.45, -0.08], [0.45, -0.08], [-0.45, 0.2], [0.45, 0.2]].forEach(([x, z]) => P.add(box(0.06, 1.15, 0.06, legM, x, 0.57, z)));
    P.add(box(1.1, 0.07, 0.5, legM, 0, 1.15, 0.06));
    const trolley = new THREE.Group(); trolley.position.set(0, 1.1, 0.06); P.add(trolley);
    const cable = box(0.015, 1, 0.015, std(0xcccccc), 0, -0.5, 0); trolley.add(cable);
    const load = box(0.3, 0.2, 0.2, std(0xff7a45, { emissive: 0x4a1a08 }), 0, -1, 0); trolley.add(load);
    const ship = new THREE.Group(); P.add(ship);
    ship.add(box(0.8, 0.14, 0.26, std(0x2a3550), 0, 0.3, 0));
    const bow = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.22, 4), std(0x2a3550)); bow.rotation.z = -Math.PI / 2; bow.position.set(0.5, 0.3, 0); ship.add(bow);
    ship.add(box(0.18, 0.18, 0.2, std(0xe8e0d0), -0.25, 0.46, 0)); ship.add(box(0.16, 0.1, 0.18, std(0xe4572e), 0.1, 0.4, 0)); ship.add(box(0.16, 0.1, 0.18, std(0x29b6f6), 0.28, 0.4, 0));
    I.anim = (t, f) => { const s = 0.9 + f * 1.4; trolley.position.x = Math.sin(t * 0.9 * s) * 0.38; const d = 0.5 + (Math.sin(t * 1.3 * s) * 0.5 + 0.5) * 0.55; cable.scale.y = d; cable.position.y = -d / 2; load.position.y = -d - 0.1; const a = t * 0.45 * s; ship.position.set(Math.sin(a) * 2.15, 0.15, Math.cos(a) * 2.15); ship.rotation.y = a + Math.PI / 2; };
  }
  // ---- 1: data science city: equaliser towers, orbiting data points, a halo
  {
    const I = islands[1], P = I.props, bars = [];
    for (let x = 0; x < 3; x++) for (let z = 0; z < 3; z++) { const m = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1, 0.3), std(0x4a8bff, { emissive: 0x1a3a8f, emissiveIntensity: 0.9 })); m.position.set((x - 1) * 0.5 - 0.15, 0.5, (z - 1) * 0.5 + 0.1); m.userData = { ph: x * 1.3 + z * 0.8 }; P.add(m); bars.push(m); }
    const pts = Array.from({ length: 14 }, (_, k) => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), new THREE.MeshBasicMaterial({ color: k % 3 ? 0x7fd0ff : 0xffffff })); m.userData = { a: k * 0.45, r: 1.95 + (k % 3) * 0.1, y: 0.4 + (k % 5) * 0.3, s: 0.35 + (k % 4) * 0.1 }; P.add(m); return m; });
    const halo = new THREE.Mesh(new THREE.TorusGeometry(1.95, 0.012, 6, 100), new THREE.MeshBasicMaterial({ color: 0x4a8bff, transparent: true, opacity: 0.6 })); halo.rotation.x = Math.PI / 2; halo.position.y = 0.9; P.add(halo);
    I.anim = (t, f) => { const s = 1 + f * 1.5; bars.forEach((b) => { const h = 0.3 + (Math.sin(t * 1.6 * s + b.userData.ph) * 0.5 + 0.5) * 1.1; b.scale.y = h; b.position.y = h / 2 + 0.02; b.material.emissiveIntensity = 0.5 + h * 0.5; }); pts.forEach((p) => { const u = p.userData; u.a += 0.016 * u.s * s; p.position.set(Math.cos(u.a) * u.r, u.y + Math.sin(u.a * 2) * 0.1, Math.sin(u.a) * u.r); }); halo.rotation.z = t * 0.4 * s; };
  }
  // ---- 2: python: a snake slithering round the island, a terminal beside it
  {
    const I = islands[2], P = I.props, SEG = 26, snake = [];
    for (let k = 0; k < SEG; k++) { const m = new THREE.Mesh(new THREE.SphereGeometry(0.15 - k * 0.0042, 14, 14), std(new THREE.Color(0x4b8bbe).lerp(new THREE.Color(0xffd43b), k / SEG), { flatShading: false, emissive: 0x112211, emissiveIntensity: 0.3 })); P.add(m); snake.push(m); }
    [0.07, -0.07].forEach((z) => { const e = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffffff })); e.position.set(0.1, 0.06, z); snake[0].add(e); });
    const tt = tex(256, 160), scr = new THREE.Mesh(new THREE.PlaneGeometry(0.85, 0.53), new THREE.MeshBasicMaterial({ map: tt.t }));
    const tab = new THREE.Group(); tab.position.set(-0.85, 0.6, -0.7); tab.rotation.y = 0.7; tab.add(box(0.9, 0.58, 0.04, std(0x14161e))); scr.position.z = 0.025; tab.add(scr); P.add(tab);
    let ft = 0; const draw = (t) => { const c = tt.x; c.fillStyle = '#0d1117'; c.fillRect(0, 0, 256, 160); c.fillStyle = '#4de08c'; c.font = '500 18px "JetBrains Mono", monospace'; c.fillText('>>> import this', 10, 30); c.fillStyle = '#9fb4ff'; c.fillText('>>> print("hello")', 10, 60); c.fillStyle = '#f4efe7'; c.fillText('hello', 10, 90); c.fillStyle = '#4de08c'; c.fillText('>>> ' + (Math.floor(t * 2) % 2 ? '_' : ''), 10, 120); tt.t.needsUpdate = true; };
    I.anim = (t, f, dt) => { const s = 0.8 + f * 1.4; snake.forEach((m, k) => { const u = t * 0.7 * s - k * 0.17; m.position.set(Math.sin(u * 1.1) * 1.0, 0.2 + Math.sin(u * 3) * 0.1, Math.sin(u * 0.8 + 1) * 1.0); }); ft += dt; if (ft > 0.25) { ft = 0; draw(t); } };
  }
  // ---- 3: programming: a laptop with scrolling code, a stair of glowing blocks, floating glyphs
  {
    const I = islands[3], P = I.props;
    const lt = tex(256, 160), screen = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.56), new THREE.MeshBasicMaterial({ map: lt.t }));
    const lap = new THREE.Group(); lap.position.set(-0.4, 0.04, 0.4); lap.rotation.y = 0.4; lap.add(box(1.0, 0.05, 0.65, std(0x2a2f3c)));
    const lid = new THREE.Group(); lid.position.set(0, 0.03, -0.3); lid.rotation.x = -0.35; lid.add(box(1.0, 0.62, 0.04, std(0x1c2029), 0, 0.31, 0)); screen.position.set(0, 0.31, 0.025); lid.add(screen); lap.add(lid); P.add(lap);
    const stepM = std(0x20beff, { emissive: 0x0a4a66, emissiveIntensity: 1.1 }), steps = [0, 1, 2, 3].map((k) => { const b = box(0.4, 0.22 * (k + 1), 0.4, stepM, 0.55 + k * 0.38, 0.11 * (k + 1), -0.45); P.add(b); return b; });
    const glyphs = ['{ }', '</>', '01', '=>'].map((s, k) => { const l = label(s, { size: 0.3, color: '#20beff', font: MONO }); l.userData = { a: k * 1.6, y: 1.0 + k * 0.25 }; P.add(l); return l; });
    const CODE = ['def fit(df):', '  X = df.drop("y")', '  m = Model()', '  m.fit(X, df.y)', '  return m', 'for row in data:', '  clean(row)', 'print(score)', 'if ok: submit()', 'import numpy as np'];
    let ft = 0, sc = 0; const draw = () => { const c = lt.x; c.fillStyle = '#0d1117'; c.fillRect(0, 0, 256, 160); c.font = '500 16px "JetBrains Mono", monospace'; for (let r = 0; r < 8; r++) { const ln = CODE[(sc + r) % CODE.length]; c.fillStyle = ln.startsWith('def') || ln.startsWith('for') || ln.startsWith('if') ? '#ff7b9c' : ln.includes('"') ? '#9fe0ff' : '#c9d1d9'; c.fillText(ln, 10, 24 + r * 18); } lt.t.needsUpdate = true; };
    I.anim = (t, f, dt) => { const s = 1 + f * 1.5; steps.forEach((b, k) => { b.material.emissiveIntensity = 0.6 + (Math.sin(t * 2 * s - k) * 0.5 + 0.5) * 0.9; }); glyphs.forEach((l) => { const u = l.userData; u.a += 0.012 * s; l.position.set(Math.cos(u.a) * 1.5, u.y + Math.sin(t + u.a) * 0.1, Math.sin(u.a) * 1.5); }); ft += dt; if (ft > 0.45 / s) { ft = 0; sc++; draw(); } };
  }

  // ---- interaction
  let hover = -1, hl = -1, yaw = 0, vel = 0, dragging = false, lx = 0, bound = false, lastUpd = 0, sel = -1;
  const bind = () => {
    const cv = window.__app && window.__app.cv; if (!cv || bound) return; bound = true;
    cv.addEventListener('pointerdown', (e) => { if (performance.now() - lastUpd > 150) return; dragging = true; lx = e.clientX; vel = 0; });
    window.addEventListener('pointermove', (e) => { if (!dragging) return; const dx = e.clientX - lx; lx = e.clientX; yaw += dx * 0.006; vel = dx * 0.006 * 60; });
    window.addEventListener('pointerup', () => { dragging = false; });
  };
  return {
    root, vo: 0.1, floor: -3.4, pool: 1.8, cam: { pos: new THREE.Vector3(0, 3.0, 12.8), look: new THREE.Vector3(0, 0.9, 0) },
    highlight: (n) => { hl = n; },
    detail: () => ({ title: 'Certifications', sub: N + ' completed courses', points: CERTS.map((c) => c.full + ', ' + c.i), tags: [], note: '' }),
    hintFor: () => 'Drag to spin · hover an island to wake it up · click to celebrate',
    click() { const i = hover; if (i < 0) { sp.burst(new THREE.Vector3(0, 0.5, 0), 0xf4c95d, 60, 4); return; } islands[i].spin += Math.PI * 2; sp.burst(islands[i].wrap.position.clone().add(new THREE.Vector3(0, 1, 0)), CERTS[i].col, 160, 6); },
    update(t, dt, p) {
      lastUpd = performance.now(); bind();
      if (!dragging) { yaw += vel * dt; vel *= Math.exp(-2.5 * dt); if (Math.abs(vel) < 0.05) yaw += 0.03 * dt; }
      root.rotation.y = yaw; root.rotation.x = -p.y * 0.03;
      const cam = window.__app && window.__app.cam; root.getWorldQuaternion(qr).invert(); if (cam) qr.multiply(cam.quaternion);
      hover = -1;
      if (cam) { root.updateMatrixWorld(true); const asp = innerWidth / innerHeight; let best = 0.3; islands.forEach((I, i) => { I.wrap.getWorldPosition(pv); pv.y += 0.6; pv.project(cam); const d = Math.hypot((pv.x - p.x) * asp, pv.y - p.y); if (d < best) { best = d; hover = i; } }); }
      const want = hl >= 0 ? hl : dragging ? -1 : hover; sel = want;
      islands.forEach((I, i) => {
        const on = i === want; I.f += ((on ? 1 : 0) - I.f) * Math.min(1, dt * 6);
        I.lift += ((on ? 0.55 : Math.sin(t * 0.9 + I.ph) * 0.14) - I.lift) * Math.min(1, dt * 6); I.wrap.position.y = I.baseY + I.lift;
        I.spin *= Math.exp(-2.2 * dt); I.g.rotation.y = Math.sin(t * 0.25 + I.ph) * 0.15 + I.spin;
        I.wrap.scale.setScalar(1 + I.f * 0.08);
        I.rocks.forEach((m) => { const k = m.userData.k; m.position.set(Math.cos(t * 0.4 + k * 2.1 + I.ph) * (0.7 + k * 0.25), -2.0 - k * 0.45 + Math.sin(t * 0.8 + k) * 0.1, Math.sin(t * 0.4 + k * 2.1 + I.ph) * (0.7 + k * 0.25)); m.rotation.x = t * 0.5 + k; });
        I.flag.rotation.y = Math.sin(t * 3 + I.ph) * 0.2; I.mats.forEach((m) => { m.emissive.setHex(I.c.col); m.emissiveIntensity += ((on ? 0.22 : 0) - m.emissiveIntensity) * 0.15; });
        I.lab.quaternion.copy(qr);
        const o = on || want < 0 ? 1 : 0.55; I.ts.forEach((l) => { l.material.opacity += (o - l.material.opacity) * 0.15; }); I.il.material.opacity += (o - I.il.material.opacity) * 0.15;
        I.lab.scale.setScalar(I.lab.scale.x + ((on ? 1.12 : 1) - I.lab.scale.x) * 0.15);
        if (I.anim) I.anim(t, I.f, dt);
      });
      if (Math.random() < dt * 5) sp.burst(new THREE.Vector3((Math.random() - 0.5) * 14, -2 + Math.random() * 5, -2 + Math.random() * 3), 0xf4c95d, 1, 0.5);
      sp.update(dt);
    },
    stat() { return sel >= 0 ? CERTS[sel].full + ' · ' + CERTS[sel].i : N + ' certifications · four small worlds'; },
  };
}
