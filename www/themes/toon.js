// ظاهر «مزرعه‌ی شاد» (فقط بخش کودک): کارتونی و رنگی، با آسمان آبی، تپه‌های سبز و طویله‌ی قرمز.
// هر مرحله‌ی چرخ کلمه‌ی بچه‌ها یک حیوان به مزرعه می‌آورد؛ هر مزرعه ۵ حیوان دارد و بعد مزرعه‌ی تازه شروع می‌شود.
// «جوجو» (همان راهنمای آموزش در tour.js) گوشه‌ی صفحه می‌ایستد و با هر کلمه بالا و پایین می‌پرد.
// دو رویداد مخصوص بخش کودک را هم دارد (kids.js): kidsmenu (مزرعه بالای فهرست بازی‌ها) و kidswin (حیوان تازه).
(function () {
  "use strict";

  const PARTS = 5;
  const FARMS = ["مزرعه‌ی شاد", "مزرعه‌ی آفتابی", "مزرعه‌ی رنگین‌کمان", "مزرعه‌ی گل‌گلی", "مزرعه‌ی ابری", "مزرعه‌ی ستاره"];
  const farmName = (farm) => FARMS[farm % FARMS.length];

  const EYE = (x, y, r = 1.6) =>
    `<circle cx="${x}" cy="${y}" r="${r}" fill="#2b2118"/><circle cx="${x + r * 0.35}" cy="${y - r * 0.38}" r="${r * 0.36}" fill="#fff"/>`;
  const BLUSH = (x, y) => `<ellipse cx="${x}" cy="${y}" rx="2.2" ry="1.4" fill="#ff8fa3" opacity=".75"/>`;
  const SHADOW = (w) => `<ellipse cx="0" cy="0" rx="${w}" ry="2.2" fill="#2f6b1e" opacity=".22"/>`;

  // هر حیوان دور نقطه‌ی (۰،۰) زیر پایش کشیده شده، رو به راست، حدود ۳۰ واحد قد
  const ANIMALS = [
    { name: "جوجه", svg: `${SHADOW(10)}
      <path d="M-3 -1v-4M3 -1v-4" stroke="#ff8a3a" stroke-width="1.6" stroke-linecap="round"/>
      <ellipse cx="0" cy="-10" rx="10" ry="8.5" fill="#ffd84a"/>
      <circle cx="5" cy="-18" r="7" fill="#ffd84a"/>
      <ellipse cx="-2" cy="-10" rx="5" ry="3.4" fill="#f5c22a" transform="rotate(-15 -2 -10)"/>
      <path d="M4 -24.5q-1.5 -4 1.5 -4.5q.5 2.5 -.5 4.5z" fill="#f5c22a"/>
      ${EYE(7, -19.5, 1.7)}<path d="M11.5 -18.5l4.5 1.5l-4.5 1.8z" fill="#ff8a3a"/>${BLUSH(8.5, -15.5)}` },
    { name: "گاو", svg: `${SHADOW(15)}
      <g fill="#fff" stroke="#e0d8ca" stroke-width=".6"><rect x="-11" y="-8" width="4" height="8" rx="1.5"/><rect x="-4.5" y="-8" width="4" height="8" rx="1.5"/><rect x="3" y="-8" width="4" height="8" rx="1.5"/><rect x="8.5" y="-8" width="4" height="8" rx="1.5"/></g>
      <g fill="#5a4636"><rect x="-11" y="-2" width="4" height="2" rx=".8"/><rect x="-4.5" y="-2" width="4" height="2" rx=".8"/><rect x="3" y="-2" width="4" height="2" rx=".8"/><rect x="8.5" y="-2" width="4" height="2" rx=".8"/></g>
      <path d="M-14 -15q-4.5 2 -3 8" stroke="#3b2a1a" stroke-width="1.2" fill="none" stroke-linecap="round"/>
      <ellipse cx="-1" cy="-13" rx="14" ry="8.5" fill="#fff" stroke="#e0d8ca" stroke-width=".6"/>
      <path d="M-10 -18q4 -3.5 7.5 .5q-.5 5 -5.5 4.5q-3.5 -1.5 -2 -5z" fill="#3b2a1a"/><ellipse cx="3.5" cy="-9.5" rx="3.6" ry="2.6" fill="#3b2a1a"/>
      <path d="M9.5 -24q-1.5 -4 -3.5 -4M16 -24q1.5 -4 3.5 -4" stroke="#d9b27a" stroke-width="2" stroke-linecap="round" fill="none"/>
      <ellipse cx="6" cy="-21.5" rx="3.2" ry="1.7" fill="#fff" stroke="#e0d8ca" stroke-width=".6" transform="rotate(-20 6 -21.5)"/>
      <ellipse cx="13" cy="-19" rx="7" ry="6.5" fill="#fff" stroke="#e0d8ca" stroke-width=".6"/>
      <ellipse cx="16" cy="-15" rx="5" ry="3.6" fill="#ffb3c1"/><circle cx="14.4" cy="-15" r=".8" fill="#c46a7d"/><circle cx="17.6" cy="-15" r=".8" fill="#c46a7d"/>
      ${EYE(13.5, -21)}` },
    { name: "گوسفند", svg: `${SHADOW(13)}
      <path d="M-7 -6v6M-2 -6v6M4 -6v6M8.5 -6v6" stroke="#4a3b35" stroke-width="2.4" stroke-linecap="round"/>
      <g fill="#fff" stroke="#e3ddd2" stroke-width=".6"><circle cx="-8" cy="-12" r="5.5"/><circle cx="-2" cy="-16.5" r="6"/><circle cx="5" cy="-15.5" r="5.5"/><circle cx="7.5" cy="-9" r="5"/><circle cx="-1" cy="-7.5" r="5.5"/><circle cx="-9" cy="-7" r="4.5"/></g>
      <ellipse cx="-1" cy="-12" rx="9" ry="6" fill="#fff"/>
      <ellipse cx="9" cy="-18" rx="3" ry="1.5" fill="#4a3b35" transform="rotate(-25 9 -18)"/>
      <ellipse cx="13" cy="-15" rx="5" ry="6.2" fill="#4a3b35"/><circle cx="12" cy="-21" r="3.2" fill="#fff"/>
      <circle cx="14.6" cy="-16" r="1.8" fill="#fff"/><circle cx="15.1" cy="-16" r="1" fill="#2b2118"/>${BLUSH(15, -12.5)}` },
    { name: "اردک", svg: `${SHADOW(11)}
      <path d="M-5 0h5l-2 -3zM1 0h5l-2 -3z" fill="#ff8a3a"/>
      <path d="M-10 -10l-5.5 -4l2 6.5z" fill="#fff" stroke="#dfe6ea" stroke-width=".6"/>
      <ellipse cx="0" cy="-8" rx="11" ry="6.5" fill="#fff" stroke="#dfe6ea" stroke-width=".6"/>
      <rect x="4" y="-18" width="6.5" height="9" fill="#fff"/>
      <circle cx="7.5" cy="-18.5" r="6" fill="#fff" stroke="#dfe6ea" stroke-width=".6"/>
      <path d="M-6 -9q5 -5 10 0q-5 3 -10 0z" fill="#e3ecf1"/>
      <path d="M12.5 -19q6.5 -1.5 6.5 1.5q0 2.5 -6.5 1.5z" fill="#ff8a3a"/>
      ${EYE(9, -20, 1.5)}${BLUSH(9.5, -15.8)}` },
    { name: "خرگوش", svg: `${SHADOW(10)}
      <circle cx="-9.5" cy="-6" r="3" fill="#fff" stroke="#ddd5c8" stroke-width=".5"/>
      <ellipse cx="-1" cy="-8" rx="9" ry="8" fill="#f2efe9" stroke="#ddd5c8" stroke-width=".6"/>
      <ellipse cx="4" cy="-1.5" rx="4" ry="1.8" fill="#fff" stroke="#ddd5c8" stroke-width=".5"/>
      <g transform="rotate(-12 2 -27)"><ellipse cx="2" cy="-27" rx="2.4" ry="7" fill="#f2efe9" stroke="#ddd5c8" stroke-width=".6"/><ellipse cx="2" cy="-27" rx="1.1" ry="5" fill="#ffb3c1"/></g>
      <g transform="rotate(12 7 -27)"><ellipse cx="7" cy="-27" rx="2.4" ry="7" fill="#f2efe9" stroke="#ddd5c8" stroke-width=".6"/><ellipse cx="7" cy="-27" rx="1.1" ry="5" fill="#ffb3c1"/></g>
      <circle cx="5" cy="-17" r="6.5" fill="#f2efe9" stroke="#ddd5c8" stroke-width=".6"/>
      ${EYE(7, -18)}<circle cx="11" cy="-16" r="1.1" fill="#ff8fa3"/>${BLUSH(8, -14)}` },
    { name: "اسب", svg: `${SHADOW(15)}
      <g fill="#a8673a"><rect x="-11" y="-10" width="3.6" height="10" rx="1.4"/><rect x="-5" y="-10" width="3.6" height="10" rx="1.4"/><rect x="4" y="-10" width="3.6" height="10" rx="1.4"/><rect x="9" y="-10" width="3.6" height="10" rx="1.4"/></g>
      <g fill="#4a3020"><rect x="-11" y="-2" width="3.6" height="2" rx=".8"/><rect x="-5" y="-2" width="3.6" height="2" rx=".8"/><rect x="4" y="-2" width="3.6" height="2" rx=".8"/><rect x="9" y="-2" width="3.6" height="2" rx=".8"/></g>
      <path d="M-13 -17q-7 2 -5.5 11q3 -4 4.5 -8z" fill="#5a3218"/>
      <ellipse cx="-1" cy="-14" rx="13.5" ry="7.5" fill="#c17a45"/>
      <path d="M6 -17l6 -12l6.5 2.5l-4 12z" fill="#c17a45"/>
      <path d="M14 -30l1 -4.5l2.5 4z" fill="#c17a45"/>
      <ellipse cx="18" cy="-26" rx="7.5" ry="4.6" transform="rotate(30 18 -26)" fill="#c17a45"/>
      <ellipse cx="22" cy="-23" rx="3.4" ry="2.8" fill="#e0a578"/><circle cx="23" cy="-22.5" r=".7" fill="#7a4a28"/>
      <path d="M8.5 -18q0 -9 5 -13q-1 6 .5 10z" fill="#5a3218"/>
      ${EYE(17, -28, 1.5)}` },
    { name: "بز", svg: `${SHADOW(13)}
      <path d="M-8 -7v7M-3 -7v7M4 -7v7M8 -7v7" stroke="#cbb89a" stroke-width="2.6" stroke-linecap="round"/>
      <path d="M-11 -14l-3.5 -4.5l1.5 6z" fill="#efe3cc"/>
      <ellipse cx="0" cy="-12" rx="11.5" ry="6.5" fill="#efe3cc"/><ellipse cx="-3" cy="-14" rx="4" ry="2.5" fill="#dcc8a2"/>
      <path d="M10 -23.5q-2 -5 -5.5 -5M13 -23.5q0 -5 -2 -6.5" stroke="#9c8462" stroke-width="1.7" fill="none" stroke-linecap="round"/>
      <ellipse cx="7" cy="-20" rx="3.2" ry="1.4" fill="#e2d2b2" transform="rotate(25 7 -20)"/>
      <ellipse cx="12" cy="-19" rx="5" ry="5.5" fill="#efe3cc"/>
      <path d="M12.5 -14.5l1 5l2 -5z" fill="#cbb89a"/>
      ${EYE(13.5, -20, 1.5)}<circle cx="16.5" cy="-17" r=".7" fill="#7a6248"/>${BLUSH(14, -16)}` },
    { name: "گربه", svg: `${SHADOW(10)}
      <path d="M-6 -2q-8 -2 -6.5 -10" stroke="#f0a050" stroke-width="3" fill="none" stroke-linecap="round"/>
      <ellipse cx="0" cy="-8" rx="7.5" ry="8" fill="#f6b25c"/><ellipse cx="1" cy="-7" rx="4" ry="5.5" fill="#ffe2b8"/>
      <ellipse cx="-2.5" cy="-1" rx="2.5" ry="1.5" fill="#ffe2b8"/><ellipse cx="3.5" cy="-1" rx="2.5" ry="1.5" fill="#ffe2b8"/>
      <path d="M-6.5 -22l1 -7.5l5.5 4.5zM6.5 -22l-1 -7.5l-5.5 4.5z" fill="#f6b25c"/>
      <ellipse cx="0" cy="-19" rx="7.5" ry="6.5" fill="#f6b25c"/>
      <path d="M-2 -25v2.5M0 -25.5v3M2 -25v2.5" stroke="#e08a2e" stroke-width="1" stroke-linecap="round"/>
      ${EYE(-2.8, -19.5, 1.4)}${EYE(2.8, -19.5, 1.4)}<path d="M-.9 -17h1.8l-.9 1.1z" fill="#ff8fa3"/>
      <path d="M-4 -16.5h-5M-4 -15.5l-4.5 1.5M4 -16.5h5M4 -15.5l4.5 1.5" stroke="#9a6a3a" stroke-width=".5"/>
      ${BLUSH(-4.6, -16.6)}${BLUSH(4.6, -16.6)}` },
    { name: "سگ", svg: `${SHADOW(11)}
      <path d="M-7 -4q-6 -3 -5 -9.5" stroke="#d9a066" stroke-width="2.8" fill="none" stroke-linecap="round"/>
      <ellipse cx="0" cy="-8" rx="8" ry="8" fill="#e8b878"/><ellipse cx="0" cy="-7" rx="4.5" ry="5.5" fill="#fff3dc"/>
      <ellipse cx="-3" cy="-1" rx="2.6" ry="1.6" fill="#fff3dc"/><ellipse cx="3" cy="-1" rx="2.6" ry="1.6" fill="#fff3dc"/>
      <ellipse cx="0" cy="-19" rx="7.5" ry="7" fill="#e8b878"/>
      <ellipse cx="-7" cy="-19" rx="2.7" ry="5.2" fill="#8a5a32" transform="rotate(18 -7 -19)"/><ellipse cx="7" cy="-19" rx="2.7" ry="5.2" fill="#8a5a32" transform="rotate(-18 7 -19)"/>
      <ellipse cx="0" cy="-15.5" rx="4" ry="3" fill="#fff3dc"/><ellipse cx="0" cy="-17" rx="1.7" ry="1.2" fill="#3b2a1a"/>
      <path d="M-1.3 -13.6q1.3 3.2 2.6 0z" fill="#ff7a8a"/>
      ${EYE(-3, -21, 1.5)}${EYE(3, -21, 1.5)}` },
    { name: "مرغ", svg: `${SHADOW(10)}
      <path d="M-2 -4v4M3 -4v4" stroke="#ff8a3a" stroke-width="1.6" stroke-linecap="round"/>
      <path d="M-8 -13q-7 -5 -5 -12.5q4 5 8.5 7z" fill="#8a4a20"/>
      <ellipse cx="0" cy="-10" rx="10" ry="8" fill="#c9733d"/>
      <ellipse cx="-1.5" cy="-10" rx="5" ry="3.5" fill="#a85a2a"/>
      <path d="M4 -22.5q1 -3.5 3 -1.2q1 -3.2 3.2 -.6q1.2 -2 2 .8l-2 2z" fill="#e5484d"/>
      <circle cx="7" cy="-18" r="5.5" fill="#c9733d"/>
      <path d="M12 -18.5l4 1.2l-4 1.6z" fill="#ffc21a"/><ellipse cx="11" cy="-14.5" rx="1.3" ry="2" fill="#e5484d"/>
      ${EYE(8, -19, 1.4)}` },
  ];
  // حیوان شماره‌ی i مزرعه‌ی farm؛ هر مزرعه پنج حیوان پشت سر هم از فهرست، با شروع متفاوت
  const animalOf = (farm, i) => ANIMALS[(farm * 3 + i) % ANIMALS.length];

  // جای حیوان‌ها روی چمن صحنه‌ی ۲۰۰×۱۰۰: [x، y زیر پا، اندازه، رو به چپ]
  const SLOTS = [[32, 91, 1, false], [68, 83, 0.88, true], [101, 94, 1.05, false], [134, 85, 0.9, true], [168, 94, 1, false]];

  let uid = 0;
  // مزرعه با count حیوان اول؛ حیوان شماره‌ی fresh با پریدن وارد می‌شود؛ جای خالی بقیه «؟» است
  function farmSVG(farm, count, fresh) {
    const k = "tf" + ++uid;
    const rays = Array.from({ length: 8 }, (_, i) =>
      `<path d="M0 -13.5V-18" transform="rotate(${i * 45})" stroke="#ffd84a" stroke-width="2.6" stroke-linecap="round"/>`).join("");
    const parts = SLOTS.map(([x, y, s, flip], i) => {
      if (i >= count) {
        return `<g transform="translate(${x} ${y - 11})"><circle r="8.5" fill="#fff" opacity=".75" stroke="#8cc9e8" stroke-width="1.6" stroke-dasharray="3 2.4"/>` +
          `<text y="4.6" text-anchor="middle" font-family="Lalezar, Vazirmatn, sans-serif" font-size="12.5" fill="#7aaecb">؟</text></g>`;
      }
      const a = animalOf(farm, i).svg;
      return `<g transform="translate(${x} ${y}) scale(${flip ? -s : s} ${s})"><g class="toon-a" style="animation-delay:${(-i * 0.37).toFixed(2)}s">` +
        `<g${i === fresh ? ' class="toon-new"' : ""}>${a}</g></g></g>`;
    }).join("");
    const flowers = [[12, 97, "#ff8fa3"], [52, 98, "#fff"], [84, 89, "#ffd84a"], [120, 97, "#b48cff"], [150, 90, "#ff8fa3"], [190, 98, "#fff"]]
      .map(([x, y, c]) => `<circle cx="${x}" cy="${y}" r="1.6" fill="${c}"/><circle cx="${x}" cy="${y}" r=".6" fill="#ffc21a"/>`).join("");
    return `<svg class="toon-farm" viewBox="0 0 200 100" aria-hidden="true">
      <defs>
        <clipPath id="${k}c"><rect width="200" height="100" rx="14"/></clipPath>
        <linearGradient id="${k}s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fd3ff"/><stop offset="1" stop-color="#dcf4ff"/></linearGradient>
      </defs>
      <g clip-path="url(#${k}c)">
        <rect width="200" height="100" fill="url(#${k}s)"/>
        <g transform="translate(24 21)"><g class="toon-rays">${rays}</g><circle r="10" fill="#ffd84a" stroke="#ffc21a" stroke-width="1.4"/>
          <circle cx="-3.2" cy="-1.5" r="1.1" fill="#b07a10"/><circle cx="3.2" cy="-1.5" r="1.1" fill="#b07a10"/>
          <path d="M-3.5 2.4q3.5 3 7 0" stroke="#b07a10" stroke-width="1.1" fill="none" stroke-linecap="round"/></g>
        <g fill="#fff" class="toon-cloud"><ellipse cx="118" cy="19" rx="14" ry="5.5"/><ellipse cx="127" cy="15" rx="9" ry="6.5"/><ellipse cx="110" cy="16" rx="7" ry="5"/></g>
        <g fill="#fff" class="toon-cloud c2"><ellipse cx="66" cy="30" rx="10" ry="4"/><ellipse cx="72" cy="27" rx="6" ry="4.5"/></g>
        <path d="M0 62Q40 46 85 58Q130 44 200 56V100H0Z" fill="#a6e07f"/>
        <g transform="translate(149 34)">
          <path d="M0 18L20 4L40 18V40H0Z" fill="#e8572a"/>
          <path d="M-3 19.5L20 2L43 19.5" fill="none" stroke="#fff" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>
          <rect x="16" y="11" width="8" height="6" rx="1" fill="#fff"/>
          <rect x="13" y="24" width="14" height="16" fill="#fff"/><path d="M13 24L27 40M27 24L13 40" stroke="#e8572a" stroke-width="1.6"/>
        </g>
        <g stroke="#fff" stroke-width="1.6" stroke-linecap="round"><path d="M4 66V58M16 64V56M28 63V55M40 63V55M52 64V56M2 59.5H54M2 63H54"/></g>
        <path d="M0 74Q50 64 100 72Q150 80 200 70V100H0Z" fill="#8fd96b"/>
        <path d="M0 86Q60 78 120 86Q160 92 200 84V100H0Z" fill="#6cc24a"/>
        ${flowers}${parts}
      </g>
    </svg>`;
  }

  // پس‌زمینه‌ی صفحه‌ی بازی و دنیای کودک: آسمان، خورشید خندان، ابرها، تپه‌ها، طویله و درخت‌ها
  function sceneSVG(id) {
    const rays = Array.from({ length: 10 }, (_, i) =>
      `<path d="M0 -40V-52" transform="rotate(${i * 36})" stroke="#ffd84a" stroke-width="7" stroke-linecap="round"/>`).join("");
    const cloud = (x, y, s, cls) => `<g transform="translate(${x} ${y}) scale(${s})"><g class="toon-cloud ${cls}" fill="#fff">
        <ellipse cx="0" cy="0" rx="34" ry="13"/><ellipse cx="14" cy="-9" rx="20" ry="15"/><ellipse cx="-14" cy="-6" rx="15" ry="11"/></g></g>`;
    const tree = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-4" y="-22" width="8" height="24" rx="3" fill="#a8673a"/>
        <circle cy="-36" r="20" fill="#5bbf5a"/><circle cx="-9" cy="-42" r="7" fill="#7fd36e" opacity=".8"/>
        <circle cx="7" cy="-30" r="2.6" fill="#ff5a5a"/><circle cx="-8" cy="-28" r="2.6" fill="#ff5a5a"/><circle cx="3" cy="-46" r="2.6" fill="#ff5a5a"/></g>`;
    const flowers = [];
    const colors = ["#ff8fa3", "#fff", "#ffd84a", "#b48cff", "#6cb8ff"];
    for (let i = 0; i < 26; i++) {
      const x = (i * 157) % 400, y = 724 + ((i * 37) % 70);
      flowers.push(`<g transform="translate(${x} ${y})"><circle r="4" fill="${colors[i % colors.length]}"/><circle r="1.6" fill="#ffc21a"/></g>`);
    }
    return `<svg viewBox="0 0 400 800" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <defs><linearGradient id="${id}-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#86cffd"/><stop offset=".45" stop-color="#bfe8ff"/><stop offset=".72" stop-color="#e6f8ff"/></linearGradient></defs>
      <rect width="400" height="800" fill="url(#${id}-sky)"/>
      <g transform="translate(52 128)"><g class="toon-rays">${rays}</g><circle r="32" fill="#ffd84a" stroke="#ffc21a" stroke-width="3"/>
        <circle cx="-10" cy="-5" r="3.4" fill="#b07a10"/><circle cx="10" cy="-5" r="3.4" fill="#b07a10"/>
        <ellipse cx="-17" cy="6" rx="5" ry="3" fill="#ff9a6a" opacity=".55"/><ellipse cx="17" cy="6" rx="5" ry="3" fill="#ff9a6a" opacity=".55"/>
        <path d="M-11 8q11 10 22 0" stroke="#b07a10" stroke-width="3.2" fill="none" stroke-linecap="round"/></g>
      ${cloud(330, 150, 1, "")}${cloud(44, 300, 0.75, "c2")}${cloud(372, 372, 0.6, "c3")}
      <path d="M0 590Q90 540 190 576Q290 540 400 566V800H0Z" fill="#a6e07f"/>
      <g transform="translate(318 470)">
        <path d="M0 40L36 10L72 40V96H0Z" fill="#e8572a"/>
        <path d="M-6 42L36 4L78 42" fill="none" stroke="#fff" stroke-width="7" stroke-linejoin="round" stroke-linecap="round"/>
        <rect x="29" y="22" width="14" height="11" rx="2" fill="#fff"/>
        <rect x="23" y="58" width="26" height="38" fill="#fff"/><path d="M23 58L49 96M49 58L23 96" stroke="#e8572a" stroke-width="3.5"/>
      </g>
      ${tree(34, 590, 1)}${tree(84, 600, 0.7)}
      <g stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".95"><path d="M120 612V590M150 606V584M180 604V582M210 606V584M240 610V588M116 594Q180 584 244 592M116 604Q180 594 244 602"/></g>
      <path d="M0 662Q120 618 236 652Q320 676 400 640V800H0Z" fill="#8fd96b"/>
      <path d="M0 736Q140 700 262 724Q340 738 400 716V800H0Z" fill="#6cc24a"/>
      ${flowers.join("")}
    </svg>`;
  }

  const PAL = () => (typeof TOUR_THEMES === "object" && TOUR_THEMES.toon ? TOUR_THEMES.toon.svg : "");

  // جوجو یک لحظه کاری می‌کند (پریدن، سر تکان دادن، چرخیدن)
  function pal(move) {
    const el = document.querySelector(".toon-pal");
    if (!el) return;
    el.classList.remove("hop", "no", "spin", "hi");
    void getComputedStyle(el).animationName;
    el.classList.add(move);
  }

  // ستاره‌های کوچک روی خانه‌هایی که تازه پر شده‌اند
  function sparkle(cells) {
    if (!cells || (typeof calm === "function" && calm())) return;
    cells.slice(0, 8).forEach((cell, i) => {
      const r = cell.getBoundingClientRect();
      const s = document.createElement("span");
      s.className = "toon-spark";
      s.style.left = r.left + r.width / 2 + "px";
      s.style.top = r.top + r.height / 2 + "px";
      s.style.animationDelay = i * 60 + "ms";
      s.innerHTML = `<svg viewBox="0 0 24 24"><path d="M12 2.5l2.9 6 6.6.8-4.9 4.5 1.3 6.5L12 17l-5.9 3.3 1.3-6.5L2.5 9.3l6.6-.8z" fill="#ffd84a" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg>`;
      document.body.appendChild(s);
      setTimeout(() => s.remove(), 900 + i * 60);
    });
  }

  function bump(cls) {
    const wheel = document.getElementById("wheel");
    wheel.classList.remove("toon-wobble", "toon-squash");
    void getComputedStyle(wheel).animationName;
    wheel.classList.add(cls);
  }

  defineTheme("toon", {
    name: (level) => farmName(Math.floor(level / PARTS)),

    setup() {
      const bg = document.createElement("div");
      bg.className = "toon-bg";
      bg.innerHTML = sceneSVG("tb");
      document.body.prepend(bg);
      const palEl = document.createElement("div");
      palEl.className = "toon-pal";
      palEl.innerHTML = `<svg viewBox="0 0 64 64" aria-hidden="true">${PAL()}</svg>`;
      document.body.appendChild(palEl);
      // همان آسمان و تپه‌ها پشت فهرست بازی‌های کودک، تا رفتن بین فهرست و بازی یکدست باشد
      const kw = document.getElementById("kidsWorld");
      if (kw) {
        const kbg = document.createElement("div");
        kbg.className = "toon-kw";
        kbg.innerHTML = sceneSVG("tk");
        kw.prepend(kbg);
      }
      return () => document.querySelectorAll(".toon-bg, .toon-pal, .toon-kw, .toon-spark").forEach((el) => el.remove());
    },

    on: {
      level() {
        pal("hi");
      },
      found(d) {
        sparkle(d.cells);
        pal("hop");
      },
      hint(d) {
        sparkle(d.cells);
      },
      wrong() {
        bump("toon-wobble");
        pal("no");
      },
      shuffle() {
        bump("toon-squash");
        pal("spin");
      },
      // بالای فهرست بازی‌های کودک: مزرعه‌ای که تا الان ساخته شده؛ با زدنش چرخ کلمه باز می‌شود
      kidsmenu(d) {
        const done = d.lv || 0;
        const farm = Math.floor(done / PARTS), count = done % PARTS;
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "toon-farm-btn";
        btn.innerHTML = farmSVG(farm, count, -1) + `<span class="toon-farm-cap"></span>`;
        btn.querySelector(".toon-farm-cap").textContent = count
          ? `${farmName(farm)} · ${faDigits(count)} از ${faDigits(PARTS)} حیوون`
          : farm ? `مزرعه‌ی تازه: ${farmName(farm)}` : `${farmName(farm)} · حیوون‌ها منتظرتن!`;
        btn.setAttribute("aria-label", btn.querySelector(".toon-farm-cap").textContent);
        btn.onclick = () => {
          const g = document.querySelector(".kw-g-wheel");
          if (g) g.click();
        };
        const stage = document.getElementById("kwStage");
        if (stage) stage.prepend(btn);
      },
      // صفحه‌ی برد چرخ کلمه: حیوان تازه با پریدن وارد مزرعه می‌شود
      kidswin(d) {
        const n = Math.max(0, (d.lv || 1) - 1); // مرحله‌ای که الان تمام شد
        const farm = Math.floor(n / PARTS), step = n % PARTS;
        const stage = document.getElementById("kwStage");
        if (!stage) return;
        const pic = stage.querySelector(".kw-pic");
        if (pic) pic.outerHTML = `<div class="toon-win">${farmSVG(farm, step + 1, step)}</div>`;
        const word = stage.querySelector(".kw-word");
        if (word) {
          word.classList.add("toon-joined");
          word.textContent = step === PARTS - 1 ? `${farmName(farm)} پر شد! 🎉` : `${animalOf(farm, step).name} به مزرعه اومد!`;
        }
      },
    },
  });
})();
