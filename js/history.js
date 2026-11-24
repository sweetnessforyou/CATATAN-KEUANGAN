/* =====================================================================
   history.js — kartu "Riwayat" (struk)
   Menampilkan maksimal 50 transaksi terbaru sesuai periode + filter kategori.
   ===================================================================== */
window.Keu = window.Keu || {};
(function (K) {
  'use strict';
  var S = K.s;

  K.renderHistory = function () {
    var l = S.txs.filter(function (t) {
      return K.inRange(t.date) && (!S.sel || (t.type === S.stab && t.cat === S.sel));
    }).sort(function (a, b) {
      return a.date < b.date ? 1 : a.date > b.date ? -1 : b.id > a.id ? 1 : -1;
    });

    /* tombol "hapus filter" */
    var fl = K.$('flt');
    fl.hidden = !S.sel;
    if (S.sel) {
      fl.textContent = S.sel + ' ';
      fl.insertAdjacentHTML('beforeend', '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>');
      fl.onclick = function () { S.sel = null; K.render(); };
    }

    var ls = K.$('list');
    ls.innerHTML = '';
    if (!l.length) ls.innerHTML = '<div class="empty">Belum ada transaksi.</div>';

    /* transaksi yang belum pernah tampil diberi animasi masuk */
    var first = S.seen === null;
    if (first) S.seen = {};

    l.slice(0, 50).forEach(function (t, i) {
      var nw = !S.seen[t.id];
      S.seen[t.id] = 1;

      var r = document.createElement('div');
      r.className = 'h' + (nw ? ' new' : '');
      if (nw && first) r.style.animationDelay = Math.min(i * 30, 150) + 'ms';
      r.innerHTML = '<span class="ic"></span>'
        + '<span class="mid"><span class="nm"></span><span class="sb"></span></span>'
        + '<span class="am"></span>'
        + '<button class="x" aria-label="Hapus transaksi"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button>';

      var ic = r.querySelector('.ic');
      ic.style.setProperty('--c', K.COL[t.cat] || K.COL.Lainnya);
      ic.innerHTML = K.svg(t.cat, 18);

      var nm = r.querySelector('.nm');
      nm.textContent = t.note || t.cat;
      nm.title = t.note || t.cat; /* teks penuh saat di-tap/lhover */
      var sb = r.querySelector('.sb');
      sb.textContent = (t.note ? t.cat + ', ' : '')
        + new Date(t.date + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
      /* tandai sumber: pengeluaran dari tabungan, pemasukan dari bonus */
      var tagTxt = t.type === 'out' && t.src === 'savings' ? 'tabungan'
        : t.type === 'in' && t.src === 'bonus' ? 'bonus' : null;
      if (tagTxt) {
        var tag = document.createElement('span');
        tag.className = 'tg' + (tagTxt === 'bonus' ? ' b' : '');
        tag.textContent = tagTxt;
        sb.appendChild(tag);
      }

      var a = r.querySelector('.am');
      a.className = 'am ' + t.type;
      a.textContent = (t.type === 'in' ? '+' : '-') + K.rp(t.amount);

      r.querySelector('.x').onclick = function () {
        r.classList.add('gone');
        setTimeout(function () { K.delTx(t.id); }, 160);
      };
      ls.appendChild(r);
    });

    if (l.length > 50) {
      var m = document.createElement('div');
      m.className = 'empty';
      m.textContent = 'Menampilkan 50 transaksi terbaru dari ' + l.length;
      ls.appendChild(m);
    }
  };
})(window.Keu);
