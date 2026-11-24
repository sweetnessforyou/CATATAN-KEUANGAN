/* =====================================================================
   slides.js — navigasi 3 section: #s1 (saldo s.d. uang bulanan) tampil
   pertama; #s2 catat transaksi; #s3 rincian pengeluaran + riwayat.
   Tombol garis tiga #burger di header membuka menu section lain,
   tiap section punya tombol kembali.
   ===================================================================== */
window.Keu = window.Keu || {};
(function (K) {
  'use strict';

  /* tampilkan satu section, sembunyikan lainnya */
  function show(id) {
    document.querySelectorAll('.slide').forEach(function (el) {
      if (el.id === id) el.removeAttribute('hidden');
      else el.setAttribute('hidden', '');
    });
    /* gulir ke atas, baik di halaman biasa maupun di dalam layar HP */
    window.scrollTo(0, 0);
    var m = document.querySelector('.screen main');
    if (m) m.scrollTop = 0;
    /* lebar elemen terbaca 0 selama section hidden (display:none), sehingga
       fit angka pill/ring (#sin #sout #stav #cV #mV) tidak menyusutkan font.
       Render ulang setelah s1 terlihat agar pengukuran selalu akurat —
       render pertama saat s1 masih hidden tidak merusak lagi. */
    if (id === 's1' && K.render) K.render();
  }
  K.showSlide = show;

  /* pasang tombol kembali + wiring menu garis tiga */
  function wire() {
    document.querySelectorAll('.slide:not(#s1)').forEach(function (el) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'back';
      b.setAttribute('aria-label', 'Kembali ke awal');
      b.textContent = '← Kembali';
      b.onclick = function () { show('s1'); };
      el.insertBefore(b, el.firstChild);
    });
    /* menu garis tiga: buka/tutup, pilih section, tutup jika klik di luar */
    var burger = document.getElementById('burger');
    var menu = document.getElementById('mmenu');
    if (burger && menu) {
      function close() {
        menu.hidden = true;
        burger.setAttribute('aria-expanded', 'false');
      }
      burger.onclick = function (e) {
        e.stopPropagation();
        menu.hidden = !menu.hidden;
        burger.setAttribute('aria-expanded', String(!menu.hidden));
      };
      menu.querySelectorAll('button[data-go]').forEach(function (b) {
        b.onclick = function () { close(); show(b.getAttribute('data-go')); };
      });
      document.addEventListener('click', function (e) {
        if (!menu.hidden && !menu.contains(e.target)) close();
      });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') close();
      });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wire);
  else wire();
})(window.Keu);
