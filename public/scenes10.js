import * as THREE from 'three';
import { label, makeSparks, logo3d, ach } from './common.js';

const MONO = '500 44px "JetBrains Mono", monospace';
// logo3d draws one logo-height below its anchor; lift it back so it sits centred on the anchor
const lg = (k, s) => { const w = new THREE.Group(), l = logo3d(k, s); l.position.y = s; w.add(l); return w; };
const std = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.45, metalness: 0.15, ...o });
const glowM = (c) => new THREE.MeshBasicMaterial({ color: c });
const tex = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return { c, x: c.getContext('2d'), t }; };
function rbox(w, h, d, r, mat) {
  const s = new THREE.Shape(), x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r); s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h); s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r); s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
  const g = new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: true, bevelSize: r * 0.25, bevelThickness: r * 0.25, bevelSegments: 2, curveSegments: 6 }); g.translate(0, 0, -d / 2); return new THREE.Mesh(g, mat);
}

// ---------------------------------------------------------------- HOBBY: THE LOADOUT
// A gaming PC, a PS5 and a Meta Quest 3S on neon pedestals in front of an RGB hex wall. The games float above as
// neon plaques you can shoot, aim-trainer style. Shoot all six for the achievement.
const GAMES = [
  { n: 'Valorant', icon: 'valorant', c: '#ff4655' }, { n: 'CS2', icon: 'counterstrike', c: '#f2a93b' }, { n: 'Rocket League', slug: 'rocket-league', c: '#2e9bff', g: 'ball' },
  { n: 'Overwatch 2', slug: 'overwatch-2', c: '#f99e1a', g: 'ow' }, { n: 'GTA V', icon: 'rockstargames', c: '#5fcf4a' }, { n: 'Rainbow Six', icon: 'ubisoft', c: '#ffd23f' },
];
const RIGS = [{ n: 'Gaming PC', sub: 'RGB battle station', x: -5.6 }, { n: 'PlayStation 5', sub: 'console', x: 0 }, { n: 'Meta Quest 3S', sub: 'VR headset', x: 5.6 }];

// Drawn icon, only for the two games with no logo in the open icon set (Rocket League, Overwatch 2).
function glyphTex(G) {
  const T = tex(256, 256), c = T.x, cx = 128, cy = 128; c.strokeStyle = G.c; c.lineWidth = 14; c.lineCap = 'round'; c.lineJoin = 'round';
  if (G.g === 'ball') { c.beginPath(); c.arc(cx, cy, 78, 0, 6.283); c.moveTo(cx - 78, cy); c.quadraticCurveTo(cx, cy - 56, cx + 78, cy); c.moveTo(cx - 64, cy + 42); c.quadraticCurveTo(cx, cy + 8, cx + 64, cy + 42); c.stroke(); }
  else { c.beginPath(); c.arc(cx, cy, 80, 0, 6.283); c.stroke(); c.lineWidth = 16; c.beginPath(); c.moveTo(cx - 38, cy + 40); c.lineTo(cx, cy - 40); c.lineTo(cx + 38, cy + 40); c.stroke(); }
  T.t.needsUpdate = true; return T.t;
}

