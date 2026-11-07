export interface ArticleCategory {
  id: number
  slug: string
  name: string
}

export interface ArticleImage {
  url: string
  alt: string
  width: number
  height: number
}

/** Tipe domain artikel (hanya field yang dipakai Beranda). */
export interface Article {
  id: number
  slug: string
  title: string
  /** ISO 8601 UTC */
  publishedAt: string
  categories: ArticleCategory[]
  heroImage: ArticleImage | null
  authorLabel: string
}

/** Tag artikel (grup `wp:term` ke-2); yang tampil di UI = `visibleTags()` (label kedua kepala Detail dan baris tag). */
export type ArticleTag = ArticleCategory

/** Detail berita: `Article` + isi. `bodyHtml` SUDAH disanitasi di server (`sanitizeBodyHtml`); kosong = tak ada. */
export interface ArticleDetail extends Article {
  /** Ringkasan teks polos (tanpa HTML). */
  excerpt: string
  bodyHtml: string
  tags: ArticleTag[]
  /** Teks polos kredit foto (mis. "Foto: IniSumedang"); kosong = tanpa kredit. */
  photoCredit: string
  /** Menit baca (>= 1), dihitung di server dari teks `bodyHtml`. */
  readingMinutes: number
}

/** Respons `/api/article/<slug>`: Berita Terkait satu daftar berperingkat; CSS memilih sidebar+bottom/bottomMobile. */
export interface ArticleDetailResponse {
  article: ArticleDetail
  related: { sidebar: Article[], bottom: Article[], bottomMobile: Article[] }
  /** Waktu server (ISO) untuk waktu relatif sama di SSR dan hidrasi. */
  now: string
}

export interface RecommendedResponse {
  articles: Article[]
  /** Waktu server (ISO) untuk menghitung waktu relatif sama di SSR dan hidrasi. */
  now: string
}

/** Respons daftar artikel satu kategori section (bentuk sama dengan Rekomendasi). */
export type CategoryArticlesResponse = RecommendedResponse

/** Satu section kategori Beranda: `title` = judul konfigurasi atau nama kategori WordPress; `articles` tak kosong. */
export interface HomeSection {
  slug: string
  title: string
  articles: Article[]
}

/** Respons section kategori Beranda: sampai `HOME_SECTION_MAX` section, urutan tampil; kosong = tidak ada section. */
export interface HomeSectionsResponse {
  sections: HomeSection[]
  /** Waktu server (ISO) untuk waktu relatif sama di SSR dan hidrasi. */
  now: string
}

/** Satu topik Ruang Visual: kategori anak `ruang-visual`; `lead` = terbaru, `items` hingga 3 berita lain. */
export interface VisualTopic {
  topic: ArticleCategory
  lead: Article
  items: Article[]
}

/** Respons Ruang Visual: urutan topik = kategori paling baru dibuat dulu; `topics` kosong = section tidak dirender. */
export interface VisualTopicsResponse {
  topics: VisualTopic[]
}

/** Respons kolom samping Beranda: satu `now` untuk kedua daftar. `popular` kosong = tab Terpopuler disembunyikan. */
export interface SidebarResponse {
  latest: Article[]
  popular: Article[]
  /** Waktu server (ISO) untuk waktu relatif sama di SSR dan hidrasi. */
  now: string
}

/** Respons hero Beranda: artikel terbit terbaru, urutan = urutan slide; kosong = hero tidak dirender. */
export type HeroResponse = RecommendedResponse

/** Respons kategori menu header, laci, dan footer: kategori WordPress (fixture: 9 contoh), urutan menu. */
export interface CategoriesResponse {
  categories: ArticleCategory[]
}

/** Metadata paginasi halaman kategori. `totalPages` 0 = kategori tanpa artikel terbit. */
export interface CategoryPagination {
  page: number
  perPage: number
  total: number
  totalPages: number
}

/** Respons `/api/category/<slug>?halaman=N`: kategori, artikel terbit halaman itu (tanpa `body`), paginasi. */
export interface CategoryPageResponse {
  category: ArticleCategory
  articles: Article[]
  pagination: CategoryPagination
  /** Waktu server (ISO) untuk waktu relatif sama di SSR dan hidrasi. */
  now: string
}

/** Respons `/api/search?q=&halaman=N`: `query` ternormalisasi (hanya teks), artikel terbit halaman itu, paginasi. */
export interface SearchResponse {
  query: string
  articles: Article[]
  pagination: CategoryPagination
  /** Waktu server (ISO) untuk waktu relatif sama di SSR dan hidrasi. */
  now: string
}
