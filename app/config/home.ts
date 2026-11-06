/**
 * Konfigurasi section kategori Beranda (HOME-02, WP-002). `HOME_SECTIONS` adalah urutan PREFERENSI, bukan daftar tetap: section Beranda
 * dipilih dari kategori WordPress yang ada dan punya artikel terbit (`pickHomeSections` di server). Slug yang cocok dengan preferensi
 * diisi dulu menurut urutan ini dengan judul konfigurasi (Figma 84:1437, 57:496, 57:501, 57:505); sisa tempat diisi kategori lain
 * yang tak kosong (judul = nama WordPress).
 */
export interface HomeSectionPreference {
  slug: string
  title: string
}

export const HOME_SECTIONS: readonly HomeSectionPreference[] = [
  { slug: 'sepak-bola', title: 'Sepak Bola' },
  { slug: 'nasional', title: 'Nasional' },
  { slug: 'bisnis-teknologi', title: 'Bisnis dan Teknologi' },
  { slug: 'otomotif', title: 'Otomotif' }
]

/** Jumlah section kategori maksimum di Beranda dan jumlah kartu per section. Default 4 dan 4 [usulan PM; angka final menunggu pemilik, "4 atau 6"]. */
export const HOME_SECTION_MAX = 4
export const HOME_SECTION_ARTICLE_COUNT = 4

/** Batas `limit` yang diterima API section (bilangan bulat). */
export const SECTION_LIMIT_MIN = 1
export const SECTION_LIMIT_MAX = 12

/** Kolom samping Beranda (HOME-03): jumlah item per tab [V 34:354 dan 4 `Card Popular News` di 90:1611]. */
export const SIDEBAR_COUNT = 4

/**
 * Terpopuler = pilihan editor (PRD §3.6): artikel terbit bertag `POPULAR_TAG_SLUG` yang terbit dalam
 * `POPULAR_WINDOW_DAYS` hari terakhir (umur tepat 14 hari masuk, lebih tua tidak). Satu konstanta jendela.
 * Skenario "tidak ada populer" untuk QA di salinan sementara: ubah POPULAR_TAG_SLUG menjadi slug yang tak ada.
 */
export const POPULAR_WINDOW_DAYS = 14
export const POPULAR_TAG_SLUG = 'terpopuler'

/**
 * Tag yang tampil di UI (WP-002 Keputusan PM 5): semua tag artikel kecuali tag fungsional `POPULAR_TAG_SLUG`. Urutan terjaga;
 * tag tampil pertama = label kedua di kepala artikel, semuanya = baris tag di bawah isi Detail.
 */
export function visibleTags<T extends { slug: string }>(tags: readonly T[]): T[] {
  return tags.filter(tag => tag.slug !== POPULAR_TAG_SLUG)
}

/** Hero Beranda (HOME-07): jumlah slide = jumlah titik di Figma [V 21:4981 dan 90:2137: 4 titik]. */
export const HERO_SLIDE_COUNT = 4

/** Durasi animasi geser-kiri hero (E3, evaluasi pemilik; rentang 350-450 ms, ease). Satu sumber untuk CSS (variabel) dan cadangan waktu. */
export const HERO_SLIDE_MS = 400

/**
 * Putar otomatis hero (UX-001, Keputusan PM 1; instruksi pemilik 3 Nov 2026 menggantikan "tanpa putar otomatis" HOME-07).
 * Interval antar slide; animasi geser-kiri memakai `HERO_SLIDE_MS` yang sama dengan perpindahan manual.
 */
export const HERO_AUTOPLAY_MS = 5000

/** Keadaan putar otomatis: `manual` = tidak berputar (kurang dari 2 slide, reduced-motion, atau belum di klien), `paused` = dijeda, `running` = berputar. */
export type HeroAutoplayStatus = 'manual' | 'paused' | 'running'

export interface HeroAutoplayInput {
  /** Sudah di klien (setelah mount): SSR dan hidrasi selalu `manual`, tanpa perubahan tata letak. */
  mounted: boolean
  slideCount: number
  /** `prefers-reduced-motion: reduce`. */
  reducedMotion: boolean
  /** Pointer (mouse/pen) di atas hero. */
  hovering: boolean
  /** Fokus keyboard di dalam hero. */
  focused: boolean
  /** Tab browser tersembunyi (`visibilitychange`). */
  hidden: boolean
}

/** Murni: menentukan apakah hero berputar, dijeda, atau manual. Timer hanya berjalan saat `running`. */
export function heroAutoplayStatus(input: HeroAutoplayInput): HeroAutoplayStatus {
  if (!input.mounted || input.slideCount < 2 || input.reducedMotion) return 'manual'
  return input.hovering || input.focused || input.hidden ? 'paused' : 'running'
}

/** `aria-live` area slide: `off` selama berputar otomatis (tanpa pengumuman tiap 5 detik), `polite` saat dijeda atau manual. */
export function heroLiveMode(status: HeroAutoplayStatus): 'off' | 'polite' {
  return status === 'running' ? 'off' : 'polite'
}

/** Slide berikutnya, berputar (1 > 2 > 3 > 4 > 1). `count` < 1 = 0. */
export function nextHeroSlide(current: number, count: number): number {
  return count < 1 ? 0 : (current + 1) % count
}
