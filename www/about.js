"use strict";

// بخش «درباره‌ی ما» ته صفحه‌ی تنظیمات.
// شماره‌ی نسخه را دستورالعمل ساخت APK (build-apk.yml) موقع ساخت در خط زیر می‌نویسد.
const APP_VERSION = "0.1.0";
const SUPPORT_EMAIL = "kalameh.game@gmail.com";

(() => {
  const list = document.querySelector(".settings-list");
  if (!list) return;
  const card = document.createElement("section");
  card.className = "setting column about-card";
  card.innerHTML = `
    <span class="setting-name">درباره‌ی ما</span>
    <dl class="about-rows">
      <div><dt>نسخه‌ی بازی</dt><dd id="aboutVersion"></dd></div>
      <div><dt>سازنده</dt><dd>احسان مرزبان</dd></div>
      <div><dt>ایمیل پشتیبانی</dt><dd><a id="aboutEmail" dir="ltr"></a></dd></div>
    </dl>`;
  card.querySelector("#aboutVersion").textContent = faDigits(APP_VERSION);
  const mail = card.querySelector("#aboutEmail");
  mail.textContent = SUPPORT_EMAIL;
  mail.href = "mailto:" + SUPPORT_EMAIL + "?subject=" + encodeURIComponent("بازی کلمه (نسخه‌ی " + APP_VERSION + ")");
  const thanks = document.createElement("p");
  thanks.className = "about-thanks";
  thanks.textContent = "ممنون از اینکه کلمه رو انتخاب کردید";
  list.append(card, thanks);
})();
