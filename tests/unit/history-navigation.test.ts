// Uji unit navigasi riwayat (Back/Forward) dan ingatan gulir paginasi; penjaga sumber: `:hover` hanya di
// `@media (hover: hover)` dan pelacak dipakai di halaman kategori. Pelari: `node:test` (`npm test`).
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createHistoryNavigationTracker, recalledScroll, rememberScroll } from '../../app/utils/focus.ts'

describe('HN1 pelacak navigasi riwayat', () => {
  it('awalnya bukan pop', () => {
    assert.equal(createHistoryNavigationTracker().lastWasPop, false)
  })

  it('navigasi maju (tanpa popstate) = bukan pop', () => {
    const tracker = createHistoryNavigationTracker()
    tracker.settle()
    assert.equal(tracker.lastWasPop, false)
  })

  it('popstate lalu navigasi selesai = pop; tetap pop sampai navigasi berikutnya selesai', () => {
    const tracker = createHistoryNavigationTracker()
    tracker.markPop()
    assert.equal(tracker.lastWasPop, false, 'belum selesai: belum dinilai')
    tracker.settle()
    assert.equal(tracker.lastWasPop, true)
    assert.equal(tracker.lastWasPop, true, 'tetap pop saat halaman dipasang atau data tiba kemudian')
  })

  it('navigasi maju setelah Back = bukan pop (tanda tidak bocor)', () => {
    const tracker = createHistoryNavigationTracker()
    tracker.markPop()
    tracker.settle()
    tracker.settle()
    assert.equal(tracker.lastWasPop, false)
  })

  it('beberapa popstate beruntun sebelum selesai = satu navigasi pop', () => {
    const tracker = createHistoryNavigationTracker()
    tracker.markPop()
    tracker.markPop()
    tracker.settle()
    assert.equal(tracker.lastWasPop, true)
    tracker.settle()
    assert.equal(tracker.lastWasPop, false)
  })

  it('pelacak terpisah tidak saling memengaruhi', () => {
    const a = createHistoryNavigationTracker()
    const b = createHistoryNavigationTracker()
    a.markPop()
    a.settle()
    b.settle()
    assert.equal(a.lastWasPop, true)
    assert.equal(b.lastWasPop, false)
  })
})

describe('HN2 ingatan gulir per URL', () => {
  it('URL yang belum pernah ditinggalkan = tidak ada', () => {
    assert.equal(recalledScroll('/kategori/tidak-pernah?halaman=9'), undefined)
  })

  it('menyimpan dan menimpa per URL penuh (query ikut)', () => {
    rememberScroll('/kategori/hukum?halaman=2', 700)
    rememberScroll('/kategori/hukum', 120)
    assert.equal(recalledScroll('/kategori/hukum?halaman=2'), 700)
    assert.equal(recalledScroll('/kategori/hukum'), 120)
    rememberScroll('/kategori/hukum?halaman=2', 0)
    assert.equal(recalledScroll('/kategori/hukum?halaman=2'), 0, 'nol adalah posisi sah, bukan "tidak ada"')
  })
})

describe('HN3 penjaga sumber', () => {
  const read = (path: string) => readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8').replace(/\r\n/g, '\n')

  // Blok CSS `selector { ... }` pertama yang memuat `selector` persis; kembalikan teks blok.
  function rulesMatching(css: string, needle: string): string[] {
    return css.split('}').filter(chunk => chunk.includes(needle)).map(chunk => chunk.trim())
  }

  for (const file of ['app/components/layout/CategoryMenu.vue', 'app/components/layout/CategoryDrawer.vue']) {
    it(`${file}: aria-current di luar @media, :hover hanya di dalam @media (hover: hover) (L1)`, () => {
      const source = read(file)
      const style = source.slice(source.indexOf('<style'))
      const hoverIndex = style.indexOf('a.item:hover')
      const mediaIndex = style.indexOf('@media (hover: hover)')
      assert.ok(mediaIndex > -1, 'ada @media (hover: hover)')
      assert.ok(hoverIndex > mediaIndex, ':hover berada setelah pembuka @media (hover: hover)')
      assert.equal(style.split('a.item:hover').length - 1, 1, ':hover tepat sekali')
      // Pemilih aktif berdiri sendiri, tidak digabung dengan :hover dan berada sebelum @media (hover: hover)
      const activeIndex = style.indexOf('a.item[aria-current="page"]')
      assert.ok(activeIndex > -1 && activeIndex < mediaIndex)
      const activeRule = rulesMatching(style.slice(activeIndex), 'a.item[aria-current="page"]')[0] ?? ''
      assert.ok(!activeRule.slice(0, activeRule.indexOf('{')).includes(':hover'), 'aktif tidak digabung dengan :hover')
    })
  }

  it('halaman kategori memakai pelacak navigasi riwayat dan tidak lagi menggulir/memindah fokus tanpa syarat', () => {
    const source = read('app/pages/kategori/[slug].vue')
    assert.ok(source.includes('trackHistoryNavigation('))
    assert.ok(source.includes('historyNav.lastWasPop'))
    assert.ok(source.includes('onBeforeRouteUpdate('))
    // enterPage hanya dipanggil di dalam kondisi (onMounted dan watch), tidak di tingkat atas setup
    const calls = source.split('enterPage()').length - 1
    assert.equal(calls, 3, 'definisi + 2 pemanggilan bersyarat')
  })
})
