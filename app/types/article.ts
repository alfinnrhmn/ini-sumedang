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
