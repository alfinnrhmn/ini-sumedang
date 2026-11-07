// Uji unit pencarian: normalisasi `q`, `searchTerms`/`searchScore`/`compareSearchHits`, `searchPage`, `searchPath`,
// dan penjaga sumber. `searchArticles` diuji lewat `searchPage` (layanan memakai impor tanpa ekstensi).
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { SEARCH_MAX_LENGTH, SEARCH_MIN_LENGTH, SEARCH_PER_PAGE, normalizeSearchQuery, searchInputValue } from '../../app/config/search.ts'
import { compareSearchHits, searchPage, searchScore, searchTerms } from '../../server/utils/search-query.ts'
import type { SearchCandidate } from '../../server/utils/search-query.ts'
import { SEARCH_ROUTE_NAME, searchPath } from '../../app/utils/routes.ts'

const source = (path: string) => readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8').replace(/\r\n/g, '\n')
const stripComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, '')

describe('SR1 normalizeSearchQuery', () => {
  const valid: [string, unknown, string][] = [
    ['kata biasa', 'sumedang', 'sumedang'],
    ['dua kata', 'transformasi digital', 'transformasi digital'],
    ['batas bawah 2 karakter', 'ab', 'ab'],
    ['spasi di tepi dibuang', '  sumedang  ', 'sumedang'],
    ['spasi berurutan dipadatkan', 'pemkab   sumedang    digital', 'pemkab sumedang digital'],
    ['spasi Unicode (NBSP, pemisah baris U+2028) dipadatkan', 'a  b', 'a b'],
    ['huruf besar dipertahankan', 'Sumedang DIGITAL', 'Sumedang DIGITAL'],
    ['batas atas 100 karakter', 'x'.repeat(100), 'x'.repeat(100)],
    ['100 karakter setelah dipadatkan dari lebih panjang', `${'x'.repeat(50)}      ${'y'.repeat(43)}`, `${'x'.repeat(50)} ${'y'.repeat(43)}`],
    ['simbol HTML dipertahankan apa adanya (hanya teks)', '<script>alert(1)</script>', '<script>alert(1)</script>'],
    ['kutip ganda dan tunggal', '"a\'b"', '"a\'b"'],
    ['javascript:', 'javascript:alert(1)', 'javascript:alert(1)'],
    ['path traversal', '../../etc/passwd', '../../etc/passwd'],
    ['karakter non-Latin', 'berita 日本語 😀', 'berita 日本語 😀']
  ]
  for (const [name, input, expected] of valid) {
    it(`valid: ${name}`, () => {
      assert.equal(normalizeSearchQuery(input), expected)
    })
  }

  const invalid: [string, unknown][] = [
    ['kosong', ''],
    ['hanya spasi', '     '],
    ['1 karakter', 'a'],
    ['1 karakter dengan spasi', '  a  '],
    ['101 karakter', 'x'.repeat(101)],
    ['5.000 karakter', 'x'.repeat(5000)],
    ['101 karakter tanpa spasi berlebih', `${'x'.repeat(60)} ${'y'.repeat(40)}`],
    ['null byte', 'abc\u0000def'],
    ['tab', 'abc\tdef'],
    ['baris baru di tengah', 'abc\ndef'],
    ['baris baru di akhir', 'abc\n'],
    ['carriage return', 'abc\rdef'],
    ['escape (U+001B)', 'abc\u001Bdef'],
    ['DEL (U+007F)', 'abc\u007Fdef'],
    ['kontrol C1 (U+0085)', 'abc\u0085def'],
    ['undefined', undefined],
    ['null (parameter tanpa nilai)', null],
    ['ganda (array)', ['ab', 'cd']],
    ['array satu elemen', ['abc']],
    ['angka', 12345],
    ['objek', { q: 'abc' }],
    ['boolean', true]
  ]
  for (const [name, input] of invalid) {
    it(`tidak valid: ${name}`, () => {
      assert.equal(normalizeSearchQuery(input), null)
    })
  }

  it('batas panjang: 2-100', () => {
    assert.equal(SEARCH_MIN_LENGTH, 2)
    assert.equal(SEARCH_MAX_LENGTH, 100)
    assert.equal(SEARCH_PER_PAGE, 10)
  })

  it('idempoten: menormalisasi hasil normalisasi tidak mengubahnya', () => {
    for (const input of ['  a   b  c ', 'Sumedang', '<b>x</b>  y']) {
      const once = normalizeSearchQuery(input)
      assert.equal(normalizeSearchQuery(once), once)
    }
  })
})

