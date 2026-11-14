"use strict";

// بخش‌های تازه‌ی بازی، بعد از extras.js بارگذاری می‌شود:
// ۱. درخواست امتیاز در کافه‌بازار یا مایکت  ۲. قلک سکه  ۳. بسته‌ی شروع  ۴. محافظ رکورد روزانه
// ۵. کلمه‌ی روز  ۶. کارت‌پستال فصل‌ها  ۷. حالت سرعتی
// داده‌ها در save.x ذخیره می‌شوند (مثل extras.js).

// «۱:۲۴»
function clock(secs) {
  const s = Math.max(0, Math.round(secs));
  return faDigits(`${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`);
}

function daysAgoKey(n) {
  const d = nowDate();
  d.setDate(d.getDate() - n);
  return dateKey(d);
}

// خرید یک محصول از هر جای بازی (نه فقط فروشگاه)
function buyProduct(id, el) {
  if (shopBusy || !store || !store.ready) {
    toast(store && store.reason ? store.reason : "خرید الان ممکن نیست.");
    return;
  }
  shopBusy = true;
  if (el) el.classList.add("busy");
  nativeStore.buy({ id })
    .then((purchase) => deliver(purchase, el))
    .catch((err) => {
      if (err && err.code === "CANCELED") return;
      if (err && err.code === "ALREADY_OWNED") return deliverPending();
      toast((err && err.message) || "خرید انجام نشد. دوباره امتحان کن.");
    })
    .finally(() => {
      shopBusy = false;
      if (el) el.classList.remove("busy");
    });
}

const storeLabel = () => (store && store.storeName) || "فروشگاه";
const priceOf = (id) => (shopPrices[id] ? faDigits(shopPrices[id]) : "خرید");

const PIGGY_ICON = `<svg class="piggy-icon" viewBox="0 0 48 40" aria-hidden="true"><path d="M8 20c0-8 7-13 16-13 4 0 7 .8 10 2.4L39 6l-.6 6.4c2 1.7 3.4 3.8 3.9 6.1H45v6h-3c-1 2.7-3 5-5.6 6.5V36h-6v-3c-1 .2-2.3.3-3.4.3H24c-1.2 0-2.4-.1-3.5-.3v3h-6v-5C10.4 28.4 8 24.5 8 20Z" fill="#f2a0b4" stroke="#b9566f" stroke-width="2" stroke-linejoin="round"/><circle cx="33" cy="17" r="1.8" fill="#6b2a3a"/><path d="M19 11.5h8" stroke="#b9566f" stroke-width="2.4" stroke-linecap="round"/><path d="M8.5 19C5 19 3 17 3.5 14" fill="none" stroke="#b9566f" stroke-width="2" stroke-linecap="round"/></svg>`;

// ---------------------------------------------------------------------------
// ۱. درخواست امتیاز: بعد از مرحله‌ی ۱۵ (وقتی بازیکن تازه یک مرحله را برده)، حداکثر ۳ بار
// ---------------------------------------------------------------------------
// قانون فروشگاه‌ها: برای امتیاز دادن جایزه نمی‌دهیم.

const RATE_FIRST = 15; // اولین بار بعد از این مرحله
const RATE_AGAIN = 30; // «بعداً» = بعد از این تعداد مرحله‌ی دیگر
const RATE_TIMES = 3;

const rateSheet = makeSheet("rateSheet", `
  <div class="rate-stars" aria-hidden="true">★★★★★</div>
  <div class="card-title">از «کلمه» خوشت میاد؟</div>
  <div class="card-text" id="rateText"></div>
  <button class="card-btn" type="button" id="rateYes">آره، امتیاز می‌دم</button>
  <button class="card-link" type="button" id="rateLater">بعداً</button>
  <button class="card-link" type="button" id="rateNo">نه، ممنون</button>`);

function rateState() {
  X().rate = X().rate || { asked: 0, next: RATE_FIRST, done: false };
  return X().rate;
}

// کارت دیگری (مثل مصراع پایان فصل یا صندوق) باز است؟
const sheetOpen = () => !!document.querySelector(".x-sheet:not(.hidden), #chestSheet:not(.hidden)");

function maybeAskRate(level) {
  const r = rateState();
  // پایان فصل کارت مصراع و کارت‌پستال دارد؛ آن موقع نمی‌پرسیم
  if (!nativeStore || r.done || r.asked >= RATE_TIMES || save.unlocked < r.next || endsChapter(level)) return false;
  r.asked++;
  r.next = save.unlocked + RATE_AGAIN;
  persist();
  setTimeout(() => {
    if (screenNow !== "play" || sheetOpen()) return;
    $("rateText").textContent = `اگه دوستش داری، با یه امتیاز و نظر توی ${storeLabel()} کمک کن بیشتر دیده بشه. 🙏`;
    rateSheet.classList.remove("hidden");
  }, 1600);
  return true;
}

