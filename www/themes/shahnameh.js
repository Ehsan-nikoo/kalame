// «شاهنامه» — نگاره‌ی سه‌بعدی شاهنامه (three.js).
// هر داستان صحنه‌ای است مثل یک نگاره‌ی ایرانی که در فضا چیده شده: آسمان زرین، کوه‌های
// اسفنجی رنگی، درخت سرو و چنار، و پیکره‌های نقاشی‌شده. هر مرحله یک بخش از صحنه را
// از «طرح قلم» به رنگ درمی‌آورد؛ بخش ششم صحنه را جان می‌دهد.
(function () {
  const A = window.SHN_ART;
  const INK = A.INK, PAPER = A.PAPER, GOLD = A.GOLD;

  const PARTS = [
    { name: "زمین و آسمان زرین" },
    { name: "کوه و چشمه" },
    { name: "درخت و بنا" },
    { name: null }, // پهلوان داستان
    { name: null }, // هماورد یا همراه
    { name: "جان گرفتن نگاره" },
  ];

  // x و z جای پیکره روی زمین؛ y ارتفاع از زمین؛ s اندازه؛ f رو به چپ
  const STORIES = window.SHN_STORIES;

  const storyNo = (level) => Math.floor(level / PARTS.length) % STORIES.length;
  const storyOf = (level) => STORIES[storyNo(level)];
  const partName = (st, i) => PARTS[i].name || st[i === 3 ? "a" : "b"][0];

  // ---------- بارگذاری three.js فقط وقتی لازم است ----------
  let loading = null;
  function ready() {
    if (window.THREE) return Promise.resolve(window.THREE);
    if (!loading) loading = new Promise((res, rej) => {
      const s = document.createElement("script");
      s.src = "vendor/three.min.js";
      s.onload = () => res(window.THREE);
      s.onerror = () => { loading = null; rej(new Error("three")); };
      document.head.appendChild(s);
    });
    return loading;
  }
  function webgl() {
    try { const c = document.createElement("canvas"); return !!(window.WebGLRenderingContext && (c.getContext("webgl") || c.getContext("experimental-webgl"))); } catch (e) { return false; }
  }

  // ---------- رنگ‌ها ----------
  const SKY = {
    gold: { top: "#e3b24f", mid: "#f1d382", low: "#f7e6b6", cloud: "#f8f2e2", cloudLine: "#2a6fb3", sun: "#fff5d6" },
    blue: { top: "#2f6fb3", mid: "#6aa3d6", low: "#cfe3ef", cloud: "#f8f2e2", cloudLine: "#d9a441", sun: "#fff" },
    dawn: { top: "#d9806e", mid: "#efb48e", low: "#f8e3c2", cloud: "#fff4e4", cloudLine: "#b6413a", sun: "#fff3d0" },
    dusk: { top: "#6a3d78", mid: "#c26a6a", low: "#f0b07a", cloud: "#f7dcc8", cloudLine: "#6a3d78", sun: "#ffd890" },
    dark: { top: "#14141c", mid: "#24243a", low: "#4a4a66", cloud: "#8a8aa6", cloudLine: GOLD, sun: "#cfd6f0", stars: true },
    lapis: { top: "#0f2456", mid: "#1d3a7a", low: "#2f5596", cloud: "#cdd8f0", cloudLine: GOLD, sun: "#f6e3a6", stars: true },
  };
  const GROUND = { green: ["#9fbf7e", "#7da35c"], sage: ["#bccb9a", "#97ad74"], ochre: ["#e4c88a", "#c9a865"], lilac: ["#cdbfd6", "#a998b8"], desert: ["#ead2a0", "#d2b276"], snow: ["#f2f5f8", "#d9e2ea"] };
  const ROCK = { peak: ["#c9b2d6", "#e4b6a6", "#9cc5bf"], rocks: ["#e4b6a6", "#c9b2d6", "#9cc5bf"], range: ["#9cc5bf", "#c9b2d6", "#e4b6a6"], dunes: ["#e9c98a", "#ddb877", "#f0d9a6"], cave: ["#c9b2d6", "#9cc5bf", "#e4b6a6"], damavand: ["#c9b2d6", "#9cc5bf", "#e4b6a6"], snow: ["#e8eef4", "#d6e0ea", "#c9d6e3"] };

  // ---------- بوم‌های بافت ----------
  function cv(w, h, fn) { const c = document.createElement("canvas"); c.width = w; c.height = h; fn(c.getContext("2d"), w, h); return c; }
  function rnd(seed) { let s = seed * 9301 + 49297; return () => ((s = (s * 9301 + 49297) % 233280) / 233280); }

  // ابر چینی (پیچان) به سبک نگارگری
  function cloudCanvas(sky) {
    return cv(256, 96, (c) => {
      c.lineWidth = 3; c.strokeStyle = sky.cloudLine; c.fillStyle = sky.cloud; c.lineJoin = c.lineCap = "round";
      const p = new Path2D("M10 70C10 50 34 46 44 58C44 36 74 30 86 48C92 26 128 22 140 44C150 28 182 30 186 52C200 40 230 46 232 64C246 64 250 82 236 84C180 90 70 90 22 86C12 84 8 78 10 70Z");
      c.fill(p); c.stroke(p);
      c.lineWidth = 2;
      [[44, 58, 10], [86, 48, 12], [140, 44, 12], [186, 52, 11]].forEach(([x, y, r]) => { c.beginPath(); c.arc(x, y + r, r, Math.PI * 1.05, Math.PI * 1.95); c.stroke(); c.beginPath(); c.arc(x, y + r, r * 0.45, Math.PI, Math.PI * 2); c.stroke(); });
    });
  }
  function skyCanvas(sky) {
    return cv(1024, 512, (c, w, h) => {
      const g = c.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, sky.top); g.addColorStop(0.55, sky.mid); g.addColorStop(1, sky.low);
      c.fillStyle = g; c.fillRect(0, 0, w, h);
      if (sky.stars) {
        const r = rnd(7);
        for (let i = 0; i < 140; i++) { const x = r() * w, y = r() * h * 0.7, s = r() * 2 + 0.6; c.fillStyle = r() > 0.3 ? "#f3d27a" : "#fff"; c.beginPath(); for (let k = 0; k < 8; k++) { const a = (k * Math.PI) / 4, rr = k % 2 ? s * 0.4 : s * 1.6; c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } c.fill(); }
        c.fillStyle = "#f6e3a6"; c.beginPath(); c.arc(w * 0.72, h * 0.18, 26, 0, 7); c.fill(); c.fillStyle = sky.top; c.beginPath(); c.arc(w * 0.72 + 12, h * 0.18 - 6, 22, 0, 7); c.fill();
      } else {
        // نقش ریز طلایی آسمان زرین
        const r = rnd(3);
        c.globalAlpha = 0.18; c.fillStyle = "#fff";
        for (let i = 0; i < 220; i++) { c.beginPath(); c.arc(r() * w, r() * h * 0.8, r() * 1.6 + 0.4, 0, 7); c.fill(); }
        c.globalAlpha = 1;
        const sg = c.createRadialGradient(w * 0.7, h * 0.22, 4, w * 0.7, h * 0.22, 90);
        sg.addColorStop(0, sky.sun); sg.addColorStop(1, "rgba(255,255,255,0)");
        c.fillStyle = sg; c.fillRect(0, 0, w, h);
      }
    });
  }
  // زمین: رنگ پایه با بوته‌های ریز، گل‌های پنج‌پر و سنگریزه، مثل زمین نگاره‌ها
  function groundCanvas(gc, seed) {
    return cv(1024, 640, (c, w, h) => {
      c.fillStyle = gc[0]; c.fillRect(0, 0, w, h);
      const r = rnd(seed);
      for (let i = 0; i < 26; i++) { c.fillStyle = gc[1]; c.globalAlpha = 0.25; c.beginPath(); c.ellipse(r() * w, r() * h, 40 + r() * 70, 14 + r() * 20, 0, 0, 7); c.fill(); }
      c.globalAlpha = 1;
      for (let i = 0; i < 160; i++) {
        const x = r() * w, y = r() * h, k = r();
        c.strokeStyle = "#3c6e47"; c.lineWidth = 1.6; c.lineCap = "round";
        if (k < 0.55) { for (let j = -2; j <= 2; j++) { c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + j * 3, y - 6, x + j * 5, y - 10 - r() * 4); c.stroke(); } }
        else if (k < 0.85) {
          c.beginPath(); c.moveTo(x, y); c.lineTo(x, y - 12); c.stroke();
          const col = ["#b6413a", "#f6f1e6", "#d9a441", "#2a6fb3", "#d76f8a"][(r() * 5) | 0];
          c.fillStyle = col; for (let p = 0; p < 5; p++) { const a = (p * Math.PI * 2) / 5; c.beginPath(); c.arc(x + Math.cos(a) * 3.2, y - 14 + Math.sin(a) * 3.2, 2.4, 0, 7); c.fill(); }
          c.fillStyle = "#f0cd6e"; c.beginPath(); c.arc(x, y - 14, 1.6, 0, 7); c.fill();
        } else { c.fillStyle = "rgba(90,70,60,.35)"; c.beginPath(); c.ellipse(x, y, 4, 2.5, 0, 0, 7); c.fill(); }
      }
    });
  }
  // لبه‌ی کتاب: نوار تذهیب دور سکوی صحنه
  function edgeCanvas() {
    return cv(512, 32, (c, w, h) => {
      c.fillStyle = "#1d3a7a"; c.fillRect(0, 0, w, h);
      c.fillStyle = GOLD; c.fillRect(0, 0, w, 3); c.fillRect(0, h - 3, w, 3);
      for (let x = 8; x < w; x += 32) {
        c.fillStyle = GOLD; c.beginPath(); c.moveTo(x, h / 2); c.lineTo(x + 8, 6); c.lineTo(x + 16, h / 2); c.lineTo(x + 8, h - 6); c.fill();
        c.fillStyle = "#b6413a"; c.beginPath(); c.arc(x + 8, h / 2, 3, 0, 7); c.fill();
        c.fillStyle = "#2a9fb3"; c.beginPath(); c.arc(x + 24, h / 2, 2.4, 0, 7); c.fill();
      }
    });
  }
  function brickCanvas(band) {
    return cv(256, 256, (c, w, h) => {
      c.fillStyle = "#dcc095"; c.fillRect(0, 0, w, h);
      c.strokeStyle = "#b8976a"; c.lineWidth = 2;
      for (let y = 0; y < h; y += 16) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); for (let x = (y / 16) % 2 ? 16 : 0; x < w; x += 32) { c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + 16); c.stroke(); } }
      if (band) {
        c.fillStyle = "#2a9fb3"; c.fillRect(0, 16, w, 40);
        c.fillStyle = "#1d3a7a"; c.fillRect(0, 20, w, 32);
        c.fillStyle = "#efe3c6"; for (let x = 8; x < w; x += 24) { c.beginPath(); c.moveTo(x, 36); c.lineTo(x + 8, 26); c.lineTo(x + 16, 36); c.lineTo(x + 8, 46); c.fill(); }
      }
    });
  }
  function flameCanvas() {
    return cv(128, 256, (c, w, h) => {
      const g = c.createLinearGradient(0, h, 0, 0);
      g.addColorStop(0, "#b6413a"); g.addColorStop(0.45, "#f28a2e"); g.addColorStop(0.8, "#f6d44a"); g.addColorStop(1, "rgba(246,212,74,0)");
      c.fillStyle = g;
      const p = new Path2D("M64 252C20 250 6 210 18 170C26 140 40 150 36 120C34 90 52 60 46 20C70 50 66 80 78 96C86 70 84 50 92 34C108 80 120 120 112 170C104 220 100 250 64 252Z");
      c.fill(p);
      c.strokeStyle = "#7a1f1a"; c.lineWidth = 3; c.stroke(p);
      c.fillStyle = "rgba(255,240,180,.85)";
      c.fill(new Path2D("M64 240C40 236 36 210 44 190C50 176 58 184 58 166C62 150 70 140 70 120C82 150 92 170 88 200C86 226 82 240 64 240Z"));
    });
  }
  function bannerCanvas() {
    return cv(256, 320, (c, w, h) => {
      c.fillStyle = "#8a5a2e"; c.fillRect(0, 0, w, h);
      c.strokeStyle = GOLD; c.lineWidth = 12; c.strokeRect(10, 10, w - 20, h - 20);
      c.fillStyle = "#b6413a"; c.strokeStyle = GOLD; c.lineWidth = 4;
      const cx = w / 2, cy = h / 2 - 10;
      c.beginPath();
      for (let k = 0; k < 16; k++) { const a = (k * Math.PI) / 8 - Math.PI / 2, r = k % 2 ? 34 : 82; c.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); }
      c.closePath(); c.fill(); c.stroke();
      c.fillStyle = GOLD; c.beginPath(); c.arc(cx, cy, 22, 0, 7); c.fill();
      c.fillStyle = "#2a9fb3"; c.beginPath(); c.arc(cx, cy, 10, 0, 7); c.fill();
      [[40, 40], [w - 40, 40], [40, h - 40], [w - 40, h - 40]].forEach(([x, y]) => { c.fillStyle = "#2a9fb3"; c.beginPath(); c.arc(x, y, 10, 0, 7); c.fill(); c.strokeStyle = GOLD; c.lineWidth = 3; c.stroke(); });
    });
  }
  function checkerCanvas() {
    return cv(128, 128, (c, w) => { const s = w / 8; for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) { c.fillStyle = (x + y) % 2 ? "#1d3a7a" : "#efe3c6"; c.fillRect(x * s, y * s, s, s); } c.strokeStyle = GOLD; c.lineWidth = 6; c.strokeRect(0, 0, w, w); });
  }
  function stripeCanvas() {
    return cv(128, 64, (c, w, h) => { for (let i = 0; i < 8; i++) { c.fillStyle = i % 2 ? "#f6f1e6" : "#b6413a"; c.fillRect((i * w) / 8, 0, w / 8, h); } c.fillStyle = "#d9a441"; c.fillRect(0, 0, w, 6); });
  }
  function metalCanvas() {
    return cv(128, 64, (c, w, h) => { c.fillStyle = "#6e6e78"; c.fillRect(0, 0, w, h); c.fillStyle = "#b8794a"; for (let y = 6; y < h; y += 16) c.fillRect(0, y, w, 5); c.fillStyle = "#3a3a44"; for (let x = 4; x < w; x += 16) for (let y = 2; y < h; y += 8) { c.beginPath(); c.arc(x, y, 1.2, 0, 7); c.fill(); } });
  }
  function pageCanvas() {
    return cv(128, 96, (c, w, h) => {
      c.fillStyle = "#f4ead2"; c.fillRect(0, 0, w, h); c.fillStyle = "#c9a14a"; c.fillRect(w / 2 - 1, 0, 2, h);
      c.strokeStyle = "#2a1a12"; c.lineWidth = 1.5; for (let y = 16; y < h - 8; y += 10) { c.beginPath(); c.moveTo(8, y); c.lineTo(w / 2 - 8, y); c.moveTo(w / 2 + 8, y); c.lineTo(w - 8, y); c.stroke(); }
      c.strokeStyle = "#1d3a7a"; c.lineWidth = 3; c.strokeRect(2, 2, w - 4, h - 4);
    });
  }
  function blobCanvas() {
    return cv(128, 64, (c, w, h) => { const g = c.createRadialGradient(w / 2, h / 2, 2, w / 2, h / 2, w / 2); g.addColorStop(0, "rgba(40,25,15,.45)"); g.addColorStop(1, "rgba(40,25,15,0)"); c.fillStyle = g; c.fillRect(0, 0, w, h); });
  }
  function birdCanvas() {
    return cv(64, 32, (c) => { c.strokeStyle = INK; c.lineWidth = 3; c.lineCap = "round"; c.beginPath(); c.moveTo(4, 12); c.quadraticCurveTo(18, 2, 32, 18); c.quadraticCurveTo(46, 2, 60, 12); c.stroke(); });
  }

  // ---------- ساخت صحنه ----------
  function mount(el, opts) {
    const THREE = window.THREE;
    if (THREE.ColorManagement) THREE.ColorManagement.legacyMode = false;
    const st = storyOf(opts.level);
    const count = opts.count, fresh = opts.fresh;
    const calmNow = typeof calm === "function" && calm();
    const sky = SKY[st.sky], gcol = GROUND[st.ground];

    const W = el.clientWidth || 320, H = el.clientHeight || Math.round(W * 0.62);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(W, H);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.domElement.className = "shn-canvas";
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(new THREE.Color(sky.low), 22, 40);
    const camera = new THREE.PerspectiveCamera(30, W / H, 0.1, 80);
    const target = new THREE.Vector3(0, 2.0, -0.6);
    scene.add(new THREE.HemisphereLight(0xfff4dc, 0x6b5a4a, 0.85));
    const sun = new THREE.DirectionalLight(0xffffff, 0.75);
    sun.position.set(-5, 9, 7);
    scene.add(sun);

    const disposables = [];
    const tex = (canvas, rep) => {
      const t = new THREE.CanvasTexture(canvas);
      t.encoding = THREE.sRGBEncoding;
      t.anisotropy = 4;
      if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]); }
      disposables.push(t);
      return t;
    };
    const keep = (o) => { disposables.push(o); return o; };

    // مواد «طرح قلم» برای بخش‌هایی که هنوز رنگ نشده‌اند
    const sketchMat = () => keep(new THREE.MeshBasicMaterial({ color: PAPER, transparent: true, opacity: 0.55, depthWrite: false }));
    const inkLine = () => keep(new THREE.LineBasicMaterial({ color: INK, transparent: true, opacity: 0.55 }));
    function sketchify(obj) {
      const out = new THREE.Group();
      obj.updateMatrixWorld(true);
      obj.traverse((m) => {
        if (!m.isMesh || m.userData.noSketch) return;
        const g = m.geometry;
        const mesh = new THREE.Mesh(g, sketchMat());
        mesh.applyMatrix4(m.matrixWorld);
        out.add(mesh);
        if (!m.userData.noEdges) {
          const eg = keep(new THREE.EdgesGeometry(g, 35));
          const line = new THREE.LineSegments(eg, inkLine());
          line.applyMatrix4(m.matrixWorld);
          out.add(line);
        }
      });
      return out;
    }

    const parts = PARTS.map(() => []);
    const anims = [];
    const blobTex = tex(blobCanvas());
    function blob(x, z, w, op = 1) {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, w * 0.38), new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false, opacity: op }));
      keep(m.geometry); keep(m.material);
      m.rotation.x = -Math.PI / 2; m.position.set(x, 0.02, z);
      m.userData.noSketch = 1;
      return m;
    }

    // پیکره‌ی نقاشی‌شده روی صفحه
    function figure(spec, sketch) {
      const fig = A.FIGS[spec.fig];
      const [x0, y0, x1, y1] = fig.box, pad = 3;
      const u = 0.03 * (spec.s || 1);
      const cw = (x1 - x0 + pad * 2) * u, ch = (y1 - y0 + pad * 2) * u;
      const geo = keep(new THREE.PlaneGeometry(cw, ch));
      geo.translate(((x0 + x1) / 2) * u, (-(y0 + y1) / 2) * u, 0);
      const mat = keep(new THREE.MeshBasicMaterial({ map: tex(A.canvasOf(spec.fig, sketch, 6)), transparent: true, alphaTest: 0.08, side: THREE.DoubleSide, opacity: sketch ? 0.7 : 1, depthWrite: !sketch }));
      const m = new THREE.Mesh(geo, mat);
      const g = new THREE.Group();
      g.add(m);
      if (spec.f) m.scale.x = -1;
      g.position.set(spec.x, spec.y || 0, spec.z || 0);
      if (!sketch) { const b = blob(0, 0.05, cw * 0.7, spec.y ? 0.35 : 0.9); b.position.y = 0.02 - (spec.y || 0); g.add(b); }
      g.userData.anim = spec.anim;
      return g;
    }

    // صخره‌ی اسفنجی نگارگری: لبه‌ی پرچین و خط‌های درونی
    function rock(w, h, peaks, color, seed) {
      const r = rnd(seed);
      const pts = [];
      const N = 90;
      for (let i = 0; i <= N; i++) {
        const t = i / N, x = -w / 2 + t * w;
        let y = 0;
        peaks.forEach(([px, ph, pw]) => { y = Math.max(y, ph * Math.exp(-Math.pow((t - px) / pw, 2))); });
        y = y * h + Math.abs(Math.sin(t * 38 + seed)) * 0.16 * h * 0.25 + 0.05;
        pts.push(new THREE.Vector2(x, Math.max(0.05, y)));
      }
      const shape = new THREE.Shape();
      shape.moveTo(-w / 2, 0);
      pts.forEach((p) => shape.lineTo(p.x, p.y));
      shape.lineTo(w / 2, 0);
      shape.lineTo(-w / 2, 0);
      const geo = keep(new THREE.ExtrudeGeometry(shape, { depth: 0.7, bevelEnabled: true, bevelThickness: 0.25, bevelSize: 0.18, bevelSegments: 2, curveSegments: 4 }));
      const mat = keep(new THREE.MeshLambertMaterial({ color }));
      const g = new THREE.Group();
      const mesh = new THREE.Mesh(geo, mat);
      g.add(mesh);
      // خط‌های درونی اسفنجی
      const lineMat = keep(new THREE.LineBasicMaterial({ color: new THREE.Color(color).multiplyScalar(0.62) }));
      for (let k = 0; k < 3; k++) {
        const sc = 0.82 - k * 0.2;
        const lp = pts.filter((_, i) => i % 2 === 0).map((p) => new THREE.Vector3(p.x * sc + (r() - 0.5) * 0.1, p.y * sc - 0.1 * k, 0.97));
        const lg = keep(new THREE.BufferGeometry().setFromPoints(lp));
        const ln = new THREE.Line(lg, lineMat);
        ln.userData.noSketch = 1;
        g.add(ln);
      }
      const og = keep(new THREE.BufferGeometry().setFromPoints(pts.map((p) => new THREE.Vector3(p.x, p.y + 0.02, 0.96))));
      const ol = new THREE.Line(og, keep(new THREE.LineBasicMaterial({ color: INK })));
      ol.userData.noSketch = 1;
      g.add(ol);
      mesh.userData.noEdges = 1;
      return g;
    }
    function hills(kind) {
      const c = ROCK[kind], g = new THREE.Group();
      const add = (o, x, y, z, s = 1) => { o.position.set(x, y, z); o.scale.setScalar(s); g.add(o); };
      if (kind === "peak") {
        add(rock(12, 4.2, [[0.35, 0.6, 0.18], [0.62, 1, 0.12], [0.85, 0.5, 0.12]], c[0], 3), 2, 0, -5.4);
        add(rock(10, 2.6, [[0.2, 0.9, 0.2], [0.6, 0.6, 0.2]], c[1], 5), -5.5, 0, -4.4);
        add(rock(6, 1.6, [[0.5, 1, 0.3]], c[2], 9), 7, 0, -3.6);
      } else if (kind === "damavand") {
        const m = rock(14, 4.8, [[0.55, 1, 0.16], [0.3, 0.45, 0.2]], c[0], 4);
        add(m, 1.6, 0, -5.6);
        add(rock(8, 2, [[0.3, 1, 0.25], [0.7, 0.7, 0.2]], c[1], 6), -6, 0, -4.2);
      } else if (kind === "dunes") {
        add(rock(14, 1.6, [[0.25, 1, 0.22], [0.7, 0.8, 0.25]], c[0], 2), -2, 0, -5);
        add(rock(10, 1.1, [[0.4, 1, 0.3]], c[1], 8), 5, 0, -4);
        add(rock(7, 0.8, [[0.5, 1, 0.3]], c[2], 1), -6, 0, -3.4);
      } else if (kind === "cave") {
        add(rock(14, 4.6, [[0.3, 0.8, 0.2], [0.55, 1, 0.16], [0.8, 0.6, 0.15]], c[0], 7), 1.4, 0, -4.6);
        const mouth = new THREE.Mesh(keep(new THREE.CircleGeometry(1.5, 24, 0, Math.PI)), keep(new THREE.MeshBasicMaterial({ color: 0x1a1220 })));
        mouth.scale.set(1, 1.5, 1);
        add(mouth, 2.4, 0.02, -3.62);
        add(rock(6, 1.8, [[0.4, 1, 0.3]], c[1], 3), -6.4, 0, -3.4);
      } else if (kind === "snow") {
        add(rock(16, 4, [[0.2, 0.7, 0.14], [0.45, 1, 0.12], [0.75, 0.8, 0.14]], c[0], 5), 0, 0, -5.4);
        add(rock(8, 2, [[0.4, 1, 0.25]], c[1], 2), -6, 0, -4);
        add(rock(7, 1.6, [[0.6, 1, 0.25]], c[2], 9), 6.4, 0, -3.8);
      } else if (kind === "rocks") {
        add(rock(8, 3.4, [[0.3, 1, 0.16], [0.6, 0.7, 0.14]], c[0], 1), -4.8, 0, -4.8);
        add(rock(9, 3.8, [[0.5, 1, 0.14], [0.8, 0.6, 0.12]], c[1], 2), 4.6, 0, -5.2);
        add(rock(4, 1.2, [[0.3, 1, 0.2], [0.7, 0.8, 0.2]], c[2], 3), -8, 0, -3.2);
      } else {
        add(rock(18, 2.8, [[0.15, 0.8, 0.12], [0.4, 1, 0.14], [0.66, 0.75, 0.12], [0.88, 0.95, 0.1]], c[0], 4), 0, 0, -5.6);
        add(rock(8, 1.7, [[0.3, 1, 0.25], [0.7, 0.7, 0.2]], c[1], 6), -5.6, 0, -4);
        add(rock(7, 1.4, [[0.5, 1, 0.3]], c[2], 8), 6, 0, -3.8);
      }
      return g;
    }
    // جوی نقره‌ای نگاره‌ها
    function stream() {
      const s = new THREE.Shape();
      const pts = [];
      for (let i = 0; i <= 30; i++) { const t = i / 30; pts.push([-9 + t * 18, 3.4 - Math.sin(t * 7) * 0.6 - t * 1.2]); }
      s.moveTo(pts[0][0], pts[0][1] - 0.25);
      pts.forEach(([x, y]) => s.lineTo(x, y - 0.25));
      pts.slice().reverse().forEach(([x, y]) => s.lineTo(x, y + 0.25));
      const geo = keep(new THREE.ShapeGeometry(s));
      const m = new THREE.Mesh(geo, keep(new THREE.MeshPhongMaterial({ color: 0xb8c6cf, specular: 0xffffff, shininess: 80 })));
      m.rotation.x = -Math.PI / 2;
      m.position.y = 0.03;
      m.userData.noEdges = 1;
      return m;
    }

    // رود پهن (جیحون) و دریاچه
    function waterMat() { return keep(new THREE.MeshPhongMaterial({ color: 0x7fa8c4, specular: 0xffffff, shininess: 90 })); }
    function waves(g, x0, x1, z0, z1, n) {
      const lm = keep(new THREE.LineBasicMaterial({ color: 0xf4f8fb }));
      const r = rnd(n);
      for (let i = 0; i < n; i++) {
        const cx = x0 + r() * (x1 - x0), cz = z0 + r() * (z1 - z0), pts = [];
        for (let k = 0; k <= 8; k++) pts.push(new THREE.Vector3(cx + k * 0.14, 0.05, cz + Math.sin(k * 1.6) * 0.05));
        const ln = new THREE.Line(keep(new THREE.BufferGeometry().setFromPoints(pts)), lm);
        ln.userData.noSketch = 1;
        g.add(ln);
      }
    }
    function river() {
      const g = new THREE.Group();
      const s = new THREE.Shape();
      s.moveTo(-10, -0.6);
      for (let i = 0; i <= 20; i++) s.lineTo(-10 + i, -0.6 + Math.sin(i * 0.8) * 0.25);
      for (let i = 20; i >= 0; i--) s.lineTo(-10 + i, 1.4 + Math.sin(i * 0.7 + 1) * 0.25);
      const m = new THREE.Mesh(keep(new THREE.ShapeGeometry(s)), waterMat());
      m.rotation.x = -Math.PI / 2; m.position.y = 0.03; m.userData.noEdges = 1;
      g.add(m);
      waves(g, -9, 8, -1.2, 0.4, 26);
      return g;
    }
    function lake() {
      const g = new THREE.Group();
      const m = new THREE.Mesh(keep(new THREE.CircleGeometry(2.4, 40)), waterMat());
      m.rotation.x = -Math.PI / 2; m.scale.y = 0.55; m.position.set(2.4, 0.03, -1.6); m.userData.noEdges = 1;
      g.add(m);
      waves(g, 0.8, 3.6, -2.4, -1, 8);
      return g;
    }

    // ---------- درخت‌ها و بناها ----------
    function lam(c) { return keep(new THREE.MeshLambertMaterial({ color: c })); }
    function prop(kind, x, z) {
      const g = new THREE.Group();
      g.position.set(x, 0, z);
      if (kind === "cypress") {
        const prof = []; for (let i = 0; i <= 12; i++) { const t = i / 12; prof.push(new THREE.Vector2(Math.sin(Math.pow(t, 0.7) * Math.PI) * 0.55 * (1 - t * 0.35), t * 3.6)); }
        const c = new THREE.Mesh(keep(new THREE.LatheGeometry(prof, 10)), lam(0x2f5a3a));
        c.position.y = 0.3; g.add(c);
        const tr = new THREE.Mesh(keep(new THREE.CylinderGeometry(0.08, 0.1, 0.4, 6)), lam(0x6b4a2a)); tr.position.y = 0.2; g.add(tr);
        const tip = new THREE.Mesh(keep(new THREE.ConeGeometry(0.12, 0.6, 6)), lam(0x2f5a3a)); tip.position.set(0.08, 3.95, 0); tip.rotation.z = -0.4; g.add(tip);
        g.add(blob(0, 0, 1.6));
      } else if (kind === "chenar" || kind === "blossom" || kind === "tamarisk") {
        const trunk = new THREE.Mesh(keep(new THREE.CylinderGeometry(0.12, 0.24, 2.4, 7)), lam(0x7a5a3a)); trunk.position.y = 1.2; trunk.rotation.z = 0.06; g.add(trunk);
        const b1 = new THREE.Mesh(keep(new THREE.CylinderGeometry(0.05, 0.1, 1.2, 5)), lam(0x7a5a3a)); b1.position.set(-0.35, 2.3, 0); b1.rotation.z = 0.7; g.add(b1);
        const leaf = kind === "chenar" ? 0x3c6e47 : kind === "tamarisk" ? 0x6f8a5a : 0x5f8f4e;
        const r = rnd(kind.length * 7 + x * 3);
        const blobs = kind === "blossom" ? 6 : 8;
        for (let i = 0; i < blobs; i++) {
          const s = new THREE.Mesh(keep(new THREE.IcosahedronGeometry(0.55 + r() * 0.3, 1)), keep(new THREE.MeshLambertMaterial({ color: leaf, flatShading: true })));
          s.position.set((r() - 0.5) * 1.8, 2.5 + r() * 1.3, (r() - 0.5) * 0.9);
          s.scale.y = 0.8;
          g.add(s);
        }
        if (kind !== "tamarisk") {
          const flower = new THREE.InstancedMesh(keep(new THREE.SphereGeometry(0.08, 6, 4)), lam(kind === "blossom" ? 0xf3c6d0 : 0xf0cd6e), 40);
          const mm = new THREE.Matrix4();
          for (let i = 0; i < 40; i++) { const a = r() * 6.28, b = r() * 3.14, rr = 0.9 + r() * 0.5; mm.makeTranslation(Math.cos(a) * Math.sin(b) * rr * 1.1, 3 + Math.cos(b) * rr * 0.8, Math.sin(a) * Math.sin(b) * rr * 0.6 + 0.2); flower.setMatrixAt(i, mm); }
          flower.userData.noSketch = 1;
          g.add(flower);
        }
        g.add(blob(0, 0, 2.6));
      } else if (kind === "castle") {
        const wall = new THREE.Mesh(keep(new THREE.BoxGeometry(4.4, 2.2, 1)), [lam(0xc9a87a), lam(0xc9a87a), lam(0xdcc095), lam(0xdcc095), keep(new THREE.MeshLambertMaterial({ map: tex(brickCanvas(true), [2, 1]) })), lam(0xc9a87a)]);
        wall.position.y = 1.1; g.add(wall);
        for (let i = 0; i < 9; i++) { const m = new THREE.Mesh(keep(new THREE.BoxGeometry(0.28, 0.3, 1)), lam(0xdcc095)); m.position.set(-2 + i * 0.5, 2.35, 0); g.add(m); }
        const gate = new THREE.Mesh(keep(new THREE.CircleGeometry(0.55, 16, 0, Math.PI)), keep(new THREE.MeshBasicMaterial({ color: 0x2a1a12 })));
        gate.scale.y = 1.6; gate.position.set(0, 0, 0.51); gate.userData.noEdges = 1; g.add(gate);
        const gd = new THREE.Mesh(keep(new THREE.PlaneGeometry(1.1, 0.01)), keep(new THREE.MeshBasicMaterial({ color: 0x2a1a12 }))); gd.position.set(0, 0, 0.51); g.add(gd);
        [-2.3, 2.3].forEach((tx) => {
          const t = new THREE.Mesh(keep(new THREE.CylinderGeometry(0.5, 0.56, 3.2, 12)), keep(new THREE.MeshLambertMaterial({ map: tex(brickCanvas(true), [1, 1]) })));
          t.position.set(tx, 1.6, 0.1); g.add(t);
          const d = new THREE.Mesh(keep(new THREE.SphereGeometry(0.52, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2)), lam(0x2a9fb3)); d.position.set(tx, 3.2, 0.1); d.scale.y = 1.4; g.add(d);
          const f = new THREE.Mesh(keep(new THREE.ConeGeometry(0.06, 0.5, 6)), lam(0xd9a441)); f.position.set(tx, 4.1, 0.1); g.add(f);
        });
        const dome = new THREE.Mesh(keep(new THREE.SphereGeometry(0.9, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2)), lam(0x2a9fb3)); dome.position.set(0, 2.2, -0.2); dome.scale.y = 1.3; g.add(dome);
        g.add(blob(0, 0.3, 6));
      } else if (kind === "tower") {
        const t = new THREE.Mesh(keep(new THREE.CylinderGeometry(0.85, 0.95, 2.6, 16)), keep(new THREE.MeshLambertMaterial({ map: tex(brickCanvas(true), [2, 2]) })));
        t.position.y = 1.3; g.add(t);
        const bal = new THREE.Mesh(keep(new THREE.CylinderGeometry(1.15, 1.05, 0.2, 18)), lam(0xd9a441)); bal.position.y = 2.65; g.add(bal);
        const top = new THREE.Mesh(keep(new THREE.CylinderGeometry(0.7, 0.7, 1.0, 14, 1, true)), keep(new THREE.MeshLambertMaterial({ color: 0x2a9fb3, side: THREE.DoubleSide }))); top.position.y = 3.25; g.add(top);
        const d = new THREE.Mesh(keep(new THREE.SphereGeometry(0.75, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2)), lam(0x1d3a7a)); d.position.y = 3.75; d.scale.y = 1.4; g.add(d);
        g.add(blob(0, 0, 2.8));
      } else if (kind === "well") {
        const w = new THREE.Mesh(keep(new THREE.CylinderGeometry(0.9, 1, 0.55, 18, 1, true)), keep(new THREE.MeshLambertMaterial({ map: tex(brickCanvas(false), [3, 1]), side: THREE.DoubleSide })));
        w.position.y = 0.27; g.add(w);
        const hole = new THREE.Mesh(keep(new THREE.CircleGeometry(0.9, 18)), keep(new THREE.MeshBasicMaterial({ color: 0x120c0a }))); hole.rotation.x = -Math.PI / 2; hole.position.y = 0.2; hole.userData.noEdges = 1; g.add(hole);
        const stone = new THREE.Mesh(keep(new THREE.DodecahedronGeometry(0.9, 0)), keep(new THREE.MeshLambertMaterial({ color: 0x9a8f9e, flatShading: true }))); stone.scale.set(1.1, 0.55, 0.9);
        stone.position.set(0, 0.85, 0); stone.name = "lid"; g.add(stone);
        g.add(blob(0, 0, 2.4));
      } else if (kind === "stone") {
        const s = new THREE.Mesh(keep(new THREE.DodecahedronGeometry(0.8, 0)), keep(new THREE.MeshLambertMaterial({ color: 0x9a8f9e, flatShading: true }))); s.scale.set(1.3, 0.8, 1); s.position.y = 0.5; g.add(s);
        g.add(blob(0, 0, 2.4));
      } else if (kind === "nest") {
        const n = new THREE.Mesh(keep(new THREE.TorusGeometry(0.5, 0.18, 6, 14)), lam(0x7a5a3a)); n.rotation.x = -Math.PI / 2; n.position.y = 4.1; g.add(n);
      } else if (kind === "chess") {
        const t = new THREE.Mesh(keep(new THREE.BoxGeometry(1.4, 0.5, 1.2)), [lam(0x7a3a24), lam(0x7a3a24), keep(new THREE.MeshLambertMaterial({ map: tex(checkerCanvas()) })), lam(0x7a3a24), lam(0x7a3a24), lam(0x7a3a24)]);
        t.position.y = 0.25; g.add(t);
        const r = rnd(4);
        for (let i = 0; i < 10; i++) { const p = new THREE.Mesh(keep(new THREE.CylinderGeometry(0.04, 0.07, 0.2 + r() * 0.12, 8)), lam(i % 2 ? 0xb6413a : 0xf6f1e6)); p.position.set(-0.55 + (i % 5) * 0.27, 0.6, i < 5 ? -0.4 : 0.4); g.add(p); }
        g.add(blob(0, 0, 2.2));
      } else if (kind === "crown") {
        const ped = new THREE.Mesh(keep(new THREE.CylinderGeometry(0.4, 0.5, 0.6, 12)), lam(0xdcc095)); ped.position.y = 0.3; g.add(ped);
        const ring = new THREE.Mesh(keep(new THREE.CylinderGeometry(0.34, 0.3, 0.26, 16, 1, true)), keep(new THREE.MeshPhongMaterial({ color: 0xd9a441, specular: 0xfff0c0, shininess: 60, side: THREE.DoubleSide }))); ring.position.y = 0.75; g.add(ring);
        for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; const s = new THREE.Mesh(keep(new THREE.ConeGeometry(0.07, 0.3, 5)), keep(new THREE.MeshPhongMaterial({ color: 0xd9a441, shininess: 60 }))); s.position.set(Math.cos(a) * 0.3, 1.0, Math.sin(a) * 0.3); g.add(s); }
        const j = new THREE.Mesh(keep(new THREE.SphereGeometry(0.07, 8, 6)), lam(0xb6413a)); j.position.set(0, 0.78, 0.33); g.add(j);
        g.name = "crown";
      } else if (kind === "pit") {
        const hole = new THREE.Mesh(keep(new THREE.CircleGeometry(1, 18)), keep(new THREE.MeshBasicMaterial({ color: 0x241812 }))); hole.rotation.x = -Math.PI / 2; hole.position.y = 0.03; hole.scale.y = 0.6; hole.userData.noEdges = 1; g.add(hole);
        for (let i = 0; i < 6; i++) { const s = new THREE.Mesh(keep(new THREE.ConeGeometry(0.04, 0.8, 5)), lam(0xb7bcc4)); s.position.set(-0.6 + i * 0.24, 0.3, (i % 2) * 0.2 - 0.1); g.add(s); }
      } else if (kind === "bigstone") {
        const st2 = new THREE.Mesh(keep(new THREE.DodecahedronGeometry(1.3, 0)), keep(new THREE.MeshLambertMaterial({ color: 0x8f8794, flatShading: true }))); st2.scale.set(1, 1.3, 0.9); st2.position.y = 1.3; g.add(st2);
        g.add(blob(0, 0, 3.4));
      } else if (kind === "ball") {
        const b = new THREE.Mesh(keep(new THREE.SphereGeometry(0.14, 12, 8)), lam(0xf6f1e6)); b.position.y = 0.14; g.add(b);
        g.add(blob(0, 0, 0.6));
      } else if (kind === "tent") {
        const c = new THREE.Mesh(keep(new THREE.CylinderGeometry(1.2, 1.2, 1.2, 16, 1, true)), keep(new THREE.MeshLambertMaterial({ map: tex(stripeCanvas(), [3, 1]), side: THREE.DoubleSide }))); c.position.y = 0.6; g.add(c);
        const r = new THREE.Mesh(keep(new THREE.ConeGeometry(1.4, 1.2, 16)), lam(0xb6413a)); r.position.y = 1.8; g.add(r);
        const f = new THREE.Mesh(keep(new THREE.ConeGeometry(0.06, 0.5, 6)), lam(0xd9a441)); f.position.y = 2.6; g.add(f);
        const d = new THREE.Mesh(keep(new THREE.PlaneGeometry(0.7, 0.9)), keep(new THREE.MeshBasicMaterial({ color: 0x2a1a12 }))); d.position.set(0, 0.45, 1.21); d.userData.noEdges = 1; g.add(d);
        g.add(blob(0, 0, 3.2));
      } else if (kind === "bigcypress") {
        const t = prop("cypress", 0, 0); t.scale.set(1.3, 1.25, 1.3); g.add(t);
      } else if (kind === "bigtree") {
        const t = prop("chenar", 0, 0); t.scale.setScalar(1.35); g.add(t);
      } else if (kind === "talk") {
        const r = rnd(5);
        for (let i = 0; i < 9; i++) { const f = new THREE.Mesh(keep(new THREE.SphereGeometry(0.16, 10, 8)), keep(new THREE.MeshBasicMaterial({ color: i % 2 ? 0xf0cd6e : 0xf6f1e6 }))); f.position.set((r() - 0.5) * 2.6, 3.2 + r() * 1.6, 0.9 + r() * 0.3); f.userData.glowfruit = i; g.add(f); }
      } else if (kind === "wall") {
        const w = new THREE.Mesh(keep(new THREE.BoxGeometry(8, 3, 0.8)), [lam(0x6a5a4a), lam(0x6a5a4a), lam(0x8a7a66), lam(0x6a5a4a), keep(new THREE.MeshLambertMaterial({ map: tex(metalCanvas(), [4, 1]) })), lam(0x6a5a4a)]);
        w.position.y = 1.5; g.add(w);
        for (let i = 0; i < 15; i++) { const m = new THREE.Mesh(keep(new THREE.BoxGeometry(0.3, 0.3, 0.8)), lam(0x8a7a66)); m.position.set(-3.8 + i * 0.54, 3.15, 0); g.add(m); }
        g.add(blob(0, 0.3, 9));
      } else if (kind === "box") {
        const bx = new THREE.Mesh(keep(new THREE.BoxGeometry(0.9, 0.45, 0.55)), lam(0x8a5a2e)); bx.position.y = 0.2; g.add(bx);
        const tr = new THREE.Mesh(keep(new THREE.BoxGeometry(0.94, 0.08, 0.59)), lam(0xd9a441)); tr.position.y = 0.38; g.add(tr);
        g.userData.anim = "bob";
      } else if (kind === "mill") {
        const h = new THREE.Mesh(keep(new THREE.BoxGeometry(2.2, 1.8, 1.8)), keep(new THREE.MeshLambertMaterial({ map: tex(brickCanvas(false), [2, 1]) }))); h.position.y = 0.9; g.add(h);
        const roof = new THREE.Mesh(keep(new THREE.ConeGeometry(1.7, 0.9, 4)), lam(0x7a5a3a)); roof.position.y = 2.25; roof.rotation.y = Math.PI / 4; g.add(roof);
        const wh = new THREE.Group(); wh.position.set(-0.55, 0.95, 1.0); wh.name = "wheel";
        const rim = new THREE.Mesh(keep(new THREE.TorusGeometry(0.8, 0.07, 6, 20)), lam(0x6b4a2a)); wh.add(rim);
        for (let i = 0; i < 6; i++) { const sp = new THREE.Mesh(keep(new THREE.BoxGeometry(0.08, 1.6, 0.12)), lam(0x6b4a2a)); sp.rotation.z = (i * Math.PI) / 6; wh.add(sp); }
        g.add(wh);
        const d = new THREE.Mesh(keep(new THREE.PlaneGeometry(0.6, 0.9)), keep(new THREE.MeshBasicMaterial({ color: 0x2a1a12 }))); d.position.set(0.6, 0.45, 0.91); d.userData.noEdges = 1; g.add(d);
        g.add(blob(0, 0, 3.4));
      } else if (kind === "arch") {
        const s = new THREE.Shape();
        s.moveTo(-5, 0); s.lineTo(-5, 4.6); s.lineTo(5, 4.6); s.lineTo(5, 0); s.lineTo(1.6, 0); s.lineTo(1.6, 2.2);
        s.quadraticCurveTo(1.5, 4.1, 0, 4.2); s.quadraticCurveTo(-1.5, 4.1, -1.6, 2.2); s.lineTo(-1.6, 0); s.lineTo(-5, 0);
        const geo = keep(new THREE.ExtrudeGeometry(s, { depth: 1.2, bevelEnabled: false }));
        const a = new THREE.Mesh(geo, keep(new THREE.MeshLambertMaterial({ map: tex(brickCanvas(false), [0.25, 0.25]) })));
        g.add(a);
        const back = new THREE.Mesh(keep(new THREE.PlaneGeometry(3.2, 4.2)), lam(0x5a4636)); back.position.set(0, 2.1, 0.05); back.userData.noEdges = 1; g.add(back);
        for (let i = 0; i < 4; i++) { const w = new THREE.Mesh(keep(new THREE.CircleGeometry(0.28, 12, 0, Math.PI)), keep(new THREE.MeshBasicMaterial({ color: 0x3a2a1e }))); w.scale.y = 1.8; w.position.set(i < 2 ? -4 + i * 1.2 : 2.8 + (i - 2) * 1.2, 2.8, 1.21); w.userData.noEdges = 1; g.add(w); }
        g.add(blob(0, 0.6, 11));
      } else if (kind === "book") {
        const st2 = new THREE.Mesh(keep(new THREE.BoxGeometry(0.9, 0.7, 0.7)), lam(0x7a3a24)); st2.position.y = 0.35; g.add(st2);
        const pg = new THREE.Mesh(keep(new THREE.BoxGeometry(1.2, 0.08, 0.8)), keep(new THREE.MeshLambertMaterial({ map: tex(pageCanvas()) }))); pg.position.y = 0.74; pg.rotation.x = 0.35; g.add(pg);
        g.add(blob(0, 0, 1.6));
      } else if (kind === "banner") {
        const pole = new THREE.Mesh(keep(new THREE.CylinderGeometry(0.05, 0.05, 4.6, 6)), lam(0x7a5a3a)); pole.position.y = 2.3; g.add(pole);
        const tip = new THREE.Mesh(keep(new THREE.ConeGeometry(0.12, 0.4, 6)), lam(0xd9a441)); tip.position.y = 4.8; g.add(tip);
        const cloth = new THREE.Mesh(keep(new THREE.PlaneGeometry(1.5, 1.9, 12, 6)), keep(new THREE.MeshLambertMaterial({ map: tex(bannerCanvas()), side: THREE.DoubleSide })));
        cloth.position.set(0.8, 3.6, 0); cloth.name = "cloth"; g.add(cloth);
        ["#b6413a", "#d9a441", "#7a3a6e", "#2a9fb3"].forEach((c, i) => { const r = new THREE.Mesh(keep(new THREE.PlaneGeometry(0.1, 0.9)), keep(new THREE.MeshLambertMaterial({ color: c, side: THREE.DoubleSide }))); r.position.set(0.25 + i * 0.36, 2.25, 0.01); g.add(r); });
        g.add(blob(0, 0, 1.4));
      } else if (kind === "fire") {
        const ft = tex(flameCanvas());
        const fm = keep(new THREE.MeshBasicMaterial({ map: ft, transparent: true, depthWrite: false, side: THREE.DoubleSide }));
        const geo = keep(new THREE.PlaneGeometry(0.9, 1.8)); geo.translate(0, 0.9, 0);
        [-1.4, 1.4].forEach((zz) => {
          for (let i = 0; i < 9; i++) {
            const f = new THREE.Mesh(geo, fm);
            f.position.set(-4 + i, 0, zz + (i % 2) * 0.15);
            f.scale.setScalar((zz > 0 ? 0.5 : 0.9) + (i % 3) * 0.18);
            f.userData.flame = i + zz;
            f.userData.noSketch = 1;
            g.add(f);
          }
        });
        g.position.set(0, 0, z);
      }
      return g;
    }

    // ---------- چیدن بخش‌ها ----------
    // بخش ۰: سکو، زمین و آسمان
    (function () {
      const skyGeo = keep(new THREE.CylinderGeometry(16, 16, 16, 48, 1, true, Math.PI - 1.5, 3));
      const skyM = new THREE.Mesh(skyGeo, keep(new THREE.MeshBasicMaterial({ map: tex(skyCanvas(sky)), side: THREE.BackSide, fog: false })));
      skyM.position.set(0, 6.5, 6.5);
      skyM.userData.noEdges = 1;
      const top = keep(new THREE.MeshLambertMaterial({ map: tex(groundCanvas(gcol, st.name.length)) }));
      const edge = keep(new THREE.MeshLambertMaterial({ map: tex(edgeCanvas(), [4, 1]) }));
      const slab = new THREE.Mesh(keep(new THREE.BoxGeometry(20, 0.6, 12)), [edge, edge, top, edge, edge, edge]);
      slab.position.set(0, -0.3, -0.6);
      const g = new THREE.Group(); g.add(skyM); g.add(slab);
      parts[0].push(g);
    })();
    parts[1].push(hills(st.hills));
    if (st.water === "river") parts[1].push(river());
    else if (st.water === "lake") parts[1].push(lake());
    else if (!(st.life || []).includes("spring") && st.hills !== "dunes" && st.hills !== "snow") parts[1].push(stream());
    st.props.forEach(([k, x, z]) => parts[2].push(k === "rakhshProp" ? { fig: "rakhshStand", x, z, s: 0.8, f: 1 } : prop(k, x, z)));
    const addSpec = (i) => (spec) => parts[i].push(spec.prop ? prop(spec.prop, spec.x, spec.z) : spec);
    st.a.slice(1).forEach(addSpec(3));
    st.b.slice(1).forEach(addSpec(4));
    if (st.life.includes("spring")) parts[5].push(stream());

    const root = new THREE.Group();
    scene.add(root);
    const fades = [];
    const life = [];
    parts.forEach((items, i) => {
      items.forEach((it) => {
        const isFig = it.fig;
        const built = i < count;
        if (built) {
          const obj = isFig ? figure(it, false) : it;
          root.add(obj);
          if (obj.userData.anim || obj.name === "lid" || isFig) anims.push(obj);
          collectLife(obj);
          if (i === fresh) {
            const sk = isFig ? figure(it, true) : sketchify(obj);
            root.add(sk);
            fades.push({ obj, sk, y: obj.position.y });
            obj.traverse((m) => { if (m.material) (Array.isArray(m.material) ? m.material : [m.material]).forEach((mt) => { if (mt.userData.baseOp === undefined) { mt.userData.wasT = mt.transparent; mt.userData.baseOp = mt.opacity; } mt.transparent = true; mt.opacity = 0; }); });
          }
        } else {
          const sk = isFig ? figure(it, true) : sketchify(it);
          root.add(sk);
        }
      });
    });
    // بخش ششم: جان گرفتن
    const alive = count >= PARTS.length;
    function collectLife(obj) {
      obj.traverse((m) => { if (m.userData.flame !== undefined || m.name === "cloth") life.push(m); });
    }
    if (alive) addLife();


    function addLife() {
      const L = st.life || [];
      const cloudT = tex(cloudCanvas(sky));
      if (L.includes("clouds") || L.includes("simorgh")) {
        for (let i = 0; i < 3; i++) {
          const c = new THREE.Mesh(keep(new THREE.PlaneGeometry(3.2, 1.2)), keep(new THREE.MeshBasicMaterial({ map: cloudT, transparent: true, depthWrite: false, fog: false })));
          c.position.set(-7 + i * 6.5, 6.2 + (i % 2) * 1.1, -6.5 + i * 0.3);
          c.userData.drift = 0.12 + i * 0.05;
          root.add(c); life.push(c);
        }
      }
      if (L.includes("birds")) {
        const bt = tex(birdCanvas());
        for (let i = 0; i < 4; i++) {
          const b = new THREE.Mesh(keep(new THREE.PlaneGeometry(0.5, 0.25)), keep(new THREE.MeshBasicMaterial({ map: bt, transparent: true, depthWrite: false })));
          b.position.set(-4 + i * 2.2, 5.4 + (i % 2) * 0.8, -3 - i * 0.4);
          b.userData.bird = i;
          root.add(b); life.push(b);
        }
      }
      if (L.includes("simorgh")) {
        const s = figure({ fig: "simorgh", x: 0.4, y: 3.3, z: -2, s: 0.55, f: 1, anim: "fly" }, false);
        root.add(s); anims.push(s);
      }
      const flames = (n, x, z, sc, y = 0) => {
        const fm = keep(new THREE.MeshBasicMaterial({ map: tex(flameCanvas()), transparent: true, depthWrite: false, side: THREE.DoubleSide }));
        const geo = keep(new THREE.PlaneGeometry(0.5, 1)); geo.translate(0, 0.5, 0);
        for (let i = 0; i < n; i++) { const f = new THREE.Mesh(geo, fm); f.position.set(x + (i - (n - 1) / 2) * 0.25, y, z + i * 0.01); f.scale.setScalar(sc); f.userData.flame = i * 1.7; root.add(f); life.push(f); }
      };
      if (L.includes("spark")) flames(3, 2.3, 0.7, 0.8, 0.9);
      if (L.includes("torch")) flames(1, -5.4, -1.2, 0.8);
      if (L.includes("breath")) flames(3, 0.75, 0.3, 0.45, 1.0);
      if (L.includes("candle")) { const cl = new THREE.PointLight(0xffc45a, 1.6, 5); cl.position.set(1.1, 2.4, 1.6); root.add(cl); }
      if (L.includes("cupglow") || L.includes("glow")) {
        const gl = new THREE.PointLight(0xffd27a, 1.4, 6); gl.position.set(L.includes("glow") ? 0.6 : -0.6, 1.6, 1.4); root.add(gl);
      }
      if (L.includes("snow") || L.includes("petals") || L.includes("fireflies") || L.includes("dust") || L.includes("sparks") || L.includes("stars") || L.includes("notes")) {
        const snow = L.includes("snow");
        const n = snow ? 70 : 26, geo = keep(new THREE.SphereGeometry(L.includes("dust") ? 0.06 : snow ? 0.05 : 0.045, 6, 4));
        const col = snow ? 0xffffff : L.includes("petals") ? 0xf3c6d0 : L.includes("dust") ? 0xe2cc9a : 0xffe08a;
        const pm = new THREE.InstancedMesh(geo, keep(new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.85 })), n);
        pm.userData.parts = Array.from({ length: n }, (_, i) => ({ x: (Math.random() - 0.5) * 16, y: Math.random() * 5 + 0.3, z: (Math.random() - 0.5) * 6, v: 0.2 + Math.random() * 0.3, p: Math.random() * 6 }));
        pm.userData.kind = snow || L.includes("petals") ? "fall" : L.includes("dust") ? "drift" : "rise";
        root.add(pm); life.push(pm);
      }
      if (L.includes("ropes")) {
        const rm = keep(new THREE.LineBasicMaterial({ color: 0xd1a35d }));
        [[-2.8, 4.6, -0.4], [2.8, 4.6, -0.4], [-2.2, 3.4, 0.6], [2.2, 3.4, 0.6]].forEach(([x, y, z]) => {
          const g = keep(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x * 0.6, y - 0.6, z), new THREE.Vector3(Math.sign(x) * 0.9, 3.2, 0)]));
          root.add(new THREE.Line(g, rm));
        });
      }
      if (L.includes("braid")) {
        const pts = []; for (let i = 0; i <= 20; i++) { const t = i / 20; pts.push(new THREE.Vector3(2.45 + Math.sin(t * 9) * 0.05, 3.3 - t * 3.25, -0.05 + t * 0.95)); }
        const tube = new THREE.Mesh(keep(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, 0.06, 6)), lam(0x1d1410));
        root.add(tube);
      }
    }

    // ---------- دوربین و حرکت ----------
    let yaw = 0, pitch = 0, dragYaw = 0, dragPitch = 0, tiltYaw = 0, dragging = false, lastX = 0, lastY = 0;
    const dist = 13.8;
    function placeCam(t) {
      const auto = calmNow ? 0 : Math.sin(t * 0.00022) * 0.26;
      const ty = dragging ? dragYaw : auto + dragYaw + tiltYaw;
      yaw += (ty - yaw) * 0.08;
      pitch += (dragPitch - pitch) * 0.08;
      if (!dragging) { dragYaw *= 0.985; dragPitch *= 0.97; }
      const el2 = 0.28 + pitch;
      camera.position.set(Math.sin(yaw) * dist * Math.cos(el2), target.y + Math.sin(el2) * dist, Math.cos(yaw) * dist * Math.cos(el2) - 0.4);
      camera.lookAt(target);
    }
    const cvs = renderer.domElement;
    cvs.addEventListener("pointerdown", (e) => { dragging = true; lastX = e.clientX; lastY = e.clientY; dragYaw = yaw; cvs.setPointerCapture?.(e.pointerId); });
    cvs.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      dragYaw = Math.max(-0.75, Math.min(0.75, dragYaw - (e.clientX - lastX) * 0.006));
      dragPitch = Math.max(-0.18, Math.min(0.32, dragPitch + (e.clientY - lastY) * 0.003));
      lastX = e.clientX; lastY = e.clientY;
      if (calmNow) frame(performance.now(), true);
    });
    const up = () => { dragging = false; };
    cvs.addEventListener("pointerup", up); cvs.addEventListener("pointercancel", up);
    const onTilt = (e) => { if (e.gamma != null) tiltYaw = Math.max(-0.4, Math.min(0.4, -e.gamma / 90)); };
    window.addEventListener("deviceorientation", onTilt);

    // ---------- حلقه‌ی نمایش ----------
    const t0 = performance.now();
    let raf = 0, dead = false, last = 0, hiddenAt = 0, napping = false;
    const onWake = () => { if (napping && !dead) { napping = false; raf = requestAnimationFrame(frame); } };
    window.addEventListener("kalame-wake", onWake);
    const tmpM = new THREE.Matrix4();
    function frame(now, force) {
      if (dead) return;
      if (!el.isConnected || !cvs.isConnected) return dispose();
      raf = requestAnimationFrame(frame);
      if (!force && now - last < 30) return; // حدود ۳۰ فریم
      // پنهان ماندن طولانی (رفتن به صفحه‌ی بازی): بافت‌ها و WebGL آزاد می‌شوند؛ با برگشتن به منو دوباره ساخته می‌شود
      if (!force && el.offsetParent === null) { hiddenAt = hiddenAt || now; if (now - hiddenAt > 4000) { cancelAnimationFrame(raf); (window.requestIdleCallback || setTimeout)(dispose); } return; }
      hiddenAt = 0;
      if (!force && !dragging && !fades.length && document.documentElement.dataset.rest) { napping = true; cancelAnimationFrame(raf); return; } // استراحت (feel.js): صحنه ساکن و حلقه خاموش تا لمس بعدی
      last = now;
      const t = now - t0, s = t / 1000;
      placeCam(now);
      // بخش تازه: از طرح قلم به رنگ
      fades.forEach((f) => {
        const k = calmNow ? 1 : Math.max(0, Math.min(1, (t - 500) / 1300));
        const e = 1 - Math.pow(1 - k, 3);
        f.obj.traverse((m) => { if (m.material) (Array.isArray(m.material) ? m.material : [m.material]).forEach((mt) => { mt.opacity = (mt.userData.baseOp ?? 1) * e; if (k >= 1) mt.transparent = mt.userData.wasT; }); });
        f.sk.traverse((m) => { if (m.material) m.material.opacity = (m.isLine || m.isLineSegments ? 0.55 : 0.55) * (1 - e); });
        f.sk.visible = k < 1;
        f.obj.position.y = f.y - (1 - e) * 0.35;
        f.done = k >= 1;
      });
      if (fades.length && fades.every((f) => f.done)) fades.length = 0;
      if (!calmNow) {
        anims.forEach((o) => {
          const a = o.userData.anim;
          if (!a) return;
          const base = o.userData.baseY ?? (o.userData.baseY = o.position.y);
          if (a === "fly") { o.position.y = base + Math.sin(s * 1.6 + o.position.x) * 0.18; o.children[0].scale.y = 1 + Math.sin(s * 3 + o.position.x) * 0.04; }
          else if (a === "float") o.position.y = base + Math.sin(s * 1.2) * 0.12;
          else if (a === "ride") o.position.y = base + Math.abs(Math.sin(s * 3.2)) * 0.12;
        });
        if (alive) life.forEach((m) => {
          if (m.userData.flame !== undefined) { const p = m.userData.flame; m.scale.y = (m.userData.sy ?? (m.userData.sy = m.scale.y)) * (1 + Math.sin(s * 9 + p) * 0.12 + Math.sin(s * 13 + p * 2) * 0.06); m.scale.x = m.userData.sy * (1 + Math.sin(s * 7 + p) * 0.06); }
          else if (m.name === "cloth") { const pos = m.geometry.attributes.position; for (let i = 0; i < pos.count; i++) { const x = pos.getX(i); pos.setZ(i, Math.sin(x * 3 + s * 3) * 0.12 * (x + 0.75)); } pos.needsUpdate = true; }
          else if (m.userData.drift) { m.position.x += m.userData.drift * 0.03; if (m.position.x > 10) m.position.x = -10; }
          else if (m.userData.bird !== undefined) { const i = m.userData.bird; m.position.x += 0.02; if (m.position.x > 9) m.position.x = -9; m.position.y += Math.sin(s * 2 + i) * 0.004; m.scale.y = 0.6 + Math.abs(Math.sin(s * 8 + i)) * 0.6; }
          else if (m.isInstancedMesh && m.userData.parts) {
            m.userData.parts.forEach((p, i) => {
              if (m.userData.kind === "fall") { p.y -= p.v * 0.02; p.x += Math.sin(s + p.p) * 0.01; if (p.y < 0.1) p.y = 5.5; }
              else if (m.userData.kind === "rise") { p.y += p.v * 0.012; if (p.y > 6) p.y = 0.2; }
              else { p.x += p.v * 0.02; if (p.x > 8) p.x = -8; }
              tmpM.makeTranslation(p.x, p.y + (m.userData.kind === "rise" ? Math.sin(s * 2 + p.p) * 0.05 : 0), p.z);
              m.setMatrixAt(i, tmpM);
            });
            m.instanceMatrix.needsUpdate = true;
          }
        });
        if (alive) root.traverse((m) => {
          if (m.name === "wheel") m.rotation.z = -s * 0.8;
          else if (m.userData.glowfruit !== undefined) m.scale.setScalar(1 + Math.sin(s * 3 + m.userData.glowfruit) * 0.25);
        });
        root.children.forEach((o) => { if (o.userData.anim === "bob") o.position.y = Math.sin(s * 1.5) * 0.06; });
        if (alive && st.life.includes("lift")) root.traverse((m) => { if (m.name === "lid") m.position.set(0.9 + Math.sin(s * 0.6) * 0.05, 0.85 + 0.6, 0.2); });
      }
      renderer.render(scene, camera);
    }
    frame(performance.now(), true); // خودش فریم بعدی را می‌خواهد؛ یک rAF جدا اینجا دو حلقه‌ی هم‌زمان می‌ساخت

    function dispose() {
      if (dead) return;
      dead = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("deviceorientation", onTilt);
      window.removeEventListener("kalame-wake", onWake);
      disposables.forEach((d) => d.dispose && d.dispose());
      renderer.dispose();
      renderer.forceContextLoss?.();
      cvs.remove();
    }
    return { dispose };
  }

  // اگر WebGL نبود: یک نگاره‌ی تخت از همان پیکره‌ها
  function flat(el, opts) {
    const st = storyOf(opts.level), sky = SKY[st.sky];
    const W = el.clientWidth || 320, H = el.clientHeight || Math.round(W * 0.62), r = Math.min(window.devicePixelRatio || 1, 2);
    const c = document.createElement("canvas");
    c.width = W * r; c.height = H * r; c.className = "shn-canvas";
    const x = c.getContext("2d");
    x.drawImage(skyCanvas(sky), 0, 0, c.width, c.height * 0.7);
    x.drawImage(groundCanvas(GROUND[st.ground], 3), 0, c.height * 0.62, c.width, c.height * 0.38);
    const put = (spec, sketch) => {
      if (!spec.fig) return;
      const img = A.canvasOf(spec.fig, sketch, 4), k = (0.36 * c.height * (spec.s || 1)) / 400;
      const w = img.width * k, h = img.height * k;
      x.save(); x.globalAlpha = sketch ? 0.6 : 1;
      x.translate(c.width / 2 + (spec.x * c.width) / 16, c.height * 0.92 - ((spec.y || 0) * c.height) / 9 - h);
      if (spec.f) x.scale(-1, 1);
      x.drawImage(img, -w / 2, 0, w, h);
      x.restore();
    };
    st.a.slice(1).forEach((s) => put(s, opts.count <= 3));
    st.b.slice(1).forEach((s) => put(s, opts.count <= 4));
    el.appendChild(c);
    return { dispose: () => c.remove() };
  }

  // جای نگاره را آماده کن و وقتی three.js رسید صحنه را بساز
  function show(el, opts) {
    el.classList.add("shn-stage");
    if (!webgl()) return flat(el, opts);
    let handle = null, gone = false;
    // ساختن صحنه چند صدم ثانیه کار دارد؛ بعد از کشیده شدن صفحه (مثلاً کارت پایان مرحله) انجام می‌شود تا صفحه گیر نکند
    ready().then(() => new Promise((r) => requestAnimationFrame(() => setTimeout(r, 0)))).then(() => { if (!gone && el.isConnected) handle = mount(el, opts); }).catch((e) => {
      console.warn("shahnameh", e);
      if (gone || !el.isConnected) return;
      el.querySelectorAll("canvas").forEach((c) => c.remove());
      handle = flat(el, opts);
    });
    return { dispose: () => { gone = true; handle && handle.dispose(); } };
  }

  window.SHN = { PARTS, STORIES, storyOf, storyNo, partName, show, ready, _mount: mount };
})();
