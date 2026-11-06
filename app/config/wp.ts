/**
 * Konfigurasi klien baca WordPress; hanya dipakai server (`server/utils/wp-client.ts`), tidak diimpor klien.
 * Satu tempat untuk TTL cache, batas waktu, dan batas ukuran.
 */

/** TTL cache memori per proses untuk daftar artikel dan kategori WordPress. */
export const WP_CACHE_TTL_MS = 60_000

/** Batas waktu satu permintaan ke WordPress, termasuk membaca isinya. */
export const WP_TIMEOUT_MS = 8_000

/** Jumlah percobaan ulang satu permintaan yang gagal karena timeout, galat jaringan, atau 5xx. */
export const WP_RETRIES = 1

/**
 * Jeda minimum (ms) sebelum pemuatan ulang setelah gagal; selama jeda cache lama dipakai atau galat yang sama dikembalikan segera,
 * agar WordPress yang mati tidak membuat tiap permintaan menunggu timeout.
 */
export const WP_FAILURE_BACKOFF_MS = 10_000

/** Ukuran respons maksimum (byte); lebih besar dianggap gagal. */
export const WP_MAX_RESPONSE_BYTES = 20 * 1024 * 1024

/** Jumlah item per halaman REST (maksimum WordPress) dan jumlah halaman maksimum per sumber. */
export const WP_PER_PAGE = 100
export const WP_MAX_PAGES = 10
