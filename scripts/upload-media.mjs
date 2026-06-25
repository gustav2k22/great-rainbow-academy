// Ensures the `media` storage bucket exists, uploads every local asset
// from the source folder, and registers each one in public.media_assets.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname, basename } from 'node:path';
import { createClient } from '@supabase/supabase-js';
import { imageSize } from 'image-size';
import mime from 'mime-types';
import { config } from 'dotenv';

config({ path: '.env.local' });

const SOURCE_DIR =
  process.env.MEDIA_SRC ||
  'C:/Users/GusTavo/AppData/Local/Temp/claude/c--Users-GusTavo-Desktop-Other-Projects-great-rainbow-academy/cfc33c2e-54b5-4e5d-b2c5-de4f483344e1/scratchpad/media_src';
const BUCKET = process.env.NEXT_PUBLIC_SUPABASE_BUCKET || 'media';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

// Decide a tidy folder + friendly title for each source file.
function classify(file) {
  const lower = file.toLowerCase();
  if (lower === 'logo.png') return { folder: 'branding', title: 'Great Rainbow Academy Logo' };
  if (lower.startsWith('headmistress')) return { folder: 'leadership', title: 'Proprietress' };
  if (lower.includes('bece')) return { folder: 'events', title: 'BECE Congratulations' };
  if (lower.startsWith('portfolio-vid')) return { folder: 'gallery', title: 'School Life Video' };
  if (lower.startsWith('img-')) return { folder: 'gallery', title: 'School Gallery' };
  return { folder: 'general', title: basename(file, extname(file)) };
}

async function ensureBucket() {
  const { data: buckets } = await supabase.storage.listBuckets();
  if (!buckets?.some((b) => b.name === BUCKET)) {
    const { error } = await supabase.storage.createBucket(BUCKET, { public: true });
    if (error && !/already exists/i.test(error.message)) throw error;
    console.log(`Created bucket "${BUCKET}"`);
  } else {
    console.log(`Bucket "${BUCKET}" already exists`);
  }
}

async function run() {
  await ensureBucket();
  const files = readdirSync(SOURCE_DIR).filter((f) => statSync(join(SOURCE_DIR, f)).isFile());
  console.log(`Uploading ${files.length} files from ${SOURCE_DIR}`);

  for (const file of files) {
    const fullPath = join(SOURCE_DIR, file);
    const buffer = readFileSync(fullPath);
    const { folder, title } = classify(file);
    const path = `${folder}/${file}`;
    const mimeType = mime.lookup(file) || 'application/octet-stream';
    const kind = mimeType.startsWith('video') ? 'video' : mimeType.startsWith('image') ? 'image' : 'document';

    let width = null;
    let height = null;
    if (kind === 'image' && !mimeType.includes('svg')) {
      try {
        const dim = imageSize(buffer);
        width = dim.width ?? null;
        height = dim.height ?? null;
      } catch {}
    }

    let upErr = null;
    try {
      const res = await supabase.storage.from(BUCKET).upload(path, buffer, {
        contentType: mimeType,
        upsert: true,
        cacheControl: '31536000',
      });
      upErr = res.error;
    } catch (e) {
      upErr = e;
    }
    if (upErr) {
      console.error(`  ! ${file}: ${upErr.message}`);
      continue;
    }
    const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);

    const { error: dbErr } = await supabase.from('media_assets').upsert(
      {
        bucket: BUCKET,
        path,
        public_url: pub.publicUrl,
        kind,
        mime_type: mimeType,
        title,
        alt: title,
        folder,
        width,
        height,
        size_bytes: buffer.length,
      },
      { onConflict: 'bucket,path' }
    );
    if (dbErr) {
      console.error(`  ! db ${file}: ${dbErr.message}`);
      continue;
    }
    console.log(`  ✓ ${path} (${kind}${width ? ` ${width}x${height}` : ''})`);
  }
  console.log('Media upload complete.');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
