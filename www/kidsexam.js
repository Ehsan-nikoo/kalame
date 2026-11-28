"use strict";

// ---------------------------------------------------------------------------
// امتحان بخش کودک (بعد از kids.js بارگذاری می‌شود)
// ده سؤال (یا ۵ یا ۱۵) قاطی از پنج مهارت؛ بدون راهنما و هر سؤال فقط یک بار جواب.
// آخرش کارنامه‌ی مهربون: ستاره برای هر مهارت، حرف‌هایی که تمرین لازم دارند و دکمه‌ی تمرین همان‌ها.
// بزرگ‌ترها (پشت سؤال ضرب) تعیین می‌کنند بچه تا کدام نشانه‌ی کتاب فارسی اول را خوانده؛
// امتحان فقط کلمه‌هایی را می‌پرسد که با همان حرف‌ها نوشته می‌شوند.
// معلم می‌تواند یک کد ۸ رقمی بسازد؛ همه‌ی بچه‌های کلاس با آن کد دقیقاً همان سؤال‌ها را می‌گیرند (بدون اینترنت).
// ---------------------------------------------------------------------------

// ترتیب نشانه‌های کتاب فارسی اول دبستان؛ [نشانه، حرف‌هایی که با آن نوشتنی می‌شوند]
// (صداهای کوتاه ـَ ـِ ـُ نوشته نمی‌شوند، پس حرف تازه‌ای اضافه نمی‌کنند)
const KX_SIGNS = [
  ["آ", "آا"], ["ب", "ب"], ["ـَ", ""], ["د", "د"], ["م", "م"], ["س", "س"], ["ـِ", ""], ["او", "و"],
  ["ر", "ر"], ["ت", "ت"], ["ـُ", ""], ["ای", "ی"], ["ن", "ن"], ["ز", "ز"], ["ش", "ش"], ["ی", "ی"],
  ["ک", "ک"], ["و", "و"], ["پ", "پ"], ["گ", "گ"], ["ف", "ف"], ["خ", "خ"], ["ق", "ق"], ["ل", "ل"],
  ["ج", "ج"], ["ـه", "ه"], ["چ", "چ"], ["ژ", "ژ"], ["ص", "ص"], ["ذ", "ذ"], ["ع", "ع"], ["ث", "ث"],
  ["ح", "ح"], ["ض", "ض"], ["ط", "ط"], ["غ", "غ"], ["ظ", "ظ"],
];
const KX_ALL = KX_SIGNS.length - 1;

const KX_SKILLS = [
  { id: "read", name: "خواندن", ic: "📖", ask: "اسم این نقاشی کدومه؟" },
  { id: "write", name: "نوشتن", ic: "✏️", ask: "با حرف‌ها اسمش رو بنویس" },
  { id: "spell", name: "املا", ic: "📝", ask: "کدوم درست نوشته شده؟" },
  { id: "letter", name: "حرف‌ها", ic: "🔤", ask: "اسم کدوم با این حرف شروع میشه؟" },
  { id: "syl", name: "بخش‌ها", ic: "👏", ask: "چند تا بخش داره؟" },
];
const KX_COUNTS = [5, 10, 15];

