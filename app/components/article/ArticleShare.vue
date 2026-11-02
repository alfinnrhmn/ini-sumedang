<script setup lang="ts">
// Bagikan artikel (desktop 127:2160, mobile 130:3392). Hanya Facebook, X (tautan bagikan resmi, tanpa SDK) dan Salin tautan
// (Clipboard API). Instagram (tanpa URL bagikan web) dan WhatsApp (tidak ada di Figma) tidak dirender; dicatat untuk pemilik.
// Nama layer Figma tidak cocok dengan ikon (mis. "Tombol Salin tautan" berisi Facebook): ikon dan pernyataan pemilik yang dipakai.
const props = defineProps<{
  /** URL kanonis artikel (origin permintaan + /berita/<slug>). */
  url: string
  title: string
}>()

const facebookHref = computed(() => facebookShareUrl(props.url))
const xHref = computed(() => xShareUrl(props.url, props.title))

// Umpan balik salin: satu elemen status (aria-live) yang selalu ada di DOM, teks diisi saat tombol ditekan lalu dikosongkan.
const message = ref('')
let timer: ReturnType<typeof setTimeout> | undefined

async function copy() {
  try {
    await navigator.clipboard.writeText(props.url)
    message.value = 'Tautan disalin'
  } catch {
    message.value = 'Tidak dapat menyalin tautan'
  }
  clearTimeout(timer)
  timer = setTimeout(() => {
    message.value = ''
  }, 3000)
}

onBeforeUnmount(() => clearTimeout(timer))

const labelId = useId()
</script>

<template>
  <div class="share">
    <div class="rule" aria-hidden="true" />
    <div class="row" role="group" :aria-labelledby="labelId">
      <p :id="labelId" class="label">
        Bagikan artikel
      </p>
      <a
        class="tile tile--facebook"
        :href="facebookHref"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Bagikan ke Facebook"
      >
        <img class="icon" src="/icons/share-facebook.svg" alt="" width="32" height="32">
      </a>
      <a
        class="tile tile--x"
        :href="xHref"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Bagikan ke X"
      >
        <img class="icon" src="/icons/share-x.svg" alt="" width="32" height="32">
      </a>
      <button type="button" class="tile tile--copy" aria-label="Salin tautan" @click="copy">
        <img class="icon icon--copy" src="/icons/share-copy.svg" alt="" width="23" height="29">
      </button>
      <p class="status" :class="{ 'status--idle': !message }" role="status" aria-live="polite">
        {{ message }}
      </p>
    </div>
  </div>
</template>

<style scoped>
/* Mobile 130:3392: pemisah 1 px, jarak 16, baris 55 */
.share {
  display: flex;
  flex-direction: column;
  gap: var(--space-16); /* 130:3392 */
  padding-bottom: 15px; /* 127:2160 / 130:3392 tinggi 87 = 1 + 16 + 55 + 15 */
}

/* Pemisah 130:3393 #DEE3EB -> --color-footer-divider (#E5E7EB, selisih 7/4/0) */
.rule {
  height: 1px;
  background: var(--color-footer-divider);
}

/* Baris 130:3394: celah 11 (mobile), 16 (desktop 127:2162), tinggi 55 */
.row {
  position: relative;
  display: flex;
  align-items: center;
  gap: 11px; /* 130:3394 */
  height: 55px;
}

/* Label 130:3395: Inter SemiBold 14/21 #1A212E, lebar 120 */
.label {
  flex: none;
  width: 120px;
  font: 600 14px/21px var(--font-sans);
  color: var(--color-article-title);
}

/* Tombol 130:3396: 44x40 radius 6 (mobile); latar Figma per tombol dipetakan ke token (selisih di bawah) */
.tile {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: none;
  width: 44px; /* 130:3396 */
  height: 40px; /* 130:3400 (tombol pertama 39, lainnya 40) */
  padding: 0;
  border: 0;
  border-radius: var(--radius-6);
  cursor: pointer;
}

/* Facebook #D4E0F2: tak ada token dalam 4 level (terdekat --color-footer-divider, selisih 17/7/7) */
.tile--facebook {
  background: var(--color-footer-divider);
}

/* X #D5D5D5 = --color-footer-divider-mobile (sama persis) */
.tile--x {
  background: var(--color-footer-divider-mobile);
}

/* Salin #E3E3E3 -> --color-gray-5 (#E0E0E0, selisih 3/3/3) */
.tile--copy {
  background: var(--color-gray-5);
}

.icon {
  display: block;
  width: 24px; /* 130:3397 */
  height: 24px;
}

/* Ikon salin 130:3411: kotak 24 dengan ikon 18x22 di tengah (berkas desktop 23,33x28,67 diskalakan 18/23,33) */
.icon--copy {
  width: 18px;
  height: 22px;
}

/* Umpan balik: gelembung kecil di bawah baris (tidak menggeser tata letak); kosong = tidak terlihat tetapi tetap ada untuk pembaca layar */
.status {
  position: absolute;
  left: 0;
  top: calc(100% - 4px);
  z-index: 1;
  padding: 4px var(--space-8);
  border-radius: var(--radius-6);
  background: var(--color-black-2);
  color: var(--color-white);
  font: var(--type-caption);
  white-space: nowrap;
  pointer-events: none;
}

.status--idle {
  opacity: 0;
}

@media (min-width: 1024px) {
  .row {
    gap: var(--space-16); /* 127:2162 */
  }

  .tile {
    width: 60px; /* 127:2164 */
    height: 54px;
  }

  .icon {
    width: 32px; /* 130:2371 */
    height: 32px;
  }

  .icon--copy {
    width: 23.333px; /* 130:2392 (berkas) */
    height: 28.667px;
  }
}
</style>
