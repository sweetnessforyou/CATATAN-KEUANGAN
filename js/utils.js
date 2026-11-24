/* =====================================================================
   utils.js — helper kecil: DOM, format Rupiah/tanggal, segmented control
   ===================================================================== */
window.Keu = window.Keu || {};
(function (K) {
  'use strict';

  /* ambil elemen berdasarkan id */
  K.$ = function (id) { return document.getElementById(id); };

  /* 1234567 -> "Rp1.234.567" */
  K.rp = function (n) { return (n < 0 ? '-' : '') + 'Rp' + Math.round(Math.abs(n)).toLocaleString('id-ID'); };

  K.pad = function (n) { return String(n).padStart(2, '0'); };

  /* Date -> "YYYY-MM-DD" */
  K.fmt = function (d) { return d.getFullYear() + '-' + K.pad(d.getMonth() + 1) + '-' + K.pad(d.getDate()); };

  /* tanggal hari ini, format YYYY-MM-DD (dipakai sebagai default form) */
  K.ds = K.fmt(new Date());

  /* "2026-11" -> "November 2026" */
  K.mlabel = function (m) {
    return new Date(+m.slice(0, 4), +m.slice(5, 7) - 1, 1)
      .toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  };

  /* tandai satu tombol segmented control aktif (--i menggeser knob) */
  K.setSeg = function (id, v) {
    var s = K.$(id);
    [].forEach.call(s.children, function (b, i) {
      var on = b.dataset.v === v;
      b.classList.toggle('on', on);
      if (on) s.style.setProperty('--i', i);
    });
  };

  /* pasang handler klik untuk semua tombol dalam satu segmented control */
  K.wire = function (id, fn) {
    [].forEach.call(K.$(id).children, function (b) {
      b.onclick = function () {
        fn(b.dataset.v);
        K.setSeg(id, b.dataset.v);
      };
    });
  };
})(window.Keu);
