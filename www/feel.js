"use strict";

// حس بازی: صدا، لرزش، تنظیمات، آموزش مرحله‌ی اول و یادآوری راهنما.
// این فایل بعد از game.js بارگذاری می‌شود و از تابع‌ها و متغیرهای آن استفاده می‌کند.

// ---------------------------------------------------------------------------
// تنظیمات (جدا از ذخیره‌ی بازی نگه داشته می‌شود)
// ---------------------------------------------------------------------------

const SETTINGS_KEY = "kalame-settings";
const TEXT_SIZES = [
  { id: "normal", name: "معمولی" },
  { id: "large", name: "درشت" },
  { id: "xlarge", name: "خیلی درشت" },
];

function loadSettings() {
  const fresh = { sound: true, haptics: true, text: "normal", tutorial: false };
  try {
    const data = JSON.parse(localStorage.getItem(SETTINGS_KEY));
    if (!data || typeof data !== "object") return fresh;
    return {
      sound: data.sound !== false,
      haptics: data.haptics !== false,
      text: TEXT_SIZES.some((t) => t.id === data.text) ? data.text : "normal",
      tutorial: data.tutorial === true, // آموزش مرحله‌ی اول دیده شده؟
    };
  } catch {
    return fresh;
  }
}

const settings = loadSettings();

function saveSettings() {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // اگر حافظه پر یا بسته باشد، تنظیمات فقط تا بسته شدن برنامه می‌ماند
  }
}

function applyTextSize() {
  document.documentElement.dataset.text = settings.text;
}

// ---------------------------------------------------------------------------
// صدا: همه‌ی صداها همین‌جا با Web Audio ساخته می‌شوند؛ فایل صوتی لازم نیست
// ---------------------------------------------------------------------------

let audioCtx = null;
let masterGain = null;

