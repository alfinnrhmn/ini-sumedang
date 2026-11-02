import type { CategoriesResponse } from '../../app/types/article'
import { getCategories } from '../services/articles'

// Tanpa parameter: daftar 9 kategori resmi tetap; query string diabaikan.
export default defineEventHandler((): CategoriesResponse => {
  return { categories: getCategories() }
})