export function hobbyScene() {
  const root = new THREE.Group(), sp = makeSparks(root, 500), qr = new THREE.Quaternion(), pv = new THREE.Vector3(), col = new THREE.Color();
  root.add(new THREE.AmbientLight(0x8c94b8, 0.9));
  const key = new THREE.DirectionalLight(0xfff0e0, 2.0); key.position.set(3, 8, 8); root.add(key);
  const rimL = new THREE.DirectionalLight(0xff4d8d, 1.6); rimL.position.set(-7, 3, -4); root.add(rimL);
  const rimR = new THREE.DirectionalLight(0x37d6ff, 1.4); rimR.position.set(7, 3, -4); root.add(rimR);
  const lbl = (t, x, y, o) => { const s = label(t, o); s.position.set(x, y, 0); s.material.depthTest = false; s.renderOrder = 6; root.add(s); return s; };

  // RGB hex wall
  const HX = 15, HY = 8, hexM = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.56, 0.56, 0.06, 6), new THREE.MeshBasicMaterial({ color: 0xffffff }), HX * HY); hexM.frustumCulled = false;
  const hexPos = []; for (let r = 0; r < HY; r++) for (let c = 0; c < HX; c++) hexPos.push([(c - (HX - 1) / 2) * 1.0 + (r % 2 ? 0.5 : 0), 4.6 - r * 0.87, -3.6]);
  const dm = new THREE.Object3D(); root.add(hexM);
  hexPos.forEach(([x, y, z], i) => { dm.position.set(x, y, z); dm.rotation.set(Math.PI / 2, 0, 0); dm.scale.set(0.9, 1, 0.9); dm.updateMatrix(); hexM.setMatrixAt(i, dm.matrix); });

  // pedestals + rigs
  const rigs = RIGS.map((R) => {
    const g = new THREE.Group(); g.position.set(R.x, -1.9, 0); root.add(g);
    const ped = new THREE.Mesh(new THREE.CylinderGeometry(1.55, 1.75, 0.22, 6), std(0x15171f, { roughness: 0.6 })); g.add(ped);
    const rim = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(Array.from({ length: 7 }, (_, k) => new THREE.Vector3(Math.sin((k / 6) * 6.2832) * 1.55, 0.115, Math.cos((k / 6) * 6.2832) * 1.55))), new THREE.LineBasicMaterial({ color: 0xff4d8d })); g.add(rim);
    const body = new THREE.Group(); body.position.y = 0.2; g.add(body);
    const n = lbl(R.n, R.x, -3.45, { size: 0.5 }), s1 = lbl('standby · click to power up', R.x, -4.05, { size: 0.3, color: '#ff8fb8', font: MONO }), s2 = lbl('online · click to power down', R.x, -4.05, { size: 0.3, color: '#7bffb0', font: MONO }); s2.material.opacity = 0;
    return { g, body, rim, n, s1, s2, p: 0, target: 0, f: 0, spin: 0, pulse: 0 };
  });
  // --- gaming PC
  const pc = rigs[0], fans = [], pcL = new THREE.PointLight(0xff4d8d, 7, 7);
  {
    const B = pc.body; B.position.y = 1.65; B.add(rbox(1.4, 2.7, 1.25, 0.08, std(0x16181f, { metalness: 0.5, roughness: 0.4 })));
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 2.5), new THREE.MeshBasicMaterial({ color: 0x0a0c14, transparent: true, opacity: 0.35 })); glass.position.z = 0.9; B.add(glass);
    for (let k = 0; k < 3; k++) {
      const f = new THREE.Group(); f.position.set(-0.38, 0.85 - k * 0.85, 0.74); const ring = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.035, 8, 28), glowM(0xff4d8d)); f.add(ring);
      for (let b = 0; b < 5; b++) { const bl = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.26, 0.02), std(0x222633)); bl.position.set(0, 0.13, 0); const bg = new THREE.Group(); bg.rotation.z = (b / 5) * 6.2832; bg.add(bl); f.add(bg); }
      B.add(f); fans.push({ f, ring });
    }
    const gpu = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.28, 0.5), std(0x222633)); gpu.position.set(0.18, -0.05, 0.9); B.add(gpu);
    const strip = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.04, 0.02), glowM(0xff4d8d)); strip.position.set(0.18, 0.04, 1.17); B.add(strip); fans.push({ ring: strip });
    for (let k = 0; k < 3; k++) { const r = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.5, 0.2), glowM(0x37d6ff)); r.position.set(0.34 + k * 0.1, 0.85, 0.82); B.add(r); fans.push({ ring: r }); }
    pcL.position.set(0, 1.5, 1.4); pc.g.add(pcL);
  }
  // --- PS5 + DualSense
  const ps = rigs[1], psGlow = glowM(0x3d8bff);
  const psL = new THREE.PointLight(0x3d8bff, 0, 7); psL.position.set(0, 1.6, 1.6); ps.g.add(psL);  {
    const B = ps.body; B.position.y = 1.45; B.rotation.y = 0.5; const wh = std(0xf2f4f8, { roughness: 0.3 });
    const a = rbox(0.34, 2.7, 1.25, 0.12, wh); a.position.x = -0.3; a.rotation.z = 0.04; B.add(a); const b = rbox(0.34, 2.7, 1.25, 0.12, wh); b.position.x = 0.3; b.rotation.z = -0.04; B.add(b);
    B.add(new THREE.Mesh(new THREE.BoxGeometry(0.3, 2.62, 1.12), std(0x0e1016, { roughness: 0.5 })));
    const led = new THREE.Mesh(new THREE.BoxGeometry(0.04, 2.3, 0.03), psGlow); led.position.set(0, 0, 0.58); B.add(led);
    const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.65, 0.1, 24), wh); stand.position.y = -1.4; B.add(stand);
    const pad = new THREE.Group(); pad.position.set(1.75, 0.55, 1.0); pad.rotation.set(-0.35, -0.5, 0); ps.pad = pad; ps.g.add(pad);
    pad.add(rbox(1.05, 0.52, 0.3, 0.16, wh)); const top = rbox(0.9, 0.2, 0.31, 0.08, std(0x0e1016)); top.position.y = 0.1; pad.add(top);
    [-1, 1].forEach((s) => { const gp = new THREE.Mesh(new THREE.CapsuleGeometry(0.16, 0.42, 4, 12), wh); gp.position.set(s * 0.42, -0.36, 0); gp.rotation.z = s * 0.25; pad.add(gp); });
    [[0.33, 0.04, 0xff6b9d], [0.45, 0.04, 0x6bd0ff], [0.39, -0.06, 0xffd23f], [0.39, 0.14, 0x7bd88f]].forEach(([x, y, cc]) => { const bt = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), glowM(cc)); bt.position.set(x, y, 0.2); pad.add(bt); });
    const bar = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.025, 0.02), psGlow); bar.position.set(0, 0.2, 0.17); pad.add(bar);
  }
  // --- Meta Quest 3S + Touch controllers
  const q = rigs[2], ctrls = [], sens = [];
  const qL = new THREE.PointLight(0x37d6ff, 0, 7); qL.position.set(0, 1.8, 1.6); q.g.add(qL);  const qFace = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.55), new THREE.MeshBasicMaterial({ color: 0x37d6ff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })); qFace.position.set(0, 0, 0.45); q.body.add(qFace);
  {
    const B = q.body; B.position.y = 1.6; const wh = std(0xf2f4f8, { roughness: 0.35 });
    B.add(rbox(1.95, 1.0, 0.75, 0.3, wh)); const face = rbox(1.75, 0.8, 0.06, 0.25, std(0x0b0d12, { roughness: 0.25 })); face.position.z = 0.4; B.add(face);
    [[-0.55, 0.22], [0.55, 0.22], [0, 0.28], [-0.3, -0.18], [0.3, -0.18]].forEach(([x, y]) => { const s = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.03, 16), glowM(0x2a3550)); s.rotation.x = Math.PI / 2; s.position.set(x, y, 0.44); B.add(s); sens.push(s); });
    const strap = new THREE.Mesh(new THREE.TorusGeometry(0.95, 0.08, 10, 32, Math.PI), wh); strap.rotation.set(0, Math.PI / 2, 0); strap.position.set(0, 0.05, -0.2); strap.scale.set(1, 0.55, 1); B.add(strap);
    [-1, 1].forEach((s) => { const c = new THREE.Group(); c.position.set(s * 1.7, 0.7, 0.5); c.rotation.set(0.5, 0, s * 0.3); c.add(new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.045, 10, 28), wh)); const h = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.09, 0.62, 14), std(0x14161c)); h.position.set(0, -0.4, 0); c.add(h); const st = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), glowM(0x37d6ff)); st.position.set(0, -0.08, 0.05); c.add(st); q.g.add(c); ctrls.push(c); });
  }

  // the games: glass spheres with the game's mark floating inside
  const plaques = GAMES.map((G, i) => {
    const x = (i - 2.5) * 2.3, y = 3.35 - x * x * 0.012, z = -0.8 - x * x * 0.02, g = new THREE.Group(); g.position.set(x, y, z); root.add(g);
    const color = new THREE.Color(G.c);
    const orb = new THREE.Mesh(new THREE.SphereGeometry(0.88, 48, 48), new THREE.MeshPhysicalMaterial({ color: color.clone().multiplyScalar(0.35), emissive: color, emissiveIntensity: 0.35, roughness: 0.08, metalness: 0.1, clearcoat: 1, clearcoatRoughness: 0.05, transparent: true, opacity: 0.55, envMapIntensity: 2.2 })); g.add(orb);
    const core = new THREE.Mesh(new THREE.SphereGeometry(0.62, 24, 24), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.2, blending: THREE.AdditiveBlending, depthWrite: false })); g.add(core);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.15, 0.018, 8, 80), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.8 })); ring.rotation.x = 1.2; g.add(ring);
    const mark = new THREE.Group(); g.add(mark);
    if (G.icon) mark.add(lg(G.icon, 1.0)); else mark.add(new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.1), new THREE.MeshBasicMaterial({ map: glyphTex(G), transparent: true, depthTest: false })));
    const nm = label(G.n, { size: 0.42, color: '#f4efe7' }); nm.position.set(0, -1.4, 0); nm.material.depthTest = false; nm.renderOrder = 6; g.add(nm);
    return { g, orb, core, ring, mark, nm, ph: i * 1.1, alive: true, respawn: 0, f: 0, s: 1, base: new THREE.Vector3(x, y, z), color, G };
  });
  // optional: drop official images into public/concept/logos and list them in logos/index.json
  // ({"rocket-league": "rocket-league.png", "overwatch-2": "overwatch-2.png", ...}); they replace the drawn icon or the stand-in mark.
  fetch('./logos/index.json').then((r) => (r.ok ? r.json() : {})).catch(() => ({})).then((map) => {
    plaques.forEach((P) => {
      const f = map[P.G.slug || P.G.icon]; if (!f) return;
      new THREE.TextureLoader().load('./logos/' + f, (t) => { t.colorSpace = THREE.SRGBColorSpace; P.mark.clear(); P.mark.add(new THREE.Mesh(new THREE.PlaneGeometry(1.3, 1.3), new THREE.MeshBasicMaterial({ map: t, transparent: true, depthTest: false }))); });
    });
  });
  const tracers = Array.from({ length: 4 }, () => { const l = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]), new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 })); l.frustumCulled = false; root.add(l); return { l, t: 0 }; });
  const hit = new Set(); let fanAng = 0, shots = 0, hover = -1, hoverK = '', ripple = null, rt = 0, sel = '';
  const shoot = (i) => {
    const P = plaques[i]; if (!P.alive) return; P.alive = false; P.respawn = 1.4; shots++; hit.add(i); sp.burst(P.base, P.color, 140, 6); ripple = P.base.clone(); rt = 0;
    const tr = tracers.find((k) => k.t <= 0) || tracers[0], pos = tr.l.geometry.attributes.position; pos.setXYZ(0, 0, -3.2, 6); pos.setXYZ(1, P.base.x, P.base.y, P.base.z); pos.needsUpdate = true; tr.l.material.color.copy(P.color); tr.t = 1;
    if (hit.size === GAMES.length) ach('sharpshooter');
  };
  const poke = (i) => { const r = rigs[i]; r.target = r.target > 0.5 ? 0 : 1; r.pulse = 1; r.spin += Math.PI * 2; sp.burst(new THREE.Vector3(RIGS[i].x, 0.5, 0), i === 0 ? 0xff4d8d : i === 1 ? 0x3d8bff : 0x37d6ff, 90, 5); };

  return {
    root, vo: () => (innerWidth <= 900 ? 0.12 : Math.max(0.04, Math.min(0.14, 150 / innerWidth))), floor: -2.15, pool: 1.9, cam: { pos: new THREE.Vector3(0, -0.5, 18.2), look: new THREE.Vector3(0, -1.0, 0) },
    hintFor: () => 'Click a game to shoot it · click a rig to power it up',
    cursor: () => (hoverK === 'g' ? 'aim · ' + GAMES[hover].n : hoverK === 'r' ? 'inspect · ' + RIGS[hover].n : 'aim'),
    click() { if (hoverK === 'g') shoot(hover); else if (hoverK === 'r') poke(hover); else sp.burst(new THREE.Vector3(0, 1, 0), 0xff4d8d, 50, 4); },
    update(t, dt, p) {
      const cam = window.__app && window.__app.cam; if (cam) root.getWorldQuaternion(qr).invert().multiply(cam.quaternion);
      hover = -1; hoverK = '';
      if (cam) {
        root.updateMatrixWorld(true); const asp = innerWidth / innerHeight; let best = 9;
        plaques.forEach((P, i) => { if (!P.alive) return; P.g.getWorldPosition(pv); pv.project(cam); const d = Math.hypot((pv.x - p.x) * asp, (pv.y - p.y) * 1.3); if (d < 0.2 && d < best) { best = d; hover = i; hoverK = 'g'; } });
        if (hoverK === '') { let bd = 0.42; rigs.forEach((r, i) => { r.g.getWorldPosition(pv); pv.y += 1.9; pv.project(cam); const d = Math.hypot((pv.x - p.x) * asp * 0.75, pv.y - p.y); if (d < bd) { bd = d; hover = i; hoverK = 'r'; } }); }
      }
      sel = hoverK === 'g' ? GAMES[hover].n : hoverK === 'r' ? RIGS[hover].n : '';
      // hex wall: a colour wave across the panels, plus a ripple from the last shot
      rt += dt;
      hexPos.forEach(([x, y], i) => {
        const h = 0.88 + 0.1 * Math.sin(t * 0.5 + x * 0.25 + y * 0.35); let v = 0.22 + 0.1 * Math.sin(t * 1.1 + x * 0.5 - y * 0.4);
        if (ripple) { const d = Math.hypot(x - ripple.x, y - ripple.y), w = d - rt * 7; if (Math.abs(w) < 1.0) v += (1 - Math.abs(w)) * 0.55 * Math.max(0, 1 - rt * 0.6); }
        col.setHSL(h % 1, 0.9, Math.min(0.6, v)); hexM.setColorAt(i, col);
      });
      hexM.instanceColor.needsUpdate = true;
      // rigs
      rigs.forEach((r, i) => {
        const on = hoverK === 'r' && hover === i; r.f += ((on ? 1 : 0) - r.f) * Math.min(1, dt * 6); r.pulse *= Math.exp(-2.5 * dt); r.spin *= Math.exp(-2 * dt); r.p += (r.target - r.p) * Math.min(1, dt * 4); const pw = r.p; r.s1.material.opacity = 1 - pw; r.s2.material.opacity = pw;
        r.body.rotation.y = (i === 1 ? 0.5 : 0) + Math.sin(t * 0.4 + i) * 0.25 + r.f * t * 0.6 + r.spin; r.body.position.y = (i === 0 ? 1.65 : i === 1 ? 1.45 : 1.6) + Math.sin(t * 1.2 + i * 2) * (i === 2 ? 0.12 : 0.03) + r.f * 0.18;
        r.g.scale.setScalar(1 + r.f * 0.06); r.rim.material.color.setHSL((0.92 + t * 0.05) % 1, 0.9, 0.1 + 0.5 * r.p); r.n.material.opacity += ((on || hoverK !== 'r' ? 1 : 0.6) - r.n.material.opacity) * 0.15;
      });
      const hue = (t * 0.25) % 1; fanAng += dt * (pc.p * 5 + pc.f * 1.5 + pc.pulse * 20);
      fans.forEach((f, k) => { col.setHSL((hue + k * 0.08) % 1, 1, 0.025 + 0.53 * pc.p); f.ring.material.color.copy(col); if (f.f) f.f.rotation.z = -fanAng + k; });
      pcL.color.setHSL(hue, 1, 0.55); pcL.intensity = pc.p * 8 + pc.pulse * 20;
      psGlow.color.setHSL(0.6, 1, Math.min(0.85, 0.04 + 0.5 * ps.p + 0.1 * Math.sin(t * 3) * ps.p + ps.pulse * 0.3)); psL.intensity = ps.p * 9 + ps.pulse * 15;
      sens.forEach((s) => s.material.color.setHSL(0.55, 1, 0.04 + 0.5 * q.p + q.pulse * 0.2)); qL.intensity = q.p * 9 + q.pulse * 15; qFace.material.opacity = q.p * 0.5 + q.pulse * 0.3 + Math.sin(t * 3) * 0.05 * q.p; if (ps.pad) { ps.pad.position.y = 0.55 + Math.sin(t * 1.3) * 0.08; ps.pad.rotation.z = Math.sin(t * 0.8) * 0.12; }
      ctrls.forEach((c, k) => { c.position.y = 0.7 + Math.sin(t * 1.4 + k * 2) * 0.1; c.rotation.y = t * 0.7 * (k ? -1 : 1) + q.spin; });
      // game spheres
      plaques.forEach((P, i) => {
        const on = hoverK === 'g' && hover === i; P.f += ((on ? 1 : 0) - P.f) * Math.min(1, dt * 8);
        if (!P.alive) { P.respawn -= dt; if (P.respawn <= 0) { P.alive = true; P.s = 0.01; sp.burst(P.base, P.color, 30, 3); } }
        P.s += ((P.alive ? 1 + P.f * 0.18 : 0.001) - P.s) * Math.min(1, dt * (P.alive ? 9 : 14)); P.g.scale.setScalar(Math.max(0.001, P.s));
        P.g.position.set(P.base.x, P.base.y + Math.sin(t * 1.1 + P.ph) * 0.12, P.base.z); P.mark.quaternion.copy(qr); P.mark.rotation.z = 0;
        P.ring.rotation.z += dt * (0.5 + P.f * 3); P.orb.material.emissiveIntensity = 0.3 + P.f * 0.7; P.core.material.opacity = 0.2 + P.f * 0.35; P.nm.material.opacity += ((on || hoverK !== 'g' ? 1 : 0.55) - P.nm.material.opacity) * 0.15;
      });
      tracers.forEach((k) => { if (k.t > 0) { k.t -= dt * 4; k.l.material.opacity = Math.max(0, k.t); } });
      sp.update(dt);
    },
    stat() { return sel || 'games shot ' + hit.size + '/' + GAMES.length + ' · ' + shots + ' shots'; },
  };
}
