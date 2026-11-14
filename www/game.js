"use strict";

// ---------------------------------------------------------------------------
// تنظیمات سکه و راهنما (برای تغییر، فقط همین عددها را عوض کنید)
// ---------------------------------------------------------------------------

const COINS_START = 50;        // هدیه‌ی شروع بازی
const COINS_PER_LEVEL = 10;    // فقط بار اولی که یک مرحله تمام می‌شود
const COST_HINT_LETTER = 15;   // باز کردن یک خانه
const COST_HINT_WORD = 30;     // باز کردن یک کلمه‌ی کامل
// صندوق کلمه‌ها: هر کلمه‌ی درستی که در جدول نیست به صندوق می‌رود؛ هر بار که صندوق پر شود، باز می‌شود و سکه می‌دهد
const CHEST_SIZE = 10;
const CHEST_REWARD = 15;
// جایزه‌ی هر سطح دستاوردها (سطح اول، دوم، ...)
const ACH_REWARDS = [10, 20, 30, 40, 50, 75, 100];
// جایزه‌ی روزانه: روز اول تا هفتمِ آمدن پشت سر هم به بازی؛ بعد از روز هفتم دوباره از روز اول.
// اگر یک روز نیاید، از روز اول شروع می‌شود. میانگین هفته حدود ۱۷ سکه در روز است،
// یعنی بیشتر از یک راهنمای «یک حرف» (۱۵ سکه)؛ تا سکه‌ی مرحله‌ها هنوز اصلی‌ترین درآمد باشد.
const DAILY_REWARDS = [10, 10, 15, 15, 20, 20, 30];
// بسته‌های فروشگاه سکه. id باید دقیقاً همان «شناسه‌ی محصول» باشد که در پنل کافه‌بازار و مایکت
// (از نوع «مصرف‌شدنی») ساخته‌اید. قیمت را خود فروشگاه می‌دهد و اینجا نوشته نمی‌شود.
const COIN_PACKS = [
  { id: "coins_150", coins: 150, name: "مشت سکه" },
  { id: "coins_500", coins: 500, name: "کیسه‌ی سکه", tag: "محبوب" },
  { id: "coins_1200", coins: 1200, name: "صندوق سکه", tag: "به‌صرفه" },
];

// ظاهرهای بازی؛ هر کدام (جز «ساده») یک فایل css و js در پوشه‌ی themes دارد.
// ظاهرهای پولی: product همان «شناسه‌ی محصول» در پنل کافه‌بازار و مایکت است، از نوع «غیرمصرفی»
// (یک بار خریده می‌شود و برای همیشه می‌ماند). price (تومان) فقط وقتی نشان داده می‌شود که قیمت از فروشگاه نرسیده باشد.
const THEMES = [
  { id: "stars", name: "صور فلکی", desc: "آسمان شب کویر و حکاکی صورت‌های فلکی", product: "theme_stars", price: 99000 },
  { id: "carpet", name: "قالی‌باف", desc: "با هر کلمه، گره به گره یک قالی بافته می‌شود", product: "theme_carpet", price: 79000 },
  { id: "caravan", name: "کاروان ابریشم", desc: "سفر با کاروان از کرمان تا ماسوله", product: "theme_caravan", price: 59000 },
  { id: "garden", name: "حوض و باغ", desc: "حوض ماهی‌ها و باغی که با هر مرحله گل می‌دهد", product: "theme_garden", price: 49000 },
  { id: "ink", name: "قلم و مرکب", desc: "کاغذ کاهی، تذهیب و خط نستعلیق" },
  { id: "plain", name: "ساده", desc: "آرام و سبک، مناسب گوشی‌های ضعیف" },
];

// ---------------------------------------------------------------------------
// ذخیره‌ی پیشرفت، سکه و ظاهر
// ---------------------------------------------------------------------------
// unlocked: تعداد مرحله‌هایی که تمام شده‌اند (مرحله‌ی بعدی همین شماره است)
// partial: کلمه‌های پیدا شده، خانه‌های باز شده و کلمه‌های جایزه‌ی مرحله‌هایی که نیمه‌کاره مانده‌اند
//          (کلید: شماره‌ی مرحله)
// daily: آخرین روزی که جایزه‌ی روزانه گرفته شده، و چندمین روز پشت سر هم بوده
// tips: راهنمایی‌هایی که یک بار نشان داده شده‌اند
// chest: همه‌ی کلمه‌های صندوق، و چند کلمه از پر شدن بعدی جمع شده (fill)
// stats: آمار دستاوردها (کلمه‌های جدول، مرحله‌های بی‌راهنما، ظاهرهای بازی‌شده، روزهای پشت سر هم)
// achievements: هر دستاورد تا چه سطحی جایزه‌اش گرفته شده
// dailyPuzzle: مرحله‌ی روزانه (daily.js)؛ events: عیدی‌های گرفته‌شده‌ی مناسبت‌ها
// paid: شناسه‌ی خریدهایی (purchaseToken) که سکه‌شان داده شده، تا یک خرید دو بار سکه ندهد

const SAVE_KEY = "kalame-save";

const intOr = (v, d) => (Number.isInteger(v) && v >= 0 ? v : d);
const objOr = (v) => (v && typeof v === "object" && !Array.isArray(v) ? v : {});

function readExtras(data) {
  const chest = objOr(data.chest), stats = objOr(data.stats), daily = objOr(data.daily);
  const strings = (list) => (Array.isArray(list) ? list.filter((s) => typeof s === "string") : []);
  return {
    chest: { words: strings(chest.words), fill: intOr(chest.fill, 0) },
    stats: {
      words: Number.isInteger(stats.words) ? stats.words : null, // null: بعد از خواندن مرحله‌ها تخمین زده می‌شود
      noHint: intOr(stats.noHint, 0),
      // بازیکن قدیمی: دست‌کم با ظاهر فعلی‌اش بازی کرده
      themes: data.stats ? strings(stats.themes) : data.unlocked > 0 && typeof data.theme === "string" ? [data.theme] : [],
      dayRun: intOr(stats.dayRun, intOr(daily.streak, 0)),
      bestRun: intOr(stats.bestRun, intOr(daily.streak, 0)),
    },
    achievements: objOr(data.achievements),
    paid: strings(data.paid).slice(-100),
    // مرحله‌ی روزانه: آخرین روزی که حل شده، چند روز پشت سر هم، بهترین رکورد، تعداد کل
    dailyPuzzle: {
      last: typeof objOr(data.dailyPuzzle).last === "string" ? data.dailyPuzzle.last : null,
      run: intOr(objOr(data.dailyPuzzle).run, 0),
      best: intOr(objOr(data.dailyPuzzle).best, 0),
      count: intOr(objOr(data.dailyPuzzle).count, 0),
      hinted: objOr(data.dailyPuzzle).hinted === true,
    },
    // عیدی‌های گرفته‌شده‌ی مناسبت‌ها (مثل nowruz-1406)
    events: objOr(data.events),
    // ظاهرهای پولی خریده‌شده (شناسه‌ی ظاهر)؛ از روی خریدهای فروشگاه هم دوباره ساخته می‌شود
    owned: strings(data.owned),
    // بخش‌های extras.js: مأموریت‌ها، گردونه، دفتر واژه‌ها، لقب، مصراع فصل، ...
    x: objOr(data.x),
  };
}