// کلمه‌های امتحان برای هر نسخه‌ی کد، ثابت و به ترتیب الفبا؛ اگر بعداً کلمه اضافه شد،
// کدهای قدیمی همان کلمه‌های قبلی را می‌پرسند (برای نسخه‌ی تازه یک فهرست تازه اضافه کنید)
const KX_BANKS = {
  1: "آب آبمیوه آبنبات آبی آتش آتشفشان آتش‌بازی آتش‌نشانی آدم‌آهنی آدم‌برفی آشپز آفتابگردان آمبولانس آناناس آهنربا آچار ابر اتوبوس اختاپوس اردک اسب اسب‌آبی استخوان اسکوتر انبه انگشتر انگور اژدها بابا بابابزرگ باتری باد بادام‌زمینی بادبادک بادمجان بادکنک باران ببر برف برنج بروکلی برگ بز بستنی بشقاب‌پرنده بنفش بوس بوقلمون بچه بیمارستان بینی تاج تاس تاکسی تب تبر تخت تخم‌مرغ ترازو تراکتور تقویم تلسکوپ تلفن تلویزیون تمساح توت‌فرنگی توپ تک‌شاخ جادوگر جارو جام جزیره جعبه جغد جوجه جوجه‌تیغی جوراب حلزون حمام خانه خرس خروس خرچنگ خرگوش خط‌کش خفاش خلبان خنده خواب خورشید خیار دایناسور دختر در درخت دریا دست دستکش دفتر دلفین دلقک دماسنج دندان ده دهان دو دود دوربین دوش دونات دوچرخه دکتر ذرت ذره‌بین رادیو رز رعد رنگین‌کمان روباه روح ریش زبان زرافه زرد زمین زنبور زنگ ساعت ساعت‌شنی سالاد ساندویچ سبد سبز ستاره سرباز سرما سفید سنجاب سنجاق سه سوسمار سوسیس سپر سگ سیاره سیاه سیب سیب‌زمینی سیر شال شب شبدر شتر شش شطرنج شلوار شمع شهر شکلات شیر شیرینی شیپور صابون صبح صبحانه صحرا صدف صفر صندلی طاووس طبل طوطی طوفان ظرف عروسک عسل عقاب عنکبوت عینک غذا فرشته فضانورد فلامینگو فلفل فیل قارچ قاشق قایق قرمز قطار قطب‌نما قفل قلب قلعه قلم‌مو قهوه قهوه‌ای قو قورباغه قیچی لاله لاما لامپ لاک‌پشت لباس لیمو مار ماسک ماشین مامان مامان‌بزرگ ماه ماهی ماهی‌مرکب ماکارونی مترو مداد مدال مدرسه مرغ مسجد معلم مغز ملخ ملکه موتور مورچه موز موش موشک میمون میکروفون میگو ناخن نارنجی نارگیل نامه نان نخ نخل نقاش نقشه نمک نه نهنگ نوشابه هدفون هدیه هشت هفت هلو هلیکوپتر همبرگر همستر هندوانه هواپیما هویج ویولن پا پادشاه پازل پاندا پاپ‌کورن پرتقال پرنده پروانه پرچم پسر پشه پل پلنگ پلیس پنج پنکیک پنگوئن پنیر پیاز پیانو پیتزا پیراهن پیچ چادر چای چتر چراغ چرخ‌وفلک چشم چمدان چهار چکش چکمه کاج کارخانه کاسه کاموا کامپیوتر کامیون کانگورو کاهو کاپشن کاکتوس کباب کبوتر کتاب کراوات کرم کرگدن کشاورز کشتی کفش کفش‌دوزک کلاه کلوچه کلید کمان کوآلا کوسه کوله‌پشتی کوه کیف کیوی کیک گاو گربه گرما گرگ گریه گل گلابی گوجه گورخر گوریل گوزن گوسفند گوش گوشی گیتار گیلاس یخ یویو یک",
};
const KX_VER = 1;

function kxCfg() {
  const c = X().kidsExam || {};
  return {
    upTo: Number.isInteger(c.upTo) && c.upTo >= 0 && c.upTo <= KX_ALL ? c.upTo : KX_ALL,
    count: KX_COUNTS.includes(c.count) ? c.count : 10,
    mask: Number.isInteger(c.mask) && c.mask > 0 && c.mask < 32 ? c.mask : 31,
  };
}
function kxLetters(upTo) {
  const set = new Set(KX_SIGNS.slice(0, upTo + 1).flatMap(([, l]) => [...l]));
  if (upTo >= KX_ALL) set.add("ئ");
  return set;
}
const kxAllowed = (w, set) => kwLetters(w).every((c) => set.has(c));
// کلمه‌های مجاز امتحان: از فهرست ثابت آن نسخه و فقط با حرف‌های خوانده‌شده
function kxWords(cfg, ver = KX_VER) {
  const set = kxLetters(cfg.upTo);
  const pics = new Map(KIDS_WORDS);
  return KX_BANKS[ver].split(" ").filter((w) => pics.has(w) && kxAllowed(w, set)).map((w) => [w, pics.get(w)]);
}

