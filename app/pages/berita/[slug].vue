<script setup lang="ts">
import type { ArticleDetailResponse } from '~/types/article'
import { siteOrigin } from '~/config/site'

// Detail Berita (PAGE-002; desktop 130:515, mobile 130:2945). Data hanya lewat /api/article/<slug> (layanan bertipe di server);
// isi artikel = `bodyHtml` tersanitasi di server. Slug tak ada/draft/private/tak valid -> status 404 (halaman error berlayout = task terpisah).
const route = useRoute()
const slug = String(route.params.slug)

const { data, error } = await useFetch<ArticleDetailResponse>(`/api/article/${encodeURIComponent(slug)}`, {
  key: `article-${slug}`,
  dedupe: 'defer' // dibagikan dengan SiteHeader (sorotan kategori di menu, D26): satu permintaan
})

if (error.value || !data.value) {
  const notFound = !error.value || error.value.statusCode === 404
  throw createError({
    statusCode: notFound ? 404 : 500,
    statusMessage: notFound ? 'Not Found' : 'Internal Server Error',
    message: notFound ? 'Artikel tidak ditemukan.' : 'Artikel tidak dapat dimuat.',
    fatal: true
  })
}

const detail = data.value
const article = detail.article
const now = detail.now

// URL kanonis = SITE_URL + /berita/<slug> (HARD-001: produksi tidak memakai header Host; hanya mode dev memakai origin permintaan).
// Dipakai untuk canonical, og:url, og:image (jalur relatif), tautan bagikan, dan salin tautan. URL gambar sudah divalidasi di server.
const origin = siteOrigin(useRequestURL().origin, useRuntimeConfig().public.siteUrl)
const canonical = `${origin}${articlePath(article)}`
const image = article.heroImage
  ? (article.heroImage.url.startsWith('/') ? `${origin}${article.heroImage.url}` : article.heroImage.url)
  : undefined

useSeoMeta({
  title: `${article.title} — IniSumedang`,
  description: article.excerpt || undefined,
  ogTitle: article.title,
  ogDescription: article.excerpt || undefined,
  ogType: 'article',
  ogUrl: canonical,
  ogImage: image
})
useHead({ link: [{ rel: 'canonical', href: canonical }] })

// Isi hanya spasi dianggap kosong (server sudah mengembalikan '' untuk itu; trim() = lapisan kedua).
const hasBody = article.bodyHtml.trim() !== ''

// Berita Terkait (Keputusan PM M-1): < 1024 px blok bawah "compact" = peringkat 1-3 (tanpa sidebar); >= 1024 px sidebar = 1-4
// dan blok bawah "wide" = 5-7. SSR tidak tahu lebar viewport: kedua blok dirender, CSS menyembunyikan salah satunya
// (display: none, jadi keluar dari pohon aksesibilitas dan urutan Tab; satu h2 terlihat per viewport).
const sidebarHeadingId = useId()
const compactHeadingId = useId()
const wideHeadingId = useId()

// Kolom kanan menempel pada >= 1024 px (UX-001 Keputusan PM 5); kontainer = .columns
const sidebarCol = ref<HTMLElement | null>(null)
useStickyColumn(sidebarCol)
</script>

