/**
 * Basis URL situs (HARD-001). Murni (tanpa auto-import Nuxt) agar bisa diuji dengan `node:test`.
 * Header `Host` berasal dari klien, jadi tidak boleh menentukan canonical, og:url, og:image, atau URL bagikan.
 */

/** Domain produksi [I: asumsi PM, pemilik mengonfirmasi]. Tanpa garis miring akhir. */
export const SITE_URL = 'https://inisumedang.com'

// Origin `https://host[:port]` (garis miring akhir opsional): host = label huruf/angka/strip dipisah titik. Tanpa path, query, hash, userinfo, spasi.
const ORIGIN_PATTERN = /^https:\/\/(?:[A-Za-z0-9-]+\.)*[A-Za-z0-9-]+(?::\d{1,5})?\/?$/

/**
 * Basis URL dari konfigurasi deployment (`runtimeConfig.public.siteUrl`, env `NUXT_PUBLIC_SITE_URL`).
 * Mengembalikan origin (huruf kecil, tanpa garis miring akhir) atau `null` bila kosong/tidak valid. Tidak melempar galat.
 */
export function validSiteUrl(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  if (!ORIGIN_PATTERN.test(trimmed)) return null
  return trimmed.replace(/\/$/, '').toLowerCase()
}

/**
 * Basis untuk membangun URL absolut. Produksi: `configuredUrl` yang valid, jika tidak `SITE_URL`; `requestOrigin` (header Host)
 * TIDAK PERNAH dipakai. Hanya mode pengembangan memakai origin permintaan agar uji lokal (localhost:3000) tetap jalan.
 * `dev` bisa diisi eksplisit (uji unit); nilai SSR dan klien sama karena `import.meta.dev` dan runtimeConfig public sama di keduanya.
 */
export function siteOrigin(requestOrigin: string, configuredUrl?: unknown, dev: boolean = import.meta.dev): string {
  return dev ? requestOrigin : (validSiteUrl(configuredUrl) ?? SITE_URL)
}
