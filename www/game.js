"use strict";

// ---------------------------------------------------------------------------
// تنظیمات سکه و راهنما (برای تغییر، فقط همین عددها را عوض کنید)
// ---------------------------------------------------------------------------

const COINS_START = 50;        // هدیه‌ی شروع بازی
const COINS_PER_LEVEL = 10;    // فقط بار اولی که یک مرحله تمام می‌شود
const COST_HINT_LETTER = 10;   // باز کردن یک خانه
const COST_HINT_WORD = 25;     // باز کردن یک کلمه‌ی کامل

// ظاهرهای بازی؛ هر کدام (جز «ساده») یک فایل css و js در پوشه‌ی themes دارد
const THEMES = [
  { id: "stars", name: "صور فلکی", desc: "آسمان شب کویر و صورت‌های فلکی کتاب صوفی" },
  { id: "carpet", name: "قالی‌باف", desc: "با هر کلمه، گره به گره یک قالی بافته می‌شود" },
  { id: "caravan", name: "کاروان ابریشم", desc: "سفر با کاروان از کرمان تا ماسوله" },
  { id: "garden", name: "حوض و باغ", desc: "حوض ماهی‌ها و باغی که با هر مرحله گل می‌دهد" },
  { id: "ink", name: "قلم و مرکب", desc: "کاغذ کاهی، تذهیب و خط نستعلیق" },
  { id: "plain", name: "ساده", desc: "آرام و سبک، مناسب گوشی‌های ضعیف" },
];

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

function buildLayout(words) {
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
    if (++nodes > 60000) return;
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
    console.warn("جدول متقاطع برای این کلمه‌ها پیدا نشد:", words);
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
  return { rows, cols, placements };
}

// ---------------------------------------------------------------------------
// ذخیره‌ی پیشرفت، سکه و ظاهر
// ---------------------------------------------------------------------------
// unlocked: تعداد مرحله‌هایی که تمام شده‌اند (مرحله‌ی بعدی همین شماره است)
// partial: کلمه‌های پیدا شده و خانه‌های باز شده‌ی مرحله‌هایی که نیمه‌کاره مانده‌اند

const SAVE_KEY = "kalame-save";

function loadSave() {
  const fresh = { theme: null, unlocked: 0, coins: COINS_START, partial: {} };
  try {
    const data = JSON.parse(localStorage.getItem(SAVE_KEY));
    if (data && Number.isInteger(data.unlocked) && data.unlocked >= 0) {
      return {
        theme: typeof data.theme === "string" ? data.theme : null,
        unlocked: data.unlocked,
        coins: Number.isInteger(data.coins) && data.coins >= 0 ? data.coins : COINS_START,
        partial: data.partial && typeof data.partial === "object" ? data.partial : {},
      };
    }
    // پیشرفت نسخه‌ی اول بازی که فقط شماره‌ی مرحله را نگه می‌داشت
    const old = JSON.parse(localStorage.getItem("kalame-progress"));
    if (old && Number.isInteger(old.level) && old.level >= 0) {
      fresh.unlocked = old.level;
      if (Array.isArray(old.found) && old.found.length) fresh.partial[old.level] = { found: old.found, revealed: [] };
    }
  } catch (e) {}
  return fresh;
}

function persist() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(save));
  } catch (e) {}
}

// ---------------------------------------------------------------------------
// ظاهرها
// ---------------------------------------------------------------------------
// هر فایل themes/*.js با defineTheme خودش را معرفی می‌کند:
//   setup()       لایه‌های تزئینی را می‌سازد و یک تابع برای پاک کردنشان برمی‌گرداند
//   name(level)   اسم هر مرحله در این ظاهر (مثلاً اسم صورت فلکی یا شهر)
//   on: { level, submit, found, repeat, wrong, hint, shuffle, complete }  واکنش به اتفاق‌های بازی

const themeDefs = {};
let activeTheme = null;
let themeTeardown = null;

function defineTheme(id, def) {
  themeDefs[id] = def;
}

