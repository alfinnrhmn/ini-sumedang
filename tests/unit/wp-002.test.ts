/**
 * Uji unit kategori, label, dan tag mengikuti WordPress. Murni (tanpa Nuxt): pemilihan daftar kategori WordPress, pemilihan section Beranda
 * (preferensi + isi dari daftar), pemilihan tag tampil, validasi slug section, dan penjaga sumber.
 */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { HOME_SECTIONS, HOME_SECTION_MAX, POPULAR_TAG_SLUG, visibleTags } from '../../app/config/home.ts'
import { categoryLink, categoryPath } from '../../app/utils/routes.ts'
import { pickWordPressCategories } from '../../server/utils/wp-map.ts'
import { parseSectionQuery, pickHomeSections } from '../../server/utils/section-query.ts'

const root = new URL('../../', import.meta.url)
function source(path: string): string {
  return readFileSync(new URL(path, root), 'utf8')
}
function listFiles(dir: string): string[] {
  return readdirSync(new URL(dir, root)).flatMap((name) => {
    const path = join(dir, name)
    return statSync(new URL(path, root)).isDirectory() ? listFiles(path) : [path]
  })
}

const cat = (id: number, slug: string, name: string, parent?: number) => ({ id, slug, name, ...(parent ? { parent } : {}) })
const list = (...slugs: string[]) => slugs.map((slug, index) => ({ id: index + 1, slug, name: slug }))

describe('W1 daftar kategori WordPress (pickWordPressCategories)', () => {
  it('semua kategori kecuali uncategorized; urutan id naik, bukan urutan respons', () => {
    const picked = pickWordPressCategories([cat(8, 'hukum', 'Hukum'), cat(1, 'uncategorized', 'Uncategorized'), cat(3, 'zebra', 'Zebra'), cat(5, 'alfa', 'Alfa')])
    assert.deepEqual(picked.map(item => item.slug), ['zebra', 'alfa', 'hukum'])
    assert.deepEqual(picked.map(item => item.id), [3, 5, 8])
  })

  it('ruang-visual dan semua keturunannya (anak, cucu) dikeluarkan; saudara ruang-visual tetap', () => {
    const picked = pickWordPressCategories([
      cat(2, 'berita', 'Berita'),
      cat(20, 'ruang-visual', 'Ruang Visual'),
      cat(24, 'visual-budaya', 'Budaya', 20),
      cat(25, 'visual-olahraga', 'Olahraga', 20),
      cat(26, 'cucu', 'Cucu', 24),
      cat(27, 'anak-nasional', 'Anak Nasional', 3),
      cat(3, 'nasional', 'Nasional')
    ])
    assert.deepEqual(picked.map(item => item.slug), ['berita', 'nasional', 'anak-nasional'])
  })

  it('kategori kosong tetap masuk (hanya id/slug/nama yang dibawa); tanpa kategori = daftar kosong', () => {
    assert.deepEqual(pickWordPressCategories([cat(9, 'sepi', 'Sepi')]), [{ id: 9, slug: 'sepi', name: 'Sepi' }])
    assert.deepEqual(pickWordPressCategories([]), [])
    assert.deepEqual(pickWordPressCategories([cat(1, 'uncategorized', 'Uncategorized')]), [])
  })

  it('nama berentitas didekode jadi teks; slug tanpa halaman (non-ASCII, huruf besar, > 60 karakter) dilewati', () => {
    const picked = pickWordPressCategories([
      cat(2, 'bisnis-teknologi', 'Bisnis &amp; Teknologi'),
      cat(3, 'tanda', 'Tanya &#8211; Jawab &lt;b&gt;'),
      cat(4, '%e0%a4%95', 'Non ASCII'),
      cat(5, 'Huruf-Besar', 'Besar'),
      cat(6, 'a'.repeat(61), 'Terlalu panjang'),
      cat(7, 'a'.repeat(60), 'Tepat batas')
    ])
    assert.deepEqual(picked.map(item => item.name), ['Bisnis & Teknologi', 'Tanya – Jawab <b>', 'Tepat batas'])
  })

  it('tanpa batas 9: 20 kategori semuanya masuk', () => {
    const terms = Array.from({ length: 20 }, (_, index) => cat(index + 2, `kategori-${index + 2}`, `Kategori ${index + 2}`))
    assert.equal(pickWordPressCategories(terms).length, 20)
  })

  it('data berputar (parent saling menunjuk) tidak membuat perulangan tak berujung', () => {
    const picked = pickWordPressCategories([cat(20, 'ruang-visual', 'RV', 21), cat(21, 'a', 'A', 20), cat(30, 'b', 'B', 31), cat(31, 'c', 'C', 30)])
    assert.deepEqual(picked.map(item => item.slug), ['b', 'c'])
  })
})

