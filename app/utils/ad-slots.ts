// Slot iklan (`AdSlot`): nama, ukuran (px), node Figma; murni agar bisa diuji. Nama slot = field `slot` iklan di ACF.
// `width` = lebar maksimum (`null` = selebar wadah); `height` selalu tetap agar tanpa layout shift.
export interface AdSlotSpec {
  /** Lebar maksimum (px) pada desktop; `null` = selebar wadah. */
  width: number | null
  /** Tinggi tetap (px). */
  height: number
  /** Node Figma sumber ukuran. */
  figma: string
}

export const AD_SLOTS = {
  /** Kolom kanan Beranda dan Detail (desktop). */
  'sidebar-m': { width: 357, height: 237, figma: '57:589 / 128:503' },
  /** Kolom kanan Beranda dan Detail (desktop). */
  'sidebar-l': { width: 357, height: 368, figma: '63:600 / 128:508' },
  /** Kolom kanan Beranda, di samping section kategori pertama. */
  'sidebar-s': { width: 357, height: 78, figma: '63:627' },
  /** Beranda desktop, setelah baris ketiga Rekomendasi (lebar kolom kiri 737). */
  'wide-m': { width: 737, height: 107, figma: '84:1442' },
  /** Beranda desktop, setelah Ruang Visual (lebar kontainer 1118). */
  'wide-l': { width: 1118, height: 159, figma: '63:595' },
  /** Beranda mobile, setelah kartu ketiga Rekomendasi dan sebelum Ruang Visual (354 x 78). */
  'mobile-s': { width: null, height: 78, figma: '165:1933 / 100:2536' },
  /** Beranda mobile, setelah kartu ketiga section kategori dan sebelum Ruang Visual (354 x 237). */
  'mobile-m': { width: null, height: 237, figma: '165:1944 / 100:2448' }
} as const satisfies Record<string, AdSlotSpec>

export type AdSlotName = keyof typeof AD_SLOTS
