// آموزش کوتاه با «کلمی»: نور روی هر بخش می‌افتد و کلمی در یک جمله می‌گوید به چه دردی می‌خورد.
// سه آموزش جدا، هر کدام فقط یک بار: صفحه‌ی بازی، منوی اصلی، سرگرمی‌ها.
// از «تنظیمات ← آموزش» دوباره دیده می‌شوند.

const TOUR_STEPS = {
  play: [
    { at: "#board", text: "آفرین! 🎉 من کلمی‌ام. هر کلمه که بسازی توی جدول می‌شینه؛ روش بزنی، معنیش رو می‌بینی." },
    { at: ".tools", text: "گیر کردی؟ 💡 یه حرف، 📖 یه کلمه، 🎯 هر خونه که بخوای، 🚀 چند خونه با هم. بُر زدن 🔀 هم مجانیه!" },
    { at: "#chestBtn", text: "کلمه‌ی درستی که توی جدول نیست می‌ره توی صندوق. صندوق پر بشه، سکه می‌گیری 💰" },
    { at: "#app .coins", text: "سکه‌هات اینجاست. با هر مرحله، مأموریت و جایزه‌ی روزانه بیشتر می‌شه." },
    { at: "#wheel", text: "حالا نوبت توئه! بقیه‌ی کلمه‌ها رو پیدا کن 💪", last: "بزن بریم!" },
  ],
  home: [
    { at: "#continueBtn", text: "سلام دوباره! 👋 از اینجا مرحله‌ی بعدی رو بازی کن." },
    { at: "#dailyBtn", text: "هر روز یه جدول تازه 📅 چند روز پشت سر هم حلش کنی، جایزه‌ات بیشتر می‌شه 🔥" },
    { at: "#speedBtn", text: "بازی‌های کوتاه و سرگرمی: سرعتی، اسم فامیل، دونفره، مشاعره، جدول هفتگی و …" },
    { at: "#levelsBtn", text: "نقشه‌ی همه‌ی مرحله‌ها 🗺 مرحله‌ی تموم‌شده رو دوباره بزنی، چالش تاج 👑 داره." },
    { at: "#screenHome .home-tools", text: "مأموریت‌های امروز، گردونه‌ی شانس 🎡 و دفتر واژه‌ها که کلمه‌هات توش جمع می‌شن." },
    { at: "#screenHome .home-chips", text: "کلمه‌ی روز و فال حافظ 📜 هر روز یه چیز تازه منتظرته." },
    { at: "#themesBtn", text: "ظاهر بازی رو عوض کن ✨ هر ظاهر داستان و تصویر خودش رو داره.", last: "فهمیدم!" },
  ],
  modes: [
    { group: ["#modeSpeed", "#modeEf", "#modeDuel"], text: "یه دست سریع: سرعتی ⏱، اسم فامیل ✍️ و دونفره 👥 با دوستت روی یه گوشی. دست اول هر روز سکه داره!" },
    { group: ["#modeMs", "#modeRv", "#modeCw", "#modeSp"], text: "بازی کن و یاد بگیر 📚 بیت‌های حافظ، مرور معنی کلمه‌ها، جدول هفتگی و غلط املایی.", last: "بریم بازی!" },
  ],
};

const tourSeen = () => X().tour || (X().tour = {});
// کلمی: یک لکه‌ی جوهر مهربان با چشم‌های براق
const TOUR_MASCOT = `<svg class="tour-kalami" viewBox="0 0 64 64" aria-hidden="true">
  <path class="tk-body" d="M32 5c9 9 22 17 22 32a22 22 0 0 1-44 0C10 22 23 14 32 5Z"/>
  <ellipse cx="24.5" cy="38" rx="4.2" ry="5" fill="#fff"/><ellipse cx="39.5" cy="38" rx="4.2" ry="5" fill="#fff"/>
  <g class="tk-eyes"><circle cx="25.5" cy="39" r="2.4" fill="#1d1d26"/><circle cx="40.5" cy="39" r="2.4" fill="#1d1d26"/>
  <circle cx="26.3" cy="38" r=".8" fill="#fff"/><circle cx="41.3" cy="38" r=".8" fill="#fff"/></g>
  <path d="M27 47c3 2.6 7 2.6 10 0" fill="none" stroke="#1d1d26" stroke-width="2.2" stroke-linecap="round"/>
  <circle cx="19" cy="45" r="3" fill="#ff8a8a" opacity=".55"/><circle cx="45" cy="45" r="3" fill="#ff8a8a" opacity=".55"/>
  <path d="M22 16c2-3 5-5 7-6" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" opacity=".45"/>
</svg>`;

