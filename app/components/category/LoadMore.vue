<script setup lang="ts">
import type { Article, CategoryPageResponse, SearchResponse } from '~/types/article'

// Tombol "Lebih banyak" halaman kategori (UX-001 Keputusan PM 3; menggantikan Pagination). Komponen visual BARU tanpa frame Figma: gaya hanya dari token
// (isi --color-brand, teks putih; kontras 5,0:1; deviasi untuk POLISH-01).
// Bentuk = tautan <a href="/kategori/<slug>?halaman=N+1" rel="next"> (N = halaman terakhir yang sudah dimuat): tanpa JavaScript tetap navigasi biasa
// (SSR/SEO). Dengan JavaScript klik tanpa modifier dicegat dan halaman berikutnya diambil dari /api/category/<slug>?halaman=N+1 lalu ditambahkan
// di bawah daftar yang ada (penggabungan tanpa duplikat: mergeArticles). URL tidak berubah. Satu permintaan pada satu waktu.
// Status: memuat = aria-busy + aria-disabled + teks "Memuat…"; gagal = pesan netral (tombol tetap bisa dicoba ulang). Pengumuman "N berita ditambahkan"
// lewat region role="status" yang selalu ada (tombol bisa hilang di halaman terakhir). Fokus dipindahkan ke tautan judul kartu baru pertama oleh halaman.
// PAGE-004 (digeneralisasi): sumber daftar ditentukan salah satu prop. `slug` = halaman kategori (/kategori/<slug>, /api/category/<slug>);
// `query` = hasil pencarian (/cari?q=..., /api/search?q=...). Perilaku, gaya, dan aksesibilitas sama; halaman kategori tidak berubah.
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
    // Pengguna berpindah kategori / kata kunci / halaman selama permintaan berjalan: hasil usang dibuang
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
  margin-top: var(--space-40); /* jarak ke daftar kartu terakhir (sama dengan paginasi sebelumnya) */
}

/* Tombol terisi primary di tengah kolom. Teks putih di atas --color-brand = 5,0:1 (>= 4,5:1). Tinggi >= 44 (target sentuh). Hover = garis bawah
   (seperti tautan kartu, tanpa warna baru); fokus = cincin global 2 px + jarak 2 px = 4 px. */
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
