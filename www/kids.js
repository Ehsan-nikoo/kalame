"use strict";

// دو بخش بازی (بعد از learn.js بارگذاری می‌شود):
// هر بار که بازی باز می‌شود، اول بازیکن انتخاب می‌کند: «کودک» (راست) یا «بزرگسال» (چپ).
// بزرگسال همان بازی همیشگی است. کودک چهار بازی ساده دارد، بدون سکه، بدون وقت و بدون باخت:
// نقاشی و کلمه، چرخ کلمه (همان بازی اصلی با کلمه‌های آسان)، کدوم درسته (املا) و اسم فامیل.

// هر دسته جدا (برای «اسم فامیل» بچه‌ها هم به کار می‌رود)
const KIDS_CATS = {
  // میوه و خوراکی
  food: [
    ["سیب", "🍎"], ["موز", "🍌"], ["انگور", "🍇"], ["لیمو", "🍋"], ["گیلاس", "🍒"], ["پرتقال", "🍊"],
    ["هندوانه", "🍉"], ["آناناس", "🍍"], ["هلو", "🍑"], ["گلابی", "🍐"], ["نارگیل", "🥥"], ["کیوی", "🥝"],
    ["هویج", "🥕"], ["گوجه", "🍅"], ["پیاز", "🧅"], ["سیر", "🧄"], ["ذرت", "🌽"], ["قارچ", "🍄"],
    ["فلفل", "🌶️"], ["خیار", "🥒"], ["بادمجان", "🍆"], ["نان", "🍞"], ["کیک", "🍰"], ["پنیر", "🧀"],
    ["تخم", "🥚"], ["عسل", "🍯"], ["پیتزا", "🍕"], ["بستنی", "🍦"], ["شکلات", "🍫"], ["کلوچه", "🍪"],
    ["چای", "🍵"], ["برنج", "🍚"], ["دونات", "🍩"], ["نمک", "🧂"], ["آب", "💧"], ["شیرینی", "🧁"],
  ],
  // حیوان‌ها
  animal: [
    ["ماهی", "🐟"], ["گربه", "🐈"], ["سگ", "🐕"], ["اسب", "🐎"], ["شیر", "🦁"], ["خرس", "🐻"],
    ["موش", "🐭"], ["مرغ", "🐔"], ["خروس", "🐓"], ["جوجه", "🐥"], ["اردک", "🦆"], ["فیل", "🐘"],
    ["زنبور", "🐝"], ["میمون", "🐒"], ["خرگوش", "🐇"], ["مار", "🐍"], ["جغد", "🦉"], ["شتر", "🐫"],
    ["گاو", "🐄"], ["زرافه", "🦒"], ["پروانه", "🦋"], ["ببر", "🐅"], ["گرگ", "🐺"], ["روباه", "🦊"],
    ["پنگوئن", "🐧"], ["قورباغه", "🐸"], ["کوسه", "🦈"], ["نهنگ", "🐋"], ["دلفین", "🐬"], ["اختاپوس", "🐙"],
    ["گوسفند", "🐑"], ["بز", "🐐"], ["کانگورو", "🦘"], ["تمساح", "🐊"], ["عقاب", "🦅"], ["طوطی", "🦜"],
    ["کبوتر", "🕊️"], ["مورچه", "🐜"], ["حلزون", "🐌"], ["عنکبوت", "🕷️"], ["خفاش", "🦇"], ["سنجاب", "🐿️"],
    ["کرگدن", "🦏"], ["گورخر", "🦓"], ["پلنگ", "🐆"], ["خرچنگ", "🦀"], ["میگو", "🦐"], ["شیر", "🦁"],
  ],
  // طبیعت
  nature: [
    ["ماه", "🌙"], ["گل", "🌸"], ["رز", "🌹"], ["درخت", "🌳"], ["برگ", "🍃"], ["ابر", "☁️"],
    ["باران", "🌧️"], ["برف", "❄️"], ["ستاره", "⭐"], ["خورشید", "☀️"], ["کوه", "⛰️"], ["آتش", "🔥"],
    ["دریا", "🌊"], ["کاکتوس", "🌵"], ["زمین", "🌍"], ["رعد", "⚡"],
  ],
  // چیزها
  thing: [
    ["کفش", "👟"], ["کلاه", "🧢"], ["توپ", "⚽"], ["کتاب", "📖"], ["مداد", "✏️"], ["ساعت", "⌚"],
    ["خانه", "🏠"], ["قلب", "❤️"], ["هدیه", "🎁"], ["کلید", "🔑"], ["قاشق", "🥄"], ["چتر", "☂️"],
    ["عینک", "👓"], ["بادکنک", "🎈"], ["لامپ", "💡"], ["قیچی", "✂️"], ["چکش", "🔨"], ["جارو", "🧹"],
    ["صندلی", "🪑"], ["تخت", "🛏️"], ["در", "🚪"], ["پیراهن", "👕"], ["شلوار", "👖"], ["جوراب", "🧦"],
    ["دستکش", "🧤"], ["شال", "🧣"], ["تاج", "👑"], ["انگشتر", "💍"], ["کیف", "👜"], ["طبل", "🥁"],
    ["گیتار", "🎸"], ["زنگ", "🔔"], ["نامه", "✉️"], ["دوربین", "📷"], ["چمدان", "🧳"], ["شمع", "🕯️"],
    ["گوشی", "📱"], ["بادبادک", "🪁"],
  ],
  // وسیله‌های نقلیه
  vehicle: [
    ["ماشین", "🚗"], ["قطار", "🚆"], ["کشتی", "🚢"], ["قایق", "⛵"], ["موشک", "🚀"], ["دوچرخه", "🚲"],
    ["هواپیما", "✈️"], ["اتوبوس", "🚌"], ["تاکسی", "🚕"], ["کامیون", "🚚"], ["تراکتور", "🚜"], ["موتور", "🏍️"],
  ],
  // بدن و آدم‌ها
  body: [
    ["دست", "✋"], ["چشم", "👁️"], ["گوش", "👂"], ["بینی", "👃"], ["پا", "🦶"], ["دندان", "🦷"],
    ["بچه", "👶"], ["پسر", "👦"], ["دختر", "👧"], ["بابا", "👨"], ["مامان", "👩"], ["پلیس", "👮"],
  ],
};
const KIDS_WORDS = Object.values(KIDS_CATS).flat()
  .filter((w, i, all) => all.findIndex((v) => v[0] === w[0]) === i);

