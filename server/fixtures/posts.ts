/**
 * Fixture berbentuk respons REST WordPress v2 (posts?_embed). Tanggal relatif terhadap `now`.
 * Dua set: `figma` (default; meniru kartu Rekomendasi dan section kategori Sepak Bola, Nasional,
 * Bisnis dan Teknologi, Otomotif di Figma 21:4950, tanpa draft/private) dan `edge` (kasus buruk:
 * judul panjang/pendek, tanpa gambar, gambar tanpa alt, entitas HTML, kategori ber-entitas,
 * kategori 1 artikel, kategori kosong, dan artikel draft/private yang tidak boleh tampil).
 * Gambar di public/fixtures/ berasal dari Figma, hanya untuk pengembangan, WAJIB dihapus
 * sebelum situs tayang (PRD §13).
 * Bentuk `_embedded['wp:term']` meniru WordPress: grup 0 = kategori, grup 1 = tag (HOME-03).
 * Ruang Visual (HOME-04): kategori induk `ruang-visual` dengan kategori anak (`parent`); "paling baru dibuat" = id
 * terbesar (WordPress: `orderby=id&order=desc`). Daftar kategori visual ada di `buildFigmaVisualCategories` /
 * `buildEdgeVisualCategories` (anak tanpa artikel hanya ada di daftar itu).
 */
/** `parent` hanya ada pada kategori anak (seperti `parent` di REST WordPress; tanpa nilai = kategori induk). */
export interface WpTerm { id: number, slug: string, name: string, parent?: number }
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

