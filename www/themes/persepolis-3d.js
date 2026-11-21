// «تخت جمشید» — بناهای هخامنشی، سه‌بعدی (three.js).
// هر بنا (کاخ، دروازه، آرامگاه، کتیبه) در ۶ مرحله ساخته می‌شود: زمین و کوه، صفه و پلکان، پایه‌ها،
// ستون‌ها و دیوارها، سرستون‌ها و بام، و در آخر بنا جان می‌گیرد (سربازان جاویدان، درفش، پرنده، آب و آتش).
// بخش‌هایی که هنوز ساخته نشده‌اند مثل «نقشه‌ی معمار» کم‌رنگ با خط‌های قلم دیده می‌شوند.
(function () {
  "use strict";

  const PARTS = ["زمین و کوه رحمت", "صفه و پلکان", "پایه‌ها و درگاه‌ها", "ستون‌ها و دیوارها", "سرستون‌ها و بام", "جان گرفتن بنا"];

  // ---------- بارگذاری three.js فقط وقتی لازم است (همان فایلی که شاهنامه هم می‌خواند) ----------
  let loading = null;
  function ready() {
    if (window.THREE) return Promise.resolve(window.THREE);
    if (window.SHN && window.SHN.ready) return window.SHN.ready();
    if (!loading) loading = new Promise((res, rej) => {
      const s = document.createElement("script");
      s.src = "vendor/three.min.js";
      s.onload = () => res(window.THREE);
      s.onerror = () => { loading = null; rej(new Error("three")); };
      document.head.appendChild(s);
    });
    return loading;
  }
  function webgl() {
    try { const c = document.createElement("canvas"); return !!(window.WebGLRenderingContext && (c.getContext("webgl") || c.getContext("experimental-webgl"))); } catch (e) { return false; }
  }

  // ---------- رنگ‌ها ----------
  const SKY = {
    day: { top: "#5c8fc4", mid: "#a9c8df", low: "#efe2c8", sun: "#fffbe8", haze: "#e9dcc4", light: 0xfff2dc, amb: 0.8 },
    noon: { top: "#3f7fc0", mid: "#8fbbe0", low: "#e6e6d8", sun: "#ffffff", haze: "#dfe2d8", light: 0xffffff, amb: 0.85 },
    dusk: { top: "#4b3a6e", mid: "#d77a55", low: "#f6c58a", sun: "#ffe2a0", haze: "#e9b98c", light: 0xffcf96, amb: 0.7 },
    dawn: { top: "#7a8fc0", mid: "#e8a9a0", low: "#f8dcc0", sun: "#fff0d8", haze: "#f0d2c0", light: 0xffe4cc, amb: 0.75 },
    night: { top: "#0b1230", mid: "#1c2a58", low: "#3a4a78", sun: "#f3ecd0", haze: "#2c3a66", light: 0xc8d2f6, amb: 0.85, stars: true },
  };
  const GROUND = { plain: ["#cdb486", "#b89c6c", "#8c9a5a"], green: ["#a9b47a", "#8e9b60", "#6f8a4a"], dry: ["#d8c39a", "#c2a878", "#a08a5c"], snowy: ["#e8e4dc", "#cfc8bc", "#9aa08a"] };
  const STONE = "#cdbd9c", STONE2 = "#b9a785", DARK = "#4a4540", INK = "#3a2e24", PAPER = "#f2e8d2";

  // ---------- بوم‌های بافت ----------
  function cv(w, h, fn) { const c = document.createElement("canvas"); c.width = w; c.height = h; fn(c.getContext("2d"), w, h); return c; }
  function rnd(seed) { let s = Math.abs(Math.round(seed * 9301 + 49297)) % 233280; return () => ((s = (s * 9301 + 49297) % 233280) / 233280); }

  // سنگ آهک خاکستری‌ـنخودی تخت جمشید: لکه‌های نرم، دانه‌های ریز و رگه‌های کم‌رنگ
  function stoneCanvas(base, seed, dark) {
    return cv(256, 256, (c, w, h) => {
      c.fillStyle = base; c.fillRect(0, 0, w, h);
      const r = rnd(seed);
      for (let i = 0; i < 40; i++) { c.globalAlpha = 0.06 + r() * 0.06; c.fillStyle = r() > 0.5 ? "#fff" : "#000"; c.beginPath(); c.ellipse(r() * w, r() * h, 10 + r() * 40, 6 + r() * 20, r() * 3, 0, 7); c.fill(); }
      for (let i = 0; i < 900; i++) { c.globalAlpha = 0.12 + r() * 0.15; c.fillStyle = r() > 0.5 ? (dark ? "#777" : "#fff8ea") : (dark ? "#111" : "#6b5d48"); c.fillRect(r() * w, r() * h, 1 + r() * 1.5, 1 + r() * 1.5); }
      c.globalAlpha = 0.18; c.strokeStyle = dark ? "#222" : "#7a6a52"; c.lineWidth = 1;
      for (let i = 0; i < 4; i++) { c.beginPath(); let x = r() * w, y = r() * h; c.moveTo(x, y); for (let k = 0; k < 6; k++) { x += (r() - 0.3) * 30; y += (r() - 0.5) * 14; c.lineTo(x, y); } c.stroke(); }
      c.globalAlpha = 1;
    });
  }
  // سنگ‌چین بزرگ و چندضلعی دیواره‌ی صفه
  function ashlarCanvas() {
    return cv(512, 256, (c, w, h) => {
      c.fillStyle = STONE2; c.fillRect(0, 0, w, h);
      c.drawImage(stoneCanvas(STONE2, 11), 0, 0, 256, 256); c.drawImage(stoneCanvas(STONE2, 12), 256, 0, 256, 256);
      const r = rnd(5);
      c.strokeStyle = "rgba(70,55,40,.65)"; c.lineWidth = 2.2;
      let y = 0;
      while (y < h) {
        const rh = 50 + r() * 40; let x = -r() * 60;
        while (x < w) {
          const rw = 70 + r() * 90, sk = (r() - 0.5) * 14;
          c.beginPath(); c.moveTo(x, y); c.lineTo(x + rw, y + sk * 0.3); c.lineTo(x + rw + sk, y + rh); c.lineTo(x + sk * 0.5, y + rh); c.closePath(); c.stroke();
          c.fillStyle = `rgba(255,248,230,${0.05 + r() * 0.08})`; c.fill();
          x += rw;
        }
        y += rh;
      }
    });
  }
  // کاه‌گل دیوارهای خشتی (رنگ‌شده و صاف)
  function plasterCanvas(base) {
    return cv(256, 256, (c, w, h) => {
      c.fillStyle = base; c.fillRect(0, 0, w, h);
      const r = rnd(21);
      for (let i = 0; i < 60; i++) { c.globalAlpha = 0.05 + r() * 0.05; c.fillStyle = r() > 0.5 ? "#fff" : "#6b4a2a"; c.beginPath(); c.ellipse(r() * w, r() * h, 8 + r() * 30, 4 + r() * 12, 0, 0, 7); c.fill(); }
      c.globalAlpha = 0.12; c.strokeStyle = "#6b4a2a";
      for (let y = 0; y < h; y += 16) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); }
      c.globalAlpha = 1;
    });
  }
  function rockCanvas(base, seed) {
    return cv(512, 512, (c, w, h) => {
      c.fillStyle = base; c.fillRect(0, 0, w, h);
      const r = rnd(seed);
      for (let i = 0; i < 70; i++) { c.globalAlpha = 0.08 + r() * 0.1; c.fillStyle = r() > 0.5 ? "#fff1dc" : "#3a2a1c"; c.beginPath(); c.ellipse(r() * w, r() * h, 20 + r() * 80, 8 + r() * 30, (r() - 0.5) * 0.6, 0, 7); c.fill(); }
      c.globalAlpha = 0.35; c.strokeStyle = "#3a2a1c"; c.lineWidth = 1.5;
      for (let i = 0; i < 26; i++) { c.beginPath(); let x = r() * w, y = r() * h; c.moveTo(x, y); for (let k = 0; k < 5; k++) { x += (r() - 0.5) * 40; y += 10 + r() * 30; c.lineTo(x, y); } c.stroke(); }
      c.globalAlpha = 0.2; for (let y = 10; y < h; y += 22 + r() * 20) { c.beginPath(); c.moveTo(0, y); for (let x = 0; x <= w; x += 32) c.lineTo(x, y + Math.sin(x * 0.03 + y) * 5); c.stroke(); }
      c.globalAlpha = 1;
    });
  }
  function groundCanvas(gc, seed) {
    return cv(1024, 640, (c, w, h) => {
      c.fillStyle = gc[0]; c.fillRect(0, 0, w, h);
      const r = rnd(seed);
      for (let i = 0; i < 40; i++) { c.fillStyle = gc[1]; c.globalAlpha = 0.25; c.beginPath(); c.ellipse(r() * w, r() * h, 40 + r() * 90, 14 + r() * 26, 0, 0, 7); c.fill(); }
      c.globalAlpha = 1;
      for (let i = 0; i < 260; i++) {
        const x = r() * w, y = r() * h, k = r();
        if (k < 0.6) { c.strokeStyle = gc[2]; c.lineWidth = 1.4; for (let j = -1; j <= 1; j++) { c.beginPath(); c.moveTo(x, y); c.lineTo(x + j * 4, y - 6 - r() * 5); c.stroke(); } }
        else { c.fillStyle = `rgba(90,70,50,${0.2 + r() * 0.25})`; c.beginPath(); c.ellipse(x, y, 2 + r() * 4, 1.5 + r() * 2, 0, 0, 7); c.fill(); }
      }
    });
  }
  function skyCanvas(sky) {
    return cv(1024, 512, (c, w, h) => {
      const g = c.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, sky.top); g.addColorStop(0.55, sky.mid); g.addColorStop(1, sky.low);
      c.fillStyle = g; c.fillRect(0, 0, w, h);
      if (sky.stars) {
        const r = rnd(9);
        for (let i = 0; i < 220; i++) { c.globalAlpha = 0.4 + r() * 0.6; c.fillStyle = "#fff"; c.beginPath(); c.arc(r() * w, r() * h * 0.75, r() * 1.4 + 0.3, 0, 7); c.fill(); }
        c.globalAlpha = 1;
        const mg = c.createRadialGradient(w * 0.7, h * 0.2, 0, w * 0.7, h * 0.2, 60); mg.addColorStop(0, "rgba(243,236,208,.5)"); mg.addColorStop(1, "rgba(243,236,208,0)");
        c.fillStyle = mg; c.fillRect(0, 0, w, h);
        c.fillStyle = sky.sun; c.beginPath(); c.arc(w * 0.7, h * 0.2, 16, 0, 7); c.fill();
      } else {
        const sg = c.createRadialGradient(w * 0.68, h * 0.3, 4, w * 0.68, h * 0.3, 140);
        sg.addColorStop(0, sky.sun); sg.addColorStop(0.15, sky.sun); sg.addColorStop(1, "rgba(255,255,255,0)");
        c.fillStyle = sg; c.fillRect(0, 0, w, h);
        const r = rnd(4); c.fillStyle = "rgba(255,255,255,.35)";
        for (let i = 0; i < 7; i++) { const x = r() * w, y = h * (0.15 + r() * 0.35); for (let k = 0; k < 5; k++) { c.beginPath(); c.ellipse(x + k * 22, y + Math.sin(k) * 4, 40, 9, 0, 0, 7); c.fill(); } }
      }
    });
  }

  // ---------- نقش‌برجسته‌ها: روی سنگ، با سایه‌ی تراش ----------
  function relief(c, path, x, y, s, flip, light, shadow) {
    c.save(); c.translate(x, y); c.scale(flip ? -s : s, s);
    c.fillStyle = shadow; c.translate(1.6, 1.6); c.fill(path); c.translate(-1.6, -1.6);
    c.fillStyle = light; c.fill(path);
    c.restore();
  }
  // سرباز جاویدان از نیم‌رخ (کلاه شیاردار، ریش، ردای بلند، نیزه و ترکش)
  const GUARD = "M-6 -96 L6 -96 L7 -84 L8 -78 C12 -77 13 -72 11 -69 L12 -66 L9 -64 C9 -60 6 -58 2 -58 L4 -52 C14 -50 18 -44 18 -34 L16 -10 L20 0 L-16 0 L-12 -10 L-14 -34 C-14 -46 -10 -50 -4 -52 L-6 -60 C-10 -62 -11 -68 -9 -74 Z M18 -112 L21 -112 L21 2 L18 2 Z";
  const BEARER = "M-6 -92 L6 -92 L7 -80 C12 -79 12 -72 10 -70 L11 -66 C9 -60 6 -58 2 -58 L4 -52 C12 -50 14 -46 14 -40 L26 -46 L30 -40 L16 -30 L14 -10 L18 0 L-16 0 L-12 -10 L-14 -34 C-14 -46 -10 -50 -4 -52 L-6 -60 C-10 -62 -11 -68 -9 -74 Z M24 -66 C34 -66 36 -52 32 -46 L22 -46 C18 -52 18 -66 24 -66 Z";
  const RAM = "M-30 -30 C-30 -44 -10 -46 10 -44 C20 -54 34 -52 34 -40 C34 -34 30 -30 26 -30 L24 0 L18 0 L16 -22 L-14 -22 L-16 0 L-22 0 L-24 -24 C-28 -24 -30 -26 -30 -30 Z M22 -50 C14 -60 30 -66 34 -56 C36 -50 30 -46 26 -48 Z";
  const LION = "M-44 -30 C-44 -42 -30 -44 -10 -42 L10 -44 C14 -58 34 -60 40 -46 C44 -40 42 -32 36 -30 L34 0 L28 0 L26 -20 L-20 -22 L-24 0 L-30 0 L-32 -22 C-40 -20 -50 -26 -56 -34 L-52 -36 C-48 -32 -46 -30 -44 -30 Z";
  const BULL = "M-40 -34 C-40 -44 -20 -48 0 -46 L18 -46 C22 -54 36 -54 40 -44 L44 -36 L36 -32 L34 0 L28 0 L26 -22 L-20 -24 L-22 0 L-28 0 L-30 -26 C-36 -26 -40 -30 -40 -34 Z M34 -52 L28 -64 L36 -54 Z M40 -52 L46 -62 L42 -50 Z";
  function reliefCanvas(kind) {
    return cv(1024, 256, (c, w, h) => {
      c.drawImage(stoneCanvas(STONE, 31), 0, 0, 512, 256); c.drawImage(stoneCanvas(STONE, 32), 512, 0, 512, 256);
      // نوار گل‌های دوازده‌پر بالا و پایین
      const band = (y) => { c.fillStyle = "rgba(60,45,30,.25)"; c.fillRect(0, y, w, 26); for (let x = 13; x < w; x += 26) rosette(c, x, y + 13, 10, "#d8c9a8", "rgba(60,45,30,.55)"); };
      band(0); band(h - 26);
      const L = "#ddd0b2", S = "rgba(55,40,28,.75)";
      if (kind === "guards") for (let x = 40; x < w; x += 58) relief(c, new Path2D(GUARD), x, h - 34, 1.35, false, L, S);
      else if (kind === "delegates") {
        let i = 0;
        for (let x = 50; x < w; x += i % 3 === 2 ? 110 : 62, i++) relief(c, new Path2D(i % 3 === 2 ? RAM : BEARER), x, h - 34, i % 3 === 2 ? 1.1 : 1.3, false, L, S);
        c.fillStyle = S; for (let x = 0; x < w; x += 200) { c.fillRect(x + 4, 30, 6, h - 64); }
      } else if (kind === "lionbull") {
        for (let x = 0; x < w; x += 256) {
          relief(c, new Path2D(BULL), x + 150, h - 40, 1.6, true, L, S);
          relief(c, new Path2D(LION), x + 110, h - 96, 1.25, false, L, S);
          c.fillStyle = S; c.beginPath(); c.moveTo(x, h - 26); c.lineTo(x + 6, h - 26); c.lineTo(x + 6, 26); c.fill();
        }
      } else if (kind === "servants") {
        for (let x = 40; x < w; x += 64) relief(c, new Path2D(BEARER), x, h - 34 - ((x / 64) % 2) * 0, 1.3, false, L, S);
      } else if (kind === "cuneiform") {
        c.fillStyle = "rgba(55,40,28,.7)";
        const r = rnd(8);
        for (let y = 40; y < h - 34; y += 14) for (let x = 14; x < w - 14; x += 8 + r() * 6) {
          const k = r();
          if (k < 0.5) { c.beginPath(); c.moveTo(x, y - 5); c.lineTo(x + 5, y - 5); c.lineTo(x + 2.5, y - 1); c.fill(); c.fillRect(x + 2, y - 2, 1, 7); }
          else if (k < 0.8) { c.beginPath(); c.moveTo(x, y); c.lineTo(x + 4, y - 3); c.lineTo(x + 4, y + 3); c.fill(); c.fillRect(x + 3, y - 0.5, 5, 1); }
          else x += 6;
        }
      }
    });
  }
  function rosette(c, x, y, r, fill, line) {
    c.save(); c.translate(x, y);
    c.fillStyle = fill; c.strokeStyle = line; c.lineWidth = 1;
    for (let i = 0; i < 12; i++) { c.rotate(Math.PI / 6); c.beginPath(); c.ellipse(0, -r * 0.55, r * 0.16, r * 0.45, 0, 0, 7); c.fill(); c.stroke(); }
    c.beginPath(); c.arc(0, 0, r * 0.25, 0, 7); c.fill(); c.stroke();
    c.restore();
  }
  // آجر لعابی شوش: کمانداران و شیرها روی زمینه‌ی فیروزه‌ای
  function glazeCanvas(kind) {
    return cv(1024, 256, (c, w, h) => {
      c.fillStyle = "#2f7f8f"; c.fillRect(0, 0, w, h);
      c.strokeStyle = "rgba(20,40,50,.45)"; c.lineWidth = 1.5;
      for (let y = 0; y < h; y += 16) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); for (let x = (y / 16) % 2 ? 0 : 16; x < w; x += 32) { c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + 16); c.stroke(); } }
      // نوار بالا و پایین
      for (const y of [0, h - 22]) { c.fillStyle = "#e8d6a0"; c.fillRect(0, y, w, 22); for (let x = 11; x < w; x += 22) rosette(c, x, y + 11, 9, "#2f7f8f", "#1d4a5a"); }
      if (kind === "archers") {
        for (let x = 40; x < w; x += 64) {
          c.save(); c.translate(x, h - 26); c.scale(1.6, 1.6);
          c.fillStyle = "#6b3a1e"; c.beginPath(); c.arc(4, -82, 7, 0, 7); c.fill(); // چهره
          c.fillStyle = "#2a1a10"; c.fillRect(-4, -92, 10, 6); c.fillRect(2, -78, 6, 8); // موی و ریش
          const robe = (x / 64) % 2 ? "#f0dca0" : "#efe6d6";
          c.fillStyle = robe; c.beginPath(); c.moveTo(-8, -72); c.lineTo(10, -72); c.lineTo(14, 0); c.lineTo(-12, 0); c.fill();
          c.fillStyle = "#c98a2a"; for (let k = -66; k < -4; k += 10) { c.beginPath(); c.arc(1, k, 2, 0, 7); c.fill(); }
          c.strokeStyle = "#e9c46a"; c.lineWidth = 2.5; c.beginPath(); c.moveTo(16, -100); c.lineTo(16, 2); c.stroke();
          c.strokeStyle = "#5a3a1a"; c.lineWidth = 2; c.beginPath(); c.arc(-8, -60, 16, -1.2, 1.4); c.stroke();
          c.fillStyle = "#a8642a"; c.fillRect(-12, -76, 6, 30);
          c.restore();
        }
      } else {
        for (let x = 0; x < w; x += 256) {
          c.save(); c.translate(x + 128, h - 30); c.scale(2, 2);
          c.fillStyle = "#e7b94a"; c.fill(new Path2D(LION));
          c.strokeStyle = "#8a5a1a"; c.lineWidth = 1; c.stroke(new Path2D(LION));
          c.fillStyle = "#c98a2a"; c.beginPath(); c.ellipse(26, -46, 12, 14, 0, 0, 7); c.fill();
          c.restore();
        }
      }
    });
  }
  // نشان شاهین بالدار و نقش‌برجسته‌ی بالای آرامگاه
  function wingedDisc(c, x, y, s, col) {
    c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = col;
    for (const d of [-1, 1]) { c.beginPath(); c.moveTo(0, -4); for (let i = 0; i < 6; i++) { c.lineTo(d * (14 + i * 9), -12 + i * 3); c.lineTo(d * (16 + i * 9), -4 + i * 2); } c.lineTo(0, 6); c.fill(); }
    c.beginPath(); c.arc(0, 0, 8, 0, 7); c.fill();
    c.fillStyle = "rgba(0,0,0,.25)"; c.beginPath(); c.arc(0, 0, 5, 0, 7); c.fill();
    c.restore();
  }
  function throneCanvas() {
    return cv(512, 256, (c, w, h) => {
      c.drawImage(rockCanvas("#b89a78", 41), 0, 0, w, h);
      c.fillStyle = "rgba(255,240,215,.18)"; c.fillRect(30, 20, w - 60, h - 40);
      const L = "#cbb08a", S = "rgba(40,28,18,.75)";
      // سکوی تخت و تخت‌بران
      c.fillStyle = S; c.fillRect(60, 118, 392, 10); c.fillRect(60, 196, 392, 10);
      for (let x = 80; x < 440; x += 26) { relief(c, new Path2D(GUARD), x, 196, 0.62, false, L, S); relief(c, new Path2D(GUARD), x + 8, 118, 0.0001, false, L, S); }
      for (let x = 74; x < 440; x += 22) { c.fillStyle = S; c.fillRect(x, 130, 3, 62); }
      // شاه کنار آتشدان
      relief(c, new Path2D(GUARD), 210, 116, 0.82, false, L, S);
      c.fillStyle = S; c.fillRect(296, 70, 18, 46); c.fillRect(290, 66, 30, 6); c.fillRect(288, 112, 34, 6);
      c.fillStyle = "#e0a04a"; c.beginPath(); c.moveTo(298, 64); c.quadraticCurveTo(305, 40, 312, 64); c.fill();
      wingedDisc(c, 256, 46, 1, L);
    });
  }
  function bannerCanvas() {
    return cv(128, 128, (c, w, h) => {
      c.fillStyle = "#8e2430"; c.fillRect(0, 0, w, h);
      c.strokeStyle = "#e3b24f"; c.lineWidth = 8; c.strokeRect(4, 4, w - 8, h - 8);
      c.lineWidth = 2; c.strokeRect(14, 14, w - 28, h - 28);
      wingedDisc(c, w / 2, h / 2, 1.05, "#e3b24f");
    });
  }
  function featherCanvas() {
    return cv(128, 128, (c, w, h) => {
      c.fillStyle = STONE; c.fillRect(0, 0, w, h);
      c.strokeStyle = "rgba(70,55,40,.6)"; c.lineWidth = 2;
      for (let y = 6; y < h; y += 12) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); }
      for (let x = 6; x < w; x += 10) { c.globalAlpha = 0.35; c.beginPath(); c.moveTo(x, 0); c.lineTo(x, h); c.stroke(); }
      c.globalAlpha = 1;
    });
  }
  function soldierCanvas(robe) {
    return cv(64, 160, (c) => {
      c.translate(30, 156);
      c.fillStyle = "#e9d27a"; c.fillRect(-6, -150, 12, 16); // کلاه
      c.fillStyle = "#7a4a2a"; c.beginPath(); c.arc(1, -128, 7, 0, 7); c.fill();
      c.fillStyle = "#2a1a10"; c.fillRect(1, -124, 7, 10);
      c.fillStyle = robe; c.beginPath(); c.moveTo(-10, -116); c.lineTo(12, -116); c.lineTo(16, 0); c.lineTo(-14, 0); c.fill();
      c.fillStyle = "rgba(255,230,150,.7)"; for (let y = -110; y < -6; y += 12) for (let x = -8; x < 12; x += 8) { c.beginPath(); c.arc(x, y, 1.6, 0, 7); c.fill(); }
      c.fillStyle = "#6b4a2a"; c.fillRect(-16, -110, 7, 40); // ترکش
      c.strokeStyle = "#d9c07a"; c.lineWidth = 3; c.beginPath(); c.moveTo(20, -156); c.lineTo(20, 0); c.stroke();
      c.fillStyle = "#e3b24f"; c.beginPath(); c.arc(20, -2, 4, 0, 7); c.fill();
      c.fillStyle = "#3a2a1a"; c.fillRect(-12, -4, 10, 4); c.fillRect(4, -4, 10, 4);
    });
  }
  function flameCanvas() {
    return cv(64, 128, (c, w, h) => {
      const g = c.createLinearGradient(0, h, 0, 0);
      g.addColorStop(0, "#b6413a"); g.addColorStop(0.45, "#f28a2e"); g.addColorStop(0.8, "#f6d44a"); g.addColorStop(1, "rgba(246,212,74,0)");
      c.fillStyle = g;
      c.fill(new Path2D("M32 126C10 125 3 105 9 85C13 70 20 75 18 60C17 45 26 30 23 10C35 25 33 40 39 48C43 35 42 25 46 17C54 40 60 60 56 85C52 110 50 125 32 126Z"));
    });
  }
  function birdCanvas() {
    return cv(64, 32, (c) => { c.strokeStyle = "#3a2e24"; c.lineWidth = 3; c.lineCap = "round"; c.beginPath(); c.moveTo(4, 20); c.quadraticCurveTo(18, 4, 32, 18); c.quadraticCurveTo(46, 4, 60, 20); c.stroke(); });
  }
  function blobCanvas() {
    return cv(128, 64, (c, w, h) => { const g = c.createRadialGradient(w / 2, h / 2, 2, w / 2, h / 2, w / 2); g.addColorStop(0, "rgba(40,28,16,.4)"); g.addColorStop(1, "rgba(40,28,16,0)"); c.fillStyle = g; c.fillRect(0, 0, w, h); });
  }

  // ---------- بناها ----------
  // هر بنا: name، line (یک جمله درباره‌اش)، sky، ground، mt (کوه پشت)، build(B) و parts (اسم بخش‌ها اگر فرق دارد)
  const MONUMENTS = [
    { name: "صفه‌ی تخت جمشید", sky: "dawn", ground: "plain", mt: "rahmat", build: "terrace",
      line: "داریوش بزرگ فرمان داد پای کوه رحمت، صفه‌ای سنگی به بلندی دوازده متر بسازند تا پایتخت آیینی پارسیان بر آن بنا شود." },
    { name: "پلکان بزرگ ورودی", sky: "day", ground: "plain", mt: "rahmat", build: "grandStair",
      line: "پلکان دوطرفه‌ی ورودی چنان کم‌شیب است که می‌گویند اسب‌سواران هم می‌توانستند از آن بالا بروند." },
    { name: "دروازه‌ی ملل", sky: "day", ground: "plain", mt: "rahmat", build: "gate",
      line: "خشایارشا این دروازه را ساخت؛ گاوهای بالدار سنگی بر درگاهش نگهبان‌اند و فرستادگان همه‌ی سرزمین‌ها از آن می‌گذشتند." },
    { name: "خیابان سربازان", sky: "noon", ground: "dry", mt: "rahmat", build: "avenue",
      line: "از دروازه‌ی ملل، راهی میان دو دیوار بلند به سوی کاخ صدستون و دروازه‌ی ناتمام می‌رفت." },
    { name: "کاخ آپادانا", sky: "day", ground: "plain", mt: "rahmat", build: "apadana",
      line: "بزرگ‌ترین تالار تخت جمشید با ستون‌هایی به بلندی بیست متر؛ شاه فرستادگان سرزمین‌ها را این‌جا می‌پذیرفت." },
    { name: "پلکان شرقی آپادانا", sky: "dawn", ground: "plain", mt: "rahmat", build: "reliefStair",
      line: "روی این پلکان، فرستادگان بیست‌وسه سرزمین با هدیه‌هایشان و سربازان جاویدان به سنگ نقش بسته‌اند.",
      parts: ["زمین و کوه رحمت", "سکوی پلکان", "پله‌ها", "دیواره‌ها", "نقش فرستادگان", "جان گرفتن بنا"] },
    { name: "کاخ تچر", sky: "dusk", ground: "plain", mt: "rahmat", build: "tachara",
      line: "کاخ کوچک و براق داریوش که سنگ‌هایش را چنان صیقل داده بودند که آینه‌خانه‌اش می‌نامیدند." },
    { name: "تالار سه‌دری", sky: "day", ground: "green", mt: "rahmat", build: "tripylon",
      line: "تالار شورا در میانه‌ی کاخ‌ها؛ بزرگان پارس و ماد روی پلکانش دست در دست هم بالا می‌روند." },
    { name: "کاخ هدیش", sky: "dusk", ground: "plain", mt: "rahmat", build: "hadish",
      line: "کاخ خشایارشا بر بلندترین جای صفه، با دو پلکان که نقش خدمتگزاران با هدیه بر آن است." },
    { name: "کاخ صدستون", sky: "noon", ground: "plain", mt: "rahmat", build: "hundred",
      line: "تالار تخت شاهی با صد ستون؛ دو گاو سنگی بزرگ در ایوانش نگهبانی می‌دهند." },
    { name: "دروازه‌ی ناتمام", sky: "dusk", ground: "dry", mt: "rahmat", build: "unfinished",
      line: "دروازه‌ای که هیچ‌گاه تمام نشد؛ سنگ‌هایش هنوز جای تیشه‌ی سنگ‌تراشان را نشان می‌دهد." },
    { name: "آرامگاه اردشیر", sky: "dawn", ground: "dry", mt: "cliff", build: "rockTomb",
      line: "آرامگاه شاهان پسین هخامنشی در دل کوه رحمت، با نمای چلیپایی و نقش شاه در برابر آتشدان.",
      parts: ["زمین و دامنه", "دل کوه", "درگاه آرامگاه", "ستون‌های سنگی", "نقش تخت‌بران", "جان گرفتن بنا"] },
    { name: "نقش رستم", sky: "day", ground: "dry", mt: "cliff", build: "naqsh",
      line: "آرامگاه داریوش و خشایارشا در دل صخره‌ی نقش رستم، و برج سنگی کعبه‌ی زرتشت روبه‌رویشان.",
      parts: ["زمین و دامنه", "دل صخره", "آرامگاه‌ها", "برج سنگی", "نقش‌ها و پلکان", "جان گرفتن بنا"] },
    { name: "آرامگاه کوروش", sky: "day", ground: "green", mt: "far", build: "cyrus",
      line: "در دشت پاسارگاد، کوروش بزرگ بر سکویی شش‌پله آرمیده است؛ ساده و استوار.",
      parts: ["دشت مرغاب", "پله‌ی نخست", "پله‌های میانی", "پله‌های بالا", "خانه‌ی آرامگاه", "جان گرفتن بنا"] },
    { name: "باغ پاسارگاد", sky: "noon", ground: "green", mt: "far", build: "garden",
      line: "نخستین چهارباغ ایرانی: جوی‌های سنگی، حوضچه‌ها و ردیف سروها جلوی کاخ کوروش.",
      parts: ["دشت مرغاب", "جوی‌های سنگی", "پایه‌ی ستون‌ها", "ستون‌های کاخ", "بام و ایوان", "جان گرفتن باغ"] },
    { name: "کاخ آپادانای شوش", sky: "day", ground: "green", mt: "far", build: "susa",
      line: "کاخ زمستانی داریوش در شوش، با آجرهای لعابی که کمانداران جاویدان و شیرها را رنگارنگ نشان می‌دهند." },
    { name: "کتیبه‌ی بیستون", sky: "dawn", ground: "green", mt: "cliff", build: "bisotun",
      line: "داریوش داستان پادشاهی‌اش را به سه زبان بر صخره‌ی بیستون نوشت، بالای راه کهن همدان به بابل.",
      parts: ["زمین و دامنه", "دیواره‌ی صخره", "سکوی نقش", "کتیبه‌ها", "نقش داریوش", "جان گرفتن بنا"] },
    { name: "گنج‌نامه", sky: "day", ground: "green", mt: "cliff", build: "ganjnameh",
      line: "دو کتیبه‌ی داریوش و خشایارشا بر صخره‌ای در دامنه‌ی الوند، کنار آبشار؛ مردم آن را نقشه‌ی گنج می‌پنداشتند.",
      parts: ["زمین و دامنه", "صخره", "قاب کتیبه‌ها", "خط میخی", "آبشار", "جان گرفتن بنا"] },
    { name: "جشن نوروز", sky: "night", ground: "plain", mt: "rahmat", build: "nowruz",
      line: "در جشن نوروز، فرستادگان از همه‌جا می‌آمدند و تخت جمشید با مشعل‌ها و درفش‌ها روشن می‌شد." },
  ];

  const monumentNo = (level) => Math.floor(level / PARTS.length) % MONUMENTS.length;
  const monumentOf = (level) => MONUMENTS[monumentNo(level)];
  const partName = (m, i) => (m.parts || PARTS)[i];

  // ---------- ساخت صحنه ----------
  function mount(el, opts) {
    const THREE = window.THREE;
    if (THREE.ColorManagement) THREE.ColorManagement.legacyMode = false;
    const mon = monumentOf(opts.level);
    const count = opts.count, fresh = opts.fresh;
    const calmNow = typeof calm === "function" && calm();
    const sky = SKY[mon.sky];

    const W = el.clientWidth || 320, H = el.clientHeight || Math.round(W * 0.62);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(W, H);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.className = "prs-canvas";
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(new THREE.Color(sky.haze), 26, 52);
    const camera = new THREE.PerspectiveCamera(30, W / H, 0.1, 120);
    const target = new THREE.Vector3(0, 2.2, -1.2);
    scene.add(new THREE.HemisphereLight(sky.light, 0x6b5a46, sky.amb));
    const sun = new THREE.DirectionalLight(sky.light, mon.sky === "night" ? 0.55 : 0.95);
    sun.position.set(-7, 11, 8);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    Object.assign(sun.shadow.camera, { left: -13, right: 13, top: 10, bottom: -8, near: 1, far: 40 });
    sun.shadow.bias = -0.0008;
    scene.add(sun);

    const disposables = [];
    const keep = (o) => { disposables.push(o); return o; };
    const tex = (canvas, rep) => {
      const t = new THREE.CanvasTexture(canvas);
      t.encoding = THREE.sRGBEncoding;
      t.anisotropy = 4;
      if (rep !== false) { t.wrapS = t.wrapT = THREE.RepeatWrapping; if (rep) t.repeat.set(rep[0], rep[1]); }
      return keep(t);
    };
    const lam = (o) => keep(new THREE.MeshLambertMaterial(o));
    const MAT = {
      stone: lam({ map: tex(stoneCanvas(STONE, 1)) }),
      stone2: lam({ map: tex(stoneCanvas(STONE2, 2)) }),
      dark: keep(new THREE.MeshPhongMaterial({ map: tex(stoneCanvas("#55504a", 3, true)), shininess: 60, specular: 0x555555 })),
      ashlar: lam({ map: tex(ashlarCanvas()) }),
      plaster: lam({ map: tex(plasterCanvas("#d8b98a")) }),
      red: lam({ map: tex(plasterCanvas("#a8452e")) }),
      wood: lam({ color: 0x6e4428 }),
      gold: keep(new THREE.MeshPhongMaterial({ color: 0xd9a63e, shininess: 90, specular: 0xffe7a0 })),
      rock: lam({ map: tex(rockCanvas("#a88c6c", 5)) }),
      green: lam({ color: 0x3f5f3a }),
      green2: lam({ color: 0x55743e }),
      trunk: lam({ color: 0x5a3e28 }),
      feather: lam({ map: tex(featherCanvas()), side: THREE.DoubleSide }),
      water: keep(new THREE.MeshPhongMaterial({ color: 0x6f9fb8, specular: 0xffffff, shininess: 100, transparent: true, opacity: 0.9 })),
    };
    const reliefMats = {};
    const reliefMat = (kind) => reliefMats[kind] || (reliefMats[kind] = lam({ map: tex(kind === "throne" ? throneCanvas() : kind.startsWith("glaze") ? glazeCanvas(kind.slice(6)) : reliefCanvas(kind)) }));

    // ---------- هندسه: همه‌ی تکه‌های یک بخش با یک ماده در یک mesh ادغام می‌شوند (سبک برای گوشی) ----------
    const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
    const mtx = (p = [0, 0, 0], r = [0, 0, 0], s = [1, 1, 1]) => new THREE.Matrix4().compose(V3(...p), new THREE.Quaternion().setFromEuler(new THREE.Euler(r[0], r[1], r[2])), V3(...s));
    // UV به اندازه‌ی واقعی، تا بافت سنگ روی تکه‌ی بزرگ و کوچک یک‌اندازه بماند
    function boxGeo(w, h, d, k = 0.45) {
      const g = new THREE.BoxGeometry(w, h, d);
      const uv = g.attributes.uv, dims = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
      for (let f = 0; f < 6; f++) for (let i = 0; i < 4; i++) { const j = f * 4 + i; uv.setXY(j, uv.getX(j) * dims[f][0] * k, uv.getY(j) * dims[f][1] * k); }
      return g;
    }
    function scaleUV(g, su, sv) { const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * su, uv.getY(i) * sv); return g; }
    const parts = PARTS.map(() => ({ geos: {}, objs: [] }));
    function put(p, mk, geo, m) {
      let g = geo.index ? geo.toNonIndexed() : geo.clone();
      if (m) g.applyMatrix4(m);
      (parts[p].geos[mk] || (parts[p].geos[mk] = [])).push(g);
    }
    const obj = (p, o) => { parts[p].objs.push(o); return o; };
    function merge(list) {
      let n = 0; list.forEach((g) => (n += g.attributes.position.count));
      const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), uv = new Float32Array(n * 2);
      let o = 0;
      list.forEach((g) => {
        if (!g.attributes.normal) g.computeVertexNormals();
        pos.set(g.attributes.position.array, o * 3); nor.set(g.attributes.normal.array, o * 3);
        if (g.attributes.uv) uv.set(g.attributes.uv.array, o * 2);
        o += g.attributes.position.count;
        g.dispose();
      });
      const out = new THREE.BufferGeometry();
      out.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      out.setAttribute("normal", new THREE.BufferAttribute(nor, 3));
      out.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
      return keep(out);
    }

    // ---------- اجزای معماری ----------
    const box = (p, mk, w, h, d, x, y, z, ry = 0) => put(p, mk, boxGeo(w, h, d), mtx([x, y + h / 2, z], [0, ry, 0]));
    // کنگره‌ی پله‌ای پارسی
    const merlonShape = (() => { const s = new THREE.Shape(); const st = [[-0.5, 0], [0.5, 0], [0.5, 0.3], [0.33, 0.3], [0.33, 0.58], [0.16, 0.58], [0.16, 0.86], [-0.16, 0.86], [-0.16, 0.58], [-0.33, 0.58], [-0.33, 0.3], [-0.5, 0.3]]; s.moveTo(...st[0]); st.slice(1).forEach((q) => s.lineTo(...q)); return s; })();
    const merlonGeo = scaleUV(new THREE.ExtrudeGeometry(merlonShape, { depth: 0.16, bevelEnabled: false }), 0.5, 0.5);
    // ردیف کنگره از (x0,z0) تا (x1,z1) روی ارتفاع y
    function merlons(p, mk, x0, z0, x1, z1, y, s = 0.42) {
      const L = Math.hypot(x1 - x0, z1 - z0), n = Math.max(1, Math.round(L / (s * 1.08))), a = Math.atan2(-(z1 - z0), x1 - x0);
      for (let i = 0; i < n; i++) { const t = (i + 0.5) / n; put(p, mk, merlonGeo, mtx([x0 + (x1 - x0) * t, y, z0 + (z1 - z0) * t], [0, a, 0], [s, s, s])); }
    }
    // ستون: پایه‌ی زنگی، بدنه‌ی شیاردار، سرستون (گل نیلوفر، طومار و جانوران دوسر)
    const lotusBase = (() => { const pts = []; for (let i = 0; i <= 10; i++) { const t = i / 10; pts.push(new THREE.Vector2(0.62 - 0.36 * Math.pow(t, 0.7) + Math.sin(t * Math.PI * 5) * 0.015, t * 0.55)); } pts.push(new THREE.Vector2(0.25, 0.62)); return new THREE.LatheGeometry(pts, 18); })();
    const torus = new THREE.TorusGeometry(0.27, 0.06, 6, 18);
    const bellGeo = (() => { const pts = []; for (let i = 0; i <= 10; i++) { const t = i / 10; pts.push(new THREE.Vector2(0.22 + 0.22 * Math.pow(t, 1.6) + Math.sin(t * Math.PI * 6) * 0.012, t * 0.7)); } return new THREE.LatheGeometry(pts, 18); })();
    function flutedShaft(r, h, segs = 32, flutes = 16) {
      const g = new THREE.CylinderGeometry(r, r * 1.05, h, segs, 1, true);
      const p = g.attributes.position;
      for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i), a = Math.atan2(z, x), rr = Math.hypot(x, z), k = 1 - 0.07 * Math.pow(Math.abs(Math.cos((a * flutes) / 2)), 3); p.setXYZ(i, (x / rr) * rr * k, p.getY(i), (z / rr) * rr * k); }
      g.computeVertexNormals();
      return scaleUV(g, 1, h * 0.4);
    }
    const shaftCache = {};
    // جانور سرستون (گاو، شیر یا هما) رو به +x، از مرکز سرستون
    function protome(p, mk, kind, x, y, z, s, dir, ry) {
      const R = (dx, dy, dz) => { const c = Math.cos(ry), sn = Math.sin(ry); const X = dx * dir; return [x + X * c + dz * sn, y + dy, z - X * sn + dz * c]; };
      const B = (w, h, d, dx, dy, dz, rz = 0) => put(p, mk, boxGeo(w * s, h * s, d * s), mtx(R(dx * s, dy * s, dz * s), [0, ry, rz * dir]));
      B(0.5, 0.36, 0.34, 0.33, 0.18, 0); // تنه
      B(0.18, 0.3, 0.1, 0.45, -0.07, 0.09); B(0.18, 0.3, 0.1, 0.45, -0.07, -0.09); // دست‌های تاشده
      if (kind === "lion") { put(p, mk, new THREE.SphereGeometry(0.22 * s, 10, 8), mtx(R(0.66 * s, 0.38 * s, 0))); B(0.16, 0.14, 0.18, 0.84, 0.32, 0); }
      else if (kind === "homa") { B(0.26, 0.24, 0.22, 0.66, 0.42, 0); put(p, mk, new THREE.ConeGeometry(0.08 * s, 0.24 * s, 6), mtx(R(0.86 * s, 0.38 * s, 0), [0, ry, -Math.PI / 2 * dir])); B(0.06, 0.3, 0.2, 0.58, 0.66, 0, -0.3); }
      else {
        B(0.3, 0.26, 0.24, 0.66, 0.4, 0); B(0.14, 0.12, 0.16, 0.84, 0.32, 0);
        for (const sd of [-1, 1]) put(p, mk, new THREE.ConeGeometry(0.035 * s, 0.24 * s, 5), mtx(R(0.64 * s, 0.6 * s, sd * 0.1 * s), [sd * 0.5, ry, -0.4 * dir]));
        B(0.1, 0.1, 0.32, 0.6, 0.5, 0); // گوش‌ها
      }
    }
    // ستون کامل؛ بخش‌ها: پایه pb، بدنه ps، سرستون pc. H بلندی تا زیر سرستون. برمی‌گرداند بلندی بالای سرستون
    function column(x, y, z, H, cap = "bull", { pb = 2, ps = 3, pc = 4, r = 0.24, ry = 0, tall = true } = {}) {
      put(pb, "stone2", boxGeo(1.0 * r * 4.2, 0.12, 1.0 * r * 4.2), mtx([x, y + 0.06, z]));
      put(pb, "stone", lotusBase, mtx([x, y + 0.12, z], [0, 0, 0], [r * 4, r * 4, r * 4]));
      put(pb, "stone", torus, mtx([x, y + 0.12 + 0.6 * r * 4, z], [Math.PI / 2, 0, 0], [r * 4, r * 4, r * 4]));
      const by = y + 0.12 + 0.66 * r * 4, sh = H - (by - y);
      const key = r.toFixed(2) + "/" + sh.toFixed(2);
      put(ps, "stone", shaftCache[key] || (shaftCache[key] = flutedShaft(r, sh)), mtx([x, by + sh / 2, z]));
      let top = y + H;
      if (cap === "simple") { put(pc, "stone", bellGeo, mtx([x, top, z], [0, 0, 0], [r * 3.4, r * 2, r * 3.4])); top += 0.3; box(pc, "stone", r * 5, 0.2, r * 5, x, top, z); return top + 0.2; }
      if (tall) {
        put(pc, "stone", bellGeo, mtx([x, top, z], [0, 0, 0], [r * 3.6, r * 3, r * 3.6]));
        top += 0.7 * r * 3;
        // طومارهای عمودی
        box(pc, "stone", r * 2.4, r * 4, r * 1.6, x, top, z, ry);
        for (const sd of [-1, 1]) { const c = Math.cos(ry), sn = Math.sin(ry); const dx = sd * r * 1.3; put(pc, "stone", new THREE.CylinderGeometry(r * 0.45, r * 0.45, r * 1.7, 10), mtx([x + dx * c, top + r * 0.5, z - dx * sn], [Math.PI / 2, ry, 0])); put(pc, "stone", new THREE.CylinderGeometry(r * 0.45, r * 0.45, r * 1.7, 10), mtx([x + dx * c, top + r * 3.5, z - dx * sn], [Math.PI / 2, ry, 0])); }
        top += r * 4;
      }
      const s = r * 4.2;
      for (const d of [-1, 1]) protome(pc, "stone", cap, x, top, z, s, d, ry);
      box(pc, "stone2", s * 0.32, s * 0.28, s * 0.4, x, top + s * 0.04, z, ry); // زین وسط که تیر روی آن می‌نشیند
      return top + s * 0.36;
    }
    // تیرهای سقف و بام صاف با کنگره
    function roof(p, x, z, w, d, y, { merl = true, mk = "plaster", eave = 0.25 } = {}) {
      const n = Math.max(2, Math.round(w / 0.9));
      for (let i = 0; i <= n; i++) box(p, "wood", 0.14, 0.14, d + 0.2, x - w / 2 + (w * i) / n, y, z);
      box(p, mk, w + eave * 2, 0.26, d + eave * 2, x, y + 0.14, z);
      box(p, "red", w + eave * 2 + 0.04, 0.08, d + eave * 2 + 0.04, x, y + 0.4, z);
      if (merl) {
        const yy = y + 0.48, hw = w / 2 + eave, hd = d / 2 + eave;
        merlons(p, "stone", x - hw, z + hd, x + hw, z + hd, yy, 0.38);
        merlons(p, "stone", x - hw, z - hd, x - hw, z + hd, yy, 0.38);
        merlons(p, "stone", x + hw, z + hd, x + hw, z - hd, yy, 0.38);
      }
    }
    // درگاه سنگی سیاه با قرنیز گلویی (بخش p) روی دیوار
    function doorFrame(p, x, y, z, w, h, ry = 0, mk = "dark", t = 0.42) {
      const c = Math.cos(ry), sn = Math.sin(ry);
      const P = (dx, dy) => [x + dx * c, y + dy, z - dx * sn];
      for (const sd of [-1, 1]) put(p, mk, boxGeo(0.22, h, t), mtx(P(sd * (w / 2 + 0.11), h / 2), [0, ry, 0]));
      put(p, mk, boxGeo(w + 0.44, 0.22, t), mtx(P(0, h + 0.11), [0, ry, 0]));
      put(p, mk, boxGeo(w + 0.7, 0.14, t + 0.12), mtx(P(0, h + 0.3), [0, ry, 0]));
      put(p, mk, boxGeo(w + 0.9, 0.08, t + 0.2), mtx(P(0, h + 0.41), [0, ry, 0]));
    }
    // دیوار خشتی با درگاه‌ها: از x0 تا x1 روی z، بلندی h؛ doors آرایه‌ی [x, w, hh]
    function wall(p, x0, x1, z, y, h, t = 0.4, doors = [], mk = "plaster", pd = 2) {
      const ds = doors.slice().sort((a, b) => a[0] - b[0]);
      let cur = x0;
      ds.forEach(([dx, dw, dh]) => {
        const a = dx - dw / 2 - 0.22, b = dx + dw / 2 + 0.22;
        if (a > cur) box(p, mk, a - cur, h, t, (cur + a) / 2, y, z);
        box(p, mk, b - a, h - dh - 0.5, t, dx, y + dh + 0.5, z);
        doorFrame(pd, dx, y, z, dw, dh, 0, "dark", t + 0.06);
        cur = b;
      });
      if (x1 > cur) box(p, mk, x1 - cur, h, t, (cur + x1) / 2, y, z);
    }
    function wallZ(p, z0, z1, x, y, h, t = 0.4, mk = "plaster") { put(p, mk, boxGeo(t, h, z1 - z0), mtx([x, y + h / 2, (z0 + z1) / 2])); }
    // پلکان رو به جلو (+z): پهنای w، از بلندی 0 تا h، پایین پله در z0
    function stairs(p, x, z0, w, h, run, y0 = 0, mk = "stone") {
      const n = Math.max(4, Math.round(h / 0.11));
      for (let i = 0; i < n; i++) { const hh = (h * (i + 1)) / n; box(p, mk, w, hh, run / n, x, y0, z0 - (run * (i + 0.5)) / n); }
    }
    // جان‌پناه کنار پلکان با نقش‌برجسته
    function parapet(p, x, z0, run, h, y0, side, kind) {
      const L = Math.hypot(run, h), a = Math.atan2(h, run);
      put(p, "stone", boxGeo(0.3, 0.45, L), mtx([x, y0 + h / 2 + 0.3, z0 - run / 2], [a, 0, 0]));
      if (kind) {
        const g = new THREE.PlaneGeometry(L, 0.42);
        put(4, "rel:" + kind, g, mtx([x + side * 0.16, y0 + h / 2 + 0.3, z0 - run / 2], [0, side * Math.PI / 2, 0]).multiply(new THREE.Matrix4().makeRotationZ(side * a)));
      }
    }
    // صفه‌ی سنگی با دیواره‌ی سنگ‌چین
    function terrace(p, x, z, w, d, h) {
      box(p, "ashlar", w, h - 0.06, d, x, 0, z);
      box(p, "stone2", w + 0.06, 0.06, d + 0.06, x, h - 0.06, z);
    }
    // نقش‌برجسته‌ی تخت روی نما
    function panel(p, kind, x, y, z, w, h, ry = 0, rep = 1) {
      const g = scaleUV(new THREE.PlaneGeometry(w, h), rep, 1);
      put(p, "rel:" + kind, g, mtx([x, y + h / 2, z], [0, ry, 0]));
    }
    // گاو بالدار (لاماسو): بدنه رو به +z؛ human=true سر آدم با تاج و ریش
    function lamassu(p, x, y, z, s, human, ry = 0) {
      const c = Math.cos(ry), sn = Math.sin(ry);
      const P = (dx, dy, dz) => [x + (dx * c + dz * sn) * s, y + dy * s, z + (-dx * sn + dz * c) * s];
      const B = (w, h, d, dx, dy, dz, mk = "stone", rx = 0) => put(p, mk, boxGeo(w * s, h * s, d * s, 0.3), mtx(P(dx, dy + h / 2, dz), [rx, ry, 0]));
      B(0.8, 0.9, 1.9, 0, 1.0, -0.2); // تنه
      B(0.86, 1.2, 0.5, 0, 0.9, 0.6); // سینه
      for (const sd of [-1, 1]) { B(0.26, 1.05, 0.28, sd * 0.24, 0, 0.66); B(0.24, 1.05, 0.28, sd * 0.24, 0, -0.95); B(0.22, 0.12, 0.34, sd * 0.24, 0, 0.72, "stone2"); }
      B(0.18, 0.7, 0.14, 0, 0.7, -1.2); // دم
      if (human) {
        B(0.52, 0.6, 0.5, 0, 2.05, 0.66); // صورت
        B(0.5, 0.62, 0.22, 0, 1.6, 0.95, "dark"); // ریش
        put(p, "stone2", new THREE.CylinderGeometry(0.3 * s, 0.27 * s, 0.6 * s, 14), mtx(P(0, 2.95, 0.66), [0, ry, 0]));
        put(p, "stone", new THREE.TorusGeometry(0.3 * s, 0.05 * s, 6, 16), mtx(P(0, 2.7, 0.66), [Math.PI / 2, 0, 0]));
      } else {
        B(0.5, 0.55, 0.7, 0, 1.85, 0.85);
        for (const sd of [-1, 1]) put(p, "stone", new THREE.ConeGeometry(0.06 * s, 0.5 * s, 6), mtx(P(sd * 0.3, 2.55, 0.8), [0, ry, -sd * 0.55]));
      }
      // بال‌ها: رو به بالا و عقب، با خط‌های پر
      const ws = new THREE.Shape(); ws.moveTo(0, 0); ws.bezierCurveTo(-0.3, 0.6, -0.6, 1.4, -1.9, 1.7); ws.lineTo(-1.6, 1.2); ws.lineTo(-1.8, 1.0); ws.lineTo(-1.4, 0.6); ws.lineTo(-1.5, 0.35); ws.lineTo(-0.9, 0.1); ws.closePath();
      const wg = scaleUV(new THREE.ExtrudeGeometry(ws, { depth: 0.08, bevelEnabled: false }), 0.5, 0.5);
      for (const sd of [-1, 1]) put(p, "feather", wg, mtx(P(sd * 0.44, 1.5, 0.5), [0, ry - Math.PI / 2, 0], [s, s, sd * s]));
    }
    // سرو و کاج
    function cypress(p, x, z, h = 2.2) { put(p, "trunk", new THREE.CylinderGeometry(0.06, 0.08, 0.4, 6), mtx([x, 0.2, z])); put(p, "green", new THREE.ConeGeometry(0.34 * h / 2.2, h, 8), mtx([x, 0.3 + h / 2, z])); put(p, "green", new THREE.SphereGeometry(0.33 * h / 2.2, 8, 6), mtx([x, 0.62, z], [0, 0, 0], [1, 1.4, 1])); }
    function pine(p, x, z, h = 1.6) { put(p, "trunk", new THREE.CylinderGeometry(0.07, 0.1, h * 0.5, 6), mtx([x, h * 0.25, z])); put(p, "green2", new THREE.SphereGeometry(h * 0.38, 9, 7), mtx([x, h * 0.75, z], [0, 0, 0], [1, 0.8, 1])); }
    // کوه پشت صحنه: لایه‌های دندانه‌دار سنگی
    function mountain(p, kind, seed) {
      const r = rnd(seed);
      const layer = (z, hMax, col, w) => {
        const sh = new THREE.Shape(); sh.moveTo(-w / 2, 0);
        const n = 22;
        for (let i = 0; i <= n; i++) { const t = i / n, x = -w / 2 + w * t; const env = kind === "far" ? 0.35 + 0.25 * Math.sin(t * Math.PI) : 0.45 + 0.55 * Math.sin(t * Math.PI * 0.9 + 0.2); sh.lineTo(x, hMax * env * (0.75 + r() * 0.35)); }
        sh.lineTo(w / 2, 0); sh.closePath();
        const g = scaleUV(new THREE.ExtrudeGeometry(sh, { depth: 1.2, bevelEnabled: false }), 0.06, 0.06);
        const m = new THREE.Mesh(keep(g), lam({ map: tex(rockCanvas(col, seed + z)), fog: true }));
        m.position.set(0, 0, z); m.receiveShadow = true;
        m.userData.noEdges = 1;
        return m;
      };
      const g = new THREE.Group();
      if (kind === "far") { g.add(layer(-13, 2.6, "#b7a7a0", 50)); g.add(layer(-10.5, 1.6, "#a39586", 44)); }
      else { g.add(layer(-13, 5.4, "#a08a78", 50)); g.add(layer(-10.4, 3.4, "#8e7660", 36)); }
      obj(p, g);
    }
    // صخره‌ی جلو برای آرامگاه‌ها و کتیبه‌ها: دیواره‌ی بلند با لبه‌ی ناهموار
    function cliff(p, x, z, w, h, d = 2.4, seed = 3) {
      const r = rnd(seed), sh = new THREE.Shape();
      sh.moveTo(-w / 2, 0);
      for (let i = 0; i <= 16; i++) { const t = i / 16; sh.lineTo(-w / 2 + w * t, h * (0.82 + 0.18 * Math.sin(t * Math.PI)) + (r() - 0.5) * 0.7); }
      sh.lineTo(w / 2, 0); sh.closePath();
      const g = scaleUV(new THREE.ExtrudeGeometry(sh, { depth: d, bevelEnabled: true, bevelSize: 0.25, bevelThickness: 0.3, bevelSegments: 2 }), 0.12, 0.12);
      put(p, "rock", g, mtx([x, 0, z - d - 0.3]));
    }
    // آتشدان سنگی
    function altar(p, x, z, y = 0) { box(p, "stone", 0.5, 0.18, 0.5, x, y, z); box(p, "stone", 0.32, 0.6, 0.32, x, y + 0.18, z); box(p, "stone", 0.6, 0.16, 0.6, x, y + 0.78, z); return y + 0.94; }

    // جان گرفتن: درفش، سرباز، پرنده، آتش، آب
    const life = [], marchers = [];
    let flameT = null;
    function flames(p, x, y, z, s = 1) {
      flameT = flameT || tex(flameCanvas(), false);
      const geo = keep(new THREE.PlaneGeometry(0.4 * s, 0.8 * s)); geo.translate(0, 0.4 * s, 0);
      const m = new THREE.Mesh(geo, keep(new THREE.MeshBasicMaterial({ map: flameT, transparent: true, depthWrite: false, side: THREE.DoubleSide })));
      m.position.set(x, y, z); m.userData.flame = Math.random() * 6; m.userData.noEdges = 1;
      const l = new THREE.PointLight(0xffb050, mon.sky === "night" ? 1.2 : 0.5, 4 * s); l.position.set(x, y + 0.5 * s, z + 0.2);
      const g = new THREE.Group(); g.add(m); g.add(l);
      obj(p, g); return g;
    }
    function banner(p, x, y, z, h = 2.2) {
      const g = new THREE.Group();
      const pole = new THREE.Mesh(keep(new THREE.CylinderGeometry(0.035, 0.035, h, 6)), MAT.wood); pole.position.y = h / 2; g.add(pole);
      const top = new THREE.Mesh(keep(new THREE.SphereGeometry(0.08, 8, 6)), MAT.gold); top.position.y = h + 0.05; g.add(top);
      const cg = keep(new THREE.PlaneGeometry(0.8, 0.8, 10, 4)); cg.translate(0.42, 0, 0);
      const cloth = new THREE.Mesh(cg, keep(new THREE.MeshLambertMaterial({ map: tex(bannerCanvas(), false), side: THREE.DoubleSide })));
      cloth.position.set(0.03, h - 0.45, 0); cloth.name = "cloth"; g.add(cloth);
      g.position.set(x, y, z);
      obj(p, g);
    }
    let soldierTex = null;
    function march(p, pts, n = 6, s = 0.75) {
      soldierTex = soldierTex || [tex(soldierCanvas("#6a3a7a"), false), tex(soldierCanvas("#b8862a"), false)];
      const curve = new THREE.CatmullRomCurve3(pts.map((q) => V3(...q)));
      for (let i = 0; i < n; i++) {
        const geo = keep(new THREE.PlaneGeometry(0.4 * s, 1.0 * s)); geo.translate(0, 0.5 * s, 0);
        const m = new THREE.Mesh(geo, keep(new THREE.MeshBasicMaterial({ map: soldierTex[i % 2], transparent: true, alphaTest: 0.2, side: THREE.DoubleSide })));
        m.userData = { curve, t: i / n, noEdges: 1 };
        obj(p, m); marchers.push(m);
      }
    }
    function birds(p, n = 4) {
      const bt = tex(birdCanvas(), false);
      for (let i = 0; i < n; i++) {
        const b = new THREE.Mesh(keep(new THREE.PlaneGeometry(0.5, 0.25)), keep(new THREE.MeshBasicMaterial({ map: bt, transparent: true, depthWrite: false })));
        b.position.set(-6 + i * 3, 6.2 + (i % 2) * 0.8, -4 - i * 0.4); b.userData.bird = i; b.userData.noEdges = 1;
        obj(p, b);
      }
    }
    function waterPlane(p, x, y, z, w, d) {
      const m = new THREE.Mesh(keep(new THREE.PlaneGeometry(w, d, 8, 2)), MAT.water);
      m.rotation.x = -Math.PI / 2; m.position.set(x, y, z); m.name = "water"; m.userData.noEdges = 1;
      obj(p, m); return m;
    }

    // ---------- بنا به بنا ----------
    const T = 1.1; // بلندی صفه
    const BUILD = {
      // صفه: سکوی بزرگ سنگی، پلکان، و جای کاخ‌ها
      terrace() {
        terrace(1, 0, -2.2, 16, 6.4, T);
        stairs(1, -5.4, 1.0, 1.6, T, 1.6);
        stairs(1, -3.4, 1.0, 1.6, T, 1.6);
        // پایه‌های ستون نخستین کاخ و سنگ‌های آماده
        for (let i = 0; i < 5; i++) for (let j = 0; j < 3; j++) column(-1 + i * 1.3, T, -3.2 + j * 1.3, 2.4, "bull", { pb: 2, ps: 3, pc: 4 });
        wall(3, 4.2, 7.4, -4.6, T, 2.2, 0.4, [[5.8, 0.8, 1.4]]);
        wallZ(3, -4.6, -1.4, 7.2, T, 2.2);
        roof(4, 5.8, -3.0, 3.2, 3.2, T + 2.2, { merl: true });
        merlons(4, "stone", -8, 1.0, 8, 1.0, T, 0.42);
        banner(5, -6.6, T, 0.4); banner(5, 6.6, T, 0.4);
        march(5, [[-7.5, T, -0.2], [-2, T, -0.3], [3, T, -0.2], [7.5, T, -0.3]], 6);
        birds(5); cypress(5, -8.6, 2.6); cypress(5, 8.6, 2.4); pine(5, 7.2, 3.2);
      },
      // پلکان دوطرفه‌ی بزرگ: دو بازو که از دو سو بالا می‌روند و روی پاگرد به هم می‌رسند
      grandStair() {
        terrace(1, 0, -3.2, 18, 5, T * 1.8);
        const H = T * 1.8;
        // بازوی پایین چپ و راست (رو به بیرون)، بازوی بالا (رو به درون)
        for (const sd of [-1, 1]) {
          const n = 12;
          // بازوی پایین از میانه رو به بیرون بالا می‌رود
          for (let i = 0; i < n; i++) { const hh = (H * 0.5 * (i + 1)) / n; box(2, "stone", 2.0 / n, hh, 1.3, sd * (0.9 + (2.0 * (i + 0.5)) / n), 0, 0.4); }
          box(2, "stone", 1.1, H * 0.5, 1.4, sd * 3.45, 0, 0.4); // پاگرد
          box(2, "stone", 1.1, H * 0.5, 1.4, sd * 3.45, 0, -0.95);
          // بازوی بالا از پاگرد رو به درون
          for (let i = 0; i < n; i++) { const hh = H * 0.5 + (H * 0.5 * (i + 1)) / n; box(3, "stone", 2.0 / n, hh, 1.3, sd * (2.9 - (2.0 * (i + 0.5)) / n), 0, -0.95); }
        }
        box(3, "stone", 1.8, H, 1.4, 0, 0, -0.95);
        for (const sd of [-1, 1]) {
        }
        box(1, "ashlar", 1.6, H * 0.5, 1.4, 0, 0, 0.4);
        merlons(4, "stone", -9, -0.7, -4.4, -0.7, H, 0.42); merlons(4, "stone", 4.4, -0.7, 9, -0.7, H, 0.42);
        for (const sd of [-1, 1]) { put(4, "stone", boxGeo(0.25, 0.5, 2.2), mtx([sd * 3.95, H * 0.5 + 0.2, -0.25])); }
        merlons(4, "stone", -0.8, 1.15, 0.8, 1.15, H * 0.5, 0.36);
        column(-2.2, H, -4.6, 2.6, "bull", { pb: 4, ps: 4, pc: 4 }); column(2.2, H, -4.6, 2.6, "bull", { pb: 4, ps: 4, pc: 4 });
        banner(5, -4.4, H, -1.0); banner(5, 4.4, H, -1.0);
        march(5, [[-8, 0, 2.2], [-4, 0, 1.6], [-1.5, 0, 1.6], [-1.6, H * 0.5, 0.4], [-3.4, H * 0.5, 0.4], [-2, H, -0.95], [0, H, -2], [6, H, -2.2]], 8, 0.6);
        birds(5); cypress(5, -7.5, 2.8); cypress(5, 7.5, 2.8);
      },
      // دروازه‌ی ملل: تالار چهارستونی با دو درگاه و گاوهای بالدار
      gate() {
        terrace(1, 0, -2.4, 16, 6, T);
        const y = T, hw = 2.6, hd = 2.4, zc = -1.8;
        [[-1.1, zc - 1.1], [1.1, zc - 1.1], [-1.1, zc + 1.1], [1.1, zc + 1.1]].forEach(([x, z]) => column(x, y, z, 3.4, "simple", { r: 0.2 }));
        // دیوارهای چپ و راست، و دیوار جلو با درگاه بزرگ
        wall(3, -hw, hw, zc + hd, y, 4.1, 0.6, [[0, 1.5, 3.0]]);
        wall(3, -hw, hw, zc - hd, y, 4.1, 0.6, [[0, 1.5, 3.0]]);
        wallZ(3, zc - hd, zc + hd, -hw, y, 4.1, 0.6); wallZ(3, zc - hd, zc + hd, hw, y, 4.1, 0.6);
        roof(4, 0, zc, hw * 2, hd * 2, y + 4.1, { mk: "plaster" });
        for (const sd of [-1, 1]) { lamassu(4, sd * 1.2, y, zc + hd + 1.0, 0.9, false); }
        stairs(1, 0, 1.2, 3.2, T, 1.6);
        banner(5, -3.4, y, zc + hd + 0.7); banner(5, 3.4, y, zc + hd + 0.7);
        march(5, [[-7, 0, 2.6], [-1, 0, 2.4], [0, T, 0.6], [0, T, -4.5]], 6);
        birds(5); cypress(5, -6.2, 2.4); cypress(5, 6.2, 2.4); cypress(5, -7.4, 2.0);
      },
      // راه سربازان: دو دیوار بلند و دروازه‌ای در ته
      avenue() {
        terrace(1, 0, -3, 16, 6, T * 0.8);
        const y = T * 0.8;
        box(1, "stone2", 3, 0.04, 6, 0, y, -2.8);
        for (const sd of [-1, 1]) { wallZ(3, -5.8, 0.2, sd * 1.9, y, 3.0, 0.5); merlons(4, "stone", sd * 1.9, 0.2, sd * 1.9, -5.8, y + 3.0, 0.4); for (let z = -5; z < 0; z += 1.2) doorFrame(2, sd * 1.62, y, z, 0.5, 1.6, Math.PI / 2, "dark", 0.1); }
        // دروازه‌ی ته
        wall(3, -1.9, 1.9, -5.8, y, 3.6, 0.6, [[0, 1.3, 2.6]]);
        for (const sd of [-1, 1]) lamassu(4, sd * 0.95, y, -4.9, 0.55, true);
        column(-4.4, y, -3.6, 2.6, "homa"); column(4.4, y, -3.6, 2.6, "homa");
        stairs(1, 0, 0.6 + 0.9, 3, y, 1.0);
        banner(5, -2.4, y, 0.2); banner(5, 2.4, y, 0.2);
        march(5, [[0, y, 0.4], [0, y, -5.2]], 7, 0.7);
        birds(5); cypress(5, -5.8, 1.4); cypress(5, 5.8, 1.4); pine(5, -7, 2.4); pine(5, 7, 2.4);
      },
      // آپادانا: سکوی بلند، ایوان ستون‌دار، تالار ستون‌ها، برج‌های گوشه
      apadana() {
        const y = T * 1.5;
        terrace(1, 0, -2.6, 17, 6.6, y);
        stairs(1, -4.6, 1.1, 1.4, y, 1.6); stairs(1, 4.6, 1.1, 1.4, y, 1.6);
        panel(4, "delegates", 0, 0.12, 0.72, 7.4, y - 0.24, 0, 3);
        // ایوان جلو: دو ردیف شش‌تایی
        let top = 0;
        for (let i = 0; i < 6; i++) for (let j = 0; j < 2; j++) top = column(-3.4 + i * 1.36, y, -0.9 - j * 1.2, 2.8, "bull");
        // تالار پشت
        for (let i = 0; i < 6; i++) for (let j = 0; j < 2; j++) column(-3.4 + i * 1.36, y, -3.4 - j * 1.2, 2.8, "bull");
        const ch = top - y;
        // برج‌های گوشه
        for (const sd of [-1, 1]) { box(3, "plaster", 1.4, ch + 0.5, 4.8, sd * 4.9, y, -2.6); doorFrame(2, sd * 4.9, y, -0.15, 0.6, 1.8, 0, "dark", 0.1); merlons(4, "stone", sd * 4.2, -0.2, sd * 5.6, -0.2, y + ch + 0.5, 0.36); }
        wall(3, -4.2, 4.2, -4.85, y, ch, 0.4, []);
        roof(4, 0, -2.4, 8.4, 4.6, top, { merl: true });
        banner(5, -4.9, y + ch + 0.6, -1.4, 1.6); banner(5, 4.9, y + ch + 0.6, -1.4, 1.6);
        march(5, [[-8, 0, 2.6], [-4.6, 0, 1.6], [-4.6, y, -0.4], [4.6, y, -0.4], [4.6, 0, 1.6], [8, 0, 2.6]], 9, 0.6);
        birds(5); cypress(5, -7.6, 2.0); cypress(5, 7.6, 2.0);
      },
      // نمای نزدیک پلکان شرقی آپادانا با سه ردیف نقش
      reliefStair() {
        const H = 2.6;
        box(1, "ashlar", 14, 0.4, 3, 0, 0, -1.6);
        // بدنه‌ی پلکان (دیواره‌ی جلو)
        box(3, "stone", 10, H - 0.4, 0.8, 0, 0.4, -1.2);
        // پله‌های دو سو
        for (const sd of [-1, 1]) {
          stairs(2, sd * 5.8, 0.9, 1.5, H, 2.0);
          parapet(3, sd * 5.0, 0.9, 2.0, H, 0.0, -sd, null);
        }
        panel(4, "delegates", -2.5, 0.5, -0.79, 4.8, 0.62, 0, 2);
        panel(4, "guards", -2.5, 1.15, -0.79, 4.8, 0.62, 0, 2);
        panel(4, "delegates", -2.5, 1.8, -0.79, 4.8, 0.62, 0, 2);
        panel(4, "guards", 2.5, 0.5, -0.79, 4.8, 0.62, 0, 2);
        panel(4, "delegates", 2.5, 1.15, -0.79, 4.8, 0.62, 0, 2);
        panel(4, "guards", 2.5, 1.8, -0.79, 4.8, 0.62, 0, 2);
        merlons(4, "stone", -5, -1.0, 5, -1.0, H, 0.4);
        for (let i = 0; i < 6; i++) column(-3.4 + i * 1.36, H, -3.0, 2.6, "bull", { pb: 4, ps: 4, pc: 4 });
        box(1, "ashlar", 14, H - 0.4, 3.2, 0, 0.4, -3.2);
        banner(5, -6.8, 0, 1.4); banner(5, 6.8, 0, 1.4);
        march(5, [[-8, 0, 1.8], [8, 0, 1.8]], 8, 0.7);
        birds(5);
      },
      // کاخ تچر: کاخ کوچک با درگاه‌ها و پنجره‌های سنگی و ایوان هشت‌ستونی
      tachara() {
        const y = T * 1.3;
        terrace(1, 0, -2.6, 15, 6, y);
        box(1, "stone2", 6.4, 0.5, 5.2, 0, y, -2.6);
        const yy = y + 0.5;
        stairs(1, 0, 1.0, 2.2, yy, 1.6);
        parapet(1, -1.25, 1.0, 1.6, yy, 0, -1, "servants"); parapet(1, 1.25, 1.0, 1.6, yy, 0, 1, "servants");
        let top = 0;
        for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) top = column(-2.1 + i * 1.4, yy, -0.8 - j * 1.0, 2.0, "bull", { r: 0.2 });
        const ch = top - yy;
        // دیوار تالار با درگاه و پنجره‌های سنگی سیاه (هنوز سرپا مانده‌اند)
        wall(3, -3.2, 3.2, -2.5, yy, ch, 0.45, [[-2.2, 0.6, 1.5], [0, 1.0, 2.2], [2.2, 0.6, 1.5]]);
        wallZ(3, -5.2, -2.5, -3.0, yy, ch, 0.45); wallZ(3, -5.2, -2.5, 3.0, yy, ch, 0.45);
        wall(3, -3.2, 3.2, -5.0, yy, ch, 0.45);
        roof(4, 0, -2.6, 6.2, 5.0, top, { merl: true });
        banner(5, -3.5, yy, 0.4); banner(5, 3.5, yy, 0.4);
        march(5, [[-7, 0, 2.6], [-1, 0, 2.6], [0, yy, -0.4], [2.6, yy, -0.4]], 5, 0.6);
        birds(5); cypress(5, -6.4, 1.8); cypress(5, 6.4, 1.8); cypress(5, -5.4, 2.6); cypress(5, 5.4, 2.6);
      },
      // تالار سه‌دری: چهار ستون، سه درگاه، پلکان دوطرفه
      tripylon() {
        const y = T * 1.2;
        terrace(1, 0, -2.6, 15, 6, y);
        for (const sd of [-1, 1]) { stairs(1, sd * 1.6, 1.0, 1.4, y, 1.4); parapet(1, sd * 2.4, 1.0, 1.4, y, 0, sd, "guards"); }
        panel(4, "lionbull", 0, 0.1, 0.78, 1.6, y - 0.2, 0, 1);
        let top = 0;
        [[-1, -2.0], [1, -2.0], [-1, -3.6], [1, -3.6]].forEach(([x, z]) => (top = column(x, y, z, 2.2, "lion", { r: 0.2 })));
        const ch = top - y;
        wall(3, -2.6, 2.6, -0.7, y, ch, 0.45, [[0, 1.1, 2.4]]);
        wall(3, -2.6, 2.6, -4.9, y, ch, 0.45, [[0, 1.1, 2.4]]);
        wallZ(3, -4.9, -0.7, -2.6, y, ch, 0.45); wallZ(3, -4.9, -0.7, 2.6, y, ch, 0.45);
        roof(4, 0, -2.8, 5.2, 4.2, top);
        banner(5, -3.2, y, 0.2); banner(5, 3.2, y, 0.2);
        march(5, [[-7, 0, 2.4], [-1.6, 0, 2.0], [-1.6, y, -0.2], [1.6, y, -0.2], [1.6, 0, 2.0], [7, 0, 2.4]], 8, 0.6);
        birds(5); pine(5, -5.6, 2.2); pine(5, 5.6, 2.2); cypress(5, -6.8, 1.8); cypress(5, 6.8, 1.8);
      },
      // کاخ هدیش: بلندتر، ایوان ۱۲ستونی و دو پلکان
      hadish() {
        const y = T * 1.9;
        terrace(1, 0, -2.6, 17, 6.2, y);
        for (const sd of [-1, 1]) { stairs(1, sd * 3.0, 1.0, 1.4, y, 1.8); parapet(1, sd * 3.8, 1.0, 1.8, y, 0, sd, "servants"); parapet(1, sd * 2.2, 1.0, 1.8, y, 0, -sd, null); }
        let top = 0;
        for (let i = 0; i < 6; i++) for (let j = 0; j < 2; j++) top = column(-3.0 + i * 1.2, y, -0.9 - j * 1.05, 2.2, "bull", { r: 0.2 });
        const ch = top - y;
        wall(3, -3.8, 3.8, -2.6, y, ch, 0.45, [[-2.4, 0.7, 1.7], [0, 1.1, 2.4], [2.4, 0.7, 1.7]]);
        wallZ(3, -5.4, -2.6, -3.6, y, ch, 0.45); wallZ(3, -5.4, -2.6, 3.6, y, ch, 0.45);
        wall(3, -3.8, 3.8, -5.4, y, ch, 0.45);
        roof(4, 0, -2.8, 7.4, 5.0, top);
        banner(5, -4.2, y, 0.3); banner(5, 4.2, y, 0.3);
        march(5, [[-8, 0, 2.6], [-3, 0, 2.6], [-3, y, -0.4], [3, y, -0.4], [3, 0, 2.6], [8, 0, 2.6]], 8, 0.6);
        birds(5); cypress(5, -7.2, 2.2); cypress(5, 7.2, 2.2);
      },
      // کاخ صدستون: تالار بزرگ مربع، ایوان و دو گاو نگهبان
      hundred() {
        const y = T * 0.9;
        terrace(1, 0, -3.0, 18, 6.8, y);
        stairs(1, 0, 0.6, 3, y, 1.0);
        let top = 0;
        for (let i = 0; i < 8; i++) for (let j = 0; j < 2; j++) top = column(-4.2 + i * 1.2, y, -1.0 - j * 1.0, 2.2, "bull", { r: 0.17 });
        const ch = top - y;
        for (const sd of [-1, 1]) lamassu(4, sd * 4.9, y, -0.6, 0.72, false);
        wall(3, -5.4, 5.4, -2.6, y, ch, 0.5, [[-3, 0.9, 2.2], [0, 1.2, 2.5], [3, 0.9, 2.2]]);
        for (const sd of [-1, 1]) { wallZ(3, -6.2, -2.6, sd * 5.2, y, ch, 0.5); }
        wall(3, -5.4, 5.4, -6.2, y, ch, 0.5);
        for (let i = 0; i < 6; i++) for (let j = 0; j < 2; j++) column(-3.6 + i * 1.44, y, -3.6 - j * 1.3, 2.2, "bull", { r: 0.17 });
        roof(4, 0, -3.4, 10.6, 5.8, top);
        banner(5, -5.8, y, 0.0); banner(5, 5.8, y, 0.0);
        march(5, [[-8, 0, 1.8], [0, 0, 1.8], [0, y, -0.2], [0, y, -2.2]], 7, 0.6);
        birds(5); pine(5, -7.6, 2.0); pine(5, 7.6, 2.0);
      },
      // دروازه‌ی ناتمام: ستون‌های نیمه‌کاره و بلوک‌های سنگ؛ بخش آخر داربست و سنگ‌تراش‌ها
      unfinished() {
        terrace(1, 0, -3, 16, 6, T * 0.7);
        const y = T * 0.7;
        wall(3, -3, 3, -2.0, y, 3.6, 0.7, [[0, 1.5, 2.8]]);
        wallZ(3, -5, -2.0, -3, y, 3.6, 0.7); wallZ(3, -5, -2.0, 3, y, 3.6, 0.7);
        for (const sd of [-1, 1]) lamassu(4, sd * 1.15, y, -1.0, 0.62, false);
        [[-1.2, -3.4], [1.2, -3.4], [-1.2, -4.6], [1.2, -4.6]].forEach(([x, z], i) => column(x, y, z, 1.2 + i * 0.4, "simple", { r: 0.22, pc: 3 }));
        const r = rnd(4);
        for (let i = 0; i < 12; i++) box(2, i % 3 ? "stone" : "stone2", 0.6 + r() * 0.6, 0.4 + r() * 0.3, 0.5 + r() * 0.4, (i % 2 ? 1 : -1) * (2.4 + r() * 4), y, -0.6 + r() * 1.8, r() * 3);
        // داربست چوبی
        for (const sd of [-1, 1]) for (let k = 0; k < 3; k++) { box(5, "wood", 0.08, 4.2, 0.08, sd * (3.6 + k * 0.6), y, -1.4); }
        for (const sd of [-1, 1]) for (let h = 1; h < 4.2; h += 1.2) box(5, "wood", 1.4, 0.08, 0.5, sd * 4.2, y + h, -1.4);
        stairs(1, 0, 1.0 + 0.6, 3, y, 1.0);
        march(5, [[-7, 0, 2.4], [7, 0, 2.4]], 4, 0.65);
        birds(5); pine(5, -6.8, 2.4); pine(5, 6.8, 2.4);
      },
      // آرامگاه صخره‌ای: نمای چلیپایی در دل کوه، با نقش بالای آن
      rockTomb() {
        cliff(1, 0, -1.0, 16, 6.2, 2.4, 5);
        const z = -0.98;
        box(2, "stone", 6.0, 2.7, 0.3, 0, 1.3, z); // بخش میانی چلیپا
        doorFrame(2, 0, 1.45, z + 0.18, 0.9, 1.5, 0, "dark", 0.12);
        box(2, "dark", 0.9, 1.5, 0.04, 0, 1.45, z + 0.16);
        for (let i = 0; i < 4; i++) column(-2.2 + i * 1.47, 1.3, z + 0.34, 2.1, "bull", { r: 0.13, pb: 3, ps: 3, pc: 3, tall: false });
        box(3, "stone", 6.2, 0.34, 0.46, 0, 4.0, z + 0.06);
        box(1, "stone2", 3.2, 1.3, 0.2, 0, 0, z); // پایین چلیپا
        panel(4, "throne", 0, 4.36, z + 0.12, 3.4, 1.7, 0, 1);
        // پلکان سنگی و آتشدان پایین
        stairs(1, -4.5, 1.6, 1.2, 0.6, 1.2);
        const ay = altar(5, 3.6, 1.6);
        flames(5, 3.6, ay, 1.6, 0.9);
        birds(5); pine(5, -6.6, 2.4); pine(5, 6.2, 2.8); cypress(5, -5.6, 3.0);
      },
      // نقش رستم: دو آرامگاه در صخره و کعبه‌ی زرتشت جلو
      naqsh() {
        cliff(1, 0, -2.2, 18, 7.2, 2.4, 9);
        const z = -2.18;
        for (const cx of [-4.2, 3.2]) {
          box(2, "stone", 3.6, 1.8, 0.3, cx, 2.6, z);
          doorFrame(2, cx, 2.75, z + 0.18, 0.6, 1.0, 0, "dark", 0.12);
          box(2, "dark", 0.6, 1.0, 0.04, cx, 2.75, z + 0.16);
          for (let i = 0; i < 4; i++) column(cx - 1.3 + i * 0.86, 2.6, z + 0.32, 1.4, "bull", { r: 0.085, pb: 2, ps: 2, pc: 2, tall: false });
          box(2, "stone2", 1.9, 2.6, 0.2, cx, 0, z);
          panel(4, "throne", cx, 4.55, z + 0.12, 2.4, 1.3, 0, 1);
        }
        // کعبه‌ی زرتشت: برج سنگی مربع با پنجره‌های کور
        const tx = -0.4, tz = 1.2;
        box(3, "stone", 1.5, 0.2, 1.5, tx, 0, tz); box(3, "stone", 1.3, 3.0, 1.3, tx, 0.2, tz);
        for (let k = 0; k < 3; k++) for (const sd of [-1, 1]) box(3, "dark", 0.18, 0.4, 0.04, tx + sd * 0.35, 0.8 + k * 0.8, tz + 0.66);
        for (let k = 0; k < 4; k++) box(3, "dark", 0.18, 0.4, 0.04, tx + 0.66, 0.8 + k * 0.6, tz - 0.4 + k * 0.25, Math.PI / 2);
        box(4, "stone", 1.42, 0.3, 1.42, tx, 3.2, tz); box(4, "stone2", 1.2, 0.18, 1.2, tx, 3.5, tz);
        doorFrame(4, tx, 2.0, tz + 0.66, 0.4, 0.8, 0, "dark", 0.06);
        stairs(4, tx, tz + 1.95, 0.6, 2.0, 1.3, 0, "stone2");
        const ay = altar(5, 2.6, 2.4);
        flames(5, 2.6, ay, 2.4, 0.9);
        birds(5); pine(5, 6.6, 2.6); pine(5, -6.8, 2.6);
      },
      // آرامگاه کوروش: شش پله و خانه‌ی شیروانی‌دار
      cyrus() {
        const steps = [[5.2, 0.55], [4.6, 0.55], [4.0, 0.55], [3.4, 0.4], [2.9, 0.4], [2.4, 0.4]];
        let y = 0;
        steps.forEach(([w, h], i) => { box(i < 1 ? 1 : i < 3 ? 2 : 3, "stone", w, h, w * 0.82, 0, y, -1.6); y += h; });
        box(4, "stone", 2.0, 1.4, 1.5, 0, y, -1.6);
        // سقف شیروانی
        const sh = new THREE.Shape(); sh.moveTo(-1.15, 0); sh.lineTo(1.15, 0); sh.lineTo(0, 0.75); sh.closePath();
        put(4, "stone", scaleUV(new THREE.ExtrudeGeometry(sh, { depth: 1.7, bevelEnabled: false }), 0.4, 0.4), mtx([0, y + 1.4, -1.6 - 0.85]));
        doorFrame(4, 0, y, -0.84, 0.5, 0.9, 0, "stone2", 0.06);
        box(4, "dark", 0.5, 0.9, 0.02, 0, y, -0.83);
        for (const x of [-5.2, -4.2, -3.2, 3.2, 4.2, 5.2]) cypress(5, x, 1.2 - Math.abs(x) * 0.1, 2.0);
        // ردیف ستون‌های کاخ‌های پاسارگاد در دوردست
        for (const sd of [-1, 1]) for (let k = 0; k < 4; k++) column(sd * (4.4 + (k % 2) * 1.2), 0, -3.8 + Math.floor(k / 2) * 1.2, 1.6 + (k % 2) * 0.5, "simple", { r: 0.14, pb: 2, ps: 3, pc: 3 });
        birds(5); march(5, [[-7, 0, 2.0], [-2, 0, 1.4], [2, 0, 1.4], [7, 0, 2.0]], 4, 0.6);
      },
      // باغ پاسارگاد: جوی‌های سنگی، حوضچه‌ها، کاخ با ستون‌های سفید و پایه‌ی سیاه
      garden() {
        box(1, "stone2", 18, 0.04, 0.3, 0, 0, 1.4);
        for (const z of [1.4, -2.0]) { box(1, "stone", 14, 0.18, 0.36, 0, 0, z); }
        for (const x of [-6, 0, 6]) box(1, "stone", 0.36, 0.18, 3.4, x, 0, -0.3);
        for (const [x, z] of [[-6, 1.4], [0, 1.4], [6, 1.4], [-6, -2.0], [0, -2.0], [6, -2.0]]) box(1, "stone", 0.9, 0.2, 0.9, x, 0, z);
        // کاخ
        let top = 0;
        for (let i = 0; i < 6; i++) for (let j = 0; j < 2; j++) top = column(-3.0 + i * 1.2, 0.0, -3.6 - j * 1.1, 2.7, "simple", { r: 0.17 });
        for (const sd of [-1, 1]) box(3, "plaster", 0.6, top, 2.4, sd * 3.9, 0, -4.1);
        wall(3, -3.6, 3.6, -5.4, 0, top, 0.45, [[0, 1.0, 2.2]]);
        roof(4, 0, -4.2, 7.8, 2.8, top, { mk: "plaster" });
        for (let x = -7; x <= 7; x += 1.4) { if (Math.abs(x) > 0.6) { cypress(5, x, 2.3, 1.6); } }
        for (const x of [-4.2, -2.6, 2.6, 4.2]) cypress(5, x, -1.2, 1.4);
        const ws = [];
        for (const z of [1.4, -2.0]) ws.push(waterPlane(5, 0, 0.19, z, 14, 0.22));
        for (const x of [-6, 0, 6]) { const m = waterPlane(5, x, 0.19, -0.3, 0.22, 3.4); ws.push(m); }
        birds(5);
      },
      // آپادانای شوش: دیوارهای آجر لعابی با کمانداران و شیرها
      susa() {
        const y = T;
        terrace(1, 0, -2.6, 16, 6.4, y);
        stairs(1, 0, 1.0, 2.4, y, 1.4);
        let top = 0;
        for (let i = 0; i < 6; i++) for (let j = 0; j < 2; j++) top = column(-3.4 + i * 1.36, y, -0.9 - j * 1.1, 2.6, "bull");
        const ch = top - y;
        wall(3, -4.6, 4.6, -2.6, y, ch, 0.5, [[0, 1.2, 2.6]], "plaster");
        for (const sd of [-1, 1]) { box(3, "plaster", 1.4, ch + 0.4, 3.4, sd * 5.2, y, -1.6); }
        // آجرهای لعابی روی دیوار و برج‌ها
        panel(4, "glaze:archers", -2.6, y + 0.3, -2.33, 2.8, 1.4, 0, 2); panel(4, "glaze:archers", 2.6, y + 0.3, -2.33, 2.8, 1.4, 0, 2);
        for (const sd of [-1, 1]) panel(4, "glaze:lions", sd * 5.2, y + 2.4, 0.11, 1.4, 0.9, 0, 1);
        panel(4, "glaze:lions", 0, 0.1, 0.62, 2.4, y - 0.2, 0, 1);
        roof(4, 0, -1.9, 8.2, 2.6, top);
        for (const sd of [-1, 1]) merlons(4, "stone", sd * 4.5, -0.1, sd * 5.9, -0.1, y + ch + 0.4, 0.36);
        banner(5, -5.2, y + ch + 0.4, -1.6, 1.6); banner(5, 5.2, y + ch + 0.4, -1.6, 1.6);
        march(5, [[-7, 0, 2.4], [0, 0, 2.4], [0, y, 0.0], [0, y, -2.4]], 6, 0.6);
        birds(5); pine(5, -7.4, 1.8); pine(5, 7.4, 1.8); cypress(5, -6.4, 2.6); cypress(5, 6.4, 2.6);
      },
      // بیستون: صخره‌ی بلند، سکوی تراشیده، کتیبه‌ها و نقش داریوش
      bisotun() {
        cliff(1, 0, -1.6, 18, 7.6, 2.4, 13);
        const z = -1.58;
        box(2, "stone", 7.0, 4.0, 0.15, 0, 1.8, z); // سطح صاف‌شده
        box(2, "stone2", 7.4, 0.2, 0.5, 0, 1.6, z + 0.1);
        panel(3, "cuneiform", -2.4, 1.95, z + 0.09, 2.0, 1.6, 0, 1); panel(3, "cuneiform", 2.4, 1.95, z + 0.09, 2.0, 1.6, 0, 1); panel(3, "cuneiform", 0, 1.95, z + 0.09, 2.6, 0.8, 0, 1);
        panel(4, "guards", 0, 3.6, z + 0.09, 4.6, 1.0, 0, 1.2);
        // نشان بالدار بالای نقش
        const wd = keep(new THREE.MeshLambertMaterial({ map: tex(cv(256, 128, (c) => wingedDisc(c, 128, 64, 2.2, "#cdbd9c")), false), transparent: true, alphaTest: 0.3 }));
        const wm = new THREE.Mesh(keep(new THREE.PlaneGeometry(1.4, 0.7)), wd); wm.position.set(0, 4.95, z + 0.12); wm.userData.noEdges = 1;
        obj(4, wm);
        // راه کهن و کاروان
        box(1, "stone2", 18, 0.03, 1.2, 0, 0, 2.2);
        march(5, [[-8, 0, 2.2], [8, 0, 2.2]], 6, 0.6);
        waterPlane(5, 5.4, 0.04, 1.0, 3.4, 1.6);
        box(5, "stone2", 3.6, 0.06, 1.8, 5.4, 0, 1.0);
        birds(5); pine(5, -6.8, 2.8); pine(5, -5.6, 3.2); pine(5, 7.2, 3.2);
      },
      // گنج‌نامه: دو قاب کتیبه بر صخره و آبشار کنارش
      ganjnameh() {
        cliff(1, -1.2, -1.4, 13, 6.4, 2.4, 17);
        cliff(1, 6.4, -2.4, 6, 7.2, 2.0, 18);
        const z = -1.38;
        for (const x of [-3.2, -0.6]) { box(2, "stone2", 2.3, 2.9, 0.18, x, 1.2, z); box(2, "stone", 2.1, 2.7, 0.1, x, 1.3, z + 0.1); panel(3, "cuneiform", x, 1.32, z + 0.16, 2.0, 2.6, 0, 0.6); }
        // آبشار و حوضچه
        box(4, "rock", 1.2, 0.5, 1.0, 3.2, 0, 0.2);
        const fall = new THREE.Mesh(keep(new THREE.PlaneGeometry(0.9, 5.2, 1, 12)), keep(new THREE.MeshPhongMaterial({ color: 0xdfeef4, transparent: true, opacity: 0.8, shininess: 100 })));
        fall.position.set(3.2, 2.9, -0.2); fall.name = "fall"; fall.userData.noEdges = 1;
        obj(4, fall);
        waterPlane(4, 3.2, 0.06, 1.2, 2.4, 1.6);
        box(4, "stone2", 2.8, 0.05, 2.0, 3.2, 0, 1.2);
        // درخت‌ها و راه
        for (let i = 0; i < 4; i++) pine(5, -7 + i * 1.1, 2.4 - (i % 2) * 0.6, 1.8);
        cypress(5, 5.2, 2.6); cypress(5, 6.0, 2.2);
        march(5, [[-8, 0, 3.2], [8, 0, 3.2]], 4, 0.6);
        birds(5);
      },
      // جشن نوروز: نمای کلی صفه با چند کاخ، شب، مشعل‌ها و فرستادگان
      nowruz() {
        terrace(1, 0, -3.2, 18, 7, T);
        stairs(1, -6.6, 0.4 + 0.9, 1.4, T, 1.2); stairs(1, -4.8, 0.4 + 0.9, 1.4, T, 1.2);
        // دروازه
        box(3, "plaster", 1.6, 2.4, 1.6, -5.6, T, -1.8); roof(4, -5.6, -1.8, 1.6, 1.6, T + 2.4, { eave: 0.12 });
        lamassu(4, -5.6, T, -0.6, 0.42, false);
        // آپادانا
        const y2 = T + 0.4; box(1, "stone2", 6.2, 0.4, 4.2, 0, T, -3.2);
        let t1 = 0, t2 = 0;
        for (let i = 0; i < 5; i++) for (let j = 0; j < 3; j++) t1 = column(-2.4 + i * 1.2, y2, -1.8 - j * 1.1, 2.0, "bull", { r: 0.15 });
        roof(4, 0, -2.9, 5.4, 3.0, t1);
        // صدستون
        for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) t2 = column(4.4 + i * 1.0, T, -2.0 - j * 1.0, 1.65, "bull", { r: 0.13 });
        box(3, "plaster", 3.4, t2 - T, 0.3, 5.4, T, -4.6); roof(4, 5.4, -3.2, 3.2, 3.0, t2, { eave: 0.12 });
        merlons(4, "stone", -9, 0.3, 9, 0.3, T, 0.4);
        for (const x of [-7.6, -3.4, 3.2, 7.6]) { box(5, "dark", 0.16, 1.0, 0.16, x, T, 0.0); flames(5, x, T + 1.0, 0.0, 0.6); }
        banner(5, -2.6, y2, -0.6); banner(5, 2.6, y2, -0.6); banner(5, 4.0, T, -0.4);
        march(5, [[-8.5, 0, 2.2], [-6.6, 0, 1.4], [-6.6, T, -0.2], [-1, T, -0.4], [4, T, -0.4]], 10, 0.5);
        pine(5, -8.6, 2.8); pine(5, 8.6, 2.8);
      },
    };

    // ---------- بخش ۰: زمین، آسمان و کوه ----------
    const gcol = GROUND[mon.ground];
    (function () {
      const skyGeo = keep(new THREE.CylinderGeometry(20, 20, 20, 48, 1, true, Math.PI - 1.5, 3));
      const skyM = new THREE.Mesh(skyGeo, keep(new THREE.MeshBasicMaterial({ map: tex(skyCanvas(sky), false), side: THREE.BackSide, fog: false })));
      skyM.position.set(0, 7, 7); skyM.userData.noEdges = 1; skyM.userData.always = 1;
      obj(0, skyM);
      const ground = new THREE.Mesh(keep(new THREE.BoxGeometry(26, 0.5, 18)), [MAT.stone2, MAT.stone2, lam({ map: tex(groundCanvas(gcol, monumentNo(opts.level) + 3), false) }), MAT.stone2, MAT.stone2, MAT.stone2]);
      ground.position.set(0, -0.25, -2); ground.receiveShadow = true; ground.userData.noEdges = 1; ground.userData.always = 1;
      obj(0, ground);
      mountain(0, mon.mt === "far" ? "far" : "near", monumentNo(opts.level) * 7 + 1);
    })();
    BUILD[mon.build]();

    // ---------- چیدن: ساخته‌شده‌ها رنگی، بقیه نقشه‌ی معمار ----------
    const root = new THREE.Group();
    scene.add(root);
    const sketchMat = keep(new THREE.MeshBasicMaterial({ color: PAPER, transparent: true, opacity: 0.32, depthWrite: false }));
    const inkMat = keep(new THREE.LineBasicMaterial({ color: INK, transparent: true, opacity: 0.5 }));
    const fades = [];
    const meshesOf = (p) => {
      const out = [];
      Object.entries(parts[p].geos).forEach(([mk, list]) => {
        const g = merge(list);
        const m = new THREE.Mesh(g, mk.startsWith("rel:") ? reliefMat(mk.slice(4)) : MAT[mk]);
        m.castShadow = true; m.receiveShadow = true;
        out.push(m);
      });
      return out.concat(parts[p].objs);
    };
    function sketchOf(m, own) {
      const g = new THREE.Group();
      const sm = own ? keep(sketchMat.clone()) : sketchMat, im = own ? keep(inkMat.clone()) : inkMat;
      m.updateMatrixWorld(true);
      m.traverse((o) => {
        if (!o.isMesh || o.userData.noEdges || !o.geometry) return;
        const s = new THREE.Mesh(o.geometry, sm); s.applyMatrix4(o.matrixWorld); g.add(s);
        const l = new THREE.LineSegments(keep(new THREE.EdgesGeometry(o.geometry, 30)), im); l.applyMatrix4(o.matrixWorld); g.add(l);
      });
      return g;
    }
    const alive = count >= PARTS.length;
    const sketches = [];
    for (let p = 0; p < PARTS.length; p++) {
      const items = meshesOf(p);
      const built = p < count || (p === 0);
      items.forEach((m) => {
        if (built) {
          root.add(m);
          if (p === fresh && !m.userData.always) {
            const sk = sketchOf(m, true); root.add(sk);
            fades.push({ obj: m, sk, y: m.position.y });
            m.traverse((o) => { if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((mt) => { if (mt.userData.baseOp === undefined) { mt.userData.wasT = mt.transparent; mt.userData.baseOp = mt.opacity; } }); });
          }
        } else if (p < 5) {
          const sk = sketchOf(m); root.add(sk); sketches.push(sk);
        }
      });
    }
    // مواد مشترک‌اند، پس محو شدن بخش تازه را با کلون جدا می‌کنیم
    fades.forEach((f) => f.obj.traverse((o) => {
      if (!o.material) return;
      o.material = Array.isArray(o.material) ? o.material.map((mt) => keep(mt.clone())) : keep(o.material.clone());
      (Array.isArray(o.material) ? o.material : [o.material]).forEach((mt) => { mt.userData.baseOp = mt.opacity; mt.userData.wasT = mt.transparent; mt.transparent = true; mt.opacity = 0; });
    }));

    // ---------- دوربین و حرکت ----------
    let yaw = 0, pitch = 0, dragYaw = 0, dragPitch = 0, tiltYaw = 0, dragging = false, lastX = 0, lastY = 0;
    const dist = 20.5;
    function placeCam(t) {
      const auto = calmNow ? 0 : Math.sin(t * 0.0002) * 0.3;
      const ty = dragging ? dragYaw : auto + dragYaw + tiltYaw;
      yaw += (ty - yaw) * 0.08;
      pitch += (dragPitch - pitch) * 0.08;
      if (!dragging) { dragYaw *= 0.985; dragPitch *= 0.97; }
      const el2 = 0.3 + pitch;
      camera.position.set(Math.sin(yaw) * dist * Math.cos(el2), target.y + Math.sin(el2) * dist, Math.cos(yaw) * dist * Math.cos(el2) - 0.8);
      camera.lookAt(target);
    }
    const cvs = renderer.domElement;
    cvs.addEventListener("pointerdown", (e) => { dragging = true; lastX = e.clientX; lastY = e.clientY; dragYaw = yaw; cvs.setPointerCapture?.(e.pointerId); });
    cvs.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      dragYaw = Math.max(-0.8, Math.min(0.8, dragYaw - (e.clientX - lastX) * 0.006));
      dragPitch = Math.max(-0.2, Math.min(0.5, dragPitch + (e.clientY - lastY) * 0.003));
      lastX = e.clientX; lastY = e.clientY;
      if (calmNow) frame(performance.now(), true);
    });
    const up = () => { dragging = false; };
    cvs.addEventListener("pointerup", up); cvs.addEventListener("pointercancel", up);
    const onTilt = (e) => { if (e.gamma != null) tiltYaw = Math.max(-0.4, Math.min(0.4, -e.gamma / 90)); };
    window.addEventListener("deviceorientation", onTilt);

    // ---------- حلقه‌ی نمایش ----------
    const t0 = performance.now();
    let raf = 0, dead = false, last = 0;
    const tmpV = new THREE.Vector3();
    function frame(now, force) {
      if (dead) return;
      if (!el.isConnected || !cvs.isConnected) return dispose();
      raf = requestAnimationFrame(frame);
      if (!force && now - last < 30) return;
      if (!force && el.offsetParent === null) return;
      last = now;
      const t = now - t0, s = t / 1000;
      placeCam(now);
      fades.forEach((f) => {
        const k = calmNow ? 1 : Math.max(0, Math.min(1, (t - 500) / 1400));
        const e = 1 - Math.pow(1 - k, 3);
        f.obj.traverse((o) => { if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((mt) => { mt.opacity = (mt.userData.baseOp ?? 1) * e; if (k >= 1) mt.transparent = mt.userData.wasT; }); });
        f.sk.visible = k < 1;
        f.sk.traverse((o) => { if (o.material) o.material.opacity = (o.isLineSegments ? 0.5 : 0.32) * (1 - e); }); // مواد این طرح جداست (sketchOf(m, true))
        f.obj.position.y = f.y - (1 - e) * 0.4;
        f.sk.position.y = -(1 - e) * 0.0;
      });
      if (!calmNow && alive) {
        root.traverse((m) => {
          if (m.userData.flame !== undefined) { const p = m.userData.flame; m.scale.y = 1 + Math.sin(s * 9 + p) * 0.14 + Math.sin(s * 13 + p * 2) * 0.06; m.scale.x = 1 + Math.sin(s * 7 + p) * 0.06; m.lookAt(camera.position.x, m.getWorldPosition(tmpV).y, camera.position.z); }
          else if (m.name === "cloth") { const pos = m.geometry.attributes.position; for (let i = 0; i < pos.count; i++) { const x = pos.getX(i); pos.setZ(i, Math.sin(x * 4 - s * 3.2) * 0.08 * x); } pos.needsUpdate = true; }
          else if (m.userData.bird !== undefined) { const i = m.userData.bird; m.position.x += 0.02; if (m.position.x > 10) m.position.x = -10; m.position.y += Math.sin(s * 2 + i) * 0.004; m.scale.y = 0.6 + Math.abs(Math.sin(s * 8 + i)) * 0.6; }
          else if (m.name === "water") { m.material.color.setHSL(0.55, 0.32, 0.56 + Math.sin(s * 2) * 0.03); }
          else if (m.name === "fall") { const pos = m.geometry.attributes.position; for (let i = 0; i < pos.count; i++) pos.setZ(i, Math.sin(pos.getY(i) * 6 + s * 8) * 0.03); pos.needsUpdate = true; }
        });
        marchers.forEach((m) => {
          const d = m.userData; d.t = (d.t + 0.0012) % 1;
          const p = d.curve.getPointAt(d.t), q = d.curve.getPointAt(Math.min(1, d.t + 0.01));
          m.position.set(p.x, p.y + Math.abs(Math.sin(s * 6 + d.t * 40)) * 0.03, p.z);
          m.scale.x = q.x < p.x ? -1 : 1;
          m.rotation.y = yaw;
        });
      } else if (alive) {
        marchers.forEach((m) => { const p = m.userData.curve.getPointAt(m.userData.t); m.position.copy(p); });
      }
      renderer.render(scene, camera);
    }
    raf = requestAnimationFrame(frame);
    frame(performance.now(), true);

    function dispose() {
      if (dead) return;
      dead = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("deviceorientation", onTilt);
      disposables.forEach((d) => d.dispose && d.dispose());
      Object.values(reliefMats).forEach((m) => m.dispose());
      renderer.dispose();
      renderer.forceContextLoss?.();
      cvs.remove();
    }
    return { dispose };
  }

  // اگر WebGL نبود: نمای تخت ساده از ستون‌ها و صفه
  function flat(el, opts) {
    const mon = monumentOf(opts.level), sky = SKY[mon.sky];
    const W = el.clientWidth || 320, H = el.clientHeight || Math.round(W * 0.62), r = Math.min(window.devicePixelRatio || 1, 2);
    const c = document.createElement("canvas");
    c.width = W * r; c.height = H * r; c.className = "prs-canvas";
    const x = c.getContext("2d"), w = c.width, h = c.height;
    x.drawImage(skyCanvas(sky), 0, 0, w, h * 0.7);
    x.fillStyle = "#8e7660"; x.beginPath(); x.moveTo(0, h * 0.62); for (let i = 0; i <= 12; i++) x.lineTo((w * i) / 12, h * (0.3 + 0.12 * Math.sin(i * 1.7))); x.lineTo(w, h * 0.62); x.fill();
    x.drawImage(groundCanvas(GROUND[mon.ground], 3), 0, h * 0.62, w, h * 0.38);
    const n = opts.count;
    x.fillStyle = "#b9a785"; if (n > 1) x.fillRect(w * 0.12, h * 0.62, w * 0.76, h * 0.1);
    x.fillStyle = "#cdbd9c";
    for (let i = 0; i < 8; i++) { const cx = w * (0.18 + i * 0.09); const top = n > 3 ? h * 0.28 : n > 2 ? h * 0.56 : h * 0.6; if (n > 2) x.fillRect(cx, top, w * 0.025, h * 0.62 - top); if (n > 4) x.fillRect(cx - w * 0.015, top - h * 0.04, w * 0.055, h * 0.04); }
    if (n > 4) { x.fillStyle = "#d8b98a"; x.fillRect(w * 0.14, h * 0.2, w * 0.72, h * 0.06); }
    el.appendChild(c);
    return { dispose: () => c.remove() };
  }

  function show(el, opts) {
    el.classList.add("prs-stage");
    if (!webgl()) return flat(el, opts);
    let handle = null, gone = false;
    ready().then(() => { if (!gone && el.isConnected) handle = mount(el, opts); }).catch((e) => {
      console.warn("persepolis", e);
      if (gone || !el.isConnected) return;
      el.querySelectorAll("canvas").forEach((c) => c.remove());
      handle = flat(el, opts);
    });
    return { dispose: () => { gone = true; handle && handle.dispose(); } };
  }

  window.PRS = { PARTS, MONUMENTS, monumentOf, monumentNo, partName, show, ready, _mount: mount };
})();
