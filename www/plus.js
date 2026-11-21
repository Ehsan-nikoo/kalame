"use strict";

// بخش‌های تازه، بعد از more.js بارگذاری می‌شود:
// ۱. کمک‌های «نشونه» (یک خانه‌ی دلخواه) و «موشک» (چند خانه‌ی تصادفی)
// ۲. ضرب‌المثل فصل: هر مرحله یک تکه‌اش را باز می‌کند
// ۳. حالت «اسم فامیل» (فهرست کلمه‌ها در esmfamil.js) و کارت انتخاب سرگرمی‌ها
// ۴. فرستادن کلمه‌ی روز و رکورد روزانه به ویجت صفحه‌ی اصلی گوشی
// ۵. چالش تاج: مرحله‌های تمام‌شده با کلمه‌های تازه
// داده‌ها در save.x ذخیره می‌شوند (مثل extras.js).

// ---------------------------------------------------------------------------
// ۱. کمک‌های تازه
// ---------------------------------------------------------------------------

const COST_HINT_TARGET = 30; // یک خانه، هر جا که بازیکن بخواهد
const COST_HINT_ROCKET = 55; // چند خانه‌ی تصادفی با هم
const ROCKET_CELLS = 5;

const TARGET_ICON = `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="3.2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 1.5v4M12 18.5v4M1.5 12h4M18.5 12h4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
const ROCKET_ICON = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.5 3.5c3-1 5.5-1 6-.5s.5 3-.5 6l-6.5 6.5-5-5Z M8.5 10.5 5 10l-2.5 2.5 4 1M13.5 15.5l.5 3.5-2.5 2.5-1-4M8 16l-3.5 3.5" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round" stroke-linecap="round"/><circle cx="15.5" cy="8.5" r="1.6" fill="currentColor"/></svg>`;

function makeTool(id, label, icon, cost) {
  const btn = document.createElement("button");
  btn.className = "tool";
  btn.id = id;
  btn.type = "button";
  btn.setAttribute("aria-label", label);
  btn.innerHTML = `${icon}<span class="cost"><span class="coin-icon"></span><span class="cost-count">${faDigits(cost)}</span></span>`;
  return btn;
}

const targetBtn = makeTool("hintTargetBtn", "نشونه: یه خونه‌ی دلخواه", TARGET_ICON, COST_HINT_TARGET);
const rocketBtn = makeTool("hintRocketBtn", `موشک: ${ROCKET_CELLS} خونه`, ROCKET_ICON, COST_HINT_ROCKET);
// ترتیب از راست: موشک، کلمه، بُر زدن، حرف، نشونه
$("hintWordBtn").before(rocketBtn);
$("hintLetterBtn").after(targetBtn);
document.querySelector(".tools").classList.add("five");

let aiming = false;

function emptyCells() {
  return Object.values(cellEls).filter((el) => !isFilled(el));
}

function stopAiming() {
  if (!aiming) return;
  aiming = false;
  targetBtn.classList.remove("on");
  boardEl.classList.remove("aiming");
}

function hintTarget() {
  if (locked || dragging) return;
  if (aiming) return stopAiming();
  if (!emptyCells().length) return;
  // پول بعد از انتخاب خانه کم می‌شود؛ اینجا فقط نبودنش را زود می‌گوییم
  if (!(save.x.freeHints > 0) && save.coins < COST_HINT_TARGET) return spend(COST_HINT_TARGET);
  aiming = true;
  targetBtn.classList.add("on");
  boardEl.classList.add("aiming");
  showPreview("روی یه خونه‌ی خالی بزن 🎯", "note", 2200);
}

// زدن روی جدول وقتی «نشونه» روشن است (پیش از کارت معنی کلمه)
boardEl.addEventListener("click", (e) => {
  if (!aiming) return;
  e.stopPropagation();
  const cell = e.target.closest(".cell");
  if (!cell || isFilled(cell) || !Object.values(cellEls).includes(cell)) {
    stopAiming();
    return;
  }
  stopAiming();
  if (locked || !spend(COST_HINT_TARGET)) return;
  revealCell(cell, true);
  const c = centerOfEl(cell);
  sparkle(c.x, c.y, 10);
  emit("hint", { cells: [cell] });
  checkDone();
}, true);

