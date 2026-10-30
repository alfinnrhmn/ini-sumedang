/**
 * Fixture berbentuk respons REST WordPress v2 (posts?_embed). Tanggal relatif terhadap `now`.
 * Memuat kasus buruk: judul panjang/pendek, tanpa gambar, gambar tanpa alt, entitas HTML,
 * kategori beranotasi entitas, dan artikel draft/private (tidak boleh tampil).
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

const NASIONAL: WpTerm = { id: 3, slug: 'nasional', name: 'Nasional' }
const BISNIS: WpTerm = { id: 7, slug: 'bisnis-teknologi', name: 'Bisnis &amp; Teknologi' }
const OTOMOTIF: WpTerm = { id: 9, slug: 'otomotif', name: 'Otomotif' }
const SEPAK_BOLA: WpTerm = { id: 5, slug: 'sepak-bola', name: 'Sepak Bola' }

function img(n: number, alt: string): WpMedia {
  return { source_url: `/fixtures/img-${n}.svg`, alt_text: alt, media_details: { width: 716, height: 450 } }
}

export function buildFixturePosts(now: Date): WpPost[] {
  const ago = (minutes: number) => new Date(now.getTime() - minutes * 60000).toISOString()
  const post = (
    id: number, status: string, minutes: number, title: string, term: WpTerm, media: WpMedia | null
  ): WpPost => ({
    id,
    slug: `fixture-${id}`,
    status,
    date_gmt: ago(minutes),
    title: { rendered: title },
    _embedded: {
      'wp:term': [[term]],
      ...(media ? { 'wp:featuredmedia': [media] } : {}),
      'author': [{ name: 'IniSumedang' }]
    }
  })

  const DAY = 24 * 60
  return [
    post(101, 'draft', 1, 'Draft yang tidak boleh tampil di Beranda', NASIONAL, img(1, 'Draft')),
    post(102, 'private', 2, 'Artikel privat yang tidak boleh tampil di Beranda', NASIONAL, img(1, 'Privat')),
    post(1, 'publish', 0.5, 'Pemerintah Kabupaten Sumedang Resmikan Program Penataan Kawasan Pusat Kota Secara Bertahap Melibatkan Warga, Pelaku Usaha, dan Komunitas Pemuda untuk Meningkatkan Kenyamanan Ruang Publik', NASIONAL, img(1, 'Suasana pusat kota Sumedang')),
    post(2, 'publish', 35, 'Banjir surut', NASIONAL, img(2, 'Genangan air surut')),
    post(3, 'publish', 180, 'Bisnis &amp; Teknologi Sumedang Tumbuh &#8211; UMKM &#8217;Digital&#8217; Capai Target &#8230;', BISNIS, img(3, 'Pelaku UMKM menggunakan ponsel')),
    post(4, 'publish', DAY + 120, 'Harga Kebutuhan Pokok di Pasar Tradisional Relatif Stabil', NASIONAL, null),
    post(5, 'publish', 3 * DAY, 'Tim Sepak Bola Lokal Siap Hadapi Turnamen Antar-Kecamatan', SEPAK_BOLA, img(4, '')),
    post(6, 'publish', 5 * DAY, 'Uji Coba Angkutan Wisata Listrik Dimulai Pekan Ini', OTOMOTIF, null),
    post(7, 'publish', 6 * DAY + 600, 'Festival Budaya Sunda Kembali Digelar di Alun-Alun', NASIONAL, img(2, 'Panggung festival')),
    post(8, 'publish', 9 * DAY, 'Layanan Administrasi Kependudukan Kini Dapat Diakses Lebih Cepat', NASIONAL, img(3, 'Loket layanan')),
    post(9, 'publish', 10 * DAY, 'Pelatihan Wirausaha Muda Diikuti Ratusan Peserta', BISNIS, img(1, 'Peserta pelatihan')),
    post(10, 'publish', 12 * DAY, 'Perbaikan Jalan Penghubung Antar-Desa Rampung Lebih Awal', NASIONAL, img(4, 'Jalan desa')),
    post(11, 'publish', 15 * DAY, 'Komunitas Pesepeda Gelar Perjalanan Akhir Pekan', SEPAK_BOLA, img(2, 'Pesepeda')),
    post(12, 'publish', 20 * DAY, 'Bengkel Otomotif Lokal Tawarkan Servis Gratis untuk Ojek', OTOMOTIF, img(3, 'Bengkel'))
  ]
}
