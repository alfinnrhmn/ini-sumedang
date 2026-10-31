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
