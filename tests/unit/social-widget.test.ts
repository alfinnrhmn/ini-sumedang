/**
 * Uji unit widget sosial "Ikuti IniSumedang" (SOC-001): logika murni (`socialHref` hanya https, `socialLabel` satu unit), data konfigurasi
 * (enam platform, urutan Figma, penampung [I]) dan penjaga sumber komponen/penempatan (tanpa tombol ikuti/form/skrip, ikon dekoratif,
 * warna dari token, widget di kolom kanan Beranda/Detail/kategori dan tidak di Detail mobile). Pelari: `node:test` (`npm test`).
 */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { SOCIAL_STATS, socialHref, socialLabel } from '../../app/config/social.ts'

const source = (path: string) => readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8')

describe('SOC-001 socialHref: hanya https yang menjadi tautan', () => {
  it('menerima https dan menormalkan', () => {
    assert.equal(socialHref('https://www.facebook.com/inisumedang'), 'https://www.facebook.com/inisumedang')
    assert.equal(socialHref('  https://x.com/inisumedang  '), 'https://x.com/inisumedang')
    assert.equal(socialHref('HTTPS://youtube.com/@ini'), 'https://youtube.com/@ini')
  })

  it('menolak http, javascript:, data:, relatif, skema-relatif, kosong, bukan string', () => {
    for (const bad of [
      'http://facebook.com/x', 'javascript:alert(1)', 'JaVaScRiPt:alert(1)', 'data:text/html,<script>alert(1)</script>',
      '/relatif', '//facebook.com/x', 'facebook.com/x', 'ftp://x.com', 'https:facebook.com', 'https://',
      'https://user:pass@facebook.com/x', ' javascript:alert(1)', '', '   '
    ]) {
      assert.equal(socialHref(bad), null, bad)
    }
    assert.equal(socialHref(undefined), null)
    assert.equal(socialHref(null), null)
    assert.equal(socialHref(42 as unknown as string), null)
  })
})

describe('SOC-001 socialLabel: nama aksesibel satu unit', () => {
  it('"<Platform>, <nilai> <satuan>"', () => {
    assert.equal(socialLabel({ name: 'Facebook', value: '12,4K', unit: 'Pengikut' }), 'Facebook, 12,4K Pengikut')
    assert.equal(socialLabel({ name: 'YouTube', value: '5,6K', unit: 'Subscriber' }), 'YouTube, 5,6K Subscriber')
  })
})

describe('SOC-001 data konfigurasi (penampung [I])', () => {
  it('enam platform urutan Figma dengan nilai/satuan contoh', () => {
    assert.deepEqual(SOCIAL_STATS.map(item => item.name), ['Facebook', 'Instagram', 'X', 'YouTube', 'TikTok', 'WhatsApp'])
    assert.deepEqual(SOCIAL_STATS.map(item => item.value), ['12,4K', '8,7K', '3,1K', '5,6K', '9,2K', '2,8K'])
    assert.deepEqual(SOCIAL_STATS.map(item => item.unit), ['Pengikut', 'Pengikut', 'Pengikut', 'Subscriber', 'Pengikut', 'Pengikut'])
  })

  it('belum ada URL akun (kotak = teks biasa) dan setiap ikon ada di public/icons', () => {
    for (const item of SOCIAL_STATS) {
      assert.equal(item.url, undefined, item.name)
      assert.equal(socialHref(item.url), null, item.name)
      assert.match(item.icon, /^\/icons\/social-stat-[a-z]+\.svg$/, item.name)
      assert.ok(existsSync(new URL(`../../public${item.icon}`, import.meta.url)), item.icon)
      assert.ok(item.iconBox[0] > 0 && item.iconBox[1] > 0, item.name)
      assert.ok(item.gap >= 0 && item.textWidth > 0, item.name)
    }
  })

  it('ukuran kotak ikon sesuai Figma (24x24; X 20x23)', () => {
    assert.deepEqual(SOCIAL_STATS.map(item => item.iconBox), [[24, 24], [24, 24], [20, 23], [24, 24], [24, 24], [24, 24]])
  })
})

