"use strict";

// فصل‌ها: هر ۲۰ مرحله یک فصل است، با اسم و منظره‌ی خودش.
// منظره‌ها همین‌جا با SVG ساخته می‌شوند (فایل تصویر لازم نیست) و روی نقشه‌ی مرحله‌ها،
// در منو و در پایان هر فصل دیده می‌شوند. این فایل بعد از game.js بارگذاری می‌شود.

const CHAPTER_SIZE = 20;
const CHAPTER_REWARD = 50; // سکه‌ی پایان هر فصل، فقط بار اول

// بعد از آخرین فصل، فهرست از اول تکرار می‌شود (با شماره‌ی فصل بالاتر)
const CHAPTERS = [
  { name: "سپیده‌دم", scene: "dawn" },
  { name: "کوچه‌باغ", scene: "orchard" },
  { name: "ساحل خزر", scene: "sea" },
  { name: "کویر", scene: "desert" },
  { name: "جنگل مه‌آلود", scene: "forest" },
  { name: "دماوند", scene: "damavand" },
  { name: "شالیزار", scene: "paddy" },
  { name: "نخلستان", scene: "palms" },
  { name: "کاروانسرا", scene: "caravanserai" },
  { name: "دریاچه", scene: "lake" },
  { name: "کوهستان برفی", scene: "snow" },
  { name: "شب شهر", scene: "night" },
];

const chapterOf = (level) => Math.floor(level / CHAPTER_SIZE);
const chapterInfo = (c) => CHAPTERS[c % CHAPTERS.length];

// ---------- ساختن منظره ----------

const SCENE_W = 320, SCENE_H = 120;

// تپه‌های نرم: موجی از چند سینوس، از ارتفاع base با دامنه‌ی amp
function sceneHills(rnd, color, base, amp, opacity = 1) {
  const a = rnd() * 6, b = rnd() * 6, f1 = 0.012 + rnd() * 0.01, f2 = 0.03 + rnd() * 0.02;
  let d = `M0 ${SCENE_H}`;
  for (let x = 0; x <= SCENE_W; x += 8) {
    const y = base - amp * (Math.sin(x * f1 + a) * 0.7 + Math.sin(x * f2 + b) * 0.3);
    d += ` L${x} ${y.toFixed(1)}`;
  }
  return `<path d="${d} L${SCENE_W} ${SCENE_H}Z" fill="${color}" opacity="${opacity}"/>`;
}

// کوه‌های تیز؛ snow: رنگ برف روی قله‌ها
function sceneMountains(rnd, color, base, height, count, snow) {
  let d = `M0 ${SCENE_H} L0 ${base}`;
  const tops = [];
  const step = SCENE_W / count;
  for (let i = 0; i < count; i++) {
    const x = step * (i + 0.3 + rnd() * 0.4);
    const y = base - height * (0.55 + rnd() * 0.45);
    tops.push([x, y]);
    d += ` L${x.toFixed(1)} ${y.toFixed(1)} L${(step * (i + 1)).toFixed(1)} ${(base - rnd() * height * 0.25).toFixed(1)}`;
  }
  let out = `<path d="${d} L${SCENE_W} ${SCENE_H}Z" fill="${color}"/>`;
  if (snow) {
    for (const [x, y] of tops) {
      const h = (base - y) * 0.28;
      out += `<path d="M${x} ${y} L${x - h * 0.8} ${y + h} L${x - h * 0.3} ${y + h * 0.8} L${x} ${y + h * 1.1} L${x + h * 0.35} ${y + h * 0.75} L${x + h * 0.8} ${y + h}Z" fill="${snow}"/>`;
    }
  }
  return out;
}

