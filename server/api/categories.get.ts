import type { CategoriesResponse } from '../../app/types/article'
import { getCategories } from '../services/articles'

// Tanpa parameter: daftar 9 kategori resmi tetap; query string diabaikan.
export default defineEventHandler(async (): Promise<CategoriesResponse> => {
  return { categories: await getCategories() }
})
