import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { CL, SUB, rs, fontsReady } from './common.js';
import { aiScene } from './scenes1.js';
import { eduScene, projectsGlobe, skillsGlobe, mastersScene, bachelorsScene } from './scenes5.js';
import { qaScene } from './scenes2.js';
import { kalshiScene, shortsScene } from './scenes6.js';
import { hobbyScene } from './scenes10.js';
import { skillsAtomScene } from './scenes7.js';
import { vaultScene } from './scenes9.js';
import { initUI } from './ui.js';
import { initCompass } from './compass.js';
import { splitName, scramble, typeLines, kinetic, cursor, buildTape } from './fxtext.js';

await Promise.race([fontsReady(), new Promise((r) => setTimeout(r, 2500))]);
const $ = (id) => document.getElementById(id);
const q = new URLSearchParams(location.search);
const cv = $('gl');
const R = new THREE.WebGLRenderer({ canvas: cv, antialias: true, powerPreference: 'high-performance' });
R.setPixelRatio(Math.min(devicePixelRatio, 1.75));
R.setSize(innerWidth, innerHeight);
R.toneMapping = THREE.ACESFilmicToneMapping;
R.toneMappingExposure = 1.05;
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x030407);
scene.fog = new THREE.FogExp2(0x04060a, 0.02);
const cam = new THREE.PerspectiveCamera(40, innerWidth / innerHeight, 0.1, 140);
const HOME = new THREE.Vector3(5.4, 1.8, 8.6);
cam.position.copy(HOME);
const ctl = new OrbitControls(cam, cv);
Object.assign(ctl, { enableDamping: true, dampingFactor: 0.06, minDistance: 5, maxDistance: 16, maxPolarAngle: Math.PI * 0.56, autoRotate: true, autoRotateSpeed: 0.4, enablePan: false });
ctl.target.set(0, 0.2, 0);

// ---------- atmosphere: tinted horizon sky + soft bokeh depth (no props) ----------
const skyMat = new THREE.ShaderMaterial({
  side: THREE.BackSide, depthWrite: false, fog: false,
  uniforms: { uA: { value: new THREE.Color(0xff6a1f) }, uK: { value: 0.05 } },
  vertexShader: 'varying vec3 vP;void main(){vP=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader: 'varying vec3 vP;uniform vec3 uA;uniform float uK;void main(){float h=vP.y*.5+.5;vec3 base=mix(vec3(.010,.013,.022),vec3(.022,.028,.048),h);float hz=pow(1.-abs(vP.y+.02),7.)*.55;float sp=pow(max(0.,dot(normalize(vP),normalize(vec3(.35,.12,-1.)))),10.)*.5;float sp2=pow(max(0.,dot(normalize(vP),normalize(vec3(-.6,.3,-.7)))),18.)*.25;vec3 c=base+uA*(hz*.18*uK*3.+sp*.16*uK*3.)+vec3(.4,.45,.8)*sp2*.12;gl_FragColor=vec4(c,1.);}',
});
scene.add(new THREE.Mesh(new THREE.SphereGeometry(80, 40, 20), skyMat));
const gridMat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, fog: false, uniforms: { uC: { value: new THREE.Color(0xff6a1f) } },
  vertexShader: 'varying vec3 vW;void main(){vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}',
  fragmentShader: 'varying vec3 vW;uniform vec3 uC;float gl(float x){float d=abs(fract(x-.5)-.5)/fwidth(x);return 1.-min(d,1.);}void main(){vec2 p=vW.xz;float g=max(gl(p.x*.5),gl(p.y*.5));float g2=max(gl(p.x*.1),gl(p.y*.1));float r=length(p);float a=(g*.09+g2*.2)*exp(-r*.06);gl_FragColor=vec4(uC,a);}' });
const floorGrid = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), gridMat); floorGrid.rotation.x = -Math.PI / 2; floorGrid.position.y = -3.1; scene.add(floorGrid);
const poolTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d'); const g = x.createRadialGradient(128, 128, 0, 128, 128, 128); g.addColorStop(0, 'rgba(255,255,255,.9)'); g.addColorStop(.35, 'rgba(255,255,255,.28)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 256, 256); return new THREE.CanvasTexture(c); })();
const pool = new THREE.Mesh(new THREE.PlaneGeometry(16, 16), new THREE.MeshBasicMaterial({ map: poolTex, color: 0xff6a1f, transparent: true, opacity: 0.3, depthWrite: false, blending: THREE.AdditiveBlending, fog: false })); pool.rotation.x = -Math.PI / 2; pool.position.y = -3.09; scene.add(pool);
const dotTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'); const g = x.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.4, 'rgba(255,255,255,.35)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c); })();
const bokeh = [[520, 0.07, 0.55], [170, 0.24, 0.22], [36, 0.8, 0.09]].map(([n, s, o]) => {
  const p = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { const r = 7 + Math.random() * 28, a = Math.random() * 6.283, y = rs() * 11; p[i * 3] = Math.cos(a) * r; p[i * 3 + 1] = y; p[i * 3 + 2] = Math.sin(a) * r; }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3));
  const m = new THREE.Points(g, new THREE.PointsMaterial({ map: dotTex, size: s, color: 0x8fa0c0, transparent: true, opacity: o, depthWrite: false, blending: THREE.AdditiveBlending }));
  scene.add(m); return m;
});

