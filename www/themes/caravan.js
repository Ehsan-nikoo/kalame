// ظاهر «کاروان ابریشم»: هر مرحله در یک شهر است و با تمام شدنش، کاروان به شهر بعدی می‌رود
(function () {
  "use strict";

  // سفری دور تا دور ایران: هر مرحله در یک شهر است و با تمام شدنش کاروان به شهر بعدی می‌رود.
  // بعد از ماهان دوباره به کرمان می‌رسد و سفر از نو شروع می‌شود.
  // [اسم، طول جغرافیایی، عرض جغرافیایی، منظره]
  const ROUTE = [
    ["کرمان", 57.08, 30.28, "desert"], ["رفسنجان", 55.99, 30.40, "desert"], ["یزد", 54.37, 31.90, "desert"],
    ["میبد", 54.02, 32.25, "desert"], ["نائین", 53.09, 32.86, "desert"], ["اصفهان", 51.67, 32.65, "domes"],
    ["نطنز", 51.91, 33.51, "domes"], ["کاشان", 51.44, 33.98, "domes"], ["قم", 50.88, 34.64, "domes"],
    ["تهران", 51.39, 35.69, "mountains"], ["سمنان", 53.39, 35.58, "desert"], ["دامغان", 54.34, 36.17, "desert"],
    ["شاهرود", 54.98, 36.42, "desert"], ["سبزوار", 57.68, 36.21, "desert"], ["نیشابور", 58.80, 36.21, "domes"],
    ["مشهد", 59.60, 36.30, "domes"], ["قوچان", 58.51, 37.11, "mountains"], ["بجنورد", 57.33, 37.47, "mountains"],
    ["گرگان", 54.43, 36.84, "north"], ["ساری", 53.06, 36.56, "north"], ["آمل", 52.35, 36.47, "north"],
    ["رامسر", 50.67, 36.92, "north"], ["رشت", 49.58, 37.28, "north"], ["ماسوله", 48.99, 37.15, "north"],
    ["قزوین", 50.00, 36.27, "domes"], ["سلطانیه", 48.80, 36.43, "domes"], ["زنجان", 48.48, 36.67, "mountains"],
    ["اردبیل", 48.29, 38.25, "mountains"], ["تبریز", 46.29, 38.08, "mountains"], ["ارومیه", 45.07, 37.55, "mountains"],
    ["مهاباد", 45.72, 36.76, "mountains"], ["سنندج", 47.00, 35.31, "mountains"], ["کرمانشاه", 47.07, 34.31, "mountains"],
    ["همدان", 48.51, 34.80, "domes"], ["بروجرد", 48.75, 33.90, "mountains"], ["خرم‌آباد", 48.36, 33.49, "mountains"],
    ["دزفول", 48.40, 32.38, "south"], ["شوشتر", 48.85, 32.05, "south"], ["اهواز", 48.67, 31.32, "south"],
    ["بوشهر", 50.84, 28.97, "south"], ["کازرون", 51.65, 29.62, "mountains"], ["شیراز", 52.53, 29.59, "domes"],
    ["جهرم", 53.56, 28.50, "desert"], ["لار", 54.33, 27.68, "desert"], ["بندرعباس", 56.27, 27.18, "south"],
    ["میناب", 57.08, 27.15, "south"], ["چابهار", 60.64, 25.29, "south"], ["زاهدان", 60.86, 29.49, "desert"],
    ["بم", 58.36, 29.11, "desert"], ["ماهان", 57.29, 30.06, "domes"],
  ];

  // طول و عرض جغرافیایی به جای روی نقشه (۲۶۰×۲۳۶)
  const project = (lon, lat) => [+((lon - 43.6) * 0.86 * 15).toFixed(1), +((40.1 - lat) * 15).toFixed(1)];
  const STOPS = ROUTE.map(([name, lon, lat, scene]) => {
    const [x, y] = project(lon, lat);
    return { name, x, y, scene };
  });
  const LEGS = STOPS.length;
  const legOf = (level) => level % LEGS;
  const nextOf = (leg) => STOPS[(leg + 1) % LEGS];

  // مرز ساده‌شده‌ی ایران و دو دریا، به طول و عرض جغرافیایی
  const BORDER = [
    [44.77, 39.71], [45.5, 39.0], [46.5, 38.9], [47.3, 39.4], [47.9, 39.65], [48.35, 39.3], [48.0, 38.9], [48.6, 38.4],
    [48.87, 38.43], [49.1, 37.65], [49.47, 37.47], [50.2, 37.1], [50.67, 36.92], [51.5, 36.65], [52.6, 36.7],
    [53.9, 36.9], [54.0, 37.35], [54.8, 37.5], [55.5, 38.1], [56.4, 38.1], [57.3, 38.0], [58.4, 37.6], [59.4, 37.1],
    [60.3, 36.6], [61.15, 36.6], [61.2, 35.6], [60.6, 34.4], [60.9, 34.3], [60.5, 33.7], [60.9, 33.5], [60.6, 32.5],
    [60.85, 31.5], [61.7, 31.4], [61.8, 30.9], [61.4, 29.9], [60.87, 29.86], [61.5, 29.0], [62.0, 28.4], [62.7, 28.25],
    [62.8, 27.3], [63.3, 27.1], [63.2, 26.6], [62.3, 26.4], [61.85, 26.2], [61.6, 25.2], [60.6, 25.3], [59.6, 25.4],
    [58.0, 25.6], [57.77, 25.64], [57.3, 26.5], [57.1, 27.0], [56.3, 27.15], [55.6, 26.8], [54.8, 26.5], [53.6, 26.7],
    [52.5, 27.4], [51.5, 27.9], [50.83, 28.97], [50.3, 29.3], [50.0, 30.2], [49.5, 30.0], [48.9, 30.4], [48.6, 29.95],
    [48.0, 30.5], [47.7, 31.0], [47.7, 31.4], [47.1, 31.9], [46.5, 32.4], [45.9, 33.0], [45.4, 33.9], [45.6, 34.6],
    [45.9, 35.1], [46.2, 35.3], [45.7, 35.9], [45.0, 36.7], [44.8, 37.2], [44.6, 37.8], [44.2, 38.2], [44.4, 38.9],
    [44.03, 39.4],
  ];
  const CASPIAN = [[49.6, 40.8], [49.3, 39.6], [49.0, 39.0], [48.87, 38.43], [49.1, 37.65], [49.47, 37.47], [50.2, 37.1],
    [50.67, 36.92], [51.5, 36.65], [52.6, 36.7], [53.9, 36.9], [54.0, 37.35], [53.85, 38.0], [53.2, 39.0], [53.0, 40.0], [52.9, 40.8]];
  // خلیج فارس و دریای عمان، بین ساحل ایران و ساحل عربستان و عمان
  const GULF = [[48.6, 29.95], [49.5, 30.0], [50.0, 30.2], [50.3, 29.3], [50.83, 28.97], [51.5, 27.9], [52.5, 27.4],
    [53.6, 26.7], [54.8, 26.5], [55.6, 26.8], [56.3, 27.15], [57.1, 27.0], [57.3, 26.5], [57.77, 25.64], [58.0, 25.6],
    [59.6, 25.4], [60.6, 25.3], [61.6, 25.2], [64, 25.0], [64, 23.0], [57.8, 23.0], [57.5, 23.7], [56.5, 24.4],
    [56.3, 25.2], [56.4, 26.2], [56.1, 26.3], [55.6, 25.5], [54.5, 24.4], [53.0, 24.1], [51.6, 24.3], [51.0, 24.6],
    [50.6, 25.5], [50.1, 26.6], [49.3, 27.4], [48.4, 28.5], [47.95, 29.4]];
  const pathOf = (pts) => "M" + pts.map(([lon, lat]) => project(lon, lat).join(" ")).join(" L") + "Z";
  const MAP_BASE = `
    <path d="${pathOf(CASPIAN)}" fill="#8cc3c9" opacity=".75"/>
    <path d="${pathOf(GULF)}" fill="#8cc3c9" opacity=".75"/>
    <path d="${pathOf(BORDER)}" fill="#f3dfb2" stroke="#b98a4a" stroke-width="1.2" stroke-linejoin="round"/>
    <text x="${project(51.2, 38.6)[0]}" y="${project(51.2, 38.6)[1]}" text-anchor="middle" font-size="8" fill="#2e6f7a">دریای خزر</text>
    <text x="${project(51.3, 26.4)[0]}" y="${project(51.3, 26.4)[1]}" text-anchor="middle" font-size="8" fill="#2e6f7a">خلیج فارس</text>
    <text x="${project(58.2, 24.3)[0]}" y="${project(58.2, 24.3)[1]}" text-anchor="middle" font-size="8" fill="#2e6f7a">دریای عمان</text>`;

  // ---------- منظره‌ی هر شهر (نقاشی‌ها در caravan-scenes.js) ----------

  let currentScene = null;

  function showScene(leg) {
    if (leg === currentScene) return;
    const first = currentScene === null; // اولین منظره بدون محو شدن، تا رنگ خالی پس‌زمینه دیده نشود
    currentScene = leg;
    const stop = STOPS[leg];
    const div = document.createElement("div");
    div.className = "scene";
    div.style.opacity = first ? "1" : "0";
    div.innerHTML = `<svg viewBox="0 0 ${CaravanScenes.W} 800" preserveAspectRatio="xMidYMax slice" aria-hidden="true">` +
      CaravanScenes.draw(stop.name, stop.scene, "sky-" + leg) + `</svg>`;
    document.body.prepend(div);
    void div.offsetWidth; // تا محو شدن از شفاف شروع شود
    div.style.opacity = "1";
    const old = [...document.querySelectorAll(".scene")].slice(1);
    setTimeout(() => old.forEach((el) => el.remove()), 1300);
  }

  // ---------- کاشی شمسه‌ی دایره‌ی حروف ----------

  function star8(r) {
    const pts = [];
    for (let i = 0; i < 16; i++) {
      const a = (i * Math.PI) / 8 - Math.PI / 2;
      const rr = i % 2 ? r * 0.72 : r;
      pts.push((Math.cos(a) * rr).toFixed(2) + "," + (Math.sin(a) * rr).toFixed(2));
    }
    return pts.join(" ");
  }

  function addMedallion() {
    const petals = Array.from({ length: 8 }, (_, i) =>
      `<ellipse cx="0" cy="-11" rx="4" ry="8" fill="#fdf6e3" transform="rotate(${i * 45})"/>`).join("");
    const dots = Array.from({ length: 16 }, (_, i) => {
      const a = (i * Math.PI) / 8;
      return `<circle cx="${(Math.cos(a) * 46.5).toFixed(2)}" cy="${(Math.sin(a) * 46.5).toFixed(2)}" r="1.1" fill="#fdf6e3"/>`;
    }).join("");
    const div = document.createElement("div");
    div.className = "medallion";
    div.innerHTML = `<svg viewBox="-50 -50 100 100" aria-hidden="true">
        <circle r="50" fill="#d9a441"/><circle r="48.3" fill="#1d4e89"/>${dots}
        <polygon points="${star8(44)}" fill="#2fa4a9" stroke="#fdf6e3" stroke-width=".9"/>
        <polygon points="${star8(30)}" fill="#1d4e89" stroke="#d9a441" stroke-width=".7" transform="rotate(22.5)"/>
        <circle r="17" fill="#2fa4a9" stroke="#fdf6e3" stroke-width=".8"/>${petals}<circle r="5" fill="#d9a441"/>
      </svg>`;
    document.getElementById("wheel").prepend(div);
  }

  // ---------- نقشه‌ی سفر در پایان مرحله ----------

  // شتر از مجموعه‌ی Noto Emoji (themes/caravan/CREDITS.txt)، رو به چپ یعنی جهت حرکت کاروان.
  // در قابی ۵۶ واحدی که پاهایش روی خط ۴۶ (زمین) می‌نشیند.
  function camel() {
    return `<g class="camel"><image href="themes/caravan/camel.svg" x="0" y="-8" width="56" height="56"/></g>`;
  }

  function routeMap(from) {
    const pts = (list) => list.map((s) => s.x + "," + s.y).join(" ");
    const visited = [...STOPS.slice(0, from + 1), nextOf(from)];
    const dots = STOPS.map((s, i) =>
      `<circle cx="${s.x}" cy="${s.y}" r="${i <= from ? 2.6 : 2.2}" fill="${i <= from ? "#1d4e89" : "#fbf0d6"}" stroke="#1d4e89" stroke-width="1"/>`).join("");
    // اسم شهر کنار نقطه نوشته می‌شود (شترها بالای نقطه‌اند)، در طرفی که از شهر دیگر دور است
    // تا اسم دو شهر نزدیک روی هم نیفتد. اگر جا نبود، زیر یا بالای نقطه.
    const label = (s, bold) => {
      const other = bold ? start : to;
      const size = bold ? 11 : 8.5;
      const half = (s.name.length * size * 0.52) / 2;
      const left = bold ? s.x < other.x : s.x <= other.x;
      let x = left ? s.x - 5 - half : s.x + 5 + half, y = s.y + size * 0.35;
      if (x - half < 2 || x + half > 258) {
        x = Math.min(Math.max(s.x, half + 2), 258 - half);
        y = s.y + 13 > 236 ? s.y - 9 : s.y + 13;
      }
      return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="middle"
        font-size="${size}" font-weight="${bold ? 700 : 400}" fill="#5a3d22"
        stroke="#fbf0d6" stroke-width="2.5" paint-order="stroke">${s.name}</text>`;
    };
    const to = nextOf(from);
    const camels = [0, 1, 2].map((i) =>
      `<g transform="translate(${i * 11 - 6} ${i * 1.2 - 10}) scale(.26)">${camel()}</g>`).join("");
    const start = STOPS[from];
    return `<svg class="extra route-map" viewBox="0 0 260 240" aria-hidden="true">
        ${MAP_BASE}
        <polygon points="${pts(STOPS)}" fill="none" stroke="#b98a4a" stroke-width="1.3" stroke-dasharray="3 3"/>
        <polyline points="${pts(visited)}" fill="none" stroke="#1d4e89" stroke-width="2" stroke-dasharray="3 3"/>
        ${dots}
        <circle cx="${to.x}" cy="${to.y}" r="4" fill="#d9a441" stroke="#1d4e89" stroke-width="1.4"/>
        ${label(start, false) + label(to, true)}
        <g class="caravan" transform="translate(${start.x - 10} ${start.y - 14})">${camels}</g>
      </svg>`;
  }

  function walkCaravan(svg, from) {
    const g = svg.querySelector(".caravan");
    const a = STOPS[from], b = nextOf(from);
    const t0 = performance.now();
    (function step(now) {
      const t = Math.min((now - t0) / 2400, 1);
      const e = t * t * (3 - 2 * t);
      g.setAttribute("transform", `translate(${a.x + (b.x - a.x) * e - 10} ${a.y + (b.y - a.y) * e - 14})`);
      if (t < 1 && svg.isConnected) requestAnimationFrame(step);
    })(t0);
  }

  // منو: پنجره‌ای طاق‌دار با قاب کاشی، و کاروانی که از پشتش رد می‌شود
  function homeArch() {
    const arch = "M18 214 V96 Q18 30 100 12 Q182 30 182 96 V214 Z";
    const camels = [0, 1, 2].map((i) =>
      `<g transform="translate(${i * 40} ${i % 2 ? 1 : -1}) scale(.64)">${camel()}</g>`).join("");
    return `<svg class="home-arch" viewBox="0 0 200 222" aria-hidden="true">
        <defs>
          <clipPath id="arch-in"><path d="${arch}"/></clipPath>
          <linearGradient id="arch-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4a96b"/><stop offset=".7" stop-color="#fde7c2"/></linearGradient>
        </defs>
        <g clip-path="url(#arch-in)">
          <rect width="200" height="222" fill="url(#arch-sky)"/>
          <circle class="arch-sun" cx="134" cy="92" r="20" fill="#fff3d6"/>
          <path d="M0 152 Q60 128 120 146 T200 140 V222 H0Z" fill="#e8bf86"/>
          <g transform="translate(0 130)"><g class="walkers">${camels}</g></g>
          <path d="M0 184 Q80 164 200 182 V222 H0Z" fill="#d6a46a"/>
        </g>
        <path d="${arch}" fill="none" stroke="#1d4e89" stroke-width="13"/>
        <path d="${arch}" fill="none" stroke="#2fa4a9" stroke-width="8"/>
        <path d="${arch}" fill="none" stroke="#d9a441" stroke-width="1.6"/>
        <rect x="6" y="208" width="188" height="12" rx="2" fill="#c98f5c"/>
        <rect x="6" y="208" width="188" height="3" fill="#e0b07a"/>
      </svg>`;
  }

  // ---------- واکنش به بازی ----------

  defineTheme("caravan", {
    name: (level) => STOPS[legOf(level)].name,

    setup() {
      showScene(legOf(save.unlocked));
      addMedallion();
      return () => {
        document.querySelectorAll(".scene, .medallion").forEach((el) => el.remove());
        currentScene = null;
      };
    },

    on: {
      home(d) {
        const leg = legOf(d.level);
        const box = document.getElementById("homeScene");
        box.innerHTML = homeArch() + `<p class="scene-caption"></p>`;
        box.querySelector(".scene-caption").textContent =
          d.done >= d.total ? "سفر تموم شد!" : `کاروان در ${STOPS[leg].name} · مقصد بعدی: ${nextOf(leg).name}`;
        showScene(legOf(d.level));
      },
      level(d) {
        showScene(legOf(d.level));
      },
      shuffle() {
        document.querySelector(".medallion").animate(
          [{ transform: "rotate(0)" }, { transform: "rotate(360deg)" }],
          { duration: 800, easing: "cubic-bezier(.4,0,.2,1)" }
        );
      },
      wrong() {
        const wheel = document.getElementById("wheel");
        wheel.classList.remove("wobble");
        void wheel.offsetWidth;
        wheel.classList.add("wobble");
      },
      complete(d) {
        const leg = legOf(d.level);
        const card = document.querySelector("#overlay .card");
        card.insertAdjacentHTML("afterbegin", routeMap(leg));
        walkCaravan(card.querySelector(".route-map"), leg);
        const to = nextOf(leg).name;
        document.getElementById("overlayTitle").textContent =
          d.finished ? "سفر تموم شد!" : leg === LEGS - 1 ? `دور ایران تمام شد! به ${to} رسیدیم` : `به سوی ${to}!`;
      },
    },
  });
})();
