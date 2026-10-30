// یک سرور کوچک برای امتحان بازی روی کامپیوتر (بدون نیاز به نصب چیز اضافه).
// اجرا: npm start   سپس باز کردن http://localhost:8080 در مرورگر

const http = require("http");
const fs = require("fs");
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

http
  .createServer((req, res) => {
    let urlPath = decodeURIComponent(req.url.split("?")[0]);
    if (urlPath.endsWith("/")) urlPath += "index.html";
    const file = path.join(ROOT, urlPath);
    if (!file.startsWith(ROOT)) {
      res.writeHead(403).end();
      return;
    }
    fs.readFile(file, (err, data) => {
      if (err) {
        res.writeHead(404).end("Not found");
        return;
      }
      res.writeHead(200, {
        "Content-Type": TYPES[path.extname(file)] || "application/octet-stream",
        "Cache-Control": "no-store",
      });
      res.end(data);
    });
  })
  .listen(PORT, () => {
    console.log(`بازی «کلمه» آماده است: http://localhost:${PORT}`);
  });