function applyTheme(id) {
  if (!THEMES.some((t) => t.id === id)) id = "plain";
  if (themeTeardown) themeTeardown();
  themeTeardown = null;
  activeTheme = id;
  document.documentElement.dataset.theme = id;
  const def = themeDefs[id];
  if (def && def.setup) themeTeardown = def.setup() || null;
}

function emit(name, detail) {
  const def = themeDefs[activeTheme];
  if (def && def.on && def.on[name]) def.on[name](detail);
}

function levelName(i) {
  const def = themeDefs[activeTheme];
  return def && def.name ? def.name(i) : "";
}

// ---------------------------------------------------------------------------
// وضعیت بازی
// ---------------------------------------------------------------------------

const $ = (id) => document.getElementById(id);
const boardEl = $("board");
const wheelEl = $("wheel");
const linesEl = $("wheelLines");
const previewEl = $("preview");

let levels = [];
let save = loadSave();
let current = null;     // شماره‌ی مرحله‌ای که الان بازی می‌شود
let found = [];         // کلمه‌های پیدا شده‌ی همین مرحله
let layout = null;
let cellEls = {};       // "r,c" -> عنصر خانه
let letterEls = [];     // عنصر هر حرف دایره (به ترتیب حروف مرحله)
let slots = [];         // جای هر حرف روی دایره
let path = [];          // حروفی که الان انگشت رویشان کشیده شده
let dragging = false;
let dragPointer = null; // فقط همان انگشتی که کشیدن را شروع کرده دنبال می‌شود
let pointer = null;
let previewTimer = null;
let locked = false;     // بین تمام شدن مرحله و شروع مرحله‌ی بعد
let screenNow = null;
let streak = 0;         // کلمه‌های درستِ پشت سر هم، برای پیام‌های تشویقی

function startLevel(i) {
  current = i;
  const level = levels[i];
  const part = save.partial[i] || {};
  found = (Array.isArray(part.found) ? part.found : []).filter((w) => level.words.includes(w));
  layout = buildLayout(level.words);

  const name = levelName(i);
  $("levelLabel").textContent = `مرحله‌ی ${faDigits(i + 1)}` + (name ? " · " + name : "");
  renderBoard();
  renderWheel();
  hidePreview();
  $("overlay").classList.add("hidden");
  locked = false;
  streak = 0;

  for (const k of Array.isArray(part.revealed) ? part.revealed : []) {
    if (cellEls[k]) revealCell(cellEls[k], false);
  }
  for (const w of found) fillWord(w, false);
  updateCoins();
  emit("level", { level: i });
}

function saveLevelState() {
  const revealed = Object.keys(cellEls).filter((k) => cellEls[k].classList.contains("hinted"));
  save.partial[current] = { found: [...found], revealed };
  persist();
}

// ---------- جدول ----------

function renderBoard() {
  boardEl.innerHTML = "";
  cellEls = {};
  boardEl.style.gridTemplateColumns = `repeat(${layout.cols}, var(--cell))`;

  const used = {};
  for (const keys of Object.values(layout.placements)) {
    for (const { r, c, ch } of keys) used[r + "," + c] = ch;
  }
  for (let r = 0; r < layout.rows; r++) {
    for (let c = 0; c < layout.cols; c++) {
      const div = document.createElement("div");
      div.className = "cell";
      const ch = used[r + "," + c];
      if (ch) {
        div.classList.add("slot");
        div.textContent = ch;
        cellEls[r + "," + c] = div;
      }
      boardEl.appendChild(div);
    }
  }
  sizeBoard();
}

function sizeBoard() {
  if (!layout || screenNow !== "play") return;
  const area = boardEl.parentElement;
  const gap = 5;
  const w = (area.clientWidth - gap * (layout.cols - 1)) / layout.cols;
  const h = (area.clientHeight - 32 - gap * (layout.rows - 1)) / layout.rows;
  const size = Math.max(22, Math.min(56, w, h));
  boardEl.style.setProperty("--cell", size + "px");
}

