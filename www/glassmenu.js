"use strict";

// منوی «باغ شیشه‌ای»: دکمه‌های منوی اصلی شیشه‌ای می‌شوند، با آیکون، برق و حرف‌های شناور.
// رنگ‌ها از ظاهر فعلی می‌آیند (متغیرهای --gm-* در style.css برای هر ظاهر).
// متن دکمه‌ها همیشه اولین فرزندشان می‌ماند (فایل‌های دیگر firstChild را عوض می‌کنند)، پس آیکون‌ها آخر اضافه می‌شوند و با CSS جلو می‌آیند.

(() => {
  const svg = (d) => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${d}" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const ICONS = {
    levelsBtn: svg("M9 4 3 6.5v13.5l6-2.5 6 2.5 6-2.5V4l-6 2.5ZM9 4v13.5M15 6.5V20"),
    speedBtn: svg("M7 8h10a4 4 0 0 1 4 4v1a4 4 0 0 1-7 2.6H10A4 4 0 0 1 3 13v-1a4 4 0 0 1 4-4ZM7.5 10.5v3M6 12h3M15.5 11.5h.01M17.5 13.5h.01"),
    achBtn: svg("M8 4h8v5a4 4 0 0 1-8 0ZM8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8.5 20h7M10 17h4"),
    themesBtn: svg("M12 3a9 9 0 1 0 0 18c1.3 0 2-.9 2-2 0-1.4-1.3-1.6-1.3-3 0-1 .8-1.6 1.8-1.6H17a4 4 0 0 0 4-4C21 6.2 17 3 12 3ZM7.5 11.5h.01M9.5 7.5h.01M14.5 7.5h.01"),
  };

  const menu = document.querySelector("#screenHome .home-menu");
  if (!menu) return;
  menu.classList.add("glass-menu");

  for (const [id, icon] of Object.entries(ICONS)) {
    const btn = document.getElementById(id);
    if (!btn) continue;
    const chip = document.createElement("span");
    chip.className = "gm-ic";
    chip.innerHTML = icon;
    btn.appendChild(chip);
  }
  // دکمه‌ی روزانه آیکون خودش را دارد؛ فقط داخل یک قاب می‌رود
  const dailySvg = document.querySelector("#dailyBtn > svg");
  if (dailySvg) {
    const chip = document.createElement("span");
    chip.className = "gm-ic gm-daily";
    dailySvg.replaceWith(chip);
    chip.appendChild(dailySvg);
  }
  const go = document.createElement("span");
  go.className = "gm-go";
  go.innerHTML = svg("M14 6l-6 6 6 6");
  $("continueBtn").appendChild(go);

  // لکه‌های رنگی و حرف‌های شناور پشت دکمه‌ها
  const deco = document.createElement("div");
  deco.className = "gm-deco";
  deco.setAttribute("aria-hidden", "true");
  deco.innerHTML = `<i class="gm-blob b1"></i><i class="gm-blob b2"></i><i class="gm-blob b3"></i>` +
    [..."کلمهبرسا"].map((ch, i) => `<span class="gm-float" style="right:${(i * 37 + 9) % 92}%;animation-delay:${-i * 1.3}s">${ch}</span>`).join("");
  menu.prepend(deco);
})();
