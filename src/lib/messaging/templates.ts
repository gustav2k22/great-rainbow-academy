const SITE = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

/** Branded responsive email shell. */
export function baseEmail(opts: { heading: string; intro?: string; bodyHtml: string; footerNote?: string }) {
  return `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;background:#f5f3ff;font-family:Segoe UI,Arial,sans-serif;color:#1e1b2e;">
  <div style="height:6px;background:linear-gradient(90deg,#ef4444,#f97316,#facc15,#22c55e,#3b82f6,#8b5cf6);"></div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border-radius:18px;overflow:hidden;box-shadow:0 10px 40px -12px rgba(76,29,149,.25);">
        <tr><td style="padding:28px 32px 8px;">
          <p style="margin:0;font-size:13px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#7c3aed;">Great Rainbow Academy 🌈</p>
          <h1 style="margin:8px 0 0;font-size:22px;color:#1e1b2e;">${opts.heading}</h1>
          ${opts.intro ? `<p style="margin:10px 0 0;color:#6b7280;font-size:15px;line-height:1.6;">${opts.intro}</p>` : ""}
        </td></tr>
        <tr><td style="padding:16px 32px 28px;font-size:15px;line-height:1.65;color:#374151;">${opts.bodyHtml}</td></tr>
        <tr><td style="padding:18px 32px;background:#faf5ff;border-top:1px solid #ede9fe;">
          <p style="margin:0;font-size:12px;color:#9ca3af;">${opts.footerNote || "Great Rainbow Academy · The Citadel of Learning · Discipline and Commitment"}</p>
          <p style="margin:6px 0 0;font-size:12px;"><a href="${SITE}" style="color:#7c3aed;text-decoration:none;">Visit our website</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

export function row(label: string, value: string) {
  return `<tr><td style="padding:6px 0;color:#6b7280;font-size:13px;width:40%;">${label}</td><td style="padding:6px 0;color:#1e1b2e;font-weight:600;font-size:14px;">${value || "Not provided"}</td></tr>`;
}

export function detailsTable(rows: string) {
  return `<table role="presentation" width="100%" style="background:#faf5ff;border-radius:12px;padding:14px 16px;margin:6px 0;">${rows}</table>`;
}
