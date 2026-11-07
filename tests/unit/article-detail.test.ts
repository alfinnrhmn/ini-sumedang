// Uji unit pembantu Detail Berita: slug, waktu baca, peringkat Berita Terkait, URL bagikan, tanggal terbit, URL.
// Pelari: `node:test` (`npm test`). Impor berekstensi `.ts` (Node 22.23+).
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { countWords, hasVisibleContent, isValidArticleSlug, readingMinutes, stripTags } from '../../server/utils/article-detail.ts'
import { rankRelated, relatedBlocks, splitRelated } from '../../server/utils/related-ranking.ts'
import type { RelatedCandidate } from '../../server/utils/related-ranking.ts'
import { facebookShareUrl, whatsappShareUrl, xShareUrl } from '../../app/utils/share.ts'
import { formatPublishDate } from '../../app/utils/relative-time.ts'
import { articlePath } from '../../app/utils/routes.ts'

describe('AD1 validasi slug', () => {
  const valid = ['a', 'fixture-81', 'edge-xss-dasar', '2026-berita', 'a1-b2-c3', 'x'.repeat(120)]
  for (const slug of valid) {
    it(`valid: ${slug.length > 30 ? `${slug.slice(0, 10)}... (${slug.length})` : slug}`, () => {
      assert.equal(isValidArticleSlug(slug), true)
    })
  }

  const invalid: [string, unknown][] = [
    ['kosong', ''],
    ['huruf besar', 'Fixture-81'],
    ['garis bawah', 'fixture_81'],
    ['tanda hubung di awal', '-fixture'],
    ['tanda hubung di akhir', 'fixture-'],
    ['tanda hubung ganda', 'fixture--81'],
    ['path traversal', '../x'],
    ['path traversal ter-encode', '%2e%2e%2fx'],
    ['garis miring', 'a/b'],
    ['titik', 'a.b'],
    ['spasi', 'a b'],
    ['karakter kontrol', 'abc\u0000def'],
    ['baris baru di akhir', 'abc\n'],
    ['tag HTML', '<script>'],
    ['121 karakter', 'x'.repeat(121)],
    ['300 karakter', 'x'.repeat(300)],
    ['unicode', 'berita-é'],
    ['undefined', undefined],
    ['array', ['a']],
    ['angka', 5],
    ['null', null]
  ]
  for (const [name, value] of invalid) {
    it(`tidak valid: ${name}`, () => {
      assert.equal(isValidArticleSlug(value), false)
    })
  }
})

describe('AD2 waktu baca dan teks', () => {
  const words = (count: number) => Array.from({ length: count }, () => 'kata').join(' ')

  it('hitung kata mengabaikan tag dan tidak menyatukan kata antar tag', () => {
    assert.equal(countWords('<p>satu</p><p>dua tiga</p>'), 3)
    assert.equal(countWords('<h2>a</h2><p>b</p>'), 2)
  })
  it('kosong = 0 kata dan minimal 1 menit', () => {
    assert.equal(countWords(''), 0)
    assert.equal(countWords('<img src="/a.jpg"><iframe></iframe>'), 0)
    assert.equal(readingMinutes(''), 1)
  })
  it('1 kata = 1 menit; 200 kata = 1 menit; 201 kata = 2 menit', () => {
    assert.equal(readingMinutes(`<p>${words(1)}</p>`), 1)
    assert.equal(readingMinutes(`<p>${words(200)}</p>`), 1)
    assert.equal(readingMinutes(`<p>${words(201)}</p>`), 2)
  })
  it('1000 kata = 5 menit', () => {
    assert.equal(readingMinutes(`<p>${words(1000)}</p>`), 5)
  })
  it('stripTags membuang tag dan merapikan spasi', () => {
    assert.equal(stripTags('<p>Foto:  IniSumedang</p>\n'), 'Foto: IniSumedang')
    assert.equal(stripTags('tanpa tag'), 'tanpa tag')
    assert.equal(stripTags(''), '')
  })
})