function wordCells(word) {
  return layout.placements[word].map(({ r, c }) => cellEls[r + "," + c]);
}

function isFilled(el) {
  return el.classList.contains("filled");
}

function fillWord(word, animate) {
  wordCells(word).forEach((el, i) => {
    el.classList.remove("slot", "again");
    if (!isFilled(el)) {
      el.classList.add("filled");
      el.style.setProperty("--i", i); // ترتیب پر شدن خانه‌ها، برای انیمیشن حرف به حرف
      if (!animate) el.style.animation = "none";
    }
  });
}

// خانه‌ای که با راهنما باز شده
function revealCell(el, animate, order = 0) {
  el.classList.remove("slot");
  el.classList.add("filled", "hinted");
  el.style.setProperty("--i", order);
  if (!animate) el.style.animation = "none";
}

function flashWord(word) {
  for (const el of wordCells(word)) {
    el.style.animation = "";
    el.classList.remove("again");
    void el.offsetWidth;
    el.classList.add("again");
  }
}

// ---------- دایره‌ی حروف ----------

function renderWheel() {
  for (const el of letterEls) el.remove();
  const letters = levels[current].letters;
  slots = letters.map((_, i) => i);
  letterEls = letters.map((ch) => {
    const el = document.createElement("div");
    el.className = "letter";
    el.textContent = ch;
    wheelEl.appendChild(el);
    return el;
  });
  positionLetters();
  drawLines();
}

// مرکز جای شماره‌ی slot روی دایره، به درصد (۰ تا ۱۰۰)
function slotCenter(slot) {
  const n = letterEls.length;
  const angle = -Math.PI / 2 + (slot * 2 * Math.PI) / n;
  return { x: 50 + 34 * Math.cos(angle), y: 50 + 34 * Math.sin(angle) };
}

function letterCenter(index) {
  return slotCenter(slots[index]);
}

function positionLetters() {
  letterEls.forEach((el, i) => {
    const p = letterCenter(i);
    el.style.left = p.x + "%";
    el.style.top = p.y + "%";
  });
}

function shuffle() {
  if (dragging || locked || letterEls.length < 2) return;
  const before = slots.join();
  do {
    for (let i = slots.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [slots[i], slots[j]] = [slots[j], slots[i]];
    }
  } while (slots.join() === before);
  positionLetters();
  emit("shuffle");
}

// تبدیل مختصات صفحه به درصد داخل دایره
function toWheel(e) {
  const rect = wheelEl.getBoundingClientRect();
  return {
    x: ((e.clientX - rect.left) / rect.width) * 100,
    y: ((e.clientY - rect.top) / rect.height) * 100,
  };
}

function letterAt(p) {
  for (let i = 0; i < letterEls.length; i++) {
    const c = letterCenter(i);
    if (Math.hypot(c.x - p.x, c.y - p.y) < 12) return i;
  }
  return -1;
}

function drawLines() {
  if (path.length === 0) {
    linesEl.innerHTML = "";
    return;
  }
  const points = path.map(letterCenter);
  if (pointer) points.push(pointer);
  const pts = points.map((p) => `${p.x},${p.y}`).join(" ");
  linesEl.setAttribute("viewBox", "0 0 100 100");
  linesEl.innerHTML =
    `<polyline points="${pts}" fill="none" stroke="var(--line)" stroke-width="3.5" ` +
    `stroke-linecap="round" stroke-linejoin="round"/>`;
}

function currentWord() {
  return path.map((i) => levels[current].letters[i]).join("");
}

function updateSelection() {
  letterEls.forEach((el, i) => el.classList.toggle("active", path.includes(i)));
  const word = currentWord();
  clearTimeout(previewTimer);
  previewEl.className = "preview" + (word ? " show" : "");
  previewEl.textContent = word;
  drawLines();
}

// حرفی که تازه انتخاب شده یک لحظه می‌پرد
function pickLetter(i) {
  const el = letterEls[i];
  el.classList.add("picked");
  setTimeout(() => el.classList.remove("picked"), 140);
}

