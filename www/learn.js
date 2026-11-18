"use strict";

// پنج بازی کوچک تازه در «سرگرمی‌ها» (بعد از plus2.js بارگذاری می‌شود):
// ۱. مشاعره با بیت‌های حافظ
// ۲. مرور واژه‌ها: کلمه‌های دفتر واژه‌ها با فاصله‌ی بیشتر و بیشتر دوباره پرسیده می‌شوند
// ۳. حالت کودک: کلمه‌های ساده با نقاشی، بدون وقت و بدون باخت
// ۴. جدول متقاطع هفتگی با سرنخ (معنی کلمه‌ها)
// ۵. غلط املایی رو پیدا کن

const lnSheet = fixedSheet("lnSheet", `<div class="ln-body"></div>`, "x-sheet ln-sheet");
const lnBody = lnSheet.querySelector(".ln-body");
let lnTimer = null;
let lnWaits = [];

// هر وقفه‌ای که بازی‌ها می‌گذارند با بستن یا عوض کردن بازی لغو می‌شود
function lnLater(fn, ms) {
  lnWaits.push(setTimeout(fn, ms));
}
function lnStop() {
  clearInterval(lnTimer);
  lnTimer = null;
  lnWaits.forEach(clearTimeout);
  lnWaits = [];
}
function lnShow(html) {
  lnStop();
  modesSheet.classList.add("hidden");
  lnBody.innerHTML = html;
  lnSheet.classList.remove("hidden");
}
function lnBack() {
  lnStop();
  lnSheet.classList.add("hidden");
  openModes();
}
window.addEventListener("hashchange", lnStop);

const lnEsc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const lnPick = (list) => list[Math.floor(Math.random() * list.length)];
const lnMix = (list) => shuffled(list, Math.random);
const lnSame = (a, b) => normalize(a).replace(/آ/g, "ا") === normalize(b).replace(/آ/g, "ا");
function lnGood(el) {
  if (typeof sound === "function") sound("found");
  if (typeof haptic === "function") haptic("light");
  giveCoins(1, el);
  updateCoins();
}
function lnBad() {
  if (typeof sound === "function") sound("wrong");
  if (typeof haptic === "function") haptic("error");
}
function lnFoot(extra = "") {
  return `${extra}<button class="card-link" type="button" data-ln-back>برگشت به سرگرمی‌ها</button>`;
}
lnSheet.addEventListener("click", (e) => {
  if (e.target.closest("[data-ln-back]")) lnBack();
});

// ---------------------------------------------------------------------------
// ۱. مشاعره
// ---------------------------------------------------------------------------
// هر بیت با حرف آخرِ بیت قبلی شروع می‌شود؛ بازیکن مصراع دوم آن را پیدا می‌کند.

const MS_TIME = 25;
const LN_FIX = { "آ": "ا", "أ": "ا", "إ": "ا", "ئ": "ی", "ؤ": "و", "ة": "ه", "ي": "ی", "ى": "ی", "ك": "ک" };
function lnLetters(text) {
  return [...String(text)].map((c) => LN_FIX[c] || c).filter((c) => ALPHABET.includes(c));
}
const lnFirst = (t) => lnLetters(t)[0];
const lnLast = (t) => lnLetters(t).slice(-1)[0];

let msBeyts = null;
let msByFirst = null;
function msPrepare() {
  if (msBeyts) return;
  msBeyts = [];
  const add = (m1, m2, g) => {
    const f = lnFirst(m1), l = lnLast(m2);
    if (f && l) msBeyts.push({ m1, m2, f, l, g });
  };
  if (typeof HAFEZ_DIVAN !== "undefined") {
    for (const [num, text] of HAFEZ_DIVAN) {
      const m = text.split("/");
      for (let i = 0; i + 1 < m.length; i += 2) add(m[i], m[i + 1], num);
    }
  } else if (typeof HAFEZ !== "undefined") {
    HAFEZ.forEach(([m1, m2], i) => add(m1, m2, -i));
  }
  msByFirst = {};
  for (const b of msBeyts) (msByFirst[b.f] = msByFirst[b.f] || []).push(b);
}

let ms = null;

async function openMoshaere() {
  lnShow(`<div class="card-title">مشاعره 📜</div><div class="card-text">دیوان حافظ داره باز می‌شه…</div>`);
  await loadDivan();
  msPrepare();
  if (!msBeyts.length) {
    lnBody.innerHTML = `<div class="card-title">مشاعره 📜</div><div class="card-text">دیوان باز نشد. دوباره امتحان کن.</div>${lnFoot()}`;
    return;
  }
  const best = X().msBest || 0;
  lnBody.innerHTML = `
    <div class="card-title">مشاعره 📜</div>
    <div class="card-text">هر بیت با <b>حرف آخرِ</b> بیت قبلی شروع می‌شه. مصراع اولش رو می‌بینی و باید از سه گزینه‌ی هم‌قافیه، مصراع دوم درستش رو پیدا کنی.
    هر جواب درست یه سکه داره و سه بار می‌تونی اشتباه کنی.${best ? `<br>رکوردت: ${faDigits(best)} بیت پشت سر هم` : ""}</div>
    ${lnFoot(`<button class="card-btn" type="button" id="msGo">شروع</button>`)}`;
  $("msGo").onclick = msStart;
}

