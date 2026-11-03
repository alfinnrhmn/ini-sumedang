/**
 * Konfigurasi section kategori Beranda (HOME-02). Urutan array = urutan di halaman.
 * Judul section = teks konfigurasi (Figma 84:1437, 57:496, 57:501, 57:505), bukan nama kategori
 * dari data. Slug [I]: final di gerbang WordPress (PRD §13).
 */
export const HOME_SECTIONS = [
  { slug: 'sepak-bola', title: 'Sepak Bola' },
  { slug: 'nasional', title: 'Nasional' },
  { slug: 'bisnis-teknologi', title: 'Bisnis dan Teknologi' },
  { slug: 'otomotif', title: 'Otomotif' }
] as const

export type HomeSectionSlug = (typeof HOME_SECTIONS)[number]['slug']

/** Jumlah kartu per section. Default 4 [usulan PM; angka final menunggu pemilik, "4 atau 6"]. */
export const HOME_SECTION_COUNTS: Record<HomeSectionSlug, number> = {
  'sepak-bola': 4,
  'nasional': 4,
  'bisnis-teknologi': 4,
  'otomotif': 4
}

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
