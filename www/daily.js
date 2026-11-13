"use strict";

// مرحله‌ی روزانه، اشتراک نتیجه، مناسبت‌ها (نوروز، یلدا، محرم) و اعلان یادآوری.
// این فایل بعد از game.js و feel.js بارگذاری می‌شود و از تابع‌ها و متغیرهای آن‌ها استفاده می‌کند.

const DAILY_COINS = 20; // جایزه‌ی حل کردن مرحله‌ی روزانه، یک بار در روز
// لینکی که با نتیجه فرستاده می‌شود (صفحه‌ی بازی در کافه‌بازار)
const SHARE_URL = "https://cafebazaar.ir/app/com.kalameh.game";
const REMIND_HOUR = 19; // ساعت اعلان یادآوری (به وقت گوشی)

// ---------------------------------------------------------------------------
// تاریخ خورشیدی و قمری
// ---------------------------------------------------------------------------

function calendarParts(date, calendar) {
  try {
    const parts = new Intl.DateTimeFormat("en-u-ca-" + calendar, { year: "numeric", month: "numeric", day: "numeric" }).formatToParts(date);
    const get = (t) => parseInt((parts.find((p) => p.type === t) || {}).value, 10);
    return { y: get("year"), m: get("month"), d: get("day") };
  } catch {
    return { y: 0, m: 0, d: 0 };
  }
}

// «۲۲ آبان»
function persianDay(date) {
  try {
    return new Intl.DateTimeFormat("fa-IR-u-ca-persian", { day: "numeric", month: "long" }).format(date);
  } catch {
    return faDigits(dateKey(date));
  }
}

// شماره‌ی روز از ۱۹۷۰؛ برای انتخاب ظاهر مرحله‌ی روزانه (صورت فلکی، قالی، ...)
function dayNumber(date) {
  return Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 864e5);
}

// ---------------------------------------------------------------------------
// مناسبت‌ها
// ---------------------------------------------------------------------------
// words: کلمه‌هایی که مرحله‌ی روزانه‌ی آن روزها دور آن‌ها ساخته می‌شود (باید در words.txt یا extra-words.txt باشند)
// gift: عیدی یک‌باره (سکه)، یک بار در هر سال
// quiet: بی‌جشن و کاغذرنگی؛ برای روزهای سوگواری

const EVENTS = [
  {
    id: "nowruz",
    name: "نوروز",
    greet: "نوروزت پیروز!",
    note: "مرحله‌ی روزانه با کلمه‌های هفت‌سین",
    gift: 100,
    giftName: "عیدی",
    words: ["نوروز", "سبزه", "سمنو", "سنجد", "سیب", "سیر", "سرکه", "سکه", "ماهی", "عید", "عیدی", "بهار", "سفره", "شکوفه", "سال", "نو", "تنگ"],
    // ۱ تا ۱۳ فروردین
    when: (p) => p.m === 1 && p.d <= 13,
  },
  {
    id: "yalda",
    name: "شب یلدا",
    greet: "یلدات مبارک!",
    note: "مرحله‌ی روزانه با کلمه‌های شب یلدا",
    gift: 50,
    giftName: "هدیه‌ی یلدا",
    words: ["یلدا", "انار", "هندوانه", "آجیل", "حافظ", "فال", "کرسی", "پسته", "برف", "زمستان", "قصه", "شب", "بلند", "چله"],
    // ۲۷ آذر تا ۱ دی
    when: (p) => (p.m === 9 && p.d >= 27) || (p.m === 10 && p.d === 1),
  },
  {
    id: "muharram",
    name: "ماه محرم",
    greet: "ماه محرم",
    note: "مرحله‌ی روزانه با کلمه‌های این روزها",
    gift: 0,
    quiet: true,
    words: ["محرم", "عاشورا", "تاسوعا", "کربلا", "نذری", "نذر", "روضه", "عزا", "شمع", "حلیم", "سقا", "آب", "صبر", "علم", "پرچم", "سینه", "دسته"],
    // ۱ تا ۱۲ محرم (تقویم قمری؛ ممکن است با تقویم ایران یک روز فرق کند)
    when: (p, h) => h.m === 1 && h.d <= 12,
  },
];