const tourEl = document.createElement("div");
tourEl.className = "tour hidden";
tourEl.innerHTML = `<div class="tour-hole"></div>
  <div class="tour-card" role="dialog" aria-live="polite">
    ${TOUR_MASCOT}
    <div class="tour-text"></div>
    <div class="tour-foot">
      <button class="tour-skip" type="button">رد کردن</button>
      <span class="tour-dots"></span>
      <button class="tour-next" type="button">بعدی</button>
    </div>
  </div>`;
document.body.appendChild(tourEl);
const tourHole = tourEl.querySelector(".tour-hole");
const tourCard = tourEl.querySelector(".tour-card");

let tourNow = null; // { name, steps, i }

// آیا این آموزش هنوز دیده نشده؟ (feel.js پیش از نشان دادن پیام خودش می‌پرسد)
function tourWants(name) {
  return !tourSeen()[name];
}

const tourVisible = (el) => !!el && el.getClientRects().length > 0 && el.offsetParent !== null;

// بخش‌هایی که این گام رویشان نور می‌اندازد (at: اولین پیدا شده؛ group: همه با هم)
function tourEls(step) {
  if (step.group) return step.group.map((s) => document.querySelector(s)).filter(tourVisible);
  for (const s of step.at.split(",")) {
    const el = document.querySelector(s.trim());
    if (tourVisible(el)) return [el];
  }
  return [];
}

function tourStart(name) {
  if (tourNow || !tourWants(name)) return;
  const steps = TOUR_STEPS[name].filter((s) => tourEls(s).length);
  if (!steps.length) return;
  tourNow = { name, steps, i: 0 };
  tourEl.classList.remove("hidden");
  tourEl.querySelector(".tour-dots").innerHTML = steps.map(() => "<i></i>").join("");
  tourShow();
}

function tourShow() {
  const { steps, i } = tourNow;
  const step = steps[i];
  const els = tourEls(step);
  if (!els.length) return tourNext();
  els[0].scrollIntoView({ block: "nearest" });
  const rs = els.map((e) => e.getBoundingClientRect());
  const r = {
    left: Math.min(...rs.map((q) => q.left)), top: Math.min(...rs.map((q) => q.top)),
    right: Math.max(...rs.map((q) => q.right)), bottom: Math.max(...rs.map((q) => q.bottom)),
  };
  r.width = r.right - r.left;
  r.height = r.bottom - r.top;
  const el = els[0];
  const pad = 7;
  const radius = Math.min(28, parseFloat(getComputedStyle(el).borderTopLeftRadius) + pad || 16);
  Object.assign(tourHole.style, {
    left: r.left - pad + "px",
    top: r.top - pad + "px",
    width: r.width + pad * 2 + "px",
    height: r.height + pad * 2 + "px",
    borderRadius: radius + "px",
  });
  // کارت پایین یا بالای بخش، هر جا جای بیشتری باشد
  const below = r.top + r.height / 2 < innerHeight * 0.5;
  tourCard.style.top = below ? Math.min(r.bottom + pad + 14, innerHeight - 200) + "px" : "";
  tourCard.style.bottom = below ? "" : Math.min(innerHeight - r.top + pad + 14, innerHeight - 200) + "px";
  tourCard.classList.toggle("below", below);
  tourEl.querySelector(".tour-text").textContent = step.text;
  tourEl.querySelector(".tour-next").textContent = i === steps.length - 1 ? step.last || "تموم!" : "بعدی";
  tourEl.querySelectorAll(".tour-dots i").forEach((d, k) => d.classList.toggle("on", k === i));
  tourCard.classList.remove("pop");
  void tourCard.offsetWidth;
  tourCard.classList.add("pop");
  if (typeof sound === "function") sound("tap");
}

