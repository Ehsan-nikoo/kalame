// ظاهر «صور فلکی»: آسمان پرستاره، شهاب، و حکاکی صورت‌های فلکی (اطلس هِوِلیوس) در پایان هر مرحله
(function () {
  "use strict";

  const CONSTELLATIONS = [
    { file: "dobe-akbar", name: "دب اکبر" },
    { file: "gheyfavus", name: "قیفاووس" },
    { file: "dobe-asghar", name: "دب اصغر" },
    { file: "andromeda", name: "زن زنجیری" },
    { file: "tanin", name: "اژدها" },
    // بقیه به ترتیب کتاب صوفی (۴۸ صورت بطلمیوسی)
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

  // ---------- صورت فلکی که با هر کلمه در آسمان پشت جدول ساخته می‌شود ----------
  // ستاره‌های صورت فلکی همان مرحله اول مثل بقیه‌ی ستاره‌های آسمان کم‌نورند. هر کلمه‌ی درست چند ستاره را
  // روشن می‌کند و خط بین ستاره‌های روشن کشیده می‌شود؛ وقتی مرحله تمام شد، تصویر کامل صورت فلکی پیدا می‌شود.

  // جای ستاره‌ها (x، y به نسبت اندازه‌ی تصویر، و ۱ برای ستاره‌ی درشت) و خط‌ها (جفت شماره‌ی ستاره‌ها)،
  // از روی همان تصویرهای themes/stars برداشته شده‌اند
  const FIGURES = {
    "aghrab": [[.603,.290,0,.636,.306,0,.653,.398,0,.532,.410,0,.476,.466,1,.430,.509,0,.932,.565,0,.338,.675,0,.121,.733,0,.318,.780,0,.074,.783,0,.049,.809,0,.298,.886,0,.094,.898,0,.207,.918,0], [0,3,1,2,2,3,2,6,3,4,4,5,5,7,7,9,8,10,9,12,10,11,11,13,12,14,13,14]],
    "andromeda": [[.815,.120,0,.572,.402,0,.721,.427,0,.554,.532,0,.145,.587,0,.687,.618,0,.484,.658,1,.899,.665,1], [0,2,1,3,2,5,3,6,4,6,5,6,5,7]],
    "arabe-ran": [[.370,.203,0,.620,.421,1,.338,.459,1,.315,.663,0,.156,.870,1,.583,.892,0], [0,2,1,2,1,5,2,3,3,4,4,5]],
    "asad": [[.304,.253,0,.718,.285,0,.644,.329,0,.124,.333,1,.238,.396,0,.794,.411,0,.611,.425,1,.648,.596,0,.598,.703,1], [0,3,0,6,1,2,1,5,2,6,3,4,4,8,6,7,7,8]],
    "avva": [[.869,.089,0,.795,.170,0,.458,.181,0,.592,.275,0,.259,.286,0,.468,.425,0,.326,.457,0,.400,.632,0,.400,.654,1,.176,.669,0,.549,.776,0], [0,1,1,3,2,3,2,4,3,5,4,6,5,7,5,8,6,7,6,8,8,9,8,10]],
    "barsavosh": [[.603,.156,0,.567,.240,0,.743,.326,0,.595,.356,0,.500,.368,0,.243,.404,0,.404,.452,0,.710,.592,0,.757,.647,0,.081,.690,0,.374,.691,0,.397,.814,0,.463,.921,0], [0,1,1,2,1,4,3,4,3,7,4,6,5,6,5,9,6,10,7,8,10,11,11,12]],
    "dalv": [[.617,.220,1,.768,.267,0,.455,.269,0,.493,.275,0,.826,.277,0,.896,.376,0,.518,.426,1,.373,.513,0,.642,.738,0,.495,.776,0,.599,.845,0], [0,1,0,3,0,6,1,4,2,3,4,5,6,7,6,8,6,9,8,10]],
    "dobe-akbar": [[.185,.041,1,.046,.089,1,.250,.093,1,.331,.167,0,.527,.223,0,.331,.292,1,.473,.347,1,.654,.422,0,.264,.449,0,.858,.490,0,.622,.544,0,.469,.780,0,.150,.922,0], [0,1,0,2,2,3,3,4,3,5,4,6,4,7,5,6,5,8,6,10,7,9,8,12,10,11]],
    "dobe-asghar": [[.102,.102,1,.127,.170,0,.157,.269,0,.257,.444,0,.448,.551,0,.658,.562,1,.432,.674,0,.658,.717,0], [0,1,1,2,2,3,3,4,4,5,4,6,5,7,6,7]],
    "dolfin": [[.431,.153,1,.299,.169,0,.501,.234,1,.384,.238,0,.657,.444,0], [0,1,0,2,1,3,2,3,2,4]],
    "faras-azam": [[.583,.065,0,.749,.188,0,.481,.230,0,.417,.347,1,.523,.412,0,.150,.501,1,.900,.607,1,.508,.683,1,.646,.730,0,.824,.772,0,.198,.876,0], [0,2,1,4,2,3,3,4,3,5,3,7,5,10,6,9,7,8,7,10,8,9]],
    "ghantures": [[.526,.123,0,.402,.161,0,.329,.175,0,.230,.243,0,.583,.261,0,.509,.289,0,.512,.299,0,.337,.430,0,.432,.491,0,.318,.594,1,.564,.611,0,.073,.665,0,.195,.711,0,.612,.718,0], [0,5,0,6,1,2,1,5,1,6,2,3,4,6,6,7,7,8,8,9,8,10,9,11,9,12,10,13]],
    "gheyfavus": [[.170,.336,1,.768,.336,0,.391,.370,0,.594,.435,0,.901,.490,0,.153,.590,0,.434,.682,0,.679,.926,0], [0,2,0,5,1,3,1,4,2,3,3,6,3,7,5,6]],
    "gheytas": [[.216,.216,0,.375,.219,0,.849,.246,0,.132,.310,1,.660,.396,0,.506,.497,0,.800,.513,0,.187,.640,0,.340,.643,0,.338,.699,0], [0,1,0,3,1,5,2,6,4,5,4,6,5,8,7,8,8,9]],
    "ghorab": [[.709,.300,0,.830,.437,0,.570,.648,0,.709,.663,0,.807,.744,1,.784,.874,0], [0,1,0,2,1,3,2,3,3,4,4,5]],
    "ghows": [[.638,.213,0,.605,.236,0,.663,.349,1,.607,.394,0,.822,.427,0,.840,.432,1,.633,.447,1,.909,.447,0,.821,.557,0,.849,.619,0,.637,.644,0,.570,.756,0,.587,.860,0], [0,2,2,3,2,4,2,5,3,6,4,6,4,7,5,6,5,7,5,8,6,10,8,9,10,11,11,12]],
    "hamal": [[.880,.202,0,.720,.265,0,.486,.345,0,.692,.367,1,.314,.457,0,.179,.536,0], [0,1,1,3,2,3,2,4,4,5]],
    "hut": [[.102,.151,0,.162,.204,0,.135,.285,0,.165,.367,0,.154,.452,0,.835,.463,0,.761,.508,0,.876,.510,0,.743,.513,0,.637,.532,0,.109,.554,0,.461,.621,0,.066,.657,0,.301,.672,0,.254,.705,0,.079,.761,0,.184,.782,0,.133,.828,0,.057,.939,1], [0,1,1,2,2,3,3,4,4,10,5,6,5,7,5,8,6,7,6,9,7,8,8,9,9,11,10,12,11,13,12,15,13,14,14,16,15,18,16,17,17,18]],
    "jabbar": [[.178,.094,0,.482,.355,0,.224,.367,0,.919,.406,0,.303,.427,1,.329,.425,0,.591,.445,1,.897,.532,0,.550,.623,0,.512,.649,0,.471,.668,0,.568,.808,0,.732,.818,1], [0,2,1,4,1,6,2,4,3,6,3,7,4,6,4,10,5,6,6,8,8,9,8,12,9,10,10,11]],
    "jadi": [[.093,.255,0,.760,.316,1,.738,.327,0,.834,.346,0,.457,.395,0,.337,.435,0,.198,.489,0,.141,.493,0,.501,.524,0,.206,.622,0,.249,.630,0,.357,.733,0,.649,.845,0], [0,7,1,3,1,4,1,7,1,8,2,4,2,8,4,5,5,6,6,7,7,9,8,11,8,12,9,10,10,11]],
    "jam": [[.566,.164,0,.681,.299,0,.451,.333,0,.161,.445,0,.653,.517,0,.511,.636,1,.781,.814,1], [0,1,1,2,1,4,2,3,2,5,4,5,4,6]],
    "jowza": [[.716,.198,0,.424,.228,1,.145,.254,0,.578,.317,0,.327,.346,0,.463,.382,0,.308,.475,0,.757,.513,0,.585,.659,0,.595,.673,0,.851,.697,0,.463,.782,0,.772,.826,0,.701,.938,0], [0,3,1,3,1,5,2,4,3,7,4,6,5,6,5,8,5,9,6,11,7,10,8,12,8,13,9,12,9,13]],
    "makian": [[.653,.152,0,.625,.211,0,.649,.370,1,.393,.477,1,.050,.540,0,.720,.603,0,.435,.660,1,.947,.721,1,.340,.840,0,.143,.938,0], [0,1,1,2,2,3,3,4,3,5,3,6,5,7,6,8,8,9]],
    "marafsa": [[.872,.120,0,.428,.142,0,.838,.171,0,.573,.221,0,.907,.280,0,.384,.291,0,.076,.308,0,.881,.343,0,.193,.427,0,.742,.499,0,.297,.555,0,.636,.606,0,.450,.626,1,.662,.721,0,.413,.778,0], [0,2,1,3,1,5,2,4,3,9,4,7,5,10,6,8,7,9,8,10,9,11,10,12,11,12,11,13,12,14]],
    "mizan": [[.575,.401,0,.494,.422,0,.743,.422,0,.122,.514,0,.136,.652,0,.755,.818,0], [0,1,0,2,1,3,2,5,3,4]],
    "mosallas": [[.321,.111,0,.661,.121,0,.179,.863,0,.307,.868,0,.432,.858,0,.521,.868,0,.661,.879,0,.786,.895,0], [0,2,1,7,2,3,3,4,4,5,5,6,6,7]],
    "nahr": [[.640,.138,0,.534,.163,0,.441,.230,0,.319,.270,0,.697,.300,0,.193,.331,0,.572,.437,0,.473,.549,0,.098,.594,1,.785,.713,0,.638,.738,0,.522,.749,0,.897,.855,1], [0,1,0,4,1,2,2,3,3,5,4,6,5,8,6,7,7,11,9,10,9,12,10,11]],
    "oghab": [[.796,.238,0,.459,.509,0,.449,.612,1,.616,.638,0,.412,.640,0,.426,.746,0,.180,.891,0], [0,3,1,2,2,3,2,4,2,5,5,6]],
    "sonbole": [[.705,.312,0,.141,.456,0,.610,.481,0,.237,.522,0,.846,.578,0,.638,.680,0,.729,.729,0,.175,.740,0,.402,.848,1,.539,.888,0], [0,2,1,3,2,3,2,5,3,7,4,6,5,6,5,9,8,9]],
    "sour": [[.106,.128,1,.689,.170,0,.050,.397,0,.474,.413,0,.507,.455,0,.433,.506,1,.532,.518,0,.480,.523,0], [0,3,2,5,3,4,4,6,5,7,6,7]],
    "tanin": [[.459,.067,0,.382,.129,0,.551,.146,0,.679,.155,0,.730,.203,0,.225,.273,0,.319,.298,0,.134,.336,1,.783,.339,0,.390,.341,0,.466,.342,0,.538,.387,0,.400,.427,0,.423,.425,0,.806,.438,0,.703,.438,0,.567,.454,0,.083,.552,1,.137,.758,0,.125,.869,0], [0,1,0,2,1,2,2,3,3,4,4,8,5,6,5,7,6,9,7,17,8,14,9,10,10,11,11,12,11,13,12,16,13,16,14,15,15,16,17,18,18,19]],
    "zanu-zade": [[.180,.074,0,.212,.117,0,.604,.194,0,.095,.291,0,.489,.303,0,.303,.304,0,.395,.445,1,.210,.526,0,.308,.537,0,.302,.553,0,.597,.660,0,.301,.765,0,.757,.769,0], [0,1,1,5,2,4,3,5,4,5,4,6,5,8,5,9,6,8,6,9,6,10,7,9,7,11,10,12]],
    "zat-ol-korsi": [[.164,.166,0,.534,.201,0,.154,.515,0,.531,.517,1,.307,.599,1,.668,.654,1,.451,.670,0], [1,5,2,4,3,4,3,5]],
  };

  const STAR_MS = 600;    // روشن شدن هر ستاره
  const LINE_MS = 750;    // کشیده شدن هر خط
  const FULL_MS = 1600;   // پیدا شدن تصویر کامل در پایان مرحله
  const FULL_ALPHA = 0.6;
  let cons = null;        // { img, pts, lines, total, fullFrom }

  function startConstellation(level, total, already) {
    const c = constellationOf(level);
    const f = FIGURES[c.file];
    if (!f) { cons = null; return; }
    const img = new Image();
    img.src = "themes/stars/" + c.file + ".png";
    const pts = [];
    for (let i = 0; i < f[0].length; i += 3)
      pts.push({ x: f[0][i], y: f[0][i + 1], big: f[0][i + 2] === 1, start: null, word: 0, phase: i * 1.7 });
    const lines = [];
    for (let i = 0; i < f[1].length; i += 2) lines.push({ a: f[1][i], b: f[1][i + 1], from: null, start: null });
    // ترتیب روشن شدن: از یک سر شکل، ستاره به ستاره در امتداد خط‌ها، تا شکل پیوسته بزرگ شود
    const nb = pts.map(() => []);
    for (const l of lines) { nb[l.a].push(l.b); nb[l.b].push(l.a); }
    const order = [], seen = new Set();
    while (order.length < pts.length) {
      const left = pts.map((p, i) => i).filter((i) => !seen.has(i));
      const ends = left.filter((i) => nb[i].length === 1);
      const first = (ends.length ? ends : left).reduce((m, i) => (pts[i].x > pts[m].x ? i : m));
      const queue = [first];
      seen.add(first);
      while (queue.length) {
        const i = queue.shift();
        order.push(i);
        for (const j of nb[i]) if (!seen.has(j)) { seen.add(j); queue.push(j); }
      }
    }
    order.forEach((i, k) => (pts[i].word = Math.floor((k * total) / order.length)));
    cons = { img, pts, lines, total, fullFrom: null };
    lightUpTo(already, true);
  }

  // ستاره‌های همه‌ی کلمه‌ها تا شماره‌ی count روشن می‌شوند (now: بی‌انیمیشن، برای ادامه‌ی مرحله‌ی نیمه‌کاره)
  function lightUpTo(count, now) {
    if (!cons) return;
    const t = now ? -1e9 : performance.now();
    const fresh = [];
    cons.pts.forEach((p, i) => {
      if (p.word < count && p.start === null) {
        p.start = t + (now ? 0 : fresh.length * 160);
        fresh.push(i);
        if (!now) setTimeout(() => { const q = spotPoint(p); if (q) burst(q.x, q.y, 12, 0.07); }, p.start - t);
      }
    });
    // خط بین دو ستاره‌ی روشن، از ستاره‌ای که زودتر روشن شده به طرف دیگر
    for (const l of cons.lines) {
      const A = cons.pts[l.a], B = cons.pts[l.b];
      if (l.start !== null || A.start === null || B.start === null) continue;
      const aFirst = A.start <= B.start;
      l.from = aFirst ? l.a : l.b;
      l.start = now ? -1e9 : Math.max(A.start, B.start) + STAR_MS * 0.4;
    }
    if (count >= cons.total && cons.fullFrom === null) {
      const last = Math.max(...cons.lines.map((l) => l.start || 0), ...cons.pts.map((p) => p.start));
      cons.fullFrom = now ? -1e9 : last + LINE_MS;
    }
  }

  // جای تصویر: وسط ناحیه‌ی جدول، با حفظ نسبت تصویر
  function consRect() {
    const area = document.querySelector("#app .board-area");
    if (!area || !cons || !cons.img.complete || !cons.img.naturalWidth) return null;
    const r = area.getBoundingClientRect();
    if (!r.width || !r.height) return null;
    const ratio = cons.img.naturalWidth / cons.img.naturalHeight;
    let w = r.width * 1.05, h = w / ratio;
    if (h > r.height * 1.05) { h = r.height * 1.05; w = h * ratio; }
    return { x: r.left + (r.width - w) / 2, y: r.top + (r.height - h) / 2, w, h };
  }

  function spotPoint(p) {
    const r = consRect();
    return r ? { x: r.x + p.x * r.w, y: r.y + p.y * r.h } : null;
  }

  const clamp01 = (v) => Math.min(1, Math.max(0, v));

  function drawConstellation(time) {
    if (!cons || document.getElementById("app").classList.contains("hidden")) return;
    const r = consRect();
    if (!r) return;
    const X = (p) => r.x + p.x * r.w, Y = (p) => r.y + p.y * r.h;

    // پایان مرحله: تصویر کامل آرام پیدا می‌شود
    if (cons.fullFrom !== null) {
      const k = clamp01((time - cons.fullFrom) / FULL_MS);
      if (k > 0) {
        ctx.globalAlpha = FULL_ALPHA * k * k * (3 - 2 * k);
        ctx.drawImage(cons.img, r.x, r.y, r.w, r.h);
        ctx.globalAlpha = 1;
      }
    }

    // خط‌ها
    ctx.save();
    ctx.lineCap = "round";
    ctx.shadowColor = "rgba(255, 214, 140, 0.9)";
    ctx.shadowBlur = 8;
    ctx.strokeStyle = "rgba(255, 238, 200, 0.7)";
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    for (const l of cons.lines) {
      if (l.start === null) continue;
      const k = clamp01((time - l.start) / LINE_MS);
      if (k <= 0) continue;
      const e = 1 - (1 - k) ** 3;
      const A = cons.pts[l.from], B = cons.pts[l.from === l.a ? l.b : l.a];
      ctx.moveTo(X(A), Y(A));
      ctx.lineTo(X(A) + (X(B) - X(A)) * e, Y(A) + (Y(B) - Y(A)) * e);
    }
    ctx.stroke();
    ctx.restore();

    // ستاره‌ها: خاموش‌ها مثل ستاره‌های دیگر آسمان، روشن‌ها درخشان با هاله
    for (const p of cons.pts) {
      const x = X(p), y = Y(p);
      const tw = 0.8 + 0.2 * Math.sin(time / 700 + p.phase);
      const k = p.start === null ? 0 : clamp01((time - p.start) / STAR_MS);
      if (k > 0) {
        const glow = (p.big ? 11 : 8) * (0.6 + 0.4 * k) * tw;
        const g = ctx.createRadialGradient(x, y, 0, x, y, glow);
        g.addColorStop(0, `rgba(255, 236, 190, ${0.75 * k})`);
        g.addColorStop(0.35, `rgba(255, 210, 140, ${0.25 * k})`);
        g.addColorStop(1, "rgba(255, 210, 140, 0)");
        ctx.fillStyle = g;
        ctx.fillRect(x - glow, y - glow, glow * 2, glow * 2);
        // پرتوهای ریز
        const ray = glow * 1.3 * k;
        ctx.strokeStyle = `rgba(255, 244, 220, ${0.5 * k * tw})`;
        ctx.lineWidth = 0.7;
        ctx.beginPath();
        ctx.moveTo(x - ray, y); ctx.lineTo(x + ray, y);
        ctx.moveTo(x, y - ray); ctx.lineTo(x, y + ray);
        ctx.stroke();
      }
      const core = (p.big ? 1.5 : 1.1) + k * (p.big ? 1.2 : 0.9);
      ctx.fillStyle = `rgba(255, 248, 230, ${(0.45 + 0.55 * k) * tw})`;
      ctx.beginPath();
      ctx.arc(x, y, core, 0, Math.PI * 2);
      ctx.fill();
    }
  }

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

    drawConstellation(time);

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
        cons = null;
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
      // شروع یا ادامه‌ی مرحله: ستاره‌های صورت فلکی همین مرحله پشت جدول؛ کلمه‌های پیدا شده روشنشان کرده‌اند
      level(d) {
        startConstellation(d.level, puzzle.words.length, found.length);
      },
      submit(d) {
        lastLetters = d.letters;
      },
      found(d) {
        // شهاب‌ها از حرف‌های دایره به خانه‌ها می‌روند؛ اگر حرف‌ها معلوم نباشند، از وسط دایره
        const wheel = document.getElementById("wheel");
        d.cells.forEach((cell, i) => meteor(centerOf(lastLetters[i] || lastLetters[0] || wheel), cell, i * 110));
        lastLetters = [];
        // ستاره‌های تازه‌ای از صورت فلکی، بعد از رسیدن شهاب‌ها
        const count = found.length;
        setTimeout(() => lightUpTo(count), 380);
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
        lightUpTo(cons ? cons.total : 0); // اگر با راهنما تمام شده باشد، بقیه‌ی صورت فلکی هم روشن می‌شود
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
