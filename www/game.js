"use strict";

// ---------------------------------------------------------------------------
// ابزارهای فارسی
// ---------------------------------------------------------------------------

// «ي» و «ى» عربی ← «ی» فارسی، «ك» عربی ← «ک» فارسی،
// و حذف اعراب، کشیده (ـ)، نیم‌فاصله و فاصله.
function normalize(text) {
  return text
    .replace(/[يى]/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/[ً-ٰٟـ‌‍\s]/g, "");
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
// ذخیره‌ی پیشرفت
// ---------------------------------------------------------------------------

const SAVE_KEY = "kalame-progress";

function loadProgress() {
  try {
    const data = JSON.parse(localStorage.getItem(SAVE_KEY));
    if (data && Number.isInteger(data.level) && data.level >= 0) {
      return { level: data.level, found: Array.isArray(data.found) ? data.found : [] };
    }
  } catch (e) {}
  return { level: 0, found: [] };
}

function saveProgress() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({ level: state.level, found: state.found }));
  } catch (e) {}
}

// ---------------------------------------------------------------------------
// وضعیت بازی و صفحه
// ---------------------------------------------------------------------------

const $ = (id) => document.getElementById(id);
const boardEl = $("board");
const wheelEl = $("wheel");
const linesEl = $("wheelLines");
const previewEl = $("preview");

let levels = [];
let state = loadProgress();
let layout = null;
let cellEls = {};       // "r,c" -> عنصر خانه
let letterEls = [];     // عنصر هر حرف دایره (به ترتیب حروف مرحله)
let slots = [];         // جای هر حرف روی دایره
let path = [];          // حروفی که الان انگشت رویشان کشیده شده
let dragging = false;
let pointer = null;
let previewTimer = null;
let locked = false;     // بین تمام شدن مرحله و شروع مرحله‌ی بعد

function currentLevel() {
  return levels[state.level];
}

function startLevel() {
  if (state.level >= levels.length) {
    showFinished();
    return;
  }
  const level = currentLevel();
  state.found = state.found.filter((w) => level.words.includes(w));
  layout = buildLayout(level.words);

  $("levelLabel").textContent = `مرحله‌ی ${faDigits(state.level + 1)} از ${faDigits(levels.length)}`;
  renderBoard();
  renderWheel();
  hidePreview();
  $("overlay").classList.add("hidden");

  locked = false;
  for (const w of state.found) fillWord(w, false);
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
  if (!layout) return;
  const area = boardEl.parentElement;
  const gap = 5;
  const w = (area.clientWidth - gap * (layout.cols - 1)) / layout.cols;
  const h = (area.clientHeight - 32 - gap * (layout.rows - 1)) / layout.rows;
  const size = Math.max(22, Math.min(56, w, h));
  boardEl.style.setProperty("--cell", size + "px");
}

function fillWord(word, animate) {
  for (const { r, c } of layout.placements[word]) {
    const el = cellEls[r + "," + c];
    el.classList.remove("slot", "again");
    if (!el.classList.contains("filled")) {
      el.classList.add("filled");
      if (!animate) el.style.animation = "none";
    }
  }
}

function flashWord(word) {
  for (const { r, c } of layout.placements[word]) {
    const el = cellEls[r + "," + c];
    el.style.animation = "";
    el.classList.remove("again");
    void el.offsetWidth;
    el.classList.add("again");
  }
}

// ---------- دایره‌ی حروف ----------