describe('AD2b isi terlihat (L-1: isi hanya spasi dianggap kosong)', () => {
  const cp = (...codes: number[]) => String.fromCodePoint(...codes)
  const empty: [string, string][] = [
    ['string kosong', ''],
    ['hanya spasi dan baris baru', '  \n\t \r\n '],
    ['paragraf berisi spasi', '<p> </p>'],
    ['beberapa paragraf kosong', '  <p> </p>\n<p></p>\n<p>  </p>  '],
    ['&nbsp; dan variasinya', '<p>&nbsp;</p><p>&#160;</p><p>&#xA0;</p><p>&#x00a0;</p><p>&NBSP;</p>'],
    ['karakter NBSP literal', `<p>${cp(0xA0, 0xA0)}</p>`],
    ['karakter lebar nol', `<p>${cp(0x200B, 0x200C, 0x200D, 0x2060, 0xFEFF)}</p>`],
    ['hanya br dan hr', '<p><br></p><hr><br>'],
    ['tabel dan daftar kosong', '<table><tbody><tr><td> </td></tr></tbody></table><ul><li></li></ul>'],
    ['tautan tanpa teks', '<a href="https://example.com/"> </a>']
  ]
  for (const [name, html] of empty) {
    it(`kosong: ${name}`, () => {
      assert.equal(hasVisibleContent(html), false)
    })
  }

  const filled: [string, string][] = [
    ['satu huruf', '<p>a</p>'],
    ['teks di antara spasi', '  <p> &nbsp; isi &nbsp; </p> '],
    ['gambar tanpa teks', '<figure><img src="/fixtures/figma-1.jpg" alt="" width="716" height="400"></figure>'],
    ['embed tanpa teks', '<iframe src="https://www.youtube-nocookie.com/embed/M7lc1UVf-VE"></iframe>'],
    ['tag huruf besar', '<IMG src="/a.jpg">'],
    ['angka', '<p>0</p>']
  ]
  for (const [name, html] of filled) {
    it(`berisi: ${name}`, () => {
      assert.equal(hasVisibleContent(html), true)
    })
  }
})

const candidate = (id: number, minutesAgo: number, categoryIds: number[], tagIds: number[]): RelatedCandidate => ({
  id,
  publishedAt: new Date(Date.UTC(2026, 10, 2, 12, 0, 0) - minutesAgo * 60000).toISOString(),
  categoryIds,
  tagIds
})

describe('AD3 peringkat Berita Terkait', () => {
  const current = candidate(1, 0, [10], [100, 200])

  it('urutan: tag (jumlah sama dulu, lalu terbaru) -> kategori sama -> terbaru', () => {
    const pool = [
      current,
      candidate(2, 50, [99], [100]), // 1 tag sama
      candidate(3, 60, [99], [100, 200]), // 2 tag sama (lebih lama dari id 2, tetap di atas)
      candidate(4, 10, [99], [300]), // tanpa tag sama, kategori beda
      candidate(5, 70, [10], []), // kategori sama
      candidate(6, 20, [10], [300]), // kategori sama (lebih baru dari id 5)
      candidate(7, 40, [99], [100]) // 1 tag sama, lebih baru dari id 2? id 7 (40 menit) lebih baru dari id 2 (50)
    ]
    assert.deepEqual(rankRelated(current, pool), [3, 7, 2, 6, 5, 4])
  })

  it('tanpa artikel yang dibaca dan tanpa duplikat id', () => {
    const pool = [current, candidate(2, 5, [10], []), candidate(2, 5, [10], []), candidate(3, 6, [10], [])]
    const ranked = rankRelated(current, pool)
    assert.deepEqual(ranked, [2, 3])
    assert.equal(ranked.includes(1), false)
  })

  it('lintas kategori diperbolehkan (tag sama, kategori beda)', () => {
    const ranked = rankRelated(current, [candidate(2, 5, [77], [200])])
    assert.deepEqual(ranked, [2])
  })

  it('tanpa tag dan tanpa kategori sama: lengkapi terbaru', () => {
    const bare = candidate(1, 0, [], [])
    const ranked = rankRelated(bare, [candidate(2, 30, [5], [1]), candidate(3, 10, [6], [2]), candidate(4, 20, [], [])])
    assert.deepEqual(ranked, [3, 4, 2])
  })

  it('seri tanggal: id terbesar dulu (deterministik)', () => {
    const same = [candidate(2, 5, [10], []), candidate(3, 5, [10], [])]
    assert.deepEqual(rankRelated(current, same), [3, 2])
  })

  it('kandidat kosong = daftar kosong', () => {
    assert.deepEqual(rankRelated(current, []), [])
    assert.deepEqual(rankRelated(current, [current]), [])
  })

  it('tidak mengubah masukan', () => {
    const pool = [current, candidate(2, 50, [99], [100]), candidate(3, 60, [99], [100, 200])]
    const copy = JSON.stringify(pool)
    rankRelated(current, pool)
    assert.equal(JSON.stringify(pool), copy)
  })
})

