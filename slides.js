/* =====================================================================
   slides.js — navigasi 3 section: #s1 (saldo s.d. uang bulanan) tampil
   pertama; #s2 catat transaksi; #s3 rincian pengeluaran + riwayat.
   Tombol garis tiga #burger di header membuka menu section lain,
   tiap section punya tombol kembali.
   ===================================================================== */
window.Keu = window.Keu || {};
(function (K) {
  'use strict';

  /* section yang sedang keluar (animasi .leave) + penanda urutan perpindahan
     agar klik cepat saat animasi berlangsung tidak saling menimpa */
  var leaving = null;   // section yang sedang meluncur keluar
  var leaveTimer = 0;   // cadangan bila animationend tak terpicu
  var leaveDone = null; // handler animationend milik leave yang berjalan
  var seq = 0;

  /* batalkan animasi keluar yang berjalan: section tetap terlihat */
  function cancelLeave() {
    if (!leaving) return;
    var el = leaving;
    leaving = null;
    clearTimeout(leaveTimer);
    if (leaveDone) el.removeEventListener('animationend', leaveDone);
    leaveDone = null;
    el.classList.remove('leave');
  }

  /* selesaikan animasi keluar: sembunyikan section lama */
  function finishLeave() {
    if (!leaving) return;
    var el = leaving;
    leaving = null;
    clearTimeout(leaveTimer);
    if (leaveDone) el.removeEventListener('animationend', leaveDone);
    leaveDone = null;
    el.classList.remove('leave');
    el.setAttribute('hidden', '');
  }

  /* tampilkan satu section, sembunyikan lainnya */
  function show(id) {
    /* :not(.leave) — section yang sedang keluar sudah diambil alih animasinya,
       jangan jadikan "current" dua kali saat klik cepat */
    var cur = document.querySelector('.slide:not([hidden]):not(.leave)');
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var my = ++seq;

    /* klik balik cepat: target justru sedang meluncur keluar (s1 -> s2 lalu
       langsung s1 lagi). Batalkan leave-nya agar tak tersembunyi oleh timer
       animasi keluar yang lama (bug: semua section jadi hidden / layar kosong) */
    if (leaving && leaving.id === id) {
      cancelLeave();
      if (cur && cur.id !== id) cur.setAttribute('hidden', '');
      reveal();
      return;
    }

    /* section lama meluncur keluar dulu, baru section baru muncul */
    if (cur && cur.id !== id && !reduce) {
      finishLeave(); /* jika ada perpindahan sebelumnya yang belum selesai */
      leaving = cur;
      cur.classList.add('leave');
      leaveDone = function (e) {
        if (e.target === cur) done(); /* abaikan animationend dari kartu di dalamnya */
      };
      cur.addEventListener('animationend', leaveDone);
      leaveTimer = setTimeout(done, 320); /* cadangan bila animationend tak terpicu */
      function done() {
        clearTimeout(leaveTimer);
        cur.removeEventListener('animationend', leaveDone);
        leaveDone = null;
        /* rapikan animasi keluar milik section ini walau sudah digantikan */
        if (leaving === cur) finishLeave();
        if (my !== seq) return; /* sudah digantikan klik berikutnya */
        reveal();
      }
    } else {
      if (cur && cur.id !== id) { cancelLeave(); cur.setAttribute('hidden', ''); }
      reveal();
    }

    function reveal() {
      if (my !== seq) return; /* klik lebih baru sudah menang */
      var target = document.getElementById(id);
      if (target) target.removeAttribute('hidden');
      /* gulir ke atas, baik di halaman biasa maupun di dalam layar HP */
      window.scrollTo(0, 0);
      var m = document.querySelector('.screen main');
      if (m) m.scrollTop = 0;
      /* lebar elemen terbaca 0 selama section hidden (display:none), sehingga
         fit angka pill/ring (#sin #sout #stav #cV #mV) tidak menyusutkan font.
         Render ulang setelah s1 terlihat agar pengukuran selalu akurat —
         render pertama saat s1 masih hidden tidak merusak lagi. */
      if (id === 's1' && K.render) requestAnimationFrame(K.render);
    }
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
