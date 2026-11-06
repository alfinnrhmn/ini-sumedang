<script setup lang="ts">
import type { Article, CategoryPageResponse, SearchResponse } from '~/types/article'

// Tombol "Lebih banyak" (kategori dan pencarian), tanpa frame Figma: tautan <a rel="next" href="...?halaman=N+1"> yang tanpa JavaScript tetap navigasi biasa (SSR/SEO); dengan JavaScript
// klik tanpa modifier dicegat dan halaman berikutnya digabung tanpa duplikat (mergeArticles), URL tetap. Pengumuman lewat role="status" yang selalu ada; fokus ke kartu baru diatur halaman.
const props = defineProps<{
  /** Slug kategori (halaman kategori). Kosongkan bila memakai `query`. */
  slug?: string
  /** Kata kunci ternormalisasi (halaman hasil pencarian). Kosongkan bila memakai `slug`. */
  query?: string
  /** Halaman terakhir yang sudah dimuat (halaman awal dari URL, bertambah tiap "Lebih banyak"). */
  loadedPage: number
  totalPages: number
  /** Artikel yang sedang tampil; hasil gabungan dikirim kembali lewat `loaded`. */
  articles: Article[]
}>()

const emit = defineEmits<{
  loaded: [payload: { articles: Article[], page: number, added: number }]
}>()

const hasMore = computed(() => props.loadedPage < props.totalPages)
const nextPage = computed(() => props.loadedPage + 1)
const searching = computed(() => props.query !== undefined)
const href = computed(() => (searching.value ? searchPath(props.query ?? '', nextPage.value) : categoryPagePath(props.slug ?? '', nextPage.value)))
// Kunci sumber: pengguna berpindah kategori / kata kunci selama permintaan berjalan = hasil usang dibuang
const sourceKey = computed(() => (searching.value ? `q:${props.query}` : `c:${props.slug}`))

const loading = ref(false)
const failed = ref(false)
const announcement = ref('')

async function onClick(event: MouseEvent) {
  // Klik bermodifier / tombol tengah / sudah ditangani = biarkan browser (buka tab baru dll.)
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
  event.preventDefault()
  if (loading.value) return
  loading.value = true
  failed.value = false
  announcement.value = ''
  const key = sourceKey.value
  const page = nextPage.value
  try {
    const response = props.query !== undefined
      ? await $fetch<SearchResponse>('/api/search', { query: { q: props.query, halaman: page } })
      : await $fetch<CategoryPageResponse>(`/api/category/${encodeURIComponent(props.slug ?? '')}`, { query: { halaman: page } })
    if (sourceKey.value !== key || nextPage.value !== page) return
    const merged = mergeArticles(props.articles, response.articles)
    const added = merged.length - props.articles.length
    emit('loaded', { articles: merged, page, added })
    announcement.value = added > 0 ? `${added} berita ditambahkan` : 'Tidak ada berita baru'
  }
  catch {
    failed.value = true
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="load-more">
    <div v-if="hasMore" class="action">
      <a
        :href="href"
        rel="next"
        class="button"
        :aria-busy="loading"
        :aria-disabled="loading ? 'true' : undefined"
        @click="onClick"
      >
        {{ loading ? 'Memuat…' : 'Lebih banyak' }}
      </a>
      <p v-if="failed" class="error" role="alert">
        Gagal memuat berita. Coba lagi.
      </p>
    </div>
    <p class="visually-hidden" role="status">
      {{ announcement }}
    </p>
  </div>
</template>

<style scoped>
.action {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-16);
  margin-top: var(--space-40); /* jarak ke daftar kartu terakhir */
}

/* Tombol terisi di tengah kolom. Teks putih di atas --color-brand = 5,0:1 (>= 4,5:1); tinggi >= 44 (target sentuh). Hover = garis bawah (tanpa warna baru);
   fokus = cincin global 2 px + jarak 2 px = 4 px. */
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: var(--space-8) var(--space-40);
  border-radius: var(--radius-8);
  background: var(--color-brand);
  color: var(--color-white);
  font: var(--type-text-l-medium);
  letter-spacing: var(--tracking-text-l);
  text-align: center;
}

.button[aria-busy='true'] {
  cursor: progress;
}

@media (hover: hover) {
  .button:hover {
    text-decoration: underline;
  }
}

.error {
  font: var(--type-body);
  color: var(--color-footer-muted); /* 4,97 : 1 di atas putih */
  text-align: center;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
</style>