function sceneTrees(rnd, color, base, count, kind) {
  let out = "";
  for (let i = 0; i < count; i++) {
    const x = (SCENE_W / count) * (i + 0.2 + rnd() * 0.6);
    const s = 0.7 + rnd() * 0.6;
    const y = base + rnd() * 6;
    if (kind === "cypress") {
      out += `<path d="M${x} ${y - 34 * s} C${x + 7 * s} ${y - 20 * s} ${x + 6 * s} ${y - 4 * s} ${x} ${y} C${x - 6 * s} ${y - 4 * s} ${x - 7 * s} ${y - 20 * s} ${x} ${y - 34 * s}Z" fill="${color}"/>`;
    } else if (kind === "pine") {
      out += `<path d="M${x} ${y - 30 * s} L${x + 9 * s} ${y - 8 * s} L${x + 4 * s} ${y - 8 * s} L${x + 11 * s} ${y + 2} L${x - 11 * s} ${y + 2} L${x - 4 * s} ${y - 8 * s} L${x - 9 * s} ${y - 8 * s}Z" fill="${color}"/>`;
    } else if (kind === "palm") {
      const tx = x + 6 * s, ty = y - 34 * s;
      out += `<path d="M${x} ${y} Q${x + 2 * s} ${y - 18 * s} ${tx} ${ty}" stroke="${color}" stroke-width="${2.4 * s}" fill="none"/>`;
      for (const [dx, dy] of [[-16, 2], [-12, 8], [14, 3], [11, 9], [-4, -8], [6, -7]]) {
        out += `<path d="M${tx} ${ty} Q${tx + dx * 0.5 * s} ${ty + (dy - 8) * 0.6 * s} ${tx + dx * s} ${ty + dy * s}" stroke="${color}" stroke-width="${1.8 * s}" fill="none" stroke-linecap="round"/>`;
      }
    } else {
      // درخت گرد (باغ)
      out += `<rect x="${x - 1.2 * s}" y="${y - 10 * s}" width="${2.4 * s}" height="${10 * s}" fill="${color}"/><circle cx="${x}" cy="${y - 16 * s}" r="${9 * s}" fill="${color}"/>`;
    }
  }
  return out;
}

function sceneStars(rnd, count, maxY) {
  let out = "";
  for (let i = 0; i < count; i++) {
    out += `<circle cx="${(rnd() * SCENE_W).toFixed(1)}" cy="${(rnd() * maxY).toFixed(1)}" r="${(0.4 + rnd() * 0.8).toFixed(2)}" fill="#fff" opacity="${(0.4 + rnd() * 0.6).toFixed(2)}"/>`;
  }
  return out;
}

function sceneWater(color, top, lines) {
  let out = `<rect x="0" y="${top}" width="${SCENE_W}" height="${SCENE_H - top}" fill="${color}"/>`;
  for (let i = 0; i < 5; i++) {
    const y = top + 6 + i * ((SCENE_H - top) / 5);
    const x = 30 + ((i * 97) % 220);
    out += `<path d="M${x} ${y} h${26 - i * 3}" stroke="${lines}" stroke-width="1" stroke-linecap="round" opacity=".6"/>`;
  }
  return out;
}

const sceneSun = (x, y, r, color, glow) =>
  `<circle cx="${x}" cy="${y}" r="${r * 2.4}" fill="${glow}" opacity=".35"/><circle cx="${x}" cy="${y}" r="${r}" fill="${color}"/>`;

const sceneMoon = (x, y, r, sky) =>
  `<circle cx="${x}" cy="${y}" r="${r}" fill="#fdf3d0"/><circle cx="${x + r * 0.45}" cy="${y - r * 0.2}" r="${r * 0.9}" fill="${sky}"/>`;