$("rateYes").onclick = () => {
  rateState().done = true;
  persist();
  rateSheet.classList.add("hidden");
  nativeStore.rate().catch(() => openLink(SHARE_URL));
};
$("rateLater").onclick = () => rateSheet.classList.add("hidden");
$("rateNo").onclick = () => {
  rateState().done = true;
  persist();
  rateSheet.classList.add("hidden");
};

// ---------------------------------------------------------------------------
// ۲. قلک: با هر مرحله‌ی تازه چند سکه در قلک جمع می‌شود و با یک خرید شکسته می‌شود
// ---------------------------------------------------------------------------
// در پنل فروشگاه: شناسه‌ی piggy_bank، از نوع «مصرف‌شدنی».

const PIGGY_ID = "piggy_bank";
const PIGGY_STEP = 5;   // سکه‌ی هر مرحله‌ی تازه
const PIGGY_MIN = 150;  // از این مقدار به بعد شکستنی است
const PIGGY_MAX = 400;  // قلک پر

const piggy = () => X().piggy || 0;

function piggyAdd() {
  if (piggy() >= PIGGY_MAX) return false;
  X().piggy = Math.min(PIGGY_MAX, piggy() + PIGGY_STEP);
  persist();
  return true;
}

// زیر جایزه‌ی پایان مرحله: «+۵ به قلک»
function piggyNote() {
  if (!nativeStore) return;
  const card = document.querySelector("#overlay .card");
  const el = document.createElement("button");
  el.type = "button";
  el.className = "extra piggy-note" + (piggy() >= PIGGY_MAX ? " full" : "");
  el.innerHTML = PIGGY_ICON + "<span></span>";
  el.querySelector("span").textContent = piggy() >= PIGGY_MAX
    ? `قلکت پر شده! ${faDigits(piggy())} سکه`
    : `+${faDigits(PIGGY_STEP)} به قلک · ${faDigits(piggy())} سکه`;
  el.onclick = () => openShop();
  const reward = $("overlayReward");
  (reward.classList.contains("hidden") ? $("overlayText") : reward).after(el);
}

function piggyItem() {
  const item = document.createElement("div");
  item.className = "ach shop-pack piggy-pack" + (piggy() >= PIGGY_MAX ? " full" : "");
  const ready = piggy() >= PIGGY_MIN;
  item.innerHTML = `
    <div class="ach-icon">${PIGGY_ICON}</div>
    <div class="ach-body">
      <div class="ach-name">قلک سکه</div>
      <div class="ach-text"></div>
      <div class="ach-bar"><span></span></div>
    </div>
    <button class="ach-btn" type="button"></button>`;
  item.querySelector(".ach-text").textContent = ready
    ? `${faDigits(piggy())} سکه توش جمع شده`
    : `هر مرحله ${faDigits(PIGGY_STEP)} سکه · از ${faDigits(PIGGY_MIN)} سکه باز می‌شه`;
  item.querySelector(".ach-bar span").style.width = (piggy() / PIGGY_MAX) * 100 + "%";
  const btn = item.querySelector(".ach-btn");
  btn.textContent = ready ? priceOf(PIGGY_ID) : `${faDigits(piggy())}/${faDigits(PIGGY_MAX)}`;
  btn.disabled = !ready || !store || !store.ready;
  btn.onclick = () => buyProduct(PIGGY_ID, item.querySelector(".ach-icon"));
  return item;
}

function deliverPiggy(purchase, fromEl) {
  if (!purchase.token) return;
  if (!save.paid.includes(purchase.token)) {
    const n = Math.max(piggy(), PIGGY_MIN);
    save.coins += n;
    X().piggy = 0;
    save.paid.push(purchase.token);
    if (save.paid.length > 100) save.paid.shift();
    persist();
    sound("reward");
    if (fromEl) flyCoins(n, fromEl.getBoundingClientRect(), visibleCoins());
    else updateCoins();
    toast(`قلک شکست! ${faDigits(n)} سکه گرفتی 🎉`, "gold");
    if (screenNow === "shop") renderShop();
  }
  nativeStore.consume({ token: purchase.token }).catch(() => {});
}