function hintRocket() {
  if (locked || dragging) return;
  stopAiming();
  const empty = emptyCells();
  if (!empty.length || !spend(COST_HINT_ROCKET)) return;
  // چند خانه‌ی تصادفی؛ اگر کمتر مانده بود، همه‌شان
  for (let i = empty.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [empty[i], empty[j]] = [empty[j], empty[i]];
  }
  const cells = empty.slice(0, ROCKET_CELLS);
  cells.forEach((el, i) => {
    revealCell(el, true, i);
    setTimeout(() => {
      const c = centerOfEl(el);
      sparkle(c.x, c.y, 8);
    }, i * 90);
  });
  emit("hint", { cells });
  checkDone();
}

function refreshNewTools() {
  const free = save.x && save.x.freeHints > 0;
  targetBtn.classList.toggle("poor", !free && save.coins < COST_HINT_TARGET);
  rocketBtn.classList.toggle("poor", !free && save.coins < COST_HINT_ROCKET);
}

targetBtn.addEventListener("click", hintTarget);
rocketBtn.addEventListener("click", hintRocket);

// ---------------------------------------------------------------------------
// ۲. ضرب‌المثل فصل
// ---------------------------------------------------------------------------
// هر فصل یک ضرب‌المثل دارد. هر مرحله‌ای که بار اول تمام شود یک تکه‌ی دیگرش را نشان می‌دهد
// و آخر فصل کامل می‌شود، با معنی‌اش و چند سکه.

const PROVERB_REWARD = 10;

// فهرست ضرب‌المثل‌ها در proverbs.js

const proverbOf = (c) => PROVERBS[c % PROVERBS.length];

function proverbStrip(level) {
  const c = chapterOf(level);
  const [text, meaning] = proverbOf(c);
  const words = text.split(" ");
  const done = (level % CHAPTER_SIZE) + 1; // چند مرحله از این فصل تمام شده
  const shown = done >= CHAPTER_SIZE ? words.length : Math.min(words.length - 1, Math.floor((done / CHAPTER_SIZE) * words.length));
  // تکه‌ها به ترتیبی ثابت ولی درهم باز می‌شوند (نه همیشه از اول جمله)
  const rnd = seededRandom(c * 97 + 13);
  const order = words.map((_, i) => i).sort(() => rnd() - 0.5);
  const open = new Set(order.slice(0, shown));

  const el = document.createElement("div");
  el.className = "extra proverb" + (shown === words.length ? " whole" : "");
  const head = document.createElement("div");
  head.className = "proverb-head";
  head.textContent = shown === words.length ? "ضرب‌المثل فصل کامل شد! 🧩" : "ضرب‌المثل فصل · هر مرحله یه تیکه‌ش باز میشه";
  const line = document.createElement("div");
  line.className = "proverb-line";
  words.forEach((w, i) => {
    const s = document.createElement("span");
    if (open.has(i)) {
      s.textContent = w;
      if (i === order[shown - 1] && shown < words.length) s.className = "fresh";
    } else {
      s.className = "hole";
      s.textContent = " ".repeat(Math.max(3, w.length));
    }
    line.appendChild(s);
  });
  el.append(head, line);
  if (shown === words.length) {
    const m = document.createElement("div");
    m.className = "proverb-meaning";
    m.textContent = meaning;
    el.appendChild(m);
  }
  return el;
}

function showProverb(level) {
  const reward = $("overlayReward");
  const strip = proverbStrip(level);
  reward.after(strip);
  if (endsChapter(level)) {
    const list = X().proverbs || (X().proverbs = []);
    if (!list.includes(chapterOf(level))) {
      list.push(chapterOf(level));
      persist();
      setTimeout(() => giveCoins(PROVERB_REWARD, strip), 900);
      setTimeout(() => toast("ضرب‌المثل به کلکسیونت اضافه شد 🧩", "gold"), 1800);
    }
  }
}

