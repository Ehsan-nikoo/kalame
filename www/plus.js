"use strict";

// بخش‌های تازه، بعد از more.js بارگذاری می‌شود:
// ۱. کمک‌های «نشونه» (یک خانه‌ی دلخواه) و «موشک» (چند خانه‌ی تصادفی)
// ۲. ضرب‌المثل فصل: هر مرحله یک تکه‌اش را باز می‌کند
// ۳. حالت «اسم فامیل» (فهرست کلمه‌ها در esmfamil.js) و کارت انتخاب سرگرمی‌ها
// ۴. فرستادن کلمه‌ی روز و رکورد روزانه به ویجت صفحه‌ی اصلی گوشی
// داده‌ها در save.x ذخیره می‌شوند (مثل extras.js).

// ---------------------------------------------------------------------------
// ۱. کمک‌های تازه
// ---------------------------------------------------------------------------

const COST_HINT_TARGET = 20; // یک خانه، هر جا که بازیکن بخواهد
const COST_HINT_ROCKET = 45; // چند خانه‌ی تصادفی با هم
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

const PROVERBS = [
  ["قطره قطره جمع گردد، وانگهی دریا شود", "کم‌کم جمع کردن، آخرش چیز بزرگی می‌سازه."],
  ["از تو حرکت، از خدا برکت", "تو تلاشت رو بکن، نتیجه‌ش می‌رسه."],
  ["کار نیکو کردن از پر کردن است", "هر کاری رو زیاد تمرین کنی، استادش میشی."],
  ["گر صبر کنی ز غوره حلوا سازی", "با صبر، از چیز ترش و نارس هم میشه شیرینی ساخت."],
  ["یک دست صدا ندارد", "کار بزرگ با همکاری پیش میره."],
  ["هر گردی گردو نیست", "به ظاهر چیزها نباید اعتماد کرد."],
  ["جوجه را آخر پاییز می‌شمارند", "نتیجه رو آخر کار ببین، نه وسطش."],
  ["تا تنور گرم است باید نان را چسباند", "فرصت رو تا هست از دست نده."],
  ["از این ستون به آن ستون فرج است", "صبر کنی، گره کار باز میشه."],
  ["شاهنامه آخرش خوش است", "باید صبر کرد و پایان کار رو دید."],
  ["مرغ همسایه غاز است", "مال دیگرون همیشه بهتر به چشم میاد."],
  ["کوه به کوه نمی‌رسد، آدم به آدم می‌رسد", "آدم‌ها یه روزی دوباره همدیگه رو می‌بینن."],
  ["آهسته برو، همیشه برو", "آروم ولی پیوسته رفتن بهتر از تند رفتن و وایسادنه."],
  ["ماهی را هر وقت از آب بگیری تازه است", "برای شروع یه کار خوب، هیچ‌وقت دیر نیست."],
  ["عاقبت جوینده یابنده بود", "کسی که دنبال چیزی بگرده، آخرش پیداش می‌کنه."],
  ["سحرخیز باش تا کامروا باشی", "کسی که زود شروع کنه، به آرزوش می‌رسه."],
  ["پرسیدن عیب نیست، ندانستن عیب است", "سؤال کردن خجالت نداره."],
  ["دوری و دوستی", "گاهی کمی فاصله، دوستی رو بیشتر می‌کنه."],
  ["هر که بامش بیش، برفش بیشتر", "هر کی بیشتر داره، دردسرش هم بیشتره."],
  ["آب که از سر گذشت، چه یک وجب چه صد وجب", "وقتی کار از کار گذشت، دیگه فرقی نمی‌کنه."],
  ["خواستن توانستن است", "اگه واقعاً بخوای، می‌تونی."],
  ["دیر رسیدن بهتر از هرگز نرسیدن است", "دیر انجام دادن یه کار، بهتر از هیچ‌وقت انجام ندادنشه."],
  ["کبوتر با کبوتر، باز با باز", "هر کسی با هم‌جنس خودش جور میشه."],
  ["هر چه کنی به خود کنی، گر همه نیک و بد کنی", "خوبی و بدی آدم، آخرش به خودش برمی‌گرده."],
];

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
    }
  }
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
  return w.length >= 2 && w[0] === efNorm(letter) && cat.set.has(w);
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
  $("speedSub").textContent = "سرعتی · اسم فامیل";
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
// اتصال به رویدادهای بازی
// ---------------------------------------------------------------------------

gameHooks.push((name, d) => {
  switch (name) {
    case "level":
      stopAiming();
      refreshNewTools();
      break;
    case "hint":
    case "found":
      refreshNewTools();
      break;
    case "complete":
      stopAiming();
      if (!d.daily && d.first) showProverb(d.level);
      if (d.daily) syncWidget();
      break;
    case "home":
      stopAiming();
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
  setTimeout(() => {
    renderModesBtn();
    syncWidget();
  }, 2800);
});

// بازی از پس‌زمینه برگشت (شاید روز عوض شده باشد)
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) syncWidget();
});