function onPointerDown(e) {
  if (locked || dragging) return;
  const p = toWheel(e);
  const i = letterAt(p);
  if (i < 0) return;
  e.preventDefault();
  dragging = true;
  dragPointer = e.pointerId;
  path = [i];
  pointer = p;
  pickLetter(i);
  updateSelection();
}

function onPointerMove(e) {
  if (!dragging || e.pointerId !== dragPointer) return;
  pointer = toWheel(e);
  const i = letterAt(pointer);
  if (i >= 0) {
    if (i === path[path.length - 2]) path.pop();   // برگشتن انگشت = پاک کردن آخرین حرف
    else if (!path.includes(i)) {
      path.push(i);
      pickLetter(i);
    }
  }
  updateSelection();
}

function endDrag() {
  dragging = false;
  dragPointer = null;
  path = [];
  pointer = null;
  letterEls.forEach((el) => el.classList.remove("active"));
  drawLines();
}

function onPointerUp(e) {
  if (!dragging || e.pointerId !== dragPointer) return;
  const word = currentWord();
  emit("submit", { letters: path.map((i) => letterEls[i]) });
  endDrag();
  submitWord(word);
}

// اگر سیستم لمس را قطع کند (مثلاً پایین کشیدن نوار اعلان‌ها)، کلمه ثبت نمی‌شود
function onPointerCancel(e) {
  if (!dragging || e.pointerId !== dragPointer) return;
  endDrag();
  hidePreview();
}

// ---------- بررسی کلمه ----------

function submitWord(raw) {
  const word = normalize(raw);
  const level = levels[current];
  if (word.length < 2) {
    hidePreview();
    return;
  }
  if (found.includes(word)) {
    flashWord(word);
    showPreview(word, "show", 600);
    emit("repeat", { word, cells: wordCells(word) });
  } else if (level.words.includes(word)) {
    found.push(word);
    streak++;
    fillWord(word, true);
    showPreview(word, "right", 600);
    praise(word);
    emit("found", { word, cells: wordCells(word) });
    checkDone();
  } else {
    streak = 0;
    showPreview(word, "wrong", 600);
    emit("wrong", { word });
  }
}

// پیام تشویقی وسط جدول: برای کلمه‌ای که همه‌ی حروف را دارد، یا چند کلمه‌ی درست پشت سر هم
const PRAISES = ["خوبه!", "عالی!", "فوق‌العاده!", "بی‌نظیر!", "محشر!"];

function praise(word) {
  let text = null;
  if (word.length >= 4 && word.length === levels[current].letters.length) text = "شاهکار!";
  else if (streak >= 2) text = PRAISES[Math.min(streak - 2, PRAISES.length - 1)];
  if (!text) return;
  const el = $("praise");
  el.textContent = text;
  el.classList.remove("show");
  void el.offsetWidth;
  el.classList.add("show");
}

// کلمه‌ای که همه‌ی خانه‌هایش (با راهنما یا کلمه‌های دیگر) باز شده، پیدا شده حساب می‌شود
function collectCompletedWords() {
  for (const w of levels[current].words) {
    if (!found.includes(w) && wordCells(w).every(isFilled)) found.push(w);
  }
}

function checkDone() {
  collectCompletedWords();
  if (found.length === levels[current].words.length) finishLevel();
  else saveLevelState();
}

// ---------- سکه و راهنما ----------

function updateCoins() {
  for (const el of document.querySelectorAll(".coin-count")) el.textContent = faDigits(save.coins);
  $("hintLetterBtn").classList.toggle("poor", save.coins < COST_HINT_LETTER);
  $("hintWordBtn").classList.toggle("poor", save.coins < COST_HINT_WORD);
}

function bumpCoins() {
  for (const el of document.querySelectorAll(".coins")) {
    el.classList.remove("bump");
    void el.offsetWidth;
    el.classList.add("bump");
  }
}

