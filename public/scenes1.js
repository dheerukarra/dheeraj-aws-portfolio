import * as THREE from 'three';
import { label, makeSparks, logo3d, typedLabel, ach } from './common.js';

const MONO = '500 44px "JetBrains Mono", monospace';

// ---------------------------------------------------------------- 02 AI AGENTS
// A prompt crystal feeds five coding agents. Their output runs a gauntlet of three gates:
// constraints, audit and regression. Hallucinations get caught at the audit gate. Play the gate yourself.
export function aiScene() {
  const root = new THREE.Group();
  root.position.x = -0.6;
  const sp = makeSparks(root, 700);
  const VIO = 0xa58bff, GRN = 0x7bd88f, RED = 0xff2d55, ORG = 0xff6a1f;
  const nodes = {};
  const wire = (geo, col, op = 0.9) => new THREE.LineSegments(new THREE.EdgesGeometry(geo), new THREE.LineBasicMaterial({ color: col, transparent: true, opacity: op }));
  const lbl = (t, x, y, col = '#c9ccd6') => { const l = label(t, { size: 0.3, font: MONO, color: col }); l.position.set(x, y, 0); root.add(l); return l; };

  // prompt crystal
  {
    const g = new THREE.IcosahedronGeometry(0.55, 1), m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: ORG })); m.position.set(-6.6, 0, 0); root.add(m);
    const shell = wire(new THREE.IcosahedronGeometry(0.95, 1), 0xffb27a, 0.7); shell.position.copy(m.position); root.add(shell);
    nodes.prompt = { m, ring: shell, p: m.position.clone(), flash: 0 }; lbl('PROMPT', -6.6, -1.5);
  }
  // five agents on a curved wall of hex tiles
  const AG = [['Claude Code', 'anthropic'], ['Cursor', null], ['Ollama', 'ollama'], ['Gemini CLI', 'googlegemini'], ['Kimi Code CLI', null]];
  const hexG = new THREE.CylinderGeometry(0.5, 0.5, 0.12, 6);
  AG.forEach(([name, ic], i) => {
    const y = 3.4 - i * 1.7, x = -3.9 + (1 - Math.abs(i - 2) / 2) * 0.8;
    const m = new THREE.Mesh(hexG, new THREE.MeshBasicMaterial({ color: 0x211a40, transparent: true, opacity: 0.95 })); m.rotation.x = Math.PI / 2; m.position.set(x, y, 0); root.add(m);
    const e = wire(hexG, VIO, 0.95); e.rotation.x = Math.PI / 2; e.position.copy(m.position); root.add(e);
    if (ic) { const lg = logo3d(ic, 0.4, '#ffffff'); lg.position.set(x, y + 0.4, 0.15); root.add(lg); } else { const t = label(name[0], { size: 0.5, color: '#ffffff', font: '800 72px Syne, sans-serif' }); t.position.set(x, y, 0.15); root.add(t); }
    lbl(name, x, y - 0.85);
    nodes['a' + i] = { m, ring: e, p: m.position.clone(), flash: 0, name };
  });
  // three gates and the shipped gem
  const gate = (key, x, text, r) => {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(r, 0.07, 12, 72, 4.7), new THREE.MeshBasicMaterial({ color: GRN }));     const base = new THREE.Mesh(new THREE.TorusGeometry(r * 1.12, 0.018, 8, 90), new THREE.MeshBasicMaterial({ color: GRN, transparent: true, opacity: 0.4 }));     const disc = new THREE.Mesh(new THREE.CircleGeometry(r * 0.96, 40), new THREE.MeshBasicMaterial({ color: GRN, transparent: true, opacity: 0.07, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false })); const grp = new THREE.Group(); grp.position.set(x, 0, 0); grp.rotation.y = 0.95; grp.add(ring, base, disc); root.add(grp); lbl(text, x, -r - 0.6);
    nodes[key] = { m: ring, ring: disc, p: grp.position.clone(), flash: 0, gate: true };
  };
  gate('g0', -0.4, 'CONSTRAINTS', 1.05); gate('g1', 2.2, 'AUDIT', 1.3); gate('g2', 4.8, 'REGRESSION', 1.05);
  {
    const g = new THREE.OctahedronGeometry(0.62, 0), m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: ORG })); m.position.set(7.5, 0, 0); root.add(m);
    const shell = wire(new THREE.OctahedronGeometry(1.0, 0), 0xffb27a, 0.7); shell.position.copy(m.position); root.add(shell);
    nodes.out = { m, ring: shell, p: m.position.clone(), flash: 0 }; lbl('SHIPPED', 7.5, -1.55);
  }
  // wiring: prompt -> agents -> constraints, plus a glowing axis through the gates
  const segs = []; AG.forEach((_, i) => { segs.push(nodes.prompt.p, nodes['a' + i].p, nodes['a' + i].p, nodes.g0.p); });
  root.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(segs), new THREE.LineBasicMaterial({ color: VIO, transparent: true, opacity: 0.22 })));
  const axis = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 7.9, 8), new THREE.MeshBasicMaterial({ color: GRN, transparent: true, opacity: 0.45, blending: THREE.AdditiveBlending, depthWrite: false })); axis.rotation.z = Math.PI / 2; axis.position.set(3.55, 0, 0); root.add(axis);
  const halo1 = new THREE.Mesh(new THREE.TorusGeometry(6.2, 0.012, 6, 140), new THREE.MeshBasicMaterial({ color: VIO, transparent: true, opacity: 0.18 })); halo1.position.set(0.6, 0, -3.2); halo1.rotation.x = 1.2; root.add(halo1);
  const halo2 = new THREE.Mesh(new THREE.TorusGeometry(7.6, 0.012, 6, 140), new THREE.MeshBasicMaterial({ color: ORG, transparent: true, opacity: 0.12 })); halo2.position.set(0.6, 0, -3.6); halo2.rotation.x = 1.0; halo2.rotation.y = 0.4; root.add(halo2);
  const title = label('DIRECTING AGENTS, NOT TRUSTING THEM', { size: 0.5 }); title.position.set(0.4, 4.9, 0); root.add(title);

  // live pipeline log
  const LG = { c: document.createElement('canvas'), logs: [], T: null }; LG.c.width = 512; LG.c.height = 256; LG.x = LG.c.getContext('2d'); LG.T = new THREE.CanvasTexture(LG.c); LG.T.colorSpace = THREE.SRGBColorSpace;
  const logPlane = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 2.1), new THREE.MeshBasicMaterial({ map: LG.T, transparent: true })); logPlane.position.set(5.1, 2.9, 0); root.add(logPlane);
  const addLog = (s, c) => { LG.logs.push([s, c]); if (LG.logs.length > 8) LG.logs.shift(); };
  const drawLog = () => {
    const c = LG.x; c.fillStyle = 'rgba(8,8,18,.9)'; c.fillRect(0, 0, 512, 256); c.strokeStyle = '#a58bff'; c.lineWidth = 3; c.strokeRect(2, 2, 508, 252);
    c.fillStyle = '#a58bff'; c.font = '600 22px "JetBrains Mono", monospace'; c.fillText('PIPELINE LOG', 16, 34);
    c.font = '500 19px "JetBrains Mono", monospace';
    LG.logs.forEach(([s, col], i) => { c.globalAlpha = 0.35 + 0.65 * ((i + 1) / LG.logs.length); c.fillStyle = col; c.fillText(s, 16, 66 + i * 23); }); c.globalAlpha = 1; LG.T.needsUpdate = true;
  };
  addLog('› pipeline ready', '#8b93a7');

  const MAX = 90;
  const core = new THREE.InstancedMesh(new THREE.SphereGeometry(0.11, 12, 12), new THREE.MeshBasicMaterial({ color: 0xffffff }), MAX);
  const halo = new THREE.InstancedMesh(new THREE.SphereGeometry(0.11, 12, 12), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.22, blending: THREE.AdditiveBlending, depthWrite: false }), MAX);
  core.frustumCulled = halo.frustumCulled = false; root.add(core, halo);
  const pk = [], dm = new THREE.Object3D(), col = new THREE.Color();
  let spawnT = 0, shipped = 0, caught = 0, game = false, tp = 0, fp = 0, fn = 0, tn = 0, shippedBad = 0, bannerT = -1, lT = 0;
  const banner = typedLabel('SHIPPED BY DHEERAJ REDDY KARRA', { size: 0.55 }); banner.position.set(3.4, -3.7, 0); banner.visible = false; root.add(banner);
  const spawn = (bad) => {
    if (pk.length >= MAX) return;
    const a = (Math.random() * AG.length) | 0; nodes['a' + a].flash = 1;
    addLog('› prompt → ' + AG[a][0] + (bad ? ' (hallucinating)' : ''), bad ? '#ff7a90' : '#c9ccd6');
    pk.push({ path: [nodes.prompt.p, nodes['a' + a].p, nodes.g0.p, nodes.g1.p, nodes.g2.p, nodes.out.p], s: 0, bad, speed: 0.55 + Math.random() * 0.25, logged: 0 });
  };
  const zero = new THREE.Vector3(0, -999, 0);
  return {
    root, floor: -4.6, pool: 1.6, cam: { pos: new THREE.Vector3(0.6, 0.4, 19), look: new THREE.Vector3(0.6, 0.2, 0) },
    action: { label: () => (game ? 'Stop the game' : 'Play: be the audit gate'), fn() { game = !game; tp = fp = fn = tn = shippedBad = 0; pk.length = 0; addLog(game ? '› you are the audit gate' : '› back to autopilot', '#ffc766'); } },
    hintFor: () => (game ? 'Click to REJECT the packet waiting at the audit gate' : 'Click to send a hallucination through the pipeline'),
    click() {
      if (!game) { spawn(true); nodes.prompt.flash = 1; sp.burst(nodes.prompt.p, RED, 50, 3); return; }
      const q = pk.find((x) => x.held && !x.done);
      if (q) { q.done = true; q.dead = true; if (q.bad) { tp++; ach('gatekeeper'); addLog('✗ rejected: hallucination', '#7bd88f'); } else { fp++; addLog('✗ rejected a good one', '#ffc766'); } nodes.g1.flash = 1; sp.burst(nodes.g1.p, q.bad ? GRN : ORG, 60, 4); }
    },
    update(t, dt, p) {
      spawnT -= dt;
      if (spawnT < 0) { spawnT = game ? 0.95 : 0.5; spawn(Math.random() < (game ? 0.32 : 0.12)); }
      for (let i = pk.length - 1; i >= 0; i--) {
        const q = pk[i];
        if (q.dead) { pk.splice(i, 1); continue; }
        if (game && !q.done && q.s >= 3) {
          q.s = 3; q.held = true; q.t0 ??= t;
          if (t - q.t0 > 1.7) { q.done = true; q.held = false; if (q.bad) { fn++; } else tn++; }
          continue;
        }
        q.s += q.speed * dt * 1.6;
        const idx = Math.floor(q.s);
        if (!game && q.bad && q.s >= 3) { caught++; addLog('✗ audit: hallucination caught', '#7bd88f'); nodes.g1.flash = 1; sp.burst(nodes.g1.p, RED, 90, 5); pk.splice(i, 1); continue; }
        if (idx >= q.path.length - 1) { if (q.bad) { shippedBad++; addLog('! a bug shipped', '#ff7a90'); nodes.out.flash = 1; sp.burst(nodes.out.p, RED, 60, 4); } else { shipped++; if (shipped % 3 === 0) addLog('✓ shipped (' + shipped + ')', '#ff9a5c'); nodes.out.flash = 1; sp.burst(nodes.out.p, ORG, 14, 2); } pk.splice(i, 1); continue; }
      }
      if (shipped >= 12 && bannerT < 0) { bannerT = 0; banner.visible = true; }
      if (bannerT >= 0) { bannerT += dt; banner.reveal(Math.min(1, bannerT / 2.4)); }
      for (let i = 0; i < MAX; i++) {
        const q = pk[i];
        if (!q) { dm.position.copy(zero); dm.scale.set(1, 1, 1); } else {
          const idx = Math.min(q.path.length - 2, Math.floor(q.s)), f = q.s - idx;
          dm.position.lerpVectors(q.path[idx], q.path[idx + 1], f); dm.position.y += Math.sin(q.s * 6 + i) * 0.06;
          dm.scale.setScalar(q.held ? 2 + Math.sin(t * 12) * 0.3 : q.bad ? 1.5 : 1);
          col.set(q.bad ? RED : q.held ? 0xffffff : 0xd8ccff); core.setColorAt(i, col); halo.setColorAt(i, col);
        }
        dm.updateMatrix(); core.setMatrixAt(i, dm.matrix);
        dm.scale.multiplyScalar(3.2); dm.updateMatrix(); halo.setMatrixAt(i, dm.matrix);
      }
      core.instanceMatrix.needsUpdate = halo.instanceMatrix.needsUpdate = true;
      if (core.instanceColor) core.instanceColor.needsUpdate = halo.instanceColor.needsUpdate = true;
      for (const k in nodes) {
        const n = nodes[k]; n.flash *= Math.exp(-3 * dt);
        if (n.gate) { n.m.rotation.z = t * (k === 'g1' ? -0.9 : 0.7) + (k === 'g2' ? 1 : 0); n.m.scale.setScalar(1 + n.flash * 0.25); n.ring.material.opacity = 0.07 + n.flash * 0.25; n.m.material.color.setHex(n.flash > 0.2 && k === 'g1' ? RED : GRN); }
        else { n.m.scale.setScalar(1 + n.flash * 0.45); n.ring.scale.setScalar(1 + Math.sin(t * 1.5 + n.p.x) * 0.04 + n.flash * 0.3); if (k === 'prompt' || k === 'out') { n.m.rotation.y = t * 0.8; n.m.rotation.x = t * 0.4; n.ring.rotation.y = -t * 0.5; } }
      }
      halo1.rotation.z = t * 0.05; halo2.rotation.z = -t * 0.04;
      lT += dt; if (lT > 0.1) { lT = 0; drawLog(); }
      root.rotation.y = p.x * 0.18; root.rotation.x = -p.y * 0.08;
      sp.update(dt);
    },
    stat() {
      if (!game) return `shipped ${shipped} · hallucinations caught ${caught}`;
      const pr = tp + fp ? tp / (tp + fp) : 0, rc = tp + fn ? tp / (tp + fn) : 0, f1 = pr + rc ? (2 * pr * rc) / (pr + rc) : 0;
      return `confusion · TP ${tp} · FP ${fp} · FN ${fn} · TN ${tn}<br>precision ${(pr * 100).toFixed(0)}% · recall ${(rc * 100).toFixed(0)}% · F1 ${(f1 * 100).toFixed(0)}%${shippedBad ? ' · bugs shipped ' + shippedBad : ''}`;
    },
  };
}