const KIDS_HINT_MS = 4500; // اگر بچه مدتی حرف درست را نزد، همان حرف تکان می‌خورد

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
  kwLeavePlay();
  kwIn = null;
  kidsWorld.classList.add("hidden");
  kidsGate.classList.remove("hidden");
}
// هر بخش ظاهر انتخابی خودش را دارد؛ ظاهر خریده‌شده (save.owned) در هر دو بخش باز است
const kwThemeOf = (id) => (id && themeOwned(id) ? id : "plain");
// عوض کردن ظاهر و ساختن دوباره‌ی صفحه‌ی زیرین؛ وگرنه صحنه‌ی بالای منو (جدول ساده، صورت فلکی و …)
// از ظاهر قبلی می‌ماند و دو ظاهر قاطی می‌شوند
function kwUseTheme(id) {
  if (activeTheme === id) return;
  applyTheme(id);
  if (screenNow) route();
}
function chooseAdult() {
  kidsGate.classList.add("hidden");
  kidsWorld.classList.add("hidden");
  kwUseTheme(kwThemeOf(save.theme));
}
function chooseKid() {
  kidsGate.classList.add("hidden");
  kidsWorld.classList.remove("hidden");
  kwUseTheme(kwThemeOf(X().kidsTheme || save.theme));
  kwMenu();
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
// کلمه‌های کوتاه اول؛ هر چه بچه بیشتر بسازد، کلمه‌های بلندتر هم می‌آیند
function kwMaxLen(done) {
  if (done < 8) return 3;
  if (done < 20) return 4;
  if (done < 40) return 5;
  return 9;
}
function kwPick() {
  const st = kwState();
  const max = kwMaxLen(st.done);
  let pool = KIDS_WORDS.filter((w) => [...w[0]].length <= max && !st.recent.includes(w[0]));
  if (!pool.length) pool = KIDS_WORDS.filter((w) => [...w[0]].length <= max);
  return pool[Math.floor(Math.random() * pool.length)];
}

function kwTodayStars() {
  const st = X().kids;
  return st && st.day === todayKey() ? st.all || st.n || 0 : 0;
}

function kwNext() {
  kwStop();
  kwIn = "pic";
  const [word, pic] = kwPick();
  const letters = [...word];
  let order = shuffled(letters.map((ch, i) => ({ ch, i })), Math.random);
  if (letters.length > 1 && order.every((o, k) => o.i === k)) order = order.reverse();
  kw = { word, pic, letters, at: 0 };
  $("kwStars").textContent = faDigits(kwTodayStars());
  $("kwStage").innerHTML = `
    <div class="kw-pic">${pic}</div>
    <div class="kw-slots">${letters.map(() => `<span class="kw-slot"></span>`).join("")}</div>
    <div class="kw-keys">${order.map((o) => `<button class="kw-key" type="button">${o.ch}</button>`).join("")}</div>`;
  $("kwStage").querySelectorAll(".kw-key").forEach((k) => (k.onclick = () => kwTap(k)));
  kwArmHint();
}

function kwArmHint() {
  clearTimeout(kwHintTimer);
  $("kwStage").querySelectorAll(".kw-key.nudge").forEach((k) => k.classList.remove("nudge"));
  kwHintTimer = setTimeout(() => {
    const need = kw && kw.letters[kw.at];
    const key = [...$("kwStage").querySelectorAll(".kw-key:not([disabled])")].find((k) => k.textContent === need);
    if (key) key.classList.add("nudge");
  }, KIDS_HINT_MS);
}

function kwTap(key) {
  if (!kw || kw.at >= kw.letters.length) return;
  if (key.textContent !== kw.letters[kw.at]) {
    // حرف اشتباه فقط تکان می‌خورد و سر جایش می‌ماند؛ چیزی از دست نمی‌رود
    if (typeof sound === "function") sound("repeat");
    if (typeof haptic === "function") haptic("light");
    key.classList.remove("no");
    void key.offsetWidth;
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
  st.recent = [kw.word, ...st.recent.filter((w) => w !== kw.word)].slice(0, 40);
  kwReward();
  const stage = $("kwStage");
  stage.querySelector(".kw-slots").outerHTML = `<div class="kw-word">${kw.word}</div>`;
  stage.querySelector(".kw-keys").innerHTML = kwCheer();
  stage.querySelector(".kw-pic").classList.add("win");
  kwLater(kwNext, 1700);
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
  void btn.offsetWidth;
  btn.classList.add("no");
}

const KW_GAMES = [
  ["pic", "🖼️", "نقاشی و کلمه", () => kwNext()],
  ["wheel", "🎡", "چرخ کلمه", () => kwWheel()],
  ["spell", "✏️", "کدوم درسته؟", () => kwSpell()],
  ["ef", "🔤", "حرف‌شکار", () => kwEf()],
  ["themes", "🎨", "ظاهر بازی", () => kwThemes()],
];

function kwMenu() {
  kwStop();
  kwLeavePlay();
  kwIn = null;
  kidsWorld.classList.remove("hidden");
  $("kwStars").textContent = faDigits(kwTodayStars());
  $("kwStage").innerHTML = `
    <div class="kw-title">چی بازی کنیم؟</div>
    <div class="kw-menu">${KW_GAMES.map(([id, ic, name]) =>
      `<button class="kw-game kw-g-${id}" type="button" data-kw="${id}"><span>${ic}</span><b>${name}</b></button>`).join("")}</div>`;
  $("kwStage").querySelectorAll(".kw-game").forEach((b) => (b.onclick = () => KW_GAMES.find((g) => g[0] === b.dataset.kw)[3]()));
}

// ---------------------------------------------------------------------------
// کدوم درسته؟ (املا): نقاشی و دو شکل نوشتن؛ بچه شکل درست را می‌زند
// ---------------------------------------------------------------------------
// [درست، غلط، نقاشی]؛ شکل غلط نباید خودش کلمه‌ی درستی باشد

const KIDS_SPELL = [
  ["طوطی", "توتی", "🦜"], ["قاشق", "غاشق", "🥄"], ["صندلی", "سندلی", "🪑"], ["حلزون", "هلزون", "🐌"],
  ["عینک", "عینگ", "👓"], ["عسل", "اسل", "🍯"], ["قورباغه", "غورباغه", "🐸"], ["ذرت", "زرت", "🌽"],
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
let kwSpellLast = [];

function kwSpell() {
  kwStop();
  kwIn = "spell";
  const pool = KIDS_SPELL.filter((x) => !kwSpellLast.includes(x[0]));
  const [right, wrong, pic] = lnPick(pool.length ? pool : KIDS_SPELL);
  kwSpellLast = [right, ...kwSpellLast].slice(0, 15);
  const opts = Math.random() < 0.5 ? [right, wrong] : [wrong, right];
  $("kwStars").textContent = faDigits(kwTodayStars());
  $("kwStage").innerHTML = `
    <div class="kw-pic">${pic}</div>
    <div class="kw-ask">کدوم درست نوشته شده؟</div>
    <div class="kw-opts">${opts.map((w) => `<button class="kw-opt" type="button">${w}</button>`).join("")}</div>`;
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
    kwLater(kwSpell, 1500);
  }));
}