function msStart() {
  ms = { cur: lnPick(msBeyts), chain: 0, lives: 3, used: new Set() };
  msRound();
}

function msBeytHtml(b, mark) {
  let m2 = lnEsc(b.m2);
  if (mark) {
    // حرف آخر مصراع دوم پررنگ می‌شود
    const chars = [...b.m2];
    for (let i = chars.length - 1; i >= 0; i--) {
      if ((LN_FIX[chars[i]] || chars[i]) === b.l) {
        m2 = lnEsc(chars.slice(0, i).join("")) + `<mark>${lnEsc(chars[i])}</mark>` + lnEsc(chars.slice(i + 1).join(""));
        break;
      }
    }
  }
  return `<div class="ms-beyt"><span>${lnEsc(b.m1)}</span><span>${m2}</span></div>`;
}

// بیت بعدی خودکار با حرف آخر بیت قبلی شروع می‌شود؛ بازیکن باید مصراع دومش را از میان سه گزینه
// پیدا کند. گزینه‌های غلط هم‌قافیه‌اند: یکی از همان غزل و یکی از غزلی دیگر که به همان حرف تمام می‌شود.
function msRound() {
  const need = ms.cur.l;
  const good = (msByFirst[need] || []).filter((b) => !ms.used.has(b) && b !== ms.cur);
  if (!good.length) {
    // با این حرف بیتی نمانده؛ یک بیت تازه شروع می‌شود
    ms.cur = lnPick(msBeyts);
    return msRound();
  }
  const right = lnPick(good);
  const wrong = [];
  const take = (list) => {
    const ok = list.filter((b) => b.m2 !== right.m2 && !wrong.some((w) => w.m2 === b.m2));
    if (ok.length) wrong.push(lnPick(ok));
  };
  take(msBeyts.filter((b) => b.g === right.g));
  take(msBeyts.filter((b) => b.g !== right.g && b.l === right.l));
  while (wrong.length < 2) take(msBeyts);
  const options = lnMix([right, ...wrong]);
  let left = MS_TIME;
  lnBody.innerHTML = `
    <div class="ln-top"><span>❤️ ${faDigits(ms.lives)}</span><b>مشاعره</b><span id="msClock">⏱ ${faDigits(left)}</span></div>
    ${msBeytHtml(ms.cur, true)}
    <div class="ln-ask">بیت بعدی، با «${need}»:</div>
    <div class="ms-next">${lnEsc(right.m1)}</div>
    <div class="ln-ask">مصراع دومش کدومه؟</div>
    <div class="ln-options">${options.map((b, i) => `<button class="ln-opt ms-opt" type="button" data-i="${i}">${lnEsc(b.m2)}</button>`).join("")}</div>
    <div class="ln-score">زنجیره: ${faDigits(ms.chain)} بیت</div>
    ${lnFoot()}`;
  const buttons = [...lnBody.querySelectorAll(".ms-opt")];
  const answer = (btn) => {
    lnStop();
    buttons.forEach((b) => (b.disabled = true));
    const okBtn = buttons[options.indexOf(right)];
    okBtn.classList.add("right");
    ms.used.add(right);
    ms.cur = right;
    if (btn === okBtn) {
      ms.chain++;
      lnGood(btn);
    } else {
      if (btn) btn.classList.add("wrong");
      ms.lives--;
      lnBad();
    }
    lnLater(() => (ms.lives > 0 ? msRound() : msEnd()), btn === okBtn ? 900 : 2000);
  };
  buttons.forEach((b) => (b.onclick = () => answer(b)));
  lnTimer = setInterval(() => {
    left--;
    const clock = $("msClock");
    if (clock) clock.textContent = `⏱ ${faDigits(Math.max(0, left))}`;
    if (left <= 0) answer(null);
  }, 1000);
}

function msEnd() {
  const best = X().msBest || 0;
  const record = ms.chain > best;
  if (record) X().msBest = ms.chain;
  persist();
  lnBody.innerHTML = `
    <div class="card-title">${record ? "رکورد تازه! 🏆" : "تموم شد!"}</div>
    <div class="ln-big">${faDigits(ms.chain)}</div>
    <div class="card-text">بیت پشت سر هم${record ? "" : ` · رکوردت ${faDigits(best)}`}</div>
    ${lnFoot(`<button class="card-btn" type="button" id="msAgain">یه دست دیگه</button>`)}`;
  $("msAgain").onclick = msStart;
}

// ---------------------------------------------------------------------------
// ۲. مرور واژه‌ها (فلش‌کارت)
// ---------------------------------------------------------------------------
// هر کلمه‌ی دفتر واژه‌ها یک «جعبه» دارد. جواب درست کلمه را به جعبه‌ی بعد می‌برد و دیرتر دوباره می‌آید؛
// جواب غلط آن را به جعبه‌ی اول برمی‌گرداند (فردا دوباره).

