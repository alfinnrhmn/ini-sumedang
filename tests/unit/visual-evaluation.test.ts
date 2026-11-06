/**
 * Uji unit evaluasi visual pemilik E1-E7 (PAGE-003, 3 Nov 2026): kategori Berita = Beranda (E1), slot iklan (E6), footer satu kolom (E7),
 * konstanta animasi hero (E3), dan penjaga sumber untuk keputusan tampilan yang tidak dapat diuji sebagai fungsi murni
 * ("Lainnya" hanya di empat section kategori, penampung iklan tanpa tautan/skrip, pengalihan 308). Pelari: `node:test` (`npm test`).
 */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { HOME_CATEGORY_SLUG, categoryLink, categoryPagePath, categoryPath, isCategoryRoute } from '../../app/utils/routes.ts'
import { AD_SLOTS } from '../../app/utils/ad-slots.ts'
import { FOOTER_SECTIONS } from '../../app/config/footer.ts'
import { HERO_SLIDE_MS, HOME_SECTIONS } from '../../app/config/home.ts'

const MENU_SLUGS = ['berita', 'nasional', 'pemerintahan', 'politik', 'hukum', 'sepak-bola', 'otomotif', 'jelajah', 'bisnis-teknologi']
const MENU_CATEGORIES = MENU_SLUGS.map((slug, index) => ({ id: index + 1, slug }))

const source = (path: string) => readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8')

describe('E1 kategori Berita = Beranda', () => {
  it('categoryPath("berita") = "/" dan kategori lain tetap /kategori/<slug>', () => {
    assert.equal(HOME_CATEGORY_SLUG, 'berita')
    assert.equal(categoryPath('berita'), '/')
    assert.equal(categoryPath('hukum'), '/kategori/hukum')
    assert.equal(categoryPath('bisnis-teknologi'), '/kategori/bisnis-teknologi')
  })

  it('categoryLink("berita") = "/" (berita ada di daftar kategori)', () => {
    assert.ok(MENU_SLUGS.includes('berita'))
    assert.equal(categoryLink('berita', MENU_CATEGORIES), '/')
  })

  it('categoryPagePath("berita", N) selalu "/" (tidak berhalaman); kategori lain tidak berubah', () => {
    assert.equal(categoryPagePath('berita', 1), '/')
    assert.equal(categoryPagePath('berita', 3), '/')
    assert.equal(categoryPagePath('hukum', 3), '/kategori/hukum?halaman=3')
  })

  it('tidak ada bentuk URL yang menghasilkan /kategori/berita', () => {
    for (const slug of MENU_SLUGS) {
      assert.notEqual(categoryPath(slug), '/kategori/berita')
      assert.notEqual(categoryPagePath(slug, 2), '/kategori/berita?halaman=2')
    }
  })

  it('isCategoryRoute: Berita aktif hanya di Beranda; kategori lain aktif hanya di halamannya', () => {
    assert.equal(isCategoryRoute({ name: 'index', params: {} }, 'berita'), true)
    assert.equal(isCategoryRoute({ name: 'kategori-slug', params: { slug: 'hukum' } }, 'berita'), false)
    assert.equal(isCategoryRoute({ name: 'berita-slug', params: { slug: 'fixture-1' } }, 'berita'), false)
    assert.equal(isCategoryRoute({ name: 'kategori-slug', params: { slug: 'berita' } }, 'berita'), false)
    assert.equal(isCategoryRoute({ name: 'index', params: {} }, 'hukum'), false)
    assert.equal(isCategoryRoute({ name: 'kategori-slug', params: { slug: 'hukum' } }, 'hukum'), true)
  })

  it('footer: item Berita menaut ke "/" dan "Beranda" tetap "/"', () => {
    const links = FOOTER_SECTIONS.flatMap(section => section.links)
    assert.equal(links.find(link => link.label === 'Berita')?.to, '/')
    assert.equal(links.find(link => link.label === 'Beranda')?.to, '/')
    assert.equal(links.filter(link => link.to === '/kategori/berita').length, 0)
  })

  it('/kategori/berita dialihkan permanen 308 ke "/" (server route + middleware halaman)', () => {
    const route = source('server/routes/kategori/berita.get.ts')
    assert.match(route, /sendRedirect\(event, '\/', 308\)/)
    assert.match(source('app/pages/kategori/[slug].vue'), /redirectCode: 308/)
  })
})

describe('E7 footer kategori satu kolom', () => {
  it('konfigurasi footer tanpa pembagian kolom; 9 item kategori berurutan', () => {
    const section = FOOTER_SECTIONS.find(item => item.id === 'kategori')
    assert.ok(section)
    assert.equal(section.links.length, 9)
    assert.equal('columns' in section, false)
  })

  it('SiteFooter tanpa sub-kolom (list--split) dan penanda gaya aktif tidak bergantung pada href', () => {
    const footer = source('app/components/layout/SiteFooter.vue')
    assert.equal(footer.includes('list--split'), false)
    assert.equal(footer.includes('grid-auto-flow: column'), false)
    assert.match(footer, /a\[data-category\]\[aria-current="page"\]/)
  })
})

