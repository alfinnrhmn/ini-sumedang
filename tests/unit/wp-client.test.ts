/**
 * Uji unit API-001 (klien baca WordPress): validasi base URL, penggabungan halaman, retry, cache/stale/single-flight,
 * dan pemetaan data WordPress -> artikel. Murni (tanpa jaringan). Pelari: `node:test` (`npm test`).
 */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  WP_UNAVAILABLE_MESSAGE, WpUnavailableError, collectPages, createCachedLoader, parseTotalPages, validWpBaseUrl, withRetry
} from '../../server/utils/wp-client.ts'
import { excerptText, mapPost, normalizeWpPost, normalizeWpPosts, normalizeWpTerms, pickWordPressCategories, publishedAtOf, wpImageHosts } from '../../server/utils/wp-map.ts'
import { WP_CACHE_TTL_MS } from '../../app/config/wp.ts'

describe('WP1 validasi base URL', () => {
  const valid: [string, string][] = [
    ['https://ini-sumedang.local', 'https://ini-sumedang.local'],
    ['https://cms.example.com/', 'https://cms.example.com'],
    ['  HTTPS://CMS.Example.COM  ', 'https://cms.example.com'],
    ['https://cms.example.com:8443', 'https://cms.example.com:8443'],
    ['http://localhost', 'http://localhost'],
    ['http://localhost:10010/', 'http://localhost:10010'],
    ['http://127.0.0.1:8080', 'http://127.0.0.1:8080']
  ]
  for (const [input, expected] of valid) {
    it(`valid: ${JSON.stringify(input)}`, () => assert.equal(validWpBaseUrl(input), expected))
  }

  const invalid: [string, unknown][] = [
    ['undefined', undefined],
    ['null', null],
    ['angka', 3000],
    ['kosong', ''],
    ['spasi', '   '],
    ['http non-lokal', 'http://cms.example.com'],
    ['http host lokal lain', 'http://192.168.1.5'],
    ['http localhost.evil', 'http://localhost.evil.com'],
    ['skema lain', 'ftp://cms.example.com'],
    ['javascript', 'javascript:alert(1)'],
    ['tanpa skema', 'cms.example.com'],
    ['dengan path', 'https://cms.example.com/wp'],
    ['dengan query', 'https://cms.example.com/?a=1'],
    ['dengan hash', 'https://cms.example.com/#x'],
    ['userinfo', 'https://user:pass@cms.example.com'],
    ['userinfo tanpa sandi', 'https://evil.com@cms.example.com'],
    ['spasi di dalam', 'https://cms .example.com'],
    ['garis miring terbalik', 'https://cms.example.com\\@evil.com'],
    ['port nol', 'https://cms.example.com:0'],
    ['port terlalu besar', 'https://cms.example.com:70000'],
    ['port bukan angka', 'https://cms.example.com:abc'],
    ['IPv6', 'https://[::1]'],
    ['terlalu panjang', `https://${'a'.repeat(300)}.com`]
  ]
  for (const [name, input] of invalid) {
    it(`tidak valid: ${name}`, () => assert.equal(validWpBaseUrl(input), null))
  }
})

describe('WP2 penggabungan halaman', () => {
  const pages = (count: number, total: number) => async (page: number) => {
    if (page > count) throw new Error('halaman di luar batas diminta')
    return { items: [`p${page}a`, `p${page}b`], totalPages: total }
  }

  it('satu halaman', async () => {
    assert.deepEqual(await collectPages(pages(1, 1), 10), ['p1a', 'p1b'])
  })

  it('beberapa halaman digabung berurutan', async () => {
    assert.deepEqual(await collectPages(pages(3, 3), 10), ['p1a', 'p1b', 'p2a', 'p2b', 'p3a', 'p3b'])
  })

  it('dibatasi maxPages', async () => {
    const result = await collectPages(pages(10, 30), 2)
    assert.deepEqual(result, ['p1a', 'p1b', 'p2a', 'p2b'])
  })

  it('totalPages tidak valid = hanya halaman 1', async () => {
    for (const total of [0, -3, Number.NaN, 2.5]) {
      assert.deepEqual(await collectPages(pages(1, total), 10), ['p1a', 'p1b'])
    }
  })

  it('satu halaman gagal = seluruhnya gagal', async () => {
    const fetchPage = async (page: number) => {
      if (page === 2) throw new WpUnavailableError('timeout', true)
      return { items: [page], totalPages: 3 }
    }
    await assert.rejects(collectPages(fetchPage, 10), WpUnavailableError)
  })

  it('parseTotalPages: header hilang/rusak = 1', () => {
    assert.equal(parseTotalPages('3'), 3)
    assert.equal(parseTotalPages('1'), 1)
    for (const header of [null, '', '0', '-1', 'abc', '2.5']) assert.equal(parseTotalPages(header), 1)
  })
})