const RV_GAPS = [1, 2, 4, 7, 15, 30];
const RV_SIZE = 10;

function rvState() {
  if (!X().rev || typeof X().rev !== "object") X().rev = {};
  return X().rev;
}
const rvToday = () => dayNumber(nowDate());

function rvQueue() {
  const st = rvState();
  const today = rvToday();
  const due = [], fresh = [];
  for (const w of bookWords()) {
    if (!dict.get(w)) continue;
    const s = st[w];
    if (!s) fresh.push(w);
    else if (s[1] <= today) due.push(w);
  }
  return [...lnMix(due), ...lnMix(fresh)].slice(0, RV_SIZE);
}

function rvLearned() {
  return Object.values(rvState()).filter((s) => s[0] >= 3).length;
}

function rvShort(text) {
  return text.length > 80 ? text.slice(0, 78) + "…" : text;
}

let rv = null;

function openReview() {
  const queue = rvQueue();
  const learned = rvLearned();
  if (bookWords().filter((w) => dict.get(w)).length < 4) {
    lnShow(`<div class="card-title">مرور واژه‌ها 🧠</div>
      <div class="card-text">کلمه‌هایی که توی مرحله‌ها پیدا می‌کنی اینجا جمع می‌شن تا معنیشون یادت بمونه. چند تا مرحله بازی کن و برگرد.</div>${lnFoot()}`);
    return;
  }
  lnShow(`<div class="card-title">مرور واژه‌ها 🧠</div>
    <div class="card-text">${queue.length
      ? `امروز ${faDigits(queue.length)} کلمه برای مرور داری. معنی درست رو انتخاب کن؛ کلمه‌ای که بلدی دیرتر برمی‌گرده و کلمه‌ای که یادت رفته زودتر.`
      : "امروز همه‌ی مرورها رو انجام دادی. فردا برگرد!"}
      ${learned ? `<br>کلمه‌هایی که خوب یاد گرفتی: ${faDigits(learned)}` : ""}</div>
    ${lnFoot(queue.length ? `<button class="card-btn" type="button" id="rvGo">شروع مرور</button>` : "")}`);
  if (queue.length) $("rvGo").onclick = () => {
    rv = { queue, i: 0, right: 0 };
    rvRound();
  };
}

function rvRound() {
  const word = rv.queue[rv.i];
  const meaning = dict.get(word);
  const others = new Set();
  const all = [...dict.keys()];
  while (others.size < 3) {
    const w = lnPick(all);
    const m = dict.get(w);
    if (w !== word && m && rvShort(m.trim()) !== rvShort(meaning.trim()) && ![...others].some((o) => rvShort(o.trim()) === rvShort(m.trim()))) others.add(m);
  }
  const options = lnMix([meaning, ...others]);
  lnBody.innerHTML = `
    <div class="ln-top"><span>${faDigits(rv.i + 1)} از ${faDigits(rv.queue.length)}</span><b>مرور واژه‌ها</b><span>✓ ${faDigits(rv.right)}</span></div>
    <div class="ln-word">${lnEsc(word)}</div>
    <div class="ln-ask">معنیش کدومه؟</div>
    <div class="ln-options">${options.map((m, i) => `<button class="ln-opt" type="button" data-i="${i}">${lnEsc(rvShort(m))}</button>`).join("")}</div>
    ${lnFoot()}`;
  const buttons = [...lnBody.querySelectorAll(".ln-opt")];
  const okBtn = buttons[options.indexOf(meaning)];
  buttons.forEach((btn) => (btn.onclick = () => {
    buttons.forEach((b) => (b.disabled = true));
    okBtn.classList.add("right");
    const st = rvState();
    const box = st[word] ? st[word][0] : 0;
    if (btn === okBtn) {
      rv.right++;
      const next = Math.min(box + 1, RV_GAPS.length - 1);
      st[word] = [next, rvToday() + RV_GAPS[next]];
      lnGood(btn);
    } else {
      btn.classList.add("wrong");
      st[word] = [0, rvToday() + 1];
      lnBad();
    }
    persist();
    lnLater(() => (++rv.i < rv.queue.length ? rvRound() : rvEnd()), btn === okBtn ? 700 : 1700);
  }));
}

function rvEnd() {
  lnBody.innerHTML = `
    <div class="card-title">مرور امروز تموم شد 🎉</div>
    <div class="ln-big">${faDigits(rv.right)} از ${faDigits(rv.queue.length)}</div>
    <div class="card-text">کلمه‌هایی که درست جواب دادی چند روز دیگه دوباره میان تا کاملاً یادت بمونن.</div>
    ${lnFoot()}`;
}

// ---------------------------------------------------------------------------
// ۳. حالت کودک
// ---------------------------------------------------------------------------

