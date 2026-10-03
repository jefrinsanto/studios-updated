const sharp = require("sharp");
const fs = require("fs");

const W = 1000, H = 750;
const rng = (seed) => { let s = seed; return () => (s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296; };

const defs = `
<defs>
  <linearGradient id="gBV" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3B82F6"/><stop offset="1" stop-color="#A855F7"/></linearGradient>
  <linearGradient id="gBC" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3B82F6"/><stop offset="1" stop-color="#22D3EE"/></linearGradient>
  <linearGradient id="gVP" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#A855F7"/><stop offset="1" stop-color="#EC4899"/></linearGradient>
  <linearGradient id="glass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0.16"/><stop offset="1" stop-color="#fff" stop-opacity="0.03"/></linearGradient>
  <filter id="b40" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="40"/></filter>
  <filter id="b16" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="16"/></filter>
  <filter id="b5" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5"/></filter>
</defs>`;

const wrap = (body) => `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${defs}${body}</svg>`;

const base = (c1, c2, c3) => `
  <rect width="${W}" height="${H}" fill="#0B0D17"/>
  <ellipse cx="180" cy="120" rx="380" ry="260" fill="${c1}" opacity="0.30" filter="url(#b40)"/>
  <ellipse cx="860" cy="640" rx="380" ry="280" fill="${c2}" opacity="0.32" filter="url(#b40)"/>
  <ellipse cx="620" cy="260" rx="260" ry="200" fill="${c3}" opacity="0.18" filter="url(#b40)"/>`;

const stars = (seed, n, color = "#fff") => {
  const r = rng(seed); let out = "";
  for (let i = 0; i < n; i++) {
    out += `<circle cx="${(r() * W).toFixed(0)}" cy="${(r() * H).toFixed(0)}" r="${(r() * 1.6 + 0.4).toFixed(1)}" fill="${color}" opacity="${(r() * 0.5 + 0.1).toFixed(2)}"/>`;
  }
  return out;
};

// ---------- isometric helpers ----------
const iso = (ox, oy, S) => (x, y, z) => [ox + (x - y) * S, oy + ((x + y) * S) / 2 - z];
const pts = (a) => a.map((p) => p.map((n) => n.toFixed(1)).join(",")).join(" ");
function cube(P, x, y, z, w, d, h, f, so = 0.4, fo = 0.92) {
  const top = [P(x, y, z + h), P(x + w, y, z + h), P(x + w, y + d, z + h), P(x, y + d, z + h)];
  const left = [P(x, y + d, z), P(x + w, y + d, z), P(x + w, y + d, z + h), P(x, y + d, z + h)];
  const right = [P(x + w, y, z), P(x + w, y + d, z), P(x + w, y + d, z + h), P(x + w, y, z + h)];
  const st = `stroke="#BBD4FF" stroke-opacity="${so}" stroke-width="1.2" stroke-linejoin="round"`;
  return `<polygon points="${pts(left)}" fill="${f[1]}" fill-opacity="${fo}" ${st}/>
<polygon points="${pts(right)}" fill="${f[2]}" fill-opacity="${fo}" ${st}/>
<polygon points="${pts(top)}" fill="${f[0]}" fill-opacity="${fo}" ${st}/>`;
}

// ================= 1. WEB =================
function web() {
  const win = (x, y, w, h, hero, alpha, rot, rx, ry) => `
  <g opacity="${alpha}" transform="rotate(${rot} ${rx} ${ry})">
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="16" fill="#0f1424" fill-opacity="0.86" stroke="#fff" stroke-opacity="0.22" stroke-width="1.5"/>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="16" fill="url(#glass)"/>
    <line x1="${x}" y1="${y + 38}" x2="${x + w}" y2="${y + 38}" stroke="#fff" stroke-opacity="0.12"/>
    <circle cx="${x + 22}" cy="${y + 19}" r="5.5" fill="#f87171" opacity=".85"/>
    <circle cx="${x + 40}" cy="${y + 19}" r="5.5" fill="#facc15" opacity=".85"/>
    <circle cx="${x + 58}" cy="${y + 19}" r="5.5" fill="#4ade80" opacity=".85"/>
    <rect x="${x + 84}" y="${y + 10}" width="${w - 120}" height="18" rx="9" fill="#fff" opacity=".08"/>
    <rect x="${x + 20}" y="${y + 56}" width="${w - 40}" height="${h * 0.34}" rx="12" fill="url(#${hero})" opacity=".8"/>
    <rect x="${x + 44}" y="${y + 56 + h * 0.34 * 0.3}" width="${(w - 40) * 0.42}" height="11" rx="5.5" fill="#fff" opacity=".85"/>
    <rect x="${x + 44}" y="${y + 56 + h * 0.34 * 0.3 + 22}" width="${(w - 40) * 0.28}" height="8" rx="4" fill="#fff" opacity=".45"/>
    <rect x="${x + 44}" y="${y + 56 + h * 0.34 * 0.3 + 44}" width="70" height="24" rx="12" fill="#fff" opacity=".9"/>
    <rect x="${x + 20}" y="${y + 56 + h * 0.34 + 22}" width="${(w - 40) * 0.62}" height="10" rx="5" fill="#fff" opacity=".4"/>
    <rect x="${x + 20}" y="${y + 56 + h * 0.34 + 42}" width="${(w - 40) * 0.42}" height="8" rx="4" fill="#fff" opacity=".2"/>
    ${[0, 1, 2].map((i) => `<rect x="${x + 20 + i * ((w - 52) / 3 + 6)}" y="${y + 56 + h * 0.34 + 66}" width="${(w - 52) / 3}" height="${h * 0.16}" rx="10" fill="#fff" opacity=".07" stroke="#fff" stroke-opacity=".12"/>`).join("")}
  </g>`;
  const code = [[610, 300, 110, "#22D3EE"], [640, 300, 70, "#A855F7"], [610, 300, 0, ""]];
  const codeLines = (x, y) => {
    const rows = [[0, 90, "#3B82F6"], [24, 140, "#A855F7"], [24, 96, "#22D3EE"], [48, 60, "#EC4899"], [24, 120, "#3B82F6"], [0, 40, "#A855F7"]];
    return rows.map((r, i) => `<rect x="${x + r[0]}" y="${y + i * 22}" width="${r[1]}" height="9" rx="4.5" fill="${r[2]}" opacity=".75"/>`).join("");
  };
  return wrap(`
  ${base("#3B82F6", "#A855F7", "#22D3EE")}
  ${stars(7, 60)}
  <rect x="330" y="170" width="440" height="300" rx="40" fill="url(#gBC)" opacity=".5" filter="url(#b40)"/>
  ${win(520, 70, 340, 240, "gVP", 0.6, 7, 690, 190)}
  ${win(70, 330, 330, 230, "gBC", 0.75, -8, 235, 445)}
  ${win(230, 150, 500, 360, "gBV", 1, -4, 480, 330)}
  <g transform="translate(640 500)">
    <rect x="-16" y="-16" width="260" height="168" rx="14" fill="#0f1424" fill-opacity=".9" stroke="#fff" stroke-opacity=".2"/>
    ${codeLines(6, 8)}
  </g>
  <polygon points="700,395 700,437 711,427 719,446 729,442 721,423 736,423" fill="#fff" stroke="#0B0D17" stroke-width="2" stroke-linejoin="round"/>
  <g stroke="url(#gBC)" stroke-width="10" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity=".9">
    <polyline points="170,150 118,205 170,260"/><polyline points="290,150 342,205 290,260"/>
    <line x1="245" y1="140" x2="215" y2="270"/>
  </g>`);
}

// ================= 2. SOFTWARE =================
function software() {
  const P = iso(600, 250, 78);
  const blue = ["#5B8DEF", "#3559B8", "#2A3F94"];
  const violet = ["#A26BF5", "#6B3FC4", "#4E2E9B"];
  const cyan = ["#4FD8EE", "#1F93B4", "#17708C"];
  const heights = [[60, 110, 60], [110, 170, 90], [60, 90, 140]];
  const pal = [[blue, violet, blue], [violet, cyan, blue], [blue, blue, violet]];
  let cubes = "";
  const order = [];
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) order.push([i, j]);
  order.sort((a, b) => a[0] + a[1] - (b[0] + b[1]));
  const glowTops = [];
  for (const [i, j] of order) {
    const h = heights[i][j];
    cubes += cube(P, i * 1.2 + 0.1, j * 1.2 + 0.1, 0, 1, 1, h, pal[i][j], 0.5);
    const c = P(i * 1.2 + 0.6, j * 1.2 + 0.6, h);
    glowTops.push(c);
  }
  const slab = cube(P, -0.3, -0.3, -20, 3.9, 3.9, 20, ["#1a2140", "#10162e", "#0c1124"], 0.35, 0.95);
  const shadow = `<ellipse cx="600" cy="${P(1.8, 1.8, -20)[1] + 20}" rx="360" ry="130" fill="#000" opacity=".5" filter="url(#b16)"/>`;
  const glow = glowTops.map((c) => `<ellipse cx="${c[0]}" cy="${c[1]}" rx="36" ry="18" fill="#9CC3FF" opacity=".55" filter="url(#b16)"/>`).join("");
  const floaters = [[150, 190, 26], [860, 120, 20], [260, 470, 30], [880, 520, 22]].map(([x, y, s], k) => {
    const Q = iso(x, y, s);
    return cube(Q, 0, 0, 0, 1, 1, s * 0.9, k % 2 ? cyan : violet, 0.5, 0.85);
  }).join("");
  const links = `<g stroke="#9CC3FF" stroke-opacity=".35" stroke-dasharray="4 7" fill="none" stroke-width="1.6">
    <polyline points="190,215 330,300 470,330"/><polyline points="850,140 780,220 720,260"/><polyline points="290,490 420,540 500,540"/></g>`;
  return wrap(`
  ${base("#A855F7", "#3B82F6", "#6366F1")}
  ${stars(11, 50)}
  ${shadow}${slab}${cubes}${glow}${floaters}${links}`);
}

