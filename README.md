# Qura Couture — quracouture.com

Bridal couture website for Qura Couture (private atelier, Puchong). Next.js 16 + GSAP + Lenis, deployed to Cloudflare Workers via OpenNext.

## Commands

```bash
npm run dev       # local dev server at http://localhost:3000
npm run images    # rebuild responsive images from assets-src/ into public/img/
npm run build     # production build (Next.js)
npm run preview   # build for Cloudflare and preview locally with Wrangler
npm run deploy    # build and deploy to Cloudflare (needs `npx wrangler login` once)
```

## Where things live

| What | Where |
|---|---|
| Business details, prices, milestone weeks, WhatsApp number | `src/lib/site.ts` |
| Source photos (named by purpose) | `assets-src/` |
| Image pipeline (crops, sizes, logo, placeholder sketch) | `scripts/build-images.mjs` |
| Homepage sections | `src/components/*` (one component + CSS module each) |
| The Thread (the line that stitches down the page) | `src/components/Thread.tsx`; anchors are `<ThreadAnchor>` in each section |

## Placeholders to fill (search for `TODO` and `[`)

None right now.

## The sketch

`assets-src/sketch-scan.png` is the designer's drawing on the blue baseline sheet. `npm run images` crops it to the photo frame (registered to `sketch-photo`), drops the blue and turns the ink into a transparent graphite layer (`sketch`). A new sketch drawn on the same baseline sheet can simply replace the PNG.

## Adding or swapping a photo

1. Put the file in `assets-src/` with a descriptive name.
2. Add it to `IMAGES` in `scripts/build-images.mjs` (optional `crop`).
3. Run `npm run images`, then use `<Picture name="..." alt="..." />`.
