import * as THREE from 'three';
import { label, makeSparks, ach } from './common.js';

const MONO = '500 44px "JetBrains Mono", monospace';
const BS_COL = 0xff7ab8, MS_COL = 0x5ec8ff;

// ---------------------------------------------------------------- EDUCATION GLOBE
// Built like the home globe: extruded glass shards, glowing core, hover lift, drag to spin, click to break open and step inside.
const PR_HALVES = [
  { name: 'KALSHI', sub: 'Trading system', col: 0xff6a1f, dir: new THREE.Vector3(0.9, 0.35, 0.25).normalize() },
  { name: 'SHORTS-ENGINE', sub: 'Proof-first video', col: 0xa58bff, dir: new THREE.Vector3(-0.9, -0.35, -0.25).normalize() },
];
const EDU_HALVES = [
  { name: "MASTER'S", sub: 'Data Science and AI', col: MS_COL, dir: new THREE.Vector3(0.9, 0.35, 0.25).normalize(), at: [3.1, 3.3] },
  { name: "BACHELOR'S", sub: 'Computer Science', col: BS_COL, dir: new THREE.Vector3(-0.9, -0.35, -0.25).normalize(), at: [-3.1, 3.3] },
];

function shardGeom(a, b, c, cen, nrm, th) {
  const o = [a, b, c].map((v) => v.clone().sub(cen).multiplyScalar(0.955));
  const i = o.map((v) => v.clone().multiplyScalar(0.9).addScaledVector(nrm, -th));
  const t = []; const tri = (p, q2, r) => t.push(p.x, p.y, p.z, q2.x, q2.y, q2.z, r.x, r.y, r.z);
  tri(o[0], o[1], o[2]); tri(i[0], i[2], i[1]);
  for (let k = 0; k < 3; k++) { const k2 = (k + 1) % 3; tri(o[k], i[k], o[k2]); tri(o[k2], i[k], i[k2]); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(t, 3)); g.computeVertexNormals(); return g;
}