function spend(cost) {
  if (save.coins < cost) {
    showPreview("سکه‌ی کافی نداری", "wrong note", 1400);
    return false;
  }
  save.coins -= cost;
  updateCoins();
  bumpCoins();
  return true;
}

function hintLetter() {
  if (locked || dragging) return;
  const empty = Object.values(cellEls).filter((el) => !isFilled(el));
  if (!empty.length || !spend(COST_HINT_LETTER)) return;
  const el = empty[Math.floor(Math.random() * empty.length)];
  revealCell(el, true);
  emit("hint", { cells: [el] });
  checkDone();
}

function hintWord() {
  if (locked || dragging) return;
  const left = levels[current].words.filter((w) => !found.includes(w));
  if (!left.length || !spend(COST_HINT_WORD)) return;
  const word = left[Math.floor(Math.random() * left.length)];
  const cells = wordCells(word).filter((el) => !isFilled(el));
  cells.forEach((el, i) => revealCell(el, true, i));
  emit("hint", { cells });
  checkDone();
}

// ---------- پیام کوتاه بالای دایره ----------

function showPreview(text, kind, ms) {
  clearTimeout(previewTimer);
  previewEl.textContent = text;
  previewEl.className = "preview";
  void previewEl.offsetWidth;
  previewEl.className = "preview " + kind;
  previewTimer = setTimeout(hidePreview, ms);
}

function hidePreview() {
  clearTimeout(previewTimer);
  previewEl.className = "preview";
  previewEl.textContent = "";
}

// ---------- پایان مرحله ----------

function finishLevel() {
  locked = true;
  const first = current === save.unlocked;
  if (first) {
    save.unlocked++;
    save.coins += COINS_PER_LEVEL;
  }
  delete save.partial[current];
  persist();
  // هر ظاهر می‌تواند با --complete-delay برای انیمیشن خودش وقت بیشتری بگیرد
  const delay = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--complete-delay"), 10);
  const level = current;
  setTimeout(() => {
    if (screenNow === "play" && current === level) showComplete(first);
  }, delay || 700);
}

function showComplete(first) {
  const hasNext = current + 1 < levels.length;
  const n = faDigits(current + 1);
  const card = document.querySelector("#overlay .card");
  for (const el of card.querySelectorAll(".extra")) el.remove(); // تزئین‌های ظاهر قبلی

  $("overlayTitle").textContent = hasNext ? "آفرین!" : "تبریک!";
  $("overlayText").textContent = !hasNext
    ? "همه‌ی مرحله‌ها رو تموم کردی."
    : first ? `مرحله‌ی ${n} تموم شد.` : `مرحله‌ی ${n} دوباره تموم شد.`;
  $("overlayReward").classList.toggle("hidden", !first);
  $("overlayReward").querySelector(".reward-count").textContent = "+" + faDigits(COINS_PER_LEVEL);

  const btn = $("overlayBtn");
  btn.textContent = hasNext ? "مرحله‌ی بعد" : "منو";
  btn.onclick = hasNext ? () => startLevel(current + 1) : goHome;
  $("overlayMenu").classList.toggle("hidden", !hasNext);
  $("overlay").classList.remove("hidden");

  updateCoins();
  emit("complete", { level: current, finished: !hasNext, first });
  celebrate();
  if (first) setTimeout(() => flyCoins(COINS_PER_LEVEL), 350);
}

const calm = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

