// منظره‌ی هر شهر در ظاهر «کاروان ابریشم»: آسمان و زمینه‌ی منطقه، و نماد خود شهر در وسط.
// نقاشی ۱۲۰۰×۸۰۰ است و از پایین تراز می‌شود: روی گوشی فقط وسطش (نماد شهر) دیده می‌شود،
// روی صفحه‌ی پهن کامپیوتر، دو طرفش هم (خانه‌ها و درخت‌های همان منطقه).
const CaravanScenes = (function () {
  "use strict";

  const W = 1200, B = 520; // پهنای نقاشی و خط زمین
  const C = {
    adobe: "#c98f5c", adobeLight: "#d39a66", brick: "#b98250", brickDark: "#8a5a33", wood: "#7d5130",
    cream: "#e3c9a0", stone: "#a89a8a", white: "#f4efe4", turq: "#2fa4a9", lapis: "#1d4e89",
    gold: "#e0b04a", water: "#6fb3c2", leaf: "#4f7a52", snow: "#fbfbf7",
  };

  // ---------- ابزار کشیدن ----------

  const each = (list, fn) => list.map(fn).join("");
  const r = (x, y, w, h, fill, more = "") => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"${more}/>`;
  const p = (d, fill, more = "") => `<path d="${d}" fill="${fill}"${more}/>`;
  const line = (x1, y1, x2, y2, color, width) =>
    `<path d="M${x1} ${y1} L${x2} ${y2}" stroke="${color}" stroke-width="${width}" fill="none" stroke-linecap="round"/>`;

  // طاق جناغی ایرانی، از پایین (base) به بالا
  function arch(x, base, w, h) {
    const top = base - h, k = w * 0.65, cx = x + w / 2;
    return `M${x} ${base}V${top + k}C${x} ${top + k * 0.35} ${cx - w * 0.12} ${top + k * 0.12} ${cx} ${top}` +
      `C${cx + w * 0.12} ${top + k * 0.12} ${x + w} ${top + k * 0.35} ${x + w} ${top + k}V${base}Z`;
  }
  // طاق گرد
  const roundArch = (x, base, w, h) => `M${x} ${base}V${base - h + w / 2}A${w / 2} ${w / 2} 0 0 1 ${x + w} ${base - h + w / 2}V${base}Z`;

  function dome(cx, base, w, h, color) {
    return p(`M${cx - w} ${base}C${cx - w} ${base - h * 0.75} ${cx - w * 0.2} ${base - h * 0.8} ${cx} ${base - h}` +
      `C${cx + w * 0.2} ${base - h * 0.8} ${cx + w} ${base - h * 0.75} ${cx + w} ${base}Z`, color) +
      p(`M${cx + w * 0.15} ${base}C${cx + w * 0.3} ${base - h * 0.6} ${cx + w * 0.15} ${base - h * 0.85} ${cx} ${base - h}` +
        `C${cx + w * 0.2} ${base - h * 0.8} ${cx + w} ${base - h * 0.75} ${cx + w} ${base}Z`, "#000", ' opacity=".14"') +
      p(`M${cx - w * 0.75} ${base - h * 0.35}C${cx - w * 0.7} ${base - h * 0.7} ${cx - w * 0.35} ${base - h * 0.8} ${cx - w * 0.1} ${base - h * 0.9}`, "none", ' stroke="#fff" stroke-width="3" opacity=".25" stroke-linecap="round"') +
      r(cx - 1.5, base - h - 16, 3, 16, C.gold);
  }

  // مناره: بدنه، دو نوار کاشی، بالکن و کلاهک
  function minaret(cx, base, h, body = C.cream, cap = C.turq, w = 16) {
    const x = cx - w / 2, top = base - h;
    return r(x, top, w, h, body) + shade(x, top, w, h) + r(x, top + h * 0.35, w, 6, cap) + r(x, top + h * 0.6, w, 5, cap) +
      r(x - 5, top, w + 10, 8, cap) + r(x + 2, top - 30, w - 4, 30, body) +
      p(`M${x + 1} ${top - 30}L${cx} ${top - 52}L${x + w - 1} ${top - 30}Z`, cap);
  }

  // برج استوانه‌ای با کلاه مخروطی
  function tower(cx, base, w, h, body, cap, capH) {
    return r(cx - w / 2, base - h, w, h, body) +
      each([0.25, 0.5, 0.75], (f) => r(cx - w / 2 + w * f - 1.5, base - h, 3, h, "#000", ' opacity=".1"')) +
      p(`M${cx - w / 2 - 4} ${base - h}L${cx} ${base - h - capH}L${cx + w / 2 + 4} ${base - h}Z`, cap);
  }

  // سایه‌ی طرف راست هر ساختمان، تا حجم داشته باشد
  const shade = (x, top, w, h) => r(x + w * 0.68, top, w * 0.32, h, "#000", ' opacity=".1"');

  function house(x, base, w, h, color, roof = "#000") {
    return r(x, base - h, w, h, color) + shade(x, base - h, w, h) + r(x, base - h, w, 5, roof, ' opacity=".18"') +
      r(x + w / 2 - 7, base - 22, 14, 22, C.wood) +
      (h > 45 ? r(x + 10, base - h + 16, 10, 12, C.wood, ' opacity=".7"') + r(x + w - 20, base - h + 16, 10, 12, C.wood, ' opacity=".7"') : "");
  }

  function gableHouse(x, base, w, h, wall, roof) {
    return r(x, base - h, w, h, wall) + shade(x, base - h, w, h) + p(`M${x - 8} ${base - h}L${x + w / 2} ${base - h - w * 0.35}L${x + w + 8} ${base - h}Z`, roof) +
      r(x + 10, base - h + 12, 12, 14, C.wood) + r(x + w - 22, base - h + 12, 12, 14, C.wood) + r(x + w / 2 - 7, base - 22, 14, 22, C.wood);
  }

  // بادگیر
  function badgir(x, base, h) {
    return r(x, base - h, 18, h, C.brick) + shade(x, base - h, 18, h) + r(x - 3, base - h - 7, 24, 7, "#a8713f") +
      each([3, 8, 13], (d) => r(x + d, base - h + 8, 2, 26, C.brickDark));
  }

  const cypress = (x, base, h) => r(x - 2, base - 10, 4, 10, "#5a4030") +
    `<ellipse cx="${x}" cy="${base - h / 2 - 6}" rx="${h * 0.12}" ry="${h / 2}" fill="#3f6b48"/>`;
  const poplar = (x, base, h) => `<ellipse cx="${x}" cy="${base - h / 2}" rx="${h * 0.09}" ry="${h / 2}" fill="#7a9a52"/>`;
  function tree(x, base, rad, color = "#5b8a55", fruit) {
    const dots = fruit ? each([[-0.4, -0.3], [0.35, -0.1], [-0.1, 0.25], [0.3, -0.55], [-0.5, 0.15]], ([a, b]) =>
      `<circle cx="${x + a * rad}" cy="${base - rad * 1.5 + b * rad}" r="${rad * 0.12}" fill="${fruit}"/>`) : "";
    return r(x - 3, base - rad * 0.9, 6, rad * 0.9, "#7d5a3a") + `<circle cx="${x}" cy="${base - rad * 1.5}" r="${rad}" fill="${color}"/>` + dots;
  }

  function palm(x, base, h, lean, dates) {
    const tx = x + lean, ty = base - h;
    const fronds = each([-160, -125, -90, -55, -20, 15], (a) =>
      `<path d="M0 0 Q22 -12 46 5 Q22 -2 0 0Z" fill="${C.leaf}" transform="translate(${tx} ${ty}) rotate(${a})"/>`);
    return `<path d="M${x} ${base} Q${x + lean * 0.2} ${base - h * 0.6} ${tx} ${ty}" stroke="#8a6440" stroke-width="8" fill="none" stroke-linecap="round"/>` +
      fronds + `<circle cx="${tx}" cy="${ty + 4}" r="5" fill="#a8713f"/>` +
      (dates ? `<circle cx="${tx - 6}" cy="${ty + 12}" r="6" fill="#c46a2a"/><circle cx="${tx + 7}" cy="${ty + 13}" r="5" fill="#d9822b"/>` : "");
  }

  function water(y, h, color = C.water) {
    return r(0, y, W, h, color) + each([0.3, 0.65], (f, i) =>
      each([80, 330, 560, 790, 1020], (x) => `<path d="M${x + i * 60} ${y + h * f} q14 -5 28 0" stroke="#fdf6e3" stroke-width="2" fill="none" opacity=".6"/>`));
  }

  // کوه با کلاهک برفی؛ peaks: [x, y] از چپ به راست
  function mountain(peaks, color, snowy) {
    const d = `M${peaks[0][0] - 160} ${B}` + peaks.map(([x, y]) => `L${x} ${y}`).join("") + `L${peaks[peaks.length - 1][0] + 160} ${B}Z`;
    return p(d, color) + (snowy ? each(peaks.filter(([, y]) => y < B - 180), ([x, y]) =>
      p(`M${x} ${y}L${x - 30} ${y + 34}L${x - 12} ${y + 26}L${x} ${y + 40}L${x + 14} ${y + 24}L${x + 30} ${y + 34}Z`, C.snow)) : "");
  }

  // پل با طاق‌های پشت سر هم؛ زیر طاق‌ها آب دیده می‌شود
  function bridge(x0, x1, top, n, color, round) {
    const span = (x1 - x0) / n, w = span * 0.7;
    return r(x0, top, x1 - x0, B + 30 - top, color) + r(x0 - 6, top - 8, x1 - x0 + 12, 10, "#000", ' opacity=".15"') +
      each([...Array(n).keys()], (i) => p((round ? roundArch : arch)(x0 + i * span + (span - w) / 2, B + 30, w, (B + 30 - top) * 0.72), C.water));
  }

  // شترهای کاروان (همان شتر Noto که در نقشه هست)
  const camels = (x, base, size, count = 3) => each([...Array(count).keys()], (i) =>
    `<image href="themes/caravan/camel.svg" x="${x + i * size * 0.82}" y="${base - size * 0.95 + (i % 2) * 3}" width="${size}" height="${size}"/>`);

  // ---------- منطقه‌ها: آسمان، دوردست، خانه‌های دو طرف و زمین ----------

  // آسمان نقاشی‌شده: رنگ‌های چندلایه، هاله‌ی بزرگ خورشید، پرتوهای کم‌رنگ و ابرهای سایه‌دار
  function sky(id, top, bottom, sun, sx, sy) {
    const cloud = (x, y, s) => `<g class="cloud"><g transform="translate(${x} ${y}) scale(${s})">` +
      `<ellipse cx="6" cy="6" rx="66" ry="15" fill="url(#${id}-cl)" opacity=".55"/>` +
      `<ellipse cx="0" cy="0" rx="60" ry="17" fill="url(#${id}-cl)"/><ellipse cx="34" cy="-11" rx="36" ry="16" fill="url(#${id}-cl)"/>` +
      `<ellipse cx="-22" cy="-6" rx="26" ry="12" fill="url(#${id}-cl)"/></g></g>`;
    const rays = each([-28, -12, 4, 20, 36], (a, i) =>
      `<path d="M${sx} ${sy}L${sx - 900} ${sy + 700 + a * 6}L${sx - 900} ${sy + 760 + a * 6}Z" fill="${sun}" opacity="${[0.07, 0.05, 0.08, 0.04, 0.06][i]}" transform="rotate(${a} ${sx} ${sy})"/>`);
    return `<defs>
        <linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="${top}"/><stop offset=".45" stop-color="${bottom}"/>
          <stop offset=".64" stop-color="${sun}"/><stop offset="1" stop-color="${bottom}"/></linearGradient>
        <radialGradient id="${id}-halo"><stop offset="0" stop-color="${sun}" stop-opacity=".9"/>
          <stop offset=".25" stop-color="${sun}" stop-opacity=".45"/><stop offset="1" stop-color="${sun}" stop-opacity="0"/></radialGradient>
        <radialGradient id="${id}-disc" cx=".45" cy=".42"><stop offset="0" stop-color="#fffdf4"/><stop offset=".7" stop-color="${sun}"/>
          <stop offset="1" stop-color="${sun}" stop-opacity=".6"/></radialGradient>
        <linearGradient id="${id}-cl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".95"/>
          <stop offset="1" stop-color="${top}" stop-opacity=".5"/></linearGradient>
        <linearGradient id="${id}-haze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${bottom}" stop-opacity="0"/>
          <stop offset="1" stop-color="${sun}" stop-opacity=".6"/></linearGradient>
        <linearGradient id="${id}-near" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${bottom}" stop-opacity="0"/>
          <stop offset="1" stop-color="${bottom}" stop-opacity=".28"/></linearGradient>
        <radialGradient id="${id}-light" cx="${sx / W}" cy="${sy / 800}" r="1.1"><stop offset="0" stop-color="#fff2d4" stop-opacity=".5"/>
          <stop offset=".45" stop-color="#fff2d4" stop-opacity="0"/><stop offset="1" stop-color="#2a1608" stop-opacity=".35"/></radialGradient>
        <linearGradient id="${id}-shade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a1608" stop-opacity=".35"/>
          <stop offset="1" stop-color="#2a1608" stop-opacity="0"/></linearGradient>
      </defs>
      ${r(0, 0, W, 800, `url(#${id})`)}
      <circle cx="${sx}" cy="${sy}" r="340" fill="url(#${id}-halo)"/>
      ${rays}
      <circle class="sun" cx="${sx}" cy="${sy}" r="56" fill="url(#${id}-disc)"/>
      ${cloud(150, 170, 1)}${cloud(620, 240, 0.8)}${cloud(980, 150, 1.1)}`;
  }

  // رشته‌کوه یا تپه‌های خیلی دور، کم‌رنگ در مه
  function farRidge(color) {
    let d = `M0 ${B - 70}`;
    for (let x = 0; x <= W; x += 60) d += `L${x} ${B - 70 - Math.round(40 + 35 * Math.sin(x / 97) + 20 * Math.sin(x / 41))}`;
    return p(d + `L${W} ${B}H0Z`, color, ' opacity=".35"');
  }

  // موج‌های ریز روی زمین (ماسه یا خاک)
  function ripples(y0, color) {
    return each([0, 1, 2, 3, 4, 5], (i) => {
      const y = y0 + 22 + i * 26 + (i % 2) * 6;
      return `<path d="M${-40 + (i % 3) * 70} ${y}q90 -10 180 0t180 0t180 0t180 0t180 0t180 0t180 0" stroke="${color}" stroke-width="${2 - i * 0.15}" fill="none" opacity="${0.22 - i * 0.02}"/>`;
    });
  }

  // خانه‌های دو طرف نقاشی (روی گوشی دیده نمی‌شوند)
  const sides = (fn) => fn(20) + fn(820);

  const REGIONS = {
    desert: {
      sky: ["#f4a96b", "#fde7c2", "#fff3d6", 860, 300],
      far: () => p(`M0 ${B - 20}Q150 ${B - 70} 300 ${B - 30}T600 ${B - 40}T900 ${B - 30}T1200 ${B - 50}V${B + 20}H0Z`, "#e8bf86"),
      side: (x) => house(x, B, 100, 55, C.adobe) + badgir(x + 112, B, 125) + house(x + 100, B, 70, 75, C.adobeLight) +
        dome(x + 230, B - 50, 30, 40, C.adobe) + house(x + 180, B, 100, 50, C.adobe) + badgir(x + 300, B, 95) + house(x + 280, B, 80, 62, C.adobeLight),
      ground: ["#dcaa6c", "#cf9a5c"],
    },
    domes: {
      sky: ["#8fcfd8", "#f6e7c9", "#fffaf0", 360, 250],
      far: () => p(`M0 ${B - 10}Q200 ${B - 50} 450 ${B - 25}T900 ${B - 30}T1200 ${B - 20}V${B + 20}H0Z`, "#cdb48a"),
      side: (x) => house(x, B, 110, 60, "#e3c9a0") + cypress(x + 125, B, 100) + r(x + 140, B - 70, 80, 70, "#d9bf92") +
        dome(x + 180, B - 70, 40, 56, C.turq) + tree(x + 250, B, 24) + house(x + 280, B, 90, 48, "#e8d6b0"),
      ground: ["#cdb48a", "#bea477"],
    },
    mountains: {
      sky: ["#6f5a9a", "#f5b98f", "#ffe1c2", 780, 320],
      far: () => mountain([[120, B - 210], [300, B - 120], [420, B - 250], [560, B - 150], [700, B - 230], [880, B - 140], [1050, B - 260]], "#8a6f9e", true),
      side: (x) => each([0, 1, 2, 3], (i) => house(x + 20 + i * 75, B, 64, 34 + i * 7, "#d9a67a")) + poplar(x + 330, B, 110) + poplar(x + 5, B, 90),
      ground: ["#7a6688", "#5e4a72"],
    },
    north: {
      sky: ["#a9d3c4", "#f3efe2", "#fffdf2", 860, 240],
      far: () => p(`M0 ${B - 40}Q200 ${B - 170} 420 ${B - 90}T850 ${B - 120}T1200 ${B - 70}V${B + 20}H0Z`, "#6fa27a") +
        each([60, 140, 230, 320, 900, 990, 1080, 1160], (x, i) => `<circle cx="${x}" cy="${B - 70 - (i % 3) * 18}" r="34" fill="#4f8a5d"/>`),
      side: (x) => gableHouse(x + 10, B, 80, 54, "#efe3c8", "#a0522d") + tree(x + 130, B, 28, "#3f7a4e") +
        gableHouse(x + 180, B, 90, 60, "#e2b45a", "#7d5a3a") + tree(x + 320, B, 24, "#3f7a4e"),
      ground: ["#4f8a5d", "#3f7a4e"],
    },
    south: {
      sky: ["#7cc6e0", "#fde9c8", "#fff6dc", 860, 300],
      far: () => p(`M0 ${B - 62}Q90 ${B - 80} 180 ${B - 64}T360 ${B - 66}V${B - 50}H0Z`, "#9db7a8", ' opacity=".7"') + water(B - 55, 70, C.turq),
      side: (x) => house(x, B, 90, 58, "#efe6d2") + badgir(x + 60, B - 58, 50) + palm(x + 120, B + 10, 130, 18) +
        house(x + 160, B, 110, 46, "#e8dcc4") + palm(x + 300, B + 10, 110, -16),
      ground: ["#e9cf9c", "#d9b77e"],
    },
  };

  // ---------- نماد هر شهر (وسط نقاشی، حدود x=۴۲۰ تا ۷۸۰) ----------
  // هر نماد یا یک رشته است، یا { back, front }: back پشت خانه‌های دو طرف کشیده می‌شود (کوه، دریا)

  const LANDMARKS = {
    // مجموعه‌ی گنجعلی‌خان
    "کرمان": () => r(450, B - 200, 300, 200, C.cream) + r(450, B - 212, 300, 14, C.turq) +
      p(arch(530, B, 140, 190), C.turq) + p(arch(545, B, 110, 172), C.lapis) + p(arch(562, B, 76, 130), C.turq, ' opacity=".5"') +
      each([465, 495, 675, 705], (x) => p(arch(x, B - 105, 26, 70), C.brick) + p(arch(x, B, 26, 82), C.brick)),

    // باغ پسته و خانه‌ی کاه‌گلی
    "رفسنجان": () => house(530, B, 150, 72, C.adobeLight) + badgir(570, B - 72, 70) + dome(650, B - 72, 26, 36, C.adobe) +
      each([[410, B + 8], [470, B + 30], [740, B + 10], [800, B + 32], [440, B + 60], [770, B + 62]], ([x, y]) =>
        r(x - 3, y - 22, 6, 22, "#7d5a3a") + `<ellipse cx="${x}" cy="${y - 34}" rx="28" ry="20" fill="#7c9a55"/>` +
        each([[-12, -38], [8, -42], [14, -30], [-4, -28]], ([a, b]) => `<circle cx="${x + a}" cy="${y + b}" r="4" fill="#e7a29a"/>`)),

    // تکیه‌ی امیرچخماق
    "یزد": () => r(440, B - 210, 320, 210, "#d6a46a") + r(440, B - 218, 320, 8, C.turq) +
      each([0, 1, 2], (row) => each([0, 1, 2, 3, 4, 5, 6], (col) =>
        col === 3 && row < 2 ? "" : p(arch(452 + col * 44, B - 8 - row * 68, 30, 54), "#7d5130"))) +
      p(arch(578, B, 44, 128), "#5e3b20") +
      minaret(458, B - 210, 150, "#d6a46a", C.turq, 22) + minaret(742, B - 210, 150, "#d6a46a", C.turq, 22),

    // قلعه‌ی نارین و یخچال
    "میبد": () => p(`M380 ${B}Q470 ${B - 110} 600 ${B - 120}Q720 ${B - 110} 800 ${B}Z`, C.adobe) +
      r(500, B - 220, 200, 112, C.brick) + r(488, B - 250, 32, 140, "#a8713f") + r(680, B - 240, 32, 130, "#a8713f") + r(580, B - 282, 40, 80, C.brick) +
      each([500, 520, 540, 560, 620, 640, 660], (x) => r(x, B - 228, 10, 8, C.brick)) +
      each([530, 600, 650], (x) => r(x, B - 190, 8, 14, "#5e3b20")) +
      p(`M715 ${B}Q755 ${B - 170} 790 ${B - 195}Q825 ${B - 170} 865 ${B}Z`, C.adobeLight) +
      each([1, 2, 3, 4], (i) => p(`M${715 + i * 10} ${B - i * 40}Q790 ${B - i * 40 - 12} ${865 - i * 10} ${B - i * 40}`, "none", ` stroke="#a8713f" stroke-width="3"`)),

    // مسجد جامع و مناره‌ی آجری
    "نائین": () => r(460, B - 110, 270, 110, C.adobeLight) + dome(690, B - 110, 44, 52, C.adobe) +
      each([480, 530, 580, 630], (x) => p(arch(x, B, 32, 70), "#7d5130")) +
      r(588, B - 340, 24, 230, C.brick) + each([0, 1, 2, 3], (i) => r(588, B - 320 + i * 55, 24, 6, C.brickDark)) +
      r(582, B - 350, 36, 12, "#a8713f") + p(`M592 ${B - 350}L600 ${B - 372}L608 ${B - 350}Z`, "#a8713f"),

    // سی‌وسه‌پل و گنبد شیخ لطف‌الله
    "اصفهان": () => r(500, B - 150, 200, 110, "#e3c9a0") + r(545, B - 190, 110, 40, C.turq) +
      dome(600, B - 190, 62, 95, "#e9d3a6") + r(540, B - 200, 120, 6, C.lapis) +
      water(B - 40, 90) + r(320, B - 112, 560, 22, "#d6a46a") + each([...Array(14).keys()], (i) => p(arch(328 + i * 39.5, B - 92, 22, 20), "#8a5a33")) +
      bridge(320, 880, B - 90, 10, "#d6a46a", false),

    // آرامگاه مخروطی و مناره، کوه کرکس پشت
    "نطنز": () => ({
      back: mountain([[420, B - 200], [620, B - 240], [800, B - 160]], "#b9a58a", true),
      front: r(470, B - 120, 90, 120, C.cream) + p(arch(487, B, 56, 96), C.lapis) +
        r(560, B - 150, 80, 150, C.cream) + p(`M552 ${B - 150}L600 ${B - 265}L648 ${B - 150}Z`, C.turq) +
        each([573, 587, 613, 627], (x) => line(x, B - 150, 600, B - 262, "#1d7d86", 2)) + minaret(690, B, 220, "#c9a77a", C.turq, 16),
    }),

    // باغ فین
    "کاشان": () => r(500, B - 150, 200, 150, "#e8d6b0") + r(494, B - 158, 212, 8, C.brick) + dome(600, B - 158, 32, 42, C.turq) +
      p(arch(565, B, 70, 120), "#2c5f8a") + each([512, 538, 636, 662], (x) => p(arch(x, B, 24, 70), "#8a6440")) +
      cypress(430, B, 170) + cypress(470, B, 140) + cypress(730, B, 140) + cypress(770, B, 170) +
      p(`M565 ${B + 6}L635 ${B + 6}L690 ${B + 70}L510 ${B + 70}Z`, "#5fb7c0") + r(596, B + 6, 8, 64, "#fdf6e3", ' opacity=".5"'),

    // حرم حضرت معصومه
    "قم": () => r(540, B - 235, 120, 64, C.turq) + dome(600, B - 235, 70, 112, "#efc23e") +
      r(495, B - 175, 210, 175, C.cream) + r(495, B - 183, 210, 10, C.turq) + p(arch(540, B, 120, 160), "#e0b04a") + p(arch(560, B, 80, 120), C.lapis) +
      minaret(468, B, 300, C.turq, C.gold, 22) + minaret(732, B, 300, C.turq, C.gold, 22),

    // برج آزادی و برج میلاد، البرز پشت
    "تهران": () => p(`M488 ${B}C528 ${B - 110} 558 ${B - 190} 574 ${B - 248}L626 ${B - 248}C642 ${B - 190} 672 ${B - 110} 712 ${B}Z`, "#ebe4d4") +
      r(562, B - 272, 76, 26, "#ebe4d4") + p(arch(558, B, 84, 142), "#a99bbd") +
      each([0, 1, 2], (i) => p(arch(578 + i * 16, B - 160, 10, 26), "#a99bbd")) +
      line(520, B - 70, 562, B - 40, "#cfc6b4", 2) + line(680, B - 70, 638, B - 40, "#cfc6b4", 2) +
      r(786, B - 330, 9, 330, "#d7d0e2") + p(`M758 ${B - 300}Q790 ${B - 345} 822 ${B - 300}Q790 ${B - 280} 758 ${B - 300}Z`, "#d7d0e2") +
      r(789, B - 420, 3, 90, "#d7d0e2") + p(`M770 ${B}L790 ${B - 40}L810 ${B}Z`, "#cbc3d8"),

    // دروازه‌ی کاشی‌کاری ارگ
    "سمنان": () => r(470, B - 240, 26, 240, "#d6c3a0") + r(704, B - 240, 26, 240, "#d6c3a0") +
      dome(483, B - 240, 16, 22, C.turq) + dome(717, B - 240, 16, 22, C.turq) +
      r(492, B - 200, 216, 200, "#d6c3a0") + r(504, B - 190, 192, 150, C.turq) +
      each([0, 1, 2], (row) => each([0, 1, 2, 3, 4, 5], (col) => `<circle cx="${522 + col * 31}" cy="${B - 172 + row * 22}" r="5" fill="${C.gold}"/>`)) +
      p(arch(560, B, 80, 112), "#5e3b20"),

    // برج پیر علمدار و مسجد تاریخانه
    "دامغان": () => r(430, B - 130, 210, 130, C.adobe) + each([0, 1, 2, 3], (i) => p(roundArch(445 + i * 48, B, 34, 96), "#7d5130")) +
      r(640, B - 260, 90, 260, C.brick) + dome(685, B - 260, 45, 40, "#a8713f") +
      each([0, 1, 2], (i) => r(640, B - 240 + i * 70, 90, 9, C.brickDark)),

    // برج کاشانه‌ی بسطام
    "شاهرود": () => r(440, B - 140, 120, 140, C.cream) + p(arch(468, B, 64, 112), C.lapis) +
      tower(600, B, 90, 240, C.brick, C.brickDark, 80) + r(645, B - 100, 140, 100, C.adobeLight),

    // مناره‌ی خسروگرد و کاروانسرا
    "سبزوار": () => r(380, B - 62, 170, 62, C.adobe) + r(650, B - 62, 190, 62, C.adobe) +
      each([400, 450, 500, 680, 730, 780], (x) => p(arch(x, B, 26, 44), "#7d5130")) +
      p(`M578 ${B}L590 ${B - 380}L610 ${B - 380}L622 ${B}Z`, C.brick) +
      each([0, 1, 2, 3, 4], (i) => r(580 + i * 2, B - 350 + i * 70, 40 - i * 4, 8, C.brickDark)) +
      r(584, B - 398, 32, 18, "#a8713f") + camels(380, B + 50, 70),

    // آرامگاه خیام
    "نیشابور": () => tree(440, B, 30) + tree(770, B, 30) + r(500, B - 12, 200, 12, "#d9cfc0") +
      p(`M520 ${B - 12}L590 ${B - 250}L610 ${B - 250}L680 ${B - 12}Z`, "#e3efe9") +
      each([0, 1, 2, 3, 4, 5, 6], (i) => line(520 + i * 26.7, B - 12, 590 + (6 - i) * 3.33, B - 250, C.turq, 2.5) +
        line(520 + i * 26.7, B - 12, 590 + i * 3.33, B - 250, C.turq, 2.5)) +
      r(540, B + 14, 120, 26, "#5fb7c0"),

    // حرم امام رضا
    "مشهد": () => r(540, B - 235, 120, 64, C.gold) + dome(600, B - 235, 72, 116, "#f2c94c") +
      r(488, B - 180, 224, 180, "#2c66a8") + p(arch(536, B, 128, 166), "#f2c94c") + p(arch(556, B, 88, 126), "#d8a531") +
      minaret(462, B, 320, "#f2c94c", C.turq, 22) + minaret(738, B, 320, "#f2c94c", C.turq, 22),

    // روستای کوهستانی و سپیدارها
    "قوچان": () => p(`M380 ${B}L600 ${B - 150}L820 ${B}Z`, "#9b8a74") +
      each([[470, B - 30], [540, B - 70], [610, B - 105], [660, B - 60], [720, B - 20], [570, B - 15]], ([x, y]) => house(x, y + 10, 60, 40, "#d9b48a")) +
      each([400, 430, 770, 800], (x, i) => poplar(x, B + 10, 140 - (i % 2) * 30)),

    // عمارت مفخم (آینه‌خانه)
    "بجنورد": () => r(480, B - 205, 240, 205, "#e8d6b0") + r(474, B - 215, 252, 12, C.brick) +
      r(500, B - 195, 60, 90, C.turq) + r(640, B - 195, 60, 90, C.turq) + p(arch(570, B - 100, 60, 95), "#cfe7ef") +
      each([520, 530, 660, 670], (x, i) => `<circle cx="${x}" cy="${B - 165 + (i % 2) * 30}" r="7" fill="${C.gold}"/>`) +
      each([490, 545, 600, 655, 710], (x) => r(x - 5, B - 100, 10, 100, "#8a5a33")) + tree(420, B, 30) + tree(780, B, 30),

    // گنبد قابوس
    "گرگان": () => p(`M430 ${B}Q600 ${B - 70} 770 ${B}Z`, "#6f9a5e") +
      p(`M560 ${B - 40}L572 ${B - 330}L628 ${B - 330}L640 ${B - 40}Z`, C.brick) +
      each([0, 1, 2, 3, 4], (i) => line(570 + i * 15, B - 40, 576 + i * 12, B - 330, C.brickDark, 3)) +
      r(570, B - 340, 60, 12, C.brickDark) + p(`M566 ${B - 340}L600 ${B - 430}L634 ${B - 340}Z`, "#a8713f"),

    // برج ساعت و درخت‌های نارنج
    "ساری": () => r(565, B - 280, 70, 280, "#f1ead8") + r(558, B - 288, 84, 10, "#c45a3a") +
      p(`M558 ${B - 288}L600 ${B - 340}L642 ${B - 288}Z`, "#7a8f6a") +
      `<circle cx="600" cy="${B - 236}" r="24" fill="#fff" stroke="#5a4030" stroke-width="3"/>` +
      line(600, B - 236, 600, B - 252, "#5a4030", 3) + line(600, B - 236, 612, B - 232, "#5a4030", 3) +
      each([585, 615], (x) => r(x - 6, B - 160, 12, 30, "#c45a3a")) + p(arch(582, B, 36, 60), C.wood) +
      tree(470, B, 34, "#3f7a4e", "#f08a24") + tree(730, B, 34, "#3f7a4e", "#f08a24"),

    // دماوند و پل آجری
    "آمل": () => ({
      back: p(`M300 ${B - 30}L560 ${B - 330}Q600 ${B - 350} 640 ${B - 330}L900 ${B - 30}Z`, "#8c8fa8") +
        p(`M518 ${B - 282}L560 ${B - 330}Q600 ${B - 350} 640 ${B - 330}L682 ${B - 282}L650 ${B - 294}L622 ${B - 268}L596 ${B - 296}L560 ${B - 272}Z`, C.snow),
      front: water(B - 6, 60) + bridge(430, 770, B - 62, 4, C.brick, false),
    }),

    // هتل قدیمی رامسر و جنگل
    "رامسر": () => ({
      back: p(`M300 ${B - 30}Q450 ${B - 230} 620 ${B - 200}T920 ${B - 40}Z`, "#3f7a4e"),
      front: r(440, B - 120, 320, 120, C.white) + r(550, B - 170, 100, 170, C.white) +
        p(`M540 ${B - 170}L600 ${B - 205}L660 ${B - 170}Z`, "#c45a3a") + r(436, B - 126, 328, 8, "#c45a3a") +
        each([0, 1, 2, 3, 4, 5, 6, 7], (i) => i === 3 || i === 4 ? "" : r(456 + i * 38, B - 100, 14, 22, "#7d9ab0") + r(456 + i * 38, B - 56, 14, 22, "#7d9ab0")) +
        each([565, 590, 610, 635], (x) => r(x, B - 150, 6, 150, "#d9d0bf")),
    }),

    // ساختمان شهرداری و باران
    "رشت": () => r(450, B - 130, 300, 130, C.white) + r(444, B - 138, 312, 10, "#c45a3a") +
      each([0, 1, 2, 3, 4, 5], (i) => r(470 + i * 46 + (i > 2 ? 30 : 0), B - 110, 16, 30, "#7d9ab0") + r(470 + i * 46 + (i > 2 ? 30 : 0), B - 60, 16, 30, "#7d9ab0")) +
      r(570, B - 270, 60, 270, C.white) + `<circle cx="600" cy="${B - 220}" r="20" fill="#fff" stroke="#5a4030" stroke-width="3"/>` +
      p(`M565 ${B - 270}Q600 ${B - 330} 635 ${B - 270}Z`, "#c45a3a") + r(598, B - 350, 4, 30, C.gold) + p(roundArch(582, B, 36, 70), C.wood) +
      each([...Array(16).keys()], (i) => line(380 + i * 30, 120 + (i % 4) * 60, 368 + i * 30, 150 + (i % 4) * 60, "#ffffff", 2)),

    // خانه‌های پلکانی
    "ماسوله": () => ({
      back: p(`M260 ${B}Q450 ${B - 280} 650 ${B - 300}Q850 ${B - 250} 960 ${B}Z`, "#6fa27a"),
      front: each([[440, 40, 0], [500, 40, 0], [560, 40, 0], [620, 40, 0], [680, 40, 0], [470, 100, 1], [530, 100, 1], [590, 100, 1], [650, 100, 1],
        [500, 160, 2], [560, 160, 2], [620, 160, 2], [540, 220, 3], [600, 220, 3]], ([x, up]) =>
        r(x, B - up - 40, 56, 40, "#e2b45a") + r(x, B - up - 44, 56, 5, "#7d5a3a") + r(x + 8, B - up - 30, 10, 14, "#5a4030") + r(x + 36, B - up - 30, 10, 14, "#5a4030")) +
        r(380, B - 12, 440, 14, "#fff", ' opacity=".4"'),
    }),

    // کاخ چهلستون قزوین
    "قزوین": () => r(500, B - 92, 200, 92, "#e8d6b0") + r(520, B - 172, 160, 80, "#e8d6b0") +
      r(510, B - 180, 180, 9, C.brick) + r(494, B - 98, 212, 8, C.brick) + dome(600, B - 180, 26, 32, C.turq) +
      each([0, 1, 2, 3, 4, 5], (i) => r(512 + i * 34, B - 92, 7, 92, C.brickDark)) +
      each([0, 1, 2, 3, 4], (i) => r(532 + i * 33, B - 172, 6, 80, C.brickDark)) +
      r(470, B + 14, 260, 24, "#5fb7c0") + tree(430, B, 30) + tree(770, B, 30),

    // گنبد سلطانیه
    "سلطانیه": () => minaret(530, B - 200, 70, C.adobe, C.turq, 12) + minaret(670, B - 200, 70, C.adobe, C.turq, 12) +
      p(`M480 ${B - 196}C480 ${B - 330} 540 ${B - 365} 600 ${B - 372}C660 ${B - 365} 720 ${B - 330} 720 ${B - 196}Z`, C.turq) +
      r(470, B - 200, 260, 200, C.adobe) + each([485, 555, 625], (x) => p(arch(x + 6, B, 50, 150), C.lapis)) +
      minaret(478, B - 200, 70, C.adobe, C.turq, 12) + minaret(722, B - 200, 70, C.adobe, C.turq, 12),

    // راسته‌ی بازار با گنبدهای کوچک
    "زنجان": () => r(400, B - 100, 400, 100, C.adobeLight) +
      each([0, 1, 2, 3, 4, 5, 6], (i) => dome(430 + i * 57, B - 100, 24, 30, C.adobe) + p(arch(416 + i * 57, B, 28, 64), "#7d5130")) +
      r(585, B - 150, 30, 50, C.adobeLight) + dome(600, B - 150, 34, 46, C.turq),

    // بقعه‌ی شیخ صفی و کوه سبلان
    "اردبیل": () => ({
      back: mountain([[480, B - 260], [610, B - 300], [740, B - 250]], "#8c8fa8", true),
      front: r(440, B - 150, 120, 150, C.cream) + p(arch(465, B, 70, 120), C.lapis) + r(650, B - 120, 140, 120, "#d9bf92") +
        r(560, B - 240, 80, 240, C.turq) + dome(600, B - 240, 40, 42, C.turq) +
        each([0, 1, 2, 3, 4, 5], (row) => each([0, 1, 2], (col) =>
          p(`M${576 + col * 24} ${B - 220 + row * 34}l9 -11l9 11l-9 11Z`, C.gold, ' opacity=".85"'))),
    }),

    // عمارت ائل‌گلی در دل دریاچه
    "تبریز": () => ({
      back: p(`M300 ${B - 20}Q420 ${B - 150} 560 ${B - 120}T900 ${B - 30}Z`, "#b9735a"),
      front: `<ellipse cx="600" cy="${B + 22}" rx="300" ry="44" fill="${C.water}"/>` +
        r(540, B - 80, 120, 80, "#b9573f") + r(552, B - 150, 96, 70, "#b9573f") + p(`M540 ${B - 150}L600 ${B - 195}L660 ${B - 150}Z`, "#6f8a9a") +
        each([550, 585, 620], (x) => p(arch(x, B, 26, 56), C.white)) + each([566, 600], (x) => p(arch(x, B - 85, 22, 50), C.white)) +
        r(530, B, 140, 24, "#b9573f", ' opacity=".35"'),
    }),

    // دریاچه‌ی ارومیه و فلامینگوها
    "ارومیه": () => r(0, B - 8, W, 80, "#d9918f") + r(0, B - 8, W, 6, "#fff", ' opacity=".7"') + r(0, B + 66, W, 6, "#fff", ' opacity=".7"') +
      `<ellipse cx="600" cy="${B - 4}" rx="90" ry="22" fill="#b9a78f"/>` +
      each([[480, B + 40], [560, B + 54], [650, B + 36], [720, B + 50]], ([x, y], i) =>
        line(x, y, x - 4, y - 46, "#e86a7a", 3) + line(x + 8, y, x + 6, y - 46, "#e86a7a", 3) +
        `<ellipse cx="${x + 4}" cy="${y - 58}" rx="22" ry="13" fill="#f29aa5"/>` +
        `<path d="M${x + 18} ${y - 62}Q${x + 30} ${y - 100} ${x + (i % 2 ? 16 : 22)} ${y - 108}" stroke="#f29aa5" stroke-width="5" fill="none"/>` +
        `<circle cx="${x + (i % 2 ? 16 : 22)}" cy="${y - 110}" r="6" fill="#f29aa5"/>` + r(x + (i % 2 ? 10 : 16), y - 108, 7, 4, "#333")),

    // روستای پلکانی کردستان
    "مهاباد": () => p(`M360 ${B}L620 ${B - 210}L860 ${B}Z`, "#9b8a74") +
      each([[440, 0], [510, 0], [580, 0], [650, 0], [720, 0], [480, 55], [550, 55], [620, 55], [690, 55], [520, 110], [590, 110], [650, 110], [570, 165]], ([x, up]) =>
        house(x, B - up, 62, 52, "#b08a68")) + poplar(400, B + 10, 130) + poplar(820, B + 10, 120),

    // پل قشلاق و کوه آبیدر
    "سنندج": () => ({
      back: mountain([[440, B - 220], [600, B - 260], [760, B - 200]], "#7f8f6a", false),
      front: water(B - 6, 60) + bridge(400, 800, B - 70, 5, C.stone, true) + r(394, B - 78, 412, 10, "#968878"),
    }),

    // طاق بستان
    "کرمانشاه": () => ({
      back: p(`M300 ${B}L340 ${B - 260}L470 ${B - 330}L700 ${B - 310}L860 ${B - 240}L900 ${B}Z`, "#9b8f88"),
      front: p(roundArch(560, B - 20, 120, 190), "#6d625e") + p(roundArch(578, B - 20, 84, 150), "#857a74") +
        p(roundArch(460, B - 20, 64, 100), "#6d625e") + r(596, B - 120, 12, 70, "#a99d96") +
        `<ellipse cx="590" cy="${B + 30}" rx="230" ry="34" fill="${C.water}"/>`,
    }),

    // آرامگاه بوعلی سینا و الوند
    "همدان": () => ({
      back: mountain([[470, B - 230], [640, B - 270], [800, B - 190]], "#8a8fa6", true),
      front: r(520, B - 32, 160, 32, "#d9cfc0") + r(560, B - 130, 80, 98, "#cfc6b5") +
        each([...Array(12).keys()], (i) => line(530 + i * 12.7, B - 32, 586 + i * 2.5, B - 300, "#ece6d8", 6)) +
        r(576, B - 312, 48, 12, "#ece6d8"),
    }),

    // روستا و رود با سپیدارها
    "بروجرد": () => water(B - 2, 34) + each([400, 440, 480, 720, 760, 800], (x, i) => poplar(x, B, 150 - (i % 3) * 20)) +
      r(520, B - 110, 160, 110, C.cream) + r(570, B - 150, 60, 40, C.cream) + dome(600, B - 150, 36, 50, C.turq) + p(arch(578, B, 44, 84), C.lapis),

    // قلعه‌ی فلک‌الافلاک
    "خرم‌آباد": () => p(`M380 ${B}Q480 ${B - 110} 600 ${B - 130}Q720 ${B - 110} 820 ${B}Z`, "#8f7a5e") +
      r(500, B - 250, 200, 125, "#c9b28f") +
      each([480, 548, 612, 680], (x, i) => r(x, B - 272 + (i % 2) * 12, 40, 150 - (i % 2) * 12, "#bfa784", ' rx="14"') +
        each([0, 1, 2], (k) => r(x + 2 + k * 13, B - 282 + (i % 2) * 12, 9, 10, "#bfa784"))) +
      each([530, 590, 650], (x) => r(x, B - 200, 8, 16, "#5e4a38")),

    // پل قدیم دزفول
    "دزفول": () => water(B - 20, 80) + r(300, B - 92, 600, 14, "#b9a07a") + bridge(300, 900, B - 80, 9, "#c9b28f", false) +
      each([...Array(9).keys()], (i) => r(330 + i * 66.6, B - 70, 10, 16, "#5e4a38")) +
      palm(360, B + 50, 170, 20) + palm(840, B + 50, 160, -18),

    // آسیاب‌ها و آبشارهای شوشتر
    "شوشتر": () => r(420, B - 200, 360, 200, "#b9a07a") + r(420, B - 208, 360, 10, "#a08a68") +
      each([0, 1, 2, 3, 4, 5], (i) => p(arch(440 + i * 56, B - 110, 34, 60), "#5e4a38") +
        r(450 + i * 56, B - 112, 14, 150, "#bfe6ee") + r(455 + i * 56, B - 112, 4, 150, "#fff", ' opacity=".8"')) +
      water(B + 20, 50) + each([460, 560, 660], (x) => `<ellipse cx="${x}" cy="${B + 26}" rx="40" ry="8" fill="#fff" opacity=".7"/>`) +
      palm(400, B - 196, 110, -12) + palm(800, B - 196, 120, 14),

    // پل سفید اهواز روی کارون
    "اهواز": () => water(B - 20, 80) + r(300, B - 42, 600, 12, "#f6f4ef") +
      `<path d="M380 ${B - 36}Q600 ${B - 250} 820 ${B - 36}" stroke="#f6f4ef" stroke-width="12" fill="none"/>` +
      each([...Array(11).keys()], (i) => {
        const x = 420 + i * 36, t = (x - 380) / 440, y = (1 - t) * (1 - t) * (B - 36) + 2 * t * (1 - t) * (B - 250) + t * t * (B - 36);
        return line(x, y, x, B - 36, "#f6f4ef", 3);
      }) + each([450, 600, 750], (x) => r(x - 6, B - 30, 12, 50, "#e4e0d6")) +
      palm(340, B + 50, 170, 18) + palm(860, B + 50, 170, -16),

    // خانه‌های قدیمی بوشهر با شناشیل
    "بوشهر": () => r(460, B - 170, 280, 170, "#e9dcc0") + r(454, B - 178, 292, 10, "#cfbf9e") + badgir(700, B - 178, 60) +
      each([495, 625], (x) => r(x, B - 140, 80, 46, "#8a5a33") + each([1, 2, 3, 4], (k) => r(x + k * 16, B - 140, 3, 46, "#5e3b20"))) +
      each([480, 540, 600, 660], (x) => p(arch(x, B, 34, 70), "#5a7d8a")) + palm(420, B + 20, 150, 16),

    // ستون‌های بیشاپور و درخت‌های نارنج
    "کازرون": () => each([[480, 180], [540, 150], [610, 190], [670, 120], [730, 160]], ([x, h]) =>
      r(x, B - h, 20, h, "#d8c9a8") + r(x - 5, B - h - 10, 30, 12, "#c9b896") + each([0.3, 0.6], (f) => r(x, B - h * f, 20, 3, "#b8a988"))) +
      r(450, B - 14, 320, 14, "#c9b896") + tree(410, B + 20, 34, "#3f7a4e", "#f08a24") + tree(790, B + 20, 34, "#3f7a4e", "#f08a24"),

    // حافظیه
    "شیراز": () => r(470, B - 26, 260, 26, "#d9cfc0") + r(570, B - 52, 60, 26, "#f1ead8") +
      each([505, 555, 633, 683], (x) => r(x, B - 176, 12, 150, "#ece6d8")) +
      r(492, B - 186, 216, 12, C.turq) +
      p(`M494 ${B - 186}H706Q700 ${B - 206} 652 ${B - 220}Q600 ${B - 282} 548 ${B - 220}Q500 ${B - 206} 494 ${B - 186}Z`, "#3f8f7a") +
      each([0, 1, 2, 3, 4], (i) => line(560 + i * 20, B - 222, 600, B - 276, "#2f6f5e", 2)) +
      cypress(420, B, 180) + cypress(455, B, 140) + cypress(745, B, 140) + cypress(780, B, 180),

    // نخلستان و خانه
    "جهرم": () => house(540, B, 130, 70, "#e8dcc4") + badgir(560, B - 70, 50) +
      each([[420, 190, 18], [470, 150, -14], [520, 120, 10], [680, 130, -10], [730, 170, 16], [790, 140, -18]], ([x, h, l]) => palm(x, B + 30, h, l, true)),

    // برکه‌های لار
    "لار": () => each([470, 600, 730], (x, i) => r(x - 52, B - 14, 104, 14, "#d9cdb4") + dome(x, B - 14, 50, 66 + (i % 2) * 14, "#ece2cc") +
      badgir(x - 44, B - 14, 54) + badgir(x + 26, B - 14, 54)),

    // لنج در دریا و خانه‌های بادگیردار
    "بندرعباس": () => ({
      back: `<g class="lenj"><path d="M480 ${B - 40}H720L696 ${B - 6}H504Z" fill="#8a5a33"/>${r(480, B - 44, 240, 6, C.adobe)}` +
        `<path d="M600 ${B - 44}V${B - 190}" stroke="#5a3d22" stroke-width="5"/><path d="M604 ${B - 182}L690 ${B - 54}H604Z" fill="#fdf6e3"/>` +
        `<path d="M596 ${B - 160}L530 ${B - 54}H596Z" fill="#f1e4c6"/></g>`,
      front: house(400, B + 20, 110, 70, "#efe6d2") + badgir(470, B - 50, 60) + house(700, B + 20, 110, 64, "#e8dcc4") + badgir(720, B - 44, 54),
    }),

    // قلعه‌ی بی‌بی‌مینو و نخلستان
    "میناب": () => p(`M420 ${B}Q520 ${B - 110} 620 ${B - 120}Q720 ${B - 110} 800 ${B}Z`, "#c9a27a") +
      p(`M520 ${B - 100}V${B - 220}L540 ${B - 205}L560 ${B - 225}V${B - 180}H640V${B - 230}L660 ${B - 214}L680 ${B - 226}V${B - 100}Z`, "#b88a5c") +
      each([560, 610], (x) => r(x, B - 160, 10, 18, "#5e4a38")) +
      water(B + 10, 30) + palm(400, B + 50, 170, 16, true) + palm(450, B + 60, 130, -12) + palm(780, B + 50, 160, -16, true),

    // کوه‌های مریخی و ساحل
    "چابهار": () => ({
      back: p(`M330 ${B - 48}C360 ${B - 160} 400 ${B - 200} 440 ${B - 150}C470 ${B - 240} 540 ${B - 250} 570 ${B - 160}` +
        `C600 ${B - 220} 680 ${B - 230} 700 ${B - 140}C730 ${B - 190} 800 ${B - 180} 850 ${B - 48}Z`, "#d9a98f") +
        each([400, 470, 540, 620, 700, 780], (x) => line(x, B - 60, x + 8, B - 150, "#c08a72", 3)),
      front: `<path d="M520 ${B + 30}H640L626 ${B + 50}H534Z" fill="#c45a3a"/>` + r(578, B - 10, 4, 40, "#5a3d22") +
        palm(420, B + 40, 150, 16) + palm(800, B + 40, 140, -14),
    }),

    // آتشفشان تفتان
    "زاهدان": () => ({
      back: p(`M330 ${B - 20}L560 ${B - 300}H640L870 ${B - 20}Z`, "#9a8478") +
        p(`M532 ${B - 266}L560 ${B - 300}H640L668 ${B - 266}L640 ${B - 276}L612 ${B - 256}L588 ${B - 278}Z`, C.snow) +
        each([[600, B - 330, 30], [630, B - 370, 38], [672, B - 412, 46]], ([x, y, s]) => `<circle cx="${x}" cy="${y}" r="${s}" fill="#e8e2dc" opacity=".8"/>`),
      front: house(420, B, 90, 50, C.adobe) + house(700, B, 100, 56, C.adobeLight) + camels(500, B + 60, 80),
    }),

    // ارگ بم
    "بم": () => p(`M380 ${B}Q600 ${B - 90} 820 ${B}Z`, C.adobe) +
      r(420, B - 100, 360, 100, C.adobeLight) + each([420, 520, 640, 740], (x) => r(x - 10, B - 130, 40, 130, C.adobe, ' rx="10"')) +
      r(480, B - 190, 240, 90, "#c48a55") + each([480, 690], (x) => r(x - 8, B - 215, 38, 115, "#b8804c", ' rx="10"')) +
      r(560, B - 280, 80, 100, C.brick) + r(612, B - 320, 30, 140, "#a8713f", ' rx="8"') +
      each([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], (i) => r(426 + i * 36, B - 108, 14, 10, C.adobeLight)) +
      palm(390, B + 50, 150, 16, true) + palm(820, B + 50, 140, -14, true),

    // باغ شاهزاده
    "ماهان": () => r(530, B - 205, 140, 80, "#e8d6b0") + r(524, B - 212, 152, 9, C.brick) +
      each([548, 584, 620], (x) => p(arch(x, B - 125, 28, 56), "#2c5f8a")) +
      each([0, 1, 2, 3, 4], (i) => r(560 - i * 12, B - 125 + i * 30, 80 + i * 24, 26, "#5fb7c0") + r(560 - i * 12, B - 125 + i * 30, 80 + i * 24, 4, "#e3efe9") +
        line(600, B - 102 + i * 30, 600, B - 116 + i * 30, "#fff", 3)) +
      each([0, 1, 2, 3], (i) => cypress(500 - i * 20, B - 100 + i * 32, 120) + cypress(700 + i * 20, B - 100 + i * 32, 120)),
  };

  // نقاشی کامل منظره‌ی یک شهر، با عمق: دوردست در مه، سایه‌ی پای ساختمان‌ها، زمین سایه‌روشن و نور خورشید
  function draw(city, region, id) {
    const reg = REGIONS[region] || REGIONS.desert;
    const mark = LANDMARKS[city] ? LANDMARKS[city]() : "";
    const { back = "", front = "" } = typeof mark === "string" ? { front: mark } : mark;
    const [g1, g2] = reg.ground;
    const grounds = `<defs>
        <linearGradient id="${id}-g1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${g1}"/><stop offset="1" stop-color="${g2}"/></linearGradient>
        <linearGradient id="${id}-g2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${g2}"/><stop offset="1" stop-color="#3a2414"/></linearGradient>
        <filter id="${id}-sil" x="-10%" y="-10%" width="120%" height="120%">
          <feColorMatrix values="0 0 0 0 .16  0 0 0 0 .08  0 0 0 0 .03  0 0 0 .34 0"/><feGaussianBlur stdDeviation="2.5"/>
        </filter>
      </defs>`;
    // سایه‌ی بلند ساختمان‌ها روی زمین، به طرف مخالف خورشید
    const k = reg.sky[3] > W / 2 ? -1.1 : 1.1;
    const shadow = `<g filter="url(#${id}-sil)" transform="matrix(1 0 ${-k} -0.28 ${k * B} ${B * 1.28})">${sides(reg.side)}${front}</g>`;
    return grounds + sky(id, ...reg.sky) + farRidge(reg.ground[1]) +
      r(0, B - 260, W, 262, `url(#${id}-haze)`) +
      reg.far() + r(0, B - 160, W, 162, `url(#${id}-near)`) +
      back + sides(reg.side) +
      p(`M0 ${B}Q300 ${B - 14} 600 ${B}T${W} ${B}V800H0Z`, `url(#${id}-g1)`) +
      r(0, B - 4, W, 26, `url(#${id}-shade)`) + ripples(B, "#fff4dc") + shadow + front +
      p(`M0 ${B + 95}Q400 ${B + 62} ${W} ${B + 100}V800H0Z`, `url(#${id}-g2)`) + ripples(B + 90, "#2a1608") +
      r(0, 0, W, 800, `url(#${id}-light)`, ' style="mix-blend-mode:soft-light"');
  }

  return { draw, W, cities: () => Object.keys(LANDMARKS) };
})();
