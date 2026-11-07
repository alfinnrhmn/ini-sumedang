<script setup lang="ts">
import type { ArticleDetailResponse } from '~/types/article'
import { siteOrigin } from '~/config/site'
import { visibleTags } from '~/config/home'

// Data lewat /api/article/<slug>; `bodyHtml` sudah tersanitasi di server. Slug tak ada/draft/private/tak valid: 404.
const route = useRoute()
const slug = String(route.params.slug)

const { data, error } = await useFetch<ArticleDetailResponse>(`/api/article/${encodeURIComponent(slug)}`, {
  key: `article-${slug}`,
  dedupe: 'defer' // dibagikan dengan SiteHeader (sorotan kategori di menu): satu permintaan
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

// URL kanonis = SITE_URL + /berita/<slug> (produksi tak memakai header Host; hanya dev memakai origin permintaan).
// Dipakai untuk canonical, og:url, og:image, tautan bagikan, dan salin tautan. URL gambar sudah divalidasi di server.
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

// Tag tampil: tanpa tag fungsional `terpopuler`; baris tag di bawah isi, di atas "Bagikan" (kosong: tidak dirender).
const tags = visibleTags(article.tags)

// Isi hanya spasi dianggap kosong (server sudah mengembalikan '' untuk itu; trim() = lapisan kedua).
const hasBody = article.bodyHtml.trim() !== ''

// Berita Terkait: < 1024 px blok bawah "compact" = peringkat 1-3; >= 1024 px sidebar = 1-4 dan blok bawah "wide" = 5-7.
// SSR tak tahu lebar viewport: kedua blok dirender, CSS menyembunyikan satu (display: none, keluar dari urutan Tab).
const sidebarHeadingId = useId()
const compactHeadingId = useId()
const wideHeadingId = useId()

// Kolom kanan menempel pada >= 1024 px; kontainer = .columns
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
        <ArticleTags :tags="tags" />
        <ArticleShare class="share" :url="canonical" :title="article.title" />
      </article>
      <!-- Kolom kanan desktop: widget sosial, iklan, Berita Terkait, iklan; disembunyikan di mobile -->
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
/* Jarak atas ke breadcrumb dan kepala artikel meniru desain mobile. Footer ber-margin-atas 32, jadi margin-bawah -6
   menghasilkan jarak 26 ke Berita Terkait (footer bersama tidak diubah). */
.detail {
  width: 100%;
  max-width: calc(var(--container-desktop) + 2 * var(--space-24));
  margin: 0 auto -6px;
  padding: 12px var(--space-24) 0;
}

.columns {
  margin-top: var(--space-8);
}

.article {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

/* Pemisah kepala hanya ada di desktop (mobile: foto langsung 12 di bawah kepala) */
.rule {
  display: none;
}

/* Foto langsung di bawah kepala, jarak 12; kredit: blok setinggi 24 (teks 16,667 pada y 6,5) */
.photo {
  margin: 12px 0 0;
}

.photo-img {
  display: block;
  width: 100%;
  height: auto; /* rasio dari atribut width/height (716x400): CLS 0 */
}

/* Kredit: #5E6B7D dipetakan ke --color-footer-muted (selisih 8/5/8, kontras 4,97:1); blok setinggi 24 setelah foto */
.credit {
  padding: 6.5px 0 0.83px;
  font: 500 11.111px/16.667px var(--font-sans);
  color: var(--color-footer-muted);
}

/* Pesan netral bila isi kosong; tempat dan jarak sama dengan isi (pt 16) */
.empty-body {
  padding-top: var(--space-16);
  color: var(--color-footer-muted);
}

.share {
  margin-top: var(--space-24);
}

.sidebar-col {
  display: none;
}

.bottom {
  margin-top: var(--space-32);
}

.bottom-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(var(--container-mobile), 100%), 1fr));
  gap: 5px var(--space-24);
  margin: var(--space-16) 0 0;
  padding: 0;
  list-style: none;
}

/* Varian lebar (peringkat 5-7) hanya untuk >= 1024 px, di sebelah sidebar (peringkat 1-4) */
.bottom--wide {
  display: none;
}

/* Tablet 768-1023: tiga kartu dalam satu baris (tiap ~224 px) agar tidak ada kartu yatim */
@media (min-width: 768px) {
  .bottom-list {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    column-gap: var(--space-16);
  }
}

@media (min-width: 1024px) {
  /* Desktop: breadcrumb 9 dari menu kategori, artikel 18 di bawahnya; footer margin-atas 163, jadi margin-bawah -25 */
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

  /* Artikel 739 dan sidebar 357 dari 1120, fluid di bawah 1280 seperti Beranda */
  .article {
    width: calc(100% * 739 / 1120);
  }

  .rule {
    display: block;
    height: 1px;
    background: var(--color-footer-divider); /* #DEE3EB -> #E5E7EB (selisih 7/4/0) */
  }

  .photo {
    margin-top: 0; /* tepat di bawah pemisah */
  }

  /* Kredit desktop: blok 42 (pt 10, teks Inter Regular 12/18, sisa 14) */
  .credit {
    padding: 10px 0 14px;
    font: 400 12px/18px var(--font-sans);
  }

  /* Sidebar 357 dari 1120: widget sosial, iklan, Berita Terkait, iklan (celah 32) */
  .sidebar-col {
    display: flex;
    flex-direction: column;
    gap: var(--space-32);
    width: calc(100% * 357 / 1120);
    /* Menempel di dalam .columns; top dihitung useStickyColumn (var(--space-24) tanpa JavaScript) */
    position: sticky;
    top: var(--space-24);
  }

  /* Sidebar: judul (43) lalu daftar 24 di bawahnya, celah item 22 (482 = 4 x 104 + 3 x 22) */
  .sidebar-list {
    display: flex;
    flex-direction: column;
    gap: 22px;
    margin: var(--space-24) 0 0;
    padding: 0;
    list-style: none;
  }

  /* Blok bawah: lebar 739, jarak ke artikel ~32 */
  .bottom {
    width: calc(100% * 739 / 1120);
  }

  .bottom--compact {
    display: none;
  }

  .bottom--wide {
    display: block;
  }

  /* Tiga kartu 243 dengan celah 5 */
  .bottom-list {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    column-gap: 5px;
    row-gap: 0;
  }
}
</style>