function tourNext() {
  if (!tourNow) return;
  tourNow.i++;
  if (tourNow.i >= tourNow.steps.length) return tourEnd();
  tourShow();
}

function tourEnd() {
  if (!tourNow) return;
  tourSeen()[tourNow.name] = 1;
  persist();
  tourNow = null;
  tourEl.classList.add("hidden");
}

tourEl.querySelector(".tour-next").onclick = tourNext;
tourEl.querySelector(".tour-skip").onclick = tourEnd;
addEventListener("resize", () => tourNow && tourShow());

// دکمه‌ی برگشت گوشی آموزش را می‌بندد
{
  const baseBack = window.kalamehBack;
  window.kalamehBack = function () {
    if (tourNow) {
      tourEnd();
      return "closed";
    }
    return baseBack ? baseBack() : "home";
  };
}

// ---------- کی شروع شود ----------

// مرحله‌ی معمولی، نه روزانه و سرعتی و دونفره و بخش کودک
function tourNormalPlay() {
  if (screenNow !== "play") return false;
  if (typeof isDaily === "function" && isDaily()) return false;
  if (typeof isMode === "function" && isMode()) return false;
  if (typeof isVariant === "function" && isVariant()) return false;
  if (typeof isKidsPlay === "function" && isKidsPlay()) return false;
  if (typeof playKey === "string" && /^[a-z]+:/.test(playKey)) return false;
  return true;
}

// صفحه آرام است: پنجره‌ی دیگری باز نیست و صفحه‌ی انتخاب کودک/بزرگسال کنار رفته
function tourClear() {
  if (document.querySelector(".sheet:not(.hidden), .overlay:not(.hidden)")) return false;
  const gate = document.getElementById("kidsGate");
  const kids = document.getElementById("kidsWorld");
  if ((gate && !gate.classList.contains("hidden")) || (kids && !kids.classList.contains("hidden"))) return false;
  const loading = document.getElementById("loading");
  return !(loading && !loading.classList.contains("hidden") && getComputedStyle(loading).display !== "none");
}

// چند بار کوتاه صبر می‌کند تا پنجره‌های خوش‌آمد (جایزه‌ی روزانه و …) بسته شوند
function tourWhenClear(name, ok, tries = 30) {
  if (!tourWants(name) || tourNow) return;
  if (!ok()) return;
  if (tourClear()) return tourStart(name);
  if (tries > 0) setTimeout(() => tourWhenClear(name, ok, tries - 1), 700);
}

gameHooks.push((name, detail) => {
  if (!tourWants("play")) return;
  // مرحله‌ی اول: بعد از اولین کلمه (دست راهنما اول کشیدن را نشان داده)
  if (name === "found" && current === 0 && found.length === 1 && tourNormalPlay()) {
    setTimeout(() => tourWhenClear("play", tourNormalPlay), 1100);
  }
  // بازیکن‌های قدیمی‌تر: اول هر مرحله‌ی معمولی دیگر
  if (name === "level" && detail.level > 0 && !detail.daily) {
    setTimeout(() => tourWhenClear("play", tourNormalPlay), 900);
  }
});

// منوی اصلی: بعد از اینکه بازیکن دست‌کم یک مرحله را تمام کرده
addEventListener("hashchange", () => setTimeout(tourHomeCheck, 600));
function tourHomeCheck() {
  if (screenNow === "home" && save.unlocked >= 1) tourWhenClear("home", () => screenNow === "home");
}
setTimeout(tourHomeCheck, 3500);
// بعد از انتخاب «بزرگسال» در صفحه‌ی اول
document.getElementById("kgAdult").addEventListener("click", () => setTimeout(tourHomeCheck, 700));

// سرگرمی‌ها: بار اولی که کارتش باز می‌شود
{
  const baseOpenModes = openModes;
  openModes = function () {
    const out = baseOpenModes.apply(this, arguments);
    if (tourWants("modes")) setTimeout(() => !tourNow && tourStart("modes"), 450);
    return out;
  };
  if (typeof speedBtn !== "undefined") speedBtn.onclick = openModes;
}

// تنظیمات ← آموزش: همه‌ی آموزش‌ها از نو
document.getElementById("setTutorial").addEventListener("click", () => {
  X().tour = {};
  persist();
});