// ---------- کلکسیون ضرب‌المثل‌ها (از دفتر واژه‌ها) ----------

// شماره‌ی ضرب‌المثل‌هایی که بازیکن کامل کرده (فصل‌های تمام‌شده)، به ترتیب
function collectedProverbs() {
  const out = [];
  const chapters = Math.floor(save.unlocked / CHAPTER_SIZE);
  for (let c = 0; c < chapters; c++) {
    const i = c % PROVERBS.length;
    if (!out.includes(i)) out.push(i);
  }
  return out;
}

const proverbSheet = makeSheet("proverbSheet", `
  <div class="card-title">کلکسیون ضرب‌المثل‌ها 🧩</div>
  <div class="card-text" id="proverbCount"></div>
  <div class="proverb-book" id="proverbBook"></div>
  <button class="card-link" type="button" data-close>بستن</button>`);
proverbSheet.querySelector("[data-close]").onclick = () => proverbSheet.classList.add("hidden");

function openProverbs() {
  const have = collectedProverbs();
  $("proverbCount").textContent = `${faDigits(have.length)} از ${faDigits(PROVERBS.length)} · هر فصل که تموم کنی، یکی‌ش مال تو میشه`;
  const list = $("proverbBook");
  list.replaceChildren();
  // ضرب‌المثلی که الان در حال جمع شدن است
  if (save.unlocked % CHAPTER_SIZE > 0 && have.length < PROVERBS.length) {
    const now = proverbStrip(save.unlocked - 1);
    now.classList.remove("extra");
    now.classList.add("now");
    for (const f of now.querySelectorAll(".fresh")) f.classList.remove("fresh");
    now.querySelector(".proverb-head").textContent = `فصل «${chapterInfo(chapterOf(save.unlocked)).name}» · در حال جمع شدن`;
    list.appendChild(now);
  }
  for (const i of [...have].reverse()) {
    const [text, meaning] = PROVERBS[i];
    const item = document.createElement("div");
    item.className = "proverb-item";
    item.innerHTML = `<b></b><span></span>`;
    item.querySelector("b").textContent = text;
    item.querySelector("span").textContent = meaning;
    list.appendChild(item);
  }
  const locked = PROVERBS.length - have.length - (list.querySelector(".now") ? 1 : 0);
  if (locked > 0) {
    const more = document.createElement("div");
    more.className = "proverb-locked";
    more.textContent = `🔒 ${faDigits(locked)} ضرب‌المثل دیگه منتظرته`;
    list.appendChild(more);
  }
  if (!have.length && !list.querySelector(".now")) {
    list.insertAdjacentHTML("afterbegin", `<div class="book-empty">هنوز ضرب‌المثلی جمع نکردی. هر مرحله یه تیکه‌ش رو باز می‌کنه.</div>`);
  }
  proverbSheet.classList.remove("hidden");
}

const proverbBtn = document.createElement("button");
proverbBtn.className = "proverb-open";
proverbBtn.type = "button";
proverbBtn.id = "proverbBtn";
document.querySelector(".book-head").appendChild(proverbBtn);
proverbBtn.onclick = openProverbs;
$("bookBtn").addEventListener("click", () => renderProverbBtn());
$("rankChip").addEventListener("click", () => renderProverbBtn());

function renderProverbBtn() {
  proverbBtn.textContent = `🧩 ضرب‌المثل‌ها · ${faDigits(collectedProverbs().length)} از ${faDigits(PROVERBS.length)}`;
}

// ---------------------------------------------------------------------------
// ۳. اسم فامیل
// ---------------------------------------------------------------------------

const EF_TIME = 90;         // ثانیه
const EF_POINTS = 10;       // هر جواب درست
const EF_ALL_BONUS = 20;    // همه‌ی دسته‌ها درست
const EF_MAX_COINS = 25;    // جایزه‌ی بار اول هر روز

