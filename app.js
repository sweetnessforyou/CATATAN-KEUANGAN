/* =====================================================================
   app.js — orkestrasi: render global, navigasi bulan, start aplikasi
   Dimuat PALING AKHIR (setelah semua modul terdaftar).
   ===================================================================== */
window.Keu = window.Keu || {};
(function (K) {
  'use strict';
  var S = K.s;

  /* label periode di header (khusus tampilan mingguan) */
  var PER_LABEL = { '1mgg': '1 minggu', '2mgg': '2 minggu', '3mgg': '3 minggu' };

  /* tulis angka pill + kecilkan font sampai muat agar tak terpotong
     (pola sama dengan #cV di summary.js).
     Nilai ekstrem (≥ juta) yang tetap tak muat di font minimum
     diformat ringkas: Rp1,2 jt / Rp3,4 M / Rp5,6 T */
  function fitPill(el, val, v) {
    el.dataset.v = v;
    el.style.fontSize = '';
    el.textContent = val;
    var fs = 18;
    while (fs > 9 && el.scrollWidth > el.clientWidth) {
      fs--;
      el.style.fontSize = fs + 'px';
    }
    if (el.scrollWidth > el.clientWidth) {
      var v = Number(el.dataset.v || 0);
      var sat = v >= 1e12 ? ['T', 1e12] : v >= 1e9 ? ['M', 1e9] : ['jt', 1e6];
      /* angka ringkas pakai pemisah ribuan + separasi desimal koma */
      var p = (v / sat[1]).toFixed(1).split('.');
      var main = p[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      var des = p[1] === '0' ? '' : ',' + p[1];
      el.textContent = 'Rp' + main + des + ' ' + sat[0];
    }
  }

  /* gambar ulang seluruh tampilan dari state */
  function render() {
    /* segarkan tanggal hari ini: periode mingguan/tahun & rentang ringkasan
       selalu dihitung dari hari yang benar, bukan tanggal saat aplikasi dibuka */
    K.ds = K.fmt(new Date());
    K.$('ml').textContent = S.per === 'bulan' ? K.mlabel(S.month)
      : S.per === 'tahun' ? 'Tahun ' + K.ds.slice(0, 4)
      : PER_LABEL[S.per] + ' terakhir';
    K.$('pv').classList.toggle('off', S.per !== 'bulan');
    K.$('nx').classList.toggle('off', S.per !== 'bulan');

    /* saldo periode aktif */
    var inn = 0, out = 0;
    S.txs.forEach(function (t) {
      if (!K.inRange(t.date)) return;
      if (t.type === 'in') inn += t.amount;
      else out += t.amount;
    });
    K.$('bal').textContent = K.rp(inn - out);
    fitPill(K.$('sin'), K.rp(inn), inn);
    fitPill(K.$('sout'), K.rp(out), out);
    var sav = K.savings();
    fitPill(K.$('stav'), K.rp(sav), sav);
    K.$('stav').classList.toggle('neg', sav < 0);

    K.renderSummary();
    K.renderBudget();
    K.renderHistory();

    /* indikator mode penyimpanan */
    K.$('st').classList.toggle('on', S.mode === 'cloud');
  }
  K.render = render;

  /* pindah bulan; hanya berlaku saat periode = "bulan" */
  function shift(d) {
    if (S.per !== 'bulan') return;
    var p = S.month.split('-');
    var t = new Date(+p[0], +p[1] - 1 + d, 1);
    S.month = t.getFullYear() + '-' + K.pad(t.getMonth() + 1);
    S.sel = null;
    render();
  }
  K.$('pv').onclick = function () { shift(-1); };
  K.$('nx').onclick = function () { shift(1); };

  async function init() {
    K.lsGet();       // tampilkan data lokal dulu (offline-first)
    render();
    /* font web (Nunito) bisa selesai termuat setelah pengukuran pertama:
       render ulang agar lebar angka pill/ring diukur dengan metrik final */
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { render(); });
    await K.connectCloud();   // lalu coba sinkron online (jika ada)
    render();
    /* realtime: bila hari berganti (tengah malam) atau tab kembali dilihat,
       segarkan ringkasan agar rentang mingguan selalu mengikuti riwayat */
    setInterval(function () { if (K.fmt(new Date()) !== K.ds) render(); }, 30000);
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden) render();
    });
  }
  init();
})(window.Keu);