function globeScene(HALVES, BASE, HINT) {
  const root = new THREE.Group(), group = new THREE.Group(); root.add(group);
  const R = 3.2, sp = makeSparks(root, 300);
  const base = new THREE.IcosahedronGeometry(R, 3), P = base.attributes.position;
  const glass = HALVES.map((h) => new THREE.MeshPhysicalMaterial({ color: new THREE.Color(0x141c28).lerp(new THREE.Color(h.col), 0.16), metalness: 0.1, roughness: 0.05, clearcoat: 1, clearcoatRoughness: 0.03, envMapIntensity: 2.4, transparent: true, opacity: 0.3, depthWrite: false, side: THREE.DoubleSide, iridescence: 0.5, iridescenceIOR: 1.35, iridescenceThicknessRange: [100, 400] }));
  const edge = HALVES.map((h) => new THREE.LineBasicMaterial({ color: h.col, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false }));
  const shards = [], meshes = [], A = new THREE.Vector3(), B = new THREE.Vector3(), C = new THREE.Vector3();
  for (let f = 0; f < P.count; f += 3) {
    A.fromBufferAttribute(P, f); B.fromBufferAttribute(P, f + 1); C.fromBufferAttribute(P, f + 2);
    const cen = A.clone().add(B).add(C).multiplyScalar(1 / 3), nrm = cen.clone().normalize();
    const ci = nrm.dot(HALVES[0].dir) >= nrm.dot(HALVES[1].dir) ? 0 : 1;
    const m = new THREE.Mesh(shardGeom(A.clone(), B.clone(), C.clone(), cen, nrm, 0.28), glass[ci]);
    m.add(new THREE.LineSegments(new THREE.EdgesGeometry(m.geometry, 12), edge[ci])); m.position.copy(cen); group.add(m); meshes.push(m);
    shards.push({ m, c: ci, home: cen.clone(), nrm, vel: new THREE.Vector3(), ang: new THREE.Vector3(), delay: 0, free: false, ph: Math.random() * 6.28, lift: 0 });
  }
  const coreMat = new THREE.ShaderMaterial({ transparent: true, uniforms: { uT: { value: 0 }, uA: { value: new THREE.Color(HALVES[0].col) }, uB: { value: new THREE.Color(HALVES[1].col) } },
    vertexShader: 'varying vec3 vN;varying vec3 vV;varying vec3 vP;void main(){vP=position;vN=normalize(normalMatrix*normal);vec4 mv=modelViewMatrix*vec4(position,1.);vV=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}',
    fragmentShader: 'varying vec3 vN;varying vec3 vV;varying vec3 vP;uniform float uT;uniform vec3 uA,uB;void main(){float f=pow(1.-max(dot(vN,vV),0.),2.2);vec3 c=mix(uB,uA,smoothstep(-.4,.4,vP.x));c=mix(c,vec3(1.,.95,.9),f*.3);float p=.78+.22*sin(uT*2.4);gl_FragColor=vec4(c*(.8+f*.9)*p,1.);}' });
  const core = new THREE.Mesh(new THREE.IcosahedronGeometry(1.2, 4), coreMat); group.add(core);
  const coreLight = new THREE.PointLight(0xcfe8ff, 30, 16, 1.6); root.add(coreLight);
  const key = new THREE.DirectionalLight(0xfff0e0, 1.2); key.position.set(4, 6, 5); root.add(key);
  const rim = new THREE.DirectionalLight(0x8b7cff, 1.6); rim.position.set(-6, 2, -5); root.add(rim);

  // Labels ride on the globe itself, like the home globe: pinned to each half, fading when that half turns away.
  const dom = HALVES.map((h) => { const d = document.createElement('div'); d.className = 'elbl'; d.style.setProperty('--c', '#' + new THREE.Color(h.col).getHexString()); d.innerHTML = '<span>' + h.name + '</span><i>' + h.sub + '</i>'; document.body.appendChild(d); return d; });
  const pv = new THREE.Vector3(), nw = new THREE.Vector3(), cdir = new THREE.Vector3();

  const ray = new THREE.Raycaster(), v2 = new THREE.Vector2(), tmp = new THREE.Quaternion(), eu = new THREE.Euler(), q0 = new THREE.Quaternion();
  let hover = -1, hoverPt = null, hvT = 0, lastP = { x: 0, y: 0 }, brokeAt = 0;
  // drag to spin, with inertia, like the home globe
  let dragging = false, lx = 0, ly = 0, vx = 0, vy = 0, bound = false, lastUpd = 0;
  const qa = new THREE.Quaternion(), AY = new THREE.Vector3(0, 1, 0), AX = new THREE.Vector3(1, 0, 0);
  const rotG = (ax, ay) => { qa.setFromAxisAngle(AY, ax); group.quaternion.premultiply(qa); qa.setFromAxisAngle(AX, ay); group.quaternion.premultiply(qa); };
  setInterval(() => { if (performance.now() - lastUpd > 300) dom.forEach((d) => { d.style.display = 'none'; }); }, 250);
  const bind = () => {
    const cv = window.__app && window.__app.cv; if (!cv || bound) return; bound = true;
    cv.addEventListener('pointerdown', (e) => { if (performance.now() - lastUpd > 150) return; dragging = true; lx = e.clientX; ly = e.clientY; vx = vy = 0; });
    window.addEventListener('pointermove', (e) => { if (!dragging) return; const dx = e.clientX - lx, dy = e.clientY - ly; lx = e.clientX; ly = e.clientY; rotG(dx * 0.008, dy * 0.008); vx = dx * 0.008 * 60; vy = dy * 0.008 * 60; });
    window.addEventListener('pointerup', () => { dragging = false; });
  };
  const pick = (p) => {
    const cam = window.__app && window.__app.cam; if (!cam) return null;
    root.updateMatrixWorld(true); v2.set(p.x, p.y); ray.setFromCamera(v2, cam);
    return ray.intersectObjects(meshes, false)[0] || null;
  };
  const reassemble = () => { const t = performance.now() / 1000; for (const s of shards) { if (s.free) s.delay = t; } brokeAt = 0; };

  return {
    root, vo: 0.04, floor: -4.6, pool: 1.7, cam: { pos: new THREE.Vector3(0, 0.3, 10.8), look: new THREE.Vector3(0, 0, 0) },
    hintFor: () => HINT,
    cursor: () => (dragging ? 'drag' : hover >= 0 ? 'break · ' + HALVES[hover].name.charAt(0) + HALVES[hover].name.slice(1).toLowerCase() : 'drag'),
    click() {
      if (brokeAt) return;
      const h = pick(lastP); if (!h) { sp.burst(new THREE.Vector3(0, 0, 0), MS_COL, 60, 4); return; }
      const idx = shards.findIndex((s) => s.m === h.object), ci = shards[idx].c, now = performance.now() / 1000;
      brokeAt = now; sp.burst(group.worldToLocal(h.point.clone()), HALVES[ci].col, 220, 8);
      for (const s of shards) {
        if (s.c !== ci) continue;
        s.free = true; s.delay = 1e12; s.vel.copy(s.nrm).multiplyScalar(2.5 + Math.random() * 5).add(new THREE.Vector3((Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2));
        s.ang.set((Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8);
      }
      setTimeout(() => window.__app.enter(BASE + ci), 650);
    },
    update(t, dt, p) {
      lastP = p; lastUpd = performance.now(); bind(); const now = lastUpd / 1000;
      if (brokeAt && now - brokeAt > 2.5) reassemble();
      if (dragging) hoverPt = null;
      else {
        rotG(vx * dt, vy * dt); vx *= Math.exp(-3 * dt); vy *= Math.exp(-3 * dt); if (Math.hypot(vx, vy) < 0.35) rotG(0.1 * dt, 0);
        if (!brokeAt && now - hvT > 0.07) { hvT = now; const h = pick(p); hover = h ? shards[meshes.indexOf(h.object)].c : -1; hoverPt = h ? group.worldToLocal(h.point.clone()) : null; }
      }
      coreMat.uniforms.uT.value = t;
      for (const s of shards) {
        const m = s.m;
        if (s.free) {
          if (now < s.delay) s.vel.multiplyScalar(Math.exp(-0.8 * dt));
          else { s.vel.addScaledVector(s.home.clone().sub(m.position), 20 * dt).multiplyScalar(Math.exp(-6.2 * dt)); s.ang.multiplyScalar(Math.exp(-3 * dt)); m.quaternion.slerp(q0, 1 - Math.exp(-5 * dt)); }
          m.position.addScaledVector(s.vel, dt); eu.set(s.ang.x * dt, s.ang.y * dt, s.ang.z * dt); m.quaternion.multiply(tmp.setFromEuler(eu));
          if (now > s.delay && m.position.distanceTo(s.home) < 0.01 && s.vel.length() < 0.05) { s.free = false; m.position.copy(s.home); m.quaternion.identity(); }
        } else {
          const tgt = hoverPt ? Math.pow(Math.max(0, 1 - s.home.distanceTo(hoverPt) / 1.8), 2) * 0.38 : 0;
          s.lift += (tgt - s.lift) * Math.min(1, dt * 10); m.position.copy(s.home).addScaledVector(s.nrm, Math.sin(t * 1.2 + s.ph) * 0.014 + s.lift);
        }
      }
      const cam = window.__app.cam; cdir.copy(cam.position).sub(root.position).normalize();
      HALVES.forEach((h, i) => {
        nw.copy(h.dir).applyQuaternion(group.quaternion); const f = nw.dot(cdir);
        pv.copy(nw).multiplyScalar(R + 1.0).add(group.position).project(cam);
        const d = dom[i], o = (f > -0.1 ? 1 : 0.15) * (hover < 0 || hover === i ? 1 : 0.6);
        d.style.left = (pv.x * 0.5 + 0.5) * innerWidth + 'px'; d.style.top = (-pv.y * 0.5 + 0.5) * innerHeight + 'px'; d.style.opacity = o; d.style.display = 'block';
      });
      coreLight.intensity = 30 + (hover >= 0 ? 10 : 0);
      sp.update(dt);
    },
    stat() { return ''; },
  };
}

const SK_HALVES = [
  { name: 'SKILLS', sub: '41 skills', col: 0xf4c95d, dir: new THREE.Vector3(0.9, 0.35, 0.25).normalize() },
  { name: 'CERTIFICATIONS', sub: '4 courses', col: 0x4de0c8, dir: new THREE.Vector3(-0.9, -0.35, -0.25).normalize() },
];
export const skillsGlobe = () => globeScene(SK_HALVES, 10, 'Drag to spin · click a half to break it open');
export const eduScene = () => globeScene(EDU_HALVES, 6, 'Drag to spin · click a half to break it open');
export const projectsGlobe = () => globeScene(PR_HALVES, 8, 'Drag to spin · click a half to break it open');

// ---------------------------------------------------------------- MASTERS: A NEURAL NETWORK LEARNING, LIVE
// A real 2-8-8-1 network trains in your browser on a fresh two-moons dataset. The glowing panel is its decision boundary,
// the lattice on the left is the network itself (edge colour = weight sign, node glow = activation for the probe point).
export function mastersScene() {
  const root = new THREE.Group(), sp = makeSparks(root, 260);
  const H = 8, GRID = 40, DOM = 4, CS = 512;
  let W1, b1, W2, b2, W3, b3, data = [], epoch = 0, loss = 1, acc = 0, hist = [], hold = 0, fc = 0;
  const rnd = () => (Math.random() + Math.random() + Math.random() - 1.5) * 0.9, sig = (s) => 1 / (1 + Math.exp(-s));
  const init = () => { W1 = Array.from({ length: H }, () => [rnd(), rnd()]); b1 = Array(H).fill(0); W2 = Array.from({ length: H }, () => Array.from({ length: H }, rnd)); b2 = Array(H).fill(0); W3 = Array.from({ length: H }, rnd); b3 = 0; epoch = 0; loss = 1; acc = 0; hist = []; hold = 0; };
  const makeData = () => {
    data = []; const rot = Math.random() * 0.8 - 0.4, cr = Math.cos(rot), sr = Math.sin(rot);
    for (let k = 0; k < 2; k++) for (let i = 0; i < 90; i++) {
      const a = Math.random() * Math.PI, n = () => (Math.random() + Math.random() - 1) * 0.22;
      let x = k ? 1 - Math.cos(a) : Math.cos(a), y = k ? 0.5 - Math.sin(a) : Math.sin(a);
      x = (x - 0.5 + n()) * 1.25; y = (y - 0.25 + n()) * 1.25; data.push([x * cr - y * sr, x * sr + y * cr, k]);
    }
  };
  const act = { h1: Array(H).fill(0), h2: Array(H).fill(0), p: 0.5 };
  const fwd = (x, y, o) => {
    const h1 = o.h1, h2 = o.h2;
    for (let i = 0; i < H; i++) h1[i] = Math.tanh(W1[i][0] * x + W1[i][1] * y + b1[i]);
    for (let i = 0; i < H; i++) { let s = b2[i]; for (let j = 0; j < H; j++) s += W2[i][j] * h1[j]; h2[i] = Math.tanh(s); }
    let s = b3; for (let i = 0; i < H; i++) s += W3[i] * h2[i]; return (o.p = sig(s));
  };
  const scratch = { h1: Array(H).fill(0), h2: Array(H).fill(0), p: 0 };
  const step = () => {
    const gW1 = Array.from({ length: H }, () => [0, 0]), gb1 = Array(H).fill(0), gW2 = Array.from({ length: H }, () => Array(H).fill(0)), gb2 = Array(H).fill(0), gW3 = Array(H).fill(0); let gb3 = 0, L = 0, ok = 0;
    for (const [x, y, t] of data) {
      const p = fwd(x, y, scratch), h1 = scratch.h1, h2 = scratch.h2;
      L -= t * Math.log(p + 1e-9) + (1 - t) * Math.log(1 - p + 1e-9); ok += (p > 0.5) === (t === 1) ? 1 : 0;
      const dz3 = p - t, dh1 = Array(H).fill(0); gb3 += dz3;
      for (let i = 0; i < H; i++) {
        gW3[i] += dz3 * h2[i]; const dz2 = dz3 * W3[i] * (1 - h2[i] * h2[i]); gb2[i] += dz2;
        for (let j = 0; j < H; j++) { gW2[i][j] += dz2 * h1[j]; dh1[j] += dz2 * W2[i][j]; }
      }
      for (let j = 0; j < H; j++) { const dz1 = dh1[j] * (1 - h1[j] * h1[j]); gb1[j] += dz1; gW1[j][0] += dz1 * x; gW1[j][1] += dz1 * y; }
    }
    const n = data.length, lr = 0.6 / n;
    for (let i = 0; i < H; i++) { W3[i] -= lr * gW3[i]; b2[i] -= lr * gb2[i]; b1[i] -= lr * gb1[i]; W1[i][0] -= lr * gW1[i][0]; W1[i][1] -= lr * gW1[i][1]; for (let j = 0; j < H; j++) W2[i][j] -= lr * gW2[i][j]; }
    b3 -= lr * gb3; loss = L / n; acc = ok / n; epoch++; hist.push(loss);
  };
  init(); makeData();

  // --- decision boundary hologram + loss strip (canvas textures)
  const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return { c, x: c.getContext('2d'), t }; };
  const bd = mk(CS, CS), ls = mk(CS, 128), gc = document.createElement('canvas'); gc.width = gc.height = GRID; const gx = gc.getContext('2d'), img = gx.createImageData(GRID, GRID);
  const PX = 3.2, PY = 0.6, PW = 5.2;
  const plane = new THREE.Mesh(new THREE.PlaneGeometry(PW, PW), new THREE.MeshBasicMaterial({ map: bd.t, transparent: true })); plane.position.set(PX, PY, 0); root.add(plane);
  const lossPlane = new THREE.Mesh(new THREE.PlaneGeometry(PW, PW / 4), new THREE.MeshBasicMaterial({ map: ls.t, transparent: true })); lossPlane.position.set(PX, PY - PW / 2 - 0.85, 0); root.add(lossPlane);
  const fr = PW / 2 + 0.08, frame = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints([[-fr, -fr], [fr, -fr], [fr, fr], [-fr, fr]].map(([a, b]) => new THREE.Vector3(PX + a, PY + b, 0.02))), new THREE.LineBasicMaterial({ color: MS_COL, transparent: true, opacity: 0.7 })); root.add(frame);
  const scan = new THREE.Mesh(new THREE.PlaneGeometry(PW, 0.05), new THREE.MeshBasicMaterial({ color: MS_COL, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false })); scan.position.z = 0.03; root.add(scan);
  const probe = { x: 0, y: 0 };
  const draw = () => {
    const d = img.data;
    for (let gy = 0; gy < GRID; gy++) for (let gxx = 0; gxx < GRID; gxx++) {
      const x = (gxx / (GRID - 1) - 0.5) * DOM, y = (0.5 - gy / (GRID - 1)) * DOM, p = fwd(x, y, scratch), conf = 0.14 + Math.abs(p - 0.5) * 0.9, o = (gy * GRID + gxx) * 4;
      d[o] = 8 + (255 * (1 - p) + 94 * p) * conf * 0.75; d[o + 1] = 12 + (122 * (1 - p) + 200 * p) * conf * 0.75; d[o + 2] = 22 + (184 * (1 - p) + 255 * p) * conf * 0.75; d[o + 3] = 255;
    }
    gx.putImageData(img, 0, 0);
    const c = bd.x; c.imageSmoothingEnabled = true; c.drawImage(gc, 0, 0, CS, CS);
    c.strokeStyle = 'rgba(255,255,255,.05)'; c.lineWidth = 1; for (let i = 1; i < 8; i++) { c.beginPath(); c.moveTo(i * CS / 8, 0); c.lineTo(i * CS / 8, CS); c.moveTo(0, i * CS / 8); c.lineTo(CS, i * CS / 8); c.stroke(); }
    for (const [x, y, t] of data) { c.beginPath(); c.arc((x / DOM + 0.5) * CS, (0.5 - y / DOM) * CS, 5, 0, 6.283); c.fillStyle = t ? '#5ec8ff' : '#ff7ab8'; c.fill(); c.strokeStyle = 'rgba(255,255,255,.85)'; c.lineWidth = 1.5; c.stroke(); }
    const px = (probe.x / DOM + 0.5) * CS, py = (0.5 - probe.y / DOM) * CS; c.strokeStyle = '#fff'; c.lineWidth = 2; c.beginPath(); c.arc(px, py, 11, 0, 6.283); c.moveTo(px - 17, py); c.lineTo(px - 6, py); c.moveTo(px + 6, py); c.lineTo(px + 17, py); c.stroke();
    bd.t.needsUpdate = true;
    const l = ls.x; l.fillStyle = 'rgba(8,12,20,.9)'; l.fillRect(0, 0, CS, 128); l.strokeStyle = '#2a3a52'; l.lineWidth = 2; l.strokeRect(1, 1, CS - 2, 126);
    l.fillStyle = '#8b93a7'; l.font = '500 20px "JetBrains Mono", monospace'; l.fillText('LOSS', 14, 26);
    if (hist.length > 1) { l.strokeStyle = '#5ec8ff'; l.lineWidth = 3; l.beginPath(); hist.forEach((v, i) => { const x = 14 + (i / Math.max(300, hist.length - 1)) * (CS - 28), y = 104 - Math.min(1, v / 0.8) * 70; i ? l.lineTo(x, y) : l.moveTo(x, y); }); l.stroke(); }
    ls.t.needsUpdate = true;
  };

  // --- the network lattice
  const LAY = [2, H, H, 1], XS = [-6.6, -4.9, -3.2, -1.5], Y0 = 0.6, nodes = [];
  LAY.forEach((n, li) => { for (let k = 0; k < n; k++) { const m = new THREE.Mesh(new THREE.SphereGeometry(0.17, 14, 14), new THREE.MeshBasicMaterial({ color: 0x1c2a40 })); m.position.set(XS[li], Y0 + (li === 0 ? (k - 0.5) * 1.5 : li === 3 ? 0 : (k - (H - 1) / 2) * 0.62), 0); root.add(m); nodes.push({ m, li, k }); } });
  const lay = (li) => nodes.filter((n) => n.li === li);
  const links = []; for (let li = 0; li < 3; li++) for (const a of lay(li)) for (const b of lay(li + 1)) links.push({ a, b, li });
  const lp = new Float32Array(links.length * 6), lc = new Float32Array(links.length * 6);
  links.forEach((e, i) => lp.set([e.a.m.position.x, e.a.m.position.y, 0, e.b.m.position.x, e.b.m.position.y, 0], i * 6));
  const lg = new THREE.BufferGeometry(); lg.setAttribute('position', new THREE.BufferAttribute(lp, 3)); const lca = new THREE.BufferAttribute(lc, 3); lg.setAttribute('color', lca);
  root.add(new THREE.LineSegments(lg, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false })));
  const T1 = (t) => { const L = (s, x) => { const q = label(s, { size: 0.5, color: '#9aa3b8', font: MONO }); q.position.set(x[0], x[1], 0); root.add(q); }; L('THE NETWORK', [-4.05, 3.15]); L('DECISION BOUNDARY', [PX, PY + PW / 2 + 0.5]); void t; };
  T1();
  const COOL = new THREE.Color(0x5ec8ff), WARM = new THREE.Color(0xff7ab8), DIM = new THREE.Color(0x1c2a40), tc = new THREE.Color();
  const ray = new THREE.Raycaster(), v2 = new THREE.Vector2(); let hasProbe = false;

  return {
    root, floor: -4.9, pool: 1.5, cam: { pos: new THREE.Vector3(0, 0.4, 13.5), look: new THREE.Vector3(-0.2, 0, 0) },
    hintFor: () => 'Click: train a fresh model on new data · move over the panel to probe it',
    click() { init(); makeData(); ach('cleaner'); sp.burst(new THREE.Vector3(PX, PY, 0), MS_COL, 140, 6); },
    update(t, dt, p) {
      if (epoch < 600) { for (let s = 0; s < 2; s++) step(); } else { hold += dt; if (hold > 4) { init(); makeData(); } }
      const cam = window.__app && window.__app.cam; hasProbe = false;
      if (cam) { root.updateMatrixWorld(true); v2.set(p.x, p.y); ray.setFromCamera(v2, cam); const h = ray.intersectObject(plane, false)[0]; if (h) { hasProbe = true; probe.x = (h.uv.x - 0.5) * DOM; probe.y = (h.uv.y - 0.5) * DOM; } }
      if (!hasProbe) { probe.x = 1.3 * Math.cos(t * 0.7); probe.y = 1.0 * Math.sin(t * 1.1); }
      const pr = fwd(probe.x, probe.y, act);
      if (fc++ % 2 === 0) draw();
      const col = (v, c) => tc.copy(DIM).lerp(c, Math.min(1, Math.abs(v)));
      const inp = [probe.x / 2, probe.y / 2];
      nodes.forEach((n) => { const v = n.li === 0 ? inp[n.k] : n.li === 1 ? act.h1[n.k] : n.li === 2 ? act.h2[n.k] : pr * 2 - 1; n.m.material.color.copy(col(v, v >= 0 ? COOL : WARM)); n.m.scale.setScalar(1 + Math.abs(v) * 0.7); });
      links.forEach((e, i) => {
        const src = e.li === 0 ? inp[e.a.k] : e.li === 1 ? act.h1[e.a.k] : act.h2[e.a.k], w = e.li === 0 ? W1[e.b.k][e.a.k] : e.li === 1 ? W2[e.b.k][e.a.k] : W3[e.a.k];
        const a = Math.min(1, Math.abs(w * src) * 1.4) * 0.85 + 0.04, c = w >= 0 ? COOL : WARM;
        lc.set([c.r * a, c.g * a, c.b * a, c.r * a, c.g * a, c.b * a], i * 6);
      });
      lca.needsUpdate = true;
      scan.position.set(PX, PY + (((t * 0.35) % 1) - 0.5) * PW, 0.03);
      root.rotation.y = p.x * 0.05; root.rotation.x = -p.y * 0.03;
      sp.update(dt);
    },
    stat() { return 'epoch ' + epoch + ' · loss ' + loss.toFixed(3) + ' · accuracy ' + (acc * 100).toFixed(0) + '% · toy model, trained live here'; },
  };
}