// سکه‌های جایزه از پنجره‌ی پایان مرحله به شمارنده‌ی سکه پرواز می‌کنند
function flyCoins(amount) {
  const target = document.querySelector("#app .coins");
  const from = $("overlayReward").querySelector(".coin-icon").getBoundingClientRect();
  const to = target.getBoundingClientRect();
  if (calm() || !from.width || !to.width) return bumpCoins();

  // شمارنده‌ی اصلی زیر پنجره است؛ یک کپی از آن روی پنجره می‌گذاریم تا سکه‌ها جلوی چشم داخلش بنشینند
  const ghost = target.cloneNode(true);
  ghost.classList.add("coins-ghost");
  Object.assign(ghost.style, { left: to.left + "px", top: to.top + "px", width: to.width + "px" });
  document.body.appendChild(ghost);
  const count = ghost.querySelector(".coin-count");
  let shown = save.coins - amount;
  count.textContent = faDigits(shown);

  const N = 5;
  const dx = to.left + 12 - from.left;
  const dy = to.top + to.height / 2 - from.top - from.height / 2;
  for (let k = 0; k < N; k++) {
    const coin = document.createElement("span");
    coin.className = "coin-icon flying-coin";
    coin.style.left = from.left + "px";
    coin.style.top = from.top + "px";
    document.body.appendChild(coin);
    coin.animate(
      [
        { translate: "0 0", scale: "1" },
        { translate: `${dx * 0.35 + (k - 2) * 16}px ${dy * 0.35 - 70}px`, scale: "1.35", offset: 0.45 },
        { translate: `${dx}px ${dy}px`, scale: "0.8" },
      ],
      { duration: 720, delay: k * 90, easing: "cubic-bezier(.45,0,.55,1)", fill: "backwards" }
    ).finished.then(() => {
      coin.remove();
      shown += amount / N;
      count.textContent = faDigits(Math.round(shown));
      ghost.classList.remove("bump");
      void ghost.offsetWidth;
      ghost.classList.add("bump");
      if (k === N - 1) setTimeout(() => ghost.remove(), 600);
    });
  }
}

// جشن پایان مرحله: تکه‌های رنگی از بالای پنجره بیرون می‌پرند (شکل و رنگشان را هر ظاهر تعیین می‌کند)
function celebrate() {
  if (calm()) return;
  const r = document.querySelector("#overlay .card").getBoundingClientRect();
  const cx = r.left + r.width / 2;
  const cy = r.top + 30;
  for (let k = 0; k < 30; k++) {
    const bit = document.createElement("span");
    bit.className = "confetti c" + (k % 4);
    bit.style.left = cx + "px";
    bit.style.top = cy + "px";
    document.body.appendChild(bit);
    const a = -Math.PI / 2 + (Math.random() - 0.5) * 2.6;
    const v = 130 + Math.random() * 170;
    const x = Math.cos(a) * v;
    const y = Math.sin(a) * v;
    bit.animate(
      [
        { translate: "0 0", rotate: "0deg", opacity: 1 },
        { translate: `${x}px ${y}px`, rotate: `${Math.random() * 360}deg`, opacity: 1, offset: 0.35 },
        { translate: `${x * 1.35}px ${y + 420}px`, rotate: `${Math.random() * 720}deg`, opacity: 0 },
      ],
      { duration: 1500 + Math.random() * 700, easing: "cubic-bezier(.2,.65,.4,1)" }
    ).finished.then(() => bit.remove());
  }
}

function showErrors(errors) {
  const box = $("errorBox");
  box.textContent = "اشکال در فایل levels.txt:\n" + errors.join("\n");
  box.classList.remove("hidden");
}

// ---------------------------------------------------------------------------
// صفحه‌ها: انتخاب ظاهر، منو، فهرست مرحله‌ها، بازی
// ---------------------------------------------------------------------------
// منو صفحه‌ی اصلی است؛ بقیه با # در آدرس باز می‌شوند تا دکمه‌ی «برگشت» اندروید هم کار کند.

const screens = { themes: $("screenThemes"), home: $("screenHome"), levels: $("screenLevels"), play: $("app") };

function route() {
  let name = location.hash.slice(1);
  if (!(name in screens)) name = "home";
  if (!save.theme) name = "themes";                       // بار اول: انتخاب ظاهر
  if (name === "play" && current === null) name = "home"; // مثلاً بعد از باز شدن دوباره‌ی برنامه

  if (dragging) endDrag();
  screenNow = name;
  for (const [key, el] of Object.entries(screens)) el.classList.toggle("hidden", key !== name);
  if (name !== "play") $("overlay").classList.add("hidden");

  if (name === "themes") renderThemes();
  if (name === "home") renderHome();
  if (name === "levels") renderLevels();
  if (name === "play") sizeBoard();
  updateCoins();
}

