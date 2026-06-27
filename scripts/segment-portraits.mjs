// True portrait-mode background blur for founder/staff photos.
// Enhances with sharp, segments the subject in a real browser (Playwright +
// @imgly/background-removal WASM), blurs only the background, recomposites,
// uploads to Supabase (cache-busted) and re-wires the About founders carousel.
import { readFileSync } from "node:fs";
import sharp from "sharp";
import { chromium } from "playwright";
import { createClient } from "@supabase/supabase-js";

const env = globalThis.process.env;
const BUCKET = env.NEXT_PUBLIC_SUPABASE_BUCKET || "media";
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const SCRATCH = "C:/Users/GusTavo/AppData/Local/Temp/claude/c--Users-GusTavo-Desktop-Other-Projects-great-rainbow-academy/cfc33c2e-54b5-4e5d-b2c5-de4f483344e1/scratchpad/media_src";
const VER = Date.now();

const JOBS = [
  { key: "cofounder",    src: "files/co-founder.jpeg",   path: "founders/co-founder.jpg" },
  { key: "cofounder1",   src: "files/co-founder-1.jpeg", path: "founders/co-founder-2.jpg" },
  { key: "founders",     src: "files/founders.jpeg",     path: "founders/founders-together.jpg" },
  { key: "proprietress", src: `${SCRATCH}/headmistress_or_principal.jpeg`, path: "founders/proprietress.jpg" },
];

async function enhance(file) {
  return sharp(readFileSync(file))
    .rotate()
    .resize({ width: 1000, height: 1300, fit: "inside", withoutEnlargement: true })
    .modulate({ brightness: 1.03, saturation: 1.1 })
    .gamma(1.05)
    .sharpen({ sigma: 1.0 })
    .png()
    .toBuffer();
}

async function compose(enhanced, fgPng) {
  const bg = await sharp(enhanced).blur(32).modulate({ brightness: 0.9, saturation: 0.8 }).toBuffer();
  const fg = await sharp(fgPng).sharpen({ sigma: 0.7 }).png().toBuffer();
  const final = await sharp(bg).composite([{ input: fg }]).jpeg({ quality: 90, mozjpeg: true }).toBuffer();
  const meta = await sharp(final).metadata();
  return { buffer: final, width: meta.width, height: meta.height };
}

async function run() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.setDefaultTimeout(240000);
  await page.setContent(`<!doctype html><meta charset=utf-8><body><script type="module">
    import { removeBackground } from 'https://esm.sh/@imgly/background-removal@1.5.5';
    window.__rb = async (d) => {
      const inBlob = await (await fetch(d)).blob();
      const out = await removeBackground(inBlob, { model: 'isnet_fp16' });
      return await new Promise(r => { const fr = new FileReader(); fr.onload = () => r(fr.result); fr.readAsDataURL(out); });
    };
    window.__ready = true;
  </script></body>`);
  await page.waitForFunction("window.__ready === true", { timeout: 60000 });

  const results = {};
  for (const job of JOBS) {
    try {
      const enhanced = await enhance(job.src);
      const dataUrl = "data:image/png;base64," + enhanced.toString("base64");
      const fgUrl = await page.evaluate((d) => window.__rb(d), dataUrl);
      const fgPng = Buffer.from(fgUrl.split(",")[1], "base64");
      const { buffer, width, height } = await compose(enhanced, fgPng);

      const { error: upErr } = await supabase.storage.from(BUCKET).upload(job.path, buffer, {
        contentType: "image/jpeg",
        upsert: true,
        cacheControl: "31536000",
      });
      if (upErr) throw upErr;

      const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(job.path);
      const publicUrl = `${pub.publicUrl}?v=${VER}`;
      const { data: asset } = await supabase
        .from("media_assets")
        .update({ public_url: publicUrl, width, height, size_bytes: buffer.length })
        .eq("bucket", BUCKET)
        .eq("path", job.path)
        .select("id, public_url")
        .single();
      results[job.key] = asset;
      console.log(`✓ ${job.path} (${width}x${height})`);
    } catch (e) {
      console.error(`! ${job.path}: ${e.message}`);
    }
  }
  await browser.close();
  return results;
}

run()
  .then(async (r) => {
    // refresh About founders carousel slides with the new cache-busted URLs
    if (r.founders) {
      const label = {
        founders: { name: "Our Founders", role: "Building Great Rainbow since 2009" },
        proprietress: { name: "Madam Deborah Asare", role: "Proprietress & Founder" },
        cofounder: { name: "Mr. Emmanuel Kwabena Asare", role: "Co-Founder" },
        cofounder1: { name: "Mr. Emmanuel Kwabena Asare", role: "Co-Founder" },
      };
      const order = ["founders", "proprietress", "cofounder", "cofounder1"];
      const slides = order.filter((k) => r[k]).map((k) => ({ image: r[k].public_url, name: label[k].name, role: label[k].role }));
      const { data: sec } = await supabase.from("page_sections").select("data").eq("page_slug", "about").eq("section_key", "founders").single();
      await supabase
        .from("page_sections")
        .update({ data: { ...sec.data, slides, images: slides.map((s) => s.image) } })
        .eq("page_slug", "about")
        .eq("section_key", "founders");
      console.log("refreshed About founders carousel");
    }
    console.log("Done.");
    globalThis.process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    globalThis.process.exit(1);
  });
