// ظاهر «کاشی‌کاری»: دیوار کاشی هفت‌رنگ لاجوردی و فیروزه‌ای، با شمسه‌ی کاشی به جای دایره‌ی حروف.
// هر کلمه‌ی درست، خانه‌های خاکی جدول را کاشی لعاب‌دار می‌کند. هر ۶ مرحله یک بنای کاشی‌کاری‌شده است
// (مسجد شیخ لطف‌الله، گوهرشاد، ...)؛ با هر مرحله یک بخش بنا ساخته می‌شود و بخش‌های مانده طرح نقطه‌چین‌اند.
(function () {
  "use strict";

  const PARTS = 6;
  const BUILDINGS = ["مسجد شیخ لطف‌الله", "مسجد امام اصفهان", "مسجد گوهرشاد", "مسجد کبود تبریز", "مسجد جامع یزد", "مدرسه‌ی چهارباغ", "مسجد نصیرالملک"];
  const buildingOf = (level) => BUILDINGS[Math.floor(level / PARTS) % BUILDINGS.length];

  // ستاره‌ی چندپر: n پر، شعاع بیرونی R و درونی r
  function star(n, R, r, rot = 0) {
    const pts = [];
    for (let i = 0; i < 2 * n; i++) {
      const a = (Math.PI * i) / n + rot;
      const rr = i % 2 ? r : R;
      pts.push(`${(Math.cos(a) * rr).toFixed(2)},${(Math.sin(a) * rr).toFixed(2)}`);
    }
    return pts.join(" ");
  }

  // ---------- شمسه‌ی کاشی: زیر دایره‌ی حروف ----------
  function addShamseh() {
    const dots = Array.from({ length: 48 }, (_, i) => {
      const a = (i * Math.PI) / 24;
      return `<circle cx="${(Math.cos(a) * 47.6).toFixed(2)}" cy="${(Math.sin(a) * 47.6).toFixed(2)}" r=".75" fill="#efe3c6"/>`;
    }).join("");
    const petals = Array.from({ length: 8 }, (_, i) =>
      `<path d="M0 -6C4 -10 4 -16 0 -20C-4 -16 -4 -10 0 -6Z" transform="rotate(${i * 45 + 22.5})"/>`).join("");
    const leaves = Array.from({ length: 16 }, (_, i) =>
      `<path d="M0 -24c2 -3 2 -6 0 -8c-2 2 -2 5 0 8z" transform="rotate(${i * 22.5})"/>`).join("");
    const div = document.createElement("div");
    div.className = "tile-shamseh";
    div.innerHTML = `<svg viewBox="-52 -52 104 104" aria-hidden="true">
        <defs>
          <radialGradient id="ts-cobalt" r=".5"><stop offset=".55" stop-color="#1d4a86"/><stop offset="1" stop-color="#112c55"/></radialGradient>
          <radialGradient id="ts-turq" r=".5"><stop offset=".3" stop-color="#36b6c6"/><stop offset="1" stop-color="#1c8aa0"/></radialGradient>
          <radialGradient id="ts-ivory" r=".5"><stop offset="0" stop-color="#faf3e2"/><stop offset="1" stop-color="#e6d6b0"/></radialGradient>
          <radialGradient id="ts-gloss" cx=".32" cy=".24" r=".6"><stop offset="0" stop-color="#fff" stop-opacity=".38"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/></radialGradient>
        </defs>
        <circle r="51" fill="#d9a441"/><circle r="50" fill="url(#ts-cobalt)"/>${dots}
        <circle r="45.6" fill="none" stroke="#d9a441" stroke-width=".6"/>
        <polygon points="${star(16, 45, 33.5, -Math.PI / 2)}" fill="url(#ts-turq)" stroke="#efe3c6" stroke-width="1" stroke-linejoin="round"/>
        <polygon points="${star(16, 38, 31, -Math.PI / 2 + Math.PI / 16)}" fill="none" stroke="#12305a" stroke-width=".5" opacity=".5"/>
        <circle r="30.4" fill="url(#ts-ivory)" stroke="#d9a441" stroke-width="1"/>
        <g fill="#2a9fb3" opacity=".55">${leaves}</g>
        <circle r="21" fill="none" stroke="#1d4a86" stroke-width=".6" opacity=".6"/>
        <g fill="#1d4a86" opacity=".28">${petals}</g>
        <circle r="5" fill="#d9a441" opacity=".7"/>
        <circle r="51" fill="url(#ts-gloss)"/>
      </svg>`;
    document.getElementById("wheel").prepend(div);
  }

  // ---------- بنای کاشی‌کاری‌شده، بخش به بخش ----------
  // هر بخش: name، ghost (طرح نقطه‌چین وقتی هنوز ساخته نشده) و svg (k: پیشوند یکتای idها)
  // بخش‌ها به این ترتیب ساخته می‌شوند، ولی به ترتیب جلو و عقب (z) کشیده می‌شوند.
  const DOME = "M78 30C76 18 90 10 100 8C110 10 124 18 122 30Z";
  const PARTS_DEF = [
    {
      name: "ازاره و دیوار",
      z: 3,
      ghost: "M16 60h168v24h-168z",
      svg: (k) => `<rect x="16" y="60" width="168" height="24" fill="url(#${k}-brick)"/>
        <rect x="16" y="58.4" width="168" height="2.6" fill="#2a9fb3"/><rect x="16" y="58" width="168" height=".6" fill="#efe3c6"/>
        ${[26, 39, 52, 65, 135, 148, 161, 174].map((x) => `<path d="M${x - 4.6} 82V70.6q4.6 -6.4 9.2 0V82z" fill="#17396b" stroke="#2a9fb3" stroke-width=".8"/>` +
          `<path d="M${x - 2.6} 82V72q2.6 -3.6 5.2 0V82z" fill="#0d2240"/>`).join("")}
        <rect x="16" y="82" width="168" height="2" fill="#a88454"/>`,
    },
    {
      name: "سردر و ایوان",
      z: 4,
      ghost: "M76 36h48v48h-48z",
      svg: (k) => `<rect x="76" y="36" width="48" height="48" fill="#1d4a86"/>
        <rect x="76" y="36" width="48" height="48" fill="url(#${k}-pat)" opacity=".55"/>
        <rect x="76.8" y="36.8" width="46.4" height="46.4" fill="none" stroke="#2a9fb3" stroke-width="1.6"/>
        <rect x="79.4" y="39.4" width="41.2" height="5" fill="#12305a"/>
        <path d="M82 42q2 -2 4 0t4 0q1 -2.4 3 -.4M96 42.4q3 -2.6 5 0q2 -1.8 4 0M108 42q2 -2 4 0t4 0" stroke="#efe3c6" stroke-width=".7" fill="none" stroke-linecap="round"/>
        <path d="M84 84V60q16 -18 32 0V84z" fill="#0f2747" stroke="#efe3c6" stroke-width=".7"/>
        <g fill="none" stroke="#5cc3cf" stroke-width=".6" opacity=".9">
          <path d="M86 62q2.5 -3.4 5 0q2.5 -3.4 5 0q2.5 -3.4 5 0q2.5 -3.4 5 0q2.5 -3.4 5 0q2.5 -3.4 5 0"/>
          <path d="M89 57q2.4 -3.2 4.8 0q2.4 -3.2 4.8 0q2.4 -3.2 4.8 0q2.4 -3.2 4.8 0q2.4 -3.2 4.8 0"/>
          <path d="M93 52.4q2.3 -3 4.6 0q2.3 -3 4.6 0q2.3 -3 4.6 0"/>
          <path d="M97.4 48.4q2.6 -2.8 5.2 0"/></g>
        <path d="M94 84V72q6 -7 12 0V84z" fill="#5a3a22"/><path d="M100 84V68.6" stroke="#3a2414" stroke-width=".6"/>
        <g fill="#d9a441"><circle cx="80.4" cy="50" r="1.1"/><circle cx="119.6" cy="50" r="1.1"/></g>
        <path d="M78 47c2 3 2 6 0 9M122 47c-2 3 -2 6 0 9" stroke="#efe3c6" stroke-width=".6" fill="none"/>`,
    },
    {
      name: "گنبد",
      z: 1,
      ghost: `${DOME}M82 30h36v8h-36z`,
      svg: (k) => `<rect x="82" y="29" width="36" height="9" fill="#1d4a86"/>
        ${[86, 92, 98, 104, 110].map((x) => `<path d="M${x} 37v-4q2 -2.4 4 0v4z" fill="#0d2240"/>`).join("")}
        <path d="${DOME}" fill="url(#${k}-dome)"/>
        <path d="M84 27C84 19 92 13 99 11" stroke="#fff" stroke-width="1.6" fill="none" opacity=".35" stroke-linecap="round"/>`,
    },
    {
      name: "نقش اسلیمی گنبد",
      z: 2,
      ghost: "",
      svg: (k) => `<g clip-path="url(#${k}-dclip)">
        <g fill="none" stroke="#efe3c6" stroke-width=".55" opacity=".85">
          ${[-20, -12, -4, 4, 12, 20].map((dx) => `<path d="M100 8Q${100 + dx * 1.15} 16 ${100 + dx * 1.1} 30"/>`).join("")}
        </g>
        <g fill="#e8b94a">${[[90, 22], [100, 20], [110, 22], [95, 14.6], [105, 14.6], [84, 27], [116, 27]].map(([x, y]) =>
          `<path d="M${x} ${y - 2.4}q1.8 2.4 0 4.8q-1.8 -2.4 0 -4.8z"/><circle cx="${x}" cy="${y}" r=".7" fill="#12305a"/>`).join("")}</g>
        <path d="M78 27.6q5.5 -2.4 11 0t11 0t11 0t11 0" stroke="#e8b94a" stroke-width=".9" fill="none"/>
        <rect x="76" y="28.6" width="48" height="1.6" fill="#12305a"/>
        </g>`,
    },
    {
      name: "مناره‌ها",
      z: 0,
      ghost: "M64 18h8v66h-8zM128 18h8v66h-8z",
      svg: (k) => [68, 132].map((x) => `<rect x="${x - 4}" y="20" width="8" height="64" fill="url(#${k}-min)"/>
        <g stroke="#2a9fb3" stroke-width=".8" opacity=".9">${[30, 40, 50].map((y) => `<path d="M${x - 4} ${y + 3}l8 -3M${x - 4} ${y + 6}l8 -3"/>`).join("")}</g>
        <rect x="${x - 6}" y="24" width="12" height="2.6" fill="#efe3c6"/><rect x="${x - 5.4}" y="26.6" width="10.8" height="1.2" fill="#a88454"/>
        <rect x="${x - 3.2}" y="18" width="6.4" height="6" fill="#1d4a86"/>
        <path d="M${x - 4} 18q4 -9 8 0z" fill="#2a9fb3"/><path d="M${x} 9.6v-3" stroke="#d9a441" stroke-width=".9"/>`).join(""),
    },
    {
      name: "کتیبه و گلدسته‌ی طلایی",
      z: 5,
      ghost: "M100 8v-6",
      svg: () => `<rect x="82" y="30.4" width="36" height="2.4" fill="#efe3c6"/>
        <path d="M84 31.6q1.5 -1.4 3 0t3 0t3 0t3 0t3 0t3 0t3 0t3 0t3 0t3 0t3 0" stroke="#1d4a86" stroke-width=".55" fill="none"/>
        <path d="M100 8V3" stroke="#d9a441" stroke-width="1.1"/><circle cx="100" cy="5.4" r="1.3" fill="#e8b94a"/>
        <path d="M98.4 2.2a1.9 1.9 0 1 0 3.2 0a1.5 1.5 0 1 1 -3.2 0z" fill="#e8b94a"/>
        <path d="M76 36.6h48" stroke="#e8b94a" stroke-width=".7"/>`,
    },
  ];

  let uid = 0;
  // بنا با count بخش اول؛ بخش fresh با درخشش ظاهر می‌شود؛ بقیه طرح نقطه‌چین‌اند
  function buildingSVG(count, fresh, cls) {
    const k = "tb" + ++uid;
    const order = PARTS_DEF.map((p, i) => ({ ...p, i })).sort((a, b) => a.z - b.z);
    const body = order.map((p) => {
      if (p.i >= count) return p.ghost ? `<path class="tile-ghost" d="${p.ghost}"/>` : "";
      return `<g${p.i === fresh ? ' class="tile-new"' : ""}>${p.svg(k)}</g>`;
    }).join("");
    return `<svg class="${cls}" viewBox="0 0 200 100" aria-hidden="true">
      <defs>
        <clipPath id="${k}-c"><rect width="200" height="100" rx="6"/></clipPath>
        <clipPath id="${k}-dclip"><path d="${DOME}"/></clipPath>
        <linearGradient id="${k}-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5d87b4"/><stop offset=".55" stop-color="#b9c4c2"/><stop offset=".85" stop-color="#efd3a0"/></linearGradient>
        <radialGradient id="${k}-sun" cx=".5" cy=".55" r=".45"><stop offset="0" stop-color="#fff1cc" stop-opacity=".8"/><stop offset="1" stop-color="#fff1cc" stop-opacity="0"/></radialGradient>
        <linearGradient id="${k}-brick" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#dcc095"/><stop offset="1" stop-color="#bf9c6a"/></linearGradient>
        <linearGradient id="${k}-min" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#e2c79c"/><stop offset=".6" stop-color="#c7a473"/><stop offset="1" stop-color="#a9875a"/></linearGradient>
        <radialGradient id="${k}-dome" cx=".36" cy=".3" r=".8"><stop offset="0" stop-color="#7fd6de"/><stop offset=".45" stop-color="#2fa9b9"/><stop offset="1" stop-color="#16708a"/></radialGradient>
        <pattern id="${k}-pat" width="6" height="6" patternUnits="userSpaceOnUse"><path d="M3 0l3 3l-3 3l-3 -3z" fill="#2a9fb3" opacity=".6"/><circle cx="3" cy="3" r=".7" fill="#efe3c6"/></pattern>
        <linearGradient id="${k}-pool" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fc7cf"/><stop offset="1" stop-color="#2d7f96"/></linearGradient>
      </defs>
      <g clip-path="url(#${k}-c)">
        <rect width="200" height="100" fill="url(#${k}-sky)"/>
        <ellipse cx="100" cy="40" rx="90" ry="40" fill="url(#${k}-sun)"/>
        <path d="M0 74q14 -4 26 -2t30 -3t40 2t44 -3t34 2t26 -1V84H0z" fill="#9aa7ad" opacity=".45"/>
        ${body}
        <rect y="84" width="200" height="16" fill="#d8c3a0"/>
        <path d="M60 88h80l10 12h-100z" fill="url(#${k}-pool)"/>
        <path d="M70 90h60" stroke="#fff" stroke-width=".5" opacity=".5"/>
        <rect width="200" height="100" fill="#fff6e0" opacity=".05"/>
      </g>
      <rect x=".7" y=".7" width="198.6" height="98.6" rx="6" fill="none" stroke="#d9a441" stroke-width="1.2"/>
      <rect x="2.4" y="2.4" width="195.2" height="95.2" rx="4.6" fill="none" stroke="#efe3c6" stroke-width=".4" opacity=".7"/>
    </svg>`;
  }

  // ---------- کاشی که با کلمه‌ی درست روی خانه‌ها می‌نشیند: یک برق از روی لعاب رد می‌شود ----------
  function glint(cells) {
    if (!cells || (typeof calm === "function" && calm())) return;
    cells.forEach((cell, i) => {
      cell.classList.remove("tile-glint");
      void cell.offsetWidth;
      cell.style.setProperty("--g", i * 70 + 380 + "ms");
      cell.classList.add("tile-glint");
    });
  }

  function turn(deg, ms) {
    const s = document.querySelector(".tile-shamseh");
    if (s) s.animate([{ transform: "rotate(0)" }, { transform: `rotate(${deg}deg)` }], { duration: ms, easing: "cubic-bezier(.4,0,.2,1)" });
  }

  defineTheme("tile", {
    name: (level) => buildingOf(level),

    setup() {
      document.body.insertAdjacentHTML("beforeend", `<div class="tile-frame" aria-hidden="true"></div>`);
      addShamseh();
      return () => document.querySelectorAll(".tile-frame, .tile-shamseh").forEach((el) => el.remove());
    },

    on: {
      home(d) {
        const count = d.done % PARTS;
        const box = document.getElementById("homeScene");
        box.innerHTML = buildingSVG(count, -1, "tile-scene home-tile") + `<p class="scene-caption"></p>`;
        box.querySelector(".scene-caption").textContent = count
          ? `${buildingOf(d.done)} · ${faDigits(count)} از ${faDigits(PARTS)} بخش کاشی شده`
          : `بنای تازه: ${buildingOf(d.done)}`;
      },
      found(d) {
        glint(d.cells);
      },
      hint(d) {
        glint(d.cells);
      },
      wrong() {
        const wheel = document.getElementById("wheel");
        wheel.classList.remove("tile-shake");
        void wheel.offsetWidth;
        wheel.classList.add("tile-shake");
      },
      shuffle() {
        turn(45, 600);
      },
      complete(d) {
        const step = d.level % PARTS;
        document.querySelector("#overlay .card").insertAdjacentHTML("afterbegin",
          `<div class="extra tile-done">${buildingSVG(step + 1, step, "tile-scene")}</div>`);
        document.getElementById("overlayTitle").textContent =
          step === PARTS - 1 ? `${buildingOf(d.level)} کامل شد!` : `«${PARTS_DEF[step].name}» کاشی شد`;
      },
    },
  });
})();