const SCENES = {
  dawn: (rnd) => ({
    sky: ["#f6b693", "#fde6c8"],
    art: sceneSun(220, 82, 16, "#fff4d0", "#ffd7a0") +
      sceneHills(rnd, "#e9a985", 80, 10) + sceneHills(rnd, "#c98a72", 92, 9) + sceneHills(rnd, "#8f6460", 106, 7),
  }),
  orchard: (rnd) => ({
    sky: ["#9fd0e8", "#e4f3ea"],
    art: sceneSun(60, 30, 11, "#fffbe0", "#fff3b0") +
      sceneHills(rnd, "#a9cf9a", 82, 8) +
      `<path d="M0 96 H320 V120 H0Z" fill="#c9a77c"/><path d="M0 96 H320" stroke="#a88560" stroke-width="2"/>` +
      sceneTrees(rnd, "#5f9a5a", 92, 9, "round") + sceneTrees(rnd, "#3f6f45", 98, 5, "cypress"),
  }),
  sea: (rnd) => ({
    sky: ["#7ec4d8", "#d8f0ee"],
    art: sceneSun(250, 34, 12, "#fffbe8", "#fff0c0") +
      sceneHills(rnd, "#4f8f6a", 66, 14) + sceneTrees(rnd, "#2f6b4a", 68, 14, "pine") +
      sceneWater("#3f97b0", 76, "#d9f3f7") + `<path d="M0 104 Q80 98 160 104 T320 102 V120 H0Z" fill="#e8d7a8"/>`,
  }),
  desert: (rnd) => ({
    sky: ["#f3b46a", "#fbe3b0"],
    art: sceneSun(80, 46, 18, "#fff6dc", "#ffd890") +
      sceneHills(rnd, "#e8b878", 84, 12) + sceneHills(rnd, "#d79a5c", 96, 10) + sceneHills(rnd, "#b77a44", 110, 8),
  }),
  forest: (rnd) => ({
    sky: ["#b9cfc8", "#e9efe8"],
    art: sceneHills(rnd, "#9ab5a6", 60, 14, 0.8) + sceneTrees(rnd, "#7d9d8c", 72, 16, "pine") +
      `<rect x="0" y="62" width="320" height="18" fill="#fff" opacity=".35"/>` +
      sceneHills(rnd, "#55806a", 92, 8) + sceneTrees(rnd, "#2f5a46", 104, 12, "pine"),
  }),
  damavand: (rnd) => ({
    sky: ["#7fb2dc", "#dceaf4"],
    art: `<path d="M70 120 L150 34 Q160 26 170 34 L260 120Z" fill="#7a6f80"/>` +
      `<path d="M150 34 Q160 26 170 34 L186 52 L176 48 L168 56 L160 47 L150 55 L144 46 L134 52Z" fill="#fbfdff"/>` +
      sceneHills(rnd, "#8fae7c", 98, 8) + sceneHills(rnd, "#5f8a5a", 110, 6),
  }),
  paddy: (rnd) => ({
    sky: ["#a8d8e0", "#eaf6e4"],
    art: sceneSun(250, 30, 10, "#fffbe8", "#fff0c0") + sceneHills(rnd, "#6e9f6a", 58, 12) +
      [0, 1, 2, 3, 4].map((i) => {
        const y = 70 + i * 11;
        return `<path d="M0 ${y} Q160 ${y - 6} 320 ${y + 2} V120 H0Z" fill="${["#b8d98a", "#9cc874", "#86b95e", "#71a84f", "#5f9642"][i]}"/><path d="M0 ${y} Q160 ${y - 6} 320 ${y + 2}" stroke="#d8eec0" stroke-width="1" fill="none" opacity=".8"/>`;
      }).join(""),
  }),
  palms: (rnd) => ({
    sky: ["#f0c27a", "#fff0cc"],
    art: sceneSun(240, 50, 16, "#fff7dd", "#ffe0a0") +
      sceneHills(rnd, "#e2b87e", 96, 6) + sceneTrees(rnd, "#6b5a3a", 98, 7, "palm") + sceneHills(rnd, "#c99a5e", 112, 4),
  }),
  caravanserai: (rnd) => ({
    sky: ["#e79b6b", "#f9d9a8"],
    art: sceneSun(250, 58, 15, "#fff1cf", "#ffc890") + sceneHills(rnd, "#d79f6e", 92, 6) +
      `<g fill="#8a5a3e"><rect x="70" y="70" width="150" height="30"/><rect x="62" y="62" width="12" height="38"/><rect x="216" y="62" width="12" height="38"/>` +
      `<path d="M130 100 V82 Q145 66 160 82 V100Z" fill="#5a3826"/><rect x="128" y="66" width="34" height="6"/></g>` +
      `<g fill="#5a3826">${[0, 1, 2, 3, 4].map((i) => `<path d="M${82 + i * 10} 92 v-8 q4-5 8 0 v8Z"/><path d="M${172 + i * 9} 92 v-8 q3.5-5 7 0 v8Z"/>`).join("")}</g>` +
      sceneHills(rnd, "#b98256", 112, 4),
  }),
  lake: (rnd) => ({
    sky: ["#f2a48a", "#f8dcc4"],
    art: sceneSun(160, 70, 14, "#fff1d8", "#ffc8a0") +
      sceneMountains(rnd, "#9a7c8c", 74, 30, 5) +
      `<rect x="0" y="74" width="320" height="46" fill="#c9a0a8"/><path d="M150 80 h20 M146 88 h28 M152 96 h16" stroke="#fff1d8" stroke-width="2" stroke-linecap="round" opacity=".7"/>` +
      sceneHills(rnd, "#6e5a6a", 110, 5),
  }),
  snow: (rnd) => ({
    sky: ["#1f3159", "#6f87b3"],
    art: sceneStars(rnd, 40, 50) + sceneMoon(250, 26, 9, "#2a3d68") +
      sceneMountains(rnd, "#8fa3c4", 86, 52, 4, "#f2f6ff") + sceneMountains(rnd, "#5d7299", 100, 30, 6, "#dfe7f5") +
      sceneHills(rnd, "#e8eef8", 110, 4),
  }),
  night: (rnd) => ({
    sky: ["#141a3a", "#3b3f6e"],
    art: sceneStars(rnd, 60, 70) + sceneMoon(70, 30, 10, "#1c2248") +
      `<g fill="#0e1230"><rect x="0" y="92" width="320" height="28"/>` +
      `<path d="M120 92 V74 Q140 50 160 74 V92Z"/><rect x="139" y="46" width="2" height="8"/>` +
      `<rect x="96" y="56" width="8" height="36"/><path d="M95 56 h10 l-5 -8Z"/><rect x="176" y="56" width="8" height="36"/><path d="M175 56 h10 l-5 -8Z"/>` +
      `<rect x="20" y="80" width="40" height="12"/><rect x="220" y="78" width="60" height="14"/><path d="M240 78 q10 -14 20 0Z"/></g>` +
      `<g fill="#f6d27a" opacity=".8"><rect x="30" y="84" width="3" height="4"/><rect x="232" y="83" width="3" height="4"/><rect x="262" y="83" width="3" height="4"/><rect x="146" y="80" width="3" height="5"/></g>`,
  }),
};