<template>
  <main class="detail">
    <ArticleBreadcrumb :category="article.categories[0] ?? null" :title="article.title" />
    <div class="columns">
      <article class="article">
        <ArticleHeader :article="article" />
        <div class="rule" aria-hidden="true" />
        <figure v-if="article.heroImage" class="photo">
          <img
            class="photo-img"
            :src="article.heroImage.url"
            :alt="article.heroImage.alt"
            :width="article.heroImage.width"
            :height="article.heroImage.height"
            fetchpriority="high"
          >
          <figcaption v-if="article.photoCredit" class="credit">
            {{ article.photoCredit }}
          </figcaption>
        </figure>
        <ArticleBody v-if="hasBody" :body-html="article.bodyHtml" />
        <p v-else class="empty-body">
          Isi artikel belum tersedia.
        </p>
        <ArticleShare class="share" :url="canonical" :title="article.title" />
      </article>
      <!-- Kolom kanan desktop: widget sosial 357x200 (SOC-001, 127:2810) paling atas, lalu (E6, papan iklan) iklan 357x237 (128:503, y 232) di atas Berita Terkait dan 357x368 (128:508) di bawahnya; mobile 130:2945 tanpa iklan -->
      <div ref="sidebarCol" class="sidebar-col">
        <HomeSocialWidget />
        <AdSlot variant="sidebar-m" />
        <aside v-if="detail.related.sidebar.length" class="sidebar" :aria-labelledby="sidebarHeadingId">
          <ArticleRelatedHeading title="Berita Terkait" variant="sidebar" :heading-id="sidebarHeadingId" />
          <ul class="sidebar-list">
            <li v-for="item in detail.related.sidebar" :key="item.id">
              <NewsCard :article="item" :now="now" layout="compact" media-end />
            </li>
          </ul>
        </aside>
        <AdSlot variant="sidebar-l" />
      </div>
    </div>
    <section v-if="detail.related.bottomMobile.length" class="bottom bottom--compact" :aria-labelledby="compactHeadingId">
      <ArticleRelatedHeading title="Berita Terkait" variant="bottom" :heading-id="compactHeadingId" />
      <ul class="bottom-list">
        <li v-for="item in detail.related.bottomMobile" :key="item.id">
          <ArticleRelatedCard :article="item" :now="now" />
        </li>
      </ul>
    </section>
    <section v-if="detail.related.bottom.length" class="bottom bottom--wide" :aria-labelledby="wideHeadingId">
      <ArticleRelatedHeading title="Berita Terkait" variant="bottom" :heading-id="wideHeadingId" />
      <ul class="bottom-list">
        <li v-for="item in detail.related.bottom" :key="item.id">
          <ArticleRelatedCard :article="item" :now="now" />
        </li>
      </ul>
    </section>
  </main>
</template>

<style scoped>
/* Mobile 130:2945: header berakhir y 51, breadcrumb y 63 (jarak 12); breadcrumb berakhir y 79, kepala artikel y 87 (jarak 8).
   Kontainer sama dengan Beranda (1120 + gutter 24). Dasar halaman: Berita Terkait berakhir y 2875, footer y 2901 (26); footer membawa
   margin-atas 32 sendiri, jadi margin-bawah halaman -6 menghasilkan jarak 26 (layout dan footer bersama tidak diubah). */
.detail {
  width: 100%;
  max-width: calc(var(--container-desktop) + 2 * var(--space-24));
  margin: 0 auto -6px;
  padding: 12px var(--space-24) 0;
}

.columns {
  margin-top: var(--space-8); /* 130:3331 ke 130:3342 */
}

.article {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

/* Pemisah kepala 127:2142 hanya ada di desktop (mobile: foto langsung 12 di bawah kepala) */
.rule {
  display: none;
}

/* Foto 130:3361 (353x197 ~ 716:400) langsung di bawah kepala, jarak 12; kredit 130:3363: blok 24 (teks 16,667 pada y 6,5) */
.photo {
  margin: 12px 0 0; /* 130:3342 berakhir y 329, foto y 341 */
}

.photo-img {
  display: block;
  width: 100%;
  height: auto; /* rasio dari atribut width/height (716x400): CLS 0 */
}

/* Kredit 130:3364 Inter Medium 11,111/16,667 #5E6B7D -> --color-footer-muted (selisih 8/5/8, kontras 4,97:1); blok 130:3363 setinggi 24 setelah foto */
.credit {
  padding: 6.5px 0 0.83px;
  font: 500 11.111px/16.667px var(--font-sans);
  color: var(--color-footer-muted);
}

/* Pesan netral bila isi kosong (Keputusan PM 4); tempat dan jarak sama dengan isi (pt 16) */
.empty-body {
  padding-top: var(--space-16);
  color: var(--color-footer-muted);
}

/* Isi 130:3367 berakhir, Bagikan 130:3392 mulai: jarak 24 (130:3366) */
.share {
  margin-top: var(--space-24);
}

.sidebar-col {
  display: none;
}

/* Blok bawah mobile 130:3568: mulai y 1865, setelah Bagikan y 1833 (jarak 32); judul 30 (130:3569), jarak 16 ke kartu (y 46) */
.bottom {
  margin-top: var(--space-32);
}

.bottom-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(var(--container-mobile), 100%), 1fr));
  gap: 5px var(--space-24); /* 130:3579 gap 5 */
  margin: var(--space-16) 0 0;
  padding: 0;
  list-style: none;
}

