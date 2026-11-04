/**
 * Uji unit HARD-001: basis URL tetap (`siteOrigin`), validasi URL gambar hero (`safeImageUrl`), dan turunan
 * header CSP `frame-src` dari `EMBED_ALLOWED_HOSTS` (`embedFrameSrcPolicy`). Pelari: `node:test` (`npm test`).
 */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { SITE_URL, siteOrigin } from '../../app/config/site.ts'
import { safeImageUrl } from '../../server/utils/image-url.ts'
import { EMBED_ALLOWED_HOSTS, IMAGE_ALLOWED_HOSTS, embedFrameSrcPolicy } from '../../server/utils/sanitize-config.ts'

describe('H1 siteOrigin', () => {
  it('SITE_URL = domain produksi tanpa garis miring akhir', () => {
    assert.equal(SITE_URL, 'https://inisumedang.com')
  })

  const hostile = ['https://evil.example', 'http://evil.example:8080', 'http://localhost:3000', '', 'javascript:alert(1)']
  for (const origin of hostile) {
    it(`produksi mengabaikan origin permintaan "${origin}"`, () => {
      assert.equal(siteOrigin(origin, false), SITE_URL)
    })
  }

  it('mode dev memakai origin permintaan', () => {
    assert.equal(siteOrigin('http://localhost:3000', true), 'http://localhost:3000')
  })

  it('tanpa argumen dev (Node, bukan build Nuxt) = perilaku produksi', () => {
    assert.equal(siteOrigin('https://evil.example'), SITE_URL)
  })
})

describe('H2 safeImageUrl', () => {
  const hosts = ['media.inisumedang.com', 'Cdn.Example.com']

  const rejected: [string, unknown][] = [
    ['javascript:', 'javascript:alert(1)'],
    ['javascript: huruf besar', 'JaVaScRiPt:alert(1)'],
    ['javascript: dengan tab', 'java\tscript:alert(1)'],
    ['data:', 'data:image/svg+xml,<svg onload=alert(1)>'],
    ['vbscript:', 'vbscript:msgbox(1)'],
    ['http: host terdaftar', 'http://media.inisumedang.com/a.jpg'],
    ['//host', '//media.inisumedang.com/a.jpg'],
    ['//host evil', '//evil.example/x.jpg'],
    ['/\\host', '/\\evil.example/x.jpg'],
    ['\\\\host', '\\\\evil.example\\x.jpg'],
    ['\\ di jalur', '/fixtures\\x.jpg'],
    ['https host di luar daftar', 'https://evil.example/x.jpg'],
    ['https subdomain palsu', 'https://media.inisumedang.com.evil.example/x.jpg'],
    ['https userinfo', 'https://media.inisumedang.com@evil.example/x.jpg'],
    ['https userinfo terdaftar', 'https://user:pw@media.inisumedang.com/x.jpg'],
    ['https port', 'https://media.inisumedang.com:8443/x.jpg'],
    ['https tanpa host', 'https:///x.jpg'],
    ['https tanpa //', 'https:media.inisumedang.com/x.jpg'],
    ['https backslash', 'https://media.inisumedang.com\\@evil.example/x.jpg'],
    ['https titik akhir', 'https://media.inisumedang.com./x.jpg'],
    ['karakter kontrol (NUL)', '/fixtures/x\u0000.jpg'],
    ['karakter kontrol (newline)', '/fixtures/x\n.jpg'],
    ['karakter kontrol (tab)', '/fixtures/\tx.jpg'],
    ['karakter kontrol (DEL)', '/fixtures/x\u007F.jpg'],
    ['spasi di depan', ' /fixtures/x.jpg'],
    ['spasi di tengah', '/fixtures/x y.jpg'],
    ['relatif tanpa /', 'fixtures/x.jpg'],
    ['relatif ./', './x.jpg'],
    ['mailto:', 'mailto:a@b.c'],
    ['kosong', ''],
    ['null', null],
    ['undefined', undefined],
    ['angka', 42],
    ['objek', { url: '/x.jpg' }],
    ['array', ['/x.jpg']]
  ]
  for (const [name, input] of rejected) {
    it(`menolak: ${name}`, () => {
      assert.equal(safeImageUrl(input, hosts), null)
    })
  }

  const accepted: [string, string][] = [
    ['relatif satu /', '/fixtures/figma-1.jpg'],
    ['relatif dengan query', '/fixtures/x.jpg?v=2'],
    ['hanya /', '/'],
    ['https host terdaftar', 'https://media.inisumedang.com/uploads/a.jpg'],
    ['https host terdaftar huruf besar di URL', 'HTTPS://MEDIA.INISUMEDANG.COM/uploads/a.jpg'],
    ['https host terdaftar (daftar bercampur huruf)', 'https://cdn.example.com/a.jpg?w=1#x']
  ]
  for (const [name, input] of accepted) {
    it(`menerima: ${name}`, () => {
      assert.equal(safeImageUrl(input, hosts), input)
    })
  }

  it('daftar bawaan = IMAGE_ALLOWED_HOSTS: relatif lolos, https asing ditolak (default kosong)', () => {
    assert.equal(safeImageUrl('/fixtures/x.jpg'), '/fixtures/x.jpg')
    assert.equal(safeImageUrl('https://evil.example/x.jpg'), null)
    for (const host of IMAGE_ALLOWED_HOSTS) {
      assert.equal(safeImageUrl(`https://${host}/x.jpg`), `https://${host}/x.jpg`)
    }
  })
})

describe('H3 embedFrameSrcPolicy', () => {
  it('diturunkan persis dari EMBED_ALLOWED_HOSTS (satu https://<host> per host, urutan sama)', () => {
    const policy = embedFrameSrcPolicy()
    assert.equal(policy, `frame-src ${EMBED_ALLOWED_HOSTS.map(host => `https://${host}`).join(' ')}`)
    assert.ok(policy.startsWith('frame-src '))
    assert.equal(policy.split(' ').length - 1, EMBED_ALLOWED_HOSTS.length)
  })

  it('default memuat host YouTube dan tanpa direktif lain', () => {
    const policy = embedFrameSrcPolicy()
    assert.ok(policy.includes('https://www.youtube.com'))
    assert.ok(policy.includes('https://www.youtube-nocookie.com'))
    assert.ok(!policy.includes(';'))
    assert.ok(!policy.includes('*'))
    assert.ok(!/script-src|default-src|'self'/.test(policy))
  })

  it('menambah host di daftar mengubah kebijakan tanpa edit kedua', () => {
    assert.equal(embedFrameSrcPolicy([...EMBED_ALLOWED_HOSTS, 'player.example.com']).split(' ').at(-1), 'https://player.example.com')
  })

  it('daftar kosong = frame-src \'none\'', () => {
    assert.equal(embedFrameSrcPolicy([]), 'frame-src \'none\'')
  })
})
