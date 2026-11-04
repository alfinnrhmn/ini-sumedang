/**
 * Basis URL situs (HARD-001). Murni (tanpa auto-import Nuxt) agar bisa diuji dengan `node:test`.
 * Header `Host` berasal dari klien, jadi tidak boleh menentukan canonical, og:url, og:image, atau URL bagikan.
 */

/** Domain produksi [I: asumsi PM, pemilik mengonfirmasi]. Tanpa garis miring akhir. */
export const SITE_URL = 'https://inisumedang.com'

/**
 * Basis untuk membangun URL absolut. Produksi SELALU `SITE_URL`, apa pun `requestOrigin`.
 * Hanya mode pengembangan memakai origin permintaan agar uji lokal (localhost:3000) tetap jalan.
 * `dev` bisa diisi eksplisit (uji unit); nilai SSR dan klien sama karena `import.meta.dev` tetap pada satu build.
 */
export function siteOrigin(requestOrigin: string, dev: boolean = import.meta.dev): string {
  return dev ? requestOrigin : SITE_URL
}