// ---------- environment light for the hub glass ----------
const env = new THREE.Scene(); env.background = new THREE.Color(0x020306);
const strip = (w, h, pos, col, int) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(col).multiplyScalar(int), side: THREE.DoubleSide })); m.position.set(...pos); m.lookAt(0, 0, 0); env.add(m); };
strip(12, 1, [0, 9, 2], 0xffffff, 3); strip(1.6, 14, [-10, 1, 3], 0xff6a1f, 2.2); strip(1.4, 12, [10, 0, -3], 0x8b7cff, 1.4); strip(8, 0.8, [0, -3, 10], 0xffe6cc, 1.1);
scene.environment = new THREE.PMREMGenerator(R).fromScene(env, 0.03).texture;

// ---------- hub: the model of Dheeraj ----------
const hub = new THREE.Group(); scene.add(hub);
const RAD = 2.3, base = new THREE.IcosahedronGeometry(RAD, 3).toNonIndexed();
const pos = base.attributes.position, shards = [], group = new THREE.Group(); hub.add(group);
const mkGlass = (c) => new THREE.MeshPhysicalMaterial({ color: new THREE.Color(0x141c28).lerp(new THREE.Color(c), 0.16), metalness: 0.1, roughness: 0.05, clearcoat: 1, clearcoatRoughness: 0.03, envMapIntensity: 2.4, transparent: true, opacity: 0.3, depthWrite: false, side: THREE.DoubleSide, iridescence: 0.5, iridescenceIOR: 1.35, iridescenceThicknessRange: [100, 400] });
const mkEdge = (c) => new THREE.LineBasicMaterial({ color: c, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false });
const glassM = CL.map((c) => mkGlass(c.col)), edgeM = CL.map((c) => mkEdge(c.col));
const edgeBad = new THREE.LineBasicMaterial({ color: 0xff2d55, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false });
function shardGeom(a, b, c, cen, nrm, th) {
  const o = [a, b, c].map((v) => v.clone().sub(cen).multiplyScalar(0.955));
  const i = o.map((v) => v.clone().multiplyScalar(0.9).addScaledVector(nrm, -th));
  const t = []; const tri = (p, q2, r) => t.push(p.x, p.y, p.z, q2.x, q2.y, q2.z, r.x, r.y, r.z);
  tri(o[0], o[1], o[2]); tri(i[0], i[2], i[1]);
  for (let k = 0; k < 3; k++) { const k2 = (k + 1) % 3; tri(o[k], i[k], o[k2]); tri(o[k2], i[k], i[k2]); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(t, 3)); g.computeVertexNormals(); return g;
}
const A = new THREE.Vector3(), B = new THREE.Vector3(), C = new THREE.Vector3();
for (let f = 0; f < pos.count; f += 3) {
  A.fromBufferAttribute(pos, f); B.fromBufferAttribute(pos, f + 1); C.fromBufferAttribute(pos, f + 2);
  const cen = A.clone().add(B).add(C).multiplyScalar(1 / 3), nrm = cen.clone().normalize();
  let ci = 0, best = -9; CL.forEach((c, k) => { const d = nrm.dot(c.v); if (d > best) { best = d; ci = k; } });
  const m = new THREE.Mesh(shardGeom(A.clone(), B.clone(), C.clone(), cen, nrm, 0.22), glassM[ci]);
  const edges = new THREE.LineSegments(new THREE.EdgesGeometry(m.geometry, 12), edgeM[ci]); m.add(edges);
  m.position.copy(cen); group.add(m);
  shards.push({ m, edges, c: ci, home: cen.clone(), nrm, vel: new THREE.Vector3(), ang: new THREE.Vector3(), delay: 0, free: false, bad: false, ph: Math.random() * 6.28, lift: 0 });
}
const coreMat = new THREE.ShaderMaterial({ transparent: true, uniforms: { uT: { value: 0 }, uF: { value: 0 }, uBad: { value: 0 } },
  vertexShader: 'varying vec3 vN;varying vec3 vV;void main(){vN=normalize(normalMatrix*normal);vec4 mv=modelViewMatrix*vec4(position,1.);vV=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}',
  fragmentShader: 'varying vec3 vN;varying vec3 vV;uniform float uT,uF,uBad;void main(){float f=pow(1.-max(dot(vN,vV),0.),2.2);vec3 c=mix(vec3(1.,.28,.04),vec3(1.,.82,.5),f*.8+uF*.6);c=mix(c,vec3(1.,.1,.25),uBad*.7);float p=.75+.25*sin(uT*(2.4+uBad*6.));gl_FragColor=vec4(c*(1.1+f*1.3+uF*.9)*p,1.);}' });
