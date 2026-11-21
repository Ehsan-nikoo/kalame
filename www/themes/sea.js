// ظاهر «زیر دریا» (فقط بخش کودک، پولی): آب آبی، نور خورشید از بالا، حباب، جلبک و مرجان‌های رنگی.
// هر مرحله‌ی چرخ کلمه‌ی بچه‌ها یک دوست دریایی (۱۶ جور) به آکواریوم می‌آورد؛ هر آکواریوم ۵ دوست دارد و بعد آکواریوم تازه شروع می‌شود.
// ۴۰ آکواریوم با اسم، رنگ آب، رنگ شن و مرجان و تزئین بزرگ خودشان (کشتی، قصر، گنج، زیردریایی، ...).
// «هشتی» (همان راهنمای آموزش در tour.js) گوشه‌ی صفحه‌ی بازی شنا می‌کند و با هر کلمه بالا می‌پرد.
// مثل مزرعه‌ی شاد، دو رویداد مخصوص بخش کودک را هم دارد (kids.js): kidsmenu و kidswin.
(function () {
  "use strict";

  const PARTS = 5;
  // هر آکواریوم: [اسم، رنگ آب، تزئین، رنگ مرجان، رنگ شن]
  const TANKS = [
    ["صخره‌ی مرجانی", "tropic", "coral", "pink", "gold"],
    ["کشتی غرق‌شده", "deep", "ship", "orange", "gold"],
    ["گنج دزد دریایی", "tropic", "chest", "red", "gold"],
    ["جنگل جلبک", "green", "kelp", "teal", "dark"],
    ["قصر زیر آب", "purple", "castle", "pink", "pink"],
    ["خلیج ستاره‌ها", "night", "shells", "purple", "dark"],
    ["دریای غروب", "sunset", "arch", "orange", "pink"],
    ["تالاب سبز", "lagoon", "amphora", "teal", "gold"],
    ["زیردریایی نارنجی", "deep", "sub", "red", "gold"],
    ["آتشفشان دریایی", "deep", "volcano", "orange", "dark"],
    ["دریای یخی", "ice", "ice", "purple", "white"],
    ["لنگرگاه قدیمی", "green", "anchor", "orange", "dark"],
    ["غار صدف‌ها", "purple", "cave", "pink", "white"],
    ["سکان گمشده", "tropic", "wheel", "teal", "gold"],
    ["شهر حباب‌ها", "lagoon", "bubbles", "purple", "white"],
    ["دریای شب‌تاب", "night", "kelp", "teal", "dark"],
    ["جزیره‌ی کیش", "tropic", "shells", "pink", "white"],
    ["جزیره‌ی هرمز", "sunset", "arch", "red", "pink"],
    ["خلیج فارس", "tropic", "ship", "orange", "gold"],
    ["دریای خزر", "green", "amphora", "teal", "dark"],
    ["باغ مرجان صورتی", "purple", "coral", "pink", "pink"],
    ["قصر مروارید", "lagoon", "castle", "purple", "white"],
    ["صندوق طلایی", "deep", "chest", "orange", "gold"],
    ["دریای آرام", "ice", "bubbles", "teal", "white"],
    ["کوه شنی", "sunset", "volcano", "pink", "gold"],
    ["کوچه‌ی ماهی‌ها", "tropic", "cave", "orange", "gold"],
    ["دریای بنفش", "purple", "kelp", "pink", "pink"],
    ["گنج کوزه‌ها", "lagoon", "amphora", "orange", "gold"],
    ["زیردریایی خواب‌آلود", "night", "sub", "purple", "dark"],
    ["لنگر طلایی", "deep", "anchor", "red", "gold"],
    ["صخره‌ی لاک‌پشت‌ها", "green", "arch", "teal", "gold"],
    ["قطب جنوب", "ice", "ice", "teal", "white"],
    ["دریای رنگین‌کمان", "sunset", "coral", "red", "pink"],
    ["کشتی دزدهای مهربون", "night", "ship", "purple", "dark"],
    ["دریای عسلی", "lagoon", "shells", "orange", "gold"],
    ["غار شب‌تاب", "night", "cave", "teal", "dark"],
    ["سکان طلایی", "sunset", "wheel", "orange", "pink"],
    ["دریای آبی", "tropic", "bubbles", "pink", "gold"],
    ["قصر یخی", "ice", "castle", "teal", "white"],
    ["آتشفشان شب", "night", "volcano", "red", "dark"],
  ].map(([name, water, deco, coral, sand]) => ({ name, water, deco, coral, sand }));
  // آکواریوم شماره‌ی n (بعد از تمام شدن فهرست، از اول)
  const tankOf = (n) => TANKS[n % TANKS.length];
  const tankName = (n) => tankOf(n).name;
  // آب: [بالا، میانه، پایین، تیره‌ترین (برای پس‌زمینه‌ی صفحه)]
  const WATER = {
    tropic: ["#7fe0ff", "#3fb0ea", "#2a8fd6", "#2380c8"],
    deep: ["#5ab4ec", "#2a7fc8", "#1b5ea8", "#164f92"],
    lagoon: ["#9af2dc", "#46cdb6", "#24a494", "#1d8a80"],
    sunset: ["#ffc8aa", "#f59ab0", "#9a74dc", "#7a5cc8"],
    night: ["#3a64b8", "#23448c", "#152c66", "#0f2050"],
    purple: ["#d2b4ff", "#9a78ec", "#6a4fc6", "#5a42b8"],
    green: ["#b2ecaa", "#5cc496", "#2f9478", "#277e66"],
    ice: ["#e6f8ff", "#a8def4", "#62b2de", "#4a9ad0"],
  };
  const CORAL = { pink: ["#ff7fa8", "#ffa64d"], purple: ["#b48cff", "#ff7fa8"], orange: ["#ff9e4d", "#ffd34a"], red: ["#ff5f6d", "#ffb23a"], teal: ["#3fd1b0", "#ff8fcf"] };
  const SANDS = { gold: ["#ffe2a6", "#f6cf86"], white: ["#fff3dc", "#ecdcb8"], pink: ["#ffd9d2", "#f2bcb2"], dark: ["#dcc496", "#b99c6a"] };

  // تزئین بزرگ هر آکواریوم، پشت دوست‌ها؛ دور (۰،۰) روی شن کشیده شده
  const DECO = {
    coral: (c) => `<path d="M0 0v-26M0 -12l-10 -10M0 -18l8 -12M-10 -22l-2 -8M8 -30l5 -5M0 -26l-4 -6" stroke="${c[0]}" stroke-width="4.4" stroke-linecap="round" fill="none"/>
      <g transform="translate(-20 0)"><path d="M0 0c-9 -2 -11 -15 0 -17c11 2 9 15 0 17z" fill="${c[1]}"/></g>`,
    ship: () => `<g transform="rotate(-10)"><path d="M-28 0l4 -14h46l6 14z" fill="#9a6a44"/><path d="M-24 -14h46l-2 -6h-42z" fill="#b8865a"/>
      <g fill="#5a3a22"><circle cx="-12" cy="-7" r="2.4"/><circle cx="0" cy="-7" r="2.4"/><circle cx="12" cy="-7" r="2.4"/></g>
      <path d="M-2 -20v-24" stroke="#7a5236" stroke-width="2.4"/><path d="M-1 -42l14 6l-14 6z" fill="#efe3c6" opacity=".85"/></g>`,
    chest: (c) => `<rect x="-12" y="-12" width="24" height="12" rx="1.6" fill="#a8693f"/><path d="M-12 -12q12 -14 24 0z" fill="#c98a55" transform="rotate(-24 -12 -12)"/>
      <rect x="-12" y="-9" width="24" height="2.2" fill="#e8b94a"/><rect x="-2" y="-10" width="4" height="5" rx="1" fill="#e8b94a"/>
      <g fill="#ffd34a"><circle cx="-6" cy="-13" r="2.4"/><circle cx="-1" cy="-15" r="2.4"/><circle cx="4" cy="-13" r="2.4"/></g>
      <g fill="#fff" opacity=".8"><path d="M-4 -22l1 3l3 1l-3 1l-1 3l-1 -3l-3 -1l3 -1z"/><path d="M8 -20l.7 2l2 .7l-2 .7l-.7 2l-.7 -2l-2 -.7l2 -.7z"/></g>`,
    kelp: (c) => [-14, -4, 8].map((x, i) => `<path class="sea-weed" style="animation-delay:${-i * 0.6}s" d="M${x} 0q-6 -10 0 -20q6 -10 0 -20q-5 -8 0 -16" stroke="${i % 2 ? "#3fae7a" : "#2c9468"}" stroke-width="5" fill="none" stroke-linecap="round"/>`).join("") +
      `<g fill="${c[1]}"><circle cx="-9" cy="-30" r="2"/><circle cx="2" cy="-44" r="2"/></g>`,
    castle: (c) => `<g fill="${c[0]}" opacity=".95"><rect x="-14" y="-24" width="28" height="24"/><rect x="-20" y="-34" width="9" height="34"/><rect x="11" y="-34" width="9" height="34"/>
      <path d="M-20 -34v-3h3v3h3v-3h3v3zM11 -34v-3h3v3h3v-3h3v3z"/></g>
      <path d="M-20.6 -36l5 -9l5 9zM10.4 -36l5 -9l5 9z" fill="${c[1]}"/>
      <path d="M-5 0v-10q5 -7 10 0v10z" fill="#5a3a6a"/><g fill="#5a3a6a"><rect x="-17" y="-26" width="3" height="5" rx="1.5"/><rect x="14" y="-26" width="3" height="5" rx="1.5"/></g>`,
    shells: (c) => `<g transform="translate(-10 0)"><path d="M-9 0c-1 -10 4 -16 9 -16s10 6 9 16z" fill="${c[0]}"/><path d="M0 -15v14M-5 -13l2 12M5 -13l-2 12" stroke="#fff" stroke-width="1" opacity=".7"/></g>
      <g transform="translate(10 0) rotate(-20)"><path d="M-6 0c0 -6 3 -14 6 -18c4 4 7 12 6 18z" fill="${c[1]}"/><path d="M-3 -5h7M-2 -10h5" stroke="#fff" stroke-width=".9" opacity=".7"/></g>`,
    arch: () => `<path d="M-30 0c0 -20 8 -32 30 -32s30 12 30 32h-10c0 -14 -6 -22 -20 -22s-20 8 -20 22z" fill="#8a7bb0" opacity=".9"/>
      <path d="M-26 -18c4 -6 10 -10 16 -11M14 -26c4 2 8 6 10 10" stroke="#a99ad0" stroke-width="2" fill="none" stroke-linecap="round"/>`,
    amphora: () => `<g transform="rotate(-62)"><path d="M-4 -26h8v4c6 3 9 9 7 16c-2 5 -6 6 -11 6s-9 -1 -11 -6c-2 -7 1 -13 7 -16z" fill="#c9784a"/>
      <path d="M-11 -14h22" stroke="#8a4a2a" stroke-width="1.6"/><path d="M-4 -24q-6 0 -6 6M4 -24q6 0 6 6" stroke="#a8603a" stroke-width="1.6" fill="none"/></g>`,
    sub: () => `<g transform="translate(0 -18)"><path d="M-22 0c0 -8 10 -12 22 -12s20 4 22 12c-2 8 -10 12 -22 12s-22 -4 -22 -12z" fill="#ff9a3a"/>
      <rect x="-6" y="-19" width="12" height="8" rx="2" fill="#ff9a3a"/><path d="M2 -19v-7h6" stroke="#5a6a7a" stroke-width="1.6" fill="none"/>
      <g fill="#bfeaff" stroke="#d86a1a" stroke-width="1"><circle cx="-10" r="3.2"/><circle cx="0" r="3.2"/><circle cx="10" r="3.2"/></g>
      <path d="M-22 -2l-6 -5v14z" fill="#d86a1a"/></g>`,
    volcano: () => `<path d="M-26 0l16 -26h20l16 26z" fill="#8a6a5a"/><path d="M-10 -26h20l-4 6q-6 -3 -12 0z" fill="#ff7a3a"/>
      <g fill="none" stroke="#fff" stroke-width=".9" opacity=".85"><circle cx="0" cy="-32" r="2.4"/><circle cx="3" cy="-40" r="1.8"/><circle cx="-2" cy="-47" r="1.4"/></g>`,
    ice: () => `<path d="M-26 0l6 -18l8 6l6 -20l8 16l6 -8l8 24z" fill="#f4fbff"/><path d="M-6 -32l8 16l-10 16z" fill="#cfe9f6"/>`,
    anchor: () => `<g transform="rotate(14)" fill="none" stroke="#5f6f82" stroke-width="3.4" stroke-linecap="round"><path d="M0 -36v34"/><path d="M-14 -12q0 12 14 12q14 0 14 -12"/><path d="M-8 -30h16"/><circle cx="0" cy="-40" r="3.4"/></g>`,
    cave: () => `<path d="M-32 0c-2 -18 10 -34 32 -34s34 16 32 34z" fill="#7a6a96"/><path d="M-14 0c0 -10 6 -18 14 -18s14 8 14 18z" fill="#2e2448"/>
      <g fill="#ffe27a"><circle cx="-5" cy="-8" r="1.3"/><circle cx="5" cy="-8" r="1.3"/></g>`,
    wheel: () => `<g transform="translate(0 -6) rotate(18)"><circle r="12" fill="none" stroke="#9a6a44" stroke-width="3"/><circle r="3" fill="#9a6a44"/>
      <path d="M0 -17V17M-17 0H17M-12 -12L12 12M12 -12L-12 12" stroke="#9a6a44" stroke-width="2" stroke-linecap="round"/></g>`,
    bubbles: () => `<g fill="none" stroke="#fff" stroke-width="1.2" opacity=".9"><circle cx="-8" cy="-14" r="8"/><circle cx="8" cy="-24" r="6"/><circle cx="-2" cy="-34" r="4"/><circle cx="10" cy="-8" r="5"/></g>
      <g fill="#fff" opacity=".7"><circle cx="-11" cy="-18" r="1.6"/><circle cx="6" cy="-27" r="1.2"/></g>`,
  };

  const EYE = (x, y, r = 1.6) =>
    `<circle cx="${x}" cy="${y}" r="${r}" fill="#1d2433"/><circle cx="${x + r * 0.35}" cy="${y - r * 0.38}" r="${r * 0.38}" fill="#fff"/>`;
  const BLUSH = (x, y) => `<ellipse cx="${x}" cy="${y}" rx="2.1" ry="1.3" fill="#ff7f9e" opacity=".7"/>`;
  const SMILE = (x, y, w = 2.2) => `<path d="M${x - w} ${y}q${w} ${w * 0.9} ${w * 2} 0" stroke="#1d2433" stroke-width=".9" fill="none" stroke-linecap="round"/>`;
  const SAND = (w) => `<ellipse cx="0" cy="0" rx="${w}" ry="2" fill="#b98b4a" opacity=".25"/>`;

  // هر دوست دریایی دور نقطه‌ی (۰،۰) زیر بدنش کشیده شده، رو به راست، حدود ۳۰ واحد قد.
  // swim: در آب شناور است (بالاتر از شن)؛ بقیه روی شن می‌نشینند.
  const FRIENDS = [
    { name: "ماهی دلقک", swim: true, svg: `
      <path d="M-10 -12l-8 -7q-1.5 7 0 14z" fill="#ff8a3a" stroke="#1d2433" stroke-width=".7" stroke-linejoin="round"/>
      <path d="M-4 -19q5 -6 10 -1z" fill="#ff8a3a" stroke="#1d2433" stroke-width=".7"/>
      <ellipse cx="0" cy="-12" rx="12.5" ry="8" fill="#ff8a3a" stroke="#1d2433" stroke-width=".7"/>
      <path d="M-5.5 -19.4q2.6 7.4 0 14.8h3.6q2.6 -7.4 0 -14.8z" fill="#fff" stroke="#1d2433" stroke-width=".6"/>
      <path d="M4 -19q2 7 0 14h3q2.4 -7 0 -14z" fill="#fff" stroke="#1d2433" stroke-width=".6"/>
      <path d="M-1 -8q3 4 6 1" fill="#ff8a3a" stroke="#1d2433" stroke-width=".6"/>
      ${EYE(8.6, -14, 1.7)}${SMILE(9.6, -9.6, 1.4)}` },
    { name: "لاک‌پشت", swim: true, svg: `
      <ellipse cx="-9" cy="-6" rx="5" ry="2.4" fill="#8fd16a" transform="rotate(25 -9 -6)"/>
      <ellipse cx="7" cy="-5" rx="5" ry="2.4" fill="#8fd16a" transform="rotate(-25 7 -5)"/>
      <ellipse cx="-8" cy="-18" rx="5" ry="2.4" fill="#8fd16a" transform="rotate(-25 -8 -18)"/>
      <circle cx="15" cy="-13" r="5.2" fill="#8fd16a"/>
      <path d="M-14 -11a13 9.5 0 0 1 26 0z" fill="#3aa676"/>
      <path d="M-14 -11h26" stroke="#2c7f5a" stroke-width="2.2" stroke-linecap="round"/>
      <g fill="#5cc48d"><path d="M-3 -18l3 -1.6l3 1.6v3.2l-3 1.6l-3 -1.6z"/><path d="M-10 -13.5l2.6 -2l2.8 1.2l-.2 2.8h-4.8z"/><path d="M4.4 -12.5l.2 -2.6l2.8 -1.2l2.4 1.8l-.4 2z"/></g>
      ${EYE(16.4, -14.4, 1.4)}${SMILE(16.4, -11.6, 1.2)}` },
    { name: "ستاره‌ی دریایی", svg: `${SAND(11)}
      <path d="M0 -24c1.8 0 2.6 4.6 4 7.2c2.6 .6 8.6 .6 9.2 2.4c.6 1.8 -4.4 4.6 -6 6.6c.6 2.8 3 8.2 1.4 9.4c-1.6 1.2 -6 -2.4 -8.6 -3.4c-2.6 1 -7 4.6 -8.6 3.4c-1.6 -1.2 .8 -6.6 1.4 -9.4c-1.6 -2 -6.6 -4.8 -6 -6.6c.6 -1.8 6.6 -1.8 9.2 -2.4c1.4 -2.6 2.2 -7.2 4 -7.2z" fill="#ff7a6b" stroke="#e0533f" stroke-width=".8" stroke-linejoin="round"/>
      <g fill="#ffd0b8"><circle cx="0" cy="-19" r=".9"/><circle cx="8" cy="-14" r=".9"/><circle cx="-8" cy="-14" r=".9"/><circle cx="4.6" cy="-4.6" r=".9"/><circle cx="-4.6" cy="-4.6" r=".9"/></g>
      ${EYE(-2.6, -12.4, 1.4)}${EYE(2.6, -12.4, 1.4)}${SMILE(0, -9.6, 1.6)}` },
    { name: "خرچنگ", svg: `${SAND(13)}
      <path d="M-8 -4l-5 4M-5 -3l-3 4M8 -4l5 4M5 -3l3 4" stroke="#d8432f" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M-10 -10q-6 -3 -6 -10" stroke="#d8432f" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M10 -10q6 -3 6 -10" stroke="#d8432f" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M-16 -19c-4 -1 -5 -6 -2 -8c1 2 2.6 2.6 4.6 2c.6 3 -.4 5.6 -2.6 6z" fill="#ff5a45"/>
      <path d="M16 -19c4 -1 5 -6 2 -8c-1 2 -2.6 2.6 -4.6 2c-.6 3 .4 5.6 2.6 6z" fill="#ff5a45"/>
      <path d="M-3.5 -14v-6M3.5 -14v-6" stroke="#d8432f" stroke-width="1.4"/>
      <ellipse cx="0" cy="-8" rx="11" ry="7" fill="#ff5a45"/>
      <ellipse cx="-3" cy="-11" rx="4" ry="1.6" fill="#fff" opacity=".3"/>
      <circle cx="-3.5" cy="-21" r="2.7" fill="#fff"/><circle cx="3.5" cy="-21" r="2.7" fill="#fff"/>
      ${EYE(-3.2, -21, 1.5)}${EYE(3.8, -21, 1.5)}${SMILE(0, -6.4, 2)}${BLUSH(-6.4, -7)}${BLUSH(6.4, -7)}` },
    { name: "اسب دریایی", swim: true, svg: `
      <path d="M-1 -26c5 -2 9 1 9 5c0 4 -4 5 -4 9c0 4 3 5 3 8c0 4 -4 6 -7 4c-2.4 -1.6 -1 -4 1 -3.4" fill="none" stroke="#ffc23a" stroke-width="5.4" stroke-linecap="round"/>
      <path d="M-3 -15q-6 -1 -6 -6q4 -1 6 3z" fill="#ffd96a"/>
      <circle cx="3" cy="-24" r="6" fill="#ffc23a"/>
      <path d="M7 -23.5l7 -.6q1.4 1.6 0 3.2l-7 .4z" fill="#ffc23a"/>
      <path d="M-1 -30l1.6 -3l1.6 2.6l1.8 -2.4l1 3" fill="#ff9a3a"/>
      <path d="M-.6 -14q-3 1 -5 -1" stroke="#ff9a3a" stroke-width="1.6" fill="none" stroke-linecap="round"/>
      ${EYE(4.6, -25.4, 1.5)}${BLUSH(3.6, -21.2)}` },
    { name: "عروس دریایی", swim: true, svg: `
      <path d="M-7 -16q-2 5 1 9q2 4 -1 8M-2.4 -16q-1.6 6 1 10q1.6 4 -.6 8M2.4 -16q2 5 -.6 9q-2 4 .6 8M7 -16q2 6 -1 10q-2 3 1 6" stroke="#c08aff" stroke-width="1.6" fill="none" stroke-linecap="round" opacity=".9"/>
      <path d="M-11 -15c0 -9 5 -14 11 -14s11 5 11 14q-2.8 1.6 -5.5 0q-2.8 1.6 -5.5 0q-2.8 1.6 -5.5 0q-2.8 1.6 -5.5 0z" fill="#ff9ad5"/>
      <ellipse cx="-4" cy="-24" rx="3" ry="2" fill="#fff" opacity=".55"/>
      ${EYE(-3.6, -19.4, 1.5)}${EYE(3.6, -19.4, 1.5)}${SMILE(0, -17, 1.6)}${BLUSH(-7, -17.6)}${BLUSH(7, -17.6)}` },
    { name: "نهنگ کوچولو", swim: true, svg: `
      <path d="M-14 -14q-5 -8 -7 -6q1 4 3 7q-3 2 -4 6q4 0 7 -3z" fill="#4f8ff0"/>
      <path d="M-15 -10c0 -9 8 -13 16 -13s14 5 14 12c0 6 -6 9 -14 9s-16 -2 -16 -8z" fill="#4f8ff0"/>
      <path d="M-11 -6c4 3 18 4 25 -2c-1 4 -6 6 -12 6s-11 -1 -13 -4z" fill="#bfe1ff"/>
      <path d="M3 -24q0 -5 -3 -7M3 -24q0 -5 3 -7M3 -24v-6" stroke="#9fd8ff" stroke-width="1.4" fill="none" stroke-linecap="round"/>
      ${EYE(8, -13.6, 1.6)}${SMILE(10.6, -9.4, 1.4)}${BLUSH(10.6, -11)}` },
    { name: "ماهی بادکنکی", swim: true, svg: `
      <path d="M-11 -14l-6 -5v10z" fill="#f5b52a"/>
      <g stroke="#e09a1a" stroke-width="1.4" stroke-linecap="round">
        <path d="M0 -25v-3M6.5 -23l1.6 -2.4M-6.5 -23l-1.6 -2.4M10 -16.4h2.6M-10 -16.4h-2.6M6.5 -6l1.6 2.4M-6.5 -6l-1.6 2.4M0 -3.6v3"/></g>
      <circle cx="0" cy="-14.5" r="11" fill="#ffd34a"/>
      <path d="M-9 -9.5q9 6.5 18 0q-2 5.5 -9 6q-7 -.5 -9 -6z" fill="#fff3c4"/>
      <g fill="#f0b030"><circle cx="-4" cy="-20" r="1"/><circle cx="2" cy="-21.6" r="1"/><circle cx="-6.4" cy="-14" r="1"/></g>
      ${EYE(3.4, -16, 1.8)}<circle cx="8" cy="-12.6" r="1.4" fill="#ff8a5c"/>${BLUSH(5, -11.6)}` },
    { name: "دلفین", swim: true, svg: `
      <path d="M-15 -8q-6 -5 -8 -2q3 1 4 3q-3 2 -3 5q4 -1 7 -4z" fill="#5fb3e8"/>
      <path d="M-16 -8c3 -9 13 -14 22 -12c4 1 7 3 9 6l6 1q0 2 -5 3c-3 4 -10 6 -18 5c-6 0 -11 -1 -14 -3z" fill="#5fb3e8"/>
      <path d="M-1 -19q2 -6 6 -7q0 4 -1 7z" fill="#4a9ad0"/>
      <path d="M-12 -6c6 2 16 2 23 -3q-4 6 -12 6q-7 0 -11 -3z" fill="#d6efff"/>
      <path d="M-2 -6l3 4l2 -4" fill="#4a9ad0"/>
      ${EYE(11, -14, 1.5)}${SMILE(15, -10.4, 1.2)}` },
    { name: "صدف مروارید", svg: `${SAND(12)}
      <path d="M-11 -3c0 -4 5 -6 11 -6s11 2 11 6c0 2 -5 3 -11 3s-11 -1 -11 -3z" fill="#ffb3c8"/>
      <circle cx="0" cy="-8" r="4.2" fill="#fff"/><circle cx="-1.3" cy="-9.4" r="1.4" fill="#fff" opacity=".9"/><circle cx="0" cy="-8" r="4.2" fill="url(#seaPearl)" opacity=".5"/>
      <path d="M-12 -6c-1 -10 5 -18 12 -18s13 8 12 18q-6 -3 -12 -3t-12 3z" fill="#ff8fb3"/>
      <path d="M0 -21v12M-6 -19l3 10M6 -19l-3 10M-10 -14l6 5M10 -14l-6 5" stroke="#ffd0de" stroke-width="1.3" stroke-linecap="round"/>
      ${EYE(-3.4, -14, 1.4)}${EYE(3.4, -14, 1.4)}${SMILE(0, -11.6, 1.4)}` },
    { name: "ماهی آبی", swim: true, svg: `
      <path d="M-11 -13l-7 -6q-1 7 0 13z" fill="#ffd34a"/>
      <path d="M-11 -13c0 -8 6 -12 12 -12s12 5 12 12s-6 11 -12 11s-12 -4 -12 -11z" fill="#3f7fe8"/>
      <path d="M-8 -20q8 -2 12 4q4 6 -2 12q4 -10 -10 -16z" fill="#1d2f6a"/>
      <path d="M-4 -24q6 -3 12 1z" fill="#2f5fc8"/>
      ${EYE(8, -15, 1.6)}${SMILE(9.6, -10.6, 1.2)}${BLUSH(7, -11.8)}` },
    { name: "کوسه کوچولو", swim: true, svg: `
      <path d="M-17 -12l-6 -8q0 8 1 9q-1 1 -1 9z" fill="#8aa6c0"/>
      <path d="M-18 -11c4 -7 14 -11 24 -10c6 1 10 4 12 9c-2 4 -6 6 -12 6c-10 1 -20 -1 -24 -5z" fill="#8aa6c0"/>
      <path d="M-4 -20l4 -9l5 8z" fill="#7a96b0"/><path d="M-14 -9c8 3 20 3 28 0c-3 3 -7 4 -14 4s-11 -1 -14 -4z" fill="#eaf2f8"/>
      <path d="M-4 -7l3 5l2 -5" fill="#7a96b0"/>
      ${EYE(10, -14, 1.5)}<path d="M11 -8.6q2 1.4 4 0" stroke="#1d2433" stroke-width=".9" fill="none" stroke-linecap="round"/>${BLUSH(12, -10.6)}` },
    { name: "سفره‌ماهی", swim: true, svg: `
      <path d="M-2 -12q-10 4 -20 10" stroke="#9a7ad8" stroke-width="1.6" fill="none" stroke-linecap="round"/>
      <path d="M14 -12c-4 -6 -10 -10 -16 -11c-4 4 -10 6 -16 6c6 2 12 4 16 9c6 0 12 -1 16 -4z" fill="#b49aef"/>
      <path d="M8 -12c-4 -3 -8 -4 -12 -3c4 2 8 3 12 3z" fill="#d4c4ff"/>
      ${EYE(8, -14.6, 1.3)}${EYE(10.6, -13, 1.1)}${SMILE(10, -10.6, 1.1)}` },
    { name: "خارپشت دریایی", svg: `${SAND(10)}
      <g stroke="#7a4fc8" stroke-width="1.4" stroke-linecap="round">${Array.from({ length: 11 }, (_, i) => {
        const a = Math.PI + (i * Math.PI) / 10;
        return `<path d="M${(Math.cos(a) * 8).toFixed(1)} ${(-6 + Math.sin(a) * 8).toFixed(1)}L${(Math.cos(a) * 14).toFixed(1)} ${(-6 + Math.sin(a) * 14).toFixed(1)}"/>`;
      }).join("")}</g>
      <path d="M-10 0c0 -10 4 -16 10 -16s10 6 10 16z" fill="#9a6ae8"/>
      ${EYE(-3.4, -8, 1.4)}${EYE(3.4, -8, 1.4)}${SMILE(0, -5.2, 1.4)}${BLUSH(-6.4, -5.4)}${BLUSH(6.4, -5.4)}` },
    { name: "حلزون دریایی", svg: `${SAND(12)}
      <path d="M-12 0c0 -3 4 -4 10 -4h12c3 0 4 2 4 4z" fill="#ffb98a"/>
      <path d="M8 -4v-6M11 -4v-5" stroke="#ffb98a" stroke-width="1.6" stroke-linecap="round"/><circle cx="8" cy="-10.6" r="1.4" fill="#1d2433"/><circle cx="11" cy="-9.6" r="1.4" fill="#1d2433"/>
      <circle cx="-3" cy="-11" r="9" fill="#ff7fa8"/><path d="M-3 -11m-6 0a6 6 0 1 1 6 6a3.6 3.6 0 1 1 -2 -6" stroke="#fff" stroke-width="1.3" fill="none" opacity=".8"/>
      ${SMILE(12, -2.2, 1)}` },
    { name: "فک", svg: `${SAND(13)}
      <path d="M-14 -2q-6 -2 -8 -6q4 -1 8 2z" fill="#9aa4b4"/>
      <path d="M-14 -1c0 -6 8 -10 16 -12c4 -4 6 -10 10 -10c6 0 8 6 7 10c-1 5 -6 8 -10 9c-4 2 -6 4 -6 4z" fill="#b6c0cc"/>
      <path d="M-4 -1q4 -3 6 -6q2 4 0 6z" fill="#9aa4b4"/>
      ${EYE(14, -18, 1.5)}<circle cx="19" cy="-15.6" r="1.4" fill="#1d2433"/><path d="M18 -14l-3 1M18 -14l-2 2M20 -14l3 1" stroke="#5a6472" stroke-width=".5"/>${BLUSH(15.6, -13.8)}` },
  ];
  // هر آکواریوم پنج دوست پشت سر هم از فهرست؛ آکواریوم بعدی از دوست بعدی شروع می‌کند
  const friendOf = (tank, i) => FRIENDS[(tank * PARTS + i) % FRIENDS.length];

  // جای دوست‌ها در صحنه‌ی ۲۰۰×۱۰۰: [x، y زیر پا روی شن، اندازه، رو به چپ، چقدر بالاتر اگر شناور باشد]
  const SLOTS = [[30, 92, 1, false, 24], [66, 86, 0.9, true, 36], [100, 94, 1.05, false, 22], [136, 87, 0.9, true, 38], [170, 93, 1, false, 24]];

  let uid = 0;
  // آکواریوم با count دوست اول؛ دوست شماره‌ی fresh با شنا وارد می‌شود؛ جای خالی بقیه یک حباب «؟» است
  function tankSVG(tank, count, fresh) {
    const k = "sq" + ++uid;
    const parts = SLOTS.map(([x, y, s, flip, lift], i) => {
      const f = friendOf(tank, i);
      const yy = f.swim && i < count ? y - lift : y;
      if (i >= count) {
        return `<g transform="translate(${x} ${y - 30})"><g class="sea-q" style="animation-delay:${(-i * 0.5).toFixed(1)}s"><circle r="9" fill="#fff" opacity=".35" stroke="#fff" stroke-width="1.4"/>` +
          `<ellipse cx="-3.4" cy="-3.6" rx="2.4" ry="1.4" fill="#fff" opacity=".8" transform="rotate(-35 -3.4 -3.6)"/>` +
          `<text y="4.6" text-anchor="middle" font-family="Lalezar, Vazirmatn, sans-serif" font-size="12.5" fill="#fff">؟</text></g></g>`;
      }
      return `<g transform="translate(${x} ${yy}) scale(${flip ? -s : s} ${s})"><g class="${f.swim ? "sea-swim" : "sea-sit"}" style="animation-delay:${(-i * 0.43).toFixed(2)}s">` +
        `<g${i === fresh ? ' class="sea-new"' : ""}>${f.svg}</g></g></g>`;
    }).join("");
    const t = tankOf(tank), w = WATER[t.water], c = CORAL[t.coral], sd = SANDS[t.sand];
    const deco = `<g transform="translate(120 93)" opacity=".92">${DECO[t.deco](c)}</g>`;
    const weeds = [[8, "#3fbf7f"], [190, "#2fae8a"]].map(([x, c], i) =>
      `<path class="sea-weed" style="animation-delay:${-i * 0.7}s" d="M${x} 100q-5 -10 0 -20q5 -10 0 -20" stroke="${c}" stroke-width="4" fill="none" stroke-linecap="round"/>`).join("");
    return `<svg class="sea-tank" viewBox="0 0 200 100" aria-hidden="true">
      <defs>
        <clipPath id="${k}c"><rect width="200" height="100" rx="14"/></clipPath>
        <linearGradient id="${k}w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${w[0]}"/><stop offset=".6" stop-color="${w[1]}"/><stop offset="1" stop-color="${w[2]}"/></linearGradient>
        <radialGradient id="seaPearl" cx=".35" cy=".35" r=".7"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#d8c8ff"/></radialGradient>
      </defs>
      <g clip-path="url(#${k}c)">
        <rect width="200" height="100" fill="url(#${k}w)"/>
        <g fill="#fff" opacity=".16"><path d="M20 0h14l-30 100h-8z"/><path d="M80 0h10l-6 100h-14z"/><path d="M140 0h16l24 100h-12z"/></g>
        <path d="M0 6q12 -4 25 0t25 0t25 0t25 0t25 0t25 0t25 0t25 0V0H0z" fill="#fff" opacity=".35"/>
        ${t.water === "night" ? [[20, 20], [70, 14], [150, 18], [184, 40], [96, 34]].map(([x, y]) => `<circle class="sea-glow" cx="${x}" cy="${y}" r="1.3" fill="#bff6ff"/>`).join("") : ""}
        ${weeds}${deco}
        <g transform="translate(176 96)"><path d="M0 0v-14M0 -8l-6 -6M0 -11l5 -7M-6 -14l-1 -5M5 -18l3 -3" stroke="${c[0]}" stroke-width="3" stroke-linecap="round" fill="none"/></g>
        <g transform="translate(48 97)"><path d="M0 0c-10 -2 -12 -16 0 -18c12 2 10 16 0 18z" fill="${c[1]}" opacity=".9"/><path d="M0 0v-15M0 -6l-5 -6M0 -6l5 -6M0 -11l-3 -4M0 -11l3 -4" stroke="#fff" stroke-opacity=".5" stroke-width=".9"/></g>
        <path d="M0 90Q50 84 100 90T200 88V100H0Z" fill="${sd[0]}"/>
        <path d="M0 95Q60 91 120 96T200 94V100H0Z" fill="${sd[1]}"/>
        <g fill="#fff8e6"><circle cx="16" cy="96" r="1.2"/><circle cx="88" cy="97" r="1"/><circle cx="182" cy="97" r="1.2"/><circle cx="124" cy="98" r=".9"/></g>
        ${parts}
        <g class="sea-tank-bubbles" fill="none" stroke="#fff" stroke-width=".8" opacity=".8"><circle cx="40" cy="40" r="2"/><circle cx="43" cy="30" r="1.3"/><circle cx="160" cy="34" r="1.8"/><circle cx="157" cy="24" r="1.1"/></g>
      </g>
    </svg>`;
  }

  // پس‌زمینه‌ی صفحه‌ی بازی و دنیای کودک: آب، نور، ماهی‌های دور، جلبک، مرجان و شن
  function sceneSVG(id) {
    const fish = (x, y, s, c) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-9 0l-6 -5v10z" fill="${c}"/><ellipse rx="9" ry="5" fill="${c}"/><circle cx="4.4" cy="-1" r="1.2" fill="#1d2433"/></g>`;
    const school = [[0, 0, 1], [18, -10, 0.8], [20, 12, 0.85], [36, 2, 0.7]].map(([x, y, s]) => fish(x, y, s, "#ffffff")).join("");
    const weed = (x, h, c, d) => `<path class="sea-weed" style="animation-delay:${d}s" d="M${x} 800q-14 -${h / 4} 0 -${h / 2}q14 -${h / 4} 0 -${h / 2}" stroke="${c}" stroke-width="11" fill="none" stroke-linecap="round"/>`;
    const shells = [];
    const colors = ["#ff9ab8", "#fff", "#ffd36a", "#c8a6ff", "#ff9e6b"];
    for (let i = 0; i < 18; i++) {
      const x = (i * 173) % 400, y = 748 + ((i * 41) % 46);
      shells.push(`<circle cx="${x}" cy="${y}" r="${i % 3 ? 2.6 : 3.6}" fill="${colors[i % colors.length]}" opacity=".9"/>`);
    }
    return `<svg viewBox="0 0 400 800" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <defs>
        <linearGradient id="${id}-w" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style="stop-color:var(--sea-w0,#8ce6ff)"/><stop offset=".35" style="stop-color:var(--sea-w1,#46bdf0)"/><stop offset=".75" style="stop-color:var(--sea-w2,#2a93d8)"/><stop offset="1" style="stop-color:var(--sea-w3,#2380c8)"/></linearGradient>
        <linearGradient id="${id}-ray" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".45"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
      </defs>
      <rect width="400" height="800" fill="url(#${id}-w)"/>
      <g class="sea-rays" fill="url(#${id}-ray)"><path d="M40 0h46l-90 640h-40z"/><path d="M170 0h30l-10 560h-60z"/><path d="M290 0h50l100 620h-50z"/></g>
      <path d="M0 18q25 -12 50 0t50 0t50 0t50 0t50 0t50 0t50 0t50 0V0H0z" fill="#fff" opacity=".4"/>
      <g class="sea-school" opacity=".55">${school}</g>
      <g class="sea-school s2" opacity=".4">${[[0, 0, 0.9], [16, 8, 0.7]].map(([x, y, s]) => fish(x, y, s, "#ffe27a")).join("")}</g>
      <path d="M0 700Q60 640 120 668Q150 610 210 650Q260 620 300 660Q350 630 400 650V800H0Z" fill="#1e6fb0" opacity=".35"/>
      ${weed(26, 220, "#2fae8a", 0)}${weed(52, 160, "#57c98a", -1.2)}${weed(360, 240, "#2fae8a", -0.6)}${weed(384, 150, "#57c98a", -1.8)}
      <g transform="translate(300 742)"><path d="M0 0v-46M0 -20l-18 -16M0 -30l14 -20M-18 -36l-4 -14M14 -50l8 -8M0 -46l-6 -10" stroke="#ff7fa8" stroke-width="9" stroke-linecap="round" fill="none"/></g>
      <g transform="translate(96 748)"><path d="M0 0c-30 -4 -36 -48 0 -54c36 6 30 50 0 54z" fill="#ffa64d"/><path d="M0 -2v-46M0 -16l-14 -18M0 -16l14 -18M0 -32l-8 -12M0 -32l8 -12" stroke="#ffd08f" stroke-width="2.4" fill="none"/></g>
      <g transform="translate(200 752)"><ellipse rx="24" ry="9" fill="#a77ce8"/><g fill="#c8a6ff"><circle cx="-12" cy="-6" r="7"/><circle cx="2" cy="-10" r="9"/><circle cx="15" cy="-5" r="6.5"/></g></g>
      <path d="M0 744Q100 722 200 740T400 734V800H0Z" fill="#ffe2a6"/>
      <path d="M0 772Q120 756 240 774T400 766V800H0Z" fill="#f6cf86"/>
      ${shells.join("")}
    </svg>`;
  }

  // حباب‌هایی که آرام از پایین صفحه بالا می‌روند
  function bubbles(box, n) {
    for (let i = 0; i < n; i++) {
      const b = document.createElement("i");
      b.className = "sea-bubble";
      const size = 6 + ((i * 7) % 14);
      b.style.width = b.style.height = size + "px";
      b.style.left = ((i * 37 + 11) % 96) + "%";
      b.style.animationDuration = 7 + ((i * 3) % 7) + "s";
      b.style.animationDelay = -((i * 1.9) % 12) + "s";
      box.appendChild(b);
    }
  }

  // آکواریومی که الان پر می‌شود (از روی همه‌ی مرحله‌های چرخ کلمه‌ی بچه‌ها)
  const curTank = () => Math.floor(((typeof kwState === "function" && kwState().lv) || 0) / PARTS);
  // آب پس‌زمینه‌ی صفحه‌ی بازی و دنیای کودک هم رنگ آکواریوم فعلی می‌شود
  function tint(tank) {
    const w = WATER[tankOf(tank).water], st = document.documentElement.style;
    w.forEach((c, i) => st.setProperty(`--sea-w${i}`, c));
  }
  function untint() {
    const st = document.documentElement.style;
    [0, 1, 2, 3].forEach((i) => st.removeProperty(`--sea-w${i}`));
  }

  const PAL = () => (typeof TOUR_THEMES === "object" && TOUR_THEMES.sea ? TOUR_THEMES.sea.svg : "");

  function pal(move) {
    const el = document.querySelector(".sea-pal");
    if (!el) return;
    el.classList.remove("hop", "no", "spin", "hi");
    void el.offsetWidth;
    el.classList.add(move);
  }

  // حباب‌هایی که از خانه‌های تازه پر شده بالا می‌روند و می‌ترکند
  function pop(cells) {
    if (!cells || (typeof calm === "function" && calm())) return;
    cells.slice(0, 8).forEach((cell, i) => {
      const r = cell.getBoundingClientRect();
      for (let j = 0; j < 2; j++) {
        const s = document.createElement("span");
        s.className = "sea-pop";
        s.style.left = r.left + r.width * (0.3 + j * 0.4) + "px";
        s.style.top = r.top + r.height / 2 + "px";
        s.style.animationDelay = i * 70 + j * 120 + "ms";
        document.body.appendChild(s);
        setTimeout(() => s.remove(), 1100 + i * 70);
      }
    });
  }

  function bump(cls) {
    const wheel = document.getElementById("wheel");
    wheel.classList.remove("sea-wobble", "sea-swirl");
    void wheel.offsetWidth;
    wheel.classList.add(cls);
  }

  defineTheme("sea", {
    // اسم مرحله همان آکواریومی است که در فهرست بازی‌های کودک پر می‌شود
    name: () => tankName(curTank()),

    setup() {
      const bg = document.createElement("div");
      bg.className = "sea-bg";
      bg.innerHTML = sceneSVG("sb");
      bubbles(bg, 9);
      document.body.prepend(bg);
      const palEl = document.createElement("div");
      palEl.className = "sea-pal";
      palEl.innerHTML = `<svg viewBox="0 0 64 64" aria-hidden="true">${PAL()}</svg>`;
      document.body.appendChild(palEl);
      const kw = document.getElementById("kidsWorld");
      if (kw) {
        const kbg = document.createElement("div");
        kbg.className = "sea-kw";
        kbg.innerHTML = sceneSVG("sk");
        bubbles(kbg, 7);
        kw.prepend(kbg);
      }
      tint(curTank());
      return () => {
        untint();
        document.querySelectorAll(".sea-bg, .sea-pal, .sea-kw, .sea-pop").forEach((el) => el.remove());
      };
    },

    on: {
      level() {
        tint(curTank());
        pal("hi");
      },
      found(d) {
        pop(d.cells);
        pal("hop");
      },
      hint(d) {
        pop(d.cells);
      },
      wrong() {
        bump("sea-wobble");
        pal("no");
      },
      shuffle() {
        bump("sea-swirl");
        pal("spin");
      },
      kidsmenu(d) {
        const done = d.lv || 0;
        const tank = Math.floor(done / PARTS), count = done % PARTS;
        tint(tank);
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "sea-tank-btn";
        btn.innerHTML = tankSVG(tank, count, -1) + `<span class="sea-tank-cap"></span>`;
        const cap = btn.querySelector(".sea-tank-cap");
        cap.textContent = count
          ? `${tankName(tank)} · ${faDigits(count)} از ${faDigits(PARTS)} دوست`
          : tank ? `دریای تازه: ${tankName(tank)}` : `${tankName(tank)} · دوستای دریایی منتظرتن!`;
        btn.setAttribute("aria-label", cap.textContent);
        btn.onclick = () => {
          const g = document.querySelector(".kw-g-wheel");
          if (g) g.click();
        };
        const stage = document.getElementById("kwStage");
        if (stage) stage.prepend(btn);
      },
      kidswin(d) {
        const n = Math.max(0, (d.lv || 1) - 1);
        const tank = Math.floor(n / PARTS), step = n % PARTS;
        const stage = document.getElementById("kwStage");
        if (!stage) return;
        const pic = stage.querySelector(".kw-pic");
        if (pic) pic.outerHTML = `<div class="sea-win">${tankSVG(tank, step + 1, step)}</div>`;
        const word = stage.querySelector(".kw-word");
        if (word) {
          word.classList.add("sea-joined");
          word.textContent = step === PARTS - 1 ? `${tankName(tank)} پر شد! 🎉` : `${friendOf(tank, step).name} اومد پیشت!`;
        }
      },
    },
  });
})();
