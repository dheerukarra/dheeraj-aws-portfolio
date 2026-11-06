// Orb compass: a miniature of the main glass globe. Region labels float on it like on the main globe.
// Drag to spin it, or click a region or its label. The region facing you locks in and you fly there.
import * as THREE from 'three';

const SHORT = ['Education', 'AI agents', 'Projects', 'Testing', 'Skills and certifications', 'Hobby'];

export function initCompass(app) {
  const host = document.getElementById('compass');
  const cvs = document.createElement('canvas');
  host.appendChild(cvs);
  const lab = document.createElement('div');
  lab.className = 'clab';
  host.appendChild(lab);

  const R = new THREE.WebGLRenderer({ canvas: cvs, alpha: true, antialias: true });
  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(32, 1, 0.1, 50);
  cam.position.set(0, 0, 6.3);
  let lastW = 0;
  const size = () => { const s = cvs.clientWidth || 200; lastW = s; R.setPixelRatio(Math.min(devicePixelRatio, 2)); R.setSize(s, s, false); };
  size();
  addEventListener('resize', size);

  const N = app.CL.length;
  const DIRS = app.CL.map((c) => c.v.clone());
  const group = new THREE.Group();
  scene.add(group);

  const gm = app.CL.map((c) => new THREE.MeshBasicMaterial({ color: c.col, transparent: true, opacity: 0.18, depthWrite: false, side: THREE.DoubleSide }));
  const em = app.CL.map((c) => new THREE.LineBasicMaterial({ color: c.col, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false }));
  const pick = [];
  const base = new THREE.IcosahedronGeometry(1.5, 2).toNonIndexed();
  const pos = base.attributes.position;
  const A = new THREE.Vector3(), B = new THREE.Vector3(), C = new THREE.Vector3();
  for (let f = 0; f < pos.count; f += 3) {
    A.fromBufferAttribute(pos, f); B.fromBufferAttribute(pos, f + 1); C.fromBufferAttribute(pos, f + 2);
    const cen = A.clone().add(B).add(C).multiplyScalar(1 / 3), nrm = cen.clone().normalize();
    let ci = 0, best = -9;
    for (let k = 0; k < N; k++) { const v = nrm.dot(DIRS[k]); if (v > best) { best = v; ci = k; } }
    const g = new THREE.BufferGeometry();
    const pts = [A, B, C].map((v) => v.clone().sub(cen).multiplyScalar(0.94));
    g.setAttribute('position', new THREE.Float32BufferAttribute(pts.flatMap((p) => [p.x, p.y, p.z]), 3));
    const m = new THREE.Mesh(g, gm[ci]);
    m.position.copy(cen); m.userData.r = ci;
    m.add(new THREE.LineSegments(new THREE.EdgesGeometry(g), em[ci]));
    group.add(m); pick.push(m);
  }
  const core = new THREE.Mesh(new THREE.SphereGeometry(0.6, 24, 24), new THREE.MeshBasicMaterial({ color: 0xff6a1f }));
  group.add(core);
  const HOT = new THREE.Color(0xffc890), COOL = new THREE.Color(0xff6a1f);

  const Y = new THREE.Vector3(0, 1, 0), X = new THREE.Vector3(1, 0, 0), Z = new THREE.Vector3(0, 0, 1);
  const qq = new THREE.Quaternion(), qt = new THREE.Quaternion(), ray = new THREE.Raycaster(), mp = new THREE.Vector2(), tv = new THREE.Vector3();
  group.quaternion.setFromUnitVectors(DIRS[0], Z);
  let drag = false, moved = 0, lx = 0, ly = 0, vx = 0, vy = 0, lock = -1, cooldown = 0, preview = -1, homeHover = false;

  // floating region labels, positioned from each region's direction
  const tags = app.CL.map((c, i) => {
    const b = document.createElement('button');
    b.className = 'cl'; b.style.setProperty('--c', c.css); b.textContent = SHORT[i]; b.setAttribute('aria-label', 'Go to ' + c.name);
    b.addEventListener('click', () => { host.classList.remove('open'); go(i); });
    b.addEventListener('mouseenter', () => { preview = i; });
    b.addEventListener('mouseleave', () => { preview = -1; });
    const row = document.createElement('div'); row.className = 'crow'; row.style.top = 'calc(var(--t0, 12px) + var(--ts, 30px) * ' + (i + 1) + ')'; row.appendChild(b); host.appendChild(row); return b;
  });

  const homeTag = document.createElement('button');
  homeTag.className = 'cl'; homeTag.style.setProperty('--c', '#ff6a1f'); homeTag.textContent = 'Home'; homeTag.setAttribute('aria-label', 'Back to the main globe');
  homeTag.addEventListener('click', () => { host.classList.remove('open'); if (cooldown > 0) return; cooldown = 1.6; app.home(); });
  homeTag.addEventListener('mouseenter', () => { homeHover = true; });
  homeTag.addEventListener('mouseleave', () => { homeHover = false; });
  const homeRow = document.createElement('div'); homeRow.className = 'crow'; homeRow.style.top = 'var(--t0, 12px)'; homeRow.appendChild(homeTag); host.appendChild(homeRow);

  // Education and Projects slide their two children out to the left on hover.
  const slideOut = (tagIdx, items) => {
    const sub = document.createElement('div'); sub.className = 'csub';
    let subT = 0;
    const subOn = (on) => { clearTimeout(subT); if (on) { host.classList.add('sub'); sub.classList.add('show'); preview = tagIdx; } else subT = setTimeout(() => { sub.classList.remove('show'); if (!host.querySelector('.csub.show')) host.classList.remove('sub'); preview = -1; }, 220); };
    items.forEach(([name, css, idx]) => {
      const b = document.createElement('button'); b.className = 'cl'; b.style.setProperty('--c', css); b.textContent = name; b.setAttribute('aria-label', 'Go to ' + name);
      b.addEventListener('click', () => { host.classList.remove('open', 'sub'); sub.classList.remove('show'); go(idx); });
      sub.appendChild(b);
    });
    sub.addEventListener('mouseenter', () => subOn(true)); sub.addEventListener('mouseleave', () => subOn(false));
    tags[tagIdx].addEventListener('mouseenter', () => subOn(true)); tags[tagIdx].addEventListener('mouseleave', () => subOn(false));
    host.addEventListener('mouseleave', () => { host.classList.remove('sub'); sub.classList.remove('show'); });
    tags[tagIdx].parentNode.insertBefore(sub, tags[tagIdx]);
  };
  slideOut(0, [["Master's", '#5ec8ff', 6], ["Bachelor's", '#ff7ab8', 7]]);
  slideOut(2, [['Kalshi', '#ff6a1f', 8], ['shorts-engine', '#a58bff', 9]]);
  slideOut(4, [['Skills', '#f4c95d', 10], ['Certifications', '#4de0c8', 11]]);

  const rot = (ax, ay) => { qq.setFromAxisAngle(Y, ax); group.quaternion.premultiply(qq); qq.setFromAxisAngle(X, ay); group.quaternion.premultiply(qq); };
  const facing = () => { let bi = 0, bd = -2; DIRS.forEach((d, i) => { const w = d.clone().applyQuaternion(group.quaternion); if (w.z > bd) { bd = w.z; bi = i; } }); return { i: bi, dot: bd }; };
  const pickAt = (e) => {
    const r = cvs.getBoundingClientRect();
    mp.set(((e.clientX - r.left) / r.width) * 2 - 1, -(((e.clientY - r.top) / r.height) * 2 - 1));
    ray.setFromCamera(mp, cam);
    const h = ray.intersectObjects(pick, false)[0];
    return h ? h.object.userData.r : -1;
  };
  const go = (i) => { if (cooldown > 0 || i === app.cur()) return; cooldown = 1.6; app.enter(i); };
  // a clicked button keeps focus, and :focus-within kept the menu open after the cursor left. Drop focus after a click.
  host.addEventListener('click', () => { const a = document.activeElement; if (a && host.contains(a) && a !== document.body) a.blur(); });

  cvs.addEventListener('pointerdown', (e) => { cvs.setPointerCapture(e.pointerId); drag = true; moved = 0; lx = e.clientX; ly = e.clientY; vx = vy = 0; lock = -1; host.classList.add('grab'); });
  cvs.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const dx = e.clientX - lx, dy = e.clientY - ly; lx = e.clientX; ly = e.clientY; moved += Math.abs(dx) + Math.abs(dy);
    rot(dx * 0.022, dy * 0.022); vx = dx * 0.022 * 60; vy = dy * 0.022 * 60;
  });
  cvs.addEventListener('pointerup', (e) => {
    drag = false; host.classList.remove('grab');
    if (moved < 6) {
      if (matchMedia('(hover: none)').matches && !host.classList.contains('open')) { host.classList.add('open'); return; }
      const r = pickAt(e); if (r >= 0) { host.classList.remove('open'); go(r); } return;
    }
    const f = facing(); if (f.dot > 0.4 && f.i !== app.cur()) lock = f.i;
  });

  document.addEventListener('pointerdown', (e) => { if (!host.contains(e.target)) host.classList.remove('open'); });
  const panelEl = document.getElementById('panel');
  if (panelEl && window.ResizeObserver) new ResizeObserver(() => document.documentElement.style.setProperty('--pb', panelEl.offsetHeight + 'px')).observe(panelEl);
  const clock = new THREE.Clock();
  (function loop() {
    requestAnimationFrame(loop);
    const dt = Math.min(clock.getDelta(), 0.05), t = clock.elapsedTime;
    if (host.offsetWidth === 0) return;
    if (cvs.clientWidth !== lastW) size();
    cooldown = Math.max(0, cooldown - dt);
    const cur0 = app.cur(), cur = cur0 >= N ? (cur0 < 8 ? 0 : cur0 < 10 ? 2 : 4) : cur0, f = facing(), here = cur >= 0;
    if (!drag) {
      if (lock >= 0) {
        qt.setFromUnitVectors(DIRS[lock], Z); group.quaternion.slerp(qt, 1 - Math.exp(-9 * dt));
        if (group.quaternion.angleTo(qt) < 0.05) { const i = lock; lock = -1; go(i); }
      } else {
        rot(vx * dt, vy * dt); vx *= Math.exp(-3 * dt); vy *= Math.exp(-3 * dt);
        if (Math.hypot(vx, vy) < 0.35) {
          if (preview >= 0) { qt.setFromUnitVectors(DIRS[preview], Z); group.quaternion.slerp(qt, 1 - Math.exp(-6 * dt)); } else if (here) { qt.setFromUnitVectors(DIRS[cur], Z); group.quaternion.slerp(qt, 1 - Math.exp(-2.2 * dt)); } else rot(0.25 * dt, 0);
        }
      }
    }
    const active = homeHover ? -1 : (drag || lock >= 0 ? f.i : preview >= 0 ? preview : here ? cur : -1);
    for (let i = 0; i < N; i++) { const on = i === active; gm[i].opacity += ((on ? 0.5 : homeHover ? 0.06 : 0.13) - gm[i].opacity) * 0.15; em[i].opacity += ((on ? 1 : homeHover ? 0.2 : 0.45) - em[i].opacity) * 0.15; }
    core.scale.setScalar((1 + Math.sin(t * 2.4) * 0.05) * (homeHover ? 1.3 : 1)); core.material.color.lerp(homeHover ? HOT : COOL, 0.15);
    tags.forEach((b, i) => b.classList.toggle('on', i === active));
    const dest = drag || lock >= 0 ? (f.dot > 0.4 ? f.i : -1) : preview >= 0 ? preview : -1;
    lab.textContent = homeHover ? '→ Home' : dest >= 0 ? '→ ' + app.META[dest].name : cur0 >= 0 ? app.META[cur0].name : 'the model';
    lab.dataset.state = dest >= 0 ? 'go' : 'here';
    R.render(scene, cam);
  })();
}
