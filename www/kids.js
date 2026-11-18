"use strict";

// دو بخش بازی (بعد از learn.js بارگذاری می‌شود):
// هر بار که بازی باز می‌شود، اول بازیکن انتخاب می‌کند: «کودک» (راست) یا «بزرگسال» (چپ).
// بزرگسال همان بازی همیشگی است. کودک فقط یک بازی ساده دارد: نقاشی را می‌بیند و
// با زدن حرف‌ها اسمش را می‌سازد؛ بدون وقت، بدون باخت، بدون منو و سکه و چیز اضافه.

const KIDS_WORDS = [
  // میوه و خوراکی
  ["سیب", "🍎"], ["موز", "🍌"], ["انگور", "🍇"], ["لیمو", "🍋"], ["گیلاس", "🍒"], ["پرتقال", "🍊"],
  ["هندوانه", "🍉"], ["آناناس", "🍍"], ["هلو", "🍑"], ["گلابی", "🍐"], ["نارگیل", "🥥"], ["کیوی", "🥝"],
  ["هویج", "🥕"], ["گوجه", "🍅"], ["پیاز", "🧅"], ["سیر", "🧄"], ["ذرت", "🌽"], ["قارچ", "🍄"],
  ["فلفل", "🌶️"], ["خیار", "🥒"], ["بادمجان", "🍆"], ["نان", "🍞"], ["کیک", "🍰"], ["پنیر", "🧀"],
  ["تخم", "🥚"], ["عسل", "🍯"], ["پیتزا", "🍕"], ["بستنی", "🍦"], ["شکلات", "🍫"], ["کلوچه", "🍪"],
  ["چای", "🍵"], ["برنج", "🍚"], ["دونات", "🍩"], ["نمک", "🧂"], ["آب", "💧"], ["شیرینی", "🧁"],
  // حیوان‌ها
  ["ماهی", "🐟"], ["گربه", "🐈"], ["سگ", "🐕"], ["اسب", "🐎"], ["شیر", "🦁"], ["خرس", "🐻"],
  ["موش", "🐭"], ["مرغ", "🐔"], ["خروس", "🐓"], ["جوجه", "🐥"], ["اردک", "🦆"], ["فیل", "🐘"],
  ["زنبور", "🐝"], ["میمون", "🐒"], ["خرگوش", "🐇"], ["مار", "🐍"], ["جغد", "🦉"], ["شتر", "🐫"],
  ["گاو", "🐄"], ["زرافه", "🦒"], ["پروانه", "🦋"], ["ببر", "🐅"], ["گرگ", "🐺"], ["روباه", "🦊"],
  ["پنگوئن", "🐧"], ["قورباغه", "🐸"], ["کوسه", "🦈"], ["نهنگ", "🐋"], ["دلفین", "🐬"], ["اختاپوس", "🐙"],
  ["گوسفند", "🐑"], ["بز", "🐐"], ["کانگورو", "🦘"], ["تمساح", "🐊"], ["عقاب", "🦅"], ["طوطی", "🦜"],
  ["کبوتر", "🕊️"], ["مورچه", "🐜"], ["حلزون", "🐌"], ["عنکبوت", "🕷️"], ["خفاش", "🦇"], ["سنجاب", "🐿️"],
  ["کرگدن", "🦏"], ["گورخر", "🦓"], ["پلنگ", "🐆"], ["خرچنگ", "🦀"], ["میگو", "🦐"], ["شیر", "🦁"],
  // طبیعت
  ["ماه", "🌙"], ["گل", "🌸"], ["رز", "🌹"], ["درخت", "🌳"], ["برگ", "🍃"], ["ابر", "☁️"],
  ["باران", "🌧️"], ["برف", "❄️"], ["ستاره", "⭐"], ["خورشید", "☀️"], ["کوه", "⛰️"], ["آتش", "🔥"],
  ["دریا", "🌊"], ["کاکتوس", "🌵"], ["زمین", "🌍"], ["رعد", "⚡"],
  // چیزها
  ["کفش", "👟"], ["کلاه", "🧢"], ["توپ", "⚽"], ["کتاب", "📖"], ["مداد", "✏️"], ["ساعت", "⌚"],
  ["خانه", "🏠"], ["قلب", "❤️"], ["هدیه", "🎁"], ["کلید", "🔑"], ["قاشق", "🥄"], ["چتر", "☂️"],
  ["عینک", "👓"], ["بادکنک", "🎈"], ["لامپ", "💡"], ["قیچی", "✂️"], ["چکش", "🔨"], ["جارو", "🧹"],
  ["صندلی", "🪑"], ["تخت", "🛏️"], ["در", "🚪"], ["پیراهن", "👕"], ["شلوار", "👖"], ["جوراب", "🧦"],
  ["دستکش", "🧤"], ["شال", "🧣"], ["تاج", "👑"], ["انگشتر", "💍"], ["کیف", "👜"], ["طبل", "🥁"],
  ["گیتار", "🎸"], ["زنگ", "🔔"], ["نامه", "✉️"], ["دوربین", "📷"], ["چمدان", "🧳"], ["شمع", "🕯️"],
  ["گوشی", "📱"], ["بادبادک", "🪁"],
  // وسیله‌های نقلیه
  ["ماشین", "🚗"], ["قطار", "🚆"], ["کشتی", "🚢"], ["قایق", "⛵"], ["موشک", "🚀"], ["دوچرخه", "🚲"],
  ["هواپیما", "✈️"], ["اتوبوس", "🚌"], ["تاکسی", "🚕"], ["کامیون", "🚚"], ["تراکتور", "🚜"], ["موتور", "🏍️"],
  // بدن و آدم‌ها
  ["دست", "✋"], ["چشم", "👁️"], ["گوش", "👂"], ["بینی", "👃"], ["پا", "🦶"], ["دندان", "🦷"],
  ["بچه", "👶"], ["پسر", "👦"], ["دختر", "👧"], ["بابا", "👨"], ["مامان", "👩"], ["پلیس", "👮"],
].filter((w, i, all) => all.findIndex((v) => v[0] === w[0]) === i);