// ---------------------------------------------------------------------------
// ساختن سؤال‌ها (با rnd ثابت تا کد کلاس روی همه‌ی گوشی‌ها یکی باشد)
// ---------------------------------------------------------------------------
const kxPickOne = (list, rnd) => list[Math.floor(rnd() * list.length)];
function kxMake(cfg, seed, ver = KX_VER) {
  const rnd = seededRandom(hashText("kx" + ver + ":" + seed + ":" + cfg.upTo + ":" + cfg.count + ":" + cfg.mask));
  const words = kxWords(cfg, ver);
  const set = kxLetters(cfg.upTo);
  const used = new Set();
  // اول کلمه‌هایی که هنوز نیامده‌اند
  const fresh = (list, key = (x) => x[0]) => {
    const f = list.filter((x) => !used.has(key(x)));
    return f.length ? f : list;
  };
  const makers = {
    read() {
      if (words.length < 3) return null;
      const t = kxPickOne(fresh(words), rnd);
      const others = shuffled(words.filter((x) => x[0] !== t[0]), rnd).slice(0, 2).map((x) => x[0]);
      return { skill: "read", w: t[0], pic: t[1], opts: shuffled([t[0], ...others], rnd) };
    },
    write() {
      const pool = words.filter(([w]) => kwLen(w) >= 2 && kwLen(w) <= 6);
      if (!pool.length) return null;
      const t = kxPickOne(fresh(pool), rnd);
      const letters = kwLetters(t[0]);
      let keys = shuffled(letters.map((ch, i) => ({ ch, i })), rnd);
      if (keys.every((k, j) => k.i === j)) keys = keys.reverse();
      return { skill: "write", w: t[0], pic: t[1], keys: keys.map((k) => k.ch) };
    },
    spell() {
      const ok = new Set(words.map((x) => x[0]));
      const pool = kwSpellItems().filter((it) => ok.has(it.w)).map((it) => ({ ...it, wrongs: it.wrongs.filter((v) => kxAllowed(v, set)) }))
        .filter((it) => it.wrongs.length);
      if (!pool.length) return null;
      const t = kxPickOne(fresh(pool, (x) => x.w), rnd);
      return { skill: "spell", w: t.w, pic: t.pic, opts: shuffled([t.w, kxPickOne(t.wrongs, rnd)], rnd) };
    },
    letter() {
      const ef = new Set(kwEfWords().map((x) => x[0]));
      const pool = words.filter(([w]) => ef.has(w));
      const firsts = [...new Set(pool.map(([w]) => kwFirst(w)))];
      const can = firsts.filter((c) => pool.filter(([w]) => kwSound(kwFirst(w)) !== kwSound(c)).length >= 2);
      if (!can.length) return null;
      const c = kxPickOne(can, rnd);
      const t = kxPickOne(fresh(pool.filter(([w]) => kwFirst(w) === c)), rnd);
      const wrong = shuffled(pool.filter(([w]) => kwSound(kwFirst(w)) !== kwSound(c)), rnd).slice(0, 2);
      return { skill: "letter", w: t[0], pic: t[1], letter: c, cards: shuffled([t, ...wrong], rnd) };
    },
    syl() {
      const pool = words.filter(([w]) => KIDS_SYL[w] && KIDS_SYL[w].split("-").length <= 4);
      if (!pool.length) return null;
      const t = kxPickOne(fresh(pool), rnd);
      const parts = KIDS_SYL[t[0]].split("-");
      return { skill: "syl", w: t[0], pic: t[1], parts, opts: parts.length === 4 ? [2, 3, 4] : [1, 2, 3] };
    },
  };
  // مهارت‌هایی که برایشان سؤال می‌شود ساخت
  const skills = KX_SKILLS.filter((s, i) => cfg.mask & (1 << i)).map((s) => s.id).filter((id) => {
    const q = makers[id]();
    return !!q;
  });
  if (!skills.length) return [];
  const order = shuffled([...skills], rnd);
  const qs = [];
  // با نشانه‌های کم (درس‌های اول) کلمه‌ها کم‌اند؛ امتحان کوتاه‌تر می‌شود تا یک کلمه بارها نیاید
  const total = Math.min(cfg.count, Math.max(3, words.length * skills.length));
  for (let i = 0; i < total; i++) {
    const q = makers[order[i % order.length]]();
    used.add(q.w);
    qs.push(q);
  }
  // مهارت‌ها قاطی
  return shuffled(qs, rnd);
}

// ---------------------------------------------------------------------------
// کد کلاس: ۷ رقم داده + ۱ رقم کنترل
// ---------------------------------------------------------------------------
function kxEncode(cfg, seed, ver = KX_VER) {
  const n = ((((seed % 256) * 32 + (cfg.mask - 1)) * 3 + KX_COUNTS.indexOf(cfg.count)) * KX_SIGNS.length + cfg.upTo) * 4 + (ver - 1);
  const body = String(n).padStart(7, "0");
  return body + kxCheck(body);
}
function kxCheck(body) {
  let s = 0;
  [...body].forEach((d, i) => (s += Number(d) * (i % 2 ? 3 : 7)));
  return String(s % 10);
}
// کد درست → { cfg, seed, ver }؛ کد غلط → null؛ کد نسخه‌ی تازه‌تر → { newer: true }
function kxDecode(code) {
  const c = String(code).replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d)).replace(/\D/g, "");
  if (c.length !== 8 || kxCheck(c.slice(0, 7)) !== c[7]) return null;
  let n = Number(c.slice(0, 7));
  const ver = (n % 4) + 1;
  n = Math.floor(n / 4);
  const upTo = n % KX_SIGNS.length;
  n = Math.floor(n / KX_SIGNS.length);
  const ci = n % 3;
  n = Math.floor(n / 3);
  const mask = (n % 32) + 1;
  const seed = Math.floor(n / 32);
  if (seed > 255) return null;
  if (!KX_BANKS[ver]) return ver === KX_VER + 1 ? { newer: true } : null;
  return { cfg: { upTo, count: KX_COUNTS[ci], mask }, seed, ver, code: c };
}
// کد همیشه چپ‌به‌راست (\u2066…\u2069) تا در متن فارسی دو تکه‌اش جابه‌جا نشود
const kxCodeFa = (c) => "\u2066" + faDigits(c.slice(0, 4)) + " " + faDigits(c.slice(4)) + "\u2069";

// ---------------------------------------------------------------------------
// صفحه‌ی اول امتحان
// ---------------------------------------------------------------------------
let kx = null; // امتحانی که در جریان است
let kxFocus = null; // حرف‌هایی که بعد از کارنامه تمرین می‌شوند