describe('AD4 sidebar dan blok bawah tanpa duplikat', () => {
  const ranked = [1, 2, 3, 4, 5, 6, 7, 8, 9]

  it('sidebar 4 teratas, bawah 3 berikutnya', () => {
    assert.deepEqual(splitRelated(ranked, 4, 3), { sidebar: [1, 2, 3, 4], bottom: [5, 6, 7] })
  })
  it('artikel sedikit: sidebar terisi dulu, bawah sisanya (boleh kosong)', () => {
    assert.deepEqual(splitRelated([1, 2, 3], 4, 3), { sidebar: [1, 2, 3], bottom: [] })
    assert.deepEqual(splitRelated([1, 2, 3, 4, 5], 4, 3), { sidebar: [1, 2, 3, 4], bottom: [5] })
    assert.deepEqual(splitRelated([], 4, 3), { sidebar: [], bottom: [] })
  })
  it('tidak ada id yang sama di kedua blok', () => {
    const { sidebar, bottom } = splitRelated(ranked, 4, 3)
    assert.equal(new Set([...sidebar, ...bottom]).size, sidebar.length + bottom.length)
  })
})

describe('AD4b irisan per viewport (Keputusan PM M-1)', () => {
  const ranked = [1, 2, 3, 4, 5, 6, 7, 8, 9]

  it('>= 1024: sidebar peringkat 1-4, bawah 5-7; < 1024: bawah peringkat 1-3', () => {
    assert.deepEqual(relatedBlocks(ranked, 4, 3, 3), { sidebar: [1, 2, 3, 4], bottom: [5, 6, 7], bottomMobile: [1, 2, 3] })
  })
  it('4 berita paling relevan selalu tampil di setiap viewport', () => {
    const { sidebar, bottomMobile } = relatedBlocks(ranked, 4, 3, 3)
    for (const id of [1, 2, 3]) assert.ok(sidebar.includes(id) && bottomMobile.includes(id))
    assert.ok(sidebar.includes(4))
  })
  it('tanpa duplikat dalam satu viewport: sidebar tidak beririsan dengan bawah desktop', () => {
    const { sidebar, bottom, bottomMobile } = relatedBlocks(ranked, 4, 3, 3)
    assert.equal(new Set([...sidebar, ...bottom]).size, sidebar.length + bottom.length)
    assert.equal(new Set(bottomMobile).size, bottomMobile.length)
  })
  it('kosong di tiap viewport: 0 terkait; 1-3 terkait hanya bawah mobile dan sidebar; bawah desktop baru ada bila >= 5', () => {
    assert.deepEqual(relatedBlocks([], 4, 3, 3), { sidebar: [], bottom: [], bottomMobile: [] })
    assert.deepEqual(relatedBlocks([1], 4, 3, 3), { sidebar: [1], bottom: [], bottomMobile: [1] })
    assert.deepEqual(relatedBlocks([1, 2, 3, 4], 4, 3, 3), { sidebar: [1, 2, 3, 4], bottom: [], bottomMobile: [1, 2, 3] })
    assert.deepEqual(relatedBlocks([1, 2, 3, 4, 5], 4, 3, 3), { sidebar: [1, 2, 3, 4], bottom: [5], bottomMobile: [1, 2, 3] })
  })
  it('bagian sidebar dan bottom sama dengan splitRelated; tidak mengubah masukan', () => {
    const copy = [...ranked]
    const blocks = relatedBlocks(ranked, 4, 3, 3)
    const split = splitRelated(ranked, 4, 3)
    assert.deepEqual({ sidebar: blocks.sidebar, bottom: blocks.bottom }, split)
    assert.deepEqual(ranked, copy)
  })
})

