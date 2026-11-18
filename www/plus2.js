"use strict";

// بخش‌های تازه‌تر، بعد از plus.js بارگذاری می‌شود:
// ۱. راهنمای «معنی»: معنی یک کلمه‌ی پیدانشده، نه خودش
// ۲. پشتیبان‌گیری از پیشرفت با یک کد (بدون سرور)
// ۳. آمار من، با کارت تصویری برای فرستادن
// ۴. بازی دونفره روی یک گوشی
// ۵. فال حافظ روزانه
// (جمعه‌ی ویژه در daily.js است)

// پنجره‌ای که با زدن بیرونش بسته نمی‌شود (برای کارت‌هایی که وسط بازی می‌آیند)
function fixedSheet(id, inner, extraClass = "") {
  const sheet = document.createElement("div");
  sheet.className = "sheet center hidden " + extraClass;
  sheet.id = id;
  sheet.setAttribute("role", "dialog");
  sheet.setAttribute("aria-modal", "true");
  sheet.innerHTML = `<div class="card sheet-card level-card">${inner}</div>`;
  document.body.appendChild(sheet);
  return sheet;
}

// تصویر PNG (data URL) را با پنجره‌ی اشتراک گوشی می‌فرستد؛ در مرورگر ذخیره‌اش می‌کند
async function sharePng(url, name, text, title) {
  const P = window.Capacitor && window.Capacitor.Plugins;
  if (native() && P && P.Filesystem && P.Share) {
    try {
      const file = await P.Filesystem.writeFile({ path: name, data: url.split(",")[1], directory: "CACHE" });
      await P.Share.share({ title, text: text + "\n" + SHARE_URL, files: [file.uri], dialogTitle: title });
    } catch {
      // بازیکن پنجره را بست
    }
    return;
  }
  try {
    const blob = await (await fetch(url)).blob();
    const file = new File([blob], name, { type: "image/png" });
    if (navigator.canShare && navigator.canShare({ files: [file] })) return await navigator.share({ files: [file], text });
  } catch {
    return;
  }
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
}

// ---------------------------------------------------------------------------
// ۱. راهنمای «معنی»
// ---------------------------------------------------------------------------

const COST_HINT_MEANING = 10;
let clueWord = null; // کلمه‌ای که معنی‌اش نشان داده شده (تا پیدا نشده، دوباره دیدنش مجانی است)

const clueBtn = document.createElement("button");
clueBtn.className = "clue-btn";
clueBtn.id = "clueBtn";
clueBtn.type = "button";
clueBtn.setAttribute("aria-label", "راهنما: معنی یه کلمه");
clueBtn.innerHTML = `<span>📖 معنی</span><span class="cost"><span class="coin-icon"></span><span class="cost-count">${faDigits(COST_HINT_MEANING)}</span></span>`;
// گوشه‌ی بالای دایره‌ی حروف (روی جدول نمی‌افتد)
document.querySelector(".play-area").appendChild(clueBtn);
// پیام‌های بلند (style.css: .preview.note) کنار این دکمه می‌نشینند تا زیرش نروند؛
// جای دکمه پیش از هر پیام اندازه گرفته می‌شود (هر ظاهر ممکن است اندازه‌اش را عوض کند)
function measureClueRoom() {
  if (!clueBtn.offsetWidth) return;
  clueBtn.parentElement.style.setProperty("--clue-room", clueBtn.offsetLeft + clueBtn.offsetWidth + 6 + "px");
}
const showPreviewBase = showPreview;
showPreview = function (text, kind, ms) {
  if (/note|bonus/.test(kind)) measureClueRoom();
  return showPreviewBase(text, kind, ms);
};

const clueSheet = makeSheet("clueSheet", `
  <div class="card-title">📖 حدس بزن!</div>
  <div class="card-text" id="clueLen"></div>
  <div class="clue-meaning" id="clueMeaning"></div>
  <div class="clue-dots" id="clueDots"></div>
  <button class="card-btn" type="button" data-close>فهمیدم</button>`);
clueSheet.querySelector("[data-close]").onclick = () => clueSheet.classList.add("hidden");

function showClue() {
  const w = clueWord;
  $("clueLen").textContent = `یه کلمه‌ی ${faDigits(w.length)} حرفی که هنوز پیداش نکردی:`;
  $("clueMeaning").textContent = dict.get(w) || extraDict.get(w);
  // خانه‌های پرشده‌ی همین کلمه نشان داده می‌شوند، بقیه خالی
  const cells = wordCells(w);
  $("clueDots").replaceChildren(
    ...cells.map((el) => {
      const s = document.createElement("span");
      s.textContent = isFilled(el) ? el.textContent : "";
      if (isFilled(el)) s.className = "on";
      return s;
    })
  );
  clueSheet.classList.remove("hidden");
}