const KIDS_WORDS = [
  ["سیب", "🍎"], ["ماه", "🌙"], ["گل", "🌸"], ["موز", "🍌"], ["ماهی", "🐟"], ["گربه", "🐈"], ["سگ", "🐕"],
  ["اسب", "🐎"], ["شیر", "🦁"], ["خرس", "🐻"], ["موش", "🐭"], ["مرغ", "🐔"], ["جوجه", "🐥"], ["اردک", "🦆"],
  ["فیل", "🐘"], ["زنبور", "🐝"], ["کفش", "👟"], ["کلاه", "🧢"], ["توپ", "⚽"], ["کتاب", "📖"], ["مداد", "✏️"],
  ["ساعت", "⌚"], ["خانه", "🏠"], ["درخت", "🌳"], ["برگ", "🍃"], ["آب", "💧"], ["نان", "🍞"], ["کیک", "🍰"],
  ["هویج", "🥕"], ["گوجه", "🍅"], ["پیاز", "🧅"], ["ابر", "☁️"], ["باران", "🌧️"], ["برف", "❄️"], ["ستاره", "⭐"],
  ["قلب", "❤️"], ["ماشین", "🚗"], ["قطار", "🚆"], ["کشتی", "🚢"], ["قایق", "⛵"], ["هدیه", "🎁"], ["کلید", "🔑"],
  ["قاشق", "🥄"], ["چتر", "☂️"], ["عینک", "👓"], ["دست", "✋"], ["چشم", "👁️"], ["گوش", "👂"], ["موشک", "🚀"],
  ["میمون", "🐒"], ["خرگوش", "🐇"], ["مار", "🐍"], ["جغد", "🦉"], ["شتر", "🐫"], ["گاو", "🐄"], ["انگور", "🍇"],
  ["لیمو", "🍋"], ["گیلاس", "🍒"], ["پرتقال", "🍊"], ["هندوانه", "🍉"], ["زرافه", "🦒"], ["پروانه", "🦋"], ["بستنی", "🍦"],
  ["خورشید", "☀️"], ["بادکنک", "🎈"], ["دوچرخه", "🚲"], ["پنیر", "🧀"], ["تخم", "🥚"], 
];
const KIDS_ROUND = 8;
const KIDS_PAID = 10; // کلمه‌های سکه‌دار در هر روز
let kids = null;

function openKids() {
  lnShow(`<div class="card-title">حالت کودک 🧸</div>
    <div class="card-text">برای بچه‌ها: یه نقاشی می‌بینی و با حرف‌ها اسمش رو می‌سازی. وقت نداره و چیزی هم از دست نمی‌ره.</div>
    ${lnFoot(`<button class="card-btn" type="button" id="kidsGo">بزن بریم!</button>`)}`);
  $("kidsGo").onclick = () => {
    // کلمه‌های کوتاه اول، بلندها آخر
    const set = lnMix(KIDS_WORDS).slice(0, KIDS_ROUND).sort((a, b) => [...a[0]].length - [...b[0]].length);
    kids = { set, i: 0 };
    kidsRound();
  };
}

function kidsRound() {
  const [word, pic] = kids.set[kids.i];
  const letters = [...word];
  let order = lnMix(letters.map((ch, i) => ({ ch, i })));
  if (letters.length > 1 && order.every((o, k) => o.i === k)) order = order.reverse();
  lnBody.innerHTML = `
    <div class="ln-top"><span>${faDigits(kids.i + 1)} از ${faDigits(kids.set.length)}</span><b>حالت کودک</b><span>🧸</span></div>
    <div class="kids-pic">${pic}</div>
    <div class="kids-slots">${letters.map(() => `<button class="kids-slot" type="button"></button>`).join("")}</div>
    <div class="kids-letters">${order.map((o) => `<button class="kids-letter" type="button">${o.ch}</button>`).join("")}</div>
    ${lnFoot()}`;
  const slots = [...lnBody.querySelectorAll(".kids-slot")];
  const keys = [...lnBody.querySelectorAll(".kids-letter")];
  const placed = slots.map(() => null);
  const check = () => {
    if (placed.some((p) => !p)) return;
    const made = placed.map((k) => k.textContent).join("");
    if (made === word) {
      slots.forEach((s) => s.classList.add("right"));
      // هر روز فقط ۱۰ کلمه‌ی اول سکه دارد؛ بعدش بازی ادامه دارد، بدون سکه
      let st = X().kids;
      if (!st || st.day !== todayKey()) st = X().kids = { day: todayKey(), n: 0 };
      if (st.n < KIDS_PAID) {
        st.n++;
        persist();
        lnGood(slots[0]);
      } else {
        if (typeof sound === "function") sound("found");
        if (typeof haptic === "function") haptic("light");
      }
      if (typeof sparkle === "function") {
        const r = lnBody.querySelector(".kids-pic").getBoundingClientRect();
        sparkle(r.left + r.width / 2, r.top + r.height / 2, 20);
      }
      lnLater(() => (++kids.i < kids.set.length ? kidsRound() : kidsEnd()), 1100);
    } else {
      lnBad();
      lnBody.querySelector(".kids-slots").classList.add("shake");
      lnLater(() => {
        slots.forEach((s, i) => { s.textContent = ""; placed[i] = null; });
        keys.forEach((k) => (k.disabled = false));
        lnBody.querySelector(".kids-slots").classList.remove("shake");
      }, 600);
    }
  };
  keys.forEach((k) => (k.onclick = () => {
    const i = placed.indexOf(null);
    if (i < 0) return;
    placed[i] = k;
    slots[i].textContent = k.textContent;
    k.disabled = true;
    check();
  }));
  slots.forEach((s, i) => (s.onclick = () => {
    if (!placed[i] || s.classList.contains("right")) return;
    placed[i].disabled = false;
    placed[i] = null;
    s.textContent = "";
  }));
}

