<script setup lang="ts">
import type { Article } from '~/types/article'

const props = defineProps<{
  latest: Article[]
  /** Kosong: tab Terpopuler tidak dirender (PRD §3.6: tidak diisi "terbaru"). */
  popular: Article[]
  /** Waktu server (ISO) untuk waktu relatif. */
  now: string
}>()

// Tab Terpopuler hanya ada bila ada artikelnya. Kedua panel dirender di server; panel nonaktif `hidden`.
const tabs = computed(() => [
  { key: 'latest', label: 'Terbaru', articles: props.latest },
  ...(props.popular.length ? [{ key: 'popular', label: 'Terpopuler', articles: props.popular }] : [])
])

// Tab tunggal (tanpa populer): label tidak boleh menyebut "terpopuler".
const listLabel = computed(() => (props.popular.length ? 'Berita terbaru dan terpopuler' : 'Berita terbaru'))

const uid = useId()
const selected = ref(0)
const active = computed(() => Math.min(selected.value, tabs.value.length - 1))
const tabEls: (HTMLElement | null)[] = []

// Pola tab APG dengan aktivasi otomatis: panah kiri/kanan (berputar), Home, End; fokus ikut berpindah.
function onKeydown(event: KeyboardEvent) {
  if (event.altKey || event.ctrlKey || event.metaKey) return
  const count = tabs.value.length
  let next: number
  switch (event.key) {
    case 'ArrowRight': next = (active.value + 1) % count; break
    case 'ArrowLeft': next = (active.value - 1 + count) % count; break
    case 'Home': next = 0; break
    case 'End': next = count - 1; break
    default: return
  }
  event.preventDefault()
  selected.value = next
  tabEls[next]?.focus()
}
</script>

<template>
  <div
    class="tabs"
    :class="{ 'tabs--multi': tabs.length > 1 }"
    :style="{ '--tab-count': tabs.length, '--tab-index': active }"
  >
    <div class="tablist" role="tablist" :aria-label="listLabel" @keydown="onKeydown">
      <button
        v-for="(tab, index) in tabs"
        :id="`${uid}-tab-${tab.key}`"
        :key="tab.key"
        :ref="(el) => { tabEls[index] = el as HTMLElement | null }"
        type="button"
        role="tab"
        class="tab"
        :aria-selected="active === index"
        :aria-controls="`${uid}-panel-${tab.key}`"
        :tabindex="active === index ? 0 : -1"
        @click="selected = index"
      >
        {{ tab.label }}
      </button>
    </div>
    <div class="track" aria-hidden="true">
      <span class="accent" />
    </div>
    <div
      v-for="(tab, index) in tabs"
      :id="`${uid}-panel-${tab.key}`"
      :key="tab.key"
      class="panel"
      role="tabpanel"
      tabindex="0"
      :aria-labelledby="`${uid}-tab-${tab.key}`"
      :hidden="active !== index"
    >
      <ul class="list">
        <li v-for="article in tab.articles" :key="article.id">
          <NewsCard :article="article" :now="now" layout="compact" />
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.tablist {
  display: flex;
}

/* Tab 84:1177 / 90:2160: padding 10, teks News/Card/Headline/Desktop 19,2/26,88; warna teks sama untuk kedua tab */
.tab {
  flex: 1 1 0;
  padding: 10px;
  border: 0;
  background: none;
  font: var(--type-card-headline-desktop);
  color: var(--color-black);
  cursor: pointer;
}

.tab:focus-visible {
  outline-offset: -2px; /* sel tab saling menempel: cincin fokus di dalam sel */
}

/* Garis dasar 130:2195 (3 px) dan garis aksen 26:275 (3 px, lebar separuh); Figma #D9D9D9 -> --color-gray-5 (keputusan PM 14) */
.track {
  height: 3px;
  background: var(--color-gray-5);
}

.accent {
  display: block;
  width: calc(100% / var(--tab-count));
  height: 3px;
  background: var(--color-brand);
  transform: translateX(calc(var(--tab-index) * 100%)); /* bergeser dengan transform, bukan left */
  transition: transform 0.25s ease; /* [I] durasi tidak ada di Figma */
}

@media (prefers-reduced-motion: reduce) {
  .accent {
    transition: none;
  }
}

/* Daftar 34:354 / 90:2164: celah antar item 22 (482 = 4 x 104 + 3 x 22); jarak tab ke daftar 16 (211 ke 227) */
.panel {
  margin-top: var(--space-16);
}

.list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(var(--container-mobile), 100%), 1fr));
  gap: 22px var(--space-24);
  margin: 0;
  padding: 0;
  list-style: none;
}

@media (min-width: 1024px) {
  /* 130:2202: dua tab terpusat, celah 62 (p-10 tiap tab); tab tunggal tetap memenuhi lebar */
  .tabs--multi .tablist {
    justify-content: center;
    gap: 62px;
  }

  .tabs--multi .tab {
    flex: none;
  }

  .list {
    grid-template-columns: minmax(0, 1fr);
    margin-inline-start: 5px; /* daftar 34:354 mulai x 928, tab 130:2202 x 923 */
  }
}
</style>
