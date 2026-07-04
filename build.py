#!/usr/bin/env python3
"""
Build script for OUTFIT(r) store clone.
Produces a self-contained dist/ folder ready for static hosting.

Usage:
    python build.py
"""

import os
import re
import shutil
import pathlib

ROOT = pathlib.Path(__file__).parent
DIST = ROOT / "dist"


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def minify_css(css: str) -> str:
    css = re.sub(r'/\*.*?\*/', '', css, flags=re.DOTALL)
    css = re.sub(r'\s+', ' ', css)
    css = re.sub(r'\s*([{};:,>+~])\s*', r'\1', css)
    return css.strip()


def minify_js(js: str) -> str:
    lines = []
    for line in js.splitlines():
        stripped = line.strip()
        if stripped.startswith('//'):
            continue
        lines.append(stripped)
    js = '\n'.join(lines)
    js = re.sub(r'\n{3,}', '\n\n', js)
    return js.strip()


def minify_html(html: str) -> str:
    html = re.sub(r'<!--(?!\[if).*?-->', '', html, flags=re.DOTALL)
    html = re.sub(r'>\s{2,}<', '>\n<', html)
    return html.strip()


# ---------------------------------------------------------------------------
# Build
# ---------------------------------------------------------------------------

def build():
    print("=== OUTFIT Build Script ===\n")

    if DIST.exists():
        shutil.rmtree(DIST)
        print(f"  Cleaned  {DIST}")
    DIST.mkdir()
    print(f"  Created  {DIST}\n")

    html_src  = (ROOT / "index.html").read_text(encoding="utf-8")
    css_src   = (ROOT / "style.css").read_text(encoding="utf-8")
    js_src    = (ROOT / "app.js").read_text(encoding="utf-8")
    prod_src  = (ROOT / "products.js").read_text(encoding="utf-8")

    css_min  = minify_css(css_src)
    js_min   = minify_js(js_src)
    prod_min = minify_js(prod_src)

    print(f"  CSS  : {len(css_src):>7,} -> {len(css_min):>7,} bytes  ({100*(1-len(css_min)/len(css_src)):.1f}% saved)")
    print(f"  JS   : {len(js_src):>7,} -> {len(js_min):>7,} bytes  ({100*(1-len(js_min)/len(js_src)):.1f}% saved)")
    print(f"  Data : {len(prod_src):>7,} -> {len(prod_min):>7,} bytes  ({100*(1-len(prod_min)/len(prod_src)):.1f}% saved)")

    html_out = html_src.replace(
        '<link rel="stylesheet" href="style.css">',
        f'<style>{css_min}</style>'
    )
    html_out = html_out.replace(
        '<script src="products.js"></script>',
        f'<script>{prod_min}</script>'
    )
    html_out = html_out.replace(
        '<script src="app.js"></script>',
        f'<script>{js_min}</script>'
    )
    html_min = minify_html(html_out)

    out_path = DIST / "index.html"
    out_path.write_text(html_min, encoding="utf-8")
    print(f"  HTML : {len(html_src):>7,} -> {len(html_min):>7,} bytes  (combined + minified)")

    src_preloader = ROOT / "preloader"
    dst_preloader = DIST / "preloader"
    if src_preloader.exists():
        shutil.copytree(src_preloader, dst_preloader)
        imgs = list(dst_preloader.iterdir())
        total_kb = sum(f.stat().st_size for f in imgs) / 1024
        print(f"\n  Preloader: {len(imgs)} images copied ({total_kb:.1f} KB)")

    total_dist = sum(f.stat().st_size for f in DIST.rglob('*') if f.is_file())
    print(f"\n{'='*42}")
    print(f"  dist/ built successfully!")
    print(f"  Total dist size: {total_dist / 1024:.1f} KB")
    print(f"  Output: {DIST}")
    print(f"{'='*42}")
    print(f"\n  Serve locally:  cd dist && python -m http.server 8080")
    print(f"  Deploy:         Upload dist/ to Netlify, Vercel, GitHub Pages, etc.")


if __name__ == "__main__":
    build()