// ---------------------------------------------------------------- BACHELORS: GRAPH ALGORITHMS ON A LIVING NETWORK
// BFS, DFS and Dijkstra run for real on a 3D graph. Click: next algorithm on a new random route.
export function bachelorsScene() {
  const root = new THREE.Group(), G = new THREE.Group(); root.add(G);
  const sp = makeSparks(root, 200), N = 38, RAD = 3.2, K = 4;
  const pts = Array.from({ length: N }, (_, i) => { const y = 1 - ((i + 0.5) * 2) / N, r = Math.sqrt(1 - y * y), th = i * 2.399963, s = RAD * (0.9 + Math.random() * 0.2); return new THREE.Vector3(Math.cos(th) * r * s, y * s, Math.sin(th) * r * s); });
  const adj = Array.from({ length: N }, () => []), edges = [], seen = new Set();
  pts.forEach((p, i) => {
    pts.map((q, j) => [j, p.distanceTo(q)]).filter(([j]) => j !== i).sort((a, b) => a[1] - b[1]).slice(0, K).forEach(([j, w]) => {
      const key = Math.min(i, j) + '-' + Math.max(i, j); if (seen.has(key)) return; seen.add(key);
      const e = edges.length; edges.push({ a: i, b: j, w }); adj[i].push([j, e]); adj[j].push([i, e]);
    });
  });
  const ep = new Float32Array(edges.length * 6), ec = new Float32Array(edges.length * 6);
  edges.forEach((e, i) => ep.set([pts[e.a].x, pts[e.a].y, pts[e.a].z, pts[e.b].x, pts[e.b].y, pts[e.b].z], i * 6));
  const eg = new THREE.BufferGeometry(); eg.setAttribute('position', new THREE.BufferAttribute(ep, 3)); const eca = new THREE.BufferAttribute(ec, 3); eg.setAttribute('color', eca);
  G.add(new THREE.LineSegments(eg, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 1, blending: THREE.AdditiveBlending, depthWrite: false })));
  const inst = new THREE.InstancedMesh(new THREE.SphereGeometry(0.16, 14, 14), new THREE.MeshBasicMaterial({ color: 0xffffff }), N); inst.frustumCulled = false; G.add(inst);
  const shell = new THREE.LineSegments(new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(4.7, 1)), new THREE.LineBasicMaterial({ color: BS_COL, transparent: true, opacity: 0.07 })); G.add(shell);
  const dust = new Float32Array(240 * 3); for (let i = 0; i < 240; i++) { const v = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize().multiplyScalar(5.6 + Math.random() * 3.5); dust.set([v.x, v.y, v.z], i * 3); }
  const dg = new THREE.BufferGeometry(); dg.setAttribute('position', new THREE.BufferAttribute(dust, 3)); G.add(new THREE.Points(dg, new THREE.PointsMaterial({ color: 0xff9ac8, size: 0.05, transparent: true, opacity: 0.5, depthWrite: false })));
  const packet = new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 12), new THREE.MeshBasicMaterial({ color: 0xffffff })); packet.visible = false; G.add(packet);

  // state
  const ns = new Uint8Array(N), es = new Uint8Array(edges.length); // 0 idle, 1 frontier/tree, 2 visited, 3 path
  let src = 0, dst = 1, gen = null, done = false, doneT = 0, acc = 0, visited = 0, cost = 0, hops = 0, path = [], algoI = 0, algoLbl = null, found = true;
  const bfsHops = (s) => { const d = Array(N).fill(-1); d[s] = 0; const q = [s]; while (q.length) { const u = q.shift(); for (const [v] of adj[u]) if (d[v] < 0) { d[v] = d[u] + 1; q.push(v); } } return d; };
  function* bfs() { const par = Array(N).fill(-1), sn = new Set([src]), q = [src]; while (q.length) { const u = q.shift(); ns[u] = 2; visited++; yield; if (u === dst) break; for (const [v, e] of adj[u]) if (!sn.has(v)) { sn.add(v); par[v] = u; es[e] = 1; ns[v] = 1; q.push(v); } } return par; }
  function* dfs() { const par = Array(N).fill(-1), sn = new Set(), st = [[src, -1, -1]]; while (st.length) { const [u, pu, pe] = st.pop(); if (sn.has(u)) continue; sn.add(u); par[u] = pu; if (pe >= 0) es[pe] = 1; ns[u] = 2; visited++; yield; if (u === dst) break; for (const [v, e] of adj[u]) if (!sn.has(v)) { ns[v] = ns[v] || 1; st.push([v, u, e]); } } return par; }
  function* dijkstra() { const dist = Array(N).fill(Infinity), par = Array(N).fill(-1), pe = Array(N).fill(-1), dn = new Set(); dist[src] = 0; while (true) { let u = -1; for (let i = 0; i < N; i++) if (!dn.has(i) && dist[i] < Infinity && (u < 0 || dist[i] < dist[u])) u = i; if (u < 0) break; dn.add(u); ns[u] = 2; visited++; if (pe[u] >= 0) es[pe[u]] = 1; yield; if (u === dst) break; for (const [v, e] of adj[u]) { const nd = dist[u] + edges[e].w; if (nd < dist[v]) { dist[v] = nd; par[v] = u; pe[v] = e; if (!dn.has(v)) ns[v] = 1; } } } return par; }
  const ALGOS = [{ n: 'BREADTH-FIRST SEARCH', run: bfs }, { n: 'DEPTH-FIRST SEARCH', run: dfs }, { n: 'DIJKSTRA SHORTEST PATH', run: dijkstra }];

  const setLbl = () => {
    if (algoLbl) { root.remove(algoLbl); algoLbl.material.map.dispose(); }
    algoLbl = label(ALGOS[algoI].n, { size: 0.5, color: '#ff7ab8', font: MONO }); algoLbl.position.set(0, -4.7, 0); root.add(algoLbl);
  };
  const start = () => {
    ns.fill(0); es.fill(0); visited = 0; cost = 0; hops = 0; path = []; done = false; doneT = 0; acc = 0; packet.visible = false; found = true;
    src = (Math.random() * N) | 0; const d = bfsHops(src), mx = Math.max(...d), c = d.map((v, i) => (v >= Math.max(3, mx - 1) ? i : -1)).filter((i) => i >= 0); dst = c[(Math.random() * c.length) | 0];
    gen = ALGOS[algoI].run(); setLbl();
  };
  const finish = (par) => {
    done = true; let v = dst; const pe = []; path = [dst];
    while (v !== src && par[v] >= 0) { const u = par[v]; path.push(u); const e = adj[u].find(([x]) => x === v)[1]; pe.push(e); cost += edges[e].w; v = u; }
    found = v === src; if (found) { path.reverse(); hops = path.length - 1; pe.forEach((e) => (es[e] = 3)); path.forEach((n) => (ns[n] = 3)); }
  };
  start();

  const m4 = new THREE.Matrix4(), sc = new THREE.Vector3(), q0 = new THREE.Quaternion(), col = new THREE.Color(), IDLE = new THREE.Color().setHSL(0.86, 0.35, 0.34);
  const NC = [IDLE, new THREE.Color(0xffffff), new THREE.Color(BS_COL), new THREE.Color(0x7bd88f)];
  const EC = [[0.2, 0.12, 0.26], [0.7, 0.7, 0.8], [1, 0.48, 0.72], [0.4, 1, 0.55]];
  return {
    root, floor: -5.2, pool: 1.5, cam: { pos: new THREE.Vector3(0, 0.6, 13), look: new THREE.Vector3(0, -0.2, 0) },
    hintFor: () => 'Click: next algorithm on a new route',
    click() { algoI = (algoI + 1) % ALGOS.length; start(); ach('cartographer'); sp.burst(new THREE.Vector3(0, 0, 0), BS_COL, 120, 6); },
    update(t, dt, p) {
      if (!done) { acc += dt; while (acc > 0.14 && !done) { acc -= 0.14; const r = gen.next(); if (r.done) finish(r.value); } }
      else { doneT += dt; if (doneT > 6) { start(); } }
      for (let i = 0; i < N; i++) {
        const isEnd = i === src || i === dst, s = isEnd ? 1.9 : ns[i] === 3 ? 1.5 : ns[i] === 2 ? 1.2 : 1;
        sc.set(s, s, s); m4.compose(pts[i], q0, sc); inst.setMatrixAt(i, m4);
        col.copy(i === src ? NC[1].clone().setHex(0xffd166) : i === dst ? NC[1].clone().setHex(0x5ec8ff) : NC[ns[i]]); inst.setColorAt(i, col);
      }
      inst.instanceMatrix.needsUpdate = true; inst.instanceColor.needsUpdate = true;
      for (let i = 0; i < edges.length; i++) { const c = EC[es[i]]; ec.set([c[0], c[1], c[2], c[0], c[1], c[2]], i * 6); }
      eca.needsUpdate = true;
      if (done && found && path.length > 1) { packet.visible = true; const u = (doneT * 1.6) % (path.length - 1), i = Math.floor(u); packet.position.lerpVectors(pts[path[i]], pts[path[i + 1]], u - i); }
      G.rotation.y = t * 0.14 + p.x * 0.5; G.rotation.x = 0.25 - p.y * 0.25; shell.rotation.y = -t * 0.05;
      sp.update(dt);
    },
    stat() { const n = ALGOS[algoI].n.toLowerCase(); return done ? (found ? n + ' · ' + visited + ' nodes visited · route of ' + hops + ' hops, length ' + cost.toFixed(1) : n + ' · no route') : n + ' · ' + visited + ' nodes visited…'; },
  };
}
