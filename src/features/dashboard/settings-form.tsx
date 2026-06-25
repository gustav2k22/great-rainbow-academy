"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { Input, Label, Textarea } from "@/components/ui/field";
import { MediaPicker } from "@/components/dashboard/media-picker";
import { Panel } from "@/components/dashboard/ui";
import { saveSettings } from "./settings-actions";
import type { SiteSettings } from "@/lib/types";

export function SettingsForm({ settings }: { settings: SiteSettings }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const social = settings.social_links ?? {};

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData(e.target as HTMLFormElement);
    startTransition(async () => {
      const res = await saveSettings(fd);
      if (res.ok) {
        toast.success("Settings saved. The website has been updated.");
        router.refresh();
      } else toast.error(res.message ?? "Could not save");
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Panel>
        <h2 className="mb-4 font-display text-lg font-bold text-ink">School Identity</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="School Name" name="school_name" defaultValue={settings.school_name} />
          <Field label="Tagline" name="tagline" defaultValue={settings.tagline} />
          <Field label="Motto" name="motto" defaultValue={settings.motto} />
          <div>
            <Label htmlFor="primary_color">Primary Color</Label>
            <input id="primary_color" name="primary_color" type="color" defaultValue={settings.primary_color ?? "#7c3aed"} className="h-11 w-20 rounded-lg border border-brand-200" />
          </div>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Logo</Label>
            <MediaPicker name="logo_media_id" defaultPreview={settings.logo_url} folder="branding" label="Logo" />
          </div>
          <div>
            <Label>Social Share Image (OG)</Label>
            <MediaPicker name="og_media_id" defaultPreview={settings.og_image_url} folder="branding" label="OG Image" />
          </div>
        </div>
      </Panel>

      <Panel>
        <h2 className="mb-4 font-display text-lg font-bold text-ink">Contact</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Email" name="email" type="email" defaultValue={settings.email ?? ""} />
          <Field label="WhatsApp" name="whatsapp" defaultValue={settings.whatsapp ?? ""} />
          <Field label="Address" name="address" defaultValue={settings.address ?? ""} className="sm:col-span-2" />
          <div className="sm:col-span-2">
            <Label htmlFor="phones">Phone Numbers</Label>
            <Input id="phones" name="phones" defaultValue={(settings.phones ?? []).join(", ")} placeholder="Separate numbers with commas" />
          </div>
        </div>
      </Panel>

      <Panel>
        <h2 className="mb-4 font-display text-lg font-bold text-ink">Social Links</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Facebook" name="facebook" defaultValue={social.facebook ?? ""} />
          <Field label="Instagram" name="instagram" defaultValue={social.instagram ?? ""} />
          <Field label="YouTube" name="youtube" defaultValue={social.youtube ?? ""} />
          <Field label="TikTok" name="tiktok" defaultValue={social.tiktok ?? ""} />
        </div>
      </Panel>

      <Panel>
        <h2 className="mb-4 font-display text-lg font-bold text-ink">SEO Defaults</h2>
        <div className="space-y-4">
          <Field label="SEO Title" name="seo_title" defaultValue={settings.seo_title ?? ""} />
          <div>
            <Label htmlFor="seo_description">SEO Description</Label>
            <Textarea id="seo_description" name="seo_description" defaultValue={settings.seo_description ?? ""} />
          </div>
        </div>
      </Panel>

      <div className="sticky bottom-4 flex justify-end">
        <button type="submit" disabled={pending} className="inline-flex h-12 items-center gap-2 rounded-full bg-brand-600 px-7 font-bold text-white shadow-lg transition hover:bg-brand-700 disabled:opacity-70">
          {pending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />} Save Settings
        </button>
      </div>
    </form>
  );
}

function Field({
  label, name, defaultValue, type = "text", className,
}: { label: string; name: string; defaultValue?: string; type?: string; className?: string }) {
  return (
    <div className={className}>
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} type={type} defaultValue={defaultValue} />
    </div>
  );
}
