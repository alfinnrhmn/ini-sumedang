/**
 * Uji unit pembantu murni halaman kategori (PAGE-003): validasi `?halaman=` dan slug, hitung paginasi, bentuk URL kategori,
 * penanda kategori aktif, konsistensi daftar kategori resmi dengan footer. Pelari: `node:test` (`npm test`).
 */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { buildPagination, isPageInRange, isValidCategorySlug, parsePageParam, sliceForPage, totalPagesOf } from '../../server/utils/category-page.ts'
import { categoryLink, categoryPagePath, categoryPath, isCategoryRoute } from '../../app/utils/routes.ts'
import { CATEGORY_PER_PAGE, OFFICIAL_CATEGORY_SLUGS } from '../../app/config/category.ts'
import { FOOTER_SECTIONS } from '../../app/config/footer.ts'

describe('CP1 parsePageParam', () => {
  it('tanpa parameter = halaman 1', () => {
    assert.equal(parsePageParam(undefined), 1)
  })

  const valid: [string, number][] = [['1', 1], ['2', 2], ['9', 9], ['10', 10], ['99', 99], ['123', 123], ['9999', 9999]]
  for (const [input, expected] of valid) {
    it(`valid: "${input}" = ${expected}`, () => {
      assert.equal(parsePageParam(input), expected)
    })
  }

  const invalid: [string, unknown][] = [
    ['nol', '0'],
    ['nol di depan', '01'],
    ['nol ganda', '00'],
    ['negatif', '-1'],
    ['plus', '+1'],
    ['desimal', '1.5'],
    ['eksponen', '1e1'],
    ['huruf', 'abc'],
    ['angka dan huruf', '1a'],
    ['kosong', ''],
    ['spasi', ' 1'],
    ['spasi di akhir', '1 '],
    ['baris baru di akhir', '1\n'],
    ['persen-terenkode', '%31'],
    ['persen aneh', '1%'],
    ['5 digit', '10000'],
    ['jauh melewati', '99999999999'],
    ['unicode digit', '١'],
    ['ganda (array)', ['1', '2']],
    ['array satu elemen', ['1']],
    ['null (parameter tanpa nilai)', null],
    ['angka bukan string', 1],
    ['objek', {}]
  ]
  for (const [name, input] of invalid) {
    it(`tidak valid: ${name}`, () => {
      assert.equal(parsePageParam(input), null)
    })
  }
})

describe('CP2 isValidCategorySlug', () => {
  const valid = ['berita', 'sepak-bola', 'bisnis-teknologi', 'a', 'a1-b2', 'x'.repeat(60)]
  for (const slug of valid) {
    it(`valid: ${slug.length > 30 ? `${slug.length} karakter` : slug}`, () => {
      assert.equal(isValidCategorySlug(slug), true)
    })
  }

  const invalid: [string, unknown][] = [
    ['kosong', ''],
    ['huruf besar', 'Hukum'],
    ['path traversal', '../x'],
    ['path traversal ter-encode', '%2e%2e'],
    ['null byte', 'hukum\u0000'],
    ['null byte ter-encode', '%00'],
    ['61 karakter', 'x'.repeat(61)],
    ['300 karakter', 'x'.repeat(300)],
    ['garis bawah', 'sepak_bola'],
    ['tanda hubung ganda', 'sepak--bola'],
    ['tanda hubung di awal', '-hukum'],
    ['spasi', 'sepak bola'],
    ['garis miring', 'a/b'],
    ['tag HTML', '<script>'],
    ['undefined', undefined],
    ['array', ['hukum']],
    ['angka', 1]
  ]
  for (const [name, input] of invalid) {
    it(`tidak valid: ${name}`, () => {
      assert.equal(isValidCategorySlug(input), false)
    })
  }
})

describe('CP3 hitung paginasi', () => {
  it('totalPagesOf: pembulatan ke atas, 0 untuk kosong', () => {
    assert.equal(totalPagesOf(0, 10), 0)
    assert.equal(totalPagesOf(1, 10), 1)
    assert.equal(totalPagesOf(10, 10), 1)
    assert.equal(totalPagesOf(11, 10), 2)
    assert.equal(totalPagesOf(23, 10), 3)
    assert.equal(totalPagesOf(30, 10), 3)
    assert.equal(totalPagesOf(31, 10), 4)
  })

  it('isPageInRange: kategori kosong hanya halaman 1', () => {
    assert.equal(isPageInRange(1, 0, 10), true)
    assert.equal(isPageInRange(2, 0, 10), false)
  })

  it('isPageInRange: satu halaman penuh (10 dari 10) tidak punya halaman 2', () => {
    assert.equal(isPageInRange(1, 10, 10), true)
    assert.equal(isPageInRange(2, 10, 10), false)
  })

  it('isPageInRange: 23 artikel = halaman 1..3, 4 melewati batas', () => {
    assert.equal(isPageInRange(1, 23, 10), true)
    assert.equal(isPageInRange(2, 23, 10), true)
    assert.equal(isPageInRange(3, 23, 10), true)
    assert.equal(isPageInRange(4, 23, 10), false)
    assert.equal(isPageInRange(9999, 23, 10), false)
  })

  it('isPageInRange: halaman < 1 ditolak', () => {
    assert.equal(isPageInRange(0, 23, 10), false)
    assert.equal(isPageInRange(-1, 23, 10), false)
  })

  it('buildPagination', () => {
    assert.deepEqual(buildPagination(2, 23, 10), { page: 2, perPage: 10, total: 23, totalPages: 3 })
    assert.deepEqual(buildPagination(1, 0, 10), { page: 1, perPage: 10, total: 0, totalPages: 0 })
  })

  it('sliceForPage: 23 item = 10 + 10 + 3 tanpa duplikat dan urutan terjaga', () => {
    const items = Array.from({ length: 23 }, (_, index) => index + 1)
    const pages = [1, 2, 3].map(page => sliceForPage(items, page, 10))
    assert.deepEqual(pages.map(page => page.length), [10, 10, 3])
    assert.deepEqual(pages.flat(), items)
    assert.deepEqual(sliceForPage(items, 4, 10), [])
  })

  it('CATEGORY_PER_PAGE = 10 (Keputusan PM 2)', () => {
    assert.equal(CATEGORY_PER_PAGE, 10)
  })
})

