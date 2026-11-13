// ظاهر «قالی‌باف»: هر ۵ مرحله یک قالی است؛ با هر مرحله یک ردیف از آن بافته می‌شود
(function () {
  "use strict";

  const ROWS = 5; // تعداد مرحله‌های هر قالی
  const IVORY = "#f4e9d4";

  function addLoom() {
    const warp = [];
    for (let x = -40; x <= 40; x += 3.2) warp.push(`<line x1="${x.toFixed(1)}" y1="-46" x2="${x.toFixed(1)}" y2="46"/>`);
    const pegs = Array.from({ length: 28 }, (_, i) => {
      const a = (i * Math.PI * 2) / 28;
      const x = (Math.cos(a) * 46.8).toFixed(2), y = (Math.sin(a) * 46.8).toFixed(2);
      return `<circle cx="${x}" cy="${(+y + 0.5).toFixed(2)}" r="1.6" fill="rgba(30, 14, 4, .45)"/><circle cx="${x}" cy="${y}" r="1.45" fill="url(#brass)"/>`;
    }).join("");
    const div = document.createElement("div");
    div.className = "loom";
    div.innerHTML = `<svg viewBox="-50 -50 100 100" aria-hidden="true">
        <defs>
          <radialGradient id="wood" cx=".4" cy=".32" r=".85"><stop offset="0" stop-color="#b98050"/><stop offset=".6" stop-color="#8a5530"/><stop offset="1" stop-color="#5a3318"/></radialGradient>
          <radialGradient id="brass" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#fff2c4"/><stop offset=".45" stop-color="#d4a548"/><stop offset="1" stop-color="#6e4a12"/></radialGradient>
          <radialGradient id="cloth-shade" r=".5"><stop offset=".72" stop-color="#3a1c14" stop-opacity="0"/><stop offset="1" stop-color="#3a1c14" stop-opacity=".38"/></radialGradient>
          <filter id="grain" x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence type="fractalNoise" baseFrequency=".035 .6" numOctaves="3" seed="5"/>
            <feColorMatrix values="0 0 0 0 .2  0 0 0 0 .1  0 0 0 0 .03  0 0 0 1.4 -.55"/>
            <feComposite in2="SourceGraphic" operator="in"/>
          </filter>
          <filter id="loom-pile" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="2" seed="9"/>
            <feColorMatrix values="0 0 0 0 .45  0 0 0 0 .28  0 0 0 0 .15  0 0 0 .9 -.35"/>
            <feComposite in2="SourceGraphic" operator="in"/>
          </filter>
          <clipPath id="loom-in"><circle r="43"/></clipPath>
        </defs>
        <circle r="50" fill="url(#wood)"/>
        <circle r="50" fill="#000" filter="url(#grain)"/>
        <circle r="49.3" fill="none" stroke="rgba(255, 225, 180, .35)" stroke-width=".7"/>
        ${pegs}
        <circle r="44.2" fill="#3c2010" opacity=".55"/>
        <circle r="43.5" fill="#f1e3c6"/>
        <g clip-path="url(#loom-in)">
          <circle r="43.5" fill="#000" filter="url(#loom-pile)"/>
          <g stroke="rgba(120, 76, 44, .4)" stroke-width=".55">${warp.join("")}</g>
          <polygon points="0,-17 15,0 0,17 -15,0" fill="#8e2424" opacity=".14"/>
          <polygon points="0,-9 8,0 0,9 -8,0" fill="#1e2a4a" opacity=".14"/>
          <circle r="43.5" fill="url(#cloth-shade)"/>
        </g>
      </svg>`;
    document.getElementById("wheel").prepend(div);
  }

  // نور کج پنجره‌ی کارگاه و پرزهای ریزی که آرام در آن بالا می‌روند
  function workshopLight() {
    const r = (a, b) => (a + Math.random() * (b - a)).toFixed(1);
    const lint = Array.from({ length: 9 }, () =>
      `<i style="left:${r(0, 70)}%;top:${r(15, 95)}%;--s:${r(1.5, 3.5)}px;--o:${r(0.35, 0.8)};--x:${r(-20, 60)}px;--d:${r(10, 20)}s;--w:${r(-20, 0)}s"></i>`
    ).join("");
    return `<div class="workshop-light" aria-hidden="true">${lint}</div>`;
  }

  // ---------- نقشه‌های قالی ----------
  // هر قالی یک «نقشه»ی متن (layout)، یک نوع حاشیه (edge) و رنگ‌های خودش را دارد:
  //   f زمینه‌ی متن، m نقش اصلی، a نقش دوم (معمولاً طلایی)، b زمینه‌ی حاشیه، d رنگ تیره‌ی ریزنقش‌ها، i رنگ روشن
  const CARPETS = [
    { city: "کاشان", layout: "medallion", edge: "rosettes", f: "#8e2424", m: "#1e2a4a", a: "#d9a441", b: "#1e2a4a", d: "#14182e", i: "#f4e9d4" },
    { city: "تبریز", layout: "shahAbbasi", edge: "vine", f: "#f1e4c8", m: "#8e2424", a: "#2b3d6b", b: "#2b3d6b", d: "#5a1414", i: "#f8efdc" },
    { city: "کرمان", layout: "tree", edge: "rosettes", f: "#2b3d6b", m: "#b33b35", a: "#e3c27a", b: "#8e2424", d: "#162040", i: "#f4e9d4" },
    { city: "نائین", layout: "shahAbbasi", edge: "vine", f: "#efe4cf", m: "#2c4f7a", a: "#8aa6c4", b: "#2c4f7a", d: "#1e3352", i: "#fbf5e8" },
    { city: "هریس", layout: "tribal", edge: "steps", f: "#a33a2a", m: "#1e2a4a", a: "#e7c36a", b: "#1e2a4a", d: "#2a1410", i: "#f1e2c4" },
    { city: "قم", layout: "mihrab", edge: "boteh", f: "#e7d3a8", m: "#2c7a7b", a: "#8e2424", b: "#8e2424", d: "#1d4f50", i: "#fbf3e2" },
    { city: "اصفهان", layout: "shahAbbasi", edge: "rosettes", f: "#7a1c22", m: "#e9dcc0", a: "#2c6e8a", b: "#1b2a46", d: "#3a0c10", i: "#f6ecd6" },
    { city: "سنندج", layout: "herati", edge: "sawtooth", f: "#1e2a4a", m: "#b8403a", a: "#e3c27a", b: "#a33a2a", d: "#0e1428", i: "#f1e2c4" },
    { city: "بختیاری", layout: "khesti", edge: "sawtooth", f: "#8e2424", m: "#2c4f7a", a: "#d9a441", b: "#2a3a5a", d: "#2a1410", i: "#f1e2c4", g: "#4c7a4a" },
    { city: "ترکمن", layout: "gul", edge: "steps", f: "#7a1a1a", m: "#4e0f12", a: "#e9d6b0", b: "#5a1214", d: "#1c0a0a", i: "#efe0c4" },
    { city: "ملایر", layout: "boteh", edge: "vine", f: "#2b3d6b", m: "#c0473d", a: "#e3c27a", b: "#7a1c22", d: "#141c38", i: "#f4e9d4" },
    { city: "اردبیل", layout: "medallion", edge: "vine", f: "#1d3a5c", m: "#e3c27a", a: "#9a2a26", b: "#7a1c22", d: "#0f2038", i: "#f4e9d4" },
    { city: "بلوچ", layout: "mihrab", edge: "steps", f: "#4a1a18", m: "#2a2440", a: "#d9b37a", b: "#2a1414", d: "#160a0a", i: "#e9d8b8" },
    { city: "قشقایی", layout: "tribal", edge: "sawtooth", f: "#9a2a26", m: "#2a3d6a", a: "#f0c75a", b: "#1e2a4a", d: "#2a1410", i: "#f4e5c6", g: "#5a8a4a" },
    { city: "گبه", layout: "gabbeh", edge: "plain", f: "#b8452a", m: "#3a2a1c", a: "#f0c75a", b: "#8a2e1c", d: "#2a1a10", i: "#f4e5c6", g: "#4c7a4a" },
    { city: "مشهد", layout: "medallion", edge: "boteh", f: "#6e1a2c", m: "#2b3d6b", a: "#e3c27a", b: "#1e2a4a", d: "#2a0a12", i: "#f4e9d4" },
    { city: "بیجار", layout: "herati", edge: "rosettes", f: "#8e2424", m: "#1e2a4a", a: "#d9a441", b: "#1e2a4a", d: "#240c0c", i: "#f1e2c4" },
    { city: "سیرجان", layout: "kilim", edge: "plain", f: "#a33a2a", m: "#1e2a4a", a: "#e7c36a", b: "#2a1a10", d: "#1a1008", i: "#f1e2c4", g: "#3e7a6a" },
    { city: "ساروق", layout: "tree", edge: "vine", f: "#9a2a26", m: "#1e2a4a", a: "#f0dba8", b: "#1e2a4a", d: "#3a0e0c", i: "#f4e9d4" },
    { city: "همدان", layout: "tribal", edge: "steps", f: "#2b3d6b", m: "#a33a2a", a: "#e7c36a", b: "#7a1c22", d: "#0e1428", i: "#f1e2c4" },
    { city: "مود", layout: "herati", edge: "vine", f: "#efe4cf", m: "#2c4f7a", a: "#9a2a26", b: "#2c4f7a", d: "#1e3352", i: "#fbf5e8" },
    { city: "سرابند", layout: "boteh", edge: "boteh", f: "#a3302a", m: "#1e2a4a", a: "#f0dba8", b: "#1e2a4a", d: "#2a0c0a", i: "#f4e9d4" },
    { city: "یزد", layout: "medallion", edge: "sawtooth", f: "#e7d3a8", m: "#8e2424", a: "#2c4f7a", b: "#8e2424", d: "#4a1010", i: "#fbf3e2" },
    { city: "کلاردشت", layout: "gul", edge: "sawtooth", f: "#2b3d6b", m: "#a33a2a", a: "#e7c36a", b: "#7a1c22", d: "#0e1428", i: "#f1e2c4" },
    { city: "جوشقان", layout: "khesti", edge: "rosettes", f: "#7a1c22", m: "#1e2a4a", a: "#e3c27a", b: "#1e2a4a", d: "#2a0a0c", i: "#f4e9d4", g: "#3e6e5a" },
    { city: "ورامین", layout: "herati", edge: "boteh", f: "#2a2440", m: "#b33b35", a: "#e3c27a", b: "#8e2424", d: "#120e22", i: "#f1e2c4" },
    { city: "شیراز", layout: "kilim", edge: "steps", f: "#1e2a4a", m: "#a33a2a", a: "#f0c75a", b: "#7a1c22", d: "#0e1428", i: "#f1e2c4", g: "#4c7a4a" },
    { city: "زنجان", layout: "boteh", edge: "rosettes", f: "#e7d3a8", m: "#8e2424", a: "#2b3d6b", b: "#2b3d6b", d: "#4a1010", i: "#fbf3e2" },
    { city: "لیلیان", layout: "tree", edge: "sawtooth", f: "#e7d3a8", m: "#9a2a26", a: "#2b3d6b", b: "#9a2a26", d: "#4a1010", i: "#fbf3e2", g: "#4c7a4a" },
    { city: "گنبد", layout: "gul", edge: "boteh", f: "#5a1414", m: "#2a1a3a", a: "#e9d6b0", b: "#3a0e0e", d: "#140808", i: "#efe0c4" },
    { city: "اراک", layout: "mihrab", edge: "vine", f: "#8e2424", m: "#1e2a4a", a: "#d9a441", b: "#1e2a4a", d: "#2a0a0a", i: "#f4e9d4" },
    { city: "فیروزآباد", layout: "gabbeh", edge: "plain", f: "#2c4f7a", m: "#1a2a40", a: "#f0c75a", b: "#1e3352", d: "#0e1a2a", i: "#f4e5c6", g: "#b8452a" },
  ];
  const carpetOf = (level) => CARPETS[Math.floor(level / ROWS) % CARPETS.length];

  const n = (v) => +v.toFixed(2);
  const diamond = (cx, cy, rx, ry, fill, extra = "") =>
    `<polygon points="${n(cx)},${n(cy - ry)} ${n(cx + rx)},${n(cy)} ${n(cx)},${n(cy + ry)} ${n(cx - rx)},${n(cy)}" fill="${fill}" ${extra}/>`;
  // گل چندپر: گلبرگ‌های بیضی دور یک مرکز
  function rosette(cx, cy, r, petals, fill, center) {
    let s = "";
    for (let k = 0; k < petals; k++) {
      const deg = (360 / petals) * k;
      s += `<ellipse cx="${n(cx)}" cy="${n(cy - r * 0.55)}" rx="${n(r * 0.28)}" ry="${n(r * 0.5)}" fill="${fill}" transform="rotate(${deg} ${n(cx)} ${n(cy)})"/>`;
    }
    return s + `<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(r * 0.3)}" fill="${center}"/>`;
  }
  // بته‌جقه
  function boteh(cx, cy, s, flip, fill, inner) {
    const t = `translate(${n(cx)} ${n(cy)}) scale(${n(flip ? -s : s)} ${n(s)})`;
    return `<g transform="${t}"><path d="M0 6C-5 6-6.5-1-2.5-4.5C0-6.5 3-7 2.2-10.5C6.5-7 6.5 6 0 6Z" fill="${fill}"/>` +
      `<path d="M.3 3.6C-2.4 3.6-3.4-.4-1-2.4C.6-3.4 2.2-3.4 2.4-5C3.8-2 3.6 3.6.3 3.6Z" fill="${inner}"/></g>`;
  }
  // ستاره‌ی هشت‌پر
  function star8(cx, cy, r, fill) {
    const p = [];
    for (let k = 0; k < 16; k++) {
      const rr = k % 2 ? r * 0.45 : r;
      const a = (Math.PI / 8) * k - Math.PI / 2;
      p.push(`${n(cx + Math.cos(a) * rr)},${n(cy + Math.sin(a) * rr)}`);
    }
    return `<polygon points="${p.join(" ")}" fill="${fill}"/>`;
  }
  // ترنج کنگره‌دار: یک چندضلعی با شعاع رفت و برگشتی
  function lobed(cx, cy, rx, ry, lobes, depth, fill, extra = "") {
    const p = [];
    const steps = lobes * 6;
    for (let k = 0; k < steps; k++) {
      const a = (Math.PI * 2 * k) / steps;
      const wob = 1 - depth * (0.5 - 0.5 * Math.cos(((k % 6) / 6) * Math.PI * 2));
      p.push(`${n(cx + Math.sin(a) * rx * wob)},${n(cy - Math.cos(a) * ry * wob)}`);
    }
    return `<polygon points="${p.join(" ")}" fill="${fill}" ${extra}/>`;
  }
  // لوزی پله‌ای (نقش عشایری)
  function stepped(cx, cy, r, step, fill) {
    const p = [];
    const k = Math.round(r / step);
    for (let i = 0; i <= k; i++) p.push([cx + i * step, cy - r + i * step], [cx + (i + 1) * step, cy - r + i * step]);
    const quarter = p.slice(0, -1);
    const pts = [
      ...quarter,
      ...quarter.map(([x, y]) => [x, 2 * cy - y]).reverse(),
      ...quarter.map(([x, y]) => [2 * cx - x, 2 * cy - y]),
      ...quarter.map(([x, y]) => [2 * cx - x, y]).reverse(),
    ];
    return `<polygon points="${pts.map(([x, y]) => `${n(x)},${n(y)}`).join(" ")}" fill="${fill}"/>`;
  }

  // متن قالی در جعبه‌ی (X, Y, W, H)
  const LAYOUTS = {
    // ترنج و لچک با گل‌های پراکنده
    medallion(c, X, Y, W, H) {
      const cx = X + W / 2, cy = Y + H / 2;
      let s = "";
      for (const [fx, fy] of [[0.18, 0.5], [0.82, 0.5], [0.32, 0.2], [0.68, 0.2], [0.32, 0.8], [0.68, 0.8]])
        s += rosette(X + W * fx, Y + H * fy, 5, 6, c.a, c.i);
      for (const [sx, sy] of [[0, 0], [1, 0], [0, 1], [1, 1]]) {
        const px = X + sx * W, py = Y + sy * H;
        s += `<path d="M${px} ${n(py + (sy ? -26 : 26))}Q${n(px + (sx ? -16 : 16))} ${n(py + (sy ? -16 : 16))} ${n(px + (sx ? -32 : 32))} ${py}L${px} ${py}Z" fill="${c.m}"/>`;
        s += `<path d="M${px} ${n(py + (sy ? -15 : 15))}Q${n(px + (sx ? -9 : 9))} ${n(py + (sy ? -9 : 9))} ${n(px + (sx ? -18 : 18))} ${py}L${px} ${py}Z" fill="${c.a}" opacity=".9"/>`;
      }
      s += diamond(cx, cy - 37, 6, 9, c.m) + diamond(cx, cy + 37, 6, 9, c.m);
      s += lobed(cx, cy, 36, 31, 8, 0.12, c.m, `stroke="${c.i}" stroke-width="1.2"`);
      s += lobed(cx, cy, 24, 20, 8, 0.15, c.f);
      s += rosette(cx, cy, 14, 8, c.a, c.m);
      s += rosette(cx, cy, 6, 6, c.i, c.a);
      return s;
    },
    // ترنج گرد با گل‌های شاه‌عباسی دورش و پیچک‌های اسلیمی
    shahAbbasi(c, X, Y, W, H) {
      const cx = X + W / 2, cy = Y + H / 2;
      let s = `<g fill="none" stroke="${c.a}" stroke-width="1" opacity=".75">`;
      for (let k = 0; k < 4; k++) {
        const y0 = Y + 12 + k * (H - 24) / 3;
        s += `<path d="M${X} ${n(y0)}C${n(X + W * 0.25)} ${n(y0 - 10)} ${n(X + W * 0.25)} ${n(y0 + 10)} ${n(X + W * 0.5)} ${n(y0)}S${n(X + W * 0.75)} ${n(y0 - 10)} ${X + W} ${n(y0)}"/>`;
      }
      s += "</g>";
      for (const [fx, fy] of [[0.12, 0.2], [0.88, 0.2], [0.12, 0.8], [0.88, 0.8], [0.3, 0.12], [0.7, 0.12], [0.3, 0.88], [0.7, 0.88]])
        s += rosette(X + W * fx, Y + H * fy, 5.5, 5, c.m, c.a);
      s += `<circle cx="${cx}" cy="${cy}" r="31" fill="${c.m}"/>`;
      for (let k = 0; k < 12; k++) {
        const a = (Math.PI * 2 * k) / 12;
        s += `<circle cx="${n(cx + Math.cos(a) * 31)}" cy="${n(cy + Math.sin(a) * 31)}" r="4.2" fill="${c.m}"/>`;
      }
      s += `<circle cx="${cx}" cy="${cy}" r="24" fill="${c.f}"/>`;
      for (let k = 0; k < 8; k++) {
        const a = (Math.PI * 2 * k) / 8;
        s += rosette(cx + Math.cos(a) * 16, cy + Math.sin(a) * 16, 4.5, 5, c.a, c.m);
      }
      s += rosette(cx, cy, 10, 8, c.m, c.a);
      for (const [sx, sy] of [[0, 0], [1, 0], [0, 1], [1, 1]])
        s += `<circle cx="${X + sx * W}" cy="${Y + sy * H}" r="20" fill="${c.m}"/><circle cx="${X + sx * W}" cy="${Y + sy * H}" r="13" fill="${c.f}"/><circle cx="${X + sx * W}" cy="${Y + sy * H}" r="7" fill="${c.a}"/>`;
      return s;
    },
    // درخت زندگی در گلدان
    tree(c, X, Y, W, H) {
      const cx = X + W / 2, base = Y + H - 6;
      const leaf = c.g || c.a;
      let s = `<path d="M${cx - 13} ${base}h26l-4-12q6-4 0-8h-18q-6 4 0 8Z" fill="${c.m}"/>`;
      s += `<rect x="${cx - 1.6}" y="${Y + 8}" width="3.2" height="${H - 26}" fill="${c.a}"/>`;
      for (let k = 0; k < 5; k++) {
        const y0 = base - 24 - k * 14, span = 46 - k * 6;
        for (const dir of [-1, 1]) {
          s += `<path d="M${cx} ${y0}Q${n(cx + dir * span * 0.5)} ${y0 - 12} ${n(cx + dir * span)} ${y0 - 4}" fill="none" stroke="${c.a}" stroke-width="2"/>`;
          s += `<ellipse cx="${n(cx + dir * span * 0.55)}" cy="${y0 - 10}" rx="6" ry="2.4" fill="${leaf}" transform="rotate(${dir * -25} ${n(cx + dir * span * 0.55)} ${y0 - 10})"/>`;
          s += rosette(cx + dir * span, y0 - 4, 5.5, 6, c.m, c.i);
        }
      }
      s += rosette(cx, Y + 10, 7, 8, c.m, c.i);
      for (const [fx, fy] of [[0.08, 0.15], [0.92, 0.15], [0.08, 0.55], [0.92, 0.55], [0.1, 0.9], [0.9, 0.9]])
        s += star8(X + W * fx, Y + H * fy, 4, c.i);
      return s;
    },
    // محراب با قندیل آویخته و دو ستون
    mihrab(c, X, Y, W, H) {
      const cx = X + W / 2, top = Y + 6;
      let s = `<rect x="${X}" y="${Y}" width="${W}" height="${H}" fill="${c.m}"/>`;
      s += `<path d="M${X + 14} ${Y + H}V${top + 40}Q${X + 14} ${top + 16} ${cx} ${top}Q${X + W - 14} ${top + 16} ${X + W - 14} ${top + 40}V${Y + H}Z" fill="${c.f}" stroke="${c.a}" stroke-width="1.4"/>`;
      for (const sx of [X + 7, X + W - 7]) {
        s += `<rect x="${sx - 2}" y="${top + 40}" width="4" height="${H - 46}" fill="${c.a}"/>`;
        for (let k = 0; k < 6; k++) s += diamond(sx, top + 46 + k * 9, 3, 3, c.i);
      }
      s += `<line x1="${cx}" y1="${top}" x2="${cx}" y2="${top + 22}" stroke="${c.a}" stroke-width="1"/>`;
      s += `<path d="M${cx - 8} ${top + 22}h16l-3 10h-10Z" fill="${c.a}"/><path d="M${cx - 4} ${top + 32}h8l-4 6Z" fill="${c.a}"/>`;
      for (let k = 0; k < 3; k++) for (let j = 0; j < 4; j++) {
        const fx = X + 34 + j * (W - 68) / 3, fy = top + 52 + k * 18;
        s += (k + j) % 2 ? rosette(fx, fy, 4.5, 6, c.a, c.i) : boteh(fx, fy, 0.75, j > 1, c.b, c.a);
      }
      for (const sx of [X + 2, X + W - 26]) s += rosette(sx + 12, top + 10, 5, 6, c.a, c.i);
      return s;
    },
    // نقش هراتی: شبکه‌ی لوزی با گل وسط و چهار برگ
    herati(c, X, Y, W, H) {
      const step = 19;
      let s = "";
      for (let gy = Y - step / 2; gy <= Y + H + step; gy += step) {
        for (let gx = X; gx <= X + W + step; gx += step) {
          s += `<path d="M${n(gx)} ${n(gy - step / 2)}L${n(gx + step / 2)} ${n(gy)}L${n(gx)} ${n(gy + step / 2)}L${n(gx - step / 2)} ${n(gy)}Z" fill="none" stroke="${c.a}" stroke-width=".8" opacity=".75"/>`;
          for (const [dx, dy, r] of [[-1, -1, -45], [1, -1, 45], [-1, 1, 45], [1, 1, -45]])
            s += `<ellipse cx="${n(gx + dx * 4.6)}" cy="${n(gy + dy * 4.6)}" rx="3.6" ry="1.4" fill="${c.m}" transform="rotate(${r} ${n(gx + dx * 4.6)} ${n(gy + dy * 4.6)})"/>`;
          s += rosette(gx, gy, 3.6, 4, c.i, c.m);
        }
      }
      s = `<g>${s}</g>`;
      const cx = X + W / 2, cy = Y + H / 2;
      return s + diamond(cx, cy, 22, 26, c.f, `stroke="${c.a}" stroke-width="1.2"`) + diamond(cx, cy, 13, 15, c.m) + rosette(cx, cy, 6, 6, c.a, c.i);
    },
    // خشتی: باغ‌های چهارگوش، هر خانه با یک نقش
    khesti(c, X, Y, W, H) {
      const cols = 4, rows = 3, cw = W / cols, ch = H / rows;
      const fills = [c.f, c.m, c.g || c.a];
      let s = "";
      for (let r = 0; r < rows; r++) for (let q = 0; q < cols; q++) {
        const x0 = X + q * cw, y0 = Y + r * ch, mx = x0 + cw / 2, my = y0 + ch / 2;
        const bg = fills[(r + q) % 3];
        s += `<rect x="${n(x0)}" y="${n(y0)}" width="${n(cw)}" height="${n(ch)}" fill="${bg}" stroke="${c.i}" stroke-width="1.2"/>`;
        const fg = bg === c.a || bg === c.g ? c.d : c.a;
        switch ((r * cols + q) % 4) {
          case 0: // سرو
            s += `<path d="M${n(mx)} ${n(y0 + 4)}Q${n(mx + 7)} ${n(my + 2)} ${n(mx)} ${n(y0 + ch - 7)}Q${n(mx - 7)} ${n(my + 2)} ${n(mx)} ${n(y0 + 4)}Z" fill="${fg}"/><rect x="${n(mx - 1)}" y="${n(y0 + ch - 7)}" width="2" height="4" fill="${fg}"/>`;
            break;
          case 1: s += rosette(mx, my, 9, 8, fg, c.i); break;
          case 2: s += boteh(mx, my + 1, 1.25, r % 2, fg, c.i); break;
          default: s += diamond(mx, my, 10, 12, fg) + diamond(mx, my, 4, 5, c.i);
        }
      }
      return s;
    },
    // ردیف‌های بته‌جقه، یکی در میان برعکس
    boteh(c, X, Y, W, H) {
      let s = "";
      const rows = 6, cols = 7;
      for (let r = 0; r < rows; r++) for (let q = 0; q < cols; q++) {
        const off = r % 2 ? (W / cols) / 2 : 0;
        const bx = X + 8 + q * (W / cols) + off, by = Y + 10 + r * (H - 16) / (rows - 1);
        if (bx > X + W - 4) continue;
        s += boteh(bx, by, 1, r % 2, r % 2 ? c.m : c.a, r % 2 ? c.a : c.m);
      }
      return s;
    },
    // نقش عشایری: لوزی‌های پله‌ای قلاب‌دار و ستاره‌های پراکنده
    tribal(c, X, Y, W, H) {
      const cx = X + W / 2, cy = Y + H / 2;
      let s = "";
      for (const [sx, sy] of [[0, 0], [1, 0], [0, 1], [1, 1]]) {
        const px = X + sx * W, py = Y + sy * H, dx = sx ? -1 : 1, dy = sy ? -1 : 1;
        s += `<path d="M${px} ${py}h${dx * 30}v${dy * 6}h${-dx * 8}v${dy * 6}h${-dx * 8}v${dy * 6}h${-dx * 8}v${dy * 6}h${-dx * 6}Z" fill="${c.m}"/>`;
      }
      s += `<rect x="${cx - 46}" y="${cy - 1.5}" width="92" height="3" fill="${c.m}"/>`;
      for (const ox of [-40, 40]) s += stepped(cx + ox, cy, 9, 3, c.m) + diamond(cx + ox, cy, 3, 3, c.a);
      s += stepped(cx, cy, 36, 4, c.m);
      s += stepped(cx, cy, 26, 4, c.i);
      s += stepped(cx, cy, 18, 3, c.f);
      for (const [hx, hy] of [[0, -30], [0, 30], [-30, 0], [30, 0]]) s += diamond(cx + hx, cy + hy, 3, 3, c.a);
      s += star8(cx, cy, 10, c.a) + diamond(cx, cy, 3, 3, c.d);
      for (const [fx, fy] of [[0.12, 0.45], [0.88, 0.55], [0.3, 0.15], [0.7, 0.85], [0.22, 0.8], [0.78, 0.2]])
        s += star8(X + W * fx, Y + H * fy, 4.5, c.g && fx < 0.5 ? c.g : c.a);
      return s;
    },
    // گل‌های ترکمنی: هشت‌ضلعی‌های چهار رنگ در ردیف
    gul(c, X, Y, W, H) {
      let s = "";
      const cols = 4, rows = 3, cw = W / cols, ch = H / rows;
      for (let r = 0; r < rows; r++) for (let q = 0; q < cols; q++) {
        const mx = X + cw * (q + 0.5), my = Y + ch * (r + 0.5), rx = cw * 0.42, ry = ch * 0.36;
        const oct = [[-rx * 0.5, -ry], [rx * 0.5, -ry], [rx, -ry * 0.4], [rx, ry * 0.4], [rx * 0.5, ry], [-rx * 0.5, ry], [-rx, ry * 0.4], [-rx, -ry * 0.4]]
          .map(([a, b]) => `${n(mx + a)},${n(my + b)}`).join(" ");
        s += `<polygon points="${oct}" fill="${c.m}" stroke="${c.i}" stroke-width="1"/>`;
        s += `<path d="M${n(mx)} ${n(my - ry)}V${n(my + ry)}M${n(mx - rx)} ${n(my)}H${n(mx + rx)}" stroke="${c.i}" stroke-width=".8"/>`;
        s += `<rect x="${n(mx - rx * 0.6)}" y="${n(my - ry * 0.55)}" width="${n(rx * 0.6)}" height="${n(ry * 0.55)}" fill="${c.f}"/>`;
        s += `<rect x="${n(mx)}" y="${n(my)}" width="${n(rx * 0.6)}" height="${n(ry * 0.55)}" fill="${c.f}"/>`;
        s += diamond(mx, my, rx * 0.35, ry * 0.4, c.a) + diamond(mx, my, rx * 0.12, ry * 0.14, c.d);
        for (const dx of [-1, 1]) s += diamond(mx + dx * rx * 0.75, my, 1.6, 1.6, c.a);
        if (q < cols - 1 && r < rows - 1) s += star8(X + cw * (q + 1), Y + ch * (r + 1), 4.5, c.a);
      }
      return s;
    },
    // گبه: زمینه‌ی تقریباً ساده با رگه‌های رنگ طبیعی و چند نقش ساده
    gabbeh(c, X, Y, W, H) {
      let s = "";
      for (let k = 0; k < 7; k++) s += `<rect x="${X}" y="${n(Y + k * (H / 7))}" width="${W}" height="${n(H / 14)}" fill="#000" opacity="${[0.05, 0.1, 0.03, 0.08, 0.04, 0.11, 0.06][k]}"/>`;
      const tree = (tx, ty, col) =>
        `<rect x="${tx - 1}" y="${ty}" width="2" height="16" fill="${c.m}"/>` +
        [0, 5, 10].map((o) => `<path d="M${tx - 7 + o * 0.4} ${ty + 10 - o}l${7 - o * 0.4} -5l${7 - o * 0.4} 5Z" fill="${col}"/>`).join("");
      s += tree(X + 24, Y + 40, c.g) + tree(X + W - 24, Y + 40, c.g) + tree(X + W / 2, Y + 68, c.a);
      // بز کوچک
      const goat = (gx, gy) =>
        `<g fill="${c.i}"><rect x="${gx}" y="${gy}" width="14" height="6"/><rect x="${gx}" y="${gy + 6}" width="2" height="5"/><rect x="${gx + 12}" y="${gy + 6}" width="2" height="5"/><rect x="${gx + 13}" y="${gy - 5}" width="4" height="6"/><path d="M${gx + 14} ${gy - 5}l-3 -4M${gx + 16} ${gy - 5}l3 -4" stroke="${c.i}" stroke-width="1"/></g>`;
      s += goat(X + W / 2 - 30, Y + 18) + goat(X + W / 2 + 16, Y + 22);
      s += stepped(X + W / 2, Y + 36, 10, 3, c.a) + diamond(X + W / 2, Y + 36, 3, 3, c.m);
      return s;
    },
    // گلیم: نوارهای رنگی با لوزی و دندانه
    kilim(c, X, Y, W, H) {
      let s = "";
      const bands = [c.f, c.m, c.f, c.a, c.f, c.g || c.m, c.f];
      const bh = H / bands.length;
      bands.forEach((col, k) => {
        const y0 = Y + k * bh;
        s += `<rect x="${X}" y="${n(y0)}" width="${W}" height="${n(bh + 0.2)}" fill="${col}"/>`;
        if (k % 2 === 0) {
          for (let q = 0; q < 8; q++) s += diamond(X + W / 16 + q * W / 8, y0 + bh / 2, 6.5, bh * 0.42, q % 2 ? c.a : c.m) + diamond(X + W / 16 + q * W / 8, y0 + bh / 2, 2.4, 2.4, c.i);
        } else {
          let z = `M${X} ${n(y0 + bh)}`;
          for (let q = 0; q <= 16; q++) z += `L${n(X + q * W / 16)} ${n(q % 2 ? y0 + 2 : y0 + bh - 2)}`;
          s += `<path d="${z}" fill="none" stroke="${c.i}" stroke-width="1.2"/>`;
        }
      });
      return s;
    },
  };

  // حاشیه در نوار پهن دور قالی
  function edgeMotifs(c, x, y, w, h, b) {
    const spots = [];
    const nx = 13, ny = 10;
    for (let k = 0; k < nx; k++) {
      const px = x + b + 2 + k * ((w - 2 * b - 4) / (nx - 1));
      spots.push([px, y + b / 2, 0], [px, y + h - b / 2, 180]);
    }
    for (let k = 0; k < ny; k++) {
      const py = y + b + 4 + k * ((h - 2 * b - 8) / (ny - 1));
      spots.push([x + b / 2, py, 270], [x + w - b / 2, py, 90]);
    }
    const corners = [[x + b / 2, y + b / 2], [x + w - b / 2, y + b / 2], [x + b / 2, y + h - b / 2], [x + w - b / 2, y + h - b / 2]];
    let s = "";
    switch (c.edge) {
      case "rosettes":
        spots.forEach(([px, py], k) => (s += k % 4 < 2 ? rosette(px, py, 3.6, 6, c.a, c.i) : diamond(px, py, 2, 2, c.i)));
        break;
      case "vine": {
        const amp = 2.2;
        let top = `M${x} ${y + b / 2}`, bot = `M${x} ${y + h - b / 2}`;
        for (let px = x; px <= x + w; px += 6) {
          const off = Math.sin(px / 3) * amp;
          top += `L${n(px)} ${n(y + b / 2 + off)}`;
          bot += `L${n(px)} ${n(y + h - b / 2 - off)}`;
        }
        let lf = `M${x + b / 2} ${y}`, rt = `M${x + w - b / 2} ${y}`;
        for (let py = y; py <= y + h; py += 6) {
          const off = Math.sin(py / 3) * amp;
          lf += `L${n(x + b / 2 + off)} ${n(py)}`;
          rt += `L${n(x + w - b / 2 - off)} ${n(py)}`;
        }
        s += `<path d="${top} ${bot} ${lf} ${rt}" fill="none" stroke="${c.a}" stroke-width="1"/>`;
        spots.forEach(([px, py], k) => (s += k % 2 ? `<circle cx="${n(px)}" cy="${n(py)}" r="2.2" fill="${c.i}"/>` : rosette(px, py, 3.2, 5, c.m === c.b ? c.a : c.m, c.a)));
        break;
      }
      case "sawtooth": {
        let p = "";
        const t = 6;
        for (let px = x; px < x + w; px += t) {
          p += `M${px} ${y + b}l${t / 2} ${-b * 0.6}l${t / 2} ${b * 0.6}Z`;
          p += `M${px} ${y + h - b}l${t / 2} ${b * 0.6}l${t / 2} ${-b * 0.6}Z`;
        }
        for (let py = y + b; py < y + h - b; py += t) {
          p += `M${x + b} ${py}l${-b * 0.6} ${t / 2}l${b * 0.6} ${t / 2}Z`;
          p += `M${x + w - b} ${py}l${b * 0.6} ${t / 2}l${-b * 0.6} ${t / 2}Z`;
        }
        s += `<path d="${p}" fill="${c.a}"/>`;
        break;
      }
      case "boteh":
        spots.forEach(([px, py, rot], k) => (s += `<g transform="rotate(${rot} ${n(px)} ${n(py)})">${boteh(px, py, 0.55, k % 2, c.a, c.i)}</g>`));
        break;
      case "steps":
        spots.forEach(([px, py], k) => (s += stepped(px, py, 3.6, 1.2, k % 2 ? c.a : c.i)));
        break;
      default: // plain: فقط دو خط کوک
        s += `<rect x="${x + 3}" y="${y + 3}" width="${w - 6}" height="${h - 6}" fill="none" stroke="${c.a}" stroke-width="1" stroke-dasharray="3 2"/>`;
    }
    for (const [px, py] of corners) s += diamond(px, py, 4, 4, c.a) + diamond(px, py, 1.6, 1.6, c.i);
    return s;
  }

  function carpetDesign(c) {
    const x = 22, y = 10, w = 156, h = 120, b = 10;
    const X = x + b, Y = y + b, W = w - 2 * b, H = h - 2 * b;
    return `
      <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c.b}"/>
      <rect x="${x + 1}" y="${y + 1}" width="${w - 2}" height="${h - 2}" fill="none" stroke="${c.i}" stroke-width=".8" opacity=".7"/>
      ${edgeMotifs(c, x, y, w, h, b)}
      <svg x="${X}" y="${Y}" width="${W}" height="${H}" viewBox="${X} ${Y} ${W} ${H}" overflow="hidden">
        <rect x="${X}" y="${Y}" width="${W}" height="${H}" fill="${c.f}"/>
        ${LAYOUTS[c.layout](c, X, Y, W, H)}
      </svg>
      <rect x="${X}" y="${Y}" width="${W}" height="${H}" fill="none" stroke="${c.i}" stroke-width="1.4"/>`;
  }

  // رنگ تیره‌ی هر قالی برای زمینه‌ی جدول (اگر زمینه‌ی قالی روشن است، رنگ حاشیه)
  const lum = (hex) => {
    const v = parseInt(hex.slice(1), 16);
    return 0.299 * (v >> 16) + 0.587 * ((v >> 8) & 255) + 0.114 * (v & 255);
  };
  const boardColor = (c) => (lum(c.f) < 140 ? c.f : c.b);

  const heightFor = (rows) => (120 * rows) / ROWS;

  // قالی روی دار: تا ارتفاع woven بافته شده و بقیه هنوز تارهای خالی است.
  // id باید یکتا باشد، چون نسخه‌ی منو و نسخه‌ی پنجره‌ی پایان مرحله با هم در صفحه‌اند.
  function loomSVG(c, woven, { id, cls, done, extra = "" }) {
    const warp = [];
    for (let x = 24; x <= 176; x += 3) warp.push(`<line x1="${x}" y1="8" x2="${x}" y2="132"/>`);
    const fringe = [];
    for (let x = 24; x <= 176; x += 3) fringe.push(`<line x1="${x}" y1="130" x2="${x}" y2="138"/>`);
    return `<svg class="${cls}" viewBox="0 0 200 142" aria-hidden="true">
        <defs>
          <clipPath id="${id}"><rect class="woven-rect" x="0" y="${130 - woven}" width="200" height="${woven}"/></clipPath>
          <linearGradient id="${id}-beam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b07a48"/><stop offset=".5" stop-color="#7a4a24"/><stop offset="1" stop-color="#4e2c12"/></linearGradient>
          <linearGradient id="${id}-light" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff4dc" stop-opacity=".22"/><stop offset=".55" stop-color="#fff4dc" stop-opacity="0"/><stop offset="1" stop-color="#3a1c14" stop-opacity=".22"/></linearGradient>
          <filter id="${id}-grain" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency=".02 .9" numOctaves="3" seed="4"/>
            <feColorMatrix values="0 0 0 0 .18  0 0 0 0 .09  0 0 0 0 .03  0 0 0 1.4 -.55"/>
            <feComposite in2="SourceGraphic" operator="in"/>
          </filter>
          <filter id="${id}-pile" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="1.3 .8" numOctaves="2" seed="8"/>
            <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .4 -.17"/>
            <feComposite in2="SourceGraphic" operator="in"/>
          </filter>
        </defs>
        <rect x="22" y="8" width="156" height="124" fill="#efe2cc"/>
        <g stroke="rgba(120, 70, 40, .35)" stroke-width=".7">${warp.join("")}</g>
        <g clip-path="url(#${id})">${carpetDesign(c)}
          <rect x="22" y="10" width="156" height="120" fill="#000" filter="url(#${id}-pile)"/>
          <rect x="22" y="10" width="156" height="120" fill="url(#${id}-light)"/>
        </g>
        <g stroke="${IVORY}" stroke-width="1">${done ? fringe.join("") : ""}</g>
        <rect x="10" y="2" width="180" height="8" rx="3" fill="url(#${id}-beam)"/>
        <rect x="10" y="2" width="180" height="8" rx="3" fill="#000" filter="url(#${id}-grain)"/>
        <rect x="10" y="130" width="180" height="4" rx="2" fill="url(#${id}-beam)" opacity="${done ? 0 : 1}"/>
        ${extra}
      </svg>`;
  }

  // پنجره‌ی پایان مرحله: ردیف تازه از پایین بالا می‌آید
  function loomCarpet(level) {
    const rows = (level % ROWS) + 1;
    const c = carpetOf(level);
    const svg = loomSVG(c, heightFor(rows - 1), { id: "woven-card", cls: "extra loom-carpet", done: rows === ROWS });
    return { svg, from: heightFor(rows - 1), to: heightFor(rows), rows, city: c.city };
  }

  // منو: قالیِ در حال بافت، با ماکویی که روی خط بافت می‌رود و برمی‌گردد
  function homeLoom(done) {
    const rows = done % ROWS;
    const c = carpetOf(done);
    const edge = 130 - heightFor(rows);
    const shuttle = `<g transform="translate(0 ${edge - 3})">
        <line x1="24" y1="3" x2="176" y2="3" stroke="#b8322a" stroke-width=".8" opacity=".55"/>
        <g class="shuttle"><path d="M0 3 Q8 -2 22 -1 L30 3 L22 7 Q8 8 0 3Z" fill="#8a5a2c" stroke="#5b3818" stroke-width=".8"/>
        <ellipse cx="15" cy="3" rx="5" ry="2.4" fill="#b8322a"/>
      </g></g>`;
    return {
      svg: loomSVG(c, heightFor(rows), { id: "woven-home", cls: "home-loom", done: false, extra: shuttle }),
      caption: `قالی ${c.city} · ${faDigits(rows)} از ${faDigits(ROWS)} ردیف بافته شده`,
    };
  }

  function growCarpet(svgEl, from, to) {
    const rect = svgEl.querySelector(".woven-rect");
    const t0 = performance.now();
    (function step(now) {
      const t = Math.min((now - t0) / 1300, 1);
      const h = from + (to - from) * (t * t * (3 - 2 * t));
      rect.setAttribute("y", 130 - h);
      rect.setAttribute("height", h);
      if (t < 1 && svgEl.isConnected) requestAnimationFrame(step);
    })(t0);
  }

  defineTheme("carpet", {
    name: (level) => "قالی " + carpetOf(level).city,

    setup() {
      document.body.insertAdjacentHTML("afterbegin", `<div class="kilim top"></div><div class="kilim bottom"></div>${workshopLight()}`);
      addLoom();
      return () => {
        document.querySelectorAll(".kilim, .loom, .workshop-light").forEach((el) => el.remove());
        document.documentElement.style.removeProperty("--carpet-field");
      };
    },

    on: {
      // جدول هر مرحله به رنگ قالی‌ای است که دارد بافته می‌شود
      level(d) {
        document.documentElement.style.setProperty("--carpet-field", boardColor(carpetOf(d.level)));
      },
      home(d) {
        const box = document.getElementById("homeScene");
        const loom = homeLoom(d.done);
        box.innerHTML = loom.svg + `<p class="scene-caption"></p>`;
        box.querySelector(".scene-caption").textContent = loom.caption;
      },
      wrong() {
        const wheel = document.getElementById("wheel");
        wheel.classList.remove("snap");
        void wheel.offsetWidth;
        wheel.classList.add("snap");
      },
      shuffle() {
        document.querySelector(".loom").animate(
          [{ transform: "rotate(0)" }, { transform: "rotate(-120deg)" }, { transform: "rotate(0)" }],
          { duration: 700, easing: "ease-in-out" }
        );
      },
      complete(d) {
        const card = document.querySelector("#overlay .card");
        const c = loomCarpet(d.level);
        card.insertAdjacentHTML("afterbegin", c.svg);
        growCarpet(card.querySelector(".loom-carpet"), c.from, c.to);
        document.getElementById("overlayTitle").textContent =
          c.rows === ROWS ? `قالی ${c.city} کامل شد!` : `ردیف ${faDigits(c.rows)} از ${faDigits(ROWS)} بافته شد`;
      },
    },
  });
})();
