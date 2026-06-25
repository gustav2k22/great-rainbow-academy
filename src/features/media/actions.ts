"use server";

import { revalidatePath } from "next/cache";
import { imageSize } from "image-size";
import { requireAuth, ADMIN_ROLES } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { slugify } from "@/lib/utils";

const BUCKET = process.env.NEXT_PUBLIC_SUPABASE_BUCKET || "media";

export type UploadResult =
  | { ok: true; asset: { id: string; public_url: string; kind: string; alt: string | null } }
  | { ok: false; message: string };

export async function uploadMedia(formData: FormData): Promise<UploadResult> {
  await requireAuth(ADMIN_ROLES);
  const file = formData.get("file") as File | null;
  const folder = (formData.get("folder") as string) || "general";
  const altText = (formData.get("alt") as string) || null;
  if (!file || file.size === 0) return { ok: false, message: "Please choose a file." };

  const supabase = createAdminClient();
  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
  const base = slugify(file.name.replace(/\.[^.]+$/, "")) || "file";
  const path = `${folder}/${Date.now()}-${base}.${ext}`;
  const mime = file.type || "application/octet-stream";
  const kind = mime.startsWith("video") ? "video" : mime.startsWith("image") ? "image" : "document";

  let width: number | null = null;
  let height: number | null = null;
  if (kind === "image" && !mime.includes("svg")) {
    try {
      const dim = imageSize(buffer);
      width = dim.width ?? null;
      height = dim.height ?? null;
    } catch {}
  }

  const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, buffer, {
    contentType: mime,
    cacheControl: "31536000",
    upsert: false,
  });
  if (upErr) return { ok: false, message: upErr.message };

  const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
  const { data, error } = await supabase
    .from("media_assets")
    .insert({
      bucket: BUCKET,
      path,
      public_url: pub.publicUrl,
      kind,
      mime_type: mime,
      title: file.name,
      alt: altText ?? base,
      folder,
      width,
      height,
      size_bytes: buffer.length,
    })
    .select("id, public_url, kind, alt")
    .single();

  if (error) return { ok: false, message: error.message };
  revalidatePath("/dashboard/media");
  return { ok: true, asset: data };
}

export async function listMedia(opts?: { folder?: string; kind?: string; limit?: number }) {
  await requireAuth(ADMIN_ROLES);
  const supabase = createAdminClient();
  let q = supabase
    .from("media_assets")
    .select("id, public_url, kind, alt, title, folder, width, height, created_at")
    .order("created_at", { ascending: false })
    .limit(opts?.limit ?? 200);
  if (opts?.folder) q = q.eq("folder", opts.folder);
  if (opts?.kind) q = q.eq("kind", opts.kind);
  const { data } = await q;
  return data ?? [];
}

export async function updateMediaMeta(id: string, values: { title?: string; alt?: string; caption?: string }) {
  await requireAuth(ADMIN_ROLES);
  const supabase = createAdminClient();
  const { error } = await supabase.from("media_assets").update(values).eq("id", id);
  if (error) return { ok: false, message: error.message };
  revalidatePath("/dashboard/media");
  return { ok: true };
}

export async function deleteMedia(id: string) {
  await requireAuth(ADMIN_ROLES);
  const supabase = createAdminClient();
  const { data: asset } = await supabase.from("media_assets").select("bucket, path").eq("id", id).single();
  if (asset) {
    await supabase.storage.from(asset.bucket).remove([asset.path]);
  }
  const { error } = await supabase.from("media_assets").delete().eq("id", id);
  if (error) return { ok: false, message: error.message };
  revalidatePath("/dashboard/media");
  return { ok: true };
}