function renderWheel() {
  for (const el of letterEls) el.remove();
  const letters = currentLevel().letters;
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
  if (dragging || letterEls.length < 2) return;
  const before = slots.join();
  do {
    for (let i = slots.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [slots[i], slots[j]] = [slots[j], slots[i]];
    }
  } while (slots.join() === before);
  positionLetters();
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

function updateSelection() {
  letterEls.forEach((el, i) => el.classList.toggle("active", path.includes(i)));
  const word = path.map((i) => currentLevel().letters[i]).join("");
  clearTimeout(previewTimer);
  previewEl.className = "preview" + (word ? " show" : "");
  previewEl.textContent = word;
  drawLines();
}

function onPointerDown(e) {
  if (locked) return;
  const p = toWheel(e);
  const i = letterAt(p);
  if (i < 0) return;
  e.preventDefault();
  dragging = true;
  path = [i];
  pointer = p;
  updateSelection();
}

function onPointerMove(e) {
  if (!dragging) return;
  pointer = toWheel(e);
  const i = letterAt(pointer);
  if (i >= 0) {
    if (i === path[path.length - 2]) path.pop();   // برگشتن انگشت = پاک کردن آخرین حرف
    else if (!path.includes(i)) path.push(i);
  }
  updateSelection();
}

function onPointerUp() {
  if (!dragging) return;
  dragging = false;
  const word = path.map((i) => currentLevel().letters[i]).join("");
  path = [];
  pointer = null;
  letterEls.forEach((el) => el.classList.remove("active"));
  drawLines();
  submitWord(word);
}

// ---------- بررسی کلمه ----------

function submitWord(raw) {
  const word = normalize(raw);
  const level = currentLevel();
  if (word.length < 2) {
    hidePreview();
    return;
  }
  if (state.found.includes(word)) {
    flashWord(word);
    showPreview(word, "show", 600);
  } else if (level.words.includes(word)) {
    state.found.push(word);
    fillWord(word, true);
    showPreview(word, "right", 600);
    if (state.found.length === level.words.length) {
      locked = true;
      state.level++;
      state.found = [];
      saveProgress();
      setTimeout(() => levelComplete(), 700);
    } else {
      saveProgress();
    }
  } else {
    showPreview(word, "wrong", 600);
  }
}

function showPreview(word, kind, ms) {
  clearTimeout(previewTimer);
  previewEl.textContent = word;
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

function showOverlay(title, text, button, onClick) {
  $("overlayTitle").textContent = title;
  $("overlayText").textContent = text;
  const btn = $("overlayBtn");
  btn.textContent = button;
  btn.onclick = onClick;
  $("overlay").classList.remove("hidden");
}

function levelComplete() {
  // state.level همین الان یکی جلو رفته است
  if (state.level >= levels.length) {
    showFinished();
    return;
  }
  showOverlay("آفرین!", `مرحله‌ی ${faDigits(state.level)} تموم شد.`, "مرحله‌ی بعد", startLevel);
}

function showFinished() {
  locked = true;
  showOverlay(
    "تبریک!",
    `همه‌ی ${faDigits(levels.length)} مرحله رو تموم کردی.`,
    "از اول بازی کن",
    () => {
      state = { level: 0, found: [] };
      saveProgress();
      startLevel();
    }
  );
}

function showErrors(errors) {
  const box = $("errorBox");
  box.textContent = "اشکال در فایل levels.txt:\n" + errors.join("\n");
  box.classList.remove("hidden");
}

// ---------------------------------------------------------------------------
// شروع
// ---------------------------------------------------------------------------

wheelEl.addEventListener("pointerdown", onPointerDown);
window.addEventListener("pointermove", onPointerMove);
window.addEventListener("pointerup", onPointerUp);
window.addEventListener("pointercancel", onPointerUp);
window.addEventListener("resize", sizeBoard);
$("shuffleBtn").addEventListener("click", shuffle);

fetch("levels.txt", { cache: "no-store" })
  .then((res) => {
    if (!res.ok) throw new Error(res.status);
    return res.text();
  })
  .then((text) => {
    const result = parseLevels(text);
    levels = result.levels;
    if (result.errors.length) showErrors(result.errors);
    if (levels.length === 0) return;
    startLevel();
  })
  .catch(() => {
    showErrors(["فایل مرحله‌ها خوانده نشد. بازی را با دستور npm start اجرا کنید."]);
  });