function kxSignsText(upTo) {
  return upTo >= KX_ALL ? "همه‌ی نشانه‌ها" : "تا نشانه‌ی «" + KX_SIGNS[upTo][0] + "»";
}
function kxHome() {
  kwStop();
  kwIn = "exam";
  kx = null;
  const cfg = kxCfg();
  const last = (X().kidsExams || [])[0];
  $("kwStars").textContent = faDigits(kwTodayStars());
  $("kwStage").innerHTML = `
    <div class="kx-head"><span>📝</span><b>امتحان</b></div>
    <div class="kx-note">${faDigits(cfg.count)} سؤال · ${kxSignsText(cfg.upTo)}</div>
    <div class="kx-menu">
      <button class="kx-btn kx-start" type="button" id="kxStart"><span>✨</span><b>شروع امتحان</b></button>
      <button class="kx-btn kx-code" type="button" id="kxCode"><span>🔢</span><b>کد امتحان معلم رو دارم</b></button>
      <button class="kx-btn kx-hist" type="button" id="kxHist"><span>📒</span><b>کارنامه‌های من</b>${last ? `<small>آخری: ${faDigits(last.ok)} از ${faDigits(last.n)}</small>` : ""}</button>
      <button class="kx-btn kx-grown" type="button" id="kxGrown"><span>🔒</span><b>برای بزرگ‌ترها و معلم‌ها</b></button>
    </div>`;
  $("kxStart").onclick = () => kxBegin(cfg, Math.floor(Math.random() * 256), KX_VER, null);
  $("kxCode").onclick = () => kxCodePad();
  $("kxHist").onclick = () => kxHistory();
  $("kxGrown").onclick = () => kwParentGate(kxSettings, "برای بزرگ‌ترها 🔒", "تنظیمات امتحان مال بزرگ‌ترهاست. یکی از بزرگ‌ترها جواب بده:");
}

function kxBegin(cfg, seed, ver, code, name) {
  const qs = kxMake(cfg, seed, ver);
  if (!qs.length) {
    $("kwStage").innerHTML = `<div class="kw-pic">🤔</div>
      <div class="kw-ask">با این نشانه‌ها هنوز کلمه‌ی کافی نداریم.<br><small>بزرگ‌ترها می‌تونن نشانه‌های بیشتری انتخاب کنن.</small></div>
      <button class="kw-next" type="button" id="kxBack">برگشت</button>`;
    $("kxBack").onclick = kxHome;
    return;
  }
  kx = { cfg, seed, ver, code, name: name || "", qs, at: 0, res: [] };
  kxShow();
}