function kidsEnd() {
  lnBody.innerHTML = `
    <div class="card-title">آفرین! 🌟</div>
    <div class="kids-pic">${kids.set.map((k) => k[1]).join("")}</div>
    <div class="card-text">همه‌ی ${faDigits(kids.set.length)} تا رو درست ساختی.</div>
    ${lnFoot(`<button class="card-btn" type="button" id="kidsAgain">باز هم!</button>`)}`;
  $("kidsAgain").onclick = () => {
    kids = { set: lnMix(KIDS_WORDS).slice(0, KIDS_ROUND).sort((a, b) => [...a[0]].length - [...b[0]].length), i: 0 };
    kidsRound();
  };
}

// ---------------------------------------------------------------------------
// ۴. جدول متقاطع هفتگی
// ---------------------------------------------------------------------------
// هر شنبه جدول تازه؛ برای همه‌ی بازیکن‌ها یکسان. سرنخ‌ها معنی کلمه‌ها در words.txt است.

const CW_REWARD = 50;
const CW_HINT = 10;
const cwWeek = () => Math.floor((rvToday() - 2) / 7); // روز ۲ (۱۹۷۰/۰۱/۰۳) شنبه است
const cwCache = {};

function cwBuild(week) {
  if (cwCache[week]) return cwCache[week];
  const rnd = seededRandom(hashText("crossword" + week));
  const pool = [...dict].filter(([w, m]) => w.length >= 3 && w.length <= 6 && (wordLevels.get(w) || 1) === 1 &&
    m && m.length <= 90 && !m.includes(w));
  let best = null;
  for (let t = 0; t < 60 && !best; t++) {
    const mixed = shuffled(pool, rnd);
    // از یک کلمه‌ی بلند شروع می‌کنیم و کلمه‌هایی را برمی‌داریم که با جمع حرف مشترک دارند
    const words = [mixed.find(([w]) => w.length >= 5)[0]];
    for (const [w] of mixed) {
      if (words.length >= 7) break;
      if (words.includes(w)) continue;
      const have = new Set(words.join(""));
      if ([...w].some((c) => have.has(c))) words.push(w);
    }
    const L = buildLayout(words, 3000);
    if (L.connected && L.rows <= 9 && L.cols <= 9 && Object.keys(L.placements).length >= 6) best = { words, L };
  }
  if (!best) return null;
  // شماره‌گذاری: از بالا به پایین، و در هر ردیف از راست به چپ
  const { L } = best;
  const starts = Object.entries(L.placements).map(([w, cells]) => ({
    word: w, cells, dir: cells.length > 1 && cells[1].r === cells[0].r ? "h" : "v", r: cells[0].r, c: cells[0].c,
  }));
  starts.sort((a, b) => a.r - b.r || a.c - b.c);
  const nums = new Map();
  for (const s of starts) {
    const k = s.r + "," + s.c;
    if (!nums.has(k)) nums.set(k, nums.size + 1);
    s.num = nums.get(k);
  }
  cwCache[week] = { rows: L.rows, cols: L.cols, items: starts, nums };
  return cwCache[week];
}

function cwState(week) {
  let st = X().cw;
  if (!st || st.week !== week) st = X().cw = { week, solved: [], shown: [], done: false };
  return st;
}

let cwSel = null;

function openCrossword() {
  const week = cwWeek();
  const cw = cwBuild(week);
  if (!cw) {
    lnShow(`<div class="card-title">جدول هفتگی ✏️</div><div class="card-text">جدول این هفته ساخته نشد. کمی بعد دوباره امتحان کن.</div>${lnFoot()}`);
    return;
  }
  cwSel = cw.items.find((s) => !cwState(week).solved.includes(s.word)) || null;
  lnShow(`<div class="ln-body-cw"></div>`);
  cwRender();
}

