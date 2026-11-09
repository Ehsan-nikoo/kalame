// ظاهر «صور فلکی»: آسمان پرستاره، شهاب، و نقاشی صورت‌های فلکی کتاب صوفی در پایان هر مرحله
(function () {
  "use strict";

  const CONSTELLATIONS = [
    { file: "dobe-akbar", name: "دب اکبر" },
    { file: "gheyfavus", name: "قیفاووس" },
    { file: "dobe-asghar", name: "دب اصغر" },
    { file: "andromeda", name: "زن زنجیری" },
    { file: "tanin", name: "اژدها" },
  ];
  const constellationOf = (level) => CONSTELLATIONS[level % CONSTELLATIONS.length];

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let canvas, ctx, frameId;
  let stars = [], sparks = [], meteorSky = null, nextMeteor = 3000, lastTime = 0;
  let lastLetters = [];

  // ---------- آسمان ----------

  function resize() {
    canvas.width = innerWidth * dpr;
    canvas.height = innerHeight * dpr;
    const count = Math.round((innerWidth * innerHeight) / 2600);
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * innerWidth,
      y: Math.random() * innerHeight * 0.85,
      r: Math.random() * 1.3 + 0.3,
      speed: Math.random() * 2 + 0.6,
      phase: Math.random() * Math.PI * 2,
    }));
  }

  function frame(time) {
    const dt = Math.min(time - lastTime, 50);
    lastTime = time;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, innerWidth, innerHeight);

    for (const s of stars) {
      const a = 0.45 + 0.55 * Math.sin((time / 1000) * s.speed + s.phase) ** 2;
      ctx.fillStyle = `rgba(255, 244, 220, ${a})`;
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

  defineTheme("stars", {
    name: (level) => constellationOf(level).name,

    setup() {
      canvas = document.createElement("canvas");
      canvas.className = "sky";
      ctx = canvas.getContext("2d");
      document.body.prepend(canvas);
      document.body.insertAdjacentHTML(
        "afterbegin",
        `<svg class="dunes" viewBox="0 0 400 100" preserveAspectRatio="none" aria-hidden="true">
           <path d="M0 55 Q70 25 150 50 T300 40 T400 48 V100 H0Z" fill="#141739"/>
           <path d="M0 75 Q90 50 190 72 T400 66 V100 H0Z" fill="#0b0d27"/>
         </svg>`
      );
      resize();
      window.addEventListener("resize", resize);
      window.addEventListener("pointermove", trail);
      frameId = requestAnimationFrame(frame);

      return () => {
        cancelAnimationFrame(frameId);
        window.removeEventListener("resize", resize);
        window.removeEventListener("pointermove", trail);
        document.querySelectorAll(".sky, .dunes, .meteor").forEach((el) => el.remove());
        sparks = [];
      };
    },

    on: {
      submit(d) {
        lastLetters = d.letters;
      },
      found(d) {
        d.cells.forEach((cell, i) => meteor(centerOf(lastLetters[i] || lastLetters[0]), cell, i * 110));
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