// ---------------------------------------------------------------------------
// نشان دادن هر سؤال
// ---------------------------------------------------------------------------
function kxTop() {
  const s = KX_SKILLS.find((k) => k.id === kx.qs[kx.at].skill);
  return `<div class="kx-top">
      <span class="kx-skill">${s.ic} ${s.name}</span>
      <span class="kx-count">سؤال ${faDigits(kx.at + 1)} از ${faDigits(kx.qs.length)}</span>
    </div>
    <div class="kx-bar"><i style="width:${(kx.at / kx.qs.length) * 100}%"></i></div>`;
}
function kxShow() {
  kwStop();
  kwIn = "exam";
  const q = kx.qs[kx.at];
  const s = KX_SKILLS.find((k) => k.id === q.skill);
  const st = $("kwStage");
  if (q.skill === "read" || q.skill === "spell") {
    st.innerHTML = `${kxTop()}<div class="kw-pic">${q.pic}</div><div class="kw-ask">${s.ask}</div>
      <div class="kw-opts${q.opts.length > 2 ? " three kx-opts3" : ""}">${q.opts.map((o) => `<button class="kw-opt" type="button">${o}</button>`).join("")}</div>`;
    st.querySelectorAll(".kw-opt").forEach((b) => (b.onclick = () => kxAnswer(b, b.textContent === q.w, ".kw-opt", (x) => x.textContent === q.w,
      q.skill === "spell" && b.textContent !== q.w ? kxDiff(q.w, b.textContent) : [])));
  } else if (q.skill === "syl") {
    st.innerHTML = `${kxTop()}<div class="kw-pic">${q.pic}</div><div class="kw-word kw-syl-word">${q.w}</div><div class="kw-ask">${s.ask}</div>
      <div class="kw-opts kw-claps">${q.opts.map((k) => `<button class="kw-opt kw-clap" type="button" data-n="${k}"><span>${"👏".repeat(k)}</span><b>${faDigits(k)}</b></button>`).join("")}</div>`;
    st.querySelectorAll(".kw-clap").forEach((b) => (b.onclick = () => {
      kxAnswer(b, +b.dataset.n === q.parts.length, ".kw-clap", (x) => +x.dataset.n === q.parts.length, [], () => {
        st.querySelector(".kw-syl-word").outerHTML = kwSylRow(q.parts, "show");
        st.querySelectorAll(".kw-syl-p").forEach((p) => p.classList.add("on"));
      });
    }));
  } else if (q.skill === "letter") {
    st.innerHTML = `${kxTop()}<div class="kw-ef-head"><div class="kw-letter">${q.letter}</div></div><div class="kw-ask">${s.ask}</div>
      <div class="kw-cards kx-cards">${q.cards.map(([w, p]) => `<button class="kw-card" type="button" data-w="${w}"><span>${p}</span><b>${w}</b></button>`).join("")}</div>`;
    st.querySelectorAll(".kw-card").forEach((b) => (b.onclick = () => {
      kxAnswer(b, b.dataset.w === q.w, ".kw-card", (x) => x.dataset.w === q.w, b.dataset.w === q.w ? [] : [q.letter], () =>
        st.querySelectorAll(".kw-card").forEach((c) => c.classList.add("show")));
    }));
  } else {
    // نوشتن: حرف‌ها را به ترتیب بزن؛ حرف اشتباه فقط تکان می‌خورد ولی جواب دیگر «بی‌اشتباه» حساب نمی‌شود
    const letters = kwLetters(q.w);
    let at = 0;
    const weak = new Set();
    st.innerHTML = `${kxTop()}<div class="kw-pic">${q.pic}</div><div class="kw-ask">${s.ask}</div>
      <div class="kw-slots${letters.length >= 6 ? " many" : ""}">${letters.map(() => `<span class="kw-slot"></span>`).join("")}</div>
      <div class="kw-keys">${q.keys.map((c) => `<button class="kw-key" type="button">${c}</button>`).join("")}</div>`;
    st.querySelectorAll(".kw-key").forEach((k) => (k.onclick = () => {
      if (at >= letters.length) return;
      if (k.textContent !== letters[at]) {
        weak.add(letters[at]);
        if (typeof sound === "function") sound("repeat");
        k.classList.remove("no");
        void k.offsetWidth;
        k.classList.add("no");
        return;
      }
      if (typeof sound === "function") sound("letter", at);
      k.disabled = true;
      const slot = st.querySelectorAll(".kw-slot")[at];
      slot.textContent = k.textContent;
      slot.classList.add("on");
      at++;
      if (at < letters.length) return;
      kxRecord(!weak.size, [...weak]);
      if (!weak.size) st.querySelector(".kw-pic").classList.add("win");
      kwLater(kxNext, 1300);
    }));
  }
}
// حرف‌هایی که بین شکل درست و شکل انتخاب‌شده فرق دارند (در املا)
function kxDiff(right, wrong) {
  const a = [...right];
  const b = [...wrong];
  return a.filter((c, i) => c !== b[i]);
}
function kxAnswer(btn, ok, sel, isRight, weak, after) {
  const st = $("kwStage");
  st.querySelectorAll(sel).forEach((o) => {
    o.disabled = true;
    if (isRight(o)) o.classList.add("right");
  });
  if (!ok) btn.classList.add("kx-miss");
  if (typeof sound === "function") sound(ok ? "found" : "repeat");
  if (after) after();
  kxRecord(ok, weak);
  kwLater(kxNext, ok ? 1100 : 1900);
}
function kxRecord(ok, weak) {
  const q = kx.qs[kx.at];
  kx.res.push({ skill: q.skill, w: q.w, ok, weak: weak || [] });
}
function kxNext() {
  kx.at++;
  if (kx.at < kx.qs.length) return kxShow();
  kxFinish();
}

// ---------------------------------------------------------------------------
// کارنامه
// ---------------------------------------------------------------------------
const kxStars = (ok, n) => (n ? Math.max(1, Math.round((ok / n) * 3)) : 0);
function kxFinish() {
  const by = {};
  for (const r of kx.res) {
    by[r.skill] = by[r.skill] || [0, 0];
    by[r.skill][1]++;
    if (r.ok) by[r.skill][0]++;
  }
  const weakCount = {};
  kx.res.forEach((r) => r.weak.forEach((c) => (weakCount[c] = (weakCount[c] || 0) + 1)));
  const weak = Object.keys(weakCount).sort((a, b) => weakCount[b] - weakCount[a]).slice(0, 5);
  const rep = {
    at: Date.now(), code: kx.code, name: kx.name, cfg: kx.cfg,
    n: kx.res.length, ok: kx.res.filter((r) => r.ok).length, by, weak,
    miss: kx.res.filter((r) => !r.ok).map((r) => r.w).slice(0, 8),
  };
  const x = X();
  x.kidsExams = [rep, ...(Array.isArray(x.kidsExams) ? x.kidsExams : [])].slice(0, 30);
  persist();
  kx = null;
  kxReport(rep, true);
}

