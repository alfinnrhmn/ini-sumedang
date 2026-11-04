/**
 * Penjaga sumber POLISH-01 (D26, D33, D36, D41, D42). Perilaku di browser (ukur area klik, sorotan, tab stop) diuji manual/QA;
 * di sini hanya kontrak yang bisa dibaca dari sumber. Pelari: `node:test` (`npm test`).
 */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const source = (file: string) => readFileSync(new URL(`../../${file}`, import.meta.url), 'utf8').replace(/\r\n/g, '\n')

describe('P1 D42 API kategori Berita', () => {
  it('handler memakai isCategoryPageSlug (bukan isValidCategorySlug) sehingga berita = 404 pesan tetap', () => {
    const handler = source('server/api/category/[slug].get.ts')
    assert.match(handler, /if \(!isCategoryPageSlug\(slug\)\) throw notFound\(\)/)
    assert.equal(/isValidCategorySlug/.test(handler), false)
    assert.match(handler, /message: 'Halaman tidak ditemukan\.'/)
  })
})

describe('P2 D33 tombol bagikan WhatsApp', () => {
  const share = source('app/components/article/ArticleShare.vue')

  it('tautan wa.me, tab baru, rel noopener noreferrer, nama aksesibel, ikon dekoratif', () => {
    assert.match(share, /:href="whatsappHref"\n\s+target="_blank"\n\s+rel="noopener noreferrer"\n\s+aria-label="Bagikan ke WhatsApp"/)
    assert.match(share, /src="\/icons\/share-whatsapp\.svg" alt=""/)
    assert.match(share, /whatsappShareUrl\(props\.url, props\.title\)/)
  })

  it('urutan: Facebook, X, WhatsApp, Salin tautan', () => {
    const order = ['tile--facebook', 'tile--x', 'tile--whatsapp', 'tile--copy'].map(name => share.indexOf(`class="tile ${name}"`))
    assert.ok(order.every(index => index > 0))
    assert.deepEqual([...order].sort((a, b) => a - b), order)
  })
})

describe('P3 D36 label kategori kartu di halaman kategori sendiri', () => {
  it('NewsCard: teks biasa hanya pada rute kategori dengan slug sama (Beranda tidak ikut)', () => {
    const card = source('app/components/news/NewsCard.vue')
    assert.match(card, /route\.name === CATEGORY_ROUTE_NAME && route\.params\.slug === first\.slug\) return null/)
    assert.equal(/isCategoryRoute/.test(card), false)
  })
})

describe('P4 D26 sorotan kategori Detail', () => {
  it('CategoryLabel: data-active tanpa aria-current; menu dan laci menyorot keduanya', () => {
    const label = source('app/components/layout/CategoryLabel.vue')
    assert.match(label, /:data-active="active && !current \? '' : undefined"/)
    for (const file of ['app/components/layout/CategoryMenu.vue', 'app/components/layout/CategoryDrawer.vue']) {
      const component = source(file)
      assert.match(component, /:active="category\.slug === activeSlug"/, file)
      assert.match(component, /a\.item\[data-active\]/, file)
    }
  })

  it('SiteHeader membaca payload kunci halaman Detail; di server ikut mengambil kunci sama (dedupe defer = satu permintaan)', () => {
    const header = source('app/components/layout/SiteHeader.vue')
    const page = source('app/pages/berita/[slug].vue')
    assert.match(header, /const detailKey = \(slug: string\) => `article-\$\{slug\}`/)
    assert.match(header, /import\.meta\.server && detailSlug\.value[\s\S]*dedupe: 'defer'/)
    assert.match(header, /nuxtApp\.payload\.data\[detailKey\(detailSlug\.value\)\]/)
    assert.match(page, /key: `article-\$\{slug\}`,\n\s+dedupe: 'defer'/)
  })
})

describe('P5 D41 area klik >= 24 px (penjaga sumber)', () => {
  const files = [
    'app/components/home/Hero.vue', 'app/components/layout/FooterLabel.vue',
    'app/components/article/ArticleHeader.vue', 'app/components/article/ArticleBreadcrumb.vue'
  ]
  it('NewsCard: ::after 24 px dari tepi atas label ke bawah (tidak naik ke kartu di atasnya)', () => {
    assert.match(source('app/components/news/NewsCard.vue'), /\.category-link::after \{[^}]*top: 0;[^}]*width: max\(100%, 24px\);[^}]*height: 24px;[^}]*transform: translateX\(-50%\)/)
  })

  for (const file of files) {
    it(`${file}: ::after tak terlihat 24 px berpusat pada tautan`, () => {
      const component = source(file)
      assert.match(component, /::after \{[^}]*width: max\(100%, 24px\);[^}]*height: 24px;[^}]*transform: translate\(-50%, -50%\)/)
    })
  }
})
