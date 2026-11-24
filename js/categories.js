/* =====================================================================
   categories.js — satu-satunya tempat daftar kategori, warna, dan ikon.
   Menambah kategori baru cukup di sini (OUT/IN + COL + P).
   ===================================================================== */
window.Keu = window.Keu || {};
(function (K) {
  'use strict';

  /* kategori pengeluaran & pemasukan (urutan = urutan tampil) */
  K.OUT = ['Makan', 'Transport', 'Belanja', 'Bayar Listrik', 'Hiburan', 'Kesehatan', 'Tabungan'];
  K.IN = ['Gaji', 'Bonus', 'Lainnya'];

  /* warna kategori (dipakai ring, ikon, progress anggaran) */
  K.COL = {
    Makan: '#d9532f', Transport: '#3b78c2', Belanja: '#3f9d55', 'Bayar Listrik': '#e6a416',
    Hiburan: '#8a5fb0', Kesehatan: '#cf4f78', Tabungan: '#1a9e8f',
    Gaji: '#2f9e44', Bonus: '#d9921a', Lainnya: '#6b7b80',
    /* alias untuk transaksi lama yang masih memakai nama kategori sebelumnya */
    Tagihan: '#e6a416'
  };

  /* path ikon SVG 24x24 (stroke) per kategori */
  K.P = {
    Makan: '<path d="M3 2v7a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V2M7 2v20M21 15V2a5 5 0 0 0-5 5v6a2 2 0 0 0 2 2h3zm0 0v7"/>',
    Transport: '<path d="M19 17h2a1 1 0 0 0 1-1v-3a2 2 0 0 0-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3A3 3 0 0 0 12 7H5a1.6 1.6 0 0 0-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4a1 1 0 0 0 1 1h2M9 17h6"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/>',
    Belanja: '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0"/>',
    Tagihan: '<path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1zM16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8M12 17.5v-11"/>',
    'Bayar Listrik': '<path d="M13 2 3 14h9l-1 8 10-12h-9z"/>',
    Hiburan: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
    Kesehatan: '<path d="M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7z"/>',
    Tabungan: '<path d="M3.4 10h17.2v8.2a2.8 2.8 0 0 1-2.8 2.8H6.2a2.8 2.8 0 0 1-2.8-2.8z"/><path d="M4.6 10V8.6a1.6 1.6 0 0 1 1.6-1.6h11.6a1.6 1.6 0 0 1 1.6 1.6V10"/><path d="M9.4 6.9h5.2"/><ellipse cx="13.4" cy="3.1" rx="2.9" ry="1.4" transform="rotate(-24 13.4 3.1)"/>',
    Lainnya: '<circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>',
    Gaji: '<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/>',
    Bonus: '<path d="M12 2l3 6.9 7 .7-5.3 4.7 1.6 7.2L12 17.8 5.7 21.5l1.6-7.2L2 9.6l7-.7z"/>'
  };

  /* ikon "Tagihan" (data lama) = ikon listrik */
  K.P.Tagihan = K.P['Bayar Listrik'];

  /* buat markup <svg> ikon kategori */
  K.svg = function (n, s) {
    return '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (K.P[n] || K.P.Lainnya) + '</svg>';
  };
})(window.Keu);