describe('W2 section Beranda (pickHomeSections)', () => {
  const FIXTURE = list('berita', 'nasional', 'pemerintahan', 'politik', 'hukum', 'sepak-bola', 'otomotif', 'jelajah', 'bisnis-teknologi')
  const ALL = new Set(FIXTURE.map(item => item.slug))

  it('mode fixture: urutan preferensi dan judul konfigurasi (sepak-bola, nasional, bisnis-teknologi, otomotif)', () => {
    assert.deepEqual(pickHomeSections(FIXTURE, ALL), [
      { slug: 'sepak-bola', title: 'Sepak Bola' },
      { slug: 'nasional', title: 'Nasional' },
      { slug: 'bisnis-teknologi', title: 'Bisnis dan Teknologi' },
      { slug: 'otomotif', title: 'Otomotif' }
    ])
    assert.equal(HOME_SECTION_MAX, 4)
  })

  it('preferensi kosong atau tak ada di daftar dilewati, sisa diisi kategori lain menurut urutan daftar dengan nama WordPress', () => {
    const categories = [cat(2, 'berita', 'Berita'), cat(3, 'nasional', 'Nasional'), cat(4, 'acak-a', 'Acak A'), cat(5, 'acak-b', 'Acak B'), cat(6, 'sepak-bola', 'Sepak Bola'), cat(7, 'acak-c', 'Acak C')]
    const picked = pickHomeSections(categories, new Set(['berita', 'nasional', 'acak-a', 'acak-b', 'acak-c']))
    assert.deepEqual(picked, [
      { slug: 'nasional', title: 'Nasional' },
      { slug: 'acak-a', title: 'Acak A' },
      { slug: 'acak-b', title: 'Acak B' },
      { slug: 'acak-c', title: 'Acak C' }
    ])
  })

  it('kategori tanpa artikel tidak pernah menjadi section; maksimum 4; berita (= Beranda) tidak diisi dari daftar', () => {
    const categories = list('berita', 'a', 'kosong', 'b', 'c', 'd', 'e')
    const picked = pickHomeSections(categories, new Set(['berita', 'a', 'b', 'c', 'd', 'e']))
    assert.deepEqual(picked.map(item => item.slug), ['a', 'b', 'c', 'd'])
    assert.deepEqual(pickHomeSections(categories, new Set(['kosong'])).map(item => item.slug), ['kosong'])
    assert.deepEqual(pickHomeSections(categories, new Set(['berita'])), [])
  })

  it('preferensi didahulukan lalu sisa tempat dari daftar; jumlah kurang dari 4 diterima; tanpa kategori / tanpa artikel = kosong', () => {
    const categories = list('a', 'otomotif', 'b')
    assert.deepEqual(pickHomeSections(categories, new Set(['a', 'otomotif', 'b'])).map(item => item.slug), ['otomotif', 'a', 'b'])
    assert.deepEqual(pickHomeSections(categories, new Set()), [])
    assert.deepEqual(pickHomeSections([], new Set(['a', 'otomotif'])), [])
  })

  it('preferensi dan batas bisa diganti; slug ganda tidak muncul dua kali', () => {
    const categories = list('x', 'y', 'z')
    const picked = pickHomeSections(categories, new Set(['x', 'y', 'z']), [{ slug: 'z', title: 'Zed' }, { slug: 'z', title: 'Zed lagi' }], 2)
    assert.deepEqual(picked, [{ slug: 'z', title: 'Zed' }, { slug: 'x', title: 'x' }])
  })

  it('judul HTML dari nama WordPress tetap teks (nama sudah didekode, bukan HTML)', () => {
    const picked = pickHomeSections([cat(2, 'a', 'Bisnis & <b>Teknologi</b>')], new Set(['a']))
    assert.equal(picked[0]?.title, 'Bisnis & <b>Teknologi</b>')
  })

  it('HOME_SECTIONS adalah preferensi: 4 slug berurutan dengan judul konfigurasi', () => {
    assert.deepEqual(HOME_SECTIONS.map(item => item.slug), ['sepak-bola', 'nasional', 'bisnis-teknologi', 'otomotif'])
    assert.deepEqual(HOME_SECTIONS.map(item => item.title), ['Sepak Bola', 'Nasional', 'Bisnis dan Teknologi', 'Otomotif'])
  })
})