describe('WP3 retry', () => {
  it('gagal sementara yang bisa diulang berhasil pada percobaan ulang', async () => {
    let calls = 0
    const result = await withRetry(async () => {
      calls++
      if (calls === 1) throw new WpUnavailableError('timeout', true)
      return 'ok'
    }, 1)
    assert.equal(result, 'ok')
    assert.equal(calls, 2)
  })

  it('hanya 1 retry: dua kegagalan = gagal setelah 2 percobaan', async () => {
    let calls = 0
    await assert.rejects(withRetry(async () => {
      calls++
      throw new WpUnavailableError('http-500', true)
    }, 1), WpUnavailableError)
    assert.equal(calls, 2)
  })

  it('galat yang tidak bisa diulang (4xx, JSON rusak) tidak diulang', async () => {
    let calls = 0
    await assert.rejects(withRetry(async () => {
      calls++
      throw new WpUnavailableError('json', false)
    }, 1), WpUnavailableError)
    assert.equal(calls, 1)
  })

  it('galat lain (bug) tidak diulang', async () => {
    let calls = 0
    await assert.rejects(withRetry(async () => {
      calls++
      throw new TypeError('x')
    }, 1), TypeError)
    assert.equal(calls, 1)
  })

  it('WpUnavailableError hanya membawa pesan tetap dan kode alasan', () => {
    const error = new WpUnavailableError('http-500', true)
    assert.equal(error.message, 'Sumber data tidak tersedia.')
    assert.equal(error.message, WP_UNAVAILABLE_MESSAGE)
    assert.equal(error.reason, 'http-500')
  })
})

describe('WP4 cache, stale, single-flight', () => {
  function setup(results: (call: number) => Promise<string>) {
    let now = 1_000
    let calls = 0
    const load = createCachedLoader(() => results(++calls), { ttlMs: 60_000, backoffMs: 10_000, clock: () => now })
    return { load, calls: () => calls, advance: (ms: number) => { now += ms } }
  }

  it('TTL cache = 60 detik (konstanta)', () => {
    assert.equal(WP_CACHE_TTL_MS, 60_000)
  })

  it('dalam TTL: satu pemuatan; setelah TTL: pemuatan baru', async () => {
    const t = setup(async call => `v${call}`)
    assert.equal(await t.load(), 'v1')
    t.advance(59_999)
    assert.equal(await t.load(), 'v1')
    assert.equal(t.calls(), 1)
    t.advance(1)
    assert.equal(await t.load(), 'v2')
    assert.equal(t.calls(), 2)
  })

  it('permintaan bersamaan digabung (single-flight)', async () => {
    let release: (value: string) => void = () => {}
    const t = setup(() => new Promise<string>((resolve) => { release = resolve }))
    const all = Promise.all([t.load(), t.load(), t.load(), t.load(), t.load()])
    assert.equal(t.calls(), 1)
    release('data')
    assert.deepEqual(await all, ['data', 'data', 'data', 'data', 'data'])
    assert.equal(t.calls(), 1)
  })

  it('gagal dan cache lama ada: cache lama dipakai', async () => {
    const t = setup(async (call) => {
      if (call === 1) return 'lama'
      throw new WpUnavailableError('timeout', true)
    })
    assert.equal(await t.load(), 'lama')
    t.advance(61_000)
    assert.equal(await t.load(), 'lama')
    assert.equal(t.calls(), 2)
  })

  it('setelah gagal ada jeda: WordPress tidak dihubungi lagi sebelum backoff selesai', async () => {
    const t = setup(async (call) => {
      if (call === 1) return 'lama'
      throw new WpUnavailableError('timeout', true)
    })
    await t.load()
    t.advance(61_000)
    await t.load() // gagal, cache lama
    t.advance(9_999)
    assert.equal(await t.load(), 'lama')
    assert.equal(t.calls(), 2)
    t.advance(1)
    assert.equal(await t.load(), 'lama') // percobaan ulang gagal lagi, tetap cache lama
    assert.equal(t.calls(), 3)
  })

  it('pulih: setelah backoff dan WordPress hidup lagi, nilai baru dipakai', async () => {
    const t = setup(async (call) => {
      if (call === 2) throw new WpUnavailableError('http-500', true)
      return `v${call}`
    })
    assert.equal(await t.load(), 'v1')
    t.advance(61_000)
    assert.equal(await t.load(), 'v1')
    t.advance(10_000)
    assert.equal(await t.load(), 'v3')
  })

  it('gagal tanpa cache: galat dilempar (dan segera pada jeda backoff, tanpa menghubungi WordPress)', async () => {
    const t = setup(async () => { throw new WpUnavailableError('timeout', true) })
    await assert.rejects(t.load(), WpUnavailableError)
    await assert.rejects(t.load(), WpUnavailableError)
    assert.equal(t.calls(), 1)
    t.advance(10_000)
    await assert.rejects(t.load(), WpUnavailableError)
    assert.equal(t.calls(), 2)
  })

  it('pemuat sinkron-melempar tidak menjebak single-flight', async () => {
    let now = 0
    let calls = 0
    const load = createCachedLoader<string>(() => {
      calls++
      if (calls === 1) throw new Error('langsung')
      return Promise.resolve('ok')
    }, { ttlMs: 1000, backoffMs: 10, clock: () => now })
    await assert.rejects(load())
    now += 10
    assert.equal(await load(), 'ok')
  })
})