describe('SR2 searchInputValue (nilai kolom cari di header)', () => {
  it('q valid tampil ternormalisasi', () => {
    assert.equal(searchInputValue('  transformasi   digital '), 'transformasi digital')
  })
  it('q tidak valid tapi string biasa tetap diisikan (dipadatkan, dipotong 100)', () => {
    assert.equal(searchInputValue('a'), 'a')
    assert.equal(searchInputValue('x'.repeat(5000)), 'x'.repeat(100))
  })
  it('karakter kontrol, ganda, atau bukan string = kosong', () => {
    for (const input of ['a\u0000b', 'a\nb', ['ab', 'cd'], null, undefined, 5, {}]) assert.equal(searchInputValue(input), '')
  })
  it('hanya spasi = kosong', () => {
    assert.equal(searchInputValue('    '), '')
  })
})

describe('SR3 searchTerms dan searchScore', () => {
  it('kata dipecah pada spasi, huruf kecil, tanpa duplikat (urutan kemunculan)', () => {
    assert.deepEqual(searchTerms('Transformasi  DIGITAL transformasi'), ['transformasi', 'digital'])
  })
  it('q tidak valid = tanpa kata', () => {
    assert.deepEqual(searchTerms(''), [])
    assert.deepEqual(searchTerms('a'), [])
    assert.deepEqual(searchTerms('a\nb'), [])
  })
  it('semua kata harus muncul (di judul atau ringkasan)', () => {
    assert.equal(searchScore(['pemkab', 'digital'], 'Pemkab Sumedang Dorong Transformasi Digital', ''), 2)
    assert.equal(searchScore(['pemkab', 'otomotif'], 'Pemkab Sumedang Dorong Transformasi Digital', ''), null)
  })
  it('kata boleh terbagi: sebagian di judul, sebagian di ringkasan; nilai = jumlah kata di judul', () => {
    assert.equal(searchScore(['pemkab', 'infrastruktur'], 'Pemkab Sumedang Bangun Jalan', 'Program infrastruktur desa.'), 1)
    assert.equal(searchScore(['infrastruktur', 'desa'], 'Pemkab Sumedang Bangun Jalan', 'Program infrastruktur desa.'), 0)
  })
  it('tanpa membedakan huruf besar/kecil', () => {
    assert.equal(searchScore(['sumedang'], 'PEMKAB SUMEDANG', ''), 1)
    assert.equal(searchScore(['sumedang'], 'pemkab', 'Ringkasan SUMEDANG'), 0)
  })
  it('potongan kata cocok (awalan saat mengetik)', () => {
    assert.equal(searchScore(['sumed'], 'Pemkab Sumedang', ''), 1)
  })
  it('tanpa kata = tidak pernah cocok', () => {
    assert.equal(searchScore([], 'apa pun', 'apa pun'), null)
  })
  it('tanda baca dan simbol dicocokkan sebagai teks biasa (bukan pola)', () => {
    assert.equal(searchScore(['.*'], 'Pemkab Sumedang', ''), null)
    assert.equal(searchScore(['(a'], 'Pemkab (a) Sumedang', ''), 1)
    assert.equal(searchScore(['<script>'], 'Judul <script>', ''), 1)
  })
})

describe('SR4 compareSearchHits (urutan)', () => {
  const hit = (score: number, publishedAt: string, id: number) => ({ score, publishedAt, id })
  it('jumlah kata di judul terbanyak dulu', () => {
    assert.ok(compareSearchHits(hit(2, '2026-01-01T00:00:00Z', 1), hit(1, '2026-12-01T00:00:00Z', 2)) < 0)
  })
  it('nilai sama: terbaru dulu', () => {
    assert.ok(compareSearchHits(hit(1, '2026-02-01T00:00:00Z', 1), hit(1, '2026-01-01T00:00:00Z', 2)) < 0)
  })
  it('waktu sama: id terbesar dulu (pasti)', () => {
    assert.ok(compareSearchHits(hit(1, '2026-01-01T00:00:00Z', 9), hit(1, '2026-01-01T00:00:00Z', 2)) < 0)
  })
})