function open(name) {
  if (location.hash) location.replace("#" + name);  // از یک صفحه‌ی فرعی به صفحه‌ی فرعی دیگر
  else location.hash = name;
}

function goHome() {
  if (location.hash) history.back();
  else route();
}

function play(i) {
  startLevel(i);
  open("play");
}

function renderThemes() {
  const list = $("themeList");
  list.innerHTML = "";
  for (const t of THEMES) {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "tcard tc-" + t.id + (save.theme === t.id ? " selected" : "");
    card.innerHTML = `<span class="tcard-art"></span><span class="tcard-name"></span><span class="tcard-desc"></span>`;
    card.querySelector(".tcard-name").textContent = t.name;
    card.querySelector(".tcard-desc").textContent = t.desc;
    card.onclick = () => chooseTheme(t.id);
    list.appendChild(card);
  }
  $("themesBack").classList.toggle("hidden", !save.theme);
}

function chooseTheme(id) {
  const firstTime = !save.theme;
  save.theme = id;
  persist();
  applyTheme(id);
  if (firstTime) route();
  else goHome();
}

function renderHome() {
  $("homeSub").textContent = (THEMES.find((t) => t.id === activeTheme) || THEMES[0]).name;
  // صحنه‌ی زنده‌ی بالای منو را ظاهر فعلی می‌سازد (level: مرحله‌ی بعدی، done: تعداد مرحله‌های تمام‌شده)
  $("homeScene").innerHTML = "";
  if (levels.length) emit("home", { level: Math.min(save.unlocked, levels.length - 1), done: save.unlocked, total: levels.length });
  const btn = $("continueBtn");
  btn.disabled = levels.length === 0;
  const next = Math.min(save.unlocked, levels.length - 1);
  const name = levels.length ? levelName(next) : "";
  $("continueSub").textContent =
    levels.length && save.unlocked >= levels.length
      ? "همه‌ی مرحله‌ها تموم شده"
      : `مرحله‌ی ${faDigits(next + 1)}` + (name ? " · " + name : "");
}

function continueGame() {
  if (save.unlocked >= levels.length) open("levels");
  else play(save.unlocked);
}

// ---------- نقشه‌ی مرحله‌ها: جاده‌ای پیچ‌وتاب‌دار که از پایین صفحه بالا می‌رود ----------

const MAP_STEP = 96;   // فاصله‌ی عمودی دو مرحله
const MAP_PAD = 80;    // فاصله‌ی اولین و آخرین مرحله از لبه‌ها
const mapX = (i) => 50 + 26 * Math.sin(i * 1.15); // جای افقی هر مرحله، به درصد