// ---------------------------------------------------------------------------
// ۳. بسته‌ی شروع: یک بار، ارزان، سکه + راهنمای رایگان + ظاهر «حوض و باغ»
// ---------------------------------------------------------------------------
// در پنل فروشگاه: شناسه‌ی starter_pack، از نوع «غیرمصرفی» (یک بار خریده می‌شود).

const STARTER_ID = "starter_pack";
const STARTER_COINS = 300;
const STARTER_HINTS = 5;
const STARTER_LOOK = "garden";
const STARTER_AT = 6; // بعد از این مرحله یک بار خودش پیشنهاد می‌شود

const starterSheet = makeSheet("starterSheet", `
  <div class="starter-ribbon">فقط یک بار</div>
  <div class="card-title">بسته‌ی شروع</div>
  <div class="starter-list">
    <div><span class="coin-icon"></span><b>${faDigits(STARTER_COINS)} سکه</b></div>
    <div><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/></svg><b>${faDigits(STARTER_HINTS)} راهنمای رایگان</b></div>
    <div><span class="starter-look"></span><b>ظاهر «حوض و باغ»</b></div>
  </div>
  <button class="card-btn" type="button" id="starterBuy"></button>
  <button class="card-link" type="button" data-close>بعداً (توی فروشگاه هست)</button>`);
starterSheet.querySelector("[data-close]").onclick = () => starterSheet.classList.add("hidden");
$("starterBuy").onclick = () => buyProduct(STARTER_ID, $("starterBuy"));

const starterOpen = () => !X().starter && store && store.ready;

function openStarter() {
  $("starterBuy").textContent = shopPrices[STARTER_ID] ? `خرید · ${priceOf(STARTER_ID)}` : "خرید";
  starterSheet.classList.remove("hidden");
}

function maybeOfferStarter(level) {
  if (!starterOpen() || X().starterShown || save.unlocked < STARTER_AT || endsChapter(level)) return false;
  X().starterShown = true;
  persist();
  setTimeout(() => {
    if (screenNow === "play" && starterOpen() && !sheetOpen()) openStarter();
  }, 1600);
  return true;
}

function starterItem() {
  const item = document.createElement("div");
  item.className = "ach shop-pack starter-pack";
  item.innerHTML = `
    <div class="ach-icon"><span class="coin-icon"></span><span class="starter-look"></span></div>
    <div class="ach-body">
      <div class="ach-name">بسته‌ی شروع <span class="shop-tag">فقط یک بار</span></div>
      <div class="ach-text"></div>
    </div>
    <button class="ach-btn" type="button"></button>`;
  item.querySelector(".ach-text").textContent = `${faDigits(STARTER_COINS)} سکه + ${faDigits(STARTER_HINTS)} راهنما + ظاهر «حوض و باغ»`;
  const btn = item.querySelector(".ach-btn");
  btn.textContent = priceOf(STARTER_ID);
  btn.disabled = !store || !store.ready;
  btn.onclick = () => buyProduct(STARTER_ID, item.querySelector(".ach-icon"));
  return item;
}

function deliverStarter(fromEl) {
  if (X().starter) return;
  X().starter = true;
  let coins = STARTER_COINS;
  if (save.owned.includes(STARTER_LOOK)) coins += 150; // ظاهر را قبلاً داشت
  else save.owned.push(STARTER_LOOK);
  save.coins += coins;
  X().freeHints = (X().freeHints || 0) + STARTER_HINTS;
  persist();
  sound("reward");
  starterSheet.classList.add("hidden");
  if (fromEl) flyCoins(coins, fromEl.getBoundingClientRect(), visibleCoins());
  else updateCoins();
  refreshFreeHints();
  toast("بسته‌ی شروع مال تو شد! ظاهر «حوض و باغ» هم باز شد 🌸", "gold");
  if (screenNow === "shop") renderShop();
  if (screenNow === "themes") renderThemes();
}

moreProducts.push(PIGGY_ID, STARTER_ID);

// از deliver در game.js صدا زده می‌شود؛ true یعنی این خرید مال این فایل بود
function deliverMore(purchase, fromEl) {
  if (purchase.id === PIGGY_ID) {
    deliverPiggy(purchase, fromEl);
    return true;
  }
  if (purchase.id === STARTER_ID) {
    deliverStarter(fromEl);
    return true;
  }
  return false;
}

// ---------------------------------------------------------------------------
// ۴. محافظ رکورد: اگر فقط دیروز نیامده، با سکه رکورد روزهای پشت سر هم را نجات می‌دهد
// ---------------------------------------------------------------------------

