// ظاهر «زیر دریا» (فقط بخش کودک، پولی): آب آبی، نور خورشید از بالا، حباب، جلبک و مرجان‌های رنگی.
// هر مرحله‌ی چرخ کلمه‌ی بچه‌ها یک دوست دریایی به آکواریوم می‌آورد؛ هر آکواریوم ۵ دوست دارد و بعد آکواریوم تازه شروع می‌شود.
// «هشتی» (همان راهنمای آموزش در tour.js) گوشه‌ی صفحه‌ی بازی شنا می‌کند و با هر کلمه بالا می‌پرد.
// مثل مزرعه‌ی شاد، دو رویداد مخصوص بخش کودک را هم دارد (kids.js): kidsmenu و kidswin.
(function () {
  "use strict";

  const PARTS = 5;
  const TANKS = ["صخره‌ی مرجانی", "دریای آبی", "غار صدف‌ها", "جنگل جلبک", "دریای رنگین‌کمان", "خلیج ستاره‌ها"];
  const tankName = (n) => TANKS[n % TANKS.length];

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
  ];
  const friendOf = (tank, i) => FRIENDS[(tank * 3 + i) % FRIENDS.length];

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
    const weeds = [[8, "#3fbf7f"], [190, "#2fae8a"], [118, "#57c98a"]].map(([x, c], i) =>
      `<path class="sea-weed" style="animation-delay:${-i * 0.7}s" d="M${x} 100q-5 -10 0 -20q5 -10 0 -20" stroke="${c}" stroke-width="4" fill="none" stroke-linecap="round"/>`).join("");
    return `<svg class="sea-tank" viewBox="0 0 200 100" aria-hidden="true">
      <defs>
        <clipPath id="${k}c"><rect width="200" height="100" rx="14"/></clipPath>
        <linearGradient id="${k}w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7fe0ff"/><stop offset=".6" stop-color="#3fb0ea"/><stop offset="1" stop-color="#2a8fd6"/></linearGradient>
        <radialGradient id="seaPearl" cx=".35" cy=".35" r=".7"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#d8c8ff"/></radialGradient>
      </defs>
      <g clip-path="url(#${k}c)">
        <rect width="200" height="100" fill="url(#${k}w)"/>
        <g fill="#fff" opacity=".16"><path d="M20 0h14l-30 100h-8z"/><path d="M80 0h10l-6 100h-14z"/><path d="M140 0h16l24 100h-12z"/></g>
        <path d="M0 6q12 -4 25 0t25 0t25 0t25 0t25 0t25 0t25 0t25 0V0H0z" fill="#fff" opacity=".35"/>
        ${weeds}
        <g transform="translate(150 96)"><path d="M0 0v-14M0 -8l-6 -6M0 -11l5 -7M-6 -14l-1 -5M5 -18l3 -3" stroke="#ff7fa8" stroke-width="3" stroke-linecap="round" fill="none"/></g>
        <g transform="translate(48 97)"><path d="M0 0c-10 -2 -12 -16 0 -18c12 2 10 16 0 18z" fill="#ffa64d" opacity=".9"/><path d="M0 0v-15M0 -6l-5 -6M0 -6l5 -6M0 -11l-3 -4M0 -11l3 -4" stroke="#ffcf8a" stroke-width=".9"/></g>
        <path d="M0 90Q50 84 100 90T200 88V100H0Z" fill="#ffe2a6"/>
        <path d="M0 95Q60 91 120 96T200 94V100H0Z" fill="#f6cf86"/>
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
          <stop offset="0" stop-color="#8ce6ff"/><stop offset=".35" stop-color="#46bdf0"/><stop offset=".75" stop-color="#2a93d8"/><stop offset="1" stop-color="#2380c8"/></linearGradient>
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
    name: (level) => tankName(Math.floor(level / PARTS)),

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
      return () => document.querySelectorAll(".sea-bg, .sea-pal, .sea-kw, .sea-pop").forEach((el) => el.remove());
    },

    on: {
      level() {
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
