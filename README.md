# Catatan Keuangan

Aplikasi pencatatan keuangan pribadi berupa **satu halaman statis**: HTML + CSS + JS murni.
Tidak butuh install, server, atau build. Cukup buka `index.html` (double-click) di browser.

Data tersimpan di `localStorage` browser (kunci `keuangan`), jadi tetap ada setelah halaman ditutup.
Jika dibuka di lingkungan yang menyediakan `window.claude.use('db')`, data otomatis disinkronkan online.

## Struktur

```
index.html          kerangka halaman + aset SVG dekorasi
css/
  base.css          variabel warna/font, reset, kerangka main
  decor.css         hiasan latar
  layout.css        header, navigasi bulan, grid, blok saldo
  sheets.css        dasar "kertas" + selotip
  summary.css       kartu ringkasan (donut + daftar kategori)
  form.css          kartu catat transaksi
  budget.css        kartu anggaran bulanan
  history.css       kartu riwayat (struk)
  motion.css        aturan reduced-motion (dimuat terakhir)
js/
  categories.js     daftar kategori, warna, ikon
  utils.js          helper format Rupiah/tanggal, DOM, segmented control
  state.js          state global (K.s) + filter periode
  storage.js        localStorage dan sinkron cloud
  summary.js        ringkasan + donut chart
  budget.js         anggaran bulanan
  history.js        riwayat transaksi
  form.js           form catat transaksi
  app.js            render global, ganti bulan, start aplikasi
legacy/             arsip versi monolitik lama (tidak dipakai)
AGENTS.md           peta file untuk asisten/agen (hemat token)
```

## Mau ubah apa? → buka file ini saja

| Kebutuhan | File |
| --- | --- |
| Ganti warna/font keseluruhan | `css/base.css` |
| Tambah kategori baru | `js/categories.js` (tambah di `OUT`/`IN`, `COL`, `P`) |
| Ubah cara hitung ringkasan/donut | `js/summary.js` |
| Ubah validasi/format form transaksi | `js/form.js` |
| Ubah perhitungan anggaran | `js/budget.js` |
| Ubah tampilan daftar riwayat | `js/history.js` + `css/history.css` |
| Ubah cara simpan data / pindah ke database lain | `js/storage.js` |
| Ubah jumlah item riwayat yang ditampilkan | `js/history.js` (`slice(0, 50)`) |

Struktur ini dibuat supaya perubahan kecil tidak perlu membaca seluruh proyek — cukup satu file
CSS dan/atau satu file JS yang sesuai.

## Catatan teknis

- **Tanpa build step.** Script dimuat sebagai `<script src>` biasa (bukan ES module) agar tetap
  bisa dibuka lewat `file://`. Urutan pemuatan di `index.html` penting: `state.js` butuh `utils.js`,
  dan `app.js` harus paling akhir.
- Semua modul menempel ke satu namespace global `window.Keu`; state ada di `window.Keu.s`.
- Render terpusat: `Keu.render()` memanggil `renderSummary()`, `renderBudget()`, `renderHistory()`.
- Data transaksi: `{ id, type: 'in'|'out', amount, cat, note, date }`.
- Versi lama (satu file besar) ada di `legacy/` hanya sebagai cadangan — boleh dihapus kapan saja.
