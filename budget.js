/* =====================================================================
   budget.js — kartu "Rincian pengeluaran"
   Baris dibuat sekali saat load, lalu diperbarui di tempat oleh renderBudget().
   ===================================================================== */
window.Keu = window.Keu || {};
(function (K) {
  'use strict';
  var S = K.s;
  var B = {};   // elemen per kategori: { sb, tr, f }

  /* kategori tanpa Tabungan (bagian tabungan dihapus dari rincian) */
  var LIST = K.OUT.filter(function (c) { return c !== 'Tabungan'; });

  LIST.forEach(function (c) {
    var r = document.createElement('div');
    r.className = 'row';
    r.style.setProperty('--c', K.COL[c]);

    var t = document.createElement('div');
    t.className = 'bt';
    t.innerHTML = '<span class="ic">' + K.svg(c, 17) + '</span>'
      + '<span class="mid"><span class="nm"></span><span class="sb"></span></span>'
      + '<span class="amt"></span>';
    t.querySelector('.nm').textContent = c;

    r.appendChild(t);

    var tr = document.createElement('div');
    tr.className = 'track';
    var f = document.createElement('div');
    tr.appendChild(f);
    r.appendChild(tr);

    K.$('buds').appendChild(r);
    B[c] = { sb: t.querySelector('.sb'), tr: tr, f: f, amt: t.querySelector('.amt') };
  });

  /* rincian pengeluaran 1 bulan ke belakang (30 hari terakhir) per kategori */
  K.renderBudget = function () {
    var by = {}, ts = 0;
    /* mundur 1 bulan kalender dengan aman: tanggal berlebih dikunci ke
       hari terakhir bulan sebelumnya (31 Mar -> 28/29 Feb, bukan 3 Mar) */
    var mulai = new Date();
    var hari = mulai.getDate();
    mulai.setDate(1);
    mulai.setMonth(mulai.getMonth() - 1);
    var akhir = new Date(mulai.getFullYear(), mulai.getMonth() + 1, 0).getDate();
    mulai.setDate(Math.min(hari, akhir));
    mulai.setHours(0, 0, 0, 0);
    var lo = K.fmt(mulai), hi = K.ds;

    S.txs.forEach(function (t) {
      if (t.type !== 'out') return;
      var d = t.date || '';
      if (d < lo || d > hi) return;
      by[t.cat] = (by[t.cat] || 0) + t.amount;
      ts += t.amount;
    });

    LIST.forEach(function (c) {
      var s = by[c] || 0, r = B[c];
      r.amt.textContent = K.rp(s);
      r.sb.textContent = s ? Math.round(s / ts * 100) + '% dari total' : 'Belum ada pengeluaran';
      r.tr.className = 'track';
      r.f.style.width = (ts ? Math.min(100, s / ts * 100) : 0) + '%';
    });

    K.$('bsub').textContent = '1 bulan terakhir, total ' + K.rp(ts);
  };
})(window.Keu);
