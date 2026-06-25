// Generates favicon assets from the school logo into src/app/.
// Next.js file convention auto-serves: favicon.ico, icon.png, apple-icon.png.
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync, writeFileSync } from "node:fs";
import sharp from "sharp";
import pngToIco from "png-to-ico";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const appDir = join(root, "src", "app");

const candidates = [
  process.env.LOGO_SRC,
  join(root, ".media_src", "logo.png"),
  join(root, "files", "website-images", "logo.png"),
  "C:/Users/GusTavo/AppData/Local/Temp/claude/c--Users-GusTavo-Desktop-Other-Projects-great-rainbow-academy/cfc33c2e-54b5-4e5d-b2c5-de4f483344e1/scratchpad/media_src/logo.png",
].filter(Boolean);

const LOGO = candidates.find((p) => existsSync(p));
if (!LOGO) {
  console.error("Could not find logo.png. Set LOGO_SRC env var.");
  process.exit(1);
}
console.log("Using logo:", LOGO);

// Fit the logo onto a square canvas (small padding) preserving aspect ratio.
async function square(size, background) {
  const pad = Math.round(size * 0.06);
  const inner = size - pad * 2;
  const resized = await sharp(LOGO)
    .resize(inner, inner, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();
  return sharp({
    create: { width: size, height: size, channels: 4, background },
  })
    .composite([{ input: resized, gravity: "center" }])
    .png()
    .toBuffer();
}

const TRANSPARENT = { r: 255, g: 255, b: 255, alpha: 0 };
const WHITE = { r: 255, g: 255, b: 255, alpha: 1 };

// icon.png (transparent) used as the modern favicon
writeFileSync(join(appDir, "icon.png"), await square(512, TRANSPARENT));
console.log("wrote src/app/icon.png (512x512)");

// apple-icon.png (solid bg, iOS adds rounding)
writeFileSync(join(appDir, "apple-icon.png"), await square(180, WHITE));
console.log("wrote src/app/apple-icon.png (180x180)");

// favicon.ico (multi-size) for legacy browsers
const ico = await pngToIco([
  await square(16, TRANSPARENT),
  await square(32, TRANSPARENT),
  await square(48, TRANSPARENT),
]);
writeFileSync(join(appDir, "favicon.ico"), ico);
console.log("wrote src/app/favicon.ico (16/32/48)");

console.log("Favicon assets generated.");