// «سیب زمینی»، «سیب‌زمینی» و «آلو / الو» یکی حساب می‌شوند
const efNorm = (w) =>
  (w || "")
    .trim()
    .replace(/[ً-ْٰ]/g, "")
    .replace(/[\s_‌‍\-ـ]/g, "")
    .replace(/[آأإ]/g, "ا")
    .replace(/ي/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/ؤ/g, "و")
    .replace(/ة/g, "ه");

let efSets = null; // [{ id, label, set, list }]
let efLetters = [];

function efPrepare() {
  if (efSets) return;
  efSets = ESM_FAMIL.map((cat) => {
    const list = [...new Set(cat.words.trim().split(/\s+/).map((w) => w.replace(/_/g, " ")))];
    return { id: cat.id, label: cat.label, list, set: new Set(list.map(efNorm)) };
  });
  // فقط حرف‌هایی که همه‌ی دسته‌ها دست‌کم یک جواب برایشان دارند
  const letters = "ابپتثجچحخدذرزژسشصضطظعغفقکگلمنوهی";
  efLetters = [...letters].filter((ch) => efSets.every((cat) => [...cat.set].some((w) => w[0] === ch)));
}

const efSheet = document.createElement("div");
efSheet.className = "sheet center hidden ef-sheet";
efSheet.id = "efSheet";
efSheet.setAttribute("role", "dialog");
efSheet.setAttribute("aria-modal", "true");
efSheet.innerHTML = `<div class="card sheet-card level-card ef-card">
  <div class="card-title">اسم فامیل ✍️</div>
  <div class="ef-top">
    <div class="ef-letter" id="efLetter">؟</div>
    <div class="ef-time" id="efTime"></div>
  </div>
  <div class="card-text" id="efText"></div>
  <div class="ef-list" id="efList"></div>
  <div class="ef-score hidden" id="efScore"></div>
  <div class="card-text ef-reward" id="efReward"></div>
  <button class="card-btn" type="button" id="efGo">شروع</button>
  <button class="card-link hidden" type="button" id="efShare">فرستادن رکورد</button>
  <button class="card-link" type="button" id="efClose">منو</button>
</div>`;
document.body.appendChild(efSheet);

let ef = null; // { letter, end, timer, done }

function efReset() {
  efPrepare();
  if (ef) clearInterval(ef.timer);
  ef = null;
  $("efLetter").textContent = "؟";
  $("efLetter").classList.remove("spin");
  $("efTime").textContent = `⏱ ${clock(EF_TIME)}`;
  $("efTime").classList.remove("hurry");
  const best = X().efBest || 0;
  $("efText").textContent =
    `یه حرف میاد؛ تو ${faDigits(EF_TIME)} ثانیه برای هر دسته یه کلمه بنویس که با همون حرف شروع بشه.` +
    (best ? ` رکوردت: ${faDigits(best)}` : "");
  $("efText").classList.remove("hidden");
  $("efList").replaceChildren(
    ...efSets.map((cat) => {
      const row = document.createElement("label");
      row.className = "ef-row";
      row.innerHTML = `<span class="ef-label"></span><input type="text" autocomplete="off" autocapitalize="off" spellcheck="false" lang="fa" dir="rtl" enterkeyhint="next" disabled><i class="ef-mark"></i>`;
      row.querySelector(".ef-label").textContent = cat.label;
      row.dataset.cat = cat.id;
      return row;
    })
  );
  $("efScore").classList.add("hidden");
  $("efReward").textContent = "";
  $("efShare").classList.add("hidden");
  $("efGo").textContent = "شروع";
  $("efGo").onclick = efStart;
  $("efGo").disabled = false;
}

function openEsmFamil() {
  modesSheet.classList.add("hidden");
  efReset();
  efSheet.classList.remove("hidden");
}

