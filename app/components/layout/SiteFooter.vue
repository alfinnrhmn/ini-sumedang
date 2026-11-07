<script setup lang="ts">
import { FOOTER_COMPANY, FOOTER_LEGAL, FOOTER_SECTIONS, FOOTER_TAGLINE, FOOTER_YEAR } from '~/config/footer'
import type { FooterSection } from '~/config/footer'

// Footer. Desktop >= 1024: tiga kolom terbuka; di bawah 1024: tiga baris akordeon. Keduanya dirender di HTML server,
// yang tak dipakai di-display:none. Kolom Kategori = SEMUA kategori WordPress (useCategories), bukan FOOTER_SECTIONS.
const uid = useId()
const open = ref<Record<string, boolean>>({})

const categories = useCategories()
const sections = computed<FooterSection[]>(() => FOOTER_SECTIONS.flatMap((section) => {
  if (section.id !== 'kategori') return [section]
  return categories.value.length
    ? [{ ...section, links: categories.value.map(category => ({ label: category.name, slug: category.slug, to: categoryPath(category.slug) })) }]
    : []
}))

function toggle(id: string) {
  open.value[id] = !open.value[id]
}

// Pemisah legal: dua spasi di kedua sisi "•" seperti teks Figma (white-space: pre-wrap pada .legal-text).
const SEPARATOR = '  •  '
</script>

<template>
  <footer class="footer">
    <!-- Desktop -->
    <div class="desktop">
      <div class="top">
        <img
          class="logo"
          src="/images/inisumedang-logo-footer.png"
          alt="IniSumedang.Com"
          width="180"
          height="36"
        >
        <p class="tagline">
          {{ FOOTER_TAGLINE }}
        </p>
        <LayoutFooterSocial show-label class="social-d" />
      </div>
      <div class="columns">
        <section v-for="section in sections" :key="section.id" :class="`col col-${section.id}`">
          <h2 class="col-title">
            {{ section.title }}
          </h2>
          <ul class="list">
            <li v-for="link in section.links" :key="link.slug ?? link.label">
              <LayoutFooterLabel :link="link" />
            </li>
          </ul>
        </section>
      </div>
      <div class="legal-d">
        <p class="legal-text"><span>© {{ FOOTER_YEAR }} {{ FOOTER_COMPANY }}</span><template v-for="item in FOOTER_LEGAL" :key="item.label"><span aria-hidden="true">{{ SEPARATOR }}</span><LayoutFooterLabel :link="item" /></template></p>
      </div>
    </div>

    <!-- Mobile -->
    <div class="mobile">
      <div class="m-inner">
        <div class="m-brand">
          <img
            class="logo"
            src="/images/inisumedang-logo-footer.png"
            alt="IniSumedang.Com"
            width="180"
            height="36"
          >
          <p class="tagline">
            {{ FOOTER_TAGLINE }}
          </p>
        </div>
        <LayoutFooterSocial />
        <ul class="accordion">
          <li v-for="section in sections" :key="section.id" class="acc-item">
            <h2 class="acc-title">
              <button
                :id="`${uid}-btn-${section.id}`"
                type="button"
                class="acc-button"
                :aria-expanded="open[section.id] ? 'true' : 'false'"
                :aria-controls="`${uid}-panel-${section.id}`"
                @click="toggle(section.id)"
              >
                <span class="acc-label">{{ section.title }}</span>
                <img
                  class="acc-arrow"
                  :class="{ 'acc-arrow--open': open[section.id] }"
                  src="/icons/arrow-right.svg"
                  alt=""
                  width="13"
                  height="13"
                >
              </button>
            </h2>
            <ul
              :id="`${uid}-panel-${section.id}`"
              class="acc-panel"
              :hidden="!open[section.id]"
            >
              <li v-for="link in section.links" :key="link.slug ?? link.label">
                <LayoutFooterLabel :link="link" />
              </li>
            </ul>
          </li>
        </ul>
      </div>
      <div class="legal-m">
        <p class="legal-text"><span>© {{ FOOTER_YEAR }} {{ FOOTER_COMPANY }}</span><template v-for="item in FOOTER_LEGAL" :key="item.label"><span aria-hidden="true">{{ SEPARATOR }}</span><LayoutFooterLabel :link="item" /></template></p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  margin-top: var(--space-32); /* mobile: jarak ke konten sebelumnya tidak ada di Figma, dipakai skala 32 */
  color: var(--color-footer-link);
}

ul {
  margin: 0;
  padding: 0;
  list-style: none;
}

.tagline {
  font: var(--type-caption);
  color: var(--color-footer-muted);
}

.legal-text {
  font: var(--type-metadata);
  color: var(--color-footer-muted);
  white-space: pre-wrap;
}

.logo {
  object-fit: cover;
}

/* Tautan footer (kategori, Beranda): hover dan kategori aktif = garis bawah (pola kartu/breadcrumb, tanpa token baru).
   Aktif hanya untuk tautan kategori: penanda otomatis "Beranda" di Beranda tidak diberi gaya. */
