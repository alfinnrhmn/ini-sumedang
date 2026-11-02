/**
 * Uji unit penyanitasi HTML artikel (SANITIZE-001; SN1-SN8). Pelari: `node:test` bawaan Node (tanpa Vitest).
 * Jalankan: `npm test`. Memuat berkas `.ts` langsung (Node 22.23+), maka impor memakai ekstensi `.ts`.
 */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { createArticleSanitizer, sanitizeArticleHtml } from '../../server/utils/sanitize-article-html.ts'
import {
  EMBED_ALLOWED_HOSTS,
  IMAGE_ALLOWED_HOSTS,
  SANITIZE_ALLOWED_ATTRIBUTES,
  SANITIZE_ALLOWED_TAGS,
  SANITIZE_MAX_INPUT_LENGTH,
  SANITIZE_MAX_TAG_OPENINGS,
  SANITIZE_NESTING_LIMIT
} from '../../server/utils/sanitize-config.ts'

type Row = [name: string, input: string, expected: string]

const YT = 'https://www.youtube.com/embed/dQw4w9WgXcQ'
const SANDBOX = 'allow-scripts allow-same-origin allow-presentation allow-popups allow-popups-to-escape-sandbox'
const POLICY = 'strict-origin-when-cross-origin'
/** Iframe YouTube keluaran penyanitasi (urutan atribut mengikuti penyanitasi). */
const ytFrame = (src: string, extra = ''): string => `<iframe src="${src}"${extra} loading="lazy" sandbox="${SANDBOX}" referrerpolicy="${POLICY}"></iframe>`

