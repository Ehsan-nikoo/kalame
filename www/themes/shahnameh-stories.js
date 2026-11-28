// «شاهنامه» — داستان‌های شاهنامه به ترتیب، از کیومرث تا یزدگرد (هر داستان ۶ مرحله).
// پیکره‌های تازه اینجا از روی سازنده‌های shahnameh-art.js ساخته می‌شوند.
(function () {
  const A = window.SHN_ART;
  const def = (k, box, art) => (A.FIGS[k] = { box, art });
  const man = (k, o, box = [-28, -114, 44, 2]) => def(k, box, () => A.person({ pose: "stand", ...o }));
  const ride = (k, h, p, box = [-58, -114, 58, 2]) => def(k, box, () => A.rider(h, p));
  const king = (k, p) => def(k, [-30, -120, 40, 2], () => [A.throne(), A.G(A.person({ ...p, pose: "sit" }), 0, -14)]);
  const W = "#efeadf"; // موی و ریش سپید
  const WHITE_H = { color: "#efe6d8", far: "#d6cdbf", mane: "#9a8f80", tail: "#9a8f80" };
  const BLACK_H = { color: "#2a2422", far: "#1c1816", mane: "#0f0b0a", tail: "#0f0b0a" };
  const BAY_H = { color: "#a8643a", far: "#8a4a24", mane: "#3a2210", tail: "#3a2210" };
  const GREY_H = { color: "#8d8a86", far: "#77736f" };

  // ---------- پیکره‌های تازه ----------
  man("kayumars", { robe: "#d9b46a", pat: "pat:spots:#d9b46a", robe2: "#d9b46a", head: "hair", beard: true, weapon: "hand" });
  man("siamak", { robe: "#3c6e47", pat: "pat:dots:#3c6e47", robe2: "#3c6e47", head: "helmet", weapon: "sword" });
  def("blackDiv", [-28, -128, 34, 2], () => A.div({ color: "#2b2b33" }));
  king("fereydunKing", { robe: "#3c6e47", pat: "pat:flower:#3c6e47", robe2: "#3c6e47", head: "crown", beard: true, beardc: "#d6d0c4", weapon: "hand" });
  man("salm", { robe: "#7a3a6e", pat: "pat:dots:#7a3a6e", robe2: "#7a3a6e", head: "helmet", beard: true, weapon: "spear" }, [-28, -114, 56, 2]);
  man("tur", { robe: "#5a2a1e", pat: "pat:dots:#5a2a1e", robe2: "#5a2a1e", head: "helmet", beard: true, weapon: "sword" });
  man("iraj", { robe: "#f6f1e6", pat: "pat:flower:#e9e4d6", robe2: "#e9e4d6", head: "crown", weapon: "hand" });
  ride("manuchehr", { ...WHITE_H, cloth: "pat:flower:#2a6fb3" }, { robe: "#2a6fb3", pat: "pat:flower:#2a6fb3", robe2: "#2a6fb3", head: "crown", beard: true, weapon: "spear" });
  ride("turRider", { color: "#5a4a44", far: "#43362f", cloth: "pat:dots:#7a1f1a" }, { robe: "#5a2a1e", pat: "pat:dots:#5a2a1e", robe2: "#5a2a1e", head: "helmet", beard: true, weapon: "sword" });
  man("sam", { robe: "#8d97a3", pat: "pat:mail:#9aa3ad", robe2: "#8d97a3", head: "helmet", beard: true, beardc: W, weapon: "mace" });
  ride("samRider", { ...WHITE_H, cloth: "pat:flower:#7a1f1a" }, { robe: "#8d97a3", pat: "pat:mail:#9aa3ad", robe2: "#8d97a3", head: "helmet", beard: true, beardc: W, weapon: "mace" });
  man("zalOld", { robe: "#f6f1e6", pat: "pat:flower:#e9e4d6", robe2: "#e9e4d6", head: "hair", hairc: W, beard: true, beardc: W, weapon: "hand" });
  ride("zalRider", { ...BAY_H, cloth: "pat:flower:#3c6e47" }, { robe: "#f6f1e6", pat: "pat:flower:#e9e4d6", robe2: "#e9e4d6", head: "helmet", beard: true, beardc: W, weapon: "spear" });
  man("rostamYoung", { ...A.ROSTAM, beard: false, weapon: "mace" });
  def("whiteElephant", [-52, -90, 66, 2], () => A.elephant({ color: "#efeadf", far: "#d6d0c4", cloth: false }));
  man("rostamMerchant", { robe: "#efe3c6", pat: "pat:dots:#e6d9b8", robe2: "#e6d9b8", head: "turban", beard: true, weapon: "hand" });
  def("camel", [-40, -90, 58, 2], () => A.camel({ cloth: "pat:dots:#f6f1e6" }));
  man("nowzar", { robe: "#2a6fb3", pat: "pat:flower:#2a6fb3", robe2: "#2a6fb3", head: "crown", beard: true, weapon: "sword" });
  ride("afrasiabRider", { ...BLACK_H, cloth: "pat:dots:#7a1f1a" }, { robe: "#7a1f1a", pat: "pat:dots:#7a1f1a", robe2: "#7a1f1a", head: "crown", beard: true, weapon: "sword" });
  ride("afrasiabMallet", { ...BLACK_H, cloth: "pat:dots:#7a1f1a" }, { robe: "#7a1f1a", pat: "pat:dots:#7a1f1a", robe2: "#7a1f1a", head: "crown", beard: true, weapon: "mallet" });
  man("afrasiab", { robe: "#7a1f1a", pat: "pat:dots:#7a1f1a", robe2: "#7a1f1a", head: "crown", beard: true, weapon: "hand" });
  king("kayqobad", { robe: "#b6413a", pat: "pat:flower:#b6413a", robe2: "#b6413a", head: "crown", beard: true, weapon: "cup" });
  man("sudabeh", { woman: true, robe: "#b6413a", pat: "pat:flower:#b6413a", robe2: "#b6413a", head: "veil", veilc: "#f6d6c6", weapon: "hand" });
  man("siavashStand", { robe: "#f6f1e6", pat: "pat:flower:#e9e4d6", robe2: "#e9e4d6", head: "crown", weapon: "hand" });
  ride("siavashMallet", { ...BLACK_H, cloth: "pat:flower:#b6413a" }, { robe: "#f6f1e6", pat: "pat:flower:#e9e4d6", robe2: "#e9e4d6", head: "crown", weapon: "mallet" });
  man("farangis", { woman: true, robe: "#2a9fb3", pat: "pat:flower:#2a9fb3", robe2: "#2a9fb3", head: "veil", weapon: "hand" });
  man("garsivaz", { robe: "#5a2a1e", pat: "pat:dots:#5a2a1e", robe2: "#5a2a1e", head: "cap", capc: "#7a1f1a", beard: true, weapon: "hand" });
  man("kaykhosrowYoung", { robe: "#f6f1e6", robe2: "#e9e4d6", head: "hair", weapon: "hand", boot: "#b6413a" });
  ride("kaykhosrowRider", { ...BLACK_H, cloth: "pat:flower:#2a9fb3" }, { robe: "#2a9fb3", pat: "pat:flower:#2a9fb3", robe2: "#2a9fb3", head: "crown", weapon: "spear" });
  man("kaykhosrowWalk", { robe: "#2a9fb3", pat: "pat:flower:#2a9fb3", robe2: "#2a9fb3", head: "crown", weapon: "hand" });
  ride("givRider", { ...GREY_H, cloth: "pat:dots:#3c6e47" }, { robe: "#3c6e47", pat: "pat:dots:#3c6e47", robe2: "#3c6e47", head: "helmet", beard: true, weapon: "spear" });
  man("giv", { robe: "#3c6e47", pat: "pat:dots:#3c6e47", robe2: "#3c6e47", head: "helmet", beard: true, weapon: "spear" }, [-28, -114, 56, 2]);
  ride("farangisRider", { ...WHITE_H, cloth: "pat:flower:#2a9fb3" }, { woman: true, robe: "#2a9fb3", pat: "pat:flower:#2a9fb3", robe2: "#2a9fb3", head: "veil", weapon: "hand" });
  man("forud", { robe: "#2a6fb3", pat: "pat:dots:#2a6fb3", robe2: "#2a6fb3", head: "helmet", weapon: "bow" });
  ride("tusRider", { ...WHITE_H, cloth: "pat:flower:#b6413a" }, { robe: "#b6413a", pat: "pat:dots:#b6413a", robe2: "#b6413a", head: "helmet", beard: true, beardc: "#d6d0c4", weapon: "spear" });
  ride("kamus", { color: "#5a4a44", far: "#43362f", cloth: "pat:dots:#3a2a4a" }, { robe: "#3a2a4a", pat: "pat:mail:#5a5a6a", robe2: "#3a2a4a", head: "helmet", beard: true, weapon: "mace" });
  def("khaqan", [-52, -140, 66, 2], () => A.riderOn(A.elephant, { color: "#efeadf", far: "#d6d0c4", cloth: "pat:flower:#d9a441" }, { robe: "#d9a441", pat: "pat:flower:#d9a441", robe2: "#d9a441", head: "crown", beard: true, weapon: "hand" }, -8, -38));
  man("bijan", { robe: "#b6413a", pat: "pat:dots:#b6413a", robe2: "#b6413a", head: "helmet", weapon: "sword" });
  def("boar", [-36, -46, 46, 2], A.boar);
  ride("goodarzRider", { ...WHITE_H, cloth: "pat:dots:#3c6e47" }, { robe: "#3c6e47", pat: "pat:mail:#7a9a7a", robe2: "#3c6e47", head: "helmet", beard: true, beardc: W, weapon: "spear" });
  ride("piranRider", { color: "#8a6a4a", far: "#6e5236", cloth: "pat:dots:#7a1f1a" }, { robe: "#7a1f1a", pat: "pat:dots:#7a1f1a", robe2: "#7a1f1a", head: "helmet", beard: true, beardc: W, weapon: "sword" });
  man("hom", { robe: "#efe3c6", robe2: "#e6d9b8", head: "hair", hairc: W, beard: true, beardc: W, weapon: "lasso" }, [-28, -114, 50, 2]);
  def("puladvand", [-28, -128, 34, 2], () => A.div({ color: "#4a4a52" }));
  king("lohrasp", { robe: "#3c6e47", pat: "pat:flower:#3c6e47", robe2: "#3c6e47", head: "crown", beard: true, weapon: "hand" });
  man("goshtasp", { robe: "#2a6fb3", pat: "pat:dots:#2a6fb3", robe2: "#2a6fb3", head: "cap", capc: "#2a6fb3", beard: true, weapon: "sword" });
  man("katayoun", { woman: true, robe: "#b6413a", pat: "pat:flower:#b6413a", robe2: "#b6413a", head: "veil", veilc: "#f6e0e6", weapon: "orange" });
  def("wolf", [-50, -50, 44, 2], A.wolf);
  man("zartosht", { robe: "#f6f1e6", pat: "pat:dots:#efe9dc", robe2: "#efe9dc", head: "turban", beard: true, beardc: W, weapon: "hand" });
  ride("arjasp", { color: "#5a4a44", far: "#43362f", cloth: "pat:dots:#5a2a1e" }, { robe: "#5a2a1e", pat: "pat:dots:#5a2a1e", robe2: "#5a2a1e", head: "helmet", beard: true, weapon: "spear" });
  man("esfandiyarStand", { robe: "#8d97a3", pat: "pat:mail:#9aa3ad", robe2: "#8d97a3", head: "helmet", beard: true, weapon: "sword" });
  man("esfandiyarMerchant", { robe: "#efe3c6", pat: "pat:dots:#e6d9b8", robe2: "#e6d9b8", head: "turban", beard: true, weapon: "hand" });
  man("bahman", { robe: "#8d97a3", pat: "pat:mail:#9aa3ad", robe2: "#8d97a3", head: "helmet", weapon: "spear" }, [-28, -114, 56, 2]);
  man("gazer", { robe: "#efe3c6", robe2: "#e6d9b8", head: "cap", capc: "#5a4a6a", beard: true, weapon: "hand" });
  man("homay", { woman: true, robe: "#7a3a6e", pat: "pat:flower:#7a3a6e", robe2: "#7a3a6e", head: "veil", veilc: "#e6d0f0", weapon: "hand" });
  ride("darab", { color: "#c9a46a", far: "#a8864e", cloth: "pat:flower:#2a6fb3" }, { robe: "#2a6fb3", pat: "pat:dots:#2a6fb3", robe2: "#2a6fb3", head: "helmet", beard: true, weapon: "spear" });
  man("dara", { robe: "#b6413a", pat: "pat:flower:#b6413a", robe2: "#b6413a", head: "crown", beard: true, weapon: "hand" });
  ride("iskandar", { ...WHITE_H, cloth: "pat:dots:#7a3a24" }, { robe: "#7a3a24", pat: "pat:dots:#7a3a24", robe2: "#7a3a24", head: "helmet", weapon: "sword" });
  man("iskandarStand", { robe: "#7a3a24", pat: "pat:dots:#7a3a24", robe2: "#7a3a24", head: "crown", weapon: "hand" });
  man("khezr", { robe: "#3c6e47", pat: "pat:dots:#3c6e47", robe2: "#3c6e47", head: "turban", beard: true, beardc: W, weapon: "hand" });
  ride("ardashirRider", { ...A.RAKHSH, spots: false, cloth: "pat:dots:#2a6fb3" }, { robe: "#2a6fb3", pat: "pat:dots:#2a6fb3", robe2: "#2a6fb3", head: "crown", beard: true, weapon: "spear" });
  ride("golnarRider", { ...WHITE_H, cloth: "pat:flower:#d76f8a" }, { woman: true, robe: "#d76f8a", pat: "pat:flower:#d76f8a", robe2: "#d76f8a", head: "veil", weapon: "hand" });
  ride("ardavan", { ...BLACK_H, cloth: "pat:flower:#7a3a6e" }, { robe: "#7a3a6e", pat: "pat:dots:#7a3a6e", robe2: "#7a3a6e", head: "crown", beard: true, weapon: "sword" });
  man("ardashir", { robe: "#2a6fb3", pat: "pat:dots:#2a6fb3", robe2: "#2a6fb3", head: "crown", beard: true, weapon: "mace" });
  def("worm", [-60, -70, 66, 4], A.worm);
  man("haftvad", { robe: "#5a4a6a", robe2: "#5a4a6a", head: "cap", capc: "#3a2a4a", beard: true, beardc: "#d6d0c4", weapon: "hand" });
  man("monzer", { robe: "#efe3c6", pat: "pat:dots:#e6d9b8", robe2: "#e6d9b8", head: "turban", beard: true, weapon: "hand" });
  ride("bahramYoung", { color: "#c9a46a", far: "#a8864e", cloth: "pat:flower:#b6413a" }, { robe: "#b6413a", pat: "pat:flower:#b6413a", robe2: "#b6413a", head: "hair", weapon: "bow" });
  def("bahramCamel", [-44, -132, 60, 2], () => [...A.camel({ cloth: "pat:flower:#b6413a" }),
    A.G(A.person({ woman: true, robe: "#d76f8a", pat: "pat:flower:#d76f8a", robe2: "#d76f8a", head: "veil", weapon: "lute", pose: "ride" }), -16, -26),
    A.G(A.person({ robe: "#b6413a", pat: "pat:flower:#b6413a", robe2: "#b6413a", head: "crown", beard: true, weapon: "bow", pose: "ride" }), 0, -28)]);
  man("lonbak", { robe: "#7a5a3a", robe2: "#7a5a3a", head: "cap", capc: "#3c6e47", beard: true, weapon: "cup" });
  ride("bahramHunt", { color: "#c9a46a", far: "#a8864e", cloth: "pat:flower:#b6413a" }, { robe: "#b6413a", pat: "pat:flower:#b6413a", robe2: "#b6413a", head: "crown", beard: true, weapon: "bow" });
  def("gour", [-58, -80, 50, 2], () => A.horse({ color: "#c9a98a", far: "#a88a6e", mane: "#5a4a3a", tail: "#5a4a3a", wild: true }));
  def("deer", [-24, -70, 38, 2], A.deer);
  man("mazdak", { robe: "#3a2a4a", pat: "pat:dots:#3a2a4a", robe2: "#3a2a4a", head: "turban", beard: true, weapon: "hand" });
  man("borzuy", { robe: "#2a6fb3", pat: "pat:dots:#2a6fb3", robe2: "#2a6fb3", head: "turban", beard: true, weapon: "pen" });
  man("shoemaker", { robe: "#7a5a3a", robe2: "#7a5a3a", head: "cap", capc: "#5a2a1e", beard: true, weapon: "hand" });
  ride("bahramChubin", { ...BLACK_H, cloth: "pat:dots:#5a2a1e" }, { robe: "#5a2a1e", pat: "pat:mail:#7a6a6a", robe2: "#5a2a1e", head: "helmet", beard: true, weapon: "bow" });
  def("savehShah", [-52, -140, 66, 2], () => A.riderOn(A.elephant, { color: "#8d8a96", cloth: "pat:flower:#d9a441" }, { robe: "#d9a441", pat: "pat:flower:#d9a441", robe2: "#d9a441", head: "crown", beard: true, weapon: "spear" }, -8, -38));
  ride("gordiyeh", { ...A.RAKHSH, spots: false, cloth: "pat:flower:#7a3a6e" }, { woman: true, robe: "#7a3a6e", pat: "pat:dots:#7a3a6e", robe2: "#7a3a6e", head: "helmet", weapon: "spear" });
  ride("khosrowRider", { ...BLACK_H, cloth: "pat:flower:#2a6fb3" }, { robe: "#2a6fb3", pat: "pat:flower:#2a6fb3", robe2: "#2a6fb3", head: "crown", beard: true, weapon: "sword" });
  man("khosrow", { robe: "#2a6fb3", pat: "pat:flower:#2a6fb3", robe2: "#2a6fb3", head: "crown", beard: true, weapon: "hand" });
  king("khosrowKing", { robe: "#2a6fb3", pat: "pat:flower:#2a6fb3", robe2: "#2a6fb3", head: "crown", beard: true, weapon: "cup" });
  man("shirin", { woman: true, robe: "#b6413a", pat: "pat:flower:#b6413a", robe2: "#b6413a", head: "veil", veilc: "#f6e0e6", weapon: "hand" });
  def("shabdiz", [-58, -80, 50, 2], () => A.horse({ ...BLACK_H, pose: "stand", cloth: "pat:flower:#b6413a" }));
  man("barbad", { robe: "#3c6e47", pat: "pat:flower:#3c6e47", robe2: "#3c6e47", head: "cap", capc: "#b6413a", beard: true, weapon: "lute" });
  ride("rostamF", { ...WHITE_H, cloth: "pat:dots:#2a6fb3" }, { robe: "#8d97a3", pat: "pat:mail:#9aa3ad", robe2: "#8d97a3", head: "helmet", beard: true, weapon: "spear" });
  man("yazdegerd", { robe: "#7a3a6e", pat: "pat:flower:#7a3a6e", robe2: "#7a3a6e", head: "crown", beard: true, weapon: "hand" });
  man("miller", { robe: "#efe3c6", robe2: "#e6d9b8", head: "cap", capc: "#7a5a3a", beard: true, weapon: "hand" });
  def("puran", [-30, -120, 40, 2], () => [A.throne(), A.G(A.person({ woman: true, robe: "#b6413a", pat: "pat:flower:#b6413a", robe2: "#b6413a", head: "veil", veilc: "#f6e0e6", pose: "sit", weapon: "hand" }), 0, -14)]);
  man("ferdowsi", { robe: "#f6f1e6", pat: "pat:dots:#efe9dc", robe2: "#efe9dc", head: "turban", beard: true, beardc: W, weapon: "pen" });
  man("ashkbus", { robe: "#5a2a1e", pat: "pat:dots:#5a2a1e", robe2: "#5a2a1e", head: "helmet", beard: true, weapon: "bow" });
  man("sohrabYoung", { robe: "#2a6fb3", pat: "pat:dots:#2a6fb3", robe2: "#2a6fb3", head: "helmet", weapon: "lasso" }, [-28, -114, 50, 2]);
  man("hojir", { robe: "#3c6e47", robe2: "#3c6e47", head: "helmet", beard: true, bound: true });
  man("mehrab", { robe: "#d9a441", pat: "pat:flower:#d9a441", robe2: "#d9a441", head: "turban", beard: true, weapon: "hand" });

  // ---------- چیدمان داستان‌ها ----------
  const L = (fig, o) => ({ fig, x: -2.6, z: 1, ...o });
  const R = (fig, o) => ({ fig, x: 2.6, z: 0.6, f: 1, ...o });
  const S = (name, sky, ground, hills, props, a, b, life, line, more) => ({ name, sky, ground, hills, props, a, b, life, line, ...more });
  const T = (x, z) => ["cypress", x, z], C = (x, z) => ["chenar", x, z], Bl = (x, z) => ["blossom", x, z];

  window.SHN_STORIES = [
    // ——— پیشدادیان ———
    S("کیومرث، نخستین شاه", "gold", "green", "peak", [T(-7, -2.6), C(6.6, -2.8)], ["کیومرث", L("kayumars", { x: -1.6 })], ["دد و دام", R("deer", { x: 1.6, z: 0.8 }), R("ram", { x: 3.8, z: 1.2, s: 1.1 })], ["clouds", "birds"],
      "کیومرث نخستین شاه بود؛ در کوه می‌زیست، پلنگینه می‌پوشید و دد و دام گرد تختش می‌آمدند."),
    S("سیامک و دیو سیاه", "dusk", "ochre", "rocks", [T(-7.2, -2.6)], ["سیامک", L("siamak")], ["دیو سیاه", R("blackDiv", { z: 0.4 })], ["dust", "clouds"],
      "سیامک، پسر کیومرث، به جنگ دیو سیاه رفت؛ پس از او هوشنگ کین پدر را گرفت."),
    S("هوشنگ و پیدایش آتش", "dawn", "ochre", "rocks", [C(-6.5, -2.6), ["stone", 2.4, 0.4]], ["هوشنگ", L("hushang", { x: -2.8 })], ["مار سیاه", { fig: "snake", x: 3.4, y: 0.9, z: 0.6, s: 0.9, f: 1 }], ["spark", "clouds"],
      "سنگی که هوشنگ به سوی مار انداخت به سنگ دیگری خورد و از جرقه‌اش آتش پدید آمد؛ جشن سده یادگار آن روز است."),
    S("تهمورث دیوبند", "gold", "sage", "range", [T(-7.2, -2.4), ["castle", 5.2, -3.6]], ["تهمورث", L("tahmuras", { x: -2.4 })], ["دیو در بند", R("divBrown", { x: 2.4, s: 0.95 })], ["clouds", "birds"],
      "تهمورث دیوان را به بند کشید و آن‌ها در برابر آزادی، نوشتن را به او آموختند."),
    S("جمشید و نوروز", "blue", "green", "range", [Bl(-6.6, -2.6), Bl(6.6, -2.6)], ["جمشید", { fig: "jamshid", x: 0, y: 1.6, z: 0.2, s: 0.95, anim: "float" }], ["دیوان تخت‌بر", { fig: "div", x: -3.2, z: 0.8, s: 0.8 }, { fig: "divWhite", x: 3.2, z: 0.8, s: 0.8, f: 1 }], ["clouds", "birds", "petals"],
      "جمشید بر تختی نشست که دیوان به آسمان بردند و مردم آن روز را نوروز نامیدند."),
    S("ضحاک ماردوش", "lapis", "lilac", "rocks", [["castle", 0, -3.8], T(-7, -2.4)], ["ضحاک", L("zahhak", { x: -1.6, z: 0.8 })], ["موبد خوابگزار", R("sage", { x: 2.8, z: 1.2 })], ["stars", "torch"],
      "ضحاک خوابی هراسناک دید و موبدان گفتند فریدون روزی تاج و تخت او را خواهد گرفت."),
    S("کاوه‌ی آهنگر", "gold", "ochre", "range", [["castle", 4.8, -3.6], C(-6.8, -2.6)], ["کاوه", L("kaveh", { x: -1.6 })], ["درفش کاویانی", { prop: "banner", x: -0.6, z: 0.9 }], ["wave", "birds"],
      "کاوه پیش‌بند چرمی آهنگری‌اش را بر سر نیزه کرد و مردم را به برخاستن برابر ضحاک خواند."),
    S("فریدون و ضحاک", "gold", "sage", "damavand", [T(-7, -2.4), T(7, -2.4)], ["فریدون", L("fereydun", { x: -2.4 })], ["ضحاک در بند", R("zahhakBound", { x: 3.2, z: 0.2, s: 0.85 })], ["clouds", "birds"],
      "فریدون با گرز گاوسر بر ضحاک چیره شد و او را در کوه دماوند به بند کشید."),
    S("فریدون و سه پسر", "gold", "green", "range", [Bl(-7, -2.6), ["castle", 5.4, -3.8]], ["فریدون", L("fereydunKing", { x: -3, z: 0.2, s: 0.9 })], ["سلم و تور و ایرج", { fig: "salm", x: 0.4, z: 0.8, s: 0.85, f: 1 }, { fig: "tur", x: 2.2, z: 0.6, s: 0.85, f: 1 }, { fig: "iraj", x: 4, z: 1, s: 0.85, f: 1 }], ["petals", "birds"],
      "فریدون جهان را میان پسرانش بخش کرد: روم به سلم، توران به تور و ایران به ایرج."),
    S("ایرج و برادران", "dusk", "ochre", "rocks", [T(-7.2, -2.6)], ["ایرج", L("iraj", { x: -2 })], ["سلم و تور", R("salm", { x: 2, z: 0.8 }), R("tur", { x: 4, z: 0.2 })], ["dust", "birds"],
      "ایرج بی‌سلاح به نزد برادرانش رفت تا آشتی کند، اما سلم و تور از رشک او را کشتند."),
    S("منوچهر، کین‌خواه ایرج", "gold", "sage", "range", [T(-7, -2.6)], ["منوچهر", L("manuchehr", { x: -2.4, s: 0.95 })], ["تور", R("turRider", { x: 2.8, s: 0.95 })], ["dust", "flags"],
      "منوچهر، نواده‌ی ایرج، به کین‌خواهی برخاست و سلم و تور را شکست داد."),
    S("سام و اژدهای کشف", "dawn", "sage", "rocks", [T(-7.2, -2.6)], ["سام", L("samRider", { x: -2.6, s: 0.95 })], ["اژدهای کشف", R("dragon", { x: 3, z: 0, s: 0.9 })], ["breath", "clouds"],
      "سام، پهلوان پیر، اژدهای رود کشف را با گرز گاوسر از پا درآورد."),
    S("زال و سیمرغ", "gold", "green", "peak", [T(-7, -2.5), Bl(-4.6, -3.4), ["nest", 3.45, -4.75]], ["زال", L("zalChild", { s: 0.8 })], ["سیمرغ", { fig: "simorgh", x: 1.6, y: 2.5, z: 0.4, s: 0.85, f: 1, anim: "fly" }], ["clouds", "birds"],
      "سام، زالِ سپیدموی را در البرزکوه رها کرد و سیمرغ او را در آشیانه‌اش پرورد."),
    S("بازگشت زال", "gold", "green", "peak", [T(-7, -2.5), ["nest", 3.45, -4.75]], ["سام", L("sam", { x: -3.2 })], ["زال و سیمرغ", R("zal", { x: 0.6, z: 1.2 }), { fig: "simorgh", x: 3.2, y: 2.6, z: 0, s: 0.75, f: 1, anim: "fly" }], ["clouds", "birds"],
      "سام پشیمان به البرز آمد؛ سیمرغ زال را با پری از خود، برای روز سختی، به پدر بازگرداند."),
    S("زال و مهراب کابلی", "blue", "green", "range", [["castle", 4.8, -3.6], Bl(-6.6, -2.6)], ["زال", L("zal")], ["مهراب", R("mehrab")], ["petals", "birds"],
      "زال به کابل رفت و مهراب، شاه کابل، او را گرامی داشت؛ آنجا بود که آوازه‌ی رودابه را شنید."),
    S("زال و رودابه", "lapis", "green", "range", [["tower", 2.6, -1.4], Bl(-6.4, -2.4)], ["زال", L("zal", { x: -1.6, z: 1.2 })], ["رودابه", { fig: "rudabeh", x: 2.6, y: 2.75, z: -0.2, s: 0.55, f: 1 }], ["stars", "braid"],
      "رودابه گیسوی بلندش را از بام کاخ پایین انداخت، اما زال با کمند بالا رفت."),
    S("زاده شدن رستم", "dawn", "green", "peak", [["tower", -4.6, -2.6], Bl(5.6, -2.6)], ["زال", L("zal", { x: -1.4 })], ["سیمرغ", { fig: "simorgh", x: 2.4, y: 2.4, z: 0, s: 0.8, f: 1, anim: "fly" }], ["glow", "clouds"],
      "رودابه در زادن رستم درمانده بود؛ زال پر سیمرغ را آتش زد و سیمرغ راه را به او نشان داد."),
    S("رستم و پیل سپید", "lapis", "sage", "range", [["castle", -5, -3.8]], ["رستم نوجوان", L("rostamYoung", { x: -2.4, s: 0.78 })], ["پیل سپید", R("whiteElephant", { x: 2.4, s: 0.9 })], ["stars", "torch"],
      "رستمِ نوجوان، شبانه با گرز نیایش سام، پیل سپیدِ دیوانه را از پا درآورد."),
    S("رستم و دژ سپند", "gold", "desert", "peak", [["castle", 3.6, -3.2]], ["رستم بازرگان", L("rostamMerchant", { x: -2.2 })], ["کاروان نمک", R("camel", { x: -4.6, z: 0.2, f: 0, s: 0.95 })], ["clouds", "dust"],
      "رستم در جامه‌ی بازرگان نمک به دژ کوه سپند راه یافت و کین نیایش نریمان را گرفت."),
    S("رستم و رخش", "gold", "green", "rocks", [C(-6.6, -2.6), Bl(6.4, -3)], ["رستم", L("rostamLasso", { x: -2.8 })], ["رخش", R("rakhshStand", { z: 0.4, s: 0.95 })], ["clouds", "birds"],
      "رستم از میان گله‌ی اسبان، کره‌ی گلرنگی را با کمند گرفت و نامش را رخش گذاشت."),
    S("نوذر و افراسیاب", "dusk", "ochre", "range", [T(-7.2, -2.6)], ["نوذر", L("nowzar")], ["افراسیاب", R("afrasiabRider", { x: 2.8, s: 0.95 })], ["dust", "flags"],
      "افراسیاب، پهلوان توران، به ایران تاخت و نوذر شاه را در جنگ شکست داد."),
    S("رستم و کیقباد", "gold", "green", "peak", [C(4.6, -2.4), Bl(-6.6, -2.6)], ["رستم", L("rostamMace", { x: -3 })], ["کیقباد", R("kayqobad", { x: 1.8, z: 0.4, s: 0.9 })], ["petals", "birds"],
      "رستم در البرزکوه کیقباد را یافت و او را برای شاهی به ایران آورد."),
    S("رستم و افراسیاب", "gold", "ochre", "rocks", [T(-7.2, -2.6)], ["رستم", L("rostamRider", { x: -2, s: 0.95 })], ["افراسیاب", R("afrasiabRider", { x: 2, s: 0.95 })], ["dust", "flags"],
      "رستم در نخستین نبردش افراسیاب را از کمربند گرفت و از زین برکند؛ اما کمربند گسست و او گریخت."),
    // ——— کیانیان: کاووس و هفت‌خان ———
    S("کاووس در مازندران", "lapis", "lilac", "cave", [T(-7, -2.4)], ["کاووس", L("kavus", { x: -2.6, z: 0.4, s: 0.9 })], ["دیو سپید", R("divWhite", { x: 2.2, z: -0.6 })], ["stars", "torch"],
      "کاووس به هوس مازندران لشکر کشید و دیو سپید او و سپاهش را نابینا و در بند کرد."),
    S("هفت‌خان: رخش و شیر", "lapis", "sage", "rocks", [C(-6.6, -2.6), T(6.8, -2.6)], ["رخش", L("rakhsh", { x: -2.2, s: 0.95 })], ["شیر", R("lion", { x: 3, s: 1.05 })], ["stars", "fireflies"],
      "خان یکم: رستم در بیشه خفته بود که شیری آمد و رخشِ وفادار او را از پا درآورد."),
    S("هفت‌خان: میش و چشمه", "dawn", "desert", "dunes", [["stone", -6, -2.2]], ["رستم", L("rostamSword")], ["میش", R("ram", { z: 0.8, s: 1.2 })], ["spring", "clouds"],
      "خان دوم: در بیابان بی‌آب، رستم از تشنگی درمانده بود که میشی او را به چشمه رساند."),
    S("هفت‌خان: اژدها", "gold", "sage", "rocks", [["rakhshProp", -6.2, -2.4], T(7, -2.6)], ["رستم", L("rostamSword", { x: -2.8, z: 1.2 })], ["اژدها", R("dragon", { x: 3, z: 0, s: 0.9 })], ["breath", "clouds"],
      "خان سوم: رخش سه بار رستم را از خواب بیدار کرد تا سرانجام اژدها را دید و با او جنگید."),
    S("هفت‌خان: زن جادو", "dawn", "green", "range", [Bl(-6.4, -2.6), C(6.6, -2.8)], ["رستم", L("rostamMace", { x: -2.4 })], ["زن جادو", R("witch", { x: 2.4, z: 0.8 })], ["petals", "birds"],
      "خان چهارم: جادوگری به چهره‌ی زنی زیبا پیش رستم آمد، اما با نام یزدان چهره‌ی راستینش آشکار شد."),
    S("هفت‌خان: اولاد", "gold", "green", "range", [C(-6.8, -2.8)], ["رستم", L("rostamRider", { x: -2.2, s: 0.95 })], ["اولاد", R("olad", { x: 3.2 })], ["clouds", "birds"],
      "خان پنجم: رستم، اولاد را با کمند گرفت و او راه دیو سپید را نشانش داد."),
    S("هفت‌خان: ارژنگ دیو", "dawn", "ochre", "rocks", [T(-7, -2.6)], ["رستم", L("rostamRiderSpear", { x: -2.4, s: 0.95 })], ["ارژنگ دیو", R("div", { x: 3, z: 0.4 })], ["dust", "clouds"],
      "خان ششم: رستم، ارژنگ دیو را شکست داد و سپاه دیوان پراکنده شد."),
    S("هفت‌خان: دیو سپید", "lapis", "lilac", "cave", [["stone", -6.4, -1.6]], ["رستم", L("rostamSword", { z: 1.2 })], ["دیو سپید", R("divWhite", { x: 2.2, z: -0.6, s: 1.05 })], ["stars", "torch"],
      "خان هفتم: در غاری تاریک، رستم با دیو سپید جنگید و کاووس و یارانش را از بند رهاند."),
    S("رستم و شاه مازندران", "dusk", "lilac", "rocks", [T(-7.2, -2.6)], ["رستم", L("rostamMace")], ["شاه سنگ‌شده", { prop: "bigstone", x: 2.6, z: 0.4 }], ["dust", "birds"],
      "شاه مازندران به جادو خود را سنگ کرد؛ رستم سنگ را به اردوگاه برد تا ناچار از آن بیرون آمد."),
    S("کاووس و سودابه", "blue", "green", "range", [["castle", 4.8, -3.6], Bl(-6.6, -2.6)], ["کاووس", L("kavus", { x: -2.8, z: 0.2, s: 0.9 })], ["سودابه", R("sudabeh", { x: 2 })], ["petals", "birds"],
      "کاووس با سودابه، دختر شاه هاماوران، پیوند بست؛ شاه هاماوران او را به بند کشید تا رستم رهایش کرد."),
    S("کاووس و پرواز با عقاب‌ها", "blue", "green", "range", [T(-7, -2.6), Bl(6.6, -2.8)], ["کاووس", { fig: "kavus", x: 0, y: 2.4, z: 0, s: 0.85, anim: "float" }], ["چهار عقاب", { fig: "eagle", x: -2.8, y: 4.6, z: -0.4, s: 0.85, anim: "fly" }, { fig: "eagle", x: 2.8, y: 4.6, z: -0.4, s: 0.85, f: 1, anim: "fly" }, { fig: "eagle", x: -2.2, y: 3.4, z: 0.6, s: 0.8, anim: "fly" }, { fig: "eagle", x: 2.2, y: 3.4, z: 0.6, s: 0.8, f: 1, anim: "fly" }], ["clouds", "ropes"],
      "کاووس بر تختی نشست که چهار عقاب آن را به آسمان بردند، اما سرانجام در بیشه‌ای فرو افتاد."),
    S("هفت گردان در شکارگاه", "gold", "green", "range", [C(-6.8, -2.6), T(7, -2.6)], ["رستم", L("rostamRider", { x: -2.8, s: 0.9 })], ["گیو و نخجیر", R("givRider", { x: 1.2, s: 0.9, f: 0 }), R("gour", { x: 4.4, z: 0.2, s: 0.8 })], ["dust", "birds"],
      "رستم با هفت پهلوان ایران به نخجیرگاه افراسیاب رفت و جشن شکار برپا کرد."),
    // ——— رستم و سهراب ———
    S("رستم و تهمینه", "lapis", "lilac", "range", [["castle", 4.6, -3.6], T(-7, -2.6)], ["رستم", L("rostamMace", { x: -2.2 })], ["تهمینه", R("tahmineh", { x: 1.8, z: 1 })], ["stars", "candle"],
      "در سمنگان، تهمینه شمع به دست به دیدار رستم آمد؛ از آن پیوند، سهراب زاده شد."),
    S("سهراب و هجیر", "gold", "ochre", "rocks", [["castle", 4.6, -3.6]], ["سهراب", L("sohrabYoung", { x: -2 })], ["هجیر در بند", R("hojir", { x: 1.6, z: 0.9 })], ["dust", "flags"],
      "سهراب به ایران تاخت و هجیر، نگهبان دژ سپید، را به بند کشید."),
    S("گردآفرید و سهراب", "gold", "ochre", "rocks", [["castle", -4.6, -3.6]], ["گردآفرید", L("gordafarid", { x: -2, s: 0.95 })], ["سهراب", R("sohrab", { x: 3, z: 0.4, s: 0.95 })], ["dust", "flags"],
      "گردآفرید، دختر دلاور دژ سپید، جامه‌ی رزم پوشید و به نبرد سهراب رفت."),
    S("رستم و سهراب", "dusk", "ochre", "range", [T(-7, -2.6), T(7, -2.6)], ["رستم", L("rostamRiderSpear", { s: 0.95 })], ["سهراب", R("sohrab", { s: 0.95 })], ["dust", "birds"],
      "پدر و پسر یکدیگر را نشناختند و در میدان نبرد رو در روی هم ایستادند."),
    // ——— سیاوش ———
    S("سیاوش و سودابه", "blue", "lilac", "range", [["castle", 0, -3.8], Bl(-6.6, -2.6)], ["سیاوش", L("siavashStand", { x: -2.4 })], ["سودابه", R("sudabeh", { x: 2.4 })], ["petals", "birds"],
      "سودابه دل به سیاوش بست، اما سیاوشِ پاکدامن از او روی گرداند."),
    S("گذر سیاوش از آتش", "dusk", "ochre", "rocks", [T(-7.4, -2.6)], ["سیاوش", { fig: "siavash", x: 0, z: 0.6, s: 0.95, anim: "ride" }], ["کوه آتش", { prop: "fire", x: 0, z: 0.6 }], ["flames", "sparks"],
      "سیاوش برای نشان دادن بی‌گناهی‌اش، سوار بر شبرنگ از میان کوه آتش گذشت و آسیبی ندید."),
    S("سیاوش و چوگان", "gold", "green", "range", [T(-7.2, -2.6), T(7.2, -2.6), ["ball", 0.2, 1.6]], ["سیاوش", L("siavashMallet", { x: -2.4, s: 0.95 })], ["افراسیاب", R("afrasiabMallet", { x: 2.8, s: 0.95 })], ["dust", "flags"],
      "سیاوش در توران با افراسیاب چوگان باخت و گوی را چنان زد که از دیده ناپدید شد."),
    S("سیاوش و فرنگیس", "blue", "green", "range", [["castle", 4.6, -3.6], Bl(-6.6, -2.6)], ["سیاوش", L("siavashStand", { x: -2 })], ["فرنگیس", R("farangis", { x: 1.6, z: 1 })], ["petals", "birds"],
      "سیاوش با فرنگیس، دختر افراسیاب، پیوند بست و شهر زیبای سیاوشگرد را ساخت."),
    S("سیاوش و گرسیوز", "dusk", "ochre", "rocks", [C(-6.6, -2.6)], ["سیاوش", L("siavash", { x: -2.4, s: 0.95 })], ["گرسیوز", R("garsivaz", { x: 2.6 })], ["petals", "dust"],
      "گرسیوز با نیرنگ، افراسیاب را بر سیاوش بدگمان کرد؛ از خون سیاوش گیاه پرسیاوشان رویید."),
    // ——— کیخسرو ———
    S("گیو و کیخسرو", "gold", "green", "range", [C(-6.4, -2.6), T(6.8, -2.6)], ["گیو", L("giv", { x: -2.4 })], ["کیخسرو", R("kaykhosrowYoung", { x: 2, z: 1 })], ["clouds", "birds"],
      "گیو هفت سال در توران گشت تا کیخسرو، پسر سیاوش، را یافت."),
    S("گذر از جیحون", "dawn", "sage", "range", [T(-7.2, -2.8)], ["کیخسرو و فرنگیس", L("kaykhosrowRider", { x: -2.6, z: 0.4, s: 0.9 }), L("farangisRider", { x: 0.2, z: -0.2, s: 0.8 })], ["گیو", R("givRider", { x: 3.2, z: 0.8, s: 0.9, f: 0 })], ["birds", "clouds"],
      "کیخسرو و فرنگیس و گیو، بی‌کشتی و سواره، از رود خروشان جیحون گذشتند.", { water: "river" }),
    S("کیخسرو و دژ بهمن", "dusk", "lilac", "rocks", [["castle", 2.6, -3.6]], ["کیخسرو", L("kaykhosrowRider", { x: -2.4, s: 0.95 })], ["دژ جادو", { prop: "fire", x: 2.6, z: -2.4, small: 1 }], ["flames", "sparks"],
      "دژ جادویی بهمن به دست کیخسرو گشوده شد و همه دانستند که او شایسته‌ی شاهی است."),
    S("فرود سیاوش", "gold", "ochre", "peak", [["castle", 3.6, -3.4]], ["فرود", R("forud", { x: 3.4, y: 2.45, z: -2.8, s: 0.6 })], ["توس", L("tusRider", { x: -2.4, s: 0.95, f: 0 })], ["flags", "birds"],
      "فرود، برادر کیخسرو، بر دژ کلات ایستاده بود که سپاه توس از راه رسید."),
    S("رستم و اشکبوس", "dawn", "ochre", "rocks", [T(-7.2, -2.6)], ["رستم", L("rostamBow", { x: -2.8 })], ["اشکبوس", R("ashkbus", { x: 2.6 })], ["dust", "birds"],
      "رستم پیاده به میدان رفت و اشکبوسِ کشانی را با یک تیر از پا درآورد."),
    S("رستم و کاموس کشانی", "dusk", "sage", "range", [T(-7.2, -2.6)], ["رستم", L("rostamRider", { x: -2.4, s: 0.95 })], ["کاموس", R("kamus", { x: 2.8, s: 1.05 })], ["dust", "flags"],
      "رستم کاموسِ کشانی، پهلوان تنومند توران، را با کمند از اسب به زیر کشید."),
    S("رستم و خاقان چین", "gold", "ochre", "range", [T(-7.2, -2.6)], ["رستم", L("rostamRiderSpear", { x: -2.8, s: 0.95 })], ["خاقان چین", R("khaqan", { x: 2.6, z: 0.2, s: 0.85 })], ["dust", "flags"],
      "رستم، خاقان چین را که بر پیل سپید نشسته بود، با کمند گرفت."),
    S("رستم و اکوان دیو", "dawn", "green", "range", [C(-6.4, -2.6), ["stone", 6.2, -2]], ["رستم", L("rostamMace", { x: -2.4 })], ["اکوان دیو", R("divBrown", { y: 0.6, z: 0, s: 1.05, anim: "float" })], ["clouds", "birds"],
      "اکوان دیو، زمینی را که رستم بر آن خفته بود از جا کند و او را به دریا انداخت، اما رستم از آب گذشت و او را شکست داد."),
    S("بیژن و گرازان", "gold", "green", "range", [C(-6.4, -2.6), C(6.4, -2.6)], ["بیژن", L("bijan", { x: -2.4 })], ["گرازها", R("boar", { x: 1.8, z: 0.8, s: 1.1 }), R("boar", { x: 4.2, z: 0.2, s: 0.95 })], ["dust", "birds"],
      "بیژن گرازهایی را که کشتزارهای ارمانیان را ویران می‌کردند، از پا درآورد."),
    S("بیژن و منیژه", "blue", "green", "range", [["tent", 3.4, -2], Bl(-6.4, -2.6)], ["بیژن", L("bijan", { x: -2 })], ["منیژه", R("manijeh", { x: 1.6, z: 1 })], ["petals", "birds"],
      "در جشنگاه بهاری مرز توران، بیژن و منیژه، دختر افراسیاب، یکدیگر را دیدند."),
    S("کیخسرو و جام جهان‌نما", "lapis", "sage", "range", [["castle", 4.8, -3.6], T(-7, -2.6)], ["کیخسرو", L("kaykhosrow", { x: -1.6, z: 0.6 })], ["گیو", R("sohrabStand", { z: 1 })], ["stars", "cupglow"],
      "کیخسرو در جام جهان‌نما نگریست و بیژن را در چاهی در سرزمین توران دید."),
    S("رستم و چاه بیژن", "lapis", "desert", "dunes", [["well", 1.4, 0.2], C(-6.6, -2.6)], ["منیژه", L("manijeh", { x: -1.6 })], ["رستم", R("rostamSword", { x: 4, z: 0.4 })], ["stars", "lift"],
      "بیژن در چاه زندانی بود و منیژه هر روز برایش نان می‌آورد تا رستم سنگ را از سر چاه برداشت."),
    S("رستم و پولادوند", "dusk", "ochre", "rocks", [T(-7.2, -2.6)], ["رستم", L("rostamMace")], ["پولادوند", R("puladvand", { x: 2.4 })], ["dust", "flags"],
      "رستم با پولادوندِ دیوزاد کشتی گرفت و او را بر زمین کوبید."),
    S("نبرد دوازده رخ", "gold", "sage", "range", [T(-7, -2.6), T(7, -2.6)], ["گودرز", L("goodarzRider", { s: 0.95 })], ["پیران", R("piranRider", { s: 0.95 })], ["dust", "flags"],
      "در نبرد دوازده رخ، پهلوانان ایران و توران دوبه‌دو جنگیدند و گودرز بر پیران چیره شد."),
    S("کیخسرو و افراسیاب", "dusk", "ochre", "range", [T(-7.2, -2.6)], ["کیخسرو", L("kaykhosrowRider", { s: 0.95 })], ["افراسیاب", R("afrasiabRider", { s: 0.95 })], ["dust", "flags"],
      "کیخسرو به کین پدرش سیاوش با افراسیاب جنگید و سپاه توران را شکست داد."),
    S("هوم و افراسیاب", "dawn", "green", "peak", [T(-7, -2.6)], ["هوم پارسا", L("hom", { x: -2.6 })], ["افراسیاب", R("afrasiab", { x: 1.8, z: 0.2 })], ["clouds", "birds"],
      "افراسیاب در دریاچه‌ی چیچست پنهان شد، اما هوم پارسا او را با کمند از آب بیرون کشید.", { water: "lake" }),
    S("کیخسرو در برف", "blue", "snow", "snow", [T(-7, -2.6), T(6.8, -2.8)], ["کیخسرو", L("kaykhosrowWalk", { x: 0.4, z: -0.6, f: 1, s: 0.85 })], ["پهلوانان", L("giv", { x: -3, z: 1 }), L("tusRider", { x: 3.6, z: 0.8, s: 0.85, f: 1 })], ["snow"],
      "کیخسرو از شاهی کناره گرفت و در کوهستان ناپدید شد؛ پهلوانانی که دنبالش رفتند در برف ماندند."),
    S("لهراسب شاه", "gold", "green", "range", [["castle", 0, -3.8], T(-7, -2.6)], ["لهراسب", L("lohrasp", { x: -1.4, z: 0.4, s: 0.9 })], ["زال", R("zalOld", { x: 2.8 })], ["petals", "birds"],
      "کیخسرو تاج را به لهراسب سپرد و پهلوانان، به سفارش او، لهراسب را شاه خواندند."),
    // ——— گشتاسپ و اسفندیار ———
    S("گشتاسپ و کتایون", "blue", "lilac", "range", [["castle", 4.8, -3.6], Bl(-6.6, -2.6)], ["گشتاسپ", L("goshtasp", { x: -2.2 })], ["کتایون", R("katayoun", { x: 1.8, z: 1 })], ["petals", "birds"],
      "کتایون، دختر قیصر روم، از میان همه‌ی خواستگاران، گشتاسپِ ناشناس را برگزید."),
    S("گشتاسپ و گرگ روم", "dusk", "sage", "rocks", [C(-6.6, -2.6), T(6.8, -2.6)], ["گشتاسپ", L("goshtasp")], ["گرگ", R("wolf", { s: 1.3 })], ["dust", "birds"],
      "گشتاسپ در روم گرگی سهمگین را کشت و دلاوری‌اش آشکار شد."),
    S("زرتشت و سرو کاشمر", "gold", "green", "range", [["bigcypress", 2.8, -1.6], Bl(-6.6, -2.6)], ["زرتشت", L("zartosht", { x: -2.4 })], ["گشتاسپ", R("goshtasp", { x: 0.8, z: 1.4, f: 0 })], ["petals", "birds"],
      "زرتشت پیامبر آمد و گشتاسپ آیین او را پذیرفت؛ سرو کاشمر یادگار آن روزگار است."),
    S("اسفندیار و ارجاسپ", "dusk", "ochre", "range", [T(-7.2, -2.6)], ["اسفندیار", L("esfandiyar", { s: 0.95 })], ["ارجاسپ", R("arjasp", { s: 0.95 })], ["dust", "flags"],
      "اسفندیار در جنگ با ارجاسپِ تورانی، پهلوان سپاه ایران بود."),
    S("هفت‌خان اسفندیار: گرگان", "dusk", "sage", "rocks", [T(-7.2, -2.6)], ["اسفندیار", L("esfandiyarStand")], ["دو گرگ", R("wolf", { x: 1.8, z: 0.8, s: 1.2 }), R("wolf", { x: 4.2, z: 0.2, s: 1.1 })], ["dust", "birds"],
      "خان یکم اسفندیار: دو گرگ سهمگین سر راهش آمدند و او هر دو را کشت."),
    S("هفت‌خان اسفندیار: شیران", "gold", "ochre", "rocks", [T(-7.2, -2.6)], ["اسفندیار", L("esfandiyarStand")], ["دو شیر", R("lion", { x: 1.6, z: 0.8 }), R("lion", { x: 4.2, z: 0.2, s: 0.9 })], ["dust", "birds"],
      "خان دوم اسفندیار: یک شیر نر و یک شیر ماده به او تاختند و از پا درآمدند."),
    S("هفت‌خان اسفندیار: اژدها", "dawn", "sage", "rocks", [T(-7.2, -2.6)], ["اسفندیار", L("esfandiyarStand")], ["اژدها", R("dragon", { x: 3, z: 0, s: 0.9 })], ["breath", "clouds"],
      "خان سوم اسفندیار: در گردونه‌ای پر از تیغ نشست و اژدها را از درون از پا درآورد."),
    S("هفت‌خان اسفندیار: زن جادو", "lapis", "green", "range", [Bl(-6.4, -2.6)], ["اسفندیار", L("esfandiyarStand")], ["زن جادو", R("witch", { x: 2.4 })], ["stars", "petals"],
      "خان چهارم اسفندیار: زنجیری که زرتشت به او داده بود، جادوگر را رسوا کرد."),
    S("هفت‌خان اسفندیار: سیمرغ", "gold", "green", "peak", [T(-7, -2.6)], ["اسفندیار", L("esfandiyarStand", { x: -2.8 })], ["سیمرغ", { fig: "simorgh", x: 1.6, y: 2.4, z: 0.2, s: 0.85, f: 1, anim: "fly" }], ["clouds", "birds"],
      "خان پنجم اسفندیار: با گردونه‌ی تیغ‌دار به جنگ سیمرغی سهمگین رفت."),
    S("هفت‌خان اسفندیار: برف", "blue", "snow", "snow", [T(-7, -2.6), T(6.8, -2.6)], ["اسفندیار", L("esfandiyarStand")], ["سپاه", R("giv", { x: 2.6 })], ["snow"],
      "خان ششم اسفندیار: برف و سرمایی سخت سه روز سپاه را گرفتار کرد تا با نیایش گذشت."),
    S("هفت‌خان اسفندیار: رود", "dawn", "sage", "range", [T(-7.2, -2.8)], ["اسفندیار", L("esfandiyar", { x: -2.6, z: 0.4, s: 0.9 })], ["راهنما", R("gazer", { x: 3.2, z: 0.9 })], ["birds", "clouds"],
      "خان هفتم اسفندیار: از رودی ژرف گذشت و به رویین‌دژ رسید.", { water: "river" }),
    S("اسفندیار و رویین‌دژ", "gold", "desert", "peak", [["castle", 3.6, -3.2]], ["اسفندیار بازرگان", L("esfandiyarMerchant", { x: -2.2 })], ["کاروان", R("camel", { x: -4.6, z: 0.2, f: 0, s: 0.95 })], ["dust", "clouds"],
      "اسفندیار در جامه‌ی بازرگان به رویین‌دژ راه یافت و خواهرانش را از بند رهاند."),
    S("رستم و اسفندیار", "gold", "sage", "peak", [T(-7.2, -2.6), ["tamarisk", -4.8, -2.4]], ["رستم", L("rostamBow")], ["اسفندیار", R("esfandiyar", { x: 2.8, z: 0.4, s: 0.95 })], ["simorgh", "clouds"],
      "سیمرغ راه چیره شدن بر اسفندیارِ رویین‌تن را با تیری از چوب گز به رستم نشان داد."),
    S("رستم و شغاد", "dusk", "ochre", "rocks", [C(3.6, -0.6), ["pit", -0.6, 0.6]], ["رستم", L("rostamBow", { x: -3.4, z: 1.2 })], ["شغاد", R("shaghad", { x: 3.2, z: -0.2, s: 0.9 })], ["birds", "dust"],
      "شغاد در نخجیرگاه چاه‌هایی پر از نیزه کند؛ رستم در واپسین دم، او را با تیری به درخت دوخت."),
    S("بهمن و زال", "dusk", "ochre", "range", [["castle", 4.8, -3.6]], ["بهمن", L("bahman", { x: -2.4 })], ["زال", R("zalOld", { x: 2.6 })], ["dust", "flags"],
      "بهمن، پسر اسفندیار، به کین پدر به سیستان لشکر کشید و زالِ پیر را به بند کشید."),
    S("همای و داراب", "dawn", "green", "range", [C(-6.6, -2.6), ["box", 0.6, -0.8]], ["همای", L("homay", { x: -3 })], ["گازر", R("gazer", { x: 3.2, z: 1 })], ["birds", "clouds"],
      "همای فرزندش داراب را در صندوقی به رود سپرد و گازری او را از آب گرفت و پرورد.", { water: "river" }),
    S("داراب", "gold", "ochre", "range", [["castle", 4.8, -3.6]], ["داراب", L("darab", { s: 0.95 })], ["همای", R("homay", { x: 2.4 })], ["flags", "birds"],
      "داراب بزرگ شد و پهلوانی‌اش آشکار؛ همای او را به پسری شناخت و تاج را به او سپرد."),
    // ——— اسکندر ———
    S("اسکندر و دارا", "dusk", "ochre", "range", [T(-7.2, -2.6)], ["اسکندر", L("iskandar", { s: 0.95 })], ["دارا", R("dara", { x: 2.6 })], ["dust", "birds"],
      "دارا در نبرد با اسکندر شکست خورد و در واپسین دم، دخترش روشنک را به او سپرد."),
    S("اسکندر و آب زندگی", "dark", "lilac", "rocks", [["stone", 5.6, -1.6]], ["اسکندر", L("iskandarStand")], ["خضر", R("khezr", { x: 2.2 })], ["stars", "glow"],
      "اسکندر در جست‌وجوی آب زندگی به سرزمین تاریکی رفت، اما تنها خضر به چشمه رسید.", { water: "lake" }),
    S("اسکندر و دیوار یاجوج", "dusk", "ochre", "peak", [["wall", 0, -2.6]], ["اسکندر", L("iskandarStand", { x: -2.8, z: 1.4 })], ["سازندگان", R("miller", { x: 2.8, z: 1.4 })], ["sparks", "dust"],
      "اسکندر میان دو کوه دیواری از آهن و مس ساخت تا مردم را از یاجوج و ماجوج ایمن کند."),
    S("اسکندر و درخت سخنگو", "lapis", "green", "range", [["bigtree", 2.4, -1.6]], ["اسکندر", L("iskandarStand", { x: -2.6 })], ["درخت سخنگو", { prop: "talk", x: 2.4, z: -1.6 }], ["stars", "fireflies"],
      "درختی سخنگو به اسکندر گفت که روزگارش به پایان نزدیک است."),
    // ——— ساسانیان ———
    S("اردشیر و گلنار", "lapis", "sage", "range", [["castle", 5, -3.6]], ["اردشیر", L("ardashirRider", { x: -1.6, s: 0.92 })], ["گلنار", R("golnarRider", { x: -4.4, z: 0.2, s: 0.85, f: 0 })], ["stars", "dust"],
      "اردشیر و گلنار، کنیزک اردوان، شبانه از کاخ گریختند و به پارس رفتند."),
    S("اردشیر و اردوان", "gold", "ochre", "range", [T(-7.2, -2.6)], ["اردشیر", L("ardashirRider", { s: 0.95 })], ["اردوان", R("ardavan", { s: 0.95 })], ["dust", "flags"],
      "اردشیر بر اردوان پیروز شد و پادشاهی ساسانیان را بنیاد نهاد."),
    S("اردشیر و کرم هفتواد", "dusk", "lilac", "peak", [["castle", -4.6, -3.6]], ["اردشیر", L("ardashir", { x: -2.6 })], ["کرم هفتواد", R("worm", { x: 2.6, z: 0.2, s: 0.95 })], ["dust", "torch"],
      "کرمی که هفتواد می‌پرورد چنان بزرگ شد که دژی به آن می‌نازید؛ اردشیر با سرب گداخته کارش را ساخت."),
    S("بهرام گور و منذر", "gold", "desert", "dunes", [["tent", 4.2, -2.2]], ["بهرام", L("bahramYoung", { x: -2.4, s: 0.9 })], ["منذر", R("monzer", { x: 2.2 })], ["dust", "birds"],
      "بهرام گور نزد منذرِ تازی پرورده شد و سوارکاری و شکار آموخت."),
    S("بهرام گور و آزاده", "gold", "desert", "dunes", [C(-6.6, -2.6)], ["بهرام و آزاده", L("bahramCamel", { x: -1.6, s: 0.85 })], ["آهو", R("deer", { x: 3, s: 1.2 })], ["dust", "birds"],
      "آزاده‌ی چنگ‌نواز از بهرام خواست آهویی را به شیوه‌ای شگفت شکار کند و او چنین کرد."),
    S("بهرام و تاج میان دو شیر", "gold", "green", "range", [["crown", 0.6, -0.6], T(-7, -2.6), T(7, -2.6)], ["بهرام", L("bahram", { x: -3, z: 1.2 })], ["دو شیر", { fig: "lion", x: -0.6, z: -0.4, s: 0.8 }, { fig: "lion", x: 2.4, z: -0.4, s: 0.8, f: 1 }], ["glow", "birds"],
      "بهرام برای رسیدن به تخت پادشاهی، تاج را از میان دو شیر ژیان برداشت."),
    S("بهرام گور و لنبک آبکش", "dusk", "ochre", "range", [["tent", 3.8, -2.2], C(-6.6, -2.6)], ["بهرام", L("bahram", { x: -2.4 })], ["لنبک", R("lonbak", { x: 2 })], ["stars", "torch"],
      "لنبک آبکشِ تهیدست، بهرام را ناشناس و با گشاده‌دستی مهمان کرد."),
    S("بهرام گور در شکارگاه", "gold", "sage", "range", [T(-7.2, -2.6)], ["بهرام", L("bahramHunt", { s: 0.95 })], ["گور و شیر", R("gour", { x: 2.4, s: 0.85 }), R("lion", { x: 4.6, z: 0, s: 0.8 })], ["dust", "birds"],
      "بهرام در شکار چنان چیره‌دست بود که او را بهرام گور خواندند."),
    S("بهرام گور در هند", "dawn", "green", "rocks", [C(-6.6, -2.6), ["tamarisk", 6.4, -2.6]], ["بهرام", L("bahramHunt", { s: 0.95 })], ["اژدهای هند", R("dragon", { x: 3, z: 0, s: 0.9 })], ["breath", "birds"],
      "بهرام گور در هندوستان اژدهایی را که مردم را می‌آزرد از پا درآورد."),
    S("نوشیروان و مزدک", "blue", "lilac", "range", [["castle", 0, -3.8]], ["نوشیروان", L("anushirvan", { x: -3, z: 0.2, s: 0.9 })], ["مزدک", R("mazdak", { x: 2.4 })], ["petals", "birds"],
      "مزدک از برابری سخن گفت و قباد را با خود همراه کرد، اما نوشیروان با او درافتاد."),
    S("بزرگمهر و شطرنج", "blue", "lilac", "range", [["chess", 0.6, 0.6], Bl(-6.6, -2.6)], ["نوشیروان", L("anushirvan", { x: -3.2, z: -0.2, s: 0.9 })], ["بزرگمهر", R("sage", { x: 3, z: 1 })], ["petals", "birds"],
      "فرستاده‌ی هند شطرنج آورد؛ بزرگمهر راز آن را گشود و در پاسخ، نرد را ساخت."),
    S("برزوی و کلیله و دمنه", "gold", "green", "range", [C(-6.6, -2.6), ["bigtree", 4.6, -2.2]], ["برزوی", L("borzuy", { x: -1.6 })], ["گیاه زندگی", R("sage", { x: 2.4, z: 0.4 })], ["petals", "birds"],
      "برزوی پزشک در هند به جست‌وجوی گیاه زندگی رفت و کتاب کلیله و دمنه را به ایران آورد."),
    S("نوشیروان و کفشگر", "gold", "ochre", "range", [["castle", 4.6, -3.6]], ["نوشیروان", L("anushirvan", { x: -3, z: 0.2, s: 0.9 })], ["کفشگر", R("shoemaker", { x: 2.2 })], ["birds", "dust"],
      "کفشگری توانگر در برابر وام دادن به سپاه، خواست پسرش دبیر شود؛ نوشیروان نپذیرفت."),
    S("بهرام چوبین و ساوه‌شاه", "dusk", "ochre", "range", [T(-7.2, -2.6)], ["بهرام چوبین", L("bahramChubin", { s: 0.95 })], ["ساوه‌شاه", R("savehShah", { x: 2.8, z: 0.2, s: 0.85 })], ["dust", "flags"],
      "بهرام چوبین با سپاهی اندک بر ساوه‌شاه پیروز شد و او را با تیری از پا درآورد."),
    S("گردیه", "gold", "sage", "range", [T(-7.2, -2.6)], ["گردیه", L("gordiyeh", { s: 0.95 })], ["سپاه دشمن", R("turRider", { s: 0.95 })], ["dust", "flags"],
      "گردیه، خواهر دلاور بهرام چوبین، جامه‌ی رزم پوشید و پهلوان دشمن را از پا درآورد."),
    S("خسرو پرویز و بهرام چوبین", "dusk", "ochre", "rocks", [T(-7.2, -2.6)], ["خسرو پرویز", L("khosrowRider", { s: 0.95 })], ["بهرام چوبین", R("bahramChubin", { s: 0.95 })], ["dust", "flags"],
      "بهرام چوبین بر خسرو پرویز شورید، اما خسرو با یاری روم تاج و تختش را بازگرفت."),
    S("خسرو و شیرین", "blue", "green", "range", [["castle", 4.8, -3.6], Bl(-6.6, -2.6)], ["خسرو", L("khosrow", { x: -2.2 })], ["شیرین", R("shirin", { x: 1.8, z: 1 })], ["petals", "birds"],
      "خسرو پرویز شیرین را که در جوانی دوستش داشت، به شبستان آورد."),
    S("خسرو و شبدیز", "gold", "green", "range", [C(-6.6, -2.6), T(6.8, -2.6)], ["خسرو", L("khosrow", { x: -2.6 })], ["شبدیز", R("shabdiz", { x: 2.4, z: 0.4, s: 0.95 })], ["clouds", "birds"],
      "شبدیز، اسب سیاه و بلندآوازه‌ی خسرو پرویز بود."),
    S("باربد رامشگر", "lapis", "green", "range", [["bigcypress", 2.6, -1.4], ["castle", -5, -3.8]], ["خسرو", L("khosrowKing", { x: -2.6, z: 0.4, s: 0.85 })], ["باربد", { fig: "barbad", x: 2.6, y: 2.2, z: -0.6, s: 0.55, f: 1 }], ["stars", "notes"],
      "باربد در میان شاخه‌های سرو پنهان شد و با سرودش خسرو را چنان شیفته کرد که رامشگر دربارش شد."),
    S("طاق کسری", "gold", "ochre", "range", [["arch", 0, -2.8]], ["خسرو", L("khosrow", { x: -3.2, z: 1.4 })], ["باربد", R("barbad", { x: 3.2, z: 1.4 })], ["birds", "clouds"],
      "ایوان مداین، طاق کسری، نشان شکوه پادشاهی ساسانیان بود."),
    S("پوران‌دخت", "gold", "lilac", "range", [["castle", 0, -3.8], T(-7, -2.6)], ["پوران‌دخت", L("puran", { x: -1.2, z: 0.4, s: 0.9 })], ["موبد", R("sage", { x: 2.8 })], ["petals", "birds"],
      "پوران‌دخت، دختر خسرو پرویز، به پادشاهی نشست و به داد فرمان راند."),
    S("رستم فرخزاد", "lapis", "sage", "range", [["tent", 4, -2.2]], ["رستم فرخزاد", L("rostamF", { s: 0.95 })], ["ستارگان", R("sage", { x: 2.4 })], ["stars", "torch"],
      "رستم فرخزاد از ستارگان دریافت که روزگار ساسانیان به پایان نزدیک است."),
    S("یزدگرد و آسیابان", "dusk", "green", "range", [["mill", 3.2, -2], C(-6.6, -2.6)], ["یزدگرد", L("yazdegerd", { x: -2.2 })], ["آسیابان", R("miller", { x: 0.8, z: 1.4 })], ["birds", "wheel"],
      "یزدگرد، واپسین شاه ساسانی، به آسیابی پناه برد و همان‌جا روزگارش به سر آمد.", { water: "river" }),
    S("فردوسی و شاهنامه", "gold", "green", "range", [Bl(-6.6, -2.6), T(6.8, -2.6), ["castle", 4.6, -4]], ["فردوسی", L("ferdowsi", { x: -1.4 })], ["شاهنامه", { prop: "book", x: 1.4, z: 1.2 }], ["petals", "birds"],
      "فردوسی سی سال رنج برد تا داستان‌های ایران را در شاهنامه به پارسی زنده کند."),
  ];
})();