describe('W3 tag tampil (visibleTags)', () => {
  const tag = (id: number, slug: string) => ({ id, slug, name: slug })

  it('tag terpopuler dibuang, urutan lain terjaga', () => {
    assert.equal(POPULAR_TAG_SLUG, 'terpopuler')
    assert.deepEqual(visibleTags([tag(1, 'terpopuler'), tag(2, 'dummy'), tag(3, 'sumedang')]).map(item => item.slug), ['dummy', 'sumedang'])
  })

  it('tag tampil pertama = label kedua: bukan terpopuler walau tag itu pertama', () => {
    assert.equal(visibleTags([tag(1, 'terpopuler'), tag(2, 'dummy')])[0]?.slug, 'dummy')
  })

  it('hanya terpopuler atau tanpa tag = daftar kosong; kemiripan nama tidak dibuang; masukan tidak diubah', () => {
    assert.deepEqual(visibleTags([tag(1, 'terpopuler')]), [])
    assert.deepEqual(visibleTags([]), [])
    const input = [tag(1, 'terpopuler-lama'), tag(2, 'terpopuler')]
    assert.deepEqual(visibleTags(input).map(item => item.slug), ['terpopuler-lama'])
    assert.equal(input.length, 2)
  })
})

describe('W4 tautan label kategori mengikuti daftar WordPress (categoryLink)', () => {
  const WORDPRESS = [{ slug: 'acak-satu' }, { slug: 'berita' }]

  it('slug di daftar menaut (berita = "/"), uncategorized dan kategori di luar daftar teks biasa', () => {
    assert.equal(categoryLink('acak-satu', WORDPRESS), '/kategori/acak-satu')
    assert.equal(categoryLink('berita', WORDPRESS), '/')
    assert.equal(categoryLink('uncategorized', WORDPRESS), null)
    assert.equal(categoryLink('visual-budaya', WORDPRESS), null)
    assert.equal(categoryLink('hukum', WORDPRESS), null)
    assert.equal(categoryPath('acak-satu'), '/kategori/acak-satu')
  })
})

describe('W5 parseSectionQuery menerima slug mana pun dari daftar', () => {
  const g = globalThis as unknown as { createError?: (options: { statusCode: number, message: string }) => Error }
  const previous = g.createError
  g.createError = options => Object.assign(new Error(options.message), { statusCode: options.statusCode })
  const known = ['berita', 'hukum', 'acak-satu']

  it('slug di daftar + limit 1-12 diterima', () => {
    assert.deepEqual(parseSectionQuery({ category: 'acak-satu', limit: '4' }, known), { category: 'acak-satu', limit: 4 })
    assert.deepEqual(parseSectionQuery({ category: 'hukum', limit: '12' }, known), { category: 'hukum', limit: 12 })
    assert.deepEqual(parseSectionQuery({ category: 'hukum', limit: '1' }, known), { category: 'hukum', limit: 1 })
  })

  it('slug di luar daftar, limit di luar rentang, atau bentuk salah = 400', () => {
    const bad = [
      { category: 'uncategorized', limit: '4' }, { category: 'hukum', limit: '0' }, { category: 'hukum', limit: '13' }, { category: 'hukum', limit: '123' },
      { category: 'hukum', limit: '-1' }, { category: 'hukum', limit: '1e1' }, { category: 'Hukum', limit: '4' }, { category: ['hukum'], limit: '4' },
      { category: 'hukum' }, { limit: '4' }, {}
    ]
    for (const query of bad) assert.throws(() => parseSectionQuery(query as Record<string, unknown>, known), (error: { statusCode?: number }) => error.statusCode === 400, JSON.stringify(query))
    assert.throws(() => parseSectionQuery({ category: 'hukum', limit: '4' }, []), (error: { statusCode?: number }) => error.statusCode === 400)
    if (previous) g.createError = previous
    else delete g.createError
  })
})

