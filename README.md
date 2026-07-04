# OUTFIT® — Store Clone

## 🚀 Live Demo

**[https://outfit-shopping.netlify.app](https://outfit-shopping.netlify.app)**

---

## ✨ Features

- **Single-Page Application** — Hash-based routing (`#/`, `#/product/:handle`, `#/bag`, `#/shipping-and-return`)
- **13 Products** — Full product catalog extracted from the original store, with sizes, prices, and images
- **Shopping Cart** — Add to bag, quantity controls, remove items, cart count in nav — all persisted via `localStorage`
- **Three Themes** — Light (Cream), Dark (Black), and Red — switchable in the header, persisted via `localStorage`
- **Preloader Slideshow** — Animated image slideshow on first visit (runs once per session)
- **Mix-blend-mode Header** — Sticky nav that automatically contrasts against any background color
- **Responsive Design** — Mobile-first layout, 2-column product grid on mobile → 4-column on desktop
- **Fully Self-Contained Dist** — CSS + JS inlined into a single `index.html` for zero-dependency deployment

---

## 📁 Project Structure

```
product site/
├── index.html        # SPA shell — header, footer, app-root mount point
├── style.css         # Full design system — themes, grid, components
├── app.js            # SPA router, cart logic, view renderers, preloader
├── products.js       # Product data (13 items extracted from original store)
├── preloader/        # 6 JPEG images for the intro slideshow
│   ├── image-01.jpg
│   └── ...
├── build.py          # Build script → generates dist/
└── dist/             # Production build (generated — do not edit manually)
    ├── index.html    # All assets inlined
    └── preloader/    # Preloader images
```

---

## 🛠️ Local Development

Serve the project root with any static server:

```bash
# Python (no install required)
cd "product site"
python -m http.server 8000
```

Then open **http://localhost:8000** in your browser.

---

## 📦 Building for Production

Run the included build script to generate an optimised `dist/` folder:

```bash
python build.py
```

This will:
1. Minify CSS, JS, and product data (~20% size reduction each)
2. Inline all assets into a single `dist/index.html`
3. Copy the `preloader/` images into `dist/`

Serve the build locally to verify:

```bash
cd dist && python -m http.server 8080
```

---

## 🌐 Deployment

The `dist/` folder is a fully static build — drop it onto any host:

| Platform | How |
|---|---|
| **Netlify** | Drag & drop `dist/` in the Netlify dashboard |
| **Vercel** | `vercel dist/` |
| **GitHub Pages** | Push `dist/` contents to a `gh-pages` branch |
| **Any CDN / S3** | Upload `dist/` folder contents to root |

---

## 🎨 Themes

| Theme | Background | Text | Accent |
|---|---|---|---|
| Light (Cream) | `#ede4dd` | `#000000` | `#ff0001` |
| Dark | `#000000` | `#ede4dd` | `#ff0001` |
| Red | `#ff0001` | `#ede4dd` | `#000000` |

---

## 📄 Pages

| Route | View |
|---|---|
| `#/` | Homepage — hero + product grid |
| `#/product/:handle` | Product detail — gallery, size selector, add to bag |
| `#/bag` | Shopping bag — items, quantity, order summary |
| `#/shipping-and-return` | Shipping & returns policy |

---

*Original design by [++hellohello](https://www.hellohello.is). This is a front-end demonstration clone.*