const STREAK_SAVE_COST = 40;

const streakSheet = makeSheet("streakSheet", `
  <div class="streak-fire" aria-hidden="true">🔥</div>
  <div class="card-title" id="streakTitle"></div>
  <div class="card-text" id="streakText"></div>
  <button class="card-btn" type="button" id="streakYes"></button>
  <button class="card-link" type="button" id="streakNo">نه، از اول شروع می‌کنم</button>`);

// از showDailyReward در game.js صدا زده می‌شود؛ true یعنی اول این کارت نشان داده شد
function offerStreakSave() {
  const run = save.stats.dayRun;
  if (save.daily.last !== daysAgoKey(2) || run < 2 || X().streakAsk === todayKey()) return false;
  X().streakAsk = todayKey();
  persist();
  $("streakTitle").textContent = `رکورد ${faDigits(run)} روزه‌ات داره می‌سوزه!`;
  $("streakText").textContent = "دیروز نیومدی. می‌تونی با سکه نجاتش بدی تا جایزه‌ی روزانه‌ات از روز اول شروع نشه.";
  const btn = $("streakYes");
  const can = save.coins >= STREAK_SAVE_COST;
  btn.disabled = !can;
  btn.innerHTML = can
    ? `نجاتش بده · ${faDigits(STREAK_SAVE_COST)} <span class="coin-icon"></span>`
    : `${faDigits(STREAK_SAVE_COST)} سکه لازم داری`;
  streakSheet.classList.remove("hidden");
  return true;
}

function streakDone() {
  streakSheet.classList.add("hidden");
  if (screenNow === "home" && rewardDue()) showDailyReward();
}

$("streakYes").onclick = () => {
  if (save.coins < STREAK_SAVE_COST) return;
  save.coins -= STREAK_SAVE_COST;
  save.daily.last = yesterdayKey(); // انگار دیروز آمده بود
  persist();
  updateCoins();
  sound("reward");
  toast(`رکوردت نجات پیدا کرد! 🔥 ${faDigits(save.stats.dayRun)} روز`, "gold");
  streakDone();
};
$("streakNo").onclick = streakDone;
streakSheet.addEventListener("click", (e) => {
  if (e.target === streakSheet) streakDone();
});

// ---------------------------------------------------------------------------
// ۵. کلمه‌ی روز: هر روز یک کلمه‌ی کمتر شنیده با معنی‌اش (در منو و در اعلان ظهر)
// ---------------------------------------------------------------------------

const WORD_DAY_COINS = 5;
let wordPool = null;

function wordOfDay(date) {
  if (!wordPool) {
    if (!dict.size) return null;
    const pool = [...dict.entries()].filter(([w, m]) => m && w.length >= 3 && (wordLevels.get(w) || 1) > 1);
    wordPool = pool.length ? pool : [...dict.entries()].filter(([w, m]) => m && w.length >= 3);
  }
  if (!wordPool.length) return null;
  const [word, meaning] = wordPool[Math.floor(seededRandom(dayNumber(date) * 31 + 7)() * wordPool.length)];
  return { word, meaning };
}

// متن اعلان ظهر (daily.js): کلمه‌ی روز + یادآوری گردونه
function wordNote(date) {
  const w = wordOfDay(date);
  if (!w) return null;
  const meaning = w.meaning.length > 70 ? w.meaning.slice(0, 68) + "…" : w.meaning;
  return { title: `کلمه‌ی امروز: «${w.word}» 📖`, body: `یعنی ${meaning}. راستی گردونه‌ت هم منتظره 🎡` };
}

const wordSheet = makeSheet("wordSheet", `
  <div class="card-text word-day-head">کلمه‌ی روز</div>
  <div class="word-day-word" id="wordDayWord"></div>
  <div class="card-text word-day-meaning" id="wordDayMeaning"></div>
  <div class="card-text word-day-reward" id="wordDayReward"></div>
  <button class="card-btn" type="button" data-close>یاد گرفتم</button>`);
wordSheet.querySelector("[data-close]").onclick = () => wordSheet.classList.add("hidden");

const wordBtn = document.createElement("button");
wordBtn.type = "button";
wordBtn.className = "word-day hidden";
wordBtn.id = "wordDayBtn";
// لقب و کلمه‌ی روز در یک ردیف
const homeChips = document.createElement("div");
homeChips.className = "home-chips";
$("rankChip").before(homeChips);
homeChips.append($("rankChip"), wordBtn);