describe('AD5 URL bagikan', () => {
  const url = 'https://inisumedang.example/berita/fixture-81'

  it('Facebook: sharer resmi, u ter-encode', () => {
    assert.equal(
      facebookShareUrl(url),
      'https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Finisumedang.example%2Fberita%2Ffixture-81'
    )
  })
  it('X: intent/post, url dan text ter-encode', () => {
    assert.equal(
      xShareUrl(url, 'Pemkab & "Layanan" Publik?'),
      'https://x.com/intent/post?url=https%3A%2F%2Finisumedang.example%2Fberita%2Ffixture-81&text=Pemkab%20%26%20%22Layanan%22%20Publik%3F'
    )
  })
  it('WhatsApp (D33): wa.me/?text=<judul> <URL kanonis>, satu parameter text ter-encode', () => {
    assert.equal(
      whatsappShareUrl(url, 'Pemkab & "Layanan" Publik?'),
      'https://wa.me/?text=Pemkab%20%26%20%22Layanan%22%20Publik%3F%20https%3A%2F%2Finisumedang.example%2Fberita%2Ffixture-81'
    )
    const parsed = new URL(whatsappShareUrl('https://a.example/x?y=1&z=2#f', 'a&text=evil'))
    assert.equal(parsed.origin, 'https://wa.me')
    assert.deepEqual([...parsed.searchParams.keys()], ['text'])
    assert.equal(parsed.searchParams.get('text'), 'a&text=evil https://a.example/x?y=1&z=2#f')
  })
  it('semua https; parameter tidak dapat menyisipkan parameter lain', () => {
    const hostile = 'https://a.example/x?y=1&z=2#f'
    const facebook = new URL(facebookShareUrl(hostile))
    assert.equal(facebook.protocol, 'https:')
    assert.deepEqual([...facebook.searchParams.keys()], ['u'])
    assert.equal(facebook.searchParams.get('u'), hostile)
    const x = new URL(xShareUrl(hostile, 'a&url=https://evil.example'))
    assert.equal(x.protocol, 'https:')
    assert.deepEqual([...x.searchParams.keys()], ['url', 'text'])
    assert.equal(x.searchParams.get('url'), hostile)
    assert.equal(x.searchParams.get('text'), 'a&url=https://evil.example')
  })
})

describe('AD6 tanggal terbit dan URL artikel', () => {
  it('format Indonesia singkat, zona WIB', () => {
    assert.equal(formatPublishDate('2026-11-02T05:00:00.000Z'), '2 Nov 2026')
    assert.equal(formatPublishDate('2026-12-31T20:00:00.000Z'), '1 Jan 2027') // 03.00 WIB hari berikutnya
    assert.equal(formatPublishDate('2026-05-09T00:00:00.000Z'), '9 Mei 2026')
  })
  it('articlePath = /berita/<slug> dan meng-encode karakter tak terduga', () => {
    assert.equal(articlePath({ slug: 'fixture-81' }), '/berita/fixture-81')
    assert.equal(articlePath({ slug: 'a/b?c' }), '/berita/a%2Fb%3Fc')
  })
})
