/**
 * Fixture berbentuk respons REST WordPress v2 (posts?_embed). Tanggal relatif terhadap `now`.
 * Dua set: `figma` (default; meniru kartu Rekomendasi dan section kategori Sepak Bola, Nasional,
 * Bisnis dan Teknologi, Otomotif di Figma 21:4950, tanpa draft/private) dan `edge` (kasus buruk:
 * judul panjang/pendek, tanpa gambar, gambar tanpa alt, entitas HTML, kategori ber-entitas,
 * kategori 1 artikel, kategori kosong, dan artikel draft/private yang tidak boleh tampil).
 * Gambar di public/fixtures/ berasal dari Figma, hanya untuk pengembangan, WAJIB dihapus
 * sebelum situs tayang (PRD §13).
 * Bentuk `_embedded['wp:term']` meniru WordPress: grup 0 = kategori, grup 1 = tag (HOME-03).
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
// Kategori label item kolom samping Figma 34:354 (bukan section Beranda; slug [I], final di gerbang WordPress).
const TEKNOLOGI: WpTerm = { id: 10, slug: 'teknologi', name: 'Teknologi' }
const EKONOMI: WpTerm = { id: 11, slug: 'ekonomi', name: 'Ekonomi' }
const SELEBRITI: WpTerm = { id: 12, slug: 'selebriti', name: 'Selebriti' }

// Tag editor (PRD §3.6): `terpopuler` = pilihan editor; `headline` = tag lain (tidak boleh dianggap populer).
const TERPOPULER: WpTerm = { id: 31, slug: 'terpopuler', name: 'Terpopuler' }
const HEADLINE: WpTerm = { id: 32, slug: 'headline', name: 'Headline' }

// Dimensi nyata semua berkas public/fixtures/figma-*.jpg (JPEG 716x400, diukur dengan System.Drawing).
const IMG_WIDTH = 716
const IMG_HEIGHT = 400

function img(n: number, alt: string): WpMedia {
  return { source_url: `/fixtures/figma-${n}.jpg`, alt_text: alt, media_details: { width: IMG_WIDTH, height: IMG_HEIGHT } }
}

function makePost(
  now: Date, id: number, status: string, minutes: number, title: string, terms: WpTerm[], media: WpMedia | null,
  tags: WpTerm[] = []
): WpPost {
  return {
    id,
    slug: `fixture-${id}`,
    status,
    date_gmt: new Date(now.getTime() - minutes * 60000).toISOString(),
    title: { rendered: title },
    _embedded: {
      'wp:term': [terms, tags],
      ...(media ? { 'wp:featuredmedia': [media] } : {}),
      'author': [{ name: 'IniSumedang' }]
    }
  }
}

/**
 * Set default: 8 kartu Rekomendasi dari Figma 21:4950 (teks aktual; kategori dari 9 kategori resmi)
 * ditambah artikel section kategori (id 21 ke atas). Semua artikel section lebih lama dari kartu
 * Rekomendasi (> 360 menit) agar 8 kartu Rekomendasi tidak berubah. Semua berstatus `publish`.
 * Judul bertanda [F] diambil dari kartu Figma; bertanda [I] dikarang untuk mengisi >= 6 per
 * kategori (bukan dari Figma). Gambar memakai ulang figma-1..8.jpg (bukan gambar kartu Figma asli).
 */
