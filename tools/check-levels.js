// آزمون مرحله‌ها و فهرست کلمه‌ها
// اجرا (از پوشه‌ی D:\kalame):  node tools/check-levels.js
// - همه‌ی کلمه‌های levels.txt باید در words.txt باشند
// - ۱۰۰۰ مرحله‌ی ساخته‌شده بررسی می‌شوند: جدول به‌هم‌وصل، کلمه‌ها از حروف ساخته شوند، تعداد درست
// - با --samples چند مرحله‌ی نمونه برای دیدن چاپ می‌شود

const fs = require("fs");
const path = require("path");
const assert = require("assert");
const E = require("../www/engine.js");

const www = path.join(__dirname, "..", "www");

// engine.js و game.js در مرورگر کنار هم اجرا می‌شوند؛ اسم یکسان در هر دو، یکی را بی‌صدا خراب می‌کند
const topNames = (file) => new Set([...fs.readFileSync(path.join(www, file), "utf8")
  .matchAll(/^(?:function|const|let|var)\s+([A-Za-z_$][\w$]*)/gm)].map((m) => m[1]));
const engineNames = topNames("engine.js");
const clash = [...topNames("game.js")].filter((n) => engineNames.has(n));
assert.deepStrictEqual(clash, [], "اسم‌های یکسان در engine.js و game.js");
const { dict, errors: wordErrors } = E.parseWords(fs.readFileSync(path.join(www, "words.txt"), "utf8"));
const { levels: handmade, errors: levelErrors } = E.parseLevels(fs.readFileSync(path.join(www, "levels.txt"), "utf8"));
assert.deepStrictEqual(wordErrors, [], "اشکال در words.txt");
assert.deepStrictEqual(levelErrors, [], "اشکال در levels.txt");

const missing = handmade.flatMap((l) => l.words).filter((w) => !dict.has(w));
assert.deepStrictEqual(missing, [], "کلمه‌های levels.txt که در words.txt نیستند");
const { dict: extra, errors: extraErrors } = E.parseWords(fs.readFileSync(path.join(www, "extra-words.txt"), "utf8"));
assert.deepStrictEqual(extraErrors, [], "اشکال در extra-words.txt");
const extraNoMeaning = [...extra].filter(([, m]) => !m).map(([w]) => w);
assert.deepStrictEqual(extraNoMeaning, [], "کلمه‌های بی‌معنی در extra-words.txt");
const extraNew = [...extra.keys()].filter((w) => !dict.has(w) && w.length <= 7);
const noMeaning = [...dict].filter(([, m]) => !m).map(([w]) => w);
assert.deepStrictEqual(noMeaning, [], "کلمه‌های بدون معنی");

const t0 = Date.now();
const gen = E.createGenerator(dict);
const tSetup = Date.now() - t0;

function checkLevel(name, lvl, tier) {
  const have = E.countLetters(lvl.letters);
  assert.ok(lvl.words.includes(lvl.seed), `${name}: کلمه‌ی اصلی در جدول نیست`);
  assert.strictEqual(new Set(lvl.words).size, lvl.words.length, `${name}: کلمه‌ی تکراری`);
  for (const w of lvl.words) {
    assert.ok(dict.has(w), `${name}: «${w}» در فهرست نیست`);
    const need = E.countLetters(w);
    for (const ch in need) assert.ok((have[ch] || 0) >= need[ch], `${name}: «${w}» با حروف ساخته نمی‌شود`);
  }
  assert.ok(lvl.words.length >= tier.min, `${name}: فقط ${lvl.words.length} کلمه`);
  const layout = E.buildLayout(lvl.words);
  assert.ok(layout.connected, `${name}: جدول به هم وصل نیست`);
  assert.ok(layout.rows <= 9 && layout.cols <= 9, `${name}: جدول خیلی بزرگ است`);
}

const TIER_MIN = { 4: { min: 3 }, 5: { min: 4 }, 6: { min: 5 }, 7: { min: 5 } };
const seedsUsed = new Set();
const t1 = Date.now();
const generated = [];
for (let i = E.HANDMADE_LEVELS; i < E.HANDMADE_LEVELS + 1000; i++) {
  const lvl = gen.level(i);
  checkLevel(`مرحله‌ی ${i + 1}`, lvl, TIER_MIN[lvl.seed.length]);
  seedsUsed.add(lvl.seed);
  generated.push(lvl);
}
const tLevels = Date.now() - t1;

assert.deepStrictEqual(gen.level(57), E.createGenerator(dict).level(57), "مرحله‌ها قابل‌تکرار نیستند");

console.log(`words.txt: ${dict.size} کلمه؛ extra-words.txt: ${extraNew.length} کلمه‌ی تازه برای صندوق`);
console.log(`کلمه‌ی اصلی موجود: ۴حرفی ${gen.seeds[4].length}، ۵حرفی ${gen.seeds[5].length}، ۶حرفی ${gen.seeds[6].length}، ۷حرفی ${gen.seeds[7].length}`);
console.log(`۱۰۰۰ مرحله سالم بودند. کلمه‌ی اصلی متفاوت در ۱۰۰۰ مرحله: ${seedsUsed.size}`);
console.log(`زمان: آماده‌سازی ${tSetup}ms، ساخت ۱۰۰۰ مرحله ${tLevels}ms`);

if (process.argv.includes("--samples")) {
  const pick = [11, 13, 16, 20, 25, 30, 35, 42, 50, 60, 70, 80, 95, 110, 125, 140, 160, 180, 200, 230, 260, 300, 350, 400, 500, 650, 800, 1000];
  console.log("\nنمونه‌ها:");
  for (const n of pick) {
    const lvl = generated[n - 1 - E.HANDMADE_LEVELS];
    const bonus = gen.bonusWords(lvl);
    console.log(`${n} | ${lvl.letters.join(" ")} | ${lvl.words.join("، ")}${bonus.length ? " | جایزه: " + bonus.join("، ") : ""}`);
  }
}
