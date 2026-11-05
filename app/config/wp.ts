/**
 * Konfigurasi klien baca WordPress (API-001). Hanya dipakai server (`server/utils/wp-client.ts`); tidak diimpor oleh klien.
 * Satu tempat untuk TTL cache, batas waktu, dan batas ukuran.
 */

/** TTL cache memori per proses untuk daftar artikel dan kategori WordPress (API-001, Keputusan PM 2). */
export const WP_CACHE_TTL_MS = 60_000

/** Batas waktu satu permintaan ke WordPress, termasuk membaca isinya (Keputusan PM 2). */
export const WP_TIMEOUT_MS = 8_000

/** Jumlah percobaan ulang satu permintaan yang gagal karena timeout, galat jaringan, atau 5xx (Keputusan PM 2: 1 retry). */
export const WP_RETRIES = 1

/**
 * Setelah satu pemuatan gagal, pemuatan ulang paling cepat sekian ms kemudian [I]. Selama jeda itu cache lama dipakai atau
 * galat yang sama dikembalikan segera, sehingga WordPress yang mati tidak membuat tiap permintaan menunggu timeout.
 */
export const WP_FAILURE_BACKOFF_MS = 10_000

/** Ukuran respons maksimum (byte); lebih besar dari ini dianggap gagal (Keputusan PM 2: 20 MB). */
export const WP_MAX_RESPONSE_BYTES = 20 * 1024 * 1024

/** Jumlah item per halaman REST (maksimum WordPress) dan jumlah halaman maksimum per sumber (Keputusan PM 1). */
export const WP_PER_PAGE = 100
export const WP_MAX_PAGES = 10
