#!/usr/bin/env python3
"""Ritar appikoner, favicon, og-bild, manifest, robots och sitemap för Kotten och stubben.
Ingen tredjepart. Ikonen är en stubbe med Kotten ovanpå – appens mekanik – tre tjocka
former, inga tunna streck, så den överlever 48 px."""
import json
import pathlib

from PIL import Image, ImageDraw

P = pathlib.Path(__file__).parent / "public"
P.mkdir(exist_ok=True)
ACCENT = (47, 125, 90, 255)
PAPPER = (250, 247, 242, 255)
BLACK = (20, 24, 31, 255)
KOTTEN = (176, 125, 75, 255)
LJUS = (255, 255, 255, 255)


def figur(d, N, stubbe, kotten):
    """Stubbe (avsmalnande nertill, rund ovansida) med en rund Kotten ovanpå."""
    w, h = N * 0.52, N * 0.30
    x0, y0 = N / 2 - w / 2, N * 0.56
    d.polygon([(x0, y0 + h), (x0 + w, y0 + h), (x0 + w * 0.86, y0), (x0 + w * 0.14, y0)], fill=stubbe)
    d.ellipse([x0 + w * 0.14, y0 - h * 0.22, x0 + w * 0.86, y0 + h * 0.22], fill=stubbe)
    r = N * 0.17
    cx, cy = N / 2, y0 - r * 0.85
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=kotten)


def ikon(N):
    ss = 4
    im = Image.new("RGBA", (N * ss, N * ss), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.rounded_rectangle([0, 0, N * ss - 1, N * ss - 1], radius=N * ss * 0.23, fill=ACCENT)
    figur(d, N * ss, LJUS, (232, 163, 61, 255))
    return im.resize((N, N), Image.LANCZOS)


def favicon():
    (P / "favicon.svg").write_text(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">'
        '<rect width="100" height="100" rx="23" fill="#2f7d5a"/>'
        '<g><path d="M24 84 L33 48 H67 L76 84 Z" fill="#fff"/>'
        '<ellipse cx="50" cy="48" rx="17" ry="7" fill="#fff"/>'
        '<circle cx="50" cy="30" r="15" fill="#e8a33d"/></g></svg>',
        encoding="utf-8")
    ikon(512).save(P / "favicon.png")
    ikon(192).save(P / "icon-192.png")
    ikon(512).save(P / "icon-512.png")
    # maskable: samma figur men mindre, så säkerhetszonen håller
    N = 512
    im = Image.new("RGBA", (N, N), ACCENT)
    d = ImageDraw.Draw(im)
    inner = Image.new("RGBA", (int(N * 0.66), int(N * 0.66)), (0, 0, 0, 0))
    di = ImageDraw.Draw(inner)
    figur(di, int(N * 0.66), LJUS, (232, 163, 61, 255))
    im.paste(inner, (int(N * 0.17), int(N * 0.17)), inner)
    im.save(P / "icon-maskable-512.png")
    (P / "apple-touch-icon.png").write_bytes((P / "icon-192.png").read_bytes())


def og():
    from PIL import ImageFont
    W, H = 1200, 630
    im = Image.new("RGB", (W, H), PAPPER)
    d = ImageDraw.Draw(im)
    ico = ikon(150)
    im.paste(ico, (int(W / 2 - 75), 54), ico)
    font = None
    for path in ("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
                 "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"):
        if pathlib.Path(path).exists():
            font = ImageFont.truetype(path, 58)
            break
    if font is None:
        font = ImageFont.load_default()
    titel = "Kotten och stubben"
    tw = d.textlength(titel, font=font)
    d.text((W / 2 - tw / 2, 250), titel, font=font, fill=BLACK)
    im.save(P / "og.png")
    # kortbild till katalogen fylls i från en riktig skärmdump, inte här


def manifest():
    (P / "site.webmanifest").write_text(json.dumps({
        "name": "Kotten och stubben – lägesord",
        "short_name": "Stubben",
        "lang": "sv",
        "start_url": "/",
        "display": "standalone",
        "orientation": "any",
        "background_color": "#faf7f2",
        "theme_color": "#2f7d5a",
        "icons": [
            {"src": "/icon-192.png", "sizes": "192x192", "type": "image/png"},
            {"src": "/icon-512.png", "sizes": "512x512", "type": "image/png"},
            {"src": "/icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable"},
        ],
    }, ensure_ascii=False, indent=1), encoding="utf-8")
    (P / "robots.txt").write_text("User-agent: *\nAllow: /\nSitemap: https://kottenstubben.skolappar.com/sitemap.xml\n",
                                  encoding="utf-8")
    (P / "sitemap.xml").write_text(
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        ' <url><loc>https://kottenstubben.skolappar.com/</loc></url>\n'
        '</urlset>\n', encoding="utf-8")


if __name__ == "__main__":
    favicon()
    og()
    manifest()
    print("klart:", sorted(p.name for p in P.iterdir()))