// ---------------------------------------------------------------------------
// اسم فامیل کودک: یک حرف میاد و شش نقاشی بدون اسم؛ بچه باید اسم هر نقاشی رو تو ذهنش بگه
// و همه‌ی اونایی که با این حرف شروع میشن رو پیدا کنه. اسم هر نقاشی بعد از زدنش نشون داده میشه.
// ---------------------------------------------------------------------------

const KW_EF_CARDS = 6;
// نقاشی‌هایی که اسمشان یکی نیست (مثلاً 📱 هم گوشی است هم موبایل) در این بازی نمی‌آیند
const KW_EF_SKIP = new Set(["آب", "شیرینی", "زمین", "رعد", "دست", "پا", "بابا", "مامان", "پسر", "دختر", "بچه", "گوشی", "لامپ", "تخم", "کیف", "شال", "در", "برگ", "پلیس", "رز", "هدیه", "تاکسی", "بینی", "کلوچه", "خروس"]);
// حرف‌های هم‌صدا: نقاشی‌ای که با حرف هم‌صدا شروع شود گزینه‌ی غلط نمی‌شود (بچه صدا را می‌شنود نه املا را)
const KW_SAME_SOUND = ["اعآ", "تط", "سصث", "زذضظ", "هح", "قغ"];
const kwFirst = (w) => (w[0] === "آ" ? "ا" : w[0]);
const kwSound = (ch) => (KW_SAME_SOUND.find((g) => g.includes(ch)) || ch);
let kef = null; // { letter, need, got }

