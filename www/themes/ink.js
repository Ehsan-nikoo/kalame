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
    div.innerHTML = `<svg viewBox="-52 -52 104 104" aria-hidden="true">
        ${scallops}<circle r="45" fill="#c9a14a"/><circle r="43.6" fill="#1f3b73"/>${dots}
        <circle r="40.6" fill="#c9a14a"/><circle r="39.6" fill="#f6ead0"/>
        <circle r="36.8" fill="none" stroke="#c9a14a" stroke-width=".5"/>
        <g fill="#c9a14a" opacity=".28">${petals}<circle r="3"/></g>
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