// ================= 3. MOBILE =================
function mobile() {
  const phone = (cx, cy, w, h, rot, alpha, grad) => {
    const x = -w / 2, y = -h / 2;
    return `<g transform="translate(${cx} ${cy}) rotate(${rot})" opacity="${alpha}">
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="38" fill="#0b0f1e" stroke="#fff" stroke-opacity=".3" stroke-width="2.5"/>
    <rect x="${x + 11}" y="${y + 11}" width="${w - 22}" height="${h - 22}" rx="30" fill="#111a38"/>
    <rect x="-30" y="${y + 20}" width="60" height="13" rx="6.5" fill="#05070d"/>
    <circle cx="${x + 38}" cy="${y + 68}" r="14" fill="url(#${grad})"/>
    <rect x="${x + 60}" y="${y + 58}" width="${w * 0.35}" height="8" rx="4" fill="#fff" opacity=".7"/>
    <rect x="${x + 60}" y="${y + 72}" width="${w * 0.22}" height="6" rx="3" fill="#fff" opacity=".3"/>
    <rect x="${x + 24}" y="${y + 100}" width="${(w - 64) / 2}" height="62" rx="12" fill="#fff" opacity=".07" stroke="#fff" stroke-opacity=".12"/>
    <rect x="${x + 24 + (w - 64) / 2 + 16}" y="${y + 100}" width="${(w - 64) / 2}" height="62" rx="12" fill="#fff" opacity=".07" stroke="#fff" stroke-opacity=".12"/>
    <rect x="${x + 36}" y="${y + 116}" width="30" height="7" rx="3.5" fill="#fff" opacity=".35"/>
    <rect x="${x + 36}" y="${y + 130}" width="52" height="14" rx="4" fill="url(#${grad})" opacity=".9"/>
    <rect x="${x + 24}" y="${y + 180}" width="${w - 48}" height="${h * 0.24}" rx="14" fill="#fff" opacity=".06" stroke="#fff" stroke-opacity=".12"/>
    <polyline points="${x + 38},${y + 180 + h * 0.2} ${x + 38 + (w - 76) * 0.2},${y + 180 + h * 0.15} ${x + 38 + (w - 76) * 0.4},${y + 180 + h * 0.17} ${x + 38 + (w - 76) * 0.6},${y + 180 + h * 0.09} ${x + 38 + (w - 76) * 0.8},${y + 180 + h * 0.11} ${x + 38 + (w - 76)},${y + 180 + h * 0.05}" fill="none" stroke="#22D3EE" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    ${[0, 1, 2].map((i) => `<rect x="${x + 24}" y="${y + 190 + h * 0.24 + i * 44}" width="${w - 48}" height="36" rx="11" fill="#fff" opacity=".06"/><circle cx="${x + 44}" cy="${y + 208 + h * 0.24 + i * 44}" r="8" fill="url(#gBV)" opacity=".85"/><rect x="${x + 62}" y="${y + 203 + h * 0.24 + i * 44}" width="${w * 0.38}" height="7" rx="3.5" fill="#fff" opacity=".4"/>`).join("")}
    <rect x="${x + 28}" y="${y + h - 66}" width="${w - 56}" height="40" rx="20" fill="url(#${grad})"/>
  </g>`;
  };
  const notif = (x, y, w, grad) => `<g>
    <rect x="${x}" y="${y}" width="${w}" height="62" rx="16" fill="#0f1424" fill-opacity=".85" stroke="#fff" stroke-opacity=".22"/>
    <rect x="${x}" y="${y}" width="${w}" height="62" rx="16" fill="url(#glass)"/>
    <circle cx="${x + 32}" cy="${y + 31}" r="14" fill="url(#${grad})"/>
    <rect x="${x + 58}" y="${y + 20}" width="${w * 0.5}" height="9" rx="4.5" fill="#fff" opacity=".75"/>
    <rect x="${x + 58}" y="${y + 38}" width="${w * 0.32}" height="7" rx="3.5" fill="#fff" opacity=".32"/></g>`;
  const rings = [150, 230, 310, 390].map((r, i) => `<circle cx="620" cy="390" r="${r}" fill="none" stroke="${i % 2 ? "#3B82F6" : "#A855F7"}" stroke-opacity="${0.28 - i * 0.05}" stroke-width="1.5" ${i % 2 ? 'stroke-dasharray="6 8"' : ""}/>`).join("");
  return wrap(`
  ${base("#3B82F6", "#6366F1", "#22D3EE")}
  ${stars(23, 55)}
  ${rings}
  <ellipse cx="560" cy="400" rx="230" ry="260" fill="url(#gBC)" opacity=".45" filter="url(#b40)"/>
  ${phone(410, 420, 230, 460, -10, 0.7, "gBV")}
  ${phone(640, 375, 260, 520, 7, 1, "gBC")}
  ${notif(780, 130, 190, "gVP")}
  ${notif(120, 190, 190, "gBC")}
  ${notif(150, 590, 180, "gBV")}`);
}

