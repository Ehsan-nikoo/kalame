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

// «آ» و «ا» در ساختن کلمه یک حرف حساب می‌شوند: بازیکن با هر کدام از این دو خانه‌ی دایره
// می‌تواند کلمه‌ای را که «آ» یا «ا» دارد بسازد. در جدول، کلمه با املای درستش نشان داده می‌شود.
function fold(text) {
  return text.replace(/آ/g, "ا");
}

// شمارش حروف برای «ساخته می‌شود یا نه»، با یکی دانستن «آ» و «ا»
function letterCounts(chars) {
  return countLetters(fold(Array.isArray(chars) ? chars.join("") : chars));
}

function canMake(need, have) {
  for (const ch in need) if ((have[ch] || 0) < need[ch]) return false;
  return true;
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
    const available = letterCounts(letters);
    const words = [];

    for (const raw of parts[1].split(/[،,]+/)) {
      const word = normalize(raw);
      if (!word) continue;
      if (word.length < 2) {
        errors.push(`خط ${lineNo}: کلمه‌ی «${word}» خیلی کوتاه است.`);
        continue;
      }
      if (!canMake(letterCounts(word), available)) {
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

// maxNodes: سقف جست‌وجو؛ سازنده‌ی مرحله برای سرعت با سقف خیلی کمتری امتحان می‌کند.
// خروجی connected نشان می‌دهد همه‌ی کلمه‌ها به هم وصل شده‌اند یا نه.
function buildLayout(words, maxNodes = 8000) {
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
    // جدولی که از صفحه‌ی گوشی بیرون بزند، بدترین امتیاز را می‌گیرد
    const tooBig = w > MAX_GRID || h > MAX_GRID ? 10000 : 0;
    return w * h + Math.abs(w - h) * 3 + tooBig;
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

// خروجی: dict (Map از کلمه به معنی‌اش) و levels (Map از کلمه به میزان آشنایی: ۱ رایج، ۲ کمتر رایج)
// شکل هر خط:  کلمه | معنی  یا  کلمه | معنی | ۲
function parseWords(text) {
  const dict = new Map();
  const levels = new Map();
  const errors = [];
  text.split(/\r?\n/).forEach((rawLine, i) => {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) return;
    const parts = line.split("|");
    const word = normalize(parts[0]);
    let level = 1;
    if (parts.length > 2) {
      const mark = parts[parts.length - 1].trim().replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d));
      if (/^[12]$/.test(mark)) {
        level = Number(mark);
        parts.pop();
      }
    }
    const meaning = parts.slice(1).join("|").trim();
    if (word.length < 2 || ![...word].every((ch) => ALPHABET.includes(ch))) {
      errors.push(`خط ${faDigits(i + 1)}: «${word}» کلمه‌ی درستی نیست.`);
      return;
    }
    if (!dict.has(word)) {
      dict.set(word, meaning);
      levels.set(word, level);
    }
  });
  return { dict, levels, errors };
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

// سختی بر اساس طول کلمه‌ی اصلی: تعداد کلمه‌های جدول، کوتاه‌ترین کلمه‌ی مجاز،
// و بیشترین تعداد کلمه‌ی دوحرفی در جدول (تا جدول پر از کلمه‌های خیلی کوتاه نشود)
const TIERS = {
  4: { min: 3, max: 5, shortest: 2, twos: 2 },
  5: { min: 4, max: 6, shortest: 2, twos: 1 },
  6: { min: 5, max: 7, shortest: 3, twos: 0 },
  7: { min: 5, max: 8, shortest: 3, twos: 0 },
};
// وقتی کلمه‌های ساختنی خیلی زیادند، چند کلمه‌ی بیشتر به جدول می‌آید تا بیشترشان «جایزه» نمانند
const MAX_EXTRA = 2;
const MAX_WORDS = 9; // بیشترین کلمه‌ی جدول، تا چیدن جدول روی گوشی‌های ضعیف کند نشود
// میزان آشنایی: کلمه‌های «کمتر رایج» (۲) از این مرحله‌ها به بعد وارد جدول می‌شوند (شماره از صفر،
// بعد از مرحله‌های دست‌ساز). اول به‌عنوان کلمه‌ی فرعی، بعد به‌عنوان کلمه‌ی اصلی.
const RARE_WORDS_FROM = 50;
const RARE_SEEDS_FROM = 150;
const MAX_GRID = 9; // بیشترین سطر یا ستون جدول، تا روی صفحه‌ی گوشی جا شود

function createGenerator(dict, levels = new Map()) {
  const levelOf = (w) => levels.get(w) || 1;
  const entries = [...dict.keys()].map((w) => ({ w, need: letterCounts(w) }));
  const subCache = new Map();

  // همه‌ی کلمه‌های فهرست که از این حروف ساخته می‌شوند
  function wordsFrom(letters) {
    const key = [...fold(letters)].sort().join("");
    if (!subCache.has(key)) {
      const have = letterCounts(letters);
      subCache.set(key, entries.filter((e) => e.w.length <= letters.length && canMake(e.need, have)).map((e) => e.w));
    }
    return subCache.get(key);
  }

  // کلمه‌هایی که می‌توانند در جدول این کلمه‌ی اصلی بیایند (با رعایت سقف کلمه‌های دوحرفی)
  function usableCount(seed, rareOk) {
    const tier = TIERS[seed.length];
    let longs = 0, twos = 0;
    for (const w of wordsFrom(seed)) {
      if (w === seed || w.length < tier.shortest || (!rareOk && levelOf(w) > 1)) continue;
      if (w.length === 2) twos++;
      else longs++;
    }
    return 1 + longs + Math.min(twos, tier.twos); // ۱ برای خود کلمه‌ی اصلی
  }

  // کلمه‌های اصلی هر طول؛ از هر دسته‌ی حروف یکسان فقط یکی، با ترتیب ثابت ولی درهم.
  // اول کلمه‌های رایج می‌آیند و بعد کلمه‌های کمتر رایج، تا بازی کم‌کم سخت‌تر شود.
  const seeds = {};
  for (const len of [4, 5, 6, 7]) {
    const seen = new Set();
    const common = [];
    const rare = [];
    for (const { w } of entries) {
      if (w.length !== len) continue;
      const key = [...fold(w)].sort().join("");
      if (seen.has(key)) continue;
      const isRare = levelOf(w) > 1;
      // کلمه‌ی اصلی رایج باید فقط با کلمه‌های رایج هم جدول کامل بسازد
      if (usableCount(w, isRare) < TIERS[len].min) continue;
      seen.add(key);
      (isRare ? rare : common).push(w);
    }
    const rnd = seededRandom(1000 + len);
    seeds[len] = [...shuffled(common.sort(), rnd), ...shuffled(rare.sort(), rnd)];
    seeds[len].common = common.length;
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
  function pickWords(seed, rnd, rareOk) {
    const tier = TIERS[seed.length];
    // کلمه‌های بلندتر اول امتحان می‌شوند، با کمی جابه‌جایی تصادفی تا مرحله‌ها شبیه هم نشوند
    const pool = wordsFrom(seed)
      .filter((w) => w !== seed && w.length >= tier.shortest && (rareOk || levelOf(w) === 1))
      .map((w) => ({ w, k: w.length + rnd() * 1.5 }))
      .sort((a, b) => b.k - a.k)
      .map((x) => x.w);
    // اگر کلمه‌های ساختنی خیلی بیشتر از جای جدول باشند، جدول کمی بزرگ‌تر می‌شود
    const spare = pool.length - tier.max;
    const extra = Math.max(0, Math.min(MAX_EXTRA, Math.floor(spare / 4)));
    const base = tier.min + Math.floor(rnd() * (tier.max - tier.min + 1));
    const target = Math.min(base + extra, MAX_WORDS);
    const picked = [seed];
    let twos = 0;
    let misses = 0;
    for (const w of pool) {
      if (picked.length >= target) break;
      // برای سرعت: اگر جدول به اندازه‌ی کافی کلمه دارد و چند کلمه‌ی پشت سر هم جا نشدند، بس است
      if (picked.length >= tier.min && misses >= 4) break;
      if (w.length === 2 && twos >= tier.twos) continue;
      const layout = buildLayout([...picked, w], 800);
      if (layout.connected && layout.rows <= MAX_GRID && layout.cols <= MAX_GRID) {
        picked.push(w);
        if (w.length === 2) twos++;
        misses = 0;
      } else {
        misses++;
      }
    }
    return picked;
  }

  return {
    seeds,
    wordsFrom,
    levelOf,

    // مرحله‌ی شماره‌ی level (از صفر)، برای مرحله‌های ۱۱ به بعد
    level(level) {
      const g = level - HANDMADE_LEVELS;
      const len = lengthFor(g);
      const turn = turnOf(g, len);
      const list = seeds[len];
      const rareOk = g >= RARE_WORDS_FROM;
      // تا مرحله‌ی RARE_SEEDS_FROM فقط کلمه‌های اصلی رایج؛ بعد از آن همه‌ی فهرست
      const span = g < RARE_SEEDS_FROM && list.common ? list.common : list.length;
      const round = Math.floor(turn / span); // بعد از تمام شدن کلمه‌ها، دور بعد کلمه‌های دیگری انتخاب می‌شود
      let best = null;
      // اگر جدول این کلمه‌ی اصلی کم‌کلمه شد، کلمه‌ی اصلی بعدی امتحان می‌شود
      for (let k = 0; k < 8; k++) {
        const seed = list[(turn + k) % span];
        const rnd = seededRandom(hashText(seed) + round * 7919 + g);
        const words = pickWords(seed, rnd, rareOk || levelOf(seed) > 1);
        if (!best || words.length > best.words.length) best = { letters: shuffled([...seed], rnd), words, seed };
        if (words.length >= TIERS[len].min) break;
      }
      return best;
    },

    // کلمه‌های جایزه: کلمه‌های فهرست که از حروف مرحله ساخته می‌شوند ولی در جدول نیستند
    bonusWords(level) {
      return wordsFrom(level.letters.join("")).filter((w) => !level.words.includes(w));
    },
  };
}

if (typeof module === "object" && module.exports) {
  module.exports = { normalize, fold, letterCounts, canMake, faDigits, countLetters, parseLevels, buildLayout, parseWords, createGenerator, HANDMADE_LEVELS };
}