const core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.95, 4), coreMat); hub.add(core);
const coreLight = new THREE.PointLight(0xff6a1f, 26, 14, 1.6); hub.add(coreLight);
const key = new THREE.DirectionalLight(0xfff0e0, 1.2); key.position.set(4, 6, 5); hub.add(key);
const rim = new THREE.DirectionalLight(0x8b7cff, 1.6); rim.position.set(-6, 2, -5); hub.add(rim);
const sparksGeo = new THREE.BufferGeometry(), SN = 900, spP = new Float32Array(SN * 3), spV = new Float32Array(SN * 3), spL = new Float32Array(SN);
for (let i = 0; i < SN; i++) spP[i * 3 + 1] = -99;
sparksGeo.setAttribute('position', new THREE.BufferAttribute(spP, 3));
const sparks = new THREE.Points(sparksGeo, new THREE.PointsMaterial({ color: 0xffb070, size: 0.07, transparent: true, opacity: 0.95, depthWrite: false, blending: THREE.AdditiveBlending })); sparks.frustumCulled = false; hub.add(sparks);
let spi = 0;
const burst = (p, n) => { for (let k = 0; k < n; k++) { const i = spi++ % SN; spP.set([p.x, p.y, p.z], i * 3); const d = new THREE.Vector3(rs(), rs(), rs()).normalize().multiplyScalar(2 + Math.random() * 7); spV.set([d.x, d.y, d.z], i * 3); spL[i] = 0.6 + Math.random() * 1.1; } };

// ---------- scenes ----------
const META = CL.concat(SUB);
// Scenes are built the first time they are needed (and quietly warmed up afterwards), so the intro starts at once.
const FACT = [eduScene, aiScene, projectsGlobe, qaScene, skillsGlobe, hobbyScene, mastersScene, bachelorsScene, kalshiScene, shortsScene, skillsAtomScene, vaultScene];
const SC = FACT.map(() => null);
const ensure = (i) => { if (!SC[i]) { const s = FACT[i](); s.root.visible = false; scene.add(s.root); SC[i] = s; } return SC[i]; };

// ---------- post ----------
const comp = new EffectComposer(R); comp.addPass(new RenderPass(scene, cam));
const bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.55, 0.7, 0.6); comp.addPass(bloom);
const fx = new ShaderPass({ uniforms: { tDiffuse: { value: null }, uT: { value: 0 }, uA: { value: 0.0012 } }, vertexShader: 'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}', fragmentShader: 'uniform sampler2D tDiffuse;uniform float uT,uA;varying vec2 vUv;float h(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}void main(){vec2 d=vUv-.5;float r=dot(d,d);vec2 o=d*(uA+r*.012);vec4 c=vec4(texture2D(tDiffuse,vUv+o).r,texture2D(tDiffuse,vUv).g,texture2D(tDiffuse,vUv-o).b,1.);c.rgb+=(h(vUv*vec2(1920.,1080.)+uT)-.5)*.03;gl_FragColor=c;}' });
comp.addPass(fx); comp.addPass(new OutputPass());
let vo = 0.14, voy = 0;
function fit() { R.setSize(innerWidth, innerHeight); comp.setSize(innerWidth, innerHeight); cam.aspect = innerWidth / innerHeight; cam.setViewOffset(innerWidth, innerHeight, innerWidth > 900 ? -innerWidth * vo : 0, innerHeight * voy, innerWidth, innerHeight); cam.updateProjectionMatrix(); }
addEventListener('resize', fit); fit();

// ---------- sound (synthesised) ----------
let ac = null, soundOn = true, master = null; // sound is on by default; browsers only allow audio after a first click or key press
const startAudio = () => {
  if (ac && ac.state === 'running') return;
  if (!ac) { ac = new (window.AudioContext || window.webkitAudioContext)(); master = ac.createGain(); master.connect(ac.destination); }
  ac.resume(); master.gain.value = soundOn ? 0.9 : 0;
};
$('snd').textContent = 'Sound on';
$('snd').onclick = () => { soundOn = !soundOn; $('snd').textContent = soundOn ? 'Sound on' : 'Sound off'; startAudio(); if (master) master.gain.value = soundOn ? 0.9 : 0; };
['pointerdown', 'keydown'].forEach((ev) => addEventListener(ev, startAudio));
function sfxBreak() { if (!soundOn || !ac) return; const len = ac.sampleRate * 0.7, buf = ac.createBuffer(1, len, ac.sampleRate), d = buf.getChannelData(0); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.2);
  const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(); s.buffer = buf; f.type = 'highpass'; f.frequency.value = 2200; g.gain.value = 0.5; s.connect(f); f.connect(g); g.connect(master); s.start();
  const o = ac.createOscillator(), og = ac.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(140, ac.currentTime); o.frequency.exponentialRampToValueAtTime(40, ac.currentTime + 0.6); og.gain.setValueAtTime(0.5, ac.currentTime); og.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.7); o.connect(og); og.connect(master); o.start(); o.stop(ac.currentTime + 0.8); }
function sfxTick() { if (!soundOn || !ac) return; const o = ac.createOscillator(), g = ac.createGain(); o.type = 'sine'; o.frequency.value = 660; g.gain.setValueAtTime(0.1, ac.currentTime); g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.25); o.connect(g); g.connect(master); o.start(); o.stop(ac.currentTime + 0.3); }