describe('E6 slot iklan (AdSlot)', () => {
  it('ukuran tetap sesuai Figma (px)', () => {
    assert.deepEqual([AD_SLOTS['sidebar-m'].width, AD_SLOTS['sidebar-m'].height], [357, 237])
    assert.deepEqual([AD_SLOTS['sidebar-l'].width, AD_SLOTS['sidebar-l'].height], [357, 368])
    assert.deepEqual([AD_SLOTS['sidebar-s'].width, AD_SLOTS['sidebar-s'].height], [357, 78])
    assert.deepEqual([AD_SLOTS['wide-m'].width, AD_SLOTS['wide-m'].height], [737, 107])
    assert.deepEqual([AD_SLOTS['wide-l'].width, AD_SLOTS['wide-l'].height], [1118, 159])
    assert.deepEqual([AD_SLOTS['mobile-s'].width, AD_SLOTS['mobile-s'].height], [null, 78])
    assert.deepEqual([AD_SLOTS['mobile-m'].width, AD_SLOTS['mobile-m'].height], [null, 237])
  })

  it('semua slot punya tinggi tetap positif dan node Figma sumber', () => {
    for (const [name, spec] of Object.entries(AD_SLOTS)) {
      assert.ok(spec.height > 0, name)
      assert.match(spec.figma, /^\d+:\d+/, name)
    }
  })

  it('penampung statis: aside berlabel "Iklan", tanpa tautan, skrip, gambar, HTML mentah, atau tab stop', () => {
    const component = source('app/components/ad/AdSlot.vue')
    const template = component.slice(component.indexOf('<template>'), component.indexOf('</template>'))
    assert.match(template, /<aside[^>]*aria-label="Iklan"/)
    for (const forbidden of ['<a ', '<a>', 'NuxtLink', '<script', '<img', '<iframe', 'v-html', 'href', 'tabindex', '<button']) {
      assert.equal(template.includes(forbidden), false, forbidden)
    }
    assert.equal(/v-html=/.test(component), false)
  })

  it('warna latar dari token terdekat (tanpa literal) dan teks memakai font Figma yang sudah di-host', () => {
    const component = source('app/components/ad/AdSlot.vue')
    assert.match(component, /background: var\(--color-footer-divider-mobile\)/)
    assert.match(component, /font: var\(--type-heading-desktop\)/)
    const css = component.slice(component.indexOf('<style')).replace(/\/\*[\s\S]*?\*\//g, '')
    assert.equal(/#[0-9a-fA-F]{3,8}\b/.test(css), false)
  })
})

describe('E4 "Lainnya" pada section kategori Beranda', () => {
  it('empat section kategori dengan slug yang punya halaman; Rekomendasi dan Ruang Visual tanpa "Lainnya"', () => {
    assert.deepEqual(HOME_SECTIONS.map(section => section.slug), ['sepak-bola', 'nasional', 'bisnis-teknologi', 'otomotif'])
    for (const section of HOME_SECTIONS) assert.equal(categoryPath(section.slug), `/kategori/${section.slug}`)
    const page = source('app/pages/index.vue')
    assert.match(page, /<HomeSectionTitle title="Rekomendasi" \/>/)
    assert.match(page, /<HomeSectionTitle title="Ruang Visual" \/>/)
    assert.match(page, /:more-to="categoryPath\(section\.slug\)"/)
    assert.equal((page.match(/:more-to=/g) ?? []).length, 1)
    assert.match(page, /:more-label="`Lainnya: \$\{section\.title\}`"/)
  })

  it('judul section tetap non-tautan: tautan "Lainnya" adalah elemen terpisah dari judul', () => {
    const title = source('app/components/home/SectionTitle.vue')
    const heading = title.slice(title.indexOf('<component'), title.indexOf('</component>'))
    assert.equal(heading.includes('NuxtLink'), false)
    assert.match(title, /<span class="more-text">Lainnya<\/span>/)
    assert.match(title, /src="\/icons\/arrow-right\.svg"/)
  })
})

describe('E3 animasi hero', () => {
  it('durasi dalam rentang 350-450 ms (satu sumber, dipakai CSS lewat variabel)', () => {
    assert.ok(HERO_SLIDE_MS >= 350 && HERO_SLIDE_MS <= 450)
    const hero = source('app/components/home/Hero.vue')
    assert.match(hero, /--hero-slide-ms/)
    assert.match(hero, /translateX\(100%\)/)
    assert.match(hero, /translateX\(-100%\)/)
  })

  it('reduced-motion: tanpa animasi, perpindahan instan, slide keluar inert + aria-hidden', () => {
    const hero = source('app/components/home/Hero.vue')
    assert.match(hero, /prefers-reduced-motion: reduce/)
    assert.match(hero, /:inert="leaving === index/)
    assert.match(hero, /:aria-hidden="leaving === index/)
  })
})