describe('SR5 searchPage (inti searchArticles)', () => {
  let nextId = 1
  const make = (title: string, minutesAgo: number, excerpt = ''): SearchCandidate => ({
    id: nextId++,
    publishedAt: new Date(Date.UTC(2026, 10, 4) - minutesAgo * 60000).toISOString(),
    title,
    excerpt
  })
  const NOW_ITEMS: SearchCandidate[] = [
    make('Pemkab Sumedang Dorong Transformasi Digital', 10),
    make('Berita Daerah Pekan Ini', 5, 'Berita tentang Sumedang di ringkasan.'),
    make('Layanan Digital Sumedang Meluas', 30),
    make('Otomotif Pekan Ini', 1, 'Tidak ada kata cari di sini'),
    make('SUMEDANG Besar-besaran', 60)
  ]
  const titles = (items: SearchCandidate[]) => items.map(item => item.title)

  it('hanya yang memuat semua kata (satu kata: yang memuatnya)', () => {
    const result = searchPage(NOW_ITEMS, 'sumedang', 1, 10)
    assert.ok(result)
    assert.equal(result.pagination.total, 4)
    assert.equal(titles(result.items).includes('Otomotif Pekan Ini'), false)
  })

  it('semua kata: tanpa kata yang tidak ada di mana pun', () => {
    const result = searchPage(NOW_ITEMS, 'sumedang digital', 1, 10)
    assert.ok(result)
    assert.deepEqual(titles(result.items), ['Pemkab Sumedang Dorong Transformasi Digital', 'Layanan Digital Sumedang Meluas'])
    assert.equal(searchPage(NOW_ITEMS, 'sumedang otomotif', 1, 10)?.pagination.total, 0)
  })

  it('urutan: kata di judul di atas, lalu terbaru', () => {
    const result = searchPage(NOW_ITEMS, 'sumedang', 1, 10)
    assert.ok(result)
    // Tiga artikel punya kata di judul (terbaru dulu), lalu yang hanya di ringkasan (meski paling baru).
    assert.deepEqual(titles(result.items), [
      'Pemkab Sumedang Dorong Transformasi Digital',
      'Layanan Digital Sumedang Meluas',
      'SUMEDANG Besar-besaran',
      'Berita Daerah Pekan Ini'
    ])
  })

  it('tanpa membedakan huruf besar/kecil pada kata kunci dan teks', () => {
    assert.equal(searchPage(NOW_ITEMS, 'SUMEDANG', 1, 10)?.pagination.total, 4)
    assert.equal(searchPage(NOW_ITEMS, 'sUmEdAnG', 1, 10)?.pagination.total, 4)
  })

  it('kata kunci dinormalisasi: spasi berlebih dan urutan kata tidak memengaruhi hasil', () => {
    const a = searchPage(NOW_ITEMS, '  digital   sumedang ', 1, 10)
    const b = searchPage(NOW_ITEMS, 'sumedang digital', 1, 10)
    assert.ok(a && b)
    assert.deepEqual(titles(a.items), titles(b.items))
    assert.equal(a.query, 'digital sumedang')
  })

  it('kata ganda tidak mengubah hasil', () => {
    assert.equal(searchPage(NOW_ITEMS, 'sumedang sumedang', 1, 10)?.pagination.total, 4)
  })

  it('tidak ada hasil: halaman 1 tetap ada (kosong, totalPages 0)', () => {
    const result = searchPage(NOW_ITEMS, 'tidakada', 1, 10)
    assert.ok(result)
    assert.deepEqual(result.items, [])
    assert.deepEqual(result.pagination, { page: 1, perPage: 10, total: 0, totalPages: 0 })
    assert.equal(result.query, 'tidakada')
  })

  it('tidak ada hasil: halaman 2 = null (404)', () => {
    assert.equal(searchPage(NOW_ITEMS, 'tidakada', 2, 10), null)
  })

  it('q kosong atau tidak valid: tanpa hasil, query kosong', () => {
    for (const query of ['', ' ', 'a', 'a\nb', 'x'.repeat(101)]) {
      const result = searchPage(NOW_ITEMS, query, 1, 10)
      assert.ok(result)
      assert.equal(result.pagination.total, 0)
      assert.equal(result.query, '')
      assert.equal(searchPage(NOW_ITEMS, query, 2, 10), null)
    }
  })

  it('daftar kandidat kosong: halaman 1 kosong, halaman 2 = null', () => {
    assert.equal(searchPage([], 'sumedang', 1, 10)?.pagination.total, 0)
    assert.equal(searchPage([], 'sumedang', 2, 10), null)
  })

  it('paginasi 10 per halaman: 25 hasil = 3 halaman (10 + 10 + 5), terbaru dulu, tanpa duplikat antar halaman', () => {
    const many = Array.from({ length: 25 }, (_, index) => make(`Berita Sumedang ${index + 1}`, index + 100))
    const pages = [1, 2, 3].map((page) => {
      const result = searchPage(many, 'sumedang', page, SEARCH_PER_PAGE)
      assert.ok(result)
      return result
    })
    assert.deepEqual(pages.map(result => result.items.length), [10, 10, 5])
    assert.deepEqual(pages.map(result => result.pagination), [
      { page: 1, perPage: 10, total: 25, totalPages: 3 },
      { page: 2, perPage: 10, total: 25, totalPages: 3 },
      { page: 3, perPage: 10, total: 25, totalPages: 3 }
    ])
    const ids = pages.flatMap(result => result.items.map(item => item.id))
    assert.equal(new Set(ids).size, 25)
    assert.deepEqual(titles(pages[0]!.items).slice(0, 2), ['Berita Sumedang 1', 'Berita Sumedang 2'])
    assert.equal(searchPage(many, 'sumedang', 4, SEARCH_PER_PAGE), null)
    assert.equal(searchPage(many, 'sumedang', 9999, SEARCH_PER_PAGE), null)
  })

  it('tepat satu halaman penuh (10): halaman 2 = null', () => {
    const ten = Array.from({ length: 10 }, (_, index) => make(`Sumedang ${index}`, index))
    assert.equal(searchPage(ten, 'sumedang', 1, 10)?.pagination.totalPages, 1)
    assert.equal(searchPage(ten, 'sumedang', 2, 10), null)
  })

  it('tidak mengubah masukan', () => {
    const copy = NOW_ITEMS.map(item => ({ ...item }))
    searchPage(NOW_ITEMS, 'sumedang', 1, 10)
    assert.deepEqual(NOW_ITEMS, copy)
  })

  it('kata kunci berbahaya hanya dicocokkan sebagai teks dan tidak melempar', () => {
    for (const query of ['<script>alert(1)</script>', '<img src=x onerror=alert(1)>', '"\'', 'javascript:alert(1)', '../../x', '.*', '(((', '\\']) {
      const result = searchPage(NOW_ITEMS, query, 1, 10)
      assert.ok(result)
      assert.equal(result.pagination.total, 0)
    }
  })
})

