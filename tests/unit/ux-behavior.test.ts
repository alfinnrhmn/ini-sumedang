/**
 * Uji unit perilaku UX: `stickyTop` (kolom kanan menempel), `mergeArticles` ("Lebih banyak" tanpa duplikat), putar otomatis hero (`heroAutoplayStatus`, `heroLiveMode`, `nextHeroSlide`, `HERO_AUTOPLAY_MS`),
 * dan penjaga sumber (kolom kanan kategori, "Lebih banyak", ukuran "Lainnya", sticky hanya >= 1024). Perilaku di browser diuji terpisah. Pelari: `node:test` (`npm test`).
 */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { STICKY_MIN_WIDTH, STICKY_OFFSET, STICKY_SCROLL_RESET, stickyTop, stickyTopForFocus } from '../../app/composables/useStickyColumn.ts'
import { categoryPagePath, mergeArticles } from '../../app/utils/routes.ts'
import { HERO_AUTOPLAY_MS, HERO_SLIDE_MS, heroAutoplayStatus, heroLiveMode, nextHeroSlide } from '../../app/config/home.ts'
import type { HeroAutoplayInput } from '../../app/config/home.ts'

const source = (path: string) => readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8').replace(/\r\n/g, '\n')
const stripComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, '')

describe('UX1 stickyTop', () => {
  it('offset bawaan 24 dan ambang 1024', () => {
    assert.equal(STICKY_OFFSET, 24)
    assert.equal(STICKY_MIN_WIDTH, 1024)
  })

  it('kolom lebih pendek dari layar: menempel 24 dari atas', () => {
    assert.equal(stickyTop(900, 400), 24)
    assert.equal(stickyTop(720, 1), 24)
    assert.equal(stickyTop(900, 0), 24)
  })

  it('kolom tepat selayar dikurangi 2 x offset: batas, tetap 24', () => {
    assert.equal(stickyTop(900, 900 - 48), 24)
  })

  it('kolom setinggi layar: top 24 - 24 - ... menjadi negatif -24 (dasar 24 dari dasar layar)', () => {
    assert.equal(stickyTop(900, 900), -24)
  })

  it('kolom lebih tinggi dari layar: top negatif = layar - tinggi - 24, dasar menempel 24 di atas dasar layar', () => {
    assert.equal(stickyTop(900, 1100), -224)
    assert.equal(stickyTop(720, 1000), -304)
    // posisi dasar kolom saat menempel = top + tinggi = layar - 24
    for (const [viewport, column] of [[900, 1100], [720, 1000], [768, 2000]] as const) {
      assert.equal(stickyTop(viewport, column) + column, viewport - STICKY_OFFSET)
    }
  })

  it('offset kustom', () => {
    assert.equal(stickyTop(900, 400, 10), 10)
    assert.equal(stickyTop(900, 1000, 10), -110)
  })

  it('tidak pernah di atas offset (kolom tidak menempel lebih jauh dari 24 px dari atas layar)', () => {
    for (let column = 0; column < 3000; column += 37) assert.ok(stickyTop(800, column) <= STICKY_OFFSET)
  })
})

