// ظاهر «حوض و باغ»: هر ۶ مرحله یک باغ ایرانی است؛ با هر مرحله یک چیز تازه به باغ اضافه می‌شود
(function () {
  "use strict";

  const PARTS = 6; // تعداد مرحله‌های هر باغ
  const GARDENS = ["باغ ارم", "باغ فین", "باغ شازده", "باغ دولت‌آباد", "باغ عفیف‌آباد", "باغ چهلستون"];
  const gardenOf = (level) => GARDENS[Math.floor(level / PARTS) % GARDENS.length];

  // چیزهایی که به ترتیب به باغ اضافه می‌شوند
  const ITEMS = [
    { name: "سروها", svg: `
        <g><rect x="27" y="78" width="3" height="12" fill="#6b4a2f"/><ellipse cx="28.5" cy="58" rx="7" ry="24" fill="#3f7a4e"/><ellipse cx="26.5" cy="56" rx="3.5" ry="20" fill="#5e9a68" opacity=".6"/><ellipse cx="33" cy="91" rx="10" ry="2" fill="#2f5a36" opacity=".3"/></g>
        <g><rect x="170" y="78" width="3" height="12" fill="#6b4a2f"/><ellipse cx="171.5" cy="58" rx="7" ry="24" fill="#3f7a4e"/><ellipse cx="169.5" cy="56" rx="3.5" ry="20" fill="#5e9a68" opacity=".6"/><ellipse cx="176" cy="91" rx="10" ry="2" fill="#2f5a36" opacity=".3"/></g>` },
    { name: "درخت انار", svg: `
        <g><rect x="56" y="70" width="4" height="22" fill="#6b4a2f"/><ellipse cx="62" cy="92" rx="12" ry="2.2" fill="#2f5a36" opacity=".3"/><circle cx="58" cy="62" r="15" fill="#4f8a4c"/><circle cx="55" cy="58" r="10" fill="#6fb06a" opacity=".7"/>
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
          <ellipse cx="23" cy="11" rx="16" ry="6" fill="#0b3a4a" opacity=".25"/>
          <path d="M8 9C4 4 1 2 0 2C2 6 2 12 0 16C1 16 4 14 8 9Z" fill="${body}" opacity=".75"/>
          <path d="M20 4C18 1 15 0 13 1C15 3 16 4 17 5Z M20 14C18 17 15 18 13 17C15 15 16 14 17 13Z" fill="${body}" opacity=".7"/>
          <ellipse cx="22" cy="9" rx="16" ry="6.3" fill="${body}"/>
          <ellipse cx="26" cy="7.5" rx="5" ry="3" fill="${spot}"/>
          <ellipse cx="17" cy="10.5" rx="3.5" ry="2" fill="${spot}" opacity=".8"/>
          <ellipse cx="24" cy="6.5" rx="11" ry="2.2" fill="#fff" opacity=".35"/>
          <circle cx="34" cy="7.5" r="1.1" fill="#222"/>
        </svg></div>`;
    const div = document.createElement("div");
    div.className = "pool";
    div.innerHTML = `<div class="pool-depth"></div><div class="caustics"></div>${koi("k1", "#f26b3a", "#fff", 22)}${koi("k2", "#fff4e8", "#f26b3a", 30)}${koi("k3", "#f59a2f", "#f26b3a", 17)}<div class="pool-sheen"></div>`;
    document.getElementById("wheel").prepend(div);
  }

  function addBackground() {
    // باغ ایرانی با پرسپکتیو: کوشک کاشی‌کاری‌شده در ته باغ، جوی آب با لبه‌ی سنگی وسط،
    // دو ردیف سرو که دورتر کوچک‌تر و کم‌رنگ‌تر می‌شوند، باغچه‌های گل و نور صبح
    const VX = 200, HY = 230; // نقطه‌ی گریز و خط افق
    const rnd = (a, b) => a + Math.random() * (b - a);
    const cypress = [];
    for (let i = 5; i >= 0; i--) {
      const t = i / 5; // ۰ دور، ۱ نزدیک
      const y = HY + 30 + t * t * 520, s = 0.45 + t * 1.5, dx = 40 + t * 200;
      for (const side of [-1, 1]) {
        const x = VX + side * dx, h = 54 * s, w = 9 * s;
        cypress.push(`<g opacity="${(0.55 + t * 0.45).toFixed(2)}">
          <ellipse cx="${x + side * 10 * s}" cy="${y}" rx="${w * 1.8}" ry="${3 * s}" fill="#2f5a36" opacity=".35"/>
          <rect x="${x - 1.2 * s}" y="${y - 6 * s}" width="${2.4 * s}" height="${6 * s}" fill="#5a4030"/>
          <path d="M${x} ${y - h - 4 * s}C${x + w} ${y - h * 0.7} ${x + w * 1.1} ${y - h * 0.2} ${x + w * 0.5} ${y - 4 * s}H${x - w * 0.5}C${x - w * 1.1} ${y - h * 0.2} ${x - w} ${y - h * 0.7} ${x} ${y - h - 4 * s}Z" fill="url(#cy-shade)"/>
          <path d="M${x} ${y - h - 4 * s}C${x - w} ${y - h * 0.7} ${x - w * 1.1} ${y - h * 0.2} ${x - w * 0.5} ${y - 4 * s}H${x}Z" fill="#fff" opacity=".1"/>
        </g>`);
      }
    }
    const flowers = [];
    const colors = ["#f3a5b8", "#e05570", "#ffd76e", "#fff6f0", "#c58ad6", "#f39a6b"];
    for (let i = 0; i < 140; i++) {
      const t = Math.sqrt(Math.random());
      const y = HY + 20 + t * 560;
      const half = 18 + t * 150; // نیم‌پهنای جوی و حاشیه در این عمق
      const side = Math.random() < 0.5 ? -1 : 1;
      const x = VX + side * (half + rnd(14, 60) * (0.4 + t));
      const r = 0.6 + t * 2.4;
      flowers.push(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(2)}" fill="${colors[i % colors.length]}" opacity="${(0.5 + t * 0.45).toFixed(2)}"/>`);
    }
    const div = document.createElement("div");
    div.className = "garden-bg";
    div.innerHTML = `<svg viewBox="0 0 400 800" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
        <defs>
          <linearGradient id="g-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cfe6ee"/><stop offset=".22" stop-color="#eef5ea"/><stop offset=".3" stop-color="#fbf3df"/></linearGradient>
          <radialGradient id="g-sun" cx=".72" cy=".1" r=".5"><stop offset="0" stop-color="#fff6d8" stop-opacity=".9"/><stop offset="1" stop-color="#fff6d8" stop-opacity="0"/></radialGradient>
          <linearGradient id="g-lawn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b9d4a6"/><stop offset=".35" stop-color="#9cc48a"/><stop offset="1" stop-color="#5f9a5c"/></linearGradient>
          <linearGradient id="g-water" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e3f1ee"/><stop offset=".25" stop-color="#9fd3dc"/><stop offset="1" stop-color="#3f97ad"/></linearGradient>
          <linearGradient id="g-stone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#efe6d4"/><stop offset="1" stop-color="#c9b896"/></linearGradient>
          <linearGradient id="cy-shade" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#4f8a5d"/><stop offset=".55" stop-color="#3a6e47"/><stop offset="1" stop-color="#244a30"/></linearGradient>
          <linearGradient id="g-haze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbf3df" stop-opacity=".85"/><stop offset="1" stop-color="#fbf3df" stop-opacity="0"/></linearGradient>
          <linearGradient id="g-shine" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".7"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
          <filter id="g-grass" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency=".9 .25" numOctaves="2" seed="3"/>
            <feColorMatrix values="0 0 0 0 .12  0 0 0 0 .25  0 0 0 0 .1  0 0 0 .7 -.25"/>
            <feComposite in2="SourceGraphic" operator="in"/>
          </filter>
        </defs>
        <rect width="400" height="800" fill="url(#g-sky)"/>
        <rect width="400" height="800" fill="url(#g-sun)"/>
        <g opacity=".9">
          <path d="M0 ${HY}C40 ${HY - 34} 90 ${HY - 40} 130 ${HY - 22}S230 ${HY - 30} 280 ${HY - 20}S370 ${HY - 38} 400 ${HY - 16}V${HY}Z" fill="#a9c79a" opacity=".6"/>
          <rect x="146" y="${HY - 62}" width="108" height="62" fill="#f4ecd9"/>
          <rect x="146" y="${HY - 62}" width="108" height="8" fill="#2c8f9a"/>
          <rect x="146" y="${HY - 55}" width="108" height="2" fill="#d9a441"/>
          <rect x="128" y="${HY - 46}" width="18" height="46" fill="#ece2cc"/><rect x="254" y="${HY - 46}" width="18" height="46" fill="#e2d6bc"/>
          <path d="M184 ${HY}V${HY - 30}Q200 ${HY - 52} 216 ${HY - 30}V${HY}Z" fill="#1f6f86"/>
          <path d="M188 ${HY}V${HY - 29}Q200 ${HY - 46} 212 ${HY - 29}V${HY}Z" fill="#2c8f9a" opacity=".6"/>
          ${[156, 230].map((x) => `<path d="M${x} ${HY}V${HY - 22}Q${x + 7} ${HY - 34} ${x + 14} ${HY - 22}V${HY}Z" fill="#2c6f86" opacity=".85"/>`).join("")}
          <path d="M176 ${HY - 62}Q200 ${HY - 98} 224 ${HY - 62}Z" fill="#2c8f9a"/>
          <path d="M200 ${HY - 98}V${HY - 108}" stroke="#d9a441" stroke-width="1.6"/>
          <path d="M182 ${HY - 66}Q194 ${HY - 90} 206 ${HY - 94}" stroke="#fff" stroke-width="2" fill="none" opacity=".35"/>
          <rect x="226" y="${HY - 62}" width="28" height="62" fill="#000" opacity=".06"/>
        </g>
        <rect x="0" y="${HY - 70}" width="400" height="80" fill="url(#g-haze)" opacity=".4"/>
        <rect x="0" y="${HY}" width="400" height="${800 - HY}" fill="url(#g-lawn)"/>
        <rect x="0" y="${HY}" width="400" height="${800 - HY}" fill="#000" filter="url(#g-grass)"/>
        <path d="M${VX - 22} ${HY}H${VX + 22}L${VX + 200} 800H${VX - 200}Z" fill="url(#g-stone)"/>
        <path d="M${VX - 14} ${HY}H${VX + 14}L${VX + 140} 800H${VX - 140}Z" fill="url(#g-water)"/>
        <path d="M${VX - 6} ${HY + 6}H${VX + 6}L${VX + 40} 800H${VX - 40}Z" fill="url(#g-shine)" opacity=".5"/>
        <path d="M${VX - 22} ${HY}L${VX - 200} 800M${VX + 22} ${HY}L${VX + 200} 800" stroke="#9c8a68" stroke-width="1.2" opacity=".6"/>
        <path d="M${VX - 14} ${HY}L${VX - 140} 800M${VX + 14} ${HY}L${VX + 140} 800" stroke="#2c8f9a" stroke-width="2" opacity=".55"/>
        ${[0.15, 0.32, 0.55, 0.8].map((t) => { const y = HY + t * t * 570 + 20, w = 14 + t * 126; return `<path d="M${VX - w * 0.6} ${y}q${w * 0.1} -2 ${w * 0.2} 0M${VX + w * 0.1} ${y + 8}q${w * 0.1} -2 ${w * 0.25} 0" stroke="#fff" stroke-width="${0.8 + t * 1.6}" fill="none" opacity=".55"/>`; }).join("")}
        ${flowers.join("")}${cypress.join("")}
        <rect width="400" height="800" fill="url(#g-sun)" opacity=".35"/>
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
    const k = cls.split(" ").pop(); // پیشوند یکتا برای idها
    return `<svg class="${cls}" viewBox="0 0 200 100" aria-hidden="true">
        <defs>
          <clipPath id="${k}-clip"><rect width="200" height="100" rx="10"/></clipPath>
          <linearGradient id="${k}-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d4eaf0"/><stop offset="1" stop-color="#fbf3df"/></linearGradient>
          <linearGradient id="${k}-lawn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b9d4a6"/><stop offset="1" stop-color="#6fa865"/></linearGradient>
          <linearGradient id="${k}-water" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d9efee"/><stop offset="1" stop-color="#4fa5ba"/></linearGradient>
          <filter id="${k}-grass" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency=".9 .3" numOctaves="2" seed="3"/>
            <feColorMatrix values="0 0 0 0 .12  0 0 0 0 .25  0 0 0 0 .1  0 0 0 .6 -.22"/>
            <feComposite in2="SourceGraphic" operator="in"/>
          </filter>
        </defs>
        <g clip-path="url(#${k}-clip)">
        <rect width="200" height="100" fill="url(#${k}-sky)"/>
        <ellipse cx="150" cy="10" rx="70" ry="40" fill="#fff6d8" opacity=".6"/>
        <path d="M0 46 H200 V100 H0Z" fill="url(#${k}-lawn)"/>
        <path d="M0 46 H200 V100 H0Z" fill="#000" filter="url(#${k}-grass)"/>
        <path d="M90 46 H110 L132 100 H68Z" fill="#e9dfc8"/>
        <path d="M94 46 H106 L124 100 H76Z" fill="url(#${k}-water)" stroke="#2c8f9a" stroke-width=".8"/>
        <path d="M98 50 H102 L106 100 H94Z" fill="#fff" opacity=".25"/>
        ${parts}${extra}
        <rect width="200" height="100" fill="#fff6d8" opacity=".08"/>
        </g>
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
        const step = d.level % PARTS;
        document.querySelector("#overlay .card").insertAdjacentHTML("afterbegin", gardenScene(d.level));
        document.getElementById("overlayTitle").textContent =
          step === PARTS - 1 ? `${gardenOf(d.level)} کامل شد!` : `«${ITEMS[step].name}» به باغ اومد`;
      },
    },
  });
})();
