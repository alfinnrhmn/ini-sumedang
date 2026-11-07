// Urutan PREFERENSI section kategori Beranda, bukan daftar tetap: `pickHomeSections` (server) memilih dari kategori
// WordPress yang punya artikel terbit; sisa tempat diisi kategori lain yang tak kosong (judul = nama WordPress).
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

/** Jumlah section kategori maksimum di Beranda dan jumlah kartu per section. */
export const HOME_SECTION_MAX = 4
export const HOME_SECTION_ARTICLE_COUNT = 4

/** Batas `limit` yang diterima API section (bilangan bulat). */
export const SECTION_LIMIT_MIN = 1
export const SECTION_LIMIT_MAX = 12

/** Kolom samping Beranda: jumlah item per tab. */
export const SIDEBAR_COUNT = 4

/** Terpopuler = pilihan editor: artikel bertag `POPULAR_TAG_SLUG` dalam `POPULAR_WINDOW_DAYS` hari terakhir. */
export const POPULAR_WINDOW_DAYS = 14
export const POPULAR_TAG_SLUG = 'terpopuler'

/** Tag yang tampil di UI: semua tag kecuali tag fungsional `POPULAR_TAG_SLUG`, urutan terjaga. */
export function visibleTags<T extends { slug: string }>(tags: readonly T[]): T[] {
  return tags.filter(tag => tag.slug !== POPULAR_TAG_SLUG)
}

/** Jumlah slide hero (= jumlah titik indikator). */
export const HERO_SLIDE_COUNT = 4

/** Durasi animasi geser-kiri hero (ms). Satu sumber untuk CSS (variabel) dan cadangan waktu. */
export const HERO_SLIDE_MS = 400

/** Interval putar otomatis hero (ms); animasi geser memakai `HERO_SLIDE_MS` yang sama dengan perpindahan manual. */
export const HERO_AUTOPLAY_MS = 5000

/** Putar otomatis hero: `manual` = tidak berputar (< 2 slide, reduced-motion, belum di klien), `paused`, `running`. */
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

/** `aria-live` slide: `off` saat berputar otomatis (tanpa pengumuman tiap 5 detik), `polite` saat dijeda/manual. */
export function heroLiveMode(status: HeroAutoplayStatus): 'off' | 'polite' {
  return status === 'running' ? 'off' : 'polite'
}

/** Slide berikutnya, berputar (1 > 2 > 3 > 4 > 1). `count` < 1 = 0. */
export function nextHeroSlide(current: number, count: number): number {
  return count < 1 ? 0 : (current + 1) % count
}