function cwRender() {
  const week = cwWeek();
  const cw = cwBuild(week);
  const st = cwState(week);
  const letter = new Map();
  const shown = new Set(st.shown);
  for (const s of cw.items) {
    s.cells.forEach((cell) => {
      const k = cell.r + "," + cell.c;
      const open = st.solved.includes(s.word) || shown.has(k);
      if (!letter.has(k) || open) letter.set(k, open ? cell.ch : letter.get(k) || "");
    });
  }
  const selKeys = new Set(cwSel ? cwSel.cells.map((c) => c.r + "," + c.c) : []);
  let grid = "";
  for (let r = 0; r < cw.rows; r++) {
    for (let c = 0; c < cw.cols; c++) {
      const k = r + "," + c;
      if (!letter.has(k)) { grid += `<i class="cw-cell void"></i>`; continue; }
      const n = cw.nums.get(k);
      grid += `<button class="cw-cell${selKeys.has(k) ? " sel" : ""}${letter.get(k) ? " full" : ""}" type="button" data-k="${k}">` +
        (n ? `<small>${faDigits(n)}</small>` : "") + (letter.get(k) || "") + `</button>`;
    }
  }
  const clue = (s) => `<button class="cw-clue${s === cwSel ? " sel" : ""}${st.solved.includes(s.word) ? " done" : ""}" type="button" data-w="${s.word}">` +
    `<b>${faDigits(s.num)}</b> ${lnEsc(dict.get(s.word))} <em>(${faDigits(s.word.length)} حرف)</em></button>`;
  const across = cw.items.filter((s) => s.dir === "h").sort((a, b) => a.num - b.num);
  const down = cw.items.filter((s) => s.dir === "v").sort((a, b) => a.num - b.num);
  const box = lnBody.querySelector(".ln-body-cw") || lnBody;
  box.innerHTML = `
    <div class="card-title">جدول هفتگی ✏️</div>
    <div class="card-text">${st.done ? "جدول این هفته رو حل کردی! شنبه جدول تازه میاد." : `سرنخ رو بزن و جوابش رو بنویس. حل کامل جدول ${faDigits(CW_REWARD)} سکه داره.`}</div>
    <div class="cw-grid" style="grid-template-columns:repeat(${cw.cols},1fr)">${grid}</div>
    ${cwSel && !st.solved.includes(cwSel.word) ? `
      <div class="cw-answer">
        <div class="cw-now"><b>${faDigits(cwSel.num)} ${cwSel.dir === "h" ? "افقی" : "عمودی"}:</b> ${lnEsc(dict.get(cwSel.word))}</div>
        <div class="cw-row">
          <input class="cw-input" id="cwInput" type="text" autocomplete="off" maxlength="${cwSel.word.length + 2}" placeholder="${faDigits(cwSel.word.length)} حرف">
          <button class="card-btn cw-send" type="button" id="cwSend">ثبت</button>
        </div>
        <button class="card-link" type="button" id="cwHint">یه حرف نشونم بده (${faDigits(CW_HINT)} سکه)</button>
      </div>` : ""}
    <div class="cw-clues"><div class="cw-head">افقی</div>${across.map(clue).join("")}<div class="cw-head">عمودی</div>${down.map(clue).join("")}</div>
    ${lnFoot()}`;
  box.querySelectorAll(".cw-clue").forEach((b) => (b.onclick = () => {
    cwSel = cw.items.find((s) => s.word === b.dataset.w);
    cwRender();
    const inp = $("cwInput");
    if (inp) inp.focus();
  }));
  box.querySelectorAll(".cw-cell[data-k]").forEach((b) => (b.onclick = () => {
    const hits = cw.items.filter((s) => s.cells.some((c) => c.r + "," + c.c === b.dataset.k));
    const open = hits.filter((s) => !st.solved.includes(s.word));
    const list = open.length ? open : hits;
    cwSel = list[(list.indexOf(cwSel) + 1) % list.length];
    cwRender();
  }));
  const input = $("cwInput");
  if (!input) return;
  const send = () => {
    if (!lnSame(input.value, cwSel.word)) {
      lnBad();
      input.classList.remove("shake");
      void input.offsetWidth;
      input.classList.add("shake");
      return;
    }
    st.solved.push(cwSel.word);
    if (typeof sound === "function") sound("found");
    if (typeof haptic === "function") haptic("medium");
    const next = cw.items.find((s) => !st.solved.includes(s.word));
    if (!next && !st.done) {
      st.done = true;
      persist();
      cwSel = null;
      cwRender();
      if (typeof sound === "function") sound("complete");
      giveCoins(CW_REWARD, lnBody.querySelector(".cw-grid"));
      updateCoins();
      toast(`جدول هفته حل شد! ${faDigits(CW_REWARD)} سکه گرفتی 🎉`);
      return;
    }
    persist();
    cwSel = next || null;
    cwRender();
  };
  $("cwSend").onclick = send;
  input.onkeydown = (e) => { if (e.key === "Enter") send(); };
  $("cwHint").onclick = () => {
    const hidden = cwSel.cells.filter((c) => !st.shown.includes(c.r + "," + c.c));
    if (!hidden.length) return;
    if (save.coins < CW_HINT) return toast("سکه‌ات کافی نیست");
    save.coins -= CW_HINT;
    updateCoins();
    st.shown.push(hidden[0].r + "," + hidden[0].c);
    if (typeof sound === "function") sound("hint");
    persist();
    cwRender();
  };
}

