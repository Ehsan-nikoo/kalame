"use strict";

// چیزهایی که بازی را جذاب‌تر می‌کنند و به رویدادهای بازی (gameHooks در game.js) گوش می‌دهند:
// ۱. مأموریت‌های روزانه  ۲. مصراع فصل  ۳. کلمه‌ی طلایی  ۴. زنجیره‌ی کلمه  ۵. گردونه‌ی شانس روزانه
// ۶. دفتر واژه‌ها  ۷. لقب  ۸. صفحه‌ی شروع فصل  ۹. پرواز حروف از دایره به جدول
// همه‌ی داده‌ها در save.x ذخیره می‌شوند. این فایل بعد از game.js، feel.js، chapters.js و daily.js بارگذاری می‌شود.

const X = () => save.x;

// ---------------------------------------------------------------------------
// ابزارهای کوچک
// ---------------------------------------------------------------------------

// پیام کوتاه بالای صفحه
let toastTimer = 0;
function toast(text, kind) {
  let el = document.getElementById("toast");
  if (!el) {
    el = document.createElement("div");
    el.id = "toast";
    el.className = "toast";
    el.setAttribute("aria-live", "polite");
    document.body.appendChild(el);
  }
  el.textContent = text;
  el.className = "toast show" + (kind ? " " + kind : "");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 2600);
}

// شمارنده‌ی سکه‌ی صفحه‌ای که الان دیده می‌شود
function visibleCoins() {
  const screen = screens[screenNow];
  return (screen && screen.querySelector(".coins")) || document.querySelector(".coins");
}

// سکه می‌دهد و از جای from (یک عنصر یا مستطیل) به شمارنده پرواز می‌کند
function giveCoins(amount, from) {
  if (!amount) return;
  save.coins += amount;
  persist();
  const rect = from && from.getBoundingClientRect ? from.getBoundingClientRect() : from;
  flyCoins(amount, rect, visibleCoins());
}

// جرقه‌های رنگی (رنگ‌ها از ظاهر فعلی) از نقطه‌ی x,y
function sparkle(x, y, count = 14) {
  if (calm()) return;
  for (let k = 0; k < count; k++) {
    const bit = document.createElement("span");
    bit.className = "confetti c" + (k % 4);
    bit.style.left = x + "px";
    bit.style.top = y + "px";
    document.body.appendChild(bit);
    const a = (k / count) * Math.PI * 2 + Math.random() * 0.4;
    const v = 50 + Math.random() * 60;
    bit.animate(
      [
        { translate: "0 0", rotate: "0deg", opacity: 1 },
        { translate: `${Math.cos(a) * v}px ${Math.sin(a) * v + 40}px`, rotate: `${Math.random() * 540}deg`, opacity: 0 },
      ],
      { duration: 800 + Math.random() * 300, easing: "cubic-bezier(.2,.7,.4,1)" }
    ).finished.then(() => bit.remove());
  }
}