// ---------- hub HUD ----------
const found = CL.map(() => 0), rowsEl = $('rows'), curve = $('curve'), cx = curve.getContext('2d');
CL.forEach((c) => { const r = document.createElement('div'); r.className = 'row'; r.style.setProperty('--c', c.css); r.innerHTML = '<span style="width:150px;color:' + c.css + '">' + c.name.toUpperCase() + '</span><i><u></u></i>'; rowsEl.appendChild(r); c.bar = r.querySelector('u'); });
const labels = CL.map((c) => { const d = document.createElement('div'); d.className = 'lbl'; d.style.setProperty('--c', c.css); d.textContent = c.name; document.body.appendChild(d); return d; });
let loss = 0.03, epoch = 0, hacc = 0; const hist = new Array(160).fill(0.03);
function drawCurve() { const w = curve.width, h = curve.height; cx.clearRect(0, 0, w, h); cx.strokeStyle = '#1c212c'; cx.lineWidth = 1; for (let i = 1; i < 4; i++) { cx.beginPath(); cx.moveTo(0, (h * i) / 4); cx.lineTo(w, (h * i) / 4); cx.stroke(); } cx.beginPath(); hist.forEach((v, i) => { const x = (i / (hist.length - 1)) * w, y = h - 4 - Math.min(1, v) * (h - 10); i ? cx.lineTo(x, y) : cx.moveTo(x, y); }); cx.strokeStyle = loss > 0.15 ? '#ff2d55' : '#ff6a1f'; cx.lineWidth = 2.5; cx.stroke(); }

// ---------- state machine: intro -> hub <-> scene ----------
const FAR = new THREE.Vector3(1, 7, 24);
const ray = new THREE.Raycaster(), mouse = new THREE.Vector2();
let fpsV = 60;
let mode = 'boot', cur = -1, flash = 0, shake = 0, tIn = 0;
const ptr = { x: 0, y: 0 }, camLook = new THREE.Vector3(0, 0.2, 0), tmp = new THREE.Vector3();
const veil = $('veil'), panel = $('panel');
let hvT = 0;
addEventListener('pointermove', (e) => { ptr.x = (e.clientX / innerWidth) * 2 - 1; ptr.y = -((e.clientY / innerHeight) * 2 - 1);
  const n = performance.now(); if (mode === 'hub' && n - hvT > 70) { hvT = n; mouse.set(ptr.x, ptr.y); ray.setFromCamera(mouse, cam); const h = ray.intersectObjects(group.children, false)[0]; hoverRegion = h ? shards[group.children.indexOf(h.object)].c : -1; hoverPt = h ? group.worldToLocal(h.point.clone()) : null; } });
