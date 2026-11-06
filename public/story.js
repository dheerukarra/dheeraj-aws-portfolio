import * as THREE from 'three';
import { showOvl } from './ovl.js';

// The model card: one holographic card that holds the whole overview (About me, Superpowers, Projects).
// It assembles out of pixel particles when it opens and dissolves back into them when it closes. Hover it and it lifts off
// the stage and floats, tilting toward your pointer while the foil catches the light. All text also lives in the page markup.
const TW = 1024, TH = 1434, CW = 2.4, CH = 3.36, FOV = 38;
const ease3 = (t) => 1 - Math.pow(1 - t, 3), clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const mono = (n) => `500 ${n}px "JetBrains Mono", monospace`, syne = (n) => `800 ${n}px Syne, sans-serif`, body = (n) => `400 ${n}px "Instrument Sans", sans-serif`;

function roundShape(w, h, r) {
  const s = new THREE.Shape(), x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r); s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r); s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y); return s;
}
function chip(c, text, x, y, col, px) {
  c.font = mono(px); const w = c.measureText(text).width + 36, h = px + 24;
  c.fillStyle = col + '22'; c.strokeStyle = col; c.lineWidth = 2; c.beginPath(); c.roundRect(x, y - h + 12, w, h, h / 2); c.fill(); c.stroke(); c.fillStyle = col; c.fillText(text, x + 18, y); return w + 12;
}
function drawCard(c) {
  c.fillStyle = '#0a0e15'; c.fillRect(0, 0, TW, TH);
  c.strokeStyle = 'rgba(255,255,255,.045)'; c.lineWidth = 2; for (let i = 0; i <= TW; i += 64) { c.beginPath(); c.moveTo(i, 0); c.lineTo(i, TH); c.stroke(); } for (let j = 0; j <= TH; j += 64) { c.beginPath(); c.moveTo(0, j); c.lineTo(TW, j); c.stroke(); }
  c.textBaseline = 'alphabetic'; c.font = mono(28); c.fillStyle = '#98a0b3'; c.fillText('MODEL CARD', 64, 92); c.textAlign = 'right'; c.fillStyle = '#ff6a1f'; c.fillText('v2.0 · NOW', TW - 64, 92); c.textAlign = 'left';
  c.strokeStyle = '#5ec8ff'; c.globalAlpha = 0.3; c.lineWidth = 3; for (const r of [200, 140]) { c.beginPath(); c.arc(TW / 2, 330, r, 0, 6.283); c.stroke(); } c.globalAlpha = 1;
  let n = 92; c.font = syne(n); while (c.measureText('Dheeraj Reddy Karra').width > TW - 128 && n > 40) { n -= 2; c.font = syne(n); } c.fillStyle = '#f4efe7'; c.fillText('Dheeraj Reddy Karra', 64, 610);
  c.font = mono(27); c.fillStyle = '#98a0b3'; c.fillText('Automation tester turned AI-native engineer', 64, 660);
  const g = c.createLinearGradient(64, 0, TW - 64, 0); g.addColorStop(0, '#ff6a1f'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fillRect(64, 692, TW - 128, 4);
  const label = (t, col, y) => { c.font = mono(26); c.fillStyle = col; c.fillText(t, 64, y); };
  label('ABOUT ME', '#5ec8ff', 756); c.font = body(36); c.fillStyle = '#e4e6ee';
  c.fillText('M.S. Data Science and AI, UCM', 64, 806); c.fillText('B.S. Computer Science, cum laude, 3.51 GPA', 64, 852); c.fillText('2 years of automation testing', 64, 898);
  label('SUPERPOWERS', '#ff6a1f', 980); let x = 64; for (const [t, col] of [['AI coding', '#a58bff'], ['Testing', '#7bd88f'], ['Data and ML', '#5ec8ff'], ['Java and SQL', '#f4c95d']]) x += chip(c, t, x, 1040, col, 27);
  label('PROJECTS', '#a58bff', 1130); c.font = body(36); c.fillStyle = '#e4e6ee'; c.fillText('Kalshi trading system', 64, 1182); c.fillText('shorts-engine', 64, 1232);
  chip(c, 'SIMULATED', 520, 1182, '#f4c95d', 22);
  c.font = mono(26); c.fillStyle = '#6c7488'; c.fillText('github.com/dheerukarra', 64, TH - 56); c.textAlign = 'right'; c.fillText('Built on AWS Amplify', TW - 64, TH - 56); c.textAlign = 'left';
}
function drawBack(c) {
  c.fillStyle = '#080b11'; c.fillRect(0, 0, TW, TH); c.strokeStyle = 'rgba(94,200,255,.18)'; c.lineWidth = 2; for (let r = 90; r < 900; r += 70) { c.beginPath(); c.arc(TW / 2, TH / 2, r, 0, 6.283); c.stroke(); }
  c.fillStyle = '#ff6a1f'; c.beginPath(); c.arc(TW / 2, TH / 2, 70, 0, 6.283); c.fill(); c.font = syne(120); c.fillStyle = '#f4efe7'; c.textAlign = 'center'; c.fillText('DRK', TW / 2, TH / 2 + 240); c.textAlign = 'left';
}
const FOIL_F = `uniform sampler2D uMap;uniform float uT;uniform vec2 uTilt;uniform float uA;varying vec2 vUv;
vec3 hue(float h){return .5+.5*cos(6.2832*(h+vec3(0.,.33,.67)));}
void main(){vec3 col=texture2D(uMap,vUv).rgb;vec2 e=min(vUv,1.-vUv);float edge=1.-smoothstep(0.,.014,min(e.x,e.y));
float d=vUv.x*1.1+vUv.y*.8+uTilt.x*1.4-uTilt.y*1.0;float band=pow(.5+.5*sin(d*13.+uT*.5),3.);vec3 f=hue(d*.8+uT*.04);
col+=f*band*.05;col=mix(col,f*(.55+.25*band),edge*.7);gl_FragColor=vec4(min(col,vec3(.93)),uA);
#include <colorspace_fragment>
}`;
const PART_V = `attribute vec3 aStart;attribute vec3 aTarget;attribute vec3 aColor;attribute float aRand;uniform float uP;uniform float uSize;uniform float uPix;uniform float uAlpha;varying vec3 vC;varying float vA;
void main(){float d=aRand*.45;float t=clamp((uP-d)/.55,0.,1.);float e=1.-pow(1.-t,3.);vec3 p=mix(aStart,aTarget,e);
float sw=(1.-e)*(aRand-.5);p.x+=sin(sw*14.)*.5*(1.-e);p.y+=cos(sw*14.)*.35*(1.-e);
vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;gl_PointSize=uSize*uPix/(-mv.z)*(.55+.9*e);vC=aColor;vA=uAlpha*smoothstep(0.,.12,t);}`;
const PART_F = `varying vec3 vC;varying float vA;void main(){gl_FragColor=vec4(pow(vC,vec3(2.2)),vA);
#include <colorspace_fragment>
}`;

let S = null, raf = 0;

function build(el) {
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cvs = el.querySelector('#sy-gl'), box = cvs.parentElement, hint = el.querySelector('.sy-hint');
  const R = new THREE.WebGLRenderer({ canvas: cvs, antialias: true, alpha: true }); R.setPixelRatio(Math.min(devicePixelRatio, 2));
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(FOV, 1, 0.1, 100); cam.position.set(0, 0, 9.5);
  const fc = document.createElement('canvas'); fc.width = TW; fc.height = TH; const fx = fc.getContext('2d'); drawCard(fx);
  const bc = document.createElement('canvas'); bc.width = TW; bc.height = TH; drawBack(bc.getContext('2d'));
  const mk = (cnv) => { const t = new THREE.CanvasTexture(cnv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; };
  const faceT = mk(fc), backT = mk(bc), tilt = new THREE.Vector2();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { drawCard(fx); faceT.needsUpdate = true; resample(); });
  const foilMat = (map) => new THREE.ShaderMaterial({ transparent: true, uniforms: { uMap: { value: map }, uT: { value: 0 }, uTilt: { value: tilt }, uA: { value: 0 } }, vertexShader: 'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}', fragmentShader: FOIL_F });
  const frontM = foilMat(faceT), backM = foilMat(backT);
  const card = new THREE.Group(); scene.add(card);
  const front = new THREE.Mesh(new THREE.ShapeGeometry(roundShape(CW, CH, 0.16), 8), frontM);
  { const g = front.geometry, p = g.attributes.position, uv = g.attributes.uv; for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) / CW + 0.5, p.getY(i) / CH + 0.5); uv.needsUpdate = true; }
  card.add(front);
  const back = new THREE.Mesh(front.geometry, backM); back.rotation.y = Math.PI; back.position.z = -0.03; card.add(back);
  const slabM = new THREE.MeshBasicMaterial({ color: 0x141a28, transparent: true, opacity: 0 }); const slab = new THREE.Mesh(new THREE.ShapeGeometry(roundShape(CW + 0.06, CH + 0.06, 0.18), 8), slabM); slab.position.z = -0.015; card.add(slab);
  const outM = new THREE.LineBasicMaterial({ color: 0x5ec8ff, transparent: true, opacity: 0 }); card.add(new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(roundShape(CW + 0.05, CH + 0.05, 0.18).getPoints(30).map((p) => new THREE.Vector3(p.x, p.y, 0.01))), outM));
  // the little model that floats above the card
  const orb = new THREE.Group(); orb.position.set(0, 1.0, 0.45); orb.scale.setScalar(0.6); card.add(orb);
  const coreM = new THREE.MeshBasicMaterial({ color: 0xff6a1f, transparent: true, opacity: 0 }); orb.add(new THREE.Mesh(new THREE.SphereGeometry(0.26, 20, 20), coreM));
  const w1M = new THREE.LineBasicMaterial({ color: 0x5ec8ff, transparent: true, opacity: 0 }), w2M = new THREE.LineBasicMaterial({ color: 0xa58bff, transparent: true, opacity: 0 });
  const sh1 = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(0.78, 1)), w1M), sh2 = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(0.52, 1)), w2M); orb.add(sh1, sh2);
  // glow under the card: shrinks and brightens as the card lifts
  const gc = document.createElement('canvas'); gc.width = gc.height = 128; { const x = gc.getContext('2d'), g = x.createRadialGradient(64, 64, 0, 64, 64, 64); g.addColorStop(0, 'rgba(255,106,31,.7)'); g.addColorStop(0.5, 'rgba(94,200,255,.18)'); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(0, 0, 128, 128); }
  const glowM = new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(gc), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }); const glow = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 1.1), glowM); glow.rotation.x = -Math.PI / 2.4; glow.position.set(0, -2.55, -0.4); scene.add(glow);

  // pixel particles: sampled from the card image, so the card literally assembles out of its own pixels
  let pts = null, pm = null;
  function resample() {
    if (pts) { scene.remove(pts); pts.geometry.dispose(); }
    const W = 150, H = Math.round((W * TH) / TW), sc = document.createElement('canvas'); sc.width = W; sc.height = H; const sx = sc.getContext('2d'); sx.drawImage(fc, 0, 0, W, H);
    const px = sx.getImageData(0, 0, W, H).data, T = [], St = [], Co = [], Rd = [];
    for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
      const k = (j * W + i) * 4, r = px[k] / 255, g = px[k + 1] / 255, b = px[k + 2] / 255, lum = 0.3 * r + 0.59 * g + 0.11 * b; if (lum < 0.1) continue;
      T.push((i / W - 0.5) * CW, (0.5 - j / H) * CH, 0); const a = Math.random() * 6.2832, rad = 4 + Math.random() * 7; St.push(Math.cos(a) * rad, (Math.random() - 0.5) * 9, Math.sin(a) * rad - 2); Co.push(r, g, b); Rd.push(Math.random());
    }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(T), 3)); geo.setAttribute('aTarget', new THREE.BufferAttribute(new Float32Array(T), 3)); geo.setAttribute('aStart', new THREE.BufferAttribute(new Float32Array(St), 3)); geo.setAttribute('aColor', new THREE.BufferAttribute(new Float32Array(Co), 3)); geo.setAttribute('aRand', new THREE.BufferAttribute(new Float32Array(Rd), 1));
    pm = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, uniforms: { uP: { value: 0 }, uSize: { value: (CW / W) * 1.25 }, uPix: { value: 600 }, uAlpha: { value: 1 } }, vertexShader: PART_V, fragmentShader: PART_F });
    pts = new THREE.Points(geo, pm); pts.frustumCulled = false; card.add(pts);
  }
  resample();

  const size = () => { const w = box.clientWidth, h = box.clientHeight; if (!w || !h) return; R.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); if (pm) pm.uniforms.uPix.value = (h * R.getPixelRatio()) / (2 * Math.tan((FOV * Math.PI) / 360)) / R.getPixelRatio(); };
  addEventListener('resize', size);
  const ray = new THREE.Raycaster(), mouse = new THREE.Vector2(); let mx = 0, my = 0, over = false, hintOff = false;
  box.addEventListener('pointermove', (e) => { const r = cvs.getBoundingClientRect(); mx = ((e.clientX - r.left) / r.width) * 2 - 1; my = -(((e.clientY - r.top) / r.height) * 2 - 1); mouse.set(mx, my); ray.setFromCamera(mouse, cam); over = ray.intersectObject(front).length > 0; if (over && !hintOff) { hintOff = true; hint.style.opacity = 0; } }, { passive: true });
  box.addEventListener('pointerleave', () => { over = false; mx = my = 0; });
  let tOpen = 0, closing = false, tClose = 0, lift = 0;
  const clock = new THREE.Clock();
  const frame = () => {
    raf = requestAnimationFrame(frame); const dt = Math.min(clock.getDelta(), 0.05), t = clock.elapsedTime;
    let p, show;
    if (RM) { p = 1; show = closing ? 0 : 1; } else if (!closing) { tOpen += dt; p = clamp(tOpen / 1.9, 0, 1); show = clamp((tOpen - 1.55) / 0.7, 0, 1); } else { tClose += dt; show = clamp(1 - tClose / 0.45, 0, 1); p = clamp(1 - (tClose - 0.2) / 1.2, 0, 1); }
    pm.uniforms.uP.value = p; pm.uniforms.uAlpha.value = clamp(1 - show * 1.1, 0, 1) * (closing ? 1 : 1) + (closing && show > 0 ? 0 : 0);
    frontM.uniforms.uA.value = backM.uniforms.uA.value = show; slabM.opacity = show; outM.opacity = show * 0.9; coreM.opacity = show; w1M.opacity = show * 0.85; w2M.opacity = show * 0.7; glowM.opacity = show * (0.35 + lift * 0.4);
    lift += ((over ? 1 : 0) - lift) * Math.min(1, dt * 6);
    // hover: lift off the stage, tilt toward the pointer, foil follows; idle: a slow levitation
    const aspect = cam.aspect, base = Math.min(1.28, (aspect * 2 * 9.5 * Math.tan((FOV * Math.PI) / 360) * 0.78) / CW, 1.28);
    tilt.x += (mx * 0.6 * lift - tilt.x) * Math.min(1, dt * 6); tilt.y += (-my * 0.5 * lift - tilt.y) * Math.min(1, dt * 6);
    const bob = RM ? 0 : Math.sin(t * 0.9) * (0.06 + lift * 0.05);
    card.position.set(0, 0.15 + bob + lift * 0.18, lift * 0.7); card.scale.setScalar(base * (1 + lift * 0.05));
    card.rotation.set(tilt.y * 0.55 + (RM ? 0 : Math.sin(t * 0.5) * 0.03), tilt.x * 0.7 + (RM ? 0 : Math.sin(t * 0.37) * 0.08) + Math.PI * 0, 0);
    frontM.uniforms.uT.value = backM.uniforms.uT.value = t;
    glow.scale.set(1 - lift * 0.2, 1 - lift * 0.2, 1); glow.position.y = -2.55 * base - lift * 0.15;
    orb.rotation.y = t * 0.5; sh1.rotation.set(t * 0.4, t * 0.55, 0); sh2.rotation.set(-t * 0.6, t * 0.3, 0); orb.position.y = 1.0 + lift * 0.12;
    R.render(scene, cam);
  };
  return {
    size,
    start() { cancelAnimationFrame(raf); tOpen = 0; closing = false; tClose = 0; hintOff = false; hint.style.opacity = ''; size(); clock.getDelta(); frame(); },
    dissolve() { closing = true; tClose = 0; },
    RM,
  };
}