function hintMeaning() {
  if (locked || dragging || !puzzle) return;
  // معنیِ خریده‌شده‌ی همین مرحله بعد از بستن و باز کردن بازی هم دوباره مجانی است
  const kept = X().clue;
  if (kept && kept.k === playKey && puzzle.words.includes(kept.w)) clueWord = kept.w;
  if (clueWord && !found.includes(clueWord) && puzzle.words.includes(clueWord)) return showClue();
  const left = puzzle.words.filter((w) => !found.includes(w) && (dict.get(w) || extraDict.get(w)));
  if (!left.length) {
    showPreview("برای کلمه‌های باقی‌مونده معنی نداریم", "note", 1600);
    return;
  }
  if (!spend(COST_HINT_MEANING)) return;
  clueWord = left[Math.floor(Math.random() * left.length)];
  X().clue = { k: playKey, w: clueWord };
  persist();
  showClue();
}
clueBtn.addEventListener("click", hintMeaning);

function refreshClueBtn() {
  const free = (save.x && save.x.freeHints > 0) || (clueWord && puzzle && !found.includes(clueWord));
  clueBtn.classList.toggle("poor", !free && save.coins < COST_HINT_MEANING);
}

// ---------------------------------------------------------------------------
// ۲. پشتیبان‌گیری از پیشرفت با کد
// ---------------------------------------------------------------------------
// کد = «KLM1-» + پیشرفت فشرده‌شده (deflate) به base64 + یک امضای کوتاه.
// دفتر واژه‌ها در کد نمی‌آید (از روی مرحله‌ها دوباره ساخته می‌شود) تا کد کوتاه بماند.

const BACKUP_SALT = "kalameh-backup-1";