describe('SR6 searchPath dan nama rute', () => {
  it('nama rute = cari (app/pages/cari.vue)', () => {
    assert.equal(SEARCH_ROUTE_NAME, 'cari')
  })
  it('halaman 1: /cari?q=...; halaman N > 1: &halaman=N', () => {
    assert.equal(searchPath('sumedang'), '/cari?q=sumedang')
    assert.equal(searchPath('sumedang', 1), '/cari?q=sumedang')
    assert.equal(searchPath('sumedang', 2), '/cari?q=sumedang&halaman=2')
  })
  it('q di-encode penuh: karakter apa pun hanya menjadi nilai q', () => {
    assert.equal(searchPath('a b'), '/cari?q=a%20b')
    assert.equal(searchPath('a&halaman=9#x'), '/cari?q=a%26halaman%3D9%23x')
    const url = new URL(searchPath('<script>"\'&=?#/../'), 'http://x.test')
    assert.equal(url.pathname, '/cari')
    assert.deepEqual([...url.searchParams.keys()], ['q'])
    assert.equal(url.searchParams.get('q'), '<script>"\'&=?#/../')
    assert.equal(url.hash, '')
  })
  it('q kosong = /cari', () => {
    assert.equal(searchPath(''), '/cari')
    assert.equal(searchPath('', 3), '/cari')
  })
})

