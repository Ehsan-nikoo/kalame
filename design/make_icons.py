# ساخت آیکون برنامه و صفحه‌ی شروع اندروید برای بازی «کلمه»
# اجرا (از پوشه‌ی D:\kalame):  python design/make_icons.py
# نیاز: Pillow و فونت design/fonts/Lalezar-Regular.ttf

import os
import random
from PIL import Image, ImageDraw, ImageFilter, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
RES = os.path.join(HERE, "..", "android", "app", "src", "main", "res")
FONT = os.path.join(HERE, "fonts", "Lalezar-Regular.ttf")

NAVY_TOP = (11, 15, 46)
NAVY_GLOW = (59, 42, 99)
GOLD = (255, 217, 138)
GOLD_LIGHT = (255, 248, 225)
GOLD_DARK = (201, 139, 46)

# «کلمه» با شکل‌های چسبیده‌ی حروف، از چپ به راست کشیده می‌شود (Pillow بدون raqm حروف را نمی‌چسباند)
WORD = "\uFEEA\uFEE4\uFEE0\uFB90"


def sky(w, h, seed=7, stars=True):
    """زمینه‌ی آسمان شب: درخشش بنفش از پایین و ستاره‌های ریز"""
    img = Image.new("RGB", (w, h), NAVY_TOP)
    glow = Image.new("RGB", (w, h), NAVY_GLOW)
    mask = Image.new("L", (w, h), 0)
    d = ImageDraw.Draw(mask)
    r = max(w, h) * 0.9
    d.ellipse((w / 2 - r, h * 1.05 - r * 0.75, w / 2 + r, h * 1.05 + r * 0.75), fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(max(w, h) * 0.18))
    img = Image.composite(glow, img, mask)
    if stars:
        rnd = random.Random(seed)
        d = ImageDraw.Draw(img)
        for _ in range(int(w * h / 2600)):
            x, y = rnd.random() * w, rnd.random() * h
            s = rnd.random() * (w / 512) + 0.4
            a = int(120 + rnd.random() * 135)
            d.ellipse((x - s, y - s, x + s, y + s), fill=(255, 244, 220, a))
    return img.convert("RGBA")


def gold_text(text, size, pad):
    """متن طلایی با گرادیان، لبه‌ی تیره‌تر و درخشش نرم"""
    font = ImageFont.truetype(FONT, size)
    mask = font.getmask(text)
    bw, bh = mask.size
    w, h = bw + pad * 2, bh + pad * 2
    shape = Image.new("L", (w, h), 0)
    shape.im.paste(255, (pad, pad, pad + bw, pad + bh), mask)

    grad = Image.new("RGBA", (w, h))
    gd = ImageDraw.Draw(grad)
    for y in range(h):
        t = y / max(h - 1, 1)
        c = [int(GOLD_LIGHT[i] * (1 - t) + GOLD[i] * min(1, t * 1.6) * (1 - max(0, t - 0.6)) + GOLD_DARK[i] * max(0, t - 0.6)) for i in range(3)]
        gd.line([(0, y), (w, y)], fill=(*c, 255))

    out = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    glow = Image.new("RGBA", (w, h), (*GOLD, 0))
    glow.putalpha(shape.filter(ImageFilter.GaussianBlur(size * 0.09)).point(lambda v: int(v * 0.85)))
    out = Image.alpha_composite(out, glow)
    edge = Image.new("RGBA", (w, h), (*GOLD_DARK, 255))
    edge.putalpha(shape.filter(ImageFilter.MaxFilter(3)))
    out = Image.alpha_composite(out, edge)
    grad.putalpha(shape)
    return Image.alpha_composite(out, grad)


def sparkle(size):
    """ستاره‌ی چهارپر کوچک"""
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    c, r, k = size / 2, size / 2, size * 0.09
    d.polygon([(c, 0), (c + k, c - k), (size, c), (c + k, c + k), (c, size), (c - k, c + k), (0, c), (c - k, c - k)], fill=(*GOLD_LIGHT, 255))
    glow = img.filter(ImageFilter.GaussianBlur(size * 0.12))
    return Image.alpha_composite(glow, img)


