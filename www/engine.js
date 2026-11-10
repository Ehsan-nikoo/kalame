"use strict";

// موتور بازی «کلمه»: ابزارهای فارسی، خواندن فایل‌ها، چیدن جدول و ساختن خودکار مرحله‌ها.
// این فایل به صفحه وابسته نیست، پس هم در بازی و هم در آزمون‌های خودکار (Node) اجرا می‌شود.

// ---------------------------------------------------------------------------
// ابزارهای فارسی
// ---------------------------------------------------------------------------

// «ي» و «ى» عربی ← «ی» فارسی، «ك» عربی ← «ک» فارسی،
// و حذف اعراب، کشیده (ـ)، نیم‌فاصله و فاصله.
function normalize(text) {
  return text
    .replace(/[يى]/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/[\p{Mn}\p{Cf}ـ\s]/gu, "");
}

function faDigits(n) {
  return String(n).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[d]);
}

function countLetters(chars) {
  const counts = {};
  for (const ch of chars) counts[ch] = (counts[ch] || 0) + 1;
  return counts;
}

// ---------------------------------------------------------------------------
// خواندن فایل مرحله‌ها
// ---------------------------------------------------------------------------

function parseLevels(text) {
  const levels = [];
  const errors = [];

  text.split(/\r?\n/).forEach((rawLine, i) => {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) return;
    const lineNo = faDigits(i + 1);

    const parts = line.split("|");
    if (parts.length !== 2) {
      errors.push(`خط ${lineNo}: باید یک «|» بین حروف و کلمه‌ها باشد.`);
      return;
    }

    const letters = [...normalize(parts[0])];
    const available = countLetters(letters);
    const words = [];

    for (const raw of parts[1].split(/[،,]+/)) {
      const word = normalize(raw);
      if (!word) continue;
      if (word.length < 2) {
        errors.push(`خط ${lineNo}: کلمه‌ی «${word}» خیلی کوتاه است.`);
        continue;
      }
      const need = countLetters(word);
      const ok = Object.keys(need).every((ch) => (available[ch] || 0) >= need[ch]);
      if (!ok) {
        errors.push(`خط ${lineNo}: کلمه‌ی «${word}» با حروف «${letters.join(" ")}» ساخته نمی‌شود.`);
        continue;
      }
      if (!words.includes(word)) words.push(word);
    }

    if (letters.length < 2 || words.length === 0) {
      errors.push(`خط ${lineNo}: این مرحله حروف یا کلمه‌ی درست ندارد.`);
      return;
    }
    levels.push({ letters, words });
  });

  return { levels, errors };
}

// ---------------------------------------------------------------------------
// چیدن خودکار جدول (مثل جدول کلمات متقاطع)
// ---------------------------------------------------------------------------
// ستون صفر سمت راست جدول است، پس کلمه‌های افقی از راست به چپ خوانده می‌شوند.

