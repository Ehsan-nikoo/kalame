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

// فایل‌های بازی در مرورگر کنار هم اجرا می‌شوند؛ اسم یکسان در دو فایل، یکی را بی‌صدا خراب می‌کند
const topNames = (file) => new Set([...fs.readFileSync(path.join(www, file), "utf8")
  .matchAll(/^(?:function|const|let|var)\s+([A-Za-z_$][\w$]*)/gm)].map((m) => m[1]));
const scriptNames = ["engine.js", "game.js", "feel.js", "chapters.js", "daily.js", "extras.js", "more.js"].map(topNames);
for (let i = 0; i < scriptNames.length; i++) {
  for (let j = i + 1; j < scriptNames.length; j++) {
    const clash = [...scriptNames[i]].filter((n) => scriptNames[j].has(n));
    assert.deepStrictEqual(clash, [], "اسم‌های یکسان در فایل‌های بازی (engine.js، game.js، feel.js، chapters.js، daily.js، extras.js، more.js)");
  }
}
const { dict, levels, errors: wordErrors } = E.parseWords(fs.readFileSync(path.join(www, "words.txt"), "utf8"));
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
const gen = E.createGenerator(dict, levels);
const tSetup = Date.now() - t0;

function checkLevel(name, lvl, tier, rareOk) {
  const have = E.letterCounts(lvl.letters);
  assert.ok(lvl.words.includes(lvl.seed), `${name}: کلمه‌ی اصلی در جدول نیست`);
  assert.strictEqual(new Set(lvl.words).size, lvl.words.length, `${name}: کلمه‌ی تکراری`);
  for (const w of lvl.words) {
    assert.ok(dict.has(w), `${name}: «${w}» در فهرست نیست`);
    assert.ok(E.canMake(E.letterCounts(w), have), `${name}: «${w}» با حروف ساخته نمی‌شود`);
    if (!rareOk) assert.strictEqual(gen.levelOf(w), 1, `${name}: کلمه‌ی کمتر رایج «${w}» زود آمده`);
  }
  assert.ok(lvl.words.length >= tier.min, `${name}: فقط ${lvl.words.length} کلمه`);
  const twos = lvl.words.filter((w) => w.length === 2).length;
  assert.ok(twos <= tier.twos, `${name}: ${twos} کلمه‌ی دوحرفی`);
  const layout = E.buildLayout(lvl.words);
  assert.ok(layout.connected, `${name}: جدول به هم وصل نیست`);
  assert.ok(layout.rows <= 9 && layout.cols <= 9, `${name}: جدول خیلی بزرگ است`);
}

const TIER_MIN = { 4: { min: 3, twos: 2 }, 5: { min: 4, twos: 1 }, 6: { min: 5, twos: 0 }, 7: { min: 5, twos: 0 } };
const seedsUsed = new Set();
const t1 = Date.now();
const generated = [];
for (let i = E.HANDMADE_LEVELS; i < E.HANDMADE_LEVELS + 1000; i++) {
  const lvl = gen.level(i);
  const g = i - E.HANDMADE_LEVELS;
  checkLevel(`مرحله‌ی ${i + 1}`, lvl, TIER_MIN[lvl.seed.length], g >= 50 || gen.levelOf(lvl.seed) > 1);
  if (g < 150) assert.strictEqual(gen.levelOf(lvl.seed), 1, `مرحله‌ی ${i + 1}: کلمه‌ی اصلی کمتر رایج زود آمده`);
  seedsUsed.add(lvl.seed);
  generated.push(lvl);
}
const tLevels = Date.now() - t1;

assert.deepStrictEqual(gen.level(57), E.createGenerator(dict, levels).level(57), "مرحله‌ها قابل‌تکرار نیستند");

// «آ» و «ا» یکی حساب می‌شوند
assert.ok(E.canMake(E.letterCounts("آب"), E.letterCounts("باران")), "«آب» باید با حروف «باران» ساخته شود");
assert.strictEqual(E.fold("آسمان"), E.fold("اسمان"));

// مرحله‌ی روزانه: برای هر روز یکسان، سالم، و در روزهای مناسبت با کلمه‌های همان مناسبت
const extraDict = E.parseWords(fs.readFileSync(path.join(www, "extra-words.txt"), "utf8")).dict;
const okWord = (w) => dict.has(w) || extraDict.has(w);
let tDaily = Date.now();
for (let k = 0; k < 120; k++) {
  const day = new Date(Date.UTC(2026, 10, 1 + k)).toISOString().slice(0, 10);
  const lvl = gen.daily(day);
  if (k < 3) assert.deepStrictEqual(lvl, E.createGenerator(dict, levels).daily(day), "مرحله‌ی روزانه قابل‌تکرار نیست: " + day);
  assert(lvl.words.length >= 4, "مرحله‌ی روزانه کم‌کلمه است: " + day);
  const lay = E.buildLayout(lvl.words);
  assert(lay.connected && lay.rows <= 9 && lay.cols <= 9, "جدول مرحله‌ی روزانه جا نمی‌شود: " + day);
}
tDaily = Date.now() - tDaily;
const eventsSrc = fs.readFileSync(path.join(www, "daily.js"), "utf8");
for (const m of eventsSrc.matchAll(/words: \[([^\]]+)\]/g)) {
  const words = [...m[1].matchAll(/"([^"]+)"/g)].map((x) => x[1]);
  const missing = words.filter((w) => !okWord(w));
  assert.deepStrictEqual(missing, [], "کلمه‌ی مناسبت در words.txt یا extra-words.txt نیست");
  for (let k = 0; k < 5; k++) {
    const lvl = gen.daily("2030-01-0" + (k + 1), words);
    assert(lvl.words.some((w) => words.includes(w)), "مرحله‌ی مناسبت کلمه‌ی مناسبت ندارد: " + words[0]);
    assert(lvl.words.every(okWord), "کلمه‌ی ناشناخته در مرحله‌ی مناسبت");
  }
}
console.log(`مرحله‌ی روزانه: ۱۲۰ روز سالم (${tDaily}ms)`);
const rare = [...levels.values()].filter((l) => l === 2).length;
const bonusCounts = generated.map((l) => gen.bonusWords(l).length);
console.log(`بیشترین کلمه‌ی جایزه در یک مرحله: ${Math.max(...bonusCounts)}، میانگین: ${(bonusCounts.reduce((a, b) => a + b, 0) / bonusCounts.length).toFixed(1)}`);
const avgWords = generated.reduce((a, l) => a + l.words.length, 0) / generated.length;
console.log(`میانگین کلمه‌ی جدول: ${avgWords.toFixed(1)}`);
console.log(`کلمه‌های رایج: ${dict.size - rare}، کمتر رایج: ${rare}`);
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