/* Varian lebar (peringkat 5-7) hanya untuk >= 1024 px, di sebelah sidebar (peringkat 1-4) */
.bottom--wide {
  display: none;
}

/* Tablet 768-1023 (tanpa frame; PRD 3.4): tiga kartu dalam satu baris (tiap ~224 px) agar tidak ada kartu yatim */
@media (min-width: 768px) {
  .bottom-list {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    column-gap: var(--space-16);
  }
}

@media (min-width: 1024px) {
  /* Desktop 130:515: menu kategori berakhir y 141, breadcrumb y 150 (9); kolom artikel y 184 (breadcrumb 150 + 16 + 18);
     Berita Terkait berakhir y 2243, footer y 2381 (138): footer membawa margin-atas 163, jadi margin-bawah -25 */
  .detail {
    margin-bottom: -25px;
    padding-top: 9px;
  }

  .columns {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-top: 18px;
  }

  /* Artikel 739 dan sidebar 357 dari 1120 (130:2409), fluid di bawah 1280 seperti Beranda */
  .article {
    width: calc(100% * 739 / 1120);
  }

  .rule {
    display: block;
    height: 1px; /* 127:2142 */
    background: var(--color-footer-divider); /* #DEE3EB -> #E5E7EB (selisih 7/4/0) */
  }

  .photo {
    margin-top: 0; /* 127:2143 tepat di bawah pemisah */
  }

  /* Kredit 127:2144: blok 42 (pt 10, teks Inter Regular 12/18, sisa 14) */
  .credit {
    padding: 10px 0 14px;
    font: 400 12px/18px var(--font-sans);
  }

  /* Sidebar 357 dari 1120; Figma 127:2170: widget sosial 127:2810 (y 0, 200), iklan 128:503 (y 232), Berita Terkait, iklan 128:508 (celah 32) */
  .sidebar-col {
    display: flex;
    flex-direction: column;
    gap: var(--space-32);
    width: calc(100% * 357 / 1120);
    /* UX-001 Keputusan PM 5: menempel di dalam .columns; top dihitung useStickyColumn (var(--space-24) tanpa JavaScript) */
    position: sticky;
    top: var(--space-24);
  }

  /* Sidebar 130:2226: judul (43) lalu daftar 24 di bawahnya (y 67), celah item 22 (482 = 4 x 104 + 3 x 22) */
  .sidebar-list {
    display: flex;
    flex-direction: column;
    gap: 22px;
    margin: var(--space-24) 0 0;
    padding: 0;
    list-style: none;
  }

  /* Blok bawah 130:2944: lebar 739, mulai y 1937 (artikel berakhir y 1904,28: jarak 32,7 ~ 32) */
  .bottom {
    width: calc(100% * 739 / 1120);
  }

  .bottom--compact {
    display: none;
  }

  .bottom--wide {
    display: block;
  }

  /* 130:2930: tiga kartu 243 dengan celah 5 */
  .bottom-list {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    column-gap: 5px;
    row-gap: 0;
  }
}
</style>