function eventOn(date) {
  const p = calendarParts(date, "persian");
  const h = calendarParts(date, "islamic-umalqura");
  return EVENTS.find((e) => e.when(p, h)) || null;
}

const eventNow = () => eventOn(nowDate());

// کلید عیدی هر سال، مثل nowruz-1406
function giftKey(ev) {
  return ev.id + "-" + calendarParts(nowDate(), "persian").y;
}

function giftDue(ev) {
  return !!(ev && ev.gift && !save.events[giftKey(ev)]);
}

function claimGift() {
  const ev = eventNow();
  if (!giftDue(ev)) return;
  save.events[giftKey(ev)] = true;
  save.coins += ev.gift;
  persist();
  sound("reward");
  const icon = $("eventBanner").querySelector(".event-icon");
  flyCoins(ev.gift, icon ? icon.getBoundingClientRect() : null, document.querySelector("#screenHome .coins"));
  renderEvent();
}

const EVENT_ICONS = {
  // ماهی قرمز و سبزه
  nowruz: `<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M8 30h24l-3 6H11Z" fill="#c9953e"/><path d="M11 30c0-8 2-14 4-18M16 30c0-9 1-15 4-20M21 30c0-8 2-13 5-17M26 30c0-6 2-10 4-13" stroke="#5fa04a" stroke-width="2.2" fill="none" stroke-linecap="round"/><path d="M14 20c4-4 10-4 13 0-3 4-9 4-13 0Zm13 0 5-3v6Z" fill="#e8553c"/><circle cx="17" cy="19.3" r=".9" fill="#2b1a10"/></svg>`,
  // انار
  yalda: `<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="23" r="12" fill="#b8263a"/><path d="M16 11l2 3 2-4 2 4 2-3v5h-8Z" fill="#8a1a2a"/><circle cx="16" cy="20" r="3" fill="#fff" opacity=".18"/></svg>`,
  // شمع
  muharram: `<svg viewBox="0 0 40 40" aria-hidden="true"><rect x="16" y="16" width="8" height="18" rx="1.5" fill="#efe6d4"/><path d="M20 6c3 4 3 7 0 9-3-2-3-5 0-9Z" fill="#f4b54a"/><rect x="12" y="33" width="16" height="3" rx="1.5" fill="#6b5a4a"/></svg>`,
};

// نوار مناسبت در منو؛ با زدنش عیدی گرفته می‌شود یا مرحله‌ی روزانه باز می‌شود
function renderEvent() {
  const ev = eventNow();
  document.documentElement.dataset.event = ev ? ev.id : "";
  const el = $("eventBanner");
  el.classList.toggle("hidden", !ev);
  if (!ev) return;
  const gift = giftDue(ev);
  el.innerHTML = `<span class="event-icon">${EVENT_ICONS[ev.id] || ""}</span><span class="event-text"><b></b><small></small></span>`;
  el.querySelector("b").textContent = ev.greet;
  el.querySelector("small").textContent = gift ? `${ev.giftName}: ${faDigits(ev.gift)} سکه، بزن تا بگیری` : ev.note;
  el.classList.toggle("gift", gift);
  el.onclick = gift ? claimGift : playDaily;
}

// ---------------------------------------------------------------------------
// مرحله‌ی روزانه: برای همه‌ی بازیکن‌ها در یک روز یکسان است
// ---------------------------------------------------------------------------

const DAILY_PREFIX = "d:";
const isDaily = () => typeof playKey === "string" && playKey.startsWith(DAILY_PREFIX);
let dailyCache = { day: null, level: null };

function dailyLevel(day) {
  if (dailyCache.day !== day) {
    const ev = eventOn(nowDate());
    const words = ev ? ev.words.filter((w) => dict.has(w) || extraDict.has(w)) : [];
    dailyCache = { day, level: generator.daily(day, words) };
  }
  return dailyCache.level;
}