export function openStory(k = 0) {
  const el = document.getElementById('story'); if (!el) return;
  k = Math.max(0, Math.min(2, k | 0));
  const text = el.querySelector('#sy-text'), btn = el.querySelector('#sy-read');
  text.hidden = true; btn.setAttribute('aria-expanded', 'false'); btn.textContent = 'Read as text';
  if (!btn.dataset.bound) { btn.dataset.bound = '1'; btn.addEventListener('click', () => { const open = text.hidden; text.hidden = !open; btn.setAttribute('aria-expanded', String(open)); btn.textContent = open ? 'Hide the text' : 'Read as text'; requestAnimationFrame(() => S && S.size()); }); }
  if (!S) S = build(el);
  showOvl(el, () => { cancelAnimationFrame(raf); raf = 0; }, { ms: S.RM ? 0 : 1700, run: () => S.dissolve() });
  if (history.replaceState) history.replaceState(null, '', '#' + ['about', 'superpowers', 'projects'][k]);
  requestAnimationFrame(() => { S.start(); if (location.hash && location.hash !== '#about') { /* a direct link to a section shows the text for it */ } });
  if (k > 0 || (location.hash === '#superpowers' || location.hash === '#projects')) { text.hidden = false; btn.setAttribute('aria-expanded', 'true'); btn.textContent = 'Hide the text'; setTimeout(() => { const s = el.querySelector('#' + ['about', 'superpowers', 'projects'][k]); if (s) s.scrollIntoView({ block: 'start' }); }, 80); }
}