function efStart() {
  const letter = efLetters[Math.floor(Math.random() * efLetters.length)];
  ef = { letter, end: 0, timer: 0, done: false };
  $("efText").classList.add("hidden");
  $("efGo").disabled = true;
  $("efGo").textContent = "تموم!";
  // چند حرف تند تند عوض می‌شوند تا حرف اصلی بیاید
  const el = $("efLetter");
  el.classList.add("spin");
  let n = 0;
  const roll = setInterval(() => {
    el.textContent = efLetters[Math.floor(Math.random() * efLetters.length)];
    sound("tap");
    if (++n >= 12) {
      clearInterval(roll);
      if (!ef || ef.letter !== letter) return;
      el.textContent = letter;
      el.classList.remove("spin");
      sound("found");
      efBegin();
    }
  }, 85);
}

function efBegin() {
  const inputs = [...$("efList").querySelectorAll("input")];
  inputs.forEach((inp, i) => {
    inp.disabled = false;
    inp.value = "";
    inp.onkeydown = (e) => {
      if (e.key !== "Enter") return;
      e.preventDefault();
      if (inputs[i + 1]) inputs[i + 1].focus();
      else inp.blur();
    };
  });
  inputs[0].focus();
  $("efGo").disabled = false;
  $("efGo").onclick = efFinish;
  ef.end = Date.now() + EF_TIME * 1000;
  ef.timer = setInterval(efTick, 250);
  efTick();
}

function efTick() {
  if (!ef || ef.done) return;
  // با «برگشت» یا بستن کارت، بازی بدون جایزه تمام می‌شود
  if (efSheet.classList.contains("hidden")) {
    clearInterval(ef.timer);
    ef = null;
    return;
  }
  const left = (ef.end - Date.now()) / 1000;
  $("efTime").textContent = "⏱ " + clock(Math.ceil(left));
  $("efTime").classList.toggle("hurry", left <= 10);
  if (left <= 0) efFinish();
}

function efCheck(cat, letter, word) {
  const w = efNorm(word);
  if (w.length < 2 || w[0] !== efNorm(letter)) return false;
  // شکل خودمانی هم قبول است: «بادمجون» به جای «بادمجان»، «تهرون» به جای «تهران» و برعکس
  return cat.set.has(w) || cat.set.has(w.replace(/ون/g, "ان")) || cat.set.has(w.replace(/ان/g, "ون"));
}

// یک نمونه‌ی درست، برای جواب‌های خالی یا اشتباه
function efExample(cat, letter) {
  const list = cat.list.filter((w) => efNorm(w)[0] === letter);
  return list.length ? list[Math.floor(Math.random() * list.length)] : null;
}

function efFinish() {
  if (!ef || ef.done) return;
  ef.done = true;
  clearInterval(ef.timer);
  if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
  let right = 0;
  for (const row of $("efList").querySelectorAll(".ef-row")) {
    const cat = efSets.find((c) => c.id === row.dataset.cat);
    const inp = row.querySelector("input");
    inp.disabled = true;
    const ok = efCheck(cat, ef.letter, inp.value);
    row.classList.add(ok ? "right" : "wrong");
    row.querySelector(".ef-mark").textContent = ok ? "✓" : "✗";
    if (ok) right++;
    else {
      const ex = efExample(cat, ef.letter);
      if (ex) {
        const hint = document.createElement("small");
        hint.className = "ef-example";
        hint.textContent = (inp.value.trim() ? "این رو نمی‌شناسم · " : "") + `مثلاً «${ex}»`;
        row.appendChild(hint);
      }
    }
  }
  const all = right === efSets.length;
  const score = right * EF_POINTS + (all ? EF_ALL_BONUS : 0);
  const best = X().efBest || 0;
  const record = score > best;
  if (record) X().efBest = score;
  let coins = 0;
  if (X().efDay !== todayKey() && score > 0) {
    coins = Math.min(EF_MAX_COINS, Math.ceil(score / 3));
    X().efDay = todayKey();
  }
  persist();
  $("efScore").classList.remove("hidden");
  $("efScore").innerHTML = `<b>${faDigits(score)}</b><span></span>`;
  $("efScore").querySelector("span").textContent =
    `${faDigits(right)} از ${faDigits(efSets.length)} درست` + (all ? " · همه درست! 🌟" : "") +
    (record && best ? " · رکورد تازه! 🏆" : best && !record ? ` · رکوردت ${faDigits(best)}` : "");
  $("efReward").textContent = coins ? `+${faDigits(coins)} سکه (جایزه‌ی امروز)` : score ? "جایزه‌ی سکه روزی یک باره" : "";
  if (coins) setTimeout(() => giveCoins(coins, $("efReward")), 400);
  if (record || all) {
    const c = centerOfEl($("efScore"));
    sparkle(c.x, c.y, 18);
  }
  sound(right ? "complete" : "wrong");
  efSheet.dataset.score = score;
  efSheet.dataset.letter = ef.letter;
  $("efShare").classList.toggle("hidden", !score);
  $("efGo").textContent = "یه دست دیگه";
  $("efGo").onclick = () => {
    efReset();
    efStart();
  };
}