function kxReport(rep, fresh) {
  kwStop();
  kwIn = "exam";
  const stars = kxStars(rep.ok, rep.n);
  const date = new Date(rep.at).toLocaleDateString("fa-IR");
  $("kwStage").innerHTML = `
    <div class="kx-card" id="kxCard">
      <div class="kx-title">کارنامه‌ی امتحان</div>
      ${rep.name ? `<div class="kx-name">${kxEsc(rep.name)}</div>` : ""}
      <div class="kx-meta">${date}${rep.code ? " · کد " + kxCodeFa(rep.code) : ""}</div>
      <div class="kx-big">${"⭐".repeat(stars)}<span class="kx-dim">${"⭐".repeat(3 - stars)}</span></div>
      <div class="kx-score">${faDigits(rep.ok)} از ${faDigits(rep.n)} درست</div>
      <div class="kx-rows">${KX_SKILLS.filter((s) => rep.by[s.id]).map((s) => {
        const [ok, n] = rep.by[s.id];
        const k = kxStars(ok, n);
        return `<div class="kx-row"><span>${s.ic} ${s.name}</span><b>${"⭐".repeat(k)}<span class="kx-dim">${"⭐".repeat(3 - k)}</span></b><small>${faDigits(ok)}/${faDigits(n)}</small></div>`;
      }).join("")}</div>
      ${rep.weak.length ? `<div class="kx-weak">این حرف‌ها تمرین بیشتری لازم دارن:<div>${rep.weak.map((c) => `<i>${c}</i>`).join("")}</div></div>` : `<div class="kx-weak">${fresh ? kxPraise(rep) : ""}</div>`}
    </div>
    <div class="kx-actions">
      ${rep.weak.length ? `<button class="kw-next" type="button" id="kxPractice">تمرین همین حرف‌ها</button>` : ""}
      <button class="kw-next kx-share" type="button" id="kxShare">📤 فرستادن کارنامه</button>
      <button class="card-link" type="button" id="kxDone">${fresh ? "برگشت به امتحان" : "برگشت"}</button>
    </div>`;
  if (fresh) {
    if (stars >= 2) kwConfetti();
    if (typeof sound === "function") sound("complete");
  }
  if ($("kxPractice")) $("kxPractice").onclick = () => kxPractice(rep.weak);
  $("kxShare").onclick = () => kxShare(rep);
  $("kxDone").onclick = () => (fresh ? kxHome() : kxHistory());
}
const kxPraise = (rep) => (rep.ok === rep.n ? "همه رو درست جواب دادی! آفرین! 🎉" : "آفرین! خیلی خوب بود.");
const kxEsc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

// تمرین حرف‌های ضعیف: «نقاشی و کلمه» فقط با کلمه‌هایی که این حرف‌ها را دارند
function kxPractice(letters) {
  kxFocus = letters.slice();
  kwRound = { game: "pic", n: 0 };
  kwNext();
}

function kxHistory() {
  kwStop();
  kwIn = "exam";
  const list = Array.isArray(X().kidsExams) ? X().kidsExams : [];
  $("kwStage").innerHTML = `
    <div class="kx-head"><span>📒</span><b>کارنامه‌های من</b></div>
    ${list.length ? `<div class="kx-hlist">${list.map((r, i) => `<button class="kx-hrow" type="button" data-i="${i}">
        <span>${new Date(r.at).toLocaleDateString("fa-IR")}${r.code ? " · کلاس" : ""}</span>
        <b>${"⭐".repeat(kxStars(r.ok, r.n))}</b><small>${faDigits(r.ok)} از ${faDigits(r.n)}</small></button>`).join("")}</div>`
      : `<div class="kw-ask">هنوز امتحانی ندادی!</div>`}
    <button class="card-link" type="button" id="kxBack">برگشت</button>`;
  $("kwStage").querySelectorAll(".kx-hrow").forEach((b) => (b.onclick = () => kxReport(list[+b.dataset.i], false)));
  $("kxBack").onclick = kxHome;
}