function renderWordDay() {
  const w = wordOfDay(nowDate());
  wordBtn.classList.toggle("hidden", !w);
  if (!w) return;
  wordBtn.innerHTML = `<span>کلمه‌ی روز</span> <b></b>` + (X().wordDay === todayKey() ? "" : `<i class="dot"></i>`);
  wordBtn.querySelector("b").textContent = w.word;
}

wordBtn.onclick = () => {
  const w = wordOfDay(nowDate());
  if (!w) return;
  $("wordDayWord").textContent = w.word;
  $("wordDayMeaning").textContent = w.meaning;
  const first = X().wordDay !== todayKey();
  $("wordDayReward").textContent = first ? `+${faDigits(WORD_DAY_COINS)} سکه برای یاد گرفتن` : "فردا یه کلمه‌ی تازه";
  wordSheet.classList.remove("hidden");
  if (first) {
    X().wordDay = todayKey();
    setTimeout(() => giveCoins(WORD_DAY_COINS, $("wordDayReward")), 400);
    renderWordDay();
  }
};

// ---------------------------------------------------------------------------
// ۶. کارت‌پستال فصل‌ها: با تمام شدن هر فصل، منظره‌اش به آلبوم اضافه می‌شود و می‌شود فرستادش
// ---------------------------------------------------------------------------

const cardsDone = () => Math.min(CHAPTERS.length, Math.floor(save.unlocked / CHAPTER_SIZE));

const albumSheet = makeSheet("albumSheet", `
  <div class="card-title">آلبوم کارت‌پستال‌ها</div>
  <div class="card-text" id="albumText"></div>
  <div class="album-grid" id="albumGrid"></div>
  <button class="card-link" type="button" data-close>بستن</button>`);
albumSheet.querySelector("[data-close]").onclick = () => albumSheet.classList.add("hidden");

const postcardSheet = makeSheet("postcardSheet", `
  <div class="postcard" id="postcardView"></div>
  <button class="card-btn" type="button" id="postcardShare">فرستادن کارت‌پستال</button>
  <button class="card-link" type="button" data-close>بستن</button>`);
postcardSheet.querySelector("[data-close]").onclick = () => postcardSheet.classList.add("hidden");

// دکمه‌ی آلبوم کنار بقیه‌ی ابزارهای منو
const albumBtn = document.createElement("button");
albumBtn.type = "button";
albumBtn.className = "icon-btn";
albumBtn.id = "albumBtn";
albumBtn.setAttribute("aria-label", "آلبوم کارت‌پستال‌ها");
albumBtn.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M3.5 16l5-5 4 4 3-3 5 5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><circle cx="16.5" cy="9" r="1.6" fill="currentColor"/></svg><span class="badge dot hidden" id="albumBadge"></span>`;
$("bookBtn").after(albumBtn);

function updateAlbumBadge() {
  $("albumBadge").classList.toggle("hidden", cardsDone() <= (X().cardsSeen || 0));
}

function openAlbum() {
  const done = cardsDone();
  X().cardsSeen = done;
  persist();
  updateAlbumBadge();
  $("albumText").textContent = done
    ? `${faDigits(done)} از ${faDigits(CHAPTERS.length)} کارت · با تموم کردن هر فصل، یه کارت تازه`
    : "با تموم کردن هر فصل، کارت‌پستال منظره‌اش اینجا میاد";
  const grid = $("albumGrid");
  grid.replaceChildren();
  CHAPTERS.forEach((info, c) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "album-card" + (c < done ? "" : " locked");
    card.innerHTML = c < done
      ? chapterScene(c) + `<span></span>`
      : `<div class="album-lock"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2" fill="currentColor"/><path d="M8 11V8a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" stroke-width="2"/></svg></div><span></span>`;
    card.querySelector("span").textContent = c < done ? info.name : `فصل ${faDigits(c + 1)}`;
    if (c < done) card.onclick = () => openPostcard(c);
    else card.disabled = true;
    grid.appendChild(card);
  });
  albumSheet.classList.remove("hidden");
}

let postcardNow = 0;

function openPostcard(c) {
  postcardNow = c;
  const view = $("postcardView");
  view.innerHTML = chapterScene(c) + `<div class="postcard-text"><small></small><b></b></div><span class="postcard-stamp">کلمه</span>`;
  view.querySelector("small").textContent = `فصل ${faDigits(c + 1)}`;
  view.querySelector("b").textContent = chapterInfo(c).name;
  postcardSheet.classList.remove("hidden");
}