function renderLevels() {
  const map = $("levelMap");
  const n = levels.length;
  const H = MAP_PAD * 2 + Math.max(n - 1, 0) * MAP_STEP;
  const y = (i) => H - MAP_PAD - i * MAP_STEP;
  // منحنی نرم از مرحله‌ی اول تا مرحله‌ی count
  const road = (count) => {
    let d = `M${mapX(0)} ${y(0)}`;
    for (let i = 1; i < count; i++) {
      d += ` C${mapX(i - 1)} ${y(i - 1) - MAP_STEP / 2} ${mapX(i)} ${y(i) + MAP_STEP / 2} ${mapX(i)} ${y(i)}`;
    }
    return d;
  };
  // جاده‌ی کامل، تزئین روی آن، و تکه‌ای که بازیکن تا الان رفته (هر ظاهر رنگ و شکلشان را تعیین می‌کند)
  map.innerHTML = `<div class="map-track" style="height:${H}px">
      <svg class="map-svg" viewBox="0 0 100 ${H}" preserveAspectRatio="none" aria-hidden="true">
        <path class="map-road" d="${road(n)}"/>
        <path class="map-stitch" d="${road(n)}"/>
        <path class="map-done" d="${road(Math.min(save.unlocked + 1, n))}"/>
      </svg>
    </div>`;
  const track = map.firstElementChild;

  let prevName = null;
  levels.forEach((_, i) => {
    const x = mapX(i);
    const status = i < save.unlocked ? "done" : i === save.unlocked ? "current" : "locked";
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "lv " + status;
    btn.style.left = x + "%";
    btn.style.top = y(i) + "px";
    btn.textContent = faDigits(i + 1);
    btn.setAttribute("aria-label", `مرحله‌ی ${faDigits(i + 1)}` + (status === "locked" ? "، قفل" : ""));
    btn.onclick = () => {
      if (status !== "locked") return play(i);
      btn.classList.remove("nope");
      void btn.offsetWidth;
      btn.classList.add("nope");
    };
    track.appendChild(btn);

    // اسم هر فصل (صورت فلکی، شهر، قالی، باغ) کنار اولین مرحله‌اش، طرف دیگر جاده
    const name = levelName(i);
    if (name && name !== prevName) {
      const label = document.createElement("span");
      label.className = "map-label" + (status === "locked" ? " locked" : "");
      label.textContent = name;
      label.style.top = y(i) + "px";
      if (x >= 50) {
        label.style.left = x - 11 + "%";
        label.style.translate = "-100% -50%";
      } else {
        label.style.left = x + 11 + "%";
        label.style.translate = "0 -50%";
      }
      track.appendChild(label);
    }
    prevName = name;

    if (status === "current") {
      const marker = document.createElement("span");
      marker.className = "map-marker";
      marker.style.left = x + "%";
      marker.style.top = y(i) - 50 + "px";
      track.appendChild(marker);
    }
  });

  // مرحله‌ی فعلی (یا آخرین مرحله) وسط صفحه
  const here = track.querySelector(".lv.current") || track.querySelector(".lv:last-of-type");
  if (here) map.scrollTop = parseFloat(here.style.top) - map.clientHeight / 2;
}

// ---------------------------------------------------------------------------
// شروع
// ---------------------------------------------------------------------------

wheelEl.addEventListener("pointerdown", onPointerDown);
window.addEventListener("pointermove", onPointerMove);
window.addEventListener("pointerup", onPointerUp);
window.addEventListener("pointercancel", onPointerCancel);
window.addEventListener("resize", sizeBoard);
window.addEventListener("hashchange", route);
$("shuffleBtn").addEventListener("click", shuffle);
$("hintLetterBtn").addEventListener("click", hintLetter);
$("hintWordBtn").addEventListener("click", hintWord);
$("menuBtn").addEventListener("click", goHome);
$("overlayMenu").addEventListener("click", goHome);
$("continueBtn").addEventListener("click", continueGame);
$("levelsBtn").addEventListener("click", () => open("levels"));
$("themesBtn").addEventListener("click", () => open("themes"));
for (const btn of document.querySelectorAll("[data-back]")) btn.addEventListener("click", goHome);
$("hintLetterBtn").querySelector(".cost-count").textContent = faDigits(COST_HINT_LETTER);
$("hintWordBtn").querySelector(".cost-count").textContent = faDigits(COST_HINT_WORD);

// فایل‌های ظاهرها بعد از این فایل بارگذاری می‌شوند؛ پس شروع را تا آماده شدن صفحه عقب می‌اندازیم
document.addEventListener("DOMContentLoaded", () => {
  applyTheme(save.theme || "plain");
  // برنامه همیشه از منو شروع می‌شود
  if (location.hash) history.replaceState(null, "", location.pathname + location.search);

  fetch("levels.txt", { cache: "no-store" })
    .then((res) => {
      if (!res.ok) throw new Error(res.status);
      return res.text();
    })
    .then((text) => {
      const result = parseLevels(text);
      levels = result.levels;
      if (result.errors.length) showErrors(result.errors);
    })
    .catch(() => {
      showErrors(["فایل مرحله‌ها خوانده نشد. بازی را با دستور npm start اجرا کنید."]);
    })
    .finally(route);
});
