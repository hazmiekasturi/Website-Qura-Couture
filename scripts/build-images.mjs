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

// Placeholder pencil sketch until the real scan arrives: soft Sobel edges in graphite, on transparent.
async function buildSketchPlaceholder(manifest) {
  const src = sharp(path.join(SRC, "sketch-photo.jpg")).greyscale().blur(1.6);
  const { data, info } = await src.raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  const out = Buffer.alloc(w * h * 4);
  const L = (x, y) => data[y * w + x] / 255;
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const gx = -L(x - 1, y - 1) - 2 * L(x - 1, y) - L(x - 1, y + 1) + L(x + 1, y - 1) + 2 * L(x + 1, y) + L(x + 1, y + 1);
      const gy = -L(x - 1, y - 1) - 2 * L(x, y - 1) - L(x + 1, y - 1) + L(x - 1, y + 1) + 2 * L(x, y + 1) + L(x + 1, y + 1);
      let e = Math.sqrt(gx * gx + gy * gy) * 4.2;
      e = Math.min(1, Math.max(0, (e - 0.12) / 0.6));
      e = Math.pow(e, 0.8);
      out.set([52, 56, 58, Math.round(e * 235)], (y * w + x) * 4);
    }
  }
  const img = sharp(out, { raw: { width: w, height: h, channels: 4 } });
  const buf = await img.png().toBuffer();
  const widths = WIDTHS.filter((v) => v < w);
  widths.push(w);
  for (const v of widths) {
    await sharp(buf).resize(v).webp({ quality: 85 }).toFile(path.join(OUT, `sketch-placeholder-${v}.webp`));
    await sharp(buf).resize(v).avif({ quality: 60 }).toFile(path.join(OUT, `sketch-placeholder-${v}.avif`));
  }
  manifest["sketch-placeholder"] = { w, h, widths, alpha: true, blur: null };
  console.log(`sketch-placeholder  ${w}x${h}`);
}

await mkdir(OUT, { recursive: true });
const manifest = {};
await buildPhotos(manifest);
await buildSketchPlaceholder(manifest);
await buildLogo();
await writeFile(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
console.log(`\nWrote ${Object.keys(manifest).length} images to public/img and src/lib/images.json`);