// ================= 4. AI =================
function ai() {
  const layers = [[150, 4], [340, 6], [530, 6], [700, 3]];
  const r = rng(5);
  const nodes = layers.map(([x, n]) => {
    const top = 130, bottom = 620, step = (bottom - top) / (n - 1 || 1);
    return Array.from({ length: n }, (_, i) => [x + (r() - 0.5) * 22, n === 1 ? 375 : top + i * step + (r() - 0.5) * 20]);
  });
  let lines = "", hot = "";
  for (let l = 0; l < nodes.length - 1; l++) {
    for (const a of nodes[l]) for (const b of nodes[l + 1]) {
      lines += `<line x1="${a[0].toFixed(0)}" y1="${a[1].toFixed(0)}" x2="${b[0].toFixed(0)}" y2="${b[1].toFixed(0)}" stroke="#7aa7ff" stroke-opacity=".16" stroke-width="1.3"/>`;
    }
  }
  const path = [[0, 1], [1, 3], [2, 2], [3, 1]];
  for (let k = 0; k < path.length - 1; k++) {
    const a = nodes[path[k][0]][path[k][1]], b = nodes[path[k + 1][0]][path[k + 1][1]];
    hot += `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="url(#gVP)" stroke-width="3.5" stroke-linecap="round"/>`;
  }
  const hotGlow = hot.replace(/stroke-width="3.5"/g, 'stroke-width="9"');
  const dots = nodes.map((col, li) => col.map((p, ni) => {
    const active = path.some((q) => q[0] === li && q[1] === ni);
    return `<circle cx="${p[0].toFixed(0)}" cy="${p[1].toFixed(0)}" r="${active ? 13 : 9}" fill="${active ? "url(#gVP)" : "#0f1424"}" stroke="${active ? "#fff" : "#8fb2ff"}" stroke-opacity="${active ? 0.9 : 0.6}" stroke-width="2"/>`;
  }).join("")).join("");
  const outLines = nodes[3].map((p) => `<line x1="${p[0].toFixed(0)}" y1="${p[1].toFixed(0)}" x2="850" y2="375" stroke="url(#gVP)" stroke-opacity=".55" stroke-width="2"/>`).join("");
  const sparkle = (x, y, s, o) => `<path d="M${x},${y - s} Q${x},${y} ${x + s},${y} Q${x},${y} ${x},${y + s} Q${x},${y} ${x - s},${y} Q${x},${y} ${x},${y - s}Z" fill="#fff" opacity="${o}"/>`;
  return wrap(`
  ${base("#A855F7", "#EC4899", "#3B82F6")}
  ${stars(31, 60)}
  ${lines}
  <g filter="url(#b16)">${hotGlow}</g>
  ${hot}
  ${outLines}
  <circle cx="850" cy="375" r="150" fill="url(#gVP)" opacity=".5" filter="url(#b40)"/>
  <circle cx="850" cy="375" r="128" fill="none" stroke="#fff" stroke-opacity=".18" stroke-dasharray="5 9"/>
  <circle cx="850" cy="375" r="98" fill="none" stroke="#fff" stroke-opacity=".25"/>
  <circle cx="850" cy="375" r="66" fill="url(#gVP)"/>
  <circle cx="850" cy="375" r="66" fill="url(#glass)"/>
  ${sparkle(850, 375, 30, 0.95)}
  ${dots}
  ${sparkle(120, 90, 16, 0.8)}${sparkle(560, 70, 12, 0.6)}${sparkle(930, 200, 14, 0.7)}${sparkle(400, 690, 14, 0.6)}`);
}

