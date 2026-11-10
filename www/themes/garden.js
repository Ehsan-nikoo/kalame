// ظاهر «حوض و باغ»: هر ۶ مرحله یک باغ ایرانی است؛ با هر مرحله یک چیز تازه به باغ اضافه می‌شود
(function () {
  "use strict";

  const PARTS = 6; // تعداد مرحله‌های هر باغ
  const GARDENS = ["باغ ارم", "باغ فین", "باغ شازده", "باغ دولت‌آباد", "باغ عفیف‌آباد", "باغ چهلستون"];
  const gardenOf = (level) => GARDENS[Math.floor(level / PARTS) % GARDENS.length];

  // چیزهایی که به ترتیب به باغ اضافه می‌شوند
  const ITEMS = [
    { name: "سروها", svg: `
        <g><rect x="27" y="78" width="3" height="12" fill="#6b4a2f"/><ellipse cx="28.5" cy="58" rx="7" ry="24" fill="#3f7a4e"/></g>
        <g><rect x="170" y="78" width="3" height="12" fill="#6b4a2f"/><ellipse cx="171.5" cy="58" rx="7" ry="24" fill="#3f7a4e"/></g>` },
    { name: "درخت انار", svg: `
        <g><rect x="56" y="70" width="4" height="22" fill="#6b4a2f"/><circle cx="58" cy="62" r="15" fill="#5e9e5a"/>
        <circle cx="52" cy="58" r="2.6" fill="#c0392b"/><circle cx="63" cy="64" r="2.6" fill="#c0392b"/><circle cx="57" cy="69" r="2.4" fill="#c0392b"/></g>` },
    { name: "گل سرخ", svg: `
        <g><ellipse cx="142" cy="90" rx="17" ry="9" fill="#4f8a5d"/>
        <circle cx="134" cy="86" r="3" fill="#d6455d"/><circle cx="143" cy="83" r="3.2" fill="#e05570"/><circle cx="151" cy="87" r="3" fill="#d6455d"/></g>` },
    { name: "فواره", svg: `
        <g><path d="M100 84 C96 70 90 66 86 72 M100 84 C104 70 110 66 114 72 M100 84 V64" fill="none" stroke="#e6f7fb" stroke-width="2" stroke-linecap="round"/>
        <ellipse cx="100" cy="86" rx="9" ry="3" fill="#2fa4a9"/></g>` },
    { name: "بلبل", svg: `
        <g><path d="M70 50 q6 -5 12 0 q-3 1 -4 5 q-5 1 -8 -5Z" fill="#7a5a3c"/><circle cx="80.5" cy="49" r="2.3" fill="#7a5a3c"/><path d="M82.5 49 l3 0.6 l-3 0.8Z" fill="#e0a030"/></g>` },
    { name: "کوشک", svg: `
        <g><rect x="80" y="20" width="40" height="22" fill="#f4efe1" stroke="#2fa4a9" stroke-width="1.2"/>
        <path d="M94 42 v-10 q6 -8 12 0 v10Z" fill="#2fa4a9"/><path d="M90 20 q10 -14 20 0Z" fill="#2fa4a9"/>
        <rect x="76" y="18" width="48" height="3" fill="#d9a441"/></g>` },
  ];

  function addPool() {
    const koi = (cls, body, spot, sec) => `<div class="koi ${cls}" style="animation-duration:${sec}s">
        <svg viewBox="0 0 40 18" aria-hidden="true">
          <path d="M7 9 L0 3 L2 9 L0 15Z" fill="${body}" opacity=".9"/>
          <ellipse cx="22" cy="9" rx="16" ry="6.5" fill="${body}"/>
          <ellipse cx="26" cy="7.5" rx="5" ry="3" fill="${spot}"/>
          <circle cx="34" cy="7.5" r="1.1" fill="#222"/>
        </svg></div>`;
    const div = document.createElement("div");
    div.className = "pool";
    div.innerHTML = `<div class="caustics"></div>${koi("k1", "#f26b3a", "#fff", 22)}${koi("k2", "#fff4e8", "#f26b3a", 30)}${koi("k3", "#f59a2f", "#f26b3a", 17)}`;
    document.getElementById("wheel").prepend(div);
  }

  function addBackground() {
    // جوی آب در وسط باغ با سروهایی که در دوردست کوچک‌تر می‌شوند
    const cypress = [];
    for (let i = 0; i < 6; i++) {
      const y = 260 + i * 62, s = 0.5 + i * 0.22, dx = 70 + i * 26;
      for (const x of [200 - dx, 200 + dx]) {
        cypress.push(`<ellipse cx="${x}" cy="${y}" rx="${7 * s}" ry="${26 * s}" fill="#7aa97a" opacity=".55"/>`);
      }
    }
    const flowers = Array.from({ length: 26 }, () =>
      `<circle cx="${Math.round(Math.random() * 400)}" cy="${Math.round(300 + Math.random() * 480)}" r="2.2" fill="#f3a5b8" opacity=".6"/>`).join("");
    const div = document.createElement("div");
    div.className = "garden-bg";
    div.innerHTML = `<svg viewBox="0 0 400 800" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
        <defs><linearGradient id="g-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4f9f2"/><stop offset=".3" stop-color="#e3efdf"/></linearGradient></defs>
        <rect width="400" height="800" fill="url(#g-sky)"/>
        <g opacity=".35"><rect x="160" y="150" width="80" height="50" fill="#f4efe1" stroke="#2fa4a9"/><path d="M180 150 q20 -30 40 0Z" fill="#2fa4a9"/><path d="M190 200 v-22 q10 -12 20 0 v22Z" fill="#2fa4a9"/></g>
        <path d="M0 220 H400 V800 H0Z" fill="#d4e8cc"/>
        <path d="M188 220 H212 L290 800 H110Z" fill="#bfe3ea"/>
        <path d="M188 220 L110 800 M212 220 L290 800" stroke="#2fa4a9" stroke-width="3" opacity=".6"/>
        ${cypress.join("")}${flowers}
      </svg>`;
    document.body.prepend(div);

    for (let i = 0; i < 7; i++) {
      const p = document.createElement("div");
      p.className = "petal";
      p.style.left = Math.round(Math.random() * 100) + "vw";
      p.style.animationDuration = 9 + Math.random() * 8 + "s";
      p.style.animationDelay = -Math.random() * 15 + "s";
      document.body.appendChild(p);
    }
  }

  function ripple(xPct, yPct) {
    const pool = document.querySelector(".pool");
    if (!pool) return;
    const r = document.createElement("div");
    r.className = "ripple";
    r.style.left = xPct + "%";
    r.style.top = yPct + "%";
    pool.appendChild(r);
    setTimeout(() => r.remove(), 1000);
  }

  // هنگام کشیدن انگشت، هر چند لحظه یک موج روی آب
  let lastRipple = 0;
  function trail(e) {
    if (!document.querySelector(".letter.active") || performance.now() - lastRipple < 180) return;
    lastRipple = performance.now();
    const rect = document.getElementById("wheel").getBoundingClientRect();
    ripple(((e.clientX - rect.left) / rect.width) * 100, ((e.clientY - rect.top) / rect.height) * 100);
  }

  // باغ با count چیز اول؛ چیز شماره‌ی fresh با انیمیشن رشد ظاهر می‌شود
  function gardenSVG(count, fresh, cls, extra = "") {
    const parts = ITEMS.slice(0, count)
      .map((it, i) => (i === fresh ? it.svg.replace("<g>", '<g class="new">') : it.svg)).join("");
    return `<svg class="${cls}" viewBox="0 0 200 100" aria-hidden="true">
        <rect width="200" height="100" rx="10" fill="#eef6ea"/>
        <path d="M0 46 H200 V90 Q200 100 190 100 H10 Q0 100 0 90Z" fill="#cfe5c5"/>
        <path d="M94 46 H106 L124 100 H76Z" fill="#a9dbe5" stroke="#2fa4a9" stroke-width="1"/>
        ${parts}${extra}
      </svg>`;
  }

  function gardenScene(level) {
    const step = level % PARTS;
    return gardenSVG(step + 1, step, "extra garden-scene");
  }

  // منو: باغی که تا الان ساخته شده، با پروانه‌ای که دورش می‌چرخد
  const BUTTERFLY = `<g class="butterfly-path"><g class="butterfly">
      <ellipse cx="-3" cy="0" rx="3.6" ry="2.6" fill="#f39ab0"/><ellipse cx="3" cy="0" rx="3.6" ry="2.6" fill="#f39ab0"/>
      <ellipse cx="-2.4" cy="2.4" rx="2.2" ry="1.6" fill="#ffd76e"/><ellipse cx="2.4" cy="2.4" rx="2.2" ry="1.6" fill="#ffd76e"/>
      <rect x="-.5" y="-2" width="1" height="5" rx=".5" fill="#5a2034"/></g></g>`;

  defineTheme("garden", {
    name: (level) => gardenOf(level),

    setup() {
      addBackground();
      addPool();
      window.addEventListener("pointermove", trail);
      return () => {
        window.removeEventListener("pointermove", trail);
        document.querySelectorAll(".garden-bg, .petal, .pool").forEach((el) => el.remove());
      };
    },

    on: {
      home(d) {
        const count = d.done % PARTS;
        const box = document.getElementById("homeScene");
        box.innerHTML = gardenSVG(count, -1, "home-garden", BUTTERFLY) + `<p class="scene-caption"></p>`;
        box.querySelector(".scene-caption").textContent = count
          ? `${gardenOf(d.done)} · ${faDigits(count)} از ${faDigits(PARTS)} ساخته شده`
          : `باغ تازه: ${gardenOf(d.done)}`;
      },
      found() {
        ripple(50, 50);
      },
      wrong() {
        const wheel = document.getElementById("wheel");
        wheel.classList.remove("shiver");
        void wheel.offsetWidth;
        wheel.classList.add("shiver");
        // ماهی‌ها تند می‌شوند و بعد آرام می‌گیرند
        document.querySelectorAll(".koi").forEach((k) => k.classList.add("dart"));
        setTimeout(() => document.querySelectorAll(".koi").forEach((k) => k.classList.remove("dart")), 900);
      },
      shuffle() {
        ripple(50, 50);
        setTimeout(() => ripple(50, 50), 200);
      },
      complete(d) {
        if (d.daily) return; // چالش روزانه جزو پیشرفت این ظاهر نیست
        const step = d.level % PARTS;
        document.querySelector("#overlay .card").insertAdjacentHTML("afterbegin", gardenScene(d.level));
        document.getElementById("overlayTitle").textContent =
          step === PARTS - 1 ? `${gardenOf(d.level)} کامل شد!` : `«${ITEMS[step].name}» به باغ اومد`;
      },
    },
  });
})();
