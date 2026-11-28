// ظاهر «تخت جمشید»: سنگ آهک و نقش گل دوازده‌پر، جدول روی لوح سنگی با نوار گل‌ها،
// گل نیلوفر سنگی بزرگ زیر حروف و سکه‌های زرین (دریک) به جای حرف‌ها.
// هر ۶ مرحله یک بنای ایران باستان است (۴۰ بنا: هخامنشی، اشکانی و ساسانی، از صفه و آپادانا تا طاق کسری و طاق بستان) که با هر مرحله
// یک بخشش سه‌بعدی ساخته می‌شود (themes/persepolis-3d.js).
(function () {
  "use strict";

  const PARTS = 6;
  const f2 = (n) => n.toFixed(2);
  const polar = (r, deg) => { const a = ((deg - 90) * Math.PI) / 180; return [Math.cos(a) * r, Math.sin(a) * r]; };
  const around = (n, fn, off = 0) => Array.from({ length: n }, (_, i) => fn((i * 360) / n + off)).join("");

  // ---------- گل نیلوفر سنگی: زیر دایره‌ی حروف ----------
  // مثل گل‌های دوازده‌پر نقش‌برجسته‌های تخت جمشید: حلقه‌ی گل‌های ریز، و یک گل بزرگ دولایه با ناف زرین.
  function rosetteSmall(cx, cy, r) {
    return around(12, (d) => `<ellipse cx="${f2(cx)}" cy="${f2(cy - r * 0.55)}" rx="${f2(r * 0.17)}" ry="${f2(r * 0.45)}" transform="rotate(${d} ${f2(cx)} ${f2(cy)})"/>`) + `<circle cx="${f2(cx)}" cy="${f2(cy)}" r="${f2(r * 0.26)}"/>`;
  }
  function lotus() {
    const ring = around(24, (d) => { const [x, y] = polar(45.6, d); return rosetteSmall(x, y, 4.6); });
    const petal = (r0, r1, w) => `M0 ${-r0} C${w} ${-r0 - 2} ${w * 1.1} ${-(r0 + r1) / 2} 0 ${-r1} C${-w * 1.1} ${-(r0 + r1) / 2} ${-w} ${-r0 - 2} 0 ${-r0}Z`;
    const outer = around(12, (d) => `<g transform="rotate(${d})"><path d="${petal(12, 40, 9.2)}" fill="url(#pl-petal)" stroke="#5e4c38" stroke-width=".7"/><path d="${petal(16, 35, 3.2)}" fill="#a8946f" opacity=".55"/></g>`);
    const inner = around(12, (d) => `<g transform="rotate(${d})"><path d="${petal(8, 22, 5.2)}" fill="url(#pl-petal2)" stroke="#5e4c38" stroke-width=".6"/></g>`, 15);
    return `<svg viewBox="-54 -54 108 108" aria-hidden="true">
        <defs>
          <radialGradient id="pl-stone" cx=".38" cy=".3" r=".8"><stop offset="0" stop-color="#e2d4b4"/><stop offset=".6" stop-color="#c9b894"/><stop offset="1" stop-color="#a8946f"/></radialGradient>
          <linearGradient id="pl-petal" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e8dcc0"/><stop offset="1" stop-color="#bfac86"/></linearGradient>
          <linearGradient id="pl-petal2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#efe5cd"/><stop offset="1" stop-color="#cbb992"/></linearGradient>
          <radialGradient id="pl-gold" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#fbe3a0"/><stop offset=".55" stop-color="#d9a63e"/><stop offset="1" stop-color="#8a6216"/></radialGradient>
          <radialGradient id="pl-shade" cx=".5" cy=".5" r=".5"><stop offset=".7" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".28"/></radialGradient>
        </defs>
        <circle r="53" fill="#2a231d"/>
        <circle r="52" fill="url(#pl-gold)"/>
        <circle r="50.6" fill="#8e7c60"/>
        <g fill="#d8c9a8" stroke="#5e4c38" stroke-width=".35">${ring}</g>
        <circle r="41" fill="url(#pl-gold)"/>
        <circle r="40" fill="url(#pl-stone)"/>
        <circle r="40" fill="url(#pl-shade)"/>
        ${outer}${inner}
        <circle r="8.6" fill="#5e4c38"/>
        <circle r="8" fill="url(#pl-gold)"/>
        <g fill="#8a6216" opacity=".7">${around(12, (d) => { const [x, y] = polar(5.2, d); return `<circle cx="${f2(x)}" cy="${f2(y)}" r=".9"/>`; })}</g>
      </svg>`;
  }
  function addPanel() {
    const div = document.createElement("div");
    div.className = "prs-panel";
    div.innerHTML = lotus();
    document.getElementById("wheel").prepend(div);
  }

  // ---------- نمای سه‌بعدی بنا در منوی اصلی، به اندازه‌ی جای خالی ----------
  const monName = (level) => PRS.monumentOf(level).name;
  const ORD = ["", "دوم", "سوم", "چهارم", "پنجم", "ششم", "هفتم", "هشتم", "نهم", "دهم"];
  const roundTag = (level) => { const r = PRS.roundOf(level); return r ? ` · دور ${ORD[r] || faDigits(r + 1)}` : ""; };
  let homeView = null, lastHome = null, resizeT = 0;
  function roomFor(box) {
    const frame = box.querySelector(".prs-frame");
    const cap = box.querySelector(".scene-caption");
    const cs = getComputedStyle(box), fs = getComputedStyle(frame);
    const capH = cap ? cap.offsetHeight + parseFloat(getComputedStyle(cap).marginTop) : 0;
    const chrome = parseFloat(fs.marginTop) + parseFloat(fs.paddingTop) + parseFloat(fs.paddingBottom);
    const availH = box.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom) - capH - chrome - 4;
    const maxW = Math.min(box.clientWidth, 520) - parseFloat(fs.paddingLeft) - parseFloat(fs.paddingRight);
    return { h: Math.min(maxW * 0.56, availH), maxW };
  }
  // صفحه‌ی کوتاه: لوگو کوچک‌تر می‌شود و نوشته‌ی زیر نما می‌رود (اسم بنا روی کتیبه‌ی قاب می‌ماند)
  function fitHome(box) {
    const home = box.parentElement;
    home.classList.remove("prs-tight");
    let { h, maxW } = roomFor(box);
    if (h < 120) {
      home.classList.add("prs-tight");
      const cap = box.querySelector(".scene-caption"), capText = cap.textContent;
      cap.remove();
      ({ h, maxW } = roomFor(box));
      if (h < 56) {
        home.classList.remove("prs-tight");
        box.querySelector(".prs-frame").remove();
        box.insertAdjacentHTML("beforeend", `<p class="scene-caption"></p>`);
        box.querySelector(".scene-caption").textContent = capText;
        return false;
      }
    }
    const w = Math.min(maxW, Math.round(h * 2));
    h = Math.round(Math.min(h, w * 0.6));
    const view = box.querySelector(".prs-view");
    view.style.width = w + "px";
    view.style.height = h + "px";
    return true;
  }
  function showHome(d) {
    lastHome = d;
    const count = d.done % PARTS;
    const mon = PRS.monumentOf(d.done);
    const box = document.getElementById("homeScene");
    if (homeView) { homeView.dispose(); homeView = null; }
    box.innerHTML = `<div class="prs-frame prs-home"><div class="prs-view"></div><div class="prs-title"></div></div><p class="scene-caption"></p>`;
    box.querySelector(".prs-title").textContent = mon.name;
    const no = `بنای ${faDigits(PRS.monumentNo(d.done) + 1)} از ${faDigits(PRS.MONUMENTS.length)}${roundTag(d.done)}`;
    box.querySelector(".scene-caption").textContent = count
      ? `${no} · بخش ${faDigits(count)} از ${faDigits(PARTS)} ساخته شده`
      : `${no} · نقشه‌ی تازه`;
    if (fitHome(box)) homeView = PRS.show(box.querySelector(".prs-view"), { level: d.done, count: Math.max(count, 0), fresh: -1 });
  }
  function onResize() {
    clearTimeout(resizeT);
    resizeT = setTimeout(() => {
      const box = document.getElementById("homeScene");
      if (lastHome && box && box.offsetParent !== null && box.querySelector(".prs-frame, .scene-caption")) showHome(lastHome);
    }, 250);
  }

  // ---------- سکه‌ای که با کلمه‌ی درست روی خانه‌ها حک می‌شود: برق طلا ----------
  function glint(cells) {
    if (!cells || (typeof calm === "function" && calm())) return;
    cells.forEach((cell, i) => {
      cell.classList.remove("prs-glint");
      void getComputedStyle(cell).animationName;
      cell.style.setProperty("--g", i * 70 + 380 + "ms");
      cell.classList.add("prs-glint");
    });
  }
  function turn(deg, ms) {
    const s = document.querySelector(".prs-panel");
    if (s) s.animate([{ transform: "rotate(0)" }, { transform: `rotate(${deg}deg)` }], { duration: ms, easing: "cubic-bezier(.4,0,.2,1)" });
  }

  defineTheme("persepolis", {
    name: (level) => monName(level),
    mapName: (level) => `بنای ${faDigits(PRS.monumentNo(level) + 1)}${roundTag(level)}\n${monName(level)}`,
    subName: true,

    setup() {
      document.body.insertAdjacentHTML("beforeend", `<div class="prs-border" aria-hidden="true"></div>`);
      addPanel();
      PRS.ready().catch(() => {});
      addEventListener("resize", onResize);
      return () => {
        removeEventListener("resize", onResize);
        lastHome = null;
        document.querySelectorAll(".prs-tight").forEach((el) => el.classList.remove("prs-tight"));
        document.querySelectorAll(".prs-border, .prs-panel").forEach((el) => el.remove());
        if (homeView) { homeView.dispose(); homeView = null; }
      };
    },

    on: {
      home: showHome,
      found(d) { glint(d.cells); },
      hint(d) { glint(d.cells); },
      wrong() {
        const wheel = document.getElementById("wheel");
        wheel.classList.remove("prs-shake");
        void getComputedStyle(wheel).animationName;
        wheel.classList.add("prs-shake");
      },
      shuffle() { turn(30, 600); },
      complete(d) {
        // مرحله‌ی روزانه بنایی نمی‌سازد: همان بنای در حال ساخت بی‌تکه‌ی تازه دیده می‌شود
        const lv = d.daily ? save.unlocked : d.level;
        const step = d.daily ? (lv % PARTS) - 1 : lv % PARTS;
        const mon = PRS.monumentOf(lv);
        const fresh = d.first && !d.daily; // دوباره بازی کردن مرحله‌ی قبلی هم چیزی نمی‌سازد
        const done = fresh && step === PARTS - 1;
        document.querySelector("#overlay .card").insertAdjacentHTML("afterbegin",
          `<div class="extra prs-done"><div class="prs-frame"><div class="prs-view"></div><div class="prs-title"></div></div>${done ? '<p class="prs-line"></p>' : ""}</div>`);
        const box = document.querySelector("#overlay .prs-done");
        box.querySelector(".prs-title").textContent = mon.name;
        if (done) box.querySelector(".prs-line").textContent = mon.line;
        PRS.show(box.querySelector(".prs-view"), { level: lv, count: step + 1, fresh: fresh ? step : -1 });
        if (fresh) document.getElementById("overlayTitle").textContent =
          done ? `«${mon.name}» کامل شد!` : `«${PRS.partName(mon, step)}» برپا شد`;
      },
    },
  });
})();