// ================= 5. CLOUD =================
function cloud() {
  const g = `<linearGradient id="cloudG" gradientUnits="userSpaceOnUse" x1="420" y1="70" x2="740" y2="260"><stop offset="0" stop-color="#7fb0ff"/><stop offset="1" stop-color="#b58cff"/></linearGradient>`;
  const shapes = `<circle cx="520" cy="185" r="62"/><circle cx="600" cy="150" r="86"/><circle cx="690" cy="188" r="64"/><circle cx="440" cy="215" r="46"/><circle cx="765" cy="218" r="48"/><rect x="440" y="190" width="325" height="74" rx="37"/>`;
  const rack = (ox, oy) => {
    const P = iso(ox, oy, 62);
    let s = cube(P, 0, 0, 0, 1, 1, 170, ["#3a4f96", "#22306a", "#182252"], 0.5, 0.95);
    for (let k = 0; k < 5; k++) {
      const z = 20 + k * 30;
      const q = [P(0.12, 1, z), P(0.88, 1, z), P(0.88, 1, z + 20), P(0.12, 1, z + 20)];
      s += `<polygon points="${pts(q)}" fill="#0b1024" fill-opacity=".85" stroke="#9CC3FF" stroke-opacity=".3"/>`;
      const led = P(0.22, 1, z + 10);
      s += `<circle cx="${led[0]}" cy="${led[1]}" r="3.4" fill="${k % 2 ? "#4ade80" : "#22D3EE"}"/>`;
      const led2 = P(0.34, 1, z + 10);
      s += `<circle cx="${led2[0]}" cy="${led2[1]}" r="3.4" fill="#A855F7" opacity=".9"/>`;
    }
    return s;
  };
  const racks = [[360, 520], [560, 585], [770, 520]];
  const rackTops = racks.map(([ox, oy]) => iso(ox, oy, 62)(0.5, 0.5, 170));
  const streams = rackTops.map(([x, y]) => `<line x1="600" y1="262" x2="${x}" y2="${y - 6}" stroke="url(#gBC)" stroke-width="2.4" stroke-dasharray="3 9" stroke-linecap="round"/>`).join("");
  const packets = rackTops.map(([x, y], i) => {
    const t = [0.35, 0.6, 0.8][i];
    const px = 600 + (x - 600) * t, py = 262 + (y - 6 - 262) * t;
    return `<circle cx="${px}" cy="${py}" r="6" fill="#22D3EE" filter="url(#b5)"/><circle cx="${px}" cy="${py}" r="3.4" fill="#fff"/>`;
  }).join("");
  const floor = [240, 340, 440].map((rx, i) => `<ellipse cx="565" cy="640" rx="${rx * 1.4}" ry="${rx * 0.36}" fill="none" stroke="${i % 2 ? "#A855F7" : "#3B82F6"}" stroke-opacity="${0.3 - i * 0.07}" stroke-width="1.5"/>`).join("");
  return wrap(`
  ${base("#3B82F6", "#6366F1", "#22D3EE")}
  <defs>${g}</defs>
  ${stars(41, 55)}
  ${floor}
  <g fill="url(#cloudG)" opacity=".55" filter="url(#b40)">${shapes}</g>
  ${streams}
  ${racks.map(([ox, oy]) => `<ellipse cx="${ox}" cy="${oy + 26}" rx="90" ry="30" fill="#000" opacity=".4" filter="url(#b16)"/>`).join("")}
  ${racks.map(([ox, oy]) => rack(ox, oy)).join("")}
  <g fill="url(#cloudG)" opacity=".95">${shapes}</g>
  ${packets}`);
}

