// Uji unit iklan ACF WordPress: `aktif`, jadwal WIB, validasi tautan/gambar, iklan terbaru per slot, `loadWpAds`,
// dan struktur sumber komponen/composable/API. Murni (tanpa jaringan). Pelari: `node:test` (`npm test`).
import { afterEach, describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { AD_SLOTS } from '../../app/utils/ad-slots.ts'
import {
  AD_FALLBACK_ALT, acfFlag, isAdSlotName, isScheduleOpen, normalizeAd, parseAcfDate, safeAdImage, safeAdLink, selectAds, todayWib, withDeadline
} from '../../server/utils/wp-ads.ts'
import { WpUnavailableError, loadWpAds } from '../../server/utils/wp-client.ts'

const HOST = 'wp.contoh.test'
const HOSTS = [HOST]
const IMG = `https://${HOST}/wp-content/uploads/2026/11/iklan.jpg`
/** 6 Nov 2026 12:00 WIB = 05:00 UTC. */
const NOW = new Date('2026-11-06T05:00:00Z')

interface AcfOverride { [key: string]: unknown }
function item(over: { id?: unknown, date_gmt?: unknown, title?: unknown, acf?: unknown } = {}, acf: AcfOverride = {}): Record<string, unknown> {
  return {
    id: 10,
    date_gmt: '2026-11-01T03:00:00',
    title: { rendered: 'Iklan Contoh' },
    acf: {
      gambar: { url: IMG, alt: 'x', width: 357, height: 237 },
      tautan: 'https://pengiklan.example/promo?utm=1',
      slot: 'sidebar-m',
      aktif: true,
      mulai: '',
      selesai: '',
      teks_alt: '',
      ...acf
    },
    ...over
  }
}

describe('ADS1 nilai aktif (True/False ACF)', () => {
  for (const value of [true, 1, '1']) it(`aktif: ${JSON.stringify(value)}`, () => assert.equal(acfFlag(value), true))
  for (const value of [false, 0, '0', '', null, undefined, 'true', 'false', 'on', 2, [], {}, [1]]) {
    it(`tidak aktif: ${JSON.stringify(value)}`, () => assert.equal(acfFlag(value), false))
  }
})

describe('ADS2 nama slot', () => {
  it('tujuh slot persis dari AD_SLOTS', () => {
    assert.deepEqual(Object.keys(AD_SLOTS).sort(), ['mobile-m', 'mobile-s', 'sidebar-l', 'sidebar-m', 'sidebar-s', 'wide-l', 'wide-m'])
    for (const name of Object.keys(AD_SLOTS)) assert.equal(isAdSlotName(name), true, name)
  })
  for (const value of ['', 'Sidebar-M', ' sidebar-m', 'sidebar-m ', 'sidebar', 'banner', '__proto__', 'constructor', 'toString', null, undefined, 1, ['sidebar-m'], { value: 'sidebar-m' }]) {
    it(`bukan slot: ${JSON.stringify(value)}`, () => assert.equal(isAdSlotName(value), false))
  }
})

describe('ADS3 tanggal ACF dan jadwal WIB', () => {
  it('parseAcfDate: tanggal valid, kosong, dan tak valid', () => {
    assert.equal(parseAcfDate('2026-11-06'), '2026-11-06')
    assert.equal(parseAcfDate('2028-02-29'), '2028-02-29') // kabisat
    for (const empty of [undefined, null, false, '']) assert.equal(parseAcfDate(empty), null)
    for (const bad of ['2026-02-30', '2027-02-29', '2026-13-01', '2026-00-10', '2026-11-00', '2026-11-31', '06/11/2026', '2026/11/06', '20261106', '2026-1-6',
      ' 2026-11-06', '2026-11-06 ', '2026-11-06T00:00:00', 'besok', '0000-01-01', 20261106, true, 0, [], {}, ['2026-11-06']]) {
      assert.equal(parseAcfDate(bad), undefined, JSON.stringify(bad))
    }
  })

  it('todayWib: tanggal kalender WIB (UTC+7), pergantian hari pukul 17:00 UTC', () => {
    assert.equal(todayWib(new Date('2026-11-06T16:59:59.999Z')), '2026-11-06')
    assert.equal(todayWib(new Date('2026-11-06T17:00:00Z')), '2026-11-07')
    assert.equal(todayWib(new Date('2026-11-05T17:00:00Z')), '2026-11-06')
    assert.equal(todayWib(new Date('2026-12-31T17:00:00Z')), '2027-01-01')
    assert.equal(todayWib(new Date('2026-11-06T00:00:00Z')), '2026-11-06')
  })

  it('tanpa batas: kedua tanggal kosong', () => {
    assert.equal(isScheduleOpen('', '', NOW), true)
    assert.equal(isScheduleOpen(undefined, undefined, NOW), true)
    assert.equal(isScheduleOpen(false, null, NOW), true)
  })

  it('mulai inklusif (WIB): hari mulai sudah tayang sejak 00:00 WIB', () => {
    assert.equal(isScheduleOpen('2026-11-07', '', new Date('2026-11-06T16:59:59Z')), false) // 6 Nov 23:59:59 WIB
    assert.equal(isScheduleOpen('2026-11-07', '', new Date('2026-11-06T17:00:00Z')), true) // 7 Nov 00:00 WIB
    assert.equal(isScheduleOpen('2026-11-06', '', NOW), true)
    assert.equal(isScheduleOpen('2026-11-05', '', NOW), true)
  })

  it('selesai inklusif (WIB): hari selesai tayang sampai 23:59:59 WIB', () => {
    assert.equal(isScheduleOpen('', '2026-11-06', new Date('2026-11-06T16:59:59Z')), true)
    assert.equal(isScheduleOpen('', '2026-11-06', new Date('2026-11-06T17:00:00Z')), false) // 7 Nov 00:00 WIB
    assert.equal(isScheduleOpen('', '2026-11-05', NOW), false)
    assert.equal(isScheduleOpen('', '2026-11-07', NOW), true)
  })

  it('rentang satu hari, rentang terbalik, dan rentang di luar hari ini', () => {
    assert.equal(isScheduleOpen('2026-11-06', '2026-11-06', NOW), true)
    assert.equal(isScheduleOpen('2026-11-07', '2026-11-06', NOW), false)
    assert.equal(isScheduleOpen('2026-11-01', '2026-11-30', NOW), true)
    assert.equal(isScheduleOpen('2026-12-01', '2026-12-31', NOW), false)
    assert.equal(isScheduleOpen('2026-10-01', '2026-10-31', NOW), false)
  })

  it('format tak valid di salah satu sisi = tidak terpenuhi (iklan dibuang)', () => {
    assert.equal(isScheduleOpen('06/11/2026', '', NOW), false)
    assert.equal(isScheduleOpen('', 'besok', NOW), false)
    assert.equal(isScheduleOpen('2026-02-30', '2026-12-31', NOW), false)
    assert.equal(isScheduleOpen(20261106, '', NOW), false)
  })
})

describe('ADS4 tautan iklan', () => {
  it('https valid lolos dan dinormalisasi (URL.href)', () => {
    assert.equal(safeAdLink('https://pengiklan.example/promo?utm=1#x'), 'https://pengiklan.example/promo?utm=1#x')
    assert.equal(safeAdLink('https://pengiklan.example'), 'https://pengiklan.example/')
    assert.equal(safeAdLink('HTTPS://Pengiklan.Example:8443/a b'.replace(' ', '%20')), 'https://pengiklan.example:8443/a%20b')
    assert.equal(safeAdLink('https://sub.pengiklan.example/'), 'https://sub.pengiklan.example/')
  })
  const bad: [string, unknown][] = [
    ['http', 'http://pengiklan.example/'],
    ['javascript', 'javascript:alert(1)'],
    ['JAVASCRIPT huruf besar', 'JaVaScRiPt:alert(1)'],
    ['data', 'data:text/html,<script>alert(1)</script>'],
    ['vbscript', 'vbscript:msgbox(1)'],
    ['relatif', '/promo'],
    ['tanpa skema', 'pengiklan.example/promo'],
    ['//host', '//pengiklan.example/'],
    ['https tanpa host', 'https://'],
    ['https:///host', 'https:///pengiklan.example/'],
    ['userinfo', 'https://user:pass@pengiklan.example/'],
    ['userinfo tanpa sandi', 'https://pengiklan.example@evil.example/'],
    ['userinfo kosong sandi', 'https://user:@pengiklan.example/'],
    ['spasi', 'https://pengiklan.example/a b'],
    ['spasi di depan', ' https://pengiklan.example/'],
    ['tab di dalam', 'https://pengiklan.example/\tx'],
    ['baris baru', 'https://pengiklan.\nexample/'],
    ['garis miring terbalik', 'https://pengiklan.example\\@evil.example/'],
    ['kontrol NUL', 'https://pengiklan.example/\u0000'],
    ['port tak valid', 'https://pengiklan.example:99999/'],
    ['host tak valid', 'https://%/'],
    ['terlalu panjang', `https://pengiklan.example/${'a'.repeat(2048)}`],
    ['kosong', ''],
    ['null', null],
    ['angka', 5],
    ['objek', { url: 'https://pengiklan.example/' }],
    ['array', ['https://pengiklan.example/']]
  ]
  for (const [name, value] of bad) it(`ditolak: ${name}`, () => assert.equal(safeAdLink(value), null))
  it('tepat 2048 karakter lolos, 2049 ditolak', () => {
    const base = 'https://pengiklan.example/'
    assert.notEqual(safeAdLink(base + 'a'.repeat(2048 - base.length)), null)
    assert.equal(safeAdLink(base + 'a'.repeat(2049 - base.length)), null)
  })
})

describe('ADS5 gambar iklan', () => {
  it('Image Array dan string URL dari host WordPress lolos', () => {
    assert.equal(safeAdImage({ url: IMG }, HOSTS), IMG)
    assert.equal(safeAdImage(IMG, HOSTS), IMG)
    assert.equal(safeAdImage({ url: IMG.replace(HOST, 'WP.Contoh.TEST'), width: 1 }, HOSTS), IMG.replace(HOST, 'WP.Contoh.TEST'))
  })
  const bad: [string, unknown][] = [
    ['javascript', { url: 'javascript:alert(1)' }],
    ['data', { url: 'data:image/png;base64,AAAA' }],
    ['http', { url: `http://${HOST}/a.jpg` }],
    ['host lain', { url: 'https://evil.example/a.jpg' }],
    ['subdomain host', { url: `https://x.${HOST}/a.jpg` }],
    ['host mirip', { url: `https://${HOST}.evil.example/a.jpg` }],
    ['userinfo', { url: `https://u:p@${HOST}/a.jpg` }],
    ['userinfo menyamar', { url: `https://${HOST}@evil.example/a.jpg` }],
    ['berport', { url: `https://${HOST}:8443/a.jpg` }],
    ['relatif', { url: '/wp-content/uploads/a.jpg' }],
    ['//host', { url: `//${HOST}/a.jpg` }],
    ['spasi', { url: `https://${HOST}/a b.jpg` }],
    ['garis miring terbalik', { url: `https://${HOST}\\@evil.example/a.jpg` }],
    ['terlalu panjang', { url: `https://${HOST}/${'a'.repeat(2048)}.jpg` }],
    ['id angka (return format ID)', 123],
    ['false (kosong)', false],
    ['null', null],
    ['objek tanpa url', { alt: 'x' }],
    ['url bukan string', { url: 5 }],
    ['array', [IMG]]
  ]
  for (const [name, value] of bad) it(`ditolak: ${name}`, () => assert.equal(safeAdImage(value, HOSTS), null))
  it('tanpa host WordPress (base URL http/berport) = semua gambar ditolak', () => {
    assert.equal(safeAdImage({ url: IMG }, []), null)
  })
})

describe('ADS6 normalisasi satu iklan', () => {
  it('iklan layak -> { slot, ad } dengan field minimal', () => {
    const result = normalizeAd(item(), HOSTS, NOW)
    assert.deepEqual(result, {
      slot: 'sidebar-m',
      publishedMs: Date.parse('2026-11-01T03:00:00Z'),
      ad: { id: 10, image: { url: IMG }, alt: 'Iklan Contoh', href: 'https://pengiklan.example/promo?utm=1' }
    })
  })

  it('tidak membawa field lain (hanya id, image.url, alt, href)', () => {
    const ad = normalizeAd(item({}, { rahasia: 'x', gambar: { url: IMG, caption: '<script>x</script>', sizes: { a: 1 } } }), HOSTS, NOW)?.ad
    assert.deepEqual(Object.keys(ad ?? {}).sort(), ['alt', 'href', 'id', 'image'])
    assert.deepEqual(Object.keys(ad?.image ?? {}), ['url'])
  })

  it('varian ACF wajar: gambar string, aktif "1"/1, tanggal kosong false, date_gmt dengan Z', () => {
    assert.ok(normalizeAd(item({}, { gambar: IMG }), HOSTS, NOW))
    assert.ok(normalizeAd(item({}, { aktif: '1' }), HOSTS, NOW))
    assert.ok(normalizeAd(item({}, { aktif: 1 }), HOSTS, NOW))
    assert.ok(normalizeAd(item({}, { mulai: false, selesai: null }), HOSTS, NOW))
    assert.ok(normalizeAd(item({ date_gmt: '2026-11-01T03:00:00Z' }), HOSTS, NOW))
    assert.ok(normalizeAd(item({}, { mulai: '2026-11-06', selesai: '2026-11-06' }), HOSTS, NOW))
  })

  it('semua tujuh slot diterima', () => {
    for (const slot of Object.keys(AD_SLOTS)) assert.equal(normalizeAd(item({}, { slot }), HOSTS, NOW)?.slot, slot)
  })

  const rejected: [string, ReturnType<typeof item>][] = [
    ['aktif false', item({}, { aktif: false })],
    ['aktif "0"', item({}, { aktif: '0' })],
    ['aktif hilang', item({}, { aktif: undefined })],
    ['slot tak dikenal', item({}, { slot: 'banner-atas' })],
    ['slot hilang', item({}, { slot: undefined })],
    ['slot huruf besar', item({}, { slot: 'Sidebar-M' })],
    ['belum mulai', item({}, { mulai: '2026-11-07' })],
    ['sudah selesai', item({}, { selesai: '2026-11-05' })],
    ['jadwal format salah', item({}, { mulai: '06/11/2026' })],
    ['gambar javascript:', item({}, { gambar: { url: 'javascript:alert(1)' } })],
    ['gambar data:', item({}, { gambar: { url: 'data:image/png;base64,AAAA' } })],
    ['gambar http:', item({}, { gambar: { url: `http://${HOST}/a.jpg` } })],
    ['gambar host lain', item({}, { gambar: { url: 'https://evil.example/a.jpg' } })],
    ['gambar hilang', item({}, { gambar: false })],
    ['tautan http:', item({}, { tautan: 'http://pengiklan.example/' })],
    ['tautan javascript:', item({}, { tautan: 'javascript:alert(1)' })],
    ['tautan userinfo', item({}, { tautan: 'https://a:b@pengiklan.example/' })],
    ['tautan terlalu panjang', item({}, { tautan: `https://pengiklan.example/${'a'.repeat(2100)}` })],
    ['tautan hilang', item({}, { tautan: '' })],
    ['acf larik kosong ([] dari WordPress tanpa field)', item({ acf: [] })],
    ['acf hilang', item({ acf: undefined })],
    ['acf bukan objek', item({ acf: 'x' })],
    ['id hilang', item({ id: undefined })],
    ['id negatif', item({ id: -1 })],
    ['id pecahan', item({ id: 1.5 })],
    ['id string', item({ id: '10' })],
    ['date_gmt hilang', item({ date_gmt: undefined })],
    ['date_gmt rusak', item({ date_gmt: 'kemarin' })]
  ]
  for (const [name, value] of rejected) it(`dibuang: ${name}`, () => assert.equal(normalizeAd(value, HOSTS, NOW), null))
  for (const value of [null, undefined, 'x', 5, [], true]) it(`dibuang: bukan objek ${JSON.stringify(value)}`, () => assert.equal(normalizeAd(value, HOSTS, NOW), null))

  it('tanpa host gambar WordPress (base URL http) = dibuang', () => assert.equal(normalizeAd(item(), [], NOW), null))
})

describe('ADS7 teks alt (teks polos, tanpa HTML)', () => {
  it('teks_alt dipakai bila ada; selain itu judul; selain itu "Iklan"', () => {
    assert.equal(normalizeAd(item({}, { teks_alt: 'Promo Tahu Sumedang' }), HOSTS, NOW)?.ad.alt, 'Promo Tahu Sumedang')
    assert.equal(normalizeAd(item(), HOSTS, NOW)?.ad.alt, 'Iklan Contoh')
    assert.equal(normalizeAd(item({ title: { rendered: '' } }), HOSTS, NOW)?.ad.alt, AD_FALLBACK_ALT)
    assert.equal(normalizeAd(item({ title: undefined }), HOSTS, NOW)?.ad.alt, AD_FALLBACK_ALT)
    assert.equal(normalizeAd(item({ title: 'bukan objek' }), HOSTS, NOW)?.ad.alt, AD_FALLBACK_ALT)
    assert.equal(normalizeAd(item({}, { teks_alt: '   ' }), HOSTS, NOW)?.ad.alt, 'Iklan Contoh')
    assert.equal(normalizeAd(item({}, { teks_alt: 123 }), HOSTS, NOW)?.ad.alt, 'Iklan Contoh')
  })

  it('judul: tag dibuang, entitas didekode', () => {
    assert.equal(normalizeAd(item({ title: { rendered: 'Promo &#8211; <b>Tahu</b> &amp; Kopi' } }), HOSTS, NOW)?.ad.alt, 'Promo – Tahu & Kopi')
  })

  it('judul ber-HTML (lolos sebagai entitas) menjadi TEKS, bukan elemen', () => {
    const alt = normalizeAd(item({ title: { rendered: '&lt;img src=x onerror=alert(1)&gt;' } }), HOSTS, NOW)?.ad.alt
    assert.equal(alt, '<img src=x onerror=alert(1)>')
  })

  it('teks_alt ber-HTML tetap apa adanya sebagai teks (Vue meng-escape saat render); karakter kontrol dibuang; panjang dibatasi', () => {
    assert.equal(normalizeAd(item({}, { teks_alt: '<script>alert(1)</script>' }), HOSTS, NOW)?.ad.alt, '<script>alert(1)</script>')
    assert.equal(normalizeAd(item({}, { teks_alt: 'a\u0000b\nc\t d' }), HOSTS, NOW)?.ad.alt, 'a b c d')
    assert.equal(normalizeAd(item({}, { teks_alt: 'x'.repeat(500) }), HOSTS, NOW)?.ad.alt.length, 200)
  })
})

describe('ADS8 pemilihan satu iklan per slot', () => {
  it('bukan array / kosong = {}', () => {
    for (const raw of [undefined, null, 'x', 5, {}, { 0: item() }, []]) assert.deepEqual(selectAds(raw, HOSTS, NOW), {})
  })

  it('dua iklan satu slot: date_gmt terbaru menang, urutan masukan tidak berpengaruh', () => {
    const lama = item({ id: 1, date_gmt: '2026-10-01T00:00:00' }, { tautan: 'https://lama.example/' })
    const baru = item({ id: 2, date_gmt: '2026-11-02T00:00:00' }, { tautan: 'https://baru.example/' })
    assert.equal(selectAds([lama, baru], HOSTS, NOW)['sidebar-m']?.href, 'https://baru.example/')
    assert.equal(selectAds([baru, lama], HOSTS, NOW)['sidebar-m']?.href, 'https://baru.example/')
  })

  it('date_gmt sama: id terbesar menang', () => {
    const a = item({ id: 5, date_gmt: '2026-11-02T00:00:00' }, { tautan: 'https://a.example/' })
    const b = item({ id: 9, date_gmt: '2026-11-02T00:00:00Z' }, { tautan: 'https://b.example/' })
    assert.equal(selectAds([a, b], HOSTS, NOW)['sidebar-m']?.id, 9)
    assert.equal(selectAds([b, a], HOSTS, NOW)['sidebar-m']?.id, 9)
  })

  it('iklan terbaru yang tak layak tidak menggeser yang lebih lama tapi layak', () => {
    const lama = item({ id: 1, date_gmt: '2026-10-01T00:00:00' }, { tautan: 'https://lama.example/' })
    const barumati = item({ id: 2, date_gmt: '2026-11-02T00:00:00' }, { aktif: false })
    const baruexp = item({ id: 3, date_gmt: '2026-11-03T00:00:00' }, { selesai: '2026-11-05' })
    assert.equal(selectAds([lama, barumati, baruexp], HOSTS, NOW)['sidebar-m']?.href, 'https://lama.example/')
  })

  it('slot berbeda dipilih terpisah; slot tanpa iklan tidak ada di hasil', () => {
    const ads = selectAds([item({ id: 1 }, { slot: 'wide-l' }), item({ id: 2 }, { slot: 'mobile-s' }), item({ id: 3 }, { slot: 'wide-l' })], HOSTS, NOW)
    assert.deepEqual(Object.keys(ads).sort(), ['mobile-s', 'wide-l'])
    assert.equal(ads['wide-l']?.id, 3)
    assert.equal('sidebar-m' in ads, false)
  })

  it('campuran data buruk tidak melempar dan hanya yang layak tersisa', () => {
    const raw = [null, 'x', 5, [], { id: 1 }, item({ acf: [] }), item({ id: 7 }, { slot: 'sidebar-l' }), item({ id: 8 }, { gambar: { url: 'javascript:alert(1)' } })]
    const ads = selectAds(raw, HOSTS, NOW)
    assert.deepEqual(Object.keys(ads), ['sidebar-l'])
    assert.equal(ads['sidebar-l']?.id, 7)
  })

  it('jadwal dinilai per pemanggilan (now), bukan dibekukan', () => {
    const raw = [item({}, { mulai: '2026-11-07' })]
    assert.deepEqual(selectAds(raw, HOSTS, new Date('2026-11-06T16:59:59Z')), {})
    assert.deepEqual(Object.keys(selectAds(raw, HOSTS, new Date('2026-11-06T17:00:00Z'))), ['sidebar-m'])
  })

  it('hasil JSON bersih: tanpa prototype aneh, hanya nama slot', () => {
    const ads = selectAds([item({}, { slot: '__proto__' }), item({}, { slot: 'constructor' })], HOSTS, NOW)
    assert.deepEqual(ads, {})
    assert.equal(Object.getPrototypeOf(ads), Object.prototype)
  })
})

describe('ADS9 pemuat loadWpAds (GET saja, tanpa kredensial)', () => {
  const realFetch = globalThis.fetch
  const realWarn = console.warn
  afterEach(() => {
    globalThis.fetch = realFetch
    console.warn = realWarn
  })

  function stub(handler: (url: string, init: RequestInit | undefined) => Response | Promise<Response>) {
    const calls: { url: string, init: RequestInit | undefined }[] = []
    globalThis.fetch = (async (input: unknown, init?: RequestInit) => {
      calls.push({ url: String(input), init })
      return handler(String(input), init)
    }) as typeof fetch
    console.warn = () => {}
    return calls
  }

  it('satu GET ke wp/v2/iklan dengan _fields terbatas, tanpa header kredensial, tanpa mengikuti pengalihan', async () => {
    const calls = stub(() => new Response(JSON.stringify([item()]), { status: 200, headers: { 'content-type': 'application/json', 'x-wp-totalpages': '1' } }))
    const raw = await loadWpAds('https://get-ok.contoh.test')
    assert.equal(Array.isArray(raw) && raw.length, 1)
    assert.equal(calls.length, 1)
    assert.equal(calls[0]?.url, 'https://get-ok.contoh.test/wp-json/wp/v2/iklan?status=publish&per_page=100&_fields=id,date_gmt,title,acf&acf_format=standard&page=1')
    assert.equal(calls[0]?.init?.method, 'GET')
    assert.equal(calls[0]?.init?.redirect, 'error')
    const headers = Object.keys((calls[0]?.init?.headers ?? {}) as Record<string, string>).map(key => key.toLowerCase())
    assert.deepEqual(headers, ['accept'])
    assert.equal(calls[0]?.init?.body, undefined)
  })

  it('di-cache: pemanggilan kedua dalam TTL tidak menghubungi WordPress lagi', async () => {
    const calls = stub(() => new Response('[]', { status: 200, headers: { 'content-type': 'application/json' } }))
    await loadWpAds('https://cache.contoh.test')
    await loadWpAds('https://cache.contoh.test')
    assert.equal(calls.length, 1)
  })

  it('post type belum ada (404): WpUnavailableError tanpa percobaan ulang, pesan tetap tanpa URL', async () => {
    const calls = stub(() => new Response('{"code":"rest_no_route"}', { status: 404, headers: { 'content-type': 'application/json' } }))
    await assert.rejects(loadWpAds('https://nf.contoh.test'), (error: unknown) => {
      assert.ok(error instanceof WpUnavailableError)
      assert.equal(error.reason, 'http-404')
      assert.equal(error.message.includes('contoh.test'), false)
      return true
    })
    assert.equal(calls.length, 1)
  })

  it('JSON rusak dan bentuk bukan array: WpUnavailableError', async () => {
    stub(() => new Response('<html>bukan json', { status: 200 }))
    await assert.rejects(loadWpAds('https://rusak.contoh.test'), (error: unknown) => error instanceof WpUnavailableError && error.reason === 'json')
    stub(() => new Response('{"a":1}', { status: 200 }))
    await assert.rejects(loadWpAds('https://bentuk.contoh.test'), (error: unknown) => error instanceof WpUnavailableError && error.reason === 'shape')
  })

  it('jaringan mati: WpUnavailableError (bukan galat mentah)', async () => {
    stub(() => { throw new TypeError('fetch failed') })
    await assert.rejects(loadWpAds('https://mati.contoh.test'), (error: unknown) => error instanceof WpUnavailableError)
  })
})

describe('ADS9b batas tunggu iklan', () => {
  it('selesai tepat waktu: nilainya; lambat: cadangan; gagal: cadangan; tidak pernah menolak', async () => {
    assert.deepEqual(await withDeadline(Promise.resolve(['a']), 200, []), ['a'])
    assert.deepEqual(await withDeadline(new Promise<string[]>(resolve => setTimeout(() => resolve(['lambat']), 300)), 20, []), [])
    assert.deepEqual(await withDeadline(Promise.reject(new Error('x')), 200, []), [])
  })
})

describe('ADS10 struktur sumber', () => {
  const read = (path: string) => readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8').replace(/\r\n/g, '\n')

  it('AdSlot: cabang fixture statis, cabang WordPress = satu tautan https bergambar dengan rel aman, slot kosong tidak dirender', () => {
    const component = read('app/components/ad/AdSlot.vue')
    const template = component.slice(component.indexOf('<template>'), component.indexOf('</template>'))
    assert.match(template, /<aside v-if="ads\?\.source === 'fixture'"/)
    assert.match(template, /<aside v-else-if="ad" class="ad ad--live" aria-label="Iklan"/)
    assert.match(template, /<a class="link" :href="ad\.href" target="_blank" rel="sponsored noopener noreferrer">/)
    assert.match(template, /<img class="image" :src="ad\.image\.url" :alt="ad\.alt"/)
    assert.equal((template.match(/<a /g) ?? []).length, 1)
    assert.equal((template.match(/<img /g) ?? []).length, 1)
    assert.equal(template.includes('v-else>'), false) // tidak ada cabang terakhir yang merender kotak kosong
    for (const forbidden of ['v-html', 'innerHTML', '<script', '<iframe', 'tabindex', '<button', 'onclick', 'NuxtLink']) assert.equal(template.includes(forbidden), false, forbidden)
    assert.match(component, /ads\.value\?\.source === 'wordpress'/)
  })

  it('AdSlot: tinggi tetap, aside tidak memotong cincin fokus, tanpa warna literal', () => {
    const component = read('app/components/ad/AdSlot.vue')
    const css = component.slice(component.indexOf('<style')).replace(/\/\*[\s\S]*?\*\//g, '')
    assert.match(css, /height: var\(--ad-height\)/)
    assert.match(css, /\.ad--live \{[^}]*overflow: visible/)
    assert.match(css, /object-fit: cover/)
    assert.equal(/#[0-9a-fA-F]{3,8}\b/.test(css), false)
  })

  it('useAds: satu kunci "ads" dibagikan, dedupe defer, data dari payload', () => {
    const source = read('app/composables/useAds.ts')
    assert.match(source, /useFetch<AdsResponse>\('\/api\/ads'/)
    assert.match(source, /key: 'ads'/)
    assert.match(source, /dedupe: 'defer'/)
    assert.match(source, /nuxtApp\.payload\.data\[key\]/)
  })

  it('API dan layanan: hanya GET /api/ads; gagal = ads kosong tanpa melempar; fixture bila base URL tidak valid', () => {
    assert.match(read('server/api/ads.get.ts'), /getAds\(\)/)
    const service = read('server/services/ads.ts')
    assert.match(service, /return \{ source: 'fixture', ads: \{\} \}/)
    assert.match(service, /catch \{\s*return \{ source: 'wordpress', ads: \{\} \}/)
    assert.match(service, /withDeadline\(load, ADS_MAX_WAIT_MS, lastLoaded\)/)
    assert.match(service, /validWpBaseUrl\(useRuntimeConfig\(\)\.wpBaseUrl\)/)
    assert.equal(/runtimeConfig\.public|process\.env|console\./.test(service), false)
  })

  it('tidak ada v-html, runtimeConfig.public, atau kredensial di berkas ADS-002', () => {
    for (const path of ['app/components/ad/AdSlot.vue', 'app/composables/useAds.ts', 'app/types/ad.ts', 'server/api/ads.get.ts', 'server/services/ads.ts', 'server/utils/wp-ads.ts']) {
      const source = read(path).replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
      assert.equal(/v-html=|innerHTML|authorization|NUXT_WP_USER|APP_PASSWORD|runtimeConfig\.public/i.test(source), false, path)
    }
  })
})
