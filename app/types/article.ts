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

/** Tag artikel (grup `wp:term` ke-2); label sekunder di kepala Detail. */
export type ArticleTag = ArticleCategory

/**
 * Tipe domain Detail Berita (PAGE-002): `Article` + isi. `bodyHtml` SUDAH disanitasi di server (`sanitizeBodyHtml`);
 * HTML mentah dari CMS tidak pernah ada di tipe ini. Kosong = isi tidak tersedia (atau ditolak penyanitasi).
 */
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

/**
 * Respons `/api/article/<slug>`: Berita Terkait = satu daftar berperingkat. >= 1024 px: sidebar 4 teratas (peringkat 1-4),
 * `bottom` 3 berikutnya (5-7). < 1024 px (tanpa sidebar): `bottomMobile` = 3 teratas (peringkat 1-3). CSS menampilkan salah satu.
 */
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

/**
 * Satu topik Ruang Visual (HOME-04): kategori anak dari induk `ruang-visual`,
 * 1 kartu besar (`lead`, artikel terbaru topik) dan hingga 3 berita berthumbnail (`items`).
 * Topik dengan artikel kurang dari 4 punya `items` lebih pendek (kosong bila hanya 1 artikel).
 */
export interface VisualTopic {
  topic: ArticleCategory
  lead: Article
  items: Article[]
}

/** Respons Ruang Visual: urutan topik = kategori paling baru dibuat dulu; `topics` kosong = section tidak dirender. */
export interface VisualTopicsResponse {
  topics: VisualTopic[]
}

/** Respons kolom samping Beranda (HOME-03): satu `now` untuk kedua daftar. `popular` kosong = tab Terpopuler disembunyikan. */
export interface SidebarResponse {
  latest: Article[]
  popular: Article[]
  /** Waktu server (ISO) untuk waktu relatif sama di SSR dan hidrasi. */
  now: string
}

/** Respons hero Beranda (HOME-07): artikel terbit terbaru, urutan = urutan slide; kosong = hero tidak dirender. */
export type HeroResponse = RecommendedResponse

/** Respons kategori menu header dan laci (HOME-06): 9 kategori resmi, urutan = urutan menu. */
export interface CategoriesResponse {
  categories: ArticleCategory[]
}

/** Metadata paginasi halaman kategori (PAGE-003). `totalPages` 0 = kategori tanpa artikel terbit. */
export interface CategoryPagination {
  page: number
  perPage: number
  total: number
  totalPages: number
}

/**
 * Respons `/api/category/<slug>?halaman=N` (PAGE-003): kategori resmi, artikel terbit halaman itu (terbaru dulu, tanpa isi `body`),
 * dan paginasi. `articles` kosong hanya pada halaman 1 kategori tanpa artikel (keadaan kosong).
 */
export interface CategoryPageResponse {
  category: ArticleCategory
  articles: Article[]
  pagination: CategoryPagination
  /** Waktu server (ISO) untuk waktu relatif sama di SSR dan hidrasi. */
  now: string
}

/**
 * Respons `/api/search?q=&halaman=N` (PAGE-004): `query` = kata kunci ternormalisasi (dirender hanya sebagai teks), artikel terbit
 * halaman itu (kata di judul dulu, lalu terbaru; tanpa isi `body`), dan paginasi. `articles` kosong hanya pada halaman 1 tanpa hasil.
 */
export interface SearchResponse {
  query: string
  articles: Article[]
  pagination: CategoryPagination
  /** Waktu server (ISO) untuk waktu relatif sama di SSR dan hidrasi. */
  now: string
}