// maxNodes: سقف جست‌وجو؛ سازنده‌ی مرحله برای سرعت با سقف کمتری امتحان می‌کند.
// خروجی connected نشان می‌دهد همه‌ی کلمه‌ها به هم وصل شده‌اند یا نه.
function buildLayout(words, maxNodes = 60000) {
  const order = [...words].sort((a, b) => b.length - a.length);
  const cells = new Map(); // "r,c" -> { ch, h, v }
  const placed = [];
  let best = null;
  let nodes = 0;

  const key = (r, c) => r + "," + c;
  const step = (dir) => (dir === "h" ? [0, 1] : [1, 0]);

  function check(word, r, c, dir) {
    const [dr, dc] = step(dir);
    if (cells.has(key(r - dr, c - dc))) return -1;
    if (cells.has(key(r + dr * word.length, c + dc * word.length))) return -1;
    let crossings = 0;
    for (let i = 0; i < word.length; i++) {
      const rr = r + dr * i;
      const cc = c + dc * i;
      const cell = cells.get(key(rr, cc));
      if (cell) {
        if (cell.ch !== word[i] || cell[dir]) return -1;
        crossings++;
      } else if (cells.has(key(rr + dc, cc + dr)) || cells.has(key(rr - dc, cc - dr))) {
        return -1;
      }
    }
    return crossings;
  }

  function place(word, r, c, dir) {
    const [dr, dc] = step(dir);
    const added = [];
    for (let i = 0; i < word.length; i++) {
      const k = key(r + dr * i, c + dc * i);
      let cell = cells.get(k);
      if (!cell) {
        cell = { ch: word[i], h: false, v: false };
        cells.set(k, cell);
        added.push(k);
      }
      cell[dir] = true;
    }
    placed.push({ word, r, c, dir, added });
  }

  function unplace() {
    const p = placed.pop();
    const [dr, dc] = step(p.dir);
    for (let i = 0; i < p.word.length; i++) {
      const cell = cells.get(key(p.r + dr * i, p.c + dc * i));
      if (cell) cell[p.dir] = false;
    }
    for (const k of p.added) cells.delete(k);
  }

  function score() {
    let minR = Infinity, maxR = -Infinity, minC = Infinity, maxC = -Infinity;
    for (const k of cells.keys()) {
      const [r, c] = k.split(",").map(Number);
      minR = Math.min(minR, r); maxR = Math.max(maxR, r);
      minC = Math.min(minC, c); maxC = Math.max(maxC, c);
    }
    const h = maxR - minR + 1;
    const w = maxC - minC + 1;
    return w * h + Math.abs(w - h) * 3;
  }

  function search(index) {
    if (++nodes > maxNodes) return;
    if (index === order.length) {
      const s = score();
      if (!best || s < best.score) {
        best = { score: s, items: placed.map(({ word, r, c, dir }) => ({ word, r, c, dir })) };
      }
      return;
    }
    const word = order[index];
    if (index === 0) {
      place(word, 0, 0, "h");
      search(1);
      unplace();
      return;
    }
    const tried = new Set();
    for (const [k, cell] of [...cells.entries()]) {
      const [cr, cc] = k.split(",").map(Number);
      for (let i = 0; i < word.length; i++) {
        if (word[i] !== cell.ch) continue;
        for (const dir of ["v", "h"]) {
          if (cell[dir]) continue;
          const r = dir === "v" ? cr - i : cr;
          const c = dir === "h" ? cc - i : cc;
          const id = `${r},${c},${dir}`;
          if (tried.has(id)) continue;
          tried.add(id);
          if (check(word, r, c, dir) < 1) continue;
          place(word, r, c, dir);
          search(index + 1);
          unplace();
        }
      }
    }
  }

  search(0);

  let items;
  if (best) {
    items = best.items;
  } else {
    // اگر کلمه‌ها با هم حرف مشترک نداشتند، هر کلمه را در یک ردیف جدا می‌گذاریم.
    items = order.map((word, i) => ({ word, r: i * 2, c: 0, dir: "h" }));
  }

  const minR = Math.min(...items.map((p) => p.r));
  const minC = Math.min(...items.map((p) => p.c));
  let rows = 0, cols = 0;
  const placements = {};
  for (const p of items) {
    const [dr, dc] = step(p.dir);
    const keys = [];
    for (let i = 0; i < p.word.length; i++) {
      const r = p.r - minR + dr * i;
      const c = p.c - minC + dc * i;
      rows = Math.max(rows, r + 1);
      cols = Math.max(cols, c + 1);
      keys.push({ r, c, ch: p.word[i] });
    }
    placements[p.word] = keys;
  }
  return { rows, cols, placements, connected: !!best };
}

// ---------------------------------------------------------------------------
// فهرست کلمه‌ها (words.txt)
// ---------------------------------------------------------------------------

const ALPHABET = "آابپتثجچحخدذرزژسشصضطظعغفقکگلمنوهی";

// خروجی: Map از کلمه به معنی‌اش
function parseWords(text) {
  const dict = new Map();
  const errors = [];
  text.split(/\r?\n/).forEach((rawLine, i) => {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) return;
    const bar = line.indexOf("|");
    const word = normalize(bar < 0 ? line : line.slice(0, bar));
    const meaning = bar < 0 ? "" : line.slice(bar + 1).trim();
    if (word.length < 2 || ![...word].every((ch) => ALPHABET.includes(ch))) {
      errors.push(`خط ${faDigits(i + 1)}: «${word}» کلمه‌ی درستی نیست.`);
      return;
    }
    if (!dict.has(word)) dict.set(word, meaning);
  });
  return { dict, errors };
}

// ---------------------------------------------------------------------------
// ساختن خودکار مرحله‌ها
// ---------------------------------------------------------------------------
// هر مرحله با شماره‌اش ساخته می‌شود و همیشه همان می‌ماند (برای همه‌ی بازیکن‌ها و هر بار).
// روش: یک «کلمه‌ی اصلی» برمی‌داریم؛ حروفش حروف دایره می‌شود. از کلمه‌هایی که با همین حروف
// ساخته می‌شوند چند تا را انتخاب می‌کنیم که در جدول متقاطع به هم وصل شوند.

const HANDMADE_LEVELS = 10; // مرحله‌های ۱ تا ۱۰ از levels.txt می‌آیند

