/* =====================================================================
   state.js — SATU objek state untuk seluruh aplikasi (K.s).
   Kalau butuh data baru, tambahkan field di sini, bukan variabel global.
   ===================================================================== */
window.Keu = window.Keu || {};
(function (K) {
  'use strict';

  K.s = {
    txs: [],                 // daftar transaksi {id,type,amount,cat,note,date}
    budgets: {},             // anggaran per kategori pengeluaran
    ref: null,               // referensi cloud (null = mode lokal)
    mode: 'local',           // 'local' | 'cloud'
    seen: null,              // id yang sudah pernah tampil (animasi "new")
    month: K.ds.slice(0, 7),  // periode bulan aktif "YYYY-MM"
    per: 'bulan',            // '1mgg' | '2mgg' | '3mgg' | 'bulan' | 'tahun'
    stab: 'out',             // tab ringkasan: 'out' | 'in'
    fcat: K.OUT[0],          // kategori terpilih di form pengeluaran
    fcati: K.IN[0],          // kategori terpilih di form pemasukan
    sel: null,               // kategori terpilih (klik ring/daftar)
    hov: null,               // kategori yang sedang di-hover
    items: [],               // agregat kategori periode aktif
    total: 0,
    cnt: 0
  };

  var S = K.s;

  /* uang bulanan = pemasukan bersumber uang bulanan (transaksi lama tanpa
     src dianggap 'monthly'), dikurangi pengeluaran yang dibayar darinya.
     Selalu dihitung dari bulan berjalan saja, jadi otomatis reset
     setiap awal bulan. Dipakai ring "Uang bulanan" di kartu ringkasan. */
  K.monthly = function () {
    var cur = K.ds.slice(0, 7), inp = 0, out = 0;
    S.txs.forEach(function (t) {
      if ((t.date || '').slice(0, 7) !== cur) return;
      if (t.type === 'in') { if ((t.src || 'monthly') === 'monthly') inp += t.amount; }
      else if (t.cat !== 'Tabungan' && (t.src || 'income') === 'income') out += t.amount;
    });
    return { inp: inp, out: out };
  };

  /* saldo tabungan = setoran (kategori "Tabungan") dikurangi pengeluaran
     yang sumbernya uang tabungan. Dihitung dari SELURUH transaksi
     (bukan per periode) karena ini saldo, bukan arus kas. */
  K.savings = function () {
    var v = 0;
    S.txs.forEach(function (t) {
      if (t.type !== 'out') return;
      if (t.cat === 'Tabungan') v += t.amount;
      if (t.src === 'savings') v -= t.amount;
    });
    return v;
  };

  /* apakah tanggal (YYYY-MM-DD) masuk periode yang sedang dilihat */
  K.inRange = function (d) {
    d = d || '';
    if (S.per === 'bulan') return d.slice(0, 7) === S.month;
    if (S.per === 'tahun') return d.slice(0, 4) === K.ds.slice(0, 4);
    var f = new Date();
    f.setDate(f.getDate() - (S.per === '1mgg' ? 6 : S.per === '2mgg' ? 13 : 20));
    return d >= K.fmt(f) && d <= K.ds;
  };
})(window.Keu);