const dailySolved = () => save.dailyPuzzle.last === todayKey();

function playDaily() {
  if (!generator) return;
  const day = todayKey();
  // نیمه‌کاره‌ی روزهای قبل دیگر به کار نمی‌آید
  for (const k of Object.keys(save.partial)) {
    if (k.startsWith(DAILY_PREFIX) && k !== DAILY_PREFIX + day) delete save.partial[k];
  }
  startPuzzle(dailyLevel(day), dayNumber(nowDate()), DAILY_PREFIX + day);
  open("play");
}

function dailyLabel() {
  const ev = eventNow();
  return `مرحله‌ی روزانه · ${persianDay(nowDate())}` + (ev && !ev.quiet ? " · " + ev.name : "");
}

// دکمه‌ی مرحله‌ی روزانه در منو
function renderDailyBtn() {
  const btn = $("dailyBtn");
  btn.disabled = !generator;
  btn.classList.toggle("solved", dailySolved());
  const run = save.dailyPuzzle.run;
  $("dailySub").textContent = dailySolved()
    ? `✓ حل شد` + (run > 1 ? ` · ${faDigits(run)} روز پشت سر هم` : "")
    : persianDay(nowDate()) + (save.partial[DAILY_PREFIX + todayKey()] ? " · نیمه‌کاره" : "");
}

// پایان مرحله‌ی روزانه (به جای finishLevel)
function finishDaily(hinted) {
  locked = true;
  const first = !dailySolved();
  const d = save.dailyPuzzle;
  if (first) {
    d.run = d.last === yesterdayKey() ? d.run + 1 : 1;
    d.best = Math.max(d.best, d.run);
    d.count++;
    d.last = todayKey();
    d.hinted = hinted;
    save.coins += DAILY_COINS;
  }
  const grid = shareGrid();
  delete save.partial[playKey];
  persist();
  planReminders();
  const delay = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--complete-delay"), 10);
  const key = playKey;
  setTimeout(() => {
    if (screenNow === "play" && playKey === key) showDailyComplete(first, grid, hinted);
  }, delay || 700);
}

