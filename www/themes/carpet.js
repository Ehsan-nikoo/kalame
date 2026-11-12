// ظاهر «قالی‌باف»: هر ۵ مرحله یک قالی است؛ با هر مرحله یک ردیف از آن بافته می‌شود
(function () {
  "use strict";

  const ROWS = 5; // تعداد مرحله‌های هر قالی
  const CARPETS = [
    { city: "کاشان", field: "#8e2424", medallion: "#1e2a4a", border: "#1e2a4a" },
    { city: "تبریز", field: "#f1e4c8", medallion: "#8e2424", border: "#2b3d6b" },
    { city: "کرمان", field: "#2b3d6b", medallion: "#b33b35", border: "#8e2424" },
    { city: "نائین", field: "#efe4cf", medallion: "#2c4f7a", border: "#2c4f7a" },
    { city: "هریس", field: "#a33a2a", medallion: "#e7c36a", border: "#1e2a4a" },
    { city: "قم", field: "#e7d3a8", medallion: "#2c7a7b", border: "#8e2424" },
  ];
  const carpetOf = (level) => CARPETS[Math.floor(level / ROWS) % CARPETS.length];
  const IVORY = "#f4e9d4", SAFFRON = "#d9a441";

  function addLoom() {
    const warp = [];
    for (let x = -40; x <= 40; x += 3.2) warp.push(`<line x1="${x.toFixed(1)}" y1="-46" x2="${x.toFixed(1)}" y2="46"/>`);
    const pegs = Array.from({ length: 28 }, (_, i) => {
      const a = (i * Math.PI * 2) / 28;
      const x = (Math.cos(a) * 46.8).toFixed(2), y = (Math.sin(a) * 46.8).toFixed(2);
      return `<circle cx="${x}" cy="${(+y + 0.5).toFixed(2)}" r="1.6" fill="rgba(30, 14, 4, .45)"/><circle cx="${x}" cy="${y}" r="1.45" fill="url(#brass)"/>`;
    }).join("");
    const div = document.createElement("div");
    div.className = "loom";
    div.innerHTML = `<svg viewBox="-50 -50 100 100" aria-hidden="true">
        <defs>
          <radialGradient id="wood" cx=".4" cy=".32" r=".85"><stop offset="0" stop-color="#b98050"/><stop offset=".6" stop-color="#8a5530"/><stop offset="1" stop-color="#5a3318"/></radialGradient>
          <radialGradient id="brass" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#fff2c4"/><stop offset=".45" stop-color="#d4a548"/><stop offset="1" stop-color="#6e4a12"/></radialGradient>
          <radialGradient id="cloth-shade" r=".5"><stop offset=".72" stop-color="#3a1c14" stop-opacity="0"/><stop offset="1" stop-color="#3a1c14" stop-opacity=".38"/></radialGradient>
          <filter id="grain" x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence type="fractalNoise" baseFrequency=".035 .6" numOctaves="3" seed="5"/>
            <feColorMatrix values="0 0 0 0 .2  0 0 0 0 .1  0 0 0 0 .03  0 0 0 1.4 -.55"/>
            <feComposite in2="SourceGraphic" operator="in"/>
          </filter>
          <filter id="loom-pile" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="2" seed="9"/>
            <feColorMatrix values="0 0 0 0 .45  0 0 0 0 .28  0 0 0 0 .15  0 0 0 .9 -.35"/>
            <feComposite in2="SourceGraphic" operator="in"/>
          </filter>
          <clipPath id="loom-in"><circle r="43"/></clipPath>
        </defs>
        <circle r="50" fill="url(#wood)"/>
        <circle r="50" fill="#000" filter="url(#grain)"/>
        <circle r="49.3" fill="none" stroke="rgba(255, 225, 180, .35)" stroke-width=".7"/>
        ${pegs}
        <circle r="44.2" fill="#3c2010" opacity=".55"/>
        <circle r="43.5" fill="#f1e3c6"/>
        <g clip-path="url(#loom-in)">
          <circle r="43.5" fill="#000" filter="url(#loom-pile)"/>
          <g stroke="rgba(120, 76, 44, .4)" stroke-width=".55">${warp.join("")}</g>
          <polygon points="0,-17 15,0 0,17 -15,0" fill="#8e2424" opacity=".14"/>
          <polygon points="0,-9 8,0 0,9 -8,0" fill="#1e2a4a" opacity=".14"/>
          <circle r="43.5" fill="url(#cloth-shade)"/>
        </g>
      </svg>`;
    document.getElementById("wheel").prepend(div);
  }

  // نور کج پنجره‌ی کارگاه و پرزهای ریزی که آرام در آن بالا می‌روند
  function workshopLight() {
    const r = (a, b) => (a + Math.random() * (b - a)).toFixed(1);
    const lint = Array.from({ length: 16 }, () =>
      `<i style="left:${r(0, 70)}%;top:${r(15, 95)}%;--s:${r(1.5, 3.5)}px;--o:${r(0.35, 0.8)};--x:${r(-20, 60)}px;--d:${r(10, 20)}s;--w:${r(-20, 0)}s"></i>`
    ).join("");
    return `<div class="workshop-light" aria-hidden="true">${lint}</div>`;
  }

  // نقشه‌ی یک قالی ایرانی ساده: حاشیه، متن، ترنج وسط و لچک‌های گوشه
  function carpetDesign(c) {
    const x = 22, y = 10, w = 156, h = 120;
    const dots = [];
    for (let i = 0; i < 13; i++) {
      const px = x + 10 + i * ((w - 20) / 12);
      dots.push(`<rect x="${px - 2}" y="${y + 3}" width="4" height="4" fill="${SAFFRON}" transform="rotate(45 ${px} ${y + 5})"/>`);
      dots.push(`<rect x="${px - 2}" y="${y + h - 7}" width="4" height="4" fill="${SAFFRON}" transform="rotate(45 ${px} ${y + h - 5})"/>`);
    }
    for (let i = 0; i < 10; i++) {
      const py = y + 12 + i * ((h - 24) / 9);
      dots.push(`<rect x="${x + 3}" y="${py - 2}" width="4" height="4" fill="${SAFFRON}" transform="rotate(45 ${x + 5} ${py})"/>`);
      dots.push(`<rect x="${x + w - 7}" y="${py - 2}" width="4" height="4" fill="${SAFFRON}" transform="rotate(45 ${x + w - 5} ${py})"/>`);
    }
    const cx = x + w / 2, cy = y + h / 2;
    const flowers = [[60, 34], [140, 34], [60, 106], [140, 106], [44, 70], [156, 70]]
      .map(([fx, fy]) => `<circle cx="${fx}" cy="${fy}" r="3" fill="${SAFFRON}" opacity=".85"/><circle cx="${fx}" cy="${fy}" r="1.2" fill="${IVORY}"/>`).join("");
    return `
      <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c.border}"/>
      ${dots.join("")}
      <rect x="${x + 10}" y="${y + 10}" width="${w - 20}" height="${h - 20}" fill="${c.field}" stroke="${IVORY}" stroke-width="1.5"/>
      <path d="M${x + 10} ${y + 10} h22 l-22 18Z M${x + w - 10} ${y + 10} h-22 l22 18Z M${x + 10} ${y + h - 10} h22 l-22 -18Z M${x + w - 10} ${y + h - 10} h-22 l22 -18Z" fill="${c.medallion}"/>
      ${flowers}
      <polygon points="${cx},${cy - 32} ${cx + 34},${cy} ${cx},${cy + 32} ${cx - 34},${cy}" fill="${c.medallion}" stroke="${IVORY}" stroke-width="1.5"/>
      <polygon points="${cx},${cy - 18} ${cx + 19},${cy} ${cx},${cy + 18} ${cx - 19},${cy}" fill="${SAFFRON}"/>
      <polygon points="${cx},${cy - 8} ${cx + 8},${cy} ${cx},${cy + 8} ${cx - 8},${cy}" fill="${c.field}"/>`;
  }

  const heightFor = (rows) => (120 * rows) / ROWS;

  // قالی روی دار: تا ارتفاع woven بافته شده و بقیه هنوز تارهای خالی است.
  // id باید یکتا باشد، چون نسخه‌ی منو و نسخه‌ی پنجره‌ی پایان مرحله با هم در صفحه‌اند.
  function loomSVG(c, woven, { id, cls, done, extra = "" }) {
    const warp = [];
    for (let x = 24; x <= 176; x += 3) warp.push(`<line x1="${x}" y1="8" x2="${x}" y2="132"/>`);
    const fringe = [];
    for (let x = 24; x <= 176; x += 3) fringe.push(`<line x1="${x}" y1="130" x2="${x}" y2="138"/>`);
    return `<svg class="${cls}" viewBox="0 0 200 142" aria-hidden="true">
        <defs>
          <clipPath id="${id}"><rect class="woven-rect" x="0" y="${130 - woven}" width="200" height="${woven}"/></clipPath>
          <linearGradient id="${id}-beam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b07a48"/><stop offset=".5" stop-color="#7a4a24"/><stop offset="1" stop-color="#4e2c12"/></linearGradient>
          <linearGradient id="${id}-light" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff4dc" stop-opacity=".22"/><stop offset=".55" stop-color="#fff4dc" stop-opacity="0"/><stop offset="1" stop-color="#3a1c14" stop-opacity=".22"/></linearGradient>
          <filter id="${id}-grain" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency=".02 .9" numOctaves="3" seed="4"/>
            <feColorMatrix values="0 0 0 0 .18  0 0 0 0 .09  0 0 0 0 .03  0 0 0 1.4 -.55"/>
            <feComposite in2="SourceGraphic" operator="in"/>
          </filter>
          <filter id="${id}-pile" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="1.3 .8" numOctaves="2" seed="8"/>
            <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .55 -.2"/>
            <feComposite in2="SourceGraphic" operator="in"/>
          </filter>
        </defs>
        <rect x="22" y="8" width="156" height="124" fill="#efe2cc"/>
        <g stroke="rgba(120, 70, 40, .35)" stroke-width=".7">${warp.join("")}</g>
        <g clip-path="url(#${id})">${carpetDesign(c)}
          <rect x="22" y="10" width="156" height="120" fill="#000" filter="url(#${id}-pile)"/>
          <rect x="22" y="10" width="156" height="120" fill="url(#${id}-light)"/>
        </g>
        <g stroke="${IVORY}" stroke-width="1">${done ? fringe.join("") : ""}</g>
        <rect x="10" y="2" width="180" height="8" rx="3" fill="url(#${id}-beam)"/>
        <rect x="10" y="2" width="180" height="8" rx="3" fill="#000" filter="url(#${id}-grain)"/>
        <rect x="10" y="130" width="180" height="4" rx="2" fill="url(#${id}-beam)" opacity="${done ? 0 : 1}"/>
        ${extra}
      </svg>`;
  }

  // پنجره‌ی پایان مرحله: ردیف تازه از پایین بالا می‌آید
  function loomCarpet(level) {
    const rows = (level % ROWS) + 1;
    const c = carpetOf(level);
    const svg = loomSVG(c, heightFor(rows - 1), { id: "woven-card", cls: "extra loom-carpet", done: rows === ROWS });
    return { svg, from: heightFor(rows - 1), to: heightFor(rows), rows, city: c.city };
  }

  // منو: قالیِ در حال بافت، با ماکویی که روی خط بافت می‌رود و برمی‌گردد
  function homeLoom(done) {
    const rows = done % ROWS;
    const c = carpetOf(done);
    const edge = 130 - heightFor(rows);
    const shuttle = `<g transform="translate(0 ${edge - 3})">
        <line x1="24" y1="3" x2="176" y2="3" stroke="#b8322a" stroke-width=".8" opacity=".55"/>
        <g class="shuttle"><path d="M0 3 Q8 -2 22 -1 L30 3 L22 7 Q8 8 0 3Z" fill="#8a5a2c" stroke="#5b3818" stroke-width=".8"/>
        <ellipse cx="15" cy="3" rx="5" ry="2.4" fill="#b8322a"/>
      </g></g>`;
    return {
      svg: loomSVG(c, heightFor(rows), { id: "woven-home", cls: "home-loom", done: false, extra: shuttle }),
      caption: `قالی ${c.city} · ${faDigits(rows)} از ${faDigits(ROWS)} ردیف بافته شده`,
    };
  }

  function growCarpet(svgEl, from, to) {
    const rect = svgEl.querySelector(".woven-rect");
    const t0 = performance.now();
    (function step(now) {
      const t = Math.min((now - t0) / 1300, 1);
      const h = from + (to - from) * (t * t * (3 - 2 * t));
      rect.setAttribute("y", 130 - h);
      rect.setAttribute("height", h);
      if (t < 1 && svgEl.isConnected) requestAnimationFrame(step);
    })(t0);
  }

  defineTheme("carpet", {
    name: (level) => "قالی " + carpetOf(level).city,

    setup() {
      document.body.insertAdjacentHTML("afterbegin", `<div class="kilim top"></div><div class="kilim bottom"></div>${workshopLight()}`);
      addLoom();
      return () => document.querySelectorAll(".kilim, .loom, .workshop-light").forEach((el) => el.remove());
    },

    on: {
      home(d) {
        const box = document.getElementById("homeScene");
        const loom = homeLoom(d.done);
        box.innerHTML = loom.svg + `<p class="scene-caption"></p>`;
        box.querySelector(".scene-caption").textContent = loom.caption;
      },
      wrong() {
        const wheel = document.getElementById("wheel");
        wheel.classList.remove("snap");
        void wheel.offsetWidth;
        wheel.classList.add("snap");
      },
      shuffle() {
        document.querySelector(".loom").animate(
          [{ transform: "rotate(0)" }, { transform: "rotate(-120deg)" }, { transform: "rotate(0)" }],
          { duration: 700, easing: "ease-in-out" }
        );
      },
      complete(d) {
        const card = document.querySelector("#overlay .card");
        const c = loomCarpet(d.level);
        card.insertAdjacentHTML("afterbegin", c.svg);
        growCarpet(card.querySelector(".loom-carpet"), c.from, c.to);
        document.getElementById("overlayTitle").textContent =
          c.rows === ROWS ? `قالی ${c.city} کامل شد!` : `ردیف ${faDigits(c.rows)} از ${faDigits(ROWS)} بافته شد`;
      },
    },
  });
})();
