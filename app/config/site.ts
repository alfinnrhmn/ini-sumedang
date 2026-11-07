// Basis URL situs; murni agar bisa diuji dengan `node:test`. Header `Host` berasal dari klien, jadi tidak boleh
// menentukan canonical, og:url, og:image, atau URL bagikan.

/** Domain produksi (asumsi, perlu konfirmasi pemilik). Tanpa garis miring akhir. */
export const SITE_URL = 'https://inisumedang.com'

// Origin `https://host[:port]` (garis miring akhir opsional). Tanpa path, query, hash, userinfo, spasi.
const ORIGIN_PATTERN = /^https:\/\/(?:[A-Za-z0-9-]+\.)*[A-Za-z0-9-]+(?::\d{1,5})?\/?$/

// Basis URL dari `runtimeConfig.public.siteUrl` (env `NUXT_PUBLIC_SITE_URL`): origin huruf kecil tanpa garis miring
// akhir, atau `null` bila kosong/tidak valid. Tidak melempar galat.
export function validSiteUrl(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  if (!ORIGIN_PATTERN.test(trimmed)) return null
  return trimmed.replace(/\/$/, '').toLowerCase()
}

// Basis URL absolut: `configuredUrl` valid, jika tidak `SITE_URL`; `requestOrigin` (header Host) TIDAK PERNAH dipakai
// di produksi. Mode pengembangan memakai origin permintaan; `dev` bisa diisi eksplisit untuk uji unit.
export function siteOrigin(requestOrigin: string, configuredUrl?: unknown, dev: boolean = import.meta.dev): string {
  return dev ? requestOrigin : (validSiteUrl(configuredUrl) ?? SITE_URL)
}