function centerOfEl(el) {
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

// کارت پایین‌آمدنی با ظاهر کارت‌های بازی
function makeSheet(id, inner) {
  const sheet = document.createElement("div");
  sheet.className = "sheet center hidden x-sheet";
  sheet.id = id;
  sheet.setAttribute("role", "dialog");
  sheet.setAttribute("aria-modal", "true");
  sheet.innerHTML = `<div class="card sheet-card level-card">${inner}</div>`;
  sheet.addEventListener("click", (e) => {
    if (e.target === sheet) sheet.classList.add("hidden");
  });
  document.body.appendChild(sheet);
  return sheet;
}

// با هر جابه‌جایی صفحه (و دکمه‌ی برگشت اندروید) کارت‌های این فایل بسته می‌شوند
window.addEventListener("hashchange", () => {
  for (const el of document.querySelectorAll(".x-sheet")) el.classList.add("hidden");
});


// ---------------------------------------------------------------------------
// ۱. مأموریت‌های روزانه
// ---------------------------------------------------------------------------

const MISSIONS = [
  { id: "words15", ev: "found", goal: 15, reward: 15, text: "۱۵ کلمه پیدا کن" },
  { id: "words30", ev: "found", goal: 30, reward: 25, text: "۳۰ کلمه پیدا کن" },
  { id: "levels2", ev: "level", goal: 2, reward: 15, text: "۲ مرحله رو تموم کن" },
  { id: "levels4", ev: "level", goal: 4, reward: 25, text: "۴ مرحله رو تموم کن" },
  { id: "nohint", ev: "nohint", goal: 1, reward: 20, text: "یه مرحله رو بدون راهنما تموم کن" },
  { id: "bonus", ev: "bonus", goal: 1, reward: 15, text: "یه کلمه برای صندوق پیدا کن" },
  { id: "long", ev: "long", goal: 2, reward: 15, text: "۲ کلمه‌ی ۵ حرفی یا بلندتر پیدا کن" },
  { id: "daily", ev: "daily", goal: 1, reward: 20, text: "مرحله‌ی روزانه رو حل کن" },
  { id: "chain", ev: "chain", goal: 1, reward: 20, text: "یه زنجیره‌ی ۵ تایی بساز" },
  { id: "golden", ev: "golden", goal: 1, reward: 20, text: "یه کلمه‌ی طلایی پیدا کن" },
];

// سه مأموریت امروز؛ برای همه‌ی بازیکن‌ها در یک روز یکسان و هر کدام از یک نوع
function todayMissions() {
  const today = todayKey();
  const m = X().missions;
  if (m && m.day === today && Array.isArray(m.ids)) return m;
  const rnd = seededRandom(dayNumber(nowDate()) * 7919 + 13);
  const pool = MISSIONS.map((x) => x);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const ids = [];
  const kinds = new Set();
  for (const mis of pool) {
    if (ids.length === 3) break;
    if (kinds.has(mis.ev)) continue;
    kinds.add(mis.ev);
    ids.push(mis.id);
  }
  X().missions = { day: today, ids, prog: {}, claimed: [] };
  persist();
  return X().missions;
}

function missionProgress(ev, n = 1) {
  const m = todayMissions();
  let changed = false;
  for (const id of m.ids) {
    const mis = MISSIONS.find((x) => x.id === id);
    if (!mis || mis.ev !== ev) continue;
    const before = m.prog[id] || 0;
    if (before >= mis.goal) continue;
    m.prog[id] = Math.min(mis.goal, before + n);
    changed = true;
    if (m.prog[id] >= mis.goal) setTimeout(() => toast(`مأموریت انجام شد: ${mis.text} 🎯`, "good"), 900);
  }
  if (changed) {
    persist();
    updateMissionBadge();
  }
}

function missionsReady() {
  const m = todayMissions();
  return m.ids.filter((id) => {
    const mis = MISSIONS.find((x) => x.id === id);
    return mis && (m.prog[id] || 0) >= mis.goal && !m.claimed.includes(id);
  }).length;
}

function updateMissionBadge() {
  const n = missionsReady();
  const badge = $("missionsBadge");
  badge.textContent = faDigits(n);
  badge.classList.toggle("hidden", !n);
}

const missionSheet = makeSheet("missionSheet", `
  <div class="card-title">مأموریت‌های امروز</div>
  <div class="card-text">هر روز سه مأموریت تازه، با جایزه‌ی سکه</div>
  <div class="mission-list" id="missionList"></div>
  <button class="card-link" type="button" data-close>بستن</button>`);
missionSheet.querySelector("[data-close]").onclick = () => missionSheet.classList.add("hidden");

function renderMissions() {
  const m = todayMissions();
  const list = $("missionList");
  list.replaceChildren();
  for (const id of m.ids) {
    const mis = MISSIONS.find((x) => x.id === id);
    if (!mis) continue;
    const prog = m.prog[id] || 0;
    const done = prog >= mis.goal;
    const claimed = m.claimed.includes(id);
    const item = document.createElement("div");
    item.className = "mission" + (claimed ? " claimed" : done ? " done" : "");
    item.innerHTML = `
      <div class="mission-body">
        <div class="mission-text"></div>
        <div class="mission-bar"><span></span><b></b></div>
      </div>
      <button class="ach-btn mission-btn" type="button"><span class="coin-icon"></span><span></span></button>`;
    item.querySelector(".mission-text").textContent = mis.text;
    item.querySelector(".mission-bar span").style.width = (100 * prog) / mis.goal + "%";
    item.querySelector(".mission-bar b").textContent = `${faDigits(prog)} از ${faDigits(mis.goal)}`;
    const btn = item.querySelector(".mission-btn");
    btn.lastElementChild.textContent = claimed ? "گرفتی" : "+" + faDigits(mis.reward);
    btn.disabled = !done || claimed;
    btn.onclick = () => {
      if (m.claimed.includes(id)) return;
      m.claimed.push(id);
      giveCoins(mis.reward, btn);
      sound("reward");
      sparkle(...Object.values(centerOfEl(btn)));
      renderMissions();
      updateMissionBadge();
    };
    list.appendChild(item);
  }
  // فردا دوباره
  const left = m.ids.length - m.claimed.length;
  if (!left) list.insertAdjacentHTML("beforeend", `<div class="card-text mission-next">همه‌ی مأموریت‌های امروز رو انجام دادی! فردا سه تای تازه میاد.</div>`);
}

function openMissions() {
  renderMissions();
  missionSheet.classList.remove("hidden");
}

// ---------------------------------------------------------------------------
// ۲. مصراع فصل: بعد از تمام شدن هر فصل، یک بیت با یک کلمه‌ی جاافتاده
// ---------------------------------------------------------------------------
// text: بیت کامل؛ word: کلمه‌ای که باید پیدا شود (عیناً در متن هست)

const VERSES = [
  { poet: "فردوسی", text: "توانا بود هر که دانا بود / ز دانش دل پیر برنا بود", word: "دانا" },
  { poet: "سعدی", text: "بنی آدم اعضای یک پیکرند / که در آفرینش ز یک گوهرند", word: "آدم" },
  { poet: "حافظ", text: "الا یا ایها الساقی ادر کأسا و ناولها / که عشق آسان نمود اول ولی افتاد مشکل‌ها", word: "عشق" },
  { poet: "مولانا", text: "بشنو این نی چون شکایت می‌کند / از جدایی‌ها حکایت می‌کند", word: "شکایت" },
  { poet: "حافظ", text: "یوسف گم گشته باز آید به کنعان غم مخور / کلبه‌ی احزان شود روزی گلستان غم مخور", word: "گلستان" },
  { poet: "رودکی", text: "بوی جوی مولیان آید همی / یاد یار مهربان آید همی", word: "مهربان" },
  { poet: "سعدی", text: "تو کز محنت دیگران بی‌غمی / نشاید که نامت نهند آدمی", word: "آدمی" },
  { poet: "فردوسی", text: "بسی رنج بردم در این سال سی / عجم زنده کردم بدین پارسی", word: "پارسی" },
  { poet: "حافظ", text: "درخت دوستی بنشان که کام دل به بار آرد / نهال دشمنی برکن که رنج بی‌شمار آرد", word: "دوستی" },
  { poet: "مولانا", text: "هر کسی کو دور ماند از اصل خویش / باز جوید روزگار وصل خویش", word: "روزگار" },
  { poet: "حافظ", text: "اگر آن ترک شیرازی به دست آرد دل ما را / به خال هندویش بخشم سمرقند و بخارا را", word: "سمرقند" },
  { poet: "مولانا", text: "آب کم جو تشنگی آور به دست / تا بجوشد آبت از بالا و پست", word: "تشنگی" },
  { poet: "سعدی", text: "به جهان خرم از آنم که جهان خرم از اوست / عاشقم بر همه عالم که همه عالم از اوست", word: "عالم" },
  { poet: "فردوسی", text: "چو ایران نباشد تن من مباد / بدین بوم و بر زنده یک تن مباد", word: "ایران" },
  { poet: "خیام", text: "این قافله‌ی عمر عجب می‌گذرد / دریاب دمی که با طرب می‌گذرد", word: "قافله" },
  { poet: "حافظ", text: "صبا به لطف بگو آن غزال رعنا را / که سر به کوه و بیابان تو داده‌ای ما را", word: "غزال" },
];
const VERSE_REWARD = 30;

const verseSheet = makeSheet("verseSheet", `
  <div class="card-title">مصراع فصل</div>
  <div class="card-text">کلمه‌ی جاافتاده رو با حروف پایین بساز</div>
  <div class="verse" id="verseText"></div>
  <div class="verse-poet" id="versePoet"></div>
  <div class="verse-slots" id="verseSlots"></div>
  <div class="verse-tiles" id="verseTiles"></div>
  <div class="reward hidden" id="verseReward"><span class="coin-icon"></span><span class="reward-count"></span></div>
  <button class="card-btn" type="button" id="verseClear">پاک کردن</button>
  <button class="card-link" type="button" data-close>بستن</button>`);
verseSheet.querySelector("[data-close]").onclick = () => verseSheet.classList.add("hidden");

let verseNow = null;
let verseAnswer = [];

function verseFor(chapter) {
  return VERSES[chapter % VERSES.length];
}

function openVerse(chapter) {
  const v = verseFor(chapter);
  verseNow = { chapter, ...v };
  verseAnswer = [];
  const solved = !!(X().verses || {})[chapter];
  $("verseText").replaceChildren(...verseLines(v, solved));
  $("versePoet").textContent = "— " + v.poet;
  $("verseReward").classList.add("hidden");
  $("verseClear").classList.toggle("hidden", solved);
  // حروف کلمه، به‌هم‌ریخته (اما نه به ترتیب درست)
  const letters = [...v.word];
  const rnd = seededRandom(chapter * 31 + 7);
  let order;
  do {
    order = letters.map((_, i) => i);
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
  } while (letters.length > 1 && order.every((x, i) => x === i));
  const tiles = $("verseTiles");
  tiles.replaceChildren();
  tiles.classList.toggle("hidden", solved);
  $("verseSlots").classList.toggle("hidden", solved);
  for (const i of order) {
    const t = document.createElement("button");
    t.type = "button";
    t.className = "verse-tile";
    t.textContent = letters[i];
    t.onclick = () => pickVerseTile(t);
    tiles.appendChild(t);
  }
  renderVerseSlots();
  verseSheet.classList.remove("hidden");
}

// بیت در دو مصراع (هر کدام یک خط)؛ کلمه‌ی جاافتاده در یکی از آن‌هاست
function verseLines(v, solved) {
  return v.text.split(" / ").map((half) => {
    const line = document.createElement("div");
    const at = half.indexOf(v.word);
    if (at < 0) line.textContent = half;
    else line.append(half.slice(0, at), blankEl(v.word, solved), half.slice(at + v.word.length));
    return line;
  });
}

function blankEl(word, show) {
  const b = document.createElement("b");
  b.className = "verse-blank" + (show ? " solved" : "");
  b.id = "verseBlank";
  b.textContent = show ? word : "؟".repeat(word.length);
  return b;
}

function renderVerseSlots() {
  const slots = $("verseSlots");
  slots.replaceChildren();
  for (let i = 0; i < verseNow.word.length; i++) {
    const s = document.createElement("span");
    s.className = "verse-slot" + (verseAnswer[i] ? " full" : "");
    s.textContent = verseAnswer[i] ? verseAnswer[i].textContent : "";
    slots.appendChild(s);
  }
}

function pickVerseTile(tile) {
  if (tile.classList.contains("used")) return;
  tile.classList.add("used");
  verseAnswer.push(tile);
  sound("letter", verseAnswer.length - 1);
  renderVerseSlots();
  if (verseAnswer.length < verseNow.word.length) return;
  const answer = verseAnswer.map((t) => t.textContent).join("");
  if (fold(answer) === fold(verseNow.word)) {
    X().verses = X().verses || {};
    const first = !X().verses[verseNow.chapter];
    X().verses[verseNow.chapter] = 1;
    persist();
    const blank = $("verseBlank");
    blank.textContent = verseNow.word;
    blank.classList.add("solved");
    $("verseTiles").classList.add("hidden");
    $("verseSlots").classList.add("hidden");
    $("verseClear").classList.add("hidden");
    sound("found");
    sparkle(...Object.values(centerOfEl(blank)), 18);
    if (first) {
      const r = $("verseReward");
      r.classList.remove("hidden");
      r.querySelector(".reward-count").textContent = "+" + faDigits(VERSE_REWARD);
      setTimeout(() => giveCoins(VERSE_REWARD, r.querySelector(".coin-icon")), 300);
    }
  } else {
    sound("wrong");
    const slots = $("verseSlots");
    slots.classList.remove("shake");
    void slots.offsetWidth;
    slots.classList.add("shake");
    setTimeout(clearVerse, 450);
  }
}

function clearVerse() {
  for (const t of verseAnswer) t.classList.remove("used");
  verseAnswer = [];
  renderVerseSlots();
}
$("verseClear").onclick = clearVerse;

// دکمه‌ی «مصراع فصل» در کارت پایان فصل
function offerVerse(level) {
  const chapter = chapterOf(level);
  if ((X().verses || {})[chapter]) return;
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "extra verse-offer";
  btn.innerHTML = `<span>✨ مصراع فصل</span><small>یه بیت، یه کلمه‌ی گم‌شده · <span class="coin-icon"></span> ${faDigits(VERSE_REWARD)}+</small>`;
  btn.onclick = () => {
    openVerse(chapter);
    btn.remove();
  };
  $("overlayBtn").before(btn);
}

// ---------------------------------------------------------------------------
// ۳. کلمه‌ی طلایی: در بعضی مرحله‌ها یکی از کلمه‌ها سکه‌ی بیشتری دارد
// ---------------------------------------------------------------------------

const GOLDEN_REWARD = 15;
let goldenWord = null;

function pickGolden(level) {
  goldenWord = null;
  // فقط بار اول هر مرحله، و از مرحله‌ی ۳ به بعد، تقریباً یک مرحله در میان
  if (isDaily() || level < 2 || level !== save.unlocked || level % 2 === 1) return;
  const words = puzzle.words.filter((w) => w.length >= 3 && !found.includes(w));
  if (!words.length) return;
  goldenWord = words[(level * 7 + 3) % words.length];
  for (const el of wordCells(goldenWord)) if (!isFilled(el)) el.classList.add("golden");
}

function goldenFound(word, cells) {
  if (!goldenWord || word !== goldenWord) return;
  goldenWord = null;
  for (const el of document.querySelectorAll(".cell.golden")) el.classList.remove("golden");
  const mid = cells[Math.floor(cells.length / 2)];
  const c = centerOfEl(mid);
  setTimeout(() => {
    sparkle(c.x, c.y, 16);
    toast(`کلمه‌ی طلایی! ${faDigits(GOLDEN_REWARD)}+ سکه ✨`, "gold");
    giveCoins(GOLDEN_REWARD, mid);
  }, 450);
  missionProgress("golden");
}

// کمک‌گرفتن روی خانه‌ی طلایی، طلایی بودنش را برنمی‌دارد؛ وقتی همه‌ی خانه‌ها با راهنما پر شوند جایزه‌ای نیست
function goldenAfterHint() {
  if (!goldenWord) return;
  const cells = wordCells(goldenWord);
  for (const el of cells) if (isFilled(el)) el.classList.remove("golden");
  if (cells.every(isFilled)) goldenWord = null;
}

// ---------------------------------------------------------------------------
// ۴. زنجیره‌ی کلمه: چند کلمه‌ی پشت سر هم بدون اشتباه
// ---------------------------------------------------------------------------

const CHAIN_SIZE = 5;
const CHAIN_REWARD = 5;
let chain = 0;

const chainEl = document.createElement("div");
chainEl.className = "chain";
chainEl.setAttribute("aria-label", "زنجیره");
chainEl.innerHTML = Array.from({ length: CHAIN_SIZE }, () => "<i></i>").join("");
document.querySelector(".board-area").appendChild(chainEl);

function renderChain(pop) {
  chainEl.querySelectorAll("i").forEach((dot, i) => {
    dot.classList.toggle("on", i < chain);
    if (pop && i === chain - 1) {
      dot.classList.remove("pop");
      void dot.offsetWidth;
      dot.classList.add("pop");
    }
  });
  chainEl.classList.toggle("show", chain > 0);
}

function chainUp() {
  chain++;
  renderChain(true);
  if (chain < CHAIN_SIZE) return;
  const c = centerOfEl(chainEl);
  chainEl.classList.add("full");
  setTimeout(() => {
    sparkle(c.x, c.y, 18);
    toast(`زنجیره‌ی ${faDigits(CHAIN_SIZE)} تایی! ${faDigits(CHAIN_REWARD)}+ سکه 🔗`, "good");
    giveCoins(CHAIN_REWARD, chainEl);
    chain = 0;
    chainEl.classList.remove("full");
    renderChain();
  }, 500);
  missionProgress("chain");
}

function chainBreak() {
  if (!chain) return;
  chain = 0;
  chainEl.classList.remove("broke");
  void chainEl.offsetWidth;
  chainEl.classList.add("broke");
  renderChain();
}

// ---------------------------------------------------------------------------
// ۵. گردونه‌ی شانس روزانه
// ---------------------------------------------------------------------------

const WHEEL = [
  { kind: "coins", n: 10, label: "۱۰" },
  { kind: "hint", n: 2, label: "۲ راهنما" },
  { kind: "coins", n: 30, label: "۳۰" },
  { kind: "trial", label: "یه روز ظاهر" },
  { kind: "coins", n: 20, label: "۲۰" },
  { kind: "coins", n: 50, label: "۵۰" },
  { kind: "hint", n: 1, label: "۱ راهنما" },
  { kind: "coins", n: 15, label: "۱۵" },
];

// روزی یک بار (اعلانش در daily.js، ساعت WHEEL_HOUR)
const wheelReady = () => X().wheelDay !== todayKey();

function wheelSVG() {
  const n = WHEEL.length;
  const parts = WHEEL.map((seg, i) => {
    const a0 = ((i - 0.5) / n) * Math.PI * 2 - Math.PI / 2;
    const a1 = ((i + 0.5) / n) * Math.PI * 2 - Math.PI / 2;
    const p = (a) => `${(50 + 48 * Math.cos(a)).toFixed(2)} ${(50 + 48 * Math.sin(a)).toFixed(2)}`;
    const mid = (i / n) * 360;
    const coin = seg.kind === "coins" ? `<circle cx="50" cy="20" r="3.2" class="w-coin"/>` : "";
    return `<path d="M50 50L${p(a0)}A48 48 0 0 1 ${p(a1)}Z" class="w-seg w${i % 4}"/>
      <g transform="rotate(${mid} 50 50)">${coin}<text x="50" y="${seg.kind === "coins" ? 31 : 22}" class="w-text${seg.kind === "coins" ? "" : " small"}">${seg.label}</text></g>`;
  }).join("");
  return `<svg viewBox="0 0 100 100" class="wheel-svg" id="luckWheel">${parts}<circle cx="50" cy="50" r="48" class="w-rim"/><circle cx="50" cy="50" r="7" class="w-hub"/></svg>`;
}

const wheelSheet = makeSheet("wheelSheet", `
  <div class="card-title">گردونه‌ی شانس</div>
  <div class="card-text" id="wheelText"></div>
  <div class="luck"><div class="luck-pointer"></div><div class="luck-spin" id="luckSpin">${wheelSVG()}</div></div>
  <div class="card-text wheel-result" id="wheelResult"></div>
  <button class="card-btn" type="button" id="wheelGo">بچرخون</button>
  <button class="card-link" type="button" data-close>بستن</button>`);
wheelSheet.querySelector("[data-close]").onclick = () => wheelSheet.classList.add("hidden");

let wheelTurn = 0;
let spinning = false;

function lockedThemes() {
  return THEMES.filter((t) => t.product && !save.owned.includes(t.id));
}

function openWheel() {
  const ready = wheelReady();
  $("wheelText").textContent = ready ? "هر روز یک بار بچرخون و جایزه بگیر" : "امروز چرخوندی؛ فردا دوباره بیا";
  $("wheelResult").textContent = "";
  $("wheelGo").disabled = !ready;
  $("wheelGo").textContent = ready ? "بچرخون" : "فردا";
  wheelSheet.classList.remove("hidden");
}

function spinWheel() {
  if (spinning || !wheelReady()) return;
  spinning = true;
  $("wheelGo").disabled = true;
  // امتحان ظاهر پولی شانس کمتری دارد (نصف بقیه)
  const weights = WHEEL.map((seg) => (seg.kind === "trial" ? 0.5 : 1));
  let r = Math.random() * weights.reduce((a, b) => a + b, 0);
  let pick = 0;
  while (r >= weights[pick]) r -= weights[pick++];
  // چند دور کامل و ایستادن روی بخش pick (بخش i در زاویه‌ی i*45 درجه است؛ نشانگر بالاست)
  const n = WHEEL.length;
  wheelTurn += 360 * 5 + ((360 - ((wheelTurn % 360) + (pick * 360) / n)) % 360) + (Math.random() - 0.5) * (300 / n);
  const spin = $("luckSpin");
  spin.style.transition = calm() ? "none" : "transform 4.2s cubic-bezier(.15,.9,.25,1)";
  spin.style.transform = `rotate(${wheelTurn}deg)`;
  sound("shuffle");
  setTimeout(() => winWheel(WHEEL[pick]), calm() ? 50 : 4300);
}

function winWheel(seg) {
  spinning = false;
  X().wheelDay = todayKey();
  let text = "";
  const result = $("wheelResult");
  if (seg.kind === "trial" && lockedThemes().length) {
    const t = lockedThemes()[Math.floor(Math.random() * lockedThemes().length)];
    X().trial = { id: t.id, until: Date.now() + 24 * 3600 * 1000 };
    text = `ظاهر «${t.name}» تا ۲۴ ساعت برای تو باز شد!`;
    result.innerHTML = "";
    result.textContent = text;
    const tryBtn = document.createElement("button");
    tryBtn.type = "button";
    tryBtn.className = "card-link";
    tryBtn.textContent = "امتحانش کن";
    tryBtn.onclick = () => {
      wheelSheet.classList.add("hidden");
      chooseTheme(t.id);
    };
    result.appendChild(tryBtn);
  } else if (seg.kind === "hint") {
    X().freeHints = (X().freeHints || 0) + seg.n;
    result.textContent = `${faDigits(seg.n)} راهنمای رایگان گرفتی!`;
    updateCoins();
  } else {
    const n = seg.kind === "coins" ? seg.n : 40; // اگر همه‌ی ظاهرها خریده شده باشند
    result.textContent = `${faDigits(n)} سکه بردی!`;
    giveCoins(n, $("luckSpin"));
  }
  persist();
  sound("reward");
  const c = centerOfEl($("luckSpin"));
  sparkle(c.x, c.y, 20);
  $("wheelGo").textContent = "فردا";
  updateWheelBadge();
  planReminders(); // اعلان گردونه‌ی امروز دیگر لازم نیست
}
$("wheelGo").onclick = spinWheel;

function updateWheelBadge() {
  $("wheelBadge").classList.toggle("hidden", !wheelReady());
}

// برچسب «رایگان» روی دکمه‌های راهنما (از game.js صدا زده می‌شود)
function refreshFreeHints() {
  const free = (save.x && save.x.freeHints) || 0;
  for (const id of ["hintLetterBtn", "hintWordBtn"]) {
    const btn = $(id);
    btn.classList.toggle("free", free > 0);
    if (free > 0) btn.classList.remove("poor");
    let tag = btn.querySelector(".free-tag");
    if (free > 0 && !tag) {
      tag = document.createElement("span");
      tag.className = "free-tag";
      btn.appendChild(tag);
    }
    if (tag) {
      tag.textContent = "رایگان ×" + faDigits(free);
      tag.classList.toggle("hidden", !free);
    }
  }
}

// ---------------------------------------------------------------------------
// ۶. دفتر واژه‌ها
// ---------------------------------------------------------------------------

function bookWords() {
  if (!Array.isArray(X().book)) X().book = [];
  return X().book;
}

function addToBook(word) {
  const book = bookWords();
  if (!book.includes(word)) {
    book.push(word);
    persist();
  }
}

const isRare = (w) => (wordLevels.get(w) || 1) > 1 || (!dict.has(w) && extraDict.has(w));

// بازیکن‌های قدیمی: کلمه‌های مرحله‌هایی که قبلاً تمام کرده‌اند، کم‌کم به دفتر اضافه می‌شوند
function backfillBook() {
  if (X().bookFilled || !hasLevel(0)) return;
  const book = bookWords();
  const have = new Set(book);
  const upto = Math.min(save.unlocked, 300);
  let i = 0;
  const step = () => {
    const end = Math.min(upto, i + 15);
    for (; i < end; i++) {
      const level = levelAt(i);
      if (level) for (const w of level.words) if (!have.has(w)) { have.add(w); book.push(w); }
    }
    if (i < upto) return setTimeout(step, 30);
    for (const w of save.chest.words) if (!have.has(w)) { have.add(w); book.push(w); }
    X().bookFilled = true;
    persist();
    if (screenNow === "book") renderBook();
  };
  setTimeout(step, 1500);
}

function renderBook() {
  const words = [...bookWords()].sort((a, b) => a.localeCompare(b, "fa"));
  const rare = words.filter(isRare).length;
  $("bookStats").innerHTML = "";
  $("bookStats").append(
    rankBadge(),
    Object.assign(document.createElement("span"), { textContent: `${faDigits(words.length)} کلمه · ${faDigits(rare)} کمیاب ★` })
  );
  const q = fold(normalize($("bookSearch").value || ""));
  const list = $("bookList");
  list.replaceChildren();
  const shown = q ? words.filter((w) => fold(w).includes(q)) : words;
  if (!shown.length) {
    list.innerHTML = `<div class="book-empty">${words.length ? "کلمه‌ای پیدا نشد" : "هنوز کلمه‌ای پیدا نکردی. هر کلمه‌ای که پیدا کنی اینجا می‌مونه."}</div>`;
    return;
  }
  // گروه‌بندی با حرف اول («آ» کنار «ا»)
  let group = null;
  let wrap = null;
  for (const w of shown) {
    const head = fold(w)[0];
    if (head !== group) {
      group = head;
      const h = document.createElement("div");
      h.className = "book-letter";
      h.textContent = head;
      wrap = document.createElement("div");
      wrap.className = "book-words";
      list.append(h, wrap);
    }
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "book-word" + (isRare(w) ? " rare" : "");
    chip.textContent = w;
    chip.onclick = () => showMeanings([w]);
    wrap.appendChild(chip);
  }
}
$("bookSearch").addEventListener("input", () => renderBook());

// ---------------------------------------------------------------------------
// ۷. لقب: با تعداد کلمه‌هایی که بازیکن پیدا کرده بالا می‌رود
// ---------------------------------------------------------------------------

const RANKS = [
  [0, "نوآموز"],
  [60, "واژه‌یاب"],
  [200, "کاتب"],
  [500, "ادیب"],
  [1000, "سخن‌دان"],
  [2000, "استاد سخن"],
  [4000, "ملک‌الکلام"],
];

function wordCount() {
  return Math.max(save.stats.words || 0, bookWords().length);
}

function rankOf(n) {
  let i = 0;
  while (i + 1 < RANKS.length && n >= RANKS[i + 1][0]) i++;
  return i;
}

function rankBadge() {
  const n = wordCount();
  const i = rankOf(n);
  const next = RANKS[i + 1];
  const el = document.createElement("span");
  el.className = "rank-badge";
  el.innerHTML = `<b></b><i><span style="width:${next ? Math.round((100 * (n - RANKS[i][0])) / (next[0] - RANKS[i][0])) : 100}%"></span></i>`;
  el.querySelector("b").textContent = "🎖 " + RANKS[i][1];
  return el;
}

function renderRank() {
  const n = wordCount();
  const i = rankOf(n);
  const next = RANKS[i + 1];
  const chip = $("rankChip");
  chip.replaceChildren(rankBadge());
  const sub = document.createElement("small");
  sub.textContent = next ? `${faDigits(n)} کلمه · ${faDigits(next[0] - n)} تا «${next[1]}»` : `${faDigits(n)} کلمه`;
  chip.appendChild(sub);
}

function checkRank() {
  const i = rankOf(wordCount());
  if (X().rank === undefined) X().rank = i;
  if (i > X().rank) {
    X().rank = i;
    persist();
    setTimeout(() => toast(`لقب تازه: «${RANKS[i][1]}» 🎖`, "gold"), 1200);
  }
}

// ---------------------------------------------------------------------------
// ۸. صفحه‌ی شروع فصل
// ---------------------------------------------------------------------------

function chapterIntro(level) {
  if (isDaily() || level === 0 || level % CHAPTER_SIZE || level !== save.unlocked) return;
  const c = chapterOf(level);
  X().intro = X().intro || {};
  if (X().intro[c]) return;
  X().intro[c] = 1;
  persist();
  const el = document.createElement("div");
  el.className = "chapter-intro";
  el.innerHTML = `${chapterScene(c)}<div class="chapter-intro-text"><small>فصل ${faDigits(c + 1)}</small><b></b></div>`;
  el.querySelector("b").textContent = chapterInfo(c).name;
  document.body.appendChild(el);
  const close = () => {
    el.classList.add("out");
    setTimeout(() => el.remove(), 500);
  };
  el.onclick = close;
  requestAnimationFrame(() => el.classList.add("in"));
  setTimeout(close, calm() ? 1200 : 2600);
}

// ---------------------------------------------------------------------------
// ۹. پرواز حروف از دایره به خانه‌های جدول
// ---------------------------------------------------------------------------

let flight = null; // حروف کلمه‌ی ثبت‌شده، پیش از پاک شدن انتخاب

function rememberLetters(letters) {
  flight = letters.map((el) => {
    const cs = getComputedStyle(el);
    return {
      text: el.textContent,
      rect: el.getBoundingClientRect(),
      style: {
        color: cs.color,
        backgroundColor: cs.backgroundColor,
        backgroundImage: cs.backgroundImage,
        fontFamily: cs.fontFamily,
        fontSize: cs.fontSize,
        fontWeight: cs.fontWeight,
        lineHeight: cs.lineHeight,
        paddingBottom: cs.paddingBottom,
        borderRadius: cs.borderRadius,
      },
    };
  });
}

function flyLetters(cells) {
  const from = flight;
  flight = null;
  if (calm() || !from || from.length !== cells.length) return;
  cells.forEach((cell, i) => {
    const f = from[i];
    const to = cell.getBoundingClientRect();
    if (!to.width || !f.rect.width) return;
    const el = document.createElement("span");
    el.className = "fly-letter";
    el.textContent = f.text;
    Object.assign(el.style, f.style, {
      left: f.rect.left + "px",
      top: f.rect.top + "px",
      width: f.rect.width + "px",
      height: f.rect.height + "px",
    });
    document.body.appendChild(el);
    const dx = to.left + to.width / 2 - (f.rect.left + f.rect.width / 2);
    const dy = to.top + to.height / 2 - (f.rect.top + f.rect.height / 2);
    const s = to.width / f.rect.width;
    el.animate(
      [
        { transform: "translate(0,0) scale(1)", opacity: 1 },
        { transform: `translate(${dx * 0.5}px, ${dy * 0.5 - 30}px) scale(${(1 + s) / 2 + 0.15})`, opacity: 1, offset: 0.55 },
        { transform: `translate(${dx}px, ${dy}px) scale(${s})`, opacity: 0 },
      ],
      { duration: 480, delay: i * 55, easing: "cubic-bezier(.4,0,.3,1)", fill: "backwards" }
    ).finished.then(() => el.remove());
  });
}

// ---------------------------------------------------------------------------
// اتصال به رویدادهای بازی
// ---------------------------------------------------------------------------

let levelHinted = false;

gameHooks.push((name, d) => {
  switch (name) {
    case "level":
      levelHinted = false;
      flight = null;
      pickGolden(d.level);
      chapterIntro(d.level);
      break;
    case "submit":
      if (d.letters) rememberLetters(d.letters);
      break;
    case "found":
      flyLetters(d.cells || []);
      addToBook(d.word);
      missionProgress("found");
      if (d.word.length >= 5) missionProgress("long");
      goldenFound(d.word, d.cells || []);
      chainUp();
      break;
    case "bonus":
      flight = null;
      addToBook(d.word);
      missionProgress("bonus");
      chainUp();
      break;
    case "repeat":
      flight = null;
      break;
    case "wrong":
      flight = null;
      chainBreak();
      break;
    case "hint":
      levelHinted = true;
      goldenAfterHint();
      break;
    case "complete":
      goldenWord = null;
      if (d.daily) missionProgress("daily");
      else missionProgress("level");
      if (!levelHinted) missionProgress("nohint");
      if (!d.daily && d.first && endsChapter(d.level)) offerVerse(d.level);
      checkRank();
      break;
    case "home":
      renderRank();
      updateMissionBadge();
      updateWheelBadge();
      break;
  }
});

$("missionsBtn").addEventListener("click", openMissions);
$("wheelBtn").addEventListener("click", openWheel);
$("bookBtn").addEventListener("click", () => open("book"));
$("rankChip").addEventListener("click", () => open("book"));

document.addEventListener("DOMContentLoaded", () => {
  // بعد از خواندن کلمه‌ها (game.js همین رویداد را زودتر گرفته است)
  setTimeout(() => {
    backfillBook();
    if (X().rank === undefined) {
      X().rank = rankOf(wordCount());
      persist();
    }
    refreshFreeHints();
  }, 2500);
});