const KIDS_PAID = 10; // هر روز فقط ۱۰ کلمه‌ی اول سکه دارد (بی‌صدا به کیف سکه اضافه می‌شود)
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
        <span class="kg-ic">🧸</span><b>کودک</b><small>نقاشی ببین، اسمش رو بساز</small>
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
  kidsWorld.classList.add("hidden");
  kidsGate.classList.remove("hidden");
}
function chooseAdult() {
  kidsGate.classList.add("hidden");
  kidsWorld.classList.add("hidden");
}
function chooseKid() {
  kidsGate.classList.add("hidden");
  kidsWorld.classList.remove("hidden");
  kwNext();
}
$("kgKid").onclick = chooseKid;
$("kgAdult").onclick = chooseAdult;
$("kwHome").onclick = showGate;

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
  let day = X().kids;
  if (!day || day.day !== todayKey()) day = X().kids = { day: todayKey(), n: 0 };
  day.all = (day.all || day.n || 0) + 1;
  if (day.n < KIDS_PAID) {
    day.n++;
    save.coins += 1;
  }
  persist();
  if (typeof sound === "function") sound("complete");
  if (typeof haptic === "function") haptic("light");
  const stage = $("kwStage");
  stage.querySelector(".kw-slots").outerHTML = `<div class="kw-word">${kw.word}</div>`;
  stage.querySelector(".kw-keys").innerHTML = `<div class="kw-cheer">${lnPick(["آفرین!", "عالی!", "ایول!", "باریکلا!", "چه خوب!"])}</div>`;
  stage.querySelector(".kw-pic").classList.add("win");
  $("kwStars").textContent = faDigits(day.all);
  kwConfetti();
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