def foreground(px):
    """لایه‌ی جلویی آیکون: «کلمه» طلایی و یک ستاره‌ی کوچک، داخل محدوده‌ی امن آیکون‌های اندروید (۶۰٪ وسط)"""
    img = Image.new("RGBA", (px, px), (0, 0, 0, 0))
    pad = int(px * 0.06)
    word = gold_text(WORD, int(px * 0.3), pad)
    target = px * 0.58 + pad * 2   # پهنای نوشته، بدون درخشش دورش
    if word.width > target:
        word = word.resize((int(target), int(word.height * target / word.width)), Image.LANCZOS)
    ww, wh = word.size
    img.alpha_composite(word, (int(px / 2 - ww / 2), int(px * 0.53 - wh / 2)))
    sp = sparkle(int(px * 0.12))
    img.alpha_composite(sp, (int(px * 0.24), int(px * 0.27)))
    return img


def rounded(img, radius_frac, circle=False):
    w, h = img.size
    mask = Image.new("L", (w * 4, h * 4), 0)
    d = ImageDraw.Draw(mask)
    if circle:
        d.ellipse((0, 0, w * 4 - 1, h * 4 - 1), fill=255)
    else:
        d.rounded_rectangle((0, 0, w * 4 - 1, h * 4 - 1), radius=int(w * 4 * radius_frac), fill=255)
    out = img.copy()
    out.putalpha(mask.resize((w, h), Image.LANCZOS))
    return out


def save(img, *parts):
    path = os.path.join(RES, *parts)
    img.save(path, optimize=True)
    print("saved", os.path.relpath(path, os.path.join(HERE, "..")), img.size)


# ---------- آیکون ----------
DENSITIES = {"mdpi": 1, "hdpi": 1.5, "xhdpi": 2, "xxhdpi": 3, "xxxhdpi": 4}
for name, k in DENSITIES.items():
    full = int(108 * k)                     # لایه‌های آیکون تطبیقی (Android 8+)
    save(sky(full, full, stars=True), f"mipmap-{name}", "ic_launcher_background.png")
    save(foreground(full), f"mipmap-{name}", "ic_launcher_foreground.png")

    legacy = int(48 * k)                    # آیکون گوشی‌های قدیمی‌تر
    big = 4 * legacy
    art = sky(big, big)
    art.alpha_composite(foreground(big))
    art = art.resize((legacy, legacy), Image.LANCZOS)
    save(rounded(art, 0.22), f"mipmap-{name}", "ic_launcher.png")
    save(rounded(art, 0, circle=True), f"mipmap-{name}", "ic_launcher_round.png")

# پیش‌نمایش بزرگ برای دیدن نتیجه
preview = sky(512, 512)
preview.alpha_composite(foreground(512))
rounded(preview, 0.22).save(os.path.join(HERE, "icon-preview.png"))

# ---------- صفحه‌ی شروع (اندروید ۱۱ و قدیمی‌تر) ----------
def splash(w, h):
    img = sky(w, h, seed=11)
    s = min(w, h)
    word = gold_text(WORD, int(s * 0.26), int(s * 0.06))
    ww, wh = word.size
    x, y = int(w / 2 - ww / 2), int(h / 2 - wh / 2)
    img.alpha_composite(word, (x, y))
    sp = sparkle(int(s * 0.1))
    img.alpha_composite(sp, (int(x + ww * 0.08), int(y - s * 0.02)))
    return img.convert("RGB")

for folder in os.listdir(RES):
    path = os.path.join(RES, folder, "splash.png")
    if folder.startswith("drawable") and os.path.exists(path):
        w, h = Image.open(path).size
        save(splash(w, h), folder, "splash.png")
splash(540, 960).save(os.path.join(HERE, "splash-preview.png"))
