/* =====================================================================
   storage.js — baca/tulis data
   1. Lokal  : localStorage, kunci "keuangan" (default)
   2. Online : hanya jika window.claude.use('db') tersedia (lingkungan Claude)
   ===================================================================== */
window.Keu = window.Keu || {};
(function (K) {
  'use strict';
  var S = K.s;

  /* transaksi yang sudah ditampilkan tapi belum dikonfirmasi server */
  var pend = {};

  function lsGet() {
    try {
      var d = JSON.parse(localStorage.getItem('keuangan') || '{}');
      S.txs = d.txs || [];
      S.budgets = d.budgets || {};
    } catch (e) { /* data rusak / kosong: mulai dari nol */ }
  }

  function lsSet() {
    try {
      localStorage.setItem('keuangan', JSON.stringify({ txs: S.txs, budgets: S.budgets }));
    } catch (e) { /* storage penuh atau diblokir */ }
  }

  /* pesan merah sementara di bawah halaman (elemen #mode).
     #mode mungkin tak ada di markup: jangan crash, cukup catat di console */
  function warn(m) {
    var e = K.$('mode');
    if (!e) { console.warn('[Catatan Keuangan] ' + m); return; }
    e.textContent = m;
    e.style.color = 'var(--out)';
    setTimeout(function () {
      e.style.color = '';
      K.render();
    }, 4500);
  }

  function saveTx(t) {
    S.txs.push(t);
    K.render();
    if (S.ref) {
      pend[t.id] = t;
      S.ref.doc('tx_' + t.id).set(t).catch(function (e) {
        console.error(e);
        delete pend[t.id];
        S.txs = S.txs.filter(function (x) { return x.id !== t.id; });
        K.render();
        warn('Gagal menyimpan ke penyimpanan online. Coba lagi.');
      });
    } else {
      lsSet();
    }
  }

  function delTx(id) {
    var old = S.txs.filter(function (t) { return t.id === id; })[0];
    S.txs = S.txs.filter(function (t) { return t.id !== id; });
    delete pend[id];
    K.render();
    if (S.ref) {
      S.ref.doc('tx_' + id).delete().catch(function (e) {
        console.error(e);
        if (old) { S.txs.push(old); K.render(); }
        warn('Gagal menghapus. Coba lagi.');
      });
    } else {
      lsSet();
    }
  }

  function saveBud() {
    if (S.ref) {
      S.ref.doc('budgets').set({ map: S.budgets }).catch(function (e) { console.error(e); });
    } else {
      lsSet();
    }
  }

  /* sambung ke penyimpanan online bila tersedia; gagal = tetap mode lokal */
  async function connectCloud() {
    try {
      if (!window.claude || !claude.use) throw 0;
      var db = await claude.use('db'), u = await claude.use('user');
      var id = u ? await u.id() : null;
      if (!db || !id) throw 0;
      S.ref = db.collection('data/users/' + id);
      S.mode = 'cloud';
      S.ref.onSnapshot(function (s) {
        var l = [];
        s.docs.forEach(function (d) {
          var v = d.data() || {};
          if (d.id === 'budgets') { S.budgets = v.map || {}; }
          else if (d.id.indexOf('tx_') === 0) { l.push(v); }
        });
        l.forEach(function (t) { delete pend[t.id]; });
        Object.keys(pend).forEach(function (k) { l.push(pend[k]); });
        S.txs = l;
        K.render();
      }, function () {
        S.mode = 'local';
        S.ref = null;
        K.render();
      });
    } catch (e) {
      S.mode = 'local';
    }
  }

  K.lsGet = lsGet;
  K.saveTx = saveTx;
  K.delTx = delTx;
  K.saveBud = saveBud;
  K.warn = warn;
  K.connectCloud = connectCloud;
})(window.Keu);
