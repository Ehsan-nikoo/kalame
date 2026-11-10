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
      return `<circle cx="${(Math.cos(a) * 47).toFixed(2)}" cy="${(Math.sin(a) * 47).toFixed(2)}" r="1.4" fill="#e8c99a"/>`;
    }).join("");
    const div = document.createElement("div");
    div.className = "loom";
    div.innerHTML = `<svg viewBox="-50 -50 100 100" aria-hidden="true">
        <defs>
          <radialGradient id="wood" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#c48a52"/><stop offset="1" stop-color="#6e4020"/></radialGradient>
          <clipPath id="loom-in"><circle r="43"/></clipPath>
        </defs>
        <circle r="50" fill="url(#wood)"/>${pegs}
        <circle r="43.5" fill="#f4e9d4"/>
        <g clip-path="url(#loom-in)">
          <g stroke="rgba(140, 90, 50, .32)" stroke-width=".6">${warp.join("")}</g>
          <polygon points="0,-17 15,0 0,17 -15,0" fill="#8e2424" opacity=".16"/>
          <polygon points="0,-9 8,0 0,9 -8,0" fill="#1e2a4a" opacity=".16"/>
        </g>
      </svg>`;
    document.getElementById("wheel").prepend(div);
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
        <defs><clipPath id="${id}"><rect class="woven-rect" x="0" y="${130 - woven}" width="200" height="${woven}"/></clipPath></defs>
        <rect x="22" y="8" width="156" height="124" fill="#efe2cc"/>
        <g stroke="rgba(120, 70, 40, .35)" stroke-width=".7">${warp.join("")}</g>
        <g clip-path="url(#${id})">${carpetDesign(c)}</g>
        <g stroke="${IVORY}" stroke-width="1">${done ? fringe.join("") : ""}</g>
        <rect x="10" y="2" width="180" height="8" rx="3" fill="#7a4a24"/>
        <rect x="10" y="130" width="180" height="4" rx="2" fill="#7a4a24" opacity="${done ? 0 : 1}"/>
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
      document.body.insertAdjacentHTML("afterbegin", `<div class="kilim top"></div><div class="kilim bottom"></div>`);
      addLoom();
      return () => document.querySelectorAll(".kilim, .loom").forEach((el) => el.remove());
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
        if (d.daily) return; // چالش روزانه جزو پیشرفت این ظاهر نیست
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
