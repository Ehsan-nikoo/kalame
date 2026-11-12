// ظاهر «صور فلکی»: آسمان پرستاره، شهاب، و نقاشی صورت‌های فلکی کتاب صوفی در پایان هر مرحله
(function () {
  "use strict";

  const CONSTELLATIONS = [
    { file: "dobe-akbar", name: "دب اکبر" },
    { file: "gheyfavus", name: "قیفاووس" },
    { file: "dobe-asghar", name: "دب اصغر" },
    { file: "andromeda", name: "زن زنجیری" },
    { file: "tanin", name: "اژدها" },
    // بقیه به ترتیب کتاب صوفی
    { file: "avva", name: "عوّا" },
    { file: "zanu-zade", name: "زانوزده" },
    { file: "makian", name: "ماکیان" },
    { file: "zat-ol-korsi", name: "ذات‌الکرسی" },
    { file: "barsavosh", name: "برساوش" },
    { file: "arabe-ran", name: "ارابه‌ران" },
    { file: "marafsa", name: "مارافسا" },
    { file: "oghab", name: "عقاب" },
    { file: "dolfin", name: "دلفین" },
    { file: "faras-azam", name: "فرس اعظم" },
    { file: "mosallas", name: "مثلث" },
    { file: "hamal", name: "حمل" },
    { file: "sour", name: "ثور" },
    { file: "jowza", name: "جوزا" },
    { file: "asad", name: "اسد" },
    { file: "sonbole", name: "سنبله" },
    { file: "mizan", name: "میزان" },
    { file: "aghrab", name: "عقرب" },
    { file: "ghows", name: "قوس" },
    { file: "jadi", name: "جدی" },
    { file: "dalv", name: "دلو" },
    { file: "hut", name: "حوت" },
    { file: "gheytas", name: "قیطس" },
    { file: "jabbar", name: "جبّار" },
    { file: "nahr", name: "نهر" },
    { file: "jam", name: "جام" },
    { file: "ghorab", name: "غراب" },
    { file: "ghantures", name: "قنطورس" },
  ];
  const constellationOf = (level) => CONSTELLATIONS[level % CONSTELLATIONS.length];

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let canvas, ctx, frameId, backdrop = null;
  let stars = [], sparks = [], meteorSky = null, nextMeteor = 3000, lastTime = 0;
  let lastLetters = [];

  // ---------- آسمان ----------

  // آسمان ثابت پشت ستاره‌های چشمک‌زن، یک بار کشیده می‌شود: کهکشان راه شیری با ابرهای رنگی کم‌رنگ،
  // هزاران ستاره‌ی خیلی ریز در امتداد آن، رگه‌های تیره‌ی غبار، و روشنایی گرم افق
  function paintBackdrop(w, h) {
    const c = document.createElement("canvas");
    c.width = w * dpr;
    c.height = h * dpr;
    const g = c.getContext("2d");
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    // محور کهکشان: از پایین چپ به بالا راست
    const ax = w * 0.05, ay = h * 0.95, bx = w * 1.05, by = h * 0.05;
    const len = Math.hypot(bx - ax, by - ay), ux = (bx - ax) / len, uy = (by - ay) / len;
    const band = Math.max(w, h) * 0.16;
    const at = (t, off) => [ax + ux * t * len - uy * off, ay + uy * t * len + ux * off];
    const gauss = () => (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;
    g.globalCompositeOperation = "lighter";
    // ابرهای نور
    const tints = ["120, 110, 200", "90, 120, 210", "200, 150, 210", "230, 190, 150", "140, 160, 230"];
    for (let i = 0; i < 70; i++) {
      const [x, y] = at(Math.random(), gauss() * band * 0.8);
      const r = band * (0.3 + Math.random() * 0.7);
      const grd = g.createRadialGradient(x, y, 0, x, y, r);
      grd.addColorStop(0, `rgba(${tints[i % tints.length]}, ${0.035 + Math.random() * 0.035})`);
      grd.addColorStop(1, "rgba(0, 0, 0, 0)");
      g.fillStyle = grd;
      g.fillRect(x - r, y - r, r * 2, r * 2);
    }
    // ستاره‌های ریز کهکشان
    const dust = Math.round((w * h) / 90);
    for (let i = 0; i < dust; i++) {
      const [x, y] = at(Math.random(), gauss() * band);
      g.fillStyle = `rgba(255, 246, 228, ${0.08 + Math.random() * 0.35})`;
      g.fillRect(x, y, Math.random() < 0.9 ? 0.6 : 1.1, Math.random() < 0.9 ? 0.6 : 1.1);
    }
    // رگه‌های تیره‌ی غبار در وسط کهکشان
    g.globalCompositeOperation = "source-over";
    for (let i = 0; i < 40; i++) {
      const [x, y] = at(Math.random(), gauss() * band * 0.25);
      const r = band * (0.12 + Math.random() * 0.25);
      const grd = g.createRadialGradient(x, y, 0, x, y, r);
      grd.addColorStop(0, "rgba(6, 8, 28, 0.28)");
      grd.addColorStop(1, "rgba(6, 8, 28, 0)");
      g.fillStyle = grd;
      g.fillRect(x - r, y - r, r * 2, r * 2);
    }
    // روشنایی گرم و کم‌رنگ افق
    const hz = g.createLinearGradient(0, h * 0.6, 0, h);
    hz.addColorStop(0, "rgba(255, 170, 110, 0)");
    hz.addColorStop(1, "rgba(255, 150, 100, 0.16)");
    g.fillStyle = hz;
    g.fillRect(0, h * 0.6, w, h * 0.4);
    return c;
  }

  function resize() {
    canvas.width = innerWidth * dpr;
    canvas.height = innerHeight * dpr;
    backdrop = paintBackdrop(innerWidth, innerHeight);
    const count = Math.round((innerWidth * innerHeight) / 2600);
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * innerWidth,
      y: Math.random() * innerHeight * 0.85,
      r: Math.random() * 1.3 + 0.3,
      // چند ستاره‌ی درخشان با هاله و پرتوهای ریز
      bright: Math.random() < 0.035,
      hue: ["255, 244, 220", "210, 225, 255", "255, 220, 190"][Math.floor(Math.random() * 3)],
      speed: Math.random() * 2 + 0.6,
      phase: Math.random() * Math.PI * 2,
    }));
  }

  function frame(time) {
    const dt = Math.min(time - lastTime, 50);
    lastTime = time;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    if (backdrop) ctx.drawImage(backdrop, 0, 0, innerWidth, innerHeight);

    for (const s of stars) {
      const a = 0.45 + 0.55 * Math.sin((time / 1000) * s.speed + s.phase) ** 2;
      if (s.bright) {
        const r = s.r * 5;
        const grd = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, r);
        grd.addColorStop(0, `rgba(${s.hue}, ${0.5 * a})`);
        grd.addColorStop(1, `rgba(${s.hue}, 0)`);
        ctx.fillStyle = grd;
        ctx.fillRect(s.x - r, s.y - r, r * 2, r * 2);
        ctx.strokeStyle = `rgba(${s.hue}, ${0.45 * a})`;
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.moveTo(s.x - r * 1.4, s.y); ctx.lineTo(s.x + r * 1.4, s.y);
        ctx.moveTo(s.x, s.y - r * 1.4); ctx.lineTo(s.x, s.y + r * 1.4);
        ctx.stroke();
      }
      ctx.fillStyle = `rgba(${s.hue}, ${a})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // شهاب تصادفی در آسمان
    nextMeteor -= dt;
    if (nextMeteor <= 0 && !meteorSky) {
      meteorSky = { x: Math.random() * innerWidth * 0.6 + innerWidth * 0.4, y: Math.random() * innerHeight * 0.3, life: 0 };
      nextMeteor = 4000 + Math.random() * 5000;
    }
    if (meteorSky) {
      meteorSky.life += dt;
      const t = meteorSky.life / 900;
      const x = meteorSky.x - t * 260, y = meteorSky.y + t * 120;
      const grad = ctx.createLinearGradient(x, y, x + 70, y - 32);
      grad.addColorStop(0, `rgba(255, 248, 230, ${Math.max(0, 1 - t)})`);
      grad.addColorStop(1, "rgba(255, 248, 230, 0)");
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + 70, y - 32);
      ctx.stroke();
      if (t >= 1) meteorSky = null;
    }

    // ذره‌های نور
    sparks = sparks.filter((p) => (p.life -= dt) > 0);
    for (const p of sparks) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      const a = p.life / p.max;
      ctx.fillStyle = `rgba(255, 225, 150, ${a})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * a + 0.4, 0, Math.PI * 2);
      ctx.fill();
    }

    frameId = requestAnimationFrame(frame);
  }

  function burst(x, y, count, spread) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * spread;
      const max = 400 + Math.random() * 500;
      sparks.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, r: Math.random() * 2 + 0.8, life: max, max });
    }
  }

  function trail(e) {
    if (document.querySelector(".letter.active")) burst(e.clientX, e.clientY, 2, 0.04);
  }

  function centerOf(el) {
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }

  // یک شهاب از نقطه‌ی from به خانه‌ی جدول
  function meteor(from, cell, delay) {
    const to = centerOf(cell);
    const angle = Math.atan2(to.y - from.y, to.x - from.x);
    const el = document.createElement("div");
    el.className = "meteor";
    el.style.left = from.x - 46 + "px";
    el.style.top = from.y + "px";
    document.body.appendChild(el);
    const rot = `rotate(${angle}rad)`;
    el.animate(
      [
        { transform: `translate(0, 0) ${rot}` },
        { transform: `translate(${to.x - from.x}px, ${to.y - from.y}px) ${rot}` },
      ],
      { duration: 420, delay, easing: "cubic-bezier(.5,0,.9,.6)", fill: "backwards" }
    ).finished.then(() => {
      el.remove();
      burst(to.x, to.y, 14, 0.12);
    });
  }

  // اسطرلاب برنجی پشت حروف: حلقه‌ی درجه‌دار، صفحه‌ی حکاکی‌شده و عنکبوت مشبک
  function addAstrolabe() {
    const ticks = [];
    for (let i = 0; i < 72; i++) {
      const a = (i * Math.PI) / 36, long = i % 6 === 0;
      const r1 = 47.5, r2 = long ? 43.6 : 45.4;
      ticks.push(`<line x1="${(Math.cos(a) * r1).toFixed(2)}" y1="${(Math.sin(a) * r1).toFixed(2)}" x2="${(Math.cos(a) * r2).toFixed(2)}" y2="${(Math.sin(a) * r2).toFixed(2)}" stroke-width="${long ? 0.7 : 0.4}"/>`);
    }
    const pointers = [0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => {
      const a = (i * Math.PI * 2) / 9 + 0.3, r = 24 + (i % 3) * 5;
      const x = (Math.cos(a) * r).toFixed(2), y = (Math.sin(a) * r).toFixed(2);
      return `<path d="M${(Math.cos(a) * (r - 7)).toFixed(2)} ${(Math.sin(a) * (r - 7)).toFixed(2)}Q${(Math.cos(a + 0.12) * (r - 3)).toFixed(2)} ${(Math.sin(a + 0.12) * (r - 3)).toFixed(2)} ${x} ${y}"/><circle cx="${x}" cy="${y}" r=".9" fill="#ffe3a0" stroke="none"/>`;
    }).join("");
    const div = document.createElement("div");
    div.className = "astrolabe";
    div.innerHTML = `<svg viewBox="-50 -50 100 100" aria-hidden="true">
        <defs>
          <linearGradient id="brass-ring" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffe7a8"/><stop offset=".35" stop-color="#c9953e"/><stop offset=".6" stop-color="#8a5c1c"/><stop offset="1" stop-color="#e8bf6a"/></linearGradient>
          <radialGradient id="plate" r=".5"><stop offset="0" stop-color="#1a1d4a" stop-opacity=".55"/><stop offset=".85" stop-color="#0b0d2a" stop-opacity=".75"/><stop offset="1" stop-color="#05061a" stop-opacity=".9"/></radialGradient>
        </defs>
        <circle r="49.6" fill="url(#brass-ring)"/>
        <circle r="47.8" fill="#0a0c28"/>
        <circle r="47.8" fill="url(#plate)"/>
        <g stroke="#e8bf6a" opacity=".85">${ticks.join("")}</g>
        <circle r="42.6" fill="none" stroke="#c9953e" stroke-width=".5" opacity=".7"/>
        <g fill="none" stroke="#c9953e" stroke-width=".35" opacity=".35">
          <circle r="34"/><circle r="22"/><circle cy="-6" r="30"/><circle cy="-12" r="24"/><circle cy="-18" r="17"/>
          <line x1="-42" y1="0" x2="42" y2="0"/><line x1="0" y1="-42" x2="0" y2="42"/>
        </g>
        <g fill="none" stroke="#e8bf6a" stroke-width=".6" opacity=".6">
          <circle cx="0" cy="7" r="27"/>${pointers}
        </g>
        <circle r="2.2" fill="url(#brass-ring)"/>
        <circle r="49.6" fill="none" stroke="#fff2c4" stroke-width=".5" opacity=".6"/>
      </svg>`;
    document.getElementById("wheel").prepend(div);
  }

  defineTheme("stars", {
    name: (level) => constellationOf(level).name,

    setup() {
      canvas = document.createElement("canvas");
      canvas.className = "sky";
      ctx = canvas.getContext("2d");
      document.body.prepend(canvas);
      document.body.insertAdjacentHTML(
        "afterbegin",
        `<svg class="dunes" viewBox="0 0 400 100" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
           <defs>
             <linearGradient id="dune-far" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a2552"/><stop offset="1" stop-color="#14163a"/></linearGradient>
             <linearGradient id="dune-near" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#15173c"/><stop offset="1" stop-color="#05061a"/></linearGradient>
           </defs>
           <path d="M0 55 Q70 25 150 50 T300 40 T400 48 V100 H0Z" fill="url(#dune-far)"/>
           <path d="M0 55 Q70 25 150 50 T300 40 T400 48" fill="none" stroke="#8f86c9" stroke-width=".5" opacity=".45"/>
           <g fill="#0d0f2c">
             <path d="M262 52h34v-9h-34Z"/><path d="M269 43c0-9 7-14 10-15 3 1 10 6 10 15Z"/><rect x="278.4" y="24" width="1.2" height="5"/>
             <rect x="257" y="35" width="4" height="17"/><path d="M256 35h6l-3-5Z"/>
             <path d="M318 49c1-8 0-14-1-19" stroke="#0d0f2c" stroke-width="1.6" fill="none"/>
             <path d="M317 30c-6 0-10 3-12 6 4-3 8-4 12-4Zm0 0c6 0 10 3 12 6-4-3-8-4-12-4Zm0 0c-4-3-9-3-12-1 4-1 8 0 12 1Zm0 0c4-3 9-3 12-1-4-1-8 0-12 1Z"/>
           </g>
           <path d="M0 75 Q90 50 190 72 T400 66 V100 H0Z" fill="url(#dune-near)"/>
           <path d="M0 75 Q90 50 190 72 T400 66" fill="none" stroke="#a79bd8" stroke-width=".6" opacity=".35"/>
         </svg>`
      );
      addAstrolabe();
      resize();
      window.addEventListener("resize", resize);
      window.addEventListener("pointermove", trail);
      frameId = requestAnimationFrame(frame);

      return () => {
        cancelAnimationFrame(frameId);
        window.removeEventListener("resize", resize);
        window.removeEventListener("pointermove", trail);
        document.querySelectorAll(".sky, .dunes, .meteor, .astrolabe").forEach((el) => el.remove());
        sparks = [];
      };
    },

    on: {
      // منو: صورت فلکی مرحله‌ی بعد آرام روی آسمان کشیده می‌شود
      home(d) {
        const c = constellationOf(d.level);
        const box = document.getElementById("homeScene");
        box.innerHTML = `<img class="home-constellation" alt=""><p class="scene-caption"></p>`;
        box.querySelector("img").src = "themes/stars/" + c.file + ".png";
        box.querySelector(".scene-caption").textContent =
          d.done >= d.total ? "همه‌ی آسمان کامل شد ✦" : `صورت فلکی بعدی: «${c.name}»`;
      },
      submit(d) {
        lastLetters = d.letters;
      },
      found(d) {
        // شهاب‌ها از حرف‌های دایره به خانه‌ها می‌روند؛ اگر حرف‌ها معلوم نباشند، از وسط دایره
        const wheel = document.getElementById("wheel");
        d.cells.forEach((cell, i) => meteor(centerOf(lastLetters[i] || lastLetters[0] || wheel), cell, i * 110));
        lastLetters = [];
      },
      hint(d) {
        // شهاب از بالای آسمان
        d.cells.forEach((cell, i) => meteor({ x: innerWidth * (0.2 + Math.random() * 0.6), y: -20 }, cell, i * 110));
      },
      wrong() {
        const wheel = document.getElementById("wheel");
        wheel.classList.remove("dim");
        void wheel.offsetWidth;
        wheel.classList.add("dim");
      },
      shuffle() {
        const c = centerOf(document.getElementById("wheel"));
        burst(c.x, c.y, 30, 0.18);
        document.querySelector(".astrolabe").animate(
          [{ transform: "rotate(0)" }, { transform: "rotate(-90deg)" }, { transform: "rotate(0)" }],
          { duration: 900, easing: "ease-in-out" }
        );
      },
      complete(d) {
        const c = constellationOf(d.level);
        const img = document.createElement("img");
        img.className = "extra constellation";
        img.src = "themes/stars/" + c.file + ".png";
        img.alt = c.name;
        document.querySelector("#overlay .card").prepend(img);
        document.getElementById("overlayTitle").textContent = d.finished ? "آسمان کامل شد!" : "«" + c.name + "»";
      },
    },
  });
})();
