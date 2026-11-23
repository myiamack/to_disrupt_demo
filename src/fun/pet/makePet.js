/* =====================================================================
   Mini Pet: Myia's heroine as a draggable desktop buddy.
   Behaviors adapted from the Signal study buddy (drag, lean, hang,
   tap menu, hold-to-charge beam, idle moves, gaze, entrance), redrawn
   as her character with original gift-powered moves.
   ===================================================================== */
export function makePet(root, store) {
  const SW = 56, SH = 62, SC = 3;            // sprite buffer + screen scale
  const PW = SW * SC, PH = SH * SC;          // pet size on screen (168 x 156)
  const OX = 8, OY = 18;                      // shift from the original 40x44 rig

  /* ---------- palette (her design) ---------- */
  const P = {
    skin: '#8a5a3c', skinL: '#a46c48', skinD: '#6b412a',
    hair: '#24160f', hairL: '#4a3322', hairD: '#120a06',
    gold: '#f6b93b', goldD: '#c98a1a', goldL: '#ffe08a',
    top: '#7a4a2a', topD: '#5a341f', topL: '#97633b',
    k1: '#f2a900', k2: '#1f8a3b', k3: '#d6312b', k4: '#1d4fa3',
    boot: '#3a2216', bootL: '#5c3b25',
    eye: '#ffffff', pupil: '#1a0f0a', lip: '#6e3322', mouth: '#3a0d1a', tongue: '#ff6fae',
    heart: '#ff6fae', ki: '#ffe08a', kiW: '#ffffff', aura: '#f6b93b', aura2: '#ffffff',
  };
  // names the shared arm code uses
  P.gi = P.skin; P.giD = P.skinD; P.giL = P.skinL; P.wrist = P.gold;
  P.pants = P.skin; P.pantsD = P.skinD; P.band = P.tongue;
  const KENTE = [P.k1, P.k2, P.k1, P.k3, P.k1, P.k4, P.k2, P.k3];

  const R = (c, x, y, w, h, col) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), w, h); };
  const reduced = (() => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } })();
  function buf(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); x.imageSmoothingEnabled = false; return [c, x]; }
  const [SB, sx] = buf(SW, SH), [SS, ssx] = buf(SW, SH);
  function outline(dst, x, y, scale) {
    scale = scale || 1; ssx.clearRect(0, 0, SW, SH); ssx.drawImage(SB, 0, 0);
    ssx.globalCompositeOperation = 'source-in'; ssx.fillStyle = '#0b0618'; ssx.fillRect(0, 0, SW, SH); ssx.globalCompositeOperation = 'source-over';
    dst.imageSmoothingEnabled = false;
    [[-1, 0], [1, 0], [0, -1], [0, 1]].forEach(([dx, dy]) => dst.drawImage(SS, Math.round(x + dx * scale), Math.round(y + dy * scale), SW * scale, SH * scale));
    dst.drawImage(SB, Math.round(x), Math.round(y), SW * scale, SH * scale);
  }
  const disk = (c, cx, cy, rx, ry, col, fromY, toY) => {
    for (let dy = -ry; dy <= ry; dy++) {
      if (fromY != null && dy < fromY) continue; if (toY != null && dy > toY) continue;
      const w = Math.floor(rx * Math.sqrt(Math.max(0, 1 - (dy / ry) * (dy / ry))));
      R(c, cx - w, cy + dy, w * 2 + 1, 1, col);
    }
  };

  /* ---------- front-facing sprite ---------- */
  function front(s, f) {
    if (s.side === 'lean') return sideLean(s, f);
    const c = sx; c.clearRect(0, 0, SW, SH);
    const ox = 4 + OX, oy = 2 + OY + (s.y || 0);
    const L = s.legs || 'stand';
    const sq0 = L === 'squash' ? 3 : 0, sit0 = L === 'sit' ? 2 : 0, ty0 = oy + 18 + sq0 + sit0;
    if (s.item === 'cape') { // kente cape behind her
      for (let i = 0; i < 20; i++) R(c, ox + 6 + i, ty0, 1, 16 + (i % 3 === 0 ? 1 : 0), KENTE[i % 8]);
      R(c, ox + 6, ty0, 20, 1, P.gold);
    }
    // legs + boots
    if (L === 'sit') { R(c, ox + 5, oy + 30, 22, 5, P.skin); R(c, ox + 5, oy + 33, 22, 2, P.skinD); R(c, ox + 3, oy + 33, 5, 3, P.boot); R(c, ox + 24, oy + 33, 5, 3, P.boot); }
    else if (L === 'dangle') { const k = reduced ? 0 : Math.round(Math.sin(f / 4) * 2); R(c, ox + 11, oy + 28, 4, 9 + k, P.skinD); R(c, ox + 17, oy + 28, 4, 9 - k, P.skin); R(c, ox + 10, oy + 35 + k, 5, 4, P.boot); R(c, ox + 17, oy + 35 - k, 5, 4, P.boot); }
    else if (L === 'jump') { R(c, ox + 10, oy + 28, 5, 6, P.skinD); R(c, ox + 17, oy + 28, 5, 6, P.skin); R(c, ox + 9, oy + 32, 6, 4, P.boot); R(c, ox + 17, oy + 32, 6, 4, P.boot); }
    else if (L === 'squash') { R(c, ox + 10, oy + 31, 5, 5, P.skinD); R(c, ox + 17, oy + 31, 5, 5, P.skin); R(c, ox + 8, oy + 35, 7, 4, P.boot); R(c, ox + 17, oy + 35, 7, 4, P.boot); }
    else if (L === 'walkA') { R(c, ox + 11, oy + 28, 4, 7, P.skinD); R(c, ox + 17, oy + 28, 4, 9, P.skin); R(c, ox + 10, oy + 33, 5, 4, P.boot); R(c, ox + 17, oy + 35, 5, 4, P.boot); }
    else if (L === 'walkB') { R(c, ox + 11, oy + 28, 4, 9, P.skinD); R(c, ox + 17, oy + 28, 4, 7, P.skin); R(c, ox + 10, oy + 35, 5, 4, P.boot); R(c, ox + 17, oy + 33, 5, 4, P.boot); }
    else if (L === 'wide') { R(c, ox + 9, oy + 28, 4, 9, P.skinD); R(c, ox + 19, oy + 28, 4, 9, P.skin); R(c, ox + 7, oy + 35, 6, 4, P.boot); R(c, ox + 19, oy + 35, 6, 4, P.boot); R(c, ox + 7, oy + 35, 6, 1, P.bootL); R(c, ox + 19, oy + 35, 6, 1, P.bootL); }
    else { R(c, ox + 11, oy + 28, 4, 9, P.skinD); R(c, ox + 17, oy + 28, 4, 9, P.skin); R(c, ox + 10, oy + 35, 5, 4, P.boot); R(c, ox + 17, oy + 35, 5, 4, P.boot); R(c, ox + 10, oy + 35, 5, 1, P.bootL); R(c, ox + 17, oy + 35, 5, 1, P.bootL); }
    const sq = L === 'squash' ? 3 : 0, sitY = L === 'sit' ? 2 : 0;
    const ty = oy + 18 + sq + sitY;

    // torso: leather top, bead necklace, kente sash, bare middle, gold belt, kente skirt
    R(c, ox + 9, ty, 14, 6, P.top); R(c, ox + 9, ty, 2, 6, P.topD); R(c, ox + 21, ty, 2, 6, P.topL);
    for (let i = 0; i < 8; i++) R(c, ox + 12 + i, ty + (i === 0 || i === 7 ? 0 : 1), 1, 1, i % 2 ? P.gold : KENTE[i]);
    R(c, ox + 10, ty + 1, 1, 1, P.k1); R(c, ox + 11, ty + 2, 1, 1, P.k2); R(c, ox + 12, ty + 3, 1, 1, P.k3); R(c, ox + 13, ty + 4, 1, 1, P.k1); R(c, ox + 14, ty + 5, 1, 1, P.k4);
    R(c, ox + 10, ty + 6, 12, 2, P.skin); R(c, ox + 10, ty + 7, 12, 1, P.skinD);
    R(c, ox + 9, ty + 8, 14, 2, P.gold); R(c, ox + 9, ty + 9, 14, 1, P.goldD); R(c, ox + 15, ty + 8, 2, 2, P.goldL);
    if (L !== 'sit') {
      R(c, ox + 9, ty + 10, 14, 5, P.top); R(c, ox + 9, ty + 10, 2, 5, P.topD);
      [P.k1, P.k2, P.k1, P.k3, P.k1].forEach((col, i) => R(c, ox + 14, ty + 10 + i, 4, 1, col));
      R(c, ox + 14, ty + 10, 1, 5, P.k4); R(c, ox + 9, ty + 14, 14, 1, P.gold);
    }

    // head + afro
    const hx = ox + 11 + (s.tilt || 0), hy = oy + 7 + sq + sitY;
    disk(c, hx + 5, hy - 1, 15, 13, P.hair, -13, 10);
    // bumpy curly outline + texture + highlights
    for (let k = 0; k < 16; k++) { const a = Math.PI + k / 15 * Math.PI; R(c, hx + 5 + Math.round(Math.cos(a) * 15), hy - 1 + Math.round(Math.sin(a) * 13), 2, 2, P.hair); }
    for (let k = 0; k < 34; k++) {
      const a = k * 2.39, r = 5 + (k * 7) % 9;
      R(c, hx + 5 + Math.round(Math.cos(a) * r), hy - 2 + Math.round(Math.sin(a) * r * 0.85), 1, 1, k % 3 ? P.hairD : P.hairL);
    }
    R(c, hx - 5, hy - 10, 4, 1, P.hairL); R(c, hx - 7, hy - 7, 1, 3, P.hairL); R(c, hx - 2, hy - 12, 3, 1, P.hairL); R(c, hx + 12, hy - 10, 2, 1, P.hairL);
    // face
    R(c, hx, hy, 10, 10, P.skin); R(c, hx, hy + 7, 10, 3, P.skinL); R(c, hx + 1, hy + 9, 8, 1, P.skinL);
    // eyes (big anime eyes with lashes)
    const E = s.eyes || 'open', blink = (!reduced && E === 'open' && f % 150 < 5);
    const eye = (x, look) => { R(c, x, hy + 4, 3, 3, P.eye); R(c, x + look, hy + 4, 2, 3, P.pupil); R(c, x + look, hy + 4, 1, 1, '#fff'); R(c, x - 1, hy + 3, 4, 1, P.pupil); };
    if (blink || E === 'closed') { R(c, hx + 1, hy + 5, 3, 1, P.pupil); R(c, hx + 6, hy + 5, 3, 1, P.pupil); }
    else if (E === 'happy') { [[1, 5], [2, 4], [3, 5], [6, 5], [7, 4], [8, 5]].forEach(([a, b]) => R(c, hx + a, hy + b, 1, 1, P.pupil)); }
    else if (E === 'angry') { R(c, hx + 1, hy + 5, 3, 2, P.eye); R(c, hx + 6, hy + 5, 3, 2, P.eye); R(c, hx + 2, hy + 5, 1, 2, P.pupil); R(c, hx + 7, hy + 5, 1, 2, P.pupil); R(c, hx + 1, hy + 3, 1, 1, P.hair); R(c, hx + 2, hy + 4, 2, 1, P.hair); R(c, hx + 8, hy + 3, 1, 1, P.hair); R(c, hx + 6, hy + 4, 2, 1, P.hair); }
    else if (E === 'swirl') { [hx + 1, hx + 6].forEach(x => { R(c, x, hy + 4, 3, 3, P.eye); R(c, x, hy + 4, 1, 1, P.pupil); R(c, x + 2, hy + 4, 1, 1, P.pupil); R(c, x + 1, hy + 5, 1, 1, P.pupil); R(c, x, hy + 6, 1, 1, P.pupil); R(c, x + 2, hy + 6, 1, 1, P.pupil); }); }
    else if (E === 'wink') { eye(hx + 1, 1); R(c, hx + 6, hy + 5, 3, 1, P.pupil); }
    else if (E === 'sleepy') { R(c, hx + 1, hy + 5, 3, 2, P.eye); R(c, hx + 6, hy + 5, 3, 2, P.eye); R(c, hx + 1, hy + 4, 3, 2, P.skin); R(c, hx + 6, hy + 4, 3, 2, P.skin); R(c, hx + 2, hy + 6, 1, 1, P.pupil); R(c, hx + 7, hy + 6, 1, 1, P.pupil); }
    else if (E === 'focus') { R(c, hx + 1, hy + 4, 3, 2, P.eye); R(c, hx + 6, hy + 4, 3, 2, P.eye); R(c, hx + 2, hy + 4, 1, 2, P.pupil); R(c, hx + 7, hy + 4, 1, 2, P.pupil); }
    else if (E === 'wide') { R(c, hx + 1, hy + 3, 3, 4, P.eye); R(c, hx + 6, hy + 3, 3, 4, P.eye); R(c, hx + 2, hy + 4, 1, 2, P.pupil); R(c, hx + 7, hy + 4, 1, 2, P.pupil); }
    else if (s.gaze && E === 'open') { const g = s.gaze; [hx + 1, hx + 6].forEach(x => { R(c, x, hy + 4, 3, 3, P.eye); R(c, x + Math.min(g.x, 1), hy + 4 + g.y, 2, 2, P.pupil); R(c, x + Math.min(g.x, 1), hy + 4 + g.y, 1, 1, '#fff'); R(c, x - 1, hy + 3, 4, 1, P.pupil); }); }
    else { const lk = E === 'left' ? 0 : E === 'right' ? 1 : (s.look != null ? Math.min(s.look, 1) : 1); eye(hx + 1, lk); eye(hx + 6, lk); }
    if (s.blush) { R(c, hx, hy + 7, 2, 1, '#ff8fb8'); R(c, hx + 8, hy + 7, 2, 1, '#ff8fb8'); }
    // brows
    if (E === 'focus') { R(c, hx + 1, hy + 1, 1, 1, P.hair); R(c, hx + 2, hy + 2, 2, 1, P.hair); R(c, hx + 8, hy + 1, 1, 1, P.hair); R(c, hx + 6, hy + 2, 2, 1, P.hair); }
    else if (E === 'wide') { R(c, hx + 1, hy + 1, 3, 1, P.hair); R(c, hx + 6, hy + 1, 3, 1, P.hair); }
    // mouth
    const M = s.mouth || 'smile';
    if (M === 'smile') { R(c, hx + 4, hy + 8, 3, 1, P.lip); R(c, hx + 3, hy + 7, 1, 1, P.lip); R(c, hx + 7, hy + 7, 1, 1, P.lip); }
    else if (M === 'grin') { R(c, hx + 3, hy + 7, 5, 2, P.mouth); R(c, hx + 3, hy + 7, 5, 1, '#fff'); }
    else if (M === 'laugh') { R(c, hx + 3, hy + 7, 5, 3, P.mouth); R(c, hx + 4, hy + 9, 3, 1, P.tongue); R(c, hx + 3, hy + 7, 5, 1, '#fff'); }
    else if (M === 'o') { R(c, hx + 4, hy + 7, 2, 2, P.mouth); }
    else if (M === 'chomp') { if (Math.floor(f / 6) % 2) { R(c, hx + 3, hy + 7, 4, 3, P.mouth); R(c, hx + 3, hy + 7, 4, 1, '#fff'); } else R(c, hx + 3, hy + 8, 4, 1, P.lip); }
    else if (M === 'pout') { R(c, hx + 4, hy + 8, 3, 1, P.lip); R(c, hx + 3, hy + 9, 1, 1, P.lip); R(c, hx + 7, hy + 9, 1, 1, P.lip); R(c, hx + 8, hy + 7, 1, 1, '#9ad8ff'); }
    else if (M === 'sad') { R(c, hx + 4, hy + 7, 3, 1, P.lip); R(c, hx + 3, hy + 8, 1, 1, P.lip); R(c, hx + 7, hy + 8, 1, 1, P.lip); }
    else if (M === 'flat') { R(c, hx + 4, hy + 8, 3, 1, P.lip); }
    else if (M === 'yawn') { R(c, hx + 4, hy + 7, 3, 3, P.mouth); }
    else if (M === 'grit') { R(c, hx + 3, hy + 7, 5, 2, P.mouth); R(c, hx + 3, hy + 7, 5, 1, '#fff'); R(c, hx + 5, hy + 7, 1, 2, P.mouth); }
    else if (M === 'shout') { R(c, hx + 3, hy + 7, 5, 3, P.mouth); R(c, hx + 4, hy + 9, 3, 1, P.tongue); }
    // gold hoop earrings
    R(c, hx - 2, hy + 5, 1, 4, P.gold); R(c, hx - 1, hy + 9, 1, 1, P.gold); R(c, hx - 3, hy + 6, 1, 2, P.goldD);
    R(c, hx + 11, hy + 5, 1, 4, P.gold); R(c, hx + 10, hy + 9, 1, 1, P.gold); R(c, hx + 12, hy + 6, 1, 2, P.goldD);
    // kente headwrap: crown + band + knot with fluttering tails
    for (let i = 0; i < 16; i++) { R(c, hx - 3 + i, hy - 4, 1, 3, KENTE[i % 8]); R(c, hx - 3 + i, hy - 2, 1, 1, i % 2 ? P.k1 : P.k2); }
    R(c, hx - 3, hy - 4, 16, 1, P.k1);
    R(c, hx + 11, hy - 7, 3, 3, P.k3); R(c, hx + 14, hy - 7, 3, 3, P.k2); R(c, hx + 13, hy - 6, 1, 2, P.k1);
    const wv = reduced ? 0 : Math.round(Math.sin(f / 6) * 1.5) + (s.band || 0);
    R(c, hx + 16, hy - 4 + wv, 3, 1, P.k1); R(c, hx + 18, hy - 3 - wv, 3, 1, P.k3); R(c, hx + 20, hy - 2 + wv, 2, 1, P.k2);

    // equipped items worn on the head
    if (s.item === 'crown') { R(c, hx + 1, hy - 14, 1, 3, P.gold); R(c, hx + 4, hy - 16, 2, 5, P.gold); R(c, hx + 8, hy - 14, 1, 3, P.gold); R(c, hx + 1, hy - 12, 8, 2, P.gold); R(c, hx + 1, hy - 11, 8, 1, P.goldD); R(c, hx + 4, hy - 12, 2, 1, P.k3); R(c, hx + 4, hy - 17, 2, 1, '#fff'); }
    if (s.item === 'shades' && E !== 'closed') { R(c, hx, hy + 4, 4, 3, '#140a06'); R(c, hx + 6, hy + 4, 4, 3, '#140a06'); R(c, hx + 4, hy + 4, 2, 1, P.gold); R(c, hx, hy + 3, 10, 1, P.gold); R(c, hx + 1, hy + 4, 1, 1, '#fff'); R(c, hx + 7, hy + 4, 1, 1, '#fff'); }
    if (s.item === 'flower') { R(c, hx + 9, hy - 6, 2, 2, P.heart); R(c, hx + 12, hy - 6, 2, 2, P.heart); R(c, hx + 9, hy - 3, 2, 2, P.heart); R(c, hx + 12, hy - 3, 2, 2, P.heart); R(c, hx + 11, hy - 5, 1, 2, P.gold); R(c, hx + 10, hy - 4, 3, 1, P.goldL); }
    // arms (skin with gold cuffs)
    const A = s.arms || 'down', ay = ty;
    const fist = (x, y) => { R(c, x, y, 3, 3, P.skin); R(c, x, y + 2, 3, 1, P.skinD); };
    const hand = (x, y) => { R(c, x, y, 4, 4, P.skin); R(c, x + 1, y - 1, 1, 1, P.skin); R(c, x + 3, y - 1, 1, 1, P.skin); R(c, x, y + 3, 4, 1, P.skinD); };
    const sleeve = (x, y, w, h, dark) => R(c, x, y, w, h, dark ? P.skinD : P.skin);
    const cuff = (x, y, w) => R(c, x, y, w || 3, 2, P.gold);
    if (A === 'down') { sleeve(ox + 6, ay + 1, 3, 8, 1); R(c, ox + 6, ay + 3, 3, 1, P.goldD); cuff(ox + 6, ay + 7); fist(ox + 6, ay + 9); sleeve(ox + 23, ay + 1, 3, 8); R(c, ox + 23, ay + 3, 3, 1, P.goldD); cuff(ox + 23, ay + 7); fist(ox + 23, ay + 9); }
    else if (A === 'wave') { sleeve(ox + 6, ay + 1, 3, 8, 1); cuff(ox + 6, ay + 7); fist(ox + 6, ay + 9); const w = reduced ? 0 : (Math.floor(f / 7) % 2); sleeve(ox + 23, ay - 7, 3, 9); cuff(ox + 23, ay - 8); hand(ox + 23 + w, ay - 12); }
    else if (A === 'cheer') { sleeve(ox + 5, ay - 8, 3, 10, 1); cuff(ox + 5, ay - 9); fist(ox + 5, ay - 12); sleeve(ox + 24, ay - 8, 3, 10); cuff(ox + 24, ay - 9); fist(ox + 24, ay - 12); }
    else if (A === 'heart') { sleeve(ox + 7, ay + 1, 3, 5, 1); sleeve(ox + 22, ay + 1, 3, 5); R(c, ox + 10, ay + 4, 5, 3, P.skinD); R(c, ox + 17, ay + 4, 5, 3, P.skin); R(c, ox + 13, ay + 2, 3, 3, P.skin); R(c, ox + 16, ay + 2, 3, 3, P.skin);
      R(c, ox + 13, ay - 2, 2, 2, P.heart); R(c, ox + 17, ay - 2, 2, 2, P.heart); R(c, ox + 13, ay, 6, 2, P.heart); R(c, ox + 14, ay + 2, 4, 1, P.heart); R(c, ox + 15, ay + 3, 2, 1, P.heart); }
    else if (A === 'stretch') { sleeve(ox + 6, ay - 4, 3, 6, 1); sleeve(ox + 4, ay - 11, 3, 8, 1); cuff(ox + 4, ay - 12); hand(ox + 3, ay - 16); sleeve(ox + 23, ay - 4, 3, 6); sleeve(ox + 25, ay - 11, 3, 8); cuff(ox + 25, ay - 12); hand(ox + 25, ay - 16); }
    else if (A === 'cross') { sleeve(ox + 7, ay + 1, 3, 5, 1); sleeve(ox + 22, ay + 1, 3, 5); R(c, ox + 8, ay + 4, 16, 4, P.skin); R(c, ox + 8, ay + 7, 16, 1, P.skinD); cuff(ox + 10, ay + 4); cuff(ox + 19, ay + 5); }
    else if (A === 'chin') { sleeve(ox + 6, ay + 1, 3, 6, 1); R(c, ox + 8, ay + 6, 9, 3, P.skinD); fist(ox + 16, ay + 6); sleeve(ox + 22, ay + 1, 3, 5); R(c, ox + 19, ay - 1, 3, 6, P.skin); cuff(ox + 19, ay + 1); fist(ox + 18, ay - 3); }
    else if (A === 'flail') { const w = reduced ? 0 : Math.round(Math.sin(f / 3) * 2); sleeve(ox + 4, ay - 7 + w, 3, 9, 1); cuff(ox + 4, ay - 6 + w); hand(ox + 3, ay - 11 + w); sleeve(ox + 25, ay - 7 - w, 3, 9); cuff(ox + 25, ay - 6 - w); hand(ox + 25, ay - 11 - w); }
    else if (A === 'hang') { sleeve(ox + 7, ay - 17, 3, 18, 1); cuff(ox + 7, ay - 16); fist(ox + 7, ay - 20); sleeve(ox + 23, ay - 17, 3, 18); cuff(ox + 23, ay - 16); fist(ox + 23, ay - 20); }
    else if (A === 'press') { R(c, ox + 3, ay - 6, 8, 9, P.skin); R(c, ox + 6, ay - 8, 2, 2, P.skin); R(c, ox + 3, ay + 2, 8, 1, P.skinD); R(c, ox + 21, ay - 6, 8, 9, P.skin); R(c, ox + 24, ay - 8, 2, 2, P.skin); R(c, ox + 21, ay + 2, 8, 1, P.skinD); }
    else if (A === 'charge') { sleeve(ox + 7, ay + 1, 3, 6, 1); sleeve(ox + 22, ay + 1, 3, 6); R(c, ox + 9, ay + 5, 5, 3, P.skinD); R(c, ox + 18, ay + 5, 5, 3, P.skin); R(c, ox + 13, ay + 4, 6, 4, P.skin); R(c, ox + 13, ay + 7, 6, 1, P.skinD); cuff(ox + 9, ay + 5); cuff(ox + 20, ay + 5); }
    else if (A === 'blastR') { sleeve(ox + 6, ay + 1, 3, 7, 1); cuff(ox + 6, ay + 6); fist(ox + 6, ay + 8); R(c, ox + 20, ay + 1, 10, 3, P.skin); R(c, ox + 20, ay + 4, 10, 2, P.skinD); R(c, ox + 27, ay + 1, 2, 5, P.gold); R(c, ox + 30, ay - 1, 4, 8, P.skin); R(c, ox + 33, ay, 1, 6, P.skinL); }
    else if (A === 'throwR') { sleeve(ox + 6, ay + 1, 3, 7, 1); cuff(ox + 6, ay + 6); fist(ox + 6, ay + 8); R(c, ox + 22, ay - 3, 8, 3, P.skin); R(c, ox + 25, ay - 3, 2, 3, P.gold); hand(ox + 29, ay - 7); }
    else if (A === 'staff') { sleeve(ox + 6, ay, 3, 5, 1); R(c, ox + 8, ay + 3, 6, 3, P.skinD); fist(ox + 13, ay + 3); sleeve(ox + 23, ay, 3, 5); R(c, ox + 18, ay + 3, 6, 3, P.skin); fist(ox + 17, ay + 3); cuff(ox + 9, ay + 3); cuff(ox + 20, ay + 3); }
    else if (A === 'shieldUp') { sleeve(ox + 4, ay - 3, 3, 6, 1); hand(ox + 2, ay - 7); cuff(ox + 4, ay - 2); sleeve(ox + 25, ay - 3, 3, 6); hand(ox + 26, ay - 7); cuff(ox + 25, ay - 2); }
    else if (A === 'jabR') { sleeve(ox + 7, ay + 1, 3, 5, 1); R(c, ox + 9, ay + 4, 4, 3, P.skinD); fist(ox + 12, ay + 3); R(c, ox + 21, ay + 2, 9, 3, P.skin); R(c, ox + 25, ay + 2, 2, 3, P.gold); fist(ox + 30, ay + 2); R(c, ox + 30, ay + 2, 3, 1, P.skinL); }
    else if (A === 'upper') { sleeve(ox + 7, ay + 1, 3, 5, 1); R(c, ox + 9, ay + 4, 4, 3, P.skinD); fist(ox + 12, ay + 3); sleeve(ox + 23, ay - 10, 3, 12); cuff(ox + 23, ay - 9); fist(ox + 23, ay - 14); }
    else if (A === 'block') { sleeve(ox + 8, ay - 7, 4, 10, 1); cuff(ox + 8, ay - 2, 4); fist(ox + 8, ay - 10); sleeve(ox + 20, ay - 7, 4, 10); cuff(ox + 20, ay - 2, 4); fist(ox + 21, ay - 10); }
    else if (A === 'eat') { sleeve(ox + 6, ay + 1, 3, 8, 1); cuff(ox + 6, ay + 7); fist(ox + 6, ay + 9); sleeve(ox + 21, ay - 1, 3, 5); R(c, ox + 17, ay - 3, 6, 3, P.skin); cuff(ox + 21, ay + 1); fist(ox + 16, ay - 5); }
    else if (A === 'meditate') { R(c, ox + 7, ay + 5, 5, 3, P.skinD); R(c, ox + 20, ay + 5, 5, 3, P.skin); R(c, ox + 12, ay + 7, 3, 2, P.skin); R(c, ox + 17, ay + 7, 3, 2, P.skin); cuff(ox + 8, ay + 5); cuff(ox + 21, ay + 5); }
  }

  /* ---------- side lean (back on the wall at the LEFT edge, facing right) ---------- */
  function sideLean(s, f) {
    const c = sx; c.clearRect(0, 0, SW, SH); const wx = 6, yy = OY;
    const E = s.eyes || 'open', blink = (!reduced && E === 'open' && f % 170 < 6);
    R(c, wx + 4, yy + 29, 5, 5, P.skinD); R(c, wx + 2, yy + 32, 5, 3, P.skinD); R(c, wx, yy + 30, 3, 6, P.boot);
    R(c, wx + 4, yy + 29, 5, 10, P.skin); R(c, wx + 8, yy + 29, 1, 10, P.skinD); R(c, wx + 4, yy + 37, 8, 4, P.boot); R(c, wx + 4, yy + 37, 8, 1, P.bootL);
    R(c, wx, yy + 18, 10, 6, P.top); R(c, wx, yy + 18, 2, 6, P.topD); R(c, wx + 1, yy + 24, 9, 2, P.skin);
    R(c, wx, yy + 26, 10, 2, P.gold); R(c, wx, yy + 28, 10, 4, P.top); [P.k1, P.k2, P.k3, P.k1].forEach((col, i) => R(c, wx + 4, yy + 28 + i, 3, 1, col));
    R(c, wx + 3, yy + 20, 9, 4, P.skin); R(c, wx + 3, yy + 23, 9, 1, P.skinD); R(c, wx + 8, yy + 20, 2, 4, P.gold); R(c, wx + 11, yy + 20, 3, 3, P.skin);
    R(c, wx + 3, yy + 15, 4, 3, P.skinD);
    const hx = wx + 1, hy = yy + 6;
    disk(c, hx + 3, hy - 1, 13, 12, P.hair, -12, 9);
    for (let k = 0; k < 14; k++) { const a = k * 2.39, r = 5 + (k * 7) % 4; R(c, hx + 3 + Math.round(Math.cos(a) * r), hy + Math.round(Math.sin(a) * r * 0.8), 1, 1, k % 3 ? P.hairD : P.hairL); }
    R(c, hx, hy, 9, 10, P.skin); R(c, hx + 9, hy + 4, 1, 3, P.skin); R(c, hx + 2, hy + 8, 7, 2, P.skinL);
    R(c, hx + 1, hy + 5, 1, 4, P.gold);
    if (blink || E === 'closed') { R(c, hx + 6, hy + 5, 2, 1, P.pupil); } else { R(c, hx + 6, hy + 4, 2, 2, P.eye); R(c, hx + 7, hy + 4, 1, 2, P.pupil); R(c, hx + 5, hy + 3, 3, 1, P.pupil); }
    R(c, hx + 6, hy + 8, 2, 1, P.lip); R(c, hx + 8, hy + 7, 1, 1, P.lip);
    for (let i = 0; i < 13; i++) R(c, hx - 2 + i, hy - 4, 1, 3, KENTE[i % 8]);
    R(c, hx + 9, hy - 7, 3, 3, P.k3); R(c, hx + 12, hy - 7, 3, 3, P.k2);
    R(c, wx - 2, 4, 1, 46, 'rgba(0,0,0,.25)');
  }

  /* ---------- emotes ---------- */
  const EMOTES = {
    wave: { len: 110, say: 'Hey! I\'m Myia\'s hero.', fn: (f) => ({ arms: 'wave', mouth: 'grin', eyes: f % 40 < 20 ? 'open' : 'happy' }) },
    cheer: { len: 90, say: 'You got this!', fn: (f) => { const p = (f % 45) / 45; const up = Math.sin(p * Math.PI); return { arms: 'cheer', legs: up > .15 ? 'jump' : 'squash', y: -Math.round(up * 7), mouth: 'grin', eyes: 'happy', spark: up > .6 }; } },
    heart: { len: 120, say: 'Proud of you!', fn: () => ({ arms: 'heart', mouth: 'smile', eyes: 'happy', hearts: true }) },
    flinch: { len: 50, say: 'Oof! Try again.', fn: (f) => ({ arms: 'flail', legs: 'squash', eyes: 'wide', mouth: 'o', excl: f < 30, y: f < 10 ? 1 : 0 }) },
    victory: { len: 130, say: 'Badge earned!', fn: (f) => { const p = (f % 65) / 65; const up = Math.sin(p * Math.PI); return { arms: 'cheer', legs: up > .15 ? 'jump' : 'squash', y: -Math.round(up * 9), mouth: 'laugh', eyes: 'happy', aura: true, spark: true }; } },
    idle: { len: 160, fn: (f) => ({ arms: 'down', mouth: 'smile', y: (Math.floor(f / 16) % 2) }) },
    look: { len: 160, fn: (f) => { const k = Math.floor(f / 40) % 4; return { arms: 'down', mouth: k === 2 ? 'o' : 'flat', eyes: k === 0 ? 'left' : k === 1 ? 'right' : k === 2 ? 'wide' : 'open', tilt: k === 0 ? -1 : k === 1 ? 1 : 0 }; } },
    stretch: { len: 140, fn: (f) => { const on = f % 140 < 90; return { arms: on ? 'stretch' : 'down', mouth: on ? 'yawn' : 'smile', eyes: on ? 'closed' : 'open', y: on ? -1 : 0 }; } },
    meditate: { len: 160, fn: (f) => ({ arms: 'meditate', legs: 'sit', eyes: 'closed', mouth: 'flat', y: -Math.round(2 + Math.sin(f / 12) * 2), aura: true }) },
    sleepy: { len: 160, fn: (f) => { const nod = Math.floor(f / 30) % 2; return { arms: 'down', eyes: nod ? 'closed' : 'sleepy', mouth: 'flat', tilt: nod ? 1 : 0, y: nod ? 1 : 0, zzz: true }; } },
    charge: { len: 72, fn: (f) => ({ arms: 'charge', legs: 'wide', eyes: 'focus', mouth: 'grit', orb: Math.min(1, f / 72), aura: true, y: (f % 6 < 3 ? 0 : -1) }) },
    blast: { len: 150, fn: () => ({ arms: 'blastR', legs: 'wide', eyes: 'focus', mouth: 'shout' }) },
    think: { len: 140, fn: () => ({ arms: 'chin', eyes: 'right', mouth: 'flat', q: true }) },
    leanL: { len: 240, fn: (f) => ({ side: 'lean', eyes: f % 240 < 180 ? 'open' : 'closed', note: f % 240 > 150 }) },
    hang: { len: 120, fn: (f) => ({ arms: 'hang', legs: 'dangle', mouth: 'grin', eyes: 'happy', y: Math.round(Math.sin(f / 10)) }) },
    held: { len: 60, fn: () => ({ arms: 'flail', legs: 'dangle', eyes: 'wide', mouth: 'o', excl: true }) },
    land: { len: 30, fn: (f) => ({ arms: 'down', legs: f < 12 ? 'squash' : 'stand', eyes: f < 12 ? 'closed' : 'open', mouth: f < 12 ? 'flat' : 'smile', dust: f < 16 }) },

    /* resting */
    float: { len: 420, fn: (f) => ({ arms: 'meditate', legs: 'sit', eyes: 'closed', mouth: 'flat', y: -7 - Math.round(Math.sin(f / 14) * 3), aura: true, floatGlow: true }) },
    nap: { len: 600, fn: (f) => ({ arms: 'down', eyes: 'closed', mouth: 'flat', down: 1, napZ: true, y: f % 80 < 40 ? 0 : 1 }) },
    /* interaction reactions */
    dizzy: { len: 80, fn: (f) => ({ arms: 'down', eyes: 'swirl', mouth: 'o', dizzyTop: true, tilt: Math.floor(f / 10) % 2 ? 1 : -1 }) },
    annoyed: { len: 90, say: 'Hey! Quit it!', fn: () => ({ arms: 'cross', eyes: 'angry', mouth: 'pout', steam: true }) },
    wakeAngry: { len: 100, say: 'Hey! I was sleeping!', fn: (f) => ({ arms: f < 12 ? 'flail' : 'cross', legs: f < 8 ? 'squash' : 'stand', eyes: 'angry', mouth: f < 40 ? 'grit' : 'pout', steam: true, excl: f < 30 }) },
    struggle: { len: 9999, fn: (f) => ({ arms: 'flail', legs: Math.floor(f / 5) % 2 ? 'walkA' : 'walkB', eyes: Math.floor(f / 40) % 2 ? 'angry' : 'wide', mouth: Math.floor(f / 40) % 2 ? 'grit' : 'o', sweat: true }) },
    wobble: { len: 70, say: 'Whoa, whoa!', fn: (f) => ({ arms: 'flail', legs: Math.floor(f / 6) % 2 ? 'walkA' : 'squash', eyes: 'wide', mouth: 'o', shakeX: true, tilt: Math.floor(f / 8) % 2 ? 2 : -2 }) },
    swat: { len: 36, fn: (f) => ({ arms: f < 8 ? 'block' : 'jabR', legs: 'wide', eyes: 'focus', mouth: 'grin', impact: f >= 8 && f < 18 ? 'small' : null }) },
    clickJump: { len: 30, fn: (f) => { const up = Math.sin((f / 30) * Math.PI); return { arms: 'cheer', legs: up > .1 ? 'jump' : 'squash', y: -Math.round(up * 8), eyes: 'happy', mouth: 'grin' }; } },
    clickFlinch: { len: 26, fn: (f) => ({ arms: 'block', legs: 'squash', eyes: 'closed', mouth: 'grit', shakeX: f < 10 }) },
    giftbox: { len: 130, fn: (f) => ({ arms: f < 44 ? 'down' : 'cheer', legs: f > 44 && f < 54 ? 'jump' : 'stand', y: f > 44 && f < 54 ? -3 : 0, eyes: f < 44 ? 'wide' : 'happy', mouth: f < 44 ? 'o' : 'grin', box: f }) },
    snack: { len: 120, fn: (f) => ({ arms: f < 80 ? 'eat' : 'cheer', eyes: f < 80 ? 'happy' : 'happy', mouth: f < 80 ? 'chomp' : 'grin', snack: f < 64 ? 1 - f / 64 : 0, crumbs: f < 80 }) },
    peek: { len: 9999, fn: (f) => ({ arms: 'wave', eyes: 'right', mouth: f % 300 < 150 ? 'smile' : 'grin', tilt: 2, peekStill: true }) },
    /* magic */
    orbitPose: { len: 120, fn: (f) => ({ arms: f < 70 ? 'charge' : 'blastR', legs: 'wide', eyes: 'focus', mouth: f < 70 ? 'grit' : 'shout' }) },
    cast: { len: 70, fn: () => ({ arms: 'blastR', legs: 'wide', eyes: 'focus', mouth: 'shout' }) },
    sigil: { len: 70, fn: () => ({ arms: 'shieldUp', eyes: 'closed', mouth: 'smile', sigil: true }) },
    element: { len: 168, fn: (f) => { const ph = Math.min(3, Math.floor(f / 42)); return [{ arms: 'blastR', legs: 'wide', eyes: 'focus', mouth: 'shout' }, { arms: 'shieldUp', legs: 'wide', eyes: 'focus', mouth: 'grit' }, { arms: 'cheer', legs: 'wide', eyes: 'wide', mouth: 'shout' }, { arms: 'wave', legs: 'wide', eyes: 'happy', mouth: 'grin' }][ph]; } },
    barrier: { len: 110, fn: (f) => ({ arms: 'shieldUp', legs: 'wide', eyes: f > 44 && f < 60 ? 'wide' : 'focus', mouth: 'grit', dome: f }) },
    point: { len: 9999, fn: (f) => ({ arms: 'blastR', eyes: f % 160 < 120 ? 'open' : 'happy', mouth: Math.floor(f / 7) % 3 === 0 ? 'o' : Math.floor(f / 7) % 3 === 1 ? 'smile' : 'grin' }) },
    timewalk: { len: 9999, fn: (f) => ({ arms: 'down', legs: Math.floor(f / 10) % 2 ? 'walkA' : 'walkB', eyes: 'closed', mouth: 'smile', y: Math.floor(f / 10) % 2 ? -1 : 0 }) },

    /* fighting starter set */
    walk: { len: 9999, fn: (f) => ({ arms: 'down', legs: Math.floor(f / 8) % 2 ? 'walkA' : 'walkB', y: Math.floor(f / 8) % 2 ? -1 : 0, mouth: 'smile' }) },
    jump: { len: 44, say: 'Hup!', fn: (f) => { const up = Math.sin((f / 44) * Math.PI); return { arms: 'cheer', legs: up > .1 ? 'jump' : 'squash', y: -Math.round(up * 12), mouth: 'grin', eyes: 'happy' }; } },
    dash: { len: 22, fn: () => ({ arms: 'jabR', legs: 'wide', eyes: 'focus', mouth: 'grit', speed: true }) },
    light: { len: 34, say: 'Hi-yah!', fn: (f) => ({ arms: f < 6 || f > 24 ? 'block' : 'jabR', legs: 'wide', eyes: 'focus', mouth: f < 24 ? 'shout' : 'grin', impact: f >= 6 && f < 16 ? 'small' : null }) },
    heavy: { len: 56, say: 'Rising light!', fn: (f) => (f < 14 ? { arms: 'charge', legs: 'squash', eyes: 'focus', mouth: 'grit', y: 1 } : { arms: 'upper', legs: f < 34 ? 'jump' : 'stand', y: f < 34 ? -Math.round(Math.sin(((f - 14) / 20) * Math.PI) * 10) : 0, eyes: 'focus', mouth: 'shout', impact: f >= 14 && f < 30 ? 'big' : null, aura: f < 34 }) },
    block: { len: 50, say: 'Blocked!', fn: (f) => ({ arms: 'block', legs: 'wide', eyes: 'focus', mouth: 'grit', guard: f < 22 ? f : null }) },
    hit: { len: 40, say: 'Ouch!', fn: (f) => ({ arms: 'flail', legs: 'squash', eyes: 'wide', mouth: 'o', excl: f < 24, y: f < 8 ? 1 : 0, shakeX: f < 14 }) },
    knockdown: { len: 160, say: 'Failure is the first step to success.', fn: (f) => (f < 110 ? { arms: 'flail', legs: 'dangle', eyes: 'closed', mouth: 'o', down: Math.min(1, f / 10), dizzy: f > 10 } : { arms: 'cheer', legs: f < 120 ? 'squash' : 'stand', eyes: 'focus', mouth: 'grin', aura: true }) },
    defeat: { len: 170, say: 'I\'ll get it next time.', fn: (f) => ({ arms: 'down', legs: 'sit', eyes: f % 120 < 100 ? 'sleepy' : 'closed', mouth: 'sad', tilt: 1, y: 1, cloud: true }) },
    hover: { len: 9999, fn: () => ({ arms: 'down', mouth: 'grin', eyes: 'happy', blush: true }) },

    /* gift powers (original moves) */
    fan: { len: 110, gift: 'Expose', say: 'I see it!', fn: (f) => (f < 22 ? { arms: 'throwR', legs: 'wide', eyes: 'focus', mouth: 'grit', fan: true } : f < 92 ? { arms: 'blastR', legs: 'wide', eyes: 'focus', mouth: 'shout' } : { arms: 'throwR', legs: 'wide', eyes: 'happy', mouth: 'grin', fan: true }) },
    staff: { len: 110, gift: 'Challenge', say: 'I question it!', fn: (f) => (f < 70 ? { arms: 'staff', legs: 'wide', eyes: 'focus', mouth: 'grit', staff: f } : { arms: 'cheer', legs: f < 78 ? 'squash' : 'stand', eyes: 'happy', mouth: 'grin', crown: true }) },
    chain: { len: 100, gift: 'Advocate', say: 'Speak up!', fn: (f) => ({ arms: 'blastR', legs: 'wide', eyes: 'focus', mouth: f < 80 ? 'shout' : 'grin' }) },
    spark: { len: 110, gift: 'Empower', say: 'Your turn to shine!', fn: (f) => { if (f < 30) { const up = Math.sin((f / 30) * Math.PI); return { arms: 'cheer', legs: up > .2 ? 'jump' : 'squash', y: -Math.round(up * 8), eyes: 'wink', mouth: 'grin', orbTop: f / 30 }; } return { arms: 'thumbs', eyes: 'wink', mouth: 'grin', spark: f % 20 < 10 }; } },
    shield: { len: 130, gift: 'Support', say: 'I\'ve got you.', fn: (f) => ({ arms: 'shieldUp', legs: 'wide', eyes: f < 20 ? 'focus' : 'open', mouth: 'smile', shield: f }) },
  };
  EMOTES.spark.fn = ((orig) => (f) => { const st = orig(f); if (st.arms === 'thumbs') st.arms = 'cheer'; return st; })(EMOTES.spark.fn);

  /* ---------- effects drawn on the pet canvas ---------- */
  function extras(c, st, f, x0, y0, sc) {
    const X = (v) => x0 + (v + OX) * sc, Y = (v) => y0 + (v + OY) * sc, Rr = (x, y, w, h, col) => R(c, X(x), Y(y), w * sc, h * sc, col);
    const font = (px) => `${px * sc}px "Press Start 2P", monospace`;
    if (st.hearts && !reduced) { for (let k = 0; k < 3; k++) { const p = ((f + k * 40) % 120) / 120; const hx = 12 + k * 8 + Math.sin(p * 8 + k) * 2, hy = 10 - p * 16; c.globalAlpha = 1 - p; Rr(hx, hy, 2, 2, P.heart); Rr(hx + 3, hy, 2, 2, P.heart); Rr(hx, hy + 1, 5, 2, P.heart); Rr(hx + 1, hy + 3, 3, 1, P.heart); Rr(hx + 2, hy + 4, 1, 1, P.heart); c.globalAlpha = 1; } }
    if (st.zzz) { c.font = font(6); c.fillStyle = '#d8cff2'; for (let k = 0; k < 3; k++) { const p = ((f + k * 50) % 150) / 150; c.globalAlpha = 1 - p; c.fillText('z', X(30 + p * 6 + k * 2), Y(4 - p * 14 - k * 3)); c.globalAlpha = 1; } }
    if (st.q) { c.font = font(8); c.fillStyle = P.gold; c.fillText('?', X(32), Y(2 + Math.round(Math.sin(f / 8)))); }
    if (st.excl) { c.font = font(8); c.fillStyle = P.heart; c.fillText('!', X(33), Y(3)); }
    if (st.spark) { Rr(2, 2, 2, 2, P.gold); Rr(36, 4, 2, 2, P.goldL); Rr(4, 12, 1, 1, '#fff'); Rr(35, -1, 1, 1, '#fff'); }
    if (st.aura && !reduced) { for (let k = 0; k < 14; k++) { const a = f * .06 + k / 14 * 6.28; Rr(19 + Math.cos(a) * 16, 28 + Math.sin(a) * 7 - ((f + k * 9) % 20) * .5, 1, 2, k % 2 ? P.aura : P.aura2); } }
    if (st.orb != null) { const r = 1 + Math.round(st.orb * 4); const pul = reduced ? 0 : (f % 8 < 4 ? 1 : 0); Rr(20 - r - pul, 23 - r - pul, (r + pul) * 2, (r + pul) * 2, 'rgba(246,185,59,.55)'); Rr(20 - r + 1, 23 - r + 1, (r - 1) * 2, (r - 1) * 2, P.ki); Rr(19, 22, 2, 2, P.kiW);
      if (!reduced) for (let k = 0; k < 6; k++) { const a = f * .3 + k; const d = 10 - ((f * 0.4 + k * 3) % 10); Rr(20 + Math.cos(a) * d, 23 + Math.sin(a) * d, 1, 1, '#fff'); } }
    if (st.orbTop != null) { const y = 4 - st.orbTop * 14; Rr(17, y, 6, 6, 'rgba(246,185,59,.5)'); Rr(18, y + 1, 4, 4, P.ki); Rr(19, y + 2, 2, 2, '#fff'); }
    if (st.note) { c.font = font(6); c.fillStyle = P.gold; const p = ((f - 150) % 90) / 90; c.globalAlpha = 1 - p; c.fillText('♪', X(24 + p * 6), Y(4 - p * 10)); c.globalAlpha = 1; }
    if (st.dust) { const p = f / 16; c.globalAlpha = 1 - p; Rr(6 - p * 6, 41, 4, 2, '#c9bfe8'); Rr(30 + p * 6, 41, 4, 2, '#c9bfe8'); c.globalAlpha = 1; }
    if (st.impact) { const big = st.impact === 'big'; const cx = big ? 26 : 36, cy = big ? 2 : 20, r = big ? 7 : 4; for (let k = 0; k < 8; k++) { const a = k / 8 * 6.28 + f * 0.2; Rr(cx + Math.cos(a) * r, cy + Math.sin(a) * r, 2, 2, k % 2 ? '#fff' : P.gold); } Rr(cx - 1, cy - 1, 3, 3, '#fff'); }
    if (st.guard != null) { c.globalAlpha = 1 - st.guard / 22; for (let k = 0; k < 12; k++) Rr(8 + k * 1.4, 12 - Math.abs(k - 5.5) * 0.8, 2, 1, P.goldL); c.globalAlpha = 1; }
    if (st.speed) { for (let k = 0; k < 5; k++) Rr(-6 - (k % 3) * 3, 14 + k * 5, 6 + (k % 2) * 4, 1, k % 2 ? P.goldL : '#fff'); }
    if (st.dizzy) { for (let k = 0; k < 3; k++) { const a = f * 0.15 + k * 2.1; Rr(30 + Math.cos(a) * 7, 30 + Math.sin(a) * 2, 2, 2, P.gold); } }
    if (st.cloud) { const dx = Math.round(Math.sin(f / 20)); Rr(12 + dx, -4, 14, 4, '#6a6290'); Rr(14 + dx, -6, 6, 2, '#6a6290'); Rr(20 + dx, -7, 5, 3, '#6a6290'); if (!reduced) for (let k = 0; k < 3; k++) { const p = ((f + k * 9) % 24) / 24; Rr(14 + dx + k * 4, 0 + p * 10, 1, 2, '#8fc8ff'); } }
    if (st.napZ) { c.font = font(6); c.fillStyle = '#d8cff2'; for (let k = 0; k < 3; k++) { const p = ((f + k * 50) % 150) / 150; c.globalAlpha = 1 - p; c.fillText('z', X(-2 - p * 4 - k * 3), Y(26 - p * 14 - k * 3)); c.globalAlpha = 1; } }
    if (st.floatGlow) { c.globalAlpha = 0.35; Rr(6, 41, 28, 2, P.gold); Rr(10, 42, 20, 1, P.goldL); c.globalAlpha = 1; }
    if (st.dizzyTop) { for (let k = 0; k < 3; k++) { const a = f * 0.18 + k * 2.1; Rr(19 + Math.cos(a) * 9, -2 + Math.sin(a) * 2, 2, 2, P.gold); } }
    if (st.steam && !reduced) { for (let k = 0; k < 2; k++) { const p = ((f + k * 20) % 40) / 40; c.globalAlpha = 1 - p; Rr(4 - p * 4, 2 - p * 8, 3, 2, '#e9e3ff'); Rr(33 + p * 4, 2 - p * 8, 3, 2, '#e9e3ff'); c.globalAlpha = 1; } }
    if (st.sweat) { Rr(31, 6 + (f % 30) / 6, 1, 2, '#9ad8ff'); }
    if (st.crumbs && !reduced) { for (let k = 0; k < 3; k++) { const p = ((f + k * 11) % 33) / 33; Rr(20 + k * 2 - p * 2, 17 + p * 18, 1, 1, P.goldD); } }
    if (st.snack) { const w = Math.max(1, Math.round(5 * st.snack)); Rr(17, 9, w, 4, P.gold); Rr(17, 9, w, 1, P.goldL); Rr(18, 10, 1, 1, P.topD); }
    if (st.box != null) { const t = st.box; const lid = t < 44 ? 0 : Math.min(10, (t - 44) / 2);
      Rr(27, 35, 9, 6, P.k3); Rr(27, 35, 9, 1, '#ff8a8a'); Rr(31, 35, 1, 6, P.gold);
      Rr(26 + (t >= 44 ? lid * 0.6 : 0), 33 - lid, 11, 2, P.k3); Rr(31 + (t >= 44 ? lid * 0.6 : 0), 33 - lid, 1, 2, P.gold);
      if (t < 44 && !reduced) Rr(27 + (Math.floor(t / 6) % 2), 34, 9, 1, 'rgba(255,255,255,.3)');
      if (t >= 44 && t < 90) { const p = (t - 44) / 46; c.globalAlpha = 1 - p * 0.5; for (let k = 0; k < 6; k++) { const a = k / 6 * 6.28 + t * 0.2; Rr(31 + Math.cos(a) * (3 + p * 8), 32 - p * 14 + Math.sin(a) * 3, 1, 1, k % 2 ? '#fff' : P.gold); } c.globalAlpha = 1; } }
    if (st.dome != null) { const t = st.dome; const flash = t > 44 && t < 60; c.globalAlpha = flash ? 0.55 : 0.28;
      for (let k = 0; k < 60; k++) { const a = Math.PI + k / 59 * Math.PI; Rr(16 + Math.cos(a) * 22, 40 + Math.sin(a) * 26, 1, 1, flash ? '#fff' : '#c4b5fd'); }
      c.globalAlpha = flash ? 0.25 : 0.12; for (let yy = 0; yy < 26; yy += 2) { const w = Math.round(22 * Math.sqrt(1 - (yy / 26) * (yy / 26))); Rr(16 - w, 40 - yy, w * 2, 1, '#c4b5fd'); } c.globalAlpha = 1; }
    if (st.sigil) { c.globalAlpha = 0.85; for (let k = 0; k < 40; k++) { const a = k / 40 * 6.28 + f * 0.05; Rr(16 + Math.cos(a) * 16, 41 + Math.sin(a) * 3, 1, 1, '#b07cff'); } for (let k = 0; k < 6; k++) { const a = k / 6 * 6.28 - f * 0.08; Rr(16 + Math.cos(a) * 10, 41 + Math.sin(a) * 2, 2, 1, P.gold); } c.globalAlpha = 1; }
    if (st.fan) { // gold fan in her raised hand
      const cx = 32, cy = 13; for (let k = 0; k < 6; k++) { const a = -2.6 + k * 0.42; for (let d = 1; d < 7; d++) Rr(cx + Math.cos(a) * d, cy + Math.sin(a) * d, 1, 1, d > 5 ? P.goldD : KENTE[k]); } Rr(cx, cy, 1, 1, P.gold);
    }
    if (st.staff != null) { // spinning gold staff
      const a = reduced ? 0.6 : st.staff * 0.35; const cx = 16, cy = 23; for (let d = -15; d <= 15; d++) Rr(cx + Math.cos(a) * d, cy + Math.sin(a) * d * 0.6, 1, 1, Math.abs(d) > 13 ? P.goldL : P.gold);
    }
    if (st.crown) { Rr(14, -6, 1, 3, P.gold); Rr(17, -7, 1, 4, P.gold); Rr(20, -6, 1, 3, P.gold); Rr(14, -3, 7, 2, P.gold); Rr(17, -8, 1, 1, '#fff'); }
    if (st.shield != null) { const t = st.shield; const r = 20 + (reduced ? 0 : Math.round(Math.sin(t / 6))); c.globalAlpha = 0.85;
      for (let k = 0; k < 48; k++) { const a = k / 48 * 6.28; Rr(16 + Math.cos(a) * r, 24 + Math.sin(a) * r * 0.95, 1, 1, k % 3 ? P.gold : P.goldL); }
      c.globalAlpha = 0.18; for (let k = 0; k < 16; k++) { const a = k / 16 * 6.28; Rr(16 + Math.cos(a) * (r - 3), 24 + Math.sin(a) * (r - 3), 2, 2, P.goldL); }
      c.globalAlpha = 1;
      if (!reduced) { const a = t * 0.12; for (let d = r; d < r + 10; d++) Rr(16 + Math.cos(a) * d, 24 + Math.sin(a) * d * 0.95, 1, 1, '#fff'); } }
  }

  /* ---------- the five shadows (tiny targets for her magic) ---------- */
  const N = (rows) => { const w = Math.max(...rows.map(r => r.length)); return rows.map(r => r.padEnd(w, '.')); };
  const SHADOWS = [
    { name: "The Elephant in the Room", grid: N(["CC......oooooo........", "cC....ooEEEEEEoo......", "cC...oEEEEEEEEEEo.....", "cC..oELLEEEEEEEoPPo...", "cC.oELLEEEEEEEEoPPPo..", "cC.oELEEwkEEEEEoPPPPo.", "cCoELEEEkkEEEEEoPPPPo.", "cCoEEEEEEEEEEEEoPPPPo.", "cCoEEEEEEEEEEEEEoPPo..", "cCoEoEwEEEEEEEEEEoo...", "cCoEo.oEEEEEEEEEEEo...", "cCoEo.oESEEEEEEESEo...", "cCoEo.oESoooooESSo....", "cC.oEooSSo...oSSo.....", "cC..oo.oo.....oo......"]), pal: { o: '#140c2a', E: '#7a6aa8', L: '#a99be0', S: '#54467e', P: '#e2a6cf', w: '#ffffff', k: '#140a24', c: '#6e2c55', C: '#4a1f3a' } },
    { name: "Sir Same-Old", grid: N(["......oooooooo......", ".....oHHGGGGGGo.....", "....oHHGGGGGGGGo....", "....oHGGGGGGGGGo....", "....oGGooooooGGo....", "....oGGoPPPPoGGo....", "....oGGooooooGGo....", "....oGGGGooGGGGo....", ".....oSGGooGGSo.....", "..oooooSGGGGSooooo..", ".oCCCCCoSSSSoCCCCCo.", "oCCCCCCCooooCCCCCCCo", "oCDCCCCCCYYCCCCCCDCo", "oCDCCCCCYDDYCCCCCDCo", "oCDCCCCCCYYCCCCCCDCo", ".oCCCCCCCCCCCCCCCCo.", "..oooooooooooooooo.."]), pal: { o: '#05040a', G: '#43415a', H: '#8d8bad', S: '#2a283e', P: '#c084fc', C: '#2c1c4c', D: '#1a1030', Y: '#b8862a' } },
    { name: "The Hush", grid: N(["........oo........", ".......oBBo.......", "......oBBBBo......", ".......oBBo.......", "....oooooooooo....", "...oWLLWWWWWWWo...", "..oWLLWWWWWWWWWo..", "..oWLgggWWgggWWo..", "..oWWgkgWWgkgWWo..", "..oWWgggWWgggWWo..", "..oWrWWWWWWWWrWo..", "..oWWWWWokoWWWWo..", "..oWWWWWWfWWWWWo..", "..oWWWWWWfWWWWWo..", "..oWWSWWWWWWWSWo..", "..oWSSWWWWWWSSSo..", "..oWSoSWWWWSoSSo..", "..ooo.oSWWSo.ooo..", ".......oooo......."]), pal: { o: '#1e1640', W: '#9a90c4', L: '#cfc7f2', S: '#6a609a', B: '#4a3c78', g: '#f2ecff', k: '#1a1236', f: '#efe6ff', r: '#ff9cc6' }, floaty: true },
    { name: "The Doubt Gremlin", grid: N(["oo..................oo", "oEo................oEo", "oeEo..oooooooooo..oEeo", ".oeEooGGGGGGGGGGooEeo.", "..oeEoGLLGGGGGGGoEeo..", "...ooGLGGGGGGGGGGoo...", "....oGGYYYGGGYYYGo....", "....oGGYkYGGGYkYGo....", "....oGGGGGGGGGGGGo....", "....oGGowowowowGGo....", ".....oGGoooooooGo.....", "....ooGGGGGGGGGGoo....", "...oGoSGGGGGGGGSoGo...", "...ooooSGGooGGSoooo...", "......oSSo..oSSo......", ".......oo....oo......."]), pal: { o: '#120a20', E: '#5b4590', e: '#8a6fc4', G: '#4b3b6e', L: '#7460a6', S: '#2d2147', Y: '#c6ff4d', k: '#000000', w: '#ffffff' }, grows: true },
    { name: "The Lonely Storm", grid: N(["........oooo..........", "......ooCCCCoo..ooo...", ".....oCCLLLCCCooCCCo..", "...ooCCLLCCCCCCCCLCCo.", "..oCCCLCCCCCCCCCCCCCo.", ".oCCCCCCCCCCCCCCCCCCCo", "oCCCCCbbCCCCCCbbCCCCCo", "oCCCCCCkCCCCCCkCCCCCCo", "oCCCCCCtCCCCCCCCCCCCCo", "oCCCCCCtCCooooCCCCCCCo", ".oCCCCCCCoCCCCoCCCCCo.", "..oSSSSSSSSSSSSSSSSo..", "...oooooooooooooooo...", "......y.......Y.......", ".....yY......yY.......", "......Y.......y.......", ".....y.......y........"]), pal: { o: '#0e1430', C: '#3b4a7a', L: '#6a7fbc', S: '#25305a', b: '#0d0d1a', k: '#ffe066', t: '#7cc8ff', y: '#ffe066', Y: '#fff4b0' }, floaty: true },
  ];
  const CANDY = N(['..g..........g..', '.ggg..pppp..ggg.', 'ggggppPwPPpppggg', 'ggggpPPPPPPppggg', '.ggg..pppp..ggg.', '..g..........g..']);
  const CANDY_PAL = { g: P.gold, p: '#ff6fae', P: '#ff9cc6', w: '#ffffff' };
  const ITEMS = [['crown', 'Gold Crown'], ['shades', 'Star Shades'], ['cape', 'Kente Cape'], ['flower', 'Gold Flower']];

  /* ---------- narrator lines (edit these in your own words) ---------- */
  const NARRATION = {
    peek: [
      'Psst. Tap a card. It flips. Trust me.',
      'Real talk: Expose is the gift people notice first.',
      'Fun fact: my first word was "serve."',
      'Wrong answers are okay. I have had plenty.',
      'This is the part where I act like I am not nervous.',
      'Each gift powers up the next one. Like a combo!',
    ],
    start: 'Okay, here we go. This is MY purpose, in one word.',
    gift: 'New chapter! Meet the gift first, then we fight.',
    fight: 'Boss time. Do not let that shadow get in your head.',
    win: 'And THAT is how you disrupt. *hair flip*',
  };

  /* ---------- live pet ---------- */
  let frame = 0;
  const B = document.createElement('div'); B.className = 'mp';
  B.innerHTML = `<div class="mp-bub" aria-live="polite"></div><div class="mp-narr" aria-live="polite"></div><canvas width="${PW}" height="${PH}" aria-label="Mini hero pet: drag her, tap her for moves, or hold her still for the clone squad"></canvas><div class="mp-menu"><div class="mp-tabs" role="tablist"></div><div class="mp-list"></div></div>`;
  root.appendChild(B);
  const bcv = B.querySelector('canvas'), bctx = bcv.getContext('2d'), bub = B.querySelector('.mp-bub'), narr = B.querySelector('.mp-narr'), menu = B.querySelector('.mp-menu');
  const tabsEl = menu.querySelector('.mp-tabs'), listEl = menu.querySelector('.mp-list');
  bctx.imageSmoothingEnabled = false;
  const TABS = {
    Gifts: [['fan', '🔦', 'Spotlight Fan', 'Expose'], ['staff', '👑', "Queen's Staff", 'Challenge'], ['chain', '🎤', 'Voice Chain', 'Advocate'], ['spark', '✨', 'Spark Pass', 'Empower'], ['shield', '🛡️', 'Lighthouse', 'Support']],
    Magic: [['m_orbit', '🟡', 'Halo Orbit', 'Orb circles, then fires'], ['m_spark', '💫', 'Ever-Spark', 'Hovers until it hits'], ['m_sigil', '🔮', 'Sigil Step', 'Teleport across'], ['m_rune', '🌀', 'Rune Lock', 'Slows the shadow'], ['m_element', '🔥', 'Element Switch', 'Fire, ice, lightning, wind'], ['m_dome', '🫧', 'Light Dome', 'Blocks one attack'], ['m_sky', '☄️', 'Sky Beam', 'Beam from above'], ['m_time', '⏸️', 'Time Hold', 'Freeze the page'], ['m_candy', '🍬', 'Candy Curse', 'Shadow becomes candy']],
    Play: [['wave', '👋', 'Wave', ''], ['p_gift', '🎁', 'Gift Box', 'Open it, wear it'], ['p_snack', '🍪', 'Snack', 'Eat and grow'], ['p_float', '🧘', 'Float', 'Floating meditation'], ['p_nap', '😴', 'Nap', 'Tap her to wake her']],
  };
  let tab = 'Gifts';
  function renderTabs() {
    tabsEl.innerHTML = ''; Object.keys(TABS).forEach(name => { const t = document.createElement('button'); t.type = 'button'; t.textContent = name; t.setAttribute('role', 'tab'); t.setAttribute('aria-selected', name === tab); t.className = name === tab ? 'on' : '';
      t.onpointerdown = e => e.stopPropagation(); t.onclick = e => { e.stopPropagation(); tab = name; renderTabs(); }; tabsEl.appendChild(t); });
    listEl.innerHTML = ''; TABS[tab].forEach(([k, ic, lab, sub]) => { const b = document.createElement('button'); b.type = 'button'; b.innerHTML = `<i>${ic}</i><span>${lab}${sub ? `<small>${sub}</small>` : ''}</span>`;
      b.onpointerdown = e => e.stopPropagation(); b.onclick = e => { e.stopPropagation(); menu.classList.remove('open'); play(k); }; listEl.appendChild(b); });
  }
  renderTabs();

  let mode = 'idle', emote = 'idle', ef = 0, idleTimer = 0; const saved = store.get();
  let item = saved.item || null;
  let bx = saved.pos ? saved.pos[0] * innerWidth : innerWidth - PW - 24, by = saved.pos ? saved.pos[1] * innerHeight : innerHeight - PH - 24;
  bx = Math.max(-20, Math.min(innerWidth - PW + 20, bx)); by = Math.max(-30, Math.min(innerHeight - PH, by));
  const mirrored = () => bcv.style.transform.indexOf('scaleX(-1)') >= 0;
  const savePos = () => store.set(Object.assign(store.get(), { pos: [bx / innerWidth, by / innerHeight], item }));
  function place() { B.style.left = bx + 'px'; B.style.top = by + 'px'; }
  let bt; function say(t, ms) { if (!t) return; bub.textContent = t; bub.classList.add('show'); clearTimeout(bt); bt = setTimeout(() => bub.classList.remove('show'), ms || 1800); }
  let nt; function narrate(t, ms) { if (!t) return; narr.textContent = t; narr.classList.toggle('flip', bx + PW / 2 > innerWidth / 2); narr.classList.toggle('side', mode === 'peek'); narr.classList.add('show'); clearTimeout(nt); nt = setTimeout(() => narr.classList.remove('show'), ms || 4200); }
  const busy = () => ['entrance', 'charge', 'squad', 'thrown', 'teleport', 'timewalk'].includes(mode) || fxBusy;
  function anim(k) { emote = k; ef = 0; mode = 'emote'; }
  function unstick() { if (mode === 'peek' || mode === 'hang') { bcv.style.transform = ''; bx = Math.max(10, Math.min(innerWidth - PW - 10, bx)); if (by < 0) by = 10; place(); } }

  function play(k) {
    if (busy()) return;
    if (k === 'walk') return startWalk();
    if (k === 'dash') return startDash();
    unstick();
    if (k.startsWith('m_')) return magic(k);
    if (k === 'p_gift') return giftBox();
    if (k === 'p_snack') return snack();
    if (k === 'p_float') { anim('float'); return say('Finding my center…'); }
    if (k === 'p_nap') { anim('nap'); return say('Just five minutes…'); }
    anim(k); const e = EMOTES[k];
    if (k === 'knockdown') say(e.say, 3600); else say(e.gift ? `${e.say} (${e.gift})` : e.say);
    if (k === 'fan') setTimeout(() => moveFan(), 360);
    if (k === 'chain') setTimeout(() => moveChain(), 120);
    if (k === 'spark') setTimeout(() => moveSpark(), 480);
    if (k === 'staff') setTimeout(() => moveShock(), 1180);
  }

  /* where did we drop her? side = peek, top = hang, else land dizzy */
  function settle() {
    const W = innerWidth; bcv.style.transform = '';
    if (bx < 40) { bx = -Math.round(PW * 0.44); mode = 'peek'; emote = 'peek'; ef = 0; peekT = 0; setTimeout(() => narrate(pick(NARRATION.peek)), 500); }
    else if (bx > W - PW - 40) { bx = W - Math.round(PW * 0.56); mode = 'peek'; emote = 'peek'; ef = 0; peekT = 0; bcv.style.transform = 'scaleX(-1)'; setTimeout(() => narrate(pick(NARRATION.peek)), 500); }
    else if (by < 30) { by = -(2 + OY + 18 - 20) * SC + 4; mode = 'hang'; emote = 'hang'; say('Hangin\' in there!'); }
    else { anim('dizzy'); say('The room is spinning…', 1400); }
    place(); savePos();
  }
  let peekLast = -1; const pick = (arr) => { let i; do { i = Math.floor(Math.random() * arr.length); } while (arr.length > 1 && i === peekLast); peekLast = i; return arr[i]; };

  /* ---------- screen effects (one shared full-screen canvas) ---------- */
  const fx = document.createElement('canvas'); fx.className = 'mp-fx'; root.appendChild(fx); const fctx = fx.getContext('2d');
  const handPos = () => { const m = bx + PW / 2 > innerWidth / 2; return { dir: m ? -1 : 1, x: m ? bx + PW - (OX + 4 + 33) * SC : bx + (OX + 4 + 33) * SC, y: by + (OY + 2 + 18 + 3) * SC }; };
  const center = () => ({ x: bx + PW / 2, y: by + (OY + 2 + 20) * SC });
  const pixelText = (t, x, y, col, px) => { fctx.font = `${px || 14}px "Press Start 2P", monospace`; fctx.fillStyle = '#0b0618'; fctx.fillText(t, x + 3, y + 3); fctx.fillStyle = col; fctx.fillText(t, x, y); };
  let fxBusy = false;
  function runFx(len, draw, done) {
    fx.width = innerWidth; fx.height = innerHeight; fxBusy = true; let t = 0;
    (function tick() { t++; fctx.clearRect(0, 0, fx.width, fx.height); fctx.imageSmoothingEnabled = false; const keep = draw(t); if (t < len || keep === true) requestAnimationFrame(tick); else { fctx.clearRect(0, 0, fx.width, fx.height); fxBusy = false; done && done(); } })();
  }
  const puff = (x, y, col, t, len) => { const p = t / len; for (let k = 0; k < 10; k++) { const a = k / 10 * 6.28; fctx.globalAlpha = 1 - p; fctx.fillStyle = k % 2 ? '#fff' : col; fctx.fillRect(x + Math.cos(a) * p * 40 - 4, y + Math.sin(a) * p * 30 - 4, 8, 8); } fctx.globalAlpha = 1; };
  function faceDir() { const h = handPos(); bcv.style.transform = h.dir < 0 ? 'scaleX(-1)' : ''; return h; }
  function drawFan(x, y, rot, sz) {
    fctx.save(); fctx.translate(x, y); fctx.rotate(rot);
    for (let k = 0; k < 7; k++) { fctx.save(); fctx.rotate(-1.2 + k * 0.4); fctx.fillStyle = KENTE[k % 8]; fctx.fillRect(0, -sz * 0.12, sz, sz * 0.24); fctx.fillStyle = P.goldD; fctx.fillRect(sz * 0.8, -sz * 0.12, sz * 0.2, sz * 0.24); fctx.restore(); }
    fctx.fillStyle = P.gold; fctx.fillRect(-4, -4, 8, 8); fctx.restore();
  }
  function moveFan() {
    const h = faceDir(); const D = Math.min(innerWidth * 0.7, 720); const trail = []; const len = reduced ? 40 : 70;
    runFx(len, (t) => { const p = t / len, x = h.x + h.dir * D * Math.sin(Math.PI * p), y = h.y - 60 * Math.sin(2 * Math.PI * p) - 10;
      trail.push([x, y]); if (trail.length > 14) trail.shift();
      trail.forEach(([tx, ty], i) => { fctx.globalAlpha = (i / trail.length) * 0.6; fctx.fillStyle = i % 2 ? P.goldL : P.gold; fctx.fillRect(tx - 8, ty - 8, 16, 16); });
      fctx.globalAlpha = 1; drawFan(x, y, t * 0.5, 34);
      if (t > len * 0.3 && t < len * 0.7) pixelText('I SEE IT!', h.x + h.dir * D * 0.55 - 60, h.y - 90, P.goldL, 14);
    }, () => { bcv.style.transform = ''; });
  }
  function moveChain() {
    const h = faceDir(); const end = h.dir > 0 ? innerWidth - 40 : 40; const D = Math.abs(end - h.x); const len = reduced ? 50 : 80;
    runFx(len, (t) => { const g = t < 22 ? t / 22 : t < 58 ? 1 : Math.max(0, 1 - (t - 58) / 18); const tip = h.x + h.dir * D * g;
      for (let d = 0; d < D * g; d += 14) { const lx = h.x + h.dir * d; fctx.fillStyle = (d / 14) % 2 ? P.gold : P.goldD; if ((d / 14) % 2) fctx.fillRect(lx - 6, h.y - 3, 12, 6); else fctx.fillRect(lx - 3, h.y - 6, 6, 12); }
      fctx.fillStyle = '#fff'; fctx.fillRect(tip - 7, h.y - 7, 14, 14); fctx.fillStyle = P.gold; fctx.fillRect(tip - 4, h.y - 4, 8, 8);
      if (g >= 1 && !reduced) { for (let k = 0; k < 3; k++) { const r = 14 + ((t * 3 + k * 16) % 48); fctx.globalAlpha = 1 - r / 62; fctx.strokeStyle = P.goldL; fctx.lineWidth = 4; fctx.beginPath(); fctx.arc(tip, h.y, r, h.dir > 0 ? -1 : 2.14, h.dir > 0 ? 1 : 4.14); fctx.stroke(); } fctx.globalAlpha = 1; }
      if (g >= 1) pixelText('SPEAK UP!', tip - (h.dir > 0 ? 170 : -20), h.y - 40, P.goldL, 16);
    }, () => { bcv.style.transform = ''; });
  }
  function moveSpark() {
    const cx = bx + PW / 2, top = by + 30; const parts = Array.from({ length: 10 }, (_, i) => ({ a: -Math.PI / 2 + (i - 4.5) * 0.32, v: 5 + (i % 3) })); const len = reduced ? 40 : 75;
    runFx(len, (t) => {
      if (t < 15) { const y = top - t * 6; fctx.fillStyle = 'rgba(246,185,59,.5)'; fctx.fillRect(cx - 14, y - 14, 28, 28); fctx.fillStyle = P.goldL; fctx.fillRect(cx - 8, y - 8, 16, 16); fctx.fillStyle = '#fff'; fctx.fillRect(cx - 4, y - 4, 8, 8); return; }
      const k = t - 15, oy = top - 90;
      parts.forEach((p, i) => { const x = cx + Math.cos(p.a) * p.v * k * 2.2, y = oy + Math.sin(p.a) * p.v * k * 2.2 + 0.18 * k * k; fctx.globalAlpha = Math.max(0, 1 - k / (len - 15)); fctx.fillStyle = i % 2 ? P.gold : '#fff'; fctx.fillRect(x - 4, y - 1, 8, 2); fctx.fillRect(x - 1, y - 4, 2, 8); });
      fctx.globalAlpha = 1; if (k < 30) pixelText('YOUR TURN!', cx - 70, oy - 20, P.goldL, 13);
    });
  }
  function moveShock() {
    const cx = bx + PW / 2, fy = by + PH - 14; const len = reduced ? 25 : 40;
    runFx(len, (t) => { const r = t * 9; fctx.globalAlpha = 1 - t / len; fctx.strokeStyle = P.gold; fctx.lineWidth = 6; fctx.beginPath(); fctx.ellipse(cx, fy, r, r * 0.22, 0, 0, 6.28); fctx.stroke(); fctx.globalAlpha = 1; });
  }

  /* ---------- tiny shadow target ---------- */
  const TS = 4, BAR = 8; const tcv = document.createElement('canvas'); tcv.className = 'mp-target'; tcv.hidden = true; root.appendChild(tcv); const tctx = tcv.getContext('2d');
  const powEl = (text, x, y, big) => { const d = document.createElement('div'); d.className = 'mp-pow' + (big ? ' big' : ''); d.textContent = text; d.style.left = x + 'px'; d.style.top = y + 'px'; root.appendChild(d); setTimeout(() => d.remove(), 900); };
  let target = null, targetIdle = 0;
  function sizeTarget(t) { const w = t.s.grid[0].length * TS, h = t.s.grid.length * TS + BAR; tcv.width = w; tcv.height = h; tcv.style.width = w + 'px'; tcv.style.height = h + 'px'; t.w = w; t.h = h; }
  function spawnTarget() {
    if (target) { targetIdle = 0; return target; }
    const left = bx + PW / 2 > innerWidth / 2;
    const x = left ? Math.max(40, bx - Math.min(420, innerWidth * 0.35)) : Math.min(innerWidth - 120, bx + PW + Math.min(360, innerWidth * 0.3));
    const y = Math.max(60, Math.min(innerHeight - 160, by + 30));
    target = { s: SHADOWS[Math.floor(Math.random() * SHADOWS.length)], x, y, flash: 0, slow: 0, frozen: false, candy: 0, born: frame,
      ox: 0, oy: 0, rot: 0, sx: 1, sy: 1, vx: 0, vy: 0, vr: 0, state: 'idle', st: 0, stop: 0, grow: 0 };
    sizeTarget(target); tcv.hidden = false; tcv.style.transform = ''; say(`A wild ${target.s.name} appeared!`, 1600); targetIdle = 0; return target;
  }
  let lastT = { x: innerWidth / 2, y: innerHeight / 2 };
  const tCenter = () => { if (target) lastT = { x: target.x + target.ox + target.w / 2, y: target.y + target.oy + target.h / 2 }; return lastT; };
  const awayDir = () => (target && target.x + target.w / 2 < bx + PW / 2 ? -1 : 1) * (bx + PW / 2 > innerWidth / 2 ? 1 : 1);
  const POWS = ['POW!', 'BAM!', 'WHAM!', 'ZAP!', 'BONK!'];
  function hitTarget(big) {
    if (!target) return; const t = target; targetIdle = 0; const dir = awayDir() || -1; const c = tCenter();
    t.flash = big ? 16 : 10; t.stop = reduced ? 0 : big ? 7 : 4;
    if (big && !reduced && t.state !== 'away') { t.state = 'knock'; t.vx = dir * 7.5; t.vy = -10; t.vr = dir * 0.32; t.bounced = 0; powEl('K-POW!', c.x - 40, c.y - 70, true); }
    else if (t.state === 'idle' || t.state === 'getup') { t.ox += dir * (reduced ? 6 : 26); t.sx = 1.28; t.sy = 0.78; t.vr = dir * 0.12; t.rot = dir * 0.18; powEl(POWS[Math.floor(Math.random() * POWS.length)], c.x - 26, c.y - 60, false); }
  }
  function drawTarget() {
    if (!target) return; const t = target; targetIdle++;
    if (!t.fight && targetIdle > 600 && !fxBusy && mode !== 'emote') { target = null; tcv.hidden = true; const c = { x: t.x + t.w / 2, y: t.y + t.h / 2 }; runFx(24, (k) => puff(c.x, c.y, '#8b5cf6', k, 24)); return; }
    const slowed = frame < t.slow; const sp = t.frozen ? 0 : slowed ? 0.25 : 1;
    if (t.stop > 0) t.stop--; // hit-stop: freeze for a few frames on impact
    else if (!t.frozen) {
      if (t.state === 'knock' || t.state === 'away') {
        t.vy += 0.55; t.ox += t.vx; t.oy += t.vy; t.rot += t.vr;
        const sx0 = t.x + t.ox; if (t.state === 'knock' && (sx0 < 0 || sx0 > innerWidth - t.w)) { t.vx = -t.vx * 0.6; t.ox = sx0 < 0 ? -t.x : innerWidth - t.w - t.x; powEl('THUD!', t.x + t.ox + t.w / 2 - 26, t.y + t.oy, false); }
        if (t.state === 'knock' && t.oy >= 0 && t.vy > 0) { t.oy = 0; if (!t.bounced && Math.abs(t.vy) > 4) { t.vy = -t.vy * 0.35; t.bounced = 1; } else { t.state = 'down'; t.st = 0; t.vx = 0; t.vy = 0; t.vr = 0; } }
        if (t.state === 'away' && (t.y + t.oy > innerHeight + 80 || t.y + t.oy < -200 || t.x + t.ox < -200 || t.x + t.ox > innerWidth + 200 || t.st++ > 70)) { finishAway(t); return; }
      } else if (t.state === 'down') {
        const lie = (t.rot >= 0 ? 1 : -1) * Math.PI / 2; t.rot += (lie - t.rot) * 0.25; t.st++; if (t.st > 55) { t.state = 'getup'; t.st = 0; }
      } else if (t.state === 'getup' || t.state === 'idle') {
        t.ox *= 0.86; t.oy *= 0.86; t.rot *= 0.8; t.st++;
        if (t.state === 'getup' && Math.abs(t.ox) < 1 && Math.abs(t.rot) < 0.02) t.state = 'idle';
      }
      t.sx += (1 - t.sx) * 0.2; t.sy += (1 - t.sy) * 0.2;
    }
    t.phase = (t.phase || 0) + sp; const bob = t.frozen || t.state !== 'idle' ? 0 : Math.round(Math.sin(t.phase / (t.s.floaty ? 18 : 12)) * (t.s.floaty ? 6 : 3));
    const g = 1 + (t.grow || 0) * 0.25;
    tcv.style.left = t.x + 'px'; tcv.style.top = (t.y + bob) + 'px';
    tcv.style.transformOrigin = '50% 100%';
    tcv.style.transform = `translate(${t.ox}px, ${t.oy}px) rotate(${t.rot}rad) scale(${t.sx * g}, ${t.sy * g})`;
    tctx.clearRect(0, 0, tcv.width, tcv.height); tctx.imageSmoothingEnabled = false;
    if (frame < t.candy) { drawGrid(tctx, CANDY, CANDY_PAL, (t.w - CANDY[0].length * TS) / 2, t.h - CANDY.length * TS - 4, TS); t.flash = Math.max(0, t.flash - 1); return; }
    drawGrid(tctx, t.s.grid, t.s.pal, 0, BAR, TS, t.flash > 0 && t.flash % 4 < 2);
    if (t.state === 'down') { for (let k = 0; k < 3; k++) { const a = frame * 0.15 + k * 2.1; tctx.fillStyle = '#ffe066'; tctx.fillRect(t.w / 2 + Math.cos(a) * t.w * 0.3 - 3, BAR + 6 + Math.sin(a) * 4, 6, 6); } }
    if (t.fight) { tctx.fillStyle = '#000'; tctx.fillRect(4, 0, t.w - 8, 6); tctx.fillStyle = '#2a1240'; tctx.fillRect(5, 1, t.w - 10, 4); tctx.fillStyle = '#c084fc'; tctx.fillRect(5, 1, Math.round((t.w - 10) * (t.hp ?? 1)), 4); }
    if (slowed) { tctx.globalAlpha = 0.35; tctx.fillStyle = '#7cc8ff'; tctx.fillRect(0, BAR, tcv.width, tcv.height); tctx.globalAlpha = 1; }
    if (t.frozen) { tctx.globalAlpha = 0.4; tctx.fillStyle = '#c9c3ff'; tctx.fillRect(0, BAR, tcv.width, tcv.height); tctx.globalAlpha = 1; }
    t.flash = Math.max(0, t.flash - 1);
  }
  function finishAway(t) {
    const c = { x: Math.max(30, Math.min(innerWidth - 30, t.x + t.ox + t.w / 2)), y: Math.max(30, Math.min(innerHeight - 30, t.y + t.oy + t.h / 2)) };
    target = null; tcv.hidden = true; tcv.style.transform = '';
    const bits = Array.from({ length: 30 }, (_, i) => ({ a: i / 30 * 6.28, v: 2 + (i % 4) }));
    const go = () => runFx(55, (k) => { bits.forEach((b, i) => { fctx.globalAlpha = Math.max(0, 1 - k / 55); fctx.fillStyle = i % 3 === 0 ? '#fff' : i % 3 === 1 ? P.gold : '#8b5cf6'; fctx.fillRect(c.x + Math.cos(b.a) * b.v * k - 3, c.y + Math.sin(b.a) * b.v * k + 0.05 * k * k - 3, 6, 6); }); fctx.globalAlpha = 1; });
    if (fxBusy) setTimeout(go, 500); else go();
  }
  /* ---------- boss fight (when the pet is the only fighter) ---------- */
  function fightStart(gift) {
    unstick(); if (target) { target = null; tcv.hidden = true; }
    spawnTarget(); target.s = SHADOWS[(gift - 1) % SHADOWS.length]; target.fight = true; target.hp = 1; target.born = frame; sizeTarget(target);
    // keep the fight in the side space: put the opponent just above her
    target.x = Math.max(10, Math.min(innerWidth - target.w - 10, bx + PW / 2 - target.w / 2)); target.y = Math.max(70, by - target.h - 10);
    target.grow = 0;
    say(`${target.s.name}! Let's go!`, 1800);
  }
  function bolt(big, then) {
    if (!target) return then && then();
    if (fxBusy) { then && then(); return; }
    const h = faceDir(); const len = big ? 34 : 18;
    runFx(len, (t) => { const tc = tCenter(); const p = Math.min(1, t / (big ? 14 : 12)); const x = h.x + (tc.x - h.x) * p, y = h.y + (tc.y - h.y) * p;
      if (big) { fctx.save(); fctx.translate(h.x, h.y); fctx.rotate(Math.atan2(tc.y - h.y, tc.x - h.x)); const d = Math.hypot(tc.x - h.x, tc.y - h.y) * p; fctx.fillStyle = 'rgba(246,185,59,.35)'; fctx.fillRect(0, -16, d, 32); fctx.fillStyle = P.goldL; fctx.fillRect(0, -8, d, 16); fctx.fillStyle = '#fff'; fctx.fillRect(0, -3, d, 6); fctx.restore(); }
      else { fctx.fillStyle = 'rgba(246,185,59,.5)'; fctx.fillRect(x - 9, y - 9, 18, 18); fctx.fillStyle = '#fff'; fctx.fillRect(x - 4, y - 4, 8, 8); }
      if (p >= 1) { const k = t - (big ? 14 : 12); if (k === 0) then && then(); puff(tc.x, tc.y, big ? '#ff6fae' : P.gold, Math.min(k, 20), 20); if (big && k < 18) pixelText('COMBO!', tc.x - 40, tc.y - 56, P.goldL, 13); }
    }, () => { bcv.style.transform = ''; });
  }
  function fightHit(hpAfter, heavy) {
    if (!target || !target.fight) return play(heavy ? 'heavy' : 'light');
    if (!busy()) { unstick(); anim(heavy ? 'heavy' : 'light'); say(heavy ? 'Rising light!' : 'Hi-yah!', 800); }
    setTimeout(() => bolt(heavy, () => { hitTarget(heavy); if (target) target.hp = hpAfter; }), heavy ? 260 : 120);
  }
  function fightHurt() {
    if (target && target.fight && target.s.grows) { // the Doubt Gremlin grows when you miss
      target.grow = Math.min(3, (target.grow || 0) + 1);
      setTimeout(() => say(['It got bigger!', 'Shake it off. It feeds on doubt.', 'Don\'t let it grow!'][Math.min(2, target.grow - 1)], 1600), 900);
    }
    if (target && target.fight && !reduced && target.state === 'idle') { const t0 = target; const c = center(); const toward = c.y > t0.y ? 40 : 0; const dxT = Math.sign(c.x - (t0.x + t0.w / 2)) * 30; let k = 0;
      const lunge = () => { k++; if (target !== t0) return; const p = k < 9 ? k / 9 : Math.max(0, 1 - (k - 9) / 12); t0.ox = dxT * p; t0.oy = toward * p; if (k === 9) { if (!busy()) { unstick(); anim('hit'); say('Ouch!', 800); } powEl('SMACK!', c.x - 40, c.y - 90, false); } if (k < 21) requestAnimationFrame(lunge); }; lunge(); }
    else if (!busy()) { unstick(); anim('hit'); say('Ouch!', 800); }
  }
  function fightWin() {
    if (target && target.fight) { const t = target; const c = tCenter(); const dir = awayDir() || -1;
      t.state = 'away'; t.st = 0; t.vx = dir * 11; t.vy = -13; t.vr = dir * 0.45; t.stop = reduced ? 0 : 9; t.flash = 20; t.hp = 0;
      powEl('K.O.!', c.x - 30, c.y - 80, true);
      if (reduced) finishAway(t); }
    setTimeout(() => { if (!busy()) { unstick(); anim('victory'); say('Badge earned!', 1600); } }, 500);
  }
  function drawGrid(c, grid, pal, x, y, sc, flash) { grid.forEach((row, r) => { for (let i = 0; i < row.length; i++) { const ch = row[i]; if (ch === '.') continue; c.fillStyle = flash ? '#fff' : pal[ch]; c.fillRect(x + i * sc, y + r * sc, sc, sc); } }); }

  /* ---------- magic moves ---------- */
  function magic(k) {
    const needsTarget = ['m_orbit', 'm_spark', 'm_rune', 'm_dome', 'm_sky', 'm_time', 'm_candy'].includes(k);
    if (needsTarget) spawnTarget();
    const delay = needsTarget && frame - target.born < 5 ? 700 : 0;
    setTimeout(() => ({ m_orbit: mOrbit, m_spark: mSpark, m_sigil: mSigil, m_rune: mRune, m_element: mElement, m_dome: mDome, m_sky: mSky, m_time: mTime, m_candy: mCandy })[k](), delay);
  }
  const orb = (x, y, r) => { fctx.fillStyle = 'rgba(246,185,59,.35)'; fctx.fillRect(x - r - 4, y - r - 4, (r + 4) * 2, (r + 4) * 2); fctx.fillStyle = P.goldL; fctx.fillRect(x - r, y - r, r * 2, r * 2); fctx.fillStyle = '#fff'; fctx.fillRect(x - r / 2, y - r / 2, r, r); };
  function mOrbit() { // Halo Orbit
    anim('orbitPose'); say('Halo Orbit!'); const len = 110;
    runFx(len, (t) => { const c = center(), tc = tCenter();
      if (t < 70) { const a = t * 0.18; orb(c.x + Math.cos(a) * 80, c.y + Math.sin(a) * 34 - 10, 7); return; }
      const sx = c.x + (tc.x > c.x ? 70 : -70), sy = c.y - 10; orb(sx, sy, 7);
      fctx.fillStyle = P.goldL; const L = Math.min(sx, tc.x), W = Math.abs(tc.x - sx); const g = Math.min(1, (t - 70) / 8);
      fctx.save(); fctx.translate(sx, sy); fctx.rotate(Math.atan2(tc.y - sy, tc.x - sx)); const d = Math.hypot(tc.x - sx, tc.y - sy) * g; fctx.fillRect(0, -5, d, 10); fctx.fillStyle = '#fff'; fctx.fillRect(0, -2, d, 4); fctx.restore();
      if (t === 79) hitTarget(true);
    });
  }
  function mSpark() { // Ever-Spark: drifts slowly, hovering, until it touches the shadow
    anim('cast'); say('Ever-Spark!'); const h = handPos(); let x = h.x, y = h.y, t0 = 0, this_hit = false, hitAt = 0;
    runFx(30, (t) => { t0 = t; const tc = tCenter(); const dx = tc.x - x, dy = tc.y - y, d = Math.hypot(dx, dy);
      if (d > 18) { x += dx / d * 2.6; y += dy / d * 2.6 + Math.sin(t / 7) * 1.8; const pul = t % 10 < 5 ? 2 : 0; fctx.fillStyle = 'rgba(176,124,255,.45)'; fctx.fillRect(x - 9 - pul, y - 9 - pul, 18 + pul * 2, 18 + pul * 2); fctx.fillStyle = P.goldL; fctx.fillRect(x - 5, y - 5, 10, 10); fctx.fillStyle = '#fff'; fctx.fillRect(x - 2, y - 2, 4, 4); return true; }
      if (!this_hit) { this_hit = true; hitTarget(false); hitAt = t; }
      puff(tc.x, tc.y, P.gold, t - hitAt, 20); return t - hitAt < 20;
    });
  }
  function mSigil() { // Sigil Step: vanish, reappear on the other side
    anim('sigil'); say('Sigil Step!'); mode = 'teleport'; const from = bx; const to = Math.max(10, Math.min(innerWidth - PW - 10, innerWidth - bx - PW));
    runFx(80, (t) => { const fy = by + PH - 14; const drawCircle = (cx, a) => { fctx.globalAlpha = a; fctx.strokeStyle = '#b07cff'; fctx.lineWidth = 4; fctx.beginPath(); fctx.ellipse(cx, fy, 70, 14, 0, 0, 6.28); fctx.stroke(); fctx.strokeStyle = P.gold; fctx.lineWidth = 2; fctx.beginPath(); fctx.ellipse(cx, fy, 46, 9, 0, 0, 6.28); fctx.stroke(); fctx.globalAlpha = 1; };
      if (t < 40) { drawCircle(from + PW / 2, 1); B.style.opacity = t < 20 ? 1 : 1 - (t - 20) / 20; }
      else { if (t === 40) { bx = to; place(); } drawCircle(to + PW / 2, 1 - (t - 60) / 20 > 1 ? 1 : Math.max(0, 1 - (t - 60) / 20)); B.style.opacity = Math.min(1, (t - 40) / 20); }
    }, () => { B.style.opacity = 1; mode = 'idle'; emote = 'idle'; ef = 0; savePos(); say('Ta-da!'); });
  }
  function mRune() { // Rune Lock: slows the shadow
    anim('cast'); say('Rune Lock!'); if (target) target.slow = frame + 240;
    runFx(70, (t) => { const tc = tCenter(); const r = 38; fctx.globalAlpha = Math.min(1, t / 10) * (t > 55 ? (70 - t) / 15 : 1); fctx.strokeStyle = '#7cc8ff'; fctx.lineWidth = 3;
      fctx.beginPath(); fctx.arc(tc.x, tc.y - 50, r * 0.5, 0, 6.28); fctx.stroke(); fctx.save(); fctx.translate(tc.x, tc.y - 50); fctx.rotate(t * 0.05); for (let k = 0; k < 6; k++) { fctx.rotate(1.047); fctx.fillStyle = k % 2 ? '#7cc8ff' : P.gold; fctx.fillRect(r * 0.5, -3, 8, 6); } fctx.restore();
      fctx.globalAlpha = 1; if (t > 20) pixelText('SLOWED', tc.x - 40, tc.y - 84, '#7cc8ff', 12); });
  }
  function mElement() { // Element Switch: fire, ice, lightning, wind
    anim('element'); say('Element Switch!'); const parts = [];
    runFx(168, (t) => { const h = handPos(), c = center(); const ph = Math.min(3, Math.floor(t / 42)); const lab = ['FIRE', 'ICE', 'LIGHTNING', 'WIND'][ph];
      const ex = ph === 0 ? h.x : ph === 3 ? c.x + 40 * h.dir : c.x, ey = ph === 2 ? by + 20 : ph === 1 ? by + 60 : h.y;
      if (ph === 0) { for (let k = 0; k < 3; k++) parts.push({ x: ex + (Math.random() - .5) * 16, y: ey, vx: h.dir * (1 + Math.random() * 2), vy: -1 - Math.random() * 2, l: 26, c: Math.random() < .5 ? '#ff6a00' : '#ffd23f' }); }
      if (ph === 1 && t % 4 === 0) { for (let k = 0; k < 2; k++) parts.push({ x: ex + (Math.random() - .5) * 60, y: ey + (Math.random() - .5) * 40, vx: 0, vy: 0.3, l: 30, c: '#bff4ff', ice: true }); }
      if (ph === 2 && t % 6 < 3) { fctx.strokeStyle = '#ffe066'; fctx.lineWidth = 4; fctx.beginPath(); let lx = ex, ly = ey; fctx.moveTo(lx, ly); for (let k = 0; k < 6; k++) { lx += (Math.random() - .5) * 30; ly -= 14; fctx.lineTo(lx, ly); } fctx.stroke(); }
      if (ph === 3) { for (let k = 0; k < 3; k++) { const a = t * 0.2 + k * 2.1, r = 20 + ((t * 2 + k * 15) % 40); fctx.strokeStyle = 'rgba(255,255,255,.7)'; fctx.lineWidth = 3; fctx.beginPath(); fctx.arc(ex, ey, r, a, a + 1.4); fctx.stroke(); } }
      parts.forEach(p => { p.x += p.vx; p.y += p.vy; p.l--; fctx.globalAlpha = Math.max(0, p.l / 30); fctx.fillStyle = p.c; if (p.ice) { fctx.fillRect(p.x - 1, p.y - 5, 2, 10); fctx.fillRect(p.x - 5, p.y - 1, 10, 2); } else fctx.fillRect(p.x - 3, p.y - 3, 6, 6); });
      for (let i = parts.length - 1; i >= 0; i--) if (parts[i].l <= 0) parts.splice(i, 1);
      fctx.globalAlpha = 1; pixelText(lab, c.x - lab.length * 6, by - 4, ['#ff8a3d', '#bff4ff', '#ffe066', '#ffffff'][ph], 12);
    });
  }
  function mDome() { // Light Dome: blocks one attack from the shadow
    anim('barrier'); say('Light Dome!');
    runFx(90, (t) => { const tc = tCenter(), c = center(); if (t > 14 && t < 46) { const p = (t - 14) / 32; const x = tc.x + (c.x - tc.x) * p * 0.8, y = tc.y + (c.y - tc.y) * p * 0.8; fctx.fillStyle = 'rgba(80,40,140,.6)'; fctx.fillRect(x - 12, y - 12, 24, 24); fctx.fillStyle = '#5b3a9a'; fctx.fillRect(x - 7, y - 7, 14, 14); }
      if (t >= 46 && t < 70) { puff(c.x + (tc.x - c.x) * 0.2, c.y, '#c4b5fd', t - 46, 24); pixelText('BLOCKED!', c.x - 60, by + 10, '#ffffff', 14); } });
  }
  function mSky() { // Sky Beam: orb rises over the shadow and fires down
    anim('cast'); say('Sky Beam!');
    runFx(95, (t) => { const c = center(), tc = tCenter(); const topY = Math.max(20, tc.y - 220);
      if (t < 34) { const p = t / 34; orb(c.x + (tc.x - c.x) * p, c.y + (topY - c.y) * p - Math.sin(p * Math.PI) * 60, 8); return; }
      orb(tc.x, topY, 8); if (t > 42) { const pu = t % 6 < 3 ? 3 : 0; fctx.fillStyle = 'rgba(246,185,59,.35)'; fctx.fillRect(tc.x - 20 - pu, topY, 40 + pu * 2, tc.y - topY + 30); fctx.fillStyle = P.goldL; fctx.fillRect(tc.x - 10, topY, 20, tc.y - topY + 30); fctx.fillStyle = '#fff'; fctx.fillRect(tc.x - 4, topY, 8, tc.y - topY + 30); if (t === 46) hitTarget(true); } });
  }
  function mTime() { // Time Hold: the page freezes while she strolls to a new spot
    say('Time Hold.', 1400); const page = root.parentElement && (root.parentElement.querySelector('[data-shake]') || document.querySelector('[data-shake]')); if (target) target.frozen = true;
    if (page) { page.style.transition = 'filter .3s'; page.style.filter = 'grayscale(.85) brightness(.75)'; }
    mode = 'timewalk'; emote = 'timewalk'; ef = 0; walkDir = bx + PW / 2 > innerWidth / 2 ? -1 : 1;
    runFx(150, (t) => { fctx.fillStyle = 'rgba(30,20,70,.22)'; fctx.fillRect(0, 0, fx.width, fx.height); pixelText('TIME HOLD', 24, 40, '#c4b5fd', 14); const cx = 60, cy = 80; fctx.strokeStyle = '#c4b5fd'; fctx.lineWidth = 3; fctx.beginPath(); fctx.arc(cx, cy, 16, 0, 6.28); fctx.stroke(); fctx.beginPath(); fctx.moveTo(cx, cy); fctx.lineTo(cx, cy - 11); fctx.stroke(); },
      () => { if (page) page.style.filter = ''; if (target) target.frozen = false; mode = 'idle'; emote = 'idle'; ef = 0; savePos(); say('…and we\'re back.'); });
  }
  function mCandy() { // Candy Curse
    anim('cast'); say('Candy Curse!');
    runFx(40, (t) => { const tc = tCenter(); puff(tc.x, tc.y, '#ff6fae', t, 40); if (t === 12 && target) target.candy = frame + 200; if (t > 10) pixelText('SWEET!', tc.x - 36, tc.y - 50, '#ff9cc6', 12); });
  }

  /* ---------- play: gift box + snack ---------- */
  function giftBox() { anim('giftbox'); say('Ooh, a present!'); const next = ITEMS[(ITEMS.findIndex(i => i[0] === item) + 1) % (ITEMS.length + 1)] || null;
    setTimeout(() => { item = next ? next[0] : null; savePos(); say(next ? `New item: ${next[1]}!` : 'Back to my classic look.', 2000); }, 1250); }
  function snack() { anim('snack'); say('Snack time!');
    setTimeout(() => { bcv.style.transition = 'transform .25s'; bcv.style.transformOrigin = 'bottom center'; bcv.style.transform = (mirrored() ? 'scaleX(-1) ' : '') + 'scale(1.3)'; say('POWER UP!', 1000); }, 1350);
    setTimeout(() => { bcv.style.transform = bcv.style.transform.replace('scale(1.3)', '').trim(); setTimeout(() => { bcv.style.transition = ''; }, 300); }, 2300); }

  /* ---------- clone squad (hold her still) ---------- */
  let drag = null, holdT = null, chargeF = 0, squad = null;
  const meter = document.createElement('div'); meter.className = 'mp-meter'; meter.innerHTML = '<i></i>'; B.appendChild(meter);
  function startCharge() { if (!drag || drag.moved || mode === 'nap') return; unstick(); drag.charging = true; menu.classList.remove('open'); bcv.style.transform = ''; mode = 'charge'; emote = 'charge'; ef = 0; chargeF = 0; meter.classList.add('on'); say('Charging…'); }
  function cancelCharge() { meter.classList.remove('on'); meter.firstChild.style.width = '0'; mode = 'idle'; emote = 'idle'; ef = 0; say('Aww, so close!'); }
  const CS = 2; // clones are smaller
  function makeClone(role, x) {
    const el = document.createElement('div'); el.className = 'mp-clone'; el.innerHTML = `<div class="mp-cbub"></div><canvas width="${SW * CS}" height="${SH * CS}"></canvas>`; root.appendChild(el);
    const cv = el.querySelector('canvas'); const ctx = cv.getContext('2d'); ctx.imageSmoothingEnabled = false;
    return { role, el, cv, ctx, bub: el.querySelector('.mp-cbub'), x, y: by + PH - SH * CS, gone: false, poofAt: 0 };
  }
  function cloneSay(cl, t) { cl.bub.textContent = t; cl.bub.classList.add('show'); setTimeout(() => cl.bub.classList.remove('show'), 1300); }
  function fireSquad() {
    meter.classList.remove('on'); meter.firstChild.style.width = '0'; if (drag) drag.fired = true;
    const dir = bx + PW / 2 > innerWidth / 2 ? -1 : 1; const base = dir > 0 ? bx + PW - 30 : bx - SW * CS + 30;
    const xs = [0, 1, 2].map(i => base + dir * i * (SW * CS - 4));
    squad = { t: 0, dir, clones: [makeClone('clumsy', xs[0]), makeClone('friendly', xs[1]), makeClone('late', xs[2])] };
    mode = 'squad'; emote = 'cheer'; ef = 0; say('Clone squad, assemble!');
    fx.width = innerWidth; fx.height = innerHeight;
  }
  function updateSquad() {
    const S = squad; S.t++; const t = S.t; let anyFx = false; fctx.clearRect(0, 0, fx.width, fx.height);
    S.clones.forEach((cl, i) => {
      if (cl.gone) { if (t - cl.poofAt < 24) { puff(cl.x + SW, cl.y + SH, P.gold, t - cl.poofAt, 24); anyFx = true; } return; }
      const born = i * 8; if (t < born) { cl.el.style.opacity = 0; return; }
      if (t - born < 20) { puff(cl.x + SW, cl.y + SH, '#b07cff', t - born, 20); anyFx = true; }
      cl.el.style.opacity = 0.92; let st;
      const lt = t - born;
      if (lt < 50) st = EMOTES.cheer.fn((lt + i * 7) % 45);                                   // team pose (a little out of sync)
      else if (cl.role === 'clumsy') { if (lt < 80) { st = EMOTES.walk.fn(lt); cl.x += S.dir * 2.2; } else if (lt < 82) { st = EMOTES.walk.fn(lt); cloneSay(cl, 'Oops!'); } else st = { arms: 'flail', legs: 'dangle', eyes: 'swirl', mouth: 'o', down: Math.min(1, (lt - 82) / 6), dizzy: true }; }
      else if (cl.role === 'friendly') { const r = cl.el.getBoundingClientRect(); const toward = mx > r.left + r.width / 2 ? 1 : -1; cl.cv.style.transform = toward < 0 ? 'scaleX(-1)' : ''; st = EMOTES.wave.fn(lt); if (lt === 52) cloneSay(cl, 'Hi, cursor!'); cl.x += toward * 0.4; }
      else { st = lt < 150 ? EMOTES.look.fn(lt) : { arms: 'flail', eyes: 'wide', mouth: 'o', excl: true }; if (lt === 150) cloneSay(cl, 'Wait for me!'); }
      if (t === 150 && cl.role !== 'late') { cl.gone = true; cl.poofAt = t; cl.el.remove(); return; }
      if (t === 205 && cl.role === 'late') { cl.gone = true; cl.poofAt = t; cl.el.remove(); return; }
      st.item = item; cl.el.style.left = cl.x + 'px'; cl.el.style.top = cl.y + 'px'; cl.ctx.clearRect(0, 0, cl.cv.width, cl.cv.height);
      front(st, frame + i * 13);
      if (st.down) { cl.ctx.save(); cl.ctx.translate(SW * CS / 2, (SH - 12) * CS); cl.ctx.rotate(-Math.PI / 2 * st.down); cl.ctx.translate(-SW * CS / 2, -(SH - 12) * CS); outline(cl.ctx, 0, 0, CS); cl.ctx.restore(); } else outline(cl.ctx, 0, 0, CS);
      extras(cl.ctx, st, lt, 0, 0, CS);
    });
    if (t > 232) { S.clones.forEach(cl => cl.el.remove()); squad = null; fctx.clearRect(0, 0, fx.width, fx.height); mode = 'emote'; emote = 'cheer'; ef = 0; say('Team DISRUPT!'); }
  }

  /* ---------- pointer: tap, drag, throw, hold ---------- */
  let clicks = [], vel = { x: 0, y: 0 }, lastMove = null;
  B.addEventListener('pointerdown', e => { if (e.target.closest('.mp-menu')) return; if (busy()) return; drag = { sx: e.clientX, sy: e.clientY, ox: bx, oy: by, moved: false, charging: false, fired: false, t0: performance.now() }; lastMove = { x: e.clientX, y: e.clientY, t: performance.now() }; vel = { x: 0, y: 0 }; B.setPointerCapture(e.pointerId); clearTimeout(holdT); holdT = setTimeout(startCharge, 450); });
  B.addEventListener('pointermove', e => {
    if (!drag || drag.fired) return; const dx = e.clientX - drag.sx, dy = e.clientY - drag.sy;
    const now = performance.now(); if (lastMove) { const dt = Math.max(1, now - lastMove.t); vel = { x: vel.x * 0.5 + 0.5 * (e.clientX - lastMove.x) / dt, y: vel.y * 0.5 + 0.5 * (e.clientY - lastMove.y) / dt }; } lastMove = { x: e.clientX, y: e.clientY, t: now };
    if (!drag.moved && Math.hypot(dx, dy) > 6) { if (drag.charging) { meter.classList.remove('on'); drag.charging = false; } clearTimeout(holdT); drag.moved = true; B.classList.add('dragging'); bcv.style.transform = ''; menu.classList.remove('open'); mode = 'held'; emote = 'struggle'; ef = 0; setTimeout(() => { if (mode === 'held') say('Put me down!', 1200); }, 900); }
    if (drag.moved) { bx = Math.max(-60, Math.min(innerWidth - PW + 60, drag.ox + dx)); by = Math.max(-60, Math.min(innerHeight - PH + 40, drag.oy + dy)); place(); }
  });
  B.addEventListener('pointerup', () => {
    if (!drag) return; clearTimeout(holdT); const d = drag; drag = null; B.classList.remove('dragging'); if (d.fired) return; if (d.charging) { cancelCharge(); return; }
    if (d.moved) { const sp = Math.hypot(vel.x, vel.y); if (sp > 0.9 && !reduced) { throwPet(vel.x * 16, vel.y * 16); } else settle(); return; }
    tapped();
  });
  function tapped() {
    if (mode === 'nap') { anim('wakeAngry'); say(EMOTES.wakeAngry.say, 2000); return; }
    const now = performance.now(); clicks = clicks.filter(c => now - c < 1500); clicks.push(now);
    if (clicks.length >= 4) { clicks = []; menu.classList.remove('open'); anim('annoyed'); say(EMOTES.annoyed.say); return; }
    if (mode === 'idle' || mode === 'emote') anim(['clickJump', 'clickFlinch', 'wave'][Math.floor(Math.random() * 3)]);
    toggleMenu();
  }
  function toggleMenu() { const leftSide = bx + PW / 2 > innerWidth / 2; menu.classList.toggle('left', leftSide); menu.classList.toggle('right', !leftSide); menu.style.top = Math.max(-by + 8, 0) + 'px'; menu.classList.toggle('open'); }
  B.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleMenu(); } });
  B.tabIndex = 0;
  document.addEventListener('pointerdown', e => { if (!B.contains(e.target)) menu.classList.remove('open'); });

  /* ---------- thrown: bounces off the screen edges ---------- */
  let tv = { x: 0, y: 0 };
  function throwPet(vx, vy) { tv = { x: Math.max(-28, Math.min(28, vx)), y: Math.max(-28, Math.min(28, vy)) }; mode = 'thrown'; emote = 'held'; ef = 0; say('Wheee!', 900); }
  function updateThrown() {
    tv.y += 0.7; bx += tv.x; by += tv.y; let bonk = false;
    if (bx < 0) { bx = 0; tv.x = -tv.x * 0.7; bonk = true; } if (bx > innerWidth - PW) { bx = innerWidth - PW; tv.x = -tv.x * 0.7; bonk = true; }
    if (by < 0) { by = 0; tv.y = -tv.y * 0.6; bonk = true; }
    const floor = innerHeight - PH; if (by > floor) { by = floor; tv.y = -tv.y * 0.45; tv.x *= 0.8; if (Math.abs(tv.y) > 3) bonk = true; }
    if (bonk) { say('Boing!', 600); bcv.style.transform = 'scale(1.1,0.9)'; setTimeout(() => { if (mode !== 'squad') bcv.style.transform = ''; }, 90); }
    place();
    if (by >= floor - 1 && Math.abs(tv.y) < 2 && Math.abs(tv.x) < 1) { anim('dizzy'); say('Ow. Worth it.', 1400); savePos(); }
  }

  /* ---------- cursor: dodge, swat, wave, hover, shake ---------- */
  let mx = -1, my = -1, cspeed = 0, lastP = null, flips = [], lastSign = 0, hovering = false, lastCursorAct = -9999, lastShake = -9999;
  addEventListener('pointermove', e => {
    const now = performance.now();
    if (lastP) { const dt = Math.max(1, now - lastP.t), dx = e.clientX - lastP.x; cspeed = cspeed * 0.7 + 0.3 * Math.hypot(dx, e.clientY - lastP.y) / dt;
      const sg = Math.sign(dx); if (Math.abs(dx) > 6 && sg && sg !== lastSign) { flips.push(now); lastSign = sg; } }
    lastP = { x: e.clientX, y: e.clientY, t: now }; mx = e.clientX; my = e.clientY;
    flips = flips.filter(f => now - f < 700);
    if (flips.length >= 7 && frame - lastShake > 240 && !drag) { flips = []; lastShake = frame; shakeReact(); }
  }, { passive: true });
  function shakeReact() { if (busy() || mode === 'nap' || mode === 'held') return; unstick(); anim('wobble'); say(EMOTES.wobble.say); }
  B.addEventListener('pointerenter', () => { hovering = true; if (mode === 'idle') say('Hi!', 900); });
  B.addEventListener('pointerleave', () => { hovering = false; });
  function cursorInfo() { if (mx < 0) return null; const r = B.getBoundingClientRect(); const dx = mx - (r.left + r.width / 2), dy = my - (r.top + r.height / 2); return { dx, dy, d: Math.hypot(dx, dy) }; }
  function gazeFor() { const ci = cursorInfo(); if (!ci) return null; return { x: ci.dx < -40 ? 0 : ci.dx > 40 ? 2 : 1, y: ci.dy < -30 ? 0 : 1, tilt: ci.dx < -90 ? -1 : ci.dx > 90 ? 1 : 0 }; }
  function cursorBehavior() {
    const ci = cursorInfo(); if (!ci || hovering) return false;
    if (ci.d < 130 && cspeed > 1.1 && frame - lastCursorAct > 90) { // dodge a fast cursor
      lastCursorAct = frame; dodgeDir = ci.dx > 0 ? -1 : 1; mode = 'dodge'; emote = 'jump'; ef = 0; if (Math.random() < 0.5) say('Nope!', 700); return true; }
    if (ci.d < 190 && ci.d > 90 && cspeed < 0.4 && frame - lastCursorAct > 480) { // slow cursor nearby: swat at it or wave
      lastCursorAct = frame; if (Math.random() < 0.5) { bcv.style.transform = ci.dx < 0 ? 'scaleX(-1)' : ''; anim('swat'); say('Gotcha!', 800); setTimeout(() => { if (mode !== 'peek') bcv.style.transform = ''; }, 650); } else { anim('wave'); say('Hey you!', 800); } return true; }
    return false;
  }
  let dodgeDir = 1;

  /* ---------- entrance: breaks out of the screen once a day ---------- */
  const crack = document.createElement('canvas'); crack.className = 'mp-crack'; root.appendChild(crack);
  function entrance() {
    const cx = bx + PW / 2, cy = by + PH / 2, cc = crack.getContext('2d'); crack.width = 260; crack.height = 260; crack.style.left = (cx - 130) + 'px'; crack.style.top = (cy - 130) + 'px';
    mode = 'entrance'; ef = 0; let k = 0;
    const tick = () => { k++; cc.clearRect(0, 0, 260, 260);
      if (k < 70) { const n = Math.min(3, 1 + Math.floor(k / 22)); cc.strokeStyle = 'rgba(255,224,138,.95)'; cc.lineWidth = 2; for (let j = 0; j < n * 5; j++) { const a = j * 1.3; cc.beginPath(); cc.moveTo(130, 130); cc.lineTo(130 + Math.cos(a) * (20 + n * 24), 130 + Math.sin(a) * (18 + n * 22)); cc.stroke(); } }
      else if (k < 110) { const p = (k - 70) / 40; for (let j = 0; j < 18; j++) { const a = j / 18 * 6.28, r = p * 130; cc.fillStyle = `rgba(246,185,59,${1 - p})`; cc.fillRect(130 + Math.cos(a) * r, 130 + Math.sin(a) * r + p * p * 40, 6, 6); } }
      else { crack.width = 0; mode = 'emote'; emote = 'cheer'; ef = 0; say('Let\'s disrupt!'); return; }
      requestAnimationFrame(tick); }; tick();
  }

  place();
  const today = new Date().toISOString().slice(0, 10);
  let pendingEntrance = !reduced && saved.entered !== today;
  if (!pendingEntrance && saved.pos) setTimeout(() => { settle(); bub.classList.remove('show'); narr.classList.remove('show'); }, 30);
  let walkDir = 1, walkLen = 0, peekT = 0; const ghosts = [];
  function startWalk() { unstick(); walkDir = bx + PW / 2 > innerWidth / 2 ? -1 : 1; walkLen = 120 + Math.floor(Math.random() * 120); bcv.style.transform = ''; mode = 'walk'; emote = 'walk'; ef = 0; }
  function startDash() { unstick(); walkDir = bx + PW / 2 > innerWidth / 2 ? -1 : 1; fx.width = innerWidth; fx.height = innerHeight; ghosts.length = 0; mode = 'dash'; emote = 'dash'; ef = 0; say('Dash!', 700); }
  function drawGhosts() { if (fxBusy) return; fctx.clearRect(0, 0, fx.width, fx.height); ghosts.forEach(([gx, gy], i) => { fctx.globalAlpha = 0.12 + i * 0.08; fctx.drawImage(bcv, gx, gy, PW, PH); }); fctx.globalAlpha = 1; }

  /* ---------- main draw ---------- */
  function drawPet() {
    if (root.hidden) return;
    if (pendingEntrance) { pendingEntrance = false; store.set(Object.assign(store.get(), { entered: today })); entrance(); }
    bctx.clearRect(0, 0, PW, PH); let st;
    if (mode === 'entrance') { st = { arms: 'press', mouth: 'grin', eyes: 'open' }; B.style.opacity = ef < 70 ? 0 : 1; }
    else if (mode === 'charge') { B.style.opacity = 1; chargeF++; st = EMOTES.charge.fn(Math.min(chargeF, 71)); meter.firstChild.style.width = Math.min(100, chargeF / 72 * 100) + '%'; if (chargeF >= 72) fireSquad(); }
    else if (mode === 'squad') { updateSquad(); st = EMOTES[squad ? (squad.t < 60 ? 'cheer' : 'idle') : 'cheer'].fn(ef % 45); }
    else if (mode === 'thrown') { updateThrown(); st = EMOTES.held.fn(ef); if (mode !== 'thrown') st = EMOTES.dizzy.fn(0); }
    else if (mode === 'peek') { // peeking in from the side; ducks out now and then
      peekT++; const cyc = peekT % 720; const hidden = cyc > 600 && cyc < 660; const side = mirrored() ? 1 : -1; const base = side < 0 ? -Math.round(PW * 0.44) : innerWidth - Math.round(PW * 0.56);
      const goal = hidden ? base + side * PW * 0.4 : base; bx += (goal - bx) * 0.2; place();
      if (cyc === 661) narrate(pick(NARRATION.peek));
      st = EMOTES.peek.fn(ef); if (hovering) { st.eyes = 'happy'; st.blush = true; }
    }
    else if (mode === 'teleport') { st = EMOTES.sigil.fn(ef); }
    else if (mode === 'timewalk') { bx = Math.max(10, Math.min(innerWidth - PW - 10, bx + walkDir * 1.5)); place(); st = EMOTES.timewalk.fn(ef); }
    else {
      B.style.opacity = 1;
      if (mode === 'walk') { bx += walkDir * 1.4; if (bx < 30 || bx > innerWidth - PW - 30 || ef > walkLen) { mode = 'idle'; emote = 'idle'; ef = 0; savePos(); } place(); }
      if (mode === 'dodge') { bx = Math.max(10, Math.min(innerWidth - PW - 10, bx + dodgeDir * 5)); place(); if (ef > 26) { mode = 'idle'; emote = 'idle'; ef = 0; savePos(); } }
      if (mode === 'dash') { const ox0 = bx; bx = Math.max(10, Math.min(innerWidth - PW - 10, bx + walkDir * 14)); ghosts.push([ox0, by]); if (ghosts.length > 5) ghosts.shift(); drawGhosts(); place(); if (ef >= 16) { anim('land'); ghosts.length = 0; setTimeout(() => { if (!fxBusy) fctx.clearRect(0, 0, fx.width, fx.height); }, 120); } }
      const hov = mode === 'idle' && hovering; const e = EMOTES[hov ? 'hover' : emote]; st = e.fn(ef % e.len);
      if (mode === 'emote' && ef >= e.len * (emote === 'land' ? 1 : 1.1)) { mode = 'idle'; emote = 'idle'; ef = 0; }
      if (mode === 'emote' && (emote === 'float' || emote === 'nap')) { mode = emote === 'nap' ? 'nap' : 'emote'; }
      if (mode === 'idle' && !hovering) {
        idleTimer++;
        if (!cursorBehavior() && idleTimer > 400) { idleTimer = 0; const r = Math.random();
          if (r < 0.3 && by > innerHeight * 0.5) startWalk(); else if (r < 0.62) { anim('float'); } else if (r < 0.85) { anim('nap'); mode = 'nap'; } else anim(['look', 'stretch'][Math.floor(Math.random() * 2)]); }
      }
    }
    if (mode === 'nap') { const e = EMOTES.nap; st = e.fn(ef % e.len); if (ef > e.len) { mode = 'emote'; emote = 'stretch'; ef = 0; say('Mmm, good nap.'); } }
    if (!['held', 'thrown', 'squad', 'nap', 'peek'].includes(mode) && (st.eyes == null || st.eyes === 'open') && !st.side) { const g = gazeFor(); if (g) { st.gaze = { x: mirrored() ? 2 - g.x : g.x, y: g.y }; if (mode === 'idle' && st.tilt == null) st.tilt = mirrored() ? -g.tilt : g.tilt; } }
    st.item = item;
    front(st, frame);
    if (st.down) { bctx.save(); bctx.translate(PW / 2, PH - 12 * SC); bctx.rotate(-Math.PI / 2 * st.down); bctx.translate(-PW / 2, -(PH - 12 * SC)); outline(bctx, 0, 0, SC); bctx.restore(); }
    else outline(bctx, st.shakeX && !reduced ? (frame % 4 < 2 ? -SC : SC) : 0, 0, SC);
    extras(bctx, st, ef, 0, 0, SC); ef++;
  }
  addEventListener('resize', () => { bx = Math.min(bx, innerWidth - PW + 12); by = Math.min(by, innerHeight - PH); place(); });
  let explainT = null;
  let raf; (function loop() { frame++; drawPet(); drawTarget(); raf = requestAnimationFrame(loop); })();

  /** Draws every pose into a canvas grid (preview pose sheet). */
  function sheet(cv, list) {
    const cell = 180, cols = 4, rowH = 176, rows = Math.ceil(list.length / cols); cv.width = cols * cell; cv.height = rows * rowH;
    const c = cv.getContext('2d'); c.imageSmoothingEnabled = false; c.fillStyle = '#140b2e'; c.fillRect(0, 0, cv.width, cv.height);
    list.forEach(([k, f, label, it], i) => {
      const x = (i % cols) * cell + (cell - SW * 2) / 2, y = Math.floor(i / cols) * rowH + 6; const st = Object.assign({}, EMOTES[k].fn(f), { item: it || null }); front(st, 7);
      if (st.down) { c.save(); c.translate(x + SW, y + (SH - 12) * 2); c.rotate(-Math.PI / 2); c.translate(-(x + SW), -(y + (SH - 12) * 2)); outline(c, x, y, 2); c.restore(); } else outline(c, x, y, 2);
      extras(c, st, f, x, y, 2);
      c.fillStyle = '#f6b93b'; c.font = '700 12px Montserrat, sans-serif'; c.textAlign = 'center'; c.fillText(label, (i % cols) * cell + cell / 2, y + SH * 2 + 20);
    });
  }
  /** Big close-up of her face for a list of expressions. */
  function face(cv, list) {
    const Z = 6, sx0 = 3, sy0 = 9, cw = 44, ch = 33, gap = 18, cols = 3, rows = Math.ceil(list.length / cols);
    cv.width = cols * (cw * Z + gap) - gap; cv.height = rows * (ch * Z + 40);
    const c = cv.getContext('2d'); c.imageSmoothingEnabled = false; c.fillStyle = '#140b2e'; c.fillRect(0, 0, cv.width, cv.height);
    list.forEach(([eyes, mouth, label], i) => { front({ arms: 'down', eyes, mouth }, 7); const x = (i % cols) * (cw * Z + gap), y = Math.floor(i / cols) * (ch * Z + 40);
      c.fillStyle = '#1e1446'; c.fillRect(x, y, cw * Z, ch * Z); c.drawImage(SB, sx0, sy0, cw, ch, x, y, cw * Z, ch * Z);
      c.fillStyle = '#f6b93b'; c.font = '800 16px Montserrat, sans-serif'; c.textAlign = 'center'; c.fillText(label, x + cw * Z / 2, y + ch * Z + 26); });
  }

  return {
    cheer: () => play('cheer'), flinch: () => play('hit'), victory: () => play('victory'), wave: () => play('wave'),
    rightAnswer: (combo) => play(combo && combo % 3 === 0 ? 'heavy' : 'light'), wrongAnswer: () => play('hit'),
    knockdown: () => play('knockdown'), defeat: () => play('defeat'), shake: shakeReact,
    narrate: (key) => narrate(NARRATION[key] || key), tip: (t) => say(t, 3200), play, sheet, face,
    fightStart, fightHit, fightHurt, fightWin,
    /** Points toward the page and "talks" for a while (used to read training quests). */
    explain: (text, ms) => {
      if (busy() || mode === 'held') return; unstick();
      const faceLeft = bx + PW / 2 > innerWidth / 2; bcv.style.transform = faceLeft ? 'scaleX(-1)' : '';
      emote = 'point'; ef = 0; mode = 'emote'; if (text) say(text, Math.min(ms, 2600));
      clearTimeout(explainT); explainT = setTimeout(() => { if (emote === 'point') { mode = 'idle'; emote = 'idle'; ef = 0; bcv.style.transform = ''; } }, ms);
    },
    stillThere: (n) => { if (busy() || mode === 'held') return; unstick(); bcv.style.transform = ''; anim('wave'); say(n > 1 ? 'Psst! Tap "Got it" whenever you\'re ready.' : 'Still there? Take your time!', 3200); },
    endFight: () => { if (target) { target = null; tcv.hidden = true; } },
    setHidden: (h) => { root.hidden = h; B.style.display = h ? 'none' : ''; tcv.style.display = h ? 'none' : ''; },
    destroy: () => { cancelAnimationFrame(raf); B.remove(); fx.remove(); crack.remove(); tcv.remove(); },
  };
}
