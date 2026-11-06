import * as THREE from 'three';
import { showOvl } from './ovl.js';

// Built on AWS: a deploy control room. One 3D stage; a tracking camera follows a single commit through four pads
// (GitHub, AWS Amplify, the Amplify CDN, you) while a kinetic stage title, a typed log and a progress rail narrate it.
// Every statement is true for this project: Amplify Hosting in us-east-1, deploys on push to main, no build step, HTTPS.
const ST = [
  { k: 'PUSH', t: '01 · GitHub', c: '#f4efe7', x: 0xf4efe7, sub: 'The code lives in a public GitHub repo. A push to main is the only thing that starts a deploy.', log: [['cmd', '$ git push origin main'], ['dim', 'Enumerating objects… done'], ['ok', '✓ main updated on github.com/dheerukarra/dheeraj-aws-portfolio']] },
  { k: 'DEPLOY', t: '02 · AWS Amplify', c: '#ff9900', x: 0xff9900, sub: 'Amplify Hosting in us-east-1 sees the new commit on main and redeploys. There is no build step.', log: [['dim', 'amplify: new commit detected on main'], ['cmd', 'build: static site, nothing to build'], ['ok', '✓ publishing public/ to hosting']] },
  { k: 'SERVE', t: '03 · Amplify CDN', c: '#5ec8ff', x: 0x5ec8ff, sub: 'The files are served over HTTPS from the Amplify CDN, close to whoever opens the page.', log: [['dim', 'cdn: new version of the site'], ['cmd', 'https: enabled'], ['ok', '✓ serving plain static files']] },
  { k: 'LIVE', t: '04 · You', c: '#7bd88f', x: 0x7bd88f, sub: 'About a minute after the push, this page is what you are looking at.', log: [['dim', 'browser: GET /'], ['ok', '✓ dheeraj-aws-portfolio is live']] },
];
const NX = [-9, -3, 3, 9], KF = [[0, 0], [3.2, 0], [4.9, 1], [8.4, 1], [10.1, 2], [13.6, 2], [15.3, 3], [19.4, 3]];
const sm = (x) => x * x * (3 - 2 * x), ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const std = (c, o) => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: 0.42, metalness: 0.3, flatShading: true }, o || {}));
const hexPts = (r, y) => Array.from({ length: 7 }, (_, k) => new THREE.Vector3(Math.sin((k / 6) * 6.2832) * r, y, Math.cos((k / 6) * 6.2832) * r));
function tile(text, col, w, h) {
  const c = document.createElement('canvas'); c.width = 360; c.height = Math.round((360 * h) / w); const x = c.getContext('2d');
  x.fillStyle = 'rgba(8,11,18,.92)'; x.strokeStyle = col; x.lineWidth = 3; x.beginPath(); if (x.roundRect) x.roundRect(3, 3, 354, c.height - 6, 20); else x.rect(3, 3, 354, c.height - 6); x.fill(); x.stroke();
  x.fillStyle = col; x.font = '500 30px "JetBrains Mono", monospace'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(text, 180, c.height / 2 + 2);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  return new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: t, transparent: true }));
}

let D = null, raf = 0;

