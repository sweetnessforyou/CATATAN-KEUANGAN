# AGENTS.md — peta proyek

Aplikasi catatan keuangan: **satu halaman statis**. Tanpa framework, tanpa build, tanpa npm,
tanpa `import/export` (harus jalan dari `file://` saat `index.html` di-double-click).
Jangan menambahkan bundler/ES module — akan merusak cara buka file langsung.

## ATURAN HEMAT TOKEN (baca ini dulu)

1. **Jangan baca seluruh folder.** Pakai tabel di bawah untuk menemukan file, lalu baca HANYA file itu.
2. Satu fitur = satu pasang file: `css/<fitur>.css` + `js/<fitur>.js`.
   Perubahan tampilan biasanya cukup 1 file CSS; perubahan logika cukup 1 file JS.
3. `index.html` **jarang** perlu diubah — hanya kalau menambah/menghapus section (markup) baru.
4. `legacy/` berisi versi monolitik lama (±35 KB). Jangan dibaca atau diubah.
5. Jangan menyalin / menulis ulang seluruh aplikasi. Edit bagian yang diminta saja.

## Peta file

| Kalau tugasnya tentang… | File |
| --- | --- |
| warna, font, tekstur kertas, jarak halaman | `css/base.css` |
| hiasan latar (koin, uang, kalkulator) | `css/decor.css` + markup `#dA`–`#dF` di `index.html` |
| bingkai HP (desktop) & jam status bar | `css/phone.css` + `js/phone.js`, markup `.phone > .screen` di `index.html` |
| header, tombol bulan, grid 2 kolom, blok saldo | `css/layout.css` |
| bentuk "kertas" + selotip | `css/sheets.css` |
| kartu ringkasan / donut / daftar kategori | `css/summary.css` + `js/summary.js` |
| kartu catat transaksi | `css/form.css` + `js/form.js` |
| kartu anggaran bulanan | `css/budget.css` + `js/budget.js` |
| kartu riwayat / struk | `css/history.css` + `js/history.js` |
| animasi & `prefers-reduced-motion` | `css/motion.css` (dimuat paling akhir) |
| daftar kategori, warna, ikon | `js/categories.js` |
| format Rp / tanggal, helper DOM, segmented control | `js/utils.js` |
| state aplikasi (`K.s`) & filter periode | `js/state.js` |
| simpan/baca localStorage & sinkron cloud | `js/storage.js` |
| urutan render global, ganti bulan, start app | `js/app.js` |

## Struktur

```
index.html          markup + aset SVG + daftar <link>/<script> (urutan penting)
css/                base → decor → layout → sheets → summary → form → budget → history → phone → slides → motion
js/                 categories → utils → phone → state → storage → summary → budget → history → form → slides → app
legacy/             arsip versi lama, jangan disentuh
```

Tampilan dibagi 3 section: `#s1` (saldo s.d. uang bulanan + menu, tampilan awal), `#s2` (catat
transaksi), `#s3` (rincian pengeluaran s.d. riwayat). Navigasi di `js/slides.js`
(`K.showSlide(id)`); tombol "Kembali" dan dropdown `#jump` di section 1 dipasang otomatis.

Urutan `<script>` di `index.html` **wajib** dipertahankan: `app.js` butuh semua modul
sudah terdaftar, `state.js` butuh `K.ds` dari `utils.js`.

## Pola kode (ikuti, jangan diubah gayanya)

- Setiap file JS: IIFE yang menempel ke namespace global.

  ```js
  window.Keu = window.Keu || {};
  (function (K) {
    'use strict';
    var S = K.s;
    // ...
    K.namaFungsi = function () { /* ... */ };
  })(window.Keu);
  ```

- **State tunggal** ada di `K.s` (didefinisikan `js/state.js`). Jangan buat variabel global baru.
  Field: `txs, budgets, ref, mode, seen, month, per, stab, ftype, fcat, fsrc, sel, hov, items, total, cnt`.
- **Render** hanya didefinisikan di `js/app.js` (`K.render()`). Modul lain menyediakan
  `K.renderSummary()`, `K.renderBudget()`, `K.renderHistory()` lalu dipanggil dari `render()`.
- Setiap event handler yang mengubah state: ubah `S.*` lalu panggil `K.render()`
  (atau `highlight()` untuk perubahan sorotan saja).
- Data transaksi: `{ id, type:'in'|'out', amount, cat, note, date:'YYYY-MM-DD' }`.
- Penyimpanan: `localStorage` kunci `"keuangan"` bentuk `{ txs, budgets }`.
  Mode cloud hanya aktif bila `window.claude.use('db')` ada; kode cloud terisolasi di `js/storage.js`.
- Gaya CSS: satu baris per aturan, tanpa preprocessor, variabel warna dari `:root` di `base.css`.
  Jangan hardcode warna kecuali warna khas kategori (pakai `K.COL` / `var(--c)`).
- Teks UI berbahasa Indonesia. Angka memakai `K.rp()` / `K.mlabel()`, bukan format manual.

## Konvensi id elemen (dipakai lintas modul)

`#bal #sin #sout` saldo · `#ml #pv #nx` navigasi bulan · `#tabs #per` tab ringkasan ·
`#rs #cl #cI #cL #cV #cS` ring · `#amt #cats #dt #note #sv #f` form pengeluaran · `#amti #catsi #dti #notei #svi #fi` form pemasukan (dua kolom, tanpa tab) · `#rm #mV #mS #mcap` ring uang bulanan ·
`#buds #bsub` anggaran · `#list #flt` riwayat · `#st #mode` status penyimpanan.

## Cara verifikasi

Buka `index.html` di browser, cek bagian yang diubah, dan pastikan tidak ada error di console.
**Setelah setiap selesai mengerjakan, selalu tampilkan hasilnya** (reload tab `index.html`
di browser dan ambil screenshot) agar bisa dicek oleh pengguna.
Tidak ada test suite / lint. Jangan menambahkannya tanpa diminta.