describe('W6 penjaga sumber', () => {
  it('daftar 9 kategori tidak ada lagi di kode aplikasi (OFFICIAL_CATEGORY_SLUGS, pickOfficialCategories)', () => {
    const files = [...listFiles('app'), ...listFiles('server')].filter(file => /\.(ts|vue)$/.test(file))
    for (const file of files) {
      const text = source(file)
      assert.equal(text.includes('OFFICIAL_CATEGORY_SLUGS'), false, file)
      assert.equal(text.includes('pickOfficialCategories'), false, file)
    }
  })

  it('semua pemakai categoryLink memberi daftar kategori dari useCategories()', () => {
    for (const file of ['app/components/news/NewsCard.vue', 'app/components/home/Hero.vue', 'app/components/article/ArticleHeader.vue', 'app/components/article/ArticleBreadcrumb.vue']) {
      const text = source(file)
      assert.match(text, /const categories = useCategories\(\)/, file)
      assert.match(text, /categoryLink\([^)]*, categories\.value\)/, file)
    }
    const composable = source('app/composables/useCategories.ts')
    assert.match(composable, /key: 'categories'/)
    assert.match(composable, /dedupe: 'defer'/)
    assert.match(composable, /getCachedData/)
    assert.match(source('app/components/layout/SiteHeader.vue'), /await useCategoriesFetch\(\)/)
  })

  it('footer mendaftar kategori dari useCategories(); menu membungkus tanpa overflow horizontal', () => {
    const footer = source('app/components/layout/SiteFooter.vue')
    assert.match(footer, /const categories = useCategories\(\)/)
    assert.match(footer, /v-for="section in sections"/)
    assert.equal(footer.includes('v-for="section in FOOTER_SECTIONS"'), false)
    const menu = source('app/components/layout/CategoryMenu.vue')
    assert.match(menu, /flex-wrap: wrap/)
    assert.match(menu, /min-height: 47px/)
    assert.equal(/\n\s+height: 47px/.test(menu), false)
    assert.match(menu, /text-overflow: ellipsis/)
  })

  it('Beranda: satu permintaan section; tanpa HOME_SECTIONS / by-category di halaman', () => {
    const page = source('app/pages/index.vue')
    assert.match(page, /'\/api\/articles\/home-sections'/)
    assert.equal(/import .*(HOME_SECTIONS|HOME_SECTION_COUNTS)/.test(page), false)
    assert.equal(page.includes('/api/articles/by-category'), false)
  })

  it('Detail: baris tag teks (bukan tautan) di antara isi dan Bagikan; label kedua = tag tampil pertama', () => {
    const page = source('app/pages/berita/[slug].vue')
    assert.match(page, /const tags = visibleTags\(article\.tags\)/)
    assert.match(page, /<ArticleTags :tags="tags" \/>\s*<ArticleShare/)
    assert.ok(page.indexOf('<ArticleBody') < page.indexOf('<ArticleTags'))
    const component = source('app/components/article/ArticleTags.vue')
    for (const forbidden of ['NuxtLink', '<a ', '<a>', 'href', 'v-html', '<button']) assert.equal(component.includes(forbidden), false, forbidden)
    assert.match(component, /v-if="tags\.length"/)
    assert.match(source('app/components/article/ArticleHeader.vue'), /visibleTags\(props\.article\.tags\)\[0\]/)
  })

  it('v-html= tetap tepat satu baris di seluruh app', () => {
    const count = listFiles('app').filter(file => file.endsWith('.vue')).reduce((sum, file) => sum + (source(file).match(/v-html=/g) ?? []).length, 0)
    assert.equal(count, 1)
  })
})