// تصویر کارت‌پستال (PNG، ۱۲۰۰×۸۰۰) برای فرستادن
async function postcardImage(c) {
  const W = 1200, H = 800, PAD = 40, SW = W - PAD * 2, SH = Math.round(SW * SCENE_H / SCENE_W);
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const g = canvas.getContext("2d");
  g.fillStyle = "#fbf6ec";
  g.fillRect(0, 0, W, H);
  // منظره
  const svg = chapterScene(c).replace("<svg ", `<svg xmlns="http://www.w3.org/2000/svg" width="${SW}" height="${SH}" `);
  const img = new Image();
  await new Promise((ok, fail) => {
    img.onload = ok;
    img.onerror = fail;
    img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  });
  g.save();
  g.beginPath();
  g.roundRect(PAD, PAD, SW, SH, 24);
  g.clip();
  g.drawImage(img, PAD, PAD, SW, SH);
  g.restore();
  // حاشیه‌ی دندانه‌دار تمبر
  g.strokeStyle = "#d9c9a8";
  g.setLineDash([10, 8]);
  g.lineWidth = 3;
  g.strokeRect(16, 16, W - 32, H - 32);
  g.setLineDash([]);
  // نوشته‌ها
  try {
    await document.fonts.load("64px Lalezar");
    await document.fonts.load("30px Vazirmatn");
  } catch {}
  g.direction = "rtl";
  g.textAlign = "center";
  const textTop = PAD + SH;
  g.fillStyle = "#8a7a5c";
  g.font = "30px Vazirmatn, sans-serif";
  g.fillText(`فصل ${faDigits(c + 1)} از سفر «کلمه»`, W / 2, textTop + 70);
  g.fillStyle = "#3b3326";
  g.font = "84px Lalezar, sans-serif";
  g.fillText(chapterInfo(c).name, W / 2, textTop + 170);
  g.fillStyle = "#8a7a5c";
  g.font = "26px Vazirmatn, sans-serif";
  g.fillText(`بازی «کلمه» در ${storeLabel()}`, W / 2, H - 50);
  return canvas.toDataURL("image/png");
}

async function sharePostcard() {
  const c = postcardNow;
  const text = `کارت‌پستال «${chapterInfo(c).name}» رو توی بازی «کلمه» گرفتم! 🏞️`;
  let url;
  try {
    url = await postcardImage(c);
  } catch {
    return shareMore(text);
  }
  const P = window.Capacitor && window.Capacitor.Plugins;
  if (native() && P && P.Filesystem && P.Share) {
    try {
      const file = await P.Filesystem.writeFile({ path: `kalameh-postcard-${c + 1}.png`, data: url.split(",")[1], directory: "CACHE" });
      await P.Share.share({ title: "کارت‌پستال «کلمه»", text: text + "\n" + SHARE_URL, files: [file.uri], dialogTitle: "فرستادن کارت‌پستال" });
      return;
    } catch {
      return; // بازیکن پنجره را بست
    }
  }
  try {
    const blob = await (await fetch(url)).blob();
    const file = new File([blob], `kalameh-postcard-${c + 1}.png`, { type: "image/png" });
    if (navigator.canShare && navigator.canShare({ files: [file] })) return await navigator.share({ files: [file], text });
  } catch {
    return;
  }
  // مرورگر: ذخیره‌ی تصویر
  const a = document.createElement("a");
  a.href = url;
  a.download = `kalameh-postcard-${c + 1}.png`;
  a.click();
}

albumBtn.onclick = openAlbum;
$("postcardShare").onclick = sharePostcard;

// ---------------------------------------------------------------------------
// ۷. حالت سرعتی
// ---------------------------------------------------------------------------
// از همان صفحه‌ی بازی استفاده می‌کند، با playKey جدا (s:)، و پیشرفت مرحله‌ها را عوض نمی‌کند.

const SPEED_PREFIX = "s:";
const isSpeed = () => typeof playKey === "string" && playKey.startsWith(SPEED_PREFIX);
function isMode() {
  return isSpeed();
}

const SPEED_TIME = 60;        // ثانیه
const SPEED_BONUS_TIME = 10;  // ثانیه‌ی اضافه برای کامل کردن هر جدول
const SPEED_BASE = 3000;      // مرحله‌های حالت سرعتی از اینجا به بعد ساخته می‌شوند (۷ حرفی)
const SPEED_MAX_COINS = 30;   // جایزه‌ی بار اول هر روز

let speed = null;     // { score, words, end, round, seed }
let modeTimer = 0;