// ================= 6. SECURITY =================
function security() {
  const hex = `<pattern id="hex" width="52" height="90" patternUnits="userSpaceOnUse">
    ${[[26, 30], [0, 75], [52, 75]].map(([cx, cy]) => `<polygon points="${cx},${cy - 30} ${cx + 26},${cy - 15} ${cx + 26},${cy + 15} ${cx},${cy + 30} ${cx - 26},${cy + 15} ${cx - 26},${cy - 15}" fill="none" stroke="#9CC3FF" stroke-opacity=".5" stroke-width="1.2"/>`).join("")}
  </pattern>
  <radialGradient id="rg" cx="0.62" cy="0.5" r="0.6"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#000"/></radialGradient>
  <mask id="fade"><rect width="${W}" height="${H}" fill="url(#rg)"/></mask>`;
  const shield = "M0,-170 L124,-124 L124,12 C124,100 58,158 0,186 C-58,158 -124,100 -124,12 L-124,-124 Z";
  const inner = "M0,-136 L98,-100 L98,10 C98,80 46,126 0,148 C-46,126 -98,80 -98,10 L-98,-100 Z";
  const cx = 640, cy = 375, sc = 1.55;
  const rings = [260, 340, 420].map((r, i) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${i % 2 ? "#3B82F6" : "#A855F7"}" stroke-opacity="${0.32 - i * 0.08}" stroke-width="1.6" ${i === 1 ? 'stroke-dasharray="4 9"' : ""}/>`).join("");
  const circuit = `<g fill="none" stroke="#7aa7ff" stroke-opacity=".5" stroke-width="2" stroke-linejoin="round">
    <polyline points="446,300 300,300 260,260 150,260"/><polyline points="446,380 280,380 240,420 120,420"/><polyline points="452,455 330,455 300,500 180,500"/></g>
    <g fill="#0B0D17" stroke="#22D3EE" stroke-width="2.4"><circle cx="150" cy="260" r="7"/><circle cx="120" cy="420" r="7"/><circle cx="180" cy="500" r="7"/></g>`;
  return wrap(`
  <defs>${hex}</defs>
  ${base("#A855F7", "#3B82F6", "#6366F1")}
  ${stars(53, 45)}
  <rect width="${W}" height="${H}" fill="url(#hex)" mask="url(#fade)" opacity=".55"/>
  ${rings}
  ${circuit}
  <g transform="translate(${cx} ${cy}) scale(${sc})">
    <path d="${shield}" fill="url(#gBV)" opacity=".7" filter="url(#b40)"/>
    <path d="${shield}" fill="#0f1530" fill-opacity=".9"/>
    <path d="${shield}" fill="url(#gBV)" fill-opacity=".38"/>
    <path d="${shield}" fill="url(#glass)"/>
    <path d="${shield}" fill="none" stroke="url(#gBC)" stroke-width="3.2" stroke-linejoin="round"/>
    <path d="${inner}" fill="none" stroke="#fff" stroke-opacity=".28" stroke-width="1.6" stroke-linejoin="round"/>
    <path d="M-30,-6 V-32 A30,30 0 0 1 30,-32 V-6" fill="none" stroke="#fff" stroke-width="11" stroke-linecap="round"/>
    <rect x="-48" y="-10" width="96" height="76" rx="16" fill="url(#gBC)"/>
    <rect x="-48" y="-10" width="96" height="76" rx="16" fill="url(#glass)"/>
    <circle cx="0" cy="24" r="10" fill="#0B0D17"/>
    <rect x="-4" y="26" width="8" height="20" rx="4" fill="#0B0D17"/>
  </g>`);
}

(async () => {
  const jobs = { web, software, mobile, ai, cloud, security };
  fs.mkdirSync("out", { recursive: true });
  for (const [name, fn] of Object.entries(jobs)) {
    const svg = fn();
    fs.writeFileSync(`out/${name}.svg`, svg);
    await sharp(Buffer.from(svg)).jpeg({ quality: 82, mozjpeg: true }).toFile(`out/${name}.jpg`);
    console.log("rendered", name, (fs.statSync(`out/${name}.jpg`).size / 1024).toFixed(0) + " KB");
  }
})().catch((e) => { console.error(e); process.exit(1); });