describe('SOC-001 komponen SocialWidget (penjaga sumber)', () => {
  const component = source('app/components/home/SocialWidget.vue')
  const template = component.slice(component.indexOf('<template>'), component.indexOf('<style'))
  const css = component.slice(component.indexOf('<style')).replace(/\/\*[\s\S]*?\*\//g, '')

  it('aside berlabel judul "Ikuti IniSumedang" (h2) dan subjudul Figma', () => {
    assert.match(template, /<aside[^>]*:aria-labelledby="headingId"/)
    assert.match(template, /<h2 :id="headingId"[^>]*>\s*Ikuti IniSumedang\s*<\/h2>/)
    assert.match(template, /Kabar terbaru langsung di kanal pilihanmu/)
  })

  it('tanpa tombol ikuti, form, input, skrip, iframe, SDK, atau HTML mentah', () => {
    for (const forbidden of ['<button', '<form', '<input', '<script', '<iframe', 'v-html', 'tabindex', 'onclick', '@click']) {
      assert.equal(template.includes(forbidden), false, forbidden)
    }
    assert.equal(/v-html=/.test(component), false)
  })

  it('tautan hanya bila href https: rel="noopener noreferrer" target="_blank"; ikon dekoratif (aria-hidden, alt kosong)', () => {
    assert.match(template, /<a\s[^>]*v-if="item\.href"/)
    assert.match(template, /rel="noopener noreferrer"/)
    assert.match(template, /target="_blank"/)
    assert.match(template, /:aria-label="item\.label"/)
    assert.equal((template.match(/<a[\s>]/g) ?? []).length, 1)
    assert.equal((template.match(/aria-hidden="true"/g) ?? []).length, 2)
    assert.equal((template.match(/alt=""/g) ?? []).length, 2)
    assert.match(template, /<span class="visually-hidden">\{\{ item\.name \}\}, <\/span>/)
  })

  it('ukuran tetap Figma (357x200 maks, tinggi 200), warna dan font dari token (tanpa literal)', () => {
    assert.match(css, /max-width: 357px/)
    assert.match(css, /height: 200px/)
    assert.match(css, /border-radius: var\(--radius-16\)/)
    assert.match(css, /font: var\(--type-heading-mobile\)/)
    assert.match(css, /font: var\(--type-card-headline-mobile\)/)
    assert.match(css, /font: var\(--type-metadata\)/)
    assert.equal(/#[0-9a-fA-F]{3,8}\b/.test(css), false)
  })
})

describe('SOC-001 penempatan (penjaga sumber)', () => {
  it('Beranda: salinan desktop di kolom kanan Rekomendasi sebelum iklan; salinan mobile setelah "Bisnis dan Teknologi"', () => {
    const page = source('app/pages/index.vue')
    assert.match(page, /<div ref="sideAds" class="side-ads">\s*<HomeSocialWidget \/>\s*<AdSlot variant="sidebar-m" \/>/)
    assert.match(page, /const SOCIAL_AFTER_SLUG = 'bisnis-teknologi'/)
    assert.match(page, /<div v-if="section\.slug === SOCIAL_AFTER_SLUG" class="mobile-social">\s*<HomeSocialWidget \/>/)
    assert.equal((page.match(/<HomeSocialWidget/g) ?? []).length, 2)
  })

  it('Detail: widget paling atas kolom kanan (desktop saja: kolom kanan display none di bawah 1024) sebelum iklan', () => {
    const page = source('app/pages/berita/[slug].vue')
    assert.match(page, /<div ref="sidebarCol" class="sidebar-col">\s*<HomeSocialWidget \/>\s*<AdSlot variant="sidebar-m" \/>/)
    assert.equal((page.match(/<HomeSocialWidget/g) ?? []).length, 1)
    assert.match(page, /\.sidebar-col \{\s*display: none;/)
  })

  it('kategori: komponen yang sama paling atas kolom kanan, lalu Trending (UX-001), lalu iklan', () => {
    const page = source('app/pages/kategori/[slug].vue')
    assert.match(page, /<HomeSocialWidget \/>\s*<HomeTrendingList [^>]*\/>\s*<div class="ads ads--desktop">/)
    assert.equal((page.match(/<HomeSocialWidget/g) ?? []).length, 1)
  })
})