$("efClose").onclick = () => {
  efSheet.classList.add("hidden");
  if (ef) clearInterval(ef.timer);
  ef = null;
};
$("efShare").onclick = () => {
  shareMore(`«کلمه» · اسم فامیل ✍️\nبا حرف «${efSheet.dataset.letter}» ${faDigits(efSheet.dataset.score || 0)} امتیاز گرفتم! تو چند می‌گیری؟`);
};
// کیبورد گوشی نباید خانه‌ی در حال نوشتن را بپوشاند
efSheet.addEventListener("focusin", (e) => {
  if (e.target.tagName === "INPUT") setTimeout(() => e.target.scrollIntoView({ block: "center", behavior: "smooth" }), 300);
});

// ---------- کارت سرگرمی‌ها (به جای دکمه‌ی «حالت سرعتی» در منو) ----------

const modesSheet = makeSheet("modesSheet", `
  <div class="card-title">سرگرمی‌ها</div>
  <div class="card-text">یه دست سریع، بیرون از مرحله‌ها</div>
  <div class="modes-list">
    <button class="mode-pick" type="button" id="modeSpeed"><span class="mode-icon">⏱</span><span><b>حالت سرعتی</b><small id="modeSpeedSub"></small></span></button>
    <button class="mode-pick" type="button" id="modeEf"><span class="mode-icon">✍️</span><span><b>اسم فامیل</b><small id="modeEfSub"></small></span></button>
  </div>
  <button class="card-link" type="button" data-close>بستن</button>`);
modesSheet.querySelector("[data-close]").onclick = () => modesSheet.classList.add("hidden");

function openModes() {
  const sb = X().speedBest || 0;
  const eb = X().efBest || 0;
  $("modeSpeedSub").textContent = `${faDigits(SPEED_TIME)} ثانیه، هر چی کلمه بتونی` + (sb ? ` · رکورد ${faDigits(sb)}` : "");
  $("modeEfSub").textContent = `یه حرف، شش دسته، ${faDigits(EF_TIME)} ثانیه` + (eb ? ` · رکورد ${faDigits(eb)}` : "");
  $("modeSpeed").disabled = !generator;
  modesSheet.classList.remove("hidden");
}

$("modeSpeed").onclick = () => {
  modesSheet.classList.add("hidden");
  startSpeed();
};
$("modeEf").onclick = openEsmFamil;

speedBtn.onclick = openModes;

function renderModesBtn() {
  speedBtn.disabled = false;
  speedBtn.firstChild.textContent = "سرگرمی‌ها";
  $("speedSub").textContent = "سرعتی، بیت حافظ، جدول و …";
}

// ---------------------------------------------------------------------------
// ۴. ویجت صفحه‌ی اصلی گوشی
// ---------------------------------------------------------------------------
// کلمه‌ی روزِ هفت روز آینده و وضعیت مرحله‌ی روزانه به اندروید فرستاده می‌شود؛
// ویجت (KalamehWidget.java) هر روز کلمه‌ی همان روز را نشان می‌دهد، حتی اگر بازی باز نشود.