// عکس کارنامه برای فرستادن به معلم (واتس‌اپ، ایتا و …)
function kxImage(rep) {
  const W = 1080;
  const rows = KX_SKILLS.filter((s) => rep.by[s.id]).length;
  const H = (rep.name ? 710 : 610) + rows * 110 + (rep.weak.length ? 80 : 0) + 190;
  const cv = document.createElement("canvas");
  cv.width = W;
  cv.height = H;
  const g = cv.getContext("2d");
  const bg = g.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#fff4d6");
  bg.addColorStop(1, "#ffd9e6");
  g.fillStyle = bg;
  g.fillRect(0, 0, W, H);
  g.fillStyle = "#ffffff";
  kxRound(g, 70, 70, W - 140, H - 140, 60);
  g.fill();
  g.direction = "rtl";
  g.textAlign = "center";
  g.fillStyle = "#ff7a45";
  g.font = '96px Lalezar, Vazirmatn, sans-serif';
  g.fillText("کارنامه‌ی امتحان", W / 2, 220);
  g.fillStyle = "#3b2a1a";
  let y = 300;
  if (rep.name) {
    g.font = '72px Lalezar, Vazirmatn, sans-serif';
    g.fillText(rep.name, W / 2, y + 20);
    y += 100;
  }
  g.font = '700 38px Vazirmatn, sans-serif';
  g.fillStyle = "#8a6a4a";
  g.fillText(new Date(rep.at).toLocaleDateString("fa-IR") + (rep.code ? "  ·  کد " + kxCodeFa(rep.code) : ""), W / 2, y);
  y += 120;
  const stars = kxStars(rep.ok, rep.n);
  g.font = '110px sans-serif';
  g.fillText("⭐".repeat(stars), W / 2, y);
  y += 100;
  g.fillStyle = "#3b9a5a";
  g.font = '64px Lalezar, Vazirmatn, sans-serif';
  g.fillText(faDigits(rep.ok) + " از " + faDigits(rep.n) + " درست", W / 2, y);
  y += 90;
  g.font = '700 46px Vazirmatn, sans-serif';
  for (const s of KX_SKILLS) {
    if (!rep.by[s.id]) continue;
    const [ok, n] = rep.by[s.id];
    g.fillStyle = "#fff6e6";
    kxRound(g, 150, y - 30, W - 300, 90, 30);
    g.fill();
    g.fillStyle = "#3b2a1a";
    g.textAlign = "right";
    g.fillText(s.name, W - 190, y + 30);
    g.textAlign = "left";
    g.fillText(faDigits(ok) + " از " + faDigits(n) + "  " + "⭐".repeat(kxStars(ok, n)), 190, y + 30);
    g.textAlign = "center";
    y += 110;
  }
  if (rep.weak.length) {
    y += 20;
    g.fillStyle = "#ff7a45";
    g.font = '700 40px Vazirmatn, sans-serif';
    g.fillText("تمرین بیشتر: " + rep.weak.join("  "), W / 2, y);
  }
  g.fillStyle = "#b09070";
  g.font = '700 32px Vazirmatn, sans-serif';
  g.fillText("بازی «کلمه»", W / 2, H - 110);
  return cv.toDataURL("image/png");
}
function kxRound(g, x, y, w, h, r) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}
async function kxShare(rep) {
  const text = "کارنامه‌ی امتحان" + (rep.name ? " " + rep.name : "") + ": " + faDigits(rep.ok) + " از " + faDigits(rep.n) +
    (rep.code ? " (کد " + kxCodeFa(rep.code) + ")" : "");
  if (typeof sharePng === "function") await sharePng(kxImage(rep), "karname.png", text, "فرستادن کارنامه");
}

// ---------------------------------------------------------------------------
// کد معلم: صفحه‌کلید عددی بزرگ (بی‌نیاز از کیبورد گوشی)
// ---------------------------------------------------------------------------
function kxCodePad() {
  kwStop();
  kwIn = "exam";
  let code = "";
  $("kwStage").innerHTML = `
    <div class="kx-head"><span>🔢</span><b>کد امتحان</b></div>
    <div class="kw-ask">کدی که معلم داده رو بزن</div>
    <div class="kx-code-boxes" id="kxBoxes">${"<i></i>".repeat(8)}</div>
    <div class="kx-code-msg" id="kxMsg"></div>
    <div class="kx-pad">${[1, 2, 3, 4, 5, 6, 7, 8, 9, "⌫", 0, "✓"].map((d) => `<button type="button" class="kx-key" data-d="${d}">${typeof d === "number" ? faDigits(d) : d}</button>`).join("")}</div>
    <button class="card-link" type="button" id="kxBack">برگشت</button>`;
  const boxes = [...$("kxBoxes").children];
  const paint = () => boxes.forEach((b, i) => {
    b.textContent = code[i] ? faDigits(code[i]) : "";
    b.classList.toggle("on", i < code.length);
  });
  const go = () => {
    const d = kxDecode(code);
    if (!d || d.newer) {
      $("kxMsg").textContent = d && d.newer ? "این کد مال نسخه‌ی تازه‌تر بازیه؛ بازی رو به‌روز کن." : "این کد درست نیست؛ دوباره نگاه کن.";
      $("kxBoxes").classList.remove("no");
      void $("kxBoxes").offsetWidth;
      $("kxBoxes").classList.add("no");
      return;
    }
    kxAskName(d);
  };
  $("kwStage").querySelectorAll(".kx-key").forEach((k) => (k.onclick = () => {
    const d = k.dataset.d;
    $("kxMsg").textContent = "";
    if (d === "⌫") code = code.slice(0, -1);
    else if (d === "✓") return code.length === 8 ? go() : null;
    else if (code.length < 8) code += d;
    paint();
    if (code.length === 8) go();
  }));
  $("kxBack").onclick = kxHome;
}
function kxAskName(d) {
  $("kwStage").innerHTML = `
    <div class="kx-head"><span>🙋</span><b>اسمت چیه؟</b></div>
    <div class="kw-ask">اسمت روی کارنامه نوشته میشه</div>
    <input class="kx-name-in" id="kxName" type="text" maxlength="30" dir="rtl" autocomplete="off" value="${kxEsc(X().kidsName || "")}">
    <div class="kx-note">${faDigits(d.cfg.count)} سؤال · ${kxSignsText(d.cfg.upTo)}</div>
    <button class="kw-next" type="button" id="kxGo">شروع امتحان ◀</button>
    <button class="card-link" type="button" id="kxBack">برگشت</button>`;
  $("kxGo").onclick = () => {
    const name = $("kxName").value.trim().slice(0, 30);
    X().kidsName = name;
    persist();
    kxBegin(d.cfg, d.seed, d.ver, d.code, name);
  };
  $("kxBack").onclick = kxHome;
}

