// ظاهر «قلم و مرکب»: کلمه‌ی درست با خط نستعلیق نوشته می‌شود و پایان مرحله مهر می‌خورد
(function () {
  "use strict";

  function addToranj() {
    const scallops = Array.from({ length: 20 }, (_, i) => {
      const a = (i * Math.PI) / 10;
      return `<circle cx="${(Math.cos(a) * 45).toFixed(2)}" cy="${(Math.sin(a) * 45).toFixed(2)}" r="5" fill="#c9a14a"/>`;
    }).join("");
    const dots = Array.from({ length: 40 }, (_, i) => {
      const a = (i * Math.PI) / 20;
      return `<circle cx="${(Math.cos(a) * 42.2).toFixed(2)}" cy="${(Math.sin(a) * 42.2).toFixed(2)}" r=".7" fill="#e7c978"/>`;
    }).join("");
    const petals = Array.from({ length: 8 }, (_, i) =>
      `<path d="M0 -4 C4 -10 3 -16 0 -19 C-3 -16 -4 -10 0 -4Z" transform="rotate(${i * 45})"/>`).join("");
    const div = document.createElement("div");
    div.className = "toranj";
    // ترنج تذهیب: طلای ورقه با سایه‌روشن، لاجورد با گل‌های ریز، و متن کاغذی با سایه‌ی لبه
    const vine = Array.from({ length: 16 }, (_, i) => {
      const a = (i * Math.PI) / 8;
      const x = (Math.cos(a) * 42.1).toFixed(2), y = (Math.sin(a) * 42.1).toFixed(2);
      return `<g transform="translate(${x} ${y}) rotate(${i * 22.5})"><ellipse rx=".7" ry="1.4" fill="#e7c978"/><ellipse cx="0" cy="0" rx="1.4" ry=".55" fill="#b8432d" opacity=".8"/></g>`;
    }).join("");
    div.innerHTML = `<svg viewBox="-52 -52 104 104" aria-hidden="true">
        <defs>
          <linearGradient id="tz-gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fbe7a6"/><stop offset=".35" stop-color="#d4af5a"/><stop offset=".6" stop-color="#9a7426"/><stop offset=".8" stop-color="#e8c978"/><stop offset="1" stop-color="#a8812e"/></linearGradient>
          <radialGradient id="tz-scallop" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#fbe7a6"/><stop offset=".6" stop-color="#c9a14a"/><stop offset="1" stop-color="#8f6a22"/></radialGradient>
          <radialGradient id="tz-lapis" r=".5"><stop offset=".8" stop-color="#24468a"/><stop offset="1" stop-color="#132a57"/></radialGradient>
          <radialGradient id="tz-paper" r=".5"><stop offset="0" stop-color="#f8eed6"/><stop offset=".8" stop-color="#f1e2c0"/><stop offset="1" stop-color="#d9c08e"/></radialGradient>
        </defs>
        ${scallops.replaceAll('fill="#c9a14a"', 'fill="url(#tz-scallop)"')}
        <circle r="45" fill="url(#tz-gold)"/><circle r="43.6" fill="url(#tz-lapis)"/>${dots}${vine}
        <circle r="40.6" fill="url(#tz-gold)"/><circle r="39.6" fill="url(#tz-paper)"/>
        <circle r="36.8" fill="none" stroke="#c9a14a" stroke-width=".5"/>
        <circle r="35.6" fill="none" stroke="#1f3b73" stroke-width=".3" opacity=".5"/>
        <g fill="url(#tz-gold)" opacity=".32">${petals}<circle r="3"/></g>
      </svg>`;
    document.getElementById("wheel").prepend(div);
  }

  // کلمه‌ای که با قلم از راست به چپ نوشته می‌شود و بعد در جدول محو می‌شود
  function writeWord(text) {
    const r = document.getElementById("board").getBoundingClientRect();
    const word = document.createElement("div");
    word.className = "ink-word";
    word.textContent = text;
    word.style.left = r.left + r.width / 2 + "px";
    word.style.top = r.top + r.height / 2 + "px";
    document.body.appendChild(word);
    word
      .animate([{ clipPath: "inset(-20% 0 -20% 100%)" }, { clipPath: "inset(-20% 0 -20% 0)" }], {
        duration: 650,
        easing: "ease-in-out",
      })
      .finished.then(() =>
        word.animate(
          [
            { opacity: 1, transform: "translate(-50%, -50%) scale(1)" },
            { opacity: 0, transform: "translate(-50%, -50%) scale(0.5)", filter: "blur(3px)" },
          ],
          { duration: 380, easing: "ease-in", fill: "forwards" }
        ).finished
      )
      .then(() => word.remove());
  }

  // منو: شمسه‌ی تذهیب‌شده که خیلی آرام می‌چرخد
  function shamseh() {
    const petals = Array.from({ length: 12 }, (_, i) =>
      `<path d="M0 -22 C6 -30 5 -38 0 -44 C-5 -38 -6 -30 0 -22Z" fill="#c9a14a" stroke="#8f6a22" stroke-width=".6" transform="rotate(${i * 30})"/>`).join("");
    const dots = Array.from({ length: 24 }, (_, i) => {
      const a = (i * Math.PI) / 12;
      return `<circle cx="${(Math.cos(a) * 47).toFixed(2)}" cy="${(Math.sin(a) * 47).toFixed(2)}" r="1.3" fill="#c9a14a"/>`;
    }).join("");
    const star = Array.from({ length: 16 }, (_, i) => {
      const a = (i * Math.PI) / 8 - Math.PI / 2, r = i % 2 ? 9 : 17;
      return (Math.cos(a) * r).toFixed(2) + "," + (Math.sin(a) * r).toFixed(2);
    }).join(" ");
    return `<svg class="home-shamseh" viewBox="-52 -52 104 104" aria-hidden="true"><g class="spin">
        ${dots}<circle r="44" fill="#1f3b73" stroke="#c9a14a" stroke-width="1.2"/>${petals}
        <circle r="22" fill="#f6ead0" stroke="#c9a14a" stroke-width="1.2"/>
        <polygon points="${star}" fill="#8b2b1a"/><circle r="4" fill="#c9a14a"/>
      </g></svg>`;
  }

  defineTheme("ink", {
    setup() {
      document.body.insertAdjacentHTML(
        "beforeend",
        `<div class="frame" aria-hidden="true"></div>
         <svg class="ink-defs" width="0" height="0" style="position:absolute" aria-hidden="true">
           <filter id="ink-rough"><feTurbulence type="fractalNoise" baseFrequency="0.09" numOctaves="2" seed="3"/>
             <feDisplacementMap in="SourceGraphic" scale="1.6"/></filter>
         </svg>`
      );
      addToranj();
      return () => document.querySelectorAll(".frame, .ink-defs, .toranj, .ink-word").forEach((el) => el.remove());
    },

    on: {
      home(d) {
        const box = document.getElementById("homeScene");
        box.innerHTML = shamseh() + `<p class="scene-caption"></p>`;
        box.querySelector(".scene-caption").textContent =
          d.done ? `${faDigits(d.done)} صفحه از دیوان نوشته شده` : "دیوان تازه";
        // لوگو هر بار با قلم از راست به چپ نوشته می‌شود
        const logo = document.querySelector("#screenHome .logo");
        logo.classList.remove("write");
        void logo.offsetWidth;
        logo.classList.add("write");
      },
      found(d) {
        writeWord(d.word);
      },
      shuffle() {
        document.querySelector(".toranj").animate(
          [{ transform: "rotate(0)" }, { transform: "rotate(180deg)" }],
          { duration: 700, easing: "cubic-bezier(.4,0,.2,1)" }
        );
      },
      complete(d) {
        const card = document.querySelector("#overlay .card");
        card.insertAdjacentHTML(
          "afterbegin",
          `<svg class="extra seal" viewBox="-50 -50 100 100" aria-hidden="true">
             <circle r="46" fill="#a3271b"/><circle r="40" fill="none" stroke="#f6e1c6" stroke-width="1.6" stroke-dasharray="3 2.4"/>
             <circle r="34" fill="none" stroke="#f6e1c6" stroke-width=".8"/>
             <text y="10" text-anchor="middle" font-family="Nastaliq, serif" font-size="27" fill="#f6e1c6">کلمه</text>
           </svg>`
        );
        setTimeout(() => {
          card.classList.remove("thump");
          void card.offsetWidth;
          card.classList.add("thump");
        }, 600);
        if (d.finished) document.getElementById("overlayTitle").textContent = "دیوان کامل شد!";
      },
    },
  });
})();
