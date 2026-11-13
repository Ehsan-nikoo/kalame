// صدای پیدا شدن کلمه، جدا برای هر ظاهر
// همه‌ی صداها با Web Audio ساخته می‌شوند؛ فایل صوتی لازم نیست و حجم بازی بالا نمی‌رود.
// هر بار که کلمه‌ی بعدی پشت سر هم درست باشد (streak)، صدا کمی زیرتر می‌شود.
(function () {
  "use strict";

  let ctx = null;
  let master = null;

  function audio() {
    if (ctx) return ctx;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.55;
    master.connect(ctx.destination);
    return ctx;
  }

  // مرورگرهای موبایل صدا را فقط بعد از اولین لمس کاربر اجازه می‌دهند
  function unlock() {
    const c = audio();
    if (c && c.state === "suspended") c.resume().catch(() => {});
  }
  window.addEventListener("pointerdown", unlock, { passive: true });
  window.addEventListener("touchstart", unlock, { passive: true });

  // ---------- ابزارهای کوچک ساخت صدا ----------

  // یک نت ساده با پوش (attack سریع و افت نمایی)
  function tone(t, freq, { type = "sine", dur = 0.4, vol = 0.3, attack = 0.005, glide = 0, out = master } = {}) {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (glide) o.frequency.exponentialRampToValueAtTime(freq * glide, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(out);
    o.start(t);
    o.stop(t + dur + 0.05);
  }

  let noiseBuf = null;
  function noise(t, { dur = 0.1, vol = 0.2, type = "bandpass", freq = 2000, q = 1, sweepTo = 0, out = master } = {}) {
    if (!noiseBuf) {
      noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    const src = ctx.createBufferSource();
    src.buffer = noiseBuf;
    const f = ctx.createBiquadFilter();
    f.type = type;
    f.frequency.setValueAtTime(freq, t);
    if (sweepTo) f.frequency.exponentialRampToValueAtTime(sweepTo, t + dur);
    f.Q.value = q;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f).connect(g).connect(out);
    src.start(t, Math.random() * 0.5);
    src.stop(t + dur + 0.05);
  }

  // پژواک ساده (برای آسمان و حوض)
  function echo(delay, feedback, wet) {
    const input = ctx.createGain();
    const d = ctx.createDelay(1);
    const fb = ctx.createGain();
    const w = ctx.createGain();
    d.delayTime.value = delay;
    fb.gain.value = feedback;
    w.gain.value = wet;
    input.connect(master);
    input.connect(d);
    d.connect(fb).connect(d);
    d.connect(w).connect(master);
    return input;
  }

  // زنگ با فرکانس‌های ناهماهنگ (مثل زنگ فلزی واقعی)
  function bell(t, freq, partials, { dur = 1.2, vol = 0.2, out = master } = {}) {
    partials.forEach(([ratio, amp, decay]) =>
      tone(t, freq * ratio, { dur: dur * decay, vol: vol * amp, attack: 0.002, out }));
  }

  // گام دشتی/شور‌مانند برای نت‌ها (نسبت فرکانس‌ها، با ربع‌پرده‌ی تقریبی)
  const SCALE = [1, 1.0905, 1.1892, 1.3348, 1.4983, 1.5874, 1.7818, 2];
  function note(base, step) {
    const oct = Math.floor(step / 7);
    return base * SCALE[((step % 7) + 7) % 7] * Math.pow(2, oct);
  }

  // ---------- صدای هر ظاهر ----------

  const SOUNDS = {
    // صور فلکی: چند زنگوله‌ی ریز و براق که پشت هم بالا می‌روند و در آسمان پژواک می‌دهند
    stars(t, len, lift) {
      const out = echo(0.18, 0.35, 0.4);
      const base = 880 * lift;
      const n = Math.min(len + 1, 6);
      for (let i = 0; i < n; i++) {
        bell(t + i * 0.055, note(base, i * 2), [[1, 1, 1], [2.76, 0.35, 0.5], [5.4, 0.15, 0.3]],
          { dur: 0.9, vol: 0.12, out });
      }
      tone(t + n * 0.055, base * 2, { type: "triangle", dur: 1.1, vol: 0.05, out });
    },

    // قالی‌باف: صدای چوبی شانه‌ی دار قالی (دفتین) که گره‌ها را می‌کوبد، و یک نت گرم
    carpet(t, len, lift) {
      const knocks = Math.min(len, 4);
      for (let i = 0; i < knocks; i++) {
        const tt = t + i * 0.085;
        noise(tt, { dur: 0.05, vol: 0.35, freq: 900 + i * 120, q: 4 });
        tone(tt, 180 * lift + i * 15, { type: "triangle", dur: 0.09, vol: 0.28, glide: 0.6 });
      }
      const tt = t + knocks * 0.085 + 0.02;
      tone(tt, 330 * lift, { type: "triangle", dur: 0.45, vol: 0.16 });
      tone(tt, 495 * lift, { type: "sine", dur: 0.35, vol: 0.08 });
    },

    // کاروان ابریشم: زنگ گردن شتر؛ دو ضربه‌ی زنگ برنجی بم با لرزش
    caravan(t, len, lift) {
      const base = 392 * lift;
      const brass = [[1, 1, 1], [1.5, 0.25, 0.7], [2.0, 0.45, 0.6], [2.98, 0.3, 0.4], [4.1, 0.15, 0.25]];
      bell(t, base, brass, { dur: 1.3, vol: 0.2 });
      bell(t + 0.2, base * 1.19, brass, { dur: 1.1, vol: 0.14 });
      if (len >= 4) bell(t + 0.38, base * 1.5, brass, { dur: 1.0, vol: 0.11 });
      noise(t, { dur: 0.03, vol: 0.12, freq: 4000, q: 2 });
    },

    // حوض و باغ: چکه‌ی آب در حوض؛ قطره‌هایی که صدایشان رو به بالا می‌لغزد
    garden(t, len, lift) {
      const out = echo(0.12, 0.25, 0.3);
      const drops = Math.min(len - 1, 4);
      for (let i = 0; i < drops; i++) {
        const f = (500 + i * 140) * lift * (0.95 + Math.random() * 0.1);
        tone(t + i * 0.11, f, { dur: 0.16, vol: 0.32, glide: 2.4, out });
      }
      tone(t + drops * 0.11, 1250 * lift, { dur: 0.5, vol: 0.06, out });
    },

    // قلم و مرکب: خش‌خش قلم نی روی کاغذ و بعد یک نت آرام تار
    ink(t, len, lift) {
      noise(t, { dur: 0.22, vol: 0.26, type: "bandpass", freq: 2500, sweepTo: 5500, q: 3 });
      noise(t + 0.24, { dur: 0.12, vol: 0.18, type: "bandpass", freq: 4500, sweepTo: 2200, q: 3 });
      const tt = t + 0.33;
      const base = 220 * lift;
      // تار: نت پایه با هارمونیک‌های کم‌رنگ و افت تند
      tone(tt, base, { type: "sawtooth", dur: 0.7, vol: 0.05 });
      tone(tt, base, { type: "triangle", dur: 0.9, vol: 0.2 });
      tone(tt + 0.09, note(base, 4), { type: "triangle", dur: 0.8, vol: 0.15 });
    },

    // ساده: یک «دینگ» دو نتی تمیز
    plain(t, len, lift) {
      tone(t, 660 * lift, { type: "sine", dur: 0.25, vol: 0.22 });
      tone(t + 0.09, 990 * lift, { type: "sine", dur: 0.45, vol: 0.2 });
    },
  };

  window.KalameSound = {
    // theme: شناسه‌ی ظاهر، len: طول کلمه، streak: چندمین کلمه‌ی درست پشت سر هم
    found(theme, len, streak) {
      const c = audio();
      if (!c) return;
      if (c.state === "suspended") c.resume().catch(() => {});
      const play = SOUNDS[theme] || SOUNDS.plain;
      const lift = Math.pow(2, Math.min(Math.max(streak - 1, 0), 6) / 12);
      try {
        play(c.currentTime + 0.01, len, lift);
      } catch (e) {
        // صدا نباید هیچ‌وقت بازی را خراب کند
      }
    },
  };
})();