// نوار زمان و امتیاز بالای جدول
const modeBar = document.createElement("div");
modeBar.className = "mode-bar hidden";
modeBar.innerHTML = `<span class="mode-time"></span><span class="mode-score"></span>`;
document.querySelector(".board-area").appendChild(modeBar);

function clearModeSaves() {
  for (const k of Object.keys(save.partial)) {
    if (k.startsWith(SPEED_PREFIX) || k.startsWith("c:")) delete save.partial[k]; // c: چالش‌های نسخه‌ی قبل
  }
}

function stopModes() {
  clearInterval(modeTimer);
  modeTimer = 0;
  speed = null;
  modeBar.classList.add("hidden");
  $("app").classList.remove("mode-speed");
  clearModeSaves();
}

function startTicker() {
  clearInterval(modeTimer);
  modeTimer = setInterval(tickMode, 200);
  tickMode();
}

function tickMode() {
  // بازیکن از صفحه‌ی بازی بیرون رفت: حالت تمام می‌شود
  // (location.hash، چون route بعد از تغییر hash و کمی دیرتر صدا زده می‌شود)
  if (location.hash !== "#play" || !isSpeed() || !speed) return stopModes();
  if (locked) return;
  const now = Date.now();
  const left = (speed.end - now) / 1000;
  modeBar.querySelector(".mode-time").textContent = "⏱ " + clock(Math.ceil(left));
  modeBar.querySelector(".mode-score").textContent = `امتیاز ${faDigits(speed.score)}`;
  modeBar.classList.toggle("hurry", left <= 10);
  if (left <= 0) endSpeed();
}

// ---------- حالت سرعتی ----------

const speedSheet = makeSheet("speedSheet", `
  <div class="card-title" id="speedTitle"></div>
  <div class="speed-score" id="speedScore"></div>
  <div class="card-text" id="speedText"></div>
  <div class="card-text speed-reward" id="speedReward"></div>
  <button class="card-btn" type="button" id="speedAgain">دوباره</button>
  <button class="card-link" type="button" id="speedShare">فرستادن رکورد</button>
  <button class="card-link" type="button" id="speedHome">منو</button>`);

function startSpeed() {
  if (!generator) return;
  speedSheet.classList.add("hidden");
  stopModes();
  clearModeSaves();
  speed = { score: 0, words: 0, end: 0, round: 0, seed: Math.floor(Math.random() * 4000) };
  speedRound();
  open("play");
  speed.end = Date.now() + SPEED_TIME * 1000;
  modeBar.classList.remove("hidden");
  startTicker();
}

function speedRound() {
  const i = SPEED_BASE + speed.seed + speed.round * 17;
  startPuzzle(levelAt(i), i, SPEED_PREFIX + i);
}

function speedScored(word) {
  if (!speed || locked) return;
  const n = word.length;
  speed.score += n;
  speed.words++;
  const pop = document.createElement("span");
  pop.className = "mode-pop";
  pop.textContent = "+" + faDigits(n);
  modeBar.appendChild(pop);
  setTimeout(() => pop.remove(), 900);
  tickMode();
}

// جدول کامل شد: ثانیه‌ی اضافه و جدول بعدی
function speedNext() {
  locked = true;
  delete save.partial[playKey];
  speed.end += SPEED_BONUS_TIME * 1000;
  speed.round++;
  toast(`جدول کامل شد! ${faDigits(SPEED_BONUS_TIME)}+ ثانیه ⏱`, "gold");
  setTimeout(() => {
    if (speed && screenNow === "play") speedRound();
  }, 700);
}

function endSpeed() {
  locked = true;
  clearInterval(modeTimer);
  modeTimer = 0;
  const { score, words } = speed;
  const best = X().speedBest || 0;
  const record = score > best;
  if (record) X().speedBest = score;
  let coins = 0;
  if (X().speedDay !== todayKey() && score > 0) {
    coins = Math.min(SPEED_MAX_COINS, Math.ceil(score / 3));
    X().speedDay = todayKey();
  }
  delete save.partial[playKey];
  persist();
  sound(record ? "reward" : "complete");
  modeBar.querySelector(".mode-time").textContent = "⏱ " + clock(0);
  $("speedTitle").textContent = record && best ? "رکورد تازه! 🏆" : "وقت تموم شد!";
  $("speedScore").textContent = faDigits(score);
  $("speedText").textContent = `${faDigits(words)} کلمه در ${faDigits(SPEED_TIME)} ثانیه` + (record ? "" : ` · رکوردت ${faDigits(best)}`);
  $("speedReward").textContent = coins ? `+${faDigits(coins)} سکه (جایزه‌ی امروز)` : "جایزه‌ی سکه روزی یک باره";
  speedSheet.classList.remove("hidden");
  if (coins) setTimeout(() => giveCoins(coins, $("speedReward")), 400);
  if (record && score) {
    const c = centerOfEl($("speedScore"));
    sparkle(c.x, c.y, 18);
  }
  speedSheet.dataset.score = score;
}

