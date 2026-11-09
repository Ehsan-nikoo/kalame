// ظاهر «کاروان ابریشم»: هر مرحله در یک شهر است و با تمام شدنش، کاروان به شهر بعدی می‌رود
(function () {
  "use strict";

  // شهرهای مسیر با جایشان روی نقشه؛ هر مرحله یک قدم از سفر است و بعد از ماسوله سفر از نو شروع می‌شود
  const STOPS = [
    { name: "کرمان", x: 272, y: 196 },
    { name: "یزد", x: 222, y: 160 },
    { name: "میبد", x: 205, y: 140 },
    { name: "نائین", x: 182, y: 118 },
    { name: "اصفهان", x: 128, y: 130 },
    { name: "نطنز", x: 138, y: 102 },
    { name: "کاشان", x: 132, y: 82 },
    { name: "قم", x: 124, y: 62 },
    { name: "قزوین", x: 90, y: 44 },
    { name: "رشت", x: 70, y: 22 },
    { name: "ماسوله", x: 42, y: 30 },
  ];
  const LEGS = STOPS.length - 1;
  const legOf = (level) => level % LEGS;
  const sceneOf = (level) => {
    const leg = legOf(level);
    return leg <= 2 ? "desert" : leg <= 6 ? "domes" : leg <= 8 ? "mountains" : "north";
  };

  // ---------- منظره‌ها ----------

  const clouds = `
    <g class="cloud"><ellipse cx="60" cy="120" rx="46" ry="14" fill="#fff" opacity=".8"/><ellipse cx="88" cy="110" rx="30" ry="13" fill="#fff" opacity=".8"/></g>
    <g class="cloud slow"><ellipse cx="40" cy="210" rx="38" ry="10" fill="#fff" opacity=".6"/><ellipse cx="62" cy="203" rx="22" ry="9" fill="#fff" opacity=".6"/></g>`;

  function sky(top, bottom, sunColor, sunX, sunY) {
    return `
      <defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${top}"/><stop offset=".62" stop-color="${bottom}"/></linearGradient></defs>
      <rect width="400" height="800" fill="url(#sky)"/>
      <circle class="sun" cx="${sunX}" cy="${sunY}" r="44" fill="${sunColor}" opacity=".95"/>
      ${clouds}`;
  }

  function badgir(x, h) {
    return `<rect x="${x}" y="${500 - h}" width="16" height="${h}" fill="#b98250"/>
      <rect x="${x - 2}" y="${500 - h - 6}" width="20" height="6" fill="#a8713f"/>
      ${[3, 7, 11].map((d) => `<rect x="${x + d}" y="${500 - h + 6}" width="2" height="22" fill="#7d5130"/>`).join("")}`;
  }

  function dome(cx, base, w, h, color) {
    return `<path d="M${cx - w} ${base} C${cx - w} ${base - h * 0.75} ${cx - w * 0.2} ${base - h * 0.8} ${cx} ${base - h}
      C${cx + w * 0.2} ${base - h * 0.8} ${cx + w} ${base - h * 0.75} ${cx + w} ${base} Z" fill="${color}"/>
      <rect x="${cx - 1}" y="${base - h - 12}" width="2" height="12" fill="#d9a441"/>`;
  }

  function minaret(x, h) {
    return `<rect x="${x}" y="${500 - h}" width="9" height="${h}" fill="#e7cfa3"/>
      <rect x="${x - 3}" y="${500 - h + 18}" width="15" height="5" fill="#2fa4a9"/>
      <path d="M${x} ${500 - h} L${x + 4.5} ${500 - h - 16} L${x + 9} ${500 - h} Z" fill="#2fa4a9"/>`;
  }

  const SCENES = {
    desert: () => `
      ${sky("#f4a96b", "#fde7c2", "#fff3d6", 300, 300)}
      <path d="M0 470 Q100 430 200 462 T400 450 V520 H0Z" fill="#e8bf86"/>
      <rect x="40" y="455" width="80" height="45" fill="#c98f5c"/><rect x="120" y="440" width="60" height="60" fill="#d39a66"/>
      <rect x="230" y="450" width="90" height="50" fill="#c98f5c"/><rect x="320" y="462" width="60" height="38" fill="#d39a66"/>
      ${badgir(70, 95)}${badgir(150, 120)}${badgir(270, 105)}${badgir(345, 80)}
      ${dome(200, 452, 30, 42, "#c98f5c")}<rect x="170" y="452" width="60" height="48" fill="#bf8552"/>
      <path d="M0 500 Q200 480 400 500 V800 H0Z" fill="#dcaa6c"/>
      <path d="M0 560 Q150 530 400 570 V800 H0Z" fill="#cf9a5c"/>`,

    domes: () => `
      ${sky("#8fcfd8", "#f6e7c9", "#fffaf0", 90, 250)}
      <path d="M0 480 Q120 455 250 470 T400 462 V520 H0Z" fill="#cdb48a"/>
      <rect x="30" y="440" width="120" height="60" fill="#e3c9a0"/>
      <path d="M70 500 V470 Q90 445 110 470 V500 Z" fill="#b9935f"/>
      ${dome(200, 440, 50, 78, "#2fa4a9")}<rect x="148" y="440" width="104" height="60" fill="#e3c9a0"/>
      <path d="M180 500 V468 Q200 440 220 468 V500 Z" fill="#1d4e89"/>
      ${minaret(132, 140)}${minaret(259, 140)}
      ${dome(330, 455, 26, 40, "#1d4e89")}<rect x="300" y="455" width="60" height="45" fill="#e3c9a0"/>
      <path d="M0 500 H400 V800 H0Z" fill="#cdb48a"/>
      <rect x="0" y="512" width="400" height="16" fill="#7fa37a"/>
      ${[20, 70, 330, 380].map((x) => `<ellipse cx="${x}" cy="492" rx="9" ry="34" fill="#4f7a52"/>`).join("")}
      <path d="M0 600 Q200 570 400 600 V800 H0Z" fill="#bea477"/>`,

    mountains: () => `
      ${sky("#6f5a9a", "#f5b98f", "#ffe1c2", 220, 330)}
      <path d="M0 470 L70 360 L120 410 L190 320 L260 420 L320 350 L400 440 V520 H0Z" fill="#8a6f9e"/>
      <path d="M190 320 L172 346 L182 342 L192 352 L202 340 L210 346 Z M70 360 L58 380 L70 374 L82 382 Z" fill="#fff" opacity=".9"/>
      <path d="M0 500 L90 420 L160 470 L240 410 L330 480 L400 450 V560 H0Z" fill="#6d5688"/>
      ${[120, 150, 175, 205].map((x, i) => `<rect x="${x}" y="${486 - i * 4}" width="22" height="${18 + i * 4}" fill="#d9a67a"/><rect x="${x + 8}" y="${492 - i * 4}" width="5" height="6" fill="#5e4a72"/>`).join("")}
      <path d="M0 505 Q200 485 400 510 V800 H0Z" fill="#5e4a72"/>
      <path d="M0 590 Q220 560 400 600 V800 H0Z" fill="#4f4070"/>`,

    north: () => `
      ${sky("#a9d3c4", "#f3efe2", "#fffdf2", 320, 240)}
      <path d="M0 420 Q100 330 210 400 T400 360 V520 H0Z" fill="#6fa27a"/>
      ${[
        [60, 430], [100, 420], [140, 430], [180, 415], [220, 425], [260, 410], [80, 455], [125, 450], [170, 448], [215, 452], [255, 440], [300, 445],
      ].map(([x, y]) => `<rect x="${x}" y="${y}" width="36" height="24" fill="#e2b45a"/><rect x="${x}" y="${y - 3}" width="36" height="3" fill="#7d5a3a"/><rect x="${x + 6}" y="${y + 7}" width="6" height="9" fill="#5a4030"/><rect x="${x + 22}" y="${y + 7}" width="6" height="9" fill="#5a4030"/>`).join("")}
      <rect x="0" y="470" width="400" height="22" fill="#fff" opacity=".45"/>
      <path d="M0 500 Q200 470 400 500 V800 H0Z" fill="#4f8a5d"/>
      <path d="M0 590 Q180 560 400 590 V800 H0Z" fill="#3f7a4e"/>`,
  };

  let currentScene = null;

  function showScene(kind) {
    if (kind === currentScene) return;
    const first = !currentScene; // اولین منظره بدون محو شدن، تا رنگ خالی پس‌زمینه دیده نشود
    currentScene = kind;
    const div = document.createElement("div");
    div.className = "scene";
    div.style.opacity = first ? "1" : "0";
    div.innerHTML = `<svg viewBox="0 0 400 800" preserveAspectRatio="xMidYMax slice" aria-hidden="true">${SCENES[kind]()}</svg>`;
    document.body.prepend(div);
    requestAnimationFrame(() => (div.style.opacity = "1"));
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
    const visited = STOPS.slice(0, from + 2);
    const dots = STOPS.map((s, i) =>
      `<circle cx="${s.x}" cy="${s.y}" r="${i <= from + 1 ? 4 : 3}" fill="${i <= from ? "#1d4e89" : "#fbf0d6"}" stroke="#1d4e89" stroke-width="1.5"/>`).join("");
    const label = (s, bold) => `<text x="${s.x}" y="${s.y + 15}" text-anchor="middle" font-size="${bold ? 11 : 9}" font-weight="${bold ? 700 : 400}" fill="#5a3d22">${s.name}</text>`;
    const camels = [0, 1, 2].map((i) =>
      `<g transform="translate(${i * 15 - 8} ${i * 1.5 - 12}) scale(.34)">${camel()}</g>`).join("");
    const start = STOPS[from];
    return `<svg class="extra route-map" viewBox="0 0 300 220" aria-hidden="true">
        <path d="M0 0 H300 V8 Q220 20 150 6 T0 12 Z" fill="#8cc3c9" opacity=".7"/>
        <text x="150" y="9" text-anchor="middle" font-size="8" fill="#2e6f7a">دریای خزر</text>
        ${[[40, 90], [250, 60], [200, 205], [60, 170], [95, 120]].map(([x, y]) =>
          `<path d="M${x} ${y} l9 -14 l9 14 Z M${x + 12} ${y} l7 -10 l7 10 Z" fill="none" stroke="#b98a4a" stroke-width="1"/>`).join("")}
        <polyline points="${STOPS.map((s) => s.x + "," + s.y).join(" ")}" fill="none" stroke="#b98a4a" stroke-width="2" stroke-dasharray="4 4"/>
        <polyline points="${visited.map((s) => s.x + "," + s.y).join(" ")}" fill="none" stroke="#1d4e89" stroke-width="2.5" stroke-dasharray="4 4"/>
        ${dots}
        ${label(STOPS[from], false) + label(STOPS[from + 1], true)}
        <g class="caravan" transform="translate(${start.x - 12} ${start.y - 16})">${camels}</g>
      </svg>`;
  }

  function walkCaravan(svg, from) {
    const g = svg.querySelector(".caravan");
    const a = STOPS[from], b = STOPS[from + 1];
    const t0 = performance.now();
    (function step(now) {
      const t = Math.min((now - t0) / 2400, 1);
      const e = t * t * (3 - 2 * t);
      g.setAttribute("transform", `translate(${a.x + (b.x - a.x) * e - 12} ${a.y + (b.y - a.y) * e - 16})`);
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
      showScene(sceneOf(save.unlocked));
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
          d.done >= d.total ? "سفر تموم شد!" : `کاروان در ${STOPS[leg].name} · مقصد بعدی: ${STOPS[leg + 1].name}`;
        showScene(sceneOf(d.level));
      },
      level(d) {
        showScene(sceneOf(d.level));
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
        const to = STOPS[leg + 1].name;
        document.getElementById("overlayTitle").textContent =
          d.finished ? "سفر تموم شد!" : leg === LEGS - 1 ? `به ${to} رسیدیم!` : `به سوی ${to}!`;
      },
    },
  });
})();