describe('CP4 bentuk URL kategori', () => {
  it('categoryPath', () => {
    assert.equal(categoryPath('hukum'), '/kategori/hukum')
    assert.equal(categoryPath('sepak-bola'), '/kategori/sepak-bola')
  })

  it('categoryPath meng-encode karakter tak terduga', () => {
    assert.equal(categoryPath('a b'), '/kategori/a%20b')
    assert.equal(categoryPath('../x'), '/kategori/..%2Fx')
    assert.equal(categoryPath('a?b#c'), '/kategori/a%3Fb%23c')
  })

  it('categoryLink: kategori resmi = path, selain itu null', () => {
    // E1: kategori Berita = Beranda ("/"), tanpa halaman /kategori/berita
    for (const slug of OFFICIAL_CATEGORY_SLUGS) assert.equal(categoryLink(slug), slug === 'berita' ? '/' : `/kategori/${slug}`)
    assert.equal(categoryLink('ruang-visual'), null)
    assert.equal(categoryLink('visual-pemerintahan'), null)
    assert.equal(categoryLink('teknologi'), null)
    assert.equal(categoryLink(''), null)
    assert.equal(categoryLink('Hukum'), null)
  })

  it('categoryPagePath: halaman 1 tanpa parameter, N > 1 dengan ?halaman=N', () => {
    assert.equal(categoryPagePath('hukum', 1), '/kategori/hukum')
    assert.equal(categoryPagePath('hukum', 2), '/kategori/hukum?halaman=2')
    assert.equal(categoryPagePath('sepak-bola', 12), '/kategori/sepak-bola?halaman=12')
  })

  it('9 kategori resmi, tanpa duplikat, semua slug valid', () => {
    assert.equal(OFFICIAL_CATEGORY_SLUGS.length, 9)
    assert.equal(new Set(OFFICIAL_CATEGORY_SLUGS).size, 9)
    for (const slug of OFFICIAL_CATEGORY_SLUGS) assert.equal(isValidCategorySlug(slug), true)
  })
})

describe('CP5 kategori aktif (isCategoryRoute)', () => {
  it('rute kategori dengan slug sama = aktif, termasuk saat ?halaman berubah (query tidak ikut dinilai)', () => {
    assert.equal(isCategoryRoute({ name: 'kategori-slug', params: { slug: 'hukum' } }, 'hukum'), true)
  })

  it('slug lain atau rute lain = tidak aktif', () => {
    assert.equal(isCategoryRoute({ name: 'kategori-slug', params: { slug: 'hukum' } }, 'berita'), false)
    assert.equal(isCategoryRoute({ name: 'index', params: {} }, 'hukum'), false)
    assert.equal(isCategoryRoute({ name: 'berita-slug', params: { slug: 'hukum' } }, 'hukum'), false)
    assert.equal(isCategoryRoute({ name: undefined, params: {} }, 'hukum'), false)
  })
})

describe('CP6 konfigurasi footer', () => {
  const section = FOOTER_SECTIONS.find(item => item.id === 'kategori')

  it('9 item kategori, urutan = daftar resmi, to = categoryPath(slug)', () => {
    assert.ok(section)
    assert.deepEqual(section.links.map(link => link.slug), [...OFFICIAL_CATEGORY_SLUGS])
    for (const link of section.links) assert.equal(link.to, categoryPath(link.slug as string))
  })

  it('item non-kategori tidak punya slug; Terbaru/Terpopuler/Redaksi tetap teks (to null)', () => {
    for (const item of FOOTER_SECTIONS.filter(entry => entry.id !== 'kategori').flatMap(entry => entry.links)) {
      assert.equal(item.slug, undefined)
    }
    const byLabel = new Map(FOOTER_SECTIONS.flatMap(entry => entry.links).map(link => [link.label, link]))
    for (const label of ['Terbaru', 'Terpopuler', 'Redaksi', 'Pedoman Siber', 'Iklan', 'Kontak']) {
      assert.equal(byLabel.get(label)?.to, null, label)
    }
    assert.equal(byLabel.get('Beranda')?.to, '/')
  })
})