// Ruang Visual (HOME-04). Induk id 20; anak id 24-29 (set `figma`) dan 35-41 (set `edge`). Slug anak [I]: final di gerbang WordPress.
const RUANG_VISUAL: WpTerm = { id: 20, slug: 'ruang-visual', name: 'Ruang Visual' }
const visualChild = (id: number, slug: string, name: string): WpTerm => ({ id, slug, name, parent: RUANG_VISUAL.id })
// Set `figma`: id terbesar = tampil pertama = urutan blok di Figma 21:4950 (nama dari teks aktual node 105:468, 105:477, 101:2713, 101:2729).
const V_PEMERINTAHAN = visualChild(28, 'visual-pemerintahan', 'Pemerintahan')
const V_EKONOMI = visualChild(27, 'visual-ekonomi-inovasi', 'Ekonomi &amp; Inovasi')
const V_WISATA = visualChild(26, 'visual-wisata', 'Wisata')
const V_OLAHRAGA = visualChild(25, 'visual-olahraga', 'Olahraga')
const V_BUDAYA = visualChild(24, 'visual-budaya', 'Budaya') // anak ke-5 (lebih lama): tidak masuk 4 topik terbaru
const V_KOSONG = visualChild(29, 'visual-kosong', 'Topik Kosong') // anak terbaru tanpa artikel: dilewati
// Set `edge`
const E_KOSONG = visualChild(41, 'edge-kosong', 'Topik Tanpa Artikel')
const E_HANYA_DRAFT = visualChild(40, 'edge-hanya-draft', 'Topik Hanya Draft') // hanya draft/private: dianggap kosong
const E_PANJANG = visualChild(39, 'edge-judul-panjang', 'Kolaborasi Lintas Sektor untuk Pembangunan Berkelanjutan dan Pemberdayaan Masyarakat Desa di Kabupaten Sumedang')
const E_SATU = visualChild(38, 'edge-satu-artikel', 'Satu Artikel')
const E_DUA = visualChild(37, 'edge-dua-artikel', 'Dua Artikel')
const E_ENTITAS = visualChild(36, 'edge-seni-budaya', 'Seni &amp; Budaya &#8211; Tradisi')
const E_LAMA = visualChild(35, 'edge-lama', 'Topik Lama') // anak ke-5: tidak tampil

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
    pop(72, 15 * DAY + 1 * HOUR, 'Peringatan Hari Jadi Kota Digelar Sederhana di Alun-Alun', BERITA, 4),

    // Ruang Visual (HOME-04; 101:2708, 101:2709, 101:2710, 101:2726). Teks [F] dari node: judul kartu besar dan 3 judul item
    // (item sama di Figma). Semua > 360 menit supaya 8 kartu Rekomendasi dan kolom samping tidak berubah; tanpa tag.
    // Tanggal sengaja tidak mengikuti urutan topik: urutan topik = kategori paling baru dibuat (id), bukan artikel terbaru.
    p(81, 2 * DAY + 4 * HOUR, 'Pemkab Sumedang Percepat Transformasi Layanan Publik', V_PEMERINTAHAN, 1),
    p(82, 2 * DAY + 6 * HOUR, 'DPRD Sumedang Bahas Prioritas Pembangunan Daerah', V_PEMERINTAHAN, 2),
    p(83, 2 * DAY + 8 * HOUR, 'DPRD Sumedang Bahas Prioritas Pembangunan Daerah', V_PEMERINTAHAN, 3),
    p(84, 2 * DAY + 10 * HOUR, 'DPRD Sumedang Bahas Prioritas Pembangunan Daerah', V_PEMERINTAHAN, 4),
    p(85, 1 * DAY + 14 * HOUR, 'UMKM Lokal Tumbuh Lewat Kolaborasi dan Teknologi', V_EKONOMI, 5),
    p(86, 1 * DAY + 16 * HOUR, 'Generasi Muda Sumedang Kembangkan Inovasi Teknologi', V_EKONOMI, 6),
    p(87, 1 * DAY + 18 * HOUR, 'Generasi Muda Sumedang Kembangkan Inovasi Teknologi', V_EKONOMI, 7),
    p(88, 1 * DAY + 20 * HOUR, 'Generasi Muda Sumedang Kembangkan Inovasi Teknologi', V_EKONOMI, 8),
    p(89, 1 * DAY + 1 * HOUR, 'UMKM Lokal Tumbuh Lewat Kolaborasi dan Teknologi', V_WISATA, 1),
    p(90, 1 * DAY + 3 * HOUR, 'Generasi Muda Sumedang Kembangkan Inovasi Teknologi', V_WISATA, 2),
    p(91, 1 * DAY + 5 * HOUR, 'Generasi Muda Sumedang Kembangkan Inovasi Teknologi', V_WISATA, 3),
    p(92, 1 * DAY + 7 * HOUR, 'Generasi Muda Sumedang Kembangkan Inovasi Teknologi', V_WISATA, 4),
    p(93, 15 * HOUR, 'UMKM Lokal Tumbuh Lewat Kolaborasi dan Teknologi', V_OLAHRAGA, 5),
    p(94, 17 * HOUR, 'Generasi Muda Sumedang Kembangkan Inovasi Teknologi', V_OLAHRAGA, 6),
    p(95, 19 * HOUR, 'Generasi Muda Sumedang Kembangkan Inovasi Teknologi', V_OLAHRAGA, 7),
    p(96, 21 * HOUR, 'Generasi Muda Sumedang Kembangkan Inovasi Teknologi', V_OLAHRAGA, 8),
    // [I] anak ke-5 (lebih lama): ada artikel, tetapi tidak termasuk 4 topik terbaru
    p(97, 3 * DAY + 2 * HOUR, 'Pagelaran Seni Tradisional Sumedang Kembali Digelar', V_BUDAYA, 1),
    p(98, 3 * DAY + 5 * HOUR, 'Pengrajin Lokal Perkenalkan Kerajinan Khas Sumedang', V_BUDAYA, 2)
  ]
}

