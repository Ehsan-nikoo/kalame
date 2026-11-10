// یک سرور کوچک برای امتحان بازی روی کامپیوتر و گوشی (بدون نیاز به نصب چیز اضافه).
// اجرا: npm start
// - هر بار که فایلی در پوشه‌ی www ذخیره شود، صفحه در مرورگر خودش تازه می‌شود.
// - گوشی اگر به همان وای‌فای وصل باشد، با آدرسی که این برنامه چاپ می‌کند بازی را می‌بیند.

const http = require("http");
const fs = require("fs");
const os = require("os");
const path = require("path");

const ROOT = path.join(__dirname, "www");
const PORT = 8080;
const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".woff2": "font/woff2",
  ".svg": "image/svg+xml",
  ".png": "image/png",
};

// فقط برای امتحان: این تکه به صفحه‌ها اضافه می‌شود تا با هر تغییر خودشان تازه شوند (در APK نیست)
const RELOAD_SCRIPT = `<script>new EventSource("/__reload").onmessage = () => location.reload();</script>`;
const listeners = new Set();
let reloadTimer = null;

// ویندوز گاهی خواندن یک فایل را هم «تغییر» گزارش می‌کند؛ پس زمان آخرین ذخیره‌ی هر فایل را نگه می‌داریم
// و فقط وقتی صفحه را تازه می‌کنیم که آن زمان واقعاً عوض شده باشد.
const mtimes = new Map();
const mtimeOf = (file) => {
  try {
    return fs.statSync(file).mtimeMs;
  } catch (e) {
    return 0; // فایل پاک شده
  }
};
(function scan(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) scan(file);
    else mtimes.set(file, mtimeOf(file));
  }
})(ROOT);

fs.watch(ROOT, { recursive: true }, (event, name) => {
  if (!name) return;
  const file = path.join(ROOT, name);
  const mtime = mtimeOf(file);
  if (mtimes.get(file) === mtime) return;
  mtimes.set(file, mtime);
  // ذخیره‌ی یک فایل گاهی چند خبر پشت سر هم می‌دهد؛ فقط یک بار تازه می‌کنیم
  clearTimeout(reloadTimer);
  reloadTimer = setTimeout(() => {
    for (const res of listeners) res.write("data: reload\n\n");
  }, 150);
});

http
  .createServer((req, res) => {
    let urlPath;
    try {
      urlPath = decodeURIComponent(req.url.split("?")[0]);
    } catch (e) {
      res.writeHead(400).end("Bad request");
      return;
    }

    if (urlPath === "/__reload") {
      res.writeHead(200, { "Content-Type": "text/event-stream", "Cache-Control": "no-store" });
      res.write("\n");
      listeners.add(res);
      req.on("close", () => listeners.delete(res));
      return;
    }

    if (urlPath.endsWith("/")) urlPath += "index.html";
    const file = path.join(ROOT, urlPath);
    if (path.relative(ROOT, file).startsWith("..")) {
      res.writeHead(403).end();
      return;
    }
    fs.readFile(file, (err, data) => {
      if (err) {
        res.writeHead(404).end("Not found");
        return;
      }
      const type = TYPES[path.extname(file)] || "application/octet-stream";
      if (type.startsWith("text/html")) data = data.toString().replace("</body>", RELOAD_SCRIPT + "</body>");
      res.writeHead(200, { "Content-Type": type, "Cache-Control": "no-store" });
      res.end(data);
    });
  })
  .on("error", (err) => {
    // پیام‌های ترمینال انگلیسی‌اند، چون ترمینال ویندوز حروف فارسی را به‌هم‌ریخته نشان می‌دهد
    if (err.code === "EADDRINUSE") {
      // سرور از قبل باز است (شاید پنجره‌اش پشت بقیه پنهان شده): همان را در مرورگر باز می‌کنیم
      const url = `http://localhost:${PORT}`;
      console.log(`The game server is already running in another window (maybe minimized).`);
      if (process.argv.includes("--open") && process.platform === "win32") {
        console.log(`Opening ${url} in your browser...`);
        require("child_process").execSync(`start "" "${url}"`);
        process.exit(0);
      }
      console.log(`Open ${url} in your browser, or close the other window and try again.`);
    } else {
      console.log("Could not start the game server: " + err.message);
    }
    process.exit(1); // بدون این، نگهبان فایل‌ها برنامه را باز نگه می‌دارد
  })
  .listen(PORT, () => {
    const url = `http://localhost:${PORT}`;
    console.log(`Kalame is running!`);
    console.log(`  On this computer:          ${url}`);
    // فقط آدرس وای‌فای/کابل را نشان می‌دهیم، نه آدرس VPN
    const lan = [];
    for (const [name, nets] of Object.entries(os.networkInterfaces())) {
      for (const net of nets) {
        if (net.family === "IPv4" && !net.internal && /wi-?fi|wlan|wireless|ethernet/i.test(name)) lan.push(net.address);
      }
    }
    for (const ip of lan) console.log(`  On your phone (same Wi-Fi): http://${ip}:${PORT}`);
    console.log(`The page refreshes by itself when a file in the www folder is saved.`);
    console.log(`To stop the server, close this window (or press Ctrl+C).`);

    // npm start / start-game.cmd مرورگر را خودشان باز می‌کنند
    if (process.argv.includes("--open") && process.platform === "win32") {
      require("child_process").exec(`start "" "${url}"`);
    }
  });