// ---------------------------------------------------------------------------
// ۵. غلط املایی رو پیدا کن
// ---------------------------------------------------------------------------
// [درست، غلط]؛ شکل غلط نباید خودش کلمه‌ی درستی با معنی دیگر باشد.

const SPELL_PAIRS = [
  ["خواهر", "خاهر"], ["خواب", "خاب"], ["استخوان", "استخان"], ["خواندن", "خاندن"], ["خوشحال", "خشحال"],
  ["اتفاق", "اتفاغ"], ["اطلاعات", "اتلاعات"], ["امتحان", "امطحان"], ["مسئله", "مسعله"], ["مسئول", "مسعول"],
  ["تلفن", "طلفن"], ["ظرف", "زرف"], ["ظهر", "ضهر"], ["حوصله", "هوصله"], ["غذا", "قذا"], ["ذهن", "زهن"],
  ["ذوق", "زوق"], ["تشخیص", "تشخیس"], ["تصمیم", "تسمیم"], ["صبحانه", "سبحانه"], ["صندلی", "سندلی"], ["صابون", "سابون"],
  ["طلا", "تلا"], ["طوطی", "توتی"], ["طناب", "تناب"], ["طبیعت", "تبیعت"], ["ثانیه", "سانیه"], ["ثابت", "سابت"],
  ["حلزون", "هلزون"], ["حیوان", "هیوان"], ["حادثه", "حادسه"], ["ضعیف", "زعیف"], ["ضرر", "زرر"], ["مریض", "مریذ"],
  ["اصفهان", "اسفهان"], ["قاشق", "غاشق"], ["قورباغه", "غورباغه"], ["اقیانوس", "اغیانوس"], ["آغوش", "آقوش"], ["باغچه", "باقچه"],
  ["چراغ", "چراق"], ["دماغ", "دماق"], ["عینک", "عینگ"], ["عسل", "اسل"], ["عروسک", "اروسک"], ["علاقه", "الاقه"],
  ["پذیرفتن", "پزیرفتن"], ["گذشته", "گزشته"], ["گذاشتن", "گزاشتن"], ["تبریز", "طبریز"], ["احساس", "احصاص"], ["استراحت", "استراهت"],
  ["امضا", "امزا"], ["هیجان", "حیجان"], ["هدیه", "حدیه"], ["هزار", "حزار"], ["فوتبال", "فطبال"], ["اتوبوس", "اطوبوس"],
  ["زعفران", "ذعفران"], ["زمین", "ذمین"], ["زیبا", "ذیبا"], ["زندگی", "ذندگی"], ["سلام", "صلام"], ["شطرنج", "شترنج"],
  ["موفق", "موفغ"], ["ناراحت", "ناراهت"], ["توضیح", "توزیح"], ["ریاضی", "ریازی"], ["راضی", "راذی"], ["فرصت", "فرست"],
  ["خوراک", "خراک"], ["تخت‌خواب", "تخت‌خاب"], ["قضاوت", "غضاوت"], ["ذرت", "زرت"], ["اطراف", "اتراف"],
  ["حتما", "هتما"], ["صدا", "سدا"], ["صحرا", "سحرا"], 
];
const SPELL_ROUND = 10;
let sp = null;

// روزی یک بار؛ ده سؤال هر روز برای همه یکسان است. نتیجه از همان شروع ذخیره می‌شود
// تا با بستن و دوباره باز کردن، دست تازه‌ای شروع نشود.
function spToday() {
  const st = X().sp;
  return st && st.day === todayKey() ? st : null;
}

function openSpell() {
  const best = X().spBest || 0;
  const done = spToday();
  if (done && done.n >= SPELL_ROUND) {
    lnShow(`<div class="card-title">غلط املایی ✍️</div>
      <div class="ln-big">${faDigits(done.right)} از ${faDigits(SPELL_ROUND)}</div>
      <div class="card-text">غلط املایی امروز رو انجام دادی. فردا ده تا سؤال تازه میاد!
      ${best ? `<br>بهترین نتیجه‌ت: ${faDigits(best)} از ${faDigits(SPELL_ROUND)}` : ""}</div>${lnFoot()}`);
    return;
  }
  lnShow(`<div class="card-title">غلط املایی ✍️</div>
    <div class="card-text">از چهار کلمه، یکی غلط نوشته شده. پیداش کن! روزی یه بار، ${faDigits(SPELL_ROUND)} سؤال، هر جواب درست یه سکه.
    ${best ? `<br>بهترین نتیجه‌ت: ${faDigits(best)} از ${faDigits(SPELL_ROUND)}` : ""}</div>
    ${lnFoot(`<button class="card-btn" type="button" id="spGo">${done ? "ادامه" : "شروع"}</button>`)}`);
  $("spGo").onclick = spStart;
}

