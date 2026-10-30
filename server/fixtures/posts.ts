/**
 * Fixture berbentuk respons REST WordPress v2 (posts?_embed). Tanggal relatif terhadap `now`.
 * Dua set: `figma` (default; meniru kartu Rekomendasi di Figma 21:4950) dan `edge` (kasus buruk:
 * judul panjang/pendek, tanpa gambar, gambar tanpa alt, entitas HTML, kategori ber-entitas,
 * kategori kosong, dan artikel draft/private yang tidak boleh tampil).
 * Gambar di public/fixtures/ berasal dari Figma, hanya untuk pengembangan, WAJIB dihapus
 * sebelum situs tayang (PRD §13).
 */
export interface WpTerm { id: number, slug: string, name: string }
export interface WpMedia { source_url: string, alt_text: string, media_details: { width: number, height: number } }
export interface WpPost {
  id: number
  slug: string
  status: string
  date_gmt: string
  title: { rendered: string }
  _embedded: {
    'wp:term': WpTerm[][]
    'wp:featuredmedia'?: WpMedia[]
    'author'?: { name: string }[]
  }
}

const BERITA: WpTerm = { id: 2, slug: 'berita', name: 'Berita' }
const NASIONAL: WpTerm = { id: 3, slug: 'nasional', name: 'Nasional' }
const PEMERINTAHAN: WpTerm = { id: 4, slug: 'pemerintahan', name: 'Pemerintahan' }
const POLITIK: WpTerm = { id: 6, slug: 'politik', name: 'Politik' }
const BISNIS: WpTerm = { id: 7, slug: 'bisnis-teknologi', name: 'Bisnis &amp; Teknologi' }
const OTOMOTIF: WpTerm = { id: 9, slug: 'otomotif', name: 'Otomotif' }
const SEPAK_BOLA: WpTerm = { id: 5, slug: 'sepak-bola', name: 'Sepak Bola' }

// Dimensi nyata berkas Figma (JPEG 1354x756).
function img(n: number, alt: string): WpMedia {
  return { source_url: `/fixtures/figma-${n}.jpg`, alt_text: alt, media_details: { width: 1354, height: 756 } }
}

function makePost(
  now: Date, id: number, status: string, minutes: number, title: string, terms: WpTerm[], media: WpMedia | null
): WpPost {
  return {
    id,
    slug: `fixture-${id}`,
    status,
    date_gmt: new Date(now.getTime() - minutes * 60000).toISOString(),
    title: { rendered: title },
    _embedded: {
      'wp:term': [terms],
      ...(media ? { 'wp:featuredmedia': [media] } : {}),
      'author': [{ name: 'IniSumedang' }]
    }
  }
}

/** Set default: 8 kartu Rekomendasi dari Figma 21:4950 (teks aktual; kategori dari 9 kategori resmi). */
export function buildFigmaPosts(now: Date): WpPost[] {
  const p = (id: number, minutes: number, title: string, term: WpTerm, image: number) =>
    makePost(now, id, 'publish', minutes, title, [term], img(image, title))
  return [
    p(1, 12, 'Pemkab Sumedang Dorong Transformasi Digital untuk Tingkatkan Pelayanan Publik', BERITA, 1),
    p(2, 35, 'Aktivitas Warga di Pusat Kota Sumedang Meningkat Menjelang Akhir Pekan', BERITA, 2),
    p(3, 60, 'Pemerintah Siapkan Langkah Strategis untuk Memperkuat Pertumbuhan Ekonomi Nasional', NASIONAL, 3),
    p(4, 120, 'Inovasi Teknologi Lokal Didorong untuk Mendukung Daya Saing Indonesia', NASIONAL, 4),
    p(5, 180, 'Pemkab Sumedang Perluas Layanan Administrasi Berbasis Digital hingga Kecamatan', PEMERINTAHAN, 5),
    p(6, 240, 'Program Peningkatan Infrastruktur Daerah Jadi Fokus Pembahasan Pemerintah', PEMERINTAHAN, 6),
    p(7, 300, 'DPRD Sumedang Bahas Prioritas Pembangunan Daerah dalam Rapat Kerja', POLITIK, 7),
    p(8, 360, 'Pengamat Soroti Peran Generasi Muda dalam Meningkatkan Partisipasi Politik', POLITIK, 8)
  ]
}

/** Set `edge` (FIXTURE_SET=edge): kasus buruk untuk QA. */
export function buildEdgePosts(now: Date): WpPost[] {
  const post = (id: number, status: string, minutes: number, title: string, term: WpTerm | null, media: WpMedia | null) =>
    makePost(now, id, status, minutes, title, term ? [term] : [], media)

  const DAY = 24 * 60
  return [
    post(101, 'draft', 1, 'Draft yang tidak boleh tampil di Beranda', NASIONAL, img(1, 'Draft')),
    post(102, 'private', 2, 'Artikel privat yang tidak boleh tampil di Beranda', NASIONAL, img(1, 'Privat')),
    post(1, 'publish', 0.5, 'Pemerintah Kabupaten Sumedang Resmikan Program Penataan Kawasan Pusat Kota Secara Bertahap Melibatkan Warga, Pelaku Usaha, dan Komunitas Pemuda untuk Meningkatkan Kenyamanan Ruang Publik', NASIONAL, img(1, 'Suasana pusat kota Sumedang')),
    post(2, 'publish', 35, 'Banjir surut', NASIONAL, img(2, 'Genangan air surut')),
    post(3, 'publish', 180, 'Bisnis &amp; Teknologi Sumedang Tumbuh &#8211; UMKM &#8217;Digital&#8217; Capai Target &#8230;', BISNIS, img(3, 'Pelaku UMKM menggunakan ponsel')),
    post(4, 'publish', DAY + 120, 'Harga Kebutuhan Pokok di Pasar Tradisional Relatif Stabil', NASIONAL, null),
    post(5, 'publish', 3 * DAY, 'Tim Sepak Bola Lokal Siap Hadapi Turnamen Antar-Kecamatan', SEPAK_BOLA, img(4, '')),
    post(13, 'publish', 4 * DAY, 'Artikel Tanpa Kategori Tetap Tampil Tanpa Label', null, img(5, 'Contoh tanpa kategori')),
    post(6, 'publish', 5 * DAY, 'Uji Coba Angkutan Wisata Listrik Dimulai Pekan Ini', OTOMOTIF, null),
    post(7, 'publish', 6 * DAY + 600, 'Festival Budaya Sunda Kembali Digelar di Alun-Alun', NASIONAL, img(2, 'Panggung festival')),
    post(8, 'publish', 9 * DAY, 'Layanan Administrasi Kependudukan Kini Dapat Diakses Lebih Cepat', NASIONAL, img(3, 'Loket layanan')),
    post(9, 'publish', 10 * DAY, 'Pelatihan Wirausaha Muda Diikuti Ratusan Peserta', BISNIS, img(1, 'Peserta pelatihan')),
    post(10, 'publish', 12 * DAY, 'Perbaikan Jalan Penghubung Antar-Desa Rampung Lebih Awal', NASIONAL, img(4, 'Jalan desa')),
    post(11, 'publish', 15 * DAY, 'Komunitas Pesepeda Gelar Perjalanan Akhir Pekan', SEPAK_BOLA, img(2, 'Pesepeda')),
    post(12, 'publish', 20 * DAY, 'Bengkel Otomotif Lokal Tawarkan Servis Gratis untuk Ojek', OTOMOTIF, img(3, 'Bengkel'))
  ]
}