/** Item `posts?_embed` ala WordPress. */
function rawPost(over: Record<string, unknown> = {}, embedded: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id: 7,
    slug: 'judul-artikel',
    status: 'publish',
    date_gmt: '2026-11-05T03:04:05',
    title: { rendered: 'Judul &#8211; Artikel' },
    content: { rendered: '<p>Isi</p>' },
    excerpt: { rendered: '<p>Ringkasan &amp; <b>tebal</b> &hellip;</p>\n' },
    _embedded: {
      'author': [{ id: 1, name: 'admin_wp', slug: 'admin_wp' }],
      'wp:featuredmedia': [{
        source_url: 'https://cms.example.com/wp-content/uploads/a.jpg',
        alt_text: '',
        caption: { rendered: '<p>Foto: Redaksi &amp; Rekan</p>' },
        media_details: { width: 1200, height: 800 }
      }],
      'wp:term': [
        [{ id: 3, slug: 'nasional', name: 'Nasional', taxonomy: 'category' }],
        [{ id: 31, slug: 'terpopuler', name: 'Terpopuler', taxonomy: 'post_tag' }]
      ],
      ...embedded
    },
    ...over
  }
}

const HOSTS = ['cms.example.com']

describe('WP5 pemetaan artikel', () => {
  it('data normal terpetakan ke Article', () => {
    const post = normalizeWpPost(rawPost())
    assert.ok(post)
    const article = mapPost(post, HOSTS)
    assert.equal(article.id, 7)
    assert.equal(article.slug, 'judul-artikel')
    assert.equal(article.title, 'Judul – Artikel')
    assert.deepEqual(article.categories, [{ id: 3, slug: 'nasional', name: 'Nasional' }])
    assert.deepEqual(article.heroImage, { url: 'https://cms.example.com/wp-content/uploads/a.jpg', alt: 'Judul – Artikel', width: 1200, height: 800 })
  })

  it('authorLabel selalu IniSumedang (nama pengguna WordPress tidak dibawa)', () => {
    const post = normalizeWpPost(rawPost())
    assert.ok(post)
    assert.equal(post._embedded.author, undefined)
    assert.equal(mapPost(post, HOSTS).authorLabel, 'IniSumedang')
    assert.ok(!JSON.stringify(mapPost(post, HOSTS)).includes('admin_wp'))
  })

  it('alt_text terisi dipakai; kosong = judul', () => {
    const withAlt = normalizeWpPost(rawPost({}, {
      'wp:featuredmedia': [{ source_url: 'https://cms.example.com/a.jpg', alt_text: ' Foto balai kota ', media_details: { width: 10, height: 5 } }]
    }))
    assert.ok(withAlt)
    assert.equal(mapPost(withAlt, HOSTS).heroImage?.alt, 'Foto balai kota')
    const noAlt = normalizeWpPost(rawPost())
    assert.ok(noAlt)
    assert.equal(mapPost(noAlt, HOSTS).heroImage?.alt, 'Judul – Artikel')
  })

  it('tanggal date_gmt diberi Z (UTC); yang sudah ber-Z tidak digandakan', () => {
    const post = normalizeWpPost(rawPost())
    assert.ok(post)
    assert.equal(mapPost(post, HOSTS).publishedAt, '2026-11-05T03:04:05Z')
    assert.equal(publishedAtOf({ date_gmt: '2026-11-05T03:04:05Z' }), '2026-11-05T03:04:05Z')
  })

  it('ringkasan: tanpa tag, entitas didekode, dan tidak pernah menjadi HTML', () => {
    assert.equal(excerptText('<p>Ringkasan &amp; <b>tebal</b> &hellip;</p>\n'), 'Ringkasan & tebal …')
    assert.equal(excerptText('<p>a</p><script>alert(1)</script>'), 'aalert(1)')
    assert.equal(excerptText(''), '')
  })

  it('kredit foto dari caption media disimpan sebagai rendered mentah (dijadikan teks polos di layanan)', () => {
    const post = normalizeWpPost(rawPost())
    assert.ok(post)
    assert.equal(excerptText(post._embedded['wp:featuredmedia']?.[0]?.caption?.rendered ?? ''), 'Foto: Redaksi & Rekan')
  })

  it('content dan excerpt selalu string (tidak jatuh ke isi bawaan fixture)', () => {
    const post = normalizeWpPost(rawPost({ content: undefined, excerpt: null }))
    assert.ok(post)
    assert.equal(post.content?.rendered, '')
    assert.equal(post.excerpt?.rendered, '')
  })

  describe('gambar tak aman = tanpa gambar', () => {
    const unsafe: [string, string][] = [
      ['javascript:', 'javascript:alert(1)'],
      ['data:', 'data:image/png;base64,AAAA'],
      ['http (bukan https)', 'http://cms.example.com/a.jpg'],
      ['host lain', 'https://evil.example/a.jpg'],
      ['subdomain host lain', 'https://cms.example.com.evil.example/a.jpg'],
      ['userinfo', 'https://cms.example.com@evil.example/a.jpg'],
      ['userinfo dengan host benar', 'https://user@cms.example.com/a.jpg'],
      ['protokol-relatif', '//evil.example/a.jpg'],
      ['port', 'https://cms.example.com:8443/a.jpg'],
      ['spasi', 'https://cms.example.com/a b.jpg'],
      ['garis miring terbalik', 'https://cms.example.com\\@evil.example/a.jpg'],
      ['kosong', '']
    ]
    for (const [name, url] of unsafe) {
      it(name, () => {
        const post = normalizeWpPost(rawPost({}, {
          'wp:featuredmedia': [{ source_url: url, alt_text: 'x', media_details: { width: 10, height: 5 } }]
        }))
        assert.ok(post)
        assert.equal(mapPost(post, HOSTS).heroImage, null)
      })
    }

    it('tanpa host tambahan (fixture) gambar absolut ditolak, relatif lolos', () => {
      const absolute = normalizeWpPost(rawPost())
      assert.ok(absolute)
      assert.equal(mapPost(absolute).heroImage, null)
      const relative = normalizeWpPost(rawPost({}, {
        'wp:featuredmedia': [{ source_url: '/fixtures/a.jpg', alt_text: 'x', media_details: { width: 10, height: 5 } }]
      }))
      assert.ok(relative)
      assert.equal(mapPost(relative).heroImage?.url, '/fixtures/a.jpg')
    })

    it('ukuran gambar tidak valid = tanpa gambar', () => {
      for (const details of [{}, { width: 0, height: 5 }, { width: '10', height: 5 }, { width: 10 }, null]) {
        const post = normalizeWpPost(rawPost({}, {
          'wp:featuredmedia': [{ source_url: 'https://cms.example.com/a.jpg', alt_text: 'x', media_details: details }]
        }))
        assert.ok(post)
        assert.equal(mapPost(post, HOSTS).heroImage, null)
      }
    })

    it('media terhapus (objek galat WordPress) dan tanpa media = tanpa gambar', () => {
      const deleted = normalizeWpPost(rawPost({}, { 'wp:featuredmedia': [{ code: 'rest_post_invalid_id', message: 'x', data: { status: 404 } }] }))
      assert.ok(deleted)
      assert.equal(mapPost(deleted, HOSTS).heroImage, null)
      const none = normalizeWpPost(rawPost({}, { 'wp:featuredmedia': undefined }))
      assert.ok(none)
      assert.equal(mapPost(none, HOSTS).heroImage, null)
    })
  })

  it('wpImageHosts: hanya https tanpa port', () => {
    assert.deepEqual(wpImageHosts('https://cms.example.com'), ['cms.example.com'])
    assert.deepEqual(wpImageHosts('https://cms.example.com:8443'), [])
    assert.deepEqual(wpImageHosts('http://localhost:10010'), [])
    assert.deepEqual(wpImageHosts('bukan url'), [])
  })

  describe('konten berbahaya', () => {
    it('judul ber-HTML: tag dibuang, entitas tetap teks (tidak menjadi tag)', () => {
      const post = normalizeWpPost(rawPost({ title: { rendered: 'Halo <img src=x onerror=alert(1)> <b>Dunia</b>' } }))
      assert.ok(post)
      assert.equal(mapPost(post, HOSTS).title, 'Halo Dunia')
      const escaped = normalizeWpPost(rawPost({ title: { rendered: '&lt;script&gt;alert(1)&lt;/script&gt;' } }))
      assert.ok(escaped)
      // Entitas hanya didekode menjadi teks; dirender sebagai teks oleh Vue ({{ }}), tidak pernah lewat v-html.
      assert.equal(mapPost(escaped, HOSTS).title, '<script>alert(1)</script>')
    })

    it('judul yang hanya berisi tag = post dibuang', () => {
      assert.equal(normalizeWpPost(rawPost({ title: { rendered: '<img src=x onerror=alert(1)>' } })), null)
    })
  })
})