// عدد تصادفی قابل‌تکرار: با یک عدد شروع یکسان، همیشه همان دنباله را می‌دهد
function seededRandom(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashText(text) {
  let h = 2166136261;
  for (const ch of text) h = Math.imul(h ^ ch.codePointAt(0), 16777619);
  return h >>> 0;
}

function shuffled(list, rnd) {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function canMake(need, have) {
  for (const ch in need) if ((have[ch] || 0) < need[ch]) return false;
  return true;
}

// سختی بر اساس طول کلمه‌ی اصلی: تعداد کلمه‌های جدول و کوتاه‌ترین کلمه‌ی مجاز
const TIERS = {
  4: { min: 3, max: 5, shortest: 2 },
  5: { min: 4, max: 6, shortest: 2 },
  6: { min: 5, max: 7, shortest: 3 },
  7: { min: 5, max: 8, shortest: 3 },
};
const MAX_GRID = 9; // بیشترین سطر یا ستون جدول، تا روی صفحه‌ی گوشی جا شود

function createGenerator(dict) {
  const entries = [...dict.keys()].map((w) => ({ w, need: countLetters(w) }));
  const subCache = new Map();

  // همه‌ی کلمه‌های فهرست که از این حروف ساخته می‌شوند
  function wordsFrom(letters) {
    const key = [...letters].sort().join("");
    if (!subCache.has(key)) {
      const have = countLetters(letters);
      subCache.set(key, entries.filter((e) => e.w.length <= letters.length && canMake(e.need, have)).map((e) => e.w));
    }
    return subCache.get(key);
  }

  // کلمه‌های اصلی هر طول؛ از هر دسته‌ی حروف یکسان فقط یکی، با ترتیب ثابت ولی درهم
  const seeds = {};
  for (const len of [4, 5, 6, 7]) {
    const seen = new Set();
    const list = [];
    for (const { w } of entries) {
      if (w.length !== len) continue;
      const key = [...w].sort().join("");
      if (seen.has(key)) continue;
      const usable = wordsFrom(w).filter((s) => s.length >= TIERS[len].shortest);
      if (usable.length < TIERS[len].min) continue;
      seen.add(key);
      list.push(w);
    }
    seeds[len] = shuffled(list.sort(), seededRandom(1000 + len));
  }

  // طول کلمه‌ی اصلی برای مرحله‌ی ساخته‌شده‌ی شماره‌ی g (از صفر)
  function lengthFor(g) {
    let len;
    if (g < 20) len = 4;
    else if (g < 60) len = 5;
    else {
      const r = seededRandom(7000 + g)();
      len = g < 140 ? (r < 0.6 ? 5 : 6) : r < 0.3 ? 5 : r < 0.75 ? 6 : 7;
    }
    while (!seeds[len].length && len > 4) len--;
    return len;
  }

  const lengths = [];
  function turnOf(g, len) {
    // چندمین مرحله با این طول است؛ برای اینکه کلمه‌ی اصلی تکراری نشود
    while (lengths.length <= g) lengths.push(lengthFor(lengths.length));
    let n = 0;
    for (let i = 0; i < g; i++) if (lengths[i] === len) n++;
    return n;
  }

  // از میان کلمه‌های ساختنی، تعدادی را انتخاب می‌کند که جدول متقاطعِ به‌هم‌وصل بسازند
  function pickWords(seed, rnd, extra = 0) {
    const tier = TIERS[seed.length];
    const target = Math.min(tier.min + Math.floor(rnd() * (tier.max - tier.min + 1)) + extra, tier.max);
    // کلمه‌های بلندتر اول امتحان می‌شوند، با کمی جابه‌جایی تصادفی تا مرحله‌ها شبیه هم نشوند
    const pool = wordsFrom(seed)
      .filter((w) => w !== seed && w.length >= tier.shortest)
      .map((w) => ({ w, k: w.length + rnd() * 1.5 }))
      .sort((a, b) => b.k - a.k)
      .map((x) => x.w);
    const picked = [seed];
    for (const w of pool) {
      if (picked.length >= target) break;
      const layout = buildLayout([...picked, w], 6000);
      if (layout.connected && layout.rows <= MAX_GRID && layout.cols <= MAX_GRID) picked.push(w);
    }
    return picked;
  }

  function makeLevel(seed, rnd, extra) {
    const words = pickWords(seed, rnd, extra);
    return { letters: shuffled([...seed], rnd), words, seed };
  }

  return {
    seeds,
    wordsFrom,

    // مرحله‌ی شماره‌ی level (از صفر)، برای مرحله‌های ۱۱ به بعد
    level(level) {
      const g = level - HANDMADE_LEVELS;
      const len = lengthFor(g);
      const turn = turnOf(g, len);
      const list = seeds[len];
      const seed = list[turn % list.length];
      const round = Math.floor(turn / list.length); // بعد از تمام شدن کلمه‌ها، دور بعد کلمه‌های دیگری انتخاب می‌شود
      return makeLevel(seed, seededRandom(hashText(seed) + round * 7919 + g), 0);
    },

    // کلمه‌های جایزه: کلمه‌های فهرست که از حروف مرحله ساخته می‌شوند ولی در جدول نیستند
    bonusWords(level) {
      return wordsFrom(level.letters.join("")).filter((w) => !level.words.includes(w));
    },
  };
}

if (typeof module === "object" && module.exports) {
  module.exports = { normalize, faDigits, countLetters, parseLevels, buildLayout, parseWords, createGenerator, HANDMADE_LEVELS };
}

