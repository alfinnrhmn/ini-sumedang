/**
 * Konfigurasi widget sosial "Ikuti IniSumedang" (SOC-001; Figma `Frame 283`: desktop 101:2601 / 127:2810, mobile 100:2447).
 * Satu daftar untuk semua halaman. Fungsi: menampilkan jumlah pengikut tiap akun media sosial IniSumedang (bukan fitur follow pengguna).
 *
 * `value` dan `unit` adalah PENAMPUNG [I]: angka contoh dari Figma (12,4K, 8,7K, ...), bukan angka nyata. Sebelum tayang harus diganti angka
 * nyata (sumber final: opsi WordPress, task SOC-001 bagian WordPress yang ditunda) atau widget disembunyikan (PRD §13).
 * `url` kosong = kotak teks biasa (bukan <a>); hanya `https://` yang membuat kotak menjadi tautan (`socialHref` di bawah).
 *
 * `gap` dan `textWidth` = jarak ikon ke teks dan lebar kolom teks per kotak persis seperti Figma (nilainya berbeda tiap kotak);
 * `iconBox` = ukuran kotak ikon; `iconRect` = posisi/ukuran berkas SVG di dalam kotak bila bukan seluruh kotak (WhatsApp: grup mask).
 * Berisi juga logika murni (`socialHref`, `socialLabel`); tanpa auto-import Nuxt agar bisa diuji dengan `node:test`.
 */
export interface SocialIconRect {
  x: number
  y: number
  width: number
  height: number
}

export interface SocialStat {
  /** Nama platform (dibaca pembaca layar: "<name>, <value> <unit>"). */
  name: string
  /** Berkas SVG dari Figma di public/icons. */
  icon: string
  /** Kotak ikon [lebar, tinggi] dalam px (Figma: 24x24; X 20x23). */
  iconBox: readonly [number, number]
  /** Posisi/ukuran SVG di dalam kotak ikon; kosong = mengisi seluruh kotak. */
  iconRect?: SocialIconRect
  /** Nilai tampil, mis. "12,4K" (penampung [I]). */
  value: string
  /** Satuan tampil ("Pengikut"; YouTube "Subscriber"). */
  unit: string
  /** Opsional. Hanya `https://`; kosong = teks biasa tanpa tautan. */
  url?: string
  /** Jarak ikon ke kolom teks (px, Figma). */
  gap: number
  /** Lebar kolom teks (px, Figma); kolom melebar bila nilai lebih panjang. */
  textWidth: number
}

/** Urutan Figma: Facebook, Instagram, X, YouTube, TikTok, WhatsApp (grid 3x2). */
export const SOCIAL_STATS: SocialStat[] = [
  { name: 'Facebook', icon: '/icons/social-stat-facebook.svg', iconBox: [24, 24], value: '12,4K', unit: 'Pengikut', gap: 10, textWidth: 52 },
  { name: 'Instagram', icon: '/icons/social-stat-instagram.svg', iconBox: [24, 24], value: '8,7K', unit: 'Pengikut', gap: 7, textWidth: 50 },
  { name: 'X', icon: '/icons/social-stat-x.svg', iconBox: [20, 23], value: '3,1K', unit: 'Pengikut', gap: 4, textWidth: 50 },
  { name: 'YouTube', icon: '/icons/social-stat-youtube.svg', iconBox: [24, 24], value: '5,6K', unit: 'Subscriber', gap: 5, textWidth: 58 },
  { name: 'TikTok', icon: '/icons/social-stat-tiktok.svg', iconBox: [24, 24], value: '9,2K', unit: 'Pengikut', gap: 4, textWidth: 50 },
  {
    name: 'WhatsApp',
    icon: '/icons/social-stat-whatsapp.svg',
    iconBox: [24, 24],
    iconRect: { x: 2.0832, y: 1.9992, width: 19.916, height: 19.8382 }, // Figma 90:2399: inset 8,33% 8,33% 9,01% 8,68% dari 24x24
    value: '2,8K',
    unit: 'Pengikut',
    gap: 10,
    textWidth: 50
  }
]

/**
 * URL akun yang aman dijadikan tautan, atau `null` (kotak tetap teks biasa). Hanya skema `https:` yang diterima
 * (tolak `http:`, `javascript:`, `data:`, URL relatif/skema-relatif, dan URL berisi kredensial); hasilnya `href` ter-normalisasi.
 */
export function socialHref(url: string | undefined | null): string | null {
  if (typeof url !== 'string') return null
  const trimmed = url.trim()
  if (!/^https:\/\//i.test(trimmed)) return null
  try {
    const parsed = new URL(trimmed)
    if (parsed.protocol !== 'https:' || !parsed.hostname || parsed.username || parsed.password) return null
    return parsed.href
  } catch {
    return null
  }
}

/** Nama aksesibel satu unit untuk kotak (teks biasa maupun tautan): "<Platform>, <nilai> <satuan>". */
export function socialLabel(item: { name: string, value: string, unit: string }): string {
  return `${item.name}, ${item.value} ${item.unit}`
}