function build(el) {
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const room = el.querySelector('#dp-room'), cvs = el.querySelector('#dp-gl');
  const lines = el.querySelector('#dp-lines'), big = el.querySelector('#dp-big'), kt = el.querySelector('#dp-kt'), sub = el.querySelector('#dp-sub'), kick = el.querySelector('#dp-kick'), stg = el.querySelector('#dp-stg'), go = el.querySelector('#dp-go');
  const R = new THREE.WebGLRenderer({ canvas: cvs, antialias: true }); R.setPixelRatio(Math.min(devicePixelRatio, 2)); R.setClearColor(0x04060a);
  const scene = new THREE.Scene(); scene.fog = new THREE.FogExp2(0x04060a, 0.028);
  const cam = new THREE.PerspectiveCamera(40, 1, 0.1, 120);
  scene.add(new THREE.AmbientLight(0x8c94b8, 1.7)); const key = new THREE.DirectionalLight(0xfff0e0, 2.6); key.position.set(6, 12, 9); scene.add(key);
  const lights = ST.map((s, i) => { const l = new THREE.PointLight(s.x, 0, 16, 1.2); l.position.set(NX[i], 3, 2); scene.add(l); return l; });
  const grid = new THREE.GridHelper(80, 80, 0x1a2233, 0x0f1522); grid.position.y = -1.55; scene.add(grid);
  const pads = ST.map((s, i) => {
    const g = new THREE.Group(); g.position.set(NX[i], 0, 0); scene.add(g);
    const pad = new THREE.Mesh(new THREE.CylinderGeometry(2.1, 1.9, 0.35, 6), std(0x121826)); pad.position.y = -0.2; g.add(pad);
    const trim = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(hexPts(2.1, 0)), new THREE.LineBasicMaterial({ color: s.x })); g.add(trim);
    const cone = new THREE.Mesh(new THREE.ConeGeometry(1.9, 2.2, 6, 1), std(0x0b0f18)); cone.rotation.x = Math.PI; cone.position.y = -1.45; g.add(cone);
    const t = tile(s.t.split(' · ')[1], s.c, 2.6, 0.7); t.position.set(0, -2.7, 0.8); g.add(t);
    return { g, trim, pad, pulse: 0 };
  });
  { const g = pads[0].g, nodes = [[-0.9, 0.3], [-0.3, 0.9], [0.3, 0.3], [0.9, 1.1], [0.5, 1.7]];
    pads[0].commits = nodes.map(([x, y]) => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.17, 14, 14), new THREE.MeshStandardMaterial({ color: 0xf4efe7, emissive: 0xf4efe7, emissiveIntensity: 0.5 })); m.position.set(x, y, 0); g.add(m); return m; });
    [[0, 1], [1, 2], [2, 3], [3, 4]].forEach(([a, b]) => g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([pads[0].commits[a].position, pads[0].commits[b].position]), new THREE.LineBasicMaterial({ color: 0x8a8578 }))));
    g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-0.9, 0.3, 0), new THREE.Vector3(-0.2, -0.1, 0), new THREE.Vector3(0.3, 0.3, 0)]), new THREE.LineBasicMaterial({ color: 0x8a8578 }))); }
  { const g = pads[1].g; pads[1].slabs = [0, 1, 2, 3].map((k) => { const s = new THREE.Mesh(new THREE.CylinderGeometry(1.25 - k * 0.14, 1.25 - k * 0.14, 0.22, 6), std(0xff9900, { emissive: 0xff7a00, emissiveIntensity: 0.5 })); s.position.y = 0.2 + k * 0.38; g.add(s); return s; });
    const ring = new THREE.Group(); for (let k = 0; k < 36; k++) { const tk = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, k % 3 ? 0.14 : 0.28), new THREE.MeshBasicMaterial({ color: 0xffb84d })); const a = (k / 36) * 6.2832; tk.position.set(Math.cos(a) * 1.75, 0.9, Math.sin(a) * 1.75); tk.rotation.y = -a; ring.add(tk); } g.add(ring); pads[1].ring = ring; }
  { const g = pads[2].g, gl = new THREE.Group(); gl.position.y = 1.45; g.add(gl);
    gl.add(new THREE.Mesh(new THREE.SphereGeometry(1.12, 28, 28), new THREE.MeshStandardMaterial({ color: 0x08101c, roughness: 0.5, metalness: 0.4 })));
    gl.add(new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(1.14, 2)), new THREE.LineBasicMaterial({ color: 0x5ec8ff, transparent: true, opacity: 0.75 })));
    pads[2].dots = Array.from({ length: 26 }, (_, k) => { const ph = Math.acos(1 - 2 * ((k + 0.5) / 26)), th = Math.PI * (1 + Math.sqrt(5)) * k; const d = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffffff })); d.position.set(Math.cos(th) * Math.sin(ph), Math.cos(ph), Math.sin(th) * Math.sin(ph)).multiplyScalar(1.17); d.userData.ph = k * 0.6; gl.add(d); return d; }); pads[2].globe = gl;
    const rp = new THREE.Mesh(new THREE.TorusGeometry(1, 0.012, 6, 80), new THREE.MeshBasicMaterial({ color: 0x5ec8ff, transparent: true, opacity: 0 })); rp.rotation.x = Math.PI / 2; rp.position.y = 0.1; g.add(rp); pads[2].rip = rp; }
  { const g = pads[3].g, sc = document.createElement('canvas'); sc.width = 360; sc.height = 225; const x = sc.getContext('2d'); x.fillStyle = '#05070b'; x.fillRect(0, 0, 360, 225);
    const rg = x.createRadialGradient(180, 100, 0, 180, 100, 80); rg.addColorStop(0, '#ff6a1f'); rg.addColorStop(0.3, 'rgba(255,106,31,.35)'); rg.addColorStop(1, 'rgba(255,106,31,0)'); x.fillStyle = rg; x.fillRect(0, 0, 360, 225);
    x.strokeStyle = '#5ec8ff'; x.beginPath(); x.arc(180, 100, 52, 0, 6.283); x.stroke(); x.fillStyle = '#f4efe7'; x.font = '500 18px "JetBrains Mono", monospace'; x.textAlign = 'center'; x.fillText('Dheeraj Reddy Karra', 180, 198);
    const base = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.1, 1.55), std(0x2a2f3c)); base.position.y = 0.05; g.add(base);
    const lid = new THREE.Group(); lid.position.set(0, 0.1, -0.72); lid.rotation.x = -0.28; g.add(lid);
    const body = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.5, 0.07), std(0x1c2029)); body.position.y = 0.75; lid.add(body);
    const tx = new THREE.CanvasTexture(sc); tx.colorSpace = THREE.SRGBColorSpace; const scr = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 1.34), new THREE.MeshBasicMaterial({ map: tx })); scr.position.set(0, 0.75, 0.045); lid.add(scr); pads[3].scr = scr; }
  const pt = (i) => [new THREE.Vector3(NX[i] + 2.1, 0.8, 0), new THREE.Vector3((NX[i] + NX[i + 1]) / 2, 1.8, 0.5), new THREE.Vector3(NX[i + 1] - 2.1, 0.8, 0)];
  const curves = [0, 1, 2].map((i) => new THREE.CatmullRomCurve3(pt(i)));
  curves.forEach((c) => scene.add(new THREE.Mesh(new THREE.TubeGeometry(c, 40, 0.06, 8), new THREE.MeshStandardMaterial({ color: 0x2a3550, emissive: 0x1a2540, emissiveIntensity: 0.6 }))));
  const pk = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 0.4), new THREE.MeshBasicMaterial({ color: 0xffffff })); scene.add(pk);
  pk.add(new THREE.Mesh(new THREE.SphereGeometry(0.55, 12, 12), new THREE.MeshBasicMaterial({ color: 0xff9900, transparent: true, opacity: 0.3 })));
  const trail = Array.from({ length: 14 }, () => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.09, 6, 6), new THREE.MeshBasicMaterial({ color: 0xff9900, transparent: true })); scene.add(m); return m; });
  { const n = 300, p = new Float32Array(n * 3); for (let i = 0; i < n; i++) { p[i * 3] = (Math.random() - 0.5) * 60; p[i * 3 + 1] = Math.random() * 14 - 1; p[i * 3 + 2] = -4 - Math.random() * 20; } const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3)); scene.add(new THREE.Points(g, new THREE.PointsMaterial({ size: 0.07, color: 0x5ec8ff, transparent: true, opacity: 0.5 }))); }
  const SH = NX.map((x, i) => ({ p: new THREE.Vector3(x + (i % 2 ? 3.6 : -3.6), 2.6, 7.4), l: new THREE.Vector3(x, 0.9, 0) }));

  let time = -1, playing = false, stageNow = -1, lastLines = -1, focus = -1;
  stg.innerHTML = ''; ST.forEach((s, i) => { const b = document.createElement('button'); b.type = 'button'; b.style.setProperty('--sc', s.c); b.innerHTML = '<i></i><span>' + s.t + '</span>'; b.addEventListener('click', () => jump(i)); stg.appendChild(b); });
  const stageAt = (t) => { for (let i = 1; i < KF.length; i++) if (t <= KF[i][0]) { const a = KF[i - 1], b = KF[i]; return a[1] + (b[1] - a[1]) * ease((t - a[0]) / (b[0] - a[0])); } return 3; };
  const setTitle = (i) => { room.style.setProperty('--c', ST[i].c); kt.textContent = ST[i].t; kick.style.setProperty('--c', ST[i].c); big.innerHTML = ST[i].k.split('').map((ch, k) => '<span style="animation-delay:' + k * 0.05 + 's">' + ch + '</span>').join(''); big.setAttribute('aria-label', ST[i].k); sub.textContent = ST[i].sub; [...stg.children].forEach((b, k) => b.setAttribute('aria-current', String(k === i))); lines.innerHTML = ''; lastLines = -1; };
  const typeLog = (i, tt) => { const L = ST[i].log, n = Math.min(L.length, Math.floor(tt / 0.7) + 1); if (n === lastLines) return; lastLines = n; lines.innerHTML = L.slice(0, n).map((a) => '<div class="' + a[0] + '">' + a[1] + '</div>').join('') + '<div><span class="dp-caret"></span></div>'; };
  const play = () => { time = 0; playing = true; focus = -1; go.textContent = 'Replay'; stageNow = -1; lastLines = -1; };
  function jump(i) { playing = false; time = -1; stageNow = -1; focus = i; setTitle(i); lastLines = -1; typeLog(i, 9); go.textContent = 'Push a commit'; [...stg.children].forEach((b, k) => b.style.setProperty('--p', k <= i ? '100%' : '0%')); pads[i].pulse = 1; }
  go.onclick = play;
  const size = () => { const w = room.clientWidth, h = room.clientHeight; if (!w || !h) return; R.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); };
  addEventListener('resize', size);
  const idle = () => { time = -1; playing = false; focus = -1; stageNow = -1; go.textContent = 'Push a commit'; setTitle(0); kt.textContent = 'Press play'; sub.textContent = 'One commit, four stops. Press the button and follow it.'; lines.innerHTML = '<div class="dim">waiting for a push…</div><div><span class="dp-caret"></span></div>'; [...stg.children].forEach((b) => { b.style.setProperty('--p', '0%'); b.setAttribute('aria-current', 'false'); }); };
  idle();
  const clock = new THREE.Clock(), tmpP = new THREE.Vector3(), tmpL = new THREE.Vector3();
  const frame = () => {
    raf = requestAnimationFrame(frame); const dt = Math.min(clock.getDelta(), 0.05), t = clock.elapsedTime;
    let u; if (playing) { time += dt; u = stageAt(time); if (time > KF[KF.length - 1][0] + 1.5) playing = false; } else u = focus >= 0 ? focus : 0;
    const i0 = Math.min(2, Math.floor(u)), f = sm(u - i0), a = SH[i0], b = SH[i0 + 1];
    if (!playing && focus < 0) { tmpP.set(Math.sin(t * 0.15) * 14, 7.5, 17); tmpL.set(0, 0.4, 0); } else { tmpP.lerpVectors(a.p, b.p, f); tmpL.lerpVectors(a.l, b.l, f); }
    cam.position.lerp(tmpP, Math.min(1, dt * (playing ? 6 : 3))); cam.lookAt(tmpL);
    const sNow = playing ? Math.round(u) : focus >= 0 ? focus : -1;
    if (playing && sNow !== stageNow) { stageNow = sNow; setTitle(sNow); pads[sNow].pulse = 1; }
    if (playing) { const first = KF.filter((k) => Math.round(k[1]) === sNow).map((k) => k[0])[0], stT = Math.max(0, time - first); typeLog(sNow, stT); [...stg.children].forEach((bt, k) => bt.style.setProperty('--p', k < sNow ? '100%' : k === sNow ? Math.min(100, (stT / 3.4) * 100) + '%' : '0%')); }
    const pu = playing ? Math.min(2.999, Math.max(0, u)) : -1;
    if (pu >= 0) { const i = Math.floor(pu); pk.visible = true; pk.position.copy(curves[i].getPoint(pu - i)); pk.rotation.set(t * 3, t * 2, 0); trail.forEach((m, k) => { const q = Math.max(0, pu - (k + 1) * 0.025), ii = Math.min(2, Math.floor(q)); m.position.copy(curves[ii].getPoint(Math.min(1, q - ii))); m.material.opacity = 1 - k / trail.length; m.visible = true; }); } else { pk.visible = false; trail.forEach((m) => { m.visible = false; }); }
    pads.forEach((P, i) => { P.pulse *= Math.exp(-1.6 * dt); lights[i].intensity = 14 + P.pulse * 260 + (focus === i && !playing ? 80 : 0); P.g.position.y = RM ? 0 : Math.sin(t * 0.8 + i) * 0.08 + P.pulse * 0.15; P.pad.material.emissive.setHex(ST[i].x); P.pad.material.emissiveIntensity = P.pulse * 0.4; });
    pads[0].commits.forEach((m, k) => { m.material.emissiveIntensity = 0.4 + Math.sin(t * 2 - k) * 0.25 + pads[0].pulse * 1.2; });
    pads[1].slabs.forEach((s, k) => { s.rotation.y = t * (0.4 + k * 0.15) * (k % 2 ? -1 : 1); s.material.emissiveIntensity = 0.4 + pads[1].pulse * 1.2; }); pads[1].ring.rotation.y = t * 0.6;
    pads[2].globe.rotation.y = t * 0.35; pads[2].dots.forEach((d) => d.scale.setScalar(0.7 + (Math.sin(t * 2 + d.userData.ph) * 0.5 + 0.5) * (0.9 + pads[2].pulse * 2))); { const r = pads[2].rip, k = (t * 0.7) % 1; r.scale.setScalar(0.6 + k * 2.6); r.material.opacity = (pads[2].pulse > 0.1 ? 1 : 0.15) * (1 - k) * 0.8; }
    pads[3].scr.material.color.setScalar(1 + pads[3].pulse * 0.5);
    R.render(scene, cam);
  };
  return { size, idle, play, start() { cancelAnimationFrame(raf); size(); frame(); }, RM };
}

export function openDeploy() {
  const el = document.getElementById('deploy'); if (!el) return;
  showOvl(el, () => { cancelAnimationFrame(raf); raf = 0; });
  if (history.replaceState) history.replaceState(null, '', '#aws');
  requestAnimationFrame(() => { if (!D) D = build(el); D.idle(); D.start(); if (!D.RM) setTimeout(() => { if (raf) D.play(); }, 700); });
}
