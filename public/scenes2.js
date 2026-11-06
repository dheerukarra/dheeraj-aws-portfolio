import * as THREE from 'three';
import { label, makeSparks, logo3d, typedLabel, FONT5, ach } from './common.js';

const MONO = '500 44px "JetBrains Mono", monospace';

// ---------------------------------------------------------------- 04 TESTING
// A holographic test wall. A scan beam sweeps it column by column, one zone per tool (Selenium, Cypress, Postman).
// Failing cells become tickets on a JIRA-style board and move Open -> In progress -> Done. When everything is green the
// wall lights up DRK. This is a live demo run, not real results.
export function qaScene() {
  const root = new THREE.Group(), wall = new THREE.Group(); root.add(wall);
  const GRN = 0x2fbf6a, RED = 0xff2d55, AMB = 0xffc766, W = 20, H = 12, N = W * H, P = 0.4;
  wall.position.set(-2.4, 0.5, 0); wall.rotation.y = 0.12;
  const sp = makeSparks(root, 500);
  const cells = new THREE.InstancedMesh(new THREE.BoxGeometry(0.33, 0.33, 1), new THREE.MeshBasicMaterial({ color: 0xffffff }), N); cells.frustumCulled = false; wall.add(cells);
  const frame = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.PlaneGeometry(W * P + 0.3, H * P + 0.3)), new THREE.LineBasicMaterial({ color: 0x7bd88f, transparent: true, opacity: 0.6 })); wall.add(frame);
  const beam = new THREE.Mesh(new THREE.PlaneGeometry(0.07, H * P + 0.5), new THREE.MeshBasicMaterial({ color: 0xb8ffd0, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false })); beam.position.z = 0.4; wall.add(beam);
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(0.9, H * P + 0.5), new THREE.MeshBasicMaterial({ color: 0x7bd88f, transparent: true, opacity: 0.12, blending: THREE.AdditiveBlending, depthWrite: false })); glow.position.z = 0.35; wall.add(glow);
  const cx = (c) => (c - (W - 1) / 2) * P, cy = (r) => ((H - 1) / 2 - r) * P;

  const L = (t, x, y, o) => { const s = label(t, o); s.position.set(x, y, 0); root.add(s); return s; };
  L('REGRESSION SUITE', 0.3, 4.6, { size: 0.7 });
  L('SELENIUM · CYPRESS · PLAYWRIGHT · TESTNG · POSTMAN · JIRA', 0.3, 3.85, { size: 0.3, color: '#7bd88f', font: MONO });
  // logo3d draws one logo-height below its anchor, so lift it back to centre
  const lg = (k, s) => { const w = new THREE.Group(), l = logo3d(k, s); l.position.y = s; w.add(l); return w; };
  // tool zones under the wall
  const ZX = [-5.4, -3.4, -1.4, 0.6], ZN = ['SELENIUM', 'CYPRESS', 'PLAYWRIGHT', 'POSTMAN'], ZK = ['selenium', 'cypress', null, 'postman'];
  const pwBadge = () => { const g = new THREE.Group(); g.add(new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.05, 10, 40), new THREE.MeshBasicMaterial({ color: 0x45ba4b }))); const t = label('PW', { size: 0.42, color: '#e8ffe9', font: '800 72px Syne, sans-serif' }); t.position.z = 0.05; g.add(t); return g; };
  const zl = ZX.map((x, i) => { const g = new THREE.Group(); g.add(ZK[i] ? lg(ZK[i], 0.6) : pwBadge()); g.position.set(x, -3.0, 0); root.add(g); const t = L(ZN[i], x, -3.75, { size: 0.3, color: '#c9ccd6', font: MONO }); return { g, t }; });
  L('TESTNG · JAVA', -2.4, -4.4, { size: 0.3, color: '#7bd88f', font: MONO });
  // JIRA-style board
  const BX = [2.95, 4.45, 5.95], BN = ['OPEN', 'IN PROGRESS', 'DONE'], BC = [RED, AMB, GRN];
  { const g = new THREE.Group(); g.add(lg('jira', 0.55)); g.position.set(3.15, 3.15, 0); root.add(g); L('JIRA BOARD', 4.75, 3.15, { size: 0.3, color: '#8fb4ff', font: MONO }); }
  BN.forEach((n, i) => { L(n, BX[i], 2.55, { size: 0.3, color: '#' + new THREE.Color(BC[i]).getHexString(), font: MONO }); const ln = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.02), new THREE.MeshBasicMaterial({ color: BC[i], transparent: true, opacity: 0.6 })); ln.position.set(BX[i], 2.3, 0); root.add(ln); });
  const mkTicket = (n) => {
    const c = document.createElement('canvas'); c.width = 192; c.height = 64; const x = c.getContext('2d'); x.fillStyle = '#0e121a'; x.fillRect(0, 0, 192, 64); x.strokeStyle = '#ffffff'; x.lineWidth = 3; x.strokeRect(2, 2, 188, 60); x.fillStyle = '#fff'; x.fillRect(2, 2, 10, 60);
    x.font = '700 28px "JetBrains Mono", monospace'; x.textBaseline = 'middle'; x.fillText('BUG-' + n, 26, 34);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  };
  const POOL = 14, tickets = Array.from({ length: POOL }, (_, i) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 0.44), new THREE.MeshBasicMaterial({ map: mkTicket(100 + i), transparent: true })); m.visible = false; root.add(m); return { m, bug: null }; });
  const letterCells = new Set(); { const x0 = Math.floor((W - 17) / 2), y0 = Math.floor((H - 5) / 2); 'DRK'.split('').forEach((ch, li) => FONT5[ch].forEach((row, r) => [...row].forEach((c, k) => { if (c === '1') letterCells.add((y0 + r) * W + (x0 + li * 6 + k)); }))); }
  const banner = typedLabel('ALL TESTS PASSED', { size: 0.5, color: '#7bd88f' }); banner.position.set(4.4, -3.0, 0); banner.visible = false; root.add(banner);

  const state = new Uint8Array(N), hgt = new Float32Array(N).fill(0.05), lurk = new Set(), bugs = [];
  let scanCol = 0, spelled = false, bT = 0, run = 1, caught = 0, passed = 0, wait = 0, done = false;
  const newRun = () => {
    state.fill(0); hgt.fill(0.05); lurk.clear(); bugs.length = 0; tickets.forEach((k) => { k.bug = null; k.m.visible = false; }); scanCol = 0; spelled = false; bT = 0; banner.visible = false; passed = 0; done = false;
    while (lurk.size < 7) lurk.add((Math.random() * N) | 0);
  };
  newRun();
  const dm = new THREE.Object3D(), col = new THREE.Color(), v3 = new THREE.Vector3();
  const cellWorld = (i) => { v3.set(cx(i % W), cy((i / W) | 0), 0); return root.worldToLocal(wall.localToWorld(v3)); };
  const openBug = (i, t) => {
    const k = tickets.find((x) => !x.bug) || tickets.reduce((a, b) => (a.bug.st === 2 && b.bug.st !== 2 ? a : a.bug.born < b.bug.born ? a : b));
    const bug = { i, st: 0, born: t, k }; k.bug = bug; bugs.push(bug); k.m.visible = true; k.m.position.copy(cellWorld(i)); k.m.scale.setScalar(0.3);
  };
  return {
    root, vo: 0.2, floor: -4.9, pool: 1.5, cam: { pos: new THREE.Vector3(0.3, 0.6, 16), look: new THREE.Vector3(0.3, 0.3, 0) },
    hintFor: () => 'Click: plant more bugs in the run · click again when it finishes to rerun',
    click() { if (done) { run++; newRun(); return; } const from = Math.floor(scanCol) + 2; for (let k = 0; k < 5 && from < W; k++) lurk.add(((Math.random() * H) | 0) * W + from + ((Math.random() * (W - from)) | 0)); },
    update(t, dt, p) {
      if (!done) {
        const before = Math.floor(scanCol); scanCol = Math.min(W, scanCol + dt * 2.6);
        for (let c = before; c < Math.floor(scanCol) && c < W; c++) for (let r = 0; r < H; r++) { const i = r * W + c; if (lurk.has(i)) { state[i] = 2; caught++; openBug(i, t); sp.burst(cellWorld(i), RED, 40, 3); } else { state[i] = 1; passed++; } }
        if (scanCol >= W) { done = true; wait = t; }
      }
      for (const b of bugs) {
        if (b.st === 0 && t - b.born > 0.9) b.st = 1;
        else if (b.st === 1 && t - b.born > 2.0) { b.st = 2; state[b.i] = 1; passed++; sp.burst(cellWorld(b.i), GRN, 30, 3); }
      }
      if (done && !spelled && bugs.every((b) => b.st === 2)) { spelled = true; letterCells.forEach((i) => (state[i] = 3)); banner.visible = true; ach('drk'); }
      if (spelled) { bT += dt; banner.reveal(Math.min(1, bT / 1.6)); if (t > wait + 9) { run++; newRun(); } }
      // cells
      const sc = Math.floor(scanCol);
      for (let i = 0; i < N; i++) {
        const c = i % W, target = state[i] === 0 ? 0.05 : state[i] === 1 ? 0.12 : state[i] === 3 ? 0.55 : 0.6;
        hgt[i] += (target - hgt[i]) * (1 - Math.exp(-9 * dt));
        dm.position.set(cx(c), cy((i / W) | 0), hgt[i] / 2); dm.scale.set(1, 1, hgt[i] * (state[i] === 2 ? 1 + 0.25 * Math.sin(t * 9) : 1)); dm.updateMatrix(); cells.setMatrixAt(i, dm.matrix);
        col.setHex(state[i] === 0 ? 0x2a3a52 : state[i] === 1 ? GRN : state[i] === 3 ? 0xd6ffe4 : RED);
        if (state[i] === 1) col.multiplyScalar(0.5 + 0.3 * Math.sin(t * 2 + i * 0.3));
        if (!done && c === sc) col.setHex(0xffffff);
        cells.setColorAt(i, col);
      }
      cells.instanceMatrix.needsUpdate = true; cells.instanceColor.needsUpdate = true;
      beam.position.x = glow.position.x = cx(0) + (Math.min(scanCol, W) - 0.5) * P; beam.visible = glow.visible = !done;
      const zone = Math.min(3, Math.floor((scanCol / W) * 4));
      zl.forEach((z, i) => { const on = !done && i === zone; z.g.scale.setScalar(on ? 1.3 : 1); z.t.material.opacity = on ? 1 : 0.5; });
      // tickets
      const rank = [0, 0, 0], slots = tickets.filter((k) => k.bug).sort((a, b) => a.bug.born - b.bug.born), colCount = [0, 0, 0];
      slots.forEach((k) => colCount[k.bug.st]++);
      slots.forEach((k) => {
        const s = k.bug.st, r = rank[s]++, from = colCount[s] - r - 1, y = 1.85 - (s === 2 ? from : r) * 0.55;
        k.m.visible = s < 2 || from < 6; v3.set(BX[s], y, 0); k.m.position.lerp(v3, 1 - Math.exp(-7 * dt)); k.m.scale.setScalar(k.m.scale.x + (1 - k.m.scale.x) * 0.15);
        k.m.material.color.setHex(BC[s]);
      });
      wall.rotation.y = 0.12 + p.x * 0.15; wall.rotation.x = -p.y * 0.06;
      sp.update(dt);
    },
    stat() { return `live demo · run #${run} · ${Math.min(passed, N)}/${N} passed · ${caught} bugs caught${spelled ? ' · DRK' : ''}`; },
  };
}
