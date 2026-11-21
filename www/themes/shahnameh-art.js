// «کاشی‌کاری» — نگاره‌های شاهنامه به سبک نگارگری ایرانی.
// هر پیکره چند لایه‌ی مسیر SVG است که روی بوم کشیده می‌شود: یک بار رنگی (با قلم‌گیری مرکب)
// و یک بار «طرح قلم» روی کاغذ نخودی، برای وقتی که هنوز آن بخش از نگاره کامل نشده.
(function () {
  const INK = "#2a1a12", PAPER = "#f4ead2", GOLD = "#d9a441", GOLD2 = "#f0cd6e", SKIN = "#f6e3c7", HAIR = "#1d1410";

  const E = (cx, cy, rx, ry = rx) => `M${cx - rx} ${cy}a${rx} ${ry} 0 1 0 ${2 * rx} 0a${rx} ${ry} 0 1 0 ${-2 * rx} 0z`;
  // لایه‌ها: {d, f} سطح پر؛ {d, k, f} خط ضخیم؛ {d, c, lw} خط ریز؛ {g:[...], t:[x,y,s,flip]} گروه
  const F = (d, f, o) => ({ d, f, ...o });
  const K = (d, k, f, o) => ({ d, k, f, ...o });
  const L = (d, c, lw = 0.7, o) => ({ d, c, lw, ...o });
  const G = (g, x = 0, y = 0, s = 1, flip = false) => ({ g, t: [x, y, s, flip] });

  // ---------- نقش پارچه‌ها ----------
  const PATS = {
    dots: (c, base) => { c.fillStyle = base; c.fillRect(0, 0, 6, 6); c.fillStyle = GOLD2; c.beginPath(); c.arc(1.5, 1.5, 0.6, 0, 7); c.arc(4.5, 4.5, 0.6, 0, 7); c.fill(); },
    flower: (c, base) => {
      c.fillStyle = base; c.fillRect(0, 0, 6, 6); c.fillStyle = GOLD2;
      [[1.5, 1.5], [4.5, 4.5]].forEach(([x, y]) => { for (let a = 0; a < 4; a++) { c.beginPath(); c.arc(x + Math.cos(a * 1.57) * 0.6, y + Math.sin(a * 1.57) * 0.6, 0.45, 0, 7); c.fill(); } });
    },
    tiger: (c, base) => {
      c.fillStyle = base; c.fillRect(0, 0, 6, 6); c.strokeStyle = HAIR; c.lineWidth = 0.55; c.lineCap = "round";
      c.beginPath(); c.moveTo(0.6, 0.8); c.quadraticCurveTo(1.8, 2, 1.1, 3.2); c.moveTo(3.6, 2.8); c.quadraticCurveTo(4.8, 4, 4.1, 5.4); c.stroke();
      c.fillStyle = HAIR; c.beginPath(); c.arc(4.6, 0.9, 0.42, 0, 7); c.arc(1.4, 5, 0.42, 0, 7); c.fill();
    },
    spots: (c, base) => { c.fillStyle = base; c.fillRect(0, 0, 6, 6); c.fillStyle = "rgba(25,15,10,.75)"; [[1.2, 1.4, 0.7], [4.3, 2.4, 0.55], [2.6, 4.6, 0.6], [5.4, 5.3, 0.4]].forEach(([x, y, r]) => { c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); }); },
    scales: (c, base) => {
      c.fillStyle = base; c.fillRect(0, 0, 6, 6); c.strokeStyle = "rgba(30,20,10,.55)"; c.lineWidth = 0.35;
      for (let y = 0; y < 8; y += 3) for (let x = (y / 3) % 2 ? 1.5 : 0; x < 8; x += 3) { c.beginPath(); c.arc(x, y, 1.5, 0, Math.PI); c.stroke(); }
    },
    feather: (c, base) => { c.fillStyle = base; c.fillRect(0, 0, 6, 6); c.strokeStyle = "rgba(255,240,200,.5)"; c.lineWidth = 0.3; for (let x = -6; x < 8; x += 1.5) { c.beginPath(); c.moveTo(x, 6); c.lineTo(x + 6, 0); c.stroke(); } },
    mail: (c, base) => { c.fillStyle = base; c.fillRect(0, 0, 6, 6); c.strokeStyle = "rgba(30,30,40,.45)"; c.lineWidth = 0.3; for (let y = 0; y < 7; y += 1.5) for (let x = (y / 1.5) % 2 ? 0.75 : 0; x < 7; x += 1.5) { c.beginPath(); c.arc(x, y, 0.6, 0, 7); c.stroke(); } },
  };
  const patCache = new Map();
  function fillOf(ctx, f) {
    if (typeof f !== "string" || !f.startsWith("pat:")) return f;
    const [, name, base, sc] = f.split(":");
    const key = name + base + (sc || "");
    let p = patCache.get(key);
    if (!p) {
      const res = 12, cv = document.createElement("canvas");
      cv.width = cv.height = 6 * res;
      const c = cv.getContext("2d");
      c.scale(res, res);
      PATS[name](c, base);
      p = { cv, res, sc: +sc || 1 };
      patCache.set(key, p);
    }
    const pat = ctx.createPattern(p.cv, "repeat");
    const m = new DOMMatrix().scale(p.sc / p.res);
    pat.setTransform(m);
    return pat;
  }

  // ---------- کشیدن لایه‌ها ----------
  function draw(ctx, layers, sketch) {
    for (const l of layers) {
      if (!l) continue;
      if (l.g) {
        const [x, y, s, flip] = l.t;
        ctx.save(); ctx.translate(x, y); ctx.scale(flip ? -s : s, s);
        draw(ctx, l.g, sketch);
        ctx.restore();
        continue;
      }
      const p = new Path2D(l.d);
      ctx.lineJoin = "round"; ctx.lineCap = "round";
      if (l.k) {
        ctx.strokeStyle = INK; ctx.lineWidth = l.k + 1.3; ctx.stroke(p);
        ctx.strokeStyle = sketch ? PAPER : fillOf(ctx, l.f); ctx.lineWidth = l.k; ctx.stroke(p);
      } else if (l.c) {
        if (sketch && l.nos) continue;
        ctx.strokeStyle = sketch ? INK : l.c; ctx.lineWidth = sketch ? Math.min(l.lw, 0.8) : l.lw; ctx.stroke(p);
      } else {
        ctx.fillStyle = sketch ? PAPER : fillOf(ctx, l.f); ctx.fill(p, l.eo ? "evenodd" : "nonzero");
        if (!l.no) { ctx.strokeStyle = INK; ctx.lineWidth = l.ow || 0.7; ctx.stroke(p); }
      }
    }
  }

  // ---------- چهره و سر ----------
  function head(o) {
    const out = [];
    const hx = 3, hy = -82;
    if (o.woman) out.push(F("M-5 -88C-10 -80 -9 -64 -6 -50C-4 -48 -2 -50 -2 -52C-3 -64 -2 -76 1 -84Z", HAIR)); // گیسوی بلند
    out.push(F(E(hx, hy, 6.4, 7.4), SKIN));
    out.push(L(`M5 -84.2q2 -1.3 4 -.1`, INK, 0.75), L(`M4.6 -87q2.4 -1.6 5.2 -.3`, HAIR, 0.8), L(`M9.4 -83.4l.9 3.1l-1.2.4`, "#b57d62", 0.55), L(`M6.6 -77.6q1.3.6 2.6 -.1`, "#b6413a", 0.8));
    if (o.cheek !== false) out.push(F(E(6.5, -80, 1.6, 1.1), "#f1b9a4", { no: 1 }));
    if (o.beard) out.push(F("M-1.5 -80C-2 -72 2 -67 6.5 -68.5C9 -69.5 10 -73 9.8 -76.5C8 -75.6 6.2 -76 5 -77.6C3.4 -76.4 1 -77.5 -1.5 -80Z", HAIR), K("M5 -78.4q2.2 -1.2 4.8.3", 1.1, HAIR));
    // کلاه و تاج
    const hg = o.head;
    if (hg === "crown") out.push(F("M-4 -88L-5 -97L-1.5 -92.5L1.5 -100L4 -92.5L7.5 -100L9 -92L11.5 -96.5L10.5 -87.5C6 -89.5 0 -89.5 -4 -88Z", GOLD), F(E(3.5, -91.5, 1, 1.2), "#b6413a", { no: 1 }), F(E(7.6, -95, 0.8), "#2a9fb3", { no: 1 }));
    else if (hg === "helmet" || hg === "rostam") {
      out.push(F("M-5.5 -84C-6.5 -95 12 -96 11.5 -84.5C7 -86.5 -1 -86.5 -5.5 -84Z", hg === "rostam" ? "#e9e2d0" : "#9aa3ad"));
      out.push(F("M-5.5 -84.5C-7 -78 -7 -70 -4 -67L-1 -72L-1.5 -84Z", "pat:mail:#8d97a3"));
      out.push(K("M3 -94L3 -101", 1.2, GOLD));
      if (hg === "rostam") out.push(F("M-3 -92l-3 -6l5 3z", "#e9e2d0"), F("M8 -93l2 -6l1 6z", "#e9e2d0"), L("M2 -89.5l1.2 1.4l1.4 -1.4", INK, 0.6), F(E(0.5, -90.5, 0.8), INK, { no: 1 }), F(E(6, -90.5, 0.8), INK, { no: 1 }));
      else out.push(L("M-5 -87C0 -88.5 6 -88.5 11.5 -87", GOLD, 0.9, { nos: 1 }));
    } else if (hg === "turban") out.push(F("M-6 -84C-8 -93 -1 -97 4 -96C10 -96 14 -91 11.5 -84.5C6 -87 -1 -87 -6 -84Z", "#f6f1e6"), K("M2 -96L2.6 -102", 1.6, "#b6413a"), L("M-5 -88C0 -86 6 -90 11 -88", "#c9bfa9", 0.6));
    else if (hg === "cap") out.push(F("M-5.5 -85C-5 -93 10 -94 11.5 -85C6 -87 -1 -87 -5.5 -85Z", o.capc || "#b6413a"), L("M-5 -86C0 -84 7 -84 11.5 -86", GOLD, 1));
    else if (hg === "veil") out.push(F("M-6.5 -83C-8 -95 12 -97 11.5 -84C10 -90 -2 -92 -4 -82C-7 -74 -9 -66 -11 -58L-12 -62C-10 -70 -8 -78 -6.5 -83Z", o.veilc || "#f6f1e6"), F("M-2 -90.5L0 -95L2.5 -91.5L5 -96L7.5 -91L9.6 -94.5L10 -89C6 -90.5 1 -91 -2 -90.5Z", GOLD));
    else if (hg === "hair") out.push(F("M-5.6 -83C-6.5 -92 6 -95 11 -87C7 -88.5 3 -88 0 -86L-2 -80Z", HAIR));
    return out;
  }

  // ---------- آدم ایستاده/سوار/نشسته (رو به راست) ----------
  function person(o) {
    const robe = o.robe || "#b6413a", robe2 = o.robe2 || "#2a6fb3";
    const out = [];
    const sit = o.pose === "ride" || o.pose === "sit";
    // دست پشتی
    const back = o.bound ? K("M-9 -66C-6 -58 -2 -52 2 -50", 6.5, robe2) : K("M-9 -66C-13 -56 -14 -48 -12 -40", 6.5, robe2);
    out.push(back);
    if (!o.bound) out.push(F(E(-12, -38.5, 2.2, 2.4), SKIN));
    if (o.pose === "stand") {
      out.push(F("M-9 -12L-9.5 -1L-2 -1L-2.5 -12Z", o.boot || "#5a2a1e"), F("M3 -12L3 -1L12 0L12.5 -2.5L8.5 -3.5L8.5 -12Z", o.boot || "#5a2a1e"));
      if (o.woman) out.push(F("M-10 -71C-14 -56 -17 -30 -21 -1C-8 1 10 1 21 -1C17 -30 14 -56 12 -71C6 -74 -4 -74 -10 -71Z", o.pat || robe));
      else out.push(F("M-10 -71C-13 -58 -15 -36 -18 -10C-8 -7.5 8 -7.5 18 -10C15 -36 13 -58 12 -71C6 -74 -4 -74 -10 -71Z", o.pat || robe));
      out.push(L("M4 -69C5 -50 6 -30 7.5 " + (o.woman ? -1 : -8.5), GOLD, 1, { nos: 1 }));
    } else if (o.pose === "ride") {
      // ران و ساق روی پهلوی اسب
      out.push(K("M-4 -44C2 -42 8 -40 9 -34L7 -22", 7, robe), F("M4 -24L4 -16L12 -14.5L12 -17L9 -19L9 -24Z", o.boot || "#5a2a1e"));
      out.push(F("M-10 -71C-12 -62 -13 -52 -13 -44C-6 -41 6 -41 13 -44C13 -52 13 -62 12 -71C6 -74 -4 -74 -10 -71Z", o.pat || robe));
      out.push(F("M-13 -45C-16 -40 -18 -34 -17 -30C-10 -31 -6 -34 -4 -40Z", o.pat || robe));
    } else {
      // نشسته چهارزانو بر تخت
      out.push(F("M-16 -40C-22 -38 -24 -30 -20 -26C-6 -24 14 -24 22 -27C24 -32 20 -38 14 -40Z", o.pat || robe));
      out.push(F("M-10 -71C-12 -60 -13 -50 -14 -40C-4 -37 6 -37 14 -40C13 -50 13 -60 12 -71C6 -74 -4 -74 -10 -71Z", o.pat || robe));
      out.push(L("M4 -69C5 -58 5 -48 5 -38", GOLD, 1, { nos: 1 }));
    }
    out.push(L("M-2 -72C1 -68 4 -68 7 -72", GOLD, 1.3, { nos: 1 }));
    out.push(F("M-13.5 -47L13.5 -47L13.3 -43L-13.3 -43Z", GOLD));
    if (o.pose === "stand" && !o.woman) out.push(F("M-3 -43L-5 -29L-1.5 -29L0 -43Z", o.sash || "#2a9fb3"));
    if (o.bound) out.push(K("M-12 -56L13 -55M-12 -50L13 -51", 1.4, "#c9a36a"));
    out.push(F("M0 -77L6.5 -77L6.5 -70L0 -70Z", SKIN, { no: 1 }));
    out.push(...head(o));
    out.push(...arm(o, robe2));
    return out;
  }

  // دست جلویی و سلاح
  function arm(o, sleeve) {
    const w = o.weapon || "none", out = [];
    const hand = (x, y) => F(E(x, y, 2.2, 2.4), SKIN);
    if (o.bound) return out;
    if (w === "mace") {
      out.push(K("M30 -96L19 -57", 1.8, "#7a5a3a"));
      out.push(F("M27 -100C27 -105 34 -105 34 -99C34 -94 28 -93 27 -100Z", "#b7bcc4"), K("M27.5 -102C25 -104 24 -107 25.5 -109M33.5 -101C36 -103 37 -106 35.5 -108.5", 1.3, "#e9e2d0"), F(E(30.6, -96.5, 1.6, 1), "#8d949c", { no: 1 }));
      out.push(K("M9 -67C15 -66 19 -62 20 -57", 6.5, sleeve), hand(20.5, -56));
    } else if (w === "sword") {
      out.push(F("M21 -60L24 -63C30 -74 34 -88 33 -101C38 -88 34 -72 25 -60Z", "#d8dde3"), K("M18.5 -59.5L26.5 -63", 1.6, GOLD));
      out.push(K("M9 -67C15 -66 19 -63 21 -60", 6.5, sleeve), hand(21, -59));
    } else if (w === "spear") {
      out.push(K("M-6 -40L46 -82", 1.4, "#7a5a3a"), F("M44 -80L52 -89L47.5 -78.5Z", "#d8dde3"), F("M42 -77l3.5 -1.5l-.5 3z", "#b6413a"));
      out.push(K("M9 -67C14 -63 17 -60 18 -57", 6.5, sleeve), hand(18.5, -56.5));
    } else if (w === "bow") {
      out.push(K("M34 -86C42 -76 42 -54 34 -44", 1.8, "#7a4a2a"), L("M34 -86L17 -65L34 -44", "#efe3c6", 0.45), K("M15 -65L44 -65", 0.9, "#7a5a3a"), F("M44 -65l-3.6 -1.8v3.6z", "#d8dde3"));
      out.push(K("M9 -67C18 -66 28 -65 37 -65", 6, sleeve), hand(38, -65), F(E(16, -65.5, 2.2, 2.4), SKIN));
    } else if (w === "lasso") {
      out.push(K("M19 -57C34 -52 44 -66 40 -76C36 -84 24 -80 26 -72C28 -64 40 -66 44 -74", 1.1, "#d1a35d"));
      out.push(K("M9 -67C15 -64 18 -60 19 -57", 6.5, sleeve), hand(19.5, -56.5));
    } else if (w === "cup") {
      out.push(K("M9 -67C15 -64 19 -61 22 -60", 6.5, sleeve), F("M21 -66L29 -66C29 -61 27 -59 25 -59C23 -59 21 -61 21 -66Z", GOLD), K("M25 -59L25 -56", 1, GOLD), hand(22.5, -59.5));
    } else if (w === "candle") {
      out.push(K("M9 -67C15 -64 19 -62 21 -62", 6.5, sleeve), K("M23 -64L23 -74", 2.2, "#f6f1e6"), F("M23 -75C21 -78 22.5 -81 23 -83C24 -80 25 -78 23 -75Z", "#f6b13a"), hand(22.5, -62));
    } else if (w === "stone") {
      out.push(K("M9 -67C14 -72 18 -80 20 -86", 6.5, sleeve), hand(20.5, -87.5), F("M19 -94C22 -96 25 -94 24.5 -91C23 -89 20 -89 19 -91Z", "#8d8577"));
    } else if (w === "banner") {
      out.push(K("M9 -67C14 -64 17 -60 18 -57", 6.5, sleeve), hand(18.5, -56.5));
    } else if (w === "hand") {
      out.push(K("M9 -67C15 -68 20 -72 23 -77", 6.5, sleeve), hand(23.5, -78.5));
    } else {
      out.push(K("M9 -66C13 -58 14 -50 12 -44", 6.5, sleeve), hand(12, -42.5));
    }
    return out;
  }

  // ---------- اسب (رو به راست؛ سم‌ها روی 0) ----------
  function horse(o) {
    const c = o.color || "#c9776a", dark = o.dark || "#5a2a1e", out = [];
    const gal = o.pose !== "stand";
    const legs = gal
      ? ["M-27 -28C-35 -24 -42 -20 -50 -16", "M-23 -26C-26 -18 -32 -12 -40 -8", "M20 -30C27 -26 34 -22 42 -22", "M16 -28C22 -20 26 -16 34 -14"]
      : ["M-29 -28C-31 -20 -32 -12 -30 -1", "M-23 -27C-24 -18 -24 -10 -22 -1", "M19 -30C20 -20 21 -11 21 -1", "M14 -29C14 -19 15 -10 14 -1"];
    const hoof = gal ? [[-50.5, -16], [-40.5, -8], [42.5, -22], [34.5, -14]] : [[-30, -1], [-22, -1], [21, -1], [14, -1]];
    const farLeg = (i) => [K(legs[i], 4.3, o.far || c), F(E(hoof[i][0], hoof[i][1], 2.2, 1.6), INK, { no: 1 })];
    out.push(...farLeg(0), ...farLeg(2));
    // دم گره‌خورده
    out.push(K("M-38 -40C-46 -40 -49 -34 -48 -27C-47 -22 -50 -18 -54 -16", 3.6, o.tail || dark), F(E(-47.5, -32, 2.2), GOLD));
    // تن و گردن و سر
    out.push(F("M-31 -42C-40 -42 -43 -32 -38 -27C-33 -22 -25 -22 -17 -24L14 -24C22 -24 27 -30 27 -38C27 -43 24 -47 19 -48L-14 -48C-22 -48 -27 -45 -31 -42Z", o.pat || c));
    out.push(F("M14 -46C19 -55 25 -63 31 -69L34 -72L36.5 -69C40.5 -63 44.5 -58 47 -54C48.5 -51 45.5 -48.5 42.5 -50.5L37.5 -54C33.5 -50 30.5 -44 27.5 -36Z", o.pat || c));
    out.push(F("M32 -70L31.5 -77L35.5 -71.5Z", c));
    out.push(K("M14 -46C19 -55 25 -63 31 -69", 2.4, o.mane || dark));
    out.push(F(E(39.5, -61.5, 1.1, 0.8), INK, { no: 1 }), L("M45 -52.5l1.2 -.5", INK, 0.6));
    // افسار و زین و زین‌پوش
    out.push(L("M36.5 -66L38 -58L45.5 -53M38 -58C34 -54 30 -50 24 -48", "#b6413a", 0.9, { nos: 1 }));
    out.push(F("M-17 -48L9 -48L11 -27C2 -25 -8 -25 -15 -27Z", o.cloth || "pat:flower:#2a6fb3"), L("M-15 -29C-8 -27 2 -27 10.5 -29", GOLD, 1.2, { nos: 1 }));
    out.push(F("M-12 -50C-9 -53 3 -53 6 -50L6 -47L-12 -47Z", "#7a3a24"));
    out.push(L("M-21 -24L-31 -42M19 -26L25 -44", GOLD, 0.8, { nos: 1 }));
    out.push(...farLeg(1), ...farLeg(3));
    if (o.spots) for (let i = 0; i < 9; i++) out.push(F(E(-30 + i * 6.5, -38 + (i % 3) * 4.5, 1.2, 0.9), "#f7e3c4", { no: 1, nos: 1 }));
    return out;
  }

  // سوار = اسب + آدم با زین روی (−3، −48)
  function rider(h, p) {
    return [...horse(h), G(person({ ...p, pose: "ride" }), -2, 2, 1)];
  }

  // ---------- سیمرغ ----------
  function simorgh() {
    const out = [];
    const tails = [
      ["M-14 -20C-40 -12 -56 -30 -72 -18C-80 -12 -82 -2 -76 4", "#2a9fb3"],
      ["M-14 -18C-36 -2 -52 -6 -64 6C-70 12 -70 20 -64 24", "#b6413a"],
      ["M-12 -16C-28 6 -40 12 -44 26C-46 32 -42 38 -36 38", GOLD],
      ["M-14 -22C-42 -26 -58 -46 -78 -42C-86 -40 -90 -32 -86 -26", "#3c6e47"],
    ];
    tails.forEach(([d, c]) => out.push(K(d, 3.8, c)));
    tails.forEach(([d], i) => { const m = d.match(/(-?\d+) (-?\d+)$/); out.push(F(E(+m[1], +m[2], 3.6), ["#2a9fb3", "#b6413a", GOLD, "#3c6e47"][i]), F(E(+m[1], +m[2], 1.6), "#1d3a6e", { no: 1 })); });
    // بال دور
    out.push(F("M0 -30C-6 -50 -2 -72 10 -88C14 -76 18 -66 26 -58C20 -48 12 -38 0 -30Z", "pat:feather:#b6413a"));
    out.push(F("M-18 -16C-24 -30 -10 -38 8 -36C22 -34 32 -30 38 -38C40 -30 36 -20 26 -16C10 -10 -8 -8 -18 -16Z", "pat:feather:#2a6fb3"));
    // سر و گردن و تاج
    out.push(F("M26 -34C30 -42 32 -50 38 -54C44 -57 50 -54 50 -49C48 -46 44 -46 41 -45C38 -42 36 -36 34 -30Z", "#2a9fb3"));
    out.push(F("M49 -51L58 -48L50 -46.5Z", GOLD), F(E(44.5, -50.5, 1.3), "#fff", { ow: 0.5 }), F(E(44.8, -50.5, 0.6), INK, { no: 1 }));
    out.push(K("M41 -55C40 -62 44 -66 48 -66M43 -55C46 -60 52 -60 54 -57", 1.4, "#b6413a"), F(E(48.5, -66.5, 1.4), GOLD), F(E(54.5, -57, 1.4), GOLD));
    // بال نزدیک
    out.push(F("M8 -34C4 -52 14 -78 34 -94C34 -80 40 -66 50 -60C40 -52 28 -40 8 -34Z", "pat:feather:" + GOLD));
    for (let i = 0; i < 5; i++) out.push(L(`M${14 + i * 3} -40C${18 + i * 4} -55 ${24 + i * 3} -70 ${30 + i} -86`, "#9a6a1e", 0.5, { nos: 1 }));
    return out;
  }

  // ---------- دیو ----------
  function div(o) {
    const c = o.color || "#3f5f8a", out = [];
    const sk = o.white ? "pat:spots:#efeadf" : "pat:spots:" + c;
    out.push(K("M-12 -86C-20 -74 -22 -62 -18 -54", 9, sk), F(E(-18, -52, 3.4), o.white ? "#efeadf" : c)); // دست پشتی
    out.push(K("M-8 -40C-10 -26 -12 -14 -12 -2", 10, sk), K("M8 -40C10 -26 13 -14 14 -2", 10, sk));
    out.push(F("M-17 -3L-6 -3L-6 1L-19 1Z", INK, { no: 1 }), F("M9 -3L20 -3L21 1L8 1Z", INK, { no: 1 }));
    out.push(K("M-12 -10L-6 -10M9 -10L16 -10", 1.6, GOLD));
    out.push(F("M-16 -92C-22 -76 -18 -52 -12 -40C-4 -36 6 -36 14 -40C20 -54 22 -76 16 -92C6 -98 -6 -98 -16 -92Z", sk));
    out.push(F("M-14 -46C-16 -40 -16 -32 -12 -26L14 -26C17 -32 17 -40 14 -46Z", "pat:tiger:#e0a33c"));
    // سر
    out.push(F("M-8 -96C-10 -110 12 -112 12 -98C12 -90 6 -86 2 -86C-4 -86 -8 -90 -8 -96Z", o.white ? "#efeadf" : c));
    out.push(F("M-6 -105C-12 -110 -14 -118 -10 -124C-10 -116 -6 -112 -2 -108Z", "#efe3c6"), F("M8 -107C12 -112 18 -116 22 -114C16 -112 13 -108 11 -104Z", "#efe3c6"));
    out.push(F(E(5, -100, 2, 1.6), "#f6b13a"), F(E(5.4, -100, 0.8), INK, { no: 1 }));
    out.push(F("M3 -92C6 -90 10 -90 12 -93C11 -88 6 -86 3 -88Z", "#7a1f1a"), F("M5 -91.5l.8 2l.8 -2zM9 -91.5l.8 2l.8 -2z", "#fff", { no: 1 }));
    out.push(F("M-8 -100C-14 -96 -16 -88 -14 -82C-12 -88 -10 -92 -6 -94Z", HAIR));
    // دست جلو با گرز سنگی
    out.push(K("M22 -112C26 -96 28 -80 26 -62", 4.5, "#6b4a2a"), F("M18 -116C18 -126 30 -126 30 -116C30 -108 18 -108 18 -116Z", "#8d8577"));
    out.push(K("M12 -88C20 -82 24 -74 26 -66", 9, sk), F(E(26, -63, 3.6), o.white ? "#efeadf" : c));
    out.push(F(E(-10, -88, 2.4), GOLD), F(E(14, -88, 2.4), GOLD));
    return out;
  }

  // ---------- اژدها ----------
  function dragon() {
    const out = [];
    const body = "M-62 -8C-50 -30 -30 -6 -14 -22C2 -38 14 -12 28 -26C36 -34 40 -44 46 -50";
    out.push(K(body, 15, "pat:scales:#3c6e47"));
    out.push(K(body, 3, GOLD, { nos: 1 }));
    out.push(F("M-62 -8C-70 -2 -76 -6 -78 -14C-74 -8 -68 -8 -64 -12Z", "#3c6e47"));
    for (let i = 0; i < 9; i++) { const x = -54 + i * 11, y = [-28, -26, -16, -32, -38, -22, -30, -40, -52][i]; out.push(F(`M${x - 3} ${y}l3 -7l3 7z`, "#b6413a")); }
    out.push(K("M-36 -16L-40 -2M-4 -28L-8 -12M22 -20L26 -6", 4, "#3c6e47"), L("M-43 -2l3 0l3 0M-11 -12l3 0l3 0M23 -6l3 0l3 0", "#efe3c6", 1));
    // سر
    out.push(F("M40 -58C46 -66 58 -66 64 -60L72 -60C74 -56 70 -54 66 -54L58 -50L70 -46C70 -42 64 -40 58 -42C50 -44 42 -46 40 -52Z", "#3c6e47"));
    out.push(F("M60 -54L72 -56L74 -48L60 -48Z", "#7a1f1a"), F("M62 -55l1 2.5l1 -2.5zM66 -55l1 2.5l1 -2.5z", "#fff", { no: 1 }));
    out.push(F(E(55, -59, 2.2, 1.6), "#f6b13a"), F(E(55.5, -59, 0.9), INK, { no: 1 }));
    out.push(K("M48 -64C46 -72 50 -78 56 -78M52 -64C54 -70 60 -72 64 -70", 1.6, GOLD));
    out.push(F("M74 -52C82 -56 88 -50 94 -54C90 -46 82 -44 74 -48Z", "#f28a2e"), F("M76 -51C82 -53 86 -50 90 -52C86 -48 80 -47 76 -49Z", "#f6d44a", { no: 1 }));
    return out;
  }

  // ---------- شیر ----------
  function lion() {
    const out = [];
    const c = "#d9a441";
    out.push(K("M-24 -18C-28 -10 -30 -4 -34 0M18 -20C24 -14 30 -12 36 -12", 5, "#c08a2e"));
    out.push(K("M-30 -26C-40 -32 -44 -44 -38 -50", 2, c), F(E(-38, -51, 2.4, 3), "#8a5a1e"));
    out.push(F("M-30 -28C-32 -36 -22 -38 -8 -36L12 -36C22 -36 26 -30 24 -22C22 -16 12 -14 2 -16L-20 -16C-28 -16 -30 -22 -30 -28Z", c));
    out.push(F("M8 -38C6 -48 14 -56 24 -54C32 -54 36 -46 34 -38C32 -30 24 -24 14 -26C10 -28 8 -32 8 -38Z", "#a8641e"));
    for (let i = 0; i < 7; i++) { const a = -2.6 + i * 0.55; out.push(F(`M${21 + Math.cos(a) * 9} ${-42 + Math.sin(a) * 9}l${Math.cos(a) * 6} ${Math.sin(a) * 6}l${Math.cos(a + 0.5) * 3} ${Math.sin(a + 0.5) * 3}z`, "#8a4a14", { no: 1 })); }
    out.push(F("M22 -48C28 -50 34 -46 36 -40L38 -36C36 -32 30 -32 28 -34C24 -36 22 -42 22 -48Z", c));
    out.push(F(E(30, -44, 1.4, 1), "#fff", { ow: 0.4 }), F(E(30.4, -44, 0.6), INK, { no: 1 }), L("M33 -35.5l4 0", INK, 0.6), F("M34 -35l1 2l1 -2z", "#fff", { no: 1 }));
    out.push(K("M-20 -18C-20 -10 -22 -4 -22 0M10 -18C12 -10 14 -4 16 0", 5, c), L("M-25 0l3 0l3 0M13 0l3 0l3 0", INK, 0.8));
    return out;
  }

  // ---------- میش، عقاب، مار ----------
  function ram() {
    return [
      K("M-10 -10L-11 0M-4 -10L-4 0M8 -10L8 0M13 -10L14 0", 2.4, "#6b5a4a"),
      F("M-16 -16C-18 -26 -6 -30 4 -28C14 -28 18 -22 16 -14C12 -8 -10 -8 -16 -16Z", "#efe6d2"),
      ...Array.from({ length: 6 }, (_, i) => L(`M${-12 + i * 5} -24c1 2 3 2 4 0`, "#c9bfa9", 0.6, { nos: 1 })),
      F("M12 -24C16 -30 22 -30 24 -26L26 -20C24 -18 20 -18 18 -20Z", "#e2d8c2"),
      K("M15 -27C12 -32 16 -36 20 -33C22 -31 20 -29 18 -30", 1.8, "#a8875a"),
      F(E(21, -25.5, 0.8), INK, { no: 1 }),
    ];
  }
  function eagle() {
    return [
      F("M-4 -6C-20 -16 -34 -18 -46 -14C-36 -22 -22 -26 -6 -16Z", "pat:feather:#6b4a2a"),
      F("M-8 -4C-14 1 -18 4 -24 4C-20 0 -16 -4 -12 -8Z", "#4a321e"),
      F("M-10 -10C-4 -14 6 -14 12 -10C10 -4 0 -2 -10 -6Z", "#8a5a2e"),
      F("M10 -12C14 -16 18 -16 20 -13L24 -11L19 -9.5C16 -8 12 -8 10 -10Z", "#efe6d2"),
      F(E(17, -13, 0.7), INK, { no: 1 }),
      F("M2 -12C-4 -24 -14 -34 -28 -40C-12 -40 2 -32 10 -14Z", "pat:feather:#8a5a2e"),
      L("M2 -6L2 0M6 -6L7 0", "#d9a441", 1),
    ];
  }
  function snake(c = "#3c3c34") {
    return [K("M-20 0C-14 -6 -6 4 0 -4C6 -12 12 -4 14 -12C16 -18 22 -20 26 -18", 3.2, "pat:scales:" + c), F("M24 -21C28 -23 32 -21 32 -18C30 -16 26 -15 24 -16Z", c), F(E(28, -19.5, 0.6), "#f6b13a", { no: 1 }), L("M32 -18l3 1l1 -1M35 -17l1 1", "#b6413a", 0.5)];
  }

  // ---------- چیدمان‌ها (هر پیکره: لایه‌ها + کادر) ----------
  const ROSTAM = { robe: "#c58a3a", pat: "pat:tiger:#d39a3e", robe2: "#c58a3a", head: "rostam", beard: true, sash: "#2a9fb3" };
  const RAKHSH = { color: "#c66e5c", spots: true, cloth: "pat:flower:#1f5f8a" };
  const FIGS = {
    rostamMace: { box: [-28, -112, 40, 2], art: () => person({ ...ROSTAM, pose: "stand", weapon: "mace" }) },
    rostamSword: { box: [-28, -104, 40, 2], art: () => person({ ...ROSTAM, pose: "stand", weapon: "sword" }) },
    rostamBow: { box: [-28, -104, 48, 2], art: () => person({ ...ROSTAM, pose: "stand", weapon: "bow" }) },
    rostamLasso: { box: [-28, -104, 48, 2], art: () => person({ ...ROSTAM, pose: "stand", weapon: "lasso" }) },
    rostamRider: { box: [-58, -112, 52, 2], art: () => rider(RAKHSH, { ...ROSTAM, weapon: "mace" }) },
    rostamRiderSpear: { box: [-58, -104, 56, 2], art: () => rider(RAKHSH, { ...ROSTAM, weapon: "spear" }) },
    rakhsh: { box: [-58, -80, 50, 2], art: () => horse({ ...RAKHSH, cloth: "pat:flower:#1f5f8a" }) },
    rakhshStand: { box: [-58, -80, 50, 2], art: () => horse({ ...RAKHSH, pose: "stand" }) },
    sohrab: { box: [-58, -104, 56, 2], art: () => rider({ color: "#8d8a86", cloth: "pat:dots:#b6413a", far: "#77736f" }, { robe: "#2a6fb3", pat: "pat:dots:#2a6fb3", robe2: "#2a6fb3", head: "helmet", weapon: "spear" }) },
    siavash: { box: [-58, -104, 52, 2], art: () => rider({ color: "#2a2422", mane: "#0f0b0a", tail: "#0f0b0a", far: "#1c1816", cloth: "pat:flower:#b6413a" }, { robe: "#f6f1e6", pat: "pat:flower:#e9e4d6", robe2: "#e9e4d6", head: "crown", beard: false, weapon: "none" }) },
    fereydun: { box: [-58, -112, 52, 2], art: () => rider({ color: "#efe6d8", far: "#d6cdbf", mane: "#9a8f80", tail: "#9a8f80", cloth: "pat:flower:#3c6e47" }, { robe: "#3c6e47", pat: "pat:dots:#3c6e47", robe2: "#3c6e47", head: "crown", beard: true, weapon: "mace" }) },
    esfandiyar: { box: [-58, -104, 56, 2], art: () => rider({ color: "#3a3a40", far: "#2a2a30", cloth: "pat:dots:#b6413a" }, { robe: "#8d97a3", pat: "pat:mail:#9aa3ad", robe2: "#8d97a3", head: "helmet", beard: true, weapon: "spear" }) },
    gordafarid: { box: [-58, -104, 56, 2], art: () => rider({ color: "#efe6d8", far: "#d6cdbf", mane: "#9a8f80", tail: "#9a8f80", cloth: "pat:flower:#7a3a6e" }, { robe: "#7a3a6e", pat: "pat:dots:#7a3a6e", robe2: "#7a3a6e", head: "helmet", woman: true, weapon: "spear" }) },
    bahramRider: { box: [-58, -104, 56, 2], art: () => rider({ color: "#c9a46a", far: "#a8864e", cloth: "pat:flower:#b6413a" }, { robe: "#b6413a", pat: "pat:flower:#b6413a", robe2: "#b6413a", head: "crown", beard: true, weapon: "bow" }) },
    kingThrone: { box: [-30, -118, 40, 2], art: () => [throne(), G(person({ robe: "#b6413a", pat: "pat:flower:#b6413a", robe2: "#b6413a", head: "crown", beard: true, pose: "sit", weapon: "cup" }), 0, -14)] },
    zahhak: { box: [-34, -120, 44, 2], art: () => [throne(), G(person({ robe: "#3a2a4a", pat: "pat:dots:#3a2a4a", robe2: "#3a2a4a", head: "crown", beard: true, pose: "sit", weapon: "hand" }), 0, -14), G(snake("#2e3a2a"), -2, -86, 0.7, true), G(snake("#2e3a2a"), 10, -86, 0.7)] },
    kavus: { box: [-34, -118, 40, 2], art: () => [throne(), G(person({ robe: "#2a6fb3", pat: "pat:flower:#2a6fb3", robe2: "#2a6fb3", head: "crown", beard: true, pose: "sit", weapon: "hand" }), 0, -14)] },
    jamshid: { box: [-30, -118, 40, 2], art: () => [throne(), G(person({ robe: "#3c6e47", pat: "pat:flower:#3c6e47", robe2: "#3c6e47", head: "crown", beard: true, pose: "sit", weapon: "cup" }), 0, -14)] },
    kaveh: { box: [-28, -104, 36, 2], art: () => person({ robe: "#7a4a2a", robe2: "#7a4a2a", head: "cap", capc: "#5a2a1e", beard: true, pose: "stand", weapon: "banner", sash: "#b6413a" }) },
    hushang: { box: [-28, -104, 36, 2], art: () => person({ robe: "#3c6e47", pat: "pat:dots:#3c6e47", robe2: "#3c6e47", head: "crown", beard: true, pose: "stand", weapon: "stone" }) },
    tahmuras: { box: [-28, -112, 40, 2], art: () => person({ robe: "#2a6fb3", pat: "pat:dots:#2a6fb3", robe2: "#2a6fb3", head: "crown", beard: true, pose: "stand", weapon: "mace" }) },
    zal: { box: [-28, -104, 36, 2], art: () => person({ robe: "#f6f1e6", pat: "pat:flower:#e9e4d6", robe2: "#e9e4d6", head: "hair", beard: false, pose: "stand", weapon: "hand", boot: "#b6413a" }) },
    zalChild: { box: [-28, -104, 36, 2], art: () => person({ robe: "#f6f1e6", robe2: "#e9e4d6", head: "hair", beard: false, pose: "stand", weapon: "hand", boot: "#b6413a" }) },
    sage: { box: [-28, -104, 36, 2], art: () => person({ robe: "#f6f1e6", pat: "pat:dots:#e9e4d6", robe2: "#2a6fb3", head: "turban", beard: true, pose: "stand", weapon: "hand" }) },
    shaghad: { box: [-28, -104, 40, 2], art: () => person({ robe: "#5a4a6a", robe2: "#5a4a6a", head: "cap", beard: true, pose: "stand", weapon: "sword" }) },
    olad: { box: [-28, -104, 36, 2], art: () => person({ robe: "#8a6a3a", robe2: "#8a6a3a", head: "cap", capc: "#3c6e47", beard: true, pose: "stand", bound: true }) },
    sohrabStand: { box: [-28, -104, 40, 2], art: () => person({ robe: "#2a6fb3", pat: "pat:dots:#2a6fb3", robe2: "#2a6fb3", head: "helmet", pose: "stand", weapon: "sword" }) },
    rudabeh: { box: [-28, -104, 30, 2], art: () => person({ robe: "#b6413a", pat: "pat:flower:#b6413a", robe2: "#b6413a", head: "veil", woman: true, pose: "stand", weapon: "hand" }) },
    tahmineh: { box: [-28, -104, 30, 2], art: () => person({ robe: "#7a3a6e", pat: "pat:flower:#7a3a6e", robe2: "#7a3a6e", head: "veil", veilc: "#f0d9e6", woman: true, pose: "stand", weapon: "candle" }) },
    manijeh: { box: [-28, -104, 30, 2], art: () => person({ robe: "#2a9fb3", pat: "pat:flower:#2a9fb3", robe2: "#2a9fb3", head: "veil", woman: true, pose: "stand", weapon: "hand" }) },
    witch: { box: [-28, -104, 30, 2], art: () => person({ robe: "#3a2a4a", pat: "pat:dots:#3a2a4a", robe2: "#3a2a4a", head: "veil", veilc: "#5a3a6e", woman: true, pose: "stand", weapon: "cup" }) },
    simorgh: { box: [-92, -96, 96, 42], art: simorgh },
    div: { box: [-28, -128, 34, 2], art: () => div({ color: "#3f5f8a" }) },
    divBrown: { box: [-28, -128, 34, 2], art: () => div({ color: "#7a4a2a" }) },
    divWhite: { box: [-28, -128, 34, 2], art: () => div({ white: true }) },
    dragon: { box: [-80, -82, 96, 2], art: dragon },
    lion: { box: [-46, -58, 42, 2], art: lion },
    ram: { box: [-20, -36, 28, 2], art: ram },
    eagle: { box: [-48, -42, 26, 6], art: eagle },
    zahhakBound: { box: [-28, -112, 36, 2], art: () => [...person({ robe: "#3a2a4a", pat: "pat:dots:#3a2a4a", robe2: "#3a2a4a", head: "crown", beard: true, pose: "stand", bound: true }), G(snake("#2e3a2a"), -2, -72, 0.6, true), G(snake("#2e3a2a"), 10, -72, 0.6)] },
    bahram: { box: [-28, -112, 40, 2], art: () => person({ robe: "#b6413a", pat: "pat:flower:#b6413a", robe2: "#b6413a", head: "crown", beard: true, pose: "stand", weapon: "mace" }) },
    kaykhosrow: { box: [-30, -118, 40, 2], art: () => [throne(), G(person({ robe: "#2a9fb3", pat: "pat:flower:#2a9fb3", robe2: "#2a9fb3", head: "crown", beard: true, pose: "sit", weapon: "cup" }), 0, -14)] },
    anushirvan: { box: [-30, -118, 40, 2], art: () => [throne(), G(person({ robe: "#7a3a6e", pat: "pat:flower:#7a3a6e", robe2: "#7a3a6e", head: "crown", beard: true, pose: "sit", weapon: "hand" }), 0, -14)] },
    snake: { box: [-22, -24, 38, 4], art: () => snake("#2e3a2a") },
  };

  // تخت شاهی
  function throne() {
    return G([
      F("M-26 -4L-26 -36L26 -36L26 -4Z", "pat:flower:#9a6a1e"),
      F("M-30 -40L30 -40L30 -34L-30 -34Z", GOLD), F("M-28 -4L-28 0L-22 0L-22 -4ZM22 -4L22 0L28 0L28 -4Z", GOLD),
      F("M-24 -40L-24 -70C-24 -78 -14 -80 -12 -74L-12 -40Z", "pat:flower:#b6413a"),
      F(E(-18, -76, 4), GOLD),
    ], 0, 0, 1);
  }

  // ---------- ساخت بوم ----------
  const cache = new Map();
  function canvasOf(name, sketch, ppu = 5) {
    const key = name + (sketch ? "~s" : "") + ppu;
    if (cache.has(key)) return cache.get(key);
    const fig = FIGS[name];
    const [x0, y0, x1, y1] = fig.box;
    const pad = 3;
    const cv = document.createElement("canvas");
    cv.width = Math.ceil((x1 - x0 + pad * 2) * ppu);
    cv.height = Math.ceil((y1 - y0 + pad * 2) * ppu);
    const c = cv.getContext("2d");
    c.scale(ppu, ppu);
    c.translate(pad - x0, pad - y0);
    if (sketch) c.globalAlpha = 0.9;
    draw(c, fig.art(), sketch);
    cache.set(key, cv);
    return cv;
  }

  window.SHN_ART = { FIGS, canvasOf, draw, E, INK, PAPER, GOLD, GOLD2 };
})();