describe('WP6 normalisasi data mentah', () => {
  it('bukan post yang layak = null', () => {
    const bad: [string, unknown][] = [
      ['null', null],
      ['string', 'x'],
      ['array', []],
      ['id nol', rawPost({ id: 0 })],
      ['id string', rawPost({ id: '7' })],
      ['id desimal', rawPost({ id: 1.5 })],
      ['slug kosong', rawPost({ slug: '' })],
      ['slug berhuruf besar', rawPost({ slug: 'Judul' })],
      ['slug ter-encode', rawPost({ slug: '%e2%80%9c' })],
      ['slug path traversal', rawPost({ slug: '../x' })],
      ['tanpa status', rawPost({ status: undefined })],
      ['tanggal rusak', rawPost({ date_gmt: 'kemarin' })],
      ['tanggal nol WordPress', rawPost({ date_gmt: '0000-00-00T00:00:00' })],
      ['tanpa judul', rawPost({ title: undefined })],
      ['judul bukan string', rawPost({ title: { rendered: 5 } })]
    ]
    for (const [name, raw] of bad) assert.equal(normalizeWpPost(raw), null, name)
  })

  it('status dipertahankan apa adanya (penyaringan publish di layanan)', () => {
    const draft = normalizeWpPost(rawPost({ status: 'draft' }))
    assert.equal(draft?.status, 'draft')
  })

  it('kategori dan tag dipilih lewat taxonomy, bukan urutan; term tak valid dibuang', () => {
    const post = normalizeWpPost(rawPost({}, {
      'wp:term': [
        [{ id: 31, slug: 'terpopuler', name: 'T', taxonomy: 'post_tag' }],
        [{ id: 3, slug: 'nasional', name: 'Nasional', taxonomy: 'category' }, { id: 'x', slug: 'rusak', name: 'R', taxonomy: 'category' }, null, 'x'],
        [{ id: 9, slug: 'lain', name: 'Lain', taxonomy: 'kustom' }]
      ]
    }))
    assert.ok(post)
    assert.deepEqual(post._embedded['wp:term'], [
      [{ id: 3, slug: 'nasional', name: 'Nasional' }],
      [{ id: 31, slug: 'terpopuler', name: 'T' }]
    ])
  })

  it('nama kategori dan tag tanpa tag HTML; nama yang hanya berisi tag = term dibuang', () => {
    const post = normalizeWpPost(rawPost({}, {
      'wp:term': [
        [{ id: 2, slug: 'berita', name: '<img src=x onerror=alert(1)>Berita', taxonomy: 'category' }, { id: 3, slug: 'kosong', name: '<b></b>', taxonomy: 'category' }],
        [{ id: 31, slug: 'terpopuler', name: '<script>x</script>Pop', taxonomy: 'post_tag' }]
      ]
    }))
    assert.ok(post)
    assert.deepEqual(post._embedded['wp:term'], [[{ id: 2, slug: 'berita', name: 'Berita' }], [{ id: 31, slug: 'terpopuler', name: 'xPop' }]])
    assert.deepEqual(normalizeWpTerms([{ id: 2, slug: 'berita', name: '<i>Berita</i>' }]), [{ id: 2, slug: 'berita', name: 'Berita' }])
  })

  it('tanpa _embedded: tanpa kategori, tag, dan gambar (tidak galat)', () => {
    const post = normalizeWpPost({ ...rawPost(), _embedded: undefined })
    assert.ok(post)
    assert.deepEqual(post._embedded['wp:term'], [[], []])
    assert.equal(mapPost(post, HOSTS).heroImage, null)
    assert.deepEqual(mapPost(post, HOSTS).categories, [])
  })

  it('normalizeWpPosts membuang item rusak dan menerima non-array sebagai kosong', () => {
    assert.equal(normalizeWpPosts([rawPost(), { id: 'x' }, null, rawPost({ id: 8, slug: 'dua' })]).length, 2)
    assert.deepEqual(normalizeWpPosts({ code: 'rest_error' }), [])
    assert.deepEqual(normalizeWpPosts(null), [])
  })

  it('normalizeWpTerms: parent hanya bila > 0; item tak valid dibuang', () => {
    assert.deepEqual(normalizeWpTerms([
      { id: 20, slug: 'ruang-visual', name: 'Ruang Visual', parent: 0, count: 3 },
      { id: 24, slug: 'visual-budaya', name: 'Budaya', parent: 20, count: 1 },
      { id: 'x', slug: 'rusak', name: 'R' },
      { id: 5, slug: '', name: 'Kosong' },
      null
    ]), [
      { id: 20, slug: 'ruang-visual', name: 'Ruang Visual' },
      { id: 24, slug: 'visual-budaya', name: 'Budaya', parent: 20 }
    ])
    assert.deepEqual(normalizeWpTerms({ code: 'x' }), [])
  })

  it('daftar kategori WordPress: semua kecuali uncategorized dan ruang-visual beserta anaknya, urutan id naik, nama didekode', () => {
    const terms = [
      { id: 9, slug: 'hukum', name: 'Hukum' },
      { id: 4, slug: 'berita', name: 'Berita' },
      { id: 7, slug: 'bisnis-teknologi', name: 'Bisnis &amp; Teknologi' },
      { id: 1, slug: 'uncategorized', name: 'Uncategorized' },
      { id: 20, slug: 'ruang-visual', name: 'Ruang Visual' },
      { id: 12, slug: 'visual-budaya', name: 'Budaya', parent: 20 },
      { id: 13, slug: 'cucu-visual', name: 'Cucu', parent: 12 },
      { id: 30, slug: 'kategori-baru', name: 'Kategori Baru' }
    ]
    const list = pickWordPressCategories(terms)
    assert.deepEqual(list.map(item => item.slug), ['berita', 'bisnis-teknologi', 'hukum', 'kategori-baru'])
    assert.equal(list[1]?.name, 'Bisnis & Teknologi')
    assert.deepEqual(pickWordPressCategories([]), [])
  })
})