function kwEfWords() {
  const seen = new Set();
  return KIDS_WORDS.filter(([w, pic]) => !KW_EF_SKIP.has(w) && !seen.has(pic) && seen.add(pic));
}

function kwEf() {
  kwStop();
  kwIn = "ef";
  const words = kwEfWords();
  const count = {};
  for (const [w] of words) count[kwFirst(w)] = (count[kwFirst(w)] || 0) + 1;
  // حرف‌هایی که دست‌کم سه نقاشی دارند
  const last = kef && kef.letter;
  const letter = lnPick(Object.keys(count).filter((ch) => count[ch] >= 3 && ch !== last));
  const right = shuffled(words.filter(([w]) => kwFirst(w) === letter), Math.random).slice(0, 2 + (Math.random() < 0.5 ? 1 : 0));
  const same = kwSound(letter);
  const wrong = [];
  for (const w of shuffled(words, Math.random)) {
    if (wrong.length >= KW_EF_CARDS - right.length) break;
    if (kwSound(kwFirst(w[0])) !== same) wrong.push(w);
  }
  kef = { letter, need: right.length, got: 0, right: new Set(right.map((w) => w[0])) };
  const cards = shuffled([...right, ...wrong], Math.random);
  $("kwStars").textContent = faDigits(kwTodayStars());
  $("kwStage").innerHTML = `
    <div class="kw-ef-head"><div class="kw-letter">${letter}</div></div>
    <div class="kw-ask">اسم کدوم نقاشی‌ها با «${letter}» شروع میشه؟<br><small id="kefLeft">${faDigits(kef.need)} تا پیدا کن</small></div>
    <div class="kw-cards six">${cards.map(([w, pic]) => `<button class="kw-card" type="button" data-w="${w}"><span>${pic}</span><b>${w}</b></button>`).join("")}</div>`;
  $("kwStage").querySelectorAll(".kw-card").forEach((b) => (b.onclick = () => {
    if (!kef.right.has(b.dataset.w)) {
      b.disabled = true;
      b.classList.add("show");
      return kwOops(b);
    }
    b.disabled = true;
    b.classList.add("right", "show");
    kef.got++;
    if (kef.got < kef.need) {
      if (typeof sound === "function") sound("letter", kef.got);
      $("kefLeft").textContent = `${faDigits(kef.need - kef.got)} تای دیگه`;
      return;
    }
    $("kwStage").querySelectorAll(".kw-card").forEach((o) => (o.disabled = true));
    kwReward();
    $("kwStage").querySelector(".kw-ask").outerHTML = kwCheer();
    kwLater(kwEf, 1800);
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
  kwSeeds = { easy, 4: seedsOf(4), 5: seedsOf(5) };
}

function kwBuild(seed, rnd) {
  const subs = generator.wordsFrom(seed).filter((w) => w !== seed && w.length >= 2 && generator.levelOf(w) === 1);
  const rank = (w) => (kwSeeds.easy.has(w) ? 0 : 2) + (w.length === 2 ? 1 : 0) + rnd();
  const pool = subs.map((w) => ({ w, k: rank(w) })).sort((a, b) => a.k - b.k).map((x) => x.w);
  const picked = [seed];
  let twos = 0;
  for (const w of pool) {
    if (picked.length >= KW_MAX_WORDS) break;
    if (w.length === 2 && twos >= 1) continue;
    if (buildLayout([...picked, w], 400).connected) {
      picked.push(w);
      if (w.length === 2) twos++;
    }
  }
  return { letters: shuffled([...seed], rnd), words: picked, seed };
}

function kwWheelLevel(n) {
  if (n < handmade.length || !generator) return handmade[n % handmade.length];
  kwPrepare();
  const g = n - handmade.length;
  const list = g < 20 || !kwSeeds[5].length ? kwSeeds[4] : g % 2 ? kwSeeds[5] : kwSeeds[4];
  let best = null;
  for (let k = 0; k < 6; k++) {
    const seed = list[(g + k * 7) % list.length];
    const lv = kwBuild(seed, seededRandom(hashText(seed) + g));
    if (!best || lv.words.length > best.words.length) best = lv;
    if (lv.words.length >= 3) break;
  }
  return best;
}

function kwWheel() {
  kwStop();
  kwIn = "wheel";
  const n = kwState().lv || 0;
  kidsWorld.classList.add("hidden");
  $("app").classList.add("mode-kids");
  startPuzzle(kwWheelLevel(n), n, KW_PREFIX + n);
  $("levelLabel").textContent = `🧸 مرحله‌ی ${faDigits(n + 1)}`;
  open("play");
}

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
    <button class="kw-next" type="button" id="kwNextLevel">مرحله‌ی بعد ◀</button>`;
  kwReward();
  $("kwNextLevel").onclick = kwWheel;
}

// ---------------------------------------------------------------------------
// ظاهر بازی در بخش کودک
// ---------------------------------------------------------------------------
// همان صفحه‌ی ظاهرها، ولی انتخاب در X().kidsTheme ذخیره می‌شود و به ظاهر بزرگسال دست نمی‌زند.
// خرید مشترک است: ظاهری که در هر بخش خریده شود در هر دو باز است. پیش از خرید در بخش کودک،
// یک سؤال ساده برای بزرگ‌ترها می‌آید تا بچه خودش چیزی نخرد.

let kwThemeMode = false;

function kwThemes() {
  kwStop();
  kwIn = "themes";
  kwThemeMode = true;
  kidsWorld.classList.add("hidden");
  open("themes");
  renderThemes();
}

function kwThemesDone() {
  kwThemeMode = false;
  kwParentClose();
  hideThemeSheet();
  kwMenu();
}

{
  const baseRender = renderThemes;
  renderThemes = function () {
    baseRender();
    if (!kwThemeMode) return;
    const mine = kwThemeOf(X().kidsTheme || save.theme);
    THEMES.forEach((t, i) => {
      const card = $("themeList").children[i];
      if (card) card.classList.toggle("selected", t.id === mine && themeOwned(t.id));
    });
    $("themesBack").classList.remove("hidden");
  };

  const baseChoose = chooseTheme;
  chooseTheme = function (id) {
    if (!kwThemeMode) return baseChoose(id);
    const t = THEMES.find((x) => x.id === id);
    if (!themeOwned(id)) return kwParentGate(() => showThemeSheet(t));
    X().kidsTheme = id;
    persist();
    applyTheme(id);
    goHome();
  };
}

// «برگشت» از صفحه‌ی ظاهرها (دکمه‌ی بالا یا دکمه‌ی گوشی) به فهرست بازی‌های کودک
window.addEventListener("hashchange", () => {
  if (kwThemeMode && location.hash !== "#themes") kwThemesDone();
});
{
  const baseBack = window.kalamehBack;
  window.kalamehBack = () => {
    if (!kwThemeMode) return baseBack();
    if (!kwParent.classList.contains("hidden")) return kwParentClose(), "closed";
    if (!$("themeSheet").classList.contains("hidden")) return hideThemeSheet(), "closed";
    history.replaceState(null, "", location.pathname + location.search);
    route();
    kwThemesDone();
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