function showDailyComplete(first, grid, hinted) {
  const card = document.querySelector("#overlay .card");
  for (const el of card.querySelectorAll(".extra")) el.remove();
  const ev = eventNow();
  const run = save.dailyPuzzle.run;
  $("overlayReward").classList.toggle("hidden", !first);
  $("overlayReward").querySelector(".reward-count").textContent = "+" + faDigits(DAILY_COINS);
  const btn = $("overlayBtn");
  btn.textContent = "منو";
  btn.onclick = goHome;
  $("overlayMenu").classList.add("hidden");

  // دکمه‌های اشتراک
  const text = shareText(grid, hinted);
  const row = document.createElement("div");
  row.className = "extra share-row";
  row.innerHTML = `<span class="share-title">نتیجه‌ات رو بفرست</span>
    <button type="button" class="share-btn tg" aria-label="تلگرام"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 4 2.5 11.2c-.9.4-.9 1.6.1 1.9l4.6 1.4 1.8 5.5c.3.8 1.3 1 1.9.4l2.6-2.5 4.7 3.5c.7.5 1.7.1 1.9-.8L23 5.4C23.2 4.3 22 3.5 21 4Zm-3.3 4.2-8 7.2-.3 3.2-1.4-4.4 9.2-6.5c.4-.3.8.2.5.5Z" fill="currentColor"/></svg>تلگرام</button>
    <button type="button" class="share-btn wa" aria-label="واتساپ"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5a9.5 9.5 0 0 0-8.2 14.3L2.5 21.5l4.8-1.3A9.5 9.5 0 1 0 12 2.5Zm5.4 13.3c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.1-4.5-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.9s.7-2 1-2.3c.3-.3.6-.3.8-.3h.6c.2 0 .4 0 .6.5l.9 2.1c.1.2.1.4 0 .5l-.4.6-.4.5c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.4 1.5.3.1.5.1.6-.1l.9-1c.2-.3.4-.2.6-.1l2 .9c.3.1.5.2.5.3.1.2.1.7-.1 1.3Z" fill="currentColor"/></svg>واتساپ</button>
    <button type="button" class="share-btn more" aria-label="بیشتر"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12M7 8l5-5 5 5M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>بیشتر</button>`;
  row.querySelector(".tg").onclick = () => openLink(`https://t.me/share/url?url=${encodeURIComponent(SHARE_URL)}&text=${encodeURIComponent(text)}`);
  row.querySelector(".wa").onclick = () => openLink(`https://wa.me/?text=${encodeURIComponent(text + "\n" + SHARE_URL)}`);
  row.querySelector(".more").onclick = () => shareMore(text);
  btn.before(row);

  $("overlay").classList.remove("hidden");
  updateCoins();
  emit("complete", { level: current, finished: false, first, daily: true });
  // عنوان بعد از ظاهر نوشته می‌شود، چون بعضی ظاهرها عنوان خودشان را می‌گذارند
  $("overlayTitle").textContent = ev && ev.quiet ? "مرحله‌ی روزانه تمام شد" : "مرحله‌ی روزانه حل شد!";
  $("overlayText").textContent = persianDay(nowDate()) + (run > 1 ? ` · ${faDigits(run)} روز پشت سر هم 🔥` : "");
  celebrate();
  if (first) {
    setTimeout(() => {
      flyCoins(DAILY_COINS, $("overlayReward").querySelector(".coin-icon").getBoundingClientRect(), document.querySelector("#app .coins"));
    }, 350);
  }
}

// ---------- اشتراک نتیجه ----------

// جدول به شکل مربع‌های رنگی: سبز = خودش پیدا کرد، زرد = با راهنما، سیاه = خانه‌ی خالی.
// ستون‌ها از راست به چپ‌اند (مثل جدول بازی)، پس برای نمایش چپ‌به‌راست برعکس نوشته می‌شوند.
function shareGrid() {
  const rows = [];
  for (let r = 0; r < layout.rows; r++) {
    let line = "";
    for (let c = layout.cols - 1; c >= 0; c--) {
      const el = cellEls[r + "," + c];
      line += !el ? "⬛" : el.classList.contains("hinted") ? "🟨" : "🟩";
    }
    rows.push(line);
  }
  return rows.join("\n");
}

function shareText(grid, hinted) {
  const run = save.dailyPuzzle.run;
  const ev = eventNow();
  const head = `«کلمه» · مرحله‌ی روزانه‌ی ${persianDay(nowDate())}` + (ev && !ev.quiet ? ` (${ev.name})` : "");
  const line = (hinted ? "✅ حلش کردم" : "✅ بدون راهنما حلش کردم") + (run > 1 ? ` · 🔥 ${faDigits(run)} روز پشت سر هم` : "");
  return `${head}\n${line}\n\n${grid}\n\nتو هم امتحان کن:`;
}

const native = () => !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());

// در گوشی، رفتن به لینک بیرونی خودش تلگرام یا واتساپ (یا مرورگر) را باز می‌کند
// (window.open را تابع open در game.js پوشانده؛ پس با یک لینک موقت باز می‌شود)
function openLink(url) {
  if (native()) return void (location.href = url);
  const a = document.createElement("a");
  a.href = url;
  a.target = "_blank";
  a.rel = "noopener";
  a.click();
}

async function shareMore(text) {
  const plugin = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Share;
  try {
    if (native() && plugin) return await plugin.share({ text, url: SHARE_URL, dialogTitle: "فرستادن نتیجه" });
    if (navigator.share) return await navigator.share({ text, url: SHARE_URL });
  } catch {
    return; // بازیکن پنجره را بست
  }
  try {
    await navigator.clipboard.writeText(text + "\n" + SHARE_URL);
    showPreview("نتیجه کپی شد", "note", 1400);
  } catch {
    showPreview("فرستادن نتیجه اینجا نمی‌شود", "wrong note", 1400);
  }
}

