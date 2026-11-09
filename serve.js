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

fs.watch(ROOT, { recursive: true }, () => {
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
  .listen(PORT, () => {
    console.log(`بازی «کلمه» آماده است:`);
    console.log(`  روی همین کامپیوتر:  http://localhost:${PORT}`);
    for (const nets of Object.values(os.networkInterfaces())) {
      for (const net of nets) {
        if (net.family === "IPv4" && !net.internal) console.log(`  روی گوشی (همان وای‌فای):  http://${net.address}:${PORT}`);
      }
    }
    console.log(`هر تغییری در پوشه‌ی www ذخیره شود، صفحه خودش تازه می‌شود.`);
  });
