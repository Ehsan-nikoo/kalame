// آموزش کوتاه با یک راهنمای بامزه: نور روی هر بخش می‌افتد و راهنما در یک جمله می‌گوید به چه دردی می‌خورد.
// هر ظاهر راهنما و رنگ خودش را دارد (TOUR_THEMES پایین همین فایل و .tour-card در css همان ظاهر).
// ظاهر تازه که ساخته می‌شود، باید اینجا راهنمای خودش را بگیرد.
// چهار آموزش جدا، هر کدام فقط یک بار: صفحه‌ی بازی، منوی اصلی، سرگرمی‌ها، و چرخ کلمه‌ی بچه‌ها (kids).
// از «تنظیمات ← آموزش» دوباره دیده می‌شوند.

const TOUR_STEPS = {
  play: [
    { at: "#board", text: "{hi} هر کلمه که بسازی توی جدول می‌شینه؛ روش بزنی، معنیش رو می‌بینی." },
    { at: ".tools", text: "گیر کردی؟ 💡 یه حرف، 📖 یه کلمه، 🎯 هر خونه که بخوای، 🚀 چند خونه با هم. بُر زدن 🔀 هم مجانیه!" },
    { at: "#chestBtn", text: "کلمه‌ی درستی که توی جدول نیست می‌ره توی صندوق. صندوق پر بشه، سکه می‌گیری 💰" },
    { at: "#app .coins", text: "سکه‌هات اینجاست. با هر مرحله، مأموریت و جایزه‌ی روزانه بیشتر می‌شه." },
    { at: "#wheel", text: "حالا نوبت توئه! بقیه‌ی کلمه‌ها رو پیدا کن 💪", last: "{go}" },
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
  // چرخ کلمه‌ی بخش کودک: ساده و کوتاه، بدون سکه و صندوق
  kids: [
    { at: "#board", text: "{hi} هر کلمه که بسازی، اینجا توی جدول می‌شینه." },
    { at: "#hintLetterBtn", text: "گیر کردی؟ این دکمه یه حرف رو برات باز می‌کنه 💡 مجانیه!" },
    { at: "#shuffleBtn", text: "این دکمه حرف‌ها رو جابه‌جا می‌کنه 🔀 شاید کلمه رو زودتر ببینی." },
    { at: "#wheel", text: "حالا بقیه‌ی کلمه‌ها رو پیدا کن 💪", last: "{go}" },
  ],
};

const tourSeen = () => X().tour || (X().tour = {});
// چشم‌ها (tk-eyes) پلک می‌زنند و کل راهنما آرام بالا و پایین می‌رود
const TK_EYES = (y = 38, gap = 7.5, cx = 32) => `
  <ellipse cx="${cx - gap}" cy="${y}" rx="4.2" ry="5" fill="#fff"/><ellipse cx="${cx + gap}" cy="${y}" rx="4.2" ry="5" fill="#fff"/>
  <g class="tk-eyes" style="transform-origin:${cx}px ${y + 1}px"><circle cx="${cx - gap + 1}" cy="${y + 1}" r="2.4" fill="#1d1d26"/><circle cx="${cx + gap + 1}" cy="${y + 1}" r="2.4" fill="#1d1d26"/>
  <circle cx="${cx - gap + 1.8}" cy="${y}" r=".8" fill="#fff"/><circle cx="${cx + gap + 1.8}" cy="${y}" r=".8" fill="#fff"/></g>`;
const TK_SMILE = (y = 47, cx = 32) => `<path d="M${cx - 5} ${y}c3 2.6 7 2.6 10 0" fill="none" stroke="#1d1d26" stroke-width="2.2" stroke-linecap="round"/>`;
const TK_CHEEKS = (y = 45, gap = 13, cx = 32) => `<circle cx="${cx - gap}" cy="${y}" r="3" fill="#ff8a8a" opacity=".55"/><circle cx="${cx + gap}" cy="${y}" r="3" fill="#ff8a8a" opacity=".55"/>`;

const TOUR_THEMES = {
  // ساده: «کلمی»، یک قطره‌ی جوهر آبی
  plain: {
    hi: "آفرین! 🎉 من کلمی‌ام.",
    go: "بزن بریم!",
    svg: `<path d="M32 5c9 9 22 17 22 32a22 22 0 0 1-44 0C10 22 23 14 32 5Z" fill="#5b6cff"/>
      ${TK_EYES()}${TK_SMILE()}${TK_CHEEKS()}
      <path d="M22 16c2-3 5-5 7-6" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" opacity=".45"/>`,
  },
  // صورت فلکی: «سهیل»، ستاره‌ی طلایی
  stars: {
    hi: "آفرین! ✨ من سهیلم، ستاره‌ی راهنمات توی این آسمون.",
    go: "بریم سراغ ستاره‌ها!",
    svg: `<path d="M32 3l8.2 17.6 19.3 2.3-14.3 13.2 3.8 19.1L32 45.6 15 55.2l3.8-19.1L4.5 22.9l19.3-2.3Z" fill="#ffd34d" stroke="#f0a91e" stroke-width="2" stroke-linejoin="round"/>
      ${TK_EYES(30, 6.5)}${TK_SMILE(39)}${TK_CHEEKS(37, 11)}
      <circle cx="54" cy="8" r="2" fill="#fff6c8"/><circle cx="9" cy="10" r="1.4" fill="#fff6c8"/>`,
  },
  // قالی‌باف: «گلی»، گلوله‌ی نخ روناسی
  carpet: {
    hi: "آفرین! 🧶 من گلی‌ام، گلوله‌ی نخ این دار قالی.",
    go: "بافتن رو شروع کن!",
    svg: `<circle cx="32" cy="36" r="22" fill="#b0302a"/>
      <path d="M14 26c10 6 26 6 36-2M11 38c12 6 30 6 42-2M16 50c10 3 22 3 32-2M24 15c-4 12-4 30 2 42M40 15c5 12 5 30-1 42" fill="none" stroke="#e7a28f" stroke-width="1.6" opacity=".8"/>
      ${TK_EYES(36)}${TK_SMILE(45)}${TK_CHEEKS(43)}
      <path d="M52 47c5 4 6 9 2 12" fill="none" stroke="#b0302a" stroke-width="2.6" stroke-linecap="round"/>`,
  },
  // کاروان: «ساربون»، شتر کوچولو
  caravan: {
    hi: "آفرین! 🐪 من ساربونم، همسفرت توی این کاروان.",
    go: "حرکت!",
    svg: `<ellipse cx="18" cy="16" rx="4" ry="6" fill="#b07a45" transform="rotate(-25 18 16)"/><ellipse cx="46" cy="16" rx="4" ry="6" fill="#b07a45" transform="rotate(25 46 16)"/>
      <ellipse cx="32" cy="32" rx="19" ry="20" fill="#d6a36a"/>
      <ellipse cx="32" cy="48" rx="13" ry="9" fill="#ecc896"/>
      <circle cx="28" cy="48" r="1.4" fill="#6d4523"/><circle cx="36" cy="48" r="1.4" fill="#6d4523"/>
      ${TK_EYES(31)}<path d="M28 54c2.6 1.6 5.4 1.6 8 0" fill="none" stroke="#6d4523" stroke-width="2" stroke-linecap="round"/>
      <path d="M22 13c4-5 16-5 20 0" fill="none" stroke="#1d4e89" stroke-width="3" stroke-linecap="round"/>`,
  },
  // حوض و باغ: «بلبل»، با یک گل سرخ
  garden: {
    hi: "آفرین! 🌹 من بلبلم، از باغ اومدم کمکت.",
    go: "بریم توی باغ!",
    svg: `<ellipse cx="32" cy="38" rx="21" ry="19" fill="#9c6b45"/>
      <ellipse cx="32" cy="44" rx="13" ry="11" fill="#f1d9b5"/>
      <path d="M12 36c-6 2-8 8-6 12 5-1 9-4 10-8Z" fill="#7d5233"/>
      <path d="M29 41l3 4 3-4Z" fill="#f2a13a"/>
      ${TK_EYES(34, 8)}${TK_CHEEKS(42, 14)}
      <g transform="translate(42 12)"><circle r="6" fill="#e0475f"/><path d="M-3-1c2-3 5-3 6 0M-4 2c3 2 6 2 8 0" fill="none" stroke="#a52238" stroke-width="1.3"/><path d="M-1 6c-2 3-5 4-8 4" fill="none" stroke="#3f8a5a" stroke-width="2"/></g>`,
  },
  // قلم و مرکب: «دوات» با قلم نی
  ink: {
    hi: "آفرین! 🖋 من دواتم؛ با هم یه صفحه‌ی تازه می‌نویسیم.",
    go: "قلم رو بردار!",
    svg: `<path d="M44 2l6 3-12 28-4-2Z" fill="#c9a14a" stroke="#8a6a24" stroke-width="1"/>
      <rect x="20" y="20" width="24" height="7" rx="2" fill="#1f3b73"/>
      <path d="M14 34c0-6 6-8 18-8s18 2 18 8v14c0 7-8 11-18 11s-18-4-18-11Z" fill="#1d1b2c"/>
      <path d="M14 36h36" stroke="#c9a14a" stroke-width="3"/>
      ${TK_EYES(44)}<path d="M27 52c3 2.6 7 2.6 10 0" fill="none" stroke="#f6ecd2" stroke-width="2.2" stroke-linecap="round"/>${TK_CHEEKS(51, 12)}`,
  },
  // شاهنامه: «نقّال»؛ به جای چهره، شمسه‌ی تذهیب که ترنج وسطش آرام می‌چرخد (این ظاهر کارتونی نیست)
  tile: {
    hi: "آفرین! من نقّال شاهنامه‌ام؛ با هر کلمه، یه تیکه از نگاره‌ی داستان رنگ می‌گیره.",
    go: "بریم سراغ داستان!",
    svg: `<polygon points="30.7,8.0 32.0,1.0 33.3,8.0" fill="#1d3a7a"/><polygon points="36.9,8.5 39.4,4.5 39.5,9.2" fill="#1d3a7a"/><polygon points="42.8,10.6 47.5,5.2 45.1,11.9" fill="#1d3a7a"/><polygon points="48.0,14.1 52.2,11.8 49.9,16.0" fill="#1d3a7a"/><polygon points="52.1,18.9 58.8,16.5 53.4,21.2" fill="#1d3a7a"/><polygon points="54.8,24.5 59.5,24.6 55.5,27.1" fill="#1d3a7a"/><polygon points="56.0,30.7 63.0,32.0 56.0,33.3" fill="#1d3a7a"/><polygon points="55.5,36.9 59.5,39.4 54.8,39.5" fill="#1d3a7a"/><polygon points="53.4,42.8 58.8,47.5 52.1,45.1" fill="#1d3a7a"/><polygon points="49.9,48.0 52.2,52.2 48.0,49.9" fill="#1d3a7a"/><polygon points="45.1,52.1 47.5,58.8 42.8,53.4" fill="#1d3a7a"/><polygon points="39.5,54.8 39.4,59.5 36.9,55.5" fill="#1d3a7a"/><polygon points="33.3,56.0 32.0,63.0 30.7,56.0" fill="#1d3a7a"/><polygon points="27.1,55.5 24.6,59.5 24.5,54.8" fill="#1d3a7a"/><polygon points="21.2,53.4 16.5,58.8 18.9,52.1" fill="#1d3a7a"/><polygon points="16.0,49.9 11.8,52.2 14.1,48.0" fill="#1d3a7a"/><polygon points="11.9,45.1 5.2,47.5 10.6,42.8" fill="#1d3a7a"/><polygon points="9.2,39.5 4.5,39.4 8.5,36.9" fill="#1d3a7a"/><polygon points="8.0,33.3 1.0,32.0 8.0,30.7" fill="#1d3a7a"/><polygon points="8.5,27.1 4.5,24.6 9.2,24.5" fill="#1d3a7a"/><polygon points="10.6,21.2 5.2,16.5 11.9,18.9" fill="#1d3a7a"/><polygon points="14.1,16.0 11.8,11.8 16.0,14.1" fill="#1d3a7a"/><polygon points="18.9,11.9 16.5,5.2 21.2,10.6" fill="#1d3a7a"/><polygon points="24.5,9.2 24.6,4.5 27.1,8.5" fill="#1d3a7a"/><g fill="#e3b24f"><circle cx="32.0" cy="9.0" r="2.6"/><circle cx="40.8" cy="10.8" r="2.6"/><circle cx="48.3" cy="15.7" r="2.6"/><circle cx="53.2" cy="23.2" r="2.6"/><circle cx="55.0" cy="32.0" r="2.6"/><circle cx="53.2" cy="40.8" r="2.6"/><circle cx="48.3" cy="48.3" r="2.6"/><circle cx="40.8" cy="53.2" r="2.6"/><circle cx="32.0" cy="55.0" r="2.6"/><circle cx="23.2" cy="53.2" r="2.6"/><circle cx="15.7" cy="48.3" r="2.6"/><circle cx="10.8" cy="40.8" r="2.6"/><circle cx="9.0" cy="32.0" r="2.6"/><circle cx="10.8" cy="23.2" r="2.6"/><circle cx="15.7" cy="15.7" r="2.6"/><circle cx="23.2" cy="10.8" r="2.6"/><circle cx="32" cy="32" r="23"/></g><circle cx="32" cy="32" r="21.4" fill="#efe3c6"/><circle cx="32" cy="32" r="20.6" fill="#1d3a7a"/>
      <g class="tk-tile"><path transform="rotate(0 32 32)" d="M32 13 C35 15 36 18 33.6 21 C32.6 21.6 32 22.4 32 22.4 C32 22.4 31.4 21.6 30.4 21 C28 18 29 15 32 13Z" fill="#e3b24f" stroke="#6b4a12" stroke-width=".3"/><path transform="rotate(45 32 32)" d="M32 13 C35 15 36 18 33.6 21 C32.6 21.6 32 22.4 32 22.4 C32 22.4 31.4 21.6 30.4 21 C28 18 29 15 32 13Z" fill="#e3b24f" stroke="#6b4a12" stroke-width=".3"/><path transform="rotate(90 32 32)" d="M32 13 C35 15 36 18 33.6 21 C32.6 21.6 32 22.4 32 22.4 C32 22.4 31.4 21.6 30.4 21 C28 18 29 15 32 13Z" fill="#e3b24f" stroke="#6b4a12" stroke-width=".3"/><path transform="rotate(135 32 32)" d="M32 13 C35 15 36 18 33.6 21 C32.6 21.6 32 22.4 32 22.4 C32 22.4 31.4 21.6 30.4 21 C28 18 29 15 32 13Z" fill="#e3b24f" stroke="#6b4a12" stroke-width=".3"/><path transform="rotate(180 32 32)" d="M32 13 C35 15 36 18 33.6 21 C32.6 21.6 32 22.4 32 22.4 C32 22.4 31.4 21.6 30.4 21 C28 18 29 15 32 13Z" fill="#e3b24f" stroke="#6b4a12" stroke-width=".3"/><path transform="rotate(225 32 32)" d="M32 13 C35 15 36 18 33.6 21 C32.6 21.6 32 22.4 32 22.4 C32 22.4 31.4 21.6 30.4 21 C28 18 29 15 32 13Z" fill="#e3b24f" stroke="#6b4a12" stroke-width=".3"/><path transform="rotate(270 32 32)" d="M32 13 C35 15 36 18 33.6 21 C32.6 21.6 32 22.4 32 22.4 C32 22.4 31.4 21.6 30.4 21 C28 18 29 15 32 13Z" fill="#e3b24f" stroke="#6b4a12" stroke-width=".3"/><path transform="rotate(315 32 32)" d="M32 13 C35 15 36 18 33.6 21 C32.6 21.6 32 22.4 32 22.4 C32 22.4 31.4 21.6 30.4 21 C28 18 29 15 32 13Z" fill="#e3b24f" stroke="#6b4a12" stroke-width=".3"/><circle cx="32" cy="32" r="8" fill="#e3b24f"/><circle cx="32" cy="32" r="6.6" fill="#efe3c6"/><path transform="rotate(0 32 32)" d="M32 30 C33.6 28.6 33.6 26.4 32 25.2 C30.4 26.4 30.4 28.6 32 30Z" fill="#a8322a"/><path transform="rotate(45 32 32)" d="M32 30 C33.6 28.6 33.6 26.4 32 25.2 C30.4 26.4 30.4 28.6 32 30Z" fill="#2a9fb3"/><path transform="rotate(90 32 32)" d="M32 30 C33.6 28.6 33.6 26.4 32 25.2 C30.4 26.4 30.4 28.6 32 30Z" fill="#a8322a"/><path transform="rotate(135 32 32)" d="M32 30 C33.6 28.6 33.6 26.4 32 25.2 C30.4 26.4 30.4 28.6 32 30Z" fill="#2a9fb3"/><path transform="rotate(180 32 32)" d="M32 30 C33.6 28.6 33.6 26.4 32 25.2 C30.4 26.4 30.4 28.6 32 30Z" fill="#a8322a"/><path transform="rotate(225 32 32)" d="M32 30 C33.6 28.6 33.6 26.4 32 25.2 C30.4 26.4 30.4 28.6 32 30Z" fill="#2a9fb3"/><path transform="rotate(270 32 32)" d="M32 30 C33.6 28.6 33.6 26.4 32 25.2 C30.4 26.4 30.4 28.6 32 30Z" fill="#a8322a"/><path transform="rotate(315 32 32)" d="M32 30 C33.6 28.6 33.6 26.4 32 25.2 C30.4 26.4 30.4 28.6 32 30Z" fill="#2a9fb3"/><circle cx="32" cy="32" r="1.6" fill="#c48f2c"/></g>
      <ellipse cx="24" cy="20" rx="9" ry="4" fill="#fff" opacity=".18" transform="rotate(-35 24 20)"/>`,
  },
  // تخت جمشید: «سرباز جاویدان»؛ نیم‌رخ سنگی مثل نقش‌برجسته‌های پلکان آپادانا، با نیزه‌ای که آرام تکان می‌خورد (کارتونی نیست)
  persepolis: {
    hi: "درود! من سرباز جاویدانم؛ با هر کلمه، یه تیکه از کاخ‌های تخت جمشید دوباره ساخته می‌شه.",
    go: "بریم بسازیم!",
    svg: `<circle cx="32" cy="32" r="30" fill="#d9a63e"/><circle cx="32" cy="32" r="28.4" fill="#3d3833"/><circle cx="32" cy="32" r="26.6" fill="#cdbd9c"/>
      <g stroke="#5e4c38" stroke-width=".7" stroke-linejoin="round">
        <path d="M15 61C15 50 20 44 28.5 42.2H40.5C47 44 50 50 50 61Z" fill="#bcaa86"/>
        <path d="M25 47c2 5 2.6 9 2.4 14M33 44.6c.6 5 .4 11-.2 16M41 46c-1 5-1 10-.4 15" fill="none" opacity=".6"/>
        <path d="M27.5 36.5V43.5H35V36.5Z" fill="#cdbd9c"/>
        <path d="M21.6 18.6L20.4 8.6H38.6L37.4 18.6Z" fill="#b9a785"/>
        <path d="M24 10V18M27 10V18M30 10V18M33 10V18M36 10V18" opacity=".7"/>
        <path d="M21.8 18.6H37.4L38.4 22.6L42.6 27L39.6 27.8L39.9 29.8L38.6 30.8H29C25.6 30.8 22.6 28.6 21.8 25Z" fill="#dacbaa"/>
        <circle cx="23.2" cy="28.4" r="3.6" fill="#9c8868"/>
        <path d="M29 30.2H39.2C40.8 33.4 41 37.6 40.2 42H31C29.4 38.4 28.6 34.2 29 30.2Z" fill="#9c8868"/>
        <path d="M29.4 21.6c2 .2 2.6 3.2.4 4.4" fill="none"/>
      </g>
      <g fill="#5e4c38"><circle cx="30.8" cy="32.5" r=".75"/><circle cx="33.0" cy="32.5" r=".75"/><circle cx="35.2" cy="32.5" r=".75"/><circle cx="37.4" cy="32.5" r=".75"/><circle cx="31.400000000000002" cy="35" r=".75"/><circle cx="33.6" cy="35" r=".75"/><circle cx="35.800000000000004" cy="35" r=".75"/><circle cx="38.0" cy="35" r=".75"/><circle cx="30.8" cy="37.5" r=".75"/><circle cx="33.0" cy="37.5" r=".75"/><circle cx="35.2" cy="37.5" r=".75"/><circle cx="37.4" cy="37.5" r=".75"/><circle cx="31.400000000000002" cy="40" r=".75"/><circle cx="33.6" cy="40" r=".75"/><circle cx="35.800000000000004" cy="40" r=".75"/><circle cx="38.0" cy="40" r=".75"/><circle cx="21.6" cy="26.4" r=".7"/><circle cx="23.8" cy="26" r=".7"/><circle cx="22.4" cy="28.6" r=".7"/><circle cx="24.6" cy="28.4" r=".7"/><circle cx="23.2" cy="30.6" r=".7"/><path d="M34.4 22.2q1.5-1 2.8 0q-1.3.9-2.8 0z"/><path d="M34 20.6q1.8-1.2 3.6-.2" fill="none" stroke="#5e4c38" stroke-width=".6"/></g>
      <g class="tk-spear"><path d="M51 7V58" stroke="#5e4c38" stroke-width="1.6"/><path d="M51 2.4l2.2 5.4h-4.4z" fill="#d9a63e" stroke="#7a5410" stroke-width=".4"/><circle cx="51" cy="57.4" r="2.2" fill="#d9a63e" stroke="#7a5410" stroke-width=".4"/><ellipse cx="48.6" cy="47" rx="3" ry="2.4" fill="#dacbaa" stroke="#5e4c38" stroke-width=".6"/></g>
      <ellipse cx="22" cy="17" rx="9" ry="4" fill="#fff" opacity=".14" transform="rotate(-35 22 17)"/>`,
  },
  // مزرعه‌ی شاد (بخش کودک): «جوجو»، جوجه‌ی زرد مزرعه؛ همین جوجو گوشه‌ی صفحه‌ی بازی هم می‌ایستد
  toon: {
    hi: "آفرین! 🐥 من جوجوام، از مزرعه اومدم پیشت.",
    go: "بریم مزرعه!",
    svg: `<path d="M25 56v5M39 56v5M21.5 62h7M35.5 62h7" stroke="#ff8a3a" stroke-width="2.6" stroke-linecap="round"/>
      <ellipse cx="13" cy="39" rx="5.5" ry="9" fill="#f5c22a" transform="rotate(28 13 39)"/><ellipse cx="51" cy="39" rx="5.5" ry="9" fill="#f5c22a" transform="rotate(-28 51 39)"/>
      <circle cx="32" cy="37" r="20" fill="#ffd84a"/>
      <path d="M29.5 18c-3-6 1-10 4-7c1.5-5 7.5-2.5 4 2.5" fill="#ffd84a" stroke="#f5c22a" stroke-width="1.4" stroke-linejoin="round"/>
      <ellipse cx="25" cy="27" rx="5" ry="3" fill="#fff" opacity=".35" transform="rotate(-25 25 27)"/>
      ${TK_EYES(34, 7.5)}
      <path d="M27.5 42q4.5-3.4 9 0q-4.5 4.6-9 0Z" fill="#ff8a3a"/>
      ${TK_CHEEKS(42, 13.5)}`,
  },
  // زیر دریا (بخش کودک): «هشتی»، هشت‌پای کوچولوی بنفش؛ همین هشتی گوشه‌ی صفحه‌ی بازی هم شنا می‌کند
  sea: {
    hi: "آفرین! 🐙 من هشتی‌ام، از ته دریا اومدم پیشت.",
    go: "بریم زیر آب!",
    svg: `<g fill="none" stroke="#a77ce8" stroke-width="5" stroke-linecap="round">
        <path d="M17 40q-8 8 -5 15q2 4 6 1"/><path d="M24 44q-3 9 -1 13q2 3 5 0"/><path d="M32 45v10q0 4 3 3"/>
        <path d="M40 44q3 9 1 13q-2 3 -5 0"/><path d="M47 40q8 8 5 15q-2 4 -6 1"/></g>
      <g fill="#ffd0f0"><circle cx="13" cy="51" r="1.2"/><circle cx="24" cy="54" r="1.2"/><circle cx="40" cy="54" r="1.2"/><circle cx="51" cy="51" r="1.2"/></g>
      <path d="M12 34c0-14 9-24 20-24s20 10 20 24c0 7-9 11-20 11s-20-4-20-11Z" fill="#b98cf2"/>
      <ellipse cx="24" cy="19" rx="6" ry="3.5" fill="#fff" opacity=".35" transform="rotate(-25 24 19)"/>
      <g fill="#9a6ae0"><circle cx="40" cy="17" r="2.2"/><circle cx="45" cy="23" r="1.5"/><circle cx="20" cy="27" r="1.3"/></g>
      ${TK_EYES(31, 7.5)}${TK_SMILE(39)}${TK_CHEEKS(37, 13.5)}
      <g fill="none" stroke="#fff" stroke-width="1.2" opacity=".9"><circle cx="54" cy="12" r="3"/><circle cx="58" cy="5" r="1.8"/></g>`,
  },  // سفر فضایی (بخش کودک): «زیپو»، آدم‌فضایی سبز با دو شاخک؛ همین زیپو گوشه‌ی صفحه‌ی بازی هم می‌ایستد
  space: {
    hi: "آفرین! 👽 من زیپوام، از یه سیاره‌ی دور اومدم پیشت.",
    go: "بریم فضا!",
    svg: `<g class="zp-ant" stroke="#58d97a" stroke-width="2.4" stroke-linecap="round" fill="none"><path d="M24 16q-4 -7 -8 -9"/><path d="M40 16q4 -7 8 -9"/></g>
      <circle cx="16" cy="7" r="3.6" fill="#ffd34a"/><circle cx="48" cy="7" r="3.6" fill="#ffd34a"/>
      <path d="M22 56v4h6M42 56v4h-6" stroke="#3fb862" stroke-width="3" stroke-linecap="round" fill="none"/>
      <ellipse cx="12" cy="42" rx="4" ry="6" fill="#58d97a" transform="rotate(30 12 42)"/><ellipse cx="52" cy="42" rx="4" ry="6" fill="#58d97a" transform="rotate(-30 52 42)"/>
      <path d="M12 36c0-13 9-22 20-22s20 9 20 22c0 13-9 22-20 22s-20-9-20-22Z" fill="#7cf08a"/>
      <path d="M17 46h30q-2 9 -15 10q-13 -1 -15 -10z" fill="#9a7cff"/><circle cx="32" cy="50" r="2.4" fill="#ffd34a"/>
      <ellipse cx="22" cy="23" rx="5" ry="3" fill="#fff" opacity=".4" transform="rotate(-30 22 23)"/>
      ${TK_EYES(32, 8)}${TK_SMILE(40)}${TK_CHEEKS(38, 14)}`,
  },
};

const tourTheme = () => TOUR_THEMES[activeTheme] || TOUR_THEMES.plain;
const tourWords = (text) => text.replace("{hi}", tourTheme().hi).replace("{go}", tourTheme().go);

const tourEl = document.createElement("div");
tourEl.className = "tour hidden";
tourEl.innerHTML = `<div class="tour-hole"></div>
  <div class="tour-card" role="dialog" aria-live="polite">
    <svg class="tour-kalami" viewBox="0 0 64 64" aria-hidden="true"></svg>
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
  tourEl.querySelector(".tour-kalami").innerHTML = tourTheme().svg;
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
  tourEl.querySelector(".tour-text").textContent = tourWords(step.text);
  tourEl.querySelector(".tour-next").textContent = i === steps.length - 1 ? tourWords(step.last || "تموم!") : "بعدی";
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

// چرخ کلمه‌ی بچه‌ها: بعد از اولین کلمه، با راهنمای همان ظاهر (در «مزرعه‌ی شاد»، جوجو)
gameHooks.push((name) => {
  if (name !== "found" || !tourWants("kids")) return;
  if (typeof isKidsPlay !== "function" || !isKidsPlay()) return;
  setTimeout(() => tourWhenClear("kids", () => screenNow === "play" && isKidsPlay()), 1100);
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