function loadSave() {
  const fresh = { theme: null, unlocked: 0, coins: COINS_START, partial: {}, daily: { last: null, streak: 0 }, tips: {}, ...readExtras({}) };
  try {
    const data = JSON.parse(localStorage.getItem(SAVE_KEY));
    if (data && Number.isInteger(data.unlocked) && data.unlocked >= 0) {
      const daily = data.daily && typeof data.daily === "object" ? data.daily : {};
      return {
        ...readExtras(data),
        theme: typeof data.theme === "string" ? data.theme : null,
        unlocked: data.unlocked,
        coins: Number.isInteger(data.coins) && data.coins >= 0 ? data.coins : COINS_START,
        partial: data.partial && typeof data.partial === "object" ? data.partial : {},
        daily: {
          last: typeof daily.last === "string" ? daily.last : null,
          streak: Number.isInteger(daily.streak) && daily.streak >= 0 ? daily.streak : 0,
        },
        tips: data.tips && typeof data.tips === "object" ? data.tips : {},
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

// ظاهر رایگان است یا خریده شده؟
function themeOwned(id) {
  const t = THEMES.find((x) => x.id === id);
  if (!t) return false;
  // امتحانِ یک‌روزه از گردونه‌ی شانس (extras.js)
  const trial = save.x && save.x.trial;
  if (trial && trial.id === id && trial.until > Date.now()) return true;
  return !t.product || save.owned.includes(id);
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

// فایل‌های دیگر (مثل extras.js) می‌توانند به رویدادهای بازی گوش کنند
const gameHooks = [];

function emit(name, detail) {
  feel(name, detail || {}); // صدا، لرزش، آموزش و یادآوری راهنما (feel.js)
  for (const hook of gameHooks) {
    try { hook(name, detail || {}); } catch (e) { console.error(e); }
  }
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

let handmade = [];      // مرحله‌های ۱ تا ۱۰ از levels.txt
let dict = new Map();   // کلمه -> معنی، از words.txt
let extraDict = new Map(); // کلمه‌های بیشتر از extra-words.txt: فقط برای صندوق، نه برای جدول
let wordLevels = new Map(); // کلمه -> ۱ (رایج) یا ۲ (کمتر رایج)
let generator = null;   // سازنده‌ی مرحله‌های ۱۱ به بعد
const levelCache = new Map();
let save = loadSave();
let current = null;     // شماره‌ی مرحله‌ای که الان بازی می‌شود
let puzzle = null;      // خود مرحله: { letters, words }
let playKey = null;     // کلید ذخیره‌ی نیمه‌کاره‌ی همین مرحله
let bonusWords = [];    // کلمه‌های درستی که با حروف این مرحله ساخته می‌شوند ولی در جدول نیستند
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
let newAchievement = false; // پایان همین مرحله دستاورد تازه‌ای باز کرده

// مرحله‌ها بی‌پایان‌اند: ۱۰ مرحله‌ی اول دست‌ساز، بقیه را سازنده می‌سازد
function levelAt(i) {
  if (i < handmade.length) return handmade[i];
  if (!generator) return null;
  if (!levelCache.has(i)) levelCache.set(i, generator.level(i));
  return levelCache.get(i);
}

function hasLevel(i) {
  return i < handmade.length || !!generator;
}

// ---------- جایزه‌ی روزانه ----------

function dateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

// برای آزمودن روزهای دیگر در مرورگر: index.html?today=2027-03-21
const TODAY_OVERRIDE = new URLSearchParams(location.search).get("today");

function nowDate() {
  if (TODAY_OVERRIDE) {
    const d = new Date(TODAY_OVERRIDE + "T" + new Date().toTimeString().slice(0, 8));
    if (!isNaN(d)) return d;
  }
  return new Date();
}

function todayKey() {
  return dateKey(nowDate());
}

function yesterdayKey() {
  const d = nowDate();
  d.setDate(d.getDate() - 1);
  return dateKey(d);
}

// امروز چندمین روزِ آمدن پشت سر هم است (۱ تا ۷)؛ اگر دیروز نیامده، از ۱ شروع می‌شود
function todayRewardDay() {
  const keep = save.daily.last === yesterdayKey();
  return keep ? (save.daily.streak % DAILY_REWARDS.length) + 1 : 1;
}

function rewardDue() {
  return save.daily.last !== todayKey();
}

function showDailyReward() {
  if (typeof offerStreakSave === "function" && offerStreakSave()) return; // محافظ رکورد (more.js)
  const day = todayRewardDay();
  const list = $("rewardDays");
  list.innerHTML = "";
  DAILY_REWARDS.forEach((coins, i) => {
    const item = document.createElement("div");
    item.className = "reward-day" + (i + 1 < day ? " past" : i + 1 === day ? " today" : "");
    item.innerHTML = `<span class="reward-day-name"></span><span class="coin-icon"></span><span class="reward-day-coins"></span>`;
    item.querySelector(".reward-day-name").textContent = i + 1 < day ? "✓" : `روز ${faDigits(i + 1)}`;
    item.querySelector(".reward-day-coins").textContent = faDigits(coins);
    list.appendChild(item);
  });
  $("rewardText").textContent = day === 1
    ? "هر روز که به بازی سر بزنی، جایزه‌ی بیشتری می‌گیری."
    : `روز ${faDigits(day)} پشت سر هم! فردا هم بیا تا جایزه‌ات بیشتر شود.`;
  $("rewardBtn").textContent = `گرفتن ${faDigits(DAILY_REWARDS[day - 1])} سکه`;
  $("rewardSheet").classList.remove("hidden");
}

function claimDailyReward() {
  if (!rewardDue()) return;
  const day = todayRewardDay();
  const coins = DAILY_REWARDS[day - 1];
  save.stats.dayRun = save.daily.last === yesterdayKey() ? save.stats.dayRun + 1 : 1;
  save.stats.bestRun = Math.max(save.stats.bestRun, save.stats.dayRun);
  save.daily = { last: todayKey(), streak: day };
  save.coins += coins;
  sound("reward");
  persist();
  const from = $("rewardDays").querySelector(".today .coin-icon");
  const fromRect = from ? from.getBoundingClientRect() : null;
  $("rewardSheet").classList.add("hidden");
  flyCoins(coins, fromRect, document.querySelector("#screenHome .coins"));
  noteAchievements();
  updateAchBadge();
  askReminders(); // بار اول اجازه‌ی اعلان یادآوری را می‌پرسد (daily.js)
}

// آیا کلمه با این حروف (و تعدادشان) ساخته می‌شود؟
// «آ» و «ا» یک حرف حساب می‌شوند (fold در engine.js)
function canSpell(word, have) {
  return canMake(letterCounts(word), have);
}

function startLevel(i) {
  startPuzzle(levelAt(i), i, String(i));
}

function startPuzzle(level, index, key) {
  current = index;
  puzzle = level;
  playKey = key;
  const part = save.partial[key] || {};
  found = (Array.isArray(part.found) ? part.found : []).filter((w) => level.words.includes(w));
  bonusWords = generator ? generator.bonusWords(level) : [];
  // کلمه‌های extra-words.txt هم اگر با حروف دایره ساخته شوند، کلمه‌ی درست‌اند
  const have = letterCounts(level.letters);
  for (const w of extraDict.keys()) {
    if (!level.words.includes(w) && !bonusWords.includes(w) && canSpell(w, have)) bonusWords.push(w);
  }
  layout = buildLayout(level.words);

  const name = levelName(index);
  $("levelLabel").textContent = isDaily() ? dailyLabel() : `مرحله‌ی ${faDigits(index + 1)}` + (name ? " · " + name : "");
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
  updateChest();
  emit("level", { level: index, daily: isDaily() });
  if (!isDaily()) prepareLevel(index + 1);
}

// مرحله‌ی بعد را وقتی گوشی بیکار است از قبل می‌سازد، تا رفتن به مرحله‌ی بعد مکث نداشته باشد
function prepareLevel(i) {
  if (!hasLevel(i) || levelCache.has(i) || i < handmade.length) return;
  const later = window.requestIdleCallback || ((fn) => setTimeout(fn, 400));
  later(() => levelAt(i));
}

function saveLevelState() {
  const revealed = Object.keys(cellEls).filter((k) => cellEls[k].classList.contains("hinted"));
  save.partial[playKey] = { found: [...found], revealed };
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
  const letters = puzzle.letters;
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
  return { x: 50 + 30 * Math.cos(angle), y: 50 + 30 * Math.sin(angle) };
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
  const rect = dragRect || wheelEl.getBoundingClientRect();
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

// خط بین حروف: یک polyline ثابت که فقط نقطه‌هایش عوض می‌شود (نه ساختن دوباره‌ی SVG)
let linePoly = null;
function drawLines() {
  if (!linePoly || !linesEl.contains(linePoly)) {
    linesEl.setAttribute("viewBox", "0 0 100 100");
    linesEl.innerHTML =
      `<polyline points="" fill="none" stroke="var(--line)" stroke-width="3.5" ` +
      `stroke-linecap="round" stroke-linejoin="round"/>`;
    linePoly = linesEl.firstChild;
  }
  if (path.length === 0) {
    linePoly.setAttribute("points", "");
    return;
  }
  const points = path.map(letterCenter);
  if (pointer) points.push(pointer);
  linePoly.setAttribute("points", points.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" "));
}

// کشیدن انگشت: همه‌ی حرکت‌ها جمع می‌شوند و در هر فریم فقط یک بار صفحه به‌روز می‌شود
let dragFrame = 0;
let dragRect = null;     // جای دایره، یک بار در شروع کشیدن خوانده می‌شود
let pathChanged = false;
function scheduleDraw() {
  if (dragFrame) return;
  dragFrame = requestAnimationFrame(() => {
    dragFrame = 0;
    if (pathChanged) {
      pathChanged = false;
      updateSelection();
    } else drawLines();
  });
}

function currentWord() {
  return path.map((i) => puzzle.letters[i]).join("");
}

function updateSelection() {
  letterEls.forEach((el, i) => el.classList.toggle("active", path.includes(i)));
  const word = currentWord();
  clearTimeout(previewTimer);
  const cls = "preview" + (word ? " show" : "");
  if (previewEl.className !== cls) previewEl.className = cls;
  if (previewEl.textContent !== word) previewEl.textContent = word;
  drawLines();
}

// حرفی که تازه انتخاب شده یک لحظه می‌پرد
function pickLetter(i) {
  const el = letterEls[i];
  el.classList.add("picked");
  setTimeout(() => el.classList.remove("picked"), 140);
  feelLetter(path.length);
}

function onPointerDown(e) {
  if (locked || dragging) return;
  const p = toWheel(e);
  const i = letterAt(p);
  if (i < 0) return;
  e.preventDefault();
  dragRect = wheelEl.getBoundingClientRect();
  dragging = true;
  dragPointer = e.pointerId;
  path = [i];
  pointer = p;
  pickLetter(i);
  updateSelection();
}

function onPointerMove(e) {
  if (!dragging || e.pointerId !== dragPointer) return;
  // حرکت‌های ریزی که مرورگر بین دو رویداد جمع کرده هم بررسی می‌شوند تا حرفی جا نماند
  const list = e.getCoalescedEvents ? e.getCoalescedEvents() : [];
  for (const ev of list.length ? list : [e]) {
    pointer = toWheel(ev);
    const i = letterAt(pointer);
    if (i < 0) continue;
    if (i === path[path.length - 2]) {             // برگشتن انگشت = پاک کردن آخرین حرف
      path.pop();
      pathChanged = true;
    } else if (!path.includes(i)) {
      path.push(i);
      pickLetter(i);
      pathChanged = true;
    }
  }
  scheduleDraw();
}

function endDrag() {
  if (dragFrame) cancelAnimationFrame(dragFrame);
  dragFrame = 0;
  dragRect = null;
  pathChanged = false;
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

// کلمه‌ای که بازیکن ساخته را با املای درستش برمی‌گرداند؛ «آ» و «ا» یکی حساب می‌شوند
// (مثلاً «اسمان» که با خانه‌ی «ا» ساخته شده، همان «آسمان» است)
function matchWord(word, list) {
  if (list.includes(word)) return word;
  const key = fold(word);
  return list.find((w) => fold(w) === key) || word;
}

function submitWord(raw) {
  const level = puzzle;
  let word = normalize(raw);
  word = matchWord(word, found);
  if (!found.includes(word)) word = matchWord(word, level.words);
  if (!level.words.includes(word)) word = matchWord(word, bonusWords);
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
    if (window.KalameSound && settings.sound) KalameSound.found(activeTheme, word.length, streak); // صدای ظاهر (sound.js)؛ خاموش با تنظیمات
    emit("found", { word, cells: wordCells(word) });
    checkDone();
    showMeaningTip();
  } else if (bonusWords.includes(word)) {
    // کلمه‌ی درستی که در جدول نیست: به صندوق کلمه‌ها می‌رود (هر کلمه فقط یک بار)
    if (save.chest.words.includes(word)) {
      showPreview(`«${word}» قبلاً توی صندوقه`, "show note", 1300);
    } else {
      addToChest(word);
      showPreview(chestReady() ? `${word} · صندوق پر شد!` : `${word} · به صندوق رفت`, "bonus", 1300);
      emit("bonus", { word });
      if (noteAchievements()) setTimeout(() => showPreview("دستاورد تازه! از منو بگیرش", "show note", 2200), 1400);
    }
  } else {
    streak = 0;
    showPreview(word, "wrong", 600);
    emit("wrong", { word });
  }
}

// ---------- معنی کلمه‌ها ----------

// زدن روی خانه‌ای از کلمه‌ی پیدا شده؛ اگر خانه محل تقاطع دو کلمه باشد، معنی هر دو نشان داده می‌شود
function onBoardTap(e) {
  const cell = e.target.closest(".cell.filled");
  if (!cell || !puzzle) return;
  const key = Object.keys(cellEls).find((k) => cellEls[k] === cell);
  const words = puzzle.words.filter((w) => found.includes(w) && layout.placements[w].some(({ r, c }) => r + "," + c === key));
  if (words.length) showMeanings(words);
}

function meaningItem(word) {
  const item = document.createElement("div");
  item.className = "meaning";
  item.innerHTML = `<div class="meaning-word"></div><div class="meaning-text"></div>`;
  item.querySelector(".meaning-word").textContent = word;
  item.querySelector(".meaning-text").textContent = dict.get(word) || extraDict.get(word) || "معنی این کلمه هنوز نوشته نشده.";
  return item;
}

function showMeanings(words) {
  $("meaningList").replaceChildren(...words.map(meaningItem));
  $("meaningSheet").classList.remove("hidden");
}

// کارت مرحله‌ای که بازیکن قبلاً رد کرده: همه‌ی کلمه‌هایش با معنی، و دکمه‌ی بازی دوباره
function showLevelSheet(i) {
  const level = levelAt(i);
  if (!level) return play(i);
  // کوتاه‌ترها اول، مثل جدول
  const words = [...level.words].sort((a, b) => a.length - b.length || a.localeCompare(b, "fa"));
  $("levelSheetTitle").textContent = `مرحله‌ی ${faDigits(i + 1)}`;
  const name = levelName(i);
  $("levelSheetSub").textContent = (name ? `«${name}» · ` : "") + `${faDigits(words.length)} کلمه`;
  const list = $("levelWords");
  list.replaceChildren(...words.map(meaningItem));
  list.scrollTop = 0;
  $("levelReplay").onclick = () => {
    hideLevelSheet();
    play(i);
  };
  $("levelSheet").classList.remove("hidden");
}

function hideLevelSheet() {
  $("levelSheet").classList.add("hidden");
}

// ---------- صندوق کلمه‌ها ----------

const chestReady = () => save.chest.fill >= CHEST_SIZE;

// حلقه‌ی دور دکمه‌ی صندوق نشان می‌دهد چقدر پر شده؛ وقتی پر است، دکمه می‌درخشد
function updateChest() {
  const btn = $("chestBtn");
  const fill = Math.min(save.chest.fill, CHEST_SIZE);
  btn.style.setProperty("--fill", fill / CHEST_SIZE);
  btn.classList.toggle("ready", chestReady());
  btn.setAttribute("aria-label", `صندوق کلمه‌ها: ${faDigits(fill)} از ${faDigits(CHEST_SIZE)}`);
}

function addToChest(word) {
  save.chest.words.push(word);
  save.chest.fill++;
  persist();
  // کلمه از بالای دایره به سمت صندوق پرواز می‌کند
  const btn = $("chestBtn");
  const from = previewEl.getBoundingClientRect(), to = btn.getBoundingClientRect();
  const done = () => {
    updateChest();
    btn.classList.remove("bump");
    void btn.offsetWidth;
    btn.classList.add("bump");
  };
  if (calm() || !to.width) return done();
  const fly = document.createElement("div");
  fly.className = "flying-word";
  fly.textContent = word;
  fly.style.left = from.left + from.width / 2 + "px";
  fly.style.top = from.top + from.height / 2 + "px";
  document.body.appendChild(fly);
  const dx = to.left + to.width / 2 - (from.left + from.width / 2), dy = to.top + to.height / 2 - (from.top + from.height / 2);
  fly.animate(
    [{ transform: "translate(-50%, -50%) scale(1)", opacity: 1 },
      { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(0.3)`, opacity: 0.6 }],
    { duration: 700, delay: 350, easing: "cubic-bezier(.5,0,.7,1)", fill: "both" }
  ).finished.then(() => {
    fly.remove();
    done();
  });
}

function showChest() {
  const { words, fill } = save.chest;
  const now = Math.min(fill, CHEST_SIZE);
  $("chestText").textContent = words.length
    ? `${faDigits(words.length)} کلمه در صندوق · هر ${faDigits(CHEST_SIZE)} کلمه‌ی تازه = ${faDigits(CHEST_REWARD)} سکه`
    : `کلمه‌های درستی که در جدول نیستند اینجا جمع می‌شوند. هر ${faDigits(CHEST_SIZE)} کلمه = ${faDigits(CHEST_REWARD)} سکه.`;
  $("chestBarFill").style.width = (now / CHEST_SIZE) * 100 + "%";
  $("chestBarText").textContent = `${faDigits(now)} از ${faDigits(CHEST_SIZE)}`;
  // تازه‌ترین کلمه اول
  $("chestWords").replaceChildren(...[...words].reverse().map(meaningItem));
  $("chestWords").classList.toggle("hidden", !words.length);
  $("chestWords").scrollTop = 0;
  const btn = $("chestOpen");
  btn.textContent = chestReady() ? `باز کن و ${faDigits(CHEST_REWARD)} سکه بگیر` : "باشه";
  btn.onclick = chestReady() ? openChest : hideChest;
  $("chestArt").classList.toggle("ready", chestReady());
  $("chestArt").classList.remove("opened");
  $("chestSheet").classList.remove("hidden");
}

function hideChest() {
  $("chestSheet").classList.add("hidden");
}

function openChest() {
  if (!chestReady()) return;
  save.chest.fill -= CHEST_SIZE;
  save.coins += CHEST_REWARD;
  persist();
  const art = $("chestArt");
  art.classList.add("opened");
  sound("reward");
  const target = document.querySelector(screenNow === "play" ? "#app .coins" : ".screen:not(.hidden) .coins");
  flyCoins(CHEST_REWARD, art.getBoundingClientRect(), target);
  updateChest();
  $("chestOpen").disabled = true;
  setTimeout(() => {
    $("chestOpen").disabled = false;
    showChest(); // اگر کلمه‌ی کافی برای صندوق بعدی هم جمع شده، دوباره قابل باز کردن است
  }, 1100);
}

// ---------- دستاوردها ----------
// هر دستاورد چند سطح دارد؛ با رسیدن به هدف هر سطح، جایزه‌اش در صفحه‌ی دستاوردها گرفته می‌شود

const ACHIEVEMENTS = [
  { id: "levels", icon: "flag", name: "مسافر", goals: [1, 10, 25, 50, 100, 250, 500],
    text: (n) => `${faDigits(n)} مرحله را تمام کن`, value: () => save.unlocked },
  { id: "words", icon: "book", name: "کلمه‌شناس", goals: [25, 100, 300, 750, 1500, 3000],
    text: (n) => `${faDigits(n)} کلمه‌ی جدول را پیدا کن`, value: () => save.stats.words || 0 },
  { id: "chest", icon: "chest", name: "گنج‌یاب", goals: [5, 20, 50, 100, 200, 400],
    text: (n) => `${faDigits(n)} کلمه در صندوق جمع کن`, value: () => save.chest.words.length },
  { id: "nohint", icon: "bulb", name: "بی‌نیاز از راهنما", goals: [5, 25, 75, 150, 300],
    text: (n) => `${faDigits(n)} مرحله را بدون راهنما تمام کن`, value: () => save.stats.noHint },
  { id: "days", icon: "sun", name: "همیشه همراه", goals: [3, 7, 14, 30],
    text: (n) => `${faDigits(n)} روز پشت سر هم به بازی سر بزن`, value: () => save.stats.bestRun },
  { id: "looks", icon: "palette", name: "جهانگرد", goals: [2, 4, 6],
    text: (n) => `با ${faDigits(n)} ظاهر مختلف مرحله تمام کن`, value: () => save.stats.themes.length },
];

const ACH_ICONS = {
  flag: '<path d="M6 21V4M6 4h11l-2.5 4L17 12H6"/>',
  book: '<path d="M4 5.5C6.5 4 9.5 4 12 6c2.5-2 5.5-2 8-.5V19c-2.5-1.5-5.5-1.5-8 .5-2.5-2-5.5-2-8-.5Z M12 6v13.5"/>',
  chest: '<path d="M3 11h18v8a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Z M3 11V9a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v2 M10.5 10h3v4h-3Z"/>',
  bulb: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3Z M4 4l16 16"/>',
  sun: '<path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M5 19l1.5-1.5M17.5 6.5 19 5"/>',
  palette: '<path d="M12 3a9 9 0 1 0 0 18c1.4 0 2-.9 2-1.8 0-1.4-1.2-1.6-1.2-2.8 0-1 .8-1.6 1.8-1.6H17a4 4 0 0 0 4-4C21 6.6 17 3 12 3Z M7.5 11.5h.01M10 7.5h.01M15 7.5h.01"/>',
};

const achTier = (a) => Math.min(intOr(save.achievements[a.id], 0), a.goals.length);
const achReady = (a) => achTier(a) < a.goals.length && a.value() >= a.goals[achTier(a)];
const readyCount = () => ACHIEVEMENTS.filter(achReady).length;

// آیا از بار قبل که پرسیده شد، دستاورد تازه‌ای آماده‌ی گرفتن شده؟
let achSeen = null;
function noteAchievements() {
  const n = readyCount();
  const fresh = achSeen !== null && n > achSeen;
  achSeen = n;
  return fresh;
}

function renderAchievements() {
  $("achList").replaceChildren(...ACHIEVEMENTS.map((a) => {
    const tier = achTier(a), done = tier >= a.goals.length;
    const goal = a.goals[Math.min(tier, a.goals.length - 1)];
    const value = a.value(), ready = !done && value >= goal;
    const card = document.createElement("div");
    card.className = "ach" + (ready ? " ready" : "") + (done ? " done" : "");
    card.innerHTML = `
      <div class="ach-icon"><svg viewBox="0 0 24 24" aria-hidden="true">${ACH_ICONS[a.icon]}</svg></div>
      <div class="ach-body">
        <div class="ach-name"><span></span><span class="ach-tiers">${a.goals.map((_, i) => `<i class="${i < tier ? "on" : ""}"></i>`).join("")}</span></div>
        <div class="ach-text"><span></span><b class="ach-count"></b></div>
        <div class="ach-bar"><span></span></div>
      </div>
      <button class="ach-btn" type="button"><span class="coin-icon"></span><span class="ach-reward"></span></button>`;
    card.querySelector(".ach-name span").textContent = a.name;
    card.querySelector(".ach-text span").textContent = done ? "همه‌ی سطح‌ها کامل شد" : a.text(goal);
    card.querySelector(".ach-bar span").style.width = Math.min(value / goal, 1) * 100 + "%";
    card.querySelector(".ach-count").textContent = done ? "✓" : `${faDigits(Math.min(value, goal))} از ${faDigits(goal)}`;
    const btn = card.querySelector(".ach-btn");
    btn.querySelector(".ach-reward").textContent = done ? "" : "+" + faDigits(ACH_REWARDS[tier] || 0);
    btn.disabled = !ready;
    btn.hidden = done;
    btn.setAttribute("aria-label", ready ? `گرفتن ${faDigits(ACH_REWARDS[tier])} سکه` : "هنوز آماده نیست");
    btn.onclick = () => claimAchievement(a, btn);
    return card;
  }));
}

function claimAchievement(a, btn) {
  if (!achReady(a)) return;
  const tier = achTier(a);
  const reward = ACH_REWARDS[tier] || 0;
  save.achievements[a.id] = tier + 1;
  save.coins += reward;
  persist();
  sound("reward");
  flyCoins(reward, btn.getBoundingClientRect(), document.querySelector("#screenAchievements .coins"));
  achSeen = readyCount();
  renderAchievements();
}

// بازیکن‌های قدیمی آمار «کلمه‌های جدول» نداشتند: از روی مرحله‌های تمام‌شده تخمین زده می‌شود
// (مرحله‌های دست‌ساز دقیق، بقیه به طور میانگین ۵ کلمه، تا ساختن صدها مرحله بازی را کند نکند)
function estimateWordStats() {
  if (save.stats.words !== null) return;
  let n = 0;
  for (let i = 0; i < save.unlocked; i++) n += i < handmade.length ? handmade[i].words.length : 5;
  save.stats.words = n;
  persist();
}

function hideMeanings() {
  $("meaningSheet").classList.add("hidden");
}

// بار اولی که بازیکن کلمه‌ای پیدا می‌کند، یاد می‌گیرد که با زدن روی کلمه معنی‌اش را ببیند
function showMeaningTip() {
  if (save.tips.meaning || !dict.size) return;
  save.tips.meaning = true;
  persist();
  setTimeout(() => showPreview("روی کلمه‌ها بزن تا معنی‌شون رو ببینی", "show note", 2800), 900);
}

// پیام تشویقی وسط جدول: برای کلمه‌ای که همه‌ی حروف را دارد، یا چند کلمه‌ی درست پشت سر هم
const PRAISES = ["خوبه!", "عالی!", "فوق‌العاده!", "بی‌نظیر!", "محشر!"];

function praise(word) {
  let text = null;
  if (word.length >= 4 && word.length === puzzle.letters.length) text = "شاهکار!";
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
  for (const w of puzzle.words) {
    if (!found.includes(w) && wordCells(w).every(isFilled)) found.push(w);
  }
}

function checkDone() {
  collectCompletedWords();
  if (found.length === puzzle.words.length) finishLevel();
  else saveLevelState();
}

// ---------- سکه و راهنما ----------

function updateCoins() {
  for (const el of document.querySelectorAll(".coin-count")) el.textContent = faDigits(save.coins);
  $("hintLetterBtn").classList.toggle("poor", save.coins < COST_HINT_LETTER);
  $("hintWordBtn").classList.toggle("poor", save.coins < COST_HINT_WORD);
  if (typeof refreshFreeHints === "function") refreshFreeHints(); // extras.js
}

function bumpCoins() {
  for (const el of document.querySelectorAll(".coins")) {
    el.classList.remove("bump");
    void el.offsetWidth;
    el.classList.add("bump");
  }
}

function spend(cost) {
  // راهنمای رایگان (از گردونه‌ی شانس) پیش از سکه خرج می‌شود
  if (save.x.freeHints > 0) {
    save.x.freeHints--;
    persist();
    updateCoins();
    return true;
  }
  if (save.coins < cost) {
    showPreview("سکه‌ی کافی نداری", "wrong note", 1400);
    if (store && store.ready) setTimeout(() => { if (screenNow === "play") openShop(); }, 900);
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
  const left = puzzle.words.filter((w) => !found.includes(w));
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
  const hinted = Object.values(cellEls).some((el) => el.classList.contains("hinted"));
  if (isDaily()) return finishDaily(hinted); // daily.js
  if (typeof finishMode === "function" && finishMode(hinted)) return; // حالت سرعتی و چالش (more.js)
  locked = true;
  const first = current === save.unlocked;
  // پایان هر فصل (۲۰ مرحله) سکه‌ی بیشتری دارد (chapters.js)
  const reward = first ? COINS_PER_LEVEL + (endsChapter(current) ? CHAPTER_REWARD : 0) : 0;
  if (first) save.unlocked++;
  save.coins += reward;
  // آمار دستاوردها؛ کلمه‌ها و «بدون راهنما» فقط بار اولِ هر مرحله شمرده می‌شوند
  if (first) {
    save.stats.words = (save.stats.words || 0) + puzzle.words.length;
    if (!hinted) save.stats.noHint++;
  }
  if (!save.stats.themes.includes(activeTheme)) save.stats.themes.push(activeTheme);
  delete save.partial[playKey];
  persist();
  newAchievement = noteAchievements();
  // هر ظاهر می‌تواند با --complete-delay برای انیمیشن خودش وقت بیشتری بگیرد
  const delay = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--complete-delay"), 10);
  const key = playKey;
  setTimeout(() => {
    if (screenNow === "play" && playKey === key) showComplete(first, reward);
  }, delay || 700);
}

function showComplete(first, reward) {
  const hasNext = hasLevel(current + 1);
  const n = faDigits(current + 1);
  const card = document.querySelector("#overlay .card");
  for (const el of card.querySelectorAll(".extra")) el.remove(); // تزئین‌های ظاهر قبلی

  $("overlayTitle").textContent = hasNext ? "آفرین!" : "تبریک!";
  $("overlayText").textContent = !hasNext
    ? "همه‌ی مرحله‌ها رو تموم کردی."
    : first ? `مرحله‌ی ${n} تموم شد.` : `مرحله‌ی ${n} دوباره تموم شد.`;
  $("overlayReward").classList.toggle("hidden", !reward);
  $("overlayReward").querySelector(".reward-count").textContent = "+" + faDigits(reward);
  if (first && endsChapter(current)) $("overlayText").after(chapterDoneCard(current));
  if (newAchievement) {
    $("overlayReward").insertAdjacentHTML("afterend", `<div class="extra ach-note">دستاورد تازه! از منو بگیرش</div>`);
    newAchievement = false;
  }

  const btn = $("overlayBtn");
  btn.textContent = hasNext ? "مرحله‌ی بعد" : "منو";
  btn.onclick = hasNext ? () => startLevel(current + 1) : goHome;
  $("overlayMenu").classList.toggle("hidden", !hasNext);
  $("overlay").classList.remove("hidden");

  updateCoins();
  emit("complete", { level: current, finished: !hasNext, first });
  celebrate();
  if (reward) {
    setTimeout(() => {
      flyCoins(reward, $("overlayReward").querySelector(".coin-icon").getBoundingClientRect(), document.querySelector("#app .coins"));
    }, 350);
  }
}

const calm = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

// سکه‌ها از جای from (پنجره‌ی جایزه) به شمارنده‌ی سکه‌ی target پرواز می‌کنند
function flyCoins(amount, from, target) {
  const to = target ? target.getBoundingClientRect() : null;
  if (calm() || !from || !from.width || !to || !to.width) {
    sound("coin");
    updateCoins();
    return bumpCoins();
  }

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
      sound("coin");
      shown += amount / N;
      count.textContent = faDigits(Math.round(shown));
      ghost.classList.remove("bump");
      void ghost.offsetWidth;
      ghost.classList.add("bump");
      if (k === N - 1) {
        updateCoins();
        setTimeout(() => ghost.remove(), 600);
      }
    });
  }
}

// جشن پایان مرحله: تکه‌های رنگی از بالای پنجره بیرون می‌پرند (شکل و رنگشان را هر ظاهر تعیین می‌کند)
function celebrate() {
  const ev = eventNow();
  if (calm() || (ev && ev.quiet)) return; // در روزهای سوگواری بی‌کاغذرنگی
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

// ---------------------------------------------------------------------------
// فروشگاه سکه (پرداخت کافه‌بازار یا مایکت؛ در مرورگر غیرفعال است)
// ---------------------------------------------------------------------------
// پلاگین اندروید CoinStore (android/.../CoinStorePlugin.java) امضای هر خرید را بررسی می‌کند.
// ترتیب: خرید ← سکه اضافه و ذخیره می‌شود ← خرید «مصرف» می‌شود تا دوباره قابل خرید باشد.
// اگر بازی وسط کار بسته شود، دفعه‌ی بعد خریدهای مصرف‌نشده تحویل داده می‌شوند.

const nativeStore = window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()
  ? window.Capacitor.Plugins.CoinStore : null;
let store = null;         // { ready, storeName, reason } وقتی پلاگین هست
let shopPrices = {};      // id ← قیمت از فروشگاه
let shopBusy = false;
const moreProducts = [];  // محصول‌های more.js (قلک، بسته‌ی شروع)

function initStore() {
  if (!nativeStore) return;
  nativeStore.init().then((info) => {
    store = info;
    $("shopBtn").classList.remove("hidden");
    for (const el of document.querySelectorAll(".coins")) el.classList.add("can-buy");
    if (!info.ready) return;
    const ids = [...COIN_PACKS.map((p) => p.id), ...THEMES.filter((t) => t.product).map((t) => t.product), ...moreProducts];
    nativeStore.products({ ids }).then((res) => {
      for (const p of res.products || []) shopPrices[p.id] = p.price;
      if (screenNow === "shop") renderShop();
      if (screenNow === "themes") renderThemes();
    }).catch(() => {});
    deliverPending();
  }).catch(() => {});
}

// خریدهایی که پولشان داده شده ولی هنوز سکه‌شان تحویل نشده
function deliverPending() {
  return nativeStore.pending().then((res) => {
    for (const p of res.purchases || []) deliver(p, null);
  }).catch(() => {});
}

function deliver(purchase, fromEl) {
  if (typeof deliverMore === "function" && deliverMore(purchase, fromEl)) return; // قلک و بسته‌ی شروع (more.js)
  const look = THEMES.find((t) => t.product && t.product === purchase.id);
  if (look) return deliverTheme(look);
  const pack = COIN_PACKS.find((p) => p.id === purchase.id);
  if (!pack || !purchase.token) return;
  const isNew = !save.paid.includes(purchase.token);
  if (isNew) {
    save.coins += pack.coins;
    save.paid.push(purchase.token);
    if (save.paid.length > 100) save.paid.shift();
    persist();
  }
  nativeStore.consume({ token: purchase.token }).catch(() => {}); // اگر نشد، دفعه‌ی بعد دوباره امتحان می‌شود
  if (!isNew) return;
  const target = document.querySelector(".screen:not(.hidden) .coins");
  if (fromEl && target) flyCoins(pack.coins, fromEl.getBoundingClientRect(), target);
  else {
    updateCoins();
    bumpCoins();
  }
  showShopNote(`${faDigits(pack.coins)} سکه به سکه‌هات اضافه شد. ممنون!`);
}

// از وسط بازی، فروشگاه روی بازی باز می‌شود تا «بازگشت» دوباره به همان مرحله برگردد
function openShop() {
  if (screenNow === "play") location.hash = "shop";
  else open("shop");
}

function showShopNote(text) {
  $("shopNote").textContent = text;
  $("shopNote").classList.toggle("hidden", !text);
}

function renderShop() {
  if (!store) return;
  showShopNote(store.ready ? "" : store.reason || `خرید از ${store.storeName} الان ممکن نیست.`);
  const list = $("shopList");
  list.replaceChildren();
  for (const pack of COIN_PACKS) {
    const item = document.createElement("div");
    item.className = "ach shop-pack";
    item.innerHTML = `
      <div class="ach-icon"><span class="coin-icon"></span><span class="coin-icon"></span><span class="coin-icon"></span></div>
      <div class="ach-body">
        <div class="ach-name"><span class="shop-name"></span></div>
        <div class="ach-text"><span class="shop-coins"></span></div>
      </div>
      <button class="ach-btn" type="button"><span class="shop-price"></span></button>`;
    item.querySelector(".shop-name").textContent = pack.name;
    if (pack.tag) {
      const tag = document.createElement("span");
      tag.className = "shop-tag";
      tag.textContent = pack.tag;
      item.querySelector(".ach-name").appendChild(tag);
    }
    item.querySelector(".shop-coins").textContent = `${faDigits(pack.coins)} سکه`;
    const btn = item.querySelector(".ach-btn");
    const price = shopPrices[pack.id];
    btn.querySelector(".shop-price").textContent = price ? faDigits(price) : "خرید";
    btn.disabled = !store.ready;
    btn.addEventListener("click", () => buyPack(pack, item));
    list.appendChild(item);
  }
  emit("shop", { list });
}

function buyPack(pack, item) {
  if (shopBusy || !store || !store.ready) return;
  shopBusy = true;
  item.classList.add("busy");
  showShopNote("");
  nativeStore.buy({ id: pack.id })
    .then((purchase) => deliver(purchase, item.querySelector(".ach-icon")))
    .catch((err) => {
      if (err && err.code === "CANCELED") return;
      if (err && err.code === "ALREADY_OWNED") return deliverPending();
      showShopNote((err && err.message) || "خرید انجام نشد. دوباره امتحان کن.");
    })
    .finally(() => {
      shopBusy = false;
      item.classList.remove("busy");
    });
}

function showErrors(title, errors) {
  const box = $("errorBox");
  box.textContent = (box.classList.contains("hidden") ? "" : box.textContent + "\n") + title + "\n" + errors.join("\n");
  box.classList.remove("hidden");
}

// ---------------------------------------------------------------------------
// صفحه‌ها: انتخاب ظاهر، منو، فهرست مرحله‌ها، بازی
// ---------------------------------------------------------------------------
// منو صفحه‌ی اصلی است؛ بقیه با # در آدرس باز می‌شوند تا دکمه‌ی «برگشت» اندروید هم کار کند.

const screens = { themes: $("screenThemes"), home: $("screenHome"), levels: $("screenLevels"), achievements: $("screenAchievements"), settings: $("screenSettings"), shop: $("screenShop"), book: $("screenBook"), play: $("app") };

function route() {
  let name = location.hash.slice(1);
  if (!(name in screens)) name = "home";
  if (!save.theme) name = "themes";                       // بار اول: انتخاب ظاهر
  if (name === "play" && !puzzle) name = "home";         // مثلاً بعد از باز شدن دوباره‌ی برنامه
  if (name === "shop" && !store) name = "home";

  if (dragging) endDrag();
  screenNow = name;
  for (const [key, el] of Object.entries(screens)) el.classList.toggle("hidden", key !== name);
  if (name !== "play") $("overlay").classList.add("hidden");
  if (name !== "home") $("rewardSheet").classList.add("hidden"); // جایزه دفعه‌ی بعد در منو دوباره نشان داده می‌شود
  hideMeanings();
  hideLevelSheet();
  hideChest();
  hideThemeSheet();

  if (name === "themes") renderThemes();
  if (name === "home") renderHome();
  if (name === "levels") renderLevels();
  if (name === "achievements") renderAchievements();
  if (name === "settings") renderSettings();
  if (name !== "play") stopNudge();
  if (name === "shop") renderShop();
  if (name === "book") renderBook(); // extras.js
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
    const owned = themeOwned(t.id);
    const card = document.createElement("button");
    card.type = "button";
    card.className = "tcard tc-" + t.id + (save.theme === t.id && owned ? " selected" : "") + (owned ? "" : " locked");
    card.innerHTML = `<span class="tcard-art"></span><span class="tcard-name"></span><span class="tcard-desc"></span>`;
    card.querySelector(".tcard-name").textContent = t.name;
    card.querySelector(".tcard-desc").textContent = t.desc;
    if (!owned) {
      const tag = document.createElement("span");
      tag.className = "tcard-price";
      tag.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10.5" width="14" height="10" rx="2.2" fill="currentColor"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" fill="none" stroke="currentColor" stroke-width="2.2"/></svg><span></span>`;
      tag.querySelector("span").textContent = themePrice(t);
      card.appendChild(tag);
    }
    card.onclick = () => chooseTheme(t.id);
    list.appendChild(card);
  }
  $("themesBack").classList.toggle("hidden", !save.theme);
}

// قیمت از فروشگاه، یا قیمتی که در THEMES نوشته شده
function themePrice(t) {
  if (shopPrices[t.product]) return faDigits(shopPrices[t.product]);
  return `${faDigits(t.price / 1000)} هزار تومان`;
}

function chooseTheme(id) {
  if (!themeOwned(id)) return showThemeSheet(THEMES.find((t) => t.id === id));
  const firstTime = !save.theme;
  save.theme = id;
  persist();
  applyTheme(id);
  if (firstTime) route();
  else goHome();
}

// ---------- خرید ظاهر ----------

let themeOnSheet = null;

function showThemeSheet(t) {
  themeOnSheet = t;
  const art = $("themeSheetArt");
  art.className = "tcard tc-" + t.id + " theme-sheet-art";
  $("themeSheetName").textContent = t.name;
  $("themeSheetDesc").textContent = t.desc;
  const btn = $("themeBuy");
  const canBuy = !!(store && store.ready);
  btn.disabled = !canBuy || shopBusy;
  btn.textContent = `خرید با ${themePrice(t)}`;
  // در مرورگر خرید نداریم؛ برای آزمودن، ظاهر بی‌پرداخت باز می‌شود
  $("themeTry").classList.toggle("hidden", !!nativeStore);
  $("themeSheetNote").textContent = canBuy ? "یک بار می‌خری و همیشه مال خودته."
    : nativeStore ? (store && store.reason) || "خرید الان ممکن نیست."
    : "خرید فقط در نسخه‌ی بازار و مایکت ممکن است.";
  $("themeSheet").classList.remove("hidden");
}

function hideThemeSheet() {
  $("themeSheet").classList.add("hidden");
  themeOnSheet = null;
}

function buyTheme() {
  const t = themeOnSheet;
  if (!t || shopBusy || !store || !store.ready) return;
  shopBusy = true;
  $("themeBuy").disabled = true;
  nativeStore.buy({ id: t.product })
    .then((purchase) => deliver(purchase, null))
    .catch((err) => {
      if (err && err.code === "CANCELED") return;
      if (err && err.code === "ALREADY_OWNED") return deliverPending();
      $("themeSheetNote").textContent = (err && err.message) || "خرید انجام نشد. دوباره امتحان کن.";
    })
    .finally(() => {
      shopBusy = false;
      if (themeOnSheet) $("themeBuy").disabled = false;
    });
}

// ظاهر خریده‌شده: برای همیشه باز است و مصرف نمی‌شود (برای همین بعد از نصب دوباره هم برمی‌گردد)
function deliverTheme(t) {
  const isNew = !save.owned.includes(t.id);
  if (isNew) {
    save.owned.push(t.id);
    persist();
  }
  // بازیکن قبلاً این ظاهر را انتخاب کرده بود و تا رسیدن خرید «ساده» می‌دید
  if (save.theme === t.id && activeTheme !== t.id) {
    applyTheme(t.id);
    route();
  }
  if (themeOnSheet && themeOnSheet.id === t.id) {
    hideThemeSheet();
    if (isNew) sound("reward");
    chooseTheme(t.id);
  } else if (screenNow === "themes") renderThemes();
}

function renderHome() {
  $("homeSub").textContent = (THEMES.find((t) => t.id === activeTheme) || THEMES[0]).name;
  // صحنه‌ی زنده‌ی بالای منو را ظاهر فعلی می‌سازد (level: مرحله‌ی بعدی، done: تعداد مرحله‌های تمام‌شده)
  $("homeScene").innerHTML = "";
  const ready = hasLevel(0);
  const allDone = !hasLevel(save.unlocked);
  const next = allDone ? save.unlocked - 1 : save.unlocked;
  if (ready) emit("home", { level: next, done: save.unlocked, total: generator ? Infinity : handmade.length });
  $("continueBtn").disabled = !ready;
  if (ready) prepareLevel(next);
  updateAchBadge();
  renderDailyBtn(); // daily.js
  renderEvent();
  $("continueSub").textContent = allDone && ready
    ? "همه‌ی مرحله‌ها تموم شده"
    : `مرحله‌ی ${faDigits(next + 1)} · ${chapterInfo(chapterOf(next)).name}`;

  // اولین بار هر روز که منو باز می‌شود، جایزه‌ی روزانه نشان داده می‌شود
  if (rewardDue()) setTimeout(() => {
    if (screenNow === "home" && rewardDue()) showDailyReward();
  }, 500);
}

function updateAchBadge() {
  const n = readyCount();
  $("achBadge").textContent = faDigits(n);
  $("achBadge").classList.toggle("hidden", !n);
}

function continueGame() {
  if (!hasLevel(save.unlocked)) open("levels");
  else play(save.unlocked);
}

// ---------- نقشه‌ی مرحله‌ها: جاده‌ای پیچ‌وتاب‌دار که از پایین صفحه بالا می‌رود ----------

const MAP_STEP = 96;   // فاصله‌ی عمودی دو مرحله
const MAP_PAD = 80;    // فاصله‌ی اولین و آخرین مرحله از لبه‌ها
const mapX = (i) => 50 + 26 * Math.sin(i * 1.15); // جای افقی هر مرحله، به درصد

const MAP_AHEAD = 10;   // چند مرحله‌ی قفل جلوتر از مرحله‌ی فعلی روی نقشه دیده شود
const MAP_GAP = 170;   // جای کارت هر فصل، زیر اولین مرحله‌اش

function renderLevels() {
  const map = $("levelMap");
  // مرحله‌ها بی‌پایان‌اند؛ نقشه تا چند مرحله جلوتر از مرحله‌ی فعلی کشیده می‌شود
  const n = generator ? Math.max(save.unlocked + 1 + MAP_AHEAD, handmade.length) : handmade.length;
  const H = MAP_PAD * 2 + Math.max(n - 1, 0) * MAP_STEP + (chapterOf(Math.max(n - 1, 0)) + 1) * MAP_GAP;
  const y = (i) => H - MAP_PAD - i * MAP_STEP - (chapterOf(i) + 1) * MAP_GAP;
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
  for (let i = 0; i < n; i++) {
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
      if (status === "done") return showLevelSheet(i);
      if (status === "current") return play(i);
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

    // کارت فصل (اسم و منظره) زیر اولین مرحله‌ی هر فصل
    if (i % CHAPTER_SIZE === 0) {
      const banner = chapterBanner(chapterOf(i));
      banner.style.top = y(i) + (MAP_STEP + MAP_GAP) / 2 - 10 + "px";
      track.appendChild(banner);
    }

    if (status === "current") {
      const marker = document.createElement("span");
      marker.className = "map-marker";
      marker.style.left = x + "%";
      marker.style.top = y(i) - 50 + "px";
      track.appendChild(marker);
    }
  }

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
$("rewardBtn").addEventListener("click", claimDailyReward);
boardEl.addEventListener("click", onBoardTap);
$("meaningClose").addEventListener("click", hideMeanings);
$("meaningSheet").addEventListener("click", (e) => {
  if (e.target === e.currentTarget) hideMeanings(); // زدن بیرون کارت
});
$("levelClose").addEventListener("click", hideLevelSheet);
$("levelSheet").addEventListener("click", (e) => {
  if (e.target === e.currentTarget) hideLevelSheet();
});
$("levelsBtn").addEventListener("click", () => open("levels"));
$("achBtn").addEventListener("click", () => open("achievements"));
$("chestBtn").addEventListener("click", showChest);
$("chestClose").addEventListener("click", hideChest);
$("chestSheet").addEventListener("click", (e) => {
  if (e.target === e.currentTarget) hideChest();
});
$("themesBtn").addEventListener("click", () => open("themes"));
$("themeBuy").addEventListener("click", buyTheme);
$("themeClose").addEventListener("click", hideThemeSheet);
$("themeSheet").addEventListener("click", (e) => {
  if (e.target === e.currentTarget) hideThemeSheet();
});
$("themeTry").addEventListener("click", () => {
  const t = themeOnSheet;
  if (!t) return;
  save.owned.push(t.id);
  hideThemeSheet();
  chooseTheme(t.id);
});
$("shopBtn").addEventListener("click", openShop);
for (const el of document.querySelectorAll(".coins")) {
  el.addEventListener("click", () => {
    if (store && screenNow !== "shop") openShop();
  });
}
for (const btn of document.querySelectorAll("[data-back]")) btn.addEventListener("click", goHome);
$("hintLetterBtn").querySelector(".cost-count").textContent = faDigits(COST_HINT_LETTER);
$("hintWordBtn").querySelector(".cost-count").textContent = faDigits(COST_HINT_WORD);

// ---------- صفحه‌ی بارگذاری (در index.html) ----------
const LOADING_MIN_MS = 2000; // دست‌کم این‌قدر دیده می‌شود تا تصویرش به چشم بیاید

// نمایش نرم: عدد نشان‌داده‌شده هر فریم کمی به هدف نزدیک می‌شود و تا وقتی کار تمام نشده،
// آرام خودش جلو می‌رود تا نوار هیچ‌وقت نایستد. فقط transform عوض می‌شود (بدون چیدمان دوباره).
const loadingBar = { target: 0, shown: 0, raf: 0, done: false, last: 0 };

function loadingFrame(now) {
  const fill = $("loadingFill"), tile = $("loadingTile"), track = $("loadingTrack");
  if (!fill || !tile || !track) return;
  const dt = Math.min(64, now - (loadingBar.last || now));
  loadingBar.last = now;
  if (!loadingBar.done) loadingBar.target = Math.min(0.9, loadingBar.target + dt * 0.00006);
  const goal = loadingBar.done ? 1 : loadingBar.target;
  loadingBar.shown += (goal - loadingBar.shown) * (1 - Math.exp(-dt / (loadingBar.done ? 160 : 260)));
  const p = loadingBar.shown;
  fill.style.transform = "translateX(" + ((p - 1) * 100).toFixed(2) + "%)";
  tile.style.transform = "translateX(" + (p * track.offsetWidth).toFixed(1) + "px)";
  if (loadingBar.done && p > 0.995) return;
  loadingBar.raf = requestAnimationFrame(loadingFrame);
}

function loadingProgress(frac) {
  loadingBar.target = Math.max(loadingBar.target, Math.min(frac, 1));
  if (!loadingBar.raf) loadingBar.raf = requestAnimationFrame(loadingFrame);
}

function loadingBurst() {
  const tile = $("loadingTile");
  if (!tile) return;
  for (let i = 0; i < 10; i++) {
    const s = document.createElement("span");
    s.className = "loading-spark";
    const a = (i / 10) * Math.PI * 2;
    s.style.setProperty("--dx", Math.cos(a) * 46 + "px");
    s.style.setProperty("--dy", Math.sin(a) * 46 + "px");
    tile.appendChild(s);
  }
}

function hideLoading() {
  const el = $("loading");
  if (!el) return;
  // تا کمینه‌ی زمان نمایش، نوار آرام جلو می‌رود؛ بعد تا ته پر می‌شود و کاشی می‌پرد
  const wait = Math.max(0, LOADING_MIN_MS - 700 - (Date.now() - (window.loadingStart || 0)));
  loadingProgress(0.85);
  setTimeout(() => {
    loadingBar.done = true;
    loadingProgress(1);
    setTimeout(() => {
      el.classList.add("full");
      loadingBurst();
    }, 380);
    setTimeout(() => {
      el.classList.add("done");
      setTimeout(() => el.remove(), 500);
    }, 1000);
  }, wait);
}

// فایل‌های ظاهرها بعد از این فایل بارگذاری می‌شوند؛ پس شروع را تا آماده شدن صفحه عقب می‌اندازیم
document.addEventListener("DOMContentLoaded", () => {
  // ظاهر پولی‌ای که (هنوز) خریده نشده، تا رسیدن خریدها از فروشگاه «ساده» نشان داده می‌شود
  applyTheme(save.theme && themeOwned(save.theme) ? save.theme : "plain");
  initStore();
  // برنامه همیشه از منو شروع می‌شود
  if (location.hash) history.replaceState(null, "", location.pathname + location.search);

  loadingProgress(0.15);
  let loaded = 0;
  const load = (file) =>
    fetch(file, { cache: "no-store" }).then((res) => {
      if (!res.ok) throw new Error(res.status);
      return res.text();
    }).finally(() => loadingProgress(0.15 + 0.25 * ++loaded));
  const notRead = (file) => () =>
    showErrors(`فایل ${file} خوانده نشد.`, ["بازی را با start-game.cmd یا دستور npm start اجرا کنید."]);

  Promise.all([
    load("levels.txt")
      .then((text) => {
        const result = parseLevels(text);
        handmade = result.levels;
        if (result.errors.length) showErrors("اشکال در فایل levels.txt:", result.errors);
      })
      .catch(notRead("levels.txt")),
    // بدون فهرست کلمه‌ها بازی فقط ۱۰ مرحله‌ی دست‌ساز را دارد
    load("words.txt")
      .then((text) => {
        const result = parseWords(text);
        dict = result.dict;
        wordLevels = result.levels;
        if (result.errors.length) showErrors("اشکال در فایل words.txt:", result.errors);
        generator = createGenerator(dict, result.levels);
      })
      .catch(notRead("words.txt")),
    // کلمه‌های بیشتر برای صندوق؛ اگر نبود، بازی بدون آن‌ها هم کار می‌کند
    load("extra-words.txt")
      .then((text) => {
        extraDict = parseWords(text).dict;
      })
      .catch(() => {}),
  ]).finally(() => {
    estimateWordStats();
    noteAchievements();
    route();
    hideLoading();
  });
});
