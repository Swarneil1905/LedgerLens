export function siteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ledgerlens.app";
  return raw.replace(/\/$/, "");
}
