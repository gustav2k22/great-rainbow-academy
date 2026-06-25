"use client";

import { useState } from "react";
import { SettingsForm } from "./settings-form";
import { NotificationsSettings } from "./notifications-settings";
import type { SiteSettings } from "@/lib/types";

export function SettingsTabs({
  settings,
  emailConfigured,
  smsConfigured,
}: {
  settings: SiteSettings;
  emailConfigured: boolean;
  smsConfigured: boolean;
}) {
  const [tab, setTab] = useState<"general" | "notifications">("general");
  const messaging = settings.messaging ?? {};

  return (
    <div>
      <div className="mb-6 flex gap-2">
        {(["general", "notifications"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full px-4 py-2 text-sm font-bold capitalize transition ${tab === t ? "bg-brand-600 text-white" : "bg-white text-muted ring-1 ring-brand-100 hover:bg-brand-50"}`}
          >
            {t === "general" ? "General" : "Notifications"}
          </button>
        ))}
      </div>

      {tab === "general" ? (
        <SettingsForm settings={settings} />
      ) : (
        <NotificationsSettings initial={messaging} emailConfigured={emailConfigured} smsConfigured={smsConfigured} />
      )}
    </div>
  );
}
