// Builds responsive AVIF/WebP images from assets-src/ into public/img/,
// and writes src/lib/images.json (sizes, widths, blur placeholders).
// Run: npm run images
import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const SRC = path.join(ROOT, "assets-src");
const OUT = path.join(ROOT, "public", "img");
const MANIFEST = path.join(ROOT, "src", "lib", "images.json");

const WIDTHS = [480, 768, 1080, 1440, 2000];

// name -> { file, crop?: {left, top, width, height}, saturation? }
const IMAGES = {
  "hero-bg": { file: "hero-bg.webp" },
  "hero-couple": { file: "hero-couple.webp" },
  "hero-mobile": { file: "hero-mobile.webp" },
  // hands centred so the two halves meet at the clasp
  "one-couple": { file: "one-couple.jpg", crop: { left: 0, top: 250, width: 1434, height: 2150 }, saturation: 0.82 },
  "sketch-photo": { file: "sketch-photo.jpg" },
  "look-veil": { file: "look-veil.jpg" },
  "look-window": { file: "look-window.jpg" },
  "look-blush": { file: "look-blush.jpg" },
  "look-lace": { file: "look-lace.jpg" },
  "look-cathedral": { file: "look-cathedral.jpg" },
  // trims the bookshelf and magazines on the right
  "look-evening": { file: "look-evening.jpg", crop: { left: 60, top: 0, width: 680, height: 1280 } },
  "atelier-lace": { file: "atelier-lace.jpg" },
  "atelier-buttons": { file: "atelier-buttons.jpg" },
  "atelier-drape": { file: "atelier-drape.jpg" },
  "atelier-card": { file: "atelier-card.jpg" },
  "couple-night": { file: "couple-night.jpg" },
  "couple-veil": { file: "couple-veil.jpg" },
  "couple-seated": { file: "couple-seated.jpg" },
  "gown-window": { file: "gown-window.jpg" },
};

function pipeline(cfg) {
  let img = sharp(path.join(SRC, cfg.file)).rotate();
  if (cfg.crop) img = img.extract(cfg.crop);
  if (cfg.saturation) img = img.modulate({ saturation: cfg.saturation });
  return img;
}

async function blurDataUrl(img) {
  const buf = await img.clone().resize(16).webp({ quality: 40 }).toBuffer();
  return `data:image/webp;base64,${buf.toString("base64")}`;
}

async function buildPhotos(manifest) {
  for (const [name, cfg] of Object.entries(IMAGES)) {
    const base = pipeline(cfg);
    const { data, info } = await base.clone().toBuffer({ resolveWithObject: true });
    const img = sharp(data);
    const alpha = info.channels === 4;
    const widths = WIDTHS.filter((w) => w < info.width);
    widths.push(info.width);
    for (const w of widths) {
      const r = img.clone().resize(w);
      await r.clone().avif({ quality: alpha ? 60 : 55, effort: 6 }).toFile(path.join(OUT, `${name}-${w}.avif`));
      await r.clone().webp({ quality: 78 }).toFile(path.join(OUT, `${name}-${w}.webp`));
    }
    manifest[name] = { w: info.width, h: info.height, widths, alpha, blur: alpha ? null : await blurDataUrl(img) };
    console.log(`${name}  ${info.width}x${info.height}  [${widths.join(", ")}]`);
  }
}

// "Colour to alpha" against white: keeps anti-aliased edges clean.
async function buildLogo() {
  const { data, info } = await sharp(path.join(SRC, "logo-white.jpg")).raw().toBuffer({ resolveWithObject: true });
  const px = info.width * info.height;
  const teal = Buffer.alloc(px * 4);
  const ivory = Buffer.alloc(px * 4);
  for (let i = 0; i < px; i++) {
    const r = data[i * 3], g = data[i * 3 + 1], b = data[i * 3 + 2];
    let a = Math.max(255 - r, 255 - g, 255 - b) / 255;
    a = Math.min(1, Math.max(0, (a - 0.04) / 0.96));
    const un = (c) => (a > 0 ? Math.min(255, Math.max(0, Math.round((c - 255 * (1 - a)) / a))) : 0);
    teal.set([un(r), un(g), un(b), Math.round(a * 255)], i * 4);
    ivory.set([250, 247, 242, Math.round(a * 255)], i * 4);
  }
  const raw = { raw: { width: info.width, height: info.height, channels: 4 } };
  const dir = path.join(ROOT, "public", "brand");
  await mkdir(dir, { recursive: true });
  for (const [name, buf] of [["logo-teal", teal], ["logo-ivory", ivory]]) {
    const trimmed = await sharp(buf, raw).trim({ threshold: 1 }).png().toBuffer();
    await sharp(trimmed).resize({ width: 480 }).png({ compressionLevel: 9 }).toFile(path.join(dir, `${name}.png`));
    await sharp(trimmed).resize({ width: 480 }).webp({ quality: 90 }).toFile(path.join(dir, `${name}.webp`));
  }
  console.log("logo  teal + ivory");
}

