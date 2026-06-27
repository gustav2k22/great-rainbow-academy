// Enhances founder/staff portraits (sharpen + colour) and bakes a soft
// radial background blur so the subject pops, then uploads to Supabase and
// wires the media into the right CMS records.
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";

const env = globalThis.process?.env ?? {};
const BUCKET = env.NEXT_PUBLIC_SUPABASE_BUCKET || "media";
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const SCRATCH = "C:/Users/GusTavo/AppData/Local/Temp/claude/c--Users-GusTavo-Desktop-Other-Projects-great-rainbow-academy/cfc33c2e-54b5-4e5d-b2c5-de4f483344e1/scratchpad/media_src";

// focusY: vertical centre of the sharp region (0..1). Portraits sit a bit high.
const JOBS = [
  { key: "cofounder",    src: "files/co-founder.jpeg",   path: "founders/co-founder.jpg",       title: "Mr. Emmanuel Kwabena Asare", focusY: 0.4 },
  { key: "cofounder1",   src: "files/co-founder-1.jpeg", path: "founders/co-founder-2.jpg",      title: "Mr. Emmanuel Kwabena Asare", focusY: 0.42 },
  { key: "founders",     src: "files/founders.jpeg",     path: "founders/founders-together.jpg", title: "The Founders of Great Rainbow Academy", focusY: 0.45 },
  { key: "proprietress", src: `${SCRATCH}/headmistress_or_principal.jpeg`, path: "founders/proprietress.jpg", title: "Mrs. Deborah Asare", focusY: 0.4 },
];

async function process(input, focusY) {
  // 1) auto-orient + cap size + enhance (sharpen, lift colour & contrast)
  const enhanced = await sharp(input)
    .rotate()
    .resize({ width: 1100, height: 1450, fit: "inside", withoutEnlargement: true })
    .modulate({ brightness: 1.03, saturation: 1.12 })
    .gamma(1.05)
    .sharpen({ sigma: 1.1, m1: 0.6, m2: 2.2 })
    .toBuffer();

  const { width: w, height: h } = await sharp(enhanced).metadata();

  // 2) soft, slightly muted blurred backdrop
  const blurred = await sharp(enhanced)
    .blur(16)
    .modulate({ brightness: 0.93, saturation: 0.88 })
    .toBuffer();

  // 3) radial alpha mask: sharp centre, feathering to the edges
  const cx = 50;
  const cy = Math.round(focusY * 100);
  const mask = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
       <defs>
         <radialGradient id="g" cx="${cx}%" cy="${cy}%" r="72%">
           <stop offset="0%"  stop-color="#fff" stop-opacity="1"/>
           <stop offset="48%" stop-color="#fff" stop-opacity="1"/>
           <stop offset="82%" stop-color="#fff" stop-opacity="0.12"/>
           <stop offset="100%" stop-color="#fff" stop-opacity="0"/>
         </radialGradient>
       </defs>
       <rect width="${w}" height="${h}" fill="url(#g)"/>
     </svg>`
  );

  // 4) keep the sharp pixels only inside the mask, lay over the blurred base
  const sharpMasked = await sharp(enhanced)
    .composite([{ input: mask, blend: "dest-in" }])
    .png()
    .toBuffer();

  const final = await sharp(blurred)
    .composite([{ input: sharpMasked, blend: "over" }])
    .jpeg({ quality: 90, mozjpeg: true })
    .toBuffer();

  const meta = await sharp(final).metadata();
  return { buffer: final, width: meta.width, height: meta.height };
}

async function run() {
  const results = {};
  for (const job of JOBS) {
    const input = readFileSync(job.src);
    const { buffer, width, height } = await process(input, job.focusY);

    const { error: upErr } = await supabase.storage.from(BUCKET).upload(job.path, buffer, {
      contentType: "image/jpeg",
      upsert: true,
      cacheControl: "31536000",
    });
    if (upErr) {
      console.error(`! upload ${job.path}: ${upErr.message}`);
      continue;
    }
    const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(job.path);
    const { data: asset, error: dbErr } = await supabase
      .from("media_assets")
      .upsert(
        {
          bucket: BUCKET,
          path: job.path,
          public_url: pub.publicUrl,
          kind: "image",
          mime_type: "image/jpeg",
          title: job.title,
          alt: job.title,
          folder: "founders",
          width,
          height,
          size_bytes: buffer.length,
        },
        { onConflict: "bucket,path" }
      )
      .select("id, public_url")
      .single();
    if (dbErr) {
      console.error(`! db ${job.path}: ${dbErr.message}`);
      continue;
    }
    results[job.key] = asset;
    console.log(`✓ ${job.path} (${width}x${height})`);
  }
  return results;
}

run().then(async (r) => {
  // ---- Wire into CMS ------------------------------------------------------
  if (r.cofounder) {
    await supabase.from("staff_members").update({ photo_id: r.cofounder.id }).ilike("full_name", "Mr. Emmanuel%");
    console.log("linked co-founder photo");
  }
  if (r.proprietress) {
    await supabase.from("staff_members").update({ photo_id: r.proprietress.id }).ilike("full_name", "Mrs. Deborah%");
    await supabase.from("page_sections").update({ media_id: r.proprietress.id }).eq("page_slug", "home").eq("section_key", "proprietress");
    console.log("linked proprietress photo");
  }
  if (r.founders) {
    const images = [r.founders, r.proprietress, r.cofounder, r.cofounder1].filter(Boolean).map((a) => a.public_url);
    await supabase.from("page_sections").upsert(
      {
        page_slug: "about",
        section_key: "founders",
        heading: "Meet Our Founders",
        subheading: "The visionaries behind Great Rainbow Academy",
        body:
          "Great Rainbow Academy was founded in 2009 by Mr. Emmanuel Kwabena Asare, a businessman, and Madam Deborah Asare, an educationist. Together they turned a class of three children into the thriving school community it is today, anchored on discipline, commitment and excellence.",
        media_id: r.founders.id,
        data: { images, founders: [
          { name: "Madam Deborah Asare", role: "Proprietress & Founder", image: r.proprietress?.public_url },
          { name: "Mr. Emmanuel Kwabena Asare", role: "Co-Founder", image: r.cofounder?.public_url },
        ] },
        sort_order: 3,
        is_published: true,
      },
      { onConflict: "page_slug,section_key" }
    );
    console.log("created About 'Meet Our Founders' section + carousel");
  }
  console.log("Done.");
  globalThis.process.exit(0);
}).catch((e) => {
  console.error(e);
  globalThis.process.exit(1);
});