// ---------------------------------------------------------------------------
// تنظیمات بزرگ‌ترها و ساختن کد کلاس
// ---------------------------------------------------------------------------
function kxSettings() {
  kwStop();
  kwIn = "exam";
  const cfg = kxCfg();
  const st = $("kwStage");
  const draw = () => {
    const n = kxWords(cfg).length;
    st.innerHTML = `
      <div class="kx-head"><span>🔒</span><b>تنظیمات امتحان</b></div>
      <div class="kx-set">
        <div class="kx-set-t">بچه تا کدوم نشانه‌ی کتاب فارسی رو خونده؟</div>
        <div class="kx-signs">${KX_SIGNS.map(([s], i) => `<button type="button" class="kx-sign${i <= cfg.upTo ? " on" : ""}${i === cfg.upTo ? " last" : ""}" data-i="${i}">${s}</button>`).join("")}</div>
        <div class="kx-set-n">${kxSignsText(cfg.upTo)} · ${faDigits(n)} کلمه برای امتحان${n < 8 ? " <b>(کمه؛ نشانه‌های بیشتری انتخاب کنید)</b>" : ""}</div>
        <div class="kx-set-t">چند تا سؤال؟</div>
        <div class="kx-seg">${KX_COUNTS.map((c) => `<button type="button" class="kx-cnt${c === cfg.count ? " on" : ""}" data-c="${c}">${faDigits(c)}</button>`).join("")}</div>
        <div class="kx-set-t">چه چیزهایی پرسیده بشه؟</div>
        <div class="kx-skills">${KX_SKILLS.map((s, i) => `<button type="button" class="kx-sk${cfg.mask & (1 << i) ? " on" : ""}" data-b="${i}">${s.ic} ${s.name}</button>`).join("")}</div>
      </div>
      <div class="kx-actions">
        <button class="kw-next" type="button" id="kxSave">ذخیره</button>
        <button class="kw-next kx-share" type="button" id="kxMakeCode">ساخت کد برای کلاس</button>
      </div>`;
    st.querySelectorAll(".kx-sign").forEach((b) => (b.onclick = () => {
      cfg.upTo = +b.dataset.i;
      draw();
    }));
    st.querySelectorAll(".kx-cnt").forEach((b) => (b.onclick = () => {
      cfg.count = +b.dataset.c;
      draw();
    }));
    st.querySelectorAll(".kx-sk").forEach((b) => (b.onclick = () => {
      const m = cfg.mask ^ (1 << +b.dataset.b);
      if (m) cfg.mask = m;
      draw();
    }));
    $("kxSave").onclick = () => {
      X().kidsExam = { ...cfg };
      persist();
      kxHome();
    };
    $("kxMakeCode").onclick = () => {
      X().kidsExam = { ...cfg };
      persist();
      kxClassCode(cfg);
    };
  };
  draw();
}
function kxClassCode(cfg) {
  const seed = Math.floor(Math.random() * 256);
  const code = kxEncode(cfg, seed);
  const ok = kxMake(cfg, seed).length > 0;
  $("kwStage").innerHTML = `
    <div class="kx-head"><span>🏫</span><b>کد امتحان کلاس</b></div>
    <div class="kx-bigcode">${kxCodeFa(code)}</div>
    <div class="kx-note">${faDigits(cfg.count)} سؤال · ${kxSignsText(cfg.upTo)}</div>
    <div class="kx-explain">این کد رو روی تخته بنویسید. هر بچه توی «امتحان» دکمه‌ی «کد امتحان معلم رو دارم» رو می‌زنه و
      همه دقیقاً همین سؤال‌ها رو می‌گیرن. آخرش بچه‌ها عکس کارنامه رو براتون می‌فرستن.</div>
    ${ok ? "" : `<div class="kx-code-msg">با این نشانه‌ها کلمه‌ی کافی نیست!</div>`}
    <div class="kx-actions">
      <button class="kw-next kx-share" type="button" id="kxSendCode">📤 فرستادن کد</button>
      <button class="kw-next" type="button" id="kxNewCode">یه کد دیگه</button>
      <button class="card-link" type="button" id="kxBack">برگشت</button>
    </div>`;
  $("kxSendCode").onclick = async () => {
    const text = "کد امتحان «کلمه»: " + kxCodeFa(code) + "\nبازی کلمه ← کودک ← امتحان ← کد امتحان معلم رو دارم";
    try {
      const P = window.Capacitor && window.Capacitor.Plugins;
      if (typeof native === "function" && native() && P && P.Share) await P.Share.share({ text, dialogTitle: "فرستادن کد امتحان" });
      else if (navigator.share) await navigator.share({ text });
      else if (navigator.clipboard) await navigator.clipboard.writeText(text);
    } catch {
      // پنجره بسته شد
    }
  };
  $("kxNewCode").onclick = () => kxClassCode(cfg);
  $("kxBack").onclick = kxSettings;
}
