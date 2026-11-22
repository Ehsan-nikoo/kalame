"use strict";

// دو بخش بازی (بعد از learn.js بارگذاری می‌شود):
// هر بار که بازی باز می‌شود، اول بازیکن انتخاب می‌کند: «کودک» (راست) یا «بزرگسال» (چپ).
// بزرگسال همان بازی همیشگی است. کودک چهار بازی ساده دارد، بدون سکه، بدون وقت و بدون باخت:
// نقاشی و کلمه، چرخ کلمه (همان بازی اصلی با کلمه‌های آسان)، کدوم درسته (املا) و اسم فامیل.

// کلمه‌های تصویری (KIDS_CATS) در kidswords.js است
const KIDS_WORDS = Object.values(KIDS_CATS).flat()
  .filter((w, i, all) => all.findIndex((v) => v[0] === w[0]) === i);

// کلمه‌های دوتکه نیم‌فاصله دارند (مثل «لاک‌پشت»)؛ نیم‌فاصله حرف حساب نمی‌شود
const kwLetters = (w) => [...w.replace(/\u200c/g, "")];
const kwLen = (w) => kwLetters(w).length;

// اگر بچه مدتی حرف درست را نزد، همان حرف تکان می‌خورد (هر چه سخت‌تر، دیرتر)
const KIDS_HINT_MS = { easy: 3500, mid: 5000, hard: 8000 };

// ---------------------------------------------------------------------------
// صفحه‌ی انتخاب: کودک / بزرگسال
// ---------------------------------------------------------------------------

const kidsGate = document.createElement("div");
kidsGate.id = "kidsGate";
kidsGate.className = "kg";
kidsGate.innerHTML = `
  <div class="kg-inner">
    <div class="kg-logo">کلمه</div>
    <div class="kg-ask">کی می‌خواد بازی کنه؟</div>
    <div class="kg-picks">
      <button class="kg-pick kg-kid" type="button" id="kgKid">
        <span class="kg-ic">🧸</span><b>کودک</b><small>بازی‌های ساده و رنگی</small>
      </button>
      <button class="kg-pick kg-adult" type="button" id="kgAdult">
        <span class="kg-ic">📚</span><b>بزرگسال</b><small>بازی کامل کلمه</small>
      </button>
    </div>
  </div>`;
document.body.appendChild(kidsGate);

const kidsWorld = document.createElement("div");
kidsWorld.id = "kidsWorld";
kidsWorld.className = "kw hidden";
kidsWorld.innerHTML = `
  <div class="kw-top">
    <button class="kw-home" type="button" id="kwHome" aria-label="برگشت">🏠</button>
    <div class="kw-stars"><span>⭐</span><b id="kwStars">۰</b></div>
  </div>
  <div class="kw-stage" id="kwStage"></div>`;
document.body.appendChild(kidsWorld);

function showGate() {
  kwStop();
  if (kwThemeMode) kwThemesDone();
  kwLeavePlay();
  kwIn = null;
  kidsWorld.classList.add("hidden");
  kidsGate.classList.remove("hidden");
}
// هر بخش ظاهر انتخابی خودش را دارد؛ ظاهر خریده‌شده (save.owned) در هر دو بخش باز است
const kwThemeOf = (id) => (id && themeOwned(id) ? id : "plain");
// ظاهر پیش‌فرض بخش کودک (رایگان، مخصوص بچه‌ها: themes/toon.js)
const KW_DEFAULT_THEME = "toon";
// ظاهری که بچه انتخاب کرده؛ اگر انتخاب نکرده یا دیگر باز نیست (مثلاً امتحان یک‌روزه تمام شده)، همان پیش‌فرض کودک
const kwKidsTheme = () => (X().kidsTheme && themeOwned(X().kidsTheme) ? X().kidsTheme : KW_DEFAULT_THEME);
// ظاهرهای مخصوص کودک (kids: true در THEMES) در بخش بزرگسال نمی‌آیند
function adultThemeOf(id) {
  const t = THEMES.find((x) => x.id === id);
  return t && !t.kids ? kwThemeOf(id) : "plain";
}
// ظاهر می‌تواند فهرست بازی‌های کودک (kidsmenu) و صفحه‌ی برد چرخ کلمه (kidswin) را هم تزئین کند
function kwThemeHook(name, detail) {
  const def = themeDefs[activeTheme];
  if (!def || !def.on || !def.on[name]) return;
  try {
    def.on[name](detail);
  } catch (e) {
    console.error(e);
  }
}
// عوض کردن ظاهر و ساختن دوباره‌ی صفحه‌ی زیرین؛ وگرنه صحنه‌ی بالای منو (جدول ساده، صورت فلکی و …)
// از ظاهر قبلی می‌ماند و دو ظاهر قاطی می‌شوند
function kwUseTheme(id) {
  if (activeTheme === id) return;
  applyTheme(id);
  if (screenNow) route();
}
// بعد از انتخاب بخش، بازیکن مستقیم به بازی می‌رود (بزرگسال: مرحله‌ی فعلی؛ کودک: چرخ کلمه با همان سختی قبلی)؛
// منو و فهرست بازی‌های کودک با دکمه‌ی منو/خانه در دسترس‌اند
function chooseAdult() {
  kidsGate.classList.add("hidden");
  kidsWorld.classList.add("hidden");
  kwUseTheme(adultThemeOf(save.theme));
  if (!(screenNow === "play" && puzzle && !isKidsPlay())) continueGame();
}
function chooseKid() {
  kidsGate.classList.add("hidden");
  kidsWorld.classList.remove("hidden");
  kwUseTheme(kwKidsTheme());
  kwRound = { game: "wheel", n: 0 };
  kwWheel();
}
$("kgKid").onclick = chooseKid;
$("kgAdult").onclick = chooseAdult;
$("kwHome").onclick = () => (kwIn ? kwMenu() : showGate());