// ---------------------------------------------------------------------------
// اعلان یادآوری (فقط در گوشی)
// ---------------------------------------------------------------------------
// هر بار که بازی باز یا بسته می‌شود، اعلان‌های چند روز آینده از نو چیده می‌شوند:
// امروز فقط اگر هنوز جایزه یا مرحله‌ی روزانه مانده باشد، و برای سه روز بعد.

const REMIND_IDS = [701, 702, 703, 704];
const notes = () => native() && window.Capacitor.Plugins && window.Capacitor.Plugins.LocalNotifications;

function reminderText(date, k) {
  const ev = eventOn(date);
  if (ev && ev.gift && k <= 1 && !save.events[ev.id + "-" + calendarParts(date, "persian").y]) {
    return { title: ev.greet, body: `${ev.giftName}ت توی «کلمه» منتظرته 🎁` };
  }
  if (ev) return { title: "«کلمه»", body: ev.note + " آماده‌ست" };
  const run = save.stats.dayRun;
  if (k === 1 && run >= 2) return { title: `🔥 ${faDigits(run)} روز پشت سر هم`, body: "امروز هم بیا تا جایزه‌ی روزانه‌ات بیشتر بشه" };
  const lines = [
    { title: "جایزه‌ی روزانه‌ات آماده‌ست 🎁", body: "یه سر به «کلمه» بزن و سکه‌ات رو بگیر" },
    { title: "مرحله‌ی روزانه‌ی امروز", body: "همه امروز همین مرحله رو حل می‌کنن؛ تو چقدر سریعی؟" },
    { title: "«کلمه» منتظرته", body: "چند تا کلمه‌ی تازه پیدا کن و استراحت کن" },
  ];
  return lines[(dayNumber(date) + k) % lines.length];
}

async function planReminders() {
  const plugin = notes();
  if (!plugin) return;
  try {
    await plugin.cancel({ notifications: REMIND_IDS.map((id) => ({ id })) });
    if (!settings.reminders) return;
    const perm = await plugin.checkPermissions();
    if (perm.display !== "granted") return;
    const now = nowDate();
    const list = [];
    for (let k = 0; k < REMIND_IDS.length; k++) {
      const at = new Date(now.getFullYear(), now.getMonth(), now.getDate() + k, REMIND_HOUR, 0, 0);
      if (at <= now) continue;
      if (k === 0 && !rewardDue() && dailySolved()) continue; // امروز کاری نمانده
      list.push({ id: REMIND_IDS[k], ...reminderText(at, k), schedule: { at, allowWhileIdle: true } });
    }
    if (list.length) await plugin.schedule({ notifications: list });
  } catch {
    // اعلان کار نکرد؛ بازی بدون آن هم کار می‌کند
  }
}

// اجازه‌ی اعلان: بار اولی که جایزه‌ی روزانه گرفته می‌شود، یا وقتی بازیکن در تنظیمات روشنش می‌کند
async function askReminders(force) {
  const plugin = notes();
  if (!plugin || (!force && settings.askedNotes)) return planReminders();
  settings.askedNotes = true;
  saveSettings();
  try {
    const perm = await plugin.checkPermissions();
    if (perm.display === "prompt" || perm.display === "prompt-with-rationale") await plugin.requestPermissions();
  } catch {}
  planReminders();
}

function setupDaily() {
  $("dailyBtn").addEventListener("click", playDaily);
  const sw = $("setReminders");
  // در مرورگر اعلان نداریم
  sw.closest(".setting").classList.toggle("hidden", !notes());
  sw.addEventListener("change", (e) => {
    settings.reminders = e.target.checked;
    saveSettings();
    if (settings.reminders) askReminders(true);
    else planReminders();
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) planReminders();
  });
}

setupDaily();
