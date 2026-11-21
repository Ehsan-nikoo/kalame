// ظاهر «کاشی‌کاری»: دیوار کاشی هفت‌رنگ لاجوردی و فیروزه‌ای، با تابلوی کاشی معرق هشت‌ضلعی به جای دایره‌ی حروف.
// هر کلمه‌ی درست، خانه‌های خاکی جدول را کاشی لعاب‌دار می‌کند. هر ۶ مرحله یک بنای کاشی‌کاری‌شده است
// (۴۰ بنا: مسجد شیخ لطف‌الله، گوهرشاد، حرم امام رضا، ...)؛ با هر مرحله یک بخش بنا ساخته می‌شود و بخش‌های مانده طرح نقطه‌چین‌اند.
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

  // ---------- بنای کاشی‌کاری‌شده، بخش به بخش ----------
  // هر بنا شکل خودش را دارد: گنبد (گرد، پیازی، بلند، مخروطی، کم‌ارتفاع)، رنگ گنبد، تعداد و جنس مناره‌ها،
  // رنگ سردر، رنگ دیوار، آسمان (روز، سحر، غروب، شب)، حوض و سرو.
  // [اسم، گنبد، رنگ گنبد، مناره‌ها، جنس مناره، مناره‌ی بلند، رنگ سردر، دیوار، آسمان، حوض، سرو، پهنای سردر، پهنای گنبد]
  // مناره‌ها: 0 بی‌مناره، 2 دو مناره کنار سردر، w دو مناره دو سر دیوار، 4 هر چهار تا
  const B = [
    ["مسجد شیخ لطف‌الله", "round", "cream", 0, "", 0, "cobalt", "brick", "day", 1, 0, 44, 46],
    ["مسجد امام اصفهان", "onion", "turq", 4, "turq", 1, "cobalt", "ivory", "day", 1, 0, 50, 48],
    ["مسجد گوهرشاد", "onion", "turq", "w", "turq", 1, "turq", "ivory", "sunset", 1, 0, 52, 46],
    ["مسجد کبود تبریز", "round", "cobalt", 0, "", 0, "cobalt", "brick", "dawn", 0, 1, 44, 42],
    ["مسجد جامع یزد", "round", "turq", 2, "turq", 1, "cobalt", "brick", "sunset", 0, 0, 40, 40],
    ["مدرسه‌ی چهارباغ", "onion", "turq", 2, "turq", 0, "turq", "ivory", "day", 1, 1, 48, 46],
    ["مسجد نصیرالملک", "low", "pink", 0, "", 0, "pink", "ivory", "dawn", 1, 0, 48, 40],
    ["حرم امام رضا", "onion", "gold", "w", "gold", 1, "gold", "ivory", "night", 1, 0, 50, 46],
    ["حرم حضرت معصومه", "onion", "gold", 4, "gold", 1, "turq", "ivory", "night", 1, 0, 48, 46],
    ["حرم شاهچراغ", "onion", "turq", 2, "turq", 0, "turq", "ivory", "night", 1, 0, 46, 46],
    ["مسجد جامع اصفهان", "round", "brick", 2, "brick", 0, "cobalt", "brick", "day", 1, 0, 48, 44],
    ["گنبد سلطانیه", "tall", "turq", "w", "turq", 0, "brick", "brick", "dawn", 0, 0, 40, 46],
    ["مسجد آقا بزرگ کاشان", "cone", "brick", 2, "brick", 0, "brick", "brick", "sunset", 1, 1, 44, 38],
    ["مسجد سید اصفهان", "onion", "turq", 2, "brick", 0, "cobalt", "brick", "day", 0, 1, 44, 44],
    ["مسجد حکیم اصفهان", "low", "turq", 0, "", 0, "cobalt", "brick", "dawn", 1, 0, 46, 46],
    ["مسجد جامع کرمان", "low", "cobalt", 0, "", 0, "turq", "ivory", "day", 1, 1, 44, 44],
    ["مدرسه‌ی سپهسالار تهران", "onion", "yellow", 4, "turq", 1, "turq", "ivory", "sunset", 1, 1, 50, 48],
    ["آرامگاه شاه نعمت‌الله ولی", "onion", "turq", 2, "turq", 1, "cobalt", "ivory", "sunset", 1, 1, 46, 42],
    ["مسجد جامع قزوین", "onion", "turq", 2, "turq", 0, "cobalt", "brick", "dawn", 1, 0, 46, 46],
    ["مسجد مشیر شیراز", "low", "pink", 0, "", 0, "pink", "brick", "day", 1, 1, 44, 40],
    ["مسجد وکیل شیراز", "round", "pink", 2, "brick", 0, "pink", "brick", "sunset", 0, 1, 46, 40],
    ["امامزاده هلال بن علی", "onion", "gold", 2, "turq", 1, "turq", "ivory", "night", 1, 0, 46, 42],
    ["مسجد جامع نطنز", "cone", "turq", 2, "brick", 1, "brick", "brick", "day", 0, 0, 40, 36],
    ["مسجد جامع ورامین", "round", "brick", 0, "", 0, "turq", "brick", "sunset", 0, 0, 44, 46],
    ["مسجد ملک کرمان", "low", "turq", 0, "", 0, "cobalt", "brick", "night", 0, 1, 44, 44],
    ["مسجد گنجعلی‌خان کرمان", "round", "turq", 0, "", 0, "turq", "ivory", "day", 1, 0, 42, 40],
    ["حرم شاه عبدالعظیم", "onion", "gold", 4, "gold", 1, "gold", "ivory", "night", 1, 0, 48, 44],
    ["مسجد رحیم‌خان اصفهان", "onion", "turq", 2, "turq", 0, "cobalt", "ivory", "dawn", 1, 1, 44, 44],
    ["مسجد جامع سمنان", "round", "brick", 2, "brick", 1, "brick", "brick", "sunset", 0, 0, 42, 40],
    ["مدرسه‌ی امام کاشان", "cone", "turq", 2, "brick", 0, "turq", "brick", "day", 1, 1, 46, 38],
    ["مسجد جامع شوشتر", "round", "brick", 2, "brick", 1, "brick", "brick", "dawn", 1, 1, 42, 42],
    ["مسجد امام تهران", "onion", "yellow", 2, "turq", 1, "cobalt", "ivory", "day", 1, 0, 48, 44],
    ["مسجد جامع زواره", "round", "brick", 0, "", 0, "cobalt", "brick", "sunset", 0, 0, 44, 44],
    ["مسجد جامع اردستان", "low", "brick", 2, "brick", 0, "turq", "brick", "dawn", 0, 1, 44, 46],
    ["آرامگاه شیخ صفی اردبیلی", "tall", "cobalt", 0, "", 0, "cobalt", "ivory", "day", 1, 1, 46, 34],
    ["مسجد جامع گلپایگان", "round", "brick", 0, "", 0, "brick", "brick", "night", 0, 0, 42, 44],
    ["مسجد جامع ساوه", "round", "turq", 2, "brick", 1, "cobalt", "brick", "dawn", 0, 0, 42, 40],
    ["مسجد سرخ ارومیه", "round", "brick", "w", "brick", 0, "brick", "brick", "sunset", 1, 0, 44, 42],
    ["آرامگاه حافظ", "low", "turq", 0, "", 0, "turq", "ivory", "night", 1, 1, 52, 40],
    ["مسجد جامع ابرکوه", "cone", "brick", 0, "", 0, "turq", "brick", "day", 0, 1, 42, 40],
  ].map(([name, dome, dpal, mins, mstyle, tall, ppal, wall, sky, pool, trees, pw, dw]) =>
    ({ name, dome, dpal, mins, mstyle, tall, ppal, wall, sky, pool, trees, pw, dw }));
  const buildingNo = (level) => Math.floor(level / PARTS) % B.length;
  const buildingOf = (level) => B[buildingNo(level)].name;

  // رنگ‌ها: گنبد [روشن، میانه، تیره، رنگ نقش، رنگ دوم نقش]
  const DOME_PAL = {
    turq: ["#7fd6de", "#2fa9b9", "#16708a", "#efe3c6", "#e8b94a"],
    cream: ["#f6e8c8", "#dcbf8c", "#a8805a", "#1d4a86", "#2a9fb3"],
    cobalt: ["#6f97d6", "#2c5aa8", "#173a75", "#efe3c6", "#5cc3cf"],
    gold: ["#fff3c0", "#e8b94a", "#9a6c18", "#fff8e0", "#b8861e"],
    brick: ["#ecd0a4", "#c99a64", "#8a6238", "#8a5a30", "#2a9fb3"],
    pink: ["#fbe2dc", "#e9a6a8", "#b8606e", "#fff6ec", "#f2c84a"],
    yellow: ["#fbe7a0", "#e2bd4a", "#a8801e", "#1d4a86", "#2a9fb3"],
  };
  // سردر: [زمینه، نقش، قاب، کتیبه]
  const PORTAL_PAL = {
    cobalt: ["#1d4a86", "#2a9fb3", "#2a9fb3", "#12305a"],
    turq: ["#2a9fb3", "#efe3c6", "#1d4a86", "#17396b"],
    pink: ["#f3dcc8", "#e47f8e", "#c45a6a", "#5a2a3a"],
    brick: ["#c99a64", "#2a9fb3", "#2a9fb3", "#1d4a86"],
    gold: ["#e8b94a", "#fff3c0", "#9a6c18", "#12305a"],
  };
  const WALL_PAL = { brick: ["#dcc095", "#bf9c6a"], ivory: ["#f1e6cf", "#d8c8a6"] };
  // آسمان: [بالا، میانه، افق، درخشش]
  const SKY_PAL = {
    day: ["#4f8fd0", "#a9cde8", "#f1e6c8", "#fff8e0"],
    dawn: ["#6f84c0", "#e2b6c4", "#fbdcb2", "#ffe9d2"],
    sunset: ["#38467f", "#c4708a", "#f2a65a", "#ffd08a"],
    night: ["#0b1633", "#1c2f60", "#3b4f80", "#8fb0e8"],
  };

  // هندسه‌ی گنبد: مسیر، بالاترین نقطه و پایه (پایه همیشه y=30)
  function domeGeo(b) {
    const h = b.dw / 2, L = 100 - h, R = 100 + h;
    switch (b.dome) {
      case "onion": return { apex: 6, d: `M${L + 4} 30C${L - 6} 22 ${L} 12 100 6C${R} 12 ${R + 6} 22 ${R - 4} 30Z` };
      case "tall": return { apex: 6, d: `M${L} 30C${L} 14 ${100 - 7} 7 100 6C${100 + 7} 7 ${R} 14 ${R} 30Z` };
      case "cone": return { apex: 6, d: `M${L} 30L100 6L${R} 30Z` };
      case "low": return { apex: 15, d: `M${L} 30C${L} 20 ${100 - 9} 15 100 15C${100 + 9} 15 ${R} 20 ${R} 30Z` };
      default: return { apex: 8, d: `M${L} 30C${L - 2} 18 ${100 - 12} 10 100 8C${100 + 12} 10 ${R + 2} 18 ${R} 30Z` };
    }
  }

  // جای مناره‌ها
  function minaretXs(b) {
    const near = [100 - b.pw / 2 - 5, 100 + b.pw / 2 + 5], far = [24, 176];
    return b.mins === 2 ? near : b.mins === "w" ? far : b.mins === 4 ? [...far, ...near] : [];
  }

  // شش بخش هر بنا؛ هر بخش: name، z (ترتیب کشیدن)، ghost(b) و svg(b, k)
  const PARTS_DEF = [
    {
      name: "ازاره و دیوار",
      z: 3,
      ghost: () => "M16 60h168v24h-168z",
      svg: (b, k) => {
        const p = PORTAL_PAL[b.ppal], lit = b.sky === "night";
        const xs = [];
        for (let x = 25; x < 100 - b.pw / 2 - 3; x += 13) xs.push(x, 200 - x);
        return `<rect x="16" y="60" width="168" height="24" fill="url(#${k}-wall)"/>
        <rect x="16" y="58.4" width="168" height="2.6" fill="${p[2]}"/><rect x="16" y="58" width="168" height=".6" fill="#efe3c6"/>
        ${xs.map((x) => `<path d="M${x - 4.6} 82V70.6q4.6 -6.4 9.2 0V82z" fill="${b.wall === "brick" ? "#17396b" : p[0]}" stroke="${p[2]}" stroke-width=".8"/>` +
          `<path d="M${x - 2.6} 82V72q2.6 -3.6 5.2 0V82z" fill="${lit ? "#f2c46a" : "#0d2240"}"${lit ? ' opacity=".9"' : ""}/>`).join("")}
        <rect x="16" y="82" width="168" height="2" fill="#a88454"/>`;
      },
    },
    {
      name: "سردر و ایوان",
      z: 4,
      ghost: (b) => `M${100 - b.pw / 2} 36h${b.pw}v48h-${b.pw}z`,
      svg: (b, k) => {
        const p = PORTAL_PAL[b.ppal], x0 = 100 - b.pw / 2, w = b.pw, ia = 16 * (w / 48);
        const rows = [[62, 6], [57, 5], [52.4, 3]].map(([y, n]) => {
          const step = (ia * 2 - 6) / n;
          let d = `M${100 - (n * step) / 2} ${y}`;
          for (let i = 0; i < n; i++) d += `q${step / 2} ${-step * 0.68} ${step} 0`;
          return `<path d="${d}"/>`;
        }).join("");
        return `<rect x="${x0}" y="36" width="${w}" height="48" fill="${p[0]}"/>
        <rect x="${x0}" y="36" width="${w}" height="48" fill="url(#${k}-pat)" opacity=".55"/>
        <rect x="${x0 + 0.8}" y="36.8" width="${w - 1.6}" height="46.4" fill="none" stroke="${p[2]}" stroke-width="1.6"/>
        <rect x="${x0 + 3.4}" y="39.4" width="${w - 6.8}" height="5" fill="${p[3]}"/>
        <path d="M${x0 + 6} 42q2 -2 4 0t4 0q1 -2.4 3 -.4M96 42.4q3 -2.6 5 0q2 -1.8 4 0M${x0 + w - 16} 42q2 -2 4 0t4 0" stroke="#efe3c6" stroke-width=".7" fill="none" stroke-linecap="round"/>
        <path d="M${100 - ia} 84V60q${ia} -18 ${ia * 2} 0V84z" fill="#0f2747" stroke="#efe3c6" stroke-width=".7"/>
        <g fill="none" stroke="#5cc3cf" stroke-width=".6" opacity=".9">${rows}<path d="M97.4 48.4q2.6 -2.8 5.2 0"/></g>
        <path d="M94 84V72q6 -7 12 0V84z" fill="${b.sky === "night" ? "#f2c46a" : "#5a3a22"}"/><path d="M100 84V68.6" stroke="#3a2414" stroke-width=".6"/>
        <g fill="#d9a441"><circle cx="${x0 + 4.4}" cy="50" r="1.1"/><circle cx="${x0 + w - 4.4}" cy="50" r="1.1"/></g>`;
      },
    },
    {
      name: "گنبد",
      z: 1,
      ghost: (b) => `${domeGeo(b).d}M${100 - b.dw / 2 + 4} 30h${b.dw - 8}v8h-${b.dw - 8}z`,
      svg: (b, k) => {
        const g = domeGeo(b), dx = b.dw / 2 - 4, wins = [];
        for (let x = 100 - dx + 3; x < 100 + dx - 4; x += 6) wins.push(x);
        return `<rect x="${100 - dx}" y="29" width="${dx * 2}" height="9" fill="${b.dpal === "brick" ? "#b88a58" : "#1d4a86"}"/>
        ${wins.map((x) => `<path d="M${x} 37v-4q2 -2.4 4 0v4z" fill="${b.sky === "night" ? "#f2c46a" : "#0d2240"}"/>`).join("")}
        <path d="${g.d}" fill="url(#${k}-dome)"/>
        <path d="M${100 - b.dw / 2 + 6} 27C${100 - b.dw / 2 + 6} 20 ${100 - 8} ${g.apex + 6} 99 ${g.apex + 3}" stroke="#fff" stroke-width="1.6" fill="none" opacity=".3" stroke-linecap="round"/>`;
      },
    },
    {
      name: "نقش اسلیمی گنبد",
      z: 2,
      ghost: () => "",
      svg: (b, k) => {
        const g = domeGeo(b), c = DOME_PAL[b.dpal], h = b.dw / 2;
        const ribs = [-0.8, -0.5, -0.2, 0.2, 0.5, 0.8].map((t) => `<path d="M100 ${g.apex}Q${100 + t * h * 1.1} ${(g.apex + 30) / 2} ${100 + t * h} 30"/>`).join("");
        const my = g.apex + (30 - g.apex) * 0.55;
        const motifs = [-0.55, 0, 0.55].map((t) => [100 + t * h, my]).concat([[100 - h * 0.28, my - (30 - g.apex) * 0.25], [100 + h * 0.28, my - (30 - g.apex) * 0.25]]);
        const brick = b.dpal === "brick";
        return `<g clip-path="url(#${k}-dclip)">
          ${brick
            ? `<g stroke="${c[3]}" stroke-width=".5" opacity=".7">${Array.from({ length: 7 }, (_, i) => `<path d="M60 ${12 + i * 3}h80"/>`).join("")}</g>
               <g fill="${c[4]}">${motifs.map(([x, y]) => `<path d="M${x} ${y - 2.2}l2.2 2.2l-2.2 2.2l-2.2 -2.2z"/>`).join("")}</g>`
            : `<g fill="none" stroke="${c[3]}" stroke-width=".55" opacity=".85">${ribs}</g>
               <g fill="${c[4]}">${motifs.map(([x, y]) => `<path d="M${x} ${y - 2.4}q1.8 2.4 0 4.8q-1.8 -2.4 0 -4.8z"/><circle cx="${x}" cy="${y}" r=".7" fill="${c[2]}"/>`).join("")}</g>`}
          <path d="M${100 - h} 27.6q5.5 -2.4 11 0t11 0t11 0t11 0t11 0" stroke="${c[4]}" stroke-width=".9" fill="none"/>
          <rect x="${100 - h - 4}" y="28.6" width="${b.dw + 8}" height="1.6" fill="${c[2]}"/>
        </g>`;
      },
    },
    {
      name: "مناره‌ها",
      z: 0,
      ghost: (b) => minaretXs(b).map((x) => `M${x - 4} ${b.tall ? 12 : 20}h8v${b.tall ? 72 : 64}h-8z`).join("") || "",
      svg: (b, k) => {
        const top = b.tall ? 12 : 20, cap = DOME_PAL[b.mstyle === "gold" ? "gold" : b.dpal === "brick" ? "turq" : b.dpal][1];
        const body = b.mstyle === "brick" ? `url(#${k}-min)` : b.mstyle === "gold" ? "#e7d6ad" : "#2a9fb3";
        const band = b.mstyle === "brick" ? "#2a9fb3" : "#1d4a86";
        const xs = minaretXs(b);
        if (!xs.length) {
          // بنای بی‌مناره: به جایش دو گلدسته‌ی کوچک روی سردر
          return [100 - b.pw / 2 + 3, 100 + b.pw / 2 - 3].map((x) =>
            `<rect x="${x - 2.4}" y="29" width="4.8" height="8" fill="${PORTAL_PAL[b.ppal][2]}"/><path d="M${x - 3} 29q3 -6 6 0z" fill="${cap}"/>`).join("");
        }
        return xs.map((x) => `<rect x="${x - 4}" y="${top + 2}" width="8" height="${84 - top - 2}" fill="${body}"/>
          <g stroke="${band}" stroke-width=".8" opacity=".9">${[10, 20, 30].map((y) => `<path d="M${x - 4} ${top + y + 3}l8 -3M${x - 4} ${top + y + 6}l8 -3"/>`).join("")}</g>
          <rect x="${x - 6}" y="${top + 6}" width="12" height="2.6" fill="#efe3c6"/><rect x="${x - 5.4}" y="${top + 8.6}" width="10.8" height="1.2" fill="#a88454"/>
          <rect x="${x - 3.2}" y="${top}" width="6.4" height="6" fill="${band}"/>
          <path d="M${x - 4} ${top}q4 -9 8 0z" fill="${cap}"/><path d="M${x} ${top - 8.4}v-3" stroke="#d9a441" stroke-width=".9"/>`).join("");
      },
    },
    {
      name: "کتیبه و گلدسته‌ی طلایی",
      z: 5,
      ghost: (b) => `M100 ${domeGeo(b).apex}v-5`,
      svg: (b) => {
        const a = domeGeo(b).apex, dx = b.dw / 2 - 4;
        return `<rect x="${100 - dx}" y="30.4" width="${dx * 2}" height="2.4" fill="#efe3c6"/>
        <path d="M${100 - dx + 2} 31.6${"q1.5 -1.4 3 0t3 0".repeat(Math.max(1, Math.floor((dx * 2 - 4) / 6)))}" stroke="#1d4a86" stroke-width=".55" fill="none"/>
        <path d="M100 ${a}V${a - 5}" stroke="#d9a441" stroke-width="1.1"/><circle cx="100" cy="${a - 2.6}" r="1.3" fill="#e8b94a"/>
        <path d="M98.4 ${a - 5.8}a1.9 1.9 0 1 0 3.2 0a1.5 1.5 0 1 1 -3.2 0z" fill="#e8b94a"/>
        <path d="M${100 - b.pw / 2} 36.6h${b.pw}" stroke="#e8b94a" stroke-width=".7"/>`;
      },
    },
  ];

  let uid = 0;
  // بنای شماره‌ی level با count بخش اول؛ بخش fresh با درخشش ظاهر می‌شود؛ بقیه طرح نقطه‌چین‌اند
  function buildingSVG(level, count, fresh, cls) {
    const b = B[buildingNo(level)];
    const k = "tb" + ++uid;
    const d = DOME_PAL[b.dpal], s = SKY_PAL[b.sky], w = WALL_PAL[b.wall], pp = PORTAL_PAL[b.ppal];
    const order = PARTS_DEF.map((p, i) => ({ ...p, i })).sort((a, c) => a.z - c.z);
    const body = order.map((p) => {
      if (p.i >= count) {
        const g = p.ghost(b);
        return g ? `<path class="tile-ghost" d="${g}"/>` : "";
      }
      return `<g${p.i === fresh ? ' class="tile-new"' : ""}>${p.svg(b, k)}</g>`;
    }).join("");
    const night = b.sky === "night";
    const stars = night ? Array.from({ length: 22 }, (_, i) => `<circle cx="${(i * 47 + 9) % 200}" cy="${(i * 29 + 5) % 52}" r="${i % 4 ? 0.45 : 0.8}" fill="#fff" opacity="${i % 3 ? 0.7 : 1}"/>`).join("") +
      `<path d="M168 14a7 7 0 1 0 6 10a5.6 5.6 0 1 1 -6 -10z" fill="#fff3c8"/>` : "";
    const trees = b.trees ? [10, 190].map((x) => `<path d="M${x} 84c-4 -6 -4 -22 0 -32c4 10 4 26 0 32z" fill="#3a6e47"/><path d="M${x} 84c-2 -6 -2 -20 0 -30z" fill="#4f8a5d"/>`).join("") : "";
    const pool = b.pool ? `<path d="M60 88h80l10 12h-100z" fill="url(#${k}-pool)"/><path d="M70 90h60" stroke="#fff" stroke-width=".5" opacity=".5"/>` : "";
    return `<svg class="${cls}" viewBox="0 0 200 100" aria-hidden="true">
      <defs>
        <clipPath id="${k}-c"><rect width="200" height="100" rx="6"/></clipPath>
        <clipPath id="${k}-dclip"><path d="${domeGeo(b).d}"/></clipPath>
        <linearGradient id="${k}-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${s[0]}"/><stop offset=".55" stop-color="${s[1]}"/><stop offset=".85" stop-color="${s[2]}"/></linearGradient>
        <radialGradient id="${k}-sun" cx=".5" cy=".55" r=".45"><stop offset="0" stop-color="${s[3]}" stop-opacity="${night ? 0.35 : 0.8}"/><stop offset="1" stop-color="${s[3]}" stop-opacity="0"/></radialGradient>
        <linearGradient id="${k}-wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${w[0]}"/><stop offset="1" stop-color="${w[1]}"/></linearGradient>
        <linearGradient id="${k}-min" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#e2c79c"/><stop offset=".6" stop-color="#c7a473"/><stop offset="1" stop-color="#a9875a"/></linearGradient>
        <radialGradient id="${k}-dome" cx=".36" cy=".3" r=".8"><stop offset="0" stop-color="${d[0]}"/><stop offset=".45" stop-color="${d[1]}"/><stop offset="1" stop-color="${d[2]}"/></radialGradient>
        <pattern id="${k}-pat" width="6" height="6" patternUnits="userSpaceOnUse"><path d="M3 0l3 3l-3 3l-3 -3z" fill="${pp[1]}" opacity=".6"/><circle cx="3" cy="3" r=".7" fill="#efe3c6"/></pattern>
        <linearGradient id="${k}-pool" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${night ? "#3b5f8a" : "#8fc7cf"}"/><stop offset="1" stop-color="${night ? "#16305a" : "#2d7f96"}"/></linearGradient>
      </defs>
      <g clip-path="url(#${k}-c)">
        <rect width="200" height="100" fill="url(#${k}-sky)"/>
        ${stars}
        <ellipse cx="100" cy="40" rx="90" ry="40" fill="url(#${k}-sun)"/>
        <path d="M0 74q14 -4 26 -2t30 -3t40 2t44 -3t34 2t26 -1V84H0z" fill="${night ? "#2a3a62" : "#9aa7ad"}" opacity=".45"/>
        ${body}${trees}
        <rect y="84" width="200" height="16" fill="${night ? "#8a7c66" : "#d8c3a0"}"/>
        ${pool}
        ${night ? `<rect width="200" height="100" fill="#0b1633" opacity=".12"/>` : `<rect width="200" height="100" fill="#fff6e0" opacity=".05"/>`}
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
    const s = document.querySelector(".tile-panel");
    if (s) s.animate([{ transform: "rotate(0)" }, { transform: `rotate(${deg}deg)` }], { duration: ms, easing: "cubic-bezier(.4,0,.2,1)" });
  }

  defineTheme("tile", {
    name: (level) => buildingOf(level),

    setup() {
      document.body.insertAdjacentHTML("beforeend", `<div class="tile-frame" aria-hidden="true"></div>`);
      addPanel();
      return () => document.querySelectorAll(".tile-frame, .tile-panel").forEach((el) => el.remove());
    },

    on: {
      home(d) {
        const count = d.done % PARTS;
        const box = document.getElementById("homeScene");
        box.innerHTML = buildingSVG(d.done, count, -1, "tile-scene home-tile") + `<p class="scene-caption"></p>`;
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
          `<div class="extra tile-done">${buildingSVG(d.level, step + 1, step, "tile-scene")}</div>`);
        document.getElementById("overlayTitle").textContent =
          step === PARTS - 1 ? `${buildingOf(d.level)} کامل شد!` : `«${PARTS_DEF[step].name}» کاشی شد`;
      },
    },
  });
})();