let widgetSent = "";

function syncWidget() {
  if (!nativeStore || typeof nativeStore.widget !== "function" || !dict.size) return;
  const days = {};
  for (let i = 0; i < 7; i++) {
    const d = nowDate();
    d.setDate(d.getDate() + i);
    const w = wordOfDay(d);
    if (!w) return;
    const meaning = w.meaning.length > 90 ? w.meaning.slice(0, 88) + "…" : w.meaning;
    days[dateKey(d)] = { w: w.word, m: meaning };
  }
  const dp = save.dailyPuzzle || {};
  const data = { days, run: dp.run || 0, last: dp.last || "" };
  const json = JSON.stringify(data);
  if (json === widgetSent) return;
  widgetSent = json;
  nativeStore.widget({ data: json }).catch(() => {
    widgetSent = "";
  });
}

// ---------------------------------------------------------------------------
// ۵. چالش تاج: مرحله‌ی تمام‌شده دوباره بازی شود، با کلمه‌های تازه
// ---------------------------------------------------------------------------
// هر بار که بازیکن به یک مرحله‌ی تمام‌شده برمی‌گردد، جدول تازه‌ای با همان سختی می‌گیرد.
// اگر آن را بدون راهنما تمام کند، تاج 👑 آن مرحله را روی نقشه می‌گیرد (بار اول با سکه).

const VARIANT_PREFIX = "v:";
const CROWN_REWARD = 15;
const isVariant = () => typeof playKey === "string" && playKey.startsWith(VARIANT_PREFIX);

function crowns() {
  if (!Array.isArray(X().crowns)) X().crowns = [];
  return X().crowns;
}
function variantTurns() {
  if (!X().vturn || typeof X().vturn !== "object") X().vturn = {};
  return X().vturn;
}

function playVariant(i) {
  if (!generator) return play(i);
  const orig = levelAt(i);
  const n = (variantTurns()[i] || 0) + 1;
  const avoid = orig ? orig.seed || [...orig.words].sort((a, b) => b.length - a.length)[0] : "";
  const level = generator.variant(i, n, avoid);
  if (!level) return play(i);
  // نسخه‌ی نیمه‌کاره‌ی قبلی همین مرحله پاک می‌شود؛ هر بار جدول تازه
  for (const k of Object.keys(save.partial)) if (k.startsWith(VARIANT_PREFIX)) delete save.partial[k];
  startPuzzle(level, i, `${VARIANT_PREFIX}${i}:${n}`);
  open("play");
}

// کارت مرحله‌ی تمام‌شده: دکمه‌ی اصلی حالا «چالش تاج» است
const baseShowLevelSheet = showLevelSheet;
showLevelSheet = function (i) {
  baseShowLevelSheet(i);
  const has = crowns().includes(i);
  const btn = $("levelReplay");
  btn.textContent = has ? "👑 یه جدول تازه" : "👑 چالش تاج";
  btn.onclick = () => {
    hideLevelSheet();
    playVariant(i);
  };
  let note = $("levelSheet").querySelector(".crown-note");
  if (!note) {
    note = document.createElement("div");
    note.className = "card-text crown-note";
    btn.before(note);
  }
  note.textContent = has
    ? "تاج این مرحله مال توئه. هر بار کلمه‌های تازه میاد، ولی دیگه سکه نداره."
    : `با کلمه‌های تازه دوباره بازی کن؛ بدون راهنما تمومش کنی، تاج 👑 و ${faDigits(CROWN_REWARD)} سکه می‌گیری.`;
};

// تاج‌ها روی نقشه‌ی مرحله‌ها
const baseRenderLevels = renderLevels;
renderLevels = function () {
  baseRenderLevels();
  const have = new Set(crowns());
  if (!have.size) return;
  [...$("levelMap").querySelectorAll(".lv")].forEach((btn, i) => {
    if (have.has(i)) btn.classList.add("crowned");
  });
};

