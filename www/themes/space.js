// ظاهر «سفر فضایی» (فقط بخش کودک، پولی): آسمان بنفش پرستاره، سیاره‌های خندان و موشک.
// هر مرحله‌ی چرخ کلمه‌ی بچه‌ها موشک را به یک سیاره‌ی تازه (۱۶ جور) می‌رساند؛ هر کهکشان ۵ سیاره دارد و بعد کهکشان تازه شروع می‌شود.
// ۴۰ کهکشان با اسم، رنگ آسمان، شکل مسیر و تزئین خودشان (دنباله‌دار، رنگین‌کمان، ایستگاه فضایی، ...).
// «زیپو» (همان راهنمای آموزش در tour.js) گوشه‌ی صفحه‌ی بازی می‌ایستد و با هر کلمه بالا می‌پرد.
// مثل مزرعه‌ی شاد، دو رویداد مخصوص بخش کودک را هم دارد (kids.js): kidsmenu و kidswin.
(function () {
  "use strict";

  const PARTS = 5;
  // هر کهکشان: [اسم، رنگ آسمان، تزئین، شکل مسیر]
  const GALAXIES = [
    ["کهکشان آب‌نباتی", "candy", "comet", 0], ["کهکشان ستاره‌ها", "night", "stars", 1], ["کهکشان شکلاتی", "orange", "asteroids", 2],
    ["کهکشان رنگین‌کمان", "violet", "rainbow", 3], ["کهکشان بستنی", "mint", "moon", 0], ["کهکشان ابری", "deep", "clouds", 1],
    ["کهکشان راه شیری", "night", "milky", 2], ["کهکشان پاستیلی", "pink", "ufo", 3], ["کهکشان نارنجی", "orange", "sun", 0],
    ["کهکشان یخی", "deep", "comet", 1], ["کهکشان بنفشه", "violet", "swirl", 2], ["کهکشان شب‌تاب", "teal", "stars", 3],
    ["کهکشان دنباله‌دار", "candy", "comet", 2], ["کهکشان ماه‌های خندان", "night", "moon", 3], ["کهکشان حبابی", "teal", "bubbles", 0],
    ["کهکشان گردباد", "violet", "swirl", 1], ["کهکشان فیروزه‌ای", "teal", "station", 2], ["کهکشان توت‌فرنگی", "pink", "rainbow", 1],
    ["کهکشان لیمویی", "mint", "sun", 3], ["کهکشان نعنایی", "mint", "asteroids", 0], ["کهکشان عسلی", "orange", "ufo", 1],
    ["کهکشان شهاب‌ها", "deep", "meteors", 3], ["کهکشان بادکنکی", "pink", "bubbles", 2], ["کهکشان موسیقی", "violet", "notes", 0],
    ["کهکشان اسباب‌بازی", "candy", "station", 3], ["کهکشان پشمکی", "pink", "clouds", 0], ["کهکشان کیکی", "orange", "moon", 2],
    ["کهکشان خواب‌آلود", "night", "clouds", 3], ["کهکشان پروانه‌ای", "candy", "swirl", 1], ["کهکشان الماسی", "deep", "stars", 0],
    ["کهکشان سیبی", "mint", "comet", 2], ["کهکشان دونات", "pink", "asteroids", 3], ["کهکشان بلوری", "teal", "meteors", 1],
    ["کهکشان آتش‌بازی", "night", "fireworks", 2], ["کهکشان طلایی", "orange", "stars", 1], ["کهکشان ژله‌ای", "violet", "bubbles", 3],
    ["کهکشان آدم‌فضایی‌ها", "teal", "ufo", 0], ["کهکشان قطب‌نما", "deep", "station", 1], ["کهکشان نوتلا", "orange", "notes", 2],
    ["کهکشان رویایی", "candy", "fireworks", 0],
  ].map(([name, sky, deco, path]) => ({ name, sky, deco, path }));
  const galaxyOf = (n) => GALAXIES[n % GALAXIES.length];
  const galaxyName = (n) => galaxyOf(n).name;
  // آسمان: [بالا، پایین، مه‌رنگ ۱، مه‌رنگ ۲، میانه (برای پس‌زمینه‌ی صفحه)]
  const SKIES = {
    candy: ["#22195a", "#5a3fb0", "#ff8fcf", "#5fd1ff", "#33237c"],
    night: ["#05071a", "#1c2350", "#9fb0ff", "#ffffff", "#10153a"],
    orange: ["#2a1440", "#b8583a", "#ffd34a", "#ff8fcf", "#5a2450"],
    violet: ["#1a0f3a", "#6a3ab8", "#c9a8ff", "#ff8fcf", "#3a2278"],
    mint: ["#0f2a44", "#2f8a7a", "#c8ffe0", "#ffe27a", "#1a5060"],
    deep: ["#0b1438", "#24408a", "#5fd1ff", "#9a7cff", "#152a60"],
    pink: ["#3a1650", "#a8407a", "#ffb3d9", "#ffd34a", "#6a2468"],
    teal: ["#0b2a3a", "#1f7a8a", "#7cf08a", "#5fd1ff", "#13505e"],
  };
  // شکل مسیر موشک روی نقشه‌ی ۲۰۰×۱۰۰
  const PATHS = [
    [[24, 70], [62, 40], [100, 68], [138, 38], [176, 64]],
    [[22, 78], [58, 62], [98, 50], [138, 40], [176, 26]],
    [[24, 34], [60, 66], [100, 76], [140, 66], [176, 34]],
    [[26, 60], [64, 30], [104, 46], [146, 72], [178, 42]],
  ];
  // تزئین هر کهکشان روی نقشه (c: رنگ‌های آسمان)
  const DECO = {
    comet: (c) => `<g transform="translate(160 18) rotate(20)"><path d="M0 0l-30 -4l30 4l-28 4z" fill="${c[2]}" opacity=".5"/><circle r="3.4" fill="#fff"/></g>`,
    stars: () => [[30, 14], [92, 20], [150, 86], [188, 50], [118, 88]].map(([x, y], i) =>
      `<path class="space-tw" style="animation-delay:${-i * 0.5}s" transform="translate(${x} ${y})" d="M0 -4q.8 3.2 4 4q-3.2 .8 -4 4q-.8 -3.2 -4 -4q3.2 -.8 4 -4z" fill="#fff6c2"/>`).join(""),
    asteroids: () => `<g fill="#9a8a7a">${[[86, 10, 3], [100, 14, 2], [112, 9, 2.6], [126, 15, 1.8], [140, 10, 2.4], [70, 14, 1.6]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}"/>`).join("")}</g>`,
    rainbow: () => `<g fill="none" stroke-width="2.4" opacity=".8">${["#ff5f6d", "#ffb23a", "#ffd34a", "#58d97a", "#3fc4ff", "#9a7cff"].map((c, i) =>
      `<path d="M${120 + i * 3} 100a${40 - i * 3} ${40 - i * 3} 0 0 1 ${80 - i * 6} 0" stroke="${c}"/>`).join("")}</g>`,
    moon: () => `<g transform="translate(176 20)"><circle r="10" fill="#fff3c8"/><circle cx="3" cy="-3" r="2" fill="#f0dca0"/><circle cx="-4" cy="3" r="1.4" fill="#f0dca0"/>
      ${"<circle cx='-3' cy='-1' r='.9' fill='#1d1a33'/><circle cx='3' cy='-1' r='.9' fill='#1d1a33'/><path d='M-2 2.4q2 1.6 4 0' stroke='#1d1a33' stroke-width='.7' fill='none'/>"}</g>`,
    clouds: () => [[40, 90, 1], [150, 92, 1.3], [100, 8, 0.9]].map(([x, y, s]) => `<g transform="translate(${x} ${y}) scale(${s})" fill="#fff" opacity=".25"><ellipse rx="14" ry="5"/><ellipse cx="6" cy="-3" rx="8" ry="5"/></g>`).join(""),
    milky: () => `<path d="M-10 90Q60 40 210 10" stroke="#fff" stroke-width="18" opacity=".08" fill="none"/><path d="M-10 90Q60 40 210 10" stroke="#fff" stroke-width="6" opacity=".1" fill="none"/>`,
    ufo: () => `<g class="space-ufo-mini" transform="translate(168 86)"><ellipse cy="-3" rx="5" ry="4.6" fill="#9fe6ff" opacity=".85"/><ellipse rx="11" ry="3.4" fill="#c9c3e8"/><g fill="#ffd34a"><circle cx="-6" cy="1" r="1"/><circle cy="1.6" r="1"/><circle cx="6" cy="1" r="1"/></g></g>`,
    sun: () => `<g transform="translate(180 16)"><circle r="16" fill="#ffd34a" opacity=".2"/><circle r="9" fill="#ffd34a"/><circle r="6" fill="#ffe98a"/></g>`,
    swirl: (c) => `<g transform="translate(170 80)" fill="none" stroke="${c[2]}" stroke-width="1.6" opacity=".55"><path d="M0 0a3 3 0 0 1 6 0a6 6 0 0 1 -12 0a9 9 0 0 1 18 0a12 12 0 0 1 -24 0"/></g>`,
    bubbles: (c) => [[40, 14, 4], [170, 84, 5], [186, 20, 3], [110, 90, 3.4]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c[2]}" fill-opacity=".15" stroke="${c[2]}" stroke-opacity=".6" stroke-width=".8"/>`).join(""),
    station: () => `<g transform="translate(170 86) rotate(-12)"><rect x="-4" y="-3" width="8" height="6" rx="1" fill="#e8e4ff"/><g fill="#3fc4ff" stroke="#c9c3e8" stroke-width=".4"><rect x="-16" y="-2.4" width="10" height="4.8"/><rect x="6" y="-2.4" width="10" height="4.8"/></g><circle r="1.4" fill="#ff5f6d"/></g>`,
    meteors: () => [[150, 10], [176, 26], [120, 6]].map(([x, y]) => `<g transform="translate(${x} ${y})"><path d="M0 0l-16 8" stroke="#fff" stroke-width="1.2" opacity=".6" stroke-linecap="round"/><circle r="1.6" fill="#ffe98a"/></g>`).join(""),
    notes: () => [[40, 16], [168, 84], [184, 22]].map(([x, y], i) => `<g transform="translate(${x} ${y})" fill="${["#ffd34a", "#ff8fcf", "#7cf08a"][i]}"><ellipse cx="-2" cy="4" rx="2.6" ry="2"/><path d="M0.4 4v-10l5 2v3l-5 -2" /></g>`).join(""),
    fireworks: () => [[170, 22, "#ff8fcf"], [36, 86, "#ffd34a"], [130, 86, "#7cf08a"]].map(([x, y, c]) =>
      `<g transform="translate(${x} ${y})" stroke="${c}" stroke-width="1.1" stroke-linecap="round">${Array.from({ length: 8 }, (_, i) => `<path d="M0 0l0 -6" transform="rotate(${i * 45}) translate(0 -2)"/>`).join("")}</g>`).join(""),
  };

  const EYE = (x, y, r = 1.5) =>
    `<circle cx="${x}" cy="${y}" r="${r}" fill="#1d1a33"/><circle cx="${x + r * 0.35}" cy="${y - r * 0.38}" r="${r * 0.38}" fill="#fff"/>`;
  // صورت خندان وسط سیاره (همه‌ی سیاره‌ها دور (۰،۰) با شعاع ۱۱ کشیده شده‌اند)
  const FACE = `${EYE(-3.6, -1.2)}${EYE(3.6, -1.2)}<path d="M-2.2 2.4q2.2 2 4.4 0" stroke="#1d1a33" stroke-width=".9" fill="none" stroke-linecap="round"/>` +
    `<ellipse cx="-6.4" cy="2" rx="1.8" ry="1.1" fill="#ff7fb0" opacity=".7"/><ellipse cx="6.4" cy="2" rx="1.8" ry="1.1" fill="#ff7fb0" opacity=".7"/>`;
  const SHINE = `<ellipse cx="-5" cy="-6" rx="3.2" ry="1.8" fill="#fff" opacity=".4" transform="rotate(-35 -5 -6)"/>`;
  // clip: شناسه‌ی clipPath دایره‌ی r=11 همان svg، برای نوارها و خال‌ها که از لبه بیرون نزنند
  const PLANETS = [
    { name: "ماه پنیری", svg: (clip) => `<circle r="11" fill="#ffd84a"/>
      <g clip-path="url(#${clip})" fill="#f0b82a"><circle cx="5" cy="-6" r="2.6"/><circle cx="-7" cy="5" r="2"/><circle cx="7" cy="7" r="1.6"/><circle cx="-2" cy="9" r="1.3"/></g>${SHINE}${FACE}` },
    { name: "سیاره‌ی حلقه‌دار", svg: (clip) => `<path d="M-17 1a17 5 -12 0 1 34 -7" stroke="#b48cff" stroke-width="2.6" fill="none" transform="rotate(-12)"/>
      <circle r="11" fill="#ffab6b"/><g clip-path="url(#${clip})" fill="#ff9450"><rect x="-12" y="-5" width="24" height="2.4"/><rect x="-12" y="5" width="24" height="2"/></g>${SHINE}${FACE}
      <path d="M17 -6a17 5 -12 0 1 -34 7" stroke="#c9a8ff" stroke-width="2.6" fill="none" transform="rotate(-12)"/>` },
    { name: "سیاره‌ی آبی", svg: (clip) => `<circle r="11" fill="#4fa8ff"/>
      <g clip-path="url(#${clip})" fill="#5fd17a"><path d="M-12 -4q4 -6 9 -3q2 3 -2 5q-4 1 -7 4z"/><path d="M4 4q5 -2 8 2v6h-10q-1 -5 2 -8z"/><path d="M3 -11q4 1 5 4q-3 1 -6 -1z"/></g>${SHINE}${FACE}` },
    { name: "سیاره‌ی قرمز", svg: (clip) => `<circle r="11" fill="#ff6f5e"/>
      <g clip-path="url(#${clip})" fill="#e5503f"><circle cx="-6" cy="-6" r="2.4"/><circle cx="7" cy="-3" r="1.6"/><circle cx="-1" cy="8" r="2.2"/><circle cx="8" cy="6" r="1.2"/></g>${SHINE}${FACE}` },
    { name: "سیاره‌ی یخی", svg: (clip) => `<circle r="11" fill="#9fe6ff"/>
      <g clip-path="url(#${clip})" fill="#ffffff"><path d="M-12 -8q6 -3 12 -1t12 -1v-4h-24z"/><path d="M-12 9q6 -2 12 0t12 -1v4h-24z"/></g>${SHINE}${FACE}` },
    { name: "سیاره‌ی راه‌راه", svg: (clip) => `<circle r="11" fill="#a98bff"/>
      <g clip-path="url(#${clip})" fill="#8a6ae8"><path d="M-12 -8q12 3 24 0v2.6q-12 3 -24 0z"/><path d="M-12 5q12 3 24 0v2.6q-12 3 -24 0z"/></g>
      <g clip-path="url(#${clip})" fill="#ffd0f2" opacity=".55"><path d="M-12 -3q12 2 24 0v1.4q-12 2 -24 0z"/></g>${SHINE}${FACE}` },
    { name: "سیاره‌ی خال‌خالی", svg: (clip) => `<circle r="11" fill="#ff8fcf"/>
      <g clip-path="url(#${clip})" fill="#fff" opacity=".85"><circle cx="-7" cy="-6" r="1.8"/><circle cx="6" cy="-7" r="1.4"/><circle cx="-8" cy="6" r="1.4"/><circle cx="8" cy="5" r="1.8"/><circle cx="1" cy="9" r="1.2"/><circle cx="0" cy="-9.4" r="1"/></g>${SHINE}${FACE}` },
    { name: "سیاره‌ی شکلاتی", svg: (clip) => `<circle r="11" fill="#a8693f"/>
      <g clip-path="url(#${clip})"><path d="M-12 -12h24v5q-3 3 -5 0q-3 4 -6 0q-3 3 -6 0q-3 4 -7 0z" fill="#ffc6dc"/></g>
      <g stroke-width="1.3" stroke-linecap="round"><path d="M-5 -9l1.6 -.8" stroke="#ffd84a"/><path d="M3 -10l1.4 1" stroke="#5fd1ff"/><path d="M7 -7l-.6 1.4" stroke="#7cf08a"/></g>${SHINE}${FACE}` },
    { name: "سیاره‌ی گل‌گلی", svg: (clip) => `<circle r="11" fill="#7cdc8a"/>
      <g clip-path="url(#${clip})">${[[-6, -7, "#fff"], [7, -5, "#ffd84a"], [-8, 6, "#ff8fcf"], [7, 7, "#fff"]].map(([x, y, c]) =>
        `<g transform="translate(${x} ${y})" fill="${c}"><circle cx="-1.1" r="1"/><circle cx="1.1" r="1"/><circle cy="-1.1" r="1"/><circle cy="1.1" r="1"/><circle r=".7" fill="#ffb23a"/></g>`).join("")}</g>${SHINE}${FACE}` },
    { name: "سیاره‌ی ابری", svg: (clip) => `<circle r="11" fill="#d9cfff"/>
      <g clip-path="url(#${clip})" fill="#fff" opacity=".9"><ellipse cx="-4" cy="-7" rx="7" ry="2.4"/><ellipse cx="5" cy="7" rx="7" ry="2.2"/><ellipse cx="6" cy="-4" rx="4" ry="1.4"/></g>${SHINE}${FACE}` },
    { name: "سیاره‌ی هندوانه‌ای", svg: (clip) => `<circle r="11" fill="#58c46a"/>
      <g clip-path="url(#${clip})" fill="#3a9a4c">${[-8, -3, 2, 7].map((x) => `<path d="M${x} -12q2.4 12 0 24h1.8q2.4 -12 0 -24z"/>`).join("")}</g>${SHINE}${FACE}` },
    { name: "سیاره‌ی آتش‌فشانی", svg: (clip) => `<circle r="11" fill="#7a4a5a"/>
      <g clip-path="url(#${clip})" stroke="#ff8a3a" stroke-width="1.4" fill="none" stroke-linecap="round"><path d="M-12 -4q5 2 8 -2t8 1t8 -2"/><path d="M-10 8q4 -3 8 0t8 -1"/></g>
      <path d="M2 -11l2 -5l2 5z" fill="#ffd34a"/>${SHINE}${FACE}` },
    { name: "سیاره‌ی الماسی", svg: () => `<path d="M0 -12l10 6v12l-10 6l-10 -6v-12z" fill="#5fe0e8"/>
      <path d="M0 -12l10 6l-10 6l-10 -6z" fill="#a8f4f8"/><path d="M0 0v12" stroke="#3ab8c8" stroke-width=".8"/>${FACE}` },
    { name: "سیاره‌ی ژله‌ای", svg: (clip) => `<circle r="11" fill="#ff6fc1" opacity=".85"/><circle r="11" fill="none" stroke="#ff9ad5" stroke-width="1.4"/>
      <g fill="#fff" opacity=".6"><circle cx="-5" cy="-6" r="1.4"/><circle cx="6" cy="6" r="1"/><circle cx="7" cy="-4" r=".8"/></g>${SHINE}${FACE}` },
    { name: "سیاره‌ی شیری", svg: (clip) => `<circle r="11" fill="#fff8ee"/>
      <g clip-path="url(#${clip})" fill="#5a3a2a"><path d="M-12 -2q4 -4 8 -1q-2 4 -8 3z"/><path d="M4 4q5 -2 8 2v4h-6q-3 -3 -2 -6z"/><path d="M2 -11q4 1 4 4q-4 1 -6 -2z"/></g>${SHINE}${FACE}` },
    { name: "خورشید کوچولو", svg: () => `<g stroke="#ffb23a" stroke-width="2.2" stroke-linecap="round">${Array.from({ length: 8 }, (_, i) => `<path d="M0 -13v-3" transform="rotate(${i * 45})"/>`).join("")}</g>
      <circle r="11" fill="#ffd34a"/>${SHINE}${FACE}` },
  ];
  // هر کهکشان پنج سیاره‌ی پشت سر هم از فهرست؛ کهکشان بعدی از سیاره‌ی بعدی شروع می‌کند
  const planetOf = (gal, i) => PLANETS[(gal * PARTS + i) % PLANETS.length];

  // موشک کوچک، رو به بالا، دور (۰،۰)
  const ROCKET = `<g class="space-flame"><path d="M-3 9q3 9 6 0z" fill="#ffb23a"/><path d="M-1.6 9q1.6 5 3.2 0z" fill="#fff3a6"/></g>
    <path d="M-6 4l-4 6h5z M6 4l4 6h-5z" fill="#ff5f6d"/>
    <path d="M0 -14c5 4 6 10 6 15v8h-12v-8c0 -5 1 -11 6 -15z" fill="#ffffff"/>
    <path d="M0 -14c2.4 2 4 4.4 5 7h-10c1 -2.6 2.6 -5 5 -7z" fill="#ff5f6d"/>
    <circle cy="-1" r="3" fill="#5fd1ff" stroke="#3a7fd8" stroke-width="1.2"/><circle cx="-1" cy="-2" r=".9" fill="#fff"/>
    <path d="M-2 9v-3h4v3" fill="#c9c3e8"/>`;


  let uid = 0;
  // نقشه‌ی کهکشان با count سیاره‌ی اول؛ سیاره‌ی fresh تازه پیدا شده و موشک از سیاره‌ی قبلی به آن می‌رود
  function mapSVG(gal, count, fresh) {
    const k = "sp" + ++uid;
    const g = galaxyOf(gal), c = SKIES[g.sky], SLOTS = PATHS[g.path];
    const path = SLOTS.map(([x, y], i) => (i ? `Q${(SLOTS[i - 1][0] + x) / 2} ${i % 2 ? y - 6 : y + 6} ${x} ${y}` : `M${x} ${y}`)).join(" ");
    const parts = SLOTS.map(([x, y], i) => {
      if (i >= count) {
        return `<g transform="translate(${x} ${y})"><circle r="10" fill="#fff" fill-opacity=".08" stroke="#b6a8ff" stroke-width="1.4" stroke-dasharray="3 2.4"/>` +
          `<text y="4.6" text-anchor="middle" font-family="Lalezar, Vazirmatn, sans-serif" font-size="12.5" fill="#b6a8ff">؟</text></g>`;
      }
      return `<g transform="translate(${x} ${y})"><g class="space-p" style="animation-delay:${(-i * 0.5).toFixed(1)}s">` +
        `<g${i === fresh ? ' class="space-new"' : ""}>${planetOf(gal, i).svg(k + "p")}</g></g></g>`;
    }).join("");
    const at = Math.max(0, count - 1);
    const [rx, ry] = SLOTS[at];
    const from = fresh > 0 ? SLOTS[fresh - 1] : null;
    const fly = from ? ` style="--dx:${from[0] - rx}px;--dy:${from[1] - ry}px"` : "";
    const rocket = count
      ? `<g transform="translate(${rx + 13} ${ry - 15})"><g class="space-rocket${from ? " fly" : ""}"${fly}><g transform="rotate(30) scale(.62)">${ROCKET}</g></g></g>`
      : `<g transform="translate(${SLOTS[0][0] - 4} ${SLOTS[0][1] + 8})"><g class="space-rocket"><g transform="rotate(30) scale(.62)">${ROCKET}</g></g></g>`;
    const stars = [[12, 14], [40, 22], [88, 12], [118, 26], [160, 12], [190, 30], [70, 88], [130, 90], [186, 88], [8, 44]]
      .map(([x, y], i) => `<circle class="space-tw" style="animation-delay:${-i * 0.35}s" cx="${x}" cy="${y}" r="${i % 3 ? 0.9 : 1.4}" fill="#fff"/>`).join("");
    return `<svg class="space-map" viewBox="0 0 200 100" aria-hidden="true">
      <defs>
        <clipPath id="${k}c"><rect width="200" height="100" rx="14"/></clipPath>
        <clipPath id="${k}p"><circle r="11"/></clipPath>
        <linearGradient id="${k}s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c[0]}"/><stop offset="1" stop-color="${c[1]}"/></linearGradient>
      </defs>
      <g clip-path="url(#${k}c)">
        <rect width="200" height="100" fill="url(#${k}s)"/>
        <ellipse cx="150" cy="80" rx="70" ry="30" fill="${c[2]}" opacity=".14"/><ellipse cx="40" cy="20" rx="60" ry="24" fill="${c[3]}" opacity=".12"/>
        ${stars}${DECO[g.deco](c)}
        <path d="${path}" stroke="#fff" stroke-opacity=".5" stroke-width="1.6" stroke-dasharray="1 4" stroke-linecap="round" fill="none"/>
        ${parts}${rocket}
      </g>
    </svg>`;
  }

  // پس‌زمینه‌ی صفحه‌ی بازی و دنیای کودک: آسمان بنفش، ستاره‌ها، سیاره‌ی حلقه‌دار، ماه و زمین ماه
  function sceneSVG(id) {
    const stars = [];
    for (let i = 0; i < 46; i++) {
      const x = (i * 97 + 13) % 400, y = (i * 61 + 7) % 660;
      const big = i % 7 === 0;
      stars.push(big
        ? `<path class="space-tw" style="animation-delay:${-(i % 5) * 0.6}s" transform="translate(${x} ${y})" d="M0 -6q1 5 6 6q-5 1 -6 6q-1 -5 -6 -6q5 -1 6 -6z" fill="#fff6c2"/>`
        : `<circle class="space-tw" style="animation-delay:${-(i % 6) * 0.5}s" cx="${x}" cy="${y}" r="${1 + (i % 3) * 0.6}" fill="#fff"/>`);
    }
    const crater = (x, y, r) => `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 0.42}" fill="#a796e8"/><ellipse cx="${x}" cy="${y - r * 0.08}" rx="${r * 0.8}" ry="${r * 0.3}" fill="#9584dc"/>`;
    return `<svg viewBox="0 0 400 800" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <defs>
        <linearGradient id="${id}-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style="stop-color:var(--sp-s0,#1a1247)"/><stop offset=".5" style="stop-color:var(--sp-s4,#33237c)"/><stop offset=".85" style="stop-color:var(--sp-s1,#5c40b4)"/></linearGradient>
        <radialGradient id="${id}-neb" r=".5"><stop offset="0" style="stop-color:var(--sp-s2,#ff8fcf)" stop-opacity=".35"/><stop offset="1" style="stop-color:var(--sp-s2,#ff8fcf)" stop-opacity="0"/></radialGradient>
        <radialGradient id="${id}-neb2" r=".5"><stop offset="0" style="stop-color:var(--sp-s3,#5fd1ff)" stop-opacity=".28"/><stop offset="1" style="stop-color:var(--sp-s3,#5fd1ff)" stop-opacity="0"/></radialGradient>
        <clipPath id="${id}-rp"><circle r="40"/></clipPath>
      </defs>
      <rect width="400" height="800" fill="url(#${id}-sky)"/>
      <ellipse cx="300" cy="380" rx="220" ry="140" fill="url(#${id}-neb)"/>
      <ellipse cx="60" cy="200" rx="200" ry="120" fill="url(#${id}-neb2)"/>
      ${stars.join("")}
      <g class="space-shoot"><path d="M0 0l-60 22" stroke="#fff" stroke-width="2.6" stroke-linecap="round" opacity=".8"/><circle r="3.4" fill="#fff"/></g>
      <g transform="translate(330 132)">
        <path d="M-64 10a64 16 -14 0 1 128 -24" stroke="#c9a8ff" stroke-width="9" fill="none" transform="rotate(-14)"/>
        <circle r="40" fill="#ffab6b"/><g clip-path="url(#${id}-rp)" fill="#ff9450"><rect x="-40" y="-22" width="80" height="7"/><rect x="-40" y="18" width="80" height="6"/></g>
        <ellipse cx="-16" cy="-20" rx="11" ry="6" fill="#fff" opacity=".35" transform="rotate(-35 -16 -20)"/>
        <circle cx="-12" cy="-3" r="4.4" fill="#1d1a33"/><circle cx="12" cy="-3" r="4.4" fill="#1d1a33"/><circle cx="-10.6" cy="-4.6" r="1.5" fill="#fff"/><circle cx="13.4" cy="-4.6" r="1.5" fill="#fff"/>
        <path d="M-7 8q7 6 14 0" stroke="#1d1a33" stroke-width="3" fill="none" stroke-linecap="round"/>
        <ellipse cx="-22" cy="7" rx="5.4" ry="3.2" fill="#ff7fb0" opacity=".7"/><ellipse cx="22" cy="7" rx="5.4" ry="3.2" fill="#ff7fb0" opacity=".7"/>
        <path d="M64 -26a64 16 -14 0 1 -128 24" stroke="#d9c4ff" stroke-width="9" fill="none" transform="rotate(-14)"/>
      </g>
      <g transform="translate(58 300)"><circle r="20" fill="#7cdc8a"/><circle cx="-6" cy="-7" r="3" fill="#5fc070"/><circle cx="8" cy="5" r="4" fill="#5fc070"/><ellipse cx="-7" cy="-9" rx="5" ry="3" fill="#fff" opacity=".35" transform="rotate(-35 -7 -9)"/></g>
      <g class="space-ufo" transform="translate(300 520)">
        <ellipse cx="0" cy="-6" rx="11" ry="10" fill="#9fe6ff" opacity=".85"/><circle cx="-1" cy="-7" r="4.2" fill="#7cdc8a"/><circle cx="-1" cy="-8" r="1.3" fill="#1d1a33"/>
        <ellipse rx="26" ry="8" fill="#c9c3e8"/><ellipse cy="-2" rx="20" ry="4" fill="#e8e4ff"/>
        <g fill="#ffd34a"><circle cx="-16" cy="2" r="2"/><circle cx="0" cy="4" r="2"/><circle cx="16" cy="2" r="2"/></g>
      </g>
      <path d="M0 690Q80 650 170 672Q260 640 400 668V800H0Z" fill="#c9b8ff"/>
      <path d="M0 740Q120 712 230 730Q320 744 400 722V800H0Z" fill="#b6a3f5"/>
      ${crater(70, 700, 22)}${crater(250, 690, 14)}${crater(340, 742, 26)}${crater(150, 766, 18)}${crater(30, 780, 10)}
      <g transform="translate(206 676)"><path d="M0 0v-46" stroke="#e8e4ff" stroke-width="3"/><path d="M1.5 -46h26l-6 8l6 8h-26z" fill="#ff5f6d"/><circle cx="12" cy="-38" r="3.6" fill="#ffd34a"/></g>
    </svg>`;
  }

  // کهکشانی که الان گشته می‌شود (از روی همه‌ی مرحله‌های چرخ کلمه‌ی بچه‌ها)
  const curGal = () => Math.floor(((typeof kwState === "function" && kwState().lv) || 0) / PARTS);
  // آسمان پس‌زمینه‌ی صفحه‌ی بازی و دنیای کودک هم رنگ کهکشان فعلی می‌شود
  function tint(gal) {
    const c = SKIES[galaxyOf(gal).sky], st = document.documentElement.style;
    c.forEach((v, i) => st.setProperty(`--sp-s${i}`, v));
  }
  function untint() {
    const st = document.documentElement.style;
    [0, 1, 2, 3, 4].forEach((i) => st.removeProperty(`--sp-s${i}`));
  }

  const PAL = () => (typeof TOUR_THEMES === "object" && TOUR_THEMES.space ? TOUR_THEMES.space.svg : "");

  function pal(move) {
    const el = document.querySelector(".space-pal");
    if (!el) return;
    el.classList.remove("hop", "no", "spin", "hi");
    void el.offsetWidth;
    el.classList.add(move);
  }

  // ستاره‌های رنگی که از خانه‌های تازه پر شده می‌پرند
  const STAR_COLORS = ["#ffd34a", "#5fd1ff", "#ff8fcf", "#7cf08a"];
  function sparkle(cells) {
    if (!cells || (typeof calm === "function" && calm())) return;
    cells.slice(0, 8).forEach((cell, i) => {
      const r = cell.getBoundingClientRect();
      const s = document.createElement("span");
      s.className = "space-spark";
      s.style.left = r.left + r.width / 2 + "px";
      s.style.top = r.top + r.height / 2 + "px";
      s.style.animationDelay = i * 60 + "ms";
      s.innerHTML = `<svg viewBox="-12 -12 24 24"><path d="M0 -11q2 9 11 11q-9 2 -11 11q-2 -9 -11 -11q9 -2 11 -11z" fill="${STAR_COLORS[i % STAR_COLORS.length]}" stroke="#fff" stroke-width="1.4" stroke-linejoin="round"/></svg>`;
      document.body.appendChild(s);
      setTimeout(() => s.remove(), 900 + i * 60);
    });
  }

  function bump(cls) {
    const wheel = document.getElementById("wheel");
    wheel.classList.remove("space-wobble", "space-twirl");
    void wheel.offsetWidth;
    wheel.classList.add(cls);
  }

  defineTheme("space", {
    // اسم مرحله همان کهکشانی است که در فهرست بازی‌های کودک گشته می‌شود
    name: () => galaxyName(curGal()),

    setup() {
      const bg = document.createElement("div");
      bg.className = "space-bg";
      bg.innerHTML = sceneSVG("pb");
      document.body.prepend(bg);
      const palEl = document.createElement("div");
      palEl.className = "space-pal";
      palEl.innerHTML = `<svg viewBox="0 0 64 64" aria-hidden="true">${PAL()}</svg>`;
      document.body.appendChild(palEl);
      const kw = document.getElementById("kidsWorld");
      if (kw) {
        const kbg = document.createElement("div");
        kbg.className = "space-kw";
        kbg.innerHTML = sceneSVG("pk");
        kw.prepend(kbg);
      }
      tint(curGal());
      return () => {
        untint();
        document.querySelectorAll(".space-bg, .space-pal, .space-kw, .space-spark").forEach((el) => el.remove());
      };
    },

    on: {
      level() {
        tint(curGal());
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
        bump("space-wobble");
        pal("no");
      },
      shuffle() {
        bump("space-twirl");
        pal("spin");
      },
      kidsmenu(d) {
        const done = d.lv || 0;
        const gal = Math.floor(done / PARTS), count = done % PARTS;
        tint(gal);
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "space-map-btn";
        btn.innerHTML = mapSVG(gal, count, -1) + `<span class="space-map-cap"></span>`;
        const cap = btn.querySelector(".space-map-cap");
        cap.textContent = count
          ? `${galaxyName(gal)} · ${faDigits(count)} از ${faDigits(PARTS)} سیاره`
          : gal ? `کهکشان تازه: ${galaxyName(gal)}` : `${galaxyName(gal)} · موشک آماده‌ی پروازه!`;
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
        const gal = Math.floor(n / PARTS), step = n % PARTS;
        const stage = document.getElementById("kwStage");
        if (!stage) return;
        const pic = stage.querySelector(".kw-pic");
        if (pic) pic.outerHTML = `<div class="space-win">${mapSVG(gal, step + 1, step)}</div>`;
        const word = stage.querySelector(".kw-word");
        if (word) {
          word.classList.add("space-joined");
          word.textContent = step === PARTS - 1 ? `${galaxyName(gal)} رو گشتیم! 🎉` : `رسیدیم به ${planetOf(gal, step).name}!`;
        }
      },
    },
  });
})();