/** Kategori Ruang Visual set `figma` (induk + anak). Anak `visual-kosong` tidak punya artikel. */
export function buildFigmaVisualCategories(): WpTerm[] {
  return [RUANG_VISUAL, V_BUDAYA, V_OLAHRAGA, V_WISATA, V_EKONOMI, V_PEMERINTAHAN, V_KOSONG]
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
    post(115, 'publish', 15 * DAY + 60, 'Pelatihan Pemandu Wisata Lebih dari Dua Pekan Lalu', BERITA, img(6, 'Peserta pelatihan pemandu'), [TERPOPULER]),

    // Ruang Visual (HOME-04). Semua lebih lama dari 20 hari agar Rekomendasi, kolom samping, dan section tidak berubah.
    // E_PANJANG (nama topik sangat panjang): kartu besar berjudul sangat panjang, item berjudul pendek, entitas, tanpa gambar, gambar tanpa alt.
    post(201, 'publish', 22 * DAY, 'Pemerintah Kabupaten Sumedang Resmikan Program Penataan Kawasan Pusat Kota Secara Bertahap Melibatkan Warga, Pelaku Usaha, dan Komunitas Pemuda untuk Meningkatkan Kenyamanan Ruang Publik', E_PANJANG, img(1, 'Penataan kawasan pusat kota')),
    post(202, 'publish', 22 * DAY + 60, 'Banjir surut', E_PANJANG, img(2, 'Genangan air surut')),
    post(203, 'publish', 22 * DAY + 120, 'Bisnis &amp; Teknologi Sumedang Tumbuh &#8211; UMKM &#8217;Digital&#8217; Capai Target &#8230;', E_PANJANG, null),
    post(204, 'publish', 22 * DAY + 180, 'Harga Kebutuhan Pokok di Pasar Tradisional Relatif Stabil di Sejumlah Kecamatan Sumedang Selama Sepekan Terakhir', E_PANJANG, img(3, '')),
    // E_SATU: tepat 1 artikel terbit (draft/private di topik yang sama tidak tampil): blok tanpa item
    post(205, 'publish', 23 * DAY, 'Satu-satunya Artikel Terbit di Topik Ini', E_SATU, img(4, 'Satu artikel')),
    post(206, 'draft', 5, 'Draft di topik satu artikel yang tidak boleh tampil', E_SATU, img(1, 'Draft')),
    post(207, 'private', 6, 'Artikel privat di topik satu artikel yang tidak boleh tampil', E_SATU, img(1, 'Privat')),
    // E_DUA: 2 artikel (kartu besar + 1 item), keduanya tanpa gambar
    post(208, 'publish', 24 * DAY, 'Dua Artikel di Topik Ini: Kartu Besar', E_DUA, null),
    post(209, 'publish', 24 * DAY + 60, 'Item Tunggal Tanpa Gambar', E_DUA, null),
    // E_ENTITAS: nama topik ber-entitas; 4 artikel
    post(210, 'publish', 25 * DAY, 'Pesta Rakyat &amp; Festival Seni &#8211; Warga Padati Alun-Alun', E_ENTITAS, img(5, 'Festival seni')),
    post(211, 'publish', 25 * DAY + 60, 'Sanggar Tari Latih 100 Penari Cilik', E_ENTITAS, img(6, 'Sanggar tari')),
    post(212, 'publish', 25 * DAY + 120, 'Pameran Lukisan', E_ENTITAS, img(7, 'Pameran lukisan')),
    post(213, 'publish', 25 * DAY + 180, 'Pertunjukan Wayang Golek Semalam Suntuk Diikuti Ratusan Penonton dari Berbagai Daerah Sekitar Sumedang', E_ENTITAS, img(8, 'Wayang golek')),
    // E_HANYA_DRAFT: hanya draft/private (dianggap kosong, dilewati)
    post(214, 'draft', 7, 'Draft satu-satunya di topik hanya draft', E_HANYA_DRAFT, img(1, 'Draft')),
    post(215, 'private', 8, 'Privat satu-satunya di topik hanya draft', E_HANYA_DRAFT, img(1, 'Privat')),
    // E_LAMA: anak ke-5 (lebih lama), ada artikel tetapi tidak termasuk 4 topik terbaru
    post(216, 'publish', 26 * DAY, 'Artikel di Topik Lama yang Tidak Tampil di Beranda', E_LAMA, img(2, 'Topik lama'))
  ]
}

/** Kategori Ruang Visual set `edge`: anak tanpa artikel (E_KOSONG) dan anak ke-5 (E_LAMA) ikut di daftar. */
export function buildEdgeVisualCategories(): WpTerm[] {
  return [RUANG_VISUAL, E_LAMA, E_ENTITAS, E_DUA, E_SATU, E_PANJANG, E_HANYA_DRAFT, E_KOSONG]
}