// مرحله‌ای که تاجش را گرفته: دوباره بازی کردنش دیگر هیچ سکه‌ای نمی‌دهد
// (نه زنجیره، نه پر شدن صندوق، نه پیشرفت مأموریت‌ها)
let replayNoCoins = false;

const baseGiveCoins = giveCoins;
giveCoins = function (amount, from) {
  if (replayNoCoins && screenNow === "play") return;
  return baseGiveCoins(amount, from);
};
const baseMissionProgress = missionProgress;
missionProgress = function (ev, n) {
  if (replayNoCoins) return;
  return baseMissionProgress(ev, n);
};
const baseChainUp = chainUp;
chainUp = function () {
  if (replayNoCoins) return;
  return baseChainUp();
};
const baseAddToChest = addToChest;
addToChest = function (word) {
  if (!replayNoCoins) return baseAddToChest(word);
  // کلمه در صندوق می‌ماند (برای دفتر واژه‌ها)، ولی صندوق را پر نمی‌کند
  save.chest.words.push(word);
  persist();
};

function variantDone() {
  const i = current;
  variantTurns()[i] = (variantTurns()[i] || 0) + 1;
  const hinted = Object.values(cellEls).some((el) => el.classList.contains("hinted"));
  const card = document.querySelector("#overlay .card");
  const note = document.createElement("div");
  note.className = "extra crown-done";
  const list = crowns();
  if (hinted) {
    note.textContent = "این بار با راهنما بود؛ بدون راهنما تمومش کن تا تاج بگیری 👑";
  } else if (!list.includes(i)) {
    list.push(i);
    note.innerHTML = `<b>👑</b><span>تاج مرحله‌ی ${faDigits(i + 1)} مال تو شد!</span>`;
    setTimeout(() => {
      giveCoins(CROWN_REWARD, note);
      const c = centerOfEl(note);
      sparkle(c.x, c.y, 18);
    }, 500);
  } else {
    note.textContent = "آفرین! باز هم بدون راهنما 👑 (تاجش رو قبلاً گرفتی، سکه نداره)";
  }
  persist();
  $("overlayText").after(note);
  $("overlayTitle").textContent = hinted ? "تموم شد!" : "آفرین!";
  $("overlayText").textContent = `چالش تاج مرحله‌ی ${faDigits(i + 1)}`;
  // دکمه‌ی اصلی: یه جدول تازه از همین مرحله؛ «منو» به نقشه‌ی مرحله‌ها
  const btn = $("overlayBtn");
  btn.textContent = "یه جدول تازه";
  btn.onclick = () => {
    $("overlay").classList.add("hidden");
    playVariant(i);
  };
  $("overlayMenu").classList.remove("hidden");
  void card;
}

// ---------------------------------------------------------------------------
// اتصال به رویدادهای بازی
// ---------------------------------------------------------------------------

gameHooks.push((name, d) => {
  switch (name) {
    case "level":
      stopAiming();
      refreshNewTools();
      replayNoCoins = isVariant() && crowns().includes(current);
      if (isVariant()) $("levelLabel").textContent = `👑 مرحله‌ی ${faDigits(current + 1)}`;
      break;
    case "hint":
    case "found":
      refreshNewTools();
      break;
    case "complete":
      stopAiming();
      if (isVariant()) variantDone();
      if (!d.daily && d.first) showProverb(d.level);
      if (d.daily) syncWidget();
      break;
    case "home":
      replayNoCoins = false;
      stopAiming();
      renderProverbBtn();
      renderModesBtn();
      syncWidget();
      break;
  }
});

// شمارنده‌ی سکه که عوض شود، دکمه‌های تازه هم کم‌رنگ یا پررنگ می‌شوند
const baseUpdateCoins = updateCoins;
updateCoins = function () {
  baseUpdateCoins();
  refreshNewTools();
};

document.addEventListener("DOMContentLoaded", () => {
  renderProverbBtn();
  setTimeout(() => {
    renderModesBtn();
    syncWidget();
  }, 2800);
});

// بازی از پس‌زمینه برگشت (شاید روز عوض شده باشد)
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) syncWidget();
});