export function buildFigmaPosts(now: Date): WpPost[] {
  const p = (id: number, minutes: number, title: string, term: WpTerm, image: number) =>
    makePost(now, id, 'publish', minutes, title, [term], img(image, title))
  // Artikel bertag `terpopuler` (kolom samping, tab Terpopuler)
  const pop = (id: number, minutes: number, title: string, term: WpTerm, image: number) =>
    makePost(now, id, 'publish', minutes, title, [term], img(image, title), [TERPOPULER])
  const HOUR = 60
  const DAY = 24 * 60
  return [
    p(1, 12, 'Pemkab Sumedang Dorong Transformasi Digital untuk Tingkatkan Pelayanan Publik', BERITA, 1),
    p(2, 35, 'Aktivitas Warga di Pusat Kota Sumedang Meningkat Menjelang Akhir Pekan', BERITA, 2),
    p(3, 60, 'Pemerintah Siapkan Langkah Strategis untuk Memperkuat Pertumbuhan Ekonomi Nasional', NASIONAL, 3),
    p(4, 120, 'Inovasi Teknologi Lokal Didorong untuk Mendukung Daya Saing Indonesia', NASIONAL, 4),
    p(5, 180, 'Pemkab Sumedang Perluas Layanan Administrasi Berbasis Digital hingga Kecamatan', PEMERINTAHAN, 5),
    p(6, 240, 'Program Peningkatan Infrastruktur Daerah Jadi Fokus Pembahasan Pemerintah', PEMERINTAHAN, 6),
    p(7, 300, 'DPRD Sumedang Bahas Prioritas Pembangunan Daerah dalam Rapat Kerja', POLITIK, 7),
    p(8, 360, 'Pengamat Soroti Peran Generasi Muda dalam Meningkatkan Partisipasi Politik', POLITIK, 8),

    // Sepak Bola (84:1437): [F] 48:385, 48:400; sisanya [I]
    p(21, 9 * HOUR, 'Persib Bandung Fokus Tingkatkan Performa Tim Menjelang Pertandingan Berikutnya', SEPAK_BOLA, 1),
    p(22, 10 * HOUR, 'Talenta Muda Jawa Barat Didorong Berkembang Lewat Kompetisi Sepak Bola Daerah', SEPAK_BOLA, 2),
    p(23, 1 * DAY + 3 * HOUR, 'Tim Sepak Bola Sumedang Matangkan Strategi Jelang Laga Uji Coba', SEPAK_BOLA, 3),
    p(24, 2 * DAY + 5 * HOUR, 'Pelatih Lokal Gelar Latihan Intensif untuk Persiapan Kompetisi Antar-Kecamatan', SEPAK_BOLA, 4),
    p(25, 3 * DAY + 2 * HOUR, 'Lapangan Sepak Bola Desa Direnovasi untuk Mendukung Pembinaan Pemain Muda', SEPAK_BOLA, 5),
    p(26, 4 * DAY + 6 * HOUR, 'Suporter Sumedang Ajak Penonton Menjaga Ketertiban Selama Pertandingan', SEPAK_BOLA, 6),

    // Nasional (57:496): [F] 48:355, 48:370; sisanya [I]
    p(31, 7 * HOUR, 'Aparat Kepolisian Tingkatkan Edukasi Kesadaran Hukum kepada Masyarakat', NASIONAL, 7),
    p(32, 8 * HOUR, 'Pakar Hukum Tekankan Pentingnya Perlindungan Data Pribadi di Era Digital', NASIONAL, 8),
    p(33, 1 * DAY + 6 * HOUR, 'Pemerintah Pusat Percepat Penyaluran Bantuan Sosial ke Daerah', NASIONAL, 1),
    p(34, 2 * DAY + 2 * HOUR, 'Kementerian Dorong Peningkatan Mutu Pendidikan Vokasi di Seluruh Indonesia', NASIONAL, 2),
    p(35, 3 * DAY + 7 * HOUR, 'Program Ketahanan Pangan Nasional Libatkan Petani Muda', NASIONAL, 3),
    p(36, 4 * DAY + 1 * HOUR, 'Otoritas Perkuat Pengawasan Layanan Keuangan Digital bagi Masyarakat', NASIONAL, 4),

    // Bisnis dan Teknologi (57:501): [F] 48:460, 48:475; sisanya [I]
    p(41, 1 * DAY, 'Pesona Kuliner Tradisional Sumedang yang Tetap Digemari Berbagai Generasi', BISNIS, 5),
    p(42, 2 * DAY, 'Pelaku UMKM Sumedang Mulai Manfaatkan AI untuk Mengembangkan Bisnis Digital', BISNIS, 6),
    p(43, 3 * DAY + 4 * HOUR, 'Pelaku Usaha Kecil Sumedang Mulai Beralih ke Pembayaran Nontunai', BISNIS, 7),
    p(44, 4 * DAY + 3 * HOUR, 'Startup Lokal Kenalkan Aplikasi Pemasaran Produk Pertanian', BISNIS, 8),
    p(45, 5 * DAY + 5 * HOUR, 'Pelatihan Literasi Digital Bantu Pedagang Pasar Berjualan Daring', BISNIS, 1),
    p(46, 6 * DAY + 2 * HOUR, 'Jaringan Internet Cepat Menjangkau Lebih Banyak Desa di Sumedang', BISNIS, 2),

    // Otomotif (57:505): [F] 48:430; sisanya [I]
    p(51, 12 * HOUR, 'Tips Merawat Kendaraan agar Tetap Prima Saat Memasuki Musim Hujan', OTOMOTIF, 3),
    p(52, 1 * DAY + 8 * HOUR, 'Penjualan Kendaraan Listrik Meningkat di Kalangan Warga Perkotaan', OTOMOTIF, 4),
    p(53, 2 * DAY + 7 * HOUR, 'Bengkel Lokal Siapkan Layanan Servis Berkala Menjelang Musim Mudik', OTOMOTIF, 5),
    p(54, 3 * DAY + 9 * HOUR, 'Pengendara Diimbau Periksa Kondisi Ban dan Rem Sebelum Perjalanan Jauh', OTOMOTIF, 6),
    p(55, 4 * DAY + 4 * HOUR, 'Komunitas Otomotif Sumedang Gelar Bakti Sosial dan Kopdar Bulanan', OTOMOTIF, 7),
    p(56, 5 * DAY + 8 * HOUR, 'Dealer Resmi Hadirkan Pilihan Kendaraan Irit Bahan Bakar', OTOMOTIF, 8),

    // Terpopuler (tag `terpopuler`; HOME-03). Semua lebih lama dari 8 kartu Rekomendasi (> 360 menit) dan
    // bukan kategori section, sehingga Rekomendasi dan section HOME-02 tidak berubah.
    // 61-64: judul item daftar Figma 34:354 [F] (item 2 dan 4 sama di Figma); label kategori dari Figma.
    pop(61, 13 * HOUR, 'Russian warship: Moskva sinks in Black Sea', TEKNOLOGI, 1),
    pop(62, 20 * HOUR, 'Ukraine\'s President Zelensky to BBC: Blood money being paid...', EKONOMI, 2),
    pop(63, 1 * DAY + 4 * HOUR, 'Her train broke down. Her phone died. And then she met her..', SELEBRITI, 3),
    pop(64, 1 * DAY + 10 * HOUR, 'Ukraine\'s President Zelensky to BBC: Blood money being paid...', EKONOMI, 4),
    // 65-68 [I]: melengkapi >= 8 artikel populer dalam 14 hari.
    pop(65, 3 * DAY + 1 * HOUR, 'Warga Sumedang Antusias Ikuti Pelatihan Keamanan Digital', BERITA, 5),
    pop(66, 5 * DAY + 3 * HOUR, 'Harga Komoditas Pangan Stabil Menjelang Akhir Pekan', EKONOMI, 6),
    pop(67, 8 * DAY + 2 * HOUR, 'Festival Musik Daerah Hadirkan Penampil dari Berbagai Kota', SELEBRITI, 7),
    pop(68, 11 * DAY + 5 * HOUR, 'Aplikasi Layanan Publik Baru Diperkenalkan kepada Warga', TEKNOLOGI, 8),
    // Batas jendela [I]: umur 14 hari (tepat dan 1 jam lebih muda) masuk; umur 15 hari (tepat dan 1 jam lebih tua) tidak.
    pop(69, 14 * DAY, 'Pasar Rakyat Kembali Ramai Dikunjungi Pembeli dari Luar Kota', BERITA, 1),
    pop(70, 14 * DAY - 1 * HOUR, 'Pemuda Desa Rintis Usaha Kerajinan Bambu Bernilai Ekspor', EKONOMI, 2),
    pop(71, 15 * DAY, 'Kajian Ketahanan Pangan Daerah Dipaparkan di Balai Kabupaten', BERITA, 3),
    pop(72, 15 * DAY + 1 * HOUR, 'Peringatan Hari Jadi Kota Digelar Sederhana di Alun-Alun', BERITA, 4)
  ]
}