describe('SR7 penjaga sumber', () => {
  const form = source('app/components/layout/SearchForm.vue')
  const header = source('app/components/layout/SiteHeader.vue')
  const page = source('app/pages/cari.vue')
  const api = source('server/api/search.get.ts')

  it('form: role="search", method GET ke /cari, input type=search name=q maxlength=100, label tersembunyi, tombol kirim "Cari" (berfungsi tanpa JavaScript)', () => {
    assert.match(form, /role="search"/)
    assert.match(form, /method="get"/)
    assert.match(form, /action="\/cari"/)
    assert.match(form, /type="search"/)
    assert.match(form, /name="q"/)
    assert.match(form, /maxlength="100"/)
    assert.match(form, /<label :for="inputId" class="visually-hidden">Cari berita<\/label>/)
    assert.match(form, /<button type="submit" class="submit" aria-label="Cari">/)
    assert.match(form, /placeholder="Cari berita…"/)
  })

  it('form: Esc menutup baris mobile, tombol tutup bernama, tanpa saran otomatis (tanpa @input/watch ke API)', () => {
    assert.match(form, /event\.key !== 'Escape' \|\| !props\.open/)
    assert.match(form, /aria-label="Tutup pencarian"/)
    assert.equal(/@input|\$fetch|useFetch|useAsyncData/.test(form), false)
  })

  it('header: tombol ikon cari dengan aria-expanded dan aria-controls menuju form, tombol tema tidak dirender', () => {
    assert.match(header, /class="search-toggle"/)
    assert.match(header, /:aria-expanded="searchOpen \? 'true' : 'false'"/)
    assert.match(header, /:aria-controls="searchId"/)
    assert.match(header, /aria-label="Cari berita"/)
    assert.equal(/moon|tema-toggle|theme/i.test(stripComments(header)), false)
  })

  it('gaya SearchForm dan cari.vue dari token saja (tanpa warna literal)', () => {
    for (const component of [form, page]) {
      const css = stripComments(component.slice(component.indexOf('<style')))
      assert.equal(/#[0-9a-fA-F]{3,8}\b/.test(css), false)
      assert.equal(/rgba?\(/.test(css), false)
    }
  })

  it('halaman: noindex, kata kunci tidak masuk <title>/meta, tanpa v-html, data hanya lewat /api/search, tanpa fixture/layanan', () => {
    assert.match(page, /robots: 'noindex'/)
    assert.match(page, /title: 'Hasil pencarian - Ini Sumedang'/)
    const head = page.slice(page.indexOf('useSeoMeta'), page.indexOf('useSeoMeta') + 200)
    assert.equal(/query|route/.test(head), false)
    assert.equal(/v-html=/.test(page), false)
    assert.equal(/v-html=/.test(form), false)
    assert.match(page, /\$fetch<SearchResponse>\('\/api\/search'/)
    assert.equal(/fixtures|services\/|server\//.test(stripComments(page.replace(/\/\/.*$/gm, ''))), false)
  })

  it('halaman: kata kunci hanya lewat interpolasi {{ }}; pesan netral dan keadaan kosong dari konfigurasi', () => {
    assert.match(page, /\{\{ shownQuery \}\}/)
    assert.match(page, /SEARCH_INVALID_MESSAGE/)
    assert.match(page, /SEARCH_EMPTY_MESSAGE/)
    assert.match(page, /tag="h1"/)
    assert.match(page, /<CategoryLoadMore\s+:query="shownQuery"/)
  })

  it('API: pesan galat tetap (tanpa mengulang masukan), 404 halaman, 400 q, nosniff, hanya lewat layanan', () => {
    assert.match(api, /statusCode: 404, statusMessage: 'Not Found', message: 'Halaman tidak ditemukan\.'/)
    assert.match(api, /statusCode: 400, statusMessage: 'Bad Request', message: 'Kata kunci tidak valid\.'/)
    assert.match(api, /X-Content-Type-Options', 'nosniff'/)
    assert.match(api, /searchArticles\(query, page, SEARCH_PER_PAGE, now\)/)
    assert.equal(/message:.*(\$\{|\+)/.test(api), false)
    assert.equal(/fixtures/.test(api), false)
  })

  it('LoadMore digeneralisasi: kategori tetap categoryPagePath/api kategori, pencarian searchPath//api/search', () => {
    const component = source('app/components/category/LoadMore.vue')
    assert.match(component, /categoryPagePath\(props\.slug \?\? '', nextPage\.value\)/)
    assert.match(component, /searchPath\(props\.query \?\? '', nextPage\.value\)/)
    assert.match(component, /'\/api\/search', \{ query: \{ q: props\.query, halaman: page \} \}/)
    assert.match(component, /\/api\/category\//)
    assert.equal(/v-html=/.test(component), false)
  })

  it('v-html= tetap tepat satu baris di seluruh app (ArticleBody)', () => {
    assert.equal((source('app/components/article/ArticleBody.vue').match(/v-html=/g) ?? []).length, 1)
    for (const file of ['app/components/layout/SearchForm.vue', 'app/components/layout/SiteHeader.vue', 'app/pages/cari.vue', 'app/components/category/LoadMore.vue']) {
      assert.equal(/v-html=/.test(source(file)), false, file)
    }
  })
})
