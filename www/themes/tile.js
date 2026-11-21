// ظاهر «شاهنامه» (شناسه‌ی قدیمی‌اش tile مانده تا خریدها و ذخیره‌ها به هم نخورند): صفحه‌ی نسخه‌ی خطی
// با جدول‌کشی طلا و لاجورد، و شمسه‌ی تذهیب به جای دایره‌ی حروف. هر کلمه‌ی درست خانه‌های جدول را رنگ می‌کند. هر ۶ مرحله یک داستان شاهنامه است
// (۱۰۷ داستان به ترتیب شاهنامه، از کیومرث تا یزدگرد) که به سبک نگارگری ایرانی، سه‌بعدی ساخته می‌شود.
(function () {
  "use strict";

  const PARTS = 6;

  // ---------- شمسه‌ی تذهیب: زیر دایره‌ی حروف ----------
  // مثل شمسه‌ی آغاز نسخه‌های خطی شاهنامه: پرتوهای لاجوردی، لبه‌ی کنگره‌ای طلا، نوار مرواریدی،
  // زمینه‌ی لاجوردی با اسلیمی و ختایی طلایی، و ترنج کوچک وسط.
  const f2 = (n) => n.toFixed(2);
  const polar = (r, deg) => { const a = ((deg - 90) * Math.PI) / 180; return [Math.cos(a) * r, Math.sin(a) * r]; };
  const around = (n, fn, off = 0) => Array.from({ length: n }, (_, i) => fn((i * 360) / n + off)).join("");
  // برگ اسلیمی (قلب نوک‌تیز) رو به بیرون، از شعاع r0 تا r1
  const eslimi = (r0, r1, w) => `M0 ${-r1} C${w * 0.5} ${-r1 + 2} ${w} ${-(r0 + r1) / 2} ${w * 0.45} ${-r0 - 1.2} C${w * 0.2} ${-r0} 0 ${-r0 + 0.8} 0 ${-r0 + 0.8} C0 ${-r0 + 0.8} ${-w * 0.2} ${-r0} ${-w * 0.45} ${-r0 - 1.2} C${-w} ${-(r0 + r1) / 2} ${-w * 0.5} ${-r1 + 2} 0 ${-r1}Z`;
  function shamseh() {
    const rays = around(48, (d) => {
      const [x1, y1] = polar(43, d - 1.6), [x2, y2] = polar(43, d + 1.6), [tx, ty] = polar(d % 15 ? 49 : 52, d);
      return `<polygon points="${f2(x1)},${f2(y1)} ${f2(tx)},${f2(ty)} ${f2(x2)},${f2(y2)}" fill="${d % 15 ? "#2c5aa0" : "#1d3a7a"}"/>`;
    });
    const tips = around(24, (d) => { const [x, y] = polar(52.2, d); return `<circle cx="${f2(x)}" cy="${f2(y)}" r=".9" fill="#d9a441"/>`; });
    const lobes = around(32, (d) => { const [x, y] = polar(42, d); return `<circle cx="${f2(x)}" cy="${f2(y)}" r="3.4"/>`; });
    const leaves = around(8, (d) => `<g transform="rotate(${d})"><path d="${eslimi(24, 35, 7)}" fill="url(#sh-gold)" stroke="#6b4a12" stroke-width=".35"/><path d="${eslimi(27, 32.5, 3)}" fill="#a8322a"/></g>`);
    const buds = around(8, (d) => `<g transform="rotate(${d})"><path d="${eslimi(19, 26, 4)}" fill="#2a9fb3" stroke="#d9a441" stroke-width=".4"/><circle cx="0" cy="-30" r="1.1" fill="#efe3c6"/></g>`, 22.5);
    const vines = around(16, (d) => `<path transform="rotate(${d})" d="M0 -21 C4 -22.5 8 -21 8.6 -17.6 C9 -15.2 7 -14 5.6 -15.4" fill="none" stroke="#d9a441" stroke-width=".55" stroke-linecap="round"/>`);
    const petals = around(8, (d) => `<path transform="rotate(${d})" d="M0 -3 C2.6 -5 2.6 -8.4 0 -10 C-2.6 -8.4 -2.6 -5 0 -3Z" fill="${(d / 45) % 2 ? "#2a9fb3" : "#a8322a"}" stroke="#6b4a12" stroke-width=".3"/>`);
    const inLobes = around(16, (d) => { const [x, y] = polar(13, d); return `<circle cx="${f2(x)}" cy="${f2(y)}" r="2"/>`; });
    return `<svg viewBox="-54 -54 108 108" aria-hidden="true">
        <defs>
          <radialGradient id="sh-gold" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#fbe3a0"/><stop offset=".55" stop-color="#e3b24f"/><stop offset="1" stop-color="#a8781e"/></radialGradient>
          <radialGradient id="sh-field" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#21508f"/><stop offset="1" stop-color="#112a57"/></radialGradient>
          <radialGradient id="sh-gloss" cx=".32" cy=".22" r=".7"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/></radialGradient>
        </defs>
        ${rays}${tips}
        <g fill="url(#sh-gold)">${lobes}<circle r="42"/></g>
        <circle r="40.4" fill="#efe3c6"/>
        <circle r="39.6" fill="#1d3a7a"/>
        <circle r="38" fill="none" stroke="#efe3c6" stroke-width="1.5" stroke-dasharray="0 3.32" stroke-linecap="round"/>
        <circle r="36.4" fill="#d9a441"/>
        <circle r="35.6" fill="url(#sh-field)"/>
        <circle r="21" fill="none" stroke="#d9a441" stroke-width=".55"/>
        ${vines}${buds}${leaves}
        <g fill="url(#sh-gold)">${inLobes}<circle r="13"/></g>
        <circle r="11" fill="#efe3c6" stroke="#6b4a12" stroke-width=".4"/>
        ${petals}
        <circle r="2.6" fill="#e3b24f" stroke="#6b4a12" stroke-width=".35"/>
        <circle r="42" fill="url(#sh-gloss)"/>
      </svg>`;
  }
  function addPanel() {
    const div = document.createElement("div");
    div.className = "tile-panel";
    div.innerHTML = shamseh();
    document.getElementById("wheel").prepend(div);
  }

  // ---------- نگاره‌ی سه‌بعدی شاهنامه، بخش به بخش (themes/shahnameh.js) ----------
  // هر ۶ مرحله یک داستان است؛ هر مرحله یک بخش نگاره را از طرح قلم به رنگ درمی‌آورد.
  const storyName = (level) => SHN.storyOf(level).name;
  let homeView = null;

  // ---------- نگاره‌ی منوی اصلی: به اندازه‌ی جای خالی بالای «کلمه» ----------
  // جعبه‌ی صحنه با flex ارتفاعش معلوم است؛ نگاره را طوری می‌چینیم که روی عنوان و دکمه‌ها نیفتد.
  // اگر جا خیلی کم باشد (صفحه‌ی کوتاه)، نگاره نشان داده نمی‌شود و فقط نوشته‌ی داستان می‌ماند.
  let lastHome = null;
  // ارتفاعی که نگاره در جعبه می‌گیرد (۰ یعنی جا نیست)
  function roomFor(box) {
    const frame = box.querySelector(".shn-frame");
    const cap = box.querySelector(".scene-caption");
    const cs = getComputedStyle(box);
    const fs = getComputedStyle(frame);
    const capH = cap ? cap.offsetHeight + parseFloat(getComputedStyle(cap).marginTop) : 0;
    const chrome = parseFloat(fs.marginTop) + parseFloat(fs.paddingTop) + parseFloat(fs.paddingBottom);
    const availH = box.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom) - capH - chrome - 4;
    const maxW = Math.min(box.clientWidth, 520) - parseFloat(fs.paddingLeft) - parseFloat(fs.paddingRight);
    return { h: Math.min(maxW * 0.5, availH), maxW };
  }
  function fitHome(box) {
    const home = box.parentElement;
    home.classList.remove("shn-tight");
    let { h, maxW } = roomFor(box);
    // صفحه‌ی کوتاه (مثل پنجره‌ی مرورگر کامپیوتر): لوگو کوچک‌تر و نوشته‌ی زیر نگاره حذف می‌شود
    // (اسم داستان روی کتیبه‌ی نگاره می‌ماند) تا نگاره جا شود.
    if (h < 120) {
      home.classList.add("shn-tight");
      const cap = box.querySelector(".scene-caption");
      const capText = cap.textContent;
      cap.remove();
      ({ h, maxW } = roomFor(box));
      if (h < 56) {
        home.classList.remove("shn-tight");
        box.querySelector(".shn-frame").remove();
        box.insertAdjacentHTML("beforeend", `<p class="scene-caption"></p>`);
        box.querySelector(".scene-caption").textContent = capText;
        return false;
      }
    }
    const w = Math.min(maxW, Math.round(h * 2.1));
    h = Math.round(Math.min(h, w * 0.56));
    const view = box.querySelector(".shn-view");
    view.style.width = w + "px";
    view.style.height = h + "px";
    return true;
  }
  function showHome(d) {
    lastHome = d;
    const count = d.done % PARTS;
    const st = SHN.storyOf(d.done);
    const box = document.getElementById("homeScene");
    if (homeView) { homeView.dispose(); homeView = null; }
    box.innerHTML = `<div class="shn-frame home-tile"><div class="shn-view"></div><div class="shn-title"></div></div><p class="scene-caption"></p>`;
    box.querySelector(".shn-title").textContent = st.name;
    const no = `داستان ${faDigits(SHN.storyNo(d.done) + 1)} از ${faDigits(SHN.STORIES.length)}`;
    box.querySelector(".scene-caption").textContent = count
      ? `${no} · بخش ${faDigits(count)} از ${faDigits(PARTS)} کامل شده`
      : `${no} · نگاره‌ی تازه`;
    if (fitHome(box)) homeView = SHN.show(box.querySelector(".shn-view"), { level: d.done, count, fresh: -1 });
  }
  let resizeT = 0;
  function onResize() {
    clearTimeout(resizeT);
    resizeT = setTimeout(() => {
      const box = document.getElementById("homeScene");
      if (lastHome && box && box.offsetParent !== null && box.querySelector(".scene-caption")) showHome(lastHome);
    }, 250);
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
    const s = document.querySelector(".tile-panel");
    if (s) s.animate([{ transform: "rotate(0)" }, { transform: `rotate(${deg}deg)` }], { duration: ms, easing: "cubic-bezier(.4,0,.2,1)" });
  }

  defineTheme("tile", {
    name: (level) => storyName(level),
    // روی نقشه‌ی مرحله‌ها شماره‌ی داستان هم نوشته می‌شود و دکمه‌ی «ادامه» اسم داستان را نشان می‌دهد
    mapName: (level) => `داستان ${faDigits(SHN.storyNo(level) + 1)}\n${storyName(level)}`,
    subName: true,

    setup() {
      document.body.insertAdjacentHTML("beforeend", `<div class="tile-frame" aria-hidden="true"></div>`);
      addPanel();
      SHN.ready().catch(() => {});
      addEventListener("resize", onResize);
      return () => {
        removeEventListener("resize", onResize);
        lastHome = null;
        document.querySelectorAll(".shn-tight").forEach((el) => el.classList.remove("shn-tight"));
        document.querySelectorAll(".tile-frame, .tile-panel").forEach((el) => el.remove());
        if (homeView) { homeView.dispose(); homeView = null; }
      };
    },

    on: {
      home: showHome,
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
        // مرحله‌ی روزانه و دوباره بازی کردن، تکه‌ی تازه‌ای به نقاشی اضافه نمی‌کنند
        const lv = d.daily ? save.unlocked : d.level;
        const step = d.daily ? (lv % PARTS) - 1 : lv % PARTS;
        const st = SHN.storyOf(lv);
        const fresh = d.first && !d.daily;
        const done = fresh && step === PARTS - 1;
        document.querySelector("#overlay .card").insertAdjacentHTML("afterbegin",
          `<div class="extra tile-done"><div class="shn-frame"><div class="shn-view"></div><div class="shn-title"></div></div>${done ? '<p class="shn-line"></p>' : ""}</div>`);
        const box = document.querySelector("#overlay .tile-done");
        box.querySelector(".shn-title").textContent = st.name;
        if (done) box.querySelector(".shn-line").textContent = st.line;
        SHN.show(box.querySelector(".shn-view"), { level: lv, count: step + 1, fresh: fresh ? step : -1 });
        if (fresh) document.getElementById("overlayTitle").textContent =
          done ? `«${st.name}» کامل شد!` : `«${SHN.partName(st, step)}» نقش بست`;
      },
    },
  });
})();