addEventListener('pointerdown', (e) => { ptr.x = (e.clientX / innerWidth) * 2 - 1; ptr.y = -((e.clientY / innerHeight) * 2 - 1); });
function setTint(c) { gridMat.uniforms.uC.value.setHex(c); pool.material.color.setHex(c); document.documentElement.style.setProperty('--g', '#' + c.toString(16).padStart(6, '0')); skyMat.uniforms.uA.value.setHex(c); bokeh.forEach((b) => b.material.color.setHex(c).lerp(new THREE.Color(0x8fa0c0), 0.55)); }
function inject(point, ci) {
  const t = performance.now() / 1000;
  for (const s of shards) {
    const d = s.m.position.distanceTo(point), fall = Math.exp(-d * 0.5), same = s.c === ci;
    const dir = s.m.position.clone().sub(point).normalize().add(new THREE.Vector3(rs() * 0.5, Math.random() * 0.6, rs() * 0.5)).normalize();
    if (same || d < 2.2) { s.vel.addScaledVector(dir, (4 + Math.random() * 9) * Math.max(fall, same ? 0.5 : 0) * 1.3); s.ang.set(rs() * 9, rs() * 9, rs() * 9).multiplyScalar(Math.max(fall, 0.4)); s.free = true; s.delay = t + 1.1 + Math.random() * 1.5 + (1 - fall) * 0.9; }
    if (!same && Math.random() < 0.3) { s.bad = true; s.edges.material = edgeBad; s.vel.addScaledVector(dir, 0.4 + Math.random() * 1.2); s.free = true; s.delay = t + 0.5 + Math.random() * 1.2; }
  }
  burst(point, 260); flash = 1; shake = 1; loss = Math.min(1, loss + 0.85); sfxBreak();
}
function showPanel(i) {
  const c = META[i]; panel.style.setProperty('--c', c.css);
  $('pnum').textContent = c.n; $('pname').textContent = c.name; if (c.html) $('pbody').innerHTML = c.html; else $('pbody').textContent = c.body; $('phint').textContent = c.hint;
  $('ptags').innerHTML = c.tags.map((t) => '<span>' + t + '</span>').join('');
  const act = $('act'), sa = SC[i].action; act.style.display = sa ? '' : 'none'; if (sa) { act.textContent = sa.label(); act.onclick = () => { sa.fn(); act.textContent = sa.label(); }; }
  panel.classList.add('on');
}
const ptabs = $('ptabs');
function renderDetail(i) {
  const s = SC[i];
  if (!s.detail) { ptabs.classList.remove('on'); return; }
  const d = s.detail(), c = META[i];
  ptabs.style.setProperty('--c', c.css);
  const tabs = s.tabs || [];
  ptabs.innerHTML = tabs.map((t, k) => '<button class="' + (k === s.tabIndex() ? 'on' : '') + '" data-k="' + k + '">' + t + '</button>').join('');
  ptabs.classList.toggle('on', tabs.length > 1);
  ptabs.querySelectorAll('button').forEach((b) => (b.onclick = () => { s.select(+b.dataset.k); renderDetail(i); }));
  $('pname').textContent = d.title;
  $('pbody').innerHTML = '<span class="sub2">' + d.sub + '</span><ol class="pts">' + d.points.map((p, n) => '<li data-n="' + n + '"><b>' + (n + 1) + '</b><span>' + p + '</span></li>').join('') + '</ol>' + (d.note ? '<p class="note">' + d.note + '</p>' : '');
  $('ptags').innerHTML = d.tags.map((t) => '<span>' + t + '</span>').join('');
  $('pbody').querySelectorAll('li').forEach((li) => { li.onmouseenter = () => { s.highlight(+li.dataset.n); li.classList.add('on'); }; li.onmouseleave = () => { s.highlight(-1); li.classList.remove('on'); }; li.onclick = () => s.highlight(+li.dataset.n); });
}
function swapTo(i) {
  hub.visible = false; labels.forEach((l) => (l.style.display = 'none'));
  ensure(i); SC.forEach((s) => s && (s.root.visible = false)); SC[i].root.visible = true;
  cur = i; mode = 'scene'; ctl.enabled = false; ctl.autoRotate = false; vo = typeof SC[i].vo === 'function' ? SC[i].vo() : (SC[i].vo ?? 0.12); voy = innerWidth <= 900 ? 0.2 : 0.05; fit();
  camLook.copy(SC[i].cam.look); cam.position.copy(SC[i].cam.pos).sub(camLook).multiplyScalar(Math.max(1, 1.6 / cam.aspect) * 1.16).add(camLook);
  setTint(META[i].col); skyMat.uniforms.uK.value = 0.05; floorGrid.position.y = SC[i].floor; pool.position.y = SC[i].floor + 0.01; pool.scale.setScalar(SC[i].pool || 1); if (CL[i]) { found[i] = 1; CL[i].bar.style.width = '100%'; }
  document.body.classList.add('in-scene'); showPanel(i); renderDetail(i);
  window.__app?.onScene?.(i);
}
function toHub() {
  hub.visible = true; labels.forEach((l) => (l.style.display = '')); SC.forEach((s) => s && (s.root.visible = false));
  mode = 'hub'; cur = -1; ctl.enabled = true; ctl.autoRotate = true; vo = 0.14; voy = 0; fit(); cam.position.copy(HOME); ctl.target.set(0, 0.2, 0);
  setTint(0xff6a1f); skyMat.uniforms.uK.value = 0.05; floorGrid.position.y = -3.1; pool.position.y = -3.09; pool.scale.setScalar(1); document.body.classList.remove('in-scene'); panel.classList.remove('on'); ptabs.classList.remove('on');
}
// Scene transition: a connection, not an effect. A glowing signal leaves the point you clicked, travels a curved thread to the
// next node, the node pulses, and the new scene resolves out of that point. Three small elements only (thread, signal, pulse),
// plus a fade of the 3D canvas, all on the compositor, so it stays smooth and a slow scene build is hidden.
const nextFrames = (n) => new Promise((res) => { const f = () => (n-- > 0 ? requestAnimationFrame(f) : res()); f(); });
async function transition(fn, c, name = '') {
  mode = 'trans';
  if (window.__app && window.__app.reduced) { fn(); return; }
  const W = innerWidth, H = innerHeight, ox = Math.min(W * 0.92, Math.max(W * 0.08, (ptr.x * 0.5 + 0.5) * W)), oy = Math.min(H * 0.9, Math.max(H * 0.1, (-ptr.y * 0.5 + 0.5) * H));
  const tx = W * (W > 900 ? 0.6 : 0.5), ty = H * 0.42, mx = (ox + tx) / 2 + (oy - ty) * 0.35, my = (oy + ty) / 2 - Math.abs(ox - tx) * 0.3 - 40;
  const d = `M${ox.toFixed(1)} ${oy.toFixed(1)} Q${mx.toFixed(1)} ${my.toFixed(1)} ${tx.toFixed(1)} ${ty.toFixed(1)}`;
  const box = document.createElement('div'); box.style.cssText = 'position:fixed;inset:0;z-index:20;pointer-events:none;overflow:hidden';
  box.innerHTML = `<svg width="${W}" height="${H}" style="position:absolute;inset:0;overflow:visible"><path d="${d}" fill="none" stroke="${c}" stroke-width="1.6" stroke-linecap="round" opacity=".9" style="filter:drop-shadow(0 0 6px ${c})"/></svg>`;
  const path = box.querySelector('path'), len = path.getTotalLength(); path.style.strokeDasharray = len; path.style.strokeDashoffset = len;
  const dot = (sz, extra) => { const e = document.createElement('div'); e.style.cssText = `position:absolute;left:${-sz / 2}px;top:${-sz / 2}px;width:${sz}px;height:${sz}px;border-radius:50%;${extra}`; box.appendChild(e); return e; };
  const origin = dot(10, `left:${ox - 5}px;top:${oy - 5}px;background:${c};box-shadow:0 0 16px ${c}`);
  const head = dot(12, `background:#fff;box-shadow:0 0 18px 4px ${c};offset-path:path('${d}');offset-distance:0%;offset-rotate:0deg;left:-6px;top:-6px;will-change:offset-distance`);
  const node = dot(14, `left:${tx - 7}px;top:${ty - 7}px;background:${c};box-shadow:0 0 22px ${c};opacity:0`);
  const ring = dot(14, `left:${tx - 7}px;top:${ty - 7}px;border:1.5px solid ${c};opacity:0`);
  document.body.appendChild(box); document.body.classList.add('trans');
  const TRAVEL = 460, ez = 'cubic-bezier(.5,0,.25,1)';
  try {
    origin.animate([{ transform: 'scale(1)', opacity: 1 }, { transform: 'scale(2.6)', opacity: 0 }], { duration: 420, fill: 'forwards' });
    path.animate([{ strokeDashoffset: len }, { strokeDashoffset: 0 }], { duration: TRAVEL, easing: ez, fill: 'forwards' });
    head.animate([{ offsetDistance: '0%' }, { offsetDistance: '100%' }], { duration: TRAVEL, easing: ez, fill: 'forwards' });
    cv.style.transformOrigin = `${tx}px ${ty}px`;
    cv.animate([{ opacity: 1 }, { opacity: 0.12 }], { duration: TRAVEL, easing: 'ease-in', fill: 'forwards' });
    await new Promise((r) => setTimeout(r, TRAVEL));
    node.animate([{ opacity: 1, transform: 'scale(.4)' }, { opacity: 1, transform: 'scale(1.8)', offset: 0.3 }, { opacity: 0, transform: 'scale(1)' }], { duration: 600, fill: 'forwards' });
    ring.animate([{ opacity: 0.9, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(26)' }], { duration: 760, easing: 'cubic-bezier(.1,.7,.2,1)', fill: 'forwards' });
    head.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 120, fill: 'forwards' });
    path.animate([{ opacity: 0.9 }, { opacity: 0 }], { duration: 500, fill: 'forwards' });
    await nextFrames(1); fn(); await nextFrames(3); // swap while the pulse is blooming, let the new scene render a few frames
    document.body.classList.remove('trans');
    await cv.animate([{ opacity: 0.12, transform: 'scale(.94)' }, { opacity: 1, transform: 'scale(1)' }], { duration: 650, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'forwards' }).finished;
  } finally { document.body.classList.remove('trans'); cv.getAnimations().forEach((x) => x.cancel()); box.remove(); }
}
const enter = (i) => transition(() => swapTo(i), META[i].css, META[i].name);

let down = null;
cv.addEventListener('pointerdown', (e) => { down = [e.clientX, e.clientY]; });
cv.addEventListener('pointerup', (e) => {
  if (!down) return; const moved = Math.hypot(e.clientX - down[0], e.clientY - down[1]); down = null; if (moved > 6) return;
  if (mode === 'scene') { const r = SC[cur].click(); if (SC[cur].detail) renderDetail(cur); if (r !== 'break') sfxTick(); return; }
  if (mode !== 'hub') return;
  mouse.set((e.clientX / innerWidth) * 2 - 1, -((e.clientY / innerHeight) * 2 - 1)); ray.setFromCamera(mouse, cam);
  const hit = ray.intersectObjects(group.children, false)[0]; if (!hit) return;
  const ci = shards[group.children.indexOf(hit.object)].c; mode = 'trans'; inject(hit.point, ci); $('hint').style.display = 'none'; window.dispatchEvent(new CustomEvent('ach', { detail: 'fault' }));
  setTimeout(() => enter(ci), 650);
});

// ---------- boot ----------
const boot = $('boot'); let booted = false, igniteT = 9, typer = null;
const nameEl = $('name'), letters = splitName(nameEl), kin = kinetic(letters);
buildTape($('tape'));
const BOOT = [['> dheeraj.model --load', 'hd'], ['  ✓ education    M.S. Data Science and AI · UCM · 05/2027', 'ok'], ['  ✓ experience   2 years automation testing', 'ok'], ['  ✓ systems      2 agent systems built', 'ok'], ['  ✓ regions      data science and AI · agents · projects · testing', 'ok'], ['> training from scratch...', 'hd']];
function assemble() {
  const t = performance.now() / 1000;
  for (const s of shards) { const d = new THREE.Vector3(rs(), rs(), rs()).normalize().multiplyScalar(7 + Math.random() * 9); s.m.position.copy(s.home).add(d); s.vel.set(0, 0, 0); s.ang.set(rs() * 8, rs() * 8, rs() * 8); s.free = true; s.delay = t + 0.2 + Math.random() * 1.6 + s.home.y * 0.12; }
  loss = 1; epoch = 0; flash = 1; igniteT = 0;
}
function endBoot() {
  if (booted) return; booted = true; if (typer) typer.cancel(); boot.classList.add('out'); setTimeout(() => boot.remove(), 1000);
  const s = q.get('scene');
  if (s !== null) { nameEl.classList.add('on'); kin.start(); swapTo(+s); return; }
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { mode = 'hub'; nameEl.classList.add('on'); ctl.autoRotate = false; return; }
  mode = 'intro'; tIn = 0; cam.position.copy(FAR); assemble();
  scramble($('tag'), 'M.S. Data Science and AI · AI engineer · tester by training', { dur: 1500, delay: 500 });
  setTimeout(() => { nameEl.classList.add('on'); setTimeout(() => kin.start(), 2200); }, 900);
}
let hoverRegion = -1, hoverPt = null, tiltX = 0, tiltY = 0; // declared before endBoot() can run (the reduced-motion path reaches the cursor label immediately)
$('skip').onclick = endBoot;
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
if (q.has('nobook') || q.has('scene') || REDUCED) endBoot(); else typer = typeLines($('bt'), BOOT, 170), typer.then(endBoot);
cursor($('cur'), () => (mode === 'scene' ? (SC[cur] && SC[cur].cursor ? SC[cur].cursor() : 'run') : mode === 'hub' ? (hoverRegion >= 0 ? 'break · ' + CL[hoverRegion].name : 'drag') : ''));
const regionOn = CL.map(() => true);
cv.addEventListener('pointerleave', () => { hoverRegion = -1; hoverPt = null; });
const clk = $('clk'); const tick = () => { clk.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }; tick(); setInterval(tick, 1000);
window.__enter = (i) => swapTo(i);

const app = {
  R, scene, cam, cv, CL, META, SC, reduced: matchMedia('(prefers-reduced-motion: reduce)').matches, fps: () => fpsV, cur: () => cur,
  mode: () => mode, enter: (i) => { if (mode === 'scene' || mode === 'hub') enter(i); }, home: () => { if (mode === 'scene') transition(toHub, '#ff6a1f', 'The model'); },
  breakRegion: (ci) => { if (mode !== 'hub') return; inject(CL[ci].v.clone().multiplyScalar(RAD).applyQuaternion(group.quaternion), ci); window.dispatchEvent(new CustomEvent('ach', { detail: 'fault' })); },
  heal: () => { const t = performance.now() / 1000; for (const s of shards) { s.free = true; s.delay = t; } loss = Math.min(loss, 0.1); },
  toggleSound: () => $('snd').click(), sfxBreak,
  setActive: (arr) => { CL.forEach((c, i) => { regionOn[i] = !!arr[i]; }); },
};
window.__app = app;
{ const warm = (k) => { if (k >= FACT.length) return; (window.requestIdleCallback || ((f) => setTimeout(f, 400)))(() => { ensure(k); warm(k + 1); }, { timeout: 2500 }); }; setTimeout(() => warm(0), 4000); }
initUI(app);
initCompass(app);

// ---------- loop ----------
const clock = new THREE.Clock(), q0 = new THREE.Quaternion(), eu = new THREE.Euler(), tv = new THREE.Vector3(); let statT = 0;
const ease = (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
function frame() {
  // while the boot text types, don't render the 3D scene behind it: it starved the typing and made the intro crawl
  if (mode === 'boot') { clock.getDelta(); requestAnimationFrame(frame); return; }
  const dt = Math.min(clock.getDelta(), 0.05), t = clock.elapsedTime, now = performance.now() / 1000;
  for (const s of shards) {
    const m = s.m;
    if (s.free) {
      if (now < s.delay) s.vel.multiplyScalar(Math.exp(-0.7 * dt));
      else { s.vel.addScaledVector(s.home.clone().sub(m.position), 20 * dt).multiplyScalar(Math.exp(-6.2 * dt)); s.ang.multiplyScalar(Math.exp(-3 * dt)); m.quaternion.slerp(q0, 1 - Math.exp(-5 * dt)); }
      m.position.addScaledVector(s.vel, dt); eu.set(s.ang.x * dt, s.ang.y * dt, s.ang.z * dt); m.quaternion.multiply(new THREE.Quaternion().setFromEuler(eu));
      if (now > s.delay && m.position.distanceTo(s.home) < 0.01 && s.vel.length() < 0.05) { s.free = false; m.position.copy(s.home); m.quaternion.identity(); }
    } else { const tgt = hoverPt && mode === 'hub' ? Math.pow(Math.max(0, 1 - s.home.distanceTo(hoverPt) / 1.5), 2) * 0.32 : 0; s.lift += (tgt - s.lift) * Math.min(1, dt * 10); m.position.copy(s.home).addScaledVector(s.nrm, Math.sin(t * 1.2 + s.ph) * 0.012 + s.lift); }
    if (s.bad && Math.random() < (1 - Math.min(1, loss * 1.6)) * dt * 2.2) { s.bad = false; s.edges.material = edgeM[s.c]; }
  }
  for (let i = 0; i < SN; i++) if (spL[i] > 0) { spL[i] -= dt; spV[i * 3 + 1] -= 7 * dt; spP[i * 3] += spV[i * 3] * dt; spP[i * 3 + 1] += spV[i * 3 + 1] * dt; spP[i * 3 + 2] += spV[i * 3 + 2] * dt; if (spL[i] <= 0) spP[i * 3 + 1] = -99; }
  sparksGeo.attributes.position.needsUpdate = true;
  flash *= Math.exp(-3.2 * dt); shake *= Math.exp(-6 * dt); loss += (0.03 - loss) * (1 - Math.exp(-0.75 * dt)); if (loss > 0.06) epoch += dt * (40 + loss * 220);
  hacc += dt; if (hacc > 0.05) { hacc = 0; hist.push(loss); hist.shift(); drawCurve(); $('loss').textContent = loss.toFixed(3); $('ep').textContent = Math.floor(epoch).toLocaleString(); }
  fpsV += (1 / Math.max(dt, 0.001) - fpsV) * 0.08;
  coreMat.uniforms.uT.value = t; coreMat.uniforms.uF.value = flash; coreMat.uniforms.uBad.value = Math.min(1, loss * 1.3); core.scale.setScalar(1 + Math.sin(t * 2.4) * 0.03 + flash * 0.12);
  coreLight.intensity = 26 + flash * 50 + (mode === 'hub' && hoverRegion >= 0 ? 10 : 0); bloom.strength = (mode === 'scene' ? 0.26 : 0.55) + flash * 0.35; bloom.threshold = mode === 'scene' ? 0.82 : 0.6; tiltY += ((mode === 'hub' ? ptr.x * 0.22 : 0) - tiltY) * Math.min(1, dt * 3); tiltX += ((mode === 'hub' ? -ptr.y * 0.14 : 0) - tiltX) * Math.min(1, dt * 3); group.rotation.y = t * 0.03 + tiltY; group.rotation.x = tiltX;
  CL.forEach((c, i) => { const on = mode === 'hub' && hoverRegion === i, any = mode === 'hub' && hoverRegion >= 0; glassM[i].opacity += ((regionOn[i] ? (on ? 0.5 : any ? 0.22 : 0.3) : 0.04) - glassM[i].opacity) * 0.15; edgeM[i].opacity += ((regionOn[i] ? (on ? 1 : any ? 0.4 : 0.6) : 0.07) - edgeM[i].opacity) * 0.15; });
  fx.uniforms.uT.value = t; fx.uniforms.uA.value = 0.0008 + flash * 0.004 + loss * 0.0016; pool.material.opacity = (mode === 'scene' ? 0.1 : 0.26) + flash * 0.25 + Math.sin(t * 1.4) * 0.02;
  bokeh.forEach((b, i) => (b.rotation.y = t * 0.004 * (i + 1)));
  kin.update(); igniteT += dt; if (igniteT < 1.8) { core.scale.setScalar(Math.max(0.001, ease(Math.min(1, igniteT / 1.6)))); }
  if (mode === 'intro') { tIn += dt; const k = Math.min(1, tIn / 2.4); cam.position.lerpVectors(FAR, HOME, ease(k)); cam.lookAt(0, 0.2, 0); if (k >= 1) { mode = 'hub'; ctl.enabled = true; } }
  else if (mode === 'hub') { ctl.update(); cam.position.x += rs() * shake * 0.04; cam.position.y += rs() * shake * 0.04; }
  else if (mode === 'trans' && cur === -1) { cam.position.lerp(tmp.copy(HOME).multiplyScalar(0.6), 1 - Math.exp(-1.2 * dt)); cam.lookAt(0, 0.2, 0); }
  else if (mode === 'scene') {
    const s = SC[cur]; s.update(t, dt, ptr);
    const f = Math.max(1, 1.6 / cam.aspect) * 1.16; tmp.copy(s.cam.pos).sub(s.cam.look).multiplyScalar(f).add(s.cam.look).add(new THREE.Vector3(ptr.x * 0.7, ptr.y * 0.4, 0)); cam.position.lerp(tmp, 1 - Math.exp(-3 * dt)); camLook.lerp(s.cam.look, 1 - Math.exp(-3 * dt)); cam.lookAt(camLook);
    statT += dt; if (statT > 0.2) { statT = 0; $('pstat').innerHTML = s.stat(); if (s.hintFor) $('phint').textContent = s.hintFor(); }
  }
  if (hub.visible) CL.forEach((c, i) => { tv.copy(c.v).multiplyScalar(RAD + 0.55).applyMatrix4(group.matrixWorld).project(cam); const wv = c.v.clone().applyQuaternion(group.quaternion); const l = labels[i]; const side = tv.x > 0.1 ? 'r' : tv.x < -0.1 ? 'l' : 'c'; if (l.dataset.s !== side) l.dataset.s = side; l.style.left = (tv.x * 0.5 + 0.5) * innerWidth + 'px'; l.style.top = (-tv.y * 0.5 + 0.5) * innerHeight + 'px'; l.style.opacity = wv.dot(cam.position.clone().normalize()) > -0.1 ? 1 : 0.15; });
  if (hacc === 0 && mode !== 'scene') $('ro').innerHTML = 'x <b>' + ptr.x.toFixed(2) + '</b> · y <b>' + ptr.y.toFixed(2) + '</b><br>probe <b>' + (hoverRegion >= 0 ? CL[hoverRegion].name : 'none') + '</b>';
  comp.render(); requestAnimationFrame(frame);
}
frame();
