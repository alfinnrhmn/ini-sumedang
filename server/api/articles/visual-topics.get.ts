import type { VisualTopicsResponse } from '../../../app/types/article'
import { getVisualTopics } from '../../services/articles'

// Tanpa parameter: jumlah topik dan item tetap (Ruang Visual, HOME-04); query string diabaikan.
export default defineEventHandler((): VisualTopicsResponse => {
  return { topics: getVisualTopics(new Date()) }
})