// دکمه‌ی «کودک یا بزرگسال» در تنظیمات، برای عوض کردن بخش بدون بستن بازی
(() => {
  const list = document.querySelector(".settings-list");
  if (!list) return;
  const b = document.createElement("button");
  b.className = "setting setting-link";
  b.id = "setKidsGate";
  b.type = "button";
  b.innerHTML = `<span class="setting-name">کودک یا بزرگسال<small>رفتن به صفحه‌ی انتخاب بخش بازی</small></span>
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  b.onclick = showGate;
  const tut = $("setTutorial");
  if (tut && tut.nextSibling) list.insertBefore(b, tut.nextSibling);
  else list.appendChild(b);
})();

// ---------------------------------------------------------------------------
// بخش کودک
// ---------------------------------------------------------------------------

let kw = null; // { word, pic, letters, at }
let kwIn = null; // بازی‌ای که الان باز است (null یعنی فهرست بازی‌های کودک)
let kwWaits = [];
let kwHintTimer = null;
const kwLater = (fn, ms) => kwWaits.push(setTimeout(fn, ms));
function kwStop() {
  kwWaits.forEach(clearTimeout);
  kwWaits = [];
  clearTimeout(kwHintTimer);
}

function kwState() {
  const x = X();
  if (!x.kidsPlay) x.kidsPlay = { done: 0, recent: [] };
  return x.kidsPlay;
}
// ---------------------------------------------------------------------------
// سختی هر بازی: خود بچه انتخاب می‌کند (آسون / متوسط / سخت) و برای هر بازی جدا یادش می‌ماند
// ---------------------------------------------------------------------------
const KW_LV = [
  { id: "easy", stars: "⭐", name: "آسون" },
  { id: "mid", stars: "⭐⭐", name: "متوسط" },
  { id: "hard", stars: "⭐⭐⭐", name: "سخت" },
];
const KW_LV_NOTE = {
  pic: ["کلمه‌های کوتاه", "کلمه‌های چهار حرفی", "کلمه‌های بلند، با حرف اضافه"],
  wheel: ["جدول کوچولو", "جدول بزرگ‌تر", "کلمه‌های بلند و بیشتر"],
  spell: ["کلمه‌های کوتاه", "کلمه‌های بلندتر", "سه تا گزینه"],
  ef: ["چهار تا نقاشی", "شش تا نقاشی", "حرف وسط کلمه هم قایم میشه!"],
};
function kwLv(game) {
  const v = X().kidsLv && X().kidsLv[game];
  return KW_LV.some((l) => l.id === v) ? v : "easy";
}
const kwLvInfo = (game) => KW_LV.find((l) => l.id === kwLv(game));

function kwLvPick(game) {
  kwStop();
  kwIn = "lv";
  const g = KW_GAMES.find((x) => x[0] === game);
  const cur = kwLv(game);
  $("kwStars").textContent = faDigits(kwTodayStars());
  $("kwStage").innerHTML = `
    <div class="kw-lv-head"><span>${g[1]}</span><b>${g[2]}</b></div>
    <div class="kw-ask">چقدر سخت باشه؟</div>
    <div class="kw-lvs">${KW_LV.map((l, i) => `<button class="kw-lv kw-lv-${l.id}${l.id === cur ? " sel" : ""}" type="button" data-lv="${l.id}">
      <i>${l.stars}</i><b>${l.name}</b><small>${KW_LV_NOTE[game][i]}</small></button>`).join("")}</div>`;
  $("kwStage").querySelectorAll(".kw-lv").forEach((b) => (b.onclick = () => {
    X().kidsLv = { ...(X().kidsLv || {}), [game]: b.dataset.lv };
    persist();
    kwRound = { game, n: 0 };
    if (typeof sound === "function") sound("found");
    KW_PLAY[game]();
  }));
}
// دکمه‌ی کوچک سختی بالای هر بازی؛ زدنش دوباره صفحه‌ی انتخاب سختی را می‌آورد
function kwBar(game) {
  const l = kwLvInfo(game);
  if (kwRound.game !== game) kwRound = { game, n: 0 };
  return `<div class="kw-bar">
    <button class="kw-lv-chip kw-lv-${l.id}" type="button" id="kwLvChip" aria-label="عوض کردن سختی">${l.stars} ${l.name}</button>
    <div class="kw-dots kw-round" id="kwRound">${kwRoundDots()}</div></div>`;
}
function kwWireBar(game) {
  const chip = $("kwLvChip");
  if (chip) chip.onclick = () => kwLvPick(game);
}

// هر دور پنج سؤال است؛ آخر هر دور یک جام
const KW_ROUND = 5;
let kwRound = { game: null, n: 0 };
const kwRoundDots = () =>
  Array.from({ length: KW_ROUND }, (_, i) => `<i class="${i < kwRound.n ? "done" : i === kwRound.n ? "now" : ""}"></i>`).join("");
function kwRoundWin(game, delay) {
  kwRound.n++;
  const dots = $("kwRound");
  if (dots) dots.innerHTML = kwRoundDots();
  kwLater(() => (kwRound.n >= KW_ROUND ? kwTrophy(game) : KW_PLAY[game]()), delay);
}
function kwTrophy(game) {
  kwStop();
  kwIn = game;
  kwRound = { game, n: 0 };
  const at = KW_LV.findIndex((l) => l.id === kwLv(game));
  const harder = KW_LV[at + 1];
  $("kwStage").innerHTML = `
    <div class="kw-pic win kw-trophy">🏆</div>
    <div class="kw-word">${lnPick(["قهرمان!", "عالی بودی!", "ایول قهرمان!", "تو بهترینی!"])}</div>
    <div class="kw-ask">پنج تا رو درست جواب دادی!</div>
    <div class="kw-trophy-btns">
      <button class="kw-next" type="button" id="kwAgain">یه دور دیگه ◀</button>
      ${harder ? `<button class="kw-next kw-harder" type="button" id="kwHarder">${harder.stars} سخت‌ترش کن</button>` : ""}
    </div>`;
  kwConfetti();
  setTimeout(kwConfetti, 500);
  if (typeof sound === "function") sound("complete");
  $("kwAgain").onclick = () => KW_PLAY[game]();
  if (harder) $("kwHarder").onclick = () => {
    X().kidsLv = { ...(X().kidsLv || {}), [game]: harder.id };
    persist();
    KW_PLAY[game]();
  };
}

// دسته‌ی بُرخورده‌ی ماندگار: تا همه‌ی کلمه‌های یک بازی و سختی نیامده‌اند، هیچ‌کدام تکرار نمی‌شود
// (حتی اگر بازی بسته و دوباره باز شود)
function kwDeck(key, ids) {
  const x = X();
  if (!x.kidsDeck || typeof x.kidsDeck !== "object") x.kidsDeck = {};
  const valid = new Set(ids);
  let left = Array.isArray(x.kidsDeck[key]) ? x.kidsDeck[key].filter((i) => valid.has(i)) : [];
  if (!left.length) {
    const last = x.kidsDeck[key + "~"];
    left = shuffled([...ids], Math.random);
    // آخرین کلمه‌ی دور قبل، اول دور تازه نیاید
    if (left.length > 1 && left[0] === last) left.push(left.shift());
  }
  const next = left.shift();
  x.kidsDeck[key] = left;
  x.kidsDeck[key + "~"] = next;
  persist();
  return next;
}

// ---------------------------------------------------------------------------
// نقاشی و کلمه: حرف‌ها را به ترتیب بزن
// ---------------------------------------------------------------------------
function kwPicPool(lv) {
  return KIDS_WORDS.filter(([w]) => {
    const n = kwLen(w);
    return lv === "easy" ? n <= 3 : lv === "mid" ? n === 4 : n >= 5 && n <= 7;
  });
}
function kwPick(lv) {
  const pool = kwPicPool(lv);
  const w = kwDeck("pic:" + lv, pool.map((x) => x[0]));
  return pool.find((x) => x[0] === w);
}

function kwTodayStars() {
  const st = X().kids;
  return st && st.day === todayKey() ? st.all || st.n || 0 : 0;
}

// حرف‌های اضافه‌ی سطح سخت: حرف‌های رایجی که در کلمه نیستند و با حرف‌های کلمه هم‌صدا نیستند
const KW_DECOY = [..."ابپتجچدرزسشکگلمنوهی"];
function kwNext() {
  kwStop();
  kwIn = "pic";
  const lv = kwLv("pic");
  const [word, pic] = kwPick(lv);
  const letters = kwLetters(word);
  const keys = letters.map((ch, i) => ({ ch, i }));
  if (lv === "hard") {
    const sounds = new Set(letters.map((c) => kwSound(c === "آ" ? "ا" : c)));
    shuffled(KW_DECOY.filter((c) => !sounds.has(kwSound(c))), Math.random).slice(0, 2).forEach((ch) => keys.push({ ch, i: -1 }));
  }
  let order = shuffled(keys, Math.random);
  if (letters.length > 1 && order.every((o, k) => o.i === k)) order = order.reverse();
  kw = { word, pic, letters, at: 0, lv };
  $("kwStars").textContent = faDigits(kwTodayStars());
  $("kwStage").innerHTML = `${kwBar("pic")}
    <div class="kw-pic">${pic}</div>
    <div class="kw-slots${letters.length >= 6 ? " many" : ""}">${letters.map(() => `<span class="kw-slot"></span>`).join("")}</div>
    <div class="kw-keys${order.length >= 8 ? " many" : ""}">${order.map((o) => `<button class="kw-key" type="button">${o.ch}</button>`).join("")}</div>`;
  $("kwStage").querySelectorAll(".kw-key").forEach((k) => (k.onclick = () => kwTap(k)));
  kwWireBar("pic");
  kwArmHint();
}

function kwArmHint() {
  clearTimeout(kwHintTimer);
  $("kwStage").querySelectorAll(".kw-key.nudge").forEach((k) => k.classList.remove("nudge"));
  kwHintTimer = setTimeout(() => {
    const need = kw && kw.letters[kw.at];
    const key = [...$("kwStage").querySelectorAll(".kw-key:not([disabled])")].find((k) => k.textContent === need);
    if (key) key.classList.add("nudge");
  }, KIDS_HINT_MS[(kw && kw.lv) || "easy"]);
}

function kwTap(key) {
  if (!kw || kw.at >= kw.letters.length) return;
  if (key.textContent !== kw.letters[kw.at]) {
    // حرف اشتباه فقط تکان می‌خورد و سر جایش می‌ماند؛ چیزی از دست نمی‌رود
    if (typeof sound === "function") sound("repeat");
    if (typeof haptic === "function") haptic("light");
    key.classList.remove("no");
    void getComputedStyle(key).animationName;
    key.classList.add("no");
    return;
  }
  if (typeof sound === "function") sound("letter", kw.at);
  key.disabled = true;
  key.classList.remove("nudge");
  const slot = $("kwStage").querySelectorAll(".kw-slot")[kw.at];
  slot.textContent = key.textContent;
  slot.classList.add("on");
  kw.at++;
  if (kw.at < kw.letters.length) return kwArmHint();
  kwWin();
}

function kwWin() {
  clearTimeout(kwHintTimer);
  const st = kwState();
  st.done++;
  kwReward();
  const stage = $("kwStage");
  stage.querySelector(".kw-slots").outerHTML = `<div class="kw-word">${kw.word}</div>`;
  stage.querySelector(".kw-keys").innerHTML = kwCheer();
  stage.querySelector(".kw-pic").classList.add("win");
  kwRoundWin("pic", 1700);
}

function kwConfetti() {
  if (typeof calm === "function" && calm()) return;
  const bits = ["⭐", "✨", "🎉", "💛", "🌟"];
  for (let i = 0; i < 14; i++) {
    const b = document.createElement("span");
    b.className = "kw-bit";
    b.textContent = bits[i % bits.length];
    b.style.left = 8 + Math.random() * 84 + "%";
    b.style.animationDelay = Math.random() * 0.3 + "s";
    b.style.fontSize = 18 + Math.random() * 16 + "px";
    kidsWorld.appendChild(b);
    setTimeout(() => b.remove(), 1800);
  }
}

// ---------------------------------------------------------------------------
// ستاره‌ها و فهرست بازی‌های کودک
// ---------------------------------------------------------------------------

// هر جواب درست یک ستاره. بخش کودک سکه ندارد و به کیف سکه‌ی بزرگسال دست نمی‌زند.
function kwReward() {
  let day = X().kids;
  if (!day || day.day !== todayKey()) day = X().kids = { day: todayKey(), n: 0 };
  day.all = (day.all || day.n || 0) + 1;
  persist();
  $("kwStars").textContent = faDigits(day.all);
  if (typeof sound === "function") sound("complete");
  if (typeof haptic === "function") haptic("light");
  kwConfetti();
}
const kwCheer = () => `<div class="kw-cheer">${lnPick(["آفرین!", "عالی!", "ایول!", "باریکلا!", "چه خوب!"])}</div>`;
// جواب اشتباه فقط تکان می‌خورد؛ چیزی از دست نمی‌رود
function kwOops(btn) {
  if (typeof sound === "function") sound("repeat");
  if (typeof haptic === "function") haptic("light");
  btn.classList.remove("no");
  void getComputedStyle(btn).animationName;
  btn.classList.add("no");
}

// چهار بازی اول پیش از شروع، صفحه‌ی انتخاب سختی دارند
const KW_GAMES = [
  ["pic", "🖼️", "نقاشی و کلمه", () => kwLvPick("pic")],
  ["wheel", "🎡", "چرخ کلمه", () => kwLvPick("wheel")],
  ["spell", "✏️", "کدوم درسته؟", () => kwLvPick("spell")],
  ["ef", "🙈", "قایم‌موشک حرف‌ها", () => kwLvPick("ef")],
  ["themes", "🎨", "ظاهر بازی", () => kwThemes()],
];
const KW_PLAY = { pic: () => kwNext(), wheel: () => kwWheel(), spell: () => kwSpell(), ef: () => kwEf() };

function kwMenu() {
  kwStop();
  kwLeavePlay();
  if (kwThemeMode) kwThemesDone();
  kwIn = null;
  kidsWorld.classList.remove("hidden");
  $("kwStars").textContent = faDigits(kwTodayStars());
  $("kwStage").innerHTML = `
    <div class="kw-title">چی بازی کنیم؟</div>
    <div class="kw-menu">${KW_GAMES.map(([id, ic, name]) =>
      `<button class="kw-game kw-g-${id}" type="button" data-kw="${id}"><span>${ic}</span><b>${name}</b></button>`).join("")}</div>`;
  $("kwStage").querySelectorAll(".kw-game").forEach((b) => (b.onclick = () => KW_GAMES.find((g) => g[0] === b.dataset.kw)[3]()));
  kwThemeHook("kidsmenu", { lv: kwState().lv || 0 });
}

// ---------------------------------------------------------------------------
// کدوم درسته؟ (املا): نقاشی و دو شکل نوشتن؛ بچه شکل درست را می‌زند
// ---------------------------------------------------------------------------
// [درست، غلط، نقاشی]؛ شکل غلط نباید خودش کلمه‌ی درستی باشد

const KIDS_SPELL = [
  ["طوطی", "توتی", "🦜"], ["قاشق", "غاشق", "🥄"], ["صندلی", "سندلی", "🪑"], ["حلزون", "هلزون", "🐌"],
  ["عینک", "عینگ", "👓"], ["عسل", "اسل", "🍯"], ["قورباغه", "غورباغه", "🐸"], ["ذرت", "ضرت", "🌽"],
  ["خورشید", "خرشید", "☀️"], ["صابون", "سابون", "🧼"], ["طبل", "تبل", "🥁"], ["عقاب", "اقاب", "🦅"],
  ["غذا", "قذا", "🍲"], ["توپ", "طوپ", "⚽"], ["تخت", "طخت", "🛏️"], ["گوسفند", "گوصفند", "🐑"],
  ["عروسک", "اروسک", "🪆"], ["صدف", "سدف", "🐚"], ["شطرنج", "شترنج", "♟️"], ["اتوبوس", "اطوبوس", "🚌"],
  ["تلفن", "طلفن", "☎️"], ["زرافه", "ضرافه", "🦒"], ["صبحانه", "سبحانه", "🍳"], ["قلب", "غلب", "❤️"],
  ["قطار", "غطار", "🚆"], ["قایق", "غایق", "⛵"], ["چراغ", "چراق", "🚦"], ["مرغ", "مرق", "🐔"],
  ["سیب", "صیب", "🍎"], ["ستاره", "صتاره", "⭐"], ["ماهی", "ماحی", "🐟"], ["هویج", "حویج", "🥕"],
  ["حمام", "همام", "🛁"], ["اسب", "اصب", "🐎"], ["خروس", "خروص", "🐓"], ["خواب", "خاب", "😴"],
  ["خواهر", "خاهر", "👧"], ["عنکبوت", "عنکبود", "🕷️"], ["مداد", "مدات", "✏️"], ["طلا", "تلا", "🥇"],
  ["ساعت", "ساعط", "⌚"], ["تمساح", "طمساح", "🐊"], ["ظرف", "زرف", "🍽️"], ["بستنی", "بصتنی", "🍦"],
  ["شکلات", "شکلاط", "🍫"], ["صحرا", "سحرا", "🏜️"],
];

// غلط‌های املایی ساختگی: یک حرف با حرف هم‌صدایش عوض می‌شود (ت/ط، س/ص/ث، ز/ذ/ض/ظ، ق/غ، ه/ح، ا/ع اول کلمه).
// «ه» آخر کلمه (صدای «ـه» مثل گربه) عوض نمی‌شود؛ شکلی که خودش کلمه‌ی درستی باشد هم کنار می‌رود.
const KW_SWAP = ["تط", "سصث", "زذضظ", "قغ", "هح"];
// شکل‌هایی که درست یا کلمه‌ی دیگری‌اند (یا برای بچه مناسب نیستند) و نباید گزینه‌ی غلط شوند
const KW_SPELL_OK = new Set(["پرتغال", "طاس", "زرت", "حلو", "عبر", "سد", "صد"]);
function kwMisspell(word) {
  const ch = [...word];
  const out = new Set();
  ch.forEach((c, i) => {
    let group = KW_SWAP.find((g) => g.includes(c));
    if (c === "ه" && (i === ch.length - 1 || ch[i + 1] === "\u200c")) group = null;
    if (group) for (const o of group) if (o !== c) out.add([...ch.slice(0, i), o, ...ch.slice(i + 1)].join(""));
    if (i === 0 && c === "ا") out.add("ع" + ch.slice(1).join(""));
    if (i === 0 && c === "ع") out.add("ا" + ch.slice(1).join(""));
  });
  const real = (v) => KW_SPELL_OK.has(v) || (dict && dict.has(v.replace(/\u200c/g, ""))) || KIDS_WORDS.some((w) => w[0] === v);
  return shuffled([...out].filter((v) => !real(v)), seededRandom(hashText(word)));
}
let kwSpellBank = null;
function kwSpellItems() {
  if (kwSpellBank && kwSpellBank.dict === dict.size) return kwSpellBank.items;
  const items = new Map();
  // اول غلط‌های دست‌نوشته (مثل خواب/خاب)، بعد غلط‌های ساختگی
  for (const [right, wrong, pic] of KIDS_SPELL) items.set(right, { w: right, pic, wrongs: [wrong] });
  for (const [w, pic] of KIDS_WORDS) {
    const it = items.get(w) || { w, pic, wrongs: [] };
    for (const v of kwMisspell(w)) if (!it.wrongs.includes(v)) it.wrongs.push(v);
    if (it.wrongs.length) items.set(w, it);
  }
  kwSpellBank = { dict: dict.size, items: [...items.values()] };
  return kwSpellBank.items;
}
function kwSpellPool(lv) {
  return kwSpellItems().filter((it) => {
    const n = kwLen(it.w);
    return lv === "easy" ? n <= 4 : lv === "mid" ? n >= 4 : n >= 4 && it.wrongs.length >= 2;
  });
}

function kwSpell() {
  kwStop();
  kwIn = "spell";
  const lv = kwLv("spell");
  const pool = kwSpellPool(lv);
  const id = kwDeck("spell:" + lv, pool.map((x) => x.w));
  const it = pool.find((x) => x.w === id);
  const right = it.w;
  const opts = shuffled([right, ...it.wrongs.slice(0, lv === "hard" ? 2 : 1)], Math.random);
  $("kwStars").textContent = faDigits(kwTodayStars());
  $("kwStage").innerHTML = `${kwBar("spell")}
    <div class="kw-pic">${it.pic}</div>
    <div class="kw-ask">کدوم درست نوشته شده؟</div>
    <div class="kw-opts${opts.length > 2 ? " three" : ""}">${opts.map((w) => `<button class="kw-opt" type="button">${w}</button>`).join("")}</div>`;
  kwWireBar("spell");
  let missed = false;
  $("kwStage").querySelectorAll(".kw-opt").forEach((b) => (b.onclick = () => {
    if (b.textContent !== right) {
      missed = true;
      b.disabled = true;
      return kwOops(b);
    }
    $("kwStage").querySelectorAll(".kw-opt").forEach((o) => (o.disabled = true));
    b.classList.add("right");
    if (!missed) kwReward();
    else if (typeof sound === "function") sound("found");
    $("kwStage").querySelector(".kw-ask").outerHTML = kwCheer();
    $("kwStage").querySelector(".kw-pic").classList.add("win");
    // دور پنج‌تایی فقط با جواب درستِ بار اول جلو می‌رود
    if (missed) kwLater(kwSpell, 1500);
    else kwRoundWin("spell", 1500);
  }));
}

// ---------------------------------------------------------------------------
// قایم‌موشک حرف‌ها: یک حرف قایم شده؛ نقاشی‌ها از پشت بوته‌ها سرک می‌کشند و بچه
// اونایی رو پیدا می‌کنه که حرف توی اسمشونه. اسم هر نقاشی بعد از زدنش نشون داده میشه.
//   آسون: ۴ نقاشی، اسم با این حرف شروع میشه
//   متوسط: ۶ نقاشی، اسم با این حرف شروع میشه
//   سخت: ۹ نقاشی، حرف هر جای اسم ممکنه قایم شده باشه (شکل‌های چسبیده‌ی حرف هم نشون داده میشه)
// ---------------------------------------------------------------------------

// نقاشی‌هایی که اسمشان یکی نیست (مثلاً 📱 هم گوشی است هم موبایل) در این بازی نمی‌آیند
const KW_EF_SKIP = new Set(["آب", "شیرینی", "زمین", "رعد", "دست", "پا", "بابا", "مامان", "پسر", "دختر", "بچه", "گوشی", "لامپ", "تخم‌مرغ", "کیف", "شال", "در", "برگ", "پلیس", "رز", "هدیه", "تاکسی", "بینی", "کلوچه", "خروس",
  "غذا", "صبحانه", "خواب", "ظرف", "چراغ", "حمام", "پرنده", "دهان", "لباس", "جعبه", "پرچم", "تک‌شاخ", "ماهی‌مرکب", "روح", "فرشته", "سبد", "نخ", "کاموا", "جام", "قلعه", "کارخانه", "پل", "مترو", "یخ", "مغز", "دفتر", "پادشاه", "ملکه", "جادوگر",
  "نوشابه", "کامپیوتر", "آبمیوه", "کاپشن", "سیاره", "آدم‌آهنی", "بشقاب‌پرنده", "طوفان", "صحرا", "نخل", "آتش‌بازی", "انگشتر", "اسکوتر", "لباس", "شبدر"]);
// حرف‌های هم‌صدا: نقاشی‌ای که حرف هم‌صدا دارد گزینه‌ی غلط نمی‌شود (بچه صدا را می‌شنود نه املا را)
const KW_SAME_SOUND = ["اعآ", "تط", "سصث", "زذضظ", "هح", "قغ"];
const kwNorm = (c) => (c === "آ" ? "ا" : c);
const kwFirst = (w) => kwNorm(w[0]);
const kwSound = (ch) => (KW_SAME_SOUND.find((g) => g.includes(ch)) || ch);
// حرف‌هایی که به حرف بعدی نمی‌چسبند
const KW_NOJOIN = "ادذرزژو";
const KW_EF = { easy: { cards: 4, right: [2, 2] }, mid: { cards: 6, right: [2, 3] }, hard: { cards: 9, right: [3, 4] } };
let kef = null; // { letter, need, got, right }

function kwEfWords() {
  const seen = new Set();
  return KIDS_WORDS.filter(([w, pic]) => !KW_EF_SKIP.has(w) && !seen.has(pic) && seen.add(pic));
}
// آیا اسم نقاشی این حرف را دارد؟ (سخت: هر جای کلمه؛ بقیه: اول کلمه)
const kwEfHas = (w, letter, anywhere) => (anywhere ? kwLetters(w).some((c) => kwNorm(c) === letter) : kwFirst(w) === letter);
// آیا حرف هم‌صدا (یا خود حرف) در کلمه هست؟ چنین نقاشی‌ای گزینه‌ی غلط نمی‌شود
const kwEfNear = (w, same, anywhere) => (anywhere ? kwLetters(w).some((c) => kwSound(kwNorm(c)) === same) : kwSound(kwFirst(w)) === same);
// اسم با حرف‌های پیداشده‌ی رنگی (بدون شکستن چسبیدگی حروف)
function kwMark(w, letter, anywhere) {
  const ch = [...w];
  let html = "";
  ch.forEach((c, i) => {
    const hit = kwNorm(c) === letter && (anywhere || i === 0);
    html += hit ? `<em>${c}</em>` : c;
  });
  return html;
}

function kwEf() {
  kwStop();
  kwIn = "ef";
  const lv = kwLv("ef");
  const conf = KW_EF[lv];
  const anywhere = lv === "hard";
  const words = kwEfWords();
  const [lo, hi] = conf.right;
  // حرف‌هایی که به اندازه‌ی کافی نقاشی درست و غلط دارند؛ از دسته‌ی بُرخورده تا تکراری نیاید
  const ok = [..."ابپتجچحخدرزسشصطعغفقکگلمنوهی"].filter((ch) => {
    const same = kwSound(ch);
    const yes = words.filter(([w]) => kwEfHas(w, ch, anywhere)).length;
    const no = words.filter(([w]) => !kwEfNear(w, same, anywhere)).length;
    return yes >= hi + 1 && no >= conf.cards && (!anywhere || ch !== "ا");
  });
  const letter = kwDeck("ef:" + lv, ok);
  const need = lo + Math.floor(Math.random() * (hi - lo + 1));
  const right = shuffled(words.filter(([w]) => kwEfHas(w, letter, anywhere)), Math.random).slice(0, need);
  const same = kwSound(letter);
  const wrong = shuffled(words.filter(([w]) => !kwEfNear(w, same, anywhere)), Math.random).slice(0, conf.cards - need);
  kef = { letter, need, got: 0, right: new Set(right.map((w) => w[0])), anywhere };
  const cards = shuffled([...right, ...wrong], Math.random);
  const forms = KW_NOJOIN.includes(letter) ? [letter, "ـ" + letter] : [letter + "ـ", "ـ" + letter + "ـ", "ـ" + letter];
  const ask = anywhere
    ? `«${letter}» توی اسم کدوم نقاشی‌ها قایم شده؟`
    : `اسم کدوم نقاشی‌ها با «${letter}» شروع میشه؟`;
  $("kwStars").textContent = faDigits(kwTodayStars());
  $("kwStage").innerHTML = `${kwBar("ef")}
    <div class="kw-ef-head">
      <div class="kw-letter kw-peeker"><span>${letter}</span><i class="kw-eyes"><b></b><b></b></i></div>
      ${anywhere ? `<div class="kw-forms">${forms.map((f) => `<span>${f}</span>`).join("")}</div>` : ""}
    </div>
    <div class="kw-ask">${ask}</div>
    <div class="kw-dots kw-need" id="kefLeft">${Array.from({ length: need }, () => "<i></i>").join("")}</div>
    <div class="kw-cards kw-hide n${conf.cards}">${cards.map(([w, pic], i) =>
      `<button class="kw-card" type="button" data-w="${w}"><span style="animation-delay:${180 + i * 110}ms">${pic}</span><b>${kwMark(w, letter, anywhere)}</b></button>`).join("")}</div>`;
  kwWireBar("ef");
  $("kwStage").querySelectorAll(".kw-card").forEach((b) => (b.onclick = () => {
    if (!kef.right.has(b.dataset.w)) {
      b.disabled = true;
      b.classList.add("show");
      return kwOops(b);
    }
    b.disabled = true;
    b.classList.add("right", "show");
    $("kefLeft").children[kef.got].classList.add("done");
    kef.got++;
    if (kef.got < kef.need) {
      if (typeof sound === "function") sound("letter", kef.got);
      return;
    }
    $("kwStage").querySelectorAll(".kw-card").forEach((o) => {
      o.disabled = true;
      // آخر کار اسم همه‌ی نقاشی‌ها نشان داده می‌شود
      o.classList.add("show");
    });
    kwReward();
    $("kwStage").querySelector(".kw-ask").outerHTML = kwCheer();
    kwRoundWin("ef", 2200);
  }));
}

// ---------------------------------------------------------------------------
// چرخ کلمه: همان بازی اصلی، با جدول‌های کوچک و کلمه‌های آسان
// ---------------------------------------------------------------------------
// از صفحه‌ی خود بازی استفاده می‌کند، با playKey جدا (k:)، و به پیشرفت بزرگسال دست نمی‌زند.
// ۱۰ مرحله‌ی اول همان مرحله‌های دست‌ساز آسان‌اند؛ بعد کلمه‌ی اصلی از کلمه‌های بچه‌ها
// (اول ۴ حرفی، بعد ۵ حرفی) و حداکثر ۴ کلمه در جدول، با کلمه‌های آشناتر در اولویت.

const KW_PREFIX = "k:";
const KW_MAX_WORDS = 4;
const isKidsPlay = () => typeof playKey === "string" && playKey.startsWith(KW_PREFIX);
{
  // جایزه‌ها و مرحله‌های طلایی و … بزرگسال در بازی بچه‌ها نمی‌آیند
  const base = isMode;
  isMode = function () {
    return base() || isKidsPlay();
  };
}

// در چرخ کلمه‌ی بچه‌ها: نه سکه، نه زنجیره و مأموریت، نه صندوق و دفتر واژه‌های بزرگسال
{
  const adultOnly = (fn) => function (...args) {
    if (!isKidsPlay()) return fn.apply(this, args);
  };
  giveCoins = adultOnly(giveCoins);
  chainUp = adultOnly(chainUp);
  missionProgress = adultOnly(missionProgress);
  addToBook = adultOnly(addToBook);
  // کلمه‌ی درستی که در جدول نیست: فقط تشویق، بدون صندوق
  const baseSubmit = submitWord;
  submitWord = function (raw) {
    if (isKidsPlay() && puzzle) {
      const word = matchWord(matchWord(normalize(raw), puzzle.words), bonusWords);
      if (!puzzle.words.includes(word) && bonusWords.includes(word)) {
        showPreview(`${word} · آفرین! 👏`, "bonus", 1200);
        if (typeof sound === "function") sound("bonus");
        return;
      }
    }
    return baseSubmit(raw);
  };
}

// دکمه‌ی «برگشت» گوشی (MainActivity → kalamehBack) در بخش کودک هیچ‌وقت به منوی بزرگسال نمی‌رود:
// از بازی‌های کودک به فهرست بازی‌های کودک؛ در فهرست و صفحه‌ی انتخاب، دو بار زدن یعنی خروج
{
  const baseBack = window.kalamehBack;
  window.kalamehBack = () => {
    if (!kidsGate.classList.contains("hidden")) return "home";
    const inPlay = $("app").classList.contains("mode-kids");
    if (inPlay && kidsWorld.classList.contains("hidden")) {
      $("app").classList.remove("mode-kids");
      history.replaceState(null, "", location.pathname + location.search);
      route();
      kwMenu();
      return "back";
    }
    if (!kidsWorld.classList.contains("hidden")) {
      if (!kwIn) return "home";
      kwMenu();
      return "back";
    }
    return baseBack ? baseBack() : "home";
  };
}

let kwSeeds = null;
function kwPrepare() {
  if (kwSeeds) return;
  const easy = new Set([...KIDS_WORDS.map((w) => w[0]), ...handmade.flatMap((l) => l.words)]);
  // کلمه‌ی اصلی باید دست‌کم دو کلمه‌ی رایج دیگر هم بسازد؛ اول کلمه‌های بچه‌ها، بعد کلمه‌های اصلی رایج بازی
  const rich = (w) => generator.wordsFrom(w).filter((x) => x !== w && x.length >= 2 && generator.levelOf(x) === 1).length >= 3;
  const seedsOf = (L) => {
    const kid = shuffled(KIDS_WORDS.map((w) => w[0]).filter((w) => [...w].length === L && dict.has(w) && rich(w)), seededRandom(hashText("kids" + L)));
    const common = (generator.seeds[L] || []).slice(0, generator.seeds[L].common || 0).filter((w) => !kid.includes(w) && rich(w));
    const seen = new Set();
    return [...kid, ...common.slice(0, 60)].filter((w) => {
      const key = [...w.replace(/آ/g, "ا")].sort().join(""); // از هر دسته‌ی حروف یکسان فقط یکی
      return !seen.has(key) && seen.add(key);
    });
  };
  kwSeeds = { easy, 4: seedsOf(4), 5: seedsOf(5), 6: seedsOf(6) };
}

function kwBuild(seed, rnd, max = KW_MAX_WORDS) {
  const subs = generator.wordsFrom(seed).filter((w) => w !== seed && w.length >= 2 && generator.levelOf(w) === 1);
  const rank = (w) => (kwSeeds.easy.has(w) ? 0 : 2) + (w.length === 2 ? 1 : 0) + rnd();
  const pool = subs.map((w) => ({ w, k: rank(w) })).sort((a, b) => a.k - b.k).map((x) => x.w);
  const picked = [seed];
  let twos = 0;
  for (const w of pool) {
    if (picked.length >= max) break;
    if (w.length === 2 && twos >= 1) continue;
    if (buildLayout([...picked, w], 400).connected) {
      picked.push(w);
      if (w.length === 2) twos++;
    }
  }
  return { letters: shuffled([...seed], rnd), words: picked, seed };
}

// سختی چرخ کلمه:
//   آسون: اول همان مرحله‌های دست‌ساز، بعد کلمه‌ی ۴ حرفی و حداکثر ۳ کلمه در جدول
//   متوسط: کلمه‌ی ۴ یا ۵ حرفی و حداکثر ۴ کلمه
//   سخت: کلمه‌ی ۵ یا ۶ حرفی و حداکثر ۶ کلمه
const KW_WHEEL = {
  easy: { lens: [4], max: 3 },
  mid: { lens: [4, 5], max: 4 },
  hard: { lens: [5, 6], max: 6 },
};
function kwWheelLevel(n, lv = "easy") {
  if (lv === "easy" && (n < handmade.length || !generator)) return handmade[n % handmade.length];
  if (!generator) return handmade[n % handmade.length];
  kwPrepare();
  const conf = KW_WHEEL[lv];
  const g = lv === "easy" ? n - handmade.length : n;
  const lens = conf.lens.filter((L) => kwSeeds[L] && kwSeeds[L].length);
  const list = kwSeeds[lens[g % lens.length] || 4];
  let best = null;
  for (let k = 0; k < 6; k++) {
    const seed = list[(Math.floor(g / lens.length) + k * 7) % list.length];
    const lev = kwBuild(seed, seededRandom(hashText(seed) + g + lv), conf.max);
    if (!best || lev.words.length > best.words.length) best = lev;
    if (lev.words.length >= Math.min(conf.max, lv === "easy" ? 3 : 4)) break;
  }
  return best;
}

// مرحله‌ی هر سختی جدا شمرده می‌شود (lvs)؛ lv همه‌ی مرحله‌های چرخ است (مزرعه‌ی ظاهر کودک با آن پر می‌شود)
function kwWheelAt(lv) {
  const st = kwState();
  if (!st.lvs || typeof st.lvs !== "object") st.lvs = { easy: st.lv || 0, mid: 0, hard: 0 };
  return st.lvs[lv] || 0;
}

function kwWheel() {
  kwStop();
  kwIn = "wheel";
  const lv = kwLv("wheel");
  const n = kwWheelAt(lv);
  $("app").classList.add("mode-kids");
  startPuzzle(kwWheelLevel(n, lv), n, `${KW_PREFIX}${lv}:${n}`);
  // ظاهر مخصوص کودک اسم مرحله‌ی خودش را دارد (مثلاً «مزرعه‌ی شاد»)؛ بقیه فقط شماره‌ی مرحله‌ی بچه‌ها
  const look = THEMES.find((t) => t.id === activeTheme);
  if (!(look && look.kids)) {
    $("levelLabel").classList.remove("has-name");
    $("levelLabel").textContent = `🧸 ${kwLvInfo("wheel").name} · مرحله‌ی ${faDigits(n + 1)}`;
  }
  // دنیای کودک تا وقتی صفحه‌ی بازی واقعاً نشان داده نشده روی صفحه می‌ماند؛
  // وگرنه بین این دو، منوی بزرگسال (که زیرش است) یک لحظه دیده می‌شود
  if (screenNow === "play") kidsWorld.classList.add("hidden");
  else {
    kwShowPlayPending = true;
    open("play");
  }
}
let kwShowPlayPending = false;
window.addEventListener("hashchange", () => {
  if (!kwShowPlayPending) return;
  kwShowPlayPending = false;
  if (screenNow === "play" && $("app").classList.contains("mode-kids")) kidsWorld.classList.add("hidden");
});

// از صفحه‌ی بازی به بخش کودک برمی‌گردد (اگر آنجا باشیم)
function kwLeavePlay() {
  if (!$("app").classList.contains("mode-kids")) return;
  $("app").classList.remove("mode-kids");
  if (location.hash === "#play") goHome();
}

// دکمه‌ی منو و «برگشت» گوشی در بازی بچه‌ها به فهرست بازی‌های کودک می‌رود
window.addEventListener("hashchange", () => {
  if (location.hash === "#play" || !$("app").classList.contains("mode-kids")) return;
  $("app").classList.remove("mode-kids");
  kwMenu();
});

// راهنمای حرف در بازی بچه‌ها مجانی است
$("hintLetterBtn").addEventListener("click", (e) => {
  if (!isKidsPlay()) return;
  e.stopImmediatePropagation();
  if (locked || dragging) return;
  const empty = Object.values(cellEls).filter((el) => !isFilled(el));
  if (!empty.length) return;
  const el = lnPick(empty);
  revealCell(el, true);
  emit("hint", { cells: [el] });
  checkDone();
}, true);

{
  const base = finishMode;
  finishMode = function (hinted) {
    if (!isKidsPlay()) return base(hinted);
    locked = true;
    delete save.partial[playKey];
    const st = kwState();
    const lv = kwLv("wheel");
    kwWheelAt(lv);
    st.lvs[lv] = (st.lvs[lv] || 0) + 1;
    st.lv = (st.lv || 0) + 1;
    persist();
    const key = playKey;
    setTimeout(() => {
      if (screenNow === "play" && playKey === key) kwWheelWin();
    }, 900);
    return true;
  };
}

function kwWheelWin() {
  kwStop();
  kwIn = "wheelwin";
  kidsWorld.classList.remove("hidden");
  $("kwStage").innerHTML = `
    <div class="kw-pic win">🎉</div>
    <div class="kw-word">${lnPick(["آفرین!", "عالی بود!", "ایول!", "باریکلا!"])}</div>
    <div class="kw-found">${puzzle.words.map((w) => `<span>${w}</span>`).join("")}</div>
    <button class="kw-next" type="button" id="kwNextLevel">مرحله‌ی بعد ◀</button>
    <button class="kw-lv-chip kw-lv-${kwLv("wheel")}" type="button" id="kwLvChip">${kwLvInfo("wheel").stars} ${kwLvInfo("wheel").name} · عوض کن</button>`;
  kwThemeHook("kidswin", { lv: kwState().lv || 0 });
  kwReward();
  $("kwNextLevel").onclick = kwWheel;
  kwWireBar("wheel");
}

// ---------------------------------------------------------------------------
// ظاهر بازی در بخش کودک
// ---------------------------------------------------------------------------
// بخش کودک صفحه‌ی ظاهرهای خودش را دارد (داخل دنیای کودک، نه صفحه‌ی ظاهرهای بزرگسال) و انتخابش
// فقط در X().kidsTheme ذخیره می‌شود؛ ظاهر بزرگسال (save.theme) دست نمی‌خورد و برعکس.
// تنها چیز مشترک خرید است: ظاهری که در هر بخش خریده شود در هر دو باز است. پیش از خرید در بخش کودک،
// یک سؤال ساده برای بزرگ‌ترها می‌آید تا بچه خودش چیزی نخرد.

let kwThemeMode = false;

function kwThemes() {
  kwStop();
  kwIn = "themes";
  kwThemeMode = true;
  const mine = kwKidsTheme();
  // ظاهرهای مخصوص کودک اول
  const list = [...THEMES.filter((t) => t.kids), ...THEMES.filter((t) => !t.kids)];
  $("kwStage").innerHTML = `
    <div class="kw-title">ظاهر بازی 🎨</div>
    <div class="kw-themes">${list.map((t) => {
      const owned = themeOwned(t.id);
      return `<button class="kw-theme tc-${t.id}${t.id === mine && owned ? " selected" : ""}${owned ? "" : " locked"}" type="button" data-id="${t.id}">
        <span class="tcard-art"></span><b></b>${owned ? "" : `<i>🔒</i>`}</button>`;
    }).join("")}</div>
    <div class="kw-themes-note">ظاهر چرخ کلمه رو انتخاب کن</div>`;
  $("kwStage").querySelectorAll(".kw-theme").forEach((btn) => {
    btn.querySelector("b").textContent = THEMES.find((t) => t.id === btn.dataset.id).name;
    btn.onclick = () => kwPickTheme(btn.dataset.id);
  });
}

function kwPickTheme(id) {
  const t = THEMES.find((x) => x.id === id);
  if (!themeOwned(id)) return kwParentGate(() => {
    $("themeSheet").classList.add("kw-over");
    showThemeSheet(t);
  });
  X().kidsTheme = id;
  persist();
  kwUseTheme(id);
  if (typeof sound === "function") sound("found");
  kwThemes();
}

function kwThemesDone() {
  kwThemeMode = false;
  kwParentClose();
  hideThemeSheet();
}

{
  // پنجره‌ی خرید (مشترک) روی دنیای کودک باز می‌شود؛ بعد از خرید، ظاهر برای بچه انتخاب می‌شود
  const baseHide = hideThemeSheet;
  hideThemeSheet = function () {
    $("themeSheet").classList.remove("kw-over");
    return baseHide();
  };
  const baseChoose = chooseTheme;
  chooseTheme = function (id) {
    if (!kwThemeMode) return baseChoose(id);
    hideThemeSheet();
    kwPickTheme(id);
  };
}

// «برگشت» گوشی در صفحه‌ی ظاهرهای کودک: اول پنجره‌ها، بعد فهرست بازی‌های کودک
{
  const baseBack = window.kalamehBack;
  window.kalamehBack = () => {
    if (!kwThemeMode || kidsWorld.classList.contains("hidden")) return baseBack();
    if (!kwParent.classList.contains("hidden")) return kwParentClose(), "closed";
    if (!$("themeSheet").classList.contains("hidden")) return hideThemeSheet(), "closed";
    kwThemesDone();
    kwMenu();
    return "back";
  };
}

// سؤال بزرگ‌ترها پیش از خرید
const kwParent = document.createElement("div");
kwParent.className = "kw-parent hidden";
kwParent.innerHTML = `<div class="kw-parent-card">
  <div class="kw-parent-title">این ظاهر خریدنیه 🔒</div>
  <div class="kw-parent-text">برای خرید، یکی از بزرگ‌ترها باید جواب بده:</div>
  <div class="kw-parent-q" id="kwParentQ"></div>
  <div class="kw-parent-opts" id="kwParentOpts"></div>
  <button class="card-link" type="button" id="kwParentNo">بستن</button>
</div>`;
document.body.appendChild(kwParent);
$("kwParentNo").onclick = () => kwParentClose();
kwParent.addEventListener("click", (e) => {
  if (e.target === kwParent) kwParentClose();
});
function kwParentClose() {
  kwParent.classList.add("hidden");
}
function kwParentGate(then) {
  const a = 6 + Math.floor(Math.random() * 4);
  const b = 6 + Math.floor(Math.random() * 4);
  const right = a * b;
  const opts = new Set([right]);
  while (opts.size < 3) {
    const n = right + (Math.floor(Math.random() * 9) - 4) * (Math.random() < 0.5 ? 1 : a);
    if (n > 0) opts.add(n);
  }
  $("kwParentQ").textContent = `${faDigits(a)} × ${faDigits(b)} = ؟`;
  $("kwParentOpts").innerHTML = shuffled([...opts], Math.random)
    .map((n) => `<button class="card-btn kw-parent-opt" type="button" data-n="${n}">${faDigits(n)}</button>`).join("");
  $("kwParentOpts").querySelectorAll("button").forEach((btn) => (btn.onclick = () => {
    kwParentClose();
    if (Number(btn.dataset.n) === right) then();
  }));
  kwParent.classList.remove("hidden");
}