/** Tag/atribut yang tidak boleh ada di keluaran mana pun (nilai atribut dalam tanda kutip dikosongkan lebih dulu). */
const FORBIDDEN_MARKUP = /<\s*(script|svg|math|style|form|input|button|object|embed|base|meta|link|template|noscript|textarea|select|xmp|title|body|html|head|h1)\b|\son[a-z]+\s*=|srcdoc|style\s*=|<!--/i
/** URL/skema berbahaya yang tidak boleh ada di bagian mana pun keluaran. */
const FORBIDDEN_URL = /javascript:|vbscript:|data:|expression\s*\(/i

function assertSafe(output: string, label?: string): void {
  assert.doesNotMatch(output.replace(/"[^"]*"/g, '""'), FORBIDDEN_MARKUP, label)
  assert.doesNotMatch(output, FORBIDDEN_URL, label)
}

const all: string[] = []

function run(rows: Row[], sanitize: (html: unknown) => string = sanitizeArticleHtml, safety = true): void {
  for (const [name, input, expected] of rows) {
    it(name, () => {
      all.push(input)
      const output = sanitize(input)
      assert.equal(output, expected)
      if (safety) assertSafe(output)
    })
  }
}

describe('SN1 payload XSS dibuang', () => {
  run([
    ['script biasa', '<script>alert(1)</script><p>a</p>', '<p>a</p>'],
    ['script huruf besar + src', '<SCRIPT SRC=//evil.com/x.js></SCRIPT><p>a</p>', '<p>a</p>'],
    ['script tak tertutup', '<p>a</p><script>alert(1)', '<p>a</p>'],
    ['script bersarang trik (tersisa teks ter-escape)', '<scr<script>ipt>alert(1)</scr</script>ipt>', 'ipt&gt;alert(1)ipt&gt;'],
    ['tag script dengan NUL (menjadi tag tak dikenal; teks polos)', '<scr\u0000ipt>alert(1)</scr\u0000ipt><p>a</p>', 'alert(1)<p>a</p>'],
    ['img onerror', '<img src="/a.png" onerror="alert(1)" onload="alert(2)">', '<img src="/a.png" />'],
    ['img onerror tanpa kutip', '<img src=x onerror=alert(1)>', '<img src="x" />'],
    ['img slash trik', '<img/src="/a.png"/onerror=alert(1)>', '<img src="/a.png" />'],
    ['img alt memecah atribut', '<img src="/a.png" alt="a&quot; onerror=&quot;alert(1)">', '<img src="/a.png" alt="a&quot; onerror=&quot;alert(1)" />'],
    ['img srcset javascript', '<img src="/a.png" srcset="javascript:alert(1) 1x">', '<img src="/a.png" />'],
    ['a javascript:', '<a href="javascript:alert(1)">x</a>', '<a>x</a>'],
    ['a JaVaScRiPt:', '<a href="JaVaScRiPt:alert(1)">x</a>', '<a>x</a>'],
    ['a spasi di depan', '<a href="  javascript:alert(1)">x</a>', '<a>x</a>'],
    ['a tab di dalam skema', '<a href="java\tscript:alert(1)">x</a>', '<a>x</a>'],
    ['a baris baru di dalam skema', '<a href="java\nscript:alert(1)">x</a>', '<a>x</a>'],
    ['a CR di dalam skema', '<a href="java\rscript:alert(1)">x</a>', '<a>x</a>'],
    ['a NUL di dalam skema', '<a href="java\u0000script:alert(1)">x</a>', '<a>x</a>'],
    ['a kontrol di depan', '<a href="\u0001javascript:alert(1)">x</a>', '<a>x</a>'],
    ['a entitas desimal', '<a href="&#106;avascript:alert(1)">x</a>', '<a>x</a>'],
    ['a entitas heksa', '<a href="&#x6A;avascript:alert(1)">x</a>', '<a>x</a>'],
    ['a entitas nol di depan', '<a href="&#0000106avascript:alert(1)">x</a>', '<a>x</a>'],
    ['a entitas titik dua', '<a href="javascript&colon;alert(1)">x</a>', '<a>x</a>'],
    ['a entitas titik dua numerik', '<a href="javascript&#58;alert(1)">x</a>', '<a>x</a>'],
    ['a vbscript:', '<a href="vbscript:msgbox(1)">x</a>', '<a>x</a>'],
    ['a data: html', '<a href="data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==">x</a>', '<a>x</a>'],
    ['a protokol relatif', '<a href="//evil.com/x">x</a>', '<a>x</a>'],
    ['a garis miring terbalik', '<a href="\\\\evil.com/x">x</a>', '<a>x</a>'],
    ['a ftp dan skema tak dikenal', '<a href="ftp://x.id/f">x</a><a href="tel:+62">y</a><a href="foo:bar">z</a>', '<a>x</a><a>y</a><a>z</a>'],
    ['img data: URI', '<img src="data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=" alt="x">', ''],
    ['img javascript:', '<img src="javascript:alert(1)">', ''],
    ['svg onload', '<svg onload="alert(1)"><circle r="1"/></svg><p>ok</p>', '<p>ok</p>'],
    ['svg script', '<svg><script>alert(1)</script></svg><p>ok</p>', '<p>ok</p>'],
    ['svg xlink:href', '<svg><a xlink:href="javascript:alert(1)"><text>x</text></a></svg><p>ok</p>', '<p>ok</p>'],
    ['svg animate set', '<svg><a><animate attributeName="href" values="javascript:alert(1)"/><text>x</text></a></svg>', ''],
    ['math', '<math><mi xlink:href="javascript:alert(1)">x</mi></math><p>ok</p>', '<p>ok</p>'],
    ['iframe host tak diizinkan', '<iframe src="https://evil.com/embed/abcdefgh"></iframe><p>ok</p>', '<p>ok</p>'],
    ['iframe javascript:', '<iframe src="javascript:alert(1)"></iframe><p>ok</p>', '<p>ok</p>'],
    ['iframe srcdoc', '<iframe srcdoc="<script>alert(1)</script>"></iframe><p>ok</p>', '<p>ok</p>'],
    ['iframe tanpa src', '<iframe></iframe><p>ok</p>', '<p>ok</p>'],
    ['iframe tak diizinkan berisi markup', '<iframe src="https://evil.com/x"><img src=x onerror=alert(1)></iframe><p>ok</p>', '<p>ok</p>'],
    ['iframe tak diizinkan tak tertutup', '<p>a</p><iframe src="https://evil.com/x"><script>alert(1)</script>', '<p>a</p>'],
    ['style expression', '<p style="width:expression(alert(1))">x</p>', '<p>x</p>'],
    ['style url(javascript:)', '<p style="background:url(javascript:alert(1))">x</p>', '<p>x</p>'],
    ['elemen style', '<style>@import "https://evil.com/x.css"; body{display:none}</style><p>x</p>', '<p>x</p>'],
    ['onclick', '<p onclick="alert(1)">x</p>', '<p>x</p>'],
    ['onmouseover pada a', '<a href="/x" onmouseover="alert(1)">x</a>', '<a href="/x">x</a>'],
    ['onload pada body', '<body onload=alert(1)><p>x</p></body>', '<p>x</p>'],
    ['ontoggle pada details', '<details open ontoggle=alert(1)>x</details>', 'x'],
    ['onfocus autofocus', '<input autofocus onfocus=alert(1)>', ''],
    ['form', '<form action="https://evil.com" method="post"><input name="a"><button>Kirim</button></form><p>x</p>', '<p>x</p>'],
    ['button formaction', '<button formaction="javascript:alert(1)">x</button>', 'x'],
    ['base', '<base href="https://evil.com/"><p>x</p>', '<p>x</p>'],
    ['meta refresh', '<meta http-equiv="refresh" content="0;url=https://evil.com"><p>x</p>', '<p>x</p>'],
    ['link stylesheet', '<link rel="stylesheet" href="https://evil.com/x.css"><p>x</p>', '<p>x</p>'],
    ['object dan embed', '<object data="x.swf"><param name="a" value="b"></object><embed src="x.swf"><p>x</p>', '<p>x</p>'],
    ['video source onerror', '<video><source onerror="alert(1)" src="x.mp4"></video>', ''],
    ['komentar kondisional', '<!--[if IE]><script>alert(1)</script><![endif]--><p>x</p>', '<p>x</p>'],
    ['komentar kosong <!--> (HTML5), img tetap dibersihkan', '<!--><img src=x onerror=alert(1)>--><p>x</p>', '<img src="x" />--&gt;<p>x</p>'],
    ['CDATA dan PI', '<![CDATA[<script>alert(1)</script>]]><?php echo 1 ?><p>x</p>', '<p>x</p>'],
    ['mXSS math/mglyph/style', '<math><mtext><table><mglyph><style><!--</style><img title="--&gt;&lt;img src=1 onerror=alert(1)&gt;">', ''],
    ['mXSS svg/style/komentar', '<svg></p><style><a id="</style><img src=1 onerror=alert(1)>">', ''],
    ['mXSS noscript', '<noscript><p title="</noscript><img src=x onerror=alert(1)>"></noscript>', ''],
    ['mXSS form/math/mglyph', '<form><math><mtext></form><form><mglyph><style></math><img src onerror=alert(1)>', ''],
    ['mXSS textarea', '<textarea><img src=x onerror=alert(1)></textarea><p>x</p>', '<p>x</p>'],
    ['mXSS xmp', '<xmp><img src=x onerror=alert(1)></xmp><p>x</p>', '<p>x</p>'],
    ['mXSS title', '<title><img src=x onerror=alert(1)></title><p>x</p>', '<p>x</p>'],
    ['mXSS template', '<template><img src=x onerror=alert(1)></template><p>x</p>', '<p>x</p>'],
    ['mXSS noembed/noframes', '<noembed><img src=x onerror=alert(1)></noembed><noframes><img src=x onerror=alert(1)></noframes><p>x</p>', '<p>x</p>'],
    ['mXSS select/option', '<select><option><img src=x onerror=alert(1)></option></select><p>x</p>', '<p>x</p>'],
    ['mXSS pre dan code tetap teks', '<pre><code>&lt;img src=x onerror=alert(1)&gt;</code></pre>', '<pre><code>&lt;img src=x onerror=alert(1)&gt;</code></pre>'],
    ['teks entitas script tetap teks', '<p>a &lt;script&gt;alert(1)&lt;/script&gt; b</p>', '<p>a &lt;script&gt;alert(1)&lt;/script&gt; b</p>'],
    ['h1 dibuang, teks tetap', '<h1>Judul</h1><h2>Anak</h2>', 'Judul<h2>Anak</h2>']
  ], sanitizeArticleHtml, false)

})

describe('SN2 masukan aman tetap utuh', () => {
  const article = (inner: string): string => inner
  run([
    ['paragraf, tebal, miring, entitas', article('<p>Pemkab Sumedang &amp; DPRD sepakat: <strong>naik 5%</strong>, <em>bukan</em> 6% &lt;sementara&gt; &quot;resmi&quot;.</p>'), '<p>Pemkab Sumedang &amp; DPRD sepakat: <strong>naik 5%</strong>, <em>bukan</em> 6% &lt;sementara&gt; "resmi".</p>'],
    ['entitas numerik menjadi karakter yang sama', '<p>Rapat 10 &#8211; 12 Januari &#8220;tertutup&#8221; &amp; singkat&nbsp;saja&hellip;</p>', '<p>Rapat 10 – 12 Januari “tertutup” &amp; singkat saja…</p>'],
    ['judul-anak h2-h6', '<h2>A</h2><h3>B</h3><h4>C</h4><h5>D</h5><h6>E</h6>', '<h2>A</h2><h3>B</h3><h4>C</h4><h5>D</h5><h6>E</h6>'],
    ['daftar bertingkat', '<ul><li>satu<ol><li>a</li><li>b</li></ol></li><li>dua</li></ul>', '<ul><li>satu<ol><li>a</li><li>b</li></ol></li><li>dua</li></ul>'],
    ['kutipan', '<blockquote><p>“Pembangunan jalan lanjut.”</p><p>— Bupati</p></blockquote>', '<blockquote><p>“Pembangunan jalan lanjut.”</p><p>— Bupati</p></blockquote>'],
    ['tabel', '<table><thead><tr><th colspan="2">Desa</th></tr></thead><tbody><tr><td>A</td><td rowspan="2">10</td></tr><tr><td>B</td></tr></tbody></table>', '<table><thead><tr><th colspan="2">Desa</th></tr></thead><tbody><tr><td>A</td><td rowspan="2">10</td></tr><tr><td>B</td></tr></tbody></table>'],
    ['figure, gambar relatif, figcaption', '<figure><img src="/wp-content/uploads/2026/11/a.jpg" alt="Jalan &amp; jembatan" width="800" height="450" loading="lazy" /><figcaption>Foto: Redaksi</figcaption></figure>', '<figure><img src="/wp-content/uploads/2026/11/a.jpg" alt="Jalan &amp; jembatan" width="800" height="450" loading="lazy" /><figcaption>Foto: Redaksi</figcaption></figure>'],
    ['gambar alt kosong', '<img src="/a.jpg" alt="" />', '<img src="/a.jpg" alt="" />'],
    ['br dan hr', '<p>baris satu<br />baris dua</p><hr />', '<p>baris satu<br />baris dua</p><hr />'],
    ['inline lain', '<p><b>b</b> <i>i</i> <u>u</u> <s>s</s> x<sup>2</sup> H<sub>2</sub>O <code>npm ci</code></p>', '<p><b>b</b> <i>i</i> <u>u</u> <s>s</s> x<sup>2</sup> H<sub>2</sub>O <code>npm ci</code></p>'],
    ['pre dan code', '<pre><code>baris 1\n  baris 2 &lt;tag&gt;</code></pre>', '<pre><code>baris 1\n  baris 2 &lt;tag&gt;</code></pre>'],
    ['tautan https, mailto, relatif', '<p><a href="https://sumedangkab.go.id/berita?id=1&amp;x=2" title="Situs">situs</a> <a href="mailto:redaksi@inisumedang.id">surel</a> <a href="/kategori/nasional">kategori</a></p>', '<p><a href="https://sumedangkab.go.id/berita?id=1&amp;x=2" title="Situs" rel="noopener noreferrer">situs</a> <a href="mailto:redaksi@inisumedang.id">surel</a> <a href="/kategori/nasional">kategori</a></p>'],
    ['teks Indonesia dan emoji tidak berubah', '<p>Kabupaten Sumedang, Jawa Barat — “Tahu Sumedang” 🙂 ñ é</p>', '<p>Kabupaten Sumedang, Jawa Barat — “Tahu Sumedang” 🙂 ñ é</p>'],
    ['teks polos tanpa tag di-escape', 'a & b < c > d', 'a &amp; b &lt; c &gt; d'],
    ['tag tak dikenal dibuang, teks tetap', '<div class="wp-block-group"><span style="color:red">Teks</span> <section>dalam</section></div>', 'Teks dalam'],
    ['atribut class/id/style dibuang', '<p class="a" id="b" style="color:red" data-x="1">x</p>', '<p>x</p>'],
    ['sarang inline wajar', '<p><strong><em><a href="/x">dalam</a></em></strong></p>', '<p><strong><em><a href="/x">dalam</a></em></strong></p>']
  ])

  describe('atribut th/td dibatasi allowlist (hanya colspan/rowspan)', () => {
    const cell = (tag: 'th' | 'td', attrs: string): string => `<table><tbody><tr><${tag} ${attrs}>x</${tag}></tr></tbody></table>`
    const cellOut = (tag: 'th' | 'td', attrs = ''): string => `<table><tbody><tr><${tag}${attrs ? ` ${attrs}` : ''}>x</${tag}></tr></tbody></table>`
    const rows: Row[] = []
    for (const tag of ['th', 'td'] as const) {
      rows.push(
        [`${tag}: onclick dibuang`, cell(tag, 'onclick="alert(1)"'), cellOut(tag)],
        [`${tag}: onmouseover/onfocus tanpa kutip dibuang`, cell(tag, 'onmouseover=alert(1) onfocus=alert(2)'), cellOut(tag)],
        [`${tag}: style dibuang`, cell(tag, 'style="color:red;background:url(javascript:alert(1))"'), cellOut(tag)],
        [`${tag}: class dibuang`, cell(tag, 'class="wp-block"'), cellOut(tag)],
        [`${tag}: id dibuang`, cell(tag, 'id="x"'), cellOut(tag)],
        [`${tag}: align/width/bgcolor/scope/headers/data-* dibuang`, cell(tag, 'align="center" width="50" bgcolor="red" scope="col" headers="h1" data-x="1"'), cellOut(tag)],
        [`${tag}: background javascript dibuang`, cell(tag, 'background="javascript:alert(1)"'), cellOut(tag)],
        [`${tag}: colspan="2" lolos`, cell(tag, 'colspan="2"'), cellOut(tag, 'colspan="2"')],
        [`${tag}: rowspan="3" lolos`, cell(tag, 'rowspan="3"'), cellOut(tag, 'rowspan="3"')],
        [`${tag}: campuran, hanya colspan/rowspan yang tersisa`, cell(tag, 'onclick="alert(1)" style="color:red" class="c" id="i" colspan="2" rowspan="3" data-x="1"'), cellOut(tag, 'colspan="2" rowspan="3"')],
        [`${tag}: nilai colspan memecah atribut tetap ter-escape`, cell(tag, 'colspan="2&quot; onclick=&quot;alert(1)"'), cellOut(tag, 'colspan="2&quot; onclick=&quot;alert(1)"')]
      )
    }
    run(rows)
  })

  it('allowlist atribut th/td persis colspan dan rowspan', () => {
    assert.deepEqual(SANITIZE_ALLOWED_ATTRIBUTES.th, ['colspan', 'rowspan'])
    assert.deepEqual(SANITIZE_ALLOWED_ATTRIBUTES.td, ['colspan', 'rowspan'])
  })

  it('allowlist tag final tidak memuat h1/script/style/form', () => {
    for (const tag of ['h1', 'script', 'style', 'form', 'input', 'object', 'embed', 'meta', 'link', 'base', 'svg', 'math']) {
      assert.ok(!SANITIZE_ALLOWED_TAGS.includes(tag), tag)
    }
    assert.deepEqual(['iframe', 'img', 'a'].filter(tag => !SANITIZE_ALLOWED_TAGS.includes(tag)), [])
  })
})

describe('SN3 tautan eksternal', () => {
  run([
    ['https eksternal mendapat rel', '<a href="https://example.com/x">x</a>', '<a href="https://example.com/x" rel="noopener noreferrer">x</a>'],
    ['http eksternal mendapat rel', '<a href="http://example.com/x">x</a>', '<a href="http://example.com/x" rel="noopener noreferrer">x</a>'],
    ['skema huruf besar mendapat rel', '<a href="HTTPS://example.com/x">x</a>', '<a href="HTTPS://example.com/x" rel="noopener noreferrer">x</a>'],
    ['rel buatan penulis ditimpa', '<a href="https://example.com/x" rel="opener">x</a>', '<a href="https://example.com/x" rel="noopener noreferrer">x</a>'],
    ['target _blank dipertahankan + rel', '<a href="https://example.com/x" target="_blank">x</a>', '<a href="https://example.com/x" target="_blank" rel="noopener noreferrer">x</a>'],
    ['target _blank pada tautan relatif + rel', '<a href="/x" target="_blank">x</a>', '<a href="/x" target="_blank" rel="noopener noreferrer">x</a>'],
    ['target tak dikenal dibuang', '<a href="/x" target="evil">x</a>', '<a href="/x">x</a>'],
    ['tautan relatif tanpa rel', '<a href="/kategori/x">x</a>', '<a href="/kategori/x">x</a>'],
    ['mailto tanpa rel', '<a href="mailto:a@b.id">x</a>', '<a href="mailto:a@b.id">x</a>']
  ])
})

describe('SN4 gambar', () => {
  const cdn = 'https://cdn.example.id/wp-content/uploads/a.jpg'
  run([
    ['relatif lolos', '<img src="/a.jpg" alt="x" />', '<img src="/a.jpg" alt="x" />'],
    ['relatif tanpa garis miring awal lolos', '<img src="uploads/a.jpg" alt="x" />', '<img src="uploads/a.jpg" alt="x" />'],
    ['host luar allowlist dibuang (allowlist kosong)', `<img src="${cdn}" alt="x">`, ''],
    ['http dibuang', '<img src="http://cdn.example.id/a.jpg">', ''],
    ['protokol relatif dibuang', '<img src="//cdn.example.id/a.jpg">', ''],
    ['garis miring terbalik dibuang', '<img src="\\\\cdn.example.id\\a.jpg">', ''],
    ['data: dibuang', '<img src="data:image/png;base64,AAAA">', ''],
    ['tanpa src dibuang', '<img alt="x">', ''],
    ['src kosong dibuang', '<img src="" alt="x">', ''],
    ['lebar/tinggi bukan angka dibuang', '<img src="/a.jpg" width="100%" height="auto" loading="eager">', '<img src="/a.jpg" loading="eager" />'],
    ['loading tak dikenal dibuang', '<img src="/a.jpg" loading="evil">', '<img src="/a.jpg" />'],
    ['gambar tanpa host di tengah teks tidak merusak teks', '<p>a<img src="https://evil.com/a.png">b</p>', '<p>ab</p>']
  ])

  const withHost = createArticleSanitizer({ imageHosts: ['cdn.example.id'] })
  run([
    ['host allowlist (konfigurasi) lolos', `<img src="${cdn}" alt="x">`, `<img src="${cdn}" alt="x" />`],
    ['host allowlist huruf besar lolos', '<img src="HTTPS://CDN.EXAMPLE.ID/a.jpg">', '<img src="HTTPS://CDN.EXAMPLE.ID/a.jpg" />'],
    ['subdomain palsu dibuang', '<img src="https://cdn.example.id.evil.com/a.jpg">', ''],
    ['userinfo trik dibuang', '<img src="https://cdn.example.id@evil.com/a.jpg">', ''],
    ['userinfo pada host allowlist dibuang', '<img src="https://evil.com@cdn.example.id/a.jpg">', ''],
    ['port dibuang', '<img src="https://cdn.example.id:8443/a.jpg">', ''],
    ['http pada host allowlist dibuang', '<img src="http://cdn.example.id/a.jpg">', ''],
    ['host lain tetap dibuang', '<img src="https://evil.com/a.jpg">', '']
  ], withHost)

  it('default IMAGE_ALLOWED_HOSTS kosong (hanya relatif/same-origin)', () => {
    assert.deepEqual([...IMAGE_ALLOWED_HOSTS], [])
  })
})

describe('SN5 embed', () => {
  const hosts = ['youtube.com', 'www.youtube.com', 'youtube-nocookie.com', 'www.youtube-nocookie.com']
  it('daftar host embed bawaan = hanya YouTube', () => {
    assert.deepEqual([...EMBED_ALLOWED_HOSTS], hosts)
  })

  run(hosts.map((host): Row => [
    `YouTube lolos: ${host}`,
    `<iframe src="https://${host}/embed/dQw4w9WgXcQ"></iframe>`,
    ytFrame(`https://${host}/embed/dQw4w9WgXcQ`)
  ]))

  run([
    ['kode embed YouTube lazim (atribut dibatasi, sandbox dan referrerpolicy dipaksa)',
      '<iframe width="560" height="315" src="https://www.youtube.com/embed/dQw4w9WgXcQ?si=abc" title="Video" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="unsafe-url" allowfullscreen style="border:0" onload="alert(1)" sandbox="allow-top-navigation"></iframe>',
      `<iframe width="560" height="315" src="https://www.youtube.com/embed/dQw4w9WgXcQ" title="Video" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="${POLICY}" allowfullscreen sandbox="${SANDBOX}" loading="lazy"></iframe>`],
    ['parameter pemutar aman dipertahankan, lainnya dibuang', '<iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ?start=5&end=9&rel=0&autoplay=1&origin=https://evil.com&playlist=abcdefgh&foo=bar"></iframe>', ytFrame('https://www.youtube.com/embed/dQw4w9WgXcQ?start=5&amp;end=9&amp;rel=0')],
    ['nilai parameter tak valid dibuang', '<iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ?start=abc&rel=2&controls=1"></iframe>', ytFrame('https://www.youtube.com/embed/dQw4w9WgXcQ?controls=1')],
    ['fragmen dibuang', '<iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ#x"></iframe>', ytFrame(YT)],
    ['host huruf besar dinormalkan', '<iframe src="HTTPS://WWW.YOUTUBE.COM/embed/dQw4w9WgXcQ"></iframe>', ytFrame(YT)],
    ['id dengan _ dan -', '<iframe src="https://www.youtube.com/embed/a_b-C1d2E3f"></iframe>', ytFrame('https://www.youtube.com/embed/a_b-C1d2E3f')],
    ['id 6 dan 20 karakter', '<iframe src="https://www.youtube.com/embed/abcdef"></iframe><iframe src="https://www.youtube.com/embed/abcdefghij0123456789"></iframe>', ytFrame('https://www.youtube.com/embed/abcdef') + ytFrame('https://www.youtube.com/embed/abcdefghij0123456789')],
    ['loading eager dipertahankan', '<iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ" loading="eager"></iframe>', `<iframe src="${YT}" loading="eager" sandbox="${SANDBOX}" referrerpolicy="${POLICY}"></iframe>`],
    ['lebar/tinggi bukan angka dan allow tak aman dibuang', '<iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ" width="100%" height="javascript:1" allow="camera; microphone; geolocation"></iframe>', ytFrame(YT)],
    ['isi iframe tidak dikeluarkan', '<iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ"><img src=x onerror=alert(1)><script>alert(1)</script>teks</iframe><p>ok</p>', ytFrame(YT) + '<p>ok</p>'],
    ['iframe YouTube tak tertutup menelan sisa masukan', '<iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ"><img src=x onerror=alert(1)>', ytFrame(YT)],
    ['iframe dalam figure dengan teks sekitar', '<figure><iframe src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ"></iframe><figcaption>Video</figcaption></figure>', `<figure>${ytFrame('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ')}<figcaption>Video</figcaption></figure>`]
  ])

  const rejected: Array<[string, string]> = [
    ['Vimeo', 'https://player.vimeo.com/video/123456789'],
    ['host lain dengan path /embed/', 'https://evil.com/embed/dQw4w9WgXcQ'],
    ['youtube.com.evil.com', 'https://youtube.com.evil.com/embed/dQw4w9WgXcQ'],
    ['www.youtube.com.evil.com', 'https://www.youtube.com.evil.com/embed/dQw4w9WgXcQ'],
    ['evil.com/youtube.com', 'https://evil.com/youtube.com/embed/dQw4w9WgXcQ'],
    ['evil-youtube.com', 'https://evilyoutube.com/embed/dQw4w9WgXcQ'],
    ['subdomain tak terdaftar', 'https://m.youtube.com/embed/dQw4w9WgXcQ'],
    ['http', 'http://www.youtube.com/embed/dQw4w9WgXcQ'],
    ['protokol relatif', '//www.youtube.com/embed/dQw4w9WgXcQ'],
    ['relatif', '/embed/dQw4w9WgXcQ'],
    ['path /watch', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'],
    ['path /v/', 'https://www.youtube.com/v/dQw4w9WgXcQ'],
    ['youtu.be', 'https://youtu.be/dQw4w9WgXcQ'],
    ['/embed/ tanpa id', 'https://www.youtube.com/embed/'],
    ['/embed tanpa garis miring', 'https://www.youtube.com/embed'],
    ['id terlalu pendek', 'https://www.youtube.com/embed/abc12'],
    ['id terlalu panjang', 'https://www.youtube.com/embed/abcdefghij01234567890'],
    ['id berkarakter aneh', 'https://www.youtube.com/embed/abc<def>ghi'],
    ['path tambahan', 'https://www.youtube.com/embed/dQw4w9WgXcQ/extra'],
    ['garis miring akhir', 'https://www.youtube.com/embed/dQw4w9WgXcQ/'],
    ['path traversal', 'https://www.youtube.com/embed/../watch/dQw4w9WgXcQ'],
    ['path traversal ter-encode', 'https://www.youtube.com/embed/%2e%2e/dQw4w9WgXcQ'],
    ['path ter-encode', 'https://www.youtube.com/%65mbed/dQw4w9WgXcQ'],
    ['userinfo menyamar (host asli evil)', 'https://www.youtube.com@evil.com/embed/dQw4w9WgXcQ'],
    ['userinfo pada host diizinkan', 'https://evil.com@www.youtube.com/embed/dQw4w9WgXcQ'],
    ['port', 'https://www.youtube.com:8443/embed/dQw4w9WgXcQ'],
    ['port bawaan eksplisit', 'https://www.youtube.com:443/embed/dQw4w9WgXcQ'],
    ['titik di akhir host', 'https://www.youtube.com./embed/dQw4w9WgXcQ'],
    ['host ter-encode', 'https://www.youtube.com%2eevil.com/embed/dQw4w9WgXcQ'],
    ['host unicode mirip', 'https://www.youtübe.com/embed/dQw4w9WgXcQ'],
    ['garis miring terbalik', 'https:\\\\www.youtube.com\\embed\\dQw4w9WgXcQ'],
    ['skema https tanpa //', 'https:www.youtube.com/embed/dQw4w9WgXcQ'],
    ['data:', 'data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg=='],
    ['javascript:', 'javascript:alert(1)'],
    ['skema java\\tscript', 'java\tscript:alert(1)'],
    ['spasi di dalam host', 'https://www.youtube.com /embed/dQw4w9WgXcQ'],
    ['kontrol di dalam', 'https://www.youtube.com/embed/dQw4w9\u0000WgXcQ'],
    ['kosong', '']
  ]
  run(rejected.map(([name, src]): Row => [`dibuang: ${name}`, `<iframe src="${src}"></iframe><p>ok</p>`, '<p>ok</p>']))

  it('src embed dibangun ulang (tidak menyalin masukan mentah)', () => {
    const out = sanitizeArticleHtml('<iframe src="  https://www.youtube.com/embed/dQw4w9WgXcQ?start=5&amp;x=%22onload%3Dalert(1)  "></iframe>')
    assert.equal(out, ytFrame('https://www.youtube.com/embed/dQw4w9WgXcQ?start=5'))
  })

  describe('perluasan lewat konfigurasi', () => {
    const extra = 'https://video.example.org/embed/abc12345'
    const extended = createArticleSanitizer({ embedHosts: [...EMBED_ALLOWED_HOSTS, 'video.example.org'] })
    it('host tambahan ditolak oleh konfigurasi bawaan', () => {
      assert.equal(sanitizeArticleHtml(`<iframe src="${extra}"></iframe>`), '')
    })
    it('host tambahan lolos setelah ditambahkan ke konfigurasi', () => {
      assert.equal(extended(`<iframe src="${extra}"></iframe>`), ytFrame(extra))
    })
    it('YouTube tetap lolos dan aturan lain tetap berlaku untuk host tambahan', () => {
      assert.equal(extended(`<iframe src="${YT}"></iframe>`), ytFrame(YT))
      for (const bad of ['http://video.example.org/embed/abc12345', 'https://video.example.org/watch/abc12345', 'https://video.example.org.evil.com/embed/abc12345', 'https://video.example.org:8443/embed/abc12345', '//video.example.org/embed/abc12345', 'https://video.example.org@evil.com/embed/abc12345']) {
        assert.equal(extended(`<iframe src="${bad}"></iframe>`), '', bad)
      }
    })
    it('daftar pengganti tanpa YouTube menolak YouTube', () => {
      const only = createArticleSanitizer({ embedHosts: ['video.example.org'] })
      assert.equal(only(`<iframe src="${YT}"></iframe>`), '')
    })
    it('sandbox dan referrerpolicy tetap dipaksa untuk host tambahan', () => {
      const out = extended(`<iframe src="${extra}" sandbox="allow-top-navigation" referrerpolicy="unsafe-url"></iframe>`)
      assert.match(out, /sandbox="allow-scripts allow-same-origin allow-presentation allow-popups allow-popups-to-escape-sandbox"/)
      assert.match(out, /referrerpolicy="strict-origin-when-cross-origin"/)
      assert.doesNotMatch(out, /allow-top-navigation|unsafe-url/)
    })
  })
})

describe('SN6 masukan kosong, besar, dan bersarang dalam', () => {
  it('kosong, null, undefined, dan bukan string menghasilkan string kosong tanpa melempar', () => {
    for (const value of ['', null, undefined, 0, 42, true, false, {}, [], ['<p>x</p>'], Symbol('x'), () => '<p>x</p>', 10n]) {
      assert.equal(sanitizeArticleHtml(value), '', String(typeof value))
    }
  })

  it('hanya spasi tidak melempar dan tetap string', () => {
    assert.equal(typeof sanitizeArticleHtml('   \n\t  '), 'string')
  })

  it('tepat di batas ukuran diproses; satu karakter lebih dari batas menghasilkan string kosong', () => {
    const atLimit = 'a'.repeat(SANITIZE_MAX_INPUT_LENGTH)
    assert.equal(sanitizeArticleHtml(atLimit).length, SANITIZE_MAX_INPUT_LENGTH)
    assert.equal(sanitizeArticleHtml(atLimit + 'a'), '')
  })

  it('masukan 5 MB menghasilkan string kosong dengan cepat', () => {
    const big = '<p>x</p>'.repeat(Math.ceil((5 * 1024 * 1024) / 8)).slice(0, 5 * 1024 * 1024)
    const start = performance.now()
    assert.equal(sanitizeArticleHtml(big), '')
    assert.ok(performance.now() - start < 1000)
  })

  it('artikel besar yang wajar (sekitar 1,9 MB) diproses dalam batas waktu', () => {
    const paragraph = `<p>${'Pemerintah Kabupaten Sumedang menyampaikan &amp; menjelaskan program. '.repeat(7)}<a href="https://example.com/x">tautan</a></p>`
    const input = paragraph.repeat(Math.floor(1.9 * 1024 * 1024 / paragraph.length))
    assert.ok(input.length > 1.8 * 1024 * 1024 && input.length <= SANITIZE_MAX_INPUT_LENGTH)
    const start = performance.now()
    const output = sanitizeArticleHtml(input)
    const elapsed = performance.now() - start
    assert.ok(output.startsWith('<p>Pemerintah'))
    assert.ok(elapsed < 5000, `terlalu lambat: ${elapsed} ms`)
  })

  it('sarang 10.000 tingkat (tertutup) selesai, tanpa melempar, kedalaman keluaran dibatasi', () => {
    const input = '<blockquote>'.repeat(10000) + 'dalam' + '</blockquote>'.repeat(10000)
    const start = performance.now()
    const output = sanitizeArticleHtml(input)
    assert.ok(performance.now() - start < 5000)
    assert.ok(output.includes('dalam'))
    assert.equal(output.split('<blockquote>').length - 1, SANITIZE_NESTING_LIMIT)
    assert.equal(output.split('</blockquote>').length - 1, SANITIZE_NESTING_LIMIT)
  })

  // Angka di dua uji berikut SENGAJA literal (bukan impor konstanta): uji yang diturunkan dari konstanta tetap hijau
  // saat batas dinaikkan sembarangan. Mengubah batas di sanitize-config.ts = ubah angka di sini (keputusan PM/pemilik [I]).
  it('batas sarang literal 50: tepat 50 tingkat utuh; 51 tingkat membuang tag tingkat ke-51 (teks tetap)', () => {
    const nest = (depth: number): string => '<blockquote>'.repeat(depth) + 'dalam' + '</blockquote>'.repeat(depth)
    const count = (output: string, tag: string): number => output.split(tag).length - 1
    assert.equal(SANITIZE_NESTING_LIMIT, 50)

    assert.equal(sanitizeArticleHtml(nest(50)), nest(50))
    assert.equal(sanitizeArticleHtml(nest(49)), nest(49))

    const over = sanitizeArticleHtml(nest(51))
    assert.equal(over, nest(50))
    assert.equal(count(over, '<blockquote>'), 50)
    assert.equal(count(over, '</blockquote>'), 50)
    assert.ok(over.includes('dalam'))
  })

  it('masukan bersarang jauh di atas batas keluar paling banyak sedalam 50 (tertutup dan tak tertutup)', () => {
    const count = (output: string, tag: string): number => output.split(tag).length - 1
    for (const depth of [52, 100, 1000, 10000]) {
      const closed = sanitizeArticleHtml('<blockquote>'.repeat(depth) + 'dalam' + '</blockquote>'.repeat(depth))
      assert.equal(count(closed, '<blockquote>'), 50, `tertutup ${depth}`)
      assert.ok(closed.includes('dalam'), `tertutup ${depth}`)

      const open = sanitizeArticleHtml('<blockquote>'.repeat(depth) + 'dalam')
      assert.equal(count(open, '<blockquote>'), 50, `tak tertutup ${depth}`)
      assert.ok(open.includes('dalam'), `tak tertutup ${depth}`)
    }
  })

  it('batas ukuran literal 2.097.152 karakter (teks polos tanpa "<"): tepat batas diproses, batas+1 menghasilkan string kosong', () => {
    const limit = 2_097_152
    assert.equal(SANITIZE_MAX_INPUT_LENGTH, limit)

    const atLimit = sanitizeArticleHtml('a'.repeat(limit))
    assert.notEqual(atLimit, '')
    assert.equal(atLimit.length, limit)

    assert.equal(sanitizeArticleHtml('a'.repeat(limit + 1)), '')
    assert.equal(sanitizeArticleHtml('a'.repeat(limit + 1000)), '')
  })

  it('sarang 10.000 tingkat tak tertutup (div, span, ul>li) selesai tanpa melempar', () => {
    for (const unit of ['<div>', '<span>', '<ul><li>', '<blockquote>', '<table><tr><td>']) {
      const start = performance.now()
      const output = sanitizeArticleHtml(unit.repeat(10000) + 'x')
      assert.equal(typeof output, 'string')
      assert.ok(performance.now() - start < 5000, unit)
    }
  })

  it('tag melebihi SANITIZE_MAX_TAG_OPENINGS menghasilkan string kosong; tepat di batas diproses', () => {
    assert.equal(sanitizeArticleHtml('<b>'.repeat(SANITIZE_MAX_TAG_OPENINGS + 1)), '')
    const start = performance.now()
    const output = sanitizeArticleHtml('<b>'.repeat(SANITIZE_MAX_TAG_OPENINGS))
    assert.equal(typeof output, 'string')
    assert.ok(performance.now() - start < 5000)
  })

  it('HTML rusak tidak melempar dan tidak menghasilkan tag berbahaya', () => {
    const broken = ['<', '>', '<<<>>>', '</p></p></div>', '<p', '<p class="', '<a href="x', '<a href=', '<img', '<img src=', '<!--', '<!-- x', '<![CDATA[', '<?', '<script', '<iframe', '<iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ', '&', '&#', '&#x;', '&bogus;', '&#99999999999;', '<p>\u0000\u0001\u0002</p>', '<b><i></b></i>', '<table><td>x</table>', '\uD800 <p>x</p>']
    for (const input of broken) {
      const output = sanitizeArticleHtml(input)
      assert.equal(typeof output, 'string', input)
      assert.doesNotMatch(output, /<\s*(script|svg|style|form|object|embed)\b|\son[a-z]+\s*=|javascript:/i, input)
    }
  })

  it('bukan string tidak memicu pembacaan properti (objek berbahaya tidak dievaluasi)', () => {
    const trap = { toString() { throw new Error('tidak boleh dipanggil') }, valueOf() { throw new Error('tidak boleh dipanggil') } }
    assert.equal(sanitizeArticleHtml(trap), '')
  })
})

describe('SN7/SN8 tanpa direktif HTML mentah Vue dan penyanitasi hanya di server', () => {
  const root = join(import.meta.dirname, '..', '..')
  const SKIP = new Set(['node_modules', '.nuxt', '.output', '.data', '.nitro', '.git'])
  const files = (dir: string): string[] => readdirSync(dir).flatMap((name) => {
    if (SKIP.has(name)) return []
    const path = join(dir, name)
    return statSync(path).isDirectory() ? files(path) : [path]
  })
  const sources = (dir: string): Array<[string, string]> => files(join(root, dir))
    .filter(path => /\.(vue|ts|js|mjs|mts|css)$/.test(path))
    .map(path => [path, readFileSync(path, 'utf8')])

  it('app/ dan server/ tidak memuat direktif HTML mentah Vue', () => {
    const directive = 'v-' + 'html'
    const hits = [...sources('app'), ...sources('server')].filter(([, text]) => text.includes(directive)).map(([path]) => path)
    assert.deepEqual(hits, [])
  })

  it('app/ tidak mengimpor penyanitasi atau sanitize-html (tidak masuk bundel klien)', () => {
    const hits = sources('app').filter(([, text]) => /sanitize-html|sanitize-article-html|sanitize-config/.test(text)).map(([path]) => path)
    assert.deepEqual(hits, [])
  })
})

describe('invarian seluruh korpus uji', () => {
  it('keluaran bebas pola berbahaya (kecuali kasus yang sengaja berisi teks ter-escape atau h1)', () => {
    for (const input of all.filter(item => !item.includes('&lt;') && !item.includes('<h1>'))) {
      assertSafe(sanitizeArticleHtml(input), input)
    }
  })

  it('idempoten: menyanitasi keluaran sekali lagi tidak mengubahnya', () => {
    for (const input of all) {
      const once = sanitizeArticleHtml(input)
      assert.equal(sanitizeArticleHtml(once), once, input)
    }
  })

  it('korpus memuat ratusan kasus (penjaga agar tes tidak kosong)', () => {
    assert.ok(all.length >= 150, String(all.length))
  })
})
