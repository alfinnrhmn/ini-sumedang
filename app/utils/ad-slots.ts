/**
 * Daftar slot iklan (E6, evaluasi pemilik): `AdSlot` meniru slot "Advertisement" di 4 frame final Figma (file tCjg6zC8qsZ4jhQpXvb0gK).
 * Satu tempat untuk nama slot, ukuran (px), dan node Figma sumbernya. Murni (tanpa auto-import Nuxt) agar bisa diuji dengan `node:test`.
 * Nama slot juga nilai field `slot` (Select) iklan di ACF WordPress dan dipakai server untuk memvalidasinya (ADS-002).
 *
 * `width` = lebar maksimum Figma; di kolom yang lebih sempit slot menyusut (`width: 100%`), `height` selalu tetap (tanpa layout shift).
 * `width: null` = selalu selebar wadah (slot mobile 354 = lebar kolom frame 402).
 */
export interface AdSlotSpec {
  /** Lebar maksimum (px) pada desktop; `null` = selebar wadah. */
  width: number | null
  /** Tinggi tetap (px). */
  height: number
  /** Node Figma sumber ukuran (daftar lengkap di docs/tasks/PAGE-003.md). */
  figma: string
}

export const AD_SLOTS = {
  /** Beranda desktop 57:589, Detail desktop 128:503 (kolom kanan 357). */
  'sidebar-m': { width: 357, height: 237, figma: '57:589 / 128:503' },
  /** Beranda desktop 63:600, Detail desktop 128:508 (kolom kanan 357). */
  'sidebar-l': { width: 357, height: 368, figma: '63:600 / 128:508' },
  /** Beranda desktop 63:627 (kolom kanan, di samping section kategori pertama). */
  'sidebar-s': { width: 357, height: 78, figma: '63:627' },
  /** Beranda desktop 84:1442 (setelah baris ketiga Rekomendasi, lebar kolom kiri 737). */
  'wide-m': { width: 737, height: 107, figma: '84:1442' },
  /** Beranda desktop 63:595 (setelah Ruang Visual, lebar kontainer 1118). */
  'wide-l': { width: 1118, height: 159, figma: '63:595' },
  /** Beranda mobile 165:1933 (setelah kartu ketiga Rekomendasi) dan 100:2536 (sebelum Ruang Visual), 354 x 78. */
  'mobile-s': { width: null, height: 78, figma: '165:1933 / 100:2536' },
  /** Beranda mobile 165:1944 (setelah kartu ketiga section kategori) dan 100:2448 (sebelum Ruang Visual), 354 x 237. */
  'mobile-m': { width: null, height: 237, figma: '165:1944 / 100:2448' }
} as const satisfies Record<string, AdSlotSpec>

export type AdSlotName = keyof typeof AD_SLOTS
