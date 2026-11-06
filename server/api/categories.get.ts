import type { CategoriesResponse } from '../../app/types/article'
import { getCategories } from '../services/articles'

// Tanpa parameter: daftar kategori situs (WordPress, atau 9 kategori contoh di mode fixture); query string diabaikan.
export default defineEventHandler(async (): Promise<CategoriesResponse> => {
  return { categories: await getCategories() }
})