@media (hover: hover) {
  .footer a:hover {
    text-decoration: underline;
  }
}

.footer a[data-category][aria-current="page"] {
  text-decoration: underline;
}

/* Area klik tautan footer 24 px (FooterLabel). Daftar kategori desktop rapat (jarak 1 baris = 18,67 px < 24): area klik
   dibatasi setinggi satu baris (1lh) agar tidak saling menimpa; 24 px penuh butuh jarak lebih besar (ubah tampilan). */
.col-kategori .list a::after {
  height: 1lh;
}

/* ---------- Mobile ---------- */
.desktop {
  display: none;
}

.mobile {
  border-top: 1px solid var(--color-footer-divider-mobile);
  padding-top: var(--space-8);
  padding-bottom: var(--space-8);
}

.m-inner {
  width: 100%;
  max-width: calc(var(--container-mobile) + 2 * var(--space-16)); /* konten 354 (tagline), gutter 16 di layar sempit */
  margin: 0 auto;
  padding: 0 var(--space-16);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-32);
}

.m-brand {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  width: 100%;
  text-align: center;
}

.m-brand .logo {
  width: 180px; /* logo 180 x 36 */
  height: 36px;
  margin: 10px; /* padding 10 (blok 200 x 56) */
}

.m-brand .tagline {
  max-width: 354px;
}

.accordion {
  width: 100%;
  max-width: 320px;
}

.acc-item {
  border-top: 1px solid var(--color-footer-divider-mobile);
}

.acc-item:last-child {
  border-bottom: 1px solid var(--color-footer-divider-mobile);
}

.acc-button {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin: 0;
  padding: var(--space-8) 0;
  border: 0;
  background: none;
  font: var(--type-footer-heading-mobile);
  color: var(--color-brand);
  text-align: left;
  cursor: pointer;
}

.acc-label {
  display: flex;
  align-items: center;
  min-height: 26px; /* tinggi 26 (baris 43/44/43) */
}

.acc-arrow {
  flex: none;
  transition: transform 0.2s ease;
}

.acc-arrow--open {
  transform: rotate(90deg);
}

/* Isi akordeon tidak digambar di Figma: gaya tautan footer desktop (13,333 / 18,666), jarak antar item 8 */
.acc-panel {
  display: grid;
  gap: var(--space-8);
  padding-bottom: var(--space-16);
  font: var(--type-caption);
  color: var(--color-footer-link);
}

.acc-panel[hidden] {
  display: none;
}

.legal-m {
  margin-top: 52px;
  min-height: 49px; /* garis 1 + jarak 8 + teks 2 baris */
  border-top: 1px solid var(--color-footer-divider); /* lebar penuh 402 */
  padding: var(--space-8) var(--space-24) 0;
  text-align: center;
}

.legal-m .legal-text {
  max-width: var(--container-mobile);
  margin: 0 auto;
}

/* ---------- Desktop (1119 x 270) ---------- */
@media (min-width: 1024px) {
  .footer {
    margin-top: 163px; /* 187 (kartu terakhir berakhir y 6781, footer y 6968) dikurangi padding bawah halaman 24 */
  }

  .mobile {
    display: none;
  }

  .desktop {
    display: block;
    width: 100%;
    max-width: calc(var(--container-desktop) + 2 * var(--space-24));
    margin: 0 auto;
    padding: 0 var(--space-24);
  }

  .top {
    display: flex;
    align-items: flex-start;
    height: 74px; /* garis di y 73 (tinggi 1) */
    border-bottom: 1px solid var(--color-footer-divider);
  }

  .top .logo {
    flex: none;
    width: 180px;
    height: 36px;
    margin-top: 18px;
  }

  .tagline {
    flex: 0 1 390px;
    margin: 23px 0 0 25px; /* x 205 (180 + 25), y 23, lebar 390 */
  }

  .social-d {
    flex: none;
    margin: 10px 6px 0 auto; /* y 10; ikon berakhir x 1113 dari 1119 */
  }

  .columns {
    display: grid;
    grid-template-columns: 230px 265px 1fr; /* kolom di x 0, 230, 495 */
    align-items: start; /* kolom Navigasi, Kategori, Tentang sejajar atas; hanya Kategori (9 item) lebih tinggi */
    min-height: 152px; /* garis legal di y 226; kolom Kategori satu kolom lebih tinggi, jadi footer melebihi 270 */
    padding-top: var(--space-24); /* judul kolom y 98 setelah garis y 74 */
    padding-bottom: 25px; /* item terakhir kolom terpanjang ke garis legal (±201 ke y 226); 25 di luar skala */
  }

  .col-title {
    font: var(--type-body);
    color: var(--color-brand);
  }

  .list {
    margin-top: 2.4px; /* daftar y 126, judul berakhir y 123,6 */
    font: var(--type-caption);
  }

  .legal-d {
    min-height: 44px; /* y 226 sampai dasar 270 */
    border-top: 1px solid var(--color-footer-divider);
    padding-top: 13px; /* teks legal y 240, garis y 226 + 1 */
  }
}
</style>
