// ظاهر «کاشی‌کاری»: دیوار کاشی هفت‌رنگ لاجوردی و فیروزه‌ای، با تابلوی کاشی معرق هشت‌ضلعی به جای دایره‌ی حروف.
// هر کلمه‌ی درست، خانه‌های خاکی جدول را کاشی لعاب‌دار می‌کند. هر ۶ مرحله یک داستان شاهنامه است
// (۱۰۷ داستان به ترتیب شاهنامه، از کیومرث تا یزدگرد) که به سبک نگارگری ایرانی، سه‌بعدی ساخته می‌شود.
(function () {
  "use strict";

  const PARTS = 6;

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

  // ---------- تابلوی کاشی معرق هشت‌ضلعی: زیر دایره‌ی حروف ----------
  // قاب آجری، نوار کاشی‌های ریز شطرنجی، زمینه‌ی شش‌ضلعی و مثلث (کاشی معرق) و ترنج کوچک وسط.
  // عمداً گرد و طلایی نیست تا با دایره‌ی حروف «کاروان ابریشم» فرق داشته باشد.
  const OCT = (R) => Array.from({ length: 8 }, (_, i) => {
    const a = ((i * 45 + 22.5) * Math.PI) / 180;
    return `${(Math.cos(a) * R).toFixed(2)},${(Math.sin(a) * R).toFixed(2)}`;
  }).join(" ");
  function addPanel() {
    const s = 5.2, H = 2 * s * Math.sqrt(3);
    const hex = (cx, cy, r) => Array.from({ length: 6 }, (_, i) => {
      const a = (i * Math.PI) / 3;
      return `${(cx + Math.cos(a) * r).toFixed(2)},${(cy + Math.sin(a) * r).toFixed(2)}`;
    }).join(" ");
    const hexA = [[0, 0], [2 * s, 0], [0, H], [2 * s, H]].map(([x, y]) =>
      `<polygon points="${hex(x, y, s)}" fill="#2a9fb3"/><polygon points="${hex(x, y, s * 0.45)}" fill="#1f7d66"/>`).join("");
    const hexB = `<polygon points="${hex(s, H / 2, s)}" fill="#efe3c6"/><circle cx="${s}" cy="${H / 2}" r="${s * 0.3}" fill="#c9862f"/>`;
    const div = document.createElement("div");
    div.className = "tile-panel";
    div.innerHTML = `<svg viewBox="-52 -52 104 104" aria-hidden="true">
        <defs>
          <linearGradient id="tp-brick" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cf8656"/><stop offset="1" stop-color="#9a5232"/></linearGradient>
          <pattern id="tp-bond" width="8" height="4" patternUnits="userSpaceOnUse">
            <path d="M0 0H8M0 2H8M0 0V2M4 2V4" stroke="#6e3a20" stroke-width=".45" opacity=".55"/></pattern>
          <pattern id="tp-check" width="5" height="5" patternUnits="userSpaceOnUse">
            <rect width="5" height="5" fill="#1d4a86"/><rect width="2.5" height="2.5" fill="#2a9fb3"/><rect x="2.5" y="2.5" width="2.5" height="2.5" fill="#2a9fb3"/></pattern>
          <pattern id="tp-moarraq" width="${2 * s}" height="${H}" patternUnits="userSpaceOnUse">
            <rect width="${2 * s}" height="${H}" fill="#17396b"/>${hexA}${hexB}
            <g fill="none" stroke="#241a14" stroke-width=".45">${[[0, 0], [2 * s, 0], [0, H], [2 * s, H], [s, H / 2]].map(([x, y]) => `<polygon points="${hex(x, y, s)}"/>`).join("")}</g>
          </pattern>
          <radialGradient id="tp-gloss" cx=".3" cy=".22" r=".7"><stop offset="0" stop-color="#fff" stop-opacity=".3"/><stop offset=".55" stop-color="#fff" stop-opacity="0"/></radialGradient>
        </defs>
        <polygon points="${OCT(52)}" fill="url(#tp-brick)"/>
        <polygon points="${OCT(52)}" fill="url(#tp-bond)"/>
        <polygon points="${OCT(45.4)}" fill="#e2b04a" stroke="#6e3a20" stroke-width=".6"/>
        <polygon points="${OCT(44)}" fill="url(#tp-check)"/>
        <polygon points="${OCT(39.6)}" fill="#241a14"/>
        <polygon points="${OCT(39)}" fill="url(#tp-moarraq)"/>
        <polygon points="${OCT(13.6)}" fill="#241a14"/>
        <polygon points="${OCT(13)}" fill="#efe3c6"/>
        <g fill="#1f7d66"><circle cx="0" cy="-5" r="3.2"/><circle cx="5" cy="0" r="3.2"/><circle cx="0" cy="5" r="3.2"/><circle cx="-5" cy="0" r="3.2"/></g>
        <rect x="-2.6" y="-2.6" width="5.2" height="5.2" transform="rotate(45)" fill="#c9862f"/>
        <polygon points="${OCT(52)}" fill="url(#tp-gloss)"/>
      </svg>`;
    document.getElementById("wheel").prepend(div);
  }

  // ---------- نگاره‌ی سه‌بعدی شاهنامه، بخش به بخش (themes/shahnameh.js) ----------
  // هر ۶ مرحله یک داستان است؛ هر مرحله یک بخش نگاره را از طرح قلم به رنگ درمی‌آورد.
  const storyName = (level) => SHN.storyOf(level).name;
  let homeView = null;

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
    const s = document.querySelector(".tile-panel");
    if (s) s.animate([{ transform: "rotate(0)" }, { transform: `rotate(${deg}deg)` }], { duration: ms, easing: "cubic-bezier(.4,0,.2,1)" });
  }

  defineTheme("tile", {
    name: (level) => storyName(level),

    setup() {
      document.body.insertAdjacentHTML("beforeend", `<div class="tile-frame" aria-hidden="true"></div>`);
      addPanel();
      SHN.ready().catch(() => {});
      return () => {
        document.querySelectorAll(".tile-frame, .tile-panel").forEach((el) => el.remove());
        if (homeView) { homeView.dispose(); homeView = null; }
      };
    },

    on: {
      home(d) {
        const count = d.done % PARTS;
        const st = SHN.storyOf(d.done);
        const box = document.getElementById("homeScene");
        if (homeView) homeView.dispose();
        box.innerHTML = `<div class="shn-frame home-tile"><div class="shn-view"></div><div class="shn-title"></div></div><p class="scene-caption"></p>`;
        box.querySelector(".shn-title").textContent = st.name;
        homeView = SHN.show(box.querySelector(".shn-view"), { level: d.done, count, fresh: -1 });
        const no = `داستان ${faDigits(SHN.storyNo(d.done) + 1)} از ${faDigits(SHN.STORIES.length)}`;
        box.querySelector(".scene-caption").textContent = count
          ? `${no} · بخش ${faDigits(count)} از ${faDigits(PARTS)} کامل شده`
          : `${no} · نگاره‌ی تازه`;
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
        const st = SHN.storyOf(d.level);
        const done = step === PARTS - 1;
        document.querySelector("#overlay .card").insertAdjacentHTML("afterbegin",
          `<div class="extra tile-done"><div class="shn-frame"><div class="shn-view"></div><div class="shn-title"></div></div>${done ? '<p class="shn-line"></p>' : ""}</div>`);
        const box = document.querySelector("#overlay .tile-done");
        box.querySelector(".shn-title").textContent = st.name;
        if (done) box.querySelector(".shn-line").textContent = st.line;
        SHN.show(box.querySelector(".shn-view"), { level: d.level, count: step + 1, fresh: step });
        document.getElementById("overlayTitle").textContent =
          done ? `«${st.name}» کامل شد!` : `«${SHN.partName(st, step)}» نقش بست`;
      },
    },
  });
})();