function bytesToB64(bytes) {
  let s = "";
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function b64ToBytes(b64) {
  const s = atob(b64.replace(/-/g, "+").replace(/_/g, "/"));
  const out = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
  return out;
}
async function pipeBytes(bytes, stream) {
  const out = new Blob([bytes]).stream().pipeThrough(stream);
  return new Uint8Array(await new Response(out).arrayBuffer());
}

async function makeBackupCode() {
  const copy = JSON.parse(JSON.stringify(save));
  copy.partial = {};
  if (copy.x) {
    delete copy.x.book;
    copy.x.bookFilled = false;
  }
  const json = JSON.stringify(copy);
  const sign = hashText(BACKUP_SALT + json).toString(36);
  let body, tag;
  if (window.CompressionStream) {
    body = bytesToB64(await pipeBytes(new TextEncoder().encode(json), new CompressionStream("deflate-raw")));
    tag = "KLM1";
  } else {
    body = bytesToB64(new TextEncoder().encode(json));
    tag = "KLM0";
  }
  return `${tag}-${sign}-${body}`;
}

async function readBackupCode(code) {
  const m = (code || "").replace(/\s+/g, "").match(/^(KLM[01])-([0-9a-z]+)-([A-Za-z0-9_-]+)$/);
  if (!m) throw new Error("bad");
  let bytes = b64ToBytes(m[3]);
  if (m[1] === "KLM1") {
    if (!window.DecompressionStream) throw new Error("old");
    bytes = await pipeBytes(bytes, new DecompressionStream("deflate-raw"));
  }
  const json = new TextDecoder().decode(bytes);
  if (hashText(BACKUP_SALT + json).toString(36) !== m[2]) throw new Error("sign");
  const data = JSON.parse(json);
  if (!data || !Number.isInteger(data.unlocked) || !Number.isInteger(data.coins)) throw new Error("bad");
  return { data, json };
}

const backupSheet = makeSheet("backupSheet", `
  <div class="card-title" id="backupTitle"></div>
  <div class="card-text" id="backupText"></div>
  <textarea class="backup-code" id="backupCode" dir="ltr" spellcheck="false" autocomplete="off"></textarea>
  <div class="card-text backup-msg" id="backupMsg"></div>
  <button class="card-btn" type="button" id="backupMain"></button>
  <button class="card-link" type="button" id="backupSecond"></button>
  <button class="card-link" type="button" data-close>بستن</button>`);
backupSheet.querySelector("[data-close]").onclick = () => backupSheet.classList.add("hidden");

async function openBackup() {
  $("backupTitle").textContent = "پشتیبان‌گیری از پیشرفت 💾";
  $("backupText").textContent = "این کد همه‌ی پیشرفتت رو نگه می‌داره: مرحله‌ها، سکه‌ها، ظاهرها و رکوردها. یه جای امن نگهش دار (مثلاً برای خودت تو تلگرام بفرست) و روی گوشی جدید از «برگرداندن پیشرفت» واردش کن.";
  $("backupMsg").textContent = "";
  const box = $("backupCode");
  box.readOnly = true;
  box.value = "…";
  backupSheet.classList.remove("hidden");
  let code;
  try {
    code = await makeBackupCode();
  } catch {
    box.value = "";
    $("backupMsg").textContent = "ساختن کد ممکن نشد.";
    return;
  }
  box.value = code;
  $("backupMain").textContent = "کپی کد";
  $("backupMain").onclick = async () => {
    try {
      await navigator.clipboard.writeText(code);
      $("backupMsg").textContent = "کد کپی شد ✓";
    } catch {
      box.select();
      $("backupMsg").textContent = "کد رو انتخاب کن و کپی کن.";
    }
  };
  $("backupSecond").classList.remove("hidden");
  $("backupSecond").textContent = "فرستادن کد";
  $("backupSecond").onclick = () => shareMore(`کد پشتیبان بازی «کلمه» (مرحله‌ی ${faDigits(save.unlocked + 1)}):\n${code}`);
}

function openRestore() {
  $("backupTitle").textContent = "برگرداندن پیشرفت 📥";
  $("backupText").textContent = "کد پشتیبانی که قبلاً گرفتی رو اینجا بچسبون.";
  $("backupMsg").textContent = "";
  const box = $("backupCode");
  box.readOnly = false;
  box.value = "";
  box.placeholder = "KLM1-…";
  $("backupSecond").classList.add("hidden");
  let pending = null;
  $("backupMain").textContent = "بررسی کد";
  $("backupMain").onclick = async () => {
    if (pending) {
      // تأیید دوم: پیشرفت این گوشی جایگزین می‌شود
      try {
        localStorage.setItem(SAVE_KEY, pending.json);
      } catch {
        $("backupMsg").textContent = "ذخیره نشد. دوباره امتحان کن.";
        return;
      }
      $("backupMsg").textContent = "پیشرفتت برگشت! ✓";
      setTimeout(() => location.reload(), 700);
      return;
    }
    try {
      pending = await readBackupCode(box.value);
    } catch (e) {
      $("backupMsg").textContent = e && e.message === "old"
        ? "این گوشی کد فشرده رو نمی‌شناسه؛ وب‌ویوی گوشی رو به‌روز کن."
        : "این کد درست نیست. کامل کپیش کردی؟";
      return;
    }
    const d = pending.data;
    $("backupMsg").textContent = `مرحله‌ی ${faDigits(d.unlocked + 1)} · ${faDigits(d.coins)} سکه. با تأیید، پیشرفت فعلی این گوشی (مرحله‌ی ${faDigits(save.unlocked + 1)}) جایگزین میشه.`;
    $("backupMain").textContent = "آره، برگردون";
  };
  box.oninput = () => {
    if (!pending) return;
    pending = null;
    $("backupMain").textContent = "بررسی کد";
    $("backupMsg").textContent = "";
  };
  backupSheet.classList.remove("hidden");
}

function settingLink(id, name, sub) {
  const btn = document.createElement("button");
  btn.className = "setting setting-link";
  btn.id = id;
  btn.type = "button";
  btn.innerHTML = `<span class="setting-name"></span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  btn.querySelector(".setting-name").textContent = name;
  if (sub) {
    const s = document.createElement("small");
    s.textContent = sub;
    btn.querySelector(".setting-name").appendChild(s);
  }
  return btn;
}
const backupBtn = settingLink("setBackup", "پشتیبان‌گیری از پیشرفت", "یه کد بگیر تا با عوض کردن گوشی، پیشرفتت از دست نره");
const restoreBtn = settingLink("setRestore", "برگرداندن پیشرفت", "کد پشتیبان رو وارد کن");
document.querySelector(".settings-list").append(backupBtn, restoreBtn);
backupBtn.onclick = openBackup;
restoreBtn.onclick = openRestore;

// ---------------------------------------------------------------------------
// ۳. آمار من
// ---------------------------------------------------------------------------

let levelStart = 0; // زمان شروع مرحله‌ی تازه، برای «سریع‌ترین مرحله»

function longestWord() {
  let best = "";
  for (const w of bookWords()) if (w.length > best.length || (w.length === best.length && w.localeCompare(best, "fa") < 0)) best = w;
  return best;
}

function myStats() {
  const d = save.dailyPuzzle || {};
  const f = X().fastest;
  return {
    rank: RANKS[rankOf(wordCount())][1],
    rows: [
      ["🗺️", "مرحله‌های تموم‌شده", faDigits(save.unlocked)],
      ["🔤", "کلمه‌های پیداشده", faDigits(wordCount())],
      ["📏", "بلندترین کلمه", longestWord() || "—"],
      ["👑", "تاج‌ها", faDigits(crowns().length)],
      ["📅", "مرحله‌ی روزانه", `${faDigits(d.count || 0)} بار · رکورد ${faDigits(d.best || 0)} روز`],
      ["⚡", "سریع‌ترین مرحله", f ? `${clock(f.s)} · مرحله‌ی ${faDigits(f.level + 1)}` : "—"],
      ["🧩", "ضرب‌المثل‌ها", `${faDigits(collectedProverbs().length)} از ${faDigits(PROVERBS.length)}`],
      ["⏱", "رکورد حالت سرعتی", faDigits(X().speedBest || 0)],
      ["✍️", "رکورد اسم فامیل", faDigits(X().efBest || 0)],
    ],
  };
}

const statsSheet = makeSheet("statsSheet", `
  <div class="card-title">📊 آمار من</div>
  <div class="card-text" id="statsRank"></div>
  <div class="stats-list" id="statsList"></div>
  <button class="card-btn" type="button" id="statsShare">فرستادن کارت آمار</button>
  <button class="card-link" type="button" data-close>بستن</button>`);
statsSheet.querySelector("[data-close]").onclick = () => statsSheet.classList.add("hidden");

function openStats() {
  const st = myStats();
  $("statsRank").textContent = `لقب: «${st.rank}»`;
  $("statsList").replaceChildren(
    ...st.rows.map(([icon, name, value]) => {
      const row = document.createElement("div");
      row.className = "stats-row";
      row.innerHTML = `<span class="stats-icon"></span><span class="stats-name"></span><b></b>`;
      row.querySelector(".stats-icon").textContent = icon;
      row.querySelector(".stats-name").textContent = name;
      row.querySelector("b").textContent = value;
      return row;
    })
  );
  statsSheet.classList.remove("hidden");
}

// کارت آمار (PNG، ۱۰۸۰×۱۳۵۰)
async function statsImage() {
  const st = myStats();
  const W = 1080, H = 1350;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const g = canvas.getContext("2d");
  const bg = g.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#2b2560");
  bg.addColorStop(1, "#16123a");
  g.fillStyle = bg;
  g.fillRect(0, 0, W, H);
  // ستاره‌ها
  const rnd = seededRandom(save.unlocked + 7);
  g.fillStyle = "rgba(255,255,255,0.55)";
  for (let i = 0; i < 70; i++) {
    g.beginPath();
    g.arc(rnd() * W, rnd() * H, rnd() * 2.2 + 0.6, 0, Math.PI * 2);
    g.fill();
  }
  try {
    await document.fonts.load("120px Lalezar");
    await document.fonts.load("bold 40px Vazirmatn");
    await document.fonts.load("36px Vazirmatn");
  } catch {}
  g.direction = "rtl";
  g.textAlign = "center";
  g.fillStyle = "#ffd36b";
  g.font = "140px Lalezar, sans-serif";
  g.fillText("کلمه", W / 2, 190);
  g.fillStyle = "#e8e6f6";
  g.font = "40px Vazirmatn, sans-serif";
  g.fillText(`آمار من · لقب «${st.rank}»`, W / 2, 265);
  // ردیف‌ها
  const rows = st.rows;
  const top = 330, rowH = 96, x0 = 90, x1 = W - 90;
  rows.forEach(([icon, name, value], i) => {
    const y = top + i * rowH;
    g.fillStyle = i % 2 ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.10)";
    g.beginPath();
    g.roundRect(x0, y, x1 - x0, rowH - 14, 22);
    g.fill();
    g.textAlign = "right";
    g.fillStyle = "#e8e6f6";
    g.font = "36px Vazirmatn, sans-serif";
    g.fillText(`${icon}  ${name}`, x1 - 30, y + 54);
    g.textAlign = "left";
    g.fillStyle = "#ffd36b";
    g.font = "bold 38px Vazirmatn, sans-serif";
    g.direction = "rtl";
    g.fillText(value, x0 + 30, y + 54);
  });
  g.textAlign = "center";
  g.fillStyle = "#b9b3e6";
  g.font = "32px Vazirmatn, sans-serif";
  g.fillText(`بازی «کلمه» در ${storeLabel()}`, W / 2, H - 60);
  return canvas.toDataURL("image/png");
}

$("statsShare").onclick = async () => {
  const text = `آمار من توی بازی «کلمه»: ${faDigits(save.unlocked)} مرحله و ${faDigits(wordCount())} کلمه! 📊`;
  let url;
  try {
    url = await statsImage();
  } catch {
    return shareMore(text);
  }
  sharePng(url, "kalameh-stats.png", text, "کارت آمار «کلمه»");
};

const statsBtn = document.createElement("button");
statsBtn.className = "proverb-open";
statsBtn.type = "button";
statsBtn.id = "statsBtn";
statsBtn.textContent = "📊 آمار من";
document.querySelector(".book-head").appendChild(statsBtn);
statsBtn.onclick = openStats;

// ---------------------------------------------------------------------------
// ۴. بازی دونفره روی یک گوشی
// ---------------------------------------------------------------------------
// هر دو نفر یک جدول را، هر کدام در ۶۰ ثانیه، بازی می‌کنند؛ هر حرف از کلمه‌های پیداشده یک امتیاز،
// و کسی که کل جدول را زودتر تمام کند، ثانیه‌های باقی‌مانده را هم امتیاز می‌گیرد.

const DUEL_PREFIX = "w:";
const DUEL_TIME = 60;
const DUEL_BASE = 6000; // مرحله‌های دونفره از اینجا ساخته می‌شوند (جدا از مرحله‌های اصلی)
const isDuel = () => typeof playKey === "string" && playKey.startsWith(DUEL_PREFIX);

const baseIsMode = isMode;
isMode = () => baseIsMode() || isDuel();

let duel = null; // { names, scores, words, turn, level, index, end, timer, bonus }

const duelSetup = makeSheet("duelSetup", `
  <div class="card-title">بازی دونفره 👥</div>
  <div class="card-text">یه جدول، دو نفر، هر کدوم ${faDigits(DUEL_TIME)} ثانیه. هر حرف از کلمه‌هایی که پیدا می‌کنی یه امتیازه؛ جدول رو کامل کنی، ثانیه‌های باقی‌مونده هم امتیاز میشه.</div>
  <div class="duel-names">
    <label><span>نفر اول</span><input type="text" id="duelName0" maxlength="14" dir="rtl" autocomplete="off"></label>
    <label><span>نفر دوم</span><input type="text" id="duelName1" maxlength="14" dir="rtl" autocomplete="off"></label>
  </div>
  <button class="card-btn" type="button" id="duelGo">شروع</button>
  <button class="card-link" type="button" data-close>بستن</button>`);
duelSetup.querySelector("[data-close]").onclick = () => duelSetup.classList.add("hidden");

const duelTurn = fixedSheet("duelTurn", `
  <div class="duel-avatar" id="duelAvatar">۱</div>
  <div class="card-title" id="duelTurnTitle"></div>
  <div class="card-text" id="duelTurnText"></div>
  <button class="card-btn" type="button" id="duelReady">آماده‌ام!</button>
  <button class="card-link" type="button" id="duelQuit">بی‌خیال</button>`, "duel-sheet");

const duelEnd = fixedSheet("duelEnd", `
  <div class="card-title" id="duelWinner"></div>
  <div class="duel-scores" id="duelScores"></div>
  <button class="card-btn" type="button" id="duelAgain">یه دست دیگه</button>
  <button class="card-link" type="button" id="duelShare">فرستادن نتیجه</button>
  <button class="card-link" type="button" id="duelHome">منو</button>`, "duel-sheet");

function openDuelSetup() {
  modesSheet.classList.add("hidden");
  const names = X().duelNames || ["", ""];
  $("duelName0").value = names[0] || "";
  $("duelName1").value = names[1] || "";
  $("duelName0").placeholder = "نفر اول";
  $("duelName1").placeholder = "نفر دوم";
  duelSetup.classList.remove("hidden");
}

function duelNames() {
  const a = $("duelName0").value.trim(), b = $("duelName1").value.trim();
  X().duelNames = [a, b];
  persist();
  return [a || "نفر اول", b || "نفر دوم"];
}

function clearDuelSaves() {
  for (const k of Object.keys(save.partial)) if (k.startsWith(DUEL_PREFIX)) delete save.partial[k];
}

function stopDuel() {
  if (duel) clearInterval(duel.timer);
  duel = null;
  modeBar.classList.add("hidden");
  $("app").classList.remove("mode-speed", "mode-duel");
  clearDuelSaves();
}

function newDuel(names, first = 0) {
  if (!generator) return;
  if (duel) clearInterval(duel.timer);
  const index = DUEL_BASE + Math.floor(Math.random() * 3000);
  duel = { names, scores: [0, 0], words: [0, 0], turn: 0, first, index, level: levelAt(index), end: 0, timer: 0, bonus: [0, 0] };
  duelPrepareTurn();
}

const duelPlayer = () => (duel.first + duel.turn) % 2;

function duelPrepareTurn() {
  clearDuelSaves();
  const p = duelPlayer();
  startPuzzle(duel.level, duel.index, `${DUEL_PREFIX}${duel.index}:${duel.turn}`);
  if (screenNow !== "play") open("play");
  locked = true; // تا «آماده‌ام» زده نشده، نمی‌شود کشید
  modeBar.classList.add("hidden");
  $("duelAvatar").textContent = faDigits(p + 1);
  $("duelAvatar").className = "duel-avatar p" + p;
  $("duelTurnTitle").textContent = `نوبت ${duel.names[p]}!`;
  $("duelTurnText").textContent = duel.turn === 0
    ? `${faDigits(DUEL_TIME)} ثانیه وقت داری. نفر بعدی نگاه نکنه! 🙈`
    : `${duel.names[1 - p]} ${faDigits(duel.scores[1 - p])} امتیاز گرفت. گوشی رو بده دست ${duel.names[p]} 📱`;
  duelTurn.classList.remove("hidden");
}

$("duelReady").onclick = () => {
  if (!duel) return;
  duelTurn.classList.add("hidden");
  locked = false;
  duel.end = Date.now() + DUEL_TIME * 1000;
  modeBar.classList.remove("hidden", "hurry");
  clearInterval(duel.timer);
  duel.timer = setInterval(duelTick, 200);
  duelTick();
};
$("duelQuit").onclick = () => {
  duelTurn.classList.add("hidden");
  stopDuel();
  goHome();
};

function duelTick() {
  if (!duel) return;
  if (location.hash !== "#play" || !isDuel()) return stopDuel();
  if (locked) return;
  const left = (duel.end - Date.now()) / 1000;
  const p = duelPlayer();
  modeBar.querySelector(".mode-time").textContent = "⏱ " + clock(Math.ceil(left));
  modeBar.querySelector(".mode-score").textContent = `${duel.names[p]}: ${faDigits(duel.scores[p])}`;
  modeBar.classList.toggle("hurry", left <= 10);
  if (left <= 0) duelTurnOver();
}

function duelScored(word) {
  if (!duel || locked) return;
  const p = duelPlayer();
  duel.scores[p] += word.length;
  duel.words[p]++;
  const pop = document.createElement("span");
  pop.className = "mode-pop";
  pop.textContent = "+" + faDigits(word.length);
  modeBar.appendChild(pop);
  setTimeout(() => pop.remove(), 900);
  duelTick();
}

function duelTurnOver(bonus = 0) {
  if (!duel) return;
  clearInterval(duel.timer);
  locked = true;
  const p = duelPlayer();
  if (bonus > 0) {
    duel.scores[p] += bonus;
    duel.bonus[p] = bonus;
    toast(`جدول کامل شد! ${faDigits(bonus)}+ امتیاز برای ثانیه‌های باقی‌مونده ⏱`, "gold");
  } else {
    toast("وقت تموم شد! ⏱");
  }
  setTimeout(() => {
    if (!duel) return;
    if (duel.turn === 0) {
      duel.turn = 1;
      duelPrepareTurn();
    } else {
      duelShowEnd();
    }
  }, bonus > 0 ? 1400 : 900);
}

function duelShowEnd() {
  modeBar.classList.add("hidden");
  const [a, b] = duel.scores;
  const [na, nb] = duel.names;
  $("duelWinner").textContent = a === b ? "مساوی شد! 🤝" : `${a > b ? na : nb} برد! 🏆`;
  $("duelScores").replaceChildren(
    ...[0, 1].map((p) => {
      const el = document.createElement("div");
      el.className = "duel-score p" + p + (duel.scores[p] > duel.scores[1 - p] ? " win" : "");
      el.innerHTML = `<span></span><b></b><small></small>`;
      el.querySelector("span").textContent = duel.names[p];
      el.querySelector("b").textContent = faDigits(duel.scores[p]);
      el.querySelector("small").textContent = `${faDigits(duel.words[p])} کلمه` + (duel.bonus[p] ? ` · +${faDigits(duel.bonus[p])} زمان` : "");
      return el;
    })
  );
  duelEnd.classList.remove("hidden");
  if (a !== b) {
    const c = centerOfEl($("duelWinner"));
    sparkle(c.x, c.y, 22);
  }
  sound("complete");
}

$("duelAgain").onclick = () => {
  duelEnd.classList.add("hidden");
  // دست بعد، نفر دیگر اول بازی می‌کند
  newDuel(duel.names, 1 - duel.first);
};
$("duelHome").onclick = () => {
  duelEnd.classList.add("hidden");
  stopDuel();
  goHome();
};
$("duelShare").onclick = () => {
  if (!duel) return;
  const [a, b] = duel.scores;
  const [na, nb] = duel.names;
  shareMore(`«کلمه» · بازی دونفره 👥\n${na}: ${faDigits(a)} · ${nb}: ${faDigits(b)}\n${a === b ? "مساوی شدیم!" : (a > b ? na : nb) + " برد! 🏆"}`);
};
$("duelGo").onclick = () => {
  const names = duelNames();
  duelSetup.classList.add("hidden");
  newDuel(names, 0);
};

// پایان جدول در بازی دونفره (به جای finishLevel)
const baseFinishMode = finishMode;
finishMode = function (hinted) {
  if (isDuel() && duel) {
    const left = Math.max(0, Math.ceil((duel.end - Date.now()) / 1000));
    duelTurnOver(left);
    return true;
  }
  return baseFinishMode(hinted);
};

// گزینه‌ی سوم در کارت «سرگرمی‌ها»
const duelPick = document.createElement("button");
duelPick.className = "mode-pick";
duelPick.type = "button";
duelPick.id = "modeDuel";
duelPick.innerHTML = `<span class="mode-icon">👥</span><span><b>بازی دونفره</b><small>روی یه گوشی، نوبتی؛ هر کی بیشتر پیدا کنه می‌بره</small></span>`;
document.querySelector("#modesSheet .modes-list").appendChild(duelPick);
duelPick.onclick = openDuelSetup;

// ---------------------------------------------------------------------------
// ۵. فال حافظ روزانه (بعد از حل کردن مرحله‌ی روزانه؛ کل دیوان در divan.js)
// ---------------------------------------------------------------------------

// کل دیوان در divan.js است و فقط وقتی فال باز می‌شود بارگذاری می‌شود؛
// اگر به هر دلیلی بار نشد، از بیت‌های hafez.js استفاده می‌شود.
let divanLoad = null;
function loadDivan() {
  if (typeof HAFEZ_DIVAN !== "undefined") return Promise.resolve(true);
  if (!divanLoad) {
    divanLoad = new Promise((resolve) => {
      const s = document.createElement("script");
      s.src = "divan.js";
      s.onload = () => resolve(typeof HAFEZ_DIVAN !== "undefined");
      s.onerror = () => { divanLoad = null; resolve(false); };
      document.head.appendChild(s);
    });
  }
  return divanLoad;
}

// ترتیب درهم ولی ثابت؛ هر روز غزل بعدی، تا همه‌ی ۴۹۵ غزل نیامده‌اند هیچ‌کدام تکرار نمی‌شود
const falOrders = {};
function shuffledOrder(n, seed) {
  if (!falOrders[n]) {
    const rnd = seededRandom(seed);
    const order = Array.from({ length: n }, (_, i) => i);
    for (let i = n - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    falOrders[n] = order;
  }
  return falOrders[n];
}
// خروجی: { num, lines: [مصراع‌ها], meaning }
function falOfDay(date = nowDate()) {
  const day = dayNumber(date);
  if (typeof HAFEZ_DIVAN !== "undefined") {
    const n = HAFEZ_DIVAN.length;
    const [num, text, meaning] = HAFEZ_DIVAN[shuffledOrder(n, 1404)[((day % n) + n) % n]];
    return { num, lines: text.split("/"), meaning };
  }
  const n = HAFEZ.length;
  const [m1, m2, meaning] = HAFEZ[shuffledOrder(n, 1404)[((day % n) + n) % n]];
  return { num: 0, lines: [m1, m2], meaning };
}

const falSheet = makeSheet("falSheet", `
  <div class="card-title">📜 فال حافظ امروز</div>
  <div class="fal-intent" id="falIntent">
    <div class="card-text">چشم‌هات رو ببند، یه نیت کن و بعد بزن روی دیوان.</div>
    <button class="fal-book" type="button" id="falOpen" aria-label="باز کردن دیوان">📖</button>
  </div>
  <div class="fal-body hidden" id="falBody">
    <div class="fal-num" id="falNum"></div>
    <div class="fal-poem" id="falPoem"></div>
    <div class="fal-meaning" id="falMeaning"></div>
    <button class="card-link" type="button" id="falShare">فرستادن فال</button>
  </div>
  <button class="card-link" type="button" data-close>بستن</button>`);
falSheet.querySelector("[data-close]").onclick = () => falSheet.classList.add("hidden");

function fillFal() {
  const f = falOfDay();
  $("falNum").textContent = f.num ? `غزل ${f.num.toLocaleString("fa-IR")}` : "";
  const poem = $("falPoem");
  poem.innerHTML = "";
  for (let i = 0; i < f.lines.length; i += 2) {
    const bayt = document.createElement("div");
    bayt.className = "fal-bayt";
    for (const m of f.lines.slice(i, i + 2)) {
      const span = document.createElement("span");
      span.textContent = m;
      bayt.appendChild(span);
    }
    poem.appendChild(bayt);
  }
  poem.scrollTop = 0;
  $("falMeaning").textContent = f.meaning;
  $("falMeaning").classList.toggle("hidden", !f.meaning);
}

async function openFal() {
  await loadDivan();
  fillFal();
  const seen = X().falDay === todayKey();
  $("falIntent").classList.toggle("hidden", seen);
  $("falBody").classList.toggle("hidden", !seen);
  falSheet.classList.remove("hidden");
}
$("falOpen").onclick = () => {
  $("falOpen").classList.add("open");
  sound("reward");
  setTimeout(() => {
    $("falOpen").classList.remove("open");
    $("falIntent").classList.add("hidden");
    $("falBody").classList.remove("hidden");
    $("falPoem").scrollTop = 0;
    X().falDay = todayKey();
    persist();
    renderFalChip();
  }, 650);
};
$("falShare").onclick = () => {
  const f = falOfDay();
  shareMore(`📜 فال حافظ امروزم توی «کلمه»${f.num ? ` (غزل ${f.num.toLocaleString("fa-IR")})` : ""}:
${f.lines[0]}
${f.lines[1]}
${f.meaning ? `\n${f.meaning}` : ""}`);
};

// در منو، بعد از حل شدن مرحله‌ی روزانه
const falChip = document.createElement("button");
falChip.type = "button";
falChip.className = "word-day fal-chip hidden";
falChip.id = "falChip";
document.querySelector(".home-chips").appendChild(falChip);
falChip.onclick = openFal;

function renderFalChip() {
  const solved = save.dailyPuzzle && save.dailyPuzzle.last === todayKey();
  falChip.classList.toggle("hidden", !solved);
  falChip.innerHTML = `<span>📜</span> <b>فال حافظ</b>` + (X().falDay === todayKey() ? "" : `<i class="dot"></i>`);
}

// در کارت پایان مرحله‌ی روزانه
function offerFal() {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "extra verse-offer fal-offer";
  btn.innerHTML = `<span>📜 فال حافظ امروز</span><small>حالا که مرحله‌ی روزانه رو حل کردی، یه نیت کن</small>`;
  btn.onclick = openFal;
  $("overlayBtn").before(btn);
}

// ---------------------------------------------------------------------------
// اتصال به رویدادهای بازی
// ---------------------------------------------------------------------------

gameHooks.push((name, d) => {
  switch (name) {
    case "level": {
      const kept = X().clue;
      clueWord = kept && kept.k === playKey && puzzle.words.includes(kept.w) && !found.includes(kept.w) ? kept.w : null;
      clueSheet.classList.add("hidden");
      refreshClueBtn();
      levelStart = !d.daily && !isMode() && !isVariant() && d.level === save.unlocked ? Date.now() : 0;
      if (isDuel()) {
        replayNoCoins = true; // بازی دونفره سکه نمی‌دهد (plus.js)
        $("app").classList.add("mode-speed", "mode-duel");
        if (duel) $("levelLabel").textContent = `دونفره · نوبت ${duel.names[duelPlayer()]}`;
      } else {
        $("app").classList.remove("mode-duel");
        if (duel) stopDuel();
      }
      break;
    }
    case "found":
      if (d.word === clueWord) clueWord = null;
      if (isDuel()) duelScored(d.word);
      refreshClueBtn();
      break;
    case "complete":
      if (d.daily) offerFal();
      if (!d.daily && d.first && levelStart) {
        const secs = Math.round((Date.now() - levelStart) / 1000);
        const f = X().fastest;
        if (secs >= 3 && (!f || secs < f.s)) {
          X().fastest = { s: secs, level: d.level };
          persist();
        }
      }
      levelStart = 0;
      break;
    case "home":
      if (duel) stopDuel();
      renderFalChip();
      break;
  }
});

const baseUpdateCoins2 = updateCoins;
updateCoins = function () {
  baseUpdateCoins2();
  refreshClueBtn();
};