// The designer's sketch, drawn over the blue baseline sheet (A4, 2480x3508). The baseline's photo frame
// is x 412-2067, y 330-3089, registered to sketch-photo. Her signature and the hem run slightly past it,
// so the crop is widened a little (same 3:5) and the blue, corner marks and sheet text are dropped.
const SKETCH_CROP = { left: 380, top: 330, width: 1698, height: 2830 };
const SKETCH_KEEP = [
  { x0: 412, x1: 2067, y0: 330, y1: 3089 }, // the frame
  { x0: 380, x1: 412, y0: 600, y1: 760 }, // signature, left edge
  { x0: 900, x1: 1850, y0: 3089, y1: 3160 }, // hem
];

async function buildSketch(manifest) {
  const { data, info } = await sharp(path.join(SRC, "sketch-scan.png")).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const { left, top, width: w, height: h } = SKETCH_CROP;
  const out = Buffer.alloc(w * h * 4);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const sx = x + left, sy = y + top;
      if (!SKETCH_KEEP.some((k) => sx >= k.x0 && sx < k.x1 && sy >= k.y0 && sy < k.y1)) continue;
      const i = (sy * info.width + sx) * 3;
      // The pale blue never drops below ~215 in its brightest channel; the ink does.
      let a = (215 - Math.max(data[i], data[i + 1], data[i + 2])) / 185;
      a = Math.min(1, Math.max(0, a));
      out.set([40, 44, 46, Math.round(Math.pow(a, 0.85) * 240)], (y * w + x) * 4);
    }
  }
  const buf = await sharp(out, { raw: { width: w, height: h, channels: 4 } }).png().toBuffer();
  const widths = WIDTHS.filter((v) => v < w);
  widths.push(w);
  for (const v of widths) {
    await sharp(buf).resize(v).webp({ quality: 85 }).toFile(path.join(OUT, `sketch-${v}.webp`));
    await sharp(buf).resize(v).avif({ quality: 60 }).toFile(path.join(OUT, `sketch-${v}.avif`));
  }
  manifest["sketch"] = { w, h, widths, alpha: true, blur: null };
  console.log(`sketch  ${w}x${h}`);
}

// Favicon / app icons from the crown-Q monogram (Next.js picks up src/app/icon.png and apple-icon.png).
async function buildIcons() {
  const mark = sharp(path.join(SRC, "monogram.jpg")).extract({ left: 68, top: 50, width: 815, height: 815 });
  const app = path.join(ROOT, "src", "app");
  await mark.clone().resize(512).png({ compressionLevel: 9 }).toFile(path.join(app, "icon.png"));
  await mark.clone().resize(180).png({ compressionLevel: 9 }).toFile(path.join(app, "apple-icon.png"));
  // Maskable icon for the web manifest: extra padding so Android's mask never clips the crown.
  await sharp(path.join(SRC, "monogram.jpg"))
    .resize(512)
    .png({ compressionLevel: 9 })
    .toFile(path.join(ROOT, "public", "brand", "icon-maskable-512.png"));
  console.log("icons  icon.png, apple-icon.png, maskable");
}

// 1200x630 social share image: ivory panel with the logo, the hero couple on the right.
async function buildOg() {
  const W = 1200, H = 630, panel = 500;
  const hero = await sharp(path.join(SRC, "hero-bg.webp"))
    .composite([{ input: path.join(SRC, "hero-couple.webp") }])
    .toBuffer();
  // crop around the couple (centre x ≈ 1036 of 2025) at the photo side's aspect
  const cropW = Math.round(1350 * ((W - panel) / H));
  const photo = await sharp(hero)
    .extract({ left: Math.max(0, 1036 - Math.round(cropW / 2)), top: 0, width: cropW, height: 1350 })
    .resize(W - panel, H)
    .toBuffer();
  const logo = await sharp(path.join(ROOT, "public", "brand", "logo-teal.png")).resize(300).toBuffer();
  const overlay = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <defs><linearGradient id="g" x1="0" x2="1"><stop offset="0" stop-color="#faf7f2"/><stop offset="1" stop-color="#faf7f2" stop-opacity="0"/></linearGradient></defs>
    <rect x="${panel}" y="0" width="140" height="${H}" fill="url(#g)"/>
    <text x="${panel / 2}" y="420" text-anchor="middle" font-family="Georgia, serif" font-style="italic" font-size="30" fill="#1e2524">Nikah &amp; wedding couture,</text>
    <text x="${panel / 2}" y="460" text-anchor="middle" font-family="Georgia, serif" font-style="italic" font-size="30" fill="#317673">designed as one.</text>
    <text x="${panel / 2}" y="540" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" letter-spacing="4" fill="#3e4846">SELANGOR · JOHOR BAHRU</text>
  </svg>`);
  await sharp({ create: { width: W, height: H, channels: 3, background: "#faf7f2" } })
    .composite([
      { input: photo, left: panel, top: 0 },
      { input: overlay, left: 0, top: 0 },
      { input: logo, left: Math.round(panel / 2 - 150), top: 170 },
    ])
    .jpeg({ quality: 86, mozjpeg: true })
    .toFile(path.join(ROOT, "public", "og.jpg"));
  console.log("og.jpg  1200x630");
}

await mkdir(OUT, { recursive: true });
const manifest = {};
const only = process.argv[2];
if (only === "--brand") {
  await buildLogo();
  await buildIcons();
  await buildOg();
  process.exit(0);
}
await buildPhotos(manifest);
await buildSketch(manifest);
await buildLogo();
await buildIcons();
await buildOg();
await writeFile(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
console.log(`\nWrote ${Object.keys(manifest).length} images to public/img and src/lib/images.json`);