function audio() {
  if (!settings.sound) return null;
  if (!audioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    audioCtx = new AC();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0.5;
    masterGain.connect(audioCtx.destination);
  }
  if (audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}

// یک نت کوتاه: فرکانس، شروع (ثانیه از الان)، طول، بلندی، نوع موج
function tone(freq, at = 0, dur = 0.18, vol = 0.3, type = "sine") {
  const ctx = audio();
  if (!ctx) return;
  const t = ctx.currentTime + at;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(vol, t + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(gain).connect(masterGain);
  osc.start(t);
  osc.stop(t + dur + 0.05);
}

// صدای «ووش» برای بُر زدن: نویز با صافی که بالا می‌رود
function whoosh(dur = 0.28, vol = 0.18) {
  const ctx = audio();
  if (!ctx) return;
  const t = ctx.currentTime;
  const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.Q.value = 1.2;
  filter.frequency.setValueAtTime(400, t);
  filter.frequency.exponentialRampToValueAtTime(2400, t + dur);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(vol, t + dur * 0.4);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(filter).connect(gain).connect(masterGain);
  src.start(t);
}

// نت‌های گام پنتاتونیک؛ هر حرفی که به کلمه اضافه می‌شود یک پله بالاتر است
const SCALE = [523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66, 1318.51, 1567.98];

const SOUNDS = {
  letter(n) { tone(SCALE[Math.min(n, SCALE.length - 1)], 0, 0.14, 0.22, "triangle"); },
  found() { tone(784, 0, 0.16, 0.28); tone(1046.5, 0.09, 0.28, 0.28); },
  bonus() { tone(1046.5, 0, 0.12, 0.2); tone(1318.5, 0.07, 0.12, 0.2); tone(1568, 0.14, 0.3, 0.22); },
  repeat() { tone(659, 0, 0.16, 0.18); },
  wrong() { tone(196, 0, 0.22, 0.25, "triangle"); tone(174.6, 0.08, 0.26, 0.2, "triangle"); },
  hint() { tone(1318.5, 0, 0.4, 0.18); tone(1975.5, 0.05, 0.5, 0.1); },
  shuffle() { whoosh(); },
  coin() { tone(1975.5, 0, 0.08, 0.14, "square"); tone(2637, 0.05, 0.16, 0.1, "square"); },
  complete() { [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, i * 0.11, 0.35, 0.26)); tone(1318.5, 0.48, 0.6, 0.2); },
  reward() { [783.99, 987.77, 1174.66, 1567.98].forEach((f, i) => tone(f, i * 0.07, 0.25, 0.2)); },
  tap() { tone(880, 0, 0.06, 0.12); },
};

function sound(name, arg) {
  if (!settings.sound || !SOUNDS[name]) return;
  try {
    SOUNDS[name](arg);
  } catch {
    // اگر دستگاه صدا را پشتیبانی نکند، بازی بی‌صدا ادامه می‌دهد
  }
}

// ---------------------------------------------------------------------------
// لرزش: در برنامه‌ی اندروید از افزونه‌ی Haptics، در مرورگر از navigator.vibrate
// ---------------------------------------------------------------------------

function haptic(kind = "light") {
  if (!settings.haptics) return;
  const plugin = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Haptics;
  try {
    if (plugin) {
      if (kind === "success") plugin.notification({ type: "SUCCESS" });
      else if (kind === "error") plugin.notification({ type: "ERROR" });
      else plugin.impact({ style: kind === "medium" ? "MEDIUM" : "LIGHT" });
    } else if (navigator.vibrate) {
      const ms = { light: 8, medium: 18, success: [12, 60, 18], error: [30, 50, 30] }[kind] || 8;
      navigator.vibrate(ms);
    }
  } catch {
    // لرزش اختیاری است
  }
}

// واکنش صدا و لرزش به اتفاق‌های بازی (از emit در game.js صدا زده می‌شود)
function feel(name, detail) {
  switch (name) {
    case "found": sound("found"); haptic("medium"); break;
    case "bonus": sound("bonus"); haptic("light"); break;
    case "repeat": sound("repeat"); break;
    case "wrong": sound("wrong"); haptic("error"); break;
    case "hint": sound("hint"); haptic("light"); break;
    case "shuffle": sound("shuffle"); break;
    case "complete": sound("complete"); haptic("success"); break;
  }
  nudgeEvent(name, detail);
  tutorialEvent(name, detail);
}

// هر حرفی که انگشت رویش می‌رود
function feelLetter(count) {
  sound("letter", count - 1);
  haptic("light");
}

// ---------------------------------------------------------------------------
// یادآوری راهنما: اگر بازیکن مدتی کلمه‌ای پیدا نکند، دکمه‌ی راهنما آرام چشمک می‌زند
// ---------------------------------------------------------------------------

const NUDGE_AFTER = 40000; // میلی‌ثانیه
let nudgeTimer = null;

function stopNudge() {
  clearTimeout(nudgeTimer);
  $("hintLetterBtn").classList.remove("nudge");
}

function restartNudge() {
  stopNudge();
  nudgeTimer = setTimeout(() => {
    if (screenNow === "play" && !locked && save.coins >= COST_HINT_LETTER) $("hintLetterBtn").classList.add("nudge");
  }, NUDGE_AFTER);
}

function nudgeEvent(name) {
  if (name === "level" || name === "found" || name === "hint" || name === "bonus") restartNudge();
  if (name === "complete") stopNudge();
}

// ---------------------------------------------------------------------------
// آموزش مرحله‌ی اول: یک انگشت روی حروف دایره کشیده می‌شود
// ---------------------------------------------------------------------------

let tutorialHand = null;
let tutorialTimer = null;

function tutorialEvent(name, detail) {
  if (name === "level") {
    stopTutorial();
    if (!settings.tutorial && detail.level === 0 && found.length === 0) setTimeout(startTutorial, 600);
  }
  if (name === "found" && tutorialHand) {
    stopTutorial();
    settings.tutorial = true;
    saveSettings();
    setTimeout(() => showPreview("آفرین! بقیه‌ی کلمه‌ها رو هم پیدا کن", "show note", 2600), 700);
  }
}

// کوتاه‌ترین کلمه‌ی جدول را با خانه‌های دایره پیدا می‌کند
function tutorialPath() {
  if (!puzzle) return null;
  const word = [...puzzle.words].sort((a, b) => a.length - b.length)[0];
  const used = new Set();
  const path = [];
  for (const ch of word) {
    const i = puzzle.letters.findIndex((l, k) => !used.has(k) && fold(l) === fold(ch));
    if (i < 0) return null;
    used.add(i);
    path.push(i);
  }
  return path;
}

function startTutorial() {
  if (screenNow !== "play" || current !== 0 || tutorialHand) return;
  const steps = tutorialPath();
  if (!steps) return;
  const hand = document.createElement("div");
  hand.className = "tutorial-hand";
  hand.innerHTML =
    '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M19 6a3.5 3.5 0 0 1 7 0v14l9.6 2.4a4 4 0 0 1 3 4.4l-1.6 11a5 5 0 0 1-5 4.2H20.4a5 5 0 0 1-4.2-2.3L8.6 28a3.4 3.4 0 0 1 5.4-4l5 5Z"/></svg>';
  wheelEl.appendChild(hand);
  tutorialHand = hand;
  showPreview("حرف‌ها رو به هم وصل کن", "show note", 4000);

  let k = 0;
  const move = () => {
    if (!tutorialHand) return;
    if (k === steps.length) {
      hand.classList.add("lift");
      k = 0;
      tutorialTimer = setTimeout(move, 900);
      return;
    }
    const el = letterEls[steps[k]];
    hand.classList.toggle("lift", false);
    hand.classList.toggle("jump", k === 0);
    // حرف‌ها با translate(-50%,-50%) جا گرفته‌اند، پس offsetLeft/Top همان مرکزشان است
    hand.style.left = el.offsetLeft + "px";
    hand.style.top = el.offsetTop + "px";
    k++;
    tutorialTimer = setTimeout(move, k === 1 ? 700 : 650);
  };
  move();
}

function stopTutorial() {
  clearTimeout(tutorialTimer);
  if (tutorialHand) tutorialHand.remove();
  tutorialHand = null;
}

// ---------------------------------------------------------------------------
// صفحه‌ی تنظیمات
// ---------------------------------------------------------------------------

function renderSettings() {
  $("setSound").checked = settings.sound;
  $("setHaptics").checked = settings.haptics;
  for (const btn of document.querySelectorAll("#setText button")) {
    btn.classList.toggle("selected", btn.dataset.size === settings.text);
  }
}

function setupSettings() {
  const sizes = $("setText");
  for (const t of TEXT_SIZES) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.dataset.size = t.id;
    btn.textContent = t.name;
    btn.onclick = () => {
      settings.text = t.id;
      saveSettings();
      applyTextSize();
      renderSettings();
      sound("tap");
    };
    sizes.appendChild(btn);
  }
  $("setSound").addEventListener("change", (e) => {
    settings.sound = e.target.checked;
    saveSettings();
    sound("tap");
  });
  $("setHaptics").addEventListener("change", (e) => {
    settings.haptics = e.target.checked;
    saveSettings();
    haptic("medium");
  });
  $("setTutorial").addEventListener("click", () => {
    settings.tutorial = false;
    saveSettings();
    play(0);
  });
  $("settingsBtn").addEventListener("click", () => open("settings"));
}

applyTextSize();
setupSettings();