$("speedAgain").onclick = startSpeed;
$("speedHome").onclick = () => {
  speedSheet.classList.add("hidden");
  stopModes();
  goHome();
};
$("speedShare").onclick = () => {
  const score = faDigits(speedSheet.dataset.score || 0);
  shareMore(`«کلمه» · حالت سرعتی ⏱\nتوی ${faDigits(SPEED_TIME)} ثانیه ${score} امتیاز گرفتم! تو چند می‌گیری؟`);
};

// از finishLevel در game.js صدا زده می‌شود؛ true یعنی پایان مرحله را این فایل گرفت
function finishMode(hinted) {
  if (isSpeed() && speed) {
    speedNext();
    return true;
  }
  return false;
}

// دکمه‌های منو
// «حالت سرعتی» کنار «مرحله‌ها»
const speedBtn = document.createElement("button");
speedBtn.className = "menu-btn";
speedBtn.id = "speedBtn";
speedBtn.type = "button";
speedBtn.innerHTML = `حالت سرعتی<small id="speedSub"></small>`;
$("levelsBtn").after(speedBtn);
speedBtn.onclick = startSpeed;

function renderModeBtns() {
  $("speedBtn").disabled = !generator;
  const best = X().speedBest || 0;
  $("speedSub").textContent = best ? `رکورد ${faDigits(best)}` : `${faDigits(SPEED_TIME)} ثانیه`;
}

// ---------------------------------------------------------------------------
// اتصال به رویدادهای بازی
// ---------------------------------------------------------------------------

gameHooks.push((name, d) => {
  switch (name) {
    case "level":
      $("app").classList.toggle("mode-speed", isSpeed());
      if (isSpeed()) $("levelLabel").textContent = "حالت سرعتی" + (speed && speed.round ? ` · جدول ${faDigits(speed.round + 1)}` : "");
      else if (speed) stopModes();
      break;
    case "found":
    case "bonus":
      if (isSpeed()) speedScored(d.word);
      break;
    case "complete":
      if (d.daily) break;
      if (d.first) piggyAdd();
      if (d.first) piggyNote();
      if (d.first && endsChapter(d.level)) {
        setTimeout(() => toast(`کارت‌پستال «${chapterInfo(chapterOf(d.level)).name}» به آلبومت اضافه شد 🏞️`, "gold"), 1200);
      }
      if (d.first) maybeAskRate(d.level) || maybeOfferStarter(d.level);
      break;
    case "shop": {
      if (!store) break;
      const items = [];
      if (!X().starter) items.push(starterItem());
      items.push(piggyItem());
      d.list.prepend(...items);
      break;
    }
    case "home":
      renderWordDay();
      renderModeBtns();
      updateAlbumBadge();
      break;
  }
});

// کلمه‌ها کمی بعد از باز شدن منو خوانده می‌شوند؛ کلمه‌ی روز بعد از آن دوباره نشان داده می‌شود
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    if (screenNow === "home") {
      renderWordDay();
      renderModeBtns();
    }
  }, 2500);
});

// ---------------------------------------------------------------------------
// دکمه‌ی «برگشت» گوشی (MainActivity.java صدا می‌زند)
// ---------------------------------------------------------------------------
// از هر جای بازی یک‌راست به منوی اصلی برمی‌گردد. در منوی اصلی اول کارت باز را می‌بندد؛
// اگر چیزی باز نبود "home" برمی‌گرداند تا اندروید با دو بار زدن از بازی بیرون برود.

function closeAllSheets() {
  let closed = false;
  for (const el of document.querySelectorAll(".sheet:not(.hidden)")) {
    el.classList.add("hidden");
    closed = true;
  }
  return closed;
}

window.kalamehBack = () => {
  const atHome = screenNow === "home" || (screenNow === "themes" && !save.theme);
  if (atHome) return closeAllSheets() ? "closed" : "home";
  closeAllSheets();
  hideMeanings();
  hideLevelSheet();
  hideChest();
  hideThemeSheet();
  if (save.theme) {
    history.replaceState(null, "", location.pathname + location.search);
    route();
  }
  return "back";
};