describe('UX1b stickyTopForFocus (fokus keyboard selalu terlihat)', () => {
  // Kolom 1437 px di layar 900: stickyTop = 900 - 1437 - 24 = -561 (dasar menempel di 876).
  const vh = 900
  const colH = 1437
  const stuck = stickyTop(vh, colH)

  it('elemen sudah terlihat penuh (jarak 24 px dari tepi): tidak ada yang digeser', () => {
    assert.equal(stickyTopForFocus(vh, colH, stuck, 24, 60), null)
    assert.equal(stickyTopForFocus(vh, colH, stuck, 800, 876), null)
    assert.equal(stickyTopForFocus(vh, colH, stuck, 100, 500), null)
  })

  it('elemen di atas layar (kolom menempel dengan dasarnya): top dinaikkan sampai elemen terlihat 24 px dari atas', () => {
    // tautan di y -140 setinggi 40: perlu turun 164 px
    const next = stickyTopForFocus(vh, colH, stuck, -140, -100)
    assert.equal(next, stuck + 164)
    // posisi elemen setelah kolom bergeser
    assert.equal(-140 + (next! - stuck), STICKY_OFFSET)
  })

  it('elemen di bawah layar: top diturunkan sampai dasar elemen 24 px dari dasar layar', () => {
    const column = stuck + 400
    const next = stickyTopForFocus(vh, colH, column, 880, 920)
    assert.equal(next, column - 44)
    assert.equal(920 + (next! - column), vh - STICKY_OFFSET)
  })

  it('hasil selalu dalam [stickyTop, offset]', () => {
    for (let top = -800; top <= 1200; top += 17) {
      const next = stickyTopForFocus(vh, colH, stuck, top, top + 30)
      if (next === null) continue
      assert.ok(next >= stuck && next <= STICKY_OFFSET, `top ${top} -> ${next}`)
    }
  })

  it('elemen paling atas kolom: kolom turun ke offset, bukan lebih rendah', () => {
    // elemen pertama berjarak 0 dari atas kolom, kolom menempel di -561: elemen di -561
    assert.equal(stickyTopForFocus(vh, colH, stuck, stuck, stuck + 40), STICKY_OFFSET)
  })

  it('setelah digeser, elemen di tengah kolom terlihat penuh untuk semua posisi awal', () => {
    for (const [viewport, height] of [[900, 1437], [720, 1450], [768, 1450], [720, 869]] as const) {
      const base = stickyTop(viewport, height)
      // 30 elemen 40 px tersebar di kolom; kolom menempel di base atau diposisikan hasil geser sebelumnya
      for (let rel = 0; rel + 40 <= height; rel += 41) {
        let column = base
        const next = stickyTopForFocus(viewport, height, column, column + rel, column + rel + 40)
        if (next !== null) column = next
        const top = column + rel
        assert.ok(top >= STICKY_OFFSET && top + 40 <= viewport - STICKY_OFFSET, `${viewport}x${height} rel ${rel}: top ${top}`)
      }
    }
  })

  it('kolom pendek (top = offset): tidak pernah digeser dari offset', () => {
    assert.equal(stickyTopForFocus(900, 78, 24, -10, 20), 24)
    assert.equal(stickyTopForFocus(900, 78, 24, 890, 920), 24)
  })

  it('kolom belum menempel (posisi alami lebih rendah dari top): geser dihitung dari posisi sebenarnya', () => {
    // kolom alami di y 300, elemen di bawah layar y 880..920: perlu 256 (300 - 44), dibatasi ke offset karena tak pernah > 24 dari atas layar
    assert.equal(stickyTopForFocus(vh, colH, 300, 880, 920), STICKY_OFFSET)
    // kolom alami di y -20, elemen di bawah layar: top = -20 - 44
    assert.equal(stickyTopForFocus(vh, colH, -20, 880, 920), -64)
  })

  it('elemen lebih tinggi dari ruang tersedia: tepi atasnya didahulukan', () => {
    const next = stickyTopForFocus(300, 2000, -1700, -1700, -1000)
    assert.equal(next, STICKY_OFFSET)
  })

  it('ambang gulir pengembalian top', () => {
    assert.equal(STICKY_SCROLL_RESET, 8)
  })
})

describe('UX2 mergeArticles ("Lebih banyak")', () => {
  const card = (id: number) => ({ id, slug: `a-${id}`, title: `Berita ${id}` })

  it('menambahkan artikel baru di bawah yang lama, urutan terjaga', () => {
    const merged = mergeArticles([card(1), card(2)], [card(3), card(4)])
    assert.deepEqual(merged.map(item => item.id), [1, 2, 3, 4])
  })

  it('membuang duplikat berdasarkan id (yang lama dipertahankan)', () => {
    const old = { ...card(2), title: 'Lama' }
    const merged = mergeArticles([card(1), old], [{ ...card(2), title: 'Baru' }, card(3)])
    assert.deepEqual(merged.map(item => item.id), [1, 2, 3])
    assert.equal(merged[1]?.title, 'Lama')
  })

  it('membuang duplikat di dalam masukan baru sendiri', () => {
    assert.deepEqual(mergeArticles([card(1)], [card(2), card(2), card(3), card(2)]).map(item => item.id), [1, 2, 3])
  })

  it('semua duplikat = daftar tidak berubah; masukan kosong = tidak berubah', () => {
    assert.deepEqual(mergeArticles([card(1), card(2)], [card(1), card(2)]).map(item => item.id), [1, 2])
    assert.deepEqual(mergeArticles([card(1)], []).map(item => item.id), [1])
    assert.deepEqual(mergeArticles([], [card(5), card(6)]).map(item => item.id), [5, 6])
    assert.deepEqual(mergeArticles([], []), [])
  })

  it('tidak mengubah masukan dan mengembalikan larik baru', () => {
    const existing = [card(1)]
    const incoming = [card(2)]
    const merged = mergeArticles(existing, incoming)
    assert.notEqual(merged, existing)
    assert.equal(existing.length, 1)
    assert.equal(incoming.length, 1)
  })

  it('tiga "Lebih banyak" berturut-turut dengan tumpang tindih tidak menghasilkan duplikat', () => {
    const page = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, index) => card(from + index))
    let shown = page(1, 10)
    shown = mergeArticles(shown, page(10, 19)) // id 10 tumpang tindih (artikel baru terbit menggeser halaman)
    shown = mergeArticles(shown, page(19, 28))
    assert.equal(shown.length, 28)
    assert.equal(new Set(shown.map(item => item.id)).size, 28)
  })

  it('URL tautan "Lebih banyak" = halaman N+1 kategori (categoryPagePath)', () => {
    assert.equal(categoryPagePath('nasional', 2), '/kategori/nasional?halaman=2')
    assert.equal(categoryPagePath('nasional', 4), '/kategori/nasional?halaman=4')
  })
})