/**
 * Set `edge` (FIXTURE_SET=edge): kasus buruk untuk QA. Per kategori section:
 * Sepak Bola = tepat 1 artikel terbit (id 5); Otomotif = kosong (hanya 1 artikel `private`, id 103);
 * Nasional = banyak (+ draft/private id 101, 102); Bisnis dan Teknologi = 2 (ber-entitas).
 * Kolom samping (HOME-03): Terbaru = id 1-4 (judul sangat panjang, judul pendek, entitas, tanpa gambar).
 * Terpopuler (tag `terpopuler`) tepat 4 yang valid: id 2 (judul pendek), 4 (tanpa gambar), 5 (gambar tanpa alt)
 * dan id 114 (umur tepat 14 hari, urutan terakhir). Tidak tampil: draft/private bertag (111, 112),
 * umur 15 hari (11, 115) dan 20 hari (12); id 1 dan 3 hanya bertag `headline` (bukan populer).
 */
export function buildEdgePosts(now: Date): WpPost[] {
  const post = (
    id: number, status: string, minutes: number, title: string, term: WpTerm | null, media: WpMedia | null, tags: WpTerm[] = []
  ) => makePost(now, id, status, minutes, title, term ? [term] : [], media, tags)

  const DAY = 24 * 60
  return [
    post(101, 'draft', 1, 'Draft yang tidak boleh tampil di Beranda', NASIONAL, img(1, 'Draft')),
    post(102, 'private', 2, 'Artikel privat yang tidak boleh tampil di Beranda', NASIONAL, img(1, 'Privat')),
    post(103, 'private', 3, 'Artikel privat Otomotif yang tidak boleh tampil di section', OTOMOTIF, img(1, 'Privat Otomotif')),
    post(1, 'publish', 0.5, 'Pemerintah Kabupaten Sumedang Resmikan Program Penataan Kawasan Pusat Kota Secara Bertahap Melibatkan Warga, Pelaku Usaha, dan Komunitas Pemuda untuk Meningkatkan Kenyamanan Ruang Publik', NASIONAL, img(1, 'Suasana pusat kota Sumedang'), [HEADLINE]),
    post(2, 'publish', 35, 'Banjir surut', NASIONAL, img(2, 'Genangan air surut'), [TERPOPULER]),
    post(3, 'publish', 180, 'Bisnis &amp; Teknologi Sumedang Tumbuh &#8211; UMKM &#8217;Digital&#8217; Capai Target &#8230;', BISNIS, img(3, 'Pelaku UMKM menggunakan ponsel'), [HEADLINE]),
    post(4, 'publish', DAY + 120, 'Harga Kebutuhan Pokok di Pasar Tradisional Relatif Stabil', NASIONAL, null, [TERPOPULER]),
    post(5, 'publish', 3 * DAY, 'Tim Sepak Bola Lokal Siap Hadapi Turnamen Antar-Kecamatan', SEPAK_BOLA, img(4, ''), [TERPOPULER]),
    post(13, 'publish', 4 * DAY, 'Artikel Tanpa Kategori Tetap Tampil Tanpa Label', null, img(5, 'Contoh tanpa kategori')),
    post(6, 'publish', 5 * DAY, 'Uji Coba Angkutan Wisata Listrik Dimulai Pekan Ini', BERITA, null),
    post(7, 'publish', 6 * DAY + 600, 'Festival Budaya Sunda Kembali Digelar di Alun-Alun', NASIONAL, img(2, 'Panggung festival')),
    post(8, 'publish', 9 * DAY, 'Layanan Administrasi Kependudukan Kini Dapat Diakses Lebih Cepat', NASIONAL, img(3, 'Loket layanan')),
    post(9, 'publish', 10 * DAY, 'Pelatihan Wirausaha Muda Diikuti Ratusan Peserta', BISNIS, img(1, 'Peserta pelatihan')),
    post(10, 'publish', 12 * DAY, 'Perbaikan Jalan Penghubung Antar-Desa Rampung Lebih Awal', NASIONAL, img(4, 'Jalan desa')),
    post(11, 'publish', 15 * DAY, 'Komunitas Pesepeda Gelar Perjalanan Akhir Pekan', BERITA, img(2, 'Pesepeda'), [TERPOPULER]),
    post(12, 'publish', 20 * DAY, 'Bengkel Otomotif Lokal Tawarkan Servis Gratis untuk Ojek', BERITA, img(3, 'Bengkel'), [TERPOPULER]),
    // Kolom samping: draft/private bertag populer (tidak boleh tampil) dan batas jendela 14/15 hari.
    post(111, 'draft', 2, 'Draft populer yang tidak boleh tampil di kolom samping', BERITA, img(1, 'Draft populer'), [TERPOPULER]),
    post(112, 'private', 4, 'Artikel privat populer yang tidak boleh tampil di kolom samping', BERITA, img(1, 'Privat populer'), [TERPOPULER]),
    post(114, 'publish', 14 * DAY, 'Pameran Produk UMKM Pekan Ini Berlangsung Tepat Dua Pekan Lalu', BERITA, img(5, 'Stan pameran UMKM'), [TERPOPULER]),
    post(115, 'publish', 15 * DAY + 60, 'Pelatihan Pemandu Wisata Lebih dari Dua Pekan Lalu', BERITA, img(6, 'Peserta pelatihan pemandu'), [TERPOPULER])
  ]
}