function spStart() {
  const rnd = seededRandom(hashText("spell" + todayKey()));
  const order = shuffled(SPELL_PAIRS, rnd).slice(0, SPELL_ROUND);
  const others = order.map((pair) => {
    const list = [];
    while (list.length < 3) {
      const p = SPELL_PAIRS[Math.floor(rnd() * SPELL_PAIRS.length)];
      if (p !== pair && !list.includes(p[0])) list.push(p[0]);
    }
    return shuffled([pair[1], ...list], rnd);
  });
  const st = spToday() || (X().sp = { day: todayKey(), n: 0, right: 0 });
  persist();
  sp = { order, others, i: st.n, right: st.right };
  spRound();
}

function spRound() {
  const pair = sp.order[sp.i];
  const options = sp.others[sp.i];
  lnBody.innerHTML = `
    <div class="ln-top"><span>${faDigits(sp.i + 1)} از ${faDigits(sp.order.length)}</span><b>غلط املایی</b><span>✓ ${faDigits(sp.right)}</span></div>
    <div class="ln-ask">کدوم غلط نوشته شده؟</div>
    <div class="sp-grid">${options.map((w) => `<button class="ln-opt sp-opt" type="button">${lnEsc(w)}</button>`).join("")}</div>
    <div class="sp-note" id="spNote"></div>
    ${lnFoot()}`;
  const buttons = [...lnBody.querySelectorAll(".sp-opt")];
  const badBtn = buttons[options.indexOf(pair[1])];
  buttons.forEach((btn) => (btn.onclick = () => {
    buttons.forEach((b) => (b.disabled = true));
    badBtn.classList.add("right");
    $("spNote").innerHTML = `درستش: <b>${lnEsc(pair[0])}</b>`;
    if (btn === badBtn) {
      sp.right++;
      lnGood(btn);
    } else {
      btn.classList.add("wrong");
      lnBad();
    }
    sp.i++;
    Object.assign(X().sp, { n: sp.i, right: sp.right });
    persist();
    lnLater(() => (sp.i < sp.order.length ? spRound() : spEnd()), btn === badBtn ? 1100 : 1800);
  }));
}

function spEnd() {
  const best = X().spBest || 0;
  if (sp.right > best) X().spBest = sp.right;
  persist();
  lnBody.innerHTML = `
    <div class="card-title">${sp.right === sp.order.length ? "املات عالیه! 🏆" : "تموم شد!"}</div>
    <div class="ln-big">${faDigits(sp.right)} از ${faDigits(sp.order.length)}</div>
    <div class="card-text">فردا ده تا سؤال تازه میاد.</div>
    ${lnFoot()}`;
}

// ---------------------------------------------------------------------------
// گزینه‌ها در کارت «سرگرمی‌ها»
// ---------------------------------------------------------------------------

(() => {
  const list = document.querySelector("#modesSheet .modes-list");
  const head = document.createElement("div");
  head.className = "modes-head";
  head.textContent = "یاد بگیر و بازی کن";
  const picks = [
    ["modeMs", "📜", "مشاعره", "بیت‌های حافظ رو کامل کن، زنجیره‌وار", openMoshaere],
    ["modeRv", "🧠", "مرور واژه‌ها", "معنی کلمه‌هایی که پیدا کردی یادت بمونه", openReview],
    ["modeCw", "✏️", "جدول هفتگی", "جدول متقاطع با سرنخ، هر شنبه یکی تازه", openCrossword],
    ["modeSp", "✍️", "غلط املایی", "روزی یه بار؛ از چهار کلمه، غلطش رو پیدا کن", openSpell],
    ["modeKids", "🧸", "حالت کودک", "نقاشی ببین، اسمش رو بساز", openKids],
  ];
  list.append(head);
  for (const [id, icon, name, sub, fn] of picks) {
    const b = document.createElement("button");
    b.className = "mode-pick";
    b.type = "button";
    b.id = id;
    b.innerHTML = `<span class="mode-icon">${icon}</span><span><b>${name}</b><small>${sub}</small></span>`;
    b.onclick = fn;
    list.append(b);
  }
  // زیرنویس‌های زنده: تعداد مرور امروز و وضعیت جدول هفته
  const baseOpen = openModes;
  openModes = function () {
    baseOpen();
    const n = rvQueue().length;
    $("modeRv").querySelector("small").textContent = n ? `امروز ${faDigits(n)} کلمه برای مرور` : "معنی کلمه‌هایی که پیدا کردی یادت بمونه";
    const spd = spToday();
    $("modeSp").querySelector("small").textContent = spd && spd.n >= SPELL_ROUND
      ? `امروز: ${faDigits(spd.right)} از ${faDigits(SPELL_ROUND)} ✓ · فردا دوباره`
      : "روزی یه بار؛ از چهار کلمه، غلطش رو پیدا کن";
    const st = X().cw;
    $("modeCw").querySelector("small").textContent = st && st.week === cwWeek() && st.done
      ? "جدول این هفته حل شد ✓ · شنبه جدول تازه"
      : "جدول متقاطع با سرنخ، هر شنبه یکی تازه";
  };
  if (typeof speedBtn !== "undefined") speedBtn.onclick = openModes;
  const sub = $("speedSub");
  if (sub) sub.textContent = "سرعتی، مشاعره، جدول و …";
})();