describe('UX3 putar otomatis hero', () => {
  const base: HeroAutoplayInput = { mounted: true, slideCount: 4, reducedMotion: false, hovering: false, focused: false, hidden: false }

  it('interval 5000 ms; animasi geser-kiri HERO_SLIDE_MS tetap dan lebih pendek dari interval', () => {
    assert.equal(HERO_AUTOPLAY_MS, 5000)
    assert.ok(HERO_SLIDE_MS < HERO_AUTOPLAY_MS)
  })

  it('berjalan hanya di klien, >= 2 slide, tanpa reduced-motion, tanpa hover/fokus/tab tersembunyi', () => {
    assert.equal(heroAutoplayStatus(base), 'running')
    assert.equal(heroAutoplayStatus({ ...base, slideCount: 2 }), 'running')
  })

  it('SSR/hidrasi (belum mount) = manual', () => {
    assert.equal(heroAutoplayStatus({ ...base, mounted: false }), 'manual')
  })

  it('kurang dari 2 slide = manual (tanpa timer)', () => {
    assert.equal(heroAutoplayStatus({ ...base, slideCount: 1 }), 'manual')
    assert.equal(heroAutoplayStatus({ ...base, slideCount: 0 }), 'manual')
  })

  it('reduced-motion = manual, mengalahkan semua keadaan lain', () => {
    assert.equal(heroAutoplayStatus({ ...base, reducedMotion: true }), 'manual')
    assert.equal(heroAutoplayStatus({ ...base, reducedMotion: true, hovering: true, focused: true, hidden: true }), 'manual')
  })

  it('hover, fokus, atau tab tersembunyi = dijeda (masing-masing cukup)', () => {
    assert.equal(heroAutoplayStatus({ ...base, hovering: true }), 'paused')
    assert.equal(heroAutoplayStatus({ ...base, focused: true }), 'paused')
    assert.equal(heroAutoplayStatus({ ...base, hidden: true }), 'paused')
    assert.equal(heroAutoplayStatus({ ...base, hovering: true, focused: true, hidden: true }), 'paused')
  })

  it('aria-live: off selama berputar, polite saat dijeda atau manual', () => {
    assert.equal(heroLiveMode('running'), 'off')
    assert.equal(heroLiveMode('paused'), 'polite')
    assert.equal(heroLiveMode('manual'), 'polite')
    assert.equal(heroLiveMode(heroAutoplayStatus({ ...base, reducedMotion: true })), 'polite')
  })

  it('slide berikutnya berputar 1 > 2 > 3 > 4 > 1', () => {
    assert.deepEqual([0, 1, 2, 3].map(index => nextHeroSlide(index, 4)), [1, 2, 3, 0])
    assert.equal(nextHeroSlide(0, 2), 1)
    assert.equal(nextHeroSlide(1, 2), 0)
    assert.equal(nextHeroSlide(0, 1), 0)
    assert.equal(nextHeroSlide(0, 0), 0)
  })

  it('penjaga sumber: timer dibersihkan saat unmount, event dilepas, hanya di klien (onMounted), jeda hover/fokus/visibilitas', () => {
    const hero = source('app/components/home/Hero.vue')
    assert.match(hero, /onBeforeUnmount\(\(\) => \{[\s\S]*stopAutoplay\(\)[\s\S]*removeEventListener\('visibilitychange'/)
    assert.match(hero, /onMounted\(\(\) => \{[\s\S]*mounted\.value = true/)
    assert.match(hero, /addEventListener\('visibilitychange'/)
    assert.match(hero, /@pointerenter="onPointerEnter"/)
    assert.match(hero, /@focusin="onFocusIn"/)
    assert.match(hero, /:aria-live="liveMode"/)
    assert.match(hero, /setTimeout\(\(\) => select\(nextHeroSlide\(/)
    assert.match(hero, /@click="onDotClick\(index\)"/)
  })
})

describe('UX4 halaman kategori: kolom kanan dan "Lebih banyak" (penjaga sumber)', () => {
  const page = source('app/pages/kategori/[slug].vue')
  const template = page.slice(page.indexOf('<template>'), page.indexOf('</template>\n\n<style'))

  it('tanpa tab Terbaru | Terpopuler dan tanpa h2 "Terbaru dan Terpopuler"', () => {
    assert.equal(page.includes('HomeSidebarTabs'), false)
    assert.equal(page.includes('Terbaru dan Terpopuler'), false)
    assert.equal(page.includes('sidebar.latest'), false)
  })

  it('kolom kanan: widget sosial, Trending (dari sidebar.popular), lalu iklan; urutan sama di mobile (satu DOM, hanya iklan yang berganti)', () => {
    assert.match(template, /<HomeSocialWidget \/>\s*<HomeTrendingList v-if="sidebar" :articles="sidebar\.popular" :now="sidebar\.now" \/>\s*<div class="ads ads--desktop">/)
    assert.ok(template.indexOf('ads--mobile') > template.indexOf('ads--desktop'))
  })

  it('tidak lagi memakai CategoryPagination; memakai CategoryLoadMore dan daftar `shown`', () => {
    assert.equal(page.includes('CategoryPagination'), false)
    assert.match(template, /<CategoryLoadMore[\s\S]*:loaded-page="loadedPage"[\s\S]*@loaded="onLoaded"/)
    assert.match(template, /v-for="\(article, index\) in shown"/)
  })

  it('daftar tambahan dibuang saat data rute berubah', () => {
    assert.match(page, /watch\(data, \(value\) => \{\s*shown\.value = \[\.\.\.\(value\?\.articles \?\? \[\]\)\]\s*loadedPage\.value = value\?\.pagination\.page \?\? 1/)
  })

  it('Trending: komponen baru tanpa API baru, tidak dirender bila kosong, judul h2 dari HomeSectionTitle tanpa tautan "Lainnya"', () => {
    const trending = source('app/components/home/TrendingList.vue')
    assert.match(trending, /<section v-if="articles\.length"/)
    assert.match(trending, /<HomeSectionTitle title="Trending" \/>/)
    assert.equal(trending.includes('more-to'), false)
    assert.match(trending, /layout="compact"/)
    assert.equal(/\$fetch|useFetch|useAsyncData/.test(trending), false)
  })

  it('LoadMore: tautan <a> ke ?halaman=N+1 rel=next, dicegat hanya klik tanpa modifier, aria-busy, status role=status, tanpa v-html', () => {
    const component = source('app/components/category/LoadMore.vue')
    assert.match(component, /<a\s+:href="href"\s+rel="next"/)
    assert.match(component, /categoryPagePath\(props\.slug \?\? '', nextPage\.value\)/)
    assert.match(component, /event\.button !== 0 \|\| event\.metaKey \|\| event\.ctrlKey \|\| event\.shiftKey \|\| event\.altKey/)
    assert.match(component, /:aria-busy="loading"/)
    assert.match(component, /role="status"/)
    assert.match(component, /role="alert"/)
    assert.match(component, /Gagal memuat berita\. Coba lagi\./)
    assert.match(component, /if \(loading\.value\) return/)
    assert.equal(/v-html=/.test(component), false)
    assert.equal(/<button/.test(component), false)
  })

  it('LoadMore: gaya dari token saja (tanpa warna literal), isi --color-brand teks putih, tinggi >= 44', () => {
    const component = source('app/components/category/LoadMore.vue')
    const css = stripComments(component.slice(component.indexOf('<style')))
    assert.match(css, /background: var\(--color-brand\)/)
    assert.match(css, /color: var\(--color-white\)/)
    assert.match(css, /min-height: 44px/)
    assert.equal(/#[0-9a-fA-F]{3,8}\b/.test(css), false)
  })

  it('v-html= tepat satu baris di seluruh app (ArticleBody)', () => {
    const files = [
      'app/components/category/LoadMore.vue', 'app/components/home/TrendingList.vue', 'app/components/home/Hero.vue',
      'app/components/home/SectionTitle.vue', 'app/pages/index.vue', 'app/pages/berita/[slug].vue', 'app/pages/kategori/[slug].vue'
    ]
    for (const file of files) assert.equal(/v-html=/.test(source(file)), false, file)
    assert.equal((source('app/components/article/ArticleBody.vue').match(/v-html=/g) ?? []).length, 1)
  })
})

describe('UX5 "Lainnya" lebih besar dari Figma, lebih kecil dari judul (penjaga sumber)', () => {
  const title = source('app/components/home/SectionTitle.vue')
  const css = stripComments(title.slice(title.indexOf('<style')))

  it('mobile 14 px dan desktop 16 px, panah 14 dan 16; judul 19,2 dan 23,04 (token) tetap lebih besar', () => {
    assert.match(css, /\.more \{[^}]*font: 500 14px\/normal var\(--font-sans\)/)
    assert.match(css, /@media \(min-width: 1024px\) \{[\s\S]*\.more \{[^}]*font: 400 16px\/normal var\(--font-sans\)/)
    assert.match(css, /\.more-arrow \{[^}]*width: 14px;[^}]*height: 14px/)
    assert.match(css, /\.more-arrow \{[^}]*width: 16px;[^}]*height: 16px/)
    assert.match(css, /font: var\(--type-heading-mobile\)/)
    assert.match(css, /font: var\(--type-heading-desktop\)/)
    const tokens = source('app/assets/css/tokens.css')
    assert.match(tokens, /--type-heading-mobile: 600 19\.2px/)
    assert.match(tokens, /--type-heading-desktop: 600 23\.04px/)
  })

  it('kotak tautan >= 24 px tinggi dan diratakan tengah', () => {
    assert.match(css, /\.more \{[^}]*height: 24\.96px/)
    assert.match(css, /\.more \{[^}]*align-items: center/)
    assert.match(css, /\.more \{[^}]*right: 0/)
  })
})

describe('UX6 sticky kolom kanan hanya >= 1024 (penjaga sumber)', () => {
  const cases: [string, string, string][] = [
    ['Beranda .side-ads', 'app/pages/index.vue', '.side-ads'],
    ['Beranda .section-ad', 'app/pages/index.vue', '.section-ad'],
    ['Detail .sidebar-col', 'app/pages/berita/[slug].vue', '.sidebar-col'],
    ['kategori .secondary', 'app/pages/kategori/[slug].vue', '.secondary']
  ]

  for (const [name, file, selector] of cases) {
    it(`${name}: position sticky + top token hanya di dalam @media (min-width: 1024px); composable terpasang`, () => {
      const page = source(file)
      const css = stripComments(page.slice(page.indexOf('<style')))
      const media = css.slice(css.indexOf('@media (min-width: 1024px)'))
      assert.ok(media.length > 0)
      const escaped = selector.replace('.', '\\.')
      const inMedia = new RegExp(`${escaped} \\{[^}]*position: sticky;[^}]*top: var\\(--space-24\\)`)
      assert.match(media, inMedia)
      // di luar blok desktop (sebelum @media 1024) tidak ada sticky
      const before = css.slice(0, css.indexOf('@media (min-width: 1024px)'))
      assert.equal(/position: sticky/.test(before), false)
      assert.match(page, /useStickyColumn\(/)
    })
  }

  it('Beranda: tab Terbaru | Terpopuler (.sidebar di .top) tidak ditempel', () => {
    const css = stripComments(source('app/pages/index.vue').slice(source('app/pages/index.vue').indexOf('<style')))
    assert.equal(/\.sidebar[^{]*\{[^}]*position: sticky/.test(css), false)
  })

  it('composable memakai ResizeObserver dan resize, dan membersihkannya', () => {
    const composable = source('app/composables/useStickyColumn.ts')
    assert.match(composable, /new ResizeObserver\(update\)/)
    assert.match(composable, /addEventListener\('resize', update\)/)
    assert.match(composable, /observer\.disconnect\(\)/)
    assert.match(composable, /removeEventListener\('resize', update\)/)
    assert.match(composable, /onBeforeUnmount\(\(\) => cleanup\?\.\(\)\)/)
  })

  it('composable menjaga fokus keyboard terlihat: focusin/focusout/scroll dipasang dan dibersihkan, tanpa transisi', () => {
    const composable = source('app/composables/useStickyColumn.ts')
    for (const type of ['focusin', 'focusout']) {
      assert.ok(composable.includes(`element.addEventListener('${type}'`), type)
      assert.ok(composable.includes(`element.removeEventListener('${type}'`), type)
    }
    assert.ok(composable.includes("window.addEventListener('scroll', onScroll, { passive: true })"))
    assert.ok(composable.includes("window.removeEventListener('scroll', onScroll)"))
    assert.ok(composable.includes('cancelAnimationFrame(frame)'))
    assert.equal(/transition|animation|scrollIntoView|scrollTo\(/.test(composable.replace(/\/\/.*$/gm, '')), false)
  })
})