// منظره‌ی فصل c به شکل یک SVG کامل
function chapterScene(c) {
  const info = chapterInfo(c);
  const make = SCENES[info.scene] || SCENES.dawn;
  const { sky, art } = make(seededRandom(4242 + (c % CHAPTERS.length)));
  const id = "sky" + c;
  return `<svg class="chapter-scene" viewBox="0 0 ${SCENE_W} ${SCENE_H}" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky[0]}"/><stop offset="1" stop-color="${sky[1]}"/></linearGradient></defs>
    <rect width="${SCENE_W}" height="${SCENE_H}" fill="url(#${id})"/>${art}</svg>`;
}

// «فصل ۳ · ساحل خزر»
function chapterTitle(c) {
  return `فصل ${faDigits(c + 1)} · ${chapterInfo(c).name}`;
}

// چند مرحله از این فصل تمام شده
function chapterDone(c) {
  return Math.max(0, Math.min(CHAPTER_SIZE, save.unlocked - c * CHAPTER_SIZE));
}

// آیا تمام کردن مرحله‌ی level (برای بار اول) یک فصل را تمام می‌کند؟
const endsChapter = (level) => (level + 1) % CHAPTER_SIZE === 0;

// کارت فصل در نقشه‌ی مرحله‌ها
function chapterBanner(c) {
  const done = chapterDone(c);
  const el = document.createElement("div");
  el.className = "chapter-banner" + (done === 0 && save.unlocked < c * CHAPTER_SIZE ? " locked" : "") + (done === CHAPTER_SIZE ? " complete" : "");
  el.innerHTML = chapterScene(c) + `<div class="chapter-info"><b></b><span></span></div>`;
  el.querySelector("b").textContent = chapterTitle(c);
  el.querySelector("span").textContent = done === CHAPTER_SIZE ? "✓ تمام شد" : `${faDigits(done)} از ${faDigits(CHAPTER_SIZE)}`;
  return el;
}

// تکه‌ی پایان فصل در پنجره‌ی پایان مرحله
function chapterDoneCard(level) {
  const c = chapterOf(level);
  const el = document.createElement("div");
  el.className = "extra chapter-done";
  el.innerHTML = chapterScene(c) + `<div class="chapter-done-text"><b></b><span></span></div>`;
  el.querySelector("b").textContent = `فصل «${chapterInfo(c).name}» تمام شد!`;
  el.querySelector("span").textContent = `فصل بعد: «${chapterInfo(c + 1).name}»`;
  return el;
}
