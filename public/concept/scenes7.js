import * as THREE from 'three';
import { label, makeSparks, logo3d } from './common.js';

const MONO = '500 44px "JetBrains Mono", monospace';
// logo3d draws one logo-height below its anchor; lift it back so it sits centred on the anchor
const lg = (k, s) => { const w = new THREE.Group(), l = logo3d(k, s); l.position.y = s; w.add(l); return w; };

// ---------------------------------------------------------------- SKILLS: THE SKILL ATOM
// 41 skills, each an electron on its own orbit around a glowing core. Nothing is grouped.
const SKILLS = [
  ['Prompt Engineering'], ['AI-Assisted Development'], ['Code Generation'], ['Rapid Prototyping'], ['Debugging with AI'], ['Claude Code CLI', 'anthropic'], ['Ollama', 'ollama'], ['Gemini CLI', 'googlegemini'], ['Kimi Code CLI'], ['Cursor'], ['Antigravity'],
  ['Selenium', 'selenium'], ['Cypress', 'cypress'], ['TestNG'], ['Postman', 'postman'], ['API Testing'], ['Manual Testing'], ['Automation Testing'], ['Quality Assurance'], ['JIRA', 'jira'],
  ['Python', 'python'], ['Pandas', 'pandas'], ['NumPy', 'numpy'], ['Matplotlib'], ['Data Analysis'], ['Data Cleaning'], ['Tableau', 'tableau'],
  ['Java', 'openjdk'], ['SQL'], ['HTML', 'html5'], ['CSS', 'css3'], ['Bootstrap', 'bootstrap'], ['MySQL', 'mysql'], ['PostgreSQL', 'postgresql'], ['Oracle', 'oracle'], ['MongoDB', 'mongodb'], ['Git', 'git'], ['GitHub', 'github'], ['Agile'], ['Scrum'], ['TDD'],
];

export function skillsAtomScene() {
  const root = new THREE.Group(), sp = makeSparks(root, 400), N = SKILLS.length;
  // nucleus
  const core = new THREE.Mesh(new THREE.SphereGeometry(0.75, 32, 32), new THREE.MeshBasicMaterial({ color: 0xfff0c2 })); root.add(core);
  const shell = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(1.25, 1)), new THREE.LineBasicMaterial({ color: 0xf4c95d, transparent: true, opacity: 0.8 })); root.add(shell);
  const wave = new THREE.Mesh(new THREE.RingGeometry(0.95, 1.0, 64), new THREE.MeshBasicMaterial({ color: 0xf4c95d, transparent: true, opacity: 0, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false })); root.add(wave);
  const glow = new THREE.Mesh(new THREE.SphereGeometry(1.7, 24, 24), new THREE.MeshBasicMaterial({ color: 0xf4c95d, transparent: true, opacity: 0.12, blending: THREE.AdditiveBlending, depthWrite: false })); root.add(glow);
  // electrons: each on its own orbit (radius, tilt, yaw, speed and direction all differ)
  const els = [], halos = [], col = new THREE.Color();
  SKILLS.forEach(([name, logo], k) => {
    const p = (k * 17) % N, r = 2.5 + (p / (N - 1)) * 5.2, eu = new THREE.Euler((((k * 37) % N) / N - 0.5) * 2.2, k * 2.399963, 0);
    const ring = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(Array.from({ length: 96 }, (_, i) => new THREE.Vector3(Math.cos((i / 96) * 6.2832) * r, 0, Math.sin((i / 96) * 6.2832) * r))), new THREE.LineBasicMaterial({ color: 0xf4c95d, transparent: true, opacity: 0.07 }));
    ring.rotation.copy(eu); root.add(ring);
    col.setHSL((k * 0.61803) % 1, 0.65, 0.68);
    const g = new THREE.Group(); root.add(g);
    const dot = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 12), new THREE.MeshBasicMaterial({ color: col.clone() })); g.add(dot);
    const halo = new THREE.Mesh(new THREE.SphereGeometry(0.3, 12, 12), new THREE.MeshBasicMaterial({ color: col.clone(), transparent: true, opacity: 0.2, blending: THREE.AdditiveBlending, depthWrite: false })); halo.userData.k = k; g.add(halo); halos.push(halo);
    let lw = null; if (logo) { lw = new THREE.Group(); lw.add(lg(logo, 0.5)); g.add(lw); }
    const lb = label(name, { size: 0.3, color: '#' + col.getHexString(), font: MONO }); lb.position.set(0, -0.45, 0); g.add(lb);
    els.push({ g, halo, lb, lw, r, eu, a: k * 2.4, w: ((k % 2) * 2 - 1) * (0.9 / Math.sqrt(r)) * (0.8 + ((k * 7) % 5) * 0.06), pos: new THREE.Vector3(), name });
  });
  const ray = new THREE.Raycaster(), v2 = new THREE.Vector2(), qr = new THREE.Quaternion();
  let hover = -1, boost = 0, waveT = 0;
  return {
    root, vo: 0.1, floor: -5.4, pool: 1.8, cam: { pos: new THREE.Vector3(0, 1.0, 13.5), look: new THREE.Vector3(0, 0, 0) },
    hintFor: () => 'Hover a skill to single it out · click to excite the atom',
    click() { boost = 1; waveT = 1; sp.burst(new THREE.Vector3(0, 0, 0), 0xf4c95d, 160, 7); },
    update(t, dt, p) {
      root.rotation.y += dt * 0.05; root.rotation.x = 0.28 - p.y * 0.12; root.rotation.z = p.x * 0.05;
      boost *= Math.exp(-1.6 * dt); const spd = 1 + boost * 3.5; waveT = Math.max(0, waveT - dt * 0.7);
      const cam = window.__app && window.__app.cam; if (cam) root.getWorldQuaternion(qr).invert().multiply(cam.quaternion);
      els.forEach((e, k) => {
        e.a += dt * e.w * spd; e.pos.set(Math.cos(e.a) * e.r, 0, Math.sin(e.a) * e.r).applyEuler(e.eu); e.g.position.copy(e.pos);
        if (e.lw && cam) e.lw.quaternion.copy(qr);
        const on = hover === k;
        e.halo.scale.setScalar(on ? 1.9 : 1); e.lb.material.opacity += ((on ? 1 : hover >= 0 ? 0.4 : 0.8) - e.lb.material.opacity) * 0.2; if (e.lw) e.lw.scale.setScalar(on ? 1.5 : 1);
      });
      if (cam) { root.updateMatrixWorld(true); v2.set(p.x, p.y); ray.setFromCamera(v2, cam); const h = ray.intersectObjects(halos, false)[0]; hover = h ? h.object.userData.k : -1; }
      core.scale.setScalar(1 + Math.sin(t * 2.2) * 0.06 + boost * 0.3); shell.rotation.y = t * 0.5; shell.rotation.x = t * 0.3; glow.scale.setScalar(1 + boost * 0.5);
      wave.scale.setScalar(1 + (1 - waveT) * 9); wave.material.opacity = waveT * 0.6; wave.rotation.x = Math.PI / 2;
      sp.update(dt);
    },
    stat() { return hover >= 0 ? els[hover].name : N + ' skills · each on its own orbit'; },
  };
}
